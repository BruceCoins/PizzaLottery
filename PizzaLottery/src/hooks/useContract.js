import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { PRIZE_CONTRACT_ABI } from "../constants/contractABI";
import { CONTRACT_ADDRESS, CONTRACT_METHODS } from "../constants/contractConfig";
import { formatEth } from "../utils/format";
import { listenWinEvent, listenLostEvent, removeAllListeners } from "../utils/eventListener";

export const useContract = () => {
  const { 
    isConnected, 
    signer, 
    isTargetNetwork, 
    loading: walletLoading, 
    error: walletError,
    connectWallet,
    switchToTargetNetwork,
    walletAddress
  } = useWallet();

  // 合约相关状态
  const [contract, setContract] = useState(null);
  const [jackpot, setJackpot] = useState("0.0000"); // 奖池金额（格式化后）
  const [firstPrizeMax, setFirstPrizeMax] = useState("0.0000"); // 一等奖最高金额
  const [secondPrizeMax, setSecondPrizeMax] = useState("0.0000"); // 二等奖最高金额
  const [betMinAmount, setBetMinAmount] = useState("0.0000"); // 最小投注金额
  const [betHistory, setBetHistory] = useState([]); // 投注历史（中奖/未中奖记录）
  const [loading, setLoading] = useState(false); // 合约操作加载状态
  const [error, setError] = useState(""); // 合约操作错误信息

  // 初始化合约实例
  useEffect(() => {
    let currentContract = null;
    
    if (isConnected && isTargetNetwork && signer) {
      // 创建合约实例
      currentContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        PRIZE_CONTRACT_ABI,
        signer
      );
      setContract(currentContract);
    } else {
      setContract(null);
    }
    
    // 返回清理函数，在组件卸载或依赖变化时执行
    return () => {
      if (currentContract) {
        removeAllListeners(currentContract);
      }
    };
  }, [isConnected, isTargetNetwork, signer]);

  // 加载合约基础数据（奖池、奖金规则等）
  const loadContractData = useCallback(async () => {
    if (!contract || !signer) return;
    try {
      setLoading(true);
      setError("");

      // 并行调用合约视图方法（提高效率）
      const [jackpotWei, firstPrizeWei, secondPrizeWei, betMinWei] = await Promise.all([
        contract[CONTRACT_METHODS.GET_JACKPOT](),
        contract[CONTRACT_METHODS.GET_FIRST_PRIZE_MAX](),
        contract[CONTRACT_METHODS.GET_SECOND_PRIZE_MAX](),
        contract[CONTRACT_METHODS.GET_BET_MIN]()
      ]);

      // 格式化数据（wei转ETH）并更新状态
      setJackpot(formatEth(jackpotWei));
      setFirstPrizeMax(formatEth(firstPrizeWei));
      setSecondPrizeMax(formatEth(secondPrizeWei));
      setBetMinAmount(formatEth(betMinWei));

    } catch (err) {
      setError(`数据加载失败：${err.message.slice(0, 100)}`);
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // 监听合约事件（中奖/未中奖），更新历史记录
  useEffect(() => {
    if (!contract || !walletAddress) return;

    // 监听中奖事件
    listenWinEvent(contract, (winData) => {
      // 只保留当前用户的记录（或全部记录，根据需求调整）
      if (winData.user.toLowerCase() === walletAddress.toLowerCase()) {
        setBetHistory(prev => [winData, ...prev].slice(0, 10)); // 只保留最近10条 
        //添加延迟和条件判断，避免频繁刷新  
        setTimeout(() => {
          loadContractData(); // 中奖后刷新奖池数据
        }, 100);
      }
    });

    // 监听未中奖事件
    listenLostEvent(contract, (lostData) => {
      if (lostData.user.toLowerCase() === walletAddress.toLowerCase()) {
        setBetHistory(prev => [lostData, ...prev].slice(0, 10));
      }
    });

    // 组件卸载时移除监听
    return () => {
      removeAllListeners(contract);
    };
  }, [contract, walletAddress]); //, loadContractData

  // 页面初始化/网络切换时加载数据
  useEffect(() => {
    if (contract && isTargetNetwork) {
      loadContractData();
    }
  }, [contract, isTargetNetwork]);  //, loadContractData

  // 投注功能（核心交互）
  const placeBet = useCallback(async (betNumber) => {
    if (!contract || !isTargetNetwork || walletLoading) return null;
    try {
      setLoading(true);
      setError("");

      // 1. 验证投注数字（1-9999）
      const num = Number(betNumber);
      if (isNaN(num) || num < 1 || num > 9999) {
        throw new Error("请输入1-9999之间的4位数字");
      }

      // 2. 计算投注金额（从合约获取的最小投注金额，转为wei）
      const betMinWei = await contract[CONTRACT_METHODS.GET_BET_MIN]();
      const txOptions = { value: betMinWei };

      // 3. 发送投注交易
      const tx = await contract[CONTRACT_METHODS.PLACE_BET](num, txOptions);
      console.log("投注交易已发送，哈希：", tx.hash);

      // 4. 等待交易上链确认（1个区块确认）
      const receipt = await tx.wait(1);
      console.log("交易确认成功，区块号：", receipt.blockNumber);

      // 5. 交易成功后刷新数据
      loadContractData();
      return { success: true, txHash: tx.hash };

    } catch (err) {
      const errMsg = err.reason || err.message.slice(0, 100);
      setError(`投注失败：${errMsg}`);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, [contract, isTargetNetwork, walletLoading]); //, loadContractData

  // 格式化地址（复用工具函数逻辑，对外暴露）
  const formatAddress = (address) => {
    if (!address || !ethers.utils.isAddress(address)) return "Invalid Address";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    // 钱包相关状态与方法
    isConnected,
    walletAddress,
    formatAddress,
    connectWallet,
    switchToTargetNetwork,
    isTargetNetwork,
    // 合约相关状态
    contract,
    jackpot,
    firstPrizeMax,
    secondPrizeMax,
    betMinAmount,
    betHistory,
    // 操作状态
    loading: loading || walletLoading,
    error: error || walletError,
    // 合约方法
    loadContractData,
    placeBet
  };
};
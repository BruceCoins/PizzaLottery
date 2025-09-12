import { useState, useEffect, useCallback, useRef } from "react";
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
  const [jackpot, setJackpot] = useState("0.0000"); 
  const [firstPrizeMax, setFirstPrizeMax] = useState("0.0000"); 
  const [secondPrizeMax, setSecondPrizeMax] = useState("0.0000"); 
  const [betMinAmount, setBetMinAmount] = useState("0.0000"); 
  const [betHistory, setBetHistory] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(""); 

  // 数据缓存（用useRef持久化存储，组件生命周期内有效）
  const blockCache = useRef(new Map()); // 区块数据缓存: Map<blockNumber, blockData>
  const historyCache = useRef(new Map()); // 历史记录缓存: Map<walletAddress, historyData>
  const contractDataCache = useRef(null); // 合约基础数据缓存（奖池等）

  // 初始化合约实例
  useEffect(() => {
    let currentContract = null;
    
    if (isConnected && isTargetNetwork && signer) {
      try {
        if (!ethers.utils.isAddress(CONTRACT_ADDRESS)) {
          throw new Error("无效的合约地址");
        }
        currentContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          PRIZE_CONTRACT_ABI,
          signer
        );
        setContract(currentContract);
      } catch (err) {
        setError(`合约初始化失败：${err.message.slice(0, 100)}`);
        setContract(null);
      }
    } else {
      setContract(null);
    }
    
    // 组件卸载时清理缓存和事件监听
    return () => {
      if (currentContract) {
        removeAllListeners(currentContract);
      }
      blockCache.current.clear();
    };
  }, [isConnected, isTargetNetwork, signer]);

  // 加载合约基础数据（奖池、奖金规则等）- 增加缓存
  const loadContractData = useCallback(async () => {
    if (!contract || !signer) return;
    try {
      // 先查缓存，存在则直接使用（缓存有效期5分钟）
      const now = Date.now();
      if (contractDataCache.current && (now - contractDataCache.current.timestamp < 300000)) {
        const { jackpot, firstPrizeMax, secondPrizeMax, betMinAmount } = contractDataCache.current;
        setJackpot(jackpot);
        setFirstPrizeMax(firstPrizeMax);
        setSecondPrizeMax(secondPrizeMax);
        setBetMinAmount(betMinAmount);
        return; // 命中缓存，直接返回
      }

      // 缓存未命中，执行网络请求
      setLoading(true);
      setError("");

      const [jackpotWei, firstPrizeWei, secondPrizeWei, betMinWei] = await Promise.all([
        contract[CONTRACT_METHODS.GET_JACKPOT](),
        contract[CONTRACT_METHODS.GET_FIRST_PRIZE_MAX](),
        contract[CONTRACT_METHODS.GET_SECOND_PRIZE_MAX](),
        contract[CONTRACT_METHODS.GET_BET_MIN]()
      ]);

      // 格式化并更新状态
      const formattedJackpot = formatEth(jackpotWei);
      const formattedFirst = formatEth(firstPrizeWei);
      const formattedSecond = formatEth(secondPrizeWei);
      const formattedMin = formatEth(betMinWei);

      setJackpot(formattedJackpot);
      setFirstPrizeMax(formattedFirst);
      setSecondPrizeMax(formattedSecond);
      setBetMinAmount(formattedMin);

      // 写入缓存（带时间戳）
      contractDataCache.current = {
        timestamp: now,
        jackpot: formattedJackpot,
        firstPrizeMax: formattedFirst,
        secondPrizeMax: formattedSecond,
        betMinAmount: formattedMin
      };

    } catch (err) {
      setError(`数据加载失败：${err.message.slice(0, 100)}`);
    } finally {
      setLoading(false);
    }
  }, [contract, signer]);

  // 优化的区块数据获取方法（带缓存）
  const getBlockWithCache = useCallback(async (blockNumber) => {
    if (!contract) return null;
    
    // 先查缓存
    if (blockCache.current.has(blockNumber)) {
      return blockCache.current.get(blockNumber);
    }
    
    // 缓存未命中，请求并写入缓存
    const block = await contract.provider.getBlock(blockNumber);
    blockCache.current.set(blockNumber, block);
    return block;
  }, [contract]);

  // 核心：主动查询历史投注事件（带缓存优化）
  const fetchBetHistory = useCallback(async () => {
    if (!contract || !walletAddress || !isTargetNetwork) return;
    try {
      setLoading(true);
      setError("");

      // 先查缓存（按用户地址缓存，有效期10分钟）
      const now = Date.now();
      const cachedHistory = historyCache.current.get(walletAddress);
      if (cachedHistory && (now - cachedHistory.timestamp < 600000)) {
        setBetHistory(cachedHistory.data);
        return; // 命中缓存，直接返回
      }

      // 缓存未命中，执行查询
      const deploymentTx = await contract.provider.getTransaction(
        "0xb3b710881945f7c7a5142ad91d12a6e4dc08ca7ea1f7a6eb7bb1524f898111d4" 
      );
      const startBlock = deploymentTx ? deploymentTx.blockNumber : 0;
      const endBlock = "latest";

      const winFilter = contract.filters.YouWin(walletAddress);
      const lostFilter = contract.filters.YouLost(walletAddress);

      const [winEvents, lostEvents] = await Promise.all([
        contract.queryFilter(winFilter, startBlock, endBlock),
        contract.queryFilter(lostFilter, startBlock, endBlock)
      ]);

      // 格式化事件数据（使用带缓存的区块获取方法）
      const formattedHistory = [];

      // 处理中奖事件（并行处理区块请求）
      const winPromises = winEvents.map(async (event) => {
        const block = await getBlockWithCache(event.blockNumber);
        return {
          id: `${event.transactionHash}-win`,
          type: "win",
          user: event.args.user,
          betNumber: (event.args.betNumber?.toString() || '0').padStart(4, "0"),
          lotNumber: event.args.lotNumber.toString().padStart(4, "0"),
          level: event.args.level.toString(),
          amount: event.args.amount.toString(),
          txHash: event.transactionHash,
          time: new Date(block.timestamp * 1000).toLocaleString()
        };
      });

      // 处理未中奖事件（并行处理区块请求）
      const lostPromises = lostEvents.map(async (event) => {
        const block = await getBlockWithCache(event.blockNumber);
        return {
          id: `${event.transactionHash}-lost`,
          type: "lost",
          user: event.args.user,
          betNumber: (event.args.betNumber?.toString() || '0').padStart(4, "0"),
          lotNumber: event.args.lotNumber.toString().padStart(4, "0"),
          level: "0",
          amount: "0",
          txHash: event.transactionHash,
          time: new Date(block.timestamp * 1000).toLocaleString()
        };
      });

      // 合并所有格式化结果
      const allRecords = await Promise.all([...winPromises, ...lostPromises]);
      
      // 排序并去重
      const uniqueRecords = Array.from(
        new Map(allRecords.map(item => [item.id, item])).values()
      );
      uniqueRecords.sort((a, b) => new Date(b.time) - new Date(a.time));

      // 写入缓存和状态
      historyCache.current.set(walletAddress, {
        timestamp: now,
        data: uniqueRecords
      });
      setBetHistory(uniqueRecords);

    } catch (err) {
      setError(`加载历史记录失败：${err.message.slice(0, 100)}`);
      console.error("历史事件查询错误：", err);
    } finally {
      setLoading(false);
    }
  }, [contract, walletAddress, isTargetNetwork, getBlockWithCache]);

  // 监听新事件（实时更新新投注记录）
  useEffect(() => {
    if (!contract || !walletAddress || !isTargetNetwork) return;

    const isDuplicate = (newItem) => {
      return betHistory.some(item => item.id === newItem.id);
    };

    // 监听新中奖事件（使用缓存获取区块）
    listenWinEvent(contract, async (eventArgs) => {
      if (eventArgs.user.toLowerCase() !== walletAddress.toLowerCase()) return;
      
      const block = await getBlockWithCache(eventArgs.blockNumber);
      const newWinRecord = {
        id: `${eventArgs.transactionHash}-win`,
        type: "win",
        user: eventArgs.user,
        betNumber: (eventArgs.betNumber?.toString() || '0').padStart(4, "0"),
        lotNumber: eventArgs.lotNumber.toString().padStart(4, "0"),
        level: eventArgs.level.toString(),
        amount: eventArgs.amount.toString(),
        txHash: eventArgs.transactionHash,
        time: new Date(block.timestamp * 1000).toLocaleString()
      };

      if (!isDuplicate(newWinRecord)) {
        // 更新缓存和状态
        const currentHistory = historyCache.current.get(walletAddress)?.data || [];
        historyCache.current.set(walletAddress, {
          timestamp: Date.now(),
          data: [newWinRecord, ...currentHistory]
        });
        setBetHistory(prev => [newWinRecord, ...prev]);
        setTimeout(() => loadContractData(), 500);
      }
    });

    // 监听新未中奖事件（使用缓存获取区块）
    listenLostEvent(contract, async (eventArgs) => {
      if (eventArgs.user.toLowerCase() !== walletAddress.toLowerCase()) return;
      
      const block = await getBlockWithCache(eventArgs.blockNumber);
      const newLostRecord = {
        id: `${eventArgs.transactionHash}-lost`,
        type: "lost",
        user: eventArgs.user,
        betNumber: (eventArgs.betNumber?.toString() || '0').padStart(4, "0"),
        lotNumber: eventArgs.lotNumber.toString().padStart(4, "0"),
        level: "0",
        amount: "0",
        txHash: eventArgs.transactionHash,
        time: new Date(block.timestamp * 1000).toLocaleString()
      };

      if (!isDuplicate(newLostRecord)) {
        // 更新缓存和状态
        const currentHistory = historyCache.current.get(walletAddress)?.data || [];
        historyCache.current.set(walletAddress, {
          timestamp: Date.now(),
          data: [newLostRecord, ...currentHistory]
        });
        setBetHistory(prev => [newLostRecord, ...prev]);
      }
    });

    return () => {
      removeAllListeners(contract);
    };
  }, [contract, walletAddress, isTargetNetwork, betHistory, loadContractData, getBlockWithCache]);

  // 初始化加载：连接成功后加载基础数据 + 历史记录
  useEffect(() => {
    if (contract && isTargetNetwork && isConnected) {
      const timer = setTimeout(() => {
        Promise.all([
          loadContractData(),
          fetchBetHistory()
        ]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [contract, isTargetNetwork, isConnected, loadContractData, fetchBetHistory]);

  // 投注功能
  const placeBet = useCallback(async (betNumber) => {
    if (!contract || !isTargetNetwork || walletLoading) return null;
    try {
      setLoading(true);
      setError("");

      const num = Number(betNumber);
      if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 9999) {
        throw new Error("请输入1-9999之间的整数");
      }

      const betMinWei = await contract[CONTRACT_METHODS.GET_BET_MIN]();
      if (betMinWei.isZero()) {
        throw new Error("无效的最小投注金额");
      }

      const txOptions = {
        value: betMinWei,
        gasLimit: ethers.utils.hexlify(500000)
      };
      const tx = await contract[CONTRACT_METHODS.PLACE_BET](num, txOptions);
      console.log("投注交易已发送，哈希：", tx.hash);

      const receipt = await Promise.race([
        tx.wait(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error("交易确认超时")), 60000))
      ]);

      if (receipt.status !== 1) {
        throw new Error("交易失败，已回滚");
      }

      // 交易成功后主动失效缓存并刷新
      contractDataCache.current = null; // 失效合约数据缓存
      historyCache.current.delete(walletAddress); // 失效历史记录缓存
      await loadContractData();
      await fetchBetHistory();
      return { success: true, txHash: tx.hash };

    } catch (err) {
      const errMsg = err.reason || err.message.slice(0, 100);
      setError(`投注失败：${errMsg}`);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  }, [contract, isTargetNetwork, walletLoading, loadContractData, fetchBetHistory]);

  // 格式化地址
  const formatAddress = (address) => {
    if (!address) return "";
    if (!ethers.utils.isAddress(address)) return "无效地址";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    isConnected,
    walletAddress,
    formatAddress,
    connectWallet,
    switchToTargetNetwork,
    isTargetNetwork,
    contract,
    jackpot,
    firstPrizeMax,
    secondPrizeMax,
    betMinAmount,
    betHistory,
    loading: loading || walletLoading,
    error: error || walletError,
    loadContractData,
    placeBet
  };
};
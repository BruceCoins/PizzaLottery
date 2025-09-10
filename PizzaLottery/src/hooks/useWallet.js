import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { TARGET_NETWORK } from "../constants/networkConfig";

export const useWallet = () => {
  // 状态管理：钱包连接状态、地址、Provider、网络状态
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [currentChainId, setCurrentChainId] = useState("");
  const [isTargetNetwork, setIsTargetNetwork] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 检查是否安装MetaMask
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask;
  }, []);

  // 检测当前网络是否为目标网络（Sepolia）
  const checkTargetNetwork = useCallback((chainId) => {
    const isTarget = chainId === TARGET_NETWORK.chainId;
    setIsTargetNetwork(isTarget);
    if (!isTarget) {
      setError(`当前网络不是Sepolia测试网，请切换网络`);
    } else {
      setError("");
    }
    return isTarget;
  }, []);

  // 连接钱包
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // 检查MetaMask是否安装
      if (!isMetaMaskInstalled()) {
        throw new Error("请先安装MetaMask钱包插件");
      }

      // 请求用户授权连接钱包
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      if (!accounts.length) {
        throw new Error("未授权钱包访问");
      }

      // 初始化Provider和Signer
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      const ethSigner = ethProvider.getSigner();
      const chainId = await ethProvider.getNetwork().then(net => net.chainId);
      const hexChainId = ethers.utils.hexlify(chainId);
      try{
        const address = await ethSigner.getAddress();
        setWalletAddress(address);
      }catch(err){
        console.error("Get Address Failed:", err);
        setError("无法获取钱包地址，请检查 MetaMask 是否正常");
        setIsConnected(false);
      }

      // 更新状态
      setProvider(ethProvider);
      setSigner(ethSigner);
      setIsConnected(true);
      setCurrentChainId(hexChainId);
      checkTargetNetwork(hexChainId);

    } catch (err) {
      setError(err.message || "钱包连接失败，请重试");
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [isMetaMaskInstalled, checkTargetNetwork]);

  // 切换到Sepolia测试网
  const switchToTargetNetwork = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!isMetaMaskInstalled()) {
        throw new Error("请先安装MetaMask钱包插件");
      }

      // 尝试切换网络（若钱包已添加Sepolia）
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: TARGET_NETWORK.chainId }]
      });

      // 切换成功后更新网络状态
      const chainId = await provider.getNetwork().then(net => net.chainId);
      const hexChainId = ethers.utils.hexlify(chainId);
      setCurrentChainId(hexChainId);
      checkTargetNetwork(hexChainId);

    } catch (err) {
      // 若钱包未添加Sepolia，自动添加网络
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [TARGET_NETWORK]
        });
        // 添加后重新检查网络
        const chainId = await provider.getNetwork().then(net => net.chainId);
        const hexChainId = ethers.utils.hexlify(chainId);
        setCurrentChainId(hexChainId);
        checkTargetNetwork(hexChainId);
      } else {
        setError(err.message || "网络切换失败，请手动切换到Sepolia测试网");
      }
    } finally {
      setLoading(false);
    }
  }, [isMetaMaskInstalled, provider, checkTargetNetwork]);

  // 监听钱包账户变化
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length) {
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        const ethSigner = ethProvider.getSigner();
        const address = await ethSigner.getAddress();
        setWalletAddress(address);
        setIsConnected(true);
      } else {
        setIsConnected(false);
        setWalletAddress("");
        setSigner(null);
      }
    };

    // 监听网络变化
    const handleChainChanged = async (chainId) => {
      setCurrentChainId(chainId);
      checkTargetNetwork(chainId);
      // 网络变化后重新初始化Provider
      if (isConnected) {
        const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(ethProvider);
        setSigner(ethProvider.getSigner());
      }
    };

    // 注册监听事件
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // 清理监听
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [isConnected, checkTargetNetwork]);

  return {
    isConnected,
    walletAddress,
    provider,
    signer,
    currentChainId,
    isTargetNetwork,
    loading,
    error,
    connectWallet,
    switchToTargetNetwork
  };
};
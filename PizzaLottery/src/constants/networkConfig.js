// 网络配置：Sepolia测试网（固定配置，确保与合约网络一致）
//  "https://sepolia.alchemyapi.io/v2/demo" // 公共Alchemy节点（备用）
export const NETWORK_CONFIG = {
    sepolia: {
      chainId: "0xaa36a7", // Sepolia链ID（16进制），对应十进制11155111
      chainName: "Ethereum Sepolia Testnet",
      rpcUrls: [
        `https://sepolia.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}` // 公共Infura节点（可替换为自己的API Key）
       
      ],
      blockExplorerUrls: ["https://sepolia.etherscan.io"],
      nativeCurrency: {
        name: "Sepolia Ether",
        symbol: "ETH",
        decimals: 18
      }
    }
  };
  
  // 目标网络（合约部署网络）
  export const TARGET_NETWORK = NETWORK_CONFIG.sepolia;
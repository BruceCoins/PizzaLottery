import React from "react";

const WalletConnect = ({ 
  isConnected, 
  walletAddress, 
  formatAddress, 
  connectWallet, 
  loading 
}) => {
  return (
    <div className="wallet-connect-container">
      {!isConnected ? (
        <button 
          className="connect-btn" 
          onClick={connectWallet}
          disabled={loading}
        >
          {loading ? "连接中..." : "连接MetaMask钱包"}
        </button>
      ) : (
        <div className="wallet-info">
          <span className="address">
            已连接：{formatAddress(walletAddress)}
          </span>
          <a 
            href={`https://sepolia.etherscan.io/address/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="explorer-link"
          >
            查看钱包
          </a>
        </div>
      )}

      <style jsx>{`
        .wallet-connect-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .connect-btn {
          background-color: #4F46E5;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .connect-btn:disabled {
          background-color: #94A3B8;
          cursor: not-allowed;
        }

        .wallet-info {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          color: #1E293B;
          font-size: 0.95rem;
        }

        .explorer-link {
          color: #4F46E5;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .explorer-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default WalletConnect;
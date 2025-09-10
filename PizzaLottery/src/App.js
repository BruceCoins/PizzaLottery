import React from "react";
import { useContract } from "./hooks/useContract";
import WalletConnect from "./components/WalletConnect";
import PrizePool from "./components/PrizePool";
import BetForm from "./components/BetForm";
import HistoryList from "./components/HistoryList";

function App() {
  const {
    isConnected,
    walletAddress,
    formatAddress,
    isTargetNetwork,
    loading,
    error,

    // 合约数据
    jackpot,
    firstPrizeMax,
    secondPrizeMax,
    betMinAmount,
    betHistory,

    // 方法
    connectWallet,
    switchToTargetNetwork,
    placeBet
  } = useContract();

  // 处理投注成功回调
  const handleBetSuccess = (txHash) => {
    alert(`投注成功！交易哈希：${txHash.slice(0, 16)}...\n可在Sepolia Etherscan查看详情`);
  };

  return (
    <div className="app-container">
      {/* 顶部导航栏 */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">PizzaLottery（Sepolia）</h1>
          <WalletConnect
            isConnected={isConnected}
            walletAddress={walletAddress}
            formatAddress={formatAddress}
            connectWallet={connectWallet}
            loading={loading}
          />
        </div>
      </header>

      {/* 网络提示条（非目标网络时显示） */}
      {isConnected && !isTargetNetwork && (
        <div className="network-alert">
          ⚠️ 当前网络不是Sepolia测试网，功能无法正常使用！
          <button
            className="switch-network-btn"
            onClick={switchToTargetNetwork}
            disabled={loading}
          >
            {loading ? "切换中..." : "立即切换到Sepolia"}
          </button>
        </div>
      )}

      {/* 全局错误提示 */}
      {error && (
        <div className="global-error">
          ❌ {error}
        </div>
      )}

      {/* 主内容区 */}
      <main className="app-main">
        {!isConnected ? (
          <div className="connect-prompt">
            <h2>欢迎使用 PizzaLottery（Sepolia）</h2>
            <p>请先连接 MetaMask 钱包以参与投注</p>
            <button
              className="prompt-connect-btn"
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? "连接中..." : "连接钱包"}
            </button>
            <p className="faucet-hint">
              缺少 Sepolia ETH？可从 <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer">Sepolia Faucet</a> 获取测试币
            </p>
          </div>
        ) : isTargetNetwork ? (
          <div className="content-wrapper">
            <PrizePool
              jackpot={jackpot}
              firstPrizeMax={firstPrizeMax}
              secondPrizeMax={secondPrizeMax}
              betMinAmount={betMinAmount}
              loading={loading}
            />
            <BetForm
              placeBet={placeBet}
              betMinAmount={betMinAmount}
              loading={loading}
              onSuccess={handleBetSuccess}
            />
            <HistoryList
              betHistory={betHistory}
              formatAddress={formatAddress}
              loading={loading}
            />
          </div>
        ) : null}
      </main>

      {/* 页脚 */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>PizzaLottery（Sepolia）前端 © {new Date().getFullYear()}</p>
          <p>
            合约地址：
            <a
              href="https://sepolia.etherscan.io/address/0x841d24704f307ac7c337bc03e190769390fb41ef"
              target="_blank"
              rel="noopener noreferrer"
            >
              0x841d2470...b41ef
            </a>
          </p>
        </div>
      </footer>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background-color: #F8FAFC;
          color: #1E293B;
          line-height: 1.5;
        }

        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .app-header {
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          padding: 1rem 2rem;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .app-title {
          color: #1E293B;
          font-size: 1.5rem;
        }

        .network-alert {
          background-color: #FFFBEB;
          color: #D97706;
          padding: 0.8rem 2rem;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          font-weight: 500;
        }

        .switch-network-btn {
          background-color: #D97706;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
        }

        .switch-network-btn:disabled {
          background-color: #FBBF24;
          cursor: not-allowed;
        }

        .global-error {
          background-color: #FEE2E2;
          color: #DC2626;
          padding: 0.8rem 2rem;
          text-align: center;
          font-weight: 500;
        }

        .app-main {
          flex: 1;
          max-width: 1400px;
          margin: 2rem auto;
          padding: 0 2rem;
          width: 100%;
        }

        .connect-prompt {
          background-color: white;
          border-radius: 12px;
          padding: 3rem;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          max-width: 600px;
          margin: 2rem auto;
        }

        .connect-prompt h2 {
          color: #1E293B;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .connect-prompt p {
          color: #64748B;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .prompt-connect-btn {
          background-color: #4F46E5;
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 6px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-bottom:
          1.5rem;
        }

        .prompt-connect-btn:disabled {
          background-color: #94A3B8;
          cursor: not-allowed;
        }

        .faucet-hint {
          font-size: 0.9rem;
          color: #64748B;
        }

        .faucet-hint a {
          color: #4F46E5;
          text-decoration: none;
        }

        .faucet-hint a:hover {
          text-decoration: underline;
        }

        .content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .app-footer {
          background-color: #1E293B;
          color: white;
          padding: 1.5rem 2rem;
          margin-top: auto;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          text-align: center;
          font-size: 0.9rem;
        }

        .footer-content p {
          margin: 0.5rem 0;
        }

        .footer-content a {
          color: #93C5FD;
          text-decoration: none;
        }

        .footer-content a:hover {
          text-decoration: underline;
        }

        /* 响应式适配 */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }

          .app-title {
            font-size: 1.3rem;
          }

          .network-alert {
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem;
          }

          .connect-prompt {
            padding: 2rem 1rem;
          }

          .app-main {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
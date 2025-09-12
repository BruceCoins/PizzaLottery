import React from "react";
import { ethers } from "ethers"; // 引入ethers处理金额转换

const HistoryList = ({ betHistory, formatAddress, loading }) => {

  // 加载状态：显示加载动画和提示
  if (loading) {
    return (
      <div className="history-loading">
        <div className="spinner"></div>
        <p>加载投注历史中...</p>
        <p className="loading-hint">正在同步区块链数据，稍候...</p>
      </div>
    );
  }

  // 空状态：优化提示文案，增加引导
  // 使用以下方式判断数组是否真正为空
const actualLength = Object.keys(betHistory).filter(k => !isNaN(Number(k))).length;
if (actualLength === 0){
    return (
      <div className="history-empty">
        <div className="empty-icon">🎟️</div>
        <p>暂无投注记录</p>
        <p className="empty-hint">所有投注记录将从Sepolia区块链同步，安全可追溯</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2 className="history-title">📜 我的投注历史</h2>
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>结果</th>
              {/* <th>投注号码</th> */}
              <th>开奖号码</th>
              <th>中奖金额（SEP-ETH）</th>
              <th>交易哈希</th>
            </tr>
          </thead>
          <tbody>
            {betHistory.map((item) => (
              // 使用唯一ID（交易哈希+结果类型）避免key重复
              <tr key={item.id} className={item.type === "win" ? "win-row" : "lost-row"}>
                <td className="time">{item.time}</td>
                <td className="result">
                  {item.type === "win" ? (
                    <span className="win-tag">
                      中奖（{item.level === "1" ? "一等奖" : "二等奖"}）
                    </span>
                  ) : (
                    <span className="lost-tag">未中奖</span>
                  )}
                </td>
                {/* 投注号码：确保4位显示（不足补0） */}
                {/* <td className="bet-number">{item.betNumber}</td> */}
                {/* 新增开奖号码列，用户可对比结果 */}
                <td className="lot-number">{item.lotNumber}</td>
                <td className="amount">
                  {item.type === "win" ? (
                    // 使用ethers工具函数转换wei到ETH，保留4位小数
                    ethers.utils.formatEther(item.amount).slice(0, 8)
                  ) : (
                    "-"
                  )}
                </td>
                <td className="tx-hash">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tx-link"
                  >
                    {item.txHash.slice(0, 8)}...{item.txHash.slice(-4)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .history-container {
          background-color: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-top: 1rem;
        }

        .history-title {
          color: #1E293B;
          margin-top: 0;
          margin-bottom: 1.2rem;
          font-size: 1.3rem;
        }

        .history-table-container {
          overflow-x: auto; /* 适配小屏幕，横向滚动 */
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .history-table th,
        .history-table td {
          padding: 0.8rem 1rem;
          text-align: left;
          border-bottom: 1px solid #E2E8F0;
        }

        .history-table th {
          color: #64748B;
          font-weight: 600;
        }

        .history-table td {
          color: #1E293B;
        }

        /* 中奖行高亮 */
        .win-row {
          background-color: #ECFDF5;
        }

        /* 未中奖行高亮 */
        .lost-row {
          background-color: #FEF2F2;
        }

        .win-tag {
          color: #059669;
          background-color: #D1FAE5;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-weight: 600;
        }

        .lost-tag {
          color: #DC2626;
          background-color: #FEE2E2;
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-weight: 600;
        }

        .tx-link {
          color: #4F46E5;
          text-decoration: none;
        }

        .tx-link:hover {
          text-decoration: underline;
        }

        .history-loading {
          text-align: center;
          padding: 2rem;
          color: #64748B;
        }

        .loading-hint {
          font-size: 0.85rem;
          margin-top: 0.5rem;
          color: #94A3B8;
        }

        .history-empty {
          text-align: center;
          padding: 3rem 2rem;
          color: #64748B;
          background-color: #F8FAFC;
          border-radius: 8px;
        }

        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .empty-hint {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          color: #94A3B8;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #E2E8F0;
          border-top: 3px solid #4F46E5;
          border-radius: 50%;
          margin: 0 auto 1rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 响应式适配：小屏幕优化列显示 */
        @media (max-width: 768px) {
          .history-table th,
          .history-table td {
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
          }
          /* 隐藏部分非关键列，优先显示核心信息 */
          .history-table th:nth-child(4),
          .history-table td:nth-child(4) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default HistoryList;
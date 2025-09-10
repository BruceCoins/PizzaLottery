import React from "react";

const HistoryList = ({ betHistory, formatAddress, loading }) => {
  if (loading) {
    return (
      <div className="history-loading">
        <div className="spinner"></div>
        <p>加载投注历史中...</p>
      </div>
    );
  }

  if (betHistory.length === 0) {
    return (
      <div className="history-empty">
        <p>暂无投注记录，快去参与投注吧！</p>
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
              <th>投注数字</th>
              <th>中奖金额（SEP-ETH）</th>
              <th>交易哈希</th>
            </tr>
          </thead>
          <tbody>
            {betHistory.map((item, index) => (
              <tr key={index} className={item.type === "win" ? "win-row" : "lost-row"}>
                <td className="time">{item.time}</td>
                <td className="result">
                  {item.type === "win" ? (
                    <span className="win-tag">中奖（{item.level === "1" ? "一等奖" : "二等奖"}）</span>
                  ) : (
                    <span className="lost-tag">未中奖</span>
                  )}
                </td>
                <td className="bet-number">{item.betNumber || "未知"}</td>
                <td className="amount">
                  {item.type === "win" ? (
                    (item.amount / 1e18).toFixed(4) // wei转ETH并保留4位小数
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
        }

        .history-title {
          color: #1E293B;
          margin-top: 0;
          margin-bottom: 1.2rem;
          font-size: 1.3rem;
        }

        .history-table-container {
          overflow-x: auto;
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

        .win-row {
          background-color: #ECFDF5;
        }

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

        .history-empty {
          text-align: center;
          padding: 2rem;
          color: #64748B;
          background-color: #F8FAFC;
          border-radius: 8px;
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
      `}</style>
    </div>
  );
};

export default HistoryList;
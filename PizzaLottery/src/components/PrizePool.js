import React from "react";

const PrizePool = ({ 
  jackpot, 
  firstPrizeMax, 
  secondPrizeMax, 
  betMinAmount, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="prize-pool-loading">
        <div className="spinner"></div>
        <p>加载奖池数据中...</p>
      </div>
    );
  }

  return (
    <div className="prize-pool-container">
      <h2 className="pool-title">🎁 奖池信息</h2>
      <div className="pool-cards">
        {/* 奖池金额卡片 */}
        <div className="pool-card">
          <div className="card-label">当前奖池</div>
          <div className="card-value">{jackpot} SEP-ETH</div>
          <div className="card-desc">所有投注资金累积</div>
        </div>

        {/* 一等奖卡片 */}
        <div className="pool-card">
          <div className="card-label">一等奖最高金额</div>
          <div className="card-value first-prize">{firstPrizeMax} SEP-ETH</div>
          <div className="card-desc">数字完全匹配可获得</div>
        </div>

        {/* 二等奖卡片 */}
        <div className="pool-card">
          <div className="card-label">二等奖最高金额</div>
          <div className="card-value second-prize">{secondPrizeMax} SEP-ETH</div>
          <div className="card-desc">前3位/后3位匹配可获得</div>
        </div>

        {/* 投注金额卡片 */}
        <div className="pool-card">
          <div className="card-label">单次投注金额</div>
          <div className="card-value bet-amount">{betMinAmount} SEP-ETH</div>
          <div className="card-desc">固定投注金额</div>
        </div>
      </div>

      <style jsx>{`
        .prize-pool-container {
          background-color: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .pool-title {
          color: #1E293B;
          margin-top: 0;
          margin-bottom: 1.2rem;
          font-size: 1.3rem;
        }

        .pool-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.2rem;
        }

        .pool-card {
          background-color: #F8FAFC;
          border-radius: 8px;
          padding: 1.2rem;
          text-align: center;
          border: 1px solid #E2E8F0;
        }

        .card-label {
          color: #64748B;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .card-value {
          color: #1E293B;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
        }

        .first-prize {
          color: #E64A19; /* 橙色：一等奖 */
        }

        .second-prize {
          color: #FFC107; /* 黄色：二等奖 */
        }

        .bet-amount {
          color: #2563EB; /* 蓝色：投注金额 */
        }

        .card-desc {
          color: #94A3B8;
          font-size: 0.8rem;
        }

        .prize-pool-loading {
          text-align: center;
          padding: 2rem;
          color: #64748B;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #E2E8F0;
          border-top: 4px solid #4F46E5;
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

export default PrizePool;
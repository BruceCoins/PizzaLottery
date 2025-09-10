import React, { useState } from "react";
import { isValidBetNumber } from "../utils/format";

const BetForm = ({ placeBet, betMinAmount, loading, onSuccess }) => {
  const [betNumber, setBetNumber] = useState(""); // 用户输入的投注数字
  const [localError, setLocalError] = useState(""); // 表单本地验证错误

  // 处理输入变化
  const handleInputChange = (e) => {
    const value = e.target.value;
    // 只允许输入数字，且长度不超过4位
    if (/^\d*$/.test(value) && value.length <= 4) {
      setBetNumber(value);
      setLocalError("");
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // 1. 本地验证
    if (!isValidBetNumber(betNumber)) {
      setLocalError("请输入1-9999之间的有效数字");
      return;
    }

    // 2. 调用投注方法
    const result = await placeBet(betNumber);
    if (result?.success) {
      setBetNumber(""); // 清空输入框
      onSuccess && onSuccess(result.txHash); // 通知父组件成功
    }
  };

  return (
    <div className="bet-form-container">
      <h2 className="form-title">🎮 参与投注</h2>
      <form className="bet-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            输入4位数字（1-9999）：
          </label>
          <input
            type="text"
            className="form-input"
            value={betNumber}
            onChange={handleInputChange}
            placeholder="例如：1234"
            disabled={loading}
            maxLength={4}
          />
          <p className="input-hint">
            规则：完全匹配得一等奖，前3位/后3位匹配得二等奖
          </p>
        </div>

        {localError && (
          <div className="form-error">{localError}</div>
        )}

        <div className="bet-info">
          <p>
            单次投注金额：<span className="amount">{betMinAmount} SEP-ETH</span>
          </p>
          <p className="note">
            ⚠️ 提示：需确保钱包有足够SEP-ETH支付投注金额和Gas费（可从Sepolia水龙头获取）
          </p>
        </div>

        <button
          type="submit"
          className="bet-btn"
          disabled={loading || !betNumber}
        >
          {loading ? "投注中..." : `确认投注（${betMinAmount} SEP-ETH）`}
          </button>
      </form>

      <style jsx>{`
        .bet-form-container {
          background-color: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .form-title {
          color: #1E293B;
          margin-top: 0;
          margin-bottom: 1.2rem;
          font-size: 1.3rem;
        }

        .bet-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          color: #1E293B;
          font-weight: 600;
          font-size: 1rem;
        }

        .form-input {
          padding: 0.8rem 1rem;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          font-size: 1rem;
          color: #1E293B;
        }

        .form-input:focus {
          outline: none;
          border-color: #4F46E5;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }

        .input-hint {
          color: #94A3B8;
          font-size: 0.85rem;
          margin: 0.3rem 0 0;
        }

        .form-error {
          color: #DC2626;
          font-size: 0.9rem;
          background-color: #FEE2E2;
          padding: 0.6rem;
          border-radius: 6px;
        }

        .bet-info {
          margin: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bet-info .amount {
          color: #4F46E5;
          font-weight: 600;
        }

        .note {
          color: #D97706;
          font-size: 0.85rem;
          background-color: #FFFBEB;
          padding: 0.6rem;
          border-radius: 6px;
          margin: 0;
        }

        .bet-btn {
          background-color: #4F46E5;
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 0.5rem;
        }

        .bet-btn:disabled {
          background-color: #94A3B8;
          cursor: not-allowed;
        }

        .bet-btn:hover:not(:disabled) {
          background-color: #4338CA;
        }
      `}</style>
    </div>
  );
};

export default BetForm;
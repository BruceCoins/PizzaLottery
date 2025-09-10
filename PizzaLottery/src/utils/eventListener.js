import { ethers } from "ethers";
import { CONTRACT_EVENTS } from "../constants/contractConfig";

/**
 * 监听合约YouWin事件（中奖事件）
 * @param {ethers.Contract} contract - 合约实例
 * @param {function} callback - 事件触发后的回调函数
 */
export const listenWinEvent = (contract, callback) => {
  if (!contract) return;
  contract.on(CONTRACT_EVENTS.YOU_WIN, (user, lotNumber, level, amount, event) => {
    callback({
      type: "win",
      user,
      lotNumber: lotNumber.toString(),
      level: level.toString(),
      amount: amount.toString(),
      txHash: event.transactionHash,
      time: new Date().toLocaleString()
    });
  });
};

/**
 * 监听合约YouLost事件（未中奖事件）
 * @param {ethers.Contract} contract - 合约实例
 * @param {function} callback - 事件触发后的回调函数
 */
export const listenLostEvent = (contract, callback) => {
  if (!contract) return;
  contract.on(CONTRACT_EVENTS.YOU_LOST, (user, lotNumber, event) => {
    callback({
      type: "lost",
      user,
      lotNumber: lotNumber.toString(),
      txHash: event.transactionHash,
      time: new Date().toLocaleString()
    });
  });
};

/**
 * 移除所有合约事件监听
 * @param {ethers.Contract} contract - 合约实例
 */
export const removeAllListeners = (contract) => {
  if (!contract) return;
  contract.removeAllListeners(CONTRACT_EVENTS.YOU_WIN);
  contract.removeAllListeners(CONTRACT_EVENTS.YOU_LOST);
};
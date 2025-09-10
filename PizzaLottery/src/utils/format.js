import { ethers } from "ethers";

/**
 * 格式化以太坊地址（显示前6位+后4位）
 * @param {string} address - 完整地址
 * @returns {string} 格式化后的地址
 */
export const formatAddress = (address) => {
  if (!address || !ethers.utils.isAddress(address)) return "Invalid Address";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * 格式化ETH金额（将wei转为ETH，保留4位小数）
 * @param {string|number|BigInt} wei - 以wei为单位的金额
 * @returns {string} 格式化后的ETH金额
 */
export const formatEth = (wei) => {
  if (!wei) return "0.0000";
  return ethers.utils.formatEther(wei).slice(0, 8); // 保留4位小数（如0.1000 ETH）
};

/**
 * 验证4位投注数字（1-9999）
 * @param {string|number} number - 输入的数字
 * @returns {boolean} 是否有效
 */
export const isValidBetNumber = (number) => {
  const num = Number(number);
  return !isNaN(num) && num > 0 && num < 10000;
};
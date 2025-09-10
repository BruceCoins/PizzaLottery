// 合约地址（Sepolia测试网部署地址，固定为用户提供的地址）
export const CONTRACT_ADDRESS = "0x841d24704f307ac7c337bc03e190769390fb41ef";

// 合约方法名常量（避免硬编码错误）
export const CONTRACT_METHODS = {
  GET_BET_MIN: "betMinAmount",
  GET_FIRST_PRIZE_MAX: "firstPrizeMaxAmount",
  GET_SECOND_PRIZE_MAX: "secondPrizeMaxAmount",
  GET_JACKPOT: "jackpot",
  PLACE_BET: "placeBets"
};

// 合约事件名常量
export const CONTRACT_EVENTS = {
  YOU_WIN: "YouWin",
  YOU_LOST: "YouLost"
};
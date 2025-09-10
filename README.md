个人项目，仅供学习研究  
Personal project, continuous update and upgrade    

## 一、Pizza.sol  
智能合约代码，部署在 [Sepolia测试网路](https://sepolia.etherscan.io/address/0x841d24704f307ac7c337bc03e190769390fb41ef)    

本合约实现了一个简单的链上抽奖游戏核心逻辑，用户通过支付特定金额并输入 4 位数字进行投注，合约会生成随机数并根据匹配规则判定用户是否中奖及中奖等级，中奖者可获得奖池中的相应奖金。

## 二、PizzaLottery  
### 1、项目前端界面：  
<img src = "https://github.com/BruceCoins/PizzaLottery/blob/main/images/PizzaLottery.png" width="70%">  

### 2、前端代码结构
```
PizzaLottey/  
├── public/  
│   ├── index.html  
│   └── favicon.ico  
├── src/  
│   ├── constants/            # 配置文件目录  
│   │   ├── networkConfig.js    # 网络配置（Sepolia测试网）  
│   │   ├── contractABI.js      # 合约ABI  
│   │   └── contractConfig.js   # 合约地址配置  
│   ├── hooks/                # 自定义钩子  
│   │   ├── useWallet.js        # 钱包连接逻辑  
│   │   └── useContract.js      # 合约交互逻辑  
│   ├── components/           # 组件目录  
│   │   ├── WalletConnect.js    # 钱包连接组件  
│   │   ├── PrizePool.js        # 奖池信息组件  
│   │   ├── BetForm.js          # 投注表单组件  
│   │   └── HistoryList.js      # 投注历史组件  
│   ├── utils/                # 工具函数  
│   │   ├── format.js           # 格式化工具（地址、金额）  
│   │   └── eventListener.js    # 合约事件监听  
│   ├── App.js                # 主应用组件  
│   ├── index.js              # 入口文件  
│   └── App.css               # 全局样式  
├── .env                      # 环境变量    
├── .gitignore                # Git忽略文件   
├── package.json              # 依赖配置 
├── package-lock.json         # 依赖锁定  
└── README.md                 # 项目说明  
```
### 3、前端项目运行    
#### 3.1 环境准备  
- 安装 Node.js（v14+，**推荐 v16/v18**）和 npm（v6+）  
- 安装 MetaMask 浏览器插件（Chrome/Firefox/Edge）  
- 获取 Sepolia 测试网 ETH（通过 Sepolia Faucet 或其他测试网水龙头）

#### 3.2 项目导入及运行（VSCode）  
- 打开 VSCode，创建新文件夹（如 PizzaLottery）  
- 按照上述项目结构，创建对应的文件夹（src/constants、src/hooks 等）和文件  
- 将上述代码逐行复制到对应文件中（确保无语法错误）
- 打开 VSCode 终端，执行以下命令:
  ```bash
  # 1. 初始化项目（若未自动生成package.json）
  npm init -y

  # 2. 安装依赖（关键依赖：react、react-dom、ethers、react-scripts）
  npm install react react-dom ethers react-scripts @testing-library/jest-dom @testing-library/react @testing-library/user-event web-vitals

  # 3. 启动开发模式（默认端口3000）
  npm start
  ```
- 浏览器自动打开 http://localhost:3000 ，即可使用应用

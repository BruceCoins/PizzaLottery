前端项目目录结构：  
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

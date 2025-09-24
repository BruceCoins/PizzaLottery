## 基于区块链的彩票项目

个人项目，仅供学习研究  
Personal project, continuous update and upgrade    

## 一、Pizza.sol  
智能合约代码，部署在 [Sepolia测试网路](https://sepolia.etherscan.io/address/0x841d24704f307ac7c337bc03e190769390fb41ef)    

本合约实现了一个简单的链上抽奖游戏核心逻辑，用户通过支付特定金额并输入 4 位数字进行投注，合约会生成随机数并根据匹配规则判定用户是否中奖及中奖等级，中奖者可获得奖池中的相应奖金。

⚠️ 合约还有很多地方可以进一步优化...   
- 随机数生成机制：采用链下随机数 + 链上验证的方案（如 Chainlink VRF），或结合用户输入增强随机性。  
- 转账方式优化：改用 call 并检查返回值，兼容复杂接收逻辑 ``.call{value: _amount}("")``。  
- 防重入攻击：使用OpenZepplin 的 ReentrancyGuard 降低风险。
- 完善权限管理：执行紧急操作（如调整奖金、暂停合约）  

## 二、PizzaLottery  
### 1、项目前端界面：  
<img src = "https://github.com/BruceCoins/PizzaLottery/blob/main/images/PizzaLottery.png" width="70%">  

### 2、前端代码结构
```
PizzaLottey/  
├── public/  
│     ├── index.html  
│     └── favicon.ico  
├── src/  
│     ├── constants/              # 配置文件目录  
│     │     ├── networkConfig.js     # 网络配置（Sepolia测试网）  
│     │     ├── contractABI.js       # 合约ABI  
│     │     └── contractConfig.js    # 合约地址配置  
│     ├── hooks/                  # 自定义钩子  
│     │     ├── useWallet.js         # 钱包连接逻辑  
│     │     └── useContract.js       # 合约交互逻辑  
│     ├── components/             # 组件目录  
│     │     ├── WalletConnect.js     # 钱包连接组件  
│     │     ├── PrizePool.js         # 奖池信息组件  
│     │     ├── BetForm.js           # 投注表单组件  
│     │     └── HistoryList.js       # 投注历史组件  
│     ├── utils/                  # 工具函数  
│     │     ├── format.js            # 格式化工具（地址、金额）  
│     │     └── eventListener.js     # 合约事件监听  
│     ├── App.js                  # 主应用组件  
│     ├── index.js                # 入口文件  
│     └── App.css                 # 全局样式  
├── .env                      # 环境变量    
├── .gitignore                # Git忽略文件   
├── package.json              # 依赖配置 
├── package-lock.json         # 依赖锁定  
└── README.md                 # 项目说明  
```
### 3、前端项目 本地 运行    
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

### 4、前端项目部署到 Vercel 运行  
部署到 Vercel 后可全网访问，**本项目访问地址** https://pizza-lottery.vercel.app/   
  
#### 4.1 准备工作  
- **[注册 Vercel](https://vercel.com/)** 账号，使用 GitHub 账号注册（推荐，便于后续集成代码仓库）
- **安装 Vercel CLI**
  - 打开 VS Code 终端（Ctrl+`或View > Terminal`），全局安装 Vercel 命令行工具，注意要求的最低 node 版本信息
  ```
   npm install -g vercel 
  ```
#### 4.2 方法一：通过 Vercel CLI 对本地项目直接部署  
- **【1】在 VS Code 终端中，进入项目根目录**  
  ```shell
  cd /path/to/your/project
  ```

- **【2】登录 Vercel**  
  终端执行以下命令，会自动打开浏览器让你登录 Vercel 账号（确保已登录 GitHub 账号）
  ```shell
  vercel login  
  ```
  选择 GitHub 登录，授权后返回终端，显示 “Successfully logged in” 即为成功。  

- **【3】部署项目**  
  在项目目录执行部署命令:  
  ```
  vercel
  ```  
- **【4】配置部署选项**   
  终端会提示配置项目信息，按需求填写（首次部署建议默认值）：  
  ```
  Set up and deploy “~/path/to/project”? → 输入 y（确认部署）。  
  Which scope do you want to deploy to? → 选择你的 Vercel 账号（默认即可）。  
  Link to existing project? → 输入 n（首次部署，非已有项目）。  
  What’s your project’s name? → 输入项目名称（或回车用默认名）。  
  In which directory is your code located? → 回车（默认当前目录）  
  ```
  Vercel 会自动检测项目类型（如 React、Vue 等），并使用默认构建配置（如 npm run build）  

- **【5】完成部署**  
  部署成功后，终端会显示项目访问链接（如 https://your-project.vercel.app ），点击链接即可访问。  
  
#### 4.3 方法二：通过 GitHub 进行部署  
如果项目已托管在 GitHub，推荐此方式（支持代码推送后自动部署）  

- 【1】 **将项目初始化并推送到 GitHub**  

- 【2】 **在 Vercel 中导入仓库**  
  - 打开 Vercel 控制台，点击 New Project。  
  - 在 GitHub 仓库列表中找到你的项目，点击 Import。  
    
- 【3】**部署项目**   
  - Framework Preset：Vercel 会自动识别框架（如 Create React App），无需修改。  
  - Build & Output Settings：保持默认（自动填充构建命令和输出目录）。  
  - 点击 Deploy，等待部署完成。
 
- 【4】**自动部署项目**
此后，每次在 VS Code 中向 GitHub 推送代码（git push），Vercel 会自动触发重新部署，无需手动操作

- 【5】**部署后验证**  
  - 访问 Vercel 提供的域名（如 https://your-project.vercel.app），确认页面正常加载。  
  - 测试核心功能（如连接钱包、读取合约数据、投注交互），确保与本地开发环境表现一致。  
  - 若需绑定自定义域名，在 Vercel 项目控制台的 Settings > Domains 中添加域名并配置 DNS 解析。

- 【6】**常见问题**
  - **部署失败**：查看终端或 Vercel 控制台的部署日志，通常是依赖安装或构建命令错误，可在项目根目录添加 vercel.json 自定义配置
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "build"
  }
  ```
  - **页面刷新 404**：对于 React Router 等单页应用，需配置路由重写，在 vercel.json 中添加：
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

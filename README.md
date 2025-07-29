# PC Timer - PC程序使用时间统计工具

一个基于 Electron + React + TypeScript 的桌面应用程序，用于统计和可视化PC程序的使用时间。

## 功能特性

- ✨ **实时监控**: 自动跟踪当前活动窗口和程序使用时间
- 📊 **数据统计**: 提供详细的程序使用时间统计
- 📈 **趋势图表**: 展示近7天、近30天或自定义日期范围的使用趋势
- 🏆 **应用排名**: 按总使用时间、活跃天数等维度排序
- 💾 **本地存储**: 使用SQLite数据库安全存储使用记录
- 🎨 **现代UI**: 美观的用户界面和流畅的动画效果

## 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面应用**: Electron
- **数据库**: SQLite3
- **构建工具**: Webpack
- **样式**: CSS3 + 渐变动画
- **图表**: 自定义Chart组件

## 安装步骤

### 1. 安装依赖

```bash
# 安装所有依赖包
npm install

# 如果安装失败，可以尝试分步安装：
npm install react react-dom typescript
npm install electron @types/react @types/react-dom @types/node
npm install sqlite3 webpack webpack-cli webpack-dev-server
npm install electron-builder concurrently cross-env wait-on
npm install html-webpack-plugin ts-loader css-loader style-loader
```

### 2. 开发模式运行

```bash
# 启动开发服务器
npm start

# 或者分别启动：
npm run start:renderer  # 启动React开发服务器
npm run start:electron   # 启动Electron应用
```

### 3. 构建生产版本

```bash
# 构建应用
npm run build

# 打包为可安装程序
npm run dist
```

## 项目结构

```
pc_timer/
├── src/
│   ├── main/                 # Electron主进程
│   │   ├── main.ts          # 应用入口
│   │   ├── preload.ts       # 预加载脚本
│   │   ├── database.ts      # 数据库管理
│   │   └── activity-tracker.ts # 活动跟踪
│   ├── renderer/            # React渲染进程
│   │   ├── components/      # React组件
│   │   │   ├── Dashboard.tsx    # 仪表板
│   │   │   ├── StatsView.tsx    # 统计详情
│   │   │   ├── ChartsView.tsx   # 趋势图表
│   │   │   ├── RankingsView.tsx # 应用排名
│   │   │   └── Sidebar.tsx      # 侧边栏
│   │   ├── App.tsx          # 主应用组件
│   │   ├── App.css          # 样式文件
│   │   └── index.tsx        # React入口
│   └── shared/              # 共享工具
│       └── utils.ts         # 工具函数
├── public/
│   └── index.html           # HTML模板
├── webpack.config.js        # Webpack配置
├── tsconfig.json           # TypeScript配置
└── package.json            # 项目配置
```

## 功能模块

### 1. 仪表板 (Dashboard)
- 今日使用时间概览
- 活跃应用数统计
- 周平均使用时间
- 最常用应用列表

### 2. 统计详情 (Stats View)
- 按时间范围查看统计（今天/近7天/近30天）
- 应用使用时间排序
- 会话次数和平均时长
- 使用占比可视化

### 3. 趋势图表 (Charts View)
- 柱状图展示每日使用时间
- 支持7天、30天或自定义日期范围
- 每日应用使用详情
- 使用趋势分析

### 4. 应用排名 (Rankings)
- 多维度排名（总时间/活跃天数/平均会话）
- 前三名奖牌展示
- 应用图标识别
- 综合使用统计

## 系统要求

- Windows 10 或更高版本
- Node.js 16+ 
- 管理员权限（用于进程监控）

## 注意事项

1. **权限要求**: 应用需要监控系统进程，可能需要管理员权限
2. **防火墙**: 首次运行可能被防火墙拦截，需要允许通过
3. **数据安全**: 所有数据存储在本地，不会上传到云端
4. **性能影响**: 监控功能对系统性能影响极小

## 开发说明

- 使用PowerShell脚本获取Windows活动窗口信息
- SQLite数据库自动创建在用户数据目录
- 支持热重载开发模式
- 可打包为Windows安装程序

## 快速开始

如果npm install遇到网络问题，建议：

1. 使用国内镜像：`npm config set registry https://registry.npmmirror.com`
2. 或使用yarn：`yarn install`
3. 或使用cnpm：`cnpm install`

## License

MIT License - 详见 LICENSE 文件

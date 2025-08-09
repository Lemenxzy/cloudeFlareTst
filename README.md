# AI 问答系统

基于React + TypeScript + GraphQL的现代化AI问答系统，支持实时消息传递和服务器发送事件(SSE)。

## 功能特性

- 🚀 **现代技术栈**: React 18 + TypeScript + GraphQL + Apollo Client
- 💬 **实时聊天**: 支持GraphQL订阅和SSE连接的实时消息
- 🎨 **响应式设计**: 美观的聊天界面，适配各种设备
- 🔄 **自动部署**: 集成GitHub Actions自动化CI/CD流程
- 🛡️ **类型安全**: 完整的TypeScript支持

## 技术栈

### 前端
- React 18
- TypeScript
- Apollo Client (GraphQL)
- Vite (构建工具)
- CSS3

### 后端
- Apollo Server
- GraphQL
- Express.js
- WebSocket (GraphQL订阅)
- Server-Sent Events

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

同时启动前端和后端服务：

```bash
npm run dev:full
```

或者分别启动：

```bash
# 启动后端服务 (端口 4000)
npm run server

# 启动前端开发服务器 (端口 5173)
npm run dev
```

### 生产构建

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
├── src/
│   ├── components/          # React组件
│   │   ├── ChatInterface.tsx    # 主聊天界面
│   │   ├── ChatWindow.tsx       # 消息窗口
│   │   ├── MessageBubble.tsx    # 消息气泡
│   │   └── MessageInput.tsx     # 消息输入框
│   ├── hooks/               # 自定义Hooks
│   │   ├── useChat.ts           # 聊天相关逻辑
│   │   └── useSSE.ts           # SSE连接逻辑
│   ├── graphql/            # GraphQL相关
│   │   └── queries.ts          # 查询和变更定义
│   ├── apollo/             # Apollo配置
│   │   └── client.ts           # Apollo客户端配置
│   └── main.tsx            # 应用入口
├── server/                 # 后端服务器
│   ├── index.ts           # 服务器入口
│   ├── schema.ts          # GraphQL Schema
│   └── resolvers.ts       # GraphQL Resolvers
├── .github/workflows/     # GitHub Actions
│   ├── ci.yml             # 持续集成
│   └── deploy.yml         # 自动部署
└── package.json
```

## API接口

### GraphQL Queries

- `getMessages`: 获取所有消息

### GraphQL Mutations

- `sendMessage(input: MessageInput!)`: 发送消息

### GraphQL Subscriptions

- `messageAdded`: 监听新消息
- `aiResponseStream(messageId: ID!)`: 监听AI回复流

### REST Endpoints

- `GET /sse/:messageId`: SSE连接端点

## 部署

项目配置了GitHub Actions自动部署到GitHub Pages：

1. 推送到`main`分支时自动触发部署
2. 自动构建并部署到GitHub Pages
3. 支持多Node.js版本的CI测试

## 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License
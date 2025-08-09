# AI 问答系统

基于React + TypeScript + GraphQL + Cloudflare Workers的现代化AI问答系统，支持流式SSE响应和Markdown渲染。

## ✨ 功能特性

- 🚀 **现代技术栈**: React 18 + TypeScript + GraphQL + Cloudflare Workers
- 💬 **实时流式回复**: 基于SSE的真实AI流式响应体验
- 📝 **Markdown渲染**: 支持完整Markdown语法，包括代码高亮
- ☁️ **边缘计算**: 使用Cloudflare Workers实现全球低延迟
- 🎨 **响应式设计**: 美观的聊天界面，适配各种设备
- 🔄 **自动部署**: 集成GitHub Actions自动化CI/CD流程
- 🛡️ **类型安全**: 完整的TypeScript支持

## 🛠️ 技术栈

### 前端
- React 18
- TypeScript
- Apollo Client (GraphQL)
- React Markdown + 语法高亮
- Vite (构建工具)
- CSS3

### 后端
- Cloudflare Workers
- GraphQL (自定义实现)
- Server-Sent Events (SSE)
- 边缘计算

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置OpenAI API Key

开发环境配置：

1. 复制环境变量示例文件：
```bash
cp .dev.vars.example .dev.vars
```

2. 编辑 `.dev.vars` 文件，填入你的OpenAI API Key：
```bash
OPENAI_API_KEY=sk-your_actual_openai_api_key_here
CORS_ORIGIN=http://localhost:5173
```

3. 获取OpenAI API Key：访问 [OpenAI API Keys](https://platform.openai.com/api-keys)

### 开发环境

同时启动Cloudflare Workers和前端开发服务器：

```bash
npm run dev:full
```

或者分别启动：

```bash
# 启动 Cloudflare Workers 开发服务器 (端口 8787)
npm run workers:dev

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
│   ├── components/              # React组件
│   │   ├── ChatInterface.tsx        # 主聊天界面
│   │   ├── ChatWindow.tsx           # 消息窗口
│   │   ├── MessageBubble.tsx        # 消息气泡
│   │   ├── MessageInput.tsx         # 消息输入框
│   │   ├── MarkdownRenderer.tsx     # Markdown渲染器
│   │   └── StreamingMessage.tsx     # 流式消息组件
│   ├── hooks/                   # 自定义Hooks
│   │   ├── useChat.ts               # 聊天相关逻辑
│   │   └── useSSE.ts               # SSE连接逻辑
│   ├── graphql/                # GraphQL相关
│   │   └── queries.ts              # 查询和变更定义
│   ├── apollo/                 # Apollo配置
│   │   └── client.ts               # Apollo客户端配置
│   └── main.tsx                # 应用入口
├── workers/                    # Cloudflare Workers
│   └── index.ts               # Workers入口和GraphQL服务器
├── scripts/                   # 部署脚本
│   ├── deploy-workers.sh      # Linux/Mac部署脚本
│   └── deploy.bat            # Windows部署脚本
├── .github/workflows/         # GitHub Actions
│   ├── ci.yml                # 持续集成
│   └── deploy.yml            # 自动部署
├── wrangler.toml             # Cloudflare Workers配置
└── package.json
```

## API接口

### GraphQL Queries

- `getMessages`: 获取所有消息

### GraphQL Mutations

- `sendMessage(input: MessageInput!)`: 发送消息

### SSE Endpoints

- `GET /sse/:messageId?message=<content>`: 流式AI响应端点

## 🚀 部署

### 自动部署

项目配置了GitHub Actions自动部署：

1. **前端**: 自动部署到GitHub Pages
2. **后端**: 自动部署到Cloudflare Workers
3. 推送到`main`分支时自动触发部署

### 手动部署

#### 前端部署
```bash
npm run build
# 将 dist/ 目录部署到任何静态托管服务
```

#### Workers部署
```bash
# Linux/Mac
./scripts/deploy-workers.sh

# Windows
scripts\deploy.bat

# 或直接使用wrangler
npm run workers:deploy
```

### 环境配置

#### 开发环境
1. 复制 `.dev.vars.example` 为 `.dev.vars`
2. 设置你的 OpenAI API Key

#### 生产环境部署
需要设置以下环境变量：

**Cloudflare Workers Secrets:**
```bash
# 设置 OpenAI API Key
wrangler secret put OPENAI_API_KEY --env production
```

**GitHub Secrets** (用于自动部署)：
- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- OpenAI API Key 已通过 wrangler 直接设置到 Workers

## 📋 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- Cloudflare账号 (用于Workers部署)

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License
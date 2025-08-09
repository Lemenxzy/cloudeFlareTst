#!/bin/bash

# Cloudflare Workers 部署脚本

echo "🚀 开始部署 Cloudflare Workers..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler 未安装，请先安装：npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
    echo "🔑 请先登录 Cloudflare："
    wrangler login
fi

# 检查并设置 OpenAI API Key
echo "🔐 检查 OpenAI API Key..."
read -p "是否需要设置 OpenAI API Key? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "请输入您的 OpenAI API Key："
    wrangler secret put OPENAI_API_KEY --env production
fi

# 部署 Workers
echo "📦 部署 Workers 到生产环境..."
wrangler deploy --env production

if [ $? -eq 0 ]; then
    echo "✅ Workers 部署成功！"
    echo "🌐 你的 AI 聊天 API 已经部署到 Cloudflare 边缘网络"
    echo "📝 如需更新 API Key，请运行: wrangler secret put OPENAI_API_KEY --env production"
else
    echo "❌ 部署失败"
    exit 1
fi

echo "🎉 部署完成！"
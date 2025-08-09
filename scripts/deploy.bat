@echo off
echo 🚀 开始部署 Cloudflare Workers...

REM 检查是否安装了 wrangler
wrangler --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Wrangler 未安装，请先安装：npm install -g wrangler
    exit /b 1
)

REM 检查是否已登录
wrangler whoami >nul 2>&1
if errorlevel 1 (
    echo 🔑 请先登录 Cloudflare：
    wrangler login
)

REM 检查并设置 OpenAI API Key
echo 🔐 检查 OpenAI API Key...
set /p setup_key="是否需要设置 OpenAI API Key? (y/n): "
if /i "%setup_key%"=="y" (
    echo 请按提示输入您的 OpenAI API Key：
    wrangler secret put OPENAI_API_KEY --env production
)

REM 部署 Workers
echo 📦 部署 Workers 到生产环境...
wrangler deploy --env production

if errorlevel 1 (
    echo ❌ 部署失败
    exit /b 1
) else (
    echo ✅ Workers 部署成功！
    echo 🌐 你的 AI 聊天 API 已经部署到 Cloudflare 边缘网络
    echo 📝 如需更新 API Key，请运行: wrangler secret put OPENAI_API_KEY --env production
)

echo 🎉 部署完成！
pause
#!/bin/bash
# AIDocHub 快速更新脚本（日常更新用，比 deploy.sh 更快）
# 在 VPS 上执行：bash update.sh

set -e
APP_DIR="/root/aidochub"
cd $APP_DIR

echo "[1/4] 拉取最新代码..."
git pull

echo "[2/4] 更新后端依赖..."
cd $APP_DIR/server
npm install --production
npx prisma generate
npx prisma migrate deploy 2>/dev/null || true

echo "[3/4] 重新构建前端..."
cd $APP_DIR/client
npm install
npx vite build

echo "[4/4] 重启后端服务..."
pm2 restart aidochub-api

echo ""
echo "====== 更新完成！======"

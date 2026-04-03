#!/bin/bash
# AIDocHub 一键部署脚本
# 在 VPS 上执行：bash deploy.sh

set -e
echo "=============================="
echo "  AIDocHub 部署开始"
echo "=============================="

APP_DIR="/root/aidochub"

# 1. 安装 Nginx（如果没有）
echo "[1/7] 检查并安装 Nginx..."
if ! command -v nginx &> /dev/null; then
  apt update && apt install -y nginx
  echo "  Nginx 安装完成"
else
  echo "  Nginx 已安装"
fi

# 2. 克隆/更新代码
echo "[2/7] 拉取代码..."
if [ -d "$APP_DIR" ]; then
  cd $APP_DIR && git pull
  echo "  代码已更新"
else
  git clone https://github.com/sichen20250620-ship-it/aidochub.git $APP_DIR
  echo "  代码已克隆"
fi

# 3. 安装后端依赖
echo "[3/7] 安装后端依赖..."
cd $APP_DIR/server
npm install --production
# 复制生产环境配置
cp .env.production .env
echo "  后端依赖安装完成"

# 4. 数据库迁移 + 种子数据
echo "[4/7] 数据库迁移..."
npx prisma migrate deploy
npx prisma generate
node prisma/seed.js 2>/dev/null || echo "  种子数据已存在，跳过"
echo "  数据库迁移完成"

# 5. 构建前端
echo "[5/7] 构建前端..."
cd $APP_DIR/client
npm install
npx vite build
echo "  前端构建完成"

# 6. 创建日志目录 + 启动 PM2
echo "[6/7] 启动后端服务..."
mkdir -p $APP_DIR/logs
cd $APP_DIR/server
pm2 delete aidochub-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo "  PM2 启动完成"

# 7. 配置 Nginx
echo "[7/7] 配置 Nginx..."
cat > /etc/nginx/sites-available/aidochub << 'NGINX'
server {
    listen 80;
    server_name _;

    # 前端静态文件
    root /root/aidochub/client/dist;
    index index.html;

    # 前端路由（Vue SPA）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }

    # 文件上传大小限制
    client_max_body_size 20M;
}
NGINX

# 启用站点
ln -sf /etc/nginx/sites-available/aidochub /etc/nginx/sites-enabled/aidochub
rm -f /etc/nginx/sites-enabled/default

# 测试并重启 Nginx
nginx -t && systemctl restart nginx

echo ""
echo "=============================="
echo "  部署完成！"
echo "  访问 http://$(curl -s ifconfig.me)"
echo "  管理员: admin@aidochub.com / admin123"
echo "=============================="

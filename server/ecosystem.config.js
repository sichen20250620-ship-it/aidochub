// PM2 配置文件
module.exports = {
  apps: [{
    name: 'aidochub-api',
    script: 'src/app.js',
    cwd: '/root/aidochub/server',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/root/aidochub/logs/error.log',
    out_file: '/root/aidochub/logs/out.log'
  }]
}

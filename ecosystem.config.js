module.exports = {
  apps: [{
    name: 'stop-line-monitor',
    script: './dist/src/main.js',
    cwd: '/home/ec2-user/deployment/stop-line-monitor',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
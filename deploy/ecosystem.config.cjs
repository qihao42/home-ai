/**
 * PM2 process config for HomeAI production deployment.
 *
 * Usage:
 *   pm2 start deploy/ecosystem.config.cjs
 *   pm2 save                   # persist across reboots
 *   pm2 startup                # install systemd hook
 */
module.exports = {
  apps: [
    {
      name: 'homeai-server',
      cwd: './packages/server',
      script: 'dist/index.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        MQTT_PORT: '1883',
        DB_PATH: '../../data/smarthome.db',
      },
      max_memory_restart: '512M',
      error_file: '../../logs/server-err.log',
      out_file: '../../logs/server-out.log',
      merge_logs: true,
      time: true,
    },
    {
      name: 'homeai-simulator',
      cwd: './packages/simulator',
      script: 'dist/index.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '256M',
      error_file: '../../logs/simulator-err.log',
      out_file: '../../logs/simulator-out.log',
      merge_logs: true,
      time: true,
      // Wait a moment for the server's MQTT broker to come up
      restart_delay: 3000,
    },
    {
      name: 'homeai-orbital-ws',
      cwd: './packages/orbital',
      script: 'node_modules/tsx/dist/cli.mjs',
      args: 'server/index.ts',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '128M',
      error_file: '../../logs/orbital-ws-err.log',
      out_file: '../../logs/orbital-ws-out.log',
      merge_logs: true,
      time: true,
    },
  ],
}

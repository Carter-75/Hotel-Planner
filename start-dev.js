const portfinder = require('portfinder');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function start() {
  try {
    console.log('🔍 Finding available ports...');
    
    // 1. Find Backend Port (Start at 3000)
    portfinder.basePort = 3000;
    const backendPort = await portfinder.getPortPromise();
    
    // 2. Find Frontend Port (Start at 4200)
    portfinder.basePort = 4200;
    const frontendPort = await portfinder.getPortPromise();
    
    console.log(`🚀 Backend will run on: http://localhost:${backendPort}`);
    console.log(`🎨 Frontend will run on: http://localhost:${frontendPort}`);

    // 3. Create Dynamic Proxy Configuration
    const proxyConfig = {
      "/api": {
        "target": `http://localhost:${backendPort}`,
        "secure": false,
        "changeOrigin": true,
        "pathRewrite": {
          "^/api": "/api"
        }
      }
    };
    
    const proxyPath = path.join(__dirname, 'frontend', 'proxy.conf.json');
    fs.writeFileSync(proxyPath, JSON.stringify(proxyConfig, null, 2));
    console.log('🛠️  Generated frontend/proxy.conf.json');

    // 4. Start Backend
    console.log('📡 Starting Backend...');
    const backend = spawn('cmd', ['/c', 'npm', 'run', 'dev'], {
      cwd: path.join(__dirname, 'backend'),
      env: { ...process.env, PORT: backendPort },
      stdio: 'inherit'
    });

    // 5. Start Frontend
    console.log('📦 Starting Frontend...');
    const frontend = spawn('cmd', ['/c', 'npm', 'run', 'start', '--', `--port=${frontendPort}`, '--proxy-config=proxy.conf.json'], {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit'
    });

    // Handle termination
    process.on('SIGINT', () => {
      backend.kill();
      frontend.kill();
      process.exit();
    });

  } catch (err) {
    console.error('❌ Failed to start development servers:', err);
    process.exit(1);
  }
}

start();

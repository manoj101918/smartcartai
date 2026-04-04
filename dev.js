const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// This script runs both the frontend and backend simultaneously.
// Usage: node dev.js

const backendDir = path.join(__dirname, 'backend');
let backendCmd = 'uvicorn';
let backendArgs = ['main:app', '--reload', '--port', '8010'];

// Check for virtual environments on Windows
const venvScripts = [
  path.join(backendDir, '.venv', 'Scripts', 'uvicorn.exe'),
  path.join(backendDir, 'venv', 'Scripts', 'uvicorn.exe'),
  path.join(backendDir, '.venv', 'bin', 'uvicorn'),
  path.join(backendDir, 'venv', 'bin', 'uvicorn'),
];

for (const venvPath of venvScripts) {
  if (fs.existsSync(venvPath)) {
    backendCmd = venvPath;
    break;
  }
}

console.log(`🚀 Starting Backend with: ${backendCmd}`);
const backend = spawn(backendCmd, backendArgs, {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

backend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
      console.log(`Backend process exited with code ${code}`);
  }
  frontend.kill();
});

frontend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
      console.log(`Frontend process exited with code ${code}`);
  }
  backend.kill();
});


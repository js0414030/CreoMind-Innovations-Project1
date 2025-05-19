const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define paths
const backendPath = path.join(__dirname, 'abhaya-news-backend');
const frontendPath = path.join(__dirname, 'abhaya-news-frontend');

// Check if paths exist
if (!fs.existsSync(backendPath)) {
  console.error(`Backend path does not exist: ${backendPath}`);
  process.exit(1);
}

if (!fs.existsSync(frontendPath)) {
  console.error(`Frontend path does not exist: ${frontendPath}`);
  process.exit(1);
}

// Function to start a process
function startProcess(name, command, args, cwd) {
  console.log(`Starting ${name}...`);
  
  const proc = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'pipe'
  });
  
  proc.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });
  
  proc.stderr.on('data', (data) => {
    console.error(`[${name}] ${data.toString().trim()}`);
  });
  
  proc.on('close', (code) => {
    console.log(`[${name}] process exited with code ${code}`);
  });
  
  return proc;
}

// Start backend
const backend = startProcess('Backend', 'npm', ['start'], backendPath);

// Wait a bit for backend to start before starting frontend
setTimeout(() => {
  const frontend = startProcess('Frontend', 'npm', ['start'], frontendPath);
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Stopping all processes...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}, 3000);

console.log('Starting Abhaya News application...');
console.log('Press Ctrl+C to stop all servers.');
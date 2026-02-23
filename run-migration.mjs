import { spawn } from 'child_process';

const child = spawn('npx', ['drizzle-kit', 'generate'], {
  cwd: '/home/ubuntu/financial_automation_map',
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';

child.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  process.stdout.write(text);
  
  // Auto-respond to prompts
  if (text.includes('?') || text.includes('❯')) {
    setTimeout(() => {
      child.stdin.write('\n');
    }, 100);
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

child.on('close', (code) => {
  console.log(`\nMigration process exited with code ${code}`);
  process.exit(code);
});

// Send initial enters
setInterval(() => {
  if (!child.killed) {
    child.stdin.write('\n');
  }
}, 500);

// Timeout after 3 minutes
setTimeout(() => {
  console.log('\nTimeout reached, killing process');
  child.kill();
  process.exit(1);
}, 180000);

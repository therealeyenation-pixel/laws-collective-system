import { spawn } from 'child_process';

const child = spawn('npx', ['drizzle-kit', 'push', '--force'], {
  cwd: '/home/ubuntu/financial_automation_map',
  stdio: ['pipe', 'pipe', 'pipe']
});

let buffer = '';

child.stdout.on('data', (data) => {
  const text = data.toString();
  buffer += text;
  process.stdout.write(text);
  
  // If we see a prompt asking about table creation, send Enter
  if (text.includes('create table') || text.includes('rename table') || text.includes('Is ') && text.includes(' table ')) {
    setTimeout(() => {
      child.stdin.write('\n');
    }, 100);
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

child.on('close', (code) => {
  console.log(`\nProcess exited with code ${code}`);
  process.exit(code);
});

// Send Enter key periodically to handle prompts
const interval = setInterval(() => {
  child.stdin.write('\n');
}, 500);

// Stop after 5 minutes
setTimeout(() => {
  clearInterval(interval);
  child.kill();
}, 300000);

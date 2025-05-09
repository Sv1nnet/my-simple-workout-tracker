import { execSync } from 'child_process';

// Get all arguments after 'node scripts/build.js'
const args = process.argv.slice(2);

// Convert arguments to environment variables
const envVars = args.reduce((acc, arg) => {
  console.log(arg)
  const [key, value] = arg.split('=');
  return `${acc} ${key}=${value}`;
}, '');

// Run vite build with the environment variables
try {
  execSync(`cross-env ${envVars} vite build`, { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
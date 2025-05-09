import { execSync } from 'child_process';

// Get all arguments after 'node scripts/build.js'
const args = process.argv.slice(2);

// Convert arguments to environment variables
const envVars = args.reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  return `${acc ? acc + ' ' : ''}${key}=${value}`;
}, '');

// Run vite build with the environment variables
try {
  execSync(`cross-env ${envVars} ENVIRONMENT=android EXTERNAL_API_HOST=$(osascript -e \"IPv4 address of (system info)\") vite --force --host=$EXTERNAL_API_HOST --port 3004`, { stdio: 'inherit' });
} catch (error) {
  console.error('Dev failed:', error);
  process.exit(1);
}
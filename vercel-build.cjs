// vercel-build.js
process.env.NEXT_DISABLE_ESLINT = 'true';

const { execSync } = require('child_process');

try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (e) {
  process.exit(1);
}

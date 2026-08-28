import { seedDatabase } from './seed.js';

console.log('[Demo-Reset] Resetting Co-opSeva demo state for live presentation...');
seedDatabase().then(() => {
  console.log('[Demo-Reset] ✨ System ready for presentation demo!');
  process.exit(0);
});

import { seedDatabase } from './seed.js';

console.log('[Demo-Reset] Clearing Co-opSeva application data. No demo records will be inserted...');
seedDatabase().then(() => {
  console.log('[Demo-Reset] System is ready for authenticated data entry.');
  process.exit(0);
});

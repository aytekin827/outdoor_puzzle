try {
  const Database = require('better-sqlite3');
  console.log('better-sqlite3 loaded successfully');
  const sqlite = new Database('sqlite.db');
  console.log('database created successfully');
} catch (e) {
  console.error('Error loading better-sqlite3:', e);
}

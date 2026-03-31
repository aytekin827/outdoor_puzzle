const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
  db.prepare('ALTER TABLE missions ADD COLUMN closing_instruction TEXT').run();
  console.log('Successfully added closing_instruction column to missions table.');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('Column closing_instruction already exists.');
  } else {
    console.error('Error adding column:', error);
    process.exit(1);
  }
} finally {
  db.close();
}

const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
  db.prepare('ALTER TABLE missions ADD COLUMN mission_type TEXT DEFAULT "text"').run();
  db.prepare('ALTER TABLE missions ADD COLUMN mission_video_url TEXT').run();
  db.prepare('ALTER TABLE missions ADD COLUMN mission_slides_json TEXT').run();
  console.log('Successfully added mission content multimedia columns.');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('Columns already exist.');
  } else {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
} finally {
  db.close();
}

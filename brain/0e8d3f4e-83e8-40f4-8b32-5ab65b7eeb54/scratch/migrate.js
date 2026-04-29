const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
  db.prepare("ALTER TABLE missions ADD COLUMN description TEXT").run();
  console.log("Column 'description' added successfully to 'missions' table.");
} catch (err) {
  if (err.message.includes("duplicate column name")) {
    console.log("Column 'description' already exists.");
  } else {
    console.error("Error adding column:", err.message);
    process.exit(1);
  }
} finally {
  db.close();
}

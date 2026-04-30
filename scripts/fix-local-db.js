const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

console.log("Updating local sqlite.db...");

try {
  db.prepare("ALTER TABLE missions ADD COLUMN riddle_passage text").run();
  console.log("- Added riddle_passage");
} catch (e) {
  console.log("- riddle_passage already exists or error:", e.message);
}

try {
  db.prepare("ALTER TABLE missions ADD COLUMN checkpoint_image_url text").run();
  console.log("- Added checkpoint_image_url");
} catch (e) {
  console.log("- checkpoint_image_url already exists or error:", e.message);
}

try {
  db.prepare("ALTER TABLE missions ADD COLUMN checkpoint_image_asset_key text").run();
  console.log("- Added checkpoint_image_asset_key");
} catch (e) {
  console.log("- checkpoint_image_asset_key already exists or error:", e.message);
}

try {
  db.prepare("ALTER TABLE missions ADD COLUMN description text").run();
  console.log("- Added description");
} catch (e) {
  console.log("- description already exists or error:", e.message);
}

console.log("Done!");
db.close();

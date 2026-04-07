const Database = require('better-sqlite3');
const path = require('node:path');

const db = new Database(path.join(__dirname, './data/bot.db'));

db.exec(`
          CREATE TABLE (
            guild_id TEXT PRIMARY KEY,
            user_id TEXT PRIMARY KEY,
            api_key  TEXT NOT NULL,
            sheet_id TEXT,
            updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
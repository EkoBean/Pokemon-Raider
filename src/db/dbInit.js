const Database = require('better-sqlite3');
const path = require('node:path');

const db = new Database(path.join(__dirname, './data/bot.db'));

db.exec(`
          CREATE TABLE IF NOT EXISTS personal_tokens (
            user_id TEXT NOT NULL,
            sheet_id TEXT,
            access_token TEXT,
            refresh_token TEXT,
            updated_at TEXT DEFAULT (datetime('now')), 
            PRIMARY KEY (user_id)
          );
          CREATE TABLE IF NOT EXISTS guild_tokens (
            guild_id TEXT NOT NULL,
            sheet_id TEXT,
            access_token TEXT,
            refresh_token TEXT,
            updated_at TEXT DEFAULT (datetime('now')),
            PRIMARY KEY (guild_id)
          );
      `);

module.exports = db;
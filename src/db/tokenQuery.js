const db = require('./dbInit.js');

function savePersonalToken(userId, spreadsheetId, accessToken, refreshToken) {
	return db.prepare(`
    INSERT OR REPLACE INTO personal_tokens
    (user_id, sheet_id, access_token, refresh_token, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(userId, spreadsheetId, accessToken, refreshToken);
}

function saveGuildToken(guildId, spreadsheetId, accessToken, refreshToken) {
	return db.prepare(`
    INSERT OR REPLACE INTO guild_tokens
    (guild_id, sheet_id, access_token, refresh_token, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(guildId, spreadsheetId, accessToken, refreshToken);
}

module.exports = { savePersonalToken, saveGuildToken };
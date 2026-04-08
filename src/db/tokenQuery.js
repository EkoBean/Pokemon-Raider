const db = require('./dbInit.js');
const { encrypt } = require('../utils/encrypt');

function savePersonalToken(userId, spreadsheetId, accessToken, refreshToken) {
	return db.prepare(`
    INSERT OR REPLACE INTO personal_tokens
    (user_id, sheet_id, access_token, refresh_token, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(userId, spreadsheetId, encrypt(accessToken), encrypt(refreshToken));
}

function saveGuildToken(guildId, spreadsheetId, accessToken, refreshToken) {
	return db.prepare(`
    INSERT OR REPLACE INTO guild_tokens
    (guild_id, sheet_id, access_token, refresh_token, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).run(guildId, spreadsheetId, encrypt(accessToken), encrypt(refreshToken));
}

function getPersonalToken(userId) {
	return db.prepare(`
    SELECT * FROM personal_tokens WHERE user_id = ?
  `).get(userId);
}

function getGuildToken(guildId) {
	return db.prepare(`
    SELECT * FROM guild_tokens WHERE guild_id = ?
  `).get(guildId);
}

module.exports = { savePersonalToken, saveGuildToken, getPersonalToken, getGuildToken };
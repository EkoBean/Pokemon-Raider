const db = require('./src/db/dbInit.js');

async function test() {
	const state = {
		userId: '45612377',
		guildId: null,
		spreadsheetId: 'xxx1247777777789789456',
	};
	const tokens = {
		access_token: 'xxxxxxx',
		refresh_token: 'yyyyyyy',
	};
	try {
		if (state.userId && !state.guildId) {
			const result = db.prepare(`
                INSERT OR REPLACE INTO personal_tokens
                (user_id, sheet_id, access_token, refresh_token, updated_at)
                VALUES (?, ?, ?, ?, datetime('now'))`)
				.run(
					state.userId,
					state.spreadsheetId,
					tokens.access_token,
					tokens.refresh_token,
				);
			if (result.changes > 0) {
				console.log('personal token updated');
			}
		}
		else if (state.guildId && !state.userId) {
			const result = db.prepare(`
                     INSERT OR REPLACE INTO guild_tokens
                    (guild_id, sheet_id, access_token, refresh_token, updated_at)
                     VALUES (?, ?, ?, ?, datetime('now'))
                    `)
				.run(
					state.guildId,
					state.spreadsheetId,
					tokens.access_token,
					tokens.refresh_token,
				);
			if (result.changes > 0) {
				console.log('guild token updated');
			}
		}
		else {
			console.error('Invalid state: both userId and guildId are present or both are missing.');
		}
	}
	catch (error) {
		console.error('Error inserting data:', error);
	}

}
try {
	test();
}
catch (error) {
	console.error('Error parsing player data:', error);
}
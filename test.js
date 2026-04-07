const { savePersonalToken, saveGuildToken } = require('./src/db/tokenQuery.js');

async function test() {
	const state = {
		userId: null,
		guildId: '987654321',
		spreadsheetId: 'xxx124778xxx789789456',
	};
	const tokens = {
		access_token: 'xxxxxxx',
		refresh_token: 'yyyyyyy',
	};
	try {
		if (state.userId && !state.guildId) {
			const result = savePersonalToken(state.userId, state.spreadsheetId, tokens.access_token, tokens.refresh_token);
			if (result.changes > 0) console.log('personal token updated');
		}
		else if (state.guildId && !state.userId) {
			const result = saveGuildToken(state.guildId, state.spreadsheetId, tokens.access_token, tokens.refresh_token);
			if (result.changes > 0) console.log('guild token updated');
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
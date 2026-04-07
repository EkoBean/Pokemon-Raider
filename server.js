const { codeToToken } = require('./src/utils/googleAuth');
const { savePersonalToken, saveGuildToken } = require('./src/db/tokenQuery.js');

const express = require('express');
const app = express();
const redirectUri = process.env.GOOGLE_REDIRECT_URI;
const port = redirectUri ? new URL(redirectUri).port : 3000;

// oAuth callback endpoint
app.get('/callback', async (req, res) => {
	const state = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
	const code = req.query.code;
	try {
		const tokens = await codeToToken(code);

		// seperate personal and guild user
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
		res.send('OAuth callback received!');


	}
	catch (error) {
		console.error('Error handling OAuth callback:', error);
		res.status(500).send('Internal Server Error');
	}

});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
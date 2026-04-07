const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI,
);

function generateAuthUrl(userId, guildId, spreadsheetId) {
	const state = Buffer.from(JSON.stringify({
		userId,
		guildId,
		spreadsheetId,
	})).toString('base64');

	return oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: ['https://www.googleapis.com/auth/spreadsheets'],
		state,
		prompt: 'consent',
	});
}

async function codeToToken(code) {
	const { tokens } = await oauth2Client.getToken(code);
	return tokens;
}

// 用 refresh_token 建立有效的 auth client
function createAuthClient(refreshToken) {
	const client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.GOOGLE_REDIRECT_URI,
	);
	client.setCredentials({ refresh_token: refreshToken });
	return client;
}

module.exports = { generateAuthUrl, codeToToken, createAuthClient };
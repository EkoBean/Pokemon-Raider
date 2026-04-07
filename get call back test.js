const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI,
);
async function test() {
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
	try {
		const object = await generateAuthUrl('2654897', '987654321', '1Yj6d0ceHpr1tkgpAQW0p1M7s8zV5boJGvlpHRbW2xOk');
		console.log(object);
	}
	catch (error) {
		console.error('Error parsing player data:', error);
	}
}
test();
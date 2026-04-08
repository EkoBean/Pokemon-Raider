const { google } = require('googleapis');
const { getPersonalToken, getGuildToken } = require('../db/tokenQuery');
const { createAuthClient } = require('./googleAuth');
const { decrypt } = require('./encrypt');

function getSheetClient(userContext) {
	const { userId, guildId } = userContext;
	const token = guildId ? getGuildToken(guildId) : getPersonalToken(userId);

	const refreshToken = token ? decrypt(token.refresh_token) : null;
	const authClient = createAuthClient(refreshToken);
	const spreadsheetId = userContext.guildId ?
		getGuildToken(userContext.guildId)?.sheet_id :
		getPersonalToken(userContext.userId)?.sheet_id;
	const sheets = google.sheets({ version: 'v4', auth: authClient });

	return { sheets, spreadsheetId };
}

function getLocalDateTimeString() {
	const now = new Date();
	const pad = n => n.toString().padStart(2, '0');
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

async function getMetaData(userContext) {
	const { sheets, spreadsheetId } = getSheetClient(userContext);

	const response = await sheets.spreadsheets.get({
		spreadsheetId,
	});

	return response.data;
}

async function appendData(userContext, data) {
	const { sheets, spreadsheetId } = getSheetClient(userContext);
	const appendData = {
		characterName: data.characterName,
		lodestoneId: data.lodestoneId,
		lodestoneUrl: data.lodestoneUrl,
		fflogsLink: data.fflogsLink,
		comment: data.comment,
		images: data.images,
		reporterName: data.reporterName,
	};

	const playerName = `=HYPERLINK("${appendData.lodestoneUrl}", "${appendData.characterName}")`;
	const fflogsLink = `=HYPERLINK("${appendData.fflogsLink}", "FFLogs")`;
	const images = appendData.images.length === 0 ?
		'' :
		`=${appendData.images.filter(Boolean).map(url => `"${url}"`).join(' & CHAR(10) &')}`;

	const response = await sheets.spreadsheets.values.append({
		spreadsheetId,
		range: 'Pokemon Bank!A1',
		valueInputOption: 'USER_ENTERED',
		resource: {
			values: [
				[
					playerName,
					appendData.lodestoneId,
					fflogsLink,
					appendData.comment ? appendData.comment : ' ',
					images,
					appendData.reporterName,
					getLocalDateTimeString(),
				],
			],
		},
	});

	return response;

}


module.exports = { getMetaData, appendData };
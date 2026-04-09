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
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

async function getMetaData(userContext) {
	const { sheets, spreadsheetId } = getSheetClient(userContext);

	const response = await sheets.spreadsheets.get({
		spreadsheetId,
	});
	return response.data;
}

async function getSheetData(userContext, range) {
	const { sheets, spreadsheetId } = getSheetClient(userContext);
	const response = await sheets.spreadsheets.values.get({
		spreadsheetId,
		range,
	});
	return response.data.values;
}

async function initSheet(sheets, spreadsheetId) {
	const newSheet = await sheets.spreadsheets.batchUpdate({
		spreadsheetId,
		resource: {
			requests: [
				{
					addSheet: {
						properties: {
							title: 'Pokemon Bank',
						},
					},
				},
			],
		},
	});
	const SHEET_ID = newSheet.data.replies[0].addSheet.properties.sheetId;
	const formatInit = await sheets.spreadsheets.batchUpdate({
		spreadsheetId,
		resource: {
			requests: [
				{
					'repeatCell': {
						'range': {
							'sheetId': SHEET_ID,
						},
						'cell': {
							'userEnteredFormat': {
								horizontalAlignment: 'LEFT',
								verticalAlignment: 'MIDDLE',
								wrapStrategy: 'WRAP',
							},
						},
						fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,wrapStrategy)',
					},
				},
				{
					'repeatCell': {
						'range': {
							'sheetId': SHEET_ID,
							'startRowIndex': 0,
							'endRowIndex': 0,
							'startColumnIndex': 6,
							'endColumnIndex': 6,
						},
						'cell': {
							'userEnteredFormat': {
								numberFormat: {
									type: 'TEXT',
								},
							},
						},
						fields: 'userEnteredFormat.numberFormat',
					},
				},
				{
					'repeatCell': {
						'range': {
							'sheetId': SHEET_ID,
							'startRowIndex': 0,
							'endRowIndex': 1,
						},
						'cell': {
							'userEnteredFormat': {
								'backgroundColor': {
									'red': 1.0,
									'green': 0.94,
									'blue': 0.8,
								},
								'horizontalAlignment': 'LEFT',
								'textFormat': {
									'foregroundColor': {
										'red': 0,
										'green': 0,
										'blue': 0,
									},
									'fontSize': 12,
								},
							},
						},
						'fields': 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
					},
				},
				{
					'updateSheetProperties': {
						'properties': {
							'sheetId': SHEET_ID,
							'gridProperties': {
								'frozenRowCount': 1,
							},
						},
						'fields': 'gridProperties.frozenRowCount',
					},
				},
				{
					'updateCells': {
						'range': {
							'sheetId': SHEET_ID,
							'startRowIndex': 0,
							'endRowIndex': 1,
							'startColumnIndex': 0,
							'endColumnIndex': 10,
						},
						'rows': [
							{
								'values': [
									{ userEnteredValue: { stringValue: 'Player Name' } },
									{ userEnteredValue: { stringValue: 'Lodestone Number' } },
									{ userEnteredValue: { stringValue: 'FFLOGS Site' } },
									{ userEnteredValue: { stringValue: 'Rarity' } },
									{ userEnteredValue: { stringValue: 'Comment' } },
									{ userEnteredValue: { stringValue: 'Image1' } },
									{ userEnteredValue: { stringValue: 'Image2' } },
									{ userEnteredValue: { stringValue: 'Image3' } },
									{ userEnteredValue: { stringValue: 'Reporter' } },
									{ userEnteredValue: { stringValue: 'Date' } },
								],
							},
						],
						fields: 'userEnteredValue',
					},
				},
				// Column width settings
				{
					updateDimensionProperties: {
						range: {
							sheetId: SHEET_ID,
							dimension: 'COLUMNS',
							startIndex: 0,
							endIndex: 3,
						},
						properties: {
							pixelSize: 150,
						},
						fields: 'pixelSize',
					},
				},
				{
					updateDimensionProperties: {
						range: {
							sheetId: SHEET_ID,
							dimension: 'COLUMNS',
							startIndex: 3,
							endIndex: 4,
						},
						properties: {
							pixelSize: 50,
						},
						fields: 'pixelSize',
					},
				},
				{
					updateDimensionProperties: {
						range: {
							sheetId: SHEET_ID,
							dimension: 'COLUMNS',
							startIndex: 4,
							endIndex: 5,
						},
						properties: {
							pixelSize: 350,
						},
						fields: 'pixelSize',
					},
				},
				// Rarity highlight color
				{
					'addConditionalFormatRule': {
						'rule': {
							'ranges': [
								{
									'sheetId': SHEET_ID,
									'startRowIndex': 1,
									'startColumnIndex': 0,
								},
							],
							'booleanRule': {
								'condition': {
									'type': 'CUSTOM_FORMULA',
									'values': [
										{ userEnteredValue: '=$D2="SSR"' },
									],
								},
								'format': {
									'backgroundColor': {
										'red': 0.65,
										'green': 0.21,
										'blue': 0.15,
									},
								},
							},
						},
						'index': 0,
					},
				},

			],
		},
	});
	return formatInit;
}

async function appendData(userContext, data) {
	const { sheets, spreadsheetId } = getSheetClient(userContext);
	const dataToAppend = {
		characterName: data.characterName,
		lodestoneId: data.lodestoneId,
		lodestoneUrl: data.lodestoneUrl,
		fflogsLink: data.fflogsLink,
		rarity: data.rarity,
		comment: data.comment,
		images: data.images,
		reporterName: data.reporterName,
	};

	const playerName = `=HYPERLINK("${dataToAppend.lodestoneUrl}", "${dataToAppend.characterName}")`;
	const fflogsLink = `=HYPERLINK("${dataToAppend.fflogsLink}", "FFLogs")`;
	const images = dataToAppend.images.map(url => url ? `=HYPERLINK("${url}", "Image Link")` : ' ');

	const currentSheets = await getMetaData(userContext);
	if (!currentSheets.sheets.find(sheet => sheet.properties.title === 'Pokemon Bank')) {
		await initSheet(sheets, spreadsheetId);
	}
	const response = sheets.spreadsheets.values.append({
		spreadsheetId,
		range: 'Pokemon Bank!A1',
		valueInputOption: 'USER_ENTERED',
		resource: {
			values: [
				[
					playerName,
					dataToAppend.lodestoneId,
					fflogsLink,
					dataToAppend.rarity,
					dataToAppend.comment ? dataToAppend.comment : ' ',
					images[0] ? images[0] : ' ',
					images[1] ? images[1] : ' ',
					images[2] ? images[2] : ' ',
					dataToAppend.reporterName,
					getLocalDateTimeString(),
				],
			],
		},
	});

	return response;

}


module.exports = { getMetaData, appendData };
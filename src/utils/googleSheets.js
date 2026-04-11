const { google } = require('googleapis');
const { getPersonalToken, getGuildToken } = require('../db/tokenQuery');
const { createAuthClient } = require('./googleAuth');
const { decrypt } = require('./encrypt');
const { playerSearch } = require('./playerSearch.js');
const { fflogsLinkParse } = require('./fflogsLinkParse.js');

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
									'red': 0.956,
									'green': 0.780,
									'blue': 0.764,
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

async function getMetaData(userContext, field) {
	const { sheets, spreadsheetId } = getSheetClient(userContext);

	const response = await sheets.spreadsheets.get({
		spreadsheetId,
		fields: field ? field : 'sheets.properties',
	});
	return response.data;
}

async function getSheetData(userContext, range, valueRenderOption = 'FORMULA') {
	const { sheets, spreadsheetId } = getSheetClient(userContext);
	const response = await sheets.spreadsheets.values.get({
		spreadsheetId,
		range,
		valueRenderOption,
	});
	return response.data.values;
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

async function refreshNameAndLinks(userContext) {
	const { sheets, spreadsheetId } = getSheetClient(userContext);

	const refreshData = await sheets.spreadsheets.values.batchGet({
		spreadsheetId: spreadsheetId,
		ranges: ['\'Pokemon Bank\'!B2:B'],
	});
	const playerNames = await sheets.spreadsheets.values.batchGet({
		spreadsheetId: spreadsheetId,
		ranges: ['\'Pokemon Bank\'!A2:A'],
	});

	const lodestoneIds = refreshData.data.valueRanges[0].values || [];

	// generate the update data array
	const updateRequests = [];
	for (const [index, row] of lodestoneIds.entries()) {
		const lodestoneId = row[0]?.trim() ?? null;
		if (!lodestoneId || !/^\d+$/.test(lodestoneId)) continue;

		const playerInfo = await playerSearch(lodestoneId);
		if (!playerInfo) continue;

		const fflogsLink = await fflogsLinkParse(playerInfo.name, playerInfo.world, playerInfo.dc);
		const playerName = playerInfo.name || oldNames[index]?.[0] || 'Unknown';

		updateRequests.push({
			range: `'Pokemon Bank'!A${index + 2}:C${index + 2}`,
			values: [[
				`=HYPERLINK("https://na.finalfantasyxiv.com/lodestone/character/${lodestoneId}", "${playerName}")`,
				lodestoneId,
				`=HYPERLINK("${fflogsLink}", "FFLogs")`,
			]],
		});
		await new Promise(resolve => setTimeout(resolve, 50));
	}

	const currentData = await getSheetData(userContext, '\'Pokemon Bank\'!A2:C');
	const currentDataFormat = currentData.map(row => {
		const newRow = [...row];
		newRow[1] = String(newRow[1]);
		return newRow;
	});

	const filterData = updateRequests.map((row, index) => {
		const newRow = row.values[0];
		const oldRow = currentDataFormat[index] || [];
		if (newRow.every((value, idx) => value === oldRow[idx])) return;
		return row;
	}).filter(Boolean);

	if (updateRequests.length === 0) return null;

	console.log('查詢完成，開始更新資料表。');
	await sheets.spreadsheets.values.batchUpdate({
		spreadsheetId: spreadsheetId,
		resource: {
			valueInputOption: 'USER_ENTERED',
			data: filterData,
		},
	});

	const getNotes = await sheets.spreadsheets.get({
		spreadsheetId,
		ranges: ['\'Pokemon Bank\'!A2:A'],
		fields: 'sheets(data(rowData(values(note))))',
	});

	const oldNotesObjects = getNotes.data.sheets[0].data[0].rowData?.map(row => {
		return ({
			cell: `A${getNotes.data.sheets[0].data[0].rowData.indexOf(row) + 2}`,
			note: row.values && row.values[0] && row.values[0].note ? row.values[0].note : null,
		});
	},
	).filter(Boolean) ?? [];

	const metaData = await getMetaData(userContext);
	const SHEET_ID = metaData.sheets.filter(sheet => sheet.properties.title === 'Pokemon Bank')[0]?.properties.sheetId;

	// parse the object need to add name changing note
	const oldNames = playerNames.data.valueRanges[0].values || [];

	// array of object
	const noteRequest = filterData.map(row => {
		const matchCell = row.range.match(/A(\d+):C\d+/)[1];
		if (!matchCell) return null;
		const oldName = (oldNames[matchCell - 2] && oldNames[matchCell - 2][0]) || '';
		const newName = row.values[0][0] = row.values[0][0].match(/,\s*"([^"]+ [^"]+)"\)$/)[1];
		if (oldName === newName) return null;

		const oldNote = oldNotesObjects.find(object => object.cell === `A${matchCell}`)?.note || '';
		const newNote = `${oldNote ? oldNote + '\n' : ''}${oldName}`;
		return {
			'updateCells': {
				'range': {
					'sheetId': SHEET_ID,
					'startRowIndex': matchCell - 1,
					'endRowIndex': matchCell,
					'startColumnIndex': 0,
					'endColumnIndex': 1,
				},
				'rows': [
					{
						'values': [
							{
								'note': newNote,
							},
						],
					},
				],
				'fields': 'note',
			},
		};
	}).filter(Boolean);

	if (noteRequest.length === 0) return 'no name changes detected';
	await sheets.spreadsheets.batchUpdate({
		spreadsheetId,
		resource: {
			requests: noteRequest,
		},
	});

	return 'update complete';
}
module.exports = { getMetaData, appendData, refreshNameAndLinks };
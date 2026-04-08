const { savePersonalToken, saveGuildToken } = require('./src/db/tokenQuery.js');

async function test() {
	const sheetUrl = 'https://docs.google.com/spreadsheets/d/1Yj6d0ceHpr1tkgpAQW0p1M7s8zV5boJGvlpHRbW2xOk/edit?gid=0#gid=0';
	const sheetId = sheetUrl ? sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] : null;
	const url = URL.parse(sheetUrl);
	console.log('sheetId :>> ', sheetId);
	console.log('url :>> ', url);

}
try {
	test();
}
catch (error) {
	console.error('Error parsing player data:', error);
}
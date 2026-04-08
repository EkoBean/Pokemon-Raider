const { getMetaData, appendData } = require('./src/utils/googleSheets.js');

async function test() {
	const userContext = {
		userId: '1234567890',
		guildId: '987654321',
	};
	const result = await appendData(userContext, {
		characterName: 'Test Character',
		lodestoneId: '12345678',
		lodestoneUrl: 'https://na.finalfantasyxiv.com/lodestone/character/12345678',
		fflogsLink: 'https://www.fflogs.com/character/12345678',
		comment: '',
		images: [],
		reporterName: 'Test Reporter',
	});
	console.log(result);

}
try {
	test();
}
catch (error) {
	console.error('Error parsing player data:', error);
}
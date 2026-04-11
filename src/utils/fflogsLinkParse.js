const fflogsUrl = 'https://www.fflogs.com/character';
const RegionDataCenter = require('../../assets/regionDataCenter.json');

module.exports = {
	async fflogsLinkParse(characterName, worldName, dataCenter) {
		const character = characterName.toLowerCase().split(' ');

		const region = Object.keys(RegionDataCenter).find(regionName => RegionDataCenter[regionName].includes(dataCenter))?.toLowerCase();
		if (!region) {
			throw new Error(`Invalid data center: ${dataCenter}`);
		}

		const result = `${fflogsUrl}/${region}/${worldName.toLowerCase()}/${character[0]}%20${character[1]}`;

		return result;
	},
};
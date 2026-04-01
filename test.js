const { REST, Routes } = require('discord.js');
const { Character } = require('@xivapi/nodestone');
async function playerSearch(lodestoneId) {
    const parser = new Character();

    try {
        await parser.parse({ params: { lodestoneId } });
    }
    catch (error) {
        console.error('Error parsing player data:', error);
        return null;
    }
    return { name: result.Name, world: result.World, dc: result.DC };
}
playerSearch(2491932);
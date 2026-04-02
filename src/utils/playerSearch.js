const { Character } = require('@xivapi/nodestone');
module.exports = {
    async playerSearch(lodestoneId) {
        const characterId = lodestoneId;
        const parser = new Character();
        let result;
        try {
            result = await parser.parse({ params: { characterId } });
        }
        catch (error) {
            console.error('連線或查詢失敗:', error);
            return null;
        }
        return { name: result.Name, world: result.World, dc: result.DC };
    },
};

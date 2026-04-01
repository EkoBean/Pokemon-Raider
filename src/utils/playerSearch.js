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
        // console.log(result.Name);
        // console.log(result.World);
        // console.log(result.DC);
        return { name: result.Name, world: result.World, dc: result.DC };
    },
};

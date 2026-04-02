const { Character } = require('@xivapi/nodestone');
module.exports = {
    async playerSearch(lodestoneId) {
        const characterId = lodestoneId;
        const parser = new Character();
        let result;
        try {
            const result = await parser.parse({ params: { characterId } });
            return { name: result.Name, world: result.World, dc: result.DC, avatar: result.Avatar };
        }
        catch (error) {
            console.error('連線或查詢失敗:', error);
            if (error.message.startsWith('404')) return 404;
            if (error.message.startsWith('5')) return 500;
            return null;
        }

    },
};

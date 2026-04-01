const playerId = 13554897;
const { Character } = require('@xivapi/nodestone');

async function main() {
    const characterId = playerId;
    const parser = new Character();

    // nodestone 的 parse() 期待一個類 express Request 的物件
    const result = await parser.parse({ params: { characterId } });

    return { name: result.Name, world: result.World, dc: result.DC };
}
main().catch(console.error);
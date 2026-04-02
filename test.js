const { fflogsSearch } = require('./src/utils/fflogsSearch');
const { playerSearch } = require('./src/utils/playerSearch');
async function test() {

    try {
        const object = await playerSearch(48632504);
        console.log(object);
    }
    catch (error) {
        console.error('Error parsing player data:', error);
    }
}
test();
const { fflogsSearch } = require('./src/utils/fflogsSearch');
async function test() {

    try {
        await fflogsSearch('Bean Brother', 'Famfrit', 'Primal');
    }
    catch (error) {
        console.error('Error parsing player data:', error);
    }
}
test();
const fs = require('node:fs');
const path = require('node:path');

fs.readdir(path.join(__dirname, 'src'), (err, files) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(files);
});
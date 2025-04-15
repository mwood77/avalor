// this is some chatgpt fun, so don't take it too seriously
const config = require('./config.js');

const renderGridPath = (grid, path, resolution = 20) => {
    const size = grid[0].length;
    const step = Math.floor(size / resolution);
    const pathSet = new Set(path.map(([x, y]) => `${x},${y}`));
    const startKey = `${path[0][0]},${path[0][1]}`;
    const endKey = `${path[path.length - 1][0]},${path[path.length - 1][1]}`;

    console.log(`\n   Grid Overview (${resolution}x${resolution}):`);

    for (let gy = 0; gy < resolution; gy++) {
        let row = '   ';
        for (let gx = 0; gx < resolution; gx++) {
            const x = gx * step;
            const y = gy * step;
            const key = `${x},${y}`;

            if (key === startKey) {
                row += `${config.loggingColours.redInvert}S${config.loggingColours.default} `;
            } else if (key === endKey) {
                row += `${config.loggingColours.redInvert}E${config.loggingColours.default} `;
            } else if (pathSet.has(key)) {
                row += `${config.loggingColours.green}▓ ${config.loggingColours.default}`;
            } else {
                row += `${config.loggingColours.default}. ${config.loggingColours.default}`;
            }
        }

        row === '.' ? console.log(config.loggingColours.default, row) : console.log(config.loggingColours.magenta, row);
    }
}

module.exports = renderGridPath;
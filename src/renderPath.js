const config = require('./config.js');

/**
 * This is some chatgpt fun, so don't take it too seriously...
 * 
 * Renders a visual representation of a grid and a path within it to the console.
 * The grid is divided into a specified resolution, and the path is highlighted.
 *
 * @param {Array<Array<number>>} grid - The 2D array representing the grid.
 * @param {Array<Array<number>>} path - The array of coordinates representing the path.
 * @param {number} [resolution=20] - The resolution for rendering the grid (number of cells per row/column).
 *
 * @throws {Error} If the `path` array is empty or invalid.
 *
 * @example
 * const grid = [
 *   [0, 0, 0],
 *   [0, 0, 0],
 *   [0, 0, 0]
 * ];
 * const path = [[0, 0], [1, 1], [2, 2]];
 * renderGridPath(grid, path, 10);
 */
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

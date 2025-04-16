const performance = require('perf_hooks').performance;

const config = require('./config.js');
const renderGridPath = require('./renderPath.js');

/**
 * Executes a beam search algorithm on a grid to find the optimal path based on the given parameters.
 *
 * @param {number} gridSize - The size of the grid (assumes a square grid).
 * @param {number} startX - The starting X-coordinate.
 * @param {number} startY - The starting Y-coordinate.
 * @param {number} maxRuntime - The maximum runtime for the search in milliseconds.
 * @param {number} maxSteps - The maximum number of steps the search can take.
 * @param {number} beamWidth - The maximum number of nodes to keep in the beam at each step.
 * @param {number} maxDiscrepancy - The maximum allowed discrepancy for nodes in the beam.
 * @param {Array<[number, number]>} directions - An array of direction vectors for movement (e.g., [[1, 0], [0, 1]]).
 * @param {number[][]} grid - A 2D array representing the grid, where each cell contains a numeric value.
 *
 * @throws {Error} If the grid is invalid or a grid reference is out of bounds.
 *
 * @returns {void} Logs the results of the search, including the best path and its total value.
 */
const runSearch = (gridSize ,startX, startY, maxRuntime, maxSteps, beamWidth, maxDiscrepancy, directions, grid) => {

    class Node {
        constructor(x, y, steps = 0, discrepancy = 0, path = [], value = 0) {
            this.x = x;
            this.y = y;
            this.steps = steps;
            this.discrepancy = discrepancy;
            this.path = [...path, [x, y]];
            this.totalValue = value + grid[y][x];   // accumulator; total value of path _so far_ (parent value + current node value)

            if (!Array.isArray(grid) || !grid[y] || grid[y][x] === undefined) {
                throw new Error(`Invalid grid reference at (${x},${y})`);
              }
        }

        score() {
            return this.totalValue;
          }
    }

    const seenNodes = new Set();    // we aren't revisitng nodes (see caveats in readme)

    const isValidWithinGridBounds = (x, y) => {
        if (x < 0 || x >= gridSize) return false;
        if (y < 0 || y >= gridSize) return false;
        return true;
    };

    const startTime = performance.now();
    let beam = [new Node(parseInt(startX), parseInt(startY))];
    let steps = 0;

    while (performance.now() - startTime < maxRuntime && steps < maxSteps) {    // each iteration is a "step"
        const nextBeam = [];

        for (const node of beam) {
            const children = [];

            for (const [dx, dy] of directions) {    // explore all directions
                const nx = node.x + dx;
                const ny = node.y + dy;

                if (!isValidWithinGridBounds(nx, ny)) continue;

                const seenKey = `${nx},${ny}`;
                if (seenNodes.has(seenKey)) continue;   // short circuit if already seen
                seenNodes.add(seenKey);

                const newNode = new Node(nx, ny, node.steps + 1, node.discrepancy, node.path, node.totalValue);
                children.push(newNode);
            }

            children.sort((a, b) => b.score() - a.score());     // sort children by highest score; descending

            for (let i = 0; i < children.length && i < beamWidth; i++) {
                const child = children[i];
                const discrepancy = i === 0 ? node.discrepancy : node.discrepancy + 1;  // best child inherits parent's discrepancy; all others are parent's + increment
                if (discrepancy <= maxDiscrepancy) {
                    child.discrepancy = discrepancy;
                    nextBeam.push(child);
                }
            }
        }

        if (nextBeam.length === 0) nextBeam.push(...beam);  // if no children, keep the current beam

        beam = nextBeam;
        steps++;
    }

    const best = beam[0];   // winner winner chicken dinner

    console.log(config.loggingColours.green, `  Results:
        - Steps taken: ${steps}
        - Number of available paths: ${beam.length}
        - Search completed in: ${Math.round(performance.now() - startTime)}ms
        - Total value of "best path:" ${best?.totalValue}
    `);

    console.log(config.loggingColours.green, `  Best path:
        ${best?.path.map(([x, y]) => `(${x},${y})`).join(' -> ')}
    `);

    if (config.shouldRenderGraph) renderGridPath(grid, best?.path, grid[0].length);
};

module.exports = runSearch;

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const config = require('./src/config.js');
const runSearch = require('./src/search.js');

const limits = {
    gridSize: null,
    startPosition: null,
    maxRuntime: null,
    maxSteps: null,
}

const args = process.argv.slice(2);

const displayHelp = () => {
    console.info(config.loggingColours.green, `
        --help                   : Display this help message
        --start-position=<x,y>   : Set the starting position in the grid 
                                 └── Where <x,y> are positive integers on a <0,0> indexed grid
        --max-runtime=<ms>       : Set the maximum runtime in milliseconds
        --max-steps=<steps>      : Set the maximum number of steps to take:
                                 └── Where <steps> is a positive integer and 1 step represents <x,y> -> <x+1,y+1>
    `);
        console.info(config.loggingColours.magenta, `
        Example:
        node ldbs.js --start-position=5,5 --max-runtime=1200 --max-steps=200
    `);
};

const displayConfiguration = () => {
    console.log(config.loggingColours.cyan, `  Configuration:
        - Grid Size: ${limits.gridSize}
        - Start Position: (${limits.startPosition})
        - Max Runtime: ${limits.maxRuntime}ms
        - Max Steps: ${limits.maxSteps}
        - Allowable Directions: ${Object.keys(config.allowableDirections).length > 4 ? 'Cardinal & Inter cardinal' : 'Cardinal'}
        - Beam Width: ${config.beamWidth}
        - Discrepancy: ${config.maxDiscrepancy}
    `);
}

const sanitizeCliArgument = (arg) => {
    // sanitize key and modify into camelCase
    key = arg.includes('--') ? arg.split('--')[1] : arg;
    
    if (key.split('-').length > 1) {    // hack to see if the key is one word...
        const workingKey = key.split('-');
        workingKey[1] = workingKey[1].charAt(0).toUpperCase() + workingKey[1].slice(1);
        return workingKey.join('');
    }
}

const verifyCliArgs = () => {
    for (const arg of args) {
        if (arg === '--help') {
            displayHelp();
            process.exit(1);
        }

        if (arg.split('--').length !== 2) {
            console.error(config.loggingColours.red, `Invalid argument format: "${arg}", must have "--" prefix`);
            process.exit(1);
        }

        if (arg.includes('=')) {
            const [key, value] = arg.split('=');
            const sanitizedKey = sanitizeCliArgument(key);

            if (!config.validCliArgs.includes(sanitizedKey)) {
                console.error(config.loggingColours.red, `Invalid argument: ${arg}, type "--help" for help`);
                process.exit(1);
            }
            limits[sanitizedKey] = value;
            continue;
        }
    }
}

const selectMapPrompt = () => {
    const mapsDirectory = config.mapsDirectory;
    const files = fs.readdirSync(path.join(__dirname, mapsDirectory));

    console.log(config.loggingColours.default, `   Select a map:`);
    files.forEach((file, index) => {
        console.log(`       (${index + 1}) ${file}`);
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(`\n   Enter number (1-${files.length}): `, (answer) => {
        const answerIndex = parseInt(answer.trim(), 10) - 1;

        if (answerIndex >= 0 && answerIndex < files.length) {
            const selectedFile = files[answerIndex];

            console.log(config.loggingColours.magenta, `\n   You selected: "${selectedFile}"\n`);

            const content = fs.readFileSync(path.join(__dirname, mapsDirectory + selectedFile),'utf-8');
            
            // construct a 2d array from the contents of chosen map
            const grid = content.trim().split('\n').map(line =>
                line.trim().split(config.gridDelimiter).map(Number)
            );

            limits.gridSize = grid[0].length;

            displayConfiguration()

            const startPosition = limits.startPosition.split(',');

            if (startPosition[0] > limits.gridSize || startPosition[1] >= limits.gridSize) {
                console.error(config.loggingColours.red, 
                    `Invalid start position: <${limits.startPosition}>. `
                    + `Must be within grid size of ${limits.gridSize}x${limits.gridSize} with <0,0> indexing.`);
                process.exit(1);
            }

            runSearch(
                grid[0].length,
                startPosition[0],
                startPosition[1],
                limits.maxRuntime,
                limits.maxSteps,
                config.beamWidth,
                config.maxDiscrepancy,
                Object.values(config.allowableDirections).map(({x, y}) => [x, y]),
                grid,
            );

        } else {
            console.log('\nInvalid selection.');
        }
        rl.close();
    });
}

verifyCliArgs();
selectMapPrompt();

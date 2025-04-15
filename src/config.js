const config = {
    validCliArgs: [
        'startPosition',
        'maxRuntime',
        'maxSteps',
    ],
    allowableDirections: {
        'up': { x: 0, y: -1 },
        'down': { x: 0, y: 1 },
        'left': { x: -1, y: 0 },
        'right': { x: 1, y: 0 },
        'up-left': { x: -1, y: -1 },
        'up-right': { x: 1, y: -1 },
        'down-left': { x: -1, y: 1 },
        'down-right': { x: 1, y: 1 },
    },
    beamWidth: 8,
    maxDiscrepancy: 4,
    // beamWidth: 2,
    // maxDiscrepancy: 1,
    loggingColours: {
        'default': '\x1b[0m',
        'red': '\x1b[31m',
        'green': '\x1b[32m',
        'yellow': '\x1b[33m',
        'magenta': '\x1b[35m',
        'cyan': '\x1b[36m',
        'redInvert': '\x1b[97m\x1b[41m',
    }
};

// this ain't a module, dawg
module.exports = config;

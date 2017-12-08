# gcode-toolpath [![build status](https://travis-ci.org/cncjs/gcode-toolpath.svg?branch=master)](https://travis-ci.org/cncjs/gcode-toolpath) [![Coverage Status](https://coveralls.io/repos/github/cncjs/gcode-toolpath/badge.svg?branch=master)](https://coveralls.io/github/cncjs/gcode-toolpath?branch=master)

[![NPM](https://nodei.co/npm/gcode-toolpath.png?downloads=true&stars=true)](https://www.npmjs.com/package/gcode-toolpath)

## Install

`npm install --save gcode-toolpath`

## Usage

```js
const Toolpath = require('gcode-toolpath');

const toolpaths = [];
const toolpath = new Toolpath({
    // Initial position (optional)
    position: { x: 0, y: 0, z: 0 },

    // Initial modal state (optional)
    modal: {
        motion: 'G0', // G0, G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
        wcs: 'G54', // G54, G55, G56, G57, G58, G59
        plane: 'G17', // G17: xy-plane, G18: xz-plane, G19: yz-plane
        units: 'G21', // G20: Inches, G21: Millimeters
        distance: 'G90', // G90: Absolute, G91: Relative
        feedrate: 'G94', // G93: Inverse time mode, G94: Units per minute, G95: Units per rev
        program: 'M0', // M0, M1, M2, M30
        spindle: 'M5', // M3, M4, M5
        coolant: 'M9', // M7, M8, M9
        tool: 0
    },

    // @param {object} modal The modal object.
    // @param {object} v1 A 3D vector of the start point.
    // @param {object} v2 A 3D vector of the end point.
    addLine: (modal, v1, v2) => {
        const motion = modal.motion;
        const tool = modal.tool;
        toolpaths.push({ motion: motion, tool: tool, v1: v1, v2: v2 });
    },

    // @param {object} modal The modal object.
    // @param {object} v1 A 3D vector of the start point.
    // @param {object} v2 A 3D vector of the end point.
    // @param {object} v0 A 3D vector of the fixed point.
    addArcCurve: (modal, v1, v2, v0) => {
        const motion = modal.motion;
        const tool = modal.tool;
        toolpaths.push({ motion: motion, tool: tool, v1: v1, v2: v2, v0: v0 });
    }
});

// Position
toolpath.setPosition({ x: 100, y: 10 }); // x=100, y=10, z=0
toolpath.setPosition(10, 20, 30); // x=10, y=20, z=30

// Modal
toolpath.setModal({ tool: 1 });

// Load G-code from file
const file = 'example.nc';
toolpath.loadFromFile(file, function(err, data) {
});

// Load G-code from stream
const stream = fs.createReadStream(file, { encoding: 'utf8' });
toolpath.loadFromStream(stream, function(err, data) {
});

// Load G-code from string
const str = fs.readFileSync(file, 'utf8');
toolpath.loadFromString(str, function(err, data) {
});
```

## Examples

Run this example with babel-node:
```js
import Toolpath from 'gcode-toolpath';

const GCODE = [
    'N1 T2 G17 G20 G90 G94 G54',
    'N2 G0 Z0.25',
    'N3 X-0.5 Y0.',
    'N4 Z0.1',
    'N5 G01 Z0. F5.',
    'N6 G02 X0. Y0.5 I0.5 J0. F2.5',
    'N7 X0.5 Y0. I0. J-0.5',
    'N8 X0. Y-0.5 I-0.5 J0.',
    'N9 X-0.5 Y0. I0. J0.5',
    'N10 G01 Z0.1 F5.',
    'N11 G00 X0. Y0. Z0.25'
].join('\n');

const toolpaths = [];
const toolpath = new Toolpath({
    // @param {object} modal The modal object.
    // @param {object} v1 A 3D vector of the start point.
    // @param {object} v2 A 3D vector of the end point.
    addLine: (modal, v1, v2) => {
        const motion = modal.motion;
        const tool = modal.tool;
        toolpaths.push({ motion: motion, tool: tool, v1: v1, v2: v2 });
    },
    // @param {object} modal The modal object.
    // @param {object} v1 A 3D vector of the start point.
    // @param {object} v2 A 3D vector of the end point.
    // @param {object} v0 A 3D vector of the fixed point.
    addArcCurve: (modal, v1, v2, v0) => {
        const motion = modal.motion;
        const tool = modal.tool;
        toolpaths.push({ motion: motion, tool: tool, v1: v1, v2: v2, v0: v0 });
    }
});

toolpath
    .loadFromString(GCODE, (err, results) => {
        console.log(toolpaths);
    })
    .on('data', (data) => {
        // 'data' event listener
    })
    .on('end', (results) => {
        // 'end' event listener
    });
```

and you will see the output as below:
```js
[ { motion: 'G0',
    tool: 2,
    v1: { x: 0, y: 0, z: 0 },
    v2: { x: 0, y: 0, z: 6.35 } },
  { motion: 'G0',
    tool: 2,
    v1: { x: 0, y: 0, z: 6.35 },
    v2: { x: -12.7, y: 0, z: 6.35 } },
  { motion: 'G0',
    tool: 2,
    v1: { x: -12.7, y: 0, z: 6.35 },
    v2: { x: -12.7, y: 0, z: 2.54 } },
  { motion: 'G1',
    tool: 2,
    v1: { x: -12.7, y: 0, z: 2.54 },
    v2: { x: -12.7, y: 0, z: 0 } },
  { motion: 'G2',
    tool: 2,
    v1: { x: -12.7, y: 0, z: 0 },
    v2: { x: 0, y: 12.7, z: 0 },
    v0: { x: 0, y: 0, z: 0 } },
  { motion: 'G2',
    tool: 2,
    v1: { x: 0, y: 12.7, z: 0 },
    v2: { x: 12.7, y: 0, z: 0 },
    v0: { x: 0, y: 0, z: 0 } },
  { motion: 'G2',
    tool: 2,
    v1: { x: 12.7, y: 0, z: 0 },
    v2: { x: 0, y: -12.7, z: 0 },
    v0: { x: 0, y: 0, z: 0 } },
  { motion: 'G2',
    tool: 2,
    v1: { x: 0, y: -12.7, z: 0 },
    v2: { x: -12.7, y: 0, z: 0 },
    v0: { x: 0, y: 0, z: 0 } },
  { motion: 'G1',
    tool: 2,
    v1: { x: -12.7, y: 0, z: 0 },
    v2: { x: -12.7, y: 0, z: 2.54 } },
  { motion: 'G0',
    tool: 2,
    v1: { x: -12.7, y: 0, z: 2.54 },
    v2: { x: 0, y: 0, z: 6.35 } } ]
```

## G-code Toolpath Visualizer
Check out the source code at https://github.com/cncjs/cnc/blob/master/src/web/widgets/Visualizer/GCodeVisualizer.js

## License

MIT

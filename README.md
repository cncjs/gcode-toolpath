# gcode-toolpath [![build status](https://travis-ci.org/cheton/gcode-toolpath.svg?branch=master)](https://travis-ci.org/cheton/gcode-toolpath) [![Coverage Status](https://coveralls.io/repos/github/cheton/gcode-toolpath/badge.svg?branch=master)](https://coveralls.io/github/cheton/gcode-toolpath?branch=master)

[![NPM](https://nodei.co/npm/gcode-toolpath.png?downloads=true&stars=true)](https://nodei.co/npm/gcode-toolpath/)

## Install

`npm install --save gcode-toolpath`

## Usage

```js
var GCodeToolpath = require('gcode-toolpath').GCodeToolpath;

var toolpaths = [];
var gcode = new GCodeToolpath({
    modalState: { // [optional] initial modal state
        motion: 'G0', // G0, G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
        coordinate: 'G54', // G54, G55, G56, G57, G58, G59
        plane: 'G17', // G17: xy-plane, G18: xz-plane, G19: yz-plane
        units: 'G21', // G20: Inches, G21: Millimeters
        distance: 'G90', // G90: Absolute, G91: Relative
        feedrate: 'G94', // G93: Inverse Time Mode, G94: Units Per Minutes
        program: 'M0',
        spindle: 'M5',
        coolant: 'M9'
    },
    addLine: (modalState, v1, v2) => {
        var motion = modalState.motion;
        toolpaths.push({ motion: motion, v1: v1, v2: v2 });
    },
    addArcCurve: (modalState, v1, v2, v0) => {
        var motion = modalState.motion;
        toolpaths.push({ motion: motion, v1: v1, v2: v2, v0: v0 });
    }
});

// Load G-code from file
var file = 'example.nc';
gcode.loadFromFile(file, function(err, data) {
});

// Load G-code from stream
var stream = fs.createReadStream(file, { encoding: 'utf8' });
gcode.loadFromStream(stream, function(err, data) {
});

// Load G-code from string
var str = fs.readFileSync(file, 'utf8');
gcode.loadFromString(str, function(err, data) {
});
```

## Examples

Run this example with babel-node:
```js
import { GCodeToolpath } from 'gcode-toolpath';

const GCODE = [
    'N1 G17 G20 G90 G94 G54',
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

let toolpaths = [];
let gcode = new GCodeToolpath({
    addLine: (modalState, v1, v2) => {
        var motion = modalState.motion;
        toolpaths.push({ motion: motion, v1: v1, v2: v2 });
    },
    addArcCurve: (modalState, v1, v2, v0) => {
        var motion = modalState.motion;
        toolpaths.push({ motion: motion, v1: v1, v2: v2, v0: v0 });
    }
});

gcode
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
    v1: { x: 0, y: 0, z: 0 },
    v2: { x: 0, y: 0, z: 6.35 } },
  { motion: 'G0',
    v1: { x: 0, y: 0, z: 6.35 },
    v2: { x: -12.7, y: 0, z: 0 } },
  { motion: 'G0',
    v1: { x: -12.7, y: 0, z: 0 },
    v2: { x: 0, y: 0, z: 2.54 } },
  { motion: 'G1',
    v1: { x: 0, y: 0, z: 2.54 },
    v2: { x: 0, y: 0, z: 0 } },
  { motion: 'G2',
    v1: { x: 0, y: 0, z: 0 },
    v2: { x: 0, y: 12.7, z: 0 },
    v0: { x: 12.7, y: 0, z: 0 } },
  { motion: 'G2',
    v1: { x: 0, y: 12.7, z: 0 },
    v2: { x: 12.7, y: 0, z: 0 },
    v0: { x: 0, y: 0, z: 0 } },
  { motion: 'G2',
    v1: { x: 12.7, y: 0, z: 0 },
    v2: { x: 0, y: -12.7, z: 0 },
    v0: { x: 0, y: 0, z: 0 } },
  { motion: 'G2',
    v1: { x: 0, y: -12.7, z: 0 },
    v2: { x: -12.7, y: 0, z: 0 },
    v0: { x: 0, y: 0, z: 0 } },
  { motion: 'G1',
    v1: { x: -12.7, y: 0, z: 0 },
    v2: { x: 0, y: 0, z: 2.54 } },
  { motion: 'G0',
    v1: { x: 0, y: 0, z: 2.54 },
    v2: { x: 0, y: 0, z: 6.35 } } ]
```

## G-code Toolpath Visualizer
Check out the source code at https://github.com/cheton/cnc/blob/master/src/web/components/widgets/visualizer/GCodeVisualizer.js

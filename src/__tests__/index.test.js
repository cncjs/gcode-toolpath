/* eslint-disable no-unused-vars */
import fs from 'fs';
import path from 'path';
import Toolpath from '..';

describe('Pass a null value as the first argument', () => {
  const toolpath = new Toolpath();
  it('should call loadFromString\'s callback.', (done) => {
    toolpath.loadFromString(null, (err, results) => {
      expect(err).toBeNull();
      expect(results).toHaveLength(0);
      done();
    });
  });
  it('should call loadFromFile\'s callback.', (done) => {
    toolpath.loadFromFile(null, (err, results) => {
      expect(err).not.toBeNull();
      expect(results).toBeUndefined();
      done();
    });
  });
  it('should call loadFromStream\'s callback.', (done) => {
    toolpath.loadFromStream(null, (err, results) => {
      expect(err).not.toBeNull();
      expect(results).toBeUndefined();
      done();
    });
  });
});

describe('Event listeners', () => {
  it('should call event listeners when loading G-code from file.', (done) => {
    const filepath = path.resolve(__dirname, 'fixtures/circle.nc');

    new Toolpath()
      .loadFromFile(filepath, (err, results) => {
        expect(err).toBeNull();
        expect(results).toHaveLength(7);
        done();
      })
      .on('data', (data) => {
        expect(typeof data).toBe('object');
      })
      .on('end', (results) => {
        expect(results).toHaveLength(7);
      });
  });

  it('should call event listeners when loading G-code from stream.', (done) => {
    const filepath = path.resolve(__dirname, 'fixtures/circle.nc');
    const stream = fs.createReadStream(filepath);

    new Toolpath()
      .loadFromStream(stream, (err, results) => {
        expect(err).toBeNull();
        expect(results).toHaveLength(7);
        done();
      })
      .on('data', (data) => {
        expect(typeof data).toBe('object');
      })
      .on('end', (results) => {
        expect(results).toHaveLength(7);
      });
  });

  it('should call event listeners when loading G-code from string.', (done) => {
    const filepath = path.resolve(__dirname, 'fixtures/circle.nc');
    const string = fs.readFileSync(filepath, 'utf8');

    new Toolpath()
      .loadFromString(string, (err, results) => {
        expect(err).toBeNull();
        expect(results).toHaveLength(7);
        done();
      })
      .on('data', (data) => {
        expect(typeof data).toBe('object');
      })
      .on('end', (results) => {
        expect(results).toHaveLength(7);
      });
  });
});

describe('position', () => {
  it('should match the specified position.', (done) => {
    const toolpath = new Toolpath({
      position: { x: 200, y: 100 }
    });
    expect(toolpath.getPosition()).toEqual({ x: 200, y: 100, z: 0 });
    toolpath.setPosition({ y: 200, z: 10 });
    expect(toolpath.getPosition()).toEqual({ x: 200, y: 200, z: 10 });
    toolpath.setPosition(10, 10);
    expect(toolpath.getPosition()).toEqual({ x: 10, y: 10, z: 10 });
    toolpath.setPosition(0, 0, 0);
    expect(toolpath.getPosition()).toEqual({ x: 0, y: 0, z: 0 });
    done();
  });
});

describe('modal', () => {
  it('should match the specified modal state.', (done) => {
    const toolpath = new Toolpath({
      modal: {
        tool: 1
      }
    });
    const expectedModal = {
      // Moton Mode
      // G0, G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
      motion: 'G0',

      // Coordinate System Select
      // G54, G55, G56, G57, G58, G59
      wcs: 'G54',

      // Plane Select
      // G17: XY-plane, G18: ZX-plane, G19: YZ-plane
      plane: 'G17',

      // Units Mode
      // G20: Inches, G21: Millimeters
      units: 'G21',

      // Distance Mode
      // G90: Absolute, G91: Relative
      distance: 'G90',

      // Arc IJK distance mode
      arc: 'G91.1',

      // Feed Rate Mode
      // G93: Inverse time mode, G94: Units per minute mode, G95: Units per rev mode
      feedrate: 'G94',

      // Cutter Radius Compensation
      cutter: 'G40',

      // Tool Length Offset
      // G43.1, G49
      tlo: 'G49',

      // Program Mode
      // M0, M1, M2, M30
      program: 'M0',

      // Spingle State
      // M3, M4, M5
      spindle: 'M5',

      // Coolant State
      // M7, M8, M9
      coolant: 'M9', // 'M7', 'M8', 'M7,M8', or 'M9'

      // Tool Select
      tool: 1,
    };
    expect(toolpath.getModal()).toEqual(expectedModal);

    toolpath.setModal({ tool: 2 });
    expect(toolpath.getModal().tool).toBe(2);

    done();
  });
});

describe('Linear Move: G0/G1', () => {
  it('should generate tool paths for linear movement.', (done) => {
    const expectedMotions = [
      {
        "motion": "G0",
        "v1": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "v2": {
          "x": 0,
          "y": 0,
          "z": 0
        }
      },
      {
        "motion": "G0",
        "v1": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "v2": {
          "x": 28.4099,
          "y": 14.12748,
          "z": 0
        }
      },
      {
        "motion": "G0",
        "v1": {
          "x": 28.4099,
          "y": 14.12748,
          "z": 0
        },
        "v2": {
          "x": 28.4099,
          "y": 14.12748,
          "z": 1.0007599999999999
        }
      },
      {
        "motion": "G0",
        "v1": {
          "x": 28.4099,
          "y": 14.12748,
          "z": 1.0007599999999999
        },
        "v2": {
          "x": 28.4099,
          "y": 14.12748,
          "z": -0.5867399999999999
        }
      },
      {
        "motion": "G1",
        "v1": {
          "x": 28.4099,
          "y": 14.12748,
          "z": -0.5867399999999999
        },
        "v2": {
          "x": 28.4099,
          "y": 14.12748,
          "z": -0.9270999999999999
        }
      }
    ];
    const motions = [];
    const toolpath = new Toolpath({
      modal: {},
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      }
    });

    const filepath = path.resolve(__dirname, 'fixtures/linear.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toEqual(expectedMotions);
    done();
  });

});

describe('Arc Curve: G2/G3', () => {
  it('should generate tool paths for simple radius.', (done) => {
    const motions = [];
    const toolpath = new Toolpath({
      modal: {},
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });

    const filepath = path.resolve(__dirname, 'fixtures/arc-r.nc');
    toolpath.loadFromFileSync(filepath);
    done();
  });

  it('should generate tool paths for helical thread milling.', (done) => {
    const motions = [];
    const toolpath = new Toolpath({
      modal: {},
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });

    const filepath = path.resolve(__dirname, 'fixtures/helical-thread-milling.nc');
    toolpath.loadFromFileSync(filepath);
    done();
  });

  it('should generate for one inch circle.', (done) => {
    const motions = [];
    const toolpath = new Toolpath({
      modal: {},
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });

    const filepath = path.resolve(__dirname, 'fixtures/one-inch-circle.nc');
    toolpath.loadFromFileSync(filepath);
    done();
  });

});

describe('Dwell: G4', () => {
  it('should not generate tool paths.', (done) => {
    const motions = [];
    const toolpath = new Toolpath({
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });
    const filepath = path.resolve(__dirname, 'fixtures/dwell.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toHaveLength(0);
    done();
  });
});

describe('Motion: G0/G1/G2/G3/G38.2/G38.3/G38.4/G38.5/G80', () => {
  it('should generate tool paths for an empty object.', (done) => {
    const expectedmotions = [
      {
        motion: 'G0',
        v1: { x: 0, y: 0, z: 0 },
        v2: { x: 0, y: 0, z: 0 }
      },
      {
        motion: 'G1',
        v1: { x: 0, y: 0, z: 0 },
        v2: { x: 0, y: 0, z: 0 }
      },
      {
        motion: 'G2',
        v1: { x: 0, y: 0, z: 0 },
        v2: { x: 0, y: 0, z: 0 },
        v0: { x: 0, y: 0, z: 0 }
      },
      {
        motion: 'G3',
        v1: { x: 0, y: 0, z: 0 },
        v2: { x: 0, y: 0, z: 0 },
        v0: { x: 0, y: 0, z: 0 }
      }
    ];
    const motions = [];
    const toolpath = new Toolpath({
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });
    const filepath = path.resolve(__dirname, 'fixtures/motion.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toEqual(expectedmotions);
    done();
  });
});

describe('Plane: G17/G18/G19', () => {
  it('should not generate tool paths with wrong plane mode.', (done) => {
    const motions = [];
    const toolpath = new Toolpath({
      modal: {
        plane: 'xx' // The plane is invalid
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });
    const filepath = path.resolve(__dirname, 'fixtures/arc-no-plane.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toHaveLength(0);
    done();
  });

  it('should generate correct tool paths in the XY-plane (G17)', (done) => {
    const expectedmotions = [
      {
        motion: 'G1',
        v1: { x: 0, y: 0, z: 0 },
        v2: { x: 0, y: 20, z: 0 }
      },
      {
        motion: 'G2',
        v1: { x: 0, y: 20, z: 0 },
        v2: { x: 20, y: 0, z: 0 },
        v0: { x: 0, y: 0, z: 0 }
      },
      {
        motion: 'G1',
        v1: { x: 20, y: 0, z: 0 },
        v2: { x: 0, y: 20, z: 0 }
      },
      {
        motion: 'G3',
        v1: { x: 0, y: 20, z: 0 },
        v2: { x: 20, y: 0, z: 0 },
        v0: { x: 0, y: 0, z: 0 }
      }
    ];
    const motions = [];
    const toolpath = new Toolpath({
      modal: {},
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });
    const filepath = path.resolve(__dirname, 'fixtures/arc-xy-plane.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toEqual(expectedmotions);
    done();
  });

  it('should generate correct tool paths in the ZX-plane (G18)', (done) => {
    const expectedmotions = [
      {
        motion: 'G1',
        v1: { x: 0, y: 0, z: 0 },
        v2: { x: 0, y: 0, z: 20 }
      },
      {
        motion: 'G2',
        v1: { x: 20, y: 0, z: 0 },
        v2: { x: 0, y: 20, z: 0 },
        v0: { x: 0, y: 0, z: 0 }
      },
      {
        motion: 'G1',
        v1: { x: 20, y: 0, z: 0 },
        v2: { x: 0, y: 0, z: 20 }
      },
      {
        motion: 'G3',
        v1: { x: 20, y: 0, z: 0 },
        v2: { x: 0, y: 20, z: 0 },
        v0: { x: 0, y: 0, z: 0 }
      }
    ];
    const motions = [];
    const toolpath = new Toolpath({
      modal: {},
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });
    const filepath = path.resolve(__dirname, 'fixtures/arc-zx-plane.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toEqual(expectedmotions);
    done();
  });

  it('should generate correct tool paths in the YZ-plane (G19)', (done) => {
    const expectedmotions = [
      {
        motion: 'G1',
        v1: { x: 0, y: 0, z: 0 },
        v2: { x: 0, y: 0, z: 20 }
      },
      {
        motion: 'G2',
        v1: { x: 0, y: 20, z: 0 },
        v2: { x: 20, y: 0, z: 0 },
        v0: { x: 0, y: 0, z: 0 }
      },
      {
        motion: 'G1',
        v1: { x: 0, y: 20, z: 0 },
        v2: { x: 0, y: 0, z: 20 }
      },
      {
        motion: 'G3',
        v1: { x: 0, y: 20, z: 0 },
        v2: { x: 20, y: 0, z: 0 },
        v0: { x: 0, y: 0, z: 0 }
      }
    ];
    const motions = [];
    const toolpath = new Toolpath({
      modal: {},
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });
    const filepath = path.resolve(__dirname, 'fixtures/arc-yz-plane.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toEqual(expectedmotions);
    done();
  });

});

describe('Units: G20/G21', () => {
  it('should not generate tool paths.', (done) => {
    const motions = [];
    const toolpath = new Toolpath({
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });
    const filepath = path.resolve(__dirname, 'fixtures/units.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toHaveLength(0);
    done();
  });
});

describe('Coordinate: G54/G55/G56/G57/G58/G59', () => {
  it('should not generate tool paths.', (done) => {
    const motions = [];
    const toolpath = new Toolpath({
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });
    const filepath = path.resolve(__dirname, 'fixtures/coordinate.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toHaveLength(0);
    done();
  });
});

describe('Feed Rate: G93/G94', () => {
  it('should not generate tool paths.', (done) => {
    const motions = [];
    const toolpath = new Toolpath({
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2,
          v0: v0
        });
      }
    });
    const filepath = path.resolve(__dirname, 'fixtures/feedrate.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toHaveLength(0);
    done();
  });
});

describe('Tool Change & Tool Select: M6/T', () => {
  it('should change the modal state: t2laser.nc', (done) => {
    const motions = [];
    const toolpath = new Toolpath({
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          tool: modal.tool
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          tool: modal.tool
        });
      }
    });
    const expectedMotions = [
      { "motion": "G0", tool: 1 },
      { "motion": "G0", tool: 1 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 },
      { "motion": "G1", tool: 2 }
    ];

    const filepath = path.resolve(__dirname, 'fixtures/t2laser.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toEqual(expectedMotions);
    done();
  });

  it('should change the modal state: linear.nc', (done) => {
    const expectedMotions = [
      {
        "motion": "G0",
        "tool": 0
      },
      {
        "motion": "G0",
        "tool": 4
      },
      {
        "motion": "G0",
        "tool": 4
      },
      {
        "motion": "G0",
        "tool": 2
      },
      {
        "motion": "G1",
        "tool": 2
      }
    ];
    const motions = [];
    const toolpath = new Toolpath({
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          tool: modal.tool
        });
      },
      addArcCurve: (modal, v1, v2, v0) => {
        motions.push({
          motion: modal.motion,
          tool: modal.tool
        });
      }
    });

    const filepath = path.resolve(__dirname, 'fixtures/linear.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toEqual(expectedMotions);
    done();
  });
});

describe('Temporary Offset: G92', () => {
  it('should generate tool paths with correct endpoints.', (done) => {
    const expectedMotions = [
      {
        "motion": "G0",
        "v1": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "v2": {
          "x": 1,
          "y": 2,
          "z": 3
        }
      },
      {
        "motion": "G0",
        "v1": {
          "x": 1,
          "y": 2,
          "z": 3
        },
        "v2": {
          "x": 2,
          "y": 4,
          "z": 6
        }
      },
      {
        "motion": "G0",
        "v1": {
          "x": 2,
          "y": 4,
          "z": 6
        },
        "v2": {
          "x": 0,
          "y": 0,
          "z": 0
        }
      },
      {
        "motion": "G0",
        "v1": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "v2": {
          "x": 0,
          "y": 0,
          "z": -1
        }
      },
      {
        "motion": "G0",
        "v1": {
          "x": 0,
          "y": 0,
          "z": -1
        },
        "v2": {
          "x": 0,
          "y": 0,
          "z": 0
        }
      },
    ];
    const motions = [];
    const toolpath = new Toolpath({
      modal: {},
      addLine: (modal, v1, v2) => {
        motions.push({
          motion: modal.motion,
          v1: v1,
          v2: v2
        });
      }
    });

    const filepath = path.resolve(__dirname, 'fixtures/g92offset.nc');
    toolpath.loadFromFileSync(filepath);
    expect(motions).toEqual(expectedMotions);
    done();
  });

});

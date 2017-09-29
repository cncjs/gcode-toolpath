import chai from 'chai';
import fs from 'fs';
import { GCodeToolpath } from '../lib/';

const expect = chai.expect;
const should = chai.should();

describe('G-code Toolpath', () => {
    describe('Pass a null value as the first argument', () => {
        const toolpath = new GCodeToolpath();
        it('should call loadFromString\'s callback.', (done) => {
            toolpath.loadFromString(null, (err, results) => {
                expect(err).to.be.equal(null);
                done();
            });
        });
        it('should call loadFromFile\'s callback.', (done) => {
            toolpath.loadFromFile(null, (err, results) => {
                expect(err).not.to.equal(null);
                done();
            });
        });
        it('should call loadFromStream\'s callback.', (done) => {
            toolpath.loadFromStream(null, (err, results) => {
                expect(err).not.to.equal(null);
                done();
            });
        });
    });

    describe('Event listeners', () => {
        it('should call event listeners when loading G-code from file.', (done) => {
            const file = 'test/fixtures/circle.nc';

            new GCodeToolpath()
                .loadFromFile(file, (err, results) => {
                    expect(err).to.be.null;
                    done();
                })
                .on('data', (data) => {
                    expect(data).to.be.an('object');
                })
                .on('end', (results) => {
                    expect(results).to.be.an('array');
                    expect(results.length).to.be.equal(7);
                });
        });

        it('should call event listeners when loading G-code from stream.', (done) => {
            const stream = fs.createReadStream('test/fixtures/circle.nc');

            new GCodeToolpath()
                .loadFromStream(stream, (err, results) => {
                    expect(err).to.be.null;
                    done();
                })
                .on('data', (data) => {
                    expect(data).to.be.an('object');
                })
                .on('end', (results) => {
                    expect(results).to.be.an('array');
                    expect(results.length).to.be.equal(7);
                });
        });

        it('should call event listeners when loading G-code from string.', (done) => {
            const string = fs.readFileSync('test/fixtures/circle.nc', 'utf8');

            new GCodeToolpath()
                .loadFromString(string, (err, results) => {
                    expect(err).to.be.null;
                    done();
                })
                .on('data', (data) => {
                    expect(data).to.be.an('object');
                })
                .on('end', (results) => {
                    expect(results).to.be.an('array');
                    expect(results.length).to.be.equal(7);
                });
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
            const toolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                }
            });

            toolpath.loadFromFileSync('test/fixtures/linear.nc');
            expect(motions).to.deep.equal(expectedMotions);
            done();
        });

    });

    describe('Arc Curve: G2/G3', () => {
        it('should generate tool paths for simple radius.', (done) => {
            const motions = [];
            const toolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });

            toolpath.loadFromFileSync('test/fixtures/arc-r.nc');
            done();
        });

        it('should generate tool paths for helical thread milling.', (done) => {
            const motions = [];
            const toolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });

            toolpath.loadFromFileSync('test/fixtures/helical-thread-milling.nc');
            done();
        });

        it('should generate for one inch circle.', (done) => {
            const motions = [];
            const toolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });

            toolpath.loadFromFileSync('test/fixtures/one-inch-circle.nc');
            done();
        });

    });

    describe('Dwell: G4', () => {
        it('should not generate tool paths.', (done) => {
            const motions = [];
            const toolpath = new GCodeToolpath({
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            toolpath.loadFromFileSync('test/fixtures/dwell.nc');
            expect(motions).to.be.empty;
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
            const toolpath = new GCodeToolpath({
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            toolpath.loadFromFileSync('test/fixtures/motion.nc');
            expect(motions).to.deep.equal(expectedmotions);
            done();
        });
    });

    describe('Plane: G17/G18/G19', () => {
        it('should not generate tool paths with wrong plane mode.', (done) => {
            const motions = [];
            const toolpath = new GCodeToolpath({
                modalState: {
                    plane: 'xx' // The plane is invalid
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            toolpath.loadFromFileSync('test/fixtures/arc-no-plane.nc');
            expect(motions).to.be.empty;
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
            const toolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            toolpath.loadFromFileSync('test/fixtures/arc-xy-plane.nc');
            expect(motions).to.deep.equal(expectedmotions);
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
            const toolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            toolpath.loadFromFileSync('test/fixtures/arc-zx-plane.nc');
            expect(motions).to.deep.equal(expectedmotions);
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
            const toolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            toolpath.loadFromFileSync('test/fixtures/arc-yz-plane.nc');
            expect(motions).to.deep.equal(expectedmotions);
            done();
        });

    });

    describe('Units: G20/G21', () => {
        it('should not generate tool paths.', (done) => {
            const motions = [];
            const toolpath = new GCodeToolpath({
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            toolpath.loadFromFileSync('test/fixtures/units.nc');
            expect(motions).to.be.empty;
            done();
        });
    });

    describe('Coordinate: G54/G55/G56/G57/G58/G59', () => {
        it('should not generate tool paths.', (done) => {
            const motions = [];
            const toolpath = new GCodeToolpath({
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            toolpath.loadFromFileSync('test/fixtures/coordinate.nc');
            expect(motions).to.be.empty;
            done();
        });
    });

    describe('Feed Rate: G93/G94', () => {
        it('should not generate tool paths.', (done) => {
            const motions = [];
            const toolpath = new GCodeToolpath({
                addLine: (modalState, v1, v2) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    motions.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            toolpath.loadFromFileSync('test/fixtures/feedrate.nc');
            expect(motions).to.be.empty;
            done();
        });
    });

});

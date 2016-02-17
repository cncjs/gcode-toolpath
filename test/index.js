import chai from 'chai';
import fs from 'fs';
import { GCodeToolpath } from '../lib/';
import _ from 'lodash';

const expect = chai.expect;
const should = chai.should();

describe('G-code Toolpath', (done) => {
    describe('Pass a null value as the first argument', (done) => {
        let gcodeToolpath = new GCodeToolpath();
        it('should call interpretString\'s callback.', (done) => {
            gcodeToolpath.interpretString(null, (err, results) => {
                expect(err).to.be.okay;
                done();
            });
        });
        it('should call interpretFile\'s callback.', (done) => {
            gcodeToolpath.interpretFile(null, (err, results) => {
                expect(err).to.be.okay;
                done();
            });
        });
        it('should call interpretStream\'s callback.', (done) => {
            gcodeToolpath.interpretStream(null, (err, results) => {
                expect(err).to.be.okay;
                done();
            });
        });
    });

    describe('Event callbacks', (done) => {
        let gcodeToolpath = new GCodeToolpath();
        gcodeToolpath
            .on('data', (data) => {
                expect(data).to.be.an('object');
            })
            .on('end', (results) => {
                expect(results).to.be.an('array');
            });

        it('should call event callbacks.', (done) => {
            gcodeToolpath.interpretFile('test/fixtures/circle.nc', (err, results) => {
                expect(err).to.be.okay;
                done();
            });
        });
    });

    describe('Arc Curve: G02/G03', (done) => {

        it('Simple Radius', (done) => {
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });

            gcodeToolpath.interpretFile('test/fixtures/arc-r.nc', (err, results) => {
                // TODO: Add test case
                done();
            });
        });

        it('Helical Thread Milling', (done) => {
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });

            gcodeToolpath.interpretFile('test/fixtures/helical-thread-milling.nc', (err, results) => {
                // TODO: Add test case
                done();
            });
        });

        it('One inch circle', (done) => {
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });

            gcodeToolpath.interpretFile('test/fixtures/one-inch-circle.nc', (err, results) => {
                // TODO: Add test case
                done();
            });
        });

    });

    describe('Dwell: G4', (done) => {
        it('should not generate tool paths.', (done) => {
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            gcodeToolpath.interpretFile('test/fixtures/dwell.nc', (err, results) => {
                expect(toolpaths).to.be.empty;
                done();
            });
        });
    });

    describe('Motion: G0/G1/G2/G3/G38.2/G38.3/G38.4/G38.5/G80', (done) => {
        it('should generate tool paths for an empty object.', (done) => {
            const expectedToolpaths = [
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
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            gcodeToolpath.interpretFile('test/fixtures/motion.nc', (err, results) => {
                expect(toolpaths).to.deep.equal(expectedToolpaths);
                done();
            });
        });
    });

    describe('Plane: G17/G18/G19', (done) => {

        it('should not generate tool paths with wrong plane mode.', (done) => {
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                modalState: {
                    plane: 'xx' // The plane is invalid
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            gcodeToolpath.interpretFile('test/fixtures/arc-no-plane.nc', (err, results) => {
                expect(toolpaths).to.be.empty;
                done();
            });
        });

        it('should generate correct tool paths in the XY-plane (G17)', (done) => {
            const expectedToolpaths = [
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
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            gcodeToolpath.interpretFile('test/fixtures/arc-xy-plane.nc', (err, results) => {
                expect(toolpaths).to.deep.equal(expectedToolpaths);
                done();
            });
        });

        it('should generate correct tool paths in the ZX-plane (G18)', (done) => {
            const expectedToolpaths = [
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
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            gcodeToolpath.interpretFile('test/fixtures/arc-zx-plane.nc', (err, results) => {
                expect(toolpaths).to.deep.equal(expectedToolpaths);
                done();
            });
        });

        it('should generate correct tool paths in the YZ-plane (G19)', (done) => {
            const expectedToolpaths = [
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
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                modalState: {},
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            gcodeToolpath.interpretFile('test/fixtures/arc-yz-plane.nc', (err, results) => {
                expect(toolpaths).to.deep.equal(expectedToolpaths);
                done();
            });
        });

    });

    describe('Units: G20/G21', (done) => {
        it('should not generate tool paths.', (done) => {
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            gcodeToolpath.interpretFile('test/fixtures/units.nc', (err, results) => {
                expect(toolpaths).to.be.empty;
                done();
            });
        });
    });

    describe('Coordinate: G54/G55/G56/G57/G58/G59', (done) => {
        it('should not generate tool paths.', (done) => {
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            gcodeToolpath.interpretFile('test/fixtures/coordinate.nc', (err, results) => {
                expect(toolpaths).to.be.empty;
                done();
            });
        });
    });

    describe('Feed Rate: G93/G94', (done) => {
        it('should not generate tool paths.', (done) => {
            let toolpaths = [];
            let gcodeToolpath = new GCodeToolpath({
                addLine: (modalState, v1, v2) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2
                    });
                },
                addArcCurve: (modalState, v1, v2, v0) => {
                    toolpaths.push({
                        motion: modalState.motion,
                        v1: v1,
                        v2: v2,
                        v0: v0
                    });
                }
            });
            gcodeToolpath.interpretFile('test/fixtures/feedrate.nc', (err, results) => {
                expect(toolpaths).to.be.empty;
                done();
            });
        });
    });

});

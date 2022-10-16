/**
 * @file block.class.js
 * @version 1.1.0
 * @license MIT License
 * Copyright 2020 Donitz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import Entity from '../core/entity.class.js';
import Options from '../core/options.class.js';

import config from '../resources/config.js';

import * as THREE from '../lib/three.js/three.module.js';

export default class Block extends Entity {
    static _init() {
        Block.p_sideAxes = [['x', 'y', 'z'], ['x', 'y', 'z'], ['x', 'z', 'y'], ['x', 'z', 'y'], ['z', 'y', 'x'], ['z', 'y', 'x']];
        Block.p_sideSign = [[-1, 1, 1], [1, 1, 1], [-1, 1, 1], [-1, -1, 1], [1, 1, 1], [-1, 1, 1]];
        Block.p_sideOffsets = [
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(1, 0, 0)];
        Block._testOffsets = [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8];
        Block._gravityAcceleration = 200;
        Block._minOverlap = 1;
        Block._flipTestTolerance = 1;
    }

    constructor(context, scene, options) {
        options = Options.castIfRequired(options);
        super(context, scene, options);

        this.p_hud = scene.findEntityOfType(Entity.getTypeByName('Hud'));
        this.p_particleSystem = scene.findEntityOfType(Entity.getTypeByName('ParticleSystem'));
        this.p_world = scene.findEntityOfType(Entity.getTypeByName('World'));
        this.p_level = options.get('level');

        if (options.has('sideFrames')) {
            this._sideFrames = options.get('sideFrames');
        } else {
            const frames = [options.get('tileId', 0)];
            this._sideFrames = [
                options.get('sideMinX', true) ? frames : null,
                options.get('sideMaxX', true) ? frames : null,
                options.get('sideMinY', true) ? frames : null,
                options.get('sideMaxY', true) ? frames : null,
                options.get('sideMinZ', true) ? frames : null,
                options.get('sideMaxZ', true) ? frames : null,
            ];
        }

        this.p_flipX = false;
        this.p_flipY = false;
        this._frameIndex = options.get('frameIndex', 0);
        this.p_size = new THREE.Vector3(
            options.get('sizeX', 8),
            options.get('sizeY', 8),
            options.get('sizeZ', 8));
        this.p_solid = options.get('solid', true);
        this.p_static = options.get('static', true);
        this.p_tileIndex = options.get('tileIndex', new THREE.Vector3());
        this.p_useGravity = options.get('useGravity', false);

        const repeatX = options.get('repeatX', 1);
        const repeatY = options.get('repeatY', 1);
        const repeatZ = options.get('repeatZ', 1);

        const margin = new THREE.Vector3(
            options.get('marginX', -4),
            options.get('marginY', -4),
            options.get('marginZ', -4));

        this._blockMeshes = [];

        const blockCollection = this.p_world.getBlockCollection();

        for (let x = 0; x < repeatX; x++) {
            for (let y = 0; y < repeatY; y++) {
                for (let z = 0; z < repeatZ; z++) {
                    const mesh = blockCollection.createBlock();
                    mesh.setSize(16, 16, 16);
                    mesh.setMargin(margin.x, margin.y, margin.z);

                    this._blockMeshes.push({ x, y, z, mesh });
                }
            }
        }

        this._oldPosition = new THREE.Vector3();
        this.p_position = new THREE.Vector3(
            this.p_tileIndex.x * 8 + 4,
            this.p_tileIndex.y * 8 + 4,
            this.p_tileIndex.z * 8 + 4);
        this.p_velocity = new THREE.Vector3();

        this.updatePosition();
        this.updateFrame();
    }

    destroy(context) {
        this._blockMeshes.forEach(block => block.mesh.destroy());

        super.destroy(context);
    }

    update(context) {
        super.update(context);

        if (this.p_static) {
            return;
        }

        if (this.p_useGravity) {
            this.p_velocity.y -= Block._gravityAcceleration * context.elapsedSeconds;
        }

        const dx = this.p_velocity.x * context.elapsedSeconds;
        const dy = this.p_velocity.y * context.elapsedSeconds;
        const dz = this.p_velocity.z * context.elapsedSeconds;

        if (dx !== 0 || dy !== 0 || dz !== 0) {
            this.p_position.x = Math.max(8 + this.p_size.x / 2, Math.min(64 - this.p_size.x / 2, this.p_position.x + dx));
            this.p_position.y = Math.max(8 + this.p_size.y / 2, Math.min(64 - this.p_size.y / 2, this.p_position.y + dy));
            this.p_position.z = Math.max(8 + this.p_size.z / 2, Math.min(64 - this.p_size.z / 2, this.p_position.z + dz));

            this.updatePosition();
        }
    }

    updatePosition() {
        const levelPosition = this.p_level.getPosition();

        this._blockMeshes.forEach(block =>
            block.mesh.setPosition(
                this.p_position.x + block.x * 8 - 36 + levelPosition.x,
                this.p_position.y + block.y * 8 - 36 + levelPosition.y,
                this.p_position.z + block.z * 8 - 36 + levelPosition.z));
    }

    setFrameIndex(value) {
        if (value === this._frameIndex) {
            return;
        }

        this._frameIndex = value;

        this.updateFrame();
    }

    updateFrame() {
        for (let si = 0; si < 6; si++) {
            const flipX = this.p_flipX !== (si % 2 === 0 && si !== 2);
            const flipY = this.p_flipY !== (si === 2);

            let frameIndex;
            if (config.debug.drawColliders) {
                frameIndex = this.p_tileIndex.x === 0 || this.p_tileIndex.x === 8 ||
                    this.p_tileIndex.z === 0 || this.p_tileIndex.z === 8 || !this.p_solid ? 0 : this.p_static ? 7 : 8;
            } else {
                const frames = this._sideFrames === null ? null : this._sideFrames[si];
                frameIndex = frames === null ? 0 : frames[Math.floor(this._frameIndex) % frames.length];
            }

            this._blockMeshes.forEach(block =>
                block.mesh.setTile(frameIndex, 16, 16, flipX, flipY, si));
        }
    }

    trigger(name) {
        if (this._name !== '' && name === this._name && !this.getDestroyed()) {
            this.p_handleTriggered();
        }
    }

    p_handleCollision(context, block, axis, lower) {
    }

    p_handleTriggered() {
    }

    static checkCollisions(context, blocks, side, trySide = false, oldSide = null) {
        const axes = Block.p_sideAxes[side];
        const axis0 = axes[0];
        const axis1 = axes[1];
        const axidDepth = oldSide === null ? null : Block.p_sideAxes[oldSide][2];

        if (trySide) {
            blocks.forEach(block =>
                block._oldPosition.copy(block.p_position));
        }

        let success = true;

        blocks.forEach(blockA => {
            if (blockA.p_static) {
                return;
            }

            let testIndex = -1;

            while (true) {
                let blocked = false;

                blocks.forEach(blockB => {
                    const solidCollision = blockA.p_solid && blockB.p_solid;

                    if (blockA === blockB || trySide && !solidCollision ||
                        blockA.getDestroyed() || blockB.getDestroyed()) {
                        return;
                    }

                    const d0 = blockB.p_position[axis0] - blockA.p_position[axis0];
                    const d1 = blockB.p_position[axis1] - blockA.p_position[axis1];

                    const overlap0 = (blockB.p_size[axis0] + blockA.p_size[axis0]) / 2 - Math.abs(d0);
                    const overlap1 = (blockB.p_size[axis1] + blockA.p_size[axis1]) / 2 - Math.abs(d1);

                    if (overlap0 < 0 ||
                        overlap1 < 0 ||
                        overlap0 < Block._minOverlap &&
                        overlap1 < Block._minOverlap) {
                        return;
                    }

                    if (trySide) {
                        if (overlap0 > Block._flipTestTolerance && overlap1 > Block._flipTestTolerance) {
                            blocked = true;
                        }
                        return;
                    }

                    const f0 = blockB.p_static ? 1 : 0.5;
                    const f1 = 1 - f0;

                    if (overlap1 > overlap0) {
                        const lower = d0 < 0;

                        if (solidCollision) {
                            blockA.p_position[axis0] -= overlap0 * f0 * (1 - lower * 2);
                            blockB.p_position[axis0] += overlap0 * f1 * (1 - lower * 2);

                            blockA.updatePosition();
                            blockB.updatePosition();

                            if (axis0 === 'y') {
                                if (lower) {
                                    blockA.p_velocity[axis0] = 0;
                                } else {
                                    blockB.p_velocity[axis0] = 0;
                                }
                            }
                        }

                        blockA.p_handleCollision(context, blockB, axis0, lower);
                        blockB.p_handleCollision(context, blockA, axis0, !lower);
                    } else {
                        const lower = d1 < 0;

                        if (solidCollision) {
                            blockA.p_position[axis1] -= overlap1 * f0 * (1 - lower * 2);
                            blockB.p_position[axis1] += overlap1 * f1 * (1 - lower * 2);

                            blockA.updatePosition();
                            blockB.updatePosition();

                            if (axis1 === 'y') {
                                if (lower) {
                                    blockA.p_velocity[axis1] = 0;
                                } else {
                                    blockB.p_velocity[axis1] = 0;
                                }
                            }
                        }

                        blockA.p_handleCollision(context, blockB, axis1, lower);
                        blockB.p_handleCollision(context, blockA, axis1, !lower);
                    }
                });

                if (!trySide || !blocked) {
                    break;
                }

                while (++testIndex < Block._testOffsets.length - 1) {
                    const tile = Math.floor(blockA._oldPosition[axidDepth] / 8) + Block._testOffsets[testIndex];
                    if (tile > 0 && tile < 8) {
                        blockA.p_position[axidDepth] = tile * 8 + 4;
                        break;
                    }
                }

                if (testIndex === Block._testOffsets.length - 1) {
                    success = false;
                    break;
                }
            }
        });

        if (trySide && !success) {
            blocks.forEach(block => {
                block.p_position.copy(block._oldPosition);

                block.updatePosition();
            });
        }

        return success;
    }
}

Block._init();
Block.p_register();

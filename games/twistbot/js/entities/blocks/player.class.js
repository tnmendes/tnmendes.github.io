/**
 * @file player.class.js
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

import AudioManager from '../../core/audiomanager.class.js';
import Entity from '../../core/entity.class.js';
import Input from '../../core/input.class.js';
import Options from '../../core/options.class.js';

import Block from '../block.class.js';

import config from '../../resources/config.js';

import * as THREE from '../../lib/three.js/three.module.js';

export default class Player extends Block {
    static _init() {
        Player._tmpV0 = new THREE.Vector3();

        Player._maxVelocity = 40;
        Player._acceleration = 1000;
        Player._deceleration = 1000;
        Player._reactivity = 1;
        Player._climbVelocity = 30;
    }

    constructor(context, scene, options) {
        options = Options.castIfRequired(options);

        const framesSide = [128, 129, 130, 131, 132, 133, 134, 135, 136, 137];
        const framesTop = [144, 145, 146, 147, 148, 149, 150, 151, 152, 153];

        options.set('sideFrames', [
            framesSide, framesSide, null, framesTop, framesSide, framesSide]);

        options.set('marginX', -8);
        options.set('marginY', -8);
        options.set('marginZ', -8);

        super(context, scene, options);

        this._grounded = true;
        this._climbing = false;
        this._timeSinceGrounded = 0;
    }

    update(context) {
        super.update(context);

        const grounded = this._grounded;
        if (!grounded) {
            this._timeSinceGrounded += context.elapsedSeconds;
        } else {
            if (this._timeSinceGrounded > 0.1) {
                AudioManager.play('sound__land');
            }
            this._timeSinceGrounded = 0;
        }
        this._grounded = this.p_position.y < 8 + this.p_size.y + 1;
        const climbing = this._climbing;
        this._climbing = false;

        this.p_useGravity = !climbing;

        const cameraSide = this.p_level.getCameraSide();
        const axes = Block.p_sideAxes[cameraSide];
        const axesSign = Block.p_sideSign[cameraSide];
        const topDown = axes[2] === 'y';

        let frameIndex = grounded || topDown ? 0 : 1;

        axes.forEach((axis, i) => {
            if (axis === 'y' && !climbing) {
                return;
            }

            const sign = axesSign[i];

            const speed = i === 2 ? 0 : sign * (i === 0 ?
                Input.getKey(config.input.keys.left) - Input.getKey(config.input.keys.right) :
                Input.getKey(config.input.keys.up) - Input.getKey(config.input.keys.down));
            const reactivity = Math.sign(speed) !== Math.sign(this.p_velocity[axis]) ? 1 : Player._reactivity;
            const acceleration = Player._acceleration * reactivity;

            if (axis === 'y') {
                this.p_position.y += speed * Player._climbVelocity * context.elapsedSeconds;
                this.p_velocity.y = 0;

                frameIndex = speed === 0 ? 6 : 6 + Math.floor(context.totalSeconds * 10) % 4;

                this.updatePosition();

                this.p_flipY = false;
            } else {
                this.p_velocity[axis] = Math.max(-Player._maxVelocity, Math.min(Player._maxVelocity,
                    speed < 0 ? this.p_velocity[axis] - acceleration * context.elapsedSeconds :
                    speed > 0 ? this.p_velocity[axis] + acceleration * context.elapsedSeconds :
                    this.p_velocity[axis] < 0 ?
                        Math.min(0, this.p_velocity[axis] + Player._deceleration * context.elapsedSeconds) :
                        Math.max(0, this.p_velocity[axis] - Player._deceleration * context.elapsedSeconds)));

                if (speed !== 0) {
                    if (grounded || topDown) {
                        frameIndex = 2 + Math.floor(context.totalSeconds * 10) % 4;
                    }

                    if (axis === 'x') {
                        this.p_flipX = (this.p_velocity[axis] > 0) === !sign;
                    } else {
                        this.p_flipX = (this.p_velocity[axis] < 0) === !sign;
                    }

                    if (topDown) {
                        this.p_flipY = this.p_flipX;
                        this.p_flipX = false;
                    } else {
                        this.p_flipY = false;
                    }
                }
            }
        });

        this.setFrameIndex(frameIndex);
    }

    p_handleCollision(context, block, axis, lower) {
        if (axis === 'y' && lower) {
            this._grounded = true;

            const cameraSide = this.p_level.getCameraSide();
            const axes = Block.p_sideAxes[cameraSide];
            axes.forEach(axis => {
                if (axis !== 'y') {
                    this.p_position[axis] += block.p_velocity[axis];
                }
            });

            this.updatePosition();
        }

        if (block.constructor === Entity.getTypeByName('Mine')) {
            if (!block.getDestroyed()) {
                block.destroy(context);
            }

            if (!this.getDestroyed()) {
                const level = this.p_level;
                setTimeout(() => level.restart(context), 1000);

                const levelPosition = this.p_level.getPosition();

                for (let i = 0; i < 32; i++) {
                    this.p_particleSystem.createExplosion(
                        this.p_position.x - 36 + levelPosition.x - 8 + Math.random() * 16,
                        this.p_position.y - 36 + levelPosition.y - 8 + Math.random() * 16,
                        this.p_position.z - 36 + levelPosition.z - 8 + Math.random() * 16);
                }

                this.destroy(context);

                AudioManager.play('sound__destroyed');
            }
        }

        if (block.constructor === Entity.getTypeByName('Ladder') &&
            block.getLadderSide() === this.p_level.getCameraSide()) {
            this._climbing = true;

            this.p_hud.setUpperRightText(String.fromCharCode(130) + String.fromCharCode(131));
        }
    }
}

Player._init();
Player.p_register();

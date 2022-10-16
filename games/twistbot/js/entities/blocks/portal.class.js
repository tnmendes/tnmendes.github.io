/**
 * @file portal.class.js
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
import Options from '../../core/options.class.js';

import Block from '../block.class.js';

import * as THREE from '../../lib/three.js/three.module.js';

export default class Portal extends Block {
    constructor(context, scene, options) {
        options = Options.castIfRequired(options);

        const framesSide = [192, 193, 194, 195, 196, 197];
        const framesTop = [198, 198, 198, 198, 198, 198];

        options.set('sideFrames', [
            framesSide, framesSide, null, framesTop, framesSide, framesSide]);

        const portalType = options.get('portalType');

        options.set('frameIndex', portalType === 'entrance' ? 0 : 5);

        super(context, scene, options);

        this._instant = options.get('instant');
        this._portalType = portalType;

        this._entered = false;
        this._time = 0;
    }

    update(context) {
        super.update(context);

        if (this._portalType === 'entrance') {
            if (this._instant) {
                this._spawnPlayer(context);

                this.destroy(context);
                return;
            }

            if (this._time === 0) {
                AudioManager.play('sound__lift');
            }

            const lastTime = this._time;
            this._time += context.elapsedSeconds;

            if (lastTime < 1 && this._time >= 1) {
                this._spawnPlayer(context);
                this.setFrameIndex(5);
            }

            this.p_position.set(
                this.p_tileIndex.x * 8 + 4,
                this.p_tileIndex.y * 8 - 4 - Math.cos(this._time * Math.PI) * 8,
                this.p_tileIndex.z * 8 + 4);

            this.updatePosition();

            if (this._time > 2) {
                this.destroy(context);
            }

            return;
        }

        if (!this._entered) {
            this.setFrameIndex(1 + Math.floor(context.totalSeconds * 5) % 4);

            return;
        }

        this._time += context.elapsedSeconds;

        this.p_position.set(
            this.p_tileIndex.x * 8 + 4,
            this.p_tileIndex.y * 8 + 4 + this._time * 12,
            this.p_tileIndex.z * 8 + 4);

        this.updatePosition();

        if (this._time > 1) {
            this.destroy(context);

            this.p_world.nextLevel(context);
        }
    }

    _spawnPlayer(context) {
        this.p_level.addBlock(Entity.createByName('Player', context, this.getScene(), {
            level: this.p_level,
            tileIndex: this.p_tileIndex.clone(),
            margin: new THREE.Vector3(-8, -8, -8),
            static: false,
            useGravity: true,
        }));
    }

    p_handleCollision(context, block, axis, lower) {
        if (this._portalType === 'entrance' || this._entered) {
            return;
        }

        if (block.constructor === Entity.getTypeByName('Player')) {
            if (!block.getDestroyed()) {
                block.destroy(context);

                this._entered = true;

                this.setFrameIndex(0);

                AudioManager.play('sound__lift');
            }
        }
    }
}

Portal.p_register();

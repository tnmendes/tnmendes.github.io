/**
 * @file lift.class.js
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

import Entity from '../../core/entity.class.js';
import Options from '../../core/options.class.js';

import Block from '../block.class.js';

export default class Lift extends Block {
    constructor(context, scene, options) {
        options = Options.castIfRequired(options);

        const customFrames = options.get('customFrames', false);

        if (!customFrames) {
            const xzFrames = [53, 54, 55, 56, 57];
            const yFrames = [48, 49, 50, 51, 52];

            options.set('sideFrames', [
                xzFrames, xzFrames, yFrames, yFrames, xzFrames, xzFrames]);
        }

        super(context, scene, options);

        this._customFrames = customFrames;
        this._name = options.get('name');
        this._enabled = options.get('enabled');
        this._pathLoop = options.get('pathLoop');
        this._pathOneWay = options.get('pathOneWay');
        this._pathSpeed = options.get('pathSpeed');
        this._triggerName = options.get('triggerName');

        const pathSidesString = options.get('pathSides');
        const pathSides = pathSidesString.trim() === '' ? [] : pathSidesString.split(',').map(s => parseInt(s));

        const tileIndex = this.p_tileIndex.clone();
        this._path = [tileIndex.clone()].concat(pathSides.map(side =>
            tileIndex.add(Block.p_sideOffsets[side]).clone()));

        this._distance = 0;
        this._reverse = false;
    }

    update(context) {
        super.update(context);

        if (this._enabled) {
            if (this._reverse) {
                this._distance = Math.max(0, this._distance - this._pathSpeed * context.elapsedSeconds);
                if (this._distance === 0) {
                    this._reverse = !this._reverse;
                    this._enabled = this._pathLoop;
                    this._trigger(context);
                }
            } else {
                const max = this._path.length - 1;
                this._distance = Math.min(max, this._distance + this._pathSpeed * context.elapsedSeconds);
                if (this._distance === max) {
                    if (this._pathOneWay) {
                        this._distance = 0;
                    } else {
                        this._reverse = !this._reverse;
                    }
                    this._enabled = this._pathLoop;
                    this._trigger(context);
                }
            }

            const i0 = Math.min(this._path.length - 1, Math.floor(this._distance));
            const i1 = Math.min(this._path.length - 1, i0 + 1);

            const p0 = this._path[i0];
            const p1 = this._path[i1];

            const t = this._distance % 1;

            const lastX = this.p_position.x;
            const lastY = this.p_position.y;
            const lastZ = this.p_position.z;

            this.p_position.set(
                (p0.x * (1 - t) + p1.x * t) * 8 + 4,
                (p0.y * (1 - t) + p1.y * t) * 8 + 4,
                (p0.z * (1 - t) + p1.z * t) * 8 + 4);

            this.p_velocity.set(
                this.p_position.x - lastX,
                this.p_position.y - lastY,
                this.p_position.z - lastZ);

            this.updatePosition();
        }

        if (!this._customFrames) {
            this.setFrameIndex(this._enabled ?
                1 + Math.floor(context.totalSeconds * 10) % 4 : 0);
        }
    }

    p_handleTriggered() {
        this._enabled = !this._enabled;
    }

    _trigger(context) {
        this.p_level.getBlocks().forEach(block =>
            block.trigger(this._triggerName));
    }
}

Lift.p_register();

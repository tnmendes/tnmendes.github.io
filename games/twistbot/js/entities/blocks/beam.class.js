/**
 * @file beam.class.js
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

import * as THREE from '../../lib/three.js/three.module.js';

export default class Beam extends Block {
    constructor(context, scene, options) {
        options = Options.castIfRequired(options);

        const beamSide = options.get('beamSide');

        const framesSide = [0, 68, 69, 70, 71];
        const framesSideRotated = [0, 72, 73, 74, 75];
        const framesFront = [0, 76, 77, 78, 79];

        options.set('sideFrames', [
            beamSide === 4 || beamSide === 5 ? framesFront : beamSide === 2 || beamSide === 3 ? framesSideRotated : framesSide,
            beamSide === 4 || beamSide === 5 ? framesFront : beamSide === 2 || beamSide === 3 ? framesSideRotated : framesSide,
            beamSide === 2 || beamSide === 3 ? framesFront : beamSide === 4 || beamSide === 5 ? framesSideRotated : framesSide,
            beamSide === 2 || beamSide === 3 ? framesFront : beamSide === 4 || beamSide === 5 ? framesSideRotated : framesSide,
            beamSide === 0 || beamSide === 1 ? framesFront : beamSide === 2 || beamSide === 3 ? framesSideRotated : framesSide,
            beamSide === 0 || beamSide === 1 ? framesFront : beamSide === 2 || beamSide === 3 ? framesSideRotated : framesSide]);

        options.set('size', new THREE.Vector3(2, 2, 2));
        options.set('static', true);

        super(context, scene, options);

        this._beamCaster = options.get('beamCaster');
        this._previousBeam = options.get('previousBeam');

        this._enabled = false;
    }

    update(context) {
        super.update(context);

        this._enabled = false;

        if (this._previousBeam === null ? this._beamCaster.isEnabled() : this._previousBeam._enabled) {
            this._enabled = true;

            this.p_level.getBlocks().forEach(block => {
                if (block === this || !block.p_static || !block.p_solid) {
                    return;
                }

                const dX = block.p_position.x - this.p_position.x;
                const dY = block.p_position.y - this.p_position.y;
                const dZ = block.p_position.z - this.p_position.z;

                const overlapX = (block.p_size.x + this.p_size.x) / 2 - Math.abs(dX);
                const overlapY = (block.p_size.y + this.p_size.y) / 2 - Math.abs(dY);
                const overlapZ = (block.p_size.z + this.p_size.z) / 2 - Math.abs(dZ);

                if (overlapX > 2 && overlapY > 2 && overlapZ > 2) {
                    this._enabled = false;
                }
            });
        }

        this.setFrameIndex(this._enabled ? 1 + Math.floor(context.totalSeconds * 10) % 4 : 0);

        this.p_solid = this._enabled;
    }
}

Beam.p_register();

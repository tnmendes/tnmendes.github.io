/**
 * @file beamcaster.class.js
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

export default class BeamCaster extends Block {
    constructor(context, scene, options) {
        options = Options.castIfRequired(options);

        const beamSide = options.get('beamSide');

        const framesSide = [65];
        const framesSideRotated = [66];
        const framesFront = [64];

        options.set('sideFrames', [
            beamSide === 4 || beamSide === 5 ? framesFront : beamSide === 2 || beamSide === 3 ? framesSideRotated : framesSide,
            beamSide === 4 || beamSide === 5 ? framesFront : beamSide === 2 || beamSide === 3 ? framesSideRotated : framesSide,
            beamSide === 2 || beamSide === 3 ? framesFront : beamSide === 4 || beamSide === 5 ? framesSideRotated : framesSide,
            beamSide === 2 || beamSide === 3 ? framesFront : beamSide === 4 || beamSide === 5 ? framesSideRotated : framesSide,
            beamSide === 0 || beamSide === 1 ? framesFront : beamSide === 2 || beamSide === 3 ? framesSideRotated : framesSide,
            beamSide === 0 || beamSide === 1 ? framesFront : beamSide === 2 || beamSide === 3 ? framesSideRotated : framesSide]);

        super(context, scene, options);

        const sideOffset = Block.p_sideOffsets[beamSide];

        let previousBeam = null;
        for (let i = 1; i < 8; i++) {
            const beamTileIndex = new THREE.Vector3(
                this.p_tileIndex.x + sideOffset.x * i,
                this.p_tileIndex.y + sideOffset.y * i,
                this.p_tileIndex.z + sideOffset.z * i);
            if (beamTileIndex.x < 1 || beamTileIndex.y < 1 || beamTileIndex.z < 1 ||
                beamTileIndex.x > 7 || beamTileIndex.y > 7 || beamTileIndex.z > 7) {
                continue;
            }
            previousBeam = Entity.createByName('Beam', context, scene, {
                updatePriority: i / 100,
                level: this.p_level,
                beamCaster: this,
                beamSide,
                previousBeam,
                tileIndex: beamTileIndex,
            });
            this.p_level.addBlock(previousBeam);
        }

        this._name = options.get('name');
        this._enabled = options.get('enabled');
    }

    p_handleTriggered() {
        this._enabled = !this._enabled;
    }

    isEnabled() {
        return this._enabled;
    }
}

BeamCaster.p_register();

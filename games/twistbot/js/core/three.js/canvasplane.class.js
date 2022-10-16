/**
 * @file canvasplane.class.js
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

import * as THREE from '../../lib/three.js/three.module.js';

export default class CanvasPlane extends THREE.Mesh {
    constructor(resolutionX, resolutionY, scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0) {
        const canvas = document.createElement('canvas');
        canvas.width = resolutionX;
        canvas.height = resolutionY;

        const geometry = new THREE.PlaneGeometry(resolutionX, resolutionY);
        geometry.translate(resolutionX / 2 + offsetX, resolutionY / 2 + offsetY, 0);
        geometry.scale(scaleX, scaleY, 1);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
            transparent: true,
        });

        super(geometry, material);

        this._ctx2d = canvas.getContext('2d');
    }

    getContext2D() {
        return this._ctx2d;
    }

    updateTexture() {
        this.material.map.needsUpdate = true;
    }
}

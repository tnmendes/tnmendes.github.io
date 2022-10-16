/**
 * @file blockcollection.class.js
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

export default class BlockCollection extends THREE.Mesh {
    constructor(material, maxBlocks = 1024) {
        const geometry = new THREE.BufferGeometry();

        super(geometry, material);

        this._bufferPosition = new THREE.BufferAttribute(new Float32Array(maxBlocks * 6 * 6 * 3), 3);
        this._bufferUv = new THREE.BufferAttribute(new Float32Array(maxBlocks * 6 * 6 * 2), 2);

        this._bufferPosition.usage = THREE.DynamicDrawUsage;
        this._bufferUv.usage = THREE.DynamicDrawUsage;

        geometry.setAttribute('position', this._bufferPosition);
        geometry.setAttribute('uv', this._bufferUv);

        this.frustumCulled = false;

        const corners = [
            new THREE.Vector3(-1, -1, -1), new THREE.Vector3(-1, -1, +1), new THREE.Vector3(-1, +1, -1),
            new THREE.Vector3(-1, +1, +1), new THREE.Vector3(-1, +1, -1), new THREE.Vector3(-1, -1, +1),

            new THREE.Vector3(+1, -1, +1), new THREE.Vector3(+1, -1, -1), new THREE.Vector3(+1, +1, +1),
            new THREE.Vector3(+1, +1, -1), new THREE.Vector3(+1, +1, +1), new THREE.Vector3(+1, -1, -1),

            new THREE.Vector3(-1, -1, +1), new THREE.Vector3(-1, -1, -1), new THREE.Vector3(+1, -1, +1),
            new THREE.Vector3(+1, -1, -1), new THREE.Vector3(+1, -1, +1), new THREE.Vector3(-1, -1, -1),

            new THREE.Vector3(-1, +1, -1), new THREE.Vector3(-1, +1, +1), new THREE.Vector3(+1, +1, -1),
            new THREE.Vector3(+1, +1, +1), new THREE.Vector3(+1, +1, -1), new THREE.Vector3(-1, +1, +1),

            new THREE.Vector3(+1, -1, -1), new THREE.Vector3(-1, -1, -1), new THREE.Vector3(+1, +1, -1),
            new THREE.Vector3(-1, +1, -1), new THREE.Vector3(+1, +1, -1), new THREE.Vector3(-1, -1, -1),

            new THREE.Vector3(-1, -1, +1), new THREE.Vector3(+1, -1, +1), new THREE.Vector3(-1, +1, +1),
            new THREE.Vector3(+1, +1, +1), new THREE.Vector3(-1, +1, +1), new THREE.Vector3(+1, -1, +1),
        ];

        const normals = [
            new THREE.Vector3(-1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(-1, 0, 0),

            new THREE.Vector3(+1, 0, 0), new THREE.Vector3(+1, 0, 0), new THREE.Vector3(+1, 0, 0),
            new THREE.Vector3(+1, 0, 0), new THREE.Vector3(+1, 0, 0), new THREE.Vector3(+1, 0, 0),

            new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -1, 0),
            new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -1, 0),

            new THREE.Vector3(0, +1, 0), new THREE.Vector3(0, +1, 0), new THREE.Vector3(0, +1, 0),
            new THREE.Vector3(0, +1, 0), new THREE.Vector3(0, +1, 0), new THREE.Vector3(0, +1, 0),

            new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, -1),

            new THREE.Vector3(0, 0, +1), new THREE.Vector3(0, 0, +1), new THREE.Vector3(0, 0, +1),
            new THREE.Vector3(0, 0, +1), new THREE.Vector3(0, 0, +1), new THREE.Vector3(0, 0, +1),
        ];

        const uvCoords = [
            new THREE.Vector2(-1, -1), new THREE.Vector2(+1, -1), new THREE.Vector2(-1, +1),
            new THREE.Vector2(+1, +1), new THREE.Vector2(-1, +1), new THREE.Vector2(+1, -1),

            new THREE.Vector2(-1, -1), new THREE.Vector2(+1, -1), new THREE.Vector2(-1, +1),
            new THREE.Vector2(+1, +1), new THREE.Vector2(-1, +1), new THREE.Vector2(+1, -1),

            new THREE.Vector2(-1, -1), new THREE.Vector2(+1, -1), new THREE.Vector2(-1, +1),
            new THREE.Vector2(+1, +1), new THREE.Vector2(-1, +1), new THREE.Vector2(+1, -1),

            new THREE.Vector2(+1, +1), new THREE.Vector2(-1, +1), new THREE.Vector2(+1, -1),
            new THREE.Vector2(-1, -1), new THREE.Vector2(+1, -1), new THREE.Vector2(-1, +1),

            new THREE.Vector2(-1, -1), new THREE.Vector2(+1, -1), new THREE.Vector2(-1, +1),
            new THREE.Vector2(+1, +1), new THREE.Vector2(-1, +1), new THREE.Vector2(+1, -1),

            new THREE.Vector2(-1, -1), new THREE.Vector2(+1, -1), new THREE.Vector2(-1, +1),
            new THREE.Vector2(+1, +1), new THREE.Vector2(-1, +1), new THREE.Vector2(+1, -1),
        ];

        this._pool = Array.from({ length: maxBlocks }, (_, i) => {
            const vi = i * 6 * 6;

            const position = new THREE.Vector3();
            const size = new THREE.Vector3();
            const margin = new THREE.Vector3();

            const updatePosition = () => corners.forEach((offset, ci) => {
                const normal = normals[ci];

                this._bufferPosition.setXYZ(
                    vi + ci,
                    position.x + size.x / 2 * offset.x + normal.x * margin.x,
                    position.y + size.y / 2 * offset.y + normal.y * margin.y,
                    position.z + size.z / 2 * offset.z + normal.z * margin.z);

                this._bufferPosition.needsUpdate = true;
            });

            const block = {
                setPosition: (x, y, z) => {
                    position.set(x, y, z);

                    updatePosition();
                },
                setSize: (x, y, z) => {
                    size.set(x, y, z);

                    updatePosition();
                },
                setMargin: (x, y, z) => {
                    margin.set(x, y, z);

                    updatePosition();
                },
                setTile: (index, columns = 16, rows = 16, flipX = false, flipY = false, side = null) => {
                    block.setUv(
                        ((index % columns) + flipX) / columns,
                        (rows - 1 - Math.floor((index + 0.5) / columns) + flipY) / rows,
                        (1 - flipX * 2) / columns,
                        (1 - flipY * 2) / rows, side);
                },
                setUv: (u, v, width, height, side = null) => {
                    const length = side === null ? 36 : side * 6 + 6;
                    for (let ci = side === null ? 0 : side * 6; ci < length; ci++) {
                        const uv = uvCoords[ci];
                        this._bufferUv.setXY(
                            vi + ci,
                            u + width / 2 * (1 + uv.x),
                            v + height / 2 * (1 + uv.y));
                    }

                    this._bufferUv.needsUpdate = true;
                },
                destroy: () => {
                    position.set(0, 0, 0);
                    size.set(0, 0, 0);
                    margin.set(0, 0, 0);

                    updatePosition();

                    this._pool.push(block);
                },
            };

            return block;
        });

        this._pool.forEach(block => block.setSize(1, 1, 1));
        geometry.computeVertexNormals();
        this._pool.forEach(block => block.setSize(0, 0, 0));
    }

    createBlock() {
        const block = this._pool.pop();
        if (block === undefined) {
            throw new Error('Max blocks exceeded');
        }
        return block;
    }

    dispose() {
        this.geometry.dispose();
    }
}

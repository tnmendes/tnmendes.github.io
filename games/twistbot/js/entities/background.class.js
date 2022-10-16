/**
 * @file background.class.js
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

import * as THREE from '../lib/three.js/three.module.js';

export default class Background extends Entity {
    static _init() {
        Background._radius = 64;
        Background._bubbleCount = 32;
        Background._fishCount = 16;
    }

    constructor(context, scene, options) {
        options = Options.castIfRequired(options);
        super(context, scene, options);

        this._levelCamera = scene.findEntityOfType(Entity.getTypeByName('LevelCamera'));

        const world = scene.findEntityOfType(Entity.getTypeByName('World'));
        this._blockCollection = world.getBlockCollection();

        this._particles = [];

        for (let i = 0; i < Background._bubbleCount + Background._fishCount; i++) {
            const isBubble = i < Background._bubbleCount;
            const facingLeft = (i % 4) < 2;
            const velocity = new THREE.Vector2(
                !isBubble * (6 + (i % 4)) * (1 - facingLeft * 2) * 0.05,
                isBubble * (5 + (i % 5)));
            const tileIndex = (isBubble ? 242 : 240) + (i % 2);

            const mesh = this._blockCollection.createBlock();
            mesh.setSize(16, 16, 16);
            mesh.setMargin(-8, -8, -8);
            mesh.setTile(tileIndex, 16, 16, facingLeft, false, 0);
            mesh.setTile(tileIndex, 16, 16, facingLeft, false, 1);
            mesh.setTile(tileIndex, 16, 16, facingLeft, false, 4);
            mesh.setTile(tileIndex, 16, 16, facingLeft, false, 5);

            this._particles.push({
                position: new THREE.Vector2(
                    Math.random() * Math.PI * 2,
                    Math.random() * 64),
                velocity,
                mesh,
            });
        }
    }

    update(context) {
        super.update(context);

        const camera = this._levelCamera.getCamera();
        const minY = camera.position.y + camera.bottom - 8;
        const maxY = camera.position.y + camera.top + 8;

        this._particles.forEach(particle => {
            particle.position.x += particle.velocity.x * context.elapsedSeconds;
            particle.position.y += particle.velocity.y * context.elapsedSeconds;

            if (particle.position.y > maxY) {
                particle.position.x = Math.random() * Math.PI * 2;
                particle.position.y -= 64 + Math.random() * 16;
            }
            if (particle.position.y < minY) {
                particle.position.x = Math.random() * Math.PI * 2;
                particle.position.y += 64 + Math.random() * 16;
            }

            particle.mesh.setPosition(
                Math.cos(particle.position.x) * Background._radius,
                particle.position.y,
                Math.sin(particle.position.x) * Background._radius);
        });
    }
}

Background._init();
Background.p_register();

/**
 * @file particlesystem.class.js
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

export default class ParticleSystem extends Entity {
    static _init() {
        ParticleSystem._explosionFrames = [224, 225, 226, 227, 228, 229, 230];
    }

    constructor(context, scene, options) {
        options = Options.castIfRequired(options);

        options.set('updatePriority', -2);

        super(context, scene, options);

        const world = scene.findEntityOfType(Entity.getTypeByName('World'));
        this._blockCollection = world.getBlockCollection();

        this._particles = [];
        this._particlePool = [];
    }

    update(context) {
        super.update(context);

        for (let i = this._particles.length - 1; i > -1; i--) {
            const p = this._particles[i];

            p.currentTime += context.elapsedSeconds;

            const frameIndex = Math.min(p.frames.length - 1, Math.floor(p.currentTime / p.lifetime * p.frames.length));

            if (p.currentTime > p.lifetime) {
                p.mesh.destroy();

                this._particles.splice(i, 1);
                this._particlePool.push(p);
            } else {
                p.mesh.setTile(p.frames[frameIndex], 16, 16);
            }
        }
    }

    _prepareMesh(particle, x, y, z) {
        const mesh = this._blockCollection.createBlock();
        mesh.setPosition(x, y, z);
        mesh.setSize(16, 16, 16);
        mesh.setMargin(-8, -8, -8);
        particle.mesh = mesh;
    }

    createExplosion(x, y, z) {
        const p = this._particlePool.pop() || {};
        this._particles.push(p);

        p.lifetime = 0.3 + Math.random() * 0.6;
        p.currentTime = 0;
        p.frames = ParticleSystem._explosionFrames;

        this._prepareMesh(p, x, y, z);
    }
}

ParticleSystem._init();
ParticleSystem.p_register();

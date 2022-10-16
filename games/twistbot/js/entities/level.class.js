/**
 * @file level.class.js
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

import AudioManager from '../core/audiomanager.class.js';
import Entity from '../core/entity.class.js';
import Input from '../core/input.class.js';
import Options from '../core/options.class.js';

import Block from './block.class.js';

import config from '../resources/config.js';

import * as THREE from '../lib/three.js/three.module.js';

export default class Level extends Entity {
    constructor(context, scene, options) {
        options = Options.castIfRequired(options);

        options.set('updatePriority', -1);

        super(context, scene, options);

        const tScene = scene.getThreeScene();

        this._position = new THREE.Vector3(0, options.get('height'), 0);

        this._blockDefs = options.get('blockDefs');
        this._blocks = [];

        this._hud = scene.findEntityOfType(Entity.getTypeByName('Hud'));
        this._world = scene.findEntityOfType(Entity.getTypeByName('World'));
        this._camera = scene.findEntityOfType(Entity.getTypeByName('LevelCamera'));

        this._cameraSides = options.get('cameraSides');
        this._cameraSideIndex = null;
        this._flipText = options.get('flipChar').map(c => String.fromCharCode(c) + 'x');

        this._cameraMode = options.get('cameraMode', null);

        this._blockedTimer = 0;

        this._isTitle = options.get('isTitle', false);
        this._isEnding = options.get('isEnding', false);

        if (this._isEnding) {
            scene.findEntityOfType(Entity.getTypeByName('Background')).destroy(context);

            const geometry = new THREE.BoxGeometry(200, 1000, 200);
            const material = new THREE.MeshBasicMaterial({color: 0x8984c6, side: THREE.DoubleSide });
            const sky = new THREE.Mesh(geometry, material);
            sky.position.copy(this._position);
            sky.position.y += 480;
            tScene.add(sky);

            this._world.setEndingLight();
        }
    }

    destroy(context) {
        this._blocks.forEach(block => {
            if (!block.getDestroyed()) {
                block.destroy(context);
            }
        });

        super.destroy(context);
    }

    update(context) {
        super.update(context);

        const cameraSide = this._cameraSides[this._cameraSideIndex];
        Block.checkCollisions(context, this._blocks, cameraSide);

        if (this._cameraSides.length > 1) {
            if (Input.getKeyDown(config.input.keys.x) &&
                this._blocks.some(block => block.constructor.name === 'Player')) {
                this._tryFlip(context);
            }

            this._hud.setUpperLeftText(this._flipText[this._cameraSideIndex]);
        }

        this._blockedTimer -= context.elapsedSeconds;
        if (this._blockedTimer > 0) {
            this._hud.setUpperLeftText('blocked');
        }

        if (this._isTitle) {
            this._hud.setUpperLeftText('twistbot');
            this._hud.setCenterText('press x');

            if (Input.getKeyDown(config.input.keys.x)) {
                this._world.nextLevel(context, 0);

                this._isTitle = false;

                AudioManager.play('sound__click');
            }
        }

        if (this._isEnding) {
            this._hud.setCenterText('freedom');
        }
    }

    _tryFlip(context, force = false) {
        const oldCameraSide = this._cameraSides[this._cameraSideIndex];
        const cameraSideIndex = (this._cameraSideIndex + 1) % this._cameraSides.length;
        const cameraSide = this._cameraSides[cameraSideIndex];

        const success = force || Block.checkCollisions(context, this._blocks, cameraSide, true, oldCameraSide);

        if (success) {
            this._cameraSideIndex = cameraSideIndex;
            this._camera.moveToSide(this._position, cameraSide, 0.5);

            if (!force) {
                AudioManager.play('sound__flip');
            }
        } else {
            this._blockedTimer = 0.5;
        }
    }

    getBlocks() {
        return this._blocks;
    }

    getPosition() {
        return this._position;
    }

    getCameraSide() {
        return this._cameraSides[this._cameraSideIndex];
    }

    addBlock(block) {
        this._blocks.push(block);
    }

    restart(context) {
        this._blocks.forEach(block => {
            if (!block.getDestroyed()) {
                block.destroy(context);
            }
        });
        this._blocks.length = 0;

        this._blockDefs.forEach(def => {
            const options = new Options(def.options);
            options.set('level', this);
            this.addBlock(new def.type(context, this.getScene(), options))
        });

        this._cameraSideIndex = -1;
        this._tryFlip(context, true);
        this._camera.startMode(this._cameraMode);
    }
}

Level.p_register();

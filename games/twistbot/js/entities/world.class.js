/**
 * @file world.class.js
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
import ImageManager from '../core/imagemanager.class.js';
import Options from '../core/options.class.js';

import BlockCollection from '../core/three.js/blockcollection.class.js';

import LevelManager from '../core/game/levelmanager.class.js';

import * as THREE from '../lib/three.js/three.module.js';

export default class World extends Entity {
    static _init() {
        World._levelOptions = [{
            indices: [2],
            height: 0,
            cameraSides: [0],
            flipChar: [],
            isTitle: true,
        }, {
            indices: [5],
            height: 0,
            cameraSides: [0],
            flipChar: [],
        }, {
            indices: [6],
            height: 64,
            cameraSides: [0],
            flipChar: [],
        }, {
            indices: [7],
            height: 128,
            cameraSides: [0],
            flipChar: [],
        }, {
            indices: [0],
            height: 192,
            cameraSides: [0],
            flipChar: [],
            cameraMode: 'elevator-nospin',
        }, {
            indices: [1, 8],
            height: 320,
            cameraSides: [0, 5],
            flipChar: [129, 128],
        }, {
            indices: [0],
            height: 384,
            cameraSides: [0],
            flipChar: [],
            cameraMode: 'elevator',
        }, {
            indices: [1, 9],
            height: 512,
            cameraSides: [0, 5],
            flipChar: [129, 128],
        }, {
            indices: [0],
            height: 576,
            cameraSides: [0],
            flipChar: [],
            cameraMode: 'elevator',
        }, {
            indices: [1, 10],
            height: 704,
            cameraSides: [0, 5],
            flipChar: [129, 128],
        }, {
            indices: [0],
            height: 768,
            cameraSides: [0],
            flipChar: [],
            cameraMode: 'elevator',
        }, {
            indices: [1, 11],
            height: 896,
            cameraSides: [0, 5],
            flipChar: [129, 128],
        }, {
            indices: [0],
            height: 960,
            cameraSides: [0],
            flipChar: [],
            cameraMode: 'elevator',
        }, {
            indices: [1, 12],
            height: 1088,
            cameraSides: [0, 3],
            flipChar: [130, 131],
        }, {
            indices: [0],
            height: 1152,
            cameraSides: [0],
            flipChar: [],
            cameraMode: 'elevator',
        }, {
            indices: [1, 13],
            height: 1280,
            cameraSides: [0, 5],
            flipChar: [129, 128],
        }, {
            indices: [0],
            height: 1344,
            cameraSides: [0],
            flipChar: [],
            cameraMode: 'elevator',
        }, {
            indices: [14],
            height: 1472,
            cameraSides: [0],
            flipChar: [],
            isEnding: true,
            cameraMode: 'spinning',
        }];
    }

    constructor(context, scene, options) {
        options = Options.castIfRequired(options);
        super(context, scene, options);

        const tScene = scene.getThreeScene();

        const textureDiffuse = ImageManager.getThreeTexture('tileset_diffuse');
        const textureBump = ImageManager.getThreeTexture('tileset_bump');
        const textureRoughness = ImageManager.getThreeTexture('tileset_roughness');
        const textureEmissive = ImageManager.getThreeTexture('tileset_emissive');

        textureDiffuse.magFilter = THREE.NearestFilter;
        textureDiffuse.minFilter = THREE.NearestFilter;
        textureBump.magFilter = THREE.NearestFilter;
        textureBump.minFilter = THREE.NearestFilter;
        textureRoughness.magFilter = THREE.NearestFilter;
        textureRoughness.minFilter = THREE.NearestFilter;
        textureEmissive.magFilter = THREE.NearestFilter;
        textureEmissive.minFilter = THREE.NearestFilter;

        const materialBlocks = new THREE.MeshStandardMaterial({
            map: textureDiffuse,
            bumpMap: textureBump,
            bumpScale: 1,
            emissiveMap: textureEmissive,
            roughnessMap: textureRoughness,
            transparent: true,
            alphaTest: 0.5,
        });

        this._blockCollection = new BlockCollection(materialBlocks, 1024);
        this._blockCollection.name = 'BlockCollection';
        tScene.add(this._blockCollection);

        this._lightDirectionalA = new THREE.DirectionalLight(0x5555ff, 0.8);
        this._lightDirectionalA.name = 'LightDirectional';
        this._lightDirectionalA.position.set(1, 1, 1);
        tScene.add(this._lightDirectionalA);

        this._lightDirectionalB = new THREE.DirectionalLight(0xff5555, 1.2);
        this._lightDirectionalB.name = 'LightDirectional';
        this._lightDirectionalB.position.set(-1, 1, -1);
        tScene.add(this._lightDirectionalB);

        this._lightAmbient = new THREE.AmbientLight(0xffffff, 0.3);
        this._lightAmbient.name = 'LightAmbient';
        tScene.add(this._lightAmbient);

        this._levelIndex = -1;
        this._level = null;
    }

    getBlockCollection() {
        return this._blockCollection;
    }

    nextLevel(context, destroyDelay = 3) {
        if (this._level !== null) {
            const level = this._level;
            setTimeout(() => level.destroy(context), destroyDelay * 1000);
        }

        this._levelIndex++;

        const options = World._levelOptions[this._levelIndex];

        this._level = LevelManager.createLevel(context, options.indices, this.getScene(), options);
        this._level.restart(context);
    }

    setEndingLight() {
        this._lightDirectionalA.color.setHex(0xffffff);
        this._lightDirectionalB.color.setHex(0xffffff);
    }
}

World._init();
World.p_register();

/**
 * @file levelcamera.class.js
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

import CanvasPlane from '../core/three.js/canvasplane.class.js';
import OutlineMaterial from '../core/three.js/outlinematerial.class.js';

import * as THREE from '../lib/three.js/three.module.js';

export default class LevelCamera extends Entity {
    static _init() {
        LevelCamera._tmpEuler = new THREE.Euler();
    }

    constructor(context, scene, options) {
        options = Options.castIfRequired(options);
        super(context, scene, options);

        const tScene = scene.getThreeScene();

        this._camera = new THREE.OrthographicCamera(-32, 32, 32, -32, -50, 200);
        this._camera.name = 'LevelCamera';
        tScene.add(this._camera);

        this._renderTarget = new THREE.WebGLRenderTarget(64, 64, {
            magFilter: THREE.NearestFilter,
            minFilter: THREE.NearestFilter,
            depthBuffer: true,
            depthTexture: new THREE.DepthTexture(),
        });

        this._sceneOutline = new THREE.Scene();
        this._sceneOutline.name = 'SceneGame';
        this._sceneOutline.background = this._renderTarget.texture;

        this._cameraOutline = new THREE.OrthographicCamera(-32, 32, 32, -32, -1, 1);
        this._cameraOutline.name = 'OutlineCamera';
        this._sceneOutline.add(this._cameraOutline);

        const geometryOutline = new THREE.PlaneGeometry(64, 64);
        const materialOutline = new OutlineMaterial({
            depthMap: this._renderTarget.depthTexture,
            maxDepth: 0.35,
        });
        const mesh = new THREE.Mesh(geometryOutline, materialOutline);
        this._sceneOutline.add(mesh);

        const canvasPlane = new CanvasPlane(64, 64);
        canvasPlane.position.set(-32, -32, 1);
        this._sceneOutline.add(canvasPlane);

        canvasPlane.material.map.magFilter = THREE.NearestFilter;
        canvasPlane.material.map.minFilter = THREE.NearestFilter;

        Entity.createByName('Hud', context, scene, {
            canvasPlane,
        });

        this._lastPosition = new THREE.Vector3();
        this._lastQuaternion = new THREE.Quaternion();
        this._lastSize = 64;
        this._position = new THREE.Vector3();
        this._quaternion = new THREE.Quaternion();
        this._size = 64;
        this._lastT = null;

        this._transitionDuration = 1;
        this._transitionTime = 1;

        this._mode = null;
        this._modeTime = null;
    }

    update(context) {
        super.update(context);

        this._transitionTime += context.elapsedSeconds;
        const t = LevelCamera._easeInOutCubic(Math.min(1, this._transitionTime / this._transitionDuration));

        this._camera.position.copy(this._lastPosition).lerp(this._position, t);
        this._camera.quaternion.copy(this._lastQuaternion).slerp(this._quaternion, t);

        switch (this._mode) {
            case 'elevator-nospin':
                this._modeTime += context.elapsedSeconds;

                this._camera.position.y += this._modeTime * 32 - 64;
                break;
            case 'elevator':
                this._modeTime += context.elapsedSeconds;

                this._camera.position.y += this._modeTime * 32 - 64;
                this._camera.rotateY(this._modeTime);
                break;
            case 'spinning':
                this._modeTime += context.elapsedSeconds;

                this._camera.position.y += this._modeTime;
                if (this._modeTime > 4) {
                    this._camera.rotateY((this._modeTime - 4) / 4);
                    this._camera.rotateX(Math.max(-(this._modeTime - 4) / 20, -0.2));
                }
                break;
        }
    }

    getCamera() {
        return this._camera;
    }

    moveToSide(position, side, transitionDuration = 1, laps = 1) {
        this._lastPosition.copy(this._camera.position);
        this._lastQuaternion.copy(this._camera.quaternion);
        this._lastSize = this._size;

        this._transitionDuration = transitionDuration;
        this._transitionTime = 0;

        this._position.copy(position);

        const rotation = LevelCamera._tmpEuler;

        switch (side) {
            case 0:
                rotation.set(0, 0, 0);
                break;
            case 1:
                rotation.set(0, Math.PI, 0);
                break;
            case 2:
                rotation.set(Math.PI / 2, 0, 0);
                break;
            case 3:
                rotation.set(-Math.PI / 2, 0, 0);
                break;
            case 4:
                rotation.set(0, Math.PI / 2, 0);
                break;
            case 5:
                rotation.set(0, -Math.PI / 2, 0);
                break;
        }

        this._quaternion.setFromEuler(rotation);
    }

    startMode(mode) {
        this._mode = mode;
        this._modeTime = 0;

        if (mode !== null) {
            this._transitionTime = this._transitionDuration;;
        }
    }

    render(context) {
        context.renderer.setRenderTarget(this._renderTarget);
        context.renderer.render(this.getScene().getThreeScene(), this._camera);
        context.renderer.setRenderTarget(null);
    }

    renderOutline(context) {
        context.renderer.render(this._sceneOutline, this._cameraOutline);
    }

    static _easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
}

LevelCamera._init();
LevelCamera.p_register();

/**
 * @file gameclient.class.js
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

import AudioManager from './audiomanager.class.js';
import Context from './context.class.js';
import ImageManager from './imagemanager.class.js';
import Input from './input.class.js';

import LevelManager from './game/levelmanager.class.js';

import config from '../resources/config.js';

import MainScene from '../scenes/mainscene.class.js';

import * as THREE from '../lib/three.js/three.module.js';

export default class GameClient {
    static _init() {
        GameClient._instance = null;

        window.addEventListener('load', () => {
            AudioManager.asyncLoadSounds()
                .then(() => ImageManager.asyncLoadImages())
                .then(() => LevelManager.asyncLoadData())
                .then(() => {
                    const gameClient = new GameClient();
                    gameClient.setScene(MainScene);
                });
        });
    }

    constructor() {
        this._canvas = document.querySelector('canvas');

        this._clock = new THREE.Clock(false);

        this._renderer = new THREE.WebGLRenderer({
            canvas: this._canvas,
            antialias: config.renderer.antialias,
        });
        this._renderer.setSize(64, 64);
        this._renderer.setClearColor(config.renderer.clearColor);

        this._canvas.style.width = `${64 * 10}px`;
        this._canvas.style.height = `${64 * 10}px`;

        this._context = new Context(this, this._renderer);

        this._scene = null;

        window.addEventListener('resize', this._handleResize.bind(this));

        Input.setKeyScrollEnabled(false);
        Input.setContextMenuEnabled(false);

        this._clock.start();
        this._renderer.setAnimationLoop(this._update.bind(this));
    }

    _handleResize() {
        if (this._scene !== null) {
            this._scene.handleResize(this._context);
        }
    }

    _update(time) {
        this._context.addElapsedSeconds(Math.min(this._clock.getDelta(), config.maxTimestep));
        this._lastTime = time;

        this._scene.update(this._context);

        Input.resetState();
    }

    setScene(type) {
        if (this._scene !== null) {
            this._scene.destroy(this._context);
        }
        this._scene = new type(this._context);
        this._handleResize();
    }
}

GameClient._init();

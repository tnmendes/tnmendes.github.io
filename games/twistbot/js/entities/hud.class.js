/**
 * @file hud.class.js
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

import * as THREE from '../lib/three.js/three.module.js';

export default class Hud extends Entity {
    constructor(context, scene, options) {
        options = Options.castIfRequired(options);
        super(context, scene, options);

        this._canvasPlane = options.get('canvasPlane');

        this._tilesetFont = ImageManager.getImage('font');

        this._upperLeftText = '';
        this._upperRightText = '';
        this._centerText = '';

        this._upperLeftTextOld = null;
        this._upperRightTextOld = null;
        this._centerTextOld = null;
    }

    update(context) {
        super.update(context);

        if (this._upperLeftText === this._upperLeftTextOld &&
            this._upperRightText === this._upperRightTextOld &&
            this._centerText === this._centerTextOld) {
            this._upperLeftText = '';
            this._upperRightText = '';
            this._centerText = '';
            return;
        }

        this._upperLeftTextOld = this._upperLeftText;
        this._upperRightTextOld = this._upperRightText;
        this._centerTextOld = this._centerText;

        const ctx = this._canvasPlane.getContext2D();

        ctx.clearRect(0, 0, 64, 64);

        this._drawText(this._upperLeftText, 0, 0);
        this._drawText(this._upperRightText, 64 - this._upperRightText.length * 8, 0);
        this._drawText(this._centerText, 32 - this._centerText.length * 4, 28);

        this._canvasPlane.updateTexture();
    }

    setUpperLeftText(text) {
        this._upperLeftText = text;
    }

    setUpperRightText(text) {
        this._upperRightText = text;
    }

    setCenterText(text) {
        this._centerText = text;
    }

    _drawText(text, x, y) {
        const ctx = this._canvasPlane.getContext2D();

        let x_ = x;
        let y_ = y;

        for (let i = 0; i < text.length; i++) {
            const c = text.charCodeAt(i);
            if (c === 10) {
                x_ = x;
                y_ += 8;
                continue;
            }

            const frameIndex = c - 32;
            const offsetX = (frameIndex % 16) * 8;
            const offsetY = Math.floor(frameIndex / 16) * 8;
            ctx.drawImage(this._tilesetFont, offsetX, offsetY, 8, 8, x_, y_, 8, 8);

            x_ += 8;
        }
    }
}

Hud.p_register();

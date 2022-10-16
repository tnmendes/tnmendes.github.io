/**
 * @file input.class.js
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

export default class Input {
    static _init() {
        Input._keyDown = new Set();
        Input._keyUp = new Set();
        Input._key = new Set();

        Input._enableKeyScroll = true;

        Input._scrollKeyCodes = [32, 37, 38, 39, 40];

        window.addEventListener('load', Input._handleLoad);
    }

    static _handleLoad() {
        document.addEventListener('keydown', e => {
            if (!Input._enableKeyScroll &&
                Input._scrollKeyCodes.includes(e.keyCode)) {
                e.preventDefault();
            }

            if (e.repeat !== undefined && e.repeat) {
                return;
            }

            Input._keyDown.add(e.keyCode);
            Input._key.add(e.keyCode);
        }, false);

        document.addEventListener('keyup', e => {
            if (!Input._enableKeyScroll &&
                Input._scrollKeyCodes.includes(e.keyCode)) {
                e.preventDefault();
            }

            if (e.repeat !== undefined && e.repeat) {
                return;
            }

            Input._keyUp.add(e.keyCode);
            Input._key.delete(e.keyCode);
        }, false);
    }

    static getKeyDown(key) {
        return Input._keyDown.has(key);
    }

    static getKeyUp(key) {
        return Input._keyUp.has(key);
    }

    static getKey(key) {
        return Input._key.has(key);
    }

    static setKeyScrollEnabled(enabled) {
        Input._enableKeyScroll = enabled;
    }

    static setContextMenuEnabled(enabled) {
        Input._enableContextMenu = enabled;
    }

    static resetState() {
        Input._keyDown.clear();
        Input._keyUp.clear();
    }
}

Input._init();

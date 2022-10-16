/**
 * @file imagemanager.class.js
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

import config from '../resources/config.js';
import resources from '../resources/resources.js';

import * as THREE from '../lib/three.js/three.module.js';

export default class ImageManager {
    static _init() {
        ImageManager._images = new Map();
        ImageManager._textures = new Map();
    }

    static asyncLoadImages() {
        return Promise.all(Object.keys(resources.images).map(name => {
            const info = resources.images[name];
            const url = `./images/${info.path}${config.debug.preventCaching ? '?time=' + new Date().getTime() : ''}`;

            return new Promise((resolve, reject) => {
                const image = new Image();
                image.addEventListener('load', () => {
                    ImageManager._images.set(name, image);

                    resolve();
                });
                image.addEventListener('error', () => {
                    reject(new Error(`Error loading image file "${url}"`));
                });
                image.src = url;
            });
        }));
    }

    static getImage(name) {
        const image = ImageManager._images.get(name);
        if (image === undefined) {
            throw new Error(`Image "${name}" does not exist`);
        }
        return image;
    }

    static getThreeTexture(name, encoding = THREE.LinearEncoding) {
        if (ImageManager._textures.has(name)) {
            return ImageManager._textures.get(name);
        }

        const image = ImageManager.getImage(name);
        const texture = new THREE.Texture(image);
        texture.encoding = encoding;
        texture.needsUpdate = true;
        ImageManager._textures.set(name, texture);
        return texture;
    }
}

ImageManager._init();

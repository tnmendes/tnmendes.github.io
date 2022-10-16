/**
 * @file levelmanager.class.js
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

import Entity from '../entity.class.js';
import Options from '../options.class.js';

import Level from '../../entities/level.class.js';

import config from '../../resources/config.js';

import * as THREE from '../../lib/three.js/three.module.js';

export default class LevelManager {
    static _init() {
        LevelManager._data = null;
    }

    static asyncLoadData() {
        const url = `./data/levels.json${config.debug.preventCaching ? '?time=' + new Date().getTime() : ''}`;

        return fetch(url, { cache: 'no-cache' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                return response.json();
            })
            .then(data => {
                LevelManager._data = data;
            })
            .catch(error => {
                throw new Error(`Error loading data file "${url}", ${error}`);
            });
    }

    static createLevel(context, indices, scene, options) {
        const blockDefs = [];

        const tileset = LevelManager._data.tilesets[0];

        LevelManager._data.layers.forEach(layer => layer.objects.forEach(object => {
            if (object.gid === undefined) {
                return;
            }

            const tileId = (object.gid & ~(0b111 << 29)) - tileset.firstgid;
            const tile = tileset.tiles.find(tile => tile.id === tileId);
            if (tile === undefined) {
                return;
            }
            const type = object.type === undefined || object.type === '' ? tile.type : object.type;
            if (type === undefined || type === '') {
                return;
            }

            const tileX = Math.floor((object.x + object.width / 2) / 8);
            const tileY = Math.floor((object.y - object.height / 2) / 8);

            indices.forEach(index => {
                if (tileY < 9 * index ||
                    tileY >= 9 * (index + 1)) {
                    return;
                }

                const options = new Options();

                const tileIndex = new THREE.Vector3(
                    tileX % 9,
                    9 - (tileY - 9 * index) - 1,
                    Math.floor(tileX / 9));

                options.set('name', object.name);
                options.set('tileId', tileId);
                options.set('tileIndex', tileIndex);

                if (object.properties !== undefined) {
                    object.properties.forEach(property => options.set(property.name, property.value));
                }

                if (tile.properties !== undefined) {
                    tile.properties.forEach(property => {
                        if (!options.has(property.name)) {
                            options.set(property.name, property.value);
                        }
                    });
                }

                blockDefs.push({
                    type: Entity.getTypeByName(type),
                    options,
                });
            });
        }));

        options.blockDefs = blockDefs;

        return new Level(context, scene, options);
    }
}

LevelManager._init();

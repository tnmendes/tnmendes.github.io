/**
 * @file resources.js
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

const resources = {
    sounds: {
        music__ingame: {
            path: 'music__ingame.mp3',
            count: 1,
            baseVolume: 0.7,
            type: 'audio/mp3',
        },
        sound__click: {
            path: 'sound__click.wav',
            count: 2,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__destroyed: {
            path: 'sound__destroyed.wav',
            count: 1,
            baseVolume: 0.7,
            type: 'audio/wav',
        },
        sound__flip: {
            path: 'sound__flip.wav',
            count: 3,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__land: {
            path: 'sound__land.wav',
            count: 3,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__lift: {
            path: 'sound__lift.wav',
            count: 1,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__proximity: {
            path: 'sound__proximity.wav',
            count: 3,
            baseVolume: 1,
            type: 'audio/wav',
        },
        sound__elevator: {
            path: 'sound__elevator.wav',
            count: 1,
            baseVolume: 0.5,
            type: 'audio/wav',
        },
    },
    images: {
        tileset_diffuse: {
            path: 'tileset.png',
        },
        tileset_bump: {
            path: 'tileset_bump.png',
        },
        tileset_roughness: {
            path: 'tileset_roughness.png',
        },
        tileset_emissive: {
            path: 'tileset_emissive.png',
        },
        font: {
            path: 'font.png',
        },
    },
};
export default resources;

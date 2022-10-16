/**
 * @file ladder.class.js
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

import Entity from '../../core/entity.class.js';
import Input from '../../core/input.class.js';

import Options from '../../core/options.class.js';

import Block from '../block.class.js';

export default class Ladder extends Block {
    constructor(context, scene, options) {
        options = Options.castIfRequired(options);

        const ladderSide = options.get('ladderSide');

        const frames = [208];

        options.set('sideFrames', [
            ladderSide === 5 ? frames : null,
            ladderSide === 4 ? frames : null,
            ladderSide === 3 ? frames : null,
            ladderSide === 2 ? frames : null,
            ladderSide === 1 ? frames : null,
            ladderSide === 0 ? frames : null]);

        super(context, scene, options);

        this._ladderSide = ladderSide;
    }

    getLadderSide() {
        return this._ladderSide;
    }
}

Ladder.p_register();

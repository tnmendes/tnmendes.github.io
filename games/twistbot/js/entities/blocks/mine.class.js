/**
 * @file mine.class.js
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
import Options from '../../core/options.class.js';

import Lift from './lift.class.js';

export default class Mine extends Lift {
    constructor(context, scene, options) {
        options = Options.castIfRequired(options);

        const frames = [176, 177, 178, 179, 180, 181];

        options.set('sideFrames', [
            frames, frames, frames, frames, frames, frames]);
        options.set('customFrames', true);

        super(context, scene, options);
    }

    update(context) {
        super.update(context);

        this.setFrameIndex(Math.floor(context.totalSeconds * 10) % 6);
    }
}

Mine.p_register();

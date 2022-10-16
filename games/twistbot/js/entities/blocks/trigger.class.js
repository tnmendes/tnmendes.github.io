/**
 * @file trigger.class.js
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

import AudioManager from '../../core/audiomanager.class.js';
import Entity from '../../core/entity.class.js';
import Input from '../../core/input.class.js';

import Options from '../../core/options.class.js';

import Block from '../block.class.js';

import config from '../../resources/config.js';

export default class Trigger extends Block {
    constructor(context, scene, options) {
        options = Options.castIfRequired(options);

        const triggerType = options.get('triggerType');

        let frames;
        let switchSide = null;
        let triggerInterval = null;
        switch (triggerType) {
            case 'switch':
                switchSide = options.get('switchSide', 0);

                frames = [112, 113];

                options.set('sideFrames', [
                    switchSide === 5 ? frames : null,
                    switchSide === 4 ? frames : null,
                    switchSide === 3 ? frames : null,
                    switchSide === 2 ? frames : null,
                    switchSide === 1 ? frames : null,
                    switchSide === 0 ? frames : null]);

                break;
            case 'proximity':
                frames = [0, 116, 117, 118, 119, 120, 121, 122, 123];

                options.set('sideFrames', [
                    frames, frames, frames, frames, frames, frames]);

                break;

            case 'timer':
                triggerInterval = options.get('triggerInterval', 0);

                break;
        }

        super(context, scene, options);

        this._name = options.get('name');
        this._enabled = options.get('enabled');
        this._switchSide = switchSide;
        this._triggerType = triggerType;
        this._triggerAction = options.get('triggerAction');
        this._triggerDuration = options.get('triggerTextDuration');
        this._triggerInterval = triggerInterval;
        this._triggerName = options.get('triggerName');
        this._triggerText = options.get('triggerText');

        this._touchingPlayer = false;

        this._time = 0;

        this._timeSinceTrigger = Infinity;
    }

    update(context) {
        super.update(context);

        this._timeSinceTrigger += context.elapsedSeconds;
        if (this._timeSinceTrigger < this._triggerDuration && this._triggerText !== '') {
            this.p_hud.setCenterText(this._triggerText !== 'arrows' ? this._triggerText :
                String.fromCharCode(128) + String.fromCharCode(129) + String.fromCharCode(130) + String.fromCharCode(131));
        }

        switch (this._triggerType) {
            case 'switch':
                if (this._enabled && this._touchingPlayer &&
                    this.p_level.getCameraSide() === this._switchSide) {
                    this.p_hud.setUpperRightText('Z!');

                    if (Input.getKeyDown(config.input.keys.z)) {
                        this._enabled = false;

                        this._trigger(context);

                        AudioManager.play('sound__click');
                    }
                }

                this.setFrameIndex(this._enabled ? 0 : 1);

                break;
            case 'proximity':
                if (this._enabled && this._touchingPlayer) {
                    this._enabled = false;
                    this._trigger(context);

                    AudioManager.play('sound__proximity');
                }

                this.setFrameIndex(this._enabled ?
                    Math.max(1, Math.min(8, Math.round(4.5 + Math.sin(context.totalSeconds * Math.PI * 2 * 1) * 3.5))) : 0);

                break;
            case 'timer':
                if (this._enabled) {
                    const i0 = Math.floor(this._time / this._triggerInterval);
                    this._time += context.elapsedSeconds;
                    const i1 = Math.floor(this._time / this._triggerInterval);
                    if (i0 !== i1 && this._triggerInterval > 0) {
                        this._trigger(context);
                        this._enabled = false;
                    }
                }

                break;
        }

        this._touchingPlayer = false;
    }

    p_handleTriggered() {
        this._enabled = !this._enabled;
    }

    p_handleCollision(context, block, axis, lower) {
        if (block.constructor === Entity.getTypeByName('Player')) {
            this._touchingPlayer = true;
        }
    }

    _trigger(context) {
        this.p_level.getBlocks().forEach(block =>
            block.trigger(this._triggerName));

        switch (this._triggerAction) {
            case 'next_level':
                this.p_world.nextLevel(context);
                break;
            case 'play_music':
                AudioManager.play('music__ingame', 1, true, false, 'music');
                break;
            case 'play_elevator':
                AudioManager.play('sound__elevator');
                break;
        }

        this._timeSinceTrigger = 0;
    }
}

Trigger.p_register();

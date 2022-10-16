/**
 * @file outlinematerial.class.js
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

import * as THREE from '../../lib/three.js/three.module.js';

const OutlineShader = {
    uniforms: {
        tDepth: { value: null },
        outlineColor: { value: new THREE.Color(0x000000) },
        textureSize: { value: new THREE.Vector2(64, 64) },
        tolerance: { value: 0.01 },
        maxDepth: { value: 1.01 }
    },
    vertexShader: [
        "varying vec2 vUv;",
        "",
        "void main() {",
        "    vUv = uv;",
        "    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}",
    ].join('\n'),
    fragmentShader: [
        "uniform sampler2D tDepth;",
        "uniform vec3 outlineColor;",
        "uniform vec2 textureSize;",
        "uniform float tolerance;",
        "uniform float maxDepth;",
        "",
        "varying vec2 vUv;",
        "",
        "void main() {",
        "    vec2 uvMin = (floor(vUv * textureSize - 1.0) + 0.5) / textureSize;",
        "    vec2 uvMid = (floor(vUv * textureSize) + 0.5) / textureSize;",
        "    vec2 uvMax = (floor(vUv * textureSize + 1.0) + 0.5) / textureSize;",
        "    float dM = texture2D(tDepth, uvMid).x;",
        "    float d0 = texture2D(tDepth, vec2(uvMin.x, uvMid.y)).x;",
        "    float d1 = texture2D(tDepth, vec2(uvMax.x, uvMid.y)).x;",
        "    float d2 = texture2D(tDepth, vec2(uvMid.x, uvMin.y)).x;",
        "    float d3 = texture2D(tDepth, vec2(uvMid.x, uvMax.y)).x;",
        "    if (uvMin.x > 0.0 && d0 < dM - tolerance && d0 < maxDepth ||",
        "        uvMax.x < 1.0 && d1 < dM - tolerance && d1 < maxDepth ||",
        "        uvMin.y > 0.0 && d2 < dM - tolerance && d2 < maxDepth ||",
        "        uvMax.y < 1.0 && d3 < dM - tolerance && d3 < maxDepth) {",
        "        gl_FragColor = vec4(outlineColor, 1.0);",
        "    } else {",
        "        discard;",
        "    }",
        "}",
    ].join('\n'),
};

export default class OutlineMaterial extends THREE.ShaderMaterial {
    constructor(parameters) {
        super({
            type: 'OutlineMaterial',
            uniforms: THREE.UniformsUtils.clone(OutlineShader.uniforms),
            vertexShader: OutlineShader.vertexShader,
            fragmentShader: OutlineShader.fragmentShader,
        });

        this.setValues(parameters);
    }

    get depthMap() {
        return this.uniforms.tDepth.value;
    }

    set depthMap(value) {
        this.uniforms.tDepth.value = value;
    }

    get outlineColor() {
        return this.uniforms.outlineColor.value;
    }

    set outlineColor(value) {
        this.uniforms.outlineColor.value.setHex(value);
    }

    get textureSize() {
        return this.uniforms.textureSize.value;
    }

    set textureSize(value) {
        this.uniforms.textureSize.value.copy(value);
    }

    get tolerance() {
        return this.uniforms.tolerance.value;
    }

    set tolerance(value) {
        this.uniforms.tolerance.value = value;
    }

    get maxDepth() {
        return this.uniforms.maxDepth.value;
    }

    set maxDepth(value) {
        this.uniforms.maxDepth.value = value;
    }
}

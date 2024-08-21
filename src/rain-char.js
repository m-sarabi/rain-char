/**
 * Raining characters effect with depth and customizability https://m-sarabi.github.io/rain-char/
 *
 * Copyright (c) 2024 Mohammad Sarabi <https://m-sarabi.ir>
 * Released under MIT license
 */


'use strict';

class RainChar {
    /**
     *
     * @param {string} font The font used for raining characters
     * @param {[number, number]} charSize The upper and lower limit for the font size
     * @param {[number, number]} charRange The range of Unicode character codes to be used
     * @param {string} bg Background color
     * @param {string} fg Font color
     * @param {string} [id] id of the canvas
     * @param {number} fps max frames per second
     * @param {number} densityFactor Defines how dense rain fall is, lower value means less characters
     * @param {string} parentId The id of the parent element. If defined, the canvas will be appended to that element as a child.
     */
    constructor(
        {
            font = 'monospace',
            charSize = [10, 40],
            charRange = [0x0021, 0x007e],
            bg = '#222',
            fg = 'yellow',
            id,
            fps = 30,
            densityFactor = 10,
            parentId: parentId,
        } = {},
    ) {
        this._font = font;
        this._charSize = charSize.sort((a, b) => a - b);
        this._charRange = charRange.sort((a, b) => a - b);
        this._bg = bg;
        this._fg = fg;
        this._isPaused = false;

        this._fps = fps || 40;
        this._densityFactor = densityFactor || 4;

        this._lastFrameTime = 0;

        this._particles = [];
        this._canvas = document.createElement('canvas');
        if (id) this._canvas.setAttribute('id', id);
        this._ctx = this._canvas.getContext('2d');

        this._size = [this._canvas.offsetWidth, this._canvas.offsetHeight];

        parentId
            ? document.getElementById(parentId).appendChild(this._canvas)
            : document.body.appendChild(this._canvas);

        this._ctx.fillStyle = this._bg;
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        new ResizeObserver(this._onResize.bind(this)).observe(this._canvas);
        this._play = this._play.bind(this);
    }

    _newParticle() {
        return {
            x: Math.random() * (this._size[0]),
            y: -Math.random() * this._size[1],
            size: this._getRandomDistance(...this._charSize),
        };
    }

    _updateParticles() {
        this._particles.forEach(particle => {
            if (particle['y'] > this._size[1]) {
                particle['x'] = Math.random() * (this._size[0]);
                particle['y'] = -Math.random() * this._size[1];
                particle['size'] = this._getRandomDistance(...this._charSize);
            } else {
                particle['y'] += particle['size'];
            }
        });
    }

    _onResize() {
        const oldSize = [this._canvas.width, this._canvas.height];
        this._size = [this._canvas.offsetWidth, this._canvas.offsetHeight];

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = oldSize[0];
        tempCanvas.height = oldSize[1];
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(this._canvas, 0, 0);

        this._canvas.width = this._size[0];
        this._canvas.height = this._size[1];

        this._ctx.fillStyle = this._bg;
        this._ctx.fillRect(0, 0, this._size[0], this._size[1]);

        this._ctx.drawImage(tempCanvas, 0, 0);

        this.rainCount = Math.floor(this._size[0] * this._size[1] / (((this._charSize[0] + this._charSize[1]) / 3) ** 2 * this._densityFactor));
        this._particles.sort((a, b) => a['x'] - b['x']);
        while (this._particles.length > this.rainCount) {
            this._particles.pop();
        }
        while (this._particles.length < this.rainCount) {
            this._particles.push(this._newParticle());
        }
    }

    _play(timestamp = 0) {
        if (this._isPaused) return;
        this.elapsed = timestamp - this._lastFrameTime;
        if (this.elapsed >= this._frameInterval) {
            this._lastFrameTime = timestamp;
            this._ctx.globalAlpha = 0.25;
            this._ctx.fillStyle = this._bg;
            this._ctx.fillRect(0, 0, this._size[0], this._size[1]);
            this._ctx.globalAlpha = 1;
            this._updateParticles();
            this._ctx.fillStyle = this._fg;
            this._particles.forEach((particle) => {
                this._ctx.font = particle['size'] + 'px ' + this._font;
                this._ctx.fillText(this._getRandomChar(), particle['x'], particle['y']);
            });
        }
        requestAnimationFrame(this._play);
    }

    _getRandomChar() {
        const code = Math.floor(Math.random() * (this._charRange[1] - this._charRange[0] + 1)) + this._charRange[0];
        return String.fromCodePoint(code);
    }

    _getRandomDistance() {
        const random = Math.random();
        const biasedRandom = random ** 2;
        return Math.floor(biasedRandom * (this._charSize[1] - this._charSize[0] + 1)) + this._charSize[0];
    }

    start() {
        this._isPaused = false;
        this._particles = [];
        this._onResize();
        this._frameInterval = 1000 / this._fps;
        this._play();
    }

    pause() {
        this._isPaused = !this._isPaused;
        if (!this._isPaused) {
            this._play();
        }
    }

    stop() {
        this._isPaused = true;
        this._ctx.clearRect(0, 0, ...this._size);
    }
}
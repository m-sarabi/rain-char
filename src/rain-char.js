/**
 * Raining characters effect with depth and customizability https://m-sarabi.github.io/rain-char/
 *
 * Copyright (c) 2024 Mohammad Sarabi <https://m-sarabi.ir>
 * Released under MIT license
 */

'use strict';

class RainChar {
    /**
     * @param {Object} options Configuration options for the rain effect.
     * @param {string} [options.font='monospace'] The font used for raining characters.
     * @param {[number, number]} [options.charSize=[10, 40]] The upper and lower limit for the font size.
     * @param {[number, number] | [number, number][]} [options.charRange=[0x0021, 0x007e]] The range of Unicode character codes to be used.
     * @param {string} [options.bg='black'] Background color.
     * @param {string} [options.fg='limegreen'] Font color.
     * @param {string} [options.id] ID of the canvas element.
     * @param {number} [options.fps=30] Max frames per second.
     * @param {number} [options.densityFactor=10] Defines how dense the rain falls; lower value means more characters.
     * @param {number} [trailMultiplier=1] Defines the length of the trail; lower value means longer trail.
     * @param {number} [charSpacing=1] Defines the gap between characters; lower value means less gap.
     * @param {string} [options.parentId] The ID of the parent element. If defined, the canvas will be appended to that element as a child.
     */
    constructor(
        {
            font = 'monospace',
            charSize = [10, 40],
            charRange = [0x0021, 0x007e],
            bg = 'black',
            fg = 'limegreen',
            id,
            fps = 30,
            densityFactor = 10,
            trailMultiplier = 1,
            charSpacing = 1,
            parentId,
        } = {}) {
        this._font = font;
        this._charSize = charSize.sort((a, b) => a - b);
        this._charRange = charRange.sort((a, b) => a - b);
        this._bg = bg;
        this._fg = fg;
        this._isPaused = false;
        this._fps = fps || 40;
        this._densityFactor = densityFactor || 4;
        this._trailMultiplier = trailMultiplier || 1;
        this._charSpacing = charSpacing || 1;

        this._getCharCodes();
        this._initializeCanvas(id, parentId);
        this._initializeProperties();
        this._setupResizeObserver();

        this._play = this._play.bind(this);
    }

    _initializeCanvas(id, parentId) {
        this._canvas = document.createElement('canvas');
        if (id) this._canvas.setAttribute('id', id);
        this._ctx = this._canvas.getContext('2d');
        this._size = [this._canvas.offsetWidth, this._canvas.offsetHeight];

        const parentElement = parentId ? document.getElementById(parentId) : document.body;
        parentElement.appendChild(this._canvas);

        this._ctx.fillStyle = this._bg;
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    _initializeProperties() {
        this._lastFrameTime = 0;
        this._particles = [];
    }

    _setupResizeObserver() {
        new ResizeObserver(this._onResize.bind(this)).observe(this._canvas);
    }

    _newParticle() {
        return {
            x: Math.random() * this._size[0],
            y: -Math.random() * this._size[1] * 2,
            size: this._getRandomDistance(),
        };
    }

    _updateParticles() {
        this._particles.forEach(particle => {
            if (particle.y > this._size[1]) {
                Object.assign(particle, this._newParticle());
            } else {
                particle.y += particle.size * this._charSpacing;
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

        this._adjustParticleCount();
    }

    _adjustParticleCount() {
        const avgCharSize = (this._charSize[0] + this._charSize[1]) / 3;
        this.rainCount = Math.floor(this._size[0] * this._size[1] / (avgCharSize ** 2 * this._densityFactor));

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
            this._clearCanvas();
            this._updateParticles();
            this._drawParticles();
        }
        requestAnimationFrame(this._play);
    }

    _clearCanvas() {
        this._ctx.globalAlpha = 0.25 * this._trailMultiplier;
        this._ctx.fillStyle = this._bg;
        this._ctx.fillRect(0, 0, this._size[0], this._size[1]);
        this._ctx.globalAlpha = 1;
    }

    _drawParticles() {
        this._ctx.fillStyle = this._fg;
        this._particles.forEach(particle => {
            this._ctx.font = `${particle.size}px ${this._font}`;
            this._ctx.fillText(this._getRandomChar(), particle.x, particle.y);
        });
    }

    _getCharCodes() {
        if (Array.isArray(this._charRange[0])) {
            this._charCodes = this._charRange.map(range => [...Array(range[1] - range[0] + 1).keys()].map(x => x + range[0])).flat();
        } else {
            this._charCodes = [...Array(this._charRange[1] - this._charRange[0] + 1).keys()].map(x => x + this._charRange[0]);
        }
    }

    _getRandomChar() {
        return String.fromCodePoint(this._charCodes[Math.floor(Math.random() * this._charCodes.length)]);
    }

    _getRandomDistance() {
        const random = Math.random();
        const biasedRandom = random ** 2;
        return Math.floor(biasedRandom * (this._charSize[1] - this._charSize[0] + 1)) + this._charSize[0];
    }

    /**
     * Fresh starts the effect animation. It also acts as a restart.
     *
     * @return {void} No return value
     */
    start() {
        console.log('test')
        this._isPaused = false;
        this._particles = [];
        this._onResize();
        this._frameInterval = 1000 / this._fps;
        this._play();
    }

    /**
     * Toggles the paused state of the animation.
     *
     * @return {void} No return value
     */
    pause() {
        this._isPaused = !this._isPaused;
        if (!this._isPaused) {
            this._play();
        }
    }

    /**
     * Stops the effect and clears the canvas.
     *
     * @return {void} No return value
     */
    stop() {
        this._isPaused = true;
        this._ctx.clearRect(0, 0, ...this._size);
    }

    // Setters
    set font(font) {
        this._font = font;
    }

    set charSize(charSize) {
        this._charSize = charSize;
        this._adjustParticleCount();
    }

    set charRange(charRange) {
        this._charRange = charRange;
        this._getCharCodes();
    }

    set bg(bg) {
        this._bg = bg;
    }

    set fg(fg) {
        this._fg = fg;
    }

    set fps(fps) {
        this._fps = fps;
        this._frameInterval = 1000 / this._fps;
    }

    set densityFactor(densityFactor) {
        this._densityFactor = densityFactor;
        this._adjustParticleCount();
    }

    set trailMultiplier(trailMultiplier) {
        this._trailMultiplier = trailMultiplier;
    }

    set charSpacing(charSpacing) {
        this._charSpacing = charSpacing;
    }

    // Getters
    get font() {
        return this._font;
    }

    get charSize() {
        return this._charSize;
    }

    get charRange() {
        return this._charRange;
    }

    get bg() {
        return this._bg;
    }

    get fg() {
        return this._fg;
    }

    get fps() {
        return this._fps;
    }

    get densityFactor() {
        return this._densityFactor;
    }

    get trailMultiplier() {
        return this._trailMultiplier;
    }

    get charSpacing() {
        return this._charSpacing;
    }
}

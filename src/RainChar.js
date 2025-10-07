import RainCharWorker from './rain-worker?worker&inline';

/**
 * @typedef {object} RainCharSettings
 * @property {string} [font='monospace'] - The font used for raining characters.
 * @property {[number, number]} [charSize=[10, 40]] - The lower and upper limit for the font size.
 * @property {string | [number, number] | [number, number][]} [charRange=[0x0021, 0x007e]] - The characters to use. Can be a string of characters, a single Unicode range `[min, max]`, or an array of ranges.
 * @property {string} [bg='black'] - Background color in a CSS-compatible format.
 * @property {string} [fg='limegreen'] - Font color in a CSS-compatible format.
 * @property {number} [fps=30] - Maximum frames per second for the animation.
 * @property {number} [density=0.1] - Defines how dense the rain is (0 to 1). A larger value means more characters.
 * @property {number} [trailDecay=1] - Defines the length of the character trails. A smaller value means a longer trail (less fading).
 * @property {number} [charSpacing=1] - Defines the vertical gap between characters in a stream.
 * @property {number} [charChangeFreq=1] - Defines the frequency of character changes (0 to 1). A lower value means less frequent changes.
 */

/**
 * Main controller for the RainChar effect.
 * It handles the visible canvas, user interactions, and communication
 * with the Web Worker that runs the simulation.
 */
class RainChar {
    /**
     * @param {HTMLCanvasElement} canvas The canvas element to draw the effect on.
     * @param {Partial<RainCharSettings>} settings Initial settings for the rain effect.
     */
    constructor(canvas, settings = {}) {
        if (!canvas) {
            throw new Error('A canvas element must be provided.');
        }

        /** @type {HTMLCanvasElement} */
        this.canvas = canvas;

        /** @type {number} */
        this.width = canvas.offsetWidth;
        /** @type {number} */
        this.height = canvas.offsetHeight;

        /** @type {RainCharSettings} */
        this.settings = {
            font: 'monospace',
            charSize: [10, 40],
            charRange: [0x0021, 0x007e],
            bg: 'black',
            fg: 'limegreen',
            fps: 60,
            density: 0.2,
            trailDecay: 0.2,
            charSpacing: 0.5,
            charChangeFreq: 0.25,
            ...settings,
        };

        /** @type {CanvasRenderingContext2D | null} */
        this.ctx = this.canvas.getContext('2d');

        /** @type {ImageBitmap | null} */
        this.lastBitmap = null;

        this.isDrawScheduled = false;

        /** @type {ResizeObserver} */
        this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));

        // The class creates and manages its own worker
        this.worker = new RainCharWorker();
        this.worker.onmessage = this.handleWorkerMessage.bind(this);

        this.init();
    }

    /**
     * Initializes the worker by creating and transferring an OffscreenCanvas.
     * @private
     */
    init() {
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        const offscreen = new OffscreenCanvas(this.width, this.height);
        // Transfer control of the offscreen canvas to the worker.
        this.worker.postMessage({type: 'initCanvas', canvas: offscreen}, [offscreen]);
        this.worker.postMessage({
            type: 'init',
            settings: this.settings,
            width: this.width,
            height: this.height
        });

        this.resizeObserver.observe(this.canvas);
    }

    /**
     * Handles messages from the worker, primarily for rendering new frames.
     * @param {MessageEvent} e The event object from the worker.
     * @private
     */
    handleWorkerMessage(e) {
        const {type, data} = e.data;
        if (type === 'render') {
            if (this.lastBitmap) {
                this.lastBitmap.close();
            }
            this.lastBitmap = data.imageBitmap;
            if (!this.isDrawScheduled) {
                this.isDrawScheduled = true;
                requestAnimationFrame(this.draw.bind(this));
            }
        }
    }

    /**
     * Draws the latest ImageBitmap from the worker onto the visible canvas.
     * @private
     */
    draw() {
        this.isDrawScheduled = false;

        if (!this.ctx || !this.lastBitmap) return;
        this.ctx.drawImage(this.lastBitmap, 0, 0);
    }

    /**
     * Handles canvas resizing, updating both the visible canvas and the worker.
     * @param {ResizeObserverEntry[]} entries
     * @private
     */
    handleResize(entries) {
        if (!entries || !entries.length) return;
        const {width, height} = entries[0].contentRect;

        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;

        this.worker.postMessage({ type: 'resize', width, height });
    }

    /**
     * Starts or resumes the animation. If called for the first time,
     * it initializes and starts the animation.
     */
    start() {
        this.worker.postMessage({type: 'start'});
    }

    /**
     * Pauses the animation.
     */
    pause() {
        this.worker.postMessage({type: 'pause'});
    }

    /**
     * Stops and completely clears the animation.
     * To restart, call `start()`.
     */
    stop() {
        this.worker.postMessage({type: 'stop'});
    }

    /**
     * Updates a single setting.
     * @param {keyof RainCharSettings} key The name of the setting to update.
     * @param {*} value The new value for the setting.
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.worker.postMessage({type: 'updateSetting', key, value});
    }

    /**
     * Cleans up resources, stopping the worker and observer.
     */
    destroy() {
        this.resizeObserver.disconnect();
        this.worker.terminate();
        if (this.lastBitmap) {
            this.lastBitmap.close();
        }
    }
}

export default RainChar;
/**
 * @file This script runs in a Web Worker and does all the calculations
 * and rendering for the RainChar effect.
 */

// --- Type Definitions ---
/**
 * @typedef {import('./RainChar.js').RainCharSettings} RainCharSettings
 */

/**
 * @typedef {object} Particle
 * @property {number} x - The x-coordinate of the particle.
 * @property {number} y - The y-coordinate of the particle.
 * @property {number} size - The font size of the particle.
 * @property {string} char - The character value of the particle.
 * @property {string} [lastDrawnChar] - The character that was last successfully drawn for this particle.
 * @property {number} [lastDrawnSize] - The size of the last character that was successfully drawn for this particle.
 */

/**
 * @typedef {object} AtlasCharInfo
 * @property {number} x - The x-coordinate in the font atlas.
 * @property {number} y - The y-coordinate in the font atlas.
 * @property {number} width - The width of the character in the atlas.
 * @property {number} height - The height of the character in the atlas.
 * @property {number} atlasIndex - The index of the atlas canvas where this char is stored.
 */

/**
 * @typedef {object} WorkerState
 * @property {RainCharSettings} settings - The current animation settings.
 * @property {number} width - The width of the canvas.
 * @property {number} height - The height of the canvas.
 * @property {Particle[]} particles - The array of all active character particles.
 * @property {string[]} charCodes - The pre-calculated list of characters to use.
 * @property {boolean} isRunning - Flag indicating if the animation loop is active.
 * @property {number | null} loopId - The ID of the `requestAnimationFrame`, used to cancel it.
 * @property {number} lastFrameTime - The timestamp of the last rendered frame.
 * @property {Map<string, AtlasCharInfo>} charCache - A cache for rendered characters' info in the atlas.
 * @property {OffscreenCanvas[]} charAtlases - An array of canvases used as sprite sheets.
 * @property {OffscreenCanvasRenderingContext2D[]} atlasContexts - The contexts for the atlases.
 * @property {number} currentAtlasIndex - The index of the atlas currently being written to.
 * @property {number} atlasNextX - The x-coordinate for where to draw the next character.
 * @property {number} atlasNextY - The y-coordinate for where to draw the next character.
 * @property {number} atlasLineHeight - The height of the current line in the atlas.
 * @property {Set<string>} cachingQueue - A queue of characters to be rendered to the atlas.
 */

/** @type {WorkerState} */
let state = {
    settings: {},
    width: 0,
    height: 0,
    particles: [],
    charCodes: [],
    isRunning: false,
    loopId: null,
    lastFrameTime: 0,
    charCache: new Map(),
    charAtlases: [],
    atlasContexts: [],
    currentAtlasIndex: 0,
    atlasNextX: 0,
    atlasNextY: 0,
    atlasLineHeight: 0,
    cachingQueue: new Set(),
};

/** @type {OffscreenCanvas | null} */
let offscreenCanvas = null;
/** @type {OffscreenCanvasRenderingContext2D | null} */
let ctx = null;

const CACHE_BATCH_SIZE = 10;

// --- Helper Functions ---

/**
 * Generates an array of characters from the given Unicode ranges or string.
 */
function generateCharCodes() {
    const {charRange} = state.settings;
    if (typeof charRange === 'string') {
        state.charCodes = Array.from(charRange);
        return;
    }

    const ranges = Array.isArray(charRange[0]) ? charRange : [charRange];

    const codes = [];
    for (const range of ranges) {
        for (let i = range[0]; i <= range[1]; i++) {
            codes.push(String.fromCodePoint(i));
        }
    }
    state.charCodes = codes;
}

/** Returns a random character from the pre-calculated list. */
function getRandomChar() {
    if (state.charCodes.length === 0) return '';
    return state.charCodes[Math.floor(Math.random() * state.charCodes.length)];
}

/** Returns a random size for a particle, biased towards smaller sizes. */
function getRandomSize() {
    const {charSize} = state.settings;
    const [min, max] = charSize;

    const biasedRandom = Math.random() ** 2;
    return Math.floor(biasedRandom * (max - min + 1)) + min;
}

// --- Core Logic ---

/**
 * Creates a new atlas canvas, adds it to the state, and sets it as the current one.
 */
function createNewAtlas() {
    const newAtlas = new OffscreenCanvas(2048, 2048);
    const newCtx = newAtlas.getContext('2d');
    if (!newCtx) {
        console.error("Failed to get 2D context for a new atlas.");
        return;
    }

    newCtx.fillStyle = state.settings.fg;
    newCtx.textBaseline = 'top';

    state.charAtlases.push(newAtlas);
    state.atlasContexts.push(newCtx);
    state.currentAtlasIndex = state.charAtlases.length - 1;
    state.atlasNextX = 0;
    state.atlasNextY = 0;
    state.atlasLineHeight = 0;
}

/**
 * Initializes the font atlas system.
 */
function initCharAtlas() {
    state.charAtlases = [];
    state.atlasContexts = [];
    state.charCache.clear();
    state.cachingQueue.clear();
    createNewAtlas();
}


/**
 * Initializes or re-initializes the simulation state.
 * @param {RainCharSettings} newSettings
 */
function setup(newSettings) {
    state.settings = newSettings;
    state.particles = [];

    generateCharCodes();
    initCharAtlas();
    adjustParticleCount();
    clearCanvas(true);
}

/**
 * Creates a new particle with random properties.
 * @returns {Particle}
 */
function createNewParticle() {
    return {
        x: Math.random() * state.width,
        y: -Math.random() * state.height * 2,
        size: getRandomSize(),
        char: getRandomChar(),
    };
}

/**
 * Adjusts the number of particles based on canvas size and density settings.
 */
function adjustParticleCount() {
    const {charSize, density} = state.settings;
    if (state.width === 0 || state.height === 0) return;

    const avgCharSize = (charSize[0] + charSize[1]) / 2;

    const maxPossibleChars = (state.width * state.height) / (avgCharSize ** 2);
    const targetCount = Math.floor(maxPossibleChars * density);

    while (state.particles.length < targetCount) {
        state.particles.push(createNewParticle());
    }
    while (state.particles.length > targetCount) {
        state.particles.pop();
    }
}

/**
 * Updates the position and character of each particle for the next frame.
 */
function updateParticles() {
    const {charSpacing, charChangeFreq} = state.settings;

    state.particles.forEach(p => {
        if (p.y > state.height) {
            Object.assign(p, createNewParticle());
        } else {
            p.y += p.size * charSpacing;
        }

        if (Math.random() < charChangeFreq) {
            p.char = getRandomChar();
        }
    });
}

/**
 * Renders characters from the caching queue to the font atlas.
 * This is done in batches to avoid blocking the animation loop for too long.
 */
function processCachingQueue() {
    if (state.cachingQueue.size === 0) return;

    for (let i = 0; i < CACHE_BATCH_SIZE && state.cachingQueue.size > 0; i++) {
        const key = state.cachingQueue.values().next().value;
        state.cachingQueue.delete(key);

        const lastSeparatorIndex = key.lastIndexOf('__');
        if (lastSeparatorIndex === -1) {
            console.error(`Invalid cache key found in queue: "${key} Maybe report it if you see this message?"`);
            continue; // Skip this malformed key
        }
        const char = key.substring(0, lastSeparatorIndex);
        const sizeStr = key.substring(lastSeparatorIndex + 2);

        const size = parseInt(sizeStr, 10);
        const { font } = state.settings;

        if (state.atlasContexts.length === 0) continue;

        let currentCtx = state.atlasContexts[state.currentAtlasIndex];
        let currentAtlas = state.charAtlases[state.currentAtlasIndex];

        currentCtx.font = `${size}px ${font}`;
        const metrics = currentCtx.measureText(char);
        const charWidth = Math.ceil(metrics.width) || size / 2;
        const charHeight = Math.ceil(metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent);

        if (state.atlasNextX + charWidth > currentAtlas.width) {
            state.atlasNextX = 0;
            state.atlasNextY += state.atlasLineHeight;
            state.atlasLineHeight = 0;
        }

        if (state.atlasNextY + charHeight > currentAtlas.height) {
            console.log('Font atlas is full. Creating a new one.');
            createNewAtlas();
            currentCtx = state.atlasContexts[state.currentAtlasIndex];
            currentCtx.font = `${size}px ${font}`;
        }

        currentCtx.fillText(char, state.atlasNextX, state.atlasNextY);

        const cachedInfo = {
            x: state.atlasNextX,
            y: state.atlasNextY,
            width: charWidth,
            height: charHeight,
            atlasIndex: state.currentAtlasIndex,
        };
        state.charCache.set(key, cachedInfo);

        state.atlasNextX += charWidth;
        state.atlasLineHeight = Math.max(state.atlasLineHeight, charHeight);
    }
}

/**
 * It checks for a character in the atlas. If not found, it queues it for caching and returns null.
 * @param {string} char The character to render.
 * @param {number} size The font size.
 * @returns {AtlasCharInfo | null}
 */
function getCharFromAtlas(char, size) {
    const key = `${char}__${size}`;

    // If it's already cached, return it immediately.
    if (state.charCache.has(key)) {
        return state.charCache.get(key);
    }

    // Otherwise, add it to the queue and return null for now.
    state.cachingQueue.add(key);
    return null;
}

/**
 * Draws all particles onto the offscreen canvas using the font atlas.
 * If a particle's current character is not yet cached, it attempts to draw
 * the last successfully rendered character for that particle to avoid gaps.
 */
function drawParticles() {
    if (!ctx || state.charAtlases.length === 0) return;

    for (const p of state.particles) {
        let charInfo = getCharFromAtlas(p.char, p.size);
        const currentCharacterIsCached = !!charInfo;

        // If the current character is not cached, try to use the last drawn character as a fallback.
        if (!currentCharacterIsCached && p.lastDrawnChar !== undefined) {
            // We assume the fallback character is always in the cache, so we get it directly.
            charInfo = state.charCache.get(`${p.lastDrawnChar}__${p.lastDrawnSize}`);
        }

        // If we have a character to draw (either the current one or a fallback)...
        if (charInfo) {
            const sourceAtlas = state.charAtlases[charInfo.atlasIndex];
            ctx.drawImage(
                sourceAtlas,
                charInfo.x,
                charInfo.y,
                charInfo.width,
                charInfo.height,
                p.x,
                p.y,
                charInfo.width,
                charInfo.height,
            );

            // we can save it as the new fallback for subsequent frames.
            if (currentCharacterIsCached) {
                p.lastDrawnChar = p.char;
                p.lastDrawnSize = p.size;
            }
        }
    }
}

/**
 * Fills the background, creating the trailing effect.
 * @param {boolean} [fullClear=false] - If true, fully clears the canvas. Otherwise, applies transparency for trails.
 */
function clearCanvas(fullClear = false) {
    if (!ctx) return;
    if (fullClear) {
        ctx.fillStyle = state.settings.bg;
        ctx.fillRect(0, 0, state.width, state.height);
    } else {
        ctx.globalAlpha = state.settings.trailDecay;
        ctx.fillStyle = state.settings.bg;
        ctx.fillRect(0, 0, state.width, state.height);
        ctx.globalAlpha = 1;
    }
}

/**
 * Renders a single frame and posts it to the main thread.
 */
function renderFrame() {
    clearCanvas();
    updateParticles();
    drawParticles();

    const imageBitmap = offscreenCanvas.transferToImageBitmap();
    self.postMessage({type: 'render', data: {imageBitmap}}, [imageBitmap]);
}

// --- Animation Loop and Controls ---

/**
 * The main animation loop.
 * @param {DOMHighResTimeStamp} timestamp
 */
function animate(timestamp) {
    if (!state.isRunning) return;

    state.loopId = requestAnimationFrame(animate);

    processCachingQueue();

    const elapsed = timestamp - state.lastFrameTime;
    const frameInterval = 1000 / state.settings.fps;

    if (elapsed >= frameInterval) {
        state.lastFrameTime = timestamp - (elapsed % frameInterval);
        renderFrame();
    }
}

/** Starts the animation loop. */
function start() {
    if (state.isRunning) return;
    state.isRunning = true;
    state.lastFrameTime = performance.now();
    animate(state.lastFrameTime);
}

/** Pauses the animation loop. */
function pause() {
    if (!state.isRunning) return;
    state.isRunning = false;
    if (state.loopId) {
        cancelAnimationFrame(state.loopId);
        state.loopId = null;
    }
}

/** Stops and clears the animation. */
function stop() {
    pause();
    clearCanvas(true);
    const imageBitmap = offscreenCanvas.transferToImageBitmap();
    self.postMessage({type: 'render', data: {imageBitmap}}, [imageBitmap]);
}


// --- Worker Message Handler ---

self.onmessage = (e) => {
    const {type, key, value, canvas, settings, width, height} = e.data;

    switch (type) {
        case 'initCanvas':
            offscreenCanvas = canvas;
            ctx = offscreenCanvas.getContext('2d');
            break;
        case 'init':
            state.width = width;
            state.height = height;
            offscreenCanvas.width = width;
            offscreenCanvas.height = height;
            setup(settings);
            break;
        case 'start':
            start();
            break;
        case 'pause':
            pause();
            break;
        case 'stop':
            stop();
            break;
        case 'resize':
            state.width = width;
            state.height = height;
            offscreenCanvas.width = width;
            offscreenCanvas.height = height;
            adjustParticleCount();
            break;
        case 'updateSetting':
            if (state.settings[key] !== value) {
                state.settings[key] = value;
                handleSettingUpdate(key);
            }
            break;
    }
};

/**
 * Handles the side effects of updating a setting.
 * @param {keyof RainCharSettings} key The key of the setting that was updated.
 */
function handleSettingUpdate(key) {
    switch (key) {
        case 'density':
        case 'charSize':
            adjustParticleCount();
            break;
        case 'charRange':
            generateCharCodes();
            initCharAtlas();
            break;
        case 'fg':
        case 'font':
            initCharAtlas();
            break;
    }
}
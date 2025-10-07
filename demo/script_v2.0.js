document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrix-canvas');

    // --- DATA & PRESETS ---
    const charSets = {
        kana: [[0x3041, 3096], [0x30A0, 0x30FA]],
        ascii: [[0x0021, 0x007e]],
        binary: '01',
        cyrillic: [[0x0400, 0x04FF]],
        emoji: [[0x1F600, 0x1F64F]],
        numbers: '0123456789',
        snow: '❄❅❆❄❅❆❄❅❆❄❅❆✳✴✵✻✼❇✧✦✥✱✲⁕☸❁',
    };

    const presets = {
        classic: {
            font: 'monospace',
            charSize: [10, 40],
            charRange: charSets.kana,
            bg: '#000000',
            fg: '#00ff41',
            fps: 60,
            density: 0.2,
            trailDecay: 0.2,
            charSpacing: 0.5,
            charChangeFreq: 0.25,
        },
        binary: {
            font: 'monospace',
            charSize: [12, 12],
            charRange: charSets.binary,
            bg: '#0a0a0a',
            fg: '#4caf50',
            fps: 60,
            density: 0.5,
            trailDecay: 0.18,
            charSpacing: 0.6,
            charChangeFreq: 0.2,
        },
        glitch: {
            font: 'sans-serif',
            charSize: [8, 22],
            charRange: charSets.ascii,
            bg: '#00001a',
            fg: '#ff00ff',
            fps: 60,
            density: 0.2,
            trailDecay: 0.3,
            charSpacing: 1,
            charChangeFreq: 1.0,
        },
        fire: {
            font: 'serif',
            charSize: [10, 50],
            charRange: '█▓▒░',
            bg: '#1a0000',
            fg: '#ff8c00',
            fps: 60,
            density: 0.15,
            trailDecay: 0.05,
            charSpacing: 0.8,
            charChangeFreq: 0,
        },
        snow: {
            font: 'monospace',
            charSize: [10, 40],
            charRange: charSets.snow,
            bg: '#060f1f',
            fg: '#c0c0c0',
            fps: 60,
            density: 0.1,
            trailDecay: 1,
            charSpacing: 0.15,
            charChangeFreq: 0,
        },
    };

    // --- INITIAL SETUP ---
    const initialSettings = presets.classic;
    const rain = new RainChar(canvas, initialSettings);

    // --- DOM ELEMENT SELECTORS ---
    const controls = {
        panel: document.querySelector('.controls'),
        toggle: document.getElementById('toggle-controls'),
        preset: document.getElementById('preset-select'),

        // Buttons
        start: document.getElementById('start-btn'),
        pause: document.getElementById('pause-btn'),
        stop: document.getElementById('stop-btn'),

        // Inputs
        density: {range: document.getElementById('density-input'), number: document.getElementById('density-number')},
        trailDecay: {range: document.getElementById('trail-input'), number: document.getElementById('trail-number')},
        charSpacing: {
            range: document.getElementById('spacing-input'),
            number: document.getElementById('spacing-number'),
        },
        charChangeFreq: {
            range: document.getElementById('change-freq-input'),
            number: document.getElementById('change-freq-number'),
        },
        fps: {range: document.getElementById('fps-input'), number: document.getElementById('fps-number')},

        fg: document.getElementById('fg-color'),
        bg: document.getElementById('bg-color'),

        minSize: {range: document.getElementById('min-size-input'), label: document.getElementById('min-size-label')},
        maxSize: {range: document.getElementById('max-size-input'), label: document.getElementById('max-size-label')},

        charset: document.getElementById('charset-select'),
        customCharset: document.getElementById('custom-charset-input'),
    };

    // --- HELPER FUNCTIONS ---

    /** Syncs a range slider and a number input for a single setting */
    const bindRangeAndNumber = (key, parseFn = parseFloat) => {
        const {range, number} = controls[key];
        range.addEventListener('input', (e) => {
            const value = parseFn(e.target.value);
            number.value = value;
            rain.updateSetting(key, value);
        });
        number.addEventListener('input', (e) => {
            const value = parseFn(e.target.value);
            range.value = value;
            rain.updateSetting(key, value);
        });
    };

    /** Updates all UI controls to reflect the current state of rain.settings */
    const syncControlsToState = () => {
        const state = rain.settings;

        // Sync range/number pairs
        ['density', 'trailDecay', 'charSpacing', 'charChangeFreq', 'fps'].forEach(key => {
            if (controls[key]) {
                controls[key].range.value = state[key];
                controls[key].number.value = state[key];
            }
        });

        // Sync colors
        controls.fg.value = state.fg;
        controls.bg.value = state.bg;

        // Sync font size
        const [min, max] = state.charSize;
        controls.minSize.range.value = min;
        controls.minSize.label.textContent = min.toString();
        controls.maxSize.range.value = max;
        controls.maxSize.label.textContent = max.toString();

        // Sync charset
        // This is a bit tricky; we find the key in our charSets map that matches the current setting
        const currentRange = JSON.stringify(state.charRange);
        const matchingSet = Object.keys(charSets).find(key => JSON.stringify(charSets[key]) === currentRange);

        if (matchingSet) {
            controls.charset.value = matchingSet;
            controls.customCharset.classList.add('hidden');
        } else if (typeof state.charRange === 'string') {
            // Check for binary/numbers or custom string
            const matchingStringKey = Object.keys(charSets).find(key => charSets[key] === state.charRange);
            if (matchingStringKey) {
                controls.charset.value = matchingStringKey;
            } else {
                controls.charset.value = 'custom';
                controls.customCharset.value = state.charRange;
                controls.customCharset.classList.remove('hidden');
            }
        } else {
            controls.charset.value = 'custom';
            controls.customCharset.value = '';
            controls.customCharset.classList.remove('hidden');
        }
    };

    /** Loads a preset, updates the rain instance, and syncs the UI */
    const loadPreset = (presetName) => {
        if (!presets[presetName]) return;
        const presetSettings = presets[presetName];
        for (const [key, value] of Object.entries(presetSettings)) {
            rain.updateSetting(key, value);
        }
        syncControlsToState();
    };

    // --- EVENT BINDING ---

    // Buttons
    controls.start.onclick = () => rain.start();
    controls.pause.onclick = () => rain.pause();
    controls.stop.onclick = () => rain.stop();
    controls.toggle.onclick = () => {
        const panel = controls.panel;
        const icon = controls.toggle.querySelector('img');
        const isVisible = panel.dataset.visible === 'true';

        panel.dataset.visible = (!isVisible).toString();

        if (isVisible) {
            // Panel is now hidden, set icon to 'gear' to indicate "show settings"
            icon.src = ARROW_ICON_PATH;
            icon.alt = 'Show Controls';
        } else {
            // Panel is now visible, set icon to 'arrow' to indicate "hide settings"
            icon.src = GEAR_ICON_PATH;
            icon.alt = 'Hide Controls';
        }
    };

    // Presets
    controls.preset.onchange = (e) => {
        if (e.target.value !== 'custom') {
            loadPreset(e.target.value);
        }
    };

    const GEAR_ICON_PATH = './assets/gear.svg';
    const ARROW_ICON_PATH = './assets/angles-right.svg';

    // Basic Inputs
    controls.fg.oninput = (e) => rain.updateSetting('fg', e.target.value);
    controls.bg.oninput = (e) => rain.updateSetting('bg', e.target.value);

    // Linked Range/Number Inputs
    bindRangeAndNumber('density');
    bindRangeAndNumber('trailDecay', (v) => v); // Renamed in settings, handle it
    bindRangeAndNumber('charSpacing');
    bindRangeAndNumber('charChangeFreq');
    bindRangeAndNumber('fps', parseInt);

    // Special handling for charSize
    const updateCharSize = () => {
        let min = parseInt(controls.minSize.range.value, 10);
        let max = parseInt(controls.maxSize.range.value, 10);

        // Ensure min is not greater than max
        if (min > max) {
            [min, max] = [max, min]; // Swap them
            controls.minSize.range.value = min;
            controls.maxSize.range.value = max;
        }

        controls.minSize.label.textContent = min;
        controls.maxSize.label.textContent = max;
        rain.updateSetting('charSize', [min, max]);
        controls.preset.value = 'custom'; // Any manual change creates a custom preset
    };
    controls.minSize.range.oninput = updateCharSize;
    controls.maxSize.range.oninput = updateCharSize;

    // Special handling for charsets
    controls.charset.onchange = (e) => {
        const value = e.target.value;
        if (value === 'custom') {
            controls.customCharset.classList.remove('hidden');
            controls.customCharset.focus();
        } else {
            controls.customCharset.classList.add('hidden');
            rain.updateSetting('charRange', charSets[value]);
        }
        controls.preset.value = 'custom';
    };
    controls.customCharset.oninput = (e) => {
        rain.updateSetting('charRange', e.target.value);
        controls.preset.value = 'custom';
    };

    // When any control is changed, set the preset dropdown to 'custom'
    document.querySelectorAll('.controls input, .controls select').forEach(el => {
        if (el.id !== 'preset-select') {
            el.addEventListener('input', () => controls.preset.value = 'custom');
        }
    });


    // --- INITIALIZATION ---
    syncControlsToState(); // Set initial values of inputs from settings
    rain.start(); // Start the animation automatically
});
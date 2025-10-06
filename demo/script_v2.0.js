document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrix-canvas');

    // Map for character set dropdown
    const charSetMap = {
        kana: [[0x3041, 3096], [0x30A0, 0x30FA]],
        ascii: [[0x0021, 0x007e]],
        binary: '01', // '0' and '1'
        cyrillic: [[0x0400, 0x04FF]],
        emoji: [[0x1F600, 0x1F64F]], // Basic smileys
        numbers: '0123456789',
    };

    // Define all initial settings in one place
    const initialSettings = {
        fps: 30,
        density: 0.25,
        trailDecay: 0.25,
        charRange: charSetMap.kana,
        charChangeFreq: 0.5,
        charSize: [10, 40],
        charSpacing: 1.0,
        fg: '#00ff00',
        bg: '#000000',
        font: 'serif',
        width: 500,
        height: 500,
    };

    const rain = new RainChar(canvas, initialSettings);

    // --- UI Control Logic ---
    const controls = {
        density: document.getElementById('density-input'),
        trail: document.getElementById('trail-input'),
        fg: document.getElementById('fg-color'),
        bg: document.getElementById('bg-color'),
        minSize: document.getElementById('min-size-input'),
        maxSize: document.getElementById('max-size-input'),
        spacing: document.getElementById('spacing-input'),
        changeFreq: document.getElementById('change-freq-input'),
        charset: document.getElementById('charset-select'),
        fps: document.getElementById('fps-input'),
    };

    // Function to set initial values of inputs from settings
    const syncControls = () => {
        controls.density.value = initialSettings.density;
        controls.trail.value = initialSettings.trailDecay;
        controls.fg.value = initialSettings.fg;
        controls.bg.value = initialSettings.bg;
        controls.minSize.value = initialSettings.charSize[0];
        controls.maxSize.value = initialSettings.charSize[1];
        controls.spacing.value = initialSettings.charSpacing;
        controls.changeFreq.value = initialSettings.charChangeFreq;
        controls.fps.value = initialSettings.fps;
    };

    syncControls();

    // --- Add event listeners ---
    document.getElementById('start-btn').onclick = () => rain.start();
    document.getElementById('pause-btn').onclick = () => rain.pause();
    document.getElementById('stop-btn').onclick = () => rain.stop();

    controls.density.oninput = (e) => rain.updateSetting('density', parseFloat(e.target.value));
    controls.trail.oninput = (e) => rain.updateSetting('trailDecay', parseFloat(e.target.value));
    controls.fg.oninput = (e) => rain.updateSetting('fg', e.target.value);
    controls.bg.oninput = (e) => rain.updateSetting('bg', e.target.value);
    controls.spacing.oninput = (e) => rain.updateSetting('charSpacing', parseFloat(e.target.value));
    controls.changeFreq.oninput = (e) => rain.updateSetting('charChangeFreq', parseFloat(e.target.value));
    controls.fps.oninput = (e) => rain.updateSetting('fps', parseInt(e.target.value, 10));
    controls.charset.onchange = (e) => rain.updateSetting('charRange', charSetMap[e.target.value]);

    // Special handling for charSize range
    const updateCharSize = () => {
        const min = parseInt(controls.minSize.value, 10);
        const max = parseInt(controls.maxSize.value, 10);
        if (min <= max) {
            rain.updateSetting('charSize', [min, max]);
        }
    };
    controls.minSize.oninput = updateCharSize;
    controls.maxSize.oninput = updateCharSize;

    // Start the animation automatically
    rain.start();
});
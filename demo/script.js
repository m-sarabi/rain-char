// Initialize the RainChar instance with default options
const rain = new RainChar({
    id: 'rain',
    font: 'Verdana',
    parentId: 'effect',
    charRange: [0x0021, 0x007e],
});
rain.start();

// Utility function to clamp a value within a specified range
function clamp(value, min, max) {
    return Math.min(Math.max(min, value), max);
}

// Event listener for font change
document.getElementById('font').addEventListener('change', function () {
    this.value = this.value.trim();
    rain.font = this.value;
});

// Event listener for character size change
const charSizeInputs = [document.getElementById('char-size1'), document.getElementById('char-size2')];
charSizeInputs.forEach(input => {
    input.addEventListener('input', function () {
        input.value = clamp(Number(input.value), Number(input.getAttribute('min')), Number(input.getAttribute('max')));
        rain.charSize = charSizeInputs.map(input => input.value ? Number(input.value) : input.id === 'char-size1' ? 10 : 40);
    });
});

// Event listener for character range change
document.getElementById('char-range').addEventListener('change', function () {
    rain.charRange = JSON.parse(this.value.replace(/0x(\w+)/g, (match, p1) => parseInt(p1, 16)));
});

// Event listeners for color change (background and foreground)
['bg-color', 'fg-color'].forEach(id => {
    document.getElementById(id).addEventListener('input', function () {
        if (id === 'bg-color') rain.bg = this.value;
        else if (id === 'fg-color') rain.fg = this.value;
    });
});

// Event listener for FPS change
document.getElementById('fps').addEventListener('input', function () {
    this.value = clamp(Number(this.value), Number(this.getAttribute('min')), Number(this.getAttribute('max')));
    rain.fps = this.value;
});

// Event listener for density factor change
document.getElementById('density').addEventListener('input', function () {
    this.value = clamp(Number(this.value), Number(this.getAttribute('min')), Number(this.getAttribute('max')));
    rain.densityFactor = this.value;
});

// Event listener for trail multiplier change
document.getElementById('trail').addEventListener('input', function () {
    this.value = clamp(Number(this.value), Number(this.getAttribute('min')), Number(this.getAttribute('max')));
    rain.trailMultiplier = this.value;
});

// Event listener for character spacing change
document.getElementById('char-spacing').addEventListener('input', function () {
    this.value = clamp(Number(this.value), Number(this.getAttribute('min')), Number(this.getAttribute('max')));
    rain.charSpacing = this.value;
});

// Event listener for character change frequency change
document.getElementById('char-change').addEventListener('input', function () {
    this.value = clamp(Number(this.value), Number(this.getAttribute('min')), Number(this.getAttribute('max')));
    rain.charChangeFreq = this.value;
});

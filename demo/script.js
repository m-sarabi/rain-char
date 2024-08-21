// Initialize the RainChar instance with default options
const rain = new RainChar({
    id: 'rain',
    font: 'Verdana',
    parentId: 'effect',
});
rain.start();

// Utility function to restart the rain effect
function restartRain() {
    rain.start();
}

// Event listener for font change
document.getElementById('font').addEventListener('change', function () {
    rain._font = this.value;
    restartRain();
});

// Event listener for character size change
const charSizeInputs = [document.getElementById('char-size1'), document.getElementById('char-size2')];
charSizeInputs.forEach(input => {
    input.addEventListener('change', function () {
        rain._charSize = charSizeInputs.map(input => input.value ? Number(input.value) : input.id === 'char-size1' ? 10 : 40);
        restartRain();
    });
});

// Event listener for character range change
document.getElementById('char-range').addEventListener('change', function () {
    rain._charRange = this.value.split(' ').map(Number);
    restartRain();
});

// Event listeners for color change (background and foreground)
['bg-color', 'fg-color'].forEach(id => {
    document.getElementById(id).addEventListener('input', function () {
        rain[`_${id.replace('-color', '')}`] = this.value;
        restartRain();
    });
});

// Utility function to clamp a value within a specified range
function clamp(value, min, max) {
    return Math.min(Math.max(min, value), max);
}

// Event listener for FPS change
document.getElementById('fps').addEventListener('input', function () {
    this.value = clamp(Number(this.value), Number(this.getAttribute('min')), Number(this.getAttribute('max')));
    rain._fps = this.value;
    restartRain();
});

// Event listener for density factor change
document.getElementById('density').addEventListener('input', function () {
    this.value = clamp(Number(this.value), Number(this.getAttribute('min')), Number(this.getAttribute('max')));
    rain._densityFactor = this.value;
    restartRain();
});

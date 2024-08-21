const rain = new RainChar({
    id: 'rain',
    font: 'Verdana',
    parentId: 'effect',
    // charRange: [0x3041, 0x30FF],
});
rain.start();

document.getElementById('font').addEventListener('change', function () {
    rain._font = this.value;
    rain.start();
});

const charSize1 = document.getElementById('char-size1');
const charSize2 = document.getElementById('char-size2');
[charSize1, charSize2].forEach(charSize => {
    charSize.addEventListener('change', function () {
        rain._charSize = [charSize1.value ? Number(charSize1.value) : 10, charSize2.value ? Number(charSize2.value) : 40];
        rain.start();
    });
});

document.getElementById('char-range').addEventListener('change', function () {
    const range = this.value.split(' ').map(Number);
    rain._charRange = [range[0], range[1]];
    rain.start();
});

document.getElementById('bg-color').addEventListener('input', function () {
    rain._bg = this.value;
});

document.getElementById('fg-color').addEventListener('input', function () {
    rain._fg = this.value;
});

document.getElementById('fps').addEventListener('input', function () {
    this.value = Math.min(Math.max(Number(this.getAttribute('min')), this.value), Number(this.getAttribute('max')));
    rain._fps = this.value;
    rain.start();
});

document.getElementById('density').addEventListener('input', function () {
    this.value = Math.min(Math.max(Number(this.getAttribute('min')), this.value), Number(this.getAttribute('max')));
    rain._densityFactor = this.value;
    rain.start();
});
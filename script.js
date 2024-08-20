const rain = new RainChar({
    id: 'rain',
    parent_id: 'effect',
});
rain.start();

document.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        document.getElementById('rain').requestFullscreen().then();
    }
});
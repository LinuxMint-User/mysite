function updateClock() {
    const now = new Date();
    const hr = now.getHours();
    const min = now.getMinutes();
    const sec = now.getSeconds();

    var hr1 = Math.floor(hr / 10).toString(2).padStart(4, '0');
    var hr0 = (hr % 10).toString(2).padStart(4, '0');

    var min1 = Math.floor(min / 10).toString(2).padStart(4, '0');
    var min0 = (min % 10).toString(2).padStart(4, '0');

    var sec1 = Math.floor(sec / 10).toString(2).padStart(4, '0');
    var sec0 = (sec % 10).toString(2).padStart(4, '0');

    for (let i = 0; i < 4; i++) {
        document.getElementById('dot-sec0-' + i).className = 'dot';
        document.getElementById('dot-sec0-' + i).className = 'dot ' + (sec0.charAt(3 - i) == 1 ? 'on' : 'off');
    }

    for (let i = 0; i < 4; i++) {
        document.getElementById('dot-sec1-' + i).className = 'dot';
        document.getElementById('dot-sec1-' + i).className = 'dot ' + (sec1.charAt(3 - i) == 1 ? 'on' : 'off');
    }

    for (let i = 0; i < 4; i++) {
        document.getElementById('dot-min0-' + i).className = 'dot';
        document.getElementById('dot-min0-' + i).className = 'dot ' + (min0.charAt(3 - i) == 1 ? 'on' : 'off');
    }

    for (let i = 0; i < 4; i++) {
        document.getElementById('dot-min1-' + i).className = 'dot';
        document.getElementById('dot-min1-' + i).className = 'dot ' + (min1.charAt(3 - i) == 1 ? 'on' : 'off');
    }

    for (let i = 0; i < 4; i++) {
        document.getElementById('dot-hr0-' + i).className = 'dot';
        document.getElementById('dot-hr0-' + i).className = 'dot ' + (hr0.charAt(3 - i) == 1 ? 'on' : 'off');
    }

    for (let i = 0; i < 4; i++) {
        document.getElementById('dot-hr1-' + i).className = 'dot';
        document.getElementById('dot-hr1-' + i).className = 'dot ' + (hr1.charAt(3 - i) == 1 ? 'on' : 'off');
    }
}
setInterval(updateClock, 1000);
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

// 获取 header 元素
const header = document.querySelector('header');

// 创建 dot-matrix 容器
const clockContainer = document.createElement('div');
clockContainer.className = 'dot-matrix';
clockContainer.id = 'clock';
clockContainer.style.display = 'none';
clockContainer.style.flex = '1';
clockContainer.style.marginRight = '20px';

// 定义生成 dot 元素的函数
function createDotElement(id) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.id = id;
    return dot;
}

// 生成所有 dot 元素
const dotIds = [
    'dot-hr1-3', 'dot-hr0-3', 'dot-min1-3', 'dot-min0-3', 'dot-sec1-3', 'dot-sec0-3',
    'dot-hr1-2', 'dot-hr0-2', 'dot-min1-2', 'dot-min0-2', 'dot-sec1-2', 'dot-sec0-2',
    'dot-hr1-1', 'dot-hr0-1', 'dot-min1-1', 'dot-min0-1', 'dot-sec1-1', 'dot-sec0-1',
    'dot-hr1-0', 'dot-hr0-0', 'dot-min1-0', 'dot-min0-0', 'dot-sec1-0', 'dot-sec0-0'
];

dotIds.forEach(id => {
    clockContainer.appendChild(createDotElement(id));
});

// 将生成的 dot-matrix 容器插入到 header
header.insertBefore(clockContainer, header.firstChild);
document.getElementById('clock').style.display = 'grid';
setInterval(updateClock, 1000);
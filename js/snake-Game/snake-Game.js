const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;  // 获取设备像素比
const fontSize = 30 * dpr + 'px';

var cellSize = 15;
var canvasWidth;
var canvasHeight;
var marginX = 0;
var marginY = 0;

const renderDelay = 500; // 渲染间隔时间，单位毫秒

const startRestartBtn = document.getElementById('startRestartBtn');
const pauseResumeBtn = document.getElementById('pauseResumeBtn');
const statusIndicator = document.getElementById('status');
const scoreIndicator = document.getElementById('score');

let snake;
let direction;
let food;
let score = 0;
let lastRenderTime = 0; // 用于控制渲染时间

var speedUp = 300; // 加速削减的时间
var speeding = 0; // 是否加速
var isPlaying = false; // 游戏是否在进行中


resizeCanvas();
// 初加载在canvas上提示操作方法
let controlsCN0 = "两次按下相同方向键加速移动，";
let controlsCN1 = "再次按下相反方向键解除加速。";
// let controlsEN0 = "Press the key twice to speedup,";
// let controlsEN1 = "Press other keys to reset speed.";
ctx.font = '28px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
ctx.fillStyle = 'black';
ctx.fillText(`${controlsCN0}`, 5, 30);
ctx.fillText(`${controlsCN1}`, 5, 60);
// ctx.fillText(`${controlsEN0}`, 5, 90);
// ctx.fillText(`${controlsEN1}`, 5, 120);

/**
 * 调整Canvas分辨率以适应高分屏
 * @param {boolean} [render=false] - 是否在调整大小后立即重新渲染内容（默认不渲染）
 * @returns {void}
 */
// 调整 Canvas 分辨率以适应高分屏
function resizeCanvas(render = false) {
    // 获取 CSS 计算后的显示尺寸
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // 设置实际像素尺寸（放大 dpr 倍）
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    canvasWidth = Math.floor(canvas.width / cellSize);
    canvasHeight = Math.floor(canvas.height / cellSize);

    marginX = Math.floor(canvas.width % cellSize);
    marginY = Math.floor(canvas.height % cellSize);

    // 重新绘制内容
    if (render) {
        
    }
}

function isInSnake(x, y) {
    return snake.some(part => part.x === x && part.y === y);
}

function randomDirection() {
    const directions = ['right', 'left', 'up', 'down'];
    return directions[Math.floor(Math.random() * 4)];
}

function generateFood() {
    let newFood = {
        x: Math.floor(Math.random() * canvasWidth),
        y: Math.floor(Math.random() * canvasHeight)
    };

    // 获取蛇头的下一个位置
    const head = { x: snake[0].x, y: snake[0].y };
    const nextHead = { ...head };
    if (direction === 'right') nextHead.x = (nextHead.x + 1) % canvasWidth;
    else if (direction === 'left') nextHead.x = (nextHead.x - 1 + canvasWidth) % canvasWidth;
    else if (direction === 'up') nextHead.y = (nextHead.y - 1 + canvasHeight) % canvasHeight;
    else if (direction === 'down') nextHead.y = (nextHead.y + 1) % canvasHeight;

    // 如果生成的食物位置在蛇身上，或者在蛇头的前进方向上，则重新生成
    while (isInSnake(newFood.x, newFood.y) || (newFood.x === nextHead.x && newFood.y === nextHead.y)) {
        newFood = {
            x: Math.floor(Math.random() * canvasWidth),
            y: Math.floor(Math.random() * canvasHeight)
        };
    }

    return newFood;
}

function updateSnake() {
    const head = { x: snake[0].x, y: snake[0].y };

    if (direction === 'right') head.x = (head.x + 1) % canvasWidth;
    else if (direction === 'left') head.x = (head.x - 1 + canvasWidth) % canvasWidth;
    else if (direction === 'up') head.y = (head.y - 1 + canvasHeight) % canvasHeight;
    else if (direction === 'down') head.y = (head.y + 1) % canvasHeight;

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreIndicator.innerText = score;
        food = generateFood(); // 使用generateFood函数生成食物
        // 蛇吃到食物后，不缩短身体
    } else {
        // 每次移动时缩短一次身体
        snake.pop();
    }

    if (isInSnake(head.x, head.y)) {
        return false; // 撞到自己
    }

    snake.unshift(head);
    return true;
}

function changeDirection(newDirection) {
    // 检查新方向是否与当前方向相反
    if (newDirection === 'up' && direction === 'down' ||
        newDirection === 'down' && direction === 'up' ||
        newDirection === 'left' && direction === 'right' ||
        newDirection === 'right' && direction === 'left') {
            return;
    }
    else {
        direction = newDirection;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? 'green' : 'lightgreen';
        ctx.fillRect(part.x * cellSize + marginX, part.y * cellSize + marginY, cellSize - 1, cellSize - 1);
    });
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * cellSize + marginX, food.y * cellSize + marginY, cellSize - 1, cellSize - 1);
}

function gameLoop(timestamp) {
    if (!lastRenderTime || timestamp - lastRenderTime >= renderDelay - (speedUp * speeding)) {
        if (!updateSnake()) {
            isPlaying = false;
            statusIndicator.innerText = '结束';
            startRestartBtn.innerText = '重来';
            startRestartBtn.style.display = 'block';
            pauseResumeBtn.style.display = 'none'; // 隐藏暂停按钮
            return;
        }
        draw();
        lastRenderTime = timestamp;
    }
    if (isPlaying) {
        requestAnimationFrame(gameLoop);
    }
}

startRestartBtn.addEventListener('click', () => {
    pauseResumeBtn.style.display = 'none';
    if (!isPlaying) {
        // 重置游戏状态
        const centerRange = 0.6; // 中心区域大小（0.6表示中心60%区域）
        snake = [{ 
            x: Math.floor(canvasWidth/2 + (Math.random() - 0.5) * canvasWidth * centerRange),
            y: Math.floor(canvasHeight/2 + (Math.random() - 0.5) * canvasHeight * centerRange)
        }];
        direction = randomDirection();
        food = generateFood();
        score = 0;
        lastRenderTime = 0;
        isPlaying = false; // 确保游戏尚未开始

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '28px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'black';
        ctx.fillText(`READY...3`, canvas.width / 2 - 64, canvas.height / 2);
        // 显示倒计时状态
        // statusIndicator.innerText = '3';

        // 倒计时逻辑
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                // statusIndicator.innerText = `${countdown}`;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillText(`READY...${countdown}`, canvas.width / 2 - 64, canvas.height / 2);
            } else {
                clearInterval(countdownInterval); // 清除倒计时
                statusIndicator.innerText = '进行';
                isPlaying = true; // 开始游戏
                requestAnimationFrame(gameLoop); // 启动游戏循环
                pauseResumeBtn.disabled = false;
                pauseResumeBtn.style.opacity = 1.0;
            }
        }, 1000); // 每秒更新一次倒计时

        // 更新按钮状态
        startRestartBtn.innerText = '重来';
        pauseResumeBtn.innerText = '暂停';
        startRestartBtn.style.display = 'none';
        pauseResumeBtn.style.display = 'block'; // 显示暂停按钮
        pauseResumeBtn.disabled = true;
        pauseResumeBtn.style.opacity = 0.3;
    }
});

pauseResumeBtn.addEventListener('click', () => {
    if (isPlaying) {
        isPlaying = false;
        statusIndicator.innerText = '暂停';
        pauseResumeBtn.innerText = '继续';
        startRestartBtn.style.display = 'block';
    } else {
        isPlaying = true;
        requestAnimationFrame(gameLoop);
        statusIndicator.innerText = '进行';
        pauseResumeBtn.innerText = '暂停';
        startRestartBtn.style.display = 'none';
    }
});

function directionInputHandler(inputDirection) {
    if (direction == inputDirection) {
        speeding = 1;
    }
    else if (inputDirection === 'up' && direction === 'down' ||
        inputDirection === 'down' && direction === 'up' ||
        inputDirection === 'left' && direction === 'right' ||
        inputDirection === 'right' && direction === 'left') {
            speeding = 0;
    } else {
        changeDirection(inputDirection);
    }
}

document.addEventListener('keydown', ({ key }) => {
    if (isPlaying) {
        switch (key) {
            case 'ArrowRight':
                directionInputHandler('right')
                break;
            case 'ArrowLeft':
                directionInputHandler('left');
                break;
            case 'ArrowUp':
                directionInputHandler('up');
                break;
            case 'ArrowDown':
                directionInputHandler('down');
                break;
        }
    }
});

// 按钮支持
document.getElementById('upBtn').addEventListener('click', () => directionInputHandler('up'));
document.getElementById('leftBtn').addEventListener('click', () => directionInputHandler('left'));
document.getElementById('downBtn').addEventListener('click', () => directionInputHandler('down'));
document.getElementById('rightBtn').addEventListener('click', () => directionInputHandler('right'));

// 移动端检测
const controlButtons = document.querySelector('.control-buttons');
if (isMobileDevice()) {
    controlButtons.style.display = 'grid'; // 显示按钮
} else {
    controlButtons.style.display = 'none'; // 隐藏按钮
}
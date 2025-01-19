const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 16;
const canvasWidth = 20;
const canvasHeight = 20;
let snake = [{ x: 9, y: 9 }];
let direction = 'right';
let food = {
    x: Math.floor(Math.random() * canvasWidth),
    y: Math.floor(Math.random() * canvasHeight)
};
let score = 0;
let lastRenderTime = 0; // 用于控制渲染时间
const renderDelay = 200; // 渲染间隔时间，单位毫秒
let isPlaying = false; // 游戏是否在进行中

function isInSnake(x, y) {
    return snake.some(part => part.x === x && part.y === y);
}

function generateFood() {
    let newFood = {
        x: Math.floor(Math.random() * canvasWidth),
        y: Math.floor(Math.random() * canvasHeight)
    };
    // 如果生成的食物位置在蛇身上，则重新生成
    while (isInSnake(newFood.x, newFood.y)) {
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
    direction = newDirection;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? 'green' : 'lightgreen';
        ctx.fillRect(part.x * cellSize, part.y * cellSize, cellSize - 1, cellSize - 1);
    });
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize - 1, cellSize - 1);
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Score: ${score}`, 5, 20);
}

function gameLoop(timestamp) {
    if (!lastRenderTime || timestamp - lastRenderTime >= renderDelay) {
        if (!updateSnake()) {
            isPlaying = false;
            //alert('游戏结束！');
            document.getElementById('startRestartBtn').innerText = '重新开始';
            document.getElementById('startRestartBtn').style.display = 'block';
            document.getElementById('pauseResumeBtn').style.display = 'none'; // 隐藏暂停按钮
            return;
        }
        draw();
        lastRenderTime = timestamp;
    }
    if (isPlaying) {
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', ({ key }) => {
    if (isPlaying) {
        switch (key) {
            case 'ArrowRight':
                changeDirection('right');
                break;
            case 'ArrowLeft':
                changeDirection('left');
                break;
            case 'ArrowUp':
                changeDirection('up');
                break;
            case 'ArrowDown':
                changeDirection('down');
                break;
        }
    }
});

const startRestartBtn = document.getElementById('startRestartBtn');
startRestartBtn.addEventListener('click', () => {
    if (!isPlaying) {
        snake = [{ x: 9, y: 9 }];
        direction = 'right';
        food = generateFood(); // 使用generateFood函数生成食物
        score = 0;
        lastRenderTime = 0;
        isPlaying = true;
        requestAnimationFrame(gameLoop);
        startRestartBtn.innerText = '重新开始';
        document.getElementById('pauseResumeBtn').innerText = '暂停游戏';
        document.getElementById('pauseResumeBtn').style.display = 'block'; // 显示暂停按钮
        document.getElementById('startRestartBtn').style.display = 'none';
    }
});

document.getElementById('pauseResumeBtn').addEventListener('click', () => {
    if (isPlaying) {
        isPlaying = false;
        document.getElementById('pauseResumeBtn').innerText = '继续游戏';
        document.getElementById('startRestartBtn').style.display = 'block';
    } else {
        isPlaying = true;
        requestAnimationFrame(gameLoop);
        document.getElementById('pauseResumeBtn').innerText = '暂停游戏';
        document.getElementById('startRestartBtn').style.display = 'none';
    }
});
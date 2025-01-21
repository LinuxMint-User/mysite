const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 15;
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

// 初加载在canvas上提示操作方法
let controlsCN = "操作方法：桌面端：⬆⬇⬅➡ 移动端：A B X Y";
let controlsEN = "control: desktop: ⬆⬇⬅➡ mobile: A B X Y";
ctx.font = '14px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
ctx.fillStyle = 'black';
ctx.fillText(`${controlsCN}`, 5, 120);
ctx.fillText(`${controlsEN}`, 5, 140);


function isInSnake(x, y) {
    return snake.some(part => part.x === x && part.y === y);
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
    // ctx.font = '16px Arial';
    // ctx.fillStyle = 'black';
    // ctx.fillText(`Score: ${score}`, 5, 20);
    document.getElementById('score').innerText = score;
}

function gameLoop(timestamp) {
    if (!lastRenderTime || timestamp - lastRenderTime >= renderDelay) {
        if (!updateSnake()) {
            isPlaying = false;
            //alert('游戏结束！');
            document.getElementById('status').innerText = '结束';
            document.getElementById('startRestartBtn').innerText = '重来';
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
        // 重置游戏状态
        snake = [{ x: 9, y: 9 }];
        direction = 'right';
        food = generateFood();
        score = 0;
        lastRenderTime = 0;
        isPlaying = false; // 确保游戏尚未开始

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '20px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.fillStyle = 'black';
        ctx.fillText(`READY...`, 100, 120);
        // 显示倒计时状态
        document.getElementById('status').innerText = '3';

        // 倒计时逻辑
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                document.getElementById('status').innerText = `${countdown}`;
            } else {
                clearInterval(countdownInterval); // 清除倒计时
                document.getElementById('status').innerText = '进行';
                isPlaying = true; // 开始游戏
                requestAnimationFrame(gameLoop); // 启动游戏循环
            }
        }, 1000); // 每秒更新一次倒计时

        // 更新按钮状态
        startRestartBtn.innerText = '重来';
        document.getElementById('pauseResumeBtn').innerText = '暂停';
        document.getElementById('pauseResumeBtn').style.display = 'block'; // 显示暂停按钮
        document.getElementById('startRestartBtn').style.display = 'none';
    }
});

document.getElementById('pauseResumeBtn').addEventListener('click', () => {
    if (isPlaying) {
        isPlaying = false;
        document.getElementById('status').innerText = '暂停';
        document.getElementById('pauseResumeBtn').innerText = '继续';
        document.getElementById('startRestartBtn').style.display = 'block';
    } else {
        isPlaying = true;
        requestAnimationFrame(gameLoop);
        document.getElementById('status').innerText = '进行';
        document.getElementById('pauseResumeBtn').innerText = '暂停';
        document.getElementById('startRestartBtn').style.display = 'none';
    }
});

// 触屏支持
// var startX, startY, moveX, moveY;
// var gameArea = document.getElementById('snakeCanvas'); // 假设你的 Canvas ID 是 "snakeCanvas"

// // 触摸开始时记录初始位置
// gameArea.addEventListener('touchstart', function (event) {
//     event.preventDefault(); // 防止默认行为（如页面滚动）
//     var touch = event.touches[0];
//     startX = touch.pageX;
//     startY = touch.pageY;
// });

// // 触摸移动时记录移动距离
// gameArea.addEventListener('touchmove', function (event) {
//     event.preventDefault(); // 防止默认行为
//     var touch = event.touches[0];
//     moveX = touch.pageX - startX;
//     moveY = touch.pageY - startY;
// });

// // 触摸结束时判断滑动方向并更新蛇的方向
// gameArea.addEventListener('touchend', function (event) {
//     event.preventDefault(); // 防止默认行为

//     // 判断水平滑动还是垂直滑动
//     if (Math.abs(moveX) > Math.abs(moveY)) {
//         // 水平滑动
//         if (moveX < 0) {
//             // 向左滑动
//             changeDirection('left');
//         } else {
//             // 向右滑动
//             changeDirection('right');
//         }
//     } else {
//         // 垂直滑动
//         if (moveY < 0) {
//             // 向上滑动
//             changeDirection('up');
//         } else {
//             // 向下滑动
//             changeDirection('down');
//         }
//     }
// });

// 按钮支持
document.getElementById('upBtn').addEventListener('click', () => changeDirection('up'));
document.getElementById('leftBtn').addEventListener('click', () => changeDirection('left'));
document.getElementById('downBtn').addEventListener('click', () => changeDirection('down'));
document.getElementById('rightBtn').addEventListener('click', () => changeDirection('right'));

// 移动端检测
const controlButtons = document.querySelector('.control-buttons');
if (isMobileDevice()) {
    controlButtons.style.display = 'grid'; // 显示按钮
} else {
    controlButtons.style.display = 'none'; // 隐藏按钮
}
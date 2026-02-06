const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const marginX = 12;
const marginY = marginX;
const dpr = window.devicePixelRatio || 1;  // 获取设备像素比
const fontSize = 20 * dpr + 'px';
const blockNumFontSize = 32 * dpr + 'px';

var canvasWidth;
var canvasHeight;
var cellSize = Math.floor((canvas.width - marginX * 2) / 4);

let lastTimestamp = null;

const voidBlockColor = '#ccc0b3';

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

    // 重新绘制内容
    if (render) {
        renderAllBlock(currentNumberTable);
    }
}

/**
 * 根据数字块的值返回对应的文字颜色
 * @param {number} number - 数字块的值(2,4,8...)
 * @returns {string} - 返回对应的文字颜色代码
 * 
 * 当数字小于等于4时返回深灰色(#776e65)，其他情况返回白色(white)
 * 这样设计是为了确保文字在不同背景色上都有良好的可读性
 */
function renderingTextByNumber(number) {
    if (number === 0) {
        return voidBlockColor;
    } else if (number <= 4) {
        return "#776e65";  // 深灰色，适合浅色背景
    }
    return "white";  // 白色，适合深色背景
}

/**
 * 根据数字块的值返回对应的背景颜色
 * @param {number} number - 数字块的值(2,4,8...)
 * @returns {string} - 返回对应的背景颜色代码
 * 
 * 使用switch语句为不同数字值分配不同的背景颜色
 * 颜色从浅到深渐变，对应数字从小到大
 * 确保每个数字块都有独特的视觉标识
 */
function renderingBackgroundByNumber(number) {
    switch (number) {
        case 0:
            return voidBlockColor;
        case 2:
            return "#FCE4D6";  // 浅米色
        case 4:
            return "#EEDC94";  // 浅黄色
        case 8:
            return "#FDB863";  // 橙色
        case 16:
            return "#FD8D3C";  // 深橙色
        case 32:
            return "#F16713";  // 红橙色
        case 64:
            return "#D94810";  // 深红橙色
        case 128:
            return "#A63603";  // 砖红色
        case 256:
            return "#8F270E";  // 深砖红色
        case 512:
            return "#69221B";  // 红棕色
        case 1024:
            return "#4C1628";  // 深紫红色
        case 2048:
            return "#2F073F";  // 深紫色
        case 4096:
            return "#18003F";  // 深蓝紫色
        case 8192:
            return "#0C002B";  // 接近黑色的深蓝色
    }
}

function renderBlock(col, row, bgColor, fontColor, num) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(col * ((canvas.width - (marginX * 5)) / 4) + (col + 1) * marginX, row * ((canvas.height - (marginY * 5)) / 4) + (row + 1) * marginY, ((canvas.width - (marginX * 5)) / 4), ((canvas.height - (marginY * 5)) / 4));

    ctx.font = blockNumFontSize + ' Arial, Helvetica, sans-serif';
    ctx.fillStyle = fontColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(num == 0 ? '' : num, Math.floor(col * ((canvas.width - (marginX * 5)) / 4) + (col + 1) * marginX + ((canvas.width - (marginX * 5)) / 4) / 2), Math.floor(row * ((canvas.height - (marginY * 5)) / 4) + (row + 1) * marginY + ((canvas.height - (marginY * 5)) / 4) / 2));
}

function renderAllBlock(table) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            renderBlock(i, j, renderingBackgroundByNumber(table[i][j]), renderingTextByNumber(table[i][j]), table[i][j]);
        }
    }
}

/**
 * 渲染静态方块及其边框
 * @param {Array} table - 4x4游戏面板二维数组
 * 
 * 1. 遍历游戏面板每个格子
 * 2. 检查当前格子是否在动画队列中移动
 * 3. 如果不在移动中，则渲染完整的方块(包括背景和数字)
 * 4. 如果在移动中，则只渲染该位置的边框(作为占位符)
 */
function renderStaticBlocksWithBorders(table) {
    // 遍历4x4游戏面板
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {

            // 检查当前格子是否在动画队列中(作为起点或终点)
            let isMoving = animationQueue.some(anim =>
                (anim.fromX === i && anim.fromY === j) ||
                (anim.toX === i && anim.toY === j)
            );

            if (!isMoving) {
                // 渲染完整的方块(背景+数字)
                renderBlock(i, j,
                    renderingBackgroundByNumber(table[i][j]),
                    renderingTextByNumber(table[i][j]),
                    table[i][j]
                );
            } else {
                renderBlock(i, j,
                    renderingBackgroundByNumber(0),
                    renderingTextByNumber(0), 0);
            }
        }
    }
}

let animationQueue = [];
let isAnimating = false;

/**
 * 处理方块移动动画
 * @param {number} fx - 起始位置的x坐标(列索引)
 * @param {number} fy - 起始位置的y坐标(行索引) 
 * @param {number} tx - 目标位置的x坐标(列索引)
 * @param {number} ty - 目标位置的y坐标(行索引)
 * 
 * 1. 检查起始位置是否有数字块(为0则直接返回)
 * 2. 计算起始和目标的屏幕坐标位置
 * 3. 获取数字块的数值、背景色和文字颜色
 * 4. 将动画信息加入队列
 * 5. 如果没有正在进行的动画，则启动动画
 */
function moveAnimation(fx, fy, tx, ty) {
    // 检查起始位置是否为空
    if (currentNumberTable[fx][fy] === 0) return;

    // 计算起始和结束的屏幕坐标
    const startX = fx * ((canvas.width - (marginX * 5)) / 4) + (fx + 1) * marginX;
    const startY = fy * ((canvas.height - (marginY * 5)) / 4) + (fy + 1) * marginY;
    const endX = tx * ((canvas.width - (marginX * 5)) / 4) + (tx + 1) * marginX;
    const endY = ty * ((canvas.height - (marginY * 5)) / 4) + (ty + 1) * marginY;

    // 获取数字块的属性
    const number = currentNumberTable[fx][fy];
    const bgColor = renderingBackgroundByNumber(number);
    const textColor = renderingTextByNumber(number);

    // 将动画信息加入队列
    animationQueue.push({
        x: startX,
        y: startY,
        targetX: endX,
        targetY: endY,
        progress: 0,  // 动画进度(0-1)
        number: number,
        bgColor: bgColor,
        textColor: textColor,
        fromX: fx,    // 起始列索引
        fromY: fy,    // 起始行索引
        toX: tx,      // 目标列索引
        toY: ty       // 目标行索引
    });

    // 如果没有正在进行的动画，则启动动画
    if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animateBlocks);
    }
}


/**
 * 执行动画帧渲染
 * @param {number} timestamp - 当前时间戳，由requestAnimationFrame提供
 * 
 * 1. 计算时间差(deltaTime)用于平滑动画
 * 2. 清空画布并渲染静态方块
 * 3. 处理动画队列中的每个动画：
 *    - 更新动画进度
 *    - 移除已完成动画
 *    - 计算当前动画位置
 *    - 绘制动画方块
 * 4. 根据动画队列状态决定是否继续动画或结束
 */
function animateBlocks(timestamp) {
    // 初始化时间戳和计算时间差
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // 清空画布并渲染静态方块
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderStaticBlocksWithBorders(currentNumberTable);
    // renderAllBlock(currentNumberTable);

    // 处理动画队列
    for (let i = 0; i < animationQueue.length; i++) {
        const anim = animationQueue[i];
        // 更新动画进度(基于时间差)
        anim.progress += deltaTime / 200;

        // 检查动画是否完成
        if (anim.progress >= 1) {
            animationQueue.splice(i, 1);
            i--;
            continue;
        }

        // 计算当前动画位置(线性插值)
        const currentX = anim.x + (anim.targetX - anim.x) * anim.progress;
        const currentY = anim.y + (anim.targetY - anim.y) * anim.progress;

        // 绘制方块边框
        // ctx.strokeStyle = 'black';
        // ctx.lineWidth = 0.7;
        // ctx.strokeRect(currentX, currentY,
        //     ((canvas.width - (marginX * 5)) / 4),
        //     ((canvas.height - (marginY * 5)) / 4));

        // 绘制方块背景
        ctx.fillStyle = anim.bgColor;
        ctx.fillRect(currentX, currentY,
            ((canvas.width - (marginX * 5)) / 4),
            ((canvas.height - (marginY * 5)) / 4));

        // 绘制方块数字
        ctx.font = blockNumFontSize + ' Arial, Helvetica, sans-serif';
        ctx.fillStyle = anim.textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(anim.number,
            currentX + ((canvas.width - (marginX * 5)) / 4) / 2,
            currentY + ((canvas.height - (marginY * 5)) / 4) / 2);
    }

    // 决定是否继续动画循环
    if (animationQueue.length > 0) {
        requestAnimationFrame(animateBlocks);
    } else {
        // 动画结束，重置状态并刷新界面
        isAnimating = false;
        lastTimestamp = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderAllBlock(currentNumberTable);

    }
}

function multiLineTextRendering(font, fontColor, content, startX, startY, lineHeight) {
    // 字体优先级：自定义字体 > 自定义大小+默认字体族 > 默认大小(适配DPR)+默认字体族
    ctx.font = font === null ? (fontSize === null ? (20 * (dpr === null ? (window.devicePixelRatio || 1) : dpr) + 'px') : fontSize + ' Arial, Helvetica, sans-serif') : font;
    // ctx.fillStyle = fontColor === null ? 'black' : fontColor;

    for (let row = 0; row < content.length; row++) {
        if (fontColor !== null || fontColor !== '') {
            if (Array.isArray(fontColor)) {
                ctx.fillStyle = fontColor[row];
            } else {
                ctx.fillStyle = fontColor;
            }
        } else {
            ctx.fillStyle = 'black';
        }
        ctx.fillText(content[row], startX, startY + lineHeight * (row + 1) * (dpr === null ? (window.devicePixelRatio || 1) : dpr));
    }
}

function initRendering() {
    let font = fontSize + ' Arial, Helvetica, sans-serif';
    let fontColor = 'black';
    let content = ['单击多选框可选择游戏难度', '更多功能单击右上角菜单查看'];
    multiLineTextRendering(font, fontColor, content, canvasWidth + cellSize / 2, canvasHeight, (cellSize / 2));
}

window.addEventListener('resize', function () {
    if (gameStatus == 1) {
        resizeCanvas(1);
    }
});

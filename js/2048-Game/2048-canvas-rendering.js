const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;  // 获取设备像素比
const marginX = 8 * dpr;
const marginY = marginX;
const fontSize = 20 * dpr + 'px';
const initMessagefontSize = 20 * dpr + 'px';
const blockNumFontSize = 32 * dpr + 'px';
const fontFamily = 'Arial, Helvetica, sans-serif';

let blockSize = ((canvas.width - (marginX * 5)) / 4);
let canvasTextLineHeight = (blockSize / (2 * dpr));

let lastTimestamp = null;
let animationQueue = [];
let isAnimating = false;

const renderingType = {
    singleBlock: 'singleBlock',
    singleBlockDirect: 'singleBlockDirect',
    allBlocks: 'allBlocks',
    allBlocksDirect: 'allBlocksDirect'
};

const animationType = {
    move: 'move',
    renderBlock: 'renderBlock',
    renderAll: 'renderAll'
};
const animationTime = {
    move: 200,
    renderBlock: 200,
    renderAll: 200
};

const voidBlockColor = '#ccc0b3';
const blockTextColor = {
    voidBlock: voidBlockColor,
    lightBgBlock: '#776e65',
    darkBgBlock: 'white'
};
const blockBgColor = {
    0: voidBlockColor,
    2: '#FCE4D6',  // 浅米色
    4: '#EEDC94',  // 浅黄色
    8: '#FDB863',  // 橙色
    16: '#FD8D3C',  // 深橙色
    32: '#F16713',  // 红橙色
    64: '#D94810',  // 深红橙色
    128: '#A63603',  // 砖红色
    256: '#8F270E',  // 深砖红色
    512: '#69221B',  // 红棕色
    1024: '#4C1628',  // 深紫红色
    2048: '#2F073F',  // 深紫色
    4096: '#18003F',  // 深蓝紫色
    8192: '#0C002B'  // 接近黑色的深蓝色
};

const buttonTextMap = {
    newGameButton: {
        startGame: '开始游戏',
        endGame: '结束游戏'
    },
    replayButtonControl: {
        play: '播放',
        pause: '暂停'
    },
    replayButtonNext: {
        nextStep: '下一',
        replay: '重播'
    },
    replayButtonPrev: {
        prevStep: '上一'
    }
};

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

    blockSize = ((canvas.width - (marginX * 5)) / 4);
    canvasTextLineHeight = (blockSize / (2 * dpr));

    // 重新绘制内容
    if (render) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (gameStatus !== gameStatusEnum.idle) {
            renderAllBlocksDirectly(currentNumberTable);
        } else {
            initRendering();
        }

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
function getNumberColor(number) {
    if (number === 0) {
        return blockTextColor.voidBlock;
    } else if (number <= 4) {
        return blockTextColor.lightBgBlock;  // 深灰色，适合浅色背景
    }
    return blockTextColor.darkBgBlock;  // 白色，适合深色背景
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
function getNumberBgColor(number) {
    switch (number) {
        case 0:
            return blockBgColor[number];
        case 2:
            return blockBgColor[number];
        case 4:
            return blockBgColor[number];
        case 8:
            return blockBgColor[number];
        case 16:
            return blockBgColor[number];
        case 32:
            return blockBgColor[number];
        case 64:
            return blockBgColor[number];
        case 128:
            return blockBgColor[number];
        case 256:
            return blockBgColor[number];
        case 512:
            return blockBgColor[number];
        case 1024:
            return blockBgColor[number];
        case 2048:
            return blockBgColor[number];
        case 4096:
            return blockBgColor[number];
        case 8192:
            return blockBgColor[number];
        default:
            return blockBgColor[8192];
    }
}

// 直接渲染的辅助函数
function renderBlockDirectly(col, row, bgColor, fontColor, num) {
    const startX = col * blockSize + (col + 1) * marginX;
    const startY = row * blockSize + (row + 1) * marginY;

    ctx.fillStyle = bgColor;
    ctx.fillRect(startX, startY, blockSize, blockSize);

    ctx.font = blockNumFontSize + ' ' + fontFamily;
    autoCanvasTextSize(ctx, String(num), blockSize, marginX);

    ctx.fillStyle = fontColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
        num === 0 ? '' : num,
        Math.floor(startX + blockSize / 2),
        Math.floor(startY + blockSize / 2)
    );
}

function renderBlockAnimated(col, row, bgColor, fontColor, num) {
    // 加入动画队列
    animationQueue.push({
        type: animationType.renderBlock,
        col: col,
        row: row,
        bgColor: bgColor,
        fontColor: fontColor,
        num: num,
        progress: 0
    });

    // 启动动画循环
    if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animateBlocks);
    }
}

function renderAllBlocksDirectly(table) {
    for (let row = 0; row < table.length; row++) {
        for (let col = 0; col < table[row].length; col++) {
            renderBlockDirectly(col, row,
                getNumberBgColor(table[row][col]),
                getNumberColor(table[row][col]),
                table[row][col]
            );
        }
    }
}

function renderAllBlocksAnimated(table) {
    // 加入动画队列
    animationQueue.push({
        type: animationType.renderAll,
        table: JSON.parse(JSON.stringify(table)), // 深拷贝表格数据
        progress: 0
    });

    // 启动动画循环
    if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(animateBlocks);
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
    // 遍历游戏面板
    for (let row = 0; row < table.length; row++) {
        for (let col = 0; col < table[row].length; col++) {
            // 检查当前格子是否在动画队列中(作为起点或终点)
            let isMoving = animationQueue.some(anim =>
                (anim.fromCol === col && anim.fromRow === row) ||
                (anim.toCol === col && anim.toRow === row)
            );

            if (!isMoving) {
                // 渲染完整的方块(背景+数字)
                renderBlockDirectly(col, row,
                    getNumberBgColor(table[row][col]),
                    getNumberColor(table[row][col]),
                    table[row][col]
                );
            } else {
                renderBlockDirectly(col, row,
                    getNumberBgColor(0),
                    getNumberColor(0), 0);
            }
        }
    }
}

/**
 * 处理方块移动动画
 * @param {number} fcol - 起始位置的列索引
 * @param {number} frow - 起始位置的行索引
 * @param {number} tcol - 目标位置的列索引
 * @param {number} trow - 目标位置的行索引
 * @param {array} table - 要检测的游戏矩阵
 * 
 * 1. 检查起始位置是否有数字块(为0则直接返回)
 * 2. 计算起始和目标的屏幕坐标位置
 * 3. 获取数字块的数值、背景色和文字颜色
 * 4. 将动画信息加入队列
 * 5. 如果没有正在进行的动画，则启动动画
 */
function moveAnimation(fcol, frow, tcol, trow, table) {
    // 检查起始位置是否为空
    if (table[frow][fcol] === 0) return;

    // 计算起始和结束的屏幕坐标
    const startX = fcol * blockSize + (fcol + 1) * marginX;
    const startY = frow * blockSize + (frow + 1) * marginY;
    const endX = tcol * blockSize + (tcol + 1) * marginX;
    const endY = trow * blockSize + (trow + 1) * marginY;

    // 获取数字块的属性
    const number = table[frow][fcol];
    const bgColor = getNumberBgColor(number);
    const textColor = getNumberColor(number);

    // 将动画信息加入队列
    animationQueue.push({
        type: animationType.move,
        x: startX,
        y: startY,
        targetX: endX,
        targetY: endY,
        progress: 0,  // 动画进度(0-1)
        number: number,
        bgColor: bgColor,
        textColor: textColor,
        fromCol: fcol,    // 起始列索引
        fromRow: frow,    // 起始行索引
        toCol: tcol,      // 目标列索引
        toRow: trow       // 目标行索引
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
    const deltaTime = Math.min(timestamp - lastTimestamp, 100);
    lastTimestamp = timestamp;

    // 清空画布并渲染静态方块
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // console.log('animateBlocks calling');
    renderStaticBlocksWithBorders(currentNumberTable);

    // 处理动画队列
    for (let i = 0; i < animationQueue.length; i++) {
        const anim = animationQueue[i];

        switch (anim.type) {
            case animationType.move:
                // 检查动画是否完成
                if (anim.progress >= 1) {
                    animationQueue.splice(i, 1);
                    i--;
                    continue;
                }

                // 计算当前动画位置(线性插值)
                const currentX = anim.x + (anim.targetX - anim.x) * anim.progress;
                const currentY = anim.y + (anim.targetY - anim.y) * anim.progress;

                // 绘制方块背景
                ctx.fillStyle = anim.bgColor;
                ctx.fillRect(currentX, currentY, blockSize, blockSize);

                // 绘制方块数字
                ctx.font = blockNumFontSize + ' ' + fontFamily;

                autoCanvasTextSize(ctx, String((anim.number)), blockSize, marginX);

                ctx.fillStyle = anim.textColor;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(anim.number, currentX + blockSize / 2, currentY + blockSize / 2);

                // 更新动画进度(基于时间差)
                anim.progress += deltaTime / animationTime.move;
                break;

            case animationType.renderBlock:
                // 渲染单个方块动画（可以添加淡入效果）
                if (anim.progress >= 1) {
                    // 动画完成，直接渲染最终状态
                    renderBlockDirectly(anim.col, anim.row, anim.bgColor, anim.fontColor, anim.num);
                    animationQueue.splice(i, 1);
                    i--;
                } else {
                    // 可以添加淡入效果或其他动画
                    renderBlockAnimEffect(anim);
                }

                // 更新动画进度(基于时间差)
                anim.progress += deltaTime / animationTime.renderBlock;
                break;

            case animationType.renderAll:
                // 渲染整个面板动画
                if (anim.progress >= 1) {
                    renderAllBlocksDirectly(anim.table);
                    animationQueue.splice(i, 1);
                    i--;
                } else {
                    // 可以添加整体淡入效果
                    renderAllAnimEffect(anim);
                }

                // 更新动画进度(基于时间差)
                anim.progress += deltaTime / animationTime.renderAll;
                break;
        }

    }

    // 决定是否继续动画循环
    if (animationQueue.length > 0) {
        requestAnimationFrame(animateBlocks);
    } else {
        // 动画结束，重置状态并刷新界面
        isAnimating = false;
        lastTimestamp = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderAllBlocksDirectly(currentNumberTable);

    }
}

// 带动画效果的方块渲染
function renderBlockAnimEffect(anim) {
    // 简单的淡入效果
    const alpha = anim.progress;
    ctx.globalAlpha = alpha;
    renderBlockDirectly(anim.col, anim.row, anim.bgColor, anim.fontColor, anim.num);
    ctx.globalAlpha = 1;
}

// 带动画效果的整体渲染
function renderAllAnimEffect(anim) {
    const alpha = anim.progress;
    ctx.globalAlpha = alpha;
    renderAllBlocksDirectly(anim.table);
    ctx.globalAlpha = 1;
}

function multiLineTextRendering(renderingData = {
    fontConfig: { font: null, fontColor: 'black' }, content: [''], coordinates: { startX, startY },
    lineHeight: 0, autoConfig: { AutoFontSize: false, AutoLineWrap: false }
}) {

    // 字体优先级：自定义字体 > 自定义大小+默认字体族 > 默认大小(适配DPR)+默认字体族
    ctx.font = renderingData.fontConfig.font === null ? (fontSize === null ? (20 * (dpr === null ? (window.devicePixelRatio || 1) : dpr) + 'px') : fontSize + ' ' + fontFamily) : renderingData.fontConfig.font;

    if (renderingData.autoConfig.AutoLineWrap) {
        let row = 0;
        let substringIndex = 0;
        while (row < renderingData.content.length) {
            if (ctx.measureText(renderingData.content[row]).width >= canvas.width - renderingData.coordinates.startX * 2) {
                substringIndex = renderingData.content[row].length - 1;
                while (ctx.measureText(renderingData.content[row].substring(0, substringIndex)).width >= canvas.width - renderingData.coordinates.startX * 2) {
                    substringIndex -= 1;
                }
                if (substringIndex === 0) {
                    substringIndex = 1;
                }
                renderingData.content.splice(row, 1, renderingData.content[row].substring(0, substringIndex), renderingData.content[row].substring(substringIndex));
            } else {
                row += 1;
            }
        }
    }

    for (let row = 0; row < renderingData.content.length; row++) {
        if (renderingData.fontConfig.fontColor !== null || renderingData.fontConfig.fontColor !== '') {
            if (Array.isArray(renderingData.fontConfig.fontColor)) {
                ctx.fillStyle = renderingData.fontConfig.fontColor[row];
            } else {
                ctx.fillStyle = renderingData.fontConfig.fontColor;
            }
        } else {
            ctx.fillStyle = 'black';
        }
        if (renderingData.autoConfig.AutoFontSize) {
            autoCanvasTextSize(ctx, renderingData.content[row], canvas.width, renderingData.coordinates.startX);
        }
        ctx.fillText(renderingData.content[row], renderingData.coordinates.startX, renderingData.coordinates.startY + renderingData.lineHeight * (row + 1) * (dpr === null ? (window.devicePixelRatio || 1) : dpr));
    }
}

function autoCanvasTextSize(ctx, text, maxWidth, marginX = 0) {
    let fontSize;
    let fontFamily;
    let currentFont = ctx.font;
    let fontParts = currentFont.match(/(\d+)px\s+(.+)/);
    if (fontParts) {
        fontSize = Number(fontParts[1]);
        fontFamily = fontParts[2];
    }
    while (ctx.measureText(text).width >= maxWidth - marginX * 2) {
        fontSize -= 1;
        ctx.font = `${fontSize}px ${fontFamily}`;
    }
}

function initRendering() {
    const font = fontSize + ' ' + fontFamily;
    const fontColor = 'black';
    const fontConfig = { font: font, fontColor: fontColor };
    const coordinates = { startX: marginX, startY: marginY };
    const content = ['单击多选框可选择游戏难度', '更多功能单击右上角菜单查看'];
    const autoConfig = { AutoFontSize: false, AutoLineWrap: true };
    const renderingData = { fontConfig: fontConfig, content: content, coordinates: coordinates, lineHeight: canvasTextLineHeight, autoConfig: autoConfig };
    multiLineTextRendering(renderingData);
}

function updateButtonUI(button) {
    const func = button.dataset.function;
    const status = button.dataset.status;

    if (buttonTextMap[String(func)] && buttonTextMap[String(func)][String(status)]) {
        button.textContent = buttonTextMap[String(func)][String(status)];
    }
}

function updateAllButtonsUI() {
    const buttons = document.querySelectorAll('[data-function]');
    buttons.forEach(updateButtonUI);
}

function updateButtonStatus(button, status = 'none') {
    button.dataset.status = status;
    updateButtonUI(button);
}

function renderingHandler(renderingData = { type: null, row: null, col: null, num: null, table: null }) {
    if (renderingData.type !== null) {
        switch (renderingData.type) {
            case renderingType.singleBlock:
                renderBlockAnimated(renderingData.col, renderingData.row, getNumberBgColor(renderingData.num), getNumberColor(renderingData.num), renderingData.num);
                break;
            case renderingType.singleBlockDirect:
                renderBlockDirectly(renderingData.col, renderingData.row, getNumberBgColor(renderingData.num), getNumberColor(renderingData.num), renderingData.num);
                break;
            case renderingType.allBlocks:
                renderAllBlocksAnimated(renderingData.table);
                break;
            case renderingType.allBlocksDirect:
                renderAllBlocksDirectly(renderingData.table);
                break;
            default:
                break;
        }
    }
}

window.addEventListener('resize', function () {
    resizeCanvas(1);
});

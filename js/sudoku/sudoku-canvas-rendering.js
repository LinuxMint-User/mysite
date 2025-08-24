const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;
const marginX = 0;
const marginY = 0;
const fontSize = 20 * dpr + 'px';

var canvasWidth;
var canvasHeight;
var colNum = 9;
var rowNum = colNum;
var blockSize = Math.floor((canvas.width - marginX * 2) / colNum);
const blockFontSize = blockSize * 0.6 * dpr + 'px';

let lastTimestamp = null;

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
    // ctx.scale(dpr, dpr);

    blockSize = Math.floor((canvas.width - marginX * 2) / colNum);
    canvasWidth = Math.floor(canvas.width / blockSize);
    canvasHeight = Math.floor(canvas.height / blockSize);

    // 重新绘制内容
    if (render) {

    }
}

/**
 * 根据文本的内容返回对应的文字颜色
 * @param {string} text  文本内容
 * @returns {string}  返回对应的文本颜色代码文本
 * (默认返回 "wheat")
 */
function renderingColorByText(Text) {
    if (Text) {
        let text = String(Text);
        switch (text) {
            case "0":
            case "通过":
                return "green";
            case "未通过":
                return "red";
            default:
                return "wheat";
        }
    }
}

function renderingBackgroundByCoordinates(col, row, markTable) {
    if (markTable[col][row] === -1) { // 不可变格子
        return "#e0e0e0ff";
    }
    if (markTable[col][row] === 0) { // 空格子
        return "white";
    }
    if (markTable[col][row] === 1) { // 检查不通过
        return "red";
    }
    if (markTable[col][row] === 2) { // 检查通过
        return "green";
    }
    if (markTable[col][row] === 3) { // 选中
        return "wheat";
    }
    if (markTable[col][row] === 4) { // 多解
        return "yellow";
    }
    return "#ccc0b3"; // 默认背景色
}

function renderBlock(col = 0, row = 0, bgColor = '#ccc0b3', fontColor = '#ccc0b3', num = 0) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(marginX + col * (marginX + (canvas.width - marginX) / colNum), marginY + row * (marginY + (canvas.height - marginY) / rowNum), (canvas.width - marginX * (colNum + 1)) / colNum, (canvas.height - marginY * (rowNum + 1)) / rowNum);
    ctx.fillStyle = "black";
    ctx.strokeRect(marginX + col * (marginX + (canvas.width - marginX) / colNum), marginY + row * (marginY + (canvas.height - marginY) / rowNum), (canvas.width - marginX * (colNum + 1)) / colNum, (canvas.height - marginY * (rowNum + 1)) / rowNum);

    ctx.font = blockFontSize + ' Arial, Helvetica, sans-serif';
    ctx.fillStyle = fontColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(num === 0 ? '' : num, Math.floor(marginX * (col + 1) + col * (canvas.width - marginX * (colNum + 1)) / colNum + (canvas.width - marginX * (colNum + 1)) / (colNum * 2)), Math.floor(marginY * (row + 1) + row * (canvas.height - marginY * (rowNum + 1)) / rowNum + (canvas.height - marginY * (rowNum + 1)) / (rowNum * 2)));
}

function renderAllBlock(table) {
    for (let col = 0; col < colNum; col++) {
        for (let row = 0; row < rowNum; row++) {
            renderBlock(col, row, renderingBackgroundByCoordinates(col, row, markTable), "black", table[col][row]);
        }
    }
}
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const draftCanvas = document.getElementById('draftCanvas');
const draftCanvasCtx = draftCanvas.getContext('2d');

const dpr = window.devicePixelRatio || 1;
const marginX = 0;
const marginY = 0;
const fontSize = 20 * dpr;

var canvasWidth;
var canvasHeight;
var colNum = 9;
var rowNum = colNum;
var blockSize = Math.floor((canvas.width - marginX * 2) / colNum);
const blockFontSize = blockSize * 0.6 * dpr;

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

    draftCanvas.width = displayWidth * dpr;
    draftCanvas.height = displayHeight * dpr;

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

function renderBlock(canvasCtx, col = 0, row = 0, bgColor = '#ccc0b3', fontColor = '#ccc0b3', num = 0) {
    canvasCtx.fillStyle = bgColor;
    canvasCtx.fillRect(marginX + col * (marginX + (canvas.width - marginX) / colNum), marginY + row * (marginY + (canvas.height - marginY) / rowNum), (canvas.width - marginX * (colNum + 1)) / colNum, (canvas.height - marginY * (rowNum + 1)) / rowNum);
    canvasCtx.fillStyle = "black";
    canvasCtx.strokeRect(marginX + col * (marginX + (canvas.width - marginX) / colNum), marginY + row * (marginY + (canvas.height - marginY) / rowNum), (canvas.width - marginX * (colNum + 1)) / colNum, (canvas.height - marginY * (rowNum + 1)) / rowNum);

    canvasCtx.font = `${blockFontSize}px Arial, Helvetica, sans-serif`;
    canvasCtx.fillStyle = fontColor;
    canvasCtx.textAlign = "center";
    canvasCtx.textBaseline = "middle";
    canvasCtx.fillText(num === 0 ? '' : num, Math.floor(marginX * (col + 1) + col * (canvas.width - marginX * (colNum + 1)) / colNum + (canvas.width - marginX * (colNum + 1)) / (colNum * 2)), Math.floor(marginY * (row + 1) + row * (canvas.height - marginY * (rowNum + 1)) / rowNum + (canvas.height - marginY * (rowNum + 1)) / (rowNum * 2)));
}

function renderAllBlock(canvasCtx, table) {
    for (let col = 0; col < colNum; col++) {
        for (let row = 0; row < rowNum; row++) {
            renderBlock(canvasCtx, col, row, renderingBackgroundByCoordinates(col, row, markTable), "black", table[col][row]);
        }
    }
}

function renderDraftBlock(canvasCtx, col = 0, row = 0, bgColor = 'transparent', fontColor = 'transparent', validNums = []) {
    const numCount = validNums.length;
    let actualFontSize;

    if (numCount === 1) {
        actualFontSize = blockFontSize;
    } else if (numCount === 2) {
        actualFontSize = blockFontSize * 0.8;
    } else { // 3个数字
        actualFontSize = blockFontSize * 0.6;
    }

    canvasCtx.fillStyle = numCount === 0 ? 'transparent' : bgColor;
    canvasCtx.clearRect(marginX + col * (marginX + (canvas.width - marginX) / colNum), marginY + row * (marginY + (canvas.height - marginY) / rowNum), (canvas.width - marginX * (colNum + 1)) / colNum, (canvas.height - marginY * (rowNum + 1)) / rowNum);
    canvasCtx.fillRect(marginX + col * (marginX + (canvas.width - marginX) / colNum), marginY + row * (marginY + (canvas.height - marginY) / rowNum), (canvas.width - marginX * (colNum + 1)) / colNum, (canvas.height - marginY * (rowNum + 1)) / rowNum);
    canvasCtx.fillStyle = "black";
    canvasCtx.strokeRect(marginX + col * (marginX + (canvas.width - marginX) / colNum), marginY + row * (marginY + (canvas.height - marginY) / rowNum), (canvas.width - marginX * (colNum + 1)) / colNum, (canvas.height - marginY * (rowNum + 1)) / rowNum);

    canvasCtx.font = `${actualFontSize}px Arial, Helvetica, sans-serif`;
    canvasCtx.fillStyle = fontColor;
    canvasCtx.textAlign = "center";
    canvasCtx.textBaseline = "middle";

    // 计算格子中心坐标
    const centerX = Math.floor(
        marginX * (col + 1) +
        col * (canvas.width - marginX * (colNum + 1)) / colNum +
        (canvas.width - marginX * (colNum + 1)) / (colNum * 2)
    );

    const centerY = Math.floor(
        marginY * (row + 1) +
        row * (canvas.height - marginY * (rowNum + 1)) / rowNum +
        (canvas.height - marginY * (rowNum + 1)) / (rowNum * 2)
    );

    if (numCount === 0) return;
    // 根据数字数量调整位置
    if (numCount === 1) {
        // 单个数字居中显示
        canvasCtx.fillText(validNums[0], centerX, centerY);
    } else if (numCount === 2) {
        // 两个数字水平排列
        const spacing = actualFontSize * 0.8; // 数字间间距
        canvasCtx.fillText(validNums[0], centerX - spacing / 2, centerY);
        canvasCtx.fillText(validNums[1], centerX + spacing / 2, centerY);
    } else {
        // 三个数字三角形排列
        const spacing = actualFontSize * 0.8;
        // 顶部数字
        canvasCtx.fillText(validNums[0], centerX, centerY - spacing / 2);
        // 底部左右数字
        canvasCtx.fillText(validNums[1], centerX - spacing / 2, centerY + spacing / 2);
        canvasCtx.fillText(validNums[2], centerX + spacing / 2, centerY + spacing / 2);
    }
}

function renderAllDraftBlock(canvasCtx, table) {
    for (let col = 0; col < colNum; col++) {
        for (let row = 0; row < rowNum; row++) {
            renderDraftBlock(canvasCtx, col, row, "transparent", "black", table[col][row]);
        }
    }
}

function renderHintMsg() {
    resizeCanvas();
    let hintMsg0 = `草稿:临时记录可能的数`;
    let hintMsg1 = `🔍:查询草稿中可能的解`;
    let hintMsg2 = `成功解答可获得🔍x2`;
    let hintMsg3 = `解答失败可获得🔍x1`;

    ctx.font = `${fontSize}px Arial, Helvetica, sans-serif`;
    ctx.fillStyle = 'black';
    ctx.fillText(`${hintMsg0}`, 10, 50);
    ctx.fillText(`${hintMsg1}`, 10, 100);
    ctx.fillText(`${hintMsg2}`, 10, 150);
    ctx.fillText(`${hintMsg3}`, 10, 200);
}
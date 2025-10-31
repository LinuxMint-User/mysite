// 全局变量
var currentScore = 0;
var historyRecord = 0;
var gameStatus = 0;
// var historyRecordCookieName = 'histRec2048';
var currentNumberTable = new Array();
var mergeTagTable = new Array();

const scoreIndicator = document.getElementById('score');
const statusIndicator = document.getElementById('status');
const gameLevelSelector = document.getElementById('game-level');
var gameLevel = gameLevelSelector.value;

const controlButtons = document.querySelector('.control-buttons');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');

const newGameButton = document.getElementById('newGameButton');
const replayButton = document.getElementById('replayButton');
const replayButtonNext = document.getElementById('replayButtonNext');
const replayButtonPrev = document.getElementById('replayButtonPrev');
const copyButton = document.getElementById('copyButton');

const gameArea = document.querySelector('.gameArea');

var gameRecordString = "2048Game|";
var inputGameRecordString = "";
var gameRecordStep = 9;
var gameRecordFrameCount = 0;
var replayIntervalId = null;
var PLAY_INTERVAL = 800;

/**
 * 更新页面显示的当前分数
 * 从全局变量currentScore获取值并显示在ID为'score'的元素上
 */
function fetchCurrentScore() {
    scoreIndicator.innerText = currentScore;
}

/**
 * 检查游戏面板上是否有空格子(值为0的位置)
 * @param {Array} table - 4x4的游戏面板二维数组
 * @returns {boolean} - 如果有空格子返回true，否则返回false
 */
function anySpaceThere(table) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (table[i][j] == 0) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 检查游戏面板左侧是否有可移动空间
 * @param {Array} table - 4x4游戏面板二维数组
 * @returns {boolean} - 如果左侧有空格或可合并的相同数字返回true，否则返回false
 */
function anySpaceLeft(table) {
    // 遍历游戏面板每个格子
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            // 检查当前格子非空且不在最左侧
            if (table[i][j] != 0 && i != 0) {
                // 检查左侧格子是否为空或与当前格子数字相同
                if (table[i - 1][j] == 0 || table[i - 1][j] == table[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 检查游戏面板右侧是否有可移动空间
 * @param {Array} table - 4x4游戏面板二维数组
 * @returns {boolean} - 如果右侧有空格或可合并的相同数字返回true，否则返回false
 */
function anySpaceRight(table) {
    // 遍历游戏面板每个格子
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            // 检查当前格子非空且不在最右侧
            if (table[i][j] != 0 && i != 3) {
                // 检查右侧格子是否为空或与当前格子数字相同
                if (table[i + 1][j] == 0 || table[i + 1][j] == table[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 检查游戏面板上方是否有可移动空间
 * @param {Array} table - 4x4游戏面板二维数组
 * @returns {boolean} - 如果上方有空格或可合并的相同数字返回true，否则返回false
 */
function anySpaceAbove(table) {
    // 遍历游戏面板每个格子
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            // 检查当前格子非空且不在最上方
            if (table[i][j] != 0 && j != 0) {
                // 检查上方格子是否为空或与当前格子数字相同
                if (table[i][j - 1] == 0 || table[i][j - 1] == table[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 检查游戏面板下方是否有可移动空间
 * @param {Array} table - 4x4游戏面板二维数组
 * @returns {boolean} - 如果下方有空格或可合并的相同数字返回true，否则返回false
 */
function anySpaceBelow(table) {
    // 遍历游戏面板每个格子
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            // 检查当前格子非空且不在最下方
            if (table[i][j] != 0 && j != 3) {
                // 检查下方格子是否为空或与当前格子数字相同
                if (table[i][j + 1] == 0 || table[i][j + 1] == table[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function canMove(table) {
    if (anySpaceLeft(table) || anySpaceRight(table) || anySpaceAbove(table) || anySpaceBelow(table)) {
        return true;
    }
    return false;
}


/**
 * 检查水平方向上两个格子之间是否有障碍物(非空格子)
 * @param {number} row - 要检查的行索引
 * @param {number} col0 - 起始列索引
 * @param {number} col1 - 结束列索引
 * @param {Array} table - 4x4游戏面板二维数组
 * @returns {boolean} - 如果中间有非空格子返回true，否则返回false
 */
function anyBlockHorizontal(row, col0, col1, table) {
    // 遍历起始列和结束列之间的所有列
    for (var col = col0 + 1; col < col1; col++) {
        // 如果发现非空格子则返回true
        if (table[row][col] != 0) {
            return true;
        }
    }
    // 遍历结束未发现障碍物则返回false
    return false;
}

function anyBlockVertical(col, row0, row1, table) {
    for (var row = row0 + 1; row < row1; row++) {
        if (table[row][col] != 0) {
            return true;
        }
    }
    return false;
}

function init() {
    copyButton.style.display = 'none';
    replayButton.disabled = true;
    gameRecordString = "2048Game|";
    currentScore = 0;
    scoreIndicator.innerText = currentScore;
    statusIndicator.innerText = "进行中";
    gameLevelSelector.disabled = true;
    gameStatus = 1;
    for (var i = 0; i < 4; i++) {
        currentNumberTable[i] = new Array();
        for (var j = 0; j < 4; j++) {
            currentNumberTable[i][j] = 0;
        }
    }
    for (var i = 0; i < 4; i++) {
        mergeTagTable[i] = new Array();
        for (var j = 0; j < 4; j++) {
            mergeTagTable[i][j] = 0;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderAllBlock(currentNumberTable);
}

function replayInit() {
    copyButton.style.display = 'none';
    replayIntervalId = null;
    gameRecordStep = 9;
    gameRecordFrameCount = 0;
    newGameButton.disabled = true;
    newGameButton.style.display = 'none';
    replayButtonPrev.style.display = 'block';
    replayButtonNext.style.display = 'block';
    currentScore = 0;
    scoreIndicator.innerText = currentScore;
    statusIndicator.innerText = "回放中";
    gameLevelSelector.disabled = true;
    gameStatus = 2;
    for (var i = 0; i < 4; i++) {
        currentNumberTable[i] = new Array();
        for (var j = 0; j < 4; j++) {
            currentNumberTable[i][j] = 0;
        }
    }
    for (var i = 0; i < 4; i++) {
        mergeTagTable[i] = new Array();
        for (var j = 0; j < 4; j++) {
            mergeTagTable[i][j] = 0;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderAllBlock(currentNumberTable);
}

function generateOneNumber() {
    if (!anySpaceThere(currentNumberTable)) {
        return false;
    }
    do {
        var rx = Math.floor(Math.random() * 4);
        var ry = Math.floor(Math.random() * 4);
    } while (currentNumberTable[rx][ry] != 0);
    // 调整这里的值以改变难度
    var rn = Math.random() < gameLevel ? 2 : 4;
    currentNumberTable[rx][ry] = rn;
    renderBlock(rx, ry, renderingBackgroundByNumber(rn), renderingTextByNumber(rn), rn);
    gameRecordString += "g" + rx + ry + rn;
    return true;
}

function isGameOver(table) {
    if (!anySpaceThere(table) && !canMove(table)) {
        gameOver();
    }
}

function gameOver() {
    gameRecordString += "|GAMEOVER";
    gameStatus = 0;
    statusIndicator.innerText = "游戏结束";
    newGameButton.innerText = "开始";
    gameLevelSelector.disabled = false;
    replayButton.disabled = false;
    copyButton.style.display = 'block';
}

function replayOver() {
    gameStatus = 0;
    statusIndicator.innerText = "回放结束";
    newGameButton.disabled = false;
    newGameButton.style.display = 'block';
    gameLevelSelector.disabled = false;
    replayButtonPrev.style.display = 'none';
    replayButtonNext.style.display = 'none';
    replayIntervalId = null;
    replayButton.innerText = "播放";
    gameRecordStep = 9;
    gameRecordFrameCount = 0;
    copyButton.style.display = 'block';
}

function setMergeTagTableToZero() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            mergeTagTable[i][j] = 0;
        }
    }
}

function newGame() {
    init();
    generateOneNumber();
    generateOneNumber();
}

/**
 * 向左移动游戏面板中的所有数字块
 * @param {Array} table - 4x4游戏面板二维数组
 * @param {Array} tag - 标记数组，用于记录哪些格子已经合并过
 * @returns {boolean} - 如果成功移动返回true，否则返回false
 */
function mvL(table, tag, withAnimation = true) {
    if (gameStatus !== 1 && gameStatus !== 2) {
        return false;
    }
    // 检查是否可以向左移动
    if (!anySpaceLeft(table)) {
        return false;
    }

    // 重置合并标记数组
    setMergeTagTableToZero();

    // 遍历每一列（从第二列开始）
    for (var y = 0; y < 4; y++) {
        for (var x = 1; x < 4; x++) {
            // 只处理非空格子
            if (table[x][y] != 0) {
                // 检查左侧所有可能的位置
                for (var k = 0; k < x; k++) {
                    // 情况1：左侧格子为空且中间无障碍物
                    if (table[k][y] == 0 && !anyBlockVertical(y, k, x, currentNumberTable)) {
                        if (withAnimation) {
                            moveAnimation(x, y, k, y);  // 执行移动动画
                        }
                        table[k][y] = table[x][y];  // 移动数字
                        table[x][y] = 0;            // 清空原位置
                        break;
                    }
                    // 情况2：左侧格子数字相同且中间无障碍物
                    else if (table[k][y] == table[x][y] && !anyBlockVertical(y, k, x, currentNumberTable)) {
                        if (withAnimation) {
                            moveAnimation(x, y, k, y);  // 执行移动动画
                        }
                        // 如果左侧格子已经合并过
                        if (tag[k][y] != 0) {
                            table[k + 1][y] = table[x][y];  // 移动到右侧相邻格子
                            table[x][y] = 0;
                        } else {
                            // 合并数字
                            table[k][y] += table[x][y];
                            table[x][y] = 0;
                            tag[k][y] = 1;           // 标记已合并
                            currentScore += table[k][y];  // 更新分数
                        }
                        break;
                    }
                }
            }
        }
    }
    gameRecordString += "ml";
    return true;
}

function mvR(table, tag, withAnimation = true) {
    if (gameStatus !== 1 && gameStatus !== 2) {
        return false;
    }
    if (!anySpaceRight(table)) {
        return false;
    }
    setMergeTagTableToZero();
    for (var y = 0; y < 4; y++) {
        for (var x = 2; x >= 0; x--) {
            if (table[x][y] != 0) {
                for (var k = 3; k > x; k--) {
                    if (table[k][y] == 0 && !anyBlockVertical(y, x, k, currentNumberTable)) {
                        if (withAnimation) {
                            moveAnimation(x, y, k, y);  // 执行移动动画
                        }
                        table[k][y] = table[x][y];
                        table[x][y] = 0;
                        break;
                    }
                    else if (table[k][y] == table[x][y] && !anyBlockVertical(y, x, k, currentNumberTable)) {
                        if (withAnimation) {
                            moveAnimation(x, y, k, y);  // 执行移动动画
                        }
                        if (tag[k][y] != 0) {
                            table[k - 1][y] = table[x][y];
                            table[x][y] = 0;
                        } else {
                            table[k][y] += table[x][y];
                            table[x][y] = 0;
                            tag[k][y] = 1;
                            currentScore += table[k][y];
                        }
                        break;
                    }
                }
            }
        }
    }
    gameRecordString += "mr";
    return true;
}

/**
 * 向上移动游戏面板中的所有数字块
 * @param {Array} table - 4x4游戏面板二维数组
 * @param {Array} tag - 标记数组，用于记录哪些格子已经合并过
 * @returns {boolean} - 如果成功移动返回true，否则返回false
 */
function mvU(table, tag, withAnimation = true) {
    if (gameStatus !== 1 && gameStatus !== 2) {
        return false;
    }
    // 检查是否可以向上移动
    if (!anySpaceAbove(table)) {
        return false;
    }

    // 重置合并标记数组
    setMergeTagTableToZero();

    // 遍历每一行（从第二行开始）
    for (var x = 0; x < 4; x++) {
        for (var y = 1; y < 4; y++) {
            // 只处理非空格子
            if (table[x][y] != 0) {
                // 检查上方所有可能的位置
                for (var k = 0; k < y; k++) {
                    // 情况1：上方格子为空且中间无障碍物
                    if (table[x][k] == 0 && !anyBlockHorizontal(x, k, y, currentNumberTable)) {
                        if (withAnimation) {
                           moveAnimation(x, y, x, k);  // 执行移动动画 
                        }
                        table[x][k] = table[x][y];   // 移动数字
                        table[x][y] = 0;             // 清空原位置
                        break;
                    }
                    // 情况2：上方格子数字相同且中间无障碍物
                    else if (table[x][k] == table[x][y] && !anyBlockHorizontal(x, k, y, currentNumberTable)) {
                        if (withAnimation) {
                           moveAnimation(x, y, x, k);  // 执行移动动画 
                        }
                        // 如果上方格子已经合并过
                        if (tag[x][k] != 0) {
                            table[x][k + 1] = table[x][y];  // 移动到下方相邻格子
                            table[x][y] = 0;
                        } else {
                            // 合并数字
                            table[x][k] += table[x][y];
                            table[x][y] = 0;
                            tag[x][k] = 1;            // 标记已合并
                            currentScore += table[x][k];  // 更新分数
                        }
                        break;
                    }
                }
            }
        }
    }
    gameRecordString += "mu";
    return true;
}

function mvD(table, tag, withAnimation = true) {
    if (gameStatus !== 1 && gameStatus !== 2) {
        return false;
    }
    if (!anySpaceBelow(table)) {
        return false;
    }
    setMergeTagTableToZero();
    for (var x = 0; x < 4; x++) {
        for (var y = 2; y >= 0; y--) {
            if (table[x][y] != 0) {
                for (var k = 3; k > y; k--) {
                    if (table[x][k] == 0 && !anyBlockHorizontal(x, y, k, currentNumberTable)) {
                        if (withAnimation) {
                           moveAnimation(x, y, x, k);  // 执行移动动画 
                        }
                        table[x][k] = table[x][y];
                        table[x][y] = 0;
                        break;
                    }
                    else if (table[x][k] == table[x][y] && !anyBlockHorizontal(x, y, k, currentNumberTable)) {
                        if (withAnimation) {
                           moveAnimation(x, y, x, k);  // 执行移动动画 
                        }
                        if (tag[x][k] != 0) {
                            table[x][k - 1] = table[x][y];
                            table[x][y] = 0;
                        } else {
                            table[x][k] += table[x][y];
                            table[x][y] = 0;
                            tag[x][k] = 1;
                            currentScore += table[x][k];
                        }
                        break;
                    }
                }
            }
        }
    }
    gameRecordString += "md";
    return true;
}

upBtn.addEventListener('click', () => {
    if (gameStatus === 1) {
        if (mvU(currentNumberTable, mergeTagTable)) {
            generateOneNumber();
            fetchCurrentScore();
            setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        }
    }
});
leftBtn.addEventListener('click', () => {
    if (gameStatus === 1) {
        if (mvL(currentNumberTable, mergeTagTable)) {
            generateOneNumber();
            fetchCurrentScore();
            setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        }
    }
});
downBtn.addEventListener('click', () => {
    if (gameStatus === 1) {
        if (mvD(currentNumberTable, mergeTagTable)) {
            generateOneNumber();
            fetchCurrentScore();
            setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        }
    }
});
rightBtn.addEventListener('click', () => {
    if (gameStatus === 1) {
        if (mvR(currentNumberTable, mergeTagTable)) {
            generateOneNumber();
            fetchCurrentScore();
            setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        }
    }
});

// if (isMobileDevice()) {
//     controlButtons.style.display = 'grid';
// } else {
//     controlButtons.style.display = 'none';
// }

// 键盘事件
document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'ArrowLeft':  // 左箭头
            if (gameStatus === 1) {
                if (mvL(currentNumberTable, mergeTagTable)) {
                    generateOneNumber();
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
            }
            break;
        case 'ArrowUp':  // 上箭头
            if (gameStatus === 1) {
                if (mvU(currentNumberTable, mergeTagTable)) {
                    generateOneNumber();
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
            }
            break;
        case 'ArrowRight':  // 右箭头
            if (gameStatus === 1) {
                if (mvR(currentNumberTable, mergeTagTable)) {
                    generateOneNumber();
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
            }
            break;
        case 'ArrowDown':  // 下箭头
            if (gameStatus === 1) {
                if (mvD(currentNumberTable, mergeTagTable)) {
                    generateOneNumber();
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
            }
            break;
    }
});

// 触摸事件
document.addEventListener('DOMContentLoaded', function () {
    var startX, startY, moveX, moveY;

    gameArea.addEventListener('touchstart', function (event) {
        event.preventDefault();
        var touch = event.touches[0];
        startX = touch.pageX;
        startY = touch.pageY;
    }, { passive: false });

    gameArea.addEventListener('touchmove', function (event) {
        event.preventDefault();
        var touch = event.touches[0];
        moveX = touch.pageX - startX;
        moveY = touch.pageY - startY;
    }, { passive: false });

    gameArea.addEventListener('touchend', function (event) {
        event.preventDefault();
        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX < 0) {
                if (gameStatus === 1) {
                    if (mvL(currentNumberTable, mergeTagTable)) {
                        generateOneNumber();
                        fetchCurrentScore();
                        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                    }
                }
            } else {
                if (gameStatus === 1) {
                    if (mvR(currentNumberTable, mergeTagTable)) {
                        generateOneNumber();
                        fetchCurrentScore();
                        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                    }
                }
            }
        } else {
            if (moveY < 0) {
                if (gameStatus === 1) {
                    if (mvU(currentNumberTable, mergeTagTable)) {
                        generateOneNumber();
                        fetchCurrentScore();
                        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                    }
                }
            } else {
                if (gameStatus === 1) {
                    if (mvD(currentNumberTable, mergeTagTable)) {
                        generateOneNumber();
                        fetchCurrentScore();
                        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                    }
                }
            }
        }
    }, { passive: false });
});

// 初次加载激活游戏
document.addEventListener('DOMContentLoaded', function () {
    // multiKey();
    resizeCanvas();
    ctx.font = fontSize + ' Arial, Helvetica, sans-serif';
    ctx.fillText('多选框切换难度，开始后:', 5, canvasHeight * cellSize * 0.12);
    ctx.fillText('    按键:显示控制按键', 5, canvasHeight * cellSize * 0.22);
    ctx.fillText('    滑动:隐藏控制按键', 5, canvasHeight * cellSize * 0.32);
    ctx.fillText('回放:回放选择的某轮游戏', 5, canvasHeight * cellSize * 0.42);
});

function multiKey(channel) {
    switch (channel) {
        case 'newGameButton':
            if (newGameButton.innerText == "开始" && !gameStatus) {
                newGame();
                if (controlButtons.style.display == 'none') {
                    newGameButton.innerText = "按键";
                }
                else if (controlButtons.style.display == 'grid') {
                    newGameButton.innerText = "滑动";
                }
            } else if (newGameButton.innerText == "按键") {
                controlButtons.style.display = 'grid';
                newGameButton.innerText = "滑动";
            } else if (newGameButton.innerText == "滑动") {
                controlButtons.style.display = 'none';
                newGameButton.innerText = "按键";
            }
            break;
        case 'replayButton':
            if (replayButton.innerText == "回放") {
                if (gameRecordString !== "2048Game|") {
                    replayInit();
                    replayHandler(gameRecordString);
                } else {
                    inputGameRecordString = prompt("输入分享的字符串", "");
                    if (inputGameRecordString !== null && inputGameRecordString.trim() !== "") {
                        // console.log("收到分享字符串：", inputGameRecordString);
                        gameRecordString = decompressGzip(inputGameRecordString);
                        replayInit();
                        replayHandler(gameRecordString);
                    } else {
                        // console.log("用户取消了输入");
                    }
                }
            } else if (replayButton.innerText == "暂停") {
                clearInterval(replayIntervalId);
                replayIntervalId = null;
                replayButton.innerText = "播放";
                replayButtonPrev.disabled = false;
            } else if (replayButton.innerText == "播放") {
                if (replayIntervalId !== null) {
                    return;
                }
                replayIntervalId = setInterval(nextStep2, PLAY_INTERVAL);
                replayButton.innerText = "暂停";
                replayButtonPrev.disabled = true;
            }
            break;
        case 'replayButtonNext':
            nextStep2();
            break;
        case 'replayButtonPrev':
            prevStep();
            break;
        default:
            break;
    }
}

function replayHandler(gameRecordString) {
    if (gameRecordString.indexOf('2048Game|') === 0 && gameRecordString.lastIndexOf('|GAMEOVER') === gameRecordString.length - 9) {
        replayButton.innerText = "播放";
    } else {
        alert("错误的分享格式！");
    }
}

function nextStep2() {
    // setTimeout(nextStep, 100);
    nextStep();
    nextStep();
}

function nextStep() {
    // console.log("gameRS:" + gameRecordStep);
    if (gameRecordString[gameRecordStep] == 'g') {
        let rx = Number(gameRecordString[gameRecordStep + 1]);
        let ry = Number(gameRecordString[gameRecordStep + 2]);
        let rn = Number(gameRecordString[gameRecordStep + 3]);
        // console.log("rx:" + rx);
        // console.log("ry:" + ry);
        // console.log("rn:" + rn);
        if (currentNumberTable[rx][ry] !== 0) {
            alert("replayerr!");
            return;
        }
        currentNumberTable[rx][ry] = rn;
        renderBlock(rx, ry, renderingBackgroundByNumber(rn), renderingTextByNumber(rn), rn);
        gameRecordStep += 4;
    } else if (gameRecordString[gameRecordStep] == 'm') {
        let dir = gameRecordString[gameRecordStep + 1];
        // console.log("dir:" + dir);
        switch (dir) {
            case 'l':
                if (mvL(currentNumberTable, mergeTagTable)) {
                    fetchCurrentScore();
                    // setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
                break;
            case 'r':
                if (mvR(currentNumberTable, mergeTagTable)) {
                    fetchCurrentScore();
                    // setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
                break;
            case 'u':
                if (mvU(currentNumberTable, mergeTagTable)) {
                    fetchCurrentScore();
                    // setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
                break;
            case 'd':
                if (mvD(currentNumberTable, mergeTagTable)) {
                    fetchCurrentScore();
                    // setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
                break;

            default:
                break;
        }
        gameRecordStep += 2;
    }
    else {
        if (gameRecordString[gameRecordStep] === '|') {
            replayOver();
        }
        gameRecordStep += 1;
    }
    gameRecordFrameCount += 1;
}

function nextStepWithoutAnimation() {
    // console.log("gameRS:" + gameRecordStep);
    if (gameRecordString[gameRecordStep] == 'g') {
        let rx = Number(gameRecordString[gameRecordStep + 1]);
        let ry = Number(gameRecordString[gameRecordStep + 2]);
        let rn = Number(gameRecordString[gameRecordStep + 3]);
        // console.log("rx:" + rx);
        // console.log("ry:" + ry);
        // console.log("rn:" + rn);
        if (currentNumberTable[rx][ry] !== 0) {
            alert("replayerr!");
            return;
        }
        currentNumberTable[rx][ry] = rn;
        // renderBlock(rx, ry, renderingBackgroundByNumber(rn), renderingTextByNumber(rn), rn);
        gameRecordStep += 4;
    } else if (gameRecordString[gameRecordStep] == 'm') {
        let dir = gameRecordString[gameRecordStep + 1];
        // console.log("dir:" + dir);
        switch (dir) {
            case 'l':
                if (mvL(currentNumberTable, mergeTagTable, false)) {
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
                break;
            case 'r':
                if (mvR(currentNumberTable, mergeTagTable, false)) {
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
                break;
            case 'u':
                if (mvU(currentNumberTable, mergeTagTable, false)) {
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
                break;
            case 'd':
                if (mvD(currentNumberTable, mergeTagTable, false)) {
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
                break;

            default:
                break;
        }
        gameRecordStep += 2;
    }
    else {
        if (gameRecordString[gameRecordStep] === '|') {
            replayOver();
        }
        gameRecordStep += 1;
    }
    gameRecordFrameCount += 1;
}

function prevStep() {
    if (gameRecordFrameCount === 0) {
        return;
    }
    let targetFrameCount = gameRecordFrameCount - 2;
    replayInit();
    for (; gameRecordFrameCount < targetFrameCount;) {
        nextStepWithoutAnimation();
        renderAllBlock(currentNumberTable);
    }
}

// 监听下拉菜单变化
gameLevelSelector.addEventListener("change", function () {
    gameLevel = this.value; // 更新gameLevel变量
});

// 压缩函数 (返回Base64字符串，方便分享)
function compressWithGzip(dataString) {
    // 将字符串转换为Uint8Array
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(dataString);
    
    // 使用pako进行gzip压缩
    const compressed = pako.gzip(data);
    
    // 将压缩后的Uint8Array转换为Base64字符串
    const base64String = btoa(String.fromCharCode(...compressed));
    return base64String;
}

// 解压函数
function decompressGzip(compressedBase64) {
    // 将Base64字符串转回Uint8Array
    const binaryString = atob(compressedBase64);
    const charData = binaryString.split('').map(char => char.charCodeAt(0));
    const compressedData = new Uint8Array(charData);
    
    // 使用pako解压
    const decompressed = pako.ungzip(compressedData);
    
    // 将解压后的Uint8Array转回字符串
    const textDecoder = new TextDecoder();
    return textDecoder.decode(decompressed);
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(compressWithGzip(gameRecordString));
    console.log("文本已成功复制到剪贴板");
    // 这里可以添加成功提示，如alert或显示一个临时消息
  } catch (err) {
    console.error("复制失败: ", err);
    // 处理复制失败的情况
  }
}

// 绑定到按钮点击事件
copyButton.addEventListener('click', copyToClipboard);
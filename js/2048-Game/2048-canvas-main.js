// 全局变量
let currentScore = 0;
let gameStatus = 0;
let currentNumberTable = new Array();
let mergeTagTable = new Array();

let gameSeed;
let prng;

const scoreIndicator = document.getElementById('score');
const statusIndicator = document.getElementById('status');
const gameLevelSelector = document.getElementById('game-level');
let gameLevel = Number(gameLevelSelector.value);

const controlButtons = document.querySelector('.control-buttons');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');

const newGameButton = document.getElementById('newGameButton');
const replayButton = document.getElementById('replayButton');
const replayButtonInput = document.getElementById('replayButtonInput');
const replayButtonNext = document.getElementById('replayButtonNext');
const replayButtonPrev = document.getElementById('replayButtonPrev');
const replayButtonControl = document.getElementById('replayButtonControl');
const replayButtonCancel = document.getElementById('replayButtonCancel');
const shareButton = document.getElementById('shareButton');
const shareLinkButton = document.getElementById('shareLinkButton');
const replayToolbar = document.getElementById('replayToolbar');
const replayInputBox = document.getElementById('replayInputBox');
const replayInputBoxFinishButton = document.getElementById('replayInputBoxFinishButton');
const replayProgressBar = document.getElementById('replayProgressBar');

const gameArea = document.querySelector('.gameArea');

let gameRecordString = "2048Game|";
let inputGameRecordString = "";
const gameRecordStepStartIndex = 0;
let gameRecordStep = gameRecordStepStartIndex;
let gameRecordFrameCount = 0;
let replayIntervalId = null;
let PLAY_INTERVAL = 800;

let gameRecordStringParts;
let isProcessingNextStep = false;

//variable in banner.js
setBannerTimeout = 2000;

// 获取当前页面的基础URL（去掉查询参数和哈希）
const currentUrl = new URL(window.location.href);
const baseURL = currentUrl.origin + currentUrl.pathname;
let shareLinkPrefix = baseURL + '?replayCode=';
let replayCode = '';

/**
 * 更新页面显示的当前分数
 * 从全局变量currentScore获取值并显示在ID为'score'的元素上
 */
function updateScoreIndicator() {
    scoreIndicator.textContent = currentScore;
}

/**
 * 检查游戏面板上是否有空格子(值为0的位置)
 * @param {Array} table - 4x4的游戏面板二维数组
 * @returns {boolean} - 如果有空格子返回true，否则返回false
 */
function anySpaceThere(table) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (table[i][j] === 0) {
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
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            // 检查当前格子非空且不在最左侧
            if (table[i][j] != 0 && i != 0) {
                // 检查左侧格子是否为空或与当前格子数字相同
                if (table[i - 1][j] === 0 || table[i - 1][j] === table[i][j]) {
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
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            // 检查当前格子非空且不在最右侧
            if (table[i][j] != 0 && i != 3) {
                // 检查右侧格子是否为空或与当前格子数字相同
                if (table[i + 1][j] === 0 || table[i + 1][j] === table[i][j]) {
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
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            // 检查当前格子非空且不在最上方
            if (table[i][j] != 0 && j != 0) {
                // 检查上方格子是否为空或与当前格子数字相同
                if (table[i][j - 1] === 0 || table[i][j - 1] === table[i][j]) {
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
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            // 检查当前格子非空且不在最下方
            if (table[i][j] != 0 && j != 3) {
                // 检查下方格子是否为空或与当前格子数字相同
                if (table[i][j + 1] === 0 || table[i][j + 1] === table[i][j]) {
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
    for (let col = col0 + 1; col < col1; col++) {
        // 如果发现非空格子则返回true
        if (table[row][col] != 0) {
            return true;
        }
    }
    // 遍历结束未发现障碍物则返回false
    return false;
}

function anyBlockVertical(col, row0, row1, table) {
    for (let row = row0 + 1; row < row1; row++) {
        if (table[row][col] != 0) {
            return true;
        }
    }
    return false;
}

function init() {
    gameSeed = generateRandomSeed();
    prng = SeededRandom.createSeededRandom(gameSeed, 'xorshift');
    gameRecordString = "2048Game|" + gameSeed + "|" + gameLevel + "|";
    currentScore = 0;
    scoreIndicator.textContent = currentScore;
    statusIndicator.textContent = "进行中";
    gameLevelSelector.disabled = true;
    replayButton.disabled = true;
    shareButton.disabled = true;
    shareLinkButton.disabled = true;
    gameStatus = 1;
    for (let i = 0; i < 4; i++) {
        currentNumberTable[i] = new Array();
        for (let j = 0; j < 4; j++) {
            currentNumberTable[i][j] = 0;
        }
    }
    for (let i = 0; i < 4; i++) {
        mergeTagTable[i] = new Array();
        for (let j = 0; j < 4; j++) {
            mergeTagTable[i][j] = 0;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderAllBlocks(currentNumberTable, true);
}

function replayInit() {
    replayToolbar.classList.remove('global-hidden');
    replayButtonCancel.classList.remove('global-hidden');
    newGameButton.classList.add('global-hidden');
    replayIntervalId = null;
    gameRecordStep = gameRecordStepStartIndex;
    gameRecordFrameCount = 0;
    currentScore = 0;
    scoreIndicator.textContent = currentScore;
    statusIndicator.textContent = "回放中";
    gameLevelSelector.disabled = true;
    replayButton.disabled = true;
    shareButton.disabled = true;
    shareLinkButton.disabled = true;
    gameStatus = 2;
    for (let i = 0; i < 4; i++) {
        currentNumberTable[i] = new Array();
        for (let j = 0; j < 4; j++) {
            currentNumberTable[i][j] = 0;
        }
    }
    for (let i = 0; i < 4; i++) {
        mergeTagTable[i] = new Array();
        for (let j = 0; j < 4; j++) {
            mergeTagTable[i][j] = 0;
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderAllBlocks(currentNumberTable, true);
}

function getEmptyBlocks(currentNumberTable) {
    let emptyBlocks = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (currentNumberTable[i][j] === 0) {
                emptyBlocks.push({ x: i, y: j });
            }
        }
    }
    return emptyBlocks;
}

function generateOneNumber() {
    let index;
    let emptyBlocks = [];
    let randomNumber = 0;

    if (!anySpaceThere(currentNumberTable)) {
        return false;
    }

    emptyBlocks = getEmptyBlocks(currentNumberTable);

    index = prng.randomInt(emptyBlocks.length);
    randomNumber = prng.random() < Number(gameLevel) ? 2 : 4; // 调整这里的值以改变难度

    currentNumberTable[emptyBlocks[index].x][emptyBlocks[index].y] = randomNumber;
    renderBlock(emptyBlocks[index].x, emptyBlocks[index].y, renderingBackgroundByNumber(randomNumber), renderingTextByNumber(randomNumber), randomNumber, true);
    return true;
}

function isGameOver(table) {
    if (!anySpaceThere(table) && !canMove(table)) {
        gameOver();
    }
}

function gameOver() {
    if (gameStatus === 1) {
        gameRecordString += "|GAMEOVER";
        gameStatus = 0;
        statusIndicator.textContent = "游戏结束";
        updateButtonStatus(newGameButton, 'startGame');
        gameLevelSelector.disabled = false;
        replayButton.disabled = false;
        shareButton.disabled = false;
        shareLinkButton.disabled = false;
    }
}

function replayOver(replayToolbarOff = true) {
    if (gameStatus === 2) {
        statusIndicator.textContent = "回放结束";
        updateButtonStatus(replayButtonControl, 'play');
        replayButtonPrev.disabled = false;
        if (replayIntervalId !== null) {
            clearInterval(replayIntervalId);
            replayIntervalId = null;
        }
        if (replayToolbarOff) {
            gameStatus = 0;
            newGameButton.disabled = false;
            gameLevelSelector.disabled = false;
            replayToolbar.classList.add('global-hidden');
            replayButtonCancel.classList.add('global-hidden');
            newGameButton.classList.remove('global-hidden');
            gameRecordStep = gameRecordStepStartIndex;
            gameRecordFrameCount = 0;
        }
    }
}

function setMergeTagTableToZero() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
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
    for (let y = 0; y < 4; y++) {
        for (let x = 1; x < 4; x++) {
            // 只处理非空格子
            if (table[x][y] != 0) {
                // 检查左侧所有可能的位置
                for (let k = 0; k < x; k++) {
                    // 情况1: 左侧格子为空且中间无障碍物
                    if (table[k][y] === 0 && !anyBlockVertical(y, k, x, currentNumberTable)) {
                        if (withAnimation) {
                            moveAnimation(x, y, k, y);  // 执行移动动画
                        }
                        table[k][y] = table[x][y];  // 移动数字
                        table[x][y] = 0;            // 清空原位置
                        break;
                    }
                    // 情况2: 左侧格子数字相同且中间无障碍物
                    else if (table[k][y] === table[x][y] && !anyBlockVertical(y, k, x, currentNumberTable)) {
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
    if (gameStatus === 1) {
        gameRecordString += "l";
    }
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
    for (let y = 0; y < 4; y++) {
        for (let x = 2; x >= 0; x--) {
            if (table[x][y] != 0) {
                for (let k = 3; k > x; k--) {
                    if (table[k][y] === 0 && !anyBlockVertical(y, x, k, currentNumberTable)) {
                        if (withAnimation) {
                            moveAnimation(x, y, k, y);  // 执行移动动画
                        }
                        table[k][y] = table[x][y];
                        table[x][y] = 0;
                        break;
                    }
                    else if (table[k][y] === table[x][y] && !anyBlockVertical(y, x, k, currentNumberTable)) {
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
    if (gameStatus === 1) {
        gameRecordString += "r";
    }
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
    for (let x = 0; x < 4; x++) {
        for (let y = 1; y < 4; y++) {
            // 只处理非空格子
            if (table[x][y] != 0) {
                // 检查上方所有可能的位置
                for (let k = 0; k < y; k++) {
                    // 情况1: 上方格子为空且中间无障碍物
                    if (table[x][k] === 0 && !anyBlockHorizontal(x, k, y, currentNumberTable)) {
                        if (withAnimation) {
                            moveAnimation(x, y, x, k);  // 执行移动动画 
                        }
                        table[x][k] = table[x][y];   // 移动数字
                        table[x][y] = 0;             // 清空原位置
                        break;
                    }
                    // 情况2: 上方格子数字相同且中间无障碍物
                    else if (table[x][k] === table[x][y] && !anyBlockHorizontal(x, k, y, currentNumberTable)) {
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
    if (gameStatus === 1) {
        gameRecordString += "u";
    }
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
    for (let x = 0; x < 4; x++) {
        for (let y = 2; y >= 0; y--) {
            if (table[x][y] != 0) {
                for (let k = 3; k > y; k--) {
                    if (table[x][k] === 0 && !anyBlockHorizontal(x, y, k, currentNumberTable)) {
                        if (withAnimation) {
                            moveAnimation(x, y, x, k);  // 执行移动动画 
                        }
                        table[x][k] = table[x][y];
                        table[x][y] = 0;
                        break;
                    }
                    else if (table[x][k] === table[x][y] && !anyBlockHorizontal(x, y, k, currentNumberTable)) {
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
    if (gameStatus === 1) {
        gameRecordString += "d";
    }
    return true;
}

function mvUEvent(withAnimation = true, replayRewindMode = false) {
    if (isAnimating && !replayRewindMode) {
        // console.warn("动画进行中，忽略输入");
        return false;
    }
    if (mvU(currentNumberTable, mergeTagTable, withAnimation)) {
        generateOneNumber();
        updateScoreIndicator();
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        return true;
    }
    return false;
}

function mvLEvent(withAnimation = true, replayRewindMode = false) {
    if (isAnimating && !replayRewindMode) {
        // console.warn("动画进行中，忽略输入");
        return false;
    }
    if (mvL(currentNumberTable, mergeTagTable, withAnimation)) {
        generateOneNumber();
        updateScoreIndicator();
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        return true;
    }
    return false;
}

function mvDEvent(withAnimation = true, replayRewindMode = false) {
    if (isAnimating && !replayRewindMode) {
        // console.warn("动画进行中，忽略输入");
        return false;
    }
    if (mvD(currentNumberTable, mergeTagTable, withAnimation)) {
        generateOneNumber();
        updateScoreIndicator();
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        return true;
    }
    return false;
}

function mvREvent(withAnimation = true, replayRewindMode = false) {
    if (isAnimating && !replayRewindMode) {
        // console.warn("动画进行中，忽略输入");
        return false;
    }
    if (mvR(currentNumberTable, mergeTagTable, withAnimation)) {
        generateOneNumber();
        updateScoreIndicator();
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        return true;
    }
    return false;
}

upBtn.addEventListener('click', () => {
    if (gameStatus === 1) {
        mvUEvent();
    }
});
leftBtn.addEventListener('click', () => {
    if (gameStatus === 1) {
        mvLEvent();
    }
});
downBtn.addEventListener('click', () => {
    if (gameStatus === 1) {
        mvDEvent();
    }
});
rightBtn.addEventListener('click', () => {
    if (gameStatus === 1) {
        mvREvent();
    }
});

// 键盘事件
document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'ArrowLeft':  // 左箭头
            if (gameStatus === 1) {
                mvLEvent();
            }
            break;
        case 'ArrowUp':  // 上箭头
            if (gameStatus === 1) {
                mvUEvent();
            }
            break;
        case 'ArrowRight':  // 右箭头
            if (gameStatus === 1) {
                mvREvent();
            }
            break;
        case 'ArrowDown':  // 下箭头
            if (gameStatus === 1) {
                mvDEvent();
            }
            break;
    }
});

// 触摸事件
document.addEventListener('DOMContentLoaded', function () {
    let startX, startY, moveX, moveY;

    gameArea.addEventListener('touchstart', function (event) {
        event.preventDefault();
        let touch = event.touches[0];
        startX = touch.pageX;
        startY = touch.pageY;
    }, { passive: false });

    gameArea.addEventListener('touchmove', function (event) {
        event.preventDefault();
        let touch = event.touches[0];
        moveX = touch.pageX - startX;
        moveY = touch.pageY - startY;
    }, { passive: false });

    gameArea.addEventListener('touchend', function (event) {
        event.preventDefault();
        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX < 0) {
                if (gameStatus === 1) {
                    mvLEvent();
                }
            } else {
                if (gameStatus === 1) {
                    mvREvent();
                }
            }
        } else {
            if (moveY < 0) {
                if (gameStatus === 1) {
                    mvUEvent();
                }
            } else {
                if (gameStatus === 1) {
                    mvDEvent();
                }
            }
        }
    }, { passive: false });
});

// 初次加载激活游戏
document.addEventListener('DOMContentLoaded', function () {
    resizeCanvas();
    initRendering();
});

function multiKey(channel) {
    switch (channel) {
        case 'newGameButton':
            if (newGameButton.dataset.status === 'startGame' && gameStatus !== 1) {
                if (gameStatus === 2) {
                    replayOver();
                }
                newGame();
                updateButtonStatus(newGameButton, 'endGame');
            } else if (newGameButton.dataset.status === 'endGame' && gameStatus === 1) {
                gameOver();
                callBanner("已手动结束本局游戏");
            }
            break;
        case 'replayButton':
            if (replayButton.dataset.function === 'replayButton') {
                if (gameRecordString !== "2048Game|" && gameStatus === 0) {
                    replayInit();
                    replayHandler(gameRecordString);
                }
            }
            break;
        case 'replayButtonInput':
            if (replayButtonInput.dataset.function === 'replayButtonInput') {
                document.getElementById('popup').classList.remove('popup-hidden');
            }
            break;
        case 'controlMethodButton':
            if (controlButtons.classList.contains('global-hidden')) {
                controlButtons.classList.remove('global-hidden');
            } else {
                controlButtons.classList.add('global-hidden');
            }
            break;
        case 'replayButtonControl':
            if (replayButtonControl.dataset.status === 'pause') {
                clearInterval(replayIntervalId);
                replayIntervalId = null;
                updateButtonStatus(replayButtonControl, 'play');
                replayButtonPrev.disabled = false;
                newGameButton.disabled = false;
            } else if (replayButtonControl.dataset.status === 'play') {
                if (gameStatus === 0) {
                    replayInit();
                    replayHandler(gameRecordString);
                }
                if (replayIntervalId !== null) {
                    return;
                }
                replayIntervalId = setInterval(nextStep, PLAY_INTERVAL);
                updateButtonStatus(replayButtonControl, 'pause');
                replayButtonPrev.disabled = true;
                newGameButton.disabled = true;
            }
            break;
        case 'replayButtonNext':
            if (replayButtonNext.dataset.status === 'replay') {
                beginStep();
                updateButtonStatus(replayButtonNext, 'nextStep');
            } else {
                nextStep();
            }
            break;
        case 'replayButtonPrev':
            prevStep();
            break;
        case 'replayButtonCancel':
            if (gameStatus === 2) {
                replayOver();
                callBanner("已手动结束当前回放");
            }
            break;
        case 'replayInputBoxFinishButton':
            inputGameRecordString = replayInputBox.value.trim();
            if (inputGameRecordString !== "") {
                try {
                    gameRecordString = decompressGzip(inputGameRecordString);
                } catch (error) {
                    callBanner("请输入正确的回放代码");
                    break;
                }
                togglePopup();
                replayInputBox.value = '';
                replayInit();
                replayHandler(gameRecordString);
            } else {
                callBanner("请输入回放代码");
            }
            break;
        case 'shareButton':
            copyToClipboard();
            break;
        case 'shareLinkButton':
            copyToClipboard(shareLinkPrefix);
            break;
        default:
            break;
    }
}

function replayHandler(gameRecordString) {
    if (gameStatus === 2) {
        if (gameRecordString.indexOf('2048Game|') === 0 && gameRecordString.lastIndexOf('|GAMEOVER') === gameRecordString.length - 9) {
            updateButtonStatus(replayButtonControl, 'play');
            gameRecordStringParts = gameRecordString.split('|');
            gameSeed = Number(gameRecordStringParts[1]);
            gameLevel = Number(gameRecordStringParts[2]);
            replayProgressBar.max = gameRecordStringParts[3].length === 0 ? 1 : gameRecordStringParts[3].length;
            gameLevelSelector.value = gameRecordStringParts[2];
            prng = SeededRandom.createSeededRandom(gameSeed, 'xorshift');
            generateOneNumber();
            generateOneNumber();
        } else {
            callBanner("回放代码格式错误！");
            replayOver();
        }
    }
}


function nextStep(withAnimation = true, replayRewindMode = false) {
    if (gameStatus === 2) {
        if (isProcessingNextStep) {
            return;
        }
        isProcessingNextStep = true;

        let dir = gameRecordStringParts[3][gameRecordStep];
        let moved;
        switch (dir) {
            case 'l':
                moved = mvLEvent(withAnimation, replayRewindMode);
                break;
            case 'r':
                moved = mvREvent(withAnimation, replayRewindMode);
                break;
            case 'u':
                moved = mvUEvent(withAnimation, replayRewindMode);
                break;
            case 'd':
                moved = mvDEvent(withAnimation, replayRewindMode);
                break;

            default:
                break;
        }
        if (moved) {
            gameRecordStep += 1;
            gameRecordFrameCount += 1;
            replayProgressBar.value = gameRecordStep;
        }

        if (gameRecordStep === gameRecordStringParts[3].length) {
            replayProgressBar.value = replayProgressBar.max;
            replayOver(false);
            callBanner('已回放至最后');
            updateButtonStatus(replayButtonNext, 'replay');
            isProcessingNextStep = false;
            return;
        }

        isProcessingNextStep = false;
    }
}

function prevStep() {
    if (gameStatus === 2) {
        replayProgressBar.value = 0;
        if (gameRecordFrameCount === 0) {
            callBanner('已回放至开头');
            return;
        }
        if (gameRecordStep === gameRecordStringParts[3].length) {
            updateButtonStatus(replayButtonNext, 'nextStep');
        }
        let targetFrameCount = gameRecordFrameCount - 1;
        replayInit();
        replayHandler(gameRecordString);
        for (; gameRecordFrameCount < targetFrameCount;) {
            nextStep(false, true);
        }
        renderAllBlocks(currentNumberTable, true);
    }
}

function endStep() {
    if (gameStatus === 2) {
        replayProgressBar.value = 0;
        let targetFrameCount = gameRecordStringParts[3].length;
        replayInit();
        replayHandler(gameRecordString);
        for (; gameRecordFrameCount < targetFrameCount;) {
            nextStep(false, true);
        }
        renderAllBlocks(currentNumberTable, true);
    }
}

function beginStep() {
    if (gameStatus === 2) {
        replayProgressBar.value = 0;
        let targetFrameCount = 0;
        replayInit();
        replayHandler(gameRecordString);
        for (; gameRecordFrameCount < targetFrameCount;) {
            nextStep(false, true);
        }
        renderAllBlocks(currentNumberTable, true);
    }
}

// 监听下拉菜单变化
gameLevelSelector.addEventListener("change", function () {
    gameLevel = Number(this.value); // 更新gameLevel变量
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

// Base64验证函数
function validateBase64(str) {
    if (typeof str !== 'string') {
        return { isValid: false, error: 'validateBase64: 输入必须是字符串' };
    }

    if (str.trim().length === 0) {
        return { isValid: false, error: 'validateBase64: 输入字符串不能为空' };
    }

    // 处理可能的data URL前缀
    let base64Str = str;
    if (str.includes(',')) {
        base64Str = str.split(',')[1];
    }

    // Base64基本验证
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64Str)) {
        return { isValid: false, error: 'validateBase64: 无效的Base64格式' };
    }

    // 长度必须是4的倍数
    if (base64Str.length % 4 !== 0) {
        return { isValid: false, error: 'validateBase64: Base64字符串长度必须是4的倍数' };
    }

    // 尝试解码验证
    try {
        atob(base64Str);
        return { isValid: true };
    } catch (error) {
        return { isValid: false, error: 'validateBase64: 无效的Base64编码' };
    }
}

// 增强的解压函数
function decompressGzip(compressedBase64) {
    // 验证Base64格式
    const validation = validateBase64(compressedBase64);
    if (!validation.isValid) {
        throw new Error(`decompressGzip: Base64格式错误: ${validation.error}`);
    }

    // 提取Base64数据（移除可能的data URL前缀）
    let cleanBase64 = compressedBase64;
    if (compressedBase64.includes(',')) {
        cleanBase64 = compressedBase64.split(',')[1];
    }

    // 将Base64字符串转回Uint8Array
    const binaryString = atob(cleanBase64);
    const charData = binaryString.split('').map(char => char.charCodeAt(0));
    const compressedData = new Uint8Array(charData);

    // 验证是否为有效的gzip格式
    if (compressedData.length < 10) {
        throw new Error('decompressGzip: 无效的gzip格式: 数据过短');
    }

    // 检查gzip头部标识（0x1F 0x8B）
    if (compressedData[0] !== 0x1F || compressedData[1] !== 0x8B) {
        throw new Error('decompressGzip: 无效的gzip格式: 文件头标识错误');
    }

    // 检查压缩方法（应为8表示DEFLATE）
    if (compressedData[2] !== 8) {
        throw new Error('decompressGzip: 不支持的压缩格式: 仅支持DEFLATE压缩');
    }

    // 使用pako解压
    try {
        const decompressed = pako.ungzip(compressedData);

        if (!decompressed || decompressed.length === 0) {
            throw new Error('decompressGzip: 解压后数据为空');
        }

        // 将解压后的Uint8Array转回字符串
        const textDecoder = new TextDecoder();
        return textDecoder.decode(decompressed);
    } catch (decompressionError) {
        throw new Error(`decompressGzip: gzip解压失败: ${decompressionError.message}`);
    }
}

async function copyToClipboard(prefix = '') {
    try {
        await navigator.clipboard.writeText(prefix + encodeURIComponent(compressWithGzip(gameRecordString)));
        callBanner("文本已成功复制到剪贴板");
    } catch (err) {
        callBanner("复制失败: ", err);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    replayCode = new URLSearchParams(window.location.search).get('replayCode');
    if (replayCode !== null) {
        inputGameRecordString = decodeURIComponent(replayCode).trim();
        if (inputGameRecordString !== "") {
            try {
                gameRecordString = decompressGzip(inputGameRecordString);
            } catch (error) {
                callBanner("检测到链接中无效的回放代码");
                return;
            }
            replayInit();
            replayHandler(gameRecordString);
        } else {
            callBanner("检测到链接中无效的回放代码");
        }
    }
});
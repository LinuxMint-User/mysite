// 页面元素对象常量
// 指示器
const scoreIndicator = document.getElementById('score');
// const statusIndicator = document.getElementById('status');
const gameLevelSelector = document.getElementById('game-level');
// control-buttons 组件
const controlButtons = document.querySelector('.control-buttons');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
// 基础功能
const newGameButton = document.getElementById('newGameButton');
// 回放功能-触发器
const replayLastButton = document.getElementById('replayLastButton');
const replayOtherButton = document.getElementById('replayOtherButton');
// 回放功能-控制器
const replayButtonPrev = document.getElementById('replayButtonPrev');
const replayButtonControl = document.getElementById('replayButtonControl');
const replayButtonNext = document.getElementById('replayButtonNext');
const replayButtonCancel = document.getElementById('replayButtonCancel');
// 回放功能-控制器容器
const replayToolbar = document.getElementById('replayToolbar');
// 回放功能-输入文本框和确认按钮
const replayInputBox = document.getElementById('replayInputBox');
const replayInputBoxFinishButton = document.getElementById('replayInputBoxFinishButton');
// 回放功能-进度
const replayProgressBar = document.getElementById('replayProgressBar');
const replayProgressBarCurrentStep = document.getElementById('replayProgressBarCurrentStep');
const replayProgressBarRemainingSteps = document.getElementById('replayProgressBarRemainingSteps');
// 分享功能
const shareButton = document.getElementById('shareButton');
const shareLinkButton = document.getElementById('shareLinkButton');
// 游戏画布
const gameArea = document.getElementById('gameCanvas');

// 全局量
const gameRecordStepStartIndex = 0;
const currentUrl = new URL(window.location.href); // 获取当前页面的基础URL（去掉查询参数和哈希）
const baseURL = currentUrl.origin + currentUrl.pathname;
const shareURLQuery = '?replayCode=';
const shareLinkPrefix = baseURL + shareURLQuery;
const gameRecordStringPrefix = '2048Game';
const gameStatusEnum = {
    idle: 0,
    gaming: 1,
    replaying: 2
};

let currentScore = 0;
let gameStatus = gameStatusEnum.idle;
let gameLevel = Number(gameLevelSelector.value);

let currentNumberTable = initTable(4, 4, 0);
let mergeTagTable = initTable(4, 4, false);

let gameSeed = null; // initialized as needed
let prng = null; // initialized as needed

let gameRecordString = gameRecordStringPrefix + '|';
let inputGameRecordString = '';
let gameRecordStringParts = [];

let gameRecordStep = gameRecordStepStartIndex;
let gameRecordFrameCount = 0;
let replayIntervalId = null; // initialized as needed
let replayStepInterval = 800; // 800 ms

let isProcessingNextStep = false;

let replayCode = '';

//variable in banner.js
setBannerTimeout = 2000; // 2000 ms = 2 s

/**
 * 更新页面显示的当前分数
 * 从全局变量currentScore获取值并显示在ID为'score'的元素上
 */
function updateScoreIndicator(scoreIndicator, score) {
    scoreIndicator.textContent = String(score);
}

/**
 * 检查游戏面板上是否有空格子(值为0的位置)
 * @param {Array} table - 4x4的游戏面板二维数组
 * @returns {boolean} - 如果有空格子返回true，否则返回false
 */
function anySpaceThere(table) {
    for (let row = 0; row < table.length; row++) {
        for (let col = 0; col < table[row].length; col++) {
            if (table[row][col] === 0) {
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
    for (let row = 0; row < table.length; row++) {
        for (let col = 0; col < table[row].length; col++) {
            // 检查当前格子非空且不在最左侧
            if (table[row][col] != 0 && col != 0) {
                // 检查左侧格子是否为空或与当前格子数字相同
                if (table[row][col - 1] === 0 || table[row][col - 1] === table[row][col]) {
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
    for (let row = 0; row < table.length; row++) {
        for (let col = 0; col < table[row].length; col++) {
            // 检查当前格子非空且不在最右侧
            if (table[row][col] != 0 && col != table[row].length - 1) {
                // 检查右侧格子是否为空或与当前格子数字相同
                if (table[row][col + 1] === 0 || table[row][col + 1] === table[row][col]) {
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
    for (let row = 0; row < table.length; row++) {
        for (let col = 0; col < table[row].length; col++) {

            // 检查当前格子非空且不在最上方
            if (table[row][col] != 0 && row != 0) {

                // 检查上方格子是否为空或与当前格子数字相同
                if (table[row - 1][col] === 0 || table[row - 1][col] === table[row][col]) {
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
    for (let row = 0; row < table.length; row++) {
        for (let col = 0; col < table[row].length; col++) {
            // 检查当前格子非空且不在最下方
            if (table[row][col] != 0 && row != table.length - 1) {
                // 检查下方格子是否为空或与当前格子数字相同
                if (table[row + 1][col] === 0 || table[row + 1][col] === table[row][col]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function canMove(table) {
    return (anySpaceLeft(table) || anySpaceRight(table) || anySpaceAbove(table) || anySpaceBelow(table));
}

function isGameOver(table) {
    if (!anySpaceThere(table) && !canMove(table)) {
        gameOver();
    }
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

function getEmptyBlocks(table) {
    let emptyBlocks = [];
    for (let row = 0; row < table.length; row++) {
        for (let col = 0; col < table[row].length; col++) {
            if (table[row][col] === 0) {
                emptyBlocks.push({ row: row, col: col });
            }
        }
    }
    return emptyBlocks;
}

function getRandomBlock(prng, gameLevel, table) {
    if (!anySpaceThere(table)) {
        return { row: null, col: null, num: null };
    }
    const emptyBlocks = getEmptyBlocks(table);
    const { row, col } = emptyBlocks[prng.randomInt(emptyBlocks.length)]
    const rn = prng.random() < Number(gameLevel) ? 2 : 4; // 调整这里的值以改变难度
    return { row: row, col: col, num: rn };
}

function generateNumber(prng, gameLevel, table) {
    const { row, col, num } = getRandomBlock(prng, gameLevel, table);
    let changedTable;
    if (row !== null && col !== null && num != null) {
        changedTable = JSON.parse(JSON.stringify(table));
        changedTable[row][col] = num;
    }
    return { changedTable: changedTable, block: { row: row, col: col, num: num } };
}

function updateGameTable(data = { changedTable: null, updateTarget: 'single', block: { row: null, col: null, num: 0 }, triggerAnimation: true }) {
    if (data.changedTable !== null) {
        switch (data.updateTarget) {
            case 'single':
                if (data.block.row !== null && data.block.col !== null) {
                    currentNumberTable = data.changedTable;
                    if (data.triggerAnimation) {
                        renderingHandler({ type: renderingType.singleBlock, row: data.block.row, col: data.block.col, num: data.block.num });
                    } else {
                        renderingHandler({ type: renderingType.singleBlockDirect, row: data.block.row, col: data.block.col, num: data.block.num });
                    }
                } else {
                    currentNumberTable = data.changedTable;
                    renderingHandler({ type: renderingType.allBlocks, table: data.changedTable });
                }
                break;
            case 'all':
                currentNumberTable = data.changedTable;
                if (data.triggerAnimation) {
                    renderingHandler({ type: renderingType.allBlocks, table: data.changedTable });
                } else {
                    renderingHandler({ type: renderingType.allBlocksDirect, table: data.changedTable });
                }
                break;
        }
    }
}

function updateMergeTagTable(changedTable) {
    mergeTagTable = changedTable;
}

function generateOneNumber(data = { prng: null, gameLevel: null, numTable: null }) {
    const { changedTable, block } = generateNumber(data.prng, data.gameLevel, data.numTable);
    updateGameTable({ changedTable: changedTable, updateTarget: 'single', block: block, triggerAnimation: true })
}

function resetTable(originalTable, resetValue = 0) {
    let table = JSON.parse(JSON.stringify(originalTable));
    for (let row = 0; row < table.length; row++) {
        table[row] = new Array(table[row].length);
        for (let col = 0; col < table[row].length; col++) {
            table[row][col] = resetValue;
        }
    }
    return table;
}

function initTable(rows = 1, cols = 1, fillValue = 0) {
    let table = [];
    for (let row = 0; row < rows; row++) {
        table[row] = new Array(cols);
        for (let col = 0; col < cols; col++) {
            table[row][col] = fillValue;
        }
    }
    return table;
}

function commonInit() {
    currentScore = 0;
    updateScoreIndicator(scoreIndicator, currentScore);
    gameLevelSelector.disabled = true;
    replayLastButton.disabled = true;
    shareButton.disabled = true;
    shareLinkButton.disabled = true;
    currentNumberTable = resetTable(currentNumberTable, 0);
    mergeTagTable = resetTable(mergeTagTable, false);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderingHandler({ type: renderingType.allBlocksDirect, table: currentNumberTable });
}

function init() {
    gameSeed = generateRandomSeed();
    prng = SeededRandom.createSeededRandom(gameSeed, 'xorshift');
    gameRecordString = gameRecordStringPrefix + '|' + gameSeed + "|" + gameLevel + "|";
    gameStatus = gameStatusEnum.gaming;
    commonInit();
}

function replayInit() {
    replayToolbar.classList.remove('global-hidden');
    replayButtonCancel.classList.remove('global-hidden');
    newGameButton.classList.add('global-hidden');
    replayIntervalId = null;
    gameRecordStep = gameRecordStepStartIndex;
    gameRecordFrameCount = 0;
    gameStatus = gameStatusEnum.replaying;
    commonInit();
}

function gameOver() {
    if (gameStatus === gameStatusEnum.gaming) {
        gameRecordString += "|GAMEOVER";
        gameStatus = gameStatusEnum.idle;
        updateButtonStatus(newGameButton, 'startGame');
        gameLevelSelector.disabled = false;
        replayLastButton.disabled = false;
        shareButton.disabled = false;
        shareLinkButton.disabled = false;
    }
}

function replayOver(replayToolbarOff = true) {
    if (gameStatus === gameStatusEnum.replaying) {
        updateButtonStatus(replayButtonControl, 'play');
        replayButtonPrev.disabled = false;
        if (replayIntervalId !== null) {
            clearInterval(replayIntervalId);
            replayIntervalId = null;
        }
        if (replayToolbarOff) {
            gameStatus = gameStatusEnum.idle;
            newGameButton.disabled = false;
            gameLevelSelector.disabled = false;
            replayToolbar.classList.add('global-hidden');
            replayButtonCancel.classList.add('global-hidden');
            newGameButton.classList.remove('global-hidden');
            gameRecordStep = gameRecordStepStartIndex;
            gameRecordFrameCount = 0;
            updateReplayProgress(replayProgressBar, replayProgressBarCurrentStep, replayProgressBarRemainingSteps, 0, 1, true);
            updateButtonStatus(replayButtonNext, 'nextStep');
        }
    }
}

function newGame() {
    init();
    generateOneNumber({ prng: prng, gameLevel: gameLevel, numTable: currentNumberTable });
    generateOneNumber({ prng: prng, gameLevel: gameLevel, numTable: currentNumberTable });
}

/**
 * 向左移动游戏面板中的所有数字块
 * @param {Array} table - 4x4游戏面板二维数组
 * @param {Array} tag - 标记数组，用于记录哪些格子已经合并过
 * @returns {boolean} - 如果成功移动返回true，否则返回false
 */
function mvL(originalTable, originalTag, withAnimation = true) {
    let table = JSON.parse(JSON.stringify(originalTable));
    let tag = JSON.parse(JSON.stringify(originalTag));
    if (gameStatus !== gameStatusEnum.gaming && gameStatus !== gameStatusEnum.replaying) {
        return false;
    }
    // 检查是否可以向左移动
    if (!anySpaceLeft(table)) {
        return false;
    }

    // 重置合并标记数组
    tag = resetTable(tag, false);

    // 遍历每一列（从第二列开始）
    for (let row = 0; row < table.length; row++) {
        for (let col = 1; col < table[row].length; col++) {
            // 只处理非空格子
            if (table[row][col] != 0) {
                // 检查左侧所有可能的位置
                for (let col0 = 0; col0 < col; col0++) {
                    // 情况1: 左侧格子为空且中间无障碍物
                    if (table[row][col0] === 0 && !anyBlockHorizontal(row, col0, col, table)) {
                        if (withAnimation) {
                            moveAnimation(col, row, col0, row, table);  // 执行移动动画
                        }
                        table[row][col0] = table[row][col];  // 移动数字
                        table[row][col] = 0;            // 清空原位置
                        break;
                    }
                    // 情况2: 左侧格子数字相同且中间无障碍物
                    else if (table[row][col0] === table[row][col] && !anyBlockHorizontal(row, col0, col, table)) {
                        if (withAnimation) {
                            moveAnimation(col, row, col0, row, table);  // 执行移动动画
                        }
                        // 如果左侧格子已经合并过
                        if (tag[row][col0] != false) {
                            table[row][col0 + 1] = table[row][col];  // 移动到右侧相邻格子
                            table[row][col] = 0;
                        } else {
                            // 合并数字
                            table[row][col0] += table[row][col];
                            table[row][col] = 0;
                            tag[row][col0] = true;           // 标记已合并
                            currentScore += table[row][col0];  // 更新分数
                        }
                        break;
                    }
                }
            }
        }
    }
    if (gameStatus === gameStatusEnum.gaming) {
        gameRecordString += "l";
    }
    updateMergeTagTable(tag);
    updateGameTable({ changedTable: table, updateTarget: 'all', triggerAnimation: false });
    return true;
}

function mvR(originalTable, originalTag, withAnimation = true) {
    let table = JSON.parse(JSON.stringify(originalTable));
    let tag = JSON.parse(JSON.stringify(originalTag));
    if (gameStatus !== gameStatusEnum.gaming && gameStatus !== gameStatusEnum.replaying) {
        return false;
    }
    if (!anySpaceRight(table)) {
        return false;
    }
    tag = resetTable(tag, false);
    for (let row = 0; row < table.length; row++) {
        for (let col = table[row].length - 2; col >= 0; col--) {
            if (table[row][col] != 0) {
                for (let col0 = table[row].length - 1; col0 > col; col0--) {
                    if (table[row][col0] === 0 && !anyBlockHorizontal(row, col, col0, table)) {
                        if (withAnimation) {
                            moveAnimation(col, row, col0, row, table);  // 执行移动动画
                        }
                        table[row][col0] = table[row][col];
                        table[row][col] = 0;
                        break;
                    }
                    else if (table[row][col0] === table[row][col] && !anyBlockHorizontal(row, col, col0, table)) {
                        if (withAnimation) {
                            moveAnimation(col, row, col0, row, table);  // 执行移动动画
                        }
                        if (tag[row][col0] != false) {
                            table[row][col0 - 1] = table[row][col];
                            table[row][col] = 0;
                        } else {
                            table[row][col0] += table[row][col];
                            table[row][col] = 0;
                            tag[row][col0] = true;
                            currentScore += table[row][col0];
                        }
                        break;
                    }
                }
            }
        }
    }
    if (gameStatus === gameStatusEnum.gaming) {
        gameRecordString += "r";
    }
    updateMergeTagTable(tag);
    updateGameTable({ changedTable: table, updateTarget: 'all', triggerAnimation: false });
    return true;
}

/**
 * 向上移动游戏面板中的所有数字块
 * @param {Array} table - 4x4游戏面板二维数组
 * @param {Array} tag - 标记数组，用于记录哪些格子已经合并过
 * @returns {boolean} - 如果成功移动返回true，否则返回false
 */
function mvU(originalTable, originalTag, withAnimation = true) {
    let table = JSON.parse(JSON.stringify(originalTable));
    let tag = JSON.parse(JSON.stringify(originalTag));
    if (gameStatus !== gameStatusEnum.gaming && gameStatus !== gameStatusEnum.replaying) {
        return false;
    }
    // 检查是否可以向上移动
    if (!anySpaceAbove(table)) {
        return false;
    }

    // 重置合并标记数组
    tag = resetTable(tag, false);

    // 遍历每一行（从第二行开始）
    for (let row = 1; row < table.length; row++) {
        for (let col = 0; col < table[row].length; col++) {
            // 只处理非空格子
            if (table[row][col] != 0) {
                // 检查上方所有可能的位置
                for (let row0 = 0; row0 < row; row0++) {
                    // 情况1: 上方格子为空且中间无障碍物
                    if (table[row0][col] === 0 && !anyBlockVertical(col, row0, row, table)) {
                        if (withAnimation) {
                            moveAnimation(col, row, col, row0, table);  // 执行移动动画 
                        }
                        table[row0][col] = table[row][col];   // 移动数字
                        table[row][col] = 0;             // 清空原位置
                        break;
                    }
                    // 情况2: 上方格子数字相同且中间无障碍物
                    else if (table[row0][col] === table[row][col] && !anyBlockVertical(col, row0, row, table)) {
                        if (withAnimation) {
                            moveAnimation(col, row, col, row0, table);  // 执行移动动画 
                        }
                        // 如果上方格子已经合并过
                        if (tag[row0][col] != false) {
                            table[row0 + 1][col] = table[row][col];  // 移动到下方相邻格子
                            table[row][col] = 0;
                        } else {
                            // 合并数字
                            table[row0][col] += table[row][col];
                            table[row][col] = 0;
                            tag[row0][col] = true;            // 标记已合并
                            currentScore += table[row0][col];  // 更新分数
                        }
                        break;
                    }
                }
            }
        }
    }
    if (gameStatus === gameStatusEnum.gaming) {
        gameRecordString += "u";
    }
    updateMergeTagTable(tag);
    updateGameTable({ changedTable: table, updateTarget: 'all', triggerAnimation: false });
    return true;
}

function mvD(originalTable, originalTag, withAnimation = true) {
    let table = JSON.parse(JSON.stringify(originalTable));
    let tag = JSON.parse(JSON.stringify(originalTag));
    if (gameStatus !== gameStatusEnum.gaming && gameStatus !== gameStatusEnum.replaying) {
        return false;
    }
    if (!anySpaceBelow(table)) {
        return false;
    }
    tag = resetTable(tag, false);
    for (let row = table.length - 2; row >= 0; row--) {
        for (let col = 0; col < table[row].length; col++) {
            if (table[row][col] != 0) {
                for (let row0 = table.length - 1; row0 > row; row0--) {
                    if (table[row0][col] === 0 && !anyBlockVertical(col, row, row0, table)) {
                        if (withAnimation) {
                            moveAnimation(col, row, col, row0, table);  // 执行移动动画 
                        }
                        table[row0][col] = table[row][col];
                        table[row][col] = 0;
                        break;
                    }
                    else if (table[row0][col] === table[row][col] && !anyBlockVertical(col, row, row0, table)) {
                        if (withAnimation) {
                            moveAnimation(col, row, col, row0, table);  // 执行移动动画 
                        }
                        if (tag[row0][col] != false) {
                            table[row0 - 1][col] = table[row][col];
                            table[row][col] = 0;
                        } else {
                            table[row0][col] += table[row][col];
                            table[row][col] = 0;
                            tag[row0][col] = true;
                            currentScore += table[row0][col];
                        }
                        break;
                    }
                }
            }
        }
    }
    if (gameStatus === gameStatusEnum.gaming) {
        gameRecordString += "d";
    }
    updateMergeTagTable(tag);
    updateGameTable({ changedTable: table, updateTarget: 'all', triggerAnimation: false });
    return true;
}

function mvUEvent(withAnimation = true, replayRewindMode = false) {
    if (isAnimating && !replayRewindMode) {
        return false;
    }
    if (mvU(currentNumberTable, mergeTagTable, withAnimation)) {
        generateOneNumber({ prng: prng, gameLevel: gameLevel, numTable: currentNumberTable });
        updateScoreIndicator(scoreIndicator, currentScore);
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        return true;
    }
    return false;
}

function mvLEvent(withAnimation = true, replayRewindMode = false) {
    if (isAnimating && !replayRewindMode) {
        return false;
    }
    if (mvL(currentNumberTable, mergeTagTable, withAnimation)) {
        generateOneNumber({ prng: prng, gameLevel: gameLevel, numTable: currentNumberTable });
        updateScoreIndicator(scoreIndicator, currentScore);
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        return true;
    }
    return false;
}

function mvDEvent(withAnimation = true, replayRewindMode = false) {
    if (isAnimating && !replayRewindMode) {
        return false;
    }
    if (mvD(currentNumberTable, mergeTagTable, withAnimation)) {
        generateOneNumber({ prng: prng, gameLevel: gameLevel, numTable: currentNumberTable });
        updateScoreIndicator(scoreIndicator, currentScore);
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        return true;
    }
    return false;
}

function mvREvent(withAnimation = true, replayRewindMode = false) {
    if (isAnimating && !replayRewindMode) {
        return false;
    }
    if (mvR(currentNumberTable, mergeTagTable, withAnimation)) {
        generateOneNumber({ prng: prng, gameLevel: gameLevel, numTable: currentNumberTable });
        updateScoreIndicator(scoreIndicator, currentScore);
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
        return true;
    }
    return false;
}

// 虚拟按键事件
upBtn.addEventListener('click', () => {
    if (gameStatus === gameStatusEnum.gaming) {
        mvUEvent();
    }
});
leftBtn.addEventListener('click', () => {
    if (gameStatus === gameStatusEnum.gaming) {
        mvLEvent();
    }
});
downBtn.addEventListener('click', () => {
    if (gameStatus === gameStatusEnum.gaming) {
        mvDEvent();
    }
});
rightBtn.addEventListener('click', () => {
    if (gameStatus === gameStatusEnum.gaming) {
        mvREvent();
    }
});

// 键盘事件
document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'ArrowLeft':  // 左箭头
            if (gameStatus === gameStatusEnum.gaming) {
                mvLEvent();
            }
            break;
        case 'ArrowUp':  // 上箭头
            if (gameStatus === gameStatusEnum.gaming) {
                mvUEvent();
            }
            break;
        case 'ArrowRight':  // 右箭头
            if (gameStatus === gameStatusEnum.gaming) {
                mvREvent();
            }
            break;
        case 'ArrowDown':  // 下箭头
            if (gameStatus === gameStatusEnum.gaming) {
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
                if (gameStatus === gameStatusEnum.gaming) {
                    mvLEvent();
                }
            } else {
                if (gameStatus === gameStatusEnum.gaming) {
                    mvREvent();
                }
            }
        } else {
            if (moveY < 0) {
                if (gameStatus === gameStatusEnum.gaming) {
                    mvUEvent();
                }
            } else {
                if (gameStatus === gameStatusEnum.gaming) {
                    mvDEvent();
                }
            }
        }
    }, { passive: false });
});

// 按钮事件分配器
function multiKey(channel) {
    switch (channel) {
        case 'newGameButton':
            if (newGameButton.dataset.status === 'startGame' && gameStatus !== gameStatusEnum.gaming) {
                if (gameStatus === gameStatusEnum.replaying) {
                    replayOver();
                }
                newGame();
                updateButtonStatus(newGameButton, 'endGame');
            } else if (newGameButton.dataset.status === 'endGame' && gameStatus === gameStatusEnum.gaming) {
                gameOver();
                callBanner("已手动结束本局游戏");
            }
            break;
        case 'replayLastButton':
            if (replayLastButton.dataset.function === 'replayLastButton') {
                if (gameRecordString !== "2048Game|" && gameStatus === gameStatusEnum.idle) {
                    replayInit();
                    replayHandler(gameRecordString);
                }
            }
            break;
        case 'replayOtherButton':
            if (replayOtherButton.dataset.function === 'replayOtherButton') {
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
                if (gameStatus === gameStatusEnum.idle) {
                    replayInit();
                    replayHandler(gameRecordString);
                }
                if (replayIntervalId !== null) {
                    return;
                }
                replayIntervalId = setInterval(nextStep, replayStepInterval);
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
            if (gameStatus === gameStatusEnum.replaying) {
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

// 回放功能函数
// 回放链接处理及后处理
function replayHandler(gameRecordString) {
    if (gameStatus === gameStatusEnum.replaying) {
        updateButtonStatus(replayButtonControl, 'play');
        if (gameRecordString.indexOf('2048Game|') === 0 && gameRecordString.lastIndexOf('|GAMEOVER') === gameRecordString.length - 9) {
            gameRecordStringParts = gameRecordString.split('|');

            gameSeed = Number(gameRecordStringParts[1]);
            gameLevel = Number(gameRecordStringParts[2]);
            gameLevelSelector.value = gameLevel;

            updateReplayProgress(replayProgressBar, replayProgressBarCurrentStep, replayProgressBarRemainingSteps, 0, gameRecordStringParts[3].length === 0 ? 1 : gameRecordStringParts[3].length, true);

            prng = SeededRandom.createSeededRandom(gameSeed, 'xorshift');
            generateOneNumber({ prng: prng, gameLevel: gameLevel, numTable: currentNumberTable });
            generateOneNumber({ prng: prng, gameLevel: gameLevel, numTable: currentNumberTable });
        } else {
            callBanner("回放代码格式错误！");
            replayOver();
        }
    }
}

// 回放功能-更新进度条
function updateReplayProgress(progressBar, currentValueIndicator, maxValueIndicator, currentValue = 0, maxValue = null, showRemainingValue = false) {
    if (maxValue !== null) {
        progressBar.max = maxValue;
    }
    progressBar.value = currentValue;
    if (showRemainingValue) {
        maxValueIndicator.textContent = String('-' + (progressBar.max - progressBar.value));
        currentValueIndicator.textContent = String((progressBar.value));
    } else {
        maxValueIndicator.textContent = String((progressBar.max));
        currentValueIndicator.textContent = String((progressBar.value));
    }
}

// 回放功能-下一步
function nextStep(withAnimation = true, replayRewindMode = false) {
    if (gameStatus === gameStatusEnum.replaying) {
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
                callBanner(`检测到未知的操作符 ${dir}, 回放链接可能存在问题`);
                break;
        }
        if (moved) {
            gameRecordStep += 1;
            gameRecordFrameCount += 1;
            updateReplayProgress(replayProgressBar, replayProgressBarCurrentStep, replayProgressBarRemainingSteps, gameRecordStep, null, true);
        }

        if (gameRecordStep === gameRecordStringParts[3].length) {
            replayOver(false);
            callBanner('已回放至最后');
            updateButtonStatus(replayButtonNext, 'replay');
            isProcessingNextStep = false;
            return;
        }

        isProcessingNextStep = false;
    }
}

// 回放功能-上一步
function prevStep() {
    if (gameStatus === gameStatusEnum.replaying) {
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
        while (gameRecordFrameCount < targetFrameCount) {
            nextStep(false, true);
        }
        renderingHandler({ type: renderingType.allBlocks, table: currentNumberTable });
    }
}

// 回放功能-跳到最后
function endStep() {
    if (gameStatus === gameStatusEnum.replaying) {
        let targetFrameCount = gameRecordStringParts[3].length;
        replayInit();
        replayHandler(gameRecordString);
        while (gameRecordFrameCount < targetFrameCount) {
            nextStep(false, true);
        }
        renderingHandler({ type: renderingType.allBlocks, table: currentNumberTable });
    }
}

// 回放功能-回到最前
function beginStep() {
    if (gameStatus === gameStatusEnum.replaying) {
        let targetFrameCount = 0;
        replayInit();
        replayHandler(gameRecordString);
        for (; gameRecordFrameCount < targetFrameCount;) {
            nextStep(false, true);
        }
        renderingHandler({ type: renderingType.allBlocks, table: currentNumberTable });
    }
}

// 游戏难度下拉菜单变化监听器
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

// 复制到剪贴板功能函数
async function copyToClipboard(prefix = '') {
    try {
        await navigator.clipboard.writeText(prefix + encodeURIComponent(compressWithGzip(gameRecordString)));
        callBanner("文本已成功复制到剪贴板");
    } catch (err) {
        callBanner("复制失败: ", err);
    }
}

// 初次加载激活游戏并分析是否有回放代码
document.addEventListener('DOMContentLoaded', function () {
    resizeCanvas();
    initRendering();

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
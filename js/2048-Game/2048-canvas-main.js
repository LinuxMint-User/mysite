// 全局变量
var currentScore = 0;
var historyRecord = 0;
var gameStatus = 1;
var historyRecordCookieName = 'histRec2048';
var currentNumberTable = new Array();
var mergeTagTable = new Array();

/**
 * 更新页面显示的当前分数
 * 从全局变量currentScore获取值并显示在ID为'score'的元素上
 */
function fetchCurrentScore() {
    document.getElementById('score').innerText = currentScore;
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
    currentScore = 0;
    document.getElementById('score').innerText = currentScore;
    document.getElementById('status').innerText = "进行中";
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
    var rn = Math.random() < 0.5 ? 2 : 4;
    currentNumberTable[rx][ry] = rn;
    renderBlock(rx, ry, renderingBackgroundByNumber(rn), renderingTextByNumber(rn), rn);
    return true;
}

function isGameOver(table) {
    if (!anySpaceThere(table) && !canMove(table)) {
        gameOver();
    }
}

function gameOver() {
    document.getElementById('status').innerText = "游戏结束";
    document.getElementById('newGameButton').innerText = "新游戏";
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
function mvL(table, tag) {
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
                        moveAnimation(x, y, k, y);  // 执行移动动画
                        table[k][y] = table[x][y];  // 移动数字
                        table[x][y] = 0;            // 清空原位置
                        break;
                    }
                    // 情况2：左侧格子数字相同且中间无障碍物
                    else if (table[k][y] == table[x][y] && !anyBlockVertical(y, k, x, currentNumberTable)) {
                        moveAnimation(x, y, k, y);   // 执行移动动画
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
    return true;
}

function mvR(table, tag) {
    if (!anySpaceRight(table)) {
        return false;
    }
    setMergeTagTableToZero();
    for (var y = 0; y < 4; y++) {
        for (var x = 2; x >= 0; x--) {
            if (table[x][y] != 0) {
                for (var k = 3; k > x; k--) {
                    if (table[k][y] == 0 && !anyBlockVertical(y, x, k, currentNumberTable)) {
                        moveAnimation(x, y, k, y);
                        table[k][y] = table[x][y];
                        table[x][y] = 0;
                        break;
                    }
                    else if (table[k][y] == table[x][y] && !anyBlockVertical(y, x, k, currentNumberTable)) {
                        moveAnimation(x, y, k, y);
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
    return true;
}

/**
 * 向上移动游戏面板中的所有数字块
 * @param {Array} table - 4x4游戏面板二维数组
 * @param {Array} tag - 标记数组，用于记录哪些格子已经合并过
 * @returns {boolean} - 如果成功移动返回true，否则返回false
 */
function mvU(table, tag) {
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
                        moveAnimation(x, y, x, k);  // 执行移动动画
                        table[x][k] = table[x][y];   // 移动数字
                        table[x][y] = 0;             // 清空原位置
                        break;
                    }
                    // 情况2：上方格子数字相同且中间无障碍物
                    else if (table[x][k] == table[x][y] && !anyBlockHorizontal(x, k, y, currentNumberTable)) {
                        moveAnimation(x, y, x, k);    // 执行移动动画
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
    return true;
}

function mvD(table, tag) {
    if (!anySpaceBelow(table)) {
        return false;
    }
    setMergeTagTableToZero();
    for (var x = 0; x < 4; x++) {
        for (var y = 2; y >= 0; y--) {
            if (table[x][y] != 0) {
                for (var k = 3; k > y; k--) {
                    if (table[x][k] == 0 && !anyBlockHorizontal(x, y, k, currentNumberTable)) {
                        moveAnimation(x, y, x, k);
                        table[x][k] = table[x][y];
                        table[x][y] = 0;
                        break;
                    }
                    else if (table[x][k] == table[x][y] && !anyBlockHorizontal(x, y, k, currentNumberTable)) {
                        moveAnimation(x, y, x, k);
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
    return true;
}

document.getElementById('upBtn').addEventListener('click', () => {
    if (mvU(currentNumberTable, mergeTagTable)) {
        fetchCurrentScore();
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
    }
});
document.getElementById('leftBtn').addEventListener('click', () => {
    if (mvL(currentNumberTable, mergeTagTable)) {
        fetchCurrentScore();
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
    }
});
document.getElementById('downBtn').addEventListener('click', () => {
    if (mvD(currentNumberTable, mergeTagTable)) {
        fetchCurrentScore();
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
    }
});
document.getElementById('rightBtn').addEventListener('click', () => {
    if (mvR(currentNumberTable, mergeTagTable)) {
        fetchCurrentScore();
        setTimeout(function () { isGameOver(currentNumberTable); }, 400);
    }
});

const controlButtons = document.querySelector('.control-buttons');
if (isMobileDevice()) {
    controlButtons.style.display = 'grid';
} else {
    controlButtons.style.display = 'none';
}

// 键盘事件
document.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'ArrowLeft':  // 左箭头
            if (mvL(currentNumberTable, mergeTagTable)) {
                fetchCurrentScore();
                setTimeout(function () { isGameOver(currentNumberTable); }, 400);
            }
            break;
        case 'ArrowUp':  // 上箭头
            if (mvU(currentNumberTable, mergeTagTable)) {
                fetchCurrentScore();
                setTimeout(function () { isGameOver(currentNumberTable); }, 400);
            }
            break;
        case 'ArrowRight':  // 右箭头
            if (mvR(currentNumberTable, mergeTagTable)) {
                fetchCurrentScore();
                setTimeout(function () { isGameOver(currentNumberTable); }, 400);
            }
            break;
        case 'ArrowDown':  // 下箭头
            if (mvD(currentNumberTable, mergeTagTable)) {
                fetchCurrentScore();
                setTimeout(function () { isGameOver(currentNumberTable); }, 400);
            }
            break;
    }
});

// 触摸事件
document.addEventListener('DOMContentLoaded', function () {
    var startX, startY, moveX, moveY;
    var gameArea = document.querySelector('.gameArea');

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
                if (mvL(currentNumberTable, mergeTagTable)) {
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
            } else {
                if (mvR(currentNumberTable, mergeTagTable)) {
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
            }
        } else {
            if (moveY < 0) {
                if (mvU(currentNumberTable, mergeTagTable)) {
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
            } else {
                if (mvD(currentNumberTable, mergeTagTable)) {
                    fetchCurrentScore();
                    setTimeout(function () { isGameOver(currentNumberTable); }, 400);
                }
            }
        }
    }, { passive: false });
});

// 初次加载激活游戏
document.addEventListener('DOMContentLoaded', function () {
    multiKey();
    resizeCanvas();
});

function multiKey() {
    if (document.getElementById('newGameButton').innerText == "新游戏") {
        newGame();
        const controlButtons = document.querySelector('.control-buttons');
        if (controlButtons.style.display == 'none') {
            document.getElementById('newGameButton').innerText = "要用按键";
        }
        else if (controlButtons.style.display == 'grid') {
            document.getElementById('newGameButton').innerText = "不用按键";
        }
    }
    else if (document.getElementById('newGameButton').innerText == "要用按键") {
        controlButtons.style.display = 'grid';
        document.getElementById('newGameButton').innerText = "不用按键";
    }
    else if (document.getElementById('newGameButton').innerText == "不用按键") {
        controlButtons.style.display = 'none';
        document.getElementById('newGameButton').innerText = "要用按键";
    }
}

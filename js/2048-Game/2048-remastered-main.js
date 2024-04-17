
// game logic part
// global vars
var currentScore = 0;
var historyRecord = 0;
var gameStatus = 1;
var historyRecordCookieName = 'historyRecord-2048';
var currentNumberTable = new Array();
var mergeTagTable = new Array();
// about score
// fetch current score
function fetchCurrentScore() {
    document.getElementById('score').innerText = currentScore;
}
// fetch history record
function fetchHistoryRecord() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var nameEq = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        if (nameEq === historyRecordCookieName) {
            return decodeURIComponent(cookie.substring(eqPos + 1));
        }
    }
    return false;
}
// about scans
// scan if no space to generate a number on the table
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
// scan if no space left side
function anySpaceLeft(table) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (table[i][j] != 0 && j != 0) {
                if (table[i][j-1] == 0 || table[i][j-1] == table[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}
// scan if no space right side
function anySpaceRight(table) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (table[i][j] != 0 && j != 3) {
                if (table[i][j+1] == 0 || table[i][j+1] == table[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}
// scan if no space above side
function anySpaceAbove(table) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (table[i][j] != 0 && i != 0) {
                if (table[i-1][j] == 0 || table[i-1][j] == table[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}
// scan if no space below side
function anySpaceBelow(table) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (table[i][j] != 0 && i != 3) {
                if (table[i+1][j] == 0 || table[i+1][j] == table[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}
// scan if can move in any directions
function canMove(table) {
    if (anySpaceLeft(table) || anySpaceRight(table) || anySpaceAbove(table) || anySpaceBelow(table)) {
        return true;
    }
    return false;
}
// scan if blocks horizontal
function anyBlockHorizontal(row, col0, col1, table) {
    for (var col = col0 + 1; col < col1; col++) {
        if (table[row][col] != 0) {
            return true;
        }
    }
    return false;
}
// scan if blocks vertical
function anyBlockVertical(col, row0, row1, table) {
    for (var row = row0 + 1; row < row1; row++) {
        if (table[row][col] != 0) {
            return true;
        }
    }
    return false;
}
// about some main functions
// initialize the game
function init() {
    currentScore = 0;
    if (fetchHistoryRecord()) {
        historyRecord = fetchHistoryRecord();
    } else {
        historyRecord = 0;
    }
    // setup the score, history record and game status
    document.getElementById('score').innerText = currentScore;
    document.getElementById('historyRecord').innerText = historyRecord;
    document.getElementById('status').innerText = "进行中";
    // initialize CNT and MTT
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
    refreshGameView(currentNumberTable);
}
// refresh game view
function refreshGameView(table) {
    if (window.innerHeight <= window.innerWidth) {
        var VH = window.innerHeight;
        var width0 = (0.5 * VH - 60) / 4;
    } else {
        var VW =window.innerWidth;
        var width0 = (0.5 * VW - 25) / 4;
    }
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var numberCell = $('#nc-' + i + '-' + j);
            numberCell.css('width', width0+'px');
            if (table[i][j] == 0) {
                numberCell.css('background-color', 'transparent');
                numberCell.text('');
            } else {
                numberCell.css('background-color', renderingBackgroundByNumber(table[i][j]));
                numberCell.css('color', renderingTextByNumber(table[i][j]));
                numberCell.text(table[i][j]);
            }
        }
    }
}
// generate one number
function generateOneNumber() {
    if (!anySpaceThere(currentNumberTable)) {
        return false;
    }
    // choose a block randomly
    do {
        var rx = Math.floor(Math.random()*4);
        var ry = Math.floor(Math.random()*4);
    } while (currentNumberTable[rx][ry] != 0);
    // choose 2 or 4 randomly
    var rn = Math.random() < 0.5 ? 2 : 4;
    // time to show the number
    currentNumberTable[rx][ry] = rn;
    numberCellUpdater(rx, ry, rn);
    return true;
}
// if game over
function isGameOver(table) {
    if (!anySpaceThere(table) && !canMove(table)) {
        gameOver();
    }
}
// game over
function gameOver() {
    document.getElementById('status').innerText = "游戏结束";
    var score = document.getElementById('score').innerText || document.getElementById('score').textContent;
    var hisRec = document.getElementById('historyRecord').innerText || document.getElementById('historyRecord').textContent;
    if (score > hisRec) {
        var date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();
        document.cookie = historyRecordCookieName + "=" + score + expires + "; path=/";
    } else {
        var date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toUTCString();
        document.cookie = historyRecordCookieName + "=" + hisRec + expires + "; path=/";
    }
}
// set MTT to zero
function setMergeTagTableToZero() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            mergeTagTable[i][j] = 0;
        }
    }
}
// game trigger
function newGame() {
    init();
    generateOneNumber();
    generateOneNumber();
}
// about move actions
// move left
function mvL(table, tag) {
    // scan if can move left
    if (!anySpaceLeft(table)) {
        return false;
    }
    setMergeTagTableToZero();
    for (var i = 0; i < 4; i++) {
        for (var j = 1; j < 4; j++) {
            if (table[i][j] != 0) {
                for (var k = 0; k < j; k++) {
                    if (table[i][k] == 0 && !anyBlockHorizontal(i, k, j, currentNumberTable)) {
                        moveAnimation(i, j, i, k);
                        table[i][k] = table[i][j];
                        table[i][j] = 0;
                        continue;
                    }
                    else if (table[i][k] == table[i][j] && !anyBlockHorizontal(i, k, j, currentNumberTable)) {
                        moveAnimation(i, j, i, k);
                        if (tag[i][k] != 0) {
                            table[i][k+1] = table[i][j];
                            table[i][j] = 0;
                        } else {
                            table[i][k] += table[i][j];
                            table[i][j] = 0;
                            tag[i][k] = 1;
                            currentScore += table[i][k];
                        }
                        continue;
                    }
                }
            }
        }
    }
    setTimeout(function () {refreshGameView(currentNumberTable)}, 201);
    return true;
}
// move right
function mvR(table, tag) {
    // scan if can move right
    if (!anySpaceRight(table)) {
        return false;
    }
    setMergeTagTableToZero();
    for (var i = 0; i < 4; i++) {
        for (var j = 2; j >= 0; j--) {
            if (table[i][j] != 0) {
                for (var k = 3; k > j; k--) {
                    if (table[i][k] == 0 && !anyBlockHorizontal(i, j, k, currentNumberTable)) {
                        moveAnimation(i, j, i, k);
                        table[i][k] = table[i][j];
                        table[i][j] = 0;
                        continue;
                    }
                    else if (table[i][k] == table[i][j] && !anyBlockHorizontal(i, j, k, currentNumberTable)) {
                        moveAnimation(i, j, i, k);
                        if (tag[i][k] != 0) {
                            table[i][k-1] = table[i][j];
                            table[i][j] = 0;
                        } else {
                            table[i][k] += table[i][j];
                            table[i][j] = 0;
                            tag[i][k] = 1;
                            currentScore += table[i][k];
                        }
                        continue;
                    }
                }
            }
        }
    }
    setTimeout(function () {refreshGameView(currentNumberTable)}, 201);
    return true;
}
// move up
function mvU(table, tag) {
    // scan if can move up
    if (!anySpaceAbove(table)) {
        return false;
    }
    setMergeTagTableToZero();
    for (var j = 0; j < 4; j++) {
        for (var i = 1; i < 4; i++) {
            if (table[i][j] != 0) {
                for (var k = 0; k < i; k++) {
                    if (table[k][j] == 0 && !anyBlockVertical(j, k, i, currentNumberTable)) {
                        moveAnimation(i, j, k, j);
                        table[k][j] = table[i][j];
                        table[i][j] = 0;
                        continue;
                    }
                    else if (table[k][j] == table[i][j] && !anyBlockVertical(j, k, i, currentNumberTable)) {
                        moveAnimation(i, j, k, j);
                        if (tag[k][j] != 0) {
                            table[k+1][j] = table[i][j];
                            table[i][j] = 0;
                        } else {
                            table[k][j] += table[i][j];
                            table[i][j] = 0;
                            tag[k][j] = 1;
                            currentScore += table[k][j];
                        }
                        continue;
                    }
                }
            }
        }
    }
    setTimeout(function () {refreshGameView(currentNumberTable)}, 201);
    return true;
}
// move down
function mvD(table, tag) {
    // scan if can move down
    if (!anySpaceBelow(table)) {
        return false;
    }
    setMergeTagTableToZero();
    for (var j = 0; j < 4; j++) {
        for (var i = 2; i >= 0; i--) {
            if (table[i][j] != 0) {
                for (var k = 3; k > i; k--) {
                    if (table[k][j] == 0 && !anyBlockVertical(j, i, k, currentNumberTable)) {
                        moveAnimation(i, j, k, j);
                        table[k][j] = table[i][j];
                        table[i][j] = 0;
                        continue;
                    }
                    else if (table[k][j] == table[i][j] && !anyBlockVertical(j, i, k,currentNumberTable)) {
                        moveAnimation(i, j, k, j);
                        if (tag[k][j] != 0) {
                            table[k-1][j] = table[i][j];
                            table[i][j] = 0;
                        } else {
                            table[k][j] += table[i][j];
                            table[i][j] = 0;
                            tag[k][j] = 1;
                            currentScore += table[k][j];
                        }
                        continue;
                    }
                }
            }
        }
    }
    setTimeout(function () {refreshGameView(currentNumberTable)}, 201);
    return true;
}

// game actions part
// keyboard events
$(document).keydown(function(event) {
    switch (event.keyCode) {
        case 37:
            if (mvL(currentNumberTable,mergeTagTable)) {
                fetchCurrentScore();
                setTimeout(generateOneNumber, 201);
                setTimeout(function() {isGameOver(currentNumberTable);}, 400);
            }
            break;
        case 38:
            if (mvU(currentNumberTable,mergeTagTable)) {
                fetchCurrentScore();
                setTimeout(generateOneNumber, 201);
                setTimeout(function() {isGameOver(currentNumberTable);}, 400);
            }
            break;
        case 39:
            if (mvR(currentNumberTable,mergeTagTable)) {
                fetchCurrentScore();
                setTimeout(generateOneNumber, 201);
                setTimeout(function() {isGameOver(currentNumberTable);}, 400);
            }
            break;
        case 40:
            if (mvD(currentNumberTable,mergeTagTable)) {
                fetchCurrentScore();
                setTimeout(generateOneNumber, 201);
                setTimeout(function() {isGameOver(currentNumberTable);}, 400);
            }
            break;
    }
});
// touchScreen event
$(document).ready(function() {
    var startX, startY, moveX, moveY;
    var gameArea = $('.gameArea');
    gameArea.on('touchstart', function(event) {
        var touch = event.touches[0];
        startX = touch.pageX;
        startY = touch.pageY;
    });
    gameArea.on('touchmove', function(event) {
        var touch = event.touches[0];
        moveX = touch.pageX - startX;
        moveY = touch.pageY - startY;
    });
    gameArea.on('touchend', function(event) {
        if (Math.abs(moveX) > Math.abs(moveY)) {
            if (moveX < 0) {
                if (mvL(currentNumberTable,mergeTagTable)) {
                    fetchCurrentScore();
                    setTimeout(generateOneNumber, 201);
                    setTimeout(function() {isGameOver(currentNumberTable);}, 400);
                }
            } else {
                if (mvR(currentNumberTable,mergeTagTable)) {
                    fetchCurrentScore();
                    setTimeout(generateOneNumber, 201);
                    setTimeout(function() {isGameOver(currentNumberTable);}, 400);
                }
            }
        } else {
            if (moveY < 0) {
                if (mvU(currentNumberTable,mergeTagTable)) {
                    fetchCurrentScore();
                    setTimeout(generateOneNumber, 201);
                    setTimeout(function() {isGameOver(currentNumberTable);}, 400);
                }
            } else {
                if (mvD(currentNumberTable,mergeTagTable)) {
                    fetchCurrentScore();
                    setTimeout(generateOneNumber, 201);
                    setTimeout(function() {isGameOver(currentNumberTable);}, 400);
                }
            }
        }
    });
});

// activate the game
$(document).ready(function(e) {
    newGame();
});

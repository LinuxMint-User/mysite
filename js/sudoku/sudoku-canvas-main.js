// 全局变量
var sudokuCheckResult = false;

var remainedBlockNum = 0;

const inGame = true;
const outGame = false;
var gameStatus = outGame;

var sudokuTable = new Array(colNum);
var puzzleTable = new Array();
var markTable = new Array(colNum);

var gameLevelSelector = document.getElementById('game-level');
var gameLevel = gameLevelSelector.value;

const remainedBlockNumIndicator = document.getElementById('remainedBlockNum');
const sudokuCheckResultIndicator = document.getElementById('sudokuCheckResult');
const sudokuCheckButton = document.getElementById('sudokuCheck');
const newGameButton = document.getElementById('newGameButton');

var selectedBlock = {
    col: 0,
    row: 0
};


/**
 * 检查表中数字 0 的个数
 * @param {number[]} table 要检查的表
 * @returns 返回表中数字 0 的个数
 */
function countEmptyBlockNum(table) {
    let emptyBlockNum = 0;
    for (let col = 0; col < colNum; col++) {
        for (let row = 0; row < rowNum; row++) {
            if (table[col][row] === 0) {
                emptyBlockNum++;
            }
        }
    }
    return emptyBlockNum;
}

function updateRemainedBlockNum() {
    remainedBlockNumIndicator.innerText = String(countEmptyBlockNum(puzzleTable));
    remainedBlockNumIndicator.style.color = renderingColorByText(remainedBlockNumIndicator.innerText);
}

function init() {
    resizeCanvas();
    sudokuCheckResultIndicator.innerText = "未检查";
    sudokuCheckResultIndicator.style.color = renderingColorByText("未检查");
    sudokuCheckButton.style.display = 'block';
    newGameButton.innerText = "重开";
    newGameButton.style.display = 'none';
    gameStatus = outGame;
    gameLevelSelector.disabled = true;
    for (let col = 0; col < colNum; col++) {
        sudokuTable[col] = new Array(rowNum);
        markTable[col] = new Array(rowNum);
        for (let row = 0; row < rowNum; row++) {
            sudokuTable[col][row] = 0;
            markTable[col][row] = -1;
        }
    }
    generateSudokuTable(9, 9);
    puzzleTable = generateSudokuPuzzle(sudokuTable, gameLevel);
    initMarkTable(puzzleTable, sudokuTable);
    updateRemainedBlockNum();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderAllBlock(puzzleTable);
    gameStatus = inGame;
}

function generateRandom1to9() {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Fisher-Yates 洗牌算法
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

/**
 * 生成数独表
 * @param {number} cols 要生成的列数
 * @param {number} rows 要生成的行数
 */
function generateSudokuTable(cols, rows) {
    if (cols % 3 === 0 || rows % 3 === 0) {
        let relative_col = 0;
        let relative_row = 0;
        let random3x3 = generateRandom1to9();
        for (let cycle = 0; cycle < 2; cycle++) {
            for (let col = 0; col < 3; col++) {
                for (let row = 0; row < 3; row++) {
                    sudokuTable[col + relative_col * 3][row + relative_row * 3] = random3x3[row * 3 + col];
                }
            }
            relative_col = 2;
            relative_row = 2;
        }

        // 回溯算法填充剩余格子
        function backtrack(row, col) {
            if (row === rows) return true; // 所有行处理完毕
            if (col === cols) return backtrack(row + 1, 0); // 当前行处理完毕，转到下一行
            if (sudokuTable[col][row] !== 0) return backtrack(row, col + 1); // 已有数字，跳过

            const nums = generateRandom1to9();
            for (const num of nums) {
                if (isValidPlacement(col, row, num)) {
                    sudokuTable[col][row] = num;
                    if (backtrack(row, col + 1)) return true;
                    sudokuTable[col][row] = 0; // 回溯
                }
            }
            return false;
        }

        // 检查数字在当前位置是否有效
        function isValidPlacement(col, row, num) {
            // 检查行
            for (let c = 0; c < cols; c++) {
                if (sudokuTable[c][row] === num) return false;
            }
            // 检查列
            for (let r = 0; r < rows; r++) {
                if (sudokuTable[col][r] === num) return false;
            }
            // 检查3x3宫格
            const boxCol = Math.floor(col / 3) * 3;
            const boxRow = Math.floor(row / 3) * 3;
            for (let c = boxCol; c < boxCol + 3; c++) {
                for (let r = boxRow; r < boxRow + 3; r++) {
                    if (sudokuTable[c][r] === num) return false;
                }
            }
            return true;
        }

        backtrack(0, 0); // 从(0,0)开始回溯
    }
}

function initMarkTable(puzzleTable, sudokuTable) {
    for (let col = 0; col < sudokuTable.length; col++) {
        for (let row = 0; row < sudokuTable[col].length; row++) {
            if (puzzleTable[col][row] !== sudokuTable[col][row]) {
                markTable[col][row] = 0;
            }
        }
    }
}
/**
 * 更新格子背景颜色标志
 * @param {number[][]} puzzleTable 谜题数组
 * @param {number[][]} sudokuTable 终盘数组
 * @param {boolean} multiSolution 是否为多解模式 (验证全盘通过后使用多解模式)
 */
function updateMarkTable(puzzleTable, sudokuTable, multiSolution = false) {
    for (let col = 0; col < sudokuTable.length; col++) {
        for (let row = 0; row < sudokuTable[col].length; row++) {
            if (puzzleTable[col][row] !== sudokuTable[col][row]) {
                if (multiSolution) {
                    markTable[col][row] = 4;
                } else {
                    markTable[col][row] = 1;
                }
            }
            if (puzzleTable[col][row] === sudokuTable[col][row] && markTable[col][row] !== -1) {
                markTable[col][row] = 2;
            }
            if (puzzleTable[col][row] === 0) {
                markTable[col][row] = 0;
            }
        }
    }
}

function checkPuzzleTable() {
    if (!checkWholePuzzleTable(colNum, rowNum)) {
        updateMarkTable(puzzleTable, sudokuTable);
        sudokuCheckResultIndicator.innerText = "未通过";
        sudokuCheckResultIndicator.style.color = renderingColorByText(sudokuCheckResultIndicator.innerText);
        renderAllBlock(puzzleTable);
    }
    else {
        updateMarkTable(puzzleTable, sudokuTable, true);
        sudokuCheckResultIndicator.innerText = "通过";
        sudokuCheckResultIndicator.style.color = renderingColorByText(sudokuCheckResultIndicator.innerText);
        renderAllBlock(puzzleTable);
    }
    newGameButton.style.display = 'block';
    sudokuCheckButton.style.display = 'none';
    gameStatus = outGame;
    gameLevelSelector.disabled = false;
}

function handleSudokuNumInput(num) {
    if (gameStatus) {
        if (num || num === 0) {
            puzzleTable[selectedBlock.col][selectedBlock.row] = Number(num);
            markTable[selectedBlock.col][selectedBlock.row] = 3;
            renderAllBlock(puzzleTable);
            markTable[selectedBlock.col][selectedBlock.row] = 0;
            updateRemainedBlockNum();
        }
    }
}

/**
 * 检查数独表
 * @param {number} cols 要检查的列数
 * @param {number} rows 要检查的行数
 * @returns  是否通过检查(true/false)
 */
function checkWholeSudokuTable(cols, rows) {
    // 检查每行是否有重复
    for (let row = 0; row < rows; row++) {
        if (hasDuplicates(sudokuTable[row])) {
            return false;
        }
    }
    // 检查每列是否有重复
    for (let col = 0; col < cols; col++) {
        if (hasDuplicates(sudokuTable.map(row => row[col]))) {
            return false;
        }
    }
    // 检查每个宫格是否有重复
    for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 3; row++) {
            if (check3x3Table(col, row, sudokuTable)) {
                return false;
            }
        }
    }
    return true;
}

function check3x3Table(relative_col, relative_row, table) {
    const block3x3 = new Array();
    for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 3; row++) {
            block3x3.push(table[col + relative_col * 3][row + relative_row * 3])
            if (hasDuplicates(block3x3)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 判断数组中是否有重复
 * @param {number[]} arr 要检查的数组
 * @returns 是否发现重复(true/false)
 */
function hasDuplicates(arr) {
    const seen = new Set();         // 创建一个空哈希表
    for (const num of arr) {
        if (num === 0) continue;    // 跳过不需要检查的值（如数独中的空格）
        if (seen.has(num)) {        // 检查当前数字是否已在哈希表中
            return true;            // 存在立即返回 true
        }
        seen.add(num);              // 不存在加入哈希表
    }
    return false;                   // 遍历结束未发现重复
}

/**
 * 生成数独题目（从终盘挖空并确保唯一解）
 * @param {number[][]} solution 完整的数独终盘
 * @param {number} holes 要挖掉的数字数量
 * @returns {number[][]} 挖洞后的题目
 */
function generateSudokuPuzzle(solution, holes) {
    // 1. 复制终盘
    const puzzle = solution.map(row => [...row]);

    // 2. 随机打乱所有格子
    const cells = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            cells.push({ row, col });
        }
    }
    shuffleArray(cells);

    // 3. 尝试挖洞
    let removed = 0;
    for (const { row, col } of cells) {
        if (removed >= holes) break;

        const backup = puzzle[row][col];
        puzzle[row][col] = 0; // 挖空

        // 4. 验证唯一解
        if (countSolutions(JSON.parse(JSON.stringify(puzzle))) === 1) {
            removed++;
        } else {
            puzzle[row][col] = backup; // 不唯一则回填
        }
    }
    return puzzle;
}

/**
 * 检查谜题表
 * @param {number} cols 要检查的列数
 * @param {number} rows 要检查的行数
 * @returns  是否通过检查(true/false)
 */
function checkWholePuzzleTable(cols, rows) {
    // 检查是否有未填格子
    if (countEmptyBlockNum !== 0) {
        return false;
    }
    // 检查每行是否有重复
    for (let row = 0; row < rows; row++) {
        if (hasDuplicates(puzzleTable[row])) {
            return false;
        }
    }
    // 检查每列是否有重复
    for (let col = 0; col < cols; col++) {
        if (hasDuplicates(puzzleTable.map(row => row[col]))) {
            return false;
        }
    }
    // 检查每个宫格是否有重复
    for (let col = 0; col < 3; col++) {
        for (let row = 0; row < 3; row++) {
            if (check3x3Table(col, row, puzzleTable)) {
                return false;
            }
        }
    }
    return true;
}

/**
 * 统计数独的解的数量（严格版）
 * @param {number[][]} grid 数独题目
 * @returns {number} 解的数量（0、1或多解）
 */
function countSolutions(grid) {
    let count = 0;
    solve(grid, () => {
        count++;
        return count < 2; // 发现第二个解时终止
    });
    return count;
}

/**
 * 回溯法求解（支持提前终止）
 */
function solve(grid, onSolution) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (solve(grid, onSolution)) return true;
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return onSolution ? onSolution(grid) : true;
}

/**
 * 检查数字是否可填
 */
function isValid(grid, row, col, num) {
    // 检查行和列
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    // 检查宫
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (grid[boxRow + r][boxCol + c] === num) return false;
        }
    }
    return true;
}

/**
 * 打乱数组（Fisher-Yates算法）
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 监听点击事件
canvas.addEventListener("click", handleClick);

function getCanvasClickPosition(e, canvas) {
    // 获取 Canvas 的视口位置和实际渲染尺寸
    const rect = canvas.getBoundingClientRect();

    // 计算点击坐标（兼容鼠标和触摸事件）
    const clientX = e.clientX;
    const clientY = e.clientY;

    // 计算 Canvas 内部的逻辑坐标（考虑 DPR）
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;

    return { x, y };
}

function handleClick(e) {
    if (gameStatus) {// 获取点击坐标（考虑 DPR 和 Canvas 偏移）
        const { x, y } = getCanvasClickPosition(e, canvas);
        blockCol = Math.floor(x / blockSize) > 8 ? 8 : Math.floor(x / blockSize);
        blockRow = Math.floor(y / blockSize) > 8 ? 8 : Math.floor(y / blockSize);
        // console.log("点击格子:", blockCol, blockRow);
        if (markTable[blockCol][blockRow] !== -1 && markTable[blockCol][blockRow] !== 3 && !markTable.some(row => row.includes(3))) {
            let originalValue = markTable[blockCol][blockRow];
            markTable[blockCol][blockRow] = 3;
            selectedBlock.col = blockCol;
            selectedBlock.row = blockRow;
            renderAllBlock(puzzleTable);
            markTable[blockCol][blockRow] = originalValue;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    sudokuCheckButton.style.display = 'none';
});

// 监听下拉菜单变化
document.getElementById("game-level").addEventListener("change", function () {
    gameLevel = this.value; // 更新gameLevel变量
});
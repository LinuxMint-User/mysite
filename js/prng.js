/**
 * 伪随机数生成器模块 (函数式实现)
 * 提供确定性随机数生成，支持种子控制
 */

// ==================== 核心PRNG实现 ====================

/**
 * 创建线性同余生成器 (LCG)
 * 算法: Xₙ₊₁ = (a × Xₙ + c) mod m
 */
function createLCG(seed) {
    // 参数来自 Numerical Recipes
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    let state = seed ? hashSeed(seed) : generateRandomSeed();
    
    // 确保状态不为0
    if (state === 0) state = 1;
    
    /**
     * 生成0到1之间的随机浮点数
     * @returns {number} 0到1之间的随机浮点数
     */
    function random() {
        state = (a * state + c) % m;
        return state / m;
    }
    
    /**
     * 生成0到max-1之间的随机整数
     * @param {number} max 最大值（不包含）
     * @returns {number} 0到max-1之间的随机整数
     */
    function randomInt(max) {
        return Math.floor(random() * max);
    }
    
    /**
     * 生成min到max之间的随机整数（包含两端）
     * @param {number} min 最小值
     * @param {number} max 最大值
     * @returns {number} min到max之间的随机整数
     */
    function randomRange(min, max) {
        return min + randomInt(max - min + 1);
    }
    
    /**
     * 从数组中随机选择一个元素
     * @param {Array} array 源数组
     * @returns {*} 随机选中的元素
     */
    function choice(array) {
        if (!array || array.length === 0) return null;
        return array[randomInt(array.length)];
    }
    
    /**
     * 重置生成器状态到初始种子
     */
    function reset() {
        state = seed ? hashSeed(seed) : generateRandomSeed();
        if (state === 0) state = 1;
    }
    
    /**
     * 获取当前种子
     * @returns {number|string} 当前种子
     */
    function getSeed() {
        return seed;
    }
    
    /**
     * 获取当前状态值
     * @returns {number} 当前内部状态
     */
    function getState() {
        return state;
    }
    
    return {
        random,
        randomInt,
        randomRange,
        choice,
        reset,
        getSeed,
        getState
    };
}

/**
 * 创建Xorshift随机数生成器（更高质量的随机性）
 */
function createXorshift(seed) {
    let x = seed ? hashSeed(seed) : generateRandomSeed();
    let y = 362436069;
    let z = 521288629;
    let w = 88675123;
    
    // 确保初始状态不为0
    if (x === 0) x = 123456789;
    if (y === 0) y = 362436069;
    if (z === 0) z = 521288629;
    if (w === 0) w = 88675123;
    
    /**
     * Xorshift128算法生成随机数
     */
    function random() {
        const t = x ^ (x << 11);
        x = y;
        y = z;
        z = w;
        w = w ^ (w >>> 19) ^ (t ^ (t >>> 8));
        return (w >>> 0) / 0xFFFFFFFF;
    }
    
    /**
     * 生成0到max-1之间的随机整数
     */
    function randomInt(max) {
        return Math.floor(random() * max);
    }
    
    /**
     * 生成min到max之间的随机整数
     */
    function randomRange(min, max) {
        return min + randomInt(max - min + 1);
    }
    
    /**
     * 从数组中随机选择
     */
    function choice(array) {
        if (!array || array.length === 0) return null;
        return array[randomInt(array.length)];
    }
    
    /**
     * 重置生成器
     */
    function reset() {
        x = seed ? hashSeed(seed) : generateRandomSeed();
        y = 362436069;
        z = 521288629;
        w = 88675123;
        
        if (x === 0) x = 123456789;
        if (y === 0) y = 362436069;
        if (z === 0) z = 521288629;
        if (w === 0) w = 88675123;
    }
    
    function getSeed() {
        return seed;
    }
    
    function getState() {
        return { x, y, z, w };
    }
    
    return {
        random,
        randomInt,
        randomRange,
        choice,
        reset,
        getSeed,
        getState
    };
}

// ==================== 工具函数 ====================

/**
 * 将字符串种子转换为数字种子
 * @param {string|number} seed 种子值
 * @returns {number} 哈希后的数字种子
 */
function hashSeed(seed) {
    if (typeof seed === 'number') {
        // 确保是32位整数
        return seed >>> 0;
    }
    
    if (typeof seed === 'string') {
        // 简单的字符串哈希函数
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash >>> 0; // 转换为32位无符号整数
        }
        return hash || 1; // 避免返回0
    }
    
    // 默认生成随机种子
    return generateRandomSeed();
}

/**
 * 生成随机种子
 * @returns {number} 随机种子值
 */
function generateRandomSeed() {
    // 使用时间戳和Math.random组合生成种子
    const timestamp = Date.now();
    const randomPart = Math.random() * 0xFFFFFFFF;
    return (timestamp ^ randomPart) >>> 0;
}

/**
 * 创建随机数生成器（工厂函数）
 * @param {string|number} seed 种子值（可选）
 * @param {string} algorithm 算法类型：'lcg' 或 'xorshift'（默认）
 * @returns {Object} 随机数生成器对象
 */
function createSeededRandom(seed, algorithm = 'xorshift') {
    if (algorithm === 'lcg') {
        return createLCG(seed);
    } else if (algorithm === 'xorshift') {
        return createXorshift(seed);
    } else {
        throw new Error(`不支持的算法类型: ${algorithm}`);
    }
}

// ==================== 全局默认实例 ====================

// 创建默认的全局随机数生成器
let defaultPRNG = null;

/**
 * 获取默认的随机数生成器（懒加载）
 * @returns {Object} 默认随机数生成器
 */
function getDefaultPRNG() {
    if (!defaultPRNG) {
        defaultPRNG = createSeededRandom(generateRandomSeed(), 'xorshift');
    }
    return defaultPRNG;
}

/**
 * 设置默认随机数生成器的种子
 * @param {string|number} seed 种子值
 * @param {string} algorithm 算法类型
 */
function setDefaultSeed(seed, algorithm = 'xorshift') {
    defaultPRNG = createSeededRandom(seed, algorithm);
}

// ==================== 便捷函数 ====================

/**
 * 生成0到1之间的随机数（使用默认生成器）
 */
function random() {
    return getDefaultPRNG().random();
}

/**
 * 生成0到max-1之间的随机整数
 */
function randomInt(max) {
    return getDefaultPRNG().randomInt(max);
}

/**
 * 生成min到max之间的随机整数
 */
function randomRange(min, max) {
    return getDefaultPRNG().randomRange(min, max);
}

/**
 * 从数组中随机选择元素
 */
function choice(array) {
    return getDefaultPRNG().choice(array);
}

// ==================== 测试函数 ====================

/**
 * 测试随机数生成器的确定性
 */
function testDeterminism() {
    console.log('=== 测试随机数生成器的确定性 ===');
    
    // 测试LCG
    console.log('\n1. 测试LCG算法的确定性:');
    const seed1 = 12345;
    const lcg1 = createSeededRandom(seed1, 'lcg');
    const lcg2 = createSeededRandom(seed1, 'lcg');
    
    const lcgResults1 = [lgc1.random(), lcg1.random(), lcg1.random()];
    const lcgResults2 = [lgc2.random(), lcg2.random(), lcg2.random()];
    
    console.log('实例1结果:', lcgResults1.map(n => n.toFixed(5)));
    console.log('实例2结果:', lcgResults2.map(n => n.toFixed(5)));
    console.log('是否一致:', lcgResults1.every((v, i) => Math.abs(v - lcgResults2[i]) < 0.00001));
    
    // 测试Xorshift
    console.log('\n2. 测试Xorshift算法的确定性:');
    const seed2 = 'game-seed-2024';
    const xs1 = createSeededRandom(seed2, 'xorshift');
    const xs2 = createSeededRandom(seed2, 'xorshift');
    
    const xsResults1 = [xs1.random(), xs1.random(), xs1.random()];
    const xsResults2 = [xs2.random(), xs2.random(), xs2.random()];
    
    console.log('实例1结果:', xsResults1.map(n => n.toFixed(5)));
    console.log('实例2结果:', xsResults2.map(n => n.toFixed(5)));
    console.log('是否一致:', xsResults1.every((v, i) => Math.abs(v - xsResults2[i]) < 0.00001));
    
    // 测试重置功能
    console.log('\n3. 测试重置功能:');
    const prng = createSeededRandom(999, 'lcg');
    const beforeReset = [prng.random(), prng.random(), prng.random()];
    prng.reset();
    const afterReset = [prng.random(), prng.random(), prng.random()];
    
    console.log('重置前:', beforeReset.map(n => n.toFixed(5)));
    console.log('重置后:', afterReset.map(n => n.toFixed(5)));
    console.log('重置后是否相同:', beforeReset.every((v, i) => Math.abs(v - afterReset[i]) < 0.00001));
    
    // 测试便捷函数
    console.log('\n4. 测试便捷函数:');
    setDefaultSeed(888, 'xorshift');
    console.log('random():', random().toFixed(5));
    console.log('randomInt(10):', randomInt(10));
    console.log('randomRange(5, 15):', randomRange(5, 15));
    console.log('choice([1,2,3,4,5]):', choice([1,2,3,4,5]));
}

// ==================== 导出模块 ====================

// 判断环境并导出
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS/Node.js
    module.exports = {
        createSeededRandom,
        createLCG,
        createXorshift,
        hashSeed,
        generateRandomSeed,
        getDefaultPRNG,
        setDefaultSeed,
        random,
        randomInt,
        randomRange,
        choice,
        testDeterminism
    };
} else if (typeof define !== 'undefined' && define.amd) {
    // AMD/RequireJS
    define(function() {
        return {
            createSeededRandom,
            createLCG,
            createXorshift,
            hashSeed,
            generateRandomSeed,
            getDefaultPRNG,
            setDefaultSeed,
            random,
            randomInt,
            randomRange,
            choice,
            testDeterminism
        };
    });
} else {
    // 浏览器全局变量
    window.SeededRandom = {
        createSeededRandom,
        createLCG,
        createXorshift,
        hashSeed,
        generateRandomSeed,
        getDefaultPRNG,
        setDefaultSeed,
        random,
        randomInt,
        randomRange,
        choice,
        testDeterminism
    };
}

// 自动运行测试（开发时启用，生产时注释掉）
// testDeterminism();

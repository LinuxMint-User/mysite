/*
<!-- 菜单容器 -->
<div class="menu-wrapper">
    <button class="menu-button" id="menuButton">☰</button>
    <div class="menu-panel" id="menuPanel">
        <button class="menu-item" data-action="undo">
            <span class="icon">↶</span>
            <span>撤销</span>
        </button>
        <button class="menu-item" data-action="replay">
            <span class="icon">▶</span>
            <span>回放</span>
        </button>
        <button class="menu-item" data-action="new">
            <span class="icon">🔄</span>
            <span>新游戏</span>
        </button>
        <button class="menu-item" data-action="save">
            <span class="icon">💾</span>
            <span>保存</span>
        </button>
    </div>
    <div class="menu-overlay" id="menuOverlay"></div>
</div>
*/

/**
 * 菜单控制器 - 函数式编程版本
 * 纯函数、高阶函数、不可变状态思想
 */

// 状态管理
let isMenuOpen = false;
let menuItemClickCallback = null;

// DOM元素引用
const getMenuElements = () => ({
    menuButton: document.getElementById('menuButton'),
    menuPanel: document.getElementById('menuPanel'),
    menuOverlay: document.getElementById('menuOverlay')
});

// 纯函数：生成箭头HTML
const createArrowsHTML = () => `
    <div class="arrows-container">
        <span class="arrow">></span>
        <span class="arrow">></span>
        <span class="arrow">></span>
    </div>
`;

// 纯函数：切换按钮状态
const toggleButtonState = (button, isActive) => {
    if (isActive) {
        button.innerHTML = createArrowsHTML();
        button.classList.add('active');
    } else {
        button.innerHTML = '☰';
        button.classList.remove('active');
    }
};

// 纯函数：切换面板状态
const togglePanelState = (panel, isActive) => {
    if (isActive) {
        panel.classList.add('active');
    } else {
        panel.classList.remove('active');
    }
};

// 纯函数：切换遮罩状态
const toggleOverlayState = (overlay, isActive) => {
    if (isActive) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
};

// 打开菜单
const openMenu = () => {
    const { menuButton, menuPanel, menuOverlay } = getMenuElements();
    
    if (!menuButton || !menuPanel || !menuOverlay) return;
    
    isMenuOpen = true;
    toggleButtonState(menuButton, true);
    togglePanelState(menuPanel, true);
    toggleOverlayState(menuOverlay, true);
};

// 关闭菜单
const closeMenu = () => {
    const { menuButton, menuPanel, menuOverlay } = getMenuElements();
    
    if (!menuButton || !menuPanel || !menuOverlay) return;
    
    isMenuOpen = false;
    toggleButtonState(menuButton, false);
    togglePanelState(menuPanel, false);
    toggleOverlayState(menuOverlay, false);
};

// 切换菜单
const toggleMenu = () => {
    if (isMenuOpen) {
        closeMenu();
    } else {
        openMenu();
    }
};

// 处理菜单项点击
const handleMenuItemClick = (action, element) => {
    // 触发自定义事件
    const event = new CustomEvent('menu-item-click', {
        detail: { action, element }
    });
    document.dispatchEvent(event);
    
    // 调用回调函数
    if (typeof menuItemClickCallback === 'function') {
        menuItemClickCallback(action, element);
    }
    
    // 关闭菜单
    closeMenu();
};

// 设置菜单项点击回调
const setMenuItemClickCallback = (callback) => {
    menuItemClickCallback = callback;
};

// 获取菜单状态
const getMenuState = () => isMenuOpen;

// 事件监听器工厂函数
const createEventListener = (element, eventType, handler) => {
    if (element && typeof handler === 'function') {
        element.addEventListener(eventType, handler);
        return () => element.removeEventListener(eventType, handler);
    }
    return () => {};
};

// 初始化事件监听
const setupEventListeners = () => {
    const { menuButton, menuPanel, menuOverlay } = getMenuElements();
    const cleanupFunctions = [];
    
    // 菜单按钮点击
    if (menuButton) {
        const cleanup = createEventListener(menuButton, 'click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
        cleanupFunctions.push(cleanup);
    }
    
    // 菜单项点击
    document.querySelectorAll('.menu-item').forEach(item => {
        const cleanup = createEventListener(item, 'click', (e) => {
            e.stopPropagation();
            const action = item.getAttribute('data-action');
            handleMenuItemClick(action, item);
        });
        cleanupFunctions.push(cleanup);
    });
    
    // 遮罩点击
    if (menuOverlay) {
        const cleanup = createEventListener(menuOverlay, 'click', () => {
            if (isMenuOpen) closeMenu();
        });
        cleanupFunctions.push(cleanup);
    }
    
    // 页面点击
    const pageClickHandler = (e) => {
        const { menuButton, menuPanel } = getMenuElements();
        if (isMenuOpen && 
            menuButton && !menuButton.contains(e.target) && 
            menuPanel && !menuPanel.contains(e.target)) {
            closeMenu();
        }
    };
    document.addEventListener('click', pageClickHandler);
    cleanupFunctions.push(() => document.removeEventListener('click', pageClickHandler));
    
    // ESC键
    const escKeyHandler = (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    };
    document.addEventListener('keydown', escKeyHandler);
    cleanupFunctions.push(() => document.removeEventListener('keydown', escKeyHandler));
    
    // 返回清理函数
    return () => {
        cleanupFunctions.forEach(cleanup => cleanup());
    };
};

// 初始化菜单
const initMenu = () => {
    const cleanup = setupEventListeners();
    
    // 返回清理函数，便于组件卸载时清理
    return cleanup;
};

// 自动初始化
let cleanupFunction = null;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        cleanupFunction = initMenu();
    });
} else {
    cleanupFunction = initMenu();
}

// 提供公共API
const menuAPI = {
    openMenu,
    closeMenu,
    toggleMenu,
    setMenuItemClickCallback,
    getMenuState,
    initMenu
};

// 全局导出
window.menuAPI = menuAPI;

// 模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = menuAPI;
}
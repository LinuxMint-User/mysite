// // html sample
// <div id="myWindow" class="window">
//     <div class="window-header">
//         <span class="window-title">My Window</span>
//         <button class="window-close-btn">X</button>
//     </div>
//     <div class="window-content">
//         <!-- 窗口内容 -->
//     </div>
//     <div class="window-resizer"></div>
// </div>
// //  html sample

document.addEventListener('DOMContentLoaded', function () {
    const windowElement = document.getElementById('myWindow');
    const windowHeader = windowElement.querySelector('.window-header');
    const windowResizer = windowElement.querySelector('.window-resizer');

    let isDragging = false;
    let isResizing = false;
    let currentX, currentY, initialX, initialY, offsetX = 0, offsetY = 0;
    let rsinitialX, rsinitialY, dX, dY, initialHeight, initialWidth;

    // 触屏开始触摸时触发
    function handleTouchStart(e) {
        // e.preventDefault();
        isDragging = true;
        initialX = e.touches[0].clientX - offsetX;
        initialY = e.touches[0].clientY - offsetY;
    }

    // 触屏调整大小开始触摸时触发
    function rshandleTouchStart(e) {
        // e.preventDefault();
        isResizing = true;
        rsinitialX = e.touches[0].clientX;
        rsinitialY = e.touches[0].clientY;
        initialHeight = windowElement.offsetHeight;
        initialWidth = windowElement.offsetWidth;
    }

    // 触屏移动时触发
    function handleTouchMove(e) {
        if (!isDragging && !isResizing) { return; }
        else if (isDragging) {
            // e.preventDefault();
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
            offsetX = currentX;
            offsetY = currentY;
            setTranslate(currentX, currentY, windowElement);
        } else if (isResizing) {
            // e.preventDefault();
            dX = e.touches[0].clientX - rsinitialX;
            dY = e.touches[0].clientY - rsinitialY;

            setResizing(Math.min(Math.max(initialHeight + dY, 170.39), document.getElementById('preview').height), Math.min(Math.max(initialWidth + dX, 228.8), 840.3), windowElement);
        }
    }

    // 触屏结束触摸时触发
    function handleTouchEnd() {
        isDragging = false;
        isResizing = false;
    }

    // 转换为触摸事件的监听器
    windowHeader.addEventListener('touchstart', handleTouchStart);
    windowResizer.addEventListener('touchstart', rshandleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);


    function handleMouseDown(e) {
        // e.preventDefault();
        isDragging = true;
        initialX = e.clientX - offsetX;
        initialY = e.clientY - offsetY;
    }

    function rshandleMouseDown(e) {
        // e.preventDefault();
        isResizing = true;
        rsinitialX = e.clientX;
        rsinitialY = e.clientY;
        initialHeight = windowElement.offsetHeight;
        initialWidth = windowElement.offsetWidth;
    }

    function handleMouseMove(e) {
        if (!isDragging && !isResizing) { return; }
        else if (isDragging) {
            // e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            offsetX = currentX;
            offsetY = currentY;
            setTranslate(currentX, currentY, windowElement);
        } else if (isResizing) {
            // e.preventDefault();
            dX = e.clientX - rsinitialX;
            dY = e.clientY - rsinitialY;

            setResizing(Math.min(Math.max(initialHeight + dY, 170.39), document.getElementById('preview').height), Math.min(Math.max(initialWidth + dX, 228.8), 840.3), windowElement);
        }
    }

    function handleMouseUp() {
        isDragging = false;
        isResizing = false;
    }


    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    function setResizing(h, w, el) {
        el.style.height = h + 'px';
        el.style.width = w + 'px';
    }

    windowHeader.addEventListener('mousedown', handleMouseDown);
    windowResizer.addEventListener('mousedown', rshandleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);


    // 关闭窗口功能  
    windowElement.querySelector('.window-close-btn').addEventListener('click', function () {
        windowElement.style.display = 'none';
    });
});
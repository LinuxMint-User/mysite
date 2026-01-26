// 全局变量，用于记录当前显示的日志
let currentDisplayedLogDate = null;
// 动画控制变量
let isAnimating = false;
let pendingLogChange = null;

// 解析变更日志的函数
function parseChangeLogs(changeLogsContent) {
    const lines = changeLogsContent.split('\n');
    const logArray = [];
    let currentLog = null;

    lines.forEach(line => {
        if (line.startsWith('- ')) {
            // 如果当前日志对象存在，则将其添加到数组中
            if (currentLog) {
                logArray.push(currentLog);
            }
            // 创建新的日志对象并设置日期
            currentLog = { date: line };
        } else if (currentLog) {
            // 添加变更内容到当前日志对象
            currentLog.changes = (currentLog.changes || []).concat(line);
        }
    });

    // 添加最后一个日志对象到数组
    if (currentLog) {
        logArray.push(currentLog);
    }

    // 返回解析后的日志数组
    return logArray;
}

// 执行日志切换
function switchToLog(log, button) {
    // 更新当前显示的日志日期
    currentDisplayedLogDate = log.date;
    
    // 立即更新按钮状态
    const buttons = document.querySelectorAll('#button-list-0 button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    const container = document.getElementById('pre-container-0');
    
    // 设置动画标志
    isAnimating = true;
    
    // 如果容器当前是展开状态，先收起
    if (container.classList.contains('expanded')) {
        container.classList.remove('expanded');
        
        // 监听收起动画结束
        const collapseHandler = () => {
            container.removeEventListener('transitionend', collapseHandler);
            
            // 显示新内容
            displayLog(log);
            
            // 展开容器
            setTimeout(() => {
                container.classList.add('expanded');
                
                // 监听展开动画结束
                const expandHandler = () => {
                    container.removeEventListener('transitionend', expandHandler);
                    isAnimating = false;
                    
                    // 检查是否有等待的日志切换
                    if (pendingLogChange) {
                        const nextLog = pendingLogChange.log;
                        const nextButton = pendingLogChange.button;
                        pendingLogChange = null;
                        switchToLog(nextLog, nextButton);
                    }
                };
                
                container.addEventListener('transitionend', expandHandler, { once: true });
                
                // 安全超时，确保动画结束
                setTimeout(() => {
                    if (isAnimating) {
                        container.classList.add('expanded');
                        isAnimating = false;
                        if (pendingLogChange) {
                            const nextLog = pendingLogChange.log;
                            const nextButton = pendingLogChange.button;
                            pendingLogChange = null;
                            setTimeout(() => switchToLog(nextLog, nextButton), 10);
                        }
                    }
                }, 500);
            }, 10);
        };
        
        container.addEventListener('transitionend', collapseHandler, { once: true });
        
        // 安全超时，防止transitionend事件不触发
        setTimeout(() => {
            if (isAnimating) {
                container.classList.add('expanded');
                displayLog(log);
                isAnimating = false;
                if (pendingLogChange) {
                    const nextLog = pendingLogChange.log;
                    const nextButton = pendingLogChange.button;
                    pendingLogChange = null;
                    setTimeout(() => switchToLog(nextLog, nextButton), 10);
                }
            }
        }, 500);
    } else {
        // 如果容器已经是收起状态，直接显示新内容并展开
        displayLog(log);
        setTimeout(() => {
            container.classList.add('expanded');
            
            const expandHandler = () => {
                container.removeEventListener('transitionend', expandHandler);
                isAnimating = false;
                
                if (pendingLogChange) {
                    const nextLog = pendingLogChange.log;
                    const nextButton = pendingLogChange.button;
                    pendingLogChange = null;
                    switchToLog(nextLog, nextButton);
                }
            };
            
            container.addEventListener('transitionend', expandHandler, { once: true });
            
            // 安全超时
            setTimeout(() => {
                if (isAnimating) {
                    container.classList.add('expanded');
                    isAnimating = false;
                    if (pendingLogChange) {
                        const nextLog = pendingLogChange.log;
                        const nextButton = pendingLogChange.button;
                        pendingLogChange = null;
                        setTimeout(() => switchToLog(nextLog, nextButton), 10);
                    }
                }
            }, 500);
        }, 10);
    }
    
    // 滚动到顶部
    setTimeout(() => {
        const targetElement0 = document.getElementById("pre-0");
        targetElement0.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 300);
    
    // 滚动到容器
    setTimeout(() => {
        const targetElement1 = document.getElementById("changelog-container");
        targetElement1.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
        });
    }, 800);
}

// 创建按钮的函数
function createButton(log) {
    const button = document.createElement('button');
    button.type = "button";
    button.textContent = log.date;
    button.dataset.date = log.date;
    button.classList.add('log-button');
    
    // 如果当前显示的就是这个日志，给按钮添加高亮样式
    if (currentDisplayedLogDate === log.date) {
        button.classList.add('active');
    }
    
    button.onclick = function () {
        // 检查当前是否已经显示这个日志
        if (currentDisplayedLogDate === log.date) {
            return;
        }
        
        // 如果正在动画，保存当前请求
        if (isAnimating) {
            pendingLogChange = { log, button };
            return;
        }
        
        // 执行日志切换
        switchToLog(log, button);
    };
    
    return button;
}

// 显示日志的函数
function displayLog(log) {
    document.getElementById('changeLogs').innerHTML = marked.parse(log.date + '\n' + log.changes.join('\n'));
    
    // 更新当前显示的日志日期
    currentDisplayedLogDate = log.date;
}

// 更新按钮列表的函数
function updateButtons(changeLogsArray) {
    const buttonList = document.getElementById('button-list-0');
    buttonList.innerHTML = '';

    changeLogsArray.forEach(log => {
        const button = createButton(log);
        buttonList.appendChild(button);
    });
}

// 默认显示最新日志的函数
function defaultDisplayLatestLog(changeLogsArray) {
    // 清空状态
    pendingLogChange = null;
    isAnimating = false;
    
    // 找到最新的日志项
    const latestLog = changeLogsArray[0] || {};
    if (!latestLog.date) return;
    
    // 更新当前显示的日志日期
    currentDisplayedLogDate = latestLog.date;
    
    // 显示最新的日志内容
    displayLog(latestLog);
    
    // 确保容器是展开状态
    const container = document.getElementById('pre-container-0');
    container.classList.add('expanded');
    
    // 为对应的按钮添加active类
    setTimeout(() => {
        const buttons = document.querySelectorAll('#button-list-0 button');
        if (buttons.length > 0) {
            buttons.forEach(btn => btn.classList.remove('active'));
            buttons[0].classList.add('active');
        }
    }, 100);
}

// 主函数，用于获取变更日志内容并更新按钮列表
function main() {
    fetch('changeLogs.md')
        .then(response => response.text())
        .then(changeLogsContent => {
            const changeLogsArray = parseChangeLogs(changeLogsContent);
            updateButtons(changeLogsArray);
            defaultDisplayLatestLog(changeLogsArray);
        })
        .catch(error => {
            console.error('Error fetching the source code:', error);
            document.getElementById('changeLogs').textContent = 'Failed to load change logs. Please try again later.';
        });
    
    fetch('changePlans.md')
        .then(response => response.text())
        .then(changePlans => {
            const changePlansContainer = document.getElementById('changePlans');
            changePlansContainer.innerHTML = marked.parse(changePlans);
        })
        .catch(error => {
            console.error('Error fetching the source code:', error);
            document.getElementById('changePlans').textContent = 'Failed to load change plans. Please try again later.';
        });
}

// 启动主函数
main();

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

// 创建按钮的函数
function createButton(log) {
    const button = document.createElement('button');
    button.type = "button";
    button.textContent = log.date; // 设置按钮文本为日期
    button.dataset.date = log.date; // 存储日期到自定义数据属性
    button.onclick = function () {
        const container = document.getElementById('pre-container-0');
        container.classList.add('hidden');
        container.addEventListener('transitionend', function handler() {  
    		// 移除隐藏类和过渡结束事件监听器  
    		container.classList.remove('hidden');  
    		container.removeEventListener('transitionend', handler);  
    		// 添加新内容
            displayLog(log);
    					
  		}, { once: true });
        
    };
    return button;
}

// 显示日志的函数
function displayLog(log) {
    document.getElementById('changeLogs').innerHTML = marked.parse(log.date + '\n' + log.changes.join('\n'));
}

// 更新按钮列表的函数
function updateButtons(changeLogsArray) {
    const buttonList = document.getElementById('button-list-0');
    buttonList.innerHTML = ''; // 清空现有的按钮

    changeLogsArray.forEach(log => {
        const button = createButton(log);
        buttonList.appendChild(button);
    });
}

// 默认显示最新日志的函数
function defaultDisplayLatestLog(changeLogsArray) {
    // 找到最新的日志项
    const latestLog = changeLogsArray[0] || {}; // 如果数组为空，则返回空对象
    // 显示最新的日志内容
    displayLog(latestLog);
}

// 主函数，用于获取变更日志内容并更新按钮列表
function main() {
    fetch('changeLogs.md')
        .then(response => response.text())
        .then(changeLogsContent => {
            const changeLogsArray = parseChangeLogs(changeLogsContent);
            updateButtons(changeLogsArray); // 更新按钮列表
            defaultDisplayLatestLog(changeLogsArray); // 默认显示最新的日志
        })
        .catch(error => {
            console.error('Error fetching the source code:', error);
        });
    fetch('changePlans.md')
        .then(response => response.text())
        .then(changePlans => {
            const changePlansContainer = document.getElementById('changePlans');
            changePlansContainer.innerHTML = marked.parse(changePlans);
        })
        .catch(error => {
            console.error('Error fetching the source code:', error);
        });
}

// 启动主函数
main();
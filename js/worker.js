// 创建一个函数来发送日志消息
function sendLog(message) {
    self.postMessage({ log: message });
}

// 重写 console.log 以使用 sendLog 函数
console.log = function (message) {
    sendLog(message);
};

self.addEventListener('message', function (e) {
    if (e.data === 'terminate') {
        self.postMessage({ finished: true, terminated: true }); // 发送终止确认消息
        return; // 终止当前执行的代码
    }
    else if(typeof e.data === 'string') {
        // 使用 setTimeout 将代码执行安排到下一个事件循环
        setTimeout(() => {
            runCode(e.data);
        }, 0);
    }
});

function runCode(code) {
    try {
        // 执行用户代码
        let result = eval(code);

        // 检查结果是否为 Promise
        if (result && typeof result.then === 'function') {
            // 如果是 Promise，等待其解决
            result.then(
                res => {
                    // 发送成功结果之前，发送所有日志
                    self.postMessage({ success: res });
                    self.postMessage({ finished: true }); // 表示任务完成
                },
                err => {
                    self.postMessage({ error: err });
                    self.postMessage({ finished: true }); // 表示任务完成
                }
            );
        } else {
            // 如果不是 Promise，直接发送结果
            self.postMessage({ success: result });
            self.postMessage({ finished: true }); // 表示任务完成
        }
    } catch (error) {
        self.postMessage({ error: error.message });
        self.postMessage({ finished: true }); // 表示任务完成
    }
}
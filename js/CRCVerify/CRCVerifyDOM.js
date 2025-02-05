document.getElementById('select-file-button').addEventListener('click', function () {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('file-label').innerText = file.name;
        clearResult(); // 清除结果
    }
});

document.getElementById('select-checksum-file-button').addEventListener('click', function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                let checksum = extractChecksum(e.target.result.trim());
                if (checksum) {
                    document.getElementById('checksum-input').value = checksum;
                    clearResult(); // 清除结果
                } else {
                    alert('校验文件内容为空或格式不正确');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
});

document.getElementById('checksum-input').addEventListener('input', function () {
    clearResult(); // 清除结果
});

document.getElementById('check-button').addEventListener('click', function () {
    const fileLabel = document.getElementById('file-label');
    const checksumInput = document.getElementById('checksum-input');
    const checksumTypeCombo = document.getElementById('checksum-type-combo');
    const resultLabel = document.getElementById('result-label');

    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        alert('请先选择文件！');
        return;
    }

    const checksumType = checksumTypeCombo.value;
    const checksum = checksumInput.value.trim();

    if (!checksum) {
        alert('请输入校验值或选择校验文件');
        return;
    }

    // 显示模态框
    const msgWindow = document.getElementById('msgWindow');
    msgWindow.style.display = 'block';

    // 重置计时器
    let seconds = 0;
    const timer = document.getElementById('msgWindow-timer');
    timer.innerText = '0秒';

    // 启动计时器
    const interval = setInterval(() => {
        seconds++;
        timer.innerText = `${seconds}秒`;
    }, 1000);

    calculateChecksum(file, checksumType, checksum).then(function (calculatedChecksum) {
        clearInterval(interval); // 停止计时器
        msgWindow.style.display = 'none'; // 关闭模态框
        if (calculatedChecksum.toLowerCase() === checksum.toLowerCase()) {
            resultLabel.innerHTML = '校验结果：成功<br>计算出的校验值：<span class="selective-text" id="result-label-value" style="overflow-wrap: anywhere;"></span>';
            resultLabel.style.color = 'green';
            const resultLabelValue = document.getElementById('result-label-value');
            resultLabelValue.innerText = calculatedChecksum;
        } else {
            resultLabel.innerHTML = '校验结果：失败<br>计算出的校验值：<span class="selective-text" id="result-label-value" style="overflow-wrap: anywhere;"></span>';
            resultLabel.style.color = 'red';
            const resultLabelValue = document.getElementById('result-label-value');
            resultLabelValue.innerText = calculatedChecksum;
        }
    }).catch(function (err) {
        clearInterval(interval); // 停止计时器
        msgWindow.style.display = 'none'; // 关闭模态框
        alert('校验时出错：' + err.message);
    });
});

// 拖拽区域
const fileLabel = document.getElementById('file-label');
fileLabel.addEventListener('dragover', function (e) {
    e.preventDefault();
});

fileLabel.addEventListener('drop', function (e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        document.getElementById('file-input').files = files;
        document.getElementById('file-label').innerText = file.name;
        clearResult(); // 清除结果
    }
});
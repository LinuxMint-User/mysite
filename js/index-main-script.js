function hideChangePlan() {
    if (document.getElementById('hide-changeplan-button').innerText == '展开') {
        document.getElementById('pre-container-1').classList.add('expanded');
        document.getElementById('hide-changeplan-button').innerText = '收起';
        setTimeout(() => {
            const targetElement = document.getElementById("changeplan-container");
            targetElement.scrollIntoView({
                behavior: "smooth", // 平滑滚动
                block: "start",     // 控件顶部对齐视口顶部（关键参数）
                inline: "nearest"   // 水平方向保持自然
            });
        }, 380);
    }
    else if (document.getElementById('hide-changeplan-button').innerText == '收起') {
        document.getElementById('pre-container-1').classList.remove('expanded');
        document.getElementById('hide-changeplan-button').innerText = '展开';
    }
}
function hideChangeLog() {
    if (document.getElementById('hide-changelog-button').innerText == '展开') {
        document.getElementById('button-list-0-container').classList.add('expanded');
        document.getElementById('pre-container-0').classList.add('expanded');
        document.getElementById('changelog-content-container').classList.add('expanded');
        document.getElementById('hide-changelog-button').innerText = '收起';
        setTimeout(() => {
            const targetElement = document.getElementById("changelog-container");
            targetElement.scrollIntoView({
                behavior: "smooth", // 平滑滚动
                block: "start",     // 控件顶部对齐视口顶部（关键参数）
                inline: "nearest"   // 水平方向保持自然
            });
        }, 380);
    }
    else if (document.getElementById('hide-changelog-button').innerText == '收起') {
        document.getElementById('button-list-0-container').classList.remove('expanded');
        document.getElementById('pre-container-0').classList.remove('expanded');
        document.getElementById('changelog-content-container').classList.remove('expanded');
        document.getElementById('hide-changelog-button').innerText = '展开';
    }
}
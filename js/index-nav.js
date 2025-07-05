function loadTopLevelCategories() {
    const navContainer = document.getElementById('nav-container');
    navContainer.innerHTML = `
        <a href="#" class="custom-link nav-item" data-type="category" data-target="games">游戏</a>
        <a href="#" class="custom-link nav-item" data-type="category" data-target="tools">工具</a>
    `;
    navContainer.classList.add('loaded'); // 触发动画
}

document.addEventListener('DOMContentLoaded', loadTopLevelCategories);

document.getElementById('nav-container').addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('nav-item')) {
        event.preventDefault();
        const itemType = target.getAttribute('data-type');
        const targetId = target.getAttribute('data-target');

        if (itemType === 'category') {
            // 如果是分类，加载子分类或内容
            loadCategoryContent(targetId);
        } else if (itemType === 'content') {
            // 如果是内容，直接跳转
            window.location.href = target.getAttribute('href');
        }
    }
});

function loadCategoryContent(categoryId) {
    const navContainer = document.getElementById('nav-container');
    navContainer.classList.remove('loaded'); // 先移除loaded类，让内容隐藏
    setTimeout(() => { // 等待动画完成
        switch (categoryId) {
            case 'games':
                navContainer.innerHTML = `
                    <a class="custom-link nav-item" data-type="content" href="Subpages/Games/2048-remastered.html?from=index">2048 游戏</a>
                    <a class="custom-link nav-item" data-type="content" href="Subpages/Games/snake-Game.html?from=index">贪吃蛇 游戏</a>
                    <a href="#" class="custom-link nav-item" data-type="category" data-target="top">返回上级</a>
                `;
                break;
            case 'tools':
                navContainer.innerHTML = `
                    <a href="#" class="custom-link nav-item" data-type="category" data-target="editors">编辑器</a>
                    <a href="#" class="custom-link nav-item" data-type="category" data-target="resolvers">解析器</a>
                    <a href="#" class="custom-link nav-item" data-type="category" data-target="top">返回上级</a>
                `;
                break;
            case 'editors':
                navContainer.innerHTML = `
                    <a class="custom-link nav-item" data-type="content" href="Subpages/Tools/Editors/markdownEditor.html?from=index">Markdown 编辑器</a>
                    <a class="custom-link nav-item" data-type="content" href="Subpages/Tools/Editors/JSEditor.html?from=index">JavaScript 编辑器</a>
                    <a href="#" class="custom-link nav-item" data-type="category" data-target="tools">返回上级</a>
                `;
                break;
            case 'resolvers':
                navContainer.innerHTML = `
                    <a class="custom-link nav-item" data-type="content" href="Subpages/Tools/CRCVerify.html?from=index">CRC 校验工具</a>
                    <a class="custom-link nav-item" data-type="content" href="Subpages/Tools/APKDetailer.html?from=index">APK 解析器</a>
                    <a href="#" class="custom-link nav-item" data-type="category" data-target="tools">返回上级</a>
                `;
                break;
            case 'top':
                loadTopLevelCategories(); // 返回顶级分类
                break;
        }
        navContainer.classList.add('loaded'); // 再次添加loaded类，触发动画
    }, 210); // 等待动画完成
}
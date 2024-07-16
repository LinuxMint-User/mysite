/* html example
<div id="banner" class="banner">
    这是一个顶部横幅，它会自动消失。
</div>
*/

// script.js
window.onload = function () {
    var banner = document.getElementById('banner');

    // 显示横幅
    banner.style.display = 'block';

    // 5秒后隐藏横幅
    setTimeout(function () {
        banner.style.display = 'none';
    }, 5000);
};
/* html example
<div id="banner" class="banner" style="z-index: 11;">
    <span id="banner-content">这是一个顶部横幅，它会自动消失。</span>
</div>
*/

const banner = document.getElementById('banner');
const bannerContent = document.getElementById('banner-content');
let bannerTimeout;

// can be changed as needed
let setBannerTimeout = 5000;

function callBanner(text) {
    // 检查必要的DOM元素是否存在
    if (!banner || !bannerContent) {
        console.error('Banner elements not found');
        return;
    }
    
    // 清除之前的定时器
    if (bannerTimeout) {
        clearTimeout(bannerTimeout);
        bannerTimeout = null;
    }
    
    // 设置新的banner内容并显示
    bannerContent.textContent = text;
    banner.style.display = 'block';
    
    // 超时后隐藏的定时器
    bannerTimeout = setTimeout(function() {
        if (banner) {
            banner.style.display = 'none';
        }
        bannerTimeout = null;
    }, setBannerTimeout);
}
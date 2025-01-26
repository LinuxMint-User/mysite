function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth <= 768; // 假设屏幕宽度小于768px为移动端
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return (
        /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent) ||
        screenWidth ||
        touchSupport
    );
}
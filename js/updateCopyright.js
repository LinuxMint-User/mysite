// 获取当前年份
const currentYear = new Date().getFullYear();
// 获取id为year的span元素
const yearElement = document.getElementById('currentYearinCopyright');
// 直接更新span元素的文本内容为当前年份
yearElement.textContent = currentYear;

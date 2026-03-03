// 获取当前年份
const currentYear = new Date().getFullYear();
// 获取显示年份的span元素
const yearElement = document.getElementById('currentYearinCopyright');

// 【核心修改】在覆盖前，先读取元素的初始文本作为“网站起始年份”
const startYear = parseInt(yearElement.textContent, 10);

// 生成规范的版权年份字符串
let newCopyrightYear;
if (startYear === currentYear) {
    // 如果起始年份与今年相同，则只显示一个年份
    newCopyrightYear = startYear.toString();
} else {
    // 否则，显示“起始年份-当前年份”的范围
    newCopyrightYear = `${startYear}-${currentYear}`;
}

// 最后更新span元素的文本内容
yearElement.textContent = newCopyrightYear;
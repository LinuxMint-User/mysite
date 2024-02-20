//夜间模式调节//
document.addEventListener("DOMContentLoaded", function() {  
    var body = document.querySelector("body");  
	var footer = document.querySelector("footer")
    var currentHour = new Date().getHours();  
    if (currentHour >= 6 && currentHour < 18) {  
        body.classList.remove("night-mode");  
		footer.classList.remove("night-mode");  
    } else {  
        body.classList.add("night-mode");  
		footer.classList.add("night-mode");  
    }  
});

//防止连接拖动//
// 获取所有的链接元素  
var links = document.querySelectorAll('a');  
// 为每个链接元素添加 dragstart 事件监听器  
links.forEach(function(link) {  
link.addEventListener('dragstart', function(event) {  
// 阻止事件的默认行为，即阻止链接被拖动  
event.preventDefault();  
});  
});  

//测试代码区域//
// alert('你点击了链接！'); 
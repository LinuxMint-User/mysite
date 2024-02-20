document.addEventListener('DOMContentLoaded', function() { 
	// 获取链接元素  
	var link = document.getElementById('popupLink');  
  
	// 为链接添加点击事件监听器  
	link.addEventListener('click', function(event) {  
		// 阻止链接的默认行为（即导航到href指定的URL）  
		event.preventDefault();  

		// 显示弹窗  
		var popup = document.getElementById('popup');  
		popup.classList.toggle('popup-hidden');  
	});  

	//弹窗的部分逻辑处理
	document.getElementById('popup').addEventListener('click', function(event) {  
		if (event.target.classList.contains('popup-close')) {  
			this.classList.add('popup-hidden');  
		}  
	});  
});
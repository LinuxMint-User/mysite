const popup = document.getElementById('popup');

document.addEventListener('DOMContentLoaded', function() { 
	//弹窗的部分逻辑处理
	popup.addEventListener('click', function(event) {  
		if (event.target.classList.contains('popup-close')) {  
			this.classList.add('popup-hidden');  
		}  
	});  
});

function togglePopup() {
	if (popup.classList.contains('popup-hidden')) {
		popup.classList.remove('popup-hidden');
	} else {
		popup.classList.add('popup-hidden');
	}
}
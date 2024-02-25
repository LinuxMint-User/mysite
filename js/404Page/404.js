document.addEventListener('DOMContentLoaded', function() {  
    var countdownElement = document.getElementById('countdown');  
    var countdown = 3; // 设置倒计时的秒数  
  
    var countdownInterval = setInterval(function() {  
        countdown--;  
        countdownElement.textContent = countdown + '秒后自动返回首页...';  
  
        if (countdown === 0) {  
            clearInterval(countdownInterval);  
			countdownElement.textContent = '正在返回首页...';  
            window.location.href = '/mysite/'; // 倒计时结束后跳转到首页  
        }  
    }, 1000);  
});
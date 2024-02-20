var board = new Array();
var added = new Array();
var score = 0;
var top = 240;
// 获取设备宽度和高度  
var deviceWidth = window.innerWidth;  
var deviceHight = window.innerHeight;  

$(document).ready(function(e){
    newgame();
});
 
function newgame(){
    //初始化棋盘格
    init();
    //在随机两个各自声称的数字
    generateOneNumber();
    generateOneNumber();
}
 
function init(){
	score=0;
	document.getElementById("score").innerHTML=score;
	$("#gameover").css('display','none');
    for(var i = 0;i<4;i++){
        for(var j = 0;j<4;j++){
            var gridCell = $("#grid-cell-"+i+"-"+j);
            gridCell.css("top",getPosTop(i,j));
            gridCell.css("left",getPosLeft(i,j));
        }
    }
    
    for(var i = 0; i<4;i++){//初始化格子数组
        board[i] = new Array();
        for(var j = 0;j<4;j++){
            board[i][j] = 0;
        }
    }
    
    for(var i = 0; i<4;i++){//初始化判定合并的数组
        added[i] = new Array();
        for(var j = 0;j<4;j++){
            added[i][j] = 0;
        }
    }
    
    updateBoardView();//通知前端对board二位数组进行设定。
}

function updateBoardView(){//更新数组的前端样式
    $(".number-cell").remove();
    for(var i = 0;i<4;i++){
        for ( var j = 0; j < 4; j++) {
            $("#grid-container").append('<div class="number-cell" id="number-cell-'+i+'-'+j+'"></div>');
            var theNumberCell = $('#number-cell-'+i+'-'+j);
            if(board[i][j] == 0){
                theNumberCell.css('width','0px');
                theNumberCell.css('height','0px');
                theNumberCell.css('top',getPosTop(i,j));
                theNumberCell.css('left',getPosLeft(i,j));
            }else{
                
                // 根据设备宽度执行不同的代码块  
                if (deviceWidth <= 600 || deviceHight <= 600) {  
                    // 移动端代码逻辑  
                    theNumberCell.css('width','50px');
                    theNumberCell.css('hegiht','50px');
					theNumberCell.css('font-size','25px');
                    theNumberCell.css('top',getPosTop(i,j));
                    theNumberCell.css('left',getPosLeft(i,j));
                } else {  
                    // 桌面端代码逻辑  
                    theNumberCell.css('width','100px');
                    theNumberCell.css('hegiht','100px');
					theNumberCell.css('font-size','50px');
                    theNumberCell.css('top',getPosTop(i,j));
                    theNumberCell.css('left',getPosLeft(i,j));
                }  
                //NumberCell覆盖
                theNumberCell.css('background-color',getNumberBackgroundColor(board[i][j]));//返回背景色
                theNumberCell.css('color',getNumberColor(board[i][j]));//返回前景色
                theNumberCell.text(board[i][j]);
            }
        }
    }
}
 
function generateOneNumber(){//生成随机的格子
    if (nospace(board)) 
        return false;
    
    //随机一个位置
    var randx = parseInt(Math.floor(Math.random()*4));
    var randy = parseInt(Math.floor(Math.random()*4));
    while(true){
        if (board[randx][randy] == 0) 
            break;
        randx = parseInt(Math.floor(Math.random()*4));
        randy = parseInt(Math.floor(Math.random()*4));
    }
    //随机一个数字
    var randNumber = Math.random()<0.5 ? 2 : 4;
    //在随机位置显示随机数字
    board[randx][randy] = randNumber;
    showNumberWithAnimation(randx,randy,randNumber);
    return true;
}
 
//键盘事件响应循环
$(document).keydown(function(event) {  
        switch (event.keyCode) {  
            case 37: // left  
                if (moveLeft()) {  
                    getScore();  
                    setTimeout("generateOneNumber()", 201); // 每次新增一个数字就可能出现游戏结束  
                    setTimeout("isgameover()", 400);  
                }  
                break;  
            case 38: // up  
                if (moveUp()) {  
                    getScore();  
                    setTimeout("generateOneNumber()", 201); // 每次新增一个数字就可能出现游戏结束  
                    setTimeout("isgameover()", 400);  
                }  
                break;  
            case 39: // right  
                if (moveRight()) {  
                    getScore();  
                    setTimeout("generateOneNumber()", 201); // 每次新增一个数字就可能出现游戏结束  
                    setTimeout("isgameover()", 400);  
                }  
                break;  
            case 40: // down  
                if (moveDown()) {  
                    getScore();  
                    setTimeout("generateOneNumber()", 201); // 每次新增一个数字就可能出现游戏结束  
                    setTimeout("isgameover()", 400);  
                }  
                break;  
        }  

});

//触屏事件响应循环
$(document).ready(function() {  
	var startX, startY, moveX, moveY;  
	// 指定区域  
    var gameArea = $('#grid-container');  
    // 触摸开始  
    gameArea.on('touchstart', function(event) {  
        var touch = event.touches[0];  
        startX = touch.pageX;  
        startY = touch.pageY;  
    });  
  
    // 触摸移动  
    gameArea.on('touchmove', function(event) {  
        var touch = event.touches[0];  
        moveX = touch.pageX - startX;  
        moveY = touch.pageY - startY;  
    });  
  
    // 触摸结束  
    gameArea.on('touchend', function(event) {  
        // 根据移动的距离判断方向  
        if (Math.abs(moveX) > Math.abs(moveY)) {  
            if (moveX < 0) {  
                if(moveLeft()){  
                    getScore();  
                    setTimeout("generateOneNumber()",201); 
                    setTimeout("isgameover()",400);  
                }  
            } else {  
                if(moveRight()){  
                    getScore();  
                    setTimeout("generateOneNumber()",201); 
                    setTimeout("isgameover()",400);  
                }  
            }  
        } else {  
            if (moveY < 0) {  
                if(moveUp()){  
                    getScore();  
                    setTimeout("generateOneNumber()",201); 
                    setTimeout("isgameover()",400);  
                }  
            } else {  
                if(moveDown()){  
                    getScore();  
                    setTimeout("generateOneNumber()",201);  
                    setTimeout("isgameover()",400);  
                }  
            }  
        }  
    });  
});

function isgameover(){
    if(nospace(board)&&nomove(board))
        gameover();
}
 
function gameover() {  
    // 显示游戏结束页面  
    $("#gameover").css('display', 'block');  
      
    // 获取分数  
    var score = $("#score").text();  
      
    // // 获取输入的昵称  
    // var nickname = $("#nickname").val();  
      
    // // 检查昵称是否为空  
    // if (nickname !== '') {  
    //     // 保存分数到 "scoreboard.txt" 文件  
    //     saveScore(nickname, score);  
    // } else {  
    //     // 显示提示信息，提示用户输入昵称  
    //     alert('Your score will not be saved this time!');  
    // }  
}  

function isaddedArray(){//将判断能否合并的数组值置为0
	for(var i = 0;i<4;i++){
        for(var j = 0;j<4;j++){
        	added[i][j] = 0;
        }
   }
}
  
// function saveScore(nickname, score) {  
//     // 在这里实现将昵称和分数保存到 "scoreboard.txt" 的逻辑  
// 	const fs = require('fs');
// 	fs.writeFile('scoreboard.txt', nickname, function(err) {  
//   		if(err) {  
//     		console.log('An error ocurred creating the file');  
//   		} else {  
//     		console.log('File created successfully');  
//   		}	  
// 	});
// }

function moveLeft(){//更多地细节信息
    //判断格子是否能够向左移动
    if( !canMoveLeft(board))
        return false;
    
    isaddedArray();
    //真正的moveLeft函数//标准
    for(var i = 0;i<4;i++)
        for(var j = 1;j<4;j++){//第一列的数字不可能向左移动
            if(board[i][j] !=0){
                //(i,j)左侧的元素
                for(var k = 0;k<j;k++){
                    //落脚位置的是否为空 && 中间没有障碍物
                    if(board[i][k] == 0 && noBlockHorizontal(i , k, j, board)){
                        //move
                        showMoveAnimation(i, j,i,k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    //落脚位置的数字和本来的数字相等 && 中间没有障碍物
                    else if(board[i][k] == board[i][j] && noBlockHorizontal(i , k, j, board)){
                        //move
                        showMoveAnimation(i, j,i,k);
                        //add
                        if(added[i][k]!=0){//目标落脚点是否完成过合并
                        		board[i][k+1] = board[i][j];
                        		board[i][j] = 0;
                        }
                        else{
                        	board[i][k] += board[i][j];
                        	board[i][j] = 0;
                        	added[i][k] = 1;
                        	score +=board[i][k];
                        }
                        continue;
                    }
                }
            }
        }
    setTimeout("updateBoardView()",201);
    return true;
}
 
function moveRight(){//更多地细节信息
    //判断格子是否能够向右移动
    if( !canMoveRight(board))
        return false;
    
    isaddedArray();
    //真正的moveRight函数//标准
    for(var i = 0;i<4;i++)
        for(var j = 2;j>=0;j--){//最后一列的数字不可能向右移动
            if(board[i][j] !=0){
                //(i,j)右侧的元素
                for(var k = 3;k>j;k--){
                    //落脚位置的是否为空 && 中间没有障碍物
                    if(board[i][k] == 0 && noBlockHorizontal(i , j, k, board)){
                        //move
                        showMoveAnimation(i, j,i,k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    //落脚位置的数字和本来的数字相等 && 中间没有障碍物
                    else if(board[i][k] == board[i][j] && noBlockHorizontal(i , j, k, board)){
                        //move
                        showMoveAnimation(i, j,i,k);
                        //add
                         if(added[i][k]!=0){
                        		board[i][k-1] = board[i][j];
                        		board[i][j] = 0;
                        }
                        else{
                        	board[i][k] += board[i][j];
                        	board[i][j] = 0;
                        	added[i][k] = 1;
                        	score +=board[i][k];
                        }
                        continue;
                    }
                }
            }
        }
    setTimeout("updateBoardView()",201);
    return true;
}
 
function moveUp(){//更多地细节信息
    //判断格子是否能够向上移动
    if( !canMoveUp(board))
        return false;
    
    isaddedArray();
    //真正的moveUp函数//标准
    for(var j = 0;j<4;j++)
        for(var i = 1;i<4;i++){//第一行的数字不可能向上移动
            if(board[i][j] !=0){
                //(i,j)上面的元素
                for(var k = 0;k<i;k++){
                    //落脚位置的是否为空 && 中间没有障碍物
                    if(board[k][j] == 0 && noBlockVertical(j , k, i, board)){
                        //move
                        showMoveAnimation(i, j,k,j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    //落脚位置的数字和本来的数字相等 && 中间没有障碍物
                    else if(board[k][j] == board[i][j] && noBlockVertical(j , k, i, board)){
                        //move
                        showMoveAnimation(i, j,k,j);
                        //add
                        if(added[k][j]!=0){
                        	board[k+1][j] = board[i][j];
                        	board[i][j] = 0;
                        }
                        else{
                        	board[k][j] += board[i][j];
                        	board[i][j] = 0;
                        	added[k][j] = 1;
                        	score +=board[k][j];
                        }
                        continue;
                    }
                }
            }
        }
    setTimeout("updateBoardView()",201);
    return true;
}
 
function moveDown(){//更多地细节信息
    //判断格子是否能够向下移动
    if( !canMoveDown(board))
        return false;
        
    isaddedArray();
    //真正的moveDown函数//标准
    for(var j = 0;j<4;j++)
        for(var i = 2;i>=0;i--){//最后一行的数字不可能向下移动
            if(board[i][j] !=0){
                //(i,j)上面的元素
                for(var k = 3;k>i;k--){
                    //落脚位置的是否为空 && 中间没有障碍物
                    if(board[k][j] == 0 && noBlockVertical(j , i, k, board)){
                        //move
                        showMoveAnimation(i, j,k,j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    //落脚位置的数字和本来的数字相等 && 中间没有障碍物
                    else if(board[k][j] == board[i][j] && noBlockVertical(j , i, k, board)){
                        //move
                        showMoveAnimation(i, j,k,j);
                        //add
                        if(added[k][j]!=0){
                        	board[k-1][j] = board[i][j];
                        	board[i][j] = 0;
                        }
                        else{
                        	board[k][j] += board[i][j];
                        	board[i][j] = 0;
                        	added[k][j] = 1;
                        	score +=board[k][j];
                        }
                        continue;
                    }
                }
            }
        }
    setTimeout("updateBoardView()",201);
    return true;
}

// 监听窗口大小变化事件  
document.addEventListener('DOMContentLoaded',function() {
    function updateWholeView() {
        for(var i = 0;i<4;i++){
            for(var j = 0;j<4;j++){
                var gridCell = $("#grid-cell-"+i+"-"+j);
                gridCell.css("top",getPosTop(i,j));
                gridCell.css("left",getPosLeft(i,j));
            }
        }
        updateBoardView();
    }
    window.addEventListener('resize', function() {  
        //判断视口大小显示错误信息
        document.querySelector('.error-message').style.display = "none";
        deviceWidth = window.innerWidth;  
        deviceHight = window.innerHeight;
        if (deviceWidth < 250 || deviceHight < 550) {  
    	    document.querySelector('.error-message').style.display = "block";
    	}  
        if (deviceWidth <= 600 || deviceHight <= 600) {  
            // 移动端窗口大小变化时的逻辑  
            updateWholeView()
            document.querySelector('header').style.width = "300px";   
            document.querySelector('header > h1').style.fontSize = "22px";
            document.querySelector('header > h1').style.marginTop = "10px";
            document.querySelector('header > h1').style.marginBottom = "10px";
            document.querySelector('header > #newgamebutton').style.width = "120px";
            document.querySelector('header > #newgamebutton').style.padding = "5px";
            document.querySelector('header > p').style.fontSize = "18px";
            document.querySelector('#grid-container').style.width = "230px";
            document.querySelector('#grid-container').style.height = "230px";
            document.querySelector('#grid-container').style.padding = "10px";
            document.querySelector('#grid-container').style.margin = "20px auto";
            document.querySelector('#gameover').style.fontSize = "30px";
            document.querySelector('#gameover').style.width = "125px";
            const gridCells = document.getElementsByClassName('grid-cell');
            for(let i = 0;i < gridCells.length;i++) {
                gridCells[i].style.width = "50px";
                gridCells[i].style.height = "50px";
            }
            const numberCells = document.getElementsByClassName('number-cell');
            for(let i = 0;i < numberCells.length;i++) {
                numberCells[i].style.width = "50px";
                numberCells[i].style.height = "50px";
                numberCells[i].style.lineHeight = "50px";
                numberCells[i].style.fontSize = "25px";
				numberCells[i].style.lineHeight = "50px";
            }
        } else {  
            // 桌面端窗口大小变化时的逻辑  
            updateWholeView();
            document.querySelector('header').style.width = "500px";  
            document.querySelector('header > h1').style.fontSize = "60px";
            document.querySelector('header > h1').style.marginTop = "20px";
            document.querySelector('header > h1').style.marginBottom = "20px";
            document.querySelector('header > #newgamebutton').style.width = "100px";
            document.querySelector('header > #newgamebutton').style.padding = "10px";
            document.querySelector('header > p').style.fontSize = "25px";
            document.querySelector('#grid-container').style.width = "460px";
            document.querySelector('#grid-container').style.height = "460px";
            document.querySelector('#grid-container').style.padding = "20px";
            document.querySelector('#grid-container').style.margin = "40px auto";
            document.querySelector('#gameover').style.fontSize = "60px";
            document.querySelector('#gameover').style.width = "250px";
            const gridCells = document.getElementsByClassName('grid-cell');
            for(let i = 0;i < gridCells.length;i++) {
                gridCells[i].style.width = "100px";
                gridCells[i].style.height = "100px";
            }
            const numberCells = document.getElementsByClassName('number-cell');
            for(let i = 0;i < numberCells.length;i++) {
                numberCells[i].style.width = "100px";
                numberCells[i].style.height = "100px";
                numberCells[i].style.lineHeight = "100px";
                numberCells[i].style.fontSize = "50px";
				numberCells[i].style.lineHeight = "100px";
            }
        }  
    });
});
function getPosTop(i, j) {
    // 根据设备宽度执行不同的代码块  
    if (deviceWidth <= 600 || deviceHight <= 600) {  
        // 移动端代码逻辑  
        return 10 + i * 60;
    } else {  
        // 桌面端代码逻辑  
        return 20 + i * 120;
    }  
    
}
 
function getPosLeft(i, j) {
    // 根据设备宽度执行不同的代码块  
    if (deviceWidth <= 600 || deviceHight <= 600) {  
        // 移动端代码逻辑  
        return 10 + j * 60;
    } else {  
        // 桌面端代码逻辑  
        return 20 + j * 120;
    }  
    
}
 
function getNumberBackgroundColor(number) {
    switch (number) {
    case 2:
        return "#eee4da";
        break;
    case 4:
        return "#eee4da";
        break;
    case 8:
        return "#f26179";
        break;
    case 16:
        return "#f59563";
        break;
    case 32:
        return "#f67c5f";
        break;
    case 64:
        return "#f65e36";
        break;
    case 128:
        return "#edcf72";
        break;
    case 256:
        return "#edcc61";
        break;
    case 512:
        return "#9c0";
        break;
    case 1024:
        return "#3365a5";
        break;
    case 2048:
        return "#09c";
        break;
    case 4096:
        return "#a6bc";
        break;
    case 8192:
        return "#93c";
        break;
    }
    return "black";
}
 
function getNumberColor(number) {
    if (number <= 4){
        return "#776e65";
    }
    return "white";
}
 
function getScore(){
	document.getElementById("score").innerHTML=score;
}
 
//在随机生成数字的时候判断16宫格中是否还有空间
function nospace(board) {
    for ( var i = 0; i < 4; i++) 
        for ( var j = 0; j < 4; j++) 
            if (board[i][j] == 0)
                return false;
    return true;
}
 
//实现功能判断
function canMoveLeft( board ){ 
    for(var i = 0;i<4;i++)
        for(var j = 0;j<4;j++)
            if( board[i][j] !=0 && j != 0)
                if( board[i][j-1] == 0 || board[i][j-1] == board[i][j])
                    return true;
                    
    return false;
}
 
function canMoveRight( board ){
    for(var i = 0;i<4;i++)
        for(var j = 0;j<4;j++)
            if( board[i][j] !=0 && j != 3)
                if( board[i][j+1] == 0 || board[i][j+1] == board[i][j])
                    return true;
                    
    return false;
}
 
function canMoveUp( board ){
    for(var i = 0;i<4;i++)
        for(var j = 0;j<4;j++)
            if( board[i][j] !=0 && i != 0)
                if( board[i-1][j] == 0 || board[i-1][j] == board[i][j])
                    return true;   
    return false;
}
 
function canMoveDown( board ){
    for(var i = 0;i<4;i++)
        for(var j = 0;j<4;j++)
            if( board[i][j] !=0 && i != 3)
                if( board[i+1][j] == 0 || board[i+1][j] == board[i][j])
                    return true;
    return false;
}
 
//判断水平方向是否有障碍物
function noBlockHorizontal(row, col1, col2, board){
    for(var i = col1 + 1; i<col2; i++)
        if(board[row][i]!=0)
            return false;
    return true;
}
 
//判断竖直方向是否有障碍物
function noBlockVertical(col, row1, row2, board){
    for(var i = row1 + 1; i<row2; i++)
        if(board[i][col]!=0)
            return false;
    return true;
}
//最后收尾
function nomove(board){
    if(canMoveLeft(board)|| canMoveRight(board)||canMoveUp(board)||canMoveDown(board))
        return false;
    return true;
}
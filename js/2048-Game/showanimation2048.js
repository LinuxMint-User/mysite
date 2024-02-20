function showNumberWithAnimation(i, j, randNumber) {//实现随机数字的样式变动
 
    var numberCell = $('#number-cell-' + i + '-' + j);
    numberCell.css("background-color", getNumberBackgroundColor(randNumber));
    numberCell.css("color", getNumberColor(randNumber));
    numberCell.text(randNumber);
    // 根据设备宽度执行不同的代码块  
    if (deviceWidth <= 600 || deviceHight <= 600) {  
        // 移动端代码逻辑  
        numberCell.animate({
            width : "50px",
            height : "50px",
			fontSize : "25px",
			// lineHeight : "50px",
            top : getPosTop(i, j),
            left : getPosLeft(i, j)
        }, 50);
    } else {  
        // 桌面端代码逻辑  
        numberCell.animate({
            width : "100px",
            height : "100px",
			fontSize : "50px",
			// lineHeight : "100px",
            top : getPosTop(i, j),
            left : getPosLeft(i, j)
        }, 50);
    }  
}
 
function showMoveAnimation(fromx, fromy, tox, toy){//实现移动格子的样式变动
    
    var numberCell = $('#number-cell-'+fromx +'-'+fromy);
    numberCell.animate({top:getPosTop(tox,toy),
    left:getPosLeft(tox,toy)},200);
}
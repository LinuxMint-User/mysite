// rendering part
// text rendering
function renderingTextByNumber(number) {
    if (number <= 4) {
        return "#776e65";
    }
    return "white";
}
// background rendering
function renderingBackgroundByNumber(number) {
    switch (number) {
        case 2:
            return "#FCE4D6";
        case 4:
            return "#EEDC94";
        case 8:
            return "#FDB863";
        case 16:
            return "#FD8D3C";
        case 32:
            return "#F16713";
        case 64:
            return "#D94810";
        case 128:
            return "#A63603";
        case 256:
            return "#8F270E";
        case 512:
            return "#69221B";
        case 1024:
            return "#4C1628";
        case 2048:
            return "#2F073F";
        case 4096:
            return "#18003F";
        case 8192:
            return "#0C002B";
    }
}

// animations part
// update number-cell's background-color, font-color and number
function numberCellUpdater(i, j, num) {
    var numberCellID = '#nc-' + i + '-' + j;
    var numberCell = $(numberCellID);
    numberCell.css('width', '0');
    var VH = window.innerHeight;
    var width0 = (0.5 * VH - 60) / 4;
    numberCell.css('background-color', renderingBackgroundByNumber(num));
    numberCell.css('color', renderingTextByNumber(num));
    numberCell.animate({
        width : width0 + "px"
    }, 201);
    numberCell.text(num);
}
// move animation
function moveAnimation(fx, fy, tx, ty) {
    var fCell = document.getElementById('nc-' + fx + '-' + fy);
    var tCell = document.getElementById('nc-' + tx + '-' + ty);
    var frect = fCell.getBoundingClientRect();
    var trect = tCell.getBoundingClientRect();
    var numberCell = $('#nc-' + fx + '-' + fy);
    if (numberCell.text() != "") {
        numberCell.animate({
            top: (trect.y - frect.y),
            left: (trect.x - frect.x)
        }, 201, function () { setTimeout(function () { numberCell.css({ top: 0, left: 0 }); }, 0); });
    }
    
}

function drawLine(context, p1, p2, color) {
    context.strokeStyle = color;

    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
}

// https://dirask.com/posts/JavaScript-how-to-draw-point-on-canvas-element-PpOBLD
//
function drawPoint(context, x, y, label, color, size) {
    console.log("pkp:  ~ file: utils2.js:13 ~ drawPoint ~ context:", context)
    if (color == null) {
        color = '#000';
    }

    if (size == null) {
        size = 5;
    }

    // to increase smoothing for numbers with decimal part
    var pointX = Math.round(x);
    var pointY = Math.round(y);

    context.beginPath();
    context.fillStyle = color;
    context.arc(pointX, pointY, size, 0 * Math.PI, 2 * Math.PI);
    context.fill();

    if (label) {
        var textX = pointX;
        var textY = Math.round(pointY - size - 3);

        var text = label + '=(' + x + '; ' + y + ')';

        context.font = 'Italic 14px Arial';
        context.fillStyle = color;
        context.textAlign = 'center';
        context.fillText(text, textX, textY);
    }
}
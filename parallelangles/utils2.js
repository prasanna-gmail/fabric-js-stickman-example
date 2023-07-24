

var cRadius = 20;


var globalObj = {
    myAngle1: 0,
    myAngle2: 0
}
function makeCircle(num, title, left, top, line) {
    var c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 5,
        radius: cRadius,
        fill: '#fff',
        stroke: '#666'
    });
    c.hasControls = c.hasBorders = false;

    c.line = line;
    c.title = title;
    c.num = num;

    return c;
}

function makeLine(coords, color) {
    return new fabric.Line(coords, {
        fill: 'red',
        stroke: color,
        strokeWidth: 2,
        selectable: false,
        evented: false,
    });
}

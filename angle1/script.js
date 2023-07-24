(function () {
    var canvas = this.__canvas = new fabric.Canvas('c', { selection: false });
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

    function makeCircle(left, top, line, color, label) {
        var c = new fabric.Circle({
            left: left,
            top: top,
            strokeWidth: 5,
            radius: 12,
            fill: color,
            stroke: color
        });
        c.label = label
        c.hasControls = c.hasBorders = false;
        c.line = line;
        return c;
    }

    function makeLine(coords, color, num) {
        var l = new fabric.Line(coords, {
            fill: 'red',
            stroke: color,
            strokeWidth: 5,
            selectable: false,
            evented: false,
        });
        l.num = num;

        return l
    }

    var line1 = makeLine([100, 300, 500, 300], "red", 1),
        line2 = makeLine([300, 300, 200, 100], "green", 2),
        line3 = makeLine([300, 300, 300, 150], "blue", 3)

    canvas.add(line1, line2, line3);

    canvas.add(
        makeCircle(line1.x1, line1.y1, line1, "green", "point1"),
        makeCircle(line1.x2, line1.y2, line1, "green", "point2"),
        makeCircle(line2.x2, line2.y2, line2, "red"),
        makeCircle(line3.x2, line3.y2, line3, "red")
    );

    canvas.on('object:moving', function (e) {
        var p = e.target;
        // p.line && p.line.set({ 'x2': p.left, 'y2': p.top });
        console.log("pkp:  ~ file: script.js:49 ~ p:", p.line.angle)

        p.line.set({
            angle: p.line.angle + 10
        })
        console.log("pkp:  ~ file: script.js:54 ~ p.line:", p.line)
        // p.set({
        //     left: 100,
        //     top: 100

        // })
        // console.log("pkp:  ~ file: script.js:48 ~ p.line:", p.line)
        if (p.line.num == 1) {
            // console.log("pkp:  ~ file: script.js:52 ~ p.line.num:", p.line.num)

        } else {

        }
        canvas.renderAll();
    });
})();
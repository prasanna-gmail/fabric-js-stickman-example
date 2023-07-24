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



    function updatePointPos(p) {

    }
    function updatePoint(p) {

        deltaLeft = p.left - centerPointX;
        deltaTop = p.top - centerPointY;

        var length = Math.sqrt(deltaLeft * deltaLeft + deltaTop * deltaTop);
        // if (length <= centerRadius - 5 || length >= centerRadius + 5) {
        var radians = Math.atan2(deltaTop, deltaLeft)
        /**
         * Find the angle from radians
         */
        var ang = radians * 180 / Math.PI;
        // console.log("pkp:  ~ file: script.js:62 ~ ang:", ang)

        length = centerRadius;

        p.left = Math.cos(radians) * length + centerPointX
        p.top = Math.sin(radians) * length + centerPointY
        // } // end if length by 5

        if (p.line.num == 1) {
            // if line 1 then change the angle
            p.line.set({
                angle: ang
            })

            if (p.label == "point1") {
                console.log("pkp:  ~ file: script.js:62 ~ updatePoint ~ p.label:", p.label)

                console.log("pkp:  ~ file: script.js:66 ~ updatePoint ~  p.line.x2:", p.line.x2)
                // p2.set({
                //     left: p.line.x2,
                //     top: p.line.y2
                // })

                updatePointPos(p2)
            } else {

            }


        } else {
            // else change the top of the line to points position
            p.line && p.line.set({ 'x2': p.left, 'y2': p.top });
        }
        p.setCoords()
        canvas.renderAll();
    }
    canvas.on('object:moving', function (e) {
        var p = e.target;


        updatePoint(p, "on update")

    });


    var line1 = makeLine([100, 300, 500, 300], "red", 1),
        line2 = makeLine([300, 300, 200, 100], "green", 2),
        line3 = makeLine([300, 300, 300, 150], "blue", 3)

    var p1, p2, p3, p4;


    var centerPointX = 300,
        centerPointY = 300,
        centerRadius = 200

    function init() {
        canvas.add(line1, line2, line3);
        p1 = makeCircle(line1.x1, line1.y1, line1, "green", "point1")
        p2 = makeCircle(line1.x2, line1.y2, line1, "green", "point2")
        p3 = makeCircle(line2.x2, line2.y2, line2, "red")
        p4 = makeCircle(line3.x2, line3.y2, line3, "red")
        canvas.add(
            p1, p2, p3, p4
        );

        updatePoint(p3)
        updatePoint(p4)
    }
    init()

})();
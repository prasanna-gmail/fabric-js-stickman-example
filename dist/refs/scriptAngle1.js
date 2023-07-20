(function () {
    // var canvas = this.__canvas = new fabric.Canvas('c', { selection: false });
    // fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';




    $('#button').click(function () {
        fov += 10;
        drawSector(fov, "button");

    });

    $('#button2').click(function () {
        fov -= 10;
        drawSector(fov, "button2");
    });


    var w = 500,
        h = 500;
    var R = 100;
    var fov = 75.0;
    var lastFOV;

    var ele = {
        center: {
            x: 0.5,
            y: 0.5
        },
        focal: {
            x: 0.5,
            y: 0.5
        },
        radius: 0.6,
        transform: {
            rotate: 0,
            translate: {
                x: 0,
                y: 0,
            },
            scale: {
                x: 1,
                y: 1,
            }
        },
        stops: [{
            offset: '0',
            color: "purple",
            alpha: '0.75'
        },
        {
            offset: '0.9',
            color: "transparent",
            opacity: '0'
        }
        ]
    };

    var tr_str = "rotate(" + ele.transform.rotate + ",0.5,0.5) translate(" + ele.transform.translate.x * w + "," + ele.transform.translate.y * h + ") scale(" + ele.transform.scale.x + "," + ele.transform.scale.y + ")";
    var tr_matrix = fabric.parseTransformAttribute(tr_str);

    var rg = {
        type: 'radial',
        x1: ele.center.x,
        y1: ele.center.y,
        r1: 0,
        x2: ele.focal.x,
        y2: ele.focal.y,
        r2: R,
        //transformMatrix: [1,0,0,2,0,0],
        //gradientTransform: [1,0,0,2,0,0],
        gradientTransform: tr_matrix,
        colorStops: (function () {
            var color_stops = {};
            for (var i = 0; i < ele.stops.length; i++) {
                color_stops[ele.stops[i].offset] = ele.stops[i].color;
            }
            return color_stops;
        })()
    };

    var HideControls = {
        /* 'tl':false, */
        /* 'tr':false, */
        'bl': false,
        'br': false,
        'ml': false,
        'mt': false,
        'mr': false,
        'mb': false,
        'mtr': true
    };

    var canvas = new fabric.Canvas('canvas1');
    canvas.setWidth(w);
    canvas.setHeight(h);

    var x, y, my, startPoints;
    var sector;
    var rotationAngle = 0;
    // drawSector(fov, "init1");

    function drawSector(fov, callee) {
        console.log("pkp:  ~ file: scriptAngle1.js:105 ~ drawSector ~ callee:", callee)
        console.log("pkp:  ~ file: scriptAngle1.js:105 ~ drawSector ~ fov:", fov)
        $('#fov').html("FOV = " + fov);
        x = Math.cos(fov * Math.PI / 180.0) * R;
        y = Math.sin(fov * Math.PI / 180.0) * R;
        my = -Math.sin(fov / 2. * Math.PI / 180.0) * R / 2.;
        startPoints = [{
            x: 0,
            y: 0
        },
        {
            x: R,
            y: 0
        },
        {
            x: x,
            y: y
        }
        ];

        if (sector) {
            rotationAngle = sector.angle;
            canvas.remove(sector);
        }

        sector = new fabric.Polygon(startPoints, {
            left: w / 2,
            top: h / 2,
            originX: 'left',
            originY: 'top',
            centeredRotation: false,
            hasBorders: false,
            lockMovementX: true,
            lockMovementY: true,
            rotatingPointOffset: my,
            width: R,
            height: R
        });
        sector.setControlsVisibility(HideControls);
        sector.setGradient('fill', rg);
        rotationAngle = rotationAngle == 0 ? -fov / 2 : rotationAngle - (fov - lastFOV) / 2;
        sector.setAngle(rotationAngle);
        canvas.add(sector);
        lastFOV = fov;
    }









})();
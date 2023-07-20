(function () {
  var canvas = this.__canvas = new fabric.Canvas('c', { selection: false });
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';







  var cRadius = 12
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




  var line1 = makeLine([100, 100, 350, 100], "red"),
    line2 = makeLine([300, 50, 150, 350], "green"),
    line3 = makeLine([100, 300, 350, 300], "blue");
  line1.num = 1
  line2.num = 2
  line3.num = 3

  canvas.add(line1, line2, line3);

  var c1 = makeCircle(1, "a1", line1.get('x1'), line1.get('y1'), line1),
    c2 = makeCircle(2, "a2", line1.get('x2'), line1.get('y2'), line1),
    c3 = makeCircle(1, "b1", line2.get('x1'), line2.get('y1'), line2),
    c4 = makeCircle(2, "b2", line2.get('x2'), line2.get('y2'), line2),
    c5 = makeCircle(1, "c1", line3.get('x1'), line3.get('y1'), line3),
    c6 = makeCircle(2, "c2", line3.get('x2'), line3.get('y2'), line3)

  c1.opp = c2
  c2.opp = c1
  c3.opp = c4
  c4.opp = c3
  c5.opp = c6
  c6.opp = c5

  canvas.add(c1, c2, c3, c4, c5, c6);


  var mCircle = new fabric.Circle({
    radius: 20,
    left: 20,
    top: 110,
    angle: 15,
    // dirty: true,
    startAngle: 10,
    endAngle: 360,
    stroke: '#F00',
    strokeWidth: 1,
    fill: ''
  })
  mCircle.hasControls = mCircle.selectable = mCircle.evented = mCircle.hasBorders = false;
  canvas.add(mCircle);

  function getMyAngle(cx, cy, ex, ey) {
    var dy = ey - cy;
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta;
  }

  var sarc1 = null
  function updateAngle(point, callee) {

    var interPoint = calculateIntersection(
      { x: line1.get('x1'), y: line1.get('y1') },
      { x: line1.get('x2'), y: line1.get('y2') },
      { x: line2.get('x1'), y: line2.get('y1') },
      { x: line2.get('x2'), y: line2.get('y2') })
    // console.log("pkp:  ~ file: script.js:97 ~ interPoint:", interPoint)


    // let A = new vec2(72, 102),
    //   B = new vec2(134, 102),
    //   C = new vec2(147, 194);

    let A = new vec2(line1.get('x1'), line1.get('y1')),
      B = new vec2(interPoint.x, interPoint.y),
      C = new vec2(line2.get('x1'), line2.get('y1'));

    let angle1 = getAngle(A, B);
    let angle2 = getAngle(C, B);
    console.log("pkp:  ~  ~ angle1:", angle1, angle2)

    var angleX = angle2 - angle1;
    var angle3 = angleX * 180 / Math.PI;
    console.log("pkp:  ~ file: script.js:118 ~ updateAngle ~ angle3:", angle3)

    var diff = 12
    mCircle.set({
      'startAngle': 180 - diff,
      'endAngle': 180 + angle3 - diff,
      'left': interPoint.x,
      'top': interPoint.y
    })

  }

  function drawAngle(callee) {
    console.log("pkp:  ~ file: script.js:128 ~ drawAngle ~ callee:", callee)

    var interPoint = calculateIntersection(
      { x: line1.get('x1'), y: line1.get('y1') },
      { x: line1.get('x2'), y: line1.get('y2') },
      { x: line2.get('x1'), y: line2.get('y1') },
      { x: line2.get('x2'), y: line2.get('y2') })
    console.log("pkp:  ~ file: script.js:97 ~ interPoint:", interPoint)

    let A = new vec2(line1.get('x1'), line1.get('y1')),
      B = new vec2(interPoint.x, interPoint.y),
      C = new vec2(line2.get('x1'), line2.get('y1'));

    var opt = {
      fill: 'blue',
      radius: 100,
      points: [A, B, C]
    }

    /**
     * BO ARC
     */
    sarc1 = new fabric.Storearc(opt)
    sarc1.stAngle = 100
    sarc1.dirty = true;

    // sarc1.x = 20
    canvas.add(sarc1);
    canvas.renderAll();
    console.log("pkp:  ~ file: script.js:122 ~ drawAngle ~ sarc1:", sarc1)
    /**
     * EO ARC
     */





    // let A = new vec2(72, 102),
    //   B = new vec2(134, 102),
    //   C = new vec2(147, 194);

  }

  // drawAngle()


  canvas.on('object:moving', function (e) {
    var p = e.target;
    // p.left = p.line1.get('x1');

    if (p.title == "b1" || p.title == "b2") {
      // change the line x only
      p.line.set({ ['x' + p.num]: p.left })
      // restrict the point left
      p.top = p.line.get('y' + p.num);
      // change the opposition point top
      // p.opp.set({
      //   left: p.line.get('x' + p.num)
      // })

    }
    if (p.title == "a1" || p.title == "a2" || p.title == "c1" || p.title == "c2") {
      // change the line y only
      p.line.set({ 'y1': p.top, 'y2': p.top })
      // restrict the point left
      p.left = p.line.get('x' + p.num);
      // change the opposition point top
      p.opp.set({
        top: p.line.get('y' + p.num)
      })
    }
    // p.line1 && p.line1.set({ 'x1': p.left });
    // p.line2 && p.line2.set({ 'x2': p.left, 'y2': p.top });

    // p.set({
    //   top: clamp(p.top, 0, p.canvas.height - p.height - cRadius),
    //   left: clamp(p.left, 0, p.canvas.width - p.width - cRadius),
    // })
    p.setCoords();
    if (p.opp)
      p.opp.setCoords();

    // console.log("pkp:  ~ file: script.js:63 ~ p.line1:", p.line1)

    updateAngle(p, "pppp")
    canvas.renderAll();
  });
  function getCoord(p) {
    return p.line1 ? p.line1.top : p.line2.top
  }

  function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  };





})();
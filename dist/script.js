(function () {
  alert("pppppp")
  var canvas = this.__canvas = new fabric.Canvas('c', { selection: false });
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';


  var label1, label2 = null;
  function createLabel(callee) {
    var planetLabel = new fabric.Text('', {
      fill: '#fff',
      fontSize: 16,
      fontFamily: 'Open Sans',
      textBackgroundColor: '#002244'
    });
    return planetLabel
  }

  function updateLabel(label, c, angle, params) {
    console.log("pkp:  ~ file: script.js:18 ~ updateLabel ~ angle:", angle)
    label.set({
      left: c.left - 50,
      top: c.top - 20,
      text: Math.round(angle).toString()

    });

    label.setCoords()
  }

  function updateAngle(myLine1, myline2, myCircle, mAngle, callee) {
    console.log("pkp:  ~ file: script.js:28 ~ updateAngle ~ mAngle:", mAngle)

    var interPoint = calculateIntersection(
      { x: myLine1.get('x1'), y: myLine1.get('y1') },
      { x: myLine1.get('x2'), y: myLine1.get('y2') },
      { x: myline2.get('x1'), y: myline2.get('y1') },
      { x: myline2.get('x2'), y: myline2.get('y2') })
    // console.log("pkp:  ~ file: script.js:97 ~ interPoint:", interPoint)

    let A = new vec2(myLine1.get('x1'), myLine1.get('y1')),
      B = new vec2(interPoint.x, interPoint.y),
      C = new vec2(myline2.get('x1'), myline2.get('y1'));

    let angle1 = getAngle(A, B);
    let angle2 = getAngle(C, B);

    var diffAngle = angle2 - angle1;
    globalObj[mAngle] = diffAngle * 180 / Math.PI;
    var adjustAngle = 12
    myCircle.set({
      'startAngle': 180 - adjustAngle,
      'endAngle': 180 + globalObj[mAngle] - adjustAngle,
      'left': interPoint.x,
      'top': interPoint.y
    })

    myCircle.setCoords()
  }

  canvas.on('after:render', function (opt) {
    // console.log("pkp:  ~ file: script.js:118 ~ opt:", opt)

  })

  // mouse drag and moving....
  canvas.on('mouse:down', function (e) {



    console.log("pkp:  ~ file: script.js:70 ~ e.target:", e.target)
    if (e.target && e.target.label) {

      if (e.target.label == "myAngle1") {
        console.log("pkp:  ~ file: script.js:74 ~ globalObj.myAngle1:", globalObj.myAngle1)
      }
    }
  })
  /** ------------------------------------------------------------ BO moving --------------------------- */
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

    updateAngle(line1, line2, mCircle1, "myAngle1", "pppp")
    updateAngle(line3, line2, mCircle2, "myAngle2", "pppp")

    updateLabel(label1, mCircle1, globalObj.myAngle1, "from move")
    updateLabel(label2, mCircle2, globalObj.myAngle2, "from move")
    canvas.renderAll()
  });
  /** ------------------------------------------------------------ EO moving --------------------------- */



  function getCoord(p) {
    return p.line1 ? p.line1.top : p.line2.top
  }

  function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  };


  var line1, line2, line3;
  var c1, c2, c3, c4, c5, c6;
  var mCircle1, mCircle2

  function craeteAngleCircle(label, callee) {

    return new fabric.Circle({
      label: label,
      radius: 20,
      left: 20,
      top: 110,
      angle: 15,
      startAngle: 10,
      endAngle: 360,
      stroke: '#000',
      strokeWidth: 1,
      fill: ''
    })
  }
  function createAll() {


    line1 = makeLine([100, 200, 600, 200], "red"),
      line2 = makeLine([400, 100, 350, 500], "green"),
      line3 = makeLine([100, 400, 600, 400], "blue");
    line1.num = 1; line2.num = 2; line3.num = 3;



    c1 = makeCircle(1, "a1", line1.get('x1'), line1.get('y1'), line1),
      c2 = makeCircle(2, "a2", line1.get('x2'), line1.get('y2'), line1),
      c3 = makeCircle(1, "b1", line2.get('x1'), line2.get('y1'), line2),
      c4 = makeCircle(2, "b2", line2.get('x2'), line2.get('y2'), line2),
      c5 = makeCircle(1, "c1", line3.get('x1'), line3.get('y1'), line3),
      c6 = makeCircle(2, "c2", line3.get('x2'), line3.get('y2'), line3)

    c1.opp = c2; c2.opp = c1; c3.opp = c4; c4.opp = c3; c5.opp = c6; c6.opp = c5;

    mCircle1 = craeteAngleCircle("myAngle1")
    mCircle2 = craeteAngleCircle("myAngle2")

    label1 = createLabel("init 1")
    label2 = createLabel("init 2")
  }

  function disableHandles(myObj) {
    // myObj.hasControls = myObj.selectable = myObj.evented = myObj.hasBorders = false;
    myObj.hasControls = myObj.selectable = myObj.hasBorders = false;


  }
  function init() {
    canvas.add(line1, line2, line3);
    canvas.add(c1, c2, c3, c4, c5, c6);

    disableHandles(mCircle1)
    disableHandles(mCircle2)

    disableHandles(label1)
    disableHandles(label2)

    // add all
    canvas.add(mCircle1);
    canvas.add(mCircle2);
    canvas.add(label1);
    canvas.add(label2);


    //angles
    updateAngle(line1, line2, mCircle1, "myAngle1", "pppp")
    updateAngle(line3, line2, mCircle2, "myAngle2", "pppp")

    //labels
    updateLabel(label1, mCircle1, globalObj.myAngle1, "from move")
    updateLabel(label2, mCircle2, globalObj.myAngle2, "from move")


  }

  createAll()
  init()

})();
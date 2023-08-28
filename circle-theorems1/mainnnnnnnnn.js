import './style.css'
import { fabric } from 'fabric'

var canvas = new fabric.Canvas('canvas', {
  width: window.innerWidth,
  height: window.innerHeight
});
var globalObj = {
  myAngle1: 0,
  myAngle2: 0
}
var mouseDown = false;
var circle;
var line1;
var line2;
var line3;
var line4;
var pointer1;
var pointer2;
var pointer3;
var pointer4;
var mCircle1;
var mCircle2 ;

circle = new fabric.Circle({
  id: "main-circle",
  radius: 300,
  fill: '',
  stroke: '#000000',
  strokeWidth: 5,
  top: 500,
  left: 500,
  originX: 'center',
  originY: 'center',
  selectable: false,
  hasControls: false,

})
canvas.add(circle);
line1 = createLineOnCanvas(circle.left-circle.radius, circle.top, circle.left, circle.top, "line1")
line2 = createLineOnCanvas(circle.left, circle.top, circle.left+circle.radius, circle.top, "line2")
line3 = createLineOnCanvas(circle.left, circle.top-circle.radius, circle.left+circle.radius, circle.top, "line3")
line4 = createLineOnCanvas(circle.left-circle.radius, circle.top, circle.left, circle.top-circle.radius, "line4")
canvas.add(line1, line2, line3, line4);

console.log(line2)
pointer1 = createPointerOnCanvas(line1.x2, line1.y2, "#454298"  , "pointer1", false);
pointer2 = createPointerOnCanvas(line2.x2, line2.y2  , "#d31245", "pointer2" ,true);
pointer3 = createPointerOnCanvas(circle.left, circle.top-circle.radius  , "#d31245", "pointer3", true);
pointer4 = createPointerOnCanvas(line1.x1, line1.y1 , "#d31245", "pointer4" ,true);
canvas.add(pointer1, pointer2, pointer3, pointer4 );

mCircle1 = craeteAngleCircle("myAngle1")
mCircle2 = craeteAngleCircle("myAngle2")

    disableHandles(mCircle1)
    disableHandles(mCircle2)
    canvas.add(mCircle1,mCircle2)

canvas.on({
  "mouse:down": activateActionOfPointer,
  "mouse:move": startRotationOfPOinter,
  "mouse:up": stopRotationOfPOinter,

})




function activateActionOfPointer(o){
  var obj = o.target;
  mouseDown = true;
  if(obj == null){
    return;
  }else if( obj.id == "pointer2" || obj.id == "pointer3" || obj.id == "pointer4"){
    console.log(obj);
  }
}

function startRotationOfPOinter(o){
 var obj = o.target;
if(mouseDown == true){
  var pos = updatePointerPosition(o);
  if(obj == null){
    return;
  }else if(obj.id == "pointer2" || obj.id == "pointer3" || obj.id == "pointer4"){
    
    if(obj.id == "pointer2"){
      pointer2.set({
        top: pos.top,
        left: pos.left
      })
      line2.set({
        x2:pos.left,
        y2 : pos.top
      })
      line3.set({
        x2:pos.left,
        y2 : pos.top
      })

    } else if(obj.id == "pointer3"){
      pointer3.set({
        top: pos.top,
        left: pos.left
      })

      line3.set({
        x1:pos.left,
        y1 : pos.top
      })
      line4.set({
        x2:pos.left,
        y2 : pos.top
      })
    }else if(obj.id == "pointer4"){
      pointer4.set({
        top: pos.top,
        left: pos.left
      })

      line1.set({
        x1:pos.left,
        y1 : pos.top
      })
      line4.set({
        x1:pos.left,
        y1 : pos.top
      })
    }

  }
  line1.setCoords();
  line2.setCoords();
  line3.setCoords();
  line4.setCoords();
  obj.setCoords();
}

canvas.requestRenderAll();
}

function stopRotationOfPOinter(o){
var  obj = o.target;

  if(obj == null){
    return;
  }else if(obj.id == "pointer2" || obj.id == "pointer3" || obj.id == "pointer4"){
    console.log(obj);
  }

  mouseDown= false;
}









function createLineOnCanvas(x1, y1, x2, y2, id) {
  return new fabric.Line([x1, y1, x2, y2], {
    id: id,
    stroke: 'black',
    strokeWidth: 3,
    selectable: false,
    hasControls: false
  })
}

function createPointerOnCanvas(left, top,color, id, selectable) {
  return new fabric.Circle({
    id: id,
    radius: 7,
    fill: color,
    top: top,
    left: left,
    originX: 'center',
    originY: 'center',
    hasBorders: false,
    hasControls: false,
    selectable: selectable
  });

}


function updatePointerPosition(o) {
  // console.log("updatePointerPosition--->",o)
  var pointer = o.e;

  var deltaLeft = pointer.x - circle.left;
  var deltaTop = pointer.y - circle.top;

  var length = Math.sqrt(deltaLeft * deltaLeft + deltaTop * deltaTop);
  console.log("length--->", length)

  var radians = Math.atan2(deltaTop, deltaLeft)

  var ang = radians * 180 / Math.PI;
  length = circle.radius;

  var left = Math.cos(radians) * length + circle.left;
  var top = Math.sin(radians) * length + circle.top;


  var obj = {
    left: left,
    top: top,
    ang: ang
  }
  return obj;
}
updateAngle(line1, line2, mCircle1, "myAngle1", "pppp")
updateAngle(line3, line4, mCircle2, "myAngle2", "pppp")

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
function disableHandles(myObj) {
  // myObj.hasControls = myObj.selectable = myObj.evented = myObj.hasBorders = false;
  myObj.hasControls = myObj.selectable = myObj.hasBorders = false;


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

function getAngle(origin, pt) {
  let delta = pt.sub(origin);
  let angle = Math.atan2(delta.y, delta.x);
  return angle;
}

function calculateIntersection(p1, p2, p3, p4) {

  var c2x = p3.x - p4.x; // (x3 - x4)
  var c3x = p1.x - p2.x; // (x1 - x2)
  var c2y = p3.y - p4.y; // (y3 - y4)
  var c3y = p1.y - p2.y; // (y1 - y2)

  // down part of intersection point formula
  var d = c3x * c2y - c3y * c2x;

  if (d == 0) {
      throw new Error('Number of intersection points is zero or infinity.');
  }

  // upper part of intersection point formula
  var u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
  var u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)

  // intersection point formula

  var px = (u1 * c2x - c3x * u4) / d;
  var py = (u1 * c2y - c3y * u4) / d;

  var p = { x: px, y: py };

  return p;
}



// const updateRadiusOfCircle = (obj) =>{
  
//   var obj = parseInt(obj)
//   circle.set({
//     radius:obj
//   })

//   line1.set({
//     x1:circle.left-obj
//   })
//   line2.set({
//     x2:circle.left + obj
//   })
//   line3.set({
//     y1:circle.top-obj,
//     x2:circle.left + obj
//   })
//   line4.set({
//     x1:circle.left-obj,
//     y2:circle.top-obj,
//   })
//   line1.setCoords();
//   line2.setCoords();
//   line3.setCoords();
//   line4.setCoords();
//   circle.setCoords();
// canvas.requestRenderAll();
// }
// window.updateRadiusOfCircle = updateRadiusOfCircle;
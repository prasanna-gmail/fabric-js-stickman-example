import './style.css'
import { fabric } from 'fabric'

var canvas = new fabric.Canvas('canvas', {
  width: window.innerWidth,
  height: window.innerHeight
});
var globalData = {
  angleBetweenL1AndL2:180,
  angleBetweenL3AndL4:90,
}

var angleLine1AndLine2 = document.getElementById("angleLine1AndLine2")
var angleLine3AndLine4 = document.getElementById("angleLine3AndLine4")
var mouseDown = false;
var circle;
var line1;
var line2;
var line3;
var line4;
var circleArc1;
var circleArc2;
var pointer1;
var pointer2;
var pointer3;
var pointer4;


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

circleArc1 = new fabric.Circle({
  radius: 20,
  left: circle.left-20,
  top: circle.top-20,
  startAngle: 0,
  endAngle: 180,
  stroke: '#000',
  strokeWidth: 1,
  fill: 'green',
  hasBorders: false,
  hasControls: false,
  selectable: false
});



circleArc2 = new fabric.Circle({
  radius: 22,
  left: circle.left,
  top: circle.top-circle.radius,
  angle:45,
  startAngle: 0,
  endAngle: 90,
  stroke: '#000',
  strokeWidth: 1,
  fill: 'red',
  hasBorders: false,
  hasControls: false,
  originX:'center',
  originY:'center',
  selectable: false
});

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
canvas.add(circleArc1,circleArc2)
canvas.add(pointer1, pointer2, pointer3, pointer4 );


calculateAngleBetweenTwoLine(line3,line4,"L3-L4");
 calculateAngleBetweenTwoLine(line1,line2,"L1-L2");
 angleLine1AndLine2.style.top = circle.top+30;
 angleLine1AndLine2.style.left = circle.left+30;
 angleLine1AndLine2.innerHTML = globalData.angleBetweenL1AndL2+"\u00B0";
 angleLine3AndLine4.innerHTML = globalData.angleBetweenL3AndL4+"\u00B0";

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

      circleArc1.set({
        startAngle:pos.ang
      })
      // circleArc2.set({
      //   endAngle:pos.ang
      // })
      circleArc1.setCoords();
      line2.setCoords();
     line3.setCoords();
      calculateAngleBetweenTwoLine(line3,line4,"L3-L4");
      calculateAngleBetweenTwoLine(line1,line2,"L1-L2");
      circleArc2.set({
        startAngle:(globalData.angleBetweenL3AndL4)+45,
      })
      circleArc2.setCoords();
      
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
        y2 : pos.top,
      })
      
      line3.setCoords();
      line4.setCoords();
      calculateAngleBetweenTwoLine(line3,line4,"L3-L4");
      circleArc2.set({
        top: pos.top,
        left: pos.left,
        endAngle:globalData.angleBetweenL3AndL4
      })
      circleArc2.setCoords();
      angleLine3AndLine4.style.top = (pos.top +20)+"px";
      angleLine3AndLine4.style.left = (pos.left-20)+"px";
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

      circleArc1.set({
        endAngle:pos.ang
      })
      circleArc1.setCoords();
      line1.setCoords();
      line4.setCoords();
      calculateAngleBetweenTwoLine(line3,line4,"L3-L4");
      calculateAngleBetweenTwoLine(line1,line2,"L1-L2");
      circleArc2.set({
        endAngle:(globalData.angleBetweenL3AndL4)+45
      })
      circleArc2.setCoords();
    }

  }
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

function calculateAngleBetweenTwoLine(l1 , l2 , callee){
  var slopOfLine1 = (l1.y2 - l1.y1) / (l1.x2 - l1.x1); 
  var slopOfLine2 = (l2.y2 - l2.y1) / (l2.x2 - l2.x1); 

  var tangentOfBothLine = (slopOfLine2 - slopOfLine1)/(1 + slopOfLine1 * slopOfLine2) 

  var angleBetweenLine1 =  Math.atan(tangentOfBothLine)*180/Math.PI;
  var angleBetweenLine = angleBetweenLine1.toFixed();
  console.log(angleBetweenLine)
 var actualAngle = 360 - (180 + parseInt(angleBetweenLine));

 if(callee == 'L3-L4'){
  // console.log("angleBetweenLine---"+callee+"---------->", angleBetweenLine+"\u00B0" )
//  return angleBetweenLine;
globalData.angleBetweenL3AndL4 = Math.abs(angleBetweenLine);
angleLine3AndLine4.innerHTML = globalData.angleBetweenL3AndL4+"\u00B0";
 }
 else if(callee == 'L1-L2'){
  // console.log("actual angle- trunc--"+callee+"---------->",actualAngle+"\u00B0" )
  // return actualAngle;
  globalData.angleBetweenL1AndL2 = actualAngle;
  angleLine1AndLine2.innerHTML = globalData.angleBetweenL1AndL2+"\u00B0";
 }
  
  
}

function createAngleArc (left , top , angle , startAngle , endAngle , color , id){
  new fabric.Circle({
    id : id,
    radius: 22,
    left: left,
    top: top,
    angle:angle,
    startAngle: startAngle,
    endAngle: endAngle,
    stroke: '#000',
    strokeWidth: 1,
    fill: color,
    hasBorders: false,
    hasControls: false,
    originX:'center',
    originY:'center',
    selectable: false
  });
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
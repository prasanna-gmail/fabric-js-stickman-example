

// var canvas = new fabric.Canvas('canvas', {
//   width: window.innerWidth,
//   height: window.innerHeight
// });
  var canvas = this.__canvas = new fabric.Canvas('canvas', { selection: false });
     fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

var globalData = {
  top:350,
  left:350,
  angleA : 0,
  angleB : 0,
  angleC : 0,
  angleD : 0,
}
var mouseDown = false;
var circle;
var centrePointCircle;
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

var angleAcontainer = document.getElementById("angle-a");
var angleBcontainer = document.getElementById("angle-b");
var angleCcontainer = document.getElementById("angle-c");
var angleDcontainer = document.getElementById("angle-d");


init();
function init(){
  draw();




  canvas.on({
    "mouse:down" : selectPointerToMove,
    "mouse:move" : startMovingSelectedPointer,
    "mouse:up" : stopmovingAndRemoveSelectionOfPointer
  })



  function selectPointerToMove(o){
    var obj = o.target;
    mouseDown = true;
    if(obj == null){
      return ;
    }else if( obj.id == "pointer1" || obj.id == "pointer2" || obj.id == "pointer3" || obj.id == "pointer4"){
      console.log(obj);
    }
  }
  function startMovingSelectedPointer(o){
    var obj = o.target;
    var pointer = o.pointer;
    var x = pointer.x;
    var y = pointer.y;
    if(mouseDown){
      var pos = updatePointerPosition(x,y);
      if(obj == null){
        return ;
      }else if( obj.id == "pointer1" || obj.id == "pointer2" || obj.id == "pointer3" || obj.id == "pointer4"){
        console.log(obj);
        if(obj.id == "pointer1"){

          pointer1.set({
            left: pos.left,
            top : pos.top
          })
          pointer1.setCoords();
          line1.set({
            x1: pointer1.left,
            y1 : pointer1.top
          })
          line1.setCoords();
          line4.set({
            x2: pointer1.left,
            y2 : pointer1.top
          })
          line4.setCoords();


          var udatedAngleA = calculateAngleBetweenTwoLine(line1 , line4, "L1-L4");
          var udatedAngleB = calculateAngleBetweenTwoLine(line1 , line2, "L1-L2");
          var udatedAngleD = calculateAngleBetweenTwoLine(line3 , line4, "L3-L4");
          globalData.angleA = udatedAngleA; globalData.angleB = udatedAngleB; globalData.angleD = udatedAngleD;
          console.log("udatedAngleA--->",udatedAngleA , "udatedAngleB--->",udatedAngleB , "udatedAngleD---->",udatedAngleD)
          if(pos.top < circle.top){
            var angleB = 180-udatedAngleB
            angleBcontainer.innerHTML = angleB;
            angleDcontainer.innerHTML = 180-angleB;
          }else if(pos.top > circle.top){
            var angleD = 180-udatedAngleB
            angleDcontainer.innerHTML = angleD;
            angleBcontainer.innerHTML = 180-angleD;
          }
         angleAcontainer.innerHTML = udatedAngleA; 
         //angleBcontainer.innerHTML = udatedAngleB; angleDcontainer.innerHTML = udatedAngleD; 
         angleAcontainer.style.top = (pos.top)+"px";
         angleAcontainer.style.left = (pos.left)+"px";

          
        }
        
        
        else if(obj.id == "pointer2"){
          pointer2.set({
            left: pos.left,
            top : pos.top
          })
          pointer2.setCoords();
          line1.set({
            x2: pointer2.left,
            y2 : pointer2.top
          })
          line1.setCoords();
          line2.set({
            x1: pointer2.left,
            y1 : pointer2.top
          })
          line2.setCoords();

          var udatedAngleA = calculateAngleBetweenTwoLine(line1 , line4, "L1-L4");
          var udatedAngleB = calculateAngleBetweenTwoLine(line1 , line2, "L1-L2");
          var udatedAngleC = calculateAngleBetweenTwoLine(line2 , line3, "L2-L3");
          globalData.angleA = udatedAngleA; globalData.angleB = udatedAngleB; globalData.angleC = udatedAngleC;
          console.log("udatedAngleA--->",udatedAngleA , "udatedAngleB--->",udatedAngleB , "udatedAngleC---->",udatedAngleC)
          if(pos.left < circle.left){
            var angleA = 180-udatedAngleA;
            angleAcontainer.innerHTML = angleA;
            angleCcontainer.innerHTML = 180-angleA; 
          }else if(pos.left > circle.left){
            var angleC = 180 - udatedAngleC;
            angleCcontainer.innerHTML = angleC; 
            angleAcontainer.innerHTML = 180-angleC; 
          }

        //  angleAcontainer.innerHTML = udatedAngleA;
          angleBcontainer.innerHTML = udatedAngleB;
          //  angleCcontainer.innerHTML = udatedAngleC; 
         angleBcontainer.style.top = (pos.top)+"px";
         angleBcontainer.style.left = (pos.left)+"px";
        } 
        
        
        else if(obj.id == "pointer3"){

          pointer3.set({
            left: pos.left,
            top : pos.top
          })
          pointer3.setCoords();
          line2.set({
            x2: pointer3.left,
            y2 : pointer3.top
          })
          line2.setCoords();
          line3.set({
            x1: pointer3.left,
            y1 : pointer3.top
          })
          line3.setCoords();


          var udatedAngleB = calculateAngleBetweenTwoLine(line1 , line2, "L1-L2");
          var udatedAngleD = calculateAngleBetweenTwoLine(line3 , line4, "L1-L4");
          var udatedAngleC = calculateAngleBetweenTwoLine(line2 , line3, "L2-L3");
          globalData.angleD = udatedAngleD; globalData.angleB = udatedAngleB; globalData.angleC = udatedAngleC;
          console.log("udatedAngleA--->",udatedAngleA , "udatedAngleB--->",udatedAngleB , "udatedAngleC---->",udatedAngleC)

          if(pos.top < circle.top){
            var angleB = 180-udatedAngleB
            angleBcontainer.innerHTML = angleB;
            angleDcontainer.innerHTML = 180-angleB;
          }else if(pos.top > circle.top){
            var angleD = 180-udatedAngleB
            angleDcontainer.innerHTML = angleD;
            angleBcontainer.innerHTML = 180-angleD;
          }

        //  angleDcontainer.innerHTML = udatedAngleD; angleBcontainer.innerHTML = udatedAngleB; 
         angleCcontainer.innerHTML = udatedAngleC; 
         angleCcontainer.style.top = (pos.top)+"px";
         angleCcontainer.style.left = (pos.left)+"px";


        }
        
        
        
        else if(obj.id == "pointer4"){
          pointer4.set({
            left: pos.left,
            top : pos.top
          })
          pointer4.setCoords();

          line4.set({
            x1: pointer4.left,
            y1 : pointer4.top
          })
          line4.setCoords();
          line3.set({
            x2: pointer4.left,
            y2 : pointer4.top
          })
          line3.setCoords();

          var udatedAngleA = calculateAngleBetweenTwoLine(line1 , line4, "L1-L2");
          var udatedAngleC = calculateAngleBetweenTwoLine(line2 , line3, "L2-L3");
          var udatedAngleD = calculateAngleBetweenTwoLine(line3 , line4, "L1-L4");
           globalData.angleA = udatedAngleA; globalData.angleC = udatedAngleC; globalData.angleD = udatedAngleD;
          console.log("udatedAngleA--->",udatedAngleA , "udatedAngleB--->",udatedAngleB , "udatedAngleC---->",udatedAngleC)

          if(pos.left < circle.left){
            var angleA = 180-udatedAngleA;
            angleAcontainer.innerHTML = angleA;
            angleCcontainer.innerHTML = 180-angleA; 
          }else if(pos.left > circle.left){
            var angleC = 180 - udatedAngleC;
            angleCcontainer.innerHTML = angleC; 
            angleAcontainer.innerHTML = 180-angleC; 
          }

          // angleAcontainer.innerHTML = udatedAngleA; angleCcontainer.innerHTML = udatedAngleC; 
          angleDcontainer.innerHTML = udatedAngleD;
         angleDcontainer.style.top = (pos.top)+"px";
         angleDcontainer.style.left = (pos.left)+"px";


        }
      }

    }
    
  }

  function stopmovingAndRemoveSelectionOfPointer(o){
    var obj = o.target;

    if(obj == null){
      mouseDown = false;
      return ;
    }else if( obj.id == "pointer1" || obj.id == "pointer2" || obj.id == "pointer3" || obj.id == "pointer4"){
      console.log(obj);
    }
    mouseDown = false;
  }

}

function draw(){
centrePointCircle = createCircleOnCanvas(globalData.left , globalData.top , 2 , "black", "black" , false, "centre-point");
circle = createCircleOnCanvas(centrePointCircle.left , centrePointCircle.top , 300 , "", "black" , false, "main-circle");
pointer1 = createCircleOnCanvas(circle.left - circle.radius , circle.top , 12 , "red" ,"red" ,true, "pointer1");
pointer2 = createCircleOnCanvas(circle.left , circle.top - circle.radius , 12 , "red" , "red" ,true, "pointer2");
pointer3 = createCircleOnCanvas(circle.left + circle.radius , circle.top , 12 , "red" , "red" , true,"pointer3");
pointer4 = createCircleOnCanvas(circle.left , circle.top + circle.radius , 12 , "red" , "red" , true, "pointer4");



line1 = createLineOnCanvas(pointer1.left , pointer1.top , pointer2.left , pointer2.top , "black" , "line1");
line2 = createLineOnCanvas( pointer2.left , pointer2.top ,pointer3.left , pointer3.top , "black" , "line2");
line3 = createLineOnCanvas( pointer3.left , pointer3.top ,pointer4.left , pointer4.top , "black" , "line3");
line4 = createLineOnCanvas( pointer4.left , pointer4.top , pointer1.left , pointer1.top , "black" , "line4");

canvas.add(centrePointCircle, circle  ,line1 , line2, line3 , line4, pointer1, pointer2 ,pointer3 , pointer4);


var angleA = calculateAngleBetweenTwoLine(line1 , line4, "L1-L2");
var angleB = calculateAngleBetweenTwoLine(line1 , line2, "L2-L3");
var angleC = calculateAngleBetweenTwoLine(line2 , line3, "L3-L4");
var angleD = calculateAngleBetweenTwoLine(line3 , line4, "L4-L1");
globalData.angleA = angleA; globalData.angleB = angleB ; globalData.angleC = angleC ; globalData.angleD = angleD;
console.log("angleA--->",angleA , " angleB--->",angleB );
console.log( "angleC---->",angleC , " angleD---->",angleD)

angleAcontainer.innerHTML = globalData.angleA;
angleBcontainer.innerHTML = globalData.angleB;
angleCcontainer.innerHTML = globalData.angleC;
angleDcontainer.innerHTML = globalData.angleD;

angleAcontainer.style.top = pointer1.top+"px";
angleAcontainer.style.left = pointer1.left+"px";
angleBcontainer.style.top = pointer2.top+"px";
angleBcontainer.style.left = pointer2.left+"px";
angleCcontainer.style.top = pointer3.top+"px";
angleCcontainer.style.left = pointer3.left+"px";
angleDcontainer.style.top = pointer4.top+"px";
angleDcontainer.style.left = pointer4.left+"px";
}

function updatePointerPosition(x , y) {
  // console.log("updatePointerPosition--->",o)
  

  var deltaLeft = x - circle.left;
  var deltaTop = y - circle.top;

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


function createCircleOnCanvas(left , top , radius , color , stroke, selectable , id){
return new fabric.Circle({
  id: id,
  radius: radius,
  fill: color,
  stroke: stroke,
  strokeWidth: 5,
  top: top,
  left: left,
  originX: 'center',
  originY: 'center',
  selectable: selectable,
  hasControls: false,

})
}

function createLineOnCanvas( x1 , y1, x2, y2 , color , id){
  return new fabric.Line([x1, y1, x2, y2], {
    id: id,
    stroke: color,
    strokeWidth: 3,
    selectable: false,
    hasControls: false
  })
}

function calculateAngleBetweenTwoLine(l1 , l2 , callee){
  console.warn("l1-x1==>",l1.x1, " l1-y1==>",l1.y1);
  console.warn("l1-x2==>",l1.x2, " l1-y2==>",l1.y2);
  console.warn("l2-x1==>",l2.x1, " l2-y1==>",l2.y1);
  console.warn("l2-x2==>",l2.x2, " l2-y2==>",l2.y2);
  var slopOfLine1 = (l1.y2 - l1.y1) / (l1.x2 - l1.x1); 
  var slopOfLine2 = (l2.y2 - l2.y1) / (l2.x2 - l2.x1); 
  var actualAngle ;
  var tangentOfBothLine = (slopOfLine2 - slopOfLine1)/(1 + slopOfLine1 * slopOfLine2) 

  var angleBetweenLine1 =  Math.atan(tangentOfBothLine)*180/Math.PI;
  var angleBetweenLine2 = angleBetweenLine1.toFixed();
  var angleBetweenLine = parseInt(angleBetweenLine2);
  console.log(angleBetweenLine)
 

  console.log("type of angleBetweenLine--->",typeof(angleBetweenLine))


// globalData.angleBetweenL3AndL4 = Math.abs(angleBetweenLine);
// angleLine3AndLine4.innerHTML = globalData.angleBetweenL3AndL4+"\u00B0";
 
  var returnAngleBetweenLine = Math.abs(angleBetweenLine)
  return returnAngleBetweenLine;
}


const updateRadiusOfCircle = (obj) =>{
  var pointer1pos = updatePointerPosition(pointer1.left , pointer1.top);
  var pointer2pos = updatePointerPosition(pointer2.left , pointer2.top);
  var pointer3pos = updatePointerPosition(pointer3.left , pointer3.top);
  var pointer4pos = updatePointerPosition(pointer4.left , pointer4.top);

  console.warn("pointer 3 pos====>",pointer3pos )
  // console.log(pos)
  var obj = parseInt(obj)
  circle.set({
    radius:obj
  })

  line1.set({
    x1:pointer1pos.left,
    y1:pointer1pos.top,
    x2:pointer2pos.left,
    y2:pointer2pos.top,
  })
  line2.set({
    x1:pointer2pos.left,
    y1:pointer2pos.top,
    x2:pointer3pos.left,
    y2:pointer3pos.top
  })
  line3.set({
    y1:pointer3pos.top,
    x1:pointer3pos.left,
    x2:pointer4pos.left,
    y2:pointer4pos.top
  })
  line4.set({
    x1:pointer4pos.left,
    y1:pointer4pos.top,
    x2:pointer1pos.left,
    y2:pointer1pos.top,
  })

  pointer1.set({
    top: pointer1pos.top,
    left : pointer1pos.left,
    radius: obj/60
  })
  pointer2.set({
    top: pointer2pos.top,
    left : pointer2pos.left,
    radius: obj/60
  })
  pointer3.set({
    top: pointer3pos.top,
    left : pointer3pos.left,
    radius: obj/60
  })
  pointer4.set({
    top: pointer4pos.top,
    left : pointer4pos.left,
    radius: obj/60
  })

  pointer1.setCoords();
  pointer2.setCoords();
  pointer3.setCoords();
  pointer4.setCoords();
  line1.setCoords();
  line2.setCoords();
  line3.setCoords();
  line4.setCoords();
  circle.setCoords();
canvas.requestRenderAll();
angleAcontainer.style.top = pointer1.top+"px";
angleAcontainer.style.left = pointer1.left+"px";
angleBcontainer.style.top = pointer2.top+"px";
angleBcontainer.style.left = pointer2.left+"px";
angleCcontainer.style.top = pointer3.top+"px";
angleCcontainer.style.left = pointer3.left+"px";
angleDcontainer.style.top = pointer4.top+"px";
angleDcontainer.style.left = pointer4.left+"px";
}
window.updateRadiusOfCircle = updateRadiusOfCircle;


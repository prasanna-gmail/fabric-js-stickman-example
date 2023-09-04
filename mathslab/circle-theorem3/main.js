

// var canvas = new fabric.Canvas('canvas', {
//   width: window.innerWidth,
//   height: window.innerHeight
// });
var canvas = this.__canvas = new fabric.Canvas('canvas', { selection: false });
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';


var globalData = {
  top:350,
  left:350,
}

var mouseDown = false;
var centrePointCircle;
var circle;
var pointer1;
var pointer2;
var pointer3;
var line1;
var line2;
var line3;
var tangent;
var angleAContainer = document.getElementById("angle-a");

init();
function init(){
  drawCanvas();
  var angleA = calculateAngleBetweenTwoLine(line1 , line2 , "L1-L2")
  angleAContainer.innerHTML = angleA;
  // var angletangent = calculateAngleBetweenTwoLine(line3 , tangent , "L3-tangent")
  // console.warn("angle Between pointer3 and tangent----->",angletangent)
 
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
    }else if( obj.id == "pointer1" || obj.id == "pointer2" || obj.id == "pointer3" ){
      console.log(obj);
    }
  }

  function startMovingSelectedPointer(o){
    var obj  = o.target;
    var pointer = o.pointer;
    var x = pointer.x;
    var y = pointer.y;
    if(mouseDown == true){
      var pos = updatePointerPosition(x , y)
      if(obj == null){
        return ;
      }else if( obj.id == "pointer1" || obj.id == "pointer2" || obj.id == "pointer3" ){
        console.warn(obj.id , " hello ",  pos);
        if(obj.id == "pointer1"){
         
          pointer1.set({
            left : pos.left,
            top: pos.top,
          })
          pointer1.setCoords();

          line1.set({
            x1 : pointer1.left,
            y1: pointer1.top
          })
          line1.setCoords();
          line2.set({
            x1 : pointer1.left,
            y1: pointer1.top
          })
          line1.setCoords();
          var updatedAngleA = calculateAngleBetweenTwoLine(line1 , line2 , "L1-L2-onCanvasMoveEvent");
          angleAContainer.innerHTML = updatedAngleA;
          angleAContainer.style.top = (pointer1.top - 30)+"px" ;
          angleAContainer.style.left =( pointer1.left + 20)+"px" ;
        }
        else if(obj.id == "pointer2"){
          pointer2.set({
            left : pos.left,
            top : pos.top,
          })
          pointer2.setCoords();
          line2.set({
            x2 : pointer2.left,
            y2 : pointer2.top
          })
          line2.setCoords();
          line3.set({
            x1 : pointer2.left,
            y1 : pointer2.top
          })
          line3.setCoords();
          var updatedAngleA = calculateAngleBetweenTwoLine(line1 , line2 , "L1-L2-onCanvasMoveEvent");
          angleAContainer.innerHTML = updatedAngleA;
          angleAContainer.style.top = (pointer1.top - 30)+"px" ;
          angleAContainer.style.left =( pointer1.left + 20)+"px" ;
        }
        else if(obj.id == "pointer3"){
          console.warn("pointer3 selected")
          pointer3.set({
            left : pos.left,
            top : pos.top,
          })
          pointer3.setCoords();
          line1.set({
            x2 : pointer3.left,
            y2 : pointer3.top
          })
          line1.setCoords();
          line3.set({
            x2 : pointer3.left,
            y2 : pointer3.top
          })
          line3.setCoords();
          var updatedAngleA = calculateAngleBetweenTwoLine(line1 , line2 , "L1-L2-onCanvasMoveEvent");
          angleAContainer.innerHTML = updatedAngleA;
          angleAContainer.style.top = (pointer1.top - 30)+"px" ;
          angleAContainer.style.left =( pointer1.left + 20)+"px" ;
        }
      }
    }
  }

  function stopmovingAndRemoveSelectionOfPointer(o){
    var obj = o.target;
    if(obj == null){
      mouseDown = false;
      return ;
    }else if( obj.id == "pointer1" || obj.id == "pointer2" || obj.id == "pointer3" ){
      console.log(obj);
    }
    mouseDown = false;
  }
}

function drawCanvas(){

centrePointCircle = createCircleOnCanvas(globalData.left , globalData.top , 2 , "black", "black" , false, "centre-point");
circle = createCircleOnCanvas(centrePointCircle.left , centrePointCircle.top , 300 , "", "black" , false, "main-circle");

pointer1 = createCircleOnCanvas(circle.left-circle.radius , circle.top , 12, "red" , "red" , true , "pointer1");
// pointer2 = createCircleOnCanvas(circle.left , circle.top-circle.radius  , 5, "red" , "red" , true , "pointer2");
pointer2 = createCircleOnCanvas(492 , 85  , 12, "red" , "red" , true , "pointer2");
// pointer3 = createCircleOnCanvas(circle.left+circle.radius , circle.top  , 5, "red" , "red" , true , "pointer3");
pointer3 = createCircleOnCanvas(557 , 568  , 12, "red" , "red" , true , "pointer3");

line1 = createLineOnCanvas(pointer1.left , pointer1.top , pointer3.left , pointer3.top , "black" , "line1");
line2 = createLineOnCanvas(pointer1.left , pointer1.top , pointer2.left , pointer2.top  , "black" , "line1");
line3 = createLineOnCanvas(pointer2.left , pointer2.top , pointer3.left , pointer3.top, "black" , "line1");
// tangent = createTangentOnCanvas();

canvas.add(centrePointCircle,circle, line1, line2, line3,pointer1,pointer2,pointer3);
angleAContainer.style.top = (pointer1.top )+"px" ;
angleAContainer.style.left =( pointer1.left)+"px" ;

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

  function createTangentOnCanvas(){
    return new fabric.Line([pointer3.left, pointer3.top , pointer3.left+500, pointer3.top],{
      id:"tangent",
      stroke: "blue",
      angle : -45,
      strokeWidth : 3,
      selectable :false,
      hasControls : false
    })
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


  const updateRadiusOfCircle = (obj) =>{
    var pointer1pos = updatePointerPosition(pointer1.left , pointer1.top);
    var pointer2pos = updatePointerPosition(pointer2.left , pointer2.top);
    var pointer3pos = updatePointerPosition(pointer3.left , pointer3.top);
  
    console.warn("pointer 3 pos====>",pointer3pos )
    // console.log(pos)
    var obj = parseInt(obj)
    circle.set({
      radius:obj
    })
  
    line1.set({
      x1:pointer1pos.left,
      y1:pointer1pos.top,
      x2:pointer3pos.left,
      y2:pointer3pos.top,
    })
    line2.set({
      x1:pointer1pos.left,
      y1:pointer1pos.top,
      x2:pointer2pos.left,
      y2:pointer2pos.top
    })
    line3.set({
      y1:pointer2pos.top,
      x1:pointer2pos.left,
      x2:pointer3pos.left,
      y2:pointer3pos.top
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
   
  
    pointer1.setCoords();
    pointer2.setCoords();
    pointer3.setCoords();
    line1.setCoords();
    line2.setCoords();
    line3.setCoords();
    circle.setCoords();
  canvas.requestRenderAll();
  angleAContainer.style.top = (pointer1.top )+"px" ;
angleAContainer.style.left =( pointer1.left)+"px" ;
  }
  window.updateRadiusOfCircle = updateRadiusOfCircle;

  function calculateAngleBetweenTwoLine(l1 , l2 , callee){
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


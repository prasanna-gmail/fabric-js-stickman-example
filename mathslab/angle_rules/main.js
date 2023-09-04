var canvas = this.__canvas = new fabric.Canvas('canvas', { selection: false });

var globalData = {
    top:400,
    left:400,
    currentAngle : 0
}

var lineArr = [];
var pointerArr = [];

var mouseDown = false;
var centerPoint,line1,line2,line3,pointer1,pointer2,pointer3;



function addEventListenerOnCanvas(){
    console.log("event Linstner")
    canvas.on({
        "mouse:down":activatePointerForAction,
        "mouse:move":startPointerAction,
        "mouse:up": stopPointerAction
    })


    function activatePointerForAction(o){
        console.log(o)
        var obj  = o.target;
        var pointer = o.pointer;
        var x = pointer.x;
        var y = pointer.y;
        mouseDown = true;
            if(obj == null){
                return ;
              }else if( obj.id == "pointer1" || obj.id == "pointer2" || obj.id == "pointer3" ){
                // console.log(obj);
              }



    }
    function startPointerAction(o){
        if(mouseDown == true){
            console.log(o)
        }
        

    }
    function stopPointerAction(o){
        mouseDown = false;
        console.log(o)

    }
}



function draw(){
    centerPoint = createCircleOnCanvas(globalData.left ,globalData.top, 2 , "black" , "" , false , "center-point")
    line1 = createLineOnCanvas(centerPoint.left - (centerPoint.left/2) , centerPoint.top , centerPoint.left , centerPoint.top , "red" , "line1");
    line2 = createLineOnCanvas( centerPoint.left , centerPoint.top ,centerPoint.left + (centerPoint.left/2) , centerPoint.top , "red" , "line2");
    line3 = createLineOnCanvas( centerPoint.left , centerPoint.top , centerPoint.left +1 ,centerPoint.top - (centerPoint.top/2)  , "blue" , "line3");
    pointer1 = createCircleOnCanvas(line1.x1 , line1.y1 , 15 , "green" , "" , true , "pointer1");
    pointer2 = createCircleOnCanvas(line2.x2 , line2.y2 , 15 , "green" , "" , true , "pointer2");
    pointer3 = createCircleOnCanvas(line3.x2 , line3.y2 , 15 , "red" , "" , true , "pointer3");
    canvas.add(centerPoint , line1 , line2 ,line3, pointer1 , pointer2, pointer3);
    lineArr.push(line1 , line2 , line3);
    pointerArr.push(pointer1 , pointer2,pointer3);
    console.log(lineArr)
    console.log(pointerArr)
}



function addLineAndPointerOnCanvas(){
    var colorOfLine = randomColor();
    var colorOfPointer = randomColor();
    var newTempLine = createLineOnCanvas(centerPoint.left , centerPoint.top , centerPoint.left , centerPoint.top - (centerPoint.top/2)    , `#${colorOfLine}` , "tempLine")
    newTempLine.set({
        angle : globalData.angle/2
    })
    newTempLine.setCoords();
    var newTempPointer = createCircleOnCanvas(newTempLine.x2, newTempLine.y2, 15 ,  `#${colorOfPointer}` ,"" , true , "tempPointer" );
    canvas.add(newTempLine , newTempPointer);
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
        console.log(color)
      return new fabric.Line([x1, y1, x2, y2], {
        id: id,
        stroke: color,
        strokeWidth: 5,
        selectable: false,
        hasControls: false
      })
    }

    

    function randomColor(){
        return Math.floor(Math.random()*16777215).toString(16);
    }

    function calculateAngleBetweenTwoLine(l1 , l2 , callee){
        console.log(l1.x1 , l1.y1 , l1.x2 , l1.y2);
        console.log(l2.x1 , l2.y1 , l2.x2 , l2.y2);
        
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

      
function init(){
    draw();
    addEventListenerOnCanvas();
  var angle =   calculateAngleBetweenTwoLine(line3 , line2 , "l2-l3");
  console.log("angle --->",angle)
  globalData.angle = angle;


  addLineAndPointerOnCanvas()
    
}

init();
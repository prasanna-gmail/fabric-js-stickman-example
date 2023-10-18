// * find all element by its name* ----------------> start//  --> getAllElementByName('elementName')

function getAllElementByName(elementName){
       

    fabric.Canvas.prototype.getItemsByName = function(name) {
        var objectList = [],
            objects = this.getObjects();
      
        for (var i = 0, len = this.size(); i < len; i++) {
          if (objects[i].name && objects[i].name === name) {
            objectList.push(objects[i]);
          }
        }
      console.log(objectList);
        return objectList;
      };

     return  canvas.getItemsByName(elementName);
}
// * find all element by its name* ----------------> end//

// * update pointer position on circular path*  ------------- start // updatePointerPosition("x" , "y")
function updatePointerPosition(x , y) {
    // console.log("updatePointerPosition--->",o)
    
  
    var deltaLeft = x - centerPointX;
    var deltaTop = y - centerPointY;
  
    var length = Math.sqrt(deltaLeft * deltaLeft + deltaTop * deltaTop);
  
    var radians = Math.atan2(deltaTop, deltaLeft)
  
    var ang = radians * 180 / Math.PI;
    length = centerRadius;
  
    var left = Math.cos(radians) * length + centerPointX;
    var top = Math.sin(radians) * length + centerPointY;
  
  
    var obj = {
      left: left,
      top: top,
      ang: ang
    }
    return obj;
  }

// * update pointer position on circular path*  ------------- end //



// * calculate third point*//

function calculate_third_point(Ax, Ay, Cx, Cy, b, c, A, alt) {

    // console.log("pkp:   Ax, Ay, Cx, Cy, b, c, A, alt:", Ax, Ay, Cx, Cy, b, c, A, alt)
  
    var Bx;
  
    var By;
  
    alt = typeof alt === 'undefined' ? false : alt;
  
    //unit vector
  
    uACx = (Cx - Ax) / b;
  
    uACy = (Cy - Ay) / b;
  
    if (alt) {
  //rotated vector
  
      uABx = uACx * Math.cos(toRadians(A)) - uACy * Math.sin(toRadians(A));
  
      uABy = uACx * Math.sin(toRadians(A)) + uACy * Math.cos(toRadians(A));
  
  
      //B position uses length of edge
  
      Bx = Ax + c * uABx;
  
      By = Ay + c * uABy;
  
    }
  
    else {
  
      //vector rotated into another direction
  
      uABx = uACx * Math.cos(toRadians(A)) + uACy * Math.sin(toRadians(A));
  
      uABy = - uACx * Math.sin(toRadians(A)) + uACy * Math.cos(toRadians(A));
  
      //second possible position
  
      Bx = Ax + c * uABx;
  
      By = Ay + c * uABy;
  
    }
    return { Bx: Bx, By: By };
  
  }
  /**
   
  * Convert degrees to radians.
   
  *
   
  * @param angle
   
  * @returns {number}
   
  */
  function toRadians(angle) {
  
    return angle * (Math.PI / 180);
  
  }





//   * resize canvas* //    ---->  $(window).resize(resizeCanvas);

function resizeCanvas() {
    const outerCanvasContainer = $('.canvas-wrapper')[0];
    
    const ratio = canvas.getWidth() / canvas.getHeight();
    const containerWidth   = outerCanvasContainer.clientWidth;
    const containerHeight  = outerCanvasContainer.clientHeight;

    const scale = containerWidth / canvas.getWidth();
    const zoom  = canvas.getZoom() * scale;
    if(window.innerWidth < 1240 ){
        canvas.setDimensions({width: containerWidth, height: containerWidth / ratio});
        canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    }
   

}


    

    
function calculateAngleBetweenTwoLine(l1, l2, callee) {
    console.log("callee-->", callee)
    console.log("l1.x1---->", l1.x1 + "   l1.y1---->" + l1.y1)
    console.log("l1.2---->", l1.x2 + "   l1.y2---->" + l1.y2)
    console.log("l2.x1---->", l2.x1 + "   l2.y1---->" + l2.y1)
    console.log("l2.x2---->", l2.x2 + "   l2.y2---->" + l2.y2)

    var slopOfLine1 = (l1.y2 - l1.y1) / (l1.x2 - l1.x1);
    var slopOfLine2 = (l2.y2 - l2.y1) / (l2.x2 - l2.x1);
    var actualAngle;
    console.log("slopOfLine1---->", slopOfLine1 + "   slopOfLine2---->" + slopOfLine2)
    var tangentOfBothLine = (slopOfLine2 - slopOfLine1) / (1 + slopOfLine1 * slopOfLine2)
    console.log("tangentOfBothLine---->", tangentOfBothLine)
    var angleBetweenLine1 = (Math.atan(tangentOfBothLine) * 180) / Math.PI;
    console.log("angleBetweenLine1---->", angleBetweenLine1)
    var angleBetweenLine2 = angleBetweenLine1.toFixed(1);
    var angleBetweenLine = parseInt(angleBetweenLine2);
    console.log(angleBetweenLine)

    var returnAngleBetweenLine;
    if (angleBetweenLine >= 0) {
        returnAngleBetweenLine = angleBetweenLine
    } else {
        returnAngleBetweenLine = 180 + angleBetweenLine
    }

    return returnAngleBetweenLine;
}


function calculateAngleBetweenLines(l1, l2, callee) {
    // Calculate the direction vectors of both lines
    console.log("callee-->", callee)
    const v1 = { x: l1.x2 - l1.x1, y: l1.y2 - l1.y1 };
    const v2 = { x: l2.x2 - l2.x1, y: l2.y2 - l2.y1 };

    // Calculate the angle between the two vectors using the dot product
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    // Calculate the angle in radians
    const angleInRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));

    // Convert the angle to degrees
    var angleInDegrees = angleInRadians * (180 / Math.PI);
    angleInDegrees = angleInDegrees.toFixed(1)

    // if(angleInDegrees > 90){
    //     angleInDegrees = 180-angleInDegrees;
    // }
    return angleInDegrees;
}


// * calculate angle between two line*  ----------- end//
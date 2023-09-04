var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
var canvas = this.__canvas = new fabric.Canvas('canvas', {
  width: width,
  height: height,
  selection: false
});


// var canvas = this.__canvas = new fabric.Canvas('canvas', { selection: false });
    // fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

var mouseDown = false;
var circle;
var pointer1;
var traingleData = {
  top: 325,
  left: 325,
  width: 350,
  height: 300,
  angle: 0
}
var selectedShapeArray = []
var rotationalSymmetryNumber = document.getElementById("rotational-symmetry-number");

var addTriangleBtn = document.getElementById("adding-triangle-btn");
var addSquareBtn = document.getElementById("adding-square-btn");
var addRectangleBtn = document.getElementById("adding-rectangle-btn");
var addHexagonBtn = document.getElementById("adding-hexagon-btn");
var addStarBtn = document.getElementById("adding-star-btn");
var addtrapezoidBtn = document.getElementById("adding-trapezoid-btn");

var equilateralTriangle1 = createTriangle("#0000FF");
var equilateralTriangle2 = createTriangle("#818589");




createCircleAndPointerOnCanvas();
selectedShapeForCheckSymmetry(equilateralTriangle1, equilateralTriangle2)

window.addEventListener('load', resize, false);
window.addEventListener('resize', resize, false);



// canvas.addEventListener("touchstart",activateActionOfPointer1);
// canvas.addEventListener("touchmove",startRotationOfPOinter1);
// canvas.addEventListener("touchend",stopRotationOfPOinter1);

// canvas.on({
//   "touch:start": activateActionOfPointer1,
//   "touch:move": startRotationOfPOinter1,
//   "touch:end": stopRotationOfPOinter1,

// })



canvas.on({

  "mouse:down": activateActionOfPointer1,
  "mouse:move": startRotationOfPOinter1,
  "mouse:up": stopRotationOfPOinter1,
  // 'object:moving':startRotationOfPOinter1

})

function activateActionOfPointer1(o) {
  console.log("hello pointer", o)
  mouseDown = true;
  var obj = o.target;
  if (obj == null) {
    return;
  }
  else if (obj.id == 'pointer1') {
    pointer1.set({
      stroke: 'black',
      strokeWidth: 2,
      opacity: 0.8
    })
  }
  canvas.requestRenderAll();
}

function startRotationOfPOinter1(o) {
  // console.log(o)
  var obj = o.target;
  var pointer = o.pointer;
  if (mouseDown == true) {
    if (obj == null) {
      return;
    }
    else if (obj.id == 'pointer1') {
      var pos = updatePointerPosition(o);
      var updatedAngle = pos.ang + 90
      console.log("angle-->", updatedAngle)
      console.log("updatePointerPosition--->", pos)
      pointer1.set({
        top: pos.top,
        left: pos.left
      })

      if (selectedShapeArray[0].id == 'triangle1') {
        var trainglePos = updateTrianglePosition(updatedAngle)
        console.warn("trainglePos--->",trainglePos)
        selectedShapeArray[0].set({
          left: trainglePos.x,
          top: trainglePos.y,
          angle: updatedAngle
        })
      } else {
        selectedShapeArray[0].set({
          angle: updatedAngle,
        });
      }

      // selectedShapeArray[0].setCoords()
      // obj.setCoords();
    }

  }
  canvas.requestRenderAll();

}


function stopRotationOfPOinter1(o) {
  console.log(o)
  var obj = o.target;
  if (obj == null) {
    mouseDown = false;
    return;

  }
  else if (obj.id == 'pointer1') {
    pointer1.set({
      stroke: '',
      strokeWidth: 0,
      opacity: 0.8
    })

    rotationalSymmetryNumber.addEventListener('click', checkRotationalSymmetryForSelectedShape);
  }
  mouseDown = false;

}


function updatePointerPosition(o) {
   console.log("updatePointerPosition--->",o)
  var pointer = o.pointer;
  console.log("pointer.x type--->",pointer, typeof(pointer.x))
  console.log("pointer.y type--->",pointer , typeof(pointer.y))

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




var triangle1 = new fabric.Polygon([
  { x: 0, y: 0 },
  { x: 300, y: 0 },
  { x: 150, y: Math.abs(Math.sqrt((300 * 300) - (150 * 150))) },
], {
  id: 'triangle1',
  fill: "#0000FF",
  left: circle.left,
  top: circle.top,
  originX: 'center',
  originY: 'center',
  centeredRotation: false,

})


var triangle2 = new fabric.Polygon([
  { x: 0, y: 0 },
  { x: 300, y: 0 },
  { x: 150, y: Math.abs(Math.sqrt((300 * 300) - (150 * 150))) },
], {
  id: 'triangle1',
  fill: "#818589",
  left: circle.left,
  top: circle.top,
  originX: 'center',
  originY: 'center',
  centeredRotation: false,
})

//////////////////// hexagon ////////////////////////////////////////////////////////////////////

var trapezoid = [{ x: -100, y: -50 }, { x: 100, y: -50 }, { x: 150, y: 50 }, { x: -150, y: 50 }];
var emerald = [{ x: 850, y: 75 },
{ x: 958, y: 137.5 },
{ x: 958, y: 262.5 },
{ x: 850, y: 325 },
{ x: 742, y: 262.5 },
{ x: 742, y: 137.5 },
];
var star4 = [
  { x: 0, y: 0 },
  { x: 100, y: 50 },
  { x: 200, y: 0 },
  { x: 150, y: 100 },
  { x: 200, y: 200 },
  { x: 100, y: 150 },
  { x: 0, y: 200 },
  { x: 50, y: 100 },
  { x: 0, y: 0 }
];
var star5 = [{ x: 350, y: 75 },
{ x: 380, y: 160 },
{ x: 470, y: 160 },
{ x: 400, y: 215 },
{ x: 423, y: 301 },
{ x: 350, y: 250 },
{ x: 277, y: 301 },
{ x: 303, y: 215 },
{ x: 231, y: 161 },
{ x: 321, y: 161 },];
var star51 = [
  { x: 349.9, y: 75, },
  { x: 379, y: 160.9, },
  { x: 469, y: 160.9, },
  { x: 397, y: 214.9, },
  { x: 423, y: 300.9, },
  { x: 350, y: 249.9, },
  { x: 276.9, y: 301, },
  { x: 303, y: 215, },
  { x: 231, y: 161, },
  { x: 321, y: 161, },
];
var shape = new Array(trapezoid, emerald, star4, star5, star51);

//////// event listener on demo shape button click.

addStarBtn.addEventListener('click', addStarOnCanvas)
addHexagonBtn.addEventListener('click', addHexagonOnCanvas);
addSquareBtn.addEventListener('click', addSquareOnCanvas);
addRectangleBtn.addEventListener('click', addReactangleOnCanvas);
addTriangleBtn.addEventListener('click', function () {
  selectedShapeForCheckSymmetry(equilateralTriangle1, equilateralTriangle2);
});

addtrapezoidBtn.addEventListener('click', addTrapezoidOnCanvas)
////************* */

function checkRotationalSymmetryForSelectedShape() {
  var shape = selectedShapeArray[0];

  if (shape.id == "triangle1") {
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 4";
  }
  else if (shape.id == "square1") {
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 4";
  }
  else if (shape.id == "rectangle1") {
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 2";
  }
  else if (shape.id == "hexagon1") {
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 6";
  }
  else if (shape.id == "star4") {
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 4";
  }
  else if (shape.id == "trapezoid1") {
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 1";
  }
}



function createTriangle(color) {
  var width = traingleData.width;
  var height = traingleData.height;
  var angle = traingleData.angle;
  var pos = updateTrianglePosition(angle)
  console.warn("pos-->",pos)
  return new fabric.Triangle(
    {
      id: "triangle1",
      width: width,
      height: height,
      selectable: false,
      fill: color,
      left: pos.x,
      top: pos.y,
      angle: angle,
    });
}

function updateTrianglePosition(angle) {
  var width = traingleData.width;
  var height = traingleData.height;
  var x = traingleData.left;
  var y = traingleData.top;
 

  var pos = fabric.util.rotatePoint(
    new fabric.Point(x, y),
    new fabric.Point(x + width / 2, y + height / 3 * 2),
    fabric.util.degreesToRadians(angle)
  );

  return pos;
}

function selectedShapeForCheckSymmetry(shape1, shape2) {

  if (selectedShapeArray.length > 0) {
    canvas.remove(selectedShapeArray[0], selectedShapeArray[1]);
    canvas.requestRenderAll();
    selectedShapeArray = [];
    selectedShapeArray.push(shape1, shape2);
    canvas.add(selectedShapeArray[1], selectedShapeArray[0]);
  } else if (selectedShapeArray.length == 0) {
    selectedShapeArray.push(shape1, shape2);
    canvas.add(selectedShapeArray[1], selectedShapeArray[0]);
  }

  rotationalSymmetryNumber.innerHTML = "?";
  resetPointerAndAngleOfRotation();

}

function resetPointerAndAngleOfRotation() {
  pointer1.set({
    top: circle.top - circle.radius,
    left: circle.left,
  });

  if (selectedShapeArray[0].id == 'triangle1') {
    selectedShapeArray[0].set({
      left: traingleData.left,
      top: traingleData.top,
      angle: 0
    })
  } else {
    selectedShapeArray[0].set({
      angle: 0,
    });
  }

  selectedShapeArray[0].setCoords();
  pointer1.setCoords();

  canvas.requestRenderAll();


}




function createCircleAndPointerOnCanvas() {
  circle = new fabric.Circle({
    id: "main-circle",
    radius: 300,
    fill: '',
    stroke: 'red',
    strokeWidth: 4,
    top: 500,
    left: 500,
    originX: 'center',
    originY: 'center',
    selectable: false,
    hasControls: false,

  })

  pointer1 = new fabric.Circle({
    id: 'pointer1',
    radius: 20,
    fill: '#0000FF',
    top: circle.top - circle.radius,
    left: circle.left,
    hasControls: false,
    originX: 'center',
    originY: 'center',

  })

  canvas.add(circle, pointer1)
}

function addStarOnCanvas() {
  var star1;
  var star2;
  star1 = new fabric.Polygon(shape[2], {
    id: 'star4',
    fill: "#0000FF",
    left: circle.left,
    top: circle.top,
    originX: 'center',
    originY: 'center',
  });

  star2 = new fabric.Polygon(shape[2], {
    id: 'star4',
    fill: "#818589",
    left: circle.left,
    top: circle.top,
    originX: 'center',
    originY: 'center',
  });
  selectedShapeForCheckSymmetry(star1, star2);
}

function addHexagonOnCanvas() {
  var hexagon1;
  var hexagon2;
  hexagon1 = new fabric.Polygon(shape[1], {
    id: 'hexagon1',
    fill: '#0000FF',
    left: circle.left,
    top: circle.top,
    originX: 'center',
    originY: 'center',
  });

  hexagon2 = new fabric.Polygon(shape[1], {
    id: 'hexagon1',
    fill: '#818589',
    left: circle.left,
    top: circle.top,
    originX: 'center',
    originY: 'center',

  });
  selectedShapeForCheckSymmetry(hexagon1, hexagon2);
}

function addSquareOnCanvas() {
  var square1;
  var square2;
  square1 = new fabric.Polygon([
    { x: 0, y: 0 },
    { x: 0, y: 200 },
    { x: 200, y: 200 },
    { x: 200, y: 0 },
  ], {
    id: 'square1',
    fill: '#0000FF',
    left: circle.left,
    top: circle.top,
    originX: 'center',
    originY: 'center',
  })

  square2 = new fabric.Polygon([
    { x: 0, y: 0 },
    { x: 0, y: 200 },
    { x: 200, y: 200 },
    { x: 200, y: 0 },
  ], {
    id: 'square1',
    fill: '#818589',
    left: circle.left,
    top: circle.top,
    originX: 'center',
    originY: 'center',
  })
  selectedShapeForCheckSymmetry(square1, square2)
}

function addReactangleOnCanvas() {
  var rectangle1;
  var rectangle2;
  rectangle1 = new fabric.Polygon([
    { x: 0, y: 0 },
    { x: 0, y: 200 },
    { x: 300, y: 200 },
    { x: 300, y: 0 },
  ], {
    id: 'rectangle1',
    fill: '#0000FF',
    left: circle.left,
    top: circle.top,
    originX: 'center',
    originY: 'center',
  })
  /////////////////////// Rectangle /////////////
  rectangle2 = new fabric.Polygon([
    { x: 0, y: 0 },
    { x: 0, y: 200 },
    { x: 300, y: 200 },
    { x: 300, y: 0 },
  ], {
    id: 'rectangle1',
    fill: '#818589',
    left: circle.left,
    top: circle.top,
    originX: 'center',
    originY: 'center',
  })
  selectedShapeForCheckSymmetry(rectangle1, rectangle2);
}

function addTrapezoidOnCanvas() {
  var trapezoid1;
  var trapezoid2;
  trapezoid1 = new fabric.Polygon(shape[0], {
    id: 'trapezoid1',
    fill: '#0000FF',
    left: circle.left,
    top: circle.top,
    originX: 'center',
    originY: 'center',
  });

  trapezoid2 = new fabric.Polygon(shape[0], {
    id: 'trapezoid1',
    fill: '#818589',
    left: circle.left,
    top: circle.top,
    originX: 'center',
    originY: 'center',

  });
  selectedShapeForCheckSymmetry(trapezoid1, trapezoid2);
}

function resize() {
	var canvasSizer = document.getElementById("canvas");
	var canvasScaleFactor = canvasSizer.offsetWidth/525;
	var width = canvasSizer.offsetWidth;
	var height = canvasSizer.offsetHeight;
	var ratio = canvas.getWidth() /canvas.getHeight();
		 if((width/height)>ratio){
			 width = height*ratio;
		 } else {
			 height = width / ratio;
		 }
  var scale = width / canvas.getWidth();
  var zoom = canvas.getZoom();
  zoom *= scale;
  canvas.setDimensions({ width: width, height: height });
	canvas.setViewportTransform([zoom , 0, 0, zoom , 0, 0])
}


// })();
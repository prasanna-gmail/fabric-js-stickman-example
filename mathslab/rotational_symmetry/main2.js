import './style.css'
import {fabric} from 'fabric'

let canvas = new fabric.Canvas('canvas',{
  width: window.innerWidth,
  height : window.innerHeight
})

let circle ;
let polyg1;
let polyg2;
let star1;
let star2;
let square1;
let square2;
let rectangle1;
let rectangle2;
let pointer1;
let mouseDown = false;
let triangle1;
let triangle2;
let addTriangleBtn = document.getElementById("adding-triangle-btn");
let addSquareBtn = document.getElementById("adding-square-btn");
let addRectangleBtn = document.getElementById("adding-rectangle-btn");
let addHexagonBtn = document.getElementById("adding-hexagon-btn");
let addStarBtn = document.getElementById("adding-star-btn");
let addTriangleBtnClicked = false;
let selectedShape = [];
let traingleAngle = 0;
var traingleData = {
  top: 325,
  left : 325,
  width : 350,
  height : 300
}
// addTriangleBtn.addEventListener('click',activateTriangleOnCanvas);
let rotationalSymmetryNumber = document.getElementById("rotational-symmetry-number");
circle = new fabric.Circle({
  id : "main-circle",
  radius : 300,
  fill :'',
  stroke: 'red',
	strokeWidth: 3,
  top: 500,
  left : 500,
  originX : 'center',
  originY : 'center',
  selectable:false,
  hasControls:false,

})

console.log("main circle--->",circle)
pointer1 = new fabric.Circle({
  id: 'pointer1',
  radius : 20,
  fill :'blue',
  top: circle.top - circle.radius,
  left : circle.left,
  hasControls:false,
  originX : 'center',
  originY : 'center',

})
console.log("pointer1---->",pointer1)

canvas.add(circle, pointer1)

canvas.on({
  "mouse:down" : activatePointer1,
  "mouse:move" : startRotationOfPOinter1,
  "mouse:up" : stopRotationOfPOinter1,

})

function activatePointer1(o){
  mouseDown = true;
  let obj = o.target;
  if(obj.id == 'pointer1'){
    pointer1.set({
      stroke : 'black',
      strokeWidth : 2,
      opacity: 0.8
    })
  }else{
    return;
  }
  canvas.requestRenderAll();
}

function startRotationOfPOinter1(o){
  let obj = o.target;
  let pointer = o.e;
  if (mouseDown === true){

    if(obj.id == 'pointer1'){
      var pos = updatePointerPosition(o);
      var updatedAngle = pos.ang + 90
      console.log("angle-->",updatedAngle)
      console.log("updatePointerPosition--->",pos)
      pointer1.set({
        top: pos.top ,
        left: pos.left
      })
      triangle1.set({
        angle : updatedAngle
        
      })
      // triangle2.set({
      //   angle : pos.ang + 90
        
      // })
      
      square1.set({
        angle : updatedAngle,
      });
      rectangle1.set({
        angle : updatedAngle,
      });

      polyg1.set({
        angle : updatedAngle,
      });

      star1.set({
        angle : updatedAngle,
      });

      var trainglePos = updateTrianglePosition(updatedAngle)
      equilateralTriangle1.set({
        left:trainglePos.x,
        top : trainglePos.y,
        angle : updatedAngle
      })
       equilateralTriangle1.setCoords()
      star1.setCoords()
      polyg1.setCoords()
      rectangle1.setCoords()
      square1.setCoords()
      triangle1.setCoords()
      // triangle2.setCoords()
      obj.setCoords();
    }

  }
  canvas.requestRenderAll();
  
}

function stopRotationOfPOinter1(o){
  let obj = o.target;
  if(obj.id == 'pointer1'){
    pointer1.set({
      stroke : '',
      strokeWidth : 0,
      opacity: 0.8
    })


    
  }else{
    return;
  }
  mouseDown = false;
}


function updatePointerPosition(o){
// console.log("updatePointerPosition--->",o)
let pointer = o.e;

let deltaLeft = pointer.x - circle.left ;
let deltaTop = pointer.y - circle.top ; 

let length = Math.sqrt(deltaLeft * deltaLeft + deltaTop * deltaTop);
console.log("length--->", length)

var radians = Math.atan2(deltaTop, deltaLeft)

let ang = radians * 180 / Math.PI;
length = circle.radius;

let left = Math.cos(radians) * length + circle.left;
let top = Math.sin(radians) * length + circle.top;


var obj = {
  left : left,
  top : top,
  ang : ang
}
return obj;
}


// function activateTriangleOnCanvas(){
//   addTriangleBtnClicked = true;

//   canvas
// }
// let trianglewidth = 400;

// triangle1 = new fabric.Triangle({
//   id:'triangle1',
//   width: trianglewidth,
//   height: trianglewidth/2,
//   fill : "blue",
//   left : circle.left,
//   top : circle.top,
//   originX : 'center',
//   originY : 'center'
// })
// triangle2 = new fabric.Triangle({
//   id:'triangle1',
//   width: trianglewidth,
//   height: trianglewidth/2,
//   fill : "gray",
//   left : circle.left,
//   top : circle.top,
//   originX : 'center',
//   originY : 'center'
// })
let p3y = Math.abs(Math.sqrt(30000))


triangle1 = new fabric.Polygon([
  {x:0,y:0},
  {x:300,y:0},
  {x:150,y:Math.abs(Math.sqrt((300*300)-(150*150)))},
],{
  id:'triangle1',
  fill : "blue",
  left : circle.left ,
  top : circle.top,
  originX : 'center',
  originY : 'center',
  centeredRotation : false,
  
})


triangle2 = new fabric.Polygon([
  {x:0,y:0},
  {x:300,y:0},
  {x:150,y:Math.abs(Math.sqrt((300*300)-(150*150)))},
],{
  id:'triangle1',
  fill : "gray",
  left : circle.left,
  top : circle.top,
  originX : 'center',
  originY : 'center',
  centeredRotation : false,
})

square1 = new fabric.Polygon([
  {x:0,y:0},
  {x:0,y:200},
  {x:200,y:200},
  {x:200,y:0},
],{
  id:'square1',
  fill:'blue',
  left : circle.left,
  top : circle.top,
  originX : 'center',
  originY : 'center',
})

square2 = new fabric.Polygon([
  {x:0,y:0},
  {x:0,y:200},
  {x:200,y:200},
  {x:200,y:0},
],{
  id:'square1',
  fill:'gray',
  left : circle.left,
  top : circle.top,
  originX : 'center',
  originY : 'center',
})


rectangle1 = new fabric.Polygon([
  {x:0,y:0},
  {x:0,y:200},
  {x:300,y:200},
  {x:300,y:0},
],{
  id:'rectangle1',
  fill:'blue',
  left : circle.left,
  top : circle.top,
  originX : 'center',
  originY : 'center',
})
/////////////////////// Rectangle /////////////
rectangle2 = new fabric.Polygon([
  {x:0,y:0},
  {x:0,y:200},
  {x:300,y:200},
  {x:300,y:0},
],{
  id:'rectangle1',
  fill:'gray',
  left : circle.left,
  top : circle.top,
  originX : 'center',
  originY : 'center',
})


//////////////////// hexagon ////////////////////////////////////////////////////////////////////

var trapezoid = [ {x:-100,y:-50},{x:100,y:-50},{x:150,y:50},{x:-150,y:50} ];
var emerald = [ 	{x:850,y:75},
                  {x:958,y:137.5},
                  {x:958,y:262.5},
                  {x:850,y:325},
                  {x:742,y:262.5},
                  {x:742,y:137.5},
                  ];
var star4 = [
	{x:0,y:0},
  {x:100,y:50},
  {x:200,y:0},
  {x:150,y:100},
  {x:200,y:200},
  {x:100,y:150},
  {x:0,y:200},
  {x:50,y:100},
  {x:0,y:0}
];
var star5 = [ 	{x:350,y:75},
              {x:380,y:160},
              {x:470,y:160},
              {x:400,y:215},
              {x:423,y:301},
              {x:350,y:250},
              {x:277,y:301},
              {x:303,y:215},
              {x:231,y:161},
              {x:321,y:161},];
var shape = new Array(trapezoid,emerald,star4,star5);

 polyg1 = new fabric.Polygon(shape[1], {
  id:'hexagon1',
    fill: 'blue',
    left : circle.left,
  top : circle.top,
  originX : 'center',
  originY : 'center',
});

 polyg2 = new fabric.Polygon(shape[1], {
  id:'hexagon1',
  fill: 'gray',
  left : circle.left,
  top : circle.top,
  originX : 'center',
  originY : 'center',
  
});




//////////////////// star ////////////////////////////////////////////////////////////////////


var points = [
  { x: 349.9, y: 75, },
  { x: 379, y: 160.9,},
  { x: 469, y: 160.9,},
  { x: 397, y: 214.9,},
  { x: 423, y: 300.9,},
  { x: 350, y: 249.9,},
  { x: 276.9, y: 301,},
  { x: 303, y: 215,},
  { x: 231, y: 161,},
  { x: 321, y: 161,},
];

// Initiating a polygon object
 star1 = new fabric.Polygon(shape[2], {
  id:'star4',
  left: 100,
  top: 10,
  fill: "blue", 
  left : circle.left,
  top : circle.top,
  originX : 'center',
  originY : 'center',
});

 star2 = new fabric.Polygon(shape[2], {
  id:'star4',
  left: 100,
  top: 10,
  fill: "gray", 
  left : circle.left,
  top : circle.top,
  originX : 'center',
  originY : 'center',
});






addStarBtn.addEventListener('click', function(){
  selectedShapes(star1);
  canvas.add(star2,star1);
})


addHexagonBtn.addEventListener('click', function(){
  selectedShapes(polyg1);
  canvas.add(polyg2,polyg1);
})


addTriangleBtn.addEventListener('click',function(){
  selectedShapes(equilateralTriangle1);
  // canvas.add(triangle2,triangle1);
  canvas.add(equilateralTriangle2,equilateralTriangle1)
  
});

addSquareBtn.addEventListener('click',function(){
  selectedShapes(square1);
  canvas.add(square2,square1);
});

addRectangleBtn.addEventListener('click',function(){
  selectedShapes(rectangle1);
  canvas.add(rectangle2,rectangle1);
})


rotationalSymmetryNumber.addEventListener('click', function(){
  var shape = selectedShape[0];
  console.log("shape-->",shape.id)

  if(shape.id == "triangle1"){
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 4";
  }

  else if(shape.id == "square1"){
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 4";
  }
  else if(shape.id == "rectangle1"){
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 2";
  }
  else if(shape.id == "hexagon1"){
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 6";
  }
  else if(shape.id == "star4"){
    rotationalSymmetryNumber.innerHTML = " Rotational Symmetry Number = 4";
  }
})

function selectedShapes(shape){
  
  console.log("selectableShape.length--->",selectedShape.length)
  if(selectedShape.length > 0){
    selectedShape.pop();
    selectedShape.push(shape);
    console.log("selectableShape.length--->",selectedShape)
  }
  else{
    selectedShape.push(shape);
    console.log("selectableShape.length--->",selectedShape)
  }
}

let equilateralTriangle1 = createTriangle( traingleAngle , "blue")
let equilateralTriangle2 = createTriangle(traingleAngle, "gray")

// canvas.add(equilateralTriangle2,equilateralTriangle1)

function createTriangle(angle , color)
{
    var width = traingleData.width;
    var height = traingleData.height;
    var pos = updateTrianglePosition(angle)
    return new fabric.Triangle(
    {
        id:"triangle1",
        width: width,
        height: height,
        selectable: false,
        fill: color,
        left: pos.x,
        top: pos.y,
        angle: angle,
    });
}

function updateTrianglePosition( angle){
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
(function () {
  var canvas = this.__canvas = new fabric.Canvas('c', { selection: false });
//   fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
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


  

  function createAll() {

    
  }


  function init() {
   


  }

  createAll()
  init()

})();
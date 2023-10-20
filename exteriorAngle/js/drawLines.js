// Updated 29/12/15 by James
// JavaScript Document

var nj1button;
var nj1snapX;
var nj1snapY;
var nj1color;
var nj1thickness;
var nj1oneLine;

var nj1startX;
var nj1startY;
var nj1endX;
var nj1endY;
var nj1butNum;
var nj1arrayLines = {};
var nj1unitSize;
	
function drawStraightLines(onButton, opt_snapToX, opt_snapToY, opt_color, opt_thickness, opt_oneLineOnly, opt_unitSize) {
	nj1button = onButton
	nj1arrayLines[String(taskTag)] = []
	
	if (typeof onButton == 'undefined') {return;}
	if (typeof opt_snapToX == 'undefined') {nj1snapX=1} else {nj1snapX =opt_snapToX }
	if (typeof opt_snapToY == 'undefined') {nj1snapY=1} else {nj1snapY =opt_snapToY }
	if (typeof opt_color == 'undefined') {nj1color='#F00'} else {nj1color = opt_color}
	if (typeof opt_thickness == 'undefined') {nj1thickness=5} else {nj1thickness = opt_thickness}
	if (typeof opt_oneLineOnly == 'undefined') {nj1oneLine=true} else {nj1oneLine = opt_oneLineOnly}
	if (typeof opt_unitSize == 'undefined') {nj1unitSize=1} else {nj1unitSize = opt_unitSize}	
	
	addListenerStart(nj1button, NstartStraightLine)
}
	
function NstartStraightLine (e) {
	var a=	eval(String(taskTag) + 'button')
	nj1butNum = a.indexOf(e.target)
	var b = eval(String(taskTag) + 'buttonData')
	
	e.preventDefault();
	if (e.touches) {
		var x = e.touches[0].pageX; 
		var y = e.touches[0].pageY;
	} else {
		var x = e.clientX || e.pageX;
		var y = e.clientY || e.pageY;
	}
	mouse.x = xWindowToCanvas(x);
	mouse.y = yWindowToCanvas(y);

	nj1startX = mouse.x - b[nj1butNum][0]
	nj1startY = mouse.y - b[nj1butNum][1]
	
	//snap to nearest grid point
	nj1startX = roundToNearest(nj1startX, nj1snapX)
	nj1startY = roundToNearest(nj1startY, nj1snapY) 
	
	addListenerMove(a[nj1butNum], NdrawLineMove);
	addListenerEnd(a[nj1butNum], NdrawLineEnd);
	
	try {
		if (typeof eval(taskTag + 'drawLineStart') == 'function') {eval(taskTag + 'drawLineStart(event);');}
	} 
	catch(err) {}
	
}
	
	
function NdrawLineMove (e) {
	var a = eval(String(taskTag) + 'button')
	var b = eval(String(taskTag) + 'buttonData')
	var c = eval(String(taskTag) + 'buttonctx')
	
	e.preventDefault();
	if (e.touches) {
		var x = e.touches[0].pageX; 
		var y = e.touches[0].pageY;
	} else {
		var x = e.clientX || e.pageX;
		var y = e.clientY || e.pageY;
	}
	mouse.x = xWindowToCanvas(x);
	mouse.y = yWindowToCanvas(y);
	
	c[nj1butNum].clearRect(0,0,1200,700)
	c[nj1butNum].beginPath();
	c[nj1butNum].moveTo(nj1startX,nj1startY);
	c[nj1butNum].lineWidth =nj1thickness
	c[nj1butNum].strokeStyle = nj1color
	c[nj1butNum].lineTo(mouse.x-b[nj1butNum][0],mouse.y-b[nj1butNum][1]);
	c[nj1butNum].stroke();
	
	if (nj1oneLine==false) {
		
		for (var nj1i=0; nj1i<nj1arrayLines[String(taskTag)].length;nj1i++) {
			c[nj1butNum].beginPath();
			c[nj1butNum].moveTo(nj1arrayLines[String(taskTag)][nj1i].startX,nj1arrayLines[String(taskTag)][nj1i].startY);
			c[nj1butNum].lineWidth =nj1thickness
			c[nj1butNum].strokeStyle = nj1color
			c[nj1butNum].lineTo(nj1arrayLines[String(taskTag)][nj1i].endX,nj1arrayLines[String(taskTag)][nj1i].endY);
			c[nj1butNum].stroke();
		}
	}
}
	
function NdrawLineEnd (e) {
	var a = eval(String(taskTag) + 'button')
	var b = eval(String(taskTag) + 'buttonData')
	var c = eval(String(taskTag) + 'buttonctx')
	
	nj1endX = roundToNearest(mouse.x-b[nj1butNum][0], nj1snapX)
	nj1endY = roundToNearest(mouse.y-b[nj1butNum][1], nj1snapY)
	
	var object ={}
	object.startX = nj1startX
	object.startY = nj1startY
	object.endX = nj1endX
	object.endY = nj1endY
	object.gradient = (object.startY-object.endY) / (object.endX - object.startX)
	object.lineLength =Math.pow( Math.pow((object.startX - object.endX),2) +  Math.pow((object.startY - object.endY),2),0.5)
	
	
	

	//store current line
	if (nj1oneLine == false) {
		if (object.lineLength==0 || object.endX == 0 || (object.endX == object.startX && object.endY == object.startY) ) {} else {
			
			 nj1arrayLines[String(taskTag)].push(object)}
			
			//change -infnitey gradients to poositive 
			for (nji = 0; nji < nj1arrayLines[String(taskTag)].length; nji++) {
				
				if (nj1arrayLines[String(taskTag)][nji].gradient==-Infinity) {nj1arrayLines[String(taskTag)][nji].gradient = Infinity}
			}
			
			//amalgamate any lines that are touching and ahve same gradient
			
	for (nji = 0; nji < nj1arrayLines[String(taskTag)].length; nji++) {
    //if gradients match

		for (nji2 = 0; nji2 < nj1arrayLines[String(taskTag)].length; nji2++) {
	
			if (nji !== nji2 && nj1arrayLines[String(taskTag)][nji2].gradient == nj1arrayLines[String(taskTag)][nji].gradient) {
				if (
					nj1arrayLines[String(taskTag)][nji2].startX == nj1arrayLines[String(taskTag)][nji].endX && nj1arrayLines[String(taskTag)][nji2].startY == nj1arrayLines[String(taskTag)][nji].endY) {
					//if the startingPoint of the first line is the end point of the second line
					nj1arrayLines[String(taskTag)][nji].endX = nj1arrayLines[String(taskTag)][nji2].endX
					nj1arrayLines[String(taskTag)][nji].endY = nj1arrayLines[String(taskTag)][nji2].endY
					nj1arrayLines[String(taskTag)].splice(nji2, 1);continue;
				}
	
				if (nj1arrayLines[String(taskTag)][nji2].endX == nj1arrayLines[String(taskTag)][nji].endX && nj1arrayLines[String(taskTag)][nji2].endY == nj1arrayLines[String(taskTag)][nji].endY) { //amalgamate
				//if the endingPoint of the first line is the end point of the second line
					nj1arrayLines[String(taskTag)][nji].endX = nj1arrayLines[String(taskTag)][nji2].startX
					nj1arrayLines[String(taskTag)][nji].endY = nj1arrayLines[String(taskTag)][nji2].startY
					nj1arrayLines[String(taskTag)].splice(nji2, 1);continue
					
				
				}
				
				if (
					nj1arrayLines[String(taskTag)][nji2].startX == nj1arrayLines[String(taskTag)][nji].startX && nj1arrayLines[String(taskTag)][nji2].startY == nj1arrayLines[String(taskTag)][nji].startY) {
					//if the startingPoint of the first line is the starting point of the second line
					nj1arrayLines[String(taskTag)][nji].startX = nj1arrayLines[String(taskTag)][nji2].endX
					nj1arrayLines[String(taskTag)][nji].startY = nj1arrayLines[String(taskTag)][nji2].endY
					nj1arrayLines[String(taskTag)].splice(nji2, 1);continue;
				}
				
				if (
					nj1arrayLines[String(taskTag)][nji2].endX == nj1arrayLines[String(taskTag)][nji].startX && nj1arrayLines[String(taskTag)][nji2].endY == nj1arrayLines[String(taskTag)][nji].startY) {
					//if the endPoint of the first line is the start point of the second line
					nj1arrayLines[String(taskTag)][nji].startX = nj1arrayLines[String(taskTag)][nji2].startX
					nj1arrayLines[String(taskTag)][nji].startY = nj1arrayLines[String(taskTag)][nji2].startY
					nj1arrayLines[String(taskTag)].splice(nji2, 1);continue;
				}
	
				}
	
			}
	}
			
			//if lines overlap
for (nji = 0; nji < nj1arrayLines[String(taskTag)].length; nji++) {
    //if gradients match

    for (nji2 = 0; nji2 < nj1arrayLines[String(taskTag)].length; nji2++) {

        if (nji !== nji2 && nj1arrayLines[String(taskTag)][nji2].gradient == nj1arrayLines[String(taskTag)][nji].gradient) {

			var sepLines = false;
			if (nj1arrayLines[String(taskTag)][nji2].endY - nj1arrayLines[String(taskTag)][nji2].gradient * -1 * nj1arrayLines[String(taskTag)][nji2].endX== Infinity) {
				if (nj1arrayLines[String(taskTag)][nji2].endX == nj1arrayLines[String(taskTag)][nji].endX) {sepLines=false} else {sepLines=true}
				}
			
            //check if they share a point
            if (nj1arrayLines[String(taskTag)][nji2].endY - nj1arrayLines[String(taskTag)][nji2].gradient * -1 * nj1arrayLines[String(taskTag)][nji2].endX == nj1arrayLines[String(taskTag)][nji].endY - nj1arrayLines[String(taskTag)][nji].gradient * -1 * nj1arrayLines[String(taskTag)][nji].endX && sepLines==false) {
				
				

                //they are collinear, case 1 - they overlap entirely, drawn the smae way

                var b = Math.pow(Math.pow(nj1arrayLines[String(taskTag)][nji2].endY - nj1arrayLines[String(taskTag)][nji].endY, 2) + Math.pow(nj1arrayLines[String(taskTag)][nji2].endX - nj1arrayLines[String(taskTag)][nji].endX, 2), 0.5)

                var d = Math.pow(Math.pow(nj1arrayLines[String(taskTag)][nji2].startY - nj1arrayLines[String(taskTag)][nji].startY, 2) + Math.pow(nj1arrayLines[String(taskTag)][nji2].startX - nj1arrayLines[String(taskTag)][nji].startX, 2), 0.5);

                if (b + d + nj1arrayLines[String(taskTag)][nji2].lineLength == nj1arrayLines[String(taskTag)][nji].lineLength) {
                    nj1arrayLines[String(taskTag)].splice(nji2, 1);
                    continue
                }



                var f = Math.pow(Math.pow(nj1arrayLines[String(taskTag)][nji2].endY - nj1arrayLines[String(taskTag)][nji].startY, 2) + Math.pow(nj1arrayLines[String(taskTag)][nji2].endX - nj1arrayLines[String(taskTag)][nji].startX, 2), 0.5)

                var g8 = Math.pow(Math.pow(nj1arrayLines[String(taskTag)][nji2].startY - nj1arrayLines[String(taskTag)][nji].endY, 2) + Math.pow(nj1arrayLines[String(taskTag)][nji2].startX - nj1arrayLines[String(taskTag)][nji].endX, 2), 0.5);


                if (f + g8 + nj1arrayLines[String(taskTag)][nji2].lineLength == nj1arrayLines[String(taskTag)][nji].lineLength) {
                    nj1arrayLines[String(taskTag)].splice(nji2, 1);
                    continue
                }


                //case 2 - they overlap partially

                //drawn in same direction - check by looking at y values
                var same = false;

                if ((nj1arrayLines[String(taskTag)][nji2].endY > nj1arrayLines[String(taskTag)][nji2].startY &&
                        nj1arrayLines[String(taskTag)][nji].endY > nj1arrayLines[String(taskTag)][nji].startY) || (
                        nj1arrayLines[String(taskTag)][nji2].startY > nj1arrayLines[String(taskTag)][nji2].endY &&
                        nj1arrayLines[String(taskTag)][nji].startY > nj1arrayLines[String(taskTag)][nji].endY)

                ) {
                    same = true
                }

                if (nj1arrayLines[String(taskTag)][nji2].endY - nj1arrayLines[String(taskTag)][nji2].startY == 0 &&

                    (
                        (nj1arrayLines[String(taskTag)][nji2].endX > nj1arrayLines[String(taskTag)][nji2].startX &&
                            nj1arrayLines[String(taskTag)][nji].endX > nj1arrayLines[String(taskTag)][nji].startX) ||
                        (nj1arrayLines[String(taskTag)][nji2].startX > nj1arrayLines[String(taskTag)][nji2].endX &&
                            nj1arrayLines[String(taskTag)][nji].startX > nj1arrayLines[String(taskTag)][nji].endX)
                    )
                ) {
                    same = true
                }

                if (same == true) {

                    var k1 = Math.pow(Math.pow(nj1arrayLines[String(taskTag)][nji2].endY - nj1arrayLines[String(taskTag)][nji].startY, 2) + Math.pow(nj1arrayLines[String(taskTag)][nji2].endX - nj1arrayLines[String(taskTag)][nji].startX, 2), 0.5)

                    var k2 = Math.pow(Math.pow(nj1arrayLines[String(taskTag)][nji].endY - nj1arrayLines[String(taskTag)][nji2].startY, 2) + Math.pow(nj1arrayLines[String(taskTag)][nji].endX - nj1arrayLines[String(taskTag)][nji2].startX, 2), 0.5)

                    var maxDistance = Math.max(k1, k2)

                    if (nj1arrayLines[String(taskTag)][nji].lineLength + nj1arrayLines[String(taskTag)][nji2].lineLength > maxDistance) {
                      
						var newLineToPush = {}
                        //if k1 is largest, insert that line
                        if (maxDistance == k1) {

                            
                            newLineToPush.startX = nj1arrayLines[String(taskTag)][nji].startX
                            newLineToPush.startY = nj1arrayLines[String(taskTag)][nji].startY
                            newLineToPush.endX = nj1arrayLines[String(taskTag)][nji2].endX
                            newLineToPush.endY = nj1arrayLines[String(taskTag)][nji2].endY
                            newLineToPush.gradient = nj1arrayLines[String(taskTag)][nji2].gradient
                            newLineToPush.lineLength = Math.pow(Math.pow((newLineToPush.startX - newLineToPush.endX), 2) + Math.pow((newLineToPush.startY - newLineToPush.endY), 2), 0.5)
                        }
						
						 if (maxDistance == k2) {

                            
                            newLineToPush.startX = nj1arrayLines[String(taskTag)][nji2].startX
                            newLineToPush.startY = nj1arrayLines[String(taskTag)][nji2].startY
                            newLineToPush.endX = nj1arrayLines[String(taskTag)][nji].endX
                            newLineToPush.endY = nj1arrayLines[String(taskTag)][nji].endY
                            newLineToPush.gradient = nj1arrayLines[String(taskTag)][nji2].gradient
                            newLineToPush.lineLength = Math.pow(Math.pow((newLineToPush.startX - newLineToPush.endX), 2) + Math.pow((newLineToPush.startY - newLineToPush.endY), 2), 0.5)
                        }
						
						 //remove both lines
                    nj1arrayLines[String(taskTag)].splice(nji, 1)
                    nj1arrayLines[String(taskTag)].splice(nji2, 1)
					nj1arrayLines[String(taskTag)].push(newLineToPush)

                    }

                   


                }
				
			 if (same == false) {
				
				 
				  var k3 = Math.pow(Math.pow(nj1arrayLines[String(taskTag)][nji2].endY - nj1arrayLines[String(taskTag)][nji].endY, 2) + Math.pow(nj1arrayLines[String(taskTag)][nji2].endX - nj1arrayLines[String(taskTag)][nji].endX, 2), 0.5)

                    var k4 = Math.pow(Math.pow(nj1arrayLines[String(taskTag)][nji].startY - nj1arrayLines[String(taskTag)][nji2].startY, 2) + Math.pow(nj1arrayLines[String(taskTag)][nji].startX - nj1arrayLines[String(taskTag)][nji2].startX, 2), 0.5)
									
                    var maxDistance2 = Math.max(k3, k4)

                    if (nj1arrayLines[String(taskTag)][nji].lineLength + nj1arrayLines[String(taskTag)][nji2].lineLength > maxDistance2) {
                        
						var newLineToPush = {}
                        //if k1 is largest, insert that line
                        if (maxDistance2 == k3) {

                            
                            newLineToPush.startX = nj1arrayLines[String(taskTag)][nji].endX
                            newLineToPush.startY = nj1arrayLines[String(taskTag)][nji].endY
                            newLineToPush.endX = nj1arrayLines[String(taskTag)][nji2].endX
                            newLineToPush.endY = nj1arrayLines[String(taskTag)][nji2].endY
                            newLineToPush.gradient = nj1arrayLines[String(taskTag)][nji2].gradient
                            newLineToPush.lineLength = Math.pow(Math.pow((newLineToPush.startX - newLineToPush.endX), 2) + Math.pow((newLineToPush.startY - newLineToPush.endY), 2), 0.5)
                        }
						
						 if (maxDistance2 == k4) {

                            
                            newLineToPush.startX = nj1arrayLines[String(taskTag)][nji2].startX
                            newLineToPush.startY = nj1arrayLines[String(taskTag)][nji2].startY
                            newLineToPush.endX = nj1arrayLines[String(taskTag)][nji].startX
                            newLineToPush.endY = nj1arrayLines[String(taskTag)][nji].startY
                            newLineToPush.gradient = nj1arrayLines[String(taskTag)][nji2].gradient
                            newLineToPush.lineLength = Math.pow(Math.pow((newLineToPush.startX - newLineToPush.endX), 2) + Math.pow((newLineToPush.startY - newLineToPush.endY), 2), 0.5)
                        }
						
						 //remove both lines
                    nj1arrayLines[String(taskTag)].splice(nji, 1)
                    nj1arrayLines[String(taskTag)].splice(nji2, 1)
					nj1arrayLines[String(taskTag)].push(newLineToPush)

                    }
				 
			 
			 }

            }
        }
    }
}
			
			
		for (nji=0; nji<nj1arrayLines[String(taskTag)].length; nji++) 
{
	nj1arrayLines[String(taskTag)][nji].lineLength = Math.pow( Math.pow((nj1arrayLines[String(taskTag)][nji].startX - nj1arrayLines[String(taskTag)][nji].endX),2) +  Math.pow((nj1arrayLines[String(taskTag)][nji].startY - nj1arrayLines[String(taskTag)][nji].endY),2),0.5)}	
	
	NredrawLines (c)
	
		
		
	} else {
		c[nj1butNum].clearRect(0,0,1200,700)
		c[nj1butNum].beginPath();
		c[nj1butNum].moveTo(nj1startX,nj1startY);
		c[nj1butNum].lineWidth =nj1thickness
		c[nj1butNum].strokeStyle = nj1color
		c[nj1butNum].lineTo(nj1endX,nj1endY);
		c[nj1butNum].stroke();
	}
	
	
	
	removeListenerMove(a[nj1butNum], NdrawLineMove);
	
	try {
		if (typeof eval(taskTag + 'drawLineEnd') == 'function') {eval(taskTag + 'drawLineEnd(event);');}
	} 
	catch(err) {}
}

function NredrawLines (c)  {
		c[nj1butNum].clearRect(0,0,1200,700)
	
		for (var nj1i=0; nj1i<nj1arrayLines[String(taskTag)].length;nj1i++) {
			c[nj1butNum].beginPath();
			c[nj1butNum].moveTo(nj1arrayLines[String(taskTag)][nj1i].startX,nj1arrayLines[String(taskTag)][nj1i].startY);
			c[nj1butNum].lineCap = "round"
			c[nj1butNum].lineJoin = "round"
			c[nj1butNum].lineWidth =nj1thickness
			c[nj1butNum].strokeStyle = nj1color
			c[nj1butNum].lineTo(nj1arrayLines[String(taskTag)][nj1i].endX,nj1arrayLines[String(taskTag)][nj1i].endY);
			c[nj1butNum].stroke();
		}
	}
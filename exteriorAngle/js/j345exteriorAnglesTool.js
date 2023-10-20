// JavaScript Document
taskTag = "j345";
taskId = task.indexOf('j345exteriorAnglesTool');

initialiseTaskVariables();
backgroundLoadHandler[taskId] = function() {};
loadHandler[taskId] = function() {
	j345n = 5;
	j345radius = 200;
	j345center = [30+750/2,110+560/2];
	j345vertices = [];
	j345eccentricity = [];
	j345angle = [];
	j345extendPoints1 = [];
	j345extendPoints2 = [];
	j345cw = true;
	j345sel = -1;
	j345sliderDir1 = -1;
	j345sliderInt1;
	j345sliderAnim = false;	
	roundedRect(j345sliderButton1.ctx,3,3,49,49,4,6,'#000','#CCF');
	drawPath({
		ctx:j345sliderButton1.ctx,
		path:[[17,15],[17,40],[38,27.5]],
		lineColor:'#000',
		fillColor:'#000',
		lineWidth:2
	});
	j345button2.ctx.clearRect(0,0,55,55);
	roundedRect(j345button2.ctx,3,3,49,49,4,6,'#000','#FCF');
	j345button2.ctx.beginPath();
	j345button2.ctx.lineWidth = 3;
	j345button2.ctx.strokeStyle = '#000';
	j345button2.ctx.moveTo(27.5+13,27.5);
	j345button2.ctx.arc(27.5,27.5,13,0,2*Math.PI);
	j345button2.ctx.stroke();
	drawArrow({context:j345button2.ctx,startX:0,finX:31.5,startY:27.5-13,finY:27.5-13,showLine:false,fillArrow:false,arrowLength:10,lineWidth:3});
	drawArrow({context:j345button2.ctx,startX:55,finX:23.5,startY:27.5+13,finY:27.5+13,showLine:false,fillArrow:false,arrowLength:10,lineWidth:3});
	j345endWalkAnim();
	clearCorrectingInterval(j345sliderInt1);
	j345resetVertices();
	j345redraw();
};

var j345canvas1 = createButton(0,0,0,1200,700,true,false,true,2);
var j345canvas2 = createButton(1,0,0,1200,700,true,false,false,2);
var j345canvas5 = createButton(2,0,0,1200,700,true,false,false,2);
var j345canvas3 = createButton(2,0,0,1200,700,true,false,false,2);
var j345canvas4 = createButton(2,0,0,1200,700,true,false,false,2);

var j345canvasA = createButton(2,0,0,1200,700,true,false,false,2);
var j345canvasB = createButton(2,0,0,1200,700,true,false,false,2);
var j345canvasC = createButton(2,0,0,1200,700,true,false,false,2);
var j345canvasD = createButton(2,0,0,1200,700,true,false,false,2);


roundedRect(j345canvas2.ctx,30,110,750,560,4,6,'#000');

var j345n = 5;
var j345radius = 200;
var j345center = [30+750/2,110+560/2];
var j345vertices = [];
var j345eccentricity = [];
var j345angle = [];
var j345extendPoints1 = [];
var j345extendPoints2 = [];
var j345cw = true;
var j345sel = -1;
var j345sliderDir1 = -1;
var j345sliderInt1;
var j345sliderAnim = false;
var j345sliderButton1 = createButton(3,798,308,55,55,true,false,true,3);
roundedRect(j345sliderButton1.ctx,3,3,49,49,4,6,'#000','#CCF');
drawPath({
	ctx:j345sliderButton1.ctx,
	path:[[17,15],[17,40],[38,27.5]],
	lineColor:'#000',
	fillColor:'#000',
	lineWidth:2
});

var j345walkStage = 0;
var j345walkVertex = 0;
var j345walkPauseCount = 0;
var j345walkPauseLength = 1000;
var j345walkAngle = 0;
var j345walkAngleAtVertex;
var j345walkTotalAngle;
var j345walkLength = 0;
var j345walkPos;
var j345walkArrowPos;
var j345sideLength;
var j345walkInt1;
var j345walkAnim = false;
var j345walkAnimPaused = false;

text({
	ctx:j345canvas2.ctx,
	textArray:['<<font:smileyMonster>><<fontSize:32>>Exterior Angles'],
	left:800,
	top:110,
	width:370,
	height:100,
	textAlign:'center'
});

roundedRect(j345canvasA.ctx,800,170,370,120,4,6,'#000','#FCC');
text({
	ctx:j345canvasA.ctx,
	textArray:['<<fontSize:24>><<align:center>>Number of sides of polygon'],
	left:800,
	top:180,
	width:370,
	height:60,
});
var j345slider1 = createSlider({
	id:0,
	left:825,
	top:220,
	width:320,
	height:60,
	vari:'n',
	linkedVar:'j345n',
	varChangeListener:'j345nChange',
	min:3,
	max:12,
	startNum:5,
	discrete:true,
	label:false,
	handleColor:'#F00'
});

roundedRect(j345canvasB.ctx,800,310,370,120,4,6,'#000','#CCF');
text({
	ctx:j345canvasB.ctx,
	textArray:['<<fontSize:24>><<align:right>>Shrink/grow polygon'],
	left:800,
	top:320,
	width:350,
	height:60
});
var j345slider2 = createSlider({
	id:1,
	left:825,
	top:370,
	width:320,
	height:60,
	vari:'r',
	linkedVar:'j345radius',
	varChangeListener:'j345rChange',
	min:0.1,
	max:200,
	startNum:200,
	label:false
});

var j345button1 = createButton(4,798,448,55,55,true,false,true,3);
roundedRect(j345button1.ctx,3,3,49,49,4,6,'#000','#CFC');
drawPath({
	ctx:j345button1.ctx,
	path:[[17,15],[17,40],[38,27.5]],
	lineColor:'#000',
	fillColor:'#000',
	lineWidth:2
});
var j345button3 = createButton(4,851,448,55,55,false,false,true,3);
roundedRect(j345button3.ctx,3,3,49,49,4,6,'#000','#CFC');
drawPath({
	ctx:j345button3.ctx,
	path:[[18,18],[18,37],[37,37],[37,18],[18,18]],
	lineColor:'#000',
	fillColor:'#000',
	lineWidth:2
});
roundedRect(j345canvasC.ctx,800,450,370,50,4,6,'#000','#CFC');
text({
	ctx:j345canvasC.ctx,
	textArray:['<<fontSize:24>><<align:right>>Walk around polygon'],
	left:855,
	top:460,
	width:295,
	height:60
});

var j345button2 = createButton(4,798,518,55,55,true,false,true,3);
roundedRect(j345button2.ctx,3,3,49,49,4,6,'#000','#FCF');
j345button2.ctx.beginPath();
j345button2.ctx.lineWidth = 3;
j345button2.ctx.strokeStyle = '#000';
j345button2.ctx.moveTo(27.5+13,27.5);
j345button2.ctx.arc(27.5,27.5,13,0,2*Math.PI);
j345button2.ctx.stroke();
drawArrow({context:j345button2.ctx,startX:0,finX:31.5,startY:27.5-13,finY:27.5-13,showLine:false,fillArrow:false,arrowLength:10,lineWidth:3});
drawArrow({context:j345button2.ctx,startX:55,finX:23.5,startY:27.5+13,finY:27.5+13,showLine:false,fillArrow:false,arrowLength:10,lineWidth:3});
roundedRect(j345canvasD.ctx,800,520,370,50,4,6,'#000','#FCF');
text({
	ctx:j345canvasD.ctx,
	textArray:['<<fontSize:24>><<align:right>>Clockwise/Anti-clockwise'],
	left:855,
	top:530,
	width:295,
	height:60
});

text({
	ctx:j345canvas2.ctx,
	textArray:['<<fontSize:24>><<align:center>>You can drag vertices to move them when visible.'],
	left:800,
	top:590,
	width:370,
	height:60
});

addListener(j345button1,function() {
	if (j345walkAnim == false) { 
		j345startWalkAnim();
	} else {
		j345walkAnimPaused = !j345walkAnimPaused;
		if (j345walkAnimPaused == true) {
			clearCorrectingInterval(j345walkInt1);
			j345button1.ctx.clearRect(0,0,55,55);
			roundedRect(j345button1.ctx,3,3,49,49,4,6,'#000','#CFC');
			drawPath({
				ctx:j345button1.ctx,
				path:[[17,15],[17,40],[38,27.5]],
				lineColor:'#000',
				fillColor:'#000',
				lineWidth:2
			});	
		} else {
			j345walkInt1 = setCorrectingInterval(j345walkAnimation, 5);
			j345button1.ctx.clearRect(0,0,55,55);
			roundedRect(j345button1.ctx,3,3,49,49,4,6,'#000','#CFC');
			j345button1.ctx.fillStyle = '#000';
			j345button1.ctx.fillRect(15,15,10,25);
			j345button1.ctx.fillRect(30,15,10,25);
		}
		
	}
});

addListener(j345button3,function() {
	j345endWalkAnim();
});

function j345startWalkAnim() {
	j345walkAnim = true;
	j345walkInt1 = setCorrectingInterval(j345walkAnimation, 5);
	j345redraw();
	j345walkStage = 0;
	j345walkVertex = 0;
	j345walkPos = j345vertices[0];
	j345walkTotalAngle = 0;
	j345walkAngle = 0;
	j345walkLength = 0;
	if (j345cw == true) {
		j345walkArrowPos = interpolateTwoPoints(j345walkPos,j345extendPoints1[j345extendPoints1.length-1],100/60);
	} else {		
		j345walkArrowPos = interpolateTwoPoints(j345walkPos,j345extendPoints2[0],100/60);
	}
	var ctx1 = j345canvas4.ctx;
	ctx1.clearRect(0,0,1200,700);	
	drawArrow({ctx:ctx1,startX:j345walkPos[0],startY:j345walkPos[1],finX:j345walkArrowPos[0],finY:j345walkArrowPos[1],color:'#6C6',lineWidth:6,fillArrow:true,arrowLength:18});
	ctx1.beginPath();
	ctx1.fillStyle = '#6C6';
	ctx1.strokeStyle = '#000';
	ctx1.lineWidth = 2;
	ctx1.moveTo(j345walkPos[0]+10,j345walkPos[1]);
	ctx1.arc(j345walkPos[0],j345walkPos[1],10,0,2*Math.PI);
	ctx1.fill();
	ctx1.stroke();
	text({
		ctx:j345canvas5.ctx,
		left:40,
		top:600,
		width:290,
		height:60,
		textArray:['<<fontSize:32>><<align:center>>Angle turned: 0'+degrees],
		box:{type:'loose',color:'#CFC',radius:4,borderWidth:4}
	});	
	showObj(j345button3,j345button3.data);
	j345button1.ctx.clearRect(0,0,55,55);
	roundedRect(j345button1.ctx,3,3,49,49,4,6,'#000','#CFC');
	j345button1.ctx.fillStyle = '#000';
	j345button1.ctx.fillRect(15,15,10,25);
	j345button1.ctx.fillRect(30,15,10,25);
	
	j345button2.style.pointerEvents = 'none';
	j345button2.style.opacity = 0.3;
	j345canvasA.style.opacity = 0.3;
	j345canvasB.style.opacity = 0.3;	
	j345canvasD.style.opacity = 0.3;		
	j345sliderButton1.style.pointerEvents = 'none';
	j345sliderButton1.style.opacity = 0.3;
	j345slider1.backCanvas.style.pointerEvents = 'none';
	j345slider1.backCanvas.style.opacity = 0.3;	
	j345slider1.sliderCanvas.style.pointerEvents = 'none';
	j345slider1.sliderCanvas.style.opacity = 0.3;	
	j345slider2.backCanvas.style.pointerEvents = 'none';
	j345slider2.backCanvas.style.opacity = 0.3;	
	j345slider2.sliderCanvas.style.pointerEvents = 'none';
	j345slider2.sliderCanvas.style.opacity = 0.3;		
}

function j345endWalkAnim(delay) {
	clearCorrectingInterval(j345walkInt1);
	j345walkAngleAtVertex = undefined;
	j345sideLength = undefined;
	hideObj(j345button3,j345button3.data);
	if (typeof delay !== 'number') delay = 0;
	setTimeout(function() {
		j345walkAnim = false;
		j345canvas3.ctx.clearRect(0,0,1200,700);
		j345canvas4.ctx.clearRect(0,0,1200,700);
		j345canvas5.ctx.clearRect(0,0,1200,700);
		j345button1.ctx.clearRect(0,0,55,55);
		roundedRect(j345button1.ctx,3,3,49,49,4,6,'#000','#CFC');
		drawPath({
			ctx:j345button1.ctx,
			path:[[17,15],[17,40],[38,27.5]],
			lineColor:'#000',
			fillColor:'#000',
			lineWidth:2
		});	
		j345redraw();
		
		j345button2.style.pointerEvents = 'auto';
		j345button2.style.opacity = 1;
		j345canvasA.style.opacity = 1;
		j345canvasB.style.opacity = 1;	
		j345canvasD.style.opacity = 1;		
		j345sliderButton1.style.pointerEvents = 'auto';
		j345sliderButton1.style.opacity = 1;
		j345slider1.backCanvas.style.pointerEvents = 'auto';
		j345slider1.backCanvas.style.opacity = 1;	
		j345slider1.sliderCanvas.style.pointerEvents = 'auto';
		j345slider1.sliderCanvas.style.opacity = 1;	
		j345slider2.backCanvas.style.pointerEvents = 'auto';
		j345slider2.backCanvas.style.opacity = 1;	
		j345slider2.sliderCanvas.style.pointerEvents = 'auto';
		j345slider2.sliderCanvas.style.opacity = 1;		
		
	},delay);
}

function j345walkAnimation() {
	switch (j345walkStage) {
		case 0:
		case 2:
			if (j345walkPauseCount < j345walkPauseLength) {
				j345walkPauseCount += 10;
			} else {
				j345walkPauseCount = 0;
				j345walkStage++;
			}
			return;
		case 1:
			j345canvas3.ctx.clearRect(0,0,1200,700);
			if (typeof j345walkAngleAtVertex == 'undefined') {
				if (j345cw == true) {
					if (j345walkVertex > 0) {
						j345walkAngleAtVertex = measureAngle({a:j345extendPoints1[j345walkVertex-1],b:j345vertices[j345walkVertex],c:j345extendPoints1[j345walkVertex]});
						j345vertexStartAngle = getAngleTwoPoints(j345vertices[j345walkVertex-1],j345vertices[j345walkVertex]);
					} else {
						j345walkAngleAtVertex = measureAngle({a:j345extendPoints1[j345extendPoints1.length-1],b:j345vertices[j345walkVertex],c:j345extendPoints1[j345walkVertex]});
						j345vertexStartAngle = getAngleTwoPoints(j345vertices[j345vertices.length-1],j345vertices[0]);
					}
				} else {
					if (j345walkVertex == 0) {
						j345walkAngleAtVertex = measureAngle({a:j345extendPoints2[j345extendPoints2.length-1],b:j345vertices[0],c:j345extendPoints2[0]});
						j345vertexStartAngle = getAngleTwoPoints(j345vertices[1],j345vertices[0]);
					} else {
						j345walkAngleAtVertex = measureAngle({a:j345extendPoints2[j345walkVertex-1],b:j345vertices[j345walkVertex],c:j345extendPoints2[j345walkVertex]});
						if (j345walkVertex < j345n-1) {
							j345vertexStartAngle = getAngleTwoPoints(j345vertices[j345walkVertex+1],j345vertices[j345walkVertex]);
						} else {
							j345vertexStartAngle = getAngleTwoPoints(j345vertices[0],j345vertices[j345walkVertex]);
						}
					}					
				}
			}
			j345walkAngle += 0.005;
			j345walkTotalAngle += 0.005;
			if (j345walkAngle < j345walkAngleAtVertex) {
				if (j345cw == true) {
					j345walkArrowPos = [j345walkPos[0]+100*Math.cos(j345vertexStartAngle+j345walkAngle),j345walkPos[1]+100*Math.sin(j345vertexStartAngle+j345walkAngle)];
					if (j345walkVertex > 0) {
						drawAngle({ctx:j345canvas3.ctx,a:j345extendPoints1[j345walkVertex-1],b:j345vertices[j345walkVertex],c:j345walkArrowPos,fill:true,fillColor:'#6C6',squareForRight:false});
					} else {
						drawAngle({ctx:j345canvas3.ctx,a:j345extendPoints1[j345extendPoints1.length-1],b:j345vertices[j345walkVertex],c:j345walkArrowPos,fill:true,fillColor:'#6C6',squareForRight:false});
					}
				} else {
					j345walkArrowPos = [j345walkPos[0]+100*Math.cos(j345vertexStartAngle-j345walkAngle),j345walkPos[1]+100*Math.sin(j345vertexStartAngle-j345walkAngle)];
					drawAngle({ctx:j345canvas3.ctx,c:j345extendPoints2[j345walkVertex],b:j345vertices[j345walkVertex],a:j345walkArrowPos,fill:true,fillColor:'#6C6',squareForRight:false});
				}
			} else {
				j345walkTotalAngle -= (j345walkAngle - j345walkAngleAtVertex);
				j345walkAngleAtVertex = undefined;
				j345vertexStartAngle = 0;
				j345walkAngle = 0;
				j345walkStage++;
				if (j345cw == true) {
					if (j345walkVertex > 0) {
						drawAngle({ctx:j345canvas5.ctx,a:j345extendPoints1[j345walkVertex-1],b:j345vertices[j345walkVertex],c:j345walkArrowPos,fill:true,fillColor:'#6C6',squareForRight:false});
					} else {
						drawAngle({ctx:j345canvas5.ctx,a:j345extendPoints1[j345extendPoints1.length-1],b:j345vertices[j345walkVertex],c:j345walkArrowPos,fill:true,fillColor:'#6C6',squareForRight:false});
					}
				} else {
					if (j345walkVertex == 0) {
						drawAngle({ctx:j345canvas5.ctx,c:j345extendPoints2[0],b:j345vertices[j345walkVertex],a:j345walkArrowPos,fill:true,fillColor:'#6C6',squareForRight:false});
					} else {
						drawAngle({ctx:j345canvas5.ctx,c:j345extendPoints2[j345walkVertex],b:j345vertices[j345walkVertex],a:j345walkArrowPos,fill:true,fillColor:'#6C6',squareForRight:false});
					}
				}
			}
			var angle = Math.round(180*j345walkTotalAngle/Math.PI);
			text({
				ctx:j345canvas5.ctx,
				left:40,
				top:600,
				width:290,
				height:60,
				textArray:['<<fontSize:32>><<align:center>>Angle turned: '+angle+degrees],
				box:{type:'loose',color:'#CFC',radius:4,borderWidth:4}
			});

			break;
		case 3:
			if (typeof j345sideLength == 'undefined') {
				if (j345cw == true) {
					if (j345walkVertex < j345vertices.length - 1) {
						j345sideLength = dist(j345vertices[j345walkVertex][0],j345vertices[j345walkVertex][1],j345vertices[j345walkVertex+1][0],j345vertices[j345walkVertex+1][1]);
					} else {
						j345sideLength = dist(j345vertices[j345walkVertex][0],j345vertices[j345walkVertex][1],j345vertices[0][0],j345vertices[0][1]);
					}
				} else {
					if (j345walkVertex == 0) {
						j345sideLength = dist(j345vertices[0][0],j345vertices[0][1],j345vertices[j345vertices.length-1][0],j345vertices[j345vertices.length-1][1]);
					} else {
						j345sideLength = dist(j345vertices[j345walkVertex][0],j345vertices[j345walkVertex][1],j345vertices[j345walkVertex-1][0],j345vertices[j345walkVertex-1][1]);
					}					
				}
			}
			j345walkLength += 1;
			if (j345walkLength < j345sideLength) {
				if (j345cw == true) {
					if (j345walkVertex < j345vertices.length - 1) {
						j345walkPos = interpolateTwoPoints(j345vertices[j345walkVertex],j345vertices[j345walkVertex+1],j345walkLength/j345sideLength);
					} else {
						j345walkPos = interpolateTwoPoints(j345vertices[j345walkVertex],j345vertices[0],j345walkLength/j345sideLength);
					}
					j345walkArrowPos = interpolateTwoPoints(j345walkPos,j345extendPoints1[j345walkVertex],100/(j345sideLength-j345walkLength+60));		
				} else {
					if (j345walkVertex == 0) {
						j345walkPos = interpolateTwoPoints(j345vertices[0],j345vertices[j345vertices.length-1],j345walkLength/j345sideLength);
						j345walkArrowPos = interpolateTwoPoints(j345walkPos,j345extendPoints2[j345extendPoints2.length-1],100/(j345sideLength-j345walkLength+60));
					} else {
						j345walkPos = interpolateTwoPoints(j345vertices[j345walkVertex],j345vertices[j345walkVertex-1],j345walkLength/j345sideLength);
						j345walkArrowPos = interpolateTwoPoints(j345walkPos,j345extendPoints2[j345walkVertex-1],100/(j345sideLength-j345walkLength+60));
					}
				}
			} else {
				j345sideLength = undefined;
				j345walkLength = 0;
				j345walkStage = 0;
				if (j345cw == true) {
					if (j345walkVertex < j345vertices.length - 1) {
						j345walkPos = j345vertices[j345walkVertex+1];
						j345walkArrowPos = interpolateTwoPoints(j345walkPos,j345extendPoints1[j345walkVertex],100/60);
						j345walkVertex++;
					} else {
						j345walkPos = j345vertices[0];
						j345walkArrowPos = interpolateTwoPoints(j345walkPos,j345extendPoints1[j345walkVertex],100/60);
						j345walkVertex = 0;
						j345endWalkAnim(1500);
					}
				} else {
					if (j345walkVertex == 0) {
						j345walkPos = j345vertices[j345vertices.length-1];
						j345walkVertex = j345vertices.length-1;
						j345walkArrowPos = interpolateTwoPoints(j345walkPos,j345extendPoints2[j345walkVertex],100/60);
					} else if (j345walkVertex > 1) {
						j345walkPos = j345vertices[j345walkVertex-1];
						j345walkVertex--;
						j345walkArrowPos = interpolateTwoPoints(j345walkPos,j345extendPoints2[j345walkVertex],100/60);
					} else {
						j345walkPos = j345vertices[0];
						j345walkVertex = 0;
						j345walkArrowPos = interpolateTwoPoints(j345walkPos,j345extendPoints2[j345walkVertex],100/60);
						j345endWalkAnim(1500);

					}
				}
			}
			break;
			
	};
	var ctx1 = j345canvas4.ctx;
	ctx1.clearRect(0,0,1200,700);
	drawArrow({ctx:ctx1,startX:j345walkPos[0],startY:j345walkPos[1],finX:j345walkArrowPos[0],finY:j345walkArrowPos[1],color:'#6C6',lineWidth:6,fillArrow:true,arrowLength:18});
	ctx1.beginPath();
	ctx1.fillStyle = '#6C6';
	ctx1.strokeStyle = '#000';
	ctx1.lineWidth = 2;
	ctx1.moveTo(j345walkPos[0]+10,j345walkPos[1]);
	ctx1.arc(j345walkPos[0],j345walkPos[1],10,0,2*Math.PI);
	ctx1.fill();
	ctx1.stroke();
}

addListener(j345button2,function(e) {
	j345cw = !j345cw;
	j345redraw();
	j345button2.ctx.clearRect(0,0,55,55);
	roundedRect(j345button2.ctx,3,3,49,49,4,6,'#000','#FCF');
	j345button2.ctx.beginPath();
	j345button2.ctx.lineWidth = 3;
	j345button2.ctx.strokeStyle = '#000';
	j345button2.ctx.moveTo(27.5+13,27.5);
	j345button2.ctx.arc(27.5,27.5,13,0,2*Math.PI);
	j345button2.ctx.stroke();
	if (j345cw == true) {
		drawArrow({context:j345button2.ctx,startX:0,finX:31.5,startY:27.5-13,finY:27.5-13,showLine:false,fillArrow:false,arrowLength:10,lineWidth:3});
		drawArrow({context:j345button2.ctx,startX:55,finX:23.5,startY:27.5+13,finY:27.5+13,showLine:false,fillArrow:false,arrowLength:10,lineWidth:3});
	} else {
		drawArrow({context:j345button2.ctx,startX:55,finX:23.5,startY:27.5-13,finY:27.5-13,showLine:false,fillArrow:false,arrowLength:10,lineWidth:3});
		drawArrow({context:j345button2.ctx,startX:0,finX:31.5,startY:27.5+13,finY:27.5+13,showLine:false,fillArrow:false,arrowLength:10,lineWidth:3});
	}
});

j345resetVertices();
j345redraw();

addListenerMove(j345canvas1,function(e) {
	if (j345radius < 60 || j345sliderAnim == true || j345walkAnim == true) return;
	if (e.touches) {
		var x = e.touches[0].pageX; 
		var y = e.touches[0].pageY;
	} else {
		var x = e.clientX || e.pageX;
		var y = e.clientY || e.pageY;
	}
	mouse.x = xWindowToCanvas(x);
	mouse.y = yWindowToCanvas(y);

	if (j345sel == -1) {
		for (var i = 0; i < j345n; i++) {
			if (dist(mouse.x,mouse.y,j345vertices[i][0],j345vertices[i][1]) < 20) {
				j345canvas1.style.cursor = 'url("../images/cursors/openhand.cur"), auto';
				return;
			}
			j345canvas1.style.cursor = 'default';
		}
	} else {
		if (mouseHitRect(30,110,750,560) == false) return;
		var posA = [j345sel-2,j345sel-1,j345sel,j345sel+1,j345sel+2];
		var posB = [];
		for (var i = 0; i < posA.length; i++) {
			while (posA[i] < 0) {posA[i] += j345n};
			while (posA[i] > j345n-1) {posA[i] -= j345n};
			posB[i] = j345vertices[posA[i]];
		}
		if (measureAngle({a:posB[0],b:posB[1],c:[mouse.x,mouse.y]}) < Math.PI || measureAngle({a:posB[1],c:posB[3],b:[mouse.x,mouse.y]}) < Math.PI || measureAngle({c:posB[4],b:posB[3],a:[mouse.x,mouse.y]}) < Math.PI) {
			return;
		}
		
		j345vertices[j345sel] = [mouse.x,mouse.y];
		j345angle[j345sel] = getAngleTwoPoints(j345center,j345vertices[j345sel]);
		j345eccentricity[j345sel] = dist(j345center[0],j345center[1],j345vertices[j345sel][0],j345vertices[j345sel][1]) / j345radius;
		j345calcExtendPoints();
		j345redraw();
	}
});

addListenerStart(j345canvas1,function(e) {
	if (j345radius < 60 || j345sliderAnim == true || j345walkAnim == true) return;
	if (e.touches) {
		var x = e.touches[0].pageX; 
		var y = e.touches[0].pageY;
	} else {
		var x = e.clientX || e.pageX;
		var y = e.clientY || e.pageY;
	}
	mouse.x = xWindowToCanvas(x);
	mouse.y = yWindowToCanvas(y);

	var closest = -1;
	var closestDist;
	for (var i = 0; i < j345n; i++) {
		var distance = dist(mouse.x,mouse.y,j345vertices[i][0],j345vertices[i][1]);
		if (distance <= 20) {
			if (closest == -1 || distance < closestDist) {
				closest = i;
				closestDist = distance;
			}
		}
		
	}
	if (closest > -1) {
		j345sel = closest;
		j345canvas1.style.cursor = 'url("../images/cursors/closedhand.cur"), auto';
	}
});

addListenerEnd(window,function(e) {
	j345sel = -1;
	j345canvas1.style.cursor = 'default';
});

addListener(j345sliderButton1,function() {
	j345sliderAnim = !j345sliderAnim;
	if (j345sliderAnim == true) {
		j345sliderInt1 = setCorrectingInterval(j345sliderAnimation, 10);
		j345sliderButton1.ctx.clearRect(0,0,55,55);
		roundedRect(j345sliderButton1.ctx,3,3,49,49,4,6,'#000','#CCF');
		j345sliderButton1.ctx.fillStyle = '#000';
		j345sliderButton1.ctx.fillRect(15,15,10,25);
		j345sliderButton1.ctx.fillRect(30,15,10,25);
		
		j345button1.style.pointerEvents = 'none';
		j345button1.style.opacity = 0.3;
		j345button3.style.pointerEvents = 'none';
		j345button3.style.opacity = 0.3;
		j345canvasC.style.opacity = 0.3;
		j345slider2.backCanvas.style.pointerEvents = 'none';
		j345slider2.sliderCanvas.style.pointerEvents = 'none';
	} else {
		clearCorrectingInterval(j345sliderInt1);
		j345sliderButton1.ctx.clearRect(0,0,55,55);
		roundedRect(j345sliderButton1.ctx,3,3,49,49,4,6,'#000','#CCF');
		drawPath({
			ctx:j345sliderButton1.ctx,
			path:[[17,15],[17,40],[38,27.5]],
			lineColor:'#000',
			fillColor:'#000',
			lineWidth:2
		});
		j345redraw();
		j345button1.style.pointerEvents = 'auto';
		j345button1.style.opacity = 1;	
		j345button3.style.pointerEvents = 'auto';
		j345button3.style.opacity = 1;
		j345canvasC.style.opacity = 1;	
		j345slider2.backCanvas.style.pointerEvents = 'auto';
		j345slider2.sliderCanvas.style.pointerEvents = 'auto';		
	}
});

function j345sliderAnimation() {
	if (j345sliderDir1 == 1) {
		if (j345radius + 0.75 >= j345slider2.max) {
			j345radius = j345slider2.max;
			j345sliderDir1 = -1;
		} else {
			j345radius += 0.75;
		}
		setSliderValue(j345slider2,j345radius);
	} else {
		if (j345radius - 0.75 <= j345slider2.min) {
			j345radius = j345slider2.min;
			j345sliderDir1 = 1;
		} else {
			j345radius -= 0.75;
		}
		setSliderValue(j345slider2,j345radius);		
	}
}


function j345nChange() {
	j345resetVertices();
	j345redraw();		
}

function j345rChange() {
	for (var n = 0; n < j345n; n++) {
		j345vertices[n] = [j345center[0]+j345eccentricity[n]*j345radius*Math.cos(j345angle[n]),j345center[1]+j345eccentricity[n]*j345radius*Math.sin(j345angle[n])];
	}
	j345calcExtendPoints();
	j345redraw();
}

function j345resetVertices() {
	j345vertices = [];
	j345eccentricity = [];
	j345angle = [];
	for (var n = 0; n < j345n; n++) {
		var angle = -Math.PI/2+n*(2*Math.PI)/j345n;
		j345angle.push(angle);
		j345vertices.push([j345center[0]+j345radius*Math.cos(angle),j345center[1]+j345radius*Math.sin(angle)]);
		j345eccentricity.push(1);
	}
	j345calcExtendPoints();
}

function j345calcExtendPoints() {
	j345extendPoints1 = [];
	j345extendPoints2 = [];		
	for (var n = 0; n < j345n; n++) {
		if (n < j345n-1) {
			j345extendPoints1[n] = extendLine(j345vertices[n],j345vertices[n+1],60);
		} else {
			j345extendPoints1[n] = extendLine(j345vertices[j345vertices.length-1],j345vertices[0],60);
		}
		if (n < j345n-1) {
			j345extendPoints2[n] = extendLine(j345vertices[n+1],j345vertices[n],60);
		} else {
			j345extendPoints2[n] = extendLine(j345vertices[0],j345vertices[j345vertices.length-1],60);
		}		
	}
	
}

function j345redraw() {
	var ctx = j345canvas1.ctx;
	ctx.clearRect(0,0,1200,700);
	
	if (j345cw == true) {
		drawAngle({ctx:ctx,a:j345extendPoints1[j345extendPoints1.length-1],b:j345vertices[0],c:j345extendPoints1[0],fill:true,fillColor:colorA('#FCF',0.75),squareForRight:false});
		for (var n = 1; n < j345n; n++) {
			drawAngle({ctx:ctx,a:j345extendPoints1[n-1],b:j345vertices[n],c:j345extendPoints1[n],fill:true,fillColor:colorA('#FCF',0.75),squareForRight:false});
		}
	} else {
		drawAngle({ctx:ctx,a:j345extendPoints2[j345extendPoints1.length-1],b:j345vertices[0],c:j345extendPoints2[0],fill:true,fillColor:colorA('#FCF',0.75),squareForRight:false});
		for (var n = 1; n < j345n; n++) {
			drawAngle({ctx:ctx,a:j345extendPoints2[n-1],b:j345vertices[n],c:j345extendPoints2[n],fill:true,fillColor:colorA('#FCF',0.75),squareForRight:false});
		}
	}

	ctx.strokeStyle = '#000';
	ctx.fillStyle = '#000';
	ctx.lineWidth = 4;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	
	for (var n = 0; n < j345n; n++) {
		ctx.beginPath();
		ctx.moveTo(j345vertices[n][0],j345vertices[n][1]);
		if (j345cw == true) {
			ctx.lineTo(j345extendPoints1[n][0],j345extendPoints1[n][1]);
		} else if (n == 0) {
			ctx.lineTo(j345extendPoints2[j345extendPoints2.length-1][0],j345extendPoints2[j345extendPoints2.length-1][1]);			
		} else {
			ctx.lineTo(j345extendPoints2[n-1][0],j345extendPoints2[n-1][1]);			
		}
		ctx.stroke();
		if (j345radius > 60 && j345sliderAnim == false && j345walkAnim == false) {
			ctx.beginPath();
			ctx.moveTo(j345vertices[n][0],j345vertices[n][1]);
			ctx.arc(j345vertices[n][0],j345vertices[n][1],8,0,2*Math.PI);
			ctx.fill();		
		}
	}
}
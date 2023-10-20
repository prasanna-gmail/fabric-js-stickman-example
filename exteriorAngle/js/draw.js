/*
zIndexes:
n = num of drawCanvases
drawCanvas[i] 10+2*i
path[i].mathsInputs 10+2*i+1
toolsCanvas 10+2*n
cursorCanvas 10+2*n+1
*/
function boolean(testVar, def) {
	if (typeof testVar == 'boolean') {
		return testVar;
	} else {
		return def;
	}
}
var pathCanvasMode = false;
function addDrawTools(object) {
	var zIndex = object.zIndex || 10;
	if (typeof object.protractor !== 'undefined' || typeof object.compass !== 'undefined' || typeof object.ruler !== 'undefined') {
		var retainCursorCanvas = true;
	} else {
		var retainCursorCanvas = boolean(object.retainCursorCanvas,false); // if false, hides the cursorCanvas when mode is 'select'
	}
	if (typeof draw[taskId] == 'undefined') {
		var color = object.color || '#000';
		var thickness = object.thickness || 1;
		var fillColor = object.fillColor || 'none';
		var buttonSize = object.buttonSize || 55;
		var buttonColor = object.buttonColor || '#C9F';
		var buttonSelectedColor = object.buttonSelectedColor || '#FFC';
		var defaultMode = object.defaultMode || object.drawMode || 'none';
		var drawMode = object.drawMode || object.defaultMode;
		var drawArea = object.drawArea || [0,0,mainCanvasWidth,mainCanvasHeight];
		var drawRelPos = object.drawRelPos || [0,0];
		var snapLinesTogether = boolean(object.snapLinesTogether, false);
		var gridSnap = boolean(object.gridSnap, false);
		var gridSnapSize = object.gridSnapSize || 15;
		var gridSnapRect = object.gridSnapRect || [0,0,1200,700];
		var gridMargin = object.gridMargin || [0,0,0,0];
		var selectTolerance = object.selectTolerance || 20;
		var selectColor = object.selectColor || '#33F';
		var selectPadding = object.selectPadding || 20;	
		if (typeof object.maxLines == 'number') {
			var maxLines = object.maxLines;
		} else {
			var maxLines = 10000;
		}
		var snap = boolean(object.snap,true);
		var snapTolerance = object.snapTolerance || 25;	
		var path = object.path || [];	
		var qBoxBorder = object.qBoxBorder || {type:'auto',borderWidth:5,borderColor:'#000',borderDash:[],borderRounding:8,fillColor:'none'};		
		var qBox2Border = object.qBox2Border || qBoxBorder;		
		var drawCanvas = [createCanvas(drawArea[0]+drawRelPos[0],drawArea[1]+drawRelPos[1],drawArea[2],drawArea[3],true,false,false,zIndex),createCanvas(drawArea[0],drawArea[1],drawArea[2],drawArea[3],true,false,false,zIndex+2)];
		var drawCanvas2 = [createCanvas(drawArea[0]+drawRelPos[0],drawArea[1]+drawRelPos[1],drawArea[2],drawArea[3],true,false,false,zIndex),createCanvas(drawArea[0],drawArea[1],drawArea[2],drawArea[3],true,false,false,zIndex+2)];		
		zIndex += 4;
		var toolsCanvas = createCanvas(drawArea[0]+drawRelPos[0],drawArea[1]+drawRelPos[1],drawArea[2],drawArea[3],true,false,false,zIndex);
		zIndex++;
		var cursorCanvas = createCanvas(drawArea[0]+drawRelPos[0],drawArea[1]+drawRelPos[1],drawArea[2],drawArea[3],true,false,true,zIndex);	
		zIndex++;
		var hiddenCanvas = createCanvas(0,0,50,50,false,false,false,0); // for drawing cursors on
		var flattenMode = boolean(object.flattenMode,false); // flatten everything as much as possible (good for scrolling)
		pathCanvasMode = boolean(object.pathCanvasMode,false);
		highlightCursorPositions = boolean(object.highlightCursorPositions,false);
		draw[taskId] = {
			zIndex:zIndex,
			drawButtonZIndex:zIndex+1000000,
			drawCanvas:drawCanvas, // moves when things are dragged
			drawCanvas2:drawCanvas2, // does not move
			hiddenCanvas:hiddenCanvas,
			toolsCanvas:toolsCanvas,
			toolsctx:toolsCanvas.getContext('2d'),
			toolOrder:['compass','protractor','ruler'], // first is front-most
			drawArcCenter:boolean(object.drawArcCenter,false),
			buttons:[],
			flattenMode:flattenMode,
			drawMode:drawMode,
			defaultMode:defaultMode,
			startDrawMode:drawMode,
			prevDrawMode:'none',
			drawing:false,
			drawArea:drawArea,
			drawRelPos:drawRelPos,
			maxLines:maxLines,
			snapPoints:[],
			showSnapPoints:false,
			snap:true,
			snapTolerance:snapTolerance,
			path:path.slice(0),
			startPath:path.slice(0),
			protractorVisible:false,
			compassVisible:false,
			rulerVisible:false,
			compassHelpVisible:false,
			color:color,
			startColor:color,
			thickness:thickness,
			startThickness:thickness,
			fillColor:fillColor,
			startFillColor:fillColor,
			buttonSize:buttonSize,
			buttonColor:buttonColor,
			buttonSelectedColor:buttonSelectedColor,
			colorButtons:[],
			colorSelectVisible:false,
			fillColorButtons:[],
			fillColorSelectVisible:false,			
			thicknessButtons:[],
			thicknessSelectVisible:false,
			lineEndStartButtons:[],
			lineEndMidButtons:[],
			lineEndFinButtons:[],
			lineEndSizeButtons:[],
			lineEndButtonsVisible:false,
			lineEndsSize:12,
			selectButtons:[],
			selectButtonsVisible:false,
			cursorCanvas:cursorCanvas,
			retainCursorCanvas:retainCursorCanvas,
			highlightCursorPositions:highlightCursorPositions,
			penCursor:null,
			penCursorHotspot:[],
			rulerEdgeCursor1:null,
			rulerEdgeCursorHotspot1:[],
			rulerEdgeCursor2:null,
			rulerEdgeCursorHotspot2:[],						
			lineCursor:null,
			lineCursorHotspot:[],
			prevX:null,
			prevY:null,
			startX:null,
			startY:null,
			snapLinesTogether:snapLinesTogether,
			gridSnap:gridSnap,
			gridSnapRect:gridSnapRect,
			gridSnapSize:gridSnapSize,
			gridMargin:gridMargin,
			horizSnap:'left',
			vertSnap:'top',			
			selectTolerance:selectTolerance,
			selectColor:selectColor,
			selectPadding:selectPadding,
			triggerEnabled:false,
			triggerNum:0,
			triggerNumMax:1,
			videoAdded:false,
			tableSizeVisible:false,
			qBox:[],
			qSize:[],
			qMinWidth:[],
			qMinHeight:[],
			qBoxBorder:qBoxBorder,
			qBox2:{mode:'none',box:[],visible:[],parts:[],partMarks:[],textPath:[],q:[],boxQ:[],markPos:[],showMark:[],penctx:[],penPaths:[],boxScale:[]},
			qBox2Border:qBox2Border
		}
		changeDrawMode(draw[taskId].drawMode);
	}
	draw[taskId].cursors = {
		default:'default',
		move1:'url("../images/cursors/openhand.cur"), auto',
		move2:'url("../images/cursors/closedhand.cur"), auto',
		move3:'move',
		ew:'ew-resize',
		ns:'ns-resize',
		nw:'nw-resize',
		text:'text',
		pointer:'pointer',
		rotate:'url("../images/cursors/rotate.cur"), auto',
		update:function() {
			var canvas = draw[taskId].hiddenCanvas;
			var ctx = draw[taskId].hiddenCanvas.ctx;

			ctx.clearRect(0,0,50,50);			
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.translate(25,25);
			ctx.rotate(Math.PI/4);
				ctx.fillStyle = draw[taskId].color;
				ctx.fillRect(-5,-11,10,20);
				ctx.fillRect(-5,-18,10,5);
				ctx.beginPath();
				ctx.moveTo(-5,11);
				ctx.lineTo(0,18);
				ctx.lineTo(5,11);
				ctx.lineTo(-5,11);
				ctx.fill();		
			ctx.rotate(-Math.PI/4);	
			ctx.translate(-25,-25);

			draw[taskId].penCursor = canvas.toDataURL();
			draw[taskId].penCursorHotspot = [25-18/Math.sqrt(2),25+18/Math.sqrt(2)];	
			
			ctx.clearRect(0,0,50,50);
			ctx.strokeStyle = draw[taskId].color;
			ctx.lineWidth = draw[taskId].thickness + 1;
			ctx.beginPath();
			ctx.moveTo(2,2);
			ctx.lineTo(12,12);
			ctx.moveTo(2,12);
			ctx.lineTo(12,2);
			ctx.stroke();
			
			draw[taskId].lineCursor = canvas.toDataURL();
			draw[taskId].lineCursorHotspot = [7,7];
	
			if (typeof draw[taskId].ruler !== 'undefined') {
				ctx.clearRect(0,0,50,50);
				ctx.translate(25,25);
				ctx.rotate(draw[taskId].ruler.angle);
					ctx.fillStyle = draw[taskId].color;
					ctx.fillRect(-5,-11,10,20);
					ctx.fillRect(-5,-18,10,5);
					ctx.beginPath();
					ctx.moveTo(-5,11);
					ctx.lineTo(0,18);
					ctx.lineTo(5,11);
					ctx.lineTo(-5,11);
					ctx.fill();		
				ctx.rotate(-draw[taskId].ruler.angle);	
				ctx.translate(-25,-25);

				draw[taskId].rulerEdgeCursor1 = canvas.toDataURL();
				draw[taskId].rulerEdgeCursorHotspot1 = [25-18*Math.sin(draw[taskId].ruler.angle),25+18*Math.cos(draw[taskId].ruler.angle)];
				
				ctx.clearRect(0,0,50,50);
				ctx.translate(25,25);
				ctx.rotate(Math.PI+draw[taskId].ruler.angle);
					ctx.fillStyle = draw[taskId].color;
					ctx.fillRect(-5,-11,10,20);
					ctx.fillRect(-5,-18,10,5);
					ctx.beginPath();
					ctx.moveTo(-5,11);
					ctx.lineTo(0,18);
					ctx.lineTo(5,11);
					ctx.lineTo(-5,11);
					ctx.fill();		
				ctx.rotate(-Math.PI-draw[taskId].ruler.angle);	
				ctx.translate(-25,-25);

				draw[taskId].rulerEdgeCursor2 = canvas.toDataURL();
				draw[taskId].rulerEdgeCursorHotspot2 = [25-18*Math.sin(Math.PI+draw[taskId].ruler.angle),25+18*Math.cos(Math.PI+draw[taskId].ruler.angle)];
			}
			
			ctx.clearRect(0,0,50,50);
			ctx.lineCap = 'butt';
			ctx.lineJoin = 'miter';
			drawArrow({ctx:ctx,startX:25,startY:19,finX:25,finY:31,arrowLength:4,color:'#000',lineWidth:5,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.5});
			drawArrow({ctx:ctx,startX:25,startY:20,finX:25,finY:31,arrowLength:4,color:'#FFF',lineWidth:3,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.5});
			draw[taskId].downArrowCursor = canvas.toDataURL();
			draw[taskId].downArrowCursorHotspot = [25,31];
			
			ctx.clearRect(0,0,50,50);
			drawArrow({ctx:ctx,startX:19,startY:25,finX:31,finY:25,arrowLength:4,color:'#000',lineWidth:5,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.5});
			drawArrow({ctx:ctx,startX:20,startY:25,finX:30,finY:25,arrowLength:4,color:'#FFF',lineWidth:3,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.5});
			draw[taskId].rightArrowCursor = canvas.toDataURL();
			draw[taskId].rightArrowCursorHotspot = [31,25];
			
			ctx.clearRect(0,0,50,50);
			drawArrow({ctx:ctx,startX:25-6/Math.sqrt(2),startY:25+6/Math.sqrt(2),finX:25+6/Math.sqrt(2),finY:25-6/Math.sqrt(2),arrowLength:4,color:'#000',lineWidth:5,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.5});
			drawArrow({ctx:ctx,startX:25-6/Math.sqrt(2),startY:25+6/Math.sqrt(2),finX:25+6/Math.sqrt(2),finY:25-6/Math.sqrt(2),arrowLength:4,color:'#FFF',lineWidth:3,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.5});			
			draw[taskId].upRightArrowCursor = canvas.toDataURL();
			draw[taskId].upRightArrowCursorHotspot = [25+6/Math.sqrt(2),25-6/Math.sqrt(2)];			
			
			this.pen = 'url("'+draw[taskId].penCursor+'") '+draw[taskId].penCursorHotspot[0]+' '+draw[taskId].penCursorHotspot[1]+', auto';
			this.cross = 'url("'+draw[taskId].lineCursor+'") '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+' auto';
			this.rulerPen1 = 'url("'+draw[taskId].rulerEdgeCursor1+'") '+draw[taskId].rulerEdgeCursorHotspot1[0]+' '+draw[taskId].rulerEdgeCursorHotspot1[1]+', auto';
			this.rulerPen2 = 'url("'+draw[taskId].rulerEdgeCursor2+'") '+draw[taskId].rulerEdgeCursorHotspot2[0]+' '+draw[taskId].rulerEdgeCursorHotspot2[1]+', auto';
			this.downArrow = 'url("'+draw[taskId].downArrowCursor+'") '+draw[taskId].downArrowCursorHotspot[0]+' '+draw[taskId].downArrowCursorHotspot[1]+', auto';
			this.rightArrow = 'url("'+draw[taskId].rightArrowCursor+'") '+draw[taskId].rightArrowCursorHotspot[0]+' '+draw[taskId].rightArrowCursorHotspot[1]+', auto';
			this.upRightArrow = 'url("'+draw[taskId].upRightArrowCursor+'") '+draw[taskId].upRightArrowCursorHotspot[0]+' '+draw[taskId].upRightArrowCursorHotspot[1]+', auto';			
		}
	}
	if (typeof object.protractor == 'object') {
		var buttonPos = object.protractor.buttonPos || [1120,620];
		var protractorButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		protractorButton.type = 'protractor';
		protractorButton.taskId = taskId;
		protractorButton.draw = function() {
			var color = draw[this.taskId].buttonColor;
			if (draw[this.taskId].protractorVisible == true) color = draw[this.taskId].buttonSelectedColor;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = '#000';
			this.ctx.beginPath();
			this.ctx.moveTo(46.5,35.5);
			this.ctx.lineTo(46.5,37.5);
			this.ctx.lineTo(8.5,37.5);		
			this.ctx.lineTo(8.5,34.5);
			this.ctx.arc(27.5,34.5,19,Math.PI,2*Math.PI);
			this.ctx.stroke();	
			if (draw[this.taskId].protractorVisible == false) {
				this.ctx.fillStyle = '#CCF';
				this.ctx.fill();
				for (var i = 0; i < 7; i++) {
					this.ctx.moveTo(27.5+4*Math.cos((1+i/6)*Math.PI),34.5+4*Math.sin((1+i/6)*Math.PI));
					this.ctx.lineTo(27.5+16*Math.cos((1+i/6)*Math.PI),34.5+16*Math.sin((1+i/6)*Math.PI))
				}
				this.ctx.stroke();
				this.ctx.beginPath();
				this.ctx.arc(27.5,34.5,15,Math.PI,2*Math.PI);
				for (var i = 0; i < 19; i++) {
					this.ctx.moveTo(27.5+17*Math.cos((1+i/18)*Math.PI),34.5+17*Math.sin((1+i/18)*Math.PI));
					this.ctx.lineTo(27.5+19*Math.cos((1+i/18)*Math.PI),34.5+19*Math.sin((1+i/18)*Math.PI))
				}
				this.ctx.moveTo(27.5,34.5);
				this.ctx.lineTo(27.5,30.5);
				this.ctx.moveTo(23.5,34.5);
				this.ctx.lineTo(31.5,34.5);		
				this.ctx.stroke();
			}			
		}
		protractorButton.click = function() {
			draw[taskId].protractorVisible = !draw[taskId].protractorVisible;
			moveToolToFront('protractor');			
		}
		draw[taskId].buttons.push(protractorButton);
		draw[taskId].protractor = {
			center:object.protractor.center || [600,500],
			startCenter:object.protractor.center || [600,500],
			radius:object.protractor.radius || 250,
			startRadius:object.protractor.radius || 250,			
			angle:0,
			color:object.protractor.color || '#CCF',
		}
	}
	if (typeof object.ruler == 'object') {
		var buttonPos = object.ruler.buttonPos || [1120,620];
		var rulerButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		var markings = boolean(object.ruler.markings,true);
		rulerButton.type = 'ruler';
		rulerButton.taskId = taskId;
		rulerButton.draw = function() {
			var color = draw[this.taskId].buttonColor;
			if (draw[this.taskId].rulerVisible == true) color = draw[this.taskId].buttonSelectedColor;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			if (draw[this.taskId].rulerVisible == true) {
				roundedRect(this.ctx,7.5,22.5,40,10,3,1,'#000');
			} else {
				roundedRect(this.ctx,7.5,22.5,40,10,3,1,'#000','#CCF');
				if (draw[taskId].ruler.markings == true) {
					this.ctx.lineWidth = 1;
					this.ctx.strokeStyle = '#000';
					this.ctx.beginPath();
					for (var i = 0; i < 11; i++) {
						this.ctx.moveTo(9.5+i*(36/10),22.5);
						this.ctx.lineTo(9.5+i*(36/10),26.5);				
					}
					this.ctx.stroke();
				}
			}			
		}
		rulerButton.click = function() {
			draw[taskId].rulerVisible = !draw[taskId].rulerVisible;
			moveToolToFront('ruler');			
		}		
		draw[taskId].buttons.push(rulerButton);
		draw[taskId].ruler = {
			left:object.ruler.left || 200,
			startLeft:object.ruler.left || 200,
			top:object.ruler.top || 300,
			startTop:object.ruler.top || 300,
			length:object.ruler.length || 800,
			width:object.ruler.length / 8 || 100,
			angle:0,
			color:object.ruler.color || '#CCF',
			transparent:boolean(object.ruler.transparent,true),
			markings:markings
		}
		recalcRulerValues();
	}
	if (typeof object.compass == 'object') {
		var buttonPos = object.compass.buttonPos || [1120,620];
		var compassButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		compassButton.type = 'compass';
		compassButton.taskId = taskId;
		compassButton.draw = function() {
			var color = draw[this.taskId].buttonColor;
			if (draw[this.taskId].compassVisible == true) color = draw[this.taskId].buttonSelectedColor;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';

			var center1 = [13,45];
			var center2 = [26,15];
			var center3 = [40,45];
			var armLength = Math.sqrt(Math.pow(0.5*(center3[0]-center1[0]),2)+Math.pow(center2[1]-center1[1],2));

			var angle2 = -0.5 * Math.PI - Math.atan((center2[1]-center1[1])/(center2[0]-center1[0]));
			var angle3 = 0.5 * Math.PI - Math.atan((center3[1]-center2[1])/(center3[0]-center2[0]));
			
			// draw pointy arm
			this.ctx.translate(center2[0],center2[1]);
			this.ctx.rotate(-angle2);
			
			if (draw[this.taskId].compassVisible) {
				roundedRect(this.ctx,-2,0,4,armLength-5,1,1,'#000');
			} else {
				roundedRect(this.ctx,-2,0,4,armLength-5,1,1,'#000','#99F');		
			}
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 0.5;
			this.ctx.beginPath();
			this.ctx.moveTo(-1,armLength-5);
			this.ctx.lineTo(0,armLength);
			this.ctx.lineTo(1,armLength-5);
			this.ctx.lineTo(-1,armLength-5);
			this.ctx.stroke();
			if (draw[this.taskId].compassVisible) {
				this.ctx.fillStyle = '#333';
				this.ctx.fill();	
			}
				
			this.ctx.rotate(angle2);
			this.ctx.translate(-center2[0],-center2[1]);

			//draw pencil
			this.ctx.beginPath();
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 1;
			this.ctx.moveTo(40,45);
			this.ctx.lineTo(38,42);
			this.ctx.lineTo(38,25);
			this.ctx.lineTo(42,25);	
			this.ctx.lineTo(42,42);
			this.ctx.lineTo(40,45);
			if (!draw[this.taskId].compassVisible) {
				if (draw[this.taskId].color == '#000') {
					this.ctx.fillStyle = '#FC3';
				} else {
					this.ctx.fillStyle = draw[this.taskId].color;			
				}
				this.ctx.fill();	
			}
			this.ctx.stroke();
			this.ctx.beginPath();
			this.ctx.moveTo(40,45);
			this.ctx.lineTo(38,42);
			this.ctx.lineTo(42,42);
			this.ctx.lineTo(40,45);
			if (!draw[this.taskId].compassVisible) {
				this.ctx.fillStyle = '#FFC';
				this.ctx.fill();	
			}
			this.ctx.stroke();
			this.ctx.beginPath();
			if (draw[this.taskId].color == '#000') {
				this.ctx.fillStyle = '#FC3';
			} else {
				this.ctx.fillStyle = draw[this.taskId].color;			
			}
			this.ctx.moveTo(40,45);
			this.ctx.lineTo(39.5,44.3);
			this.ctx.lineTo(40.5,45.7);
			this.ctx.lineTo(40,45);
			this.ctx.fill();
			this.ctx.stroke();
				
			this.ctx.strokeRect(44,15+armLength*0.5,1,5);		
				
			// draw pencil arm
			this.ctx.translate(center2[0],center2[1]);
			this.ctx.rotate(-angle3);
			
			var pAngle = Math.PI/14;
			
			this.ctx.beginPath();
			this.ctx.moveTo(-2,0);
			this.ctx.lineTo(2,0);
			this.ctx.lineTo(2,armLength*0.7);
			this.ctx.lineTo(6,armLength*0.7);
			this.ctx.lineTo(6,armLength*0.7+4);
			this.ctx.lineTo(-2,armLength*0.7);
			this.ctx.lineTo(-2,0);
			this.ctx.stroke();
			if (!draw[this.taskId].compassVisible) {
				this.ctx.fillStyle = '#99F';
				this.ctx.fill();	
			}
			
			if (!draw[this.taskId].compassVisible) {
				this.ctx.fillRect(6.5,armLength*0.5-0.5,1,5);		
			}
				
			this.ctx.rotate(angle3);
			this.ctx.translate(-center2[0],-center2[1]);	
			
			// draw top of compass
			this.ctx.translate(center2[0],center2[1]);
			
			roundedRect(this.ctx,-2.5,-3,5,7,1,1,'#000','#000');
			roundedRect(this.ctx,-1,-6,2,3,0,1,'#000','#000');	
			this.ctx.fillStyle = '#CCC';
			this.ctx.beginPath();
			this.ctx.arc(0,0,1,0,2*Math.PI);
			this.ctx.fill();

			this.ctx.translate(-center2[0],-center2[1]);			
		}
		compassButton.click = function() {
			draw[taskId].compassVisible = !draw[taskId].compassVisible;
			moveToolToFront('compass');	
		}		
		draw[taskId].buttons.push(compassButton);
		var center1 = object.compass.center1 || [500,450];
		var radius = object.compass.radius || 150;
		var armLength = object.compass.armLength || 250;
		var angle = object.compass.angle || 0;
		var h = Math.sqrt(Math.pow(armLength,2)-Math.pow(0.5*radius,2));
		var center2 = [center1[0]+0.5*radius*Math.cos(angle)+h*Math.sin(angle),center1[1]+0.5*radius*Math.sin(angle)-h*Math.cos(angle)];
		var center3 = [center1[0]+radius*Math.cos(angle),center1[1]+radius*Math.sin(angle)];

		var angle2 = (angle%(2*Math.PI));
		if (angle2 < 0) angle2 += 2*Math.PI;
		if (angle2 > 0.5 * Math.PI && angle2 < 1.5 * Math.PI) {
			var drawOn = 'left';	
		} else {
			var drawOn = 'right';
		}	
		
		var mp1 = midpoint(center1[0],center1[1],center3[0],center3[1]);
		var mp2 = midpoint(center2[0],center2[1],mp1[0],mp1[1]);

		draw[taskId].compass = {
			center1:center1.slice(0),
			startCenter1:center1.slice(0),
			center2:center2.slice(0),
			startCenter2:center2.slice(0),
			center3:center3.slice(0),
			startCenter3:center3.slice(0),
			radius:radius,
			startRadius:radius,
			h:h,
			startH:h,
			armLength:armLength,
			radiusLocked:false,
			angle:angle,
			startAngle:angle,
			drawOn:drawOn,
			startDrawOn:drawOn,
			lockCenter:mp2.slice(0),
			mode:'none',
		}
		recalcCompassValues();
	}
	if (typeof object.undo == 'object') {
		var buttonPos = object.undo.buttonPos || [1120,620];
		var undoButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		undoButton.type = 'undo';
		undoButton.taskId = taskId;
		undoButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);

			this.ctx.strokeStyle = '#000';
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.lineWidth = 4;
			this.ctx.beginPath();
			this.ctx.arc(27.5,27.5,12,-Math.PI,0.7*Math.PI);
			this.ctx.moveTo(13.5,27.5);
			this.ctx.lineTo(13.5-10*Math.sin(1*Math.PI),27.5+10*Math.cos(1*Math.PI));
			this.ctx.lineTo(13.5-10*Math.cos(0.95*Math.PI),27.5-10*Math.sin(0.95*Math.PI));
			this.ctx.lineTo(13.5,27.5);		
			this.ctx.stroke();			
		}
		undoButton.click = function() {
			draw[taskId].path.pop();
			drawCanvasPaths();				
		}		
		draw[taskId].buttons.push(undoButton);
	}
	if (typeof object.undoPen == 'object') {
		var buttonPos = object.undoPen.buttonPos || [1120,620];
		var undoButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		undoButton.type = 'undoPen';
		undoButton.taskId = taskId;
		undoButton.draw = function() {
			var s = draw[taskId].buttonSize;
			roundedRect(this.ctx,3,3,s-6,s-6,8,6,'#000',draw[taskId].buttonColor);
			
			this.ctx.strokeStyle = '#000';
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
			this.ctx.lineWidth = 4;
			this.ctx.beginPath();
			this.ctx.arc(s/2,s/2,12*s/55,-Math.PI,0.7*Math.PI);
			this.ctx.moveTo(13.5*s/55,27.5*s/55);
			this.ctx.lineTo(13.5*s/55-10*s/55*Math.sin(1*Math.PI),27.5*s/55+10*s/55*Math.cos(1*Math.PI));
			this.ctx.lineTo(13.5*s/55-10*s/55*Math.cos(0.95*Math.PI),27.5*s/55-10*s/55*Math.sin(0.95*Math.PI));
			this.ctx.lineTo(13.5*s/55,27.5*s/55);		
			this.ctx.stroke();			
		}
		undoButton.click = function() {
			for (var i = draw[taskId].path.length - 1; i >= 0; i--) {
				if (typeof draw[taskId].path[i].obj == 'object') {
					for (var j = draw[taskId].path[i].obj.length - 1; j >= 0; j--) {
						if (draw[taskId].path[i].obj[j].type = 'pen') {
							draw[taskId].path[i].obj.splice(j,1);
							drawCanvasPath(i);
							if (draw[taskId].path[i].obj.length == 0) {
								draw[taskId].path.splice(i,1);
								drawCanvasPaths();
							}
							return;
						}
					}					
				}
			}
		}		
		draw[taskId].buttons.push(undoButton);
	}
	if (typeof object.undoQBox2Pen == 'object') {
		var buttonPos = object.undoQBox2Pen.buttonPos || [1120,620];
		var undoButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		undoButton.type = 'undoQBox2Pen'; 
		undoButton.taskId = taskId;
		undoButton.draw = function() {
			var s = draw[taskId].buttonSize;
			roundedRect(this.ctx,3,3,s-6,s-6,8,6,'#000',draw[taskId].buttonColor);
			
			this.ctx.strokeStyle = '#000';
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
			this.ctx.lineWidth = 4;
			this.ctx.beginPath();
			this.ctx.arc(s/2,s/2,12*s/55,-Math.PI,0.7*Math.PI);
			this.ctx.moveTo(13.5*s/55,27.5*s/55);
			this.ctx.lineTo(13.5*s/55-10*s/55*Math.sin(1*Math.PI),27.5*s/55+10*s/55*Math.cos(1*Math.PI));
			this.ctx.lineTo(13.5*s/55-10*s/55*Math.cos(0.95*Math.PI),27.5*s/55-10*s/55*Math.sin(0.95*Math.PI));
			this.ctx.lineTo(13.5*s/55,27.5*s/55);		
			this.ctx.stroke();			
		}
		undoButton.click = function() {
			var lastTimeFound;
			var boxNum;
			var pathNum;
			var objNum;
			for (var b = 0; b < draw[taskId].qBox2.box.length; b++) {
				if (draw[taskId].qBox2.visible[b] == false) continue;
				for (var p = 0;  p < draw[taskId].qBox2.penPaths[b].length; p++) {
					for (var o = 0; o < draw[taskId].qBox2.penPaths[b][p].obj.length; o++) {
						var obj = draw[taskId].qBox2.penPaths[b][p].obj[o];
						if (obj.type !== 'pen') continue;
						if (typeof lastTimeFound == 'undefined' || obj.time > lastTimeFound) {
							lastTimeFound = obj.time;
							boxNum = b;
							pathNum = p;
							objNum = o;
						}
					}
				}
			}
			if (typeof lastTimeFound !== 'undefined') {
				draw[taskId].qBox2.penPaths[boxNum][pathNum].obj.splice(objNum,1);
				qBox2DrawPenPaths(boxNum);
			}
		}		
		draw[taskId].buttons.push(undoButton);
	}	
	if (typeof object.clear == 'object') {
		var buttonPos = object.clear.buttonPos || [1120,620];
		var clearButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		clearButton.type = 'clear';
		clearButton.taskId = taskId;
		clearButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);

			this.ctx.strokeStyle = '#000';
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.lineWidth = 4;
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:20>><<align:center>>CLR']});			
		}
		clearButton.click = function() {
			clearDrawPaths();
			resetDrawTools();			
		}			
		draw[taskId].buttons.push(clearButton);
	}
	if (typeof object.clearPen == 'object') {
		var buttonPos = object.clearPen.buttonPos || [1120,620];
		var clearButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		clearButton.type = 'clearPen';
		clearButton.taskId = taskId;
		clearButton.draw = function() {
			var s = draw[taskId].buttonSize;
			roundedRect(this.ctx,3,3,s-6,s-6,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:s,top:15*s/55,textArray:['<<font:Arial>><<fontSize:'+20*s/55+'>><<align:center>>CLR']});			
		}
		clearButton.click = function() {
			for (var i = draw[taskId].path.length - 1; i >= 0; i--) {
				if (draw[taskId].path[i].obj.length == 1 && draw[taskId].path[i].obj[0].type == 'pen') {
					removePathObject(i);
				}
			}
			drawCanvasPaths();			
		}			
		draw[taskId].buttons.push(clearButton);
	}	
	if (typeof object.compassHelp == 'object') {
		var compassHelpImage = new Image();
		compassHelpImage.src = '../images/compassInstructions.PNG';
		var buttonPos = object.compassHelp.buttonPos || [1120,620];
		var compassHelpButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		compassHelpButton.type = 'compassHelp';
		compassHelpButton.taskId = taskId;
		compassHelpButton.draw = function() {
			var color = draw[this.taskId].buttonColor;
			if (draw[this.taskId].compassHelpVisible == true) color = draw[this.taskId].buttonSelectedColor;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			this.ctx.strokeStyle = '#000';
			this.ctx.fillStyle = '#666';
			this.ctx.font = '42px Arial';
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillText('?',27.5,27.5);
			this.ctx.strokeText('?',27.5,27.5);			
		}
		compassHelpButton.click = function() {
			draw[taskId].compassHelpVisible = !draw[taskId].compassHelpVisible;
			if (draw[taskId].compassHelpVisible) {
				showObj(draw[taskId].compassHelpBox,draw[taskId].compassHelpBox.data);			
			} else {
				hideObj(draw[taskId].compassHelpBox,draw[taskId].compassHelpBox.data);			
			}			
		}			
		compassHelpButton.isStaticMenuCanvas = true;		
		draw[taskId].buttons.push(compassHelpButton);
		var helpBoxPos = object.compassHelp.helpBoxPos || [600,110];
		var compassHelpBox = createCanvas(helpBoxPos[0],helpBoxPos[1],500,420,false,false,true,draw[taskId].drawButtonZIndex);		
		compassHelpBox.isStaticMenuCanvas = true;
		roundedRect(compassHelpBox.getContext('2d'),5,5,490,410,15,4,'#000','#FFC');
		compassHelpImage.onload = function() {
			compassHelpBox.getContext('2d').drawImage(compassHelpImage,15,15,compassHelpImage.naturalWidth*0.93,compassHelpImage.naturalHeight*0.93);
		}
		addListener(compassHelpBox,function() {
			draw[taskId].compassHelpVisible = false;
			hideObj(draw[taskId].compassHelpBox,draw[taskId].compassHelpBox.data);
			redrawButtons();			
		});
		draw[taskId].compassHelpBox = compassHelpBox;
	}
	if (typeof object.pen == 'object') {
		var buttonPos = object.pen.buttonPos || [1120,620];
		var penButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		penButton.type = 'pen';
		penButton.taskId = taskId;
		penButton.draw = function() {
			if (draw[taskId].drawMode !== 'pen') {
				var color = draw[taskId].buttonColor;
				this.style.cursor = draw[taskId].cursors.pointer;
			} else {
				var color = draw[taskId].buttonSelectedColor;
				this.style.cursor = draw[taskId].cursors.pen;
			}
			
			var s = draw[taskId].buttonSize;
			roundedRect(this.ctx,3,3,s-6,s-6,8,6,'#000',color);

			this.ctx.fillStyle = draw[taskId].color;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';	

			this.ctx.translate(s/2,s/2);
			this.ctx.rotate(Math.PI/4);
				this.ctx.fillRect(-5,-11,10,20);
				this.ctx.fillRect(-5,-18,10,5);
				this.ctx.beginPath();
				this.ctx.moveTo(-5,11);
				this.ctx.lineTo(0,18);
				this.ctx.lineTo(5,11);
				this.ctx.lineTo(-5,11);
				this.ctx.fill();		
			this.ctx.rotate(-Math.PI/4);
			this.ctx.translate(-s/2,-s/2);				
		}
		penButton.click = function() {
			changeDrawMode('pen');			
		}		
		draw[taskId].buttons.push(penButton);
	}
	if (typeof object.line == 'object') {
		var buttonPos = object.line.buttonPos || [1120,620];
		var lineButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		lineButton.type = 'line';
		lineButton.taskId = taskId;
		lineButton.draw = function() {
			if (draw[taskId].drawMode !== 'line') {
				var color = draw[taskId].buttonColor;
				this.style.cursor = draw[taskId].cursors.pointer;
			} else {
				var color = draw[taskId].buttonSelectedColor;
				this.style.cursor = 'url('+draw[taskId].lineCursor+') '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+', auto';
			}
			
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.lineWidth = draw[taskId].thickness + 1;
			this.ctx.beginPath();
			this.ctx.arc(12,20,2,0,2*Math.PI);
			this.ctx.stroke();	
			this.ctx.lineWidth = draw[taskId].thickness;;
			this.ctx.beginPath();
			this.ctx.moveTo(12,20);
			this.ctx.lineTo(43,35);
			this.ctx.stroke();	
			this.ctx.lineWidth = draw[taskId].thickness + 1;
			this.ctx.beginPath();	
			this.ctx.arc(43,35,2,0,2*Math.PI);
			this.ctx.stroke();			
		}
		lineButton.click = function() {
			changeDrawMode('line');			
		}		
		draw[taskId].buttons.push(lineButton);
	}
	if (typeof object.curve == 'object') {
		var buttonPos = object.curve.buttonPos || [1120,620];
		var curveButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		curveButton.type = 'curve';
		curveButton.taskId = taskId;
		curveButton.draw = function() {
			var color = draw[taskId].buttonColor;
			this.style.cursor = draw[taskId].cursors.pointer;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.lineWidth = draw[taskId].thickness + 1;
			this.ctx.beginPath();
			this.ctx.moveTo(10,20);
			this.ctx.quadraticCurveTo(27.5,55,45,20);
			this.ctx.stroke();				
		}
		curveButton.click = function() {
			addCurve();
		}		
		draw[taskId].buttons.push(curveButton);
	}
	if (typeof object.curve2 == 'object') {
		var buttonPos = object.curve2.buttonPos || [1120,620];
		var curveButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		curveButton.type = 'curve2';
		curveButton.taskId = taskId;
		curveButton.draw = function() {
			var color = draw[taskId].buttonColor;
			this.style.cursor = draw[taskId].cursors.pointer;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.lineWidth = draw[taskId].thickness + 1;
			this.ctx.beginPath();
			this.ctx.moveTo(8,20);
			this.ctx.bezierCurveTo(21,55,43,55,47,20);
			this.ctx.stroke();				
		}
		curveButton.click = function() {
			addCurve2();
		}		
		draw[taskId].buttons.push(curveButton);
	}	
	if (typeof object.angle == 'object') {
		var buttonPos = object.angle.buttonPos || [1120,620];
		var angleButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		angleButton.type = 'angle';
		angleButton.taskId = taskId;
		angleButton.draw = function() {
			var color = draw[taskId].buttonColor;
			this.style.cursor = draw[taskId].cursors.pointer;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
			drawAngle({ctx:this.ctx,a:[30,11.2],b:[10,40],c:[45,40],fill:false,radius:35,drawLines:true,lineWidth:2});	
		}
		angleButton.click = function() {
			addAngle();
		}		
		draw[taskId].buttons.push(angleButton);
	}
	if (typeof object.angle2 == 'object') {
		var buttonPos = object.angle2.buttonPos || [1120,620];
		var angleButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		angleButton.type = 'angle';
		angleButton.taskId = taskId;
		angleButton.draw = function() {
			var color = draw[taskId].buttonColor;
			this.style.cursor = draw[taskId].cursors.pointer;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
			drawAngle({ctx:this.ctx,a:[30,15],b:[10,40],c:[45,40],fill:true,radius:20,drawLines:true,lineWidth:2});	
		}
		angleButton.click = function() {
			addAngle2();
		}		
		draw[taskId].buttons.push(angleButton);
	}
	if (typeof object.anglesAroundPoint == 'object') {
		var buttonPos = object.anglesAroundPoint.buttonPos || [1120,620];
		var anglesAroundPointButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		anglesAroundPointButton.type = 'anglesAroundPoint';
		anglesAroundPointButton.taskId = taskId;
		anglesAroundPointButton.draw = function() {
			var color = draw[taskId].buttonColor;
			this.style.cursor = draw[taskId].cursors.pointer;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
			drawAnglesAroundPoint({
				ctx:this.ctx,
				center:[27.5,35],
				points:[[10,35],[33,18],[45,35]],
				lineColor:'#000',
				thickness:2,
				angles:[
					{fill:true,fillColor:"#CFC",lineWidth:2,labelFontSize:25,labelMeasure:false,labelRadius:33,radius:10},
					{fill:true,fillColor:"#FCC",lineWidth:2,labelFontSize:25,labelMeasure:false,labelRadius:33,radius:10}
				]
			})
		};	
		anglesAroundPointButton.click = function() {
			addAnglesAroundPoint();
		}		
		draw[taskId].buttons.push(anglesAroundPointButton);
	}	
	if (typeof object.lineEnds == 'object') {
		var buttonPos = object.lineEnds.buttonPos || [1120,620];
		var lineEndsButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		lineEndsButton.type = 'lineEnds';
		lineEndsButton.taskId = taskId;
		lineEndsButton.draw = function() {
			if (draw[taskId].drawMode !== 'lineEnds') {
				var color = draw[taskId].buttonColor;
				this.style.cursor = draw[taskId].cursors.pointer;
			} else {
				var color = draw[taskId].buttonSelectedColor;
				this.style.cursor = 'url('+draw[taskId].lineCursor+') '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+', auto';
			}
			
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';	
			drawArrow({context:this.ctx,startX:10,startY:27.5,finX:45,finY:27.5,arrowLength:12,color:'#000',lineWidth:2,arrowLineWidth:3});			
		}
		lineEndsButton.click = function() {
			draw[taskId].lineEndsVisible = !draw[taskId].lineEndsVisible;
			if (draw[taskId].lineEndsVisible == true) {
				for (var i = 0; i < draw[taskId].lineEndStartButtons.length; i++) {
					showObj(draw[taskId].lineEndStartButtons[i],draw[taskId].lineEndStartButtons[i].data)
				}
				for (var i = 0; i < draw[taskId].lineEndMidButtons.length; i++) {
					showObj(draw[taskId].lineEndMidButtons[i],draw[taskId].lineEndMidButtons[i].data)
				}
				for (var i = 0; i < draw[taskId].lineEndFinButtons.length; i++) {
					showObj(draw[taskId].lineEndFinButtons[i],draw[taskId].lineEndFinButtons[i].data)
				}
				for (var i = 0; i < draw[taskId].lineEndSizeButtons.length; i++) {
					showObj(draw[taskId].lineEndSizeButtons[i],draw[taskId].lineEndSizeButtons[i].data)
				}				
				for (var i = 0; i < container.childNodes.length; i++) {
					if (draw[taskId].lineEndStartButtons.indexOf(container.childNodes[i]) == -1 && draw[taskId].lineEndMidButtons.indexOf(container.childNodes[i]) == -1 && draw[taskId].lineEndFinButtons.indexOf(container.childNodes[i]) == -1 && draw[taskId].lineEndSizeButtons.indexOf(container.childNodes[i]) == -1) {
						addListenerStart(container.childNodes[i],lineEndsClose);
					}
				}				
			} else {
				for (var i = 0; i < draw[taskId].lineEndStartButtons.length; i++) {
					hideObj(draw[taskId].lineEndStartButtons[i],draw[taskId].lineEndStartButtons[i].data)
				}
				for (var i = 0; i < draw[taskId].lineEndMidButtons.length; i++) {
					hideObj(draw[taskId].lineEndMidButtons[i],draw[taskId].lineEndMidButtons[i].data)
				}
				for (var i = 0; i < draw[taskId].lineEndFinButtons.length; i++) {
					hideObj(draw[taskId].lineEndFinButtons[i],draw[taskId].lineEndFinButtons[i].data)
				}
				for (var i = 0; i < draw[taskId].lineEndSizeButtons.length; i++) {
					hideObj(draw[taskId].lineEndSizeButtons[i],draw[taskId].lineEndSizeButtons[i].data)
				}				
				for (var i = 0; i < container.childNodes.length; i++) {
					if (draw[taskId].lineEndStartButtons.indexOf(container.childNodes[i]) == -1 && draw[taskId].lineEndMidButtons.indexOf(container.childNodes[i]) == -1 && draw[taskId].lineEndFinButtons.indexOf(container.childNodes[i]) == -1 && draw[taskId].lineEndSizeButtons.indexOf(container.childNodes[i]) == -1) {
						removeListenerStart(container.childNodes[i],lineEndsClose);
					}
				}								
			}			
		}			
		draw[taskId].buttons.push(lineEndsButton);
		var left = buttonPos[0];
		var top = buttonPos[1]+53;		
		var lineEndsBackButton = createCanvas(left,top,120,220,false,false,false,draw[taskId].drawButtonZIndex);
		lineEndsBackButton.isStaticMenuCanvas = true;		
		roundedRect(lineEndsBackButton.getContext('2d'),3,3,114,214,8,6,'#000',draw[taskId].buttonColor);
		draw[taskId].lineEndsBackButton = lineEndsBackButton;
		
		var lineEndStarts = ['none','open','closed'];
		var lineEndMids = ['none','dash','dash2','open','open2'];
		var lineEndFins = ['none','open','closed'];
		
		for (var i = 0; i < lineEndStarts.length; i++) {
			var left2 = left;
			var top2 = top + 48 * i;	
			var lineEndsButton = createCanvas(left2,top2,50,50,false,false,true,draw[taskId].drawButtonZIndex);
			lineEndsButton.isStaticMenuCanvas = true;		
			lineEndsButton.styling = lineEndStarts[i];
			lineEndsButton.draw = function() {
				var ctx = this.ctx;
				roundedRect(ctx,2,2,46,46,4,2,'#000','#CFF');
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#000';
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.beginPath();
				ctx.moveTo(20,25);
				ctx.lineTo(50,25);
				ctx.stroke();
				switch (this.styling) {
					case 'open':
						drawArrow({context:ctx,startX:50,startY:25,finX:20,finY:25,arrowLength:draw[taskId].lineEndsSize,color:'#000',lineWidth:2,arrowLineWidth:3});
						break;
					case 'closed':
						drawArrow({context:ctx,startX:50,startY:25,finX:20,finY:25,arrowLength:draw[taskId].lineEndsSize,color:'#000',lineWidth:2,arrowLineWidth:3,fillArrow:true});
						break;					
				}
			}
			lineEndsButton.draw();

			addListener(lineEndsButton,function() {
				for (var i = 0; i < draw[taskId].path.length; i++) {
					if (draw[taskId].path[i].selected == true) {
						for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
							if (['line','curve'].indexOf(draw[taskId].path[i].obj[j].type) > -1) {
								draw[taskId].path[i].obj[j].endStart = this.styling;
								draw[taskId].path[i].obj[j].endStartSize = draw[taskId].lineEndsSize;								
							}
						}
						if (pathCanvasMode) pathCanvasDraw(draw[taskId].path[i]);
					}
				}
				if (pathCanvasMode) {
					
				} else {
					drawCanvasPaths();
				}
				
			})
			draw[taskId].lineEndStartButtons.push(lineEndsButton);
		}
		
		for (var i = 0; i < lineEndMids.length; i++) {
			var left2 = left + 48;
			var top2 = top + 48 * i;	
			var lineEndsButton = createCanvas(left2,top2,50,50,false,false,true,draw[taskId].drawButtonZIndex);
			lineEndsButton.isStaticMenuCanvas = true;	
			lineEndsButton.styling = lineEndMids[i];
			lineEndsButton.draw = function() {
				var ctx = this.ctx;			
				roundedRect(ctx,2,2,46,46,4,2,'#000','#CFF');
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#000';
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.beginPath();
				ctx.moveTo(10,25);
				ctx.lineTo(40,25);
				ctx.stroke();
				switch (this.styling) {
					case 'dash':
						drawDash(ctx,10,25,40,25,8);
						break;
					case 'dash2':
						drawDoubleDash(ctx,10,25,40,25,8);
						break;
					case 'open':
						drawParallelArrow({context:ctx,startX:10,startY:25,finX:40,finY:25,arrowLength:draw[taskId].lineEndsSize,lineWidth:3});
						break;
					case 'open2':
						drawParallelArrow({context:ctx,startX:10,startY:25,finX:40,finY:25,arrowLength:draw[taskId].lineEndsSize,lineWidth:3,numOfArrows:2});
						break;
				}
			}
			lineEndsButton.draw();

			addListener(lineEndsButton,function() {
				for (var i = 0; i < draw[taskId].path.length; i++) {
					if (draw[taskId].path[i].selected == true) {
						for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
							if (['line','curve'].indexOf(draw[taskId].path[i].obj[j].type) > -1) {
								draw[taskId].path[i].obj[j].endMid = this.styling;
								draw[taskId].path[i].obj[j].endMidSize = draw[taskId].lineEndsSize;
							}
						}
						if (pathCanvasMode) pathCanvasDraw(draw[taskId].path[i]);					
					}
				}
				if (pathCanvasMode) {
					
				} else {
					drawCanvasPaths();
				}
				
			})
			draw[taskId].lineEndMidButtons.push(lineEndsButton);
		}		
		
		for (var i = 0; i < lineEndFins.length; i++) {
			var left2 = left + 2 * 48;
			var top2 = top + 48 * i;
			var lineEndsButton = createCanvas(left2,top2,50,50,false,false,true,draw[taskId].drawButtonZIndex);
			lineEndsButton.isStaticMenuCanvas = true;	
			lineEndsButton.styling = lineEndFins[i];
			lineEndsButton.draw = function() {
				var ctx = this.ctx;						
				roundedRect(ctx,2,2,46,46,4,2,'#000','#CFF');
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#000';
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.beginPath();
				ctx.moveTo(0,25);
				ctx.lineTo(30,25);
				ctx.stroke();
				switch (this.styling) {
					case 'open':
						drawArrow({context:ctx,startX:0,startY:25,finX:30,finY:25,arrowLength:draw[taskId].lineEndsSize,color:'#000',lineWidth:2,arrowLineWidth:3});
						break;
					case 'closed':
						drawArrow({context:ctx,startX:0,startY:25,finX:30,finY:25,arrowLength:draw[taskId].lineEndsSize,color:'#000',lineWidth:2,arrowLineWidth:3,fillArrow:true});
						break;					
				}
			}
			lineEndsButton.draw();
				
			addListener(lineEndsButton,function() {
				for (var i = 0; i < draw[taskId].path.length; i++) {
					if (draw[taskId].path[i].selected == true) {
						for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
							if (['line','curve'].indexOf(draw[taskId].path[i].obj[j].type) > -1) {
								draw[taskId].path[i].obj[j].endFin = this.styling;
								draw[taskId].path[i].obj[j].endFinSize = draw[taskId].lineEndsSize;
							}
						}
						if (pathCanvasMode) pathCanvasDraw(draw[taskId].path[i]);
					}
				}
				if (pathCanvasMode) {
					
				} else {
					drawCanvasPaths();
				}
			})			
			draw[taskId].lineEndFinButtons.push(lineEndsButton);
		}
		
		for (var i = 0; i < 2; i++) {
			var left2 = left + 25 + 48*i;
			var top2 = top + 48*5;
			var lineEndsButton = createCanvas(left2,top2,50,50,false,false,true,draw[taskId].drawButtonZIndex);
			lineEndsButton.isStaticMenuCanvas = true;	
			if (i == 0) {
				lineEndsButton.inc = -1;
			} else {
				lineEndsButton.inc = 1;				
			}
			lineEndsButton.draw = function() {
				var ctx = this.ctx;						
				roundedRect(ctx,2,2,46,46,4,2,'#000','#CFF');
				if (this.inc == -1) {
					text({context:ctx,textArray:['<<fontSize:28>>-'],left:0,top:0,width:50,height:50,vertAlign:'middle',textAlign:'center'});
				} else {
					text({context:ctx,textArray:['<<fontSize:28>>+'],left:0,top:0,width:50,height:50,vertAlign:'middle',textAlign:'center'});			
				}
			}
			lineEndsButton.draw();
				
			addListener(lineEndsButton,function() {
				if (this.inc == -1) {
					draw[taskId].lineEndsSize--;
				} else {
					draw[taskId].lineEndsSize++;
				}
				for (var i = 0; i < draw[taskId].path.length; i++) {
					if (draw[taskId].path[i].selected == true) {
						for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
							if (['line','curve'].indexOf(draw[taskId].path[i].obj[j].type) > -1) {
								draw[taskId].path[i].obj[j].endStartSize = draw[taskId].lineEndsSize;
								draw[taskId].path[i].obj[j].endMidSize = draw[taskId].lineEndsSize;
								draw[taskId].path[i].obj[j].endFinSize = draw[taskId].lineEndsSize;
							}
						}
					}
				}
				for (var i = 0; i < draw[taskId].lineEndStartButtons.length; i++) {
					draw[taskId].lineEndStartButtons[i].draw();
				}				
				for (var i = 0; i < draw[taskId].lineEndMidButtons.length; i++) {
					draw[taskId].lineEndMidButtons[i].draw();
				}
				for (var i = 0; i < draw[taskId].lineEndFinButtons.length; i++) {
					draw[taskId].lineEndFinButtons[i].draw();
				}				
				drawCanvasPaths();
				
			})			
			draw[taskId].lineEndSizeButtons.push(lineEndsButton);
		}		
	}
	if (typeof object.table == 'object') {
		var buttonPos = object.table.buttonPos || [1120,620];
		var tableButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		tableButton.type = 'table';
		tableButton.taskId = taskId;
		tableButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			this.ctx.strokeStyle = '#666';
			this.ctx.lineWidth = 1;
			this.ctx.fillStyle = '#FFF';
			this.ctx.fillRect(10,11,35,33);
			this.ctx.fillStyle = '#CCC';
			this.ctx.fillRect(10,11,35,33/4);
			for (var i = 0; i < 5; i++) {
				this.ctx.moveTo(10,11+i*33/4);
				this.ctx.lineTo(45,11+i*33/4);
			}
			for (var i = 0; i < 4; i++) {
				this.ctx.moveTo(10+i*35/3,11);
				this.ctx.lineTo(10+i*35/3,44);
			}
			this.ctx.stroke();
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = '#000';
			this.ctx.strokeRect(10,11,35,33);			
		}
		tableButton.click = function() {
			draw[taskId].tableSizeVisible = !draw[taskId].tableSizeVisible;
			if (draw[taskId].tableSizeVisible == true) {
				changeDrawMode('table');
				showObj(draw[taskId].tableSizeCanvas,draw[taskId].tableSizeCanvas.data);
			} else {
				changeDrawMode();
				hideObj(draw[taskId].tableSizeCanvas,draw[taskId].tableSizeCanvas.data);
			}
			draw[taskId].tableSize.rows = 0;
			draw[taskId].tableSize.cols = 0;
			draw[taskId].tableSizeCanvas.draw();			
		}		
		draw[taskId].buttons.push(tableButton);

		var rows = object.table.rows || 10;
		var cols = object.table.cols || 10;

		var left = buttonPos[0];
		var top = buttonPos[1]+53;		
		var tableSizeCanvas = createCanvas(left,top,cols*25+20,rows*25+40,false,false,true,draw[taskId].drawButtonZIndex);
		tableSizeCanvas.isStaticMenuCanvas = true;	
		draw[taskId].tableSizeCanvas = tableSizeCanvas;
		draw[taskId].tableSize = {rows:-1,cols:-1,maxRows:rows-1,maxCols:cols-1};
		
		tableSizeCanvas.draw = function() {
			var ctx = this.ctx;
			roundedRect(ctx,3,3,this.data[102]-6,this.data[103]-6,8,6,'#000',draw[taskId].buttonColor);
			for (var i = 0; i < rows; i++) {
				for (var j = 0; j < cols; j++) {
					if (draw[taskId].tableSize.rows >= i && draw[taskId].tableSize.cols >= j) {
						roundedRect(ctx,10+25*j,30+25*i,25,25,0,0.01,'#F6F','#F6F');
					} else {
						roundedRect(ctx,10+25*j,30+25*i,25,25,0,0.01,'#FFC','#FFC');						
					}
				}
			}
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 3;
			ctx.beginPath();
			for (var i = 0; i < rows + 2; i++) {
				ctx.moveTo(10,30+25*i);
				ctx.lineTo(10+cols*25,30+25*i);
			}
			for (var i = 0; i < cols + 2; i++) {
				ctx.moveTo(10+25*i,30);
				ctx.lineTo(10+25*i,30+rows*25);
			}
			ctx.stroke();
			text({context:ctx,textArray:['<<fontSize:14>>'+(draw[taskId].tableSize.rows+1)+' x '+(draw[taskId].tableSize.cols+1)],left:12,top:5,width:200});
		}
		tableSizeCanvas.draw();
		
		addListenerMove(tableSizeCanvas,function(e) {
			updateMouse(e);
			var col = Math.min(draw[taskId].tableSize.maxCols,Math.max(0,Math.floor((mouse.x - e.target.data[100] - 10) / 25))); 
			var row = Math.min(draw[taskId].tableSize.maxRows,Math.max(0,Math.floor((mouse.y - e.target.data[101] - 30) / 25)));		
			if (row !== draw[taskId].tableSize.rows || col !== draw[taskId].tableSize.cols) {
				draw[taskId].tableSize.rows = row;
				draw[taskId].tableSize.cols = col;
				e.target.draw();
			}
		});
		
		addListener(tableSizeCanvas,function(e) {
			addTable2(draw[taskId].tableSize.rows+1,draw[taskId].tableSize.cols+1);
		});
	}
	if (typeof object.distHoriz == 'object') {
		var buttonPos = object.distHoriz.buttonPos || [1120,620];
		var distHorizButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		distHorizButton.type = 'distHoriz';
		distHorizButton.taskId = taskId;
		distHorizButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			drawArrow({ctx:this.ctx,startX:10,startY:27.5,finX:27.5,finY:27.5,doubleEnded:true,arrowLength:5,fillArrow:true,color:'#393',lineWidth:1});
			drawArrow({ctx:this.ctx,startX:27.5,startY:27.5,finX:45,finY:27.5,doubleEnded:true,arrowLength:5,fillArrow:true,color:'#393',lineWidth:1});
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 2;
			this.ctx.beginPath();
			this.ctx.moveTo(10,15);
			this.ctx.lineTo(10,40);
			this.ctx.moveTo(27.5,15);
			this.ctx.lineTo(27.5,40);
			this.ctx.moveTo(45,15);
			this.ctx.lineTo(45,40);
			this.ctx.stroke();			
		}
		distHorizButton.click = function() {
			distributeHoriz();
		}			
		draw[taskId].buttons.push(distHorizButton);
	}
	if (typeof object.distVert == 'object') {
		var buttonPos = object.distVert.buttonPos || [1120,620];
		var distVertButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		distVertButton.type = 'distVert';
		distVertButton.taskId = taskId;
		distVertButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			drawArrow({ctx:this.ctx,startY:10,startX:27.5,finY:27.5,finX:27.5,doubleEnded:true,arrowLength:5,fillArrow:true,color:'#393',lineWidth:1});
			drawArrow({ctx:this.ctx,startY:27.5,startX:27.5,finY:45,finX:27.5,doubleEnded:true,arrowLength:5,fillArrow:true,color:'#393',lineWidth:1});
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 2;
			this.ctx.beginPath();
			this.ctx.moveTo(15,10);
			this.ctx.lineTo(40,10);
			this.ctx.moveTo(15,27.5);
			this.ctx.lineTo(40,27.5);
			this.ctx.moveTo(15,45);
			this.ctx.lineTo(40,45);
			this.ctx.stroke();			
		}
		distVertButton.click = function() {
			distributeVert();
		}				
		draw[taskId].buttons.push(distVertButton);
	}
	if (typeof object.tableRowColChange == 'object') {
		var buttonPos = object.tableRowColChange.buttonPos || [1120,620];
		var tableButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		tableButton.type = 'tableRowColChange';
		tableButton.taskId = taskId;
		tableButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			this.ctx.strokeStyle = '#666';
			this.ctx.lineWidth = 1;
			this.ctx.fillStyle = '#FFF';
			this.ctx.fillRect(10,11,35,33);
			this.ctx.fillStyle = '#333';
			this.ctx.fillRect(10,11+2*33/4,35,33/4);
			for (var i = 0; i < 5; i++) {
				this.ctx.moveTo(10,11+i*33/4);
				this.ctx.lineTo(45,11+i*33/4);
			}
			for (var i = 0; i < 4; i++) {
				this.ctx.moveTo(10+i*35/3,11);
				this.ctx.lineTo(10+i*35/3,44);
			}
			this.ctx.stroke();
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = '#000';
			this.ctx.strokeRect(10,11,35,33);				
		}
		tableButton.click = function() {
			draw[taskId].tableChangeVisible = !draw[taskId].tableChangeVisible;
			if (draw[taskId].tableChangeVisible == true) {
				tableMenuClose();
				changeDrawMode('tableChange');
				showObj(draw[taskId].tableRowColCanvas,draw[taskId].tableRowColCanvas.data);
			} else {
				changeDrawMode();
				hideObj(draw[taskId].tableRowColCanvas,draw[taskId].tableRowColCanvas.data);
			}
			draw[taskId].tableRowColCanvas.selected = -1;
			draw[taskId].tableRowColCanvas.draw();			
		}		
		draw[taskId].buttons.push(tableButton);

		var left = buttonPos[0];
		var top = buttonPos[1]+53;		
		var tableRowColCanvas = createCanvas(left,top,200,260,false,false,true,zIndex+100);
		tableRowColCanvas.isStaticMenuCanvas = true;	
		tableRowColCanvas.selected = -1;
		draw[taskId].tableRowColCanvas = tableRowColCanvas;
		draw[taskId].tableChangeVisible = false;
		
		tableRowColCanvas.draw = function() {
			var ctx = this.ctx;
			roundedRect(ctx,3,3,this.data[102]-6,this.data[103]-6,8,6,'#000',draw[taskId].buttonColor);
			
			for (var i = 0; i < 6; i++) {
				if (draw[taskId].tableRowColCanvas.selected == i) {
					roundedRect(ctx,10,10+40*i,180,40,0,0.01,'#F6F','#F6F');
				} else {
					roundedRect(ctx,10,10+40*i,180,40,0,0.01,'#FFC','#FFC');						
				}
			}
			
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.beginPath();
			for (var i = 0; i < 7; i++) {
				ctx.moveTo(10,10+40*i);
				ctx.lineTo(190,10+40*i);
			}
			ctx.moveTo(10,10);
			ctx.lineTo(10,250);
			ctx.moveTo(190,10);
			ctx.lineTo(190,250);
			ctx.stroke();
			text({context:ctx,textArray:['<<fontSize:20>>Add rows above'],left:10,top:10,width:180,height:40,vertAlign:'middle',textAlign:'center'});
			text({context:ctx,textArray:['<<fontSize:20>>Add rows below'],left:10,top:50,width:180,height:40,vertAlign:'middle',textAlign:'center'});
			text({context:ctx,textArray:['<<fontSize:20>>Delete rows'],left:10,top:90,width:180,height:40,vertAlign:'middle',textAlign:'center'});
			text({context:ctx,textArray:['<<fontSize:20>>Add columns left'],left:10,top:130,width:180,height:40,vertAlign:'middle',textAlign:'center'});
			text({context:ctx,textArray:['<<fontSize:20>>Add columns right'],left:10,top:170,width:180,height:40,vertAlign:'middle',textAlign:'center'});
			text({context:ctx,textArray:['<<fontSize:20>>Delete columns'],left:10,top:210,width:180,height:40,vertAlign:'middle',textAlign:'center'});
		}
		tableRowColCanvas.draw();
	
		addListenerMove(tableRowColCanvas,function(e) {
			updateMouse(e);
			var sel = Math.floor((mouse.y - e.target.data[101] - 10) / 40);		
			if (mouse.x - e.target.data[100] < 10 || mouse.x - e.target.data[100] > 190) sel = -1;
			if (sel < 0 || sel > 5) sel = -1;
			if (sel !== draw[taskId].tableRowColCanvas.selected) {
				draw[taskId].tableRowColCanvas.selected = sel;
				e.target.draw();
			}
		});
		
		addListener(tableRowColCanvas,function(e) {
			if (draw[taskId].tableRowColCanvas.selected < 0 || draw[taskId].tableRowColCanvas.selected > 5) return;
			for (var i = 0; i < draw[taskId].path.length; i++) {
				if (draw[taskId].path[i].selected == true) {
					for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
						var type = draw[taskId].path[i].obj[j].type;
						if (type == 'table' || type == 'table2') {
							var obj = draw[taskId].path[i].obj[j];
							var cells = obj.cells;
							var mInputs = obj.mInputs;
							var selRows = [];
							var selCols = [];
							var rowHeights = [];
							var colWidths = [];
							for (var r = 0; r < cells.length; r++) {
								for (var c = 0; c < cells[r].length; c++) {
									if (cells[r][c].selected == true) {
										if (selRows.indexOf(r) == -1) {
											selRows.push(r);
											if (type == 'table') {
												rowHeights.push(cells[r][c].height);
											} else if (type == 'table2') {
												rowHeights.push(obj.heights[r]);
											}
										}
										if (selCols.indexOf(c) == -1) {
											selCols.push(c);
											if (type == 'table') {
												colWidths.push(cells[r][c].width);
											} else if (type == 'table2') {
												colWidths.push(obj.widths[c]);
											}
										}
									}
								}
							}
							if (selRows.length == 0 || selCols.length == 0) continue;
							switch (draw[taskId].tableRowColCanvas.selected) {
								case 0: // add rows above
								case 1: // add rows below
									var newRows = [];
									var newInputs = [];
									var newHeights = [];
									for (var r = 0; r < selRows.length; r++) {
										var newRow = [];
										var newRowInputs = [];
										for (var c = 0; c < cells[0].length; c++) {
											if (type == 'table') {
												newRow.push({minWidth:cells[selRows[r]][c].minWidth,minHeight:cells[selRows[r]][c].minHeight,selected:false,highlight:false,text:"",color:"none",trigger:[]});
												var w = cells[selRows[r]][c].width-20;
												var h = cells[selRows[r]][c].height-20;
											} else if (type == 'table2') {
												newRow.push({selected:false,highlight:false,text:"",color:"none",trigger:[]});
												var w = obj.widths[c]-20;
												var h = obj.heights[selRows[r]]-20;
											}							
											var mInput = createMathsInput2({
												left:0,
												top:0,
												width:w,
												height:h,
												backColor:'none',
												selectColor:'none',
												border:false,
												borderColor:'#00F',
												borderWidth:1,
												borderDash:[5,8],
												textAlign:'center',
												vertAlign:'middle',
												maxLines:100,
												selectable:true,
												zIndex:draw[taskId].zIndex,
												pointerCanvas:draw[taskId].cursorCanvas
											});
											setMathsInputText(mInput,['<<font:Arial>><<fontSize:24>><<align:center>>']);
											newRowInputs.push(mInput);
										}
										newRows.push(newRow);
										newInputs.push(newRowInputs);
										newHeights.push(obj.heights[selRows[r]]);
									}
									if (draw[taskId].tableRowColCanvas.selected == 0) {
										var newCel = obj.cells.slice(0,selRows[0]).concat(newRows).concat(obj.cells.slice(selRows[0]));
										var newInp = obj.mInputs.slice(0,selRows[0]).concat(newInputs).concat(obj.mInputs.slice(selRows[0]));
										if (type == 'table2') {
											var newHei = obj.heights.slice(0,selRows[0]).concat(newHeights).concat(obj.heights.slice(selRows[0]));
										}
									} else {
										var newCel = obj.cells.slice(0,selRows[selRows.length-1]+1).concat(newRows).concat(obj.cells.slice(selRows[selRows.length-1]+1));
										var newInp = obj.mInputs.slice(0,selRows[selRows.length-1]+1).concat(newInputs).concat(obj.mInputs.slice(selRows[selRows.length-1]+1));
										if (type == 'table2') {
											var newHei = obj.heights.slice(0,selRows[selRows.length-1]+1).concat(newHeights).concat(obj.heights.slice(selRows[selRows.length-1]+1));
										}
									}
									obj.cells = newCel;
									obj.mInputs = newInp;
									if (type == 'table2') {
										obj.heights = newHei;
									}
									break;
								case 3: // add cols left
								case 4: // add cols right
									var newWidths = [];								
									for (var r = 0; r < cells.length; r++) {
										var newCells = [];
										var newInputs = [];										
										for (var c = 0; c < selCols.length; c++) {
											if (type == 'table') {
												newCells.push({minWidth:cells[r][selCols[c]].minWidth,minHeight:cells[r][selCols[c]].minHeight,selected:false,highlight:false,text:"",color:"none",trigger:[]});
												var w = cells[selRows[r]][c].width-20;
												var h = cells[selRows[r]][c].height-20;
											} else if (type == 'table2') {
												newCells.push({selected:false,highlight:false,text:"",color:"none",trigger:[]});
												var w = obj.widths[selCols[c]]-20;
												var h = obj.heights[r]-20;
											}
											var mInput = createMathsInput2({
												left:0,
												top:0,
												width:w,
												height:h,
												backColor:'none',
												selectColor:'none',
												border:false,
												borderColor:'#00F',
												borderWidth:1,
												borderDash:[5,8],
												textAlign:'center',
												vertAlign:'middle',
												maxLines:100,
												selectable:true,
												zIndex:draw[taskId].zIndex,
												pointerCanvas:draw[taskId].cursorCanvas
											});
											setMathsInputText(mInput,['<<font:Arial>><<fontSize:24>><<align:center>>']);
											newInputs.push(mInput);
											if (r == 0) newWidths.push(obj.widths[selCols[c]]);
										}
										if (draw[taskId].tableRowColCanvas.selected == 3) {
											var newRow = obj.cells[r].slice(0,selCols[0]).concat(newCells).concat(obj.cells[r].slice(selCols[0]));
											var newRowInputs = obj.mInputs[r].slice(0,selCols[0]).concat(newInputs).concat(obj.mInputs[r].slice(selCols[0]));
										} else {
											var newRow = obj.cells[r].slice(0,selCols[selCols.length-1]+1).concat(newCells).concat(obj.cells[r].slice(selCols[selCols.length-1]+1));
											var newRowInputs = obj.mInputs[r].slice(0,selCols[selCols.length-1]+1).concat(newInputs).concat(obj.mInputs[r].slice(selCols[selCols.length-1]+1));	
										}
										obj.cells[r] = newRow;
										obj.mInputs[r] = newRowInputs;
									}
									if (type == 'table2') {
										if (draw[taskId].tableRowColCanvas.selected == 3) {
											obj.widths = obj.widths.slice(0,selCols[0]).concat(newWidths).concat(obj.widths.slice(selCols[0]));
										} else {
											obj.widths = obj.widths.slice(0,selCols[selCols.length-1]+1).concat(newWidths).concat(obj.widths.slice(selCols[selCols.length-1]+1));	
										}
									}
									break;
								case 2: // del rows
									for (var r = selRows.length - 1; r >= 0; r--) {
										for (var c = 0; c < mInputs[selRows[r]].length; c++) {
											hideMathsInput(mInputs[selRows[r]][c]);
										}
										cells.splice(selRows[r],1);
										mInputs.splice(selRows[r],1);
										obj.heights.splice(selRows[r],1);
									}
									break;
								case 5: // del cols
									for (var r = 0; r < cells.length; r++) {
										for (var c = selCols.length - 1; c >= 0; c--) {
											hideMathsInput(mInputs[r][selCols[c]]);
											cells[r].splice(selCols[c],1);
											mInputs[r].splice(selCols[c],1);
											if (r == 0) obj.widths.splice(selCols[c],1);
										}
									}			
									break;
							}
							if (pathCanvasMode) {
								updateBorder(draw[taskId].path[i]);
								pathCanvasDraw(draw[taskId].path[i]);
								repositionPath(draw[taskId].path[i]);
								drawSelectCanvas();
								calcCursorPositions();
							} else {
								updateBorder(draw[taskId].path[i]);
								drawCanvasPath(i);
							}
						}
					}
				}
			}
			tableMenuClose();
		});	
	}
	if (typeof object.tableBorders == 'object') {
		var buttonPos = object.tableBorders.buttonPos || [1120,620];
		var tableButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		tableButton.type = 'tableBorders';
		tableButton.taskId = taskId;
		tableButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			this.ctx.strokeStyle = '#F00';
			this.ctx.lineWidth = 2;
			this.ctx.fillStyle = '#FFF';
			this.ctx.fillRect(10,11,35,33);
			this.ctx.beginPath();
			for (var i = 1; i < 4; i++) {
				this.ctx.moveTo(10,11+i*33/4);
				this.ctx.lineTo(45,11+i*33/4);
			}
			for (var i = 1; i < 3; i++) {
				this.ctx.moveTo(10+i*35/3,11);
				this.ctx.lineTo(10+i*35/3,44);
			}
			this.ctx.stroke();			
		}
		tableButton.click = function() {
			draw[taskId].tableBordersVisible = !draw[taskId].tableBordersVisible;
			if (draw[taskId].tableBordersVisible == true) {
				tableMenuClose();
				changeDrawMode('tableBorders');
				showObj(draw[taskId].tableBordersCanvas,draw[taskId].tableBordersCanvas.data);
			} else {
				changeDrawMode();
				hideObj(draw[taskId].tableBordersCanvas,draw[taskId].tableBordersCanvas.data);
			}
			draw[taskId].tableBordersCanvas.draw();			
		}			
		draw[taskId].buttons.push(tableButton);

		var left = buttonPos[0];
		var top = buttonPos[1]+53;		
		var tableBordersCanvas = createCanvas(left,top,400,170,false,false,true,zIndex+100);
		tableBordersCanvas.isStaticMenuCanvas = true;			
		tableBordersCanvas.selected = -1;
		draw[taskId].tableBordersCanvas = tableBordersCanvas;
		draw[taskId].tableBordersVisible = false;
		
		tableBordersCanvas.colors = ['none','#000','#333','#666','#999','#F00','#00F','#393'];
		tableBordersCanvas.draw = function() {
			var ctx = this.ctx;
			roundedRect(ctx,3,3,this.data[102]-6,this.data[103]-6,8,6,'#000','#FFC');

			text({context:ctx,textArray:['<<fontSize:18>>Outer Border'],left:0,top:10,width:200,height:50,textAlign:'center'});
			text({context:ctx,textArray:['<<fontSize:18>>Inner Border'],left:200,top:10,width:200,height:50,textAlign:'center'});
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			if (!ctx.setLineDash) {ctx.setLineDash = function () {}}			
			ctx.setLineDash([]);
			ctx.beginPath();
			ctx.moveTo(200,10);
			ctx.lineTo(200,160);
			ctx.stroke();
			
			// draw color buttons
			roundedRect(ctx,10,40,22.5,22.5,0,2,'#000');
			roundedRect(ctx,210,40,22.5,22.5,0,2,'#000');
			ctx.beginPath();
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.moveTo(10,40);
			ctx.lineTo(32.5,62.5);
			ctx.moveTo(32.5,40);
			ctx.lineTo(10,62.5);
			ctx.moveTo(210,40);
			ctx.lineTo(232.5,62.5);
			ctx.moveTo(232.5,40);
			ctx.lineTo(210,62.5);			
			ctx.stroke();
			for (var i = 1; i < this.colors.length; i++) {
				roundedRect(ctx,10+22.5*i,40,22.5,22.5,0,2,'#000',this.colors[i]);
				roundedRect(ctx,210+22.5*i,40,22.5,22.5,0,2,'#000',this.colors[i]);
			}

			var innerColor = '#999';
			var innerWeight = 2;
			var innerDash = [5,5];
			var outerColor = '#000';
			var outerWeight = 4;
			var outerDash = [0,0];
			
			for (var i = 0; i < draw[taskId].path.length; i++) {
				if (draw[taskId].path[i].selected == true) {
					for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
						if (draw[taskId].path[i].obj[j].type == 'table' || draw[taskId].path[i].obj[j].type == 'table2') {
							innerColor = draw[taskId].path[i].obj[j].innerBorder.color;
							if (draw[taskId].path[i].obj[j].innerBorder.show == false) innerColor = '#FFC';
							innerWeight = draw[taskId].path[i].obj[j].innerBorder.width;
							innerDash = draw[taskId].path[i].obj[j].innerBorder.dash;
							if (typeof innerDash !== 'object') innerDash = [0,0];
							if (typeof innerDash[0] !== 'number') innerDash[0] = 0;
							if (typeof innerDash[1] !== 'number') innerDash[1] = 0;
							outerColor = draw[taskId].path[i].obj[j].outerBorder.color;
							if (draw[taskId].path[i].obj[j].outerBorder.show == false) outerColor = '#FFC';
							outerWeight = draw[taskId].path[i].obj[j].outerBorder.width;
							outerDash = draw[taskId].path[i].obj[j].outerBorder.dash;
							if (typeof outerDash !== 'object') outerDash = [0,0];
							if (typeof outerDash[0] !== 'number') outerDash[0] = 0;
							if (typeof outerDash[1] !== 'number') outerDash[1] = 0;
						}
					}
				}
			}
			
			ctx.strokeStyle = outerColor;
			ctx.lineWidth = outerWeight;
			ctx.setLineDash(outerDash);
			ctx.beginPath();
			ctx.moveTo(10,80);
			ctx.lineTo(190,80);
			ctx.stroke();
			
			ctx.strokeStyle = innerColor;
			ctx.lineWidth = innerWeight;
			ctx.setLineDash(innerDash);
			ctx.beginPath();
			ctx.moveTo(210,80);
			ctx.lineTo(390,80);
			ctx.stroke();
			
			text({context:ctx,textArray:['<<fontSize:30>>-'],left:10,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:30>>+'],left:35,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:16>>width '+outerWeight],left:5,top:130,width:60,height:30,textAlign:'center'});

			text({context:ctx,textArray:['<<fontSize:30>>-'],left:75,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:30>>+'],left:100,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:16>>dash '+outerDash[0]],left:70,top:130,width:60,height:30,textAlign:'center'});

			text({context:ctx,textArray:['<<fontSize:30>>-'],left:140,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:30>>+'],left:165,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:16>>gap '+outerDash[1]],left:135,top:130,width:60,height:30,textAlign:'center'});
			
			text({context:ctx,textArray:['<<fontSize:30>>-'],left:210,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:30>>+'],left:235,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:16>>width '+innerWeight],left:205,top:130,width:60,height:30,textAlign:'center'});

			text({context:ctx,textArray:['<<fontSize:30>>-'],left:275,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:30>>+'],left:300,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:16>>dash '+innerDash[0]],left:270,top:130,width:60,height:30,textAlign:'center'});

			text({context:ctx,textArray:['<<fontSize:30>>-'],left:340,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:30>>+'],left:365,top:100,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:16>>gap '+innerDash[1]],left:335,top:130,width:60,height:30,textAlign:'center'});			
		}
		tableBordersCanvas.draw();
	
		addListenerMove(tableBordersCanvas,function(e) {
			updateMouse(e);
			var l = e.target.data[100];
			var t = e.target.data[101];
			if (mouseHitRect(l+10,t+40,180,22.5) || mouseHitRect(l+210,t+40,180,22.5) || mouseHitRect(l+10,t+100,50,25) || mouseHitRect(l+75,t+100,50,25) || mouseHitRect(l+140,t+100,50,25) || mouseHitRect(l+210,t+100,50,25) || mouseHitRect(l+275,t+100,50,25) || mouseHitRect(l+340,t+100,50,25)) {
				e.target.style.cursor = draw[taskId].cursors.pointer;
			} else {
				e.target.style.cursor = draw[taskId].cursors.default;
			}
		});
		
		addListener(tableBordersCanvas,function(e) {
			if (e.target.style.cursor == draw[taskId].cursors.default) return;
			updateMouse(e);
			var l = e.target.data[100];
			var t = e.target.data[101];

			for (var i = 0; i < draw[taskId].path.length; i++) {
				if (draw[taskId].path[i].selected == true) {
					for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
						if (draw[taskId].path[i].obj[j].type == 'table' || draw[taskId].path[i].obj[j].type == 'table2') {			
							if (mouseHitRect(l+10,t+40,180,22.5)) {
								var color = e.target.colors[Math.floor((mouse.x-(l+10))/22.5)];
								if (color == 'none') {
									draw[taskId].path[i].obj[j].outerBorder.show = false;
								} else {
									draw[taskId].path[i].obj[j].outerBorder.show = true;
									draw[taskId].path[i].obj[j].outerBorder.color = color;
								}
							} else if (mouseHitRect(l+210,t+40,180,22.5)) {
								var color = e.target.colors[Math.floor((mouse.x-(l+210))/22.5)];
								if (color == 'none') {
									draw[taskId].path[i].obj[j].innerBorder.show = false;
								} else {
									draw[taskId].path[i].obj[j].innerBorder.show = true;
									draw[taskId].path[i].obj[j].innerBorder.color = color;
								}
							} else if (mouseHitRect(l+10,t+100,25,25)) {
								draw[taskId].path[i].obj[j].outerBorder.width = Math.max(1,draw[taskId].path[i].obj[j].outerBorder.width-1);
							} else if (mouseHitRect(l+35,t+100,25,25)) {
								draw[taskId].path[i].obj[j].outerBorder.width++;
							} else if (mouseHitRect(l+75,t+100,25,25)) {
								if (typeof draw[taskId].path[i].obj[j].outerBorder.dash !== 'object') draw[taskId].path[i].obj[j].outerBorder.dash = [0,0];
								draw[taskId].path[i].obj[j].outerBorder.dash[0] = Math.max(0,draw[taskId].path[i].obj[j].outerBorder.dash[0]-1);
							} else if (mouseHitRect(l+100,t+100,25,25)) {
								if (typeof draw[taskId].path[i].obj[j].outerBorder.dash !== 'object') draw[taskId].path[i].obj[j].outerBorder.dash = [0,0];
								draw[taskId].path[i].obj[j].outerBorder.dash[0]++;
							} else if (mouseHitRect(l+140,t+100,25,25)) {
								if (typeof draw[taskId].path[i].obj[j].outerBorder.dash !== 'object') draw[taskId].path[i].obj[j].outerBorder.dash = [0,0];
								draw[taskId].path[i].obj[j].outerBorder.dash[1] = Math.max(0,draw[taskId].path[i].obj[j].outerBorder.dash[1]-1);
							} else if (mouseHitRect(l+165,t+100,25,25)) {
								if (typeof draw[taskId].path[i].obj[j].outerBorder.dash !== 'object') draw[taskId].path[i].obj[j].outerBorder.dash = [0,0];
								draw[taskId].path[i].obj[j].outerBorder.dash[1]++;
							} else if (mouseHitRect(l+210,t+100,25,25)) {
								draw[taskId].path[i].obj[j].innerBorder.width = Math.max(1,draw[taskId].path[i].obj[j].innerBorder.width-1);
							} else if (mouseHitRect(l+235,t+100,25,25)) {
								draw[taskId].path[i].obj[j].innerBorder.width++;
							} else if (mouseHitRect(l+275,t+100,25,25)) {
								if (typeof draw[taskId].path[i].obj[j].innerBorder.dash !== 'object') draw[taskId].path[i].obj[j].innerBorder.dash = [0,0];
								draw[taskId].path[i].obj[j].innerBorder.dash[0] = Math.max(0,draw[taskId].path[i].obj[j].innerBorder.dash[0]-1);
							} else if (mouseHitRect(l+300,t+100,25,25)) {
								if (typeof draw[taskId].path[i].obj[j].innerBorder.dash !== 'object') draw[taskId].path[i].obj[j].innerBorder.dash = [0,0];
								draw[taskId].path[i].obj[j].innerBorder.dash[0]++;
							} else if (mouseHitRect(l+340,t+100,25,25)) {
								if (typeof draw[taskId].path[i].obj[j].innerBorder.dash !== 'object') draw[taskId].path[i].obj[j].innerBorder.dash = [0,0];
								draw[taskId].path[i].obj[j].innerBorder.dash[1] = Math.max(0,draw[taskId].path[i].obj[j].innerBorder.dash[1]-1);
							} else if (mouseHitRect(l+365,t+100,25,25)) {
								if (typeof draw[taskId].path[i].obj[j].innerBorder.dash !== 'object') draw[taskId].path[i].obj[j].innerBorder.dash = [0,0];
								draw[taskId].path[i].obj[j].innerBorder.dash[1]++;
							}
						}
					}
					if (pathCanvasMode) {
						pathCanvasDraw(draw[taskId].path[i]);
					}
				}
			}
			if (pathCanvasMode) {
				
			} else {
				drawCanvasPaths();
			}
			this.draw();
		});	
	}
	if (typeof object.tableCellColor == 'object') {
		var buttonPos = object.tableCellColor.buttonPos || [1120,620];
		var tableButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		tableButton.type = 'tableCellColor';
		tableButton.taskId = taskId;
		tableButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			this.ctx.strokeStyle = '#666';
			this.ctx.lineWidth = 1;
			this.ctx.fillStyle = '#FFF';
			this.ctx.fillRect(10,11,35,33);
			this.ctx.fillStyle = '#393';
			this.ctx.fillRect(10+11*1,11+1*33/4,35/3,33/4);
			this.ctx.beginPath();
			for (var i = 0; i < 5; i++) {
				this.ctx.moveTo(10,11+i*33/4);
				this.ctx.lineTo(45,11+i*33/4);
			}
			for (var i = 0; i < 4; i++) {
				this.ctx.moveTo(10+i*35/3,11);
				this.ctx.lineTo(10+i*35/3,44);
			}
			this.ctx.stroke();
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = '#000';
			this.ctx.strokeRect(10,11,35,33);			
		}
		tableButton.click = function() {
			draw[taskId].tableCellColorVisible = !draw[taskId].tableCellColorVisible;
			if (draw[taskId].tableCellColorVisible == true) {
				tableMenuClose();
				changeDrawMode('tableCellColor');
				showObj(draw[taskId].tableCellColorCanvas,draw[taskId].tableCellColorCanvas.data);
			} else {
				changeDrawMode();
				hideObj(draw[taskId].tableCellColorCanvas,draw[taskId].tableCellColorCanvas.data);
			}			
		}			
		draw[taskId].buttons.push(tableButton);

		var left = buttonPos[0];
		var top = buttonPos[1]+53;		
		var tableCellColorCanvas = createCanvas(left,top,110,110,false,false,true,zIndex+100);
		tableCellColorCanvas.isStaticMenuCanvas = true;					
		draw[taskId].tableCellColorCanvas = tableCellColorCanvas;
		draw[taskId].tableCellColorsVisible = false;
		
		tableCellColorCanvas.colors = [['none','#000','#333','#666'],['#999','#CCC','#FFF','#FFC',],['#FCF','#CFF','#FCC','#CFC'],['#CCF','#F00','#393','#00F']];
		tableCellColorCanvas.draw = function() {
			var ctx = this.ctx;
			roundedRect(ctx,3,3,this.data[102]-6,this.data[103]-6,8,6,'#000','#FFC');
		
			// draw color buttons
			for (var i = 0; i < this.colors.length; i++) {
				for (var j = 0; j < this.colors[i].length; j++) {
					if (i == 0 && j == 0) {
						roundedRect(ctx,10,10,22.5,22.5,0,2,'#000');
						ctx.beginPath();
						ctx.strokeStyle = '#000';
						ctx.lineWidth = 2;
						ctx.moveTo(10,10);
						ctx.lineTo(32.5,32.5);
						ctx.moveTo(32.5,10);
						ctx.lineTo(10,32.5);			
						ctx.stroke();						
					} else {
						roundedRect(ctx,10+22.5*i,10+22.5*j,22.5,22.5,0,2,'#000',this.colors[j][i]);
						roundedRect(ctx,210+22.5*i,10+22.5*j,22.5,22.5,0,2,'#000',this.colors[j][i]);
					}
				}
			}

		}
		tableCellColorCanvas.draw();
	
		addListenerMove(tableCellColorCanvas,function(e) {
			updateMouse(e);
			var l = e.target.data[100];
			var t = e.target.data[101];
			if (mouseHitRect(l+10,t+10,90,90)) {
				e.target.style.cursor = draw[taskId].cursors.pointer;
			} else {
				e.target.style.cursor = draw[taskId].cursors.default;
			}
		});
		
		addListener(tableCellColorCanvas,function(e) {
			if (e.target.style.cursor == draw[taskId].cursors.default) return;
			updateMouse(e);
			var l = e.target.data[100];
			var t = e.target.data[101];
			var color = this.colors[Math.floor((mouse.y-(t+10))/22.5)][Math.floor((mouse.x-(l+10))/22.5)];
			for (var i = 0; i < draw[taskId].path.length; i++) {
				if (draw[taskId].path[i].selected == true) {
					var path = draw[taskId].path[i];
					for (var j = 0; j < path.obj.length; j++) {
						if (path.obj[j].type == 'table' || path.obj[j].type == 'table2') {			
							var cells = path.obj[j].cells;
							for (var r = 0; r < cells.length; r++) {
								for (var c = 0; c < cells[r].length; c++) {
									if (cells[r][c].selected == true) {
										cells[r][c].color = color;
									}
								}
							}
						}
					}
					if (pathCanvasMode) {
						pathCanvasDraw(path);
					} else {
						drawCanvasPath(draw[taskId].path.indexOf(path));
					}
				}
			}
		});	
	}
	if (typeof object.tableInputs == 'object') {
		var buttonPos = object.tableInputs.buttonPos || [1120,620];
		var tableInputsButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		tableInputsButton.type = 'tableInputs';
		tableInputsButton.taskId = taskId;
		tableInputsButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			this.ctx.strokeStyle = '#666';
			this.ctx.lineWidth = 1;
			this.ctx.fillStyle = '#FFF';
			this.ctx.fillRect(10,11,35,33);
			this.ctx.fillStyle = '#CCC';
			this.ctx.fillRect(10,11,35,33/4);
			for (var i = 0; i < 5; i++) {
				this.ctx.moveTo(10,11+i*33/4);
				this.ctx.lineTo(45,11+i*33/4);
			}
			for (var i = 0; i < 4; i++) {
				this.ctx.moveTo(10+i*35/3,11);
				this.ctx.lineTo(10+i*35/3,44);
			}
			this.ctx.stroke();
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = '#000';
			this.ctx.strokeRect(10,11,35,33);

			this.ctx.fillStyle = '#FFF';	
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 2;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
			this.ctx.beginPath();
			this.ctx.fillRect(28,35,20,13);
			this.ctx.strokeRect(28,35,20,13);
			this.ctx.stroke();
			text({context:this.ctx,left:28,width:20,top:29,textArray:['<<font:Georgia>><<fontSize:10>><<align:center>>I']});			
		}
		tableInputsButton.click = function() {
			for (var i = 0; i < draw[taskId].path.length; i++) {
				if (draw[taskId].path[i].selected == true) {
					for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
						if (draw[taskId].path[i].obj[j].type == 'table') {
							var cells = draw[taskId].path[i].obj[j].cells;
							for (var r = 0; r < cells.length; r++) {
								for (var c = 0; c < cells[r].length; c++) {
									if (cells[r][c].selected == true) {
										if (typeof cells[r][c].input !== 'boolean') {
											cells[r][c].input = true;
										} else {
											cells[r][c].input = !cells[r][c].input;
										}
									}
								}
							}
						}
					}
				}
			}
			drawCanvasPaths();			
		}			
		draw[taskId].buttons.push(tableInputsButton);
	}	
	if (typeof object.select == 'object') {
		var buttonPos = object.select.buttonPos || [1120,620];
		var selectButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		selectButton.type = 'select';
		selectButton.taskId = taskId;
		selectButton.draw = function() {
			if (draw[taskId].drawMode !== 'select') {
				var color = draw[taskId].buttonColor;
			} else {
				var color = draw[taskId].buttonSelectedColor;
			}	
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:20>><<align:center>>SEL']});			
		}
		selectButton.click = function() {
			changeDrawMode('select');			
		}		
		draw[taskId].buttons.push(selectButton);
	}
	if (typeof object.clone == 'object') {
		var buttonPos = object.clone.buttonPos || [1120,620];
		var cloneButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		cloneButton.type = 'clone';
		cloneButton.taskId = taskId;
		cloneButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:12>><<align:center>>CLONE']});				
		}
		cloneButton.click = function() {
			clonePaths();
			/*var clones = [];
			var pMax = draw[taskId].path.length;
			for (var p = 0; p < pMax; p++) {
				if (draw[taskId].path[p].selected == true) {
					var path = clone(draw[taskId].path[p]);
					clones.push(path);
					draw[taskId].path[p].selected = false;
				}
			}
			reviveDrawPaths(clones);
			draw[taskId].path = draw[taskId].path.concat(clones);
			drawCanvasPaths();	*/
		}		
		draw[taskId].buttons.push(cloneButton);
	}
	if (typeof object.trigger == 'object') {
		var buttonPos = object.trigger.buttonPos || [1120,620];
		var triggerButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		triggerButton.type = 'trigger';
		triggerButton.taskId = taskId;
		triggerButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:55,top:5,textArray:['<<font:Arial>><<fontSize:14>><<align:center>>TRIG<<br>>GER']});			
		}
		triggerButton.click = function() {
			draw[taskId].triggerEnabled = !draw[taskId].triggerEnabled;
			if (draw[taskId].triggerEnabled == true) {
				draw[taskId].stepNum = 0;
				showSlider(slider[taskId][1]);
			} else {
				hideSlider(slider[taskId][1]);
			}
			for (var i = 0; i < draw[taskId].path.length; i++) {
				updateBorder(draw[taskId].path[i]);
			}
			drawCanvasPaths();
			calcCursorPositions();
		}		
		draw[taskId].buttons.push(triggerButton);
		draw[taskId].stepNumChange = function() {
			drawCanvasPaths();
		}
		createSlider({
			id:1,
			left:50,
			top:700,
			width:400,
			height:60,
			zIndex:10000000,
			vari:'Step',
			linkedVar:'draw['+taskId+'].triggerNum',
			varChangeListener:'draw['+taskId+'].stepNumChange',
			min:0,
			max:1,
			startNum:0,
			discrete:true,
			stepNum:1,
			snap:true,
			snapNum:1,
			visible:false
		});
	}
	if (typeof object.video == 'object') {
		var buttonPos = object.video.buttonPos || [1120,620];
		var videoButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		videoButton.type = 'video';
		videoButton.taskId = taskId;
		videoButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			roundedRect(this.ctx,8,14,39,27,5,0,'#FFC','#FFC');
			drawPath({ctx:this.ctx,closed:true,fillColor:'#000',path:[[22,27.5-7],[36,27.5],[22,27.5+7]]});
			for (var i = 0; i < 4; i++) {
				roundedRect(this.ctx,10+i*(3+(35-4*3)/3),8,3,3,0,0,'#FFC','#FFC');
				roundedRect(this.ctx,10+i*(3+(35-4*3)/3),44,3,3,0,0,'#FFC','#FFC');
			}			
		}
		videoButton.click = function() {
			addVideo();
		}		
		draw[taskId].buttons.push(videoButton);
	}	
	if (typeof object.group == 'object') {
		var buttonPos = object.group.buttonPos || [1120,620];
		var groupButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		groupButton.type = 'group';
		groupButton.taskId = taskId;
		groupButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:12>><<align:center>>GROUP']});			
		}
		groupButton.click = function() {
			groupPaths();
			/*var selected = [];
			for (var i = 0; i < draw[taskId].path.length; i++) {
				if (draw[taskId].path[i].selected == true) selected.push(i);
			}
			if (selected.length > 1) {
				var pathObject = [];
				for (i = 0; i < selected.length; i++) {
					for (var k = 0; k < draw[taskId].path[selected[i]].obj.length; k++) {
						pathObject.push(draw[taskId].path[selected[i]].obj[k]);
					}
				}
				draw[taskId].path[selected[selected.length-1]] = {obj:pathObject.slice(0),selected:true};
				updateBorder(draw[taskId].path[selected[selected.length-1]]);
				for (var i = selected.length - 2; i >= 0; i--) {
					draw[taskId].path.splice(selected[i],1);	
				}
				drawCanvasPaths();
			} else if (selected.length == 1) {
				var pathObject = [];
				for (var i = 0; i < draw[taskId].path[selected[0]].obj.length; i++) {
					pathObj = [[draw[taskId].path[selected[0]].obj[i]],true];
					updateBorder(pathObj);
					pathObject.push(pathObj);
				}
				draw[taskId].path.splice(selected[0],1);
				for (var i = pathObject.length - 1; i >= 0; i--) {
					draw[taskId].path.splice(selected[0],0,pathObject[i]);
				}
				drawCanvasPaths();
			}*/			
		}		
		draw[taskId].buttons.push(groupButton);
	}
	if (typeof object.delete == 'object') {
		var buttonPos = object.delete.buttonPos || [1120,620];
		var deleteButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		deleteButton.type = 'delete';
		deleteButton.taskId = taskId;
		deleteButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:20>><<align:center>><<color:#F00>>DEL']});			
		}
		deleteButton.click = function() {
			deleteSelectedPaths();
		}		
		draw[taskId].buttons.push(deleteButton);
	}	
	if (typeof object.rect == 'object') {
		var buttonPos = object.rect.buttonPos || [1120,620];
		var rectButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		rectButton.type = 'rect';
		rectButton.taskId = taskId;
		rectButton.draw = function() {
			if (draw[taskId].drawMode !== 'rect') {
				var color = draw[taskId].buttonColor;
				this.style.cursor = draw[taskId].cursors.pointer;
			} else {
				var color = draw[taskId].buttonSelectedColor;
				this.style.cursor = 'url('+draw[taskId].lineCursor+') '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+', auto';
			}
			
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineWidth = draw[taskId].thickness;;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.beginPath();
			this.ctx.strokeRect(12.5,17.5,30,20);
			this.ctx.stroke();			
		}
		rectButton.click = function() {
			changeDrawMode('rect');			
		}			
		draw[taskId].buttons.push(rectButton);
	}
	if (typeof object.square == 'object') {
		var buttonPos = object.square.buttonPos || [1120,620];
		var squareButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		squareButton.type = 'square';
		squareButton.taskId = taskId;
		squareButton.draw = function() {
			if (draw[taskId].drawMode !== 'square') {
				var color = draw[taskId].buttonColor;
				this.style.cursor = draw[taskId].cursors.pointer;
			} else {
				var color = draw[taskId].buttonSelectedColor;
				this.style.cursor = 'url('+draw[taskId].lineCursor+') '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+', auto';
			}
			
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineWidth = draw[taskId].thickness;;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.beginPath();
			this.ctx.strokeRect(15,15,25,25);
			this.ctx.stroke();			
		}
		squareButton.click = function() {
			changeDrawMode('square');			
		}		
		draw[taskId].buttons.push(squareButton);
	}
	if (typeof object.polygon == 'object') {
		var buttonPos = object.polygon.buttonPos || [1120,620];
		var polygonButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		polygonButton.type = 'polygon';
		polygonButton.taskId = taskId;
		polygonButton.draw = function() {
			if (draw[taskId].drawMode !== 'polygon') {
				var color = draw[taskId].buttonColor;
				this.style.cursor = draw[taskId].cursors.pointer;
			} else {
				var color = draw[taskId].buttonSelectedColor;
				this.style.cursor = 'url('+draw[taskId].lineCursor+') '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+', auto';
			}
			
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineWidth = draw[taskId].thickness;;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.beginPath();
			this.ctx.moveTo(10,25);
			this.ctx.lineTo(25,10);
			this.ctx.lineTo(45,30);
			this.ctx.lineTo(30,45);
			this.ctx.lineTo(20,45);
			this.ctx.lineTo(10,25);
			this.ctx.stroke();			
		}
		polygonButton.click = function() {
			changeDrawMode('polygon');
		}		
		draw[taskId].buttons.push(polygonButton);
	}	
	if (typeof object.circle == 'object') {
		var buttonPos = object.circle.buttonPos || [1120,620];
		var circleButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		circleButton.type = 'circle';
		circleButton.taskId = taskId;
		circleButton.draw = function() {
			if (draw[taskId].drawMode !== 'circle') {
				var color = draw[taskId].buttonColor;
				this.style.cursor = draw[taskId].cursors.pointer;
			} else {
				var color = draw[taskId].buttonSelectedColor;
				this.style.cursor = 'url('+draw[taskId].lineCursor+') '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+', auto';
			}
			
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineWidth = draw[taskId].thickness;;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.beginPath();
			this.ctx.arc(27.5,27.5,15,0,2*Math.PI);
			this.ctx.stroke();			
		}
		circleButton.click = function() {
			changeDrawMode('circle');			
		}		
		draw[taskId].buttons.push(circleButton);
	}
	if (typeof object.ellipse == 'object') {
		var buttonPos = object.ellipse.buttonPos || [1120,620];
		var ellipseButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		ellipseButton.type = 'ellipse';
		ellipseButton.taskId = taskId;
		ellipseButton.draw = function() {
			if (draw[taskId].drawMode !== 'ellipse') {
				var color = draw[taskId].buttonColor;
				this.style.cursor = draw[taskId].cursors.pointer;
			} else {
				var color = draw[taskId].buttonSelectedColor;
				this.style.cursor = 'url('+draw[taskId].lineCursor+') '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+', auto';
			}
			
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			
			this.ctx.strokeStyle = draw[taskId].color;
			this.ctx.lineWidth = draw[taskId].thickness;;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.save();
			this.ctx.translate(27.5,27.5);
			this.ctx.scale(1.5,1);
			this.ctx.beginPath();
			this.ctx.arc(0,0,10,0,2*Math.PI);
			this.ctx.stroke();
			this.ctx.restore();			
		}
		ellipseButton.click = function() {
			changeDrawMode('ellipse');			
		}		
		draw[taskId].buttons.push(ellipseButton);
	}
	if (typeof object.button == 'object') {
		var buttonPos = object.button.buttonPos || [1120,620];
		var buttonButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		buttonButton.type = 'button';
		buttonButton.taskId = taskId;
		buttonButton.draw = function() {
			if (draw[taskId].drawMode !== 'button') {
				var color = draw[taskId].buttonColor;
				this.style.cursor = draw[taskId].cursors.pointer;
			} else {
				var color = draw[taskId].buttonSelectedColor;
				this.style.cursor = 'url('+draw[taskId].lineCursor+') '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+', auto';
			}
			
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			
			this.ctx.fillStyle = '#6F9';	
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 2;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.beginPath();
			this.ctx.fillRect(8,15,55-16,25);
			this.ctx.strokeRect(8,15,55-16,25);
			this.ctx.stroke();
			
			text({context:this.ctx,left:8,width:55-16,top:15,textArray:['<<font:Hobo>><<fontSize:20>><<align:center>>bttn']});			
		}
		buttonButton.click = function() {
			if (draw[taskId].fillColor == '#000' || draw[taskId].fillColor == 'none') {
				var fillColor = '#6F9';
			} else {
				var fillColor = draw[taskId].fillColor;	
			}
			deselectAllPaths();
			var mInput = createMathsInput2({
				left:50-draw[taskId].drawRelPos[0],
				top:200-draw[taskId].drawRelPos[1],
				width:150,
				height:2*draw[taskId].drawArea[3],
				varSize:{minWidth:30,maxWidth:150,minHeight:60,maxHeight:60},
				backColor:'none',
				selectColor:'none',
				border:false,
				borderColor:'#00F',
				borderWidth:1,
				borderDash:[5,8],
				textAlign:'center',
				vertAlign:'middle',
				maxLines:100,
				selectable:true,
				zIndex:draw[taskId].zIndex,
				pointerCanvas:draw[taskId].cursorCanvas
			});
			setMathsInputText(mInput,['<<font:Hobo>><<fontSize:32>><<align:center>>button']);
			draw[taskId].path.push({obj:[{
				type:'button',
				thickness:4,
				fillColor:fillColor,
				color:'#000',
				left:50-draw[taskId].drawRelPos[0],
				top:200-draw[taskId].drawRelPos[1],
				width:150,
				height:60,
				text:['<<font:Hobo>><<fontSize:32>><<align:center>>button'],
				mathsInput:mInput,
				backColor:'none',
				selectColor:'none',
				textAlign:'center'
			}],selected:true,trigger:[]});
			//mInput.drawPath = draw[taskId].path[draw[taskId].path.length-1];
			updateBorder(draw[taskId].path[draw[taskId].path.length-1]);
			changeDrawMode();
			drawCanvasPaths();			
		}		
		draw[taskId].buttons.push(buttonButton);
	}	
	if (typeof object.text == 'object') {
		var buttonPos = object.text.buttonPos || [1120,620];
		var textButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		textButton.type = 'text';
		textButton.taskId = taskId;
		textButton.draw = function() {
			if (draw[taskId].drawMode !== 'textStart') {
				var color = draw[taskId].buttonColor;
			} else {
				var color = draw[taskId].buttonSelectedColor;
			}	
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			text({context:this.ctx,left:0,width:55,top:5,textArray:['<<font:Arial>><<fontSize:35>><<align:center>>A']});			
		}
		textButton.click = function() {
			changeDrawMode('textStart');			
		}		
		draw[taskId].buttons.push(textButton);
	}
	if (typeof object.input == 'object') {
		var buttonPos = object.input.buttonPos || [1120,620];
		var inputButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		inputButton.type = 'input';
		inputButton.taskId = taskId;
		inputButton.draw = function() {
			if (draw[taskId].drawMode !== 'input') {
				var color = draw[taskId].buttonColor;
				this.style.cursor = draw[taskId].cursors.pointer;
			} else {
				var color = draw[taskId].buttonSelectedColor;
				this.style.cursor = 'url('+draw[taskId].lineCursor+') '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+', auto';
			}
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			this.ctx.fillStyle = '#FFF';	
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 2;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
			this.ctx.beginPath();
			this.ctx.fillRect(8,15,55-16,25);
			this.ctx.strokeRect(8,15,55-16,25);
			this.ctx.stroke();
			
			text({context:this.ctx,left:8,width:55-16,top:15,textArray:['<<font:Georgia>><<fontSize:20>><<align:center>>I']});			
		}
		inputButton.click = function() {
			deselectAllPaths();
			
			var mInput = createMathsInput2({
				left:100-draw[taskId].drawRelPos[0],
				top:200-draw[taskId].drawRelPos[1],
				width:150,
				height:2*draw[taskId].drawArea[3],
				fontSize:30,
				varSize:{minWidth:30,maxWidth:150,minHeight:60,maxHeight:60,padding:10},
				backColor:'none',
				selectColor:'none',
				border:false,
				borderColor:'#00F',
				borderWidth:1,
				borderDash:[5,8],
				textAlign:'center',
				vertAlign:'middle',
				maxLines:1,
				selectable:true,
				zIndex:draw[taskId].zIndex,
				pointerCanvas:draw[taskId].cursorCanvas
			});
			setMathsInputText(mInput,['<<font:Arial>><<fontSize:32>><<align:center>>']);
			//mInput.drawPath = draw[taskId].path[draw[taskId].path.length-1];
			
			var leftInput = createMathsInput2({
				left:100-800-draw[taskId].drawRelPos[0],
				top:200-draw[taskId].drawRelPos[1],
				width:800,
				height:2*draw[taskId].drawArea[3],
				varSize:{minWidth:30,maxWidth:800,minHeight:50,maxHeight:50,padding:0},
				backColor:'none',
				selectColor:'none',
				border:true,
				borderColor:'#00F',
				borderWidth:1,
				borderDash:[5,8],
				textAlign:'right',
				vertAlign:'middle',
				maxLines:1,
				fontSize:32,
				selectable:true,
				zIndex:draw[taskId].zIndex,
				pointerCanvas:draw[taskId].cursorCanvas
			});
			//leftInput.drawPath = draw[taskId].path[draw[taskId].path.length-1];
			
			var rightInput = createMathsInput2({
				left:250-draw[taskId].drawRelPos[0],
				top:200-draw[taskId].drawRelPos[1],
				width:800,
				height:2*draw[taskId].drawArea[3],
				varSize:{minWidth:30,maxWidth:800,minHeight:50,maxHeight:50,padding:0},
				backColor:'none',
				selectColor:'none',
				border:true,
				borderColor:'#00F',
				borderWidth:1,
				borderDash:[5,8],
				textAlign:'left',
				vertAlign:'middle',
				maxLines:1,
				fontSize:32,
				selectable:true,
				zIndex:draw[taskId].zIndex,
				pointerCanvas:draw[taskId].cursorCanvas
			});
			//rightInput.drawPath = draw[taskId].path[draw[taskId].path.length-1];
			
			draw[taskId].path.push({obj:[{
				type:'input',
				thickness:4,
				fillColor:'#FFF',
				color:'#000',
				left:100-draw[taskId].drawRelPos[0],
				top:200-draw[taskId].drawRelPos[1],
				width:150,
				height:60,
				text:['<<font:Arial>><<fontSize:32>><<align:center>>input'],
				leftText:[],
				rightText:[],
				edit:true,
				mathsInput:mInput,
				leftInput:leftInput,
				rightInput:rightInput,
				backColor:'none',
				selectColor:'none',
				textAlign:'center',
			}],selected:true,trigger:[]});
			repositionPath(draw[taskId].path[draw[taskId].path.length-1]);	
			changeDrawMode();
			drawCanvasPaths();			
		}		
		draw[taskId].buttons.push(inputButton);
	}
	if (typeof object.grid == 'object') {
		var buttonPos = object.grid.buttonPos || [1120,620];
		var gridButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		gridButton.type = 'grid';
		gridButton.taskId = taskId;
		gridButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			this.ctx.strokeStyle = '#666';
			this.ctx.lineWidth = 1;
			for (var i = 0; i < 9; i++) {
				this.ctx.moveTo(10,10+i*35/8);
				this.ctx.lineTo(45,10+i*35/8);
			}
			for (var i = 0; i < 9; i++) {
				this.ctx.moveTo(10+i*35/8,10);
				this.ctx.lineTo(10+i*35/8,45);
			}
			this.ctx.stroke();

			drawArrow({ctx:this.ctx,startX:8,startY:55/2,finX:49,finY:55/2,lineWidth:2,arrowLength:4});
			drawArrow({ctx:this.ctx,finY:6,startX:55/2,startY:47,finX:55/2,lineWidth:2,arrowLength:4});			
		}
		gridButton.click = function() {
			addGrid();
		}		
		draw[taskId].buttons.push(gridButton);
	}	
	if (typeof object.colorSelect == 'object') {
		var colors = object.colorSelect.colors || ['#000','#999','#00F','#F00','#393','#F0F','#93C','#F60'];
		var buttonPos = object.colorSelect.buttonPos || [1120,620];
		var expandTo = object.colorSelect.expandTo || 'left';
		var colorSelectButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		colorSelectButton.type = 'colorSelect';
		colorSelectButton.taskId = taskId;
		colorSelectButton.colors = colors;
		colorSelectButton.draw = function() {
			var color = draw[this.taskId].buttonColor;
			if (draw[this.taskId].colorSelectVisible == true) color = draw[this.taskId].buttonSelectedColor;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			for (var i = 0; i < 9; i++) {
				this.ctx.fillStyle = this.colors[i] || '#FFF';
				this.ctx.fillRect(12.5+10*(i%3),12.5+10*Math.floor(i/3),10,10);
			}
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 1;
			this.ctx.strokeRect(12.5,12.5,30,30);			
		}
		colorSelectButton.click = function() {
			draw[taskId].colorSelectVisible = !draw[taskId].colorSelectVisible;
			if (draw[taskId].colorSelectVisible == true) {
				for (var i = 0; i < draw[taskId].colorButtons.length; i++) {
					showObj(draw[taskId].colorButtons[i],draw[taskId].colorButtons[i].data)
				}
				for (var i = 0; i < container.childNodes.length; i++) {
					if (draw[taskId].colorButtons.indexOf(container.childNodes[i]) == -1) {
						addListenerStart(container.childNodes[i],colorSelectClose);
					}
				}				
			} else {
				for (var i = 0; i < draw[taskId].colorButtons.length; i++) {
					hideObj(draw[taskId].colorButtons[i],draw[taskId].colorButtons[i].data)
				}
				for (var i = 0; i < container.childNodes.length; i++) {
					if (draw[taskId].colorButtons.indexOf(container.childNodes[i]) == -1) {
						removeListenerStart(container.childNodes[i],colorSelectClose);
					}
				}								
			}			
		}		
		draw[taskId].buttons.push(colorSelectButton);
		switch (expandTo) {
			case 'left':
				var left = buttonPos[0] - 125;
				var top = buttonPos[1] + 17.5 - 100;
				break;
			case 'top':
				var left = buttonPos[0] - 32.5;
				var top = buttonPos[1] - 225;		
				break;
			case 'right':
				var left = buttonPos[0] + 60;
				var top = buttonPos[1] + 17.5 - 100;		
				break;
			case 'bottom':
				var left = buttonPos[0] - 32.5;
				var top = buttonPos[1] + 60;		
				break;
		}
		var colorBackButton = createCanvas(left,top,120,220,false,false,false,draw[taskId].drawButtonZIndex);
		colorBackButton.isStaticMenuCanvas = true;					
		roundedRect(colorBackButton.getContext('2d'),3,3,114,214,8,6,'#000',draw[taskId].buttonColor);
		draw[taskId].colorButtons.push(colorBackButton);
		for (var i = 0; i < colors.length; i++) {
			var left2 = left + 10 + 50 * (i % 2);
			var top2 = top + 10 + 50 * Math.floor(i / 2);	
			var colorButton = createCanvas(left2,top2,50,50,false,false,true,draw[taskId].drawButtonZIndex);
			colorButton.isStaticMenuCanvas = true;		
			colorButton.color = colors[i];
			colorButton.ctx.lineCap = 'round';
			colorButton.ctx.lineJoin = 'round';
			colorButton.ctx.lineWidth = 4;
			colorButton.ctx.strokeStyle = '#000';		
			colorButton.ctx.fillStyle = colors[i];
			colorButton.ctx.fillRect(0,0,50,50);
			colorButton.ctx.strokeRect(0,0,50,50);
			addListener(colorButton,function() {
				draw[taskId].color = this.color;
				//changeDrawMode();
				//redrawButtons();
				draw[taskId].cursors.update();
				recalcRulerValues(); // updates the ruler edge draw cursors				
				for (var i = 0; i < draw[taskId].path.length; i++) {
					if (draw[taskId].path[i].selected == true) {
						for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
							draw[taskId].path[i].obj[j].color = this.color;	
							if (draw[taskId].path[i].obj[j].type == 'angle') {
								draw[taskId].path[i].obj[j].lineColor = this.color;
							}
						}
					}
				}
				drawCanvasPaths();
			})
			draw[taskId].colorButtons.push(colorButton);
		}
	}
	if (typeof object.thicknessSelect == 'object') {
		var thicknesses = object.thicknessSelect.thicknessses || [1,3,5,7];
		var buttonPos = object.thicknessSelect.buttonPos || [1120,620];
		var expandTo = object.thicknessSelect.expandTo || 'left';
		var thicknessSelectButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		thicknessSelectButton.type = 'thicknessSelect';
		thicknessSelectButton.taskId = taskId;
		thicknessSelectButton.thicknesses = thicknesses;
		thicknessSelectButton.draw = function() {
			var color = draw[this.taskId].buttonColor;
			if (draw[this.taskId].thicknessSelectVisible == true) color = draw[this.taskId].buttonSelectedColor;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			
			this.ctx.strokeStyle = '#000';
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
			this.ctx.lineWidth = 1;
			this.ctx.beginPath();
			this.ctx.moveTo(10,12);
			this.ctx.lineTo(45,12);
			this.ctx.stroke();
			this.ctx.lineWidth = 3;
			this.ctx.beginPath();
			this.ctx.moveTo(10.5,20);
			this.ctx.lineTo(44.5,20);
			this.ctx.stroke();		
			this.ctx.lineWidth = 5;
			this.ctx.beginPath();
			this.ctx.moveTo(11,29);
			this.ctx.lineTo(44,29);
			this.ctx.stroke();	
			this.ctx.lineWidth = 7;
			this.ctx.beginPath();
			this.ctx.moveTo(11.5,39);
			this.ctx.lineTo(43.5,39);
			this.ctx.stroke();			
		}
		thicknessSelectButton.click = function() {
			draw[taskId].thicknessSelectVisible = !draw[taskId].thicknessSelectVisible;
			if (draw[taskId].thicknessSelectVisible == true) {
				for (var i = 0; i < draw[taskId].thicknessButtons.length; i++) {
					showObj(draw[taskId].thicknessButtons[i],draw[taskId].thicknessButtons[i].data)
				}
				for (var i = 0; i < container.childNodes.length; i++) {
					if (draw[taskId].thicknessButtons.indexOf(container.childNodes[i]) == -1) {
						addListenerStart(container.childNodes[i],thicknessSelectClose);
					}
				}				
			} else {
				for (var i = 0; i < draw[taskId].thicknessButtons.length; i++) {
					hideObj(draw[taskId].thicknessButtons[i],draw[taskId].thicknessButtons[i].data)
				}	
				for (var i = 0; i < container.childNodes.length; i++) {
					if (draw[taskId].thicknessButtons.indexOf(container.childNodes[i]) == -1) {
						removeListenerStart(container.childNodes[i],thicknessSelectClose);
					}
				}							
			}			
		}		
		draw[taskId].buttons.push(thicknessSelectButton);
		switch (expandTo) {
			case 'left':
				var left = buttonPos[0] - 125;
				var top = buttonPos[1] + 17.5 - 100;
				break;
			case 'top':
				var left = buttonPos[0] - 32.5;
				var top = buttonPos[1] - 225;		
				break;
			case 'right':
				var left = buttonPos[0] + 60;
				var top = buttonPos[1] + 17.5 - 100;		
				break;
			case 'bottom':
				var left = buttonPos[0] - 32.5;
				var top = buttonPos[1] + 60;		
				break;
		}
		var thicknessBackButton = createCanvas(left,top,120,220,false,false,false,draw[taskId].drawButtonZIndex);
		thicknessBackButton.isStaticMenuCanvas = true;				
		roundedRect(thicknessBackButton.getContext('2d'),3,3,114,214,8,6,'#000',draw[taskId].buttonColor);
		draw[taskId].thicknessButtons.push(thicknessBackButton);
		for (var i = 0; i < thicknesses.length; i++) {
			var left2 = left + 10;
			var top2 = top + 14 + 50*i - 2.5*i;	
			var thicknessButton = createCanvas(left2,top2,100,50,false,false,true,draw[taskId].drawButtonZIndex);
			thicknessButton.isStaticMenuCanvas = true;
			thicknessButton.thickness = thicknesses[i];
			addListener(thicknessButton,function() {
				draw[taskId].thickness = this.thickness;
				//changeDrawMode();			
				redrawThicknessButtons();
				//redrawButtons();
				draw[taskId].cursors.update();
				for (var i = 0; i < draw[taskId].path.length; i++) {
					if (draw[taskId].path[i].selected == true) {
						for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
							draw[taskId].path[i].obj[j].thickness = this.thickness;
							if (draw[taskId].path[i].obj[j].type == 'angle') {
								draw[taskId].path[i].obj[j].lineWidth = this.thickness;
							}							
						}
					}
				}
				drawCanvasPaths();				
			})
			draw[taskId].thicknessButtons.push(thicknessButton);
		}
		redrawThicknessButtons()
	}	
	if (typeof object.fillColorSelect == 'object') {
		var colors = object.fillColorSelect.colors || ['#FF0','#F0F','#0FF','#CFC','#FCC','#CFF','#FCF','#FFC','#6F9','#000','#F00','#00F','#999','none'];
		var buttonPos = object.fillColorSelect.buttonPos || [1120,620];
		var expandTo = object.fillColorSelect.expandTo || 'left';
		var fillColorSelectButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		fillColorSelectButton.type = 'fillColorSelect';
		fillColorSelectButton.taskId = taskId;
		fillColorSelectButton.colors = colors;
		fillColorSelectButton.draw = function() {
			var color = draw[this.taskId].buttonColor;
			if (draw[this.taskId].fillColorSelectVisible == true) color = draw[this.taskId].buttonSelectedColor;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			for (var i = 0; i < 9; i++) {
				this.ctx.fillStyle = this.colors[i] || '#FFF';
				this.ctx.fillRect(12.5+10*(i%3),12.5+10*Math.floor(i/3),10,10);
			}
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 1;
			this.ctx.strokeRect(12.5,12.5,30,30);			
		}
		fillColorSelectButton.click = function() {
			draw[taskId].fillColorSelectVisible = !draw[taskId].fillColorSelectVisible;
			if (draw[taskId].fillColorSelectVisible == true) {
				for (var i = 0; i < draw[taskId].fillColorButtons.length; i++) {
					showObj(draw[taskId].fillColorButtons[i],draw[taskId].fillColorButtons[i].data)
				}
				for (var i = 0; i < container.childNodes.length; i++) {
					if (draw[taskId].fillColorButtons.indexOf(container.childNodes[i]) == -1) {
						addListenerStart(container.childNodes[i],fillColorSelectClose);
					}
				}				
			} else {
				for (var i = 0; i < draw[taskId].fillColorButtons.length; i++) {
					hideObj(draw[taskId].fillColorButtons[i],draw[taskId].fillColorButtons[i].data)
				}
				for (var i = 0; i < container.childNodes.length; i++) {
					if (draw[taskId].fillColorButtons.indexOf(container.childNodes[i]) == -1) {
						removeListenerStart(container.childNodes[i],fillColorSelectClose);
					}
				}
			}			
		}			
		draw[taskId].buttons.push(fillColorSelectButton);
		switch (expandTo) {
			case 'left':
				var left = buttonPos[0] - 125;
				var top = buttonPos[1] + 17.5 - 100;
				break;
			case 'top':
				var left = buttonPos[0] - 32.5;
				var top = buttonPos[1] - 225;		
				break;
			case 'right':
				var left = buttonPos[0] + 60;
				var top = buttonPos[1] + 17.5 - 100;		
				break;
			case 'bottom':
				var left = buttonPos[0] - 32.5;
				var top = buttonPos[1] + 60;		
				break;
		}
		var colorBackButton = createCanvas(left,top,120,370,false,false,false,draw[taskId].drawButtonZIndex);
		colorBackButton.isStaticMenuCanvas = true;
		roundedRect(colorBackButton.getContext('2d'),3,3,114,364,8,6,'#000',draw[taskId].buttonColor);
		draw[taskId].fillColorButtons.push(colorBackButton);
		for (var i = 0; i < colors.length; i++) {
			var left2 = left + 10 + 50 * (i % 2);
			var top2 = top + 10 + 50 * Math.floor(i / 2);	
			var colorButton = createCanvas(left2,top2,50,50,false,false,true,draw[taskId].drawButtonZIndex);
			colorButton.isStaticMenuCanvas = true;
			colorButton.color = colors[i];
			colorButton.ctx.lineCap = 'round';
			colorButton.ctx.lineJoin = 'round';
			colorButton.ctx.lineWidth = 4;
			colorButton.ctx.strokeStyle = '#000';
			if (colors[i] == 'none') {
				colorButton.ctx.fillStyle = mainCanvasFillStyle;
				colorButton.ctx.fillRect(0,0,50,50);
				colorButton.ctx.save();
				colorButton.ctx.beginPath();
				colorButton.ctx.moveTo(0,0);
				colorButton.ctx.lineTo(50,50);
				colorButton.ctx.moveTo(50,0);
				colorButton.ctx.lineTo(0,50);
				colorButton.ctx.lineWidth = 1;
				colorButton.ctx.strokeStyle = '#000';
				colorButton.ctx.stroke();
				colorButton.ctx.restore();
			} else {
				colorButton.ctx.fillStyle = colors[i];
				colorButton.ctx.fillRect(0,0,50,50);
			}
			colorButton.ctx.strokeRect(0,0,50,50);
			addListener(colorButton,function() {
				draw[taskId].fillColor = this.color;
				//changeDrawMode();
				//redrawButtons();
				draw[taskId].cursors.update();
				for (var i = 0; i < draw[taskId].path.length; i++) {
					if (draw[taskId].path[i].selected == true) {
						for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
							draw[taskId].path[i].obj[j].fillColor = this.color;
							if (draw[taskId].path[i].obj[j].type == 'angle') {
								draw[taskId].path[i].obj[j].lineColor = this.lineColor;
							}							
						}
					}
				}
				drawCanvasPaths();				
			})
			draw[taskId].fillColorButtons.push(colorButton);
		}		
	}
	if (typeof object.drawStyle == 'object') {
		var buttonPos = object.drawStyle.buttonPos || [1120,620];
		var button = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		button.type = 'drawStyle';
		button.taskId = taskId;
		button.draw = function() {
			var color = draw[this.taskId].buttonColor;
			if (draw[this.taskId].drawStyleSelectVisible == true) color = draw[this.taskId].buttonSelectedColor;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			
			this.ctx.strokeStyle = '#000';
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
			this.ctx.lineWidth = 1;
			this.ctx.beginPath();
			this.ctx.moveTo(10,12);
			this.ctx.lineTo(45,12);
			this.ctx.stroke();
			this.ctx.strokeStyle = '#00F';
			this.ctx.lineWidth = 3;
			this.ctx.beginPath();
			this.ctx.moveTo(10.5,20);
			this.ctx.lineTo(44.5,20);
			this.ctx.stroke();		
			this.ctx.strokeStyle = '#F00';
			this.ctx.lineWidth = 5;
			this.ctx.beginPath();
			this.ctx.moveTo(11,29);
			this.ctx.lineTo(44,29);
			this.ctx.stroke();	
			this.ctx.strokeStyle = '#393';
			this.ctx.lineWidth = 7;
			this.ctx.beginPath();
			this.ctx.moveTo(11.5,39);
			this.ctx.lineTo(43.5,39);
			this.ctx.stroke();			
		}
		button.click = function() {
			draw[taskId].drawStyleSelectVisible = !draw[taskId].drawStyleSelectVisible;
			if (draw[taskId].drawStyleSelectVisible == true) {
				changeDrawMode('drawStyle');
				showObj(draw[taskId].drawStyleCanvas,draw[taskId].drawStyleCanvas.data);
				showMathsInput(draw[taskId].drawStyleCanvas.lineColorInput);
				showMathsInput(draw[taskId].drawStyleCanvas.fillColorInput);
				draw[taskId].drawStyleCanvas.selected = [];
				for (var p = 0; p < draw[taskId].path.length; p++) {
					if (boolean(draw[taskId].path[p].selected,false) == true) {
						draw[taskId].drawStyleCanvas.selected.push(p);
					}
				}
				var found = false;
				for (var s = 0; s < draw[taskId].drawStyleCanvas.selected.length; s++) {
					if (found == true) continue;
					var path = draw[taskId].path[draw[taskId].drawStyleCanvas.selected[s]];
					for (var o = 0; o < path.obj.length; o++) {
						if (found == true) continue;
						if (['pen','line','circle','ellipse','rect','square','arc','curve','curve2','polygon'].indexOf(path.obj[o].type) > -1) {
							found = true;
							draw[taskId].drawStyleCanvas.lineWidth = path.obj[o].thickness || 2;
							draw[taskId].drawStyleCanvas.lineColor = path.obj[o].color || '#000';
							draw[taskId].drawStyleCanvas.lineDash = path.obj[o].dash || [0,0];
							draw[taskId].drawStyleCanvas.fillColor = path.obj[o].fillColor || 'none';
						}
					}
				}
				if (found == false) {
					draw[taskId].drawStyleCanvas.lineWidth = draw[taskId].thickness;
					draw[taskId].drawStyleCanvas.lineColor = draw[taskId].color;
					draw[taskId].drawStyleCanvas.lineDash = draw[taskId].dash || [0,0];
					draw[taskId].drawStyleCanvas.fillColor = draw[taskId].fillColor;
				}
				draw[taskId].drawStyleCanvas.draw();
				addListenerMove(draw[taskId].drawStyleCanvas,draw[taskId].drawStyleCanvas.move);
				addListener(draw[taskId].drawStyleCanvas,draw[taskId].drawStyleCanvas.click);
				addListener(window,draw[taskId].drawStyleCanvas.close);
			} else {
				changeDrawMode();
				hideObj(draw[taskId].drawStyleCanvas,draw[taskId].drawStyleCanvas.data);
				hideMathsInput(draw[taskId].drawStyleCanvas.lineColorInput);
				hideMathsInput(draw[taskId].drawStyleCanvas.fillColorInput);
				removeListenerMove(draw[taskId].drawStyleCanvas,draw[taskId].drawStyleCanvas.move);
				removeListener(draw[taskId].drawStyleCanvas,draw[taskId].drawStyleCanvas.click);
				removeListener(window,draw[taskId].drawStyleCanvas.close);
			}			
		}
		draw[taskId].buttons.push(button);
		draw[taskId].dash = [0,0];
		
		var left = buttonPos[0];
		var top = buttonPos[1]+53;
		var drawStyleCanvas = createCanvas(left,top,200,400,false,false,true,zIndex+1001000);
		drawStyleCanvas.isStaticMenuCanvas = true;	
		drawStyleCanvas.selected = -1;
		drawStyleCanvas.button = button;
		draw[taskId].drawStyleCanvas = drawStyleCanvas;
		draw[taskId].drawStyleSelectVisible = false;
		
		drawStyleCanvas.lineColors = [
			['none','#000','#666','#FFF','#060','#393','#6F9','#09F'],
			['#F60','#F90','#FF0','#F0F','#0FF','#0F0','#00F','#F00'],
			['#990','#630','#FF6','#F6F','#6FF','#6F6','#66F','#F66'],
			['#90F','#309','#FFC','#FCF','#CFF','#CFC','#CCF','#FCC']
		];
		drawStyleCanvas.fillColors = [
			['none','#000','#666','#FFF','#060','#393','#6F9','#09F'],
			['#F60','#F90','#FF0','#F0F','#0FF','#0F0','#00F','#F00'],
			['#990','#630','#FF6','#F6F','#6FF','#6F6','#66F','#F66'],
			['#90F','#309','#FFC','#FCF','#CFF','#CFC','#CCF','#FCC']
		];
		drawStyleCanvas.lineColorInput = createMathsInput2({left:left+200-110,top:top+60,width:100,height:20,border:true,fontSize:18,transparent:true,backColor:'#FFC',selectColor:'#FFC',zIndex:zIndex+1001001,visible:false});
		drawStyleCanvas.lineColorInput.onInputEnd = function() {
			var str = replaceAll(this.stringJS,'*','');
			var re = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
			if (str == 'none' || re.test(str) == true) {
				for (var s = 0; s < draw[taskId].drawStyleCanvas.selected.length; s++) {
					var p = draw[taskId].drawStyleCanvas.selected[s];
					for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
						if (['pen','line','circle','ellipse','rect','square','arc','curve','curve2','polygon'].indexOf(draw[taskId].path[p].obj[o].type) > -1) {
							draw[taskId].path[p].obj[o].color = str;
						}
					}
				}
				draw[taskId].color = str;
				draw[taskId].drawStyleCanvas.lineColor = str;
				drawCanvasPaths();
				redrawButtons();
				draw[taskId].drawStyleCanvas.draw();				
			}
		}
		drawStyleCanvas.fillColorInput = createMathsInput2({left:left+200-110,top:top+175+4*22.5,width:100,height:20,border:true,fontSize:18,transparent:true,backColor:'#FFC',selectColor:'#FFC',zIndex:zIndex+1001001,visible:false});
		drawStyleCanvas.fillColorInput.onInputEnd = function() {
			var str = replaceAll(this.stringJS,'*','');
			var re = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$");
			if (str == 'none' || re.test(str) == true) {
				for (var s = 0; s < draw[taskId].drawStyleCanvas.selected.length; s++) {
					var p = draw[taskId].drawStyleCanvas.selected[s];
					for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
						if (['pen','line','circle','ellipse','rect','square','arc','curve','curve2','polygon'].indexOf(draw[taskId].path[p].obj[o].type) > -1) {
							draw[taskId].path[p].obj[o].fillColor = str;
						}
					}
				}
				draw[taskId].fillColor = str;
				draw[taskId].drawStyleCanvas.fillColor = str;
				drawCanvasPaths();
				redrawButtons();
				draw[taskId].drawStyleCanvas.draw();				
			}		
		}
		drawStyleCanvas.cursorPos = [];
		drawStyleCanvas.cursorIndex = -1;
		drawStyleCanvas.left = left;
		drawStyleCanvas.top = top;
		drawStyleCanvas.draw = function() {
			setMathsInputText(draw[taskId].drawStyleCanvas.lineColorInput,draw[0].color);
			setMathsInputText(draw[taskId].drawStyleCanvas.fillColorInput,draw[0].fillColor);
			
			var ctx = this.ctx;
			roundedRect(ctx,3,3,this.data[102]-6,this.data[103]-6,8,6,'#000','#FFC');
			this.cursorPos = [];
			
			var left = this.left;
			var top = this.top;
			var t = 20;
			//console.log(this.lineColor,this.lineWidth,this.lineDash,this.fillColor);
			ctx.strokeStyle = this.lineColor;
			ctx.lineWidth = this.lineWidth;
			ctx.setLineDash(this.lineDash);
			if (this.fillColor !== 'none') {
				ctx.fillStyle = this.fillColor;
				ctx.fillRect(20,t,this.data[102]-40,30);
			}
			ctx.strokeRect(20,t,this.data[102]-40,30);
			ctx.setLineDash([]);
			
			t += 40;
			text({context:ctx,textArray:['<<fontSize:18>>Line'],left:10,top:t,width:this.data[102]-20,height:50,textAlign:'left'});
			t += 30;
			roundedRect(ctx,10,t,22.5,22.5,0,2,'#000');
			roundedRect(ctx,210,t,22.5,22.5,0,2,'#000');
			ctx.beginPath();
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.moveTo(10,t);
			ctx.lineTo(32.5,t+22.5);
			ctx.moveTo(32.5,t);
			ctx.lineTo(10,t+22.5);
			ctx.moveTo(210,t);
			ctx.lineTo(232.5,t+22.5);
			ctx.moveTo(232.5,t);
			ctx.lineTo(210,t+22.5);			
			ctx.stroke();			
			for (var r = 0; r < this.lineColors.length; r++) {
				for (var c = 0; c < this.lineColors[r].length; c++) {
					this.cursorPos.push({rect:[left+10+22.5*c,top+90+22.5*r,22.5,22.5],cursor:'pointer',color:this.lineColors[r][c],type:'lineColor'});
					if (this.lineColors[r][c] == 'none') continue;
					roundedRect(ctx,10+22.5*c,90+22.5*r,22.5,22.5,0,2,'#000',this.lineColors[r][c]);
				}
			}
			
			var t = 90+4*22.5+15;
			text({context:ctx,textArray:['<<fontSize:30>>-'],left:10,top:t,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:30>>+'],left:35,top:t,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:16>>width '+this.lineWidth],left:5,top:t+30,width:60,height:30,textAlign:'center'});
			this.cursorPos.push({rect:[left+10,top+t,25,25],cursor:'pointer',diff:-1,type:'lineWidth'});
			this.cursorPos.push({rect:[left+35,top+t,25,25],cursor:'pointer',diff:1,type:'lineWidth'});
			
			text({context:ctx,textArray:['<<fontSize:30>>-'],left:75,top:t,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:30>>+'],left:100,top:t,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:16>>dash '+this.lineDash[0]],left:70,top:t+30,width:60,height:30,textAlign:'center'});
			this.cursorPos.push({rect:[left+75,top+t,25,25],cursor:'pointer',diff:-1,type:'lineDash0'});
			this.cursorPos.push({rect:[left+100,top+t,25,25],cursor:'pointer',diff:1,type:'lineDash0'});
			
			text({context:ctx,textArray:['<<fontSize:30>>-'],left:140,top:t,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:30>>+'],left:165,top:t,width:25,height:25,textAlign:'center',vertAlign:'middle',box:{color:'#FCF',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:16>>gap '+this.lineDash[1]],left:135,top:t+30,width:60,height:30,textAlign:'center'});			
			this.cursorPos.push({rect:[left+140,top+t,25,25],cursor:'pointer',diff:-1,type:'lineDash1'});
			this.cursorPos.push({rect:[left+165,top+t,25,25],cursor:'pointer',diff:1,type:'lineDash1'});
			
			t += 60;
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.setLineDash([]);
			ctx.beginPath();
			ctx.moveTo(10,t);
			ctx.lineTo(this.data[102]-10,t);
			ctx.stroke();
			
			t += 10;
			text({context:ctx,textArray:['<<fontSize:18>>Fill'],left:10,top:t,width:this.data[102]-20,height:50,textAlign:'left'});
			
			t += 30;
			// draw color buttons
			roundedRect(ctx,10,t,22.5,22.5,0,2,'#000');
			roundedRect(ctx,210,t,22.5,22.5,0,2,'#000');
			ctx.beginPath();
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.moveTo(10,t);
			ctx.lineTo(32.5,t+22.5);
			ctx.moveTo(32.5,t);
			ctx.lineTo(10,t+22.5);
			ctx.moveTo(210,t);
			ctx.lineTo(232.5,t+22.5);
			ctx.moveTo(232.5,t);
			ctx.lineTo(210,t+22.5);			
			ctx.stroke();
			for (var r = 0; r < this.fillColors.length; r++) {
				for (var c = 0; c < this.fillColors[r].length; c++) {
					this.cursorPos.push({rect:[left+10+22.5*c,top+t+22.5*r,22.5,22.5],cursor:'pointer',color:this.fillColors[r][c],type:'fillColor'});
					if (this.fillColors[r][c] == 'none') continue;
					roundedRect(ctx,10+22.5*c,t+22.5*r,22.5,22.5,0,2,'#000',this.fillColors[r][c]);
				}
			}
		}
		drawStyleCanvas.move = function(e) {
			updateMouse(e);
			if (typeof this.cursorPos !== 'undefined') {
				for (var c = 0; c < this.cursorPos.length; c++) {
					var pos = this.cursorPos[c];
					if (mouseHitRect(pos.rect[0],pos.rect[1],pos.rect[2],pos.rect[3])) {
						this.style.cursor = pos.cursor;
						this.cursorIndex = c;
						return;
					}
				}
			}
			this.cursorIndex = -1;
			this.style.cursor = 'default';
		}
		drawStyleCanvas.click = function(e) {
			if (this.cursorIndex == -1) return;
			var pos = this.cursorPos[this.cursorIndex];
			switch (pos.type) {
				case 'lineColor':
					for (var s = 0; s < this.selected.length; s++) {
						var p = this.selected[s];
						for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
							if (['pen','line','circle','ellipse','rect','square','arc','curve','curve2','polygon','button','text'].indexOf(draw[taskId].path[p].obj[o].type) > -1) {
								draw[taskId].path[p].obj[o].color = pos.color;
							}
							if (['angle'].indexOf(draw[taskId].path[p].obj[o].type) > -1) {
								draw[taskId].path[p].obj[o].lineColor = pos.color;
							}
						}
						if (pathCanvasMode) pathCanvasDraw(draw[taskId].path[p]);					
					}
					draw[taskId].color = pos.color;
					this.lineColor = pos.color;
					break;
				case 'fillColor':
					for (var s = 0; s < this.selected.length; s++) {
						var p = this.selected[s];
						for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
							if (['pen','line','circle','ellipse','rect','square','arc','curve','curve2','polygon','button','text','angle'].indexOf(draw[taskId].path[p].obj[o].type) > -1) {
								draw[taskId].path[p].obj[o].fillColor = pos.color;
							}
						}
						if (pathCanvasMode) pathCanvasDraw(draw[taskId].path[p]);
					}
					draw[taskId].fillColor = pos.color;
					this.fillColor = pos.color;
					break;
				case 'lineWidth':
					this.lineWidth += pos.diff;
					if (this.lineWidth < 1) this.lineWidth = 1;
					for (var s = 0; s < this.selected.length; s++) {
						var p = this.selected[s];
						for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
							if (['pen','line','circle','ellipse','rect','square','arc','curve','curve2','polygon','button','text','anglesAroundPoint'].indexOf(draw[taskId].path[p].obj[o].type) > -1) {							
								draw[taskId].path[p].obj[o].thickness = this.lineWidth;
							}
							if (['angle'].indexOf(draw[taskId].path[p].obj[o].type) > -1) {
								draw[taskId].path[p].obj[o].lineWidth = this.lineWidth;
							}							
						}
						if (pathCanvasMode) pathCanvasDraw(draw[taskId].path[p]);
					}
					draw[taskId].thickness = this.lineWidth;
					break;
				case 'lineDash0':
					this.lineDash[0] += pos.diff;
					if (this.lineDash[0] < 0) this.lineDash[0] = 0;
					for (var s = 0; s < this.selected.length; s++) {
						var p = this.selected[s];
						for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
							if (['pen','line','circle','ellipse','rect','square','arc','curve','curve2','polygon','button','text'].indexOf(draw[taskId].path[p].obj[o].type) > -1) {
								draw[taskId].path[p].obj[o].dash = clone(this.lineDash);
							}
						}
						if (pathCanvasMode) pathCanvasDraw(draw[taskId].path[p]);
					}
					draw[taskId].dash = clone(this.lineDash);
					break;
				case 'lineDash1':
					this.lineDash[1] += pos.diff;
					if (this.lineDash[1] < 0) this.lineDash[1] = 0;
					for (var s = 0; s < this.selected.length; s++) {
						var p = this.selected[s];
						for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
							if (['pen','line','circle','ellipse','rect','square','arc','curve','curve2','polygon','button','text'].indexOf(draw[taskId].path[p].obj[o].type) > -1) {
								draw[taskId].path[p].obj[o].dash = clone(this.lineDash);
							}
						}
						if (pathCanvasMode) pathCanvasDraw(draw[taskId].path[p]);
					}
					draw[taskId].dash = clone(this.lineDash);
					break;
			}
			if (pathCanvasMode) {
				
			} else {
				drawCanvasPaths();
			}
			redrawButtons();
			this.draw();
		}
		drawStyleCanvas.close = function(e) {
			if (e.target == draw[taskId].drawStyleCanvas) return;
			if (e.target == draw[taskId].drawStyleCanvas.button) return;
			if (e.target == draw[taskId].drawStyleCanvas.lineColorInput.cursorCanvas) return;
			if (e.target == draw[taskId].drawStyleCanvas.fillColorInput.cursorCanvas) return;
			draw[taskId].drawStyleSelectVisible = false;
			changeDrawMode();
			redrawButtons();
			hideObj(draw[taskId].drawStyleCanvas,draw[taskId].drawStyleCanvas.data);
			hideMathsInput(draw[taskId].drawStyleCanvas.lineColorInput);
			hideMathsInput(draw[taskId].drawStyleCanvas.fillColorInput);
			removeListenerMove(draw[taskId].drawStyleCanvas,draw[taskId].drawStyleCanvas.move);
			removeListener(draw[taskId].drawStyleCanvas,draw[taskId].drawStyleCanvas.click);
			removeListener(window,draw[taskId].drawStyleCanvas.close);			
		}
	}
	if (typeof object.align == 'object') {
		var buttonPos = object.align.buttonPos || [1120,620];
		var button = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		button.type = 'align';
		button.taskId = taskId;
		button.draw = function() {
			var color = draw[this.taskId].buttonColor;
			if (draw[this.taskId].alignSelectVisible == true) color = draw[this.taskId].buttonSelectedColor;
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',color);
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:14>><<align:center>>ALIGN']});			
		}
		button.click = function() {
			draw[taskId].alignSelectVisible = !draw[taskId].alignSelectVisible;
			if (draw[taskId].alignSelectVisible == true) {
				changeDrawMode('align');
				showObj(draw[taskId].alignCanvas,draw[taskId].alignCanvas.data);
				draw[taskId].alignCanvas.draw();
				addListenerMove(draw[taskId].alignCanvas,draw[taskId].alignCanvas.move);
				addListener(draw[taskId].alignCanvas,draw[taskId].alignCanvas.click);
				addListener(window,draw[taskId].alignCanvas.close);
			} else {
				changeDrawMode();
				hideObj(draw[taskId].alignCanvas,draw[taskId].alignCanvas.data);
				removeListenerMove(draw[taskId].alignCanvas,draw[taskId].alignCanvas.move);
				removeListener(draw[taskId].alignCanvas,draw[taskId].alignCanvas.click);
				removeListener(window,draw[taskId].alignCanvas.close);
			}			
		}
		draw[taskId].buttons.push(button);
		
		var left = buttonPos[0];
		var top = buttonPos[1]+53;
		var alignCanvas = createCanvas(left,top,170,170,false,false,true,zIndex+1001000);
		alignCanvas.isStaticMenuCanvas = true;	
		alignCanvas.selected = -1;
		alignCanvas.button = button;
		draw[taskId].alignCanvas = alignCanvas;
		draw[taskId].alignSelectVisible = false;
		
		alignCanvas.cursorPos = [];
		alignCanvas.cursorIndex = -1;
		alignCanvas.left = left;
		alignCanvas.top = top;
		alignCanvas.draw = function() {
			var ctx = this.ctx;
			roundedRect(ctx,3,3,this.data[102]-6,this.data[103]-6,8,6,'#000','#FFC');
			this.cursorPos = [];
			
			var left = this.left;
			var top = this.top;
			
			text({context:ctx,textArray:['<<fontSize:14>>Left'],left:10,top:10,width:50,height:50,textAlign:'center',vertAlign:'middle',box:{color:'#CFC',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:14>>Center'],left:60,top:10,width:50,height:50,textAlign:'center',vertAlign:'middle',box:{color:'#CFC',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:14>>Right'],left:110,top:10,width:50,height:50,textAlign:'center',vertAlign:'middle',box:{color:'#CFC',borderWidth:2}});
			
			text({context:ctx,textArray:['<<fontSize:14>>Top'],left:10,top:60,width:50,height:50,textAlign:'center',vertAlign:'middle',box:{color:'#CFC',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:14>>Middle'],left:60,top:60,width:50,height:50,textAlign:'center',vertAlign:'middle',box:{color:'#CFC',borderWidth:2}});
			text({context:ctx,textArray:['<<fontSize:14>>Bottom'],left:110,top:60,width:50,height:50,textAlign:'center',vertAlign:'middle',box:{color:'#CFC',borderWidth:2}});
			
			text({context:ctx,textArray:['<<fontSize:14>>to margin (left)'],left:10,top:110,width:150,height:50,textAlign:'center',vertAlign:'middle',box:{color:'#CFC',borderWidth:2}});
			
			this.cursorPos.push({rect:[left+10,top+10,50,50],cursor:'pointer',type:'left'});
			this.cursorPos.push({rect:[left+60,top+10,50,50],cursor:'pointer',type:'center'});
			this.cursorPos.push({rect:[left+110,top+10,50,50],cursor:'pointer',type:'right'});
			this.cursorPos.push({rect:[left+10,top+60,50,50],cursor:'pointer',type:'top'});
			this.cursorPos.push({rect:[left+60,top+60,50,50],cursor:'pointer',type:'middle'});
			this.cursorPos.push({rect:[left+110,top+60,50,50],cursor:'pointer',type:'bottom'});
			this.cursorPos.push({rect:[left+10,top+110,150,50],cursor:'pointer',type:'toMargin'});
		}
		alignCanvas.move = function(e) {
			updateMouse(e);
			if (typeof this.cursorPos !== 'undefined') {
				for (var c = 0; c < this.cursorPos.length; c++) {
					var pos =this.cursorPos[c];
					if (mouseHitRect(pos.rect[0],pos.rect[1],pos.rect[2],pos.rect[3])) {
						this.style.cursor = pos.cursor;
						this.cursorIndex = c;
						return;
					}
				}
			}			
			this.cursorIndex = -1;
			this.style.cursor = 'default';
		}
		alignCanvas.click = function(e) {
			if (this.cursorIndex == -1) return;
			var pos = this.cursorPos[this.cursorIndex];
			if (pos.type == 'toMargin') {
				snapToMargin();
			} else {
				alignPaths(pos.type);
			}
		}
		alignCanvas.close = function(e) {
			if (e.target == draw[taskId].alignCanvas) return;
			if (e.target == draw[taskId].alignCanvas.button) return;
			draw[taskId].alignSelectVisible = false;
			changeDrawMode();
			redrawButtons();
			hideObj(draw[taskId].alignCanvas,draw[taskId].alignCanvas.data);
			removeListenerMove(draw[taskId].alignCanvas,draw[taskId].alignCanvas.move);
			removeListener(draw[taskId].alignCanvas,draw[taskId].alignCanvas.click);
			removeListener(window,draw[taskId].alignCanvas.close);			
		}
	}	
	if (typeof object.save == 'object') {
		var buttonPos = object.save.buttonPos || [1120,620];
		var saveButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		saveButton.type = 'save';
		saveButton.taskId = taskId;
		saveButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:16>><<align:center>>SAVE']});				
		}
		saveButton.click = function() {
			var filename = prompt("Please enter filename", "file");
			saveDrawPaths(filename);		
		}		
		draw[taskId].buttons.push(saveButton);
	}
	if (typeof object.load == 'object') {
		var buttonPos = object.load.buttonPos || [1120,620];
		var loadButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		loadButton.type = 'load';
		loadButton.taskId = taskId;
		loadButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:16>><<align:center>>LOAD']});				
		}
		loadButton.click = function() {
			loadDrawPaths();			
		}		
		draw[taskId].buttons.push(loadButton);
	}
	if (typeof object.png == 'object') {
		var buttonPos = object.png.buttonPos || [1120,620];
		var pngButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		pngButton.type = 'png';
		pngButton.taskId = taskId;
		pngButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:20>><<align:center>>PNG']});			
		}
		pngButton.click = function() {
			var filename = Number(prompt("Scale Factor", "2"));
			png(filename);			
		}		
		draw[taskId].buttons.push(pngButton);
	}
	if (typeof object.pdf == 'object') {
		var buttonPos = object.pdf.buttonPos || [1120,620];
		var pdfButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		pdfButton.type = 'pdf';
		pdfButton.taskId = taskId;
		pdfButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:20>><<align:center>>PDF']});			
		}
		pdfButton.click = function() {
			var filename = prompt("Please enter filename", "file");
			pdf(filename);			
		}		
		draw[taskId].buttons.push(pdfButton);
	}
	if (typeof object.js == 'object') {
		var buttonPos = object.js.buttonPos || [1120,620];
		var jsButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		jsButton.type = 'js';
		jsButton.taskId = taskId;
		jsButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:55,top:15,textArray:['<<font:Arial>><<fontSize:20>><<align:center>>JS']});			
		}
		jsButton.click = function() {
			preview();			
		}		
		draw[taskId].buttons.push(jsButton);
	}
	if (typeof object.qBox == 'object') {
		var buttonPos = object.qBox.buttonPos || [1120,620];
		var qBoxButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		qBoxButton.type = 'qBox';
		qBoxButton.taskId = taskId;
		qBoxButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 2;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.beginPath();
			this.ctx.strokeRect(12,10,31,35);
			this.ctx.stroke();
			text({context:this.ctx,left:0,width:55,top:10,textArray:['<<font:Arial>><<fontSize:25>><<align:center>>Q']});			
		}
		qBoxButton.click = function() {
			addQBox();			
		}		
		draw[taskId].buttons.push(qBoxButton);
	}
	if (typeof object.qBox2 == 'object') {
		var buttonPos = object.qBox2.buttonPos || [1120,620];
		var qBoxButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		qBoxButton.type = 'qBox2';
		qBoxButton.taskId = taskId;
		qBoxButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 2;
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';

			this.ctx.beginPath();
			this.ctx.strokeRect(10,10,35,35);
			this.ctx.stroke();
			text({context:this.ctx,left:0,width:55,top:0,height:55,vertAlign:'middle',textArray:['<<font:Arial>><<fontSize:22>><<align:center>>Q2']});			
		}
		qBoxButton.click = function() {
			if (draw[taskId].qBox2.box.length > 0) return; 
			draw[taskId].qBox2.mode = 'edit';
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("post", "getQ2Data.php", true);
			xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlHttp.onload = function() {
				var data = JSON.parse(this.responseText);
				draw[taskId].topicTagger = {};
				draw[taskId].topicTagger.topics = data.topics;
				draw[taskId].topicTagger.subtopics = data.subtopics;
				
				draw[taskId].allQs = [];
				draw[taskId].allQsData = data.questions;
				for (var i = 0; i < draw[taskId].allQsData.length; i++) {
					draw[taskId].allQsData[i].id = Number(draw[taskId].allQsData[i].id);
					draw[taskId].allQs[i] = Number(draw[taskId].allQsData[i].id);
					draw[taskId].allQsData[i].calc = Boolean(Number(draw[taskId].allQsData[i].calc));
					if (un(draw[taskId].allQsData[i].objective) || draw[taskId].allQsData[i].objective == "") {
						draw[taskId].allQsData[i].objective = [""];
					} else {
						draw[taskId].allQsData[i].objective = JSON.parse(draw[taskId].allQsData[i].objective);
					}
				}
				addQBox2();
				if (!un(addQBox2Buttons)) addQBox2Buttons();
				//qBox2ChangeQId(arrayMin(draw[taskId].allQs));
			}
			xmlHttp.send();			
		}		
		draw[taskId].buttons.push(qBoxButton);
	}
	if (typeof object.multChoice == 'object') {
		var buttonPos = object.multChoice.buttonPos || [1120,620];
		var multChoiceButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		multChoiceButton.type = 'multChoice';
		multChoiceButton.taskId = taskId;
		multChoiceButton.draw = function() {
			roundedRect(this.ctx,3,3,49,49,8,6,'#000',draw[taskId].buttonColor);
			text({context:this.ctx,left:0,width:55,top:0,height:55,vertAlign:'middle',textArray:['<<font:Arial>><<fontSize:18>><<align:center>>ABCD']});			
		}
		multChoiceButton.click = function() {
			addMultChoice();
		}		
		draw[taskId].buttons.push(multChoiceButton);
	}	
	if (typeof object.backGrid == 'object') {
		var buttonPos = object.backGrid.buttonPos || [1120,620];
		var obj = {};
		obj.canvas = createCanvas(draw[taskId].drawArea[0],draw[taskId].drawArea[1],draw[taskId].drawArea[2],draw[taskId].drawArea[3],true,false,false,1);
		obj.menuButton = createCanvas(buttonPos[0],buttonPos[1],55,55,true,false,true,draw[taskId].drawButtonZIndex);
		obj.menuButton.draw = function() {
			var ctx = this.ctx;
			if (draw[taskId].backGrid.showMenu == false) {
				roundedRect(ctx,3,3,49,49,8,6,'#000','#C9F');
			} else {
				roundedRect(ctx,3,3,49,49,8,6,'#000','#FFC');		
			}
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			for (var i = 15; i < 41; i += 12.5) {
				ctx.moveTo(i,0);
				ctx.lineTo(i,55);
				ctx.moveTo(0,i);
				ctx.lineTo(55,i);	
			}
			ctx.stroke();			
		}
		
		obj.show = true;
		obj.snap = true;
		obj.showMenu = false;
		obj.size = 25;
		obj.menuCanvas = createCanvas(buttonPos[0]-169,buttonPos[1]+55,220,400,false,false,true,draw[taskId].drawButtonZIndex+1);
		roundedRect(obj.menuCanvas.ctx,3,3,214,394,8,6,'#000','#C9F');	
		obj.showButton = createCanvas(buttonPos[0]-134,buttonPos[1]+175,150,40,false,false,true,draw[taskId].drawButtonZIndex+1);
		obj.snapButton = createCanvas(buttonPos[0]-134,buttonPos[1]+220,150,40,false,false,true,draw[taskId].drawButtonZIndex+1);
		obj.slider = createSlider({id:0,left:buttonPos[0]-150,top:buttonPos[1]+75,width:200,height:50,linkedVar:'draw[taskId].backGrid.size',min:5,max:100,startNum:50,discrete:true,stepNum:5,visible:false,zIndex:draw[taskId].drawButtonZIndex+1,vari:'Grid Size',varChangeListener:'draw[taskId].backGrid.drawBackGrid'});
		drawTextBox(obj.showButton,obj.showButton.ctx,obj.showButton.data,'#6F9','#000',4,'20px Arial','#000','center','Grid On');
		drawTextBox(obj.snapButton,obj.snapButton.ctx,obj.snapButton.data,'#6F9','#000',4,'20px Arial','#000','center','Snapping On');
		
		obj.showHideBackGridMenu = function() {
			var obj = draw[taskId].backGrid;
			obj.showMenu = !obj.showMenu;
			if (obj.showMenu == true) {
				showObj(obj.menuCanvas,obj.menuCanvas.data);
				showObj(obj.showButton,obj.showButton.data);
				showObj(obj.snapButton,obj.snapButton.data);
				showSlider(obj.slider);
				for (var i = 0; i < obj.alignHorizVertButtons.length; i++) {
					obj.alignHorizVertButtons[i].highlight = false;
					obj.alignHorizVertButtons[i].draw();
					showObj(obj.alignHorizVertButtons[i],obj.alignHorizVertButtons[i].data);
				}
				addListener(window,draw[taskId].backGrid.hideBackGridMenu);
			} else {
				hideObj(obj.menuCanvas,obj.menuCanvas.data);
				hideObj(obj.showButton,obj.showButton.data);
				hideObj(obj.snapButton,obj.snapButton.data);
				hideSlider(obj.slider);
				for (var i = 0; i < obj.alignHorizVertButtons.length; i++) {
					hideObj(obj.alignHorizVertButtons[i],obj.alignHorizVertButtons[i].data);
				}
				removeListener(window,draw[taskId].backGrid.hideBackGridMenu);
			}
			obj.menuButton.draw();
		}
		obj.hideBackGridMenu = function(e) {
			var obj = draw[taskId].backGrid;
			if ([
				obj.menuButton,
				obj.menuCanvas,
				obj.showButton,
				obj.snapButton,
				obj.slider.backCanvas,
				obj.slider.sliderCanvas,
				obj.labelCanvas
			].indexOf(e.target) == -1 && obj.alignHorizVertButtons.indexOf(e.target) == -1) {
				obj.showMenu = false;
				hideObj(obj.menuCanvas,obj.menuCanvas.data);
				hideObj(obj.showButton,obj.showButton.data);
				hideObj(obj.snapButton,obj.snapButton.data);
				hideSlider(obj.slider);
				for (var i = 0; i < obj.alignHorizVertButtons.length; i++) {
					hideObj(obj.alignHorizVertButtons[i],obj.alignHorizVertButtons[i].data);
				}
				obj.menuButton.draw();
				removeListener(window,obj.hideBackGridMenu);
			}
		}		

		obj.showHideBackGrid = function() {
			var obj = draw[taskId].backGrid;
			obj.show = !obj.show;
			if (obj.show == true) { 
				drawTextBox(obj.showButton,obj.showButton.ctx,obj.showButton.data,'#6F9','#000',4,'20px Arial','#000','center','Grid On');
			} else {
				drawTextBox(obj.showButton,obj.showButton.ctx,obj.showButton.data,'#F00','#000',4,'20px Arial','#000','center','Grid Off');
			}
			obj.drawBackGrid();
		}
		obj.snapOnOff = function() {
			var obj = draw[taskId].backGrid;			
			obj.snap = !obj.snap;
			draw[taskId].gridSnap = obj.snap;
			if (obj.snap == true) { 
				drawTextBox(obj.snapButton,obj.snapButton.ctx,obj.snapButton.data,'#6F9','#000',4,'20px Arial','#000','center','Snapping On');
			} else {
				drawTextBox(obj.snapButton,obj.snapButton.ctx,obj.snapButton.data,'#F00','#000',4,'20px Arial','#000','center','Snapping Off');
			}
			obj.drawBackGrid();
		}		
		
		obj.drawBackGrid = function() {
			var ctx = draw[taskId].backGrid.canvas.ctx;
			var l = draw[taskId].gridSnapRect[0];
			var t = draw[taskId].gridSnapRect[1];
			var w = draw[taskId].gridSnapRect[2];
			var h = draw[taskId].gridSnapRect[3];
			ctx.clearRect(l,t,w,h);
			var marginSize = mainCanvasBorderWidth;
			var margin = [l+marginSize,l+w-marginSize,t+marginSize,t+h-marginSize];
			if (draw[taskId].backGrid.show == true) {
				var count = -1;
				for (var i = l; i <= l+w; i += draw[taskId].backGrid.size) {
					count++;					
					if (i <= margin[0] || i >= margin[1]) continue;
					if (count % 10 == 0) {
						ctx.strokeStyle = '#BBB';
						ctx.lineWidth = 1.5;
						ctx.setLineDash([]);
					} else if (count % 5 == 0) {
						ctx.strokeStyle = '#CCC';
						ctx.lineWidth = 1;
						ctx.setLineDash([]);
					} else {
						ctx.strokeStyle = '#CCC';
						ctx.lineWidth = 0.5;
						if (draw[taskId].backGrid.size >= 25) ctx.setLineDash([]);				
					}
					ctx.beginPath();
					ctx.moveTo(i,Math.max(margin[2],t));
					ctx.lineTo(i,Math.min(margin[3],t+h));
					ctx.stroke();
				}
				var count = -1;
				for (var i = t; i <= t+h; i += draw[taskId].backGrid.size) {
					count++;
					if (i <= margin[2] || i >= margin[3]) continue;
					if (count % 10 == 0) {
						ctx.strokeStyle = '#BBB';
						ctx.lineWidth = 1.5;
						ctx.setLineDash([]);
					} else if (count % 5 == 0) {
						ctx.strokeStyle = '#CCC';
						ctx.lineWidth = 1;
						ctx.setLineDash([]);
					} else {
						ctx.strokeStyle = '#CCC';
						ctx.lineWidth = 0.5;
						if (draw[taskId].backGrid.size >= 25) ctx.setLineDash([]);				
					}
					ctx.beginPath();
					ctx.moveTo(Math.max(margin[0],l),i);
					ctx.lineTo(Math.min(margin[1],l+w),i);
					ctx.stroke();
				}
				if (arraysEqual(draw[taskId].gridMargin,[0,0,0,0]) == false) {
					var m = draw[taskId].gridMargin;
					ctx.strokeStyle = '#F00';
					ctx.lineWidth = 2;
					ctx.setLineDash([]);
					ctx.strokeRect(m[0],m[1],draw[taskId].drawArea[2]-m[0]-m[2],draw[taskId].drawArea[3]-m[1]-m[3]);
				}
			}
			/*ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.setLineDash([]);
			ctx.beginPath();
			ctx.moveTo(0,100);
			ctx.lineTo(1200,100);
			ctx.stroke();*/
			draw[taskId].gridSnapSize = draw[taskId].backGrid.size;
		}

		obj.menuCanvas.style.cursor = 'default';
		addListenerMove(obj.menuCanvas,function() {
			var obj = draw[taskId].backGrid;
			for (var i = 0; i < obj.alignHorizVertButtons.length; i++) {
				if (obj.alignHorizVertButtons[i].highlight == true) {
					obj.alignHorizVertButtons[i].highlight = false;
					obj.alignHorizVertButtons[i].draw();
				}
			}
		});
		obj.alignHorizVertButtonsMove = function(e) {
			var obj = draw[taskId].backGrid;
			for (var i = 0; i < obj.alignHorizVertButtons.length; i++) {
				if (obj.alignHorizVertButtons[i] == e.target) {
					obj.alignHorizVertButtons[i].highlight = true;
				} else {
					obj.alignHorizVertButtons[i].highlight = false;
				}
				obj.alignHorizVertButtons[i].draw();
			}
		}
		obj.alignHorizVertButtonsPress = function(e) {
			var obj = draw[taskId].backGrid;
			draw[taskId].vertSnap = e.target.vert;
			draw[taskId].horizSnap = e.target.horiz;
			for (var i = 0; i < obj.alignHorizVertButtons.length; i++) {
				obj.alignHorizVertButtons[i].draw();
			}
		}
		draw[taskId].backGrid = obj;
		obj.menuButton.draw();
		obj.drawBackGrid();
		addListener(draw[taskId].backGrid.menuButton,draw[taskId].backGrid.showHideBackGridMenu);
		addListener(draw[taskId].backGrid.showButton,draw[taskId].backGrid.showHideBackGrid);
		addListener(draw[taskId].backGrid.snapButton,draw[taskId].backGrid.snapOnOff);			
		obj.alignHorizVertButtons = [];
		for (var i = 0; i < 9; i++) {
			var button = createCanvas(buttonPos[0]-130+50*(i%3),buttonPos[1]+285+50*Math.floor(i/3),50,50,false,false,true,draw[taskId].drawButtonZIndex+1);
			button.x = 10+15*(i%3);
			button.y = 13+12*Math.floor(i/3);
			button.horiz = ['left','center','right'][i%3];
			button.vert = ['top','middle','bottom'][Math.floor(i/3)];
			button.highlight = false;
			button.draw = function() {
				var color = '#FFC';
				if (this.highlight == true) color = '#FCF';
				if (draw[taskId].vertSnap == this.vert && draw[taskId].horizSnap == this.horiz) color = '#F6F';
				roundedRect(this.ctx,1,1,48,48,0,2,'#000',color);
				roundedRect(this.ctx,10,13,30,24,0,1,'#000','#CCF');
				this.ctx.beginPath();
				this.ctx.strokeStyle = '#F00';
				this.ctx.lineWidth = 2;
				this.ctx.moveTo(this.x-5,this.y-5);
				this.ctx.lineTo(this.x+5,this.y+5);
				this.ctx.moveTo(this.x-5,this.y+5);
				this.ctx.lineTo(this.x+5,this.y-5);	
				this.ctx.stroke();
			}
			button.draw();
			
			addListenerMove(button,draw[taskId].backGrid.alignHorizVertButtonsMove);
			addListener(button,draw[taskId].backGrid.alignHorizVertButtonsPress);
			
			obj.alignHorizVertButtons.push(button);
		}
	}	
	redrawButtons();
	draw[taskId].cursors.update();
	if (defaultMode == 'line') {
		setTimeout(function() {draw[taskId].cursorCanvas.style.cursor = draw[taskId].cursors.cross},1000);
	}
	
	for (var i = 0; i < draw[taskId].buttons.length; i++) {
		addListener(draw[taskId].buttons[i],drawButtonClick);
		draw[taskId].buttons[i].isStaticMenuCanvas = true;
	}
	addListenerMove(draw[taskId].cursorCanvas,drawCanvasMove);
	addListenerStart(draw[taskId].cursorCanvas,drawCanvasStart);
	if (drawMode == 'none') changeDrawMode();
}
function addPen(side,color) {
	var l = 25;
	if (side == 'right') l = 1120;
	if (un(color)) color = '#F00';
	addDrawTools({
		pen:{buttonPos:[l,560]},
		undo:{buttonPos:[l,620]},
		thickness:5,
		color:color
	});	
}

function redrawButtons() {
	if (draw[taskId].drawMode == 'none') changeDrawMode();
	for (var i = 0; i < draw[taskId].buttons.length; i++) {
		draw[taskId].buttons[i].draw();				
	}
}
function drawButtonClick(e) {
	e.target.click();
	redrawButtons();
	drawToolsCanvas();	
}
function addDrawCanvas() {
	var z = draw[taskId].zIndex + 2 * draw[taskId].drawCanvas.length;
	var canvas = createCanvas(draw[taskId].drawArea[0]+draw[taskId].drawRelPos[0],draw[taskId].drawArea[1]+draw[taskId].drawRelPos[1],draw[taskId].drawArea[2],draw[taskId].drawArea[3],true,false,false,z);
	resizeCanvas(canvas,draw[taskId].drawArea[0]+draw[taskId].drawRelPos[0],draw[taskId].drawArea[1]+draw[taskId].drawRelPos[1],draw[taskId].drawArea[2],draw[taskId].drawArea[3]);
	draw[taskId].drawCanvas.push(canvas);
	draw[taskId].toolsCanvas.style.zIndex = z+2;
	draw[taskId].toolsCanvas.data[107] = z+2;
	//draw[taskId].cursorCanvas.style.zIndex = z+3;	
	//draw[taskId].cursorCanvas.data[107] = z+3;
}
function changeDrawRelPos(newX,newY,includeHidden) {
	var prevX = draw[taskId].drawRelPos[0];
	var prevY = draw[taskId].drawRelPos[1];
	draw[taskId].drawRelPos[0] = newX;
	draw[taskId].drawRelPos[1] = newY;
	var x = draw[taskId].drawArea[0] + draw[taskId].drawRelPos[0];
	var y = draw[taskId].drawArea[1] + draw[taskId].drawRelPos[1];
	for (var c = 0; c < draw[taskId].drawCanvas.length; c++) {
		if (includeHidden == false && draw[taskId].drawCanvas[c].parentNode == 'undefined') continue;
		if (includeHidden == false && draw[taskId].flattenMode == true && typeof draw[taskId].pathCanvas !== 'undefined' && draw[taskId].pathCanvas.indexOf(c) == -1 && c < draw[taskId].drawCanvas.length - 2) continue;
		draw[taskId].drawCanvas[c].data[100] = x;
		draw[taskId].drawCanvas[c].data[101] = y;
		resizeCanvas2(draw[taskId].drawCanvas[c],x,y);
	}
	if (includeHidden == true) {
		draw[taskId].cursorCanvas.data[100] = x;
		draw[taskId].cursorCanvas.data[101] = y;
		resizeCanvas2(draw[taskId].cursorCanvas,x,y);
	}
	draw[taskId].toolsCanvas.data[100] = x;
	draw[taskId].toolsCanvas.data[101] = y;
	resizeCanvas2(draw[taskId].toolsCanvas,x,y);
	if (pathCanvasMode) {
		for (var p = 0; p < draw[taskId].path.length; p++) {
			var path = draw[taskId].path[p];
			if (!un(path.ctx) && (path.selected || includeHidden)) {
				repositionPathCanvas(path);
			}
		}
	}
	
	if (typeof draw[taskId].backGrid !== 'undefined') {
		draw[taskId].backGrid.canvas.data[100] = x;
		draw[taskId].backGrid.canvas.data[101] = y;
		resizeCanvas2(draw[taskId].backGrid.canvas,x,y);		
	}
	
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (draw[taskId].path[p].selected == true || includeHidden == true) {
			repositionPath(draw[taskId].path[p],0,0,0,0,true); // repositions mathsInputs
		}
	}
	if (includeHidden == true) calcCursorPositions();
}
function changeDrawMode(mode,altMode) {
	if (typeof mode === 'undefined') mode = draw[taskId].defaultMode;
	if (typeof altMode === 'undefined') altMode = draw[taskId].defaultMode;
	if (mode === draw[taskId].drawMode) mode = altMode;
	if (mode === 'prev') mode = draw[taskId].prevDrawMode || draw[taskId].defaultMode;
	draw[taskId].prevDrawMode = draw[taskId].drawMode;
	draw[taskId].drawMode = mode;
	if (mode === 'select' || mode == 'none') {
		if (draw[taskId].retainCursorCanvas == true) {
			draw[taskId].cursorCanvas.style.pointerEvents = 'auto';
		} else {
			draw[taskId].cursorCanvas.style.pointerEvents = 'none';
		}
	} else {
		draw[taskId].cursorCanvas.style.pointerEvents = 'auto';
	}
	//console.log('-',mode);
	calcCursorPositions();
}

function colorSelectClose(e) {
	if (e.target.type !== 'colorSelect') {
		draw[taskId].colorSelectVisible = false;
		for (var i = 0; i < draw[taskId].colorButtons.length; i++) {
			hideObj(draw[taskId].colorButtons[i],draw[taskId].colorButtons[i].data)
		}
		for (var i = 0; i < container.childNodes.length; i++) {
			if (draw[taskId].colorButtons.indexOf(container.childNodes[i]) == -1) {
				removeListenerStart(container.childNodes[i],colorSelectClose);
			}
		}	
		redrawButtons();
	}
}
function fillColorSelectClose(e) {
	if (e.target.type !== 'fillColorSelect') {
		draw[taskId].fillColorSelectVisible = false;
		for (var i = 0; i < draw[taskId].fillColorButtons.length; i++) {
			hideObj(draw[taskId].fillColorButtons[i],draw[taskId].fillColorButtons[i].data)
		}
		for (var i = 0; i < container.childNodes.length; i++) {
			if (draw[taskId].fillColorButtons.indexOf(container.childNodes[i]) == -1) {
				removeListenerStart(container.childNodes[i],fillColorSelectClose);
			}
		}	
		redrawButtons();
	}
}
function redrawThicknessButtons() {
	for (var i = 1; i < draw[taskId].thicknessButtons.length; i++) {
		var button = draw[taskId].thicknessButtons[i];
		button.ctx.clearRect(0,0,100,50);
		button.ctx.lineCap = 'round';
		button.ctx.lineJoin = 'round';
		button.ctx.lineWidth = 4;
	
		button.ctx.strokeStyle = '#000';
		button.ctx.fillStyle = '#FFC';
		if (button.thickness == draw[taskId].thickness) button.ctx.fillStyle = '#CFF';
		button.ctx.fillRect(0,0,100,50);
		button.ctx.strokeRect(0,0,100,50);
		
		button.ctx.beginPath();
		button.ctx.lineWidth = button.thickness;
		button.ctx.moveTo(20,25);
		button.ctx.lineTo(80,25);
		button.ctx.stroke();
	}
}
function thicknessSelectClose(e) {
	if (e.target.type !== 'thicknessSelect') {
		draw[taskId].thicknessSelectVisible = false;
		for (var i = 0; i < draw[taskId].thicknessButtons.length; i++) {
			hideObj(draw[taskId].thicknessButtons[i],draw[taskId].thicknessButtons[i].data)
		}
		for (var i = 0; i < container.childNodes.length; i++) {
			if (draw[taskId].thicknessButtons.indexOf(container.childNodes[i]) == -1) {
				removeListenerStart(container.childNodes[i],thicknessSelectClose);
			}
		}	
		redrawButtons();
	}
}
function lineEndsClose(e) {
	if (e.target.type !== 'lineEnds') {
		draw[taskId].lineEndsVisible = false;
		for (var i = 0; i < draw[taskId].lineEndStartButtons.length; i++) {
			hideObj(draw[taskId].lineEndStartButtons[i],draw[taskId].lineEndStartButtons[i].data)
		}
		for (var i = 0; i < draw[taskId].lineEndMidButtons.length; i++) {
			hideObj(draw[taskId].lineEndMidButtons[i],draw[taskId].lineEndMidButtons[i].data)
		}
		for (var i = 0; i < draw[taskId].lineEndFinButtons.length; i++) {
			hideObj(draw[taskId].lineEndFinButtons[i],draw[taskId].lineEndFinButtons[i].data)
		}
		for (var i = 0; i < draw[taskId].lineEndSizeButtons.length; i++) {
			hideObj(draw[taskId].lineEndSizeButtons[i],draw[taskId].lineEndSizeButtons[i].data)
		}		
		
		for (var i = 0; i < container.childNodes.length; i++) {
			if (draw[taskId].lineEndStartButtons.indexOf(container.childNodes[i]) == -1 && draw[taskId].lineEndMidButtons.indexOf(container.childNodes[i]) == -1 && draw[taskId].lineEndFinButtons.indexOf(container.childNodes[i]) == -1 && draw[taskId].lineEndSizeButtons.indexOf(container.childNodes[i]) == -1) {
				removeListenerStart(container.childNodes[i],lineEndsClose);
			}
		}
		redrawButtons();
	}
}
function tableMenuClose() {
	changeDrawMode();
	draw[taskId].tableSizeVisible = false;
	hideObj(draw[taskId].tableSizeCanvas,draw[taskId].tableSizeCanvas.data);
	draw[taskId].tableRowColCanvas.selected = -1;
	draw[taskId].tableRowColCanvas.draw();	
	hideObj(draw[taskId].tableRowColCanvas,draw[taskId].tableRowColCanvas.data);
	hideObj(draw[taskId].tableBordersCanvas,draw[taskId].tableBordersCanvas.data);
	hideObj(draw[taskId].tableCellColorCanvas,draw[taskId].tableCellColorCanvas.data);
}
function tableCellsSelectionTest() {
	if (typeof draw[taskId] == 'object') {
		for (var i = 0; i < draw[taskId].path.length; i++) {
			if (draw[taskId].path[i].selected == true) {
				for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
					if (draw[taskId].path[i].obj[j].type == 'table' || draw[taskId].path[i].obj[j].type == 'table2') {
						var cells = draw[taskId].path[i].obj[j].cells;
						for (var r = 0; r < cells.length; r++) {
							for (var c = 0; c < cells[r].length; c++) {
								if (cells[r][c].selected == true && cells[r][c].highlight == true) {
									return true;
								}
							}
						}
					}
				}
			}
		}
	}
	return false;
}

function isPosOverTool(x,y) {
	for (var i = 0; i < draw[taskId].toolOrder.length; i++) {
		if (draw[taskId].toolOrder[i] == 'protractor' && draw[taskId].protractorVisible == true) {
			var center = draw[taskId].protractor.center;
			var rad = draw[taskId].protractor.radius;	
			var angle = draw[taskId].protractor.angle;
			var mouseAngle = measureAngle({a:[x,y],b:[center[0],center[1]],c:[center[0]+rad*Math.cos(angle),center[1]+rad*Math.sin(angle)]});
			
			if (dist(x,y,center[0],center[1]) <= rad && mouseAngle >= 0 && mouseAngle <= Math.PI) {
				draw[taskId].protractor.prevX = x;
				draw[taskId].protractor.prevY = y;
				draw[taskId].protractor.relSelPoint = vectorFromAToB(draw[taskId].protractor.center,[x,y]);
				if (dist(x,y,center[0]+rad*Math.cos(angle),center[1]+rad*Math.sin(angle)) <= 0.5* rad || dist(x,y,center[0]-rad*Math.cos(angle),center[1]-rad*Math.sin(angle)) <= 0.5 * rad) {
					return {cursor:draw[taskId].cursors.rotate,func:drawClickProtractorStartRotate};
				} else {
					return {cursor:draw[taskId].cursors.move1,func:drawClickProtractorStartMove};				
				}
			}
		}
	
		if (draw[taskId].toolOrder[i] == 'ruler' && draw[taskId].rulerVisible == true) {
			if (hitTestMouseOverPolygon(draw[taskId].ruler.verticesArray1) == true) {
				draw[taskId].ruler.prevX = x;
				draw[taskId].ruler.prevY = y;
				if (hitTestMouseOverPolygon(draw[taskId].ruler.verticesArray2) == true) {
					return {cursor:draw[taskId].cursors.rotate,func:drawClickRulerStartRotate1};
				} else if (hitTestMouseOverPolygon(draw[taskId].ruler.verticesArray3) == true) {
					return {cursor:draw[taskId].cursors.rotate,func:drawClickRulerStartRotate2};
				} else {
					return {cursor:draw[taskId].cursors.move1,func:drawClickRulerStartMove};		
				}
			}
			if (hitTestMouseOverPolygon(draw[taskId].ruler.verticesArray4) == true) {
				var startPos = closestPointOnLine([x,y],draw[taskId].ruler.edgePos1,draw[taskId].ruler.edgePos2)
				draw[taskId].startX = startPos[0];
				draw[taskId].startY = startPos[1];			
				return {cursor:draw[taskId].cursors.rulerPen1,func:drawClickRulerStartDraw1};
			}
			if (hitTestMouseOverPolygon(draw[taskId].ruler.verticesArray5) == true) {
				var startPos = closestPointOnLine([x,y],draw[taskId].ruler.edgePos3,draw[taskId].ruler.edgePos4)
				draw[taskId].startX = startPos[0];
				draw[taskId].startY = startPos[1];			
				return {cursor:draw[taskId].cursors.rulerPen2,func:drawClickRulerStartDraw2};
			}		
		}
		
		if (draw[taskId].toolOrder[i] == 'compass' && draw[taskId].compassVisible == true) {
			var center1 = draw[taskId].compass.center1;
			var center2 = draw[taskId].compass.center2;
			var center3 = draw[taskId].compass.center3;
			var lockCenter = draw[taskId].compass.lockCenter;
			var rad = draw[taskId].compass.radius;	
			var angle = draw[taskId].compass.angle;
		
			if (dist(x,y,lockCenter[0],lockCenter[1]) <= 30) {
				return {cursor:draw[taskId].cursors.pointer,func:drawClickCompassLock};
			} else if (dist(x,y,center2[0],center2[1]) <= 40 || hitTestMouseOverPolygon(draw[taskId].compass.topPolygon) == true) {
				draw[taskId].compass.prevX = x;
				draw[taskId].compass.prevY = y;
				return {cursor:'url("../images/cursors/rotate.cur") 12 12, auto',func:drawClickCompassStartDraw};
			} else if (dist(x,y,center1[0],center1[1]) <= 30 || distancePointToLineSegment([x,y],draw[taskId].compass.center1,draw[taskId].compass.center2) <= 20) {
				draw[taskId].compass.prevX = x;
				draw[taskId].compass.prevY = y;
				// store positions relative to center1
				draw[taskId].compass.relSelPoint = vectorFromAToB(draw[taskId].compass.center1,[x,y]);
				draw[taskId].compass.relCenter2 = vectorFromAToB(draw[taskId].compass.center1,draw[taskId].compass.center2);
				draw[taskId].compass.relCenter3 = vectorFromAToB(draw[taskId].compass.center1,draw[taskId].compass.center3);
				draw[taskId].compass.relLockCenter = vectorFromAToB(draw[taskId].compass.center1,draw[taskId].compass.lockCenter);
				return {cursor:draw[taskId].cursors.move1,func:drawClickCompassStartMove1};
			} else if (dist(x,y,center3[0],center3[1]) <= 30 || distancePointToLineSegment([x,y],draw[taskId].compass.center3,draw[taskId].compass.center2) <= 20 || hitTestMouseOverPolygon(draw[taskId].compass.pencilPolygon) == true) {			
				draw[taskId].compass.prevX = x;
				draw[taskId].compass.prevY = y;
				return {cursor:draw[taskId].cursors.move1,func:drawClickCompassStartMove2};
			}
		}
	}
	return false;
}
function resetDrawTools() {
	if (typeof draw[taskId] == 'undefined') return;
	draw[taskId].path = draw[taskId].startPath.slice();
	draw[taskId].color = draw[taskId].startColor;
	draw[taskId].thickness = draw[taskId].startThickness;
	draw[taskId].fillColor = draw[taskId].startFillColor;
	changeDrawMode(draw[taskId].startDrawMode);
	draw[taskId].prevDrawMode = 'none';
	draw[taskId].protractorVisible = false;
	draw[taskId].compassVisible = false;
	draw[taskId].rulerVisible = false;			
	draw[taskId].colorSelectVisible = false;
	draw[taskId].thicknessSelectVisible = false;
	draw[taskId].compassHelpSelectVisible = false;
	if (typeof draw[taskId].compassHelpBox !== 'undefined') hideObj(draw[taskId].compassHelpBox,draw[taskId].compassHelpBox.data);
	for (var i = 0; i < draw[taskId].colorButtons.length; i++) {
		hideObj(draw[taskId].colorButtons[i],draw[taskId].colorButtons[i].data)
	}
	for (var i = 0; i < draw[taskId].thicknessButtons.length; i++) {
		hideObj(draw[taskId].thicknessButtons[i],draw[taskId].thicknessButtons[i].data)
	}	
	for (var i = 0; i < container.childNodes.length; i++) {
		removeListenerStart(container.childNodes[i],colorSelectClose);
		removeListenerStart(container.childNodes[i],thicknessSelectClose);
		removeListenerStart(container.childNodes[i],fillColorSelectClose);
	}
	if (typeof draw[taskId].protractor !== 'undefined') {
		draw[taskId].protractor.center = draw[taskId].protractor.startCenter.slice(0);
		draw[taskId].protractor.angle = 0;
	}
	if (typeof draw[taskId].ruler !== 'undefined') {	
		draw[taskId].ruler.left = draw[taskId].ruler.startLeft;
		draw[taskId].ruler.top = draw[taskId].ruler.startTop;
		draw[taskId].ruler.angle = 0;
		recalcRulerValues();
	}
	if (typeof draw[taskId].compass !== 'undefined') {
		draw[taskId].compass.center1 = draw[taskId].compass.startCenter1.slice(0);
		draw[taskId].compass.center2 = draw[taskId].compass.startCenter2.slice(0);
		draw[taskId].compass.center3 = draw[taskId].compass.startCenter3.slice(0);		
		draw[taskId].compass.h = draw[taskId].compass.startH;
		draw[taskId].compass.angle = draw[taskId].compass.startAngle;
		draw[taskId].compass.radius = draw[taskId].compass.startRadius;
		draw[taskId].compass.radiusLocked = false;
		draw[taskId].compass.drawOn = draw[taskId].compass.startDrawOn;
		var mp1 = midpoint(draw[taskId].compass.center1[0],draw[taskId].compass.center1[1],draw[taskId].compass.center3[0],draw[taskId].compass.center3[1]);
		var mp2 = midpoint(draw[taskId].compass.center2[0],draw[taskId].compass.center2[1],mp1[0],mp1[1]);
		draw[taskId].compass.lockCenter = mp2.slice(0);
		recalcCompassValues();			
	}
	redrawButtons();
	draw[taskId].cursors.update();
	drawToolsCanvas();
	drawCanvasPaths();
}
function moveToolToFront(tool) {
	var index = draw[taskId].toolOrder.indexOf(tool);
	draw[taskId].toolOrder.splice(index,1);
	draw[taskId].toolOrder.unshift(tool);
}
function drawToolsCanvas() {
	draw[taskId].toolsctx.clearRect(0,0,1200,700);
	for (var i = draw[taskId].toolOrder.length; i >= 0; i--) {
		if (draw[taskId].toolOrder[i] == 'protractor' && draw[taskId].protractorVisible == true) drawProtractor();
		if (draw[taskId].toolOrder[i] == 'ruler' && draw[taskId].rulerVisible == true) drawRuler();	
		if (draw[taskId].toolOrder[i] == 'compass' && draw[taskId].compassVisible == true) drawCompass();
		draw[taskId].cursors.update();
	}
}
function recalcRulerValues() {
	if (typeof draw[taskId].ruler == 'undefined') return;
	var left = draw[taskId].ruler.left;
	var top = draw[taskId].ruler.top;
	var length = draw[taskId].ruler.length;
	var width = draw[taskId].ruler.width;
	var angle = draw[taskId].ruler.angle;
	draw[taskId].ruler.centerX1 = left+0.02*length*Math.cos(angle);
	draw[taskId].ruler.centerY1 = top+0.02*length*Math.sin(angle);	
	draw[taskId].ruler.centerX2 = left+0.98*length*Math.cos(angle);
	draw[taskId].ruler.centerY2 = top+0.98*length*Math.sin(angle);	
	draw[taskId].ruler.verticesArray1 = [
		[left,top],
		[left+length*Math.cos(angle),top+length*Math.sin(angle)],
		[left+length*Math.cos(angle)-width*Math.sin(angle),top+length*Math.sin(angle)+width*Math.cos(angle)],
		[left-width*Math.sin(angle),top+width*Math.cos(angle)]
	];
	draw[taskId].ruler.verticesArray2 = [
		[left,top],
		[left+0.1*length*Math.cos(angle),top+0.1*length*Math.sin(angle)],
		[left-width*Math.sin(angle)+0.1*length*Math.cos(angle),top+width*Math.cos(angle)+0.1*length*Math.sin(angle)],
		[left-width*Math.sin(angle),top+width*Math.cos(angle)]
	];
	draw[taskId].ruler.verticesArray3 = [
		[left+length*Math.cos(angle)-0.1*length*Math.cos(angle),top+length*Math.sin(angle)-0.1*length*Math.sin(angle)],
		[left+length*Math.cos(angle),top+length*Math.sin(angle)],
		[left+length*Math.cos(angle)-width*Math.sin(angle),top+length*Math.sin(angle)+width*Math.cos(angle)],
		[left+length*Math.cos(angle)-width*Math.sin(angle)-0.1*length*Math.cos(angle),top+length*Math.sin(angle)+width*Math.cos(angle)-0.1*length*Math.sin(angle)]
	];
	
	draw[taskId].ruler.verticesArray4 = [
		[left+40*Math.sin(angle),top-40*Math.cos(angle)],
		[left+length*Math.cos(angle)+40*Math.sin(angle),top+length*Math.sin(angle)-40*Math.cos(angle)],
		[left+length*Math.cos(angle),top+length*Math.sin(angle)],
		[left,top]
	];
	if (draw[taskId].ruler.markings == true) {
		draw[taskId].ruler.edgePos1 = [
			left+0.02*length*Math.cos(angle)+(0.5*draw[taskId].thickness+2)*Math.sin(angle),
			top+0.02*length*Math.sin(angle)-(0.5*draw[taskId].thickness+2)*Math.cos(angle)
		];
		draw[taskId].ruler.edgePos2 = [
			left+0.98*length*Math.cos(angle)+(0.5*draw[taskId].thickness+2)*Math.sin(angle),
			top+0.98*length*Math.sin(angle)-(0.5*draw[taskId].thickness+2)*Math.cos(angle)
		];
	} else {
		draw[taskId].ruler.edgePos1 = [
			left+(0.5*draw[taskId].thickness+2)*Math.sin(angle),
			top-(0.5*draw[taskId].thickness+2)*Math.cos(angle)
		];
		draw[taskId].ruler.edgePos2 = [
			left+length*Math.cos(angle)+(0.5*draw[taskId].thickness+2)*Math.sin(angle),
			top+length*Math.sin(angle)-(0.5*draw[taskId].thickness+2)*Math.cos(angle)
		];
	}
	
	draw[taskId].ruler.verticesArray5 = [
		[left-width*Math.sin(angle)-40*Math.sin(angle),top+width*Math.cos(angle)+40*Math.cos(angle)],
		[left+length*Math.cos(angle)-width*Math.sin(angle)-40*Math.sin(angle),top+length*Math.sin(angle)+width*Math.cos(angle)+40*Math.cos(angle)],
		[left+length*Math.cos(angle)-width*Math.sin(angle),top+length*Math.sin(angle)+width*Math.cos(angle)],
		[left-width*Math.sin(angle),top+width*Math.cos(angle)],
	];
	draw[taskId].ruler.edgePos3 = [
		left-width*Math.sin(angle)-(0.5*draw[taskId].thickness+2)*Math.sin(angle),
		top+width*Math.cos(angle)+(0.5*draw[taskId].thickness+2)*Math.cos(angle)
	];
	draw[taskId].ruler.edgePos4 = [
		left+length*Math.cos(angle)-width*Math.sin(angle)-(0.5*draw[taskId].thickness+2)*Math.sin(angle),
		top+length*Math.sin(angle)+width*Math.cos(angle)+(0.5*draw[taskId].thickness+2)*Math.cos(angle)
	];	
	var cursor = draw[taskId].hiddenCanvas;
	var ctx = draw[taskId].hiddenCanvas.ctx;
	
	ctx.clearRect(0,0,50,50);
	ctx.translate(25,25);
	ctx.rotate(draw[taskId].ruler.angle);
		ctx.fillStyle = draw[taskId].color;
		ctx.fillRect(-5,-11,10,20);
		ctx.fillRect(-5,-18,10,5);
		ctx.beginPath();
		ctx.moveTo(-5,11);
		ctx.lineTo(0,18);
		ctx.lineTo(5,11);
		ctx.lineTo(-5,11);
		ctx.fill();		
	ctx.rotate(-draw[taskId].ruler.angle);	
	ctx.translate(-25,-25);

	draw[taskId].rulerEdgeCursor1 = cursor.toDataURL();
	draw[taskId].rulerEdgeCursorHotspot1 = [25-18*Math.sin(draw[taskId].ruler.angle),25+18*Math.cos(draw[taskId].ruler.angle)];
	
	ctx.clearRect(0,0,50,50);
	ctx.translate(25,25);
	ctx.rotate(Math.PI+draw[taskId].ruler.angle);
		ctx.fillStyle = draw[taskId].color;
		ctx.fillRect(-5,-11,10,20);
		ctx.fillRect(-5,-18,10,5);
		ctx.beginPath();
		ctx.moveTo(-5,11);
		ctx.lineTo(0,18);
		ctx.lineTo(5,11);
		ctx.lineTo(-5,11);
		ctx.fill();		
	ctx.rotate(-Math.PI-draw[taskId].ruler.angle);	
	ctx.translate(-25,-25);

	draw[taskId].rulerEdgeCursor2 = cursor.toDataURL();
	draw[taskId].rulerEdgeCursorHotspot2 = [25-18*Math.sin(Math.PI+draw[taskId].ruler.angle),25+18*Math.cos(Math.PI+draw[taskId].ruler.angle)];		
}
function recalcCompassValues() {
	var center1 = draw[taskId].compass.center1;
	var center2 = draw[taskId].compass.center2;
	var center3 = draw[taskId].compass.center3;								
	var rad = draw[taskId].compass.radius;	
	var angle = draw[taskId].compass.angle;

	var angle2 = Math.atan((0.5*draw[taskId].compass.radius)/draw[taskId].compass.h);
	
	/*
	// pointy arm
	if (center2[0] > center1[0]) {
		var pointPolygon = [
			[center2[0]+20*Math.cos(angle-angle2),center2[1]-20*Math.sin(angle-angle2)],
			[center2[0]-20*Math.cos(angle-angle2),center2[1]+20*Math.sin(angle-angle2)],
			[center1[0]-20*Math.cos(angle-angle2),center1[1]+20*Math.sin(angle-angle2)],
			[center1[0]+20*Math.cos(angle-angle2),center1[1]-20*Math.sin(angle-angle2)]
		];
	} else {
		var pointPolygon = [
			[center2[0]+20*Math.cos(Math.PI-angle-angle2),center2[1]-20*Math.sin(Math.PI-angle-angle2)],
			[center2[0]-20*Math.cos(Math.PI-angle-angle2),center2[1]+20*Math.sin(Math.PI-angle-angle2)],
			[center1[0]-20*Math.cos(Math.PI-angle-angle2),center1[1]+20*Math.sin(Math.PI-angle-angle2)],
			[center1[0]+20*Math.cos(Math.PI-angle-angle2),center1[1]-20*Math.sin(Math.PI-angle-angle2)]
		];
	}
	
	draw[taskId].toolsctx.fillStyle = '#F0F';
	draw[taskId].toolsctx.beginPath();
	draw[taskId].toolsctx.moveTo(pointPolygon[0][0],pointPolygon[0][1]);
	draw[taskId].toolsctx.lineTo(pointPolygon[1][0],pointPolygon[1][1]);
	draw[taskId].toolsctx.lineTo(pointPolygon[2][0],pointPolygon[2][1]);
	draw[taskId].toolsctx.lineTo(pointPolygon[3][0],pointPolygon[3][1]);
	draw[taskId].toolsctx.lineTo(pointPolygon[0][0],pointPolygon[0][1]);			
	draw[taskId].toolsctx.fill();
	
	var pencilArmPolygon = [
		[center2[0]+20*Math.cos(angle2-angle),center2[1]-20*Math.sin(angle2-angle)],
		[center2[0]-20*Math.cos(angle2-angle),center2[1]+20*Math.sin(angle2-angle)],
		[center3[0]-20*Math.cos(angle2-angle),center3[1]+20*Math.sin(angle2-angle)],
		[center3[0]+20*Math.cos(angle2-angle),center3[1]-20*Math.sin(angle2-angle)]
	];
	
	draw[taskId].toolsctx.fillStyle = '#FF0';
	draw[taskId].toolsctx.beginPath();
	draw[taskId].toolsctx.moveTo(pencilArmPolygon[0][0],pencilArmPolygon[0][1]);
	draw[taskId].toolsctx.lineTo(pencilArmPolygon[1][0],pencilArmPolygon[1][1]);
	draw[taskId].toolsctx.lineTo(pencilArmPolygon[2][0],pencilArmPolygon[2][1]);
	draw[taskId].toolsctx.lineTo(pencilArmPolygon[3][0],pencilArmPolygon[3][1]);
	draw[taskId].toolsctx.lineTo(pencilArmPolygon[0][0],pencilArmPolygon[0][1]);			
	draw[taskId].toolsctx.fill();
	*/
	
	if (draw[taskId].compass.drawOn == 'right') {
		var angle3 = angle2-angle-Math.PI/14;
		var center4 = [center3[0]-200*Math.sin(angle3),center3[1]-200*Math.cos(angle3)];
	} else {
		var angle3 = -(angle2+angle-Math.PI/14);
		var center4 = [center3[0]+200*Math.sin(angle3),center3[1]+200*Math.cos(angle3)];					
	}

	var pencilPolygon = [
		[center4[0]+20*Math.cos(angle3),center4[1]-20*Math.sin(angle3)],
		[center4[0]-20*Math.cos(angle3),center4[1]+20*Math.sin(angle3)],
		[center3[0]-20*Math.cos(angle3),center3[1]+20*Math.sin(angle3)],
		[center3[0]+20*Math.cos(angle3),center3[1]-20*Math.sin(angle3)]
	];
	
	/*
	draw[taskId].toolsctx.fillStyle = '#FF0';
	draw[taskId].toolsctx.beginPath();
	draw[taskId].toolsctx.moveTo(pencilPolygon[0][0],pencilPolygon[0][1]);
	draw[taskId].toolsctx.lineTo(pencilPolygon[1][0],pencilPolygon[1][1]);
	draw[taskId].toolsctx.lineTo(pencilPolygon[2][0],pencilPolygon[2][1]);
	draw[taskId].toolsctx.lineTo(pencilPolygon[3][0],pencilPolygon[3][1]);
	draw[taskId].toolsctx.lineTo(pencilPolygon[0][0],pencilPolygon[0][1]);			
	draw[taskId].toolsctx.fill();	
	*/
	
	if (draw[taskId].compass.drawOn == 'right') {
		var topPolygon = [
			[center2[0]-62*Math.sin(-angle)+10*Math.cos(angle),center2[1]-62*Math.cos(angle)-10*Math.sin(-angle)],
			[center2[0]-62*Math.sin(-angle)-10*Math.cos(angle),center2[1]-62*Math.cos(angle)+10*Math.sin(-angle)],
			[center2[0]-10*Math.cos(angle),center2[1]+10*Math.sin(-angle)],
			[center2[0]+10*Math.cos(angle),center2[1]-10*Math.sin(-angle)],
		];
	} else {
		var topPolygon = [
			[center2[0]+62*Math.sin(-angle)+10*Math.cos(angle),center2[1]+62*Math.cos(angle)-10*Math.sin(-angle)],
			[center2[0]+62*Math.sin(-angle)-10*Math.cos(angle),center2[1]+62*Math.cos(angle)+10*Math.sin(-angle)],
			[center2[0]-10*Math.cos(angle),center2[1]+10*Math.sin(-angle)],
			[center2[0]+10*Math.cos(angle),center2[1]-10*Math.sin(-angle)],
		];
	}
	/*
	draw[taskId].toolsctx.fillStyle = '#F0F';
	draw[taskId].toolsctx.beginPath();
	draw[taskId].toolsctx.moveTo(topPolygon[0][0],topPolygon[0][1]);
	draw[taskId].toolsctx.lineTo(topPolygon[1][0],topPolygon[1][1]);
	draw[taskId].toolsctx.lineTo(topPolygon[2][0],topPolygon[2][1]);
	draw[taskId].toolsctx.lineTo(topPolygon[3][0],topPolygon[3][1]);
	draw[taskId].toolsctx.lineTo(topPolygon[0][0],topPolygon[0][1]);			
	draw[taskId].toolsctx.fill();	
	*/
	
	//draw[taskId].compass.pointPolygon = pointPolygon;
	//draw[taskId].compass.pencilArmPolygon = pencilArmPolygon;
	draw[taskId].compass.pencilPolygon = pencilPolygon;								
	draw[taskId].compass.topPolygon = topPolygon;	
}
function drawProtractor() {
	var rad = draw[taskId].protractor.radius;
	var center = draw[taskId].protractor.center;
	var color = draw[taskId].protractor.color;
	var angle = draw[taskId].protractor.angle;
	var ctx = draw[taskId].toolsctx;
	
	var radius = [0.12*rad,0.7*rad,0.8*rad,0.88*rad,0.92*rad,rad];
	var fontSize = rad / 20;
	var colorRGB = hexToRgb(color);
	
	ctx.save();
	ctx.translate(-draw[taskId].drawArea[0],-draw[taskId].drawArea[1]); // adjust for drawArea 	
	ctx.translate(center[0],center[1]);
	ctx.rotate(angle);
	
	ctx.fillStyle = "rgba("+colorRGB.r+","+colorRGB.g+","+colorRGB.b+",0.25)";
	ctx.beginPath();
	ctx.moveTo(0-rad,0);
	ctx.arc(0,0,rad,Math.PI,2*Math.PI);
	ctx.lineTo(0+rad,0+0.04*rad);
	ctx.lineTo(0-rad,0+0.04*rad);
	ctx.lineTo(0-rad,0);
	ctx.fill();
	
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#000';
	ctx.fillStyle = '#000';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.font = fontSize + 'px Arial';
	ctx.beginPath();
	ctx.moveTo(0-radius[0],0);
	ctx.arc(0,0,radius[0],Math.PI,2*Math.PI);
	ctx.moveTo(0-radius[1],0);
	ctx.arc(0,0,radius[1],Math.PI,2*Math.PI);
	ctx.moveTo(0-radius[2],0);
	ctx.arc(0,0,radius[2],Math.PI,265*Math.PI/180);
	ctx.moveTo((0+radius[2]*Math.cos(275*Math.PI/180)),(0+radius[2]*Math.sin(275*Math.PI/180)));
	ctx.arc(0,0,radius[2],275*Math.PI/180,2*Math.PI);
	ctx.moveTo(0-radius[0],0);
	ctx.lineTo(0+radius[0],0);

	var angle = Math.PI;
	for (var i = 0; i < 181; i++) {
		if (i == 90) {
			ctx.moveTo(0,0+10);
			ctx.lineTo(0,0-radius[1]-7);
			ctx.moveTo(0,0-0.86*rad);
			ctx.lineTo(0,0-radius[5]);
			
			ctx.translate((0+0.8*rad*Math.cos(angle)),(0+0.8*rad*Math.sin(angle)));
			ctx.rotate(angle+0.5*Math.PI);
			var largerFont = 1.5 * fontSize; 
			ctx.font = largerFont + 'px Arial';
			ctx.fillText(90,0,0);
			ctx.font = fontSize + 'px Arial';
			ctx.rotate(-(angle+0.5*Math.PI));
			ctx.translate(-(0+0.8*rad*Math.cos(angle)),-(0+0.8*rad*Math.sin(angle)));		
		} else if (i % 10 == 0) {
			ctx.moveTo(0+radius[0]*Math.cos(angle),0+radius[0]*Math.sin(angle));
			ctx.lineTo(0+(radius[1]+3)*Math.cos(angle),0+(radius[1]+3)*Math.sin(angle));
			ctx.moveTo(0+(radius[2]-3)*Math.cos(angle),0+(radius[2]-3)*Math.sin(angle));
			ctx.lineTo(0+(radius[2]+3)*Math.cos(angle),0+(radius[2]+3)*Math.sin(angle));			
			ctx.moveTo(0+radius[3]*Math.cos(angle),0+radius[3]*Math.sin(angle));
			ctx.lineTo(0+radius[5]*Math.cos(angle),0+radius[5]*Math.sin(angle));
			
			ctx.translate((0+0.75*rad*Math.cos(angle)),(0+0.75*rad*Math.sin(angle)));
			ctx.rotate(angle+0.5*Math.PI);
			ctx.fillText(180-i,0,0);
			ctx.rotate(-(angle+0.5*Math.PI));
			ctx.translate(-(0+0.75*rad*Math.cos(angle)),-(0+0.75*rad*Math.sin(angle)));
			
			ctx.translate((0+0.845*rad*Math.cos(angle)),(0+0.845*rad*Math.sin(angle)));
			ctx.rotate(angle+0.5*Math.PI);
			ctx.fillText(i,0,0);
			ctx.rotate(-(angle+0.5*Math.PI));
			ctx.translate(-(0+0.845*rad*Math.cos(angle)),-(0+0.845*rad*Math.sin(angle)));			
		} else if (i % 5 == 0) {
			ctx.moveTo(0+radius[3]*Math.cos(angle),0+radius[3]*Math.sin(angle));
			ctx.lineTo(0+radius[5]*Math.cos(angle),0+radius[5]*Math.sin(angle));
		} else {
			ctx.moveTo(0+radius[4]*Math.cos(angle),0+radius[4]*Math.sin(angle));
			ctx.lineTo(0+radius[5]*Math.cos(angle),0+radius[5]*Math.sin(angle));			
		}
		angle += Math.PI / 180;
	}

	ctx.stroke();
	ctx.restore();
}
function drawRuler() {
	var left = draw[taskId].ruler.left;
	var top = draw[taskId].ruler.top;
	var width = draw[taskId].ruler.width;
	var length = draw[taskId].ruler.length;
	var color = draw[taskId].ruler.color;
	var transparent = draw[taskId].ruler.transparent;	
	var angle = draw[taskId].ruler.angle;
	var ctx = draw[taskId].toolsctx;
	
	var fontSize = width / 6;
		
	ctx.save();
	ctx.translate(left, top);
	ctx.rotate(angle);

	ctx.beginPath();
	
	if (transparent == true) {
		var colorRGB = hexToRgb(color);
		ctx.fillStyle = "rgba("+colorRGB.r+","+colorRGB.g+","+colorRGB.b+",0.25)";
		roundedRect(ctx, 0, 0, length, width, 8, 1, "rgba(0,0,0,0)", "rgba("+colorRGB.r+","+colorRGB.g+","+colorRGB.b+",0.5)");
	} else {
		ctx.fillStyle = color;
		roundedRect(ctx, 0, 0, length, width, 8, 1, '#000', color);
	}

	if (draw[taskId].ruler.markings == true) {
		var xPos = length * 0.02;
		var dx = (length * 0.96) / 150;
		
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#000';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = fontSize + 'px Arial';
		for (var dCount = 0; dCount <= 150; dCount++) {
			ctx.beginPath();
			ctx.moveTo(xPos,0);
			if (dCount % 10 == 0) {
				ctx.lineTo(xPos,0.22*width);
				ctx.fillText(Math.round(0.1*dCount),xPos,0.32*width);
			} else if (dCount % 5 == 0) {
				ctx.lineTo(xPos,0.16*width);
			} else {
				ctx.lineTo(xPos,0.1*width);
			}
			ctx.stroke();
			xPos += dx;
		}
	}
	
	ctx.restore();
}
function drawCompass() {
	var armLength = draw[taskId].compass.armLength;
	var radius = draw[taskId].compass.radius;
	var h = draw[taskId].compass.h;
	var center1 = draw[taskId].compass.center1;
	var center2 = draw[taskId].compass.center2;
	var center3 = draw[taskId].compass.center3;
	var drawOn = draw[taskId].compass.drawOn;
		
	var ctx = draw[taskId].toolsctx;
	
	if (draw[taskId].compass.radiusLocked == true || draw[taskId].compass.mode == 'draw') {
		// draw lock button
		ctx.translate(center2[0],center2[1]);
		if (drawOn == 'right') {
			ctx.rotate(draw[taskId].compass.angle);
		} else {
			ctx.rotate(draw[taskId].compass.angle + Math.PI);			
		}
	
		var lockHeight = 0.5 * draw[taskId].compass.h;
	
		//bar	
		ctx.fillStyle = '#99F';
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.fillRect(-0.25*draw[taskId].compass.radius,lockHeight-5,0.5*draw[taskId].compass.radius,10);
		ctx.strokeRect(-0.25*draw[taskId].compass.radius,lockHeight-5,0.5*draw[taskId].compass.radius,10);

		//circle
		ctx.fillStyle = '#99F';
		ctx.strokeStyle = '#333';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(0,lockHeight,15,0,2*Math.PI);
		ctx.fill();	
		ctx.stroke();

		//padlock
		ctx.fillStyle = '#333';
		ctx.beginPath();
		ctx.moveTo(6,lockHeight-2);
		ctx.lineTo(6,lockHeight+3);
		ctx.arc(0,lockHeight+3,6,0,Math.PI);
		ctx.lineTo(-6,lockHeight+3);
		ctx.lineTo(-6,lockHeight-2);
		ctx.stroke();
		ctx.fill();
		
		//keyhole
		ctx.fillStyle = '#99F';
		ctx.beginPath();
		ctx.arc(0,lockHeight+2.5,1.5,0,2*Math.PI);
		ctx.fill();
		ctx.fillRect(-0.5,lockHeight+2.5,1,3);
		
		//arm
		ctx.beginPath();
		ctx.moveTo(-6,lockHeight+2);
		ctx.lineTo(-6,lockHeight+2);
		ctx.arc(0,lockHeight-4,5,Math.PI,2*Math.PI);
		ctx.lineTo(6,lockHeight+2);
		ctx.stroke();
		
		if (drawOn == 'right') {
			ctx.rotate(-draw[taskId].compass.angle);
		} else {
			ctx.rotate(-draw[taskId].compass.angle - Math.PI);			
		}
		ctx.translate(-center2[0],-center2[1]);
	} else {
		// draw lock button
		ctx.translate(center2[0],center2[1]);
		if (drawOn == 'right') {
			ctx.rotate(draw[taskId].compass.angle);
		} else {
			ctx.rotate(draw[taskId].compass.angle + Math.PI);			
		}
			
		var lockHeight = 0.5 * draw[taskId].compass.h;
	
		//bar	
		ctx.fillStyle = '#999';
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 2;
		ctx.strokeRect(-0.25*draw[taskId].compass.radius,lockHeight-5,0.5*draw[taskId].compass.radius,10);

		//circle
		ctx.fillStyle = '#FFC';
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 3;		
		ctx.beginPath();
		ctx.arc(0,lockHeight,15,0,2*Math.PI);
		ctx.fill();	
		ctx.stroke();

		//padlock
		ctx.fillStyle = '#999';
		ctx.beginPath();
		ctx.moveTo(6,lockHeight-2);
		ctx.lineTo(6,lockHeight+3);
		ctx.arc(0,lockHeight+3,6,0,Math.PI);
		ctx.lineTo(-6,lockHeight+3);
		ctx.lineTo(-6,lockHeight-2);
		ctx.stroke();
		ctx.fill();
		
		//keyhole
		ctx.fillStyle = '#FFC';
		ctx.beginPath();
		ctx.arc(0,lockHeight+2.5,1.5,0,2*Math.PI);
		ctx.fill();
		ctx.fillRect(-0.5,lockHeight+2.5,1,3);
		
		//arm
		ctx.beginPath();
		ctx.moveTo(-6,lockHeight-2);
		ctx.arc(0,lockHeight-4,5,(4/5)*Math.PI,(9/5)*Math.PI);
		ctx.stroke();
		
		if (drawOn == 'right') {
			ctx.rotate(-draw[taskId].compass.angle);
		} else {
			ctx.rotate(-draw[taskId].compass.angle - Math.PI);			
		}
		ctx.translate(-center2[0],-center2[1]);
	}

	ctx.lineWidth = 2;
	ctx.strokeStyle = '#000';
	ctx.fillStyle = '#000';

	var angle2 = -0.5 * Math.PI - Math.atan((center2[1]-center1[1])/(center2[0]-center1[0]));
	if (center2[0] < center1[0]) angle2 += Math.PI;
	var angle3 = -0.5 * Math.PI - Math.atan((center3[1]-center2[1])/(center3[0]-center2[0]));
	if (center2[0] < center3[0]) angle3 += Math.PI;
	
	// draw pointy arm
	ctx.translate(center2[0],center2[1]);
	ctx.rotate(-angle2);
	
	roundedRect(ctx,-7,0,14,armLength-20,3,4,'#000','#99F');
	ctx.strokeStyle = '#000';
	ctx.fillStyle = '#CCC';
	ctx.lineWidth = 0.5;
	ctx.beginPath();
	ctx.moveTo(-3,armLength-20);
	ctx.lineTo(0,armLength);
	ctx.lineTo(3,armLength-20);
	ctx.lineTo(-3,armLength-20);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(0,armLength-26);
	ctx.stroke();
		
	ctx.rotate(angle2);
	ctx.translate(-center2[0],-center2[1]);

	// draw pencil arm
	ctx.translate(center2[0],center2[1]);
	ctx.rotate(-angle3);
	
	if (drawOn == 'right') {
		var pAngle = Math.PI/14;
	} else {
		var pAngle = -Math.PI/14;		
	}
	
	//draw pencil
	ctx.translate(0,armLength);
	ctx.rotate(pAngle);
	
	ctx.beginPath();
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 2;
	if (draw[taskId].color == '#000') {
		ctx.fillStyle = '#FC3';
	} else {
		ctx.fillStyle = draw[taskId].color;
	}
	ctx.moveTo(0,0);
	ctx.lineTo(-10,-30);
	ctx.lineTo(-10,-200);
	ctx.lineTo(10,-200);	
	ctx.lineTo(10,-30);
	ctx.lineTo(0,0);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.fillStyle = '#FFC';
	ctx.moveTo(0,0);
	ctx.lineTo(-10,-30);
	ctx.lineTo(10,-30);
	ctx.lineTo(0,0);
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.fillStyle = draw[taskId].color;
	ctx.moveTo(0,0);
	ctx.lineTo(-3,-9);
	ctx.lineTo(3,-9);
	ctx.lineTo(0,0);
	ctx.fill();
	ctx.stroke();
	
	ctx.rotate(-pAngle);	
	ctx.translate(0,-armLength);
	
	ctx.fillStyle = '#99F';
	ctx.beginPath();
	if (drawOn == 'right') {
		ctx.moveTo(-7,0);
		ctx.lineTo(7,0);
		ctx.lineTo(7,armLength-95);		
		ctx.lineTo(7+45*Math.cos(pAngle),armLength-95+45*Math.sin(pAngle));
		ctx.lineTo(7+45*Math.cos(pAngle)-20*Math.sin(pAngle),armLength-95+45*Math.sin(pAngle)+20*Math.cos(pAngle));
		ctx.lineTo(-7,armLength-80);
		ctx.lineTo(-7,0);
	} else {
		ctx.moveTo(7,0);
		ctx.lineTo(-7,0);
		ctx.lineTo(-7,armLength-95);		
		ctx.lineTo(-7-45*Math.cos(pAngle),armLength-95-45*Math.sin(pAngle));
		ctx.lineTo(-7-45*Math.cos(pAngle)-20*Math.sin(pAngle),armLength-95-45*Math.sin(pAngle)+20*Math.cos(pAngle));
		ctx.lineTo(7,armLength-80);
		ctx.lineTo(7,0);		
	}
	ctx.fill();
	ctx.stroke();

	ctx.translate(0,armLength);
	ctx.rotate(pAngle);
	
	ctx.beginPath();
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 2;
	ctx.fillStyle = '#000';
	if (drawOn == 'right') {
		ctx.moveTo(14,-103);
		ctx.lineTo(24,-103);
		ctx.lineTo(24,-67);
		ctx.lineTo(14,-67);	
		ctx.lineTo(14,-103);
	} else {
		ctx.moveTo(-14,-103);
		ctx.lineTo(-24,-103);
		ctx.lineTo(-24,-67);
		ctx.lineTo(-14,-67);	
		ctx.lineTo(-14,-103);		
	}
	ctx.fill();
	ctx.stroke();
	
	ctx.rotate(-pAngle);	
	ctx.translate(0,-armLength);

	ctx.strokeStyle = '#000';
	ctx.fillStyle = '#CCC';
	ctx.lineWidth = 0.5;
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(0,armLength-86);
	ctx.stroke();

	ctx.rotate(angle3);
	ctx.translate(-center2[0],-center2[1]);	
	
	// draw top of compass
	ctx.translate(center2[0],center2[1]);
	if (drawOn == 'right') {
		ctx.rotate(draw[taskId].compass.angle);
	} else {
		ctx.rotate(draw[taskId].compass.angle + Math.PI);		
	}
	
	roundedRect(ctx,-15,-30,30,55,10,2,'#000','#000');
	roundedRect(ctx,-5,-60,10,30,0,2,'#000','#000');	
	ctx.fillStyle = '#CCC';
	ctx.beginPath();
	ctx.arc(0,0,7,0,2*Math.PI);
	ctx.fill();
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(-4,-4);
	ctx.lineTo(4,4);
	ctx.moveTo(4,-4);
	ctx.lineTo(-4,4);
	ctx.stroke();

	if (drawOn == 'right') {
		ctx.rotate(-draw[taskId].compass.angle);
	} else {
		ctx.rotate(-draw[taskId].compass.angle - Math.PI);		
	}
	ctx.translate(-center2[0],-center2[1]);	
}
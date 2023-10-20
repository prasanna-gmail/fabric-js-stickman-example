/* drawModes:
select - 
none - 	
pen,line,rect,square,circle,ellipse - click & drag to create new object of this type
selectDrag - 
textStart - 
textEdit - 
table - 
tableChange - 
tableBorders -
tableCellColor - 
tableColResize
tableRowResize
gridDrag
gridRescaleX
gridRescaleY
compassMove1
compassMove2
compassDraw
protractorRotate
protractorMove
rulerRotate
rulerMove
curveStart - dragging a curve's start position
curveFin - dragging a curve's fin position
curveControl - dragging a curve's control position
selectRect - a dashed selectRect is being dragged 
lineEnds
(button)
(iinput)
qBoxResizeX
qBoxResizeY
tableInputSelect // dragging to select a cell or multiple cells starting from input
tableCellSelect // dragging to select a cell or multiple cells NOT starting from input
tableColSelect
tableRowSelect
multChoiceSpacingResize
*/
/* bluesky
- zoom
- isolate path (for editing)
- export path as png
- toFront & toBack buttons
- tables (and other elements?):
	- draw fully on an invisible canvas
	- draw directly from invis canvas to vis canvas when necc.
- keyboard shortcuts
	- SHIFT AND...
		drag - align to other paths
- polygon problems?
	- force clockwise when closure of path
	- adding vertices issue
- polygon finish...
	- draw buttons
	- pyramids
- text problems?
	- selecting / end of line
- ability to open multiple documents and to copy / paste between them
*/


/***************************/
/*					  	   */
/*   LOAD, SAVE, EXPORT    */
/*				  	  	   */
/***************************/

function png(sf,filename,print) {
	if (typeof sf == 'undefined') sf = 1;
	if (typeof filename == 'undefined') filename = 'file.png';
	if (filename.slice(-4).toLowerCase() !== '.png') filename += '.png';
	deselectAllPaths();
	var canvas = drawPathsToCanvas(undefined,draw[taskId].path,undefined,sf);
	
	if (typeof print == 'boolean' && print == true) {
		printCanvasAsPNG(canvas,filename);
	} else {
		window.open(canvas.toDataURL("image/png"),'_blank');
		//saveCanvasAsPNG(canvas,filename);
	}
}
function preview() {
	//var tasktag = prompt("Please enter tasktag", "j999");
	//var taskTag = 'j999';
	//js(tasktag);
	var js3 = js2('j999',false);
	var params = 'js='+encodeURIComponent(js3);
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", 'preview.php', true);
	xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			//console.log(this.responseText);
			window.open("./j999.js");
			window.open("./preview.html");
		}
	}
	xmlhttp.send(params);
}
function js2(taskTag,dl) {
	if (!taskTag) taskTag = 'j999';
	var dl = boolean(dl,true);
	var canvas = taskTag+'canvas1';
	var context = taskTag+'canvas1.ctx';
	var br = '\r\n';
	var tab = String.fromCharCode(9);
	
	var js = '// JavaScript Document'+br+'// Constructed with taskBuilder'+br+'taskTag = "'+taskTag+'";'+br+'taskId = task.indexOf(taskTag);'+br+br+'initialiseTaskVariables();'+br+'loadHandler[taskId] = function() {'+br+tab+'reviveDrawPaths('+taskTag+'paths,false);'+br+tab+'drawPathsToCanvas('+taskTag+'canvas1,'+taskTag+'paths,0);'+br+'}'+br+'backgroundLoadHandler[taskId] = function() {};'+br+br;
	js += 'var '+taskTag+'canvas1 = createButton(0,0,0,1200,700,true,false,false,2);'+br;
	js += taskTag+'canvas1.ctx.lineCap = "round";'+br;
	js += taskTag+'canvas1.ctx.lineJoin = "round";'+br+br;
	
	var paths = [];
	for (var i = 0; i < draw[taskId].path.length; i++) {
		paths[i] = reduceDrawPathForSaving(i);
	}
	paths = stringify(paths,{maxLength:150});
	js += taskTag+'paths = '+paths+';'+br+br;
	
	return js;
}

/*function js(taskTag,dl) {
	if (!taskTag) taskTag = 'j999';
	var dl = boolean(dl,true);
	var canvas = taskTag+'canvas1';
	var context = taskTag+'canvas1.ctx';
	var br = '\r\n';
	var tab = String.fromCharCode(9);
	
	// first check through for inputs, images and buttons
	var inputs = [];
	var tableInputs = [];
	var images = [];
	var buttons = [];
	var video;
	for (var i = 0; i < draw[taskId].path.length; i++) {
		for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
			if (draw[taskId].path[i].obj[j].type == 'input') {
				draw[taskId].path[i].obj[j].inputNum = inputs.length;
				if (draw[taskId].path[i].trigger[0] !== 'undefined' && draw[taskId].path[i].trigger[0] == false) {
					draw[taskId].path[i].obj[j].visible = false;
				} else {
					draw[taskId].path[i].obj[j].visible = true;
				}
				inputs.push(draw[taskId].path[i].obj[j]);
			}
			if (draw[taskId].path[i].obj[j].type == 'image') {
				draw[taskId].path[i].obj[j].imageNum = images.length;
				images.push(draw[taskId].path[i].obj[j]);
			}
			if (draw[taskId].path[i].obj[j].type == 'button') {
				draw[taskId].path[i].obj[j].buttonNum = buttons.length;
				buttons.push(draw[taskId].path[i].obj[j]);
			}
			if (draw[taskId].path[i].obj[j].type == 'video') {
				video = draw[taskId].path[i].obj[j];
			}			
		}
	}
		
	if (typeof video !== 'undefined') {
		var js = '// JavaScript Document'+br+'// Constructed with taskBuilder'+br+'taskTag = "'+taskTag+'";'+br+'taskId = task.indexOf(taskTag);'+br+br+'initialiseTaskVariables();'+br+'backgroundLoadHandler[taskId] = function() {}'+br+'loadHandler[taskId] = function() {'+br+tab+taskTag+'trigger(0);'+br+'};'+br+br;
		js += 'var '+taskTag+'canvas1 = createButton(0,0,0,1200,700,true,false,false,2);'+br;
		js += taskTag+'canvas1.ctx.lineCap = "round";'+br;
		js += taskTag+'canvas1.ctx.lineJoin = "round";'+br;
		
		js += inputsJS()+br+br;
		for (var i = 0; i < images.length; i++) {
			js += 'createImageCanvas('+i+',taskTag,taskId,"'+images[i].filename+'",'+images[i].left+','+images[i].top+',true,false,false,2,'+images[i].scaleFactor+');'+br;
		}
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].buttonNum = i + 1;
			js += 'var '+taskTag+'button'+buttons[i].buttonNum+' = createButton('+buttons[i].buttonNum+','+buttons[i].left+','+buttons[i].top+','+buttons[i].width+','+buttons[i].height+',false,false,true,2);'+br;
			js += 'drawTextBox('+taskTag+'button'+buttons[i].buttonNum+','+taskTag+'button'+buttons[i].buttonNum+'.ctx,'+taskTag+'button'+buttons[i].buttonNum+'.data,"'+buttons[i].fillColor+'","'+buttons[i].color+'",'+buttons[i].thickness+',"Arial","#000","center","");'+br;
			js += 'text({context:'+taskTag+'button'+buttons[i].buttonNum+'.ctx,left:0,width:'+buttons[i].width+',top:0,textArray:'+JSON.stringify(buttons[i].mathsInput.richText)+',vertAlign:"middle"});'+br;
			js += 'addListener('+taskTag+'button'+buttons[i].buttonNum+',function() {});'+br+br;
		}
		
		js += 'loadVideo("'+video.code+'",'+video.aspectRatio+','+video.scaleFactor+','+video.left+','+video.top+',true,'+JSON.stringify(draw[taskId].videoTriggerPoints)+', "'+taskTag+'trigger",'+video.left+','+video.top+');'+br+br;
		
		js += 'function '+taskTag+'playVideo() {}'+br;
		js += 'function '+taskTag+'pauseVideo() {}'+br;	
		js += 'var '+taskTag+'vidStartTimes = [0]'+br;	
		js += 'var '+taskTag+'vidEndTimes = ['+player[0].getDuration()+']'+br;			
		js += 'function '+taskTag+'trigger(triggerNum) {'+br;
		js += tab+'switch (triggerNum) {'+br;
		
		for (var k = 0; k < draw[taskId].triggerNumMax; k++) {
			js += tab+tab+'case '+k+':'+br;
			js += tab+tab+tab+taskTag+'canvas1.ctx.clearRect(0,0,1200,700);'+br+br;
			for (var i = 0; i < draw[taskId].path.length; i++) {
				var vis = true;
				for (var m = 0; m <= k; m++) {
					if (typeof draw[taskId].path[i].trigger[m] == 'boolean' && draw[taskId].path[i].trigger[m] == true) {
						vis = true;
					} else if (typeof draw[taskId].path[i].trigger[m] == 'boolean' && draw[taskId].path[i].trigger[m] == false) {
						vis = false;
					}
				}
				if (vis == true) {
					js += objJS(draw[taskId].path[i],k,tab+tab+tab);
				} else {
					for (var j = 0; j < draw[taskId].path[i].obj.length; j++) { // for each object within group
						if (draw[taskId].path[i].obj[j].type == 'image') {
							js += tab+tab+tab+'hideObj('+taskTag+'imageCanvas['+draw[taskId].path[i].obj[j].imageNum+'],'+taskTag+'imageCanvasData['+draw[taskId].path[i].obj[j].imageNum+']);'+br;
						} else if (draw[taskId].path[i].obj[j].type == 'input') {
							js += tab+tab+tab+'hideMathsInput(mathsInput[taskId]['+draw[taskId].path[i].obj[j].inputNum+']);'+br;
						} else if (draw[taskId].path[i].obj[j].type == 'button') {
							js += tab+tab+tab+'hideObj('+taskTag+'button'+draw[taskId].path[i].obj[j].buttonNum+','+taskTag+'button'+draw[taskId].path[i].obj[j].buttonNum+'.data);'+br;
						}
					}
				}
			}
			js += tab+tab+tab+'break;'+br;
		}
		
		js += tab+'}'+br;
		js += '}'+br;
		
	} else if (draw[taskId].triggerEnabled == false) {
		var js = '// JavaScript Document'+br+'// Constructed with taskBuilder'+br+'taskTag = "'+taskTag+'";'+br+'taskId = task.indexOf(taskTag);'+br+br+'initialiseTaskVariables();'+br+'loadHandler[taskId] = function() {}'+br+'backgroundLoadHandler[taskId] = function() {};'+br+br;
		js += 'var '+taskTag+'canvas1 = createButton(0,0,0,1200,700,true,false,false,2);'+br+br;
		js += taskTag+'canvas1.ctx.lineCap = "round";'+br;
		js += taskTag+'canvas1.ctx.lineJoin = "round";'+br;

		js += inputsJS()+br+br;
		for (var i = 0; i < images.length; i++) {
			js += 'createImageCanvas('+i+',taskTag,taskId,"'+images[i].filename+'",'+images[i].left+','+images[i].top+',true,false,false,2,'+images[i].scaleFactor+');'+br;
		}
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].buttonNum = i + 1;
			js += 'var '+taskTag+'button'+buttons[i].buttonNum+' = createButton('+buttons[i].buttonNum+','+buttons[i].left+','+buttons[i].top+','+buttons[i].width+','+buttons[i].height+',true,false,true,2);'+br;
			js += 'drawTextBox('+taskTag+'button'+buttons[i].buttonNum+','+taskTag+'button'+buttons[i].buttonNum+'.ctx,'+taskTag+'button'+buttons[i].buttonNum+'.data,"'+buttons[i].fillColor+'","'+buttons[i].color+'",'+buttons[i].thickness+',"Arial","#000","center","");'+br;
			js += 'text({context:'+taskTag+'button'+buttons[i].buttonNum+'.ctx,left:0,width:'+buttons[i].width+',top:0,textArray:'+JSON.stringify(buttons[i].mathsInput.richText)+',vertAlign:"middle"});'+br;
			js += 'addListener('+taskTag+'button'+buttons[i].buttonNum+',function() {});'+br+br;
		}
		js += br;
		for (var i = 0; i < draw[taskId].path.length; i++) {
			js += objJS(draw[taskId].path[i]);
		}
	} else {
		var js = '// JavaScript Document'+br+'// Constructed with taskBuilder'+br+'taskTag = "'+taskTag+'";'+br+'taskId = task.indexOf(taskTag);'+br+br+'initialiseTaskVariables();'+br+'backgroundLoadHandler[taskId] = function() {}'+br+'loadHandler[taskId] = function() {'+br+tab+taskTag+'step = -1;'+br+tab+taskTag+'stepOn();'+br+'};'+br+br;
		js += 'var '+taskTag+'canvas1 = createButton(0,0,0,1200,700,true,false,false,2);'+br;
		js += taskTag+'canvas1.ctx.lineCap = "round";'+br;
		js += taskTag+'canvas1.ctx.lineJoin = "round";'+br;		
		js += 'var '+taskTag+'button1 = createButton(0,1120,620,55,55,true,false,true,2);'+br;
		js += 'roundedRect('+taskTag+'button1.ctx,3,3,49,49,4,6,"#000","#C9F");'+br;
		js += 'drawPath({ctx:'+taskTag+'button1.ctx,path:[[17,15],[17,40],[38,27.5]],lineColor:"#000",fillColor:"#000",lineWidth:2});'+br;
		js += 'addListener('+taskTag+'button1,'+taskTag+'stepOn);'+br+br;		
		
		js += inputsJS()+br+br;
		for (var i = 0; i < images.length; i++) {
			js += 'createImageCanvas('+i+',taskTag,taskId,"'+images[i].filename+'",'+images[i].left+','+images[i].top+',true,false,false,2,'+images[i].scaleFactor+');'+br;
		}
		for (var i = 0; i < buttons.length; i++) {
			buttons[i].buttonNum = i + 2;
			js += 'var '+taskTag+'button'+buttons[i].buttonNum+' = createButton('+buttons[i].buttonNum+','+buttons[i].left+','+buttons[i].top+','+buttons[i].width+','+buttons[i].height+',false,false,true,2);'+br;
			js += 'drawTextBox('+taskTag+'button'+buttons[i].buttonNum+','+taskTag+'button'+buttons[i].buttonNum+'.ctx,'+taskTag+'button'+buttons[i].buttonNum+'.data,"'+buttons[i].fillColor+'","'+buttons[i].color+'",'+buttons[i].thickness+',"Arial","#000","center","");'+br;
			js += 'text({context:'+taskTag+'button'+buttons[i].buttonNum+'.ctx,left:0,width:'+buttons[i].width+',top:0,textArray:'+JSON.stringify(buttons[i].mathsInput.richText)+',vertAlign:"middle"});'+br;
			js += 'addListener('+taskTag+'button'+buttons[i].buttonNum+',function() {});'+br+br;
		}
		
		js += 'function '+taskTag+'stepOn() {'+br;
		js += tab+taskTag+'step++;'+br;
		js += tab+'switch ('+taskTag+'step) {'+br;
		
		for (var k = 0; k < draw[taskId].triggerNumMax; k++) {
			js += tab+tab+'case '+k+':'+br;
			js += tab+tab+tab+taskTag+'canvas1.ctx.clearRect(0,0,1200,700);'+br+br;
			for (var i = 0; i < draw[taskId].path.length; i++) {
				var vis = true;
				for (var m = 0; m <= k; m++) {
					if (typeof draw[taskId].path[i].trigger[m] == 'boolean' && draw[taskId].path[i].trigger[m] == true) {
						vis = true;
					} else if (typeof draw[taskId].path[i].trigger[m] == 'boolean' && draw[taskId].path[i].trigger[m] == false) {
						vis = false;
					}
				}
				if (vis == true) {
					js += objJS(draw[taskId].path[i],k,tab+tab+tab);
				} else {
					for (var j = 0; j < draw[taskId].path[i].obj.length; j++) { // for each object within group
						if (draw[taskId].path[i].obj[j].type == 'image') {
							js += tab+tab+tab+'hideObj('+taskTag+'imageCanvas['+draw[taskId].path[i].obj[j].imageNum+'],'+taskTag+'imageCanvasData['+draw[taskId].path[i].obj[j].imageNum+']);'+br;
						} else if (draw[taskId].path[i].obj[j].type == 'input') {
							js += tab+tab+tab+'hideMathsInput(mathsInput[taskId]['+draw[taskId].path[i].obj[j].inputNum+']);'+br;
						} else if (draw[taskId].path[i].obj[j].type == 'button') {
							js += tab+tab+tab+'hideObj('+taskTag+'button'+draw[taskId].path[i].obj[j].buttonNum+','+taskTag+'button'+draw[taskId].path[i].obj[j].buttonNum+'.data);'+br;
						}
					}
				}
			}
			js += tab+tab+tab+'break;'+br;
		}
		
		js += tab+'}'+br;
		js += '}'+br; 
	}
	
	function objJS(path,triggerNum,tabs) {
		if (typeof triggerNum == 'undefined') triggerNum = -1;
		if (!tabs) tabs = '';
		var js = tabs;		
		for (var j = 0; j < path.obj.length; j++) { // for each object within group
			var obj = path.obj[j];
			if (typeof obj.color !== 'undefined') {
				if (obj.type !== 'button') {
					js += context+'.strokeStyle = "'+obj.color+'";'+br+tabs;
				}
			}
			if (typeof obj.thickness !== 'undefined') {			
				if (obj.type !== 'button') {	
					js += context+'.lineWidth = '+obj.thickness+';'+br+tabs;
				}
			}
			if (obj.type == 'arc') {
				js += context+'.beginPath();'+br+tabs;
				if (obj.clockwise == true) {
					js += context+'.arc('+obj.center[0]+','+obj.center[1]+','+obj.radius+','+obj.startAngle+','+obj.finAngle+');'+br+tabs;
				} else {
					js += context+'.arc('+obj.center[0]+','+obj.center[1]+','+obj.radius+','+obj.finAngle+','+obj.startAngle+');'+br+tabs;
				}
				js += context+'.stroke();'+br+br+tabs;
			} else if (obj.type == 'pen') {
				for (var k = 1; k < obj.pos.length; k++) {
					obj.pos[k][0] = roundToNearest(obj.pos[k][0],0.01);
					obj.pos[k][1] = roundToNearest(obj.pos[k][1],0.01);
				}
				js += taskTag+'penPath'+i+j+' = '+JSON.stringify(obj.pos)+';'+br+tabs;
				js += context+'.beginPath();'+br+tabs;
				js += context+'.moveTo('+taskTag+'penPath'+i+j+'.obj[0],'+taskTag+'penPath'+i+j+'[0][1]);'+br+tabs;
				js += 'for (var i = 1; i < '+taskTag+'penPath'+i+j+'.length - 2; i++) {'+br+tabs;
				js += tab+context+'.quadraticCurveTo('+taskTag+'penPath'+i+j+'[i][0],'+taskTag+'penPath'+i+j+'[i][1],('+taskTag+'penPath'+i+j+'[i][0]+'+taskTag+'penPath'+i+j+'[i+1][0])/2,('+taskTag+'penPath'+i+j+'[i][1]+'+taskTag+'penPath'+i+j+'[i+1][1])/2);'+br+tabs;
				js += '}'+br+tabs;
				js += context+'.quadraticCurveTo('+taskTag+'penPath'+i+j+'[i][0],'+taskTag+'penPath'+i+j+'[i][1],'+taskTag+'penPath'+i+j+'[i+1][0],'+taskTag+'penPath'+i+j+'[i+1][1]);'+br+tabs;
				js += context+'.stroke();'+br+br+tabs;				
			} else if (obj.type == 'line' && typeof obj.finPos !== 'undefined') {
				js += context+'.beginPath();'+br+tabs;				
				js += context+'.moveTo('+obj.startPos[0]+','+obj.startPos[1]+');'+br+tabs;
				js += context+'.lineTo('+obj.finPos[0]+','+obj.finPos[1]+');'+br+tabs;
				js += context+'.stroke();'+br+tabs;
				if (obj.endStart == 'open') {
					js += 'drawArrow({context:'+context+',startX:'+obj.finPos[0]+',startY:'+obj.finPos[1]+',finX:'+obj.startPos[0]+',finY:'+obj.startPos[1]+',arrowLength:'+obj.endMidSize+',color:"'+ctx.strokeStyle+'",lineWidth:'+ctx.lineWidth+',arrowLineWidth:'+ctx.lineWidth+'});'+br+tabs;
				}
				if (obj.endStart == 'closed') {
					js += 'drawArrow({context:'+context+',startX:'+obj.finPos[0]+',startY:'+obj.finPos[1]+',finX:'+obj.startPos[0]+',finY:'+obj.startPos[1]+',arrowLength:'+obj.endMidSize+',color:"'+ctx.strokeStyle+'",lineWidth:'+obj.thickness+',arrowLineWidth:'+ctx.lineWidth+',fillArrow:true});'+br+tabs;					
				}
				
				if (obj.endMid == 'dash') {
					js += 'drawDash('+context+','+obj.startPos[0]+','+obj.startPos[1]+','+obj.finPos[0]+','+obj.finPos[1]+',8);'+br+tabs;
				}
				if (obj.endMid == 'dash2') {
					js += 'drawDoubleDash('+context+','+obj.startPos[0]+','+obj.startPos[1]+','+obj.finPos[0]+','+obj.finPos[1]+',8);'+br+tabs;
				}				
				if (obj.endMid == 'open') {
					js += 'drawParallelArrow({context:'+context+',startX:'+obj.startPos[0]+',startY:'+obj.startPos[1]+',finX:'+obj.finPos[0]+',finY:'+obj.finPos[1]+',arrowLength:'+obj.endMidSize+',lineWidth:'+obj.thickness+'});'+br+tabs;
				}
				if (obj.endMid == 'open2') {
					js += 'drawParallelArrow({context:'+context+',startX:'+obj.startPos[0]+',startY:'+obj.startPos[1]+',finX:'+obj.finPos[0]+',finY:'+obj.finPos[1]+',arrowLength:'+obj.endMidSize+',lineWidth:'+obj.thickness+',numOfArrows:2});'+br+tabs;
				}
				
				if (obj.endFin == 'open') {
					js += 'drawArrow({context:'+context+',startX:'+obj.startPos[0]+',startY:'+obj.startPos[1]+',finX:'+obj.finPos[0]+',finY:'+obj.finPos[1]+',arrowLength:'+obj.endMidSize+',color:"'+ctx.strokeStyle+'",lineWidth:'+obj.thickness+',arrowLineWidth:'+obj.thickness+'});'+br+tabs;
				}
				if (obj.endFin == 'closed') {
					js += 'drawArrow({context:'+context+',startX:'+obj.startPos[0]+',startY:'+obj.startPos[1]+',finX:'+obj.finPos[0]+',finY:'+obj.finPos[1]+',arrowLength:'+obj.endMidSize+',color:"'+ctx.strokeStyle+'",lineWidth:'+obj.thickness+',arrowLineWidth:'+obj.thickness+',fillArrow:true});'+br+tabs;
				}
				js += br+tabs;
				
			} else if (['curve'].indexOf(obj.type) > -1) {
				js += context+'.beginPath();'+br+tabs;				
				js += context+'.moveTo('+obj.startPos[0]+','+obj.startPos[1]+');'+br+tabs;
				js += context+'.quadraticCurveTo('+obj.controlPos[0]+','+obj.controlPos[1]+','+obj.finPos[0]+','+obj.finPos[1]+');'+br+tabs;
				js += context+'.stroke();'+br+tabs;				

				if (obj.endStart == 'open') {
					js += 'drawArrow({context:'+context+',startX:'+obj.controlPos[0]+',startY:'+obj.controlPos[1]+',finX:'+obj.startPos[0]+',finY:'+obj.startPos[1]+',arrowLength:'+obj.endStartSize+',color:"'+ctx.strokeStyle+'",lineWidth:'+obj.thickness+',arrowLineWidth:'+obj.thickness+',showLine:false});'+br+tabs;
				}
				if (obj.endStart == 'closed') {
					js += 'drawArrow({context:'+context+',startX:'+obj.controlPos[0]+',startY:'+obj.controlPos[1]+',finX:'+obj.startPos[0]+',finY:'+obj.startPos[1]+',arrowLength:'+obj.endStartSize+',color:"'+ctx.strokeStyle+'",lineWidth:'+obj.thickness+',arrowLineWidth:'+obj.thickness+',fillArrow:true,showLine:false});'+br+tabs;
				}
				
				if (obj.endMid == 'open') {
					js += 'drawParallelArrow({context:'+context+',startX:'+obj.mid1[0]+',startY:'+obj.mid1[1]+',finX:'+obj.mid2[0]+',finY:'+obj.mid2[1]+',arrowLength:'+obj.endMidSize+',lineWidth:'+obj.thickness+'});'+br+tabs;
				}
				
				if (obj.endFin == 'open') {
					js += 'drawArrow({context:'+context+',startX:'+obj.controlPos[0]+',startY:'+obj.controlPos[1]+',finX:'+obj.finPos[0]+',finY:'+obj.finPos[1]+',arrowLength:'+obj.endStartSize+',color:"'+ctx.strokeStyle+'",lineWidth:'+obj.thickness+',arrowLineWidth:'+obj.thickness+',showLine:false});'+br+tabs;
				}
				if (obj.endFin == 'closed') {
					js += 'drawArrow({context:'+context+',startX:'+obj.controlPos[0]+',startY:'+obj.controlPos[1]+',finX:'+obj.finPos[0]+',finY:'+obj.finPos[1]+',arrowLength:'+obj.endStartSize+',color:"'+ctx.strokeStyle+'",lineWidth:'+obj.thickness+',arrowLineWidth:'+obj.thickness+',fillArrow:true,showLine:false});'+br+tabs;
				}
				js += br+tabs;				
			} else if ((obj.type == 'rect' || obj.type == 'square') && typeof obj.finPos !== 'undefined') {
				if (obj.fillColor !== 'none') {					
					js += context+'.fillStyle = "'+obj.fillColor+'";'+br+tabs;
					js += context+'.fillRect('+obj.startPos[0]+','+obj.startPos[1]+','+(obj.finPos[0]-obj.startPos[0])+','+(obj.finPos[1]-obj.startPos[1])+');'+br+tabs;
				}
				js += context+'.strokeRect('+obj.startPos[0]+','+obj.startPos[1]+','+(obj.finPos[0]-obj.startPos[0])+','+(obj.finPos[1]-obj.startPos[1])+');'+br+br+tabs;
			} else if (obj.type == 'image') {
				js += 'showObj('+taskTag+'imageCanvas['+obj.imageNum+'],'+taskTag+'imageCanvasData['+obj.imageNum+']);'+br;
			} else if (obj.type == 'button') {
				js += 'showObj('+taskTag+'button'+obj.buttonNum+','+taskTag+'button'+obj.buttonNum+'.data);'+br;
			} else if (obj.type == 'input') {
				js += 'showMathsInput(mathsInput[taskId]['+obj.inputNum+']);'+br;
			} else if (obj.type == 'circle') {
				if (obj.fillColor !== 'none') {
					js += context+'.fillStyle = "'+obj.fillColor+'";'+br+tabs;					
					js += context+'.beginPath();'+br+tabs;				
					js += context+'.arc('+obj.center[0]+','+obj.center[1]+','+obj.radius+',0,2*Math.PI);'+br+tabs;				
					js += context+'.fill();'+br+tabs;				
				}
				if (obj.showCenter == true || (path.selected == true && path.obj.length == 1)) {
					js += context+'.save();'+br+tabs;									
					js += context+'.fillStyle = "#000";'+br+tabs;					
					js += context+'.beginPath();'+br+tabs;									
					js += context+'.arc('+obj.center[0]+','+obj.center[1]+'3,0,2*Math.PI);'+br+tabs;				
					js += context+'.fill();'+br+tabs;
					js += context+'.restore();'+br+tabs;							
				}
				js += context+'.beginPath();'+br+tabs;				
				js += context+'.arc('+obj.center[0]+','+obj.center[1]+','+obj.radius+',0,2*Math.PI);'+br+tabs;
				js += context+'.stroke();'+br+br+tabs;				
			} else if (obj.type == 'ellipse') {
				if (obj.fillColor !== 'none') {
					js += context+'.fillStyle = "'+obj.fillColor+'";'+br+tabs;									
					js += context+'.save();'+br+tabs;					
					js += context+'.translate('+obj.center[0]+','+obj.center[1]+');'+br+tabs;
					if (obj.radiusX >= obj.radiusY) {
						js += context+'.scale('+(obj.radiusX/obj.radiusY)+',1);'+br+tabs;
						js += context+'.beginPath();'+br+tabs;
						js += context+'.arc(0,0,'+obj.radiusY+',0,2*Math.PI);'+br+tabs;					
					} else {
						js += context+'.scale(1,'+(obj.radiusY/obj.radiusX)+');'+br+tabs;						
						js += context+'.beginPath();'+br+tabs;				
						js += context+'.arc(0,0,'+obj.radiusX+',0,2*Math.PI);'+br+tabs;										
					}
					js += context+'.fill();'+br+tabs;									
					js += context+'.restore();'+br+br+tabs;					
				}				
				if (obj.showCenter == true) {
					js += context+'.save();'+br+tabs;					
					js += context+'.fillStyle = "#000";'+br+tabs;					
					js += context+'.beginPath();'+br+tabs;
					js += context+'.arc('+obj.center[0]+','+obj.center[1]+'3,0,2*Math.PI);'+br+tabs;	
					js += context+'.fill();'+br+tabs;					
					js += context+'.restore();'+br+br+tabs;	
				}
				js += context+'.save();'+br+tabs;													
				js += context+'.translate('+obj.center[0]+','+obj.center[1]+');'+br+tabs;				
				if (obj.radiusX >= obj.radiusY) {
					js += context+'.scale('+(obj.radiusX/obj.radiusY)+',1);'+br+tabs;
					js += context+'.beginPath();'+br+tabs;				
					js += context+'.arc(0,0,'+obj.radiusY+',0,2*Math.PI);'+br+tabs;									
				} else {
					js += context+'.scale(1,'+(obj.radiusY/obj.radiusX)+');'+br+tabs;				
					js += context+'.beginPath();'+br+tabs;				
					js += context+'.arc(0,0,'+obj.radiusX+',0,2*Math.PI);'+br+tabs;					
				}
				js += context+'.stroke();'+br+tabs;				
				js += context+'.restore();'+br+br+tabs;
			} else if (obj.type == 'text') {
				js += 'text({'+br+tabs;
				js += tab+'context:'+context+','+br+tabs;	
				js += tab+'textArray:'+JSON.stringify(obj.mathsInput.richText)+','+br+tabs;	
				js += tab+'left:'+(obj.left+10)+','+br+tabs;
				js += tab+'top:'+(obj.top+10)+','+br+tabs;
				js += tab+'width:'+obj.width+','+br+tabs;
				js += tab+'height:'+obj.height+','+br+tabs;
				js += tab+'textAlign:"'+obj.mathsInput.textAlign+'"'+br+tabs;
				js += '});'+br+br+tabs;
			} else if (obj.type == 'table') {
				var cells = [];
				for (var r = 0; r < obj.cells.length; r++) {
					cells[r] = [];
					for (var c = 0; c < obj.cells[r].length; c++) {
						cells[r][c] = {};
						if (typeof obj.cells[r][c].input == 'undefined' || obj.cells[r][c].input == false) {
							cells[r][c].color = obj.cells[r][c].color;
							cells[r][c].minWidth = obj.cells[r][c].minWidth;
							cells[r][c].minHeight = obj.cells[r][c].minHeight;
							var vis = true;
							if (draw[taskId].triggerEnabled == true) {
								for (var t = 0; t <= triggerNum; t++) {
									if (typeof obj.cells[r][c].trigger[t] == 'boolean' && obj.cells[r][c].trigger[t] == true) {
										vis = true;
									} else if (typeof obj.cells[r][c].trigger[t] == 'boolean' && obj.cells[r][c].trigger[t] == false) {
										vis = false;
									}
								}
							}
							if (vis == true) {
								cells[r][c].text = reduceTags(obj.mInputs[r][c].richText);
							} else {
								cells[r][c].text = [];
							}
						}
					}
				}
				js += 'drawTable2({'+br+tabs;
				js += tab+'ctx:'+context+','+br+tabs;	
				js += tab+'left:'+(obj.left+10)+','+br+tabs;
				js += tab+'top:'+(obj.top+10)+','+br+tabs;
				js += tab+'minCellWidth:'+obj.minCellWidth+','+br+tabs;
				js += tab+'minCellHeight:'+obj.minCellHeight+','+br+tabs;
				js += tab+'innerBorder:'+JSON.stringify(obj.innerBorder)+','+br+tabs;
				js += tab+'outerBorder:'+JSON.stringify(obj.outerBorder)+','+br+tabs;
				js += tab+'text:'+JSON.stringify(obj.text)+','+br+tabs;
				js += tab+'cells:'+JSON.stringify(cells,true,4)+br+tabs;
				js += '});'+br+br+tabs;
			} else if (obj.type == 'grid') {
				var showGrid = boolean(obj.showGrid,true);
				var showScales = boolean(obj.showScales,true);
				var showLabels = boolean(obj.showLabels,true);
				var invertedBackColor = getShades(mainCanvasFillStyle,true);			
				if (['#FFF','#fff','#FFFFFF','#ffffff'].indexOf(mainCanvasFillStyle) == -1) {
					var minorColor = invertedBackColor[12];
				} else {
					var minorColor = invertedBackColor[10];
					// slightly darker if white background - for printing
				}
				var majorColor = invertedBackColor[9];
				var xAxisColor = invertedBackColor[6];
				var yAxisColor = invertedBackColor[6];
				var borderColor = invertedBackColor[6];				
				var originColor = invertedBackColor[6];
				
				js += context+'.fillStyle = "#FFC";'+br+tabs;
				js += context+'.fillRect('+obj.left+','+obj.top+','+obj.width+','+obj.height+');'+br+tabs;
				js += 'drawGrid3('+context+',0,0,{left:'+obj.left+',top:'+obj.top+',width:'+obj.width+',height:'+obj.height+',xMin:'+obj.xMin+',xMax:'+obj.xMax+',yMin:'+obj.yMin+',yMax:'+obj.yMax+',xMinorStep:'+obj.xMinorStep+',xMajorStep:'+obj.xMajorStep+',yMinorStep:'+obj.yMinorStep+',yMajorStep:'+obj.yMajorStep+'},24,"'+minorColor+'","'+majorColor+'","'+xAxisColor+'","'+yAxisColor+'","'+borderColor+'","'+originColor+'",mainCanvasFillStyle,'+showGrid+','+showScales+','+showLabels+');'+br+tabs;
				//drawGrid3(ctx,0,0,obj,24,minorColor,majorColor,xAxisColor,yAxisColor,borderColor,originColor,mainCanvasFillStyle,showGrid,showScales,showLabels);

				if (typeof obj.points =='object') {
					for (var p = 0; p < obj.points.length; p++) {
						js += 'drawCoord('+context+','+draw[taskId].drawArea[0]+','+draw[taskId].drawArea[1]+','+JSON.stringify(obj)+','+obj.points[p][0]+','+obj.points[p][1]+','+getShades(mainCanvasFillStyle,true)[12]+')'+br+tabs;
					}
				}
				if (typeof obj.lineSegments =='object') {
					var showPoints = false;
					for (var p = 0; p < obj.lineSegments.length; p++) {
						if (typeof obj.lineSegments[p][1] !== 'undefined' && obj.lineSegments[p][1].length == 2) {
							if (obj.drawing == 'lineSegment' && p == obj.lineSegments.length-1) showPoints = true;
							js += 'drawLine('+context+','+raw[taskId].drawArea[0]+','+draw[taskId].drawArea[1]+','+JSON.stringify(obj)+','+obj.lineSegments[p][0][0]+','+obj.lineSegments[p][0][1]+','+obj.lineSegments[p][1][0]+','+obj.lineSegments[p][1][1]+','+getShades(mainCanvasFillStyle,true)[12]+',2,'+showPoints+',true)'+br+tabs;
						}
					}
				}
				if (typeof obj.lines =='object') {
					var showPoints = false;
					fo5 (var p = 0; p < obj.lines.length; p++) {
						if (typeof obj.lines[p][1] !== 'undefined' && obj.lines[p][1].length == 2) {
							if (obj.drawing == 'line' && p == obj.lines.length-1) showPoints = true;
							js += 'drawLine('+context+','+draw[taskId].drawArea[0]+','+draw[taskId].drawArea[1]+','+JSON.stringify(obj)+','+obj.lines[p][0][0]+','+obj.lines[p][0][1]+','+obj.lines[p][1][0]+','+obj.lines[p][1][1]+','+getShades(mainCanvasFillStyle,true)[12]+',2,'+showPoints+',false)'+br+tabs;
						}
					}
				}				
			} else if (obj.type == 'polygon' && obj.points.length > 1) {
				js += 'var obj = ' + JSON.stringify(obj) + ";" + br+tabs;
				js += 'obj.ctx = ' + context + ";" + br+tabs;
				js += 'drawPolygon(obj);' + br+br+tabs;
			} else if (obj.type == 'angle') {
				js += 'var obj = ' + JSON.stringify(obj) + ";" + br+tabs;
				js += 'obj.ctx = ' + context + ";" + br+tabs;
				js += 'drawAngle(obj);' + br+br+tabs;				
			}				
		}
		//remove tabs from end of string
		while (js.length > 0 && js.lastIndexOf(String.fromCharCode(9)) >= js.length - 1) {
			js = js.slice(0,-1);
		}
		return js;
	}
	
	function inputsJS() {
		var js = '';
		if (inputs.length > 0) {
			var inputsJS = '';
			var checkFuncsJS = '';
			var leftTextJS = '';
			var rightTextJS = '';
			for (var i = 0; i < inputs.length; i++) {
				inputsJS += tab+tab+'{'+br;
				inputsJS += tab+tab+tab+'left:'+inputs[i].left+','+br;
				inputsJS += tab+tab+tab+'top:'+inputs[i].top+','+br;
				inputsJS += tab+tab+tab+'width:'+inputs[i].width+','+br;
				inputsJS += tab+tab+tab+'height:'+inputs[i].height+','+br;
				inputsJS += tab+tab+tab+'visible:'+inputs[i].visible+','+br;				
				inputsJS += tab+tab+'},'+br;
				checkFuncsJS += tab+tab+'function(input) {'+br;
				checkFuncsJS += tab+tab+tab+'if (input.stringJS == "'+inputs[i].mathsInput.stringJS+'") {'+br;
				checkFuncsJS += tab+tab+tab+tab+'return true;'+br;
				checkFuncsJS += tab+tab+tab+'} else {'+br;
				checkFuncsJS += tab+tab+tab+tab+'return false;'+br;
				checkFuncsJS += tab+tab+tab+'}'+br;			
				checkFuncsJS += tab+tab+'},'+br;
				leftTextJS += tab+tab+JSON.stringify(inputs[i].leftInput.richText)+','+br;
				rightTextJS += tab+tab+JSON.stringify(inputs[i].rightInput.richText)+','+br;			
			}
			js += 'inputs({'+br;
			js += tab+'inputs:['+br;
			js += inputsJS;
			js += tab+'],'+br;
			js += tab+'leftText:['+br;
			js += leftTextJS;
			js += tab+'],'+br;
			js += tab+'rightText:['+br;
			js += rightTextJS;
			js += tab+'],'+br;
			js += tab+'checkFuncs:['+br;
			js += checkFuncsJS;
			js += tab+']'+br;						
			js += '});';
		}
		return js;
	}

	//if (dl == true) {
		//var element = document.createElement('a');
		//console.log(encodeURIComponent(js));
		//element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(js));
		//element.setAttribute('download', taskTag+'.js');

		//element.style.display = 'none';
		//document.body.appendChild(element);
		//element.click();
		//document.body.removeChild(element);
	//}
	
	console.log(js);
	//return js;
}*/
//loadScript('../jsPDF.js');
function pdf(filename,print) {
	if (typeof filename == 'undefined') filename = 'file.pdf';
	if (filename.slice(-4).toLowerCase() !== '.pdf') filename += '.pdf';
	var canvas = document.createElement('canvas');
	canvas.width = draw[taskId].drawCanvas[0].width;
	canvas.height = draw[taskId].drawCanvas[0].height;
	canvas.data = draw[taskId].drawCanvas[0].data;	
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = '#FFF';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	drawPathsToCanvas(canvas,draw[taskId].path);
	
	// write to jpg
    var imgData = canvas.toDataURL("image/jpeg");

	var margin = 5;
	var maxWidth = 210 - 2 * margin;
	var maxHeight = 297 - 2 * margin;
	
	if ((canvas.width/canvas.height) > (maxWidth/maxHeight)) {
		var width = maxWidth;
		var height = maxWidth*(canvas.height/canvas.width);
	} else {
		var height = maxHeight;
		var width = maxHeight*(canvas.width/canvas.height);
	}
	
	var pdf = new jsPDF('portrait');
	pdf.addImage(imgData,'JPEG',margin,margin,width,height);
	
	if (typeof print == 'boolean' && print == true) {
		var string = pdf.output('datauristring');
		var x = window.open();
		x.document.open();
		x.document.location=string;
	} else {
		pdf.save(filename);
	}	
}
function saveDrawPaths(filename) {
	if (typeof filename == 'undefined') filename = 'file.txt';
	if (filename.slice(-3).toLowerCase() !== '.txt') filename += '.txt';	

	var paths = [];
	for (var i = 0; i < draw[taskId].path.length; i++) {
		paths[i] = reduceDrawPathForSaving(i);
	}
	paths = stringify(paths,{maxLength:150});
	
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(paths));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

function loadDrawPaths() {
	fileChooser.click();
}
function waitForTextReadComplete(reader) {
	reader.onloadend = function(event) {
		var txt = event.target.result;
		//if (txt.indexOf('{') > 0) txt = txt.slice(txt.indexOf('{'));
		var obj = JSON.parse(txt);
		if (typeof obj.paths !== 'undefined') {
			// question box load
			var qBoxMode = 'static';
			if (typeof draw[taskId].loadMode !== 'undefined') qBoxMode = draw[taskId].loadMode;
			var i = draw[taskId].qBox.length;
			draw[taskId].qBox[i] = qBoxMode;
			draw[taskId].snap = false;
			draw[taskId].gridSnap = false;			
			draw[taskId].qSize[i] = obj.size;
			draw[taskId].qMinWidth[i] = obj.minWidth;
			draw[taskId].qMinHeight[i] = obj.minHeight;
			for (var p = 0; p < obj.paths.length; p++) {
				obj.paths[p].qBox = i;
				obj.paths[p].qBoxState = qBoxMode;
			}
			draw[taskId].path = draw[taskId].path.concat(obj.paths);
			reviveDrawPaths(draw[taskId].path);
			// add trigger if necessary
			for (var i = 0; i < draw[taskId].buttons.length; i++) {
				if (draw[taskId].buttons[i].type == 'trigger') {
					draw[taskId].buttons[i].click();
					break;
				}
			}			
			for (var i = 0; i < draw[taskId].path.length; i++) {
				updateBorder(draw[taskId].path[i]);
			}
			qBoxRefresh();
			drawCanvasPaths();
			calcCursorPositions();
			delete draw[taskId].loadMode;
		} else {
			// paths load
			//clearDrawPaths();
			console.log(obj);
			reviveDrawPaths(obj);
			draw[taskId].path = draw[taskId].path.concat(obj);
			// add trigger if necessary
			for (var i = 0; i < draw[taskId].buttons.length; i++) {
				if (draw[taskId].buttons[i].type == 'trigger') {
					draw[taskId].buttons[i].click();
					break;
				}
			}
			for (var i = 0; i < draw[taskId].path.length; i++) {
				updateBorder(draw[taskId].path[i]);
			}
			drawCanvasPaths();
			calcCursorPositions();
		}
	}
}
function handleFileSelection() {
	var file = fileChooser.files[0],
	reader = new FileReader();
	waitForTextReadComplete(reader);
	reader.readAsText(file);
}
var fileChooser = document.createElement('INPUT');
fileChooser.type = 'file';
fileChooser.style.visibility = 'hidden';
fileChooser.addEventListener('change', handleFileSelection, false);

function reviveDrawPaths(path,visible) {
	if (typeof path == 'undefined') path = draw[taskId].path;
	var vis = boolean(visible,true);
	// revives maths inputs etc
	for (var i = 0; i < path.length; i++) {
		for (var j = 0; j < path[i].obj.length; j++) {
			var obj = path[i].obj[j];
			var alpha = 1;
			if (typeof path[i].trigger == 'object' && path[i].trigger[0] == false) alpha = 0;
			switch (obj.type) {
				case 'text':
				case 'button':
					reviveMathsInput(obj.mathsInput,alpha,vis);
					break;
				case 'input':
					reviveMathsInput(obj.leftInput,alpha,vis);
					reviveMathsInput(obj.mathsInput,alpha,vis);
					reviveMathsInput(obj.rightInput,alpha,vis);
					break;
				case 'table':
				case 'table2':
					for (var k = 0; k < obj.mInputs.length; k++) {
						for (var l = 0; l < obj.mInputs[k].length; l++) {
							reviveMathsInput(obj.mInputs[k][l],alpha,vis);
						}
					}
					break;
				case 'multChoice':
					for (var k = 0; k < obj.mInputs.length; k++) {
						reviveMathsInput(obj.mInputs[k],alpha,vis);
					}
					break;					
				case 'image':
					reviveImage(obj);
					break;
			}
		}
	}	
}
function reviveMathsInput(m,alpha,vis) {
	if (typeof alpha == 'undefined') alpha = 1;
	if (typeof vis == 'undefined') vis = true;
	if (typeof m.data == 'undefined' && typeof m.savedData !== 'undefined') {
		m.data = [];
		for (var i = 0; i < 8; i++) {
			m.data[i] = m.savedData[i];
			m.data[100+i] = m.savedData[i];
		}
	} else if (boolean(m.condensed,false) == true) {
		m.data = [m.rect[0],m.rect[1],m.rect[2],m.rect[3],true,false,true,m.zIndex];
		for (var i = 0; i < 8; i++) {
			m.data[100+i] = m.data[i];
		}
	}
	if (typeof m.cursorData == 'undefined' && typeof m.savedCursorData !== 'undefined') {
		m.cursorData = [];
		for (var i = 0; i < 8; i++) {
			m.cursorData[i] = m.savedCursorData[i];
			m.cursorData[100+i] = m.savedCursorData[i];
		}
	} else if (boolean(m.condensed,false) == true) {
		m.cursorData = [m.cursorRect[0],m.cursorRect[1],m.cursorRect[2],m.cursorRect[3],true,false,true,m.zIndex];
		for (var i = 0; i < 8; i++) {
			m.cursorData[100+i] = m.cursorData[i];
		}		
	}

	if (vis == false) {
		m.data[4] = false;
		m.cursorData[4] = false;
		m.data[104] = false;
		m.cursorData[104] = false;
	}
	
	m.canvas = createCanvas(m.data[100],m.data[101],m.data[102],m.data[103],m.data[104],m.data[105],m.data[106],m.data[107]);
	//m.canvas.setAttribute('class', 'inputClass');
	m.canvas.className = 'inputClass';
	m.canvas.style.opacity = alpha;
	m.canvas.data = m.data;
	m.ctx = m.canvas.ctx;
	taskObject[taskId].push(m.canvas);
	taskObjectData[taskId].push(m.canvas.data);
	resizeCanvas(m.canvas,m.data[100],m.data[101],m.data[102],m.data[103]);
	
	m.cursorCanvas = createCanvas(m.cursorData[100],m.cursorData[101],m.cursorData[102],m.cursorData[103],m.cursorData[104],m.cursorData[105],m.cursorData[106],m.cursorData[107]);
	//m.cursorCanvas.setAttribute('class', 'inputClass');
	m.cursorCanvas.className = 'inputClass';
	m.cursorCanvas.style.opacity = alpha;
	m.cursorCanvas.data = m.cursorData;
	taskObject[taskId].push(m.cursorCanvas);
	taskObjectData[taskId].push(m.cursorCanvas.data);
	m.cursorctx = m.cursorCanvas.ctx;
	m.cursorCanvas.addEventListener('mousedown', startMathsInput, false);
	m.cursorCanvas.addEventListener('touchstart', startMathsInput, false);	
	resizeCanvas(m.cursorCanvas,m.cursorData[100],m.cursorData[101],m.cursorData[102],m.cursorData[103]);
	
	m.selectPos = [];
	m.selectable = true;
	
	//if (typeof currMathsInput == 'undefined')
	currMathsInput = m;
	drawMathsInputText(m);
	mathsInputMapCursorPos();
	currMathsInput.stringJS = createJsString();
	//console.log(m,m.cursorMap,m.cursorPos);
	m.id = window[taskTag+'mathsInput'].length;
	window[taskTag+'mathsInput'][m.id] = m;
}
function reviveImage(obj) {
	obj.image = new Image;
	if (!un(obj.src)) {
		obj.image.src = obj.src;
	}
}
function reviveObjectsInPaths(paths,visible) {
	var vis = boolean(visible,true);
	for (var p = 0; p < paths.length; p++) {
		for (var o = 0; o < paths[p].obj.length; o++) {
			if (paths[p].obj[o].type == 'text') {
				paths[p].obj[o].mathsInput.savedRichText = paths[p].obj[o].mathsInput.richText.slice();
			}
			switch (paths[p].obj[o].type) {
				case 'text':
				case 'button':
					reviveMathsInput(paths[p].obj[o].mathsInput,undefined,vis);
					break;
				case 'input':
					reviveMathsInput(paths[p].obj[o].leftInput,undefined,vis);
					reviveMathsInput(paths[p].obj[o].mathsInput,undefined,vis);
					reviveMathsInput(paths[p].obj[o].rightInput,undefined,vis);
					break;
				case 'table':
					for (var k = 0; k < paths[p].obj[o].mInputs.length; k++) {
						for (var l = 0; l < paths[p].obj[o].mInputs[k].length; l++) {
							reviveMathsInput(paths[p].obj[o].mInputs[k][l],undefined,vis);
							console.log(vis,paths[p].obj[o].mInputs[k][l]);
						}
					}
					break;
				case 'multChoice':
					for (var m = 0; m < paths[p].obj[o].mInputs.length; m++) {
						reviveMathsInput(paths[p].obj[o].mInputs[m],undefined,vis);
					}
					break;
					
			}					
		}
	}	
}

function reduceDrawPathForSaving(num) {
	var path = clone(draw[taskId].path[num]);
	//if (typeof path.border !== 'undefined') delete path.border;
	delete path.borderButtons;
	delete path.border;
	delete path.tightBorder;
	delete path.selected;
	delete path.ctx;
	for (var i = 0; i < path.obj.length; i++) {
		var obj = path.obj[i];
		switch (obj.type) {
			case 'text':
			case 'button':
				var mInput = reduceMathsInput(obj.mathsInput);
				obj.mathsInput = mInput;
				//console.log(obj.mathsInput);
				//console.log(mInput);
				break;
			case 'input':
				obj.leftInput = reduceMathsInput(obj.leftInput);
				obj.mathsInput = reduceMathsInput(obj.mathsInput);
				obj.rightInput = reduceMathsInput(obj.rightInput);
				if (!un(obj.ans)) delete obj.ans;
				if (!un(obj.ansNum)) delete obj.ansNum;
				if (!un(obj.ansText)) delete obj.ansText;
				if (!un(obj.ansRichText)) delete obj.ansRichText;
				if (!un(obj.ansStringJS)) delete obj.ansStringJS;
				if (!un(obj.answers)) delete obj.answers;
				if (!un(obj.pupilAnsData)) delete obj.pupilAnsData;
				break;
			case 'table':
			case 'table2':
				for (var k = 0; k < obj.mInputs.length; k++) {
					for (var l = 0; l < obj.mInputs[k].length; l++) {
						obj.mInputs[k][l] = reduceMathsInput(obj.mInputs[k][l]);
					}
				}
				break;
			case 'multChoice':
				for (var k = 0; k < obj.mInputs.length; k++) {
					obj.mInputs[k] = reduceMathsInput(obj.mInputs[k]);
				}
				break;				
		}
	}
	//console.log(path);
	return path;
}
function reduceMathsInput(input) {
	var input2 = clone(input);
	input2.savedData = [];
	input2.savedCursorData = [];
	for (var i = 100; i < 108; i++) {
		input2.savedData.push(input.data[i]);
		input2.savedCursorData.push(input.cursorData[i]);
	}
	input2.savedData[0] += draw[taskId].drawRelPos[0];
	input2.savedData[1] += draw[taskId].drawRelPos[1];
	input2.savedCursorData[0] += draw[taskId].drawRelPos[0];
	input2.savedCursorData[1] += draw[taskId].drawRelPos[1];
	
	if (typeof input2.data !== 'undefined') delete input2.data;
	if (typeof input2.cursorData !== 'undefined') delete input2.cursorData;
	if (typeof input2.textLoc !== 'undefined') delete input2.textLoc;
	if (typeof input2.cursorPos !== 'undefined') delete input2.cursorPos;
	if (typeof input2.cursorMap !== 'undefined') delete input2.cursorMap;
	if (typeof input2.allMap !== 'undefined') delete input2.allMap;
	
	if (typeof input2.canvas !== 'undefined') delete input2.canvas;
	if (typeof input2.ctx !== 'undefined') delete input2.ctx;
	if (typeof input2.cursorCanvas !== 'undefined') delete input2.cursorCanvas;
	if (typeof input2.cursorctx !== 'undefined') delete input2.cursorctx;
	if (typeof input2.startText !== 'undefined') delete input2.startText;
	if (typeof input2.startRichText !== 'undefined') delete input2.startRichText;
	if (typeof input2.startTags !== 'undefined') delete input2.startTags;

	if (typeof input2.text !== 'undefined') delete input2.text;
	if (typeof input2.stringJS !== 'undefined') delete input2.stringJS;
	if (typeof input2.fontSize !== 'undefined') delete input2.fontSize;
	if (typeof input2.textColor !== 'undefined') delete input2.textColor;
	if (typeof input2.currBackColor !== 'undefined') delete input2.currBackColor;
	if (typeof input2.preText !== 'undefined') delete input2.preText;
	if (typeof input2.postText !== 'undefined') delete input2.postText;
	
	
	//console.log(input2);
	return input2;
}
function reduceMathsInput2(input) {
	var left = (input.relLeft || input.data[100] || input.data[0]);
	var top = (input.relLeft || input.data[101] || input.data[1]);
	var input2 = {
		//backColor:input.backColor,
		//border:input.border,
		//borderColor:input.borderColor,
		//borderDash:input.borderDash,
		//borderWidth:input.borderWidth,
		rect:[left,top,input.data[102] || input.data[2],input.data[103] || input.data[3]],
		cursorRect:[input.cursorData[100] || input.cursorData[0],input.cursorData[101] || input.cursorData[1],input.cursorData[102] || input.cursorData[2],input.cursorData[103] || input.cursorData[3]],
		zIndex:input.data[107],
		richText:clone(input.richText),
		//selectable:input.selectable,
		textAlign:input.textAlign || 'left',
		//textColor:input.textColor,
		vertAlign:input.vertAlign || 'top',
		varSize:clone(input.varSize),
		condensed:true
	};
	//console.log(input,input2);
	return input2;
}

/***************************/
/*					  	   */
/*    PATH CANVAS MODE     */
/*				  	  	   */
/***************************/
/*
function pathCanvasTransfer(path,canvas) {
	canvas.ctx.drawImage(path.ctx.canvas,path.border[0],path.border[1]);
	for (var o = 0; o < path.obj.length; o++) {
		var obj = path.obj[o];
		if (!un(obj.mathsInput)) {
			canvas.ctx.drawImage(obj.mathsInput.canvas,obj.mathsInput.data[100]-draw[taskId].drawRelPos[0],obj.mathsInput.data[101]-draw[taskId].drawRelPos[1]);
		}
		if (!un(obj.leftInput)) {
			canvas.ctx.drawImage(obj.leftInput.canvas,obj.leftInput.data[100]-draw[taskId].drawRelPos[0],obj.leftInput.data[101]-draw[taskId].drawRelPos[1]);			
		}
		if (!un(obj.rightInput)) {
			canvas.ctx.drawImage(obj.rightInput.canvas,obj.rightInput.data[100]-draw[taskId].drawRelPos[0],obj.rightInput.data[101]-draw[taskId].drawRelPos[1]);			
		}
		if (!un(obj.mInputs)) {
			for (var r = 0; r < obj.mInputs.length; r++) {
				if (obj.type == 'multChoice') {
					
					canvas.ctx.drawImage(obj.mInputs[r].canvas,obj.mInputs[r].data[100]-draw[taskId].drawRelPos[0],obj.mInputs[r].data[101]-draw[taskId].drawRelPos[1]);
				} else {
					for (var c = 0; c < obj.mInputs[r].length; c++) {
						canvas.ctx.drawImage(obj.mInputs[r][c].canvas,obj.mInputs[r][c].data[100]-draw[taskId].drawRelPos[0],obj.mInputs[r][c].data[101]-draw[taskId].drawRelPos[1]);

					}
				}
			}
		}
		
	}}
function pathCanvasReset() { // reconfigure path canvases when selected paths changes
	if (!pathCanvasMode) return;
	for (var i = 0; i < draw[taskId].drawCanvas.length; i++) {
		draw[taskId].drawCanvas[i].ctx.clearRect(0,0,draw[taskId].drawArea[2],draw[taskId].drawArea[3]);
		draw[taskId].drawCanvas[i].inUse = false;
		draw[taskId].drawCanvas[i].sel = false;
	}
	function addDrawCanvasIfNec(cIndex) {
		if (draw[taskId].drawCanvas.length < cIndex+3) {
			addDrawCanvas();
			draw[taskId].drawCanvas.last().inUse = false;
		}
		draw[taskId].drawCanvas[cIndex].inUse = true;
	}
	var sel = getSelectedPaths();
	if (draw[taskId].drawing == true) {
		draw[taskId].drawCanvas[0].inUse = true;
		draw[taskId].pathCanvas = [];
		if (draw[taskId].path.length == 1) {
			pathCanvasTransfer(draw[taskId].path[0],draw[taskId].drawCanvas[0]);
			hideObj(draw[taskId].path[0].ctx.canvas);
			hideMathsInputsInPath(draw[taskId].path[0]);
			draw[taskId].pathCanvas[0] = 0;
			draw[taskId].drawCanvas[0].sel = draw[taskId].path[0].selected;
		} else {
			for (var p = 0; p < draw[taskId].path.length; p++) {
				if (p < draw[taskId].path.length - 1) {
					pathCanvasTransfer(draw[taskId].path[p],draw[taskId].drawCanvas[0]);
					hideObj(draw[taskId].path[p].ctx.canvas);
					hideMathsInputsInPath(draw[taskId].path[p]);
					draw[taskId].pathCanvas[p] = 0;
				}
			}
		}
	} else if (sel.length == 0) {
		addDrawCanvasIfNec(0);
		draw[taskId].pathCanvas = [];
		for (var p = 0; p < draw[taskId].path.length; p++) {
			pathCanvasTransfer(draw[taskId].path[p],draw[taskId].drawCanvas[0]);
			hideObj(draw[taskId].path[p].ctx.canvas);
			hideMathsInputsInPath(draw[taskId].path[p]);
			draw[taskId].pathCanvas[p] = 0;				
		}
		draw[taskId].drawCanvas[0].inUse = true;
	} else {
		var can = [];
		var cIndex = 0;
		for (var p = 0; p < draw[taskId].path.length; p++) {
			if (sel.indexOf(p) == -1) {
				pathCanvasTransfer(draw[taskId].path[p],draw[taskId].drawCanvas[cIndex]);
				hideObj(draw[taskId].path[p].ctx.canvas);
				hideMathsInputsInPath(draw[taskId].path[p]);
				can[p] = cIndex;
			} else {
				if (p > 0) {
					cIndex++;
					addDrawCanvasIfNec(cIndex);
				}
				showObj(draw[taskId].path[p].ctx.canvas);
				if (pathCanvasMode) {
					showMathsInputsInPath(draw[taskId].path[p],draw[taskId].zIndex+2*cIndex+1);
					draw[taskId].path[p].ctx.canvas.style.zIndex = draw[taskId].zIndex+2*cIndex;
				} else {
					showMathsInputsInPath(draw[taskId].path[p]);
				}
				cIndex++;
				addDrawCanvasIfNec(cIndex);
			}
		}
		draw[taskId].pathCanvas = can;
	}
	
	drawSelectCanvas();
	drawSelectCanvas2();	
}
function pathCanvasDraw(path,updateZ) { // redraw individual path canvas
	if (!pathCanvasMode) return;
	if (un(path.ctx)) path.ctx = newctx();
	var ctx = path.ctx;
	updateBorder(path);
	repositionPathCanvas(path);		
	resizePathCanvas(path);	
	if (boolean(updateZ,false)) pathCanvasUpdateZIndex(path);
	
	ctx.clear();
	ctx.save();
	ctx.translate(-path.border[0],-path.border[1]);
	for (var o = 0; o < path.obj.length; o++) {
		drawObjToCtx(ctx,path,path.obj[o],1,Number(ctx.canvas.style.zIndex));
	}
	ctx.restore();
}
function repositionPathCanvas(path) {
	var data = path.ctx.data;
	var rect = clone(path.border);
	rect[0] += draw[taskId].drawRelPos[0];
	rect[1] += draw[taskId].drawRelPos[1];
	
	if (data[100] == rect[0] && data[101] == rect[1]) return;
	
	var left = data[100] = rect[0];
	var top = data[101] = rect[1];
	var l = 0.5 * (window.innerWidth - Number(String(canvas.style.width).slice(0, -2))) + canvasDisplayWidth * (left / mainCanvasWidth) + mainCanvasLeft;
	var t = canvasDisplayHeight * (top / mainCanvasHeight) + mainCanvasTop;
	path.ctx.canvas.style.left = l + "px";
	path.ctx.canvas.style.top = t + "px";
	
}
function resizePathCanvas(path) {
	var data = path.ctx.data;
	var rect = path.border;
	
	if (data[102] == rect[2] && data[103] == rect[3]) return;

	var width = data[102] = rect[2];
	var height = data[103] = rect[3];
	var w = canvasDisplayWidth * (width / mainCanvasWidth);
	var h = canvasDisplayHeight * (height / mainCanvasHeight);
	path.ctx.canvas.style.width = w + "px";
	path.ctx.canvas.style.height = h + "px";	
	path.ctx.canvas.width = width;
	path.ctx.canvas.height = height;
}
function pathCanvasUpdateZIndex(path) {
	// work out correct zIndex - set path.ctx.canvas and mathsInputs
	var pIndex = draw[taskId].path.indexOf(path);
	var z = draw[taskId].zIndex;
	for (p = 0; p < pIndex; p++) {
		if (draw[taskId].path[p].selected) {
			z += 2;
		}
	}
	/*console.log(path,z);
	for (var i = 0; i < draw[taskId].drawCanvas.length; i++) {
		console.log(draw[taskId].drawCanvas[i].style.zIndex);
	}*//*
	showMathsInputsInPath(path,z+1);
	path.ctx.canvas.style.zIndex = z;
}
*/

/***************************/
/*					  	   */
/*     	PATH DRAWING	   */
/*				  	  	   */
/***************************/

function drawCanvasPaths() {
	//console.log('drawCanvasPaths',arguments.callee.caller.name);
	if (pathCanvasMode) return;
	updateSnapPoints();
	for (var i = 0; i < draw[taskId].drawCanvas.length; i++) {
		draw[taskId].drawCanvas[i].ctx.clearRect(0,0,draw[taskId].drawArea[2],draw[taskId].drawArea[3]);
		draw[taskId].drawCanvas[i].inUse = false;
		draw[taskId].drawCanvas[i].sel = false;
	}
	if (draw[taskId].flattenMode == true) {
		function addDrawCanvasIfNec(cIndex) {
			if (draw[taskId].drawCanvas.length < cIndex+3) {
				addDrawCanvas();
				draw[taskId].drawCanvas[draw[taskId].drawCanvas.length - 1].inUse = false;
			}				
			draw[taskId].drawCanvas[cIndex].inUse = true;
		}		
		var sel = getSelectedPaths();
		if (draw[taskId].drawing == true) {
			draw[taskId].drawCanvas[0].inUse = true;
			draw[taskId].pathCanvas = [];
			if (draw[taskId].path.length == 1) {
				drawPathsToCanvas(draw[taskId].drawCanvas[0],[draw[taskId].path[0]],draw[taskId].triggerNum,1,mainCanvasFillStyle);
				hideMathsInputsInPath(draw[taskId].path[0]);
				draw[taskId].pathCanvas[0] = 0;
				draw[taskId].drawCanvas[0].sel = draw[taskId].path[0].selected;
			} else {
				for (var p = 0; p < draw[taskId].path.length; p++) {
					if (p < draw[taskId].path.length - 1) {
						drawPathsToCanvas(draw[taskId].drawCanvas[0],[draw[taskId].path[p]],draw[taskId].triggerNum,1,mainCanvasFillStyle);
						hideMathsInputsInPath(draw[taskId].path[p]);
						draw[taskId].pathCanvas[p] = 0;
					} else {
						// path being drawn:
						addDrawCanvasIfNec(1);
						drawPathsToCanvas(draw[taskId].drawCanvas[1],[draw[taskId].path[p]],draw[taskId].triggerNum,1,mainCanvasFillStyle);
						hideMathsInputsInPath(draw[taskId].path[p]);
						draw[taskId].pathCanvas[p] = 1;
						draw[taskId].drawCanvas[0].sel = true;
					}
				}
			}
		} else if (sel.length == 0) {
			addDrawCanvasIfNec(0);
			for (var p = 0; p < draw[taskId].path.length; p++) {
				drawPathsToCanvas(draw[taskId].drawCanvas[0],[draw[taskId].path[p]],draw[taskId].triggerNum,1,mainCanvasFillStyle);
			}
			draw[taskId].drawCanvas[0].inUse = true;
			draw[taskId].pathCanvas = [];
			for (var p = 0; p < draw[taskId].path.length; p++) {
				hideMathsInputsInPath(draw[taskId].path[p]);
				draw[taskId].pathCanvas[p] = 0;
			}
		} else {
			var can = [];
			var cIndex = 0;
			for (var p = 0; p < draw[taskId].path.length; p++) {
				if (sel.indexOf(p) == -1) {
					drawPathsToCanvas(draw[taskId].drawCanvas[cIndex],[draw[taskId].path[p]],draw[taskId].triggerNum,1,mainCanvasFillStyle);
					hideMathsInputsInPath(draw[taskId].path[p]);
					can[p] = cIndex;
				} else {
					if (p > 0) {
						cIndex++;
						addDrawCanvasIfNec(cIndex);
					}
					draw[taskId].drawCanvas[cIndex].sel = true;					
					can[p] = cIndex;
					drawCanvasPath(p,cIndex,false);
					showMathsInputsInPath(draw[taskId].path[p]);
					cIndex++;
					addDrawCanvasIfNec(cIndex);
				}
			}
			draw[taskId].pathCanvas = can;
		}
	} else {
		for (var i = 0; i < draw[taskId].path.length; i++) {
			drawCanvasPath(i);
		}
	}
	drawSelectCanvas();
	drawSelectCanvas2();
}
function drawCanvasPath(pathIndex,canvasIndex,flatten) {
	if (pathCanvasMode) return;
	if (typeof canvasIndex == 'undefined') {
		if (draw[taskId].flattenMode == true) {
			canvasIndex = def([draw[taskId].pathCanvas[pathIndex],draw[taskId].pathCanvas[draw[taskId].pathCanvas.length-1]]);
		} else {
			canvasIndex = pathIndex;
		}
	}
	while (draw[taskId].drawCanvas.length <= canvasIndex+2) {
		addDrawCanvas();
	}
	var canvas = draw[taskId].drawCanvas[canvasIndex];
	var ctx = canvas.ctx;
	var zIndex = canvas.data[107];
	
	if (boolean(flatten,false) == false) ctx.clearRect(0,0,draw[taskId].drawArea[2],draw[taskId].drawArea[3]);
	
	ctx.save();
	ctx.translate(-draw[taskId].drawArea[0],-draw[taskId].drawArea[1]); // adjust for drawArea 
	
	ctx.beginPath();

	var vis = true;
	var opacity = 1;
	if (typeof draw[taskId].path[pathIndex].trigger == 'object') {
		if (typeof draw[taskId].path[pathIndex].qTriggerNum !== 'undefined') {
			for (var l = 0; l <= draw[taskId].path[pathIndex].qTriggerNum; l++) {
				if (typeof draw[taskId].path[pathIndex].trigger[l] == 'boolean' && draw[taskId].path[pathIndex].trigger[l] == true) {
					vis = true;
				} else if (typeof draw[taskId].path[pathIndex].trigger[l] == 'boolean' && draw[taskId].path[pathIndex].trigger[l] == false) {
					vis = false;
				}
			}
			if (vis == true) {
				var opacity = 1;
			} else {
				var opacity = 0;
			}
		} else {
			for (var l = 0; l <= draw[taskId].triggerNum; l++) {
				if (typeof draw[taskId].path[pathIndex].trigger[l] == 'boolean' && draw[taskId].path[pathIndex].trigger[l] == true) {
					vis = true;
				} else if (typeof draw[taskId].path[pathIndex].trigger[l] == 'boolean' && draw[taskId].path[pathIndex].trigger[l] == false) {
					vis = false;
				}
			}
			if (vis == true) {
				var opacity = 1;
			} else {
				var opacity = 0.15;
			}			
		}
	}
	canvas.style.opacity = opacity;
	if (boolean(flatten,false) == true) {
		drawPathsToCanvas(canvas,draw[taskId].path[pathIndex],draw[taskId].triggerNum,1,mainCanvasFillStyle)
	} else {
		for (var o = 0; o < draw[taskId].path[pathIndex].obj.length; o++) {
			drawObjToCtx(ctx,draw[taskId].path[pathIndex],draw[taskId].path[pathIndex].obj[o],opacity,zIndex);
		}
	}
	ctx.restore();
}
function drawPathsToCanvas(canvasLocal,paths,triggerNum,sf,backColor,useRelPos) {
	if (typeof sf == 'undefined') sf = 1;
	if (typeof backColor == 'undefined') backColor = '#FFF';
	if (typeof useRelPos == 'undefined') useRelPos = true;
	if (typeof canvasLocal == 'undefined') {
		var canvas = document.createElement('canvas');
		canvas.width = draw[taskId].drawCanvas[0].width*sf;
		canvas.height = draw[taskId].drawCanvas[0].height*sf;
		canvas.data = draw[taskId].drawCanvas[0].data;
		canvas.data[2] = draw[taskId].drawCanvas[0].data[2]*sf;
		canvas.data[3] = draw[taskId].drawCanvas[0].data[3]*sf;
		canvas.data[102] = draw[taskId].drawCanvas[0].data[102]*sf;
		canvas.data[103] = draw[taskId].drawCanvas[0].data[103]*sf;
	} else {
		var canvas = canvasLocal;
	}
	var ctx = canvas.getContext('2d');
	
	for (var p = 0; p < paths.length; p++) {
		if (typeof triggerNum !== 'undefined') {
			var vis = true;
			if (typeof paths[p].trigger == 'object') {
				for (var t = 0; t <= triggerNum; t++) {
					if (typeof paths[p].trigger[t] == 'boolean' && paths[p].trigger[t] == true) {
						vis = true;
					} else if (typeof paths[p].trigger[t] == 'boolean' && paths[p].trigger[t] == false) {
						vis = false;
					}
				}
			}
			if (vis == false) continue;
		}
		for (var o = 0; o < paths[p].obj.length; o++) {
			var obj = paths[p].obj[o];
			switch (obj.type) {
				case 'text':
					if (boolean(obj.showBorder,false) == true) drawPathTextBorder(ctx,obj,sf);
					drawMathsInputText(obj.mathsInput,ctx,sf,useRelPos);
					break;
				case 'button':
					drawPathButton(ctx,obj,false,sf);
					drawMathsInputText(obj.mathsInput,ctx,sf,useRelPos);
					break;
				case 'input':
					drawPathInput(ctx,obj,false,sf);
					drawMathsInputText(obj.mathsInput,ctx,sf,useRelPos);
					drawMathsInputText(obj.leftInput,ctx,sf,useRelPos);
					drawMathsInputText(obj.rightInput,ctx,sf,useRelPos);
					break;
				case 'multChoice':
					drawPathMultChoice(ctx,obj,true,sf,false);
					for (var m = 0; m < obj.mInputs.length; m++) {
						drawMathsInputText(obj.mInputs[m],ctx,sf,useRelPos);
					}
					break;
				case 'grid' :
					drawPathGrid(ctx,obj,sf,backColor,false);
					break;
				case 'table' :
				case 'table2' :
					for (var r = 0; r < obj.cells.length; r++) {
						for (var c = 0; c < obj.cells[r].length; c++) {
							if (typeof obj.cells[r][c].input == 'boolean' && obj.cells[r][c].input == true) {
								obj.cells[r][c].color = '#FFF';
							}
						}
					}
					var obj2 = clone(obj);
					obj2.ctx = ctx;
					obj2.sf = sf;
					if (obj.type == 'table') {
						var table = drawTable2(obj2);
					} else {
						var table = drawTable3(obj2);
					}
					for (var r = 0; r < obj.mInputs.length; r++) {
						for (var c = 0; c < obj.mInputs[r].length; c++) {
							if (typeof obj.mInputs[r][c].canvas !== 'undefined') {
								drawMathsInputText(obj.mInputs[r][c],ctx,sf,useRelPos);
							}
						}
					}
					/*if (draw[taskId].triggerEnabled == true) {
						for (var r = 0; r < obj.cells.length; r++) {
							for (var c = 0; c < obj.cells[r].length; c++) {
								var vis2 = true;
								for (var t = 0; t <= draw[taskId].triggerNum; t++) {
									if (typeof obj.cells[r][c].trigger[t] == 'boolean' && obj.cells[r][c].trigger[t] == true) {
										vis2 = true;
									} else if (typeof obj.cells[r][c].trigger[t] == 'boolean' && obj.cells[r][c].trigger[t] == false) {
										vis2 = false;
									}
								}
								if (vis2 == true) {

								} else {

								}
							}
						}
					}*/
					break;					
				default:
					drawObjToCtx(ctx,paths[p],obj,1,1,0,0,sf);
					break;
			}
		}
	}
	
	return canvas;
}
function drawSelectCanvas() { // movable draw canvas
	var canvas = draw[taskId].drawCanvas[draw[taskId].drawCanvas.length-1];
	var ctx = canvas.ctx;
	ctx.clearRect(draw[taskId].drawArea[0],draw[taskId].drawArea[1],draw[taskId].drawArea[2],draw[taskId].drawArea[3]);
	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected == true && draw[taskId].path[i].qBoxState !== 'static' && typeof draw[taskId].path[i].qBox2Part == 'undefined') { // is the group selected?
			drawBorderButtons(draw[taskId].path[i]);
			ctx.strokeStyle = draw[taskId].selectColor;
			ctx.lineWidth = 1;
			ctx.strokeRect(draw[taskId].path[i].border[0],draw[taskId].path[i].border[1],draw[taskId].path[i].border[2],draw[taskId].path[i].border[3]);
			//draw center lines
			/*ctx.beginPath();
			ctx.moveTo(draw[taskId].path[i].border[0]+0.5*draw[taskId].path[i].border[2],draw[taskId].path[i].border[1]);
			ctx.lineTo(draw[taskId].path[i].border[0]+0.5*draw[taskId].path[i].border[2],draw[taskId].path[i].border[1]+draw[taskId].path[i].border[3]);
			ctx.moveTo(draw[taskId].path[i].border[0],draw[taskId].path[i].border[1]+0.5*draw[taskId].path[i].border[3]);
			ctx.lineTo(draw[taskId].path[i].border[0]+draw[taskId].path[i].border[2],draw[taskId].path[i].border[1]+0.5*draw[taskId].path[i].border[3]);
			ctx.stroke();*/
		}			
	}
	//console.log('-----');
}
function drawSelectCanvas2(){ // static draw canvas
	var canvas = draw[taskId].drawCanvas[draw[taskId].drawCanvas.length-2];
	var ctx = canvas.ctx;
	ctx.clearRect(draw[taskId].drawArea[0],draw[taskId].drawArea[1],draw[taskId].drawArea[2],draw[taskId].drawArea[3]);
	//ctx.fillStyle = colorA('#F00',0.2);
	//ctx.fillRect(draw[taskId].drawArea[0],draw[taskId].drawArea[1],draw[taskId].drawArea[2],draw[taskId].drawArea[3]);
	for (var i = 0; i < draw[taskId].qBox.length; i++) {	
		if (draw[taskId].qBoxBorder.type !== 'none' && (draw[taskId].qBox[i] == 'edit' || draw[taskId].qBox[i] == 'static')) {
			roundedRect(ctx,draw[taskId].qSize[i][0],draw[taskId].qSize[i][1],draw[taskId].qSize[i][2],draw[taskId].qSize[i][3],draw[taskId].qBoxBorder.borderRounding,draw[taskId].qBoxBorder.borderWidth,draw[taskId].qBoxBorder.borderColor,draw[taskId].qBoxBorder.fillColor,draw[taskId].qBoxBorder.borderDash);
		}
	}
	for (var b = 0; b < draw[taskId].qBox2.box.length; b++) {
		var box = draw[taskId].qBox2.box[b];
		roundedRect(ctx,box[0],box[1],box[2],box[3],draw[taskId].qBox2Border.borderRounding,draw[taskId].qBox2Border.borderWidth,draw[taskId].qBox2Border.borderColor,draw[taskId].qBox2Border.fillColor,draw[taskId].qBox2Border.borderDash);
		if (draw[taskId].qBox2.mode == 'edit') {
			var l = box[0]+box[2];
			var t = box[1];
			var w = 20;
			var h = 20;
			ctx.save();

			var t = box[1]+box[3]-20;
			ctx.strokeStyle = mainCanvasFillStyle;				
			ctx.fillStyle = colorA('#F60',0.5);
			ctx.fillRect(l,t,w,h);
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(l+0.3*w,t+0.5*h);
			ctx.lineTo(l+0.7*w,t+0.5*h);
			ctx.stroke();

			var t = box[1]+box[3]-40;
			ctx.strokeStyle = mainCanvasFillStyle;				
			ctx.fillStyle = colorA('#F60',0.5);
			ctx.fillRect(l,t,w,h);
			ctx.beginPath();
			ctx.moveTo(l+0.3*w,t+0.5*h);
			ctx.lineTo(l+0.7*w,t+0.5*h);
			ctx.moveTo(l+0.5*w,t+0.3*h);
			ctx.lineTo(l+0.5*w,t+0.7*h);
			ctx.stroke();

			draw[taskId].qBox2.partMarks[b] = [];
			for (var part = 0; part < draw[taskId].qBox2.parts[b].length; part++) {
				draw[taskId].qBox2.partMarks[b][part] = 0;
			}
			for (var p = 0; p < draw[taskId].path.length; p++) {
				if (draw[taskId].path[p].obj.length == 1) {
					var obj = draw[taskId].path[p].obj[0];
					var marks = 0;
					if (obj.type == 'multChoice') {
						marks = 1;
					} else if (obj.type == 'input') {
						marks = 1;
						if (!un(obj.ans)) {
							marks = 1;
							for (var a = 0; a < obj.ans.length; a++) {
								marks = Math.max(marks,obj.ans[a].marks);
							}
						}
					}
					if (marks > 0) {
						for (var part = 0; part < draw[taskId].qBox2.parts[b].length; part++) {
							var max = 591;
							if (p < draw[taskId].qBox2.parts[0].length - 1) max = draw[taskId].qBox2.parts[0][p+1];
							if (hitTestPathRect(draw[taskId].path[p],23-10,23+Number(draw[taskId].qBox2.parts[0][part])-10,570+20,max-(23+Number(draw[taskId].qBox2.parts[0][part]))+20) == true) {						
								draw[taskId].qBox2.partMarks[b][part] = marks;
							}
						}
					}
				}
			}
			
			for (var i = 0; i < draw[taskId].qBox2.parts[b].length; i++) {
				ctx.lineWidth = 8;
				ctx.strokeStyle = '#060';
				ctx.lineJoin = 'round';
				ctx.lineCap = 'round';
				ctx.beginPath();
				var left = 23+570+draw[taskId].qBox2.markPos[b][i][0];
				var max = 591;
				if (i < draw[taskId].qBox2.parts[b].length - 1) max = draw[taskId].qBox2.parts[b][i+1];
				var top = 23+max+draw[taskId].qBox2.markPos[b][i][1];
				ctx.moveTo(left+4,top+0.5*50);
				ctx.lineTo(left+40/3,top+50-4);
				ctx.lineTo(left+40-4,top+4);
				ctx.stroke();
				ctx.lineWidth = 2;
				ctx.strokeRect(left,top,40,50);
				var max = 591;
				if (i < draw[taskId].qBox2.parts[b].length - 1) max = draw[taskId].qBox2.parts[b][i+1];
				if (draw[taskId].qBox2.partMarks[b][i] == 1) {
					var txt = "(1 mark)";
				} else {
					var txt = "("+String(draw[taskId].qBox2.partMarks[b][i])+" marks)";
				}
				text({ctx:ctx,left:23+7.5,width:570-15,top:23+max-25,align:'right',textArray:['<<fontSize:20>>'+txt]});
				if (i > 0) {
					ctx.strokeStyle = draw[taskId].qBox2Border.borderColor;
					ctx.lineWidth = 2;
					ctx.setLineDash([8,8]);
					ctx.beginPath();
					ctx.moveTo(23,23+draw[taskId].qBox2.parts[b][i]);
					ctx.lineTo(23+570,23+draw[taskId].qBox2.parts[b][i]);
					ctx.stroke();
					ctx.setLineDash([]);
				}
			}
			ctx.restore();
		}
	}	
	if (draw[taskId].drawMode == 'selectRect') {
		ctx.save();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		if (!ctx.setLineDash) {ctx.setLineDash = function () {}}
		ctx.setLineDash([5,5]);
		ctx.strokeRect(draw[taskId].selectRect[0],draw[taskId].selectRect[1],draw[taskId].selectRect[2],draw[taskId].selectRect[3]);	
		ctx.setLineDash([]);
		ctx.restore();
	}
	if (draw[taskId].showSnapPoints == true) {
		ctx.fillStyle = '#F00';
		for (var i = 0; i < draw[taskId].snapPoints.length; i++) {
			ctx.beginPath();
			//console.log(draw[taskId].snapPoints[i][0],draw[taskId].snapPoints[i][1]);
			ctx.arc(draw[taskId].snapPoints[i][0],draw[taskId].snapPoints[i][1],5,0,2*Math.PI);
			ctx.fill();
		}
	}
	calcCursorPositions();	
}
function drawBorderButtons(path) {
	var buttons = path.borderButtons;
	var canvas = draw[taskId].drawCanvas[draw[taskId].drawCanvas.length-1];
	var ctx = canvas.ctx;
	for (var i = 0; i < buttons.length; i++) {
		var l = buttons[i].dims[0];
		var t = buttons[i].dims[1];
		var w = buttons[i].dims[2];
		var h = buttons[i].dims[3];	
		if (['grid-resize','gridDrag','gridRescaleX','gridRescaleY'].indexOf(draw[taskId].drawMode) > -1) {
			if (buttons[i].buttonType == 'grid-resize') {
				ctx.strokeStyle = colorA('#F0F',0.5);
				ctx.strokeRect(l,t,w,h);
				drawArrow({ctx:ctx,startX:l+0.1*w,startY:t+0.5*h,finX:l+0.9*w,finY:t+0.5*h,arrowLength:4,color:'#F0F',lineWidth:2,fillArrow:true,doubleEnded:true,angleBetweenLinesRads:0.7});
				drawArrow({ctx:ctx,finX:l+0.5*w,finY:t+0.1*h,startX:l+0.5*w,startY:t+0.9*h,arrowLength:4,color:'#F0F',lineWidth:2,fillArrow:true,doubleEnded:true,angleBetweenLinesRads:0.7});
			} else if (['grid-yMajorPlus','grid-yMinorPlus','grid-xMajorPlus','grid-xMinorPlus'].indexOf(buttons[i].buttonType) > -1) {
				ctx.strokeStyle = mainCanvasFillStyle;
				ctx.fillStyle = colorA('#393',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.beginPath();
				ctx.moveTo(l+0.3*w,t+0.5*h);
				ctx.lineTo(l+0.7*w,t+0.5*h);
				ctx.moveTo(l+0.5*w,t+0.3*h);
				ctx.lineTo(l+0.5*w,t+0.7*h);
				ctx.stroke();
			} else if (['grid-yMajorMinus','grid-yMinorMinus','grid-xMajorMinus','grid-xMinorMinus'].indexOf(buttons[i].buttonType) > -1) {
				ctx.strokeStyle = mainCanvasFillStyle;
				ctx.fillStyle = colorA('#F00',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.beginPath();
				ctx.moveTo(l+0.3*w,t+0.5*h);
				ctx.lineTo(l+0.7*w,t+0.5*h);
				ctx.stroke();				
			}
		} else if (['grid-plot'].indexOf(draw[taskId].drawMode) > -1) {
			if (buttons[i].buttonType == 'grid-plot') {	
				ctx.strokeStyle = colorA('#F0F',0.5);
				ctx.strokeRect(l,t,w,h);
				ctx.strokeStyle = getShades(mainCanvasFillStyle,true)[12];
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(l+0.3*w,t+0.3*h);
				ctx.lineTo(l+0.7*w,t+0.7*h);
				ctx.moveTo(l+0.3*w,t+0.7*h);
				ctx.lineTo(l+0.7*w,t+0.3*h);
				ctx.stroke();
			}
		} else if (['grid-lineSegment'].indexOf(draw[taskId].drawMode) > -1) {
			if (buttons[i].buttonType == 'grid-lineSegment') {	
				ctx.strokeStyle = colorA('#F0F',0.5);
				ctx.strokeRect(l,t,w,h);
				ctx.strokeStyle = getShades(mainCanvasFillStyle,true)[12];
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(l+0.3*w,t+0.4*h);
				ctx.lineTo(l+0.7*w,t+0.6*h);
				ctx.stroke();
			}
		} else if (['grid-line'].indexOf(draw[taskId].drawMode) > -1) {
			if (buttons[i].buttonType == 'grid-line') {	
				ctx.strokeStyle = colorA('#F0F',0.5);
				ctx.strokeRect(l,t,w,h);
				ctx.strokeStyle = getShades(mainCanvasFillStyle,true)[12];
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(l,t+0.3*h);
				ctx.lineTo(l+w,t+0.7*h);
				ctx.stroke();
			}						
		} else {
			switch (buttons[i].buttonType) {
				case 'resize':
					ctx.fillStyle = colorA(draw[taskId].selectColor,0.5);
					ctx.fillRect(l,t,w,h);
					drawArrow({ctx:ctx,startX:l+0.2*w,startY:t+0.2*h,finX:l+0.8*w,finY:t+0.8*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});
					drawArrow({ctx:ctx,finX:l+0.2*w,finY:t+0.2*h,startX:l+0.8*w,startY:t+0.8*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});
					break;
				case 'text-horizResize':
					ctx.fillStyle = colorA(draw[taskId].selectColor,0.5);
					ctx.fillRect(l,t,w,h);
					drawArrow({ctx:ctx,startX:l+0.2*w,startY:t+0.5*h,finX:l+0.8*w,finY:t+0.5*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});
					drawArrow({ctx:ctx,finX:l+0.2*w,finY:t+0.5*h,startX:l+0.8*w,startY:t+0.5*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});					
					break;
				case 'text-horizResizeCollapse' :
					ctx.fillStyle = colorA('#F0F',0.5);
					ctx.fillRect(l,t,w,h);
					drawArrow({ctx:ctx,finX:l+0.2*w,finY:t+0.5*h,startX:l+0.8*w,startY:t+0.5*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});					
					break;
				case 'delete':
					ctx.fillStyle = colorA('#F00',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 2;
					ctx.strokeStyle = mainCanvasFillStyle;
					ctx.beginPath();
					ctx.moveTo(l+0.2*w,t+0.2*h);
					ctx.lineTo(l+0.8*w,t+0.8*h);
					ctx.moveTo(l+0.2*w,t+0.8*h);
					ctx.lineTo(l+0.8*w,t+0.2*h);
					ctx.stroke();			
					break;
				case 'trigger':
				case 'triggerTableCell':
					if (draw[taskId].triggerEnabled == true) {
						if (buttons[i].buttonType == 'trigger') {
							var trigger = path.trigger;
						} else if (buttons[i].buttonType == 'triggerTableCell') {
							var trigger = path.obj[0].cells[buttons[i].r][buttons[i].c].trigger;					
						}
						var vis = true;
						if (typeof trigger == 'object') {
							for (var m = 0; m <= draw[taskId].triggerNum; m++) {
								if (typeof trigger[m] == 'boolean' && trigger[m] == true) {
									vis = true;
								} else if (typeof trigger[m] == 'boolean' && trigger[m] == false) {
									vis = false;
								}
							}
						}
						if (vis == true) {
							ctx.fillStyle = colorA('#96C',0.5);
							ctx.fillRect(l,t,w,h);
							ctx.lineWidth = 1;
							ctx.beginPath();
							ctx.fillStyle = mainCanvasFillStyle;
							drawStar({ctx:ctx,center:[l+0.5*w,t+0.5*h],radius:0.4*Math.min(w,h),points:5});
							ctx.fill();
						} else {
							ctx.strokeStyle = colorA('#96C',0.5);
							ctx.strokeRect(l,t,w,h);
							ctx.lineWidth = 1;
							ctx.beginPath();
							ctx.fillStyle = colorA('#96C',0.5);
							drawStar({ctx:ctx,center:[l+0.5*w,t+0.5*h],radius:0.4*Math.min(w,h),points:5});
							ctx.fill();
						}
					}
					break;			
				case 'orderMinus':
					ctx.strokeStyle = mainCanvasFillStyle;				
					ctx.fillStyle = colorA('#F60',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(l+0.3*w,t+0.5*h);
					ctx.lineTo(l+0.7*w,t+0.5*h);
					ctx.stroke();
					break;
				case 'orderPlus':
					ctx.strokeStyle = mainCanvasFillStyle;				
					ctx.fillStyle = colorA('#F60',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.beginPath();
					ctx.moveTo(l+0.3*w,t+0.5*h);
					ctx.lineTo(l+0.7*w,t+0.5*h);
					ctx.moveTo(l+0.5*w,t+0.3*h);
					ctx.lineTo(l+0.5*w,t+0.7*h);
					ctx.stroke();
					break;					
				case 'anglesAroundPoint-pointsMinus':
					ctx.strokeStyle = mainCanvasFillStyle;				
					ctx.fillStyle = colorA('#06F',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(l+0.3*w,t+0.5*h);
					ctx.lineTo(l+0.7*w,t+0.5*h);
					ctx.stroke();
					break;
				case 'anglesAroundPoint-pointsPlus':
					ctx.strokeStyle = mainCanvasFillStyle;				
					ctx.fillStyle = colorA('#06F',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.beginPath();
					ctx.moveTo(l+0.3*w,t+0.5*h);
					ctx.lineTo(l+0.7*w,t+0.5*h);
					ctx.moveTo(l+0.5*w,t+0.3*h);
					ctx.lineTo(l+0.5*w,t+0.7*h);
					ctx.stroke();
					break;	
				case 'anglesAroundPoint-fixRadius':
					ctx.strokeStyle = mainCanvasFillStyle;				
					ctx.fillStyle = colorA('#F06',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.beginPath();
					ctx.arc(l+0.5*w,t+0.5*h,0.35*w,0,2*Math.PI);
					ctx.stroke();
					break;						
				case 'qPos-bottomRight':
				case 'qPos-center':
					if (buttons[i].buttonType.indexOf(path.qPos) > -1) {
						ctx.fillStyle = colorA('#090',0.5);
						ctx.fillRect(l,t,w,h);
					} else {
						ctx.fillStyle = colorA('#0F0',0.5);
						ctx.fillRect(l,t,w,h);
					}
					ctx.strokeStyle = colorA('#000',0.5);
					ctx.strokeRect(l,t,w,h);				
					ctx.fillStyle = colorA('#000',0.5);
					if (buttons[i].buttonType == 'qPos-bottomRight') {
						ctx.fillRect(l+0.5*w,t+0.6*h,0.5*w,0.4*h);
					} else if (buttons[i].buttonType == 'qPos-center') {
						ctx.fillRect(l+0.25*w,t+0.3*h,0.5*w,0.4*h);
					}
					break;
				case 'qPos-fillWidth':
					if (path.qFillWidth == true) {
						ctx.fillStyle = colorA('#090',0.5);
						ctx.fillRect(l,t,w,h);
					} else {
						ctx.fillStyle = colorA('#0F0',0.5);
						ctx.fillRect(l,t,w,h);
					}
					ctx.strokeStyle = colorA('#000',0.5);
					ctx.strokeRect(l,t,w,h);				
					drawArrow({ctx:ctx,startX:l+0.2*w,startY:t+0.5*h,finX:l+0.8*w,finY:t+0.5*h,arrowLength:4,color:colorA('#000',0.5),lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});
					drawArrow({ctx:ctx,finX:l+0.2*w,finY:t+0.5*h,startX:l+0.8*w,startY:t+0.5*h,arrowLength:4,color:colorA('#000',0.5),lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});
					break;
				case 'angle-showLines':
					if (typeof path.obj[0].drawLines == 'undefined' || path.obj[0].drawLines == true) {
						ctx.fillStyle = colorA('#F90',0.5);
						ctx.fillRect(l,t,w,h);
						var showLines = true;
					} else {
						ctx.fillStyle = colorA('#FC3',0.5);
						ctx.fillRect(l,t,w,h);
						var showLines = false;
					}
					drawAngle({ctx:ctx,a:[l+0.5*w,t+0.2*h],b:[l+0.2*w,t+0.8*h],c:[l+0.8*w,t+0.8*h],radius:0.4*w,lineWidth:1,drawLines:showLines});
					break;
				case 'angle-showAngle':
					ctx.fillStyle = colorA('#F90',0.5);
					ctx.fillRect(l,t,w,h);
					text({ctx:ctx,textArray:['<<fontSize:'+(w/2)+'>>37'+degrees],left:l,top:t,width:w,height:h,textAlign:'center',vertAlign:'middle'});					
					break;
				case 'angle-numOfCurves':
					ctx.fillStyle = colorA('#F90',0.5);
					ctx.fillRect(l,t,w,h);

					drawAngle({ctx:ctx,a:[l+0.5*w,t+0.2*h],b:[l+0.2*w,t+0.8*h],c:[l+0.8*w,t+0.8*h],radius:0.4*w,lineWidth:1,drawLines:true,numOfCurves:2,curveGap:3});
					break;					
				case 'polygon-makeRegular':
					ctx.fillStyle = colorA('#F90',0.5);
					ctx.fillRect(l,t,w,h);
					var center = [l+0.5*w,t+0.5*h];
					var radius = 0.4*Math.min(w,h);
					var angle = -0.5*Math.PI;
					var pos = [];
					for (var p = 0; p < 5; p++) {
						pos[p] = [center[0]+radius*Math.cos(angle),center[1]+radius*Math.sin(angle)];
						angle += (2*Math.PI)/5;
					}
					ctx.strokeStyle = '#000';
					ctx.lineWidth = 1;
					/*ctx.beginPath();
					ctx.arc(center[0],center[1],radius,0,2*Math.PI);
					ctx.stroke();*/
					drawPath({ctx:ctx,path:pos,closed:true});
					for (var p = 0; p < 5; p++) {
						drawDash(ctx,pos[p][0],pos[p][1],pos[(p+1)%5][0],pos[(p+1)%5][1],radius/5);
					}
					break;
				case 'polygon-verticesPlus':
					ctx.strokeStyle = mainCanvasFillStyle;				
					ctx.fillStyle = colorA('#06F',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.beginPath();
					ctx.moveTo(l+0.3*w,t+0.5*h);
					ctx.lineTo(l+0.7*w,t+0.5*h);
					ctx.moveTo(l+0.5*w,t+0.3*h);
					ctx.lineTo(l+0.5*w,t+0.7*h);
					ctx.stroke();				
					break;
				case 'polygon-verticesMinus':
					ctx.strokeStyle = mainCanvasFillStyle;				
					ctx.fillStyle = colorA('#06F',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(l+0.3*w,t+0.5*h);
					ctx.lineTo(l+0.7*w,t+0.5*h);
					ctx.stroke();				
					break;
				case 'polygon-setPrism' :
					ctx.fillStyle = colorA('#3F9',0.5);
					ctx.fillRect(l,t,w,h);
					drawPolygon({
						ctx:ctx,
						points:[[l+0.7*w,t+0.8*h],[l+0.2*w,t+0.8*h],[l+0.2*w,t+0.4*h],[l+0.5*w,t+0.4*h]],
						lineColor:'#000',
						lineWidth:1,
						solidType:'prism',
						prismVector:[0.15*w,-0.15*h],
					});
					break;
				case 'polygon-setOuterAngles' :
					ctx.fillStyle = colorA('#F0F',0.5);
					ctx.fillRect(l,t,w,h);
					drawPolygon({
						ctx:ctx,
						points:[[l+0.7*w,t+0.7*h],[l+0.5*w,t+0.3*h],[l+0.3*w,t+0.7*h]],
						lineColor:'#000',
						lineWidth:1,
						anglesMode:'outer',
						outerAngles:[
							{radius:0.2*w,fill:true,fillColor:"#66F",lineWidth:0.5},
							{radius:0.2*w,fill:true,fillColor:"#66F",lineWidth:0.5},
							{radius:0.2*w,fill:true,fillColor:"#66F",lineWidth:0.5}
						]
					});					
					break;
				case 'polygon-setExteriorAngles' :
					ctx.fillStyle = colorA('#F93',0.5);
					ctx.fillRect(l,t,w,h);
					break;
				case 'polygon-setTypeSquare' :
					ctx.strokeStyle = mainCanvasFillStyle;				
					if (path.obj[0].polygonType == 'square') { 
						ctx.fillStyle = colorA('#393',0.5);
					} else {
						ctx.fillStyle = colorA('#939',0.5);
					}
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(l+0.3*w,t+0.3*h);
					ctx.lineTo(l+0.3*w,t+0.7*h);
					ctx.lineTo(l+0.7*w,t+0.7*h);
					ctx.lineTo(l+0.7*w,t+0.3*h);
					ctx.lineTo(l+0.3*w,t+0.3*h);
					ctx.stroke();
					break;
				case 'polygon-setTypeRect' :
					ctx.strokeStyle = mainCanvasFillStyle;				
					if (path.obj[0].polygonType == 'rect') { 
						ctx.fillStyle = colorA('#393',0.5);
					} else {
						ctx.fillStyle = colorA('#939',0.5);
					}
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(l+0.2*w,t+0.35*h);
					ctx.lineTo(l+0.2*w,t+0.65*h);
					ctx.lineTo(l+0.8*w,t+0.65*h);
					ctx.lineTo(l+0.8*w,t+0.35*h);
					ctx.lineTo(l+0.2*w,t+0.35*h);
					ctx.stroke();					
					break;
				case 'polygon-setTypePara' :
					ctx.strokeStyle = mainCanvasFillStyle;				
					if (path.obj[0].polygonType == 'para') { 
						ctx.fillStyle = colorA('#393',0.5);
					} else {
						ctx.fillStyle = colorA('#939',0.5);
					}
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(l+0.2*w,t+0.35*h);
					ctx.lineTo(l+0.35*w,t+0.65*h);
					ctx.lineTo(l+0.8*w,t+0.65*h);
					ctx.lineTo(l+0.65*w,t+0.35*h);
					ctx.lineTo(l+0.2*w,t+0.35*h);
					ctx.stroke();					
					break;
				case 'polygon-setTypeTrap' :
					ctx.strokeStyle = mainCanvasFillStyle;				
					if (path.obj[0].polygonType == 'trap') { 
						ctx.fillStyle = colorA('#393',0.5);
					} else {
						ctx.fillStyle = colorA('#939',0.5);
					}
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(l+0.35*w,t+0.35*h);
					ctx.lineTo(l+0.2*w,t+0.65*h);
					ctx.lineTo(l+0.8*w,t+0.65*h);
					ctx.lineTo(l+0.65*w,t+0.35*h);
					ctx.lineTo(l+0.35*w,t+0.35*h);
					ctx.stroke();					
					break;
				case 'polygon-setTypeRhom' :
					ctx.strokeStyle = mainCanvasFillStyle;				
					if (path.obj[0].polygonType == 'rhom') { 
						ctx.fillStyle = colorA('#393',0.5);
					} else {
						ctx.fillStyle = colorA('#939',0.5);
					}
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(l+0.5*w,t+0.3*h);
					ctx.lineTo(l+0.2*w,t+0.5*h);
					ctx.lineTo(l+0.5*w,t+0.7*h);
					ctx.lineTo(l+0.8*w,t+0.5*h);
					ctx.lineTo(l+0.5*w,t+0.3*h);
					ctx.stroke();					
					break;
				case 'polygon-setTypeKite' :
					ctx.strokeStyle = mainCanvasFillStyle;				
					if (path.obj[0].polygonType == 'kite') { 
						ctx.fillStyle = colorA('#393',0.5);
					} else {
						ctx.fillStyle = colorA('#939',0.5);
					}
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(l+0.5*w,t+0.25*h);
					ctx.lineTo(l+0.3*w,t+0.4*h);
					ctx.lineTo(l+0.5*w,t+0.75*h);
					ctx.lineTo(l+0.7*w,t+0.4*h);
					ctx.lineTo(l+0.5*w,t+0.25*h);
					ctx.stroke();					
					break;					
				case 'text-border':
					ctx.fillStyle = colorA('#F90',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.fillStyle = colorA('#99F',0.5);
					ctx.clearRect(l+0.15*w,t+0.25*h,w*0.7,h*0.5);
					ctx.fillRect(l+0.15*w,t+0.25*h,w*0.7,h*0.5);
					ctx.lineWidth = 3;
					ctx.strokeStyle = colorA('#000',0.5);
					ctx.strokeRect(l+0.15*w,t+0.25*h,w*0.7,h*0.5);					
					break;						
				case 'grid-resize':
					ctx.fillStyle = colorA('#F9F',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.strokeStyle = colorA('#F0F',0.5);
					ctx.strokeRect(l,t,w,h);
					drawArrow({ctx:ctx,startX:l+0.1*w,startY:t+0.5*h,finX:l+0.9*w,finY:t+0.5*h,arrowLength:4,color:colorA('#000',0.5),lineWidth:2,fillArrow:true,doubleEnded:true,angleBetweenLinesRads:0.7});
					drawArrow({ctx:ctx,finX:l+0.5*w,finY:t+0.1*h,startX:l+0.5*w,startY:t+0.9*h,arrowLength:4,color:colorA('#000',0.5),lineWidth:2,fillArrow:true,doubleEnded:true,angleBetweenLinesRads:0.7});
					break;
				case 'grid-plot':
					ctx.fillStyle = colorA('#F9F',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.strokeStyle = colorA('#F0F',0.5);
					ctx.strokeRect(l,t,w,h);
					ctx.strokeStyle = getShades(mainCanvasFillStyle,true)[12];
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(l+0.3*w,t+0.3*h);
					ctx.lineTo(l+0.7*w,t+0.7*h);
					ctx.moveTo(l+0.3*w,t+0.7*h);
					ctx.lineTo(l+0.7*w,t+0.3*h);
					ctx.stroke();
					break;
				case 'grid-lineSegment':
					ctx.fillStyle = colorA('#F9F',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.strokeStyle = colorA('#F0F',0.5);
					ctx.strokeRect(l,t,w,h);
					ctx.strokeStyle = getShades(mainCanvasFillStyle,true)[12];
					ctx.lineWidth = 1;
					ctx.beginPath();
					/*ctx.moveTo(l+0.2*w,t+0.3*h);
					ctx.lineTo(l+0.4*w,t+0.5*h);
					ctx.moveTo(l+0.2*w,t+0.5*h);
					ctx.lineTo(l+0.4*w,t+0.3*h);*/
					
					ctx.moveTo(l+0.3*w,t+0.4*h);
					ctx.lineTo(l+0.7*w,t+0.6*h);
					
					/*ctx.moveTo(l+0.6*w,t+0.5*h);
					ctx.lineTo(l+0.8*w,t+0.7*h);
					ctx.moveTo(l+0.6*w,t+0.7*h);
					ctx.lineTo(l+0.8*w,t+0.5*h);*/					
					ctx.stroke();
					break;	
				case 'grid-line':
					ctx.fillStyle = colorA('#F9F',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.strokeStyle = colorA('#F0F',0.5);
					ctx.strokeRect(l,t,w,h);
					ctx.strokeStyle = getShades(mainCanvasFillStyle,true)[12];
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(l,t+0.3*h);
					ctx.lineTo(l+w,t+0.7*h);
					ctx.stroke();
					break;
				case 'grid-showGrid':
					if (path.obj.length == 1 && path.obj[0].type == 'grid') {
						if (typeof path.obj[0].showGrid == 'undefined' || path.obj[0].showGrid == true) {
							ctx.fillStyle = colorA('#F96',0.5);
							ctx.fillRect(l,t,w,h);
						}
						ctx.strokeStyle = colorA('#F06',0.5);
						ctx.strokeRect(l,t,w,h);						
						ctx.strokeStyle = getShades(mainCanvasFillStyle,true)[12];
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(l+0.4*w,t+0.2*h);
						ctx.lineTo(l+0.4*w,t+0.8*h);
						ctx.moveTo(l+0.6*w,t+0.2*h);
						ctx.lineTo(l+0.6*w,t+0.8*h);
						ctx.moveTo(l+0.2*w,t+0.4*h);
						ctx.lineTo(l+0.8*w,t+0.4*h);
						ctx.moveTo(l+0.2*w,t+0.6*h);
						ctx.lineTo(l+0.8*w,t+0.6*h);
						ctx.stroke();
					}
					break;
				case 'grid-showScales':
					if (path.obj.length == 1 && path.obj[0].type == 'grid') {
						if (typeof path.obj[0].showScales == 'undefined' || path.obj[0].showScales == true) {
							ctx.fillStyle = colorA('#F96',0.5);
							ctx.fillRect(l,t,w,h);
						}				
						ctx.strokeStyle = colorA('#F06',0.5);
						ctx.strokeRect(l,t,w,h);
						ctx.strokeStyle = getShades(mainCanvasFillStyle,true)[12];
						text({ctx:ctx,textArray:['<<fontSize:'+(w/2)+'>>123'],left:l,top:t,width:w,height:h,textAlign:'center',vertAlign:'middle'});
					}
					break;
				case 'grid-showLabels':
					if (path.obj.length == 1 && path.obj[0].type == 'grid') {
						if (typeof path.obj[0].showLabels == 'undefined' || path.obj[0].showLabels == true) {
							ctx.fillStyle = colorA('#F96',0.5);
							ctx.fillRect(l,t,w,h);
						}		
						ctx.strokeStyle = colorA('#F06',0.5);
						ctx.strokeRect(l,t,w,h);
						ctx.strokeStyle = getShades(mainCanvasFillStyle,true)[12];
						text({ctx:ctx,textArray:['<<fontSize:'+(w/2)+'>><<font:algebra>>xy'],left:l,top:t,width:w,height:h,textAlign:'center',vertAlign:'middle'});
					}
					break;
				case 'multChoice-setCorrect':
					ctx.fillStyle = '#CFC';
					ctx.fillRect(l,t,w,h);
					ctx.strokeStyle = '#060';
					var l2 = l;
					var t2 = t;
					var w2 = 20;
					var h2 = 20;
					ctx.lineWidth = 2;
					ctx.lineJoin = 'round';
					ctx.lineCap = 'round';
					ctx.beginPath();
					ctx.moveTo(l2+4,t2+0.5*h2);
					ctx.lineTo(l2+w2/3,t2+h2-4);
					ctx.lineTo(l2+w2-4,t2+4);
					ctx.stroke();
					break;	
				case 'multChoice-colsPlus':
				case 'multChoice-rowsPlus':				
					ctx.strokeStyle = mainCanvasFillStyle;
					ctx.fillStyle = colorA('#F9F',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.beginPath();
					ctx.moveTo(l+0.3*w,t+0.5*h);
					ctx.lineTo(l+0.7*w,t+0.5*h);
					ctx.moveTo(l+0.5*w,t+0.3*h);
					ctx.lineTo(l+0.5*w,t+0.7*h);
					ctx.stroke();				
					break;
				case 'multChoice-colsMinus':
				case 'multChoice-rowsMinus':				
					ctx.strokeStyle = mainCanvasFillStyle;
					ctx.fillStyle = colorA('#F9F',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.beginPath();
					ctx.moveTo(l+0.3*w,t+0.5*h);
					ctx.lineTo(l+0.7*w,t+0.5*h);
					ctx.stroke();				
					break;
				case 'qbox2input-ansMinus':
					ctx.fillStyle = colorA('#000',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.fillStyle = mainCanvasFillStyle;
					ctx.beginPath();
					ctx.moveTo(l+0.75*w,t+0.25*h);
					ctx.lineTo(l+0.75*w,t+0.75*h);
					ctx.lineTo(l+0.25*w,t+0.5*h);
					ctx.lineTo(l+0.75*w,t+0.25*h);
					ctx.fill();						
					break;
				case 'qbox2input-ansValue':
					ctx.fillStyle = colorA('#000',0.5);
					ctx.fillRect(l,t,w,h);
					if (un(path.obj[0].ansNum)) {
						var txt  = "1/1";
					} else {
						var txt = String(path.obj[0].ansNum+1)+"/"+String(path.obj[0].answers.length);
					}
					text({ctx:ctx,left:l,top:t,width:w,height:h,align:'center',vertAlign:'middle',textArray:["<<fontSize:15>><<color:"+mainCanvasFillStyle+">>"+txt]});
					break;
				case 'qbox2input-ansPlus':
					ctx.fillStyle = colorA('#000',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.fillStyle = mainCanvasFillStyle;
					ctx.beginPath();
					ctx.moveTo(l+0.25*w,t+0.25*h);
					ctx.lineTo(l+0.25*w,t+0.75*h);
					ctx.lineTo(l+0.75*w,t+0.5*h);
					ctx.lineTo(l+0.25*w,t+0.25*h);
					ctx.fill();						
					break;
				case 'qbox2input-ansDelete':
					ctx.fillStyle = colorA('#000',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.strokeStyle = mainCanvasFillStyle;
					ctx.beginPath();
					ctx.moveTo(l+0.25*w,t+0.25*h);
					ctx.lineTo(l+0.75*w,t+0.75*h);
					ctx.moveTo(l+0.75*w,t+0.25*h);
					ctx.lineTo(l+0.25*w,t+0.75*h);
					ctx.stroke();						
					break;					
				case 'qbox2input-marksMinus':
					ctx.fillStyle = colorA('#000',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.fillStyle = mainCanvasFillStyle;
					ctx.beginPath();
					ctx.moveTo(l+0.75*w,t+0.25*h);
					ctx.lineTo(l+0.75*w,t+0.75*h);
					ctx.lineTo(l+0.25*w,t+0.5*h);
					ctx.lineTo(l+0.75*w,t+0.25*h);
					ctx.fill();						
					break;
				case 'qbox2input-marksValue':
					ctx.fillStyle = colorA('#000',0.5);
					ctx.fillRect(l,t,w,h);
					if (un(path.obj[0].ansNum)) {
						var txt  = "1";
					} else if (un(path.obj[0].answers[path.obj[0].ansNum])) {
						var txt = "";
					} else {
						var txt = String(path.obj[0].answers[path.obj[0].ansNum].marks);
					}
					if (txt == "1") {
						txt += " mark";
					} else {
						txt += " marks";
					}
					text({ctx:ctx,left:l,top:t,width:w,height:h,align:'center',vertAlign:'middle',textArray:["<<fontSize:15>><<color:"+mainCanvasFillStyle+">>"+txt]});
					break;
				case 'qbox2input-marksPlus':
					ctx.fillStyle = colorA('#000',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.fillStyle = mainCanvasFillStyle;
					ctx.beginPath();
					ctx.moveTo(l+0.25*w,t+0.25*h);
					ctx.lineTo(l+0.25*w,t+0.75*h);
					ctx.lineTo(l+0.75*w,t+0.5*h);
					ctx.lineTo(l+0.25*w,t+0.25*h);
					ctx.fill();						
					break;
				case 'qbox2input-alg':
					if (boolean(path.obj[0].mathsInput.algebra,false) == false) {
						ctx.strokeStyle = colorA('#090',0.5);
						ctx.strokeRect(l,t,w,h);
						var color = '#090';
					} else {
						ctx.fillStyle = colorA('#090',0.5);
						ctx.fillRect(l,t,w,h);
						var color = mainCanvasFillStyle;
					}
					text({ctx:ctx,left:l,top:t,width:w,height:h,align:'center',vertAlign:'middle',textArray:["<<fontSize:15>><<font:algebra>><<color:"+color+">>algebra"]});
					break;					
				case 'qbox2input-oe':
					if (un(path.obj[0].ansNum) || un(path.obj[0].answers[path.obj[0].ansNum]) || boolean(path.obj[0].answers[path.obj[0].ansNum].oe,false) == false) {
						ctx.strokeStyle = colorA('#090',0.5);
						ctx.strokeRect(l,t,w,h);
						var color = '#090';
					} else {
						ctx.fillStyle = colorA('#090',0.5);
						ctx.fillRect(l,t,w,h);
						var color = mainCanvasFillStyle;
					}
					text({ctx:ctx,left:l,top:t,width:w,height:h,align:'center',vertAlign:'middle',textArray:["<<fontSize:15>><<color:"+color+">>oe"]});
					break;
				case 'qbox2input-awrt':
					if (un(path.obj[0].ansNum) || un(path.obj[0].answers[path.obj[0].ansNum]) || boolean(path.obj[0].answers[path.obj[0].ansNum].awrt,false) == false) {
						ctx.strokeStyle = colorA('#090',0.5);
						ctx.strokeRect(l,t,w,h);
						var color = '#090';
					} else {
						ctx.fillStyle = colorA('#090',0.5);
						ctx.fillRect(l,t,w,h);
						var color = mainCanvasFillStyle;
					}
					text({ctx:ctx,left:l,top:t,width:w,height:h,align:'center',vertAlign:'middle',textArray:["<<fontSize:15>><<color:"+color+">>awrt"]});
					break;	
				case 'qbox2input-range':
					if (un(path.obj[0].ansNum) || un(path.obj[0].answers[path.obj[0].ansNum]) || boolean(path.obj[0].answers[path.obj[0].ansNum].range,false) == false) {
						ctx.strokeStyle = colorA('#090',0.5);
						ctx.strokeRect(l,t,w,h);
						var color = '#090';
					} else {
						ctx.fillStyle = colorA('#090',0.5);
						ctx.fillRect(l,t,w,h);
						var color = mainCanvasFillStyle;
					}
					text({ctx:ctx,left:l,top:t,width:w,height:h,align:'center',vertAlign:'middle',textArray:["<<fontSize:15>><<color:"+color+">>range"]});
					break;											
			}
		}
	}
}

function calcCursorPositions() {
	var pos = [];
	if (typeof draw[taskId].cursors == 'undefined') {
		draw[taskId].cursors = {default:'default'};
	}
			
	switch (draw[taskId].drawMode) {
		case 'pen':
			if (draw[taskId].defaultMode == 'qBox2Play') {
				for (var b = 0; b < draw[taskId].qBox2.box.length; b++) {
					pos.push({shape:'rect',dims:draw[taskId].qBox2.box[b],cursor:draw[taskId].cursors.pen,func:drawClickQBoxStartDraw,b:b});
				}
			} else {
				pos.push({shape:'rect',dims:draw[taskId].drawArea,cursor:draw[taskId].cursors.pen,func:drawClickStartDraw});
			}
			break;
		case 'line':
		case 'rect':
		case 'square':
		case 'circle':
		case 'ellipse':
		case 'polygon':
			pos.push({shape:'rect',dims:draw[taskId].drawArea,cursor:'url('+draw[taskId].lineCursor+') '+draw[taskId].lineCursorHotspot[0]+' '+draw[taskId].lineCursorHotspot[1]+', auto',func:drawClickStartDraw});
			break;
		case 'grid-resize':
			for (var i = 0; i < draw[taskId].path.length; i++) {
				var path = draw[taskId].path[i];
				if (path.selected == true && path.qBoxState !== 'static' && path.obj.length == 1 && path.obj[0].type == 'grid') {	
					var obj = path.obj[0];
					
					// drag grid
					pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw[taskId].cursors.move1,func:drawClickGridStartDrag,pathNum:i});
					// resize y
					pos.push({shape:'rect',dims:[obj.xZero-15,obj.top,30,obj.height],cursor:draw[taskId].cursors.ns,func:drawClickGridStartRescaleY,pathNum:i});
					// resize x
					pos.push({shape:'rect',dims:[obj.left,obj.yZero-15,obj.width,30],cursor:draw[taskId].cursors.ew,func:drawClickGridStartRescaleX,pathNum:i});	

					if (path.borderButtons !== 'undefined') {
						for (var j = 0; j < path.borderButtons.length; j++) {
							if (['grid-resize','grid-xMajorPlus','grid-xMajorMinus','grid-xMinorPlus','grid-xMinorMinus','grid-yMajorPlus','grid-yMajorMinus','grid-yMinorPlus','grid-yMinorMinus'].indexOf(path.borderButtons[j].buttonType) > -1) {
								pos.push(path.borderButtons[j]);
							}
						}
					}
				}
			}				
			break;
		case 'grid-plot':
			for (var i = 0; i < draw[taskId].path.length; i++) {
				var path = draw[taskId].path[i];
				if (path.selected == true && path.qBoxState !== 'static' && path.obj.length == 1 && path.obj[0].type == 'grid') {	
					var obj = path.obj[0];
					
					// plot points
					pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw[taskId].cursors.pointer,func:drawClickGridPlotPoint,pathNum:i});

					if (path.borderButtons !== 'undefined') {
						for (var j = 0; j < path.borderButtons.length; j++) {
							if (path.borderButtons[j].buttonType == 'grid-plot') pos.push(path.borderButtons[j]);
						}
					}
				}
			}				
			break;
		case 'grid-lineSegment':
			for (var i = 0; i < draw[taskId].path.length; i++) {
				var path = draw[taskId].path[i];
				if (path.selected == true && path.qBoxState !== 'static' && path.obj.length == 1 && path.obj[0].type == 'grid') {	
					var obj = path.obj[0];
					
					// draw line segment start
					pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw[taskId].cursors.pointer,func:drawClickGridStartLineSegment,pathNum:i});

					if (path.borderButtons !== 'undefined') {
						for (var j = 0; j < path.borderButtons.length; j++) {
							if (path.borderButtons[j].buttonType == 'grid-lineSegment') pos.push(path.borderButtons[j]);
						}
					}
				}
			}				
			break;
		case 'grid-line':
			for (var i = 0; i < draw[taskId].path.length; i++) {
				var path = draw[taskId].path[i];
				if (path.selected == true && path.qBoxState !== 'static' && path.obj.length == 1 && path.obj[0].type == 'grid') {	
					var obj = path.obj[0];
					
					// draw line start
					pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw[taskId].cursors.pointer,func:drawClickGridStartLine,pathNum:i});

					if (path.borderButtons !== 'undefined') {
						for (var j = 0; j < path.borderButtons.length; j++) {
							if (path.borderButtons[j].buttonType == 'grid-line') pos.push(path.borderButtons[j]);
						}
					}
				}
			}				
			break;			
		case 'select':
		case 'textEdit':
			pos.push({shape:'rect',dims:draw[taskId].drawArea,cursor:draw[taskId].cursors.default,func:drawClickStartSelectRect});
			if (draw[taskId].qBox == true) {
				// resize qBox
				pos.push({shape:'rect',dims:[draw[taskId].qSize[0]+draw[taskId].qSize[2],draw[taskId].qSize[1],draw[taskId].selectTolerance,draw[taskId].qSize[3]],cursor:draw[taskId].cursors.ew,func:drawClickQBoxResizeX});
				pos.push({shape:'rect',dims:[draw[taskId].qSize[0],draw[taskId].qSize[1]+draw[taskId].qSize[3],draw[taskId].qSize[2],draw[taskId].selectTolerance],cursor:draw[taskId].cursors.ns,func:drawClickQBoxResizeY});
			}
			
			var pos2 = [];
			for (var i = 0; i < draw[taskId].path.length; i++) {
				var path = draw[taskId].path[i];
				if (path.selected == true && path.qBoxState !== 'static' && typeof path.qBox2Part == 'undefined') {
					// object drag
					pos.push({shape:'rect',dims:[path.border[0],path.border[1],path.border[2],path.border[3]],cursor:draw[taskId].cursors.move1,func:drawClickStartDragObject,pathNum:i});
					
					// cursor events specific to object types here:
					if (path.obj.length == 1) {
						var obj = path.obj[0];
						switch (obj.type) {
							case 'text' :
							case 'button' :
							case 'input' :
								//console.log(obj.mathsInput);
								pos.push({shape:'rect',dims:[obj.left+obj.mathsInput.tightRect[0],obj.top+obj.mathsInput.tightRect[1],obj.mathsInput.tightRect[2],obj.mathsInput.tightRect[3]],cursor:'text',func:drawClickStartTextEdit,pathNum:i,mathsInput:obj.mathsInput});
								if (obj.type == 'input') {
									pos.push({shape:'rect',dims:[obj.leftInput.data[100]+obj.leftInput.tightRect[0],obj.leftInput.data[101]+obj.leftInput.tightRect[1],obj.leftInput.tightRect[2],obj.leftInput.tightRect[3]],cursor:'text',func:drawClickStartTextEdit,pathNum:i,mathsInput:obj.leftInput});
									pos.push({shape:'rect',dims:[obj.rightInput.data[100]+obj.rightInput.tightRect[0],obj.rightInput.data[101]+obj.rightInput.tightRect[1],obj.rightInput.tightRect[2],obj.rightInput.tightRect[3]],cursor:'text',func:drawClickStartTextEdit,pathNum:i,mathsInput:obj.rightInput});
								}
								break;
							case 'curve' :
								pos.push({shape:'circle',dims:[obj.startPos[0],obj.startPos[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickCurveStartPosDrag,pathNum:i});
								pos.push({shape:'circle',dims:[obj.finPos[0],obj.finPos[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickCurveFinPosDrag,pathNum:i});
								pos.push({shape:'circle',dims:[obj.controlPos[0],obj.controlPos[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickCurveControlPosDrag,pathNum:i});
								break;
							case 'curve2' :
								pos.push({shape:'circle',dims:[obj.startPos[0],obj.startPos[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickCurve2StartPosDrag,pathNum:i});
								pos.push({shape:'circle',dims:[obj.finPos[0],obj.finPos[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickCurve2FinPosDrag,pathNum:i});
								pos.push({shape:'circle',dims:[obj.controlPos1[0],obj.controlPos1[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickCurve2ControlPos1Drag,pathNum:i});
								pos.push({shape:'circle',dims:[obj.controlPos2[0],obj.controlPos2[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickCurve2ControlPos2Drag,pathNum:i});
								break;
							case 'polygon' :
								for (var k = 0; k < obj.points.length; k++) {
									pos.push({shape:'line',dims:[obj.points[k],obj.points[(k+1)%(obj.points.length)],draw[taskId].selectTolerance],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetLineDecoration,pathNum:i,point:k});
								}
								for (var k = 0; k < obj.points.length; k++) {
									pos.push({shape:'circle',dims:[obj.points[k][0],obj.points[k][1],40],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetAngleStyle,pathNum:i,point:k});
									if (obj.points.length == 4 && k == 4 && ['rect','para','rhom','kite'].indexOf(obj.polygonType) > -1) continue;
									pos.push({shape:'circle',dims:[obj.points[k][0],obj.points[k][1],8],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonStartPointDrag,pathNum:i,point:k});
								}
								if (obj.solidType == 'prism') {
									var prismVector = obj.prismVector || [40,-40];
									var point = pointAddVector(obj.points[0],prismVector);
									pos.push({shape:'circle',dims:[point[0],point[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonStartPrismPointDrag,pathNum:i});
								}
								if (obj.anglesMode == 'exterior' && !un(obj.exteriorAngles)) {
									for (var v = 0; v < obj.exteriorAngles.length; v++) {
										var pos11 = obj.exteriorAngles[v].line1.pos;
										var pos22 = obj.exteriorAngles[v].line2.pos;
										pos.push({shape:'circle',dims:[pos11[0],pos11[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonStartExtAnglePointDrag,pathNum:i,point:v,line:1});
										pos.push({shape:'circle',dims:[pos22[0],pos22[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonStartExtAnglePointDrag,pathNum:i,point:v,line:2});
									}
								}
								break;
							case 'anglesAroundPoint' :
								pos.push({shape:'circle',dims:[obj.center[0],obj.center[1],40],cursor:draw[taskId].cursors.pointer,func:drawClickAnglesAroundPointSetAngleStyle,pathNum:i});
								for (var k = 0; k < obj.points.length; k++) {
									pos.push({shape:'circle',dims:[obj.points[k][0],obj.points[k][1],8],cursor:draw[taskId].cursors.pointer,func:drawClickAnglesAroundPointStartPointDrag,pathNum:i,point:k});
								}							
								break;
							case 'line' :
								pos.push({shape:'circle',dims:[obj.startPos[0],obj.startPos[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickLineDragStartPos,pathNum:i});
								pos.push({shape:'circle',dims:[obj.finPos[0],obj.finPos[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickLineDragFinPos,pathNum:i});
								break;
							case 'angle' :
								pos.push({shape:'circle',dims:[obj.b[0],obj.b[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickAngleStartDragB,pathNum:i});
								pos.push({shape:'circle',dims:[obj.a[0],obj.a[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickAngleStartDragA,pathNum:i});
								pos.push({shape:'circle',dims:[obj.c[0],obj.c[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickAngleStartDragC,pathNum:i});
								if (!un(obj.d)) {
									pos.push({shape:'circle',dims:[obj.d[0],obj.d[1],8],cursor:draw[taskId].cursors.pointer,func:drawClickAngleStartDragD,pathNum:i});
								}
								break;
							case 'grid' :
								break;
							case 'table' :
							case 'table2' :
								for (var c = 1; c < path.obj[0].xPos.length; c++) {
									//select column
									pos.push({shape:'rect',dims:[path.obj[0].xPos[c-1],path.obj[0].top-10,path.obj[0].xPos[c]-path.obj[0].xPos[c-1],15],cursor:draw[taskId].cursors.downArrow,func:drawClickTableSelectCol,pathNum:i,c:c});
									// resize column
									pos.push({shape:'rect',dims:[path.obj[0].xPos[c]-5,path.obj[0].top,10,path.obj[0].height],cursor:draw[taskId].cursors.ew,func:drawClickTableResizeCol,pathNum:i,c:c});
								}
								for (var r = 1; r < path.obj[0].yPos.length; r++) {
									//select row
									pos.push({shape:'rect',dims:[path.obj[0].left-10,path.obj[0].yPos[r-1],15,path.obj[0].yPos[r]-path.obj[0].yPos[r-1]],cursor:draw[taskId].cursors.rightArrow,func:drawClickTableSelectRow,pathNum:i,r:r});
									// resize row
									pos.push({shape:'rect',dims:[path.obj[0].left,path.obj[0].yPos[r]-5,path.obj[0].width,10],cursor:draw[taskId].cursors.ns,func:drawClickTableResizeRow,pathNum:i,r:r});
								}
								for (var r = 0; r < path.obj[0].cells.length; r++) {
									for (var c = 0; c < path.obj[0].cells[r].length; c++) {
										if (typeof path.obj[0].mInputs[r][c].data !== 'undefined') {
											var cell = path.obj[0].cell[r][c];
											var mInput = path.obj[0].mInputs[r][c];
											if (un(mInput.tightRect)) { // textEdit for each cell
												pos.push({shape:'rect',dims:[mInput.data[100]-2-draw[taskId].drawRelPos[0],mInput.data[101]-2-draw[taskId].drawRelPos[1],mInput.data[102]+4,mInput.data[103]+4],cursor:draw[taskId].cursors.text,func:drawClickTableCellStartTextEdit,pathNum:i,r:r,c:c});
											} else {
												pos.push({shape:'rect',dims:[mInput.data[100]+mInput.tightRect[0]-draw[taskId].drawRelPos[0],mInput.data[101]+mInput.tightRect[1]-draw[taskId].drawRelPos[1],+mInput.tightRect[2],+mInput.tightRect[3]],cursor:draw[taskId].cursors.text,func:drawClickTableCellStartTextEdit,pathNum:i,r:r,c:c});
											}
											// select cell
											pos.push({shape:'rect',dims:[cell.left+3,cell.top+4,10,cell.height-2],cursor:draw[taskId].cursors.upRightArrow,func:drawClickTableSelectCell,pathNum:i,r:r,c:c});
										}
										if (draw[taskId].triggerEnabled == true) {
											// trigger button for each cell
											pos.push({shape:'rect',dims:[path.obj[0].cell[r][c].left+path.obj[0].cell[r][c].width+9-12,path.obj[0].cell[r][c].top+path.obj[0].cell[r][c].height+8-12,14,14],cursor:draw[taskId].cursors.pointer,func:drawClickTableCellSetTrigger,pathNum:i,r:r,c:c});
										}
									}
								}
								break;
							case 'multChoice' :
								for (var m = 0; m < obj.mInputs.length; m++) {
									if (obj.mInputs[m].data[104] == true) { // if visible
										var l = obj.left + (m % obj.cols) * (obj.cellWidth + obj.spacing);
										var t = obj.top + Math.floor(m / obj.cols) * (obj.cellHeight + obj.spacing);
										pos.push({shape:'rect',dims:[l+obj.mInputs[m].tightRect[0],t+obj.mInputs[m].tightRect[1],obj.mInputs[m].tightRect[2],obj.mInputs[m].tightRect[3]],cursor:'text',func:drawClickStartTextEdit,pathNum:i,mathsInput:obj.mInputs[m]});
									}
								}
								for (var c = 1; c < obj.cols; c++) {
									pos.push({shape:'rect',dims:[obj.left+c*obj.cellWidth+(c-1)*obj.spacing,obj.top,obj.spacing,obj.height],cursor:draw[taskId].cursors.ew,func:drawClickMultChoiceStartChangeSpacing,pathNum:i,dir:'h'});
								}
								for (var r = 1; r < obj.rows; r++) {
									pos.push({shape:'rect',dims:[obj.left,obj.top+r*obj.cellHeight+(r-1)*obj.spacing,obj.width,obj.spacing],cursor:draw[taskId].cursors.ns,func:drawClickMultChoiceStartChangeSpacing,pathNum:i,dir:'v'});
								}								
								break;
						}
					}
										
					if (typeof path.borderButtons == 'object') {
						for (var j = 0; j < path.borderButtons.length; j++) {
								pos.push(path.borderButtons[j]);
						}
					}
				} else {
					// objects that are not selected
					for (var j = 0; j < path.obj.length; j++) {
						if (path.qBoxState == 'static') continue;
						switch (path.obj[j].type) {
							case 'pen' :
								pos.push({shape:'path',dims:[path.obj[j].pos,draw[taskId].selectTolerance],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
								break;
							case 'line' :
								pos.push({shape:'line',dims:[path.obj[j].startPos,path.obj[j].finPos,draw[taskId].selectTolerance],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
								break;
							case 'rect' :
							case 'square' :
								var x1 = path.obj[j].startPos[0];
								var y1 = path.obj[j].startPos[1];
								var x2 = path.obj[j].finPos[0];
								var y2 = path.obj[j].finPos[1];
								if (path.obj[j].fillColor !== 'none') {
									pos.push({shape:'rect',dims:[x1,y1,(x2-x1),(y2-y1)],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
								} else {
									pos.push({shape:'openRect',dims:[x1,y1,(x2-x1),(y2-y1),draw[taskId].selectTolerance],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
								}
								break;
							case 'circle' :
								if (path.obj[j].fillColor !== 'none') {
									pos.push({shape:'circle',dims:[path.obj[j].center[0],path.obj[j].center[1],path.obj[j].radius],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
								} else {
									pos.push({shape:'openCircle',dims:[path.obj[j].center[0],path.obj[j].center[1],path.obj[j].radius,draw[taskId].selectTolerance],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
								}
								break;
							case 'ellipse' :
								if (path.obj[j].fillColor !== 'none') {
									pos.push({shape:'ellipse',dims:[path.obj[j].center[0],path.obj[j].center[1],path.obj[j].radiusX,path.obj[j].radiusY],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
								} else {
									pos.push({shape:'ellipse',dims:[path.obj[j].center[0],path.obj[j].center[1],path.obj[j].radiusX,path.obj[j].radiusY,draw[taskId].selectTolerance],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
								}
								break;
							case 'curve' :
								pos.push({shape:'path',dims:[path.obj[j].points,draw[taskId].selectTolerance],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
								break;
							case 'text' :
								if (typeof path.qBox2Part == 'number') {
									var dims = clone(path.obj[j].mathsInput.tightRect);
									dims[0] += 23;
									dims[1] += 23+draw[taskId].qBox2.parts[0][path.qBox2Part];
									pos.push({shape:'rect',dims:dims,cursor:draw[taskId].cursors.text,func:qBox2TextStart,pathNum:i});
									break;
								} else {
									if (path.obj[j].showBorder == true) {
										pos.push({shape:'rect',dims:[path.obj[j].left,path.obj[j].top,path.obj[j].width,path.obj[j].height],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
									}
									var dims = [
										path.obj[j].mathsInput.tightRect[0]+path.obj[j].mathsInput.data[100]-draw[taskId].drawRelPos[0],
										path.obj[j].mathsInput.tightRect[1]+path.obj[j].mathsInput.data[101]-draw[taskId].drawRelPos[1],
										path.obj[j].mathsInput.tightRect[2],
										path.obj[j].mathsInput.tightRect[3]
									]
									pos.push({shape:'rect',dims:dims,cursor:draw[taskId].cursors.text,func:drawClickStartTextEdit2,mathsInput:path.obj[j].mathsInput,pathNum:i});
								}
								break;
							default :
								pos.push({shape:'rect',dims:[path.obj[j].left,path.obj[j].top,path.obj[j].width,path.obj[j].height],cursor:draw[taskId].cursors.pointer,func:drawClickSelect,pathNum:i});
								break;
						}
					}
				}
			}
			pos = pos2.concat(pos);
			if (draw[taskId].qBox2.mode == 'edit') {
				for (var b = 0; b < draw[taskId].qBox2.box.length; b++) {
					var box = draw[taskId].qBox2.box[b];
					pos.push({shape:'rect',dims:[box[0]+box[2],box[1]+box[3]-40,20,20],cursor:'pointer',func:qBox2PartsPlus,box:b});
					pos.push({shape:'rect',dims:[box[0]+box[2],box[1]+box[3]-20,20,20],cursor:'pointer',func:qBox2PartsMinus,box:b});				
					for (var i = 0; i < draw[taskId].qBox2.parts[b].length; i++) {
						if (i > 0) {
							pos.push({shape:'line',dims:[[box[0]+box[2]-50,box[1]+draw[taskId].qBox2.parts[b][i]],[box[0]+box[2],box[1]+draw[taskId].qBox2.parts[b][i]],draw[taskId].selectTolerance],cursor:draw[taskId].cursors.ns,func:qBox2PartResizeStart,box:b,partNum:i});
						}
						var left = 23+570+draw[taskId].qBox2.markPos[b][i][0];
						var max = 591;
						if (i < draw[taskId].qBox2.parts[b].length - 1) max = draw[taskId].qBox2.parts[b][i+1];
						var top = 23+max+draw[taskId].qBox2.markPos[b][i][1];						
						pos.push({shape:'rect',dims:[left,top,40,50],cursor:'pointer',func:qBox2MarkDragStart,box:b,part:i});
					}
				}
				if (typeof draw[taskId].qBox2.pupilAnsDataTable !== 'undefined' && typeof draw[taskId].qBox2.pupilAnsDataTable.pos !== 'undefined') {
					pos = pos.concat(draw[taskId].qBox2.pupilAnsDataTable.pos);
				}
			}			
			break;
		case 'selectDrag': // if an object is being dragged
			pos.push({shape:'rect',dims:draw[taskId].drawArea,cursor:draw[taskId].cursors.move2});
			break;
		case 'textStart':
			pos.push({shape:'rect',dims:draw[taskId].drawArea,cursor:'text',func:drawClickStartNewTextEdit,pathNum:draw[taskId].path.length});
			break;
		case 'table' :
		case 'tableChange' :
		case 'tableBorders' :
		case 'tableCellColor' :
			pos.push({shape:'rect',dims:draw[taskId].drawArea,cursor:draw[taskId].cursors.default,func:tableMenuClose});
			break;
		case 'qBox2Play' :
			var paths = draw[taskId].path;
			for (var b = 0; b < draw[taskId].qBox2.box.length; b++) {
				var qId = draw[taskId].qBox2.boxQ[b];
				if (typeof qId == 'number' && qId > -1) {
					var paths = draw[taskId].qBox2.q[qId].paths;
					for (var p = 0; p < paths.length; p++) {
						for (var o = 0; o < paths[p].obj.length; o++) {
						var obj = paths[p].obj[o];
							if (obj.type == 'multChoice' && boolean(obj.pointerEvents,true) == true) {
								for (var m = 0; m < obj.rows*obj.cols; m++) {
									var l = draw[taskId].qBox2.box[b][0] + obj.left + (m % obj.cols) * (obj.cellWidth + obj.spacing);
									var t = draw[taskId].qBox2.box[b][1] + obj.top + Math.floor(m / obj.cols) * (obj.cellHeight + obj.spacing);
									pos.push({shape:'rect',dims:[l,t,obj.cellWidth,obj.cellHeight],cursor:draw[taskId].cursors.pointer,func:drawClickMultChoiceSelectCell,qId:qId,p:p,o:o,cell:m});
								}
							}
						}
					}
				}
			}
			break;
		case 'none':
		default:
			break;
	}
	
	draw[taskId].cursorPositions = pos;
}
function drawCanvasMove(e) {
	e.preventDefault();
	if (typeof draw[taskId] == 'undefined' || draw[taskId].drawing == true || ['tableColResize','tableRowResize','gridDrag','gridRecaleX','gridRecaleY','compassMove1','compassMove2','compassDraw','protractorRotate','protractorMove','rulerRotate','rulerMove','selectDrag','selectRect','selectResize','tableInputSelect','tableCellSelect','tableColSelect','tableRowSelect','textInputSelect'].indexOf(draw[taskId].drawMode) > -1) return;
	//console.log(draw[taskId].drawMode);

	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];
	draw[taskId].currCursor = getCursorAtPosition(x,y);
	draw[taskId].cursorCanvas.style.cursor = draw[taskId].currCursor.cursor;
	//console.log(draw[taskId].currCursor,draw[taskId].cursorCanvas.style.cursor);
	cursorPosHighlight();
}
function drawCanvasStart(e) {
	updateMouse(e);
	calcCursorPositions();
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];
	draw[taskId].currCursor = getCursorAtPosition(x,y);	// necessary for touch events, where move function will not have run
	deselectTables();
	if (typeof draw[taskId].currCursor !== 'undefined' && typeof draw[taskId].currCursor.func !== 'undefined') {
		draw[taskId].currCursor.func.apply();
	}
}
function showCursorPositions() {
	var ctx = draw[taskId].drawCanvas[draw[taskId].drawCanvas.length-1].ctx;
	//ctx.clearRect(draw[taskId].drawArea[0],draw[taskId].drawArea[1],draw[taskId].drawArea[2],draw[taskId].drawArea[3]);
	var colorMove = colorA('#00F',0.3);
	var colorPointer = colorA('#F00',0.3);
	var colorText = colorA('#0F0',0.3);
	var colorMisc = colorA('#FF0',0.3);
	for (var i = 0; i < draw[taskId].cursorPositions.length; i++) {
		var pos = draw[taskId].cursorPositions[i];
		if (pos.cursor == draw[taskId].cursors.move1) {
			ctx.fillStyle = colorMove;
		} else if (pos.cursor == draw[taskId].cursors.pointer) {
			ctx.fillStyle = colorPointer;
		} else if (pos.cursor == 'text') {
			ctx.fillStyle = colorText;
		} else {
			ctx.fillStyle = colorMisc;
		}
		
		if (pos.shape == 'rect') {
			ctx.fillRect(pos.dims[0],pos.dims[1],pos.dims[2],pos.dims[3]);
		} else if (pos.shape == 'circle') {
			ctx.beginPath();
			ctx.arc(pos.dims[0],pos.dims[1],pos.dims[2],0,2*Math.PI);
			ctx.fill();
		} else if (pos.shape == 'line') {
			
		}
	}
}
function getCursorAtPosition(x,y) {
	var overTool = isPosOverTool(x,y);
	if (typeof overTool == 'object' || overTool !== false) return overTool;
	if (typeof draw[taskId].cursorPositions == 'undefined') calcCursorPositions();
	var pos = draw[taskId].cursorPositions;
	var currPos = {cursor:draw[taskId].cursors.default,func:function(){}};
	var x2 = x;
	var y2 = y;
	for (var i = 0; i < pos.length; i++) {
		var dims = clone(pos[i].dims);
		if ((pos[i].shape == 'rect' && x2 >= dims[0] && x2 <= (dims[0]+dims[2]) && y2 >= dims[1] && y2 <= (dims[1]+dims[3])) ||
			(pos[i].shape == 'openRect' && 
				(distancePointToLineSegment([x2,y2],[dims[0],dims[1]],[dims[0]+dims[2],dims[1]]) < dims[4]) ||
				(distancePointToLineSegment([x2,y2],[dims[0]+dims[2],dims[1]],[dims[0]+dims[2],dims[1]+dims[3]]) < dims[4]) ||
				(distancePointToLineSegment([x2,y2],[dims[0]+dims[2],dims[1]+dims[3]],[dims[0],dims[1]+dims[3]]) < dims[4]) ||
				(distancePointToLineSegment([x2,y2],[dims[0],dims[1]+dims[3]],[dims[0],dims[1]]) < dims[4])
			) ||
			(pos[i].shape == 'circle' && dist(x2,y2,dims[0],dims[1]) <= dims[2]) ||
			(pos[i].shape == 'openCircle' && dist(x2,y2,dims[0],dims[1]) >= dims[2]-dims[3] && dist(x2,y2,dims[0],dims[1]) <= dims[2]+dims[3]) ||
			(pos[i].shape == 'ellipse' && isPointInEllipse([x2,y2],[dims[0],dims[1]],dims[2],dims[3]) == true) ||
			(pos[i].shape == 'openEllipse' && isPointOnEllipse([x2,y2],[dims[0],dims[1]],dims[2],dims[3],dims[4]) == true) ||
			(pos[i].shape == 'line' && (distancePointToLineSegment([x2,y2],dims[0],dims[1]) < dims[2])) ||
			(pos[i].shape == 'path' && (distancePointToPath([x2,y2],dims[0]) <= dims[1]))
		) {
			pos[i].pos = i;
			currPos = pos[i];
		}
	}
	//console.log(currPos);
	return currPos;
}
function cursorPosHighlight(clr) {
	if (draw[taskId].highlightCursorPositions == false) return;
	if (un(draw[taskId].cursorPosHighlight)) {
		draw[taskId].cursorPosHighlight = newctx({z:99999999});
		var ctx = draw[taskId].cursorPosHighlight;
		ctx.lineWidth = draw[taskId].selectTolerance * 2;
		ctx.strokeStyle = colorA('#FF0',0.4);
		ctx.fillStyle = colorA('#FF0',0.4);		
	}
	var ctx = draw[taskId].cursorPosHighlight;
	ctx.clear();
	
	if (boolean(clr,false) == true) return;
	var c = draw[taskId].currCursor;
	if (c.cursor == 'default' || c.cursor == 'move1') return;
	switch (c.shape) {
		case 'rect':
			ctx.fillRect(c.dims[0],c.dims[1],c.dims[2],c.dims[3]);
			break;
		case 'openRect':
			ctx.strokeRect(c.dims[0],c.dims[1],c.dims[2],c.dims[3]);			
			break;
		case 'circle':
			ctx.beginPath();
			ctx.arc(c.dims[0],c.dims[1],c.dims[2],0,2*Math.PI);
			ctx.fill();
			break;
		case 'openCircle':
			ctx.beginPath();
			ctx.arc(c.dims[0],c.dims[1],c.dims[2],0,2*Math.PI);
			ctx.stroke();			
			break;
		case 'ellipse':
			
			break;
		case 'openEllipse':
			
			break;
		case 'line':
			ctx.beginPath();
			ctx.moveTo(c.dims[0][0],c.dims[0][1]);
			ctx.lineTo(c.dims[1][0],c.dims[1][1]);
			ctx.stroke();
			break;
		case 'path':
			
			break;			
	}
	for (var p = c.pos+1; p < draw[taskId].cursorPositions.length; p++) {
		var c = draw[taskId].cursorPositions[p];
		switch (c.shape) {
			case 'rect':
				ctx.clearRect(c.dims[0],c.dims[1],c.dims[2],c.dims[3]);
				break;
			case 'openRect':
				clearLineRounded(ctx,c.dims[0],c.dims[1],c.dims[0]+c.dims[2],c.dims[1],draw[taskId].selectTolerance*2);
				clearLineRounded(ctx,c.dims[0]+c.dims[2],c.dims[1],c.dims[0]+c.dims[2],c.dims[1]+c.dims[3],draw[taskId].selectTolerance*2);
				clearLineRounded(ctx,c.dims[0]+c.dims[2],c.dims[1]+c.dims[3],c.dims[0],c.dims[1]+c.dims[3],draw[taskId].selectTolerance*2);
				clearLineRounded(ctx,c.dims[0],c.dims[1]+c.dims[3],c.dims[0],c.dims[1],draw[taskId].selectTolerance*2);
				break;
			case 'circle':
				clearCircle(ctx,c.dims[0],c.dims[1],c.dims[2]);
				break;
			case 'openCircle':
				
				break;
			case 'ellipse':
				
				break;
			case 'openEllipse':
				
				break;
			case 'line':
				clearLineRounded(ctx,c.dims[0][0],c.dims[0][1],c.dims[1][0],c.dims[1][1],draw[taskId].selectTolerance*2);
				break;
			case 'path':
				
				break;			
		}		
	}
}
function clearCircle(context,x,y,radius) {
	context.save();
	context.beginPath();
	context.arc(x, y, radius, 0, 2*Math.PI, true);
	context.clip();
	context.clearRect(x-radius,y-radius,radius*2,radius*2);
	context.restore();
}
function clearLineSquared(context,x1,y1,x2,y2,thickness) {
	var tmp, length;
	// swap coordinate pairs if x-coordinates are RTL to make them LTR
	if (x2 < x1) {
		tmp = x1; x1 = x2; x2 = tmp;
		tmp = y1; y1 = y2; y2 = tmp;
	}

	length = dist(x1,y1,x2,y2);

	context.save();
	context.translate(x1,y1);
	context.rotate(Math.atan2(y2-y1,x2-x1));
	context.clearRect(0,0,length,thickness);
	context.restore();
}
function clearLineRounded(context,x1,y1,x2,y2,thickness) {
	if (thickness <= 2) {
		clearLineSquared(context,x1,y1,x2,y2,thickness);
		return;
	}

	var tmp, half_thickness = thickness / 2, length,
		PI15 = 1.5 * Math.PI, PI05 = 0.5 * Math.PI
	;

	// swap coordinate pairs if x-coordinates are RTL to make them LTR
	if (x2 < x1) {
		tmp = x1; x1 = x2; x2 = tmp;
		tmp = y1; y1 = y2; y2 = tmp;
	}

	length = dist(x1,y1,x2,y2);

	context.save();
	context.translate(x1,y1);
	context.rotate(Math.atan2(y2-y1,x2-x1));
	x1 = 0;
	y1 = 0;
	x2 = length - 1;
	y2 = 0;
	// draw a complex "line" shape with rounded corner caps

	context.moveTo(x1,y1-half_thickness);
	context.lineTo(x2,y2-half_thickness);
	context.arc(x2,y2,half_thickness,PI15,PI05,false);
	context.lineTo(x1,y1-half_thickness+thickness);
	context.arc(x1,y1,half_thickness,PI05,PI15,false);
	context.closePath();
	x1 -= half_thickness;
	y1 -= half_thickness;

	context.clip();
	context.clearRect(x1,y1,length+thickness,thickness);
	context.restore();
}

function updateBorder(path) {
	var x1,y1,x2,y2;
	var buttons = [];
	var pathNum = draw[taskId].path.indexOf(path);
	var left = [];
	var top = [];
	var right = [];
	var bottom = [];
	var type = [];
	for (var i = 0; i < path.obj.length; i++) {
		var obj = path.obj[i];
		type[i] = obj.type;
		switch (obj.type) {
			case 'pen' :
				for (var j = 0; j < obj.pos.length; j++) {
					if (j == 0) {
						obj.left = obj.pos[0][0];
						obj.top = obj.pos[0][1];
						obj.right = obj.pos[0][0];
						obj.bottom = obj.pos[0][1];
					} else {
						obj.left = Math.min(obj.left,obj.pos[j][0]);
						obj.top = Math.min(obj.top,obj.pos[j][1]);
						obj.right = Math.max(obj.right,obj.pos[j][0]);
						obj.bottom = Math.max(obj.bottom,obj.pos[j][1]);
					}
				}
				obj.width = obj.right - obj.left;
				obj.height = obj.bottom - obj.top;
				break;
			case 'polygon' :
				for (var j = 0; j < obj.points.length; j++) {
					if (j == 0) {
						obj.left = obj.points[0][0]-10;
						obj.top = obj.points[0][1]-10;
						obj.right = obj.points[0][0]+10;
						obj.bottom = obj.points[0][1]+10;
					} else {
						obj.left = Math.min(obj.left,obj.points[j][0]-10);
						obj.top = Math.min(obj.top,obj.points[j][1]-10);
						obj.right = Math.max(obj.right,obj.points[j][0]+10);
						obj.bottom = Math.max(obj.bottom,obj.points[j][1]+10);
					}
				}
				if (obj.solidType == 'prism') {
					var prismVector = obj.prismVector || [40,-40];
					for (var p = 0; p < obj.points.length; p++) {
						var prismPoint = pointAddVector(obj.points[p],prismVector);
						obj.left = Math.min(obj.left,prismPoint[0]-10);
						obj.top = Math.min(obj.top,prismPoint[1]-10);
						obj.right = Math.max(obj.right,prismPoint[0]+10);
						obj.bottom = Math.max(obj.bottom,prismPoint[1]+10);						
					}
				}
				if (obj.anglesMode == 'exterior') {
					for (var p = 0; p < obj.points.length; p++) {
						if (!un(obj.exteriorAngles[p])) {
							if (!un(obj.exteriorAngles[p].line1)) {
								ePoint = obj.exteriorAngles[p].line1.pos;
								obj.left = Math.min(obj.left,ePoint[0]-10);
								obj.top = Math.min(obj.top,ePoint[1]-10);
								obj.right = Math.max(obj.right,ePoint[0]+10);
								obj.bottom = Math.max(obj.bottom,ePoint[1]+10);							
							}
							if (!un(obj.exteriorAngles[p].line2)) {
								ePoint = obj.exteriorAngles[p].line2.pos;
								obj.left = Math.min(obj.left,ePoint[0]-10);
								obj.top = Math.min(obj.top,ePoint[1]-10);
								obj.right = Math.max(obj.right,ePoint[0]+10);
								obj.bottom = Math.max(obj.bottom,ePoint[1]+10);							
							}
						}
					}
				}
				if (obj.anglesMode == 'outer') {
					for (var j = 0; j < obj.points.length; j++) {
						obj.left = Math.min(obj.left,obj.points[j][0]-70);
						obj.top = Math.min(obj.top,obj.points[j][1]-70);
						obj.right = Math.max(obj.right,obj.points[j][0]+70);
						obj.bottom = Math.max(obj.bottom,obj.points[j][1]+70);
					}
				}
				
				obj.width = obj.right - obj.left;
				obj.height = obj.bottom - obj.top;
				break;
			case 'anglesAroundPoint' :
				obj.left = obj.center[0]-65;
				obj.top = obj.center[1]-65;
				obj.right = obj.center[0]+65;
				obj.bottom = obj.center[1]+65;			
				for (var j = 0; j < obj.points.length; j++) {
					obj.left = Math.min(obj.left,obj.points[j][0]-65);
					obj.top = Math.min(obj.top,obj.points[j][1]-65);
					obj.right = Math.max(obj.right,obj.points[j][0]+65);
					obj.bottom = Math.max(obj.bottom,obj.points[j][1]+65);
				}
				obj.width = obj.right - obj.left;
				obj.height = obj.bottom - obj.top;	
				break;
			case 'line' :
			case 'rect' :
			case 'square' :
				if (!un(obj.startPos) && !un(obj.finPos)) {
					obj.left = Math.min(obj.startPos[0],obj.finPos[0]);
					obj.top = Math.min(obj.startPos[1],obj.finPos[1]);
					obj.width = Math.max(obj.startPos[0],obj.finPos[0]) - obj.left;
					obj.height = Math.max(obj.startPos[1],obj.finPos[1]) - obj.top;
				}
				break;
			case 'table' :
				obj.ctx = draw[taskId].hiddenCanvas.ctx;
				obj.ctx.clearRect(0,0,10000,10000);
				var table = drawTable2(obj);
				obj.cell = table.cell;
				obj.xPos = table.xPos;
				obj.yPos = table.yPos;
				obj.width = table.xPos[table.xPos.length-1] - obj.left;
				obj.height = table.yPos[table.yPos.length-1] - obj.top;
				break;
			case 'table2' :
				obj.width = arraySum(obj.widths);
				obj.height = arraySum(obj.heights);
				break;
			case 'curve' :
				/*obj.mid1 = midpoint(obj.startPos[0],obj.startPos[1],obj.controlPos[0],obj.controlPos[1]);
				obj.mid2 = midpoint(obj.finPos[0],obj.finPos[1],obj.controlPos[0],obj.controlPos[1]);
				obj.vertex = midpoint(obj.mid1[0],obj.mid1[1],obj.mid2[0],obj.mid2[1]);			
				obj.left = Math.min(obj.startPos[0],obj.finPos[0],obj.vertex[0]);
				obj.top = Math.min(obj.startPos[1],obj.finPos[1],obj.vertex[1]);
				obj.width = Math.max(obj.startPos[0],obj.finPos[0],obj.vertex[0]) - obj.left;
				obj.height = Math.max(obj.startPos[1],obj.finPos[1],obj.vertex[1]) - obj.top;*/
				obj.left = Math.min(obj.startPos[0],obj.finPos[0],obj.controlPos[0]);
				obj.top = Math.min(obj.startPos[1],obj.finPos[1],obj.controlPos[1]);
				obj.width = Math.max(obj.startPos[0],obj.finPos[0],obj.controlPos[0]) - obj.left;
				obj.height = Math.max(obj.startPos[1],obj.finPos[1],obj.controlPos[1]) - obj.top;				
				break;
			case 'curve2' :
				obj.left = Math.min(obj.startPos[0],obj.finPos[0],obj.controlPos1[0],obj.controlPos2[0]);
				obj.top = Math.min(obj.startPos[1],obj.finPos[1],obj.controlPos1[1],obj.controlPos2[1]);
				obj.width = Math.max(obj.startPos[0],obj.finPos[0],obj.controlPos1[0],obj.controlPos2[0]) - obj.left;
				obj.height = Math.max(obj.startPos[1],obj.finPos[1],obj.controlPos1[1],obj.controlPos2[1]) - obj.top;
				break;				
			case 'text' :
			case 'button' :
			case 'image' :
			case 'input' :
			case 'video' :
				break;
			case 'grid' :
				var ctx = draw[taskId].hiddenCanvas.ctx;
				ctx.clearRect(0,0,10000,10000);
				var showGrid = boolean(obj.showGrid,true);
				var showScales = boolean(obj.showScales,true);
				var showLabels = boolean(obj.showLabels,true);				
				obj.labelBorder = drawGrid3(ctx,0,0,obj,24,'#000','#000','#000','#000','#000','#000',mainCanvasFillStyle,showGrid,showScales,showLabels).labelBorder;			
				break;
			case 'angle' :
				if (!un(obj.d)) {
					obj.left = Math.min(obj.a[0],obj.b[0],obj.c[0])-20;
					obj.top = Math.min(obj.a[1],obj.b[1],obj.c[1])-20;
					obj.width = Math.max(obj.a[0],obj.b[0],obj.c[0]) - obj.left+40;
					obj.height = Math.max(obj.a[1],obj.b[1],obj.c[1]) - obj.top+40;
				} else {
					obj.left = obj.b[0] - obj.radius;
					obj.top = obj.b[1] - obj.radius;
					obj.width = 2 * obj.radius;
					obj.height = 2 * obj.radius;
				}
				break;
			case 'circle' :
				obj.left = obj.center[0] - obj.radius;
				obj.top = obj.center[1] - obj.radius;
				obj.width = 2 * obj.radius;
				obj.height = 2 * obj.radius;
				break;
			case 'ellipse' :
				obj.left = obj.center[0] - obj.radiusX;
				obj.top = obj.center[1] - obj.radiusY;
				obj.width = 2 * obj.radiusX;
				obj.height = 2 * obj.radiusY;
				break;
		}
		if (obj.type == 'grid') {
			left[i] = obj.labelBorder[0];
			top[i] = obj.labelBorder[1];
			right[i] = obj.labelBorder[0] + obj.labelBorder[2];
			bottom[i] = obj.labelBorder[1] + obj.labelBorder[3];
		} else if (obj.type == 'input' && draw[taskId].qBox2.mode == 'edit' && draw[taskId].qBox2.box.length > 0) {
			left[i] = obj.left;
			top[i] = obj.top;
			right[i] = obj.left + obj.width;
			bottom[i] = obj.top + obj.height + 20;
		} else {
			left[i] = obj.left;
			top[i] = obj.top;
			right[i] = obj.left + obj.width;
			bottom[i] = obj.top + obj.height;
		}
	}

	var x1 = arrayMin(left);
	var y1 = arrayMin(top);
	var x2 = arrayMax(right);
	var y2 = arrayMax(bottom);	
	
	path.tightBorder = [x1,y1,x2-x1,y2-y1,x2,y2];
	
	var padding = draw[taskId].selectPadding;
	if (type.length == 1) {
		if (type[0] == 'text') {
			padding = padding * 0.4;
		}
	}

	if (typeof path.qBox !== 'undefined' && path.qBox > -1) {
		padding = 10;
		if (type.length == 1 && type[0] == 'text') padding = 3;
	}
	
	x1 -= padding;
	y1 -= padding;
	x2 += padding;
	y2 += padding;
		
	path.border = [x1,y1,x2-x1,y2-y1,x2,y2];
	// work out borderButtons positions
	
	if (path.obj.length == 1 && (['button','image','rect','square','polygon','circle','ellipse','input','text','video','grid','multChoice','anglesAroundPoint'].indexOf(path.obj[0].type) > -1 || path.obj[0].type == 'angle' && un(path.obj[0].d))) {
		// resize handle in bottom right corner
		buttons.push({buttonType:'resize',shape:'rect',dims:[x2-20,y2-20,20,20],cursor:draw[taskId].cursors.nw,func:drawClickStartResizeObject,pathNum:pathNum});
	}

	if (['multChoice'].indexOf(path.obj[0].type) > -1) {	
		var obj = path.obj[0];
		for (var m = 0; m < obj.mInputs.length; m++) {
			if (un(obj.mInputs[m].data)) continue;
			if (obj.mInputs[m].data[104] == true && obj.correctCell !== m) {
				var l = obj.left + (m % obj.cols) * (obj.cellWidth + obj.spacing);
				var t = obj.top + Math.floor(m / obj.cols) * (obj.cellHeight + obj.spacing);
				buttons.push({buttonType:'multChoice-setCorrect',shape:'rect',dims:[l+obj.cellWidth-20,t,20,20],cursor:'pointer',func:drawClickMultChoiceChangeCorrect,pathNum:pathNum,num:m});
			}
		}
		buttons.push({buttonType:'multChoice-rowsPlus',shape:'rect',dims:[x2-20,(y1+y2)/2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickMultChoiceRowsPlus,pathNum:pathNum});
		buttons.push({buttonType:'multChoice-rowsMinus',shape:'rect',dims:[x2-20,(y1+y2)/2,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickMultChoiceRowsMinus,pathNum:pathNum});
		buttons.push({buttonType:'multChoice-colsMinus',shape:'rect',dims:[(x1+x2)/2-20,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickMultChoiceColsMinus,pathNum:pathNum});
		buttons.push({buttonType:'multChoice-colsPlus',shape:'rect',dims:[(x1+x2)/2,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickMultChoiceColsPlus,pathNum:pathNum});
	}						

	if (path.obj.length == 1 && ['input'].indexOf(path.obj[0].type) > -1 && draw[taskId].qBox2.mode == 'edit' && draw[taskId].qBox2.box.length > 0) {
		buttons.push({buttonType:'qbox2input-ansMinus',shape:'rect',dims:[(x1+x2)/2-50,y1,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBox2InputAnsMinus,pathNum:pathNum});
		buttons.push({buttonType:'qbox2input-ansValue',shape:'rect',dims:[(x1+x2)/2-30,y1,40,20],cursor:'default',func:function(){},pathNum:pathNum});
		buttons.push({buttonType:'qbox2input-ansPlus',shape:'rect',dims:[(x1+x2)/2+10,y1,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBox2InputAnsPlus,pathNum:pathNum});
		buttons.push({buttonType:'qbox2input-ansDelete',shape:'rect',dims:[(x1+x2)/2+30,y1,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBox2InputAnsDelete,pathNum:pathNum});		
		buttons.push({buttonType:'qbox2input-marksMinus',shape:'rect',dims:[(x1+x2)/2-50,y2-40,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBox2InputMarksMinus,pathNum:pathNum});
		buttons.push({buttonType:'qbox2input-marksValue',shape:'rect',dims:[(x1+x2)/2-30,y2-40,60,20],cursor:'default',func:function(){},pathNum:pathNum});
		buttons.push({buttonType:'qbox2input-marksPlus',shape:'rect',dims:[(x1+x2)/2+30,y2-40,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBox2InputMarksPlus,pathNum:pathNum});
		buttons.push({buttonType:'qbox2input-alg',shape:'rect',dims:[(x1+x2)/2-50,y2-20,100,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBox2InputAlg,pathNum:pathNum});
		//buttons.push({buttonType:'qbox2input-oe',shape:'rect',dims:[(x1+x2)/2-50,y2-20,100/3,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBox2InputOE,pathNum:pathNum});
		//buttons.push({buttonType:'qbox2input-awrt',shape:'rect',dims:[(x1+x2)/2-100/6,y2-20,100/3,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBox2InputAWRT,pathNum:pathNum});
		//buttons.push({buttonType:'qbox2input-range',shape:'rect',dims:[(x1+x2)/2+100/6,y2-20,100/3,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBox2InputRange,pathNum:pathNum});		
	}
	
	if (path.obj.length == 1 && ['angle'].indexOf(path.obj[0].type) > -1) {
		if (un(path.obj[0].d)) {
			buttons.push({buttonType:'angle-showLines',shape:'rect',dims:[x2-20,y2-40,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickAngleShowLines,pathNum:pathNum});
		} else {
			buttons.push({buttonType:'angle-showLines',shape:'rect',dims:[x2-20,y1+20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickAngleShowLines,pathNum:pathNum});
			buttons.push({buttonType:'angle-showAngle',shape:'rect',dims:[x2-20,y1+40,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickAngleShowAngle,pathNum:pathNum});
			buttons.push({buttonType:'angle-numOfCurves',shape:'rect',dims:[x2-20,y1+60,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickAngleNumOfCurves,pathNum:pathNum});
		}
		
	}
	
	if (path.obj.length == 1 && ['polygon'].indexOf(path.obj[0].type) > -1) {
		buttons.push({buttonType:'polygon-makeRegular',shape:'rect',dims:[x2-20,y2-40,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonMakeRegular,pathNum:pathNum});
		buttons.push({buttonType:'polygon-verticesPlus',shape:'rect',dims:[x2-20,y2-80,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonVerticesPlus,pathNum:pathNum});
		buttons.push({buttonType:'polygon-verticesMinus',shape:'rect',dims:[x2-20,y2-60,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonVerticesMinus,pathNum:pathNum});
		buttons.push({buttonType:'polygon-setPrism',shape:'rect',dims:[x2-20,y2-100,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetPrism,pathNum:pathNum});
		buttons.push({buttonType:'polygon-setOuterAngles',shape:'rect',dims:[x2-20,y2-120,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetOuterAngles,pathNum:pathNum});
		buttons.push({buttonType:'polygon-setExteriorAngles',shape:'rect',dims:[x2-20,y2-140,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetExteriorAngles,pathNum:pathNum});
		if (path.obj[0].points.length == 4) {
			buttons.push({buttonType:'polygon-setTypeKite',shape:'rect',dims:[x2-40,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetType,pathNum:pathNum,type:'kite'});
			buttons.push({buttonType:'polygon-setTypeRhom',shape:'rect',dims:[x2-60,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetType,pathNum:pathNum,type:'rhom'});
			buttons.push({buttonType:'polygon-setTypeTrap',shape:'rect',dims:[x2-80,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetType,pathNum:pathNum,type:'trap'});
			buttons.push({buttonType:'polygon-setTypePara',shape:'rect',dims:[x2-100,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetType,pathNum:pathNum,type:'para'});
			buttons.push({buttonType:'polygon-setTypeRect',shape:'rect',dims:[x2-120,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetType,pathNum:pathNum,type:'rect'});
			buttons.push({buttonType:'polygon-setTypeSquare',shape:'rect',dims:[x2-140,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickPolygonSetType,pathNum:pathNum,type:'square'});
		}
	}
	
	if (path.obj.length == 1 && ['anglesAroundPoint'].indexOf(path.obj[0].type) > -1) {
		buttons.push({buttonType:'anglesAroundPoint-pointsMinus',shape:'rect',dims:[x2-20,y2-40,20,20],cursor:draw[taskId].cursors.pointer,func:anglesAroundPointPointsMinus,pathNum:pathNum});
		buttons.push({buttonType:'anglesAroundPoint-pointsPlus',shape:'rect',dims:[x2-20,y2-60,20,20],cursor:draw[taskId].cursors.pointer,func:anglesAroundPointPointsPlus,pathNum:pathNum});
		buttons.push({buttonType:'anglesAroundPoint-fixRadius',shape:'rect',dims:[x2-20,y2-80,20,20],cursor:draw[taskId].cursors.pointer,func:anglesAroundPointFixRadius,pathNum:pathNum});
	}		
	
	if (path.obj.length == 1 && ['grid'].indexOf(path.obj[0].type) > -1) {
		// buttons for grids
		// left side
		buttons.push({buttonType:'grid-resize',shape:'rect',dims:[x1,y1+20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickStartGridResizeMode,pathNum:pathNum});
		buttons.push({buttonType:'grid-plot',shape:'rect',dims:[x1,y1+40,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickStartGridPlotMode,pathNum:pathNum});
		buttons.push({buttonType:'grid-lineSegment',shape:'rect',dims:[x1,y1+60,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickStartGridLineSegmentMode,pathNum:pathNum});
		buttons.push({buttonType:'grid-line',shape:'rect',dims:[x1,y1+80,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickStartGridLineMode,pathNum:pathNum});
		buttons.push({buttonType:'grid-showGrid',shape:'rect',dims:[x1,y1+100,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridShowGrid,pathNum:pathNum});
		buttons.push({buttonType:'grid-showScales',shape:'rect',dims:[x1,y1+120,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridShowScales,pathNum:pathNum});
		buttons.push({buttonType:'grid-showLabels',shape:'rect',dims:[x1,y1+140,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridShowLabels,pathNum:pathNum});
		
		// grid plus & minus buttons
		buttons.push({buttonType:'grid-yMajorPlus',shape:'rect',dims:[x1,(y1+y2)/2-50,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridStepChange,pathNum:pathNum,axis:'y',change:1,majorMinor:'major'});
		buttons.push({buttonType:'grid-yMajorMinus',shape:'rect',dims:[x1,(y1+y2)/2-30,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridStepChange,pathNum:pathNum,axis:'y',change:-1,majorMinor:'major'});
		buttons.push({buttonType:'grid-yMinorPlus',shape:'rect',dims:[x1,(y1+y2)/2+10,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridStepChange,pathNum:pathNum,axis:'y',change:1,majorMinor:'minor'});
		buttons.push({buttonType:'grid-yMinorMinus',shape:'rect',dims:[x1,(y1+y2)/2+30,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridStepChange,pathNum:pathNum,axis:'y',change:-1,majorMinor:'minor'});
		buttons.push({buttonType:'grid-xMajorPlus',shape:'rect',dims:[(x1+x2)/2-50,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridStepChange,pathNum:pathNum,axis:'x',change:1,majorMinor:'major'});
		buttons.push({buttonType:'grid-xMajorMinus',shape:'rect',dims:[(x1+x2)/2-30,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridStepChange,pathNum:pathNum,axis:'x',change:-1,majorMinor:'major'});
		buttons.push({buttonType:'grid-xMinorPlus',shape:'rect',dims:[(x1+x2)/2+10,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridStepChange,pathNum:pathNum,axis:'x',change:1,majorMinor:'minor'});
		buttons.push({buttonType:'grid-xMinorMinus',shape:'rect',dims:[(x1+x2)/2+30,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickGridStepChange,pathNum:pathNum,axis:'x',change:-1,majorMinor:'minor'});		
	}
	
	if (path.obj.length == 1 && ['text'].indexOf(path.obj[0].type) > -1) {
		buttons.push({buttonType:'text-border',shape:'rect',dims:[x2-40,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickTextToggleBorder,pathNum:pathNum});
		buttons.push({buttonType:'text-horizResize',shape:'rect',dims:[x2-20,y2-40,20,20],cursor:draw[taskId].cursors.ew,func:drawClickTextHorizResize,pathNum:pathNum});
		buttons.push({buttonType:'text-horizResizeCollapse',shape:'rect',dims:[x2-20,y2-60,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickTextHorizResizeCollapse,pathNum:pathNum});
	}
	
	if (path.qBox > -1) {
		// qBox position buttons
		buttons.push({buttonType:'qPos-bottomRight',shape:'rect',dims:[x2-40,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBoxObjPosBottomRight,pathNum:pathNum});
		buttons.push({buttonType:'qPos-center',shape:'rect',dims:[x2-60,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBoxObjPosCenter,pathNum:pathNum});
		if (path.obj.length == 1 && path.obj[0].type == 'text') {
			buttons.push({buttonType:'qPos-fillWidth',shape:'rect',dims:[x2-80,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickQBoxTextFillWidth,pathNum:pathNum});
		}
	}	
	
	// delete button in top right corner
	buttons.push({buttonType:'delete',shape:'rect',dims:[x2-20,y1,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickDelete,pathNum:pathNum});
	
	if (draw[taskId].triggerEnabled == true) {
		// trigger button in top left corner
		buttons.push({buttonType:'trigger',shape:'rect',dims:[x1,y1,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickTrigger,pathNum:pathNum});
		// individual cell trigger buttons
		if (path.obj.length == 1 && ['table'].indexOf(path.obj[0].type) > -1) {
			for (var r = 0; r < path.obj[0].cell.length; r++) {
				for (var c = 0; c < path.obj[0].cell[r].length; c++) {
					buttons.push({buttonType:'triggerTableCell',shape:'rect',dims:[path.obj[0].cell[r][c].left,path.obj[0].cell[r][c].top,12,12],cursor:draw[taskId].cursors.pointer,func:drawClickTableCellSetTrigger,pathNum:pathNum,r:r,c:c});
				}
			}
		}		
	}
		
	// plus & minus zIndex buttons in bottom left corner
	buttons.push({buttonType:'orderPlus',shape:'rect',dims:[x1,y2-40,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickOrderPlus,pathNum:pathNum});
	buttons.push({buttonType:'orderMinus',shape:'rect',dims:[x1,y2-20,20,20],cursor:draw[taskId].cursors.pointer,func:drawClickOrderMinus,pathNum:pathNum});	
	
	path.borderButtons = buttons; 
	return path.border;
}

function drawContextMenu() { // call whenever there is a change in what is selected
	if (un(draw[taskId].contextMenu)) return;
	var sel = getSelectedPaths();
	if (sel.length == 0) {
		
		return;
	}
	if (sel.length > 1 || draw[taskId].path[sel[0]].obj.length > 1) { // multiple paths
		
		return;
	}
	var obj = draw[taskId].path[sel[0]].obj[0];
	var buttons = ['style','order'];
	switch (obj.type) {
		case 'arc' :
		case 'pen' :
		case 'square' :
		case 'rect' :	
		case 'image' :
		case 'button' :
		case 'input' :
		case 'circle' :
		case 'ellipse' :
			break;
		case 'line' :
		case 'curve' :
		case 'curve2' :
			buttons.push('lineDecoration');
			break;
		case 'text' :
			break;
		case 'table' :
		case 'table2' :
			buttons.push('tableRowColChange','tableCellColor','tableBorders','distributeHoriz','distributeVert');
			break;
		case 'grid' :
			break;
		case 'angle':
			buttons.push('angleShowLines');
			if (!un(obj.d)) buttons.push('angleShowValue','angleStyle');
			break;
		case 'polygon':
			buttons.push('polygonMakeRegular','polygonVerticesChange','polygonPrism','polygonExternalAngles','polygonExteriorAngles');
			break;
		case 'anglesAroundPoint':
			buttons.push('anglesAroundPointFixRadius','anglesAroundPointVerticesChange');
			break;			
		case 'multChoice' :
			break;
	}
	draw[taskId].contextMenu.draw(buttons);
}

function sel() {
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (draw[taskId].path[p].selected == true) {
			return draw[taskId].path[p].obj[0];
		}
	}
	return false;
}

/***************************/
/*					  	   */
/*    	 DRAW PATHS 	   */
/*				  	  	   */
/***************************/

function drawObjToCtx(ctx,path,obj,opacity,zIndex,l,t,sf) {
	if (typeof opacity !== 'number') opacity = 1;
	if (typeof zIndex !== 'number') zIndex = 2;
	if (typeof sf !== 'number') sf = 1;
	if (typeof l == 'number' || typeof t == 'number') {
		if (typeof l !== 'number') l = 0;
		if (typeof t !== 'number') t = 0;
		if (typeof obj.relLeft !== 'undefined') obj.left = l+obj.relLeft;
		if (typeof obj.relTop !== 'undefined') obj.top = t+obj.relTop;
		if (typeof obj.relCenter !== 'undefined') obj.center = [l+obj.relCenter[0],t+obj.relCenter[1]];
		if (typeof obj.relStartPos !== 'undefined') obj.startPos = [l+obj.relStartPos[0],t+obj.relStartPos[1]];
		if (typeof obj.relFinPos !== 'undefined') obj.finPos = [l+obj.relFinPos[0],t+obj.relFinPos[1]];
		if (typeof obj.relControlPos !== 'undefined') obj.controlPos = [l+obj.relControlPos[0],t+obj.relControlPos[1]];
		if (typeof obj.relControlPos1 !== 'undefined') obj.controlPos1 = [l+obj.relControlPos1[0],t+obj.relControlPos1[1]];
		if (typeof obj.relControlPos2 !== 'undefined') obj.controlPos2 = [l+obj.relControlPos2[0],t+obj.relControlPos2[1]];
		if (typeof obj.relA !== 'undefined') obj.a = [l+obj.relA[0],t+obj.relA[1]];
		if (typeof obj.relB !== 'undefined') obj.b = [l+obj.relB[0],t+obj.relB[1]];
		if (typeof obj.relC !== 'undefined') obj.c = [l+obj.relC[0],t+obj.relC[1]];
		if (typeof obj.relPos !== 'undefined') {
			obj.pos = [];
			for (var a = 0; a < obj.relPos.length; a++) {
				obj.pos[a] = [l+obj.relPos[a][0],t+obj.relPos[a][1]];
			}
		}
		if (typeof obj.relPoints !== 'undefined') {
			obj.points = [];
			for (var a = 0; a < obj.relPoints.length; a++) {
				obj.points[a] = [l+obj.relPoints[a][0],t+obj.relPoints[a][1]];
			}
		}
		if (typeof obj.mathsInput !== 'undefined' && typeof obj.mathsInput.relLeft !== 'undefined' && typeof obj.mathsInput.relLeft !== 'undefined') {
			moveMathsInput(obj.mathsInput,l+obj.mathsInput.relLeft,t+obj.mathsInput.relTop);
		}
		if (typeof obj.leftInput !== 'undefined' && typeof obj.mathsInput.relLeft !== 'undefined' && typeof obj.mathsInput.relLeft !== 'undefined') {
			moveMathsInput(obj.leftInput,l+obj.leftInput.relLeft,t+obj.leftInput.relTop);
		}
		if (typeof obj.rightInput !== 'undefined' && typeof obj.mathsInput.relLeft !== 'undefined' && typeof obj.mathsInput.relLeft !== 'undefined') {
			moveMathsInput(obj.rightInput,l+obj.rightInput.relLeft,t+obj.rightInput.relTop);
		}
		if (typeof obj.mInputs !== 'undefined') {
			if (obj.type == 'table') {
				for (var r = 0; r < obj.mInputs.length; r++) {
					for (var c = 0; c < obj.mInputs[r].length; c++) {
						if (typeof obj.mInputs[r][c].relLeft !== 'undefined' && typeof obj.mInputs[r][c].relTop !== 'undefined') {
							moveMathsInput(obj.mInputs[r][c],l+obj.mInputs[r][c].relLeft,t+obj.mInputs[r][c].relTop);
							obj.mInputs[r][c].canvas.style.zIndex = 1000;
						}
					}
				}
			} else {
				for (var m = 0; m < obj.mInputs.length; m++) {
					if (typeof obj.mInputs[m].relLeft !== 'undefined' && typeof obj.mInputs[m].relTop !== 'undefined') {
						moveMathsInput(obj.mInputs[m],l+obj.mInputs[m].relLeft,t+obj.mInputs[m].relTop);
						obj.mInputs[m].canvas.style.zIndex = 1000;
					}
				}
			}				
		}			
	}
	
	switch (obj.type) {
		case 'arc' :
			drawPathArc(ctx,obj,sf);
			break;
		case 'pen' :
			drawPathPen(ctx,obj,sf);
			break;
		case 'line' :
			drawPathLine(ctx,obj,sf);
			if (path.obj.length == 1 && path.selected == true) {
				ctx.save();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.fillStyle = '#F00';
				ctx.beginPath();
				ctx.arc(obj.startPos[0],obj.startPos[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(obj.finPos[0],obj.finPos[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();						
				ctx.restore();
			}
			break;
		case 'curve' :
			drawPathCurve(ctx,obj,sf);				
			if (path.obj.length == 1 && path.selected == true) { // if selected
				ctx.save();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.fillStyle = '#F00';
				ctx.beginPath();
				ctx.arc(obj.startPos[0],obj.startPos[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(obj.finPos[0],obj.finPos[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(obj.controlPos[0],obj.controlPos[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.restore();
			}
			break;
		case 'curve2' :
			drawPathCurve2(ctx,obj,sf);
			if (path.obj.length == 1 && path.selected == true) { // if selected
				ctx.save();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.fillStyle = '#F00';
				ctx.beginPath();
				ctx.arc(obj.startPos[0],obj.startPos[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(obj.finPos[0],obj.finPos[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(obj.controlPos1[0],obj.controlPos1[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(obj.controlPos2[0],obj.controlPos2[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();					
				ctx.restore();
			}
			break;				
		case 'square' :
		case 'rect' :	
			drawPathRect(ctx,obj,sf);
			break;
		case 'image' :
			drawPathImage(ctx,obj,sf);
			//imageCount++;
			break;
		case 'button' :
			obj.mathsInput.canvas.style.opacity = opacity;
			obj.mathsInput.cursorCanvas.style.opacity = opacity;	
			setMathsInputZIndex(obj.mathsInput,zIndex+1);
			drawPathButton(ctx,obj,false,sf);
			break;
		case 'input' :
			if (boolean(obj.edit,true) == true) {
				obj.leftInput.canvas.style.opacity = opacity;
				obj.leftInput.cursorCanvas.style.opacity = opacity;
				obj.mathsInput.canvas.style.opacity = opacity;
				obj.mathsInput.cursorCanvas.style.opacity = opacity;					
				obj.rightInput.canvas.style.opacity = opacity;
				obj.rightInput.cursorCanvas.style.opacity = opacity;
				setMathsInputZIndex(obj.leftInput,zIndex+1);
				setMathsInputZIndex(obj.mathsInput,zIndex+1);
				setMathsInputZIndex(obj.rightInput,zIndex+1);
				drawPathInput(ctx,obj,false,sf);
				if (path.selected == true) { // selected
					if (obj.leftInput.stringJS == '' && obj.leftInput.border == false) {
						obj.leftInput.border = true;
						drawMathsInputText(obj.leftInput);
					}
					if (obj.mathsInput.stringJS == '' && obj.mathsInput.border == false) {
						obj.mathsInput.border = true;
						drawMathsInputText(obj.mathsInput);
					}
					if (obj.rightInput.stringJS == '' && obj.rightInput.border == false) {
						obj.rightInput.border = true;
						drawMathsInputText(obj.rightInput);
					}
				} else {
					if (obj.leftInput.border == true) {
						obj.leftInput.border = false;						
						drawMathsInputText(obj.leftInput);
					}
					if (obj.mathsInput.border == true) {
						obj.mathsInput.border = false;						
						drawMathsInputText(obj.mathsInput);
					}
					if (obj.rightInput.border == true) {
						obj.rightInput.border = false;						
						drawMathsInputText(obj.rightInput);
					}						
				}
			}
			break;
		case 'circle' :
			var showCenter = (obj.showCenter == true || (path.selected == true && path.obj.length == 1)) ? true : false;
			drawPathCircle(ctx,obj,showCenter,sf);
			break;
		case 'ellipse' :
			var showCenter = (obj.showCenter == true || (path.selected == true && path.obj.length == 1)) ? true : false;
			drawPathEllipse(ctx,obj,showCenter,sf);
			break;
		case 'text' :
			if (boolean(obj.showBorder,false) == true) {
				drawPathTextBorder(ctx,obj,sf);
			}
			obj.mathsInput.canvas.style.opacity = opacity;
			obj.mathsInput.cursorCanvas.style.opacity = opacity;					
			setMathsInputZIndex(obj.mathsInput,zIndex+1);
			//drawPathText(ctx,obj,true,sf);
			break;
		case 'table' :
			for (var r = 0; r < obj.cells.length; r++) {
				for (var c = 0; c < obj.cells[r].length; c++) {
					if (typeof obj.cells[r][c].input == 'boolean' && obj.cells[r][c].input == true) {
						obj.cells[r][c].color = '#FFF';
					}
				}
			}
			for (var r = 0; r < obj.mInputs.length; r++) {
				for (var c = 0; c < obj.mInputs[r].length; c++) {
					if (typeof obj.mInputs[r][c].canvas !== 'undefined') {
						obj.mInputs[r][c].canvas.style.opacity = opacity;
						obj.mInputs[r][c].cursorCanvas.style.opacity = opacity;
						setMathsInputZIndex(obj.mInputs[r][c],zIndex+1);
					}
				}
			}
			obj.ctx = ctx;
			var table = drawTable2(obj);
			obj.cell = table.cell;
			obj.xPos = table.xPos;
			obj.yPos = table.yPos;
			obj.width = obj.xPos[obj.xPos.length-1] - obj.left;
			obj.height = obj.yPos[obj.yPos.length-1] - obj.top;
			if (draw[taskId].triggerEnabled == true) {
				for (var r = 0; r < obj.cells.length; r++) {
					for (var c = 0; c < obj.cells[r].length; c++) {
						var vis2 = true;
						for (var t = 0; t <= draw[taskId].triggerNum; t++) {
							if (typeof obj.cells[r][c].trigger[t] == 'boolean' && obj.cells[r][c].trigger[t] == true) {
								vis2 = true;
							} else if (typeof obj.cells[r][c].trigger[t] == 'boolean' && obj.cells[r][c].trigger[t] == false) {
								vis2 = false;
							}
						}
						if (vis2 == true) {
							if (typeof obj.mInputs[r][c].canvas !== 'undefined') {
								obj.mInputs[r][c].canvas.style.opacity = 1;
								obj.mInputs[r][c].cursorCanvas.style.opacity = 1;
							}
						} else {
							if (typeof obj.mInputs[r][c].canvas !== 'undefined') {
								obj.mInputs[r][c].canvas.style.opacity = 0.15;
								obj.mInputs[r][c].cursorCanvas.style.opacity = 0.15;								
							}
						}
					}
				}
			}
			break;
		case 'table2' :
			for (var r = 0; r < obj.mInputs.length; r++) {
				for (var c = 0; c < obj.mInputs[r].length; c++) {
					if (typeof obj.cells[r][c].input == 'boolean' && obj.cells[r][c].input == true) {
						obj.cells[r][c].color = '#FFF';
					}					
					if (typeof obj.mInputs[r][c].canvas !== 'undefined') {
						obj.mInputs[r][c].canvas.style.opacity = opacity;
						obj.mInputs[r][c].cursorCanvas.style.opacity = opacity;
						setMathsInputZIndex(obj.mInputs[r][c],zIndex+1);
					}
					/*if (path.selected) {
						obj.mInputs[r][c].canvas.data = obj.mInputs[r][c].data;
						flattenCanvases(ctx.canvas,obj.mInputs[r][c].canvas);
					}*/
				}
			}
			obj.ctx = ctx;
			var table = drawTable3(obj);
			obj.cell = table.cell;
			obj.xPos = table.xPos;
			obj.yPos = table.yPos;
			obj.width = obj.xPos[obj.xPos.length-1] - obj.left;
			obj.height = obj.yPos[obj.yPos.length-1] - obj.top;
			if (draw[taskId].triggerEnabled == true) {
				for (var r = 0; r < obj.cells.length; r++) {
					for (var c = 0; c < obj.cells[r].length; c++) {
						var vis2 = true;
						for (var t = 0; t <= draw[taskId].triggerNum; t++) {
							if (typeof obj.cells[r][c].trigger[t] == 'boolean' && obj.cells[r][c].trigger[t] == true) {
								vis2 = true;
							} else if (typeof obj.cells[r][c].trigger[t] == 'boolean' && obj.cells[r][c].trigger[t] == false) {
								vis2 = false;
							}
						}
						if (vis2 == true) {
							if (typeof obj.mInputs[r][c].canvas !== 'undefined') {
								obj.mInputs[r][c].canvas.style.opacity = 1;
								obj.mInputs[r][c].cursorCanvas.style.opacity = 1;
							}
						} else {
							if (typeof obj.mInputs[r][c].canvas !== 'undefined') {
								obj.mInputs[r][c].canvas.style.opacity = 0.15;
								obj.mInputs[r][c].cursorCanvas.style.opacity = 0.15;								
							}
						}
					}
				}
			}
			break;			
		case 'grid' :
			drawPathGrid(ctx,obj,sf);
			break;
		case 'angle':
			drawPathAngle(ctx,obj,sf);
			if (path.obj.length == 1 && path.selected == true) {
				drawAngle({ctx:ctx,a:obj.a,b:obj.b,c:obj.c,drawLines:false,drawCurve:false,radius:obj.radius,lineColor:colorA('#000',0.3),labelMeasure:true,labelFontSize:25,labelRadius:obj.radius+3,labelColor:colorA('#000',0.3),lineWidth:2});				
			
				ctx.save();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.fillStyle = colorA('#F00',0.5);
				ctx.beginPath();
				ctx.arc(obj.b[0],obj.b[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();				
				ctx.beginPath();
				ctx.arc(obj.a[0],obj.a[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(obj.c[0],obj.c[1],8,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				if (!un(obj.d)) {
					if (boolean(obj.recalcD,false)) {
						if (!un(obj.calcD)) obj.calcD();
						obj.recalcD = false;
					}
					ctx.beginPath();
					ctx.arc(obj.d[0],obj.d[1],8,0,2*Math.PI);
					ctx.fillStyle = '#F90';
					ctx.fill();	
					ctx.stroke();
				}
				ctx.restore();
			}				
			break;			
		case 'polygon':
			drawPathPolygon(ctx,obj,sf);
			if (path.obj.length == 1) {
				ctx.save();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.fillStyle = '#F00';
				var angleObj = {ctx:ctx,drawLines:false,radius:30,lineColor:colorA(obj.color,0.3),labelMeasure:true,labelFontSize:25,labelRadius:33,labelColor:colorA(obj.color,0.3),lineWidth:2};
				for (var k = 0; k < obj.points.length; k++) {
					if ((path.selected == true || (obj.drawing == true && k > 0 && k < obj.points.length-1)) && typeof obj.angles[k] !== 'object') {
						angleObj.b = obj.points[k];
						if (obj.clockwise == false) {
							angleObj.a = obj.points[(k+1)%(obj.points.length)];
							if (k == 0) {
								angleObj.c = obj.points[obj.points.length-1];
							} else {
								angleObj.c = obj.points[k-1];
							}
						} else {
							angleObj.c = obj.points[(k+1)%(obj.points.length)];
							if (k == 0) {
								angleObj.a = obj.points[obj.points.length-1];
							} else {
								angleObj.a = obj.points[k-1];
							}
						}
						drawAngle(angleObj);				
					}
					if (path.selected == true && obj.anglesMode == 'outer' && typeof obj.outerAngles[k] !== 'object') {
						angleObj.b = obj.points[k];
						if (obj.clockwise == true) {
							angleObj.a = obj.points[(k+1)%(obj.points.length)];
							if (k == 0) {
								angleObj.c = obj.points[obj.points.length-1];
							} else {
								angleObj.c = obj.points[k-1];
							}
						} else {
							angleObj.c = obj.points[(k+1)%(obj.points.length)];
							if (k == 0) {
								angleObj.a = obj.points[obj.points.length-1];
							} else {
								angleObj.a = obj.points[k-1];
							}
						}
						drawAngle(angleObj);				
					}
					if (path.selected == true && obj.anglesMode == 'exterior') {
						ctx.save();
						ctx.strokeStyle = colorA(obj.color,0.3);
						if (obj.exteriorAngles[k].line1.show == false) {
							ctx.beginPath();
							ctx.moveTo(obj.points[k][0],obj.points[k][1]);
							ctx.lineTo(obj.exteriorAngles[k].line1.pos[0],obj.exteriorAngles[k].line1.pos[1]);
							ctx.stroke();
						}
						if (obj.exteriorAngles[k].line2.show == false) {
							ctx.beginPath();
							ctx.moveTo(obj.points[k][0],obj.points[k][1]);
							ctx.lineTo(obj.exteriorAngles[k].line2.pos[0],obj.exteriorAngles[k].line2.pos[1]);
							ctx.stroke();
						}
						ctx.restore();
						angleObj.b = obj.points[k];
						var prev = k - 1;
						if (prev < 0) prev = obj.points.length - 1;
						var next = k + 1;
						if (next > obj.points.length - 1) next = 0;
						if (un(obj.exteriorAngles[k].a3)) {
							angleObj.a = obj.points[prev];
							angleObj.c = obj.exteriorAngles[k].line1.pos;
							drawAngle(angleObj);
						}
						if (un(obj.exteriorAngles[k].a2)) {
							angleObj.a = obj.exteriorAngles[k].line1.pos;
							angleObj.c = obj.exteriorAngles[k].line2.pos;
							drawAngle(angleObj);
						}
						if (un(obj.exteriorAngles[k].a1)) {
							angleObj.a = obj.exteriorAngles[k].line2.pos;
							angleObj.c = obj.points[next];
							drawAngle(angleObj);
						}						
						ctx.save();
						ctx.fillStyle = '#9FF';
						ctx.beginPath();
						ctx.arc(obj.exteriorAngles[k].line1.pos[0],obj.exteriorAngles[k].line1.pos[1],7,0,2*Math.PI);
						ctx.fill();
						ctx.stroke();
						ctx.beginPath();
						ctx.arc(obj.exteriorAngles[k].line2.pos[0],obj.exteriorAngles[k].line2.pos[1],7,0,2*Math.PI);
						ctx.fill();
						ctx.stroke();						
						ctx.restore();
					}
					
					if (path.selected == true) {
						ctx.fillStyle = '#F00';
						if (obj.points.length == 4 && !un(obj.polygonType)) {
							switch (k) {
								case 1: 
									if (['rhom','kite'].indexOf(obj.polygonType) > -1) {
										ctx.fillStyle = '#66F';
									}
									break;
								case 2: 
									if (['rect','para'].indexOf(obj.polygonType) > -1) {
										ctx.fillStyle = '#66F';
									} else if (['trap'].indexOf(obj.polygonType) > -1) {
										ctx.fillStyle = '#6F6';
									}
									break;
								case 3:
									if (['rect','para','rhom','kite'].indexOf(obj.polygonType) > -1) {
										continue;
									} else if (['trap'].indexOf(obj.polygonType) > -1) {
										ctx.fillStyle = '#6F6';
									}
									break;
							}									
						}
						ctx.beginPath();
						ctx.arc(obj.points[k][0],obj.points[k][1],7,0,2*Math.PI);
						ctx.fill();
						ctx.stroke();
					}		
				}
				if (path.selected && obj.solidType == 'prism') {
					var prismVector = obj.prismVector || [40,-40];
					var prismPoint = pointAddVector(obj.points[0],prismVector);
					ctx.fillStyle = '#F0F';
					ctx.beginPath();
					ctx.arc(prismPoint[0],prismPoint[1],7,0,2*Math.PI);
					ctx.fill();
					ctx.stroke();					
				}
				ctx.restore();
			}			
			break;
		case 'anglesAroundPoint':
			drawPathAnglesAroundPoint(ctx,obj,sf);
			if (path.obj.length == 1) {
				ctx.save();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.fillStyle = '#F00';
				var angleObj = {ctx:ctx,drawLines:false,radius:30,lineColor:colorA(obj.color,0.3),labelMeasure:true,labelFontSize:25,labelRadius:33,labelColor:colorA(obj.color,0.3),lineWidth:2};
				for (var k = 0; k < obj.points.length; k++) {
					if ((path.selected == true || (obj.drawing == true && k > 0 && k < obj.points.length-1)) && typeof obj.angles[k] !== 'object') {
						angleObj.b = obj.center;
						angleObj.a = obj.points[k];
						if (k == obj.points.length-1) {
							angleObj.c = obj.points[0];
						} else {
							angleObj.c = obj.points[k+1];
						}
						drawAngle(angleObj);		
					}
					if (path.selected == true) {
						ctx.beginPath();
						ctx.arc(obj.points[k][0],obj.points[k][1],7,0,2*Math.PI);
						ctx.fill();
						ctx.stroke();
					}
				}
				ctx.restore();
			}			
			break;			
		case 'multChoice' :
			drawPathMultChoice(ctx,obj,path.pointerEvents,sf);
			for (var m = 0; m < obj.mInputs.length; m++) {
				if (path.selected == true) {
					if (obj.mInputs[m].stringJS == '' && obj.mInputs[m].border == false) {
						obj.mInputs[m].border = true;
						drawMathsInputText(obj.mInputs[m]);
					}
				} else {
					if (obj.mInputs[m].border == true) {
						obj.mInputs[m].border = false;						
						drawMathsInputText(obj.mInputs[m]);
					}
				}
				setMathsInputZIndex(obj.mInputs[m],zIndex+1);				
			}					
			break;
	}
}
function drawPathArc(ctx,obj,sf) {
	if (typeof sf == 'undefined') sf = 1;
	ctx.save();
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness * sf;
	if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
	if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';	
	ctx.beginPath();
	if (obj.clockwise == true) {
		ctx.arc(obj.center[0]*sf,obj.center[1]*sf,obj.radius*sf,obj.startAngle,obj.finAngle);
	} else {
		ctx.arc(obj.center[0]*sf,obj.center[1]*sf,obj.radius*sf,obj.finAngle,obj.startAngle);				
	}
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.restore();
}
function drawPathPen(ctx,obj,sf) {
	if (typeof sf == 'undefined') sf = 1;
	ctx.save();
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness * sf;
	if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
	if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';	
	var pos = [];
	for (var p = 0; p < obj.pos.length; p++) {
		pos[p] = [];
		pos[p][0] = roundToNearest(obj.pos[p][0]*sf,0.01);
		pos[p][1] = roundToNearest(obj.pos[p][1]*sf,0.01);
	}
	if (pos.length > 2) {
		ctx.beginPath();
		ctx.moveTo(pos[0][0],pos[0][1]);
		for (var p = 1; p < pos.length - 2; p++) {
			ctx.quadraticCurveTo(pos[p][0],pos[p][1],(pos[p][0]+pos[p+1][0])/2,(pos[p][1]+pos[p+1][1])/2);					
		}
		if (pos.length > p+1) ctx.quadraticCurveTo(pos[p][0],pos[p][1],pos[p+1][0],pos[p+1][1]);
		ctx.stroke();
	} else if (pos.length == 2) {
		ctx.beginPath();	
		ctx.moveTo(pos[0][0],pos[0][1]);
		ctx.lineTo(pos[1][0],pos[1][1]);
		ctx.stroke();
	} else if (pos.length == 1) {
		ctx.beginPath();
		ctx.arc(pos[0][0],pos[0][1],ctx.lineWidth/2,0,2*Math.PI);
		ctx.fillStyle = ctx.strokeStyle;
		ctx.fill();
	}

	ctx.setLineDash([]);
	ctx.restore();	
}
function drawPathLine(ctx,obj,sf) {
	if (typeof obj.finPos !== 'undefined') {
		if (typeof sf == 'undefined') sf = 1;
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness * sf;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
		if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';	
		ctx.beginPath();
		ctx.moveTo(obj.startPos[0]*sf,obj.startPos[1]*sf);
		ctx.lineTo(obj.finPos[0]*sf,obj.finPos[1]*sf);				
		ctx.stroke();
		
		if (obj.endStart == 'open') {
			drawArrow({context:ctx,startX:obj.finPos[0]*sf,startY:obj.finPos[1]*sf,finX:obj.startPos[0]*sf,finY:obj.startPos[1]*sf,arrowLength:obj.endStartSize*sf,color:ctx.strokeStyle,lineWidth:ctx.lineWidth*sf,arrowLineWidth:ctx.lineWidth*sf});
		}
		if (obj.endStart == 'closed') {
			drawArrow({context:ctx,startX:obj.finPos[0]*sf,startY:obj.finPos[1]*sf,finX:obj.startPos[0]*sf,finY:obj.startPos[1]*sf,arrowLength:obj.endStartSize*sf,color:ctx.strokeStyle,lineWidth:ctx.lineWidth*sf,arrowLineWidth:ctx.lineWidth*sf,fillArrow:true});
		}
		
		if (obj.endMid == 'dash') {
			drawDash(ctx,obj.startPos[0]*sf,obj.startPos[1]*sf,obj.finPos[0]*sf,obj.finPos[1]*sf,8*sf);
		}
		if (obj.endMid == 'dash2') {
			drawDoubleDash(ctx,obj.startPos[0]*sf,obj.startPos[1]*sf,obj.finPos[0]*sf,obj.finPos[1]*sf,8*sf);
		}				
		if (obj.endMid == 'open') {
			drawParallelArrow({context:ctx,startX:obj.startPos[0]*sf,startY:obj.startPos[1]*sf,finX:obj.finPos[0]*sf,finY:obj.finPos[1]*sf,arrowLength:obj.endMidSize*sf,lineWidth:ctx.lineWidth*sf});
		}
		if (obj.endMid == 'open2') {
			drawParallelArrow({context:ctx,startX:obj.startPos[0]*sf,startY:obj.startPos[1]*sf,finX:obj.finPos[0]*sf,finY:obj.finPos[1]*sf,arrowLength:obj.endMidSize*sf,lineWidth:ctx.lineWidth*sf,numOfArrows:2});
		}
		
		if (obj.endFin == 'open') {
			drawArrow({context:ctx,startX:obj.startPos[0]*sf,startY:obj.startPos[1]*sf,finX:obj.finPos[0]*sf,finY:obj.finPos[1]*sf,arrowLength:obj.endFinSize*sf,color:ctx.strokeStyle,lineWidth:ctx.lineWidth*sf,arrowLineWidth:ctx.lineWidth*sf});
		}
		if (obj.endFin == 'closed') {
			drawArrow({context:ctx,startX:obj.startPos[0]*sf,startY:obj.startPos[1]*sf,finX:obj.finPos[0]*sf,finY:obj.finPos[1]*sf,arrowLength:obj.endFinSize*sf,color:ctx.strokeStyle,lineWidth:ctx.lineWidth*sf,arrowLineWidth:ctx.lineWidth*sf,fillArrow:true});
		}
		ctx.setLineDash([]);
		ctx.restore();
		
		return [
			Math.min(obj.startPos[0],obj.finPos[0])-10,
			Math.min(obj.startPos[1],obj.finPos[1])-10,
			Math.abs(obj.startPos[0]-obj.finPos[0])+20,
			Math.abs(obj.startPos[1]-obj.finPos[1])+20,
		];
	}
}
function drawPathCurve(ctx,obj,sf) {
	if (typeof sf == 'undefined') sf = 1;
	ctx.save();
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness * sf;
	if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
	if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';	
	ctx.beginPath();
	ctx.moveTo(obj.startPos[0]*sf,obj.startPos[1]*sf);
	ctx.quadraticCurveTo(obj.controlPos[0]*sf,obj.controlPos[1]*sf,obj.finPos[0]*sf,obj.finPos[1]*sf);				
	ctx.stroke();				

	obj.mid1 = midpoint(obj.startPos[0]*sf,obj.startPos[1]*sf,obj.controlPos[0]*sf,obj.controlPos[1]*sf);
	obj.mid2 = midpoint(obj.finPos[0]*sf,obj.finPos[1]*sf,obj.controlPos[0]*sf,obj.controlPos[1]*sf);
	obj.vertex = midpoint(obj.mid1[0]*sf,obj.mid1[1]*sf,obj.mid2[0]*sf,obj.mid2[1]*sf);
	
	obj.points = getBezierPoints([obj.startPos[0]*sf,obj.startPos[1]*sf],[obj.controlPos[0]*sf,obj.controlPos[1]*sf],[obj.finPos[0]*sf,obj.finPos[1]*sf],30);

	if (obj.endStart == 'open') {
		drawArrow({context:ctx,startX:obj.controlPos[0]*sf,startY:obj.controlPos[1]*sf,finX:obj.startPos[0]*sf,finY:obj.startPos[1]*sf,arrowLength:obj.endStartSize*sf,color:ctx.strokeStyle,lineWidth:0,arrowLineWidth:ctx.lineWidth,showLine:false});
	}
	if (obj.endStart == 'closed') {
		drawArrow({context:ctx,startX:obj.controlPos[0]*sf,startY:obj.controlPos[1]*sf,finX:obj.startPos[0]*sf,finY:obj.startPos[1]*sf,arrowLength:obj.endStartSize*sf,color:ctx.strokeStyle,lineWidth:0,arrowLineWidth:ctx.lineWidth,fillArrow:true,showLine:false});
	}
	
	if (obj.endMid == 'open') {
		drawParallelArrow({context:ctx,startX:obj.mid1[0],startY:obj.mid1[1],finX:obj.mid2[0],finY:obj.mid2[1],arrowLength:obj.endMidSize*sf,lineWidth:ctx.lineWidth*sf});
	}
	
	if (obj.endFin == 'open') {
		drawArrow({context:ctx,startX:obj.controlPos[0]*sf,startY:obj.controlPos[1]*sf,finX:obj.finPos[0]*sf,finY:obj.finPos[1]*sf,arrowLength:obj.endFinSize*sf,color:ctx.strokeStyle,lineWidth:0,arrowLineWidth:ctx.lineWidth,showLine:false});
	}
	if (obj.endFin == 'closed') {
		drawArrow({context:ctx,startX:obj.controlPos[0]*sf,startY:obj.controlPos[1]*sf,finX:obj.finPos[0]*sf,finY:obj.finPos[1]*sf,arrowLength:obj.endFinSize*sf,color:ctx.strokeStyle,lineWidth:0,arrowLineWidth:ctx.lineWidth,fillArrow:true,showLine:false});
	}
	ctx.setLineDash([]);
	ctx.restore();	
}
function drawPathCurve2(ctx,obj,sf) {
	if (typeof sf == 'undefined') sf = 1;
	ctx.save();
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness * sf;
	if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
	if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';	
	ctx.beginPath();
	ctx.moveTo(obj.startPos[0]*sf,obj.startPos[1]*sf);
	ctx.bezierCurveTo(obj.controlPos1[0]*sf,obj.controlPos1[1]*sf,obj.controlPos2[0]*sf,obj.controlPos2[1]*sf,obj.finPos[0]*sf,obj.finPos[1]*sf);				
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.restore();
}
function drawPathRect(ctx,obj,sf) {
	if (typeof obj.finPos !== 'undefined') {
		if (typeof sf == 'undefined') sf = 1;
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness * sf;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
		if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';			
		if (obj.fillColor !== 'none') {					
			ctx.fillStyle = obj.fillColor;
			ctx.fillRect(obj.startPos[0]*sf,obj.startPos[1]*sf,obj.finPos[0]*sf-obj.startPos[0]*sf,obj.finPos[1]*sf-obj.startPos[1]*sf);
		}
		ctx.strokeRect(obj.startPos[0]*sf,obj.startPos[1]*sf,obj.finPos[0]*sf-obj.startPos[0]*sf,obj.finPos[1]*sf-obj.startPos[1]*sf);
		ctx.setLineDash([]);
		ctx.restore();
	}
}
function drawPathPolygon(ctx,obj,sf) {
	if (typeof sf == 'undefined') sf = 1;
	ctx.save();
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness * sf;
	if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
	if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));
	if (obj.points.length > 1) {
		var obj2 = clone(obj);
		for (var p = 0; p < obj2.points.length; p++) {
			obj2.points[p][0] = obj2.points[p][0]*sf;
			obj2.points[p][1] = obj2.points[p][1]*sf;
		}
		if (typeof obj2.angles !== 'undefined') {
			for (var a = 0; a < obj2.angles.length; a++) {
				if (typeof obj2.angles[a] == 'object' && obj2.angles[a] !== null) {
					if (typeof obj2.angles[a].lineWidth !== 'undefined') {
						obj2.angles[a].lineWidth = obj2.angles[a].lineWidth*sf;
					}
					if (typeof obj2.angles[a].labelRadius !== 'undefined') {
						obj2.angles[a].labelRadius = obj2.angles[a].labelRadius*sf;
					}
					if (typeof obj2.angles[a].labelFontSize !== 'undefined') {
						obj2.angles[a].labelFontSize = obj2.angles[a].labelFontSize*sf;
					}
					if (typeof obj2.angles[a].radius !== 'undefined') {
						obj2.angles[a].radius = obj2.angles[a].radius*sf;
					}					
				}
			}
		}
		obj2.thickness = obj2.thickness*sf;
		obj2.sf = sf;
		obj2.ctx = ctx;
		drawPolygon(obj2);
	}
	ctx.setLineDash([]);
	ctx.restore();	
}
function drawPathImage(ctx,obj,sf) {
	if (typeof sf == 'undefined') sf = 1;
	ctx.drawImage(obj.image,obj.left*sf,obj.top*sf,obj.width*sf,obj.height*sf);
}
function drawPathButton(ctx,obj,flatten,sf) {
	if (typeof sf == 'undefined') sf = 1;	
	ctx.save();	
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness*sf;
	if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
	if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));	
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';	
	ctx.fillStyle = obj.fillColor;
	ctx.fillRect(obj.left*sf,obj.top*sf,obj.width*sf,obj.height*sf);
	ctx.strokeRect(obj.left*sf,obj.top*sf,obj.width*sf,obj.height*sf);
	ctx.setLineDash([]);
	ctx.restore();	
	if (boolean(flatten,false) == true) {
		obj.mathsInput.canvas.data = obj.mathsInput.data
		flattenCanvases(ctx.canvas,obj.mathsInput.canvas);
	}
}
function drawPathInput(ctx,obj,flatten,sf) {
	if (typeof sf == 'undefined') sf = 1;			
	if (typeof obj.mode == 'undefined' || obj.mode == 'edit') {
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness*sf;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';	
		ctx.fillStyle = obj.fillColor;
		ctx.fillRect(obj.left*sf,obj.top*sf,obj.width*sf,obj.height*sf);
		ctx.strokeRect(obj.left*sf,obj.top*sf,obj.width*sf,obj.height*sf);
	}
	if (boolean(flatten,false) == true) {
		obj.mathsInput.canvas.data = obj.mathsInput.data
		flattenCanvases(ctx.canvas,obj.mathsInput.canvas);
		obj.leftInput.canvas.data = obj.leftInput.data
		flattenCanvases(ctx.canvas,obj.leftInput.canvas);
		obj.rightInput.canvas.data = obj.rightInput.data
		flattenCanvases(ctx.canvas,obj.rightInput.canvas);
	}
}
function drawPathCircle(ctx,obj,showCenter,sf) {
	if (typeof sf == 'undefined') sf = 1;
	ctx.save();
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness * sf;
	if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
	if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';	
	if (typeof obj.fillColor !== 'undefined' && obj.fillColor !== 'none') {
		ctx.fillStyle = obj.fillColor;
		ctx.beginPath();
		ctx.arc(obj.center[0]*sf,obj.center[1]*sf,obj.radius*sf,0,2*Math.PI);
		ctx.fill();
	}
	if (showCenter == true) {
		ctx.save();
		ctx.fillStyle = '#000';
		ctx.beginPath();
		ctx.arc(obj.center[0]*sf,obj.center[1]*sf,3*sf,0,2*Math.PI);
		ctx.fill();
		ctx.restore();
	}
	ctx.beginPath();
	ctx.arc(obj.center[0]*sf,obj.center[1]*sf,obj.radius*sf,0,2*Math.PI);
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.restore();	
}
function drawPathEllipse(ctx,obj,showCenter,sf) {
	if (typeof sf == 'undefined') sf = 1;
	ctx.save();
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness * sf;
	if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
	if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));	
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';	
	if (typeof obj.fillColor !== 'undefined' && obj.fillColor !== 'none') {
		ctx.save();
		ctx.fillStyle = obj.fillColor;
		ctx.translate(obj.center[0]*sf,obj.center[1]*sf);
		if (obj.radiusX >= obj.radiusY) {
			ctx.scale(obj.radiusX/obj.radiusY,1);
			ctx.beginPath();
			ctx.arc(0,0,obj.radiusY*sf,0,2*Math.PI);
		} else {
			ctx.scale(1,obj.radiusY/obj.radiusX);
			ctx.beginPath();
			ctx.arc(0,0,obj.radiusX*sf,0,2*Math.PI);					
		}
		ctx.fill();
		ctx.restore();
	}				
	if (showCenter == true) {
		ctx.save();
		ctx.fillStyle = '#000';
		ctx.beginPath();
		ctx.arc(obj.center[0]*sf,obj.center[1]*sf,3*sf,0,2*Math.PI);
		ctx.fill();
		ctx.restore();
	}
	ctx.save();
	ctx.translate(obj.center[0]*sf,obj.center[1]*sf);
	if (obj.radiusX >= obj.radiusY) {
		ctx.scale(obj.radiusX/obj.radiusY,1);
		ctx.beginPath();
		ctx.arc(0,0,obj.radiusY*sf,0,2*Math.PI);
	} else {
		ctx.scale(1,obj.radiusY/obj.radiusX);
		ctx.beginPath();
		ctx.arc(0,0,obj.radiusX*sf,0,2*Math.PI);
	}
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.restore();	
}
function drawPathText(ctx,obj,flatten) {
	if (boolean(obj.showBorder,false) == true) {
		drawPathTextBorder(ctx,obj,sf);
	}	
	if (flatten == true) {
		obj.mathsInput.canvas.data = obj.mathsInput.data
		flattenCanvases(ctx.canvas,obj.mathsInput.canvas);
	}
}
function drawPathTextBorder(ctx,obj,sf) {
	var obj2 = clone(obj);
	obj2.sf = sf;
	ctx.rect2(obj2);
}
function drawPathTable(ctx,obj) {} // works differently
function drawPathGrid(ctx,obj,sf,backColor,backColorFill) {
	if (typeof sf == 'undefined') sf = 1;
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness*sf;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';	
	if (typeof backColor == 'undefined') backColor = mainCanvasFillStyle;
	if (boolean(backColorFill,true) == true) {
		ctx.fillStyle = backColor;
		ctx.fillRect(obj.left*sf,obj.top*sf,obj.width*sf,obj.height*sf);
	}
	var obj2 = clone(obj);
	obj2.showGrid = boolean(obj.showGrid,true);
	obj2.showScales = boolean(obj.showScales,true);
	obj2.showLabels = boolean(obj.showLabels,true);
	obj2.backColor = backColor;
	obj2.sf = sf;
	obj2.left = obj2.left*sf;
	obj2.top = obj2.top*sf;
	obj2.width = obj2.width*sf;
	obj2.height = obj2.height*sf;
	
	drawGrid3(ctx,0,0,obj2);

	if (typeof obj2.points =='object') {
		for (var p = 0; p < obj2.points.length; p++) {
			drawCoord(ctx,0,0,obj2,obj.points[p][0],obj.points[p][1],getShades(mainCanvasFillStyle,true)[12]);
		}
	}
	if (typeof obj2.lineSegments =='object') {
		var showPoints = false;
		for (var p = 0; p < obj2.lineSegments.length; p++) {
			if (typeof obj2.lineSegments[p][1] !== 'undefined' && obj2.lineSegments[p][1].length == 2) {
				if (obj2.drawing == 'lineSegment' && p == obj2.lineSegments.length-1) showPoints = true;
				drawLine(ctx,0,0,obj2,obj2.lineSegments[p][0][0],obj2.lineSegments[p][0][1],obj2.lineSegments[p][1][0],obj2.lineSegments[p][1][1],getShades(mainCanvasFillStyle,true)[12],2,showPoints,true);
			}
		}
	}
	if (typeof obj2.lines =='object') {
		var showPoints = false;
		for (var p = 0; p < obj2.lines.length; p++) {
			if (typeof obj2.lines[p][1] !== 'undefined' && obj2.lines[p][1].length == 2) {
				if (obj2.drawing == 'line' && p == obj2.lines.length-1) showPoints = true;
				drawLine(ctx,0,0,obj2,obj2.lines[p][0][0],obj2.lines[p][0][1],obj2.lines[p][1][0],obj2.lines[p][1][1],getShades(mainCanvasFillStyle,true)[12],2,showPoints,false);
			}
		}
	}
	if (typeof obj2.funcs =='object') {
		for (var f = 0; f < obj2.funcs.length; f++) {
			obj2.funcs[f].funcPoints = calcFunc(obj2,obj2.funcs[f].funcString);
			drawFunc(ctx,0,0,obj,obj2.funcs[f].funcPoints);
		}
	}

	if (typeof obj2.path =='object') {
		for (var p = 0; p < obj2.path.length; p++) {
			var obj3 = obj2.path[p];
			switch (obj3.type) {
				case 'point':
					//drawCoord(gridctx,0,0,gridDetails,obj.pos[0],obj.pos[1],obj.color);
					break;
				case 'line':
				case 'lineSegment':			
					/*if (obj.pos[0].length == 0) {
						if (obj.pos[1].length == 0) {
							continue;	
						} else {
							drawCoord(gridctx,0,0,gridDetails,obj.pos[1][0],obj.pos[1][1],obj.color);
						}
					} else if (obj.pos[1].length == 0) {
						drawCoord(gridctx,0,0,gridDetails,obj.pos[0][0],obj.pos[0][1],obj.color);	
					}
					if (obj.pos[0][0] == obj.pos[1][0] && obj.pos[0][1] == obj.pos[1][1]) {
						drawCoord(gridctx,0,0,gridDetails,obj.pos[0][0],obj.pos[0][1],obj.color);	
					} else {
						if (typeof obj.dashSize == 'undefined') obj.dashSize = [0,0];
						if (obj.type == 'line') {
							obj.endPos = drawLine(gridctx,0,0,gridDetails,obj.pos[0][0],obj.pos[0][1],obj.pos[1][0],obj.pos[1][1],obj.color,3,false,false,true,obj.dashSize[0],obj.dashSize[1]);
						} else if (obj.type == 'lineSegment') {
							drawLine(gridctx,0,0,gridDetails,obj.pos[0][0],obj.pos[0][1],obj.pos[1][0],obj.pos[1][1],obj.color,3,false,true,true,obj.dashSize[0],obj.dashSize[1]);
						}
					}*/			
					break;
				case 'function':
					if (obj2.angleMode == 'rad') {
						obj3.funcPos = calcFunc2(obj2,obj3.funcRad);
					} else {
						obj3.funcPos = calcFunc2(obj2,obj3.funcDeg);
					}
					obj3.pos = drawFunc(ctx,0,0,obj2,obj3.funcPos,obj3.color);
					break;
				case 'function2':
					/*if (gridDetails.angleMode == 'rad') {
						//jxxplotFunc4(ctx,gridDetails,obj.funcRad,10,obj.color);
					} else {
						jxxplotFunc4(ctx,gridDetails,obj.funcDeg,10,obj.color);
					}*/			
					break;				
			}
		}
	}	
}
function drawPathAngle(ctx,obj,sf) {
	if (typeof sf == 'undefined') sf = 1;				
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness*sf;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';	
	var obj2 = clone(obj);
	obj2.ctx = ctx;
	obj2.sf = sf;
	drawAngle(obj2);
}
function drawPathMultChoice(ctx,obj,pointerEvents,sf) {
	if (typeof sf == 'undefined') sf = 1;	
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness*sf;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';	
	for (var m = 0; m < obj.rows*obj.cols; m++) {
		if (obj.correctCell == m && obj.mode == 'edit') {
			ctx.fillStyle = obj.correctFillColor;
		} else if (obj.selectedCell == m) {
			if (boolean(obj.pointerEvents,true) == true) {
				ctx.fillStyle = '#3FF';
			} else {
				ctx.fillStyle = '#3EE';
			}
		} else {
			if (boolean(obj.pointerEvents,true) == true) {
				ctx.fillStyle = obj.fillColor;
			} else {
				ctx.fillStyle = '#DDD';
			}
		}
		var l = obj.left*sf + (m % obj.cols) * (obj.cellWidth*sf + obj.spacing*sf);
		var t = obj.top*sf + Math.floor(m / obj.cols) * (obj.cellHeight*sf + obj.spacing*sf);
		ctx.fillRect(l,t,obj.cellWidth*sf,obj.cellHeight*sf);
		ctx.strokeRect(l,t,obj.cellWidth*sf,obj.cellHeight*sf);			
	}
}
function drawPathAnglesAroundPoint(ctx,obj,sf) {
	if (typeof sf == 'undefined') sf = 1;
	ctx.save();
	ctx.strokeStyle = obj.color;
	ctx.lineWidth = obj.thickness * sf;
	if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function() {};
	if (typeof obj.dash !== 'undefined') ctx.setLineDash(enlargeDash(clone(obj.dash),sf));
	if (obj.points.length > 1) {
		var obj2 = clone(obj);
		for (var p = 0; p < obj2.points.length; p++) {
			obj2.points[p][0] = obj2.points[p][0]*sf;
			obj2.points[p][1] = obj2.points[p][1]*sf;
		}
		if (typeof obj2.angles !== 'undefined') {
			for (var a = 0; a < obj2.angles.length; a++) {
				if (typeof obj2.angles[a] == 'object' && obj2.angles[a] !== null) {
					if (typeof obj2.angles[a].lineWidth !== 'undefined') {
						obj2.angles[a].lineWidth = obj2.angles[a].lineWidth*sf;
					}
					if (typeof obj2.angles[a].labelRadius !== 'undefined') {
						obj2.angles[a].labelRadius = obj2.angles[a].labelRadius*sf;
					}
					if (typeof obj2.angles[a].labelFontSize !== 'undefined') {
						obj2.angles[a].labelFontSize = obj2.angles[a].labelFontSize*sf;
					}
					if (typeof obj2.angles[a].radius !== 'undefined') {
						obj2.angles[a].radius = obj2.angles[a].radius*sf;
					}					
				}
			}
		}
		obj2.center = [obj.center[0]*sf,obj.center[1]*sf];
		obj2.thickness = obj2.thickness*sf;
		obj2.sf = sf;
		obj2.ctx = ctx;
		drawAnglesAroundPoint(obj2);
	}
	ctx.setLineDash([]);
	ctx.restore();		
}

/***************************/
/*					  	   */
/*   KEYBOARD SHORTCUTS    */
/*				  	  	   */
/***************************/

var shiftOn = false;
var ctrlOn = false;
var altOn = false;
window.addEventListener('keydown', keydown, false);
function keydown(e) {
	if (e.keyCode == 16) {
		shiftOn = true;
	} else if (e.keyCode == 17) {
		ctrlOn = true;
	} else	if (e.keyCode == 18) {
		altOn = true;
	}
}
window.addEventListener('keyup', keyup ,false);
function keyup(e) {
	if (e.keyCode == 16) {
		shiftOn = false;
	} else if (e.keyCode == 17) {
		ctrlOn = false;
	} else	if (e.keyCode == 18) {
		altOn = false;
	}
}
function addKeyboardShortcuts() {
	window.addEventListener('keydown', keydown1, false);
	//window.addEventListener('keyup', keyup1, false);
}
function removeKeyboardShortcuts() {
	window.removeEventListener('keydown', keydown1, false);
	//window.removeEventListener('keyup', keyup1, false);
}
function keydown1(e) {
	//console.log(e.keyCode);
	if (e.getModifierState('Control')) {
		if (e.keyCode == 88 && inputState == false) { // x
			e.preventDefault();
			cutPaths();
		} else if (e.keyCode == 67 && inputState == false) { // c
			e.preventDefault();
			copyPaths();
		} else if (e.keyCode == 86 && inputState == false) { // v
			e.preventDefault();
			pastePaths();
		} else if (e.keyCode == 66) { // b
			e.preventDefault();
			fontBold();
		} else if (e.keyCode == 73) { // i
			e.preventDefault();
			fontItalic();
		} else if (e.keyCode == 71) { // g
			e.preventDefault();
			groupPaths();
		} else if (e.keyCode == 85) { // u
			e.preventDefault();
			ungroupPaths();
		} else if (e.keyCode == 84) { // t
			e.preventDefault();
			addTitle();
		} else if (e.keyCode == 68) { // d
			e.preventDefault();
			clonePaths();
		} else if (e.keyCode == 65) { // a
			e.preventDefault();
			selectAllPaths();
		} else if (e.keyCode == 38) { // up
			e.preventDefault();
			fontSizeUp();
		} else if (e.keyCode == 40) { // down
			e.preventDefault();
			fontSizeDown();
		} else if (e.keyCode == 46) { // delete
			e.preventDefault();
			deleteSelectedPaths();			
		}
	} else if (e.getModifierState('Shift')) {
		if (e.keyCode == 37 && inputState == false) { // left
			e.preventDefault();
			movePaths(-5,0);
		} else if (e.keyCode == 38 && inputState == false) { // up
			e.preventDefault();
			movePaths(0,-5);
		} else if (e.keyCode == 39 && inputState == false) { // right
			e.preventDefault();
			movePaths(5,0);
		} else if (e.keyCode == 40 && inputState == false) { // down
			e.preventDefault();
			movePaths(0,5);
		}
	} else if (e.getModifierState('Alt')) {
		if (e.keyCode == 37 && inputState == false) { // left
			e.preventDefault();
			movePaths(-1,0);
		} else if (e.keyCode == 38 && inputState == false) { // up
			e.preventDefault();
			movePaths(0,-1);
		} else if (e.keyCode == 39 && inputState == false) { // right
			e.preventDefault();
			movePaths(1,0);
		} else if (e.keyCode == 40 && inputState == false) { // down
			e.preventDefault();
			movePaths(0,1);
		} else if (e.keyCode == 76) { // l
			e.preventDefault();
			alignPaths('left');
		} else if (e.keyCode == 67) { // c
			e.preventDefault();
			alignPaths('center');
		} else if (e.keyCode == 82) { // r
			e.preventDefault();
			alignPaths('right');
		} else if (e.keyCode == 84) { // t
			e.preventDefault();
			alignPaths('top');
		} else if (e.keyCode == 77) { // m
			e.preventDefault();
			alignPaths('middle');
		} else if (e.keyCode == 66) { // b
			e.preventDefault();
			alignPaths('bottom');
		}
	}		
}

/***************************/
/*					  	   */
/*	 	DRAWING OBJECTS    */
/*				  	  	   */
/***************************/

function drawClickStartDraw() { // handle mousedown to start drawing pen,line,rect,square,circle,ellipse,polygon
	//console.log('drawClickStartDraw');
	//deselectTables();
	deselectAllPaths(false);
	updateSnapPoints(); // update intersection points
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];
	if (ctrlOn) {
		var pos = snapToObj2([x,y]);
		x = pos[0];
		y = pos[1];
	}
	switch (draw[taskId].drawMode) {
		case 'pen':
			draw[taskId].drawing = true;
			draw[taskId].prevX = x;
			draw[taskId].prevY = y;
			draw[taskId].path.push({obj:[{
				type:'pen',
				color:draw[taskId].color,
				thickness:draw[taskId].thickness,
				pos:[[x,y]]
			}],selected:false,time:Date.parse(new Date())});
			addListenerMove(window,penDrawMove);
			addListenerEnd(window,penDrawStop);
			break;
		case 'line':
			// if too many lines, delete oldest
			var lineCount = 0;
			for (var i = draw[taskId].path.length - 1; i >= 0; i--) {
				for (var o = 0; o < draw[taskId].path[i].obj.length; o++) {
					if (draw[taskId].path[i].obj[o].type == 'line') {
						lineCount++;
						if (lineCount >= draw[taskId].maxLines) {
							draw[taskId].path.splice(i,1);
						}
					}
				}
			}
			var point = [x,y];
			if (draw[taskId].snap == true) {
				updateSnapPoints();
				point = snapToPoints(point,draw[taskId].snapPoints,draw[taskId].snapTolerance);
			} else if (draw[taskId].gridSnap == true) {
				//startX = roundToNearest(startX,draw[taskId].gridSnapSize);
				//startY = roundToNearest(startY,draw[taskId].gridSnapSize);
			}
			if (ctrlOn) {
				point = snapToObj2(point,-1);
			}

			draw[taskId].drawing = true;
			draw[taskId].startX = point[0];
			draw[taskId].startY = point[1];
			draw[taskId].path.push({obj:[{
				type:'line',
				color:draw[taskId].color,
				thickness:draw[taskId].thickness,
				startPos:point,
				drawing:true
			}],selected:false});
			addListenerMove(window,lineDrawMove);
			addListenerEnd(window,lineDrawStop);		
			break;
		case 'rect' :
		case 'square' :
			var startX = x;
			var startY = y;
			if (draw[taskId].gridSnap == true) {
				startX = roundToNearest(startX,draw[taskId].gridSnapSize);
				startY = roundToNearest(startY,draw[taskId].gridSnapSize);
			}
			draw[taskId].drawing = true;
			draw[taskId].startX = startX;
			draw[taskId].startY = startY;					
			draw[taskId].path.push({obj:[{
				type:draw[taskId].drawMode,
				color:draw[taskId].color,
				thickness:draw[taskId].thickness,
				fillColor:draw[taskId].fillColor,
				startPos:[startX,startY],
				edit:false
			}],selected:false});
			addListenerMove(window,rectDrawMove);
			addListenerEnd(window,rectDrawStop);		
			break;
		case 'polygon' :
			var pos = [x,y];
			if (draw[taskId].gridSnap == true) {
				pos = [roundToNearest(startX,draw[taskId].gridSnapSize),roundToNearest(startY,draw[taskId].gridSnapSize)];
			}
			if (ctrlOn) {
				pos = snapToObj2(pos,-1);
			}
			draw[taskId].drawing = true;
			draw[taskId].startX = startX;
			draw[taskId].startY = startY;					
			draw[taskId].path.push({obj:[{
				type:draw[taskId].drawMode,
				color:draw[taskId].color,
				thickness:draw[taskId].thickness,
				fillColor:draw[taskId].fillColor,
				points:[pos,[]],
				closed:false,
				lineDecoration:[],
				angles:[],
				clockwise:true,
				edit:false,
				drawing:true
			}],selected:false});
			//console.log(draw[taskId].path[draw[taskId].path.length-1]);
			changeDrawMode('polygon-drawing');
			addListenerMove(window,polygonDrawMove);
			addListenerEnd(window,polygonDrawStop);
			break;			
		case 'circle' :
			var startX = x;
			var startY = y;
			if (draw[taskId].gridSnap == true) {
				startX = roundToNearest(startX,draw[taskId].gridSnapSize);
				startY = roundToNearest(startY,draw[taskId].gridSnapSize);
			}
			draw[taskId].drawing = true;
			draw[taskId].startX = startX;
			draw[taskId].startY = startY;					
			draw[taskId].path.push({obj:[{
				type:draw[taskId].drawMode,
				color:draw[taskId].color,
				thickness:draw[taskId].thickness,
				fillColor:draw[taskId].fillColor,
				center:[startX,startY],
				radius:0,
				showCenter:true,
				edit:false
			}],selected:false});
			addListenerMove(window,circleDrawMove);
			addListenerEnd(window,circleDrawStop);		
			break;
		case 'ellipse' :
			var startX = x;
			var startY = y;
			if (draw[taskId].gridSnap == true) {
				startX = roundToNearest(startX,draw[taskId].gridSnapSize);
				startY = roundToNearest(startY,draw[taskId].gridSnapSize);
			}
			draw[taskId].drawing = true;
			draw[taskId].startX = startX;
			draw[taskId].startY = startY;					
			draw[taskId].path.push({obj:[{
				type:draw[taskId].drawMode,
				color:draw[taskId].color,
				thickness:draw[taskId].thickness,
				fillColor:draw[taskId].fillColor,
				center:[startX,startY],
				radiusX:0,
				radiusY:0,
				showCenter:true,
				edit:false
			}],selected:false});
			addListenerMove(window,ellipseDrawMove);
			addListenerEnd(window,ellipseDrawStop);		
			break;
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);
	} else {
		drawCanvasPaths();
	}
	drawSelectCanvas();	
};
function drawClickQBoxStartDraw() {
	deselectAllPaths();
	switch (draw[taskId].drawMode) {
		case 'pen':
			var b = draw[taskId].currCursor.b;
			var box = draw[taskId].qBox2.box[b];
			draw[taskId].drawing = true;
			draw[taskId].drawingQBox2 = b;
			draw[taskId].drawingQBox2Left = box[0];
			draw[taskId].drawingQBox2Top = box[1];
			draw[taskId].prevX = mouse.x - box[0];
			draw[taskId].prevY = mouse.y - box[1];
			var date = new Date();
			var time = date.getTime();
			draw[taskId].qBox2.penPaths[b].push({obj:[{
				type:'pen',
				color:draw[taskId].color,
				thickness:draw[taskId].thickness,
				time:time,
				pos:[[mouse.x-box[0],mouse.y-box[1]]]
			}],selected:false});
			addListenerMove(window,penDrawMove);
			addListenerEnd(window,penDrawStop);
			break;
	}			
}
function penDrawMove(e) {
	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];
	if (x !== draw[taskId].prevX || y !== draw[taskId].prevY) {
		if (typeof draw[taskId].drawingQBox2 == 'number' && draw[taskId].drawingQBox2 > -1) {
			if (draw[taskId].qBox2.penPaths[draw[taskId].drawingQBox2].length > 0) {
				draw[taskId].qBox2.penPaths[draw[taskId].drawingQBox2][draw[taskId].qBox2.penPaths[draw[taskId].drawingQBox2].length-1].obj[0].pos.push([x - draw[taskId].drawingQBox2Left,y - draw[taskId].drawingQBox2Top]);
			}
			qBox2DrawPenPaths(draw[taskId].drawingQBox2,true);
		} else {
			draw[taskId].path.last().obj[0].pos.push([x,y]);
			if (pathCanvasMode) {
				pathCanvasDraw(draw[taskId].path.last());
			} else {
				drawCanvasPath(draw[taskId].path.length-1);
			}
		}
		draw[taskId].prevX = x;
		draw[taskId].prevY = y;		
	}
}
function penDrawStop(e) {
	removeListenerMove(window,penDrawMove);
	removeListenerEnd(window,penDrawStop);
	draw[taskId].prevX = null;
	draw[taskId].prevY = null;
	draw[taskId].drawing = false;
	if (typeof draw[taskId].drawingQBox2 == 'number' && draw[taskId].drawingQBox2 > -1) {
		qBox2DrawPenPaths(draw[taskId].drawingQBox2,false);
		delete draw[taskId].drawingQBox2;
		delete draw[taskId].drawingQBox2Left;
		delete draw[taskId].drawingQBox2Top;
	} else {
		var pathNum = draw[taskId].path.length-1;
		for (var i = draw[taskId].path.length-2; i > -1; i--) {
			if (typeof draw[taskId].path[i].obj == 'object') {
				var penPath = true;
				for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
					if (draw[taskId].path[i].obj[j].type !== 'pen') {
						penPath = false;
					}
				}
				if (penPath == true) {
					pathNum = i;
					break;
				}
			}
		}
		if (pathNum < draw[taskId].path.length-1) {
			var path = draw[taskId].path[pathNum];
			path.obj.push(draw[taskId].path[draw[taskId].path.length-1].obj[0]);
			if (pathCanvasMode) {
				pathCanvasDraw(path);
			}
			removePathObject(draw[taskId].path.length-1);
		} else {
			var path = draw[taskId].path[draw[taskId].path.length-1];
		}
		var x1 = path.obj[0].pos[0][0];
		var y1 = path.obj[0].pos[0][1];
		var x2 = path.obj[0].pos[0][0];
		var y2 = path.obj[0].pos[0][1];
		for (var i = 0; i < path.obj[0].pos.length; i++) {
			x1 = Math.min(x1,path.obj[0].pos[i][0]);
			y1 = Math.min(y1,path.obj[0].pos[i][1]);
			x2 = Math.max(x1,path.obj[0].pos[i][0]);
			y2 = Math.max(y1,path.obj[0].pos[i][1]);		
		}
		path.obj[0].left = x1;
		path.obj[0].top = y1;
		path.obj[0].width = x2-x1;
		path.obj[0].height = y2-y1;
		updateBorder(path);
		if (pathCanvasMode) {
			drawSelectCanvas();
		} else {
			drawCanvasPaths();		
		}		
	}
}
function lineDrawMove(e) {
	updateMouse(e);
	var x = Math.min(Math.max(mouse.x-draw[taskId].drawRelPos[0],draw[taskId].drawArea[0]),draw[taskId].drawArea[0]+draw[taskId].drawArea[2]);
	var y = Math.min(Math.max(mouse.y-draw[taskId].drawRelPos[1],draw[taskId].drawArea[1]),draw[taskId].drawArea[1]+draw[taskId].drawArea[3]);
	var pathNum = draw[taskId].path.length - 1;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (draw[taskId].drawMode == 'lineStart') {
		if (shiftOn) {
			if (Math.abs(obj.finPos[0]-x) < Math.abs(obj.finPos[1]-y)) {
				obj.startPos = [obj.finPos[0],y];
			} else {
				obj.startPos = [x,obj.finPos[1]];
			}
		} else if (ctrlOn || draw[taskId].snapLinesTogether) {
			obj.startPos = snapToObj2([x,y],pathNum);
		} else {
			obj.startPos = [x,y];
		}	
	} else if (draw[taskId].drawMode == 'lineFin' || draw[taskId].drawMode == 'line') {
		if (shiftOn) {
			if (Math.abs(obj.startPos[0]-x) < Math.abs(obj.startPos[1]-y)) {
				obj.finPos = [obj.startPos[0],y];
			} else {
				obj.finPos = [x,obj.startPos[1]];
			}			
		} else if (ctrlOn || draw[taskId].snapLinesTogether) {
			obj.finPos = snapToObj2([x,y],pathNum);
		} else {
			obj.finPos = [x,y];
		}			
	}
	if (pathCanvasMode) {		
		pathCanvasDraw(draw[taskId].path[pathNum]);
	} else {
		drawCanvasPath(pathNum);
		if (draw[taskId].drawMode !== 'draw') {
			updateBorder(draw[taskId].path[pathNum]);
			drawSelectCanvas();
			drawSelectCanvas2();
		}		
	}	
}
function lineDrawStop(e) {
	//console.log('lineDrawStop');
	removeListenerMove(window,lineDrawMove);
	removeListenerMove(window,rulerDrawMove1);
	removeListenerMove(window,rulerDrawMove2);	
	removeListenerEnd(window,lineDrawStop);
	draw[taskId].startX = null;
	draw[taskId].startY = null;
	draw[taskId].drawing = false;
	
	var path = draw[taskId].path.last();
	var obj = path.obj[0];
	if (typeof obj.finPos == 'undefined' || getDist(obj.startPos,obj.finPos) < 5) {
		removePathObject(draw[taskId].path.length-1);
		if (draw[taskId].defaultMode == 'select') {
			changeDrawMode();
		}
	} else {
		if (draw[taskId].gridSnap == true && shiftOn == false) {
			obj.finPos[0] = roundToNearest(obj.finPos[0],draw[taskId].gridSnapSize);
			obj.finPos[1] = roundToNearest(obj.finPos[1],draw[taskId].gridSnapSize);			
		}
		if (draw[taskId].defaultMode == 'select') {
			path.selected = true;
			updateBorder(path);
			changeDrawMode();
		} else {
			path.selected = false;
		}
		path.trigger = [];	

		for (var i = 0; i < draw[taskId].path.length; i++) {
			for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
				draw[taskId].path[i].obj[j].drawing = false;
			}
		}
		updateBorder(path);
	}
	
	redrawButtons();	
	if (pathCanvasMode) {
		draw[taskId].path.last().selected = true;
		pathCanvasDraw(draw[taskId].path.last());
		pathCanvasReset();
		drawSelectCanvas();
	} else {
		drawCanvasPaths();
	}		
}
function rectDrawMove(e) {
	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];	
	var newX = Math.min(Math.max(x,draw[taskId].drawArea[0]),draw[taskId].drawArea[0]+draw[taskId].drawArea[2]);
	var newY = Math.min(Math.max(y,draw[taskId].drawArea[1]),draw[taskId].drawArea[1]+draw[taskId].drawArea[3]);

	if (draw[taskId].drawMode == 'square') {
		var dx = newX-draw[taskId].path[draw[taskId].path.length-1].obj[0].startPos[0];
		var dy = newY-draw[taskId].path[draw[taskId].path.length-1].obj[0].startPos[1];
		if (Math.abs(dx) >= Math.abs(dy)) {
			newX = draw[taskId].path[draw[taskId].path.length-1].obj[0].startPos[0] + dx;
			newY = draw[taskId].path[draw[taskId].path.length-1].obj[0].startPos[1] + dx;
		} else {
			newX = draw[taskId].path[draw[taskId].path.length-1].obj[0].startPos[0] + dy;
			newY = draw[taskId].path[draw[taskId].path.length-1].obj[0].startPos[1] + dy;			
		}
	}

	draw[taskId].path[draw[taskId].path.length-1].obj[0].finPos = [newX,newY];
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[draw[taskId].path.length-1]);
	} else {
		drawCanvasPath(draw[taskId].path.length-1);
	}	
}
function rectDrawStop(e) {
	removeListenerMove(window,rectDrawMove);
	removeListenerEnd(window,rectDrawStop);
	draw[taskId].startX = null;
	draw[taskId].startY = null;
	draw[taskId].drawing = false;
	
	if (typeof draw[taskId].path[draw[taskId].path.length-1].obj[0].finPos == 'undefined' || dist(draw[taskId].path[draw[taskId].path.length-1].obj[0].startPos[0],draw[taskId].path[draw[taskId].path.length-1].obj[0].startPos[1],draw[taskId].path[draw[taskId].path.length-1].obj[0].finPos[0],draw[taskId].path[draw[taskId].path.length-1].obj[0].finPos[1]) < 5) {
		draw[taskId].path.pop();
	} else if (draw[taskId].gridSnap == true) {
		draw[taskId].path[draw[taskId].path.length-1].obj[0].finPos[0] = roundToNearest(draw[taskId].path[draw[taskId].path.length-1].obj[0].finPos[0],draw[taskId].gridSnapSize);
		draw[taskId].path[draw[taskId].path.length-1].obj[0].finPos[1] = roundToNearest(draw[taskId].path[draw[taskId].path.length-1].obj[0].finPos[1],draw[taskId].gridSnapSize);
	}
	
	changeDrawMode();
	draw[taskId].path[draw[taskId].path.length-1].selected = true;
	// trigger array
	draw[taskId].path[draw[taskId].path.length-1].trigger = [];	

	redrawButtons();
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);
		pathCanvasReset();		
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path.last());
		drawCanvasPaths();		
	}	
}
function polygonDrawMove(e) {
	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];	
	var obj = draw[taskId].path[draw[taskId].path.length-1].obj[0];
	if (shiftOn == true) {
		var dx = x - obj.points[obj.points.length-2][0];
		var dy = y - obj.points[obj.points.length-2][1];
		if (Math.abs(dx/dy) >= 1) {
			// horizontal line
			var newPoint = [Math.min(Math.max(x,draw[taskId].drawArea[0]),draw[taskId].drawArea[0]+draw[taskId].drawArea[2]),obj.points[obj.points.length-2][1]];
		} else {
			// vertical line
			var newPoint = [obj.points[obj.points.length-2][0],Math.min(Math.max(y,draw[taskId].drawArea[1]),draw[taskId].drawArea[1]+draw[taskId].drawArea[3])];
		}
	} else {
		var newPoint = [Math.min(Math.max(x,draw[taskId].drawArea[0]),draw[taskId].drawArea[0]+draw[taskId].drawArea[2]),Math.min(Math.max(y,draw[taskId].drawArea[1]),draw[taskId].drawArea[1]+draw[taskId].drawArea[3])];
		/*if (draw[taskId].snap == true) {
			newPoint = snapToPoints(newPoint,draw[taskId].snapPoints,draw[taskId].snapTolerance);	
		}*/
		if (ctrlOn || draw[taskId].snapLinesTogether) {
			newPoint = snapToObj2(newPoint);
		}
	}
	obj.points[obj.points.length-1] = newPoint;
	if (obj.points.length >= 2) {
		// determine whether the shape is clockwise or anti-clockwise;
		var sum = (obj.points[0][0]-obj.points[obj.points.length-1][0])*(obj.points[0][1]+obj.points[obj.points.length-1][1]);
		for (var i = 0; i < obj.points.length - 1; i++) {
			sum += (obj.points[i+1][0]-obj.points[i][0])*(obj.points[i+1][1]+obj.points[i][1]);
		}
		if (sum > 0) {
			obj.clockwise = true;
		} else {
			obj.clockwise = false;
		}
	}
	
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last());
	} else {
		drawCanvasPath(draw[taskId].path.length-1);
	}		
}
function polygonDrawStop(e) {
	var obj = draw[taskId].path[draw[taskId].path.length-1].obj[0];
	if (obj.points.length > 2 && dist(mouse.x-draw[taskId].drawRelPos[0],mouse.y - draw[taskId].drawRelPos[1],obj.points[0][0],obj.points[0][1]) < draw[taskId].selectTolerance * 2) {
		// close polygon
		removeListenerMove(window,polygonDrawMove);
		removeListenerEnd(window,polygonDrawStop);
		obj.closed = true;
		obj.drawing = false;
		obj.points.pop();
		draw[taskId].startX = null;
		draw[taskId].startY = null;
		draw[taskId].drawing = false;
		changeDrawMode();
		draw[taskId].path[draw[taskId].path.length-1].selected = true;
		draw[taskId].path[draw[taskId].path.length-1].trigger = [];
		redrawButtons();
		if (pathCanvasMode) {
			pathCanvasDraw(draw[taskId].path.last());
			drawSelectCanvas();
			pathCanvasReset();	
		} else {
			updateBorder(draw[taskId].path.last());
			drawCanvasPaths();
		}			
	} else if (dist(obj.points[obj.points.length-2][0],obj.points[obj.points.length-2][1],obj.points[obj.points.length-1][0],obj.points[obj.points.length-1][1]) < draw[taskId].selectTolerance * 2) {
		// leave polygon open
		removeListenerMove(window,polygonDrawMove);
		removeListenerEnd(window,polygonDrawStop);
		obj.drawing = false;
		obj.points.pop();
		draw[taskId].startX = null;
		draw[taskId].startY = null;
		draw[taskId].drawing = false;
		changeDrawMode();
		draw[taskId].path[draw[taskId].path.length-1].selected = true;
		draw[taskId].path[draw[taskId].path.length-1].trigger = [];
		redrawButtons();
		if (pathCanvasMode) {
			pathCanvasDraw(draw[taskId].path.last());
			drawSelectCanvas();
			pathCanvasReset();	
		} else {
			updateBorder(draw[taskId].path.last());
			drawCanvasPaths();		
		}		
	} else {
		var newPoint = [mouse.x - draw[taskId].drawRelPos[0],mouse.y - draw[taskId].drawRelPos[1]];
		if (draw[taskId].gridSnap == true) {
			newPoint[0] = roundToNearest(newPoint[0],draw[taskId].gridSnapSize);
			newPoint[1] = roundToNearest(newPoint[1],draw[taskId].gridSnapSize);
		}		
		obj.points.push(newPoint);
		if (pathCanvasMode) {
			pathCanvasDraw(draw[taskId].path.last());
		} else {
			drawCanvasPath(draw[taskId].path.length-1);
		}		
	}
}
function circleDrawMove(e) {
	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];
	
	draw[taskId].path[draw[taskId].path.length-1].obj[0].radius = Math.abs(dist(x,y,draw[taskId].path[draw[taskId].path.length-1].obj[0].center[0],draw[taskId].path[draw[taskId].path.length-1].obj[0].center[1]));
	draw[taskId].path[draw[taskId].path.length-1].obj[0].showCenter = true;
	redrawButtons();
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last());
	} else {
		drawCanvasPath(draw[taskId].path.length-1);
	}	
}
function circleDrawStop(e) {
	removeListenerMove(window,circleDrawMove);
	removeListenerEnd(window,circleDrawStop);
	draw[taskId].startX = null;
	draw[taskId].startY = null;
	draw[taskId].drawing = false;
	
	if (draw[taskId].gridSnap == true) {
		draw[taskId].path[draw[taskId].path.length-1].obj[0].radius = roundToNearest(draw[taskId].path[draw[taskId].path.length-1].obj[0].radius,draw[taskId].gridSnapSize);
	}
	draw[taskId].path[draw[taskId].path.length-1].obj[0].showCenter = false;
	
	changeDrawMode();
	draw[taskId].path[draw[taskId].path.length-1].selected = true;
	draw[taskId].path[draw[taskId].path.length-1].trigger = [];	
	redrawButtons();
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last());
		pathCanvasReset();	
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path.last());
		drawCanvasPaths();
	}
}
function ellipseDrawMove(e) {
	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];
	
	draw[taskId].path[draw[taskId].path.length-1].obj[0].radiusX = Math.abs(x-draw[taskId].path[draw[taskId].path.length-1].obj[0].center[0]);
	draw[taskId].path[draw[taskId].path.length-1].obj[0].radiusY = Math.abs(y-draw[taskId].path[draw[taskId].path.length-1].obj[0].center[1]);	

	draw[taskId].path[draw[taskId].path.length-1].obj[0].showCenter = true;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last());
	} else {
		drawCanvasPath(draw[taskId].path.length-1);
	}		
}
function ellipseDrawStop(e) {
	removeListenerMove(window,ellipseDrawMove);
	removeListenerEnd(window,ellipseDrawStop);
	draw[taskId].startX = null;
	draw[taskId].startY = null;
	draw[taskId].drawing = false;
	
	if (draw[taskId].gridSnap == true) {
		draw[taskId].path[draw[taskId].path.length-1].obj[0].radiusX = roundToNearest(draw[taskId].path[draw[taskId].path.length-1].obj[0].radiusX,draw[taskId].gridSnapSize);
		draw[taskId].path[draw[taskId].path.length-1].obj[0].radiusY = roundToNearest(draw[taskId].path[draw[taskId].path.length-1].obj[0].radiusY,draw[taskId].gridSnapSize);		
	}

	draw[taskId].path[draw[taskId].path.length-1].obj[0].showCenter = false;
	
	changeDrawMode();
	draw[taskId].path[draw[taskId].path.length-1].selected = true;
	draw[taskId].path[draw[taskId].path.length-1].trigger = [];	
	redrawButtons();
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last());
		pathCanvasReset();	
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path.last());
		drawCanvasPaths();		
	}	
}

/***************************/
/*					  	   */
/* GENERAL OBJ INTERACTION */
/*				  	  	   */
/***************************/

function drawClickSelect() {
	cursorPosHighlight(true);
	var pathNum = draw[taskId].currCursor.pathNum;	
	if (!shiftOn) deselectAllPaths(false);
	draw[taskId].path[pathNum].selected = !draw[taskId].path[pathNum].selected;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);
		pathCanvasReset() 
	} else {
		calcCursorPositions();
		drawCanvasPaths();
	}
};
function drawClickStartSelectRect() {
	deselectAllPaths(true);
	draw[taskId].startX = mouse.x - draw[taskId].drawRelPos[0];
	draw[taskId].startY = mouse.y - draw[taskId].drawRelPos[1];
	changeDrawMode('selectRect');
	draw[taskId].selectRect = [mouse.x - draw[taskId].drawRelPos[0],mouse.y - draw[taskId].drawRelPos[1],0,0];
	addListenerMove(window,selectRectMove);
	addListenerEnd(window,selectRectStop);
	if (pathCanvasMode) {
		pathCanvasReset() 
	} else {
		//drawCanvasPaths();
	}
};
function selectRectMove(e) {
	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];
	draw[taskId].selectRect[2] = x - draw[taskId].startX;
	draw[taskId].selectRect[3] = y - draw[taskId].startY;	

	if (draw[taskId].selectRect[0] < x) {
		var selectLeft = draw[taskId].selectRect[0];
		var selectRight = x;		
	} else {
		var selectLeft = x;
		var selectRight = draw[taskId].selectRect[0];		
	}
	
	if (draw[taskId].selectRect[1] < y) {
		var selectTop = draw[taskId].selectRect[1];
		var selectBottom = y;		
	} else {
		var selectTop = y;
		var selectBottom = draw[taskId].selectRect[1];		
	}

	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (typeof draw[taskId].path[i].border !== 'undefined') {
			if (draw[taskId].path[i].border[0] >= selectLeft && draw[taskId].path[i].border[4] <= selectRight && draw[taskId].path[i].border[1] >= selectTop && draw[taskId].path[i].border[5] <= selectBottom) {
				if (draw[taskId].path[i].selected == false) {
					draw[taskId].path[i].selected = true;
					if (pathCanvasMode) {
						pathCanvasDraw(draw[taskId].path[i]);
					}
				}
			} else {
				if (draw[taskId].path[i].selected == true) {
					draw[taskId].path[i].selected = false;
					if (pathCanvasMode) {
						pathCanvasDraw(draw[taskId].path[i]);
					}
				}				
			}
		}
	}
	if (pathCanvasMode) {
		pathCanvasReset();
	} else {
		drawSelectCanvas();		
		drawSelectCanvas2();
	}
}
function selectRectStop(e) {
	changeDrawMode();
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (draw[taskId].path[p].selected == true) {
			if (pathCanvasMode) {
				pathCanvasReset() 
			} else {
				drawCanvasPaths();
			}
			break;
		}
	}
	drawSelectCanvas2();
	draw[taskId].startX = null;
	draw[taskId].startY = null;	
	removeListenerMove(window,selectRectMove);
	removeListenerEnd(window,selectRectStop);
}

function drawClickStartDragObject() {
	changeDrawMode('selectDrag');
	cursorPosHighlight(true);
	draw[taskId].cursorCanvas.style.cursor = draw[taskId].cursors.move2;
	draw[taskId].startDragX = mouse.x;
	draw[taskId].startDragY = mouse.y;
	draw[taskId].selectedCanvases = [];
	draw[taskId].selectedPaths = getSelectedPaths();
	if (!pathCanvasMode) {
		if (draw[taskId].flattenMode == false) {
			for (var i = 0; i < draw[taskId].path.length; i++) {
				if (draw[taskId].path[i].selected == true) {
					draw[taskId].selectedCanvases.push(draw[taskId].drawCanvas[i]);
				}
			}
		} else {
			for (var c = 0; c < draw[taskId].drawCanvas.length; c++) {
				if (draw[taskId].drawCanvas[c].sel == true) {
					draw[taskId].selectedCanvases.push(draw[taskId].drawCanvas[c]);
				}
			}
		}
		draw[taskId].selectedCanvases.push(draw[taskId].drawCanvas[draw[taskId].drawCanvas.length-1]);
	} else {
		for (var i = 0; i < draw[taskId].path.length; i++) {
			if (draw[taskId].path[i].selected == true) {
				var path = draw[taskId].path[i];
				draw[taskId].selectedCanvases.push([path.ctx.canvas,path.border[0],path.border[1]]);				
			}
		}
		draw[taskId].selectedCanvases.push([draw[taskId].drawCanvas[draw[taskId].drawCanvas.length-1],0,0]);
	}
	
	draw[taskId].selectedInputs = [];
	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected == true) {
			for (var o = 0; o < draw[taskId].path[i].obj.length; o++) {
				var obj = draw[taskId].path[i].obj[o];
				if (typeof obj.mathsInput !== 'undefined') {
					draw[taskId].selectedInputs.push([obj.mathsInput,obj.mathsInput.data[100],obj.mathsInput.data[101]]);
				}
				if (typeof obj.leftInput !== 'undefined') {
					draw[taskId].selectedInputs.push([obj.leftInput,obj.leftInput.data[100],obj.leftInput.data[101]]);
				}
				if (typeof obj.rightInput !== 'undefined') {
					draw[taskId].selectedInputs.push([obj.rightInput,obj.rightInput.data[100],obj.rightInput.data[101]]);
				}
				if (typeof obj.mInputs !== 'undefined') {
					for (var r = 0; r < obj.mInputs.length; r++) {
						if (obj.type == 'multChoice') {
							draw[taskId].selectedInputs.push([obj.mInputs[r],obj.mInputs[r].data[100],obj.mInputs[r].data[101]]);
						} else {
							for (var c = 0; c < obj.mInputs[r].length; c++) {
								draw[taskId].selectedInputs.push([obj.mInputs[r][c],obj.mInputs[r][c].data[100],obj.mInputs[r][c].data[101]]);
							}
						}
					}
				}
				
			}
		}
	}
	
	if (!un(draw[taskId].gridMenu) && draw[taskId].gridMenu.showing == true) {
		draw[taskId].prevX = mouse.x;
		draw[taskId].prevY = mouse.y;
	}
	addListenerMove(window,selectDragMove);
	addListenerEnd(window,selectDragStop);	
};
function selectDragMove(e) {
	updateMouse(e);
	if (pathCanvasMode) {
		var x = mouse.x + draw[taskId].drawRelPos[0] - draw[taskId].startDragX;
		var y = mouse.y + draw[taskId].drawRelPos[1] - draw[taskId].startDragY;		
		
		var selC = draw[taskId].selectedCanvases;
		for (var c = 0; c < selC.length; c++) {
			selC[c][0].data[100] = selC[c][1]+x;
			selC[c][0].data[101] = selC[c][2]+y;
			resizeCanvas2(selC[c][0],selC[c][0].data[100],selC[c][0].data[101]);			
		}

		if (draw[taskId].selectedInputs.length > 0) {
			var x2 = mouse.x - draw[taskId].startDragX;
			var y2 = mouse.y - draw[taskId].startDragY;
			for (var i = 0; i < draw[taskId].selectedInputs.length; i++) {
				draw[taskId].selectedInputs[i][0].data[100] = draw[taskId].selectedInputs[i][1]+x2;
				draw[taskId].selectedInputs[i][0].data[101] = draw[taskId].selectedInputs[i][2]+y2;
				resizeCanvas2(draw[taskId].selectedInputs[i][0].canvas,draw[taskId].selectedInputs[i][0].data[100],draw[taskId].selectedInputs[i][0].data[101]);
			}
		}
	} else {
		var x = mouse.x + draw[taskId].drawRelPos[0] - draw[taskId].startDragX;
		var y = mouse.y + draw[taskId].drawRelPos[1] - draw[taskId].startDragY;
		for (var c = 0; c < draw[taskId].selectedCanvases.length; c++) {
			resizeCanvas2(draw[taskId].selectedCanvases[c],x,y);
		}
		if (draw[taskId].selectedInputs.length > 0) {
			var x2 = mouse.x - draw[taskId].startDragX;
			var y2 = mouse.y - draw[taskId].startDragY;
			for (var i = 0; i < draw[taskId].selectedInputs.length; i++) {
				draw[taskId].selectedInputs[i][0].data[100] = draw[taskId].selectedInputs[i][1]+x2;
				draw[taskId].selectedInputs[i][0].data[101] = draw[taskId].selectedInputs[i][2]+y2;
				resizeCanvas2(draw[taskId].selectedInputs[i][0].canvas,draw[taskId].selectedInputs[i][0].data[100],draw[taskId].selectedInputs[i][0].data[101]);
			}
		}
		if (!un(draw[taskId].gridMenu) && draw[taskId].gridMenu.showing == true) {
			var dx = mouse.x - draw[taskId].prevX;
			var dy = mouse.y - draw[taskId].prevY;
			draw[taskId].gridMenu.move(dx,dy);
			draw[taskId].prevX = mouse.x;
			draw[taskId].prevY = mouse.y;
		}		
	}
}
function selectDragStop(e) {
	updateMouse(e);
	var dx = mouse.x - draw[taskId].startDragX;
	var dy = mouse.y - draw[taskId].startDragY;
	changeDrawMode();
	draw[taskId].cursorCanvas.style.cursor = draw[taskId].cursors.move1;
	if (pathCanvasMode) {
		resizeCanvas2(draw[taskId].selectedCanvases[draw[taskId].selectedCanvases.length-1][0],draw[taskId].drawRelPos[0],draw[taskId].drawRelPos[1]);
	} else {
		for (var c = 0; c < draw[taskId].selectedCanvases.length; c++) {
			resizeCanvas2(draw[taskId].selectedCanvases[c],draw[taskId].drawRelPos[0],draw[taskId].drawRelPos[1]);
		}
	}
	draw[taskId].selectedCanvases = [];	
	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected == true) {
			repositionPath(draw[taskId].path[i],dx,dy,0,0);
			drawCanvasPath(i);
		}
	}
	gridSnapObjects();
	if (pathCanvasMode) {
		drawSelectCanvas();
	} else {
		drawCanvasPaths();
	}	
	removeListenerMove(window,selectDragMove);
	removeListenerEnd(window,selectDragStop);
	if (draw[taskId].qBox.length > 0) qBoxRefresh();	
}

function drawClickStartResizeObject() {
	changeDrawMode('selectResize');
	cursorPosHighlight(true);
	draw[taskId].cursorCanvas.style.cursor = draw[taskId].cursors.nw;	
	draw[taskId].prevX = mouse.x;
	draw[taskId].prevY = mouse.y;
	addListenerMove(window,selectResizeMove);
	addListenerEnd(window,selectResizeStop);	
}
function selectResizeMove(e) {
	updateMouse(e);
	var dw = mouse.x - draw[taskId].prevX;
	var dh = mouse.y - draw[taskId].prevY;
	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected == true) {
			repositionPath(draw[taskId].path[i],0,0,dw,dh);
			if (draw[taskId].qBox == true && draw[taskId].path[i].obj.length == 1 && draw[taskId].path[i].obj[0].type == 'text') {
				draw[taskId].path[i].qSetWidth = draw[taskId].path[i].border[2]; // width and height as
				draw[taskId].path[i].qSetHeight = draw[taskId].path[i].border[3]; // set by the user
			}
			if (pathCanvasMode) {
				//pathCanvasDraw(draw[taskId].path[i]);
			} else {
				drawCanvasPath(i);
				
			}
		}
	}
	drawSelectCanvas();
	/*if (pathCanvasMode) {
		drawSelectCanvas();
	} else {
		//drawCanvasPath();
	}*/
	draw[taskId].prevX = mouse.x;
	draw[taskId].prevY = mouse.y;
}
function selectResizeStop(e) {
	changeDrawMode('prev');
	draw[taskId].cursorCanvas.style.cursor = draw[taskId].cursors.move1;
	gridSnapObjects();
	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected == true) {
			for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {	
				if (['grid'].indexOf(draw[taskId].path[i].obj[j].type) > -1) {
					calcGridZeros(draw[taskId].path[i].obj[j]);
				}
			}
			/*if (pathCanvasMode) {
				//drawSelectCanvas();		
			} else {
				drawCanvasPath(i);
			}*/			
		}
	}
	/*if (pathCanvasMode) {
		//drawSelectCanvas();		
	} else {
		//drawCanvasPaths();
	}*/
	draw[taskId].prevX = null;
	draw[taskId].prevY = null;	
	removeListenerMove(window,selectResizeMove);
	removeListenerEnd(window,selectResizeStop);
	if (draw[taskId].qBox.length > 0) qBoxRefresh();	
}

function drawClickTrigger() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var prevVis = true;
	if (typeof draw[taskId].path[pathNum].trigger == 'undefined') draw[taskId].path[pathNum].trigger = [];
	for (var l = 0; l <= draw[taskId].triggerNum; l++) {
		if (typeof draw[taskId].path[pathNum].trigger[l] == 'boolean') {
			prevVis = draw[taskId].path[pathNum].trigger[l];
		}
	}
	draw[taskId].path[pathNum].trigger[draw[taskId].triggerNum] = !prevVis;
	if (draw[taskId].triggerNum == draw[taskId].triggerNumMax) {
		draw[taskId].triggerNumMax++;
		slider[taskId][1].max = draw[taskId].triggerNumMax;
		slider[taskId][1].sliderData[100] = slider[taskId][1].left + (draw[taskId].triggerNum / draw[taskId].triggerNumMax) * slider[taskId][1].width;
		resize();
	}
	drawCanvasPaths();
}
function drawClickOrderPlus() {
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathNum < draw[taskId].path.length - 1) {
		var path = draw[taskId].path[pathNum];
		draw[taskId].path[pathNum] = draw[taskId].path[pathNum+1];
		draw[taskId].path[pathNum+1] = path;
		draw[taskId].currCursor.pathNum++;
		updateBorder(draw[taskId].path[pathNum]);
		updateBorder(draw[taskId].path[pathNum+1]);
		qBoxRefresh();
		calcCursorPositions();
		drawCanvasPaths();
	}	
}
function drawClickOrderMinus() {
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathNum > 0) {
		var path = draw[taskId].path[pathNum];
		draw[taskId].path[pathNum] = draw[taskId].path[pathNum-1];
		draw[taskId].path[pathNum-1] = path;
		draw[taskId].currCursor.pathNum--;
		updateBorder(draw[taskId].path[pathNum-1]);
		updateBorder(draw[taskId].path[pathNum]);
		qBoxRefresh();
		calcCursorPositions();
		drawCanvasPaths();
	}
}
function sendToBack() {
	var selectedPaths = [];
	for (var p = draw[taskId].path.length-1; p >= 0; p--) {
		if (draw[taskId].path[p].selected == true) {
			selectedPaths.push(draw[taskId].path[p]);
			draw[taskId].path.splice(p,1);
		};
	}
	for (var p = selectedPaths.length-1; p >= 0; p--) {
		draw[taskId].path.unshift(selectedPaths[p]);
	}
	calcCursorPositions();
	drawCanvasPaths();
}
function bringToFront() {
	var selectedPaths = [];
	for (var p = draw[taskId].path.length-1; p >= 0; p--) {
		if (draw[taskId].path[p].selected == true) {
			selectedPaths.push(draw[taskId].path[p]);
			draw[taskId].path.splice(p,1);
		};
	}
	for (var p = selectedPaths.length-1; p >= 0; p--) {
		draw[taskId].path.push(selectedPaths[p]);
	}
	calcCursorPositions();
	drawCanvasPaths();
}
function drawClickDelete() {
	var pathNum = draw[taskId].currCursor.pathNum;
	qBoxRefresh();
	removePathObject(pathNum);
	for (var p = 0; p < draw[taskId].path.length; p++) {
		updateBorder(draw[taskId].path[p]);
	}
	calcCursorPositions();
	drawCanvasPaths();
}

function cutPaths() {
	copyPaths();
	deletePaths();
}
function copyPaths() {
	draw[taskId].pathClipboard = [];
	var path = draw[taskId].path;
	for (var p = 0; p < path.length; p++) {
		if (path[p].selected) {
			draw[taskId].pathClipboard.push(clone(path[p]));
		}
	}
}
function pastePaths() {
	deselectAllPaths(false);
	if (un(draw[taskId].pathClipboard) || draw[taskId].pathClipboard.length == 0) return;
	reviveDrawPaths(draw[taskId].pathClipboard);
	for (var p = 0; p < draw[taskId].pathClipboard.length; p++) {
		draw[taskId].path.push(draw[taskId].pathClipboard[p]);
		pathCanvasDraw(draw[taskId].path.last());
	}
	clearPathClipboard();
	calcCursorPositions();
	drawCanvasPaths();
}
function clearPathClipboard() {
	draw[taskId].pathClipboard = [];
}
function clonePaths() {
	var clones = [];
	var pMax = draw[taskId].path.length;
	for (var p = 0; p < pMax; p++) {
		if (draw[taskId].path[p].selected == true) {
			var path = clone(draw[taskId].path[p]);
			delete path.ctx;
			clones.push(path);
		}
	}
	deselectAllPaths(false);
	reviveDrawPaths(clones);
	draw[taskId].path = draw[taskId].path.concat(clones);
	if (pathCanvasMode) {
		for (var c = 0; c < clones.length; c++) {
			pathCanvasDraw(clones[c]);
		}		
		pathCanvasReset();
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		drawCanvasPaths();
	}
}
function deletePaths() {
	for (var i = draw[taskId].path.length-1; i >= 0; i--) {
		if (draw[taskId].path[i].selected == true) {
			removePathObject(i);
		}
	}	
}
function clearDrawPaths() {
	for (var i = draw[taskId].path.length - 1; i >= 0; i--) {
		removePathObject(i);
	}
	drawCanvasPaths();
	//pathCanvasReset();
}
function deleteSelectedPaths() {
	for (var p = draw[taskId].path.length-1; p >= 0; p--) {
		if (draw[taskId].path[p].selected == true) {
			removePathObject(p);
		}
	}
	for (var p = 0; p < draw[taskId].path.length; p++) {
		updateBorder(draw[taskId].path[p]);
	}
	calcCursorPositions();
	drawCanvasPaths();
	drawSelectCanvas();	
}
function removePathObject(num) {
	// remove inputs from DOM
	for (var j = 0; j < draw[taskId].path[num].obj.length; j++) {
		var obj = draw[taskId].path[num].obj[j];
		switch (obj.type) {
			case 'text':
			case 'button':
				hideMathsInput(obj.mathsInput);
				break;
			case 'input':
				hideMathsInput(obj.leftInput);
				hideMathsInput(obj.mathsInput);
				hideMathsInput(obj.rightInput);
				break;
			case 'table':
			case 'table2':
				for (var k = 0; k < obj.mInputs.length; k++) {
					for (var l = 0; l < obj.mInputs[k].length; l++) {
						hideMathsInput(obj.mInputs[k][l]);
					}
				}
				break;
			case 'multChoice':
				for (var m = 0; m < obj.mInputs.length; m++) {
					hideMathsInput(obj.mInputs[m]);
				}
				break;				
		}
	}
	if (pathCanvasMode) {
		draw[taskId].path[num].ctx.clear();
		hideObj(draw[taskId].path[num].ctx.canvas);
		draw[taskId].path.splice(num,1);
		pathCanvasReset();
	} else {
		draw[taskId].path.splice(num,1);
		//drawCanvasPaths();
	}
	//calcCursorPositions();
}

function selectAllPaths() {
	var path = draw[taskId].path;
	for (var p = 0; p < path.length; p++) {
		path[p].selected = true;
		if (pathCanvasMode) {
			pathCanvasDraw(path[p]);
		}
	}
	if (pathCanvasMode) {
		pathCanvasReset();
		drawSelectCanvas();
	} else {
		drawCanvasPaths();
	}
	calcCursorPositions();	
}
function deselectAllPaths(redraw) {
	if (un(redraw)) redraw = true;
	var changed = 0;
	if (!un(draw[taskId].gridMenu) && draw[taskId].gridMenu.showing == true) draw[taskId].gridMenu.hide();
	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected) {
			changed++;
			draw[taskId].path[i].selected = false;
			for (var o = 0; o < draw[taskId].path[i].obj.length; o++) {
				var obj = draw[taskId].path[i].obj[o];
				if (!un(obj.mathsInput)) deselectMathsInput(obj.mathsInput);
				if (!un(obj.leftInput)) deselectMathsInput(obj.leftInput);
				if (!un(obj.rightInput)) deselectMathsInput(obj.rightInput);
				if (!un(obj.mInputs)) {
					if (obj.type == 'table' || obj.type == 'table2') {
						for (var r = 0; r < obj.mInputs.length; r++) {
							for (var c = 0; c < obj.mInputs[r].length; c++) {
								deselectMathsInput(obj.mInputs[r][c]);
							}
						}
					} else if (obj.type == 'multChoice') {
						for (var m = 0; m < obj.mInputs.length; m++) {
							deselectMathsInput(obj.mInputs[m]);
						}
					}
				}
				
			}			
			if (pathCanvasMode && redraw == true) pathCanvasDraw(draw[taskId].path[i]);
		}
	}
	if (redraw == true && changed > 0) {
		if (pathCanvasMode) {
			pathCanvasReset();
		} else {
			drawCanvasPaths();
		}
		calcCursorPositions();
	}
}
function getSelectedPaths() {
	var sel = [];
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (draw[taskId].path[p].selected == true) {
			sel.push(p);
		}
	}
	return sel;
}
function hideMathsInputsInPath(path) {
	for (var o = 0; o < path.obj.length; o++) {
		var obj = path.obj[o];
		switch (obj.type) {
			case 'text':
			case 'button':
				hideMathsInput(obj.mathsInput);
				break;
			case 'mathsInput':
				hideMathsInput(obj.mathsInput);
				hideMathsInput(obj.leftInput);
				hideMathsInput(obj.rightInput);
				break;				
			case 'table':
			case 'table2':
				for (var r = 0; r < obj.mInputs.length; r++) {
					for (var c = 0; c < obj.mInputs[r].length; c++) {
						hideMathsInput(obj.mInputs[r][c]);
					}
				}
				break;
			case 'multChoice':
				for (var m = 0; m < obj.mInputs.length; m++) {
					hideMathsInput(obj.mInputs[m]);
				}
				break;				
		}
	}
}
function showMathsInputsInPath(path,opt_z) {
	for (var o = 0; o < path.obj.length; o++) {
		var obj = path.obj[o];
		switch (obj.type) {
			case 'text':
			case 'button':
				showMathsInput(obj.mathsInput);
				if (!un(opt_z)) setMathsInputZIndex(obj.mathsInput,opt_z);
				break;
			case 'mathsInput':
				showMathsInput(obj.mathsInput);
				showMathsInput(obj.leftInput);
				showMathsInput(obj.rightInput);
				if (!un(opt_z)) {
					setMathsInputZIndex(obj.mathsInput,opt_z);
					setMathsInputZIndex(obj.leftInput,opt_z);
					setMathsInputZIndex(obj.rightInput,opt_z);
				}
				break;				
			case 'table':
			case 'table2':
			for (var r = 0; r < obj.mInputs.length; r++) {
					for (var c = 0; c < obj.mInputs[r].length; c++) {
						showMathsInput(obj.mInputs[r][c]);
						if (!un(opt_z)) setMathsInputZIndex(obj.mInputs[r][c],opt_z);
					}
				}
				break;
			case 'multChoice':
				for (var m = 0; m < obj.mInputs.length; m++) {
					showMathsInput(obj.mInputs[m]);
					if (!un(opt_z)) setMathsInputZIndex(obj.mInputs[m],opt_z);		
				}
				break;				
		}
	}
}

function groupPaths() {
	var selected = [];
	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected == true) selected.push(i);
	}
	//console.log(selected);
	if (selected.length > 1) {
		var pathObject = [];
		for (i = 0; i < selected.length; i++) {
			for (var k = 0; k < draw[taskId].path[selected[i]].obj.length; k++) {
				pathObject.push(draw[taskId].path[selected[i]].obj[k]);
			}
		}
		draw[taskId].path[selected[selected.length-1]].obj = pathObject.slice(0);
		draw[taskId].path[selected[selected.length-1]].selected = true;
		for (i = selected.length - 2; i >= 0; i--) {
			removePathObject(selected[i]);
		}
		if (pathCanvasMode) {
			pathCanvasDraw(draw[taskId].path[selected[selected.length-1]]);
			updateBorder(draw[taskId].path[selected[selected.length-1]]);
			pathCanvasReset();
		} else {
			//updateBorder(draw[taskId].path[selected[0]]);
			for (var p = 0; p < draw[taskId].path.length; p++) {
				if (draw[taskId].path[p].selected == true) {
					updateBorder(draw[taskId].path[p]);
				}
			}
			drawCanvasPaths();
			//drawSelectCanvas();
		}
		calcCursorPositions();		
	}/* else if (selected.length == 1) {
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
		//drawCanvasPaths();
		pathCanvasReset();
		drawSelectCanvas();
		calcCursorPositions();		
	}	*/	
}
function ungroupPaths() {
	var path = draw[taskId].path;
	for (var i = path.length-1; i >= 0; i--) {
		if (path[i].selected == true && path[i].obj.length > 1) {
			var newPaths = [];
			for (var j = 0; j < path[i].obj.length; j++) {
				newPaths.push({obj:[path[i].obj[j]],selected:true,trigger:[]});
			}
			draw[taskId].path = path.slice(0,i).concat(newPaths).concat(path.slice(i+1));
			for (var j = i; j < i+newPaths.length; j++) {
				updateBorder(draw[taskId].path[j]);
				if (pathCanvasMode) {
					pathCanvasDraw(draw[taskId].path[j]);
				}
			}
		}
	}
	if (pathCanvasMode) {
		pathCanvasReset();
		calcCursorPositions();
		drawSelectCanvas();
	} else {
		drawCanvasPaths();
	}
}

function rePosVideo(obj) {
	var vid = obj.video;
	vid.data[100] = obj.left;
	vid.data[101] = obj.top;
	vid.data[102] = obj.width;
	vid.data[103] = obj.height;
	vid.width = obj.width;
	vid.height = obj.height;	
	resizeCanvas(vid,vid.data[100],vid.data[101],vid.data[102],vid.data[103]);	
}
function repositionPath(path,dl,dt,dw,dh) {
	if (typeof dl !== 'number') dl = 0;
	if (typeof dt !== 'number') dt = 0;
	if (typeof dw !== 'number') dw = 0;
	if (typeof dh !== 'number') dh = 0;
	for (var j = 0; j < path.obj.length; j++) {	
		var obj = path.obj[j];
		switch (obj.type) {
			case 'pen' :
				for (var k = 0; k < obj.pos.length; k++) {
					obj.pos[k][0] += dl;
					obj.pos[k][1] += dt;
				}
				break;	
			case 'polygon' :
				for (var k = 0; k < obj.points.length; k++) {
					obj.points[k][0] += dl;
					obj.points[k][1] += dt;
				}
				if (dw !== 0 || dh !== 0) {
					var x = mouse.x - draw[0].drawRelPos[0];
					var y = mouse.y - draw[0].drawRelPos[1];					
					if (shiftOn == true) {
						var sf = Math.min((x-obj.left)/obj.width,(y-obj.top)/obj.height);
						var xsf = sf;
						var ysf = sf;
					} else {
						var xsf = (x-obj.left)/obj.width;
						var ysf = (y-obj.top)/obj.height;
					}
					for (var k = 0; k < obj.points.length; k++) {
						obj.points[k][0] = obj.left+obj.width*xsf*((obj.points[k][0]-obj.left)/obj.width);
						obj.points[k][1] = obj.top+obj.height*ysf*((obj.points[k][1]-obj.top)/obj.height);
					}
				}
				if (!un(obj.exteriorAngles)) {
					for (var v = 0; v < obj.exteriorAngles.length; v++) {
						var prev = v-1;
						if (prev == -1) prev = obj.points.length-1;
						var next = v+1;
						if (next == obj.points.length) next = 0;
						var vector1 = getVectorAB(obj.points[prev],obj.points[v]);
						var pos1 = pointAddVector(obj.points[v],getUnitVector(vector1),obj.exteriorAngles[v].line2.dist);
						var vector2 = getVectorAB(obj.points[next],obj.points[v]);
						var pos2 = pointAddVector(obj.points[v],getUnitVector(vector2),obj.exteriorAngles[v].line1.dist);	
						obj.exteriorAngles[v].line1.vector = vector2;
						obj.exteriorAngles[v].line1.pos = pos2;
						obj.exteriorAngles[v].line2.vector = vector1;
						obj.exteriorAngles[v].line2.pos = pos1;
					}
				}				
				break;
			case 'anglesAroundPoint' :
				for (var k = 0; k < obj.points.length; k++) {
					obj.points[k][0] += dl;
					obj.points[k][1] += dt;
				}
				obj.center[0] += dl;
				obj.center[1] += dt;
				if (dw !== 0 || dh !== 0) {
					var x = mouse.x - draw[0].drawRelPos[0];
					var y = mouse.y - draw[0].drawRelPos[1];
					obj.radius = Math.abs(Math.max(x-obj.center[0],y-obj.center[1]));
					anglesAroundPointFixToRadius(obj);
				}
				break;				
			case 'line' :
				obj.startPos[0] += dl;
				obj.startPos[1] += dt;
				obj.finPos[0] += dl;
				obj.finPos[1] += dt;
				break;
			case 'rect' :
				obj.startPos[0] += dl;
				obj.startPos[1] += dt;
				obj.finPos[0] += dl+dw;
				obj.finPos[1] += dt+dh;
				break;
			case 'square' :
				obj.startPos[0] += dl;
				obj.startPos[1] += dt;
				obj.finPos[0] += dl;
				obj.finPos[1] += dt;				
				if (dw !== 0 || dh !== 0) {
					var newSize = Math.min(mouse.x-obj.startPos[0],mouse.y-obj.startPos[1]);
					obj.finPos[0] = obj.startPos[0] + newSize;
					obj.finPos[1] = obj.startPos[1] + newSize;
				}
				break;
			case 'curve' :
				obj.startPos[0] += dl;
				obj.startPos[1] += dt;
				obj.finPos[0] += dl;
				obj.finPos[1] += dt;
				obj.controlPos[0] += dl;
				obj.controlPos[1] += dt;
				break;
			case 'curve2' :
				obj.startPos[0] += dl;
				obj.startPos[1] += dt;
				obj.finPos[0] += dl;
				obj.finPos[1] += dt;
				obj.controlPos1[0] += dl;
				obj.controlPos1[1] += dt;
				obj.controlPos2[0] += dl;
				obj.controlPos2[1] += dt;				
				break;				
			case 'input' :
			case 'button' :
			case 'text' :
				obj.left += dl;
				obj.top += dt;
				obj.width += dw;
				var mInput = obj.mathsInput;
								
				mInput.data[100] = obj.left+draw[taskId].drawRelPos[0];
				mInput.data[101] = obj.top+draw[taskId].drawRelPos[1];
				mInput.data[102] = obj.width;
				mInput.varSize.maxWidth = obj.width;
				mInput.canvas.width = mInput.data[102];				
				resizeCanvas(mInput.canvas,mInput.data[100],mInput.data[101],mInput.data[102],mInput.data[103]);
					
				currMathsInput = obj.mathsInput;
				mathsInputMapCursorPos();
				
				obj.height += dh;
				mInput.varSize.maxHeight = obj.height;
				/*if (dh !== 0) { // old version - height limited to min = tightRect
					obj.height = Math.max(mouse.y-obj.top,mInput.tightRect[3]);
					mInput.varSize.maxHeight = obj.height;
				}*/
				
				if (obj.type == 'input') {
					obj.leftInput.data[100] = obj.left+draw[taskId].drawRelPos[0] - obj.leftInput.data[102];
					obj.leftInput.data[101] = obj.top+draw[taskId].drawRelPos[1];
					obj.leftInput.varSize.maxHeight = obj.height;
					resizeCanvas(obj.leftInput.canvas,obj.leftInput.data[100],obj.leftInput.data[101],obj.leftInput.data[102],obj.leftInput.data[103]);
					drawMathsInputText(obj.leftInput);

					obj.rightInput.data[100] = obj.left+draw[taskId].drawRelPos[0] + obj.width;
					obj.rightInput.data[101] = obj.top+draw[taskId].drawRelPos[1];
					obj.rightInput.varSize.maxHeight = obj.height;
					resizeCanvas(obj.rightInput.canvas,obj.rightInput.data[100],obj.rightInput.data[101],obj.rightInput.data[102],obj.rightInput.data[103]);
					drawMathsInputText(obj.rightInput);
				}
				break;
			case 'multChoice' :
				obj.left += dl;
				obj.top += dt;
				obj.width += dw;
				obj.height += dh;
				obj.cellWidth = (obj.width - obj.spacing * (obj.cols-1)) / obj.cols;
				obj.cellHeight = (obj.height - obj.spacing * (obj.rows-1)) / obj.rows;
				
				for (var m = 0; m < obj.mInputs.length; m++) {
					mInput = obj.mInputs[m];
					var l = obj.left + (m % obj.cols) * (obj.cellWidth + obj.spacing);
					var t = obj.top + Math.floor(m / obj.cols) * (obj.cellHeight + obj.spacing);
					mInput.data[100] = l+draw[taskId].drawRelPos[0];
					mInput.data[101] = t+draw[taskId].drawRelPos[1];
					mInput.data[102] = obj.cellWidth;
					mInput.varSize.maxWidth = obj.cellWidth;
					mInput.canvas.width = mInput.data[102];
					mInput.data[103] = obj.cellHeight;
					mInput.varSize.maxHeight = obj.cellHeight;
					mInput.canvas.height = mInput.data[103];				
					resizeCanvas(mInput.canvas,mInput.data[100],mInput.data[101],mInput.data[102],mInput.data[103]);
					
					currMathsInput = mInput;
					mathsInputMapCursorPos();
				}
				break;				
			case 'image' :
				obj.left += dl;
				obj.top += dt;
				if (dw !== 0 || dh !== 0) {
					var sf = Math.min((mouse.x-obj.left)/obj.naturalWidth,(mouse.y-obj.top)/obj.naturalHeight);
					obj.width = obj.naturalWidth * sf;
					obj.height = obj.naturalHeight * sf;
					obj.scaleFactor = sf;
				}
				break;
			case 'table' :
				obj.left += dl;
				obj.top += dt;
				var table = calcTable2(obj);
				obj.cell = table.cell;
				obj.xPos = table.xPos;
				obj.yPos = table.yPos;
				obj.width = table.xPos[table.xPos.length-1] - obj.left;
				obj.height = table.yPos[table.yPos.length-1] - obj.top;
				for (var r = 0; r < obj.mInputs.length; r++) {
					for (var c = 0; c < obj.mInputs[r].length; c++) {
						var mInput = obj.mInputs[r][c];
						var l = obj.cell[r][c].left+draw[taskId].drawRelPos[0] + 10 - 2.5;
						var t = obj.cell[r][c].top+draw[taskId].drawRelPos[1] + 10 - 2.5;
						var w = obj.cell[r][c].width - 10;
						var h = obj.cell[r][c].height - 10;
						mInput.data[100] = l;
						mInput.data[101] = t;
						mInput.data[102] = w;
						mInput.data[103] = h;
						mInput.cursorData[100] = l;
						mInput.cursorData[101] = t;
						mInput.cursorData[102] = w;
						mInput.cursorData[103] = h;
						resizeCanvas(mInput.canvas,mInput.data[100],mInput.data[101],mInput.data[102],mInput.data[103]);
						mInput.canvas.width = w;
						mInput.canvas.height = h;
						resizeCanvas(mInput.cursorCanvas,mInput.cursorData[100],mInput.cursorData[101],mInput.cursorData[102],mInput.cursorData[103]);
						mInput.cursorCanvas.width = w;
						mInput.cursorCanvas.height = h			
						drawMathsInputText(mInput);	
					}
				}					
				break;
			case 'table2' :
				obj.left += dl;
				obj.top += dt;
				for (var x = 0; x < obj.xPos.length; x++) {
					obj.xPos[x] += dl;
				}
				for (var y = 0; y < obj.yPos.length; y++) {
					obj.yPos[y] += dt;
				}
				for (var r = 0; r < obj.cell.length; r++) {
					for (var c = 0; c < obj.cell[r].length; c++) {
						obj.cell[r][c].left += dl;
						obj.cell[r][c].top += dt;
					}
				}					
				for (var r = 0; r < obj.mInputs.length; r++) {
					for (var c = 0; c < obj.mInputs[r].length; c++) {
						var mInput = obj.mInputs[r][c];
						var l = obj.cell[r][c].left+draw[taskId].drawRelPos[0] + 10 - 2.5;
						var t = obj.cell[r][c].top+draw[taskId].drawRelPos[1] + 10 - 2.5;
						var w = obj.cell[r][c].width - 10;
						var h = obj.cell[r][c].height - 10;
						mInput.data[100] = l;
						mInput.data[101] = t;
						mInput.data[102] = w;
						mInput.data[103] = h;
						mInput.cursorData[100] = l;
						mInput.cursorData[101] = t;
						mInput.cursorData[102] = w;
						mInput.cursorData[103] = h;
						resizeCanvas(mInput.canvas,mInput.data[100],mInput.data[101],mInput.data[102],mInput.data[103]);
						mInput.canvas.width = w;
						mInput.canvas.height = h;
						resizeCanvas(mInput.cursorCanvas,mInput.cursorData[100],mInput.cursorData[101],mInput.cursorData[102],mInput.cursorData[103]);
						mInput.cursorCanvas.width = w;
						mInput.cursorCanvas.height = h			
						drawMathsInputText(mInput);	
					}
				}					
				break;				
			case 'angle' :
				obj.a[0] += dl;
				obj.a[1] += dt;
				obj.b[0] += dl;
				obj.b[1] += dt;
				obj.c[0] += dl;
				obj.c[1] += dt;
				if (!un(obj.d)) {
					obj.d[0] += dl;
					obj.d[1] += dt;
				}
				if (dw !== 0 || dh !== 0) {
					obj.radius = Math.min(
						Math.abs(mouse.x-draw[taskId].drawRelPos[0]-obj.b[0]),Math.abs(mouse.y-draw[taskId].drawRelPos[1]-obj.b[1])
					);
					obj.a = [obj.b[0]+obj.radius*Math.cos(obj.angleA),obj.b[1]+obj.radius*Math.sin(obj.angleA)];
					obj.c = [obj.b[0]+obj.radius*Math.cos(obj.angleC),obj.b[1]+obj.radius*Math.sin(obj.angleC)];
				}				
				break;
			case 'circle' :
				obj.center[0] += dl;
				obj.center[1] += dt;
				if (dw !== 0 || dh !== 0) {
					var x = mouse.x - draw[0].drawRelPos[0];
					var y = mouse.y - draw[0].drawRelPos[1];
					obj.radius = Math.abs(Math.min(x-obj.center[0],y-obj.center[1]));
				}				
				break;
			case 'ellipse' :
				obj.center[0] += dl;
				obj.center[1] += dt;
				obj.radiusX += dw;
				obj.radiusY += dh;	
				break;
			case 'video' :
				obj.left += dl;
				obj.top += dt;
				var sf = Math.min((mouse.x-obj.left)/obj.normalWidth,(mouse.y-obj.top)/obj.normalHeight);
				obj.width = sf * obj.normalWidth;
				obj.height = sf * obj.normalHeight;
				rePosVideo(obj);
				break;
			case 'grid' :
				obj.left += dl;
				obj.top += dt;
				obj.width += dw;
				obj.height += dh;				
				obj.xZero += dl;
				obj.yZero += dt;
				break;
		}
	}
	if (pathCanvasMode) {
		pathCanvasDraw(path);
	} else {
		updateBorder(path);
	}
}
function movePaths(dl,dt) {
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (draw[taskId].path[p].selected) {
			repositionPath(draw[taskId].path[p],dl,dt,0,0);
			updateBorder(draw[taskId].path[p]);
			drawSelectCanvas();
			if (!pathCanvasMode) {
				drawCanvasPath(p);
			}
		}
	}
	//drawCanvasPaths();
	//drawSelectCanvas();	
}
function alignPaths(type) {
	var sel = [];
	var pos = [];
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (draw[taskId].path[p].selected == true) {
			sel.push(p);
			pos.push(draw[taskId].path[p].tightBorder);
		}
	}
	switch (type) {
		case 'left':
			var x;
			for (var p = 0; p < pos.length; p++) {
				if (p == 0) {
					x = pos[p][0];
				} else {
					x = Math.min(x,pos[p][0]);
				}
			}
			for (var p = 0; p < pos.length; p++) {
				repositionPath(draw[taskId].path[sel[p]],x-pos[p][0],0,0,0);
			}
			break;
		case 'center':
			var xMin;
			var xMax;
			for (var p = 0; p < pos.length; p++) {
				if (p == 0) {
					xMin = pos[p][0];
					xMax = pos[p][4];
				} else {
					xMin = Math.min(xMin,pos[p][0]);
					xMax = Math.max(xMax,pos[p][4]);
				}
			}
			var x = (xMin+xMax)/2;
			for (var p = 0; p < pos.length; p++) {
				repositionPath(draw[taskId].path[sel[p]],(x-pos[p][0])-pos[p][2]/2,0,0,0);
			}
			break;			
		case 'right':
			var x;
			for (var p = 0; p < pos.length; p++) {
				if (p == 0) {
					x = pos[p][4];
				} else {
					x = Math.max(x,pos[p][4]);
				}
			}
			for (var p = 0; p < pos.length; p++) {
				repositionPath(draw[taskId].path[sel[p]],(x-pos[p][0])-pos[p][2],0,0,0);
			}
			break;
		case 'top':
			var y;
			for (var p = 0; p < pos.length; p++) {
				if (p == 0) {
					y = pos[p][1];
				} else {
					y = Math.min(y,pos[p][1]);
				}
			}
			for (var p = 0; p < pos.length; p++) {
				repositionPath(draw[taskId].path[sel[p]],0,y-pos[p][1],0,0);
			}
			break;
		case 'middle':
			var yMin;
			var yMax;
			for (var p = 0; p < pos.length; p++) {
				if (p == 0) {
					yMin = pos[p][1];
					yMax = pos[p][5];
				} else {
					yMin = Math.min(yMin,pos[p][1]);
					yMax = Math.max(yMax,pos[p][5]);
				}
			}
			var y = (yMin+yMax)/2;
			for (var p = 0; p < pos.length; p++) {
				repositionPath(draw[taskId].path[sel[p]],0,(y-pos[p][1])-pos[p][3]/2,0,0);
			}
			break;			
		case 'bottom':
			var y;
			for (var p = 0; p < pos.length; p++) {
				if (p == 0) {
					y = pos[p][5];
				} else {
					y = Math.max(y,pos[p][5]);
				}
			}
			for (var p = 0; p < pos.length; p++) {
				repositionPath(draw[taskId].path[sel[p]],0,(y-pos[p][1])-pos[p][3],0,0);
			}
			break;
	}
	if (pathCanvasMode) {
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		drawCanvasPaths();
	}
}
function snapToMargin(type) {
	if (typeof type == 'undefined') type = 'left';
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (draw[taskId].path[p].selected == true) {
			var dx = 0;
			var dy = 0;
			var pos = draw[taskId].path[p].tightBorder;
			switch (type) {
				case 'left':
					dx = draw[taskId].gridMargin[0] - pos[0];
					break;
				case 'top':
					dy = draw[taskId].gridMargin[1] - pos[1];
					break;
				case 'right':
					dx = (draw[taskId].drawArea[2] - draw[taskId].gridMargin[2]) - pos[4];
					break;					
				case 'bottom':
					dy = (draw[taskId].drawArea[3] - draw[taskId].gridMargin[3]) - pos[5];
					break;
			}
			repositionPath(draw[taskId].path[p],dx,dy,0,0);
		}
	}
	if (pathCanvasMode) {
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		drawCanvasPaths();
	}
}
function snapToObj2(pos,pathNum) {
	var closest = [];
	var close = -1;
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (p == pathNum) continue;
		for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
			var obj = draw[taskId].path[p].obj[o];
			switch (obj.type) {
				case 'line':
				case 'curve':
				case 'curve2':
					checkPos(obj.startPos);
					checkPos(obj.finPos);
					break;
				case 'arc':
					var arcEnds = getEndPointsOfArc(obj);
					for (var k = 0; k < arcEnds.length; k++) {
						checkPos(arcEnds[k]);
					}
					break;				
				case 'pen':
					checkPos(obj.pos[0]);
					checkPos(obj.pos[obj.pos.length-1]);
					break;
				/*case 'arc':
					break;*/
				case 'rect':
					checkPos([obj.left,obj.top]);
					checkPos([obj.left+obj.width,obj.top]);
					checkPos([obj.left,obj.top+obj.height]);
					checkPos([obj.left+obj.width,obj.top+obj.height]);
					break;
				case 'polygon':
					for (var v = 0; v < obj.points.length; v++) {
						checkPos(obj.points[v]);
					}
					break;
				case 'angle':
					checkPos(obj.b);
					if (obj.drawLines) {
						checkPos(obj.a);
						checkPos(obj.c);
					}
					break;
				case 'anglesAroundPoint':
					for (var v = 0; v < obj.points.length; v++) {
						checkPos(obj.points[v]);
					}
					checkPos(obj.center);
					break;
			}
		}
	}
	if (!un(draw[taskId].snapPoints)) {
		for (var s = 0; s < draw[taskId].snapPoints.length; s++) {
			checkPos(draw[taskId].snapPoints[s]);
		}
	}
	function checkPos(pos2) {
		var d = dist(pos[0],pos[1],pos2[0],pos2[1]);
		if (d < draw[taskId].snapTolerance) {
			if (close == -1 || d < close) {
				close = d;
				closest = pos2;
			}
		}
	}
	if (close !== -1) return clone(closest);
	for (var p = 0; p < draw[taskId].path.length; p++) { // if no point found, search for line to snap to
		if (p == pathNum) continue;
		for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
			var obj = draw[taskId].path[p].obj[o];
			switch (obj.type) {
				case 'line':
					checkLine(obj.startPos,obj.finPos);	
					break;
				case 'rect':
					var lt = [obj.left,obj.top];
					var rt = [obj.left+obj.width,obj.top];
					var lb = [obj.left,obj.top+obj.height];
					var rb = [obj.left+obj.width,obj.top+obj.height];
					checkLine(lt,rt);
					checkLine(rt,rb);
					checkLine(rb,lb);
					checkLine(lb,lt);
					break;
				case 'polygon':
					for (var v = 0; v < obj.points.length-1; v++) {
						checkLine(obj.points[v],obj.points[v+1]);
					}
					if (boolean(obj.closed,true)) {
						checkLine(obj.points[obj.points.length-1],obj.points[0]);
					}
					break;
				case 'angle':
					if (obj.drawLines) {
						checkLine(obj.a,obj.b);
						checkLine(obj.b,obj.c);
					}
					break;
				case 'anglesAroundPoint':
					for (var v = 0; v < obj.points.length; v++) {
						checkLine(obj.points[v],obj.center);
					}
					break;
			}
		}
	}
	function checkLine(p1,p2) {
		var p3 = closestPointOnLineSegment(pos,p1,p2);
		var d = getDist(p3,pos);
		if (d < draw[taskId].snapTolerance) {
			if (close == -1 || d < close) {
				close = d;
				closest = p3;
			}
		}
	}
	if (close !== -1) return clone(closest);	
	return pos;
}
function gridSnapObjects() {
	if (draw[taskId].gridSnap == true/* || shiftOn == true*/) {
		var horiz = draw[taskId].horizSnap;
		var vert = draw[taskId].vertSnap;
		for (var i = 0; i < draw[taskId].path.length; i++) {
			if (draw[taskId].path[i].selected == true) {
				var xMin = 1200;
				var xMax = 0;
				var yMin = 700;
				var yMax = 0;
				for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
					xMin = Math.min(xMin,draw[taskId].path[i].obj[j].left);
					xMax = Math.max(xMax,draw[taskId].path[i].obj[j].left+draw[taskId].path[i].obj[j].width);
					yMin = Math.min(yMin,draw[taskId].path[i].obj[j].top);
					yMax = Math.max(yMax,draw[taskId].path[i].obj[j].top+draw[taskId].path[i].obj[j].height);
				}
				var dx,dy;
				if (draw[taskId].horizSnap == 'center') {
					dx = roundToNearest(((xMin + xMax) / 2),draw[taskId].gridSnapSize) - ((xMin + xMax) / 2);
				} else if (draw[taskId].horizSnap == 'right') {
					dx = roundToNearest(xMax,draw[taskId].gridSnapSize) - xMax;
				} else {
					dx = roundToNearest(xMin,draw[taskId].gridSnapSize) - xMin;										
				}
				if (draw[taskId].vertSnap == 'middle') {
					dy = roundToNearest(((yMin + yMax) / 2),draw[taskId].gridSnapSize) - ((yMin + yMax) / 2);
				} else if (draw[taskId].horizSnap == 'bottom') {
					dy = roundToNearest(yMax,draw[taskId].gridSnapSize) - yMax;
				} else {
					dy = roundToNearest(yMin,draw[taskId].gridSnapSize) - yMin;										
				}
				repositionPath(draw[taskId].path[i],dx,dy,0,0);
			}
		}
	}	
}
function updateSnapPoints() { // handles intersection points line snapping - for constructions tool
	/*if (draw[taskId].snap == true) {
		var intPoints = getIntersectionPoints(draw[taskId].path);
		var endPoints = getEndPoints(draw[taskId].path);
		draw[taskId].snapPoints = intPoints.concat(endPoints);
	}*/	
	draw[taskId].snapPoints = getIntersectionPoints(draw[taskId].path);
	//showSnapPositions();
}
function showSnapPositions() {
	var ctx = draw[taskId].drawCanvas.last().ctx;
	var points = draw[taskId].snapPoints;
	ctx.fillStyle = '#F00';
	for (var i = 0; i < points.length; i++) {
		ctx.beginPath();
		ctx.arc(points[i][0],points[i][1],draw[taskId].snapTolerance,0,2*Math.PI);
		ctx.fill();
	}
}

function distributeHoriz() {
	if (tableCellsSelectionTest() == true) {
		for (var i = 0; i < draw[taskId].path.length; i++) {
			if (draw[taskId].path[i].selected == true) {
				for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
					if (draw[taskId].path[i].obj[j].type == 'table' || draw[taskId].path[i].obj[j].type == 'table2') {
						var obj = draw[taskId].path[i].obj[j];
						var cells = obj.cells;
						var cols = [];
						var totalWidth = 0;
						for (var r = 0; r < cells.length; r++) {
							for (var c = 0; c < cells[r].length; c++) {
								if (cols.indexOf(c) == -1 && cells[r][c].selected == true) {
									cols.push(c);
									if (obj.type == 'table') {
										totalWidth += cells[r][c].minWidth;
									} else if (obj.type == 'table2') {
										totalWidth += obj.widths[c];
									}
								}
							}
						}
						if (cols.length > 1) {
							for (var r = 0; r < cells.length; r++) {
								for (var c = 0; c < cells[r].length; c++) {
									if (cols.indexOf(c) > -1) {
										if (obj.type == 'table') {
											cells[r][c].minWidth = totalWidth / cols.length;
										} else if (r == 0 && obj.type == 'table2') {
											obj.widths[c] = totalWidth / cols.length;
										}												
									}
								}
							}
							if (obj.type == 'table') {
								var table = calcTable2(draw[taskId].path[i].obj[j]);
								draw[taskId].path[i].obj[j].cell = table.cell;
								draw[taskId].path[i].obj[j].xPos = table.xPos;
								draw[taskId].path[i].obj[j].yPos = table.yPos;
								draw[taskId].path[i].obj[j].width = table.xPos[table.xPos.length-1] - draw[taskId].path[i].obj[j].left;
								draw[taskId].path[i].obj[j].height = table.yPos[table.yPos.length-1] - draw[taskId].path[i].obj[j].top;
							}
						}
					}
				}
				if (pathCanvasMode) {
					pathCanvasDraw(draw[taskId].path[i]);
					repositionPath(draw[taskId].path[i]);
					calcCursorPositions();
				} else {
					repositionPath(draw[taskId].path[i]);
					drawCanvasPath(i);
				}						
			}
		}

		} else {
		var sel = [];
		var pos = [];				
		var sel2 = [];
		var pos2 = [];
		for (var p = 0; p < draw[taskId].path.length; p++) {
			if (draw[taskId].path[p].selected == true) {
				sel2.push(p);
				pos2.push(draw[taskId].path[p].tightBorder);
			}
		}
		if (sel2.length < 2) return;
		while (sel2.length > 0) { // reorder sel2 & pos2 by tightBorder[0] (left)
			var index = 0;
			var minLeft;
			for (var p = 0; p < pos2.length; p++) {
				if (p == 0) {
					minLeft = pos2[p][0];
				} else if (pos2[p][0] < minLeft) {
					minLeft = pos2[p][0];
					index = p;
				}
			}
			sel.push(sel2[index]);
			pos.push(clone(pos2[index]));
			sel2.splice(index,1);
			pos2.splice(index,1);
		}
		var xMin;
		var xMax;
		var totalWidth = 0;
		for (var p = 0; p < pos.length; p++) {
			totalWidth += pos[p][2];
			if (p == 0) {
				xMin = pos[p][0];
				xMax = pos[p][4];
			} else {
				xMin = Math.min(xMin,pos[p][0]);
				xMax = Math.max(xMax,pos[p][4]);
			}
		}
		var gap = ((xMax-xMin) - totalWidth) / (sel.length-1);
		var x = xMin;
		for (var p = 0; p < pos.length; p++) {
			repositionPath(draw[taskId].path[sel[p]],(x-pos[p][0]),0,0,0);
			x += pos[p][2] + gap;
		}
		if (pathCanvasMode) {
			drawSelectCanvas();
		} else {
			drawCanvasPaths();
		}
	}
}
function distributeVert() {
	if (tableCellsSelectionTest() == true) {
		for (var i = 0; i < draw[taskId].path.length; i++) {
			if (draw[taskId].path[i].selected == true) {
				for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
					if (draw[taskId].path[i].obj[j].type == 'table' || draw[taskId].path[i].obj[j].type == 'table2') {
						var obj = draw[taskId].path[i].obj[j];
						var type = obj.type;
						var rows = [];
						var totalHeight = 0;								
						var cells = obj.cells;
						for (var r = 0; r < cells.length; r++) {
							for (var c = 0; c < cells[r].length; c++) {
								if (rows.indexOf(r) == -1 && cells[r][c].selected == true) {
									rows.push(r);
									if (obj.type == 'table') {
										totalHeight += cells[r][c].minHeight;
									} else if (obj.type == 'table2') {
										totalHeight += obj.heights[r];
									}											
								}
							}
						}
						if (rows.length > 1) {
							for (var r = 0; r < cells.length; r++) {
								if (rows.indexOf(r) > -1) {
									if (obj.type == 'table') {
										for (var c = 0; c < cells[r].length; c++) {
											cells[r][c].minHeight = totalHeight / rows.length;
										}
									} else if (obj.type == 'table2') {
										obj.heights[r] = totalHeight / rows.length;
									}
								}
							}
							if (obj.type == 'table') {
								var table = calcTable2(draw[taskId].path[i].obj[j]);
								draw[taskId].path[i].obj[j].cell = table.cell;
								draw[taskId].path[i].obj[j].xPos = table.xPos;
								draw[taskId].path[i].obj[j].yPos = table.yPos;
								draw[taskId].path[i].obj[j].width = table.xPos[table.xPos.length-1] - draw[taskId].path[i].obj[j].left;
								draw[taskId].path[i].obj[j].height = table.yPos[table.yPos.length-1] - draw[taskId].path[i].obj[j].top;
							}
						}									
					}
				}
				if (pathCanvasMode) {
					pathCanvasDraw(draw[taskId].path[i]);
					repositionPath(draw[taskId].path[i]);
					calcCursorPositions();
				} else {
					repositionPath(draw[taskId].path[i]);
					drawCanvasPath(i);
				}						
			}
		}
	
	} else {
		var sel = [];
		var pos = [];				
		var sel2 = [];
		var pos2 = [];
		for (var p = 0; p < draw[taskId].path.length; p++) {
			if (draw[taskId].path[p].selected == true) {
				sel2.push(p);
				pos2.push(draw[taskId].path[p].tightBorder);
			}
		}
		if (sel2.length < 2) return;
		while (sel2.length > 0) { // reorder sel2 & pos2 by tightBorder[1] (top)
			var index = 0;
			var minTop;
			for (var p = 0; p < pos2.length; p++) {
				if (p == 0) {
					minTop = pos2[p][1];
				} else if (pos2[p][1] < minTop) {
					minTop = pos2[p][1];
					index = p;
				}
			}
			sel.push(sel2[index]);
			pos.push(clone(pos2[index]));
			sel2.splice(index,1);
			pos2.splice(index,1);
		}
		var yMin;
		var yMax;
		var totalHeight = 0;
		for (var p = 0; p < pos.length; p++) {
			totalHeight += pos[p][3];
			if (p == 0) {
				yMin = pos[p][1];
				yMax = pos[p][5];
			} else {
				yMin = Math.min(yMin,pos[p][1]);
				yMax = Math.max(yMax,pos[p][5]);
			}
		}
		var gap = ((yMax-yMin) - totalHeight) / (sel.length-1);
		var y = yMin;
		for (var p = 0; p < pos.length; p++) {
			repositionPath(draw[taskId].path[sel[p]],0,(y-pos[p][1]),0,0);
			y += pos[p][3] + gap;
		}
		if (pathCanvasMode) {
			drawSelectCanvas();
		} else {
			drawCanvasPaths();
		}
	}	
}

function hitTestPathRect(path,l,t,w,h) { // checks if center of path is in rect
	if (typeof path.tightBorder == 'undefined') updateBorder(path);
	var a = path.tightBorder;
	var x = a[0]+a[2]/2;
	var y = a[1]+a[3]/2;
	//console.log(path,l,t,w,h,a,a[0] < l || a[1] < t || a[0]+a[2] > l+w || a[1]+a[3] > t+h);
	if (x < l || y < t || x > l+w || y > t+h) return false;
	return true;
}

/**********************/
/*					  */
/*	     TEXT	      */
/*				  	  */
/**********************/

function drawClickStartNewTextEdit() {
	deselectAllPaths(false);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];	
	var mInput = createMathsInput2({
		left:mouse.x-10,
		top:mouse.y-30,
		width:300,
		height:2*draw[taskId].drawArea[3],
		varSize:{minWidth:30,maxWidth:300,minHeight:60,maxHeight:60,padding:0},
		maxLines:5,
		backColor:'none',
		selectColor:'none',
		border:false,
		borderWidth:1,
		borderDash:[4,6],
		borderColor:'#00F',
		textAlign:'left',
		vertAlign:'top',
		fontSize:28,
		selectable:true,
		zIndex:draw[taskId].zIndex,
		pointerCanvas:draw[taskId].cursorCanvas,
	});	
	draw[taskId].path.push({obj:[{
		type:'text',
		mathsInput:mInput,
		left:x-10,
		top:y-30,
		width:300,
		height:60,
		backColor:'none',
		selectColor:'none',
		textAlign:'center',
		vertAlign:'top'
	}],selected:true,trigger:[]});
	updateBorder(draw[taskId].path[draw[taskId].path.length-1]);
	//mInput.drawPath = draw[taskId].path[draw[taskId].path.length-1];
	startMathsInput(mInput);
	changeDrawMode('textInputSelect');
	redrawButtons();
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[draw[taskId].path.length-1]);
		pathCanvasReset();
	} else {
		drawCanvasPaths();
	}
	addListenerMove(window,textInputSelectMove);
	addListenerEnd(window,textInputSelectStop);
}
function drawClickStartTextEdit() {
	startMathsInput(draw[taskId].currCursor.mathsInput);
	changeDrawMode('textInputSelect');
	addListenerMove(window,textInputSelectMove);
	addListenerEnd(window,textInputSelectStop);	
};
function drawClickStartTextEdit2() { // version to propagate on select click
	deselectAllPaths();
	draw[taskId].path[draw[taskId].currCursor.pathNum].selected = true;
	if (pathCanvasMode) {
		pathCanvasReset();
	} else {
		drawCanvasPaths();
	}
	startMathsInput(draw[taskId].currCursor.mathsInput);
	changeDrawMode('textInputSelect');
	addListenerMove(window,textInputSelectMove);
	addListenerEnd(window,textInputSelectStop);	
};
function textInputSelectMove(e) {
	updateMouse(e);
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	var closestPos = getClosestTextPos();
	if (currMathsInput.selectPos[1] !== closestPos) {
		currMathsInput.selectPos[1] = closestPos;
		currMathsInput.selected = true;
		setSelectPositions();
		drawMathsInputText(currMathsInput);
		mathsInputMapCursorPos();
	}
	if (pathCanvasMode) {
		drawSelectCanvas();
	} else {
		//drawCanvasPaths();
	}	
}
function textInputSelectStop(e) {
	removeListenerMove(window,textInputSelectMove);
	removeListenerEnd(window,textInputSelectStop);
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];

	// if mouse is over the originating input, update select positions	
	if (currMathsInput.selectPos[0] == currMathsInput.selectPos[1]) {
		currMathsInput.cursorPos = currMathsInput.selectPos[0];
		currMathsInput.selectPos = [];
		currMathsInput.selected = false;
		setSelectPositions();
		mathsInputMapCursorPos();
		mathsInputCursorCoords();
	}
	// show keyboard
	if (keyboard[taskNum] && keyboard[taskNum].parentNode !== container) {
		container.appendChild(keyboard[taskNum]);
		for (var i = 0; i < key1[taskNum].length; i++) {
			container.appendChild(key1[taskNum][i]);
		}
	}
	// light up keys on keyboard
	if (keyboard[taskNum]) {
		for (var i = 0; i < key1[taskNum].length; i++) {
			key1[taskNum][i].style.opacity = 1;
			key1[taskNum][i].style.pointerEvents = 'auto';	
		}
	}
	changeDrawMode('textEdit');
}
function drawClickStopTextEdit() {
	endMathsInput();
	changeDrawMode();
};
function drawClickTextToggleBorder() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	if (un(obj.showBorder)) {
		obj.showBorder = true;
		obj.color = '#000';
		obj.thickness = 2;
		obj.fillColor = 'none';
	} else {
		obj.showBorder = !obj.showBorder;
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[draw[taskId].currCursor.pathNum]);
	} else {
		drawCanvasPath(draw[taskId].currCursor.pathNum);
	}
}

function drawClickTextHorizResize(e) {
	updateMouse(e);
	changeDrawMode('tableColResize');
	draw[taskId].selectedPath = draw[taskId].currCursor.pathNum;
	draw[taskId].prevX = mouse.x;
	addListenerMove(window,drawClickTextHorizResizeMove);
	addListenerEnd(window,drawClickTextHorizResizeStop);
}
function drawClickTextHorizResizeMove(e) {
	updateMouse(e);
	var path = draw[taskId].path[draw[taskId].selectedPath];
	var dx = mouse.x - draw[taskId].prevX;
	repositionPath(path,0,0,dx,0);
	if (pathCanvasMode) {
		drawSelectCanvas();
	} else {
		updateBorder(path);
		drawCanvasPaths();
	}
	draw[taskId].prevX = mouse.x;
}	
function drawClickTextHorizResizeStop(e) {
	removeListenerMove(window,drawClickTextHorizResizeMove);
	removeListenerEnd(window,drawClickTextHorizResizeStop);
	changeDrawMode('prev');
}
function drawClickTextHorizResizeCollapse() {
	var path = draw[taskId].path[draw[taskId].currCursor.pathNum];
	var dw = (path.obj[0].mathsInput.tightRect[2]+4) - path.tightBorder[2];
	repositionPath(path,0,0,dw,0);
	if (pathCanvasMode) {
		drawSelectCanvas();
	} else {
		updateBorder(path);
		drawCanvasPaths();
	}
}

function setLineSpacingFactor(factor) {
	if (typeof factor !== 'number') factor = 1.2;
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (draw[taskId].path[p].selected == true) {
			for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
				if (draw[taskId].path[p].obj[o].type == 'text') {
					draw[taskId].path[p].obj[o].mathsInput.lineSpacingFactor = factor;
					drawMathsInputText(draw[taskId].path[p].obj[o].mathsInput);
				}
			}
		}
	}
}
function setLineSpacingStyle(type) { // 'fixed' or 'variable'
	if (type !== 'fixed') type = 'variable';
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (draw[taskId].path[p].selected == true) {
			for (var o = 0; o < draw[taskId].path[p].obj.length; o++) {
				if (draw[taskId].path[p].obj[o].type == 'text') {
					draw[taskId].path[p].obj[o].mathsInput.lineSpacingStyle = type;
					drawMathsInputText(draw[taskId].path[p].obj[o].mathsInput);
				}
			}
		}
	}
}
function replaceCharacterInDrawText(oldChar,newChar) {
	for (var i = 0; i < mathsInput[taskId].length; i++) {
		var str = JSON.stringify(mathsInput[taskId][i].richText);
		if (str.indexOf(oldChar) == -1) continue;
		newStr = str.replace(oldChar,newChar);
		setMathsInputText(mathsInput[taskId][i],eval(newStr));
	}
}

/**********************/
/*					  */
/*	     LINES	      */
/*				  	  */
/**********************/

function drawClickLineDragStartPos() {
	changeDrawMode('lineStart');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points
	addListenerMove(window,lineMove);
	addListenerEnd(window,lineStop);	
}
function drawClickLineDragFinPos() {
	changeDrawMode('lineFin');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	addListenerMove(window,lineMove);
	addListenerEnd(window,lineStop);	
}
function lineMove(e) {
	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];	
	var pathNum = draw[taskId].currPathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (draw[taskId].drawMode == 'lineStart') {
		if (shiftOn) {
			if (Math.abs(obj.finPos[0]-x) < Math.abs(obj.finPos[1]-y)) {
				obj.startPos = [obj.finPos[0],y];
			} else {
				obj.startPos = [x,obj.finPos[1]];
			}
		} else if (ctrlOn || draw[taskId].snapLinesTogether) {
			obj.startPos = snapToObj2([x,y],pathNum);
		} else {
			obj.startPos = [x,y];
		}	
	} else if (draw[taskId].drawMode == 'lineFin' || draw[taskId].drawMode == 'line') {
		if (shiftOn) {
			if (Math.abs(obj.startPos[0]-x) < Math.abs(obj.startPos[1]-y)) {
				obj.finPos = [obj.startPos[0],y];
			} else {
				obj.finPos = [x,obj.startPos[1]];
			}			
		} else if (ctrlOn || draw[taskId].snapLinesTogether) {
			obj.finPos = snapToObj2([x,y],pathNum);
		} else {
			obj.finPos = [x,y];
		}			
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPath(pathNum);
		drawSelectCanvas();
		drawSelectCanvas2();
	}
}	
function lineStop(e) {
	var pathNum = draw[taskId].currPathNum;
	var obj = draw[taskId].path[pathNum].obj[0];	
	/*if (draw[taskId].gridSnap == true) {	
		if (draw[taskId].drawMode == 'lineStart') {
			obj.startPos[0] = roundToNearest(obj.startPos[0],draw[taskId].gridSnapSize);
			obj.startPos[1] = roundToNearest(obj.startPos[1],draw[taskId].gridSnapSize);
		} else if (draw[taskId].drawMode == 'lineFin') {
			obj.finPos[0] = roundToNearest(obj.finPos[0],draw[taskId].gridSnapSize);
			obj.finPos[1] = roundToNearest(obj.finPos[1],draw[taskId].gridSnapSize);
		}
	}*/
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);
		drawSelectCanvas();		
	} else {
		updateBorder(draw[taskId].path[pathNum]);
		drawCanvasPaths();	
	}
	removeListenerMove(window,lineMove);
	removeListenerEnd(window,lineStop);
	changeDrawMode();		
}

/**********************/
/*					  */
/*	    CURVES	      */
/*				  	  */
/**********************/

function addCurve() {
	deselectAllPaths(false);
	changeDrawMode();
	draw[taskId].path.push({obj:[{
		type:'curve',
		thickness:4,
		startPos:[250-draw[taskId].drawRelPos[0],150-draw[taskId].drawRelPos[1]],
		finPos:[450-draw[taskId].drawRelPos[0],150-draw[taskId].drawRelPos[1]],
		controlPos:[350-draw[taskId].drawRelPos[0],250-draw[taskId].drawRelPos[1]],
		color:draw[taskId].color,
	}],selected:true,trigger:[]});
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		updateBorder(draw[taskId].path.last());
		drawCanvasPaths();
	}
}
function addCurve2() {
	deselectAllPaths(false);
	changeDrawMode();
	draw[taskId].path.push({obj:[{
		type:'curve2',
		thickness:4,
		startPos:[250-draw[taskId].drawRelPos[0],150-draw[taskId].drawRelPos[1]],
		finPos:[450-draw[taskId].drawRelPos[0],150-draw[taskId].drawRelPos[1]],
		controlPos1:[300-draw[taskId].drawRelPos[0],250-draw[taskId].drawRelPos[1]],
		controlPos2:[400-draw[taskId].drawRelPos[0],250-draw[taskId].drawRelPos[1]],
		color:draw[taskId].color,
	}],selected:true,trigger:[]});
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		updateBorder(draw[taskId].path.last());
		drawCanvasPaths();
	}
}
function drawClickCurveStartPosDrag() {
	changeDrawMode('curveStart');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points	
	addListenerMove(window,curveMove);
	addListenerEnd(window,curveStop);
};
function drawClickCurveFinPosDrag() {
	changeDrawMode('curveFin');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points	
	addListenerMove(window,curveMove);
	addListenerEnd(window,curveStop);	
};
function drawClickCurveControlPosDrag() {
	changeDrawMode('curveControl');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points	
	addListenerMove(window,curveMove);
	addListenerEnd(window,curveStop);	
};
function drawClickCurve2StartPosDrag() {
	changeDrawMode('curve2Start');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	addListenerMove(window,curveMove);
	addListenerEnd(window,curveStop);	
}
function drawClickCurve2FinPosDrag() {
	changeDrawMode('curve2Fin');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points	
	addListenerMove(window,curveMove);
	addListenerEnd(window,curveStop);	
}
function drawClickCurve2ControlPos1Drag() {
	changeDrawMode('curve2Control1');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points
	addListenerMove(window,curveMove);
	addListenerEnd(window,curveStop);	
}
function drawClickCurve2ControlPos2Drag() {
	changeDrawMode('curve2Control2');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points
	addListenerMove(window,curveMove);
	addListenerEnd(window,curveStop);	
}
function curveMove(e) {
	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];		
	var pathNum = draw[taskId].currPathNum;
	var obj = draw[taskId].path[pathNum].obj[0];

	var pos = [x,y];
	if (ctrlOn || draw[taskId].snapLinesTogether) {
		var pos = snapToObj2([x,y],pathNum);
	}
	
	if (draw[taskId].drawMode == 'curveStart' || draw[taskId].drawMode == 'curve2Start') {
		obj.startPos[0] = pos[0];
		obj.startPos[1] = pos[1];
	} else if (draw[taskId].drawMode == 'curveFin' || draw[taskId].drawMode == 'curve2Fin') {
		obj.finPos[0] = pos[0];
		obj.finPos[1] = pos[1];
	} else if (draw[taskId].drawMode == 'curveControl') {
		obj.controlPos[0] = pos[0];
		obj.controlPos[1] = pos[1];
	} else if (draw[taskId].drawMode == 'curve2Control1') {
		obj.controlPos1[0] = pos[0];
		obj.controlPos1[1] = pos[1];
	} else if (draw[taskId].drawMode == 'curve2Control2') {
		obj.controlPos2[0] = pos[0];
		obj.controlPos2[1] = pos[1];
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);
		drawCanvasPaths();
	}	
}	
function curveStop(e) {
	var pathNum = draw[taskId].currPathNum;
	var obj = draw[taskId].path[pathNum].obj[0];	
	/*if (draw[taskId].gridSnap == true) {	
		if (draw[taskId].drawMode == 'curveStart') {
			obj.startPos[0] = roundToNearest(obj.startPos[0],draw[taskId].gridSnapSize);
			obj.startPos[1] = roundToNearest(obj.startPos[1],draw[taskId].gridSnapSize);
		} else if (draw[taskId].drawMode == 'curveFin') {
			obj.finPos[0] = roundToNearest(obj.finPos[0],draw[taskId].gridSnapSize);
			obj.finPos[1] = roundToNearest(obj.finPos[1],draw[taskId].gridSnapSize);
		}
		if (pathCanvasMode) {
			pathCanvasDraw(draw[taskId].path[pathNum]);
			drawSelectCanvas();
		} else {
			updateBorder(draw[taskId].path[pathNum]);
			drawCanvasPaths();
		}
	}*/
	removeListenerMove(window,curveMove);
	removeListenerEnd(window,curveStop);
	changeDrawMode();
}

/**********************/
/*					  */
/*		POLYGONS	  */
/*				  	  */
/**********************/

function drawClickPolygonStartPointDrag() {
	//deselectAllPaths();
	changeDrawMode('polygonPointDrag');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	draw[taskId].currPoint = draw[taskId].currCursor.point;
	updateSnapPoints(); // update intersection points	
	addListenerMove(window,polygonPointMove);
	addListenerEnd(window,polygonPointStop);	
}
function polygonPointMove(e) {
	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];	
	var pathNum = draw[taskId].currPathNum;
	var p = draw[taskId].currPoint;
	var obj = draw[taskId].path[pathNum].obj[0];
	var points = obj.points;
	
	if (ctrlOn || draw[taskId].snapLinesTogether) {
		var pos = snapToObj2([x,y],pathNum);
	} else if (shiftOn) { // snap horiz / vert to adjacent vertices
		var pos = null;
		if (!un(obj.polygonType) && obj.points.length == 4 && (obj.polygonType == 'rhom' || obj.polygonType == 'kite')) {
			// special cases - snap v/h to opposite point			
			if (p == 0) {
				if (Math.abs(x-points[2][0]) < draw[taskId].snapTolerance) {
					pos = [points[2][0],y];
				} else if (Math.abs(y-points[2][1]) < draw[taskId].snapTolerance) {
					pos = [x,points[2][1]];
				}
			} else if (p == 2) {
				if (Math.abs(x-points[0][0]) < draw[taskId].snapTolerance) {
					pos = [points[0][0],y];
				} else if (Math.abs(y-points[0][1]) < draw[taskId].snapTolerance) {
					pos = [x,points[0][1]];
				}
			}
		}
		if (pos == null) {
			var prev = p - 1;
			if (prev == -1) prev = points.length - 1;
			var next = p + 1;
			if (next == points.length) next = 0;
			var diff = [Math.abs(x-points[prev][0]),Math.abs(y-points[prev][1]),Math.abs(x-points[next][0]),Math.abs(y-points[next][1])];
			var min = diff.indexOf(arrayMin(diff));
			if (pos == null && diff[0] < draw[taskId].snapTolerance && diff[3] < draw[taskId].snapTolerance) {
				pos = [points[prev][0],points[next][1]];
			}
			if (pos == null && diff[1] < draw[taskId].snapTolerance && diff[2] < draw[taskId].snapTolerance) {
				pos = [points[next][0],points[prev][1]];
			}
			if (pos == null && min == 0) {
				pos = [points[prev][0],y];
			}
			if (pos == null && min == 1) {
				pos = [x,points[prev][1]];
			}
			if (pos == null && min == 2) {
				pos = [points[next][0],y];
			}
			if (pos == null && min == 3) {
				pos = [x,points[next][1]];			
			}
		}
	} else {
		var pos = [x,y];
	}
	if (obj.anglesMode == 'exterior' && !un(obj.exteriorAngles)) {
		for (var v = 0; v < obj.exteriorAngles.length; v++) {
			obj.exteriorAngles[v].line1.dist = getDist(points[v],obj.exteriorAngles[v].line1.pos);
			obj.exteriorAngles[v].line2.dist = getDist(points[v],obj.exteriorAngles[v].line2.pos);
		}
	}
	
	if (!un(obj.polygonType) && obj.points.length == 4 && obj.polygonType !== 'none') {
		switch (obj.polygonType) {
			case 'square':
				points[p] = pos;
				var p2 = []; // p2[0] is moving point, p2[2] is opposite
				for (var p3 = p; p3 < p+4; p3++) {p2.push(p3%4);};
				var sideLen = getDist(points[p],points[p2[2]])/Math.sqrt(2);
				var diagVector = getVectorAB(points[p],points[p2[2]]);
				var vector1 = rotateVector(diagVector,-Math.PI/4);
				var vector2 = rotateVector(diagVector,Math.PI/4);
				points[p2[1]] = pointAddVector(points[p],setVectorMag(vector1,sideLen));
				points[p2[3]] = pointAddVector(points[p],setVectorMag(vector2,sideLen));
				break;
			case 'rect':
				if (p == 0 || p == 1) {
					var sideLen = getDist(points[1],points[2]);
					points[p] = pos;
					var vector1 = getVectorAB(points[0],points[1]);
					var vector2 = setVectorMag(getPerpVector(vector1),sideLen);
					points[2] = pointAddVector(points[1],vector2);
					points[3] = pointAddVector(points[0],vector2);					
				} else if (p == 2) {
					var vector1 = getVectorAB(points[1],points[2]);
					var mag = getDist([x,y],points[1]);
					points[2] = pointAddVector(points[1],setVectorMag(vector1,mag));
					points[3] = pointAddVector(points[0],setVectorMag(vector1,mag));					
				}
				break;
			case 'para':
				if (p == 0 || p == 1) {
					var vector1 = getVectorAB(points[0],points[1]);
					var angle1 = getVectorAngle(vector1);
					var vector2 = getVectorAB(points[1],points[2]);
					points[p] = pos;
					var vector3 = getVectorAB(points[0],points[1]);
					var angle3 = getVectorAngle(vector3);
					var vector4 = rotateVector(vector2,angle3-angle1);
					points[2] = pointAddVector(points[1],vector4);
					points[3] = pointAddVector(points[0],vector4);					
				} else if (p == 2) {
					points[p] = pos;
					var vector1 = getVectorAB(points[1],points[2]);
					points[3] = pointAddVector(points[0],vector1);					
				}			
				break;
			case 'trap':
				var vector1a = getVectorAB(points[0],points[1]);
				var vector2a = getVectorAB(points[1],points[2]);
				var vector3a = getVectorAB(points[0],points[3]);
				var vector4a = getVectorAB(points[2],points[3]);
				var angle1a = getVectorAngle(vector1a);
				points[p] = pos;
				switch (p) {
					case 0:
					case 1:
						var vector1b = getVectorAB(points[0],points[1]);
						var angle1b = getVectorAngle(vector1b);					
						var vector2b = rotateVector(vector2a,angle1b-angle1a);
						var vector3b = rotateVector(vector3a,angle1b-angle1a);
						points[2] = pointAddVector(points[1],vector2b);
						points[3] = pointAddVector(points[0],vector3b);					
						break;
					case 2:
						points[3] = getVectorLinesIntersection(points[2],vector4a,points[0],vector3a);
						break;
					case 3:
						points[2] = getVectorLinesIntersection(points[3],vector4a,points[1],vector2a);
						break;
				}
				break;
			case 'rhom':
				var mid = getMidpoint(points[0],points[2]);
				var vector1 = getVectorAB(mid,points[1]);
				var vector3 = getVectorAB(mid,points[3]);
				if (p == 0 || p == 2) {
					points[p] = pos;
					var mid2 = getMidpoint(points[0],points[2]);
					var vector2 = getVectorAB(points[0],points[2]);
					var vector4 = setVectorMag(getPerpVector(vector2),getVectorMag(vector1));;
					points[1] = pointAddVector(mid2,vector4,-1);
					points[3] = pointAddVector(mid2,vector4);
				} else if (p == 1) {
					var mag = getDist(mid,[x,y]);
					points[1] = pointAddVector(mid,setVectorMag(vector1,mag));
					points[3] = pointAddVector(mid,setVectorMag(vector3,mag));					
				}
				break;
			case 'kite':
				if (p == 0) {
					var vector1a = getVectorAB(points[2],points[1]);
					var vector2a = getVectorAB(points[2],points[3]);
					var vector3a = getVectorAB(points[2],points[0]);
					points[p] = pos;
					var vector3b = getVectorAB(points[2],points[0]);
					var angle1 = getVectorAngle(vector3a);
					var angle2 = getVectorAngle(vector3b);
					var vector1b = rotateVector(vector1a,angle2-angle1);
					var vector2b = rotateVector(vector2a,angle2-angle1);
					points[1] = pointAddVector(points[2],vector1b);
					points[3] = pointAddVector(points[2],vector2b);
				} else if (p == 2) {
					var vector1a = getVectorAB(points[0],points[1]);
					var vector2a = getVectorAB(points[0],points[3]);
					var vector3a = getVectorAB(points[0],points[2]);
					points[p] = pos;
					var vector3b = getVectorAB(points[0],points[2]);
					var angle1 = getVectorAngle(vector3a);
					var angle2 = getVectorAngle(vector3b);
					var vector1b = rotateVector(vector1a,angle2-angle1);
					var vector2b = rotateVector(vector2a,angle2-angle1);
					points[1] = pointAddVector(points[0],vector1b);
					points[3] = pointAddVector(points[0],vector2b);
				} else if (p == 1) {
					points[p] = pos;
					var vector1 = getVectorAB(points[0],points[2]);
					var mid = getFootOfPerp(points[0],vector1,points[1]);
					var vector2 = getVectorAB(mid,points[1]);
					points[3] = pointAddVector(mid,vector2,-1);					
				}			
				break;
		}
	} else {
		points[p] = pos;
	}
	if (obj.anglesMode == 'exterior' && !un(obj.exteriorAngles)) {
		for (var v = 0; v < obj.exteriorAngles.length; v++) {
			var prev = v-1;
			if (prev == -1) prev = points.length-1;
			var next = v+1;
			if (next == points.length) next = 0;
			var vector1 = getVectorAB(points[prev],points[v]);
			var pos1 = pointAddVector(points[v],getUnitVector(vector1),obj.exteriorAngles[v].line2.dist);
			var vector2 = getVectorAB(points[next],points[v]);
			var pos2 = pointAddVector(points[v],getUnitVector(vector2),obj.exteriorAngles[v].line1.dist);	
			obj.exteriorAngles[v].line1.vector = vector2;
			obj.exteriorAngles[v].line1.pos = pos2;
			obj.exteriorAngles[v].line2.vector = vector1;
			obj.exteriorAngles[v].line2.pos = pos1;
		}
	}	
	
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}
	draw[taskId].prevX = mouse.x;
	draw[taskId].prevY = mouse.y;
}	
function polygonPointStop(e) {
	var pathNum = draw[taskId].currPathNum;
	var point = draw[taskId].currPoint;
	var obj = draw[taskId].path[pathNum].obj[0];	
	/*if (draw[taskId].gridSnap == true && !(!un(obj.polygonType) && obj.points.length == 4 && ['square','rect','para','trap','rhom','kite'].indexOf(obj.polygonType) > -1)) {	
		obj.points[point][0] = roundToNearest(obj.points[point][0],draw[taskId].gridSnapSize);
		obj.points[point][1] = roundToNearest(obj.points[point][1],draw[taskId].gridSnapSize);
		updateBorder(draw[taskId].path[pathNum]);
		drawCanvasPaths();
	}*/
	removeListenerMove(window,polygonPointMove);
	removeListenerEnd(window,polygonPointStop);
	changeDrawMode();
	draw[taskId].prevX = null;
	draw[taskId].prevY = null;		
}

function drawClickPolygonVerticesMinus() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var p = draw[taskId].path[pathNum].obj[0].points.length-1;
	if (p < 2) return;
	if (!un(draw[taskId].path[pathNum].obj[0].angles[p])) draw[taskId].path[pathNum].obj[0].points.angles[p] = null;
	draw[taskId].path[pathNum].obj[0].points.pop();
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}	
}
function drawClickPolygonVerticesPlus() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var first = draw[taskId].path[pathNum].obj[0].points[0];
	var last = draw[taskId].path[pathNum].obj[0].points[draw[taskId].path[pathNum].obj[0].points.length-1];
	draw[taskId].path[pathNum].obj[0].points.push([(first[0]+last[0])/2,(first[1]+last[1])/2]);
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}	
}
function drawClickPolygonSetType() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	var type = draw[taskId].currCursor.type;
	if (obj.polygonType == type) {
		obj.polygonType = 'none';
	} else {
		obj.polygonType = type;
	}
	switch (obj.polygonType) {
		case 'square':
			var vector1 = getVectorAB(obj.points[0],obj.points[1]);
			var vector2 = getPerpVector(vector1);
			obj.points[2] = pointAddVector(obj.points[1],vector2);
			obj.points[3] = pointAddVector(obj.points[2],vector1,-1);
			break;
		case 'rect':
			var vector1 = getVectorAB(obj.points[0],obj.points[1]);
			var vector2 = getPerpVector(vector1);
			vector2 = setVectorMag(vector2,getDist(obj.points[1],obj.points[2]));
			obj.points[2] = pointAddVector(obj.points[1],vector2,1);
			obj.points[3] = pointAddVector(obj.points[0],vector2,1);			
			break;
		case 'para':
			var vector1 = getVectorAB(obj.points[0],obj.points[1]);
			obj.points[3] = pointAddVector(obj.points[2],vector1,-1);
			break;
		case 'trap':
			var vector1 = getVectorAB(obj.points[0],obj.points[1]);
			vector1 = setVectorMag(vector1,getDist(obj.points[2],obj.points[3]));			
			obj.points[3] = pointAddVector(obj.points[2],vector1,-1);
			break;
		case 'rhom':
			var vector1 = getVectorAB(obj.points[0],obj.points[1]);
			var vector2 = getVectorAB(obj.points[1],obj.points[2]);
			vector2 = setVectorMag(vector2,getDist(obj.points[0],obj.points[1]));
			obj.points[2] = pointAddVector(obj.points[1],vector2);
			obj.points[3] = pointAddVector(obj.points[2],vector1,-1);
			break;
		case 'kite':
			var vector1 = getVectorAB(obj.points[0],obj.points[2]);
			var mid = getFootOfPerp(obj.points[0],vector1,obj.points[1]);
			var vector2 = getVectorAB(mid,obj.points[1]);
			obj.points[3] = pointAddVector(mid,vector2,-1);
			break;	
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}
}

function drawClickPolygonStartPrismPointDrag() {
	changeDrawMode('polygonPrismPointDrag');
	draw[taskId].prevX = mouse.x;
	draw[taskId].prevY = mouse.y;
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points	
	addListenerMove(window,polygonPrismPointMove);
	addListenerEnd(window,polygonPrismPointStop);	
}
function polygonPrismPointMove(e) {
	updateMouse(e);
	var dx = mouse.x - draw[taskId].prevX;
	var dy = mouse.y - draw[taskId].prevY;
	var pathNum = draw[taskId].currPathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	obj.prismVector[0] += dx;
	obj.prismVector[1] += dy;	
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}
	draw[taskId].prevX = mouse.x;
	draw[taskId].prevY = mouse.y;
}
function polygonPrismPointStop(e) {
	removeListenerMove(window,polygonPrismPointMove);
	removeListenerEnd(window,polygonPrismPointStop);
	changeDrawMode();
	draw[taskId].prevX = null;
	draw[taskId].prevY = null;		
}

function drawClickPolygonStartExtAnglePointDrag() {
	changeDrawMode('polygonExtAnglePointDrag');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	draw[taskId].currPoint = draw[taskId].currCursor.point;
	draw[taskId].currLine = draw[taskId].currCursor.line;
	updateSnapPoints(); // update intersection points	
	addListenerMove(window,polygonExtAnglePointMove);
	addListenerEnd(window,polygonExtAnglePointStop);	
}
function polygonExtAnglePointMove(e) {
	updateMouse(e);
	var x = mouse.x - draw[taskId].drawRelPos[0];
	var y = mouse.y - draw[taskId].drawRelPos[1];
	var pathNum = draw[taskId].currPathNum;
	var v = draw[taskId].currPoint;
	var line = draw[taskId].currLine;
	var obj = draw[taskId].path[pathNum].obj[0];
	var d = getDist([x,y],obj.points[v]);
	if (draw[taskId].currLine == 1) {
		obj.exteriorAngles[v].line1.dist = d;
		obj.exteriorAngles[v].line1.vector = setVectorMag(obj.exteriorAngles[v].line1.vector,d);
		obj.exteriorAngles[v].line1.pos = pointAddVector(obj.points[v],obj.exteriorAngles[v].line1.vector);
	} else {
		obj.exteriorAngles[v].line2.dist = d;
		obj.exteriorAngles[v].line2.vector = setVectorMag(obj.exteriorAngles[v].line2.vector,d);
		obj.exteriorAngles[v].line2.pos = pointAddVector(obj.points[v],obj.exteriorAngles[v].line2.vector);		
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}	
}
function polygonExtAnglePointStop(e) {
	removeListenerMove(window,polygonExtAnglePointMove);
	removeListenerEnd(window,polygonExtAnglePointStop);
	changeDrawMode();
	draw[taskId].currPoint = null;
	draw[taskId].currLine = null;	
}

function drawClickPolygonSetPrism() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	if (obj.solidType == 'prism') {
		delete obj.solidType;
	} else {
		obj.solidType = 'prism';
		if (un(obj.prismVector)) obj.prismVector = [100,-100];
	}
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}
}
function drawClickPolygonSetOuterAngles() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	obj.solidType = 'none';
	if (obj.anglesMode == 'outer') {
		obj.anglesMode = 'none';
	} else {
		obj.anglesMode = 'outer'
	}
	if (un(obj.outerAngles)) obj.outerAngles = []; 
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
		calcCursorPositions();		
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}
}
function drawClickPolygonSetExteriorAngles() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	obj.solidType = 'none';
	if (obj.anglesMode == 'exterior') {
		obj.anglesMode = 'none';
	} else {
		obj.anglesMode = 'exterior'
	}	
	if (un(obj.exteriorAngles)) obj.exteriorAngles = [];
	for (var p = 0; p < obj.points.length; p++) {
		var prev = p-1;
		if (prev == -1) prev = obj.points.length-1;
		var next = p+1;
		if (next == obj.points.length) next = 0;
		var vector1 = getVectorAB(obj.points[prev],obj.points[p]);
		var pos1 = pointAddVector(obj.points[p],getUnitVector(vector1),60);
		var vector2 = getVectorAB(obj.points[next],obj.points[p]);
		var pos2 = pointAddVector(obj.points[p],getUnitVector(vector2),60);	
		obj.exteriorAngles[p] = {
			line1:{show:false,vector:vector2,pos:pos2,dist:60},
			line2:{show:false,vector:vector1,pos:pos1,dist:60}
		}
	}
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
		calcCursorPositions();		
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}		
}
function drawClickPolygonSetAngleStyle() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	var p = draw[taskId].currCursor.point;
	if (obj.anglesMode == 'outer') {
		var prev = p-1;
		if (prev == -1) prev = obj.points.length-1;
		var next = p+1;
		if (next == obj.points.length) next = 0;
		var a1 = posToAngle(obj.points[prev][0],obj.points[prev][1],obj.points[p][0],obj.points[p][1]);
		var a2 = posToAngle(mouse.x-draw[taskId].drawRelPos[0],mouse.y-draw[taskId].drawRelPos[1],obj.points[p][0],obj.points[p][1]);
		var a3 = posToAngle(obj.points[next][0],obj.points[next][1],obj.points[p][0],obj.points[p][1]);
		if (anglesInOrder(a1,a2,a3) == true) {
			obj.outerAngles[p] = angleStyleIncrement(obj.outerAngles[p]);
		} else {
			obj.angles[p] = angleStyleIncrement(obj.angles[p]);
		}
	} else if (obj.anglesMode == 'exterior') {
		var prev = p-1;
		if (prev == -1) prev = obj.points.length-1;
		var next = p+1;
		if (next == obj.points.length) next = 0;
		var p1 = obj.points[prev];
		var p2 = obj.exteriorAngles[p].line1.pos;
		var p3 = obj.exteriorAngles[p].line2.pos;
		var p4 = obj.points[next];
		var a1 = posToAngle(p1[0],p1[1],obj.points[p][0],obj.points[p][1]);
		var a2 = posToAngle(p2[0],p2[1],obj.points[p][0],obj.points[p][1]);
		var a3 = posToAngle(p3[0],p3[1],obj.points[p][0],obj.points[p][1]);
		var a4 = posToAngle(p4[0],p4[1],obj.points[p][0],obj.points[p][1]);
		var aMouse = posToAngle(mouse.x-draw[taskId].drawRelPos[0],mouse.y-draw[taskId].drawRelPos[1],obj.points[p][0],obj.points[p][1]);	
		if (anglesInOrder(a1,aMouse,a2) == true) {
			obj.exteriorAngles[p].a3 = angleStyleIncrement(obj.exteriorAngles[p].a3);
			
		} else if (anglesInOrder(a2,aMouse,a3) == true) {
			obj.exteriorAngles[p].a2 = angleStyleIncrement(obj.exteriorAngles[p].a2);
		} else if (anglesInOrder(a3,aMouse,a4) == true) {
			obj.exteriorAngles[p].a1 = angleStyleIncrement(obj.exteriorAngles[p].a1);
		} else {
			obj.angles[p] = angleStyleIncrement(obj.angles[p]);
		}
		if (!un(obj.exteriorAngles[p].a3) || !un(obj.exteriorAngles[p].a2)) {
			obj.exteriorAngles[p].line1.show = true;
		} else {
			obj.exteriorAngles[p].line1.show = false;			
		}
		if (!un(obj.exteriorAngles[p].a1) || !un(obj.exteriorAngles[p].a2)) {
			obj.exteriorAngles[p].line2.show = true;
		} else {
			obj.exteriorAngles[p].line2.show = false;
		}
	} else {
		obj.angles[p] = angleStyleIncrement(obj.angles[p]);
	}
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		//drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}
}
function angleStyleIncrement(angle) {
	if (typeof angle == 'undefined' || angle == null) {
		angle = {style:0,radius:30};
	} else {
		switch (angle.style) {
			case 0:
				angle = {style:1,radius:30,labelMeasure:true,labelFontSize:25,labelRadius:33};
				break;
			case 1:
				angle = {style:2,radius:30,numOfCurves:2};
				break;
			case 2:
				angle = {style:3,radius:30,numOfCurves:3};
				break;				
			case 3:
				angle = {style:4,radius:30,fill:true,fillColor:'#CFC'};
				break;
			case 4:
				angle = {style:5,radius:30,fill:true,fillColor:'#CFC',labelMeasure:true,labelFontSize:25,labelRadius:33};
				break;
			case 5:
				angle = {style:6,radius:30,fill:true,fillColor:'#CCF'};
				break;
			case 6:
				angle = {style:7,radius:30,fill:true,fillColor:'#CCF',labelMeasure:true,labelFontSize:25,labelRadius:33};
				break;
			case 7:
				angle = {style:8,radius:30,fill:true,fillColor:'#FCC'};
				break;
			case 8:
				angle = {style:9,radius:30,fill:true,fillColor:'#FCC',labelMeasure:true,labelFontSize:25,labelRadius:33};
				break;								
			default:
				angle = undefined;
				break;
		}
	}	
	return angle;
}

function drawClickPolygonSetLineDecoration() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	var p = draw[taskId].currCursor.point;
	if (typeof obj.lineDecoration[p] == 'undefined' || obj.lineDecoration[p] == null) {
		obj.lineDecoration[p] = {style:0,type:'dash',number:1};
	} else {
		switch (obj.lineDecoration[p].style) {
			case 0:
				obj.lineDecoration[p] = {style:1,type:'dash',number:2};
				break;
			case 1:
				obj.lineDecoration[p] = {style:2,type:'arrow',direction:1,number:1};
				break;
			case 2:
				obj.lineDecoration[p] = {style:3,type:'arrow',direction:1,number:2};
				break;
			case 3:
				obj.lineDecoration[p] = {style:4,type:'arrow',direction:-1,number:1};
				break;
			case 4:
				obj.lineDecoration[p] = {style:5,type:'arrow',direction:-1,number:2};
				break;
			case 5:
			default:
				obj.lineDecoration[p] = undefined;
				break;
		}
	}
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		//drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}
}
function drawClickPolygonMakeRegular() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	var center = [obj.left+0.5*obj.width,obj.top+0.5*obj.height];
	var radius = 0.5*Math.min(obj.width,obj.height);
	var numOfSides = obj.points.length;
	var startAngle = -0.5*Math.PI;
	if (numOfSides % 2 == 0) {
		startAngle += (Math.PI/numOfSides)
	}
	var angle = startAngle;
	obj.points = [];
	for (var i = 0; i < numOfSides; i++) {
		obj.points[i] = [center[0]+radius*Math.cos(angle),center[1]+radius*Math.sin(angle)];
		angle += (2*Math.PI)/numOfSides;
	}
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
		calcCursorPositions();		
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}
}

/**********************/
/*					  */
/*		 ANGLES	 	  */
/*				  	  */
/**********************/

function addAngle() {
	deselectAllPaths(false);
	changeDrawMode();
	draw[taskId].path.push({obj:[{
		type:'angle',
		b:[900-draw[taskId].drawRelPos[0],200-draw[taskId].drawRelPos[1]],
		radius:35,
		angleC:0,
		c:[900-draw[taskId].drawRelPos[0]+35*Math.cos(0),200-draw[taskId].drawRelPos[1]+35*Math.sin(0)],
		angleA:-Math.PI/3,
		a:[900-draw[taskId].drawRelPos[0]+35*Math.cos(-Math.PI/3),200-draw[taskId].drawRelPos[1]+35*Math.sin(-Math.PI/3)],
		lineWidth:draw[taskId].thickness,
		lineColor:draw[taskId].color,
		fillColor:'none',
		fill:true,
		drawLines:true,
		squareForRight:false,
		labelIfRight:true
	}],selected:true,trigger:[]});
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);			
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		updateBorder(draw[taskId].path.last());			
		drawCanvasPaths();
	}
}
function addAngle2() {
	deselectAllPaths(false);
	changeDrawMode();
	var obj = {
		type:'angle',
		b:[900-draw[taskId].drawRelPos[0],200-draw[taskId].drawRelPos[1]],
		radius:30,
		angleC:0,
		c:[900-draw[taskId].drawRelPos[0]+80*Math.cos(0),200-draw[taskId].drawRelPos[1]+80*Math.sin(0)],
		angleA:-Math.PI/3,
		a:[900-draw[taskId].drawRelPos[0]+80*Math.cos(-Math.PI/3),200-draw[taskId].drawRelPos[1]+80*Math.sin(-Math.PI/3)],
		lineWidth:draw[taskId].thickness,
		lineColor:draw[taskId].color,
		fillColor:'none',
		fill:true,
		drawLines:true,
		d:[],
		calcD:function() {
			this.angleA = posToAngle(this.a[0],this.a[1],this.b[0],this.b[1]);
			this.d = [this.b[0] + this.radius*Math.cos(this.angleA),this.b[1] + this.radius*Math.sin(this.angleA)];
		}
	}
	obj.calcD();
	draw[taskId].path.push({obj:[obj],selected:true,trigger:[]});
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);			
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		updateBorder(draw[taskId].path.last());			
		drawCanvasPaths();
	}	
}
function drawClickAngleStartDragA() {
	changeDrawMode('angleDragA');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points	
	addListenerMove(window,angleMove);
	addListenerEnd(window,angleStop);		
}
function drawClickAngleStartDragB() {
	changeDrawMode('angleDragB');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[draw[taskId].currPathNum].obj[0];
	draw[taskId].relPosA = getVectorAB(obj.b,obj.a);
	draw[taskId].relPosC = getVectorAB(obj.b,obj.c);
	if (!un(obj.d)) draw[taskId].relPosD = getVectorAB(obj.b,obj.d);
	updateSnapPoints(); // update intersection points
	drawCanvasPaths()	
	addListenerMove(window,angleMove);
	addListenerEnd(window,angleStop);		
}
function drawClickAngleStartDragC() {
	changeDrawMode('angleDragC');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points
	addListenerMove(window,angleMove);
	addListenerEnd(window,angleStop);	
}
function drawClickAngleStartDragD() {
	changeDrawMode('angleDragD');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	updateSnapPoints(); // update intersection points
	addListenerMove(window,angleMove);
	addListenerEnd(window,angleStop);	
}
function angleMove(e) {
	updateMouse(e);
	var pos = [mouse.x - draw[taskId].drawRelPos[0],mouse.y - draw[taskId].drawRelPos[1]];
	if (ctrlOn || draw[taskId].snapLinesTogether) pos = snapToObj2(pos);
	var pathNum = draw[taskId].currPathNum;
	var obj = draw[taskId].path[pathNum].obj[0];	
	if (draw[taskId].drawMode == 'angleDragB') {
		obj.b = pos;
		obj.a = pointAddVector(obj.b,draw[taskId].relPosA);
		obj.c = pointAddVector(obj.b,draw[taskId].relPosC);
		if (!un(obj.d)) obj.d = pointAddVector(obj.b,draw[taskId].relPosD);
	} else if (!un(obj.d)) {
		if (draw[taskId].drawMode == 'angleDragA') {
			obj.a = pos;
			obj.recalcD = true;
		} else if (draw[taskId].drawMode == 'angleDragC') {
			obj.c = pos;
			obj.recalcD = true;
		} else if (draw[taskId].drawMode == 'angleDragD') {
			obj.radius = getDist(obj.b,pos);
			obj.calcD();
			if (!un(obj.labelRadius)) {
				obj.labelRadius = obj.radius+3;
			}
		}		
	} else {
		if (draw[taskId].drawMode == 'angleDragA') {
			obj.angleA = getAngleTwoPoints(obj.b,pos);
			obj.a = [obj.b[0]+obj.radius*Math.cos(obj.angleA),obj.b[1]+obj.radius*Math.sin(obj.angleA)];
		} else if (draw[taskId].drawMode == 'angleDragC') {
			obj.angleC = getAngleTwoPoints(obj.b,pos);
			obj.c = [obj.b[0]+obj.radius*Math.cos(obj.angleC),obj.b[1]+obj.radius*Math.sin(obj.angleC)];
		}
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		//drawCanvasPaths();
		drawCanvasPath(pathNum);
		drawSelectCanvas();
	}
	draw[taskId].prevX = mouse.x;
	draw[taskId].prevY = mouse.y;
}	
function angleStop(e) {
	removeListenerMove(window,angleMove);
	removeListenerEnd(window,angleStop);
	changeDrawMode();		
}
function drawClickAngleShowLines() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (typeof obj.drawLines == 'undefined') {
		obj.drawLines = false;
	} else {
		obj.drawLines = !obj.drawLines;
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
	} else {
		//drawCanvasPaths();
		drawCanvasPath(pathNum);
		drawSelectCanvas();
	}	
}
function drawClickAngleShowAngle() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (typeof obj.labelMeasure == 'undefined') {
		obj.labelMeasure = true;
	} else {
		obj.labelMeasure = !obj.labelMeasure;
	}
	obj.labelFontSize = 25;
	obj.labelRadius = obj.radius+3;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
	} else {
		//drawCanvasPaths();
		drawCanvasPath(pathNum);
		drawSelectCanvas();
	}	
}
function drawClickAngleNumOfCurves() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (typeof obj.numOfCurves == 'undefined') {
		obj.numOfCurves = 2;
	} else {
		obj.numOfCurves++;
		if (obj.numOfCurves == 4) obj.numOfCurves = 1;
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
	} else {
		//drawCanvasPaths();
		drawCanvasPath(pathNum);
		drawSelectCanvas();
	}
}

/************************/
/*					  	*/
/* ANGLES AROUND POINT	*/
/*				  	  	*/
/************************/

function addAnglesAroundPoint() {
	deselectAllPaths(false);
	draw[taskId].path.push({obj:[{
		type:'anglesAroundPoint',
		center:[400-draw[taskId].drawRelPos[0],300-draw[taskId].drawRelPos[1]],
		points:[
			[300-draw[taskId].drawRelPos[0],300-draw[taskId].drawRelPos[1]],
			[400-draw[taskId].drawRelPos[0],200-draw[taskId].drawRelPos[1]],
			[500-draw[taskId].drawRelPos[0],300-draw[taskId].drawRelPos[1]]
		],
		color:draw[taskId].color,
		thickness:draw[taskId].thickness,
		angles:[],
		radius:100
	}],selected:true,trigger:[]});
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);			
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		updateBorder(draw[taskId].path.last());			
		drawCanvasPaths();
	}
	changeDrawMode();
}
function anglesAroundPointPointsMinus() {
	var path = draw[taskId].path[draw[taskId].currCursor.pathNum];
	var obj = path.obj[0];
	if (obj.points.length > 2) {
		if (!un(obj.angles) && !un(obj.angles[obj.points.length-1])) obj.angles[obj.points.length-1] = null;
		obj.points.pop();
	}
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPath(pathNum);
		drawSelectCanvas();
	}
}
function anglesAroundPointPointsPlus() {
	var path = draw[taskId].path[draw[taskId].currCursor.pathNum];
	var obj = path.obj[0];
	var theta1 = 2*Math.PI - posToAngle(obj.points[0][0],obj.points[0][1],obj.center[0],obj.center[1]);
	var theta2 = 2*Math.PI - posToAngle(obj.points[obj.points.length-1][0],obj.points[obj.points.length-1][1],obj.center[0],obj.center[1]);
	//console.log(theta1,theta2);
	obj.points.push(angleToPos((theta1+theta2)/2,obj.center[0],obj.center[1],obj.radius));
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPath(pathNum);
		drawSelectCanvas();
	}
}
function anglesAroundPointFixRadius() {
	var path = draw[taskId].path[draw[taskId].currCursor.pathNum];
	var obj = path.obj[0];
	anglesAroundPointFixToRadius(obj);
}
function anglesAroundPointFixToRadius(obj) {
	for (var p = 0; p < obj.points.length; p++) {
		var theta = 2*Math.PI - posToAngle(obj.points[p][0],obj.points[p][1],obj.center[0],obj.center[1]);
		obj.points[p] = angleToPos(theta,obj.center[0],obj.center[1],obj.radius);
	}
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPath(pathNum);
		drawSelectCanvas();
	}
}
function drawClickAnglesAroundPointStartPointDrag() {
	changeDrawMode('anglesAroundPointPointDrag');
	draw[taskId].currPathNum = draw[taskId].currCursor.pathNum;
	draw[taskId].currPoint = draw[taskId].currCursor.point;
	updateSnapPoints(); // update intersection points	
	addListenerMove(window,anglesAroundPointPointMove);
	addListenerEnd(window,anglesAroundPointPointStop);	
}
function anglesAroundPointPointMove(e) {
	updateMouse(e);
	var pos = [mouse.x - draw[taskId].drawRelPos[0],mouse.y - draw[taskId].drawRelPos[1]];
	if (ctrlOn || draw[taskId].snapLinesTogether) pos = snapToObj2(pos);
	var pathNum = draw[taskId].currPathNum;
	var point = draw[taskId].currPoint;
	var obj = draw[taskId].path[pathNum].obj[0];
	obj.points[point] = pos;
	if (shiftOn) {
		var angle = getAngleTwoPoints(obj.center,[mouse.x,mouse.y]);
		if (angle < 0) angle += 2*Math.PI;
		var len = getDist(obj.center,pos);
		var snap = (roundToNearest(roundToNearest(angle,Math.PI/2)/(Math.PI/2),1))%4;
		if (snap == 0) {
			obj.points[point] = [obj.center[0]+len,obj.center[1]];
		} else if (snap == 1) {
			obj.points[point] = [obj.center[0],obj.center[1]+len];			
		} else if (snap == 2) {
			obj.points[point] = [obj.center[0]-len,obj.center[1]];			
		} else if (snap == 3) {
			obj.points[point] = [obj.center[0],obj.center[1]-len];			
		}
	}
	prevPoint = point-1;
	if (prevPoint < 0) prevPoint = obj.points.length-1;
	var angle1 = posToAngle(obj.points[prevPoint][0],obj.points[prevPoint][1],obj.center[0],obj.center[1]);
	var angle2 = posToAngle(obj.points[point][0],obj.points[point][1],obj.center[0],obj.center[1]);
	nextPoint = point+1;
	if (nextPoint > obj.points.length-1) nextPoint = 0;
	var angle3 = posToAngle(obj.points[nextPoint][0],obj.points[nextPoint][1],obj.center[0],obj.center[1]);
	
	if ((angle1 < angle2 && angle2 < angle3) || // order 123
		(angle2 < angle3 && angle3 < angle1) || // order 231
		(angle3 < angle1 && angle1 < angle2)) { // order 312
	} else {
		if (Math.abs(angle2-angle1) < Math.abs(angle3-angle2)) {
			// swap prevPoint & point
			var prev1 = clone(obj.points[prevPoint]);
			var prev2 = clone(obj.points[point]);
			obj.points[point] = prev1;
			obj.points[prevPoint] = prev2;
			var prevA1 = clone(obj.angles[prevPoint]);
			var prevA2 = clone(obj.angles[point]);
			obj.angles[point] = prevA1;
			obj.angles[prevPoint] = prevA2;			
			draw[taskId].currPoint = prevPoint;
		} else {
			// swap point & nextPoint
			var prev1 = clone(obj.points[nextPoint]);
			var prev2 = clone(obj.points[point]);
			obj.points[point] = prev1;
			obj.points[nextPoint] = prev2;
			var prevA1 = clone(obj.angles[nextPoint]);
			var prevA2 = clone(obj.angles[point]);
			obj.angles[point] = prevA1;
			obj.angles[nextPoint] = prevA2;
			draw[taskId].currPoint = nextPoint;			
		}
	}
	
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPath(pathNum);
		drawSelectCanvas();
	}
	draw[taskId].prevX = mouse.x;
	draw[taskId].prevY = mouse.y;
}	
function anglesAroundPointPointStop(e) {
	var pathNum = draw[taskId].currPathNum;
	var point = draw[taskId].currPoint;
	var obj = draw[taskId].path[pathNum].obj[0];	
	if (draw[taskId].gridSnap == true) {	
		obj.points[point][0] = roundToNearest(obj.points[point][0],draw[taskId].gridSnapSize);
		obj.points[point][1] = roundToNearest(obj.points[point][1],draw[taskId].gridSnapSize);
		if (pathCanvasMode) {
			pathCanvasDraw(draw[taskId].path[pathNum]);				
			drawSelectCanvas();
		} else {
			updateBorder(draw[taskId].path[pathNum]);			
			drawCanvasPath(pathNum);
			drawSelectCanvas();
		}
	}
	removeListenerMove(window,anglesAroundPointPointMove);
	removeListenerEnd(window,anglesAroundPointPointStop);
	changeDrawMode();		
}
function drawClickAnglesAroundPointSetAngleStyle(e) {
	updateMouse(e);
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	var mouseAngle = posToAngle(mouse.x,mouse.y,obj.center[0]+draw[taskId].drawRelPos[0],obj.center[1]+draw[taskId].drawRelPos[1]);
	
	var angles = [];
	var p = -1;
	for (var i = 0; i < obj.points.length; i++) {
		angles[i] = posToAngle(obj.points[i][0],obj.points[i][1],obj.center[0],obj.center[1]);
	}
	for (var i = 0; i < angles.length; i++) {
		var a1 = angles[i];
		if (i < angles.length-1) {
			var a2 = angles[i+1];
		} else {
			var a2 = angles[0];
		}
		if (mouseAngle > a1 && (mouseAngle < a2 || a2 < a1)) {
			p = i;
			break;
		}
	}
		
	if (typeof obj.angles[p] == 'undefined') {
		obj.angles[p] = {style:0,radius:30};
	} else {
		switch (obj.angles[p].style) {
			case 0:
				obj.angles[p] = {style:1,radius:30,labelMeasure:true,labelFontSize:25,labelRadius:33};
				break;
			case 1:
				obj.angles[p] = {style:2,radius:30,numOfCurves:2};
				break;
			case 2:
				obj.angles[p] = {style:3,radius:30,numOfCurves:3};
				break;				
			case 3:
				obj.angles[p] = {style:4,radius:30,fill:true,fillColor:'#CFC'};
				break;
			case 4:
				obj.angles[p] = {style:5,radius:30,fill:true,fillColor:'#CFC',labelMeasure:true,labelFontSize:25,labelRadius:33};
				break;
			case 5:
				obj.angles[p] = {style:6,radius:30,fill:true,fillColor:'#CCF'};
				break;
			case 6:
				obj.angles[p] = {style:7,radius:30,fill:true,fillColor:'#CCF',labelMeasure:true,labelFontSize:25,labelRadius:33};
				break;
			case 7:
				obj.angles[p] = {style:8,radius:30,fill:true,fillColor:'#FCC'};
				break;
			case 8:
				obj.angles[p] = {style:9,radius:30,fill:true,fillColor:'#FCC',labelMeasure:true,labelFontSize:25,labelRadius:33};
				break;								
			default:
				obj.angles[p] = undefined;
				break;
		}
	}
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);	
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPath(pathNum);
	}	
}

/**********************/
/*					  */
/*	   MULT CHOICE 	  */
/*				  	  */
/**********************/

function addMultChoice() {
	deselectAllPaths(false);
	var mInputs = [];
	for (var i = 0; i < 6; i++) {
		var cellLeft = 100-draw[taskId].drawRelPos[0] + 128*(i%4);
		var cellTop = 200-draw[taskId].drawRelPos[1];
		var vis = true;
		if (i >= 4*1) vis = false;
		mInputs[i] = createMathsInput2({
			left:cellLeft,
			top:cellTop,
			width:120,
			height:60,
			varSize:{minWidth:30,maxWidth:120,minHeight:50,maxHeight:60,padding:5},
			backColor:'none',
			selectColor:'none',
			border:true,
			borderColor:'#00F',
			borderWidth:1,
			borderDash:[5,8],
			textAlign:'center',
			vertAlign:'middle',
			maxLines:1,
			fontSize:32,
			selectable:true,
			visible:vis,
			zIndex:draw[taskId].zIndex,
			pointerCanvas:draw[taskId].cursorCanvas
		});
	}
	
	draw[taskId].path.push({obj:[{
		type:'multChoice',
		cols:4,
		rows:1,
		thickness:4,
		fillColor:'#FFC',
		selectedFillColor:'#0FF',
		correctFillColor:'#6F9',
		color:'#000',
		left:100-draw[taskId].drawRelPos[0],
		top:200-draw[taskId].drawRelPos[1],
		cellWidth:120,
		cellHeight:60,
		spacing:8,
		width:120*4+8*3,
		height:60,
		randomOrder:false,
		text:[['<<font:Arial>><<fontSize:32>><<align:center>>'],['<<font:Arial>><<fontSize:32>><<align:center>>'],['<<font:Arial>><<fontSize:32>><<align:center>>'],['<<font:Arial>><<fontSize:32>><<align:center>>'],['<<font:Arial>><<fontSize:32>><<align:center>>'],['<<font:Arial>><<fontSize:32>><<align:center>>']],
		mInputs:mInputs,
		correctCell:0,
		selectedCell:-1,
		mode:'edit',
		textAlign:'center',
	}],selected:true,trigger:[]});
	repositionPath(draw[taskId].path[draw[taskId].path.length-1]);	
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);			
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		updateBorder(draw[taskId].path.last());			
		drawCanvasPaths();
	}
	changeDrawMode();
}
function drawClickMultChoiceChangeCorrect() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	obj.correctCell = draw[taskId].currCursor.num;
	var pathNum = draw[taskId].currCursor.pathNum;
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[draw[taskId].currCursor.pathNum]);
		drawCanvasPath(pathNum);
	}
}
function drawClickMultChoiceColsMinus() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	obj.cols = Math.max(1,obj.cols-1);
	multChoiceRecalc(draw[taskId].path[draw[taskId].currCursor.pathNum]);
}
function drawClickMultChoiceColsPlus() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	obj.cols = Math.min(6,obj.cols+1);
	while (obj.rows * obj.cols > 6) {
		obj.rows--;
	}
	multChoiceRecalc(draw[taskId].path[draw[taskId].currCursor.pathNum]);
}
function drawClickMultChoiceRowsMinus() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	obj.rows = Math.max(1,obj.rows-1);
	multChoiceRecalc(draw[taskId].path[draw[taskId].currCursor.pathNum]);
}
function drawClickMultChoiceRowsPlus() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	obj.rows = Math.min(6,obj.rows+1);
	while (obj.rows * obj.cols > 6) {
		obj.cols--;
	}
	multChoiceRecalc(draw[taskId].path[draw[taskId].currCursor.pathNum]);
}
function multChoiceRecalc(path) {
	var obj = path.obj[0];
	obj.width = obj.cols * obj.cellWidth + (obj.cols-1) * obj.spacing;
	obj.height = obj.rows * obj.cellHeight + (obj.rows-1) * obj.spacing;
	for (var m = 0; m < obj.mInputs.length; m++) {
		var l = obj.left + (m % obj.cols) * (obj.cellWidth + obj.spacing);
		var t = obj.top + Math.floor(m / obj.cols) * (obj.cellHeight + obj.spacing);		
		moveMathsInput(obj.mInputs[m],l,t);
		if (m < obj.cols * obj.rows) {
			showMathsInput(obj.mInputs[m]);
		} else {
			hideMathsInput(obj.mInputs[m]);
		}
	}
	if (pathCanvasMode) {
		pathCanvasDraw(path);			
		drawSelectCanvas();
	} else {
		updateBorder(path);
		drawCanvasPath(draw[taskId].path.indexOf(path));
		drawSelectCanvas();
	}
}

function drawClickMultChoiceStartChangeSpacing(e) {
	changeDrawMode('multChoiceSpacingResize');
	draw[taskId].dir = draw[taskId].currCursor.dir;
	draw[taskId].selectedPath = draw[taskId].currCursor.pathNum;
	draw[taskId].prev = [mouse.x,mouse.y];
	addListenerMove(window,drawClickMultChoiceMoveChangeSpacing);
	addListenerEnd(window,drawClickMultChoiceStopChangeSpacing);	
}
function drawClickMultChoiceMoveChangeSpacing(e) {
	updateMouse(e);
	if (draw[taskId].dir == 'h') {
		var ds = Math.max(mouse.x - draw[taskId].prev[0],0);
	} else {
		var ds = Math.max(mouse.y - draw[taskId].prev[1],0);
	}
	var obj = draw[taskId].path[draw[taskId].selectedPath].obj[0];
	obj.spacing += ds;
	multChoiceRecalc(draw[taskId].path[draw[taskId].selectedPath]);
	draw[taskId].prev = [mouse.x,mouse.y];	
}
function drawClickMultChoiceStopChangeSpacing() {
	removeListenerMove(window,drawClickMultChoiceMoveChangeSpacing);
	removeListenerEnd(window,drawClickMultChoiceStopChangeSpacing);
	delete draw[taskId].dir;
	delete draw[taskId].prev;
	changeDrawMode('prev');	
}

function drawClickMultChoiceSelectCell() {
	var qId = draw[taskId].currCursor.qId;
	var p = draw[taskId].currCursor.p;
	var o = draw[taskId].currCursor.o;
	var cell = draw[taskId].currCursor.cell;
	var obj = draw[taskId].qBox2.q[qId].paths[p].obj[o];
	if (obj.selectedCell == cell) {
		obj.selectedCell = -1;
	} else {
		obj.selectedCell = cell;
	}
	qBox2PathsToSingleCanvas(qId,true);
}

/**********************/
/*					  */
/*	   	TABLE	 	  */
/*				  	  */
/**********************/

function addTable(r,c) {
	deselectAllPaths(false);
	changeDrawMode();	
	var left = 100-draw[taskId].drawRelPos[0];
	var top = 150-draw[taskId].drawRelPos[1];
	var width = Math.min(400/c,80);
	var height = Math.min(500/r,50);
	var cells = [];
	var mInputs = [];
	for (var i = 0; i < r; i++) {
		cellRow = [];
		mInputsRow = [];
		for (var j = 0; j < c; j++) {
			cellRow.push({minWidth:width,minHeight:height,selected:false,highlight:false,trigger:[]});
			mInputsRow.push({data:[left+j*width+10-2.5,top+i*height+10-2.5,width-20,height-20]});
		}
		cells.push(cellRow);
		mInputs.push(mInputsRow);
	}
	draw[taskId].path.push({obj:[{
		type:'table',
		left:left,
		top:top,
		minCellWidth:20,
		minCellHeight:20,
		rows:r-1,
		cols:c-1,
		horizAlign:'center',
		text:{font:'Arial',size:24,color:'#000'},
		outerBorder:{show:true,width:4,color:'#000'},
		innerBorder:{show:true,width:2,color:'#666',dash:[]},
		cells:cells,
		mInputs:mInputs
	}],selected:true,trigger:[]});
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);			
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		updateBorder(draw[taskId].path.last());			
		drawCanvasPaths();
	}
	calcCursorPositions();	
	tableMenuClose();
	
	setTimeout(function() {
		var mInputs = [];
		for (var i = 0; i < r; i++) {
			mInputsRow = [];
			for (var j = 0; j < c; j++) {
				var mInput = createMathsInput2({
					left:left+j*width+10-2.5,
					top:top+i*height+10-2.5,
					width:width-20,
					height:height-20,
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
					pointerCanvas:draw[taskId].cursorCanvas,
					textArray:['<<font:Arial>><<fontSize:24>><<align:center>>'],
					fontSize:24,
					textAlign:'center'
				});
				//setMathsInputText(mInput,['<<font:Arial>><<fontSize:24>><<align:center>>']);
				mInputsRow.push(mInput);
			}
			mInputs.push(mInputsRow);
		}
		draw[taskId].path[draw[taskId].path.length-1].obj[0].mInputs = mInputs;
		if (pathCanvasMode) {
			pathCanvasDraw(draw[taskId].path.last(),true);			
			calcCursorPositions();
		} else {
			updateBorder(draw[taskId].path.last());			
			drawCanvasPath(draw[taskId].path.length-1);
		}
	},10);
}
function addTable2(r,c) {
	deselectAllPaths(false);
	changeDrawMode();	
	var left = 100-draw[taskId].drawRelPos[0];
	var top = 150-draw[taskId].drawRelPos[1];
	var width = Math.min(400/c,80);
	var height = Math.min(500/r,50);
	var cells = [];
	var mInputs = [];
	var widths = [];
	var heights = [];
	for (var i = 0; i < r; i++) {
		cellRow = [];
		mInputsRow = [];
		for (var j = 0; j < c; j++) {
			cellRow.push({selected:false,highlight:false,trigger:[]});
			mInputsRow.push({data:[left+j*width+10-2.5,top+i*height+10-2.5,width-20,height-20]});
		}
		cells.push(cellRow);
		mInputs.push(mInputsRow);
		heights.push(height);
	}
	for (var j = 0; j < c; j++) {
		widths.push(width);
	}
	
	draw[taskId].path.push({obj:[{
		type:'table2',
		left:left,
		top:top,
		widths:widths,
		heights:heights,
		rows:r-1,
		cols:c-1,
		horizAlign:'center',
		text:{font:'Arial',size:24,color:'#000'},
		outerBorder:{show:true,width:4,color:'#000',dash:[0,0]},
		innerBorder:{show:true,width:2,color:'#666',dash:[0,0]},
		cells:cells,
		mInputs:mInputs
	}],selected:true,trigger:[]});
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);			
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		updateBorder(draw[taskId].path.last());			
		drawCanvasPaths();
	}
	calcCursorPositions();	
	tableMenuClose();
	
	setTimeout(function() {
		var mInputs = [];
		if (pathCanvasMode) {
			var z = draw[taskId].path[draw[taskId].path.length-1].ctx.canvas.style.zIndex+1;
		} else {
			var z = 2000;
		}
		for (var i = 0; i < r; i++) {
			mInputsRow = [];
			for (var j = 0; j < c; j++) {
				var mInput = createMathsInput2({
					left:left+j*width+10-2.5,
					top:top+i*height+10-2.5,
					width:width-20,
					height:height-20,
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
					zIndex:z,
					pointerCanvas:draw[taskId].cursorCanvas,
					textArray:['<<font:Arial>><<fontSize:24>><<align:center>>'],
					fontSize:24,
					textAlign:'center'
				});
				mInputsRow.push(mInput);
			}
			mInputs.push(mInputsRow);
		}
		draw[taskId].path[draw[taskId].path.length-1].obj[0].mInputs = mInputs;
		if (pathCanvasMode) {
			pathCanvasDraw(draw[taskId].path.last(),true);
			//pathCanvasReset();
			calcCursorPositions();
		} else {
			updateBorder(draw[taskId].path.last());			
			drawSelectCanvas();
			//drawCanvasPath(draw[taskId].path.length-1);
		}
	},10);
}

function drawClickTableCellSetTrigger() {
	var obj = draw[taskId].path[draw[taskId].currCursor.pathNum].obj[0];
	var r = draw[taskId].currCursor.r;
	var c = draw[taskId].currCursor.c;
	if (typeof obj.cells[r][c].trigger == 'undefined') obj.cells[r][c].trigger = [];
	var prevVis = true;
	for (var l = 0; l <= draw[taskId].triggerNum; l++) {
		if (typeof obj.cells[r][c].trigger[l] == 'boolean') {
			prevVis = obj.cells[r][c].trigger[l];
		}
	}
	obj.cells[r][c].trigger[draw[taskId].triggerNum] = !prevVis;
	if (draw[taskId].triggerNum == draw[taskId].triggerNumMax) {
		draw[taskId].triggerNumMax++;
		slider[taskId][1].max = draw[taskId].triggerNumMax;
		slider[taskId][1].sliderData[100] = slider[taskId][1].left + (draw[taskId].triggerNum / draw[taskId].triggerNumMax) * slider[taskId][1].width;
		resize();
	}
	if (pathCanvasMode) {
		pathCanvasDraw(path);			
	} else {
		drawCanvasPath(draw[taskId].currCursor.pathNum);
	}	
}

function drawClickTableResizeCol() {
	changeDrawMode('tableColResize');
	draw[taskId].tableColResizing = draw[taskId].currCursor.c;
	draw[taskId].selectedPath = draw[taskId].currCursor.pathNum;
	addListenerMove(window,tableColResizeMove);
	addListenerEnd(window,tableColResizeStop);
}
function tableColResizeMove(e) {
	updateMouse(e);
	var path = draw[taskId].path[draw[taskId].selectedPath];
	var width = mouse.x - draw[taskId].drawRelPos[0] - path.obj[0].xPos[draw[taskId].tableColResizing - 1]; 
	if (path.obj[0].type == 'table') {
		for (var i = 0; i < path.obj[0].cells.length; i++) {
			path.obj[0].cells[i][draw[taskId].tableColResizing-1].minWidth = width;
		}
	} else if (path.obj[0].type == 'table2') {
		path.obj[0].widths[draw[taskId].tableColResizing-1] = width;
		path.obj[0].width = arraySum(path.obj[0].widths);
	}
	repositionPath(path);
	if (pathCanvasMode) {
		pathCanvasDraw(path);
		drawSelectCanvas();
	} else {
		updateBorder(path);
		drawCanvasPath(draw[taskId].selectedPath);
		drawSelectCanvas();
	}
}	
function tableColResizeStop(e) {
	removeListenerMove(window,tableColResizeMove);
	removeListenerEnd(window,tableColResizeStop);
	changeDrawMode('prev');
}

function drawClickTableResizeRow() {
	changeDrawMode('tableRowResize');
	draw[taskId].tableRowResizing =  draw[taskId].currCursor.r;
	draw[taskId].selectedPath = draw[taskId].currCursor.pathNum;											
	addListenerMove(window,tableRowResizeMove);
	addListenerEnd(window,tableRowResizeStop);	
}
function tableRowResizeMove(e) {
	updateMouse(e);
	var path = draw[taskId].path[draw[taskId].selectedPath];
	var height = mouse.y - draw[taskId].drawRelPos[1] - path.obj[0].yPos[draw[taskId].tableRowResizing - 1]; 
	if (path.obj[0].type == 'table') {
		for (var i = 0; i < path.obj[0].cells[draw[taskId].tableRowResizing-1].length; i++) {
			path.obj[0].cells[draw[taskId].tableRowResizing-1][i].minHeight = height;
		}
		repositionPath(path);	
	} else if (path.obj[0].type == 'table2') {
		path.obj[0].heights[draw[taskId].tableRowResizing-1] = height;
		path.obj[0].height = arraySum(path.obj[0].heights);
	}
	if (pathCanvasMode) {
		pathCanvasDraw(path);
		repositionPath(path);
		drawSelectCanvas();
	} else {
		updateBorder(path);
		drawCanvasPath(draw[taskId].selectedPath);
		drawSelectCanvas();
	}
}	
function tableRowResizeStop(e) {
	removeListenerMove(window,tableRowResizeMove);
	removeListenerEnd(window,tableRowResizeStop);
	changeDrawMode('prev');
	draw[taskId].prevY = null;
}

function drawClickTableSelectCol() {
	var c = draw[taskId].currCursor.c-1;
	var pathNum = draw[taskId].currCursor.pathNum;
	var path = draw[taskId].path[pathNum];	
	var cells = path.obj[0].cells;
	for (var k = 0; k < cells.length; k++) {
		for (var l = 0; l < cells[k].length; l++) {
			if (l == c) {
				cells[k][l].selected = true;
				cells[k][l].highlight = true;
				// redraw mathsInput selected
				var mInput = path.obj[0].mInputs[k][l];
				mInput.richText = removeSelectTagsFromArray(mInput.richText);
				mInput.richText.unshift('<<selected:true>>');
				mInput.richText.push('<<selected:false>>');
				drawMathsInputText(mInput);
			} else {
				cells[k][l].selected = false;
				cells[k][l].highlight = false;
				// redraw mathsInput unselected
				var mInput = path.obj[0].mInputs[k][l];
				mInput.richText = removeSelectTagsFromArray(mInput.richText);
				drawMathsInputText(mInput);								
			}
		}
	}
	if (pathCanvasMode) {
		pathCanvasDraw(path);
	} else {
		drawCanvasPath(pathNum);
	}	
	draw[taskId].startX = mouse.x;
	draw[taskId].startY = mouse.y;
	changeDrawMode('tableColSelect');
	addListenerMove(window,tableCellSelectMove);
	addListenerEnd(window,tableCellSelectStop);	
}
function drawClickTableSelectRow() {
	var r = draw[taskId].currCursor.r-1;
	var pathNum = draw[taskId].currCursor.pathNum;	
	var path = draw[taskId].path[pathNum];
	var cells = path.obj[0].cells;
	for (var k = 0; k < cells.length; k++) {
		for (var l = 0; l < cells[k].length; l++) {
			if (k == r) {
				cells[k][l].selected = true;
				cells[k][l].highlight = true;
				// redraw mathsInput selected
				var mInput = path.obj[0].mInputs[k][l];
				mInput.richText = removeSelectTagsFromArray(mInput.richText);
				mInput.richText.unshift('<<selected:true>>');
				mInput.richText.push('<<selected:false>>');
				drawMathsInputText(mInput);
			} else {
				cells[k][l].selected = false;
				cells[k][l].highlight = false;
				// redraw mathsInput unselected
				var mInput = path.obj[0].mInputs[k][l];
				mInput.richText = removeSelectTagsFromArray(mInput.richText);
				drawMathsInputText(mInput);								
			}
		}
	}
	if (pathCanvasMode) {
		pathCanvasDraw(path);
	} else {
		drawCanvasPath(pathNum);
	}
	draw[taskId].startX = mouse.x;
	draw[taskId].startY = mouse.y;
	changeDrawMode('tableRowSelect');
	addListenerMove(window,tableCellSelectMove);
	addListenerEnd(window,tableCellSelectStop);	
}
function drawClickTableSelectCell() {
	var c = draw[taskId].currCursor.c;
	var r = draw[taskId].currCursor.r;
	var pathNum = draw[taskId].currCursor.pathNum;
	var path = draw[taskId].path[pathNum];
	var cells = path.obj[0].cells;
	for (var k = 0; k < cells.length; k++) {
		for (var l = 0; l < cells[k].length; l++) {
			if (k == r && l == c) {
				cells[k][l].selected = true;
				cells[k][l].highlight = true;
				// redraw mathsInput selected
				var mInput = path.obj[0].mInputs[k][l];
				mInput.richText = removeSelectTagsFromArray(mInput.richText);
				mInput.richText.unshift('<<selected:true>>');
				mInput.richText.push('<<selected:false>>');
				drawMathsInputText(mInput);
			} else {
				cells[k][l].selected = false;
				cells[k][l].highlight = false;
				// redraw mathsInput unselected
				var mInput = path.obj[0].mInputs[k][l];
				mInput.richText = removeSelectTagsFromArray(mInput.richText);
				drawMathsInputText(mInput);								
			}
		}
	}
	if (pathCanvasMode) {
		pathCanvasDraw(path);
	} else {
		drawCanvasPath(pathNum);
	}
	draw[taskId].startX = mouse.x;
	draw[taskId].startY = mouse.y;
	changeDrawMode('tableCellSelect');
	addListenerMove(window,tableCellSelectMove);
	addListenerEnd(window,tableCellSelectStop);	
}
function drawClickTableCellStartTextEdit() {
	deselectTables();
	draw[taskId].startX = mouse.x-draw[taskId].drawRelPos[0];
	draw[taskId].startY = mouse.y-draw[taskId].drawRelPos[1];
	var pathNum = draw[taskId].currCursor.pathNum;
	var c = draw[taskId].currCursor.c;
	var r = draw[taskId].currCursor.r;
	draw[taskId].path[pathNum].selected = true;
	startMathsInput(draw[taskId].path[pathNum].obj[0].mInputs[r][c]);
	changeDrawMode('tableInputSelect');
	addListenerMove(window,tableCellSelectMove);
	addListenerEnd(window,tableCellSelectStop);
}
function tableCellSelectMove(e) {
	updateMouse(e);
	var pathNum = draw[taskId].currCursor.pathNum;
	var startCol = draw[taskId].currCursor.c;
	var startRow = draw[taskId].currCursor.r;	
	var path = draw[taskId].path[pathNum];
	var obj = path.obj[0];
	var xPos = obj.xPos;
	var yPos = obj.yPos;
	var colsSelected = [];
	var rowsSelected = [];
	var xMin = Math.min(mouse.x-draw[taskId].drawRelPos[0],draw[taskId].startX);
	var xMax = Math.max(mouse.x-draw[taskId].drawRelPos[0],draw[taskId].startX);
	var yMin = Math.min(mouse.y-draw[taskId].drawRelPos[1],draw[taskId].startY);
	var yMax = Math.max(mouse.y-draw[taskId].drawRelPos[1],draw[taskId].startY);
	if (draw[taskId].drawMode == 'tableRowSelect') {
		for (var k = 0; k < xPos.length - 1; k++) {
			colsSelected[k] = true;
		}
	} else {
		for (var k = 0; k < xPos.length - 1; k++) {
			if ((xPos[k] > xMin && xPos[k] < xMax) || (xPos[k] < xMin && xPos[k+1] > xMax) || (xPos[k+1] > xMin && xPos[k+1] < xMax)) {
				colsSelected[k] = true;
			} else {
				colsSelected[k] = false;
			}
		}
	}
	if (draw[taskId].drawMode == 'tableColSelect') {
		for (var k = 0; k < yPos.length - 1; k++) {
			rowsSelected[k] = true;
		}
	} else {
		for (var k = 0; k < yPos.length - 1; k++) {
			if ((yPos[k] > yMin && yPos[k] < yMax) || (yPos[k] < yMin && yPos[k+1] > yMax) || (yPos[k+1] > yMin && yPos[k+1] < yMax)) {
				rowsSelected[k] = true;
			} else {
				rowsSelected[k] = false;
			}
		}
	}
	if (getArrayCount(colsSelected,true) == 1 && getArrayCount(rowsSelected,true) == 1) {
		var selectCount = 1;
		if (draw[taskId].drawMode == 'tableInputSelect') {
			var closestPos = getClosestTextPos();
			if (currMathsInput.selectPos[1] !== closestPos) {
				currMathsInput.selectPos[1] = closestPos;
				currMathsInput.selected = true;
				setSelectPositions();
				drawMathsInputText(currMathsInput);
				mathsInputMapCursorPos();
			}
		}
	} else if (getArrayCount(colsSelected,true) == 0 && getArrayCount(rowsSelected,true) == 0) {
		var selectCount = 0;
	} else {
		var selectCount = 2;
		if (draw[taskId].drawMode == 'tableInputSelect') {
			endMathsInput();
		}
	}
		
	var cells = obj.cells;
	for (var k = 0; k < cells.length; k++) {
		for (var l = 0; l < cells[k].length; l++) {
			if (rowsSelected[k] == true && colsSelected[l] == true) {
				cells[k][l].selected = true;
				if (selectCount == 2 || draw[taskId].drawMode !== 'tableInputSelect') {
					cells[k][l].highlight = true;
					// redraw mathsInput selected
					var mInput = obj.mInputs[k][l];
					mInput.richText = removeSelectTagsFromArray(mInput.richText);
					mInput.richText.unshift('<<selected:true>>');
					mInput.richText.push('<<selected:false>>');
					drawMathsInputText(mInput);
				} else {
					cells[k][l].highlight = false;
				}
			} else {
				cells[k][l].selected = false;
				cells[k][l].highlight = false;
				// redraw mathsInput unselected
				var mInput = obj.mInputs[k][l];
				mInput.richText = removeSelectTagsFromArray(mInput.richText);
				drawMathsInputText(mInput);								
			}
		}
	}
	if (pathCanvasMode) {
		pathCanvasDraw(path);
	} else {
		drawCanvasPath(pathNum);
	}
}
function tableCellSelectStop(e) {
	removeListenerMove(window,tableCellSelectMove);
	removeListenerEnd(window,tableCellSelectStop);
	var pathNum = draw[taskId].currCursor.pathNum;
	var startCol = draw[taskId].currCursor.c;
	var startRow = draw[taskId].currCursor.r;	
	var path = draw[taskId].path[pathNum];
	var obj = path.obj[0];
	var xPos = obj.xPos;
	var yPos = obj.yPos;

	if (draw[taskId].drawMode == 'tableInputSelect') {
		if (xPos[startCol] < mouse.x-draw[taskId].drawRelPos[0] && mouse.x-draw[taskId].drawRelPos[0] < xPos[startCol+1] && yPos[startRow] < mouse.y-draw[taskId].drawRelPos[1] && mouse.y-draw[taskId].drawRelPos[1] < yPos[startRow+1]) {
			// if mouse is over the originating input, update select positions	
			if (currMathsInput.selectPos[0] == currMathsInput.selectPos[1]) {
				currMathsInput.cursorPos = currMathsInput.selectPos[0];
				currMathsInput.selectPos = [];
				currMathsInput.selected = false;
				setSelectPositions();
				
				mathsInputMapCursorPos();
				mathsInputCursorCoords();
			}
			// show keyboard
			if (keyboard[taskNum] && keyboard[taskNum].parentNode !== container) {
				container.appendChild(keyboard[taskNum]);
				for (var i = 0; i < key1[taskNum].length; i++) {
					container.appendChild(key1[taskNum][i]);
				}
			}
			// light up keys on keyboard
			if (keyboard[taskNum]) {
				for (var i = 0; i < key1[taskNum].length; i++) {
					key1[taskNum][i].style.opacity = 1;
					key1[taskNum][i].style.pointerEvents = 'auto';	
				}
			}
		/*} else if (obj.left <= mouse.x && mouse.x <= obj.left+obj.width && obj.top <= mouse.y && mouse.y <= obj.top+obj.height) {
			// if the mouse is elsewhere in the table
			currMathsInput.selectPos = [];
			currMathsInput.selected = false;
			setSelectPositions();
			mathsInputMapCursorPos();
			mathsInputCursorCoords();
			endMathsInput();*/	
		} else {
			/*// if the mouse is outside the table
			currMathsInput.selectPos = [];
			currMathsInput.selected = false;
			setSelectPositions();
			mathsInputMapCursorPos();
			mathsInputCursorCoords();*/
			endMathsInput();
		}
	}
	changeDrawMode('textEdit');
	calcCursorPositions();
}
function deselectTables() {
	var path = draw[taskId].path;
	var pathsToRedraw = [];
	for (var i = 0; i < path.length; i++) {
		if (typeof path[i].obj == 'undefined') continue; 
		var changed = false;
		for (var j = 0; j < path[i].obj.length; j++) {
			if (path[i].obj[j].type == 'table' || path[i].obj[j].type == 'table2') {
				var cells = path[i].obj[j].cells;
				for (var k = 0; k < cells.length; k++) {
					for (var l = 0; l < cells[k].length; l++) {
						if (cells[k][l].selected == true) {
							cells[k][l].selected = false;
							cells[k][l].highlight = false;
							var mInput = path[i].obj[j].mInputs[k][l];
							mInput.richText = removeSelectTagsFromArray(mInput.richText);
							drawMathsInputText(mInput);
							changed = true;
						}							
					}
				}
			}
		}
		if (changed) {
			if (pathCanvasMode) {
				pathCanvasDraw(path[i]);
			} else {
				drawCanvasPath(i);
			}
		}			
	}
}

function tableQuestionGrid(border,dir) {
	if (un(dir)) dir = 'vert';
	for (var p = 0; p < draw[taskId].path.length; p++) {
		if (draw[taskId].path[p].selected && draw[taskId].path[p].obj.length == 1 && draw[taskId].path[p].obj[0].type == 'table2') {
			var path = draw[taskId].path[p];
			var obj = path.obj[0];
			var totalWidth = draw[taskId].drawArea[2] - (draw[taskId].gridMargin[0] + draw[taskId].gridMargin[2]);
			obj.width = totalWidth;
			for (var w = 0; w < obj.widths.length; w++) {
				obj.widths[w] = totalWidth / obj.widths.length;
			}
			repositionPath(path,draw[taskId].gridMargin[0]-path.tightBorder[0],0,0,0);			
			var cells = obj.cells;
			var letters = 'abcdefghijklmnopqrstuvwxyz';
			var cols = obj.widths.length;
			var rows = obj.heights.length;
			var count = 0;
			for (var r = 0; r < cells.length; r++) {
				for (var c = 0; c < cells[r].length; c++) {
					var input = obj.mInputs[r][c];
					input.textAlign = 'left';
					input.vertAlign = 'top';
					if (dir == 'vert') {
						var char = letters.charAt(c*rows+r);
					} else {
						var char = letters.charAt(count);
					}
					setMathsInputText(input,['<<align:left>><<fontSize:28>>'+char+')']);
					
					count++;
				}
			}
			distributeHoriz();
			distributeVert();			
			if (boolean(border,false) == false) obj.innerBorder.show = false;
			obj.outerBorder.show = false;
			updateBorder(path);
			drawCanvasPaths();
			repositionPath(path);
			return;
		}
	}
	console.log('selected table not found');
}

/**********************/
/*					  */
/*	   	GRIDS	 	  */
/*				  	  */
/**********************/

function addGrid() {
	deselectAllPaths(false);
	changeDrawMode();
	draw[taskId].path.push({obj:[{
		type:'grid',
		left:50-draw[taskId].drawRelPos[0],
		top:150-draw[taskId].drawRelPos[1],
		width:400,
		height:400,
		xMin:-10,
		xMax:10,
		yMin:-10,
		yMax:10,
		xMajorStep:5,
		xMinorStep:1,
		yMajorStep:5,
		yMinorStep:1,
		xZero:250,
		yZero:350
	}],selected:true,trigger:[]});
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path.last(),true);			
		drawSelectCanvas();
		calcCursorPositions();
	} else {
		updateBorder(draw[taskId].path.last());			
		drawCanvasPaths();
	}		
}

/*
function drawClickStartGridResizeMode() {
	var pathNum = draw[taskId].currCursor.pathNum;
	if (draw[taskId].drawMode !== 'grid-resize') {
		changeDrawMode('grid-resize');
		draw[taskId].currPathNum = pathNum;
	} else {
		changeDrawMode();
		delete draw[taskId].currPathNum;
	}
	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected == true) {
			updateBorder(draw[taskId].path[i]);
		}
	}
	drawCanvasPaths();
	calcCursorPositions();
}
function drawClickGridStartDrag(e) {
	var pathNum = draw[taskId].currPathNum;
	changeDrawMode('gridDrag');
	draw[taskId].cursorCanvas.style.cursor = draw[taskId].cursors.move2;
	addListenerMove(window, drawGridDragMove);
	addListenerEnd(window, drawGridDragStop);
	draw[taskId].gridDragPrevX = [mouse.x];
	draw[taskId].gridDragPrevY = [mouse.y];
	draw[taskId].selectedGrid = draw[taskId].path[pathNum].obj[0];
	draw[taskId].gridDragXDiff = draw[taskId].path[pathNum].obj[0].xMax - draw[taskId].path[pathNum].obj[0].xMin;
	draw[taskId].gridDragYDiff = draw[taskId].path[pathNum].obj[0].yMax - draw[taskId].path[pathNum].obj[0].yMin;	
}
function drawGridDragMove(e) {
	updateMouse(e);
	
	// place new coordinates at the beginning of the array
	draw[taskId].gridDragPrevX.unshift(mouse.x);
	draw[taskId].gridDragPrevY.unshift(mouse.y);
	
	var dx = (draw[taskId].gridDragPrevX[0] - draw[taskId].gridDragPrevX[1]) * draw[taskId].gridDragXDiff / draw[taskId].selectedGrid.width;
	var dy = (draw[taskId].gridDragPrevY[0] - draw[taskId].gridDragPrevY[1]) * draw[taskId].gridDragYDiff / draw[taskId].selectedGrid.height;
	
	draw[taskId].selectedGrid.xMin -= dx;
	draw[taskId].selectedGrid.xMax -= dx;
	draw[taskId].selectedGrid.yMin += dy;
	draw[taskId].selectedGrid.yMax += dy;
	
	updateBorder(draw[taskId].path[draw[taskId].currPathNum]);
	drawCanvasPaths();
}
function drawGridDragStop(e) {
	e.target.style.cursor = draw[taskId].cursors.move1;
	draw[taskId].gridDragPrevX = null;
	draw[taskId].gridDragPrevY = null;
	draw[taskId].gridDragXDiff = null;
	draw[taskId].gridDragYDiff = null;
	
	// snapping
	draw[taskId].selectedGrid.xMin = roundToNearest(draw[taskId].selectedGrid.xMin,draw[taskId].selectedGrid.xMinorStep);
	draw[taskId].selectedGrid.xMax = roundToNearest(draw[taskId].selectedGrid.xMax,draw[taskId].selectedGrid.xMinorStep);
	draw[taskId].selectedGrid.yMin = roundToNearest(draw[taskId].selectedGrid.yMin,draw[taskId].selectedGrid.yMinorStep);
	draw[taskId].selectedGrid.yMax = roundToNearest(draw[taskId].selectedGrid.yMax,draw[taskId].selectedGrid.yMinorStep);
	
	changeDrawMode('grid-resize');
	calcGridZeros(draw[taskId].selectedGrid);
	updateBorder(draw[taskId].path[draw[taskId].currPathNum]);
	drawCanvasPaths();
	calcCursorPositions();

	removeListenerMove(window, drawGridDragMove);
	removeListenerEnd(window, drawGridDragStop);
}
function drawClickGridStartRescaleX() {
	var pathNum = draw[taskId].currCursor.pathNum;
	changeDrawMode('gridRescaleX');
	draw[taskId].gridRescaleX = Number(roundSF(draw[taskId].path[pathNum].obj[0].xMin + (draw[taskId].path[pathNum].obj[0].xMax - draw[taskId].path[pathNum].obj[0].xMin) * (mouse.x - draw[taskId].path[pathNum].obj[0].left) / draw[taskId].path[pathNum].obj[0].width, 2));	
	draw[taskId].gridRescalePrev = draw[taskId].gridRescaleX;
	draw[taskId].selectedGrid = draw[taskId].path[pathNum].obj[0];
	addListenerMove(window, drawGridRescaleXMove);
	addListenerEnd(window, drawGridRescaleStop);	
}
function drawClickGridStartRescaleY() {
	var pathNum = draw[taskId].currCursor.pathNum;	
	changeDrawMode('gridRescaleY');
	draw[taskId].gridRescaleY = Number(roundSF(draw[taskId].path[pathNum].obj[0].yMax - (draw[taskId].path[pathNum].obj[0].yMax - draw[taskId].path[pathNum].obj[0].yMin) * (mouse.y - draw[taskId].path[pathNum].obj[0].top) / draw[taskId].path[pathNum].obj[0].height, 2));
	draw[taskId].gridRescalePrev = draw[taskId].gridRescaleY;
	draw[taskId].selectedGrid = draw[taskId].path[pathNum].obj[0];
	addListenerMove(window, drawGridRescaleYMove);
	addListenerEnd(window, drawGridRescaleStop);	
}
function drawGridRescaleXMove(e) {
	e.target.style.cursor = draw[taskId].cursors.ew;
	updateMouse(e);

	var gridxRescaleMin = draw[taskId].gridRescaleX * (1 + (mouse.x - draw[taskId].selectedGrid.left) / (draw[taskId].selectedGrid.xZero - mouse.x));
	var gridxRescaleMax = draw[taskId].gridRescaleX * (1 + (mouse.x - draw[taskId].selectedGrid.left - draw[taskId].selectedGrid.width) / (draw[taskId].selectedGrid.xZero - mouse.x));

	if (((gridxRescaleMax - gridxRescaleMin <= draw[taskId].selectedGrid.width * 10) || Math.abs(mouse.x - draw[taskId].selectedGrid.xZero) > Math.abs(draw[taskId].gridRescalePrev - draw[taskId].selectedGrid.xZero)) && (draw[taskId].gridRescaleX > 0 && mouse.x > draw[taskId].selectedGrid.xZero) || (draw[taskId].gridRescaleX < 0 && mouse.x < draw[taskId].selectedGrid.xZero)) {
		draw[taskId].selectedGrid.xMin = Number(gridxRescaleMin)
		draw[taskId].selectedGrid.xMax = Number(gridxRescaleMax)

		// work out suitable major & minor steps
		var xDiff = draw[taskId].selectedGrid.xMax - draw[taskId].selectedGrid.xMin;
		var xMag = Math.log(xDiff)/Math.log(10);
		var xMag1 = Math.floor(xMag);
		var xMag2 = xMag - xMag1;
		if (xMag2 < 0.2) {
			draw[taskId].selectedGrid.xMinorStep = Math.pow(10,xMag1-2)*10;
			draw[taskId].selectedGrid.xMajorStep = Math.pow(10,xMag1-1)*2;		
		} else if (xMag2 < 0.4) {
			draw[taskId].selectedGrid.xMinorStep = Math.pow(10,xMag1-1);
			draw[taskId].selectedGrid.xMajorStep = Math.pow(10,xMag1)/2;		
		} else if (xMag2 < 0.7) {
			draw[taskId].selectedGrid.xMinorStep = Math.pow(10,xMag1-1)*2;
			draw[taskId].selectedGrid.xMajorStep = Math.pow(10,xMag1);		
		} else {
			draw[taskId].selectedGrid.xMinorStep = Math.pow(10,xMag1-1)*5;
			draw[taskId].selectedGrid.xMajorStep = Math.pow(10,xMag1);		
		}
		
		updateBorder(draw[taskId].path[draw[taskId].currPathNum]);
		drawCanvasPaths();
	}
	draw[taskId].gridRescalePrev = mouse.x;
}
function drawGridRescaleYMove(e) {
	e.target.style.cursor = draw[taskId].cursors.ns;
	updateMouse(e);	
	
	var gridyRescaleMin = draw[taskId].gridRescaleY * (1 + (mouse.y - draw[taskId].selectedGrid.top - draw[taskId].selectedGrid.height) / (draw[taskId].selectedGrid.yZero - mouse.y));
	var gridyRescaleMax = draw[taskId].gridRescaleY * (1 + (mouse.y - draw[taskId].selectedGrid.top) / (draw[taskId].selectedGrid.yZero - mouse.y));
	
	if (((gridyRescaleMax - gridyRescaleMin <= draw[taskId].selectedGrid.height * 10) || Math.abs(mouse.y - draw[taskId].selectedGrid.yZero) > Math.abs(draw[taskId].gridRescalePrev - draw[taskId].selectedGrid.yZero)) && ((draw[taskId].gridRescaleY > 0 && mouse.y < draw[taskId].selectedGrid.yZero) || (draw[taskId].gridRescaleY < 0 && y > draw[taskId].selectedGrid.yZero))) {
		draw[taskId].selectedGrid.yMin = Number(gridyRescaleMin)
		draw[taskId].selectedGrid.yMax = Number(gridyRescaleMax)

		// work out suitable major & minor steps
		var yDiff = draw[taskId].selectedGrid.yMax - draw[taskId].selectedGrid.yMin;
		var yMag = Math.log(yDiff)/Math.log(10);
		var yMag1 = Math.floor(yMag);
		var yMag2 = yMag - yMag1;
		if (yMag2 < 0.2) {
			draw[taskId].selectedGrid.yMinorStep = Math.pow(10,yMag1-2)*10;
			draw[taskId].selectedGrid.yMajorStep = Math.pow(10,yMag1-1)*2;		
		} else if (yMag2 < 0.4) {
			draw[taskId].selectedGrid.yMinorStep = Math.pow(10,yMag1-1);
			draw[taskId].selectedGrid.yMajorStep = Math.pow(10,yMag1)/2;		
		} else if (yMag2 < 0.7) {
			draw[taskId].selectedGrid.yMinorStep = Math.pow(10,yMag1-1)*2;
			draw[taskId].selectedGrid.yMajorStep = Math.pow(10,yMag1);		
		} else {
			draw[taskId].selectedGrid.yMinorStep = Math.pow(10,yMag1-1)*5;
			draw[taskId].selectedGrid.yMajorStep = Math.pow(10,yMag1);		
		}
		updateBorder(draw[taskId].path[draw[taskId].currPathNum]);
		drawCanvasPaths();
	}
	draw[taskId].gridRescalePrev = mouse.y;
}
function drawGridRescaleStop(e) {
	draw[taskId].gridRescaleX = null;
	draw[taskId].gridRescaleY = null;	
	draw[taskId].gridRescalePrev = null;

	// snapping
	draw[taskId].selectedGrid.xMin = roundToNearest(draw[taskId].selectedGrid.xMin,draw[taskId].selectedGrid.xMinorStep);
	draw[taskId].selectedGrid.xMax = roundToNearest(draw[taskId].selectedGrid.xMax,draw[taskId].selectedGrid.xMinorStep);
	draw[taskId].selectedGrid.yMin = roundToNearest(draw[taskId].selectedGrid.yMin,draw[taskId].selectedGrid.yMinorStep);
	draw[taskId].selectedGrid.yMax = roundToNearest(draw[taskId].selectedGrid.yMax,draw[taskId].selectedGrid.yMinorStep);
	
	changeDrawMode('grid-resize');
	calcGridZeros(draw[taskId].selectedGrid);
	updateBorder(draw[taskId].path[draw[taskId].currPathNum]);
	drawCanvasPaths();
	calcCursorPositions();
		
	removeListenerMove(window, drawGridRescaleXMove);
	removeListenerMove(window, drawGridRescaleYMove);
	removeListenerEnd(window, drawGridRescaleStop);	
}*/
function drawClickGridStepChange() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	var axis = draw[taskId].currCursor.axis;
	var change = draw[taskId].currCursor.change;
	var majorMinor = draw[taskId].currCursor.majorMinor;
	if (axis == 'x') {
		if (majorMinor == 'major') {
			if (obj.xMajorStep + change !== 0) obj.xMajorStep += change;
		} else if (majorMinor == 'minor') {
			if (obj.xMinorStep + change !== 0) obj.xMinorStep += change;
		}
	} else if (axis == 'y') {
		if (majorMinor == 'major') {
			if (obj.yMajorStep + change !== 0) obj.yMajorStep += change;
		} else if (majorMinor == 'minor') {
			if (obj.yMinorStep + change !== 0) obj.yMinorStep += change;
		}
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);
	} else {
		drawCanvasPath(pathNum);
	}	
}

function drawClickStartGridResizeMode() {
	var pathNum = draw[taskId].currCursor.pathNum;
	if (un(draw[taskId].gridMenu)) createGridMenu();
	draw[taskId].gridMenu.pathNum = pathNum;
	draw[taskId].gridMenu.reposition();
	draw[taskId].gridMenu.setValues();
	draw[taskId].gridMenu.show();
}
function createGridMenu() {
	draw[taskId].gridMenu = {
		backCanvas:newcanvas({rect:[0,0,225,500]}),
		xMin:createMathsInput2({left:0,top:0,width:55,height:40,selectable:false}),
		xMax:createMathsInput2({left:0,top:0,width:55,height:40,selectable:false}),
		xMinor:createMathsInput2({left:0,top:0,width:50,height:40,selectable:false}),
		xMajor:createMathsInput2({left:0,top:0,width:50,height:40,selectable:false}),
		yMin:createMathsInput2({left:0,top:0,width:55,height:40,selectable:false}),
		yMax:createMathsInput2({left:0,top:0,width:55,height:40,selectable:false}),
		yMinor:createMathsInput2({left:0,top:0,width:50,height:40,selectable:false}),
		yMajor:createMathsInput2({left:0,top:0,width:50,height:40,selectable:false}),
		funcInput:createMathsInput2({left:0,top:0,width:200,height:30,algText:true,fontSize:20,selectable:false}),
		funcTable:createScrollTable({
			left:0,
			top:0,
			minCellWidth:205-25,
			minCellHeight:30,
			horizAlign:'left',
			text:{font:'algebra',size:20,color:'#000'},
			outerBorder:{show:true,width:4,color:'#000'},
			innerBorder:{show:true,width:2,color:'#666'},
			cells:[
				[{text:['0']}],
				[{text:['1']}],
				[{text:['2']}],
				[{text:['3']}],
				[{text:['4']}]
			],
			z:1000,
			maxHeight:90,
			moveFunc:function(r,c) {console.log(r,c)},
			clickFunc:function(r,c) {console.log(r,c)},
			padding:0.1,
			topRowFreeze:false
		}),
		showing:false
	}
	hideScrollTable(draw[taskId].gridMenu.funcTable);
	draw[taskId].gridMenu.xMin.onInputEnd = function() {
		var num = Number(this.stringJS);
		var obj = draw[taskId].path[draw[taskId].gridMenu.pathNum].obj[0];
		if (isNaN(num) || num >= draw[taskId].gridMenu.xMax) {
			setMathsInputText(this,[String(draw[taskId].gridMenu.xMin)]);
		} else {
			draw[taskId].gridMenu.xMin = num;
			drawCanvasPath(draw[taskId].gridMenu.pathNum);
		}
	}
	draw[taskId].gridMenu.xMax.onInputEnd = function() {
		var num = Number(this.stringJS);
		var obj = draw[taskId].path[draw[taskId].gridMenu.pathNum].obj[0];
		if (isNaN(num) || num <= draw[taskId].gridMenu.xMin) {
			setMathsInputText(this,[String(draw[taskId].gridMenu.xMax)]);
		} else {
			draw[taskId].gridMenu.xMax = num;
			drawCanvasPath(draw[taskId].gridMenu.pathNum);
		}
	}
	draw[taskId].gridMenu.xMinor.onInputEnd = function() {
		var num = Number(this.stringJS);
		var obj = draw[taskId].path[draw[taskId].gridMenu.pathNum].obj[0];
		if (isNaN(num)) {
			setMathsInputText(this,[String(draw[taskId].gridMenu.xMinorStep)]);
		} else {
			if (num > draw[taskId].gridMenu.xMajorStep) {
				draw[taskId].gridMenu.xMajorStep = num;
				setMathsInputText(draw[taskId].gridMenu.xMajor,[String(draw[taskId].gridMenu.xMajorStep)]);
			}
			draw[taskId].gridMenu.xMinorStep = num;
			drawCanvasPath(draw[taskId].gridMenu.pathNum);
		}
	}
	draw[taskId].gridMenu.xMajor.onInputEnd = function() {
		var num = Number(this.stringJS);
		var obj = draw[taskId].path[draw[taskId].gridMenu.pathNum].obj[0];
		if (isNaN(num)) {
			setMathsInputText(this,[String(draw[taskId].gridMenu.xMajorStep)]);
		} else {
			if (num < draw[taskId].gridMenu.xMinorStep) {
				draw[taskId].gridMenu.xMinorStep = num;
				setMathsInputText(draw[taskId].gridMenu.xMinor,[String(draw[taskId].gridMenu.xMinorStep)]);
			}
			draw[taskId].gridMenu.xMajorStep = num;
			drawCanvasPath(draw[taskId].gridMenu.pathNum);
		}
	}
	draw[taskId].gridMenu.yMin.onInputEnd = function() {
		var num = Number(this.stringJS);
		var obj = draw[taskId].path[draw[taskId].gridMenu.pathNum].obj[0];
		if (isNaN(num) || num >= draw[taskId].gridMenu.yMax) {
			setMathsInputText(this,[String(draw[taskId].gridMenu.yMin)]);
		} else {
			draw[taskId].gridMenu.yMin = num;
			drawCanvasPath(draw[taskId].gridMenu.pathNum);
		}
	}	
	draw[taskId].gridMenu.yMax.onInputEnd = function() {
		var num = Number(this.stringJS);
		var obj = draw[taskId].path[draw[taskId].gridMenu.pathNum].obj[0];
		if (isNaN(num) || num <= draw[taskId].gridMenu.yMin) {
			setMathsInputText(this,[String(draw[taskId].gridMenu.yMax)]);
		} else {
			draw[taskId].gridMenu.yMax = num;
			drawCanvasPath(draw[taskId].gridMenu.pathNum);
		}
	}
	draw[taskId].gridMenu.yMinor.onInputEnd = function() {
		var num = Number(this.stringJS);
		var obj = draw[taskId].path[draw[taskId].gridMenu.pathNum].obj[0];
		if (isNaN(num)) {
			setMathsInputText(this,[String(draw[taskId].gridMenu.yMinorStep)]);
		} else {
			if (num > draw[taskId].gridMenu.yMajorStep) {
				draw[taskId].gridMenu.yMajorStep = num;
				setMathsInputText(draw[taskId].gridMenu.yMajor,[String(draw[taskId].gridMenu.yMajorStep)]);
			}
			draw[taskId].gridMenu.yMinorStep = num;
			drawCanvasPath(draw[taskId].gridMenu.pathNum);
		}
	}
	draw[taskId].gridMenu.yMajor.onInputEnd = function() {
		var num = Number(this.stringJS);
		var obj = draw[taskId].path[draw[taskId].gridMenu.pathNum].obj[0];
		if (isNaN(num)) {
			setMathsInputText(this,[String(draw[taskId].gridMenu.yMajorStep)]);
		} else {
			if (num < draw[taskId].gridMenu.yMinorStep) {
				draw[taskId].gridMenu.yMinorStep = num;
				setMathsInputText(draw[taskId].gridMenu.yMinor,[String(draw[taskId].gridMenu.yMinorStep)]);
			}
			draw[taskId].gridMenu.yMajorStep = num;
			drawCanvasPath(draw[taskId].gridMenu.pathNum);
		}
	}
	draw[taskId].gridMenu.funcInput.onInputEnd = function() {
		if (this.text == "") return;
		var obj = draw[taskId].path[draw[taskId].gridMenu.pathNum].obj[0];
		var funcDeg = createJSString2(this.text,'deg');
		var funcRad = createJSString2(this.text,'rad');
		var stringCopy = funcDeg;
		var exceptions = ['Math.pow','Math.sqrt','Math.PI','Math.sin','Math.cos','Math.tan','Math.asin','Math.acos','Math.atan','Math.e','Math.log','Math.abs'];
		for (var i = 0; i < exceptions.length; i++) {
			stringCopy = replaceAll(stringCopy,exceptions[i],'');
		}
		if (/[a-wzA-WZ]/g.test(stringCopy) == true || (stringCopy.match(/=/g) || []).length !== 1 || stringCopy.charAt(0) == "=" || stringCopy.charAt(stringCopy.length-1) == "=") {
			return; //invalid
		}
		if (funcDeg.indexOf("y=") == 0) {
			try {
				eval('var funcDeg2 = function(x) {return '+funcDeg.slice(2)+'};');
				eval('var funcRad2 = function(x) {return '+funcRad.slice(2)+'};');
			}
			catch(err) {
				return;	
			}
			if (un(draw[taskId].gridMenu.path)) draw[taskId].gridMenu.path = [];
			draw[taskId].gridMenu.path.push({type:'function',funcDeg:funcDeg2,funcRad:funcRad2,color:draw[taskId].color,text:clone(this.richText),time:Date.parse(new Date())});		
		} else {
			var splitFuncDeg = funcDeg.split("=");
			var splitFuncRad = funcRad.split("=");
			if (splitFuncDeg.length !== 2 || splitFuncRad.length !== 2) return;		
			try {
				eval('var funcDeg2 = function(x,y) {return ('+splitFuncDeg[0]+')-('+splitFuncDeg[1]+')};');
				eval('var funcRad2 = function(x,y) {return ('+splitFuncRad[0]+')-('+splitFuncRad[1]+')};');
			}
			catch(err) {
				return;	
			}
			if (un(draw[taskId].gridMenu.path)) draw[taskId].gridMenu.path = [];
			draw[taskId].gridMenu.path.push({type:'function2',funcDeg:funcDeg2,funcRad:funcRad2,color:draw[taskId].color,text:clone(this.richText),time:Date.parse(new Date())});		
		}
		draw[taskId].gridMenu.funcTable.cells.push([{text:clone(combineSpacesTextArray(this.richText))}]);
		updateScrollTable(draw[taskId].gridMenu.funcTable);
		showObj(draw[taskId].gridMenu.funcTable.ctxInvis.canvas);
		setMathsInputText(this,"");
		drawCanvasPath(draw[taskId].gridMenu.pathNum);
	}		
	draw[taskId].gridMenu.draw = function() {
		var ctx = this.backCanvas.ctx;
		ctx.clearRect(0,0,225,500);
		roundedRect(ctx,3,3,225-6,500-6,8,6,'#000','#FCF');
		text({ctx:ctx,left:12,width:200,top:10,height:45,align:'center',vertAlign:'middle',textArray:['<<font:algebra>><<fontSize:26>>'+lessThanEq+' x '+lessThanEq]});
		text({ctx:ctx,left:30,width:240,top:60,height:50,vertAlign:'middle',textArray:['<<font:Arial>><<fontSize:20>>Major step:']});
		text({ctx:ctx,left:30,width:240,top:110,height:50,vertAlign:'middle',textArray:['<<font:Arial>><<fontSize:20>>Minor step:']});
		ctx.beginPath();
		ctx.strokeStyle = '#666';
		ctx.moveTo(7,172.5);
		ctx.lineTo(225-7,172.5);
		ctx.stroke();
		text({ctx:ctx,left:12,width:200,top:10+180,height:45,align:'center',vertAlign:'middle',textArray:['<<font:algebra>><<fontSize:26>>'+lessThanEq+' y '+lessThanEq]});
		text({ctx:ctx,left:30,width:240,top:60+180,height:50,vertAlign:'middle',textArray:['<<font:Arial>><<fontSize:20>>Major step:']});
		text({ctx:ctx,left:30,width:240,top:110+180,height:50,vertAlign:'middle',textArray:['<<font:Arial>><<fontSize:20>>Minor step:']});
		ctx.beginPath();
		ctx.strokeStyle = '#666';
		ctx.moveTo(7,345);
		ctx.lineTo(225-7,345);
		ctx.stroke();
	}
	draw[taskId].gridMenu.draw();
	draw[taskId].gridMenu.reposition = function() {
		var path = draw[taskId].path[this.pathNum];
		var x = path.border[4]+draw[taskId].drawRelPos[0];
		var y = path.border[1]+draw[taskId].drawRelPos[1];
		this.x = x;
		this.y = y;
		this.backCanvas.data[100] = x;
		this.backCanvas.data[101] = y;
		resizeCanvas3(this.backCanvas);
		moveMathsInput(this.xMin,x+10,y+10);
		moveMathsInput(this.xMax,x+155,y+10);
		moveMathsInput(this.xMinor,x+140,y+115);
		moveMathsInput(this.xMajor,x+140,y+65);
		y += 175;
		moveMathsInput(this.yMin,x+10,y+10);
		moveMathsInput(this.yMax,x+155,y+10);
		moveMathsInput(this.yMinor,x+140,y+115);
		moveMathsInput(this.yMajor,x+140,y+65);
		y += 175;
		moveMathsInput(this.funcInput,x+10,y+10);
		this.funcTable.move(x+10,y+50);
	}
	draw[taskId].gridMenu.move = function(dx,dy) {
		var path = draw[taskId].path[this.pathNum];
		this.x += dx;
		this.y += dy;
		var x = this.x;
		var y = this.y;
		this.backCanvas.data[100] = x;
		this.backCanvas.data[101] = y;
		resizeCanvas3(this.backCanvas);
		moveMathsInput(this.xMin,x+10,y+10);
		moveMathsInput(this.xMax,x+155,y+10);
		moveMathsInput(this.xMinor,x+140,y+115);
		moveMathsInput(this.xMajor,x+140,y+65);
		y += 175;
		moveMathsInput(this.yMin,x+10,y+10);
		moveMathsInput(this.yMax,x+155,y+10);
		moveMathsInput(this.yMinor,x+140,y+115);
		moveMathsInput(this.yMajor,x+140,y+65);
		y += 175;
		moveMathsInput(this.funcInput,x+10,y+10);
		moveScrollTable(this.funcTable,x+10,y+50);			
	}		
	draw[taskId].gridMenu.show = function() {
		this.showing = true;
		showObj(this.backCanvas);
		showMathsInput(this.xMin);
		showMathsInput(this.xMax);
		showMathsInput(this.xMinor);
		showMathsInput(this.xMajor);
		showMathsInput(this.yMin);
		showMathsInput(this.yMax);
		showMathsInput(this.yMinor);
		showMathsInput(this.yMajor);			
		showMathsInput(this.funcInput);		
		showScrollTable(this.funcTable,false);
	}
	draw[taskId].gridMenu.hide = function() {
		this.showing = false;
		hideObj(this.backCanvas);
		hideMathsInput(this.xMin);
		hideMathsInput(this.xMax);
		hideMathsInput(this.xMinor);
		hideMathsInput(this.xMajor);
		hideMathsInput(this.yMin);
		hideMathsInput(this.yMax);
		hideMathsInput(this.yMinor);
		hideMathsInput(this.yMajor);
		hideMathsInput(this.funcInput);
		hideScrollTable(this.funcTable);
	}
	draw[taskId].gridMenu.setValues = function(gridDetails) {
		var gridDetails = draw[taskId].path[this.pathNum].obj[0];
		setMathsInputText(this.xMin,[String(Number(roundSF(gridDetails.xMin,2)))]);
		setMathsInputText(this.xMax,[String(Number(roundSF(gridDetails.xMax,2)))]);
		setMathsInputText(this.xMinor,[String(Number(roundSF(gridDetails.xMinorStep,2)))]);
		setMathsInputText(this.xMajor,[String(Number(roundSF(gridDetails.xMajorStep,2)))]);
		setMathsInputText(this.yMin,[String(Number(roundSF(gridDetails.yMin,2)))]);
		setMathsInputText(this.yMax,[String(Number(roundSF(gridDetails.yMax,2)))]);
		setMathsInputText(this.yMinor,[String(Number(roundSF(gridDetails.yMinorStep,2)))]);
		setMathsInputText(this.yMajor,[String(Number(roundSF(gridDetails.yMajorStep,2)))]);	
	}
}
function createJSString2(textArray, angleMode) {
	var depth = 0;
	var jsArray = [''];
	var js = '';
	var algArray = [''];
	var alg = '';
	var exceptions = ['Math.pow','Math.sqrt','Math.PI','Math.sin','Math.cos','Math.tan','Math.asin','Math.acos','Math.atan','Math.e','Math.log','Math.abs','sin','cos','tan'];
	var position = [0];
		
	for (var p = 0; p < textArray.length; p++) {
		//console.log('Before ' + p + ' base element(s):', jsArray);
		subJS(textArray[p],true);
		position[depth]++;
		//console.log('After ' + p + ' base elements:', jsArray);
	}
	
	js = jsArray[0];
	alg = algArray[0];
	//console.log(js);
	
	function removeAllTagsFromString(str) {
		for (var char = str.length-1; char > -1; char--) {
			if (str.slice(char).indexOf('>>') == 0 && str.slice(char-1).indexOf('>>>') !== 0) {
				for (var char2 = char-2; char2 > -1; char2--) {
					if (str.slice(char2).indexOf('<<') == 0) {
						str = str.slice(0,char2) + str.slice(char+2);
						char = char2;
						break;	
					}
				}
			}
		}		
		return str;
	}
	
	function subJS(elem, addMultIfNecc) {
		if (typeof addMultIfNecc !== 'boolean') addMultIfNecc = true;
		//console.log('subJS', elem);
		if (typeof elem == 'string') {
			//console.log('string');
			var subText = replaceAll(elem, ' ', ''); // remove white space
			subText = removeAllTagsFromString(subText);

			subText = subText.replace(/\u00D7/g, '*'); // replace multiplications signs with *
			subText = subText.replace(/\u00F7/g, '/'); // replace division signs with /
			subText = subText.replace(/\u2264/g, '<='); // replace  signs with <=
			subText = subText.replace(/\u2265/g, '>='); // replace  signs with >=
			for (var c = 0; c < subText.length - 2; c++) {
				if (subText.slice(c).indexOf('sin') == 0 || subText.slice(c).indexOf('cos') == 0 || subText.slice(c).indexOf('tan') == 0) {
					if (subText.slice(c).indexOf('(') == 3) {
						if (angleMode == 'rad') {
							subText = subText.slice(0,c)+'Math.'+subText.slice(c);
							c += 5;
						} else {
							subText = subText.slice(0,c)+'Math.'+subText.slice(c,c+4)+'(Math.PI/180)*'+subText.slice(c+4);
							c += 19;
						}
					}
				}
			}
			subText = timesBeforeLetters(subText);
			// if following frac or power, add * if necessary
			if (addMultIfNecc == true && jsArray[depth] !== '' && elem !== '' && /[ \+\-\=\u00D7\u00F7\u2264\u2265\<\>\])]/.test(elem.charAt(0)) == false) subText = '*' + subText;
			jsArray[depth] += subText;
			algArray[depth] += subText;
			return;
		} else if (elem[0] == 'frac') {
			//console.log('frac');
			var subText = '';
			var subText2 = '';
			// if not proceeded by an operator, put a times sign in
			if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\*\/\=\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
			depth++;
			position.push(0);
			jsArray[depth] = '';
			subJS(elem[1], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space 
			subText += '((' + jsArray[depth] + ')/';
			subText2 += 'frac(' + jsArray[depth] + ',';
			jsArray[depth] = '';
			subJS(elem[2], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			subText += '(' + jsArray[depth] + '))';
			subText2 += jsArray[depth] + ')';
			jsArray[depth] = '';
			depth--;
			position.pop();
			jsArray[depth] += subText;
			algArray[depth] += subText2;
			return;
		} else if (elem[0] == 'sqrt') {
			//console.log('sqrt');
			var subText = '';
			var subText2 = '';
			// if not proceeded by an operator, put a times sign in
			if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\*\/\=\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
			depth++;
			position.push(0);
			jsArray[depth] = '';
			subJS(elem[1], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			subText += 'Math.sqrt('+ jsArray[depth] +')';
			subText2 += 'sqrt('+jsArray[depth]+')';
			jsArray[depth] = '';
			depth--;
			position.pop();
			jsArray[depth] += subText;
			algArray[depth] += subText2;			
			return;
		} else if (elem[0] == 'root') {
			//console.log(elem[0]);
			var subText = '';
			var subText2 = '';
			// if not proceeded by an operator, put a times sign in
			if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\*\/\=\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
			depth++;
			position.push(0);
			jsArray[depth] = '';
			subJS(elem[2], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			subText += '(Math.pow('+jsArray[depth]+',';
			subText2 += 'root('+jsArray[depth]+',';
			jsArray[depth] = '';
			subJS(elem[1], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			subText += '(1/('+jsArray[depth]+'))))';
			subText2 += jsArray[depth]+')';
			jsArray[depth] = '';
			depth--;
			position.pop();
			jsArray[depth] += subText;
			algArray[depth] += subText2;
			return;
		} else if (elem[0] == 'sin' || elem[0] == 'cos' || elem[0] == 'tan') {
			//console.log(elem[0]);
			var subText = '';
			// if not proceeded by an operator, put a times sign in
			if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\*\/\=\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
			depth++;
			position.push(0);
			jsArray[depth] = '';
			subJS(elem[1], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			var convertText1 = '';
			var convertText2 = '';
			if (angleMode == 'deg' || angleMode == 'degrees') {
				convertText1 = '(';
				convertText2 = ')*Math.PI/180';
			}
			subText += 'Math.'+ elem[0] +'('+convertText1+jsArray[depth]+convertText2+')';
			jsArray[depth] = '';
			depth--;
			position.pop();
			jsArray[depth] += subText;
			algArray[depth] += subText;
			return;
		} else if (elem[0] == 'sin-1' || elem[0] == 'cos-1' || elem[0] == 'tan-1') {
			//console.log(elem[0]);
			var subText = '';
			// if not proceeded by an operator, put a times sign in
			if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\*\/\=\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
			depth++;
			position.push(0);
			jsArray[depth] = '';
			subJS(elem[1], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			var convertText1 = '';
			var convertText2 = '';
			if (angleMode == 'deg' || angleMode == 'degrees') {
				convertText1 = '((';
				convertText2 = ')*180/Math.PI)';
			}
			subText += convertText1+'Math.a'+elem[0].slice(0,3)+'('+jsArray[depth]+')'+convertText2;;
			jsArray[depth] = '';
			depth--;
			position.pop();
			jsArray[depth] += subText;
			algArray[depth] += subText;			
			return;
		} else if (elem[0] == 'ln') {
			//console.log(elem[0]);
			var subText = '';
			// if not proceeded by an operator, put a times sign in
			if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\*\/\=\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
			depth++;
			position.push(0);
			jsArray[depth] = '';
			subJS(elem[1], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			subText += 'Math.log('+jsArray[depth]+')';
			jsArray[depth] = '';
			position.pop();
			depth--;
			jsArray[depth] += subText;
			algArray[depth] += subText;
			return;
		} else if (elem[0] == 'log') {
			//console.log(elem[0]);
			var subText = '';
			// if not proceeded by an operator, put a times sign in
			if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\*\/\=\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
			depth++;
			position.push(0);
			jsArray[depth] = '';
			subJS(elem[1], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			subText += '((Math.log('+jsArray[depth]+'))/(Math.log(10)))';
			jsArray[depth] = '';
			depth--;
			position.pop();
			jsArray[depth] += subText;
			algArray[depth] += subText;
			return;
		} else if (elem[0] == 'logBase') {
			//console.log(elem[0]);
			var subText = '';
			// if not proceeded by an operator, put a times sign in
			if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\*\/\=\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
			depth++;
			position.push(0);		
			jsArray[depth] = '';
			subJS(elem[2], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			subText += '((Math.log('+jsArray[depth]+'))/';
			jsArray[depth] = '';
			subJS(elem[1], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			subText += '(Math.log('+jsArray[depth]+')))';
			jsArray[depth] = '';
			depth--;
			position.pop();
			jsArray[depth] += subText;
			algArray[depth] += subText;
			return;
		} else if (elem[0] == 'abs') {
			//console.log(elem[0]);
			var subText = '';
			// if not proceeded by an operator, put a times sign in
			if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\*\/\=\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
			depth++;
			position.push(0);			
			jsArray[depth] = '';
			subJS(elem[1], false);
			jsArray[depth] = replaceAll(jsArray[depth], ' ', ''); // remove white space
			subText += 'Math.abs('+jsArray[depth]+')';
			jsArray[depth] = '';
			depth--;
			position.pop();
			jsArray[depth] += subText;
			algArray[depth] += subText;
			return;
		} else if (elem[0] == 'power' || elem[0] == 'pow') {
			//console.log('power');
		
			var baseSplitPoint = 0;
			var trigPower = false;
			//if the power is after a close bracket
			if (jsArray[depth] !== '') {
				if (jsArray[depth].charAt(jsArray[depth].length - 1) == ')') {
					var bracketCount = 1
					for (jsChar = jsArray[depth].length - 2; jsChar >= 0; jsChar--) {
						if (jsArray[depth].charAt(jsChar) == ')') {bracketCount++}
						if (jsArray[depth].charAt(jsChar) == '(') {bracketCount--}
						if (bracketCount == 0 && !baseSplitPoint) {
							baseSplitPoint = jsChar;
							break;
						}
					}
				//if the power is after sin, cos or tan
				
				} else if (jsArray[depth].slice(jsArray[depth].length-3) == 'sin' || jsArray[depth].slice(jsArray[depth].length-3) == 'coa' || jsArray[depth].slice(jsArray[depth].length-3) == 'tan') {
					trigPower = true;
				//if the power is after a letter
				} else if (/[A-Za-z]/g.test(jsArray[depth].charAt(jsArray[depth].length - 1)) == true) {
					baseSplitPoint = jsArray[depth].length - 1;
				//if the power is after a numerical digit
				} else if (/[0-9]/g.test(jsArray[depth].charAt(jsArray[depth].length - 1)) == true) {
					var decPoint = false;
					for (jsChar = jsArray[depth].length - 2; jsChar >= 0; jsChar--) {
						if (decPoint == false && jsArray[depth].charAt(jsChar) == '.') {
							decPoint = true;
						} else if (decPoint == true && jsArray[depth].charAt(jsChar) == '.') {
							baseSplitPoint = jsChar + 1;
							break;						
						} else if (/[0-9]/g.test(jsArray[depth].charAt(jsChar)) == false) {
							baseSplitPoint = jsChar + 1;
							break;
						}
					}
				} else {
					return ''; // error
				}
			}
			
			if (trigPower == true) {
				var power = elem[2];
				if (typeof power == 'string') {
					power = removeAllTagsFromString(power);
					console.log(power);
					if (power == '-1') {
						jsArray[depth] = jsArray[depth].slice(0,-3) + 'Math.a' + jsArray[depth].slice(-3);
					} else if (power == '2') {
						
					}
				}
				
			}

			var base = jsArray[depth].slice(baseSplitPoint);
			jsArray[depth] = jsArray[depth].slice(0, baseSplitPoint);
			depth++;
			position.push(0);			
			jsArray[depth] = '';
			subJS(elem[2], false)
			jsArray[depth] = replaceAll(jsArray[depth], ' ', '');
			if (trigPower == true) {
				console.log(jsArray,jsArray[depth-1],jsArray[depth]);
				if (jsArray[depth] == '-1') {
					jsArray[depth-1] = jsArray[depth-1].slice(0,-3) + 'Math.a' + jsArray[depth-1].slice(-3);
				}
			} else {
				var subText = 'Math.pow(' + base + ',' + jsArray[depth] + ')';
				var subText2 = base + '^' + jsArray[depth];
			}
			jsArray[depth] = '';
			depth--;
			position.pop();
			jsArray[depth] += subText;
			algArray[depth] += subText2;
			return;
		} else if (typeof elem == 'object') {
			//console.log('array');
			depth++;
			position.push(0);			
			jsArray[depth] = '';
			for (var sub = 0; sub < elem.length; sub++) {
				//console.log('depth:', depth);
				//console.log('Before ' + sub + ' sub element(s):', jsArray);
				subJS(elem[sub], addMultIfNecc);
				//console.log('After ' + sub + ' sub element(s):', jsArray);				
			}
			jsArray[depth-1] += jsArray[depth];
			algArray[depth-1] += algArray[depth];
			jsArray[depth] = '';
			depth--;
			position.pop();
			//console.log('endOfArray', jsArray);
			return;
		}
	}
	
	function timesBeforeLetters(testText) {
		// find instances of letters - if proceeded by a number, add *
		for (q = 0; q < testText.length; q++) {
			if (q > 0) {
				if (/[a-zA-Z]/g.test(testText.charAt(q)) == true && /[a-zA-Z0-9)]/.test(testText.charAt(q - 1)) == true) {
					testText = testText.slice(0, q) + '*' + testText.slice(q);
				}
				// if an open bracket is proceeded by a letter, number or ), add *
				if (/[\[(]/g.test(testText.charAt(q)) == true && testText.length > q && /[A-Za-z0-9)]/g.test(testText.charAt(q - 1)) == true) {
					testText = testText.slice(0, q) + '*' + testText.slice(q);
				}
			}
			for (var i = 0; i < exceptions.length; i++) {
				if (testText.slice(q).indexOf(exceptions[i]) == 0) {
					q += exceptions[i].length;
				}
			}
		}
		return testText;
	}

	return js;	
}

function calcGridZeros(obj) {
	obj.xZero = Math.max(obj.left,Math.min(obj.left+obj.width,obj.left+obj.width*(0-obj.xMin)/(obj.xMax-obj.xMin)));
	obj.yZero = Math.max(obj.top,Math.min(obj.top+obj.height,obj.top+obj.height-obj.height*(0-obj.yMin)/(obj.yMax-obj.yMin)));
}

function drawClickStartGridPlotMode() {
	var pathNum = draw[taskId].currCursor.pathNum;
	if (draw[taskId].drawMode !== 'grid-plot') {
		changeDrawMode('grid-plot');
	} else {
		changeDrawMode();
	}
	/*for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected == true) {
			updateBorder(draw[taskId].path[i]);
		}
	}*/
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}	
	calcCursorPositions();	
}
function drawClickGridPlotPoint(e) {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (typeof obj.points !== 'object') obj.points = [];

	var pos = getCoordAtMousePos(obj);
	var xPos = roundToNearest(pos[0],obj.xMinorStep);
	var yPos = roundToNearest(pos[1],obj.yMinorStep);
	var found = false;
	for (var i = 0; i < obj.points.length; i++) {
		if (obj.points[i][0] == xPos && obj.points[i][1] == yPos)	{
			obj.points.splice(i,1);
			found = true;
			break;	
		}
	}
	if (found == false) obj.points.push([xPos,yPos]);
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
	} else {
		drawCanvasPaths();
	}	
}

function drawClickStartGridLineSegmentMode() {
	var pathNum = draw[taskId].currCursor.pathNum;
	if (draw[taskId].drawMode !== 'grid-lineSegment') {
		changeDrawMode('grid-lineSegment');
	} else {
		changeDrawMode();
	}
	/*for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected == true) {
			updateBorder(draw[taskId].path[i]);
		}
	}*/
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}	
	calcCursorPositions();	
}
function drawClickStartGridLineMode() {
	var pathNum = draw[taskId].currCursor.pathNum;
	if (draw[taskId].drawMode !== 'grid-line') {
		changeDrawMode('grid-line');
	} else {
		changeDrawMode();
	}
	/*for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].selected == true) {
			updateBorder(draw[taskId].path[i]);
		}
	}*/
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
		drawSelectCanvas();
	} else {
		updateBorder(draw[taskId].path[pathNum]);			
		drawCanvasPaths();
	}	
	calcCursorPositions();
}
function drawClickGridStartLineSegment() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (typeof obj.lineSegments !== 'object') obj.lineSegments = [];	
	
	var pos = getCoordAtMousePos(obj);
	var xPos = roundToNearest(pos[0],obj.xMinorStep);
	var yPos = roundToNearest(pos[1],obj.yMinorStep);
	
	obj.drawing = 'lineSegment';
	obj.lineSegments.push([[xPos,yPos],[]]);	
	addListenerMove(window,drawGridLineMove);
	addListenerEnd(window,drawGridLineStop);
}
function drawClickGridStartLine() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (typeof obj.lines !== 'object') obj.lines = [];	
	
	var pos = getCoordAtMousePos(obj);
	var xPos = roundToNearest(pos[0],obj.xMinorStep);
	var yPos = roundToNearest(pos[1],obj.yMinorStep);
	
	obj.drawing = 'line';
	obj.lines.push([[xPos,yPos],[]]);
	addListenerMove(window,drawGridLineMove);
	addListenerEnd(window,drawGridLineStop);
}
function drawGridLineMove(e) {
	updateMouse(e);
	var pathNum = draw[taskId].currCursor.pathNum;
	if (typeof pathNum == 'undefined') return;
	var obj = draw[taskId].path[pathNum].obj[0];
	
	var pos = getCoordAtMousePos(obj);
	if (draw[taskId].drawMode == 'grid-lineSegment') {
		obj.lineSegments[obj.lineSegments.length-1][1] = pos.slice(0);
	} else if (draw[taskId].drawMode == 'grid-line') {
		obj.lines[obj.lines.length-1][1] = pos.slice(0);
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
	} else {
		drawCanvasPath(pathNum);
	}		
}
function drawGridLineStop(e) {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];	
	
	if (draw[taskId].drawMode == 'grid-lineSegment') {
		var lineSeg = obj.lineSegments[obj.lineSegments.length-1];
		if (roundToNearest(lineSeg[0][0],obj.xMinorStep) == roundToNearest(lineSeg[1][0],obj.xMinorStep) && roundToNearest(lineSeg[0][1],obj.yMinorStep) == roundToNearest(lineSeg[1][1],obj.yMinorStep)) {
			obj.lineSegments.pop();
		} else {
			lineSeg[1][0] = roundToNearest(lineSeg[1][0],obj.xMinorStep);
			lineSeg[1][1] = roundToNearest(lineSeg[1][1],obj.yMinorStep);
		}
	} else if (draw[taskId].drawMode == 'grid-line') {
		var line = obj.lines[obj.lines.length-1];
		if (roundToNearest(line[0][0],obj.xMinorStep) == roundToNearest(line[1][0],obj.xMinorStep) && roundToNearest(line[0][1],obj.yMinorStep) == roundToNearest(line[1][1],obj.yMinorStep)) {
			obj.lines.pop();
		} else {
			line[1][0] = roundToNearest(line[1][0],obj.xMinorStep);
			line[1][1] = roundToNearest(line[1][1],obj.yMinorStep);
		}
	}
	delete obj.drawing;
	removeListenerMove(window,drawGridLineMove);
	removeListenerEnd(window,drawGridLineStop);
	
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
	} else {
		drawCanvasPath(pathNum);
	}	
}

function drawClickGridShowGrid() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (typeof obj.showGrid == 'undefined') {
		obj.showGrid = false;
	} else {
		obj.showGrid = !obj.showGrid;
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
	} else {
		drawCanvasPath(pathNum);
	}	
}
function drawClickGridShowScales() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (typeof obj.showScales == 'undefined') {
		obj.showScales = false;
	} else {
		obj.showScales = !obj.showScales;
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
	} else {
		drawCanvasPath(pathNum);
	}	
}
function drawClickGridShowLabels() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (typeof obj.showLabels == 'undefined') {
		obj.showLabels = false;
	} else {
		obj.showLabels = !obj.showLabels;
	}
	if (pathCanvasMode) {
		pathCanvasDraw(draw[taskId].path[pathNum]);			
	} else {
		drawCanvasPath(pathNum);
	}	
}

/****************************/
/*					  		*/
/* PROTRACTOR RULER COMPASS */
/*				  	  		*/
/****************************/

function drawClickProtractorStartMove() {
	moveToolToFront('protractor');
	draw[taskId].cursorCanvas.style.cursor = draw[taskId].cursors.move1;
	addListenerMove(window,protractorDragMove);
	addListenerEnd(window,protractorDragStop);			
	changeDrawMode('protractorMove');
}
function protractorDragMove(e) {
	updateMouse(e);
	
	point = [mouse.x,mouse.y];
	var center = [mouse.x-draw[taskId].protractor.relSelPoint[0],mouse.y-draw[taskId].protractor.relSelPoint[1]];
	
	if (draw[taskId].snap == true) {
		center = snapToPoints(center,draw[taskId].snapPoints,draw[taskId].snapTolerance);
	}
	
	draw[taskId].protractor.center[0] = center[0];
	draw[taskId].protractor.center[1] = center[1];	
	
	//draw[taskId].protractor.center[0] -= draw[taskId].protractor.prevX - mouse.x;
	//draw[taskId].protractor.center[1] -= draw[taskId].protractor.prevY - mouse.y;	
	drawToolsCanvas();
		
	//draw[taskId].protractor.prevX = mouse.x;
	//draw[taskId].protractor.prevY = mouse.y;
}
function protractorDragStop(e) {
	removeListenerMove(window,protractorDragMove);
	removeListenerEnd(window,protractorDragStop);
	changeDrawMode();
}

function drawClickProtractorStartRotate() {
	moveToolToFront('protractor');
	addListenerMove(window,protractorRotateMove);
	addListenerEnd(window,protractorRotateStop);
	changeDrawMode('protractorRotate');
}
function protractorRotateMove(e) {
	updateMouse(e);
	
	draw[taskId].protractor.angle += measureAngle({c:[mouse.x,mouse.y],b:[draw[taskId].protractor.center[0],draw[taskId].protractor.center[1]],a:[draw[taskId].protractor.prevX,draw[taskId].protractor.prevY],angleType:'radians'});
	drawToolsCanvas();
	
	draw[taskId].protractor.prevX = mouse.x;
	draw[taskId].protractor.prevY = mouse.y;
}
function protractorRotateStop(e) {
	removeListenerMove(window,protractorRotateMove);
	removeListenerEnd(window,protractorRotateStop);
	changeDrawMode();
}

function drawClickRulerStartMove() {
	moveToolToFront('ruler');
	addListenerMove(window,rulerDragMove);
	addListenerEnd(window,rulerDragStop);
	changeDrawMode('rulerMove');
}
function rulerDragMove(e) {
	updateMouse(e);
		
	draw[taskId].ruler.left -= draw[taskId].ruler.prevX - mouse.x;
	draw[taskId].ruler.top -= draw[taskId].ruler.prevY - mouse.y;	
	drawToolsCanvas();
	
	draw[taskId].ruler.prevX = mouse.x;
	draw[taskId].ruler.prevY = mouse.y;
	
	recalcRulerValues();
}
function rulerDragStop(e) {
	removeListenerMove(window,rulerDragMove);
	removeListenerEnd(window,rulerDragStop);
	changeDrawMode();
}

function drawClickRulerStartRotate1() {
	moveToolToFront('ruler');
	addListenerMove(window,rulerRotateMove1);
	addListenerEnd(window,rulerRotateStop);
	changeDrawMode('rulerRotate');
}
function drawClickRulerStartRotate2() {
	moveToolToFront('ruler');
	addListenerMove(window,rulerRotateMove2);
	addListenerEnd(window,rulerRotateStop);
	changeDrawMode('rulerRotate');
}
function rulerRotateMove1(e) {
	updateMouse(e);
	
	dAngle = measureAngle({c:[mouse.x,mouse.y],b:[draw[taskId].ruler.centerX2,draw[taskId].ruler.centerY2],a:[draw[taskId].ruler.prevX,draw[taskId].ruler.prevY],angleType:'radians'});
	draw[taskId].ruler.angle += dAngle;
	draw[taskId].ruler.left = (draw[taskId].ruler.centerX2 - 0.98*draw[taskId].ruler.length*Math.cos(draw[taskId].ruler.angle));
	draw[taskId].ruler.top = (draw[taskId].ruler.centerY2 - 0.98*draw[taskId].ruler.length*Math.sin(draw[taskId].ruler.angle));
	drawToolsCanvas();	
	
	draw[taskId].ruler.prevX = mouse.x;
	draw[taskId].ruler.prevY = mouse.y;
	
	recalcRulerValues();
}
function rulerRotateMove2(e) {
	updateMouse(e);
	
	draw[taskId].ruler.angle += measureAngle({c:[mouse.x,mouse.y],b:[draw[taskId].ruler.centerX1,draw[taskId].ruler.centerY1],a:[draw[taskId].ruler.prevX,draw[taskId].ruler.prevY],angleType:'radians'});
	drawToolsCanvas();
	
	draw[taskId].ruler.prevX = mouse.x;
	draw[taskId].ruler.prevY = mouse.y;
	
	recalcRulerValues();
}
function rulerRotateStop(e) {
	removeListenerMove(window,rulerRotateMove1);
	removeListenerMove(window,rulerRotateMove2);	
	removeListenerEnd(window,rulerRotateStop);
	changeDrawMode();
}

function drawClickRulerStartDraw1() {
	//console.log('drawClickRulerStartDraw1');
	moveToolToFront('ruler');
	draw[taskId].drawing = true;
	drawCanvasPaths();
	draw[taskId].path.push({obj:[{
		type:'line',
		color:draw[taskId].color,
		thickness:draw[taskId].thickness,
		startPos:[draw[taskId].startX,draw[taskId].startY]
	}],selected:false});
	addListenerMove(window,rulerDrawMove1);
	addListenerEnd(window,lineDrawStop);	
}
function rulerDrawMove1(e) {
	updateMouse(e);
	var newPos = closestPointOnLineSegment([mouse.x,mouse.y],draw[taskId].ruler.edgePos1,draw[taskId].ruler.edgePos2);
	draw[taskId].path[draw[taskId].path.length-1].obj[0].finPos = newPos;
	drawCanvasPath(draw[taskId].path.length-1);	
}

function drawClickRulerStartDraw2() {
	//console.log('drawClickRulerStartDraw2');
	moveToolToFront('ruler');
	draw[taskId].drawing = true;
	drawCanvasPaths();
	draw[taskId].path.push({obj:[{
		type:'line',
		color:draw[taskId].color,
		thickness:draw[taskId].thickness,
		startPos:[draw[taskId].startX,draw[taskId].startY]
	}],selected:false});
	addListenerMove(window,rulerDrawMove2);
	addListenerEnd(window,lineDrawStop);	
}
function rulerDrawMove2(e) {
	updateMouse(e);
	var newPos = closestPointOnLineSegment([mouse.x,mouse.y],draw[taskId].ruler.edgePos3,draw[taskId].ruler.edgePos4);
	draw[taskId].path[draw[taskId].path.length-1].obj[0].finPos = newPos;
	drawCanvasPath(draw[taskId].path.length-1);	
}

function drawClickCompassLock() {
	moveToolToFront('compass');
	draw[taskId].compass.radiusLocked = !draw[taskId].compass.radiusLocked;
	drawToolsCanvas();	
}

function drawClickCompassStartDraw() {
	moveToolToFront('compass');
	draw[taskId].compass.mode = 'draw';
	changeDrawMode('compassDraw');
	draw[taskId].path.push({obj:[{
		type:'arc',
		color:draw[taskId].color,
		thickness:draw[taskId].thickness,
		center:draw[taskId].compass.center1.slice(0),
		radius:draw[taskId].compass.radius,
		startAngle:draw[taskId].compass.angle,
		finAngle:draw[taskId].compass.angle,
		clockwise:true
	}],selected:false});
	drawCanvasPaths();
	addListenerMove(window,compassDrawMove);
	addListenerEnd(window,compassDrawStop);	
}
function compassDrawMove(e) {
	updateMouse(e);

	var dAngle = measureAngle({c:[mouse.x,mouse.y],b:[draw[taskId].compass.center1[0],draw[taskId].compass.center1[1]],a:[draw[taskId].compass.prevX,draw[taskId].compass.prevY],angleType:'radians'});
	if (dAngle > Math.PI) {
		draw[taskId].compass.angle -= dAngle = 2*Math.PI-dAngle;
	} else {
		draw[taskId].compass.angle += dAngle;
	}
	
	var angle = (draw[taskId].compass.angle%(2*Math.PI));
	if (angle < 0) angle += 2*Math.PI;
	if (angle > 0.5 * Math.PI && angle < 1.5 * Math.PI) {
		draw[taskId].compass.drawOn = 'left';	
	} else {
		draw[taskId].compass.drawOn = 'right';
	}	
	
	if (draw[taskId].compass.drawOn == 'right') {
		draw[taskId].compass.center2[0] = draw[taskId].compass.center1[0]+0.5*draw[taskId].compass.radius*Math.cos(draw[taskId].compass.angle)+draw[taskId].compass.h*Math.sin(draw[taskId].compass.angle);
		draw[taskId].compass.center2[1] = draw[taskId].compass.center1[1]+0.5*draw[taskId].compass.radius*Math.sin(draw[taskId].compass.angle)-draw[taskId].compass.h*Math.cos(draw[taskId].compass.angle);
	} else {
		draw[taskId].compass.center2[0] = draw[taskId].compass.center1[0]+0.5*draw[taskId].compass.radius*Math.cos(draw[taskId].compass.angle)-draw[taskId].compass.h*Math.sin(draw[taskId].compass.angle);
		draw[taskId].compass.center2[1] = draw[taskId].compass.center1[1]+0.5*draw[taskId].compass.radius*Math.sin(draw[taskId].compass.angle)+draw[taskId].compass.h*Math.cos(draw[taskId].compass.angle);			
	}

	draw[taskId].compass.center3[0] = draw[taskId].compass.center1[0]+draw[taskId].compass.radius*Math.cos(draw[taskId].compass.angle);
	draw[taskId].compass.center3[1] = draw[taskId].compass.center1[1]+draw[taskId].compass.radius*Math.sin(draw[taskId].compass.angle);	

	var mp1 = midpoint(draw[taskId].compass.center1[0],draw[taskId].compass.center1[1],draw[taskId].compass.center3[0],draw[taskId].compass.center3[1]);
	var mp2 = midpoint(draw[taskId].compass.center2[0],draw[taskId].compass.center2[1],mp1[0],mp1[1]);
	draw[taskId].compass.lockCenter = mp2;

	draw[taskId].path[draw[taskId].path.length-1].obj[0].startAngle = Math.min(draw[taskId].path[draw[taskId].path.length-1].obj[0].startAngle,draw[taskId].compass.angle);
	draw[taskId].path[draw[taskId].path.length-1].obj[0].finAngle = Math.max(draw[taskId].path[draw[taskId].path.length-1].obj[0].finAngle,draw[taskId].compass.angle);	
	
	recalcCompassValues();
	drawCanvasPath(draw[taskId].path.length-1);
	drawToolsCanvas();
	
	draw[taskId].compass.prevX = mouse.x;
	draw[taskId].compass.prevY = mouse.y;
}
function compassDrawStop(e) {
	removeListenerMove(window,compassDrawMove);
	removeListenerEnd(window,compassDrawStop);	
	draw[taskId].compass.mode = 'none';
	changeDrawMode('prev');
	recalcCompassValues();
	drawToolsCanvas();
	// simplify angles to between 0 and 360
	var angle1 = draw[taskId].path[draw[taskId].path.length-1].obj[0].startAngle;
	var angle2 = draw[taskId].path[draw[taskId].path.length-1].obj[0].finAngle;
	if (angle1 > angle2) {
		draw[taskId].path[draw[taskId].path.length-1].obj[0].clockwise = true;
	} else {
		draw[taskId].path[draw[taskId].path.length-1].obj[0].clockwise = false;
	}
	if (Math.abs(angle1 - angle2) > 2 * Math.PI) {
		draw[taskId].path[draw[taskId].path.length-1].obj[0].startAngle = 0;
		draw[taskId].path[draw[taskId].path.length-1].obj[0].finAngle = 2 * Math.PI;
		draw[taskId].path[draw[taskId].path.length-1].obj[0].clockwise = true;
	} else {
		while (angle1 < 0) {angle1 += 2 * Math.PI;}
		while (angle2 < 0) {angle2 += 2 * Math.PI;}
		while (angle1 > 2 * Math.PI) {angle1 -= 2 * Math.PI;}
		while (angle2 > 2 * Math.PI) {angle2 -= 2 * Math.PI;}
		if (draw[taskId].path[draw[taskId].path.length-1].obj[0].clockwise == true) {
			draw[taskId].path[draw[taskId].path.length-1].obj[0].startAngle = angle1;
			draw[taskId].path[draw[taskId].path.length-1].obj[0].finAngle = angle2;
		} else {
			draw[taskId].path[draw[taskId].path.length-1].obj[0].startAngle = angle2;
			draw[taskId].path[draw[taskId].path.length-1].obj[0].finAngle = angle1;			
		}
	}
	//console.log(draw[taskId].path[draw[taskId].path.length-1].startAngle,draw[taskId].path[draw[taskId].path.length-1].finAngle,draw[taskId].path[draw[taskId].path.length-1].clockwise);
	drawCanvasPaths();	
}

function drawClickCompassStartMove1() {
	moveToolToFront('compass');
	draw[taskId].compass.mode = 'move1';
	changeDrawMode('compassMove1');
	updateSnapPoints(); // update intersection points	
	addListenerMove(window,compassMove1Move);
	addListenerEnd(window,compassMoveStop);
	draw[taskId].cursorCanvas.style.cursor = 'url("../images/cursors/closedhand.cur"), auto';	
}
function drawClickCompassStartMove2() {
	moveToolToFront('compass');
	draw[taskId].compass.mode = 'move2';
	changeDrawMode('compassMove2');
	updateSnapPoints(); // update intersection points	
	draw[taskId].compass.pointerEvents = 'auto';				
	addListenerMove(window,compassMove2Move);
	addListenerEnd(window,compassMoveStop);	
	draw[taskId].cursorCanvas.style.cursor = 'url("../images/cursors/closedhand.cur"), auto';
}
function compassMove1Move(e) {
	updateMouse(e);
	var center1 = [
		mouse.x-draw[taskId].drawRelPos[0]-draw[taskId].compass.relSelPoint[0],
		mouse.y-draw[taskId].drawRelPos[1]-draw[taskId].compass.relSelPoint[1]
	];
	if (ctrlOn || draw[taskId].snapLinesTogether) {
		center1 = snapToObj2(center1);
	}
	draw[taskId].compass.center1 = center1;
	draw[taskId].compass.center2 = [center1[0]+draw[taskId].compass.relCenter2[0],center1[1]+draw[taskId].compass.relCenter2[1]];
	draw[taskId].compass.center3 = [center1[0]+draw[taskId].compass.relCenter3[0],center1[1]+draw[taskId].compass.relCenter3[1]];
	draw[taskId].compass.lockCenter = [center1[0]+draw[taskId].compass.relLockCenter[0],center1[1]+draw[taskId].compass.relLockCenter[1]];	
	drawToolsCanvas();
}
function compassMove2Move(e) {
	updateMouse(e);
	var newcenter3 = [draw[taskId].compass.center3[0] + (mouse.x - draw[taskId].compass.prevX), draw[taskId].compass.center3[1] + (mouse.y - draw[taskId].compass.prevY)];

	if (draw[taskId].compass.radiusLocked == false) {
		var newRadius = Math.sqrt(Math.pow(newcenter3[0]-draw[taskId].compass.center1[0],2)+Math.pow(newcenter3[1]-draw[taskId].compass.center1[1],2));
		
		if (newRadius <= 1.85 * draw[taskId].compass.armLength) {
			draw[taskId].compass.center3[0] = newcenter3[0];
			draw[taskId].compass.center3[1] = newcenter3[1];
			draw[taskId].compass.radius = newRadius;
			if (draw[taskId].compass.center3[0] >= draw[taskId].compass.center1[0]) {
				draw[taskId].compass.angle = Math.atan((draw[taskId].compass.center3[1]-draw[taskId].compass.center1[1])/(draw[taskId].compass.center3[0]-draw[taskId].compass.center1[0]));
			} else {
				draw[taskId].compass.angle = Math.PI + Math.atan((draw[taskId].compass.center3[1]-draw[taskId].compass.center1[1])/(draw[taskId].compass.center3[0]-draw[taskId].compass.center1[0]));
			}			
		} else {			
			if (newcenter3[0] >= draw[taskId].compass.center1[0]) {
				draw[taskId].compass.angle = Math.atan((newcenter3[1]-draw[taskId].compass.center1[1])/(newcenter3[0]-draw[taskId].compass.center1[0]));
			} else {
				draw[taskId].compass.angle = Math.PI + Math.atan((newcenter3[1]-draw[taskId].compass.center1[1])/(newcenter3[0]-draw[taskId].compass.center1[0]));
			}
			draw[taskId].compass.center3[0] = draw[taskId].compass.center1[0] + 1.85 * draw[taskId].compass.armLength * Math.cos(draw[taskId].compass.angle);
			draw[taskId].compass.center3[1] = draw[taskId].compass.center1[1] + 1.85 * draw[taskId].compass.armLength * Math.sin(draw[taskId].compass.angle);
			draw[taskId].compass.radius = 1.85 * draw[taskId].compass.armLength;		
		}
	} else {
		var dAngle = measureAngle({c:[mouse.x,mouse.y],b:[draw[taskId].compass.center1[0],draw[taskId].compass.center1[1]],a:[draw[taskId].compass.prevX,draw[taskId].compass.prevY],angleType:'radians'});
		if (dAngle > Math.PI) {
			//draw[taskId].compass.angle -= dAngle = 2*Math.PI-dAngle;
			draw[taskId].compass.angle -= (2*Math.PI-dAngle);
		} else {
			draw[taskId].compass.angle += dAngle;
		}
		draw[taskId].compass.center3[0] = draw[taskId].compass.center1[0] + draw[taskId].compass.radius * Math.cos(draw[taskId].compass.angle);
		draw[taskId].compass.center3[1] = draw[taskId].compass.center1[1] + draw[taskId].compass.radius * Math.sin(draw[taskId].compass.angle);					
	}

	var angle = (draw[taskId].compass.angle%(2*Math.PI));
	if (angle < 0) angle += 2*Math.PI;
	if (angle > 0.5 * Math.PI && angle < 1.5 * Math.PI) {
		draw[taskId].compass.drawOn = 'left';	
	} else {
		draw[taskId].compass.drawOn = 'right';
	}
		
	draw[taskId].compass.h	= Math.sqrt(Math.pow(draw[taskId].compass.armLength,2)-Math.pow(0.5*draw[taskId].compass.radius,2));
	if (draw[taskId].compass.drawOn == 'right') {
		draw[taskId].compass.center2[0] = draw[taskId].compass.center1[0]+0.5*draw[taskId].compass.radius*Math.cos(draw[taskId].compass.angle)+draw[taskId].compass.h*Math.sin(draw[taskId].compass.angle);
		draw[taskId].compass.center2[1] = draw[taskId].compass.center1[1]+0.5*draw[taskId].compass.radius*Math.sin(draw[taskId].compass.angle)-draw[taskId].compass.h*Math.cos(draw[taskId].compass.angle);		
	} else {
		draw[taskId].compass.center2[0] = draw[taskId].compass.center1[0]+0.5*draw[taskId].compass.radius*Math.cos(draw[taskId].compass.angle)-draw[taskId].compass.h*Math.sin(draw[taskId].compass.angle);
		draw[taskId].compass.center2[1] = draw[taskId].compass.center1[1]+0.5*draw[taskId].compass.radius*Math.sin(draw[taskId].compass.angle)+draw[taskId].compass.h*Math.cos(draw[taskId].compass.angle);				
	}
	
	var mp1 = midpoint(draw[taskId].compass.center1[0],draw[taskId].compass.center1[1],draw[taskId].compass.center3[0],draw[taskId].compass.center3[1]);
	var mp2 = midpoint(draw[taskId].compass.center2[0],draw[taskId].compass.center2[1],mp1[0],mp1[1]);
	draw[taskId].compass.lockCenter = mp2;
	
	recalcCompassValues();
	drawToolsCanvas();
	
	draw[taskId].compass.prevX = mouse.x;
	draw[taskId].compass.prevY = mouse.y;
}
function compassMoveStop(e) {
	removeListenerMove(window,compassMove1Move);
	removeListenerMove(window,compassMove2Move);
	removeListenerEnd(window,compassMoveStop);	
	draw[taskId].cursorCanvas.style.cursor = draw[taskId].cursors.move1;
	draw[taskId].compass.mode = 'none';
	changeDrawMode('prev');
	recalcCompassValues();
}

/***************************/
/*					  	   */
/*     		qBox2		   */
/*				  	  	   */
/***************************/

function addQBox2(l,t,w,h,sf) {
	var left = l || 23;
	var top = t || 23;
	var width = w || 570;
	var height = h || 591;
	var scale = sf || 1; // should scale replace w & h?
	draw[taskId].qBox2.visible.push(true);
	draw[taskId].qBox2.box.push([left,top,width,height]);
	draw[taskId].qBox2.parts.push([0]);
	draw[taskId].qBox2.partMarks.push([0]);
	draw[taskId].qBox2.markPos.push([[-50,-80]]); // markPos is measured from the bottom right of the question part
	draw[taskId].qBox2.showMark.push(['none']);
	draw[taskId].qBox2.boxQ.push(-1);
	draw[taskId].qBox2.boxScale.push(scale);
	var ctx1 = newctx({l:l,t:t,w:w,h:h,z:200});
	var ctx2 = newctx({l:l,t:t,w:w,h:h,z:200});
	draw[taskId].qBox2.penctx.push([ctx1,ctx2]);
	draw[taskId].qBox2.penPaths.push([]);
	if (pathCanvasMode) {
		drawSelectCanvas();
		drawSelectCanvas2();
	} else {
		drawCanvasPaths(); 	
	}
}

function qBox2PartsMinus() {
	var b =  draw[taskId].currCursor.box;
	if (draw[taskId].qBox2.parts[b].length > 1) {
		draw[taskId].qBox2.parts[b].pop();
		draw[taskId].qBox2.markPos[b].pop();
		draw[taskId].qBox2.showMark[b].pop();
		draw[taskId].qBox2.textPath[b].pop();
		for (var p = draw[taskId].path.length-1; p >= 0 ; p--) {
			if (typeof draw[taskId].path[p].qBox2Part == 'number' && draw[taskId].path[p].qBox2Part >= draw[taskId].qBox2.parts[b].length) {
				removePathObject(p);
			}
		}
		drawCanvasPaths(); 
	}
}
function qBox2PartsPlus() {
	var b =  draw[taskId].currCursor.box;
	if (draw[taskId].qBox2.parts[b].length < 6) {
		var t = (draw[taskId].qBox2.parts[b][draw[taskId].qBox2.parts[b].length-1]+591)/2;
		draw[taskId].qBox2.parts[b].push(t);
		var mInput = createMathsInput2({
			left:23,
			top:23,
			width:570,
			height:581,
			maxLines:500,
			backColor:'none',
			selectColor:'none',
			border:false,
			//borderWidth:1,
			//borderDash:[4,6],
			//borderColor:'#00F',
			textAlign:'left',
			vertAlign:'top',
			fontSize:28,
			selectable:true,
			zIndex:draw[taskId].zIndex,
			varSize:{minWidth:30,maxWidth:550,minHeight:60,maxHeight:581},
			pointerCanvas:draw[taskId].cursorCanvas,
		});	
		draw[taskId].path.push({obj:[{
			type:'text',
			mathsInput:mInput,
			left:23,
			top:23,
			width:570,
			height:581,
			backColor:'none',
			selectColor:'none',
			textAlign:'center',
			vertAlign:'top'
		}],selected:false,trigger:[],qBox2Part:draw[taskId].qBox2.parts[b].length-1});
		draw[taskId].qBox2.textPath[b].push(draw[taskId].path[draw[taskId].path.length-1]);
		draw[taskId].qBox2.markPos[b].push([-50,-80]);
		draw[taskId].qBox2.showMark[b].push('none');		
		setMathsInputText(mInput,'()');
		qBox2ResizeParts(b);		
		drawCanvasPaths();
	}
}
function qBox2PartResizeStart() {
	changeDrawMode('qBox2PartResize');
	draw[taskId].qBox2PartResizing =  draw[taskId].currCursor.partNum;
	draw[taskId].qBox2BoxResizing =  draw[taskId].currCursor.box;
	addListenerMove(window,qBox2PartResizeMove);
	addListenerEnd(window,qBox2PartResizeStop);	
}
function qBox2PartResizeMove(e) {
	updateMouse(e);
	var b = draw[taskId].qBox2BoxResizing;
	var n = draw[taskId].qBox2PartResizing;
	var p = draw[taskId].qBox2.parts[b];
	var min = 10;
	var max = 593;
	if (n > 0) min = p[n-1] + 10;
	if (n < p.length-1) max = p[n+1] - 10;
	p[n] = Math.min(Math.max(mouse.y-23,min),max);
	qBox2ResizeParts(b);
	drawCanvasPaths();
}	
function qBox2PartResizeStop(e) {
	removeListenerMove(window,qBox2PartResizeMove);
	removeListenerEnd(window,qBox2PartResizeStop);
	changeDrawMode('prev');
}
function qBox2MarkDragStart() {
	changeDrawMode('qBox2MarkDrag');
	draw[taskId].qBox2PartMarkMoving = draw[taskId].currCursor.part;
	draw[taskId].qBox2BoxMarkMoving = draw[taskId].currCursor.box;
	var b = draw[taskId].currCursor.box;
	var p = draw[taskId].currCursor.part;
	var parts = draw[taskId].qBox2.parts[b];
	var max = 591;
	if (p < parts.length-1) max = parts[p+1];			
	var pos = [23+570+draw[taskId].qBox2.markPos[b][p][0],23+max+draw[taskId].qBox2.markPos[b][p][1]];
	draw[taskId].qBox2MarkDragOffset = [mouse.x-pos[0],mouse.y-pos[1]];
	addListenerMove(window,qBox2MarkDragMove);
	addListenerEnd(window,qBox2MarkDragStop);	
}
function qBox2MarkDragMove(e) {
	updateMouse(e);
	var b = draw[taskId].qBox2BoxMarkMoving;
	var n = draw[taskId].qBox2PartMarkMoving;
	var p = draw[taskId].qBox2.parts[b];
	var minX = -570;
	var maxX = -40;
	var minY = -591;
	if (n < p.length-1) max = -(p[n+1]-p[n]);	
	var maxY = -50;
	var yMaxPos = 591;
	if (n < p.length-1) yMaxPos = p[n+1];
	var m = draw[taskId].qBox2.markPos[b][n] = [Math.min(Math.max(mouse.x-draw[taskId].qBox2MarkDragOffset[0]-570,minX),maxX),Math.min(Math.max(mouse.y-draw[taskId].qBox2MarkDragOffset[1]-yMaxPos,minY),maxY)];
	drawSelectCanvas();
}	
function qBox2MarkDragStop(e) {
	removeListenerMove(window,qBox2MarkDragMove);
	removeListenerEnd(window,qBox2MarkDragStop);
	changeDrawMode('prev');
}
function qBox2TextStart() {
	var i = draw[taskId].currCursor.pathNum;
	//currMathsInput = draw[taskId].path[i].obj[0].mathsInput;
	//showObj(draw[taskId].path[i].obj[0].mathsInput.cursorCanvas,draw[taskId].path[i].obj[0].mathsInput.cursorData);
	//mathsInputMapCursorPos();
	//console.log(JSON.stringify(draw[taskId].path[i].obj[0].mathsInput.cursorMap),draw[taskId].path[i].obj[0].mathsInput.cursorPos);
	//addListener(window,selectTextMove);
	//addListener(window,selectTextStop);
	startMathsInput(draw[taskId].path[i].obj[0].mathsInput.canvas,getClosestTextPos(draw[taskId].path[i].obj[0].mathsInput));
}
function qBox2ResizeParts(b) {
	path = draw[taskId].qBox2.textPath[b];
	p = draw[taskId].qBox2.parts[b];
	for (var i = 0; i < path.length; i++) {
		var obj = path[i].obj[0];
		obj.top = 23+p[i];
		if (i > 0) obj.top += 10;
		if (i == path.length - 1) {
			obj.height = 591-obj.top;
		} else {
			obj.height = p[i+1]-obj.top;
		}
		var mInput = obj.mathsInput;
		mInput.data[101] = obj.top;
		mInput.data[103] = obj.height;
		mInput.canvas.height = mInput.data[103];				
		resizeCanvas(mInput.canvas,mInput.data[100],mInput.data[101],mInput.data[102],mInput.data[103]);
		currMathsInput = obj.mathsInput;
		mathsInputMapCursorPos();
	}
}

function saveQ2(obj) {
	if (typeof obj == 'undefined') obj = {};
	var qNum = obj.qNum || 0;
	if (typeof obj.calc == 'undefined') obj.calc = 0;
	if (typeof obj.y7 == 'undefined') obj.y7 = 0;
	if (typeof obj.y8 == 'undefined') obj.y8 = 0;
	if (typeof obj.y9 == 'undefined') obj.y9 = 0;
	if (typeof obj.y10 == 'undefined') obj.y10 = 0;
	if (typeof obj.y11 == 'undefined') obj.y11 = 0;
	if (typeof obj.y12 == 'undefined') obj.y12 = 0;
	if (typeof obj.y13 == 'undefined') obj.y13 = 0;
	if (typeof obj.gcsef == 'undefined') obj.gcsef = 0;
	if (typeof obj.gcseh == 'undefined') obj.gcseh = 0;
	
	var saveId = obj.filename;
	
	var paths = [];
	var inputTypes = [];
	var parts = draw[taskId].qBox2.parts[0].length;
	var possMarks = [];	
	var ans = [];
	for (var p = 0; p < parts; p++) {
		possMarks.push(1);
		ans[p] = [];
	}
	for (var i = 0; i < draw[taskId].path.length; i++) {
		//console.log(i,draw[taskId].path[i]);
		if (hitTestPathRect(draw[taskId].path[i],23,23,570,591) == true) {
			for (var o = 0; o < draw[taskId].path[i].obj.length; o++) {
				var obj = draw[taskId].path[i].obj[o];
				if (['input','multChoice'].indexOf(obj.type) > -1) {
					if (obj.type == 'input') qBox2InputSaveAnsNum(obj);
					for (var p = 0; p < draw[taskId].qBox2.parts[0].length; p++) {
						var max = 591;
						if (p < draw[taskId].qBox2.parts[0].length - 1) max = draw[taskId].qBox2.parts[0][p+1];
						if (hitTestPathRect(draw[taskId].path[i],23-10,23+Number(draw[taskId].qBox2.parts[0][p])-10,570+20,max-(23+Number(draw[taskId].qBox2.parts[0][p]))+20) == true) {
							inputTypes[p] = obj.type;
							if (obj.type == 'input') {
								if (!un(obj.answers)) {
									var maxMarks = 1;
									//console.log(obj.answers);
									for (var a = 0; a < obj.answers.length; a++) {
										maxMarks = Math.max(maxMarks,obj.answers[a].marks);
										ans[p].push(obj.answers[a]);
									}
									possMarks[p] = maxMarks;
								}
							} else if (obj.type == 'multChoice') {
								ans[p] = obj.correctCell;
							}
							break;
						}
					}
				}
	
				if (typeof obj.left !== 'undefined') obj.relLeft = obj.left-23;
				if (typeof obj.top !== 'undefined') obj.relTop = obj.top-23;
				if (typeof obj.center !== 'undefined') obj.relCenter = [obj.center[0]-23,obj.center[1]-23];
				if (typeof obj.startPos !== 'undefined') obj.relStartPos = [obj.startPos[0]-23,obj.startPos[1]-23];
				if (typeof obj.finPos !== 'undefined') obj.relFinPos = [obj.finPos[0]-23,obj.finPos[1]-23];
				if (typeof obj.controlPos !== 'undefined') obj.relControlPos = [obj.controlPos[0]-23,obj.controlPos[1]-23];
				if (typeof obj.controlPos1 !== 'undefined') obj.relControlPos1 = [obj.controlPos1[0]-23,obj.controlPos1[1]-23];
				if (typeof obj.controlPos2 !== 'undefined') obj.relControlPos2 = [obj.controlPos2[0]-23,obj.controlPos2[1]-23];
				if (typeof obj.a !== 'undefined') obj.relA = [obj.a[0]-23,obj.a[1]-23];
				if (typeof obj.b !== 'undefined') obj.relB = [obj.b[0]-23,obj.b[1]-23];
				if (typeof obj.c !== 'undefined') obj.relC = [obj.c[0]-23,obj.c[1]-23];
				if (typeof obj.pos !== 'undefined') {
					obj.relPos = [];
					for (var a = 0; a < obj.pos.length; a++) {
						obj.relPos[a] = [obj.pos[a][0]-23,obj.pos[a][1]-23];
					}
				}
				if (typeof obj.points !== 'undefined') {
					obj.relPoints = [];
					for (var a = 0; a < obj.points.length; a++) {
						obj.relPoints[a] = [obj.points[a][0]-23,obj.points[a][1]-23];
					}
				}
				if (typeof obj.mathsInput !== 'undefined') {
					obj.mathsInput.relLeft = obj.mathsInput.data[100]-23;
					obj.mathsInput.relTop = obj.mathsInput.data[101]-23;
				}
				if (typeof obj.leftInput !== 'undefined') {
					obj.leftInput.relLeft = obj.leftInput.data[100]-23;
					obj.leftInput.relTop = obj.leftInput.data[101]-23;					
				}
				if (typeof obj.rightInput !== 'undefined') {
					obj.rightInput.relLeft = obj.rightInput.data[100]-23;
					obj.rightInput.relTop = obj.rightInput.data[101]-23;					
				}
				if (typeof obj.mInputs !== 'undefined') {
					if (obj.type == 'table') {
						for (var r = 0; r < obj.mInputs.length; r++) {
							for (var c = 0; c < obj.mInputs[r].length; c++) {
								obj.mInputs[r][c].relLeft = obj.mInputs[r][c].data[100]-23;
								obj.mInputs[r][c].relTop = obj.mInputs[r][c].data[101]-23;								
							}
						}
					} else {
						for (var m = 0; m < obj.mInputs.length; m++) {
							obj.mInputs[m].relLeft = obj.mInputs[m].data[100]-23;
							obj.mInputs[m].relTop = obj.mInputs[m].data[101]-23;
						}
					}
				}
			}
			var pathReduced = reduceDrawPathForSaving(i);
			paths.push(pathReduced);
		}
	}
	var obj = {parts:draw[taskId].qBox2.parts[0],paths:paths,inputTypes:inputTypes,markPos:draw[taskId].qBox2.markPos[0],showMark:draw[taskId].qBox2.showMark[0]};
	if (!un(draw[taskId].qBox2.q[saveId].vars)) {
		obj.vars = JSONfn.stringify(draw[taskId].qBox2.q[saveId].vars);
	}
	if (!un(draw[taskId].qBox2.q[saveId].z)) {
		//obj.z = JSONfn.stringify(draw[taskId].qBox2.q[saveId].z)
		obj.z = [];
		for (var z = 0; z < draw[taskId].qBox2.q[saveId].z.length; z++) {
			obj.z[z] = JSONfn.stringify(draw[taskId].qBox2.q[saveId].z[z]);
		}
	}
	
	var qdata = 'var qBox2Q = '+stringify(obj,{maxLength:150});
	var params = 'calc='+encodeURIComponent(obj.calc)+'&y7='+encodeURIComponent(obj.y7)+'&y8='+encodeURIComponent(obj.y8)+'&y9='+encodeURIComponent(obj.y9)+'&y10='+encodeURIComponent(obj.y10)+'&y11='+encodeURIComponent(obj.y11)+'&gcsef='+encodeURIComponent(obj.gcsef)+'&gcseh='+encodeURIComponent(obj.gcseh)+'&y12='+encodeURIComponent(obj.y12)+'&y13='+encodeURIComponent(obj.y13)+'&qdata='+encodeURIComponent(qdata)+'&saveId='+encodeURIComponent(saveId)+'&parts='+encodeURIComponent(parts)+'&inputTypes='+encodeURIComponent(JSON.stringify(inputTypes))+'&possMarks='+encodeURIComponent(JSON.stringify(possMarks));
	//console.log(JSON.stringify(obj));
	//console.log(qdata);
	//console.log(params);
	//console.log(inputTypes,ans);
	
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("post", "saveQ2.php", true);
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.onload = function() {
		console.log(this.responseText);
	}
	xmlHttp.send(params);
	
	for (var p = 0; p < inputTypes.length; p++) {
		if (inputTypes[p] == 'multChoice') {
			var params = 'qId='+encodeURIComponent(saveId)+'&part='+encodeURIComponent(p)+'&ans='+encodeURIComponent(ans[p])+'&marks=1&type=multChoice';
			//console.log(params);
			
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("post", "saveQ2Ans.php", true);
			xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlHttp.onload = function() {
				//console.log(this.responseText);
			}
			xmlHttp.send(params);
		} else if (inputTypes[p] == 'input') {
			for (var a = 0; a < ans[p].length; a++) {
				var ans2 = JSON.stringify(ans[p][a].answer);
				ans2 = replaceAll(ans2,' ','');
				ans2 = ans2.toLowerCase();
				var params = 'qId='+encodeURIComponent(saveId)+'&part='+encodeURIComponent(p)+'&ans='+encodeURIComponent(ans2)+'&marks='+encodeURIComponent(ans[p][a].marks)+'&type=input';
				//console.log(params);
				
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.open("post", "saveQ2Ans.php", true);
				xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xmlHttp.onload = function() {
					//console.log(this.responseText);
				}
				xmlHttp.send(params);				
			}			
		}

	}
}
function createQuiz(name,qIdArray) {
	qs = JSON.stringify(qIdArray);
	var params = 'name='+encodeURIComponent(name)+'&qs='+encodeURIComponent(qs);
	//console.log(params);
	
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("post", "createQuiz.php", true);
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.onload = function() {
		console.log(this.responseText);
	}
	xmlHttp.send(params);	
}
function loadQ2(qId,boxNum,questionNum,callback,qPossMarksArray,errorCallback) {
	if (un(errorCallback)) errorCallback = function() {};
	if (!un(draw[taskId].qBox2.q[qId])) {
		if (typeof boxNum !== 'undefined') {
			qBox2QToBox(boxNum,qId);
			if (draw[taskId].qBox2.mode == 'edit' && draw[taskId].qBox2.metaMode == 'ansData' && typeof draw[taskId].qBox2.ansDataCanvas !== 'undefined') {
				draw[taskId].qBox2.ansDataPart = 0;
				draw[taskId].qBox2.ansDataCanvas.draw();
			}
		}
		if (!un(callback)) callback();
	} else {
		var loadingReady = [false,false];
		var meta;
		
		loadScript('../_q2_/'+qId+'.js',function() {
			loadingReady[0] = true;
			if (loadingReady[1]) afterLoading();
		},errorCallback);
		
		if (draw[taskId].qBox2.mode == 'edit') {
			// load ans data
			var params = 'qId='+encodeURIComponent(qId);
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("post", "loadQ2Meta.php", true);
			xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlHttp.onload = function() {
				meta = JSON.parse(this.responseText);
				loadingReady[1] = true;
				if (loadingReady[0]) afterLoading();
			}
			xmlHttp.send(params);
		} else {
			// get max marks
			var params = 'qId='+encodeURIComponent(qId);
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("post", "loadQ2MaxMarks.php", true);
			xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlHttp.onload = function() {
				meta = JSON.parse(this.responseText);
				loadingReady[1] = true;
				if (loadingReady[0]) afterLoading();
			}
			xmlHttp.send(params);			
		}
		
		function afterLoading() {
			draw[taskId].qBox2.q[qId] = qBox2Q;
			var q = draw[taskId].qBox2.q[qId];
			
			if (!un(q.vars)) {
				q.vars = JSONfn.parse(q.vars);
				if (draw[taskId].qBox2.mode !== 'edit') {
					q.v = q.vars();
				}
			}
			if (!un(q.z)) {
				//q.z = JSONfn.parse(q.z);
				for (var z = 0; z < q.z.length; z++) {
					q.z[z] = JSONfn.parse(q.z[z]);
				}
			}
			
			for (var p = 0; p < q.paths.length; p++) {
				var path = q.paths[p];
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (typeof obj.ansNum !== 'undefined') obj.ansNum = 0;
					if (draw[taskId].qBox2.mode !== 'edit' && typeof questionNum !== 'undefined') {
						if (obj.type == 'text') {
							obj.mathsInput.richText = removeTagsOfType(obj.mathsInput.richText,'selected');
							obj.mathsInput.richText = textArrayReplace(obj.mathsInput.richText,"{q}",String(questionNum));
							if (!un(q.v)) {
								for (var v = 0; v < q.v.length; v++) {
									obj.mathsInput.richText = textArrayReplace(obj.mathsInput.richText,"{v"+v+"}",q.v[v]);
								}
							}
						} else if (obj.type == 'input') {
							if (!un(obj.mathsInput.startTags)) obj.mathsInput.richText = [obj.mathsInput.startTags];
							obj.mathsInput.selectable = false;
						}
					}
				}
			}
			if (draw[taskId].qBox2.mode == 'edit') {
				qBox2SortQuestionInputs(qId);
				
				q.calc = def([meta.calc,0]);
				/*if (Number(meta.calc) == 1) {
					q.calc = true;
				} else {
					q.calc = false;
				}*/
				if (Number(meta.quizQ) == 1) {
					q.quizQ = true;
				} else {
					q.quizQ = false;
				}
				if (Number(meta.starterQ) == 1) {
					q.starterQ = true;
				} else {
					q.starterQ = false;
				}
				q.topics = [];
				var tt = draw[taskId].topicTagger;
				for (var i = 0; i < meta.topics.length; i++) {
					var obj = {};
					obj.stId = Number(meta.topics[i].objid);
					if (un(tt.topicmeta)) continue;
					for (var s = 0; s < tt.topicmeta.length; s++) {
						for (var t = 0; t < tt.topicmeta[s].length; t++) {
							for (var st = 0; st < tt.topicmeta[s][t].sub.length; st++) {
								if (Number(tt.topicmeta[s][t].sub[st].stId) == obj.stId) {
									obj.s = s;
									obj.t = t;
									obj.sId = s;
									obj.sText = ['Number','Algebra','Geometry','meta'][s];
									obj.tId = tt.topicmeta[s][t].tId;
									obj.tText = tt.topicmeta[s][t].text;
									obj.stText = tt.topicmeta[s][t].sub[st].text;
									st = tt.topicmeta[s][t].sub.length;
								}
							}
						}
					}
					q.topics.push(obj);
				}
				for (var i = 0; i < q.inputs.length; i++) {
					q.inputs[i].answers = [];
					q.inputs[i].pupilAnsData = [];
				}
				meta.answers.sort(function(a,b) {
					return (Number(b.frequency) - Number(a.frequency));
				});
				for (var a = 0; a < meta.answers.length; a++) {
					meta.answers[a].marks = Number(meta.answers[a].marks);
					meta.answers[a].part = Number(meta.answers[a].part);
					meta.answers[a].answerId = Number(meta.answers[a].answerId);
					meta.answers[a].frequency = Number(meta.answers[a].frequency);
					meta.answers[a].validated = Number(meta.answers[a].validated);
					if (meta.answers[a].feedback == "") {
						meta.answers[a].feedback = [""];
					} else {
						meta.answers[a].feedback = JSON.parse(meta.answers[a].feedback);
					}
					meta.answers[a].answer = replaceAll(meta.answers[a].answer,"\\","");
					meta.answers[a].answer = JSON.parse(meta.answers[a].answer);
					if (Number(meta.answers[a].marks) > 0) {
						q.inputs[meta.answers[a].part].answers.push(meta.answers[a]);
					}
					q.inputs[meta.answers[a].part].pupilAnsData.push(meta.answers[a]);
				}
				
				reviveObjectsInPaths(q.paths,false);
				
				if (typeof boxNum !== 'undefined') {
					qBox2QToBox(boxNum,qId);
				}
				if (!un(callback)) callback();
			} else {
				var paths = q.paths;
				for (var p = 0; p < paths.length; p++) {
					for (var o = 0; o < paths[p].obj.length; o++) {
						var obj = paths[p].obj[o];
						obj.mode = 'play';
						if (obj.type == 'input') {
							if (!un(obj.mathsInput.data)) delete obj.mathsInput.data;
							if (!un(obj.mathsInput.canvas) && !un(obj.mathsInput.canvas.data)) delete obj.mathsInput.canvas.data;
							if (!un(obj.mathsInput.cursorData)) delete obj.mathsInput.cursorData;
							if (!un(obj.mathsInput.cursorCanvas) && !un(obj.mathsInput.cursorCanvas.data)) delete obj.mathsInput.cursorCanvas.data;
							if (!un(obj.mathsInput.savedData)) {
								if (!un(obj.mathsInput.varSize)) obj.mathsInput.savedData[3] = obj.mathsInput.varSize.maxHeight;
								obj.mathsInput.savedCursorData = obj.mathsInput.savedData;
							} else if (!un(obj.mathsInput.rect)) {
								if (!un(obj.mathsInput.varSize)) obj.mathsInput.rect[3] = obj.mathsInput.varSize.maxHeight;
								obj.mathsInput.cursorRect = obj.mathsInput.rect;
							}
							obj.mathsInput.backColor = '#FFF';
							obj.mathsInput.border = true;
							obj.mathsInput.borderWidth = 6;
							obj.mathsInput.borderColor = '#000';
							obj.mathsInput.borderDash = [];
							delete obj.mathsInput.varSize;
							reviveMathsInput(obj.mathsInput,undefined,false);
							obj.mathsInput.cursorCanvas.style.pointerEvents = 'auto';
							obj.mathsInput.cursorData[106] = true;
							obj.mathsInput.selectable = false;
							setMathsInputTextToInitialTags(obj.mathsInput);
						} else if (obj.type == 'table') {
							for (var r = 0; r < obj.mInputs.length; r++) {
								for (var c = 0; c < obj.mInputs[r].length; c++) {
									reviveMathsInput(obj.mInputs[r][c],undefined,false);
								}
							}
						}
					}
				}
				qBox2PathsToSingleCanvas(qId,false,false,qPossMarksArray);
				if (!un(callback)) callback();
			}
		}
	}
}
function qBox2SortQuestionInputs(qId) {
	var q = draw[taskId].qBox2.q[qId];
	if (typeof q.inputs == 'undefined') {
		q.inputs = [];
		for (var p = 0; p < q.paths.length; p++) {
			for (var o = 0; o < q.paths[p].obj.length; o++) {
				var obj = q.paths[p].obj[o];
				if (['input','multChoice'].indexOf(obj.type) > -1) {
					for (var part = 0; part < draw[taskId].qBox2.q[qId].parts.length; part++) {
						var max = 591;
						if (part < q.parts.length - 1) max = q.parts[part+1];
						if (hitTestPathRect(q.paths[p],23-10,23+Number(q.parts[part])-10,570+20,max-(23+Number(q.parts[part]))+20) == true) {
							q.inputs[part] = obj;
							break;
						}
					}
				}
			}
		}
	}	
}
function qBox2PathsToSingleCanvas(qId,visible,forPdf,qPossMarksArray) {
	var q = draw[taskId].qBox2.q[qId];
	//console.log(qPossMarksArray);
	if (typeof q.canvas == 'undefined') {
		q.canvas = newcanvas({l:23,t:23,w:570,h:591,z:5,visible:boolean(visible,true)});
	} else {
		q.canvas.ctx.clearRect(0,0,570,591);
		if (typeof visible == 'boolean') {
			if (visible == true) {
				showObj(q.canvas);
			} else {
				hideObj(q.canvas);
			}
		}
	}
	if (boolean(forPdf,false) == true) {
		q.canvas.ctx.fillStyle = '#FFF';
		q.canvas.ctx.fillRect(0,0,570,591);
	}
	qBox2SortQuestionInputs(qId);
	for (var p = 0; p < q.paths.length; p++) {
		for (var o = 0; o < q.paths[p].obj.length; o++) {
			var obj = q.paths[p].obj[o];
			if (typeof obj.relLeft !== 'undefined') obj.left = obj.relLeft;
			if (typeof obj.relTop !== 'undefined') obj.top = obj.relTop;			
			switch (obj.type) {
				case 'text':
					obj.mathsInput.data = obj.mathsInput.savedData || obj.mathsInput.rect;
					for (var d = 0; d < 8; d++) obj.mathsInput.data[d+100] = obj.mathsInput.data[d];
					if (typeof obj.mathsInput.relLeft == 'undefined' && typeof obj.relLeft !== 'undefined') obj.mathsInput.relLeft = obj.relLeft;
					if (typeof obj.mathsInput.relTop == 'undefined' && typeof obj.relTop !== 'undefined') obj.mathsInput.relTop = obj.relTop;
					drawTextToCtx(q.canvas.ctx,obj.mathsInput);
					break;
				case 'input':
					obj.leftInput.data = obj.leftInput.savedData || obj.leftInput.rect;
					for (var d = 0; d < 8; d++) obj.leftInput.data[d+100] = obj.leftInput.data[d];
					drawTextToCtx(q.canvas.ctx,obj.leftInput);
					obj.rightInput.data = obj.rightInput.savedData || obj.rightInput.rect;
					for (var d = 0; d < 8; d++) obj.rightInput.data[d+100] = obj.rightInput.data[d];
					drawTextToCtx(q.canvas.ctx,obj.rightInput);
					break;
				case 'multChoice':
					drawPathMultChoice(q.canvas.ctx,obj,true);
					for (var m = 0; m < obj.rows*obj.cols; m++) {
						drawTextToCtx(q.canvas.ctx,obj.mInputs[m]);
					}
					break;
				case 'table':
					drawObjToCtx(q.canvas.ctx,q.paths[p],obj,1,2,0,0);				
					for (var r = 0; r < obj.mInputs.length; r++) {
						for (var c = 0; c < obj.mInputs[r].length; c++) {
							obj.mInputs[r][c].data = obj.mInputs[r][c].savedData || obj.mInputs[r][c].rect;
							for (var d = 0; d < 8; d++) obj.mInputs[r][c].data[d+100] = obj.mInputs[r][c].data[d];
							drawTextToCtx(q.canvas.ctx,obj.mInputs[r][c]);
						}
					}
					break;					
				default:
					drawObjToCtx(q.canvas.ctx,q.paths[p],obj,1,2,0,0);
			}
			
		}
	}
	
	if (un(q.partMarks)) q.partMarks = [];

	for (var p = 0; p < q.parts.length; p++) {
		var max = 591;
		if (p < q.parts.length-1) max = q.parts[p+1];	

		if (q.showMark[p] == 'tick') {
			q.canvas.ctx.lineWidth = 8;
			q.canvas.ctx.strokeStyle = '#060';
			q.canvas.ctx.lineJoin = 'round';
			q.canvas.ctx.lineCap = 'round';
			q.canvas.ctx.beginPath();
			var left = 570+q.markPos[p][0];
			var top = max+q.markPos[p][1];
			q.canvas.ctx.moveTo(left+4,top+0.5*50);
			q.canvas.ctx.lineTo(left+40/3,top+50-4);
			q.canvas.ctx.lineTo(left+40-4,top+4);
			//q.canvas.ctx.lineWidth = 2;
			//q.canvas.ctx.strokeRect(left,top,40,50);
			q.canvas.ctx.stroke();					
		} else if (q.showMark[p] == 'cross') {
			q.canvas.ctx.lineWidth = 8;
			q.canvas.ctx.strokeStyle = '#F00';
			q.canvas.ctx.lineJoin = 'round';
			q.canvas.ctx.lineCap = 'round';
			q.canvas.ctx.beginPath();
			var left = 570+q.markPos[p][0];
			var top = max+q.markPos[p][1];
			q.canvas.ctx.moveTo(left+4,top+4);
			q.canvas.ctx.lineTo(left+40-4,top+50-4);
			q.canvas.ctx.moveTo(left+40-4,top+4);
			q.canvas.ctx.lineTo(left+4,top+50-4);
			//q.canvas.ctx.lineWidth = 2;
			//q.canvas.ctx.strokeRect(left,top,40,50);
			q.canvas.ctx.stroke();					
		} else if (q.showMark[p] == 'tickcross') {
			q.canvas.ctx.lineWidth = 4;
			q.canvas.ctx.strokeStyle = '#090';
			q.canvas.ctx.lineJoin = 'round';
			q.canvas.ctx.lineCap = 'round';
			q.canvas.ctx.beginPath();
			var left = 570+q.markPos[p][0];
			var top = max+q.markPos[p][1];
			q.canvas.ctx.moveTo(left+2,top+0.5*30);
			q.canvas.ctx.lineTo(left+25/3,top+30-4);
			q.canvas.ctx.lineTo(left+25-2,top+2);	
			q.canvas.ctx.stroke();
			q.canvas.ctx.strokeStyle = '#F00';			
			left += 23;
			top += 27;
			q.canvas.ctx.beginPath();
			q.canvas.ctx.moveTo(left+2,top+2);
			q.canvas.ctx.lineTo(left+17-2,top+23-2);
			q.canvas.ctx.moveTo(left+17-2,top+2);
			q.canvas.ctx.lineTo(left+2,top+23-2);
			q.canvas.ctx.stroke();					
		}
		
		//if (un(q.partMarks[p])) q.partMarks[p] = qBox2InputGetMaxMarks(q.inputs[p]);
		if (un(q.partMarks[p])) q.partMarks[p] = qPossMarksArray[p];
		if (q.partMarks[p] == 0) continue;
		
		if (q.qState == 'marked' && q.showMark[p] !== 'none') {
			if (q.partMarks[p] == 1) {
				var txt = "<<bold:true>>"+String(q.marks[p])+" / 1 mark";
			} else {
				var txt = "<<bold:true>>"+String(q.marks[p])+" / "+String(q.partMarks[p])+" marks";
			}
		} else {
			if (q.partMarks[p] == 1) {
				var txt = "("+String(q.partMarks[p])+" mark)";
			} else {
				var txt = "("+String(q.partMarks[p])+" marks)";
			}
		}
		text({ctx:q.canvas.ctx,left:7.5,width:570-15,top:max-25,align:'right',textArray:["<<fontSize:20>>"+txt]});
	}

}
/*function drawTextToCtx(ctx,input) {
	console.log(ctx,input,input.data[100],input.data[101]);
	if (typeof input.relLeft !== 'undefined') {
		var l = input.relLeft+10;
	} else {
		var l = input.data[100] || input.data[0];
	}
	if (typeof input.relTop !== 'undefined') {
		var t = input.relTop;
	} else {
		var t = input.data[101] || input.data[1];
	}
	var leftPoint = l;
	var topPoint = t;	

	console.log(leftPoint,topPoint);
	
	if (typeof input.varSize == 'object') {
		/*if (input.textAlign == 'left') {
			leftPoint = l+input.varSize.padding
			if (typeof input.varSize.padding !== 'number') leftPoint = l+10;
		} else if (input.textAlign == 'center') {
			leftPoint = l;			
		} else if (input.textAlign == 'right') {
			leftPoint = l - input.varSize.padding;
			if (typeof input.varSize.padding !== 'number') leftPoint = l-10;
		}*//*
		var minTightWidth = input.varSize.minWidth || 50;
		var minTightHeight = input.varSize.minHeight || 50;
		var padding = input.varSize.padding || 0.01;
		var maxWidth = input.varSize.maxWidth-2*padding || input.data[102];
		var maxHeight = input.varSize.maxHeight || input.data[103];	
	} else {
		/*if (input.textAlign == 'left') {
			leftPoint = l+10;
		} else if (input.textAlign == 'center') {
			leftPoint = l;							
		} else if (input.textAlign == 'right') {
			
		}*//*
		var minTightWidth = 50;
		var minTightHeight = 50;
		var padding = 0.01;	
		var maxWidth = input.data[102];
		var maxHeight = input.data[103];		
	}
	
	if (input.border == true) {
		if (typeof input.varSize == 'object') {
			var border = {
				type:'tight',
				color:input.backColor,
				borderColor:input.borderColor,
				borderWidth:input.borderWidth,
				dash:input.borderDash,
				radius:input.borderRadius || input.radius || 0
			}
		} else {
			var radius = input.borderRadius || input.radius || 0;
			roundedRect(ctx,input.borderWidth/2,input.borderWidth/2,input.data[102]-input.borderWidth,input.data[103]-input.borderWidth,radius,input.borderWidth,input.borderColor,input.backColor,input.borderDash);
			var border = {type:'none'};
		}
	} else {
		var border = {type:'none'};
	}
	
	var drawText = text({
		context:ctx,
		textArray:input.richText,
		left:leftPoint,
		top:topPoint,
		width:maxWidth,
		height:maxHeight,
		allowSpaces:true,
		textAlign:input.textAlign,
		vertAlign:input.vertAlign,
		minTightWidth:minTightWidth,
		minTightHeight:minTightHeight,
		padding:padding,
		box:border
	});	
	
	
}*/
function drawTextToCtx(ctx,input) {
	if (typeof input.relLeft !== 'undefined') {
		var l = input.relLeft;
	} else {
		var l = input.data[100]-23;
	}
	if (typeof input.relTop !== 'undefined') {
		var t = input.relTop;
	} else {
		var t = input.data[101]-23;
	}
	var leftPoint = l;
	var topPoint = t;	

	if (typeof input.varSize == 'object') {
		if (input.textAlign == 'left') {
			leftPoint = l+input.varSize.padding
			if (typeof input.varSize.padding !== 'number') leftPoint = l+10;
		} else if (input.textAlign == 'center') {
			leftPoint = l;			
		} else if (input.textAlign == 'right') {
			leftPoint = l - input.varSize.padding;
			if (typeof input.varSize.padding !== 'number') leftPoint = l-10;
		}
		var minTightWidth = input.varSize.minWidth || 50;
		var minTightHeight = input.varSize.minHeight || 50;
		var padding = input.varSize.padding;
		var maxWidth = input.varSize.maxWidth-2*padding || input.data[102];
		var maxHeight = input.varSize.maxHeight || input.data[103];	
	} else {
		if (input.textAlign == 'left') {
			leftPoint = l+10;
		} else if (input.textAlign == 'center') {
			leftPoint = l;							
		} else if (input.textAlign == 'right') {
			
		}
		var minTightWidth = 50;
		var minTightHeight = 50;
		var padding = 0.01;	
		var maxWidth = input.data[102];
		var maxHeight = input.data[103];		
	}
	
	if (input.border == true) {
		if (typeof input.varSize == 'object') {
			var border = {
				type:'tight',
				color:input.backColor,
				borderColor:input.borderColor,
				borderWidth:input.borderWidth,
				dash:input.borderDash,
				radius:input.borderRadius || input.radius || 0
			}
		} else {
			var radius = input.borderRadius || input.radius || 0;
			roundedRect(ctx,input.borderWidth/2,input.borderWidth/2,input.data[102]-input.borderWidth,input.data[103]-input.borderWidth,radius,input.borderWidth,input.borderColor,input.backColor,input.borderDash);
			var border = {type:'none'};
		}
	} else {
		var border = {type:'none'};
	}
	
	var drawText = text({
		context:ctx,
		textArray:input.richText,
		left:leftPoint,
		top:topPoint,
		width:maxWidth,
		height:maxHeight,
		allowSpaces:true,
		textAlign:input.textAlign,
		vertAlign:input.vertAlign,
		minTightWidth:minTightWidth,
		minTightHeight:minTightHeight,
		padding:padding,
		box:border
	});	
}
function qBox2ClearBox (boxNum) {
	var box = draw[taskId].qBox2.box[boxNum];
	var qId = draw[taskId].qBox2.boxQ[boxNum];
	var path = draw[taskId].path;
	if (draw[taskId].qBox2.mode == 'edit') {	
		for (var i = path.length-1; i >= 0; i--) {
			if (hitTestPathRect(draw[taskId].path[i],box[0],box[1],box[2],box[3]) == true) {
				removePathObject(i);
			}
		}
	} else {
		if (typeof qId == 'number' && qId > -1) {
			var q = draw[taskId].qBox2.q[qId];
			if (typeof q.canvas !== 'undefined') hideObj(q.canvas);
			if (typeof q.inputs !== 'undefined') {
				for (var m = 0; m < q.inputs.length; m++) {
					if (typeof q.inputs[m] !== 'undefined' && q.inputs[m].type == 'input') {
						if (!un(q.inputs[m].mathsInput) && !un(q.inputs[m].mathsInput.data)) {
							hideMathsInput(q.inputs[m].mathsInput);
						}
					}
				}
			}
		}
	}
	draw[taskId].qBox2.boxQ[boxNum] = -1;
	draw[taskId].qBox2.textPath[boxNum] = [];
	draw[taskId].qBox2.parts[boxNum] = [];
	draw[taskId].qBox2.markPos[boxNum] = [];
	draw[taskId].qBox2.showMark[boxNum] = [];	
	drawCanvasPaths();
}
function qBox2QToBox(boxNum,qId) {
	if (typeof draw[taskId].qBox2.box[boxNum] == 'undefined') {
		addQBox2();
		boxNum = draw[taskId].qBox2.box.length-1;
	}
	qBox2ClearBox(boxNum);
	draw[taskId].qBox2.boxQ[boxNum] = qId;
	draw[taskId].qBox2.parts[boxNum] = draw[taskId].qBox2.q[qId].parts;
	draw[taskId].qBox2.markPos[boxNum] = draw[taskId].qBox2.q[qId].markPos;
	draw[taskId].qBox2.showMark[boxNum] = draw[taskId].qBox2.q[qId].showMark;

	if (draw[taskId].qBox2.mode == 'edit') {
		qBox2AdjustPathPositions(boxNum,qId);
		for (var p = 0; p < draw[taskId].qBox2.q[qId].paths.length; p++) {
			var path = draw[taskId].qBox2.q[qId].paths[p];
			path.qBox2QNum = qId;
			for (var o = 0; o < path.obj.length; o++) {
				if (path.obj[o].type == 'multChoice') {
					if (draw[taskId].qBox2.mode == 'edit') {
						path.obj[o].mode = 'edit';
					} else {
						path.obj[o].mode = 'play';
					}
					for (var i = 0; i < path.obj[o].mInputs.length; i++) {
						showMathsInput(path.obj[o].mInputs[i]);
					}
				}			
				if (path.obj[o].type == 'input') {
					var m = path.obj[o].mathsInput;
					var l = path.obj[o].leftInput;
					var r = path.obj[o].rightInput;
					showMathsInput(m);
					showMathsInput(l);
					showMathsInput(r);
					if (draw[taskId].qBox2.mode == 'edit') {
						path.obj[o].edit = true;
						//setMathsInputText(m,path.obj[o].ansRichText);
						//console.log(path.obj[o],m.richText,path.obj[o].ansRichText);
						//drawMathsInputText(m);
						m.cursorData[106] = false;
						m.cursorCanvas.style.pointerEvents = 'none';
					} else {
						path.obj[o].edit = false;
						if (boolean(m.disabled,false) == false) {
							m.cursorCanvas.style.pointerEvents = 'auto';
							m.selectable = false;
							m.textLoc = [];
							m.backColor = '#FFF';
							m.border = true;
							m.borderColor = '#000';
							m.borderWidth = 7;
							m.borderDash = [];
							m.fontSize = 30;
						}
						r.border = false;
						l.border = false;
						drawMathsInputText(l);
						drawMathsInputText(r);
						delete m.varSize;
						m.data = [path.obj[o].left,path.obj[o].top,path.obj[o].width,path.obj[o].height,true,false,true,1000];
						for (var i = 0; i < 8; i++) m.data[100+i] = m.data[i];
						m.canvas.data = [path.obj[o].left,path.obj[o].top,path.obj[o].width,path.obj[o].height,true,false,true,1000];
						for (var i = 0; i < 8; i++) m.canvas.data[100+i] = m.data[i];					
						resizeCanvas(m.canvas,m.data[0],m.data[1],m.data[2],m.data[3]);
						m.canvas.style.zIndex = 1000;
						m.canvas.width = m.data[2];
						m.canvas.height = m.data[3];
						m.cursorData = [path.obj[o].left,path.obj[o].top,path.obj[o].width,path.obj[o].height,true,false,true,1001];
						for (var i = 0; i < 8; i++) m.cursorData[100+i] = m.cursorData[i];
						m.cursorCanvas.data = [path.obj[o].left,path.obj[o].top,path.obj[o].width,path.obj[o].height,true,false,true,1001];
						for (var i = 0; i < 8; i++) m.cursorCanvas.data[100+i] = m.cursorData[i];					
						resizeCanvas(m.cursorCanvas,m.cursorData[0],m.cursorData[1],m.cursorData[2],m.cursorData[3]);
						m.cursorCanvas.style.zIndex = 1001;
						m.cursorCanvas.width = m.cursorData[2];
						m.cursorCanvas.height = m.cursorData[3];
						drawMathsInputText(m);
					}
				}
				if (['text'].indexOf(path.obj[o].type) > -1) {
					if (typeof path.qBox2Part == 'number') {
						draw[taskId].qBox2.textPath[boxNum][path.qBox2Part] = path;
					}
					showMathsInput(path.obj[o].mathsInput);
				}
				if (['button'].indexOf(path.obj[o].type) > -1) {
					showMathsInput(path.obj[o].mathsInput);
				}
				if (['table'].indexOf(path.obj[o].type) > -1 && typeof path.obj[0].mInputs !== 'undefined') {
					for (var r = 0; r < path.obj[0].mInputs.length; r++) {
						for (var c = 0; c < path.obj[0].mInputs[r].length; c++) {
							showMathsInput(path.obj[o].mInputs[r][c]);
						}
					}
				}				
			}
		}
		draw[taskId].path = draw[taskId].path.concat(draw[taskId].qBox2.q[qId].paths);
		
		if (typeof draw[taskId].q2ObjectiveInput !== 'undefined' && typeof draw[taskId].allQsData !== 'undefined') {
			var qIndex = draw[taskId].allQs.indexOf(qId);
			setMathsInputText(draw[taskId].q2ObjectiveInput,draw[taskId].allQsData[qIndex].objective);
		}
		
		for (var i = 0; i < draw[taskId].path.length; i++) {
			updateBorder(draw[taskId].path[i]);
			if (pathCanvasMode) {
				pathCanvasDraw(draw[taskId].path[i]);
			}
		}
		if (pathCanvasMode) {
				
		} else {
			drawCanvasPaths();
		}
		for (var b = 0; b < draw[taskId].buttons.length; b++) {
			if (draw[taskId].buttons[b].type == 'qBox2Num') {
				draw[taskId].buttons[b].draw();
				break;
			}
		}

		if (draw[taskId].qBox2.metaMode == 'ansData' && typeof draw[taskId].qBox2.ansDataCanvas !== 'undefined') {
			draw[taskId].qBox2.ansDataPart = 0;
			draw[taskId].qBox2.ansDataCanvas.draw();
		} else if (draw[taskId].qBox2.metaMode == 'meta') {
			draw[taskId].redrawMeta();
		}
	} else {
		var q = draw[taskId].qBox2.q[qId];
		//console.log(qId,q);
		var sf = draw[taskId].qBox2.boxScale[boxNum];
		var l = draw[taskId].qBox2.box[boxNum][0];
		var t = draw[taskId].qBox2.box[boxNum][1];
		var w = draw[taskId].qBox2.box[boxNum][2];
		var h = draw[taskId].qBox2.box[boxNum][3];
		q.canvas.data[100] = l;
		q.canvas.data[101] = t;
		q.canvas.data[102] = w * sf;
		q.canvas.data[103] = h * sf;
		resizeCanvas(q.canvas,q.canvas.data[100],q.canvas.data[101],q.canvas.data[102],q.canvas.data[103]);
		showObj(q.canvas);
		if (typeof q.inputs !== 'undefined') {
			for (var m = 0; m < q.inputs.length; m++) {
				if (typeof q.inputs[m] !== 'undefined' && q.inputs[m].type == 'input') {
					moveMathsInput(q.inputs[m].mathsInput,l+q.inputs[m].relLeft*sf,t+q.inputs[m].relTop*sf);
					if (sf !== 1) {
						resizeCanvas(q.inputs[m].mathsInput.canvas,q.inputs[m].mathsInput.data[100],q.inputs[m].mathsInput.data[101],q.inputs[m].mathsInput.data[102]*sf,q.inputs[m].mathsInput.data[103]*sf);
					}
					if (!un(q.inputs[m].mathsInput) && !un(q.inputs[m].mathsInput.data)) {
						showMathsInput(q.inputs[m].mathsInput);
					}		
				}
			}
		}
		
	}	
}
function qBox2AdjustPathPositions(boxNum,qId) {
	var l = draw[taskId].qBox2.box[boxNum][0];
	var t = draw[taskId].qBox2.box[boxNum][1];
	var paths = draw[taskId].qBox2.q[qId].paths;
	for (var p = 0; p < paths.length; p++) {
		var maxO = paths[p].obj.length;
		for (var o = 0; o < maxO; o++) {
			var obj = paths[p].obj[o];
			//console.log(obj);
			if (typeof obj.relLeft !== 'undefined') obj.left = l+obj.relLeft;
			if (typeof obj.relTop !== 'undefined') obj.top = t+obj.relTop;
			if (typeof obj.relCenter !== 'undefined') obj.center = [l+obj.relCenter[0],t+obj.relCenter[1]];
			if (typeof obj.relStartPos !== 'undefined') obj.startPos = [l+obj.relStartPos[0],t+obj.relStartPos[1]];
			if (typeof obj.relFinPos !== 'undefined') obj.finPos = [l+obj.relFinPos[0],t+obj.relFinPos[1]];
			if (typeof obj.relControlPos !== 'undefined') obj.controlPos = [l+obj.relControlPos[0],t+obj.relControlPos[1]];
			if (typeof obj.relControlPos1 !== 'undefined') obj.controlPos1 = [l+obj.relControlPos1[0],t+obj.relControlPos1[1]];
			if (typeof obj.relControlPos2 !== 'undefined') obj.controlPos2 = [l+obj.relControlPos2[0],t+obj.relControlPos2[1]];
			if (typeof obj.relA !== 'undefined') obj.a = [l+obj.relA[0],t+obj.relA[1]];
			if (typeof obj.relB !== 'undefined') obj.b = [l+obj.relB[0],t+obj.relB[1]];
			if (typeof obj.relC !== 'undefined') obj.c = [l+obj.relC[0],t+obj.relC[1]];
			if (typeof obj.relPos !== 'undefined') {
				obj.pos = [];
				for (var a = 0; a < obj.relPos.length; a++) {
					obj.pos[a] = [l+obj.relPos[a][0],t+obj.relPos[a][1]];
				}
			}
			if (typeof obj.relPoints !== 'undefined') {
				obj.points = [];
				for (var a = 0; a < obj.relPoints.length; a++) {
					obj.points[a] = [l+obj.relPoints[a][0],t+obj.relPoints[a][1]];
				}
			}
			if (typeof obj.mathsInput !== 'undefined') {
				moveMathsInput(obj.mathsInput,l+obj.mathsInput.relLeft,t+obj.mathsInput.relTop);
			}
			if (typeof obj.leftInput !== 'undefined') {
				moveMathsInput(obj.leftInput,l+obj.leftInput.relLeft,t+obj.leftInput.relTop);
			}
			if (typeof obj.rightInput !== 'undefined') {
				moveMathsInput(obj.rightInput,l+obj.rightInput.relLeft,t+obj.rightInput.relTop);
			}
			if (typeof obj.mInputs !== 'undefined') {
				if (obj.type == 'table') {
					for (var r = 0; r < obj.mInputs.length; r++) {
						for (var c = 0; c < obj.mInputs[r].length; c++) {
							moveMathsInput(obj.mInputs[r][c],l+obj.mInputs[r][c].relLeft,t+obj.mInputs[r][c].relTop);
							setMathsInputZIndex(obj.mInputs[r][c],1000);							
						}
					}
				} else {
					for (var m = 0; m < obj.mInputs.length; m++) {
						moveMathsInput(obj.mInputs[m],l+obj.mInputs[m].relLeft,t+obj.mInputs[m].relTop);
						setMathsInputZIndex(obj.mInputs[m],1000);	
					}
				}
			}
		}
	}
	
}

function qBox2CheckAns(boxNum) {
	var qId = draw[taskId].qBox2.boxQ[boxNum];
	var box = draw[taskId].qBox2.box[boxNum];
	var q = draw[taskId].qBox2.q[qId];
	var inputs = q.inputs;
	q.answers = [];
	q.marks = [];
	for (var i = 0; i < inputs.length; i++) {
		var obj = inputs[i];
		if (obj.type == 'input') {
			q.marks[i] = qBox2InputCheck(obj);
			if (q.marks[i] == qBox2InputGetMaxMarks(obj)) {
				draw[taskId].qBox2.showMark[boxNum][i] = 'tick';
			} else if (q.marks[i] == 0) {
				draw[taskId].qBox2.showMark[boxNum][i] = 'cross';
			} else {
				draw[taskId].qBox2.showMark[boxNum][i] = 'tickcross';
			}
			q.answers[i] = clone(obj.mathsInput.text);
			obj.mathsInput.cursorCanvas.style.pointerEvents = 'none';
			obj.mathsInput.backColor = '#DDD';
			obj.mathsInput.disabled = true;
			drawMathsInputText(obj.mathsInput);			
		} else if (obj.type = 'multChoice') {
			if (obj.correctCell == obj.selectedCell) {
				draw[taskId].qBox2.showMark[boxNum][i] = 'tick';							
				q.marks[i] = 1;
			} else {
				draw[taskId].qBox2.showMark[boxNum][i] = 'cross';							
				q.marks[i] = 0;
			}
			q.answers[i] = obj.selectedCell;						
			obj.pointerEvents = false;			
		}
	}
	q.qState = 'marked';
	qBox2PathsToSingleCanvas(qId,true);
	calcCursorPositions();
	drawCanvasPaths();
	drawSelectCanvas();
	return q.marks;
}
function qBox2CheckAns2(qId,visible,showMarks) {
	if (un(draw[taskId].qBox2.q[qId])) return;
	var q = draw[taskId].qBox2.q[qId];
	var inputs = q.inputs;
	q.answers = [];
	q.marks = [];
	for (var i = 0; i < inputs.length; i++) {
		var obj = inputs[i];
		if (obj.type == 'input') {
			q.marks[i] = qBox2InputCheck(obj);
			if (boolean(showMarks,true) == true) {
				if (q.marks[i] == qBox2InputGetMaxMarks(obj)) {
					q.showMark[i] = 'tick';
				} else if (q.marks[i] == 0) {
					q.showMark[i] = 'cross';
				} else {
					q.showMark[i] = 'tickcross';
				}
			}
			q.answers[i] = clone(obj.mathsInput.text);
			obj.mathsInput.cursorCanvas.style.pointerEvents = 'none';
			obj.mathsInput.backColor = '#DDD';
			obj.mathsInput.disabled = true;
			drawMathsInputText(obj.mathsInput);			
		} else if (obj.type = 'multChoice') {
			if (obj.correctCell == obj.selectedCell) {
				q.marks[i] = 1;
			} else {
				q.marks[i] = 0;
			}
			if (boolean(showMarks,true) == true) {
				if (obj.correctCell == obj.selectedCell) {
					q.showMark[i] = 'tick';							
				} else {
					q.showMark[i] = 'cross';							
				}
			}			
			q.answers[i] = obj.selectedCell;						
			obj.pointerEvents = false;			
		}
	}
	q.qState = 'marked';
	qBox2PathsToSingleCanvas(qId,visible);
	return q.marks;
}
function qBox2InputGetMaxMarks(obj) { // obsolete / returns wrong value?
	if (un(obj)) return 0;
	if (un(obj.ans)) return 1;
	var max = 1;
	for (var a = 0; a < obj.ans.length; a++) {
		max = Math.max(max,obj.ans[a].marks);
	}
	return max;
}
function qBox2InputCheck(obj) { // checks an input and returns the number of marks scored
	if (!un(obj.ans)) {
		for (var a = 0; a < obj.ans.length; a++) {
			var ans = obj.ans[a];
			if (ans.oe) {
				
			} else if (ans.awrt) {
				
			} else if (ans.range) {
				
			} else { // check if text matches ans exactly
				//console.log(JSON.stringify(obj.mathsInput.text),JSON.stringify(ans.text),arraysEqual(obj.mathsInput.text,ans.text));
				//console.log(obj.mathsInput.stringJS,ans.stringJS,obj.mathsInput.stringJS == ans.stringJS);
				// this is probably not entirely robust
				if (obj.mathsInput.stringJS == "") return 0;
				if (JSON.stringify(obj.mathsInput.text) == JSON.stringify(ans.text) || obj.mathsInput.stringJS == ans.stringJS) {
					return ans.marks;
				}
			}
		}
		return 0;
	} else if (arraysEqual(obj.mathsInput.text,obj.ansText) == true) { // old style
		return 1;
	} else {
		return 0;
	}
}
function qBox2UncheckAns(qId,clear,partsToUncheck) {
	//var qId = draw[taskId].qBox2.boxQ[boxNum];
	//var box = draw[taskId].qBox2.box[boxNum];
	var boxNum = draw[taskId].qBox2.boxQ.indexOf(qId);
	var q = draw[taskId].qBox2.q[qId];
	if (un(partsToUncheck)) {
		partsToUncheck = [];
		for (var p = 0; p < q.parts.length; p++) {
			partsToUncheck.push(p);
		}
	}
	var inputs = q.inputs;	
	if (un(q.answers)) q.answers = [];
	if (un(q.correct)) q.correct = [];
	if (un(q.marks)) q.marks = [];
	//console.log(inputs,typeof inputs);
	if (typeof inputs !== 'undefined') {
		for (var i = 0; i < inputs.length; i++) {
			if (partsToUncheck.indexOf(i) == -1) continue;
			var obj = inputs[i];
			draw[taskId].qBox2.q[qId].showMark[i] = 'none';
			q.correct[i] = 0;
			q.marks[i] = 0;
			
			if (obj.type == 'input') {
				// enable the input
				obj.mathsInput.cursorCanvas.style.pointerEvents = 'auto';
				obj.mathsInput.backColor = '#FFF';
				obj.mathsInput.disabled = false;
				if (boolean(clear,false) == true) {
					setMathsInputText(obj.mathsInput,[""]);
				} else {
					drawMathsInputText(obj.mathsInput);
				}
			} else if (obj.type = 'multChoice') {
				if (boolean(clear,false) == true) obj.selectedCell = -1;
				obj.pointerEvents = true;
			}
		}
	}
	qBox2PathsToSingleCanvas(qId,true);
	calcCursorPositions();
	drawCanvasPaths();
	drawSelectCanvas();
}

function qBox2LogAnsData2(qId,pupilId,testId,classId) { // for test mode
	if (typeof pupilId !== 'number') return;
	var qBox2 = draw[taskId].qBox2;
	var q = qBox2.q[qId];
	var answers = JSON.stringify(q.answers);
	var marks = JSON.stringify(q.marks);
	
	//console.log(qId,testId,inputTypes,answers,marks,pen);

	var params = 'pupilId='+encodeURIComponent(pupilId)+'&qId='+encodeURIComponent(qId)+'&testId='+encodeURIComponent(testId)+'&answers='+encodeURIComponent(answers)+'&marks='+encodeURIComponent(marks)+'&classId='+encodeURIComponent(classId);
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("post", "saveQ2AnsData.php", true);
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.onload = function() {
		//console.log(this.responseText);
	}
	xmlHttp.send(params);
}
/*function qBox2LoadAnsData(qId,pupilId,boxNum) {
	if (typeof pupilId !== 'number') return;
	
	var params = 'pupilId='+encodeURIComponent(pupilId)+'&qId='+encodeURIComponent(qId);
	
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("post", "loadQ2AnsData.php", true);
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.onload = function() {
		var ans = JSON.parse(this.responseText);
		for (var i = 0; i < ans.length; i++) {
			ans[i].answer = JSON.parse(ans[i].answer);
			ans[i].marks = JSON.parse(ans[i].marks);
			ans[i].pen = JSON.parse(ans[i].pen);
		}
		//console.log(ans);
		draw[taskId].qBox2.ansData = [];
		var ansData = draw[taskId].qBox2.ansData;
		if (typeof ansData[qId] == 'undefined') ansData[qId] = [];
		if (typeof ansData[qId][pupilId] == 'undefined') ansData[qId][pupilId] = [];
		ansData[qId][pupilId] = ansData[qId][pupilId].concat(ans);
		
		if (typeof boxNum !== 'undefined') {
			qBox2AnsDataToBox(boxNum,qId,pupilId);
		}
	}
	xmlHttp.send(params);
}
function qBox2AnsDataToBox (boxNum,qId,pupilId,ansNum) {
	var ansData = draw[taskId].qBox2.ansData[qId][pupilId];
	if (typeof ansNum !== 'number') ansNum = ansData.length - 1;
	var a = ansData[ansNum];
	var q = draw[taskId].qBox2.q[qId];
	if (typeof q.correct == 'undefined') q.correct = [];
	if (typeof q.marks == 'undefined') q.marks = [];
	var parts = q.parts;
	var box = draw[taskId].qBox2.box[boxNum];
	draw[taskId].qBox2.penPaths[qId] = clone(a.pen);
	qBox2QToBox(boxNum,qId);
	loadPenPaths(boxNum);
	
	for (var p = 0; p < q.paths.length; p++) {
		for (var o = 0; o < q.paths[p].obj.length; o++) {
			if (q.paths[p].obj[o].type == 'input') {
				var obj = q.paths[p].obj[o];
				for (var pa = 0; pa < parts.length; pa++) {
					var max = 591;
					if (pa < parts.length - 1) max = parts[pa+1];
					if (hitTestPathRect(q.paths[p],box[0],box[1]+parts[pa],box[2],max-parts[pa]) == true && q.inputTypes[pa] == 'input') {
						setMathsInputText(a.answer);
						q.correct[pa] = a.marks;
						q.marks[pa] = a.marks;
					}						
				}
			}
			if (q.paths[p].obj[o].type == 'multChoice') {
				var obj = q.paths[p].obj[o];
				for (var pa = 0; pa < parts.length; pa++) {
					var max = 591;
					if (pa < parts.length - 1) max = parts[pa+1];
					if (hitTestPathRect(q.paths[p],box[0],box[1]+parts[pa],box[2],max-parts[pa]) == true && q.inputTypes[pa] == 'multChoice') {
						obj.selectedCell = a.answer;
						q.correct[pa] = a.marks;
						q.marks[pa] = a.marks;
					}
				}
			}			
		}
	}
	
	drawCanvasPaths();	
}*/
function qBox2DrawPenPaths(boxNum,isDrawing) {
	if (typeof boxNum == 'undefined') boxNum = 0; 
	var drawing = boolean(isDrawing,false);
	var path = draw[taskId].qBox2.penPaths[boxNum];
	var ctx2 = draw[taskId].qBox2.penctx[boxNum][1];
	if (drawing == false) {
		var ctx1 = draw[taskId].qBox2.penctx[boxNum][0];
		ctx1.clear();
		ctx2.clear();
		// reduce to a single path
		while (path.length > 1) {
			while (path[1].obj.length > 0) {
				path[0].obj.push(path[1].obj[0]);
				path[1].obj.splice(0,1);
			}
			path.splice(1,1);
		}
		if (typeof path[0] !== 'undefined' && typeof path[0].obj !== 'undefined') {
			for (var o = 0; o < path[0].obj.length; o++) {
				if (path[0].obj[o].pos.length == 1) {
					path[0].obj.splice(o,1);
					o--;
				} else {
					drawPathPen(ctx1,path[0].obj[o]);
				}
			}
		}
	} else {
		ctx2.clear();
		drawPathPen(ctx2,path[path.length-1].obj[0]);
	}
}
function qBox2ClearPenPaths(boxNum) {
	if (typeof boxNum == 'undefined') boxNum = 0; 
	draw[taskId].qBox2.penctx[boxNum][0].clear();	
	draw[taskId].qBox2.penctx[boxNum][1].clear();
}

function qBox2Pdf(qIds,orientation,rows,cols) {
	// check all questions are loaded
	for (var q = 0; q < qIds.length; q++) {
		var qId = qIds[q];
		if (typeof draw[taskId].qBox2.q[qId] == 'undefined') {
			loadQ2(qId,undefined,q+1);
			waitForQuestionLoad = setInterval(function() {
				if (typeof draw[taskId].qBox2.q[qId] == 'undefined') return;
				clearInterval(waitForQuestionLoad);
				qBox2Pdf(qIds,orientation,rows,cols);
			},50);
			return;
		}
	}
	
	console.log(draw[taskId].qBox2.q);
	
	if (orientation == 'p') orientation = 'portrait';
	if (orientation == 'l') orientation = 'landscape';
	var pdf1 = new jsPDF(orientation);
	if (orientation == 'landscape') {
		var page = {w:297,h:210};
	} else {
		var page = {w:210,h:297};
	}

	if (typeof cols !== 'number') cols = 4;
	if (typeof rows !== 'number') rows = 3;
	var outerMargin = [5,10,5,10]; // left,top,right,bottom
	var innerMargin = 5;
		
	var cw = (page.w-outerMargin[0]-outerMargin[2]-(cols-1)*innerMargin)/cols; // container width
	var ch = (page.h-outerMargin[1]-outerMargin[3]-(rows-1)*innerMargin)/rows;
	var cr = cw / ch; // container ratio
	var qr = 570 / 591; // question ratio
	
	for (var q2 = 0; q2 < qIds.length; q2++) {
		var pagePos = q2%(rows*cols);
		var cl = outerMargin[0] + (cw + innerMargin) * (pagePos%cols);
		var ct = outerMargin[1] + (ch + innerMargin) * Math.floor(pagePos/cols);
				
		if (cr < qr) {
			var qw = cw;
			var qh = qw / qr;
			var ql = cl;
			var qt = ct + (ch - qh)/2;
		} else {
			var qh = ch;
			var qw = qh * qr;
			var qt = ct;
			var ql = cl + (cw - qw)/2;
		}
				
		if (pagePos == 0 && q2 > 0) {
			for (var c = 1; c < cols; c++) {
				pdf1.line(outerMargin[0]+(page.w-outerMargin[2]-outerMargin[0])*(c/cols),outerMargin[1],outerMargin[0]+(page.w-outerMargin[2]-outerMargin[0])*(c/cols),page.h-outerMargin[3]);
			}
			for (var r = 1; r < rows; r++) {
		pdf1.line(outerMargin[0],outerMargin[1]+(page.h-outerMargin[1]-outerMargin[3])*(r/rows),page.w-outerMargin[2],outerMargin[1]+(page.h-outerMargin[1]-outerMargin[3])*(r/rows));
			}
			pdf1.addPage('a4','landscape');
		}
			
		var qId = qIds[q2];
		console.log(qId);
		qBox2UncheckAns(qId,true);
		
		var canvas = draw[taskId].qBox2.q[qId].canvas;
		var ctx = canvas.ctx;
		qBox2PathsToSingleCanvas(qId,false,true);
		
		for (var i = 0; i < draw[taskId].qBox2.q[qId].inputs.length; i++) {
			if (draw[taskId].qBox2.q[qId].inputs[i].type == 'input') {
				flattenCanvases(canvas,draw[taskId].qBox2.q[qId].inputs[i].mathsInput.canvas,draw[taskId].qBox2.q[qId].inputs[i].relLeft,draw[taskId].qBox2.q[qId].inputs[i].relTop);
			}
		}

		changeColor(ctx,255,255,204,255,255,255);
		pdf1.addImage(canvas.toDataURL("image/jpeg"),'JPEG',ql,qt,qw,qh);
	}

	for (var c = 1; c < cols; c++) {
		pdf1.line(outerMargin[0]+(page.w-outerMargin[2]-outerMargin[0])*(c/cols),outerMargin[1],outerMargin[0]+(page.w-outerMargin[2]-outerMargin[0])*(c/cols),page.h-outerMargin[3]);
	}
	for (var r = 1; r < rows; r++) {
		pdf1.line(outerMargin[0],outerMargin[1]+(page.h-outerMargin[1]-outerMargin[3])*(r/rows),page.w-outerMargin[2],outerMargin[1]+(page.h-outerMargin[1]-outerMargin[3])*(r/rows));
	}	
	
	pdf1.save();

	function changeColor(ctx,oldRed,oldGreen,oldBlue,newRed,newGreen,newBlue) {
		var imageData = ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height);
		// examine every pixel, 
		// change any old rgb to the new-rgb
		for (var i = 0; i < imageData.data.length; i += 4) {
			  // is this pixel the old rgb?
			if (imageData.data[i]==oldRed && imageData.data[i+1]==oldGreen && imageData.data[i+2]==oldBlue) {
				// change to your new rgb
				imageData.data[i]=newRed;
				imageData.data[i+1]=newGreen;
				imageData.data[i+2]=newBlue;
			}
		}
		ctx.putImageData(imageData,0,0);
	}	
}

function drawClickQBox2InputAnsMinus() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	qBox2InputSaveAnsNum(obj);
	if (obj.ansNum > 0) {
		obj.ansNum--;
		qBox2InputShowAnsNum(obj);	
	}
}
function drawClickQBox2InputAnsPlus() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	qBox2InputSaveAnsNum(obj);
	obj.ansNum++;
	if (un(obj.answers[obj.ansNum])) obj.answers[obj.ansNum] = {answer:[""],marks:1,oe:false,awrt:false,range:false};
	qBox2InputShowAnsNum(obj);
}
function drawClickQBox2InputAnsDelete() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (obj.answers.length == 1) return;
	obj.answers.splice(obj.ansNum,1);
	obj.ansNum = Math.max(0,obj.ansNum-1);
	qBox2InputShowAnsNum(obj)
}
function qBox2InputSaveAnsNum(obj) { // nb. this saves within js, not to the db - that's done by saveQ2()
	if (un(obj.answers)) {
		obj.answers = [{marks:1,oe:false,awrt:false,range:false}];
		obj.ansNum = 0;
	}
	if (!un(obj.answers[obj.ansNum])) obj.answers[obj.ansNum].answer = clone(obj.mathsInput.text);
}
function qBox2InputShowAnsNum(obj) {
	var a = obj.ansNum;
	var richText = clone(obj.answers[a].answer);
	if (boolean(obj.mathsInput.algebra,false) == true) {
		richText.unshift('<<font:algebra>>');
		richText = combineSpacesTextArray(richText);
	}
	setMathsInputText(obj.mathsInput,richText);
	drawCanvasPaths();
}
function drawClickQBox2InputMarksMinus() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (un(obj.ans)) {
		obj.ans = [{marks:1,oe:false,awrt:false,range:false}];
		obj.ansNum = 0;
	}
	var ans = obj.ans[obj.ansNum];
	if (ans.marks > 1) {
		ans.marks--;
		drawCanvasPaths();
	}
}
function drawClickQBox2InputMarksPlus() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (un(obj.ans)) {
		obj.ans = [{marks:1,oe:false,awrt:false,range:false}];
		obj.ansNum = 0;
	}
	var ans = obj.ans[obj.ansNum];
	ans.marks++;
	drawCanvasPaths();	
}
function drawClickQBox2InputOE() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (un(obj.ans)) {
		obj.ans = [{marks:1,oe:false,awrt:false,range:false}];
		obj.ansNum = 0;
	}
	if (obj.ans[obj.ansNum].oe == true) {
		obj.ans[obj.ansNum].oe = false;
	} else {
		obj.ans[obj.ansNum].oe = true;
		obj.ans[obj.ansNum].awrt = false;
		obj.ans[obj.ansNum].range = false;		
	}
	drawCanvasPaths();
}
function drawClickQBox2InputAWRT() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (un(obj.ans)) {
		obj.ans = [{marks:1,oe:false,awrt:false,range:false}];
		obj.ansNum = 0;
	}
	if (obj.ans[obj.ansNum].awrt == true) {
		obj.ans[obj.ansNum].awrt = false;
	} else {
		obj.ans[obj.ansNum].awrt = true;
		obj.ans[obj.ansNum].oe = false;
		obj.ans[obj.ansNum].range = false;		
	}
	drawCanvasPaths();	
}
function drawClickQBox2InputRange() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (un(obj.ans)) {
		obj.ans = [{marks:1,oe:false,awrt:false,range:false}];
		obj.ansNum = 0;
	}
	if (obj.ans[obj.ansNum].range == true) {
		obj.ans[obj.ansNum].range = false;
	} else {
		obj.ans[obj.ansNum].range = true;
		obj.ans[obj.ansNum].oe = false;
		obj.ans[obj.ansNum].awrt = false;		
	}
	drawCanvasPaths();	
}
function drawClickQBox2InputAlg() {
	var pathNum = draw[taskId].currCursor.pathNum;
	var obj = draw[taskId].path[pathNum].obj[0];
	if (typeof obj.mathsInput.algebra == 'undefined') {
		obj.mathsInput.algebra = true;
		var newFont = 'algebra';
	} else {
		obj.mathsInput.algebra = !obj.mathsInput.algebra;
		if (obj.mathsInput.algebra == true) {
			var newFont = 'algebra';
		} else {
			var newFont = 'Arial';
		}		
	}
	setMathsInputFont(obj.mathsInput,newFont);	
	drawCanvasPaths();
}

function qBox2GetPartYMinMax(box,partNum) {
	var min = 0;
	var max = 591;
	if (partNum > 0) min = draw[taskId].qBox2.parts[partNum-1];
	if (partNum < draw[taskId].qBox2.parts.length-1) max = draw[taskId].qBox2.parts[partNum+1];
	return {min:min,max:max};
}


/***************************/
/*					  	   */
/*     		qBox		   */
/*				  	  	   */
/***************************/

function addQBox() {
	var i = draw[taskId].qBox.length;
	draw[taskId].qBox[i] = 'edit';
	draw[taskId].qSize[i] = [25,25,540,650];
	draw[taskId].snap = false;
	draw[taskId].gridSnap = false;
	qBoxRefresh();
}
function qBoxRefresh() {
	if (draw[taskId].qBox.length == 0) return;
	console.log('qBoxRefresh',arguments.callee.caller.name)
	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].qBoxState !== 'static') {
			draw[taskId].path[i].qBox = -1;
		}
	}
	for (var q = 0; q < draw[taskId].qBox.length; q++) {
		if (draw[taskId].qBox[q] == null) continue;
		//console.log('q:',q);
		var l = draw[taskId].qSize[q][0];
		var t = draw[taskId].qSize[q][1];
		var w = draw[taskId].qSize[q][2];
		var h = draw[taskId].qSize[q][3];
		//console.log(l,t,w,h);
		var heightAuto = 0;
		var heightBottom = 0;
		var maxPathWidth = 50;
		for (var i = 0; i < draw[taskId].path.length; i++) {
			var path = draw[taskId].path[i];
			if (path.qBoxState !== 'static' && hitTestTwoRects(draw[taskId].qSize[q],path.border) == true) {
				path.qBox = q;
				path.qBoxState = draw[taskId].qBox[q];
			}
			if (typeof path.qPos == 'undefined') {
				path.qPos = 'auto';
			}	
			if (path.qBox == q) {
				//console.log('path:',i,path);
				if (path.obj.length == 1 && path.obj[0].type == 'text') {
					var obj = path.obj[0];
					var mInput = obj.mathsInput;
					if (typeof path.qFillWidth == 'undefined') path.qFillWidth = true;
					if (path.qFillWidth == true) {
						path.qMinWidth = mInput.totalTextWidth+12;					
					} else {
						path.qMinWidth = path.border[2];
					}
					var pos = qBoxRepositionPath(q,path);
					var dx = pos[0] - path.border[0];
					var dy = pos[1] - path.border[1];
					var dw = pos[2] - path.border[2];
					//console.log(path.border,pos);
					repositionPath(path,dx,dy,dw,0);
					if (typeof path.qSetHeight !== 'undefined') {
						obj.height = path.qSetHeight;
					} else {
						obj.height = mInput.tightRect[3];
					}
					
					resizeCanvas(mInput.canvas,mInput.data[100]+mInput.tightRect[0],mInput.data[101]+mInput.tightRect[1],obj.width,obj.fullHeight);
					resizeCanvas(mInput.cursorCanvas,mInput.data[100]+mInput.tightRect[0],mInput.data[101]+mInput.tightRect[1],mInput.tightRect[2],mInput.tightRect[3]);
					currMathsInput = obj.mathsInput;
					mathsInputMapCursorPos();
					maxPathWidth = Math.max(maxPathWidth,mInput.maxWordWidth+2*draw[taskId].selectPadding);
				} else {
					path.qMinWidth = path.border[2];
					path.qFillWidth = false;			
					var pos = qBoxRepositionPath(q,path);
					var dx = pos[0] - path.border[0];
					var dy = pos[1] - path.border[1];
					repositionPath(path,dx,dy,0,0);
					maxPathWidth = Math.max(maxPathWidth,pos[2]); 
				}
				if (path.qPos == 'auto' || path.qPos == 'bottomRight') {
					heightAuto = Math.max(heightAuto,path.border[5]-draw[taskId].qSize[q][1]);
				} else if (path.qPos == 'bottomRight') {
					heightBottom = Math.max(heightBottom,path.border[3]);
				}
			}
		}
		draw[taskId].qMinWidth[q] = maxPathWidth;
		draw[taskId].qSize[q][2] = Math.max(50,draw[taskId].qMinWidth[q],draw[taskId].qSize[q][2]);
		draw[taskId].qMinHeight[q] = heightAuto + heightBottom;
		draw[taskId].qSize[q][3] = Math.max(draw[taskId].qSize[q][3],draw[taskId].qMinHeight[q]);
	}
	for (var i = 0; i < draw[taskId].path.length; i++) {	
		updateBorder(draw[taskId].path[i]);
	}
	calcCursorPositions();
	drawCanvasPaths();
}
function qBoxRepositionPath(qNum,path) {
	var minWidth = path.qMinWidth;
	var fillWidth = path.qFillWidth || false;
	if (fillWidth == false && typeof path.qSetWidth !== 'undefined') minWidth = path.qSetWidth;
	var position = path.qPos || 'auto';

	var maxWidth = draw[taskId].qSize[qNum][2];
	var x = draw[taskId].qSize[qNum][0];
	var y = draw[taskId].qSize[qNum][1];
	var w = minWidth;
	var paths = draw[taskId].path;
	var pathNum = paths.indexOf(path);

	if (position == 'bottomRight') {
		y = draw[taskId].qSize[qNum][1] + draw[taskId].qSize[qNum][3] - path.border[3];
		if (fillWidth == true) {
			x = draw[taskId].qSize[qNum][0];
			w = maxWidth;
		} else {
			x = draw[taskId].qSize[qNum][0] + draw[taskId].qSize[qNum][2] - minWidth;
		}
	} else if (position == 'center' || minWidth >= draw[taskId].qSize[qNum][2]) { // if element needs to start on a new line
		for (var i = 0; i < pathNum; i++) {
			if (paths[i].qBox == qNum && paths[i].qPos !== 'bottomRight') {
				if (path.obj.length == 1 && path.obj[0].type == 'text') {
					y = Math.max(y,paths[i].border[1]+paths[i].border[3]-0.6*draw[taskId].selectPadding);
				} else {
					y = Math.max(y,paths[i].border[1]+paths[i].border[3]-draw[taskId].selectPadding);
				}
			}
		}
		if (position == 'center') {
			x = draw[taskId].qSize[qNum][0]+0.5*draw[taskId].qSize[qNum][2]-0.5*w;
		}
		if (fillWidth == true) {
			w = maxWidth;
		}
	} else {
		var prevPaths = [];
		for (var i = 0; i < pathNum; i++) {
			if (paths[i].qBox == qNum) {
				prevPaths.push(paths[i]);
			}
		}
		// check if there is a space to the right of the prev auto element	
		if (prevPaths.length > 0 && prevPaths[prevPaths.length-1].qPos == 'auto' && (draw[taskId].qSize[qNum][0]+draw[taskId].qSize[qNum][2]) - (prevPaths[prevPaths.length-1].border[0]+prevPaths[prevPaths.length-1].border[2]) >= minWidth) {
			// if there is enough space to the right of the previous path (which is 'auto')
			x = prevPaths[prevPaths.length-1].border[0]+prevPaths[prevPaths.length-1].border[2];
			y = prevPaths[prevPaths.length-1].border[1];
			if (fillWidth == true) {
				w = (draw[taskId].qSize[qNum][0]+draw[taskId].qSize[qNum][2]) - (prevPaths[prevPaths.length-1].border[0]+prevPaths[prevPaths.length-1].border[2]);
			}
		} else {
			var slots = [];
			var minTop = y;
			var newLineTop = y;
			for (var i = 0; i < pathNum; i++) {
				if (paths[i].qBox == qNum) {
					if (paths[i].qPos == 'auto') {
						minTop = Math.max(minTop,paths[i].border[1]);
						newLineTop = Math.max(newLineTop,paths[i].border[1]+paths[i].border[3]-draw[taskId].selectPadding);
						var w2 = (draw[taskId].qSize[qNum][0]+draw[taskId].qSize[qNum][2]) - (paths[i].border[0]);
						if (w2 >= minWidth) {
							// check if there is a space below this element
							var x2 = paths[i].border[0];
							var y2 = paths[i].border[1]+paths[i].border[3];
							var spaceBelow = true;
							for (var j = 0; j < paths.length; j++) {
								var l = paths[j].border[0];
								var t = paths[j].border[1];
								var r = paths[j].border[0]+paths[j].border[2];
								var b = paths[j].border[1]+paths[j].border[3];
								if (t <= y2 && b > y2 &&
									((l <= x2 && r > x2) ||
									(l < x2+w2 && r >= x2+w2) ||
									(l <= x2 && r >= x2+w2) ||
									(l > x2 && r < x2+w2))) {
										spaceBelow = false;
										break;
									}
							}
							if (spaceBelow == true) {
								slots.push([x2,y2,w2]);
							}
						}
					} else if (paths[i].qPos == 'center') {
						newLineTop = Math.max(newLineTop,paths[i].border[1]+paths[i].border[3]-draw[taskId].selectPadding);
				}
				}
			}
			var bestSlot = -1;
			for (var i = 0; i < slots.length; i++) {
				if (slots[i][1] >= minTop) {
					bestSlot = i;
				}
			}
			if (bestSlot == -1 || slots[bestSlot][1] >= newLineTop) {
				y = newLineTop;
				if (fillWidth == true) {
					w = maxWidth;
				}
			} else {					
				x = slots[bestSlot][0];
				y = slots[bestSlot][1];
				if (fillWidth == true) {
					w = slots[bestSlot][2];
				}
			}
		}
	}
	return [x,y,w];
}
function saveQBox(obj) {
	if (typeof obj == 'undefined') obj = {};
	var qNum = obj.qNum || 0;
	if (typeof obj.large == 'undefined') obj.large = 0;
	if (typeof obj.calc == 'undefined') obj.calc = 0;
	if (typeof obj.ks3y7 == 'undefined') obj.ks3y7 = 0;
	if (typeof obj.ks3y8 == 'undefined') obj.ks3y8 = 0;
	if (typeof obj.gcsef == 'undefined') obj.gcsef = 0;
	if (typeof obj.gcseh == 'undefined') obj.gcseh = 0;
	if (typeof obj.ks5y12 == 'undefined') obj.ks5y12 = 0;
	if (typeof obj.ks5y13 == 'undefined') obj.ks5y13 = 0;
	if (typeof obj.topic == 'undefined') obj.topic = '';
	if (typeof obj.subtopic == 'undefined') obj.subtopic = '';
	if (typeof obj.description == 'undefined') obj.description = '';
	
	if (typeof obj.filename == 'undefined') {
		var updateDatabase = 1;
		var saveId = -1;
	} else {
		var updateDatabase = 0;
		var saveId = obj.filename;
	}
	
	var qBox = {paths:[],size:draw[taskId].qSize[qNum],minWidth:draw[taskId].qMinWidth[qNum],minHeight:draw[taskId].qMinHeight[qNum]};
	for (var i = 0; i < draw[taskId].path.length; i++) {
		if (draw[taskId].path[i].qBox == qNum) {
			var pathReduced = reduceDrawPathForSaving(i);
			qBox.paths.push(pathReduced);
		}
	}
	qdata = stringify(qBox,{maxLength:150});

	console.log(JSON.stringify(obj));
	var params = 'large='+encodeURIComponent(obj.large)+'&calc='+encodeURIComponent(obj.calc)+'&ks3y7='+encodeURIComponent(obj.ks3y7)+'&ks3y8='+encodeURIComponent(obj.ks3y8)+'&gcsef='+encodeURIComponent(obj.gcsef)+'&gcseh='+encodeURIComponent(obj.gcseh)+'&ks5y12='+encodeURIComponent(obj.ks5y12)+'&ks5y13='+encodeURIComponent(obj.ks5y13)+'&topic='+encodeURIComponent(values.topic)+'&subtopic='+encodeURIComponent(values.subtopic)+'&description='+encodeURIComponent(values.description)+'&qdata='+encodeURIComponent(qdata)+'&updateDatabase='+encodeURIComponent(updateDatabase)+'&saveId='+encodeURIComponent(saveId);
	//console.log(params);
	
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("post", "saveQuestion.php", true);
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.onload = function() {
		console.log(this.responseText);
	}
	xmlHttp.send(params);
	/*var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(str));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);	*/
}
function loadQBox() {
	draw[taskId].loadMode = 'edit';
	fileChooser.click();
}
function drawClickQBoxResizeX() {
	changeDrawMode('qBoxResizeX');
	draw[taskId].prevX = mouse.x;
	addListenerMove(window,qBoxResizeXMove);
	addListenerEnd(window,qBoxResizeXStop);
}
function qBoxResizeXMove(e) {
	updateMouse(e);
	draw[taskId].qSize[2] = Math.max(50,mouse.x-draw[taskId].qSize[0],draw[taskId].qMinWidth);
	qBoxRefresh();
	drawCanvasPaths();
	draw[taskId].prevX = mouse.x;
}
function qBoxResizeXStop(e) {
	changeDrawMode('prev');
	draw[taskId].prevX = null;
	removeListenerMove(window,qBoxResizeXMove);
	removeListenerEnd(window,qBoxResizeXStop);
}

function drawClickQBoxResizeY() {
	changeDrawMode('qBoxResizeY');
	draw[taskId].prevY = mouse.y;
	addListenerMove(window,qBoxResizeYMove);
	addListenerEnd(window,qBoxResizeYStop);
}
function qBoxResizeYMove(e) {
	updateMouse(e);
	draw[taskId].qSize[3] = Math.max(50,mouse.y - draw[taskId].qSize[1]);
	qBoxRefresh();
	drawCanvasPaths();
	draw[taskId].prevY = mouse.y;
}
function qBoxResizeYStop(e) {
	changeDrawMode('prev');
	draw[taskId].prevY = null;
	removeListenerMove(window,qBoxResizeYMove);
	removeListenerEnd(window,qBoxResizeYStop);
}

function drawClickQBoxObjPosBottomRight() {
	var pathNum = draw[taskId].currCursor.pathNum;
	if (draw[taskId].path[pathNum].qPos == 'bottomRight') {
		draw[taskId].path[pathNum].qPos = 'auto';
	} else {
		draw[taskId].path[pathNum].qPos = 'bottomRight';
	}
	qBoxRefresh();
}
function drawClickQBoxObjPosCenter() {
	var pathNum = draw[taskId].currCursor.pathNum;
	if (draw[taskId].path[pathNum].qPos == 'center') {
		draw[taskId].path[pathNum].qPos = 'auto';
	} else {
		draw[taskId].path[pathNum].qPos = 'center';
	}
	qBoxRefresh();
}
function drawClickQBoxTextFillWidth() {
	var pathNum = draw[taskId].currCursor.pathNum;
	if (draw[taskId].path[pathNum].qFillWidth == true) {
		draw[taskId].path[pathNum].qFillWidth = false;
	} else {
		draw[taskId].path[pathNum].qFillWidth = true;
	}
	qBoxRefresh();
}
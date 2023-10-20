/*if (typeof console == "undefined") {
    this.console = { log: function (msg) { alert(msg); } };
}*/

/*
text selection - double click should select word
cursor up/down - remember horizPos of original line and find closest in other lines

*/

/* example of basic use:
var j000inputs = inputs({
	inputs:[
		{left:900,top:300,width:100,height:50,algText:true},
		{left:900,top:500,width:100,height:50,algText:true}	
	],
	leftText:[
		['Perimeter = '],
		['Area = ']
	],
	rightText:[
		['cm'],
		['cm',['pow',false,['2']]]	
	],
	checkFuncs:[
		function(mathsInput) {
			if (mathsInput.stringJS == 'correctAns') {
				return true;	
			} else {
				return false
			}
		},
		function(mathsInput) {
			if (mathsInput.stringJS == 'correctAns') {
				return true;	
			} else {
				return false
			}
		}
	],
});
*/
function inputs(object) {
	var inputs = object.inputs;
	var checkFuncs = object.checkFuncs;
	var buttonPos = object.buttonPos || [990,620];
	var taskComplete = boolean(object.taskCompleted,true);
	var buttonVis = boolean(object.buttonVisible,true);
	
	var inputArray = [];
	
	for (var i = 0; i < inputs.length; i++) {
		var zIndex = inputs[i].zIndex || 2;
		// mathsInput
		var input = createMathsInput2(inputs[i]);
		var vis = boolean(inputs[i].visible,true);
				
		// leftText && rightText	
		var button3 = document.createElement('canvas');
		button3.width = 1200;
		button3.height = 700;
		button3.setAttribute('position', 'absolute');
		button3.setAttribute('cursor', 'auto');
		button3.setAttribute('draggable', 'false');
		button3.setAttribute('class', 'buttonClass');
		var data3 = [0,0,1200,700,vis,false,false,zIndex];
		if (vis == true) container.appendChild(button3);
		data3[130] = true;
		for (var j = 0; j < 8; j++) {data3[100+j] = data3[j];}
		button3.style.zIndex = zIndex;
		button3.style.pointerEvents = 'none';
		taskObject[taskId].push(button3);
		taskObjectData[taskId].push(data3);
		button3.data = data3;	
		button3.ctx = button3.getContext('2d');

		if (typeof object.leftText == 'object') {
			if (typeof object.leftText[i] == 'object') {
				var maxLines = inputs[i].maxLines || 1;
				var fontSize = inputs[i].fontSize || 0.5 * (inputs[i].height / maxLines);
				var textColor = inputs[i].textColor || '#000';
				drawMathsText(button3.ctx,object.leftText[i],fontSize,inputs[i].left-4,inputs[i].top+0.5*inputs[i].height,false,[],'right','middle',textColor);
				input.leftText = object.leftText[i];
			}
		}
		if (typeof object.rightText == 'object') {
			if (typeof object.rightText[i] == 'object') {
				var maxLines = inputs[i].maxLines || 1;
				var fontSize = inputs[i].fontSize || 0.5 * (inputs[i].height / maxLines);
				var textColor = inputs[i].textColor || '#000';
				drawMathsText(button3.ctx,object.rightText[i],fontSize,inputs[i].left+inputs[i].width+15,inputs[i].top+0.5*inputs[i].height,false,[],'left','middle',textColor);
				var textMeasure = drawMathsText(button3.ctx,object.rightText[i],fontSize,inputs[i].left+inputs[i].width+15,inputs[i].top+0.5*inputs[i].height,false,[],'left','middle',textColor,'measure');
				if (typeof inputs[i].offset === 'undefined') inputs[i].offset = [textMeasure[0]+5,0];
				input.rightText = object.rightText[i];
			}
		}
		if (typeof inputs[i].offset === 'undefined') inputs[i].offset = [0,0];		
		
		input.leftRightTextCanvas = button3;
		input.canvas.leftRightTextCanvas = button3;
		
		// what if... maths input is entered through tab key, rather than clicking on??
		addListener(input.canvas, function() {
			hideObj(this.tick,this.tick.data);
			hideObj(this.cross,this.cross.data);
		});
		
		// tick canvas
		var button = document.createElement('canvas');
		button.width = 40;
		button.height = 50;
		button.setAttribute('position', 'absolute');
		button.setAttribute('cursor', 'auto');
		button.setAttribute('draggable', 'false');
		button.setAttribute('class', 'buttonClass');
		var data = [inputs[i].left+inputs[i].width+13+inputs[i].offset[0],inputs[i].top+0.5*inputs[i].height-25+inputs[i].offset[1],40,50,false,false,false,zIndex];
		data[130] = true;
		for (var j = 0; j < 8; j++) {data[100+j] = data[j];}
		button.style.zIndex = zIndex;
		button.style.pointerEvents = 'none';
		taskObject[taskId].push(button);	
		taskObjectData[taskId].push(data);
		button.data = data;	
		button.ctx = button.getContext('2d');
		drawTick(button.ctx,40,50);

		// cross canvas
		var button2 = document.createElement('canvas');
		button2.width = 32;
		button2.height = 40;
		button2.setAttribute('position', 'absolute');
		button2.setAttribute('cursor', 'auto');
		button2.setAttribute('draggable', 'false');
		button2.setAttribute('class', 'buttonClass');
		var data2 = [inputs[i].left+inputs[i].width+20+inputs[i].offset[0],inputs[i].top+0.5*inputs[i].height-20+inputs[i].offset[1],32,40,false,false,false,zIndex];
		data2[130] = true;
		for (var j = 0; j < 8; j++) {data2[100+j] = data2[j];}
		button2.style.zIndex = zIndex;
		button.style.pointerEvents = 'none';
		taskObject[taskId].push(button2);	
		taskObjectData[taskId].push(data2);
		button2.data = data2;	
		button2.ctx = button2.getContext('2d');
		drawCross(button2.ctx,32,40);
		
		input.tick = button;
		input.cross = button2;		
		input.canvas.tick = button;
		input.canvas.cross = button2;		
		
		inputArray.push(input);
	}
	if (boolean(object.checkAnsButton,true)) {
		// check answer button
		var button = document.createElement('canvas');
		button.width = 180;
		button.height = 50;
		button.setAttribute('position', 'absolute');
		button.setAttribute('cursor', 'auto');
		button.setAttribute('draggable', 'false');
		button.setAttribute('class', 'buttonClass');
		var data = [buttonPos[0],buttonPos[1],180,50,buttonVis,false,true,2];
		if (buttonVis == true) container.appendChild(button);
		data[130] = true;
		for (var i = 0; i < 8; i++) {data[100+i] = data[i];}
		button.style.zIndex = 2;
		taskObject[taskId].push(button);	
		taskObjectData[taskId].push(data);
		button.data = data;	
		button.ctx = button.getContext('2d');
		if (inputs.length > 1) {
			drawTextBox(button,button.ctx,button.data,'#6F9','#000',4,'28px Hobo','#000','center','Check Answers');
		} else {
			drawTextBox(button,button.ctx,button.data,'#6F9','#000',4,'28px Hobo','#000','center','Check Answer');		
		}
		
		addListener(button,function() {
			var inputs = this.inputs;
			var checkFuncs = this.checkFuncs;
			var complete = true;
			for (var i = 0; i < inputs.length; i++) {
				if (checkFuncs[i](inputs[i]) == true) {
					hideObj(inputs[i].cross,inputs[i].cross.data);
					showObj(inputs[i].tick,inputs[i].tick.data);
				} else {
					hideObj(inputs[i].tick,inputs[i].tick.data);
					showObj(inputs[i].cross,inputs[i].cross.data,3000);
					complete = false;
				}
			}
			if (complete == true) {
				taskCompleted();	
			}
		});
	
		button.inputs = inputArray;
		button.checkFuncs = checkFuncs;
		button.taskComplete = true;
		button.textCanvas = button3;
		return button;
	}
}

function hideAllInputs() {
	for (var i = 0; i < mathsInput[taskId].length; i++) {
		hideMathsInput(mathsInput[taskId][i]);
	}
}
function showAllInputs() {
	for (var i = 0; i < mathsInput[taskId].length; i++) {
		showMathsInput(mathsInput[taskId][i]);
	}	
}
function hideMathsInput(mathsInput) {
	hideObj(mathsInput.canvas,mathsInput.data);
	if (typeof mathsInput.cursorCanvas !== 'undefined') {
		hideObj(mathsInput.cursorCanvas,mathsInput.cursorData);
	}
	if (typeof mathsInput.tick !== 'undefined') {
		hideObj(mathsInput.tick,mathsInput.tick.data);
	}
	if (typeof mathsInput.cross !== 'undefined') {
		hideObj(mathsInput.cross,mathsInput.cross.data);
	}
	if (typeof mathsInput.leftRightTextCanvas !== 'undefined') {
		hideObj(mathsInput.leftRightTextCanvas,mathsInput.leftRightTextCanvas.data);
	}	
}
function showMathsInput(mathsInput) {
	showObj(mathsInput.canvas,mathsInput.data);
	if (typeof mathsInput.cursorCanvas !== 'undefined') {
		showObj(mathsInput.cursorCanvas,mathsInput.cursorData);
	}
	if (typeof mathsInput.leftRightTextCanvas !== 'undefined') {
		showObj(mathsInput.leftRightTextCanvas,mathsInput.leftRightTextCanvas.data);
	}	
}
function moveMathsInput(input,left,top) {
	if (typeof input.data == 'undefined') return;
	var dx = left - input.data[100];
	var dy = top - input.data[101];

	input.data[100] += dx;
	input.data[101] += dy;
	resizeCanvas2(input.canvas,input.data[100],input.data[101]);
	
	if (typeof input.cross !== 'undefined') {
		input.cross.data[100] += dx;
		input.cross.data[101] += dy;
		resizeCanvas2(input.cross,input.cross.data[100],input.cross.data[101]);
	}

	if (typeof input.tick !== 'undefined') {	
		input.tick.data[100] += dx;
		input.tick.data[101] += dy;
		resizeCanvas2(input.tick,input.tick.data[100],input.tick.data[101]);
	}
		
	input.cursorData[100] += dx;
	input.cursorData[101] += dy;
	resizeCanvas2(input.cursorCanvas,input.cursorData[100],input.cursorData[101]);

	if (typeof input.leftRightTextCanvas !== 'undefined') {
		input.leftRightTextCanvas.data[100] += dx;
		input.leftRightTextCanvas.data[101] += dy;
		resizeCanvas2(input.leftRightTextCanvas,input.leftRightTextCanvas.data[100],input.leftRightTextCanvas.data[101]);
	}
}
function enlargeMathsInput(input,sf) { // be careful!
	if (typeof sf !== 'number') return;
	//var l = input.data[100];
	//var t = input.data[101];
	
	//input.data[102] = input.data[102] * sf;
	//input.data[103] = input.data[103] * sf;
	
	resizeCanvas(input.canvas,input.data[100],input.data[101],input.data[102]*sf,input.data[103]*sf);
	
	/*input.cursorData[100] += (l -input.cursorData[100])*sf;
	input.cursorData[101] += (t -input.cursorData[101])*sf;
	input.cursorData[102] = input.cursorData[102] * sf;
	input.cursorData[103] = input.cursorData[103] * sf;
	resizeCanvas(input.cursorCanvas,input.cursorData[100],input.cursorData[101],input.cursorData[102],input.cursorData[103]);	
	
	if (typeof input.cross !== 'undefined') {
		input.cross.data[100] += (l -input.cross.data[100])*sf;
		input.cross.data[101] += (t -input.cross.data[101])*sf;
		input.cross.data[102] = input.cross.data[102] * sf;
		input.cross.data[103] = input.cross.data[103] * sf;
		resizeCanvas(input.cross,input.cross.data[100],input.cross.data[101],input.cross.data[102],input.cross.data[103]);	
	}

	if (typeof input.tick !== 'undefined') {	
		input.tick.data[100] += (l -input.tick.data[100])*sf;
		input.tick.data[101] += (t -input.tick.data[101])*sf;
		input.tick.data[102] = input.tick.data[102] * sf;
		input.tick.data[103] = input.tick.data[103] * sf;
		resizeCanvas(input.tick,input.tick.data[100],input.tick.data[101],input.tick.data[102],input.tick.data[103]);	
	}
	
	if (typeof input.leftRightTextCanvas !== 'undefined') {	
		input.leftRightTextCanvas.data[100] += (l -input.leftRightTextCanvas.data[100])*sf;
		input.leftRightTextCanvas.data[101] += (t -input.leftRightTextCanvas.data[101])*sf;
		input.leftRightTextCanvas.data[102] = input.leftRightTextCanvas.data[102] * sf;
		input.leftRightTextCanvas.data[103] = input.leftRightTextCanvas.data[103] * sf;
		resizeCanvas(input.leftRightTextCanvas,input.leftRightTextCanvas.data[100],input.leftRightTextCanvas.data[101],input.leftRightTextCanvas.data[102],input.leftRightTextCanvas.data[103]);	
	}*/	
}
function setMathsInputZIndex(input,zIndex) {
	if (typeof input.leftRightTextCanvas == 'object') input.leftRightTextCanvas.style.zIndex = zIndex;
	if (typeof input.tick == 'object') input.tick.style.zIndex = zIndex;
	if (typeof input.cross == 'object') input.cross.style.zIndex = zIndex;
	if (typeof input.canvas == 'object') input.canvas.style.zIndex = zIndex;
	if (typeof input.cursorCanvas == 'object') input.cursorCanvas.style.zIndex = zIndex;	
}
function setMathsInputFont(input,font) {
	removeTagsOfType(input.richText,'font');
	input.richText.unshift('<<font:'+font+'>>');
	input.richText = combineSpacesTextArray(input.richText);
	removeTagsOfType(input.startRichText,'font');
	input.startRichText.unshift('<<font:'+font+'>>');
	input.startRichText = combineSpacesTextArray(input.startRichText);	
	input.startTags = removeTagsOfType(input.startTags,'font');
	input.startTags = '<<font:'+font+'>>'+input.startTags;
	currMathsInput = input;
	mathsInputMapCursorPos();
	mathsInputCursorCoords();
	deselectMathsInput();
}
function setMathsInputColor(input,color) {
	removeTagsOfType(input.richText,'color');
	input.richText.unshift('<<color:'+color+'>>');
	input.richText = combineSpacesTextArray(input.richText);
	removeTagsOfType(input.startRichText,'color');
	input.startRichText.unshift('<<color:'+color+'>>');
	input.startRichText = combineSpacesTextArray(input.startRichText);	
	input.startTags = removeTagsOfType(input.startTags,'color');
	input.startTags = '<<color:'+color+'>>'+input.startTags;
	var saveCurrMathsInput = currMathsInput;
	currMathsInput = input;
	drawMathsInputText(input);
	deselectMathsInput();
}
function setMathsInputText(mathsInputObj, opt_newText, opt_newCursorPos) { // eg. setMathsInputText(j37mathsInput[3]);
	var newText;
	if (un(opt_newText)) {
		newText = [""];
	} else if (typeof opt_newText == 'string') {
		newText = [opt_newText];
	} else if (typeof opt_newText == 'number') {
		newText = String(opt_newText);
		newText = [newText];
	} else {
		newText = clone(opt_newText);
	}
	mathsInputObj.text = newText;
	if (!un(mathsInputObj.startTags)) newText.unshift(mathsInputObj.startTags);
	mathsInputObj.richText = newText;
	currMathsInput = mathsInputObj;
	mathsInputMapCursorPos();
	if (typeof opt_newCursorPos !== 'undefined') {
		mathsInputObj.cursorPos = opt_newCursorPos;
	} else {
		mathsInputObj.cursorPos = mathsInputObj.cursorMap.length - 1;
	}
	mathsInputCursorCoords();
	deselectMathsInput();
}
function setMathsInputTextToInitialTags(m) {
	var newText = "";
	if (!un(m.richText) && typeof m.richText[0] == 'string' && m.richText[0].indexOf('<<') == 0) {
		for (c = 2; c < m.richText[0].length; c++) {
			if (m.richText[0].slice(c).indexOf('>>') == 0 && m.richText[0].slice(c).indexOf('>><<') !== 0) {
				newText = m.richText[0].slice(0,c+2);
				break;
			}
		}
	}
	setMathsInputText(m,[newText],0);
}

function drawTick(ctx,width,height,color,left,top,lineWidth) {
	if (!left) left = 0;
	if (!top) top = 0;
	if (!width) width = 75;
	if (!height) height = 75;
	if (!color) color = '#F0F';
	if(!lineWidth) lineWidth = 8;
	ctx.save();
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = color;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(left+4,top+0.5*height);
	ctx.lineTo(left+width/3,top+height-4);
	ctx.lineTo(left+width-4,top+4);
	ctx.stroke();
	ctx.restore();
}
function drawCross(ctx,width,height,color,left,top,lineWidth) {
	if (!left) left = 0;
	if (!top) top = 0;	
	if (!width) width = 75;
	if (!height) height = 75;
	if (!color) color = '#F00';
	if(!lineWidth) lineWidth = 8;	
	ctx.save();
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = color;
	ctx.lineJoin = 'round';
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(left+4,top+4);
	ctx.lineTo(left+width-4,top+height-4);
	ctx.moveTo(left+width-4,top+4);
	ctx.lineTo(left+4,top+height-4);
	ctx.stroke();
	ctx.restore();
}

function createMathsInput2(object) {
	// non-optional:
	var left = object.left;
	var top = object.top;
	var width = object.width;
	var height = object.height;

	// optional & defaults:
	var varSize = object.varSize; // varSize:{minWidth:50,maxWidth:400,minHeight:50,maxHeight:300,padding:5}
	var id = object.id || window[taskTag+'mathsInput'].length;
	var visible;
	if (typeof object.visible == 'boolean') {visible = object.visible} else {visible = true};
	var zIndex = object.zIndex || 2;
	var algText;
	if (typeof object.algText == 'boolean') {algText = object.algText} else {algText = false};
	var textArray = object.textArray || [""];
	var leftPoint = object.leftPoint || 10;
	var textColor = object.textColor || '#000';
	var textAlign = object.textAlign || 'center';
	var vertAlign = object.vertAlign || 'middle';
	var transparent;
	if (typeof object.transparent == 'boolean') {transparent = object.transparent} else {transparent = false};
	var maxChars = object.maxChars || 1000000000;
	var backColor = object.backColor || '#FFF';
	var selectColor = object.selectColor || '#FCF';
	var border;
	if (typeof object.border == 'boolean') {border = object.border} else {border = true};
	var borderWidth = object.borderWidth || 5;
	var borderDash = object.borderDash || [];
	var borderColor = object.borderColor || '#000';	
	var maxLines = object.maxLines || 1;
	var fontSize = object.fontSize || 0.5 * (height/maxLines);	
	var selectable = boolean(object.selectable,false);
	var pointerCanvas = object.pointerCanvas || false;
	
	var inputObject = createMathsInput(id, left, top, width, height, visible, zIndex, algText, textArray, leftPoint, fontSize, textColor, textAlign, transparent, maxChars, backColor, selectColor, border, borderColor, maxLines, vertAlign, varSize, borderWidth, borderDash, selectable, pointerCanvas);
	return inputObject;
}

// creates mathsInput canvas
function createMathsInput(id, left, top, width, height, visible, zIndex, algText, textArray, leftPoint, fontSize, textColor, textAlign, transparent, maxChars, backColor, selectColor, border, borderColor, maxLines, vertAlign, varSize, borderWidth, borderDash,selectable, pointerCanvas) {
	taskTag = taskTagArray[taskId];
	width += 5;
	height += 5;
	if (!maxLines) {maxLines = 1};
	if (!zIndex) {zIndex = 2};
	if (!algText) {algText = false};
	if (!fontSize) (fontSize = (height/maxLines) * 0.75);	
	if (!textColor) (textColor = '#000');
	if (!textAlign) {textAlign = 'center'};
	if (textAlign == 'center') {leftPoint = 0.5 * width};
	if (!vertAlign) {vertAlign = 'middle'};
	if (!textArray) {textArray = [""]};
	var font = 'Arial';
	if (algText == true) font = 'algebra';
	var startText = textArray.slice(0);
	var startTags = "<<font:"+font+">><<fontSize:"+fontSize+">><<color:"+textColor+">><<backColor:none>><<bold:false>><<italic:false>><<align:"+textAlign+">>";
	textArray.unshift(startTags);
	var startRichText = textArray.slice(0);
	if (!leftPoint) {leftPoint = 10};
	if (typeof transparent !== 'boolean') {transparent = false};
	if (!maxChars) {maxChars = 100000000}
	if (!backColor) backColor = "#fff";
	var currBackColor = backColor;
	if (!selectColor) selectColor = '#FCF';
	if (typeof border !== 'boolean') border = true;
	if (!borderWidth) borderWidth = 5;
	if (!borderDash) borderDash = [];
	if (!borderColor) borderColor = '#000';
	if (!startText) startText = [''];
	if (typeof selectable !== 'boolean') selectable = false;	
	if (!pointerCanvas) pointerCanvas = false;
	
	// text canvas
	var inputInstance = document.createElement('canvas');
	inputInstance.setAttribute('class', 'inputClass');
	inputInstance.setAttribute('width', width);
	inputInstance.setAttribute('height', height);
	inputInstance.setAttribute('left', left);
	inputInstance.setAttribute('top', top);
	inputInstance.setAttribute('position', 'absolute');
	inputInstance.style.border = 'none';	
	inputInstance.style.zIndex = zIndex;
	inputInstance.style.pointerEvents = 'none';
	var inputInstanceData = [left, top, width, height, visible, false, false, zIndex];
	if (visible == true) {
		inputInstanceData[130] = true;
		container.appendChild(inputInstance);
	} else {
		inputInstanceData[130] = false;
		if (inputInstance.parentNode == container) {container.removeChild(inputInstance)}
	}
	taskObject[taskId].push(inputInstance);
	var inputInstancectx = inputInstance.getContext('2d');
	for (var i = 0; i < 8; i++) {inputInstanceData[i+100] = inputInstanceData[i]};
	inputInstanceData[200] = true;
	inputInstanceActive = true;
	taskObjectData[taskId].push(inputInstanceData);
	resizeCanvas(inputInstance,inputInstanceData[0],inputInstanceData[1],inputInstanceData[2],inputInstanceData[3]);

	// cursor & event catch canvas
	var cursorCanvas = document.createElement('canvas');
	cursorCanvas.setAttribute('class', 'inputClass');
	cursorCanvas.setAttribute('width', width);
	cursorCanvas.setAttribute('height', height);
	cursorCanvas.setAttribute('left', left);
	cursorCanvas.setAttribute('top', top);
	cursorCanvas.setAttribute('position', 'absolute');
	cursorCanvas.style.border = 'none';	
	cursorCanvas.style.zIndex = zIndex;
	cursorCanvas.addEventListener('mousedown', startMathsInput, false);
	cursorCanvas.addEventListener('touchstart', startMathsInput, false);
	var cursorCanvasData = [left, top, width, height, visible, false, true, zIndex];
	if (visible == true) {
		cursorCanvasData[130] = true;
		container.appendChild(cursorCanvas);
	} else {
		cursorCanvasData[130] = false;
		if (cursorCanvas.parentNode == container) {container.removeChild(cursorCanvas)}
	}
	if (typeof pointerCanvas == 'object') {
		cursorCanvasData[6] = false;
		cursorCanvas.style.pointerEvents = 'none';
	}
	taskObject[taskId].push(cursorCanvas);
	var cursorCanvasctx = cursorCanvas.getContext('2d');
	for (var i = 0; i < 8; i++) {cursorCanvasData[i+100] = cursorCanvasData[i]};
	cursorCanvasData[200] = true;
	cursorCanvasActive = true;
	taskObjectData[taskId].push(cursorCanvasData);
	resizeCanvas(cursorCanvas,cursorCanvasData[0],cursorCanvasData[1],cursorCanvasData[2],cursorCanvasData[3]);	

	var inputInstanceObject = {
		id:id,
		canvas:inputInstance,
		ctx:inputInstancectx,
		data:inputInstanceData,
		cursorCanvas:cursorCanvas,
		cursorctx:cursorCanvasctx,		
		cursorData:cursorCanvasData,
		active:inputInstanceActive,
		stringJS:"",
		text:startText,
		richText:startRichText,
		textLoc:[],
		cursorPos:0,
		cursorMap:[],
		algText:algText,
		leftPoint:leftPoint,
		fontSize:fontSize,
		textColor:textColor,
		textAlign:textAlign,
		transparent:transparent,
		maxChars:maxChars,
		backColor:backColor,
		selectColor:selectColor,
		border:border, // boolean
		borderWidth:borderWidth,
		borderDash:borderDash,
		borderColor:borderColor,
		currBackColor:currBackColor,
		startText:startText,
		startRichText:startRichText,
		startTags:startTags,
		maxLines:maxLines,
		preText:'',
		postText:'',
		vertAlign:vertAlign,
		varSize:varSize,
		selectable:selectable,
		selectPos:[],
		selected:false,
		setBackColor:function(color) {
			this.backColor = color;
			drawMathsInputText(this);
		}
	};
	window[taskTag+'mathsInput'][id] = inputInstanceObject;
	mathsInput[taskId].push(inputInstanceObject);
	currMathsInput = inputInstanceObject;
	currMathsInputId = id;
	drawMathsInputText(currMathsInput);
	mathsInputMapCursorPos();
	mathsInputCursorCoords();
	deselectMathsInput();
	return inputInstanceObject;
}

function mathsInputFrac(e) {mathsInputElement("['frac', [''], ['']]");}
function mathsInputPow(e) {mathsInputElement("['power', false, ['']]");}
function mathsInputSubs(e) {mathsInputElement("['subs', [''], ['']]");}
function mathsInputRoot(e) {mathsInputElement("['root', [''], ['']]");}
function mathsInputSqrt(e) {mathsInputElement("['sqrt', ['']]");}
function mathsInputSin(e) {mathsInputElement("['sin', ['']]");}
function mathsInputCos(e) {mathsInputElement("['cos', ['']]");}
function mathsInputTan(e) {mathsInputElement("['tan', ['']]");}
function mathsInputInvSin(e) {mathsInputElement("['sin-1', ['']]");}
function mathsInputInvCos(e) {mathsInputElement("['cos-1', ['']]");}
function mathsInputInvTan(e) {mathsInputElement("['tan-1', ['']]");}
function mathsInputLn(e) {mathsInputElement("['ln', ['']]");}
function mathsInputLog(e) {mathsInputElement("['log', ['']]");}
function mathsInputLogBase(e) {mathsInputElement("['logBase', [''], ['']]");}
function mathsInputAbs(e) {mathsInputElement("['abs', ['']]");}
function mathsInputExp(e) {mathsInputElement("['exp', ['']]");}
function mathsInputSigma1(e) {mathsInputElement("['sigma1', ['']]");}
function mathsInputSigma2(e) {mathsInputElement("['sigma2', [''], [''], ['']]");}
function mathsInputInt1(e) {mathsInputElement("['int1', ['']]");}
function mathsInputInt2(e) {mathsInputElement("['int2', [''], [''], ['']]");}
function mathsInputVectorArrow(e) {mathsInputElement("['vectorArrow', ['']]");}
function mathsInputBar(e) {mathsInputElement("['bar', ['']]");}
function mathsInputHat(e) {mathsInputElement("['hat', ['']]");}
function mathsInputRecurring(e) {mathsInputElement("['recurring', ['']]");}
function mathsInputColVector2d(e) {mathsInputElement("['colVector2d', [''], ['']]");}
function mathsInputColVector3d(e) {mathsInputElement("['colVector3d', [''], [''], ['']]");}
function mathsInputMixedNum(e) {mathsInputElement("['mixedNum', [''], [''], ['']]");}
function mathsInputLim(e) {mathsInputElement("['lim', [''], ['']]");}

function mathsInputCut() {
	if (currMathsInput.selected == false) return; 
	mathsInputCopy();
	currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
	currMathsInput.selPos = [];
	currMathsInput.selected = false;	
	deleteSelected();
	removeSelectTags();
	drawMathsInputText(currMathsInput);
	mathsInputMapCursorPos();
	mathsInputCursorCoords();	
}
function mathsInputCopy() {
	if (currMathsInput.selected == false) return; 	
	var sel = false;
	clipboard = arrayHandler(clone(currMathsInput.richText));	
	
	//console.log(clipboard);
	
	function arrayHandler(array) {
		for (var l = 0; l < array.length; l++) {
			if (typeof array[l] == 'string') {
				if (l > 0 || array.length == 1 || ['frac','power','pow','subs','subscript','sin','cos','tan','ln','log','logBase','sin-1','cos-1','tan-1','abs','exp','root','sqrt','sigma1','sigma2','int1','int2','recurring','bar','hat','vectorArrow','colVector2d','colVector3d','mixedNum','lim'].indexOf(array[l]) == -1) {
					array[l] = stringHandler(array[l]);
				}
			} else {
				array[l] = arrayHandler(array[l]);
				if (sel == false) {
					array.splice(l,1);
					l--;
				}
			}
		}
		return array;
	}
	function stringHandler(string) {
		var delPos = [];
		if (sel == true) delPos[0] = 0;
		var savedTags = '';
		for (var j = 0; j < string.length; j++) {
			var slice = string.slice(j);
			if (slice.indexOf('<<selected:true>>') == 0) {
				delPos[0] = j+17;
				sel = true;
			}
			if (slice.indexOf('<<selected:false>>') == 0) {
				delPos[1] = j;
				sel = false;
 			}
			/*if (sel == true && (slice.indexOf('<<font') == 0 || slice.indexOf('<<bold') == 0 || slice.indexOf('<<italic') == 0 || slice.indexOf('<<color') == 0 || slice.indexOf('<<back') == 0)) {
				savedTags += slice.slice(0,slice.indexOf('>>')+2);
			}*/
		}
		if (delPos.length > 0) {
			if (delPos.length == 1) {
				return string.slice(delPos[0])+savedTags;
			} else {
				return string.slice(delPos[0],delPos[1]);
			}
		} else {
			return string;
		}
	}	
}
function mathsInputPaste() {
	if (typeof clipboard !== 'object' || clipboard == [] || arraysEqual(clipboard,[''])) return;
	var elementString = JSON.stringify(clipboard);
	
	if (currMathsInput.selected == true) {
		currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
		currMathsInput.selPos = [];
		currMathsInput.selected = false;
		deleteSelected();
		removeSelectTags();
		drawMathsInputText(currMathsInput);
		mathsInputMapCursorPos();
		mathsInputCursorCoords();
	}	
	
	var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
	var parent = currMathsInput.richText;
	for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
	var pos = cursorPos[cursorPos.length - 1];
	pos = adjustForBreakPoints(pos);
	var parentPos = cursorPos[cursorPos.length - 2];
	var evalString = 'currMathsInput.richText' 
	for (var aa = 0; aa < cursorPos.length - 2; aa++) {
		evalString += '[' + cursorPos[aa] + ']';
	}
	var before = parent.slice(0,pos);
	var after = parent.slice(pos);
	
	//console.log('before:',before);
	//console.log('after:',after);
	
	var newParent = clone(clipboard);
	newParent.unshift(before);
	newParent.push(after);
	
	//console.log('newParent:',newParent);	
	
	eval(evalString+" = newParent;");

	//console.log('currMathsInput.richText:',currMathsInput.richText);
	
	var cursorPosCount = 0;
	arrayHandler(clipboard);
	
	function arrayHandler(array) {
		for (var l = 0; l < array.length; l++) {
			if (typeof array[l] == 'string') {
				if (array.length == 1 || ['frac','power','pow','subs','subscript','sin','cos','tan','ln','log','logBase','sin-1','cos-1','tan-1','abs','exp','root','sqrt','sigma1','sigma2','int1','int2','recurring','bar','hat','vectorArrow','colVector2d','colVector3d','mixedNum','lim'].indexOf(array[l]) == -1) {
					cursorPosCount += array[l].length;
				}
			} else {
				arrayHandler(array[l]);
			}
		}
	}
	
	mathsInputMapCursorPos();
	currMathsInput.cursorPos += cursorPosCount;
	mathsInputCursorCoords();
	currMathsInput.preText = '';
	currMathsInput.postText = '';		
}

function mathsInputElement(elementString) {
	if (currMathsInput.selected == true) {
		currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
		currMathsInput.selPos = [];
		currMathsInput.selected = false;
		deleteSelected();
		removeSelectTags();
		drawMathsInputText(currMathsInput);
		mathsInputMapCursorPos();
		mathsInputCursorCoords();
	}	
	
	// get cursorPos
	var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
	// get parent
	var parent = currMathsInput.richText;
	for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
	// get position of cursor in parent string
	var pos = cursorPos[cursorPos.length - 1];
	pos = adjustForBreakPoints(pos);
	var parentPos = cursorPos[cursorPos.length - 2];
	var evalString = 'currMathsInput.richText' 
	for (var aa = 0; aa < cursorPos.length - 2; aa++) {
		// ugly string creation apprach in order to use eval()
		evalString += '[' + cursorPos[aa] + ']';
	}
	eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos), currMathsInput.preText, " + elementString + ", currMathsInput.postText, parent.slice(pos));");
	
	mathsInputMapCursorPos();
	currMathsInput.cursorPos++;
	mathsInputCursorCoords();
	currMathsInput.preText = '';
	currMathsInput.postText = '';	
}

function mathsInputNewLine() {
	// get cursorPos
	var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
	
	if (typeof currMathsInput.richText[cursorPos[0]] == 'string') {
		var slicePos = cursorPos[1];
		slicePos = adjustForBreakPoints(slicePos);
		// check if there is an align tag
		if (currMathsInput.richText[cursorPos[0]].slice(slicePos).indexOf('<<align:') == 0) {
			slicePos += currMathsInput.richText[cursorPos[0]].slice(slicePos).indexOf('>>')+2;
		}
		currMathsInput.richText[cursorPos[0]] = currMathsInput.richText[cursorPos[0]].slice(0,slicePos) + '<<br>>' + currMathsInput.richText[cursorPos[0]].slice(slicePos);	
		mathsInputMapCursorPos();
		currMathsInput.cursorPos += 1;
		mathsInputCursorCoords();
	} else {
		// jump forward from element to next string (if it exists) and insert <<br>>
		var cursorPosShiftCount = 0;
		for (var i = currMathsInput.cursorPos; i < currMathsInput.cursorMap.length; i++) {
			cursorPosShiftCount++;
			// if the next element has been reached
			if (cursorPos[0] < currMathsInput.cursorMap[i][0]) {
				if (typeof currMathsInput.richText[currMathsInput.cursorMap[i][0]] == 'string') {
					cursorPos = currMathsInput.cursorMap[i];
					currMathsInput.richText[currMathsInput.cursorMap[i][0]] = '<<br>>'+currMathsInput.richText[currMathsInput.cursorMap[i][0]];
					break;
				} else {
					// this shouldn't happen?? All elements will be separated by a text string
				}
			} else if (i == currMathsInput.cursorMap.length - 1) {
				currMathsInput.richText.push('<<br>>');
				cursorPosShiftCount += 6;
				
			}
		}
		
		mathsInputMapCursorPos();
		currMathsInput.cursorPos += cursorPosShiftCount;
		mathsInputCursorCoords();		
	}
}
function mathsInputTab(howMany) {
	if (un(howMany)) howMany = 1;
	var ins = "";
	for (var i = 0; i < howMany; i++) {
		ins += String.fromCharCode(0x21F4);
	}
	// get cursorPos
	var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];

	if (typeof currMathsInput.richText[cursorPos[0]] == 'string') {
		var slicePos = cursorPos[1];
		slicePos = adjustForBreakPoints(slicePos);
		// check if there is an align tag
		if (currMathsInput.richText[cursorPos[0]].slice(slicePos).indexOf('<<align:') == 0) {
			slicePos += currMathsInput.richText[cursorPos[0]].slice(slicePos).indexOf('>>')+2;
		}
		currMathsInput.richText[cursorPos[0]] = currMathsInput.richText[cursorPos[0]].slice(0,slicePos) + ins + currMathsInput.richText[cursorPos[0]].slice(slicePos);	
		mathsInputMapCursorPos();
		currMathsInput.cursorPos += howMany;
		mathsInputCursorCoords();
	} else {
		// jump forward from element to next string (if it exists) and insert <<br>>
		var cursorPosShiftCount = 0;
		for (var i = currMathsInput.cursorPos; i < currMathsInput.cursorMap.length; i++) {
			cursorPosShiftCount++;
			// if the next element has been reached
			if (cursorPos[0] < currMathsInput.cursorMap[i][0]) {
				if (typeof currMathsInput.richText[currMathsInput.cursorMap[i][0]] == 'string') {
					cursorPos = currMathsInput.cursorMap[i];
					currMathsInput.richText[currMathsInput.cursorMap[i][0]] = ins+currMathsInput.richText[currMathsInput.cursorMap[i][0]];
					break;
				} else {
					// this shouldn't happen?? All elements will be separated by a text string
				}
			} else if (i == currMathsInput.cursorMap.length - 1) {
				currMathsInput.richTexts.push(String.fromCharCode(0x21F4));
				cursorPosShiftCount += howMany;
				
			}
		}
		
		mathsInputMapCursorPos();
		currMathsInput.cursorPos += cursorPosShiftCount;
		mathsInputCursorCoords();		
	}
}
function mathsInputLeftArrow(e) {
	if (currMathsInput.cursorPos > 0) {
		currMathsInput.cursorPos--;
		mathsInputCursorCoords();
	} else {
		mathsInputTabPrev();
		/*
		//endMathsInput(e);
		//if (currMathsInput == loginInput1) {
		//	startMathsInput(loginInput2.canvas);
		//} else if (currMathsInput !== loginInput2) {
			var maxMathsInputNum;
			eval('maxMathsInputNum = '+taskTag+'mathsInput.length - 1');
			if (currMathsInputId == 0) {
				for (i = maxMathsInputNum; i >= 0; i--) {
					if (eval(taskTag+'mathsInput[i].canvas.parentNode == container') && eval(taskTag+'mathsInput[i].active == true')) {
						eval('startMathsInput('+taskTag+'mathsInput[i].canvas)');
						break;
					}
				}
			} else {
				for (i = currMathsInputId - 1; i >= 0; i--) {
					if (eval(taskTag+'mathsInput[i].canvas.parentNode == container') && eval(taskTag+'mathsInput[i].active == true')) {
						eval('startMathsInput('+taskTag+'mathsInput[i].canvas)');
						break;
					}
					if (i == 0) {i = maxMathsInputNum + 1}
				}
			}
			currMathsInput.cursorPos = currMathsInput.cursorMap.length - 1;
			mathsInputCursorCoords();						
		//}
		*/
	}
}
function mathsInputRightArrow(e) {
	if (currMathsInput.cursorPos < currMathsInput.cursorMap.length - 1) {
		currMathsInput.cursorPos++;
		mathsInputCursorCoords();
	} else {
		mathsInputTabNext();
		/*
		//endMathsInput(e);
		//if (currMathsInput == loginInput1) {
		//	startMathsInput(loginInput2.canvas);
		//} else if (currMathsInput !== loginInput2) {
			var maxMathsInputNum;
			eval('maxMathsInputNum = '+taskTag+'mathsInput.length - 1');
			if (currMathsInputId == maxMathsInputNum) {
				for (i = 0; i <= maxMathsInputNum; i++) {
					if (eval(taskTag+'mathsInput[i].canvas.parentNode == container') && eval(taskTag+'mathsInput[i].active == true')) {
						eval('startMathsInput('+taskTag+'mathsInput[i].canvas)');
						break;
					}
				}
			} else {
				for (i = currMathsInputId + 1; i <= maxMathsInputNum; i++) {
					if (eval(taskTag+'mathsInput[i].canvas.parentNode == container') && eval(taskTag+'mathsInput[i].active == true')) {
						eval('startMathsInput('+taskTag+'mathsInput[i].canvas)');
						break;
					}
					if (i == maxMathsInputNum) {i = -1}
				}
			}
			currMathsInput.cursorPos = 0;
			mathsInputCursorCoords();		
		//}
		*/
	}
}
function mathsInputTabPrev() {
	var dx,dy,x,y,currBest1,currBest2;
	for (var i = 0; i < mathsInput[taskId].length; i++) {
		if (i == currMathsInputId || mathsInput[taskId][i].canvas.parentNode !== container || mathsInput[taskId][i].active == false) continue;
		if (mathsInput[taskId][i].data[100] < mathsInput[taskId][currMathsInputId].data[100] && mathsInput[taskId][i].data[101] == mathsInput[taskId][currMathsInputId].data[101]) { // if directly to the left
			if (typeof dy == 'undefined') {
				dy = 0;
				dx = mathsInput[taskId][currMathsInputId].data[100] - mathsInput[taskId][i].data[100];
				currBest1 = i;
			} else if (dy > 0 || (dy == 0 && mathsInput[taskId][currMathsInputId].data[100] - mathsInput[taskId][i].data[100] < dx)) {
				dy = 0;
				dx = mathsInput[taskId][currMathsInputId].data[100] - mathsInput[taskId][i].data[100];
				currBest1 = i;
			}
		} else if (mathsInput[taskId][i].data[101] < mathsInput[taskId][currMathsInputId].data[101]) { // if above
			if (typeof dy == 'undefined') {
				dy = mathsInput[taskId][currMathsInputId].data[101] - mathsInput[taskId][i].data[101];
				dx = mathsInput[taskId][currMathsInputId].data[100] - mathsInput[taskId][i].data[100];
				currBest1 = i;
			} else if (dy > mathsInput[taskId][currMathsInputId].data[101] - mathsInput[taskId][i].data[101] || (dy == mathsInput[taskId][currMathsInputId].data[101] - mathsInput[taskId][i].data[101] && mathsInput[taskId][currMathsInputId].data[100] - mathsInput[taskId][i].data[100] < dx)) {
				dy = mathsInput[taskId][currMathsInputId].data[101] - mathsInput[taskId][i].data[101];
				dx = mathsInput[taskId][currMathsInputId].data[100] - mathsInput[taskId][i].data[100];
				currBest1 = i;
			}			
			
		} else if ((mathsInput[taskId][i].data[100] > mathsInput[taskId][currMathsInputId].data[100] && mathsInput[taskId][i].data[101] == mathsInput[taskId][currMathsInputId].data[101]) || mathsInput[taskId][i].data[101] > mathsInput[taskId][currMathsInputId].data[101]) { // if directly to the right or below
			if (typeof y == 'undefined') {
				y = mathsInput[taskId][i].data[101];
				x = mathsInput[taskId][i].data[100];
				currBest2 = i;
			} else if (mathsInput[taskId][i].data[101] > y || (mathsInput[taskId][i].data[101] == y && mathsInput[taskId][i].data[100] > x)) {
				y = mathsInput[taskId][i].data[101];
				x = mathsInput[taskId][i].data[100];
				currBest2 = i;
			}
		}
	}
	if (typeof currBest1 !== 'undefined') {
		currMathsInput.preText = '';
		currMathsInput.postText = '';		
		deselectMathsInput(mathsInput[taskId][currBest1],true);		
		startMathsInput(mathsInput[taskId][currBest1]);
		currMathsInput.cursorPos = currMathsInput.cursorMap.length - 1;
		mathsInputCursorCoords();			
	} else if (typeof currBest2 !== 'undefined') {
		currMathsInput.preText = '';
		currMathsInput.postText = '';
		deselectMathsInput(mathsInput[taskId][currBest2],true);		
		startMathsInput(mathsInput[taskId][currBest2]);
		currMathsInput.cursorPos = 0;
		mathsInputCursorCoords();			
	}	
}
function mathsInputTabNext() {
	var dx,dy,x,y,currBest1,currBest2;
	for (var i = 0; i < mathsInput[taskId].length; i++) {
		if (i == currMathsInputId || mathsInput[taskId][i].canvas.parentNode !== container || mathsInput[taskId][i].active == false) continue;
		if (mathsInput[taskId][i].data[100] > mathsInput[taskId][currMathsInputId].data[100] && mathsInput[taskId][i].data[101] == mathsInput[taskId][currMathsInputId].data[101]) { // if directly to the right
			if (typeof dy == 'undefined') {
				dy = 0;
				dx = mathsInput[taskId][i].data[100] - mathsInput[taskId][currMathsInputId].data[100];
				currBest1 = i;
			} else if (dy > 0 || (dy == 0 && mathsInput[taskId][i].data[100] - mathsInput[taskId][currMathsInputId].data[100] < dx)) {
				dy = 0;
				dx = mathsInput[taskId][i].data[100] - mathsInput[taskId][currMathsInputId].data[100];
				currBest1 = i;
			}
		} else if (mathsInput[taskId][i].data[101] > mathsInput[taskId][currMathsInputId].data[101]) { // if below
			if (typeof dy == 'undefined') {
				dy = mathsInput[taskId][i].data[101] - mathsInput[taskId][currMathsInputId].data[101];
				dx = mathsInput[taskId][i].data[100] - mathsInput[taskId][currMathsInputId].data[100];
				currBest1 = i;
			} else if (dy > mathsInput[taskId][i].data[101] - mathsInput[taskId][currMathsInputId].data[101] || (dy == mathsInput[taskId][i].data[101] - mathsInput[taskId][currMathsInputId].data[101] && mathsInput[taskId][i].data[100] - mathsInput[taskId][currMathsInputId].data[100] < dx)) {
				dy = mathsInput[taskId][i].data[101] - mathsInput[taskId][currMathsInputId].data[101];				
				dx = mathsInput[taskId][i].data[100] - mathsInput[taskId][currMathsInputId].data[100];
				currBest1 = i;
			}			
			
		} else if ((mathsInput[taskId][i].data[100] < mathsInput[taskId][currMathsInputId].data[100] && mathsInput[taskId][i].data[101] == mathsInput[taskId][currMathsInputId].data[101]) || mathsInput[taskId][i].data[101] < mathsInput[taskId][currMathsInputId].data[101]) { // if directly to the left or above
			if (typeof y == 'undefined') {
				y = mathsInput[taskId][i].data[101];
				x = mathsInput[taskId][i].data[100];
				currBest2 = i;
			} else if (mathsInput[taskId][i].data[101] < y || (mathsInput[taskId][i].data[101] == y && mathsInput[taskId][i].data[100] < x)) {
				y = mathsInput[taskId][i].data[101];
				x = mathsInput[taskId][i].data[100];
				currBest2 = i;
			}
		}
	}
	if (typeof currBest1 !== 'undefined') {
		currMathsInput.preText = '';
		currMathsInput.postText = '';		
		deselectMathsInput(mathsInput[taskId][currBest1],true);		
		startMathsInput(mathsInput[taskId][currBest1]);
		currMathsInput.cursorPos = currMathsInput.cursorMap.length - 1;
		mathsInputCursorCoords();			
	} else if (typeof currBest2 !== 'undefined') {
		currMathsInput.preText = '';
		currMathsInput.postText = '';
		deselectMathsInput(mathsInput[taskId][currBest2],true);		
		startMathsInput(mathsInput[taskId][currBest2]);
		currMathsInput.cursorPos = 0;
		mathsInputCursorCoords();			
	}		
}

function startMathsInput(e,startCursorPos) {
	deselectMathsInput(e,true);
	taskTag = taskTagArray[taskNum];
	window.addEventListener('keydown', hardKeyMathsInput, false);
	canvas.addEventListener('mousedown', endMathsInput, false); // clicking anywhere on the canvas will end the input
	canvas.addEventListener('touchstart', endMathsInput, false); // touching anywhere on the canvas will end the input
	// clicking a holder button will end the input
	if (typeof holderButton !== 'undefined') {
		for (i = 0; i < 3; i++) {
			holderButton[i].addEventListener('mousedown', endMathsInput, false);
			holderButton[i].addEventListener('touchstart', endMathsInput, false);	
		}
	}
	for (i = 0; i < taskObject[taskNum].length; i++) { // clicking any other object will also end the input
		if (endInputExceptions.indexOf(taskObject[taskNum][i]) == -1) {
			taskObject[taskNum][i].addEventListener('mousedown', endMathsInput, false);
			taskObject[taskNum][i].addEventListener('touchstart', endMathsInput, false);	
		}
	}
	var inputCanvas;
	if (e.target) {inputCanvas = e.target} else {inputCanvas = e};
	var taskMathsInputArray = window[taskTag+'mathsInput'];
	for (i = 0; i < taskMathsInputArray.length; i++) {
		if (taskMathsInputArray[i].cursorCanvas == inputCanvas || taskMathsInputArray[i].canvas == inputCanvas || taskMathsInputArray[i] == inputCanvas) {
			currMathsInput = taskMathsInputArray[i];
			currMathsInputId = i;
		}
	}
	if (currMathsInput.transparent == false && currMathsInput.selectColor !== 'none') {
		currMathsInput.canvas.style.backgroundColor = "#FCF";
	} else if (currMathsInput.transparent == false || currMathsInput.selectColor == 'none') {
		currMathsInput.canvas.style.backgroundColor = "#transparent";
	}
	inputState = true; // allows the onscreen keys to function
	taskTag = taskTagArray[taskNum];
	var closestPos = getClosestTextPos();
	//console.log(currMathsInput,closestPos,currMathsInput.selectable,startCursorPos);
	if (currMathsInput.selectable == true && typeof startCursorPos == 'undefined') {
		currMathsInput.selectPos = [closestPos,closestPos];
		setSelectPositions();
		drawMathsInputText(currMathsInput);
		mathsInputMapCursorPos();
		if (typeof currMathsInput.pointerCanvas !== 'object') {
			addListenerMove(currMathsInput.cursorCanvas,selectTextMove);
			addListenerEnd(currMathsInput.cursorCanvas,selectTextStop);
		}
	} else {
		mathsInputMapCursorPos();
		currMathsInput.cursorPos = startCursorPos || Number(closestPos) || 0;
		//console.log(currMathsInput,currMathsInput.cursorPos,currMathsInput.cursorMap[currMathsInput.cursorPos],currMathsInput.textLoc);
		mathsInputCursorCoords();
		updateKeyboardCurrFont();
		showKeyboard2(true);
	}
	//shiftOn = false;
	//ctrlOn = false;
	//altOn = false;
	if (typeof currMathsInput.onInputStart === 'function') {
		currMathsInput.onInputStart(currMathsInput);
	}
}
function selectTextMove(e) {
	updateMouse(e);
	var closestPos = getClosestTextPos();
	//console.log(closestPos);
	if (currMathsInput.selectPos[1] !== closestPos) {
		currMathsInput.selectPos[1] = closestPos;
		//console.log(currMathsInput.selectPos);
		currMathsInput.selected = true;
		setSelectPositions();
		drawMathsInputText(currMathsInput);
		mathsInputMapCursorPos();		
	}
}
function selectTextStop(e) {
	//console.log(currMathsInput.selectPos);
	removeListenerMove(currMathsInput.cursorCanvas,selectTextMove);
	removeListenerEnd(currMathsInput.cursorCanvas,selectTextStop);
	if (currMathsInput.selectPos[0] == currMathsInput.selectPos[1]) {
		currMathsInput.cursorPos = currMathsInput.selectPos[0];
		currMathsInput.selectPos = [];
		currMathsInput.selected = false;
		setSelectPositions();
		mathsInputMapCursorPos();
		mathsInputCursorCoords();
	}
	updateKeyboardCurrFont();
	showKeyboard2(true);
}
function getClosestTextPos(mathsInput) {
	if (!mathsInput) mathsInput = currMathsInput;
	// search through text character locations for a mouse hit test
	var mousePos = [mouse.x-mathsInput.data[100],mouse.y-mathsInput.data[101]];
	//console.log(mathsInput);
	if (typeof mathsInput.cursorMap == 'undefined') {
		mathsInputMapCursorPos();
	}
	var map = mathsInput.cursorMap;
	var closestPos = 0;
	var closestDist;
	var vertDist;
	var closestVertDist;
	//console.log('getClosestTextPos()');
	//console.clear();
	for (var pos = 0; pos < map.length; pos++) {
		var loc = mathsInput.textLoc;
		for (var aa = 0; aa < map[pos].length; aa++) {
			loc = loc[map[pos][aa]];
		};
		
		/*	
		var ctx = mathsInput.ctx;
		ctx.strokeStyle = '#F0F';
		ctx.beginPath();
		ctx.moveTo(loc.left,loc.top);
		ctx.lineTo(loc.left,loc.top+loc.height);
		ctx.stroke();		
		*/
		
		if (!loc) continue;
		
		if (pos == 0) {
			closestDist = distancePointToLineSegment(mousePos,[loc.left,loc.top],[loc.left,loc.top+loc.height]);
			closestPos = pos;
			vertDist = Math.min(Math.abs(mousePos[1]-loc.top),Math.abs(mousePos[1]-(loc.top+loc.height)));
			if (mousePos[1] >= loc.top && mousePos[1] <= loc.top + loc.height) vertDist = 0;
			closestVertDist = vertDist;
		} else {
			var newDist = distancePointToLineSegment(mousePos,[loc.left,loc.top],[loc.left,loc.top+loc.height]);
			var newVertDist = Math.min(Math.abs(mousePos[1]-loc.top),Math.abs(mousePos[1]-(loc.top+loc.height)));
			if (mousePos[1] >= loc.top && mousePos[1] <= loc.top + loc.height) newVertDist = 0;
			if (newVertDist < closestVertDist || (newVertDist == closestVertDist && newDist < closestDist)) {
				closestVertDist = newVertDist;
				closestDist = newDist;
				closestPos = pos;
			}
		}
		
		//console.log(pos,loc.left,newDist,closestDist,closestPos)		
	}
	
	/*
	ctx.beginPath();
	ctx.moveTo(mousePos[0]-3,mousePos[1]-3);
	ctx.lineTo(mousePos[0]+3,mousePos[1]+3);
	ctx.moveTo(mousePos[0]-3,mousePos[1]+3);
	ctx.lineTo(mousePos[0]+3,mousePos[1]-3);		
	ctx.stroke();	
	*/
	//console.log(closestPos);
	return closestPos;
}
function endMathsInput(e) {
	if (!un(e) && !un(keyboardButton1) && !un(keyboardButton1[taskId]) && e.target == keyboardButton1[taskId]) return;
	if (!un(e) && !un(keyboardButton2) && !un(keyboardButton2[taskId]) && e.target == keyboardButton2[taskId]) return;
	if (currMathsInput.selected == true) {
		removeSelectTags();
		mathsInputMapCursorPos();
		currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
		currMathsInput.selectPos = [];
		mathsInputCursorCoords();
		currMathsInput.selected = false;
		removeSelectTags();		
	}
	deselectMathsInput(e);

	if (typeof currMathsInput.onInputEnd == 'function') {
		currMathsInput.onInputEnd(e);
	}
}
function deselectMathsInput(e,diffInput) {
	currMathsInput.preText = '';
	currMathsInput.postText = '';
	if (currMathsInput.selected == true) {
		removeSelectTags();
		mathsInputMapCursorPos();
		currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
		currMathsInput.selectPos = [];
		mathsInputCursorCoords();
		currMathsInput.selected = false;
		removeSelectTags();
	}	
	// test if the deselection is caused by a new input
	var diffInputTest = -1;
	if (typeof e == 'object' && e && typeof e.target == 'object' && e.target !== currMathsInput.canvas && !un(mathsInput[taskNum])) {
		for (var i = 0; i < mathsInput[taskNum].length; i++) {
			if (mathsInput[taskNum][i].cursorCanvas == e.target) {
				if (currMathsInput.canvas == e.target) {
					return; // indicates the currently active mathsInput has been reclicked - do nothing
				} else {
					diffInputTest = i;
				}
				break;
			}
		}
	}
	
	if ((typeof diffInput !== 'undefined' && diffInput == true) || diffInputTest > -1) {
	
	} else {
		hideKeyboard2(true);
		inputState = false;
		// remove event listeners for mathsInput 
		window.removeEventListener('keydown', hardKeyMathsInput, false);
		canvas.removeEventListener('mousedown', endMathsInput, false);
		canvas.removeEventListener('touchstart', endMathsInput, false);		
	}
		
	//currMathsInput.currBackColor = currMathsInput.backColor;
	/*
	currMathsInput.ctx.clearRect(0, 0, currMathsInput.data[2], currMathsInput.data[3]);
	if (currMathsInput.transparent == false && currMathsInput.backColor !== 'none') {
		currMathsInput.ctx.fillStyle = currMathsInput.backColor || '#FFF';
	}
	*/
	
	currMathsInput.canvas.style.backgroundColor = currMathsInput.backColor || 'transparent';
	if (currMathsInput.backColor == 'none') {
		currMathsInput.canvas.style.backgroundColor = 'transparent'
	}
	
	clearCorrectingInterval(mathsInputCursorBlinkInterval);
	inputCursorState = false
	blinking = false;
	
	currMathsInput.cursorctx.clearRect(0,0,1200,700);
	
	if ((typeof diffInput !== 'undefined' && diffInput == true) || diffInputTest > -1) {
		if (typeof currMathsInput.onInputEnd == 'function') {
			currMathsInput.onInputEnd();
		}
	}		
	if (typeof holderButton !== 'undefined') {
		for (var i = 0; i < 3; i++) {
			holderButton[i].removeEventListener('mousedown', endMathsInput, false);
			holderButton[i].removeEventListener('mousedown', endMathsInput, false);	
		}
	}
	var startAt = 0;
	if (taskKey[taskNum]) {startAt = taskKey[taskNum].length}
	function listenerForI(i) {
		taskObject[taskNum][i].removeEventListener('mousedown', endMathsInput, false);
		taskObject[taskNum][i].removeEventListener('touchstart', endMathsInput, false);		
	}	
	if (taskObject[taskNum]) {
		for (var i = startAt; i < taskObject[taskNum].length; i++) { // clicking any other object will also end the input
			listenerForI(i); //'scopes' the variable i
		}
	}
}

function setSelectPositions() {
	// check for a need to adjust each selectPos
	
	var selPos1 = clone(currMathsInput.cursorMap[currMathsInput.selectPos[0]]);
	if (typeof selPos1 !== 'undefined') {
		var txt = clone(currMathsInput.richText);
		for (var i = 0; i < selPos1.length - 1; i++) {txt = txt[selPos1[i]]};
		var txtSlice = txt.slice(0,selPos1[selPos1.length-1]);
		if (txtSlice.indexOf('<<selected:true>>') > -1) {
			selPos1[selPos1.length-1] -= 17;
		}
		if (txtSlice.indexOf('<<selected:false>>') > -1) {
			selPos1[selPos1.length-1] -= 18;
		}
	}
	
	var selPos2 = clone(currMathsInput.cursorMap[currMathsInput.selectPos[1]]); 
	if (typeof selPos2 !== 'undefined') {
		var txt = clone(currMathsInput.richText);
		for (var i = 0; i < selPos2.length - 1; i++) {txt = txt[selPos2[i]]};
		var txtSlice = txt.slice(0,selPos2[selPos2.length-1]);
		if (txtSlice.indexOf('<<selected:true>>') > -1) {
			selPos2[selPos2.length-1] -= 17;
		}
		if (txtSlice.indexOf('<<selected:false>>') > -1) {
			selPos2[selPos2.length-1] -= 18;
		}
	}
	
	removeSelectTags();
	
	if (arraysEqual(currMathsInput.selectPos,[]) == false) {
		if (currMathsInput.selectPos[0] == currMathsInput.selectPos[1]) {
			insertTag('<<selected:true>><<selected:false>>',selPos1);
		} else if (currMathsInput.selectPos[0] > currMathsInput.selectPos[1]) {
			insertTag('<<selected:false>>',selPos1);
			insertTag('<<selected:true>>',selPos2);	
		} else if (currMathsInput.selectPos[0] < currMathsInput.selectPos[1]) {
			insertTag('<<selected:false>>',selPos2);
			insertTag('<<selected:true>>',selPos1);
		}
	}
		
	function insertTag(insertion,cursorPos) {
		// get the relevant string from currMathsInput.richText
		var text = currMathsInput.richText;
		for (var aa = 0; aa < cursorPos.length - 1; aa++) {
			text = text[cursorPos[aa]];
		}
		// pos is position of cursor
		var pos = cursorPos[cursorPos.length - 1];
				
		// adjust pos to account for breakPoints
		if (typeof currMathsInput.breakPoints == 'object') {
			for (var k = 0; k < currMathsInput.breakPoints.length - 1; k++) {
				var breakPoint = currMathsInput.allMap[currMathsInput.breakPoints[k]];
				if (breakPoint[0] == cursorPos[0] && breakPoint[1] < cursorPos[1]) {
					pos--;
				}
			}
		}
		// check that a tag is not being split - if so adjust pos
		var leftText = text.slice(0,pos);
		var rightText = text.slice(pos);
		var tagLeft = false;
		var tagLeftCount = 0;
		for (var i = 0; i < leftText.length; i++) {
			tagLeftCount++;
			if (leftText.slice(leftText.length - i).indexOf('>>') == 0) break;
			if (leftText.slice(leftText.length - i).indexOf('<<') == 0) {
				tagLeft = true;
				break;
			}
		}
		var tagRight = false;
		var tagRightCount = 0;
		for (var j = 0; j < rightText.length; j++) {
			tagRightCount++;
			if (rightText.slice(j).indexOf('<<') == 0) break;
			if (rightText.slice(j).indexOf('>>') == 0) {
				tagRight = true;
				break;
			}
		}
		if (tagLeft == true && tagRight == true) {
			if (tagLeftCount <= tagRightCount) {
				pos -= tagLeftCount;	
			} else {
				pos += tagRightCount;
			}
		}
		var leftText = text.slice(0,pos);
		var rightText = text.slice(pos);
		if (leftText.slice(-1) == '<' && rightText.slice(0,1) == '<' && rightText.slice(0,2) !== '<<') pos--;
		if (leftText.slice(-1) == '>' && leftText.slice(-2) !== '>>' && rightText.slice(0,1) == '>') pos++;	
		var textBefore = text.slice(0,pos);
		var textAfter = text.slice(pos);
				
		text = textBefore + insertion + textAfter;
		// replace the string
		var evalString = 'currMathsInput.richText' 
		for (aa = 0; aa < cursorPos.length - 1; aa++) {
			evalString += '[' + cursorPos[aa] + ']';
		}
		eval(evalString + ' = text;');
	}
}
function removeSelectTags() {
	var map1;
	var map2;
	var pos = [];
	function arrayHandler(array) {
		pos.push(0);
		for (var l = array.length - 1; l >= 0; l--) {
			pos[pos.length-1] = l;
			if (typeof array[l] == 'string') {
				array[l] = stringHandler(array[l]);
			} else {	
				array[l] = arrayHandler(array[l]);
			}
		}
		pos.pop();
		return array;
	}
	function stringHandler(string) {
		//console.log(string,JSON.stringify(pos));
		for (var j = string.length - 1; j >= 0; j--) {
			var slice = string.slice(j);
			if (slice.indexOf('<<selected:false>>') == 0) {
				string = string.slice(0,j)+string.slice(j+slice.indexOf('>>')+2);
				if (typeof map1 !== 'undefined' && arraysEqual(pos,map1) == true && map2 > j) {
					map2 = Math.max(0,map2-18);
				}
			}
			if (slice.indexOf('<<selected:true>>') == 0) {
				string = string.slice(0,j)+string.slice(j+slice.indexOf('>>')+2);
				if (typeof map1 !== 'undefined' && arraysEqual(pos,map1) == true && map2 > j) {
					map2 = Math.max(0,map2-17);
				}
			}
		}
		return string;
	}	

	//console.log(JSON.stringify(currMathsInput.cursorMap[currMathsInput.cursorPos]));
	if (typeof currMathsInput.cursorPos == 'number') {
		map1 = currMathsInput.cursorMap[currMathsInput.cursorPos];
		if (typeof map1 !== 'undefined') {
			map2 = map1[map1.length-1];
			map1 = map1.slice(0,-1);
			//console.log(JSON.stringify(map1),map2);
		}
	}
	
	currMathsInput.richText = arrayHandler(currMathsInput.richText);


	//console.log('---',map2);
	if (typeof map2 !== 'undefined') {
		currMathsInput.cursorMap[currMathsInput.cursorPos][currMathsInput.cursorMap[currMathsInput.cursorPos].length-1] = map2;
	}
	// adjust cursorPos if necessary

}
function removeSelectTagsFromArray(textArray) {
	var map1;
	var map2;
	var pos = [];
	function arrayHandler(array) {
		pos.push(0);
		for (var l = array.length - 1; l >= 0; l--) {
			pos[pos.length-1] = l;
			if (typeof array[l] == 'string') {
				array[l] = stringHandler(array[l]);
			} else {	
				array[l] = arrayHandler(array[l]);
			}
		}
		pos.pop();
		return array;
	}
	function stringHandler(string) {
		//console.log(string,JSON.stringify(pos));
		for (var j = string.length - 1; j >= 0; j--) {
			var slice = string.slice(j);
			if (slice.indexOf('<<selected:false>>') == 0) {
				string = string.slice(0,j)+string.slice(j+slice.indexOf('>>')+2);
				if (typeof map1 !== 'undefined' && arraysEqual(pos,map1) == true && map2 > j) {
					map2 = Math.max(0,map2-18);
				}
			}
			if (slice.indexOf('<<selected:true>>') == 0) {
				string = string.slice(0,j)+string.slice(j+slice.indexOf('>>')+2);
				if (typeof map1 !== 'undefined' && arraysEqual(pos,map1) == true && map2 > j) {
					map2 = Math.max(0,map2-17);
				}
			}
		}
		return string;
	}	
	
	return arrayHandler(textArray);
}
function deleteSelected() {
	var sel = false;
	currMathsInput.richText = arrayHandler(currMathsInput.richText);	
	
	function arrayHandler(array) {
		for (var l = 0; l < array.length; l++) {
			if (typeof array[l] == 'string') {
				if (l > 0 || array.length == 1 || ['frac','power','pow','subs','subscript','sin','cos','tan','ln','log','logBase','sin-1','cos-1','tan-1','abs','exp','root','sqrt','sigma1','sigma2','int1','int2','recurring','bar','hat','vectorArrow','colVector2d','colVector3d','mixedNum','lim'].indexOf(array[l]) == -1) {
					array[l] = stringHandler(array[l]);
				}
			} else {
				var preSel = false;
				if (sel == true) {preSel = true};
				array[l] = arrayHandler(array[l]);
				if (sel == true && preSel == true) {
					array.splice(l,1);
					l--;
				}
			}
		}
		return array;
	}
	function stringHandler(string) {
		var delPos = [];
		if (sel == true) delPos[0] = 0;
		var savedTags = '';
		for (var j = 0; j < string.length; j++) {
			var slice = string.slice(j);
			if (slice.indexOf('<<selected:true>>') == 0) {
				delPos[0] = j;
				sel = true;
			}
			if (slice.indexOf('<<selected:false>>') == 0) {
				delPos[1] = j + 18;
				sel = false;
 			}
			if (sel == true && (slice.indexOf('<<font') == 0 || slice.indexOf('<<bold') == 0 || slice.indexOf('<<italic') == 0 || slice.indexOf('<<color') == 0 || slice.indexOf('<<back') == 0)) {
				savedTags += slice.slice(0,slice.indexOf('>>')+2);
			}
		}
		if (delPos.length > 0) {
			if (delPos.length == 1) {
				return string.slice(0,delPos[0])+savedTags;
			} else {
				return string.slice(0,delPos[0])+savedTags+string.slice(delPos[1]);
			}
		} else {
			return string;
		}
	}
}

var arrayString = '';

function mathsInputMapCursorPos() { // (re-)builds cursor map
	//console.log(JSON.stringify(currMathsInput.richText,null, 4));
	currMathsInput.richText = reduceTags(currMathsInput.richText);
	currMathsInput.richText = combineSpacesCursor(currMathsInput.richText);
		
	// create new cursor map
	currMathsInput.textLoc = [];
	drawMathsInputText(currMathsInput);
	currMathsInput.cursorMap = mapArray(currMathsInput.textLoc,false);
	
	// create new allMap - this includes all markup tag characters
	currMathsInput.allMap = mapArray(currMathsInput.textLoc,true); 
	
	// move cursor positions in cursorMap from end to beginning of markup tags (except for beginning)
	var cursorMap = currMathsInput.cursorMap;
	
	//console.log(JSON.stringify(cursorMap));
	
	for (var i = 1; i < cursorMap.length; i++) {
		
		// get text element
		var richText = currMathsInput.richText;
		for (var j = 0; j < cursorMap[i].length - 1; j++) richText = richText[cursorMap[i][j]];
	
		// char is position of cursor
		var char = cursorMap[i][cursorMap[i].length-1];

		// adjust char to account for breakPoints
		if (typeof currMathsInput.breakPoints == 'object') {
			for (var k = 0; k < currMathsInput.breakPoints.length - 1; k++) {
				var breakPoint = currMathsInput.allMap[currMathsInput.breakPoints[k]];
				if (breakPoint[0] == cursorMap[i][0] && breakPoint[1] < cursorMap[i][1]) {
					char--;
				}
			}
		}
	
		// if proceeded by a tag
		if (richText.slice(char-2).indexOf('>>') == 0 && richText.slice(char-6).indexOf('<<br>>') !== 0) {
			
			// get text to the left of char
			var leftText = richText.slice(0,char);
		
			// get tagCharCount to the left of char
			var tagCharCount = 0;
			for (var j = 0; j < leftText.length; j++) {
				if (richText.slice(char-j,char).indexOf('<<') == 0 && (leftText.slice(char-j-2,char).indexOf('>>') !== 0 || leftText.slice(char-j-6,char).indexOf('<<br>>') == 0)) {
					tagCharCount = j;
					break;
				}
			}
			
			// check that it's not the very beginning
			if (cursorMap[i][0] == 0 && cursorMap[i][1] == tagCharCount) continue;
			
			// alter the cursorMap by tagCharCount
			currMathsInput.cursorMap[i][currMathsInput.cursorMap[i].length-1] -= tagCharCount;
		}
		
		
	}
	
	// update currMathsInput.text to be the same as currMathsInput.richText without any markuptags
	currMathsInput.text = clone(currMathsInput.richText);
	for (var p = 0; p < currMathsInput.text.length; p++) {
		currMathsInput.text[p] = removeTags(currMathsInput.text[p]);
	}
}
function combineSpacesCursor(array) {
	//console.log(array.length);
	if (array.length > 1) {
		for (var gg = array.length - 1; gg >= 0; gg--) {
			//console.log(gg, array[gg], typeof array[gg]);
			if (typeof array[gg] == 'object') {
				arrayString += '[' + gg + ']';
				combineSpacesCursor(array[gg]);
			} else {
				if (gg < array.length - 1 && typeof array[gg] == 'string' && typeof array[gg+1] == 'string') {
					eval('currMathsInput.richText' + arrayString + '[' + gg + '] += currMathsInput.richText' + arrayString + '[' + (gg+1) + ']');
					eval('currMathsInput.richText' + arrayString + '.splice(gg+1, 1);');
				}
			}
		}
	}
	arrayString = arrayString.slice(0, arrayString.lastIndexOf('[') - arrayString.length);
	return array;
}
function combineSpacesTextArray(array) {
	if (array.length > 1) {
		for (var i = array.length - 1; i >= 0; i--) {
			if (typeof array[i] == 'object') {
				if (i < array.length - 1 && typeof array[i] == 'string' && typeof array[i+1] == 'string') {
					array[i] = array[i] + array[i+1];
					array.splice(i+1,1);
				}				
			} else {
				combineSpacesTextArray(array[i]);
			}
		}
	}
	return array;
}
function removeTags(elem) {
	if (typeof elem == 'string') {
		//remove markup tags
		for (var char = elem.length-1; char > -1; char--) {
			if (elem.slice(char).indexOf('>>') == 0 && elem.slice(char-1).indexOf('>>>') !== 0) {
				for (var char2 = char-2; char2 > -1; char2--) {
					if (elem.slice(char2).indexOf('<<') == 0) {
						elem = elem.slice(0,char2) + elem.slice(char+2);
						char = char2;
						break;
					}
				}
			}
		}
	}
	return elem;
}

function arraysEqual(array1,array2) {
	if (typeof array1 == 'undefined' || typeof array2 == 'undefined') return false
	if (array1.length !== array2.length) return false;
	for (var arr = 0; arr < array1.length; arr++) {
		if (array1[arr] !== array2[arr]) return false;	
	}
	return true;
}
function mapArray(array,includeAll) {
	var mapString = '';
	var map = [];
	
	/*if (includeAll === false) {
		for (var i = 0; i < array.length; i++) {
			for (var j = 0; j < array[i].length; j++) {
				if (typeof array[i][j].markupTag == 'undefined' || array[i][j].markupTag == false) {
					console.log(i,j, JSON.stringify(array[i][j]));
				}
			}
		}
	}*/
	
	function mapArray2(array,includeAll) {
		for (var aa = 0; aa < array.length; aa++) {
			if (typeof array[aa] !== 'undefined') {
				if (typeof array[aa].left == 'undefined' && typeof array[aa] !== 'boolean') {
					if (mapString == '') {mapString = String(aa)} else {mapString = mapString + ',' + String(aa)}
					mapArray2(array[aa], includeAll);
				} else if (includeAll == true || typeof array[aa].markupTag == 'undefined' || array[aa].markupTag == false) {
					if (mapString == '') {mapString = String(aa)} else {mapString = mapString + ',' + String(aa)}
					var mapArr = mapString.split(',');
					for (var bb = 0; bb < mapArr.length; bb++) {mapArr[bb] = Number(mapArr[bb])}
					map.push(mapArr);
					mapString = mapString.slice(0, mapString.lastIndexOf(',') - mapString.length);
				}
			}
		}
		mapString = mapString.slice(0, mapString.lastIndexOf(',') - mapString.length);
	}	
	
	for (var aa = 0; aa < array.length; aa++) {
		if (typeof array[aa] !== 'undefined') {
			if (typeof array[aa].left == 'undefined') {
				if (mapString == '') {mapString = String(aa)} else {mapString = mapString + ',' + String(aa)}
				mapArray2(array[aa], includeAll);
			} else if (includeAll == true || typeof array[aa].markupTag == 'undefined' || array[aa].markupTag == false) {
				if (mapString == '') {mapString = String(aa)} else {mapString = mapString + ',' + String(aa)}
				var mapArr = mapString.split(',');
				for (var bb = 0; bb < mapArr.length; bb++) {mapArr[bb] = Number(mapArr[bb])}
				map.push(mapArr);
			}
			mapString = '';
		}
	}

	return map;
}

function mathsInputCursorCoords() { // updates cursor coordinates
	drawMathsInputText(currMathsInput);
	var char;
	var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
	
	if (typeof cursorPos == 'undefined') return;
	
	char = currMathsInput.textLoc;	
	for (var aa = 0 ; aa < cursorPos.length; aa++) {
		char = char[cursorPos[aa]];
	}

	mathsInputCursor.x = char.left;
	mathsInputCursor.top = char.top;
	mathsInputCursor.bottom = char.top + char.height;
	
	//logText(true);
	
	//console.log('mathsInputCursor:',mathsInputCursor);
	
	inputCursorState = false;
	clearCorrectingInterval(mathsInputCursorBlinkInterval);
	drawMathsInputText(currMathsInput);
	mathsInputCursorBlink();
	mathsInputCursorBlinkInterval = setCorrectingInterval(function(){mathsInputCursorBlink()}, 600);
	blinking = true;
	currMathsInput.stringJS = createJsString();
	if (typeof textMenu !== 'undefined' && typeof textMenu[taskId] !== 'undefined' && typeof textMenu[taskId].update == 'function') textMenu[taskId].update();
}
var showCursorPos = false;
function adjustForBreakPointsAllMap(pos) {
	//console.log('pos:',pos);
	if (typeof currMathsInput.breakPoints == 'object') {
		//console.log('pos:',pos);						
		var map = currMathsInput.allMap[pos];						
		for (var i = 0; i < currMathsInput.breakPoints.length - 1; i++) {
			var iBreak = currMathsInput.allMap[currMathsInput.breakPoints[i]];
			if (iBreak[0] == map[0] && iBreak[1] < map[1]) {
				pos--;
			}
		}
		//console.log('pos:',pos);
	}
	return pos;
}
function adjustForBreakPoints(pos,map,breakPoints) {
	if (typeof pos == 'undefined') pos = currMathsInput.cursorPos;
	if (typeof map == 'undefined') map = currMathsInput.cursorMap[currMathsInput.cursorPos];
	if (typeof breakPoints == 'undefined') breakPoints = currMathsInput.breakPoints; 
	
	if (typeof breakPoints == 'object') {						
		for (var i = 0; i < breakPoints.length - 1; i++) {
			var iBreak = currMathsInput.allMap[breakPoints[i]];
			if (iBreak[0] == map[0] && iBreak[1] < map[1]) {
				pos--;
			}
		}
	}
	return pos;
}
function mathsInputCursorBlink() {
	if (inputCursorState == true) {inputCursorState = false} else {inputCursorState = true};

	currMathsInput.cursorctx.clearRect(0,0,1200,700);
	currMathsInput.cursorCanvas.style.zIndex = currMathsInput.canvas.style.zIndex + 1;
	
	if (showCursorPos == true) {
		for (var i = 0; i < currMathsInput.cursorMap.length; i++) {
			var cPos = currMathsInput.textLoc;
			
			for (var j = 0; j < currMathsInput.cursorMap[i].length; j++) {
				cPos = cPos[currMathsInput.cursorMap[i][j]];	
			}
						
			// adjust cPos to account for difference between canvas and cursor canvas positions
			cPos.left += (currMathsInput.data[100] - currMathsInput.cursorData[100]);
			cPos.top += (currMathsInput.data[101] - currMathsInput.cursorData[101]);
			
			//console.log(cPos);
			
			currMathsInput.cursorctx.save();
			currMathsInput.cursorctx.strokeStyle = '#F00';
			currMathsInput.cursorctx.lineWidth = 2;
			currMathsInput.cursorctx.beginPath();
			currMathsInput.cursorctx.moveTo(cPos.left, cPos.top);
			currMathsInput.cursorctx.lineTo(cPos.left, cPos.top + cPos.height);
			currMathsInput.cursorctx.closePath();
			currMathsInput.cursorctx.stroke();
			currMathsInput.cursorctx.restore();
		}
	} else if (inputCursorState == true && currMathsInput.selected == false) {
		var hAdjust = currMathsInput.data[100] - currMathsInput.cursorData[100];
		var vAdjust = currMathsInput.data[101] - currMathsInput.cursorData[101];
		currMathsInput.cursorctx.save();
		currMathsInput.cursorctx.strokeStyle = currMathsInput.textColor;
		currMathsInput.cursorctx.lineWidth = 2;
		currMathsInput.cursorctx.beginPath();
		currMathsInput.cursorctx.moveTo(hAdjust + mathsInputCursor.x, vAdjust + mathsInputCursor.top);
		currMathsInput.cursorctx.lineTo(hAdjust + mathsInputCursor.x, vAdjust + mathsInputCursor.bottom);
		currMathsInput.cursorctx.closePath();
		currMathsInput.cursorctx.stroke();
		currMathsInput.cursorctx.restore();
	}
}

//var shiftOn = false;
//window.addEventListener('keyup', shiftKeyUp, false);	
/*function shiftKeyUp(e) {
	e.preventDefault();
	if (e.keyCode == 16) {
		shiftOn = false;
	}
}*/
function hardKeyMathsInput(e) { // if a key is pressed via the hardware keyboard
	e.preventDefault();
	if (inputState == true) {
		//eval('inputNum='+taskTag+'input.indexOf(currentInput)');
		var charCode = e.keyCode; // determine which key has been pressed
		var keysToIgnore = [16,17,18,27,33,34,35,36,46,112,113,114,115,116,117,118,119,120,121,122,123,144,223];
		if (e.getModifierState('Control')) {
			if (charCode == 88) { //CTRL-x
				mathsInputCut();
			} else if (charCode == 67) { //CTRL-c
				mathsInputCopy();
			} else if (charCode == 86) { //CTRL-v
				mathsInputPaste();
			}
			return;
		}
		if (e.getModifierState('Alt')) return;		
		switch (charCode) {
			case 37 : // left arrow
				currMathsInput.preText = '';
				currMathsInput.postText = '';
				if (e.getModifierState('Shift') == true && currMathsInput.cursorPos > 0) {
					if (currMathsInput.selected == true) {
						currMathsInput.selectPos[1] = [currMathsInput.cursorPos-1];
						setSelectPositions();
						drawMathsInputText(currMathsInput);
						mathsInputMapCursorPos();
						currMathsInput.cursorPos--;
					} else {
						currMathsInput.selected = true;
						currMathsInput.selectPos = [currMathsInput.cursorPos,currMathsInput.cursorPos-1];
						setSelectPositions();
						drawMathsInputText(currMathsInput);
						mathsInputMapCursorPos();
						currMathsInput.cursorPos--;
					}
				} else if (currMathsInput.selected == true) {
					removeSelectTags();
					mathsInputMapCursorPos();
					currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
					currMathsInput.selectPos = [];
					mathsInputCursorCoords();
					currMathsInput.selected = false;
					removeSelectTags();
				} else if (currMathsInput.cursorPos > 0) {
					currMathsInput.cursorPos--;
					mathsInputCursorCoords();
				} else {
					mathsInputTabPrev();
				}
				break;
			case 38 : // up arrow
				currMathsInput.preText = '';
				currMathsInput.postText = '';
				if (e.getModifierState('Shift') == true) {
					if (currMathsInput.selected == false) {
						currMathsInput.selectPos[0] = currMathsInput.cursorPos;
					}
				} else if (currMathsInput.selected == true) {
					removeSelectTags();
					mathsInputMapCursorPos();
					currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
					currMathsInput.selectPos = [];
					mathsInputCursorCoords();
					currMathsInput.selected = false;
					removeSelectTags();	
				}
				var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
				// get the parent of the current string
				var parent = currMathsInput.richText;
				for (var i = 0; i < cursorPos.length - 3; i++) {parent = parent[cursorPos[i]]};
				if (parent[0] == 'frac' && cursorPos[cursorPos.length - 3] == 2) {
					currMathsInput.cursorPos -= cursorPos[cursorPos.length - 1];
					currMathsInput.cursorPos--;
					mathsInputCursorCoords();
				} else {
					// check if there is a row above
					var lowerBreakPoints = [];
					for (var i = 0; i < currMathsInput.breakPoints.length - 1; i++) {
						if (currMathsInput.allMap[currMathsInput.breakPoints[i]][0] < currMathsInput.cursorMap[currMathsInput.cursorPos][0] || (currMathsInput.allMap[currMathsInput.breakPoints[i]][0] == currMathsInput.cursorMap[currMathsInput.cursorPos][0] && currMathsInput.allMap[currMathsInput.breakPoints[i]][1] < currMathsInput.cursorMap[currMathsInput.cursorPos][1])) {
							lowerBreakPoints.unshift(currMathsInput.allMap[currMathsInput.breakPoints[i]]);
						}
					}
					if (lowerBreakPoints.length == 0) {
						// cursor is on top line
						if (shiftOn == true) {
							if (currMathsInput.selected == true) {
								currMathsInput.selectPos[1] = 0;
							} else {
								currMathsInput.selectPos = [currMathsInput.cursorPos,0];
								currMathsInput.selected = true;
							}
							setSelectPositions();
							drawMathsInputText(currMathsInput);
							mathsInputMapCursorPos();
							currMathsInput.cursorPos = 0;					
						}
					} else {
						// get top point of current cursor position
						var textLoc = currMathsInput.textLoc;
						for (var i = 0; i < currMathsInput.cursorMap[currMathsInput.cursorPos].length; i++) {
							textLoc = textLoc[currMathsInput.cursorMap[currMathsInput.cursorPos][i]];	
						}
						var pos = [textLoc.left,textLoc.top];
						// search through textLocs
						var closestPos;
						var closestDist; 
						for (var i = 0; i < currMathsInput.cursorMap.length; i++) {
							// position must be less than lowerBreakPoints[0]
							if (currMathsInput.cursorMap[i][0] < lowerBreakPoints[0][0] || (currMathsInput.cursorMap[i][0] == lowerBreakPoints[0][0] && currMathsInput.cursorMap[i][1] < lowerBreakPoints[0][1])) {						
								// if it is above the current line
								
								// position must not be less than lowerBreakPoints[1]
								if (lowerBreakPoints.length > 1) {
									if (currMathsInput.cursorMap[i][0] < lowerBreakPoints[1][0] || (currMathsInput.cursorMap[i][0] == lowerBreakPoints[1][0] && currMathsInput.cursorMap[i][1] < lowerBreakPoints[1][1])) continue;
								}

								var loc = currMathsInput.textLoc;
								for (var j = 0; j < currMathsInput.cursorMap[i].length; j++) {
									loc = loc[currMathsInput.cursorMap[i][j]];	
								}
								if (typeof closestPos == 'undefined') {
									closestPos = i;
									closestDist = distancePointToLineSegment(pos,[loc.left,loc.top],[loc.left,loc.top+loc.height]);
								} else {
									var newDist = distancePointToLineSegment(pos,[loc.left,loc.top],[loc.left,loc.top+loc.height]);
									if (newDist < closestDist) {
										closestPos = i;
										closestDist = newDist;	
									}
								}
							}
						}
						if (shiftOn == true) {
							if (currMathsInput.selected == true) {
								currMathsInput.selectPos[1] = closestPos;
							} else {
								currMathsInput.selectPos = [currMathsInput.cursorPos,closestPos];
								currMathsInput.selected = true;
							}
							setSelectPositions();
							drawMathsInputText(currMathsInput);
							mathsInputMapCursorPos();
							currMathsInput.cursorPos = closestPos;
						} else {
							currMathsInput.cursorPos = closestPos;
							mathsInputCursorCoords();
						}
					}
				}
				break;
			case 39 : // right arrow
				currMathsInput.preText = '';
				currMathsInput.postText = '';			
				if (e.getModifierState('Shift') == true && currMathsInput.cursorPos > 0) {
					if (currMathsInput.selected == true) {
						currMathsInput.selectPos[1] = [currMathsInput.cursorPos+1];
						setSelectPositions();
						drawMathsInputText(currMathsInput);
						mathsInputMapCursorPos();
						currMathsInput.cursorPos++;
					} else {
						currMathsInput.selected = true;
						currMathsInput.selectPos = [currMathsInput.cursorPos,currMathsInput.cursorPos+1];
						setSelectPositions();
						drawMathsInputText(currMathsInput);
						mathsInputMapCursorPos();
						currMathsInput.cursorPos++;
					}
				} else if (currMathsInput.selected == true) {
					removeSelectTags();
					mathsInputMapCursorPos();
					currMathsInput.cursorPos = Math.max(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
					currMathsInput.selectPos = [];
					mathsInputCursorCoords();
					currMathsInput.selected = false;
					removeSelectTags();
				} else if (currMathsInput.cursorPos < currMathsInput.cursorMap.length - 1) {
					currMathsInput.cursorPos++;
					mathsInputCursorCoords();
				} else {
					mathsInputTabNext();
				}
				break;
			case 40 : // down arrow
				currMathsInput.preText = '';
				currMathsInput.postText = '';
				if (e.getModifierState('Shift') == true) {
					if (currMathsInput.selected == false) {
						currMathsInput.selectPos[0] = currMathsInput.cursorPos;
					}
				} else if (currMathsInput.selected == true) {
					removeSelectTags();
					mathsInputMapCursorPos();
					currMathsInput.cursorPos = Math.max(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
					currMathsInput.selectPos = [];
					mathsInputCursorCoords();
					currMathsInput.selected = false;
					removeSelectTags();
				}
				var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
				// get the parent of the current string
				var parent = currMathsInput.richText;
				for (var aa = 0; aa < cursorPos.length - 3; aa++) {parent = parent[cursorPos[aa]]};
				if (parent[0] == 'frac' && cursorPos[cursorPos.length - 3] == 1) {
					// move to the beginning of the denominator text
					do {
						currMathsInput.cursorPos++;
						var cursorPos2 = currMathsInput.cursorMap[currMathsInput.cursorPos];
						// get the parent of the cursorPos
						var parent2 = currMathsInput.richText;
						for (var aa = 0; aa < cursorPos2.length - 3; aa++) {parent2 = parent2[cursorPos2[aa]]};
					} while ((parent2 !== parent) || (parent2 == parent && cursorPos2[cursorPos.length - 3] !== 2));
					// move to the end of the denominator text					
					do {
						currMathsInput.cursorPos++;
						var cursorPos2 = currMathsInput.cursorMap[currMathsInput.cursorPos];
					} while (cursorPos2.length >= cursorPos.length);
					currMathsInput.cursorPos--;
					mathsInputCursorCoords();
				} else {
					var higherBreakPoints = [];
					for (var i = 0; i < currMathsInput.breakPoints.length - 1; i++) {
						if (currMathsInput.allMap[currMathsInput.breakPoints[i]][0] > currMathsInput.cursorMap[currMathsInput.cursorPos][0] || (currMathsInput.allMap[currMathsInput.breakPoints[i]][0] == currMathsInput.cursorMap[currMathsInput.cursorPos][0] && currMathsInput.allMap[currMathsInput.breakPoints[i]][1] > currMathsInput.cursorMap[currMathsInput.cursorPos][1])) {
							higherBreakPoints.push(currMathsInput.allMap[currMathsInput.breakPoints[i]]);
						}
					}
					if (higherBreakPoints.length == 0) {
						// cursor is on bottom line
						if (shiftOn == true) {
							if (currMathsInput.selected == true) {
								currMathsInput.selectPos[1] = currMathsInput.cursorMap.length - 1;
							} else {
								currMathsInput.selectPos = [currMathsInput.cursorPos,currMathsInput.cursorMap.length - 1];
								currMathsInput.selected = true;
							}
							setSelectPositions();
							drawMathsInputText(currMathsInput);
							mathsInputMapCursorPos();
							currMathsInput.cursorPos = currMathsInput.cursorMap.length - 1;					
						}
					} else {
						// get bottom point of current cursor position
						var textLoc = currMathsInput.textLoc;
						for (var i = 0; i < currMathsInput.cursorMap[currMathsInput.cursorPos].length; i++) {
							textLoc = textLoc[currMathsInput.cursorMap[currMathsInput.cursorPos][i]];	
						}
						var pos = [textLoc.left,textLoc.top+textLoc.height];
						// search through textLocs
						var closestPos;
						var closestDist; 
						for (var i = 0; i < currMathsInput.cursorMap.length; i++) {
							// position must be more than higherBreakPoints[0]
							if (currMathsInput.cursorMap[i][0] > higherBreakPoints[0][0] || (currMathsInput.cursorMap[i][0] == higherBreakPoints[0][0] && currMathsInput.cursorMap[i][1] > higherBreakPoints[0][1])) {						
								// if it is above the current line
								
								// position must not be less than higherBreakPoints[1]
								if (higherBreakPoints.length > 1) {
									if (currMathsInput.cursorMap[i][0] > higherBreakPoints[1][0] || (currMathsInput.cursorMap[i][0] == higherBreakPoints[1][0] && currMathsInput.cursorMap[i][1] > higherBreakPoints[1][1])) continue;
								}
								var loc = currMathsInput.textLoc;
								for (var j = 0; j < currMathsInput.cursorMap[i].length; j++) {
									loc = loc[currMathsInput.cursorMap[i][j]];	
								}
								if (typeof closestPos == 'undefined') {
									closestPos = i;
									closestDist = distancePointToLineSegment(pos,[loc.left,loc.top],[loc.left,loc.top+loc.height]);
								} else {
									var newDist = distancePointToLineSegment(pos,[loc.left,loc.top],[loc.left,loc.top+loc.height]);
									if (newDist < closestDist) {
										closestPos = i;
										closestDist = newDist;	
									}
								}
							}
						}
						if (shiftOn == true) {
							if (currMathsInput.selected == true) {
								currMathsInput.selectPos[1] = closestPos;
							} else {
								currMathsInput.selectPos = [currMathsInput.cursorPos,closestPos];
								currMathsInput.selected = true;
							}
							setSelectPositions();
							drawMathsInputText(currMathsInput);
							mathsInputMapCursorPos();
							currMathsInput.cursorPos = closestPos;
						} else {
							currMathsInput.cursorPos = closestPos;
							mathsInputCursorCoords();
						}
					}
						
				}
				break;
			case 8 : // backspace key pressed
				currMathsInput.preText = '';
				currMathsInput.postText = '';
				if (currMathsInput.selected == true) {
					currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
					currMathsInput.selPos = [];
					currMathsInput.selected = false;
					deleteSelected();
					removeSelectTags();
					drawMathsInputText(currMathsInput);
					mathsInputMapCursorPos();
					mathsInputCursorCoords();					
				} else if (currMathsInput.cursorPos > 0) {
					removeSelectTags();
					// get the relevant string from currMathsInput.richText
					// ie. currMathsInput.richText[cursorPos[0]][cursorPos[1]]...[cursorPos[n]]
					var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
					var pos = cursorPos[cursorPos.length - 1];
					pos = adjustForBreakPoints(pos);
					
					var text = currMathsInput.richText;
					for (var i = 0; i < cursorPos.length - 1; i++) {text = text[cursorPos[i]]};
					
					var parent;
					if (cursorPos.length > 1) {
						parent = currMathsInput.richText;
						for (var i = 0; i < cursorPos.length - 2; i++) {parent = parent[cursorPos[i]]};
					}
					var grandParent;
					if (cursorPos.length > 2) {
						grandParent = currMathsInput.richText;
						for (var i = 0; i < cursorPos.length - 3; i++) {grandParent = grandParent[cursorPos[i]]};
					}
					
					logMe('br', 'input');
					logMeG('currMathsInput.richText', 'input');
					logMeG('currMathsInput.cursorMap', 'input');
					logMeG('currMathsInput.cursorPos', 'input');					
					logMe('cursorPos', cursorPos, 'input');
					logMe('text', text, 'input');
					logMe('parent', parent, 'input');
					logMe('grandParent', grandParent, 'input');
					
					if (text !== '') {
						if (pos !== 0) {
							//console.clear();
							//console.log(1,text,pos,text.slice(pos-1));
							if (text.slice(pos-6).indexOf('<<br>>') == 0) {
								text = text.slice(0, pos-6) + text.slice(pos);
							} else {
								text = text.slice(0, pos-1) + text.slice(pos);
							}
							//console.log(2,text);
							// replace the string
							var evalString = 'currMathsInput.richText' 
							for (var aa = 0; aa < cursorPos.length - 1; aa++) {
								// ugly string creation apprach in order to use eval()
								evalString += '[' + cursorPos[aa] + ']';
							}
							eval(evalString + ' = text;');
						}
					} else {
						if (parent.length == 1) { // ie. empty string is only sub-element  
							var elemsOneParam = ['sqrt', 'pow', 'power', 'subs', 'subscript', 'sin', 'cos', 'tan', 'sin-1', 'cos-1', 'tan-1', 'log', 'ln', 'abs', 'exp', 'sigma1', 'int1', 'vectorArrow', 'bar', 'hat', 'recurring'];
							var elemsTwoParams = ['root', 'frac', 'logBase', 'colVector2d', 'lim'];
							var elemsThreeParams = ['sigma2', 'int2', 'colVector3d', 'mixedNum'];
							if (elemsOneParam.indexOf(grandParent[0]) > -1 || (elemsTwoParams.indexOf(grandParent[0]) > -1 && cursorPos[cursorPos.length - 3] == 1) || (elemsThreeParams.indexOf(grandParent[0]) > -1 && cursorPos[cursorPos.length - 3] == 1)) { // conditions to delete 					
								// replace grandParent with "";
								var evalString = 'currMathsInput.richText' 
								for (var i = 0; i < cursorPos.length - 3; i++) {
									// ugly string creation apprach in order to use eval()
									evalString += '[' + cursorPos[i] + ']';
								}
								logMe('evalString', evalString, 'input');
								eval(evalString + ' = "";');
							}
						}
					}
					//console.log(JSON.stringify(currMathsInput.richText));
					mathsInputMapCursorPos();
					currMathsInput.cursorPos--;
					mathsInputCursorCoords();
				}
				break;
			case 46 : // delete key
				currMathsInput.preText = '';
				currMathsInput.postText = '';			
				if (currMathsInput.selected == true) {
					currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
					currMathsInput.selPos = [];
					currMathsInput.selected = false;
					deleteSelected();
					removeSelectTags();
					drawMathsInputText(currMathsInput);
					mathsInputMapCursorPos();
					mathsInputCursorCoords();					
				} else if (currMathsInput.cursorPos < currMathsInput.cursorMap.length - 1) {
					// get the relevant string from currMathsInput.richText
					// ie. currMathsInput.richText[cursorPos[0]][cursorPos[1]]...[cursorPos[n]]
					var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
					var pos = cursorPos[cursorPos.length - 1];
					pos = adjustForBreakPoints(pos);
										
					var text = currMathsInput.richText;
					for (var i = 0; i < cursorPos.length - 1; i++) {text = text[cursorPos[i]]};
					
					if (cursorPos[cursorPos.length - 1] !== text.length) {
						if (text.slice(pos).indexOf('<<br>>') == 0) {
							text = text.slice(0,pos) + text.slice(pos+6);
						} else if (text.slice(pos).indexOf('<<') == 0) {
							//skip forward to end of tags
							var text2 = text.slice(pos);
							var endFound = false;
							var charCount = 0;
							do {
								var c = text2.indexOf('>>') + 2;
								charCount += c;
								var text2 = text2.slice(c);
								if (text2.indexOf('<<') !== 0) {
									endFound = true;
								}
							} while (endFound == false);
							pos += charCount;
							text = text.slice(0,pos) + text.slice(pos+1);
						} else {
							text = text.slice(0,pos) + text.slice(pos+1);
						}
						// replace the string
						var evalString = 'currMathsInput.richText' 
						for (var i = 0; i < cursorPos.length - 1; i++) {
							// ugly string creation apprach in order to use eval()
							evalString += '[' + cursorPos[i] + ']';
						}
						eval(evalString + ' = text;');
						mathsInputMapCursorPos();
						mathsInputCursorCoords();
					}
				}
				break;
			case 9 : // tab key pressed
				if (typeof draw !== 'undefined' && typeof draw[taskId] !== 'undefined' && draw[taskId].drawMode == 'textEdit') {
					if (e.getModifierState('Control')) {
						mathsInputTab(10);
					} else if (e.getModifierState('Shift')) {
						mathsInputTab(5);
					} else {
						mathsInputTab();
					}
				} else {
					mathsInputTabNext();
				}
				break;
			case 13 : // enter key pressed			
				if (currMathsInput.maxLines > 1 || (typeof draw !== 'undefined' && typeof draw[taskId] !== 'undefined' && draw[taskId].drawMode == 'textEdit')) {
					if (currMathsInput.selected == true) {
						currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
						currMathsInput.selPos = [];
						currMathsInput.selected = false;
						deleteSelected();
						removeSelectTags();
						drawMathsInputText(currMathsInput);
						mathsInputMapCursorPos();
						mathsInputCursorCoords();
					}
					mathsInputNewLine();
				} else {
					endMathsInput(e);	
				}
				break;
			case 27 : // escape key pressed
				endMathsInput(e);
				break;
			/*case 16 : //shift key pressed
				shiftOn = true;
				window.addEventListener('keyup', shiftKeyUp, false);
				break;*/
			default :
			
				// need to protect against << or >> being entered
			
				if (currMathsInput.text[0].length >= currMathsInput.maxChars) {break};
				if (e.getModifierState('Shift') == true && charCode == 54/* && currMathsInput.cursorMap[currMathsInput.cursorPos].length == 2*/) { // if hat symbol is used and current text element is a text string
					mathsInputPow();
					break;
				}
				if (keysToIgnore.indexOf(charCode) == -1) {
					
					if (currMathsInput.selected == true) {
						currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
						currMathsInput.selPos = [];
						currMathsInput.selected = false;
						deleteSelected();
						removeSelectTags();
						drawMathsInputText(currMathsInput);
						mathsInputMapCursorPos();
						mathsInputCursorCoords();
					}					
					
					var caps = false;
					if (e.getModifierState('Shift') || e.getModifierState('CapsLock')) caps = true
					
					for (var ii = 0; ii < charMap.length; ii++) {
						if (charCode == charMap[ii][0]) {
							if (caps) {
								charCode = charMap[ii][2];
							} else {
								charCode = charMap[ii][1];
							}
						}
					}
					// if it is a letter key and shift is not pressed, use lower case instead of upper case
					if (!caps && charCode >= 65 && charCode <= 90) charCode += 32; 
					var keyValue = String.fromCharCode(charCode);
					
					// get the relevant string from currMathsInput.richText
					// ie. currMathsInput.richText[cursorPos[0]][cursorPos[1]]...[cursorPos[n]]
					//console.log(currMathsInput.cursorMap,currMathsInput.cursorPos,currMathsInput.cursorMap[currMathsInput.cursorPos]);
					var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
					
					/*
					console.log('currMathsInput.cursorMap:',JSON.stringify(currMathsInput.cursorMap,null,4),currMathsInput.cursorMap.length-1);
					console.log('currMathsInput.cursorPos:',JSON.stringify(currMathsInput.cursorPos,null,4));
					console.log('currMathsInput.cursorMap[currMathsInput.cursorPos]:',JSON.stringify(currMathsInput.cursorMap[currMathsInput.cursorPos],null,4));
					console.log('currMathsInput.richText[0]:',JSON.stringify(currMathsInput.richText[0],null,4),currMathsInput.richText[0].length-1);
					console.log('cursorPos:',JSON.stringify(cursorPos,null,4));
					*/
					
					var text = currMathsInput.richText;
					for (var i = 0; i < cursorPos.length - 1; i++) {
						text = text[cursorPos[i]];
					}
					
					
					/*
					// only catch functions if font is algebra?
					var functions = ['sin','cos','tan','ln','log'];
					if (text.slice(cursorPos[cursorPos.length - 1] - 3, cursorPos[cursorPos.length - 1]) == 'sin') {
						var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
						var parent = currMathsInput.richText;
						for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
						
						var pos = cursorPos[cursorPos.length - 1];
						var parentPos = cursorPos[cursorPos.length - 2];
					
						var evalString = 'currMathsInput.richText' 
						for (var aa = 0; aa < cursorPos.length - 2; aa++) {
							// ugly string creation apprach in order to use eval()
							evalString += '[' + cursorPos[aa] + ']';
						}
						eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos-3), ['sin', ['']], parent.slice(pos));");	
				
						mathsInputMapCursorPos();
						currMathsInput.cursorPos -= 2;
						mathsInputCursorCoords();
						
						var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
						var text = currMathsInput.richText;
						for (var i = 0; i < cursorPos.length - 1; i++) {
							text = text[cursorPos[i]];
						}						
						console.log(currMathsInput,currMathsInput.cursorPos,currMathsInput.cursorMap[currMathsInput.cursorPos]);
					}					
					*/
					
					/*// test if sin, cos, tan, ln or log have been written:
					if (keyValue == 'n' && text.length > 1 && text.slice(cursorPos[cursorPos.length - 1] - 2, cursorPos[cursorPos.length - 1]) == 'si') {
						// get cursorPos
						var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
						// get parent
						var parent = currMathsInput.richText;
						for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
						// get position of cursor in parent string
						var pos = cursorPos[cursorPos.length - 1];
						var parentPos = cursorPos[cursorPos.length - 2];
					
						var evalString = 'currMathsInput.richText' 
						for (var aa = 0; aa < cursorPos.length - 2; aa++) {
							// ugly string creation apprach in order to use eval()
							evalString += '[' + cursorPos[aa] + ']';
						}
						eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos - 2), ['sin', ['']], parent.slice(pos));");
						mathsInputMapCursorPos();
						currMathsInput.cursorPos--;
						mathsInputCursorCoords();
						break;
					}
					if (keyValue == 's' && text.length > 1 && text.slice(cursorPos[cursorPos.length - 1] - 2, cursorPos[cursorPos.length - 1]) == 'co') {
						// get cursorPos
						var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
						// get parent
						var parent = currMathsInput.richText;
						for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
						// get position of cursor in parent string
						var pos = cursorPos[cursorPos.length - 1];
						var parentPos = cursorPos[cursorPos.length - 2];
					
						var evalString = 'currMathsInput.richText' 
						for (var aa = 0; aa < cursorPos.length - 2; aa++) {
							// ugly string creation apprach in order to use eval()
							evalString += '[' + cursorPos[aa] + ']';
						}
						eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos - 2), ['cos', ['']], parent.slice(pos));");
						mathsInputMapCursorPos();
						currMathsInput.cursorPos--;
						mathsInputCursorCoords();
						break;
					}
					if (keyValue == 'n' && text.length > 1 && text.slice(cursorPos[cursorPos.length - 1] - 2, cursorPos[cursorPos.length - 1]) == 'ta') {
						console.log('tan');
						// get cursorPos
						var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
						// get parent
						var parent = currMathsInput.richText;
						for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
						// get position of cursor in parent string
						var pos = cursorPos[cursorPos.length - 1];
						var parentPos = cursorPos[cursorPos.length - 2];
					
						var evalString = 'currMathsInput.richText' 
						for (var aa = 0; aa < cursorPos.length - 2; aa++) {
							// ugly string creation apprach in order to use eval()
							evalString += '[' + cursorPos[aa] + ']';
						}
						eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos - 2), ['tan', ['']], parent.slice(pos));");
						mathsInputMapCursorPos();
						currMathsInput.cursorPos--;
						mathsInputCursorCoords();
						break;
					}
					if (keyValue == 'n' && text.length > 0 && text.slice(cursorPos[cursorPos.length - 1] - 1, cursorPos[cursorPos.length - 1]) == 'l') {
						console.log('ln');
						// get cursorPos
						var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
						// get parent
						var parent = currMathsInput.richText;
						for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
						// get position of cursor in parent string
						var pos = cursorPos[cursorPos.length - 1];
						var parentPos = cursorPos[cursorPos.length - 2];
					
						var evalString = 'currMathsInput.richText' 
						for (var aa = 0; aa < cursorPos.length - 2; aa++) {
							// ugly string creation apprach in order to use eval()
							evalString += '[' + cursorPos[aa] + ']';
						}
						eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos - 1), ['ln', ['']], parent.slice(pos));");
						mathsInputMapCursorPos();
						mathsInputCursorCoords();
						break;
					}
					if (keyValue == 'g' && text.length > 1 && text.slice(cursorPos[cursorPos.length - 1] - 2, cursorPos[cursorPos.length - 1]) == 'lo') {
						console.log('log');
						// get cursorPos
						var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
						// get parent
						var parent = currMathsInput.richText;
						for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
						// get position of cursor in parent string
						var pos = cursorPos[cursorPos.length - 1];
						var parentPos = cursorPos[cursorPos.length - 2];
					
						var evalString = 'currMathsInput.richText' 
						for (var aa = 0; aa < cursorPos.length - 2; aa++) {
							// ugly string creation apprach in order to use eval()
							evalString += '[' + cursorPos[aa] + ']';
						}
						eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos - 2), ['log', ['']], parent.slice(pos));");
						mathsInputMapCursorPos();
						currMathsInput.cursorPos--;
						mathsInputCursorCoords();
						break;
					}										
					*/

					// this needs to take account of elements before breakpoints 
					
					//console.log(currMathsInput.breakPoints);
					//console.log(currMathsInput.cursorPos);
					//console.log(currMathsInput.cursorMap[currMathsInput.cursorPos]);
					//console.log(slicePos);
					/*if (typeof currMathsInput.breakPoints == 'object') {
						for (var i = 0; i < currMathsInput.breakPoints.length; i++) {
							if (slicePos >= currMathsInput.breakPoints[i]) {
								slicePos--;
							}
						}
					}*/
					
					var slicePos = cursorPos[cursorPos.length - 1];
					slicePos = adjustForBreakPoints(slicePos);
					
					//console.log(text,slicePos);
					
					// check that a tag is not being split - if so adjust slicePos
					var leftText = text.slice(0,slicePos);
					var rightText = text.slice(slicePos);
					var tagLeft = false;
					var tagLeftCount = 0;
					for (var i = 0; i < leftText.length; i++) {
						tagLeftCount++;
						//console.log('left '+i+':',leftText.slice(leftText.length - i)); 
						if (leftText.slice(leftText.length - i).indexOf('>>') == 0) break;
						if (leftText.slice(leftText.length - i).indexOf('<<') == 0) {
							tagLeft = true;
							break;
						}
					}
					var tagRight = false;
					var tagRightCount = 0;
					for (var j = 0; j < rightText.length; j++) {
						tagRightCount++;
						//console.log('right '+j+':',rightText.slice(j));
						if (rightText.slice(j).indexOf('<<') == 0) break;
						if (rightText.slice(j).indexOf('>>') == 0) {
							tagRight = true;
							break;
						}
					}
					//console.log(tagLeft,tagRight,tagLeftCount,tagRightCount);
					if (tagLeft == true && tagRight == true) {
						if (tagLeftCount <= tagRightCount) {
							slicePos -= tagLeftCount;	
						} else {
							slicePos += tagRightCount;
						}
					}
					// test if '<',slicePos,'<' or '>',slicePos,'>'
					if (leftText.slice(-1) == '<' && rightText.slice(0,1) == '<' && rightText.slice(0,2) !== '<<') slicePos--;
					if (leftText.slice(-1) == '>' && leftText.slice(-2) !== '>>' && rightText.slice(0,1) == '>') slicePos++;
					
					//console.log(slicePos,text.slice(0, slicePos),'---',text.slice(slicePos))
					var pre = currMathsInput.preText || "";
					var post = currMathsInput.postText || "";
					
					text = text.slice(0, slicePos) + pre + keyValue + post + text.slice(slicePos);

					// replace the string
					var evalString = 'currMathsInput.richText' 
					for (var i = 0; i < cursorPos.length - 1; i++) {
						// ugly string creation apprach in order to use eval()
						evalString += '[' + cursorPos[i] + ']';
					}
					eval(evalString + ' = text;');

					/*// if followed by a power, test if a baseSpacer is now required					
					if (cursorPos[cursorPos.length - 1] + 1 == text.length && typeof currMathsInput.cursorMap[currMathsInput.cursorPos + 1] !== 'undefined') {
						// get the next element after the parent
						var nextCursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos + 1];
						var nextElem = currMathsInput.richText;
						for (var aa = 0; aa < nextCursorPos.length - 3; aa++) {nextElem = nextElem[nextCursorPos[aa]]};
						if (nextElem[0] == 'power' || nextElem[0] == 'subs') {
							var baseSpacer = true;
							if (/[a-zA-Z0-9)]/g.test(keyValue) == true) baseSpacer = false
							var evalString = 'currMathsInput.richText' 
							for (var aa = 0; aa < nextCursorPos.length - 3; aa++) {
								// ugly string creation apprach in order to use eval()
								evalString += '[' + nextCursorPos[aa] + ']';
							}
							eval(evalString + "[1] = " + baseSpacer + ";");
						}
					}*/		
					
					//logText();
					mathsInputMapCursorPos();
					
					// set the last number of cursorMap[cursorPos+1] to be one more than cursorMap[cursorPos]
					//currMathsInput.cursorMap[currMathsInput.cursorPos + 1][currMathsInput.cursorMap[currMathsInput.cursorPos + 1].length - 1] = currMathsInput.cursorMap[currMathsInput.cursorPos][currMathsInput.cursorMap[currMathsInput.cursorPos].length - 1] + 1;
										
					currMathsInput.cursorPos += 1;
					mathsInputCursorCoords();
					currMathsInput.preText = '';
					currMathsInput.postText = '';						
					//logText();
				}
		}
	}
}
function softKeyMathsInput(e) {
	//console.log(inputState);
	if (inputState == true) {
		/*
		if (mathsInputDoubleInput == true) {
			return;
		} else {
			mathsInputDoubleInput = true;
			setTimeout(function() {
				mathsInputDoubleInput = false;
			}, 250);
		}
		*/
		var keyNum;
		var keyValue;
		if (keyboard[taskNum]) {
			keyNum = key1[taskNum].indexOf(e.target);
			keyValue = key1Data[taskNum][keyNum][6];
		}
		//console.log(keyValue);
		if (keyValue == 'delete') { // if it's the delete button
			currMathsInput.preText = '';
			currMathsInput.postText = '';	
			if (currMathsInput.selected == true) {
				currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
				currMathsInput.selPos = [];
				currMathsInput.selected = false;
				deleteSelected();
				removeSelectTags();
				drawMathsInputText(currMathsInput);
				mathsInputMapCursorPos();
				mathsInputCursorCoords();					
			} else if (currMathsInput.cursorPos > 0) {
				// get the relevant string from currMathsInput.richText
				// ie. currMathsInput.richText[cursorPos[0]][cursorPos[1]]...[cursorPos[n]]
				var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
				//console.log(cursorPos);
				var pos = cursorPos[cursorPos.length - 1];
				//console.log(pos);
				pos = adjustForBreakPoints(pos);
				//console.log(pos);
				
				var text = currMathsInput.richText;
				for (var i = 0; i < cursorPos.length - 1; i++) {text = text[cursorPos[i]]};
				
				var parent;
				if (cursorPos.length > 1) {
					parent = currMathsInput.richText;
					for (var i = 0; i < cursorPos.length - 2; i++) {parent = parent[cursorPos[i]]};
				}
				var grandParent;
				if (cursorPos.length > 2) {
					grandParent = currMathsInput.richText;
					for (var i = 0; i < cursorPos.length - 3; i++) {grandParent = grandParent[cursorPos[i]]};
				}
				
				logMe('br', 'input');
				logMeG('currMathsInput.richText', 'input');
				logMeG('currMathsInput.cursorMap', 'input');
				logMeG('currMathsInput.cursorPos', 'input');					
				logMe('cursorPos', cursorPos, 'input');
				logMe('text', text, 'input');
				logMe('parent', parent, 'input');
				logMe('grandParent', grandParent, 'input');
				
				if (text !== '') {
					if (pos !== 0) {
						//console.log(1,text,text.length,pos,text.slice(0, pos-1) + text.slice(pos));
						if (text.slice(pos-6).indexOf('<<br>>') == 0) {
							text = text.slice(0, pos-6) + text.slice(pos);
						} else {
							text = text.slice(0, pos-1) + text.slice(pos);
						}
						//console.log(2,text);
						// replace the string
						var evalString = 'currMathsInput.richText' 
						for (var aa = 0; aa < cursorPos.length - 1; aa++) {
							// ugly string creation apprach in order to use eval()
							evalString += '[' + cursorPos[aa] + ']';
						}
						eval(evalString + ' = text;');
					}
				} else {
					if (parent.length == 1) { // ie. empty string is only sub-element  
						var elemsOneParam = ['sqrt', 'pow', 'power', 'subs', 'subscript', 'sin', 'cos', 'tan', 'sin-1', 'cos-1', 'tan-1', 'log', 'ln', 'abs', 'exp', 'sigma1', 'int1', 'vectorArrow', 'bar', 'hat', 'recurring'];
						var elemsTwoParams = ['root', 'frac', 'logBase', 'colVector2d', 'lim'];
						var elemsThreeParams = ['sigma2', 'int2', 'colVector3d', 'mixedNum'];
						if (elemsOneParam.indexOf(grandParent[0]) > -1 || (elemsTwoParams.indexOf(grandParent[0]) > -1 && cursorPos[cursorPos.length - 3] == 1) || (elemsThreeParams.indexOf(grandParent[0]) > -1 && cursorPos[cursorPos.length - 3] == 1)) { // conditions to delete elements								
							// replace grandParent with "";
							var evalString = 'currMathsInput.richText' 
							for (var i = 0; i < cursorPos.length - 3; i++) {
								// ugly string creation apprach in order to use eval()
								evalString += '[' + cursorPos[i] + ']';
							}
							logMe('evalString', evalString, 'input');
							eval(evalString + ' = "";');
						}
					}
				}
				mathsInputMapCursorPos();
				currMathsInput.cursorPos--;
				mathsInputCursorCoords();
			}
		} else {
			// type text char
			if (currMathsInput.text[0].length >= currMathsInput.maxChars) {return};
			
			if (currMathsInput.selected == true) {
				currMathsInput.cursorPos = Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1]);
				currMathsInput.selPos = [];
				currMathsInput.selected = false;
				deleteSelected();
				removeSelectTags();
				drawMathsInputText(currMathsInput);
				mathsInputMapCursorPos();
				mathsInputCursorCoords();
			}			
			
			// get the relevant string from currMathsInput.richText
			// ie. currMathsInput.richText[cursorPos[0]][cursorPos[1]]...[cursorPos[n]]
			var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
						
			var text = currMathsInput.richText;
			for (var aa = 0; aa < cursorPos.length - 1; aa++) {
				text = text[cursorPos[aa]];
			}
			
			/*
			// test if sin, cos, tan, ln or log have been written:
			if (keyValue == 'n' && text.length > 1 && text.slice(cursorPos[cursorPos.length - 1] - 2, cursorPos[cursorPos.length - 1]) == 'si') {
				// get cursorPos
				var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
				// get parent
				var parent = currMathsInput.richText;
				for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
				// get position of cursor in parent string
				var pos = cursorPos[cursorPos.length - 1];
				var parentPos = cursorPos[cursorPos.length - 2];
			
				var evalString = 'currMathsInput.richText' 
				for (var aa = 0; aa < cursorPos.length - 2; aa++) {
					// ugly string creation apprach in order to use eval()
					evalString += '[' + cursorPos[aa] + ']';
				}
				eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos - 2), ['sin', ['']], parent.slice(pos));");
				mathsInputMapCursorPos();
				currMathsInput.cursorPos--;
				mathsInputCursorCoords();
				return;
			}
			if (keyValue == 's' && text.length > 1 && text.slice(cursorPos[cursorPos.length - 1] - 2, cursorPos[cursorPos.length - 1]) == 'co') {
				// get cursorPos
				var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
				// get parent
				var parent = currMathsInput.richText;
				for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
				// get position of cursor in parent string
				var pos = cursorPos[cursorPos.length - 1];
				var parentPos = cursorPos[cursorPos.length - 2];
			
				var evalString = 'currMathsInput.richText' 
				for (var aa = 0; aa < cursorPos.length - 2; aa++) {
					// ugly string creation apprach in order to use eval()
					evalString += '[' + cursorPos[aa] + ']';
				}
				eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos - 2), ['cos', ['']], parent.slice(pos));");
				mathsInputMapCursorPos();
				currMathsInput.cursorPos--;
				mathsInputCursorCoords();
				return;
			}
			if (keyValue == 'n' && text.length > 1 && text.slice(cursorPos[cursorPos.length - 1] - 2, cursorPos[cursorPos.length - 1]) == 'ta') {
				console.log('tan');
				// get cursorPos
				var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
				// get parent
				var parent = currMathsInput.richText;
				for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
				// get position of cursor in parent string
				var pos = cursorPos[cursorPos.length - 1];
				var parentPos = cursorPos[cursorPos.length - 2];
			
				var evalString = 'currMathsInput.richText' 
				for (var aa = 0; aa < cursorPos.length - 2; aa++) {
					// ugly string creation apprach in order to use eval()
					evalString += '[' + cursorPos[aa] + ']';
				}
				eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos - 2), ['tan', ['']], parent.slice(pos));");
				mathsInputMapCursorPos();
				currMathsInput.cursorPos--;
				mathsInputCursorCoords();
				return;
			}
			if (keyValue == 'n' && text.length > 0 && text.slice(cursorPos[cursorPos.length - 1] - 1, cursorPos[cursorPos.length - 1]) == 'l') {
				console.log('ln');
				// get cursorPos
				var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
				// get parent
				var parent = currMathsInput.richText;
				for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
				// get position of cursor in parent string
				var pos = cursorPos[cursorPos.length - 1];
				var parentPos = cursorPos[cursorPos.length - 2];
			
				var evalString = 'currMathsInput.richText' 
				for (var aa = 0; aa < cursorPos.length - 2; aa++) {
					// ugly string creation apprach in order to use eval()
					evalString += '[' + cursorPos[aa] + ']';
				}
				eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos - 1), ['ln', ['']], parent.slice(pos));");
				mathsInputMapCursorPos();
				mathsInputCursorCoords();
				return;
			}
			if (keyValue == 'g' && text.length > 1 && text.slice(cursorPos[cursorPos.length - 1] - 2, cursorPos[cursorPos.length - 1]) == 'lo') {
				console.log('log');
				// get cursorPos
				var cursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
				// get parent
				var parent = currMathsInput.richText;
				for (var aa = 0; aa < cursorPos.length - 1; aa++) {parent = parent[cursorPos[aa]]};
				// get position of cursor in parent string
				var pos = cursorPos[cursorPos.length - 1];
				var parentPos = cursorPos[cursorPos.length - 2];
			
				var evalString = 'currMathsInput.richText' 
				for (var aa = 0; aa < cursorPos.length - 2; aa++) {
					// ugly string creation apprach in order to use eval()
					evalString += '[' + cursorPos[aa] + ']';
				}
				eval(evalString + ".splice(parentPos, 1, parent.slice(0, pos - 2), ['log', ['']], parent.slice(pos));");
				mathsInputMapCursorPos();
				currMathsInput.cursorPos--;
				mathsInputCursorCoords();
				return;
			}			
			*/

			var slicePos = cursorPos[cursorPos.length - 1];
			slicePos = adjustForBreakPoints(slicePos);
			//console.log(slicePos);
			
			// check that a tag is not being split - if so adjust slicePos
			var leftText = text.slice(0,slicePos);
			var rightText = text.slice(slicePos);
			var tagLeft = false;
			var tagLeftCount = 0;
			for (var i = 0; i < leftText.length; i++) {
				tagLeftCount++;
				//console.log('left '+i+':',leftText.slice(leftText.length - i)); 
				if (leftText.slice(leftText.length - i).indexOf('>>') == 0) break;
				if (leftText.slice(leftText.length - i).indexOf('<<') == 0) {
					tagLeft = true;
					break;
				}
			}
			var tagRight = false;
			var tagRightCount = 0;
			for (var j = 0; j < rightText.length; j++) {
				tagRightCount++;
				//console.log('right '+j+':',rightText.slice(j));
				if (rightText.slice(j).indexOf('<<') == 0) break;
				if (rightText.slice(j).indexOf('>>') == 0) {
					tagRight = true;
					break;
				}
			}
			//console.log(tagLeft,tagRight,tagLeftCount,tagRightCount);
			if (tagLeft == true && tagRight == true) {
				if (tagLeftCount <= tagRightCount) {
					slicePos -= tagLeftCount;	
				} else {
					slicePos += tagRightCount;
				}
			}
			// test if '<',slicePos,'<' or '>',slicePos,'>'
			if (leftText.slice(-1) == '<' && rightText.slice(0,1) == '<' && rightText.slice(0,2) !== '<<') slicePos--;
			if (leftText.slice(-1) == '>' && leftText.slice(-2) !== '>>' && rightText.slice(0,1) == '>') slicePos++;
			
			//console.log(keyValue);
			var pre = currMathsInput.preText || "";
			var post = currMathsInput.postText || "";
			
			text = text.slice(0, slicePos) + pre + keyValue + post + text.slice(slicePos);

			// replace the string
			var evalString = 'currMathsInput.richText' 
			for (var i = 0; i < cursorPos.length - 1; i++) {
				// ugly string creation approach in order to use eval()
				evalString += '[' + cursorPos[i] + ']';
			}
			eval(evalString + ' = text;');
			
			// if followed by a power, test if a baseSpacer is now required					
			if (cursorPos[cursorPos.length - 1] + 1 == text.length && typeof currMathsInput.cursorMap[currMathsInput.cursorPos + 1] !== 'undefined') {
				// get the next element after the parent
				var nextCursorPos = currMathsInput.cursorMap[currMathsInput.cursorPos + 1];
				var nextElem = currMathsInput.richText;
				for (var aa = 0; aa < nextCursorPos.length - 3; aa++) {nextElem = nextElem[nextCursorPos[aa]]};
				if (nextElem[0] == 'power' || nextElem[0] == 'subs') {
					var baseSpacer = true;
					if (/[a-zA-Z0-9)]/g.test(keyValue) == true) baseSpacer = false
					var evalString = 'currMathsInput.richText' 
					for (var aa = 0; aa < nextCursorPos.length - 3; aa++) {
						// ugly string creation apprach in order to use eval()
						evalString += '[' + nextCursorPos[aa] + ']';
					}
					eval(evalString + "[1] = " + baseSpacer + ";");
				}
			}			
			
			mathsInputMapCursorPos();
			currMathsInput.cursorPos += 1;
			mathsInputCursorCoords();
			currMathsInput.preText = '';
			currMathsInput.postText = '';			
		}
	}
}

//var date = new Date();
//var prevMathsInputTime = date.getTime();
var mathsInputDoubleInput = false;

/*function setMathsInputBackColor(input,color) {
	input.backColor = color;
	drawMathsInputText(input);
}*/
function measureMathsInputText(input) {
	var leftPoint = 10;
	if (input.textAlign == 'center') {leftPoint = 0.5 * input.data[2]};
	if (typeof input.richText[input.richText.length - 1] !== 'string') {input.richText.push('')};
	return drawMathsText(input.ctx, input.richText, input.fontSize, leftPoint, 0.5 * input.data[3], input.algText, input.textLoc, input.textAlign, 'middle', input.textColor, 'measure');
}
function drawMathsInputText(input,ctxLocal,sf,useRelPos) {
	if (typeof sf == 'undefined') sf = 1;
	if (typeof ctxLocal == 'undefined') {
		input.ctx.clearRect(0,0,input.data[102],input.data[103]);
		var ctx = input.ctx;
		var ownCanvas = true;
	} else {
		var ctx = ctxLocal; // will draw to a different canvas
		var ownCanvas = false;
	}
	if (typeof input.richText[input.richText.length-1] !== 'string') {input.richText.push('')};
	var leftPoint = 10*sf;
	var topPoint = 0;

	if (typeof input.varSize == 'object') {
		if (input.textAlign == 'left') {
			leftPoint = input.varSize.padding*sf;
			if (typeof input.varSize.padding !== 'number') leftPoint = 10*sf;
		} else if (input.textAlign == 'center') {
			leftPoint = 0;
		} else if (input.textAlign == 'right') {
			leftPoint = 0 - input.varSize.padding*sf;
			if (typeof input.varSize.padding !== 'number') leftPoint = -10*sf;
		}
		var minTightWidth = input.varSize.minWidth*sf || 50*sf;
		var minTightHeight = input.varSize.minHeight*sf || 50*sf;
		var padding = input.varSize.padding*sf;
		var maxWidth = input.varSize.maxWidth*sf || input.data[102]*sf;
		var maxHeight = input.varSize.maxHeight*sf || input.data[103]*sf;		
	} else {
		if (input.textAlign == 'left') {
			leftPoint = 10*sf;
		} else if (input.textAlign == 'center') {
			leftPoint = 0;							
		} else if (input.textAlign == 'right') {
			
		}
		var minTightWidth = 50*sf;
		var minTightHeight = 50*sf;
		var padding = 0.01*sf;	
		var maxWidth = input.data[102]*sf;
		var maxHeight = input.data[103]*sf;		
	}
	
	if (input.border == true) {
		if (typeof input.varSize == 'object') {
			var border = {
				type:'tight',
				color:input.backColor,
				borderColor:input.borderColor,
				borderWidth:input.borderWidth*sf,
				dash:input.borderDash,
				radius:input.borderRadius*sf || input.radius*sf || 0
			}
		} else {
			var radius = input.borderRadius*sf || input.radius*sf || 0;
			var borderLeft = input.borderWidth*sf/2;
			var borderTop = input.borderWidth*sf/2;
			if (ownCanvas == false) {
				borderLeft += input.data[100]*sf;
				borderTop += input.data[101]*sf;
			}
			roundedRect(ctx,borderLeft,borderTop,input.data[102]*sf-input.borderWidth*sf,input.data[103]*sf-input.borderWidth*sf,radius,input.borderWidth*sf,input.borderColor,input.backColor,input.borderDash);
			var border = {type:'none'};
		}
	} else {
		var border = {type:'none'};
	}
	
	if (ownCanvas == false) {
		if (!isNaN(input.data[100])) {
			leftPoint += input.data[100]*sf;
			topPoint += input.data[101]*sf;
		} else {
			leftPoint += input.data[0]*sf;
			topPoint += input.data[1]*sf;
		}
		if (boolean(useRelPos,true) == true && typeof draw !== 'undefined' && typeof draw[taskId] !== 'undefined' && typeof draw[taskId].drawRelPos !== 'undefined') {
			leftPoint -= draw[taskId].drawRelPos[0];
			topPoint -= draw[taskId].drawRelPos[1];
		}
	}
	
	var lineSpacingFactor = input.lineSpacingFactor || 1.2;
	var lineSpacingStyle = input.lineSpacingStyle || 'variable';
	
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
		box:border,
		sf:sf,
		lineSpacingFactor:lineSpacingFactor,
		spacingStyle:lineSpacingStyle
	});

	if (ownCanvas == true) {
		input.textLoc = drawText.textLoc;
		input.breakPoints = drawText.breakPoints;
		input.tightRect = drawText.tightRect;
		input.totalTextWidth = drawText.totalTextWidth;
		input.maxWordWidth = drawText.maxWordWidth;
	}
	
	if (typeof input.drawPath == 'object') {
		if (input.tightRect[3] > input.drawPath.obj[0].height) {
			input.drawPath.obj[0].height = input.tightRect[3];
			input.varSize.maxHeight = input.tightRect[3];
			updateBorder(input.drawPath);
			drawCanvasPaths();
		}	
	}
	
	if (typeof input.varSize == 'object' && ownCanvas == true) {
		// resize cursor canvas
		if (typeof input.tightRect == 'object') {
			input.cursorData[100] = input.data[100] + input.tightRect[0];
			input.cursorData[101] = input.data[101] + input.tightRect[1];
			input.cursorData[102] = input.tightRect[2];
			input.cursorData[103] = input.tightRect[3];		
		} else {
			input.cursorData[100] = input.data[100];
			input.cursorData[101] = input.data[101];
			input.cursorData[102] = input.data[102];
			input.cursorData[103] = input.data[103];			
		}
		input.cursorCanvas.width = input.cursorData[102];
		input.cursorCanvas.height = input.cursorData[103];
		resizeCanvas(input.cursorCanvas,input.cursorData[100],input.cursorData[101],input.cursorData[102],input.cursorData[103]);
	}		
	
	//console.clear();
	//if (currMathsInput.id == 1)	console.log(currMathsInput.id,JSON.stringify(currMathsInput.richText));
}
function mathsInputAddChar(mInput,char) {
	if (un(mInput)) mInput = currMathsInput;
	// get last position
	var cursorPos = mInput.cursorMap[mInput.cursorMap.length-1];
	var loc = mInput.textLoc;	
	for (var aa = 0 ; aa < cursorPos.length; aa++) {
		loc = loc[cursorPos[aa]];
	}
	//console.log(cursorPos);
	
	var font,fontSize,color,bold,italic;
	arrayHandler(mInput.richText);
	var newLoc = drawMathsText(mInput.ctx,char,fontSize,loc.left,loc.top+0.5*loc.height,false,[],'left','middle',color,'draw','none',bold,italic,font,false,1).textLoc;

	var evalString = '';
	for (var aa = 0 ; aa < cursorPos.length-1; aa++) {
		evalString += '['+cursorPos[aa]+']';
	}
	eval('mInput.richText'+evalString+'=mInput.richText'+evalString+'+char');
	eval('mInput.textLoc'+evalString+'.push(newLoc[0][1])');
	cursorPos[cursorPos.length-1]++;
	mInput.cursorMap.push(cursorPos);
	
	//console.log(mInput);
	
	function markupTag(tag) {
		if (tag.indexOf('<<font:') == 0) {
			font = tag.slice(7,-2);
		} else if (tag.indexOf('<<fontSize:') == 0) {
			fontSize = Number(tag.slice(11,-2));
		} else if (tag.indexOf('<<color:') == 0) {
			color = tag.slice(8,-2);						
		} else if (tag.indexOf('<<bold:') == 0) {
			if (tag.indexOf('true') > -1) bold = true;
			if (tag.indexOf('false') > -1) bold = false;
		} else if (tag.indexOf('<<italic:') == 0) {
			if (tag.indexOf('true') > -1) italic = true;
			if (tag.indexOf('false') > -1) italic = false;
		}
	}
	function arrayHandler(arr) {
		//console.log(JSON.stringify(arr));
		for (var i = 0; i < arr.length; i++) {
			if (typeof arr[i] == 'object') {
				arrayHandler(arr[i]);							
			} else if (typeof arr[i] == 'string') {
				var splitText = splitMarkup(arr[i]);
				for (var splitElem = 0; splitElem < splitText.length; splitElem++) {
					if (splitText[splitElem].indexOf('<<') == 0 && splitText[splitElem].indexOf('<<br>>') !== 0) {
						markupTag(splitText[splitElem],true);
					}
				}					
			}
		}
	}		
}
function createJsString (angleMode) {
	if (typeof angleMode == 'undefined') {
		angleMode = currMathsInput.angleMode || 'deg';
	}

	var depth = 0;
	var jsArray = [''];
	var js = '';
	var algArray = [''];
	var alg = '';
	var exceptions = ['Math.pow','Math.sqrt','Math.PI','Math.sin','Math.cos','Math.tan','Math.asin','Math.acos','Math.atan','Math.e','Math.log','Math.abs','sin','cos','tan'];
	var position = [0];
		
	for (var p = 0; p < currMathsInput.richText.length; p++) {
		//console.log('Before ' + p + ' base element(s):', jsArray);
		subJS(currMathsInput.richText[p],true);
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
			
			/*if (trigPower == true) {
				var power = elem[2];
				if (typeof power == 'string') {
					power = removeAllTagsFromString(power);
					console.log(power);
					if (power == '-1') {
						jsArray[depth] = jsArray[depth].slice(0,-3) + 'Math.a' + jsArray[depth].slice(-3);
					} else if (power == '2') {
						
					}
				}
				
			}*/

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
	logMe('js', js, 'input');
	var jsValue;
	try {
		jsValue = eval(js);
	} catch (err) {}
	logMe('jsValue', jsValue, 'input');
	logMe('br', 'input');
	return js;
}
function splitText(text) {
	// find split points in text string
	var splitPointCount = 0;
	var textSplitPoints = [];
	var delimiter = '%&^';
	for (i = 0; i <= text.length; i++) {
		var fracStartPos = text.substring(i, text.length).indexOf('frac(');
		var rootStartPos = text.substring(i, text.length).indexOf('root(');
		var powerStartPos = text.substring(i, text.length).indexOf('power(');
		if (fracStartPos !== -1) {fracStartPos += i};
		if (rootStartPos !== -1) {rootStartPos += i};
		if (powerStartPos !== -1) {powerStartPos += i};
		if (fracStartPos > -1 || rootStartPos > -1 || powerStartPos > -1) {
			textSplitPoints[splitPointCount] = [];
			if (fracStartPos == -1) {fracStartPos = 10000};
			if (rootStartPos == -1) {rootStartPos = 10000};
			if (powerStartPos == -1) {powerStartPos = 10000};
			textSplitPoints[splitPointCount][0] = Math.min(fracStartPos, rootStartPos, powerStartPos);
			var openBracketCount = 0;
			var closeBracketCount = 0;
			for (j = textSplitPoints[splitPointCount][0]; j <= text.length; j++) {
				if (!textSplitPoints[splitPointCount][1]) {
					if (text.charAt(j) == '(') {openBracketCount++};
					if (text.charAt(j) == ')') {closeBracketCount++};
					if (openBracketCount > 0 && (openBracketCount == closeBracketCount)) {
						textSplitPoints[splitPointCount][1] = j;
						i = j;
					}
				}
			}
			splitPointCount++;
		}
	}
	
	if (textSplitPoints.length == 0) {return text}
	
	for (i = 0; i < textSplitPoints.length; i++) {
		text = text.substring(0, textSplitPoints[i][0] + i * 2 * delimiter.length) + delimiter + text.substring(textSplitPoints[i][0] + i * 2 * delimiter.length, textSplitPoints[i][1] + 1 + i * 2 * delimiter.length) + delimiter + text.substring(textSplitPoints[i][1] + 1 + i * 2 * delimiter.length, text.length);
	}
	var splitArray = text.split(delimiter);
	var returnArray = [];
	for (i = 0; i < splitArray.length; i++) {
		var type = 0;
		if (splitArray[i].indexOf('frac(') == 0) {type = 'frac'};
		if (splitArray[i].indexOf('root(') == 0) {type = 'root'};
		if (splitArray[i].indexOf('power(') == 0) {type = 'power'};
		if (type == 0) {
			if (splitArray[i] !== '') {returnArray.push(splitArray[i])}
		} else {
			var subArray = [];
			subArray[0] = type;
			
			var params = splitArray[i].substring(type.length + 1, splitArray[i].length - 1);
			var openBracketCount = 0;
			var closeBracketCount = 0;
			var splitPoint = -1;
			
			// find split point of params
			for (j = 0; j <= params.length; j++) {
				if (params.charAt(j) == '(') {openBracketCount++};
				if (params.charAt(j) == ')') {closeBracketCount++};
				if (params.charAt(j) == ',' && (openBracketCount == closeBracketCount) && splitPoint == -1) {
					splitPoint = j;
				}
			}			
			subArray[1] = params.substring(0, splitPoint);
			subArray[2] = params.substring(splitPoint + 1, params.length).trim();
			returnArray.push(subArray)
		}
	}
	return returnArray;
}

/*! correcting-interval 2.0.0 | Copyright 2014 Andrew Duthie | MIT License */
/* jshint evil: true */
/* usage example:
var startTime = Date.now();
setCorrectingInterval(function() {
  console.log((Date.now() - startTime) + 'ms elapsed');
}, 1000);
*/
;(function(global, factory) {
  // Use UMD pattern to expose exported functions
  if (typeof exports === 'object') {
    // Expose to Node.js
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // Expose to RequireJS
    define([], factory);
  }

  // Expose to global object (likely browser window)
  var exports = factory();
  for (var prop in exports) {
    global[prop] = exports[prop];
  }
}(this, function() {
  // Track running intervals
  var numIntervals = 0,
    intervals = {};

  // Polyfill Date.now
  var now = Date.now || function() {
    return new Date().valueOf();
  };

  var setCorrectingInterval = function(func, delay) {
    var id = numIntervals++,
      planned = now() + delay;

    // Normalize func as function
    switch (typeof func) {
      case 'function':
        break;
      case 'string':
        var sFunc = func;
        func = function() {
          eval(sFunc);
        };
        break;
      default:
        func = function() { };
    }

    function tick() {
      func();

      // Only re-register if clearCorrectingInterval was not called during function
      if (intervals[id]) {
        planned += delay;
        intervals[id] = setTimeout(tick, planned - now());
      }
    }

    intervals[id] = setTimeout(tick, delay);
    return id;
  };

  var clearCorrectingInterval = function(id) {
    clearTimeout(intervals[id]);
    delete intervals[id];
  };

  return {
    setCorrectingInterval: setCorrectingInterval,
    clearCorrectingInterval: clearCorrectingInterval
  };
}));
function logText(clearConsole) {
	var input = currMathsInput;
	if (clearConsole == true) console.clear();
	console.log('richText:',input.richText);
	console.log('cursorMap:');
	for (var i = 0; i < input.cursorMap.length; i++) {
		var char = input.richText;
		for (var j = 0; j < input.cursorMap[i].length - 1; j++) {char = char[input.cursorMap[i][j]];};
		// check for breakPoints
		var slicePos = input.cursorMap[i][input.cursorMap[i].length-1];
		if (typeof currMathsInput.breakPoints == 'object') {						
			var map = currMathsInput.cursorMap[i];						
			for (var k = 0; k < currMathsInput.breakPoints.length - 1; k++) {
				var iBreak = currMathsInput.allMap[currMathsInput.breakPoints[k]];
				if (iBreak[0] == map[0] && iBreak[1] < map[1]) {
					slicePos--;
				}
			}
		}
		var char1 = char.slice(slicePos-5,slicePos);
		var char2 = char.slice(slicePos,slicePos+5);
		if (i == input.cursorPos) {
			console.log('>'+i+':',input.cursorMap[i],char1,char2,'<<< cursorPos');			
		} else {
			console.log('>'+i+':',input.cursorMap[i],char1,char2);
		}
	}
}
function drawTextLocs() {
	for (var loc = 0; loc < currMathsInput.cursorMap.length; loc++) {
		var cursorPos = currMathsInput.cursorMap[loc];
		var evalString = 'currMathsInput.textLoc'
		for (aa = 0; aa < cursorPos.length; aa++) {
			evalString += '[' + cursorPos[aa] + ']';
		}
		var pos = eval(evalString);
		console.log(loc, pos.left);
		currMathsInput.ctx.strokeStyle = '#00F';
		currMathsInput.ctx.lineWidth = 2;
		currMathsInput.ctx.beginPath();
		currMathsInput.ctx.moveTo(pos.left,pos.top);
		currMathsInput.ctx.lineTo(pos.left,pos.top+pos.height);
		currMathsInput.ctx.closePath();
		currMathsInput.ctx.stroke();
	}
}
function isMouseOverText(mathsInput) {
	if (typeof mathsInput == 'undefined') mathsInput = currMathsInput;
	var locs = [];
	for (var i = 0; i < mathsInput.cursorMap.length; i++) {
		var textLoc = mathsInput.textLoc;
		for (var j = 0; j < mathsInput.cursorMap[i].length; j++) {textLoc = textLoc[mathsInput.cursorMap[i][j]];};
		locs.push(textLoc);
	}
	var left = mathsInput.data[100];
	var top = mathsInput.data[101];
	for (var i = 0; i < locs.length; i++) {
		if (mouse.x >= left + locs[i].left && mouse.x <= left + locs[i].left + locs[i].width && mouse.y >= top + locs[i].top && mouse.y <= top + locs[i].top + locs[i].height) {
			return true;	
		}
	}
	return false;
}

// -------------------------------------- //
//              TEXT MENU                 //
// -------------------------------------- //

function createButton2(left,top,width,height,visible,draggable,pointerEvents,zIndex) {
	var bNum = eval(taskTag+'button.length');
	createButton(bNum,left,top,width,height,visible,draggable,pointerEvents,zIndex);
	return bNum;
}
function createButton3(left,top,width,height,visible,draggable,pointerEvents,zIndex) {
	var num = eval(taskTag+'button.length');
	return createButton(num,left,top,width,height,visible,draggable,pointerEvents,zIndex);
}
function addTextMenu(object) {
	var textMenuLeft = object.left || 15;
	var textMenuTop = object.top || 100;
	var zIndex = object.zIndex || 1000;
	
	var colors = [{color:'#000'},{color:'#FFF'},{color:'#F00'},{color:'#393'},{color:'#00F'},{color:'#FF0'},{color:'#F0F'},{color:'#0FF'},{color:'#FCC'},{color:'#CFC'},{color:'#CCF'},{color:'#FFC'},{color:'#FCF'},{color:'#CFF'},{color:'#6F9'}];
	
	var fonts = [{font:'Arial',displaySize:24,top:0},{font:'algebra',displaySize:22,top:2},{font:'Hobo',displaySize:24,top:0},{font:'Georgia',displaySize:24,top:0},{font:'Segoe Print',displaySize:20,top:0},{font:'smileymonster',displaySize:16,top:5}];
	
	var chars = [
		{char:'0x00D7',name:'times'},
		{char:'0x00F7',name:'divide'},
		{char:'0x00B0',name:'degrees'},
		{char:'0x221E',name:'infinity'},
		{char:'0x2261',name:'equivalence'},
		{char:'0x2248',name:'approximately'},		
		{char:'0x2264',name:'lessEqual'},
		{char:'0x2265',name:'moreEqual'},
		{char:'0x03C0',name:'pi'},
		{char:'0x2260',name:'notEqual'},
		{char:'0x03B8',name:'theta'},
		{char:'0x00B1',name:'plusMinus'},
		{char:'0x2213',name:'minusPlus'},
		{char:'0x2B1A',name:'dottedSquare'},
		{char:'0x2115',name:'naturals'},
		{char:'0x2124',name:'integers'},
		{char:'0x211A',name:'rationals'},
		{char:'0x211D',name:'reals'},
		{char:'0x2208',name:'elementOf'},
		{char:'0x2209',name:'notElementOf'},
		{char:'0x221D',name:'proportionalTo'},				
		{char:'0x2220',name:'angle'},				
		{char:'0x2229',name:'intersection'},				
		{char:'0x222A',name:'union'},				
		{char:'0x2234',name:'therefore'},
		{char:'0x2190',name:'leftArrow'},
		{char:'0x2191',name:'upArrow'},
		{char:'0x2192',name:'rightArrow'},
		{char:'0x2193',name:'downArrow'}
	];
	
	var elements = [
		{display:['x',['power',false,['']]],name:'power',func:'mathsInputPow',top:5},
		{display:['x',['subs',false,['']]],name:'subs',func:'mathsInputSubs',top:5},
		{display:[['frac',[''],['']]],name:'frac',func:'mathsInputFrac',top:-1},
		{display:[['sqrt',['']]],name:'sqrt',func:'mathsInputSqrt',top:5},
		{display:[['root',[''],['']]],name:'root',func:'mathsInputRoot',top:7},
		{display:[['sin',['']]],name:'sin',func:'mathsInputSin',top:5},
		{display:[['sin-1',['']]],name:'sin-1',func:'mathsInputInvSin',top:5},
		{display:[['cos',['']]],name:'cos',func:'mathsInputCos',top:5},	
		{display:[['cos-1',['']]],name:'cos-1',func:'mathsInputInvCos',top:5},
		{display:[['tan',['']]],name:'tan',func:'mathsInputTan',top:5},
		{display:[['tan-1',['']]],name:'tan-1',func:'mathsInputInvTan',top:5},
		{display:[['ln',['']]],name:'ln',func:'mathsInputLn',top:5},	
		{display:[['log',['']]],name:'log',func:'mathsInputLog',top:5},	
		{display:[['logBase',[''],['']]],name:'logBase',func:'mathsInputLogBase',top:5},		
		{display:[['abs',['']]],name:'abs',func:'mathsInputAbs',top:5},
		{display:[['exp',['']]],name:'exp',func:'mathsInputExp',top:5},
		{display:[['sigma1',['']]],name:'sigma1',func:'mathsInputSigma1',top:5},
		{display:[['sigma2',[''],[''],['']]],name:'sigma2',func:'mathsInputSigma2',top:5},
		{display:[['int1',['']]],name:'int1',func:'mathsInputInt1',top:5},
		{display:[['int2',[''],[''],['']]],name:'int2',func:'mathsInputInt2',top:5},
		{display:[['vectorArrow',['']]],name:'vectorArrow',func:'mathsInputVectorArrow',top:5},
		{display:[['bar',['']]],name:'bar',func:'mathsInputBar',top:5},
		{display:[['hat',['']]],name:'hat',func:'mathsInputHat',top:5},
		{display:[['recurring',['']]],name:'recurring',func:'mathsInputRecurring',top:5},
		{display:[['colVector2d',[''],['']]],name:'colVector2d',func:'mathsInputColVector2d',top:5},
		{display:[['colVector3d',[''],[''],['']]],name:'colVector3d',func:'mathsInputColVector3d',top:5},
		{display:[['mixedNum',[''],[''],['']]],name:'mixedNum',func:'mathsInputMixedNum',top:5},
		{display:[['lim',[''],['']]],name:'lim',func:'mathsInputLim',top:5},
	];
	
	var alignment = [
		{h:'left',v:'top'},
		{h:'left',v:'middle'},
		{h:'left',v:'bottom'},

		{h:'center',v:'top'},		
		{h:'center',v:'middle'},		
		{h:'center',v:'bottom'},		

		{h:'right',v:'top'},
		{h:'right',v:'middle'},
		{h:'right',v:'bottom'},		
	];
	
	var fontSizes = [10,15,20,24,26,28,30,32,34,36,38,40,42,46,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200];
	
	var obj = {
		colors:colors,
		//backColors:backColors,
		fonts:fonts,
		chars:chars,
		elements:elements,
		alignment:alignment,
		fontSizes:fontSizes,
		bold:false,
		italic:false,
		align:'left',
		vertAlign:'center',
		font:'Arial',
		fontSize:20,
		color:'#000',
		backColor:'#FFC',
		tempColor:'#000',
		tempBackColor:'#FFC',
		fontMenuShowing:false,
		colorMenuShowing:false,
		charMenuShowing:false,
		elementsMenuShowing:false,
		alignmentMenuShowing:false,
		fontSizeMenuShowing:false
	};

	// BOLD BUTTON
	obj.boldButton = createButton3(textMenuLeft,textMenuTop+30,30,30,true,false,true,zIndex);
	obj.boldButton.parent = obj;
	obj.boldButton.draw = function() {
		var ctx = obj.boldButton.ctx;
		ctx.clearRect(0,0,obj.boldButton.data[102],obj.boldButton.data[103]);
		if (obj.bold == true) {
			text({context:ctx,textArray:['<<bold:true>>B'],textAlign:'center',vertAlign:'middle',fontSize:22,box:{type:'loose',color:'#0F0'}});
		} else {
			text({context:ctx,textArray:['<<bold:true>>B'],textAlign:'center',vertAlign:'middle',fontSize:22});
		}
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.strokeRect(0,0,obj.boldButton.data[102],obj.boldButton.data[103]);
	}
	addListener(obj.boldButton,function(e) {
		e.target.parent.buttonPressed('bold');
	});
	
	// ITALIC BUTTON
	obj.italicButton = createButton3(textMenuLeft+30,textMenuTop+30,30,30,true,false,true,zIndex);
	obj.italicButton.parent = obj;
	obj.italicButton.draw = function() {
		var ctx = obj.italicButton.ctx;
		ctx.clearRect(0,0,obj.italicButton.data[102],obj.italicButton.data[103]);
		if (obj.italic == true) {
			text({context:ctx,textArray:['<<italic:true><<font:Times New Roman>>I'],textAlign:'center',vertAlign:'middle',fontSize:22,box:{type:'loose',color:'#0F0'}});			
		} else {
			text({context:ctx,textArray:['<<italic:true><<font:Times New Roman>>I'],textAlign:'center',vertAlign:'middle',fontSize:22});
		}
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.strokeRect(0,0,obj.italicButton.data[102],obj.italicButton.data[103]);
	}
	addListener(obj.italicButton, function (e) {
		e.target.parent.buttonPressed('italic');
	});
	
	// ALIGNMENT BUTTON
	obj.alignmentButton = createButton3(textMenuLeft+60,textMenuTop+30,30,30,true,false,true,zIndex);
	obj.alignmentButton.parent = obj;
	obj.alignmentButton.hover = false;
	obj.alignmentButton.draw = function (ctx,h,v,hover) {
		if (typeof ctx == 'undefined') ctx = obj.alignmentButton.ctx;
		if (typeof h == 'undefined') h = obj.align;
		if (typeof v == 'undefined') v = obj.vertAlign;
		if (typeof hover == 'undefined') hover = obj.alignmentButton.hover;
		ctx.clearRect(0,0,30,30);
		var x1,x2,x3,x4,y1,y2,y3;
		if (h == 'left') {
			x1 = 6;
			x2 = 20;
			x3 = 6;
			x4 = 15;
		} else if (h == 'center') {
			x1 = 8;
			x2 = 22;
			x3 = 11;
			x4 = 19;
		} else if (h == 'right') {
			x1 = 10;
			x2 = 24;
			x3 = 15;
			x4 = 24;
		}
		if (v == 'top') {
			y1 = 6;
			y2 = 10;
			y3 = 14;
		} else if (v == 'middle') {
			y1 = 11;
			y2 = 15;
			y3 = 19;
		} else if (v == 'bottom') {
			y1 = 16;
			y2 = 20;
			y3 = 24;
		}
		if (hover == true) {
			ctx.fillStyle = '#6FF';
		} else {
			ctx.fillStyle = '#CFF';
		}
		ctx.fillRect(0,0,30,30);
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.strokeRect(0,0,30,30);
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y1);
		ctx.moveTo(x3,y2);
		ctx.lineTo(x4,y2);
		ctx.moveTo(x1,y3);
		ctx.lineTo(x2,y3);
		ctx.closePath();
		ctx.stroke();
	}
	obj.alignmentButton.draw(obj.alignmentButton.ctx,obj.align,obj.vertAlign,obj.hover);
	addListener(obj.alignmentButton,function(e) {
		if (obj.alignmentMenuShowing == true) {
			obj.closeAlignmentMenu();
		} else {
			obj.openAlignmentMenu();
		}
	});	
	
	// ALIGNMENT MENU BUTTONS
	obj.alignmentMenuButton = [];
	for (var i = 0; i < alignment.length; i++) {
		obj.alignmentMenuButton[i] = createButton3(textMenuLeft+30+Math.floor(i/3)*30,textMenuTop+60+(i%3)*30,30,30,false,false,true,zIndex);
		obj.alignmentMenuButton[i].parent = obj;
		obj.alignmentMenuButton[i].h = obj.alignment[i].h;
		obj.alignmentMenuButton[i].v = obj.alignment[i].v;	
		obj.alignmentMenuButton[i].hover = false;
		obj.alignmentButton.draw(obj.alignmentMenuButton[i].ctx,obj.alignmentMenuButton[i].h,obj.alignmentMenuButton[i].v,obj.alignmentMenuButton[i].hover);
		addListener(obj.alignmentMenuButton[i], function(e) {
			var obj = e.target.parent;
			if (tableCellsSelectionTest() == true) {
				for (var i = 0; i < draw[taskId].path.length; i++) {
					if (draw[taskId].path[i].selected == true) {
						for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
							if (draw[taskId].path[i].obj[j].type == 'table' || draw[taskId].path[i].obj[j].type == 'table2') {
								var cells = draw[taskId].path[i].obj[j].cells;
								for (var r = 0; r < cells.length; r++) {
									for (var c = 0; c < cells[r].length; c++) {
										if (cells[r][c].selected == true && cells[r][c].highlight == true) {
											var input = draw[taskId].path[i].obj[j].mInputs[r][c];
											input.richText = removeTagsOfType(input.richText,'align');
											input.richText.unshift('<<align:'+e.target.h+'>>');							
											input.textAlign = e.target.h;
											input.vertAlign = e.target.v;
											drawMathsInputText(input);
										}
									}
								}
							}
						}
					}
				}		
				obj.update();
			} else {
				currMathsInput.vertAlign = e.target.v;
				mathsInputMapCursorPos();
				mathsInputCursorCoords();
				obj.insertAlignTag('<<align:'+e.target.h+'>>');
				obj.closeAlignmentMenu();
			}
		});
		obj.alignmentMenuButton[i].addEventListener('mouseenter', function (e) {
			e.target.hover = true;
			obj.alignmentButton.draw(e.target.ctx,e.target.h,e.target.v,e.target.hover);
		},false);
		obj.alignmentMenuButton[i].addEventListener('mouseleave', function (e) {
			e.target.hover = false;
			obj.alignmentButton.draw(e.target.ctx,e.target.h,e.target.v,e.target.hover);
		},false);		
	}
	
	obj.openAlignmentMenu = function() {
		for (var j = 0; j < obj.alignmentMenuButton.length; j++) {
			showObj(obj.alignmentMenuButton[j],obj.alignmentMenuButton[j].data);
		}
		obj.alignmentMenuShowing = true;
	}

	obj.closeAlignmentMenu = function() {
		for (var j = 0; j < obj.alignmentMenuButton.length; j++) {
			hideObj(obj.alignmentMenuButton[j],obj.alignmentMenuButton[j].data);
		}
		obj.alignmentMenuShowing = false;
	}
	
	obj.insertAlignTag = function (insertion) {
		var breakPoints = [];
		if (currMathsInput.selected == true) {
			selPos1 = currMathsInput.cursorMap[Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1])];
			selPos2 = currMathsInput.cursorMap[Math.max(currMathsInput.selectPos[0],currMathsInput.selectPos[1])];
			var lastSelLine = false;
			for (var k = 0; k < currMathsInput.breakPoints.length - 1; k++) {
				var thisBreakPoint = currMathsInput.allMap[currMathsInput.breakPoints[k]];
				if ((thisBreakPoint[0] > selPos1[0] || (thisBreakPoint[0] == selPos1[0] && thisBreakPoint[1] >= selPos1[1])) && (thisBreakPoint[0] < selPos2[0] || (thisBreakPoint[0] == selPos2[0] && thisBreakPoint[1] <= selPos2[1]))) {
					breakPoints.push(currMathsInput.allMap[currMathsInput.breakPoints[k]]);
				}
				if (thisBreakPoint[0] > selPos2[0] || (thisBreakPoint[0] == selPos2[0] && thisBreakPoint[1] >= selPos2[1])) {
					breakPoints.push(currMathsInput.allMap[currMathsInput.breakPoints[k]]);
					lastSelLine = true;
					break;
				}
			}
			if (lastSelLine == false) breakPoints.push(currMathsInput.allMap[currMathsInput.allMap.length - 1]);
		} else {
			var cursorMap = currMathsInput.cursorMap[currMathsInput.cursorPos];
			if (typeof currMathsInput.breakPoints == 'object') {
				for (var k = 0; k < currMathsInput.breakPoints.length - 1; k++) {
					var thisBreakPoint = currMathsInput.allMap[currMathsInput.breakPoints[k]];
					if (thisBreakPoint[0] > cursorMap[0] || (thisBreakPoint[0] == cursorMap[0] && thisBreakPoint[1] >= cursorMap[1])) {
						breakPoints.push(currMathsInput.allMap[currMathsInput.breakPoints[k]]);
						break;
					}
				}
			}
			if (breakPoints.length == 0) breakPoints.push(currMathsInput.allMap[currMathsInput.allMap.length - 1]);
		}
		
		for (var l = breakPoints.length - 1; l >= 0; l--) {
			// get the relevant string from currMathsInput.richText
			var text = currMathsInput.richText[breakPoints[l][0]];
			var pos = breakPoints[l][1];
			// adjust pos to account for breakPointss
			if (typeof currMathsInput.breakPoints == 'object') {
				for (var k = 0; k < currMathsInput.breakPoints.length - 1; k++) {
					var thisbreakPoint = currMathsInput.allMap[currMathsInput.breakPoints[k]];
					if (thisbreakPoint[0] == breakPoints[l][0] && thisbreakPoint[1] < breakPoints[l][1]) {
						pos--;
					}
				}
			}
			
			// check that a tag is not being split - if so adjust pos
			var leftText = text.slice(0,pos);
			var rightText = text.slice(pos)
			var tagLeft = false;
			var tagLeftCount = 0;
			for (var i = 0; i < leftText.length; i++) {
				tagLeftCount++;
				//console.log('left '+i+':',leftText.slice(leftText.length - i)); 
				if (leftText.slice(leftText.length - i).indexOf('>>') == 0) break;
				if (leftText.slice(leftText.length - i).indexOf('<<') == 0) {
					tagLeft = true;
					break;
				}
			}
			var tagRight = false;
			var tagRightCount = 0;
			for (var j = 0; j < rightText.length; j++) {
				tagRightCount++;
				//console.log('right '+j+':',rightText.slice(j));
				if (rightText.slice(j).indexOf('<<') == 0) break;
				if (rightText.slice(j).indexOf('>>') == 0) {
					tagRight = true;
					break;
				}
			}
			if (tagLeft == true && tagRight == true) {
				if (tagLeftCount <= tagRightCount) {
					pos -= tagLeftCount;	
				} else {
					pos += tagRightCount;
				}
			}
			// test if '<',slicePos,'<' or '>',slicePos,'>'
			if (leftText.slice(-1) == '<' && rightText.slice(0,1) == '<' && rightText.slice(0,2) !== '<<') pos--;
			if (leftText.slice(-1) == '>' && leftText.slice(-2) !== '>>' && rightText.slice(0,1) == '>') pos++;	
			var textBefore = text.slice(0,pos);
			var textAfter = text.slice(pos);
			
			if (textAfter.indexOf('<<br>>') == 0) {
				// get previous alignment tag
				var prevAlign = 'left'; // default
				for (var i = 0; i < currMathsInput.allMap.length; i++) {
					var map = currMathsInput.allMap[i];
					if (arraysEqual(map,breakPoints[l]) == true) break;
					var thisText = currMathsInput.richText;
					for (var j = 0; j < map.length - 1; j ++) {
						thisText = thisText[map[j]];
					}
					thisText = thisText.slice(map[map.length-1]);
					if (thisText.indexOf('<<align:') == 0) {
						prevAlign = thisText.slice(8,thisText.indexOf('>>'));
					}
				}
				textAfter = '<<br>><<align:' + prevAlign + '>>' + textAfter.slice(6);
			}
					
			text = textBefore + insertion + textAfter;
			// replace the string
			var evalString = 'currMathsInput.richText' 
			for (var aa = 0; aa < breakPoints[l].length - 1; aa++) {
				evalString += '[' + breakPoints[l][aa] + ']';
			}
			eval(evalString + ' = text;');
		}
		mathsInputMapCursorPos();
		mathsInputCursorCoords();
	}		
	
	// FONT BUTTON
	obj.fontButton = createButton3(textMenuLeft,textMenuTop,150,30,true,false,true,zIndex);
	obj.fontButton.parent = obj;
	obj.fontButton.draw = function () {
		obj.fontButton.ctx.clearRect(0,0,150,30);
		var fontNum;
		for (var i = 0; i < obj.fonts.length; i++) {
			if (obj.fonts[i].font == obj.font) {
				fontNum = i;
				break;	
			}
		}
		text({context:obj.fontButton.ctx,textArray:[obj.font],align:'center',font:obj.font,fontSize:obj.fonts[fontNum].displaySize,top:obj.fonts[fontNum].top})
		obj.fontButton.ctx.strokeStyle = '#000';
		obj.fontButton.ctx.lineWidth = 2;
		obj.fontButton.ctx.strokeRect(0,0,150,30);
	}
	addListener(obj.fontButton,function(e) {
		if (obj.fontMenuShowing == true) {
			obj.closeFontMenu();			
		} else {
			obj.openFontMenu();
		}
	});	
	
	// FONT MENU BUTTONS
	obj.fontMenuButton = [];
	for (var i = 0; i < fonts.length; i++) {
		obj.fontMenuButton[i] = createButton3(textMenuLeft,textMenuTop+30+30*i,150,30,false,false,true,zIndex);
		obj.fontMenuButton[i].parent = obj;
		obj.fontMenuButton[i].number = i;
		obj.fontMenuButton[i].hover = false;
		obj.fontMenuButton[i].draw = function() {
			var num = this.number;
			var ctx = obj.fontMenuButton[num].ctx;
			var font = obj.fonts[num];
			if (obj.fontMenuButton[num].hover == true) {
				ctx.fillStyle = '#6FF';				
			} else {
				ctx.fillStyle = '#CFF';
			}
			ctx.fillRect(0,0,150,30);
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.strokeRect(0,0,150,30);
			text({context:ctx,textArray:[font.font],align:'center',font:font.font,fontSize:font.displaySize,top:font.top});
		};
		addListener(obj.fontMenuButton[i], function(e) {
			var obj = e.target.parent;
			obj.buttonPressed('font',obj.fonts[e.target.number].font);
			obj.closeFontMenu();
		});
		obj.fontMenuButton[i].addEventListener('mouseenter', function (e) {
			e.target.hover = true;
			e.target.draw();
		},false);
		obj.fontMenuButton[i].addEventListener('mouseleave', function (e) {
			e.target.hover = false;
			e.target.draw();
		},false);
	}
	
	obj.openFontMenu = function() {
		for (var j = 0; j < obj.fontMenuButton.length; j++) {
			showObj(obj.fontMenuButton[j],obj.fontMenuButton[j].data);
		}
		obj.fontMenuShowing = true;
	}

	obj.closeFontMenu = function() {
		for (var j = 0; j < obj.fontMenuButton.length; j++) {
			obj.fontMenuButton[j].hover = false;
			obj.fontMenuButton[j].draw();			
			hideObj(obj.fontMenuButton[j],obj.fontMenuButton[j].data);
		}
		obj.fontMenuShowing = false;
	}
	
	// COLOR BUTTON
	obj.colorButton = createButton3(textMenuLeft+150,textMenuTop,30,30,true,false,true,zIndex);
	obj.colorButton.parent = obj;
	obj.colorButton.draw = function () {
		var ctx = obj.colorButton.ctx;
		ctx.clearRect(0,0,30,30);
		if (typeof obj.tempBackColor == 'undefined' || obj.tempBackColor == 'none') obj.tempBackColor = '#FFC';
		ctx.fillStyle = obj.tempBackColor;
		ctx.fillRect(0,0,30,30);
		text({context:ctx,textArray:['A'],align:'center',font:'Arial',fontSize:24,color:obj.tempColor})
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.strokeRect(0,0,30,30);
	}
	addListener(obj.colorButton,function(e) {
		if (obj.colorMenuShowing == true) {
			obj.closeColorMenu();
		} else {
			obj.openColorMenu();
		}
	});	
	
	// COLOR MENU BUTTONS
	obj.colorMenuButton = [];
	for (var i = 0; i < colors.length; i++) {
		obj.colorMenuButton[i] = createButton3(textMenuLeft+70+Math.floor(i/5)*30,textMenuTop+30+(i%5)*30,30,30,false,false,true,zIndex);
		obj.colorMenuButton[i].parent = obj;
		obj.colorMenuButton[i].color = obj.colors[i].color;
		obj.colorMenuButton[i].draw = function() {
			var ctx = this.ctx;
			ctx.fillStyle = this.color;
			ctx.fillRect(0,0,30,30);
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.strokeRect(0,0,30,30);
		};
		addListener(obj.colorMenuButton[i], function(e) {
			var obj = e.target.parent;
			obj.buttonPressed('color',e.target.color);
			obj.closeColorMenu();
		});
		obj.colorMenuButton[i].addEventListener('mouseenter', function (e) {
			var obj = e.target.parent;
			obj.tempColor = e.target.color;
			obj.colorButton.draw();
		},false);
		obj.colorMenuButton[i].addEventListener('mouseleave', function (e) {
			var obj = e.target.parent;
			obj.tempColor = obj.color;
			obj.colorButton.draw();
		},false);
	}
	
	// BACK COLOR MENU BUTTONS
	obj.backColorMenuButton = [];
	for (var i = 0; i < colors.length; i++) {
		obj.colorMenuButton[i+colors.length] = createButton3(textMenuLeft+170+Math.floor(i/5)*30,textMenuTop+30+(i%5)*30,30,30,false,false,true,zIndex);
		obj.colorMenuButton[i+colors.length].parent = obj;
		obj.colorMenuButton[i+colors.length].color = obj.colors[i].color;
		obj.colorMenuButton[i+colors.length].draw = function() {
			var ctx = this.ctx;
			ctx.fillStyle = this.color;
			ctx.fillRect(0,0,30,30);
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.strokeRect(0,0,30,30);
		};
		addListener(obj.colorMenuButton[i+colors.length], function(e) {
			var obj = e.target.parent;
			obj.buttonPressed('backColor',e.target.color);
			obj.closeColorMenu();
		});
		obj.colorMenuButton[i+colors.length].addEventListener('mouseenter', function (e) {
			var obj = e.target.parent;
			obj.tempBackColor = e.target.color;
			obj.colorButton.draw();
		},false);
		obj.colorMenuButton[i+colors.length].addEventListener('mouseleave', function (e) {
			var obj = e.target.parent;
			obj.tempBackColor = obj.backColor;
			obj.colorButton.draw();
		},false);
	}	
	
	obj.openColorMenu = function() {
		for (var j = 0; j < obj.colorMenuButton.length; j++) {
			showObj(obj.colorMenuButton[j],obj.colorMenuButton[j].data);
		}
		obj.colorMenuShowing = true;
	}

	obj.closeColorMenu = function() {
		for (var j = 0; j < obj.colorMenuButton.length; j++) {
			hideObj(obj.colorMenuButton[j],obj.colorMenuButton[j].data);
		}
		obj.colorMenuShowing = false;
	}
	
	
	// FONT SIZE BUTTON
	obj.fontSizeButton = createButton3(textMenuLeft+120,textMenuTop+30,30,30,true,false,true,zIndex);
	obj.fontSizeButton.parent = obj;
	obj.fontSizeButton.draw = function () {
		var ctx = obj.fontSizeButton.ctx;
		ctx.clearRect(0,0,30,30);
		ctx.fillStyle = '#CCF';
		ctx.fillRect(0,0,30,30);
		text({context:ctx,textArray:[String(obj.fontSize)],align:'center',fontSize:20,top:2});
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.strokeRect(0,0,30,30);
	}
	addListener(obj.fontSizeButton,function(e) {
		if (obj.fontSizeMenuShowing == true) {
			obj.closeFontSizeMenu();
		} else {
			obj.openFontSizeMenu();
		}
	});	
	
	// FontSize MENU BUTTONS
	obj.fontSizeMenuButton = [];
	for (var i = 0; i < fontSizes.length; i++) {
		obj.fontSizeMenuButton[i] = createButton3(textMenuLeft+60+(i%3)*60,textMenuTop+60+Math.floor(i/3)*60,60,60,false,false,true,zIndex);
		obj.fontSizeMenuButton[i].parent = obj;
		obj.fontSizeMenuButton[i].fontSize = obj.fontSizes[i];
		obj.fontSizeMenuButton[i].hover = false;
		obj.fontSizeMenuButton[i].draw = function() {
			var ctx = this.ctx;
			if (this.hover == true) {
				ctx.fillStyle = '#6FF';
			} else {
				ctx.fillStyle = '#CFF';
			}
			ctx.fillRect(0,0,60,60);
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.strokeRect(0,0,60,60);
			var fontSize = this.fontSize;
			if (fontSize > 50) fontSize = 25;
			text({context:ctx,left:0,top:0,width:60,height:60,vertAlign:'middle',textArray:['<<fontSize:'+fontSize+'>><<align:center>>'+this.fontSize]});
		};
		obj.fontSizeMenuButton[i].draw();
		addListener(obj.fontSizeMenuButton[i], function(e) {
			var obj = e.target.parent;
			obj.buttonPressed('fontSize',e.target.fontSize);
			obj.closeFontSizeMenu();
		});
		obj.fontSizeMenuButton[i].addEventListener('mouseenter', function (e) {
			e.target.hover = true;
			e.target.draw();
		},false);
		obj.fontSizeMenuButton[i].addEventListener('mouseleave', function (e) {
			e.target.hover = false;
			e.target.draw();
		},false);		
	}
	
	obj.openFontSizeMenu = function() {
		for (var j = 0; j < obj.fontSizeMenuButton.length; j++) {
			showObj(obj.fontSizeMenuButton[j],obj.fontSizeMenuButton[j].data);
		}
		obj.fontSizeMenuShowing = true;
	}

	obj.closeFontSizeMenu = function() {
		for (var j = 0; j < obj.fontSizeMenuButton.length; j++) {
			obj.fontSizeMenuButton[j].hover = false;
			obj.fontSizeMenuButton[j].draw();
			hideObj(obj.fontSizeMenuButton[j],obj.fontSizeMenuButton[j].data);
		}
		obj.fontSizeMenuShowing = false;
	}
	
	// FONT SIZE +/- BUTTONS
	obj.fontSizeMinusButton = createButton3(textMenuLeft+90,textMenuTop+30,30,30,true,false,true,zIndex);
	obj.fontSizeMinusButton.parent = obj;
	obj.fontSizeMinusButton.draw = function () {
		var ctx = obj.fontSizeMinusButton.ctx;
		ctx.clearRect(0,0,30,30);
		ctx.fillStyle = '#CCF';
		ctx.fillRect(0,0,30,30);
		text({context:ctx,textArray:['-'],align:'center',fontSize:25,top:-2,backgroundColor:'#CCF'});
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.strokeRect(0,0,30,30);
	}
	obj.fontSizeMinusButton.draw();	
	addListener(obj.fontSizeMinusButton,function(e) {
		obj.buttonPressed('fontSize',obj.fontSize-1);
	});
	
	obj.fontSizePlusButton = createButton3(textMenuLeft+150,textMenuTop+30,30,30,true,false,true,zIndex);
	obj.fontSizePlusButton.parent = obj;
	obj.fontSizePlusButton.draw = function () {
		var ctx = obj.fontSizePlusButton.ctx;
		ctx.clearRect(0,0,30,30);
		ctx.fillStyle = '#CCF';
		ctx.fillRect(0,0,30,30);		
		text({context:ctx,textArray:['+'],align:'center',fontSize:25,top:-2,backgroundColor:'#CCF'});
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.strokeRect(0,0,30,30);
	}
	obj.fontSizePlusButton.draw();
	addListener(obj.fontSizePlusButton,function(e) {
		obj.buttonPressed('fontSize',obj.fontSize+1);
	});	

	// CHAR BUTTON
	obj.charButton = createButton3(textMenuLeft+210,textMenuTop,30,30,true,false,true,zIndex);
	obj.charButton.parent = obj;
	obj.charButton.draw = function () {
		var ctx = obj.charButton.ctx;
		text({context:ctx,textArray:['<<font:Times New Roman>>'+String.fromCharCode(0x03C0)],align:'center',fontSize:25});
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.strokeRect(0,0,30,30);
	}
	obj.charButton.draw();
	addListener(obj.charButton,function(e) {
		if (obj.charMenuShowing == true) {
			obj.closeCharMenu();
		} else {
			obj.openCharMenu();
		}
	});	
	
	// CHAR MENU BUTTONS
	obj.charMenuButton = [];
	for (var i = 0; i < chars.length; i++) {
		obj.charMenuButton[i] = createButton3(textMenuLeft+40+(i%5)*40,textMenuTop+30+40*Math.floor(i/5),40,40,false,false,true,zIndex);
		obj.charMenuButton[i].parent = obj;
		obj.charMenuButton[i].char = obj.chars[i].char;
		obj.charMenuButton[i].hover = false;
		obj.charMenuButton[i].draw = function() {
			var ctx = this.ctx;
			ctx.clearRect(0,0,40,40);
			if (this.hover == true) {
				ctx.fillStyle = '#6FF';
			} else {
				ctx.fillStyle = '#CFF';				
			}
			ctx.fillRect(0,0,40,40);	
			text({context:ctx,textArray:['<<font:Times New Roman>>'+String.fromCharCode(this.char)],align:'center',fontSize:28,vertAlign:'middle'});
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#000';
			ctx.strokeRect(0,0,40,40);
		};
		obj.charMenuButton[i].draw();
		addListener(obj.charMenuButton[i], function(e) {
			var obj = e.target.parent;
			obj.buttonPressed('char',e.target.char);
			obj.closeCharMenu();
		});
		obj.charMenuButton[i].addEventListener('mouseenter', function (e) {
			e.target.hover = true;
			e.target.draw();
		},false);
		obj.charMenuButton[i].addEventListener('mouseleave', function (e) {
			e.target.hover = false;
			e.target.draw();
		},false);
	}
	
	obj.openCharMenu = function() {
		for (var j = 0; j < obj.charMenuButton.length; j++) {
			obj.charMenuButton[j].hover = false;
			obj.charMenuButton[j].draw();			
			showObj(obj.charMenuButton[j],obj.charMenuButton[j].data);
		}
		obj.charMenuShowing = true;
	}

	obj.closeCharMenu = function() {
		for (var j = 0; j < obj.charMenuButton.length; j++) {
			obj.charMenuButton[j].hover = false;
			obj.charMenuButton[j].draw();			
			hideObj(obj.charMenuButton[j],obj.charMenuButton[j].data);
		}
		obj.charMenuShowing = false;
	}

	// ELEMENTS BUTTON
	obj.elementsButton = createButton3(textMenuLeft+180,textMenuTop,30,30,true,false,true,zIndex);
	obj.elementsButton.parent = obj;
	obj.elementsButton.draw = function () {
		var ctx = obj.elementsButton.ctx;
		text({context:ctx,textArray:['<<font:algebra>>x',['pow',false,['']]],align:'center',fontSize:20,vertAlign:'middle'});
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.strokeRect(0,0,30,30);
	}
	obj.elementsButton.draw();
	addListener(obj.elementsButton,function(e) {
		if (obj.elementsMenuShowing == true) {
			obj.closeElementsMenu();
		} else {
			obj.openElementsMenu();
		}
	});
	// ELEMENTS MENU BUTTONS
	obj.elementsMenuButton = [];
	for (var i = 0; i < elements.length; i++) {
		obj.elementsMenuButton[i] = createButton3(textMenuLeft+0+(i%3)*80,textMenuTop+30+60*Math.floor(i/3),80,60,false,false,true,zIndex);
		obj.elementsMenuButton[i].parent = obj;
		obj.elementsMenuButton[i].display = obj.elements[i].display;
		obj.elementsMenuButton[i].top = obj.elements[i].top;
		obj.elementsMenuButton[i].func = obj.elements[i].func;
		obj.elementsMenuButton[i].hover = false;
		obj.elementsMenuButton[i].draw = function() {
			var ctx = this.ctx;
			ctx.clearRect(0,0,80,60);
			if (this.hover == true) {
				ctx.fillStyle = '#6FF';
			} else {
				ctx.fillStyle = '#CFF';				
			}
			ctx.fillRect(0,0,80,60);
			text({
				context:ctx,
				textArray:this.display,
				textAlign:'center',
				vertAlign:'middle',
				fontSize:20,
				font:'algebra',
				varSize:{minWidth:80,maxWidth:80,minHeight:60,maxHeight:60,padding:0},
			});
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#000';
			ctx.strokeRect(0,0,80,60);
		};
		obj.elementsMenuButton[i].draw();
		addListener(obj.elementsMenuButton[i], function(e) {
			eval(this.func+'()');
			obj.closeElementsMenu();			
		});
		obj.elementsMenuButton[i].addEventListener('mouseenter', function (e) {
			e.target.hover = true;
			e.target.draw();
		},false);
		obj.elementsMenuButton[i].addEventListener('mouseleave', function (e) {
			e.target.hover = false;
			e.target.draw();
		},false);
	}
	obj.openElementsMenu = function() {
		for (var j = 0; j < obj.elementsMenuButton.length; j++) {
			showObj(obj.elementsMenuButton[j],obj.elementsMenuButton[j].data);
		}
		obj.elementsMenuShowing = true;
	}
	obj.closeElementsMenu = function() {
		for (var j = 0; j < obj.elementsMenuButton.length; j++) {
			obj.elementsMenuButton[j].hover = false;
			obj.elementsMenuButton[j].draw();
			hideObj(obj.elementsMenuButton[j],obj.elementsMenuButton[j].data);
		}
		obj.elementsMenuShowing = false;
	}

	// LINE SPACING BUTTON
	obj.lineSpacingButton = createButton3(textMenuLeft+180,textMenuTop+30,60,30,true,false,true,zIndex);
	obj.lineSpacingButton.parent = obj;
	obj.lineSpacingButton.draw = function () {
		var ctx = obj.lineSpacingButton.ctx;
		ctx.clearRect(0,0,60,30);
		ctx.fillStyle = '#CFF';
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.fillRect(0,0,60,30);
		ctx.strokeRect(0,0,60,30);
		ctx.moveTo(6,6);
		ctx.lineTo(20,6);
		ctx.moveTo(6,24);
		ctx.lineTo(20,24);
		ctx.stroke();
		drawArrow({ctx:ctx,startX:13,startY:6,finX:13,finY:24,doubleEnded:true,arrowLength:5,fillArrow:true,color:'#00F',lineWidth:1});
		text({context:ctx,textArray:[String(this.parent.lineSpacingFactor)],align:'center',fontSize:16,vertAlign:'middle',left:20,width:40});
	}
	obj.lineSpacingButton.draw();
	addListener(obj.lineSpacingButton,function(e) {
		if (obj.lineSpacingMenuShowing == true) {
			obj.closelineSpacingMenu();
		} else {
			obj.openlineSpacingMenu();
		}
	});
	// LINE SPACING MENU BUTTONS
	obj.lineSpacingMenuButton = [];
	// minus, plus, fixed, variable
	var l = [textMenuLeft+180,textMenuLeft+180+30,textMenuLeft+180,textMenuLeft+180];
	var t = [textMenuTop+60,textMenuTop+60,textMenuTop+90,textMenuTop+120];
	var w = [30,30,60,60];
	var h = [30,30,30,30];
	for (var i = 0; i < 4; i++) {
		obj.lineSpacingMenuButton[i] = createButton3(l[i],t[i],w[i],h[i],false,false,true,zIndex);
		obj.lineSpacingMenuButton[i].parent = obj;
		obj.lineSpacingMenuButton[i].hover = false;
		obj.lineSpacingMenuButton[i].l = l[i];
		obj.lineSpacingMenuButton[i].t = t[i];
		obj.lineSpacingMenuButton[i].w = w[i];
		obj.lineSpacingMenuButton[i].h = h[i];
		obj.lineSpacingMenuButton[i].display = [['-'],['+'],['variable'],['fixed']][i];
		obj.lineSpacingMenuButton[i].fontSize = [20,20,15,15][i];
		obj.lineSpacingMenuButton[i].draw = function() {
			var ctx = this.ctx;
			ctx.clearRect(0,0,this.w,this.h);
			ctx.fillStyle = '#CFF';
			if ((this.display == 'variable' || this.display == 'fixed') && this.parent.lineSpacingStyle == this.display) {
				ctx.fillStyle = '#3FF';
			}
			ctx.fillRect(0,0,80,60);
			text({
				context:ctx,
				textArray:this.display,
				textAlign:'center',
				vertAlign:'middle',
				fontSize:this.fontSize,
			});
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#000';
			ctx.strokeRect(0,0,this.w,this.h);
		};
		obj.lineSpacingMenuButton[i].draw();
		addListener(obj.lineSpacingMenuButton[i], function(e) {
			this.func();
			this.parent.update();
		});
	}
	obj.lineSpacingMenuButton[0].func = function() {
		setLineSpacingFactor(roundToNearest(this.parent.lineSpacingFactor-0.05,0.05));
	}
	obj.lineSpacingMenuButton[1].func = function() {
		setLineSpacingFactor(roundToNearest(this.parent.lineSpacingFactor+0.05,0.05));
	}
	obj.lineSpacingMenuButton[2].func = function() {
		setLineSpacingStyle('variable');
	}
	obj.lineSpacingMenuButton[3].func = function() {
		setLineSpacingStyle('fixed');
	}
	obj.openlineSpacingMenu = function() {
		for (var j = 0; j < obj.lineSpacingMenuButton.length; j++) {
			showObj(obj.lineSpacingMenuButton[j],obj.lineSpacingMenuButton[j].data);
		}
		obj.lineSpacingMenuShowing = true;
	}
	obj.closelineSpacingMenu = function() {
		for (var j = 0; j < obj.lineSpacingMenuButton.length; j++) {
			obj.lineSpacingMenuButton[j].hover = false;
			obj.lineSpacingMenuButton[j].draw();
			hideObj(obj.lineSpacingMenuButton[j],obj.lineSpacingMenuButton[j].data);
		}
		obj.lineSpacingMenuShowing = false;
	}
	
	endInputExceptions.push(obj.boldButton,obj.italicButton,obj.leftAlignButton,obj.rightAlignButton,obj.centerAlignButton,obj.fontButton,obj.colorButton,obj.fontSizeButton,obj.fontSizeMinusButton,obj.fontSizePlusButton,obj.charButton,obj.elementsButton,obj.alignmentButton,obj.lineSpacingButton);	
	for (var i = 0; i < obj.fontMenuButton.length; i++) {
		endInputExceptions.push(obj.fontMenuButton[i]);
	}
	for (var i = 0; i < obj.colorMenuButton.length; i++) {
		endInputExceptions.push(obj.colorMenuButton[i]);
	}
	for (var i = 0; i < obj.charMenuButton.length; i++) {
		endInputExceptions.push(obj.charMenuButton[i]);
	}	
	for (var i = 0; i < obj.elementsMenuButton.length; i++) {
		endInputExceptions.push(obj.elementsMenuButton[i]);
	}
	for (var i = 0; i < obj.alignmentMenuButton.length; i++) {
		endInputExceptions.push(obj.alignmentMenuButton[i]);
	}
	for (var i = 0; i < obj.fontSizeMenuButton.length; i++) {
		endInputExceptions.push(obj.fontSizeMenuButton[i]);
	}
	for (var i = 0; i < obj.lineSpacingMenuButton.length; i++) {
		endInputExceptions.push(obj.lineSpacingMenuButton[i]);
	}	
	
	obj.buttonPressed = function (button,value) {
		//console.log('buttonPressed:',button,value);	
		switch (button) {
			case 'bold':
				obj.bold = !obj.bold;
				value = String(obj.bold);
				break;
			case 'italic':
				obj.italic = !obj.italic;
				value = String(obj.italic);
				break;
			case 'font':
				obj.font = value;
				break;
			case 'fontSize':
				obj.fontSize = value;
				break;
			case 'color':
				obj.color = value;
				obj.tempColor = value;
				break;
			case 'backColor':
				obj.backColor = value;
				obj.tempBackColor = value;
				break;			
			case 'char':
				obj.insertText(String.fromCharCode(value));
				return;
		}
		
		if (tableCellsSelectionTest() == true) {
			obj.insertTagTableCells(button,value);
		} else if (currMathsInput.selected == true) {
			obj.insertTagSelected(button,value);
		} else {
			obj.insertTag(button,value);
		}
	}
	obj.insertTagTableCells = function (tagType,value) {
		var insertion = '<<'+tagType+':'+value+'>>';
		for (var i = 0; i < draw[taskId].path.length; i++) {
			if (draw[taskId].path[i].selected == true) {
				for (var j = 0; j < draw[taskId].path[i].obj.length; j++) {
					if (draw[taskId].path[i].obj[j].type == 'table' || draw[taskId].path[i].obj[j].type == 'table2') {
						var cells = draw[taskId].path[i].obj[j].cells;
						for (var r = 0; r < cells.length; r++) {
							for (var c = 0; c < cells[r].length; c++) {
								if (cells[r][c].selected == true && cells[r][c].highlight == true) {
									var input = draw[taskId].path[i].obj[j].mInputs[r][c];
									input.richText = removeTagsOfType(input.richText,tagType);
									input.richText.unshift(insertion);
									
									if (!un(input.startTags)) {
										input.startTags = removeTagsOfType(input.startTags,tagType);
										input.startTags = insertion + input.startTags;
									}
									if (!un(input.startRichText)) {
										input.startRichText = removeTagsOfType(input.startRichText,tagType);
										input.startRichText.unshift(insertion);
									}
																		
									drawMathsInputText(input);
								}
							}
						}
					}
				}
			}
		}		
		obj.update();		
	}
	
	obj.insertTag = function (tagType,value) {
		var insertion = '<<'+tagType+':'+value+'>>';
		var cursorMap = currMathsInput.cursorMap;
		var cursorPos = cursorMap[currMathsInput.cursorPos];
		var prevTag = '';
		// find previous tag of this type
		for (var pos2 = 0; pos2 < currMathsInput.allMap.length; pos2++) {
			if (arraysEqual(currMathsInput.allMap[pos2],currMathsInput.cursorMap[currMathsInput.cursorPos]) == true) break;
			var map = currMathsInput.allMap[pos2];
			if (map == cursorPos) break;
			var text2 = clone(currMathsInput.richText);
			for (var aa = 0; aa < map.length - 1; aa++) {
				text2 = text2[map[aa]];
			}
			text2 = text2.slice(map[map.length-1]);
			if (text2.indexOf('<<'+tagType+':') == 0) {
				for (var bb = 0; bb < text2.length; bb++) {
					if (text2.slice(Number(bb)).indexOf('>>') == 0) {
						prevTag = text2.slice(0,Number(bb)+2);
						break;
					}
				}
			}
		}
		currMathsInput.preText += insertion;
		// if cursor is not at the end of the text
		if (currMathsInput.cursorPos < cursorMap.length - 1) {
			currMathsInput.postText += prevTag;
		}
		
		//logText();
		obj.update();		
	}	
	
	obj.insertTagSelected = function (tagType,value) {
		// insert a tag when text is selected
		var newTag = '<<'+tagType+':'+value+'>>';
		var cursorMap = currMathsInput.cursorMap;
		var startPos = cursorMap[Math.min(currMathsInput.selectPos[0],currMathsInput.selectPos[1])];
		var endPos = cursorMap[Math.max(currMathsInput.selectPos[0],currMathsInput.selectPos[1])];
		var prevTag = '';
		// find previous tag of this type
		for (var pos2 = 0; pos2 < currMathsInput.allMap.length; pos2++) {
			var map = currMathsInput.allMap[pos2];
			if (arraysEqual(map,endPos) == true) break;
			var text2 = currMathsInput.richText;
			for (var aa = 0; aa < map.length - 1; aa++) {
				text2 = text2[map[aa]];
			}
			text2 = text2.slice(map[map.length-1]);
			if (text2.indexOf('<<'+tagType+':') == 0) {
				for (var bb = 0; bb < text2.length; bb++) {
					if (text2.slice(Number(bb)).indexOf('>>') == 0) {
						prevTag = text2.slice(0,Number(bb)+2);
						break;
					}
				}
			}
		}
		// insert prevTag at endPos
		var text = currMathsInput.richText;
		for (var i = 0; i < endPos.length - 1; i++) {
			text = text[endPos[i]];
		}
		var slicePos = text.indexOf('<<selected:false>>')+18; // insert the tag just after <<selected:false>>
		//console.log('a',slicePos, text.slice(0, slicePos));
		/*var slicePos = endPos[endPos.length - 1] + 18;
		slicePos = adjustForBreakPoints(slicePos);
		// check that a tag is not being split - if so adjust slicePos
		var leftText = text.slice(0,slicePos);
		var rightText = text.slice(slicePos);
		var tagLeft = false;
		var tagLeftCount = 0;
		for (var i = 0; i < leftText.length; i++) {
			tagLeftCount++;
			if (leftText.slice(leftText.length - i).indexOf('>>') == 0) break;
			if (leftText.slice(leftText.length - i).indexOf('<<') == 0) {
				tagLeft = true;
				break;
			}
		}
		var tagRight = false;
		var tagRightCount = 0;
		for (var j = 0; j < rightText.length; j++) {
			tagRightCount++;
			if (rightText.slice(j).indexOf('<<') == 0) break;
			if (rightText.slice(j).indexOf('>>') == 0) {
				tagRight = true;
				break;
			}
		}
		if (tagLeft == true && tagRight == true) {
			if (tagLeftCount <= tagRightCount) {
				slicePos -= tagLeftCount;	
			} else {
				slicePos += tagRightCount;
			}
		}
		// test if '<',slicePos,'<' or '>',slicePos,'>'
		if (leftText.slice(-1) == '<' && rightText.slice(0,1) == '<' && rightText.slice(0,2) !== '<<') slicePos--;
		if (leftText.slice(-1) == '>' && leftText.slice(-2) !== '>>' && rightText.slice(0,1) == '>') slicePos++;
		*/
		//console.log('left:',text.slice(0, slicePos),'newTag:',newTag,'right:',text.slice(slicePos));
		text = text.slice(0, slicePos) + prevTag + text.slice(slicePos);

		// replace the string
		var evalString = 'currMathsInput.richText' 
		for (var i = 0; i < endPos.length - 1; i++) {
			// ugly string creation apprach in order to use eval()
			evalString += '[' + endPos[i] + ']';
		}
		eval(evalString + ' = text;');
	
		// remove any tags of this type in selected text
		var sel = false;
		for (var pos2 = currMathsInput.allMap.length - 1; pos2 >= 0; pos2--) {
			var map = currMathsInput.allMap[pos2];
			if (arraysEqual(map,endPos) == true) sel = true;
			if (sel == true) {
				var text = currMathsInput.richText;
				for (var aa = 0; aa < map.length - 1; aa++) {
					text = text[map[aa]];
				}
				var text2 = text.slice(map[map.length-1]);
				if (text2.indexOf('<<'+tagType+':') == 0) {
					var tagLength = text2.indexOf('>>') + 2;
					var text3 = text.slice(0,map[map.length-1]) + text.slice(map[map.length-1] + tagLength);

					// replace the string
					var evalString = 'currMathsInput.richText' 
					for (var i = 0; i < map.length - 1; i++) {
						// ugly string creation apprach in order to use eval()
						evalString += '[' + map[i] + ']';
					}
					eval(evalString + ' = text3;');
				}
			}
			if (arraysEqual(map,startPos) == true) {
				break;
				sel = false;
			}			
		}		
		
		// insert newTag at startPos
		var text = currMathsInput.richText;
		for (var i = 0; i < startPos.length - 1; i++) {
			text = text[startPos[i]];
		}
		var slicePos = text.indexOf('<<selected:true>>'); // insert the tag just before <<selected:true>>
		//console.log('a',slicePos, text.slice(0, slicePos));
		
		/*
		console.log('text:',text);
		var slicePos = startPos[startPos.length - 1];
		console.log('a',slicePos, text.slice(0, slicePos));
		//slicePos = adjustForBreakPoints(slicePos);
		console.log('b',slicePos, text.slice(0, slicePos));
		// check that a tag is not being split - if so adjust slicePos
		var leftText = text.slice(0,slicePos);
		var rightText = text.slice(slicePos);
		var tagLeft = false;
		var tagLeftCount = 0;
		for (var i = 0; i < leftText.length; i++) {
			tagLeftCount++;
			if (leftText.slice(leftText.length - i).indexOf('>>') == 0) break;
			if (leftText.slice(leftText.length - i).indexOf('<<') == 0) {
				tagLeft = true;
				break;
			}
		}
		var tagRight = false;
		var tagRightCount = 0;
		for (var j = 0; j < rightText.length; j++) {
			tagRightCount++;
			if (rightText.slice(j).indexOf('<<') == 0) break;
			if (rightText.slice(j).indexOf('>>') == 0) {
				tagRight = true;
				break;
			}
		}
		if (tagLeft == true && tagRight == true) {
			if (tagLeftCount <= tagRightCount) {
				slicePos -= tagLeftCount;	
			} else {
				slicePos += tagRightCount;
			}
		}
		console.log('c',slicePos, text.slice(0, slicePos));
		// test if '<',slicePos,'<' or '>',slicePos,'>'
		if (leftText.slice(-1) == '<' && rightText.slice(0,1) == '<' && rightText.slice(0,2) !== '<<') slicePos--;
		if (leftText.slice(-1) == '>' && leftText.slice(-2) !== '>>' && rightText.slice(0,1) == '>') slicePos++;
		console.log('d',slicePos, text.slice(0, slicePos));
		*/
		
		//console.log('left:',text.slice(0, slicePos),'newTag:',newTag,'right:',text.slice(slicePos));
	
		text = text.slice(0, slicePos) + newTag + text.slice(slicePos);

		// replace the string
		var evalString = 'currMathsInput.richText' 
		for (var i = 0; i < startPos.length - 1; i++) {
			// ugly string creation apprach in order to use eval()
			evalString += '[' + startPos[i] + ']';
		}
		eval(evalString + ' = text;');

		mathsInputMapCursorPos();
		
		obj.update();
	}
	
	obj.insertText = function (insertion,moveCursorBy) {
		if (typeof moveCursorBy !== 'number') moveCursorBy = 1;
		// get the relevant string from currMathsInput.richText
		var cursorMap = currMathsInput.cursorMap;
		var cursorPos = cursorMap[currMathsInput.cursorPos];
		var text = currMathsInput.richText;
		for (var aa = 0; aa < cursorPos.length - 1; aa++) {
			text = text[cursorPos[aa]];
		}
		// pos is position of cursor
		var pos = cursorPos[cursorPos.length - 1];
		// adjust pos to account for breakPoints
		if (typeof currMathsInput.breakPoints == 'object') {
			for (var k = 0; k < currMathsInput.breakPoints.length - 1; k++) {
				var breakPoint = currMathsInput.allMap[currMathsInput.breakPoints[k]];
				if (breakPoint[0] == cursorPos[0] && breakPoint[1] < cursorPos[1]) {
					pos--;
				}
			}
		}
		// check that a tag is not being split - if so adjust pos
		var leftText = text.slice(0,pos);
		var rightText = text.slice(pos)
		var tagLeft = false;
		var tagLeftCount = 0;
		for (var i = 0; i < leftText.length; i++) {
			tagLeftCount++;
			//console.log('left '+i+':',leftText.slice(leftText.length - i)); 
			if (leftText.slice(leftText.length - i).indexOf('>>') == 0) break;
			if (leftText.slice(leftText.length - i).indexOf('<<') == 0) {
				tagLeft = true;
				break;
			}
		}
		var tagRight = false;
		var tagRightCount = 0;
		for (var j = 0; j < rightText.length; j++) {
			tagRightCount++;
			//console.log('right '+j+':',rightText.slice(j));
			if (rightText.slice(j).indexOf('<<') == 0) break;
			if (rightText.slice(j).indexOf('>>') == 0) {
				tagRight = true;
				break;
			}
		}
		if (tagLeft == true && tagRight == true) {
			if (tagLeftCount <= tagRightCount) {
				pos -= tagLeftCount;	
			} else {
				pos += tagRightCount;
			}
		}
		// test if '<',slicePos,'<' or '>',slicePos,'>'
		if (leftText.slice(-1) == '<' && rightText.slice(0,1) == '<' && rightText.slice(0,2) !== '<<') pos--;
		if (leftText.slice(-1) == '>' && leftText.slice(-2) !== '>>' && rightText.slice(0,1) == '>') pos++;	
		var textBefore = text.slice(0,pos);
		var textAfter = text.slice(pos);
		text = textBefore + currMathsInput.preText + insertion + currMathsInput.postText + textAfter;
		// replace the string
		var evalString = 'currMathsInput.richText' 
		for (aa = 0; aa < cursorPos.length - 1; aa++) {
			evalString += '[' + cursorPos[aa] + ']';
		}
		eval(evalString + ' = text;');
		mathsInputMapCursorPos();
		currMathsInput.cursorPos += moveCursorBy;
		mathsInputCursorCoords();
		currMathsInput.preText = '';
		currMathsInput.postText = '';			
	}	
	
	obj.update = function () {
		//console.log(obj);
		
		if (typeof currMathsInput == 'undefined') {
			this.font = 'Arial';
			this.fontButton.draw();
			this.fontSize = 30;
			this.fontSizeButton.draw();
			this.color = '#000';
			this.tempColor = '#000';
			this.backColor = 'none';
			this.tempBackColor = 'none';
			this.colorButton.draw();
			this.bold = false;
			this.boldButton.draw();
			this.italic = false;
			this.italicButton.draw();
			this.align = 'center';
			this.vertAlign = 'middle';
			this.alignmentButton.draw(this.alignmentButton.ctx,this.align,this.vertAlign);			
			return;
		}
		var currFont = 'Arial';
		var currFontSize = '20';
		var currColor = '#000';
		var currBackColor = 'none';
		var currBold = 'false';
		var currItalic = 'false';
		var currAlign = currMathsInput.textAlign;
		
		//logText();
		
		if (currMathsInput.selected == true && currMathsInput.selectPos.length > 0) {
			//console.log(currMathsInput.selectPos,currMathsInput.cursorMap[Math.max(currMathsInput.selectPos[0],currMathsInput.selectPos[1])]);
			var cursorMapPos = currMathsInput.cursorMap[Math.max(currMathsInput.selectPos[0],currMathsInput.selectPos[1])];			
		} else {
			var cursorMapPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
		}
		
		// cycle through allMap, up to cursorMapPos;
		for (var pos = 0; pos < currMathsInput.allMap.length; pos++) {
			if (arraysEqual(cursorMapPos,currMathsInput.allMap[pos]) == true) break;
			var posText = currMathsInput.richText;
			for (var pos2 = 0; pos2 < currMathsInput.allMap[pos].length - 1; pos2++) {
				posText = posText[currMathsInput.allMap[pos][pos2]];
			}
			posText = posText.slice(currMathsInput.allMap[pos][currMathsInput.allMap[pos].length - 1]);
			var tagType = 'none';
			if (posText.indexOf('<<font:') == 0) tagType = 'font';
			if (posText.indexOf('<<fontSize:') == 0) tagType = 'fontSize';
			if (posText.indexOf('<<color:') == 0) tagType = 'color';
			if (posText.indexOf('<<backColor:') == 0) tagType = 'backColor';
			if (posText.indexOf('<<bold:') == 0) tagType = 'bold';
			if (posText.indexOf('<<italic:') == 0) tagType = 'italic';
			if (posText.indexOf('<<align:') == 0) tagType = 'align';		
			if (tagType !== 'none') {
				for (var pos3 = 0; pos3 < posText.length; pos3++) {
					if (posText.slice(pos3).indexOf('>>') == 0) {
						//console.log(pos,currMathsInput.allMap[pos],posText.slice(0,pos3+2));
						if (tagType == 'font') currFont = posText.slice(7,pos3);
						if (tagType == 'fontSize') currFontSize = posText.slice(11,pos3);
						if (tagType == 'color') currColor = posText.slice(8,pos3);
						if (tagType == 'backColor') currbackColor = posText.slice(12,pos3);
						if (tagType == 'bold') currBold = posText.slice(7,pos3);
						if (tagType == 'italic') currItalic = posText.slice(9,pos3);
						if (tagType == 'align') currAlign = posText.slice(8,pos3);					
						break;	
					}
				}
			}
		}
		// keep going up to the next breakPoint for align
		if (typeof currMathsInput.breakPoints !== 'undefined') {
			for (var pos3 = pos; pos3 < currMathsInput.allMap.length; pos3++) {
				// check if a breakPoint has been reached
				var breakPointReached = false;
				for (var i = 0; i < currMathsInput.breakPoints.length - 1; i++) {
					var breakPoint = currMathsInput.allMap[currMathsInput.breakPoints[i]];
					if (arraysEqual(breakPoint,currMathsInput.allMap[pos3]) == true) {
						breakPointReached = true;
						break;
					}
				}
				if (breakPointReached == true) break;
				var posText = currMathsInput.richText;
				for (var pos4 = 0; pos4 < currMathsInput.allMap[pos3].length - 1; pos4++) {
					posText = posText[currMathsInput.allMap[pos3][pos4]];
				}
				posText = posText.slice(currMathsInput.allMap[pos3][currMathsInput.allMap[pos3].length - 1]);
				if (posText.indexOf('<<align:') == 0) {
					alignType = posText.slice(8,posText.indexOf('>>'));
					if (alignType.indexOf('le') > -1) currAlign = 'left';
					if (alignType.indexOf('ce') > -1) currAlign = 'center';
					if (alignType.indexOf('ri') > -1) currAlign = 'right';				
				}
			}
		}
		
		// check preText for tags
		if (currMathsInput.selected == false) {
			if (typeof currMathsInput.preText !== 'undefined') {
				for (var i = 0; i < currMathsInput.preText.length; i++) {
					var posText = currMathsInput.preText.slice(i);
					var tagType = 'none';
					if (posText.indexOf('<<font:') == 0) tagType = 'font';
					if (posText.indexOf('<<fontSize:') == 0) tagType = 'fontSize';
					if (posText.indexOf('<<color:') == 0) tagType = 'color';
					if (posText.indexOf('<<backColor:') == 0) tagType = 'backColor';
					if (posText.indexOf('<<bold:') == 0) tagType = 'bold';
					if (posText.indexOf('<<italic:') == 0) tagType = 'italic';
					if (posText.indexOf('<<align:') == 0) tagType = 'align';		
					if (tagType !== 'none') {
						for (var pos3 = 0; pos3 < posText.length; pos3++) {
							if (posText.slice(pos3).indexOf('>>') == 0) {
								if (tagType == 'font') currFont = posText.slice(7,pos3);
								if (tagType == 'fontSize') currFontSize = posText.slice(11,pos3);
								if (tagType == 'color') currColor = posText.slice(8,pos3);
								if (tagType == 'backColor') currbackColor = posText.slice(12,pos3);
								if (tagType == 'bold') currBold = posText.slice(7,pos3);
								if (tagType == 'italic') currItalic = posText.slice(9,pos3);
								if (tagType == 'align') currAlign = posText.slice(8,pos3);					
								break;	
							}
						}
					}
				}
			}
		}
		//console.log('currFont:',currFont,'currFontSize:',currFontSize,'currColor:',currColor,'currBold:',currBold,'currItalic:',currItalic);
		// update the menu canvases
		
		// font
		this.font = currFont;
		this.fontButton.draw();
		
		for (var j = 0; j < this.fontMenuButton.length; j++) {
			this.fontMenuButton[j].draw();
		}
		
		this.fontSize = Number(currFontSize);
		this.fontSizeButton.draw();
		
		this.color = currColor;
		this.tempColor = currColor;
		this.backColor = currBackColor;
		this.tempBackColor = currBackColor;		
		this.colorButton.draw();
		for (var j = 0; j < this.colorMenuButton.length; j++) {
			this.colorMenuButton[j].draw();
		}		
		
		// bold
		if (currBold.indexOf('true') > -1) {this.bold = true;} else {this.bold = false;}
		this.boldButton.draw();

		// italic
		if (currItalic.indexOf('true') > -1) {this.italic = true;} else {this.italic = false;}
		this.italicButton.draw();	
		
		if (currAlign.indexOf('left') > -1 ) {
			this.align = 'left';
		} else if (currAlign.indexOf('center') > -1 ) {
			this.align = 'center';
		} else if (currAlign.indexOf('right') > -1 ) {
			this.align = 'right';
		}
		this.vertAlign = currMathsInput.vertAlign;
		this.alignmentButton.draw(this.alignmentButton.ctx,this.align,this.vertAlign);

		//logText();
		this.lineSpacingFactor = currMathsInput.lineSpacingFactor || 1.2;
		this.lineSpacingStyle = currMathsInput.lineSpacingStyle || 'variable';
		this.lineSpacingButton.draw();
		this.lineSpacingMenuButton[2].draw();
		this.lineSpacingMenuButton[3].draw();
		
	}

	// close menus on mousedown
	addListener(window, function () {
		var fontMenuMouseOver = false;
		var colorMenuMouseOver = false;
		var charMenuMouseOver = false;	
		var elementsMenuMouseOver = false;
		var alignmentMenuMouseOver = false;
		var fontSizeMenuMouseOver = false;
		var lineSpacingMenuMouseOver = false;
		var obj = textMenu[taskId];
		
		if (obj.fontMenuShowing == true) {
			for (var i = 0; i < obj.fontMenuButton.length; i++) {
				if (hitTestMouseOver(obj.fontMenuButton[i]) == true) {
					fontMenuMouseOver = true;
					break;	
				}
			}
		}
		if (hitTestMouseOver(obj.fontButton) == true) fontMenuMouseOver = true;
		if (fontMenuMouseOver == false && obj.fontMenuShowing == true) {
			obj.closeFontMenu();
		}
		
		if (obj.colorMenuShowing == true) {
			for (var i = 0; i < obj.colorMenuButton.length; i++) {
				if (hitTestMouseOver(obj.colorMenuButton[i]) == true) {
					colorMenuMouseOver = true;
					break;
				}
			}
		}
		if (hitTestMouseOver(obj.colorButton) == true) colorMenuMouseOver = true;
		if (colorMenuMouseOver == false && obj.colorMenuShowing == true) {
			obj.closeColorMenu();
		}

		if (obj.charMenuShowing == true) {
			for (var i = 0; i < obj.charMenuButton.length; i++) {
				if (hitTestMouseOver(obj.charMenuButton[i]) == true) {
					charMenuMouseOver = true;
					break;
				}
			}
		}
		if (hitTestMouseOver(obj.charButton) == true) charMenuMouseOver = true;
		if (charMenuMouseOver == false && obj.charMenuShowing == true) {
			obj.closeCharMenu();
		}

		if (obj.elementsMenuShowing == true) {
			for (var i = 0; i < obj.elementsMenuButton.length; i++) {
				if (hitTestMouseOver(obj.elementsMenuButton[i]) == true) {
					elementsMenuMouseOver = true;
					break;
				}
			}
		}
		if (hitTestMouseOver(obj.elementsButton) == true) elementsMenuMouseOver = true;
		if (elementsMenuMouseOver == false && obj.elementsMenuShowing == true) {
			obj.closeElementsMenu();
		}
		
		if (obj.alignmentMenuShowing == true) {
			for (var i = 0; i < obj.alignmentMenuButton.length; i++) {
				if (hitTestMouseOver(obj.alignmentMenuButton[i]) == true) {
					alignmentMenuMouseOver = true;
					break;
				}
			}
		}
		if (hitTestMouseOver(obj.alignmentButton) == true) alignmentMenuMouseOver = true;
		if (alignmentMenuMouseOver == false && obj.alignmentMenuShowing == true) {
			obj.closeAlignmentMenu();
		}
		
		if (obj.fontSizeMenuShowing == true) {
			for (var i = 0; i < obj.fontSizeMenuButton.length; i++) {
				if (hitTestMouseOver(obj.fontSizeMenuButton[i]) == true) {
					fontSizeMenuMouseOver = true;
					break;
				}
			}
		}
		if (hitTestMouseOver(obj.fontSizeButton) == true) fontSizeMenuMouseOver = true;
		if (fontSizeMenuMouseOver == false && obj.fontSizeMenuShowing == true) {
			obj.closeFontSizeMenu();
		}

		if (obj.lineSpacingMenuShowing == true) {
			for (var i = 0; i < obj.lineSpacingMenuButton.length; i++) {
				if (hitTestMouseOver(obj.lineSpacingMenuButton[i]) == true) {
					lineSpacingMenuMouseOver = true;
					break;
				}
			}
		}
		if (hitTestMouseOver(obj.lineSpacingButton) == true) lineSpacingMenuMouseOver = true;
		if (lineSpacingMenuMouseOver == false && obj.lineSpacingMenuShowing == true) {
			obj.closelineSpacingMenu();
		}
	});	
	
	obj.update();
	return obj;
}
function fontBold() {
	textMenu[taskId].buttonPressed('bold');
}
function fontItalic() {
	textMenu[taskId].buttonPressed('italic');
}
function fontSizeUp() {
	textMenu[taskId].buttonPressed('fontSize',textMenu[taskId].fontSize+1);	
}
function fontSizeDown() {
	textMenu[taskId].buttonPressed('fontSize',textMenu[taskId].fontSize-1);
}
function removeTagsOfType(textArray,tagType) {
	var stringHandler = function(string) {
		for (var j = string.length - 1; j >= 0; j--) {
			var slice = string.slice(j);
			if (slice.indexOf('<<'+tagType+':') == 0) {
				string = string.slice(0,j)+string.slice(j+slice.indexOf('>>')+2);
			}
		}
		return string;
	}
	
	var arrayHandler = function(array) {
		for (var l = array.length - 1; l >= 0; l--) {
			if (typeof array[l] == 'string') {
				array[l] = stringHandler(array[l]);
			} else {	
				array[l] = arrayHandler(array[l]);
			}
		}
		return array;
	}
	
	if (typeof textArray == 'object') {
		return arrayHandler(textArray);
	} else if (typeof textArray == 'string') {
		return stringHandler(textArray);
	}
}
function removeTagsFromFront(textArray,tagsToRemove) {
	// eg. removeTagsFromFront(textArray,['<<bold:false>>','<<italic:false>>','<<font:Arial>>','<<backColor:none>>','<<color:#000>>']);
	var str = textArray[0];
	if (typeof str !== "string") return textArray;
		
	for (var t = 0; t < tagsToRemove.length; t++) {
		if (str.indexOf(tagsToRemove[t]) == 0) {
			str = str.slice(tagsToRemove[t].length);
			t = -1;
		}
	}
	
	textArray[0] = str;
	return textArray;
}
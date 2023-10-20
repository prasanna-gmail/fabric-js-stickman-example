0// Version 16-05-18

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

var keyboardButton1 = [];
var keyboardButton2 = [];
var keyboardChars = [
	{display:'0x00D7',name:'times'},
	{display:'0x00F7',name:'divide'},
	{display:'0x00B0',name:'degrees'},
	{display:'0x221E',name:'infinity'},
	{display:'0x2261',name:'equivalence'},
	{display:'0x2248',name:'approximately'},		
	{display:'0x2264',name:'lessEqual'},
	{display:'0x2265',name:'moreEqual'},
	{display:'0x03C0',name:'pi'},
	{display:'0x2260',name:'notEqual'},
	{display:'0x03B8',name:'theta'},
	{display:'0x00B1',name:'plusMinus'},
	{display:'0x2213',name:'minusPlus'},
	{display:'0x2B1A',name:'dottedSquare'},
	{display:'0x2115',name:'naturals'},
	{display:'0x2124',name:'integers'},
	{display:'0x211A',name:'rationals'},
	{display:'0x211D',name:'reals'},
	{display:'0x2208',name:'elementOf'},
	{display:'0x2209',name:'notElementOf'},
	{display:'0x221D',name:'proportionalTo'},				
	{display:'0x2220',name:'angle'},				
	{display:'0x2229',name:'intersection'},				
	{display:'0x222A',name:'union'},				
	{display:'0x2234',name:'therefore'},
	{display:'0x2190',name:'leftArrow'},
	{display:'0x2191',name:'upArrow'},
	{display:'0x2192',name:'rightArrow'},
	{display:'0x2193',name:'downArrow'}
];
var keyboardElements = [
	{display:['<<font:algebra>>x',['power',false,['']]],name:'power',func:mathsInputPow},
	{display:['<<font:algebra>>x',['power',false,['']]],name:'pow',func:mathsInputPow},
	{display:['x',['subs',false,['']]],name:'subs',func:mathsInputSubs},
	{display:[['frac',[''],['']]],name:'frac',func:mathsInputFrac},
	{display:[['sqrt',['']]],name:'sqrt',func:mathsInputSqrt},
	{display:[['root',[''],['']]],name:'root',func:mathsInputRoot},
	{display:[['sin',['']]],name:'sin',func:mathsInputSin},
	{display:[['sin-1',['']]],name:'sin-1',func:mathsInputInvSin},
	{display:[['cos',['']]],name:'cos',func:mathsInputCos},	
	{display:[['cos-1',['']]],name:'cos-1',func:mathsInputInvCos},
	{display:[['tan',['']]],name:'tan',func:mathsInputTan},
	{display:[['tan-1',['']]],name:'tan-1',func:mathsInputInvTan},
	{display:[['ln',['']]],name:'ln',func:mathsInputLn},	
	{display:[['log',['']]],name:'log',func:mathsInputLog},	
	{display:[['logBase',[''],['']]],name:'logBase',func:mathsInputLogBase},		
	{display:[['abs',['']]],name:'abs',func:mathsInputAbs},
	{display:[['exp',['']]],name:'exp',func:mathsInputExp},
	{display:[['sigma1',['']]],name:'sigma1',func:mathsInputSigma1},
	{display:[['sigma2',[''],[''],['']]],name:'sigma2',func:mathsInputSigma2},
	{display:[['int1',['']]],name:'int1',func:mathsInputInt1},
	{display:[['int2',[''],[''],['']]],name:'int2',func:mathsInputInt2},
	{display:[['vectorArrow',['']]],name:'vectorArrow',func:mathsInputVectorArrow},
	{display:[['bar',['']]],name:'bar',func:mathsInputBar},
	{display:[['hat',['']]],name:'hat',func:mathsInputHat},
	{display:[['recurring',['']]],name:'recurring',func:mathsInputRecurring},
	{display:[['colVector2d',[''],['']]],name:'colVector2d',func:mathsInputColVector2d},
	{display:[['colVector3d',[''],[''],['']]],name:'colVector3d',func:mathsInputColVector3d},
	{display:[['mixedNum',[''],[''],['']]],name:'mixedNum',func:mathsInputMixedNum},
	{display:[['lim',[''],['']]],name:'lim',func:mathsInputLim}
];

function createKeyboard(object) {
	var keySize = object.keySize || 60;
	var fontSize = object.fontSize || 40;
	var keyPadding = object.keyPadding || 5;
	var align = object.align || 'left';
	var keyArray = object.keyArray;
	var backColor = object.backColor || '#F0F';
	var algText = object.algText || false;
	var rows = object.keyArray.length;
	var keyButtonLeft = object.keyButtonLeft || 1120;
	var keyButtonTop = object.keyButtonTop || 620;
	var dragArea = object.dragArea || [15,100,15,15]; // this is xMin, yMin, xMax, yMax	
	var cols;
	for (var i = 0; i < keyArray.length; i++) {
		if (!cols) {cols = keyArray[i].length};
		cols = Math.max(cols, keyArray[i].length);	
	}
	
	// width and height of keyboard
	var width = cols * (keySize + keyPadding) + keyPadding * 5;
	var height = rows * (keySize + keyPadding) + 40 + keyPadding * 4; 

	var left = object.left || 30;
	var top = object.top || 670 - height;
	
	// create keyboard canvas
	var canvasInstance = document.createElement('canvas');
	canvasInstance.width = width;
	canvasInstance.height = height;
	canvasInstance.setAttribute('position', 'absolute');
	canvasInstance.setAttribute('cursor', 'auto');
	canvasInstance.setAttribute('draggable', 'false');
	canvasInstance.setAttribute('class', 'buttonClass');
	canvasInstance.style.zIndex = 800000;
	canvasInstance.style.cursor = 'url("../images/cursors/openhand.cur"), auto';
	canvasInstance.dragArea = dragArea;
	var contextInstance = canvasInstance.getContext('2d');
	roundedRect(contextInstance, 4, 4, width - 8, height - 8, 15, 8, '#000', backColor)
	contextInstance.strokeStyle = '#333';
	contextInstance.lineWidth = 4;
	contextInstance.beginPath();
	contextInstance.moveTo(15, 25);
	contextInstance.lineTo(width - 55, 25);	
	contextInstance.closePath();
	contextInstance.stroke();
	contextInstance.font = '20px Arial';
	contextInstance.textBaseline = 'middle';
	contextInstance.textAlign = 'center';
	contextInstance.fillStyle = backColor;
	contextInstance.fillRect((0.5 * width - 20) - 0.5 * contextInstance.measureText('Keyboard').width - 10, 20, contextInstance.measureText('Keyboard').width + 20, 10);
	contextInstance.fillStyle = '#333';	
	contextInstance.fillText('Keyboard', 0.5 * width - 20, 25);
	
	canvasInstance.data = [left, top, width, height];
	for (var i = 0; i < 4; i++) {
		canvasInstance.data[100+i] = canvasInstance.data[i];
	}
	canvasInstance.data[116] = false;
	keyboard[taskId] = canvasInstance;
	keyboardData[taskId] = canvasInstance.data;
	
	//dragObject.push(keyboard[taskId]);
	//keyboardData[taskId][116] = false;
	//dragObjectData.push(keyboardData[taskId]);

	// make draggable
	addListenerStart(keyboard[taskId],dragKeyboardStart)
	keyboardVis[taskId] = false;
	
	// create keys
	var rowNum;
	var colNum;
	var keyCount = 0;
	key1[taskId] = [];
	key1Data[taskId] = [];

	
	
	for (var rowNum = 0; rowNum < keyArray.length; rowNum++) {
		var keyLeft;
		if (align == 'left') {
			keyLeft = left + keyPadding * 3;
		} else if (align == 'right') {
			keyLeft = left + width - keyArray[rowNum].length * (keySize + keyPadding) - keyPadding * 2;
		} else {
			keyLeft = left + 0.5 * (width - keyArray[rowNum].length * (keySize + keyPadding));
		}
		var	keyTop = top + keyPadding + 40 + keyPadding + rowNum * (keySize + keyPadding);
		
		for (var colNum = 0; colNum < keyArray[rowNum].length; colNum++) {
			var canvasInstance = document.createElement('canvas');
			canvasInstance.width = keySize;
			canvasInstance.height = keySize;
			canvasInstance.setAttribute('position', 'absolute');
			canvasInstance.setAttribute('cursor', 'auto');
			canvasInstance.setAttribute('draggable', 'false');
			canvasInstance.setAttribute('class', 'buttonClass');
			canvasInstance.style.zIndex = 800000;
			canvasInstance.style.opacity = 0.7;
			canvasInstance.style.pointerEvents = 'none';
				
			var contextInstance = canvasInstance.getContext('2d');
			
			canvasInstance.name = keyArray[rowNum][colNum];
			canvasInstance.value = clone(keyArray[rowNum][colNum]);
			canvasInstance.func = function(){};
			canvasInstance.relFontSize = 1;
			canvasInstance.keySize = keySize;			
			canvasInstance.element = false;
			canvasInstance.static = false;	
			
			for (var c = 0; c < keyboardChars.length; c++) {
				if (canvasInstance.value == keyboardChars[c].name) {
					canvasInstance.value = String.fromCharCode(keyboardChars[c].display);
					break;
				}
			}
			for (var e = 0; e < keyboardElements.length; e++) {
				if (canvasInstance.value == keyboardElements[e].name) {
					canvasInstance.relFontSize = 0.9;
					if (['frac','mixedNum'].indexOf(canvasInstance.value) > -1) {
						canvasInstance.relFontSize = 0.8;
					}
					canvasInstance.value = keyboardElements[e].display;
					canvasInstance.func = keyboardElements[e].func;
					canvasInstance.element = true;
					break;
				}
			}
			
			if (canvasInstance.element == true || ['leftArrow','rightArrow','del','delete'].indexOf(canvasInstance.name) > -1) {
				canvasInstance.color = '#FF0'; // color for operators
				canvasInstance.colorPressed = '#990';
				canvasInstance.keyType = 'operator';
			} else if (['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'].indexOf(canvasInstance.name) > -1) {
				canvasInstance.color = '#AFF'; // color for letters
				canvasInstance.colorPressed = '#6CC';
				canvasInstance.keyType = 'letter';
			} else if(['0','1','2','3','4','5','6','7','8','9',0,1,2,3,4,5,6,7,8,9].indexOf(canvasInstance.name) > -1) {
				canvasInstance.color = '#AFA'; // color for numbers
				canvasInstance.colorPressed = '#9C9';
				canvasInstance.keyType = 'number';
			} else {
				canvasInstance.color = '#FB8'; // color for misc
				canvasInstance.colorPressed = '#C95';
				canvasInstance.keyType = 'misc';
			}
			
			canvasInstance.ctx = contextInstance;
			canvasInstance.ctx.canvas = canvasInstance;
			canvasInstance.keySize = keySize;
			canvasInstance.algText = algText;
			canvasInstance.fontSize = fontSize;
			
			drawKey(canvasInstance.ctx,canvasInstance.name,canvasInstance.algText,false,canvasInstance.keySize,canvasInstance.fontSize);
			addListenerStart(canvasInstance,keyStart);

			var relKeyLeft = keyLeft - left;
			var relKeyTop = keyTop - top;
			
			key1[taskId][keyCount] = canvasInstance;
			key1Data[taskId][keyCount] = [keyLeft, keyTop, keySize, keySize, relKeyLeft, relKeyTop, keyArray[rowNum][colNum]];
			key1Data[taskId][keyCount][100] = keyLeft;
			key1Data[taskId][keyCount][101] = keyTop;

			keyLeft += keySize + keyPadding;
			keyCount++;
		}
	}
	
	if (typeof object.staticKeys !== 'undefined') {
		var keys2 = object.staticKeys;
		var keyLeft = object.staticKeyPos[0];
		var keyTop = object.staticKeyPos[1];
		var staticKeySize = object.staticKeySize || keySize;
		var staticKeyPadding = object.staticKeyPadding || keyPadding;
		for (var k = 0; k < keys2.length; k++) {
			var canvasInstance = document.createElement('canvas');
			canvasInstance.width = staticKeySize;
			canvasInstance.height = staticKeySize;
			canvasInstance.setAttribute('position', 'absolute');
			canvasInstance.setAttribute('cursor', 'auto');
			canvasInstance.setAttribute('draggable', 'false');
			canvasInstance.setAttribute('class', 'buttonClass');
			canvasInstance.style.zIndex = 800000;
			canvasInstance.style.opacity = 0.7;
			canvasInstance.style.pointerEvents = 'none';
				
			var contextInstance = canvasInstance.getContext('2d');
			
			canvasInstance.name = keys2[k];
			canvasInstance.value = keys2[k];
			canvasInstance.func = function(){};
			canvasInstance.keySize = staticKeySize;
			canvasInstance.relFontSize = 1;
			canvasInstance.element = false;
			canvasInstance.static = true;
			container.appendChild(canvasInstance);
			
			for (var c = 0; c < keyboardChars.length; c++) {
				if (canvasInstance.value == keyboardChars[c].name) {
					canvasInstance.value = String.fromCharCode(keyboardChars[c].display);
					break;
				}
			}
			for (var e = 0; e < keyboardElements.length; e++) {
				if (canvasInstance.value == keyboardElements[e].name) {
					canvasInstance.relFontSize = 0.9;
					if (['frac','mixedNum'].indexOf(canvasInstance.value) > -1) {
						canvasInstance.relFontSize = 0.8;
					}
					canvasInstance.value = keyboardElements[e].display;
					canvasInstance.func = keyboardElements[e].func;
					canvasInstance.element = true;
					break;
				}
			}
			
			canvasInstance.ctx = contextInstance;
			canvasInstance.ctx.canvas = canvasInstance;
			canvasInstance.staticKeySize = staticKeySize;
			canvasInstance.algText = algText;
			canvasInstance.fontSize = fontSize;
			
			if (canvasInstance.element == true || ['leftArrow','rightArrow','del','delete'].indexOf(canvasInstance.name) > -1) {
				canvasInstance.color = '#FF0'; // color for operators
				canvasInstance.colorPressed = '#990';
				canvasInstance.keyType = 'operator';
			} else if (['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'].indexOf(canvasInstance.name) > -1) {
				canvasInstance.color = '#AFF'; // color for letters
				canvasInstance.colorPressed = '#6CC';
				canvasInstance.keyType = 'letter';
			} else if(['0','1','2','3','4','5','6','7','8','9',0,1,2,3,4,5,6,7,8,9].indexOf(canvasInstance.name) > -1) {
				canvasInstance.color = '#CFC'; // color for numbers
				canvasInstance.colorPressed = '#9C9';
				canvasInstance.keyType = 'number';
			} else {
				canvasInstance.color = '#CCC'; // color for misc
				canvasInstance.colorPressed = '#AAA';
				canvasInstance.keyType = 'misc';
			}			
			
			drawKey(canvasInstance.ctx,canvasInstance.name,canvasInstance.algText,false,canvasInstance.staticKeySize,canvasInstance.fontSize);
			addListenerStart(canvasInstance,keyStart);

			var relKeyLeft = keyLeft - left;
			var relKeyTop = keyTop - top;
			
			key1[taskId][keyCount] = canvasInstance;
			key1Data[taskId][keyCount] = [keyLeft, keyTop, staticKeySize, staticKeySize, relKeyLeft, relKeyTop, keys2[k]];
			key1Data[taskId][keyCount][100] = keyLeft;
			key1Data[taskId][keyCount][101] = keyTop;

			keyLeft += staticKeySize + staticKeyPadding;
			keyCount++;			
		}
	}
	
	// create close button
	var canvasInstance = document.createElement('canvas');
	canvasInstance.width = 40;
	canvasInstance.height = 40;
	canvasInstance.setAttribute('position', 'absolute');
	canvasInstance.setAttribute('cursor', 'auto');
	canvasInstance.setAttribute('draggable', 'false');
	canvasInstance.setAttribute('class', 'buttonClass');
	canvasInstance.style.zIndex = 800000;
	addListener(canvasInstance, hideKeyboard)
	
	var contextInstance = canvasInstance.getContext('2d');
	roundedRect(contextInstance, 3, 3, 34, 34, 8, 6, '#000', '#000');
	contextInstance.strokeStyle = '#FFF';
	contextInstance.fillStyle = '#FFF';
	contextInstance.lineWidth = 5;
	contextInstance.beginPath();
	
	contextInstance.moveTo(10, 30);
	contextInstance.lineTo(30, 30);
	
	contextInstance.closePath();
	contextInstance.stroke();
	key1[taskId][keyCount] = canvasInstance;
	key1Data[taskId][keyCount] = [left + width - 40, top+1, 40, 40, width - 40, 0, 'closeKeyboard'];
	key1Data[taskId][keyCount][100] = left + width - 40;
	key1Data[taskId][keyCount][101] = top+1;
	
	// create showKeyboard button
	var canvasInstance = document.createElement('canvas');
	canvasInstance.width = 50;
	canvasInstance.height = 50;
	canvasInstance.setAttribute('position', 'absolute');
	canvasInstance.setAttribute('cursor', 'auto');
	canvasInstance.setAttribute('draggable', 'false');
	canvasInstance.setAttribute('class', 'buttonClass');
	canvasInstance.style.zIndex = 800000;
	addListener(canvasInstance, showKeyboard)
	var contextInstance = canvasInstance.getContext('2d');
	roundedRect(contextInstance, 3, 3, 44, 44, 8, 6, '#000', backColor);
	roundedRect(contextInstance, 9, 9, 8, 8, 3, 2, '#000', '#AFF');
	roundedRect(contextInstance, 21, 9, 8, 8, 3, 2, '#000', '#AFF');
	roundedRect(contextInstance, 33, 9, 8, 8, 3, 2, '#000', '#AFF');
	roundedRect(contextInstance, 9, 21, 8, 8, 3, 2, '#000', '#AFF');
	roundedRect(contextInstance, 21, 21, 8, 8, 3, 2, '#000', '#AFF');
	roundedRect(contextInstance, 33, 21, 8, 8, 3, 2, '#000', '#AFF');
	roundedRect(contextInstance, 9, 33, 8, 8, 3, 2, '#000', '#AFF');
	roundedRect(contextInstance, 21, 33, 8, 8, 3, 2, '#000', '#AFF');
	roundedRect(contextInstance, 33, 33, 8, 8, 3, 2, '#000', '#AFF');	
	taskObject[taskId].push(canvasInstance);
	showKeys[taskId] = canvasInstance;
	var dataInstance = [keyButtonLeft, keyButtonTop, 50, 50, true, false, true];
	dataInstance[100] = keyButtonLeft;
	dataInstance[101] = keyButtonTop;
	dataInstance[102] = 50;
	dataInstance[103] = 50;
	canvasInstance.data = dataInstance;
	canvasInstance.ctx = contextInstance;
	taskObjectData[taskId].push(dataInstance);
	
	keyboardButton1[taskId] = canvasInstance;
		
	
	// create hideKeyboard button
	var canvasInstance = document.createElement('canvas');
	canvasInstance.width = 50;
	canvasInstance.height = 50;
	canvasInstance.setAttribute('position', 'absolute');
	canvasInstance.setAttribute('cursor', 'auto');
	canvasInstance.setAttribute('draggable', 'false');
	canvasInstance.setAttribute('class', 'buttonClass');
	canvasInstance.style.zIndex = 800000;
	addListener(canvasInstance, hideKeyboard)
	var contextInstance = canvasInstance.getContext('2d');
	roundedRect(contextInstance, 3, 3, 44, 44, 8, 6, '#000', backColor);
	taskObject[taskId].push(canvasInstance);
	hideKeys[taskId] = canvasInstance;
	var dataInstance = [keyButtonLeft, keyButtonTop, 50, 50, false, false, true];
	dataInstance[100] = keyButtonLeft;
	dataInstance[101] = keyButtonTop;
	dataInstance[102] = 50;
	dataInstance[103] = 50;
	canvasInstance.data = dataInstance;
	canvasInstance.ctx = contextInstance;
	taskObjectData[taskId].push(dataInstance);
	
	keyboardButton2[taskId] = canvasInstance;
}

function keyStart(e) {
	e.preventDefault();
	var name = e.target.name;
	var ctx = e.target.ctx;
	var algText = e.target.algText;
	var keySize = e.target.keySize;
	var fontSize = e.target.fontSize;
	var element = e.target.element;
	
	addListenerEnd(e.target,keyStop);
	drawKey(ctx,name,algText,true,keySize,fontSize);
	
	if (name == 'leftArrow') {
		mathsInputLeftArrow(e);
	} else if (name == 'rightArrow') {
		mathsInputRightArrow(e)
	} else {
		if (boolean(element,false) == true) {
			e.target.func.apply();
		} else {
			softKeyMathsInput(e);
		}
	}
	
	/*switch (value) {
		case 'frac' :
			mathsInputFrac(e)
			break;
		case 'root' :
			mathsInputRoot(e)
			break;
		case 'sqrt' :
			mathsInputSqrt(e)
			break;
		case 'power' :
		case 'pow' :
			mathsInputPow(e)
			break;
		case 'subscript' :
		case 'subs' :
			mathsInputSubs(e)
			break;					
		case 'sin' :
			mathsInputSin(e)
			break;
		case 'cos' :
			mathsInputCos(e)
			break;
		case 'tan' :
			mathsInputTan(e)
			break;
		case 'sin-1' :
			mathsInputInvSin(e)
			break;
		case 'cos-1' :
			mathsInputInvCos(e)
			break;
		case 'tan-1' :
			mathsInputInvTan(e)
			break;
		case 'ln' :
			mathsInputLn(e)
			break;
		case 'log' :
			mathsInputLog(e)
			break;
		case 'logBase' :
			mathsInputLogBase(e)
			break;
		case 'leftArrow' :
		case 'left' :
			mathsInputLeftArrow(e)
			break;
		case 'rightArrow' :
		case 'right' :
			mathsInputRightArrow(e)
			break;
		case 'abs' :
			mathsInputAbs(e)
			break;
		case 'exp' :
			mathsInputExp(e)
			break;
		case 'sigma1' :
			mathsInputSigma1(e)
			break;
		case 'sigma2' :
			mathsInputSigma2(e)
			break;
		case 'int1' :
			mathsInputInt1(e)
			break;
		case 'int2' :
			mathsInputInt2(e)
			break;
		case 'recurring' :
			mathsInputRecurring(e)
			break;
		case 'hat' :
			mathsInputHat(e)
			break;
		case 'bar' :
			mathsInputBar(e)
			break;
		case 'colVector2d' :
			mathsInputColVector2d(e)
			break;
		case 'colVector3d' :
			mathsInputColVector3d(e)
			break;
		case 'mixedNum' :
			mathsInputMixedNum(e)
			break;
		case 'lim' :
			mathsInputLim(e)
			break;
		case 'delete' :
		case 'del' :
			softKeyMathsInput(e)
			break;					
		default :
			softKeyMathsInput(e)
			break;
	}*/
}

function keyStop(e) {
	var name = e.target.name;
	var ctx = e.target.ctx;
	var algText = e.target.algText;
	var keySize = e.target.keySize;
	var fontSize = e.target.fontSize;
	drawKey(ctx,name,algText,false,keySize,fontSize);
	removeListenerEnd(e.target,keyStop);
}

var keyboardCurrFont = 'Arial';
function updateKeyboardCurrFont() {
	var prev = keyboardCurrFont;
	
	if (typeof currMathsInput == 'undefined') return;
	if (currMathsInput.selected == true && currMathsInput.selectPos.length > 0) {
		var cursorMapPos = currMathsInput.cursorMap[Math.max(currMathsInput.selectPos[0],currMathsInput.selectPos[1])];			
	} else {
		var cursorMapPos = currMathsInput.cursorMap[currMathsInput.cursorPos];
	}	
	
	for (var pos = 0; pos < currMathsInput.allMap.length; pos++) {
		if (arraysEqual(cursorMapPos,currMathsInput.allMap[pos]) == true) break;
		var posText = currMathsInput.richText;
		for (var pos2 = 0; pos2 < currMathsInput.allMap[pos].length - 1; pos2++) {
			posText = posText[currMathsInput.allMap[pos][pos2]];
		}
		posText = posText.slice(currMathsInput.allMap[pos][currMathsInput.allMap[pos].length - 1]);
		var tagType = 'none';
		if (posText.indexOf('<<font:') == 0) {
			for (var pos3 = 0; pos3 < posText.length; pos3++) {
				if (posText.slice(pos3).indexOf('>>') == 0) {			
					keyboardCurrFont = posText.slice(7,pos3);
					break;
				}
			}
		}
	}
	if (keyboardCurrFont !== prev && typeof key1 !== 'undefined' && typeof key1[taskId] !== 'undefined') {
		for (var k = 0; k < key1[taskId].length - 1; k++) {
			if (key1[taskId][k].keyType == 'letter') {
				drawKey(key1[taskId][k].ctx,key1[taskId][k].name,key1[taskId][k].algText,false,key1[taskId][k].keySize,key1[taskId][k].fontSize);
			}
		}
	}
}

function drawKey(ctx,name,algText,pressed,keySize,fontSize,font) {
	var isAlgText = boolean(algText,false);
	var isPressed = boolean(pressed,false);
	if (!keySize) keySize = 60; 
	if (!fontSize) fontSize = 40;
	if (!font) {
		font = keyboardCurrFont;
	}
	if (isAlgText == true) font = 'algebra';
	fontSize = fontSize * ctx.canvas.relFontSize;
	
	ctx.clearRect(0,0,keySize,keySize);
	if (isPressed == false) {
		var color = ctx.canvas.color;
	} else {
		var color = ctx.canvas.colorPressed;
	}
	/*var color = '#AFF';
	if (boolean(ctx.canvas.element,false) == true || ['leftArrow','rightArrow','del','delete'].indexOf(name) > -1) {
		font = 'algebra';
		if (isPressed == true) {
			color = '#990';
		} else {
			color = '#FF0';			
		}
	} else {
		if (isPressed == true) { 
			color = '#6CC';
		}
	}*/
	
	switch (name) {
		case 'leftArrow' :
		case 'left' :
			text({ctx:ctx,textArray:[],left:3,top:3,height:keySize-6,width:keySize-6,align:'center',vertAlign:'middle',box:{type:'loose',radius:6,color:color,borderWidth:6}});
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(45*keySize/60, 30*keySize/60);
			ctx.lineTo(15*keySize/60, 30*keySize/60);
			ctx.lineTo(25*keySize/60, 20*keySize/60);
			ctx.moveTo(15*keySize/60, 30*keySize/60);
			ctx.lineTo(25*keySize/60, 40*keySize/60);
			ctx.stroke();
			break;
		case 'rightArrow' :
		case 'right' :
			text({ctx:ctx,textArray:[],left:3,top:3,height:keySize-6,width:keySize-6,align:'center',vertAlign:'middle',box:{type:'loose',radius:6,color:color,borderWidth:6}});
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(15*keySize/60, 30*keySize/60);
			ctx.lineTo(45*keySize/60, 30*keySize/60);
			ctx.lineTo(35*keySize/60, 20*keySize/60);
			ctx.moveTo(45*keySize/60, 30*keySize/60);
			ctx.lineTo(35*keySize/60, 40*keySize/60);
			ctx.stroke();
			break;
		case 'delete' :
		case 'del' :
			text({ctx:ctx,textArray:[],left:3,top:3,height:keySize-6,width:keySize-6,align:'center',vertAlign:'middle',box:{type:'loose',radius:6,color:color,borderWidth:6}});
			ctx.textAlign = "center";
			ctx.textBaseline = "middle"; 
			ctx.fillStyle = "#000";
			ctx.font = (fontSize/2)+"px Arial";			
			ctx.fillText("DEL", keySize * 0.5, keySize * 0.65);
			break;					
		default :
			var txt = [];
			if (typeof ctx.canvas.value == 'number') {
				txt = [String(ctx.canvas.value)];
			} else if (typeof ctx.canvas.value == 'string') {
				txt = [ctx.canvas.value];
			} if (typeof ctx.canvas.value == 'object') {
				txt = ctx.canvas.value;
			}
			txt.unshift('<<font:'+font+'>><<fontSize:'+fontSize+'>>');
			text({ctx:ctx,textArray:txt,left:3,top:3,height:keySize-6,width:keySize-6,align:'center',vertAlign:'middle',box:{type:'loose',radius:6,color:color,borderWidth:6}});
		
			break;
	}
}

var keyboardHardClosed = false; // has the user clicked the minimise button?
var keyboardHardOpen = false; // has the user clicked the minimise button?

function showKeyboard(event) {
	event.preventDefault();
	keyboardHardClosed = false;
	keyboardHardOpen = true;
	showKeyboard2();
}

function showKeyboard2(lightUp) {
	if (un(keyboard[taskNum])) return;
	if (boolean(lightUp,false) == true) {
		for (var i = 0; i < key1[taskNum].length; i++) {
			key1[taskNum][i].style.opacity = 1;
			key1[taskNum][i].style.pointerEvents = 'auto';	
		}			
	}
	if (keyboardHardClosed) return;
	if (keyboard[taskNum].parentNode !== container) {
		container.appendChild(keyboard[taskNum]);
		for (i = 0; i < key1[taskNum].length; i++) {
			if (boolean(key1[taskNum][i].static,false) == false) {
				container.appendChild(key1[taskNum][i]);
			}
		}
		if (showKeys[taskNum].parentNode == container) {container.removeChild(showKeys[taskNum])};
		container.appendChild(hideKeys[taskNum])
		keyboardVis[taskNum] = true;
	}
}


function hideKeyboard(event) {
	event.preventDefault();
	keyboardHardClosed = true;
	keyboardHardOpen = false;
	hideKeyboard2();
}

function hideKeyboard2(lightDown) {
	if (un(keyboard[taskNum])) return;
	if (boolean(lightDown,false) == true) {
		for (var i = 0; i < key1[taskNum].length - 1; i++) {
			key1[taskNum][i].style.opacity = 0.7;
			key1[taskNum][i].style.pointerEvents = 'none';	
		}			
	}		
	if (keyboard[taskNum].parentNode == container && keyboardHardOpen == false) {
		container.removeChild(keyboard[taskNum]);
		for (var i = 0; i < key1[taskNum].length; i++) {
			if (boolean(key1[taskNum][i].static,false) == false) {
				container.removeChild(key1[taskNum][i]);	
			}
		}
		if (hideKeys[taskNum].parentNode == container) {container.removeChild(hideKeys[taskNum])};
		container.appendChild(showKeys[taskNum]);
		keyboardVis[taskNum] = false;
	}
}
/*
function dragKeyboardStart(event) {
	event.preventDefault();
	currentDragId = dragObject.indexOf(event.currentTarget);
	dragObject[currentDragId].style.cursor = 'url("../images/cursors/closedhand.cur"), auto';
	if (event.touches) {
		var x = event.touches[0].pageX; 
		var y = event.touches[0].pageY;
	} else {
		var x = event.clientX || event.pageX;
		var y = event.clientY || event.pageY;
	}
	var dragObjectBoundingRect = dragObject[currentDragId].getBoundingClientRect();
	dragOffset.x = x - dragObjectBoundingRect.left;
	dragOffset.y = y - dragObjectBoundingRect.top;
	if (dragObjectData[currentDragId][116] == true) {
		dragArea.xMin = canvasDisplayRect.left + ((dragObjectData[currentDragId][110] - event.currentTarget.width / 2) / 1200) * canvasDisplayWidth;
		dragArea.xMax = canvasDisplayRect.left + ((dragObjectData[currentDragId][110] + dragObjectData[currentDragId][112] * dragObjectData[currentDragId][114] - event.currentTarget.width / 2) / 1200) * canvasDisplayWidth;
		dragArea.yMin = canvasDisplayRect.top + ((dragObjectData[currentDragId][111] - event.currentTarget.height / 2) / 700) * canvasDisplayHeight;
		dragArea.yMax = canvasDisplayRect.top + ((dragObjectData[currentDragId][111] + dragObjectData[currentDragId][113] * dragObjectData[currentDragId][115] - event.currentTarget.height / 2) / 700) * canvasDisplayHeight;
	} else {
		dragArea.xMin = canvasDisplayRect.left + (15 / 1200) * canvasDisplayWidth;
		dragArea.xMax = canvasDisplayRect.right - (15 / 1200) * canvasDisplayWidth - (dragObjectBoundingRect.right - dragObjectBoundingRect.left);
		dragArea.yMin = canvasDisplayRect.top + (100 / 700) * canvasDisplayHeight;
		dragArea.yMax = canvasDisplayRect.bottom - (15 / 700) * canvasDisplayHeight - (dragObjectBoundingRect.bottom - dragObjectBoundingRect.top);
	}
	addListenerMove(window, dragKeyboardMove )
	addListenerEnd(window, dragKeyboardStop )
}

function dragKeyboardMove(event) {
	event.preventDefault();
	if (event.touches) {
		var x = event.touches[0].pageX; 
		var y = event.touches[0].pageY;
	} else {
		var x = event.clientX || event.pageX;
		var y = event.clientY || event.pageY;
	}

	var l = x - dragOffset.x;
	var t = y - dragOffset.y;
	t = Math.max(t, dragArea.yMin);
	t = Math.min(t, dragArea.yMax);

	dragObject[currentDragId].style.left = l + 'px';
	dragObjectData[currentDragId][100] = xWindowToCanvas(l);

	dragObject[currentDragId].style.top = (t - (window.innerHeight - canvasDisplayHeight) / 2) + 'px';
	dragObjectData[currentDragId][101] = yWindowToCanvas(t);

	// move all keys relative to keyboard
	for (i = 0; i < key1[taskNum].length; i++) {
		key1[taskId][i].style.left = (l + xCanvasToWindow(key1Data[taskId][i][4]) - (window.innerWidth - canvasDisplayWidth) / 2) + 'px'
		key1Data[taskId][i][100] = dragObjectData[currentDragId][100] + key1Data[taskId][i][4];

		key1[taskId][i].style.top = (t + yCanvasToWindow(key1Data[taskId][i][5]) - (window.innerHeight - canvasDisplayHeight)) + 'px'
		key1Data[taskId][i][101] = dragObjectData[currentDragId][101] + key1Data[taskId][i][5]; 
	}
}

function dragKeyboardStop(event) {
	event.preventDefault();
	removeListenerMove(window, dragKeyboardMove)
	removeListenerEnd(window, dragKeyboardStop)
	dragObject[currentDragId].style.cursor = 'url("../images/cursors/openhand.cur"), auto';
	var objX;
	var objY;
	if (dragObjectData[currentDragId][116] == true) {
		if (mouse.x < xWindowToCanvas(dragArea.xMin)) {
			objX = xWindowToCanvas(dragArea.xMin);
		} else {
			if (mouse.x > xWindowToCanvas(dragArea.xMax)) {
			objX = xWindowToCanvas(dragArea.xMax);
			} else {
				objX = mouse.x;
			}
		}
		objX = (objX - dragObjectData[currentDragId][110]) / dragObjectData[currentDragId][112];
		objX = Math.round(objX);
		objX = objX * dragObjectData[currentDragId][112] + dragObjectData[currentDragId][110] - (dragObject[currentDragId].width / 2);
		objX = xCanvasToWindow(objX);
		dragObject[currentDragId].style.left = objX + 'px';
		dragObjectData[currentDragId][100] = xWindowToCanvas(objX);
		
		if (mouse.y < yWindowToCanvas(dragArea.yMin)) {
			objY = yWindowToCanvas(dragArea.yMin);
		} else {
			if (mouse.y > yWindowToCanvas(dragArea.yMax)) {
				objY = yWindowToCanvas(dragArea.yMax);
			} else {
				objY = mouse.y;
			}
		}
		objY = (objY - dragObjectData[currentDragId][111]) / dragObjectData[currentDragId][113];
		objY = Math.round(objY);
		objY = objY * dragObjectData[currentDragId][113] + dragObjectData[currentDragId][111] - (dragObject[currentDragId].height / 2);
		objY = yCanvasToWindow(objY);
		dragObject[currentDragId].style.top = (objY - canvasMetrics.top) + 'px';//(objY - (window.innerHeight - canvasDisplayHeight) / 2) + 'px';
		dragObjectData[currentDragId][101] = yWindowToCanvas(objY);
	}
}
*/

var drag;
function dragKeyboardStart(e) {
	updateMouse(e);
	e.target.style.cursor = 'url("../images/cursors/closedhand.cur"), auto';
	e.target.dragOffset = [mouse.x-e.target.data[100],mouse.y-e.target.data[101]];
	drag = e.target;
	addListenerMove(window, dragKeyboardMove )
	addListenerEnd(window, dragKeyboardStop )
}
function dragKeyboardMove(e) {
	e.target.style.cursor = 'url("../images/cursors/closedhand.cur"), auto';
	updateMouse(e);
	var l = mouse.x - drag.dragOffset[0];
	l = Math.max(l,drag.dragArea[0]);
	l = Math.min(l,mainCanvasWidth-drag.dragArea[2]-drag.data[102]);	
	var t = mouse.y - drag.dragOffset[1];
	t = Math.max(t,drag.dragArea[1]);
	t = Math.min(t,mainCanvasHeight-drag.dragArea[3]-drag.data[103]);
	drag.data[100] = l;
	drag.data[101] = t;
	resizeCanvas2(drag,l,t);

	for (i = 0; i < key1[taskNum].length; i++) {
		if (boolean(key1[taskNum][i].static,false) == false) {
			key1Data[taskId][i][100] = l + key1Data[taskId][i][4];
			key1Data[taskId][i][101] = t + key1Data[taskId][i][5]; 
			resizeCanvas2(key1[taskId][i],key1Data[taskId][i][100],key1Data[taskId][i][101]);
		}
	}
}
function dragKeyboardStop(e) {
	removeListenerMove(window, dragKeyboardMove)
	removeListenerEnd(window, dragKeyboardStop)
	e.target.style.cursor = 'url("../images/cursors/openhand.cur"), auto';
	drag.style.cursor = 'url("../images/cursors/openhand.cur"), auto';
}
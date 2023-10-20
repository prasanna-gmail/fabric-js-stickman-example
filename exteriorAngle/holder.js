if (typeof fontsToLoad == 'undefined')
	fontsToLoad = ['Hobo', 'smileyMonster', 'segoePrint'];
for (var i = 0; i < fontsToLoad.length; i++) {
	var div = document.createElement("div");
	div.id = 'hideMe';
	div.style.fontFamily = fontsToLoad[i];
	div.innerHTML = '.';
	document.body.insertBefore(div, document.body.firstChild);
}
var oldConsoleLog = null;
var log = function on() {
	var obj = {};
	obj.on = function () {
		if (oldConsoleLog == null)
			return;
		window['console']['log'] = oldConsoleLog;
	};
	obj.off = function off() {
		oldConsoleLog = console.log;
		window['console']['log'] = function () {};
	};
	return obj;
}
();
function un(variable) {
	if (typeof variable == 'undefined') {
		return true;
	} else {
		return false;
	}
}
function def(arr) {
	for (var d = 0; d < arr.length; d++) {
		if (typeof arr[d] !== 'undefined') {
			return arr[d];
		}
	}
	return undefined;
}
function boolean(testVar, def) {
	if (typeof testVar == 'boolean') {
		return testVar;
	} else {
		return def;
	}
}
function clone(obj) {
	var copy;
	if (null == obj || "object" != typeof obj)
		return obj;
	if (obj instanceof Date) {
		copy = new Date();
		copy.setTime(obj.getTime());
		return copy;
	}
	if (obj instanceof Array) {
		copy = [];
		for (var i = 0, len = obj.length; i < len; i++) {
			copy[i] = clone(obj[i]);
		}
		return copy;
	}
	if (obj instanceof Object) {
		copy = {};
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr))
				copy[attr] = clone(obj[attr]);
		}
		return copy;
	}
	throw new Error("Unable to copy obj! Its type isn't supported.");
}
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};
var mainCanvasWidth = mainCanvasWidth || 1200;
var mainCanvasHeight = mainCanvasHeight || 700;
var mainCanvasBorderWidth = mainCanvasBorderWidth || 16;
var mainCanvasMode = mainCanvasMode || 'full';
var mainCanvasOrientationChangeMode = false;
var mainCanvasOrientation = 0;
var mainCanvasOrientationDims = [[1200, 700], [616, 700]];
var mainCanvasOrientationChangeFunc = function () {};
var mainCanvasFillStyle = mainCanvasFillStyle || '#FFC';
var mainCanvasLeft = mainCanvasLeft || 0;
var mainCanvasTop = mainCanvasTop || 0;
var logging = [];
function logMe(string, variable, logType) {
	if (!logType)
		logType = logging;
	if (string == 'br' && logging.indexOf(logType) > -1) {
		console.log('-------------------------------');
	} else if (logging.indexOf(logType) > -1 && typeof variable !== 'undefined') {
		console.log(string, variable, typeof variable, variable.length);
	} else if (logging.indexOf(logType) > -1 && typeof variable == 'undefined') {
		console.log(string, 'undefined');
	}
}
function logMeG(varNameAsString, logType) { // for logging global variables
	if (!logType) logType = logging;
	if (logging.indexOf(logType) > -1) {
		console.log(varNameAsString, eval(varNameAsString), typeof eval(varNameAsString), eval(varNameAsString).length);
	}
}
/* log event listeners
// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;
    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

function logListeners(type) {
	var all = document.getElementsByTagName("*");
	for (var i = 0, max = all.length; i < max; i++) {
		 var list = getEventListeners(all[i]);
		 if (typeof type == 'undefined') {
			if (!isEmpty(list)) {
				list.obj = all[i];
				console.log(list);
			}
		 } else if (typeof list[type] !== 'undefined') {
			list[type].unshift(all[i]);
			console.log(list[type]);
		 }
	}
}/*/
if (typeof scriptsToLoad == 'undefined') {
	var scriptsToLoad = ['./js/drawMathsText.js', './js/mathsInput.js', './js/timeme.min.js', './js/login.js', './js/grid2.js', './js/video.js', './js/keyboard.js', './js/text.js', './js/draw.js', './js/draw2.js', './js/miscFuncs.js', './js/drawLines.js', './js/Notifier.js'];
}
var loadedScriptCount = 0;
var totalScriptCount = scriptsToLoad.length;
var loadedScriptLogin = true;
if (scriptsToLoad.indexOf('./js/login.js') > -1) {
	var loadedScriptLogin = false;
	totalScriptCount--;
	//scriptsToLoad = scriptsToLoad.splice(scriptsToLoad.indexOf('../login.js'),1);
}
loadScripts2();
function loadScripts2() {
	if (scriptsToLoad.length == 0) {
		scriptLoaded();
	} else {
		while (scriptsToLoad.length > 0) {
			var script = scriptsToLoad.shift();
			if (script !== './js/login.js') loadScript(script, scriptLoaded);
		}
	}
}
function loadScript(url, callback, errorCallback) {
	if (un(errorCallback)) errorCallback = function() {};
	var head = document.getElementsByTagName('head')[0];
	if (url.indexOf('css') > -1) {
		var elem = document.createElement('link');
		elem.rel = 'stylesheet';
		elem.type = 'text/css';
		elem.callback = callback;
		eleme.errorCallback = errorCallback;
		elem.onload = callback;
		elem.onerror = errorCallback;
		elem.href = url;
		head.appendChild(elem);
	} else {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.callback = callback;
		script.errorCallback = errorCallback;
		script.onerror = errorCallback;
		script.onload = script.onreadystatechange = function() {
			if (typeof this.callback == 'function') callback();
		}
		script.src = url;
		head.appendChild(script);
	}
}
function scriptLoaded() {
	loadedScriptCount++;
	if (loadedScriptCount >= totalScriptCount) {
		if (loadedScriptLogin == false) {
			loadedScriptLogin = true;
			loadScript('./js/login.js', scriptLoaded);
		} else if (task.length > 0) {
			loadScript(task[0] + '.js', scriptsLoaded);
		} else {
			holderLoadHandler();
		}
	}
}
function scriptsLoaded() {
	pageLoaded[0] = true;
	holderLoadHandler();
}
var makePDFLoaded = false;
function loadMakePDF(callback) {
	if (makePDFLoaded == false) {
		makePDFLoaded = true;
		window.callback = callback;
		loadScript('../pdfmake.min.js',loadMakePDF2);
	} else {
		callback();
	}	
}
function loadMakePDF2() {
	var callback = window.callback;
	delete window.callback;
	loadScript('../vfs_fonts.js',callback);
}
var pi = String.fromCharCode(0x03C0);
var times = String.fromCharCode(0x00D7);
var divide = String.fromCharCode(0x00F7);
var degrees = String.fromCharCode(0x00B0);
var infinity = String.fromCharCode(0x221E);
var lessThanEq = String.fromCharCode(0x2264);
var moreThanEq = String.fromCharCode(0x2265);
var notEqual = String.fromCharCode(0x2260);
var theta = String.fromCharCode(0x03B8);
var plusMinus = String.fromCharCode(0x00B1);
var minusPlus = String.fromCharCode(0x2213);
var logPointerEvents = false;
window.addEventListener("touchstart", function (e) {
	e.preventDefault();
	if (logPointerEvents)
		console.log('touchstart', e.target);
}, true);
window.addEventListener("touchmove", function (e) {
	e.preventDefault();
	if (logPointerEvents)
		console.log('touchmove', e.target);
}, true);
window.addEventListener("touchend", function (e) {
	e.preventDefault();
	if (logPointerEvents)
		console.log('touchend', e.target);
}, true);
window.addEventListener("pointerstart", function (e) {
	e.preventDefault();
	if (logPointerEvents)
		console.log('pointerstart');
}, true);
window.addEventListener("pointermove", function (e) {
	e.preventDefault();
	if (logPointerEvents)
		console.log('pointermove');
}, true);
window.addEventListener("pointerend", function (e) {
	e.preventDefault();
	if (logPointerEvents)
		console.log('pointerend');
}, true);
window.addEventListener("mousedown", function (e) {
	e.preventDefault();
	if (logPointerEvents)
		console.log('mousedown');
}, true);
window.addEventListener("mousemove", function (e) {
	e.preventDefault();
	if (logPointerEvents)
		console.log('mousemove');
}, true);
window.addEventListener("mouseup", function (e) {
	e.preventDefault();
	if (logPointerEvents)
		console.log('mouseup');
}, true);
var taskObject = [];
var taskObjectData = [];
var pageLoaded = [];
var taskState = [];
for (var t = 0; t < task.length; t++) {
	pageLoaded[t] = false;
	taskState[t] = 0;
}
var questions = [];
var isMobile = {
	Android: function () {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function () {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function () {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function () {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function () {
		return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
	},
	any: function () {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
}
if (isMobile.any()) {
	document.getElementsByTagName("head")[0].innerHTML += '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">'
	document.ontouchmove = function (event) {
		event.preventDefault()
	}
}
function stopDefaultBackspaceBehaviour(e) {
	if (e.keyCode == 8) {
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
	}
}
function horizCanvasToWindow(horizLength) {
	return (horizLength / mainCanvasWidth) * canvasDisplayWidth;
}
function vertCanvasToWindow(vertLength) {
	return (vertLength / mainCanvasHeight) * canvasDisplayHeight;
}
function horizWindowToCanvas(horizLength) {
	return (horizLength * mainCanvasWidth) / canvasDisplayWidth;
}
function vertWindowToCanvas(vertLength) {
	return (vertLength * mainCanvasHeight) / canvasDisplayHeight;
}
function xWindowToCanvas(xCoord) {
	return mainCanvasWidth * ((xCoord - canvasMetrics.left) / (canvasDisplayWidth));
}
function xCanvasToWindow(xCoord) {
	return canvasMetrics.left + (xCoord / mainCanvasWidth) * canvasDisplayWidth;
}
function yWindowToCanvas(yCoord) {
	return mainCanvasHeight * ((yCoord - canvasMetrics.top) / canvasDisplayHeight);
}
function yCanvasToWindow(yCoord) {
	return canvasMetrics.top + (yCoord / mainCanvasHeight) * canvasDisplayHeight;
}
function addListener(toButton, yourFunction) {
	toButton.addEventListener("touchend", yourFunction, false)
	toButton.addEventListener("mouseup", yourFunction, false)
}
function removeListener(toButton, yourFunction) {
	toButton.removeEventListener("touchend", yourFunction, false)
	toButton.removeEventListener("mouseup", yourFunction, false)
}
function addListenerStart(toButton, yourFunction) {
	toButton.addEventListener("touchstart", yourFunction, false)
	toButton.addEventListener("mousedown", yourFunction, false);
}
function removeListenerStart(toButton, yourFunction) {
	toButton.removeEventListener("touchstart", yourFunction, false)
	toButton.removeEventListener("mousedown", yourFunction, false);
}
function addListenerMove(toButton, yourFunction) {
	toButton.addEventListener("touchmove", yourFunction, false)
	toButton.addEventListener("mousemove", yourFunction, false)
}
function removeListenerMove(toButton, yourFunction) {
	toButton.removeEventListener("touchmove", yourFunction, false)
	toButton.removeEventListener("mousemove", yourFunction, false)
}
function addListenerEnd(toButton, yourFunction) {
	toButton.addEventListener("touchend", yourFunction, false)
	toButton.addEventListener("mouseup", yourFunction, false);
}
function removeListenerEnd(toButton, yourFunction) {
	toButton.removeEventListener("touchend", yourFunction, false)
	toButton.removeEventListener("mouseup", yourFunction, false);
}
function get_browser_info() {
	var ua = navigator.userAgent,
	tem,
	M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if (/trident/i.test(M[1])) {
		tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
		return {
			name: 'IE',
			version: (tem[1] || '')
		};
	}
	if (M[1] === 'Chrome') {
		tem = ua.match(/\bOPR\/(\d+)/)
			if (tem != null) {
				return {
					name: 'Opera',
					version: tem[1]
				};
			}
	}
	M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
	if ((tem = ua.match(/version\/(\d+)/i)) != null) {
		M.splice(1, 1, tem[1]);
	}
	return {
		name: M[0],
		version: M[1]
	};
}
var browser = get_browser_info();
switch (browser.name) {
case 'Chrome':
	break;
case 'Firefox':
	break;
case 'MSIE':
	if (browser.version < 11) {
		alert('You do not have the latest version of Internet Explorer. Some elements on the task may not work unless you update your browser.')
	}
	break;
case 'Safari':
	break;
case 'Opera':
	break;
}
var blinking = false;
window.addEventListener('focus', function () {
	if (blinking == true) {
		setTimeout(function () {
			mathsInputCursorBlinkInterval = setCorrectingInterval(function () {
					mathsInputCursorBlink()
				}, 600);
		}, 100);
	}
});
window.addEventListener('blur', function () {
	if (blinking == true) {
		clearCorrectingInterval(mathsInputCursorBlinkInterval);
		inputCursorState = false;
		drawMathsInputText(currMathsInput);
	}
	if (typeof currMathsInput !== 'undefined')
		endMathsInput();
});
var taskTag;
var taskTagArray = [];
var taskId;
var taskState = [];
window.pageLoading = false;
var taskNum = 0;
if (taskOrTool == 'Task' || taskOrTool == 'task') {
	taskOrTool = 'Task'
}
var taskCompleteMessage = [];
for (var i = 0; i < task.length; i++) {
	taskCompleteMessage[i] = 0
};
var taskCompleteMessageCanvas = [];
var taskCompleteMessageCanvasctx = [];
var taskCompleteMessageCanvasData = [];
var taskCompleteMessageInterval = [];
var starYellow = new Image;
var starYellowPointy = new Image;
var starWhite6points = new Image;
var yellowStar = new Image;
yellowStar.src = './images/yellowStar.png'

var backgroundLoadHandler = [];
var loadHandler = [];
var taskReset = [];
var penColour = -1;
var keyboard = [];
var keyboardData = [];
var key1 = [];
var key1Data = [];
var showKeys = [];
var hideKeys = [];
var keyboardVis = [];
var textCanvas = [];
var textCanvasData = [];
var mouse = {
	x: 0,
	y: 0
};
function updateMouse(e) {
	if (un(e))
		return;
	if (e.touches) {
		if (un(e.touches[0]))
			return;
		var x = e.touches[0].pageX;
		var y = e.touches[0].pageY;
	} else {
		var x = e.clientX || e.pageX;
		var y = e.clientY || e.pageY;
	}
	mouse.x = xWindowToCanvas(x);
	mouse.y = yWindowToCanvas(y);
}
var path = {
	x: 0,
	y: 0
};
var dragObject = [];
var dragObjectData = [];
var currentDragId;
var dragOffset = {
	x: 0,
	y: 0
};
var dragArea = {
	xMin: 0,
	xMax: 0,
	yMin: 0,
	yMax: 0
};
var zIndexFront = 100;
var firstPlay = [];
var textCanvas = [];
var currMathsInput;
var currMathsInputId;
var currMathsInputType;
var currMathsInputWidth;
var mathsInputCursorBlinkInterval;
var mathsInputCursorState;
var mathsInput = [];
var mathsInputCursor = {x:0, top:0, bottom:0}
var charMap = [[42,215,215], [48,48,41], [49,49,33], [50,50,34], [51,51,163], [52,52,36], [53,53,37], [54,54,94], [55,55,38], [56,56,215], [57,57,40], [96,48,48], [97,49,49], [98,50,50], [99,51,51], [100,52,52], [101,53,53], [102,54,54], [103,55,55], [104,56,56], [105,57,57], [106,215,215], [107,43,43], [109,189,189], [110,190,190], [111,191,191], [186,59,58], [187,61,43], [188,44,60], [189,45,95], [190,46,62], [191,247,63], [192,39,64], [219,91,123], [220,92,124], [221,93,125], [222,35,126]];
var endInputExceptions = [];
var currSlider;
var slider = [];
var draw = [];
var container = document.getElementById('canvascontainer');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var canvasDisplayRect;
var canvasDisplayWidth;
var canvasDisplayHeight;
var canvasMetrics = canvas.getBoundingClientRect();
var openhand = 'url("./images/cursors/openhand.cur"), auto';
var closedhand = 'url("./images/cursors/closedhand.cur"), auto';
//var openhand = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhUlEQVQ4T62S0RIAIQQA+f+P1uhiUKiZu7cu1iKE+qN1jVlYvLAJRPQdEV1YetgSLCDAFGJprwDW824A4CCFAQfO1rYZZEnZfwEch3eaPFe1MAakvTcr1hYUICuTChVgrVaH6CBdZfM23BaeINGAodcASZ4mQfcKUgFaE5t8MhCh1OR3wADGb2cNb+0DlAAAAABJRU5ErkJggg==';;
//var closedhand = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAbUlEQVQ4T92SQQ4AIQgD6f8fzUa0xiioCXvSixzsUIqQ5EFSL48CtOVSxovqHt2cgapWDQCJ6qHBEmIHRNshuNzWx3l4hNChBzD/tL77I56Dq86EpgAU2yiTzSsXO0CLgOtfUxjFngMqQie/Az6XuzQRt0ZDFgAAAABJRU5ErkJggg==';
if (document.getElementById("holderHomeButton") !== null) {
	var homeImage = new Image;
	homeImage.src = "./images/logoSmall.PNG";
}
if (document.getElementById("userInfoText") !== null) {
	var userInfoText = document.getElementById('userInfoText');
	var userInfoTextctx = userInfoText.getContext('2d');
	userInfoText.style.zIndex = 799999;
}
if (document.getElementById("holderPrevButton") !== null) {
	var button00 = document.getElementById('holderPrevButton');
	var button00ctx = button00.getContext('2d');
	var button01 = document.getElementById('holderReloadButton');
	var button01ctx = button01.getContext('2d');
	var button02 = document.getElementById('holderNextButton');
	var button02ctx = button02.getContext('2d');
	var button03 = document.getElementById('holderHomeButton');
	var button03ctx = button03.getContext('2d');
	var button04 = document.getElementById('holderQuestionNum');
	var button04ctx = button04.getContext('2d');
	var holderButton = [];
	holderButton.push(button00, button01, button02, button03, button04);
	var holderButtonctx = [];
	holderButtonctx.push(button00ctx, button01ctx, button02ctx, button03ctx, button04ctx);
	if (taskOrTool == 'tool') {
		var holderButtonData = [[75, 20, 50, 50, ""], [1020, 20, 50, 50, ""], [1075, 20, 50, 50, ""], [1130, 20, 50, 50, ""], [20, 20, 50, 50, taskNum + 1]];
		for (var i = 0, iLim = holderButton.length; i < iLim; i++) {
			holderButton[i].width = 50;
			holderButton[i].height = 50;
		}
		if (task.length == 1) {
			container.removeChild(holderButton[0]);
			container.removeChild(holderButton[2]);
			container.removeChild(holderButton[4]);
			holderButtonData[1] = [1075, 20, 50, 50, ""];
		}
	} else {
		var holderButtonData = [[96, 24, 210, 68, "Previous Page"], [680, 24, 190, 68, "Reload Page"], [883, 24, 210, 68, "Next Page"], [1102, 24, 74, 68, ""], [22, 24, 66, 68, taskNum + 1]];
	}
}
if (document.getElementById("penColourBlack") !== null) {
	container.removeChild(document.getElementById('penColourBlack'));
	container.removeChild(document.getElementById('penColourBlue'));
	container.removeChild(document.getElementById('penColourRed'));
	container.removeChild(document.getElementById('penColourGreen'));
	container.removeChild(document.getElementById('penClear'));
	container.removeChild(document.getElementById('penOff'));
}
if (document.getElementById("inactiveBox") !== null) {
	var inactiveBox = document.getElementById('inactiveBox');
	var inactiveBoxctx = inactiveBox.getContext('2d');
}
window.addEventListener('resize', resize, false);
window.addEventListener('orientationchange', resize, false);
window.addEventListener('keydown', stopDefaultBackspaceBehaviour, false);
window.addEventListener('mousemove', updateMouse, false);
window.addEventListener('touchstart', updateMouse, false);
window.addEventListener('touchmove', updateMouse, false);
function holderLoadHandler() {
	if (taskOrTool == 'Task') {
		getSessionOnPageLoad()
	}
	clearCanvas();
	if (typeof holderButton !== 'undefined') {
		holderButton[0].style.opacity = "0.5";
		holderButton[0].style.filter = 'alpha(opacity = 50)';
		holderButton[0].style.cursor = "auto";
		holderButton[0].style.pointerEvents = "none";
		if (taskNum == task.length - 1) {
			holderButton[2].style.opacity = "0.5";
			holderButton[2].style.filter = 'alpha(opacity = 50)';
			holderButton[2].style.cursor = "auto";
			holderButton[2].style.pointerEvents = "none";
		}
		for (var i = 0; i < holderButtonData.length; i++) {
			drawHolderButton(i);
			holderButton[i].addEventListener('mousedown', clickHolderButton, false);
			holderButton[i].addEventListener('touchstart', clickHolderButton, false);
			holderButton[i].style.zIndex = 800000;
		}
		if (taskOrTool == 'tool') {
			homeImage.onload = function () {
				holderButtonctx[3].drawImage(homeImage, 6, 5.5, 40, 40)
			};
			holderButtonctx[3].drawImage(homeImage, 6, 5.5, 40, 40);
		} else {
			homeImage.onload = function () {
				holderButtonctx[3].drawImage(homeImage, 10, 8, 56, 54)
			};
			holderButtonctx[3].drawImage(homeImage, 10, 8, 56, 54);
		}
	}
	for (i = 0; i < loadHandler.length; i++) {
		taskNum = i;
		loadHandler[i]();
	}
	for (var i = 0; i < task.length; i++) {
		taskState[i] = 0;
	}
	taskNum = 0;
	taskId = 0;
	taskTag = taskTagArray[0];
	if (typeof backgroundLoadHandler[0] === 'function')
		backgroundLoadHandler[0]();
	if (typeof userInfoText !== 'undefined')
		userInfoTextUpdate();
	if (typeof inactiveBox !== 'undefined')
		drawInactiveBox();
	if (taskOrTool == 'Task' || taskOrTool == 'task') {
		drawSmallTaskCompleteMessage();
		loadTaskCompleteMessages();
	}
	for (j = 0; j < taskObject.length; j++) {
		for (i = 0; i < taskObject[j].length; i++) {
			if (j == 0) {
				if (taskObjectData[j][i][4] == true) {
					container.appendChild(taskObject[j][i])
				};
			} else {
				if (taskObject[j][i].parentNode == container) {
					container.removeChild(taskObject[j][i])
				};
			}
		}
	}
	resize();
}
function resize() {
	if (mainCanvasOrientationChangeMode == true) {
		if (window.innerWidth > window.innerHeight && mainCanvasOrientation == 1) {
			mainCanvasOrientation = 0;
			mainCanvasWidth = mainCanvasOrientationDims[0][0];
			mainCanvasHeight = mainCanvasOrientationDims[0][1];
			mainCanvasBorderWidth = 16;
			canvas.width = mainCanvasWidth;
			canvas.height = mainCanvasHeight;
			clearCanvas();
			mainCanvasOrientationChangeFunc.apply();
		} else if (window.innerWidth < window.innerHeight && mainCanvasOrientation == 0) {
			mainCanvasOrientation = 1;
			mainCanvasWidth = mainCanvasOrientationDims[1][0];
			mainCanvasHeight = mainCanvasOrientationDims[1][1];
			mainCanvasBorderWidth = 12;
			canvas.width = mainCanvasWidth;
			canvas.height = mainCanvasHeight;
			clearCanvas();
			mainCanvasOrientationChangeFunc.apply();
		}
	}
	if (mainCanvasMode == 'full') {
		canvasDisplayWidth = window.innerWidth;
		canvasDisplayHeight = window.innerHeight;
		if ((canvasDisplayWidth / canvasDisplayHeight) > (mainCanvasWidth / mainCanvasHeight)) {
			canvasDisplayWidth = canvasDisplayHeight * (mainCanvasWidth / mainCanvasHeight);
		} else {
			canvasDisplayHeight = canvasDisplayWidth / (mainCanvasWidth / mainCanvasHeight);
		}
	} else if (mainCanvasMode == 'width') {
		canvasDisplayWidth = window.innerWidth - 400;
		canvasDisplayHeight = canvasDisplayWidth / (mainCanvasWidth / mainCanvasHeight);
	} else if (mainCanvasMode == 'height') {
		canvasDisplayWidth = window.innerHeight;
		canvasDisplayHeight = canvasDisplayHeight * (mainCanvasWidth / mainCanvasHeight);
	}
	canvas.style.left = String(mainCanvasLeft) + 'px';
	canvas.style.top = String(mainCanvasTop) + 'px';
	canvas.style.width = canvasDisplayWidth + 'px';
	canvas.style.height = canvasDisplayHeight + 'px';
	canvasDisplayRect = canvas.getBoundingClientRect();
	if (typeof holderButton !== 'undefined') {
		for (i = 0; i < holderButton.length; i++) {
			resizeCanvas(holderButton[i], holderButtonData[i][0], holderButtonData[i][1], holderButtonData[i][2], holderButtonData[i][3]);
		}
	}
	if (typeof userInfoText !== 'undefined')
		resizeCanvas(userInfoText, 321, 24, 343, 68);
	if (typeof inactiveBox !== 'undefined')
		resizeCanvas(inactiveBox, 400, 290, 400, 120);
	if (typeof taskVideo !== 'undefined' && typeof taskVideoData !== 'undefined' && typeof taskVideoData[taskId] !== 'undefined') {
		resizeCanvas(iframe[taskId], taskVideoData[taskId][0], taskVideoData[taskId][1], taskVideoData[taskId][2], taskVideoData[taskId][3]);
	}
	for (var j = 0; j < taskObject.length; j++) {
		for (i = 0; i < taskObject[j].length; i++) {
			if (typeof taskObject[j][i].data == 'undefined') {
				resizeCanvas(taskObject[j][i], taskObjectData[j][i][100], taskObjectData[j][i][101], taskObjectData[j][i][102], taskObjectData[j][i][103]);
			} else {
				resizeCanvas(taskObject[j][i], taskObject[j][i].data[100], taskObject[j][i].data[101], taskObject[j][i].data[102], taskObject[j][i].data[103]);
			}
		}
	}
	for (var j = 0; j < task.length; j++) {
		if (typeof keyboard[j] !== 'undefined') {
			resizeCanvas(keyboard[j], keyboardData[j][100], keyboardData[j][101], keyboardData[j][2], keyboardData[j][3]);
			for (var i = 0; i <key1[j].length; i++) {
				resizeCanvas(key1[j][i], key1Data[j][i][100], key1Data[j][i][101], key1Data[j][i][2], key1Data[j][i][3]);
			}
		}
	}
	canvasMetrics = canvas.getBoundingClientRect();
}
function resizeCanvas(canvasToResize, left, top, width, height) {
	if (typeof canvasToResize !== 'object')
		return;
	if (canvasToResize.isStaticMenuCanvas == true) {
		var l = 0.5 * (window.innerWidth - Number(String(canvas.style.width).slice(0, -2))) + canvasDisplayWidth * (left / mainCanvasWidth);
		var t = canvasDisplayHeight * (top / mainCanvasHeight);
	} else {
		var l = 0.5 * (window.innerWidth - Number(String(canvas.style.width).slice(0, -2))) + canvasDisplayWidth * (left / mainCanvasWidth) + mainCanvasLeft;
		var t = canvasDisplayHeight * (top / mainCanvasHeight) + mainCanvasTop;
	}
	var w = canvasDisplayWidth * (width / mainCanvasWidth);
	var h = canvasDisplayHeight * (height / mainCanvasHeight);
	canvasToResize.style.left = l + "px";
	canvasToResize.style.top = t + "px";
	canvasToResize.style.width = w + "px";
	canvasToResize.style.height = h + "px";
}
function resizeCanvas2(canvasToResize, left, top) {
	if (un(canvasToResize)) return;
	if (canvasToResize.isStaticMenuCanvas == true) {
		var l = 0.5 * (window.innerWidth - Number(String(canvas.style.width).slice(0, -2))) + canvasDisplayWidth * (left / mainCanvasWidth);
		var t = canvasDisplayHeight * (top / mainCanvasHeight);
	} else {
		var l = 0.5 * (window.innerWidth - Number(String(canvas.style.width).slice(0, -2))) + canvasDisplayWidth * (left / mainCanvasWidth) + mainCanvasLeft;
		var t = canvasDisplayHeight * (top / mainCanvasHeight) + mainCanvasTop;
	}
	canvasToResize.style.left = l + "px";
	canvasToResize.style.top = t + "px";
}
function resizeCanvas3(canvasToResize) {
	if (typeof canvasToResize.data == 'undefined')
		return;
	var left = canvasToResize.data[100];
	var top = canvasToResize.data[101];
	var width = canvasToResize.data[102];
	var height = canvasToResize.data[103];
		
	if (canvasToResize.isStaticMenuCanvas == true) {
		var l = 0.5 * (window.innerWidth - Number(String(canvas.style.width).slice(0, -2))) + canvasDisplayWidth * (left / mainCanvasWidth);
		var t = canvasDisplayHeight * (top / mainCanvasHeight);
	} else {
		var l = 0.5 * (window.innerWidth - Number(String(canvas.style.width).slice(0, -2))) + canvasDisplayWidth * (left / mainCanvasWidth) + mainCanvasLeft;
		var t = canvasDisplayHeight * (top / mainCanvasHeight) + mainCanvasTop;
	}
	var w = canvasDisplayWidth * (width / mainCanvasWidth);
	var h = canvasDisplayHeight * (height / mainCanvasHeight);
	canvasToResize.style.left = l + "px";
	canvasToResize.style.top = t + "px";
	canvasToResize.style.width = w + "px";
	canvasToResize.style.height = h + "px";
}
function initialiseTaskVariables() {
	for (i = 0; i < task.length; i++) {
		var taskTagRegExp = new RegExp(taskTag);
		if (taskTagRegExp.test(task[i]) == true) {
			taskId = i;
			taskTagArray[taskId] = taskTag;
		}
	}
	taskObject[taskId] = [];
	taskObjectData[taskId] = [];
	if (typeof taskVideo !== 'undefined')
		taskVideo[taskId] = false;
	window[taskTag + 'button'] = [];
	window[taskTag + 'buttonctx'] = [];
	window[taskTag + 'buttonData'] = [];
	window[taskTag + 'imageCanvas'] = [];
	window[taskTag + 'imageCanvasctx'] = [];
	window[taskTag + 'imageCanvasData'] = [];
	window[taskTag + 'mathsInput'] = [];
	window[taskTag + 'imageLoadArray'] = [];
	window[taskTag + 'imagesLoaded'] = true;
	slider[taskId] = [];
	firstPlay[taskId] = true;
	mathsInput[taskId] = [];
	textCanvas[taskId] = [];
}
function clearCanvas() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.strokeStyle = "#000";
	ctx.lineWidth = mainCanvasBorderWidth;
	ctx.beginPath();
	ctx.moveTo(mainCanvasBorderWidth / 2, mainCanvasBorderWidth / 2);
	ctx.lineTo(mainCanvasWidth - mainCanvasBorderWidth / 2, mainCanvasBorderWidth / 2);
	ctx.lineTo(mainCanvasWidth - mainCanvasBorderWidth / 2, mainCanvasHeight - mainCanvasBorderWidth / 2);
	ctx.lineTo(mainCanvasBorderWidth / 2, mainCanvasHeight - mainCanvasBorderWidth / 2);
	ctx.lineTo(mainCanvasBorderWidth / 2, mainCanvasBorderWidth / 2);
	ctx.closePath();
	ctx.fillStyle = mainCanvasFillStyle;
	ctx.fill();
	ctx.stroke();
}
function drawInactiveBox() {
	inactiveBoxctx.lineCap = "round";
	inactiveBoxctx.lineJoin = "round";
	inactiveBoxctx.clearRect(0, 0, 400, 120);
	inactiveBoxctx.fillStyle = "#FFF";
	inactiveBoxctx.strokeStyle = "#000";
	inactiveBoxctx.lineWidth = 6;
	inactiveBoxctx.beginPath();
	inactiveBoxctx.moveTo(3, 3);
	inactiveBoxctx.lineTo(397, 3);
	inactiveBoxctx.lineTo(397, 117);
	inactiveBoxctx.lineTo(3, 117);
	inactiveBoxctx.lineTo(3, 3);
	inactiveBoxctx.closePath();
	inactiveBoxctx.fill();
	inactiveBoxctx.stroke();
	inactiveBoxctx.font = "80px Hobo";
	inactiveBoxctx.textAlign = "center";
	inactiveBoxctx.textBaseline = "middle";
	inactiveBoxctx.fillStyle = "#000";
	inactiveBoxctx.fillText('Inactive', 200, 66);
	inactiveBox.style.pointerEvents = 'none';
	inactiveBox.style.zIndex = 900000;
	if (inactiveBox.parentElement == container)
		container.removeChild(inactiveBox);
}
function newcanvas(obj) {
	if (typeof obj == 'undefined')
		obj = {};
	if (typeof obj.rect !== 'undefined') {
		obj.l = obj.rect[0];
		obj.t = obj.rect[1];
		obj.w = obj.rect[2];
		obj.h = obj.rect[3];
	}
	var l = obj.l || obj.left || 0;
	var t = obj.t || obj.top || 0;
	var w = obj.w || obj.width || 1200;
	var h = obj.h || obj.height || 700;
	var vis = true;
	if (obj.visible === false || obj.vis === false)
		vis = false;
	var drag = false;
	if (obj.draggable === true || obj.drag === true)
		drag = true;
	var point = false;
	if (obj.pointerEvents === true || obj.pEvents === true || obj.pE === true || obj.point === true)
		point = true;
	var z = obj.zIndex || obj.z || 2;
	var cnv = createButton(0, l, t, w, h, vis, drag, point, z);
	resizeCanvas(cnv, cnv.data[100], cnv.data[101], cnv.data[102], cnv.data[103]);
	return cnv;
}
function newctx(obj) {
	var cnv = newcanvas(obj);
	var ctx = cnv.ctx;
	ctx.canvas = cnv;
	ctx.data = cnv.data;
	return ctx;
}
function createButton(id, left, top, width, height, visible, draggable, pointerEvents, zIndex, opt_verticesArray, opt_polygonClickFunc) {
	taskTag = taskTagArray[taskId];
	var buttonInstance = document.createElement('canvas');
	buttonInstance.width = width;
	buttonInstance.height = height;
	buttonInstance.setAttribute('id', taskTag + 'button' + id);
	buttonInstance.setAttribute('position', 'absolute');
	buttonInstance.setAttribute('cursor', 'auto');
	buttonInstance.setAttribute('draggable', 'false');
	buttonInstance.setAttribute('class', 'buttonClass');
	var buttonInstanceData = [left, top, width, height, visible, draggable, pointerEvents, zIndex];
	if (visible == true) {
		container.appendChild(buttonInstance);
		buttonInstanceData[130] = true;
	} else {
		if (buttonInstance.parentNode == container) {
			container.removeChild(buttonInstance)
		}
		buttonInstanceData[130] = false;
	}
	eval(taskTag + 'button.push(buttonInstance)');
	taskObject[taskId].push(buttonInstance);
	var buttonInstancectx = buttonInstance.getContext('2d');
	eval(taskTag + 'buttonctx.push(buttonInstancectx)');
	if (!zIndex)
		(zIndex = 2);
	buttonInstanceData[100] = left;
	buttonInstanceData[101] = top;
	buttonInstanceData[102] = width;
	buttonInstanceData[103] = height;
	buttonInstanceData[104] = visible;
	buttonInstanceData[105] = draggable;
	buttonInstanceData[106] = pointerEvents;
	buttonInstanceData[107] = zIndex;
	if (opt_verticesArray && opt_verticesArray.length > 2) {
		buttonInstanceData[41] = opt_verticesArray;
		if (typeof opt_polygonClickFunc !== 'undefined')
			buttonInstanceData[43] = opt_polygonClickFunc;
		pointerEventsFix(buttonInstance, buttonInstanceData);
		pointerEventsFixTouch(buttonInstance, buttonInstanceData);
	} else if (draggable == true) {
		makeDraggable(buttonInstance, buttonInstanceData);
	}
	eval(taskTag + 'buttonData.push(buttonInstanceData)');
	taskObjectData[taskId].push(buttonInstanceData);
	buttonInstance.style.zIndex = zIndex;
	buttonInstance.ctx = buttonInstancectx;
	buttonInstance.data = buttonInstanceData;	
	if (pointerEvents == false) {
		buttonInstance.style.pointerEvents = 'none';
	} else {
		buttonInstance.style.pointerEvents = 'auto';
	}
	if (typeof buttonInstancectx.getLineDash !== 'function')
		buttonInstancectx.getLineDash = function () {
			return []
		};
	if (typeof buttonInstancectx.setLineDash !== 'function')
		buttonInstancectx.setLineDash = function () {};
	buttonInstancectx.fillStyle = 'none';
	/*buttonInstancectx.setStroke = function (obj) {
		var lineWidth = obj.lineWidth || obj.width || obj.w || obj.thickness || this.lineWidth;
		var strokeStyle = obj.color || obj.strokeStyle || obj.style || this.strokeStyle;
		var dash = obj.dash || obj.lineDash || this.getLineDash();
		var lineCap = obj.lineCap || obj.cap || 'round';
		var lineJoin = obj.lineJoin || obj.join || obj.cap || 'round';
		this.lineWidth = lineWidth;
		this.strokeStyle = strokeStyle;
		this.setLineDash(dash);
		this.lineCap = lineCap;
		this.lineJoin = lineJoin;
	}
	buttonInstancectx.setFill = function (obj) {
		var color = obj.color || this.fillStyle;
		this.fillStyle = obj.color;
	}
	buttonInstancectx.path = function (pathArray, close, obj) {
		if (typeof obj == 'undefined')
			obj = {};
		this.beginPath();
		this.moveTo(pathArray[0][0], pathArray[0][1]);
		for (var i = 1; i < pathArray.length; i++) {
			this.lineTo(pathArray[i][0], pathArray[i][1]);
		}
		if (boolean(close, false) === true) {
			this.lineTo(pathArray[0][0], pathArray[0][1]);
		}
		if (typeof obj.fill !== 'undefined') {
			this.setFill(obj.fill);
			this.fill();
		}
		if (typeof obj.lineDec !== 'undefined') {}
		if (typeof obj.intAngles !== 'undefined') {
			if (typeof obj.intAngles.show == 'undefined') {
				obj.intAngles.show = [];
				for (var i = 0; i < pathArray.length; i++)
					obj.intAngles.show.push(true);
			}
			var angle = {
				ctx: this
			};
			angle.radius = obj.intAngles.radius || obj.intAngles.r || undefined;
			angle.squareForRight = boolean(obj.intAngles.squareForRight, true);
			angle.labelIfRight = boolean(obj.intAngles.labelIfRight, false);
			angle.drawLines = boolean(obj.intAngles.drawLines, false);
			angle.lineWidth = obj.intAngles.lineWidth || obj.intAngles.width || obj.intAngles.w || undefined;
			angle.lineColor = obj.intAngles.lineColor || obj.intAngles.color || undefined;
			angle.drawCurve = boolean(obj.intAngles.drawCurve, true);
			angle.curveWidth = obj.intAngles.curveWidth || angle.lineWidth;
			angle.curveColor = obj.intAngles.curveColor || angle.lineColor;
			if (typeof obj.intAngles.fill == 'string') {
				angle.fill = true;
				angle.fillColor = obj.intAngles.fill;
			} else {
				angle.fill = boolean(obj.intAngles.fill, false);
				angle.fillColor = obj.intAngles.fillColor || undefined;
			}
			angle.label = obj.intAngles.label || obj.intAngles.text || undefined;
			angle.labelFont = obj.intAngles.labelFont || obj.intAngles.font || undefined;
			angle.labelFontSize = obj.intAngles.labelFontSize || obj.intAngles.fontSize || undefined;
			angle.labelColor = obj.intAngles.labelColor || angle.lineColor || undefined;
			angle.labelRadius = obj.intAngles.labelRadius || undefined;
			angle.labelMeasure = boolean(obj.intAngles.labelMeasure, false);
			angle.measureRoundTo = obj.intAngles.measureRoundTo || obj.intAngles.roundTo || undefined;
			angle.angleType = obj.intAngles.angleType || undefined;
			for (var i = 0; i < pathArray.length; i++) {
				if (obj.intAngles.show[i] === true) {
					if (i === 0) {
						angle.a = pathArray[pathArray.length - 1]
					} else {
						angle.a = pathArray[i - 1]
					};
					angle.b = pathArray[i];
					if (i === pathArray.length - 1) {
						angle.c = pathArray[0]
					} else {
						angle.c = pathArray[i + 1]
					};
					if (typeof obj.intAngles.r == 'object')
						angle.radius = obj.intAngles.r[i];
					if (typeof obj.intAngles.radius == 'object')
						angle.radius = obj.intAngles.radius[i];
					if (typeof obj.intAngles.squareForRight == 'object')
						angle.squareForRight = boolean(obj.intAngles.squareForRight[i], true);
					if (typeof obj.intAngles.labelIfRight == 'object')
						angle.labelIfRight = boolean(obj.intAngles.labelIfRight[i], false);
					if (typeof obj.intAngles.drawLines == 'object')
						angle.drawLines = boolean(obj.intAngles.drawLines[i], false);
					if (typeof obj.intAngles.lineWidth == 'object')
						angle.lineWidth = obj.intAngles.lineWidth[i];
					if (typeof obj.intAngles.width == 'object')
						angle.lineWidth = obj.intAngles.width[i];
					if (typeof obj.intAngles.w == 'object')
						angle.lineWidth = obj.intAngles.w[i];
					if (typeof obj.intAngles.lineColor == 'object')
						angle.lineColor = obj.intAngles.lineColor[i];
					if (typeof obj.intAngles.color == 'object')
						angle.lineWidth = obj.intAngles.color[i];
					if (typeof obj.intAngles.drawCurve == 'object')
						angle.drawCurve = boolean(obj.intAngles.drawCurve[i], true);
					if (typeof obj.intAngles.lineWidth == 'object')
						angle.curveWidth = obj.intAngles.lineWidth[i];
					if (typeof obj.intAngles.curveWidth == 'object')
						angle.curveWidth = obj.intAngles.curveWidth[i];
					if (typeof obj.intAngles.curveColor == 'object')
						angle.curveColor = obj.intAngles.curveColor[i];
					if (typeof obj.intAngles.fill == 'object') {
						if (typeof obj.intAngles.fill[i] == 'string') {
							angle.fill = true;
							angle.fillColor = obj.intAngles.fill[i];
						} else {
							angle.fill = boolean(obj.intAngles.fill[i], false);
							if (typeof obj.intAngles.fillColor == 'object')
								angle.fillColor = obj.intAngles.fillColor[i];
						}
					}
					if (typeof obj.intAngles.label == 'object')
						angle.label = obj.intAngles.label[i];
					if (typeof obj.intAngles.text == 'object')
						angle.label = obj.intAngles.text[i];
					if (typeof obj.intAngles.labelFont == 'object')
						angle.labelFont = obj.intAngles.curveColor[i];
					if (typeof obj.intAngles.font == 'object')
						angle.labelFont = obj.intAngles.font[i];
					if (typeof obj.intAngles.labelFontSize == 'object')
						angle.labelFontSize = obj.intAngles.labelFontSize[i];
					if (typeof obj.intAngles.fontSize == 'object')
						angle.labelFontSize = obj.intAngles.fontSize[i];
					if (typeof obj.intAngles.lineColor == 'object')
						angle.labelColor = obj.intAngles.lineColor[i];
					if (typeof obj.intAngles.labelColor == 'object')
						angle.labelColor = obj.intAngles.labelColor[i];
					if (typeof obj.intAngles.labelRadius == 'object')
						angle.labelRadius = obj.intAngles.labelRadius[i];
					if (typeof obj.intAngles.labelMeasure == 'object')
						angle.labelMeasure = boolean(obj.intAngles.labelMeasure[i], false);
					if (typeof obj.intAngles.measureRoundTo == 'object')
						angle.measureRoundTo = obj.intAngles.measureRoundTo[i];
					if (typeof obj.intAngles.roundTo == 'object')
						angle.measureRoundTo = obj.intAngles.roundTo[i];
					drawAngle(angle);
				}
			}
		}
		if (typeof obj.vertexLabels !== 'undefined') {
			if (typeof obj.vertexLabels.show == 'undefined') {
				obj.vertexLabels.show = [];
				for (var i = 0; i < pathArray.length; i++)
					obj.vertexLabels.show.push(true);
			}
			var angle = {
				ctx: this
			};
			angle.labelIfRight = true;
			angle.drawLines = false;
			angle.drawCurve = false;
			angle.fill = false;
			angle.label = obj.vertexLabels.label || obj.vertexLabels.text || undefined;
			angle.labelFont = obj.vertexLabels.labelFont || obj.vertexLabels.font || undefined;
			angle.labelFontSize = obj.vertexLabels.labelFontSize || obj.vertexLabels.fontSize || undefined;
			angle.labelColor = obj.vertexLabels.labelColor || angle.lineColor || undefined;
			angle.labelRadius = obj.vertexLabels.labelRadius || obj.vertexLabels.radius || obj.vertexLabels.r || undefined;
			angle.labelMeasure = false;
			for (var i = 0; i < pathArray.length; i++) {
				if (obj.vertexLabels.show[i] === true) {
					if (i === 0) {
						angle.c = pathArray[pathArray.length - 1]
					} else {
						angle.c = pathArray[i - 1]
					};
					angle.b = pathArray[i];
					if (i === pathArray.length - 1) {
						angle.a = pathArray[0]
					} else {
						angle.a = pathArray[i + 1]
					};
					if (typeof obj.vertexLabels.label == 'object')
						angle.label = obj.vertexLabels.label[i];
					if (typeof obj.vertexLabels.text == 'object')
						angle.label = obj.vertexLabels.text[i];
					if (typeof obj.vertexLabels.labelFont == 'object')
						angle.labelFont = obj.vertexLabels.curveColor[i];
					if (typeof obj.vertexLabels.font == 'object')
						angle.labelFont = obj.vertexLabels.font[i];
					if (typeof obj.vertexLabels.labelFontSize == 'object')
						angle.labelFontSize = obj.vertexLabels.labelFontSize[i];
					if (typeof obj.vertexLabels.fontSize == 'object')
						angle.labelFontSize = obj.vertexLabels.fontSize[i];
					if (typeof obj.vertexLabels.lineColor == 'object')
						angle.labelColor = obj.vertexLabels.lineColor[i];
					if (typeof obj.vertexLabels.labelColor == 'object')
						angle.labelColor = obj.vertexLabels.labelColor[i];
					if (typeof obj.vertexLabels.radius == 'object')
						angle.labelRadius = obj.vertexLabels.radius[i];
					if (typeof obj.vertexLabels.r == 'object')
						angle.labelRadius = obj.vertexLabels.r[i];
					if (typeof obj.vertexLabels.labelRadius == 'object')
						angle.labelRadius = obj.vertexLabels.labelRadius[i];
					drawAngle(angle);
				}
			}
		}
		if (typeof obj.edgeLabels !== 'undefined') {
			if (typeof obj.edgeLabels.show == 'undefined') {
				obj.edgeLabels.show = [];
				for (var i = 0; i < pathArray.length; i++)
					obj.edgeLabels.show.push(true);
			}
			var label = {
				ctx: this
			};
			label.font = obj.edgeLabels.font || undefined;
			label.fontSize = obj.edgeLabels.fontSize || undefined;
			label.width = 1200;
			for (var i = 0; i < pathArray.length; i++) {
				if (obj.edgeLabels.show[i] === true) {
					var a = pathArray[i];
					var b = pathArray[(i + 1) % pathArray.length];
					label.textArray = obj.edgeLabels.text[i];
					labelLine(a, b, label);
				}
			}
		}
		if (typeof obj.stroke !== 'undefined') {
			this.beginPath();
			this.moveTo(pathArray[0][0], pathArray[0][1]);
			for (var i = 1; i < pathArray.length; i++) {
				this.lineTo(pathArray[i][0], pathArray[i][1]);
			}
			if (boolean(close, false) === true) {
				this.lineTo(pathArray[0][0], pathArray[0][1]);
			}
			this.setStroke(obj.stroke);
			this.stroke();
		}
	}
	buttonInstancectx.clear = function () {
		this.clearRect(0, 0, this.data[102], this.data[103]);
	}
	buttonInstance.setLeft = function (left) {
		this.data[100] = left;
		resizeCanvas2(this, this.data[100], this.data[101]);
	}
	buttonInstance.setTop = function (top) {
		this.data[101] = top;
		resizeCanvas2(this, this.data[100], this.data[101]);
	}
	buttonInstance.setPos = function (left, top) {
		this.data[100] = left;
		this.data[101] = top;
		resizeCanvas2(this, this.data[100], this.data[101]);
	}
	buttonInstance.setWidth = function (width) {
		this.data[102] = width;
		resizeCanvas(this, this.data[100], this.data[101], this.data[102], this.data[103]);
	}
	buttonInstance.setHeight = function (height) {
		this.data[103] = height;
		resizeCanvas(this, this.data[100], this.data[101], this.data[102], this.data[103]);
	}
	buttonInstance.setDims = function (width, height) {
		this.data[102] = width;
		this.data[103] = height;
		resizeCanvas(this, this.data[100], this.data[101], this.data[102], this.data[103]);
	}
	buttonInstance.setVis = function (vis) {
		if (typeof vis == 'undefined') {
			this.data[104] = !this.data[104];
		} else {
			this.data[104] = vis;
		}
		if (this.data[104] == true) {
			showObj(this);
		} else {
			hideObj(this);
		}
	}
	buttonInstance.setPE = function (point) {
		if (typeof point == 'undefined') {
			this.data[106] = !this.data[106];
		} else {
			this.data[106] = point;
		}
		if (this.data[106] == true) {
			this.style.pointerEvents = 'auto';
		} else {
			this.style.pointerEvents = 'none';
		}
	}
	buttonInstance.setZ = function (z) {
		this.data[107] = z;
		this.style.zIndex = z;
	}
	buttonInstance.setCursor = function (cursor) {
		this.style.cursor = cursor || 'pointer';
	}
	buttonInstance.setOpacity = function (opacity) {
		this.style.opacity = opacity;
	}*/
	return buttonInstance;
}
function createCanvas(left, top, width, height, visible, draggable, pointerEvents, zIndex) {
	var canvasInstance = document.createElement('canvas');
	canvasInstance.width = width;
	canvasInstance.height = height;
	canvasInstance.setAttribute('position', 'absolute');
	canvasInstance.setAttribute('cursor', 'auto');
	canvasInstance.setAttribute('draggable', 'false');
	canvasInstance.setAttribute('class', 'buttonClass');
	var canvasInstanceData = [left, top, width, height, visible, draggable, pointerEvents, zIndex];
	if (visible == true) {
		container.appendChild(canvasInstance);
		canvasInstanceData[130] = true;
	} else {
		if (canvasInstance.parentNode == container)
			container.removeChild(canvasInstance);
		canvasInstanceData[130] = false;
	}
	for (var i = 0; i < 8; i++) {
		canvasInstanceData[100 + i] = canvasInstanceData[i];
	}
	canvasInstance.style.zIndex = zIndex;
	if (pointerEvents == false)
		canvasInstance.style.pointerEvents = 'none';
	if (draggable == true) {
		makeDraggable(canvasInstance, canvasInstanceData)
	}
	taskObject[taskId].push(canvasInstance);
	taskObjectData[taskId].push(canvasInstanceData);
	canvasInstance.data = canvasInstanceData;
	canvasInstance.ctx = canvasInstance.getContext('2d');
	return canvasInstance;
}
function createTextCanvas(object) {
	var left = object.left;
	var top = object.top;
	var text = object.text || "";
	var id = object.id || textCanvas[taskId].length;
	var width = object.width || 300;
	var spacing = object.spacing || 30;
	var visible;
	if (typeof object.visible == 'boolean') {
		visible = object.visible
	} else {
		visible = true
	};
	var draggable;
	if (typeof object.draggable == 'boolean') {
		draggable = object.draggable
	} else {
		draggable = false
	};
	var pointerEvents;
	if (typeof object.pointerEvents == 'boolean') {
		pointerEvents = object.pointerEvents
	} else {
		pointerEvents = false
	};
	var zIndex = object.zIndex || 2;
	var font = object.font || '24px Arial';
	var textColor = object.textColor || '#000';
	var textAlign = object.textAlign || 'left';
	createTextCanvas2(id, left, top, width, spacing, visible, draggable, pointerEvents, zIndex, font, textColor, textAlign, text)
}
function createTextCanvas2(id, left, top, width, spacing, visible, draggable, pointerEvents, zIndex, font, textColor, textAlign, text) {
	var canvasInstance = document.createElement('canvas');
	canvasInstance.width = width;
	canvasInstance.height = spacing;
	canvasInstance.setAttribute('position', 'absolute');
	canvasInstance.setAttribute('cursor', 'auto');
	canvasInstance.setAttribute('draggable', 'false');
	canvasInstance.setAttribute('class', 'buttonClass');
	var canvasInstanceData = [left, top, width, spacing, visible, draggable, pointerEvents, zIndex];
	if (visible == true) {
		container.appendChild(canvasInstance);
		canvasInstanceData[130] = true;
	} else {
		if (canvasInstance.parentNode == container) {
			container.removeChild(canvasInstance)
		}
		canvasInstanceData[130] = false;
	}
	taskObject[taskId].push(canvasInstance);
	var canvasInstancectx = canvasInstance.getContext('2d');
	canvasInstanceData[100] = left;
	canvasInstanceData[101] = top;
	canvasInstanceData[102] = width;
	canvasInstanceData[103] = spacing;
	canvasInstanceData[104] = visible;
	canvasInstanceData[105] = draggable;
	canvasInstanceData[106] = pointerEvents;
	canvasInstanceData[107] = zIndex;
	taskObjectData[taskId].push(canvasInstanceData);
	canvasInstance.style.zIndex = zIndex;
	if (pointerEvents == false) {
		canvasInstance.style.pointerEvents = 'none';
		canvasInstance.style.cursor = 'auto';
	} else {
		canvasInstance.style.pointerEvents = 'auto';
	}
	if (draggable == true) {
		makeDraggable(canvasInstance, canvasInstanceData)
	}
	var obj = {
		id: id,
		canvas: canvasInstance,
		ctx: canvasInstancectx,
		data: canvasInstanceData,
		spacing: spacing,
		font: font,
		textColor: textColor,
		textAlign: textAlign,
		text: text,
		lineCount: 1
	};
	textCanvas[taskId][id] = obj;
	drawTextCanvas(taskId, id);
}
function drawTextCanvas(taskNum2, textCanvasId) {
	var width = Number(textCanvas[taskNum2][textCanvasId].data[102]);
	textCanvas[taskNum2][textCanvasId].canvas.width = width;
	textCanvas[taskNum2][textCanvasId].canvas.style.width = canvasDisplayWidth * width / mainCanvasWidth + 'px';
	var ctx = textCanvas[taskNum2][textCanvasId].ctx;
	var x = 0;
	if (textCanvas[taskNum2][textCanvasId].textAlign == 'center') {
		x = 0.5 * textCanvas[taskNum2][textCanvasId].canvas.width
	};
	if (textCanvas[taskNum2][textCanvasId].textAlign == 'right') {
		x = textCanvas[taskNum2][textCanvasId].canvas.width
	};
	var lineCount;
	wrapText2();
	function wrapText2() {
		ctx.textBaseline = 'middle';
		ctx.textAlign = textCanvas[taskNum2][textCanvasId].textAlign;
		ctx.font = textCanvas[taskNum2][textCanvasId].font;
		ctx.fillStyle = textCanvas[taskNum2][textCanvasId].textColor;
		var y = 0.5 * textCanvas[taskNum2][textCanvasId].spacing;
		lineCount = 1;
		var words = textCanvas[taskNum2][textCanvasId].text.split(' ');
		var line = '';
		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = ctx.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > width && n > 0) {
				ctx.fillText(line, x, y);
				line = words[n] + ' ';
				y += textCanvas[taskNum2][textCanvasId].spacing;
				lineCount++;
			} else {
				line = testLine;
			}
		}
		ctx.fillText(line, x, y);
	}
	textCanvas[taskNum2][textCanvasId].lineCount = lineCount;
	var height = textCanvas[taskNum2][textCanvasId].spacing * lineCount;
	textCanvas[taskNum2][textCanvasId].height = height;
	textCanvas[taskNum2][textCanvasId].canvas.height = height;
	textCanvas[taskNum2][textCanvasId].canvas.style.height = canvasDisplayHeight * height / mainCanvasWidth + 'px';
	textCanvas[taskNum2][textCanvasId].data[3] = height;
	textCanvas[taskNum2][textCanvasId].data[103] = height;
	wrapText2();
	resize();
}
function createImageCanvas(id, taskTag, taskId, filename, left, top, visible, draggable, pointerEvents, zIndex, scaleFactor, opacity, verticesArray, onload) {
	var imageInstanceURL = './images/' + filename;
	var imageInstance = new Image;
	imageInstance.src = imageInstanceURL;
	if (!verticesArray) {
		var verticesArray = []
	};
	var imageCanvasInstance = document.createElement('canvas');
	eval(taskTag + 'imageCanvas[' + id + ']=imageCanvasInstance');
	taskObject[taskId].push(imageCanvasInstance);
	imageCanvasInstance.setAttribute('id', taskTag + 'imageCanvas' + id);
	imageCanvasInstance.setAttribute('position', 'absolute');
	imageCanvasInstance.setAttribute('class', 'buttonClass');
	if (!scaleFactor) {
		scaleFactor = 1
	};
	if (!opacity) {
		var opacity = 1
	};
	if (!zIndex)
		(zIndex = 2);
	imageCanvasInstance.style.zIndex = zIndex;
	if (pointerEvents == false) {
		imageCanvasInstance.style.pointerEvents = 'none';
	} else {
		imageCanvasInstance.style.pointerEvents = 'auto';
	}
	var imageCanvasInstancectx = imageCanvasInstance.getContext('2d');
	eval(taskTag + 'imageCanvasctx[' + id + ']=imageCanvasInstancectx');
	var leftPos = left;
	if (left == 'center')
		leftPos = 550
			var imageCanvasInstanceData = [leftPos, top, 100, 100, visible, draggable, pointerEvents, zIndex];
	if (visible == true && taskId == taskNum) {
		imageCanvasInstanceData[130] = true;
		container.appendChild(imageCanvasInstance);
	} else {
		imageCanvasInstanceData[130] = false;
		if (imageCanvasInstance.parentNode == container) {
			container.removeChild(imageCanvasInstance)
		}
	}
	imageCanvasInstanceData[100] = leftPos;
	imageCanvasInstanceData[101] = top;
	imageCanvasInstanceData[102] = 100;
	imageCanvasInstanceData[103] = 100;
	imageCanvasInstanceData[104] = visible;
	imageCanvasInstanceData[105] = draggable;
	imageCanvasInstanceData[106] = pointerEvents;
	imageCanvasInstanceData[107] = zIndex;
	imageCanvasInstanceData[40] = opacity;
	imageCanvasInstance.data = imageCanvasInstanceData;
	if (verticesArray && verticesArray.length > 2) {
		imageCanvasInstanceData[41] = verticesArray;
		pointerEventsFix(imageCanvasInstance, imageCanvasInstanceData, 'drag');
		pointerEventsFixTouch(imageCanvasInstance, imageCanvasInstanceData, 'drag');
	} else if (draggable == true) {
		makeDraggable(imageCanvasInstance, imageCanvasInstanceData);
	}
	eval(taskTag + 'imageCanvasData[' + id + ']=imageCanvasInstanceData');
	taskObjectData[taskId].push(imageCanvasInstanceData);
	eval(taskTag + 'imageLoadArray[' + id + '] = false');
	eval(taskTag + 'imagesLoaded = false');
	imageInstance.onload = function () {
		createImageCanvas2(imageInstance, imageCanvasInstance, imageCanvasInstancectx, imageCanvasInstanceData, id, taskTag, taskId, left, scaleFactor, onload)
	}
	return imageCanvasInstance;
}
function createImageCanvas2(imageInstance, imageCanvasInstance, imageCanvasInstancectx, imageCanvasInstanceData, id, taskTag, taskId, left, scaleFactor, onload) {
	var width = imageInstance.naturalWidth * scaleFactor;
	var height = imageInstance.naturalHeight * scaleFactor;
	imageCanvasInstance.width = width;
	imageCanvasInstance.height = height;
	imageCanvasInstancectx.drawImage(imageInstance, 0, 0, width, height);
	if (left == 'center') {
		imageCanvasInstanceData[0] = 600 - 0.5 * width;
		imageCanvasInstanceData[100] = 600 - 0.5 * width;
	}
	imageCanvasInstanceData[2] = width;
	imageCanvasInstanceData[3] = height;
	imageCanvasInstanceData[102] = width;
	imageCanvasInstanceData[103] = height;
	eval(taskTag + 'imageLoadArray[' + id + '] = true');
	var allImagesLoaded = true;
	for (var iii = 0; iii < eval(taskTag + 'imageLoadArray.length'); iii++) {
		if (eval(taskTag + 'imageLoadArray[' + iii + '] == false'))
			allImagesLoaded = false;
	}
	if (allImagesLoaded == true) {
		eval(taskTag + 'imagesLoaded = true');
	}
	if (typeof onload === 'function') onload(imageCanvasInstance);
	resize();
}
function drawHolderButton(i) {
	if (typeof holderButton == 'undefined' || typeof holderButton[i] == 'undefined')
		return;
	holderButtonctx[i].lineCap = "round";
	holderButtonctx[i].lineJoin = "round";
	holderButtonctx[i].clearRect(0, 0, holderButtonData[i][2], holderButtonData[i][3]);
	if (i === 0 || i === 2) {
		holderButtonctx[i].fillStyle = "#6F9";
	} else if (i === 1) {
		holderButtonctx[i].fillStyle = "#C9F";
	} else if (i === 3) {
		holderButtonctx[i].fillStyle = "#6CF";
	} else if (i === 4) {
		holderButtonctx[i].fillStyle = "#99F";
		holderButton[i].style.cursor = "auto";
	}
	holderButtonctx[i].strokeStyle = "#000";
	if (taskOrTool == 'tool') {
		holderButtonctx[i].lineWidth = 4;
		holderButtonctx[i].beginPath();
		holderButtonctx[i].moveTo(2, 2);
		holderButtonctx[i].lineTo(holderButtonData[i][2] - 2, 2);
		holderButtonctx[i].lineTo(holderButtonData[i][2] - 2, holderButtonData[i][3] - 2);
		holderButtonctx[i].lineTo(3, holderButtonData[i][3] - 2);
		holderButtonctx[i].lineTo(2, 2);
		holderButtonctx[i].closePath();
		holderButtonctx[i].fill();
		holderButtonctx[i].stroke();
		switch (i) {
		case 0:
			drawPath({
				ctx: holderButtonctx[i],
				path: [[33, 15], [33, 35], [17, 25]],
				lineColor: '#000',
				fillColor: '#000',
				lineWidth: 2
			});
			break;
		case 1:
			holderButtonctx[i].beginPath();
			holderButtonctx[i].lineWidth = 5;
			holderButtonctx[i].arc(25, 25, 10, 0.2 * Math.PI, 1.8 * Math.PI)
			holderButtonctx[i].lineWidth = 4;
			holderButtonctx[i].moveTo(35, 20);
			holderButtonctx[i].lineTo(33, 10);
			holderButtonctx[i].moveTo(35, 19);
			holderButtonctx[i].lineTo(28, 24);
			holderButtonctx[i].stroke();
			break;
		case 2:
			drawPath({
				ctx: holderButtonctx[i],
				path: [[17, 15], [17, 35], [33, 25]],
				lineColor: '#000',
				fillColor: '#000',
				lineWidth: 2
			});
			break;
		case 3:
			break;
		case 4:
			holderButtonctx[i].font = "30px Hobo";
			holderButtonctx[i].textAlign = "center";
			holderButtonctx[i].textBaseline = "middle";
			holderButtonctx[i].fillStyle = "#000";
			holderButtonctx[i].fillText(holderButtonData[i][4], holderButtonData[i][2] / 2, holderButtonData[i][3] / 2);
			break;
		}
	} else {
		holderButtonctx[i].lineWidth = 6;
		holderButtonctx[i].beginPath();
		holderButtonctx[i].moveTo(3, 3);
		holderButtonctx[i].lineTo(holderButtonData[i][2] - 3, 3);
		holderButtonctx[i].lineTo(holderButtonData[i][2] - 3, holderButtonData[i][3] - 3);
		holderButtonctx[i].lineTo(3, holderButtonData[i][3] - 3);
		holderButtonctx[i].lineTo(3, 3);
		holderButtonctx[i].closePath();
		holderButtonctx[i].fill();
		holderButtonctx[i].stroke();
		holderButtonctx[i].font = "30px Hobo";
		holderButtonctx[i].textAlign = "center";
		holderButtonctx[i].textBaseline = "middle";
		holderButtonctx[i].fillStyle = "#000";
		holderButtonctx[i].fillText(holderButtonData[i][4], holderButtonData[i][2] / 2, holderButtonData[i][3] / 2);
	}
}
function userInfoTextUpdate() {
	if (typeof userInfoText == 'undefined')
		return;
	if (taskOrTool == 'Task') {
		userInfoTextctx.clearRect(0, 0, 343, 62);
		userInfoTextctx.strokeStyle = "#000";
		userInfoTextctx.lineWidth = 4;
		userInfoTextctx.beginPath();
		userInfoTextctx.moveTo(0, 60);
		userInfoTextctx.lineTo(343, 60);
		userInfoTextctx.stroke();
		userInfoTextctx.font = "24px Verdana, Geneva, sans-serif";
		userInfoTextctx.textAlign = "left";
		userInfoTextctx.textBaseline = "middle";
		userInfoTextctx.fillStyle = "#000";
		if (userName) {
			var welcomeText = "Welcome " + userName;
			userInfoTextctx.fillText(welcomeText, 2, 15);
		}
		var completionText = getArrayCount(taskState, 1) + ' out of ' + (task.length) + ' pages completed';
		userInfoTextctx.fillText(completionText, 2, 42);
	}
}
function clickHolderButton(event) {
	event.preventDefault();
	var buttonClicked = holderButton.indexOf(event.currentTarget);
	dismissTaskCompleteMessage();
	dismissSmallTaskCompleteMessage();
	switch (buttonClicked) {
	case 0:
		changeTask(-1);
		break;
	case 1:
		for (i = 0; i < taskObject[taskNum].length; i++) {
			for (j = 0; j < 8; j++) {
				taskObjectData[taskNum][i][j + 100] = taskObjectData[taskNum][i][j];
			}
			if (taskObjectData[taskNum][i][4] == true) {
				showObj(taskObject[taskNum][i], taskObjectData[taskNum][i]);
			} else {
				hideObj(taskObject[taskNum][i], taskObjectData[taskNum][i]);
			}
			if (taskObjectData[taskNum][i][5] == true) {
				makeDraggable(taskObject[taskNum][i], taskObjectData[taskNum][i]);
			} else {
				makeNotDraggable(taskObject[taskNum][i], taskObjectData[taskNum][i]);
			}
			if (taskObjectData[taskNum][i][6] == true) {
				taskObject[taskNum][i].style.pointerEvents = 'auto';
			} else {
				taskObject[taskNum][i].style.pointerEvents = 'none';
			}
			if (taskObjectData[taskNum][i][7]) {
				taskObject[taskNum][i].style.zIndex = taskObjectData[taskNum][i][7];
			}
		}
		if (keyboard[taskNum]) {
			hideKeyboard2();
			keyboardData[taskNum][100] = keyboardData[taskNum][0];
			keyboardData[taskNum][101] = keyboardData[taskNum][1];
			for (var i = 0; i < key1Data[taskNum].length; i++) {
				key1Data[taskNum][i][100] = key1Data[taskNum][i][0];
				key1Data[taskNum][i][101] = key1Data[taskNum][i][1];
			}
		}
		for (var i = 0; i < mathsInput[taskNum].length; i++) {
			setMathsInputText(mathsInput[taskNum][i], mathsInput[taskNum][i].startText.slice(0));
		}
		if (eval(taskTag + 'mathsInput')) {
			for (var i = 0; i < eval(taskTag + 'mathsInput.length'); i++) {
				eval(taskTag + 'mathsInput[i].active = true;');
			}
		}
		resetDrawTools();
		clearCanvas();
		if (typeof backgroundLoadHandler[taskNum] === 'function')
			backgroundLoadHandler[taskNum]();
		loadHandler[taskNum]();
		if (taskReset[taskNum]) {
			taskReset[taskNum]()
		};
		unfadePage();
		clearInterval(videoPlaying);
		replayVideoTime = 0;
		if (typeof player[taskId] !== 'undefined' && firstPlay[taskId] == false) {
			player[taskId].seekTo(0, true);
			player[taskId].pauseVideo()
		}
		firstPlay[taskNum] = true;
		resize();
		break;
	case 2:
		changeTask(1);
		break;
	case 3:
		window.location.href = '../../myProfile.php';
		break;
	}
}
function changeTask(diff) {
	if (window.pageLoading == true) return;
	if (taskNum+diff < 0 || taskNum+diff > task.length-1) return;
	
	if (keyboard[taskNum] && keyboard[taskNum].parentNode == container) {
		container.removeChild(keyboard[taskNum]);
		for (var i = 0; i < key1[taskNum].length; i++) {
			container.removeChild(key1[taskNum][i]);
			if (i < key1[taskNum].length - 1) {
				key1[taskNum][i].style.opacity = 0.7;
				key1[taskNum][i].style.pointerEvents = 'none';
			}
		}
	}
	if (typeof player[taskNum] !== 'undefined' && firstPlay[taskNum] == false) {
		player[taskNum].pauseVideo();
	}
	window.diff = diff;
	taskNum = taskNum+diff;
	taskId = taskNum;
	
	clearInterval(videoPlaying);
	currMathsInputId = 0;
	penColour = -1;
	taskId = taskNum;
	if (pageLoaded[taskId] == false) {
		window.pageLoading = true;
		loadScript(task[taskId] + '.js', pageScriptLoaded, pageScriptLoadError);
	} else {
		pageScriptLoaded2();
	}
	function pageScriptLoadError() {
		window.pageLoading = false;
		changeTask(-window.diff);
		Notifier.error('Error connecting to the server. The page cannot be loaded.');
	}
	function pageScriptLoaded() {
		window.pageLoading = false;
		pageLoaded[taskId] = true;
		if (typeof backgroundLoadHandler[taskNum] === 'function')
			backgroundLoadHandler[taskNum]();
		loadHandler[taskNum]();
		pageScriptLoaded2();
	}
	function pageScriptLoaded2() {
		taskTag = taskTagArray[taskNum];
		for (j = 0; j < taskObject.length; j++) {
			for (i = 0; i < taskObject[j].length; i++) {
				if (taskNum == j) {
					if (taskObjectData[j][i][130] == true) {
						container.appendChild(taskObject[j][i])
					}
				} else {
					if (taskObject[j][i].parentNode == container) {
						container.removeChild(taskObject[j][i])
					}
				}
			}
			if (taskVideo[j]) {
				if (j == taskNum) {
					iframe[j].style.zIndex = 500;
					iframe[j].style.opacity = 1;
				} else {
					iframe[j].style.zIndex = 0;
					iframe[j].style.opacity = 0
				}
			}
		}
		for (i = 0; i < taskObject[taskNum].length; i++) {
			if (taskObjectData[taskNum][i][104] && taskObjectData[taskNum][i][104] == true) {
				showObj(taskObject[taskNum][i], taskObjectData[taskNum][i]);
			} else {
				hideObj(taskObject[taskNum][i], taskObjectData[taskNum][i]);
			}
		}
		unfadePage();
		if (taskState[taskNum] == 1) {
			fadePage();
			container.appendChild(holderButton[5]);
			container.appendChild(holderButton[6]);
		}
		if (keyboard[taskNum]) {
			if (keyboardVis[taskNum] == true) {
				container.appendChild(hideKeys[taskNum]);
				if (showKeys[taskNum].parentNode == container) {
					container.removeChild(showKeys[taskNum])
				};
				container.appendChild(keyboard[taskNum]);
				for (var i = 0; i < key1[taskNum].length; i++) {
					container.appendChild(key1[taskNum][i]);
					if (i < key1[taskNum].length - 1) {
						key1[taskNum][i].style.opacity = 0.7;
						key1[taskNum][i].style.pointerEvents = 'none';
					}
				}
			} else {
				container.appendChild(showKeys[taskNum]);
				if (hideKeys[taskNum].parentNode == container) {
					container.removeChild(hideKeys[taskNum])
				};
				for (var i = 0; i < key1[taskNum].length; i++) {
					if (i < key1[taskNum].length - 1) {
						key1[taskNum][i].style.opacity = 0.7;
						key1[taskNum][i].style.pointerEvents = 'none';
					}
				}
			}
		}
		clearCanvas();
		if (typeof backgroundLoadHandler[taskNum] === 'function')
			backgroundLoadHandler[taskNum]();
		resize();
	}
	holderButtonData[4][4] = taskNum + 1;
	drawHolderButton(4);
	if (taskNum == 0) {
		holderButton[0].style.opacity = "0.5";
		holderButton[0].style.filter = 'alpha(opacity = 50)';
		holderButton[0].style.cursor = "auto";
		holderButton[0].style.pointerEvents = "none";
	} else {
		holderButton[0].style.opacity = "1";
		holderButton[0].style.filter = 'alpha(opacity = 100)';
		holderButton[0].style.cursor = "pointer";
		holderButton[0].style.pointerEvents = "auto";
	}
	if (taskNum == task.length - 1) {
		holderButton[2].style.opacity = "0.5";
		holderButton[2].style.filter = 'alpha(opacity = 50)';
		holderButton[2].style.cursor = "auto";
		holderButton[2].style.pointerEvents = "none";
	} else {
		holderButton[2].style.opacity = "1";
		holderButton[2].style.filter = 'alpha(opacity = 100)';
		holderButton[2].style.cursor = "pointer";
		holderButton[2].style.pointerEvents = "auto";
	}
}
function fadePage() {
	unfadePage();
	canvas.style.opacity = 0.6;
	for (i = 0; i < taskObject[taskNum].length; i++) {
		taskObject[taskNum][i].style.opacity = 0.5;
	}
	if (keyboard[taskNum])
		keyboard[taskNum].style.opacity = 0.5;
	if (key1[taskNum]) {
		for (var i = 0; i < key1[taskNum].length; i++) {
			key1[taskNum][i].style.opacity = 0.5;
		}
	}
}
function unfadePage() {
	canvas.style.opacity = 1;
	if (typeof userInfoText !== 'undefined')
		userInfoText.style.opacity = 1;
	if (typeof inactiveBox !== 'undefined' && inactiveBox.parentNode == container) {
		container.removeChild(inactiveBox)
	};
	if (typeof holderButton !== 'undefined') {
		if (!un(holderButton[5]) && holderButton[5].parentNode == container) {
			container.removeChild(holderButton[5])
		};
		if (!un(holderButton[6]) && holderButton[6].parentNode == container) {
			container.removeChild(holderButton[6])
		};
		for (var i = 0; i < holderButton.length; i++) {
			holderButton[i].style.opacity = 1;
		}
		if (taskNum == 0 && !un(holderButton[0])) {
			holderButton[0].style.opacity = "0.5";
			holderButton[0].style.filter = 'alpha(opacity = 50)';
			holderButton[0].style.cursor = "auto";
			holderButton[0].style.pointerEvents = "none";
		}
		if (taskNum == task.length - 1 && !un(holderButton[2])) {
			holderButton[2].style.opacity = "0.5";
			holderButton[2].style.filter = 'alpha(opacity = 50)';
			holderButton[2].style.cursor = "auto";
			holderButton[2].style.pointerEvents = "none";
		}
	}
	var startAt = 0;
	if (!un(taskObject[taskNum])) {
		for (var i = startAt; i < taskObject[taskNum].length; i++) {
			if (typeof taskObjectData[taskNum][i][40] == 'number') {
				taskObject[taskNum][i].style.opacity = taskObjectData[taskNum][i][40];
			} else {
				taskObject[taskNum][i].style.opacity = 1;
			}
		}
	}
	if (keyboard[taskNum])
		keyboard[taskNum].style.opacity = 1;
	if (key1[taskNum]) {
		for (var i = 0; i < key1[taskNum].length; i++) {
			key1[taskNum][i].style.opacity = 0.75;
		}
		key1[taskNum][key1[taskNum].length - 1].style.opacity = 1
	}
}
function makeDraggable(object, objectData, left, top, horizSpacing, vertSpacing, vertLines, horizLines, toFront) {
	addListenerStart(object,dragStart);
	if (dragObject.indexOf(object) == -1) {
		object.style.cursor = openhand;
		dragObject.push(object);
		objectData[100] = objectData[0];
		objectData[101] = objectData[1];
		for (i = 0; i < taskObject.length; i++) {
			if (taskObject[i].indexOf(object) > -1) {
				objectData[109] = i;
			}
		}
		if (typeof left !== 'undefined') {
			objectData[110] = left;
			objectData[111] = top;
			objectData[112] = horizSpacing;
			objectData[113] = vertSpacing;
			objectData[114] = vertLines;
			objectData[115] = horizLines;
			objectData[116] = true;
		} else {
			objectData[116] = false;
		}
		if (toFront) {
			objectData[117] = toFront;
		} else {
			objectData[117] = true;
		}
		dragObjectData.push(objectData);
	}
}
function makeNotDraggable(object, objectData, taskId) {
	removeListenerStart(object,dragStart);
	object.style.cursor = 'default';
}
function dragStart(e) {
	try {
		if (typeof eval(taskTag + 'dragStart') == 'function') {
			eval(taskTag + 'dragStart(e);');
		}
	} catch (err) {}
	e.preventDefault();
	currentDragId = dragObject.indexOf(e.target);
	if (dragObjectData[currentDragId][117] == true) {
		dragObject[currentDragId].style.zIndex = zIndexFront;
		zIndexFront++;
	}
	if (e.touches) {
		var x = e.touches[0].pageX;
		var y = e.touches[0].pageY;
	} else {
		var x = e.clientX || e.pageX;
		var y = e.clientY || e.pageY;
	}
	var dragObjectBoundingRect = dragObject[currentDragId].getBoundingClientRect();
	dragOffset.x = x - dragObjectBoundingRect.left;
	dragOffset.y = y - dragObjectBoundingRect.top;
	if (dragObjectData[currentDragId][116] == true) {
		dragArea.xMin = canvasDisplayRect.left + ((dragObjectData[currentDragId][110] - event.currentTarget.width / 2) / mainCanvasWidth) * canvasDisplayWidth;
		dragArea.xMax = canvasDisplayRect.left + ((dragObjectData[currentDragId][110] + dragObjectData[currentDragId][112] * dragObjectData[currentDragId][114] - event.currentTarget.width / 2) / mainCanvasWidth) * canvasDisplayWidth;
		dragArea.yMin = canvasDisplayRect.top + ((dragObjectData[currentDragId][111] - event.currentTarget.height / 2) / mainCanvasHeight) * canvasDisplayHeight;
		dragArea.yMax = canvasDisplayRect.top + ((dragObjectData[currentDragId][111] + dragObjectData[currentDragId][113] * dragObjectData[currentDragId][115] - event.currentTarget.height / 2) / mainCanvasHeight) * canvasDisplayHeight;
	} else {
		dragArea.xMin = canvasDisplayRect.left + (15 / mainCanvasWidth) * canvasDisplayWidth;
		dragArea.xMax = canvasDisplayRect.right - (15 / mainCanvasWidth) * canvasDisplayWidth - (dragObjectBoundingRect.right - dragObjectBoundingRect.left);
		dragArea.yMin = canvasDisplayRect.top + (100 / mainCanvasHeight) * canvasDisplayHeight;
		dragArea.yMax = canvasDisplayRect.bottom - (15 / mainCanvasHeight) * canvasDisplayHeight - (dragObjectBoundingRect.bottom - dragObjectBoundingRect.top);
	}
	addListenerMove(window,dragMove);
	addListenerEnd(window,dragStop);
	e.target.style.cursor = closedhand;
	try {
		if (typeof eval(taskTag + 'dragStart2') == 'function') {
			eval(taskTag + 'dragStart2(e);');
		}
	} catch (err) {}
}
function dragMove(e) {
	try {
		if (typeof eval(taskTag + 'dragMove') == 'function') {
			eval(taskTag + 'dragMove(e);');
		}
	} catch (err) {}
	e.preventDefault();
	if (e.touches) {
		var x = e.touches[0].pageX;
		var y = e.touches[0].pageY;
	} else {
		var x = e.clientX || e.pageX;
		var y = e.clientY || e.pageY;
	}
	var l = x - dragOffset.x;
	l = Math.max(l, dragArea.xMin);
	l = Math.min(l, dragArea.xMax);
	var t = y - dragOffset.y;
	t = Math.max(t, dragArea.yMin);
	t = Math.min(t, dragArea.yMax);
	dragObject[currentDragId].style.left = l + 'px';
	dragObjectData[currentDragId][100] = xWindowToCanvas(l);
	dragObject[currentDragId].style.top = (t - (window.innerHeight - canvasDisplayHeight) / 2) + 'px';
	dragObjectData[currentDragId][101] = yWindowToCanvas(t);
	try {
		if (typeof eval(taskTag + 'dragMove2') == 'function') {
			eval(taskTag + 'dragMove2(e);');
		}
	} catch (err) {}
}
function dragStop(e) {
	e.preventDefault();
	updateMouse(e);	
	removeListenerMove(window,dragMove);
	removeListenerEnd(window,dragStop);	
	e.target.style.cursor = openhand;
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
		dragObject[currentDragId].style.top = (objY - canvasMetrics.top) + 'px';
		dragObjectData[currentDragId][101] = yWindowToCanvas(objY);
	}
	try {
		if (typeof eval(taskTag + 'dragStop') == 'function') {
			eval(taskTag + 'dragStop(e);');
		}
	} catch (err) {}
}
function createHolderCanvas(left, top, width, height, visible) {
	var canvasInstance = document.createElement('canvas');
	canvasInstance.width = width;
	canvasInstance.height = height;
	canvasInstance.setAttribute('position', 'absolute');
	canvasInstance.setAttribute('z-index', '99999');
	canvasInstance.setAttribute('cursor', 'auto');
	canvasInstance.setAttribute('class', 'buttonClass');
	if (visible == true) {
		container.appendChild(canvasInstance);
	} else {
		if (canvasInstance.parentNode == container) {
			container.removeChild(canvasInstance)
		}
	}
	holderButton.push(canvasInstance);
	var canvasInstancectx = canvasInstance.getContext('2d');
	holderButtonctx.push(canvasInstancectx);
	var canvasInstanceData = [left, top, width, height, visible, ""];
	holderButtonData.push(canvasInstanceData);
}
function drawSmallTaskCompleteMessage() {
	createHolderCanvas(350, 200, 500, 110, false);
	holderButton[5].style.backgroundColor = "#6CC";
	holderButton[5].style.borderRadius = "5px";
	holderButton[5].style.border = "4px solid black"
		holderButton[5].style.cursor = "auto";
	holderButton[5].style.zIndex = 900000;
	holderButtonctx[5].font = "50px Hobo";
	holderButtonctx[5].fillStyle = "#000";
	holderButtonctx[5].textAlign = "center";
	holderButtonctx[5].textBaseline = "middle";
	holderButtonctx[5].fillText("Page Completed!", 290, 57);
	yellowStar.onload = function () {
		holderButtonctx[5].drawImage(yellowStar, 7, 7, 104, 98)
	};
	holderButtonctx[5].drawImage(yellowStar, 7, 7, 104, 98);
	createHolderCanvas(758, 205, 110, 26, false);
	holderButton[6].style.zIndex = 900000;
	holderButtonctx[6].font = "20px Arial";
	holderButtonctx[6].fillStyle = "#000";
	holderButtonctx[6].textAlign = "center";
	holderButtonctx[6].textBaseline = "middle";
	holderButtonctx[6].fillText("Dismiss", 55, 13);
	addListener(holderButton[6], dismissSmallTaskCompleteMessage)
	addListener(holderButton[5], dismissSmallTaskCompleteMessage)
}
function dismissSmallTaskCompleteMessage() {
	if (!un(holderButton[5]) && holderButton[5].parentNode == container) {
		container.removeChild(holderButton[5])
	}
	if (!un(holderButton[6]) && holderButton[6].parentNode == container) {
		container.removeChild(holderButton[6])
	}
	unfadePage();
}
function showObj(canvas, canvasData, hideAfter) {
	if (canvas) {
		if (canvas.canvas) {
			canvasData = canvas.data;
			canvas = canvas.canvas;
		}
		if (typeof canvasData == 'undefined' && typeof canvas.data == 'object') {
			canvasData = canvas.data;
		}
		var canvasTask;
		for (var ii = 0; ii < taskObject.length; ii++) {
			if (taskObject[ii].indexOf(canvas) > -1) {
				canvasTask = ii
			};
		}
		if (typeof mathsInput[taskId] !== 'undefined') {
			for (var i = 0; i < mathsInput[taskId].length; i++) {
				if (mathsInput[taskId][i].canvas == canvas) {
					if (taskId == canvasTask)
						container.appendChild(mathsInput[taskId][i].canvas);
					mathsInput[taskId][i].data[130] = true;
					mathsInput[taskId][i].data[104] = true;
					if (typeof mathsInput[taskId][i].cursorCanvas !== 'undefined') {
						if (taskId == canvasTask)
							container.appendChild(mathsInput[taskId][i].cursorCanvas);
						mathsInput[taskId][i].cursorData[130] = true;
						mathsInput[taskId][i].cursorData[104] = true;
					}
					if (typeof mathsInput[taskId][i].leftRightTextCanvas !== 'undefined') {
						if (taskId == canvasTask)
							container.appendChild(mathsInput[taskId][i].leftRightTextCanvas);
						mathsInput[taskId][i].leftRightTextCanvas.data[130] = true;
						mathsInput[taskId][i].leftRightTextCanvas.data[104] = true;
					}
					return;
				}
			}
		}
		if (taskNum == canvasTask) {
			container.appendChild(canvas)
		};
		canvasData[130] = true;
		canvasData[104] = true;
		if (hideAfter) {
			setTimeout(function () {
				hideObj(canvas, canvasData)
			}, hideAfter);
		}
	}
}
function hideObj(canvas, canvasData, showAfter) {
	if (canvas) {
		if (canvas.canvas) {
			canvasData = canvas.data;
			canvas = canvas.canvas;
		}
		if (typeof canvasData == 'undefined' && typeof canvas.data == 'object') {
			canvasData = canvas.data;
		}
		if (typeof mathsInput[taskId] !== 'undefined') {
			for (var i = 0; i < mathsInput[taskId].length; i++) {
				if (mathsInput[taskId][i].canvas == canvas) {
					if (mathsInput[taskId][i].canvas.parentNode == container)
						container.removeChild(mathsInput[taskId][i].canvas);
					mathsInput[taskId][i].data[130] = false;
					mathsInput[taskId][i].data[104] = false;
					if (typeof mathsInput[taskId][i].cursorCanvas !== 'undefined') {
						if (mathsInput[taskId][i].cursorCanvas.parentNode == container)
							container.removeChild(mathsInput[taskId][i].cursorCanvas);
						mathsInput[taskId][i].cursorData[130] = false;
						mathsInput[taskId][i].cursorData[104] = false;
					}
					if (typeof mathsInput[taskId][i].leftRightTextCanvas !== 'undefined') {
						if (mathsInput[taskId][i].leftRightTextCanvas.parentNode == container)
							container.removeChild(mathsInput[taskId][i].leftRightTextCanvas);
						mathsInput[taskId][i].leftRightTextCanvas.data[130] = false;
						mathsInput[taskId][i].leftRightTextCanvas.data[104] = false;
					}
					if (typeof mathsInput[taskId][i].tick !== 'undefined') {
						if (mathsInput[taskId][i].tick.parentNode == container)
							container.removeChild(mathsInput[taskId][i].tick);
						mathsInput[taskId][i].tick.data[130] = false;
						mathsInput[taskId][i].tick.data[104] = false;
					}
					if (typeof mathsInput[taskId][i].cross !== 'undefined') {
						if (mathsInput[taskId][i].cross.parentNode == container)
							container.removeChild(mathsInput[taskId][i].cross);
						mathsInput[taskId][i].cross.data[130] = false;
						mathsInput[taskId][i].cross.data[104] = false;
					}
					return;
				}
			}
		}
		if (canvas.parentNode == container) {
			container.removeChild(canvas)
		};
		canvasData[130] = false;
		canvasData[104] = false;
		if (showAfter) {
			setTimeout(function () {
				showObj(canvas, canvasData)
			}, showAfter);
		}
	}
}
function pointerEventsFix(canvas2, data2, opt_type) {
	if (data2[5] == true && dragObject.indexOf(canvas2) == -1) {
		dragObject.push(canvas2);
		data2[100] = data2[0];
		data2[101] = data2[1];
		for (i = 0; i < taskObject.length; i++) {
			if (taskObject[i].indexOf(canvas2) > -1) {
				data2[109] = i;
			}
		}
		data2[116] = false;
		data2[117] = true;
		dragObjectData.push(data2);
	}
	window.addEventListener('mousemove', function () {
		pointerEventsListen(canvas2, opt_type)
	}, false);
}
function pointerEventsListen(canvas2, opt_type) {
	if (hitTestMouseOver(canvas2) == true) {
		canvas2.style.pointerEvents = 'auto';
		canvas2.addEventListener('mousemove', updateMouse, false);
		canvas2.addEventListener('touchmove', updateMouse, false);
	} else {
		canvas2.style.pointerEvents = 'none';
		canvas2.removeEventListener('mousemove', updateMouse, false);
		canvas2.removeEventListener('touchmove', updateMouse, false);
	}
	if (opt_type && opt_type == 'drag') {
		if (hitTestMouseOver(canvas2) == true) {
			canvas2.addEventListener('mousedown', dragStart, false);
			canvas2.addEventListener('touchstart', dragStart, false);
		} else {
			canvas2.removeEventListener('mousedown', dragStart, false);
			canvas2.removeEventListener('touchstart', dragStart, false);
		}
	}
}
var touchListenerAdded = false;
function pointerEventsFixTouch(canvas2, data2, opt_type) {
	if (data2[5] == true && dragObject.indexOf(canvas2) == -1) {
		dragObject.push(canvas2);
		data2[100] = data2[0];
		data2[101] = data2[1];
		for (i = 0; i < taskObject.length; i++) {
			if (taskObject[i].indexOf(canvas2) > -1) {
				data2[109] = i;
			}
		}
		data2[116] = false;
		data2[117] = true;
		dragObjectData.push(data2);
	}
	if (touchListenerAdded == false) {
		if (typeof opt_type !== 'undefined' && opt_type == 'drag') {
			window.addEventListener('touchstart', pointerEventsListenTouch, false);
		} else {
			window.addEventListener('touchend', pointerEventsListenTouch, false);
		}
	}
	touchListenerAdded = true;
}
function pointerEventsListenTouch(e) {
	e.preventDefault();
	var x = e.touches[0].pageX;
	var y = e.touches[0].pageY;
	mouse.x = xWindowToCanvas(x);
	mouse.y = yWindowToCanvas(y);
	var obj1 = [];
	var maxZ = 0;
	for (var i = 0; i < taskObject[taskNum].length; i++) {
		if (taskObjectData[taskNum][i][4] == true && taskObjectData[taskNum][i][6] == true && hitTestMouseOver(taskObject[taskNum][i]) == true) {
			maxZ = Math.max(maxZ, taskObjectData[taskNum][i][7]);
			obj1.push(i);
		}
	}
	if (obj1.length == 0)
		return;
	for (i = obj1.length - 1; i >= 0; i--) {
		if (taskObjectData[taskNum][i][7] < maxZ) {
			obj1 = obj1.splice(0, -1);
		}
	}
	if (obj1.length == 0)
		return;
	obj1 = obj1.pop();
	if (dragObject.indexOf(taskObject[taskNum][obj1]) > -1)
		forceDragStart(taskObject[taskNum][obj1]);
	if (typeof taskObjectData[taskNum][obj1][43] !== 'undefined') {
		//console.log('Event call,', taskObjectData[taskNum][obj1][43], taskObject[taskNum][obj1]);
		eval(taskObjectData[taskNum][obj1][43] + "(taskObject[taskNum][obj1]);");
	}
}
function getCanvasesAtMousePos() {
	var canvasArray = [];
	var dataArray = [];
	var pointerArray = [];
	for (var i = 0; i < taskObject[taskNum].length; i++) {
		if (taskObject[taskNum][i].parentNode == container) {
			if (hitTestMouseOver(taskObject[taskNum][i]) == true) {
				canvasArray.push(taskObject[taskNum][i]);
				dataArray.push(taskObjectData[taskNum][i]);
			}
		}
	}
	return {
		canvasArray: canvasArray,
		dataArray: dataArray
	};
}
function forceDragStart(canvas) {
	if (dragObject.indexOf(canvas) == -1) {
		return
	};
	currentDragId = dragObject.indexOf(canvas);
	dragObject[currentDragId].style.zIndex = zIndexFront;
	zIndexFront++;
	var dragObjectBoundingRect = dragObject[currentDragId].getBoundingClientRect();
	dragOffset.x = xCanvasToWindow(mouse.x) - dragObjectBoundingRect.left;
	dragOffset.y = yCanvasToWindow(mouse.y) - dragObjectBoundingRect.top;
	if (dragObjectData[currentDragId][116] == true) {
		dragArea.xMin = canvasDisplayRect.left + ((dragObjectData[currentDragId][110] - dragObject[currentDragId].width / 2) / mainCanvasWidth) * canvasDisplayWidth;
		dragArea.xMax = canvasDisplayRect.left + ((dragObjectData[currentDragId][110] + dragObjectData[currentDragId][112] * dragObjectData[currentDragId][114] - dragObject[currentDragId].width / 2) / mainCanvasWidth) * canvasDisplayWidth;
		dragArea.yMin = ((dragObjectData[currentDragId][111] - dragObject[currentDragId].height / 2) / mainCanvasHeight) * canvasDisplayHeight;
		dragArea.yMax = ((dragObjectData[currentDragId][111] + dragObjectData[currentDragId][113] * dragObjectData[currentDragId][115] - dragObject[currentDragId].height / 2) / mainCanvasHeight) * canvasDisplayHeight;
	} else {
		dragArea.xMin = canvasDisplayRect.left + (15 / mainCanvasWidth) * canvasDisplayWidth;
		dragArea.xMax = canvasDisplayRect.right - (15 / mainCanvasWidth) * canvasDisplayWidth - (dragObjectBoundingRect.right - dragObjectBoundingRect.left);
		dragArea.yMin = canvasDisplayRect.top + (100 / mainCanvasHeight) * canvasDisplayHeight;
		dragArea.yMax = canvasDisplayRect.bottom - (15 / mainCanvasHeight) * canvasDisplayHeight - (dragObjectBoundingRect.bottom - dragObjectBoundingRect.top);
	}
	window.addEventListener('mousemove', dragMove, false);
	window.addEventListener('touchmove', dragMove, false);
	window.addEventListener('mouseup', dragStop, false);
	window.addEventListener('touchend', dragStop, false);
}
function createGridOfButtons(startingButNum, numRows, numColumns, startingX, startingY, butWidth, butHeight, gapX, gapY, draggable) {
	for (var n242j = 0; n242j < numRows; n242j++) {
		for (var n242i = 0; n242i < numColumns; n242i++) {
			createButton(startingButNum + n242j * numColumns + n242i, startingX + (butWidth - 3) * n242i + gapX * n242i, gapY * n242j + startingY + (butHeight - 3) * n242j, butWidth, butHeight, true, draggable, true, 2);
		}
	}
}
function removeTags(string) {
	for (var i = string.length - 1; i >= 0; i--) {
		if (string.slice(i).indexOf('>>') == 0) {
			for (var j = i - 1; j >= 0; j--) {
				if (string.slice(j).indexOf('<<') == 0) {
					string = string.slice(0, j) + string.slice(i + 2);
					i = j;
					break;
				}
			}
		}
	}
	return string;
}
function canvasPaste(toctx, fromctx, x, y) {
	toctx.clearRect(0, 0, toctx.canvas.data[102], toctx.canvas.data[103]);
	toctx.drawImage(fromctx.canvas, -x, -y);
}
function saveCanvasAsPNG(canvas, filename, l, t, w, h) {
	if (typeof filename == 'undefined')
		filename = 'download.png';
	if (filename.slice(-4).toLowerCase() !== '.png')
		filename += '.png';
	var imgURL = canvasToPNG(canvas, filename, l, t, w, h);
	var dlLink = document.createElement('a');
	dlLink.download = filename;
	dlLink.href = imgURL;
	dlLink.dataset.downloadurl = ["image/png", dlLink.download, dlLink.href].join(':');
	document.body.appendChild(dlLink);
	dlLink.click();
	document.body.removeChild(dlLink);
}
function printCanvasAsPNG(canvas, filename, l, t, w, h) {
	if (typeof filename == 'undefined')
		filename = 'print.png';
	if (filename.slice(-4).toLowerCase() !== '.png')
		filename += '.png';
	var imgURL = canvasToPNG(canvas, filename, l, t, w, h);
	var win = window.open();
	win.document.write('<head></head><body><img src="' + imgURL + '" style="width:100%"></body>');
	win.print();
}
function canvasToPNG(canvas, filename, l, t, w, h) {
	var width = mainCanvasWidth;
	var height = mainCanvasHeight;
	if (isElement(canvas)) {
		width = canvas.width;
		height = canvas.height;
	}
	var canvas2 = document.createElement('canvas');
	canvas2.width = width;
	canvas2.height = height;
	var ctx2 = canvas2.getContext('2d');
	if (isElement(canvas)) {
		ctx2.drawImage(canvas, 0, 0);
	} else if (typeof canvas == 'object') {
		for (var i = 0; i < canvas.length; i++) {
			ctx2.drawImage(canvas[i], canvas[i].data[100], canvas[i].data[101]);
		}
	}
	var left = l || 0;
	var top = t || 0;
	var w2 = w || width;
	var h2 = h || height;
	var canvas3 = document.createElement('canvas');
	canvas3.width = w2;
	canvas3.height = h2;
	var ctx3 = canvas3.getContext('2d');
	ctx3.drawImage(canvas2, -left, -top);
	var imgURL = canvas3.toDataURL("image/png");
	return imgURL;
}
function croppedCanvasToPNG(canvas, left, top, width, height, filename) {
	var can = document.createElement('canvas');
	can.width = width;
	can.height = height;
	var ctx = can.getContext('2d');
	ctx.drawImage(canvas, -left, -top);
	return canvasToPNG(can, filename);
}
function flattenCanvases(canvas1, canvas2, offsetLeft, offsetTop) {
	if (typeof offsetLeft !== 'number') {
		if (typeof canvas1.data == 'object' && typeof canvas2.data == 'object') {
			var offsetLeft = canvas2.data[100] - canvas1.data[100];
		} else {
			var offsetLeft = 0;
		}
	}
	if (typeof offsetTop !== 'number') {
		if (typeof canvas1.data == 'object' && typeof canvas2.data == 'object') {
			var offsetTop = canvas2.data[101] - canvas1.data[101];
		} else {
			var offsetTop = 0;
		}
	}
	var ctx = canvas1.getContext('2d');
	ctx.drawImage(canvas2, offsetLeft, offsetTop);
}
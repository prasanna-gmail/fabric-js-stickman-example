//js
var textEdit = {obj:null};

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

textEdit.draw = function() {
	if (!un(textEdit.obj) && !un(textEdit.obj._draw)) {
		textEdit.obj._draw();
		return;
	} else if (!un(textEdit.obj) && textEdit.obj.gridPath === true) {
		drawCanvasPaths();
	} else if (!un(textEdit.obj) && textEdit.obj._drawCanvasPaths === true) {
		drawCanvasPaths();
	} else if (!un(textEdit.obj) && !un(textEdit.obj.created)) {
		drawCanvasPaths();
	} else {
		drawSelectedPaths();
	}
	//for (var m = 0; m < textEdit.cursorMap.length; m++) console.log(m,textEdit.cursorMap[m].textPos);
}
textEdit.mapTextLocs = function(obj,textLoc,softBreaks,hardBreaks) {
	var loc = textLoc;
	var map = [];
	var count = 0;
	var breakAdjust = 0;
	var tagAdjust = 0;
	var startTags = true;
	var indices = [];
	//console.log(loc);
	for (var i = 0; i < loc.length; i++) {
		indices.push(i);
		mapTextLocs2(loc[i],i);
		indices.pop();
	}
	function mapTextLocs2(arr,index) {
		for (var j = 0; j < arr.length; j++) {
			indices.push(j);
			if (arr[j] instanceof Array) {
				mapTextLocs2(arr[j],j)
			} else if (typeof arr[j] == "object") {
				indices[indices.length-1] += (breakAdjust + tagAdjust);
				arr[j].textPos = clone(indices);
				
				arr[j].breakAdjust = breakAdjust;
				arr[j].tagAdjust = tagAdjust;
				
				delete arr[j].fontSize;
				delete arr[j].width;
				if (arr[j].markupTag == true) {
					if (startTags == false) tagAdjust--;
				} else {
					map.push(arr[j]);
					tagAdjust = 0;
					startTags = false;
				}
				count++;
				if (softBreaks.indexOf(count) > -1) breakAdjust -= 1;
				if (hardBreaks.indexOf(count) > -1) breakAdjust = 0;
			}
			indices.pop();
		}
	}
	return map;
}
textEdit.getMapOfAllChars = function() {
	if (un(textEdit.allMap)) {
		textEdit.allMap = mapArray(textEdit.textLoc,true);
	}
	return textEdit.allMap;
}
textEdit.getClosestTextPos = function(pos,lineNum,matchPos) {
	if (un(pos)) pos = draw.mouse;
	if (un(lineNum)) {
		for (var i = 0; i < textEdit.lineRects.length; i++) {
			var t = textEdit.lineRects[i][1];
			var b = textEdit.lineRects[i][1] + textEdit.lineRects[i][3];
			if ((i == 0 && pos[1] < b) || (i == textEdit.lineRects.length-1 && pos[1] > t) || (pos[1] >= t && pos[1] <= b)) {
				lineNum = i;
				break;
			}
		}
	}
	var obj = textEdit.obj;
	
	var map = textEdit.cursorMap;
	var closestPos;
	var closestDist;
	if (!un(matchPos)) var gp = matchPos.slice(0,-2);
	for (var m = 0; m < map.length; m++) {
		if (!un(lineNum) && lineNum !== map[m].lineNum) continue;
		if (!un(matchPos)) {
			if (matchPos.length !== map[m].textPos.length) continue; // must have same depth as matchPos
			if (!arraysEqual(gp,map[m].textPos.slice(0,-2))) continue; // and same grandparent
		}
		if (un(closestDist)) {
			closestDist = distancePointToLineSegment(pos,[map[m].left,map[m].top],[map[m].left,map[m].top+map[m].height]);
			closestPos = m;
		} else {
			var newDist = distancePointToLineSegment(pos,[map[m].left,map[m].top],[map[m].left,map[m].top+map[m].height]);
			if (newDist < closestDist) {
				closestDist = newDist;
				closestPos = m;
			}
		}
	}
	if (isNaN(closestPos) || typeof closestPos == "undefined" || closestPos == null) {
		closestPos = 0;
	}
	return closestPos;
}
textEdit.getStyleAtPos = function(pos,obj) {
	if (un(obj)) {
		var obj = textEdit.obj;
	}
	if (un(pos) && textEdit.selected == true) {
		pos = textEdit.cursorMap[arrayMin(textEdit.selectPos)].textPos;
	} else if (un(pos) && !un(textEdit.cursorPos) && !un(textEdit.cursorMap[textEdit.cursorPos])) {
		pos = textEdit.cursorMap[textEdit.cursorPos].textPos;
	}
	if (un(pos)) return;
	
	var tags = clone(defaultTags);

	for (var key in tags) {
		if (!un(obj[key])) tags[key] = clone(obj[key]);
	}
	if (!un(obj.vertAlign)) {
		tags.align[1] = obj.vertAlign == "top" ? -1 : obj.vertAlign == "middle" ? 0 : obj.vertAlign == "bottom" ? 1 : -1;
	}
	if (!un(obj.lineSpacingFactor)) tags.lineSpacingFactor = obj.lineSpacingFactor;
	if (!un(obj.spacingStyle)) tags.lineSpacingStyle = obj.spacingStyle;
	
		
	var indices = [];	
	var fin = false;
	var finBreak = false;
	
	function arrayHandler(arr) {
		indices.push(0);
		if (arr instanceof Array) {
			if (finBreak == true) {
				indices.pop();
				return;
			}
			arrayHandler(arr[i]);
		} else if (typeof arr == "string") {
			for (var c = 0; c < arr.length; c++) {
				indices[indices.length-1] = c;
				if (fin == false && textEdit.compareCursorPos(indices,pos) < 1) fin = true;
				var sub = arr.slice(c);
				if (fin == false) {
					if (sub.indexOf("<<") == 0) {
						var type = sub.slice(2,sub.indexOf(":"));
						var value = sub.slice(sub.indexOf(":")+1,sub.indexOf(">>"));
						setTagValue(type,value);
					}
				} else if (finBreak == false) {
					if (sub.indexOf("<<align:") == 0) {
						var type = "align";
						var value = sub.slice(8,sub.indexOf(">>"));
						setTagValue(type,value);
					}
					if (sub.indexOf(br) == 0) {
						finBreak = true;
						indices.pop();
						return;
					}
				}
			}
		}
		indices.pop();
	}
	
	function setTagValue(type,value) {
		if (type == "align") {
			tags.align[0] = value == "left" ? -1 : value == "center" ? 0 : value == "right" ? 1 : -1;
			return;
		}
		if (!isNaN(Number(value))) value = Number(value);
		if (value == "true") value = true;
		if (value == "false") value = false;
		tags[type] = value;
	}
	
	for (var i = 0; i < obj.text.length; i++) {
		indices.push(i);
		arrayHandler(obj.text[i]);
		indices.pop();
	}
	if (textEdit.selected == true) {
		pos1 = textEdit.cursorMap[arrayMin(textEdit.selectPos)].textPos;
		var txt = obj.text;
		for (var i = 0; i < pos1.length-1; i++) txt = txt[pos1[i]];
		txt = txt.slice(pos1.last());
		var split = splitTextByTags(txt);
		while (split.length > 0 && (split[0].indexOf("<<") == 0 || split[0].length == 0)) {
			if (split[0].indexOf("<<") == 0) {
				var type = split[0].slice(2,split[0].indexOf(":"));
				var value = split[0].slice(split[0].indexOf(":")+1,split[0].indexOf(">>"));
				setTagValue(type,value);
			}
			split.shift();
		}
	}
	//console.log('tags:',tags);
	return tags;	
}
textEdit.compareCursorPos = function(pos1,pos2) {
	var p1 = clone(pos1);
	var p2 = clone(pos2);
	// returns:
	// -1 if pos1 is larger
	//  0 if pos1 = pos2
	//  1 if pos2 is larger
	while (p1.length < p2.length) p1.push(0);
	while (p2.length < p1.length) p2.push(0);
	for (var i = 0; i < p1.length; ++i) {
        if (p1[i] > p2[i]) {
			return -1;
        } else if (p1[i] < p2[i]) {
			return 1;
        }
    }
	return 0;
}

textEdit.endInput = function(e) {
	if (un(textEdit.obj)) return;
	
	var obj = textEdit.obj;
	if (draw.mode !== 'edit' && !un(obj) && !un(obj._path)) {
		obj._path.selected = false;
	}
	if (textEdit.selecting == true) return;
	if (!un(e)) {
		if (e.target === draw.cursorCanvas) return;
		if (endInputExceptions.indexOf(e.target) > -1 || e.target.textMenu == true || e.target.isKeyboard == true) return;
		if (typeof key1 === 'object' && typeof pageIndex === 'number' && !un(key1[pageIndex]) && key1[pageIndex].indexOf(e.target) > -1) return;
		//if (!un(keyboard[pageIndex]) && keyboard[pageIndex] == e.target) return;
		//if (!un(keyboardButton1[pageIndex]) && keyboardButton1[pageIndex] == e.target) return;
		//if (!un(keyboardButton2[pageIndex]) && keyboardButton2[pageIndex] == e.target) return;
		updateMouse(e);
		if (mouseHitRect(textEdit.tightRect)) return;
	}
	
	//console.log('textend',textEdit.obj);

	if (typeof textEdit.obj.onInputEnd === 'function') {
		textEdit.obj.onInputEnd(textEdit.obj);
	}
	if (!un(this.blinkInterval)) clearCorrectingInterval(this.blinkInterval);
	textEdit.removeSelectTags();
	delete textEdit.obj.textEdit;
	if (un(textEdit.table)) draw.text2.extractStartTags(textEdit.obj);
	textEdit.draw();
	if (!un(textEdit.table)) {
		delete textEdit.table.textEdit;
		delete textEdit.table;
		delete textEdit.tableCell;
	}
	if (textEdit._type == 'textInput') {
		if (draw.mode == 'edit') {
			var obj = textEdit.obj;
			var currText = clone(obj.text);
			if (un(obj.ans)) obj.ans = [];
			if (un(obj.ans[obj.ansIndex])) obj.ans[obj.ansIndex] = {text:[''],marks:1};
			if (arraysEqual(removeTags(currText), [''])) {
				if (obj.ansIndex !== obj.ans.length) {
					obj.ans.splice(obj.ansIndex, 1);
					if (obj.ansIndex > 0) obj.ansIndex--;
					if (!un(obj.ans) && !un(obj.ans[obj.ansIndex])) obj.text = clone(obj.ans[obj.ansIndex].text)
				}
			} else {
				if (un(obj.ans)) obj.ans = [];
				if (un(obj.ansIndex)) obj.ansIndex = 0;
				if (un(obj.ans[obj.ansIndex])) obj.ans[obj.ansIndex] = {marks:1};
				obj.ans[obj.ansIndex].text = currText;
			}
		} else if (draw.mode == 'interact') {
			var obj = textEdit.obj;
			delete obj._path._interacting;
			obj._path.selected = false;
			draw.updateAllBorders();
			calcCursorPositions();
		}
	}
	if (draw.mode !== 'edit' && typeof textEdit.obj === 'object' && typeof textEdit.obj._taskQuestion === 'object' && typeof draw.taskQuestion.update === 'function') {
		draw.taskQuestion.update(textEdit.obj._taskQuestion);
	}
	if (!un(obj._path) && !un(obj.interact) && obj.interact.deleteIfBlank === true && textArrayCompress(obj.text) === '') {
		var index = draw.path.indexOf(obj._path);
		if (index > -1) draw.path.splice(index,1);
	}
	textEdit.obj = null;
	delete textEdit.selectPos;
	delete textEdit.selected;
	delete textEdit.cursorMap;
	delete textEdit.cursorPos;
	delete textEdit.tightRect;
	delete textEdit.textLoc;
	delete textEdit.softBreaks;
	delete textEdit.softBreakSpaces;
	delete textEdit.hardBreaks;
	delete textEdit.lineRects;
	delete textEdit.allMap;
	delete textEdit.path;
	delete textEdit.pathIndex;
	delete textEdit.table;
	delete textEdit.tableSelectedCells;
	delete textEdit._type;
	window.removeEventListener("keydown",textEdit.hardKeyInput,false);
	removeListenerStart(window,textEdit.endInput);
	window.removeEventListener("blur",textEdit.endInput,false);
	
	if (draw.mode === 'interact' && obj.deselectOnInputEnd !== false) deselectAllPaths();
	/*if (typeof taskApp === 'object') {
		var canvas = draw.drawCanvas[draw.drawCanvas.length-1];
		canvas.width = 1;
		canvas.height = 1;
		canvas.ctx.clearRect(0,0,1,1);
	}*/
	drawCanvasPaths();
	if (draw.mode === 'interact' && typeof teach !== 'undefined' && !un(teach.keyboard)) {
		teach.keyboard.active = false;
		teach.keyboard.draw();
		if (teach.keyboard.hardShow !== true) {
			teach.keyboard.hide();
		}
	}
	if (typeof taskApp === 'object') {
		taskApp.keyboard.active = false;
		taskApp.keyboard.update();
	}
	draw.cursorCanvas.ctx.clear();
	/*if (draw.keyboard.active == true) {
		//draw.keyboard.hide(true);
		hideKeyboard2(true);
	}*/
}

textEdit.tableSelectStart = function(e) {
	updateMouse(e);
	textEdit.endInput();
	var obj = draw.currCursor.obj;
	deselectAllPaths();
	draw.path[draw.currCursor.pathNum].selected = true;
	drawCanvasPaths();
	obj.textEdit = true;
	textEdit.selecting = true;
	textEdit.pathIndex = draw.currCursor.pathNum;
	textEdit.table = obj;
	textEdit.tableCell = draw.currCursor.cell;
	textEdit.obj = obj.cells[textEdit.tableCell[0]][textEdit.tableCell[1]];
	textEdit.draw();
	drawSelectCanvas();
	textEdit.selectPos = [textEdit.getClosestTextPos()];
	changeDrawMode("tableInputSelect");
	addListenerMove(window,textEdit.tableSelectMove);
	addListenerEnd(window,textEdit.tableSelectStop);	
}
textEdit.tableSelectMove = function(e) {
	updateMouse(e);
	var obj = textEdit.obj;
	var closestPos = textEdit.getClosestTextPos(undefined,undefined,textEdit.cursorMap[textEdit.selectPos[0]].textPos);
	if (textEdit.selectPos[1] !== closestPos) {
		textEdit.selectPos[1] = closestPos;
		textEdit.setSelectTags();	
		textEdit.selected = true;
	}
}
textEdit.tableSelectStop = function(e) {
	removeListenerMove(window,textEdit.tableSelectMove);
	removeListenerEnd(window,textEdit.tableSelectStop);
	var obj = textEdit.obj;

	window.addEventListener("keydown",textEdit.hardKeyInput,false);
	addListenerStart(window,textEdit.endInput);
	window.addEventListener("blur",textEdit.endInput,false);
	changeDrawMode("textEdit");	
	delete textEdit.selecting;
	
	var closestPos = textEdit.getClosestTextPos();
	if (textEdit.selectPos[0] == closestPos) {
		textEdit.cursorPos = textEdit.selectPos[0];
		delete textEdit.selectPos;
		delete textEdit.selected;
		textEdit.removeSelectTags();
		textEdit.draw();
		if (!un(textEdit.menu)) textEdit.menu.update();
	}
	//console.log(textEdit,textEdit.obj);
}
textEdit.tableStart = function(pathIndex,obj,cell,cursorPos) {
	textEdit.selecting = true;
	setTimeout(function() {delete textEdit.selecting},100);
	
	draw.path[pathIndex].selected = true;
	drawCanvasPaths();
	obj.textEdit = true;
	textEdit.pathIndex = pathIndex;
	textEdit.table = obj;
	textEdit.tableCell = cell;
	textEdit.obj = obj.cells[cell[0]][cell[1]];	
	textEdit.cursorPos = typeof cursorPos == 'number' ? cursorPos : 0;		
	
	window.addEventListener("keydown",textEdit.hardKeyInput,false);
	addListenerStart(window,textEdit.endInput);
	window.addEventListener("blur",textEdit.endInput,false);

	changeDrawMode("textEdit");	
	textEdit.draw();
	if (cursorPos instanceof Array) {
		textEdit.cursorPos = textEdit.getClosestTextPos(cursorPos);
	} else if (cursorPos = 'last') {
		textEdit.cursorPos = textEdit.cursorMap.length-1;
	}
	textEdit.blinkReset();
	if (!un(textEdit.menu)) textEdit.menu.update();
	drawCanvasPaths();
}

textEdit.selectStart = function(e) {
	updateMouse(e);
	textEdit.endInput();
	if (draw.mode === 'interact') {
		textEdit.start(draw.currCursor.pathNum,draw.currCursor.obj);
		return;
	}
	var obj = draw.currCursor.obj;
	if (obj.deselectOnInputStart !== false) deselectAllPaths();
	var path = draw.path[draw.currCursor.pathNum];
	path.selected = true;
	textEdit._type = ((!un(path.isInput) && path.isInput.type == 'text') || (!un(obj.interact) && obj.interact.type == 'text') || typeof taskApp === 'object') ? 'textInput' : '';
	//console.log(textEdit._type, !un(path.isInput) && path.isInput.type == 'text', !un(obj.interact) && obj.interact.type == 'text', typeof taskApp === 'object');
	obj.textEdit = true;
	drawCanvasPaths();
	textEdit.selecting = true;
	textEdit.obj = obj;
	textEdit.pathIndex = draw.currCursor.pathNum;
	textEdit.draw();
	drawSelectCanvas();
	textEdit.selectPos = [textEdit.getClosestTextPos()];
	changeDrawMode("textInputSelect");
	addListenerMove(window,textEdit.selectMove);
	addListenerEnd(window,textEdit.selectStop);
}
textEdit.selectMove = function(e) {
	updateMouse(e);
	var obj = textEdit.obj;
	var closestPos = textEdit.getClosestTextPos(undefined,undefined,textEdit.cursorMap[textEdit.selectPos[0]].textPos);
	if (textEdit.selectPos[1] !== closestPos) {
		textEdit.selectPos[1] = closestPos;
		textEdit.setSelectTags();	
		textEdit.selected = true;
	}
}
textEdit.selectStop = function(e) {
	removeListenerMove(window,textEdit.selectMove);
	removeListenerEnd(window,textEdit.selectStop);
	var obj = textEdit.obj;
	window.addEventListener("keydown",textEdit.hardKeyInput,false);
	addListenerStart(window,textEdit.endInput);
	window.addEventListener("blur",textEdit.endInput,false);
	changeDrawMode("textEdit");	
	delete textEdit.selecting;
	
	var closestPos = textEdit.getClosestTextPos();
	if (textEdit.selectPos[0] == closestPos) {
		textEdit.cursorPos = textEdit.selectPos[0];
		delete textEdit.selectPos;
		delete textEdit.selected;
		textEdit.removeSelectTags();
		textEdit.draw();
		if (!un(textEdit.menu)) textEdit.menu.update();
	}
	if (draw.mode === 'edit' && !un(draw.contextMenu)) draw.contextMenu.update();		
	//console.log(textEdit.obj);
}
textEdit.start = function(pathIndex,obj,cursorPos) {
	var path = draw.path[pathIndex];
	if (draw.mode === 'edit' && typeof path === 'object') path.selected = true;
	//console.log(path,path.selected);
	textEdit.selecting = true;
	setTimeout(function() {delete textEdit.selecting},100);
	textEdit.pathIndex = pathIndex;
	textEdit.obj = obj;
	textEdit.cursorColor = (draw.mode === 'interact' && typeof obj.color === 'string') ? obj.color : '#000';
	//console.log('text obj',obj);
	obj.textEdit = true;
	if (un(cursorPos)) {
		textEdit.draw();
		cursorPos = textEdit.getClosestTextPos();
	}
	textEdit._type = ((!un(path) && !un(path.isInput) && path.isInput.type == 'text') || (!un(obj) && !un(obj.interact) && obj.interact.type == 'text') || typeof taskApp === 'object') ? 'textInput' : '';
	textEdit.cursorPos = cursorPos;
	window.addEventListener("keydown",textEdit.hardKeyInput,false);
	addListenerStart(window,textEdit.endInput);
	window.addEventListener("blur",textEdit.endInput,false);

	changeDrawMode("textEdit");	
	textEdit.draw();
	if (textEdit.cursorPos === 'last') textEdit.cursorPos = textEdit.cursorMap instanceof Array ? textEdit.cursorMap.length-1 : 0;
	textEdit.blinkReset();
	if (!un(textEdit.menu)) textEdit.menu.update();
	/*if (draw.keyboard.active == true && draw.mode == 'interact') {
		draw.keyboard.show(true);
	}*/
	if (draw.mode === 'interact' && typeof teach !== 'undefined' && !un(teach.keyboard)) {
		teach.keyboard.font = !un(textEdit.obj) && !un(textEdit.obj.font) ? textEdit.obj.font : 'Arial';
		teach.keyboard.active = true;
		teach.keyboard.draw();
		if (teach.keyboard.hardClosed !== true) {
			teach.keyboard.show();
			teach.keyboard.moveAwayFromTextInput();
		}
	}
	if (typeof taskApp === 'object') {
		taskApp.keyboard.active = true;
		taskApp.keyboard.font = !un(obj.font) ? obj.font : 'Arial';
		taskApp.keyboard.update();
	}
	if (draw.mode === 'edit' && !un(draw.contextMenu)) draw.contextMenu.update();	
	if (draw.mode !== 'edit' && typeof textEdit.obj === 'object' && typeof textEdit.obj._taskQuestion === 'object' && typeof draw.taskQuestion.update === 'function') {
		draw.taskQuestion.update(textEdit.obj._taskQuestion);
	}
	/*if (draw.mode !== 'edit') {
		for (var p = 0; p < draw.path.length; p++) {
			var path2 = draw.path[p];
			if (path2.selected === true) console.log('path selected',path2);
			if (path2 !== path) path2.selected = false;
		}
	}*/
	drawCanvasPaths();
	//console.log(textEdit.cursorPos,textEdit.cursorMap);
}

textEdit.blink = function() {
	if (un(textEdit.obj)) return;
	var obj = textEdit.obj;
	textEdit.blinkState = !textEdit.blinkState;
	textEdit.blinkDraw();
}
textEdit.blinkDraw = function() {
	var ctx = draw.cursorCanvas.ctx;
	ctx.clear();
	if (textEdit.blinkState == true && textEdit.selected !== true && !un(textEdit.cursorPos) && (un(draw.drag) || draw.drag.dragging === false || draw.drag.dragObjs instanceof Array === false || draw.drag.dragObjs.indexOf(textEdit.obj) === -1)) {
		var pos = textEdit.cursorMap[textEdit.cursorPos];
		if (un(pos)) return;
		ctx.save();
		ctx.strokeStyle = textEdit.cursorColor || "#000";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(pos.left,pos.top);
		ctx.lineTo(pos.left,pos.top+pos.height);
		ctx.stroke();
		ctx.restore();
	}	
}
textEdit.blinkReset = function() {
	if (!un(this.blinkInterval)) clearCorrectingInterval(this.blinkInterval);
	this.blinkState = false;
	if (un(textEdit.obj) || textEdit.selected == true) return;
	this.blink();
	this.blinkInterval = setCorrectingInterval(this.blink,600);
}

textEdit.getGrandparent = function(pos) {
	var grandparent = textEdit.obj.text;
	for (var p = 0; p < pos.length-2; p++) grandparent = grandparent[pos[p]];
	return grandparent;
}
textEdit.getParent = function(pos) {
	var grandparent = textEdit.getGrandparent(pos);
	return grandparent[pos[pos.length-2]];
}
textEdit.putParent = function(pos,parent) {
	var grandparent = textEdit.getGrandparent(pos);
	grandparent[pos[pos.length-2]] = parent;
}

textEdit.setSelectTags = function() {
	var obj = textEdit.obj;
	textEdit.removeSelectTags();
	textEdit.draw();
	textEdit.insertSelectTags();
}
textEdit.removeSelectTags = function() {
	if (un(textEdit.obj)) return;
	textEdit.obj.text = arrayHandler(textEdit.obj.text);
	
	function arrayHandler(array) {
		for (var l = array.length - 1; l >= 0; l--) {
			if (typeof array[l] == "string") {
				array[l] = stringHandler(array[l]);
			} else {	
				array[l] = arrayHandler(array[l]);
			}
		}
		return array;
	}
	function stringHandler(string) {
		for (var j = string.length - 1; j >= 0; j--) {
			var slice = string.slice(j);
			if (slice.indexOf("<<selected:") == 0) {
				string = string.slice(0,j)+string.slice(j+slice.indexOf(">>")+2);
			}
		}
		return string;
	}	
}
textEdit.insertSelectTags = function() {
	var obj = textEdit.obj;
	var selectPos = clone(textEdit.selectPos);
	selectPos.sort(function(a,b){return a-b});
	if (un(selectPos[0]) || un(selectPos[1]) || selectPos[0] == selectPos[1]) return;
	var posSelStart = textEdit.cursorMap[selectPos[0]].textPos;
	var posSelEnd = textEdit.cursorMap[selectPos[1]].textPos;
	textEdit.insertTag("selected",false,posSelEnd,0);
	textEdit.insertTag("selected",true,posSelStart,0);
	textEdit.draw();
}
textEdit.deleteSelected = function() {
	var obj = textEdit.obj;
	var sel = false;
	obj.text = arrayHandler(obj.text);	
	textEdit.cursorPos = Math.min(textEdit.selectPos[0],textEdit.selectPos[1]);
	delete textEdit.selected;
	delete textEdit.selectPos;
	
	function arrayHandler(array) {
		for (var l = 0; l < array.length; l++) {
			if (typeof array[l] == "string") {
				if (l > 0 || array.length == 1 || ["frac","power","pow","subs","subscript","sin","cos","tan","ln","log","logBase","sin-1","cos-1","tan-1","abs","exp","root","sqrt","sigma1","sigma2","int1","int2","recurring","bar","hat","vectorArrow","colVector2d","colVector3d","mixedNum","lim"].indexOf(array[l]) == -1) {
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
		var savedTags = "";
		for (var j = 0; j < string.length; j++) {
			var slice = string.slice(j);
			if (slice.indexOf("<<selected:true>>") == 0) {
				delPos[0] = j;
				sel = true;
			}
			if (slice.indexOf("<<selected:false>>") == 0) {
				delPos[1] = j + 18;
				sel = false;
 			}
			if (sel == true && (slice.indexOf("<<font") == 0 || slice.indexOf("<<bold") == 0 || slice.indexOf("<<italic") == 0 || slice.indexOf("<<color") == 0 || slice.indexOf("<<back") == 0)) {
				savedTags += slice.slice(0,slice.indexOf(">>")+2);
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

textEdit.delete = function() {
	if (textEdit.selected == true) {
		textEdit.cursorPos = Math.min(textEdit.selectPos[0],textEdit.selectPos[1]);
		textEdit.deleteSelected();
		textEdit.draw();
		return;
	}
	if (textEdit.cursorPos == textEdit.cursorMap.length-1) return;
		
	var obj = textEdit.obj;
	var cursorPos = textEdit.cursorMap[textEdit.cursorPos].textPos;

	var breakingSpace = false;
	if (cursorPos.length === 2 && textEdit.cursorPos > 2 && !un(textEdit.cursorMap[textEdit.cursorPos-1]) && !un(textEdit.cursorMap[textEdit.cursorPos]) && un(textEdit.cursorMap[textEdit.cursorPos-1].char) && textEdit.cursorMap[textEdit.cursorPos].char === " ") {
		breakingSpace = true;
		console.log('breakingSpace');
	}
	
	// get parent stack
	var txt = obj.text;
	var pos = [];
	for (var i = 0; i < cursorPos.length; i++) {
		pos.unshift({text:txt,pos:cursorPos[i]});
		txt = txt[cursorPos[i]];
	}
	
	var child = pos[0].text;
	var childPos = pos[0].pos;
	
	if (child == "" || childPos == child.length) return;

	var tagCheck = false;
	while (tagCheck == false && child.slice(childPos).indexOf('<<') == 0 && child.slice(childPos).indexOf('<<<') !== 0) {
		tagCheck = true;
		for (var i = childPos+2; i < child.length; i++) {
			if (child.slice(i).indexOf('>>') == 0) {
				childPos = i+2;
				tagCheck = false;
				break;
			}
		}
	}
	
	child = child.slice(0,childPos) + child.slice(childPos+1);
	var parent = pos[1].text;
	var parentPos = pos[1].pos;
	parent[parentPos] = child;

	if (breakingSpace === true) textEdit.cursorPos = Math.max(0,textEdit.cursorPos-1);
	textEdit.draw();	
}
textEdit.backspace = function() {
	if (textEdit.selected == true) {
		textEdit.cursorPos = Math.min(textEdit.selectPos[0],textEdit.selectPos[1]);
		textEdit.deleteSelected();
		textEdit.draw();
		return;
	}
	if (textEdit.cursorPos == 0) return;

	var obj = textEdit.obj;
	var cursorPos = textEdit.cursorMap[textEdit.cursorPos].textPos;
	
	var breakingSpace = false;
	if (cursorPos.length === 2 && textEdit.cursorPos > 2 && !un(textEdit.cursorMap[textEdit.cursorPos-1]) && !un(textEdit.cursorMap[textEdit.cursorPos-2]) && un(textEdit.cursorMap[textEdit.cursorPos-2].char) && textEdit.cursorMap[textEdit.cursorPos-1].char === " ") {
		breakingSpace = true;
	}
	
	// get parent stack
	var txt = obj.text;
	var pos = [];
	for (var i = 0; i < cursorPos.length; i++) {
		pos.unshift({text:txt,pos:cursorPos[i]});
		txt = txt[cursorPos[i]];
	}
	
	var child = pos[0].text;
	var childPos = pos[0].pos;
	var diff = 0;
	
	if (child !== "") {
		if (childPos !== 0) {
			child = child.slice(0, childPos-1) + child.slice(childPos);
			var parent = pos[1].text;
			var parentPos = pos[1].pos;
			parent[parentPos] = child;
		}
		diff = -1;
		if (breakingSpace === true) diff = -2;
	} else if (pos.length == 2) {
		diff = -1;
	} else {
		var parent = pos[1].text;
		var parentPos = pos[1].pos;
		var gParent = pos[2].text;
		var gParentPos = pos[2].pos;
		var ggParent = pos[3].text;
		var ggParentPos = pos[3].pos;
		
		if (parent.length == 1 || arraysEqual(parent,[""]) == true) { // ie. empty string is only sub-element
			var elemsOneParam = ["sqrt", "pow", "power", "subs", "sigma1", "int1", "vectorArrow", "bar", "hat", "recurring"];
			var elemsTwoParams = ["root", "frac", "colVector2d", "lim"];
			var elemsThreeParams = ["sigma2", "int2", "colVector3d"];
			
			var subCount = elemsOneParam.includes(gParent[0]) ? 1 : elemsTwoParams.includes(gParent[0]) ? 2 : elemsThreeParams.includes(gParent[0]) ? 3 : 0;
			
			var deleteElement = true;
			if (gParentPos == 1) {
				if (subCount == 2 && arraysEqual(gParent[2],[""]) == false) deleteElement = false;
				if (subCount == 3 && (arraysEqual(gParent[2],[""]) == false || arraysEqual(gParent[3],[""]) == false)) deleteElement = false;
			} else if (gParentPos == 2 && typeof gParent[1] == "boolean") {
				
			} else {
				deleteElement = false;
			}
			if (deleteElement == true) ggParent.splice(ggParentPos,1);	
			diff = -1;			
		}
	}
	textEdit.cursorPos = Math.max(0,textEdit.cursorPos+diff);
	textEdit.draw();
}
textEdit.enter = function() {
	if (textEdit._type === 'textInput' && (un(textEdit.obj) || un(textEdit.obj.interact) || textEdit.obj.interact.multiLine !== true)) return;
	textEdit.insert(br,undefined,1);
	textEdit.draw();
}
textEdit.cut = function() {
	if (textEdit._type == 'textInput') return;
	textEdit.copy();
	textEdit.delete();
}
textEdit.copy = function() {
	if (textEdit._type == 'textInput') return;
	var clip = [];
	var selected = false;
	var txt = clone(textEdit.obj.text);
	arrayHandler(txt);
	if (clip.length == 1 && typeof clip[0] == 'string') {
		clip = clip[0];
	} else if (clip.length == 0) {
		clip = '';
	}
	textEdit.clip = clip;
	console.log('clipboard:',textEdit.clip);	

	function arrayHandler(array) {
		for (var l = 0; l < array.length; l++) {
			if (typeof array[l] == "string") {
				if (l > 0 || array.length == 1 || ["frac","power","pow","subs","subscript","sin","cos","tan","ln","log","logBase","sin-1","cos-1","tan-1","abs","exp","root","sqrt","sigma1","sigma2","int1","int2","recurring","bar","hat","vectorArrow","colVector2d","colVector3d","mixedNum","lim"].indexOf(array[l]) == -1) {
					array[l] = stringHandler(array[l]);
				}
			} else {
				if (selected == true) {
					clip.push(array[l]);
				} else {
					arrayHandler(array[l]);
				}
			}
		}
		return array;
	}
	function stringHandler(string) {
		var start = string.indexOf("<<selected:true>>");
		var end = string.indexOf("<<selected:false>>");
		if (start > -1) start += 17;
		
		if (selected == false && start == -1) {
			return;
		} else {
			if (selected == true) start = 0;
			if (end == -1) {
				end = string.length;
				selected = true;
			} else {
				selected = false;
			}
			clip.push(string.slice(start,end));
		}
	}	
}
textEdit.paste = function() {
	if (textEdit._type == 'textInput') return;
	if (shiftOn === true) {
		if (typeof mode === 'string' && mode === 'edit') {
			navigator.clipboard.readText().then(function(clipText) {
				if (clipText.length > 250) return;
				textEdit.insert(clipText);
				textEdit.draw();
			});
		}
	} else if (typeof textEdit.clip == 'string') {
		textEdit.insert(textEdit.clip);
		textEdit.draw();
	} else if (typeof textEdit.clip == 'object') {
		for (var i = textEdit.clip.length; i >= 0; i--) {
			textEdit.insert(textEdit.clip[i],undefined,0);
		}
		textEdit.draw();		
	}
}

textEdit.getCharBeforeCursorPos = function() {
	if (un(textEdit.cursorMap) || un(textEdit.cursorPos) || un (textEdit.cursorMap[textEdit.cursorPos])) return '';
	var pos = textEdit.cursorMap[textEdit.cursorPos].textPos;
	var textObj = clone(textEdit.obj.text);
	for (var i = 0; i < pos.length-1; i++) {
		textObj = textObj[pos[i]];
	}
	return textObj.charAt(pos.last()-1);
}
textEdit.insert = function(ins,pos,cursorPosDiff) {
	//console.log('insert',ins,pos);
	if (un(ins) || ins === "" || ins === "\\") return;
	if (draw.mode !== 'edit' && draw.task.isFileATask() === true) {
		if (typeof ins === "string" && ins.length === 1) {
			if (/[0-9a-zA-Z]/.test(ins) === false && '£%:()+-×÷=<>≤≥., '.indexOf(ins) === -1 && ins !== br) return;
		}
		if (typeof textEdit.obj === 'object' && !un(textEdit.obj.interact)) {
			if (typeof textEdit.obj.interact.allowedChars === 'string') {
				if (typeof ins !== 'string' || textEdit.obj.interact.allowedChars.indexOf(ins) === -1) return;
			}
			if (typeof textEdit.obj.interact.maxChars === 'number') {
				var txt = textArrayCompress(removeTags(textEdit.obj.text));
				if (txt.length >= textEdit.obj.interact.maxChars) return;
			}
		}
	}
	if (un(pos)) {
		if (!un(textEdit.cursorPos)) {
			var pos = textEdit.cursorMap[textEdit.cursorPos].textPos;
		} else {
			return;
		}
	}
	if (un(cursorPosDiff)) {
		cursorPosDiff = typeof ins === "object" ? 1 : ins.length;
	}
	//console.log('-----');	
	//console.log(ins,pos);
	var breakingSpace = false;
	if (pos.length === 2 && textEdit.cursorPos > 1 && !un(textEdit.cursorMap[textEdit.cursorPos]) && !un(textEdit.cursorMap[textEdit.cursorPos-1]) && textEdit.cursorMap[textEdit.cursorPos].char === " " && un(textEdit.cursorMap[textEdit.cursorPos-1].char)) {
		breakingSpace = true;
		//console.log('breakingSpace');
	}
	
	if (typeof ins == "object") {
		if (textEdit._type == 'textInput' && pos.length > 6) return;	
		ins = clone(ins);
	
		var textObj = clone(textEdit.obj.text);
		var gparent = textObj;
		for (var i = 0; i < pos.length - 2; i++) {
			gparent = gparent[pos[i]];
			if (textEdit._type == 'textInput' && i === pos.length-4 && ins[0] !== 'frac' && gparent[0] !== 'frac' && (gparent[0] === ins[0] || (!un(gparent[pos[i+1]]) && gparent[pos[i+1]][0] === ''))) return; // prevent nested elements
		}
		var parent = gparent[pos[pos.length-2]];	
		var parentPos = pos[pos.length-2];
		var stringPos = pos[pos.length-1];
		
		if (breakingSpace === true) stringPos++;
				
		var before = parent.slice(0,stringPos);
		var after = parent.slice(stringPos);
				
		if (!un(textEdit.preText) && textEdit.preText !== null && textEdit.preText !== "") before += textEdit.preText;
		if (!un(textEdit.postText) && textEdit.postText !== null && textEdit.postText !== "") after = textEdit.postText + after;
		gparent.splice(parentPos,1,before,ins,after);
		
		if (textEdit._type == 'textInput' && textEdit.obj.type === 'text2' && (un(textEdit.obj.interact) || textEdit.obj.interact.fitToText !== true)) {
			if (pos.length > 6) return;
			var obj2 = clone(textEdit.obj);
				
			var parent2 = obj2.text;
			for (var i = 0; i < pos.length-3; i++) parent2 = parent2[pos[i]];	
			if (parent2 instanceof Array && parent2.length > 1 && parent2[0] === ins[0] && parent === "") {
				return;
			}
			
			obj2.measureOnly = true;
			obj2.text = gparent;
			obj2.ctx = draw.hiddenCanvas.ctx;
			var measure = text(obj2);
			if (measure.tightRect[2] < textEdit.obj.rect[2]-10 && measure.tightRect[3] < textEdit.obj.rect[3]-2) {
				textEdit.obj.text = textObj;
				textEdit.cursorPos += cursorPosDiff;
				if (breakingSpace === true) textEdit.cursorPos++;
			}
		} else {
			textEdit.obj.text = textObj;
			textEdit.cursorPos += cursorPosDiff;
			if (breakingSpace === true) textEdit.cursorPos++;
		}
				
		textEdit.preText = "";
		textEdit.postText = "";
	} else if (typeof ins == "string") {
		if (!un(textEdit.preText)) ins = textEdit.preText + ins;
		if (!un(textEdit.postText)) ins = ins + textEdit.postText;
		
		//console.log('textEdit._type',textEdit._type);
		//console.log('text:',textEdit.obj.text);
		//console.log('pos:',pos);
		var textObj = clone(textEdit.obj.text);
		var parent = textObj;
		for (var i = 0; i < pos.length-2; i++) parent = parent[pos[i]];
		//console.log('parent:',parent);
		var text2 = parent[pos[pos.length-2]];
		//console.log('text2(child):',text2);
		var slicePos = pos[pos.length - 1];
		
		
		if (breakingSpace === true) slicePos++;
		//console.log('slicePos:',slicePos);
		
		var before = text2.slice(0, slicePos);
		var after = text2.slice(slicePos);
		
		if (ins.length === 1 && "1234567890".indexOf(ins) > -1 && textObj.length === 1 && after === "" && before.length > 1 && ["/","\\"].indexOf(before.slice(-1)) > -1 && !isNaN(Number(before.slice(0,-1)))) { // convert "3/4" or "3\4" to fraction
			
			var num = before.slice(0,-1);
			textEdit.obj.text = ["",["frac",[num],[ins]],""];
			textEdit.cursorPos = num.length+ins.length+2;
			
		} else {
			if (textEdit._type == 'textInput') {
				if (ins === '<' && (before.slice(-1) === '<' || after.slice(0,1) === '<')) return;
				if (ins === '>' && ((before.slice(-1) === '>' && before.slice(-2) !== '>>') || after.slice(0,1) === '>')) return;
			}
			
			parent[pos[pos.length-2]] = before + ins + after;
			
			if (textEdit._type == 'textInput' && (un(textEdit.obj.interact) || textEdit.obj.interact.fitToText !== true)) {
				if (typeof textEdit.obj === 'object' && !un(textEdit.obj.interact) && typeof textEdit.obj.interact.maxChars === 'number') {
					textEdit.obj.text = textObj;
					textEdit.cursorPos += cursorPosDiff;
					if (breakingSpace === true) textEdit.cursorPos++;
				} else {
					var obj2 = clone(textEdit.obj);
					obj2.measureOnly = true;
					obj2.text = textObj;
					obj2.ctx = draw.hiddenCanvas.ctx;
					var measure = text(obj2);
					var minHorizPadding = measure.tightRect[2] < 100 ? 2 : 20;
					if (measure.tightRect[2] < textEdit.obj.rect[2]-minHorizPadding && measure.tightRect[3] < textEdit.obj.rect[3]-2) {
						textEdit.obj.text = textObj;
						textEdit.cursorPos += cursorPosDiff;
						if (breakingSpace === true) textEdit.cursorPos++;
					}
				}
			} else {
				textEdit.obj.text = textObj;
				textEdit.cursorPos += cursorPosDiff;
				if (breakingSpace === true) textEdit.cursorPos++;
			}
			
		}	
		textEdit.preText = "";
		textEdit.postText = "";

	}
}
textEdit.setPreTag = function(type,value) {
	var obj = this.obj;
	var insertion = "<<"+type+":"+value+">>";
	var pos = pos = textEdit.cursorMap[textEdit.cursorPos].textPos;
	
	if (un(textEdit.preText)) textEdit.preText = "";
	if (un(textEdit.postText)) textEdit.postText = "";
	textEdit.preText += insertion;
	if (textEdit.cursorPos < textEdit.cursorMap.length-1) { // if cursor is not at the end of the text
		var prevTag = ""; // find previous tag of this type
		var allMap = textEdit.getMapOfAllChars();
		for (var pos2 = 0; pos2 < allMap.length; pos2++) {
			if (textEdit.compareCursorPos(allMap[pos2],pos) < 1) break;
			var map = allMap[pos2];
			var objText = clone(textEdit.obj.text);
			for (var i = 0; i < map.length - 1; i++) objText = objText[map[i]];
			objText = objText.slice(map[map.length-1]);
			if (objText.indexOf("<<"+type+":") == 0) {
				prevTag = objText.slice(0,objText.indexOf(">>")+2);
			}
		}		
		if (prevTag == "") {
			prevTag = "<<"+type+":"+defaultTags[type]+">>";
		}
		textEdit.postText += prevTag;
	}
}
textEdit.insertTag = function(type,value,pos) {
	var insertion = "<<"+type+":"+value+">>";
	textEdit.insert(insertion,pos,0);
}
textEdit.insertAlignTag = function(value) {
	var obj = this.obj;
	var insertion = "<<align:"+value+">>";
	
	var allMap = textEdit.getMapOfAllChars();
	function getAllMapIndex(allMap,pos) {
		for (var a = 0; a < allMap.length; a++) if (arraysEqual(allMap[a],pos)) return a;
		return -1;
	}
	
	if (textEdit.selected == true) {
		var index1 = getAllMapIndex(allMap,textEdit.cursorMap[arrayMin(textEdit.selectPos)].textPos);
		var index2 = getAllMapIndex(allMap,textEdit.cursorMap[arrayMax(textEdit.selectPos)].textPos);
		for (var i = index2; i > index1; i--) {
			var pos = allMap[i];
			var str = textEdit.getParent(pos);
			if (str.charAt(pos.last()) == br) {
				var before = str.slice(0,pos.last()+1);
				var after = str.slice(pos.last()+1);
				if (after.indexOf(insertion) !== 0) {
					if (after.indexOf("<<align:") == 0) after = after.slice(after.indexOf(">>")+2);
					str = before + insertion + after;
					textEdit.putParent(pos,str);
				}
			}
		}		
	} else {
		var index1 = getAllMapIndex(allMap,textEdit.cursorMap[textEdit.cursorPos].textPos);
	}
	
	for (var i = index1; i >= 0; i--) {
		var pos = allMap[i];
		var str = textEdit.getParent(pos);
		if (str.charAt(pos.last()) == br || i == 0) {
			var before = i == 0 ? "" : str.slice(0,pos.last()+1);
			var after = i == 0 ? str : str.slice(pos.last()+1);
			if (after.indexOf(insertion) !== 0) {
				if (after.indexOf("<<align:") == 0) after = after.slice(after.indexOf(">>")+2);
				str = before + insertion + after;
				textEdit.putParent(pos,str);
			}
			break;
		}
	}
	textEdit.draw();
}

textEdit.setTagForSelected = function(type,value) {
	var selectPos = clone(textEdit.selectPos);
	selectPos.sort(function(a,b){return a-b});
	var pos0 = textEdit.cursorMap[selectPos[0]].textPos;
	var pos1 = textEdit.cursorMap[selectPos[1]].textPos;
	
	
	if (selectPos[1] < textEdit.cursorMap.length-1) { // only add post tag if it is not at the end of text
		var post = textEdit.getStyleAtPos(pos1);
		var pos2 = pos1;
		var str = textEdit.obj.text;
		for (var p = 0; p < pos2.length-1; p++) str = str[pos2[p]];
		if (str.slice(pos2.last()).indexOf("<<selected:false>>") == 0) pos2[pos2.length-1] += 18;
		textEdit.insertTag(type,post[type],pos2); 
	}
	
	// remove any tags of this type in selected text
	var allMap = textEdit.getMapOfAllChars();
	var sel = false;
	for (var p = allMap.length - 1; p >= 0; p--) {
		var map = allMap[p];
		if (sel == true) {
			var gParent = textEdit.obj.text;
			for (var m = 0; m < map.length - 2; m++) gParent = gParent[map[m]];
			var parent = gParent[map[map.length-2]];
			if (parent.slice(0,map.last()).indexOf("<<selected:false>>") > -1) continue;
			var str = parent.slice(map.last());
			if (str.indexOf("<<"+type+":") == 0) {
				gParent[map[map.length-2]] = parent.slice(0,map.last())+parent.slice(map.last()+str.indexOf(">>")+2);
			}
		}
		if (arraysEqual(map,pos1)) sel = true;
		if (arraysEqual(map,pos0)) break;
	}		
	
	textEdit.insertTag(type,value,pos0);
}

textEdit.tableMoveCursorBetweenCells = function(dir) {
	var pos = textEdit.cursorMap[textEdit.cursorPos];
	var newCell = textEdit.tableGetAdjacentCell(textEdit.table,textEdit.tableCell,dir);
	if (arraysEqual(textEdit.tableCell,newCell)) return;
	var pathIndex = textEdit.pathIndex;
	var table = textEdit.table;
	textEdit.endInput();
	textEdit.tableStart(pathIndex,table,newCell,[pos.left,pos.top]);
	
}
textEdit.tableGetAdjacentCell = function(table,cell,dir) {
	var r = cell[0];
	var c = cell[1];
	var cells = table.cells;
	switch(dir) {	
		case 'left':
			if (c > 0) {
				c--;
			} else if (r > 0) {
				r--;
				c = cells[r].length-1;
			}
			break;
		case 'right':
			if (c < cells[r].length-1) {
				c++;
			} else if (r < cells.length-1) {
				r++;
				c = 0;
			}
			break;
		case 'up':
			if (r > 0) r--;
			break;
		case 'down':
			if (r < cells.length-1) r++;
			break;
	}
	return [r,c];
}

textEdit.incSelectPos = function(inc) {
	if (un(inc)) inc = 1;
	var matchPos = textEdit.cursorMap[textEdit.selectPos[0]].textPos;
	var gp = matchPos.slice(0,-2);
	var i = textEdit.selectPos[1] + inc;
	while (i >= 0 && i < textEdit.cursorMap.length) {
		var tryPos = textEdit.cursorMap[i].textPos;
		if (matchPos.length == tryPos.length && arraysEqual(gp,tryPos.slice(0,-2))) return i;
		i += inc;
	}
	return textEdit.selectPos[1];
}
textEdit.arrowLeft = function(e) {
	if (e.getModifierState("Shift") == true && textEdit.cursorPos > 0 && draw.mode !== 'interact') {
		if (textEdit.selected == true) {
			textEdit.selectPos[1] = textEdit.incSelectPos(-1);
			if (textEdit.selectPos[0] == textEdit.selectPos[1]) {
				textEdit.cursorPos = textEdit.selectPos[0];
				textEdit.removeSelectTags();
				delete textEdit.selectPos;
				delete textEdit.selected;
			} else {
				textEdit.setSelectTags();
			}
		} else {
			textEdit.selected = true;
			textEdit.selectPos = [textEdit.cursorPos,textEdit.cursorPos];
			textEdit.selectPos[1] = textEdit.incSelectPos(-1);
			textEdit.setSelectTags();
		}
		textEdit.draw();
	} else if (textEdit.selected == true) {
		textEdit.removeSelectTags();
		textEdit.cursorPos = Math.min(textEdit.selectPos[0],textEdit.selectPos[1]);
		delete textEdit.selectPos;
		delete textEdit.selected;
		textEdit.draw();
	} else if (textEdit.cursorPos > 0) {
		textEdit.cursorPos--;
		textEdit.blinkReset();
		if (!un(textEdit.menu)) textEdit.menu.update();
	} else if (!un(textEdit.table)) {
		textEdit.tableMoveCursorBetweenCells('left');
	}
}
textEdit.arrowRight = function(e) {
	if (e.getModifierState("Shift") == true && textEdit.cursorPos < textEdit.cursorMap.length-1 && draw.mode !== 'interact') {
		if (textEdit.selected == true) {
			textEdit.selectPos[1] = textEdit.incSelectPos(1);
			if (textEdit.selectPos[0] == textEdit.selectPos[1]) {
				textEdit.cursorPos = textEdit.selectPos[0];
				textEdit.removeSelectTags();
				delete textEdit.selectPos;
				delete textEdit.selected;
				if (!un(textEdit.menu)) textEdit.menu.update();
			} else {
				textEdit.setSelectTags();
			}
		} else {
			textEdit.selected = true;
			textEdit.selectPos = [textEdit.cursorPos,textEdit.cursorPos];
			textEdit.selectPos[1] = textEdit.incSelectPos(1);
			textEdit.setSelectTags();
		}
		textEdit.draw();
	} else if (textEdit.selected == true) {
		textEdit.removeSelectTags();
		textEdit.cursorPos = Math.max(textEdit.selectPos[0],textEdit.selectPos[1]);
		delete textEdit.selectPos;
		delete textEdit.selected;
		textEdit.draw();
	} else if (textEdit.cursorPos < textEdit.cursorMap.length-1) {
		textEdit.cursorPos++;
		textEdit.blinkReset();
		if (!un(textEdit.menu)) textEdit.menu.update();
	} else if (!un(textEdit.table)) {
		textEdit.tableMoveCursorBetweenCells('right');
	}
}
textEdit.arrowUp = function(e) {
	var pos = textEdit.cursorMap[textEdit.cursorPos];
	if (e.getModifierState("Shift") == true && draw.mode !== 'interact') {
		if (un(textEdit.arrowVertMove)) {
			textEdit.arrowVertMove = {
				startMap:pos,
				startIndex:textEdit.cursorPos,
				startPos:[pos.left,pos.top],
				startLine:pos.lineNum,
				diff:0,
				max:textEdit.cursorMap.last().lineNum
			};
		}
		var move = textEdit.arrowVertMove;
		if (move.startLine+move.diff > 0) {
			move.diff--;
			if (textEdit.selected !== true) textEdit.selectPos = [textEdit.cursorPos,textEdit.cursorPos];
			textEdit.selected = true;
			textEdit.selectPos[1] = textEdit.getClosestTextPos(move.startPos,move.startLine+move.diff);
			textEdit.blinkReset();
			textEdit.setSelectTags();
			if (!un(textEdit.menu)) textEdit.menu.update();
		}
		if (textEdit.selectPos[0] == textEdit.selectPos[1]) {
			textEdit.removeSelectTags();
			textEdit.cursorPos = Math.max(textEdit.selectPos[0],textEdit.selectPos[1]);
			delete textEdit.selectPos;
			delete textEdit.selected;
		}		
		textEdit.draw();
	} else if (textEdit.selected == true) {
		textEdit.removeSelectTags();
		textEdit.cursorPos = Math.min(textEdit.selectPos[0],textEdit.selectPos[1]);
		delete textEdit.selectPos;
		delete textEdit.selected;
		textEdit.draw();
	} else if (!un(textEdit.table) && pos.lineNum === 0) {		
		textEdit.tableMoveCursorBetweenCells('up');
	} else if (textEdit.cursorPos > 0) {
		if (un(textEdit.arrowVertMove)) {
			textEdit.arrowVertMove = {
				startMap:pos,
				startIndex:textEdit.cursorPos,
				startPos:[pos.left,pos.top],
				startLine:pos.lineNum,
				diff:0,
				max:textEdit.cursorMap.last().lineNum
			};
		}
		var move = textEdit.arrowVertMove;			
		if (move.startLine+move.diff > 0) {
			move.diff--;
			textEdit.cursorPos = textEdit.getClosestTextPos(move.startPos,move.startLine+move.diff);
			textEdit.blinkReset();
			if (!un(textEdit.menu)) textEdit.menu.update();
		}
	}
}
textEdit.arrowDown = function(e) {
	var pos = textEdit.cursorMap[textEdit.cursorPos];
	if (e.getModifierState("Shift") == true && draw.mode !== 'interact') {
		if (un(textEdit.arrowVertMove)) {
			textEdit.arrowVertMove = {
				startMap:pos,
				startIndex:textEdit.cursorPos,
				startPos:[pos.left,pos.top],
				startLine:pos.lineNum,
				diff:0,
				max:textEdit.cursorMap.last().lineNum
			};
		}
		var move = textEdit.arrowVertMove;
		if (move.startLine+move.diff < move.max) {
			move.diff++;
			if (textEdit.selected !== true) textEdit.selectPos = [textEdit.cursorPos,textEdit.cursorPos];
			textEdit.selected = true;
			textEdit.selectPos[1] = textEdit.getClosestTextPos(move.startPos,move.startLine+move.diff);
			textEdit.blinkReset();
			textEdit.setSelectTags();
			if (!un(textEdit.menu)) textEdit.menu.update();
		}
		if (textEdit.selectPos[0] == textEdit.selectPos[1]) {
			textEdit.removeSelectTags();
			textEdit.cursorPos = Math.max(textEdit.selectPos[0],textEdit.selectPos[1]);
			delete textEdit.selectPos;
			delete textEdit.selected;
		}
		textEdit.draw();
	} else if (textEdit.selected == true) {
		textEdit.removeSelectTags();
		textEdit.cursorPos = Math.max(textEdit.selectPos[0],textEdit.selectPos[1]);
		delete textEdit.selectPos;
		delete textEdit.selected;
		textEdit.draw();
	} else if (!un(textEdit.table) && pos.lineNum === textEdit.cursorMap.last().lineNum) {		
		textEdit.tableMoveCursorBetweenCells('down');
	} else if (textEdit.cursorPos > 0) {
		if (un(textEdit.arrowVertMove)) {
			textEdit.arrowVertMove = {
				startMap:pos,
				startIndex:textEdit.cursorPos,
				startPos:[pos.left,pos.top],
				startLine:pos.lineNum,
				diff:0,
				max:textEdit.cursorMap.last().lineNum
			};
		}
		var move = textEdit.arrowVertMove;	
		if (move.startLine+move.diff < move.max) {
			move.diff++;
			textEdit.cursorPos = textEdit.getClosestTextPos(move.startPos,move.startLine+move.diff);
			textEdit.blinkReset();
			if (!un(textEdit.menu)) textEdit.menu.update();
		}
	}
}
textEdit.home = function(e) {
	if (e.getModifierState("Shift") == true) {
		if (textEdit.selected !== true) {
			textEdit.selected = true;
			textEdit.selectPos = [textEdit.cursorPos,textEdit.cursorPos];
		}
		var lineNum = textEdit.cursorMap[textEdit.selectPos[1]].lineNum;
		for (var p = textEdit.selectPos[1]-1; p >= 0; p--) {
			if (textEdit.cursorMap[p].lineNum == lineNum) {
				textEdit.selectPos[1] = p;
			} else {
				break;
			}
		}
		if (textEdit.selectPos[0] == textEdit.selectPos[1]) {
			textEdit.removeSelectTags();
			textEdit.cursorPos = Math.min(textEdit.selectPos[0],textEdit.selectPos[1]);
			delete textEdit.selectPos;
			delete textEdit.selected;
			textEdit.draw();
		} else {
			textEdit.setSelectTags();
		}
		if (!un(textEdit.menu)) textEdit.menu.update();
	} else {
		if (textEdit.selected == true) {
			textEdit.removeSelectTags();
			textEdit.cursorPos = Math.min(textEdit.selectPos[0],textEdit.selectPos[1]);
			delete textEdit.selectPos;
			delete textEdit.selected;
			textEdit.draw();			
		}
		var lineNum = textEdit.cursorMap[textEdit.cursorPos].lineNum;
		var startPos = textEdit.cursorPos;
		for (var p = textEdit.cursorPos-1; p >= 0; p--) {
			if (textEdit.cursorMap[p].lineNum == lineNum) {
				textEdit.cursorPos = p;
			} else {
				break;
			}
		}
		if (textEdit.cursorPos == startPos) return;
		textEdit.blinkReset();
		if (!un(textEdit.menu)) textEdit.menu.update();
	}
}
textEdit.end = function(e) {
	if (e.getModifierState("Shift") == true) {
		if (textEdit.selected !== true) {
			textEdit.selected = true;
			textEdit.selectPos = [textEdit.cursorPos,textEdit.cursorPos];
		}
		var lineNum = textEdit.cursorMap[textEdit.selectPos[1]].lineNum;
		for (var p = textEdit.selectPos[1]+1; p < textEdit.cursorMap.length; p++) {
			if (textEdit.cursorMap[p].lineNum == lineNum) {
				textEdit.selectPos[1] = p;
			} else {
				break;
			}
		}
		if (textEdit.selectPos[0] == textEdit.selectPos[1]) {
			textEdit.removeSelectTags();
			textEdit.cursorPos = Math.min(textEdit.selectPos[0],textEdit.selectPos[1]);
			delete textEdit.selectPos;
			delete textEdit.selected;
			textEdit.draw();
		} else {
			textEdit.setSelectTags();
		}
		if (!un(textEdit.menu)) textEdit.menu.update();
	} else {
		if (textEdit.selected == true) {
			textEdit.removeSelectTags();
			textEdit.cursorPos = Math.min(textEdit.selectPos[0],textEdit.selectPos[1]);
			delete textEdit.selectPos;
			delete textEdit.selected;
			textEdit.draw();			
		}	
		var lineNum = textEdit.cursorMap[textEdit.cursorPos].lineNum;
		var startPos = textEdit.cursorPos;
		for (var p = textEdit.cursorPos+1; p < textEdit.cursorMap.length; p++) {
			if (textEdit.cursorMap[p].lineNum == lineNum) {
				textEdit.cursorPos = p;
			} else {
				break;
			}
		}
		if (textEdit.cursorPos == startPos) return;
		textEdit.blinkReset();
		if (!un(textEdit.menu)) textEdit.menu.update();
	}	
}
textEdit.pageUp = function() { // if selected?
	if (textEdit.selected == true) {
		
	} else {
		if (textEdit.cursorMap[textEdit.cursorPos].lineNum == 0) return;
		if (un(textEdit.arrowVertMove)) {
			var pos = textEdit.cursorMap[textEdit.cursorPos];
			textEdit.arrowVertMove = {
				startMap:pos,
				startIndex:textEdit.cursorPos,
				startPos:[pos.left,pos.top],
				startLine:pos.lineNum,
				diff:0,
				max:textEdit.cursorMap.last().lineNum
			};
		}
		var move = textEdit.arrowVertMove;			
		move.diff = -move.startLine;
		textEdit.cursorPos = textEdit.getClosestTextPos(move.startPos,0);
		textEdit.blinkReset();
		if (!un(textEdit.menu)) textEdit.menu.update();
	}
}
textEdit.pageDown = function() { // if selected?
	if (textEdit.selected == true) {
		
	} else {
		if (textEdit.cursorMap[textEdit.cursorPos].lineNum == textEdit.cursorMap.last().lineNum) return;
		if (un(textEdit.arrowVertMove)) {
			var pos = textEdit.cursorMap[textEdit.cursorPos];
			textEdit.arrowVertMove = {
				startMap:pos,
				startIndex:textEdit.cursorPos,
				startPos:[pos.left,pos.top],
				startLine:pos.lineNum,
				diff:0,
				max:textEdit.cursorMap.last().lineNum
			};
		}
		var move = textEdit.arrowVertMove;			
		move.diff = textEdit.cursorMap.last().lineNum - move.startLine;
		textEdit.cursorPos = textEdit.getClosestTextPos(move.startPos,textEdit.cursorMap.last().lineNum);
		textEdit.blinkReset();
		if (!un(textEdit.menu)) textEdit.menu.update();
	}	
}
textEdit.tab = function(e) { // if selected?
	if (draw.mode === 'interact') {
		
		return;
	}
	var ins = e.getModifierState('Shift') ? tab+tab+tab+tab+tab : tab;
	textEdit.insert(ins);
	textEdit.draw();
}

textEdit.keyboardMap = [
	"", // [0]
	"", // [1]
	"", // [2]
	"CANCEL", // [3]
	"", // [4]
	"", // [5]
	"HELP", // [6]
	"", // [7]
	"Backspace", // [8]
	"Tab", // [9]
	"", // [10]
	"", // [11]
	"CLEAR", // [12]
	"Enter", // [13]
	"ENTER_SPECIAL", // [14]
	"", // [15]
	"Shift", // [16]
	"Control", // [17]
	"Alt", // [18]
	"PAUSE", // [19]
	"CAPS_LOCK", // [20]
	"KANA", // [21]
	"EISU", // [22]
	"JUNJA", // [23]
	"FINAL", // [24]
	"HANJA", // [25]
	"", // [26]
	"Escape", // [27]
	"CONVERT", // [28]
	"NONCONVERT", // [29]
	"ACCEPT", // [30]
	"MODECHANGE", // [31]
	" ", // [32]
	"PageUp", // [33]
	"PageDown", // [34]
	"End", // [35]
	"Home", // [36]
	"ArrowLeft", // [37]
	"ArrowUp", // [38]
	"ArrowRight", // [39]
	"ArrowDown", // [40]
	"SELECT", // [41]
	"PRINT", // [42]
	"+", // [43]
	"PRINTSCREEN", // [44]
	"INSERT", // [45]
	"Delete", // [46]
	"", // [47]
	"0", // [48]
	"1", // [49]
	"2", // [50]
	"3", // [51]
	"4", // [52]
	"5", // [53]
	"6", // [54]
	"7", // [55]
	"8", // [56]
	"9", // [57]
	":", // [58]
	";", // [59]
	"<", // [60]
	"=", // [61]
	">", // [62]
	"?", // [63]
	"@", // [64]
	"A", // [65]
	"B", // [66]
	"C", // [67]
	"D", // [68]
	"E", // [69]
	"F", // [70]
	"G", // [71]
	"H", // [72]
	"I", // [73]
	"J", // [74]
	"K", // [75]
	"L", // [76]
	"M", // [77]
	"N", // [78]
	"O", // [79]
	"P", // [80]
	"Q", // [81]
	"R", // [82]
	"S", // [83]
	"T", // [84]
	"U", // [85]
	"V", // [86]
	"W", // [87]
	"X", // [88]
	"Y", // [89]
	"Z", // [90]
	"[", // [91]
	"\\", // [92]
	"]", // [93]
	"", // [94]
	"_", // [95]
	"0", // [96]
	"1", // [97]
	"2", // [98]
	"3", // [99]
	"4", // [100]
	"5", // [101]
	"6", // [102]
	"7", // [103]
	"8", // [104]
	"9", // [105]
	"*", // [106]
	"+", // [107]
	"_", // [108]
	"-", // [109]
	".", // [110]
	"/", // [111]
	"F1", // [112]
	"F2", // [113]
	"F3", // [114]
	"F4", // [115]
	"F5", // [116]
	"F6", // [117]
	"F7", // [118]
	"F8", // [119]
	"F9", // [120]
	"F10", // [121]
	"F11", // [122]
	"{", // [123]
	"|", // [124]
	"}", // [125]
	"~", // [126]
	"F16", // [127]
	"F17", // [128]
	"F18", // [129]
	"F19", // [130]
	"F20", // [131]
	"F21", // [132]
	"F22", // [133]
	"F23", // [134]
	"F24", // [135]
	"", // [136]
	"", // [137]
	"", // [138]
	"", // [139]
	"", // [140]
	"", // [141]
	"", // [142]
	"", // [143]
	"NUM_LOCK", // [144]
	"SCROLL_LOCK", // [145]
	"WIN_OEM_FJ_JISHO", // [146]
	"WIN_OEM_FJ_MASSHOU", // [147]
	"WIN_OEM_FJ_TOUROKU", // [148]
	"WIN_OEM_FJ_LOYA", // [149]
	"WIN_OEM_FJ_ROYA", // [150]
	"", // [151]
	"", // [152]
	"", // [153]
	"", // [154]
	"", // [155]
	"", // [156]
	"", // [157]
	"", // [158]
	"", // [159]
	"CIRCUMFLEX", // [160]
	"!", // [161]
	"\"", // [162]
	"£", // [163]
	"$", // [164]
	"%", // [165]
	"^", // [166]
	"&", // [167]
	"*", // [168]
	"(", // [169]
	")", // [170]
	"+", // [171]
	"PIPE", // [172]
	"HYPHEN_MINUS", // [173]
	"{", // [174]
	"}", // [175]
	"~", // [176]
	"", // [177]
	"", // [178]
	"", // [179]
	"", // [180]
	"VOLUME_MUTE", // [181]
	"VOLUME_DOWN", // [182]
	"VOLUME_UP", // [183]
	"", // [184]
	"", // [185]
	";", // [186]
	"=", // [187]
	",", // [188]
	"-", // [189]
	".", // [190]
	"/", // [191]
	"'", // [192]
	"", // [193]
	"", // [194]
	"", // [195]
	"", // [196]
	"", // [197]
	"", // [198]
	"", // [199]
	"", // [200]
	"", // [201]
	"", // [202]
	"", // [203]
	"", // [204]
	"", // [205]
	"", // [206]
	"", // [207]
	"", // [208]
	"", // [209]
	"", // [210]
	"", // [211]
	"", // [212]
	"", // [213]
	"", // [214]
	"", // [215]
	"", // [216]
	"", // [217]
	"", // [218]
	"(", // [219]
	"\\", // [220]
	")", // [221]
	"#", // [222]
	"`", // [223]
	"META", // [224]
	"ALTGR", // [225]
	"", // [226]
	"WIN_ICO_HELP", // [227]
	"WIN_ICO_00", // [228]
	"", // [229]
	"WIN_ICO_CLEAR", // [230]
	"", // [231]
	"", // [232]
	"WIN_OEM_RESET", // [233]
	"WIN_OEM_JUMP", // [234]
	"WIN_OEM_PA1", // [235]
	"WIN_OEM_PA2", // [236]
	"WIN_OEM_PA3", // [237]
	"WIN_OEM_WSCTRL", // [238]
	"WIN_OEM_CUSEL", // [239]
	"WIN_OEM_ATTN", // [240]
	"WIN_OEM_FINISH", // [241]
	"WIN_OEM_COPY", // [242]
	"WIN_OEM_AUTO", // [243]
	"WIN_OEM_ENLW", // [244]
	"WIN_OEM_BACKTAB", // [245]
	"ATTN", // [246]
	"CRSEL", // [247]
	"EXSEL", // [248]
	"EREOF", // [249]
	"PLAY", // [250]
	"ZOOM", // [251]
	"", // [252]
	"PA1", // [253]
	"WIN_OEM_CLEAR", // [254]
	"" // [255]
];
textEdit.getCharFromKeyEvent = function(e) {
	if (!un(e.key)) {
		return e.key;
	} else {
		var keyCode = e.keyCode || e.which;
		var caps = e.getModifierState('Shift') || e.getModifierState('CapsLock');
		var charMap = [[42,215,215], [48,48,170], [49,49,161], [50,50,162], [51,51,163], [52,52,164], [53,53,165], [54,54,166], [55,55,167], [56,56,168], [57,57,169], [96,48,48], [97,49,49], [98,50,50], [99,51,51], [100,52,52], [101,53,53], [102,54,54], [103,55,55], [104,56,56], [105,57,57], [106,106,215], [107,43,43], [109,189,189], [110,190,190], [111,191,191], [186,59,58], [187,187,43], [188,188,60], [189,189,95], [190,190,62], [191,1,63], [192,192,64], [219,91,123], [220,92,124], [221,93,125], [222,222,126]];		
		for (var c = 0; c < charMap.length; c++) {
			if (charMap[c][0] == keyCode) {
				keyCode = caps ? charMap[c][2] : charMap[c][1];
				break;
			}
		}
		
		var key = textEdit.keyboardMap[keyCode];
		if (!caps && keyCode >= 65 && keyCode <= 90)  key = key.toLowerCase(); 
		return key;
	}
}
textEdit.hardKeyInput = function(e) { // tab? PageUp? PageDown?
	//console.log('hardKeyInput');
	e.preventDefault();
	var obj = textEdit.obj;
	var key = textEdit.getCharFromKeyEvent(e);
	
 	if (e.getModifierState("Control")) {
		if (["f","F","r","R","p","P"].includes(key)) {
			if (textEdit.selected == true) textEdit.deleteSelected();
			if (key == "f" || key == "F") var ins = ["frac",[""],[""]];
			if (key == "r" || key == "R") var ins = ["sqrt",[""]];
			if (key == "p" || key == "P") var ins = ["pow",false,[""]];
			textEdit.insert(ins,undefined,1);
			textEdit.draw();
		}
		if (draw.mode === 'edit') {
			if (key == 'b' || key == 'B') textEdit.menu.applyValue('bold');
			if (key == 'i' || key == 'I') textEdit.menu.applyValue('italic');
			if (key == 'q' || key == 'Q') textEdit.menu.applyValue('font');
			if (key == 'x' || key == 'X') textEdit.cut();
			if (key == 'c' || key == 'C') textEdit.copy();
			if (key == 'v' || key == 'V') textEdit.paste();
			if (key == 'd' || key == 'D') {
				textEdit.endInput();
				clonePaths();
			}
		}
		if (key == "*" || key == "/") {
			textEdit.insert(key,undefined,1);
			textEdit.draw();
		}
		if (key === '2' || key === '3') {
			textEdit.insert(["pow",false,[key]],undefined,3);
			textEdit.draw();
		}
		return;
	}
	if (e.getModifierState("Alt")) return;
	if (["ArrowUp","ArrowDown","Shift"].includes(key) == false) delete textEdit.arrowVertMove;
	switch (key) {
		case "ArrowLeft" :
			if (typeof taskApp === 'object' && typeof taskApp.keyboard === 'object' && typeof taskApp.keyboard.leftArrowPress === 'function') return;
			textEdit.arrowLeft(e);
			break;
		case "ArrowUp" :
			textEdit.arrowUp(e);
			break;
		case "ArrowRight" :
			if (typeof taskApp === 'object' && typeof taskApp.keyboard === 'object' && typeof taskApp.keyboard.rightArrowPress === 'function') return;
			textEdit.arrowRight(e);	
			break;
		case "ArrowDown" :
			textEdit.arrowDown(e);
			break;
		case "Backspace" :
			textEdit.backspace();
			break;
		case "Delete" :
			textEdit.delete();
			break;
		case "Tab" :
			textEdit.tab(e);
			break;
		case "Home" :
			textEdit.home(e);
			break;
		case "End" :
			textEdit.end(e);
			break;
		case "PageUp" :
			textEdit.pageUp(e);
			break;
		case "PageDown" :
			textEdit.pageDown(e);
			break;
		case "Enter" :
			textEdit.enter(e);
			break;
		case "Escape" :
			textEdit.endInput();
			break;
		default :
			if (key.length > 1) return;
			if (textEdit.selected == true) {
				textEdit.deleteSelected();
				textEdit.draw();
			}
			var ins = key == "^" ? ["pow",false,[""]] : key;
			var ins = key == "*" && e.getModifierState('Shift') == true ? times : ins;
			var ins = key == "/" && e.getModifierState('Shift') == false ? divide : ins;
			var ins = key == "*" ? times : key == "/" ? divide : ins;
			textEdit.insert(ins,undefined,1);
			textEdit.draw();
			break;
	}
	textEdit.preText = "";
	textEdit.postText = "";
	if (draw.mode !== 'edit' && typeof textEdit.obj === 'object' && typeof textEdit.obj._taskQuestion === 'object' && typeof draw.taskQuestion.update === 'function') {
		draw.taskQuestion.update(textEdit.obj._taskQuestion);
	}
}
textEdit.softKeyInput = function(key) {
	var obj = textEdit.obj;
	switch (key) {
		case "leftArrow":
			if (textEdit.cursorPos > 0) {
				textEdit.cursorPos--;
				textEdit.blinkReset();
			}
			break;
		case "rightArrow":
			if (textEdit.cursorPos < textEdit.cursorMap.length-1) {
				textEdit.cursorPos++;
				textEdit.blinkReset();
			}
			break;
		case "delete":
			textEdit.backspace();
			break;
		case "enter":
			textEdit.enter();
			break;
		case "sqrt":
			textEdit.insert(["sqrt",[""]],undefined,1);
			textEdit.draw();
			break;
		case "root":
			textEdit.insert(["root",[""],[""]],undefined,1);
			textEdit.draw();
			break;
		case "frac":
			textEdit.insert(["frac",[""],[""]],undefined,1);
			textEdit.draw();
			break;
		case "pow":
		case "power":
			textEdit.insert(["pow",false,[""]],undefined,1);
			textEdit.draw();
			break;
		case "subs":
			textEdit.insert(["subs",false,[""]],undefined,1);
			textEdit.draw();
			break;
		case "rec":
		case "recurring":
			textEdit.insert(["recurring",[""]],undefined,1);
			textEdit.draw();
			break;
		case "hat":
			textEdit.insert(["hat",[""]],undefined,1);
			textEdit.draw();
			break;
		case "vectorArrow":
			textEdit.insert(["vectorArrow",[""],[""]],undefined,1);
			textEdit.draw();
			break;
		case "colVector2d":
			textEdit.insert(["colVector2d",[""],[""]],undefined,1);
			textEdit.draw();
			break;
		case "colVector3d":
			textEdit.insert(["colVector3d",[""],[""],[""]],undefined,1);
			textEdit.draw();
			break;
		case "ln":
			textEdit.insert(["ln",[""]],undefined,1);
			textEdit.draw();
			break;
		case "log":
			textEdit.insert(["log",[""]],undefined,1);
			textEdit.draw();
			break;
		case "e^x":
			textEdit.insert('e',undefined,1);
			textEdit.draw();
			textEdit.insert(["pow",false,[""]],undefined,1);
			textEdit.draw();
			break;
		default:
			if (key.length > 1) return;
			if (textEdit.selected == true) {
				textEdit.deleteSelected();
				textEdit.draw();
			}
			textEdit.insert(key,undefined,1);
			textEdit.draw();
			break;
	}
	if (draw.mode !== 'edit' && typeof textEdit.obj === 'object' && typeof textEdit.obj._taskQuestion === 'object' && typeof draw.taskQuestion.update === 'function') {
		draw.taskQuestion.update(textEdit.obj._taskQuestion);
		drawCanvasPaths();
	}
}

textEdit.createMenu = function(menu) {
	if (un(menu)) menu = {};
	textEdit.menu = menu;
	if (un(menu.pos)) menu.pos = [800,20];
	if (un(menu.zIndex)) menu.zIndex = 100000;
	if (un(menu.gridSize)) menu.gridSize = 40;
	if (un(menu.gridSize)) menu.backgroundColor = "#FFC";
	if (un(menu.buttons)) {
		menu.buttons = [
			[{type:"font",width:5},{type:"color"},{type:"bold"},{type:"italic"}],
			[{type:"align"},{type:"fontSizeMinus"},{type:"fontSize"},{type:"fontSizePlus"},{type:"lineSpacing",width:2},{type:"element"},{type:"box"}]
		]
	}
	menu.gridRows = [];
	menu.width = 0;
	menu.height = 0;
	var x = 0;
	var y = 0;
	menu.buttons2 = [];
	for (var r = 0; r < menu.buttons.length; r++) {
		menu.height += menu.gridSize;
		menu.gridRows[r] = [0];
		x = 0;
		var w2 = 0;
		for (var c = 0; c < menu.buttons[r].length; c++) {
			var w = !un(menu.buttons[r][c].width) ? menu.buttons[r][c].width*menu.gridSize : menu.gridSize;
			w2 += w;
			menu.gridRows[r].push(w2);
			menu.buttons[r][c].rect = [x,y,w,menu.gridSize];
			menu.buttons2.push(menu.buttons[r][c]);
			x += w;
		}
		menu.width = Math.max(menu.width,w2);
		y += menu.gridSize;
	}
	if (un(menu.fonts)) menu.fonts = [{font:"Arial",displaySize:24},{font:"algebra",displaySize:22},{font:"Hobo",displaySize:24},{font:"Georgia",displaySize:24},{font:"segoePrint",displaySize:20},{font:"smileymonster",displaySize:16}];
	if (un(menu.fontSizes)) menu.fontSizes = [10,15,20,24,26,28,30,32,34,36,38,40,42,46,50,60,70,80];
	if (un(menu.colors)) menu.colors = ["#000","#FFF","#F00","#393","#00F","#F0F",'#90F','#F90','#FF0','#F66','#66F','#666']
	if (un(menu.elements)) {
		menu.elements = [
			[
				{char:["pow",false,[""]],name:"power",top:5,display:["x",["power",false,[""]]]},
				{char:["subs",false,[""]],name:"subs",top:5,display:["x",["subs",false,[""]]]},
				{char:["frac",[""],[""]],name:"frac",top:-1},
				{char:["sqrt",[""]],name:"sqrt",top:5},
				{char:["root",[""],[""]],name:"root",top:7},
				{char:["hat",[""]],name:"hat",top:5},
				{char:["recurring",[""]],name:"recurring",top:5},
				{char:["vectorArrow",[""]],name:"vectorArrow",top:5},
				{char:["colVector2d",[""],[""]],name:"colVector2d",top:5}
			],[
				{char:String.fromCharCode("0x00D7"),name:"times"},
				{char:String.fromCharCode("0x00F7"),name:"divide"},
				{char:String.fromCharCode("0x002F"),name:"forwardSlash"},
				{char:String.fromCharCode("0x00B0"),name:"degrees"},
				{char:String.fromCharCode("0x221E"),name:"infinity"},
				{char:String.fromCharCode("0x2261"),name:"equivalence"},
				{char:String.fromCharCode("0x2248"),name:"approximately"},		
				{char:String.fromCharCode("0x2264"),name:"lessEqual"},
				{char:String.fromCharCode("0x2265"),name:"moreEqual"},
				{char:String.fromCharCode("0x03C0"),name:"pi"},
				{char:String.fromCharCode("0x2260"),name:"notEqual"},
				{char:String.fromCharCode("0x03B8"),name:"theta"},
				{char:String.fromCharCode("0x00B1"),name:"plusMinus"},
				{char:String.fromCharCode("0x2213"),name:"minusPlus"},
				{char:String.fromCharCode("0x2B1A"),name:"dottedSquare"},
				{char:String.fromCharCode("0x2115"),name:"naturals"},
				{char:String.fromCharCode("0x2124"),name:"integers"},
				{char:String.fromCharCode("0x211A"),name:"rationals"},
				{char:String.fromCharCode("0x211D"),name:"reals"},
				{char:String.fromCharCode("0x2208"),name:"elementOf"},
				{char:String.fromCharCode("0x2209"),name:"notElementOf"},
				{char:String.fromCharCode("0x221D"),name:"proportionalTo"},				
				{char:String.fromCharCode("0x2220"),name:"angle"},				
				{char:String.fromCharCode("0x2229"),name:"intersection"},				
				{char:String.fromCharCode("0x222A"),name:"union"},				
				{char:String.fromCharCode("0x2234"),name:"therefore"},
				{char:String.fromCharCode("0x2190"),name:"leftArrow"},
				{char:String.fromCharCode("0x2191"),name:"upArrow"},
				{char:String.fromCharCode("0x2192"),name:"rightArrow"},
				{char:String.fromCharCode("0x2193"),name:"downArrow"},
			]				
		]
	}
	
	menu.currentStyle = {};
	menu.update = function() {
		var obj = textEdit.obj;
		var style = {};
		var preTags = {};
		if (!un(obj) && obj !== null) {
			style = textEdit.getStyleAtPos() || {};
		} else {
			for (var p = 0; p < draw.path.length; p++) {
				var path = draw.path[p];
				if (path.selected !== true) continue;
				for (var o2 = 0; o2 < path.obj.length; o2++) {
					var obj = path.obj[o2];
					if (obj.type == 'text2' || obj.type == 'table2') {
						style = draw[obj.type].getStartTags(obj);
						o2 = path.obj.length;
						p = draw.path.length;
					}
				}
			}
		}
		if (!un(obj) && !un(textEdit.preText)) preTags = updateTagsFromText(textEdit.preText,{});
		//console.log("style:",style);
		//console.log("preTags:",preTags);
		for (var key in defaultTags) {
			textEdit.menu.currentStyle[key] = def([preTags[key],style[key],defaultTags[key]]);
		}
		if (un(obj) || obj == null) {
			var paths = selPaths();
			var found = false;
			if (paths.length == 1 && paths[0].obj.length == 1 && paths[0].obj[0].type == "table2") {
				var obj = paths[0].obj[0];
				for (var r = 0; r < obj.cells.length; r++) {
					for (var c = 0; c < obj.cells[r].length; c++) {
						var cell = obj.cells[r][c];
						if (cell.selected !== true || found == true) continue;
						for (var key in defaultTags) {
							var key2 = key == "color" ? "textColor" : key;
							if (!un(cell[key2])) textEdit.menu.currentStyle[key] = cell[key2];
						}
						found = true;
						break;
					}
					if (found == true) break;
				}
				if (found == false) {
					var cell = obj.cells[0][0];
					for (var key in defaultTags) {
						var key2 = key == "color" ? "textColor" : key;
						if (!un(cell[key2])) textEdit.menu.currentStyle[key] = cell[key2];
					}
				}
			}
		}
		if (!un(textEdit.obj)) {
			textEdit.menu.currentStyle.lineSpacingFactor = textEdit.obj.lineSpacingFactor || 1.2;
			textEdit.menu.currentStyle.lineSpacingStyle = textEdit.obj.lineSpacingStyle || "variable";
			textEdit.menu.currentStyle.box = un(textEdit.obj.box) || un(textEdit.obj.box.type) ? "none" : textEdit.obj.box.type;
		} else {
			textEdit.menu.currentStyle.box = "none";
		}
		textEdit.cursorColor = textEdit.menu.currentStyle.color;
		textEdit.blinkDraw();
		
		//console.log("currentStyle:",textEdit.menu.currentStyle);
		textEdit.menu.draw();
	}
	menu.canvas = createCanvas(menu.pos[0]-5,menu.pos[1]-5,menu.width+10,menu.height+10,true,false,true,menu.zIndex);
	menu.canvas.textMenu = true;

	menu.show = function() {
		if (textMenu.canvas.parentNode == container) return;
		if (!un(draw) && draw.mode == 'interact') {
			this.hide();
			return;
		}
		this.hideSubMenus();
		showObj(this.canvas);
	}
	menu.hide = function() {
		if (textMenu.canvas.parentNode !== container) return;		
		this.hideSubMenus();
		hideObj(this.canvas);
	}
	menu.position = function(x,y) {
		this.pos = [x,y];
		this.canvas.data[100] = x-5;
		this.canvas.data[101] = y-5;
		resizeCanvas3(this.canvas);
		for (var s = 0; s < this.subMenus.length; s++) {
			this.subMenus[s].canvas.data[100] = x+this.subMenus[s].relPos[0];
			this.subMenus[s].canvas.data[101] = y+this.subMenus[s].relPos[1];
			resizeCanvas3(this.subMenus[s].canvas);
		}
	}
	
	menu.draw = function() {
		var ctx = this.canvas.ctx;
		ctx.fillStyle = "#CFF";
		ctx.fillRect(5,5,this.width,this.height);
		
		var x = 5;
		var y = 5;
		for (var r = 0; r < this.buttons.length; r++) {
			x = 5;
			for (var c = 0; c < this.buttons[r].length; c++) {
				this.drawButton(ctx,x,y,this.buttons[r][c]);
				var w = this.buttons[r][c].width || 1;
				x += this.gridSize * w;
			}
			y += this.gridSize;
		}
		
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#000";
		ctx.beginPath();
		var y = 5;
		for (var r = 0; r < this.gridRows.length; r++) {
			ctx.moveTo(5,y);
			ctx.lineTo(this.width+5,y);
			for (var c = 0; c < this.gridRows[r].length; c++) {
				ctx.moveTo(this.gridRows[r][c]+5,y);
				ctx.lineTo(this.gridRows[r][c]+5,y+this.gridSize);
			}
			y += this.gridSize;
		}
		ctx.stroke();
		ctx.strokeRect(5,5,this.width,this.height);
	}
	menu.drawButton = function(ctx,x,y,button) {
		var w = !un(button.width) ? button.width*this.gridSize : this.gridSize;
		var h = this.gridSize;
		var mult = this.gridSize/30;
		switch (button.type) {
			case "font":
				//console.log(textEdit.menu.currentStyle.font);
				var font = this.fonts.find(function(f) {return f.font.toLowerCase() == textEdit.menu.currentStyle.font.toLowerCase();});
				text({ctx:ctx,text:["<<font:"+font.font+">><<fontSize:"+(font.displaySize*mult)+">>"+font.font],rect:[x,y,w,h],align:[0,0]})
				break;
			case "bold":
				if (textEdit.menu.currentStyle.bold == true) {
					ctx.fillStyle = "#0F0";
					ctx.fillRect(x,y,w,h);
				}
				text({ctx:ctx,text:["<<bold:true>><<fontSize:"+(22*mult)+">>B"],rect:[x,y,w,h],align:[0,0]});
				break
			case "italic":
				if (textEdit.menu.currentStyle.italic == true) {
					ctx.fillStyle = "#0F0";
					ctx.fillRect(x,y,w,h);
				}
				text({ctx:ctx,text:["<<italic:true>><<fontSize:"+(22*mult)+">><<font:algebra>>I"],rect:[x,y,w,h],align:[0,0]});
				break
			case "color":
				var color = textEdit.menu.currentStyle.color;
				text({ctx:ctx,text:["<<color:"+color+">><<fontSize:"+(24*mult)+">>A"],rect:[x,y,w,h],align:[0,0]});
				break
			case "align":
				var align = textEdit.menu.currentStyle.align;
				var x1,x2,x3,x4,y1,y2,y3;
				if (align[0] == -1) x1 = 6, x2 = 20, x3 = 6, x4 = 15;
				if (align[0] == 0) x1 = 8, x2 = 22, x3 = 11, x4 = 19;
				if (align[0] == 1) x1 = 10, x2 = 24, x3 = 15, x4 = 24;
				if (align[1] == -1) y1 = 6,	y2 = 10, y3 = 14;
				if (align[1] == 0) y1 = 11,	y2 = 15, y3 = 19;
				if (align[1] == 1) y1 = 16,	y2 = 20, y3 = 24;
				ctx.strokeStyle = "#000";
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(x+mult*x1,y+mult*y1);
				ctx.lineTo(x+mult*x2,y+mult*y1);
				ctx.moveTo(x+mult*x3,y+mult*y2);
				ctx.lineTo(x+mult*x4,y+mult*y2);
				ctx.moveTo(x+mult*x1,y+mult*y3);
				ctx.lineTo(x+mult*x2,y+mult*y3);
				ctx.stroke();				
				break;
			case "fontSize":
				var fontSize = textEdit.menu.currentStyle.fontSize;
				ctx.fillStyle = "#BBF";
				ctx.fillRect(x,y,w,h);
				text({ctx:ctx,text:["<<fontSize:"+(20*mult)+">>"+fontSize],align:[0,0],rect:[x,y,this.gridSize,h]});
				break;
			case "fontSizeMinus":
				ctx.fillStyle = "#BBF";
				ctx.fillRect(x,y,w,h);
				text({ctx:ctx,text:["<<fontSize:"+(25*mult)+">>-"],align:[0,0],rect:[x,y-3,this.gridSize,h]});
				break;
			case "fontSizePlus":
				ctx.fillStyle = "#BBF";
				ctx.fillRect(x,y,w,h);
				text({ctx:ctx,text:["<<fontSize:"+(25*mult)+">>+"],align:[0,0],rect:[x,y-1,this.gridSize,h]});
				break;
			case "lineSpacing":
				var lineSpacingFactor = textEdit.menu.currentStyle.lineSpacingFactor;
				text({ctx:ctx,text:["<<fontSize:"+(16*mult)+">>"+String(lineSpacingFactor)],align:[0,0],rect:[x+(1/3)*w,y,(2/3)*w,h]});
				ctx.beginPath();
				ctx.lineWidth = 2*mult;
				ctx.moveTo(x+mult*6,y+mult*6);
				ctx.lineTo(x+mult*20,y+mult*6);
				ctx.moveTo(x+mult*6,y+mult*24);
				ctx.lineTo(x+mult*20,y+mult*24);
				ctx.stroke();
				drawArrow({ctx:ctx,startX:x+mult*13,startY:y+mult*6,finX:x+mult*13,finY:y+mult*24,doubleEnded:true,arrowLength:mult*5,fillArrow:true,color:"#00F",lineWidth:mult*1});
				break;
			case "element":
				text({ctx:ctx,text:["<<font:algebra>><<fontSize:"+(25*mult)+">>"+String.fromCharCode(0x03C0)],rect:[x,y,w,h],align:[0,0]});
				break;
			case "box":
				//var box = textEdit.menu.currentStyle.box;
				//if (box == "loose") {
					var x2 = x+5*mult;
					var w2 = w-10*mult;
					var y2 = y+6*mult;
					var h2 = h-12*mult;
					ctx.fillStyle = "#FFC";
					ctx.fillRect(x2,y2,w2,h2);
					ctx.strokeStyle = "#000";
					ctx.strokeRect(x2,y2,w2,h2);
					ctx.beginPath();
					ctx.strokeStyle = "#000";
					ctx.lineWidth = 3*mult;
					ctx.moveTo(x2+7*mult,y2+0.5*h2);
					ctx.lineTo(x2+w2-7*mult,y2+0.5*h2);
					ctx.stroke();
				/*} else if (box == "tight") {
					var x2 = x+7*mult;
					var w2 = w-14*mult;
					var y2 = y+8*mult;
					var h2 = h-16*mult;
					ctx.fillStyle = "#FFC";
					ctx.fillRect(x2,y2,w2,h2);
					ctx.strokeStyle = "#000";
					ctx.strokeRect(x2,y2,w2,h2);
					ctx.beginPath();
					ctx.strokeStyle = "#000";
					ctx.lineWidth = 3*mult;
					ctx.moveTo(x2+4*mult,y2+0.5*h2);
					ctx.lineTo(x2+w2-4*mult,y2+0.5*h2);
					ctx.stroke();
				} else {
					var x2 = x+7*mult;
					var w2 = w-14*mult;
					var y2 = y+8*mult;
					var h2 = h-16*mult;
					ctx.strokeStyle = "#000";
					ctx.strokeRect(x2,y2,w2,h2);
					ctx.strokeStyle = "#F00";
					ctx.moveTo(x+5*mult,y+h-5*mult);
					ctx.lineTo(x+w-5*mult,y+5*mult);
					ctx.moveTo(x+w-5*mult,y+h-5*mult);
					ctx.lineTo(x+5*mult,y+5*mult);					
					ctx.stroke();
				}*/
				break;
		}
		
	}
	menu.click = function(e) {
		updateMouse(e);
		var menu = textEdit.menu;
		var x = draw.div.mouse[0] - menu.pos[0];
		var y = draw.div.mouse[1] - menu.pos[1];
		var button = menu.buttons2.find(function(b) {
			return (x >= b.rect[0] && x <= b.rect[0]+b.rect[2] && y >= b.rect[1] && y <= b.rect[1]+b.rect[3]);
		});
		if (un(button)) {
			textEdit.menu.hideSubMenus();
			return;
		}
		switch (button.type) {
			case "font":
			case "color":
			case "align":
			case "fontSize":
			case "lineSpacing":
			case "element":
				var sub = textEdit.menu.subMenus.find(function(sub) {
					return sub.type == button.type;
				});
				if (sub.vis == true) {
					sub.hide();
				} else {
					textEdit.menu.hideSubMenus();
					sub.show();
				}
				break;
			case "bold":
			case "italic":
				textEdit.menu.hideSubMenus();
				menu.applyValue(button.type);
				break;
			case "fontSizeMinus":
				if (textEdit.menu.currentStyle.fontSize > 0) menu.applyValue("fontSize",textEdit.menu.currentStyle.fontSize-1);
				break;
			case "fontSizePlus":
				menu.applyValue("fontSize",textEdit.menu.currentStyle.fontSize+1);
				break;
			case "box":
				if (textEdit.menu.currentStyle.box == "none") {
					var value = "loose";
				} else {
					var value = "none";
				}
				menu.applyValue("box",value);
				break;
		}
	};
	addListener(menu.canvas,menu.click);
	
	menu.update();
	
	menu.hideSubMenus = function(e) {
		for (var s = 0; s < textEdit.menu.subMenus.length; s++) {
			var subMenu = textEdit.menu.subMenus[s];
			if (subMenu.vis == true) subMenu.hide();
		}
		removeListener(window,textEdit.menu.hideSubMenus);
	}
	menu.subMenus = [
		{type:"font",offset:0,width:5,height:menu.fonts.length,fonts:menu.fonts,draw:function() {
			var ctx = this.ctx;
			ctx.strokeStyle = "#000";
			ctx.fillStyle = "#CFF";
			ctx.lineWidth = 2;
			this.buttons = [];
			var g = textEdit.menu.gridSize;
			var sf = g/30;
			for (var f = 0; f < this.fonts.length; f++) {				
				var font = this.fonts[f];
				ctx.fillRect(1,1+f*g,g*5,g);
				ctx.strokeRect(1,1+f*g,g*5,g);
				text({ctx:ctx,rect:[1,1+f*g,g*5,g],text:["<<font:"+font.font+">><<fontSize:"+font.displaySize*sf+">>"+font.font],align:[0,0]});
				this.buttons.push({type:"font",value:font.font,rect:[1,1+f*g,g*5,g]});
			}
		}},
		{type:"color",offset:-1,width:3,height:(menu.colors.length/3),colors:menu.colors,draw:function() {
			var ctx = this.ctx;
			ctx.strokeStyle = "#000";
			ctx.fillStyle = "#CFF";
			ctx.lineWidth = 2;
			this.buttons = [];
			var g = textEdit.menu.gridSize;
			for (var c = 0; c < this.colors.length; c++) {
				ctx.fillStyle = this.colors[c];
				ctx.fillRect(1+(c%3)*g,1+(Math.floor(c/3))*g,g,g);
				ctx.strokeRect(1+(c%3)*g,1+(Math.floor(c/3))*g,g,g);
				this.buttons.push({type:"color",value:this.colors[c],rect:[1+(c%3)*g,1+(Math.floor(c/3))*g,g,g]});		
			}
		}},
		{type:"align",offset:-1,width:3,height:3,draw:function() {
			var ctx = this.ctx;
			ctx.strokeStyle = "#000";
			ctx.fillStyle = "#CFF";
			ctx.lineWidth = 2;
			this.buttons = [];
			var g = textEdit.menu.gridSize;
			var sf = g/30;
			for (var r = -1; r < 2; r++) {
				for (var c = -1; c < 2; c++) {
					var x = 1+(c+1)*g;
					var y = 1+(r+1)*g;
					ctx.fillRect(x,y,g,g);
					ctx.strokeRect(x,y,g,g);
					var x1,x2,x3,x4,y1,y2,y3;
					if (c == -1) x1 = 6, x2 = 20, x3 = 6, x4 = 15;
					if (c == 0) x1 = 8, x2 = 22, x3 = 11, x4 = 19;
					if (c == 1) x1 = 10, x2 = 24, x3 = 15, x4 = 24;
					if (r == -1) y1 = 6, y2 = 10, y3 = 14;
					if (r == 0) y1 = 11, y2 = 15, y3 = 19;
					if (r == 1) y1 = 16, y2 = 20, y3 = 24;
					ctx.beginPath();
					ctx.moveTo(x+sf*x1,y+sf*y1);
					ctx.lineTo(x+sf*x2,y+sf*y1);
					ctx.moveTo(x+sf*x3,y+sf*y2);
					ctx.lineTo(x+sf*x4,y+sf*y2);
					ctx.moveTo(x+sf*x1,y+sf*y3);
					ctx.lineTo(x+sf*x2,y+sf*y3);
					ctx.stroke();
					this.buttons.push({type:"align",value:[c,r],rect:[x,y,g,g]});					
				}
			}			
		}},
		{type:"fontSize",offset:-1,width:3,height:menu.fontSizes.length/3,fontSizes:menu.fontSizes,draw:function() {
			var ctx = this.ctx;
			var g = textEdit.menu.gridSize;
			var sf = g/30;
			ctx.strokeStyle = "#000";
			ctx.fillStyle = "#BBF";
			ctx.fillRect(1,1,this.width*g,this.height*g);
			ctx.lineWidth = 2;
			this.buttons = [];
			for (var f = 0; f < this.fontSizes.length; f++) {
				var fontSize = this.fontSizes[f];
				ctx.strokeRect(1+(f%3)*g,1+Math.floor(f/3)*g,g,g);
				text({ctx:ctx,rect:[1+(f%3)*g,1+Math.floor(f/3)*g,g,g],text:["<<fontSize:"+(20*textEdit.menu.gridSize/30)+">>"+String(fontSize)],align:[0,0]});
				this.buttons.push({type:"fontSize",value:fontSize,rect:[1+(f%3)*g,1+Math.floor(f/3)*g,g,g]});
			}
		}},
		{type:"lineSpacing",offset:0,width:2,height:3,draw:function() {
			var ctx = this.ctx;
			this.canvas.closeTextSubMenus = false;
			var g = textEdit.menu.gridSize;
			var sf = g/30;
			ctx.strokeStyle = "#000";
			ctx.fillStyle = "#CFF";
			ctx.fillRect(1,1,this.width*g,this.height*g);
			ctx.lineWidth = 2;
			this.buttons = [];
			
			var rect = [1,1,g,g];
			ctx.strokeRect(rect[0],rect[1],rect[2],rect[3]);
			text({ctx:ctx,rect:rect,text:["<<fontSize:"+(20*sf)+">>-"],align:[0,0]});
			this.buttons.push({type:"lineSpacingFactor",closeSubMenus:false,value:-0.05,rect:clone(rect)});			
			
			var rect = [1+g,1,g,g];
			ctx.strokeRect(rect[0],rect[1],rect[2],rect[3]);
			text({ctx:ctx,rect:rect,text:["<<fontSize:"+(20*sf)+">>+"],align:[0,0]});
			this.buttons.push({type:"lineSpacingFactor",closeSubMenus:false,value:0.05,rect:clone(rect)});
			
			var rect = [1,1+g,2*g,g];
			ctx.strokeRect(rect[0],rect[1],rect[2],rect[3]);
			text({ctx:ctx,rect:rect,text:["<<fontSize:"+(15*sf)+">>variable"],align:[0,0]});
			this.buttons.push({type:"lineSpacingStyle",closeSubMenus:false,value:"variable",rect:clone(rect)});
			
			var rect = [1,1+2*g,2*g,g];
			ctx.strokeRect(rect[0],rect[1],rect[2],rect[3]);
			text({ctx:ctx,rect:rect,text:["<<fontSize:"+(15*sf)+">>fixed"],align:[0,0]});
			this.buttons.push({type:"lineSpacingStyle",closeSubMenus:false,value:"fixed",rect:clone(rect)});			
		}},
		{type:"element",offset:-2.5,width:6,height:2*(menu.elements[0].length/3)+menu.elements[1].length/3,elements:menu.elements,draw:function() {
			var ctx = this.ctx;
			var g = textEdit.menu.gridSize;
			var sf = g/30;
			ctx.strokeStyle = "#000";
			ctx.lineWidth = 2;
			this.buttons = [];
			var cols1 = 3;
			var size1 = g*(6/cols1);
			var cols2 = 5;
			var size2 = g*(6/cols2);
			for (var e = 0; e < this.elements[0].length; e++) {
				var x = 1+(e%cols1)*size1;
				var y = 1+(Math.floor(e/cols1)*size1);
				var display = this.elements[0][e].display || [this.elements[0][e].char];
				ctx.fillStyle = "#CFF";
				ctx.strokeStyle = "#000";
				ctx.lineWidth = 2;
				ctx.fillRect(x,y,size1,size1);
				ctx.strokeRect(x,y,size1,size1);
				text({ctx:ctx,rect:[x,y,size1,size1],text:["<<font:algebra>><<fontSize:"+(24*sf)+">>"].concat(display),align:[0,0]});
				this.buttons.push({type:"element",value:this.elements[0][e].char,rect:[x,y,size1,size1]});
			}
			for (var e = 0; e < this.elements[1].length; e++) {
				var x = 1+(e%5)*size2;
				var y = 1+(Math.ceil(this.elements[0].length/cols1))*size1+Math.floor(e/cols2)*size2;
				ctx.fillStyle = "#CFF";
				ctx.strokeStyle = "#000";
				ctx.lineWidth = 2;
				ctx.fillRect(x,y,size2,size2);
				ctx.strokeRect(x,y,size2,size2);
				text({ctx:ctx,rect:[x,y,size2,size2],text:["<<font:algebra>><<fontSize:"+(22*sf)+">>"+this.elements[1][e].char],align:[0,0]});
				this.buttons.push({type:"element",value:this.elements[1][e].char,rect:[x,y,size2,size2]});
			}			
		}}
	];
	for (var s = 0; s < menu.subMenus.length; s++) {
		var sub = menu.subMenus[s];
		var g = textEdit.menu.gridSize;
		var type = sub.type;
		var button = menu.buttons2.find(function(f) {return f.type == type;});
		var l = menu.pos[0]+button.rect[0]+sub.offset*g-1;
		var t = menu.pos[1]+button.rect[1]+g-1;
		var w = sub.width*g+2;
		var h = sub.height*g+2;
		sub.canvas = createCanvas(l,t,w,h,false,false,true,menu.zIndex+1);
		sub.canvas.textMenu = true;
		sub.canvas.parent = sub;
		sub.ctx = sub.canvas.ctx;
		sub.l = l;
		sub.t = t;
		sub.relPos = [button.rect[0]+sub.offset*g,button.rect[1]+g];
		sub.draw();
		sub.vis = false;
		sub.textMenu = true;
		sub.subMenu = true;
		sub.parentButton = button;
		sub.show = function() {
			if (this.vis == true) return;
			this.vis = true;
			showObj(this.canvas);
			addListener(this.canvas,this.click);
			window.textEditSubMenuCloseListener = function(e) {
				updateMouse(e);
				for (var s = 0; s < textEdit.menu.subMenus.length; s++) {
					if (e.target == textEdit.menu.subMenus[s].canvas) return;
					var rect = clone(textEdit.menu.subMenus[s].parentButton.rect);
					rect[0] += textEdit.menu.pos[0];
					rect[1] += textEdit.menu.pos[1];
					if (mouse.x >= rect[0] && mouse.x <= rect[0]+rect[2] && mouse.y >= rect[1] && mouse.y <= rect[1]+rect[3]) { 	
						return;
					}
				}
				textEdit.menu.hideSubMenus(e);
			}
			addListenerStart(window,window.textEditSubMenuCloseListener);
		}
		sub.hide = function() {
			if (this.vis == false) return;
			this.vis = false;
			hideObj(this.canvas);
			removeListener(this.canvas,this.click);
			removeListenerStart(window,window.textEditSubMenuCloseListener);
			delete window.textEditSubMenuCloseListener;
		}
		sub.click = function(e) {
			updateMouse(e);
			var sub = e.target.parent;
			var x = draw.div.mouse[0] - sub.l;
			var y = draw.div.mouse[1] - sub.t;
			var button = sub.buttons.find(function(b) {
				return (x >= b.rect[0] && x <= b.rect[0]+b.rect[2] && y >= b.rect[1] && y <= b.rect[1]+b.rect[3]);
			});
			if (un(button)) return;
			textEdit.menu.applyValue(button.type,button.value);
			if (["lineSpacingFactor","lineSpacingStyle"].includes(button.type) == false) {
				textEdit.menu.hideSubMenus(e);
			}
		}
	}

	menu.applyValue = function(type,value) {
		if (type == "bold") value = !textEdit.menu.currentStyle.bold;
		if (type == "italic") value = !textEdit.menu.currentStyle.italic;
		if (type == "font" && typeof value === 'undefined') value = textEdit.menu.currentStyle.font === 'algebra' ? 'Arial' : 'algebra';
				
		if (un(textEdit.obj)) {
			var paths = draw.path;
			for (var p = 0; p < paths.length; p++) {
				if (paths[p].selected !== true) continue;
				for (var o = 0; o < paths[p].obj.length; o++) {
					var obj = paths[p].obj[o];
					if (obj.type == "table2") {
						var selCellCount = 0;
						for (var r = 0; r < obj.cells.length; r++) {
							for (var c = 0; c < obj.cells[r].length; c++) {
								if (obj.cells[r][c].selected == true) selCellCount++;
							}
						}
						for (var r = 0; r < obj.cells.length; r++) {
							for (var c = 0; c < obj.cells[r].length; c++) {
								var cell = obj.cells[r][c];
								if (cell.selected !== true && selCellCount > 0) continue;
								if (type == "align") {
									cell.align = clone(value);
									removeTagsOfType(cell.text,"align");
								} else if (type == "lineSpacingFactor") {
									if (un(cell.lineSpacingFactor)) cell.lineSpacingFactor = 1.2;
									cell.lineSpacingFactor = roundToNearest(cell.lineSpacingFactor+value,0.01);
								} else if (type == "lineSpacingStyle") {
									cell.lineSpacingStyle = value;
								} else if (type == "box") {
									if (un(cell.box)) cell.box = {type:"none",borderColor:"#000",borderWidth:2,radius:10,color:'none'};
									cell.box.type = cell.box.type == "none" ? "loose" : "none";
									if (cell.box.type == "loose") {
										obj.innerBorder.show = false;
										obj.outerBorder.show = false;
										if (un(obj.paddingH)) obj.paddingH = 10;
										if (un(obj.paddingV)) obj.paddingV = 10;
									}
								} else if (["color","fontSize","bold","italic"].includes(type)) {
									var type2 = type == "color" ? "textColor" : type;
									cell[type2] = value;
									removeTagsOfType(cell.text,type);
								} else if (type === 'font') {
									var text2 = removeTags(clone(cell.text));
									var pos = 0;
									if (typeof text2[0] == 'string' && text2[0].length > 2 && text2[0].charAt(1) == ')') {
										cell.font = 'Arial';
										pos = 2;
										var style = textEdit.getStyleAtPos([0,cell.text[0].length],cell);
										value = style.font !== 'algebra' ? 'algebra' : 'Arial';
									}
									removeTagsOfType(cell.text,type);
									if (value == 'algebra') cell.text[0] = cell.text[0].slice(0,pos)+'<<font:algebra>>'+cell.text[0].slice(pos);
								}
							}
						}
					} else if (obj.type == "text2") {
						if (type == "align") {
							obj.align = value;
							removeTagsOfType(obj.text,"align");
							removeTagsOfType(obj.text,"vertAlign");
						} else if (type == "lineSpacingFactor") {
							if (un(obj.lineSpacingFactor)) obj.lineSpacingFactor = 1.2;
							obj.lineSpacingFactor = roundToNearest(obj.lineSpacingFactor+value,0.01);
						} else if (type == "lineSpacingStyle") {
							obj.lineSpacingStyle = value;
						} else if (type == "box") {
							if (un(obj.box)) obj.box = {type:"none",borderColor:"#000",borderWidth:3};
							if (obj.box.type == "none") {
								obj.box.type = "loose";
								delete obj.box.dir;
								obj.align = [0,0];
							} else if (obj.box.type == "loose") {
								obj.box.type = "flowArrow";
								obj.box.dir = "right";
								obj.align = [0,0];
							} else if (obj.box.type == "flowArrow" && obj.box.dir == "right") {
								obj.box.type == "flowArrow";
								obj.box.dir = "left";
								obj.align = [0,0];
							} else {
								obj.box.type = "none";
								delete obj.box.dir;
								obj.align = [-1,-1];
							}
							
							
						} else if (["font","color","fontSize","bold","italic"].includes(type)) {
							removeTagsOfType(obj.text,type);
							obj[type] = value;
							//obj.text[0] = '<<'+type+':'+value+'>>'+obj.text[0];
						}
					}
				}
			}
			drawCanvasPaths();
			textEdit.menu.update();
			return;
		}
		
		if (["font","color","fontSize","bold","italic"].includes(type)) {
			if (textEdit.selected == true) {
				textEdit.setTagForSelected(type,value);	
				textEdit.draw();
			} else {
				textEdit.setPreTag(type,value);	
				textEdit.menu.update();
			}
		} else if (type == "align") {
			if (un(textEdit.obj.align)) textEdit.obj.align = clone(defaultTags.align);
			textEdit.obj.align[1] = value[1];
			var type = value[0] == -1 ? "left" : value[0] == 0 ? "center" : "right"; 
			textEdit.insertAlignTag(type);			
			textEdit.draw();
		} else if (type == "lineSpacingFactor") {
			if (un(textEdit.obj.lineSpacingFactor)) textEdit.obj.lineSpacingFactor = defaultTags.lineSpacingFactor;
			textEdit.obj.lineSpacingFactor = roundToNearest(textEdit.obj.lineSpacingFactor+value,0.01);
			textEdit.draw();
			textEdit.menu.update();
		} else if (type == "lineSpacingStyle") {
			textEdit.obj.lineSpacingStyle = value;
			textEdit.draw();
		} else if (type == "element") {
			if (textEdit.selected == true) {
				textEdit.cursorPos = Math.min(textEdit.selectPos[0],textEdit.selectPos[1]);
				textEdit.deleteSelected();
			}
			textEdit.insert(value);
			textEdit.draw();
		} else if (type == "box") {
			if (un(textEdit.obj.box)) textEdit.obj.box = {type:"none",borderColor:"#000",borderWidth:3,radius:0};
			if (textEdit.obj.box.type == "none") {
				textEdit.obj.box.type = "loose";
			} else if (textEdit.obj.box.type == "loose") {
				textEdit.obj.box.type = "flowArrow";
				textEdit.obj.box.dir = "right";
				textEdit.obj.align = [0,0];
			} else if (textEdit.obj.box.type == "flowArrow" && textEdit.obj.box.dir == "right") {
				textEdit.obj.box.type == "flowArrow";
				textEdit.obj.box.dir = "left";
				textEdit.obj.align = [0,0];
			} else {
				textEdit.obj.box.type = "none";
			}
			textEdit.draw();
		}
		
		
	}

	return menu;
}

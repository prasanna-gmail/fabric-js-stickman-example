//Javascript document

/***************************/
/*   LOAD, SAVE, EXPORT    */
/***************************/

function png(sf,crop) {
	if (draw.path.length == 0) return;
	if (typeof sf == 'undefined') sf = 1;
	if (typeof crop == 'undefined') crop = false;
	deselectAllPaths();

	if (crop == false) {
		var canvas = drawPathsToCanvas(undefined,draw.path,undefined,sf);
		//window.open(canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),'_blank');
	} else {
		var l,t,r,b;
		for (var p = 0; p < draw.path.length; p++) {
			if (un(l)) {
				l = draw.path[p].border[0];
				t = draw.path[p].border[1];
				r = draw.path[p].border[4];
				b = draw.path[p].border[5];
			} else {
				l = Math.min(l,draw.path[p].border[0]);
				t = Math.min(t,draw.path[p].border[1]);
				r = Math.max(r,draw.path[p].border[4]);
				b = Math.max(b,draw.path[p].border[5]);
			}
		}
		var canvas2 = drawPathsToCanvas(undefined,draw.path,undefined,sf);
		var canvas = newctx({rect:[0,0,r-l,b-t],vis:false}).canvas;
		canvas.ctx.drawImage(canvas,-l,-t);
		//window.open(canvas2.toDataURL("image/png"),'_blank');
	}
	
	saveCanvasAsPNG(canvas,'img.png');
}
function pngPath(path,sf,crop) {
	if (un(path)) var path = draw.path;
	if (draw.path.length == 0) return
	if (un(sf)) sf = 1;
	if (un(crop)) crop = false;
	deselectAllPaths();

	if (crop == false) {
		var canvas = drawPathsToCanvas(undefined,path,undefined,sf);
		window.open(canvas.toDataURL("image/png"),'_blank');
	} else {
		var l,t,r,b;
		for (var p = 0; p < path.length; p++) {
			if (un(l)) {
				l = path[p].tightBorder[0];
				t = path[p].tightBorder[1];
				r = path[p].tightBorder[4];
				b = path[p].tightBorder[5];
			} else {
				l = Math.min(l,path[p].tightBorder[0]);
				t = Math.min(t,path[p].tightBorder[1]);
				r = Math.max(r,path[p].tightBorder[4]);
				b = Math.max(b,path[p].tightBorder[5]);
			}
		}
		var canvas2 = drawPathsToCanvas(undefined,path,undefined,sf);
		var canvas = newctx({rect:[0,0,r-l,b-t],vis:false}).canvas;
		canvas.ctx.drawImage(canvas2,-l,-t);
		window.open(canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"),'_blank');
		//window.open(canvas.toDataURL("image/png"),'_blank');
	}
	
	//saveCanvasAsPNG(canvas,'img.png');
}

if (un(draw)) var draw = {};
draw.loadPaths = function(url,callback,index,setDrawPaths) {
	loadScript(url,function(index) {
		var paths = clone(fileData);
		delete window.fileData;
		draw.convertLoadedPaths(paths);
		if (boolean(setDrawPaths,true) == true) {
			clearDrawPaths();		
			draw.path = !un(paths) ? paths : [];
			draw.updateAllBorders();
			drawCanvasPaths();
			draw.undo.reset();
		}
		if (typeof callback == 'function') callback(index,paths);
		return paths;
	},undefined,index);
}
draw.convertLoadedPaths = function(paths) {
	if (typeof paths == 'undefined') paths = draw.path;
	for (var p = paths.length-1; p >= 0; p--) {
		var path = paths[p];
		path.selected = false;
		//delete path.qBox;
		if (!un(path.trigger) && path.trigger.length == 0) delete path.trigger;
		for (var o = path.obj.length-1; o >= 0; o--) {
			if (un(path.obj[o])) {
				console.log(o,path.obj);
				continue;
			}
			var obj = path.obj[o];
			switch (obj.type) {
				case 'text':
					path.obj[o] = draw.convertTextToText2(obj);
					break;
				case 'text2':
					draw.text2.extractStartTags(obj);
					break;
				case 'input':
				case 'button':
				case 'multChoice':
					path.obj.splice(o,1);
					break;
				case 'table':
				case 'table2':
					path.obj[o] = draw.convertTable(obj);
					break;
				case 'image':
					break;
			}
		}
		if (path.obj.length == 0) paths.splice(p,1);
	}
	return paths;
}
draw.convertTextToText2 = function(obj) {
	var align = [-1,-1];
	if (obj.mathsInput.textAlign == 'left') align[0] = -1;
	if (obj.mathsInput.textAlign == 'center') align[0] = 0;
	if (obj.mathsInput.textAlign == 'right') align[0] = 1;
	if (obj.mathsInput.vertAlign == 'top') align[1] = -1;
	if (obj.mathsInput.vertAlign == 'middle') align[1] = 0;
	if (obj.mathsInput.vertAlign == 'bottom') align[1] = 1;
	
	var txt = obj.mathsInput.richText;
	txt = textArrayReplace(txt,'<<br>>',br);
	txt = textArrayReplace(txt,'Segoe Print','segoePrint');
	
	var rect = [obj.left,obj.top,obj.width,obj.height];
	//console.log('---',obj,obj.mathsInput,obj.mathsInput.leftPoint)
	if (!un(obj.mathsInput.leftPoint)) {
		rect[0] += obj.mathsInput.leftPoint;
		rect[1] += obj.mathsInput.leftPoint;
		rect[2] -= obj.mathsInput.leftPoint;
	}
	
	var obj2 = {
		type:'text2',
		text:txt,
		rect:rect,
		align:align
	}
	
	if (obj.showBorder == true) {
		obj2.box = {type:'loose'};
		if (!un(obj.fillColor)) obj2.box.color = obj.fillColor;
		if (!un(obj.color)) obj2.box.borderColor = obj.color;
		if (!un(obj.thickness)) obj2.box.borderWidth = obj.thickness;
		if (!un(obj.radius)) obj2.box.radius = obj.radius;
	}
	var keysToKeep = ['pathPin','trigger'];
	for (var k = 0; k < keysToKeep.length; k++) {
		if (!un(obj[keysToKeep[k]])) obj2[keysToKeep[k]] = obj[keysToKeep[k]];
	}
	return obj2;	
}
draw.convertTable = function(obj) {
	if (!un(obj.mInputs)) {
		for (var r = 0; r < obj.mInputs.length; r++) {
			for (var c = 0; c < obj.mInputs[r].length; c++) {
				var m = obj.mInputs[r][c];
				var txt = m.richText;
				txt = textArrayReplace(txt,'<<br>>',br);
				txt = textArrayReplace(txt,'Segoe Print','segoePrint');
				obj.cells[r][c].text = txt;
				var align = [0,0];
				if (m.textAlign == 'left' || m.align == 'left') align[0] = -1;
				if (m.textAlign == 'right' || m.align == 'right') align[0] = 1;
				if (m.vertAlign == 'top') align[1] = -1;
				if (m.vertAlign == 'bottom') align[1] = 1;
				obj.cells[r][c].align = align;
				obj.cells[r][c].padding = 10;
			}
		}
	}
	if (obj.type == 'table') {
		obj.widths = [];
		obj.heights = [];
		for (var x = 0; x < obj.xPos.length-1; x++) obj.widths[x] = obj.xPos[x+1] - obj.xPos[x];
		for (var y = 0; y < obj.yPos.length-1; y++) obj.heights[y] = obj.yPos[y+1] - obj.yPos[y];
		obj.type = 'table2';
	}
	delete obj.cell;
	delete obj.mInputs;
	return obj;	
}
draw.savePaths = function(filePath,fileName,pngData,paths,callback) {
	if (un(paths)) var paths = clone(draw.path);
	/*var drawPaths = 'var fileData = '+JSON.stringify(paths,function(key,value) {
		if (['borderButtons','border','tightBorder','selected','ctx','qBox',"data","cursorData","textLoc","cursorPos","cursorMap","allMap","canvas","ctx","cursorCanvas","cursorctx","startText","startRichText","startTags","stringJS","currBackColor","preText","postText"].includes(key)) return undefined;
		if (typeof value == 'number') return Number(value.toFixed(3));
		return value;
	});*/
	var drawPaths = draw.stringifyDrawPaths(paths);
	var params = "filePath="+encodeURIComponent(filePath)+"&fileName="+encodeURIComponent(fileName)+"&drawPaths="+encodeURIComponent(drawPaths);
	
	if (un(pngData)) {
		var canvas = drawPathsToCanvas(undefined,draw.path,undefined,0.15);
		var pngData = canvas.toDataURL("image/png");
	}
	params += "&pngData="+encodeURIComponent(pngData);	
	console.log(filePath,fileName);
	
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("post", "/i2/draw_savePaths.php", true);
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlHttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			var response = this.responseText == 'true' ? true : false;
			console.log('saved:',response);
			if (response == false) console.log(drawPaths);
			if (!un(callback)) callback();
		}
	}
	xmlHttp.send(params);
}
draw.stringifyDrawPaths = function(paths,includeVarFileData) {
	if (un(paths)) paths = draw.path;
	paths = draw.compressPaths(paths);
	var str = draw.stringify(paths);
	if (boolean(includeVarFileData,true) == true) str = 'var fileData = '+str;
	return str;
}
draw.compressPaths = function(paths) {
	//paths = clone(paths);
	for (var p = paths.length-1; p >= 0; p--) {
		var path = paths[p];
		draw.compressPath(path);
		if (path.obj.length == 0) paths.splice(p,1);
	}
	//console.log(paths);
	return paths;
}
draw.compressPath = function(path) {
	function isEmpty(obj) {
		for(var key in obj) {
			if (obj.hasOwnProperty(key)) return false;
		}
		return true;
	}
	if (!un(path.isInput) && isEmpty(path.isInput)) delete path.isInput;
	if (!un(path.interact) && isEmpty(path.interact)) delete path.interact;
	for (var o = 0; o < path.obj.length; o++) {
		var obj = path.obj[o];
		if (un(obj)) continue;
		if (!un(obj.interact) && isEmpty(obj.interact)) delete obj.interact;
		var deleteProperties = ['edit','drawing','textEdit'];
		if (obj.type == 'text2') {
			if ((un(obj.text) || textArrayCheckIfEmpty(obj.text)) && un(obj.id) && (un(obj.box) || obj.box.type == 'none')) {
				path.obj.splice(o,1);
				continue;
			}
			var tags = clone(defaultTags);
			if (!un(obj.align)) tags.align = obj.align == -1 ? 'left' : obj.align == 1 ? 'right' : 'center'; 
			if (!un(obj.text)) {
				obj.text = simplifyText(obj.text);
				obj.text = textArrayRemoveDefaultTags(obj.text,tags);
				obj.text = removeTagsOfType(obj.text,'selected');
			}
			deleteProperties.push('tightRect');
		} else if (obj.type == 'table2') {
			deleteProperties.push('rows','cols','xPos','yPos','width','height','drawing','minCellWidth','minCellHeight','horizAlign');
			var deleteCellProperties = ['minWidth','minHeight','highlight','selected','styled','tightRect'];
			var cells = draw.table2.getAllCells(obj);
			var tags = clone(defaultTags);
			if (!un(obj.text)) {
				if (!un(obj.text.font)) tags.font = obj.text.font;
				if (!un(obj.text.size)) tags.fontSize = obj.text.size;
				if (!un(obj.text.color)) tags.color = obj.text.color;
			}
			for (var c = 0; c < cells.length; c++) {
				for (var d = 0; d < deleteCellProperties.length; d++) delete cells[c][deleteCellProperties[d]];
				if (!un(cells[c].trigger) && cells[c].trigger.length == 0) delete cells[c].trigger;
				if (cells[c].color == 'none') delete cells[c].color;
				if (!un(cells[c].box) && cells[c].box.type == 'none') delete cells[c].box;
				if (!un(cells[c].box) && (cells[c].box.color == 'none' && cells[c].box.borderColor == 'none')) delete cells[c].box;
				if (!un(cells[c].text)) {
					var cellTags = clone(tags);
					if (!un(cells[c].align)) cellTags.align = cells[c].align[0] == -1 ? 'left' : cells[c].align[0] == 1 ? 'right' : 'center';
					cells[c].text = simplifyText(cells[c].text);
					cells[c].text = textArrayRemoveDefaultTags(cells[c].text,cellTags);
					cells[c].text = removeTagsOfType(cells[c].text,'selected');
				}
			}
		}/* else if (obj.type == 'polygon') {
			if (!un(obj.angles)) {
				for (var a = 0; a < obj.angles.length; a++) {
					if (un(obj.angles[a])) continue;
					if (obj.angles[a].drawCurve !== true && obj.angles[a].measureLabelOnly !== false) {
						delete obj.angles[a];
					}
				}
				if (obj.angles.length == 0) {
					delete obj.angles;
				}
			}
		}*/
		for (var d = 0; d < deleteProperties.length; d++) delete obj[deleteProperties[d]];
		for (var key in obj) if (key.charAt(0) == '_') delete obj[key];
	}
	delete path.border;
	delete path.borderButtons;
	delete path.selected;
	delete path.tightBorder;
	return path;
}
draw.jsonStringifyFile = function(file) {
	var circular = [];
	
	var str = stringify(obj);
	return str;
	
	function stringify(obj) {
		var str = "";
		if (circular.indexOf(obj) > -1) return "null";
		if (obj instanceof Array) {
			for (var i = 0; i < obj.length; i++) {
				if (typeof obj[i] == 'object') {
					circular.push(obj);
					break;
				}
			}
			var len = obj.length;
			str += "[";
			for (var i = 0; i < obj.length; i++) {
				if (un(obj[i])) {
					str += 'null,';
				} else {
					str += stringify(obj[i])+',';
				}
			}
			if (str.slice(-1) == ',') str = str.slice(0,-1);
			str += "]";
		} else if (typeof obj == 'object') {
			for (var key in obj) {
				if (typeof obj[key] == 'object') {
					circular.push(obj);
					break;
				}
			}
			str += "{";
			for (var key in obj) {
				if (['borderButtons','border','tightBorder','ctx','qBox',"cursorData","textLoc","cursorPos","cursorMap","allMap","canvas","ctx","cursorCanvas","cursorctx","startText","startRichText","startTags","stringJS","currBackColor","preText","postText"].includes(key) || key.indexOf('_') == 0 || obj.hasOwnProperty(key) == false) continue;
				if (key === 'selected' && (typeof obj[key] === 'boolean' || un(obj[key]))) continue;
				var value = stringify(obj[key]);
				if (value == '') continue;
				str += '"'+key+'":'+value+",";
			}
			if (str.slice(-1) == ',') str = str.slice(0,-1);
			str += "}";
		} else if (typeof obj == 'function') {
			str += obj.toString().replace(/\r?\n|\r|\t/g,"");
		} else if (typeof obj == 'number' && !isNaN(obj)) {
			str += String(Number(obj));
		} else if (typeof obj == 'string') {
			var escapeString = replaceAll(obj,"\"","\\\"");
			str += '"'+escapeString+'"';
		} else if (typeof obj == 'boolean') {
			str += obj;
		} else {
			if (typeof obj !== 'undefined') console.log('draw.stringify type not included: ',typeof obj,obj);
		}
		return str;
	}	
}
draw.stringify = function(obj) {
	var circular = []; // store all objects to check for circular refs
	var str = stringify(obj);
	return str;
	
	function stringify(obj) {
		var str = "";
		if (circular.indexOf(obj) > -1) return "null";
		if (obj instanceof Array) {
			for (var i = 0; i < obj.length; i++) {
				if (typeof obj[i] == 'object') {
					circular.push(obj);
					break;
				}
			}
			var len = obj.length;
			str += "[";
			for (var i = 0; i < obj.length; i++) {
				if (un(obj[i])) {
					str += 'null,';
				} else {
					str += stringify(obj[i])+',';
				}
			}
			if (str.slice(-1) == ',') str = str.slice(0,-1);
			str += "]";
		} else if (typeof obj == 'object') {
			for (var key in obj) {
				if (typeof obj[key] == 'object') {
					circular.push(obj);
					break;
				}
			}
			str += "{";
			for (var key in obj) {
				if (['borderButtons','border','tightBorder','ctx','qBox',"cursorData","textLoc","cursorPos","cursorMap","allMap","canvas","ctx","cursorCanvas","cursorctx","startText","startRichText","startTags","stringJS","currBackColor","preText","postText"].includes(key) || key.indexOf('_') == 0 || obj.hasOwnProperty(key) == false) continue;
				if (key === 'selected' && (typeof obj[key] === 'boolean' || un(obj[key]))) continue;
				var value = stringify(obj[key]);
				if (value == '') continue;
				str += '"'+key+'":'+value+",";
			}
			if (str.slice(-1) == ',') str = str.slice(0,-1);
			str += "}";
		} else if (typeof obj == 'function') {
			str += obj.toString().replace(/\r?\n|\r|\t/g,"");
		} else if (typeof obj == 'number' && !isNaN(obj)) {
			str += String(Number(obj.toFixed(3)));
		} else if (typeof obj == 'string') {
			var escapeString = replaceAll(obj,"\"","\\\"");
			str += '"'+escapeString+'"';
		} else if (typeof obj == 'boolean') {
			str += obj;
		} else {
			if (typeof obj !== 'undefined') console.log('draw.stringify type not included: ',typeof obj,obj);
		}
		return str;
	}	
}

/***************************/
/*     	PATH DRAWING	   */
/***************************/

draw.rotationMode = false;
draw.multiPage = {};
draw.divMode = function() {
	if (!un(draw.div)) return;
	
	var div = document.createElement('div');
	container.appendChild(div);
	draw.div = div;
	div.onscroll = function(e) {
		var pageDims = draw.getPageDims();
		draw.drawRelPos = [-pageDims[0]*(draw.div.scrollLeft/draw.div.scrollWidth), -pageDims[1]*(draw.div.scrollTop/draw.div.scrollHeight)];
	}
	div.allowDefault = true;
	div.width = 1225;
	div.height = 700;
	div.setAttribute('draggable', 'false');
	div.setAttribute('class', 'buttonClass');
	div.style.overflow = 'auto';
	div.style.cursor = 'default';
	div.zoom = 1;
		
	div.getScrollBarWidth = function() {
		// https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript
		var outer = document.createElement("div");
		outer.style.visibility = "hidden";
		outer.style.width = "100px";
		outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
		document.body.appendChild(outer);
		var widthNoScroll = outer.offsetWidth;
		outer.style.overflow = "scroll";
		var inner = document.createElement("div");
		inner.style.width = "100%";
		outer.appendChild(inner);        
		var widthWithScroll = inner.offsetWidth;
		outer.parentNode.removeChild(outer);
		return widthNoScroll - widthWithScroll+2;
	}
	div.resize = function() {
		var xsf = canvasDisplayWidth / mainCanvasWidth;
		var ysf = canvasDisplayHeight / mainCanvasHeight;
		draw.div.style.left = (canvasDisplayLeft + 0 * xsf) + "px";
		draw.div.style.top = (0 * ysf) + "px";
		draw.div.style.width = (1225 * xsf) + "px";
		draw.div.style.height = (700 * ysf) + "px";
		draw.div.setZoom(draw.div.zoom);
	}
	div.setZoom = function(sf) {
		if (un(draw.div.scrollBarWidth)) draw.div.scrollBarWidth = draw.div.getScrollBarWidth();

		var horizontalScrollRatio = draw.div.scrollWidth > draw.div.clientWidth ? draw.div.scrollLeft/(draw.div.scrollWidth-draw.div.clientWidth) : false;
		var verticalScrollRatio = draw.div.scrollHeight > draw.div.clientHeight ? draw.div.scrollTop/(draw.div.scrollHeight-draw.div.clientHeight) : false;
		
		var clientRect = canvas.getBoundingClientRect();
		var viewportWidth = clientRect.width-draw.div.scrollBarWidth;
		var w = viewportWidth*sf;
		var h = w*(1700/1200);
		//var l = 0;
		//var l = (viewportWidth*(1-sf))/2;
		var l = Math.max(0,(viewportWidth*(1-sf))/2);
				
		for (var p = 0; p < draw.div.childNodes.length; p++) {
			var pageDiv = draw.div.childNodes[p];
			pageDiv.pageIndex = 0;
			pageDiv.style.width = w+'px';
			pageDiv.style.height = h+'px';
			pageDiv.style.left = l+'px';
			for (var c = 0; c < pageDiv.childNodes.length; c++) {
				var child = pageDiv.childNodes[c];
				if (child.style.width.indexOf('%') > 0) continue;
				child.style.width = w+'px';
				child.style.height = h+'px';
				child.style.left = '0px';
			}
		}
		draw.div.zoom = sf;
				
		if (draw.div.scrollWidth > draw.div.clientWidth) {
			var scrollRatio = horizontalScrollRatio === false ? 0.5 : horizontalScrollRatio;
			draw.div.scrollLeft = scrollRatio*(draw.div.scrollWidth-draw.div.clientWidth);
		} else {
			draw.div.scrollLeft = 0;
		}
		if (draw.div.scrollHeight > draw.div.clientHeight) {
			var scrollRatio = verticalScrollRatio === false ? 0.5 : verticalScrollRatio;
			draw.div.scrollTop = scrollRatio*(draw.div.scrollHeight-draw.div.clientHeight);
		} else {
			draw.div.scrollTop = 0;
		}
	}
	div.canvasPosToDivPos = function(pos,page) {
		if (un(page)) page = pIndex;
		if (typeof page === 'number') page = draw.div.childNodes[page];
		var dims = draw.div.getPageDims(page);
		var divPos = [
			dims.external[0]+pos[0]*(dims.external[2]/dims.internal[2]),
			dims.external[1]+pos[1]*(dims.external[3]/dims.internal[3])
		];
		return divPos;
	}
	div.divPosToCanvasPos = function(pos) {
		var index = -1;
		var pageDivs = draw.div.childNodes;
		for (var p = 0; p < pageDivs.length; p++) {
			var page = pageDivs[p];
			var rect = draw.div.getPageDims(page).external;
			if (rect[0] <= pos[0] && pos[0] <= rect[0]+rect[1] && rect[1] <= pos[1] && pos[1] <= rect[1]+rect[3]) {
				index = p;
				break;
			}
		}
		if (index === -1) return false;
		var page = draw.div.childNodes[index];
		var dims = draw.div.getPageDims(page);
		var canvasPos = [
			(pos[0]-dims.external[0])*(dims.internal[2]/dims.external[2]),
			(pos[1]-dims.external[1])*(dims.internal[3]/dims.external[3]),
			index // page index
		];
		return canvasPos;
	}
	div.getPageDims = function(page) {
		if (typeof page === 'number') page = draw.div.childNodes[page];
		var dims = {
			internal:[0,0,page.childNodes[0].width,page.childNodes[0].height],
			external:[page.offsetLeft,page.offsetTop,page.scrollWidth,page.scrollHeight] // relative to draw.div
		};
		return dims;
	}
	div.getPos = function() {
		return [draw.div.scrollLeft,draw.div.scrollTop];
	}
	div.setPos = function(pos) {
		draw.div.scrollLeft = pos[0];
		draw.div.scrollTop = pos[1];
	}
	div.zoomToRect = function(rect) {
		var pageDims = draw.getPageDims();
		var zoom = Math.min(pageDims[0]/rect[2],pageDims[1]/rect[3]);	
		draw.div.setZoom(zoom);
		draw.div.scrollLeft = (rect[0]/pageDims[0])*draw.div.scrollWidth;
		draw.div.scrollTop = (rect[1]/pageDims[1])*draw.div.scrollHeight;
	}
	div.zoomReset = function() {
		draw.div.zoomToRect([0,0,1200,700]);
	}
	div.zoomPageHeight = function() {
		draw.div.zoomToRect([0,0,1200,1700]);
	}
	
	div.createPageDiv = function(page) {
		return;
		if (!un(page._div)) return;
		page._div = document.createElement('div');
		page._div.className = 'page-div';
		page._div.pageIndex = p;
		page._div.innerHTML = '';
		page._drawCanvas = [];
		for (var i = 0; i < 7; i++) {
			var pe = i == 6 ? true : false;
			var canvas = createCanvas(0,0,1200,1700,false,false,pe,draw.zIndex+2*i);
			canvas.pageIndex = pageIndex;
			canvas.setAttribute('class', 'drawDivCanvas');
			if (i == 0) {
				canvas.style.backgroundColor = '#FFF';
				canvas.style.border = '1px solid black';
			}
			if (i < 5) {
				page._drawCanvas.push(canvas);
			} else if (i == 5) {
				page._toolsCanvas = canvas;
			} else if (i == 6) {
				page._cursorCanvas = canvas;
				canvas.style.pointerEvents = true;
				canvas.data[7] = true;
			}
			page._div.appendChild(canvas);
		}
	};
	
	var pageDiv = document.createElement('div');
	pageDiv.className = 'page-div';
	div.pageDiv = pageDiv;
	div.appendChild(pageDiv);
	div.style.backgroundColor = '#999';
	
	draw.drawCanvas[0].style.backgroundColor = '#FFF';
	
	for (var c = 0; c < draw.drawCanvas.length; c++) {
		hideObj(draw.drawCanvas[c]);
		pageDiv.appendChild(draw.drawCanvas[c]);
		draw.drawCanvas[c].setAttribute('class', 'drawDivCanvas');
		draw.drawCanvas[c].style.border = c === 0 ? '1px solid black' : '1px solid transparent';
	}
	hideObj(draw.toolsCanvas);
	pageDiv.appendChild(draw.toolsCanvas);
	draw.toolsCanvas.setAttribute('class', 'drawDivCanvas');
	hideObj(draw.cursorCanvas);
	pageDiv.appendChild(draw.cursorCanvas);
	draw.cursorCanvas.setAttribute('class', 'drawDivCanvas');
	draw.div.setZoom(1);
}
draw.getView = function() {
	var pageDims = draw.getPageDims();
	var view = {
		divDims:[draw.div.scrollWidth,draw.div.scrollHeight],
		divViewRect:[
			draw.div.scrollLeft,
			draw.div.scrollTop,
			draw.div.clientWidth,
			draw.div.clientHeight
		],
		pageDims:pageDims,
		pageViewRect:[
			pageDims[0]*(draw.div.scrollLeft/draw.div.scrollWidth),
			pageDims[1]*(draw.div.scrollTop/draw.div.scrollHeight),
			pageDims[0]*(draw.div.clientWidth/draw.div.scrollWidth),
			pageDims[1]*(draw.div.clientHeight/draw.div.scrollHeight)
		],
		zoom:draw.div.zoom
	};
	return view;
}
draw.getPageDims = function(page) {
	if (un(page)) page = file.resources[resourceIndex].pages[pIndex];
	return !un(page.dims) ? page.dims : !un(page._dims) ? page._dims : [1200,1700];
}
draw.viewPosToDrawPos = function(pos) {
	var viewRect = draw.getView().pageViewRect;
	return [pos[0]+viewRect[0],pos[1]+viewRect[1]];
}
draw.getViewCenter = function() {
	var viewRect = draw.getView().pageViewRect;
	return [viewRect[0]+viewRect[2]/2,viewRect[1]+viewRect[3]/2];
}
draw.getScreenRectAsCanvasCoords = function() {
	var canvasMetrics = canvas.getBoundingClientRect();
	var xScale = (1225-60)/canvasMetrics.width;
	var yScale = 750/canvasMetrics.height;
	
	var screenRectAsCanvasCoords = [
		-canvasMetrics.left*xScale,
		-canvasMetrics.top*yScale,
		window.innerWidth*xScale,
		window.innerHeight*yScale
	];
		
	return screenRectAsCanvasCoords;
}
draw.drawPosToCanvasPos = function(pos) {
	var pageRect = draw.drawCanvas[0].getBoundingClientRect();
	var screenPos = [
		pageRect.left+pageRect.width*pos[0]/1200,
		pageRect.top+pageRect.height*pos[1]/1700,
	];
	var screenCanvasRect = draw.getScreenRectAsCanvasCoords();
	return [
		screenCanvasRect[0]+screenCanvasRect[2]*screenPos[0]/window.innerWidth,
		screenCanvasRect[1]+screenCanvasRect[3]*screenPos[1]/window.innerHeight
	];
}

draw.getColorAtPixel = function(x,y) {
	var color;
	for (var i = 0; i < draw.drawCanvas.length; i++) {
		var p = draw.drawCanvas[i].ctx.getImageData(x,y,1,1).data;
		if (p[3] === 0) continue;
		color = 'rgba('+p[0]+', '+p[1]+', '+p[2]+', '+p[3]+')';
	}
	if (un(color)) color = mainCanvasFillStyle;
	return color;

}

function drawCanvasPaths() {
	if (draw.drawMode === 'interactDragging') {
		drawCanvasPathsInteractDragMode();
		return;
	}
	if (typeof draw.beforeDraw == 'function') draw.beforeDraw();
	while (draw.drawCanvas.length < 5) addDrawCanvas();
	
	draw.drawCanvas[0].ctx.clear(); // unselected
	draw.drawCanvas[1].ctx.clear(); // selected or drawTools paths (eg. pen)
	draw.drawCanvas[2].ctx.clear(); // overlay (eg. construction buttons)
	//draw.drawCanvas[3]; // select canvas 1 (movable)
	//draw.drawCanvas[4]; // select canvas 2 (static)
	
	if (mode === 'edit' && draw.showMargins !== false && getResourceType() === 'worksheet') { // draw margins		
		var ctx = draw.drawCanvas[0].ctx;
		ctx.strokeStyle = '#F00';
		ctx.lineWidth = 2;
		ctx.setLineDash([]);
		if (arraysEqual(draw.gridMargin,[0,0,0,0]) == false) {
			var m = draw.gridMargin;				
			ctx.strokeRect(m[0],m[1],draw.drawArea[2]-m[0]-m[2],draw.drawArea[3]-m[1]-m[3]);
		}
		for (var i = 0; i < draw.gridVertMargins.length; i++) {
			var m = draw.gridVertMargins[i];
			ctx.beginPath();
			ctx.moveTo(m,draw.gridMargin[1]);
			ctx.lineTo(m,draw.drawArea[3]-draw.gridMargin[3]);
			ctx.stroke();
		}
		for (var i = 0; i < draw.gridHorizMargins.length; i++) {
			var m = draw.gridHorizMargins[i];
			ctx.beginPath();
			ctx.moveTo(draw.gridMargin[0],m);
			ctx.lineTo(draw.drawArea[2]-draw.gridMargin[2],m);
			ctx.stroke();
		}
	}
	
	var drawFirst = [], unselected = [], drawLast = [], overlay = [], overlayLast = [], selected = [];
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		if (getPathVis(path) === false) continue;
		for (var o = 0; o < path.obj.length; o++) path.obj[o]._path = path;
		if (path.obj.length === 1) {
			var obj = path.obj[0];
			if (!un(draw[obj.type]) && obj.type !== 'buttonCompassHelp' && draw[obj.type].drawToolsButton === true && !un(pages[pIndex]) && typeof pages[pIndex].drawToolsButtons === 'object') continue;
		}
		if (path.selected == true || path._interacting === true || (!un(draw.drag) && draw.drag.dragging !== false && draw.drag.paths instanceof Array && draw.drag.paths.indexOf(path) > -1)) {
			selected.push(path);
		} else {
			var isOverlay = false; isOverlayLast = false; drawFirst1 = false; drawLast1 = false; drawToolsPath = false;
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (!un(obj.interact) && obj.interact.overlay == true) {
					isOverlay = true;
					break;
				} else if (obj.type === 'dropMenu' && obj._open === true) {
					isOverlayLast = true;
					break;
				} else if (obj.drawFirst === true) { // || obj.type === 'taskQuestion') {
					drawFirst1 = true;
					break;
				} else if (obj.drawLast === true || obj.type === 'tracingPaper') {
					drawLast1 = true;
					break;
				} else if (!un(obj.created)) {
					drawToolsPath = true;
					break;
				}
			}
			if (isOverlay == true) {
				overlay.push(path);
			} else if (isOverlayLast == true) {
				overlayLast.push(path);
			} else if (drawFirst1 == true) {
				drawFirst.push(path);
			} else if (drawLast1 == true) {
				drawLast.push(path);
			} else if (drawToolsPath === true) {
				selected.push(path);
			} else {				
				unselected.push(path);
			}
		}
	}
	if (draw.mode !== 'interact' && draw.drawing == true && draw.path.last().selected !== true) selected.push(unselected.pop());

	draw.pathCursorOrder = drawFirst.concat(unselected).concat(drawLast).concat(selected).concat(overlay).concat(overlayLast);
		
	for (var p = 0; p < draw.pathCursorOrder.length; p++) {
		var path = draw.pathCursorOrder[p];
		if (getPathVis(path) === false) continue;
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			if (un(draw[obj.type])) continue;
			if (typeof draw[obj.type].drawUnderlay === 'function') draw[obj.type].drawUnderlay(draw.drawCanvas[0].ctx,obj,path);
		}
	}
	
	if (drawFirst.length > 0) drawPathsToCanvas(draw.drawCanvas[0],drawFirst);
	if (unselected.length > 0) drawPathsToCanvas(draw.drawCanvas[0],unselected);
	if (drawLast.length > 0) drawPathsToCanvas(draw.drawCanvas[0],drawLast);

	if (draw.mode == 'interact' && draw.appearMode == true) { // draw appear button positions
		var ctx = draw.drawCanvas[0].ctx;
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (un(obj.appear) || obj.appear.active === false || (obj.visible === true && obj.appear.reversible !== true)) continue;
				var objPath = {obj:[obj]};
				updateBorder(objPath);
				var pos = objPath._center;
				if (!un(obj.appear.offset)) pos = vector.addVectors(pos,obj.appear.offset);
				var colors = ['#96C','#C9F','#FFF'];
				if (!un(obj.appear.color)) {
					colors[1] = obj.appear.color;
					var col = colors[1].split('');
					for (var i = 1; i < 4; i++) {
						col[i] = {'0':'0','1':'0','2':'0','3':'0','4':'1','5':'2','6':'3','7':'4','8':'5','9':'6','A':'7','B':'8','C':'9','D':'A','E':'B','F':'C'}[col[i]];
					}
					colors[0] = col.join('');
				}
				if (obj.visible == false) {
					roundedRect(ctx, pos[0]-20+3, pos[1]-20+3, 40 - 6, 40 - 6, 3, 6, colors[0], colors[1]);	
					ctx.beginPath();
					ctx.fillStyle = colors[2];
					drawStar({
						ctx: ctx,
						center: pos,
						radius: 12,
						points: 5
					});
					ctx.fill();
				} else {
					roundedRect(ctx, pos[0]-20+3, pos[1]-20+3, 40 - 6, 40 - 6, 3, 6, colorA(colors[1],0.75), colors[2]);	
					ctx.beginPath();
					ctx.fillStyle = colorA(colors[1],0.75);
					drawStar({
						ctx: ctx,
						center: pos,
						radius: 12,
						points: 5
					});
					ctx.fill();
				}
			}
			if (un(path.appear) || path.appear.active === false) continue;
			var visible = boolean(path._visible,false);
			if (visible == true && path.appear.reversible !== true) continue;
			if (typeof path.appear.visible == 'function' && path.appear.visible(path) === false) continue;
			if (typeof path.appear.visible == 'string') {
				var testPath = draw.getPathById(path.appear.visible);
				if (testPath !== false && getPathVis(testPath) == false) {
					continue;
				}
			}
			if (!un(path.appear.pos)) {
				var l = path.appear.pos[0]-20;
				var t = path.appear.pos[1]-20;
			} else if (!un(path.appear.relPos)) {
				if (un(path.border)) updateBorder(path);
				if (un(path.border)) continue;
				var l = path.border[0] + path.appear.relPos[0]-20;
				var t = path.border[1] + path.appear.relPos[1]-20;
			} else {
				if (un(path.border)) updateBorder(path);
				if (un(path.border)) continue;
				var l = path.border[0]+0.5*path.border[2]-20;
				var t = path.border[1]+0.5*path.border[3]-20;
			}
			if (path.appear.type === 'info') {
				var color = '#6AF';
				if (visible == false) {
					text({ctx:ctx,rect:[l,t,40,40],align:[0,0],fontSize:36,font:'algebra',text:['i'],color:'#FFF',box:{type:'loose',color:color,borderColor:color,borderWidth:2,radius:20}});
				} else {
					text({ctx:ctx,rect:[l,t,40,40],align:[0,0],fontSize:36,font:'algebra',text:['i'],color:color,box:{type:'loose',color:'#FFF',borderColor:color,borderWidth:2,radius:20}});
				}
			} else {
				var colors = ['#96C','#C9F','#FFF'];
				if (!un(path.appear.color)) {
					colors[1] = path.appear.color;
					var col = colors[1].split('');
					for (var i = 1; i < 4; i++) {
						col[i] = {'0':'0','1':'0','2':'0','3':'0','4':'1','5':'2','6':'3','7':'4','8':'5','9':'6','A':'7','B':'8','C':'9','D':'A','E':'B','F':'C'}[col[i]];
					}
					colors[0] = col.join('');
				}
				if (visible == false) {
					roundedRect(ctx, l+3, t+3, 40 - 6, 40 - 6, 3, 6, colors[0], colors[1]);	
					ctx.beginPath();
					ctx.fillStyle = colors[2];
					drawStar({
						ctx: ctx,
						center: [l+20,t+20],
						radius: 12,
						points: 5
					});
					ctx.fill();
				} else {
					roundedRect(ctx, l+3, t+3, 40 - 6, 40 - 6, 3, 6, colorA(colors[1],0.75), colors[2]);	
					ctx.beginPath();
					ctx.fillStyle = colorA(colors[1],0.75);
					drawStar({
						ctx: ctx,
						center: [l+20,t+20],
						radius: 12,
						points: 5
					});
					ctx.fill();
				}
			}
		}
	}
		
	if (selected.length > 0) drawPathsToCanvas(draw.drawCanvas[1],selected);
	draw.drawCanvas[1]._paths = selected;
	if (overlay.length > 0) drawPathsToCanvas(draw.drawCanvas[2],overlay);
	draw.drawCanvas[2]._paths = overlay;
	draw.drawCanvas[2]._overlayObjs = [];
	
	for (var p = 0; p < draw.pathCursorOrder.length; p++) {
		var path = draw.pathCursorOrder[p];
		if (getPathVis(path) === false) continue;
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			if (un(draw[obj.type])) continue;
			if (typeof draw[obj.type].drawOverlay === 'function') {
				draw.drawCanvas[2]._overlayObjs.push(obj);
				draw[obj.type].drawOverlay(draw.drawCanvas[2].ctx,obj,path);
			}
		}
	}

	if (overlayLast.length > 0) drawPathsToCanvas(draw.drawCanvas[2],overlayLast);
	draw.drawCanvas[2]._overlayLast = overlayLast;
	
	drawSelectCanvas();
	drawSelectCanvas2();
	draw.undo.saveState();
	if (typeof draw.afterDraw == 'function') draw.afterDraw();
	if (draw.mode === 'edit' && !un(window.pathList) && typeof window.pathList.update == 'function') window.pathList.update();
	draw.ids.update();
	
	if (getResourceType() === 'task') draw.task.updateTrayCanvas();
	
	if (!un(draw.cursorCanvas)) draw.cursorCanvas.addEventListener('wheel',draw.onScrollWheel,false);
  
}
function getDrawPathsAriaText(paths) {
	var ariaTexts = [];
	for (var p = 0; p < paths.length; p++) {
		var path = paths[p];
		if (typeof path._qObj === 'object') continue;
		if (getPathVis(path) === false) continue;
		for (var i = 0; i < path.obj.length; i++) {
			var obj = path.obj[i];
			if (un(draw[obj.type]) || typeof draw[obj.type].getAriaText !== 'function') continue;
			var ariaText = draw[obj.type].getAriaText(obj);
			for (var i2 = 0; i2 < ariaText.length; i2++) {
				if (ariaText[i2].text !== '') {
					ariaTexts.push(ariaText[i2]);
				}
			}
		}
	}
	ariaTexts.sort(function(a,b) {
		if (Math.abs(a.rect[1] - b.rect[1]) > 20) return a.rect[1] - b.rect[1];
		return a.rect[0] - b.rect[0];
		return 0;
	});
	var ariaText = ariaTexts.map(function(x) {return x.text;}).join(' ');
	return ariaText;
}
function textArrayToAriaText(arr) {
	arr = removeTags(clone(arr));
	if (typeof arr === 'string') {
		arr = replaceAll(arr,' + ','+');
		arr = replaceAll(arr,' - ','-');
		arr = replaceAll(arr,' '+divide+' ',divide);
		arr = replaceAll(arr,' '+times+' ',times);
		arr = replaceAll(arr,br+br+br+br,' ');
		arr = replaceAll(arr,br+br+br,' ');
		arr = replaceAll(arr,br+br,' ');
		arr = replaceAll(arr,br,' ');
		arr = replaceAll(arr,tab,' ');
		arr = replaceAll(arr,'  ',' ');
		arr = replaceAll(arr,'  ',' ');
		arr = replaceAll(arr,'  ',' ');
		arr = arr.trim();
		return arr;
	} else if (arr instanceof Array) {
		var str = "";
		for (var i = 0; i < arr.length; i++) {
			var elem = arr[i];
			if (typeof elem === 'string') {
				if (str.length > 0 && str.slice(-1) !== ' ') str += ' ';
				str += textArrayToAriaText(elem);
			} else if (elem instanceof Array) {
				if (elem[0] === 'frac') {
					var a = textArrayToAriaText(elem[1]);
					a = a.trim();
					if (a === '') a = 'blank';
					var b = textArrayToAriaText(elem[2]);
					b = b.trim();
					if (b === '') b = 'blank';
					str += ' (fraction: '+a+' over '+b+')';
				} else if (elem[0] === 'pow') {
					var b = textArrayToAriaText(elem[2]);
					b = b.trim();
					if (b === '') b = 'blank';
					if (Number(b) === 2) {
						str += ' squared';
					} else if (Number(b) === 3) {
						str += ' cubed';
					} else {
						str += ' to the power of '+b;
					}
				} else if (elem[0] === 'sqrt') {
					var a = textArrayToAriaText(elem[1]);
					a = a.trim();
					if (a === '') a = 'blank';
					str += ' square root of '+a;
				} else if (elem[0] === 'root') {
					var a = textArrayToAriaText(elem[1]);
					a = a.trim();
					if (a === '') a = 'blank';
					var b = textArrayToAriaText(elem[2]);
					b = b.trim();
					if (b === '') b = 'blank';
					if (Number(a) === 2) {
						str += ' square root of '+b;
					} else if ([3,4,5,6,7,8,9,10].indexOf(Number(a)) > -1) {
						var nth = ['cube','fourth','fifth','sixth','seventh','eighth','ninth','tenth'][Number(a)-3];
						str += ' '+nth+' root of '+b;
					} else {
						str += ' '+a+' root of '+b;
					}
				}
			}
		}
		return str;
	}
	return '';
}

function drawCanvasPathsInteractDragMode() {
	if (typeof draw.beforeDraw == 'function') draw.beforeDraw();
	while (draw.drawCanvas.length < 5) addDrawCanvas();
	
	draw.drawCanvas[0].ctx.clear(); // before
	draw.drawCanvas[1].ctx.clear(); // dragging
	draw.drawCanvas[2].ctx.clear(); // after

	var drawFirst = [];
	var drawLast = [];
	var overlay = [];
	var before = [];
	var dragging = [];
	var after = [];
	
	var dragPathPassed = false;
	
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		for (var o = 0; o < path.obj.length; o++) path.obj[o]._path = path;
		if (path.obj.length === 1) {
			var obj = path.obj[0];
			if (!un(draw[obj.type]) && obj.type !== 'buttonCompassHelp' && draw[obj.type].drawToolsButton === true && !un(pages[pIndex]) && typeof pages[pIndex].drawToolsButtons === 'object') continue;
		}
		if (path === draw.drag.path) {
			dragging.push(path);
			dragPathPassed = true;
			continue;
		}

		var isOverlay = false; drawFirst1 = false; drawLast1 = false;
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			if (!un(obj.interact) && obj.interact.overlay == true) {
				isOverlay = true;
				break;
			} else if (obj.drawFirst == true || obj.type == 'taskQuestion') {
				drawFirst1 = true;
				break;
			} else if (obj.drawLast == true) {
				drawLast1 = true;
				break;
			}
		}
		if (isOverlay == true) {
			overlay.push(path);
		} else if (drawFirst1 == true) {
			drawFirst.push(path);
		} else if (drawLast1 == true) {
			drawLast.push(path);
		} else if (dragPathPassed === true) {
			after.push(path);
		} else {			
			before.push(path);
		}
	}
	draw.pathCursorOrder = drawFirst.concat(before).concat(dragging).concat(after).concat(drawLast).concat(overlay);
	
	for (var p = 0; p < draw.pathCursorOrder.length; p++) {
		var path = draw.pathCursorOrder[p];
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			if (un(draw[obj.type])) continue;
			if (typeof draw[obj.type].drawUnderlay === 'function') draw[obj.type].drawUnderlay(draw.drawCanvas[0].ctx,obj,path);
		}
	}
	
	if (drawFirst.length > 0) drawPathsToCanvas(draw.drawCanvas[0],drawFirst);
	if (before.length > 0) drawPathsToCanvas(draw.drawCanvas[0],before);
	if (dragging.length > 0) drawPathsToCanvas(draw.drawCanvas[1],dragging);
	if (after.length > 0) drawPathsToCanvas(draw.drawCanvas[2],after);
	if (drawLast.length > 0) drawPathsToCanvas(draw.drawCanvas[2],drawLast);

	if (draw.mode == 'interact' && draw.appearMode == true) { // draw appear button positions
		var ctx = draw.drawCanvas[2].ctx;
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (un(obj.appear) || obj.appear.active === false || (obj.visible === true && obj.appear.reversible !== true)) continue;
				var objPath = {obj:[obj]};
				updateBorder(objPath);
				var pos = objPath._center;
				if (!un(obj.appear.offset)) pos = vector.addVectors(pos,obj.appear.offset);
				var colors = ['#96C','#C9F','#FFF'];
				if (!un(obj.appear.color)) {
					colors[1] = obj.appear.color;
					var col = colors[1].split('');
					for (var i = 1; i < 4; i++) {
						col[i] = {'0':'0','1':'0','2':'0','3':'0','4':'1','5':'2','6':'3','7':'4','8':'5','9':'6','A':'7','B':'8','C':'9','D':'A','E':'B','F':'C'}[col[i]];
					}
					colors[0] = col.join('');
				}
				if (obj.visible == false) {
					roundedRect(ctx, pos[0]-20+3, pos[1]-20+3, 40 - 6, 40 - 6, 3, 6, colors[0], colors[1]);	
					ctx.beginPath();
					ctx.fillStyle = colors[2];
					drawStar({
						ctx: ctx,
						center: pos,
						radius: 12,
						points: 5
					});
					ctx.fill();
				} else {
					roundedRect(ctx, pos[0]-20+3, pos[1]-20+3, 40 - 6, 40 - 6, 3, 6, colorA(colors[1],0.75), colors[2]);	
					ctx.beginPath();
					ctx.fillStyle = colorA(colors[1],0.75);
					drawStar({
						ctx: ctx,
						center: pos,
						radius: 12,
						points: 5
					});
					ctx.fill();
				}
			}
			if (un(path.appear) || path.appear.active === false) continue;
			var visible = boolean(path._visible,false);
			if (visible == true && path.appear.reversible !== true) continue;
			if (typeof path.appear.visible == 'function' && path.appear.visible(path) === false) continue;
			if (typeof path.appear.visible == 'string') {
				var testPath = draw.getPathById(path.appear.visible);
				if (testPath !== false && getPathVis(testPath) == false) {
					continue;
				}
			}
			if (un(path.appear.pos)) {
				if (un(path.border)) updateBorder(path);
				if (un(path.border)) continue;
				var l = path.border[0]+0.5*path.border[2]-20;
				var t = path.border[1]+0.5*path.border[3]-20;
			} else {
				var l = path.appear.pos[0]-20;
				var t = path.appear.pos[1]-20;
			}
			var colors = ['#96C','#C9F','#FFF'];
			if (!un(path.appear.color)) {
				colors[1] = path.appear.color;
				var col = colors[1].split('');
				for (var i = 1; i < 4; i++) {
					col[i] = {'0':'0','1':'0','2':'0','3':'0','4':'1','5':'2','6':'3','7':'4','8':'5','9':'6','A':'7','B':'8','C':'9','D':'A','E':'B','F':'C'}[col[i]];
				}
				colors[0] = col.join('');
			}
			if (visible == false) {
				roundedRect(ctx, l+3, t+3, 40 - 6, 40 - 6, 3, 6, colors[0], colors[1]);	
				ctx.beginPath();
				ctx.fillStyle = colors[2];
				drawStar({
					ctx: ctx,
					center: [l+20,t+20],
					radius: 12,
					points: 5
				});
				ctx.fill();
			} else {
				roundedRect(ctx, l+3, t+3, 40 - 6, 40 - 6, 3, 6, colorA(colors[1],0.75), colors[2]);	
				ctx.beginPath();
				ctx.fillStyle = colorA(colors[1],0.75);
				drawStar({
					ctx: ctx,
					center: [l+20,t+20],
					radius: 12,
					points: 5
				});
				ctx.fill();
			}
		}
	}
		
	if (overlay.length > 0) drawPathsToCanvas(draw.drawCanvas[2],overlay);
	
	for (var p = 0; p < draw.pathCursorOrder.length; p++) {
		var path = draw.pathCursorOrder[p];
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			if (un(draw[obj.type])) continue;
			if (typeof draw[obj.type].drawOverlay === 'function') draw[obj.type].drawOverlay(draw.drawCanvas[2].ctx,obj,path);
		}
	}
}

function drawSelectedPaths(drawOverlay) {
	while (draw.drawCanvas.length < 4) addDrawCanvas();
	draw.drawCanvas[1].ctx.clear();
	
	var selected = [];
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		if (path.selected == true || path._interacting === true || (typeof textEdit.obj === 'object' && path.obj instanceof Array && path.obj.indexOf(textEdit.obj) > -1)) {
			selected.push(path);
		} else if (draw.mode === 'interact') {
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (!un(obj.created)) {
					selected.push(path);
					break;
				}
			}
		}
	}
	if (draw.drawing == true && draw.path.last().selected !== true && selected.indexOf(draw.path.last()) === -1) selected.push(draw.path.last());
	if (selected.length > 0) drawPathsToCanvas(draw.drawCanvas[1],selected);
	
	/*if (drawOverlay !== false) {
		draw.drawCanvas[2].ctx.clear();
		for (var p = 0; p < selected.length; p++) {
			var path = selected[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (un(draw[obj.type])) continue;
				if (typeof draw[obj.type].drawOverlay === 'function') draw[obj.type].drawOverlay(draw.drawCanvas[2].ctx,obj,path);
			}
		}
		
		if (draw.mode !== 'interact') {
			drawSelectCanvas();
			drawSelectCanvas2();
			draw.undo.saveState();
		}
	}*/
}

function drawPathsToCanvas(canvas2,paths,triggerNum,sf,backColor,relPos,fillBack,drawAllPaths,log) {
	if (un(paths)) return;
	if (un(sf)) sf = draw.scale || 1;
	if (un(backColor)) backColor = mainCanvasFillStyle;
	if (un(drawAllPaths)) drawAllPaths = false;
	if (un(canvas2)) {
		var canvas = document.createElement('canvas');
		canvas.width = draw.drawCanvas[0].width*sf;
		canvas.height = draw.drawCanvas[0].height*sf;
		canvas.data = clone(draw.drawCanvas[0].data);
		canvas.data[2] = draw.drawCanvas[0].data[2]*sf;
		canvas.data[3] = draw.drawCanvas[0].data[3]*sf;
		canvas.data[102] = draw.drawCanvas[0].data[102]*sf;
		canvas.data[103] = draw.drawCanvas[0].data[103]*sf;
	} else {
		var canvas = canvas2;
	}
	if (canvas instanceof CanvasRenderingContext2D || un(canvas.getContext)) {
		var ctx = canvas;
	} else {
		var ctx = canvas.getContext('2d');	
	}
	//if (!un(draw.drawCanvas)) console.log(draw.drawCanvas.indexOf(canvas2),canvas2,paths);
	
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	if (relPos instanceof Array) ctx.translate(relPos[0],relPos[1]);
	if (sf !== 1) ctx.scale(sf,sf);
	if (boolean(fillBack,false) == true) {
		ctx.fillStyle = backColor;
		ctx.fillRect(0,0,canvas.width,canvas.height);
	}
	
	for (var p = 0; p < paths.length; p++) {
		var path = paths[p];
		
		if (un(path) || (drawAllPaths == false && getPathVis(path) == false)) continue;
		if (path.notesOverlay === true && draw.notesOverlay !== true) continue;
		if (!un(path.rotation)) {
			ctx.translate(path.border[0]+0.5*path.border[2],path.border[1]+0.5*path.border[3]);
			ctx.rotate(path.rotation);
			ctx.translate(-path.border[0]-0.5*path.border[2],-path.border[1]-0.5*path.border[3]);
		}
		for (var o = 0; o < path.obj.length; o++) {
			if (un(path.obj[o])) continue;
			var obj = path.obj[o];
				
			if (drawAllPaths == false && typeof obj.trigger !== 'undefined' && draw.ansMode == true && obj.trigger[0] == false && draw.showAns == false) continue;
			if (obj.visible === false || obj.vis === false) continue;

			//if (log === true && obj.type === 'text2' && obj.text[0].indexOf("3. ") === 0) console.log(obj);
			
			drawObjToCtx(ctx,path,obj,1,1,0,0,1);
		}
		if (!un(path.rotation)) {
			ctx.translate(path.border[0]+0.5*path.border[2],path.border[1]+0.5*path.border[3]);
			ctx.rotate(-path.rotation);
			ctx.translate(-path.border[0]-0.5*path.border[2],-path.border[1]-0.5*path.border[3]);
		}
	}
	
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	return canvas;
}
function getPathVis(path) {
	if (typeof path == 'string') {
		path = draw.getPathById(path);
		if (path == false) return false;
	}
	if (un(path)) return false;
	if (!un(path._path)) path = path._path;
	if (path.notesOverlay === true && draw.notesOverlay !== true) return false;
	if (!un(path.appear) && typeof path.appear.visible == 'function') {
		var visibleTest = path.appear.visible(path);
		if (visibleTest === true) return true;
		if (visibleTest === false) return false;
	}
	if (!un(path.appear) && typeof path.appear.visible == 'string') {
		if (getPathVis(path.appear.visible) == false) return false;
	}
	if (boolean(path.vis,true) === false) return false;
	if (boolean(path._visible,true) === false) return false;
	var vis = true;
	if (typeof path.trigger == 'object') {
		for (var l = 0; l <= draw.triggerNum; l++) {
			if (typeof path.trigger[l] == 'boolean' && path.trigger[l] == true) {
				vis = true;
			} else if (typeof path.trigger[l] == 'boolean' && path.trigger[l] == false) {
				vis = false;
			}
		}
		if (draw.triggerNum == 1 && arraysEqual(path.trigger,[false])) vis = true;
	}
	return vis;	
}
function drawObjToCtx(ctx,path,obj) {
	if (draw.objCacheImageMode === true) {
		drawObjToCtxCacheMode(ctx,path,obj);
		return;
	}
	
	if (!un(obj.trigger) && draw.ansMode == true && obj.trigger[0] == false && draw.showAns == false) return;
	
	if (!un(draw[obj.type]) && !un(draw[obj.type].draw)) {
		ctx.save();
		ctx.lineWidth = obj.thickness || obj.lineWidth || 2;
		ctx.strokeStyle = obj.lineColor || obj.strokeStyle || obj.color || '#000';
		ctx.fillStyle = obj.fillColor || obj.fillStyle || 'none';
		ctx.beginPath();
		draw[obj.type].draw(ctx,obj,path);
		ctx.restore();
		ctx.setLineDash([]);
		/*if (obj._erasers instanceof Array && obj._erasers.length > 0) {
			var padding = 20;
			var rect = draw[obj.type].getRect(obj);
			var l = rect[0]-padding;
			var t = rect[1]-padding;
			var w = rect[2]+padding*2;
			var h = rect[3]+padding*2;
			var canvas = draw.hiddenCanvas;
			canvas.width = w;
			canvas.height = h;
			var ctx2 = canvas.getContext('2d');
			ctx2.clearRect(0,0,w,h);
			ctx2.save();
			ctx2.translate(-l,-t);
			ctx2.lineWidth = obj.thickness || obj.lineWidth || 2;
			ctx2.strokeStyle = obj.lineColor || obj.strokeStyle || obj.color || '#000';
			ctx2.fillStyle = obj.fillColor || obj.fillStyle || 'none';
			ctx2.beginPath();
			draw[obj.type].draw(ctx2,obj,path);
			for (var e = 0; e < obj._erasers.length; e++) {
				var eraser = obj._erasers[e];
				if (!un(eraser._path) && eraser._path.vis === false) continue;
				draw.eraser.drawErasePath(ctx2,eraser);
			}
			ctx2.translate(l,t);
			ctx2.restore();
			ctx2.setLineDash([]);
			ctx.drawImage(canvas,0,0,w,h,l,t,w,h);
		} else {
			ctx.save();
			ctx.lineWidth = obj.thickness || obj.lineWidth || 2;
			ctx.strokeStyle = obj.lineColor || obj.strokeStyle || obj.color || '#000';
			ctx.fillStyle = obj.fillColor || obj.fillStyle || 'none';
			ctx.beginPath();
			draw[obj.type].draw(ctx,obj,path);
			ctx.restore();
			ctx.setLineDash([]);
		}*/
	}
}

//draw.objCacheImageMode = true;
function drawObjToCtxCacheMode(ctx,path,obj) {
	if (!un(obj.trigger) && draw.ansMode == true && obj.trigger[0] == false && draw.showAns == false) return;
	if (un(obj.type) || un(draw[obj.type])) return;
	
	updateCachedImage(obj);
	var image = obj._imageCache.image;
	var pos = obj._imageCache.pos;
	ctx.drawImage(image,pos[0],pos[1]);
	
	function updateCachedImage(obj) {
		var cachedObj = draw.clone(obj);
		if (!un(obj._imageCache) && !un(obj._imageCache.cachedObj) && isEqual(obj._imageCache.cachedObj,cachedObj) === true) return;
		
		var padding = 20;
		if (un(draw.hiddenCanvas)) draw.hiddenCanvas = createCanvas(0,0,50,50,false,false,false,0);
		var canvas = draw.hiddenCanvas;
		var rect = draw[obj.type].getRect(obj);
		var l = rect[0]-padding;
		var t = rect[1]-padding;
		var w = rect[2]+padding*2;
		var h = rect[3]+padding*2;
		canvas.width = l+w+100;
		canvas.height = t+h+100;
		//drawObjToCtx(canvas.ctx,obj._path,obj);
		
		var ctx = canvas.ctx;
		ctx.save();
		ctx.lineWidth = obj.thickness || obj.lineWidth || 2;
		ctx.strokeStyle = obj.lineColor || obj.strokeStyle || obj.color || '#000';
		ctx.fillStyle = obj.fillColor || obj.fillStyle || 'none';
		ctx.beginPath();
		draw[obj.type].draw(ctx,obj,path);
		ctx.restore();
		ctx.setLineDash([]);
		
		var cachedImageData = ctx.getImageData(l,t,w,h);
		
		var image = new Image();
		image.src = cachedImageData;
		
		obj._imageCache = {
			cachedObj:cachedObj,
			//cachedImageData:cachedImageData,
			image:image,
			padding:padding,
			pos:[l,t,w,h]
		};
	}
}
function clone(item) {
	return draw.clone(item);
}
draw.clone = function(item,keepUnderscoreProperties) {
	var refs = [];
	var refsNew = [];

	return clone(item);

	function cloneArray(a) {
		var keys = Object.keys(a);
		var a2 = new Array(keys.length)
		for (var i = 0; i < keys.length; i++) {
			var k = keys[i];
			var cur = a[k];
			if (typeof cur !== 'object' || cur === null) {
				a2[k] = cur;
			} else if (cur instanceof Date) {
				a2[k] = new Date(cur);
			} else {
				var index = refs.indexOf(cur);
				if (index !== -1) {
					a2[k] = refsNew[index];
				} else {
					a2[k] = clone(cur);
				}
			}
		}
		return a2;
	}

	function clone(o) {
		if (typeof o !== 'object' || o === null) return o;
		if (o instanceof Date) return new Date(o);
		if (Array.isArray(o)) return cloneArray(o);
		var o2 = {};
		refs.push(o);
		refsNew.push(o2);
		for (var k in o) {
			if (Object.hasOwnProperty.call(o, k) === false) continue;
			var cur = o[k];
			if (keepUnderscoreProperties !== true && k.slice(0,1) === '_') continue;
			if (typeof cur !== 'object' || cur === null) {
				o2[k] = cur;
			} else if (cur instanceof Date) {
				o2[k] = new Date(cur);
			} else {
				if (k.slice(0,1) === '_') continue;
				var i = refs.indexOf(cur);
				if (i !== -1) {
					o2[k] = refsNew[i];
				} else {
					o2[k] = clone(cur);
				}
			}
		}
		refs.pop();
		refsNew.pop();
		return o2;
	}
}

function drawSelectCanvas() { // movable draw canvas
	var canvas = draw.drawCanvas.last();
	//console.log(canvas);
	var ctx = canvas.ctx;
	ctx.clearRect(draw.drawArea[0],draw.drawArea[1],draw.drawArea[2],draw.drawArea[3]);
	if (draw.mode === 'interact') {
		return;
	}
	ctx.scale(draw.scale,draw.scale);
	var paths = selPaths();
	for (var p = 0; p < paths.length; p++) {
		var path = paths[p];
		/*if (draw.rotationMode == true && !un(path.rotation) && path.rotation !== 0) {
			ctx.translate(path.border[0]+0.5*path.border[2],path.border[1]+0.5*path.border[3]);
			ctx.rotate(path.rotation);
			ctx.translate(-path.border[0]-0.5*path.border[2],-path.border[1]-0.5*path.border[3]);	
		}*/
		if (draw.mode !== 'interact') {
			drawBorderButtons(path);
			ctx.strokeStyle = draw.selectColor;
			ctx.lineWidth = 1;
			if (!un(path.border) && path.selectable !== false) ctx.strokeRect(path.border[0],path.border[1],path.border[2],path.border[3]);
		}
		if (!un(draw.controlPanel) && paths.length == 1 && path.obj.length == 1 && ['three','qBox'].indexOf(path.obj[0].type) > -1) draw.controlPanel.draw(ctx,path.obj[0],path);
		/*if (draw.rotationMode == true) {
			ctx.beginPath();
			ctx.moveTo(path.border[0]+0.5*path.border[2],path.border[1]);
			ctx.lineTo(path.border[0]+0.5*path.border[2],path.border[1]-30);
			ctx.stroke();
			ctx.fillStyle = draw.selectColor;
			ctx.beginPath();
			ctx.arc(path.border[0]+0.5*path.border[2],path.border[1]-30,10,0,2*Math.PI);
			ctx.fill();
		}*/
		//draw center lines
		/*ctx.beginPath();
		ctx.moveTo(path.border[0]+0.5*path.border[2],path.border[1]);
		ctx.lineTo(path.border[0]+0.5*path.border[2],path.border[1]+path.border[3]);
		ctx.moveTo(path.border[0],path.border[1]+0.5*path.border[3]);
		ctx.lineTo(path.border[0]+path.border[2],path.border[1]+0.5*path.border[3]);
		ctx.stroke();*/
		/*if (draw.rotationMode == true && !un(path.rotation) && path.rotation !== 0) {
			ctx.translate(path.border[0]+0.5*path.border[2],path.border[1]+0.5*path.border[3]);
			ctx.rotate(-path.rotation);
			ctx.translate(-path.border[0]-0.5*path.border[2],-path.border[1]-0.5*path.border[3]);	
		}*/
	}
	//if (!un(draw.controlPanel2) && !un(draw.controlPanel2.ctx)) draw.controlPanel2.draw();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	//console.log('-----');
}
function drawSelectCanvas2(){ // static draw canvas
	var canvas = draw.drawCanvas[draw.drawCanvas.length-2];
	var ctx = canvas.ctx;
	ctx.clearRect(draw.drawArea[0],draw.drawArea[1],draw.drawArea[2],draw.drawArea[3]);
	if (draw.mode === 'interact') {
		if (draw.drawMode == 'zoomRect') {
			ctx.save();
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			if (!ctx.setLineDash) {ctx.setLineDash = function () {}}
			ctx.setLineDash([5,5]);
			ctx.strokeRect(draw.zoomRect[0],draw.zoomRect[1],draw.zoomRect[2],draw.zoomRect[3]);	
			ctx.setLineDash([]);
			ctx.restore();
			return;
		} else if (draw.drawMode == 'snip') {
			var page = pages[pIndex];
			if (!un(page._snips)) {
				for (var s = 0; s < page._snips.length; s++) {
					var snip = page._snips[s];
					var rect = snip.snipRect;
					ctx.save();
					ctx.strokeStyle = '#00F';
					ctx.fillStyle = colorA('#CCF',0.5);
					ctx.lineWidth = 1;
					ctx.fillRect(rect[0],rect[1],rect[2],rect[3]);	
					ctx.strokeRect(rect[0],rect[1],rect[2],rect[3]);
					
					snip._closeRect = [rect[0]+rect[2]-50,rect[1]+10,40,40];
					text({ctx:ctx,rect:snip._closeRect,text:[times],fontSize:40,bold:true,align:[0,0],color:'#F00',box:{type:'loose',borderColor:'#000',borderWidth:2,color:'#FFF'}});
					
					ctx.restore();
				}
			}
			return;
		} else if (draw.drawMode == 'snipRect') {
			ctx.save();
			ctx.strokeStyle = '#00F';
			ctx.lineWidth = 1;
			if (!ctx.setLineDash) {ctx.setLineDash = function () {}}
			ctx.setLineDash([5,5]);
			ctx.strokeRect(draw.snipRect[0],draw.snipRect[1],draw.snipRect[2],draw.snipRect[3]);	
			ctx.setLineDash([]);
			ctx.restore();
			return;
		}
		calcCursorPositions();			
		return;
	}	
	ctx.scale(draw.scale,draw.scale);
	//ctx.fillStyle = colorA('#F00',0.2);
	//ctx.fillRect(draw.drawArea[0],draw.drawArea[1],draw.drawArea[2],draw.drawArea[3]);
	
	if (draw.appearMoveMode == true && ctrlOn !== true) {
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		ctx.beginPath();
		for (var x = 0; x < draw.drawArea[2]; x += 10) {
			ctx.moveTo(x,0);
			ctx.lineTo(x,draw.drawArea[3]);
		}
		for (var y = 0; y < draw.drawArea[3]; y += 10) {
			ctx.moveTo(0,y);
			ctx.lineTo(draw.drawArea[2],y);
		}
		ctx.stroke();
		ctx.lineWidth = 3;
		ctx.beginPath();
		for (var x = 0; x < draw.drawArea[2]; x += 100) {
			ctx.moveTo(x,0);
			ctx.lineTo(x,draw.drawArea[3]);
		}
		for (var y = 0; y < draw.drawArea[3]; y += 100) {
			ctx.moveTo(0,y);
			ctx.lineTo(draw.drawArea[2],y);
		}
		ctx.stroke();

	}
	if (draw.mode == 'edit' && draw.appearMode == true) { // draw appear button positions
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (un(path.appear)) continue;
			if (un(path.border)) updateBorder(path);
			if (un(path.border)) continue;
			if (!un(path.appear.pos)) {
				var l = path.appear.pos[0]-20;
				var t = path.appear.pos[1]-20;
			} else if (!un(path.appear.relPos)) {
				if (un(path.border)) updateBorder(path);
				if (un(path.border)) continue;
				var l = path.border[0] + path.appear.relPos[0]-20;
				var t = path.border[1] + path.appear.relPos[1]-20;
			} else {
				if (un(path.border)) updateBorder(path);
				if (un(path.border)) continue;
				var l = path.border[0]+0.5*path.border[2]-20;
				var t = path.border[1]+0.5*path.border[3]-20;
			}
			if (path.appear.type === 'info') {
				var color = '#6AF';
				if (path.selected == true) {
					text({ctx:ctx,rect:[l,t,40,40],align:[0,0],fontSize:36,font:'algebra',text:['i'],color:'#FFF',box:{type:'loose',color:color,borderColor:color,borderWidth:2,radius:20}});
				} else {
					text({ctx:ctx,rect:[l,t,40,40],align:[0,0],fontSize:36,font:'algebra',text:['i'],color:color,box:{type:'loose',color:'#FFF',borderColor:color,borderWidth:2,radius:20}});
				}
			} else {
				w = 40; h = 40;
				var colors = ['#96C','#C9F','#FFF'];
				if (!un(path.appear.color)) {
					colors[1] = path.appear.color;
					var col = colors[1].split('');
					for (var i = 1; i < 4; i++) {
						col[i] = {'0':'0','1':'0','2':'0','3':'0','4':'1','5':'2','6':'3','7':'4','8':'5','9':'6','A':'7','B':'8','C':'9','D':'A','E':'B','F':'C'}[col[i]];
					}
					colors[0] = col.join('');
				}
				if (path.selected == true) {
					ctx.fillStyle = colorA(colors[0],0.66);
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.fillStyle = colors[2];
					drawStar({ctx:ctx,center:[l+0.5*w,t+0.5*h],radius:0.4*Math.min(w,h),points:5});
					ctx.fill();
				} else {
					ctx.fillStyle = colorA(colors[0],0.33);
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.fillStyle = colors[2];
					drawStar({ctx:ctx,center:[l+0.5*w,t+0.5*h],radius:0.4*Math.min(w,h),points:5});
					ctx.fill();
				}
			}
		}
	}
	
	if (draw.drawMode == 'selectRect') {
		ctx.save();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		if (!ctx.setLineDash) {ctx.setLineDash = function () {}}
		ctx.setLineDash([5,5]);
		ctx.strokeRect(draw.selectRect[0],draw.selectRect[1],draw.selectRect[2],draw.selectRect[3]);	
		ctx.setLineDash([]);
		ctx.restore();
	} else if (draw.drawMode == 'zoomRect') {
		ctx.save();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		if (!ctx.setLineDash) {ctx.setLineDash = function () {}}
		ctx.setLineDash([5,5]);
		ctx.strokeRect(draw.zoomRect[0],draw.zoomRect[1],draw.zoomRect[2],draw.zoomRect[3]);	
		ctx.setLineDash([]);
		ctx.restore();
	}
	/*if (draw.showSnapPoints == true) {
		ctx.fillStyle = '#F00';
		for (var i = 0; i < draw.snapPoints.length; i++) {
			ctx.beginPath();
			//console.log(draw.snapPoints[i][0],draw.snapPoints[i][1]);
			ctx.arc(draw.snapPoints[i][0],draw.snapPoints[i][1],5,0,2*Math.PI);
			ctx.fill();
		}
	}*/
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	calcCursorPositions();	
	
	if (draw.mode === 'edit' && !un(draw.contextMenu)) draw.contextMenu.update();
}
function drawBorderButtons(path) {
	if (un(path.borderButtons)) return;
	var buttons = path.borderButtons;
	var canvas = draw.drawCanvas.last();
	var ctx = canvas.ctx;
	for (var i = 0; i < buttons.length; i++) {
		if (un(buttons[i].dims)) continue;
		var l = buttons[i].dims[0];
		var t = buttons[i].dims[1];
		var w = buttons[i].dims[2];
		var h = buttons[i].dims[3];
		var path = draw.path[buttons[i].pathNum];
		if (typeof buttons[i].draw == 'function') {
			buttons[i].draw(path,ctx,l,t,w,h,buttons[i]);
			continue;
		}
		switch (buttons[i].buttonType) {
			case 'isInput-type':
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['<<fontSize:16>>'+buttons[i].type],box:{type:'loose',color:'#F96',borderColor:'#F96'}});
				break;
			case 'isInput-dragArea-snapToggle':
				if (selPaths().length > 1) break;
				var snap = boolean(path.interact.snap,false);
				if (snap == true) {
					ctx.fillStyle = '#00F';
					var txt = 'snap';
				} else {
					ctx.fillStyle = '#FFF';
					var txt = 'no snap';
				}
				ctx.fillRect(l,t,w,h);
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#00F';
				ctx.strokeRect(l,t,w,h);
				var textColor = snap == true ? '#FFF' : '#00F';
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['<<color:'+textColor+'>><<fontSize:'+(h*0.75)+'>>'+txt]});
				break;
			case 'isInput-drag-id':
				if (selPaths().length > 1) break;
				var path = draw.path[buttons[i].pathNum];
				var id = !un(path.id) && path.id !== "" ? path.id : '-';
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['ID: '+id],fontSize:16,box:{type:'loose',color:'#69F',borderColor:'#69F'}});
				break;
			case 'isInput-drag-value':
				if (selPaths().length > 1) break;
				var path = draw.path[buttons[i].pathNum];
				var value = draw.taskQuestion.drag.getDragValue(path);
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['Value: '].concat(value),fontSize:16,box:{type:'loose',color:'#69F',borderColor:'#69F'}});
				break;
			case 'isInput-drag-match':
				if (selPaths().length > 1) break;
				var path = draw.path[buttons[i].pathNum];
				var match = !un(path.interact.match) && path.interact.match !== "" ? path.interact.match : '-';
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['Match: '+match],fontSize:16,box:{type:'loose',color:'#F96',borderColor:'#F96'}});
				break;
			case 'isInput-drag-shuffleToggle':
				var path = draw.path[buttons[i].pathNum];
				var shuffle = boolean(path.interact.shuffle,false);
				if (shuffle == true) {
					ctx.fillStyle = '#00F';
					ctx.fillRect(l,t,w,h);
					var color = '#FFF';
				} else {
					var color = '#00F';
				}
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#00F';
				ctx.strokeRect(l,t,w,h);
				var textColor = shuffle == true ? '#FFF' : '#00F';
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['<<color:'+textColor+'>><<fontSize:'+(h*0.75)+'>>shuffle']});
				break;
			case 'select-input-selColors':
				var colors = buttons[i].selColors;
				ctx.fillStyle = colors[0];
				ctx.beginPath();
				ctx.moveTo(l,t);
				ctx.lineTo(l+w,t);
				ctx.lineTo(l,t+h);
				ctx.lineTo(l,t);
				ctx.fill();
				ctx.fillStyle = colors[1];
				ctx.beginPath();
				ctx.moveTo(l,t+w);
				ctx.lineTo(l+w,t+h);
				ctx.lineTo(l+w,t);
				ctx.lineTo(l,t+w);
				ctx.fill();
				break;
			case 'select-input-shuffleToggle':
				var path = draw.path[buttons[i].pathNum];
				var shuffle = boolean(path.isInput.shuffle,false);
				if (shuffle == true) {
					ctx.fillStyle = '#00F';
					ctx.fillRect(l,t,w,h);
					var color = '#FFF';
				} else {
					var color = '#00F';
				}
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#00F';
				ctx.strokeRect(l,t,w,h);
				var textColor = shuffle == true ? '#FFF' : '#00F';
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['<<color:'+textColor+'>><<fontSize:'+(h*0.75)+'>>shuffle']});
				break;
			case 'select-input-cellToggle':
				var cell = draw.path[buttons[i].pathNum].obj[0].cells[buttons[i].row][buttons[i].col];
				if (cell.answerValue == true) {
					ctx.fillStyle = '#060';
					ctx.fillRect(l,t,w,h);
					var color = '#FFF';
				} else {
					ctx.fillStyle = '#FFF';
					ctx.fillRect(l,t,w,h);
					var color = '#060';
				}
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#060';
				ctx.strokeRect(l,t,w,h);
				drawTick(ctx,w*0.8,h,color,l+w*0.1,t,w*0.1);
				break;
			case 'text-input-prevAns':
				drawArrow({ctx:ctx,startX:l+0.75*w,startY:t+0.5*h,finX:l+0.25*w,finY:t+0.5*h,arrowLength:0.5*w,color:'#393',lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.5});
				break;
			case 'text-input-ansInfo':
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['<<fontSize:16>>'+buttons[i].text]});
				break;				
			case 'text-input-nextAns':
				drawArrow({ctx:ctx,startX:l+0.25*w,startY:t+0.5*h,finX:l+0.75*w,finY:t+0.5*h,arrowLength:0.5*w,color:'#393',lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.5});
				break;
			case 'text-input-algText':
				if (buttons[i].algText) {
					ctx.fillStyle = colorA('#393',0.5);
					ctx.fillRect(l,t,w,h);
				}
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['<<fontSize:16>><<font:algebra>>x']});
				break;
			case 'text-input-num':
				if(buttons[i].num) {
					ctx.fillStyle = colorA('#393',0.5);
					ctx.fillRect(l,t,w,h);
				}
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['<<fontSize:16>>#']});				
				break;
			case 'text-input-oe':
				if(buttons[i].oe) {
					ctx.fillStyle = colorA('#393',0.5);
					ctx.fillRect(l,t,w,h);
				}
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['<<fontSize:13>>oe']});				
				break;
			case 'text-input-tickStyle':
				drawTick(ctx,w*0.8,w,'#060',l+w*0.1,t,w*(7/40));
				break;
			case 'resize':
			case 'resize-path':
				ctx.fillStyle = colorA(draw.selectColor,0.5);
				ctx.fillRect(l,t,w,h);
				drawArrow({ctx:ctx,startX:l+0.2*w,startY:t+0.2*h,finX:l+0.8*w,finY:t+0.8*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});
				drawArrow({ctx:ctx,finX:l+0.2*w,finY:t+0.2*h,startX:l+0.8*w,startY:t+0.8*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});
				break;
			case 'text-horizResize':
				ctx.fillStyle = colorA(draw.selectColor,0.5);
				ctx.fillRect(l,t,w,h);
				drawArrow({ctx:ctx,startX:l+0.2*w,startY:t+0.5*h,finX:l+0.8*w,finY:t+0.5*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});
				drawArrow({ctx:ctx,finX:l+0.2*w,finY:t+0.5*h,startX:l+0.8*w,startY:t+0.5*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});					
				break;
			case 'text2-fracScale':
				ctx.fillStyle = colorA('#69F',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.fillStyle = '#000';
				ctx.fillRect(l+0.4*w,t+0.15*w,0.2*w,0.2*w);
				ctx.fillRect(l+0.4*w,t+0.65*w,0.2*w,0.2*w);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(l+0.32*w,t+0.5*h);
				ctx.lineTo(l+0.68*w,t+0.5*h);
				ctx.stroke();//text({ctx:ctx,rect:[l,t,w,h*0.9],align:[0,0],text:['<<fontSize:13>>',['frac',[String.fromCharCode(0x25A0)],[String.fromCharCode(0x25A0)]]]});
				break;
			case 'text2-underline':
				ctx.fillStyle = colorA('#FFC',0.5);
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,rect:[l,t,w,h*0.9],align:[0,0],text:['<<fontSize:13>>u']});
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(l+0.32*w,t+0.8*h);
				ctx.lineTo(l+0.68*w,t+0.8*h);
				ctx.stroke();
				break;
			case 'text2-algPadding':
				var obj = path.obj[0];
				if (un(obj.algPadding)) {
					ctx.strokeStyle = colorA('#F9C',0.5);
					ctx.lineWidth = 1;
					ctx.strokeRect(l,t,w,h);
					text({ctx:ctx,rect:[l,t,w,h*0.9],align:[0,0],text:['<<fontSize:13>>-'],algPadding:0});
				} else {
					ctx.fillStyle = colorA('#F9C',0.5);
					ctx.fillRect(l,t,w,h);
					text({ctx:ctx,rect:[l,t,w,h*0.9],align:[0,0],text:['<<fontSize:13>>'+obj.algPadding],algPadding:0});
				}
				break;
			case 'table2-draw.table2.questionFit':
			case 'text2-fullWidth':
				ctx.fillStyle = colorA('#9FC',0.5);
				ctx.fillRect(l,t,w,h);
				drawArrow({ctx:ctx,startX:l+0.2*w,startY:t+0.5*h,finX:l+0.8*w,finY:t+0.5*h,arrowLength:4,color:'#000',lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});
				drawArrow({ctx:ctx,finX:l+0.2*w,finY:t+0.5*h,startX:l+0.8*w,startY:t+0.5*h,arrowLength:4,color:'#000',lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});
				break;
			case 'table2-draw.table2.questionGrid':
				ctx.fillStyle = colorA('#9CF',0.5);
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['<<fontSize:12>>(a)']});
				break;						
			
			case 'text-horizResizeCollapse' :
				ctx.fillStyle = colorA('#F0F',0.5);
				ctx.fillRect(l,t,w,h);
				drawArrow({ctx:ctx,finX:l+0.2*w,finY:t+0.5*h,startX:l+0.8*w,startY:t+0.5*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});					
				break;
			case 'text-vertResizeCollapse' :
				ctx.fillStyle = colorA('#F0F',0.5);
				ctx.fillRect(l,t,w,h);
				drawArrow({ctx:ctx,finX:l+0.5*w,finY:t+0.2*h,startX:l+0.5*w,startY:t+0.8*h,arrowLength:4,color:mainCanvasFillStyle,lineWidth:2,fillArrow:true,doubleEnded:false,angleBetweenLinesRads:0.7});					
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
			case 'appear':
			case 'appear-button':
			case 'trigger':
			case 'triggerTableCell':
				var reversible = false;
				if (buttons[i].buttonType == 'appear') {
					var vis = un(path.appear) && path.questionTip !== true ? true : false;
					if (!un(path.appear) && path.appear.reversible === true) reversible = true;
				} else if (buttons[i].buttonType == 'appearButton') {
					var vis = true;
				} else {
					if (buttons[i].buttonType == 'trigger') {
						var trigger = path.trigger;
					} else if (buttons[i].buttonType == 'triggerTableCell') {
						var trigger = path.obj[0].cells[buttons[i].r][buttons[i].c].trigger;					
					}
					var vis = true;
					if (typeof trigger == 'object') {
						for (var m = 0; m <= draw.triggerNum; m++) {
							if (typeof trigger[m] == 'boolean' && trigger[m] == true) {
								vis = true;
							} else if (typeof trigger[m] == 'boolean' && trigger[m] == false) {
								vis = false;
							}
						}
					}
				}
				var color = reversible == true ? '#F00' : '#96C';
				if (vis == true) {
					ctx.fillStyle = colorA(color,0.5);
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.fillStyle = mainCanvasFillStyle;
					drawStar({ctx:ctx,center:[l+0.5*w,t+0.5*h],radius:0.4*Math.min(w,h),points:5});
					ctx.fill();
				} else {
					ctx.strokeStyle = colorA(color,0.5);
					ctx.strokeRect(l,t,w,h);
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.fillStyle = colorA(color,0.5);
					drawStar({ctx:ctx,center:[l+0.5*w,t+0.5*h],radius:0.4*Math.min(w,h),points:5});
					ctx.fill();
				}
				break;	
			case 'toggle-draggable':
				if (!un(path.interact) && path.interact.draggable == true) {
					ctx.strokeStyle = colorA('#393',0.5);
					ctx.strokeRect(l,t,w,h);
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.fillStyle = colorA('#393',0.5);
					drawStar({ctx:ctx,center:[l+0.5*w,t+0.5*h],radius:0.4*Math.min(w,h),points:5});
					ctx.fill();
				} else {
					ctx.fillStyle = colorA('#393',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.fillStyle = mainCanvasFillStyle;
					drawStar({ctx:ctx,center:[l+0.5*w,t+0.5*h],radius:0.4*Math.min(w,h),points:5});
					ctx.fill();
				}
				break;
			case 'toggle-notesOverlay':
				if (path.notesOverlay === true) {
					ctx.strokeStyle = colorA('#C60',0.5);
					ctx.strokeRect(l,t,w,h);
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.fillStyle = colorA('#C60',0.5);
					drawStar({ctx:ctx,center:[l+0.5*w,t+0.5*h],radius:0.4*Math.min(w,h),points:5});
					ctx.fill();
				} else {
					ctx.fillStyle = colorA('#C60',0.5);
					ctx.fillRect(l,t,w,h);
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.fillStyle = mainCanvasFillStyle;
					drawStar({ctx:ctx,center:[l+0.5*w,t+0.5*h],radius:0.4*Math.min(w,h),points:5});
					ctx.fill();
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
			case 'table2-paddingVMinus':
			case 'table2-paddingHMinus':
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
			case 'table2-paddingVPlus':
			case 'table2-paddingHPlus':
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
				var obj = path.obj[0];
				ctx.fillStyle = obj._interactMode == 'plot' ? colorA('#00F',0.5) : colorA('#99F',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l,t,w,h);
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(l+0.3*w,t+0.3*h);
				ctx.lineTo(l+0.7*w,t+0.7*h);
				ctx.moveTo(l+0.3*w,t+0.7*h);
				ctx.lineTo(l+0.7*w,t+0.3*h);
				ctx.stroke();
				break;
			case 'grid-lineSegment':
				ctx.fillStyle = obj._interactMode == 'lineSegment' ? colorA('#00F',0.5) : colorA('#99F',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.strokeRect(l,t,w,h);
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
				ctx.fillStyle = obj._interactMode == 'line' ? colorA('#00F',0.5) : colorA('#99F',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l,t,w,h);
				ctx.beginPath();
				ctx.moveTo(l,t+0.3*h);
				ctx.lineTo(l+w,t+0.7*h);
				ctx.stroke();
				break;	
			case 'grid-undo':
				ctx.fillStyle = colorA('#99F',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l,t,w,h);
				text({ctx:ctx,textArray:['<<fontSize:'+(w*0.4)+'>>undo'],left:l,top:t,width:w,height:h,align:[0,0]});
				break;
			case 'grid-clear':
				ctx.fillStyle = colorA('#99F',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.strokeRect(l,t,w,h);
				text({ctx:ctx,textArray:['<<fontSize:'+(w*0.4)+'>>CLR'],left:l,top:t,width:w,height:h,align:[0,0]});
				break;
			case 'grid-function':
				ctx.fillStyle = colorA('#99F',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.strokeRect(l,t,w,h);
				text({ctx:ctx,textArray:['<<font:algebra>><<fontSize:'+(w*0.5)+'>>f(x)'],left:l,top:t,width:w,height:h,align:[0,0]});
				break;				
			case 'grid-showGrid':
				if (path.obj.length == 1 && path.obj[0].type == 'grid') {
					if (typeof path.obj[0].showGrid == 'undefined' || path.obj[0].showGrid == true) {
						ctx.fillStyle = colorA('#F96',0.5);
						ctx.fillRect(l,t,w,h);
					}
					ctx.strokeStyle = colorA('#000',0.5);
					ctx.strokeRect(l,t,w,h);
					ctx.strokeStyle = '#000';					
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
				if (path.obj.length == 1 && (path.obj[0].type == 'grid' || path.obj[0].type == 'numberline')) {
					if (typeof path.obj[0].showScales == 'undefined' || path.obj[0].showScales == true) {
						ctx.fillStyle = colorA('#F96',0.5);
						ctx.fillRect(l,t,w,h);
					}				
					ctx.strokeStyle = colorA('#000',0.5);
					ctx.strokeRect(l,t,w,h);
					text({ctx:ctx,textArray:['<<fontSize:'+(w/2)+'>>123'],left:l,top:t,width:w,height:h,textAlign:'center',vertAlign:'middle'});
				}
				break;
			case 'grid-showLabels':
				if (path.obj.length == 1 && path.obj[0].type == 'grid') {
					if (typeof path.obj[0].showLabels == 'undefined' || path.obj[0].showLabels == true) {
						ctx.fillStyle = colorA('#F96',0.5);
						ctx.fillRect(l,t,w,h);
					}		
					ctx.strokeStyle = colorA('#000',0.5);
					ctx.strokeRect(l,t,w,h);
					text({ctx:ctx,textArray:['<<fontSize:'+(w/2)+'>><<font:algebra>>xy'],left:l,top:t,width:w,height:h,textAlign:'center',vertAlign:'middle'});
				}
				break;
			case 'grid-showBorder':
				if (path.obj.length == 1 && path.obj[0].type == 'grid') {
					if (typeof path.obj[0].showBorder == 'undefined' || path.obj[0].showBorder == true) {
						ctx.fillStyle = colorA('#F96',0.5);
						ctx.fillRect(l,t,w,h);
					}		
					ctx.strokeStyle = colorA('#000',0.5);
					ctx.strokeRect(l,t,w,h);
					ctx.strokeStyle = '#000';	
					ctx.lineWidth = 2;
					ctx.strokeRect(l+w*0.2,t+h*0.2,w*0.6,h*0.6);
				}
				break;
			case 'grid-originStyle':
				if (path.obj.length == 1 && path.obj[0].type == 'grid') {
					if (typeof path.obj[0].originStyle == 'undefined' || path.obj[0].originStyle == 'circle') {
						ctx.fillStyle = colorA('#F96',0.5);
						ctx.fillRect(l,t,w,h);
					}		
					ctx.strokeStyle = colorA('#000',0.5);
					ctx.strokeRect(l,t,w,h);
					ctx.strokeStyle = '#000';	
					ctx.lineWidth = 2;
					text({ctx:ctx,textArray:['<<fontSize:'+(w/3)+'>><<font:algebra>>(0,0)'],left:l,top:t,width:w,height:h,textAlign:'center',vertAlign:'middle'});

				}
				break;
			case 'simpleGrid-xPlus':				
			case 'simpleGrid-yPlus':				
				ctx.strokeStyle = mainCanvasFillStyle;
				ctx.fillStyle = colorA('#F0F',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.beginPath();
				ctx.moveTo(l+0.3*w,t+0.5*h);
				ctx.lineTo(l+0.7*w,t+0.5*h);
				ctx.moveTo(l+0.5*w,t+0.3*h);
				ctx.lineTo(l+0.5*w,t+0.7*h);
				ctx.stroke();				
				break;
			case 'simpleGrid-xMinus':				
			case 'simpleGrid-yMinus':								
				ctx.strokeStyle = mainCanvasFillStyle;
				ctx.fillStyle = colorA('#F0F',0.5);
				ctx.fillRect(l,t,w,h);
				ctx.beginPath();
				ctx.moveTo(l+0.3*w,t+0.5*h);
				ctx.lineTo(l+0.7*w,t+0.5*h);
				ctx.stroke();				
				break;
		}
	}
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

draw.closeDropMenus = function(exception) {
	var dropMenus = draw.objsOfType('dropMenu');
	var changed = false;
	for (var d = 0; d < dropMenus.length; d++) {
		if (exception === dropMenus[d]) continue;
		if (dropMenus[d]._open !== false) {
			dropMenus[d]._open = false;
			changed = true;
		}
	}
	var starterQuestions = draw.objsOfType('starterQuestion');
	for (var d = 0; d < starterQuestions.length; d++) {
		if (exception === starterQuestions[d]) continue;
		if (starterQuestions[d]._optionsDropdownOpen === true) {
			starterQuestions[d]._optionsDropdownOpen = false;
			changed = true;
		}
		if (starterQuestions[d]._options2DropdownOpen === true) {
			starterQuestions[d]._options2DropdownOpen = false;
			changed = true;
		}
	}
	var grid3s = draw.objsOfType('grid3');
	for (var g = 0; g < grid3s.length; g++) {
		var grid3 = grid3s[g];
		if (exception === grid3) continue;
		if (grid3._showColorPicker === true) {
			grid3._showColorPicker = false;
			changed = true;
		}
		if (grid3.path instanceof Array === false) continue;
		for (var p = 0; p < grid3.path.length; p++) {
			if (grid3.path[p]._colorPicker === true) {
				delete grid3.path[p]._colorPicker;
				changed = true;
			}
		}
	}
	if (!un(teach.drawButtons)) {
		if ((!un(teach.drawButtons.colorPicker) && teach.drawButtons.colorPicker.visible !== true) || (!un(teach.drawButtons.lineWidthPicker) && teach.drawButtons.lineWidthPicker.visible !== true)) {
			teach.drawButtons.colorPicker.visible = false;
			teach.drawButtons.lineWidthPicker.visible = false;
			teach.drawButtons.update();
		}
	}
	return changed;
}
draw.scrollStart = function(e) {
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		if (typeof path.onBackgroundClick === 'function') {
			path.onBackgroundClick(path);
		}
		for (var i = 0; i < path.obj.length; i++) {
			var obj = path.obj[i];
			if (typeof obj.onBackgroundClick === 'function') {
				obj.onBackgroundClick(obj);				
			}
		}
	}
	drawCanvasPaths();
	if (typeof draw.canvasMouse === 'undefined') return;
	draw._scroll = {
		startCanvasMouse:[draw.canvasMouse[0],draw.canvasMouse[1]],
		startScrollLeft:draw.div.scrollLeft,
		startScrollTop:draw.div.scrollTop
	};
	addListenerMove(window,draw.scrollMove);
	addListenerEnd(window,draw.scrollEnd);
	
	//console.log('startCanvasMouse',draw._scroll.startCanvasMouse[1]);
	//console.log('startScrollTop',draw._scroll.startScrollTop[1]);
}
draw.scrollMove = function(e) {
	updateMouse(e);
	
	//var dx = draw._scroll.startCanvasMouse[0] - draw.canvasMouse[0];
	//var dy = draw._scroll.startCanvasMouse[0] - draw.canvasMouse[0];
	//draw.div.scrollLeft = dx < 20 ? draw._scroll.startScrollLeft : draw._scroll.startScrollLeft + (draw._scroll.startCanvasMouse[0] - draw.canvasMouse[0]);
	//draw.div.scrollTop = dy < 20 ? draw._scroll.startScrollTop : draw._scroll.startScrollTop + (draw._scroll.startCanvasMouse[1] - draw.canvasMouse[1]);
	
	draw.div.scrollLeft = draw._scroll.startScrollLeft + (draw._scroll.startCanvasMouse[0] - draw.canvasMouse[0]);
	draw.div.scrollTop = draw._scroll.startScrollTop + (draw._scroll.startCanvasMouse[1] - draw.canvasMouse[1]);
	
	//console.log('draw.mouse',draw.mouse[1]);
	//console.log('canvasMouse',draw.canvasMouse[1]);
	//console.log('canvasMouse relative',draw._scroll.startCanvasMouse[1] - draw.canvasMouse[1]);
	//console.log('scrollTop',draw.div.scrollTop);
	
}
draw.scrollEnd = function(e) {
	delete draw._scroll;
	removeListenerMove(window,draw.scrollMove);
	removeListenerEnd(window,draw.scrollEnd);
}

draw.onScrollWheel = function(e) {
	updateMouse(e);
	var positions = draw.getScrollWheelPositions();
	var hit = false;
	for (var p = 0; p < positions.length; p++) {
		var pos = positions[p];
		if (draw.cursorPosHitTest(pos,draw.mouse[0],draw.mouse[1]) === true) hit = pos;
	}
	if (hit !== false) {
		e.preventDefault();
		if (typeof hit.func === 'function') {
			hit.func(pos,e.deltaY);
			drawCanvasPaths();
		}
		return false;
	}
}
draw.getScrollWheelPositions = function() {
	var positions = [];
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			if (!un(obj.type) && !un(draw[obj.type]) && typeof draw[obj.type].getScrollWheelPositions === 'function') {
				positions = positions.concat(draw[obj.type].getScrollWheelPositions(obj));
			}
		}
	}
	return positions;
}

function calcCursorPositions() {
	draw.updateAllBorders();
	var pos = [];
	if (un(draw.cursors)) draw.cursors = {default:'default'};
	
	if (draw.mode === 'interact' && draw.div.style.overflow !== 'hidden') {
		pos.push({shape:'rect',dims:[0,0,draw.drawArea[2],draw.drawArea[3]],cursor:draw.cursors.default,allowDefault:true,func:draw.scrollStart});
	} else {
		pos.push({shape:'rect',dims:[0,0,draw.drawArea[2],draw.drawArea[3]],cursor:draw.cursors.default});
	}
	
	switch (draw.drawMode) {
		case 'grid-drawLineSegment':
		case 'grid-drawLineSegmentPoints':
			for (var p = 0; p < draw.path.length; p++) {
				var path = draw.path[p];
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (['grid','simpleGrid'].includes(obj.type)) {
						pos.push({shape:'rect',dims:[obj.left-20,obj.top-20,obj.width+40,obj.height+40],cursor:'url('+draw.lineCursor+') '+draw.lineCursorHotspot[0]+' '+draw.lineCursorHotspot[1]+', auto',func:draw.grid.gridPathStart,obj:obj,highlight:-1,mode:draw.drawMode});
					}
				}
			}
			break;
		case 'grid-move':
			for (var p = 0; p < draw.path.length; p++) {
				var path = draw.path[p];
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (['grid','simpleGrid'].includes(obj.type)) {
						pos.push({shape:'rect',dims:[obj.left-20,obj.top-20,obj.width+40,obj.height+40],cursor:draw.cursors.move1,func:draw.grid.moveStart,obj:obj,highlight:-1,mode:draw.drawMode});
					}
				}
			}
			break;
		case 'floodFill':
			pos.push({shape:'rect',dims:draw.drawArea,cursor:draw.cursors.fill,func:drawClickFloodFillClick,highlight:-1});
			break;
		case 'interactText':
			pos.push({shape:'rect',dims:draw.drawArea,cursor:draw.cursors.text,func:drawClickStartDraw,highlight:-1});
			break;
		case 'pen':
		case 'eraser':
			var drawArea = draw.drawArea;
			if (!un(draw._drawToolsCurrentTaskQuestion)) drawArea = draw._drawToolsCurrentTaskQuestion._drawArea;
			pos.push({shape:'rect',dims:drawArea,cursor:draw.cursors[draw.drawMode],func:drawClickStartDraw,highlight:-1});
			break;
		case 'line':
		case 'rect':
		case 'square':
		case 'circle':
		case 'ellipse':
		case 'polygon':
		case 'point':
			var drawArea = draw.drawArea;
			if (!un(draw._drawToolsCurrentTaskQuestion)) drawArea = draw._drawToolsCurrentTaskQuestion._drawArea;
			if (un(draw.lineCursor) || un(draw.lineCursorHotspot)) draw.cursors.update();
			pos.push({shape:'rect',dims:drawArea,cursor:'url('+draw.lineCursor+') '+draw.lineCursorHotspot[0]+' '+draw.lineCursorHotspot[1]+', auto',func:drawClickStartDraw,highlight:-1});
			break;
		case 'grid-resize':
			for (var i = 0; i < draw.path.length; i++) {
				var path = draw.path[i];
				if (path.selected == true) {	
					var obj = path.obj[0];
					pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw.cursors.move1,func:drawClickGridStartDrag,pathNum:i});
					pos.push({shape:'rect',dims:[obj.xZero-15,obj.top,30,obj.height],cursor:draw.cursors.ns,func:drawClickGridStartRescaleY,pathNum:i});
					pos.push({shape:'rect',dims:[obj.left,obj.yZero-15,obj.width,30],cursor:draw.cursors.ew,func:drawClickGridStartRescaleX,pathNum:i});	

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
			for (var i = 0; i < draw.path.length; i++) {
				var path = draw.path[i];
				if (path.selected == true) {	
					var obj = path.obj[0];
					pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw.cursors.pointer,func:drawClickGridPlotPoint,pathNum:i});

					if (path.borderButtons !== 'undefined') {
						for (var j = 0; j < path.borderButtons.length; j++) {
							if (path.borderButtons[j].buttonType == 'grid-plot') pos.push(path.borderButtons[j]);
						}
					}
				}
			}				
			break;
		case 'grid-lineSegment':
			for (var i = 0; i < draw.path.length; i++) {
				var path = draw.path[i];
				if (path.selected == true) {	
					var obj = path.obj[0];
					
					// draw line segment start
					pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw.cursors.pointer,func:drawClickGridStartLineSegment,pathNum:i});

					if (path.borderButtons !== 'undefined') {
						for (var j = 0; j < path.borderButtons.length; j++) {
							if (path.borderButtons[j].buttonType == 'grid-lineSegment') pos.push(path.borderButtons[j]);
						}
					}
				}
			}				
			break;
		case 'grid-line':
			for (var i = 0; i < draw.path.length; i++) {
				var path = draw.path[i];
				if (path.selected == true) {	
					var obj = path.obj[0];
					
					// draw line start
					pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw.cursors.pointer,func:drawClickGridStartLine,pathNum:i});

					if (path.borderButtons !== 'undefined') {
						for (var j = 0; j < path.borderButtons.length; j++) {
							if (path.borderButtons[j].buttonType == 'grid-line') pos.push(path.borderButtons[j]);
						}
					}
				}
			}				
			break;
		case 'zoom':
			pos.push({shape:'rect',dims:[0,0,draw.drawArea[2],draw.drawArea[3]],cursor:'crosshair',func:drawClickStartZoomRect,highlight:-1});
			break;
		case 'snip':
			var page = pages[pIndex];
			pos.push({shape:'rect',dims:[0,0,draw.drawArea[2],draw.drawArea[3]],cursor:'crosshair',func:draw.snip.drawClickStartRect,highlight:-1});			
			if (!un(page._snips)) {
				for (var s = 0; s < page._snips.length; s++) {
					var snip = page._snips[s];
					snip._closeRect = [snip.snipRect[0]+snip.snipRect[2]-50,snip.snipRect[1]+10,40,40];
					pos.push({shape:'rect',dims:snip.snipRect,cursor:'pointer',func:draw.snip.reopenSnip,highlight:-1,snip:snip});
					pos.push({shape:'rect',dims:snip._closeRect,cursor:'pointer',func:draw.snip.deleteSnip,highlight:-1,snip:snip});
				}
			}
			break;
		case 'snipRect':
			pos.push({shape:'rect',dims:[0,0,draw.drawArea[2],draw.drawArea[3]],cursor:'crosshair',func:draw.snip.drawClickStartRect,highlight:-1});
			break;
		case 'select':
		case 'textEdit':
			if (draw.mode === 'interact') break;
		
			pos.push({shape:'rect',dims:[0,0,draw.drawArea[2],draw.drawArea[3]],cursor:draw.cursors.default,func:drawClickStartSelectRect,highlight:-1});
			var pos2 = [];
			
			//unselected
			for (var i = 0; i < draw.path.length; i++) {
				var path = draw.path[i];
				if (getPathVis(path) == false) continue;
				if (path.notesOverlay === true && draw.notesOverlay !== true) continue;
				//if ((draw.ansMode == true && draw.showAns == false) && !un(path.trigger) && path.trigger[0] == false) continue;
				if (path.selected == true) continue;
				
				
				if (!un(path.isInput) && path.isInput._mode === 'addAnswers') continue;
				for (var j = 0; j < path.obj.length; j++) {
					var obj = path.obj[j];
					if (!un(draw[obj.type]) && !un(draw[obj.type].getCursorPositionsUnselected)) {
						pos = pos.concat(draw[obj.type].getCursorPositionsUnselected(obj,i));
						continue;
					}
					switch (obj.type) {
						case 'pen' :
						case 'eraser' :
							pos.push({shape:'path',dims:[obj.pos,draw.selectTolerance],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							break;
						case 'line' :
							pos.push({shape:'line',dims:[obj.startPos,obj.finPos,draw.selectTolerance],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							break;
						case 'rect' :
						case 'square' :
							var x1 = obj.startPos[0];
							var y1 = obj.startPos[1];
							var x2 = obj.finPos[0];
							var y2 = obj.finPos[1];
							if (obj.fillColor !== 'none') {
								pos.push({shape:'rect',dims:[x1,y1,(x2-x1),(y2-y1)],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							} else {
								pos.push({shape:'openRect',dims:[x1,y1,(x2-x1),(y2-y1),draw.selectTolerance],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							}
							break;
						case 'circle' :
							if (obj.fillColor !== 'none') {
								pos.push({shape:'circle',dims:[obj.center[0],obj.center[1],obj.radius],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							} else {
								pos.push({shape:'openCircle',dims:[obj.center[0],obj.center[1],obj.radius,draw.selectTolerance],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							}
							break;
						case 'ellipse' :
							if (obj.fillColor !== 'none') {
								pos.push({shape:'ellipse',dims:[obj.center[0],obj.center[1],obj.radiusX,obj.radiusY],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							} else {
								pos.push({shape:'ellipse',dims:[obj.center[0],obj.center[1],obj.radiusX,obj.radiusY,draw.selectTolerance],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							}
							break;
						case 'curve' :
							pos.push({shape:'path',dims:[obj.points,draw.selectTolerance],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:1});
							break;
						case 'text2' :
							var dims = clone(obj._tightRect);
							var dims2 = clone(obj.rect);
							pos.push({shape:'rect',dims:dims2,cursor:draw.cursors.pointer,func:drawClickSelect,obj:obj,pathNum:i,highlight:-1});
							pos.push({shape:'rect',dims:dims,cursor:draw.cursors.text,func:textEdit.selectStart,obj:obj,pathNum:i,highlight:-1});
							break;
						case 'table2' :
						case 'taskQuestion' :
							for (var r = 0; r < obj.cells.length; r++) {
								for (var c = 0; c < obj.cells[r].length; c++) {
									//console.log(r,c,obj.cells[r][c],obj.cells[r][c].tightRect);
									pos.push({shape:'rect',dims:obj.cells[r][c].tightRect,cursor:draw.cursors.text,func:textEdit.tableSelectStart,pathNum:i,obj:obj,cell:[r,c]});
								}
							}
							var xPos = draw.table2.getXPos(obj);
							var yPos = draw.table2.getYPos(obj);
							pos.push({shape:'table',dims:[obj.left,obj.top,obj.width,obj.height,draw.selectTolerance],xPos:xPos,yPos:yPos,cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							break;
						default :
							if (obj.type === 'grid' && obj._interactMode === 'move') {
								pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw.cursors.move1,func:draw.grid.moveStart,pathNum:i,obj:obj,highlight:-1});
							} else if (!un(obj._left) && !un(obj._top) && !un(obj._width) && !un(obj._height)) {
								pos.push({shape:'rect',dims:[obj._left,obj._top,obj._width,obj._height],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							} else if (!un(obj.left) && !un(obj.top) && !un(obj.width) && !un(obj.height)) {
								pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							} else if (!un(draw[obj.type]) && !un(draw[obj.type].getRect) && draw[obj.type].selectable !== false) {
								pos.push({shape:'rect',dims:draw[obj.type].getRect(obj),cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							} else {
								//pos.push({shape:'rect',dims:clone(path.border),cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							}
							//pos.push({shape:'rect',dims:path.border,cursor:draw.cursors.pointer,func:drawClickSelect,pathNum:i,highlight:-1});
							break;
					}
				}
			}					
			
			//selected
			for (var i = 0; i < draw.path.length; i++) {
				var path = draw.path[i];
				if (draw.ansMode == true && draw.showAns == false && !un(path.trigger) && path.trigger[0] == false) continue;
				if (!un(path.isInput) && path.isInput._mode === 'addAnswers') continue;
				if (path.selected == true) {
					var pathDraggable = false;
					for (var o = 0; o < path.obj.length; o++) {
						var obj = path.obj[o];
						if (!un(draw[obj.type]) && draw[obj.type].draggable !== false) {
							pathDraggable = true;
							break;
						}
					}
					if (pathDraggable === true) {
						pos.push({shape:'rect',dims:[path.border[0],path.border[1],path.border[2],path.border[3]],cursor:draw.cursors.move1,func:drawClickStartDragObject,pathNum:i,highlight:-1});
					}
					
					for (var o = 0; o < path.obj.length; o++) {
						var obj = path.obj[o];
						if (obj.type === 'grid' && obj._interactMode === 'move') {
							pos.push({shape:'rect',dims:[obj.left,obj.top,obj.width,obj.height],cursor:draw.cursors.move1,func:draw.grid.moveStart,pathNum:i,obj:obj,highlight:-1});
						}
					}
					
					if (draw.rotationMode == true) {
						pos.push({shape:'circle',dims:[path.border[0]+0.5*path.border[2],path.border[1]-30,10],cursor:draw.cursors.rotate,func:draw.rotateStart,pathNum:i});
					}
					
					if (path.obj.length == 1) {
						var obj = path.obj[0];
						if (obj.visible === false) continue;
						if (!un(draw[obj.type]) && !un(draw[obj.type].getCursorPositionsSelected)) {
							pos = pos.concat(draw[obj.type].getCursorPositionsSelected(obj,i));
						}
					}
										
					if (typeof path.borderButtons == 'object') {
						for (var j = 0; j < path.borderButtons.length; j++) {
							var button = path.borderButtons[j];
							if (button.visible === false || typeof button.visible === 'function' && button.visible(button) === false) continue;
							pos.push(button);
						}
					}
				}
			}
			pos = pos2.concat(pos);
			break;
		case 'selectDrag': // if an object is being dragged
			pos.push({shape:'rect',dims:draw.drawArea,cursor:draw.cursors.move2});
			break;
		case 'textStart':
			pos.push({shape:'rect',dims:draw.drawArea,cursor:'text',func:draw.text2.start,pathNum:draw.path.length});
			break;
		case 'table' :
		case 'tableChange' :
		case 'tableBorders' :
		case 'tableCellColor' :
			pos.push({shape:'rect',dims:draw.drawArea,cursor:draw.cursors.default,func:tableMenuClose});
			break;
		case 'none':
		default:
			break;
	}
	if (draw.mode == 'interact') {
		if (['snip','snipRect'].indexOf(draw.drawMode) === -1) {
			//if (!un(draw.pathCursorOrder) && ['pen','line','eraser','interactText','point'].indexOf(draw.drawMode) === -1) {
			if (!un(draw.pathCursorOrder)) {
				for (var p = 0; p < draw.pathCursorOrder.length; p++) {
					var path = draw.pathCursorOrder[p];
					if (path._visible === false) continue;
					if (getPathVis(path) === false) continue;
					var visible = false;
					for (var o = 0; o < path.obj.length; o++) {
						var obj = path.obj[o];
						if (un(obj.visible) || obj.visible == true) visible = true;
					}
					if (visible == false) continue;
					var pathInteract = draw.getPathInteract(path);
					if (pathInteract.type == 'check') {
						pos.push({shape:'rect',dims:obj.rect,cursor:draw.cursors.pointer,func:draw.interact.checkPage,interact:true,path:path});
					}
					
					if (pathInteract.allowInteraction !== false && pathInteract.disabled !== true && pathInteract._disabled !== true) {
						var shape = 'rect';
						var dims = clone(path.border.slice(0,4));						
						if (path.obj.length === 1 && path.obj[0].type === 'polygon') {
							shape = 'polygon';
							dims = clone(path.obj[0].points);
						}
						if (typeof pathInteract.dragPathCircle == 'string') {
							var circleObj = draw.getObjById(pathInteract.dragPathCircle);
							if (circleObj !== false) {
								pos.push({shape:shape,dims:dims,cursor:draw.cursors.move1,func:draw.interact.dragStart,interact:true,path:path,dragType:'circle',center:circleObj.center,radius:circleObj.radius,circle:circleObj});
							}
						} else if (typeof pathInteract.dragPathLineSegment == 'string') {
							var lineSegmentObj = draw.getObjById(pathInteract.dragPathLineSegment);
							if (lineSegmentObj !== false) {
								pos.push({shape:shape,dims:dims,cursor:draw.cursors.move1,func:draw.interact.dragStart,interact:true,path:path,dragType:'lineSegment',lineSegment:lineSegmentObj});
							}
						} else if (pathInteract.draggable == true || pathInteract.type === 'drag') {
							pos.push({shape:shape,dims:dims,cursor:draw.cursors.move1,func:draw.interact.dragStart,interact:true,path:path});
						}
						if (pathInteract.drag3d == true) {
							pos.push({shape:'rect',dims:clone(path.border.slice(0,4)),cursor:draw.cursors.move1,func:draw.three.drag3dStart,interact:true,path:path,obj:path.obj[0]});
						}
						if (pathInteract.cubeBuilding == 'build') {
							var positions = draw.three.cubeDrawing.getCursorPositionsBuild(path.obj[0]);
							draw.color = '#000';
							draw.cursors.update();
							for (var p2 = 0; p2 < positions.length; p2++) {
								pos.push({shape:'polygon',dims:positions[p2].pos2d,cursor:'url('+draw.lineCursor+') '+draw.lineCursorHotspot[0]+' '+draw.lineCursorHotspot[1]+', auto',func:draw.three.cubeDrawing.click,interact:true,path:path,obj:path.obj[0],position:positions[p2],mode:'build'});
							}
						} else if (pathInteract.cubeBuilding == 'remove') {
							var positions = draw.three.cubeDrawing.getCursorPositionsRemove(path.obj[0]);
							draw.color = '#F00';
							draw.cursors.update();
							for (var p2 = 0; p2 < positions.length; p2++) {
								pos.push({shape:'polygon',dims:positions[p2].pos2d,cursor:'url('+draw.lineCursor+') '+draw.lineCursorHotspot[0]+' '+draw.lineCursorHotspot[1]+', auto',func:draw.three.cubeDrawing.click,interact:true,path:path,obj:path.obj[0],position:positions[p2],mode:'remove'});
							}
						} else if (pathInteract.edit3dShape == true) {
							pos = pos.concat(draw.three.getCursorPositionsSelected(path.obj[0],p,true));
						}
						if (typeof pathInteract.click == 'function') {
							pos.push({shape:'rect',dims:clone(path.border.slice(0,4)),cursor:draw.cursors.pointer,func:draw.interact.click,click:pathInteract.click,interact:true,path:path,obj:path.obj[0]});
						}
					}
					for (var o2 = 0; o2 < path.obj.length; o2++) {
						var obj = path.obj[o2];
						var isOverlayObj = false;
						if (!un(path.interact) && path.interact.overlay == true) isOverlayObj = true;
						if (!un(obj.interact) && obj.interact.overlay == true) isOverlayObj = true;
						if (obj.type == 'dropMenu' && obj._open === true) isOverlayObj = true;
						if (obj.type == 'starterQuestion') isOverlayObj = true;
						if (isOverlayObj == true) continue;
						if (obj.type === 'angle' && !un(obj.interact) && typeof obj.interact.clickAngle == 'function') {
							var dims = [obj.b[0],obj.b[1],obj.radius,getAngleFromAToB(obj.b,obj.a),getAngleFromAToB(obj.b,obj.c)];
							pos.push({shape:'sector2',dims:dims,cursor:draw.cursors.pointer,func:draw.interact.clickAngle,click:obj.interact.clickAngle,interact:true,path:path,obj:obj});
						}
						if (un(draw[obj.type])) {
							//console.log('type?', obj.type);
							continue;
						}
						if (typeof draw[obj.type].getCursorPositionsInteract == 'function') {
							pos = pos.concat(draw[obj.type].getCursorPositionsInteract(obj,path,p));
						}
						if (!un(obj._cursorPos)) {
							pos = pos.concat(obj._cursorPos);
						}
						var objInteract = draw.getObjInteract(obj);
						if (obj.disabled !== true && obj._disabled !== true) {
							if (obj.type == 'slider') {
								//pos.push({shape:'circle',dims:obj._pos,cursor:draw.cursors.move1,func:draw.slider.dragStart,interact:true,path:path,obj:obj});
							} else if (objInteract.allowInteraction === false || objInteract.disabled === true || objInteract._disabled === true) {
								continue;
							} else if (obj.type == 'grid' || obj.type == 'simpleGrid') {
								if (['lineSegment','lineSegmentPoints','line','linePoints','point'].indexOf(objInteract.type) > -1) {
									pos.push({shape:'rect',dims:[obj.left-20,obj.top-20,obj.width+40,obj.height+40],cursor:'url('+draw.lineCursor+') '+draw.lineCursorHotspot[0]+' '+draw.lineCursorHotspot[1]+', auto',func:draw.grid.gridPathStart,obj:obj,highlight:-1,mode:objInteract.type});
								}
								
							} else if (!un(objInteract.click) && objInteract.click.length > 0) {
								pos.push({shape:'rect',dims:draw[obj.type].getRect(obj),cursor:draw.cursors.pointer,func:draw.interact.click,interact:true,path:path,obj:obj});
							} else if (typeof objInteract.click == 'function') {
								if (obj.type === 'table2') {
									for (var c = 0; c < obj._cells.length; c++) {
										var cell = obj._cells[c];
										pos.push({
											shape: 'rect',
											dims: clone(cell._rect),
											cursor: draw.cursors.pointer,
											func: obj.interact.click,
											interact:true,
											path: path,
											obj: obj,
											row: cell._r,
											col: cell._c,
											cell: cell,
											cellIndex: c
										});
									}
								} else {
									pos.push({shape:'rect',dims:draw[obj.type].getRect(obj),cursor:draw.cursors.pointer,func:draw.interact.click,click:objInteract.click,interact:true,path:path,obj:obj});
								}
							}
						}
					}			
				}
				if (typeof file !== 'undefined' && typeof resourceIndex === 'number' && typeof getResourceType === 'function' && !un(file.resources) && !un(file.resources[resourceIndex]) && getResourceType(file.resources[resourceIndex]) === 'slides') {
					for (var p = 0; p < draw.path.length; p++) {
						var path = draw.path[p];
						for (var o = 0; o < path.obj.length; o++) {
							var obj = path.obj[o];
							if (un(obj.appear) || obj.appear.active === false || (obj.visible === true && obj.appear.reversible !== true)) continue;
							var objPath = {obj:[obj]};
							updateBorder(objPath);
							var pos2 = objPath._center;
							if (!un(obj.appear.offset)) pos2 = vector.addVectors(pos2,obj.appear.offset);
							pos.push({shape:'rect',dims:[pos2[0]-20,pos2[1]-20,40,40],cursor:draw.cursors.pointer,func:draw.interact.appear,interact:true,obj:obj});
						}
						if (un(path.appear)) continue;
						var visible = boolean(path._visible,false);
						if (visible == true && path.appear.reversible !== true) continue;
						if (typeof path.appear.visible == 'function' && path.appear.visible(path) === false) continue;
						if (typeof path.appear.visible == 'string' && getPathVis(path.appear.visible) == false) continue;
						if (!un(path.appear.pos)) {
							var l = path.appear.pos[0]-20;
							var t = path.appear.pos[1]-20;
						} else if (!un(path.appear.relPos)) {
							if (un(path.border)) updateBorder(path);
							if (un(path.border)) continue;
							var l = path.border[0]+path.appear.relPos[0]-20;
							var t = path.border[1]+path.appear.relPos[1]-20;
						} else {
							if (un(path.border)) updateBorder(path);
							if (un(path.border)) continue;
							var l = path.border[0]+0.5*path.border[2]-20;
							var t = path.border[1]+0.5*path.border[3]-20;
						}
						pos.push({shape:'rect',dims:[l,t,40,40],cursor:draw.cursors.pointer,func:draw.interact.appear,interact:true,path:path});
					}
				}
			}
			for (var p = 0; p < draw.path.length; p++) { // add cursor positions for overlay buttons
				var path = draw.path[p];
				if (getPathVis(path) === false) continue;
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					//if (['pen','line','eraser','interactText','point'].indexOf(draw.drawMode) > -1 && !un(draw[obj.type]) && draw[obj.type].drawToolsButton !== true) continue;
					if (!un(obj.interact) && (obj.interact.disabled === true || obj.interact._disabled === true)) continue;
					var isOverlayObj = false;
					if (!un(path.interact) && path.interact.overlay == true) isOverlayObj = true;
					if (!un(obj.interact) && obj.interact.overlay == true) isOverlayObj = true;
					if (obj.type == 'starterQuestion') isOverlayObj = true;
					if (obj.type == 'dropMenu' && obj._open === true) isOverlayObj = true;
					if (obj.visible === false || isOverlayObj == false) continue;
					if (obj.type == 'colorPicker' && draw.colorSelectVisible == false) continue;
					if (obj.type == 'lineWidthSelect' && draw.lineWidthSelectVisible == false) continue;
					if (typeof draw[obj.type].getCursorPositionsInteract == 'function') {
						pos = pos.concat(draw[obj.type].getCursorPositionsInteract(obj,path,p));
					}
					if (obj.type == 'slider') {
						pos.push({shape:'circle',dims:obj._pos,cursor:draw.cursors.move1,func:draw.slider.dragStart,interact:true,path:path,obj:obj});
					} else if (!un(obj.interact) && !un(obj.interact.click) && obj.interact.click.length > 0 && (un(draw[obj.type]) || draw[obj.type].drawToolsButton !== true || un(pages[pIndex]) || typeof pages[pIndex].drawToolsButtons !== 'object')) {
						pos.push({shape:'rect',dims:draw[obj.type].getRect(obj),cursor:draw.cursors.pointer,func:draw.interact.click,interact:true,path:path,obj:obj});
					} else if (!un(obj.interact) && typeof obj.interact.click == 'function' && (un(draw[obj.type]) || obj.type === 'buttonCompassHelp' || draw[obj.type].drawToolsButton !== true || un(pages[pIndex]) || typeof pages[pIndex].drawToolsButtons !== 'object')) {
						pos.push({shape:'rect',dims:draw[obj.type].getRect(obj),cursor:draw.cursors.pointer,func:draw.interact.click,click:obj.interact.click,interact:true,path:path,obj:obj});
					}
				}
			}
		}
	} else {
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (!un(path.isInput) && path.isInput._mode === 'addAnswers') {
				if (path.isInput.type === 'drag') {
					pos.push({shape:'rect',dims:path.tightBorder.slice(0,4),cursor:draw.cursors.move1,func:draw.interact.dragStart,path:draw.path[p]});
					continue;
				} else if (path.isInput.type === 'grid') {
					var pos2 = draw.grid.getCursorPositionsInteract(path.obj[0],path,p);
					pos = pos.concat(pos2);
					continue;
				}
			}
			for (var o2 = 0; o2 < path.obj.length; o2++) {
				var obj = path.obj[o2];
				if (!un(obj._cursorPos)) pos = pos.concat(obj._cursorPos);
			}
		}
		if (typeof file !== 'undefined' && typeof resourceIndex === 'number' && typeof getResourceType === 'function' && !un(file.resources) && !un(file.resources[resourceIndex]) && getResourceType(file.resources[resourceIndex]) === 'slides') {
			for (var p = 0; p < draw.path.length; p++) { // add cursor positions for appear buttons
				var path = draw.path[p];
				if (un(path.appear)) continue;
				if (un(path.appear.pos)) {
					var l = path.border[0]+0.5*path.border[2]-20;
					var t = path.border[1]+0.5*path.border[3]-20;
				} else {
					var l = path.appear.pos[0]-20;
					var t = path.appear.pos[1]-20;
				}
				pos.push({buttonType:'appear-dont-draw',shape:'rect',dims:[l,t,40,40],cursor:draw.cursors.move1,func:drawClickAppearMoveStart,pathNum:p});
			}
		}
	}
	var paths = selPaths();
	if (paths.length === 1 && paths[0].obj.length === 1 && paths[0].obj[0].type === 'three' && !un(draw.controlPanel)) {
		pos = pos.concat(draw.controlPanel.cursorPositions);
	}
	
	pos.sort(function(a,b) {
		if (a.overlay === true && b.overlay !== true) {
			return 1;
		} else if (b.overlay === true && a.overlay !== true) {
			return -1;
		}
		var az = !un(a.zIndex) ? a.zIndex : 0;
		var bz = !un(b.zIndex) ? b.zIndex : 0;
		return az-bz;
	});
	draw.cursorPositions = pos;
	//console.log(pos);
}
draw.getPathInteract = function(path) {
	var interact = {};
	for (var o2 = 0; o2 < path.obj.length; o2++) {
		var obj = path.obj[o2];
		if (!un(obj.interact)) {
			for (var key in obj.interact) {
				if (key === 'click') continue;
				if (un(interact[key])) {
					interact[key] = obj.interact[key];
				}
			}
		}
	}
	if (!un(path.isInput)) {
		for (var key in path.isInput) {
			interact[key] = path.isInput[key];
		}
	}
	if (!un(path.interact)) {
		for (var key in path.interact) {
			interact[key] = path.interact[key];
		}
	}
	return interact;
}
draw.getObjInteract = function(obj) {
	var interact = {};
	if (!un(obj.interact)) {
		for (var key in obj.interact) {
			if (un(interact[key])) {
				interact[key] = obj.interact[key];
			}
		}
	}
	return interact;
}
function drawCanvasMove(e) {
	e.preventDefault();
	if (typeof draw == 'undefined' || draw.drawing == true || ['tableColResize','tableRowResize','gridDrag','gridRecaleX','gridRecaleY','compassMove1','compassMove2','compassDraw','protractorRotate','protractorMove','rulerRotate','rulerMove','selectDrag','selectRect','selectResize','tableInputSelect','tableCellSelect','tableColSelect','tableRowSelect','textInputSelect'].indexOf(draw.drawMode) > -1) {
		e.preventDefault();
		return;
	}
	
	updateMouse(e);
	if (!un(draw.lockCursor)) {
		e.preventDefault();
		draw.cursorCanvas.style.cursor = draw.lockCursor;
		draw.currCursor = {};
	} else {
		draw.currCursor = getCursorAtPosition(draw.mouse[0],draw.mouse[1]);
		//console.log(draw.currCursor);
		if (draw.currCursor.allowDefault !== true) {
			e.preventDefault();
		} else {
			//console.log(draw.currCursor.allowDefault);
		}
		draw.cursorCanvas.style.cursor = draw.currCursor.cursor;	
	}
	
	//console.log('drawCanvasMove','drawMode:'+draw.drawMode,'currCursor:',draw.currCursor);
	//console.log(draw.currCursor,draw.cursorCanvas.style.cursor);
	cursorPosHighlight();
}
function drawCanvasStart(e) {
	e.preventDefault();
	updateMouse(e);
	calcCursorPositions();
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	draw.currCursor = getCursorAtPosition(x,y);	// necessary for touch events, where move function will not have run
	draw.currCursor._event = e;
	draw.table2.deselectTables();
	
	if (draw.currCursor.endTextInput !== false) textEdit.endInput();
	//console.log('drawCanvasStart',draw.currCursor,e.target === draw.cursorCanvas);
	
	if (!un(draw.currCursor)) {
		var changed = false;
		if ((un(draw.currCursor.obj) || (draw.currCursor.obj.type !== 'colorPicker' && draw.currCursor.obj.type !== 'buttonColorPicker')) && draw.colorSelectVisible === true) {
			draw.colorSelectVisible = false;
			changed = true;
		}
		if ((un(draw.currCursor.obj) || (draw.currCursor.obj.type !== 'lineWidthSelect' && draw.currCursor.obj.type !== 'buttonLineWidthPicker')) && draw.lineWidthSelectVisible === true) {
			draw.lineWidthSelectVisible = false;
			changed = true;
		}
		if (draw.currCursor.dontCloseDropMenus !== true) {
			var changed2 = draw.closeDropMenus(draw.currCursor.obj);
			changed = changed || changed2;
		}
		
		if (!un(draw.currCursor.func)) {
			draw.currCursor.func.apply();
			if (draw.currCursor.interact == true) draw.interact.update();
			if (changed === true) drawCanvasPaths();
		} else {
			drawCanvasPaths();
		}
	} else {
		draw.colorSelectVisible = false;
		draw.lineWidthSelectVisible = false;
		draw.closeDropMenus();
		drawCanvasPaths();
	}
	if (un(draw.currCursor) || (draw.currCursor.func !== draw.constructionsToolBackgrounds.toggleDiv && draw.currCursor.hideConstructionToolBackgroundsDiv !== false)) draw.constructionsToolBackgrounds.hideDiv();
}
function showCursorPositions() {
	var ctx = draw.drawCanvas.last().ctx;
	ctx.scale(draw.scale,draw.scale);	
	//ctx.clearRect(draw.drawArea[0],draw.drawArea[1],draw.drawArea[2],draw.drawArea[3]);
	var colorMove = colorA('#00F',0.3);
	var colorPointer = colorA('#F00',0.3);
	var colorText = colorA('#0F0',0.3);
	var colorMisc = colorA('#FF0',0.3);
	for (var i = 0; i < draw.cursorPositions.length; i++) {
		var pos = draw.cursorPositions[i];
		if (pos.cursor == draw.cursors.move1) {
			ctx.fillStyle = colorMove;
		} else if (pos.cursor == draw.cursors.pointer) {
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
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function getCursorAtPosition(x,y) {
	var overTool = isPosOverTool(x-draw.drawArea[0],y-draw.drawArea[1]);
	if (typeof overTool == 'object' || overTool !== false) return overTool;
	if (typeof draw.cursorPositions == 'undefined') calcCursorPositions();
	var pos = draw.cursorPositions;
	var currPos = {cursor:draw.cursors.default,func:function(){}};
	var x2 = x-draw.drawArea[0];
	var y2 = y-draw.drawArea[1];
	for (var i = 0; i < pos.length; i++) {
		var cursorPosition = pos[i];
		if (typeof cursorPosition !== 'object') continue;
		if (cursorPosition.keepBubbling !== true && draw.cursorPosHitTest(cursorPosition,x2,y2) == true) {
			cursorPosition.pos = i;
			currPos = cursorPosition;
		}
		/*
		var dims = clone(pos[i].dims);
		if (typeof dims == 'undefined') continue;
		//console.log(i,pos[i],pos[i].dims);
		if (pos[i].shape == 'table') {
			for (var x = 0; x < pos[i].xPos.length; x++) {
				var x3 = pos[i].xPos[x];
				if (distancePointToLineSegment([x2,y2],[x3,dims[1]],[x3,dims[1]+dims[3]]) < dims[4]) {
					pos[i].pos = i;
					currPos = pos[i];
					break;
				}
			}
			for (var y = 0; y < pos[i].yPos.length; y++) {
				var y3 = pos[i].yPos[y];
				if (distancePointToLineSegment([x2,y2],[dims[0],y3],[dims[0]+dims[2],y3]) < dims[4]) {
					pos[i].pos = i;
					currPos = pos[i];
					break;
				}				
			}
		} else if ((pos[i].shape == 'rect' && x2 >= dims[0] && x2 <= (dims[0]+dims[2]) && y2 >= dims[1] && y2 <= (dims[1]+dims[3])) ||
			(pos[i].shape == 'openRect' && 
				(distancePointToLineSegment([x2,y2],[dims[0],dims[1]],[dims[0]+dims[2],dims[1]]) < dims[4]) ||
				(distancePointToLineSegment([x2,y2],[dims[0]+dims[2],dims[1]],[dims[0]+dims[2],dims[1]+dims[3]]) < dims[4]) ||
				(distancePointToLineSegment([x2,y2],[dims[0]+dims[2],dims[1]+dims[3]],[dims[0],dims[1]+dims[3]]) < dims[4]) ||
				(distancePointToLineSegment([x2,y2],[dims[0],dims[1]+dims[3]],[dims[0],dims[1]]) < dims[4])
			) ||
			(pos[i].shape == 'circle' && dist(x2,y2,dims[0],dims[1]) <= dims[2]) ||
			(pos[i].shape == 'sector' && isPointInSector([x2,y2],dims) == true) ||
			(pos[i].shape == 'openCircle' && dist(x2,y2,dims[0],dims[1]) >= dims[2]-dims[3] && dist(x2,y2,dims[0],dims[1]) <= dims[2]+dims[3]) ||
			(pos[i].shape == 'ellipse' && isPointInEllipse([x2,y2],[dims[0],dims[1]],dims[2],dims[3]) == true) ||
			(pos[i].shape == 'openEllipse' && isPointOnEllipse([x2,y2],[dims[0],dims[1]],dims[2],dims[3],dims[4]) == true) ||
			(pos[i].shape == 'line' && (distancePointToLineSegment([x2,y2],dims[0],dims[1]) < dims[2])) ||
			(pos[i].shape == 'path' && (distancePointToPath([x2,y2],dims[0]) <= dims[1])) ||
			(pos[i].shape == 'polygon' && hitTestPolygon([x2,y2],dims,true) == true)
		) {
			pos[i].pos = i;
			currPos = pos[i];
		}
		*/
	}
	//console.log(currPos,x2,y2);
	return currPos;
}
draw.cursorPosHitTest = function(pos,x,y) {
	var dims = clone(pos.dims);
	if (typeof dims == 'undefined') return false;
	if (pos.shape == 'table') {
		if (typeof pos.xPos !== 'undefined' && typeof pos.yPos !== 'undefined') {
			for (var c = 0; c < pos.xPos.length; c++) {
				var x3 = pos.xPos[c];
				if (distancePointToLineSegment([x,y],[x3,dims[1]],[x3,dims[1]+dims[3]]) < dims[4]) return true;
			}
			for (var r = 0; r < pos.yPos.length; r++) {
				var y3 = pos.yPos[r];
				if (distancePointToLineSegment([x,y],[dims[0],y3],[dims[0]+dims[2],y3]) < dims[4]) return true;
			}
		}
	} else if ((pos.shape == 'rect' && x >= dims[0] && x <= (dims[0]+dims[2]) && y >= dims[1] && y <= (dims[1]+dims[3])) ||
		(pos.shape == 'openRect' && 
			(distancePointToLineSegment([x,y],[dims[0],dims[1]],[dims[0]+dims[2],dims[1]]) < dims[4]) ||
			(distancePointToLineSegment([x,y],[dims[0]+dims[2],dims[1]],[dims[0]+dims[2],dims[1]+dims[3]]) < dims[4]) ||
			(distancePointToLineSegment([x,y],[dims[0]+dims[2],dims[1]+dims[3]],[dims[0],dims[1]+dims[3]]) < dims[4]) ||
			(distancePointToLineSegment([x,y],[dims[0],dims[1]+dims[3]],[dims[0],dims[1]]) < dims[4])
		) ||
		(pos.shape == 'circle' && dist(x,y,dims[0],dims[1]) <= dims[2]) ||
		(pos.shape == 'sector' && isPointInSector2([x,y],dims) == true) ||
		(pos.shape == 'sector2' && isPointInSector2([x,y],dims) == true) ||
		(pos.shape == 'openCircle' && dist(x,y,dims[0],dims[1]) >= dims[2]-dims[3] && dist(x,y,dims[0],dims[1]) <= dims[2]+dims[3]) ||
		(pos.shape == 'ellipse' && isPointInEllipse([x,y],[dims[0],dims[1]],dims[2],dims[3]) == true) ||
		(pos.shape == 'openEllipse' && isPointOnEllipse([x,y],[dims[0],dims[1]],dims[2],dims[3],dims[4]) == true) ||
		(pos.shape == 'line' && (distancePointToLineSegment([x,y],dims[0],dims[1]) < dims[2])) ||
		(pos.shape == 'path' && (distancePointToPath([x,y],dims[0]) <= dims[1])) ||
		(pos.shape == 'polygon' && hitTestPolygon([x,y],dims,true) == true)
	) {
		 return true;
	}
	return false;
}
function cursorPosHighlight(clr) {
	return;
	if (draw.highlightCursorPositions == false) return;
	if (un(draw.cursorPosHighlight)) {
		draw.cursorPosHighlight = newctx({z:99999999});
		var ctx = draw.cursorPosHighlight;
		ctx.lineWidth = draw.selectTolerance * 2;
		ctx.strokeStyle = colorA('#FF0',0.4);
		ctx.fillStyle = colorA('#FF0',0.4);		
	}
	var ctx = draw.cursorPosHighlight;
	ctx.clear();
	
	if (boolean(clr,false) == true) return;
	var c = draw.currCursor;
	if (c.cursor == 'default' || c.cursor == 'move1') return;
	if (draw.highlightCursorPositions == 'part' && c.highlight == -1) return;
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
		case 'sector':
			ctx.beginPath();
			ctx.moveTo(c.dims[0],c.dims[1]);
			ctx.lineTo(c.dims[0]+c.dims[2]*Math.cos(c.dims[3]),c.dims[1]+c.dims[2]*Math.sin(c.dims[3]));
			ctx.arc(c.dims[0],c.dims[1],c.dims[2],c.dims[3],c.dims[4]);
			ctx.lineTo(c.dims[0],c.dims[1]);
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
	
	if (draw.highlightCursorPositions == 'part') return;
	
	for (var p = c.pos+1; p < draw.cursorPositions.length; p++) {
		var c = draw.cursorPositions[p];
		switch (c.shape) {
			case 'rect':
				ctx.clearRect(c.dims[0],c.dims[1],c.dims[2],c.dims[3]);
				break;
			case 'openRect':
				clearLineRounded(ctx,c.dims[0],c.dims[1],c.dims[0]+c.dims[2],c.dims[1],draw.selectTolerance*2);
				clearLineRounded(ctx,c.dims[0]+c.dims[2],c.dims[1],c.dims[0]+c.dims[2],c.dims[1]+c.dims[3],draw.selectTolerance*2);
				clearLineRounded(ctx,c.dims[0]+c.dims[2],c.dims[1]+c.dims[3],c.dims[0],c.dims[1]+c.dims[3],draw.selectTolerance*2);
				clearLineRounded(ctx,c.dims[0],c.dims[1]+c.dims[3],c.dims[0],c.dims[1],draw.selectTolerance*2);
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
				clearLineRounded(ctx,c.dims[0][0],c.dims[0][1],c.dims[1][0],c.dims[1][1],draw.selectTolerance*2);
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

draw.getPathObjTypes = function(path) {
	if (un(path)) path = draw.path;
	var types = [];
	if (path instanceof Array) {
		for (var p = 0; p < path.length; p++) processPath(path[p]);
	} else {
		processPath(path);
	}
	return types;
	
	function processPath(path2) {
		for (var o = 0; o < path2.obj.length; o++) {
			var obj = path2.obj[o];
			if (types.indexOf(obj.type) == -1) types.push(obj.type);
		}
	}
}
draw.updateAllBorders = function(paths) {
	if (un(paths)) paths = draw.path;
	for (var p = 0; p < paths.length; p++) updateBorder(paths[p]);
}
draw.updateSelectedBorders = function() {
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected == true) updateBorder(draw.path[p]);
	}
}
function updateBorder(path,override) {
	if (un(draw.path) && boolean(override,false) == true) return;
	var x1,y1,x2,y2, buttons = [], left = [], top = [], right = [], bottom = [];
	for (var i = 0; i < path.obj.length; i++) {
		if (un(path.obj[i])) continue;
		var obj = path.obj[i];
		if (!un(draw[obj.type]) && !un(draw[obj.type].getRect)) {
			var rect = draw[obj.type].getRect(obj);
			if (!un(rect)) {
				left[i] = rect[0];
				top[i] = rect[1];
				right[i] = rect[0]+rect[2];
				bottom[i] = rect[1]+rect[3];
			}
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
	path._center = [(x1+x2)/2,(y1+y2)/2];
	var padding = draw.selectPadding;
	x1 -= padding;
	y1 -= padding;
	x2 += padding;
	y2 += padding;
	path.border = [x1,y1,x2-x1,y2-y1,x2,y2];
	
	if (un(draw.path) || typeof draw.path.indexOf !== 'function') return;
	var pathNum = draw.path.indexOf(path);
	
	if (path.obj.length == 1 && (['image','rect','square','circle','ellipse','simpleGrid','anglesAroundPoint','text2','table2'].indexOf(path.obj[0].type) > -1 || (!un(draw[path.obj[0].type]) && draw[path.obj[0].type].resizable == true))) {
		// resize handle in bottom right corner
		buttons.push({buttonType:'resize',shape:'rect',dims:[x2-20,y2-20,20,20],cursor:draw.cursors.nw,func:drawClickStartResizeObject,pathNum:pathNum});
	} else if (path.obj.length > 1) {
		buttons.push({buttonType:'resize-path',shape:'rect',dims:[x2-20,y2-20,20,20],cursor:draw.cursors.nw,func:drawClickStartResizePath,pathNum:pathNum});
	}
	
	if (path.obj.length == 1 && !un(draw[path.obj[0].type]) && !un(draw[path.obj[0].type].getButtons)) {
		buttons = buttons.concat(draw[path.obj[0].type].getButtons(x1,y1,x2,y2,pathNum,path));
	}
	
	if (!un(path.isInput)) {
		//buttons.push({buttonType:'isInput-type',shape:'rect',dims:[(x1+x2)/2-40,y1,80,20],cursor:draw.cursors.default,func:function() {},pathNum:pathNum,type:path.isInput.type});		
		
		if (path.isInput.type == 'text' && path.obj.length == 1 && path.obj[0].type == 'text2') {
			
		} else if (!un(draw.selectInput) && path.isInput.type == 'select' && path.obj.length == 1 && path.obj[0].type == 'table2') {
			/*var obj = path.obj[0];
			for (var r = 0; r < obj.cells.length; r++) {
				for (var c = 0; c < obj.cells[r].length; c++) {
					buttons.push({buttonType:'select-input-cellToggle',shape:'rect',dims:[obj.xPos[c+1]-20,obj.yPos[r],20,20],cursor:draw.cursors.pointer,func:draw.selectInput.cellToggle,pathNum:pathNum,row:r,col:c});
				}
			}
			buttons.push({buttonType:'select-input-shuffleToggle',shape:'rect',dims:[x1+20,y2-20,60,20],cursor:draw.cursors.pointer,func:draw.selectInput.shuffleToggle,pathNum:pathNum,shuffle:path.isInput.shuffle});
			if (!un(path.isInput.selColors)) {
				buttons.push({buttonType:'select-input-selColors',shape:'rect',dims:[x1+80,y2-20,20,20],cursor:draw.cursors.pointer,func:draw.selectInput.selColors,pathNum:pathNum,selColors:path.isInput.selColors});
			}*/
		}
	}
	if (!un(path.interact)) {
		if (!un(draw.interact) && path.interact.type == 'drag') {
			
			buttons.push({buttonType:'isInput-drag-value',shape:'rect',dims:[x2,y1,120,30],cursor:draw.cursors.pointer,func:draw.isInput.dragSetValue,pathNum:pathNum,visible:function() {return selPaths().length === 1}});
			
			buttons.push({buttonType:'isInput-drag-match',shape:'rect',dims:[x2,y1+30,120,20],cursor:draw.cursors.pointer,func:draw.isInput.dragSetMatch,pathNum:pathNum,visible:function() {return selPaths().length === 1}});
						
		} else if (!un(draw.interact) && path.interact.type == 'dragArea') {
			
			buttons.push({buttonType:'isInput-drag-match',shape:'rect',dims:[x2,y1,120,20],cursor:draw.cursors.pointer,func:draw.isInput.dragSetMatch,pathNum:pathNum,visible:function() {return selPaths().length === 1}});
			
			buttons.push({buttonType:'isInput-dragArea-snapToggle',shape:'rect',dims:[x2,y1+20,120,20],cursor:draw.cursors.pointer,func:draw.isInput.dragAreaSnapToggle,pathNum:pathNum,visible:function() {return selPaths().length === 1}});
		}
	}

	// plus & minus zIndex buttons in bottom left corner
	buttons.push({buttonType:'orderPlus',shape:'rect',dims:[x1,y2-40,20,20],cursor:draw.cursors.pointer,func:drawClickOrderPlus,pathNum:pathNum});
	buttons.push({buttonType:'orderMinus',shape:'rect',dims:[x1,y2-20,20,20],cursor:draw.cursors.pointer,func:drawClickOrderMinus,pathNum:pathNum});
		
	// delete button in top right corner
	buttons.push({buttonType:'delete',shape:'rect',dims:[x2-20,y1,20,20],cursor:draw.cursors.pointer,func:drawClickDelete,pathNum:pathNum});
	
	if (draw.appearMode == true) {
		buttons.push({buttonType:'appear',shape:'rect',dims:[x1,y1,20,20],cursor:draw.cursors.pointer,func:drawClickAppear,pathNum:pathNum});
	} else {
		buttons.push({buttonType:'trigger',shape:'rect',dims:[x1,y1,20,20],cursor:draw.cursors.pointer,func:drawClickTrigger,pathNum:pathNum});
	}
	
	//buttons.push({buttonType:'question-index',shape:'rect',dims:[(x1+x2)/2-60,y1,120,20],cursor:draw.cursors.pointer,func:draw.setQuestionIndex,pathNum:pathNum});
	//buttons.push({buttonType:'toggle-draggable',shape:'rect',dims:[x1+20,y1,20,20],cursor:draw.cursors.pointer,func:draw.togglePathDraggable,pathNum:pathNum,path:path});
	
	buttons.push({buttonType:'toggle-notesOverlay',shape:'rect',dims:[x1+20,y1,20,20],cursor:draw.cursors.pointer,func:draw.toggleNotesOverlay,pathNum:pathNum,path:path});
	
	path.borderButtons = buttons; 
	return path.border;
}
draw.toggleNotesOverlay = function() {
	var path = draw.currCursor.path;
	if (path.notesOverlay === true) {
		delete path.notesOverlay;
	} else {
		path.notesOverlay = true;
	}
	drawCanvasPaths();
}
draw.getPathFunctions = function(path) {
	var funcs = [];
	for (var key in path) if (typeof path[key] === 'function') funcs.push([path,key,'path.'+key+'()']);
	if (!un(path.interact)) {
		for (var key in path.interact) if (typeof path.interact[key] === 'function') funcs.push([path.interact,key,'path.interact.'+key+'()']);
	}
	if (!un(path.isInput)) {
		for (var key in path.isInput) if (typeof path.isInput[key] === 'function') funcs.push([path.isInput,key,'path.isInput.'+key+'()']);
	}
	return funcs;
}
draw.getObjFunctions = function(obj) {
	var funcs = [];
	for (var key in obj) if (typeof obj[key] === 'function') funcs.push([obj,key,'obj.'+key]);
	if (!un(obj.interact)) {
		for (var key in obj.interact) if (typeof obj.interact[key] === 'function') funcs.push([obj.interact,key,'obj.interact.'+key+'()']);
	}
	return funcs;
}

function cycleSelected(reverse) {
	var selected = selPathNum();
	deselectAllPaths();
	if (boolean(reverse,false) == false) {
		selected = (selected+1)%draw.path.length;
	} else {
		selected = selected-1;
		if (selected == -1) selected = draw.path.length-1;
	}
	draw.path[selected].selected = true;
	calcCursorPositions();
	drawCanvasPaths();
}
function sel() {
	if (un(draw) || un(draw.path)) return false;
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected == true) {
			return draw.path[p].obj[0];
		}
	}
	return false;
}
function selObjs() {
	if (un(draw) || un(draw.path)) return false;
	var objs = [];
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected == true) {
			for (var o = 0; o < draw.path[p].obj.length; o++) {
				objs.push(draw.path[p].obj[o]);
			}
		}
	}
	return objs;
}
function selPath() {
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected == true) {
			return draw.path[p];
		}
	}
	return false;
}
function selPathNum() {
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected == true) {
			return p;
		}
	}
	return -1;	
}
function selPathNums() {
	var nums = [];
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected == true) nums.push(p);
	}
	return nums;
}
function selPaths() {
	if (un(draw) || un(draw.path)) return [];
	var paths = [];
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected == true) {
			paths.push(draw.path[p]);
		}
	}
	return paths;
}

draw.undo = {
	save:true,
	saveState: function() {
		if (draw.undo.save == false) return;
		if (un(draw.undo.undoStack[0]) || draw.undo.pathsEqual(draw.path,draw.undo.undoStack[0]) == false) {
			draw.undo.undoStack.unshift(clone(draw.path));
			draw.undo.redoStack = [];
		}
	},
	undoStack:[],
	undo:function() {
		while (!un(draw.undo.undoStack[0]) && draw.undo.pathsEqual(draw.path,draw.undo.undoStack[0])) {
			draw.undo.undoStack.shift();
		}
		if (un(draw.undo.undoStack[0])) return;
		draw.undo.redoStack.unshift(clone(draw.path));
		draw.path = draw.undo.undoStack.shift();
		draw.undo.save = false;
		deselectAllPaths();
		draw.undo.save = true;
	},
	redoStack:[],
	redo:function() {
		while (!un(draw.undo.redoStack[0]) && draw.undo.pathsEqual(draw.path,draw.undo.redoStack[0])) {
			draw.undo.redoStack.shift();
		}
		if (draw.undo.redoStack.length == 0) return; 
		draw.undo.undoStack.unshift(clone(draw.path));
		draw.path = draw.undo.redoStack.shift();
		draw.undo.save = false;
		deselectAllPaths();
		draw.undo.save = true;
	},
	reset: function() {
		draw.undo.undoStack = [];
		draw.undo.redoStack = [];
	},
	pathsEqual: function(a,b) {
		if (a.length !== b.length) return false;
		for (var p = 0; p < a.length; p++) {
			var path1 = a[p];
			var path2 = b[p];
			if (path1.obj.length !== path2.obj.length) return false;
			if ((!un(path1.appear) || !un(path2.appear)) && isEqual(path1.appear,path2.appear) == false) return false;
			for (var o = 0; o < path1.obj.length; o++) {
				var obj1 = path1.obj[o];
				var obj2 = path2.obj[o];
				for (var key in obj1) {
					if (['ctx','text'].includes(key) || key.indexOf('_') == 0 || !obj1.hasOwnProperty(key)  || isElement(obj1[key])) continue;
					if (isEqual(obj1[key],obj2[key]) == false) return false;
				}
			}
		}
		return true;
	}
}
draw.scalePath = function(path,sf) {
	if (un(path.border)) updateBorder(path);
	var center = [path.border[0],path.border[1]];
	for (var o = 0; o < path.obj.length; o++) {
		var obj = path.obj[o];
		if (un(draw[obj.type]) || un (draw[obj.type].scale)) continue;
		draw[obj.type].scale(obj,sf,center);
	}
	updateBorder(path);
	drawCanvasPaths();
}

/***************************/
/*   KEYBOARD SHORTCUTS    */
/***************************/

var snapToObj2Mode = typeof taskApp === 'object' ? '' : 'ctrl';
var snapToObj2On = typeof taskApp === 'object' ? true : false;
var snapBordersOn = false;
var shiftOn = false;
var ctrlOn = false;
var altOn = false;
window.addEventListener('keydown', keydown, false);
function keydown(e) {
	if (e.keyCode == 16) {
		shiftOn = true;
	} else if (e.keyCode == 17) {
		ctrlOn = true;
		snapToObj2On = true;
	} else	if (e.keyCode == 18) {
		altOn = true;
	}
	if (ctrlOn === true && e.key.toLowerCase() === 'v' && !un(file) && file.constructionsTool === true) {
		draw.constructionsToolBackgrounds.pasteImage(e);
	}
	if (typeof window.keynav !== 'undefined') window.keynav(e);
}
draw.constructionsToolBackgrounds = {
	options:[{
		name:'none',
		text:'none',
		set:function() {
			
		}
	},{
		name:'grid',
		text:'grid',
		set:function() {
			var w = 60;
			var obj = {
				type: 'simpleGrid',
				left: 180,
				top: 50,
				width: 840,
				height: 600,
				xMin: -0.01,
				xMax: 840/w + 0.01,
				yMin: -0.01,
				yMax: 600/w + 0.01,
				xMajorStep: 1,
				xMinorStep: 1,
				yMajorStep: 1,
				yMinorStep: 1,
				showLabels: false,
				showScales: false,
				dots: false,
				showGrid: true,
				showAxes: false,
				showBorder: false,
				color: '#000',
				thickness: 1,
				xZero: 0,
				yZero: 650,
				hSquares: 840/w,
				vSquares: 600/w,
				_background:true
			}
			var path = {obj: [obj]};
			draw.path.unshift(path);
			updateBorder(path);
		}
	},{
		name:'dots',
		text:'dots',
		set:function() {
			var w = 60;
			var obj = {
				type: 'simpleGrid',
				left: 180,
				top: 50,
				width: 840,
				height: 600,
				xMin: -0.01,
				xMax: 840/w + 0.01,
				yMin: -0.01,
				yMax: 600/w + 0.01,
				xMajorStep: 1,
				xMinorStep: 1,
				yMajorStep: 1,
				yMinorStep: 1,
				showLabels: false,
				showScales: false,
				dots: true,
				showGrid: false,
				showAxes: false,
				showBorder: false,
				color: '#000',
				thickness: 1,
				xZero: 0,
				yZero: 650,
				hSquares: 840/w,
				vSquares: 600/w,
				_background:true
			}
			var path = {obj: [obj]};
			draw.path.unshift(path);
			updateBorder(path);
		}
	},{
		name:'isoDots',
		text:'isometric',
		set:function() {
			var obj = {
				type: 'isoDotGrid',
				left: 180,
				top: 50,
				width: 840,
				height: 600,
				spacingFactor: 15,
				color: '#000',
				radius: 3,
				_background:true
			}
			var path = {obj: [obj]};
			draw.path.unshift(path);
			updateBorder(path);
		}
	},{
		name:'image',
		text:'import image...',
		set:function() {
			var img = draw.constructionsToolBackgrounds.img;
			if (un(img)) return;
			var width = img.naturalWidth;
			var height = img.naturalHeight;
			if (width === 0 || height === 0) return;
			if (width > 900) {
				height = 900*height/width;
				width = 900;
			}
			if (height > 650) {
				width = 650*width/height;
				height = 650;
			}
			draw.constructionsToolBackgrounds.imgStartWidth = width;
			var obj = {
				type: 'image',
				src: img.src,
				left:600-width/2,
				top:350-height/2,
				width:width,
				height:height,
				_image:img,
				_background:true
			}
			var path = {obj: [obj]};
			draw.path.unshift(path);
			updateBorder(path);
		}
	}],
	addElement:function(type,properties) {
		var element = document.createElement(type);
		for (var key in properties) {
			if (key === 'style') {
				this.style(element,properties.style);
			} else if (key === 'parent') {
				properties.parent.appendChild(element);
			} else {
				element[key] = properties[key];
			}
		}
		return element;
	},
	style:function(element,styles) {
		for (var key in styles) element.style[key] = styles[key];
	},
	buildDiv:function() {
		this.div = this.addElement('div',{style:{boxSizing:'border-box', width: '50%', right: '0.5%', top: '5.9%', position: 'absolute', backgroundColor: 'rgb(204, 153, 255)', border: '2px solid black', borderRadius: '5px', zIndex: '100', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial', textAlign: 'center', fontSize:'1.75vw'}});
		
		this.topDiv = this.addElement('div',{parent:this.div,style:{fontSize:'2vw',fontWeight:'bold',padding:'10px 0 0 0',width:'100%'},innerHTML:'Select Background'});
		
		this.middleDiv = this.addElement('div',{parent:this.div,style:{flexGrow:1,padding:'10px',width:'100%',display: 'flex', flexDirection: 'column'}});
			this.backgroundSelect = this.addElement('div',{parent:this.middleDiv,style:{display:'flex',width:'100%',alignItems: 'stretch',justifyContent: 'center'}});
				for (var i = 0; i < this.options.length; i++) {
					var option = this.options[i];
					option.div = this.addElement('div',{parent:this.backgroundSelect,style:{width:'18%',backgroundColor:'#FFF',borderTop:'2px solid black',borderBottom:'2px solid black',borderRight:'2px solid black',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center'},option:option});
					addListener(option.div,draw.constructionsToolBackgrounds.optionClick);
					if (i === 0) option.div.style.borderLeft = '2px solid black';
					
					option.imgDiv = this.addElement('div',{parent:option.div,style:{width:'100%',pointerEvents:'none',padding:'10% 0',flexGrow:'1'}});
						option.img = this.addElement('img',{parent:option.imgDiv,style:{width:option.name === 'image' ? '50%' : '80%',pointerEvents:'none'},src:'images/background-'+option.name+'.png'});
					option.nameDiv = this.addElement('div',{parent:option.div,style:{width:'100%',pointerEvents:'none',margin:'5px 0'},innerHTML:option.text});
					
				}
				if (un(this.option)) this.option = this.options[0];
				
			this.imageSelectContainer = this.addElement('div',{parent:this.middleDiv,style:{margin:'1% 6%',flexGrow:'1'}});
				this.imageSelectForm = this.addElement('form',{parent:this.imageSelectContainer,style:{display:'none',width:'100%',height:'100%',flexDirection:'column',alignItems: 'center',justifyContent: 'center',border:'2px dashed #666',borderRadius:'10px',backgroundColor:'#CFF',padding:'10px 0'},ondragenter:this.imageDrag,ondragover:this.imageDrag,ondragleave:this.imageDrag,ondrop:this.imageDrop});
					this.imageSelectInfo = this.addElement('div',{parent:this.imageSelectForm,style:{marginBottom: '10px'},innerHTML:'Drop image here, paste (Ctrl-v), or select file'});
					this.imageSelectInput = this.addElement('input',{type:'file',accept:'image/*',parent:this.imageSelectForm,style:{fontSize:'1.75vw'},onchange:this.imageInput,allowDefault:true});
			
				this.imageSizeSlider = this.addElement('input',{type:'range',allowDefault:true,min:0,max:100,parent:this.imageSelectContainer,style:{display:'none',width:'100%',marginTop:'15px'},oninput:this.imageSizeChange});
		/*this.bottomDiv = this.addElement('div',{parent:this.div,style:{display: 'flex', alignItems: 'center', padding:'10px',width:'100%'}});
			this.addElement('span',{parent:this.bottomDiv,style:{flexGrow:1}});
			this.closeButton = this.addElement('div',{parent:this.bottomDiv,style:{fontSize:'1.6vw',backgroundColor:'#CFC',padding:'5px 8px',cursor:'pointer',border: '1px solid black', borderRadius: '5px',margin:'0 20px'},innerHTML:'Close',onclick:draw.constructionsToolBackgrounds.hideDiv});*/
	},
	imageSizeChange:function(e) {
		var value = (e.target.value-e.target.min)/(e.target.max-e.target.min);
		var startWidth = draw.constructionsToolBackgrounds.imgStartWidth;
		var width = startWidth*(Math.pow(2.5,value)-0.5);
		var height = width * draw.constructionsToolBackgrounds.img.naturalHeight / draw.constructionsToolBackgrounds.img.naturalWidth;
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			for (var i = 0; i < path.obj.length; i++) {
				var obj = path.obj[i];
				if (obj._background === true && obj.type === 'image') {
					obj.left = 600-width/2;
					obj.top = 350-height/2;
					obj.width = width;
					obj.height = height;
				}
			}
		}
		drawCanvasPaths();
	},
	imageDrag:function(e) {
		e.preventDefault();
		e.stopPropagation();
	},
	imageDrop:function(e) {
		e.preventDefault();
		e.stopPropagation();
		for (var i = 0; i < e.dataTransfer.files.length; i++) {
			var file = e.dataTransfer.files[i];
			if (!file.type.match(/image.*/)) continue;
			var img = document.createElement("img");
			img.classList.add("obj");
			img.file = file;
			var reader = new FileReader();
			reader.onload = (function(img) {
				return function(e) {
					img.onload = function() {
						draw.constructionsToolBackgrounds.setImage(img);
					}
					img.src = e.target.result;
				}; 
			})(img);
			reader.readAsDataURL(file);
			break;
		}
	},
	imageInput:function(e) {
		e.preventDefault();
		e.stopPropagation();
		for (var i = 0; i < e.target.files.length; i++) {
			var file = e.target.files[0];
			var reader = new FileReader();
			if (!file.type.match(/image.*/)) continue;
			var img = document.createElement("img");
			img.classList.add("obj");
			img.file = file;
			reader.onload = (function(img) {
				return function(e) {
					img.onload = function() {
						draw.constructionsToolBackgrounds.setImage(img);
					}
					img.src = e.target.result;
				}; 
			})(img);
			reader.readAsDataURL(file);
			break;
		}
	},
	pasteImage: function(e) {
		if (un(file) || file.constructionsTool !== true) return;
		navigator.permissions.query({
			name:'clipboard-read'
		}).then(function(result) {
			if (result.state === 'granted') {
				navigator.clipboard.read().then(function(items) {
					var found = false;
					for (var i = 0; i < items.length; i++) {
						var item = items[i];
						for (var t = 0; t < item.types.length; t++) {
							var type = item.types[t];
							if (type.indexOf('image/') === 0) {
								item.getType(type).then(function(imgBlob) {
									var img = new Image;
									img.onload = function() {
										draw.constructionsToolBackgrounds.setImage(img);
									}
									img.src = URL.createObjectURL(imgBlob);
								});
								found = true;
								break;
							}
						}
						if (found === true) break;
					}
				});
			}
		});
	},
	setImage:function(img) {
		this.img = img;
		this.option = this.options.find(function(option) {return option.name === 'image'});
		this.setBackground();
	},
	setBackground:function() {
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			for (var i = 0; i < path.obj.length; i++) {
				var obj = path.obj[i];
				if (obj._background === true) {
					draw.path.splice(p,1);
					p--;
					break;
				}
			}
		}
		this.option.set();
		drawCanvasPaths();
		this.update();
	},
	showDiv:function() {
		if (un(file) || file.constructionsTool !== true) return;
		if (un(this.div)) this.buildDiv();
		this.update();
		draw.div.pageDiv.appendChild(this.div);		
		drawCanvasPaths();
	},
	hideDiv:function() {
		if (!un(draw.constructionsToolBackgrounds.div) && draw.constructionsToolBackgrounds.div.parentNode === draw.div.pageDiv) draw.div.pageDiv.removeChild(draw.constructionsToolBackgrounds.div);
		drawCanvasPaths();
	},
	toggleDiv:function() {
		if (!un(draw.constructionsToolBackgrounds.div) && draw.constructionsToolBackgrounds.div.parentNode === draw.div.pageDiv) {
			draw.div.pageDiv.removeChild(draw.constructionsToolBackgrounds.div);
			drawCanvasPaths();
		} else {
			draw.constructionsToolBackgrounds.showDiv();
		}
	},
	optionClick:function(e) {
		draw.constructionsToolBackgrounds.option = e.target.option;
		draw.constructionsToolBackgrounds.setBackground();
	},
	update:function() {
		if (un(file) || file.constructionsTool !== true) return;
		if (un(this.div)) this.buildDiv();
		for (var i = 0; i < this.options.length; i++) {
			var option = this.options[i];
			option.div.style.backgroundColor = this.option === option ? '#FF0' : '#FFF';
			if (option.name === 'image' && !un(this.img) && option.img.src !== this.img.src) {
				option.img.src = this.img.src;
			}
		}
		this.imageSelectForm.style.display = this.option.name === 'image' ? 'flex' : 'none';
		this.imageSizeSlider.style.display = this.option.name === 'image' && !un(this.img) ? 'block' : 'none';
	}
}
window.addEventListener('keyup', keyup ,false);
function keyup(e) {
	if (e.keyCode == 16) {
		shiftOn = false;
	} else if (e.keyCode == 17) {
		ctrlOn = false;
		if (snapToObj2Mode == 'ctrl') snapToObj2On = false;
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
	if (!un(draw.codeEditor) && draw.codeEditor.div.parentNode == container) {
		if (e.key == 'Escape') draw.codeEditor.close();
		return;
	}
	if (e.target.allowDefault === true) return;
	if (textEdit.obj !== null) return;	
	if (e.key == 'Tab') {
		e.preventDefault();
		cycleSelected(e.getModifierState('Shift'));
		return;
	}
	if (e.getModifierState('Control')) {
		//console.log(e.key);
		if (e.key == 'z' || e.key == 'Z') {
			e.preventDefault();
			draw.undo.undo();
		} else if (e.key == 'w' || e.key == 'W') {
			//console.log('ctrl=w, draw2');
			e.preventDefault(); // don't close tab
		} else if (e.key == 'y' || e.key == 'Y') {
			e.preventDefault();
			draw.undo.redo();
		} else if (e.key == 's' || e.key == 'S') {
			e.preventDefault();
			var objects = selObjs();
			for (var o = 0; o < objects.length; o++) {
				console.log(objects[o]);
			}
		} else if (e.key == 'o' || e.key == 'O') {
			e.preventDefault();
			console.log(selPath().obj);
		} else if (e.key == 'p' || e.key == 'P') {
			e.preventDefault();
			console.log(selPath());
		} else if (e.key == 'x' || e.key == 'X') {
			e.preventDefault();
			cutPaths(e);
		} else if (e.key == 'c' || e.key == 'C') {
			e.preventDefault();
			copyPaths(e);
		} else if (e.key == 'v' || e.key == 'V') {
			e.preventDefault();
			pastePaths(e);
		} else if (e.key == 'b' || e.key == 'B') {
			e.preventDefault();
			if (typeof textMenu !== 'undefined') textMenu.applyValue("bold",!textEdit.menu.currentStyle.bold);
		} else if (e.key == 'i' || e.key == 'I') {
			e.preventDefault();
			if (typeof textMenu !== 'undefined') textMenu.applyValue("italic",!textEdit.menu.currentStyle.italic);
		} else if (e.key == 'g' || e.key == 'G') {
			e.preventDefault();
			groupPaths();
		} else if (e.key == 'u' || e.key == 'U') {
			e.preventDefault();
			ungroupPaths();
		} else if (e.key == 't' || e.key == 'T') {
			e.preventDefault();
			//addTitle();
		} else if (e.key == 'd' || e.key == 'D') {
			e.preventDefault();
			clonePaths();
		} else if (e.key == 'a' || e.key == 'A') {
			e.preventDefault();
			selectAllPaths();
		} else if (e.key == 'q' || e.key == 'Q') {
			e.preventDefault();
			if (typeof textMenu !== 'undefined') textMenu.applyValue("font");
			//showCursorPositions();
		} else if (e.keyCode == 38) { // up
			e.preventDefault();
			//fontSizeUp();
		} else if (e.keyCode == 40) { // down
			e.preventDefault();
			//fontSizeDown();
		} else if (e.keyCode == 46) { // delete
			e.preventDefault();
			deleteSelectedPaths();			
		} else if (e.key == 'm' || e.key == 'M') {
			e.preventDefault();
			centerDistributeText();
		}
	} else if (e.getModifierState('Shift')) {
		if (e.keyCode == 37) { // left
			e.preventDefault();
			movePaths(-5,0);
		} else if (e.keyCode == 38) { // up
			e.preventDefault();
			movePaths(0,-5);
		} else if (e.keyCode == 39) { // right
			e.preventDefault();
			movePaths(5,0);
		} else if (e.keyCode == 40) { // down
			e.preventDefault();
			movePaths(0,5);
		}
	} else if (e.getModifierState('Alt')) {
		if (e.keyCode == 37) { // left
			e.preventDefault();
			movePaths(-1,0);
		} else if (e.keyCode == 38) { // up
			e.preventDefault();
			movePaths(0,-1);
		} else if (e.keyCode == 39) { // right
			e.preventDefault();
			movePaths(1,0);
		} else if (e.keyCode == 40) { // down
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
		} else if (e.key.toLowerCase() == 'e') {
			e.preventDefault();
			draw.text2.horizAlignToEquals();
		}
	}
}
/*window.addEventListener('paste', onpaste, false);
function onpaste(e) {
	// if ?
	console.log(event.clipboardData.getData('Text'));
};*/

/***************************/
/*	 	DRAWING OBJECTS    */
/***************************/

function drawClickFloodFillClick(e) {
	deselectAllPaths(false);
	updateMouse(e);
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	draw.fillPath.fillPolygonAtPoint(x,y);
}
function floodFill(canvas, startX, startY, fillColor) {
	startX = Math.round(startX);
	startY = Math.round(startY);
	var dstImg = canvas.ctx.getImageData(0,0,canvas.width,canvas.height);
	var dstData = dstImg.data;
	var alteredPixels = [];
	
	var startPos = getPixelPos(startX, startY);
	var startColor = {
		r: dstData[startPos],
		g: dstData[startPos+1],
		b: dstData[startPos+2],
		a: dstData[startPos+3]
	};
	var todo = [[startX,startY]];

	while (todo.length) {
		var pos = todo.pop();
		var x = pos[0];
		var y = pos[1];    
		var currentPos = getPixelPos(x, y);
		
		while((y-- >= 0) && matchStartColor(dstData, currentPos, startColor)) {
			currentPos -= canvas.width * 4;
		}

		currentPos += canvas.width * 4;
		++y;
		var reachLeft = false;
		var reachRight = false;

		while((y++ < canvas.height-1) && matchStartColor(dstData, currentPos, startColor)) {
			
			colorPixel(dstData, currentPos, fillColor);

			if (x > 0) {
				if (matchStartColor(dstData, currentPos-4, startColor)) {
					if (!reachLeft) {
						todo.push([x-1, y]);
						reachLeft = true;
					}
				} else if (reachLeft) {
					reachLeft = false;
				}
			}

			if (x < canvas.width-1) {
				if (matchStartColor(dstData, currentPos+4, startColor)) {
					if (!reachRight) {
						todo.push([x+1, y]);
						reachRight = true;
					}
				} else if (reachRight) {
					reachRight = false;
				}
			}

			currentPos += canvas.width * 4;
		}
	}
	return alteredPixels;
	
	function getPixelPos(x, y) {
		return (y * canvas.width + x) * 4;
	};
	function getPixelPosInverse(pos) {
		var pos2 = Math.floor(pos/4);
		return [pos2%canvas.width,Math.floor(pos2/canvas.width)];
	};
	function matchStartColor(data, pos, startColor) {
	  return (
		data[pos]   === startColor.r &&
		data[pos+1] === startColor.g &&
		data[pos+2] === startColor.b &&
		data[pos+3] === startColor.a);
	};
	function colorPixel(data, pos, color) {
		alteredPixels.push(getPixelPosInverse(pos));
		data[pos] = color.r || 0;
		data[pos+1] = color.g || 0;
		data[pos+2] = color.b || 0;
		data[pos+3] = color.hasOwnProperty("a") ? color.a : 255;
	};
};
function drawClickStartDraw() {
	deselectAllPaths(false);
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	if (draw.mode === 'edit' && snapToObj2On === true && draw.drawMode !== 'pen' && draw.drawMode !== 'eraser' && un(draw.snapToObjs)) {
		updateSnapPoints(); // update intersection points
		var pos = snapToObj2([x,y]);
		x = pos[0];
		y = pos[1];
	}
	draw.currentlyDrawingPaths = [];
	switch (draw.drawMode) {
		case 'interactText':
			deselectAllPaths(false);
			var x = draw.mouse[0];
			var y = draw.mouse[1];
			var obj = {
				type:"text2",
				text:[""],
				align:[-1,-1],
				font:!un(draw._interactTextFont) ? draw._interactTextFont : 'Arial',
				fontSize:40,
				color:draw.color,
				rect:[x,y-20,200,80],
				algPadding:0,
				fracScale:0.7,
				letterSpacingMode:'none',
				lineWrap:false,
				interact:{
					type:"text",
					multiLine:true,
					moveHandle:true,
					interactButtons:true,
					fitToText:true,
					deleteIfBlank:true
				}
			};
			if (draw.mode !== 'edit') obj.created = new Date().getTime();
			draw.path.push({
				obj:[obj],
				selected: true,
				time:Date.parse(new Date())
			});
			updateBorder(draw.path.last());
			drawCanvasPaths();
			changeDrawMode();
			textEdit.start(draw.path.length-1,obj,0);
			break;
		case 'eraser':
			draw.drawing = true;
			draw.prevX = x;
			draw.prevY = y;
			var time = Date.parse(new Date());
			var obj = {
				type:'eraser',
				//thickness:draw.thickness*5,
				thickness:24,
				pos:[[x,y]],
				_objs:[]
			};
			if (draw.mode !== 'edit') obj.created =  new Date().getTime();
			var path = {obj:[obj],selected:false,time:time};
			draw.path.push(path);
			for (var p = 0; p < draw.path.length; p++) {
				var path2 = draw.path[p];
				for (var i = 0; i < path2.obj.length; i++) {
					var obj2 = path2.obj[i];
					if (!un(obj2.created) && ['pen','line','arc','compassArc','point','text2','fillPath'].indexOf(obj2.type) > -1) {
						if (draw.currentlyDrawingPaths.indexOf(path2) === -1) draw.currentlyDrawingPaths.push(path2);
						if (un(obj2._erasers)) obj2._erasers = [];
						obj2._erasers.push(obj);
						obj._objs.push(obj2);
					}
				}
			};
			draw.currentlyDrawingPaths.push(path);
			draw.animate(eraserMove,eraserStop,drawCanvasPaths);
			break;
		case 'pen':
			draw.drawing = true;
			draw.prevX = x;
			draw.prevY = y;
			var time = Date.parse(new Date())
			var obj = {
				type:'pen',
				color:draw.color,
				thickness:draw.thickness,
				pos:[[x,y]]
			};
			if (!un(draw.dash) && draw.dash.length > 0) obj.dash = clone(draw.dash);
			if (draw.mode !== 'edit') obj.created =  new Date().getTime();
			var path = {obj:[obj],selected:false,time:time};
			draw.path.push(path);
			draw.currentlyDrawingPaths.push(path);
			draw.animate(penDrawMove,penDrawStop,drawCurrentlyDrawingPaths);
			break;
		case 'line':
			if (!un(draw._drawToolsCurrentTaskQuestion)) {
				var taskQuestion = draw._drawToolsCurrentTaskQuestion;
				if (typeof taskQuestion.maxDrawPaths === 'number') {
					if (taskQuestion.maxDrawPaths > 0) {
						draw.taskQuestion.drawTools.removeLastDrawPath(taskQuestion,undefined,taskQuestion.maxDrawPaths);
						drawCanvasPaths();
					}
				} else if (typeof taskQuestion.maxDrawPaths === 'object') {
					if (typeof taskQuestion.maxDrawPaths.lines === 'number' && taskQuestion.maxDrawPaths.lines > 0) {
						draw.taskQuestion.drawTools.removeLastDrawPath(taskQuestion,'line',taskQuestion.maxDrawPaths.lines);
						drawCanvasPaths();
					}
				}				
			}
			// if too many lines, delete oldest
			var lineCount = 0;
			for (var i = draw.path.length - 1; i >= 0; i--) {
				for (var o = 0; o < draw.path[i].obj.length; o++) {
					if (draw.path[i].obj[o].type == 'line') {
						lineCount++;
						if (lineCount >= draw.maxLines) {
							draw.path.splice(i,1);
						}
					}
				}
			}
			var point = [x,y];
			if (draw.snap == true) {
				updateSnapPoints();
				point = snapToPoints(point,draw.snapPoints,draw.snapTolerance);
			} else if (draw.gridSnap == true) {
				//startX = roundToNearest(startX,draw.gridSnapSize);
				//startY = roundToNearest(startY,draw.gridSnapSize);
			}
			if (snapToObj2On) {
				point = snapToObj2(point,-1);
			}

			draw.drawing = true;
			draw.startX = point[0];
			draw.startY = point[1];
			var obj = {
				type:'line',
				color:draw.color,
				thickness:draw.thickness,
				startPos:point,
				drawing:true
			};
			if (!un(draw.dash) && draw.dash.length > 0) obj.dash = clone(draw.dash);
			if (!un(draw._drawToolsCurrentTaskQuestion)) obj._taskQuestion = draw._drawToolsCurrentTaskQuestion;
			if (draw.mode !== 'edit') obj.created =  new Date().getTime();
			if (boolean(draw.vector,false)) {
				obj.endMid = 'open';
				obj.endMidSize = draw.thickness*5;
			}			
			var path = {obj:[obj],selected:false};
			draw.path.push(path);
			draw.currentlyDrawingPaths.push(path);
			draw.animate(lineDrawMove,lineDrawStop,drawCurrentlyDrawingPaths);
			break;
		case 'rect' :
		case 'square' :
			var startX = x;
			var startY = y;
			if (draw.gridSnap == true) {
				startX = roundToNearest(startX,draw.gridSnapSize);
				startY = roundToNearest(startY,draw.gridSnapSize);
			}
			draw.drawing = true;
			draw.startX = startX;
			draw.startY = startY;								
			var path = {obj:[{
				type:draw.drawMode,
				color:draw.color,
				thickness:draw.thickness,
				fillColor:draw.fillColor,
				startPos:[startX,startY],
				edit:false
			}],selected:false};
			draw.path.push(path);
			draw.currentlyDrawingPaths.push(path);
			draw.animate(rectDrawMove,rectDrawStop,drawCurrentlyDrawingPaths);
			break;
		case 'polygon' :
			var pos = [x,y];
			if (draw.gridSnap == true) {
				pos = [roundToNearest(startX,draw.gridSnapSize),roundToNearest(startY,draw.gridSnapSize)];
			}
			if (snapToObj2On) {
				pos = snapToObj2(pos,-1);
			}
			draw.drawing = true;
			draw.startX = startX;
			draw.startY = startY;					
			var path = {obj:[{
				type:draw.drawMode,
				color:draw.color,
				thickness:draw.thickness,
				fillColor:draw.fillColor,
				points:[pos,[]],
				closed:false,
				lineDecoration:[],
				angles:[],
				clockwise:true,
				edit:false,
				drawing:true
			}],selected:false};
			draw.path.push(path);
			draw.currentlyDrawingPaths.push(path);
			changeDrawMode('polygon-drawing');
			draw.animate(polygonDrawMove,polygonDrawStop,drawCurrentlyDrawingPaths);
			break;			
		case 'circle' :
			var startX = x;
			var startY = y;
			if (draw.gridSnap == true) {
				startX = roundToNearest(startX,draw.gridSnapSize);
				startY = roundToNearest(startY,draw.gridSnapSize);
			}
			draw.drawing = true;
			draw.startX = startX;
			draw.startY = startY;					
			var path = {obj:[{
				type:draw.drawMode,
				color:draw.color,
				thickness:draw.thickness,
				fillColor:draw.fillColor,
				center:[startX,startY],
				radius:0,
				showCenter:true,
				edit:false
			}],selected:false};
			draw.path.push(path);
			draw.currentlyDrawingPaths.push(path);
			draw.animate(circleDrawMove,circleDrawStop,drawCurrentlyDrawingPaths);	
			break;
		case 'point' :
			if (!un(draw._drawToolsCurrentTaskQuestion)) {
				var taskQuestion = draw._drawToolsCurrentTaskQuestion;
				if (typeof taskQuestion.maxDrawPaths === 'number') {
					if (taskQuestion.maxDrawPaths > 0) {
						draw.taskQuestion.drawTools.removeLastDrawPath(taskQuestion,undefined,taskQuestion.maxDrawPaths);
						drawCanvasPaths();
					}
				} else if (typeof taskQuestion.maxDrawPaths === 'object') {
					if (typeof taskQuestion.maxDrawPaths.points === 'number' && taskQuestion.maxDrawPaths.points > 0) {
						draw.taskQuestion.drawTools.removeLastDrawPath(taskQuestion,'point',taskQuestion.maxDrawPaths.points);
						drawCanvasPaths();
					}
				}				
			}
			var startX = x;
			var startY = y;
			if (draw.gridSnap == true) {
				startX = roundToNearest(startX,draw.gridSnapSize);
				startY = roundToNearest(startY,draw.gridSnapSize);
			}
			var point = [startX,startY];
			if (snapToObj2On == true) {
				point = snapToObj2(point,-1);
				var pointAlreadyExists = false;
				for (var p = 0; p < draw.path.length; p++) {
					var path = draw.path[p];
					for (var i = 0; i < path.obj.length; i++) {
						var obj2 = path.obj[i];
						if (obj2.type === 'point' && point[0] === obj2.center[0] && point[1] === obj2.center[1]) {
							pointAlreadyExists = true;
							point = [startX,startY];
							break;
						}
					}
					if (pointAlreadyExists === true) break;
				}
			}
			var tp = false;
			var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(draw.path,false);
			if (tracingPapers.length > 0) {
				for (var t = 0; t < tracingPapers.length; t++) {
					if (un(tracingPapers[t]._polygon)) continue;
					if (hitTestPolygon(point,tracingPapers[t]._polygon) === true) {
						var tp = tracingPapers[t];
						break;
					}
				}
			}
						
			if (tp !== false) {
				if (un(tp.drawPaths)) tp.drawPaths = [];
				var drawPath = {
					type:'point',
					color:draw.color,
					pos:draw.tracingPaper.drawPosToTracingPaperPos(tp,point),
					radius:draw.thickness*1.5
				};
				if (draw.mode !== 'edit') drawPath.created =  new Date().getTime();
				tp.drawPaths.push(drawPath);
			} else {
				var obj = {
					type:draw.drawMode,
					color:draw.color,
					thickness:draw.thickness,
					fillColor:draw.fillColor,
					center:point,
					radius:draw.thickness*1.5,
					showCenter:false,
					edit:false,
					created:new Date().getTime()
				};
				if (!un(draw._drawToolsCurrentTaskQuestion)) obj._taskQuestion = draw._drawToolsCurrentTaskQuestion;
				if (draw.mode !== 'edit') obj.created =  new Date().getTime();
				draw.path.push({obj:[obj],selected:false});
			}
			drawCanvasPaths();
			break;			
		case 'ellipse' :
			var startX = x;
			var startY = y;
			if (draw.gridSnap == true) {
				startX = roundToNearest(startX,draw.gridSnapSize);
				startY = roundToNearest(startY,draw.gridSnapSize);
			}
			draw.drawing = true;
			draw.startX = startX;
			draw.startY = startY;					
			var path = {obj:[{
				type:draw.drawMode,
				color:draw.color,
				thickness:draw.thickness,
				fillColor:draw.fillColor,
				center:[startX,startY],
				radiusX:0,
				radiusY:0,
				showCenter:true,
				edit:false
			}],selected:false};
			draw.path.push(path);
			draw.currentlyDrawingPaths.push(path);		
			draw.animate(ellipseDrawMove,ellipseDrawStop,drawCurrentlyDrawingPaths);	
			break;
	}
	//drawCanvasPaths();
	//drawSelectCanvas();	
};

function drawCurrentlyDrawingPaths() {
	drawSelectedPaths();
	/*while (draw.drawCanvas.length < 4) addDrawCanvas();
	draw.drawCanvas[1].ctx.clear();
	drawPathsToCanvas(draw.drawCanvas[1],draw.currentlyDrawingPaths);*/
}

function eraserMove(e) {
	updateMouse(e);
	var pos = draw.mouse;
	if (pos[0] !== draw.prevX || pos[1] !== draw.prevY) {
		draw.path.last().obj[0].pos.push(clone(pos));
		draw.prevX = pos[0];
		draw.prevY = pos[1];
	}
}
function eraserStop(e) {
	draw.prevX = null;
	draw.prevY = null;
	draw.drawing = false;
	drawCanvasPaths();
}
function penDrawMove(e) {
	updateMouse(e);
	var pos = draw.mouse;
	if (pos[0] !== draw.prevX || pos[1] !== draw.prevY) {
		draw.path.last().obj[0].pos.push(clone(pos));
		draw.prevX = pos[0];
		draw.prevY = pos[1];
	}
}
function penDrawStop(e) {
	draw.prevX = null;
	draw.prevY = null;
	draw.drawing = false;
	
	var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(draw.path,false);
	if (tracingPapers.length > 0) {
		var path = draw.path.pop();
		var obj = path.obj[0];
		var pos = obj.pos;
		var drawPath = {
			type:'pen',
			color:obj.color,
			thickness:obj.thickness,
			pos:[],
			created:obj.created
		};
		if (!un(obj.dash)) drawPath.dash = obj.dash;
		
		for (var t = 0; t < tracingPapers.length; t++) {
			var tp = tracingPapers[t];
			if (un(tp._polygon)) continue;
			var prevPointOnTracingPaper = false;
			if (hitTestPolygon(pos[0],tp._polygon) === true) {
				if (un(tp.drawPaths)) tp.drawPaths = [];
				prevPointOnTracingPaper = true;
				var tpPos = draw.tracingPaper.drawPosToTracingPaperPos(tp,pos[0]);
				var drawPath2 = clone(drawPath);
				drawPath2.pos.push(tpPos);
				tp.drawPaths.push(drawPath2);
			} else {
				var drawPath2 = clone(drawPath);
				drawPath2.pos.push(pos[0]);
				var path = {obj:[drawPath2],selected:false};
				draw.path.push(path);
			}
			for (var p = 1; p < pos.length; p++) {
				if (hitTestPolygon(pos[p],tp._polygon) === true) {
					var tpPos = draw.tracingPaper.drawPosToTracingPaperPos(tp,pos[p]);
					if (prevPointOnTracingPaper === true) {
						tp.drawPaths.last().pos.push(tpPos);
					} else {
						if (un(tp.drawPaths)) tp.drawPaths = [];
						var tpDrawPath = clone(drawPath);
						
						var p1 = pos[p-1];
						var p2 = pos[p];
						var intPoint = false;
						for (var l = 0; l < tp._polygon.length; l++) {
							var p3 = tp._polygon[l];
							var p4 = tp._polygon[(l+1)%tp._polygon.length];
							if (lineSegmentsIntersectionTest([p1,p2],[p3,p4]) === true) {
								intPoint = linesIntersection([p1,p2],[p3,p4]);
								break;
							}
						}
						if (intPoint !== false) {
							draw.path.last().obj[0].pos.push(intPoint);
							var tpIntPoint = draw.tracingPaper.drawPosToTracingPaperPos(tp,intPoint);
							tpDrawPath.pos.push(tpIntPoint);
						}
						
						tpDrawPath.pos.push(tpPos);
						tp.drawPaths.push(tpDrawPath);
					}
					prevPointOnTracingPaper = true;
				} else {
					if (prevPointOnTracingPaper === true) {
						var drawPath2 = clone(drawPath);
						
						var p1 = pos[p-1];
						var p2 = pos[p];
						var intPoint = false;
						for (var l = 0; l < tp._polygon.length; l++) {
							var p3 = tp._polygon[l];
							var p4 = tp._polygon[(l+1)%tp._polygon.length];
							if (lineSegmentsIntersectionTest([p1,p2],[p3,p4]) === true) {
								intPoint = linesIntersection([p1,p2],[p3,p4]);
								break;
							}
						}
						if (intPoint !== false) {
							drawPath2.pos.push(intPoint);
							var tpIntPoint = draw.tracingPaper.drawPosToTracingPaperPos(tp,intPoint);
							tp.drawPaths.last().pos.push(tpIntPoint);
						}
						
						drawPath2.pos.push(pos[p]);
						var path = {obj:[drawPath2],selected:false};
						draw.path.push(path);						
					} else {
						draw.path.last().obj[0].pos.push(pos[p]);
					}
					prevPointOnTracingPaper = false;
				}
			}
			
		}
	}
	drawCanvasPaths();

	/*var pathNum = draw.path.length-1;
	if (draw.groupPenPaths !== false) {
		for (var i = draw.path.length-2; i > -1; i--) {
			if (typeof draw.path[i].obj == 'object') {
				var penPath = true;
				for (var j = 0; j < draw.path[i].obj.length; j++) {
					if (draw.path[i].obj[j].type !== 'pen') {
						penPath = false;
					}
				}
				if (penPath == true) {
					pathNum = i;
					break;
				}
			}
		}
	}
	if (pathNum < draw.path.length-1) {
		var path = draw.path[pathNum];
		path.obj.push(draw.path[draw.path.length-1].obj[0]);
		removePathObject(draw.path.length-1);
	} else {
		var path = draw.path[draw.path.length-1];
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
	drawCanvasPaths();*/
}
function lineDrawMove(e) {
	updateMouse(e);
	var pos = clone(draw.mouse);
	var pathNum = draw.path.length - 1;
	var obj = draw.path[pathNum].obj[0];
	if (draw.drawMode == 'lineStart') {
		if (shiftOn) {
			if (Math.abs(obj.finPos[0]-pos[0]) < Math.abs(obj.finPos[1]-pos[1])) {
				pos = [obj.finPos[0],pos[1]];
			} else {
				pos = [pos[0],obj.finPos[1]];
			}
		}
		var outOfDrawArea = false;
		if (!un(draw._drawToolsCurrentTaskQuestion)) {
			var drawArea = draw._drawToolsCurrentTaskQuestion._drawArea;
			var l = drawArea[0];
			var t = drawArea[1];
			var r = drawArea[0]+drawArea[2];
			var b = drawArea[1]+drawArea[3];
			if (pos[0] < l || pos[0] > r || pos[1] < t || pos[1] > b) {
				outOfDrawArea = true;
				if (lineSegmentsIntersectionTest([pos,obj.finPos],[[l,t],[l,b]]) === true) {
					pos = intersection([pos,obj.finPos],[[l,t],[l,b]]);
				} else if (lineSegmentsIntersectionTest([pos,obj.finPos],[[r,t],[r,b]]) === true) {
					pos = intersection([pos,obj.finPos],[[r,t],[r,b]]);
				} else if (lineSegmentsIntersectionTest([pos,obj.finPos],[[l,t],[r,t]]) === true) {
					pos = intersection([pos,obj.finPos],[[l,t],[r,t]]);
				} else if (lineSegmentsIntersectionTest([pos,obj.finPos],[[l,b],[r,b]]) === true) {
					pos = intersection([pos,obj.finPos],[[l,b],[r,b]]);
				}
			} 
		}
		if (outOfDrawArea === false && shiftOn !== true && (snapToObj2On || draw.snapLinesTogether)) {
			pos = snapToObj2([pos[0],pos[1]],pathNum);
		}	
		obj.startPos = pos;
	} else if (draw.drawMode == 'lineFin' || draw.drawMode == 'line') {
		if (shiftOn) {
			if (Math.abs(obj.startPos[0]-pos[0]) < Math.abs(obj.startPos[1]-pos[1])) {
				pos = [obj.startPos[0],pos[1]];
			} else {
				pos = [pos[0],obj.startPos[1]];
			}
		}
		var outOfDrawArea = false;
		if (!un(draw._drawToolsCurrentTaskQuestion)) {
			var drawArea = draw._drawToolsCurrentTaskQuestion._drawArea;
			var l = drawArea[0];
			var t = drawArea[1];
			var r = drawArea[0]+drawArea[2];
			var b = drawArea[1]+drawArea[3];
			if (pos[0] < l || pos[0] > r || pos[1] < t || pos[1] > b) {
				outOfDrawArea = true;
				if (lineSegmentsIntersectionTest([pos,obj.startPos],[[l,t],[l,b]]) === true) {
					pos = intersection(pos,obj.startPos,[l,t],[l,b]);
				} else if (lineSegmentsIntersectionTest([pos,obj.startPos],[[r,t],[r,b]]) === true) {
					pos = intersection(pos,obj.startPos,[r,t],[r,b]);
				} else if (lineSegmentsIntersectionTest([pos,obj.startPos],[[l,t],[r,t]]) === true) {
					pos = intersection(pos,obj.startPos,[l,t],[r,t]);
				} else if (lineSegmentsIntersectionTest([pos,obj.startPos],[[l,b],[r,b]]) === true) {
					pos = intersection(pos,obj.startPos,[l,b],[r,b]);
				}
			} 
		}
		if (outOfDrawArea === false && shiftOn !== true && (snapToObj2On || draw.snapLinesTogether)) {
			pos = snapToObj2([pos[0],pos[1]],pathNum);
		}
		obj.finPos = pos;		
	}	
}
function lineDrawStop(e) {
	//console.log('lineDrawStop');
	//removeListenerMove(window,lineDrawMove);
	removeListenerMove(window,rulerDrawMove1);
	removeListenerMove(window,rulerDrawMove2);	
	removeListenerEnd(window,lineDrawStop);
	draw.startX = null;
	draw.startY = null;
	draw.drawing = false;
	
	var path = draw.path.last();
	var obj = path.obj[0];
	if (typeof obj.finPos == 'undefined' || getDist(obj.startPos,obj.finPos) < 5) {
		removePathObject(draw.path.length-1);
		if (draw.defaultMode == 'select') {
			changeDrawMode();
		}
	} else {
		if (draw.gridSnap == true && shiftOn == false) {
			obj.finPos[0] = roundToNearest(obj.finPos[0],draw.gridSnapSize);
			obj.finPos[1] = roundToNearest(obj.finPos[1],draw.gridSnapSize);			
		}
		if (draw.defaultMode == 'select') {
			path.selected = true;
			updateBorder(path);
			changeDrawMode();
		} else {
			path.selected = false;
		}
		path.trigger = [];	

		for (var i = 0; i < draw.path.length; i++) {
			for (var j = 0; j < draw.path[i].obj.length; j++) {
				draw.path[i].obj[j].drawing = false;
			}
		}
		updateBorder(path);
	
	
		var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(draw.path,false);
		if (tracingPapers.length > 0) {
			var p1 = obj.startPos;
			var p2 = obj.finPos;
			var drawPath = {
				type:'line',
				color:obj.color,
				thickness:obj.thickness,
				created:obj.created
			};
			if (!un(obj.dash)) drawPath.dash = obj.dash;
			
			for (var t = 0; t < tracingPapers.length; t++) {
				var tp = tracingPapers[t];
				if (un(tp._polygon)) continue;
				var p1OnTp = hitTestPolygon(p1,tp._polygon);
				var p2OnTp = hitTestPolygon(p2,tp._polygon);
				if (p1OnTp === true && p2OnTp === true) {
					draw.path.pop();
					if (un(tp.drawPaths)) tp.drawPaths = [];
					p1 = draw.tracingPaper.drawPosToTracingPaperPos(tp,p1);
					p2 = draw.tracingPaper.drawPosToTracingPaperPos(tp,p2);
					var drawPath2 = clone(drawPath);
					drawPath2.pos = [p1,p2];
					tp.drawPaths.push(drawPath2);
				} else if (p1OnTp === true && p2OnTp === false) {
					var intPoint = false;
					for (var l = 0; l < tp._polygon.length; l++) {
						var p3 = tp._polygon[l];
						var p4 = tp._polygon[(l+1)%tp._polygon.length];
						if (lineSegmentsIntersectionTest([p1,p2],[p3,p4]) === true) {
							intPoint = linesIntersection([p1,p2],[p3,p4]);
							break;
						}
					}
					if (intPoint === false) continue;
					var tpDrawPath = clone(drawPath);
					tpDrawPath.pos = [draw.tracingPaper.drawPosToTracingPaperPos(tp,p1),draw.tracingPaper.drawPosToTracingPaperPos(tp,intPoint)];
					if (un(tp.drawPaths)) tp.drawPaths = [];
					tp.drawPaths.push(tpDrawPath);
					obj.startPos = intPoint;			
				} else if (p1OnTp === false && p2OnTp === true) {
					var intPoint = false;
					for (var l = 0; l < tp._polygon.length; l++) {
						var p3 = tp._polygon[l];
						var p4 = tp._polygon[(l+1)%tp._polygon.length];
						if (lineSegmentsIntersectionTest([p1,p2],[p3,p4]) === true) {
							intPoint = linesIntersection([p1,p2],[p3,p4]);
							break;
						}
					}
					if (intPoint === false) continue;
					var tpDrawPath = clone(drawPath);
					tpDrawPath.pos = [draw.tracingPaper.drawPosToTracingPaperPos(tp,intPoint),draw.tracingPaper.drawPosToTracingPaperPos(tp,p2)];
					if (un(tp.drawPaths)) tp.drawPaths = [];
					tp.drawPaths.push(tpDrawPath);
					obj.finPos = intPoint;
				} else if (p1OnTp === false && p2OnTp === false) {
					var intPoints = [];
					for (var l = 0; l < tp._polygon.length; l++) {
						var p3 = tp._polygon[l];
						var p4 = tp._polygon[(l+1)%tp._polygon.length];
						if (lineSegmentsIntersectionTest([p1,p2],[p3,p4]) === true) {
							intPoints.push(linesIntersection([p1,p2],[p3,p4]));
						}
					}
					if (intPoints.length === 2) {
						if (p1[0] < p2[0]) {
							if (intPoints[0][0] > intPoints[1][0]) intPoints.reverse();
						} else if (p1[0] > p2[0]) {
							if (intPoints[0][0] < intPoints[1][0]) intPoints.reverse();							
						} else if (p1[1] < p2[1]) {
							if (intPoints[0][1] > intPoints[1][1]) intPoints.reverse();							
						} else if (p1[1] > p2[1]) {
							if (intPoints[0][1] < intPoints[1][1]) intPoints.reverse();							
						}
						obj.finPos = intPoints[0];
						var tpDrawPath = clone(drawPath);
						tpDrawPath.pos = [draw.tracingPaper.drawPosToTracingPaperPos(tp,intPoints[0]),draw.tracingPaper.drawPosToTracingPaperPos(tp,intPoints[1])];
						if (un(tp.drawPaths)) tp.drawPaths = [];
						tp.drawPaths.push(tpDrawPath);
						var drawPath2 = clone(drawPath);
						drawPath.startPos = intPoints[1];
						drawPath.finPos = p2;
						draw.path.push({obj:[drawPath],selected:false});						
					}
					
				}
			}
		}
	}
	
	if (typeof redrawButtons === 'function') redrawButtons();
	drawCanvasPaths();
	//if (draw.mode === 'edit' && !un(draw.contextMenu)) draw.contextMenu.update();		
}
function rectDrawMove(e) {
	//var x = draw.getRelMouseX(e), y = draw.getRelMouseY();
	updateMouse(e);
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	if (draw.drawMode == 'square') {
		var dx = x-draw.path[draw.path.length-1].obj[0].startPos[0];
		var dy = y-draw.path[draw.path.length-1].obj[0].startPos[1];
		if (Math.abs(dx) >= Math.abs(dy)) {
			x = draw.path[draw.path.length-1].obj[0].startPos[0] + dx;
			y = draw.path[draw.path.length-1].obj[0].startPos[1] + dx;
		} else {
			x = draw.path[draw.path.length-1].obj[0].startPos[0] + dy;
			y = draw.path[draw.path.length-1].obj[0].startPos[1] + dy;			
		}
	}

	draw.path[draw.path.length-1].obj[0].finPos = [x,y];
	//drawSelectedPaths();
}
function rectDrawStop(e) {
	//removeListenerMove(window,rectDrawMove);
	//removeListenerEnd(window,rectDrawStop);
	draw.startX = null;
	draw.startY = null;
	draw.drawing = false;
	
	if (typeof draw.path[draw.path.length-1].obj[0].finPos == 'undefined' || dist(draw.path[draw.path.length-1].obj[0].startPos[0],draw.path[draw.path.length-1].obj[0].startPos[1],draw.path[draw.path.length-1].obj[0].finPos[0],draw.path[draw.path.length-1].obj[0].finPos[1]) < 5) {
		draw.path.pop();
	} else if (draw.gridSnap == true) {
		draw.path[draw.path.length-1].obj[0].finPos[0] = roundToNearest(draw.path[draw.path.length-1].obj[0].finPos[0],draw.gridSnapSize);
		draw.path[draw.path.length-1].obj[0].finPos[1] = roundToNearest(draw.path[draw.path.length-1].obj[0].finPos[1],draw.gridSnapSize);
	}
	
	changeDrawMode();
	draw.path[draw.path.length-1].selected = true;
	// trigger array
	draw.path[draw.path.length-1].trigger = [];	

	redrawButtons();
	updateBorder(draw.path.last());
	drawCanvasPaths();		
}
function polygonDrawMove(e) {
	updateMouse(e);
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	var obj = draw.path[draw.path.length-1].obj[0];
	if (shiftOn == true) {
		var dx = x - obj.points[obj.points.length-2][0];
		var dy = y - obj.points[obj.points.length-2][1];
		if (Math.abs(dx/dy) >= 1) {
			// horizontal line
			var newPoint = [Math.min(Math.max(x,draw.drawArea[0]),draw.drawArea[0]+draw.drawArea[2]),obj.points[obj.points.length-2][1]];
		} else {
			// vertical line
			var newPoint = [obj.points[obj.points.length-2][0],Math.min(Math.max(y,draw.drawArea[1]),draw.drawArea[1]+draw.drawArea[3])];
		}
	} else {
		var newPoint = [Math.min(Math.max(x,draw.drawArea[0]),draw.drawArea[0]+draw.drawArea[2]),Math.min(Math.max(y,draw.drawArea[1]),draw.drawArea[1]+draw.drawArea[3])];
		if (snapToObj2On || draw.snapLinesTogether) {
			newPoint = snapToObj2(newPoint,draw.path.length - 1);
		}
	}
	obj.points[obj.points.length-1] = newPoint;
	if (obj.points.length >= 2) obj.clockwise = polygonClockwiseTest(obj.points);
	
	//drawSelectedPaths();
}
function polygonDrawStop(e) {
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	var obj = draw.path[draw.path.length-1].obj[0];
	if (obj.points.length > 2 && dist(x,y,obj.points[0][0],obj.points[0][1]) < draw.selectTolerance * 2) {
		// close polygon
		//removeListenerMove(window,polygonDrawMove);
		//removeListenerEnd(window,polygonDrawStop);
		obj.closed = true;
		obj.drawing = false;
		obj.points.pop();
		if (obj.clockwise == true) {
			obj.points.reverse();
			obj.clockwise = false;
		}
		draw.startX = null;
		draw.startY = null;
		draw.drawing = false;
		changeDrawMode();
		obj.angles = [];
		for (var p = 0; p < obj.points.length; p++) {
			obj.angles[p] = {style:0,radius:30,labelMeasure:true,labelFontSize:25,labelRadius:33,drawCurve:false,measureLabelOnly:true};
		}		
		draw.path[draw.path.length-1].selected = true;
		draw.path[draw.path.length-1].trigger = [];
		redrawButtons();
		updateBorder(draw.path.last());
		drawCanvasPaths();
		//if (draw.mode === 'edit' && !un(draw.contextMenu)) draw.contextMenu.update();		
	} else if (dist(obj.points[obj.points.length-2][0],obj.points[obj.points.length-2][1],obj.points[obj.points.length-1][0],obj.points[obj.points.length-1][1]) < draw.selectTolerance * 2) {
		// leave polygon open
		//removeListenerMove(window,polygonDrawMove);
		//removeListenerEnd(window,polygonDrawStop);
		obj.drawing = false;
		obj.points.pop();
		if (obj.clockwise == true) {
			obj.points.reverse();
			obj.clockwise = false;
		}		
		draw.startX = null;
		draw.startY = null;
		draw.drawing = false;
		changeDrawMode();
		obj.angles = [];
		for (var p = 1; p < obj.points.length-1; p++) {
			obj.angles[p] = {style:0,radius:30,labelMeasure:true,labelFontSize:25,labelRadius:33,drawCurve:false,measureLabelOnly:true};
		}
		draw.path[draw.path.length-1].selected = true;
		draw.path[draw.path.length-1].trigger = [];
		redrawButtons();
		updateBorder(draw.path.last());
		if (obj.points.length == 1) draw.path.pop();
		drawCanvasPaths();
		//if (draw.mode === 'edit' && !un(draw.contextMenu)) draw.contextMenu.update();		
	} else {
		var newPoint = [x,y];
		if (draw.gridSnap == true) {
			newPoint[0] = roundToNearest(newPoint[0],draw.gridSnapSize);
			newPoint[1] = roundToNearest(newPoint[1],draw.gridSnapSize);
		}		
		obj.points.push(newPoint);
		//drawSelectedPaths();
		draw.animate(polygonDrawMove,polygonDrawStop,drawSelectedPaths);
		//if (draw.mode === 'edit' && !un(draw.contextMenu)) draw.contextMenu.update();		
	}
}
function circleDrawMove(e) {
	//var x = draw.getRelMouseX(e), y = draw.getRelMouseY();
	updateMouse(e);
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	draw.path[draw.path.length-1].obj[0].radius = Math.abs(dist(x,y,draw.path[draw.path.length-1].obj[0].center[0],draw.path[draw.path.length-1].obj[0].center[1]));
	draw.path[draw.path.length-1].obj[0].showCenter = true;
	//redrawButtons();
	//drawSelectedPaths();
}
function circleDrawStop(e) {
	//removeListenerMove(window,circleDrawMove);
	//removeListenerEnd(window,circleDrawStop);
	draw.startX = null;
	draw.startY = null;
	draw.drawing = false;
	
	if (draw.gridSnap == true) {
		draw.path[draw.path.length-1].obj[0].radius = roundToNearest(draw.path[draw.path.length-1].obj[0].radius,draw.gridSnapSize);
	}
	draw.path[draw.path.length-1].obj[0].showCenter = false;
	
	changeDrawMode();
	draw.path[draw.path.length-1].selected = true;
	draw.path[draw.path.length-1].trigger = [];	
	redrawButtons();
	updateBorder(draw.path.last());
	drawCanvasPaths();
}
function ellipseDrawMove(e) {
	//var x = draw.getRelMouseX(e), y = draw.getRelMouseY();
	updateMouse(e);
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	draw.path[draw.path.length-1].obj[0].radiusX = Math.abs(x-draw.path[draw.path.length-1].obj[0].center[0]);
	draw.path[draw.path.length-1].obj[0].radiusY = Math.abs(y-draw.path[draw.path.length-1].obj[0].center[1]);	

	draw.path[draw.path.length-1].obj[0].showCenter = true;
	//drawSelectedPaths();
}
function ellipseDrawStop(e) {
	//removeListenerMove(window,ellipseDrawMove);
	//removeListenerEnd(window,ellipseDrawStop);
	draw.startX = null;
	draw.startY = null;
	draw.drawing = false;
	
	if (draw.gridSnap == true) {
		draw.path[draw.path.length-1].obj[0].radiusX = roundToNearest(draw.path[draw.path.length-1].obj[0].radiusX,draw.gridSnapSize);
		draw.path[draw.path.length-1].obj[0].radiusY = roundToNearest(draw.path[draw.path.length-1].obj[0].radiusY,draw.gridSnapSize);		
	}

	draw.path[draw.path.length-1].obj[0].showCenter = false;
	
	changeDrawMode();
	draw.path[draw.path.length-1].selected = true;
	draw.path[draw.path.length-1].trigger = [];	
	redrawButtons();
	updateBorder(draw.path.last());
	drawCanvasPaths();		
}

/***************************/
/* GENERAL OBJ INTERACTION */
/***************************/

draw.getPathOfObj = function(obj) {
	if (!un(obj._path)) return obj._path;
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		for (var o = 0; o < path.obj.length; o++) {
			if (obj == path.obj[o]) return path;
		}
	}
	return false;
}
draw.getPathById = function(id) {
	if (!un(draw.ids.path[id])) return draw.ids.path[id];
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].id == id) return draw.path[p];
	}
	for (var p = 0; p < draw.path.length; p++) {
		for (var o = 0; o < draw.path[p].obj.length; o++) {
			if (draw.path[p].obj[o].id === id) return draw.path[p].obj[o]._path;
		}
	}
	return false;
}
draw.getObjById = function(id) {
	if (!un(draw.ids.obj[id])) {
		var obj = draw.ids.obj[id];
		if (typeof obj._path !== 'object') obj._path = draw.getPathOfObj(obj);
		return obj;
	}
	for (var p = 0; p < draw.path.length; p++) {
		for (var o = 0; o < draw.path[p].obj.length; o++) {
			if (draw.path[p].obj[o].id === id) return draw.path[p].obj[o];
		}
	}
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].id == id) return draw.path[p];
	}
	return false;
}
draw.getObjs = function(type) {
	var objs = [];
	for (var p = 0; p < draw.path.length; p++) {
		for (var o = 0; o < draw.path[p].obj.length; o++) {
			if (!un(type) && draw.path[p].obj[o].type !== type) continue;
			draw.path[p].obj[o]._path = draw.path[p];
			objs.push(draw.path[p].obj[o]);
		}
	}
	return objs;
}
draw.objs = function(func) {
	/* apply a function to all objects
	draw.objs(function(obj) {
		if (!un(obj.interact) && !un(obj.interact.update)) obj.interact.update(obj);
	});
	*/
	for (var p = 0; p < draw.path.length; p++) {
		for (var o = 0; o < draw.path[p].obj.length; o++) {
			func(draw.path[p].obj[o],draw.path[p]);
		}
	}
}
draw.ids = {
	obj:{},
	path:{},
	update:function() {
		draw.ids.obj = {};
		draw.ids.path = {};
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (!un(path.id)) {
				if (!un(draw.ids.path[path.id])) {
					if (draw.mode === 'edit') console.log('paths with same id:',draw.ids.path[path.id],path);
				} else {
					draw.ids.path[path.id] = path;
				}
			}
			for (var o2 = 0; o2 < path.obj.length; o2++) {
				var obj = path.obj[o2];
				if (!un(obj.id)) {
					if (!un(draw.ids.obj[obj.id])) {
						if (!un(obj._taskQuestion) || (!un(obj._path) && !un(obj._path._taskQuestion))) continue;
						if (!un(obj._starterQuestion) || (!un(obj._path) && !un(obj._path._starterQuestion))) continue;
						if (draw.mode === 'edit') console.log('objs with same id:',draw.ids.obj[obj.id],obj);
					} else {
						draw.ids.obj[obj.id] = obj;
					}
				}
			}
		}
	}
};
draw.interact = {
	standardProperties: {
		obj: [
			{key:'disabled',value:true},
			{key:'overlay',value:true},
			{key:'click',value:function(obj) {}},
			{key:'drag3d',value:false,condition:function(obj) {
				return obj.type === 'three';
			}},
			{key:'cubeBuilding',value:'build',cycle:['build','remove'],condition:function(obj) {
				return obj.type === 'three';
			}},
			{key:'edit3dShape',value:true,condition:function(obj) {
				return obj.type === 'three';
			}},
		],
		path: [
			{key:'disabled',value:true},
			{key:'draggable',value:true},
			{key:'moveToFront',value:true,condition:function(path) {
				var pathInteract = draw.getPathInteract(path);
				return pathInteract.draggable === true;
			}},
			{key:'dragPathLineSegment',value:'id?'},
			{key:'dragPathCircle',value:'id?'},
			{key:'checkAllowDrag',value:function(path,pos) {},condition:function(path) {
				var pathInteract = draw.getPathInteract(path);
				return (pathInteract.draggable === true || !un(pathInteract.dragPathCircle) || !un(pathInteract.dragPathLineSegment));
			}},
			{key:'dragRect',value:[0,0,1200,1700],condition:function(path) {
				var pathInteract = draw.getPathInteract(path);
				return pathInteract.draggable === true;
			}},
			{key:'onDrop',value:function(dragAreaObj,dragPath) {},condition:function(path) {
				var pathInteract = draw.getPathInteract(path);
				return pathInteract.draggable === true;
			}},
			{key:'onUndrop',value:function(dragAreaObj,dragPath) {},condition:function(path) {
				var pathInteract = draw.getPathInteract(path);
				return pathInteract.draggable === true;
			}},
			{key:'onDragMove',value:function(path) {},condition:function(path) {
				var pathInteract = draw.getPathInteract(path);
				return (pathInteract.draggable === true || !un(pathInteract.dragPathCircle) || !un(pathInteract.dragPathLineSegment));
			}},
			{key:'type',value:'check',cycle:['check']},
			{key:'update',value:function(path) {}}
		]
	},
	appear: function() {
		if (!un(draw.currCursor.path)) {
			var path = draw.currCursor.path;
			path._visible = !path._visible;
			if (path._visible == true && !un(path.appear) && typeof path.appear.onappear == 'function') {
				path.appear.onappear(path);
			} 
			if (path._visible == false && !un(path.appear) && typeof path.appear.ondisappear == 'function') {
				path.appear.ondisappear(path);
			} 
		}
		if (!un(draw.currCursor.obj)) {
			var obj = draw.currCursor.obj;
			obj.visible = !obj.visible;
			if (obj.visible == true && !un(obj.appear) && typeof obj.appear.onappear == 'function') {
				obj.appear.onappear(obj);
			} 
			if (obj.visible == false && !un(obj.appear) && typeof obj.appear.ondisappear == 'function') {
				obj.appear.ondisappear(obj);
			} 
		}
		drawCanvasPaths();
		drawSelectCanvas2();
		if (!un(togglePageAppearButtonsButton)) togglePageAppearButtonsButton.draw();
	},
	buttons: {
		textInput:{
			drawButton: function(ctx,size) {
				ctx.fillStyle = '#FFF';	
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 2;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.beginPath();
				ctx.fillRect(size*8/55,size*15/55,size*(55-16)/55,size*25/55);
				ctx.strokeRect(size*8/55,size*15/55,size*(55-16)/55,size*25/55);
				ctx.stroke();
				text({context:ctx,left:size*8/55,width:size*(55-16)/55,top:size*15/55,textArray:['<<font:Georgia>><<fontSize:'+size*20/55+'>><<align:center>>I']});
			},
			click: function() {
				var paths = selPaths();
				var count = 0;
				for (var p = 0; p < paths.length; p++) {
					var path = paths[p];
					for (var o = 0; o < path.obj.length; o++) {
						var obj = path.obj[o];
						if (typeof obj == 'undefined' || obj.type !== 'text2' || !un(obj.isInput)) continue;
						obj.box = {type:"loose",borderColor:"#000",borderWidth:2,color:"#FFF"};
						obj.align = [0,0];
						path.isInput = {type:'text'};
						obj.ansIndex = 0;
						obj.ans = [];
						count++;
					}
					updateBorder(path);
				}
				if (count == 0) {
					Notifier.error('Select a text object');
				} else {
					drawCanvasPaths();
				}
			}
		},
		multiSelectTable:{
			drawButton: function(ctx,size) {
				ctx.strokeStyle = '#666';
				ctx.lineWidth = 1;
				ctx.fillStyle = '#FFF';
				ctx.fillRect(10,11,35,33);
				ctx.fillStyle = '#393';
				ctx.fillRect(10+11*1,11+0*33/4,35/3,33/4);
				ctx.fillRect(10+11*0,11+1*33/4,35/3,33/4);
				ctx.fillRect(10+11*2,11+3*33/4,35/3,33/4);
				ctx.beginPath();
				for (var i = 0; i < 5; i++) {
					ctx.moveTo(10,11+i*33/4);
					ctx.lineTo(45,11+i*33/4);
				}
				for (var i = 0; i < 4; i++) {
					ctx.moveTo(10+i*35/3,11);
					ctx.lineTo(10+i*35/3,44);
				}
				ctx.stroke();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.strokeRect(10,11,35,33);
			},
			click: function() {
				var path = selPath();
				if (path == false) {
					Notifier.error('Select a table object');
					return;
				}
				var obj = path.obj[0];
				if (obj.type !== 'table2') {
					Notifier.error('Select a table object');
					return;
				} else if (!un(obj.isInput)) {
					return;
				}
				path.isInput = {type:'select',shuffle:true,multiSelect:true,checkSelectCount:false,selColors:['#CCF','#66F']};
				obj.isInput = path.isInput;
				updateBorder(path);
				drawCanvasPaths();				
			}
		},
		singleSelectTable:{
			drawButton: function(ctx,size) {
				ctx.strokeStyle = '#666';
				ctx.lineWidth = 1;
				ctx.fillStyle = '#FFF';
				ctx.fillRect(10,11,35,33);
				ctx.fillStyle = '#393';
				ctx.fillRect(10,11,35/2,33/2);
				ctx.beginPath();
				for (var i = 0; i < 3; i++) {
					ctx.moveTo(10,11+i*33/2);
					ctx.lineTo(45,11+i*33/2);
				}
				for (var i = 0; i < 3; i++) {
					ctx.moveTo(10+i*35/2,11);
					ctx.lineTo(10+i*35/2,44);
				}
				ctx.stroke();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.strokeRect(10,11,35,33);
			},
			click: function() {
				var path = selPath();
				if (path == false) {
					Notifier.error('Select a table object');
					return;
				}
				var obj = path.obj[0];
				if (obj.type !== 'table2') {
					Notifier.error('Select a table object');
					return;
				} else if (!un(obj.isInput)) {
					return;
				}
				path.isInput = {type:'select',shuffle:true,multiSelect:false,checkSelectCount:true,selColors:['#CCF','#66F']};
				obj.isInput = clone(path.isInput);
				updateBorder(path);
				drawCanvasPaths();
			}		
		},
		tickCrossTableHoriz:{
			drawButton: function(ctx,size) {
				ctx.fillStyle = '#FFF';
				ctx.fillRect(7.5,17.5,40,20);		
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(27.5,17.5);
				ctx.lineTo(27.5,37.5);
				ctx.stroke();
				ctx.strokeRect(7.5,17.5,40,20);					
				drawTick(ctx,15,18,'#060',7.5+2.5,17.5+1,3);
				drawCross(ctx,15,18,'#F00',27.5+2.5,17.5+1,3);
			},
			click: function() {
				deselectAllPaths();
					
				var paths1 = {obj:[{type:"tick",rect:[155,125,40,50],lineWidth:10,lineColor:"#060"}]};
				var paths2 = {obj:[{type:"cross",rect:[305,125,40,50],lineWidth:10,lineColor:"#F00"}]};
				updateBorder(paths1);
				updateBorder(paths2);
				
				var obj = {type:"table2",left:100,top:100,widths:[150,150],heights:[100],text:{font:"Arial",size:28,color:"#000"},outerBorder:{show:false},innerBorder:{show:false},cells:[[{text:[""],align:[0,0],box:{type:"loose",borderColor:"#000",borderWidth:5,radius:10,show:true},paths:[paths1],selColors:["none","#6F6"],ans:false},{text:[""],align:[0,0],box:{type:"loose",borderColor:"#000",borderWidth:5,radius:10,show:true},paths:[paths2],selColors:["none","#F66"],ans:false}]]};
				
				obj.xPos = [obj.left];
				for (var i = 0; i < obj.widths.length; i++) obj.xPos.push(obj.xPos.last()+obj.widths[i]);
				obj.yPos = [obj.top];
				for (var i = 0; i < obj.heights.length; i++) obj.yPos.push(obj.yPos.last()+obj.heights[i]);
								
				draw.path.push({obj:[obj],selected:true,isInput:{type:'select',shuffle:true,multiSelect:false,checkSelectCount:true}});
				updateBorder(draw.path.last());
				drawCanvasPaths();
			}
		},
		tickCrossTableVert:{
			drawButton: function(ctx,size) {
				ctx.fillStyle = '#FFF';
				ctx.fillRect(17.5,7.5,20,40);		
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(17.5,27.5);
				ctx.lineTo(37.5,27.5);
				ctx.stroke();
				ctx.strokeRect(17.5,7.5,20,40);					
				drawTick(ctx,15,18,'#060',17.5+2.5,7.5+1,3);
				drawCross(ctx,15,18,'#F00',17.5+2.5,27.5+1,3);
			},
			click: function() {
				deselectAllPaths();
					
				var paths1 = {obj:[{type:"tick",rect:[155,125,40,50],lineWidth:10,lineColor:"#060"}]};
				var paths2 = {obj:[{type:"cross",rect:[305,125,40,50],lineWidth:10,lineColor:"#F00"}]};
				updateBorder(paths1);
				updateBorder(paths2);
				
				var obj = {type:"table2",left:100,top:100,widths:[100],heights:[100,100],text:{font:"Arial",size:28,color:"#000"},outerBorder:{show:false},innerBorder:{show:false},cells:[[{text:[""],align:[0,0],box:{type:"loose",borderColor:"#000",borderWidth:5,radius:10,show:true},paths:[paths1],selColors:["none","#6F6"],ans:false}],[{text:[""],align:[0,0],box:{type:"loose",borderColor:"#000",borderWidth:5,radius:10,show:true},paths:[paths2],selColors:["none","#F66"],ans:false}]]};
				
				obj.xPos = [obj.left];
				for (var i = 0; i < obj.widths.length; i++) obj.xPos.push(obj.xPos.last()+obj.widths[i]);
				obj.yPos = [obj.top];
				for (var i = 0; i < obj.heights.length; i++) obj.yPos.push(obj.yPos.last()+obj.heights[i]);
								
				draw.path.push({obj:[obj],selected:true,isInput:{type:'select',shuffle:true,multiSelect:false,checkSelectCount:true}});
				updateBorder(draw.path.last());
				drawCanvasPaths();
			}
		},
		drag:{
			drawButton: function(ctx,size) {
				drawArrow({ctx:ctx,startX:35,startY:35,finX:45,finY:45,lineWidth:2,arrowLength:8,fillArrow:true,color:'#000'});
				text({ctx:ctx,text:['<<fontSize:13>><<bold:true>><<font:algebra>>12'],align:[0,0],rect:[10,10,25,25],box:{type:'loose',color:'#CCF',borderWidth:2,borderColor:'#000',radius:3}});
			},
			click: function() {
				deselectAllPaths();
				var path = {obj:[{type:'text2',text:['<<fontSize:36>><<bold:true>>'],rect:[100,100,200,100],align:[0,0],box:{type:'loose',borderWidth:4,borderColor:'#000',color:'#CFF',radius:8}}],interact:{type:'drag',value:"",moveToFront:true},selected:true};
				draw.path.push(path);
				updateBorder(path);
				drawCanvasPaths();
			}
		},
		dragArea:{
			drawButton: function(ctx,size) {
				drawArrow({ctx:ctx,startX:10,startY:10,finX:19,finY:19,lineWidth:2,arrowLength:8,fillArrow:true,color:'#000'});
				text({ctx:ctx,text:[''],align:[0,0],rect:[20,20,25,25],box:{type:'loose',color:'#FFF',borderWidth:4,borderColor:'#666',radius:3,dash:[5,5]}});
			},
			click: function() {
				deselectAllPaths();
				var path = {obj:[{type:'text2',text:['<<fontSize:36>><<bold:true>>'],rect:[500,100,200,100],align:[0,0],box:{type:'loose',borderWidth:4,borderColor:'#333',color:'#FFF',radius:8,dash:[15,10]}}],interact:{type:'dragArea',value:"",snap:true},selected:true};
				draw.path.push(path);
				updateBorder(path);
				drawCanvasPaths();
			}
		},
		addKeyboard:{
			drawButton: function(ctx,size) {
				roundedRect(ctx,3,3,49,49,8,6,'#000','#F0F');
				roundedRect(ctx,2.5+9,2.5+9,8,8,3,2,'#000','#AFF');
				roundedRect(ctx,2.5+21,2.5+9,8,8,3,2,'#000','#AFF');
				roundedRect(ctx,2.5+33,2.5+9,8,8,3,2,'#000','#AFF');
				roundedRect(ctx,2.5+9,2.5+21,8,8,3,2,'#000','#AFF');
				roundedRect(ctx,2.5+21,2.5+21,8,8,3,2,'#000','#AFF');
				roundedRect(ctx,2.5+33,2.5+21,8,8,3,2,'#000','#AFF');
				roundedRect(ctx,2.5+9,2.5+33,8,8,3,2,'#000','#AFF');
				roundedRect(ctx,2.5+21,2.5+33,8,8,3,2,'#000','#AFF');
				roundedRect(ctx,2.5+33,2.5+33,8,8,3,2,'#000','#AFF');
			},
			click: function() {
				/*if (!un(pages[pIndex].keyboard)) {
					delete pages[pIndex].keyboard;
					Notifier.info('Keyboard removed');
				} else {
					pages[pIndex].keyboard = {keyArray:[
						['1','2','3'],
						['4','5','6'],
						['7','8','9'],
						['-','0','delete']
					]};
					console.log(pages[pIndex].keyboard);
					Notifier.info('Keyboard added');
				}*/
			}
		},
		checkButton:{
			drawButton: function(ctx,size) {
				roundedRect(ctx,3,10,49,35,8,6,'#000','#6F9');
				text({context:ctx,left:size*8/55,width:size*(55-16)/55,top:size*15/55,textArray:['<<font:Hobo>><<fontSize:'+size*20/55+'>><<align:center>>Check']});
			},
			click: function() {
				draw.path.push({obj:[{type:'text2',align:[0,0],text:['<<fontSize:36>><<font:Hobo>>Check Answer'],rect:[20,700-80,260,60],box:{type:'loose',color:'#6F9',borderColor:'#000',borderWidth:4,radius:10}}],selected:true,isInput:{type:'check'}});
				updateBorder(draw.path.last());
				drawCanvasPaths();
			}
		},
		feedback:{
			drawButton: function(ctx,size) {
				text({context:ctx,left:size*8/55,width:size*(55-16)/55,top:size*15/55,textArray:['<<font:Hobo>><<fontSize:'+size*20/55+'>><<align:center>>Feedback']});
			},
			click: function() {
				draw.path.push({obj:[{type:'feedback',rect:[300,700-80,880,60]}],selected:true});
				updateBorder(draw.path.last());
				drawCanvasPaths();
			}
		}
	},
	update: function() {
		var changed = false;
		draw.objs(function(obj) {
			if (typeof obj !== 'object') return;
			if (!un(obj.interact) && !un(obj.interact.update)) {
				changed = true;
				if (typeof obj.interact.update == 'function') {
					obj.interact.update(obj);
				} else if (obj.interact.update instanceof Array) {
					for (var i = 0; i < obj.interact.update.length; i++) {
						draw.interact.processFuncObject(obj,obj.interact.update[i]);
					}
				}
			}
		});
		if (changed === true) drawCanvasPaths();
	},
	click: function() {
		var obj = draw.currCursor.obj;
		if (typeof obj.interact.click == 'function') {
			if (obj.type === 'table2') {
				var rows = obj.heights.length;
				var cols = obj.widths.length;
				var top = obj.top;
				var row = 0;
				for (var r = 0; r < rows; r++) {
					if (draw.mouse[1] > top) row = r;
					top += obj.heights[r];
				}
				var left = obj.left;
				var col = 0;
				for (var c = 0; c < cols; c++) {
					if (draw.mouse[0] > left) col = c;
					left += obj.widths[c];
				}
				var cell = obj.cells[row][col];
				obj.interact.click(cell);
			} else {
				obj.interact.click(obj);
			}
			drawCanvasPaths();
		} else if (obj.interact.click instanceof Array) {
			for (var i = 0; i < obj.interact.click.length; i++) {
				draw.interact.processFuncObject(obj,obj.interact.click[i]);
			}
			drawCanvasPaths();
		}
		draw.interact.update();
	},
	clickAngle: function() {
		var obj = draw.currCursor.obj;
		if (typeof obj.interact.clickAngle == 'function') {
			obj.interact.clickAngle(obj);
			drawCanvasPaths();
		}
		draw.interact.update();
	},
	processFuncObject: function(obj,funcObject) {
		// get object to act upon
		var obj2 = un(funcObject.id) || funcObject.id == 'self' ? obj : draw.getObjById(funcObject.id);
		
		// get property object
		var property = draw.interact.getPropertyObject(obj2,funcObject.property);
		if (typeof property !== 'object') return;
		
		// get value
		if (!un(funcObject.value)) {
			var value = funcObject.value;
		} else if (!un(funcObject.condition)) {
			var conditionObj = un(funcObject.condition.id) || funcObject.condition.id == 'self' ? obj2 : draw.getObjById(funcObject.condition.id);
			var conditionProperty = draw.interact.getPropertyObject(conditionObj,funcObject.condition.property);
			var conditionValue = conditionProperty.get(conditionObj);
			var value = funcObject.condition.default;
			for (var v = 0; v < funcObject.condition.value.length; v++) {
				if (funcObject.condition.value[v][0] == conditionValue) {
					value = funcObject.condition.value[v][1];
					break;
				}
			}
		}
		
		// apply change
		if (!un(value)) {
			property.set(obj2,value);
		} else if (property.type instanceof Array) {
			property.cycle(obj2);
		} else if (property.type == 'boolean') {
			property.set(obj2,!property.get(obj2));
		} else if (property.type == 'number') {
			if (!un(funcObject.increment)) {
				property.increment(obj2,funcObject.increment);
			}
		} else if (property.type == 'color') {
			
		}
	},
	getPropertyObject: function(obj,property) {
		if (!un(draw.obj.properties[property])) {
			return draw.obj.properties[property];
		} else if (!un(draw[obj.type].properties) && !un(draw[obj.type].properties[property])) {
			return draw[obj.type].properties[property];
		}
		return null;
	},
	dragReset: function(path) {
		if (un(path._initialPos)) return;
		positionPath(path,path._initialPos[0],path._initialPos[1]);
		if (!un(path.interact) && !un(path.interact._dragAreaHit)) {
			var dragAreaHit = path.interact._dragAreaHit;
			delete path.interact._dragAreaHit;
			delete dragAreaHit.obj.interact._dragHit;
			if (typeof dragAreaHit.obj.interact.onUndrop === 'function') {
				dragAreaHit.obj.interact.onUndrop(dragAreaHit.obj,path);
			}
		}
	},
	dragResetAll: function() {
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			draw.interact.dragReset(path);
		}
	},
	
	dragUpdateDragImage:function() {
		var path = draw.drag.path;
		updateBorder(path);
		var canvas = draw.hiddenCanvas;
		var l = path.tightBorder[0]-10;
		var t = path.tightBorder[1]-10;
		var w = path.tightBorder[2]+20;
		var h = path.tightBorder[3]+20;
		canvas.width = l+w+100;
		canvas.height = t+h+100;
		drawPathsToCanvas(canvas,[path]);
		draw.drag.dragImageData = canvas.ctx.getImageData(l,t,w,h);
	},
	dragStart: function(e) {
		updateMouse(e);
		
		changeDrawMode('interactDragging');
		draw.drag = draw.currCursor;
		var path = draw.drag.path;
		updateBorder(path);
			
		if (path.interact.dragDrawMode !== 'drawCanvasPaths') {
			draw.interact.dragUpdateDragImage();
		}
		if (path.interact.moveToFront == true) {
			//draw.taskQuestion.updateAllPaths();
			var index = draw.path.indexOf(path);
			draw.path.splice(index,1);
			draw.path.push(path);
		}
		if (un(path.tightBorder)) updateBorder(path);
		if (un(path._initialPos) && !un(path.tightBorder)) {
			path._initialPos = [path.tightBorder[0],path.tightBorder[1]];
		}
		if (!un(path.interact) && !un(path._taskQuestion)) {
			path.interact._dragRect = [path._taskQuestion.left,path._taskQuestion.top,path._taskQuestion.width-path._taskQuestion.marginRight,path._taskQuestion.height];
		} else if (!un(path.interact) && !un(path._starterQuestion)) {
			path.interact._dragRect = clone(path._starterQuestion.rect);
		}
		draw.drag.offset = [draw.mouse[0]-path.tightBorder[0],draw.mouse[1]-path.tightBorder[1]];
		draw.drag.startMouse = [draw.mouse[0],draw.mouse[1]];
		draw.drag.startPos = [path.tightBorder[0],path.tightBorder[1]];
		
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.lockCursor = draw.cursors.move2;
		
		draw.drag.dragAreas = [];
		draw.drag.dragVenns = [];
		for (var p = 0; p < draw.path.length; p++) {
			var path2 = draw.path[p];
			if (!un(path2.interact) && (path2.interact.type == 'dragArea' || path2.interact.dragArea == true)) {
				if (!un(path2.interact._dragHit)) {
					if (path2.interact._dragHit == draw.drag.path) {
						/*delete path2.interact._dragHit;
						console.log('unhit',path2,draw.drag.path);
						if (typeof path2.interact.onUndrop == 'function') {
							path2.interact.onUndrop(path2,draw.drag.path);
						}*/
					} else {
						continue;
					}
				}
				var snap = boolean(path2.interact.snap,false);
				var rect = path2.tightBorder;
				var center = [rect[0]+0.5*rect[2],rect[1]+0.5*rect[3]];
				draw.drag.dragAreas.push({rect:rect,center:center,snap:snap,path:path2});
			}
		}
		draw.selectedCanvas = draw.drawCanvas[1];
		if (!un(path.interact) && typeof path.interact.onDragStart == 'function') {
			path.interact.onDragStart(path);
		}
		drawCanvasPathsInteractDragMode();
				
		draw.animate(draw.interact.dragMove, draw.interact.dragStop, draw.interact.dragDraw);
	},
	dragDraw: function() {
		if (un(draw.drag) || un(draw.drag.path)) {
			drawCanvasPaths();
			return;
		}
		var path = draw.drag.path; 

		if (path.interact.dragDrawMode === 'drawCanvasPaths') {
			drawCanvasPaths();
			return;
		}
		var ctx = draw.drawCanvas[1].ctx;
		var pos = !un(path._dragPos) ? path._dragPos : path.tightBorder;
		if (un(pos)) return;
		ctx.clear();		
		ctx.putImageData(draw.drag.dragImageData,pos[0]-10,pos[1]-10);
		
		if (getResourceType() === 'task') draw.task.updateTrayCanvas();
	},
	dragMove: function(e) {
		updateMouse(e);
		var path = draw.drag.path;
		var obj = draw.drag.obj || draw.drag.path.obj[0];
		if (draw.drag.dragType == 'circle') {
			var p = draw.drag.path;
			var circle = draw.drag.circle;
			if (!un(circle.interact) && typeof circle.interact.checkAllowDrag == 'function' && circle.interact.checkAllowDrag(circle,obj,draw.mouse) == false) return;
			var c = draw.drag.center;
			var r = draw.drag.radius;
			var a = getAngleFromAToB(c,[draw.mouse[0],draw.mouse[1]]);
			var pos = [c[0]+r*Math.cos(a),c[1]+r*Math.sin(a)];
			var dx = pos[0]-(p.border[0]+0.5*p.border[2]);
			var dy = pos[1]-(p.border[1]+0.5*p.border[3]);
			repositionPath(p,dx,dy);
		} else if (draw.drag.dragType == 'lineSegment') {
			var p = draw.drag.path;
			var pos = closestPointOnLineSegment([draw.mouse[0],draw.mouse[1]],draw.drag.lineSegment.startPos,draw.drag.lineSegment.finPos);
			var dx = pos[0]-(p.border[0]+0.5*p.border[2]);
			var dy = pos[1]-(p.border[1]+0.5*p.border[3]);
			repositionPath(p,dx,dy);
		} else {
			var path = draw.drag.path;
			if (!un(obj.interact) && typeof obj.interact.checkAllowDrag == 'function' && obj.interact.checkAllowDrag(obj,pos) == false) return;
			if (!un(path.interact) && typeof path.interact.checkAllowDrag == 'function' && path.interact.checkAllowDrag(path,pos) == false) return;
			
			var pos2 = clone(draw.mouse);
			pos2[0] -= draw.drag.offset[0];
			pos2[1] -= draw.drag.offset[1];
			
			if (!un(path.interact) && (!un(path.interact.dragRect) || !un(path.interact._dragRect))) {
				var dragRect = path.interact.dragRect || path.interact._dragRect;
				pos2[0] = Math.max(pos2[0],dragRect[0]);
				pos2[0] = Math.min(pos2[0],dragRect[0]+dragRect[2]-path.tightBorder[2]);
				pos2[1] = Math.max(pos2[1],dragRect[1]);
				pos2[1] = Math.min(pos2[1],dragRect[1]+dragRect[3]-path.tightBorder[3]);
			} else {
				pos2[0] = Math.max(pos2[0],draw.drawArea[0]);
				pos2[0] = Math.min(pos2[0],draw.drawArea[0]+draw.drawArea[2]-path.tightBorder[2]);
				pos2[1] = Math.max(pos2[1],draw.drawArea[1]);
				pos2[1] = Math.min(pos2[1],draw.drawArea[1]+draw.drawArea[3]-path.tightBorder[3]);
			}
			
			positionPath(path,pos2[0],pos2[1]);
			path._dragPos = [pos2[0],pos2[1]];

			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (obj.type === 'three') delete obj._rect;
			}
			updateBorder(path);
			
			var pos4 = [path._dragPos[0]+0.5*path.tightBorder[2],path._dragPos[1]+0.5*path.tightBorder[3]]; // centre of dragObj
			delete draw.drag.path.interact._dragAreaHit;
			var closestDragArea = null;
			var closestDragAreaDist = 40;
			for (d = 0; d < draw.drag.dragAreas.length; d++) {
				var dragArea = draw.drag.dragAreas[d];
				var dragAreaDist = dist(pos4[0],pos4[1],dragArea.center[0],dragArea.center[1]);
				if (dragAreaDist < closestDragAreaDist) {
					closestDragArea = dragArea;
					closestDragAreaDist = dragAreaDist;
				}
			}
			for (d = 0; d < draw.drag.dragAreas.length; d++) {
				var dragArea = draw.drag.dragAreas[d];
				if (dragArea === closestDragArea) {
					draw.drag.path.interact._dragAreaHit = dragArea;
					dragArea.path.interact._dragHit = draw.drag.path;
					//console.log('hit');
					if (dragArea.snap === true) {
						var path2 = dragArea.path;
						var border2 = path2.tightBorder;
						var pos3 = [border2[0]+0.5*border2[2],border2[1]+0.5*border2[3]]; // center of dragArea
						var posNew = [pos3[0]-0.5*path.tightBorder[2],pos3[1]-0.5*path.tightBorder[3]];
						positionPath(path,posNew[0],posNew[1]);
						path._dragPos = [posNew[0],posNew[1]];
					}
					if (typeof dragArea.path.interact.onDrop == 'function') {
						dragArea.path.interact.onDrop(dragArea.path,draw.drag.path);
						draw.interact.dragUpdateDragImage();
						drawCanvasPaths();
					}
				} else if (dragArea.path.interact._dragHit == draw.drag.path) {
					delete dragArea.path.interact._dragHit;
					delete draw.drag.path.interact._dragAreaHit;
					//console.log('unhit');
					if (typeof dragArea.path.interact.onUndrop == 'function') {
						dragArea.path.interact.onUndrop(dragArea.path,draw.drag.path);
						draw.interact.dragUpdateDragImage();
						drawCanvasPaths();
					}
				}
			}
			/*for (d = 0; d < draw.drag.dragVenns.length; d++) {
				var dragVenn = draw.drag.dragVenns[d];
				if (dragVenn.path.interact.highlightOnDrag !== true) continue;
				dragVenn.obj.shade = [false,false,false,false];
				if (isPointInRect(pos4,dragVenn.rect[0],dragVenn.rect[1],dragVenn.rect[2],dragVenn.rect[3]) === true) {
					var hit1 = dist(dragVenn.centerA,pos4) < dragVenn.radius;
					var hit2 = dist(dragVenn.centerB,pos4) < dragVenn.radius;
					if (hit1 && hit2) dragVenn.obj.shade[0] = true;
					if (hit1 && !hit2) dragVenn.obj.shade[1] = true;
					if (!hit1 && hit2) dragVenn.obj.shade[2] = true;
					if (!hit1 && !hit2) dragVenn.obj.shade[3] = true;
				}
			}*/
		}
		if (!un(path.interact) && typeof path.interact.onDragMove == 'function') {
			path.interact.onDragMove(path);
		}
		if (!un(obj.interact) && typeof obj.interact.onDragMove == 'function') {
			obj.interact.onDragMove(obj);
		}
		draw.interact.update(false);
	},
	dragStop: function(e) {
		changeDrawMode();
		calcCursorPositions();
		var path = draw.drag.path;
		delete path._interacting;
		delete path.interact._match;
		if (!un(path.interact._dragAreaHit) && !un(path.interact._dragAreaHit.path) && !un(path.interact._dragAreaHit.path.interact) && !un(path.interact._dragAreaHit.path.interact.value)) {
			if (path.interact._dragAreaHit.path.interact.value == path.interact.value) {
				path.interact._match = true;
			}
		}
		/*for (d = 0; d < draw.drag.dragVenns.length; d++) {
			var dragVenn = draw.drag.dragVenns[d];
			if (dragVenn.path.interact.highlightOnDrag !== true) continue;
			dragVenn.obj.shade = [false,false,false,false];
		}*/
		delete draw.drag;
		delete draw.selectedCanvas;
		delete path._dragPos;
		delete draw.selectedCanvases;
		draw.interact.update(false);
		if (!un(path.interact) && typeof path.interact.onDragStop == 'function') {
			path.interact.onDragStop(path);
		}
		drawCanvasPaths();
		
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		delete draw.lockCursor;
	},
	
	animation:false,
	startAnimation: function(func) {
		draw.interact._frame = -1;
		draw.interact._func = func;
		draw.interact.animation = true;
		window.requestAnimationFrame(draw.interact.animationStep);
	},
	stopAnimation: function() {
		draw.interact.animation = false;
	},
	animationStep: function() {
		if (draw.interact.animation == false) {
			delete draw.interact._frame;
			delete draw.interact._func;
			return;
		}
		draw.interact._frame++;
		var nextFrame = draw.interact._func(draw.interact._frame);
		drawCanvasPaths();
		if (nextFrame == false) {
			delete draw.interact._frame;
			delete draw.interact._func;
			draw.interact.animation = false;
		} else {
			window.requestAnimationFrame(draw.interact.animationStep);
		}
	},
	setFeedback: function(feedback,color) {
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (obj.type == 'feedback') {
					obj._feedback = feedback;
					obj._color = color;
				}
			}
		}
		drawCanvasPaths();
	},
	clearFeedback: function(feedback,color) {
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (obj.type == 'feedback') {
					delete obj._feedback;
					delete obj._color;
				}
			}
		}
		drawCanvasPaths();
	},
	checkPage: function(setFeedback) {
		var inputs = [];
		
		var dragCheckMode = 'none';
		var dragCanvasCount = 0;
		var dragAreaCount = 0;
		var dragSnapAreaCount = 0;
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (un(path.isInput)) continue;
			if (path.isInput.type == 'drag') {
				dragCanvasCount++;
			} else if (path.isInput.type == 'dragArea') {
				if (path.isInput.snap == true) {
					dragSnapAreaCount++;
				} else {
					dragAreaCount++;
				}
			}
		}
		if (dragCanvasCount > 0) {
			if (dragSnapAreaCount > 0) {
				dragCheckMode = 'dragArea';
			} else {
				dragCheckMode = 'dragCanvas';
			}
		}		

		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (un(path.isInput)) continue;
			if (path.isInput.type == 'text') {
				inputs.push({type:'text',path:path});
			} else if (path.isInput.type == 'drag' && dragCheckMode == 'dragCanvas') {
				inputs.push({type:'drag',path:path});
			} else if (path.isInput.type == 'dragArea' && dragCheckMode == 'dragArea') {
				inputs.push({type:'dragArea',path:path});
			} else if (path.isInput.type == 'select') {
				inputs.push({type:'select',path:path});
			}
		}
		
		var checkVars = {check:true,a:[],qs:inputs.length};
		var correct = 0;
		var max = inputs.length;
		
		for (var q = 0; q < max; q++) {
			var input = inputs[q];		
			if (input.type == 'text') {
				
			} else if (input.type == 'select') {
				
			} else if (input.type == 'drag') {
				var check = true;
				if (un(input.path._dragAreaHit)) {
					checkVars.check = false;
					checkVars.fb = "You need to drag all the boxes into position.";
				} else if (input.path._dragHit._match !== true) {
					check = false;
				}
				if (check == true) correct++;
				checkVars.a[q] = {type:'dragArea',check:check};
			} else if (input.type == 'dragArea') {
				var check = true;
				if (un(input.path._dragHit)) {
					checkVars.check = false;
					checkVars.fb = "You need to drag boxes into all the positions.";
				} else if (input.path._dragHit._match !== true) {
					check = false;
				}
				if (check == true) correct++;
				checkVars.a[q] = {type:'dragArea',check:check};
			}
		}
		
		/*if (drags.length > 0) {
			if (dragSnapAreaCount > 0) { // check by dragArea
				for (var i = 0; i < dragAreas.length; i++) {
					var dragArea = dragAreas[i];
					console.log(dragArea);
					if (un(dragArea._dragHit) || dragArea._dragHit._match !== true) {
						errorCount++;
					}
				}
			} else { // check by drags
				for (var i = 0; i < drags.length; i++) {
					var drag = drags[i];
					console.log(drag);
					if (drag._match !== true) {
						errorCount++;
					}
				}
			}
		}*/
		
		if (!un(checkVars.fb)) {
			var feedback = checkVars.fb;
			var color = '#C60';
		} else {
			var wrong = max-correct;
			if (wrong == 1) {
				var feedback = '1 answer is incorrect.';
				var color = '#C60';
			} else if (wrong > 1) {
				var feedback = wrong+' answers are incorrect.';
				var color = '#C60';
			} else {
				var feedback = 'All correct! Well done.';
				var color = '#060';
			}
		}
		if (boolean(setFeedback,true) == true) draw.interact.setFeedback(feedback,color);
		return checkVars;
	}
};
draw.isInput = {
	dragSetId: function () {
		var path = draw.path[draw.currCursor.pathNum];
		path.id = prompt('ID:', path.id);
		updateBorder(path);
		drawCanvasPaths();
	},
	dragSetValue: function () {
		var path = draw.path[draw.currCursor.pathNum];
		path.interact.value = prompt('Value:', path.interact.value);
		updateBorder(path);
		drawCanvasPaths();
	},
	dragSetMatch: function () {
		var path = draw.path[draw.currCursor.pathNum];
		path.interact.match = prompt('Match:', path.interact.match);
		updateBorder(path);
		drawCanvasPaths();
	},
	dragShuffleToggle: function () {
		var path = draw.path[draw.currCursor.pathNum];
		path.interact.shuffle = !path.interact.shuffle;
		updateBorder(path);
		drawCanvasPaths();
	},
	dragAreaSnapToggle: function () {
		var path = draw.path[draw.currCursor.pathNum];
		path.interact.snap = !path.interact.snap;
		updateBorder(path);
		drawCanvasPaths();
	}
}
draw.obj = {
	properties:{
		visible:{
			type:'boolean',
			get: function(obj) {
				return boolean(obj.visible,true);
			},
			set: function(obj,value) {
				obj.visible = value;
			}
		}
	}
};
function o(id) {
	return draw.getObjById(id);
}
draw.objsOfType = function(type) {
	var objs = [];
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		var found = false;
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			if (obj.type === type) {
				objs.push(obj);
			}
		}
	}
	return objs;
}
draw.animate = function(onmove,onend,onframe) {
	if (!un(draw._animation) && !un(draw._animation.stop)) draw._animation.stop();
	if (un(onmove)) onmove = function() {};
	if (un(onend)) onend = function() {};
	if (un(onframe)) onframe = drawSelectedPaths;
	draw._animation = {
		onmove:onmove,
		onframe:onframe,
		onend:onend
	};
	draw._animation.frame = function() {
		draw._animation.onframe();
		draw._animation.frameID = window.requestAnimationFrame(draw._animation.frame);
	}
	draw._animation.stop = function(e) {
		if (un(draw._animation)) return;
		if (!un(e)) e.stopPropagation();
		draw._animation.onend(e);
		draw._animation.onframe();
		window.cancelAnimationFrame(draw._animation.frameID);
		document.removeEventListener("touchmove", draw._animation.onmove);
		document.removeEventListener("mousemove", draw._animation.onmove);
		document.removeEventListener("touchend", draw._animation.stop);
		document.removeEventListener("mouseup", draw._animation.stop);
		delete draw._animation;
		//if (draw.mode === 'edit' && !un(draw.contextMenu)) draw.contextMenu.update();		
	}
	document.addEventListener("touchmove", draw._animation.onmove, false);
	document.addEventListener("mousemove", draw._animation.onmove, false);
	document.addEventListener("touchend", draw._animation.stop, true);
	document.addEventListener("mouseup", draw._animation.stop, true);
	
	draw._animation.frameID = window.requestAnimationFrame(draw._animation.frame);
}

draw.translateObj = function(obj,translationVector) {
	if (draw[obj.type].keyPoints instanceof Array) {
		for (var k = 0; k < draw[obj.type].keyPoints.length; k++) {
			var key = draw[obj.type].keyPoints[k];
			obj[key] = vector.addVectors(obj[key],translationVector);
		}
	} else if (!un(draw[obj.type].changePosition)) {
		draw[obj.type].changePosition(obj,translationVector[0],translationVector[1],0,0);
	}
}
draw.rotateObject = function(obj,angle,center) { // angle in radians
	if (draw[obj.type].keyPoints instanceof Array) {
		if (un(center)) {
			var rect = draw[obj.type].getRect(obj);
			center = [rect[0]+rect[2]/2, rect[1]+rect[3]/2];
		}
		for (var k = 0; k < draw[obj.type].keyPoints.length; k++) {
			var key = draw[obj.type].keyPoints[k];
			obj[key] = draw.rotatePoint(obj[key],angle,center);
		}
	} else if (obj.type === 'polygon') {
		if (un(center)) center = draw.polygon.getCentroid(polygon);
		for (var p = 0; p < obj.points.length; p++) {
			obj.points[p] = draw.rotatePoint(obj.points[p],angle,center);
		}
	}
	
}
draw.rotatePoint = function(point,angle,center) { // angle in radians
	return [(Math.cos(angle) * (point[0] - center[0])) + (Math.sin(angle) * (point[1] - center[1])) + center[0], (Math.cos(angle) * (point[1] - center[1])) - (Math.sin(angle) * (point[0] - center[0])) + center[1]];
}

draw.togglePathDraggable = function() {
	var path = draw.currCursor.path;
	if (un(path.interact)) path.interact = {};
	path.interact.draggable = !path.interact.draggable;
	updateBorder(path);
	drawSelectCanvas();
}

draw.fixAlgebraSpacing = function(obj,algebraFontOnly) {
	if (un(obj)) obj = draw.path;
	if (un(algebraFontOnly)) algebraFontOnly = false;
	if (typeof obj === 'object' && obj.text instanceof Array) {
		var algebraFont = obj.font === 'algebra';
		obj.text = getFixedAlgebraSpacing(obj.text,algebraFont);
	} else if (obj instanceof Array) {
		for (var i = 0; i < obj.length; i++) {
			if (typeof obj[i] !== 'object') continue;
			draw.fixAlgebraSpacing(obj[i]);
		}
	} else if (typeof obj === 'object') {
		for (var key in obj) {
			if (typeof obj[key] !== 'object' || key.indexOf('_') === 0 || ['canvas','ctx','data'].indexOf(key) > -1) continue;
			draw.fixAlgebraSpacing(obj[key]);
		}
	}
	drawCanvasPaths();
	return;
	function getFixedAlgebraSpacing(arr,algebraFont) {
		if (un(algebraFont)) algebraFont = false;
		if (arr instanceof Array) {
			for (var i = 0; i < arr.length; i++) {
				arr[i] = getFixedAlgebraSpacing(arr[i],algebraFont);
			}
		} else if (typeof arr == 'string') {
			for (var c = 0; c < arr.length; c++) {
				if (arr.slice(c).indexOf('<<font:algebra>>') === 0) {
					algebraFont = true;
				} else if (arr.slice(c).indexOf('<<font:') === 0) {
					algebraFont = false;
				} else if ((algebraFontOnly === false || algebraFont === true) && arr.charAt(c) === ' ') {
					arr = arr.slice(0,c)+arr.slice(c+1);
					c--;
				}
			}
		}
		return arr;
	}
}

function drawClickSelect() {
	cursorPosHighlight(true);
	var pathNum = draw.currCursor.pathNum;
	var path = draw.path[pathNum];
	if (getPathSelectable(path) === false) return;
	if (!ctrlOn) deselectAllPaths(false);
	path.selected = !path.selected;
	draw.controlPanel.clear();
	calcCursorPositions();
	drawCanvasPaths();
	//if (draw.mode === 'edit' && !un(draw.contextMenu)) draw.contextMenu.update();		
};
function drawClickStartSelectRect() {
	if (!ctrlOn) {
		deselectAllPaths(true);
	} else {
		for (var i = 0; i < draw.path.length; i++) {
			var path = draw.path[i];
			if (getPathSelectable(path) === false) continue;
			if (getPathVis(path) && path.selected == true) {
				path._preSelected = true;
			}
		}
	}
	draw.startX = draw.mouse[0];
	draw.startY = draw.mouse[1];
	changeDrawMode('selectRect');
	draw.selectRect = [draw.mouse[0],draw.mouse[1],0,0];
	draw.animate(selectRectMove,selectRectStop,drawSelectCanvas);
};
function selectRectMove(e) {
	updateMouse(e);
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	draw.selectRect[2] = x - draw.startX;
	draw.selectRect[3] = y - draw.startY;	

	if (draw.selectRect[0] < x) {
		var selectLeft = draw.selectRect[0];
		var selectRight = x;		
	} else {
		var selectLeft = x;
		var selectRight = draw.selectRect[0];		
	}
	
	if (draw.selectRect[1] < y) {
		var selectTop = draw.selectRect[1];
		var selectBottom = y;		
	} else {
		var selectTop = y;
		var selectBottom = draw.selectRect[1];		
	}

	for (var i = 0; i < draw.path.length; i++) {
		var path = draw.path[i];
		if (getPathSelectable(path) === false) continue;
		//if (un(path.border)) continue;
		//if (getPathVis(path) && path.border[0] >= selectLeft && path.border[4] <= selectRight && path.border[1] >= selectTop && path.border[5] <= selectBottom) {
		if (un(path._center)) continue;
		if (path._preSelected == true) continue;
		if (getPathVis(path) && path._center[0] >= selectLeft && path._center[0] <= selectRight && path._center[1] >= selectTop && path._center[1] <= selectBottom) {
			path.selected = true;
		} else {
			path.selected = false;
		}
	}
	//drawSelectCanvas();		
	//drawSelectCanvas2();
}
function selectRectStop(e) {
	changeDrawMode();
	for (var p = 0; p < draw.path.length; p++) {
		delete draw.path[p]._preSelected;
		if (draw.path[p].selected == true) {
			drawCanvasPaths();
			break;
		}
	}
	drawSelectCanvas2();
	draw.startX = null;
	draw.startY = null;	
	//removeListenerMove(window,selectRectMove);
	//removeListenerEnd(window,selectRectStop);
}
function getPathSelectable(path) {
	for (var i = 0; i < path.obj.length; i++) {
		var obj = path.obj[i];
		if (!un(obj) && !un(draw[obj.type]) && draw[obj.type].selectable === false) {
			return false;
		}
	}
	return true;
}

function drawClickStartZoomRect() {
	draw.startX = draw.mouse[0];
	draw.startY = draw.mouse[1];
	changeDrawMode('zoomRect');
	draw.zoomRect = [draw.mouse[0],draw.mouse[1],0,0];
	draw.animate(zoomRectMove,zoomRectStop,drawSelectCanvas2);
};
function zoomRectMove(e) {
	updateMouse(e);
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	draw.zoomRect[2] = x - draw.startX;
	draw.zoomRect[3] = y - draw.startY;	
}
function zoomRectStop(e) {
	changeDrawMode();
	var rect = clone(draw.zoomRect);
	if (draw.mode === 'edit') {
		if (rect[2] < 0) {
			rect[0] += rect[2];
			rect[2] *= -1;
		}
		if (rect[3] < 0) {
			rect[1] += rect[3];
			rect[3] *= -1;
		}
		if (rect[2] < 360) {
			rect[0] += 0.5*rect[2]-360/2;
			rect[2] = 360;
		}
		if (rect[3] < 210) {
			rect[1] += 0.5*rect[3]-210/2;
			rect[3] = 210;
		}
		if (rect[2]/rect[3] < 1200/700) {
			var mid = rect[0]+rect[2]/2;
			rect[2] = rect[3]*(1200/700);
			rect[0] = mid - rect[2]/2;
		} else {
			var mid = rect[1]+rect[3]/2;
			rect[3] = rect[2]/(1200/700);
			rect[1] = mid - rect[3]/2;
		}
		draw.div.zoomToRect(rect);
		drawSelectCanvas2();
	} else {
		var zoomRatio = rect[2]/rect[3];
		var viewRatio = 1225/700;
		if (zoomRatio > viewRatio) { // wide
			var middle = rect[1]+rect[3]/2;
			rect[3] = rect[2]/viewRatio;
			rect[1] = middle-rect[3]/2;
			var height = 700*draw.zoomRect[3]/rect[3];
			var padding = (700-height)/2;
			if (padding > 50) {
				draw.zoomRectLetterBoxShow();
				resizeCanvas3(draw.zoomRectLetterBox.canvas1,0,0,1225,padding);
				resizeCanvas3(draw.zoomRectLetterBox.canvas2,0,700-padding,1225,padding);
			} else {
				draw.zoomRectLetterBoxHide();
			}
		} else { // tall
			var center = rect[0]+rect[2]/2;
			rect[2] = rect[3]*viewRatio;
			rect[0] = center-rect[2]/2;
			var width = 1225*draw.zoomRect[2]/rect[2];
			var padding = (1225-width)/2;
			if (padding > 50) {
				draw.zoomRectLetterBoxShow();
				resizeCanvas3(draw.zoomRectLetterBox.canvas1,0,0,padding,700);
				resizeCanvas3(draw.zoomRectLetterBox.canvas2,1225-padding,0,padding,700);
			} else {
				draw.zoomRectLetterBoxHide();
			}
		}
		draw.div.zoomToRect(rect);
		
		drawSelectCanvas2();
	}
}
draw.zoomRectLetterBoxShow = function() {
	if (typeof draw.zoomRectLetterBox === 'undefined') {
		draw.zoomRectLetterBox = {
			canvas1:newctx({rect:[0,0,200,700],vis:true,pe:true}).canvas,
			canvas2:newctx({rect:[1000,0,200,700],vis:true,pe:true}).canvas,
			canvas3:newctx({rect:[1225-10-40,10,40,40],vis:true,pe:true}).canvas
		}
		draw.zoomRectLetterBox.canvas1.style.cursor = 'default';
		draw.zoomRectLetterBox.canvas2.style.cursor = 'default';
		draw.zoomRectLetterBox.canvas1.style.backgroundColor = '#CCC';
		draw.zoomRectLetterBox.canvas2.style.backgroundColor = '#CCC';
		draw.zoomRectLetterBox.canvas3.style.backgroundColor = '#FFF';
		addListener(draw.zoomRectLetterBox.canvas3,draw.zoomRectLetterBoxHide);
		var ctx = draw.zoomRectLetterBox.canvas3.ctx;
		text({ctx:ctx,rect:[1,1,38,38],text:[times],fontSize:46,bold:true,align:[0,0],color:'#F00',box:{type:'loose',borderColor:'#000',borderWidth:2,color:'#FFF'}});
	}
	
	var canvas1 = draw.zoomRectLetterBox.canvas1;
	var canvas2 = draw.zoomRectLetterBox.canvas2;
	var canvas3 = draw.zoomRectLetterBox.canvas3;
	var z = String(Number(draw.drawCanvas.last().style.zIndex)+1);
	canvas1.style.zIndex = z;
	canvas2.style.zIndex = z;
	canvas3.style.zIndex = z;
	showObj(canvas1);
	showObj(canvas2);
	showObj(canvas3);
	draw.div.style.overflow = 'hidden';
}
draw.zoomRectLetterBoxHide = function() {
	if (typeof draw.zoomRectLetterBox === 'undefined') return;
	hideObj(draw.zoomRectLetterBox.canvas1);
	hideObj(draw.zoomRectLetterBox.canvas2);
	hideObj(draw.zoomRectLetterBox.canvas3);
	draw.div.style.overflow = 'auto';
	draw.div.setZoom(1);
	calcCursorPositions();
}

function deselectPath(path) {
	path.selected = false;
	drawCanvasPaths();
}
function drawClickStartDragObject(e) {
	if (ctrlOn) {
		deselectPath(draw.path[draw.currCursor.pathNum]);
		return;
	}
	drawCanvasPaths();
	changeDrawMode('selectDrag');
	draw.undo.saveState();	
	cursorPosHighlight(true);
	draw.cursorCanvas.style.cursor = draw.cursors.move2;
	draw.dragSnapped = false;

	var paths = selPaths();	
	var pos = draw.mouse;	
	var canvas = draw.hiddenCanvas;
	
	var dragObjTypes = {};
	var dragObjs = [];
	for (var p = 0; p < paths.length; p++) {
		var path = paths[p];
		
		var pathDraggable = false;
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			if (!un(draw[obj.type]) && draw[obj.type].draggable !== false) {
				pathDraggable = true;
				break;
			}
		}
		if (pathDraggable === false) {
			paths.splice(p,1);
			p--;
			continue;
		}
		
		var l = path.tightBorder[0]-10;
		var t = path.tightBorder[1]-10;
		var w = path.tightBorder[2]+20;
		var h = path.tightBorder[3]+20;
		canvas.width = w+100;
		canvas.height = h+100;
		canvas.ctx.translate(-l,-t);
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			drawObjToCtx(canvas.ctx,path,obj);
			if (un(dragObjTypes[obj.type])) dragObjTypes[obj.type] = 0;
			dragObjTypes[obj.type]++;
			dragObjs.push(obj);
		}
		path._dragImage = new Image();
		path._dragImage.src = canvas.toDataURL("image/png");
		canvas.ctx.translate(l,t);
		path._dragOffset = [path.tightBorder[0]-pos[0],path.tightBorder[1]-pos[1]];
	}
	var dragObjTypes2 = [];
	for (var key in dragObjTypes) dragObjTypes2.push([key,dragObjTypes[key]]);
	var dragObjType = dragObjTypes2.length === 1 ? dragObjTypes2[0] : 'mixed';
	
	if (paths.length === 1 && paths[0].obj.length === 1 && !un(draw[paths[0].obj[0].type].editModeDragStart)) {
		draw[paths[0].obj[0].type].editModeDragStart(paths[0].obj[0]);
		return;
	}
	
	var dragBorder = {tightBorder:{},border:{}};
	for (var p = 0; p < paths.length; p++) {
		var path = paths[p];
		dragBorder.tightBorder.left = un(dragBorder.tightBorder.left) ? path.tightBorder[0] : Math.min(dragBorder.tightBorder.left,path.tightBorder[0]);
		dragBorder.tightBorder.top = un(dragBorder.tightBorder.top) ? path.tightBorder[1] : Math.min(dragBorder.tightBorder.top,path.tightBorder[1]);
		dragBorder.tightBorder.right = un(dragBorder.tightBorder.right) ? path.tightBorder[4] : Math.max(dragBorder.tightBorder.right,path.tightBorder[4]);
		dragBorder.tightBorder.bottom = un(dragBorder.tightBorder.bottom) ? path.tightBorder[5] : Math.max(dragBorder.tightBorder.bottom,path.tightBorder[5]);
		dragBorder.tightBorder.center = 0.5*(dragBorder.tightBorder.left + dragBorder.tightBorder.right);
		dragBorder.tightBorder.middle = 0.5*(dragBorder.tightBorder.top + dragBorder.tightBorder.bottom);
		dragBorder.tightBorder.width = dragBorder.tightBorder.right-dragBorder.tightBorder.left;
		dragBorder.tightBorder.height = dragBorder.tightBorder.bottom-dragBorder.tightBorder.top;
		
		dragBorder.border.left = un(dragBorder.border.left) ? path.border[0] : Math.min(dragBorder.border.left,path.border[0]);
		dragBorder.border.top = un(dragBorder.border.top) ? path.border[1] : Math.min(dragBorder.border.top,path.border[1]);
		dragBorder.border.right = un(dragBorder.border.right) ? path.border[4] : Math.max(dragBorder.border.right,path.border[4]);
		dragBorder.border.bottom = un(dragBorder.border.bottom) ? path.border[5] : Math.max(dragBorder.border.bottom,path.border[5]);
		dragBorder.border.center = 0.5*(dragBorder.border.left + dragBorder.border.right);
		dragBorder.border.middle = 0.5*(dragBorder.border.top + dragBorder.border.bottom);
		dragBorder.border.width = dragBorder.border.right-dragBorder.border.left;
		dragBorder.border.height = dragBorder.border.bottom-dragBorder.border.top;
	}
	dragBorder.border.offset = [dragBorder.border.left-pos[0],dragBorder.border.top-pos[1]];
	dragBorder.tightBorder.offset = [dragBorder.tightBorder.left-pos[0],dragBorder.tightBorder.top-pos[1]];
	
	draw.drag = {
		paths:paths,
		pos:clone(draw.mouse),
		initialPos:clone(draw.mouse),
		dragBorder:dragBorder,
		dragObjType:dragObjType,
		dragObjs:dragObjs,
		dragObjTypes:dragObjTypes2
	};
	
	/*var snapMargins = draw.getSnapBorders();
	snapMargins.x = snapMargins.x.filter(function(x) {
		if (x.margin === true) return true;
		if (!un(x.paths)) {
			x.paths = x.paths.filter(function(path) {
				return paths.indexOf(path) === -1 ? true : false;
			});
			if (x.paths.length > 0) return true;
		}
		return false;
	});
	snapMargins.y = snapMargins.y.filter(function(y) {
		if (y.margin === true) return true;
		if (!un(y.paths)) {
			y.paths = y.paths.filter(function(path) {
				return paths.indexOf(path) === -1 ? true : false;
			});
			if (y.paths.length > 0) return true;
		}
		return false;
	});
	draw.drag.snapMargins = snapMargins;
	console.log('snapMargins:',snapMargins);*/
	
	draw.dragSnapped = false;
	
	draw.drawCanvas[draw.drawCanvas.length-1].ctx.clear();
	draw.drawCanvas[draw.drawCanvas.length-2].ctx.clear();
	selectDragDraw();
	
	draw.animate(selectDragMove,selectDragStop,selectDragDraw);
};
function selectDragDraw() {
	draw.drawCanvas[draw.drawCanvas.length-1].ctx.clear();
	draw.drawCanvas[draw.drawCanvas.length-2].ctx.clear();
	
	var ctx = draw.drawCanvas[1].ctx;
	ctx.clear();
	var paths = draw.drag.paths;
	for (var p = 0; p < paths.length; p++) {
		var path = paths[p];
		if (un(path._dragImage)) {
			drawCanvasPaths();
			return;
		}
		ctx.drawImage(path._dragImage,path.tightBorder[0]-10,path.tightBorder[1]-10);
	}
	
	if (draw.drag.showDragBorder !== false) {
		ctx.strokeStyle = draw.selectColor;
		ctx.lineWidth = 1;
		var rect1 = draw.drag.dragBorder.border;
		ctx.strokeRect(rect1.left,rect1.top,rect1.width,rect1.height);
		var rect2 = draw.drag.dragBorder.tightBorder;
		ctx.strokeRect(rect2.left,rect2.top,rect2.width,rect2.height);
	}	
	
	if (!un(draw.drag.snapped)) {
		var centerSnapped = false;
		if (draw.drag.snapped.xType === 'center' && draw.drag.snapped.yType === 'middle') {
			var xyPaths = draw.drag.snapped.xPaths.filter(function(n) {
				return draw.drag.snapped.yPaths.indexOf(n) > -1;
			});
			if (xyPaths.length > 0) {
				var x = draw.drag.snapped.x;
				var y = draw.drag.snapped.y;

				ctx.fillStyle = colorA('#FFC',0.5);
				for (var p = 0; p < xyPaths.length; p++) {
					var path2 = xyPaths[p];
					ctx.fillRect(path2.tightBorder[0],path2.tightBorder[1],path2.tightBorder[2],path2.tightBorder[3]);
				}
				ctx.strokeStyle = '#F90';
				ctx.setLineDash([10,10]);
				ctx.lineWidth = 1;
				for (var p = 0; p < xyPaths.length; p++) {
					var path2 = xyPaths[p];
					ctx.strokeRect(path2.tightBorder[0],path2.tightBorder[1],path2.tightBorder[2],path2.tightBorder[3]);
				}
				ctx.setLineDash([]);
				
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(x,0);
				ctx.lineTo(x,1700);
				ctx.moveTo(0,y);
				ctx.lineTo(1200,y);
				ctx.stroke();
				
				centerSnapped = true;
			}
		}
		
		if (centerSnapped === false && !un(draw.drag.snapped.xPaths)) {
			ctx.fillStyle = draw.drag.snapped.xType.indexOf('margin') > -1 ? colorA('#FCC',0.3) : colorA('#FCF',0.3);
			for (var p = 0; p < draw.drag.snapped.xPaths.length; p++) {
				var path2 = draw.drag.snapped.xPaths[p];
				ctx.fillRect(path2.tightBorder[0],path2.tightBorder[1],path2.tightBorder[2],path2.tightBorder[3]);
			}
		}
		if (centerSnapped === false && !un(draw.drag.snapped.yPaths)) {	
			var y = draw.drag.snapped.y;
			
			ctx.fillStyle = draw.drag.snapped.yType.indexOf('margin') > -1 ? colorA('#FFC',0.3) : colorA('#CFC',0.3);
			for (var p = 0; p < draw.drag.snapped.yPaths.length; p++) {
				var path2 = draw.drag.snapped.yPaths[p];
				ctx.fillRect(path2.tightBorder[0],path2.tightBorder[1],path2.tightBorder[2],path2.tightBorder[3]);
			}
		}
	
		if (centerSnapped === false && !un(draw.drag.snapped.xPaths)) {
			var x = draw.drag.snapped.x;

			ctx.strokeStyle = draw.drag.snapped.xType.indexOf('margin') > -1 ? '#900' : '#909';
			ctx.setLineDash([10,10]);
			ctx.lineWidth = 1;
			for (var p = 0; p < draw.drag.snapped.xPaths.length; p++) {
				var path2 = draw.drag.snapped.xPaths[p];
				ctx.strokeRect(path2.tightBorder[0],path2.tightBorder[1],path2.tightBorder[2],path2.tightBorder[3]);
			}
			ctx.setLineDash([]);
			
			ctx.lineWidth = draw.drag.snapped.xType.indexOf('margin') > -1 ? 4 : 2;
			ctx.beginPath();
			ctx.moveTo(x,0);
			ctx.lineTo(x,1700);
			ctx.stroke();
		}
		if (centerSnapped === false && !un(draw.drag.snapped.yPaths)) {	
			var y = draw.drag.snapped.y;
			
			ctx.strokeStyle = draw.drag.snapped.yType.indexOf('margin') > -1 ? '#990' : '#090';
			ctx.setLineDash([10,10]);
			ctx.lineWidth = 1;
			for (var p = 0; p < draw.drag.snapped.yPaths.length; p++) {
				var path2 = draw.drag.snapped.yPaths[p];
				ctx.strokeRect(path2.tightBorder[0],path2.tightBorder[1],path2.tightBorder[2],path2.tightBorder[3]);
			}
			ctx.setLineDash([]);
			
			ctx.lineWidth = draw.drag.snapped.yType.indexOf('margin') > -1 ? 4 : 2;
			ctx.beginPath();
			ctx.moveTo(0,y);
			ctx.lineTo(1200,y);
			ctx.stroke();
		}
	}
}
function selectDragGetSnapPos() {
	var pos = draw.mouse;
	//console.log(draw.drag);
	var paths = draw.drag.paths;
	delete draw.drag.snapped;
	
	var x = draw.mouse[0];
	var y = draw.mouse[1];
		
	if (ctrlOn === true && paths.length === 1 && paths[0].obj.length === 1) {
		var path = paths[0];
		var obj = path.obj[0];
		var dx = x + path._dragOffset[0] - path.tightBorder[0];
		var dy = y + path._dragOffset[1] - path.tightBorder[1];
		if (obj.type == 'circle' || obj.type == 'point') {		
			var dragCenterPos = vector.addVectors(obj.center,[dx,dy]);
			var snapPos = snapToObj2(dragCenterPos);
			if (snapPos[0] !== dragCenterPos[0] && snapPos[1] !== dragCenterPos[1]) {
				var dx = snapPos[0]-obj.center[0];
				var dy = snapPos[1]-obj.center[1];
				x = dx - path._dragOffset[0] + path.tightBorder[0];
				y = dy - path._dragOffset[1] + path.tightBorder[1];
				draw.drag.snapped = {type:'snappedToObj'};
			}
		} else if (obj.type == 'text2' && shiftOn === true && ctrlOn === true) { // snap text boxes to fit table cells
			var objCenter = [obj.rect[0]+0.5*obj.rect[2],obj.rect[1]+0.5*obj.rect[3]];
			var dragCenterPos = vector.addVectors(objCenter,[dx,dy]);
			for (var p = 0; p < draw.path.length; p++) {
				var path2 = draw.path[p];
				if (path2 === path) continue;
				for (var o = 0; o < path2.obj.length; o++) {
					var obj2 = path2.obj[o];
					if (obj === obj2) continue;
					if (obj2.type == 'table2') {
						var rects = draw.table2.getCellRects(obj2);
						for (var c = 0; c < rects.length; c++) {
							var rect = rects[c];
							var cellX = rect[0]+0.5*rect[2];
							var cellY = rect[1]+0.5*rect[3];
							var offset = [dragCenterPos[0]-cellX,dragCenterPos[1]-cellY]
							if (vector.getMagnitude(offset) < draw.snapTolerance) {
								
								var dx = cellX-objCenter[0];
								var dy = cellY-objCenter[1];
								
								if (obj.rect[2] !== rect[2] || obj.rect[3] !== rect[3] || un(obj.align) || obj.align[0] !== 0 || obj.align[1] !== 0) {
									obj.rect[2] = rect[2];
									obj.rect[3] = rect[3];
									obj.align = [0,0];
									
									updateBorder(path);
									var l = path.tightBorder[0]-10;
									var t = path.tightBorder[1]-10;
									var w = path.tightBorder[2]+20;
									var h = path.tightBorder[3]+20;
									var canvas = draw.hiddenCanvas;
									canvas.width = w+100;
									canvas.height = h+100;
									canvas.ctx.translate(-l,-t);
									drawObjToCtx(canvas.ctx,path,obj);
									path._dragImage = new Image();
									path._dragImage.src = canvas.toDataURL("image/png");
									canvas.ctx.translate(l,t);
									path._dragOffset = [path.tightBorder[0]-x,path.tightBorder[1]-y];
								}
								x = dx - path._dragOffset[0] + path.tightBorder[0];
								y = dy - path._dragOffset[1] + path.tightBorder[1];
								return [x,y];
							}
							
						}
					}
				}
			}
			
		}
		/* else if (obj.type == 'text2' && (shiftOn === true || ctrlOn === true)) {
			var xLeft = obj.rect[0]+x;
			var xCenter = obj.rect[0]+0.5*obj.rect[2]+x;
			var xRight = obj.rect[0]+obj.rect[2]+x;
			var yTop = obj.rect[1]+y;
			var yMiddle = obj.rect[1]+0.5*obj.rect[3]+y;
			var yBottom = obj.rect[1]+obj.rect[3]+y;
			var found = false;
			if (un(draw.savedTextAlign)) {
				draw.savedTextArray = clone(obj.text);
				draw.savedTextAlign = clone(obj.align);
			}
			var closest = {dist:draw.snapTolerance+0.1};
			for (var p = 0; p < draw.path.length; p++) {
				var path2 = draw.path[p];
				if (path2 === path) continue;
				for (var o = 0; o < path2.obj.length; o++) {
					var obj2 = path2.obj[o];
					if (obj === obj2) continue;
					if (obj2.type === 'text2' && !un(obj2.box) && obj2.box.type === 'loose') {
						var x1 = obj2.rect[0]+10;
						var y1 = obj2.rect[1]+10;
						var x2 = obj2.rect[0]+obj2.rect[2]-10;
						var y2 = obj2.rect[1]+obj2.rect[3]-10;
						
						var leftTopOffset = [x1-xLeft,y1-yTop];
						var mag = vector.getMagnitude(leftTopOffset);
						if (mag < closest.dist) {
							closest = {
								dist:mag,
								offset:leftTopOffset,
								align:[-1,-1]
							}
						}
						
						var rightTopOffset = [x2-xRight,y1-yTop];
						var mag = vector.getMagnitude(rightTopOffset);
						if (mag < closest.dist) {
							closest = {
								dist:mag,
								offset:rightTopOffset,
								align:[1,-1]
							}
						}
						
						var leftBottomOffset = [x1-xLeft,y2-yBottom];
						var mag = vector.getMagnitude(leftBottomOffset);
						if (mag < closest.dist) {
							closest = {
								dist:mag,
								offset:leftBottomOffset,
								align:[-1,1]
							}
						}
						
						var rightBottomOffset = [x2-xRight,y2-yBottom];
						var mag = vector.getMagnitude(rightBottomOffset);
						if (mag < closest.dist) {
							closest = {
								dist:mag,
								offset:rightBottomOffset,
								align:[1,1]
							}
						}
						
						var centerMiddleOffset = [(x1+x2)/2-xCenter,(y1+y2)/2-yMiddle];
						var mag = vector.getMagnitude(centerMiddleOffset);
						if (mag < closest.dist) {
							closest = {
								dist:mag,
								offset:centerMiddleOffset,
								align:[0,0]
							}
						}
					} else if (obj2.type == 'table2') {
						var rects = draw.table2.getCellRects(obj2);
						for (var c = 0; c < rects.length; c++) {
							var rect = rects[c];
							var x1 = rect[0];
							var y1 = rect[1];
							var x2 = x1+rect[2];
							var y2 = y1+rect[3];
							
							var leftTopOffset = [x1-xLeft,y1-yTop];
							var mag = vector.getMagnitude(leftTopOffset);
							if (mag < closest.dist) {
								closest = {
									dist:mag,
									offset:leftTopOffset,
									align:[-1,-1]
								}
							}
							
							var rightTopOffset = [x2-xRight,y1-yTop];
							var mag = vector.getMagnitude(rightTopOffset);
							if (mag < closest.dist) {
								closest = {
									dist:mag,
									offset:rightTopOffset,
									align:[1,-1]
								}
							}
							
							var leftBottomOffset = [x1-xLeft,y2-yBottom];
							var mag = vector.getMagnitude(leftBottomOffset);
							if (mag < closest.dist) {
								closest = {
									dist:mag,
									offset:leftBottomOffset,
									align:[-1,1]
								}
							}
							
							var rightBottomOffset = [x2-xRight,y2-yBottom];
							var mag = vector.getMagnitude(rightBottomOffset);
							if (mag < closest.dist) {
								closest = {
									dist:mag,
									offset:rightBottomOffset,
									align:[1,1]
								}
							}
							
							var centerMiddleOffset = [(x1+x2)/2-xCenter,(y1+y2)/2-yMiddle];
							var mag = vector.getMagnitude(centerMiddleOffset);
							if (mag < closest.dist) {
								closest = {
									dist:mag,
									offset:centerMiddleOffset,
									align:[0,0]
								}
							}
						}
					}
				}
			}
			if (!un(closest.offset)) {
				obj.text = removeTagsOfType(obj.text,'align');
				obj.rect[0] += closest.offset[0];
				obj.rect[1] += closest.offset[1];
				obj.align = closest.align;
				draw.dragSnapped = true;
				drawCanvasPaths();
			} else {
				obj.text = draw.savedTextArray;
				obj.align = draw.savedTextAlign;
			}
		}*/
	} else if (shiftOn == true) {
		var dragBorder = draw.drag.dragBorder;
		var dx = x + dragBorder.border.offset[0] - dragBorder.border.left;
		var dy = y + dragBorder.border.offset[1] - dragBorder.border.top;
		var snap = snapBorders2(dragBorder,paths,dx,dy);
		if (snap.x.type !== 'none') {
			x = snap.x.dx - dragBorder.border.offset[0] + dragBorder.border.left;
			if (un(draw.drag.snapped)) draw.drag.snapped = {type:snap.x.type};
			draw.drag.snapped.xPaths = snap.x.snapToPaths;
			draw.drag.snapped.xType = snap.x.type;
			draw.drag.snapped.x = snap.x.x;
		}
		if (snap.y.type !== 'none') {
			y = snap.y.dy - dragBorder.border.offset[1] + dragBorder.border.top;
			if (un(draw.drag.snapped)) draw.drag.snapped = {type:snap.y.type};
			draw.drag.snapped.yPaths = snap.y.snapToPaths;
			draw.drag.snapped.yType = snap.y.type;
			draw.drag.snapped.y = snap.y.y;
		}
	}
	
	return [x,y];
}
function snapBorders2(dragBorder,selPaths,dx,dy) {
	var snap = {x:{type:'none',dx:dx},y:{type:'none',dy:dy}};
	var tol = draw.snapTolerance*2;
	var closeX = tol+1;
	var closeY = tol+1;
	
	// snap to margins
	var l2 = dragBorder.tightBorder.left+dx;	
	var r2 = dragBorder.tightBorder.right+dx;
	var c2 = dragBorder.tightBorder.center+dx;	
	var dl = l2-draw.gridMargin[0];
	var dr = r2-(1200-draw.gridMargin[2]);
	var dc = c2-600;
	if (Math.abs(dl) < tol && Math.abs(dl) < closeX) {
		closeX = Math.abs(dl);
		snap.x = {type:'marginLeft',dx:dx-dl,x:draw.gridMargin[0],snapToPaths:[]};
	}
	if (Math.abs(dr) < tol && Math.abs(dr) < closeX) {
		closeX = Math.abs(dr);
		snap.x = {type:'marginRight',dx:dx-dr,x:1200-draw.gridMargin[2],snapToPaths:[]};
	}
	if (Math.abs(dc) < tol && Math.abs(dc) < closeX) {
		closeX = Math.abs(dc);
		snap.x = {type:'marginCenter',dx:dx-dc,x:600,snapToPaths:[]};
	}
	if (!un(draw.gridVertMargins) && getResourceType() === 'worksheet') {
		for (var m = 0; m < draw.gridVertMargins.length; m++) {
			var dl = l2-draw.gridVertMargins[m];
			if (Math.abs(dl) < tol && Math.abs(dl) < closeX) {
				closeX = Math.abs(dl);
				snap.x = {type:'marginLeft',dx:dx-dl,x:draw.gridVertMargins[m],snapToPaths:[]};
			}
		}
	}
	
	var t2 = dragBorder.tightBorder.left+dy;	
	var b2 = dragBorder.tightBorder.bottom+dy;
	var dt = t2-draw.gridMargin[1];
	var db = b2-(1700-draw.gridMargin[3]);
	
	if (Math.abs(dt) < tol && Math.abs(dt) < closeY) {
		closeY = Math.abs(dt);
		snap.y = {type:'marginTop',dy:dy-dt,y:draw.gridMargin[1],snapToPaths:[]};
	}
	if (Math.abs(db) < tol && Math.abs(db) < closeY) {
		closeY = Math.abs(db);
		snap.y = {type:'marginBottom',dy:dy-db,y:1700-draw.gridMargin[3],snapToPaths:[]};
	}
	if (!un(draw.gridHorizMargins) && getResourceType() === 'worksheet') {
		for (var m = 0; m < draw.gridHorizMargins.length; m++) {
			var db = b2-draw.gridHorizMargins[m];
			if (Math.abs(db) < tol && Math.abs(db) < closeX) {
				closeY = Math.abs(db);
				snap.y = {type:'marginBottom',dy:dy-db,y:draw.gridHorizMargins[m],snapToPaths:[]};
			}
		}
	}
	
	tol = draw.snapTolerance;
	
	// snap to path borders
	var border = dragBorder.tightBorder;
	var l1 = border.left+dx;
	var t1 = border.top+dy;
	var r1 = border.right+dx;
	var b1 = border.bottom+dy;
	var c1 = border.center+dx;
	var m1 = border.middle+dy;
	

	var paths2 = draw.path.filter(function(path2) {return selPaths.indexOf(path2) === -1});
	paths2.sort(function(a,b) {
		return Math.abs(a._center[1]-c1) < Math.abs(b._center[1]-m1) ? 1 : -1;
	});
	
	if (snap.x.type === 'none') {
		for (var p = 0; p < paths2.length; p++) {
			var path2 = paths2[p];
			if (selPaths.indexOf(path2) > -1) continue;
			
			var dl = l1-path2.tightBorder[0];
			var dr = r1-(path2.tightBorder[0]+path2.tightBorder[2]);
			var dc = c1-path2._center[0];
			if (Math.abs(dl) < tol && Math.abs(dl) < closeX) {
				closeX = Math.abs(dl);
				snap.x = {type:'left',dx:dx-dl,x:path2.tightBorder[0],snapToPaths:[path2]};
			}
			if (Math.abs(dc) < tol && Math.abs(dc) < closeX) {
				closeX = Math.abs(dc);
				snap.x = {type:'center',dx:dx-dc,x:path2._center[0],snapToPaths:[path2]};
			}
			if (Math.abs(dr) < tol && Math.abs(dr) < closeX) {
				closeX = Math.abs(dr);
				snap.x = {type:'right',dx:dx-dr,x:path2.tightBorder[0]+path2.tightBorder[2],snapToPaths:[path2]};
			}
		}
	}
	if (snap.x.type !== 'none') {
		for (var p = 0; p < draw.path.length; p++) {
			var path2 = draw.path[p];
			if (snap.x.snapToPaths.indexOf(path2) > -1) continue;
			if (selPaths.indexOf(path2) > -1) continue;
			if (snap.x.type === 'marginLeft' && Math.abs(path2.tightBorder[0] - snap.x.x) < 0.01) {
				snap.x.snapToPaths.push(path2);
			} else if (snap.x.type === 'marginRight' && Math.abs(path2.tightBorder[4] - snap.x.x) < 0.01) {
				snap.x.snapToPaths.push(path2);
			} else if (snap.x.type === 'marginCenter' && Math.abs(path2._center[0] - snap.x.x) < 0.01) {
				snap.x.snapToPaths.push(path2);
			} else if (snap.x.type === 'left' && Math.abs(path2.tightBorder[0] - snap.x.x) < 0.01) {
				snap.x.snapToPaths.push(path2);
			} else if (snap.x.type === 'center' && Math.abs(path2._center[0] - snap.x.x) < 0.01) {
				snap.x.snapToPaths.push(path2);
			} else if (snap.x.type === 'right' && Math.abs((path2.tightBorder[0]+path2.tightBorder[2]) - snap.x.x) < 0.01) {
				snap.x.snapToPaths.push(path2);
			}
		}
	}	
	
	if (snap.y.type === 'none') {
		paths2.sort(function(a,b) {
			return Math.abs(a._center[0]-c1) < Math.abs(b._center[0]-m1) ? 1 : -1;
		});
		for (var p = 0; p < paths2.length; p++) {
			var path2 = paths2[p];
			if (selPaths.indexOf(path2) > -1) continue;
			
			var dt = t1-path2.tightBorder[1];
			var db = b1-(path2.tightBorder[1]+path2.tightBorder[3]);
			var dm = m1-path2._center[1];
			if (Math.abs(dt) < tol && Math.abs(dt) < closeY) {
				closeY = Math.abs(dt);
				snap.y = {type:'top',dy:dy-dt,y:path2.tightBorder[1],snapToPaths:[path2]};
			}
			if (Math.abs(dm) < tol && Math.abs(dm) < closeY) {
				closeY = Math.abs(dm);
				snap.y = {type:'middle',dy:dy-dm,y:path2._center[1],snapToPaths:[path2]};
			}
			if (Math.abs(db) < tol && Math.abs(db) < closeY) {
				closeY = Math.abs(db);
				snap.y = {type:'bottom',dy:dy-db,y:path2.tightBorder[1]+path2.tightBorder[3],snapToPaths:[path2]};
			}
		}
	}
	if (snap.y.type !== 'none') {
		for (var p = 0; p < draw.path.length; p++) {
			var path2 = draw.path[p];
			if (snap.y.snapToPaths.indexOf(path2) > -1) continue;
			if (selPaths.indexOf(path2) > -1) continue;
			if (snap.y.type === 'marginTop' && Math.abs(path2.tightBorder[1] - snap.y.y) < 0.01) {
				snap.y.snapToPaths.push(path2);
			} else if (snap.y.type === 'marginBottom' && Math.abs(path2.tightBorder[1]+path2.tightBorder[3] - snap.y.y) < 0.01) {
				snap.y.snapToPaths.push(path2);
			} else if (snap.y.type === 'top' && Math.abs(path2.tightBorder[1] - snap.y.y) < 0.01) {
				snap.y.snapToPaths.push(path2);
			} else if (snap.y.type === 'middle' && Math.abs(path2._center[1] - snap.y.y) < 0.01) {
				snap.y.snapToPaths.push(path2);
			} else if (snap.y.type === 'bottom' && Math.abs((path2.tightBorder[1]+path2.tightBorder[3]) - snap.y.y) < 0.01) {
				snap.y.snapToPaths.push(path2);
			}
		}
	}	
	
	return snap;
}

// to be continued...
draw.getSnapBorders = function() {
	var snapBorders = {x:[],y:[]};
	snapBorders.x.push({margin:true,snapTo:'l',x:draw.gridMargin[0]});
	snapBorders.x.push({margin:true,snapTo:'r',x:draw.drawArea[0]+draw.drawArea[2]-draw.gridMargin[2]});
	snapBorders.x.push({margin:true,snapTo:'c',x:draw.drawArea[0]+draw.drawArea[2]/2});
	if (!un(draw.gridVertMargins) && getResourceType() === 'worksheet') {
		for (var m = 0; m < draw.gridVertMargins.length; m++) {
			var x = draw.gridVertMargins[m];
			snapBorders.x.push({margin:true,snapTo:'l',x:x});
		}
	}
	
	snapBorders.y.push({margin:true,snapTo:'t',y:draw.gridMargin[1]});
	snapBorders.y.push({margin:true,snapTo:'b',y:draw.drawArea[1]+draw.drawArea[3]-draw.gridMargin[3]});
	snapBorders.y.push({margin:true,snapTo:'m',y:draw.drawArea[1]+draw.drawArea[3]/2});
	if (!un(draw.gridHorizMargins) && getResourceType() === 'worksheet') {
		for (var m = 0; m < draw.gridHorizMargins.length; m++) {
			var y = draw.gridHorizMargins[m];
			snapBorders.y.push({margin:true,snapTo:'b',y:y});
		}
	}
	
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		var xl = path.tightBorder[0];
		var xc = path._center[0];
		var xr = path.tightBorder[0]+path.tightBorder[2];
		
		var yt = path.tightBorder[1];
		var ym = path._center[1];
		var yb = path.tightBorder[1]+path.tightBorder[3];
		
		var todo = [['x','l',xl],['x','c',xc],['x','r',xr],['y','t',yt],['y','m',ym],['y','b',yb]];
		
		for (var i = 0; i < 6; i++) {
			var dir = todo[i][0];
			var snapTo = todo[i][1];
			var value = todo[i][2];
			
			var found = false;
			for (var s = 0; s < snapBorders[dir].length; s++) {
				var snapBorder = snapBorders[dir][s];
				if (snapBorder.snapTo === snapTo && Math.abs(snapBorder[dir] - value) < 0.01) {
					if (un(snapBorder.paths)) snapBorder.paths = [];
					snapBorder.paths.push(path);
					found = true;
					break;
				}
			}
			if (found === false) {
				var snapBorder = {snapTo:snapTo,paths:[path]};
				if (dir === 'x') {
					snapBorder.x = value;
				} else {
					snapBorder.y = value;
				}
				snapBorders[dir].push(snapBorder);
			}
		}
	}
	
	return snapBorders;
}
draw.showSnapBorders = function(paths,hSide,vSide) {
	var snapBorders = draw.getSnapBorders();
	var ctx = draw.drawCanvas.last().ctx;
	ctx.clear();
	if (un(paths)) paths = selPaths();	
	if (un(hSide)) hSide = 'lcr';
	if (un(vSide)) vSide = 'tmb';
	var pos = [600,350];
	
	if (paths.length > 0) {
		var tightBorder = {};
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			tightBorder.left = un(tightBorder.left) ? path.tightBorder[0] : Math.min(tightBorder.left,path.tightBorder[0]);
			tightBorder.top = un(tightBorder.top) ? path.tightBorder[1] : Math.min(tightBorder.top,path.tightBorder[1]);
			tightBorder.right = un(tightBorder.right) ? path.tightBorder[4] : Math.max(tightBorder.right,path.tightBorder[4]);
			tightBorder.bottom = un(tightBorder.bottom) ? path.tightBorder[5] : Math.max(tightBorder.bottom,path.tightBorder[5]);
		}
		tightBorder.center = 0.5*(tightBorder.left + tightBorder.right);
		tightBorder.middle = 0.5*(tightBorder.top + tightBorder.bottom);
		pos = [tightBorder.center,tightBorder.middle];
	}
	
	for (var i = 0; i < snapBorders.x.length; i++) {
		var snapBorder = snapBorders.x[i];
		if (snapBorder.margin === true) {
			snapBorder.importance = 4;
			continue;
		}
		var tightBorder = [];
		for (var p = 0; p < snapBorder.paths.length; p++) {
			var path = snapBorder.paths[p];
			tightBorder.left = un(tightBorder.left) ? path.tightBorder[0] : Math.min(tightBorder.left,path.tightBorder[0]);
			tightBorder.top = un(tightBorder.top) ? path.tightBorder[1] : Math.min(tightBorder.top,path.tightBorder[1]);
			tightBorder.right = un(tightBorder.right) ? path.tightBorder[4] : Math.max(tightBorder.right,path.tightBorder[4]);
			tightBorder.bottom = un(tightBorder.bottom) ? path.tightBorder[5] : Math.max(tightBorder.bottom,path.tightBorder[5]);
		}
		tightBorder.center = 0.5*(tightBorder.left + tightBorder.right);
		tightBorder.middle = 0.5*(tightBorder.top + tightBorder.bottom);
		tightBorder.width = tightBorder.right-tightBorder.left;
		tightBorder.height = tightBorder.bottom-tightBorder.top;
		snapBorder.pathsTightBorder = tightBorder;
		var y = pos[1];
		if (tightBorder.top < y && y < tightBorder.bottom) {
			snapBorder.importance = 3;
		} else {
			snapBorder.dy = Math.min(Math.abs(y-tightBorder.top),Math.abs(y-tightBorder.bottom));
			snapBorder.importance = snapBorder.dy < 100 ? 2 : snapBorder.dy < 300 ? 1 : 0;
		}
	}
	snapBorders.x.sort(function(a,b) {
		return a.importance-b.importance;
	});
	for (var i = 0; i < snapBorders.x.length; i++) {
		var snapBorder = snapBorders.x[i];
		if (hSide.indexOf(snapBorder.snapTo) === -1) continue;
		if (snapBorder.importance < 3) continue;
		if (!un(snapBorder.paths) && paths.length >= snapBorder.paths.length && arraysIntersection(paths,snapBorder.paths).length === paths.length) continue;
		ctx.strokeStyle = ['#F00','#F90','#990','#909','#009'][snapBorder.importance];
		ctx.lineWidth = snapBorder.importance*2+1;
		ctx.beginPath();
		ctx.moveTo(snapBorder.x,0);
		ctx.lineTo(snapBorder.x,1700);
		ctx.stroke();
	}
	
	for (var i = 0; i < snapBorders.y.length; i++) {
		var snapBorder = snapBorders.y[i];
		if (snapBorder.margin === true) {
			snapBorder.importance = 4;
			continue;
		}
		var tightBorder = [];
		for (var p = 0; p < snapBorder.paths.length; p++) {
			var path = snapBorder.paths[p];
			tightBorder.left = un(tightBorder.left) ? path.tightBorder[0] : Math.min(tightBorder.left,path.tightBorder[0]);
			tightBorder.top = un(tightBorder.top) ? path.tightBorder[1] : Math.min(tightBorder.top,path.tightBorder[1]);
			tightBorder.right = un(tightBorder.right) ? path.tightBorder[4] : Math.max(tightBorder.right,path.tightBorder[4]);
			tightBorder.bottom = un(tightBorder.bottom) ? path.tightBorder[5] : Math.max(tightBorder.bottom,path.tightBorder[5]);
		}
		tightBorder.center = 0.5*(tightBorder.left + tightBorder.right);
		tightBorder.middle = 0.5*(tightBorder.top + tightBorder.bottom);
		tightBorder.width = tightBorder.right-tightBorder.left;
		tightBorder.height = tightBorder.bottom-tightBorder.top;
		snapBorder.pathsTightBorder = tightBorder;
		var x = pos[0];
		if (tightBorder.left < x && x < tightBorder.right) {
			snapBorder.importance = 3;
		} else {
			snapBorder.dx = Math.min(Math.abs(x-tightBorder.left),Math.abs(x-tightBorder.right));
			snapBorder.importance = snapBorder.dx < 100 ? 2 : snapBorder.dx < 300 ? 1 : 0;
		}
	}
	snapBorders.y.sort(function(a,b) {
		return a.importance-b.importance;
	});
	for (var i = 0; i < snapBorders.y.length; i++) {
		var snapBorder = snapBorders.y[i];
		if (vSide.indexOf(snapBorder.snapTo) === -1) continue;
		if (snapBorder.importance < 3) continue;
		if (!un(snapBorder.paths) && paths.length >= snapBorder.paths.length && arraysIntersection(paths,snapBorder.paths).length === paths.length) continue;
		ctx.strokeStyle = ['#F00','#F90','#990','#909','#009'][snapBorder.importance];
		ctx.lineWidth = snapBorder.importance*2+1;
		ctx.beginPath();
		ctx.moveTo(0,snapBorder.y);
		ctx.lineTo(1200,snapBorder.y);
		ctx.stroke();
	}
	
	return;
}
function arraysIntersection(arr1,arr2) {
	return arr1.filter(function(x) {return arr2.indexOf(x) > -1});
}

function selectDragMove(e) {
	updateMouse(e);
	var paths = draw.drag.paths;
	var pos = selectDragGetSnapPos();
	var dragBorder = draw.drag.dragBorder;
	
	var dx = pos[0]+dragBorder.border.offset[0]-dragBorder.border.left;
	var dy = pos[1]+dragBorder.border.offset[1]-dragBorder.border.top;
	dragBorder.border.left += dx;
	dragBorder.border.top += dy;
	dragBorder.border.right += dx;
	dragBorder.border.bottom += dy;
	dragBorder.border.center += dx;
	dragBorder.border.middle += dy;
	
	var dx = pos[0]+dragBorder.tightBorder.offset[0]-dragBorder.tightBorder.left;
	var dy = pos[1]+dragBorder.tightBorder.offset[1]-dragBorder.tightBorder.top;
	dragBorder.tightBorder.left += dx;
	dragBorder.tightBorder.top += dy;
	dragBorder.tightBorder.right += dx;
	dragBorder.tightBorder.bottom += dy;
	dragBorder.tightBorder.center += dx;
	dragBorder.tightBorder.middle += dy;
	
	for (var p = 0; p < paths.length; p++) {
		var path = paths[p];
		var x = pos[0]+path._dragOffset[0];
		var y = pos[1]+path._dragOffset[1];
		var dx = x-path.tightBorder[0];
		var dy = y-path.tightBorder[1];
		path.tightBorder[0] += dx;
		path.tightBorder[1] += dy;
		path.border[0] += dx;
		path.border[1] += dy;
		path._center[0] += dx;
		path._center[1] += dy;
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			repositionObj(obj,dx,dy,0,0);
		}
	}
}
function selectDragStop(e) {
	draw.undo.saveState();
	changeDrawMode();
	draw.cursorCanvas.style.cursor = draw.cursors.move1;
	var paths = draw.drag.paths;
	for (var p = 0; p < paths.length; p++) {
		var path = paths[p];
		delete path._dragImageData;
		delete path._dragImage;
		delete path._dragOffset;
	}
	draw.drag.dragging = false;
	//delete draw.drag;
	drawCanvasPaths();
}

function drawClickStartResizeObject() {
	changeDrawMode('selectResize');
	cursorPosHighlight(true);
	draw.cursorCanvas.style.cursor = draw.cursors.nw;	
	draw.prevX = draw.mouse[0];
	draw.prevY = draw.mouse[1];
	draw.resizePathNum = draw.currCursor.pathNum;
	draw.animate(selectResizeMove,selectResizeStop,drawCanvasPaths);
}
function selectResizeMove(e) {
	updateMouse(e);
	var dw = draw.mouse[0] - draw.prevX;
	var dh = draw.mouse[1] - draw.prevY;
	repositionPath(draw.path[draw.resizePathNum],0,0,dw,dh);
	draw.prevX = draw.mouse[0];
	draw.prevY = draw.mouse[1];
}
function selectResizeStop(e) {
	changeDrawMode('prev');
	draw.cursorCanvas.style.cursor = draw.cursors.move1;
	gridSnapObjects();
	draw.prevX = null;
	draw.prevY = null;
	delete draw.resizePathNum;
}

function drawClickStartResizePath() {
	changeDrawMode('selectResize');
	draw._path = draw.path[draw.currCursor.pathNum];
	//console.log(draw._path);
	draw.cursorCanvas.style.cursor = draw.cursors.nw;	
	draw.animate(selectResizePathMove,selectResizePathStop,function() {
		drawSelectedPaths();
		drawSelectCanvas();
	});
}
function selectResizePathMove(e) {
	updateMouse(e);
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	var sfx = (x-draw._path.tightBorder[0])/draw._path.tightBorder[2];
	var sfy = (y-draw._path.tightBorder[1])/draw._path.tightBorder[3];
	draw.scalePath(draw._path,Math.min(sfx,sfy),draw._path.tightBorder);
	updateBorder(draw._path);
}
function selectResizePathStop(e) {
	changeDrawMode('prev');
	draw.cursorCanvas.style.cursor = draw.cursors.move1;
	delete draw._pathNum;
}

draw.rotateStart = function(e) {
	changeDrawMode('selectRotate');
	cursorPosHighlight(true);
	draw.cursorCanvas.style.cursor = draw.cursors.rotate;	
	draw.currPath = draw.path[draw.currCursor.pathNum];
	addListenerMove(window,draw.rotateMove);
	addListenerEnd(window,draw.rotateStop);
}
draw.rotateMove = function(e) {
	updateMouse(e);
	var x = draw.mouse[0];
	var y = draw.mouse[1];
	draw.currPath.rotation = getAngleTwoPoints([draw.currPath.border[0]+0.5*draw.currPath.border[2],draw.currPath.border[1]+0.5*draw.currPath.border[3]],[x,y]) + Math.PI/2;
	drawSelectedPaths();
	drawSelectCanvas();
}
draw.rotateStop = function(e) {
	changeDrawMode('prev');
	draw.cursorCanvas.style.cursor = draw.cursors.move1;
	delete draw.currPath;
	removeListenerMove(window,draw.rotateMove);
	removeListenerEnd(window,draw.rotateStop);	
}

function drawClickAppear() {
	var pathNum = draw.currCursor.pathNum;
	var path = draw.path[pathNum];
	if (path.obj[0].type === 'taskQuestion') {
		return;
	} else if (!un(path.obj[0]._taskQuestion)) {
		path.questionTip = !un(path.questionTip) ? !path.questionTip : true;
	} else if (un(path.appear)) {
		path.appear = {};
	} else if (boolean(path.appear.reversible,false) == false) {
		path.appear.reversible = true;
	} else {
		delete path.appear;
	}
	updateBorder(path);
	drawCanvasPaths();
}
function drawClickAppearMoveStart() {
	changeDrawMode('appearMove');
	draw.cursorCanvas.style.cursor = draw.cursors.move2;
	draw.appearMoveMode = true;
	draw.selPath = draw.path[draw.currCursor.pathNum];
	draw.animate(drawClickAppearMoveMove,drawClickAppearMoveStop,drawSelectCanvas2);	
}
function drawClickAppearMoveMove(e) {
	updateMouse(e);
	var path = draw.selPath;
	delete path.appear.center;
	path.appear.pos = [round(draw.mouse[0],10),round(draw.mouse[1],10)];
	if (shiftOn) {
		path.appear.pos[1] = path.tightBorder[1]+0.5*path.tightBorder[3];
	} else if (ctrlOn === true) {
		var x = path.tightBorder[0]+0.5*path.tightBorder[2];
		var y = path.tightBorder[1]+0.5*path.tightBorder[3];
		if (Math.abs(x-draw.mouse[0]) < 20) path.appear.pos[0] = x;
		if (Math.abs(y-draw.mouse[1]) < 20) path.appear.pos[1] = y;

		var tables = draw.objsOfType('table2');
		for (var t = 0; t < tables.length; t++) {
			var table = tables[t];
			var paddingH = table.paddingH || 0;
			var paddingV = table.paddingV || 0;
			if (draw.mouse[0] > table.left && draw.mouse[0] < table.left+table.width && draw.mouse[1] > table.top && draw.mouse[1] < table.top+table.height) {
				for (var i = 0; i < table.xPos.length-1; i++) {
					var x0 = table.xPos[i];
					var x1 = table.xPos[i+1];
					var xp = [x0+paddingH+30,(x0+x1)/2,x1-paddingH-25];
					for (var x = 0; x < 3; x++) {
						var x1 = xp[x];
						if (Math.abs(x1-draw.mouse[0]) < 20) {
							path.appear.pos[0] = x1;
						}
					}
				}
				for (var i = 0; i < table.yPos.length-1; i++) {
					var y0 = table.yPos[i];
					var y1 = table.yPos[i+1];
					var yp = [y0+paddingV+30,(y0+y1)/2,y1-paddingV-25];
					for (var y = 0; y < 3; y++) {
						var y1 = yp[y];
						if (Math.abs(y1-draw.mouse[1]) < 20) {
							path.appear.pos[1] = y1;
						}
					}
				}
			}
			
		}
	}
}
function drawClickAppearMoveStop(e) {
	changeDrawMode();
	delete draw.selPath;
	delete draw.appearMoveMode;
	drawSelectCanvas2();
}

function drawClickTrigger() {
	var pathNum = draw.currCursor.pathNum;
	var path = draw.path[pathNum];
	
	//* just handles showAns at present
	if (!un(path.trigger) && arraysEqual(path.trigger,[false])) {
		delete path.trigger;
	} else {
		path.trigger = [false];
	}
	//*/
	
	/*var prevVis = true;
	if (typeof path.trigger == 'undefined') path.trigger = [];
	for (var l = 0; l <= draw.triggerNum; l++) {
		if (typeof path.trigger[l] == 'boolean') {
			prevVis = path.trigger[l];
		}
	}
	path.trigger[draw.triggerNum] = !prevVis;
	
	for (var o = 0; o < path.obj.length; o++) {
		var obj = path.obj[o];
		var prevVis = true;
		if (un(obj.trigger)) obj.trigger = [];
		for (var l = 0; l <= draw.triggerNum; l++) {
			if (typeof obj.trigger[l] == 'boolean') {
				prevVis = obj.trigger[l];
			}
		}
		obj.trigger[draw.triggerNum] = !prevVis;
	}
	
	if (!un(draw.triggerSlider) && draw.ansMode !== true && draw.triggerNum == draw.triggerNumMax) {
		draw.triggerNumMax++;
		draw.triggerSlider.max = draw.triggerNumMax;
		draw.triggerSlider.sliderData[100] = draw.triggerSlider.left + (draw.triggerNum / draw.triggerNumMax) * draw.triggerSlider.width;
		resize();
	}*/
	drawCanvasPaths();
}
function drawClickOrderPlus() {
	if (!un(draw.currCursor.pathNum)) {
		var pathNum = draw.currCursor.pathNum;
	} else {
		for (var p = 0; p < draw.path.length; p++) {
			if (draw.path[p].selected == true) {
				var pathNum = p;
				break;
			}
		}
	}
	if (un(pathNum)) return;
	if (ctrlOn == true) {
		bringToFront([draw.path[pathNum]]);
	} else {
		bringForward(pathNum);
	}
}
function drawClickOrderMinus() {
	if (!un(draw.currCursor.pathNum)) {
		var pathNum = draw.currCursor.pathNum;
	} else {
		for (var p = 0; p < draw.path.length; p++) {
			if (draw.path[p].selected == true) {
				var pathNum = p;
				break;
			}
		}
	}
	if (un(pathNum)) return;
	if (ctrlOn == true) {
		sendToBack([draw.path[pathNum]]);
	} else {
		sendBackward();
	}
}
function bringForward(pathNum) {
	if (un(pathNum)) pathNum = selPathNum();
	if (pathNum == -1 || pathNum == draw.path.length-1) return;
	var path = draw.path[pathNum];
	draw.path[pathNum] = draw.path[pathNum+1];
	draw.path[pathNum+1] = path;
	draw.currCursor.pathNum++;
	updateBorder(draw.path[pathNum]);
	updateBorder(draw.path[pathNum+1]);
	calcCursorPositions();
	drawCanvasPaths();
}
function sendBackward(pathNum) {
	if (un(pathNum)) pathNum = selPathNum();
	if (pathNum == -1 || pathNum == 0) return;
	var path = draw.path[pathNum];
	draw.path[pathNum] = draw.path[pathNum-1];
	draw.path[pathNum-1] = path;
	draw.currCursor.pathNum--;
	updateBorder(draw.path[pathNum-1]);
	updateBorder(draw.path[pathNum]);
	calcCursorPositions();
	drawCanvasPaths();	
}
function sendToBack(paths) {
	var applyToAllSel = un(paths) ? true : false;
	if (un(paths)) paths = [];
	for (var p = draw.path.length-1; p >= 0; p--) {
		if (applyToAllSel == true && draw.path[p].selected == true) paths.push(draw.path[p]);
		if (paths.includes(draw.path[p])) draw.path.splice(p,1);
	}
	for (var p = paths.length-1; p >= 0; p--) {
		draw.path.unshift(paths[p]);
	}
	calcCursorPositions();
	drawCanvasPaths();
}
function bringToFront(paths) {
	var applyToAllSel = un(paths) ? true : false;
	if (un(paths)) paths = [];
	for (var p = draw.path.length-1; p >= 0; p--) {
		if (applyToAllSel == true && draw.path[p].selected == true) paths.push(draw.path[p]);
		if (paths.includes(draw.path[p])) draw.path.splice(p,1);
	}
	for (var p = paths.length-1; p >= 0; p--) {
		draw.path.push(paths[p]);
	}
	calcCursorPositions();
	drawCanvasPaths();
}
function drawClickDelete() {
	if (!un(textEdit) && textEdit.obj !== null) textEdit.endInput();
	var pathNum = draw.currCursor.pathNum;
	if (draw.path[pathNum].selected == true) removePathObject(pathNum);
	for (var p = 0; p < draw.path.length; p++) {
		updateBorder(draw.path[p]);
	}
	calcCursorPositions();
	drawCanvasPaths();
	cursorPosHighlight(true);
}

draw.movePathToFront = function(path,parentPaths) {
	if (un(parentPaths)) parentPaths = draw.path;
	var index = parentPaths.indexOf(path);
	if (index === -1) return;
	parentPaths.splice(index,1);
	parentPaths.push(path);
	drawCanvasPaths();
}
draw.movePathToBack = function(path,parentPaths) {
	if (un(parentPaths)) parentPaths = draw.path;
	var index = parentPaths.indexOf(path);
	if (index === -1) return;
	parentPaths.splice(index,1);
	parentPaths.unshift(path);
	drawCanvasPaths();
}

draw.checkPathsForID = function(paths,id) {
	if (un(paths)) paths = draw.path;
	for (var p = 0; p < paths.length; p++) {
		if (paths[p].id === id) return true;
	}
	return false;
}
draw.getUniquePathID = function(paths,id) {
	if (un(paths)) paths = draw.path;
	var id2 = id;
	var num = 2;
	while (draw.checkPathsForID(paths,id2) === true) {
		id2 = id+'_'+num;
		num++;
	}
	return id2;
}
draw.checkObjsForID = function(paths,id) {
	if (un(paths)) paths = draw.path;
	for (var p = 0; p < paths.length; p++) {
		for (var o = 0; o < paths[p].obj.length; o++) {
			if (paths[p].obj[o].id === id) return true;
		}
	}
	return false;
}
draw.getUniqueObjID = function(paths,id) {
	if (un(paths)) paths = draw.path;
	var id2 = id;
	var num = 2;
	while (draw.checkObjsForID(paths,id2) === true) {
		id2 = id+'_'+num;
		num++;
	}
	return id2;
}

function cutPaths(e) {
	copyPaths(e);
	deletePaths();
	drawCanvasPaths();
}
function copyPaths(e) {
	if (sel().type === 'taskQuestion') {
		draw.taskEdit.copyQuestion(sel());
		return;
	}
	draw.pathClipboard = [];
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		if (path.selected) {
			for (var o = 0; o < path.obj.length; o++) {
				var obj2 = path.obj[o];
				if (obj2.type === 'polygon') {
					path.obj[o] = draw.polygon.stringifyFix(obj2);
				}
			}
			draw.pathClipboard.push(clone(path));
		}
	}

	if (typeof mode === 'string' && mode === 'edit') {
		var paths = stringify({currFilename:currFilename, paths:draw.pathClipboard});
		var paths2 = obfuscate(paths);
		updateClipboard(paths2);
	}
	function updateClipboard(newClip) {
		navigator.clipboard.writeText(newClip).then(function() {
			Notifier.success('copied to clipboard');
		}, function() {

		});
	}
	function stringify(obj) {
		var circular = [];
		var str = stringify(obj);
		return str;
		
		function stringify(obj) {
			var str = "";
			if (circular.indexOf(obj) > -1) return "null";
			if (obj instanceof Array) {
				for (var i = 0; i < obj.length; i++) {
					if (typeof obj[i] == 'object') {
						circular.push(obj);
						break;
					}
				}
				str += "[";
				for (var i = 0; i < obj.length; i++) {
					if (obj.hasOwnProperty(i) !== true) continue;
					//if (typeof obj[i] === 'function' && ['last','ran','max','min','sortOn','shuffle','isEmpty','alphanumSort'].includes(i)) continue;
					str += stringify(obj[i])+',';
				}
				if (str.slice(-1) == ',') str = str.slice(0,-1);
				str += "]";
			} else if (typeof obj == 'object' && obj !== null) {
				for (var key in obj) {
					if (typeof obj[key] == 'object') {
						circular.push(obj);
						break;
					}
				}
				str += "{";
				for (var key in obj) {
					if (obj.hasOwnProperty(key) !== true) continue;
					if (key.indexOf('_') === 0) continue;
					if (['borderButtons','border','tightBorder','selected','ctx','qBox',"data","cursorData","textLoc","cursorPos","cursorMap","allMap","canvas","ctx","cursorCanvas","cursorctx","startText","startRichText","startTags","stringJS","currBackColor","preText","postText"].includes(key)) continue;
					var value = stringify(obj[key]);
					if (value == '') continue;
					str += '"'+key+'":'+value+",";
				}
				if (str.slice(-1) == ',') str = str.slice(0,-1);
				str += "}";
			} else if (typeof obj == 'function') {
				var funcStr = obj.toString().replace(/\r?\n|\r|\t/g,"");
				str += JSON.stringify(funcStr);
			} else if (obj === Infinity) {
				str += '"is_infinity"';
			} else if (obj === -Infinity) {
				str += '"is_negative_infinity"';
			} else if (typeof obj == 'number' && !isNaN(obj)) {
				str += String(Number(obj.toFixed(3)));
			} else if (typeof obj == 'string') {
				var escapeString = replaceAll(obj,"\"","\\\"");
				str += '"'+escapeString+'"';
			} else if (typeof obj == 'boolean') {
				str += obj;
			} else {
				if (typeof obj !== 'undefined') console.log('draw.stringify type not included: ',typeof obj,obj);
				str += 'null';
			}
			return str;
		}
	}
	function obfuscate(str) {
		var bytes = [];
		for (var i = 0; i < str.length; i++) {
			var charCode = str.charCodeAt(i);
			charCode = String("00000" + charCode).slice(-5);
			bytes.push(charCode);
		}
		return bytes.join('');
	}
}
function pastePaths(e) {
	if (sel().type === 'taskQuestion') {
		draw.taskEdit.pasteQuestion(sel());
		return;
	}
	deselectAllPaths(false);
	/*if (!un(draw.pathClipboard) && draw.pathClipboard.length > 0) {
		var paths = clonePaths2(draw.pathClipboard);
		if (shiftOn === false) {
			var top;
			for (var c = 0; c < paths.length; c++) {
				var path = paths[c];
				if (un(top)) {
					top = path.tightBorder[1];
				} else {
					top = Math.min(top,path.tightBorder[1])
				}
			}
			for (var c = 0; c < paths.length; c++) {
				var path = paths[c];
				positionPath(path,path.tightBorder[0],40+path.tightBorder[1]-top);
			}
		}
		
		for (var c = 0; c < paths.length; c++) {
			var path = paths[c];
			if (typeof path.id === 'string') {
				path.id = draw.getUniquePathID(draw.path,path.id);
			}
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (typeof obj.id === 'string') {
					obj.id = draw.getUniqueObjID(draw.path,obj.id);
				}
			}
			draw.path.push(path);
		}		
		calcCursorPositions();
		drawCanvasPaths();
	}*/
	if (typeof mode === 'string' && mode === 'edit') {
		navigator.clipboard.readText().then(function(clipText) {
			var json = deobfuscate(clipText);
			try {
				var clipObj = parse(json);
				//Notifier.success('pasted from clipboard');
				var paths = draw.convertLoadedPaths(clipObj.paths);
				var top;
				for (var p = 0; p < paths.length; p++) {
					var path = paths[p];
					path.selected = true;
					updateBorder(path);
					if (un(top)) {
						top = path.tightBorder[1];
						if (un(top) || isNaN(top)) top = 0;
					} else {
						var top2 = path.tightBorder[1];
						if (!un(top) && !isNaN(top)) top = Math.min(top,top2)
					}
				}
				if (shiftOn === false) {
					var viewRect = draw.getView().pageViewRect;
					
					var pathsLeft;
					var pathsTop;
					for (var c = 0; c < paths.length; c++) {
						var path = paths[c];
						pathsLeft = (un(pathsLeft)) ? path.tightBorder[0] : Math.min(path.tightBorder[0],pathsLeft);
						pathsTop = (un(pathsTop)) ? path.tightBorder[1] : Math.min(path.tightBorder[1],pathsTop);
					}
										
					for (var c = 0; c < paths.length; c++) {
						var path = paths[c];
						positionPath(path,viewRect[0]+20+path.tightBorder[0]-pathsLeft,viewRect[1]+20+path.tightBorder[1]-pathsTop);
						updateBorder(path);
					}
				}
				for (var c = 0; c < paths.length; c++) {
					var path = paths[c];
					if (typeof path.id === 'string') {
						path.id = draw.getUniquePathID(draw.path,path.id);
					}
					for (var o = 0; o < path.obj.length; o++) {
						var obj = path.obj[o];
						obj._page = file.resources[resourceIndex].pages[pIndex];
						if (typeof obj.id === 'string') {
							obj.id = draw.getUniqueObjID(draw.path,obj.id);
						}
					}
					draw.path.push(path);
				}
				calcCursorPositions();
				drawCanvasPaths();
			} catch (e) {
				console.log(e,json);
			}		
		});
		function parse(json) {
			var obj = JSON.parse(json);
			parseObj(obj);
			return obj;
			
			function parseObj(obj) {
				if (obj instanceof Array) {
					for (var i = 0; i < obj.length; i++) {
						parseObj(obj[i]);
					}
				} else if (typeof obj === 'object') {
					for (var key in obj) {
						if (typeof obj[key] === 'object') {
							parseObj(obj[key]);
						} else if (obj[key] === 'is_infinity') {
							obj[key] = Infinity;
						} else if (obj[key] === 'is_negative_infinity') {
							obj[key] = -Infinity;
						} else if (typeof obj[key] === 'string') {
							if (obj[key].indexOf('function(') === 0 || obj[key].indexOf('function (') === 0) {
								obj[key] = Function("return " + obj[key])();
							}
						}
					}
				}				
			}
		}
		function deobfuscate(bytes) {
			var str = '';
			while (bytes.length > 0) {
				var code = bytes.slice(0,5);
				bytes = bytes.slice(5);
				str += String.fromCharCode(Number(code));
			}
			return str;
		}
	}
}
function clearPathClipboard() {
	draw.pathClipboard = [];
}
function clonePaths(paths) {
	if (un(paths)) paths = draw.path;
	var selected = [];
	for (var p = 0, pMax = paths.length; p < pMax; p++) {
		if (paths[p].selected == true) selected.push(paths[p]);
	}
	var clones = clonePaths2(selected);
	deselectAllPaths(false);
	for (var c = 0; c < clones.length; c++) {
		var path = clones[c];
		if (typeof path.id === 'string') {
			path.id = draw.getUniquePathID(draw.path,path.id);
		}
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			obj._page = file.resources[resourceIndex].pages[pIndex];
			if (typeof obj.id === 'string') {
				obj.id = draw.getUniqueObjID(draw.path,obj.id);
			}
		}
		draw.path.push(path);
	}
	for (var p = pMax; p < draw.path.length; p++) {	
		repositionPath(draw.path[p],40,40,0,0);
	}
	drawCanvasPaths();
}
function clonePaths2(paths) {
	var clones = [];
	for (var p = 0, pMax = paths.length; p < pMax; p++) {
		var path = clone(paths[p]);
		delete path.ctx;
		delete path.qIndex;
		for (var o = 0; o < path.obj.length; o++) {
			var obj = path.obj[o];
			if (un(obj)) continue;
			if (!un(obj.ctx)) delete obj.ctx;
			if (!un(draw[obj.type]) && typeof draw[obj.type].clone === 'function') draw[obj.type].clone(obj);
		}
		clones.push(path);
	}
	return clones;
}
function deletePaths() {
	for (var i = draw.path.length-1; i >= 0; i--) {
		if (draw.path[i].selected == true) {
			removePathObject(i);
		}
	}	
}
function clearDrawPaths() {
	for (var i = draw.path.length - 1; i >= 0; i--) {
		removePathObject(i);
	}
	drawCanvasPaths();
	//pathCanvasReset();
}
function deleteSelectedPaths() {
	for (var p = draw.path.length-1; p >= 0; p--) {
		if (draw.path[p].selected == true) {
			removePathObject(p);
		}
	}
	for (var p = 0; p < draw.path.length; p++) {
		updateBorder(draw.path[p]);
	}
	calcCursorPositions();
	drawCanvasPaths();
	drawSelectCanvas();	
}
function removePathObject(num) {
	draw.path.splice(num,1);
}

function selectAllPaths() {
	for (var p = 0; p < draw.path.length; p++) {
		draw.path[p].selected = shiftOn ? getPathVis(draw.path[p]) : true;
	}
	drawCanvasPaths();
	calcCursorPositions();	
}
function deselectAllPaths(redraw) {
	if (un(redraw)) redraw = true;
	if (!un(draw.gridMenu) && draw.gridMenu.showing == true) draw.gridMenu.hide();
	for (var i = 0; i < draw.path.length; i++) {
		if (draw.path[i].selected) {
			draw.path[i].selected = false;
		}
	}
	if (redraw == true) drawCanvasPaths();
	if (!un(draw.controlPanel)) draw.controlPanel.clear();
	if (!un(draw.controlPanel2) && !un(draw.controlPanel2.ctx)) draw.controlPanel2.clear();
	calcCursorPositions();
}
function getSelectedPaths() {
	var sel = [];
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected == true) {
			sel.push(p);
		}
	}
	return sel;
}

function groupPaths() {
	var selected = [];
	var qIndices = [];
	for (var i = 0; i < draw.path.length; i++) {
		if (draw.path[i].obj.length == 1) {
			var obj = draw.path[i].obj[0];
			if (obj.type === 'qBox' || (!un(draw[obj.type]) && draw[obj.type].groupable === false)) continue;
		}
		if (draw.path[i].obj.length == 1 && draw.path[i].obj[0].type === 'qBox') continue;
		if (draw.path[i].selected == true) selected.push(i);
		if (!un(draw.path[i].qIndex) && qIndices.indexOf(draw.path[i].qIndex) === -1) qIndices.push(draw.path[i].qIndex);
	}
	if (selected.length > 1) {
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (path.selected == true) {
				updateBorder(path);
				if (!un(path.trigger)) {
					for (var o = 0; o < path.obj.length; o++) {
						var obj = path.obj[o];
						obj.trigger = clone(path.trigger);
					}
				}
			}
		}
		var pathObject = [];
		for (i = 0; i < selected.length; i++) {
			for (var k = 0; k < draw.path[selected[i]].obj.length; k++) {
				pathObject.push(draw.path[selected[i]].obj[k]);
			}
		}
		draw.path[selected[selected.length-1]].obj = pathObject.slice(0);
		draw.path[selected[selected.length-1]].selected = true;
		if (qIndices.length === 1) {
			draw.path[selected[selected.length-1]].qIndex = qIndices[0];
		} else if (qIndices.length > 1) {
			var qIndex = prompt('enter qIndex (multiple found: '+(qIndices.join(', '))+')',qIndices[0]);
			if (qIndex !== '' && qIndex !== null && qIndex !== false && !isNaN(Number(qIndex))) {
				draw.path[selected[selected.length-1]].qIndex = Number(qIndex);
			}
		}
		delete draw.path[selected[selected.length-1]].trigger;
		for (i = selected.length - 2; i >= 0; i--) removePathObject(selected[i]);
		draw.updateAllBorders();
		drawCanvasPaths();
		calcCursorPositions();		
	}
}

function setObjPos(obj,x,y,xAlign,yAlign) {
	if (un(obj.left) || un(obj.top) || un(obj.width) || un(obj.height)) return;
	var dl = 0, dt = 0;
	if (xAlign == 'left') {
		dl = x - obj.left;
	} else if (xAlign == 'center') {
		dl = x - 0.5*obj.width - obj.left;
	} else if (xAlign == 'right') {
		dl = x - obj.width - obj.left;		
	}
	if (yAlign == 'top') {
		dt = y - obj.top;
	} else if (yAlign == 'middle') {
		dt = y - 0.5*obj.height - obj.top;
	} else if (yAlign == 'bottom') {
		dt = y - obj.height - obj.top;
	}
	repositionObj(obj,dl,dt,0,0);
}

function ungroupPaths() {
	for (var p = draw.path.length-1; p >= 0; p--) {
		var path = draw.path[p];
		if (path.selected == true && path.obj.length > 1) {
			var newPaths = [];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				var trigger = [];
				if (!un(obj.trigger)) {
					trigger = clone(obj.trigger);
					delete obj.trigger;
				}
				var newPath = {obj:[obj],selected:true,trigger:trigger};
				if (!un(path.qIndex)) newPath.qIndex = path.qIndex;
				newPaths.push(newPath);
			}
			//draw.updateAllBorders(newPaths);
			//console.log(newPaths);
			draw.path = draw.path.slice(0,p).concat(newPaths).concat(draw.path.slice(p+1));
		}
	}
	draw.updateAllBorders();
	drawCanvasPaths();
	calcCursorPositions();
}

function positionPath(path,left,top) {
	updateBorder(path);
	if (un(left) || un(path.tightBorder[0]) || isNaN(path.tightBorder[0])) {
		var dl = 0;
	} else {
		var dl = left - path.tightBorder[0];
	}
	if (un(top) || un(path.tightBorder[1]) || isNaN(path.tightBorder[1])) {
		var dt = 0;
	} else {
		var dt = top - path.tightBorder[1];
	}
	repositionPath(path,dl,dt);
}
function repositionPath(path,dl,dt,dw,dh) {
	if (typeof dl !== 'number') dl = 0;
	if (typeof dt !== 'number') dt = 0;
	if (typeof dw !== 'number') dw = 0;
	if (typeof dh !== 'number') dh = 0;
	if (!un(path.question) && !un(path._rect)) {
		path._rect[0] += dl;
		path._rect[1] += dt;
		path._rect[2] += dw;
		path._rect[3] += dh;
		arrangeQuestion(q);
	} else {
		for (var j = 0; j < path.obj.length; j++) {	
			var obj = path.obj[j];
			if (obj.tbLayout == true) {
				var diff = tbLayoutSnap(path,obj,dt);
				dl = diff.dl;
				dt = diff.dt;
				if (obj.tbLayoutTitle !== true) dw = diff.dw;
			}
			repositionObj(obj,dl,dt,dw,dh);
		}
	}
	updateBorder(path);
}
function textSnap(path,obj,dl,dt,dw) {
	var pathNum = draw.path.indexOf(path);

	var left = obj.left+dl;
	var top = obj.top+dt;
	var width = obj.width+dw;
	if (Math.abs(left - draw.gridMargin[0]) < draw.selectTolerance*2) left = draw.gridMargin[0];
	if (Math.abs(top - draw.gridMargin[1]) < draw.selectTolerance*2) top = draw.gridMargin[1];
	if (Math.abs(width - (draw.drawArea[2]-draw.gridMargin[0]-draw.gridMargin[2])) < draw.selectTolerance*2) width = draw.drawArea[2]-draw.gridMargin[0]-draw.gridMargin[2];
	
	for (var p = 0; p < pathNum; p++) {
		var path2 = draw.path[p];
		for (var o = 0; o < path2.obj.length; o++) {
			var obj2 = path2.obj[o];
			if (obj2.tbLayout == true) {
				var top2 = obj2.top+obj2.height+20;
				if (Math.abs(top - top2) < draw.selectTolerance*2) top = top2;
			}
		}
	}
	return {dl:left-obj.left,dt:top-obj.top,dw:width-obj.width};	
}
function tbLayoutSnap(path,obj,dt) {
	var pathNum = draw.path.indexOf(path);
	var left = draw.gridMargin[0];
	var width = obj.width;
	if (obj.tbLayoutTitle !== true) width = draw.drawArea[2]-draw.gridMargin[0]-draw.gridMargin[2];
	if (obj.tbLayoutTitle == true) left = (draw.drawArea[2] - width) / 2;
	var top = obj.top+dt;
	var top2 = tbLayoutGetPrevTop(pathNum);
	if (Math.abs(top - top2) < draw.selectTolerance*2) top = top2;

	return {dl:left-obj.left,dt:top-obj.top,dw:width-obj.width};
}
function tbLayoutGetPrevTop(pathNum) {
	if (un(pathNum)) pathNum = draw.path.length;
	for (var p = pathNum-1; p >=0; p--) {
		for (var o = draw.path[p].obj.length-1; o >= 0; o--) {
			var obj = draw.path[p].obj[o];
			if (obj.tbLayout == true) {
				return draw.path[p].tightBorder[5];
			}
		}
	}
	return draw.gridMargin[1];
}
function repositionObj(obj,dl,dt,dw,dh) {
	if (typeof dl !== 'number') dl = 0;
	if (typeof dt !== 'number') dt = 0;
	if (typeof dw !== 'number') dw = 0;
	if (typeof dh !== 'number') dh = 0;
	if (!un(draw[obj.type]) && !un(draw[obj.type].changePosition)) {
		draw[obj.type].changePosition(obj,dl,dt,dw,dh);
		return;
	}
	switch (obj.type) {
		case 'pen' :
			for (var k = 0; k < obj.pos.length; k++) {
				obj.pos[k][0] += dl;
				obj.pos[k][1] += dt;
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
				var x = draw.mouse[0];
				var y = draw.mouse[1];
				obj.radius = Math.abs(Math.max(x-obj.center[0],y-obj.center[1]));
				draw.anglesAroundPoint.fixToRadius(obj);
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
				var newSize = Math.min(draw.mouse[0]-obj.startPos[0],draw.mouse[1]-obj.startPos[1]);
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
		case 'text2':
			obj.rect[0] += dl;
			obj.rect[1] += dt;
			obj.rect[2] += dw;
			obj.rect[3] += dh;
			break;
		case 'image' :
			obj.left += dl;
			obj.top += dt;
			if (dw !== 0 || dh !== 0) {
				var sf = Math.min((draw.mouse[0]-obj.left)/obj.naturalWidth,(draw.mouse[1]-obj.top)/obj.naturalHeight);
				obj.width = obj.naturalWidth * sf;
				obj.height = obj.naturalHeight * sf;
				obj.scaleFactor = sf;
			}
			break;
		case 'table2' :
			obj.left += dl;
			obj.top += dt;
			if (!un(obj.xPos)) for (var x = 0; x < obj.xPos.length; x++) obj.xPos[x] += dl;
			if (!un(obj.yPos)) for (var y = 0; y < obj.yPos.length; y++) obj.yPos[y] += dt;
			if (dw !== 0) {
				var width = arraySum(obj.widths);
				var sf = (width+dw)/width;
				for (var w = 0; w < obj.widths.length; w++) obj.widths[w] *= sf;
			}
			if (dh !== 0) {
				var height = arraySum(obj.heights)+dh;
				var sf = (height+dh)/height;
				for (var h = 0; h < obj.heights.length; h++) obj.heights[h] *= sf; 
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
					Math.abs(draw.mouse[0]-obj.b[0]),Math.abs(draw.mouse[1]-obj.b[1])
				);
				obj.a = [obj.b[0]+obj.radius*Math.cos(obj.angleA),obj.b[1]+obj.radius*Math.sin(obj.angleA)];
				obj.c = [obj.b[0]+obj.radius*Math.cos(obj.angleC),obj.b[1]+obj.radius*Math.sin(obj.angleC)];
			}				
			break;
		case 'circle' :
		case 'point' :
			obj.center[0] += dl;
			obj.center[1] += dt;
			if (dw !== 0 || dh !== 0) {
				var x = draw.mouse[0];
				var y = draw.mouse[1];
				obj.radius = Math.abs(Math.min(x-obj.center[0],y-obj.center[1]));
			}				
			break;
		case 'ellipse' :
			obj.center[0] += dl;
			obj.center[1] += dt;
			obj.radiusX += dw;
			obj.radiusY += dh;	
			break;
		case 'grid' :
			obj.left += dl;
			obj.top += dt;
			obj.width += dw;
			obj.height += dh;				
			obj.xZero += dl;
			obj.yZero += dt;
			break;
		case 'simpleGrid' :
			obj.left += dl;
			obj.top += dt;
			if (dh !== 0 || dw !== 0) {
				if (Math.abs(dh) < Math.abs(dw)) {
					obj.width += dw;
					obj.height = obj.width * (obj.vSquares / obj.hSquares);
				} else {
					obj.height += dw;
					obj.width = obj.height * (obj.hSquares / obj.vSquares);
				}
			}
			obj.xZero += dl;
			obj.yZero += dt;
			break;
	}
	
}
function repositionAllPaths(paths) {
	if (typeof paths == 'undefined') var paths = draw.path;
	for (var p = 0; p < paths.length; p++) {
		repositionPath(paths[p],0,0,0,0);
	}
}
function movePaths(dl,dt) {
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected) {
			repositionPath(draw.path[p],dl,dt,0,0);
			updateBorder(draw.path[p]);
		}
	}
	drawSelectedPaths();
	drawSelectCanvas();
}
function alignPaths(type) {
	var sel = [];
	var pos = [];
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected == true) {
			sel.push(p);
			pos.push(draw.path[p].tightBorder);
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
				repositionPath(draw.path[sel[p]],x-pos[p][0],0,0,0);
			}
			break;
		case 'center':
			if (pos.length == 1) {
				var x = (draw.drawArea[2]-pos[0][2])/2;
				repositionPath(draw.path[sel[0]],x-pos[0][0],0,0,0);
				break;
			}
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
				repositionPath(draw.path[sel[p]],(x-pos[p][0])-pos[p][2]/2,0,0,0);
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
				repositionPath(draw.path[sel[p]],(x-pos[p][0])-pos[p][2],0,0,0);
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
				repositionPath(draw.path[sel[p]],0,y-pos[p][1],0,0);
			}
			break;
		case 'middle':
			if (pos.length == 1) {
				var y = (draw.drawArea[3]-pos[0][3])/2;
				repositionPath(draw.path[sel[0]],0,y-pos[0][1],0,0);
				break;
			}		
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
				repositionPath(draw.path[sel[p]],0,(y-pos[p][1])-pos[p][3]/2,0,0);
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
				repositionPath(draw.path[sel[p]],0,(y-pos[p][1])-pos[p][3],0,0);
			}
			break;
	}
	drawCanvasPaths();
}
function snapToMargin(type) {
	if (typeof type == 'undefined') type = 'left';
	for (var p = 0; p < draw.path.length; p++) {
		if (draw.path[p].selected == true) {
			var dx = 0;
			var dy = 0;
			var pos = draw.path[p].tightBorder;
			switch (type) {
				case 'left':
					dx = draw.gridMargin[0] - pos[0];
					break;
				case 'top':
					dy = draw.gridMargin[1] - pos[1];
					break;
				case 'right':
					dx = (draw.drawArea[2] - draw.gridMargin[2]) - pos[4];
					break;					
				case 'bottom':
					dy = (draw.drawArea[3] - draw.gridMargin[3]) - pos[5];
					break;
			}
			repositionPath(draw.path[p],dx,dy,0,0);
		}
	}
	drawCanvasPaths();
}
function snapToObj2(pos,pathNum,ignoreTypes) {
	//if (un(ignoreTypes)) ignoreTypes = [];
	var closest = [];
	var close = -1;
	for (var p = 0; p < draw.path.length; p++) {
		if (p == pathNum || draw.path[p] === pathNum) continue;
		for (var o = 0; o < draw.path[p].obj.length; o++) {
			var obj = draw.path[p].obj[o];
			//if (ignoreTypes.indexOf(obj.type) > -1) continue;
			if (!un(draw.snapToObjs) && draw.snapToObjs.includes(obj.type) == false) continue;
			if (!un(draw[obj.type]) && !un(draw[obj.type].getSnapPos)) {
				var snapPos = draw[obj.type].getSnapPos(obj);
				if ((snapPos instanceof Array) === false) continue;
				for (var s = 0; s < snapPos.length; s++) {
					if (snapPos[s].type == 'point') {
						checkPos(snapPos[s].pos);
					} else if (snapPos[s].type == 'line') {
						checkLine(snapPos[s].pos1,snapPos[s].pos2);
					} else if (snapPos[s].type == 'circle') {
						checkCircle(snapPos[s].center,snapPos[s].radius);
					} else if (snapPos[s].type == 'arc') {
						checkArc(snapPos[s].center,snapPos[s].radius,snapPos[s].angle1,snapPos[s].angle2);
					}
				}
				continue;
			}
			switch (obj.type) {
				case 'line':
				case 'curve':
				case 'curve2':
					checkPos(obj.startPos);
					checkPos(obj.finPos);
					break;
				case 'circle':
				case 'point':
					checkPos(obj.center);
					break;
				case 'compassArc':
					if (un(obj._cwFinPos)) obj._cwFinPos = [obj.center[0]+obj.radius*Math.cos(obj.cwFinAngle), obj.center[1]+obj.radius*Math.sin(obj.cwFinAngle)];
					if (un(obj._acwFinPos)) obj._acwFinPos = [obj.center[0]+obj.radius*Math.cos(obj.acwFinAngle), obj.center[1]+obj.radius*Math.sin(obj.acwFinAngle)];
					checkPos(obj._cwFinPos);
					checkPos(obj._acwFinPos);
					checkPos(obj.center);
					break;		
				case 'arc':
					var arcEnds = getEndPointsOfArc(obj);
					for (var k = 0; k < arcEnds.length; k++) {
						checkPos(arcEnds[k]);
					}
					checkPos(obj.center);
					break;				
				case 'pen':
					checkPos(obj.pos[0]);
					checkPos(obj.pos[obj.pos.length-1]);
					break;
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
					if (obj.solidType == 'prism' && !un(obj._prismPoints)) {
						for (var v = 0; v < obj.points.length; v++) {
							checkPos(obj._prismPoints[v]);
						}
					}
					if (obj.anglesMode == 'exterior' && !un(obj.exteriorAngles)) {
						for (var v = 0; v < obj.exteriorAngles.length; v++) {
							if (un(obj.exteriorAngles[v])) continue;
							if (obj.exteriorAngles[v].line1.show == true) {
								checkPos(obj.exteriorAngles[v].line1.pos);
							}
							if (obj.exteriorAngles[v].line2.show == true) {
								checkPos(obj.exteriorAngles[v].line2.pos);
							}
						}
					}
					break;
				case 'angle':
					checkPos(obj.b);
					if (obj.isArc == true || obj.isSector == true || obj.drawLines == true) {
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
				case 'simpleGrid':
					var size = obj.width / obj.hSquares;
					for (var x = 0; x <= obj.hSquares; x++) {
						var xx = obj.left + x * size;
						for (var y = 0; y <= obj.vSquares; y++) {
							var yy = obj.top + obj.height - y * size;
							checkPos([xx,yy]);
						}
					}
					break;
				case 'table2':
					var x = obj.left;
					var y = obj.top;
					checkPos([x,y]);
					for (var w = 0; w < obj.widths.length; w++) {
						x += obj.widths[w];
						checkPos([x,y]);
					}
					for (var h = 0; h < obj.heights.length; h++) {
						x = obj.left;
						y += obj.heights[h];
						checkPos([x,y]);
						for (var w = 0; w < obj.widths.length; w++) {
							x += obj.widths[w];
							checkPos([x,y]);
						}
					}
					break;					
			}
		}
	}
	if (!un(draw.snapPoints) && (!un(draw.snapToObjs) || snapToObj2On === true)) {
		for (var s = 0; s < draw.snapPoints.length; s++) {
			checkPos(draw.snapPoints[s]);
		}
	}
	function checkPos(pos2) {
		var d = dist(pos[0],pos[1],pos2[0],pos2[1]);
		if (d < draw.snapTolerance) {
			if (close == -1 || d < close) {
				close = d;
				closest = pos2;
			}
		}
	}
	if (close !== -1) return clone(closest);
	for (var p = 0; p < draw.path.length; p++) { // if no point found, search for line to snap to
		if (p == pathNum) continue;
		for (var o = 0; o < draw.path[p].obj.length; o++) {
			var obj = draw.path[p].obj[o];
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
					if (obj.solidType == 'prism' && !un(obj._prismPoints)) {
						for (var v = 0; v < obj.points.length; v++) {
							checkLine(obj.points[v],obj._prismPoints[v]);
							var next = v+1;
							if (v == obj.points.length-1) next = 0;
							checkLine(obj._prismPoints[v],obj._prismPoints[next]);
						}
					}
					if (obj.anglesMode == 'exterior' && !un(obj.exteriorAngles)) {
						for (var v = 0; v < obj.exteriorAngles.length; v++) {
							if (un(obj.exteriorAngles[v])) continue;
							if (obj.exteriorAngles[v].line1.show == true) {
								checkLine(obj.points[v],obj.exteriorAngles[v].line1.pos);
							}
							if (obj.exteriorAngles[v].line2.show == true) {
								checkLine(obj.points[v],obj.exteriorAngles[v].line2.pos);
							}
						}
					}					
					break;
				case 'angle':
					if (obj.drawLines == true || obj.isSector == true) {
						checkLine(obj.a,obj.b);
						checkLine(obj.b,obj.c);
					}
					if (obj.isSector == true || obj.isArc == true) {
						checkArc(obj.b,obj.radius,obj.angleA,obj.angleC);
					}
					break;
				case 'anglesAroundPoint':
					for (var v = 0; v < obj.points.length; v++) {
						checkLine(obj.points[v],obj.center);
					}
					break;
				case 'circle':
					checkCircle(obj.center,obj.radius);
					break;
				case 'arc':
					//console.log(obj);
					if (obj.clockwise == true) {
						checkArc(obj.center,obj.radius,obj.startAngle,obj.finAngle);
					} else {
						checkArc(obj.center,obj.radius,obj.finAngle,obj.startAngle);						
					}
					break;	
				case 'compassArc':
					checkArc(obj.center,obj.radius,obj.acwFinAngle,obj.cwFinAngle);
					break;	
			}
		}
	}
	function checkLine(p1,p2) {
		var p3 = closestPointOnLineSegment(pos,p1,p2);
		var d = getDist(p3,pos);
		if (d < draw.snapTolerance) {
			if (close == -1 || d < close) {
				close = d;
				closest = p3;
			}
		}
	}
	function checkCircle(center,radius) {
		var d = getDist(center,pos);
		if (Math.abs(d-radius) > draw.snapTolerance) return;
		if (close == -1 || d < close) {
			close = d;
			var a = getAngleTwoPoints(center,pos);
			closest = [center[0]+radius*Math.cos(a),center[1]+radius*Math.sin(a)];
		}
	}
	function checkArc(center,radius,a1,a2) {
		var d = getDist(center,pos);
		if (Math.abs(d-radius) > draw.snapTolerance) return;
		var a = getAngleTwoPoints(center,pos);
		if (anglesInOrder(a1,a,a2)) {
			if (close == -1 || d < close) {
				close = d;
				closest = [center[0]+radius*Math.cos(a),center[1]+radius*Math.sin(a)];
			}
		}
	}	
	if (close !== -1) return clone(closest);
	return pos;
}
function snapBorders(pathNum,x,y) {
	var tol = draw.snapTolerance * 3;
	var b1 = draw.path[pathNum].tightBorder;
	var closeX = tol+1;
	var closeY = tol+1;
	if (Math.abs(x-draw.gridMargin[0]) < closeX) {
		closeX = -(x-draw.gridMargin[0]);
	} else if (Math.abs(x+b1[2]-(draw.drawArea[0]+draw.drawArea[2]-draw.gridMargin[2])) < closeX) {
		closeX = -(x+b1[2]-(draw.drawArea[0]+draw.drawArea[2]-draw.gridMargin[2]));
	}
	for (var m = 0; m < draw.gridVertMargins.length; m++) {
		if (Math.abs(x-draw.gridVertMargins[m]) < closeX) {
			closeX = -(x-draw.gridVertMargins[m]);
		}
	}
	if (Math.abs(y-draw.gridMargin[1]) < closeY) {
		closeY = -(y-draw.gridMargin[1]);
	} else if (Math.abs(y+b1[3]-(draw.drawArea[1]+draw.drawArea[3]-draw.gridMargin[3])) < closeY) {
		closeY = -(y+b1[3]-(draw.drawArea[1]+draw.drawArea[3]-draw.gridMargin[3]));
	}
	for (var p = 0; p < draw.path.length; p++) {
		if (p == pathNum) continue;
		var b2 = draw.path[p].tightBorder;
		if (Math.abs(x-b2[4]) < closeX) {
			closeX = -(x-b2[4]);
		} else if (Math.abs(x+b1[2]-b2[0]) < closeX) {
			closeX = -(x+b1[2]-b2[0]);		
		} else if (Math.abs(x-b2[0]) < closeX) {
			closeX = -(x-b2[0]);
		} else if (Math.abs(x+b1[2]-b2[4]) < closeX) {
			closeX = -(x+b1[2]-b2[4]);
		}
		if (Math.abs(y-b2[5]) < closeY) {
			closeY = -(y-b2[5]);
		} else if (Math.abs(y+b1[3]-b2[1]) < closeY) {
			closeY = -(y+b1[3]-b2[1]);
		} else if (Math.abs(y-b2[1]) < closeY) {
			closeY = -(y-b2[1]);
		} else if (Math.abs(y+b1[3]-b2[5]) < closeY) {
			closeY = -(y+b1[3]-b2[5]);
		}
	}
	var dx = Math.abs(closeX) < tol ? closeX : 0;
	var dy = Math.abs(closeY) < tol ? closeY : 0;
	return [dx,dy];
}

function gridSnapObjects() {
	if (draw.gridSnap == true/* || shiftOn == true*/) {
		var horiz = draw.horizSnap;
		var vert = draw.vertSnap;
		for (var i = 0; i < draw.path.length; i++) {
			if (draw.path[i].selected == true) {
				var xMin = 1200;
				var xMax = 0;
				var yMin = 700;
				var yMax = 0;
				for (var j = 0; j < draw.path[i].obj.length; j++) {
					xMin = Math.min(xMin,draw.path[i].obj[j].left);
					xMax = Math.max(xMax,draw.path[i].obj[j].left+draw.path[i].obj[j].width);
					yMin = Math.min(yMin,draw.path[i].obj[j].top);
					yMax = Math.max(yMax,draw.path[i].obj[j].top+draw.path[i].obj[j].height);
				}
				var dx,dy;
				if (draw.horizSnap == 'center') {
					dx = roundToNearest(((xMin + xMax) / 2),draw.gridSnapSize) - ((xMin + xMax) / 2);
				} else if (draw.horizSnap == 'right') {
					dx = roundToNearest(xMax,draw.gridSnapSize) - xMax;
				} else {
					dx = roundToNearest(xMin,draw.gridSnapSize) - xMin;										
				}
				if (draw.vertSnap == 'middle') {
					dy = roundToNearest(((yMin + yMax) / 2),draw.gridSnapSize) - ((yMin + yMax) / 2);
				} else if (draw.horizSnap == 'bottom') {
					dy = roundToNearest(yMax,draw.gridSnapSize) - yMax;
				} else {
					dy = roundToNearest(yMin,draw.gridSnapSize) - yMin;										
				}
				repositionPath(draw.path[i],dx,dy,0,0);
			}
		}
	}	
}
function updateSnapPoints() { // handles intersection points line snapping - for constructions tool
	/*if (draw.snap == true) {
		var intPoints = getIntersectionPoints(draw.path);
		var endPoints = getEndPoints(draw.path);
		draw.snapPoints = intPoints.concat(endPoints);
	}*/	
	draw.snapPoints = getIntersectionPoints(draw.path);
	//showSnapPositions();
}
function showSnapPositions() {
	var ctx = draw.drawCanvas.last().ctx;
	var points = draw.snapPoints;
	ctx.fillStyle = '#F00';
	for (var i = 0; i < points.length; i++) {
		ctx.beginPath();
		ctx.arc(points[i][0],points[i][1],draw.snapTolerance,0,2*Math.PI);
		ctx.fill();
	}
}

function distributeHoriz() {
	var tableSelected = false;
	var s = selPaths();
	//console.log(s,s.length == 1,s[0].obj.length == 1,(s[0].obj[0].type == 'table' || s[0].obj[0].type == 'table2'));
	if (s.length == 1 && s[0].obj.length == 1 && s[0].obj[0].type == 'table2' && draw.table2.getSelectedCells(s[0].obj[0]).length === 0) {
		var obj = s[0].obj[0];
		var width = arraySum(obj.widths)/obj.widths.length;
		for (var w = 0; w < obj.widths.length; w++) {
			obj.widths[w] = width;
		}
		updateBorder(s[0]);
		drawCanvasPaths();
		return;
	}
	//if (tableCellsSelectionTest() == true) {
	if (tableCellsSelectionTest() == true || tableSelected == true) {
		for (var i = 0; i < draw.path.length; i++) {
			if (draw.path[i].selected == true) {
				for (var j = 0; j < draw.path[i].obj.length; j++) {
					if (draw.path[i].obj[j].type == 'table' || draw.path[i].obj[j].type == 'table2') {
						var obj = draw.path[i].obj[j];
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
						if (cols.length == 0) {
							for (var c = 0; c < cells[0].length; c++) cols.push(c);
						}
						//console.log(cols);
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
							var table = calcTable2(draw.path[i].obj[j]);
							draw.path[i].obj[j].cell = table.cell;
							draw.path[i].obj[j].xPos = table.xPos;
							draw.path[i].obj[j].yPos = table.yPos;
							draw.path[i].obj[j].width = table.xPos[table.xPos.length-1] - draw.path[i].obj[j].left;
							draw.path[i].obj[j].height = table.yPos[table.yPos.length-1] - draw.path[i].obj[j].top;
						}
					}
				}
				repositionPath(draw.path[i]);
				drawSelectedPaths();
				repositionPath(draw.path[i]);
			}
		}

	} else {
		var sel = [];
		var pos = [];				
		var sel2 = [];
		var pos2 = [];
		for (var p = 0; p < draw.path.length; p++) {
			if (draw.path[p].selected == true) {
				sel2.push(p);
				pos2.push(draw.path[p].tightBorder);
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
			repositionPath(draw.path[sel[p]],(x-pos[p][0]),0,0,0);
			x += pos[p][2] + gap;
		}
		drawCanvasPaths();
	}
}
function distributeVert() {
	var tableSelected = false;
	var s = selPaths();
	if (s.length == 1 && s[0].obj.length == 1 && s[0].obj[0].type == 'table2' && draw.table2.getSelectedCells(s[0].obj[0]).length === 0) {
		var obj = s[0].obj[0];
		var height = arraySum(obj.heights)/obj.heights.length;
		for (var h = 0; h < obj.heights.length; h++) {
			obj.heights[h] = height;
		}
		updateBorder(s[0]);
		drawCanvasPaths();
		return;
	}
	//if (tableCellsSelectionTest() == true) {
	if (tableCellsSelectionTest() == true || tableSelected == true) {
		for (var i = 0; i < draw.path.length; i++) {
			if (draw.path[i].selected == true) {
				for (var j = 0; j < draw.path[i].obj.length; j++) {
					if (draw.path[i].obj[j].type == 'table' || draw.path[i].obj[j].type == 'table2') {
						var obj = draw.path[i].obj[j];
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
						if (rows.length == 0) {
							for (var r = 0; r < cells.length; r++) rows.push(r);
						}
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
							var table = calcTable2(draw.path[i].obj[j]);
							draw.path[i].obj[j].cell = table.cell;
							draw.path[i].obj[j].xPos = table.xPos;
							draw.path[i].obj[j].yPos = table.yPos;
							draw.path[i].obj[j].width = table.xPos[table.xPos.length-1] - draw.path[i].obj[j].left;
							draw.path[i].obj[j].height = table.yPos[table.yPos.length-1] - draw.path[i].obj[j].top;
						}
					}
				}
				repositionPath(draw.path[i]);
				drawSelectedPaths();
				repositionPath(draw.path[i]);				
			}
		}
	
	} else {
		var sel = [];
		var pos = [];				
		var sel2 = [];
		var pos2 = [];
		for (var p = 0; p < draw.path.length; p++) {
			if (draw.path[p].selected == true) {
				sel2.push(p);
				pos2.push(draw.path[p].tightBorder);
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
			repositionPath(draw.path[sel[p]],0,(y-pos[p][1]),0,0);
			y += pos[p][3] + gap;
		}
		drawCanvasPaths();
	}	
}
function centerDistributeText() {
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		if (path.obj.length > 1 || path.obj[0].type !== 'text2') {
			path.selected = false;
			continue;
		}
		var obj = path.obj[0];
		obj.text = removeTagsOfType(obj.text,'align');
		obj.align = [0,0];
		path.selected = true;
		var x = (draw.drawArea[2]-path.tightBorder[2])/2;
		repositionPath(path,x-path.tightBorder[0],0,0,0);
	}
	distributeVert();
	deselectAllPaths();
}

function matchWidth() {
	var paths = selPaths();
	if (paths.length !== 2 || paths[0].obj.length !== 1 || paths[1].obj.length !== 1) {
		console.log('error - check selected paths');
		return;
	}
	paths.sort(function(a,b) {
		if (Math.abs(a.obj[0].left-b.obj[0].left) > Math.abs(a.obj[0].top-b.obj[0].top)) {
			return a.obj[0].left-b.obj[0].left;
		} else {
			return a.obj[0].top-b.obj[0].top;
		}
	});
	for (var p = 1; p < paths.length; p++) {
		var path = paths[p];
		repositionPath(path,0,0,paths[0].tightBorder[2]-path.tightBorder[2],0);
	}
	drawCanvasPaths();
	/*if (paths[0].obj[0].type == 'table2' && paths[1].obj[0].type == 'table2') {
		var t1 = paths[0].obj[0];
		var t2 = paths[1].obj[0];
		if (t1.widths.length == t2.widths.length) {
			t2.widths = clone(t1.widths);
		} else {
			var width1 = arraySum(t1.widths);
			var width2 = arraySum(t2.widths);
			for (var w = 0; w < t2.widths.length; w++) {
				t2.widths[w] = t2.widths[w] * width1 / width2;
			}
		}
		updateBorder(paths[1]);
		drawCanvasPaths();
		return;
	}
	var width = getObjWidth(paths[0].obj[0]);
	if (width > 0) {
		setObjWidth(paths[1].obj[0],width);
		updateBorder(paths[1]);
		drawCanvasPaths();
		return;
	}
	console.log('error - check selected paths');*/
}
function matchHeight() {
	var paths = selPaths();
	if (paths.length !== 2 || paths[0].obj.length !== 1 || paths[1].obj.length !== 1) {
		console.log('error - check selected paths');
		return;
	}
	paths.sort(function(a,b) {
		if (Math.abs(a.obj[0].left-b.obj[0].left) > Math.abs(a.obj[0].top-b.obj[0].top)) {
			return a.obj[0].left-b.obj[0].left;
		} else {
			return a.obj[0].top-b.obj[0].top;
		}
	});	
	for (var p = 1; p < paths.length; p++) {
		var path = paths[p];
		repositionPath(path,0,0,0,paths[0].tightBorder[3]-path.tightBorder[3]);
	}
	drawCanvasPaths();
	/*return;
	if (paths[0].obj[0].type == 'table2' && paths[1].obj[0].type == 'table2') {
		var t1 = paths[0].obj[0];
		var t2 = paths[1].obj[0];
		if (t1.heights.length == t2.heights.length) {
			t2.heights = clone(t1.heights);
		} else {
			var height1 = arraySum(t1.heights);
			var height2 = arraySum(t2.heights);
			for (var h = 0; h < t2.heights.length; h++) {
				t2.heights[h] = t2.heights[h] * height1 / height2
			}
		}
		updateBorder(paths[1]);
		drawCanvasPaths();
		return;
	}
	var height = getObjHeight(paths[0].obj[0]);
	if (height > 0) {
		setObjHeight(paths[1].obj[0],height);
		updateBorder(paths[1]);
		drawCanvasPaths();
		return;
	}	
	console.log('error - check selected paths');*/
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

function getObjWidth(obj) {
	if (!un(draw[obj.type]) && typeof draw[obj.type].getWidth == 'function') return draw[obj.type].getWidth();
	switch (obj.type) {
		case 'table2':
			return arraySum(obj.widths);
		case 'text2':
			return obj.rect[2];
		case 'circle':
			return obj.radius*2;
		case 'ellipse':
			return obj.radiusX*2;
		default:
			if (typeof obj.width == 'number') return obj.width;
			return 0;
	}
}
function setObjWidth(obj,width) {
	if (!un(draw[obj.type]) && typeof draw[obj.type].setWidth == 'function') {
		draw[obj.type].setWidth(width);
	}
	switch (obj.type) {
		case 'table2':
			var oldWidth = arraySum(obj.widths);
			for (var w = 0; w < obj.widths.length; w++) {
				obj.widths[w] = obj.widths[w] * width / oldWidth;
			}
			break;
		case 'text2':
			obj.rect[2] = width;
			break;
		case 'circle':
			obj.radius = width/2;
			break;
		case 'ellipse':
			obj.radiusX = width/2;
			break;
		default:
			if (!un(obj.width)) obj.width = width;
			break;
	}	
}
function getObjHeight(obj) {
	if (!un(draw[obj.type]) && typeof draw[obj.type].getHeight == 'function') return draw[obj.type].getHeight();
	switch (obj.type) {
		case 'table2':
			return arraySum(obj.heights);
		case 'text2':
			return obj.rect[3];
		case 'circle':
			return obj.radius*2;
		case 'ellipse':
			return obj.radiusY*2;
		default:
			if (typeof obj.height == 'number') return obj.height;
			return 0;
	}
}
function setObjHeight(obj,height) {
	if (!un(draw[obj.type]) && typeof draw[obj.type].setHeight == 'function') {
		draw[obj.type].setHeight(height);
	}
	switch (obj.type) {
		case 'table2':
			var oldHeight = arraySum(obj.heights);
			for (var h = 0; h < obj.heights.length; h++) {
				obj.heights[h] = obj.heights[h] * height / oldHeight;
			}
			break;
		case 'text2':
			obj.rect[3] = height;
			break;
		case 'circle':
			obj.radius = height/2;
			break;
		case 'ellipse':
			obj.radiusY = height/2;
			break;
		default:
			if (!un(obj.height)) obj.height = height;
			break;
	}	
}

draw.pathsMatchSize = function(paths) {
	if (un(paths)) paths = selPaths();
	if (paths.length < 2) return;
	var firstPath = paths[0];
	for (var p = 1; p < paths.length; p++) {
		path = paths[p];
		if (path.tightBorder[0] - firstPath.tightBorder[0] < -40 || path.tightBorder[1] - firstPath.tightBorder[1] < -40 ) {
			firstPath = path;
		}
	}
	for (var p = 0; p < paths.length; p++) {
		path = paths[p];
		if (path === firstPath) continue;
		repositionPath(path,0,0,firstPath.tightBorder[2]-path.tightBorder[2],firstPath.tightBorder[3]-path.tightBorder[3]);
	}
	drawCanvasPaths();
}
draw.pathsArrangeToGrid = function(paths) {
	if (un(paths)) paths = selPaths();	
	if (paths.length < 2) return;
	var left,right,top,bottom;
	for (var p = 0; p < paths.length; p++) {
		path = paths[p];
		path.__rect = {left:path.tightBorder[0],top:path.tightBorder[1],width:path.tightBorder[2],height:path.tightBorder[3],right:path.tightBorder[0]+path.tightBorder[2],bottom:path.tightBorder[1]+path.tightBorder[3],center:path.tightBorder[0]+0.5*path.tightBorder[2],middle:path.tightBorder[1]+0.5*path.tightBorder[3]};
		left = un(left) ? path.__rect.center : Math.min(left,path.__rect.center);
		right = un(right) ? path.__rect.center : Math.max(right,path.__rect.center);
		top = un(top) ? path.__rect.middle : Math.min(top,path.__rect.middle);
		bottom = un(bottom) ? path.__rect.middle : Math.max(bottom,path.__rect.middle);
	}
	paths.sort(function(a,b) {
		if (Math.abs(a.__rect.middle-b.__rect.middle) > 40) return a.__rect.middle-b.__rect.middle;
		if (Math.abs(a.__rect.center-b.__rect.center) > 40) return a.__rect.center-b.__rect.center;
	});
	var cols = 0;
	var rows = 0;
	paths[0].__rect.col = 0;
	paths[0].__rect.row = 0;
	for (var p = 1; p < paths.length; p++) {
		path0 = paths[p-1];
		path1 = paths[p];
		if (Math.abs(path0.__rect.middle-path1.__rect.middle) <= 40) {
			path1.__rect.row = path0.__rect.row;
			path1.__rect.col = path0.__rect.col+1;
		} else {
			path1.__rect.row = path0.__rect.row+1;
			path1.__rect.col = 0;
		}
		cols = Math.max(cols,path1.__rect.col+1);
		rows = Math.max(rows,path1.__rect.row+1);
	}
	var xPos = [];
	var yPos = [];
	for (var i = 0; i < cols; i++) xPos.push(left+i*(right-left)/(Math.max(1,cols-1)));
	for (var i = 0; i < rows; i++) yPos.push(top+i*(bottom-top)/Math.max(1,(rows-1)));
	for (var p = 0; p < paths.length; p++) {
		path = paths[p];
		var x = xPos[path.__rect.col]-path.tightBorder[2]/2;
		var y = yPos[path.__rect.row]-path.tightBorder[3]/2;
		positionPath(path,x,y);
	}
	drawCanvasPaths();
}
draw.textToTable = function(paths) {
	if (un(paths)) paths = selPaths();	
	if (paths.length === 1) {
		paths = draw.textExplode(paths[0].obj[0]);
		if (paths.length === 1) return;
	}
	
	var left,right,top,bottom,left2,top2;
	for (var p = 0; p < paths.length; p++) {
		path = paths[p];
		path.__rect = {left:path.tightBorder[0],top:path.tightBorder[1],width:path.tightBorder[2],height:path.tightBorder[3],right:path.tightBorder[0]+path.tightBorder[2],bottom:path.tightBorder[1]+path.tightBorder[3],center:path.tightBorder[0]+0.5*path.tightBorder[2],middle:path.tightBorder[1]+0.5*path.tightBorder[3]};
		left = un(left) ? path.__rect.center : Math.min(left,path.__rect.center);
		left2 = un(left2) ? path.__rect.left : Math.min(left2,path.__rect.left);
		right = un(right) ? path.__rect.center : Math.max(right,path.__rect.center);
		top = un(top) ? path.__rect.middle : Math.min(top,path.__rect.middle);
		top2 = un(top2) ? path.__rect.top : Math.min(top2,path.__rect.top);
		bottom = un(bottom) ? path.__rect.middle : Math.max(bottom,path.__rect.middle);
	}
	paths.sort(function(a,b) {
		if (Math.abs(a.__rect.middle-b.__rect.middle) > 40) return a.__rect.middle-b.__rect.middle;
		if (Math.abs(a.__rect.center-b.__rect.center) > 40) return a.__rect.center-b.__rect.center;
	});
	var cols = 0;
	var rows = 0;
	paths[0].__rect.col = 0;
	paths[0].__rect.row = 0;
	for (var p = 1; p < paths.length; p++) {
		path0 = paths[p-1];
		path1 = paths[p];
		if (Math.abs(path0.__rect.middle-path1.__rect.middle) <= 40) {
			path1.__rect.row = path0.__rect.row;
			path1.__rect.col = path0.__rect.col+1;
		} else {
			path1.__rect.row = path0.__rect.row+1;
			path1.__rect.col = 0;
		}
		cols = Math.max(cols,path1.__rect.col+1);
		rows = Math.max(rows,path1.__rect.row+1);
	}
	
	var width = (right-left)/Math.max(1,cols-1);
	var height = (bottom-top)/Math.max(1,rows-1);
	var widths = [];
	var heights = [];
	var cells = [];
	for (var i = 0; i < rows; i++) {
		heights.push(height);
		cells.push([]);
	}
	for (var i = 0; i < cols; i++) {
		widths.push(width);
		for (var r = 0; r < rows.length; r++) {
			cells[r].push({
				text: [""]
			});
		}
	}
	for (var p = 0; p < paths.length; p++) {
		path = paths[p];
		var obj = path.obj[0];
		delete obj.type;
		delete obj.rect;
		delete obj._path;
		delete obj.color;
		cells[path.__rect.row][path.__rect.col] = obj;
	}
	
	var obj = {
		type: 'table2',
		left: left2,
		top: top2,
		widths: widths,
		heights: heights,
		text: {
			font: 'Arial',
			size: 28,
			color: '#000'
		},
		outerBorder: {
			show: false,
			width: 4,
			color: '#000',
			dash: [0, 0]
		},
		innerBorder: {
			show: false,
			width: 2,
			color: '#666',
			dash: [0, 0]
		},
		cells: cells,
	}
	var path = {obj:[obj],selected:true};
	
	for (var p = 0; p < paths.length; p++) {
		var index = draw.path.indexOf(paths[p]);
		if (index > -1) draw.path.splice(index,1);
	}
	
	draw.path.push(path);
	updateBorder(path);
	console.log(obj);
	
	
	drawCanvasPaths();
	
}
draw.minimiseTextBoxSizeAll = function(obj) {
	var paths = [];
	for (var p = 0; p < draw.path.length; p++) {
		var path = draw.path[p];
		if (path.obj.length === 1 && path.obj[0].type === 'text2') {
			var obj = path.obj[0];
			if (!un(obj.box) && obj.box.type !== 'none') continue;
			if (!un(obj.align) && (obj.align[0] !== -1 || obj.align[1] !== -1)) continue;
			while (typeof obj.text.last() === 'string' && obj.text.last().length > 0 && [tab,br,' '].indexOf(obj.text.last().slice(-1)) > -1) {
				obj.text[obj.text.length-1] = obj.text.last().slice(0,-1);
			}
			paths.push(path);
		}
	}
	drawCanvasPaths();
	for (var p = 0; p < paths.length; p++) {
		var path = paths[p];
		updateBorder(path);
		obj.rect[3] = path.tightBorder[3];
	}
	draw.updateAllBorders();
	drawCanvasPaths();
}
draw.textExplodeAll = function() {
	var pathLength = draw.path.length;
	for (var p = pathLength-1; p >= 0; p--) {
		var path = draw.path[p];
		if (path.obj.length === 1 && path.obj[0].type === 'text2') {
			draw.textExplode(path.obj[0]);
		}
	}
}
draw.textExplode = function(obj) { // split text by tab+tab+tab and by br+br
	if (un(obj)) obj = sel();
		
	obj.ctx = draw.hiddenCanvas.ctx;
	var measure = text(obj);
	measure.map = mapArray(measure.textLoc,true);
	delete obj.ctx;
	
	var sections = [[]];
	for (var m = 0; m < measure.map.length; m++) {
		var map = measure.map[m];
		if (map.length > 2 || m === measure.map.length-1) continue;
		var textLoc = getTextLoc(measure.textLoc,map);
		if (textLoc.char === tab) {
			var m2 = m+1;
			var isTab = true;
			do {
				map2 = measure.map[m2];
				textLoc2 = getTextLoc(measure.textLoc,map2);
				if (textLoc2.char !== tab) {
					isTab = false;
				} else {
					m2++;
				}
			} while (isTab === true && map2.length === 2 && m2 < measure.map.length-1);
			if (m2-m > 2) {
				m = m2-1;
				sections.push([]);
			} else {
				sections.last().push(map);
			}
		} else if (textLoc.char === br) {
			var m2 = m+1;
			var isBr = true;
			do {
				map2 = measure.map[m2];
				textLoc2 = getTextLoc(measure.textLoc,map2);
				if (textLoc2.char !== br) {
					isBr = false;
				} else {
					m2++;
				}
			} while (isBr === true && map2.length === 2 && m2 < measure.map.length-1);
			if (m2-m > 1) {
				m = m2-1;
				sections.push([]);
			} else {
				sections.last().push(map);
			}
		} else {
			sections.last().push(map);
		}
	}
	
	if (sections.length < 2) return [obj._path];

	draw.path.splice(draw.path.indexOf(obj._path),1);
	
	var paths = [];
	for (var s = 0; s < sections.length; s++) {
		var map = sections[s];
		if (map.length === 0) continue;
		var left2 = -1, top2 = -1, right2 = -1, bottom2 = -1;
		for (var c = 0; c < map.length; c++) {
			var loc = getTextLoc(measure.textLoc,map[c]);
			if (left2 === -1) {
				left2 = loc.left;
				top2 = loc.top;
				right2 = loc.left+loc.width;
				bottom2 = loc.top+loc.height;
			} else {
				left2 = Math.min(left2,loc.left);
				top2 = Math.min(top2,loc.top);
				right2 = Math.max(right2,loc.left+loc.width);
				bottom2 = Math.max(bottom2,loc.top+loc.height);
			}
		}
		var text2 = extractTextBetweenPos(obj.text,map[0],map.last());
		var obj2 = clone(obj);
		obj2.text = text2;
		obj2.rect = [left2,top2,right2-left2,bottom2-top2];
		obj2.align = [-1,-1];
		paths.push({obj:[obj2],selected:true});
		draw.path.push(paths.last());
	}
	
	drawCanvasPaths();
	return paths;
	
	function getTextLoc(textLoc,map) {
		var loc = textLoc;
		for (var m = 0; m < map.length; m++) loc = loc[map[m]];
		return loc;
	}
	function extractTextBetweenPos(textArray,pos1,pos2) {
		if (pos1[0] === pos1[0]) return [textArray[pos1[0]].slice(pos1[1],pos2[1]+1)];
		var extract = [];
		extract.push(textArray[pos1[0]].slice(pos1[1]));
		for (var i = pos1[0]+1; i < pos2[0]; i++) extract.push(textArray[i]);
		extract.push(textArray[pos2[0]].slice(0,pos2[1]+1));
		return clone(extract);
	}
}

draw.setObjFillStyle = function(obj,color) {
	if (obj == false || un(obj.type)) return;
	if (!un(draw[obj.type]) && !un(draw[obj.type].setFillColor)) {
		draw[obj.type].setFillColor(obj,color);
		return;
	}
	
	if (!un(obj.fillColor)) {
		obj.fillColor = color;
	} else if (!un(obj.fillStyle)) {
		obj.fillStyle = color;
	}
	
	if (['table2'].indexOf(obj.type) > -1) {
		var selCount = draw.table2.countSelectedCells(obj);
		var cells = selCount == 0 ? draw.table2.getAllCells(obj) : draw.table2.getSelectedCells(obj);
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			if (!un(cell.box)) {
				cell.box.color = color;
			} else {
				if (color !== 'none') {
					cell.box = {
						color:color,
						lineColor:'none',
						borderWidth:3,
						borderRadius:0,
						show:true
					}
				}
			}
		}
	}
}
draw.setObjStrokeStyle = function(obj,color) {
	if (obj == false || un(obj.type)) return;
	if (!un(draw[obj.type]) && !un(draw[obj.type].setLineColor)) {
		draw[obj.type].setLineColor(obj,color);
		return;
	}
	if (!un(obj.color)) {
		obj.color = color;
	} else if (!un(obj.lineColor)) {
		obj.lineColor = color;
	} else if (!un(obj.strokeStyle)) {
		obj.strokeStyle = color;
	}

	if (['table2'].indexOf(obj.type) > -1) {
		var selCount = draw.table2.countSelectedCells(obj);
		var cells = selCount == 0 ? draw.table2.getAllCells(obj) : draw.table2.getSelectedCells(obj);
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			if (!un(cell.box)) {
				cell.box.borderColor = color;
			} else {
				if (color !== 'none') {
					cell.box = {
						color:'none',
						borderColor:color,
						borderWidth:3,
						borderRadius:0,
						show:true
					}
				}
			}
		}
	}
}
draw.controlPanel = {
	data:{elements:[]},
	cursorPositions:[],
	clear: function() {
		draw.controlPanel.data = {elements:[]};
		draw.controlPanel.cursorPositions = [];
	},
	draw: function(ctx,obj,path,controlPanelData,pos) {
		if (draw.mode === 'interact') return;
		draw.controlPanel.path = path;
		draw.controlPanel.obj = obj;
		draw.controlPanel.clear();
		if (!un(controlPanelData)) {
			draw.controlPanel.data = controlPanelData;
		} else {
			if (un(draw[obj.type]) || un(draw[obj.type].getControlPanel)) return;
			draw.controlPanel.data = draw[obj.type].getControlPanel(obj);
		}
		var cursorPos = [];
		var elements = draw.controlPanel.data.elements;
		var width = draw.controlPanel.data.width || 200;
		if (un(pos)) {
			if (draw.drawArea[0]+draw.drawArea[2]-path.border[4] >= width) {
				var pos = [path.border[4],path.border[1],width];
			} else {
				var pos = [path.border[0]-width,path.border[1],width];
			}
		}
		var top = pos[1]+10;
		for (var e = 0; e < elements.length; e++) {
			var element = elements[e];
			var bold = boolean(element.bold,true);
			var fontSize = element.fontSize || 20;
			var margin = element.margin*pos[2] || 0;
			text({ctx:ctx,rect:[pos[0]+10+margin,top,pos[2]-20,40],align:[-1,-1],text:['<<fontSize:'+fontSize+'>><<bold:'+bold+'>>'+element.name]});
			switch (element.type) {
				case 'style':
					var w = 0.4*pos[2]/3;
					var space = 0.6*pos[2]/4;
					var l = pos[0]+space;
					var t = top+50;
					
					var strokeStyle = draw[obj.type].getLineColor(obj);
					text({ctx:ctx,align:[0,-1],rect:[l,top+25,w,w],text:['<<fontSize:18>>line']})
					ctx.beginPath();
					cursorPos.push({shape:'rect',dims:[l,t,w,w],cursor:draw.cursors.pointer,element:element,type:'openLineColor',obj:obj,func:draw.controlPanel.start});
					if (strokeStyle == 'none') {
						ctx.strokeStyle = '#000';
						ctx.lineWidth = 2;
						ctx.strokeRect(l,t,w,w);
						ctx.moveTo(l,t);
						ctx.lineTo(l+w,t+w);
						ctx.moveTo(l+w,t);
						ctx.lineTo(l,t+w);
						ctx.stroke();
					} else {
						ctx.fillStyle = strokeStyle;
						ctx.fillRect(l,t,w,w);
						ctx.strokeStyle = '#000';
						ctx.lineWidth = 2;
						ctx.strokeRect(l,t,w,w);
					}
					
					l += space+w;
					var fillStyle = draw[obj.type].getLineWidth(obj);
					text({ctx:ctx,align:[0,-1],rect:[l,top+25,w,w],text:['<<fontSize:18>>width']})
					var minusRect = [l-0.3*w,t+0.1*w,0.8*w,0.8*w];
					var plusRect = [l-0.3*w+0.8*w,t+0.1*w,0.8*w,0.8*w];
					drawPlusButton(ctx,plusRect);
					drawMinusButton(ctx,minusRect);
					cursorPos.push({shape:'rect',dims:plusRect,cursor:draw.cursors.pointer,element:element,type:'lineWidthPlus',obj:obj,func:draw.controlPanel.start});
					cursorPos.push({shape:'rect',dims:minusRect,cursor:draw.cursors.pointer,element:element,type:'lineWidthMinus',obj:obj,func:draw.controlPanel.start});
					
					
					l += space+w;
					var fillStyle = draw[obj.type].getFillColor(obj);
					text({ctx:ctx,align:[0,-1],rect:[l,top+25,w,w],text:['<<fontSize:18>>fill']})
					cursorPos.push({shape:'rect',dims:[l,t,w,w],cursor:draw.cursors.pointer,element:element,type:'openFillColor',obj:obj,func:draw.controlPanel.start});
					ctx.beginPath();
					if (fillStyle == 'none') {
						ctx.strokeStyle = '#000';
						ctx.lineWidth = 2;
						ctx.strokeRect(l,t,w,w);
						ctx.moveTo(l,t);
						ctx.lineTo(l+w,t+w);
						ctx.moveTo(l+w,t);
						ctx.lineTo(l,t+w);
						ctx.stroke();
					} else {
						ctx.fillStyle = fillStyle;
						ctx.fillRect(l,t,w,w);
						ctx.strokeStyle = '#000';
						ctx.lineWidth = 2;
						ctx.strokeRect(l,t,w,w);
					}
					
					top += 90;
					break;
				case 'toggle':
					var rect = [pos[0]+pos[2]*0.1,top+2,16,16];
					ctx.lineWidth = 2;
					ctx.strokeStyle = '#000';
					ctx.fillStyle = '#FFF';
					ctx.fillRect(rect[0],rect[1],rect[2],rect[3]);
					ctx.strokeRect(rect[0],rect[1],rect[2],rect[3]);
					if (element.get(obj)) drawTick(ctx,16,20,'#060',pos[0]+pos[2]*0.1,top,3);
					cursorPos.push({shape:'rect',dims:[pos[0]+pos[2]*0.1,top,0.8*pos[2],20],cursor:draw.cursors.pointer,element:element,set:element.set,type:'toggle',obj:obj,func:draw.controlPanel.start});
					top += 30;
					break;
				case 'increment':
					var minusRect = [pos[0]+pos[2]*0.7,top+2,22,22];
					var plusRect = [pos[0]+pos[2]*0.7+22,top+2,22,22];
					drawPlusButton(ctx,plusRect);
					drawMinusButton(ctx,minusRect);
					cursorPos.push({shape:'rect',dims:plusRect,cursor:draw.cursors.pointer,element:element,type:'increment',value:1,increment:element.increment,obj:obj,func:draw.controlPanel.start});
					cursorPos.push({shape:'rect',dims:minusRect,cursor:draw.cursors.pointer,element:element,type:'increment',value:-1,increment:element.increment,obj:obj,func:draw.controlPanel.start});
					top += 40;
					break;
				case 'slider':
					var sliderLeft = pos[0]+0.55*pos[2];
					var sliderWidth = 0.3*pos[2];
					ctx.lineWidth = 2;
					ctx.strokeStyle = '#000';
					ctx.beginPath();
					ctx.moveTo(sliderLeft,top+15);
					ctx.lineTo(sliderLeft+sliderWidth,top+15);
					ctx.stroke();
					if (typeof element.value == 'string') {
						var value = obj[element.value];
					} else if (typeof element.value == 'function') {
						var value = element.value(obj);
					} else if (!un(element.get)) {
						var value = element.get(obj);
					}
					var xPos = sliderLeft + sliderWidth*(value-element.min)/(element.max-element.min);
					ctx.fillStyle = '#00F';
					ctx.beginPath();
					ctx.arc(xPos,top+15,8,0,2*Math.PI);
					ctx.fill();
					cursorPos.push({shape:'circle',dims:[xPos,top+15,8],cursor:draw.cursors.pointer,element:element,type:'slider',obj:obj,func:draw.controlPanel.start,sliderLeft:sliderLeft,sliderWidth:sliderWidth});
					top += 30;
					break;
				case 'multiSelect':
					var cells = [], rows = 0, cols = 0, heights = [], widths = [];
					var selected = element.get(obj);
					for (var r = 0; r < element.options.length; r++) {
						cells[r] = [];
						rows++;
						heights.push(30);
						for (var c = 0; c < element.options[r].length; c++) {
							var txt = !un(element.options[r][c]) ? element.options[r][c] : '';
							cells[r][c] = {};
							if (text !== '' && selected.toLowerCase() == txt.toLowerCase()) {
								cells[r][c].color = '#3FF';
							}
							cells[r][c].text = ['<<fontSize:18>>'+txt];
							cols = Math.max(cols,c);
						}
					}
					for (var c = 0; c < cols+1; c++) widths.push(0.8*pos[2]/(cols+1));
					var table = drawTable3({ctx:ctx,left:pos[0]+pos[2]*0.1,top:top+30,widths:widths,heights:heights,cells:cells,outerBorder:{width:2,color:'#000',dash:[]},innerBorder:{width:1,color:'#000',dash:[]}});
					
					for (var r = 0; r < table.cell.length; r++) {
						for (var c = 0; c < table.cell[r].length; c++) {
							var cell = table.cell[r][c];
							cursorPos.push({shape:'rect',dims:[cell.left,cell.top,cell.width,cell.height],cursor:draw.cursors.pointer,element:element,set:element.set,type:'multiSelect',value:element.options[r][c],obj:obj,func:draw.controlPanel.start});
						}
					}
					
					top += (rows+1)*30+10;
					break;
			}
		}
		if (!un(draw.controlPanel.colorMenu)) {
			var type = draw.controlPanel.colorMenu.type;
			var pos2 = draw.controlPanel.colorMenu.pos;
			var width = 30, padding = 10, rows = 6, cols = 4;
			if (draw.drawArea[0]+draw.drawArea[2]-pos2[0] < width*cols+2*padding) {
				pos2[0] = draw.drawArea[0]+draw.drawArea[2]-(width*cols+2*padding);
			}
			roundedRect(ctx,pos2[0],pos2[1],width*cols+2*padding,width*rows+2*padding,5,2,'#000','#FFF');
			cursorPos.push({shape:'rect',dims:[pos2[0],pos2[1],width*cols+2*padding,width*rows+2*padding],cursor:draw.cursors.default});
			var colors = [
				['none','#F00','#F99','#FCC'],
				['#000','#090','#9F9','#CFC'],
				['#666','#00F','#99F','#CCF'],
				['#999','#FF0','#FF9','#FFC'],
				['#CCC','#F0F','#F9F','#FCF'],
				['#FFF','#0FF','#9FF','#CFF'],
			]
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			for (var r = 0; r < colors.length; r++) {
				var t = pos2[1]+padding+r*width;
				for (var c = 0; c < colors[r].length; c++) {
					var l = pos2[0]+padding+c*width;
					if (colors[r][c] == 'none') {
						ctx.beginPath();
						ctx.moveTo(l,t);
						ctx.lineTo(l+width,t+width);
						ctx.moveTo(l+width,t);
						ctx.lineTo(l,t+width);
						ctx.stroke();
					} else {
						ctx.fillStyle = colors[r][c];
						ctx.fillRect(l,t,width,width);
					}
					ctx.strokeRect(l,t,width,width);
					cursorPos.push({shape:'rect',dims:[l,t,width,width],cursor:draw.cursors.pointer,element:element,type:type,color:colors[r][c],obj:obj,func:draw.controlPanel.start});
				}
			}
			
		}
		ctx.globalCompositeOperation = 'destination-over';
		roundedRect(ctx,pos[0],pos[1],pos[2],top+10-pos[1],0,3,'#000','#FFC');
		ctx.globalCompositeOperation = 'source-over';
		cursorPos.unshift({shape:'rect',dims:[pos[0],pos[1],pos[2],top+10-pos[1]],cursor:draw.cursors.default});
		draw.controlPanel.cursorPositions = cursorPos;
		function drawPlusButton(ctx,rect,fillStyle) {
			if (un(fillStyle)) fillStyle = '#CCC';
			ctx.fillStyle = fillStyle;
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.fillRect(rect[0],rect[1],rect[2],rect[3]);
			ctx.strokeRect(rect[0],rect[1],rect[2],rect[3]);
			ctx.beginPath();
			ctx.moveTo(rect[0]+0.25*rect[2],rect[1]+0.5*rect[3]);
			ctx.lineTo(rect[0]+0.75*rect[2],rect[1]+0.5*rect[3]);
			ctx.moveTo(rect[0]+0.5*rect[2],rect[1]+0.25*rect[3]);
			ctx.lineTo(rect[0]+0.5*rect[2],rect[1]+0.75*rect[3]);
			ctx.stroke();
		}
		function drawMinusButton(ctx,rect,fillStyle) {
			if (un(fillStyle)) fillStyle = '#CCC';
			ctx.fillStyle = fillStyle;
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.fillRect(rect[0],rect[1],rect[2],rect[3]);
			ctx.strokeRect(rect[0],rect[1],rect[2],rect[3]);
			ctx.beginPath();
			ctx.moveTo(rect[0]+0.25*rect[2],rect[1]+0.5*rect[3]);
			ctx.lineTo(rect[0]+0.75*rect[2],rect[1]+0.5*rect[3]);
			ctx.stroke();
		}
	},
	start: function() {
		var obj = draw.controlPanel.obj;
		var element = draw.currCursor.element;
		var type = draw.currCursor.type;
		if (type == 'slider') {
			draw.drag = {prev:[draw.mouse[0],draw.mouse[1]],element:element,obj:obj,sliderLeft:draw.currCursor.sliderLeft,sliderWidth:draw.currCursor.sliderWidth};
			draw.animate(draw.controlPanel.move,draw.controlPanel.stop,drawCanvasPaths);			
			//addListenerMove(window,draw.controlPanel.move);
			//addListenerEnd(window,draw.controlPanel.stop);
			draw.drawCanvas[draw.drawCanvas.length-2].style.cursor = draw.currCursor.cursor;
		} else if (type == 'multiSelect') {
			draw.currCursor.set(obj,draw.currCursor.value);
			drawSelectedPaths();
		} else if (type == 'openLineColor') {
			if (!un(draw.controlPanel.colorMenu) && draw.controlPanel.colorMenu.type == 'lineColor') {
				delete draw.controlPanel.colorMenu;
			} else {
				var dims = draw.currCursor.dims;
				draw.controlPanel.colorMenu = {type:'lineColor',pos:[dims[0],dims[1]+dims[3]]};
			}
		} else if (type == 'openFillColor') {
			if (!un(draw.controlPanel.colorMenu) && draw.controlPanel.colorMenu.type == 'fillColor') {
				delete draw.controlPanel.colorMenu;
			} else {
				var dims = draw.currCursor.dims;
				draw.controlPanel.colorMenu = {type:'fillColor',pos:[dims[0],dims[1]+dims[3]]};
			}
		} else if (type == 'lineColor') {
			draw[obj.type].setLineColor(obj,draw.currCursor.color);
			delete draw.controlPanel.colorMenu;
		} else if (type == 'fillColor') {
			draw[obj.type].setFillColor(obj,draw.currCursor.color);
			delete draw.controlPanel.colorMenu;
		} else if (type == 'lineWidthPlus') {
			var width = draw[obj.type].getLineWidth(obj);
			draw[obj.type].setLineWidth(obj,Math.min(8,width+1));
		} else if (type == 'lineWidthMinus') {
			var width = draw[obj.type].getLineWidth(obj);
			draw[obj.type].setLineWidth(obj,Math.max(1,width-1));
		} else if (type == 'toggle') {
			draw.currCursor.set(obj);
		} else if (type == 'increment') {
			draw.currCursor.increment(obj,draw.currCursor.value);
		}
		if (['openLineColor','openFillColor'].includes(type) == false) {
			delete draw.controlPanel.colorMenu;
		}
		drawCanvasPaths();
		drawSelectCanvas();
		calcCursorPositions();		
	},
	move: function(e) {
		updateMouse(e);
		var obj = draw.drag.obj;
		var element = draw.drag.element;
		if (element.type == 'slider') {
			var value = bound(element.min+(element.max-element.min)*(draw.mouse[0]-draw.drag.sliderLeft)/draw.drag.sliderWidth,element.min,element.max,element.step);
			if (!un(element.set)) {
				element.set(obj,value);
			} else {
				obj[element.value] = value;
			}
		}
		//drawCanvasPaths();
	},
	stop: function(e) {
		delete draw.drag;
		//removeListenerMove(window,draw.controlPanel.move);
		//removeListenerEnd(window,draw.controlPanel.stop);
	}
};
function angleStyleIncrement(angle) {
	if (un(angle.style)) angle.style = 0;
	angle.style = (angle.style+1) % 7;
	angle.show = true;
	if (un(angle.radius)) angle.radius = 30;
	if (un(angle.labelMeasure)) angle.labelMeasure = true;
	if (un(angle.labelFontSize)) angle.labelFontSize = 25;
	if (un(angle.labelRadius)) angle.labelRadius = 33;
	if (un(angle.measureLabelOnly)) angle.measureLabelOnly = true;
	switch (angle.style) {
		case 0:
			angle.drawCurve = false;
			angle.numOfCurves = 1;
			angle.fill = false;
			break;
		case 1:
			angle.drawCurve = true;
			angle.numOfCurves = 1;
			angle.fill = false;
			break;
		case 2:
			angle.drawCurve = true;
			angle.numOfCurves = 2;
			angle.fill = false;
			break;
		case 3:
			angle.drawCurve = true;
			angle.numOfCurves = 3;
			angle.fill = false;
			break;				
		case 4:
			angle.drawCurve = true;
			angle.numOfCurves = 1;
			angle.fill = true;
			angle.fillColor = '#CFC';
			break;
		case 5:
			angle.drawCurve = true;
			angle.numOfCurves = 1;
			angle.fill = true;
			angle.fillColor = '#FCF';		
			break;
		case 6:
			angle.drawCurve = true;
			angle.numOfCurves = 1;
			angle.fill = true;
			angle.fillColor = '#CCF';		
			break;
	}	
	return angle;
}

/****************************/
/* PROTRACTOR RULER COMPASS */
/****************************/

function getRelPos(pos) {
	if (un(pos)) pos = draw.mouse;
	return [pos[0],pos[1]];
}
function drawClickProtractorStartMove() {
	moveToolToFront('protractor');
	draw.cursorCanvas.style.cursor = draw.cursors.move1;
	//addListenerMove(window,protractorDragMove);
	//addListenerEnd(window,protractorDragStop);
	draw.animate(protractorDragMove,protractorDragStop,drawToolsCanvas);
	changeDrawMode('protractorMove');
}
function protractorDragMove(e) {
	updateMouse(e);
	var center = [
		draw.mouse[0]-draw.protractor.relSelPoint[0],
		draw.mouse[1]-draw.protractor.relSelPoint[1]
	];
	center = snapToObj2(center,-1);
	
	draw.protractor.center[0] = center[0];
	draw.protractor.center[1] = center[1];	
	//drawToolsCanvas();
}
function protractorDragStop(e) {
	//removeListenerMove(window,protractorDragMove);
	//removeListenerEnd(window,protractorDragStop);
	changeDrawMode();
}

function drawClickProtractorStartRotate() {
	moveToolToFront('protractor');
	//addListenerMove(window,protractorRotateMove);
	//addListenerEnd(window,protractorRotateStop);
	draw.animate(protractorRotateMove,protractorRotateStop,drawToolsCanvas);
	changeDrawMode('protractorRotate');
}
function protractorRotateMove(e) {
	updateMouse(e);
	
	draw.protractor.angle += measureAngle({c:draw.mouse,b:[draw.protractor.center[0],draw.protractor.center[1]],a:[draw.protractor.prevX,draw.protractor.prevY],angleType:'radians'});
	//drawToolsCanvas();
	
	draw.protractor.prevX = draw.mouse[0];
	draw.protractor.prevY = draw.mouse[1];
}
function protractorRotateStop(e) {
	//removeListenerMove(window,protractorRotateMove);
	//removeListenerEnd(window,protractorRotateStop);
	changeDrawMode();
}

function drawClickRulerStartMove() {
	moveToolToFront('ruler');
	//addListenerMove(window,rulerDragMove);
	//addListenerEnd(window,rulerDragStop);
	draw.animate(rulerDragMove,rulerDragStop,drawToolsCanvas);	
	changeDrawMode('rulerMove');
}
function rulerDragMove(e) {
	updateMouse(e);
	
	draw.ruler.left += draw.mouse[0]-draw.ruler.prevX;
	draw.ruler.top += draw.mouse[1]-draw.ruler.prevY;
	recalcRulerValues();
	//drawToolsCanvas();
	
	draw.ruler.prevX = draw.mouse[0];
	draw.ruler.prevY = draw.mouse[1];
}
function rulerDragStop(e) {
	//removeListenerMove(window,rulerDragMove);
	//removeListenerEnd(window,rulerDragStop);
	changeDrawMode();
}

function drawClickRulerStartRotate1() {
	moveToolToFront('ruler');
	//addListenerMove(window,rulerRotateMove1);
	//addListenerEnd(window,rulerRotateStop);
	draw.animate(rulerRotateMove1,rulerRotateStop,drawToolsCanvas);	
	changeDrawMode('rulerRotate');
}
function drawClickRulerStartRotate2() {
	moveToolToFront('ruler');
	//addListenerMove(window,rulerRotateMove2);
	//addListenerEnd(window,rulerRotateStop);
	draw.animate(rulerRotateMove2,rulerRotateStop,drawToolsCanvas);		
	changeDrawMode('rulerRotate');
}
function rulerRotateMove1(e) {
	updateMouse(e);
	
	dAngle = measureAngle({c:draw.mouse,b:[draw.ruler.centerX2,draw.ruler.centerY2],a:[draw.ruler.prevX,draw.ruler.prevY],angleType:'radians'});
	draw.ruler.angle += dAngle;
	draw.ruler.left = (draw.ruler.centerX2 - 0.98*draw.ruler.length*Math.cos(draw.ruler.angle));
	draw.ruler.top = (draw.ruler.centerY2 - 0.98*draw.ruler.length*Math.sin(draw.ruler.angle));
	recalcRulerValues();
	//drawToolsCanvas();	
	
	draw.ruler.prevX = draw.mouse[0];
	draw.ruler.prevY = draw.mouse[1];
}
function rulerRotateMove2(e) {
	updateMouse(e);
	
	draw.ruler.angle += measureAngle({c:draw.mouse,b:[draw.ruler.centerX1,draw.ruler.centerY1],a:[draw.ruler.prevX,draw.ruler.prevY],angleType:'radians'});
	recalcRulerValues();
	//drawToolsCanvas();
	
	draw.ruler.prevX = draw.mouse[0];
	draw.ruler.prevY = draw.mouse[1];
}
function rulerRotateStop(e) {
	//removeListenerMove(window,rulerRotateMove1);
	//removeListenerMove(window,rulerRotateMove2);	
	//removeListenerEnd(window,rulerRotateStop);
	changeDrawMode();
}
function drawClickRulerRotate180() {
	moveToolToFront('ruler');
	draw.ruler.angle += Math.PI;
	draw.ruler.left += 2*draw.ruler.centerRel[0];
	draw.ruler.top += 2*draw.ruler.centerRel[1];
	recalcRulerValues();
	drawToolsCanvas();
}


function drawClickRulerStartDraw1() {
	//console.log('drawClickRulerStartDraw1');
	moveToolToFront('ruler');
	draw.drawing = true;
	drawCanvasPaths();
	var obj = {
		type:'line',
		color:draw.color,
		thickness:draw.thickness,
		startPos:[draw.startX,draw.startY],
		created:new Date().getTime()
	};
	if (!un(draw.dash) && draw.dash.length > 0) obj.dash = clone(draw.dash);	
	draw.path.push({obj:[obj],selected:false});
	//addListenerMove(window,rulerDrawMove1);
	//addListenerEnd(window,lineDrawStop);	
	draw.animate(rulerDrawMove1,lineDrawStop,drawSelectedPaths);	
}
function rulerDrawMove1(e) {
	updateMouse(e);
	
	var newPos = closestPointOnLineSegment(draw.mouse,draw.ruler.edgePos1,draw.ruler.edgePos2);
	draw.path[draw.path.length-1].obj[0].finPos = newPos;
	//drawSelectedPaths();	
}

function drawClickRulerStartDraw2() {
	//console.log('drawClickRulerStartDraw2');
	moveToolToFront('ruler');
	draw.drawing = true;
	drawCanvasPaths();
	var obj = {
		type:'line',
		color:draw.color,
		thickness:draw.thickness,
		startPos:[draw.startX,draw.startY],
		created:new Date().getTime()
	};
	if (!un(draw.dash) && draw.dash.length > 0) obj.dash = clone(draw.dash);	
	draw.path.push({obj:[obj],selected:false});
	//addListenerMove(window,rulerDrawMove2);
	//addListenerEnd(window,lineDrawStop);	
	draw.animate(rulerDrawMove2,lineDrawStop,drawSelectedPaths);	
}
function rulerDrawMove2(e) {
	updateMouse(e);
	var newPos = closestPointOnLineSegment(draw.mouse,draw.ruler.edgePos3,draw.ruler.edgePos4);
	draw.path[draw.path.length-1].obj[0].finPos = newPos;
	//drawSelectedPaths();	
}

function drawClickCompassLock() {
	moveToolToFront('compass');
	draw.compass.radiusLocked = !draw.compass.radiusLocked;
	drawToolsCanvas();	
}

function drawClickCompassStartDraw(e) {
	updateMouse(e);	
	moveToolToFront('compass');
	draw.compass.mode = 'draw';
	draw.drawing = true;
	changeDrawMode('compassDraw');
	var obj = {
		type:'arc',
		color:draw.color,
		thickness:draw.thickness,
		center:draw.compass.center1.slice(0),
		radius:draw.compass.radius,
		startAngle:draw.compass.angle,
		finAngle:draw.compass.angle,
		clockwise:true,
		created:new Date().getTime()
	};
	if (!un(draw.dash) && draw.dash.length > 0) obj.dash = clone(draw.dash);
	draw.path.push({obj:[obj],selected:false});
	drawCanvasPaths();
	//addListenerMove(window,compassDrawMove);
	//addListenerEnd(window,compassDrawStop);
	draw.animate(compassDrawMove,compassDrawStop,function() {
		drawSelectedPaths();
		drawToolsCanvas();
	});
}
function compassDrawMove(e) {
	updateMouse(e);
	
	var dAngle = measureAngle({c:draw.mouse,b:[draw.compass.center1[0],draw.compass.center1[1]],a:[draw.compass.prevX,draw.compass.prevY],angleType:'radians'});
	if (dAngle > Math.PI) {
		draw.compass.angle -= dAngle = 2*Math.PI-dAngle;
	} else {
		draw.compass.angle += dAngle;
	}
	var angle = (draw.compass.angle%(2*Math.PI));
	if (angle < 0) angle += 2*Math.PI;
	if (angle > 0.5 * Math.PI && angle < 1.5 * Math.PI) {
		draw.compass.drawOn = 'left';	
	} else {
		draw.compass.drawOn = 'right';
	}
	draw.compass.center3[0] = draw.compass.center1[0]+draw.compass.radius*Math.cos(draw.compass.angle);
	draw.compass.center3[1] = draw.compass.center1[1]+draw.compass.radius*Math.sin(draw.compass.angle);
	
	/*var snapNewCenter3 = snapToObj2(draw.compass.center3,-1);
	if (snapNewCenter3[0] !== draw.compass.center3[0] || snapNewCenter3[1] !== draw.compass.center3[1]) {		
		draw.compass.angle = getAngleFromAToB(snapNewCenter3,draw.compass.center1);
		var angle = (draw.compass.angle%(2*Math.PI));
		if (angle < 0) angle += 2*Math.PI;
		if (angle > 0.5 * Math.PI && angle < 1.5 * Math.PI) {
			draw.compass.drawOn = 'left';	
		} else {
			draw.compass.drawOn = 'right';
		}
		draw.compass.center3[0] = draw.compass.center1[0]+draw.compass.radius*Math.cos(draw.compass.angle);
		draw.compass.center3[1] = draw.compass.center1[1]+draw.compass.radius*Math.sin(draw.compass.angle);
	}*/
	
	if (draw.compass.drawOn == 'right') {
		draw.compass.center2[0] = draw.compass.center1[0]+0.5*draw.compass.radius*Math.cos(draw.compass.angle)+draw.compass.h*Math.sin(draw.compass.angle);
		draw.compass.center2[1] = draw.compass.center1[1]+0.5*draw.compass.radius*Math.sin(draw.compass.angle)-draw.compass.h*Math.cos(draw.compass.angle);
	} else {
		draw.compass.center2[0] = draw.compass.center1[0]+0.5*draw.compass.radius*Math.cos(draw.compass.angle)-draw.compass.h*Math.sin(draw.compass.angle);
		draw.compass.center2[1] = draw.compass.center1[1]+0.5*draw.compass.radius*Math.sin(draw.compass.angle)+draw.compass.h*Math.cos(draw.compass.angle);			
	}	

	var mp1 = midpoint(draw.compass.center1[0],draw.compass.center1[1],draw.compass.center3[0],draw.compass.center3[1]);
	var mp2 = midpoint(draw.compass.center2[0],draw.compass.center2[1],mp1[0],mp1[1]);
	draw.compass.lockCenter = mp2;

	draw.path[draw.path.length-1].obj[0].startAngle = Math.min(draw.path[draw.path.length-1].obj[0].startAngle,draw.compass.angle);
	draw.path[draw.path.length-1].obj[0].finAngle = Math.max(draw.path[draw.path.length-1].obj[0].finAngle,draw.compass.angle);	
	
	recalcCompassValues();
	//drawSelectedPaths();
	//drawToolsCanvas();
	
	draw.compass.prevX = draw.mouse[0];
	draw.compass.prevY = draw.mouse[1];
}
function compassDrawStop(e) {
	//removeListenerMove(window,compassDrawMove);
	//removeListenerEnd(window,compassDrawStop);	
	draw.compass.mode = 'none';
	draw.drawing = false;
	changeDrawMode('prev');
	recalcCompassValues();
	drawToolsCanvas();
	// simplify angles to between 0 and 360
	var angle1 = draw.path[draw.path.length-1].obj[0].startAngle;
	var angle2 = draw.path[draw.path.length-1].obj[0].finAngle;
	if (angle1 > angle2) {
		draw.path[draw.path.length-1].obj[0].clockwise = true;
	} else {
		draw.path[draw.path.length-1].obj[0].clockwise = false;
	}
	if (Math.abs(angle1 - angle2) > 2 * Math.PI) {
		draw.path[draw.path.length-1].obj[0].startAngle = 0;
		draw.path[draw.path.length-1].obj[0].finAngle = 2 * Math.PI;
		draw.path[draw.path.length-1].obj[0].clockwise = true;
	} else {
		while (angle1 < 0) {angle1 += 2 * Math.PI;}
		while (angle2 < 0) {angle2 += 2 * Math.PI;}
		while (angle1 > 2 * Math.PI) {angle1 -= 2 * Math.PI;}
		while (angle2 > 2 * Math.PI) {angle2 -= 2 * Math.PI;}
		if (draw.path[draw.path.length-1].obj[0].clockwise == true) {
			draw.path[draw.path.length-1].obj[0].startAngle = angle1;
			draw.path[draw.path.length-1].obj[0].finAngle = angle2;
		} else {
			draw.path[draw.path.length-1].obj[0].startAngle = angle2;
			draw.path[draw.path.length-1].obj[0].finAngle = angle1;			
		}
	}
	//console.log(draw.path[draw.path.length-1].startAngle,draw.path[draw.path.length-1].finAngle,draw.path[draw.path.length-1].clockwise);
	drawCanvasPaths();
	delete draw.compass.dragRelPos;
}

function drawClickCompassStartMove1(e) {
	moveToolToFront('compass');
	draw.compass.mode = 'move1';
	changeDrawMode('compassMove1');
	updateSnapPoints(); // update intersection points	
	draw.animate(compassMove1Move,compassMoveStop,drawToolsCanvas);
	//addListenerMove(window,compassMove1Move);
	//addListenerEnd(window,compassMoveStop);
	draw.cursorCanvas.style.cursor = 'url("/i2/cursors/closedhand.cur"), auto';	
}
function drawClickCompassStartMove2(e) {
	updateMouse(e);
	draw.compass.dragRelPos = [draw.compass.center3[0]-draw.mouse[0],draw.compass.center3[1]-draw.mouse[1]];
	
	moveToolToFront('compass');
	draw.compass.mode = 'move2';
	changeDrawMode('compassMove2');
	updateSnapPoints(); // update intersection points	
	draw.compass.pointerEvents = 'auto';
	draw.animate(compassMove2Move,compassMoveStop,drawToolsCanvas);
	//addListenerMove(window,compassMove2Move);
	//addListenerEnd(window,compassMoveStop);	
	draw.cursorCanvas.style.cursor = 'url("/i2/cursors/closedhand.cur"), auto';
}
function compassMove1Move(e) {
	updateMouse(e);
	
	var center1 = [
		draw.mouse[0]-draw.compass.relSelPoint[0],
		draw.mouse[1]-draw.compass.relSelPoint[1]
	];
	if (snapToObj2On || draw.snapLinesTogether) {
		center1 = snapToObj2(center1);
	}
	draw.compass.center1 = center1;
	draw.compass.center2 = [center1[0]+draw.compass.relCenter2[0],center1[1]+draw.compass.relCenter2[1]];
	draw.compass.center3 = [center1[0]+draw.compass.relCenter3[0],center1[1]+draw.compass.relCenter3[1]];
	draw.compass.lockCenter = [center1[0]+draw.compass.relLockCenter[0],center1[1]+draw.compass.relLockCenter[1]];	
	//drawToolsCanvas();
}
function compassMove2Move(e) {
	updateMouse(e);
	var newcenter3 = [draw.mouse[0]+draw.compass.dragRelPos[0],draw.mouse[1]+draw.compass.dragRelPos[1]];
	
	if (draw.compass.radiusLocked == false) {
		newcenter3 = snapToObj2(newcenter3,-1);
		
		var newRadius = Math.sqrt(Math.pow(newcenter3[0]-draw.compass.center1[0],2)+Math.pow(newcenter3[1]-draw.compass.center1[1],2));
		
		if (newRadius <= 1.85 * draw.compass.armLength) {
			draw.compass.center3[0] = newcenter3[0];
			draw.compass.center3[1] = newcenter3[1];
			draw.compass.radius = newRadius;
			if (draw.compass.center3[0] >= draw.compass.center1[0]) {
				draw.compass.angle = Math.atan((draw.compass.center3[1]-draw.compass.center1[1])/(draw.compass.center3[0]-draw.compass.center1[0]));
			} else {
				draw.compass.angle = Math.PI + Math.atan((draw.compass.center3[1]-draw.compass.center1[1])/(draw.compass.center3[0]-draw.compass.center1[0]));
			}			
		} else {			
			if (newcenter3[0] >= draw.compass.center1[0]) {
				draw.compass.angle = Math.atan((newcenter3[1]-draw.compass.center1[1])/(newcenter3[0]-draw.compass.center1[0]));
			} else {
				draw.compass.angle = Math.PI + Math.atan((newcenter3[1]-draw.compass.center1[1])/(newcenter3[0]-draw.compass.center1[0]));
			}
			draw.compass.center3[0] = draw.compass.center1[0] + 1.85 * draw.compass.armLength * Math.cos(draw.compass.angle);
			draw.compass.center3[1] = draw.compass.center1[1] + 1.85 * draw.compass.armLength * Math.sin(draw.compass.angle);
			draw.compass.radius = 1.85 * draw.compass.armLength;		
		}
	} else {
		var snapNewCenter3 = snapToObj2(newcenter3,-1);
		var pos = clone(draw.mouse);
		if (Math.abs(dist(snapNewCenter3,draw.compass.center1) - draw.compass.radius) < 0.1) {
			pos = [pos[0]-draw.compass.dragRelPos[0],pos[1]-draw.compass.dragRelPos[1]];
		}
			
		var dAngle = measureAngle({c:pos,b:[draw.compass.center1[0],draw.compass.center1[1]],a:[draw.compass.prevX,draw.compass.prevY],angleType:'radians'});
		
		if (dAngle > Math.PI) {
			draw.compass.angle -= (2*Math.PI-dAngle);
		} else {
			draw.compass.angle += dAngle;
		}
		draw.compass.center3[0] = draw.compass.center1[0] + draw.compass.radius * Math.cos(draw.compass.angle);
		draw.compass.center3[1] = draw.compass.center1[1] + draw.compass.radius * Math.sin(draw.compass.angle);
	}

	var angle = (draw.compass.angle%(2*Math.PI));
	if (angle < 0) angle += 2*Math.PI;
	if (angle > 0.5 * Math.PI && angle < 1.5 * Math.PI) {
		draw.compass.drawOn = 'left';	
	} else {
		draw.compass.drawOn = 'right';
	}
		
	draw.compass.h	= Math.sqrt(Math.pow(draw.compass.armLength,2)-Math.pow(0.5*draw.compass.radius,2));
	if (draw.compass.drawOn == 'right') {
		draw.compass.center2[0] = draw.compass.center1[0]+0.5*draw.compass.radius*Math.cos(draw.compass.angle)+draw.compass.h*Math.sin(draw.compass.angle);
		draw.compass.center2[1] = draw.compass.center1[1]+0.5*draw.compass.radius*Math.sin(draw.compass.angle)-draw.compass.h*Math.cos(draw.compass.angle);		
	} else {
		draw.compass.center2[0] = draw.compass.center1[0]+0.5*draw.compass.radius*Math.cos(draw.compass.angle)-draw.compass.h*Math.sin(draw.compass.angle);
		draw.compass.center2[1] = draw.compass.center1[1]+0.5*draw.compass.radius*Math.sin(draw.compass.angle)+draw.compass.h*Math.cos(draw.compass.angle);				
	}
	
	var mp1 = midpoint(draw.compass.center1[0],draw.compass.center1[1],draw.compass.center3[0],draw.compass.center3[1]);
	var mp2 = midpoint(draw.compass.center2[0],draw.compass.center2[1],mp1[0],mp1[1]);
	draw.compass.lockCenter = mp2;
	
	recalcCompassValues();
	//drawToolsCanvas();
	
	draw.compass.prevX = draw.mouse[0];
	draw.compass.prevY = draw.mouse[1];
}
function compassMoveStop(e) {
	//removeListenerMove(window,compassMove1Move);
	//removeListenerMove(window,compassMove2Move);
	//removeListenerEnd(window,compassMoveStop);	
	draw.cursorCanvas.style.cursor = draw.cursors.move1;
	draw.compass.mode = 'none';
	changeDrawMode('prev');
	recalcCompassValues();
	delete draw.compass.dragRelPos;
}

// Javascipt document

if (un(window.draw)) var draw = {};

draw.questionLayout = {
	fix: function() {
		function getObjs(type) {
			if (un(type)) type === 'text2';
			var objs = [];
			for (var p = 0; p < draw.path.length; p++) {
				var path = draw.path[p];
				if (!un(path.trigger) && arraysEqual(path.trigger,[false])) continue;
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (obj.type === type) {
						obj._path = path;
						objs.push(obj);
					}
				}
			}
			return objs;
		}
		
		draw.updateAllBorders();
		drawCanvasPaths();
		getObjs('text2').forEach(function(obj) {
			draw.text2.splitByLines(obj);
		});
		
		draw.updateAllBorders();
		drawCanvasPaths();
		getObjs('text2').forEach(function(obj) {
			draw.text2.splitByTabs(obj);
		});
		
		draw.updateAllBorders();
		drawCanvasPaths();
		getObjs('text2').forEach(function(obj) {
			draw.text2.minimiseRect(obj);
			draw.text2.getTextType(obj);
			draw.text2.fixTitleUnderlining(obj);
			if (typeof obj._textType === 'string' && obj._textType.indexOf('question') > -1) {
				obj.rect[0] = 20;
			}
		});
		
		getObjs('table2').forEach(function(obj) {
			draw.questionLayout.fixTableFormatting(obj);
		});
		
		draw.updateAllBorders();
		selectAllPaths();

		draw.questionLayout.add();
	},
	
	fixTableFormatting: function(obj) {
		var chars = 'abcdefghijklmnopqrstuvwxyz';
		if (un(obj._cells)) obj._cells = draw.table2.getAllCells(obj);
		var isQuestionTable = true;
		for (var c = 0; c < obj._cells.length; c++) {
			var cell = obj._cells[c];
			var startTags = textArrayGetStartTags(cell.text);
			var text1 = cell.text[0];
			text1 = text1.slice(startTags.length);
			if (chars.indexOf(text1[0]) > -1 && text1[1] === ")") {
				isQuestionTable = true;
				var char = text1[0];
				text1 = text1.slice(2);
				while (text1[0] === " " || text1[0] === tab) text1 = text1.slice(1);
				var tabs = tab;
				if ("fijl".indexOf(char) > -1) tabs += tab;
				cell.text[0] = startTags+char+')'+tabs+text1;
			} else {
				isQuestionTable = false;
			}
		}
		if (isQuestionTable === true) draw.questionLayout.fixTableWidth(obj);
	},
	fixTableWidth: function(obj) {
		var relatedPaths = [];
		var ansTable = false;
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (path === obj._path) continue;
			if (un(path._center)) updateBorder(path);
			
			if (!un(path.trigger) && path.trigger[0] === false && path.obj.length === 1 && path.obj[0].type === 'table2' && path.obj[0].widths.length === obj.widths.length && path.obj[0].heights.length === obj.heights.length && path._center[0] > obj.left && path._center[0] < obj.left+obj.width && path._center[1] > obj.top && path._center[1] < obj.top+obj.height) {
				ansTable = path.obj[0];
				continue;
			}
			
			if (path._center[0] < obj.left || path._center[0] > obj.left+obj.width || path._center[1] < obj.top || path._center[1] > obj.top+obj.height) continue;
			
			relatedPath = {r:0,c:0,offset:[0,0],path:path};

			var x = obj.left;
			for (var w = 0; w < obj.widths.length; w++) {
				if (path._center[0] > x && path._center[0] < x+obj.widths[w]) {
					relatedPath.c = w;
					relatedPath.offset[0] = path.tightBorder[0]-x;
					break;
				}
				x += obj.widths[w];
			}
			
			var y = obj.top;
			for (var h = 0; h < obj.heights.length; h++) {
				if (path._center[1] > y && path._center[1] < y+obj.heights[h]) {
					relatedPath.r = h;
					relatedPath.offset[1] = path.tightBorder[1]-y;
					break;
				}
				y += obj.heights[h];
			}
			
			
			
			relatedPaths.push(relatedPath);
		}
		
		obj.left = 80;
		obj.width = 1100;
		for (var w = 0; w < obj.widths.length; w++) {
			obj.widths[w] = 1100 / obj.widths.length;
		}
		updateBorder(obj._path);
		
		for (var p = 0; p < relatedPaths.length; p++) {
			var relatedPath = relatedPaths[p];
			var x = obj.left;
			for (var c = 0; c < relatedPath.c; c++) x += obj.widths[c];
			x += relatedPath.offset[0];
			var y = obj.top;
			for (var r = 0; r < relatedPath.r; r++) y += obj.heights[r];
			y += relatedPath.offset[1];
			positionPath(relatedPath.path,x,y);
		}
		if (ansTable !== false) {
			ansTable.widths = clone(obj.widths);
			ansTable.heights = clone(obj.heights);
		}
		
		drawCanvasPaths();
	},
	textToTable: function(obj) {
		var cells = [[{text:[""]}]];
		
		var lines = [[""]];
		
		for (var t = 0; t < obj.text.length; t++) {
			var element = obj.text[t];
			if (typeof element !== 'string') {
				lines.last().push(element);
			} else {
				var splitLines = element.split(br);
				for (var s = 0; s < splitLines.length; s++) {
					var splitLine = splitLines[s];
					while (splitLine.indexOf(br) === 0) splitLine = splitLine.slice(1);
					lines.last().push(splitLine);
					if (splitLines.length > 1 && s < splitLines.length-1) lines.push([""]);
				}
			}
		}
		
		//console.log(lines);
		
		var cells = [];
		for (var l = 0; l < lines.length; l++) {
			var line = lines[l];
			var row = [{text:[]}];
			
			for (var e = 0; e < line.length; e++) {
				var element = line[e];
				if (typeof element !== 'string') {
					row.last().text.push(element);
				} else {
					var splitString = element.split(tab+tab+tab);
					console.log(splitString);
					for (var s = 0; s < splitString.length; s++) {
						var splitStr = splitString[s];
						while (splitStr.indexOf(tab) === 0) splitStr = splitStr.slice(1);
						if (splitStr.length === 0) continue;
						if (splitString.length > 1) row.push({text:[]});
						row.last().text.push(splitStr);
					}
				}
			}
			
			cells.push(row);
		}
		
		//console.log(cells);
		var width = obj.rect[2];
		var height = obj.rect[3];
		var rows = cells.length;
		var cols = 0;
		for (var r = 0; r < rows; r++) cols = Math.max(cells[r].length);
		for (var r = 0; r < rows; r++) while (cells[r].length < cols) cells[r].push({text:[""]});
		var heights = [];
		for (var r = 0; r < rows; r++) heights.push(height/rows);
		var widths = [];
		for (var c = 0; c < cols; c++) widths.push(width/cols);
		
		for (var r = 0; r < rows; r++) {
			for (var c = 0; c < cols; c++) {
				cells[r][c].align = [-1,0];
			}
		}
		
		var table = {
			type:'table2',
			cells:cells,
			left:obj.rect[0],
			top:obj.rect[1],
			widths:widths,
			heights:heights,
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
		}
		
		draw.path.push({
			obj: [table],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		
	},
	
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var sections = draw.questionLayout.getPageSections();
		var totalMinHeight = 0;
		for (var q = 0; q < sections.length; q++) {
			var section = sections[q];
			section.paths = draw.questionLayout.getPagePathsInRect([20,section.top,1160,section.height]);
			section.minHeight = draw.questionLayout.getSectionMinHeight(section);
			totalMinHeight += section.minHeight;
		}
		draw.path.push({
			obj: [{
					type: 'questionLayout',
					left:20,
					width:1160,
					sections:sections,
					totalMinHeight:totalMinHeight
				}
			],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		calcCursorPositions();
	},
	draw: function (ctx, obj, path) {
		var rect = draw.questionLayout.getRect(obj);
		ctx.fillStyle = colorA('#FCC',0.5);
		for (var q = 0; q < obj.sections.length; q++) {
			var section = obj.sections[q];
			if (section.height > section.minHeight) {
				ctx.fillRect(rect[0],section.top+section.minHeight,rect[2],section.height-section.minHeight);
			}
		}
		ctx.lineWidth = 4;
		ctx.strokeStyle = '#F00';
		ctx.beginPath();
		for (var q = 1; q < obj.sections.length; q++) {
			var section = obj.sections[q];
			ctx.moveTo(obj.left,section.top);
			ctx.lineTo(obj.left+obj.width,section.top);
		}
		ctx.stroke();
		ctx.strokeRect(rect[0],rect[1],rect[2],rect[3]);
		
		for (var q = 0; q < obj.sections.length; q++) {
			var section = obj.sections[q];
			var color = section.type.indexOf('question') === 0 ? '#C00' : section.type.indexOf('page-title') === 0 ? '#C90' : '#00C';
			text({
				ctx:ctx,
				text:[section.type],
				rect:[600-75,section.top,150,30],
				align:[0,0],
				box:{"type":"loose","borderColor":color,"borderWidth":0.1,"radius":0,"color":color},
				color:'#FFF',
				fontSize:24
			});
			
			if (section.distributeButton === true) {
				text({
					ctx:ctx,
					text:['Distribute'],
					rect:[1200-150-20,section.top,150,45],
					align:[0,0],
					box:{"type":"loose","borderColor":color,"borderWidth":0.1,"radius":0,"color":color},
					color:'#FFF',
					fontSize:24
				});
			}
		}
	},
	getRect: function (obj) {
		var top = obj.sections[0].top;
		var height = 0;
		for (var q = 0; q < obj.sections.length; q++) {
			var section = obj.sections[q];
			height += section.height;
		}
		return [obj.left,top,obj.width,height];
	},
	getPageSections: function() {
		var paths = draw.path;
		var sectionTextPaths = draw.questionLayout.getPageQuestionSectionPaths();
		var sections = [];
		for (var q = 0; q < sectionTextPaths.length; q++) {
			var path = sectionTextPaths[q];
			var obj = path.obj[0];
			
			var startTags = textArrayGetStartTags(obj.text);
			var text1 = obj.text[0];
			text1 = text1.slice(startTags.length);
			
			if (!un(obj.box) && obj.box.type === 'loose') {
				var top = obj.rect[1];
			} else {
				var measure = draw.text2.getTextMeasure(obj);
				var top = measure.lineRects[0][1];
			}
			
			
			
			sections.push({
				path:path,
				obj:obj,
				type:obj._textType,
				textMeasure:measure,
				top:top,
				height:0,
				paths:[]
			});
		}
		sections.sort(function(a,b) {
			return a.top-b.top;
		});
		for (var q = 0; q < sections.length; q++) {
			var section = sections[q];
			var nextTop = q < sections.length-1 ? sections[q+1].top : 1640;
			section.height = nextTop - section.top;
			if (section.type.indexOf('question') === 0 && (q === 0 || sections[q-1].type.indexOf('question') !== 0)) {
				section.distributeButton = true;
			}
		}
		
		return sections;
	},
	getPageQuestionSectionPaths: function() {
		var paths = draw.path;
		return paths.filter(function(path) {
			if (path.obj.length !== 1) return false;
			var obj = path.obj[0];
			var textType = draw.text2.getTextType(obj);
			if (typeof textType !== 'string') return false;
			if (textType.indexOf('page-title') === 0 || textType.indexOf('sub-title') === 0 || textType.indexOf('question') === 0) {
				return true;
			}
		});
	},
	getPagePathsInRect: function(rect) {
		var paths = draw.path;
		return paths.filter(function(path) {
			if (path.obj[0].type === 'questionLayout') return false;
			var x = path.tightBorder[0]+0.5*path.tightBorder[2];
			var y = path.tightBorder[1]+0.5*path.tightBorder[3];
			if (rect[0] < x && x < rect[0]+rect[2] && rect[1] < y && y < rect[1]+rect[3]) return true;
			return false
		});
	},
	getSectionMinHeight: function(section) {
		if (section.paths.length === 0) draw.questionLayout.getPagePathsInRect([20,section.top,1160,section.height]);
		if (section.paths.length === 0) return;
		var top, bottom;
		for (var p = 0; p < section.paths.length; p++) {
			var path = section.paths[p];
			if (!un(path.trigger) && path.trigger[0] === false) continue;
			var pathTop = path.tightBorder[1];
			var pathBottom = path.tightBorder[1]+path.tightBorder[3];
			if (path.obj.length === 1 && path.obj[0].type === 'text2' && (un(path.obj[0].box) || path.obj[0].box.type !== 'loose')) {
				var measure = draw.text2.getTextMeasure(path.obj[0]);
				var line1 = measure.lineRects[0];
				pathTop = line1[1];
				var line2 = measure.lineRects[measure.lineRects.length-1];
				pathBottom = line2[1] + line2[3];
			}
			top = un(top) ? pathTop : Math.min(top,pathTop);
			bottom = un(bottom) ? pathBottom : Math.max(bottom,pathBottom);
		}
		return bottom-top;
	},
	setSectionPosition: function(obj,section,top,height,adjustPrev) {
		if (section.paths.length === 0) draw.questionLayout.getPagePathsInRect([20,section.top,1160,section.height]);
		
		var dy = top-section.top;
		for (var p = 0; p < section.paths.length; p++) {
			var path = section.paths[p];
			repositionPath(path,0,dy);
		}
		section.top = top;
		section.height = height;
		
		if (adjustPrev === true && obj.sections[0] !== section) {
			var prev = obj.sections[obj.sections.indexOf(section)-1];
			prev.height += dy;
		}
	},
	distributeQuestionSections: function(obj) {
		if (un(obj)) {
			for (var p = 0; p < draw.path.length; p++) {
				var path = draw.path[p];
				for (var o = 0; o < path.obj.length; o++) {
					var obj2 = path.obj[o];
					if (obj2.type === 'questionLayout') {
						obj = obj2;
						p = draw.path.length;
						break;
					}
				}
			}
		}
		
		var start = draw.currCursor.sectionStart;
		console.log(start);
		var sections = [];
		var totalMinHeight = 0;
		var totalHeight = 0;
		var top;
		for (var q = start; q < obj.sections.length; q++) {
			var section = obj.sections[q];
			if (section.type.indexOf('question') !== 0) break;
			section.paths = draw.questionLayout.getPagePathsInRect([20,section.top,1160,section.height]);
			section.minHeight = draw.questionLayout.getSectionMinHeight(section);
			totalMinHeight += section.minHeight;
			totalHeight += section.height;
			sections.push(section);
		}
		var questionPadding = (totalHeight-totalMinHeight) / sections.length;
		//console.log(questionPadding);
		console.log(sections);
		
		var top = sections[0].top;
		for (var q = 0; q < sections.length; q++) {
			var section = sections[q];
			//console.log(top,section);
			draw.questionLayout.setSectionPosition(obj,section,top,section.minHeight+questionPadding);
			top += section.minHeight+questionPadding;
		}
		
		drawCanvasPaths();
	},
	distributeAllSections: function(obj) {
		if (un(obj)) {
			for (var p = 0; p < draw.path.length; p++) {
				var path = draw.path[p];
				for (var o = 0; o < path.obj.length; o++) {
					var obj2 = path.obj[o];
					if (obj2.type === 'questionLayout') {
						obj = obj2;
						p = draw.path.length;
						break;
					}
				}
			}
		}
		var totalMinHeight = 0;
		for (var q = 0; q < obj.sections.length; q++) {
			var section = obj.sections[q];
			section.paths = draw.questionLayout.getPagePathsInRect([20,section.top,1160,section.height]);
			section.minHeight = draw.questionLayout.getSectionMinHeight(section);
			totalMinHeight += section.minHeight;
		}
		var top = obj.sections[0].top;
		var bottom = obj.sections.last().top+obj.sections.last().height;
		var questionPadding = (bottom-top-totalMinHeight) / obj.sections.length;
		//console.log(questionPadding);
		
		for (var q = 0; q < obj.sections.length; q++) {
			var section = obj.sections[q];
			//console.log(top);
			draw.questionLayout.setSectionPosition(obj,section,top,section.minHeight+questionPadding);
			top += section.minHeight+questionPadding;
		}
		
		drawCanvasPaths();
	},

	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		for (var q = 0; q < obj.sections.length; q++) {
			var section = obj.sections[q];
			pos.push({
				shape: 'rect',
				dims: [20,section.top-10,1160,20],
				cursor: draw.cursors.ns,
				func: draw.questionLayout.dragVertStart,
				obj: obj,
				q:q,
				pathNum: pathNum,
				highlight: -1
			});
			if (section.distributeButton === true) {
				pos.push({
					shape: 'rect',
					dims: [1200-150-20,section.top,150,45],
					cursor: draw.cursors.pointer,
					func: draw.questionLayout.distributeQuestionSections,
					sectionStart: q,
					obj: obj,
					pathNum: pathNum,
					highlight: -1
				});
			}
		}
		var rect = draw.questionLayout.getRect(obj);
		pos.push({
			shape: 'rect',
			dims: [20,rect[1]+rect[3]-10,1160,20],
			cursor: draw.cursors.ns,
			func: draw.questionLayout.dragBottomStart,
			obj: obj,
			pathNum: pathNum,
			highlight: -1
		});
		return pos;
	},
	
	dragVertStart: function(e) {
		updateMouse(e);
		draw._drag = {
			obj:draw.currCursor.obj,
			q:draw.currCursor.q,
			offset:draw.mouse[1]-draw.currCursor.obj.sections[draw.currCursor.q].top
		}
		changeDrawMode('questionLayoutVert');
		//addListenerMove(window, draw.questionLayout.dragVertMove);
		//addListenerEnd(window, draw.questionLayout.dragVertStop);
		draw.animate(draw.questionLayout.dragVertMove,draw.questionLayout.dragVertStop,drawCanvasPaths);
	},
	dragVertMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var q = draw._drag.q;
		var section = obj.sections[q];
		var top = draw.mouse[1];
		var nextTop = q < obj.sections.length-1 ? obj.sections[q+1].top : 1640;
		draw.questionLayout.setSectionPosition(obj,section,top,nextTop-top,true);
		//drawCanvasPaths();
	},
	dragVertStop: function() {
		//removeListenerMove(window, draw.questionLayout.dragVertMove);
		//removeListenerEnd(window, draw.questionLayout.dragVertStop);
		changeDrawMode('prev');
		delete draw._drag;
	},
	
	dragBottomStart: function(e) {
		updateMouse(e);
		draw._drag = {
			obj:draw.currCursor.obj
		}
		changeDrawMode('questionLayoutBottom');
		//addListenerMove(window, draw.questionLayout.dragBottomMove);
		//addListenerEnd(window, draw.questionLayout.dragBottomStop);		
		draw.animate(draw.questionLayout.dragBottomMove,draw.questionLayout.dragBottomStop,drawCanvasPaths);
	},
	dragBottomMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var section = obj.sections.last();
		var y = draw.mouse[1];
		if (Math.abs(y-1640) < 20) y = 1640
		draw.questionLayout.setSectionPosition(obj,section,section.top,y-section.top,true);
		//drawCanvasPaths();
	},
	dragBottomStop: function() {
		//removeListenerMove(window, draw.questionLayout.dragBottomMove);
		//removeListenerEnd(window, draw.questionLayout.dragBottomStop);
		changeDrawMode('prev');
		delete draw._drag;
	}
	
}

draw.mixedPath = {
	groupPaths: function() {
		var selected = selPaths();
		if (selected.length < 2) return;
		var objs = [];
		for (var p = 0; p < selected.length; p++) {
			var path = selected[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (['line','angle','curve','curve2'].indexOf(obj.type) === -1) continue;
				objs.push(obj);
				path.obj.splice(o,1);
				o--;
			}
		}
		if (objs.length === 0) return;
		for (var p = 0; p < draw.path.length; p++) {
			if (draw.path[p].obj.length === 0) {
				draw.path.splice(p,1);
				p--;
			}
		}
		draw.path.push({
			obj:[{
				type:'mixedPath',
				color:draw.color,
				fillColor:draw.fillColor,
				lineWidth:draw.thickness,
				paths:objs
			}],
			selected:true
		});
		drawCanvasPaths();
	},
	ungroupPaths: function(obj) {
		if (un(obj)) obj = sel();
		var path = obj._path;
		var objs = obj.paths;
		for (var o = 0; o < objs.length; o++) {
			var obj2 = objs[o];
			draw.path.push({
				obj:[obj2],
				selected:true
			});
		}
		draw.path.splice(draw.path.indexOf(path),1);
		draw.updateAllBorders();
		drawCanvasPaths();
	},
	draw: function(ctx, obj, path) {
		if (!un(obj.fillColor) && obj.fillColor !== 'none') {
			ctx.beginPath();
			var prev = [];
			for (var p = 0; p < obj.paths.length; p++) {
				var obj2 = obj.paths[p];
				switch (obj2.type) {
					case 'line' :	
						if (!arraysEqual(prev,obj2.startPos)) ctx.moveTo(obj2.startPos[0], obj2.startPos[1]);
						ctx.lineTo(obj2.finPos[0], obj2.finPos[1]);
						prev = obj2.finPos;
						break;
					case 'angle' :
						if (obj2.clockwise === true) {
							obj2.a = pointAddVector(obj2.b,[Math.cos(obj2.angleA),Math.sin(obj2.angleA)],obj2.radius);
							obj2.c = pointAddVector(obj2.b,[Math.cos(obj2.angleC),Math.sin(obj2.angleC)],obj2.radius);
							if (!arraysEqual(prev,obj2.a)) ctx.moveTo(obj2.a[0], obj2.a[1]);					
							ctx.arc(obj2.b[0],obj2.b[1],obj2.radius,obj2.angleA,obj2.angleC,true);
							prev = obj2.c;
						} else {
							obj2.a = pointAddVector(obj2.b,[Math.cos(obj2.angleA),Math.sin(obj2.angleA)],obj2.radius);
							obj2.c = pointAddVector(obj2.b,[Math.cos(obj2.angleC),Math.sin(obj2.angleC)],obj2.radius);
							if (!arraysEqual(prev,obj2.a)) ctx.moveTo(obj2.a[0], obj2.a[1]);					
							ctx.arc(obj2.b[0],obj2.b[1],obj2.radius,obj2.angleA,obj2.angleC,false);
							prev = obj2.c;
						}
						break;
					case 'curve' :
						if (!arraysEqual(prev,obj2.startPos)) ctx.moveTo(obj2.startPos[0], obj2.startPos[1]);					
						ctx.quadraticCurveTo(obj2.controlPos[0], obj2.controlPos[1], obj2.finPos[0], obj2.finPos[1]);
						prev = obj2.finPos;
						break;
					case 'curve2' :
						if (!arraysEqual(prev,obj2.startPos)) ctx.moveTo(obj2.startPos[0], obj2.startPos[1]);					
						ctx.bezierCurveTo(obj2.controlPos1[0], obj2.controlPos1[1], obj2.controlPos2[0], obj2.controlPos2[1], obj2.finPos[0], obj2.finPos[1]);
						prev = obj2.finPos;
						break;
				}
			}
			ctx.fillStyle = obj.fillColor;
			ctx.fill();
		}

		for (var p = 0; p < obj.paths.length; p++) {
			var obj2 = obj.paths[p];
			ctx.beginPath();
			switch (obj2.type) {
				case 'line' :	
					ctx.moveTo(obj2.startPos[0], obj2.startPos[1]);
					ctx.lineTo(obj2.finPos[0], obj2.finPos[1]);
					break;
				case 'angle' :
					if (obj2.clockwise === true) {
						obj2.a = pointAddVector(obj2.b,[Math.cos(obj2.angleA),Math.sin(obj2.angleA)],obj2.radius);
						obj2.c = pointAddVector(obj2.b,[Math.cos(obj2.angleC),Math.sin(obj2.angleC)],obj2.radius);
						ctx.moveTo(obj2.a[0], obj2.a[1]);					
						ctx.arc(obj2.b[0],obj2.b[1],obj2.radius,obj2.angleA,obj2.angleC,true);
					} else {
						obj2.a = pointAddVector(obj2.b,[Math.cos(obj2.angleA),Math.sin(obj2.angleA)],obj2.radius);
						obj2.c = pointAddVector(obj2.b,[Math.cos(obj2.angleC),Math.sin(obj2.angleC)],obj2.radius);
						ctx.moveTo(obj2.a[0], obj2.a[1]);					
						ctx.arc(obj2.b[0],obj2.b[1],obj2.radius,obj2.angleA,obj2.angleC,false);
					}
					break;
				case 'curve' :
					ctx.moveTo(obj2.startPos[0], obj2.startPos[1]);					
					ctx.quadraticCurveTo(obj2.controlPos[0], obj2.controlPos[1], obj2.finPos[0], obj2.finPos[1]);
					break;
				case 'curve2' :
					ctx.moveTo(obj2.startPos[0], obj2.startPos[1]);					
					ctx.bezierCurveTo(obj2.controlPos1[0], obj2.controlPos1[1], obj2.controlPos2[0], obj2.controlPos2[1], obj2.finPos[0], obj2.finPos[1]);
					break;
			}
			ctx.strokeStyle = obj2.color || obj.color;
			ctx.lineWidth = obj2.lineWidth || obj.lineWidth;
			ctx.stroke();
		}
	},
	getRect: function(obj) {
		for (var p = 0; p < obj.paths.length; p++) {
			var obj2 = obj.paths[p];
			obj2._rect = draw[obj2.type].getRect(obj2);
			if (p === 0) {
				obj._left = obj2._rect[0];
				obj._top = obj2._rect[1];
				obj._right = obj2._rect[0]+obj2._rect[2];
				obj._bottom = obj2._rect[1]+obj2._rect[3];
			} else {
				obj._left = Math.min(obj._left,obj2._rect[0]);
				obj._top = Math.min(obj._top,obj2._rect[1]);
				obj._right = Math.max(obj._right,obj2._rect[0]+obj2._rect[2]);
				obj._bottom = Math.max(obj._bottom,obj2._rect[1]+obj2._rect[3]);
			}
		}
		obj._width = obj._right - obj._left;
		obj._height = obj._bottom - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		for (var p = 0; p < obj.paths.length; p++) {
			var obj2 = obj.paths[p];
			draw[obj2.type].changePosition(obj2, dl, dt, 0, 0);			
		}
	},
	setFillColor: function(obj,color) {
		obj.fillColor = color;
	},
	setLineColor: function(obj,color) {
		obj.color = color;
	},
	setLineWidth: function(obj,lineWidth) {
		obj.lineWidth = lineWidth;
	},
	getLineWidth: function(obj) {
		return obj.lineWidth;
	}
};

draw.protractor2 = {
	resizable: false,
	drawToolsButton:true,
	//allowQuickDraw: false;
	add: function (static) {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'protractor2',
			center: center,
			radius: 250,
			angle: 0,
			color:'#CCF',
			opacity:0.25,
			numbers:true
		};
		if (static === true) {
			obj.protractorMode = 'static';
		} else {
			obj.button = [20,20];
			obj.protractorVisible = true;
		}
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (obj.protractorMode === 'static') {
			draw.protractor2.drawProtractor(ctx,obj);
		}
	},
	drawOverlay: function(ctx, obj, path) {
		if (obj.protractorMode === 'static') return;
		if (!un(obj.button) && obj.buttonVisible !== false) {
			ctx.translate(obj.button[0], obj.button[1]);
			var color = draw.buttonColor;
			if (obj.protractorVisible == true) color = draw.buttonSelectedColor;
			roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', color);
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';
			ctx.beginPath();
			ctx.moveTo(46.5, 35.5);
			ctx.lineTo(46.5, 37.5);
			ctx.lineTo(8.5, 37.5);
			ctx.lineTo(8.5, 34.5);
			ctx.arc(27.5, 34.5, 19, Math.PI, 2 * Math.PI);
			ctx.stroke();
			if (obj.protractorVisible == false) {
				ctx.fillStyle = '#CCF';
				ctx.fill();
				for (var i = 0; i < 7; i++) {
					ctx.moveTo(27.5 + 4 * Math.cos((1 + i / 6) * Math.PI), 34.5 + 4 * Math.sin((1 + i / 6) * Math.PI));
					ctx.lineTo(27.5 + 16 * Math.cos((1 + i / 6) * Math.PI), 34.5 + 16 * Math.sin((1 + i / 6) * Math.PI))
				}
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(27.5, 34.5, 15, Math.PI, 2 * Math.PI);
				for (var i = 0; i < 19; i++) {
					ctx.moveTo(27.5 + 17 * Math.cos((1 + i / 18) * Math.PI), 34.5 + 17 * Math.sin((1 + i / 18) * Math.PI));
					ctx.lineTo(27.5 + 19 * Math.cos((1 + i / 18) * Math.PI), 34.5 + 19 * Math.sin((1 + i / 18) * Math.PI))
				}
				ctx.moveTo(27.5, 34.5);
				ctx.lineTo(27.5, 30.5);
				ctx.moveTo(23.5, 34.5);
				ctx.lineTo(31.5, 34.5);
				ctx.stroke();
			}
			ctx.translate(-obj.button[0], -obj.button[1]);
		}
		if (obj.protractorVisible !== false || draw.mode === 'edit' && path.selected === true) {
			draw.protractor2.drawProtractor(ctx,obj);
		}
	},
	drawProtractor: function(ctx,obj) {
		var rad = obj.radius;
		var center = obj.center;
		var color = obj.color;
		var angle = obj.angle;
		var opacity = obj.opacity;
		
		var radius = [0.12*rad,0.7*rad,0.8*rad,0.88*rad,0.92*rad,rad];
		var fontSize = rad / 20;
		var colorRGB = hexToRgb(color);
		
		ctx.save();
		ctx.translate(center[0],center[1]);
		ctx.rotate(angle);
		
		ctx.fillStyle = "rgba("+colorRGB.r+","+colorRGB.g+","+colorRGB.b+","+opacity+")";
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

		ctx.moveTo(0-radius[0],0);
		ctx.lineTo(0+radius[0],0);

		var angle = Math.PI;
		if (boolean(obj.numbers,true) === true) {
			ctx.moveTo(0-radius[1],0);
			ctx.arc(0,0,radius[1],Math.PI,2*Math.PI);
			ctx.moveTo(0-radius[2],0);
			ctx.arc(0,0,radius[2],Math.PI,265*Math.PI/180);
			ctx.moveTo((0+radius[2]*Math.cos(275*Math.PI/180)),(0+radius[2]*Math.sin(275*Math.PI/180)));
			ctx.arc(0,0,radius[2],275*Math.PI/180,2*Math.PI);
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
					ctx.fillText('90',0,0);
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
					ctx.fillText(String(180-i),0,0);
					ctx.rotate(-(angle+0.5*Math.PI));
					ctx.translate(-(0+0.75*rad*Math.cos(angle)),-(0+0.75*rad*Math.sin(angle)));
					
					ctx.translate((0+0.845*rad*Math.cos(angle)),(0+0.845*rad*Math.sin(angle)));
					ctx.rotate(angle+0.5*Math.PI);
					ctx.fillText(String(i),0,0);
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
		} else {
			for (var i = 0; i < 181; i++) {
				if (i == 90) {
					ctx.moveTo(0,0+10);
					ctx.lineTo(0,0-radius[5]);	
				} else if (i % 10 == 0) {
					ctx.moveTo(0+radius[0]*Math.cos(angle),0+radius[0]*Math.sin(angle));;
					ctx.lineTo(0+radius[5]*Math.cos(angle),0+radius[5]*Math.sin(angle));
				} else if (i % 5 == 0) {
					ctx.moveTo(0+radius[3]*Math.cos(angle),0+radius[3]*Math.sin(angle));
					ctx.lineTo(0+radius[5]*Math.cos(angle),0+radius[5]*Math.sin(angle));
				} else {
					ctx.moveTo(0+radius[4]*Math.cos(angle),0+radius[4]*Math.sin(angle));
					ctx.lineTo(0+radius[5]*Math.cos(angle),0+radius[5]*Math.sin(angle));			
				}
				angle += Math.PI / 180;
			}
		}
		ctx.stroke();
		
		/*if (true) { // draw rotate pos
			obj._rotatePos1 = [0.5*obj.radius*Math.cos(obj.angle+0*Math.PI),0.5*obj.radius*Math.sin(obj.angle+0*Math.PI)];
			obj._rotatePos2 = [0.5*obj.radius*Math.cos(obj.angle+Math.PI),0.5*obj.radius*Math.sin(obj.angle+Math.PI)];
			console.log(obj._rotatePos1,obj._rotatePos2);
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#333';
			if (typeof ctx.setLineDash === 'function') ctx.setLineDash([5,5]);
			ctx.beginPath();
			ctx.moveTo(obj._rotatePos1[0]-25,obj._rotatePos1[1]);
			ctx.arc(obj._rotatePos1[0],obj._rotatePos1[1],25,0,2*Math.PI);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(obj._rotatePos2[0]-25,obj._rotatePos2[1]);
			ctx.arc(obj._rotatePos2[0],obj._rotatePos2[1],25,0,2*Math.PI);
			ctx.stroke();
			if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
		}*/
		
		ctx.restore();
	},
	getRect: function (obj) {
		if (obj.protractorMode === 'static') {
			var c = obj.center;
			var r = obj.radius;
			return [c[0]-r,c[1]-r,2*r,2*r];
		} else if (!un(obj.button)) {
			return [obj.button[0],obj.button[1],55,55];
		} else {
			return [20,20,55,55];
		}
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		if (!un(obj.button)) {
			obj.button[0] += dl;
			obj.button[1] += dt;
		}
	},
	getCursorPositionsInteract: function (obj, path) {
		if (obj.protractorMode === 'static' || obj._disabled === true) return [];
		var pos = [];
		if (obj.protractorVisible === true) { //&& ['pen','line','eraser','interactText','point'].indexOf(draw.drawMode) === -1) {
			pos.push({
				shape: 'sector',
				dims: [obj.center[0],obj.center[1],obj.radius,obj.angle+Math.PI,obj.angle+2*Math.PI],
				cursor: draw.cursors.move1,
				func: draw.protractor2.moveProtractorStart,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			var x1 = obj.center[0]+0.5*obj.radius*Math.cos(obj.angle+Math.PI);
			var y1 = obj.center[1]+0.5*obj.radius*Math.sin(obj.angle+Math.PI);
			pos.push({
				shape: 'sector',
				dims: [x1,y1,obj.radius/2,obj.angle+Math.PI,obj.angle+(5/4)*Math.PI],
				cursor: draw.cursors.rotate,
				func: draw.protractor2.rotateProtractorStart,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			var x2 = obj.center[0]+0.5*obj.radius*Math.cos(obj.angle);
			var y2 = obj.center[1]+0.5*obj.radius*Math.sin(obj.angle);
			pos.push({
				shape: 'sector',
				dims: [x2,y2,obj.radius/2,obj.angle+(7/4)*Math.PI,obj.angle+2*Math.PI],
				cursor: draw.cursors.rotate,
				func: draw.protractor2.rotateProtractorStart,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
		}
		if (!un(obj.button)) {
			pos.push({
				shape: 'rect',
				dims: [obj.button[0],obj.button[1],55,55],
				cursor: draw.cursors.pointer,
				func: draw.protractor2.toggleProtractorVisible,
				interact: true,
				path: path,
				obj: obj
			});
		}
		return pos;
	},
	getCursorPositionsSelected: function(obj, pathNum) {
		var pos = [];
		if (obj.protractorMode === 'static') {
			pos.push({
				shape: 'sector',
				dims: [obj.center[0],obj.center[1],obj.radius,obj.angle+Math.PI,obj.angle+2*Math.PI],
				cursor: draw.cursors.move1,
				func: draw.protractor2.moveProtractorStart,
				path: obj._path,
				obj: obj
			});
			var x1 = obj.center[0]+0.5*obj.radius*Math.cos(obj.angle+Math.PI);
			var y1 = obj.center[1]+0.5*obj.radius*Math.sin(obj.angle+Math.PI);
			pos.push({
				shape: 'sector',
				dims: [x1,y1,obj.radius/2,obj.angle+Math.PI,obj.angle+(5/4)*Math.PI],
				cursor: draw.cursors.rotate,
				func: draw.protractor2.rotateProtractorStart,
				path: obj._path,
				obj: obj
			});
			var x2 = obj.center[0]+0.5*obj.radius*Math.cos(obj.angle);
			var y2 = obj.center[1]+0.5*obj.radius*Math.sin(obj.angle);
			pos.push({
				shape: 'sector',
				dims: [x2,y2,obj.radius/2,obj.angle+(7/4)*Math.PI,obj.angle+2*Math.PI],
				cursor: draw.cursors.rotate,
				func: draw.protractor2.rotateProtractorStart,
				path: obj._path,
				obj: obj
			});			
		}
		return pos;
	},
	toggleProtractorVisible: function() {
		var obj = draw.currCursor.obj;
		if (un(obj._startVisible)) obj._startVisible = obj.protractorVisible;
		obj.protractorVisible = !obj.protractorVisible;
		if (obj.protractorVisible === true) {
			draw.movePathToFront(obj._path);
			obj._opened = true;
		}
		drawCanvasPaths();
	},
	moveProtractorStart: function() {
		var obj = draw.currCursor.obj;
		if (un(obj._startCenter)) obj._startCenter = clone(obj.center);
		if (un(obj._startAngle)) obj._startAngle = obj.angle;
		draw.movePathToFront(obj._path);
		draw._drag = {
			obj: obj,
			offset: [obj.center[0]-draw.mouse[0],obj.center[1]-draw.mouse[1]]
		};
		if (!un(obj._taskQuestion)) {
			draw._drag.dragArea = [obj._taskQuestion.left+30,obj._taskQuestion.top+30,obj._taskQuestion.widths[0]-50-60,obj._taskQuestion.heights[0]-60];
		} else if (!un(file) && file.constructionsTool === true) {
			draw._drag.dragArea = [50,50,1100,1600];
		}
		draw.animate(draw.protractor2.moveProtractorMove,draw.protractor2.moveProtractorStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.cursorOverride = draw.cursors.move2;
	},
	moveProtractorMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var offset = draw._drag.offset;
		if (!un(draw._drag.dragArea)) {
			obj.center = [
				Math.min(draw._drag.dragArea[0]+draw._drag.dragArea[2],Math.max(draw._drag.dragArea[0],draw.mouse[0]+offset[0])),
				Math.min(draw._drag.dragArea[1]+draw._drag.dragArea[3],Math.max(draw._drag.dragArea[1],draw.mouse[1]+offset[1]))
			];
		} else {
			obj.center = [draw.mouse[0]+offset[0],draw.mouse[1]+offset[1]];
		}
		if (snapToObj2On || draw.snapLinesTogether) obj.center = snapToObj2(obj.center);
	},
	moveProtractorStop: function() {
		delete draw._drag;
		delete draw.cursorOverride;
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
	},
	rotateProtractorStart: function() {
		var obj = draw.currCursor.obj;
		if (un(obj._startCenter)) obj._startCenter = clone(obj.center);
		if (un(obj._startAngle)) obj._startAngle = obj.angle;
		draw.movePathToFront(obj._path);
		draw._drag = {
			obj: obj,
			offsetAngle: getAngleTwoPoints(obj.center,draw.mouse)-obj.angle
		};
		draw.animate(draw.protractor2.rotateProtractorMove,draw.protractor2.rotateProtractorStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.rotate;
		draw.lockCursor = draw.cursors.rotate;
	},
	rotateProtractorMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		obj.angle = getAngleTwoPoints(obj.center,draw.mouse)-draw._drag.offsetAngle;
	},
	rotateProtractorStop: function() {
		delete draw._drag;
		delete draw.lockCursor;
	}
}
draw.ruler2 = {
	resizable: false,
	drawToolsButton:true,
	//allowQuickDraw: false,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var obj = {
			type: 'ruler2',
			rect:[center[0]-400,center[1]-50,800,100],
			angle:0,
			color:'#CCF',
			opacity:0.25,
			markings:true,
			button:[20,20],
			rulerVisible:true,
			drawColor:'#00F'
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
	},
	drawOverlay: function(ctx, obj, path) {
		if (!un(obj.button)) {
			ctx.translate(obj.button[0], obj.button[1]);		
			var color = obj.rulerVisible == true ? draw.buttonSelectedColor : draw.buttonColor;
			roundedRect(ctx,3,3,49,49,8,6,'#000',color);
			if (obj.rulerVisible == true) {
				roundedRect(ctx,7.5,22.5,40,10,3,1,'#000');
			} else {
				roundedRect(ctx,7.5,22.5,40,10,3,1,'#000','#CCF');
				if (obj.markings == true) {
					ctx.lineWidth = 1;
					ctx.strokeStyle = '#000';
					ctx.beginPath();
					for (var i = 0; i < 11; i++) {
						ctx.moveTo(9.5+i*(36/10),22.5);
						ctx.lineTo(9.5+i*(36/10),26.5);				
					}
					ctx.stroke();
				}
			}
			ctx.translate(-obj.button[0], -obj.button[1]);
		}
		if (obj.rulerVisible !== false || draw.mode === 'edit' && path.selected === true) {
			var left = obj.rect[0];
			var top = obj.rect[1];
			var width = obj.rect[3];
			var length = obj.rect[2];
			var measure = obj.measure || 150;
			var color = obj.color;
			var opacity = obj.opacity;	
			var angle = obj.angle;
			
			var fontSize = width / 6;
			
			ctx.save();
			ctx.translate(left, top);
			ctx.rotate(angle);
			ctx.beginPath();
			
			var colorRGB = hexToRgb(color);
			ctx.fillStyle = "rgba("+colorRGB.r+","+colorRGB.g+","+colorRGB.b+","+opacity+")";
			roundedRect(ctx, 0, 0, length, width, 8, 1, "rgba(0,0,0,0)", "rgba("+colorRGB.r+","+colorRGB.g+","+colorRGB.b+","+opacity+")");

			if (obj.markings == true) {
				var xPos = 16;
				var dx = 5.12; //(length - 32) / measure;
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.fillStyle = '#000';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.font = fontSize + 'px Arial';
				for (var dCount = 0; dCount <= measure; dCount++) {
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
				if (obj.button180 !== false) {
					ctx.beginPath();
					ctx.moveTo(length*0.5,0.5*width);
					ctx.lineTo(length*0.51,0.6*width);
					ctx.lineTo(length*0.49,0.6*width);
					ctx.lineTo(length*0.5,0.5*width);
					ctx.fill();
				}
			}
			
			obj._rotatePos1 = [left+35*Math.cos(-angle)+(width-35)*Math.sin(-angle),top-35*Math.sin(-angle)+(width-35)*Math.cos(-angle),25];
			obj._rotatePos2 = [left+(length-35)*Math.cos(-angle)+(width-35)*Math.sin(-angle),top-(length-35)*Math.sin(-angle)+(width-35)*Math.cos(-angle),25];
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#333';
			if (typeof ctx.setLineDash === 'function') ctx.setLineDash([5,5]);
			ctx.beginPath();
			ctx.moveTo(60,width-35);
			ctx.arc(35,width-35,25,0,2*Math.PI);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(length-10,width-35);
			ctx.arc(length-35,width-35,25,0,2*Math.PI);
			ctx.stroke();
			if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
			
			ctx.restore();
		}	
	},
	getRect: function (obj) {
		if (!un(obj.button)) {
			return [obj.button[0],obj.button[1],55,55];
		} else {
			return [20,20,55,55];
		}
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.button[0] += dl;
		obj.button[1] += dt;
		obj.rect[0] += dl;
		obj.rect[1] += dt;
	},
	getCursorPositionsInteract: function (obj, path) {
		if (obj._disabled === true) return [];
		var pos = [];
		if (obj.rulerVisible === true) { //&& ['pen','line','eraser','interactText','point'].indexOf(draw.drawMode) === -1) {
			var left = obj.rect[0];
			var top = obj.rect[1];
			var width = obj.rect[3];
			var length = obj.rect[2];
			var angle = obj.angle;
			obj._centerX1 = left+0.02*length*Math.cos(angle);
			obj._centerY1 = top+0.02*length*Math.sin(angle);	
			obj._centerX2 = left+0.98*length*Math.cos(angle);
			obj._centerY2 = top+0.98*length*Math.sin(angle);	
			obj._verticesArray1 = [
				[left,top],
				[left+length*Math.cos(angle),top+length*Math.sin(angle)],
				[left+length*Math.cos(angle)-width*Math.sin(angle),top+length*Math.sin(angle)+width*Math.cos(angle)],
				[left-width*Math.sin(angle),top+width*Math.cos(angle)]
			];
			obj._verticesArray2 = [
				[left,top],
				[left+0.1*length*Math.cos(angle),top+0.1*length*Math.sin(angle)],
				[left-width*Math.sin(angle)+0.1*length*Math.cos(angle),top+width*Math.cos(angle)+0.1*length*Math.sin(angle)],
				[left-width*Math.sin(angle),top+width*Math.cos(angle)]
			];
			obj._verticesArray3 = [
				[left+length*Math.cos(angle)-0.1*length*Math.cos(angle),top+length*Math.sin(angle)-0.1*length*Math.sin(angle)],
				[left+length*Math.cos(angle),top+length*Math.sin(angle)],
				[left+length*Math.cos(angle)-width*Math.sin(angle),top+length*Math.sin(angle)+width*Math.cos(angle)],
				[left+length*Math.cos(angle)-width*Math.sin(angle)-0.1*length*Math.cos(angle),top+length*Math.sin(angle)+width*Math.cos(angle)-0.1*length*Math.sin(angle)]
			];
			obj._rotatePos1 = [left+35*Math.cos(-angle)+(width-35)*Math.sin(-angle),top-35*Math.sin(-angle)+(width-35)*Math.cos(-angle),25];
			obj._rotatePos2 = [left+(length-35)*Math.cos(-angle)+(width-35)*Math.sin(-angle),top-(length-35)*Math.sin(-angle)+(width-35)*Math.cos(-angle),25];
			obj._center = [
				left+0.5*length*Math.cos(angle)-0.5*width*Math.sin(angle),
				top+0.5*length*Math.sin(angle)+0.5*width*Math.cos(angle)
			];
			obj._centerRel = [
				0.5*length*Math.cos(angle)-0.5*width*Math.sin(angle),
				0.5*length*Math.sin(angle)+0.5*width*Math.cos(angle)
			];
			
			obj._verticesArray4 = [
				[left+40*Math.sin(angle),top-40*Math.cos(angle)],
				[left+length*Math.cos(angle)+40*Math.sin(angle),top+length*Math.sin(angle)-40*Math.cos(angle)],
				[left+length*Math.cos(angle),top+length*Math.sin(angle)],
				[left,top]
			];
			if (obj.markings == true) {
				obj._edgePos1 = [
					left+0.02*length*Math.cos(angle)+(0.5*draw.thickness+2)*Math.sin(angle),
					top+0.02*length*Math.sin(angle)-(0.5*draw.thickness+2)*Math.cos(angle)
				];
				obj._edgePos2 = [
					left+0.98*length*Math.cos(angle)+(0.5*draw.thickness+2)*Math.sin(angle),
					top+0.98*length*Math.sin(angle)-(0.5*draw.thickness+2)*Math.cos(angle)
				];
			} else {
				obj._edgePos1 = [
					left+(0.5*draw.thickness+2)*Math.sin(angle),
					top-(0.5*draw.thickness+2)*Math.cos(angle)
				];
				obj._edgePos2 = [
					left+length*Math.cos(angle)+(0.5*draw.thickness+2)*Math.sin(angle),
					top+length*Math.sin(angle)-(0.5*draw.thickness+2)*Math.cos(angle)
				];
			}
			
			obj._verticesArray5 = [
				[left-width*Math.sin(angle)-40*Math.sin(angle),top+width*Math.cos(angle)+40*Math.cos(angle)],
				[left+length*Math.cos(angle)-width*Math.sin(angle)-40*Math.sin(angle),top+length*Math.sin(angle)+width*Math.cos(angle)+40*Math.cos(angle)],
				[left+length*Math.cos(angle)-width*Math.sin(angle),top+length*Math.sin(angle)+width*Math.cos(angle)],
				[left-width*Math.sin(angle),top+width*Math.cos(angle)],
			];
			obj._edgePos3 = [
				left-width*Math.sin(angle)-(0.5*draw.thickness+2)*Math.sin(angle),
				top+width*Math.cos(angle)+(0.5*draw.thickness+2)*Math.cos(angle)
			];
			obj._edgePos4 = [
				left+length*Math.cos(angle)-width*Math.sin(angle)-(0.5*draw.thickness+2)*Math.sin(angle),
				top+length*Math.sin(angle)+width*Math.cos(angle)+(0.5*draw.thickness+2)*Math.cos(angle)
			];	
			
			var color = !un(obj.drawColor) ? obj.drawColor : (!un(obj._taskQuestion) && !un(obj._taskQuestion.drawToolsStyle) && !un(obj._taskQuestion.drawToolsStyle.color)) ? obj._taskQuestion.drawToolsStyle.color : draw.color;
			if (draw.color !== color) {
				var saveColor = draw.color;
				draw.color = color;
				draw.cursors.update();
				obj._penCursor1 = draw.cursors.pen;
				draw.color = saveColor;
				draw.cursors.update();
			} else {
				obj._penCursor1 = draw.cursors.pen;
			}

			pos.push({
				shape: 'polygon',
				dims: obj._verticesArray1,
				cursor: draw.cursors.move1,
				func: draw.ruler2.moveRulerStart,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			pos.push({
				shape: 'circle',
				dims: obj._rotatePos1,
				cursor: draw.cursors.rotate,
				func: draw.ruler2.rotateRulerStart1,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			pos.push({
				shape: 'circle',
				dims: obj._rotatePos2,
				cursor: draw.cursors.rotate,
				func: draw.ruler2.rotateRulerStart2,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			/*pos.push({
				shape: 'polygon',
				dims: obj._verticesArray2,
				cursor: draw.cursors.rotate,
				func: draw.ruler2.rotateRulerStart1,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			pos.push({
				shape: 'polygon',
				dims: obj._verticesArray3,
				cursor: draw.cursors.rotate,
				func: draw.ruler2.rotateRulerStart2,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});*/
			if (obj.markings === true && obj.button180 !== false) {		
				pos.push({
					shape: 'circle',
					dims: [obj._center[0],obj._center[1],25],
					cursor: draw.cursors.pointer,
					func: draw.ruler2.rotateRuler180,
					interact: true,
					path: path,
					obj: obj,
					overlay:true
				});
			}
			pos.push({
				shape: 'polygon',
				dims: obj._verticesArray4,
				cursor: obj._penCursor1,
				//cursor: draw.cursors.pen,
				func: draw.ruler2.drawRulerStart1,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			pos.push({
				shape: 'polygon',
				dims: obj._verticesArray5,
				cursor: obj._penCursor1,
				//cursor: draw.cursors.pen,
				func: draw.ruler2.drawRulerStart2,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			
		}
		if (!un(obj.button)) {
			pos.push({
				shape: 'rect',
				dims: [obj.button[0],obj.button[1],55,55],
				cursor: draw.cursors.pointer,
				func: draw.ruler2.toggleRulerVisible,
				interact: true,
				path: path,
				obj: obj
			});
		}
		return pos;
	},
	getCursorPositionsSelected: function(obj, pathNum) {
		return [];
	},
	toggleRulerVisible: function() {
		var obj = draw.currCursor.obj;
		if (un(obj._startVisible)) obj._startVisible = obj.rulerVisible;
		obj.rulerVisible = !obj.rulerVisible;
		if (obj.rulerVisible === true) {
			obj._opened = true;
			draw.movePathToFront(obj._path);
		}
		drawCanvasPaths();
	},
	moveRulerStart: function() {
		var obj = draw.currCursor.obj;
		draw.movePathToFront(obj._path);
		if (un(obj._startCenter)) obj._startCenter = [obj.rect[0],obj.rect[1]];
		if (un(obj._startAngle)) obj._startAngle = obj.angle;
		draw._drag = {
			obj: obj,
			offset: [obj.rect[0]-draw.mouse[0],obj.rect[1]-draw.mouse[1]],
			snapPointOffset: [16*Math.cos(obj.angle),16*Math.sin(obj.angle)]
		};
		if (!un(obj._taskQuestion)) {
			draw._drag.dragArea = [obj._taskQuestion.left+0,obj._taskQuestion.top+0,obj._taskQuestion.widths[0]-50-0,obj._taskQuestion.heights[0]-0];
		} else if (!un(file) && file.constructionsTool === true) {
			draw._drag.dragArea = [50,50,1100,1600];
		}
		draw.animate(draw.ruler2.moveRulerMove,draw.ruler2.moveRulerStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.lockCursor = draw.cursors.move2;
	},
	moveRulerMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var pos = vector.addVectors(draw.mouse,draw._drag.offset);
		if (snapToObj2On || draw.snapLinesTogether) {
			pos[0] += draw._drag.snapPointOffset[0];
			pos[1] += draw._drag.snapPointOffset[1];
			pos = snapToObj2(pos);
			pos[0] -= draw._drag.snapPointOffset[0];
			pos[1] -= draw._drag.snapPointOffset[1];
		}
		if (!un(draw._drag.dragArea)) {
			var v = [ // vector from top left to center of ruler
				0.5*obj.rect[2]*Math.cos(obj.angle)-0.5*obj.rect[3]*Math.sin(obj.angle),
				0.5*obj.rect[2]*Math.sin(obj.angle)+0.5*obj.rect[3]*Math.cos(obj.angle)
			]
			var minX = draw._drag.dragArea[0] - v[0];
			var maxX = draw._drag.dragArea[0] + draw._drag.dragArea[2] - v[0];
			obj.rect[0] = Math.max(minX,Math.min(maxX,pos[0]));
			var minY = draw._drag.dragArea[1] - v[1];
			var maxY = draw._drag.dragArea[1] + draw._drag.dragArea[3] - v[1];
			obj.rect[1] = Math.max(minY,Math.min(maxY,pos[1]));
		} else {
			obj.rect[0] = pos[0];
			obj.rect[1] = pos[1];
		}
	},
	moveRulerStop: function() {
		delete draw._drag;
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		delete draw.lockCursor;
	},
	rotateRulerStart1: function() {
		var obj = draw.currCursor.obj;
		draw.movePathToFront(obj._path);
		var pivot = [obj.rect[0]+(obj.rect[2]-32)*Math.cos(obj.angle),obj.rect[1]+(obj.rect[2]-32)*Math.sin(obj.angle)];
		var relOffsetAngle = getAngleTwoPoints(pivot,draw.mouse)-obj.angle;
		draw._drag = {
			obj: obj,
			pivot:pivot,
			relOffsetAngle:relOffsetAngle
		};
		if (!un(obj._taskQuestion)) {
			draw._drag.dragArea = [obj._taskQuestion.left+0,obj._taskQuestion.top+0,obj._taskQuestion.widths[0]-50-0,obj._taskQuestion.heights[0]-0];
		}
		draw.animate(draw.ruler2.rotateRulerMove1,draw.ruler2.rotateRulerStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.rotate;
		draw.cursorOverride = draw.cursors.rotate;
		draw.lockCursor = draw.cursors.rotate;
	},
	rotateRulerMove1: function(e) {
		updateMouse(e);		
		var obj = draw._drag.obj;
		var pivot = draw._drag.pivot;
		var angle = getAngleTwoPoints(pivot,draw.mouse)-draw._drag.relOffsetAngle;
		var x = pivot[0]-(obj.rect[2]-32)*Math.cos(angle);
		var y = pivot[1]-(obj.rect[2]-32)*Math.sin(angle)
		if (!un(draw._drag.dragArea)) { // check center of ruler remains in dragArea
			var dragArea = draw._drag.dragArea;
			var cx = x+0.5*obj.rect[2]*Math.cos(angle)-0.5*obj.rect[3]*Math.sin(angle);
			if (cx < dragArea[0] || cx > dragArea[0] + dragArea[2]) return;
			var cy = y+0.5*obj.rect[2]*Math.sin(angle)+0.5*obj.rect[3]*Math.cos(angle);
			if (cy < dragArea[1] || cy > dragArea[1] + dragArea[3]) return;
		}
		obj.angle = angle;
		obj.rect[0] = x;
		obj.rect[1] = y;
	},
	rotateRulerStart2: function() {
		var obj = draw.currCursor.obj;
		draw.movePathToFront(obj._path);
		var pivot = [obj.rect[0]+16*Math.cos(obj.angle),obj.rect[1]+16*Math.sin(obj.angle)];
		var relOffsetAngle = getAngleTwoPoints(pivot,draw.mouse)-obj.angle;
		draw._drag = {
			obj: obj,
			pivot:pivot,
			relOffsetAngle:relOffsetAngle
		};
		if (!un(obj._taskQuestion)) {
			draw._drag.dragArea = [obj._taskQuestion.left+0,obj._taskQuestion.top+0,obj._taskQuestion.widths[0]-50-0,obj._taskQuestion.heights[0]-0];
		}
		draw.animate(draw.ruler2.rotateRulerMove2,draw.ruler2.rotateRulerStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.rotate;
		draw.cursorOverride = draw.cursors.rotate;
		draw.lockCursor = draw.cursors.rotate;
	},
	rotateRulerMove2: function(e) {
		updateMouse(e);		
		var obj = draw._drag.obj;
		var pivot = draw._drag.pivot;
		var angle = getAngleTwoPoints(pivot,draw.mouse)-draw._drag.relOffsetAngle;
		var x = pivot[0]-16*Math.cos(angle);
		var y = pivot[1]-16*Math.sin(angle)
		if (!un(draw._drag.dragArea)) { // check center of ruler remains in dragArea
			var dragArea = draw._drag.dragArea;
			var cx = x+0.5*obj.rect[2]*Math.cos(angle)-0.5*obj.rect[3]*Math.sin(angle);
			if (cx < dragArea[0] || cx > dragArea[0] + dragArea[2]) return;
			var cy = y+0.5*obj.rect[2]*Math.sin(angle)+0.5*obj.rect[3]*Math.cos(angle);
			if (cy < dragArea[1] || cy > dragArea[1] + dragArea[3]) return;
		}
		obj.angle = angle;
		obj.rect[0] = x;
		obj.rect[1] = y;
	},
	rotateRulerStop: function() {
		delete draw._drag;
		delete draw.cursorOverride;
		delete draw.lockCursor;
	},
	rotateRuler180: function() {
		var obj = draw.currCursor.obj;
		draw.movePathToFront(obj._path);
		if (un(obj._startCenter)) obj._startCenter = [obj.rect[0],obj.rect[1]];
		if (un(obj._startAngle)) obj._startAngle = obj.angle;
		obj.angle += Math.PI;
		obj.rect[0] += 2*obj._centerRel[0];
		obj.rect[1] += 2*obj._centerRel[1];
		drawCanvasPaths();
	},
	drawRulerStart1: function() {
		var obj = draw.currCursor.obj;
		if (!un(obj._taskQuestion)) {
			var taskQuestion = obj._taskQuestion;
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
		draw.movePathToFront(obj._path);		
		draw.drawing = true;
		var pos = closestPointOnLineSegment(draw.mouse,obj._edgePos1,obj._edgePos2);
		var color = !un(obj.drawColor) ? obj.drawColor : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.color)) ? taskQuestion.drawToolsStyle.color : draw.color;
		var thickness = !un(obj.drawThickness) ? obj.drawThickness : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.thickness)) ? taskQuestion.drawToolsStyle.thickness : draw.thickness;
		var line = {
			type:'line',
			color:color,
			thickness:thickness,
			startPos:pos,
			finPos:pos,
			created:new Date().getTime()
		};
		if (!un(draw.dash) && draw.dash.length > 0) line.dash = clone(draw.dash);
		if (!un(obj._taskQuestion)) line._taskQuestion = obj._taskQuestion;
		var path = {obj:[line],selected:false};
		draw.path.push(path);
		draw._drag = {
			obj: obj,
			line: line,
			path:path
		};
		draw.animate(draw.ruler2.drawRulerMove1,draw.ruler2.drawRulerStop,draw.ruler2.drawRulerDraw);
		//draw.cursorCanvas.style.cursor = draw.currCursor.cursor;
		//draw.cursorOverride = draw.currCursor.cursor;
		draw.lockCursor = true;
	},
	drawRulerStart2: function() {
		var obj = draw.currCursor.obj;
		if (!un(obj._taskQuestion)) {
			var taskQuestion = obj._taskQuestion;
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
		draw.movePathToFront(obj._path);		
		draw.drawing = true;
		var pos = closestPointOnLineSegment(draw.mouse,obj._edgePos3,obj._edgePos4);
		var color = !un(obj.drawColor) ? obj.drawColor : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.color)) ? taskQuestion.drawToolsStyle.color : draw.color;
		var thickness = !un(obj.drawThickness) ? obj.drawThickness : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.thickness)) ? taskQuestion.drawToolsStyle.thickness : draw.thickness;
		var line = {
			type:'line',
			color:color,
			thickness:thickness,
			startPos:pos,
			finPos:pos,
			created:new Date().getTime()
		};
		if (!un(draw.dash) && draw.dash.length > 0) line.dash = clone(draw.dash);
		if (!un(obj._taskQuestion)) line._taskQuestion = obj._taskQuestion;
		var path = {obj:[line],selected:false};
		draw.path.push(path);
		draw._drag = {
			obj: obj,
			line: line,
			path: path
		};
		draw.animate(draw.ruler2.drawRulerMove2,draw.ruler2.drawRulerStop,draw.ruler2.drawRulerDraw);
		//draw.cursorCanvas.style.cursor = draw.currCursor.cursor;
		//draw.cursorOverride = draw.currCursor.cursor;
		draw.lockCursor = true;
	},
	drawRulerDraw: function() {
		if (un(draw._drag)) return;
		var canvas = draw.drawCanvas[1];
		canvas.ctx.clear();
		drawPathsToCanvas(canvas,[draw._drag.path]);
		if (!un(canvas._paths)) drawPathsToCanvas(canvas,canvas._paths);
		
		var canvas2 = draw.drawCanvas[2];
		canvas2.ctx.clear();
		if (!un(canvas2._paths)) drawPathsToCanvas(canvas2,canvas2._paths);
		if (!un(canvas2._overlayObjs)) {
			for (var i = 0; i < canvas2._overlayObjs.length; i++) {
				var obj = canvas2._overlayObjs[i];
				draw[obj.type].drawOverlay(canvas2.ctx,obj,obj._path);
			}
		}
		if (!un(canvas2._overlayLast)) drawPathsToCanvas(canvas2,canvas2._overlayLast);
	},
	drawRulerMove1: function(e) {
		updateMouse(e);		
		var obj = draw._drag.obj;	
		draw._drag.line.finPos = closestPointOnLineSegment(draw.mouse,obj._edgePos1,obj._edgePos2);
	},
	drawRulerMove2: function(e) {
		updateMouse(e);		
		var obj = draw._drag.obj;
		draw._drag.line.finPos = closestPointOnLineSegment(draw.mouse,obj._edgePos3,obj._edgePos4);		
	},
	drawRulerStop: function() {
		if (isEqual(draw._drag.line.startPos,draw._drag.line.finPos)) {
			var index = draw.path.indexOf(draw._drag.path);
			if (index > -1) draw.path.splice(index,1);
		}
		delete draw._drag;
		//delete draw.cursorOverride;
		draw.drawing = false;
		delete draw.lockCursor;
		drawCanvasPaths();
		calcCursorPositions();
		lineDrawStop();
	}
}
draw.compass2 = {
	resizable: false,
	drawToolsButton:true,
	//allowQuickDraw: false,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'compass2',
			armLength:250,
			radius:150,
			angle:0,
			center1:center,
			radiusLocked:false,
			compassVisible:true,
			button:[20,20],
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
	},
	drawOverlay: function(ctx, obj, path) {
		if (!un(obj.button)) {
			ctx.translate(obj.button[0], obj.button[1]);		
			var color = obj.compassVisible == true ? draw.buttonSelectedColor : draw.buttonColor;
			roundedRect(ctx,3,3,49,49,8,6,'#000',color);

			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';

			var center1 = [13, 45];
			var center2 = [26, 15];
			var center3 = [40, 45];
			var armLength = Math.sqrt(Math.pow(0.5 * (center3[0] - center1[0]), 2) + Math.pow(center2[1] - center1[1], 2));

			var angle2 = -0.5 * Math.PI - Math.atan((center2[1] - center1[1]) / (center2[0] - center1[0]));
			var angle3 = 0.5 * Math.PI - Math.atan((center3[1] - center2[1]) / (center3[0] - center2[0]));

			// draw pointy arm
			ctx.translate(center2[0], center2[1]);
			ctx.rotate(-angle2);

			if (draw.compassVisible) {
				roundedRect(ctx, -2, 0, 4, armLength - 5, 1, 1, '#000');
			} else {
				roundedRect(ctx, -2, 0, 4, armLength - 5, 1, 1, '#000', '#99F');
			}
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 0.5;
			ctx.beginPath();
			ctx.moveTo(-1, armLength - 5);
			ctx.lineTo(0, armLength);
			ctx.lineTo(1, armLength - 5);
			ctx.lineTo(-1, armLength - 5);
			ctx.stroke();
			if (draw.compassVisible) {
				ctx.fillStyle = '#333';
				ctx.fill();
			}

			ctx.rotate(angle2);
			ctx.translate(-center2[0], -center2[1]);

			//draw pencil
			var pencilColor = !un(obj.color) ? obj.color : (!un(obj._taskQuestion) && !un(obj._taskQuestion.drawToolsStyle) && !un(obj._taskQuestion.drawToolsStyle.color)) ? obj._taskQuestion.drawToolsStyle.color : draw.color;
			if (pencilColor === '#000') pencilColor = '#FC3';
			
			ctx.beginPath();
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			ctx.moveTo(40, 45);
			ctx.lineTo(38, 42);
			ctx.lineTo(38, 25);
			ctx.lineTo(42, 25);
			ctx.lineTo(42, 42);
			ctx.lineTo(40, 45);
			if (!draw.compassVisible) {
				ctx.fillStyle = pencilColor;
				ctx.fill();
			}
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(40, 45);
			ctx.lineTo(38, 42);
			ctx.lineTo(42, 42);
			ctx.lineTo(40, 45);
			if (!draw.compassVisible) {
				ctx.fillStyle = '#FFC';
				ctx.fill();
			}
			ctx.stroke();
			ctx.beginPath();
			ctx.fillStyle = pencilColor;
			ctx.moveTo(40, 45);
			ctx.lineTo(39.5, 44.3);
			ctx.lineTo(40.5, 45.7);
			ctx.lineTo(40, 45);
			ctx.fill();
			ctx.stroke();

			ctx.strokeRect(44, 15 + armLength * 0.5, 1, 5);

			// draw pencil arm
			ctx.translate(center2[0], center2[1]);
			ctx.rotate(-angle3);

			var pAngle = Math.PI / 14;

			ctx.beginPath();
			ctx.moveTo(-2, 0);
			ctx.lineTo(2, 0);
			ctx.lineTo(2, armLength * 0.7);
			ctx.lineTo(6, armLength * 0.7);
			ctx.lineTo(6, armLength * 0.7 + 4);
			ctx.lineTo(-2, armLength * 0.7);
			ctx.lineTo(-2, 0);
			ctx.stroke();
			if (!draw.compassVisible) {
				ctx.fillStyle = '#99F';
				ctx.fill();
			}

			if (!draw.compassVisible) {
				ctx.fillRect(6.5, armLength * 0.5 - 0.5, 1, 5);
			}

			ctx.rotate(angle3);
			ctx.translate(-center2[0], -center2[1]);

			// draw top of compass
			ctx.translate(center2[0], center2[1]);

			roundedRect(ctx, -2.5, -3, 5, 7, 1, 1, '#000', '#000');
			roundedRect(ctx, -1, -6, 2, 3, 0, 1, '#000', '#000');
			ctx.fillStyle = '#CCC';
			ctx.beginPath();
			ctx.arc(0, 0, 1, 0, 2 * Math.PI);
			ctx.fill();

			ctx.translate(-center2[0], -center2[1]);
			ctx.translate(-obj.button[0], -obj.button[1]);
		}
		if (obj.compassVisible !== false || draw.mode === 'edit' && path.selected === true) {
			draw.compass2.recalc(obj);
			
			var armLength = obj.armLength;				
			var center1 = obj.center1;				
			var rad = obj.radius;	
			var angle = obj.angle;
					
			var h = obj._h;
			var center2 = obj._center2;
			var center3 = obj._center3;
			
			var drawOn = obj._drawOn;
			
			ctx.save();
			if (obj.radiusLocked == true || obj.mode == 'draw' || obj._drawing === true) {
				// draw lock button
				ctx.translate(center2[0],center2[1]);
				if (drawOn == 'right') {
					ctx.rotate(obj.angle);
				} else {
					ctx.rotate(obj.angle + Math.PI);			
				}
			
				var lockHeight = 0.5 * obj._h;
			
				//bar	
				ctx.fillStyle = '#99F';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(-0.25*obj.radius,lockHeight-5,0.5*obj.radius,10);
				ctx.strokeRect(-0.25*obj.radius,lockHeight-5,0.5*obj.radius,10);

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
					ctx.rotate(-obj.angle);
				} else {
					ctx.rotate(-obj.angle - Math.PI);			
				}
				ctx.translate(-center2[0],-center2[1]);
			} else {
				// draw lock button
				ctx.translate(center2[0],center2[1]);
				if (drawOn == 'right') {
					ctx.rotate(obj.angle);
				} else {
					ctx.rotate(obj.angle + Math.PI);			
				}
					
				var lockHeight = 0.5 * obj._h;
			
				//bar	
				ctx.fillStyle = '#999';
				ctx.strokeStyle = '#999';
				ctx.lineWidth = 2;
				ctx.strokeRect(-0.25*obj.radius,lockHeight-5,0.5*obj.radius,10);

				//circle
				ctx.fillStyle = '#FFF';
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
				ctx.fillStyle = '#FFF';
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
					ctx.rotate(-obj.angle);
				} else {
					ctx.rotate(-obj.angle - Math.PI);			
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
			var pencilColor = !un(obj.color) ? obj.color : (!un(obj._taskQuestion) && !un(obj._taskQuestion.drawToolsStyle) && !un(obj._taskQuestion.drawToolsStyle.color)) ? obj._taskQuestion.drawToolsStyle.color : draw.color;
			if (pencilColor === '#000') pencilColor = '#FC3';
			
			ctx.translate(0,armLength);
			ctx.rotate(pAngle);
			
			ctx.beginPath();
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			ctx.fillStyle = pencilColor;
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
			ctx.fillStyle = pencilColor;
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
				ctx.rotate(obj.angle);
			} else {
				ctx.rotate(obj.angle + Math.PI);		
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
				ctx.rotate(-obj.angle);
			} else {
				ctx.rotate(-obj.angle - Math.PI);		
			}
			ctx.translate(-center2[0],-center2[1]);			
			ctx.restore();
		}	
	},
	recalc: function(obj) {
		if (!un(obj._lastCalcValues)) {
			if (obj._lastCalcValues.armLength === obj.armLength && obj._lastCalcValues.radius === obj.radius && obj._lastCalcValues.angle === obj.angle && obj._lastCalcValues.center1X === obj.center1[0] && obj._lastCalcValues.center1Y === obj.center1[1]) return;
		}
		
		var armLength = obj.armLength;				
		var center1 = obj.center1;				
		var rad = obj.radius;	
		var angle = obj.angle;
		
		obj._h = Math.sqrt(Math.pow(armLength,2)-Math.pow(0.5*rad,2));
		obj._center3 = [center1[0]+rad*Math.cos(angle),center1[1]+rad*Math.sin(angle)];

		var angleX = (obj.angle%(2*Math.PI));
		if (angleX < 0) angleX += 2*Math.PI;
		if (angleX > 0.5 * Math.PI && angleX < 1.5 * Math.PI) {
			obj._drawOn = 'left';	
			obj._center2 = [center1[0]+0.5*rad*Math.cos(angle)-obj._h*Math.sin(angle),center1[1]+0.5*rad*Math.sin(angle)+obj._h*Math.cos(angle)];
		} else {
			obj._drawOn = 'right';
			obj._center2 = [center1[0]+0.5*rad*Math.cos(angle)+obj._h*Math.sin(angle),center1[1]+0.5*rad*Math.sin(angle)-obj._h*Math.cos(angle)];
		}

		var mp1 = midpoint(obj.center1[0],obj.center1[1],obj._center3[0],obj._center3[1]);
		var mp2 = midpoint(obj._center2[0],obj._center2[1],mp1[0],mp1[1]);
		obj._lockCenter = mp2.slice(0);
		
		obj._lastCalcValues = {
			armLength:obj.armLength,
			center1X:obj.center1[0],
			center1Y:obj.center1[1],
			radius:obj.radius,
			angle:obj.angle,
		}
	},
	getRect: function (obj) {
		if (!un(obj.button)) {
			return [obj.button[0],obj.button[1],55,55];
		} else {
			var l = Math.min(obj.center1[0],obj._center2[0],obj._center3[0]);
			var r = Math.max(obj.center1[0],obj._center2[0],obj._center3[0]);
			var t = Math.min(obj.center1[1],obj._center2[1],obj._center3[1]);
			var b = Math.max(obj.center1[1],obj._center2[1],obj._center3[1]);
			return [l,t,r-l,b-t];
			//return [20,20,55,55];
		}
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center1[0] += dl;
		obj.center1[1] += dt;
		if (!un(obj.button)) {
			obj.button[0] += dl;
			obj.button[1] += dt;
		}
	},
	getCursorPositionsInteract: function (obj, path) {
		if (obj._disabled === true) return [];
		var pos = [];
		if (obj.compassVisible === true) { // && ['pen','line','eraser','interactText','point'].indexOf(draw.drawMode) === -1) {
			var angle2 = Math.atan((0.5*obj.radius)/obj._h);
			if (obj._drawOn == 'right') {
				var angle3 = angle2-obj.angle-Math.PI/14;
				var center4 = [obj._center3[0]-200*Math.sin(angle3),obj._center3[1]-200*Math.cos(angle3)];
			} else {
				var angle3 = -(angle2+obj.angle-Math.PI/14);
				var center4 = [obj._center3[0]+200*Math.sin(angle3),obj._center3[1]+200*Math.cos(angle3)];					
			}

			obj._pencilPolygon = [
				[center4[0]+20*Math.cos(angle3),center4[1]-20*Math.sin(angle3)],
				[center4[0]-20*Math.cos(angle3),center4[1]+20*Math.sin(angle3)],
				[obj._center3[0]-20*Math.cos(angle3),obj._center3[1]+20*Math.sin(angle3)],
				[obj._center3[0]+20*Math.cos(angle3),obj._center3[1]-20*Math.sin(angle3)]
			];		
			

			if (obj._drawOn == 'right') {
				obj._topPolygon = [
					[obj._center2[0]-62*Math.sin(-obj.angle)+10*Math.cos(obj.angle),obj._center2[1]-62*Math.cos(obj.angle)-10*Math.sin(-obj.angle)],
					[obj._center2[0]-62*Math.sin(-obj.angle)-10*Math.cos(obj.angle),obj._center2[1]-62*Math.cos(obj.angle)+10*Math.sin(-obj.angle)],
					[obj._center2[0]-10*Math.cos(obj.angle),obj._center2[1]+10*Math.sin(-obj.angle)],
					[obj._center2[0]+10*Math.cos(obj.angle),obj._center2[1]-10*Math.sin(-obj.angle)],
				];
			} else {
				obj._topPolygon = [
					[obj._center2[0]+62*Math.sin(-obj.angle)+10*Math.cos(obj.angle),obj._center2[1]+62*Math.cos(obj.angle)-10*Math.sin(-obj.angle)],
					[obj._center2[0]+62*Math.sin(-obj.angle)-10*Math.cos(obj.angle),obj._center2[1]+62*Math.cos(obj.angle)+10*Math.sin(-obj.angle)],
					[obj._center2[0]-10*Math.cos(obj.angle),obj._center2[1]+10*Math.sin(-obj.angle)],
					[obj._center2[0]+10*Math.cos(obj.angle),obj._center2[1]-10*Math.sin(-obj.angle)],
				];
			}
			
			pos.push({
				shape: 'line',
				dims: [obj._center2,obj._center3,30],
				cursor: draw.cursors.move1,
				func: draw.compass2.moveCompassStart2,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			pos.push({
				shape: 'polygon',
				dims: obj._pencilPolygon,
				cursor: draw.cursors.move1,
				func: draw.compass2.moveCompassStart2,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			pos.push({
				shape: 'line',
				dims: [obj.center1,obj._center2,30],
				cursor: draw.cursors.move1,
				func: draw.compass2.moveCompassStart1,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			pos.push({
				shape: 'polygon',
				dims: obj._topPolygon,
				cursor: draw.cursors.move1,
				func: draw.compass2.moveCompassStart1,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			pos.push({
				shape: 'circle',
				dims: [obj._center2[0],obj._center2[1],40],
				cursor: draw.cursors.rotate,
				func: draw.compass2.drawCompassStart,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			pos.push({
				shape: 'circle',
				dims: [obj._lockCenter[0],obj._lockCenter[1],30],
				cursor: draw.cursors.pointer,
				func: draw.compass2.toggleCompassLock,
				interact: true,
				path: path,
				obj: obj,
				overlay:true
			});
			
		}
		if (!un(obj.button)) {
			pos.push({
				shape: 'rect',
				dims: [obj.button[0],obj.button[1],55,55],
				cursor: draw.cursors.pointer,
				func: draw.compass2.toggleCompassVisible,
				interact: true,
				path: path,
				obj: obj
			});
		}
		return pos;
	},
	getCursorPositionsSelected: function(obj, pathNum) {
		return [];
	},
	toggleCompassVisible: function() {
		var obj = draw.currCursor.obj;
		if (un(obj._startVisible)) obj._startVisible = obj.compassVisible;
		obj.compassVisible = !obj.compassVisible;
		if (obj.compassVisible === true) {
			draw.movePathToFront(obj._path);
			obj._opened = true;
		}
		drawCanvasPaths();
	},
	toggleCompassLock: function() {
		var obj = draw.currCursor.obj;
		draw.movePathToFront(obj._path);
		obj.radiusLocked = !obj.radiusLocked;
		drawCanvasPaths();
	},
	moveCompassStart1: function() {
		var obj = draw.currCursor.obj;
		draw.movePathToFront(obj._path);
		if (un(obj._startCenter1)) obj._startCenter1 = [obj.center1[0],obj.center1[1]];
		if (un(obj._startAngle)) obj._startAngle = obj.angle;
		if (un(obj._startRadius)) obj._startRadius = obj.radius;
		updateSnapPoints();
		draw._drag = {
			obj: obj,
			offset: [obj.center1[0]-draw.mouse[0],obj.center1[1]-draw.mouse[1]]
		};
		if (!un(obj._taskQuestion)) {
			draw._drag.dragArea = [obj._taskQuestion.left+30,obj._taskQuestion.top+30,obj._taskQuestion.widths[0]-50-60,obj._taskQuestion.heights[0]-60];
		} else if (!un(file) && file.constructionsTool === true) {
			draw._drag.dragArea = [0,0,1150,1650];
		}
		draw.animate(draw.compass2.moveCompassMove1,draw.compass2.moveCompassStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.lockCursor = true;
	},
	moveCompassMove1: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var offset = draw._drag.offset;
		
		if (!un(draw._drag.dragArea)) {
			obj.center1 = [
				Math.min(draw._drag.dragArea[0]+draw._drag.dragArea[2],Math.max(draw._drag.dragArea[0],draw.mouse[0]+offset[0])),
				Math.min(draw._drag.dragArea[1]+draw._drag.dragArea[3],Math.max(draw._drag.dragArea[1],draw.mouse[1]+offset[1]))
			];
		} else {
			obj.center1 = [draw.mouse[0]+offset[0],draw.mouse[1]+offset[1]];
		}
		
		if (snapToObj2On || draw.snapLinesTogether) obj.center1 = snapToObj2(obj.center1);
	},
	moveCompassStart2: function() {
		var obj = draw.currCursor.obj;
		draw.movePathToFront(obj._path);
		if (un(obj._startCenter1)) obj._startCenter1 = [obj.center1[0],obj.center1[1]];
		if (un(obj._startAngle)) obj._startAngle = obj.angle;
		if (un(obj._startRadius)) obj._startRadius = obj.radius;
		draw._drag = {
			obj: obj,
			offset: [obj._center3[0]-draw.mouse[0],obj._center3[1]-draw.mouse[1]]
		};
		draw.animate(draw.compass2.moveCompassMove2,draw.compass2.moveCompassStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.lockCursor = true;
	},
	moveCompassMove2: function(e) {
		updateMouse(e);		
		var obj = draw._drag.obj;	
		var offset = draw._drag.offset;	
		
		var newcenter3 = [draw.mouse[0]+offset[0],draw.mouse[1]+offset[1]];
		
		if (obj.radiusLocked == false) {
			newcenter3 = snapToObj2(newcenter3,-1);
			
			var newRadius = Math.sqrt(Math.pow(newcenter3[0]-obj.center1[0],2)+Math.pow(newcenter3[1]-obj.center1[1],2));
			if (newRadius < 0.5) newRadius = 0.5;
			
			if (newRadius <= 1.85 * obj.armLength) {
				obj._center3[0] = newcenter3[0];
				obj._center3[1] = newcenter3[1];
				obj.radius = newRadius;
				if (obj._center3[1] === obj.center1[1]) {
					obj.angle = obj._center3[0] >= obj.center1[0] ? 0 : Math.PI;
				} else if (obj._center3[0] >= obj.center1[0]) {
					obj.angle = Math.atan((obj._center3[1]-obj.center1[1])/(obj._center3[0]-obj.center1[0]));
				} else {
					obj.angle = Math.PI + Math.atan((obj._center3[1]-obj.center1[1])/(obj._center3[0]-obj.center1[0]));
				}			
			} else {			
				if (newcenter3[0] >= obj.center1[0]) {
					obj.angle = Math.atan((newcenter3[1]-obj.center1[1])/(newcenter3[0]-obj.center1[0]));
				} else {
					obj.angle = Math.PI + Math.atan((newcenter3[1]-obj.center1[1])/(newcenter3[0]-obj.center1[0]));
				}
				obj._center3[0] = obj.center1[0] + 1.85 * obj.armLength * Math.cos(obj.angle);
				obj._center3[1] = obj.center1[1] + 1.85 * obj.armLength * Math.sin(obj.angle);
				obj.radius = 1.85 * obj.armLength;		
			}
		} else {
			newcenter3 = snapToObj2(newcenter3,-1);
			
			obj.angle = getAngleFromAToB(obj.center1, newcenter3);
			
			obj._center3[0] = obj.center1[0] + obj.radius * Math.cos(obj.angle);
			obj._center3[1] = obj.center1[1] + obj.radius * Math.sin(obj.angle);
		}		
	},
	moveCompassStop: function() {
		delete draw._drag;
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		delete draw.lockCursor;
	},
	drawCompassStart: function() {
		var obj = draw.currCursor.obj;
		draw.movePathToFront(obj._path);
		
		var color = !un(obj.drawColor) ? obj.drawColor : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.color)) ? taskQuestion.drawToolsStyle.color : draw.color;
		var thickness = !un(obj.drawThickness) ? obj.drawThickness : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.thickness)) ? taskQuestion.drawToolsStyle.thickness : draw.thickness;
		var dash = [];
		if (!un(draw.dash) && draw.dash.length > 0) {
			var circumference = 2*Math.PI*obj.radius;
			var dashCount = Math.round(circumference / (2*draw.dash[0]));
			if (dashCount > 0) {
				var dashLength = (circumference/dashCount)/2;
				dash = [dashLength,dashLength];
			}
		}
		
		var arc = false;
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj2 = path.obj[o];
				if (obj2.type !== 'compassArc' || un(obj2.created)) continue;
				if (arc === false || obj2.created > arc.created) {
					arc = obj2;
				}
			}
		}
		
		if (arc === false || arraysEqual(arc.center,obj.center1) === false || arc.radius !== obj.radius || arc.color !== color || arc.thickness !== thickness || (un(arc.dash) && dash.length > 0 || arc.dash instanceof Array && arc.dash.length !== dash.length) || anglesInOrder(arc.acwFinAngle,obj.angle,arc.cwFinAngle) === false) {
			if (!un(obj._taskQuestion)) {
				var taskQuestion = obj._taskQuestion;
				if (typeof taskQuestion.maxDrawPaths === 'number') {
					if (taskQuestion.maxDrawPaths > 0) {
						draw.taskQuestion.drawTools.removeLastDrawPath(taskQuestion,undefined,taskQuestion.maxDrawPaths);
						drawCanvasPaths();
					}
				} else if (typeof taskQuestion.maxDrawPaths === 'object') {
					if (typeof taskQuestion.maxDrawPaths.arcs === 'number' && taskQuestion.maxDrawPaths.arcs > 0) {
						draw.taskQuestion.drawTools.removeLastDrawPath(taskQuestion,'arc',taskQuestion.maxDrawPaths.arcs);
						drawCanvasPaths();
					}
				}	
			}
			
			arc = {
				type:'compassArc',
				color:color,
				thickness:thickness,
				center:obj.center1.slice(0),
				radius:obj.radius,
				startAngle:obj.angle,
				cwFinAngle:obj.angle,
				acwFinAngle:obj.angle,
				clockwise:true,
				created:new Date().getTime(),
				_dAngle:0
			};
			if (dash.length > 0) arc.dash = dash;
			if (!un(obj._taskQuestion)) arc._taskQuestion = obj._taskQuestion;
			var path = {obj:[arc],selected:false};
			draw.path.push(path);
		}
		if (un(obj._startCenter1)) obj._startCenter1 = [obj.center1[0],obj.center1[1]];
		if (un(obj._startAngle)) obj._startAngle = obj.angle;
		if (un(obj._startRadius)) obj._startRadius = obj.radius;
		obj._drawing = true;
		draw._drag = {
			compass: obj,
			arc: arc,
			prev: clone(draw.mouse),
			path: path
		};
		draw.drawing = true;
		draw.animate(draw.compass2.drawCompassMove,draw.compass2.drawCompassStop,draw.compass2.drawCompassDraw);
		draw.lockCursor = true;
	},
	drawCompassDraw: function() {
		if (un(draw._drag)) return;
		var canvas = draw.drawCanvas[1];
		canvas.ctx.clear();
		drawPathsToCanvas(canvas,[draw._drag.path]);
		if (!un(canvas._paths)) drawPathsToCanvas(canvas,canvas._paths);
		
		var canvas2 = draw.drawCanvas[2];
		canvas2.ctx.clear();
		if (!un(canvas2._paths)) drawPathsToCanvas(canvas2,canvas2._paths);
		if (!un(canvas2._overlayObjs)) {
			for (var i = 0; i < canvas2._overlayObjs.length; i++) {
				var obj = canvas2._overlayObjs[i];
				draw[obj.type].drawOverlay(canvas2.ctx,obj,obj._path);
			}
		}
		if (!un(canvas2._overlayLast)) drawPathsToCanvas(canvas2,canvas2._overlayLast);
	},
	drawCompassMove: function(e) {
		updateMouse(e);		
		var compass = draw._drag.compass;	
		var arc = draw._drag.arc;	
		var prev = draw._drag.prev;	
		
		var dAngle = measureAngle({c:draw.mouse,b:arc.center,a:prev,angleType:'radians'});
		if (dAngle > Math.PI) dAngle = dAngle - 2*Math.PI;
		compass.angle += dAngle;
		arc._dAngle += dAngle;
		draw._drag.prev = clone(draw.mouse);

		if (arc._dAngle > 0) {
			if (un(arc._initialDirection)) arc._initialDirection = 'cw';
			arc.cwFinAngle = Math.min(Math.max(arc.cwFinAngle, arc.startAngle + arc._dAngle), arc.acwFinAngle + 2 * Math.PI);
		} else {
			if (un(arc._initialDirection)) arc._initialDirection = 'acw';
			arc.acwFinAngle = Math.max(Math.min(arc.acwFinAngle, arc.startAngle + arc._dAngle), arc.cwFinAngle - 2 * Math.PI);
		}
	},
	drawCompassStop: function() {
		var arc = draw._drag.arc;
		if (arc.cwFinAngle === arc.startAngle && arc.acwFinAngle === arc.startAngle) {
			var arcPath = draw._drag.path;
			var index = draw.path.indexOf(arcPath);
			if (index > -1) draw.path.splice(index,1);
			drawCanvasPaths();
		} else {
			/*var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(draw.path,false);
			if (tracingPapers.length > 0) {
				var path = draw.path.last();
				var obj = path.obj[0];
				if (obj.finAngle - obj.startAngle >= 2*Math.PI) {
					obj.startAngle = 0;
					obj.finAngle = 2*Math.PI;
				}			
				for (var t = 0; t < tracingPapers.length; t++) {
					var tp = tracingPapers[t];
					if (un(tp._polygon)) continue;
					
					var intersections = [];
					for (var l = 0; l < tp._polygon.length; l++) {
						var p1 = tp._polygon[l];
						var p2 = tp._polygon[(l+1)%tp._polygon.length];
						var ints = lineCircleIntersections(p1,p2,obj.center,obj.radius);
						for (var i = 0; i < ints.length; i++) {
							var angle = ints[i][2];
							var anglesInInterval = getRecurranceOfAngleInInterval(angle,obj.startAngle,obj.finAngle);
							intersections = intersections.concat(anglesInInterval);
						}
					}
					if (intersections.length === 0) {
						var pos = [obj.center[0]+obj.radius*Math.cos(obj.startAngle), obj.center[1]+obj.radius*Math.sin(obj.startAngle)];
						if (hitTestPolygon(pos,tp._polygon) === true) {
							if (un(tp.drawPaths)) tp.drawPaths = [];
							var tpDrawPath = {
								type:'arc',
								color:obj.color,
								thickness:obj.thickness,
								center:draw.tracingPaper.drawPosToTracingPaperPos(tp,obj.center),
								radius:obj.radius,
								startAngle:obj.startAngle-tp.angle,
								finAngle:obj.finAngle-tp.angle,
								created:obj.created
							};
							if (!un(obj.dash)) tpDrawPath.dash = obj.dash;
							tp.drawPaths.push(tpDrawPath);
							draw.path.pop();
						}
					} else {					
						var angles = intersections.sort(function(a,b) {return a-b;});
						angles.unshift(obj.startAngle);
						angles.push(obj.finAngle);					
						draw.path.pop();
						if (un(tp.drawPaths)) tp.drawPaths = [];
						for (var a = 0; a < angles.length-1; a++) {
							var a1 = angles[a];
							var a2 = angles[a+1];
							while (a2 < a1) a2 += 2*Math.PI;
							var midAngle = (a1+a2)/2;
							var midPoint = [obj.center[0]+obj.radius*Math.cos(midAngle), obj.center[1]+obj.radius*Math.sin(midAngle)];
							if (hitTestPolygon(midPoint,tp._polygon) === true) {
								var tpDrawPath = {
									type:'arc',
									color:obj.color,
									thickness:obj.thickness,
									center:draw.tracingPaper.drawPosToTracingPaperPos(tp,obj.center),
									radius:obj.radius,
									startAngle:a1-tp.angle,
									finAngle:a2-tp.angle,
									created:obj.created
								};
								if (!un(obj.dash)) tpDrawPath.dash = obj.dash;
								tp.drawPaths.push(tpDrawPath);
							} else {
								var obj2 = {
									type:'arc',
									color:obj.color,
									thickness:obj.thickness,
									center:obj.center,
									radius:obj.radius,
									startAngle:a1,
									finAngle:a2,
									clockwise:true,
									created:obj.created
								};
								if (!un(obj.dash)) obj2.dash = obj.dash;
								draw.path.push({obj:[obj2]});
							}
						}
					}	
				}
			}*/
		}
		
		delete draw._drag.compass._drawing;
		delete draw._drag;
		delete draw.lockCursor;
		
		draw.drawing = false;
		drawCanvasPaths();
		calcCursorPositions();
	}
}
draw.compassArc = {
	draw: function (ctx, obj, path) {
		if (obj._highlight === true) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.strokeStyle = '#FF0';
			ctx.lineWidth = obj.thickness+14;
			if (obj.cwFinAngle !== obj.startAngle) {
				ctx.beginPath();
				ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.startAngle, obj.cwFinAngle);
				ctx.stroke();
			}
			if (obj.acwFinAngle !== obj.startAngle) { 
				ctx.beginPath();
				ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.startAngle, obj.acwFinAngle, true);
				ctx.stroke();
			}
			ctx.restore();
		}
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined') ctx.setLineDash(obj.dash);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		
		obj._startPos = [obj.center[0]+obj.radius*Math.cos(obj.startAngle), obj.center[1]+obj.radius*Math.sin(obj.startAngle)];
		obj._cwFinPos = [obj.center[0]+obj.radius*Math.cos(obj.cwFinAngle), obj.center[1]+obj.radius*Math.sin(obj.cwFinAngle)];
		obj._acwFinPos = [obj.center[0]+obj.radius*Math.cos(obj.acwFinAngle), obj.center[1]+obj.radius*Math.sin(obj.acwFinAngle)];
		if (obj.cwFinAngle !== obj.startAngle) {
			ctx.beginPath();
			if (obj._initialDirection === 'acw' && obj.dash instanceof Array) ctx.lineDashOffset = obj.dash[0];
			ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.startAngle, obj.cwFinAngle);
			ctx.stroke();
			ctx.lineDashOffset = 0;
		}
		if (obj.acwFinAngle !== obj.startAngle) { 
			ctx.beginPath();
			if (obj._initialDirection === 'cw' && obj.dash instanceof Array) ctx.lineDashOffset = obj.dash[0];
			ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.startAngle, obj.acwFinAngle, true);
			ctx.stroke();
			ctx.lineDashOffset = 0;
		}
		ctx.setLineDash([]);
		if (boolean(draw.drawArcCenter, false) == true) {
			ctx.fillStyle = obj.color;
			ctx.beginPath();
			ctx.moveTo(obj.center[0], obj.center[1]);
			ctx.arc(obj.center[0], obj.center[1], 5, 0, 2 * Math.PI);
			ctx.fill();
		}
		ctx.restore();
	},
	getRect: function (obj) {
		return [obj.center[0]-obj.radius,obj.center[1]-obj.radius,obj.radius*2,obj.radius*2];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		obj.radius += dw;
	},
}

draw.screenShade2 = {
	resizable: false,
	selectable: false,
	toggle: function() {
		var objs = draw.objsOfType('screenShade2');
		//console.log('toggle screenShade',obj.length > 0);
		if (objs.length > 0) {
			var pathIndex = draw.path.indexOf(objs[0]._path);
			if (pathIndex === -1) {
				draw.screenShade2.add();
				return;
			}
			draw.path.splice(pathIndex,1);
			drawCanvasPaths();
		} else {
			draw.screenShade2.add();
		}
	},
	checkIfPresent: function() {
		return draw.objsOfType('screenShade2').length === 0 ? false : true;
	},
	add: function () {
		var viewRect = draw.getView().pageViewRect;
		var obj = {
			type: 'screenShade2',
			rect: viewRect
		};
		draw.path.push({
			obj: [obj],
			selectable: false,
			_deletable: false
		});
		drawCanvasPaths();
	},
	draw: function(ctx, obj, path) {
		
	},
	drawOverlay: function(ctx, obj, path) {
		var tol = 30;
		
		ctx.fillStyle = '#DDD';
		ctx.fillRect(obj.rect[0],obj.rect[1],obj.rect[2],obj.rect[3]);

		ctx.strokeStyle = '#999';
		ctx.lineWidth = 2;
		ctx.strokeRect(obj.rect[0]+tol,obj.rect[1]+tol,obj.rect[2]-2*tol,obj.rect[3]-2*tol);

		var closeRectWidth = 35;
		var closeRectMargin = 15;
		var closeRect = [obj.rect[0]+obj.rect[2]-closeRectWidth-closeRectMargin,obj.rect[1]+closeRectMargin,closeRectWidth,closeRectWidth];
		
		ctx.fillStyle = '#FFF';
		ctx.fillRect(closeRect[0],closeRect[1],closeRect[2],closeRect[3]);
		ctx.strokeRect(closeRect[0],closeRect[1],closeRect[2],closeRect[3]);
		drawCross(ctx,(2/3)*closeRectWidth,(2/3)*closeRectWidth,'#F00',closeRect[0]+(1/6)*closeRectWidth,closeRect[1]+(1/6)*closeRectWidth,5)
	},
	getRect: function (obj) {
		return clone(obj.rect);
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		
	},
	getCursorPositionsUnselected: function (obj, path) {
		return draw.screenShade2.getCursorPositionsInteract(obj, path);
	},
	getCursorPositionsSelected: function (obj, path) {
		return draw.screenShade2.getCursorPositionsInteract(obj, path);
	},
	getCursorPositionsInteract: function (obj, path) {
		var pos = [];
		var tol = 30;
		pos.push({
			shape: 'rect',
			dims: obj.rect,
			cursor: draw.cursors.move1,
			func: draw.screenShade2.moveStart,
			interact: true,
			path: path,
			obj: obj
		});
		pos.push({
			shape: 'line',
			dims: [[obj.rect[0]+tol,obj.rect[1]+tol],[obj.rect[0]+obj.rect[2]-tol,obj.rect[1]+tol],tol],
			cursor: draw.cursors.ns,
			func: draw.screenShade2.resizeStart,
			side:'top',
			interact: true,
			path: path,
			obj: obj
		});
		pos.push({
			shape: 'line',
			dims: [[obj.rect[0]+tol,obj.rect[1]+tol],[obj.rect[0]+tol,obj.rect[1]+obj.rect[3]-tol],tol],
			cursor: draw.cursors.ew,
			func: draw.screenShade2.resizeStart,
			side:'left',
			interact: true,
			path: path,
			obj: obj
		});
		pos.push({
			shape: 'line',
			dims: [[obj.rect[0]+obj.rect[2]-tol,obj.rect[1]+tol],[obj.rect[0]+obj.rect[2]-tol,obj.rect[1]+obj.rect[3]-tol],tol],
			cursor: draw.cursors.ew,
			func: draw.screenShade2.resizeStart,
			side:'right',
			interact: true,
			path: path,
			obj: obj
		});
		pos.push({
			shape: 'line',
			dims: [[obj.rect[0]+tol,obj.rect[1]+obj.rect[3]-tol],[obj.rect[0]+obj.rect[2]-tol,obj.rect[1]+obj.rect[3]-tol],tol],
			cursor: draw.cursors.ns,
			func: draw.screenShade2.resizeStart,
			side:'bottom',
			interact: true,
			path: path,
			obj: obj
		});
		var closeRectWidth = 35;
		var closeRectMargin = 15;
		var closeRect = [obj.rect[0]+obj.rect[2]-closeRectWidth-closeRectMargin,obj.rect[1]+closeRectMargin,closeRectWidth,closeRectWidth];
		pos.push({
			shape: 'rect',
			dims: closeRect,
			cursor: draw.cursors.pointer,
			func: draw.screenShade2.close,
			interact: true,
			pathIndex: draw.path.indexOf(path),
			obj: obj
		});
		return pos;
	},
		
	moveStart: function (e) {
		var obj = draw.currCursor.obj;
		updateMouse(e);
		draw.drag = {
			obj: obj,
			offset: [draw.mouse[0]-obj.rect[0],draw.mouse[1]-obj.rect[1]]
		};
		draw.getPathOfObj(obj)._interacting = true;
		drawCanvasPaths();
		calcCursorPositions();
		draw.animate(draw.screenShade2.moveMove,draw.screenShade2.moveStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
	},
	moveMove: function (e) {
		updateMouse(e);
		var obj = draw.drag.obj;
		obj.rect[0] = Math.max(0,Math.min(1200-obj.rect[2],draw.mouse[0]-draw.drag.offset[0]));
		obj.rect[1] = Math.max(0,Math.min(1700-obj.rect[3],draw.mouse[1]-draw.drag.offset[1]));
	},
	moveStop: function (e) {
		var obj = draw.drag.obj;
		delete obj._path._interacting;
		delete draw.drag;
	},
	resizeStart: function (e) {
		var obj = draw.currCursor.obj;
		updateMouse(e);
		draw.drag = {
			obj: obj,
			side: draw.currCursor.side,
			offset: [draw.mouse[0]-obj.rect[0],draw.mouse[1]-obj.rect[1]]
		};
		draw.getPathOfObj(obj)._interacting = true;
		drawCanvasPaths();
		calcCursorPositions();
		draw.animate(draw.screenShade2.resizeMove,draw.screenShade2.resizeStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
	},
	resizeMove: function (e) {
		updateMouse(e);
		var obj = draw.drag.obj;
		var side = draw.drag.side;
		if (side === 'left') {
			var right = obj.rect[0]+obj.rect[2];
			obj.rect[0] = Math.max(0,Math.min(right-100, draw.mouse[0]));
			obj.rect[2] = right - obj.rect[0];
		} else if (side === 'right') {
			obj.rect[2] = Math.min(1200,Math.max(100,draw.mouse[0]-obj.rect[0]));
		} else if (side === 'top') {
			var bottom = obj.rect[1]+obj.rect[3];
			obj.rect[1] = Math.max(0,Math.min(bottom-100, draw.mouse[1]));
			obj.rect[3] = bottom - obj.rect[1];		
		} else if (side === 'bottom') {
			obj.rect[3] = Math.min(1700,Math.max(100,draw.mouse[1]-obj.rect[1]));
		}
	},
	resizeStop: function (e) {
		var obj = draw.drag.obj;
		delete obj._path._interacting;
		delete draw.drag;
	},
	close: function (e) {
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (path.obj.length === 1 && path.obj[0].type === 'screenShade2') {
				draw.path.splice(p,1);
				break;
			}
		}	
		drawCanvasPaths();
	}
	

}

draw.frequencyBars = {
	add:function() {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var obj = {
			type: 'frequencyBars',
			rect: [center[0]-200, center[1]-100, 400, 200],
			data:[{
				value:'a',freq:7,color:'#000'
			},{
				value:'b',freq:3,color:'#F00'
			},{
				value:'c',freq:4,color:'#F90'
			},{
				value:'d',freq:2,color:'#393'
			}],
			color:'#00F',
			fontSize:28,
			padding:0.3,
			showFreqs:false,
			showGridLines:true,
			box:{
				color:'#FFF',
				borderColor:'#00F',
				borderWidth:2,
				radius:5,
				padding:10
			}
		};
		draw.path.push({
			obj: [obj]
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw:function(ctx,obj,path) {
		var left = obj.rect[0];
		var top = obj.rect[1];
		var width = obj.rect[2];
		var height = obj.rect[3];
		var right = left+width;
		var bottom = top+height;
		
		var barCount = obj.data.length;
		var maxFreq = obj.data.reduce(function(accumulator,currentValue) {return Math.max(accumulator,currentValue.freq)},0);
		var stepSize = draw.frequencyBars.getStepSize(maxFreq);
		var step = stepSize.step;
		var max = stepSize.max;
		var basePadding = obj.fontSize*1.3;
		var baseLine = bottom - obj.fontSize;
		var barUnit = (obj.showFreqs === true && max === maxFreq) ? (height-2*basePadding)/max : (height-1.5*basePadding)/max;
		
		var leftPadding = obj.showGridLines === true ? 20 : 0;
		var barWidth = ((width-leftPadding)/(barCount+obj.padding))*(1-obj.padding);
		var paddingWidth = ((width-leftPadding)/(barCount+obj.padding))*obj.padding;
		
		if (!un(obj.box) && obj.box.show !== false) {
			var radius = obj.box.radius || 0;
			var lineWidth = obj.box.borderWidth || obj.box.lineWidth || 2;
			var boxPadding = obj.box.padding || 0;
			if (!un(obj.box.color) && obj.box.color !== 'none') {
				roundedRect2(ctx,left-boxPadding,top-boxPadding,width+2*boxPadding,height+2*boxPadding,radius,0.01,obj.box.color,obj.box.color);
			}
			if (!un(obj.box.borderColor) && obj.box.borderColor !== 'none') {
				roundedRect2(ctx,left-boxPadding,top-boxPadding,width+2*boxPadding,height+2*boxPadding,radius,lineWidth,obj.box.borderColor);
			}
		}
		
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(left+leftPadding,baseLine);
		ctx.lineTo(right,baseLine);
		ctx.stroke();
		
		if (obj.showGridLines === true) {
			text({ctx:ctx,text:['0'],rect:[left,baseLine-10,leftPadding-6,20],align:[1,0],fontSize:obj.fontSize,color:'#666'});
			for (var i = step; i <= max; i += step) {
				var y = baseLine-barUnit*i;
				ctx.strokeStyle = '#666';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(left+leftPadding,y);
				ctx.lineTo(right,y);
				ctx.stroke();
				text({ctx:ctx,text:[String(i)],rect:[left,y-10,leftPadding-6,20],align:[1,0],fontSize:obj.fontSize,color:'#666'});
			}
		}
		
		for (var d = 0; d < obj.data.length; d++) {
			var freq = obj.data[d].freq;
			var barLeft = left+leftPadding+paddingWidth+d*(barWidth+paddingWidth);
			var barHeight = barUnit*freq;
			var color = !un(obj.data[d].color) ? obj.data[d].color : obj.color || '#000';
			ctx.fillStyle = color;
			ctx.fillRect(barLeft,baseLine-barHeight,barWidth,barHeight);
			text({ctx:ctx,text:[String(obj.data[d].value)],rect:[barLeft,baseLine,barWidth,basePadding],align:[0,0],fontSize:obj.fontSize});
			if (obj.showFreqs === true && freq > 0) {
				text({ctx:ctx,text:[String(freq)],rect:[barLeft,baseLine-barHeight-obj.fontSize,barWidth,obj.fontSize],align:[0,0],fontSize:obj.fontSize,color:color});
			}
		}
	},
	getStepSize:function(maxValue) {
		var powerOf10 = Math.pow(10,Math.floor(Math.log10(maxValue)));
		var multiple = Math.ceil(maxValue/powerOf10);
		var step = multiple <= 5 ? powerOf10 : 2*powerOf10;		
		var max = step*Math.ceil(maxValue/step);
		return {step:step,max:max};
	},
	getRect: function (obj) {
		var boxPadding = !un(obj.box) && !un(obj.box.padding) ? obj.box.padding : 0;
		return [obj.rect[0]-boxPadding,obj.rect[1]-boxPadding,obj.rect[2]+2*boxPadding,obj.rect[3]+2*boxPadding];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		obj.rect[3] += dh;
	},
	resizable:true
}

draw.buttonTracingPaper = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonTracingPaper',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	getTracingPaper: function(obj,paths) {
		if (typeof paths === 'undefined') paths = draw.path;
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj2 = path.obj[o];
				if (obj2.type === 'taskQuestion') {
					draw.taskQuestion.getPaths(obj2);
				}
			}
		}
		if (!un(obj) && !un(obj._taskQuestion)) {
			var objs = obj._taskQuestion._questionObjs;
			var tracingPaper = objs.find(function(x) {return x.type === 'tracingPaper'});
			if (typeof tracingPaper === 'object') obj._tracingPaper = tracingPaper;
			return;
		}
		var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(draw.path,true);
		if (tracingPapers instanceof Array && typeof tracingPapers[0] === 'object') obj._tracingPaper = tracingPapers[0];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonLine.draw(ctx, {
			type: 'buttonTracingPaper',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.save();
		ctx.translate(obj.left, obj.top);
			var tracingPaperVis = false;
			if (typeof obj._tracingPaper !== 'object') draw.buttonTracingPaper.getTracingPaper(obj,draw.path);
			if (typeof obj._tracingPaper === 'object') {
				if (!un(obj._tracingPaper._path) && obj._tracingPaper._path.vis !== false) tracingPaperVis = true;
			} 
			var color = tracingPaperVis ? draw.buttonSelectedColor : draw.buttonColor;
			roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', color);

			ctx.fillStyle = '#CCC';
			ctx.fillRect(12,12,55-2*12,55-2*12);

			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			ctx.strokeRect(12,12,55-2*12,55-2*12);
			
			ctx.strokeStyle = '#F00';
			ctx.setLineDash([2,2]);
			ctx.beginPath();
			ctx.moveTo(12,55/2);
			ctx.lineTo(55-12,55/2);
			ctx.moveTo(55/2,12);
			ctx.lineTo(55/2,55-12);
			ctx.stroke();
			ctx.setLineDash([]);
		ctx.translate(-obj.left, -obj.top);
		ctx.restore();
	},
	click: function(obj) {
		if (typeof obj._tracingPaper !== 'object') draw.buttonTracingPaper.getTracingPaper(obj,draw.path);
		if (typeof obj._tracingPaper !== 'object') return;
		obj._tracingPaper._path.vis = !obj._tracingPaper._path.vis;
		if (un(obj._tracingPaper._startVisible)) obj._tracingPaper._startVisible = !obj._tracingPaper._path.vis;
		drawCanvasPaths();
	}
};
draw.tracingPaper = {
	add:function() {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var obj = {
			type: 'tracingPaper',
			center: center,
			width: 550,
			angle:0,
			mode:'move'
		};
		draw.path.push({
			obj: [obj]
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw:function(ctx,obj,path) {
		if (typeof obj.mode === 'string' && obj.mode.indexOf('fold-') === 0) {
			return draw.tracingPaper.drawFolded(ctx,obj,path);
		}		
		
		ctx.translate(obj.center[0],obj.center[1]);
		ctx.rotate(obj.angle);

		var color = !un(obj.color) ? obj.color : '#999';
		var opacity = !un(obj.opacity) ? obj.opacity : 0.5;
		ctx.fillStyle = colorA(color,opacity);
		ctx.fillRect(-obj.width/2,-obj.width/2,obj.width,obj.width);
		obj._polygon = [];
		for (var i = 0; i < 4; i++) {
			var x = obj.center[0]+Math.sqrt(2)*(obj.width/2)*Math.cos(obj.angle+Math.PI/4+i*Math.PI/2);
			var y = obj.center[1]+Math.sqrt(2)*(obj.width/2)*Math.sin(obj.angle+Math.PI/4+i*Math.PI/2);
			obj._polygon.push([x,y]);
		}

		var r = obj.width/2;
		if (obj.showFoldLines !== false) {
			ctx.beginPath();
			ctx.strokeStyle = '#F00';
			ctx.lineWidth = 2;
			ctx.setLineDash([10,10]);
			ctx.moveTo(0,0);
			ctx.lineTo(r,0);
			ctx.moveTo(0,0);
			ctx.lineTo(-r,0);
			ctx.moveTo(0,0);
			ctx.lineTo(0,r);
			ctx.moveTo(0,0);
			ctx.lineTo(0,-r);
			ctx.stroke();
			ctx.setLineDash([]);
		}
		if (obj.showFoldLines !== false) {
			if (obj.mode !== 'fold') {
				ctx.beginPath();
				ctx.fillStyle = '#F00';
				ctx.moveTo(0,0);
				ctx.arc(0,0,6,0,2*Math.PI);
				ctx.fill();
				ctx.beginPath();
				ctx.strokeStyle = '#F00';
				ctx.lineWidth = 3;
				ctx.lineJoin = 'round';
				ctx.moveTo(0,0);
				ctx.lineTo(0,-30);
				ctx.lineTo(6,-22);
				ctx.lineTo(-6,-22);
				ctx.lineTo(0,-30);
				ctx.fill();
				ctx.stroke();
			}
		}
		
		if (!un(obj.drawPaths)) {
			draw.tracingPaper.drawTracingPaperPaths(ctx,obj.drawPaths);
		}
		
		var modeButtonSize = 50;
		
		var angle = obj.angle;
		var center = obj.center;
		var size = 50;
		var left = center[0]-obj.width/2;
		var top = center[1]-obj.width/2;
		var r = obj.width/2;
		if (obj.showButtons !== false) {
			var buttons1 = [
				['move',draw.tracingPaper.drawMoveButton],
				['rotate',draw.tracingPaper.drawRotateButton],
				['fold',draw.tracingPaper.drawFoldButton]
				//['reset',draw.tracingPaper.drawResetButton]
			];
			for (var b = 0; b < buttons1.length; b++) {
				ctx.save();
				ctx.translate(-r+b*modeButtonSize,-r);
					buttons1[b][1](ctx,modeButtonSize,obj);
				ctx.translate(r-b*modeButtonSize,r);
				ctx.restore();
			}
			
			if (obj.hasOwnDrawTools === true) {
				var buttons2 = [
					['pen',draw.tracingPaper.drawPenButton],
					['line',draw.tracingPaper.drawLineButton],
					['undo',draw.tracingPaper.drawUndoButton],
					['clear',draw.tracingPaper.drawClearButton]
				].reverse();
				for (var b = 0; b < buttons2.length; b++) {
					ctx.save();
					ctx.translate(r-(b+1)*modeButtonSize,-r);
						buttons2[b][1](ctx,modeButtonSize,obj);
					ctx.translate(-r+(b+1)*modeButtonSize,r);
					ctx.restore();
				}
			}
		
			/*var buttons = [
				['move',draw.tracingPaper.drawMoveButton],
				['rotate',draw.tracingPaper.drawRotateButton],
				['pen',draw.tracingPaper.drawPenButton],
				['line',draw.tracingPaper.drawLineButton],
				['undo',draw.tracingPaper.drawUndoButton],
				['clear',draw.tracingPaper.drawClearButton],
				['reset',draw.tracingPaper.drawResetButton],
				['fold',draw.tracingPaper.drawFoldButton]
			];
			
			var r = obj.width/2;
			for (var b = 0; b < buttons.length; b++) {
				ctx.save();
				ctx.translate(-r+b*modeButtonSize,-r);
					buttons[b][1](ctx,modeButtonSize,obj);
				ctx.translate(r-b*modeButtonSize,r);
				ctx.restore();
			}*/
			
			if (obj.mode === 'fold') {
				ctx.save();
				ctx.fillStyle = '#FCC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 2;
				ctx.translate(-20,-r-20);
					ctx.beginPath();
					ctx.arc(20,20,20,0,2*Math.PI);
					ctx.fill();
					ctx.stroke();
					drawArrow({ctx:ctx,startX:20,startY:10,finX:20,finY:30,arrowLength:10,fillArrow:true});
				ctx.translate(20,r+20);
				ctx.restore();
				
				ctx.save();
				ctx.fillStyle = '#FCC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 2;
				ctx.translate(-20,r-20);
					ctx.beginPath();
					ctx.arc(20,20,20,0,2*Math.PI);
					ctx.fill();
					ctx.stroke();
					drawArrow({ctx:ctx,startX:20,startY:30,finX:20,finY:10,arrowLength:10,fillArrow:true});
				ctx.translate(20,-r+20);
				ctx.restore();
				
				ctx.save();
				ctx.fillStyle = '#FCC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 2;
				ctx.translate(-r-20,-20);
					ctx.beginPath();
					ctx.arc(20,20,20,0,2*Math.PI);
					ctx.fill();
					ctx.stroke();
					drawArrow({ctx:ctx,startX:10,startY:20,finX:30,finY:20,arrowLength:10,fillArrow:true});
				ctx.translate(r+20,20);
				ctx.restore();
				
				ctx.save();
				ctx.fillStyle = '#FCC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 2;
				ctx.translate(r-20,-20);
					ctx.beginPath();
					ctx.arc(20,20,20,0,2*Math.PI);
					ctx.fill();
					ctx.stroke();
					drawArrow({ctx:ctx,startX:30,startY:20,finX:10,finY:20,arrowLength:10,fillArrow:true});
				ctx.translate(-r+20,20);
				ctx.restore();
			}
		}
		
		ctx.rotate(-obj.angle);
		ctx.translate(-obj.center[0],-obj.center[1]);
	},
	drawTracingPaperPaths: function(ctx,drawPaths) {
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		for (var d = 0; d < drawPaths.length; d++) {
			var drawPath = drawPaths[d];
			ctx.beginPath();
			if (drawPath.type === 'point') {
				ctx.fillStyle = drawPath.color || '#000';
				ctx.moveTo(drawPath.pos[0],drawPath.pos[1]);
				ctx.arc(drawPath.pos[0],drawPath.pos[1],drawPath.radius,0,2*Math.PI);
				ctx.fill();
			} else if (drawPath.type === 'arc') {
				ctx.strokeStyle = drawPath.color || '#000';
				ctx.lineWidth = drawPath.thickness || 5;
				if (!un(drawPath.dash)) ctx.setLineDash(drawPath.dash);
				ctx.arc(drawPath.center[0],drawPath.center[1],drawPath.radius,drawPath.startAngle,drawPath.finAngle);
				ctx.stroke();
			} else if (drawPath.type === 'polygon') {
				ctx.moveTo(drawPath.pos[0][0],drawPath.pos[0][1]);
				for (var p = 1; p < drawPath.pos.length; p++) {
					var pos = drawPath.pos[p];
					ctx.lineTo(pos[0],pos[1]);
				}
				ctx.lineTo(drawPath.pos[0][0],drawPath.pos[0][1]);				
				if (!un(drawPath.fillColor) && drawPath.fillColor !== 'none') {
					ctx.fillStyle = drawPath.fillColor;
					ctx.fill();
				}
				if (drawPath.color !== 'none') {
					ctx.strokeStyle = drawPath.color || '#000';
					ctx.lineWidth = drawPath.thickness || 5;
					if (!un(drawPath.dash)) ctx.setLineDash(drawPath.dash);
					ctx.stroke();
				}
			} else if (drawPath.pos instanceof Array && !un(drawPath.pos[0]) && !un(drawPath.pos[1])) { // line or pen
				ctx.strokeStyle = drawPath.color || '#000';
				ctx.lineWidth = drawPath.thickness || 5;
				if (!un(drawPath.dash)) ctx.setLineDash(drawPath.dash);
				ctx.moveTo(drawPath.pos[0][0],drawPath.pos[0][1]);
				for (var p = 1; p < drawPath.pos.length; p++) {
					var pos = drawPath.pos[p];
					ctx.lineTo(pos[0],pos[1]);
				}
				ctx.stroke();
			}
			ctx.setLineDash([]);
		}
	},
	drawFolded: function(ctx,obj,path) {
		ctx.translate(obj.center[0],obj.center[1]);
		ctx.rotate(obj.angle);

		var color = !un(obj.color) ? obj.color : '#999';
		var opacity = !un(obj.opacity) ? obj.opacity : 0.5;
		ctx.fillStyle = colorA(color,opacity);
		var w = obj.width;
		var r = w/2;
		var x = obj.center[0];
		var y = obj.center[1];
		if (obj.mode === 'fold-left') {
			ctx.fillRect(-r,-r,r,w);
			obj._polygon = [[x-r,y-r],[x,y-r],[x,y+r],[x-r,y+r]];
		} else if (obj.mode === 'fold-right') {
			ctx.fillRect(0,-r,r,w);
			obj._polygon = [[x,y-r],[x+r,y-r],[x+r,y+r],[x,y+r]];
		} else if (obj.mode === 'fold-up') {
			ctx.fillRect(-r,-r,w,r);
			obj._polygon = [[x-r,y-r],[x+r,y-r],[x+r,y],[x-r,y]];
		} else if (obj.mode === 'fold-down') {
			ctx.fillRect(-r,0,w,r);	
			obj._polygon = [[x-r,y],[x+r,y],[x+r,y+r],[x-r,y+r]];
		}
		for (var p = 0; p < 4; p++) {
			var coords = rotateCoords(obj._polygon[p][0],obj._polygon[p][1],obj.angle*180/Math.PI,'anti-cw',obj.center[0],obj.center[1]);
			obj._polygon[p] = [coords.x,coords.y];
		}
		
		if (obj.showFoldLines !== false) {
			ctx.beginPath();
			ctx.strokeStyle = '#F00';
			ctx.lineWidth = 2;
			ctx.setLineDash([10,10]);
			if (obj.mode !== 'fold-left') {
				ctx.moveTo(0,0);
				ctx.lineTo(r,0);
			}
			if (obj.mode !== 'fold-right') {
				ctx.moveTo(0,0);
				ctx.lineTo(-r,0);
			}
			if (obj.mode !== 'fold-up') {
				ctx.moveTo(0,0);
				ctx.lineTo(0,r);
			}
			if (obj.mode !== 'fold-down') {
				ctx.moveTo(0,0);
				ctx.lineTo(0,-r);
			}
			ctx.stroke();
			ctx.setLineDash([]);
		}
		
		if (!un(obj._staticPaths)) {		
			draw.tracingPaper.drawTracingPaperPaths(ctx,obj._staticPaths);
		}
		
		if (typeof obj._foldFactor !== 'number') obj._foldFactor = 0;
		var f = obj._foldFactor;
		ctx.save();
		
		if (obj.mode === 'fold-left') {
			ctx.transform(1-2*f,2*f*(f-1),0,1,0,0);
		} else if (obj.mode === 'fold-right') {
			ctx.transform(1-2*f,-2*f*(f-1),0,1,0,0);
		} else if (obj.mode === 'fold-up') {
			ctx.transform(1,0,-2*f*(f-1),1-2*f,0,0);
		} else if (obj.mode === 'fold-down') {
			ctx.transform(1,0,2*f*(f-1),1-2*f,0,0);
		}
		
		if (f > 0.5 && !un(obj._foldPaths)) {
			draw.tracingPaper.drawTracingPaperPaths(ctx,obj._foldPaths);
			if (obj.showFoldLines !== false) {
				ctx.beginPath();
				ctx.strokeStyle = '#F00';
				ctx.lineWidth = 2;
				ctx.setLineDash([10,10]);
				if (obj.mode === 'fold-left') {
					ctx.moveTo(0,0);
					ctx.lineTo(r,0);
				}
				if (obj.mode === 'fold-right') {
					ctx.moveTo(0,0);
					ctx.lineTo(-r,0);
				}
				if (obj.mode === 'fold-up') {
					ctx.moveTo(0,0);
					ctx.lineTo(0,r);
				}
				if (obj.mode === 'fold-down') {
					ctx.moveTo(0,0);
					ctx.lineTo(0,-r);
				}
				ctx.stroke();
				ctx.setLineDash([]);
			}
		}
		
		var color = !un(obj.color) ? obj.color : '#999';
		var opacity = !un(obj.opacity) ? obj.opacity : 0.5;
		ctx.fillStyle = colorA(color,opacity);
		if (obj.mode === 'fold-left') {
			ctx.fillRect(0,-r,r,w);
		} else if (obj.mode === 'fold-right') {
			ctx.fillRect(-r,-r,r,w);
		} else if (obj.mode === 'fold-up') {
			ctx.fillRect(-r,0,w,r);
		} else if (obj.mode === 'fold-down') {
			ctx.fillRect(-r,-r,w,r);	
		}
		
		if (f <= 0.5 && !un(obj._foldPaths)) {
			if (obj.showFoldLines !== false) {
				ctx.beginPath();
				ctx.strokeStyle = '#F00';
				ctx.lineWidth = 2;
				ctx.setLineDash([10,10]);
				if (obj.mode === 'fold-left') {
					ctx.moveTo(0,0);
					ctx.lineTo(r,0);
				}
				if (obj.mode === 'fold-right') {
					ctx.moveTo(0,0);
					ctx.lineTo(-r,0);
				}
				if (obj.mode === 'fold-up') {
					ctx.moveTo(0,0);
					ctx.lineTo(0,r);
				}
				if (obj.mode === 'fold-down') {
					ctx.moveTo(0,0);
					ctx.lineTo(0,-r);
				}
				ctx.stroke();
				ctx.setLineDash([]);
			}
			draw.tracingPaper.drawTracingPaperPaths(ctx,obj._foldPaths);
		}
		ctx.restore();
	
		ctx.fillStyle = '#FFC';
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		
		if (obj.showButtons !== false) {
			if (obj.mode === 'fold-left') {
				var pos = [(1-2*f)*r, 2*r*f*(f-1)];
				var pos2 = [r,0];
			} else if (obj.mode === 'fold-right') {
				var pos = [-(1-2*f)*r, 2*r*f*(f-1)];
				var pos2 = [-r,0];
			} else if (obj.mode === 'fold-up') {
				var pos = [-2*r*f*(f-1), (1-2*f)*r];
				var pos2 = [0,r];
			} else if (obj.mode === 'fold-down') {
				var pos = [-2*r*f*(f-1), -(1-2*f)*r];
				var pos2 = [0,-r];
			}
			ctx.translate(pos[0],pos[1]);
				ctx.save();
				ctx.fillStyle = '#FCC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.arc(0,0,20,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.fillStyle = '#000';
				ctx.beginPath();
				if (obj.mode === 'fold-left' || obj.mode === 'fold-right') {
					ctx.moveTo(12,0);
					ctx.lineTo(3,10);
					ctx.lineTo(3,-10);
					ctx.moveTo(-12,0);
					ctx.lineTo(-3,10);
					ctx.lineTo(-3,-10);
				} else {
					ctx.moveTo(0,12);
					ctx.lineTo(10,3);
					ctx.lineTo(-10,3);
					ctx.moveTo(0,-12);
					ctx.lineTo(10,-3);
					ctx.lineTo(-10,-3);
				}
				ctx.fill();
				ctx.restore();
			ctx.translate(-pos[0],-pos[1]);
			obj._foldSlideButtonPos = draw.tracingPaper.tracingPaperPosToDrawPos(obj,pos2);
			obj._foldSlideButtonPos.push(20);
		}
		
		ctx.rotate(-obj.angle);
		ctx.translate(-obj.center[0],-obj.center[1]);
	},
	drawVisibleButton:function (ctx,size,obj) {
		ctx.fillStyle = '#FCC';
		ctx.fillRect(0,0,size,size);
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		ctx.strokeRect(0,0,size,size);
		text({ctx:ctx,rect:[0,0,size,size],text:[times],color:'#F00',bold:true,fontSize:40,align:[0,0]}); 
	},
	drawMoveButton:function (ctx,size,obj) {
		ctx.fillStyle = obj.mode === 'move' ? '#FFF' : '#FCC';
		ctx.fillRect(0,0,size,size);
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		ctx.strokeRect(0,0,size,size);
		if (un(draw.openHandImage)) {
			draw.openHandImage = new Image;
			draw.openHandImage.onload = function() {
				drawCanvasPaths();
			};
			draw.openHandImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADCElEQVRYR+2WT0iacRjHvw3qBTMmMj0M8a0uC3FMSkKa8dJ7aYaSUMRYULguscTsZvCOOgzcybcJxS4yL0EwwT+7jYgOHXSXvYY4grfloYPUNshDDAI3fpLxrqz3tUaD4XOR1/f5/X4fv8/3efw1QVkwABIANACiADzKlslnNdVIeQ7gIYAfACIAeq1W6/jY2JirubmZEkUxv7y8/FGyTjzN+yl/3MUMKcBdAGabzfaaoih7uVwu7u3tcfv7+08YhhlNJBLQaDSIRqOYnp6G2WyGWq3GycmJIAgCd3x8nAbwvV4IKUBF5ng8rnG73SgUCiCf2WwWDMNACrC4uFh5tlgs2NzcrOQdHR25AST/NUAJwFMAQQAFJTBSBR4A8HEc5xwcHDR2dXUhHA4jFotBr9crUSDc19enam9vd2cymfDu7m4MwBc5iFomjE9OTrpJrUn4/X4IgiAL0NLSgomJCXi93mrp/ADe3BrAwsICRkZGUC6XrwVADERMSOKAYRgzy7LPpqamIIoiDg8P4XK5QFEU8vk80ul05Vmn052ZkCh2zryKFWCsVqu3tbV1lJxeLBa5nZ0dNU3TgarTr5KRlIfjOAQCAdjtdmn3KAb4xfN8pdYkyK9IJpOgafqs1eTqKH0vad/rAWQyGayuriKVStUNsLGxAZ7nD3K5XLBQKKQAfJWDJ13wbmZmptfpdJpYlgVx89bWVuVwn88Ho9Eot8fZe+IDj8dD+p94KqtkYbUNX/b3979YWVnRd3Z23lGpVErWXsi5CcB9g8Hg0Gq1/NLSUtvAwMCtA5AD//gvqJcgEolgfX3909ra2lsAHwB8U7KHdBI+AvAqFArZHA7HPTKK64nT7qn7riA7ipVC/E2A3p6envHu7m7f/Pw8Ojo6rmTI5XIIBoMgrbe9vf0ewGel0CSvlgLk+8cGg8E/OzvLDg0NaU0m06V7/s37wPlDaHJB4XneUp2StSj+a4A2AK5QKKSbm5u7sgTDw8MolUqk9WRH7/mNLvNAPT66UW4DoKFAQ4GGAr8B6HWSMOjcjREAAAAASUVORK5CYII=";
		} else {
			var w2 = draw.openHandImage.naturalWidth;
			var h2 = draw.openHandImage.naturalHeight;
			ctx.drawImage(draw.openHandImage,30-w2/2,30-h2/2,w2,h2);
		}
	},
	drawPenButton:function (ctx,size,obj) {
		ctx.fillStyle = obj.mode === 'pen' ? '#FFF' : '#FCC';
		ctx.fillRect(0,0,size,size);
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		ctx.strokeRect(0,0,size,size);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.fillStyle = '#F00';
		ctx.translate(size/2,size/2);
		ctx.rotate(Math.PI/4);
			ctx.fillRect(-5,-11,10,20);
			ctx.fillRect(-5,-18,10,5);
			ctx.beginPath();
			ctx.moveTo(-5,11);
			ctx.lineTo(0,18);
			ctx.lineTo(5,11);
			ctx.lineTo(-5,11);
			ctx.fill();		
		ctx.rotate(-Math.PI/4);
		ctx.translate(-size/2,-size/2);	
		
	},
	drawRotateButton:function (ctx,size,obj) {
		ctx.fillStyle = obj.mode === 'rotate' ? '#FFF' : '#FCC';
		ctx.fillRect(0,0,size,size);
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		ctx.strokeRect(0,0,size,size);
		ctx.lineWidth = 0.05 * size;
		ctx.fillStyle = '#000';
		ctx.strokeStyle = '#000';
		ctx.beginPath();
		ctx.arc(0.5 * size, 0.5 * size, 0.26 * size, 0.08 * Math.PI,  0.85 * Math.PI);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0.5 * size, 0.5 * size, 0.26 * size, 1.08 * Math.PI,  1.85 * Math.PI);
		ctx.stroke();
		
		ctx.beginPath();
		var l2 = 0.8 * size;
		var t2 = 0.5 * size;
		var arrowLength = 0.2 * size;
		ctx.moveTo(l2, t2);
		ctx.lineTo(l2 + arrowLength * Math.sin(0.98 * Math.PI), t2 + arrowLength * Math.cos(0.98 * Math.PI));
		ctx.lineTo(l2 + arrowLength * Math.cos(0.95 * Math.PI), t2 - arrowLength * Math.sin(0.95 * Math.PI));
		ctx.lineTo(l2, t2);
		ctx.fill();
		
		ctx.beginPath();
		var l2 = 0.2 * size;
		var t2 = 0.5 * size;
		var arrowLength = 0.2 * size;
		ctx.moveTo(l2, t2);
		ctx.lineTo(l2 - arrowLength * Math.sin(0.98 * Math.PI), t2 - arrowLength * Math.cos(0.98 * Math.PI));
		ctx.lineTo(l2 - arrowLength * Math.cos(0.95 * Math.PI), t2 + arrowLength * Math.sin(0.95 * Math.PI));
		ctx.lineTo(l2, t2);
		ctx.fill();
	},
	drawLineButton:function (ctx,size,obj) {
		ctx.fillStyle = obj.mode === 'line' ? '#FFF' : '#FCC';
		ctx.fillRect(0,0,size,size);
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		ctx.strokeRect(0,0,size,size);
		ctx.lineWidth = 3;
		ctx.strokeStyle = '#F00';
		ctx.beginPath();
		ctx.moveTo(10,20);
		ctx.lineTo(40,30);
		ctx.stroke();
	},
	drawUndoButton:function (ctx,size,obj) {
		ctx.fillStyle = '#FCC';
		ctx.fillRect(0,0,size,size);
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		ctx.strokeRect(0,0,size,size);
		ctx.lineWidth = 0.08 * size;
		ctx.fillStyle = '#000';	
		ctx.strokeStyle = '#000';	
		ctx.beginPath();
		ctx.arc(0.5 * size, 0.5 * size, 0.22 * size, 1.2 * Math.PI,  0.8 * Math.PI);
		ctx.stroke();
		ctx.beginPath();
		var l2 = 0.23 * size;
		var t2 = 0.47 * size;
		var arrowLength = 0.28 * size;
		ctx.moveTo(l2, t2);
		ctx.lineTo(l2 - arrowLength * Math.sin(1.06 * Math.PI), t2 + arrowLength * Math.cos(1.06 * Math.PI));
		ctx.lineTo(l2 - arrowLength * Math.cos(1.03 * Math.PI), t2 - arrowLength * Math.sin(1.03 * Math.PI));
		ctx.lineTo(l2, t2);
		ctx.fill();
	},
	drawClearButton:function (ctx,size,obj) {
		ctx.fillStyle = '#FCC';
		ctx.fillRect(0,0,size,size);
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		ctx.strokeRect(0,0,size,size);
		text({ctx:ctx,rect:[0,0,size,size],text:['CLR'],color:'#000',bold:false,fontSize:16,align:[0,0]}); 
	},
	drawResetButton:function (ctx,size,obj) {
		ctx.fillStyle = '#FCC';
		ctx.fillRect(0,0,size,size);
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		ctx.strokeRect(0,0,size,size);
		text({ctx:ctx,rect:[0,0,size,size],text:['RESET'],color:'#000',bold:false,fontSize:12,align:[0,0]}); 
	},
	drawFoldButton:function (ctx,size,obj) {
		ctx.fillStyle = obj.mode === 'fold' ? '#FFF' : '#FCC';
		ctx.fillRect(0,0,size,size);
		ctx.strokeStyle = '#999';
		ctx.lineWidth = 1;
		ctx.strokeRect(0,0,size,size);
		
		ctx.strokeStyle = '#0';
		ctx.lineWidth = 1;
		ctx.fillStyle = '#DDD';
		ctx.fillRect(0.5*size,0.4*size,0.25*size,0.4*size);
		ctx.strokeRect(0.5*size,0.4*size,0.25*size,0.4*size);
		
		ctx.beginPath();
		ctx.fillStyle = '#CCC';
		ctx.moveTo(0.5*size,0.4*size);
		ctx.lineTo(0.5*size,0.8*size);
		ctx.lineTo(0.35*size,0.65*size);
		ctx.lineTo(0.35*size,0.24*size);
		ctx.lineTo(0.5*size,0.4*size);
		ctx.fill();
		ctx.stroke();
		
		ctx.beginPath();
		ctx.setLineDash([0.05*size,0.05*size]);
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = '#F00';
		ctx.moveTo(0.5*size,0.4*size);
		ctx.lineTo(0.5*size,0.8*size);
		ctx.stroke();
		ctx.setLineDash([]);
		
		ctx.beginPath();
		ctx.strokeStyle = '#000';
		ctx.arc(0.5 * size, 0.35 * size, 0.2 * size, 1.35 * Math.PI,  1.9 * Math.PI);
		ctx.stroke();
		
		ctx.beginPath();
		ctx.fillStyle = '#000';
		var l2 = 0.73 * size;
		var t2 = 0.33 * size;
		var arrowLength = 0.12 * size;
		ctx.moveTo(l2, t2);
		ctx.lineTo(l2 + arrowLength * Math.sin(0.98 * Math.PI), t2 + arrowLength * Math.cos(0.98 * Math.PI));
		ctx.lineTo(l2 + arrowLength * Math.cos(0.95 * Math.PI), t2 - arrowLength * Math.sin(0.95 * Math.PI));
		ctx.lineTo(l2, t2);
		ctx.fill();
		//text({ctx:ctx,rect:[0,0,size,size],text:['FOLD'],color:'#000',bold:false,fontSize:12,align:[0,0]}); 
	},
	getRect: function (obj) {
		return [obj.center[0]-obj.width/2,obj.center[1]-obj.width/2,obj.width,obj.width];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
	},
	resizable:false,
	getCursorPositionsInteract:function(obj) {
		if (obj._disabled === true) return [];
		var pos = [];

		if (typeof obj.mode === 'string' && obj.mode.indexOf('fold-') === 0) {
			if (obj.opacity !== 0) pos.push({shape:'polygon',dims:obj._polygon,cursor:draw.cursors.default});
			var direction = obj.mode.slice(5);
			pos.push({shape:'circle',dims:obj._foldSlideButtonPos,cursor:draw.cursors.move1,func:draw.tracingPaper.foldStart,obj:obj,direction:direction});
			return pos;		
		} else if (obj.mode === 'rotate') {
			pos.push({shape:'polygon',dims:obj._polygon,cursor:draw.cursors.rotate,func:draw.tracingPaper.rotateStart,obj:obj});
		} else if (obj.mode === 'move') {
			pos.push({shape:'polygon',dims:obj._polygon,cursor:draw.cursors.move1,func:draw.tracingPaper.moveStart,obj:obj});
		} else if (obj.hasOwnDrawTools === true) {			
			if (obj.mode === 'pen') {
				if (un(obj._penCursor)) {
					var canvas = draw.hiddenCanvas;
					var ctx = draw.hiddenCanvas.ctx;
					canvas.width = 50;
					canvas.height = 50;
					ctx.fillStyle = '#F00';
					ctx.clearRect(0,0,50,50);			
					ctx.lineCap = 'round';
					ctx.lineJoin = 'round';
					ctx.translate(25,25);
					ctx.rotate(Math.PI/4);
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

					var penCursor = canvas.toDataURL();
					var penCursorHotspot = [25-18/Math.sqrt(2),25+18/Math.sqrt(2)];
					obj._penCursor = 'url("'+penCursor+'") '+penCursorHotspot[0]+' '+penCursorHotspot[1]+', auto';
				}
				pos.push({shape:'polygon',dims:obj._polygon,cursor:obj._penCursor,func:draw.tracingPaper.penStart,obj:obj});			
			} else if (obj.mode === 'line') {
				if (un(obj._lineCursor)) {
					var canvas = draw.hiddenCanvas;
					var ctx = draw.hiddenCanvas.ctx;
					canvas.width = 50;
					canvas.height = 50;
					ctx.fillStyle = '#F00';
					ctx.clearRect(0,0,50,50);			
					ctx.strokeStyle = '#F00';
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(2,2);
					ctx.lineTo(12,12);
					ctx.moveTo(2,12);
					ctx.lineTo(12,2);
					ctx.stroke();

					var lineCursor = canvas.toDataURL();
					obj._lineCursor = 'url("'+lineCursor+'") 7 7, auto';
				}
				pos.push({shape:'polygon',dims:obj._polygon,cursor:obj._lineCursor,func:draw.tracingPaper.lineStart,obj:obj});			
			} else {
				pos.push({shape:'polygon',dims:obj._polygon,cursor:'default'});			
			}
		}
		
		var angle = obj.angle;
		var center = obj.center;
		var size = 50;
		var left = center[0]-obj.width/2;
		var top = center[1]-obj.width/2;
		var buttons1 = [
			['move',draw.tracingPaper.drawMoveButton],
			['rotate',draw.tracingPaper.drawRotateButton],
			['fold',draw.tracingPaper.drawFoldButton]
			//['reset',draw.tracingPaper.drawResetButton]
		];
				
		for (var i = 0; i < buttons1.length; i++) {
			var buttonPolygon = [
				[left,top],
				[left+size,top],
				[left+size,top+size],
				[left,top+size]
			];
			for (var p = 0; p < 4; p++) {
				var coords = rotateCoords(buttonPolygon[p][0],buttonPolygon[p][1],obj.angle*180/Math.PI,'anti-cw',obj.center[0],obj.center[1]);
				buttonPolygon[p] = [coords.x,coords.y];
			}
			pos.push({shape:'polygon',dims:buttonPolygon,cursor:draw.cursors.pointer,func:draw.tracingPaper.setMode,obj:obj,mode:buttons1[i][0]});
			left += size;
		}
		
		if (obj.hasOwnDrawTools === true) {
			var buttons2 = [
				['pen',draw.tracingPaper.drawPenButton],
				['line',draw.tracingPaper.drawLineButton],
				['undo',draw.tracingPaper.drawUndoButton],
				['clear',draw.tracingPaper.drawClearButton]
			].reverse();
			left = center[0]+obj.width/2-size;
			for (var i = 0; i < buttons2.length; i++) {
				var buttonPolygon = [
					[left,top],
					[left+size,top],
					[left+size,top+size],
					[left,top+size]
				];
				for (var p = 0; p < 4; p++) {
					var coords = rotateCoords(buttonPolygon[p][0],buttonPolygon[p][1],obj.angle*180/Math.PI,'anti-cw',obj.center[0],obj.center[1]);
					buttonPolygon[p] = [coords.x,coords.y];
				}
				pos.push({shape:'polygon',dims:buttonPolygon,cursor:draw.cursors.pointer,func:draw.tracingPaper.setMode,obj:obj,mode:buttons2[i][0]});
				left -= size;
			}
		}

		if (obj.mode === 'fold') {
			var r = obj.width/2;
			var buttons = [
				[[center[0]-20, center[1]-r-20],'down'],
				[[center[0]-20, center[1]+r-20],'up'],
				[[center[0]+r-20, center[1]-20],'left'],
				[[center[0]-r-20, center[1]-20],'right']
			]
			for (var i = 0; i < 4; i++) {
				var pos2 = buttons[i][0];
				var buttonPolygon = [
					[pos2[0],pos2[1]],
					[pos2[0]+size,pos2[1]],
					[pos2[0]+size,pos2[1]+size],
					[pos2[0],pos2[1]+size]
				];
				for (var p = 0; p < 4; p++) {
					var coords = rotateCoords(buttonPolygon[p][0],buttonPolygon[p][1],obj.angle*180/Math.PI,'anti-cw',obj.center[0],obj.center[1]);
					buttonPolygon[p] = [coords.x,coords.y];
				}
				pos.push({shape:'polygon',dims:buttonPolygon,cursor:draw.cursors.move1,func:draw.tracingPaper.foldStart,obj:obj,direction:buttons[i][1]});
			}
		}
		return pos;
	},
	getTracingPapersInPaths: function(paths,includeHidden) {
		if (typeof paths === 'undefined') paths = draw.path;
		if (typeof includeHidden === 'undefined') includeHidden = true;
		var tp = [];
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (includeHidden === false && getPathVis(path) === false) continue;
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (obj.hasOwnDrawTools === true) continue;
				if (includeHidden === false && typeof obj.mode === 'string' && obj.mode.indexOf('fold-') === 0) continue;
				if (obj.type === 'tracingPaper') {
					obj._path = path;
					tp.push(obj);
				}
			}
		}
		return tp;
	},
	drawPosToTracingPaperPos:function(obj,pos) {
		var pos2 = rotateCoords(pos[0], pos[1], obj.angle*180/Math.PI, 'cw', obj.center[0], obj.center[1]);
		return [pos2.x-obj.center[0],pos2.y-obj.center[1]];
	},
	tracingPaperPosToDrawPos:function(obj,pos) {
		if (typeof obj._foldFactor === 'number' && obj._foldFactor > 0) {
			pos = clone(pos);
			var f = obj._foldFactor;
			if (obj.mode === 'fold-left' && pos[0] > 0) {			
				pos[0] *= (1-2*f);
				pos[1] += obj.width*f*(f-1);
			} else if (obj.mode === 'fold-right' && pos[0] < 0) {
				pos[0] *= (1-2*f);
				pos[1] += obj.width*f*(f-1);
			} else if (obj.mode === 'fold-up' && pos[1] > 0) {
				pos[1] *= (1-2*f);
				pos[0] -= obj.width*f*(f-1);
			} else if (obj.mode === 'fold-down' && pos[1] < 0) {
				pos[1] *= (1-2*f);
				pos[0] -= obj.width*f*(f-1);
			}
		}
		var pos2 = [pos[0]+obj.center[0], pos[1]+obj.center[1]];
		var pos2 = rotateCoords(pos2[0], pos2[1], -obj.angle*180/Math.PI, 'cw', obj.center[0], obj.center[1]);
		return [pos2.x,pos2.y];
	},
	setMode:function() {
		var obj = draw.currCursor.obj;
		var mode = draw.currCursor.mode;
		if (un(obj._startMode)) obj._startMode = obj.mode;
		if (mode === obj.mode) {
			obj.mode = 'none';
		} else if (mode === 'reset') {
			if (!un(obj._startCenter)) obj.center = clone(obj._startCenter);
			if (!un(obj._startAngle)) obj.angle = obj._startAngle;
			obj.mode = 'none';
		} else if (mode === 'undo') {
			if (!un(obj.drawPaths) && obj.drawPaths.length > 0) {
				obj.drawPaths.pop();
			}
		} else if (mode === 'clear') {
			delete obj.drawPaths;
		} else {
			obj.mode = mode;
		}
		drawCanvasPaths();
	},
	foldCalc:function() {
		var obj = draw.currCursor.obj;
		var dir = draw.currCursor.direction;
		obj.mode = 'fold-'+dir;
		obj._foldDrawPaths = [];
		obj._staticPaths = [];
		obj._foldPaths = [];
		obj._foldFactor = 0;
		if (!un(obj.drawPaths)) {
			obj._foldDrawPaths = clone(obj.drawPaths);
			
			for (var d = 0; d < obj._foldDrawPaths.length; d++) {
				var drawPath = obj._foldDrawPaths[d];
				if (drawPath.type === 'point') {
					var pos = drawPath.pos;
					if ((dir === 'left' && pos[0] > 0) || (dir === 'right' && pos[0] < 0) || (dir === 'up' && pos[1] > 0) || (dir === 'down' && pos[1] < 0)) {
						obj._foldPaths.push(drawPath);
					} else {
						obj._staticPaths.push(drawPath);
					}
				} else if (drawPath.type === 'arc') {					
					var intersections = [];
					if (dir === 'left' || dir === 'right') {
						var p1 = [0,-obj.width/2];
						var p2 = [0,obj.width/2];
					} else {
						var p1 = [-obj.width/2,0];
						var p2 = [obj.width/2,0];
					}
					var ints = lineCircleIntersections(p1,p2,drawPath.center,drawPath.radius);
					for (var i = 0; i < ints.length; i++) {
						var angle = ints[i][2];
						var anglesInInterval = getRecurranceOfAngleInInterval(angle,drawPath.startAngle,drawPath.finAngle);
						intersections = intersections.concat(anglesInInterval);
					}
					var angles = intersections.sort(function(a,b) {return a-b;});
					angles.unshift(drawPath.startAngle);
					angles.push(drawPath.finAngle);
					
					for (var a = 0; a < angles.length-1; a++) {
						var a1 = angles[a];
						var a2 = angles[a+1];
						while (a2 < a1) a2 += 2*Math.PI;
						var midAngle = (a1+a2)/2;
						var midPoint = [drawPath.center[0]+drawPath.radius*Math.cos(midAngle), drawPath.center[1]+drawPath.radius*Math.sin(midAngle)];
						var fold = false;
						if (dir === 'left' && midPoint[0] > 0) fold = true;
						if (dir === 'right' && midPoint[0] < 0) fold = true;
						if (dir === 'up' && midPoint[1] > 0) fold = true;
						if (dir === 'down' && midPoint[1] < 0) fold = true;
						var drawPath2 = clone(drawPath);
						drawPath2.startAngle = a1;
						drawPath2.finAngle = a2;
						if (fold === true) {
							obj._foldPaths.push(drawPath2);
						} else {
							obj._staticPaths.push(drawPath2);
						}
					}

				} else if (drawPath.type === 'line' || drawPath.type === 'pen') {
					var splitPos = [[drawPath.pos[0]]];
					for (var p = 1; p < drawPath.pos.length; p++) {
						var p1 = drawPath.pos[p-1];
						var p2 = drawPath.pos[p];
						if (['left','right'].indexOf(dir) > -1 && ((p1[0] <= 0 && p2[0] >= 0) || (p1[0] >= 0 && p2[0] <= 0))) {
							var mid = [0,p1[1]+(p1[0]/(p1[0]-p2[0]))*(p2[1]-p1[1])];
							splitPos.last().push(mid);
							splitPos.push([mid]);
						} else if (['up','down'].indexOf(dir) > -1 && ((p1[1] <= 0 && p2[1] >= 0) || (p1[1] >= 0 && p2[1] <= 0))) {
							var mid = [p1[0]+(p1[1]/(p1[1]-p2[1]))*(p2[0]-p1[0]),0];
							splitPos.last().push(mid);
							splitPos.push([mid]);
						}
						splitPos.last().push(p2);
					}
					for (var s = 0; s < splitPos.length; s++) {
						var splitPos2 = splitPos[s];
						var fold = false;
						for (var p = 0; p < splitPos2.length; p++) {
							if ((dir === 'left' && splitPos2[p][0] > 0) || (dir === 'right' && splitPos2[p][0] < 0) || (dir === 'up' && splitPos2[p][1] > 0) || (dir === 'down' && splitPos2[p][1] < 0)) {
								fold = true;
								break;
							}
						}
						var drawPath2 = clone(drawPath);
						drawPath2.pos = splitPos2;
						if (fold === true) {
							obj._foldPaths.push(drawPath2);
						} else {
							obj._staticPaths.push(drawPath2);
						}
					}
				} else if (drawPath.type === 'polygon') {
					obj._foldPaths.push(drawPath); // required for line symmetry tool
				}
			}
		}
		drawCanvasPaths();
	},
	foldStart:function(e) {
		updateMouse(e);
		var obj = draw.currCursor.obj;
		var dir = draw.currCursor.direction;
		if (obj.mode === 'fold') draw.tracingPaper.foldCalc(e);
		draw._drag = {obj:obj,dir:dir};
		draw.lockCursor = draw.cursors.move2;
		draw.cursorCanvas.style.cursor = draw.lockCursor;
		draw.animate(draw.tracingPaper.foldMove,draw.tracingPaper.foldStop,drawCanvasPaths);
	},
	foldMove:function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var dir = draw._drag.dir;
		var c = obj.center;
		var r = obj.width/2;
		if (dir === 'left') {
			var axis = [[c[0]+r,c[1]], [c[0]-r,c[1]]];
		} else if (dir === 'right') {
			var axis = [[c[0]-r,c[1]], [c[0]+r,c[1]]];
		} else if (dir === 'up') {
			var axis = [[c[0],c[1]+r], [c[0],c[1]-r]];
		} else if (dir === 'down') {
			var axis = [[c[0],c[1]-r], [c[0],c[1]+r]];
		}
		var coords1 = rotateCoords(axis[0][0],axis[0][1],obj.angle*180/Math.PI,'anti-cw',obj.center[0],obj.center[1]);
		axis[0] = [coords1.x,coords1.y];
		var coords2 = rotateCoords(axis[1][0],axis[1][1],obj.angle*180/Math.PI,'anti-cw',obj.center[0],obj.center[1]);
		axis[1] = [coords2.x,coords2.y];
		
		var p = axis[0];
		var d = [axis[1][0]-axis[0][0], axis[1][1]-axis[0][1]]
		var x = draw.mouse;
		var lambda = (x[0] * d[0] + x[1] * d[1] - p[0] * d[0] - p[1] * d[1]) / (d[0] * d[0] + d[1] * d[1]);
				
		obj._foldFactor = Math.max(0,Math.min(1,lambda));
		if (obj.modeFixed !== true) {
			if (obj._foldFactor === 0) {
				obj.mode = 'fold';
			} else {
				obj.mode = 'fold-'+dir;
			}
		}
		if (typeof obj.onchange === 'function') obj.onchange();
	},
	foldStop:function() {
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		delete draw.lockCursor;
		delete draw._drag;
	},
	lineStart:function(e) {
		updateMouse(e);
		var obj = draw.currCursor.obj;
		var pos = draw.tracingPaper.drawPosToTracingPaperPos(obj,draw.mouse);
		if (un(obj.drawPaths)) obj.drawPaths = [];
		var drawPath = {type:'line',pos:[pos],color:'#F00',thickness:5};
		obj.drawPaths.push(drawPath);
		draw._drag = {obj:obj,drawPath:drawPath};
		draw.animate(draw.tracingPaper.lineMove,draw.tracingPaper.lineStop,drawCanvasPaths);
	},
	lineMove:function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var drawPath = draw._drag.drawPath;
		var pos = draw.tracingPaper.drawPosToTracingPaperPos(obj,draw.mouse);
		drawPath.pos[1] = pos;
		if (typeof obj.onchange === 'function') obj.onchange();
	},
	lineStop:function() {
		delete draw._drag;
	},
	penStart:function(e) {
		updateMouse(e);
		var obj = draw.currCursor.obj;
		var pos = draw.tracingPaper.drawPosToTracingPaperPos(obj,draw.mouse);
		if (un(obj.drawPaths)) obj.drawPaths = [];
		var drawPath = {type:'pen',pos:[pos],color:'#F00',thickness:5};
		obj.drawPaths.push(drawPath);
		draw._drag = {obj:obj,drawPath:drawPath};
		draw.animate(draw.tracingPaper.penMove,draw.tracingPaper.penStop,drawCanvasPaths);
	},
	penMove:function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var drawPath = draw._drag.drawPath;
		var pos = draw.tracingPaper.drawPosToTracingPaperPos(obj,draw.mouse);
		drawPath.pos.push(pos);
		if (typeof obj.onchange === 'function') obj.onchange();
	},
	penStop:function() {
		delete draw._drag;
	},
	moveStart:function(e) {
		updateMouse(e);
		var obj = draw.currCursor.obj;
		if (!un(obj._path) && !un(obj._path._taskQuestion)) {
			var taskQuestion = obj._path._taskQuestion;
			obj._dragArea = [taskQuestion.left-obj.width/4,taskQuestion.top-obj.width/4,taskQuestion.width-taskQuestion.marginRight+obj.width/2,taskQuestion.height+obj.width/2];
		} else {
			obj._dragArea = [0-obj.width/2,0-obj.width/2,1200+obj.width,1700+obj.width];
		}
		if (un(obj._startCenter)) obj._startCenter = clone(obj.center);
		var offset = vector.getVectorAB(draw.mouse, obj.center);
		draw._drag = {obj:obj,offset:offset};
		draw.animate(draw.tracingPaper.moveMove,draw.tracingPaper.moveStop,drawCanvasPaths);
	},
	moveMove:function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var pos = vector.addVectors(draw._drag.offset, draw.mouse);
		if (snapToObj2On) pos = snapToObj2(pos);
		if (!un(obj._dragArea)) {
			pos[0] = Math.max(pos[0],obj._dragArea[0]+obj.width/2);
			pos[0] = Math.min(pos[0],obj._dragArea[0]+obj._dragArea[2]-obj.width/2);
			pos[1] = Math.max(pos[1],obj._dragArea[1]+obj.width/2);
			pos[1] = Math.min(pos[1],obj._dragArea[1]+obj._dragArea[3]-obj.width/2);
		}
		obj.center = pos;
		if (typeof obj.onchange === 'function') obj.onchange();
	},
	moveStop:function() {
		delete draw._drag;
	},
	rotateStart:function(e) {
		updateMouse(e);
		var obj = draw.currCursor.obj;
		if (un(obj._startAngle)) obj._startAngle = obj.angle;
		var offsetAngle = getAngleTwoPoints(obj.center,draw.mouse) - obj.angle;
		draw._drag = {obj:obj,offsetAngle:offsetAngle};
		draw.animate(draw.tracingPaper.rotateMove,draw.tracingPaper.rotateStop,drawCanvasPaths);
	},
	rotateMove:function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		obj.angle = getAngleTwoPoints(obj.center,draw.mouse) - draw._drag.offsetAngle;
		if (obj.snap !== false) {
			var da = obj.angle % (Math.PI/8);
			if (Math.abs(da) < 0.15) obj.angle -= da;
		}
		if (typeof obj.onchange === 'function') obj.onchange();
	},
	rotateStop:function() {
		delete draw._drag;
	}

}
draw.textInput = {
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var obj = {
			type: 'text2',
			text: [''],
			align: [0, 0],
			fontSize: 28,
			rect: [center[0]-125, center[1]-40, 250, 80],
			box: {
				type: 'loose',
				color: '#FFC',
				borderColor: '#000',
				borderWidth: 2
			},
			algPadding:4,
			fracScale:0.7,
			interact:{
				type:'text'
			}
		};
		draw.path.push({
			obj: [obj]
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	drawButton: function (ctx, size) {
		ctx.fillStyle = '#FFF';
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.fillRect(size * 8 / 55, size * 15 / 55, size * (55 - 16) / 55, size * 25 / 55);
		ctx.strokeRect(size * 8 / 55, size * 15 / 55, size * (55 - 16) / 55, size * 25 / 55);
		ctx.stroke();
		text({
			context: ctx,
			left: size * 8 / 55,
			width: size * (55 - 16) / 55,
			top: size * 15 / 55,
			textArray: ['<<font:Georgia>><<fontSize:' + size * 20 / 55 + '>><<align:center>>I']
		});
	},
}
draw.dropMenu = {
	/*properties: [
	text:{type:'array'},
	rect:{type:'array'},
	align:{type:'array',required:false},

	],*/
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var obj = {
			type: 'dropMenu',
			text: ["Questions"],
			align: [-1, 0],
			rect: [center[0]-100, center[1]-25, 200, 50],
			fontSize: 32,
			box: {
				type: 'loose',
				color: '#3FF',
				borderColor: '#000',
				borderWidth: 3
			},
			optionBox: {
				color: '#CFF',
				lineWidth: 2,
				align: [0, 0]
			},
			showDownArrow: true,
			downArrowSize: 12,
			options: [{
					text: ["1"],
					value: 1
				}, {
					text: ["2"],
					value: 2
				}, {
					text: ["3"],
					value: 3
				}
			],
			value: 1,
			_open: false,
			onchange: function (obj) {
				console.log(obj.value);
			}
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (typeof obj.drawOption === 'function' && !un(obj._selectedOption)) {
			var obj2 = draw.clone(obj);
			var opt = obj._selectedOption;
			obj2.box.color = !un(opt.color) ? opt.color : opt.value === obj.value ? obj2.box.color : obj2.optionBox.color;
			obj2.text = [];
			draw.text2.draw(ctx,obj2,path);
			var rect = [obj2.rect[0],obj2.rect[1],obj2.rect[2]-25,obj2.rect[3]];
			obj.drawOption(ctx,rect,opt);
		} else {
			draw.text2.draw(ctx, obj, path);
		}
		var obj2 = isElement(obj) ? obj : clone(obj);
		
		if (obj.showDownArrow == true) {
			ctx.fillStyle = '#000';
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			var t = obj.rect[1] + obj.rect[3] / 2;
			var s = obj.downArrowSize || 8;
			var l = obj.rect[0] + obj.rect[2] - 7 - s;
			ctx.beginPath();
			ctx.moveTo(l - s, t - s / 2);
			ctx.lineTo(l + s, t - s / 2);
			ctx.lineTo(l, t + s);
			ctx.lineTo(l - s, t - s / 2);
			ctx.fill();
		}
		
		if (obj._open === true) {
			var obj2 = isElement(obj) ? obj : clone(obj);
			var top = obj2.rect[1];
			var height = obj2.rect[3];
			if (!un(obj.scrollSize) && obj.options.length > obj.scrollSize) {
			
				if (un(obj._scrollObj)) {
					obj._scrollObj = {
						left:obj.rect[0]+obj.rect[2]-30,
						top:obj.rect[1]+obj.rect[3],
						width:30,
						height:height*obj.scrollSize,
						buttonHeight:25,
						scrollView:obj.scrollSize,
						scrollMax:obj.options.length,
						value:0
					}
				}
				obj._scrollObj.left = obj.rect[0]+obj.rect[2]-30;
				obj._scrollObj.top = obj.rect[1]+obj.rect[3];
				draw.verticalScrollbar.draw(ctx,obj._scrollObj);
				
				for (var o = obj._scrollObj.value; o < obj._scrollObj.value+obj.scrollSize; o++) {
					var opt = obj2.options[o];
					var obj3 = draw.clone(obj2);
					top += height;
					obj3.rect[2] -= obj._scrollObj.width;
					obj3.rect[1] = top;
					obj3.align = obj2.optionBox.align;
					obj3.box.color = !un(opt.color) ? opt.color : opt.value === obj.value ? obj2.box.color : obj2.optionBox.color;
					obj3.box.lineWidth = obj2.optionBox.lineWidth;
					if (typeof obj.drawOption === 'function') {
						obj3.text = [];
						draw.text2.draw(ctx, obj3, path);
						var rect = [obj2.rect[0],top,obj2.rect[2]-obj._scrollObj.width,obj2.rect[3]];
						obj.drawOption(ctx,rect,opt);
					} else {
						obj3.text = opt.text;
						draw.text2.draw(ctx, obj3, path);
					}
				}
			} else {
				for (var o = 0; o < obj2.options.length; o++) {
					var opt = obj2.options[o];
					var obj3 = draw.clone(obj2);
					top += height;
					obj3.rect[1] = top;
					obj3.align = obj2.optionBox.align;
					obj3.box.color = !un(opt.color) ? opt.color : opt.value === obj.value ? obj2.box.color : obj2.optionBox.color;
					obj3.box.lineWidth = obj2.optionBox.lineWidth;
					if (typeof obj.drawOption === 'function') {
						obj3.text = [];
						draw.text2.draw(ctx, obj3, path);
						var rect = [obj2.rect[0],top,obj2.rect[2],obj2.rect[3]];
						obj.drawOption(ctx,rect,opt);
					} else {
						obj3.text = opt.text;
						draw.text2.draw(ctx, obj3, path);
					}
				}
			}
		}
	},
	getRect: function (obj) {
		var rect = clone(obj.rect);
		if (obj._open == true) {
			rect[3] *= (obj.options.length + 1)
		}
		return rect;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		if (obj._open == true)
			dh /= (obj.options.length + 1);
		obj.rect[3] += dh;
	},
	resizable: true,
	textEdit: true,
	getButtons: function (x1, y1, x2, y2, pathNum, path) {
		if (un(path) && un(pathNum))
			return;
		if (un(path))
			path = draw.path[pathNum];
		if (un(path.obj))
			return;
		var obj = path.obj[0];
		var buttons = [];
		buttons.push({
			buttonType: 'dropMenu-open',
			shape: 'rect',
			dims: [x2 - 40, y1, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.dropMenu.clickToggleOpen,
			path: draw.path[pathNum],
			pathNum: pathNum,
			obj: obj,
			draw: function (path, ctx, l, t, w, h) {
				var obj = path.obj[0];
				ctx.fillStyle = colorA('#F99', 0.5);
				ctx.fillRect(l, t, w, h);
				ctx.fillStyle = '#000';
				ctx.lineJoin = 'round';
				ctx.lineCap = 'round';
				var t2 = t + h / 2;
				var l2 = l + w / 2;
				var s = w * 0.4;

				ctx.beginPath();

				if (obj._open === true) {
					ctx.moveTo(l2 - s, t2 + s / 2);
					ctx.lineTo(l2 + s, t2 + s / 2);
					ctx.lineTo(l2, t2 - s);
					ctx.lineTo(l2 - s, t2 + s / 2);
				} else {
					ctx.moveTo(l2 - s, t2 - s / 2);
					ctx.lineTo(l2 + s, t2 - s / 2);
					ctx.lineTo(l2, t2 + s);
					ctx.lineTo(l2 - s, t2 - s / 2);
				}

				ctx.fill();
			}
		});
		return buttons;
	},
	clickToggleOpen: function () {
		var obj = draw.currCursor.obj;
		obj._open = un(obj._open) ? true : !obj._open;
		if (!un(draw.currCursor.path)) updateBorder(draw.currCursor.path);
		drawCanvasPaths();
	},
	clickSetValue: function (obj) {
		var obj = draw.currCursor.obj;
		var value = draw.currCursor.value;
		obj._selectedOption = draw.currCursor.option;
		//console.log(obj._selectedOption);
		obj._open = false;
		if (obj.value !== value) {
			obj.value = value;
			for (var o = 0; o < obj.options.length; o++) {
				var opt = obj.options[o];
				if (opt.value === value) {
					if (!un(opt.text)) obj.text = clone(opt.text);
					break;
				}
			}
			if (typeof obj.onchange == 'function') {
				obj.onchange(obj);
			}
		}
		drawCanvasPaths();
	},
	getCursorPositionsInteract: function (obj, path) {
		var pos = [];
		pos.push({
			shape: 'rect',
			dims: obj.rect,
			cursor: draw.cursors.pointer,
			func: draw.dropMenu.clickToggleOpen,
			interact: true,
			path: path,
			obj: obj
		});

		if (obj._open === true) {
			var top = obj.rect[1];
			var height = obj.rect[3];
			var width = obj.rect[2];
			
			if (!un(obj.scrollSize) && !un(obj._scrollObj)) {	
				width -= obj._scrollObj.width;
				for (var p = 0; p < obj._scrollObj._cursorPositions.length; p++) {
					var pos2 = obj._scrollObj._cursorPositions[p];
					pos2.dontCloseDropMenus = true;
					pos.push(pos2);
				}
				
				for (var o2 = obj._scrollObj.value; o2 < obj._scrollObj.value+obj.scrollSize; o2++) {
					var opt = obj.options[o2];
					top += height;
					pos.push({
						shape: 'rect',
						dims: [obj.rect[0], top, width, height],
						cursor: draw.cursors.pointer,
						func: draw.dropMenu.clickSetValue,
						interact: true,
						path: path,
						obj: obj,
						option:opt,
						value: opt.value
					});
				}
			} else {
				for (var o2 = 0; o2 < obj.options.length; o2++) {
					var opt = obj.options[o2];
					top += height;
					pos.push({
						shape: 'rect',
						dims: [obj.rect[0], top, width, height],
						cursor: draw.cursors.pointer,
						func: draw.dropMenu.clickSetValue,
						interact: true,
						path: path,
						obj: obj,
						option:opt,
						value: opt.value
					});
				}
			}
		}

		return pos;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		return [{
				shape: 'rect',
				dims: clone(obj.tightRect),
				cursor: draw.cursors.text,
				func: textEdit.selectStart,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			}
		];
	},
	
	getScrollWheelPositions: function(obj) {
		if (obj._open === true && !un(obj.scrollSize) && !un(obj._scrollObj) && obj.options.length > obj.scrollSize) {
			return [{
					shape: 'rect',
					dims: [obj.rect[0],obj.rect[1]+obj.rect[3],obj.rect[2],obj.scrollSize*obj.rect[3]],
					func: draw.dropMenu.onScrollWheel,
					obj: obj
				}
			];
		} else {
			return [];
		}
	},
	onScrollWheel: function(pos,dy) {
		var obj = pos.obj;
		var scrollObj = obj._scrollObj;
		dy = Math.ceil(dy/250);
		scrollObj.value = Math.max(0,Math.min(scrollObj.scrollMax-scrollObj.scrollView,scrollObj.value+dy));
	}
}
draw.verticalScrollbar = {
	default:{
		left:0,
		top:0,
		width:30,
		height:200,
		buttonHeight:25,
		scrollView:5,
		scrollMax:10,
		value:2,
		backColor:'#EEE',
		buttonColor:'#DEDEDE',
		markerColor:'#AAA',
		borderColor:'#000',
		borderWidth:2
	},
	draw:function(ctx,obj) {
		obj._cursorPositions = [];
		
		var width = !un(obj.width) ? obj.width : this.default.width;
		var buttonHeight = !un(obj.buttonHeight) ? obj.buttonHeight : this.default.buttonHeight;
		var value = !un(obj.value) ? obj.value : this.default.value;
		
		obj._scrollAreaRect = [obj.left,obj.top+buttonHeight,width,obj.height-2*buttonHeight];
		
		var scrollMarkerHeight = obj._scrollAreaRect[3]*obj.scrollView/obj.scrollMax;
		var scrollMarkerTop = value * (obj._scrollAreaRect[3]-scrollMarkerHeight) / (obj.scrollMax-obj.scrollView);
		obj._scrollMarkerRect = [obj.left,obj._scrollAreaRect[1]+scrollMarkerTop,width,scrollMarkerHeight];
		
		obj._topButtonRect = [obj.left,obj.top,width,buttonHeight];
		obj._bottomButtonRect = [obj.left,obj.top+obj.height-buttonHeight,width,buttonHeight];

		ctx.fillStyle = !un(obj.backColor) ? obj.backColor : this.default.backColor;
		ctx.fillRect(obj._scrollAreaRect[0],obj._scrollAreaRect[1],obj._scrollAreaRect[2],obj._scrollAreaRect[3]);
		
		ctx.fillStyle = !un(obj.buttonColor) ? obj.buttonColor : this.default.buttonColor;
		ctx.fillRect(obj._topButtonRect[0],obj._topButtonRect[1],obj._topButtonRect[2],obj._topButtonRect[3]);
		ctx.fillRect(obj._bottomButtonRect[0],obj._bottomButtonRect[1],obj._bottomButtonRect[2],obj._bottomButtonRect[3]);
		
		ctx.fillStyle = !un(obj.markerColor) ? obj.markerColor : this.default.markerColor;
		var s = 7;
		var t = obj._topButtonRect[1] + obj._topButtonRect[3] / 2;
		var l = obj._topButtonRect[0] + obj._topButtonRect[2] / 2;
		ctx.beginPath();
		ctx.moveTo(l - s, t + s);
		ctx.lineTo(l + s, t + s);
		ctx.lineTo(l, t - s / 2);
		ctx.lineTo(l - s, t + s);
		ctx.fill();
		
		var t = obj._bottomButtonRect[1] + obj._bottomButtonRect[3] / 2;
		var l = obj._bottomButtonRect[0] + obj._bottomButtonRect[2] / 2;
		ctx.beginPath();
		ctx.moveTo(l - s, t - s / 2);
		ctx.lineTo(l + s, t - s / 2);
		ctx.lineTo(l, t + s);
		ctx.lineTo(l - s, t - s / 2);
		ctx.fill();		
		
		obj._cursorPositions.push({
			shape: 'rect',
			dims: obj._topButtonRect,
			cursor: draw.cursors.pointer,
			func: draw.verticalScrollbar.scrollUp,
			interact: true,
			obj: obj,
			path: null
		});
		if (value > 0) {
			obj._cursorPositions.push({
				shape: 'rect',
				dims: [obj.left,obj._topButtonRect[1]+obj._topButtonRect[3],width,obj._scrollMarkerRect[1]-(obj._topButtonRect[1]+obj._topButtonRect[3])],
				cursor: draw.cursors.pointer,
				func: draw.verticalScrollbar.scrollUp2,
				interact: true,
				obj: obj,
				path: null
			});
		}
		
		obj._cursorPositions.push({
			shape: 'rect',
			dims: obj._bottomButtonRect,
			cursor: draw.cursors.pointer,
			func: draw.verticalScrollbar.scrollDown,
			interact: true,
			obj: obj,
			path: null
		});
		if (value < obj.scrollMax-obj.scrollView) {
			obj._cursorPositions.push({
				shape: 'rect',
				dims: [obj.left,obj._scrollMarkerRect[1]+obj._scrollMarkerRect[3],width,obj._bottomButtonRect[1]-(obj._scrollMarkerRect[1]+obj._scrollMarkerRect[3])],
				cursor: draw.cursors.pointer,
				func: draw.verticalScrollbar.scrollDown2,
				interact: true,
				obj: obj,
				path: null
			});
		}
		
		ctx.fillStyle = !un(obj.markerColor) ? obj.markerColor : this.default.markerColor;
		ctx.fillRect(obj._scrollMarkerRect[0],obj._scrollMarkerRect[1],obj._scrollMarkerRect[2],obj._scrollMarkerRect[3]);
		
		obj._cursorPositions.push({
			shape: 'rect',
			dims: obj._scrollMarkerRect,
			cursor: draw.cursors.move1,
			func: draw.verticalScrollbar.scrollMoveStart,
			interact: true,
			obj: obj,
			path: null
		});
		
		ctx.strokeStyle = !un(obj.borderColor) ? obj.borderColor : this.default.borderColor;
		ctx.lineWidth = !un(obj.borderWidth) ? obj.borderWidth : this.default.borderWidth;
		ctx.strokeRect(obj.left,obj.top,width,obj.height);
		
	},
	scrollUp:function() {
		var obj = draw.currCursor.obj;
		if (obj.value > 0) {
			obj.value--;
			drawCanvasPaths();
		}
	},
	scrollDown:function() {
		var obj = draw.currCursor.obj;
		if (un(obj.value)) obj.value = 0;
		if (obj.value < obj.scrollMax-obj.scrollView) {
			obj.value++;
			drawCanvasPaths();
		}
	},
	scrollUp2:function() {
		var obj = draw.currCursor.obj;
		obj.value = Math.max(0,obj.value-obj.scrollView);
		drawCanvasPaths();
	},
	scrollDown2:function() {
		var obj = draw.currCursor.obj;
		if (un(obj.value)) obj.value = 0;
		obj.value = Math.min(obj.scrollMax-obj.scrollView,obj.value+obj.scrollView);
		drawCanvasPaths();
	},
	scrollMoveStart:function(e) {
		updateMouse(e);
		var obj = draw.currCursor.obj;
		draw.verticalScrollbar._scrollMove = {
			obj: obj,
			offset: draw.mouse[1] - obj._scrollMarkerRect[1]
		}
		draw.animate(draw.verticalScrollbar.scrollMoveMove,draw.verticalScrollbar.scrollMoveStop,drawCanvasPaths);
		draw.lockCursor = draw.cursors.move2;
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
	},
	scrollMoveMove:function(e) {
		updateMouse(e);
		var obj = draw.verticalScrollbar._scrollMove.obj;
		var y = draw.mouse[1] - draw.verticalScrollbar._scrollMove.offset;
		var value = Math.round((y - obj._scrollAreaRect[1]) / (obj._scrollAreaRect[3] / obj.scrollMax));
		obj.value = Math.max(0,Math.min(obj.scrollMax-obj.scrollView,value));
	},
	scrollMoveStop:function() {
		delete draw.verticalScrollbar._scrollMove;
		delete draw.lockCursor;
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
	}
}
draw.container = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var obj = {
			type: 'container',
			center: center,
			lineWidth: 8,
			lineColor: '#000',
			fillColor: '#99F',
			fillLevel: 200,
			shape: [{
					type: 'line',
					pos: [[0, 50], [200, 200]]
				}
			]
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj) {
		ctx.translate(obj.center[0], obj.center[1]);
		for (var s = 0; s < obj.shape.length; s++) {
			var shape = obj.shape[s];
			if (obj.fillLevel >= shape.pos[1][0]) {
				ctx.fillStyle = obj.fillColor;
				ctx.beginPath();
				ctx.moveTo(shape.pos[0][1], -shape.pos[0][0]);
				ctx.lineTo(shape.pos[1][1], -shape.pos[1][0]);
				ctx.lineTo(-shape.pos[1][1], -shape.pos[1][0]);
				ctx.lineTo(-shape.pos[0][1], -shape.pos[0][0]);
				ctx.fill();
			} else if (obj.fillLevel > shape.pos[0][0]) {
				var w = draw.container.getWidthAtHeight(obj, obj.fillLevel);
				ctx.fillStyle = obj.fillColor;
				ctx.beginPath();
				ctx.moveTo(shape.pos[0][1], -shape.pos[0][0]);
				ctx.lineTo(w, -obj.fillLevel);
				ctx.lineTo(-w, -obj.fillLevel);
				ctx.lineTo(-shape.pos[0][1], -shape.pos[0][0]);
				ctx.fill();
			}
		}

		ctx.beginPath();
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.strokeStyle = obj.lineColor;
		ctx.lineWidth = obj.lineWidth;
		ctx.moveTo(0, 0);
		for (var s = 0; s < obj.shape.length; s++) {
			var shape = obj.shape[s];
			ctx.lineTo(shape.pos[0][1], -shape.pos[0][0]);
			ctx.lineTo(shape.pos[1][1], -shape.pos[1][0]);
		}
		ctx.moveTo(0, 0);
		for (var s = 0; s < obj.shape.length; s++) {
			var shape = obj.shape[s];
			ctx.lineTo(-shape.pos[0][1], -shape.pos[0][0]);
			ctx.lineTo(-shape.pos[1][1], -shape.pos[1][0]);
		}
		ctx.stroke();
		ctx.translate(-obj.center[0], -obj.center[1]);
	},
	getWidthAtHeight: function (obj, h) {
		var w = 0;
		for (var s = 0; s < obj.shape.length; s++) {
			var shape = obj.shape[s];
			if (shape.type == 'line' && shape.pos[0][0] <= h && h <= shape.pos[1][0]) {
				return shape.pos[0][1] + ((h - shape.pos[0][0]) / (shape.pos[1][0] - shape.pos[0][0])) * (shape.pos[1][1] - shape.pos[0][1]);
			}
		}
		return w;
	},
	getTotalArea: function (obj) {
		var area = 0;
		for (var s = 0; s < obj.shape.length; s++) {
			var shape = obj.shape[s];
			if (shape.type == 'line') {
				var w1 = shape.pos[0][1];
				var w2 = shape.pos[1][1];
				var hh = shape.pos[1][0] - shape.pos[0][0];
				area += 0.5 * (w1 + w2) * hh;
			}
		}
		return area;
	},
	getHeightAtArea: function (obj, area) {
		var h = 0;
		var areaCount = 0;
		for (var s = 0; s < obj.shape.length; s++) {
			var shape = obj.shape[s];
			if (shape.type == 'line') {
				var w1 = shape.pos[0][1];
				var w2 = shape.pos[1][1];
				var hh = shape.pos[1][0] - shape.pos[0][0];
				var shapeArea = 0.5 * (w1 + w2) * hh;
				if (areaCount + shapeArea >= area) {
					area -= areaCount;
					if (w1 == w2) {
						return shape.pos[0][0] + area / w1;
					} else {
						var m = (w2 - w1) / hh;
						return shape.pos[0][0] + (Math.sqrt(w1 * w1 + 2 * m * area) - w1) / m;
					}
				}
				areaCount += shapeArea;
				h = shape.pos[1][0];
			}
		}
		return h;
	},
	setFillLevelToArea: function (obj, area) {
		obj.fillLevel = draw.container.getHeightAtArea(obj, area);
	},
	getTotalVolume: function (obj) {
		var vol = 0;
		for (var s = 0; s < obj.shape.length; s++) {
			var shape = obj.shape[s];
			if (shape.type == 'line') {
				var r1 = shape.pos[0][1];
				var r2 = shape.pos[1][1];
				var h = shape.pos[1][0] - shape.pos[0][0];
				vol += (Math.PI / 3) * h * (r1 * r1 + r2 * r2 + r1 * r2);
			}
		}
		return vol;
	},
	getHeightAtVolume: function (obj, vol) {
		var h = 0;
		var volCount = 0;
		for (var s = 0; s < obj.shape.length; s++) {
			var shape = obj.shape[s];
			if (shape.type == 'line') {
				var r1 = shape.pos[0][1];
				var r2 = shape.pos[1][1];
				var hh = shape.pos[1][0] - shape.pos[0][0];
				var shapeVol = (Math.PI / 3) * hh * (r1 * r1 + r2 * r2 + r1 * r2);
				if (volCount + shapeVol >= vol) {
					vol -= volCount;
					var m = (r2 - r1) / hh;
					var d = -vol;
					var c = Math.PI * r1 * r1;
					var b = Math.PI * r1 * m;
					var a = (Math.PI / 3) * m * m;
					var h2 = solveCubic(a, b, c, d)[0];
					return shape.pos[0][0] + h2;
					//return shape.pos[0][0]+(3*vol)/(Math.PI*(r1*r1+r2*r2+r1*r2));
				}
				volCount += shapeVol;
				h = shape.pos[1][0];
			}
		}
		return h;
	},
	setFillLevelToVolume: function (obj, vol) {
		obj.fillLevel = draw.container.getHeightAtVolume(obj, vol);
	},
	getRect: function (obj) {
		var xMax = 0;
		var yMax = 0;
		for (var s = 0; s < obj.shape.length; s++) {
			var shape = obj.shape[s];
			xMax = Math.max(xMax, shape.pos[0][1], shape.pos[1][1]);
			yMax = Math.max(yMax, shape.pos[0][0], shape.pos[1][0]);
		}
		return [obj.center[0] - xMax, obj.center[1] - yMax, xMax * 2, yMax];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
	},
	/*getCursorPositionsUnselected: function(obj,pathNum) {
	return [{shape:'rect',dims:obj.rect,cursor:draw.cursors.pointer,func:drawClickSelect,obj:obj,pathNum:pathNum,highlight:-1}];
	},*/
	/*getSnapPos: function(obj) {
	var snapPos = [];
	var left = obj.rect[0];
	var top = obj.rect[1];
	var width = obj.rect[2];
	var height = obj.rect[3];

	if (boolean(obj.vertical == true)) {
	var x0 = left+0.5*width;

	if (typeof obj.arrows == 'number') {
	snapPos.push({type:'point',pos:[x0,obj.rect[1]]});
	snapPos.push({type:'point',pos:[x0,obj.rect[1]+obj.rect[3]]});
	top += obj.arrows;
	height -= 2*obj.arrows;
	}

	var y0 = top-(obj.min*height)/(obj.max-obj.min);

	var minorSpacing = (height*obj.minorStep)/(obj.max-obj.min);
	var yAxisPoint = y0;
	while (Math.round(yAxisPoint) <= Math.round(top + height)) {
	if (Math.round(yAxisPoint) >= Math.round(top)) {
	snapPos.push({type:'point',pos:[x0,yAxisPoint]});
	}
	yAxisPoint += minorSpacing;
	}
	var yAxisPoint = y0 - minorSpacing;
	while (Math.round(yAxisPoint) >= Math.round(top)) {
	if (Math.round(yAxisPoint) <= Math.round(top + height)) {
	snapPos.push({type:'point',pos:[x0,yAxisPoint]});
	}
	yAxisPoint -= minorSpacing;
	}

	var majorSpacing = (height*obj.majorStep)/(obj.max-obj.min);
	var yAxisPoint = y0;
	while (Math.round(yAxisPoint) <= Math.round(top + height)) {
	if (Math.round(yAxisPoint) >= Math.round(top)) {
	snapPos.push({type:'point',pos:[x0,yAxisPoint]});
	}
	yAxisPoint += majorSpacing;
	}
	var yAxisPoint = y0 - majorSpacing;
	while (Math.round(yAxisPoint) >= Math.round(top)) {
	if (Math.round(yAxisPoint) <= Math.round(top + height)) {
	snapPos.push({type:'point',pos:[x0,yAxisPoint]});
	}
	yAxisPoint -= majorSpacing;
	}
	} else {
	var y0 = top+0.5*height;

	if (typeof obj.arrows == 'number') {
	snapPos.push({type:'point',pos:[obj.rect[0],y0]});
	snapPos.push({type:'point',pos:[obj.rect[0]+obj.rect[2],y0]});
	left += obj.arrows;
	width -= 2*obj.arrows;
	}

	var x0 = left-(obj.min*width)/(obj.max-obj.min);

	var minorSpacing = (width*obj.minorStep)/(obj.max-obj.min);
	var xAxisPoint = x0;
	while (Math.round(xAxisPoint) <= Math.round(left + width)) {
	if (Math.round(xAxisPoint) >= Math.round(left)) {
	snapPos.push({type:'point',pos:[xAxisPoint,y0]});
	}
	xAxisPoint += minorSpacing;
	}
	var xAxisPoint = x0 - minorSpacing;
	while (Math.round(xAxisPoint) >= Math.round(left)) {
	if (Math.round(xAxisPoint) <= Math.round(left + width)) {
	snapPos.push({type:'point',pos:[xAxisPoint,y0]});
	}
	xAxisPoint -= minorSpacing;
	}

	var majorSpacing = (width*obj.majorStep)/(obj.max-obj.min);
	var xAxisPoint = x0;
	while (Math.round(xAxisPoint) <= Math.round(left + width)) {
	if (Math.round(xAxisPoint) >= Math.round(left)) {
	snapPos.push({type:'point',pos:[xAxisPoint,y0]});
	}
	xAxisPoint += majorSpacing;
	}
	var xAxisPoint = x0 - majorSpacing;
	while (Math.round(xAxisPoint) >= Math.round(left)) {
	if (Math.round(xAxisPoint) <= Math.round(left + width)) {
	snapPos.push({type:'point',pos:[xAxisPoint,y0]});
	}
	xAxisPoint -= majorSpacing;
	}
	}

	return snapPos;
	},*/
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.lineColor = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.lineColor;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},
	/*getButtons: function(x1,y1,x2,y2,pathNum) {
	var buttons = [];
	if (un(draw.path[pathNum])) return [];
	var obj = draw.path[pathNum].obj[0];

	var dims = obj.vertical == true ? [x1,y1+20,20,20] : [x1+20,y1,20,20];
	var button = {buttonType:'numberline-toggleHorizVert',shape:'rect',dims:dims,cursor:draw.cursors.pointer,func:draw.numberline.toggleHorizVert,pathNum:pathNum};
	button.draw = function(path,ctx,l,t,w,h) {
	ctx.fillStyle = colorA('#F96',0.5);
	ctx.fillRect(l,t,w,h);
	ctx.strokeStyle = colorA('#000',0.5);
	ctx.strokeRect(l,t,w,h);
	ctx.beginPath();
	if (boolean(path.obj[0].vertical,false) == true) {
	ctx.moveTo(l+0.5*w,t+0.15*h);
	ctx.lineTo(l+0.5*w,t+0.85*h);
	for (var i = 0; i < 4; i++) {
	ctx.moveTo(l+0.4*w,t+(0.15+(0.7/3)*i)*h);
	ctx.lineTo(l+0.6*w,t+(0.15+(0.7/3)*i)*h);
	}
	} else {
	ctx.moveTo(l+0.15*w,t+0.5*h);
	ctx.lineTo(l+0.85*w,t+0.5*h);
	for (var i = 0; i < 4; i++) {
	ctx.moveTo(l+(0.15+(0.7/3)*i)*w,t+0.4*h);
	ctx.lineTo(l+(0.15+(0.7/3)*i)*w,t+0.6*h);
	}
	}
	ctx.stroke();
	}
	buttons.push(button);

	var dims = obj.vertical == true ? [x1,y1+40,20,20] : [x1+40,y1,20,20];
	var button = {buttonType:'numberline-toggleScale',shape:'rect',dims:dims,cursor:draw.cursors.pointer,func:draw.numberline.toggleScale,pathNum:pathNum};
	button.draw = function(path,ctx,l,t,w,h) {
	if (boolean(path.obj[0].showScales,true) == true) {
	ctx.fillStyle = colorA('#F96',0.5);
	ctx.fillRect(l,t,w,h);
	}
	ctx.strokeStyle = colorA('#000',0.5);
	ctx.strokeRect(l,t,w,h);
	text({ctx:ctx,textArray:['<<fontSize:'+(w/2)+'>>123'],left:l,top:t,width:w,height:h,textAlign:'center',vertAlign:'middle'});
	}
	buttons.push(button);

	var dims = obj.vertical == true ? [x1,y1+60,20,20] : [x1+60,y1,20,20];
	var button = {buttonType:'numberline-toggleMinorPos',shape:'rect',dims:dims,cursor:draw.cursors.pointer,func:draw.numberline.toggleMinorPos,pathNum:pathNum};
	button.draw = function(path,ctx,l,t,w,h) {
	if (boolean(path.obj[0].showMinorPos,true) == true) {
	ctx.fillStyle = colorA('#F96',0.5);
	ctx.fillRect(l,t,w,h);
	}
	ctx.strokeStyle = colorA('#000',0.5);
	ctx.strokeRect(l,t,w,h);
	text({ctx:ctx,textArray:['<<fontSize:'+(w/2)+'>>min'],left:l,top:t,width:w,height:h,textAlign:'center',vertAlign:'middle'});
	}
	buttons.push(button);

	var dims = obj.vertical == true ? [x1,y1+80,20,20] : [x1+80,y1,20,20];
	var button = {buttonType:'numberline-toggleArrows',shape:'rect',dims:dims,cursor:draw.cursors.pointer,func:draw.numberline.toggleArrows,pathNum:pathNum};
	button.draw = function(path,ctx,l,t,w,h) {
	if (typeof path.obj[0].arrows == 'number') {
	ctx.fillStyle = colorA('#F96',0.5);
	ctx.fillRect(l,t,w,h);
	}
	ctx.strokeStyle = colorA('#000',0.5);
	ctx.strokeRect(l,t,w,h);
	drawArrow({ctx:ctx,startX:l+0.2*w,startY:t+0.5*h,finX:l+0.8*w,finY:t+0.5*h,doubleEnded:true,color:'#000',lineWidth:1,fillArrow:true,arrowLength:5});
	}
	buttons.push(button);

	return buttons;
	},*/
	/*drawButton: function() {
	var l = 0;
	var t = 0;
	var w = draw.buttonSize;
	var h = draw.buttonSize;
	var ctx = this.ctx;

	roundedRect(ctx,3,3,w-6,h-6,8,6,'#000',draw.buttonColor);

	ctx.strokeStyle = draw.color;
	ctx.lineWidth = 2*(w/55);
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	ctx.save();
	ctx.beginPath();
	ctx.moveTo(l+0.15*w,t+0.5*h);
	ctx.lineTo(l+0.85*w,t+0.5*h);
	for (var i = 0; i < 4; i++) {
	ctx.moveTo(l+(0.15+(0.7/3)*i)*w,t+0.4*h);
	ctx.lineTo(l+(0.15+(0.7/3)*i)*w,t+0.6*h);
	}
	ctx.stroke();
	ctx.restore();
	},*/
	/*drawButton: function(ctx,size) {
	ctx.strokeStyle = '#000';
	ctx.lineWidth = 0.03*size;

	ctx.beginPath();
	ctx.moveTo(0.15*size,0.5*size);
	ctx.lineTo(0.85*size,0.5*size);
	for (var i = 0; i < 4; i++) {
	ctx.moveTo((0.15+(0.7/3)*i)*size,0.4*size);
	ctx.lineTo((0.15+(0.7/3)*i)*size,0.6*size);
	}
	ctx.stroke();
	},*/
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
			obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		}
		for (var s = 0; s < obj.shape.length; s++) {
			var shape = obj.shape[s];
			shape.pos[0][0] *= sf;
			shape.pos[0][1] *= sf;
			shape.pos[1][0] *= sf;
			shape.pos[1][1] *= sf;
		}
		obj.fillLevel *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
};

draw.text2 = {
	addBox: function (obj) {
		if (un(obj.box))
			obj.box = {
				type: 'loose',
				borderColor: '#000',
				borderWidth: 3,
				radius: 0,
				color: 'none'
			}
		obj.box.type = 'loose';
	},
	getRect: function (obj) {
		var rect = clone(obj.rect);
		if (!un(obj.box) && obj.box.type == 'flowArrow') {
			rect[2] += obj.box.arrowWidth / 2 || 20;
			if (obj.box.dir == 'left')
				rect[0] -= obj.box.arrowWidth / 2 || 20;
		}
		if (textEdit.obj === obj && !un(obj.interact) && obj.interact.moveHandle === true) {
			rect[0] = obj.rect[0]-45;
			rect[2] = obj.rect[2]+45;
		}
		return rect;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		if (draw.mode !== 'edit') return [];
		var left = obj.rect[0];
		var top = obj.rect[1];
		var right = left+obj.rect[2];
		var bottom = top+obj.rect[3];
		return [{
				shape: 'line',
				dims: [[right,top],[right,bottom],draw.selectTolerance],
				cursor: draw.cursors.ew,
				func: draw.text2.horizResize,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			},{
				shape: 'line',
				dims: [[left,bottom],[right,bottom],draw.selectTolerance],
				cursor: draw.cursors.ns,
				func: draw.text2.vertResize,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			},{
				shape: 'rect',
				dims: clone(obj._tightRect),
				cursor: draw.cursors.text,
				func: textEdit.selectStart,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			}
		];
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'text-horizResizeCollapse',
			shape: 'rect',
			dims: [x2 - 20, y2 - 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.text2.horizResizeCollapse,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'text-horizResize',
			shape: 'rect',
			dims: [x2 - 20, y2 - 60, 20, 20],
			cursor: draw.cursors.ew,
			func: draw.text2.horizResize,
			pathNum: pathNum
		});

		buttons.push({
			buttonType: 'text2-underline',
			shape: 'rect',
			dims: [x1, y2 - 60, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.text2.setUnderline,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'text2-fracScale',
			shape: 'rect',
			dims: [x1, y2 - 80, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.text2.setFracScale,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'text2-algPadding',
			shape: 'rect',
			dims: [x1, y2 - 100, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.text2.setAlgPadding,
			pathNum: pathNum
		});

		buttons.push({
			buttonType: '',
			shape: 'rect',
			dims: [x1 + 20, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.text2.toggleVertical,
			pathNum: pathNum,
			draw: function(path,ctx,l,t,w,h,button) {
				text({ctx:ctx,rect:[l,t,w,h],text:['⯈'],align:[0,0],fontSize:16,box:{type:'loose',color:'#9F9',borderWidth:0.01}});
			}
		});

		var path = draw.path[pathNum];
		if (!un(path) && path.obj.length == 1 && !un(path.isInput) && path.isInput.type == 'text') {

			var obj = path.obj[0];
			if (un(obj.ans))
				obj.ans = [];
			/*buttons.push({buttonType:'text-input-prevAns',shape:'rect',dims:[x1+20,y2-20,20,20],cursor:draw.cursors.pointer,func:draw.text2.textInput.ansPrev,pathNum:pathNum});
			buttons.push({buttonType:'text-input-ansInfo',shape:'rect',dims:[x1+40,y2-20,30,20],cursor:draw.cursors.default,func:function() {},pathNum:pathNum,text:String(obj.ansIndex+1)+'/'+String(Math.max(obj.ansIndex+1,obj.ans.length))});
			buttons.push({buttonType:'text-input-nextAns',shape:'rect',dims:[x1+70,y2-20,20,20],cursor:draw.cursors.pointer,func:draw.text2.textInput.ansNext,pathNum:pathNum});
			buttons.push({buttonType:'text-input-algText',shape:'rect',dims:[x2-40,y1,20,20],cursor:draw.cursors.pointer,func:draw.text2.textInput.algTextToggle,pathNum:pathNum,algText:obj.font == 'algebra'});
			//buttons.push({buttonType:'text-input-tickStyle',shape:'rect',dims:[x2-40,y1,20,20],cursor:draw.cursors.pointer,func:draw.text2.textInput.setTickStyle,pathNum:pathNum});


			buttons.push({buttonType:'qBox-marksMinus',shape:'rect',dims:[x2-90,y2-20,20,20],cursor:draw.cursors.pointer,func:draw.text2.textInput.marksMinus,pathNum:pathNum,draw: function(path,ctx,l,t,w,h) {
			ctx.fillStyle = colorA('#F99',0.5);
			ctx.fillRect(l,t,w,h);
			text({ctx:ctx,align:[0,0],rect:[l,t,w,h],text:['<<fontSize:14>><<bold:true>>-']})
			}});
			buttons.push({buttonType:'qBox-marks',shape:'rect',dims:[x2-70,y2-20,30,20],cursor:draw.cursors.pointer,func:function() {},pathNum:pathNum,draw: function(path,ctx,l,t,w,h) {
			var obj = path.obj[0];
			var marks = un(obj.ans[obj.ansIndex]) ? 0 : obj.ans[obj.ansIndex].marks;
			obj.maxMarks = 0;
			for (var a = 0; a < obj.ans.length; a++) {
			if (un(obj.ans[a].marks)) continue;
			obj.maxMarks = Math.max(obj.maxMarks,obj.ans[a].marks);
			}
			text({ctx:ctx,align:[0,0],rect:[l,t,w,h],text:['<<fontSize:14>>'+marks+'/'+obj.maxMarks]})
			}});
			buttons.push({buttonType:'qBox-marksPlus',shape:'rect',dims:[x2-40,y2-20,20,20],cursor:draw.cursors.pointer,func:draw.text2.textInput.marksPlus,pathNum:pathNum,draw: function(path,ctx,l,t,w,h) {
			ctx.fillStyle = colorA('#F99',0.5);
			ctx.fillRect(l,t,w,h);
			text({ctx:ctx,align:[0,0],rect:[l,t,w,h],text:['<<fontSize:14>><<bold:true>>+']})
			}});*/

		} else {
			buttons.push({
				buttonType: 'text-vertResizeCollapse',
				shape: 'rect',
				dims: [x2 - 40, y2 - 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.text2.vertResizeCollapse,
				pathNum: pathNum
			});
			buttons.push({
				buttonType: 'text2-fullWidth',
				shape: 'rect',
				dims: [x2 - 60, y2 - 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.text2.setFullWidth,
				pathNum: pathNum
			});
		}

		return buttons;
	},

	getCursorPositionsInteract: function (obj, path, pathNum) {
		var buttons = [];
		if (!un(obj.interact) && obj.interact.type === 'text' && obj.interact.disabled !== true && obj.interact._disabled !== true) {
			buttons.push({
				shape: 'rect',
				dims: clone(obj.rect),
				cursor: draw.cursors.text,
				func: draw.text2.textInput.interactStartTextInput,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			});
			if (textEdit.obj === obj && !un(obj.interact) && obj.interact.moveHandle === true) {
				buttons.push({
					shape: 'circle',
					dims: [obj.rect[0]+obj.rect[2]/2,obj.rect[1]-25,12],
					cursor: draw.cursors.move1,
					func: draw.text2.interactTextMoveStart,
					obj: obj,
					pathNum: pathNum,
					highlight: -1,
					endTextInput: false
				});
				buttons.push({
					shape: 'circle',
					dims: [obj.rect[0]+obj.rect[2]+15,obj.rect[1]-5,12],
					cursor: draw.cursors.pointer,
					func: draw.text2.interactTextDelete,
					obj: obj,
					pathNum: pathNum,
					path:path,
					highlight: -1
				});
			}
		}
		if (!un(obj._floatingToolsCursorPositions) && obj._floatingToolsCursorPositions.length > 0) {
			buttons = buttons.concat(obj._floatingToolsCursorPositions);
		}
		return buttons;
	},
	interactTextMoveStart:function() {
		changeDrawMode('drag');
		
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.dragSnapped = false;

		var obj = draw.currCursor.obj;
		var path = obj._path;
		var pos = draw.mouse;
		var canvas = draw.hiddenCanvas;
		
		var l = path.tightBorder[0]-10;
		var t = path.tightBorder[1]-10;
		var w = path.tightBorder[2]+20;
		var h = path.tightBorder[3]+20;
		canvas.width = w+100;
		canvas.height = h+100;
		canvas.ctx.translate(-l,-t);
		drawObjToCtx(canvas.ctx,path,obj);
		path._dragImage = new Image();
		path._dragImage.src = canvas.toDataURL("image/png");
		canvas.ctx.translate(l,t);
		path._dragOffset = [path.tightBorder[0]-pos[0],path.tightBorder[1]-pos[1]];
				
		var dragBorder = {tightBorder:{},border:{}};
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

		dragBorder.border.offset = [dragBorder.border.left-pos[0],dragBorder.border.top-pos[1]];
		dragBorder.tightBorder.offset = [dragBorder.tightBorder.left-pos[0],dragBorder.tightBorder.top-pos[1]];
		
		draw.drag = {
			paths:[path],
			pos:clone(draw.mouse),
			initialPos:clone(draw.mouse),
			dragBorder:dragBorder,
			dragObjType:'text',
			dragObjs:[obj],
			dragObjTypes:[['text',1]],
			showDragBorder:false
		};
		drawCanvasPaths();
		draw.drawCanvas[draw.drawCanvas.length-1].ctx.clear();
		draw.drawCanvas[draw.drawCanvas.length-2].ctx.clear();
		
		//selectDragDraw();
		//draw.animate(draw.text2.interactTextMoveMove,draw.text2.interactTextMoveStop,selectDragDraw);
		
		drawSelectedPaths();
		draw.animate(draw.text2.interactTextMoveMove,draw.text2.interactTextMoveStop,drawSelectedPaths);
	},
	interactTextMoveMove: function(e) {
		updateMouse(e);
		var paths = draw.drag.paths;
		var dragBorder = draw.drag.dragBorder;
		var pos = [
			Math.max(0,Math.min(draw.mouse[0],1200-dragBorder.tightBorder.width-dragBorder.tightBorder.offset[0])),
			Math.max(-dragBorder.tightBorder.offset[1],Math.min(draw.mouse[1],1700-dragBorder.tightBorder.height-dragBorder.tightBorder.offset[1]))
		];
		
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
	},
	interactTextMoveStop: function(e) {
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
	},
	interactTextDelete:function() {
		var obj = draw.currCursor.obj;
		var path = obj._path;
		var index = draw.path.indexOf(obj._path);
		if (index > -1) {
			draw.path.splice(index,1);
			drawCanvasPaths();
			draw.cursorCanvas.style.cursor = draw.cursors.default;
			if (textArrayCompress(obj.text) !== '') {
				var page = pages[pIndex];
				if (un(page._deletedPathsInteract)) page._deletedPathsInteract = [];
				page._deletedPathsInteract.push({deletedTime:Date.parse(new Date()),index:index,path:obj._path});
			}
		}
	},
	textInput: {
		interactStartTextInput: function () {
			var pathIndex = draw.currCursor.pathNum;
			var obj = draw.currCursor.obj;
			delete obj._check;
			deselectAllPaths();
			textEdit.endInput();
			obj._path._interacting = true;
			obj.textEdit = true;
			textEdit._type = 'textInput';
			drawCanvasPaths();
			textEdit.start(pathIndex, obj);
			if (typeof teach === 'object' && typeof teach.keyboard === 'object') teach.keyboard.moveAwayFromTextInput();
			
		},
		ansPrev: function () {
			var path = draw.path[draw.currCursor.pathNum];
			var obj = path.obj[0];
			var currText = removeTags(clone(obj.text));
			if (obj.ansIndex == 0)
				return;
			if (un(obj.ans))
				obj.ans = [];
			if (un(obj.ans[obj.ansIndex]))
				obj.ans[obj.ansIndex] = {
					text: [''],
					marks: 1
				};
			if (arraysEqual(removeTags(clone(currText)), [''])) {
				obj.ans.splice(obj.ansIndex, 1);
			} else {
				obj.ans[obj.ansIndex].text = currText;
			}
			obj.ansIndex--;
			if (obj.ans[obj.ansIndex]instanceof Array) {
				obj.text = clone(obj.ans[obj.ansIndex].text);
				obj.ans[obj.ansIndex] = {
					text: obj.text,
					marks: 1
				};
			} else if (!un(obj.ans[obj.ansIndex].text)) {
				obj.text = clone(obj.ans[obj.ansIndex].text);
			}
			updateBorder(path);
			drawCanvasPaths();
		},
		ansNext: function () {
			var path = draw.path[draw.currCursor.pathNum];
			var obj = path.obj[0];
			var currText = clone(obj.text);
			if (un(obj.ans))
				obj.ans = [];
			if (un(obj.ans[obj.ansIndex]))
				obj.ans[obj.ansIndex] = {
					text: [''],
					marks: 1
				};
			if (arraysEqual(removeTags(clone(currText)), [''])) {
				if (obj.ansIndex >= obj.ans.length - 1)
					return;
				obj.ans.splice(obj.ansIndex, 1);
			} else {
				obj.ans[obj.ansIndex].text = currText;
			}
			obj.ansIndex++;
			if (obj.ansIndex == obj.ans.length) {
				obj.text = [textArrayGetStartTags(clone(obj.text))];
				obj.ans[obj.ansIndex] = {
					text: obj.text,
					marks: 1
				};
			} else {
				if (obj.ans[obj.ansIndex]instanceof Array) {
					obj.text = clone(obj.ans[obj.ansIndex].text);
				} else if (!un(obj.ans[obj.ansIndex].text)) {
					obj.text = clone(obj.ans[obj.ansIndex].text);
				}
			}
			updateBorder(path);
			drawCanvasPaths();
		},
		algTextToggle: function () {
			var path = draw.path[draw.currCursor.pathNum];
			var obj = path.obj[0];
			if (obj.type !== 'text2')
				return;
			if (un(obj.font))
				obj.font = 'Arial';
			obj.font = obj.font == 'algebra' ? 'Arial' : 'algebra';
			updateBorder(path);
			drawCanvasPaths();
		},
		setTickStyle: function () {
			var path = draw.path[draw.currCursor.pathNum];
			if (path.isInput.tickStyle == 'small') {
				delete path.isInput.tickStyle;
			} else {
				path.isInput.tickStyle = 'small';
			}
			updateBorder(path);
			drawCanvasPaths();
		},
		/*numToggle:function() {
		var path = draw.path[draw.currCursor.pathNum];
		path.obj[0].isInput.num = !path.obj[0].isInput.num;
		updateBorder(path);
		drawCanvasPaths();
		},
		oeToggle:function() {
		var path = draw.path[draw.currCursor.pathNum];
		path.obj[0].isInput.oe = !path.obj[0].isInput.oe;
		updateBorder(path);
		drawCanvasPaths();
		},*/
		/*check: function(obj,answerData) {
		if (un(obj) || obj.type !== 'text2') {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		if (obj.type !== 'text2') return;
		}
		var ans = !un(answerData) ? answerData.text : textArrayToLowerCase(removeTags(clone(textArrayReplace(obj.text,' ',''))));

		obj._check = false;
		for (var a = 0; a < obj.ans.length; a++) {
		var ans2 = obj.ans[a] instanceof Array ? obj.ans[a] : obj.ans[a].text;
		ans2 = textArrayToLowerCase(removeTags(clone(textArrayReplace(ans2,' ',''))));
		if (arraysEqual(ans,ans2)) {
		obj._check = true;
		break;
		}
		}
		return obj._check;
		},*/
		/*uncheck: function(obj) {
		delete obj._check;
		drawCanvasPaths();
		},*/
		reset: function (obj) {
			obj.text = [""];
			delete obj._check;
			drawCanvasPaths();
		},
		marksMinus: function () {
			var path = draw.path[draw.currCursor.pathNum];
			var obj = path.obj[0];
			if (obj.type !== 'text2')
				return;
			var ans = obj.ans[obj.ansIndex];
			if (un(ans.marks))
				return;
			ans.marks = Math.max(0, ans.marks - 1);
			updateBorder(path);
			drawCanvasPaths();
		},
		marksPlus: function () {
			var path = draw.path[draw.currCursor.pathNum];
			var obj = path.obj[0];
			if (obj.type !== 'text2')
				return;
			var ans = obj.ans[obj.ansIndex];
			ans.marks++;
			updateBorder(path);
			drawCanvasPaths();
		}
	},

	properties: {
		text: {
			type: 'text',
			get: function (obj) {
				return clone(obj.text);
			},
			set: function (obj, value) {
				if (typeof value == 'string')
					value = [value];
				draw.text2.extractStartTags(obj);
				obj.text = clone(value);
			}
		},
	},
	getStartTags: function (obj) {
		var tags = clone(defaultTags);

		if (!un(obj.tags)) {
			for (var key in obj.tags) {
				tags[key] = clone(obj.tags[key]);
			}
		}
		for (var key in tags) {
			if (!un(obj[key])) {
				tags[key] = clone(obj[key]);
			}
		}

		if (!un(obj.text) && !un(obj.text[0])) {
			var str = obj.text[0];
			while (str.length > 2 && str.slice(0, 2) == '<<' && str.slice(0, 3) !== '<<<' && str.indexOf('>>') !== -1) {
				var pos = str.indexOf('>>') + 2;
				var tag = str.slice(0, pos);
				var pos2 = tag.indexOf(':');
				var key = tag.slice(2, pos2);
				var value = tag.slice(pos2 + 1, -2);
				if (key !== 'align') {
					if (value == 'true') {
						value = true;
					} else if (value == 'false') {
						value = false;
					} else if (!isNaN(Number(value))) {
						value = Number(value);
					}
					tags[key] = value;
				}
				str = str.slice(pos);
			}
		}
		return tags;
	},
	extractStartTags: function (obj) {
		if (!un(obj.tags)) {
			for (var key in obj.tags) {
				if (obj.tags[key] !== defaultTags[key])
					obj[key] = obj.tags[key];
			}
			delete obj.tags;
		}

		if (un(obj.text) || un(obj.text[0]))
			return;
		while (obj.text[0].length > 2 && obj.text[0].slice(0, 2) == '<<' && obj.text[0].slice(0, 3) !== '<<<' && obj.text[0].indexOf('>>') !== -1) {
			var pos = obj.text[0].indexOf('>>') + 2;
			var tag = obj.text[0].slice(0, pos);

			var pos2 = tag.indexOf(':');
			var key = tag.slice(2, pos2);
			var value = tag.slice(pos2 + 1, -2);
			if (key == 'align') {
				if (un(obj.align))
					obj.align = [-1, def([obj.vertAlign, -1])];
				obj.align[0] = value == 'center' ? 0 : value == 'right' ? 1 : -1;
			} else if (value == 'true') {
				obj[key] = true;
			} else if (value == 'false') {
				obj[key] = false;
			} else if (!isNaN(Number(value))) {
				obj[key] = Number(value);
			} else {
				obj[key] = value;
			}
			obj.text[0] = obj.text[0].slice(pos);
		}
	},

	setFracScale: function (obj) {
		if (un(obj)) {
			var obj = draw.path[draw.currCursor.pathNum].obj[0];
		}
		if (obj.fracScale == 1) {
			delete obj.fracScale;
		} else {
			obj.fracScale = 1;
		}
		drawCanvasPaths();
	},
	setUnderline: function (obj) {
		if (un(obj)) {
			var obj = draw.path[draw.currCursor.pathNum].obj[0];
		}
		if (obj.underline == true) {
			delete obj.underline;
		} else {
			obj.underline = true;
		}
		drawCanvasPaths();
	},
	setAlgPadding: function () {
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		if (typeof obj.algPadding == 'undefined') {
			obj.algPadding = 0;
		} else if (obj.algPadding == 5) {
			delete obj.algPadding;
		} else {
			obj.algPadding++;
		}
		drawCanvasPaths();
	},
	setLineWidth: function (obj, lineWidth) {
		if (un(obj.box))
			draw.text2.addBox(obj);
		obj.box.borderWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		if (un(obj.box)) {
			draw.text2.addBox(obj);
			obj.box.color = 'none';
		}
		obj.box.borderColor = color;
		if (obj.box.borderColor == 'none' && obj.box.color == 'none')
			delete obj.box;
	},
	setFillColor: function (obj, color) {
		if (un(obj.box)) {
			draw.text2.addBox(obj);
			obj.box.borderColor = 'none';
		}
		obj.box.color = color;
		if (obj.box.borderColor == 'none' && obj.box.color == 'none')
			delete obj.box;
	},
	setRadius: function (obj, radius) {
		if (un(obj.box))
			draw.text2.addBox(obj);
		obj.box.radius = radius;
	},
	getLineWidth: function (obj) {
		return !un(obj.box) ? obj.box.borderWidth : 2;
	},
	getLineColor: function (obj) {
		return !un(obj.box) ? obj.box.borderColor : '#000';
	},
	getFillColor: function (obj) {
		return !un(obj.box) ? obj.box.color : 'none';
	},
	getRadius: function (obj) {
		if (un(obj.box))
			return 0;
		if (un(obj.box.radius))
			return 0;
		if (!isNaN(Number(obj.box.radius)))
			return Number(obj.box.radius);
		return 0;
	},
	setFullWidth: function (obj) {
		if (un(obj)) {
			var obj = draw.path[draw.currCursor.pathNum].obj[0];
		}
		obj.rect[0] = draw.gridMargin[0];
		obj.rect[2] = draw.drawArea[2] - (draw.gridMargin[0] + draw.gridMargin[2]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		obj.text = simplifyText(obj.text);
		if (typeof obj.color === 'string' && obj.color.length === 3) obj.color = '#'+obj.color;
		delete obj.ctx;
		var obj2 = clone(obj);
		obj2.ctx = ctx;
		/*if (!un(path.isInput) && path.isInput.type == 'text') {
		var mode = path.isInput.mode || 'none';
		if (mode == 'input') {
		var backColors = path.isInput.backColors || {correct:'#CFC',wrong:'#FCC',unchecked:'#FFF'};
		if (obj2._check === true) {
		obj2.box.color = backColors.correct;
		} else if (obj._check === false) {
		obj2.box.color = backColors.wrong;
		} else {
		obj2.box.color = backColors.unchecked;
		}
		} else if (mode == 'inputShowAnswer') {
		obj2.box.color = '#FFF';
		obj2.color = '#F00';
		if (!un(obj2.ansDisplay)) {
		obj2.text = obj2.ansDisplay;
		} else if (!un(obj2.ans)) {
		if (obj2.ans[0] instanceof Array) {
		obj2.text = obj2.ans[0];
		} else {
		obj2.text = obj2.ans[0].text;
		}
		}
		} else if (mode == 'showAnswer' || (draw.triggerEnabled === true && draw.triggerNum === 1)) {
		delete obj2.box;
		obj2.color = '#F00';
		if (!un(obj2.ansDisplay)) {
		obj2.text = obj2.ansDisplay;
		} else if (!un(obj2.ans)) {
		if (obj2.ans[0] instanceof Array) {
		obj2.text = obj2.ans[0];
		} else {
		obj2.text = obj2.ans[0].text;
		}
		}
		} else if (draw.mode !== 'edit') {
		return;
		}
		}*/
		if (!un(obj._inputFeedbackMode) && !un(obj2.box) && (un(obj._taskQuestion) || obj._taskQuestion._mode === 'checked')) {
			if (obj._inputFeedbackMode.indexOf('green') > -1) {
				obj2.box.color = '#9F9';
			} else if (obj._inputFeedbackMode.indexOf('yellow') > -1) {
				obj2.box.color = '#FF6';
			} else if (obj._inputFeedbackMode.indexOf('red') > -1) {
				obj2.box.color = '#F99';
			} else if (obj._inputFeedbackMode.indexOf('white') > -1) {
				obj2.box.color = '#FFF';
			}
		}
		if (obj._highlight === true) {
			if (!un(obj.interact) && obj.interact.fitToText === true) {
				obj2.rect[2] = 2000;
				obj2.measureOnly = true;
				var measure = text(obj2);
				delete obj2.measureOnly;
				obj2.rect[2] = obj.rect[2];
				if (measure.lineRects.length === 1) {
					obj.rect[2] = measure.lineRects[0][2];
					obj.rect[3] = measure.lineRects[0][3];
				} else {
					obj.rect[2] = measure.tightRect[2];
					obj.rect[3] = measure.tightRect[3];
				}
			}
			ctx.save();
			//ctx.filter = "blur(4px)";
			ctx.fillStyle = '#FF0';
			ctx.fillRect(obj.rect[0]-5, obj.rect[1], obj.rect[2]+10, obj.rect[3]);
			ctx.restore();
		}
		var measure = text(obj2);
		obj._tightRect = measure.tightRect;
		obj2._tightRect = measure.tightRect;
		delete obj.tightRect;
		delete obj2.tightRect;
		if (!un(obj2.underline)) {
			if (!un(measure.textLoc) && !un(measure.textLoc[0]) && measure.textLoc[0].length > 1) {
				var loc = measure.textLoc[0];
				var pos = [];
				for (var i = 0; i < loc.length; i++) {
					if (pos.length == 0) {
						if (boolean(loc[i].markupTag, false) == true)
							continue;
						pos = [[loc[i].left, loc[i].top + loc[i].height], [loc[i].left + loc[i].width, loc[i].top + loc[i].height]];
					} else {
						if (boolean(loc[i].markupTag, false) == true)
							break;
						//if (Math.abs(loc[i].top + loc[i].height - pos[0][1]) > 0.1) break;
						pos[1][0] = loc[i].left + loc[i].width;
					}
				}
				if (pos.length !== 0) {
					ctx.beginPath();
					ctx.lineWidth = 3;
					ctx.strokeStyle = '#000';
					ctx.moveTo(pos[0][0], pos[0][1]);
					ctx.lineTo(pos[1][0], pos[1][1]);
					ctx.stroke();
				}
			}
		}
		if (obj2.textEdit == true) {
			if ((un(path.isInput) || path.isInput.type !== 'text') && obj2.autoHeight === true) {
				obj.rect[3] = Math.max(obj2.rect[3], measure.tightRect[3]);
			}
			textEdit.cursorMap = textEdit.mapTextLocs(obj2, measure.textLoc, measure.softBreaks, measure.hardBreaks);
			textEdit.tightRect = measure.tightRect;
			textEdit.textLoc = measure.textLoc;
			//textEdit.softBreaks = measure.softBreaks;
			//textEdit.hardBreaks = measure.hardBreaks;
			textEdit.lineRects = measure.lineRects;
			textEdit.path = path;
			textEdit.pathIndex = draw.path.indexOf(path);
			delete textEdit.allMap;
			textEdit.blinkReset();
			if (!un(textEdit.menu)) textEdit.menu.update();
		}
		if (!un(obj._inputFeedbackMode) && (un(obj._taskQuestion) || obj._taskQuestion._mode === 'checked')) {
			var x = obj.rect[0]+obj.rect[2]+25;
			var y = obj.rect[1]+obj.rect[3]/2;
			var r = 15;
			if (obj._inputFeedbackMode.indexOf('tick') > -1) {
				ctx.save();
				ctx.lineWidth = r*0.25;
				ctx.strokeStyle = '#060';
				ctx.moveTo(x+r,y);
				ctx.arc(x,y,r,0,2*Math.PI);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(x-r*0.45,y);
				ctx.lineTo(x-r*0.15,y+r*0.3);
				ctx.lineTo(x+r*0.45,y-r*0.3);
				ctx.stroke();
				ctx.restore();
			} else if (obj._inputFeedbackMode.indexOf('cross') > -1) {
				ctx.save();
				ctx.lineWidth = r*0.2;
				ctx.strokeStyle = '#F00';
				ctx.moveTo(x+r,y);
				ctx.arc(x,y,r,0,2*Math.PI);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(x-r*0.4,y-r*0.4);
				ctx.lineTo(x+r*0.4,y+r*0.4);
				ctx.moveTo(x-r*0.4,y+r*0.4);
				ctx.lineTo(x+r*0.4,y-r*0.4);
				ctx.stroke();
				ctx.restore();
			}
		}
		if (!un(obj.interact) && obj.interact.fitToText === true) {
			obj.rect[2] = measure.tightRect[2];
			obj.rect[3] = measure.tightRect[3];
		}
		
		obj._floatingToolsCursorPositions = [];
		if (textEdit.obj === obj && !un(obj.interact) && obj.interact.moveHandle === true) {
			ctx.strokeStyle = obj.color;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.rect(obj.rect[0]-15,obj.rect[1]-5,obj.rect[2]+30,obj.rect[3]+10);
			
			ctx.moveTo(obj.rect[0]+obj.rect[2]/2,obj.rect[1]-5);
			ctx.lineTo(obj.rect[0]+obj.rect[2]/2,obj.rect[1]-25);
			ctx.stroke();
			ctx.fillStyle = obj.color;
			ctx.beginPath();
			ctx.arc(obj.rect[0]+obj.rect[2]/2,obj.rect[1]-25,12,0,2*Math.PI);
			ctx.fill();
			
			/*ctx.moveTo(obj.rect[0]-10,obj.rect[1]+obj.rect[3]/2);
			ctx.lineTo(obj.rect[0]-40,obj.rect[1]+obj.rect[3]/2);
			ctx.stroke();
			ctx.fillStyle = obj.color;
			ctx.beginPath();
			ctx.arc(obj.rect[0]-40,obj.rect[1]+obj.rect[3]/2,12,0,2*Math.PI);
			ctx.fill();*/
			
			calcCursorPositions();
		}
		if (!un(path)) updateBorder(path);
	},
	drawOverlay:function(ctx, obj, path) {
		obj._floatingToolsCursorPositions = [];
		if (textEdit.obj === obj && !un(obj.interact) && obj.interact.moveHandle === true) {
			if (draw.drawMode !== 'drag' || un(draw.drag) || un(draw.drag.dragObjs) || draw.drag.dragObjs.indexOf(obj) === -1) {
				ctx.fillStyle = '#F00';
				ctx.strokeStyle = '#FFF';
				ctx.lineWidth = 4;
				var x1 = obj.rect[0]+obj.rect[2]+15;
				var y1 = obj.rect[1]-5;
				ctx.beginPath();
				ctx.arc(x1,y1,12,0,2*Math.PI);
				ctx.fill();
				ctx.beginPath();
				ctx.moveTo(x1-5,y1-5);
				ctx.lineTo(x1+5,y1+5);
				ctx.moveTo(x1+5,y1-5);
				ctx.lineTo(x1-5,y1+5);
				ctx.stroke();
				
				var h = 40;
				var width = h*4+30;
				var height = h*4+40;
				var left = obj.rect[0]+obj.rect[2]/2-width/2+10;
				var top = obj.rect[1]+obj.rect[3]+10;
				var colors = ['#000', '#999', '#00F', '#F00', '#393', '#F0F', '#93C', '#F60'];
				var cols = 2;
				var rect = [left-10,top-10,width,height];
				obj._floatingToolsRect = rect;
				roundedRect(ctx,rect[0],rect[1],rect[2],rect[3],10,3,'#000','#C9F');
				obj._floatingToolsCursorPositions.push({
					shape: 'rect',
					dims: rect,
					cursor: draw.cursors.default,
					func: function() {},
					endTextInput:false
				});
				for (var c = 0; c < colors.length; c++) {
					var col = c%cols;
					var row = Math.floor(c/cols);
					var x = left+col*h;
					var y = top+row*h+(obj.type === 'text2' ? 10 : obj.type === 'point' ? 0 : 5);
					var color = colors[c];
					var color2 = color === 'none' ? '#FFF' : color;
					text({
						ctx:ctx,
						rect:[x,y,h,h],
						text:[""],
						box:{
							type:'loose',
							color:color2,
							borderWidth:1,
							borderColor:'#000'
						}
					});
					obj._floatingToolsCursorPositions.push({
						shape: 'rect',
						dims: [x,y,h,h],
						cursor: draw.cursors.pointer,
						func: draw.objList.itemSetProperty,
						obj: obj,
						key: 'color',
						value: color,
						endTextInput:false
					});
				}
							
				var x = left+90;
				var y = top;
				
				ctx.fillStyle = '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 40, 40);
				ctx.strokeRect(x, y, 40, 40);
				draw.icons.text(ctx,x,y,40,{text:['A'],color:'#000',fontSize:0.5*h});
				ctx.fillStyle = '#666';
				ctx.beginPath();
				ctx.moveTo(x+0.68*h,y+0.15*h);
				ctx.lineTo(x+0.92*h,y+0.15*h);
				ctx.lineTo(x+0.8*h,y+0.3*h);
				ctx.lineTo(x+0.68*h,y+0.15*h);
				ctx.fill();
				obj._floatingToolsCursorPositions.push({
					shape: 'rect',
					dims: [x, y, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj,
					key: 'fontSize',
					value: Math.max(obj.fontSize-8,16),
					endTextInput:false
				});
				
				x += 40;
				
				ctx.fillStyle = '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 40, 40);
				ctx.strokeRect(x, y, 40, 40);
				draw.icons.text(ctx,x,y,40,{text:['A'],color:'#000',fontSize:0.5*h});
				ctx.fillStyle = '#666';
				ctx.beginPath();
				ctx.moveTo(x+0.68*h,y+0.3*h);
				ctx.lineTo(x+0.92*h,y+0.3*h);
				ctx.lineTo(x+0.8*h,y+0.15*h);
				ctx.lineTo(x+0.68*h,y+0.3*h);
				ctx.fill();
				obj._floatingToolsCursorPositions.push({
					shape: 'rect',
					dims: [x, y, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj,
					key: 'fontSize',
					value: Math.min(obj.fontSize+8,72),
					endTextInput:false
				});
				
				x -= 40;
				y += 50;
				
				ctx.fillStyle = obj.bold === true ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 40, 40);
				ctx.strokeRect(x, y, 40, 40);
				draw.icons.text(ctx,x,y,40,{text:['B'],color:'#000',bold:true});
				obj._floatingToolsCursorPositions.push({
					shape: 'rect',
					dims: [x, y, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj,
					key: 'bold',
					value: obj.bold === true ? false : true,
					endTextInput:false
				});
				
				x += 40;
				
				ctx.fillStyle = obj.italic === true ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 40, 40);
				ctx.strokeRect(x, y, 40, 40);
				draw.icons.text(ctx,x,y,40,{text:['I'],color:'#000',font:'algebra',italic:true});
				obj._floatingToolsCursorPositions.push({
					shape: 'rect',
					dims: [x, y, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj,
					key: 'italic',
					value: obj.italic === true ? false : true,
					endTextInput:false
				});
				
				x -= 40;
				y += 50;
				
				ctx.fillStyle = obj.font === 'Arial' ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 80, 40);
				ctx.strokeRect(x, y, 80, 40);
				text({ctx:ctx,rect:[x,y,80,40],text:['Arial'],font:'Arial',fontSize:20,align:[0,0]});
				obj._floatingToolsCursorPositions.push({
					shape: 'rect',
					dims: [x, y, 80, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj,
					key: 'font',
					value: 'Arial',
					endTextInput:false,
					updateKeyboardFont:true
				});
				
				y += 40;
				
				ctx.fillStyle = obj.font === 'algebra' ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 80, 40);
				ctx.strokeRect(x, y, 80, 40);
				text({ctx:ctx,rect:[x,y,80,40],text:['algebra'],font:'algebra',fontSize:20,align:[0,0]});
				obj._floatingToolsCursorPositions.push({
					shape: 'rect',
					dims: [x, y, 80, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj,
					key: 'font',
					value: 'algebra',
					endTextInput:false,
					updateKeyboardFont:true
				});
			}
		}
	},
	getAriaText: function(obj) {
		obj.measureOnly = true;
		var measure = text(obj);
		delete obj.measureOnly;
		var ariaText = textArrayToAriaText(obj.text);
		if (ariaText.length > 10 && ['.',',','?','!',':',';'].indexOf(ariaText.slice(-1)) === -1) ariaText += '.';
		return [{
			text:ariaText,
			rect:measure.tightRect
		}];
	},
	
	start: function () {
		deselectAllPaths(false);
		//var x = mouse.x - draw.drawRelPos[0];
		//var y = mouse.y - draw.drawRelPos[1];
		var x = draw.mouse[0];
		var y = draw.mouse[1];
		var w = Math.min(draw.drawArea[2] - x - 2 * draw.selectPadding, 600);
		var resource = file.resources[resourceIndex];
		var fontSize = resource._type === 'slides' ? 32 : 28;
		var obj = {
			type: 'text2',
			rect: [x, y, w, 54],
			fontSize:fontSize,
			text: [""],
			align: [-1, -1],
			textEdit: true
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		drawCanvasPaths();
		textEdit.start(draw.path.length - 1, obj, 0);
		redrawButtons();
	},
	toggleBorder: function () {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		if (un(obj.showBorder)) {
			obj.showBorder = true;
			obj.color = '#000';
			obj.thickness = 2;
			obj.fillColor = 'none';
		} else {
			obj.showBorder = !obj.showBorder;
		}
		drawSelectedPaths();
	},
	horizResize: function (e) {
		updateMouse(e);
		changeDrawMode('tableColResize');
		draw.selectedPath = draw.currCursor.pathNum;
		draw.prevX = draw.mouse[0];
		draw.animate(draw.text2.horizResizeMove,draw.text2.horizResizeStop,drawCanvasPaths);
	},
	horizResizeMove: function (e) {
		updateMouse(e);
		var path = draw.path[draw.selectedPath];
		var dx = draw.mouse[0] - draw.prevX;
		if (path.obj[0].tbLayoutTitle == true) dx = dx * 2;
		repositionPath(path, 0, 0, dx, 0);
		updateBorder(path);
		draw.prevX = draw.mouse[0];
	},
	horizResizeStop: function (e) {
		changeDrawMode('prev');
	},
	vertResize: function (e) {
		updateMouse(e);
		changeDrawMode('tableRowResize');
		var obj = draw.currCursor.obj;
		draw._drag = {
			obj:obj,
			offset:obj.rect[1]+obj.rect[3]-draw.mouse[1]
		};
		draw.animate(draw.text2.vertResizeMove,draw.text2.vertResizeStop,drawCanvasPaths);
	},
	vertResizeMove: function (e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var offset = draw._drag.offset;
		obj.rect[3] = Math.max(40,draw.mouse[1]-obj.rect[1]-offset);
		updateBorder(obj._path);
	},
	vertResizeStop: function (e) {
		changeDrawMode('prev');
	},
	horizResizeCollapse: function () {
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		obj.ctx = draw.hiddenCanvas.ctx;
		var tightRect = text(obj).tightRect;
		delete obj.ctx;
		var dw = tightRect[2] + 4 - path.tightBorder[2];
		repositionPath(path, 0, 0, dw, 0);
		updateBorder(path);
		drawCanvasPaths();
	},
	vertResizeCollapse: function () {
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		obj.ctx = draw.hiddenCanvas.ctx;
		var tightRect = text(obj).tightRect;
		delete obj.ctx;
		var dh = tightRect[3] + 4 - path.tightBorder[3];
		repositionPath(path, 0, 0, 0, dh);
		updateBorder(path);
		drawCanvasPaths();
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.rect[0] = center[0] + sf * (obj.rect[0] - center[0]);
			obj.rect[1] = center[1] + sf * (obj.rect[1] - center[1]);
		}
		obj.rect[2] *= sf;
		obj.rect[3] *= sf;
		if (!un(obj.tags) && !un(obj.tags.fontSize)) obj.tags.fontSize *= sf;
		if (!un(obj.fontSize)) obj.fontSize *= sf;
		if (!un(obj.lineSpacingFactor)) obj.lineSpacingFactor *= sf;
		if (!un(obj.padding)) obj.padding *= sf;
		if (!un(obj.box)) {
			if (!un(obj.box.borderWidth))
				obj.box.borderWidth *= sf;
			if (!un(obj.box.radius))
				obj.box.radius *= sf;
			if (!un(obj.box.padding))
				obj.box.padding *= sf;
			if (!un(obj.box.dash)) {
				if (!un(obj.box.dash[0]))
					obj.box.dash[0] *= sf;
				if (!un(obj.box.dash[1]))
					obj.box.dash[1] *= sf;
			}
		}
		textArrayFontSizeAdjust(obj.text, sf);
	},

	getControlPanel: function (obj) {
		var elements = [{
				name: 'Style',
				type: 'style'
			}, {
				name: 'Round Box',
				type: 'increment',
				increment: function (obj, value) {
					var val = draw.text2.getRadius(obj) + value * 5;
					draw.text2.setRadius(obj, Math.max(0, Math.min(20, val)));
				}
			}
		];
		return {
			obj: obj,
			elements: elements
		};
	},
	centerTextAtPos: function (obj, pos) {
		obj.rect[0] = pos[0] - 0.5 * obj.rect[2];
		obj.rect[1] = pos[1] - 0.5 * obj.rect[3];
	},

	getTextMeasure: function (obj) {
		obj.ctx = draw.hiddenCanvas.ctx;
		obj.text = simplifyText(obj.text);
		var measure = text(obj);
		return measure;
	},
	getCharPosition: function (obj, char) {
		var measure = draw.text2.getTextMeasure(obj);
		for (var t = 0; t < measure.textLoc.length; t++) {
			if (un(measure.textLoc[t])) continue;
			if (measure.textLoc[t]instanceof Array == false) continue;
			for (var t2 = 0; t2 < measure.textLoc[t].length; t2++) {
				var textLoc = measure.textLoc[t][t2];
				if (un(textLoc)) continue;
				if (textLoc instanceof Array) continue;
				if (textLoc.char == char) return textLoc;
			}
		}
		return false;
	},
	horizAlignToEquals: function () {
		// upgrade to include ['=','<','>',lessThanEq,moreThanEq,notEqual,approxEqual,equivalent,':' ... any more?]
		var objs1 = selObjs();
		var objs2 = [];
		var left = 100000;
		for (var o = 0; o < objs1.length; o++) {
			var obj = objs1[o];
			if (obj.type !== 'text2')
				continue;
			obj._equalsPos = draw.text2.getCharPosition(obj, "=");
			left = Math.min(left, obj._equalsPos.left);
			objs2.push(obj);
		}
		if (objs2.length > 0) {
			for (var o = 0; o < objs1.length; o++) {
				var obj = objs1[o];
				var dl = left - obj._equalsPos.left;
				if (dl !== 0)
					repositionObj(obj, dl, 0, 0, 0);
			}
			draw.updateAllBorders();
			drawCanvasPaths();
		}
	},
	horizAlignToCharacter: function (char) {
		var objs1 = selObjs();
		var objs2 = [];
		var left = 100000;
		for (var o = 0; o < objs1.length; o++) {
			var obj = objs1[o];
			if (obj.type !== 'text2') continue;
			var charPos = draw.text2.getCharPosition(obj, char);
			if (charPos === false) continue;
			obj._charPos = charPos;
			left = Math.min(left, obj._charPos.left);
			objs2.push(obj);
		}
		if (objs2.length > 0) {
			for (var o = 0; o < objs1.length; o++) {
				var obj = objs1[o];
				var dl = left - obj._charPos.left;
				if (dl !== 0) repositionObj(obj, dl, 0, 0, 0);
				delete obj._charPos;
			}
			draw.updateAllBorders();
			drawCanvasPaths();
		}
	},

	minimiseRect: function(obj) {
		if (un(obj)) obj = sel();
		if (!un(obj.box) && obj.box.type !== 'none') return;
		if (!un(obj._tightRect)) {
			obj.rect[2] = obj._tightRect[2]+50;
			obj.rect[3] = obj._tightRect[3];
		}
	},
	splitByTabs: function(obj, minTabsForSplit) {
		if (un(obj)) obj = sel();
		if (!un(obj.box) && obj.box.type !== 'none') return;
		if (un(minTabsForSplit)) minTabsForSplit = 3;
			
		obj.ctx = draw.hiddenCanvas.ctx;
		var measure = text(obj);
		measure.map = mapArray(measure.textLoc,true);
		delete obj.ctx;
		if (measure.lineRects < 2) return;
	
		var sections = [[]];
		for (var m = 0; m < measure.map.length; m++) {
			var map = measure.map[m];
			if (map.length > 2) {
				sections.last().push(map);
				continue;
			}
			if (m === measure.map.length-1) {
				continue;
			}
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
				if (m2-m >= minTabsForSplit) {
					m = m2-1;
					sections.push([]);
				} else {
					sections.last().push(map);
				}
			} else {
				sections.last().push(map);
			}
		}
		
		var path = draw.getPathOfObj(obj);
		if (sections.length < 2) return [path];

		draw.path.splice(draw.path.indexOf(path),1);
		
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
		return paths;
		
		function getTextLoc(textLoc,map) {
			var loc = textLoc;
			for (var m = 0; m < map.length; m++) loc = loc[map[m]];
			return loc;
		}
		function extractTextBetweenPos(textArray,pos1,pos2) {
			if (pos1[0] === pos2[0]) return [textArray[pos1[0]].slice(pos1[1],pos2[1]+1)];
			var extract = [];
			extract.push(textArray[pos1[0]].slice(pos1[1]));
			for (var i = pos1[0]+1; i < pos2[0]; i++) extract.push(textArray[i]);
			extract.push(textArray[pos2[0]].slice(0,pos2[1]+1));
			return clone(extract);
		}

	},
	splitByLines: function(obj) {
		if (un(obj)) obj = sel();		
		if (!un(obj.box) && obj.box.type !== 'none') return;
		
		obj.ctx = draw.hiddenCanvas.ctx;
		var measure = text(obj);
		
		var rects = [];
		var newLine = true;
		for (var r = 0; r < measure.lineRects.length; r++) {
			var lineRect = measure.lineRects[r];
			if (lineRect[2] === 0) {
				newLine = true;
			} else if (newLine === true) {
				rects.push(lineRect);
				newLine = false;
			} else {
				var rect = rects.last();
				rect[2] = Math.max(rect[2],lineRect[2]);
				var bottom = lineRect[1]+lineRect[3];
				rect[3] = bottom-rect[1];
			}
		}		
		if (rects.length < 2) return;
		var lines = [[""]];
		
		for (var t = 0; t < obj.text.length; t++) {
			var element = obj.text[t];
			if (typeof element !== 'string') {
				lines.last().push(element);
			} else {
				if (element.indexOf(br+br) === 0) {
					lines.push([""]);
				}
				var splitLines = element.split(br+br);
				console.log(splitLines);
				for (var s = 0; s < splitLines.length; s++) {
					var splitLine = splitLines[s];
					if (splitLine.length === 0) continue;
					while (splitLine.indexOf(br) === 0) splitLine = splitLine.slice(1);
					lines.last().push(splitLine);
					lines.push([""]);
				}
				if (lines.last().length === 1 && lines.last()[0] === "") lines.pop();
			}
		}
		
		console.log(lines);
		
		var path = draw.getPathOfObj(obj);
		var pathIndex = draw.path.indexOf(path);
		if (pathIndex === -1) pathIndex = draw.path.length-1;
		for (var l = 0; l < lines.length; l++) {
			var rect = rects[l];
			if (un(rects[l])) rect = [20,20,100,100];
			draw.path.splice(pathIndex+1,0,{
				obj:[{
					type:'text2',
					text:lines[l],
					rect:rects[l],
					fontSize:obj.fontSize || 28,
					font:obj.font || 'Arial',
					color:obj.color || '000',
					align:obj.align || [-1,-1],
					bold:obj.bold || false,
					italic:obj.italic || false,
					fracScale:obj.fracScale || undefined,
					algPadding:obj.algPadding || undefined,
				}]
			});
		}
		draw.path.splice(pathIndex,1);
		return lines.length;
	},
	getTextType: function(obj) {
		if (un(obj)) obj = sel();
		if (obj.type !== 'text2') return false;
		delete obj._textType;
		if (obj.font === "smileymonster" && !un(obj.box) && obj.box.type === 'loose' && (un(obj.box.radius) || obj.box.radius === 0)) {
			obj._textType = 'page-title';
		} else if (obj.font === "smileymonster") {
			obj._textType = 'sub-title';
		} else if (obj.rect[0] < 25) {
			var txt = obj.text[0];
			if (typeof txt === 'string') {
				var pos = Math.max(txt.indexOf('.'+tab+tab),txt.indexOf('. '+tab),txt.indexOf('.  '+tab));
				if (pos > 0) {
					var qNum = txt.slice(0,pos);
					if (qNum !== "") {
						qNum = Number(qNum);
						if (!isNaN(qNum)) {
							obj._textType = 'question-'+qNum;
						}
					}
				}
			}
		}
		//if (!un(obj._textType)) console.log(obj._textType,obj.text);
		return obj._textType;
	},
	fixTitleUnderlining: function(obj) {
		if (un(obj)) obj = sel();	
		var textType = draw.text2.getTextType(obj)
		//console.log(textType,obj);
		if (typeof textType !== 'string' || textType.indexOf('sub-title') !== 0) return;
		
		obj.ctx = draw.hiddenCanvas.ctx;
		var lineRects = text(obj).lineRects;
		//console.log(obj);
		//console.log(lineRects);
		if (lineRects.length > 1) return;
		var line = false;
		var textPath = draw.getPathOfObj(obj);
		updateBorder(textPath);
		var rect = clone(textPath.border);
		rect[0] -= 10;
		rect[1] -= 10;
		rect[2] += 20;
		rect[3] += 20;
		//console.log(rect);
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj2 = path.obj[o];
				if (obj2.type !== 'line') continue;
				if (Math.abs(obj2.startPos[1] - obj2.finPos[1]) > 0.5) continue;
				if (obj2.startPos[0] < rect[0] || obj2.startPos[0] > rect[0]+rect[2] || obj2.startPos[1] < rect[1]+0.5*rect[3] || obj2.startPos[1] > rect[1]+rect[3]) continue;
				if (obj2.finPos[0] < rect[0] || obj2.finPos[0] > rect[0]+rect[2] || obj2.finPos[1] < rect[1]+0.5*rect[3] || obj2.finPos[1] > rect[1]+rect[3]) continue;
				line = true;
				path.obj.splice(o,1);
				if (path.obj.length === 0) draw.path.splice(p,1);
				p = draw.path.length;
				break;
			}
		}
		obj.underline = true;
	},

	convertToTable: function () {
		var obj = sel();
		var txt = obj.text;
		var cells = text2split(txt, br);
		var cols = 0;
		for (var r = cells.length - 1; r >= 0; r--) {
			cells[r] = text2split(cells[r], tab + tab + tab);
			cols = Math.max(cols, cells[r].length);
		}
		var trigger = obj.trigger;
		deletePaths();
		draw.table2.add(cells.length, cols);

		var table = draw.path.last().obj[0];
		table.text.size = 28;
		for (var r = 0; r < cells.length; r++) {
			for (var c = 0; c < cells[r].length; c++) {
				if (cells[r][c].length == 0)
					cells[r][c] = [''];
				while (cells[r][c][0].indexOf(tab) == 0)
					cells[r][c][0] = cells[r][c][0].slice(1);
				table.cells[r][c].text = cells[r][c];
				table.cells[r][c].align = [-1, 0];
				//table.cells[r][c].padding = 10;
			}
		}

		repositionObj(table, obj.rect[0] - table.left, obj.rect[1] - table.top, 0, 0);
		table.height = obj.rect[3];
		for (var h = 0; h < table.heights.length; h++) {
			table.heights[h] = table.height / table.heights.length;
		}
		table.innerBorder.show = false;
		table.outerBorder.show = false;
		draw.path.last().selected = true;
		if (!un(trigger))
			draw.path.last().trigger = trigger;
		console.log(table);

		updateBorder(draw.path.last());
		drawCanvasPaths();

		function text2split(obj, sep) {
			var ret = [[]];
			var obj = clone(obj);
			for (var i = 0; i < obj.length; i++) {
				if (typeof obj[i] !== 'string') {
					ret.last().push(obj[i]);
				} else {
					while (obj[i].indexOf(sep) > -1) {
						var sub = obj[i].slice(0, obj[i].indexOf(sep));
						ret.last().push(sub);
						ret.push([]);
						obj[i] = obj[i].slice(obj[i].indexOf(sep) + sep.length);
					}
					if (obj[i].length > 0)
						ret.last().push(obj[i]);
				}
			}
			for (var i = ret.length - 1; i >= 0; i--) {
				if (arraysEqual(ret[i], []) || arraysEqual(ret[i], [""]) || arraysEqual(ret[i], [tab]) || arraysEqual(ret[i], [tab + tab]))
					ret.splice(i, 1);
			}
			if (arraysEqual(ret, []))
				ret = [''];
			return ret;
		}
	},
	convertGroupToTable: function (rows, cols) {
		var paths = selPaths();

		//work out number of rows and cols
		var tol = 30;
		var x = [],
		y = [],
		w = [],
		h = [];
		var left = paths[0].obj[0].rect[0];
		var top = paths[0].obj[0].rect[1];
		for (var p = 0; p < paths.length; p++) {
			var obj = paths[p].obj[0];
			x.push(obj.rect[0] + 0.5 * obj.rect[2]);
			y.push(obj.rect[1] + 0.5 * obj.rect[3]);
			left = Math.min(left, obj.rect[0]);
			top = Math.min(top, obj.rect[1]);
		}
		var r = [y[0]];
		var c = [x[0]];
		for (var i = 1; i < x.length; i++) {
			var found = false;
			for (var c2 = 0; c2 < c.length; c2++) {
				if (Math.abs(x[i] - c[c2]) < tol)
					found = true;
			}
			if (found == false)
				c.push(x[i]);
		}
		for (var i = 1; i < y.length; i++) {
			var found = false;
			for (var r2 = 0; r2 < r.length; r2++) {
				if (Math.abs(y[i] - r[r2]) < tol)
					found = true;
			}
			if (found == false)
				r.push(y[i]);
		}
		if (un(rows)) {
			rows = r.length;
			cols = c.length;
		}

		var cells = [];
		var widths = [];
		var heights = [];
		for (var r = 0; r < rows; r++)
			heights[r] = 50;
		for (var c = 0; c < cols; c++)
			widths[c] = 50;

		for (var r = 0; r < rows; r++) {
			cells[r] = [];
			var rowWidths = [];
			for (var c = 0; c < cols; c++) {
				var obj = paths[0].obj[0];
				cells[r][c] = {};
				cells[r][c].text = obj.text;
				cells[r][c].align = obj.align;
				cells[r][c].box = obj.box;
				widths[c] = Math.max(widths[c], obj.rect[2] + 10);
				heights[r] = Math.max(heights[r], obj.rect[3] + 10);
				paths.shift();
			}
		}
		deletePaths();

		draw.table2.add(rows, cols);
		var table = draw.path.last().obj[0];
		for (var r = 0; r < cells.length; r++) {
			for (var c = 0; c < cells[r].length; c++) {
				table.cells[r][c].text = cells[r][c].text;
				table.cells[r][c].align = cells[r][c].align;
				table.cells[r][c].box = cells[r][c].box;
				//table.cells[r][c].padding = 10;
			}
		}
		table.widths = widths;
		table.heights = heights;
		table.innerBorder.show = false;
		table.outerBorder.show = false;
		table.paddingH = 5;
		table.paddingV = 5;
		draw.path.last().selected = true;
		repositionObj(table, left - table.left, top - table.top, 0, 0);

		console.log(table);

		updateBorder(draw.path.last());
		drawCanvasPaths();
	},

	toggleVertical: function() {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		if (obj.type === 'textVertical' && obj.direction === 'down') {
			obj.type = 'text2';
			delete obj.direction;
		} else if (obj.type === 'textVertical') {
			obj.direction = 'down';
		} else {
			obj.type = 'textVertical';
			delete obj.direction;
		}
		updateBorder(draw.path[draw.currCursor.pathNum]);
		drawCanvasPaths();
	}
};
draw.textVertical = {
	resizable:true,
	draw:function(ctx,obj,path) {
		var obj2 = clone(obj);
		ctx.save();
		if (obj.direction === 'down') {
			ctx.translate(obj.rect[0]+obj.rect[2],obj.rect[1]);
			ctx.rotate(Math.PI/2);
		} else {
			ctx.translate(obj.rect[0],obj.rect[1]+obj.rect[3]);
			ctx.rotate(-Math.PI/2);
		}
		obj2.ctx = ctx;
		obj2.rect = [0,0,obj.rect[3],obj.rect[2]];
		text(obj2);
		ctx.restore();
	},
	getRect:function(obj) {
		return obj.rect;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: '',
			shape: 'rect',
			dims: [x1 + 20, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.text2.toggleVertical,
			pathNum: pathNum,
			draw: function(path,ctx,l,t,w,h,button) {
				var char = path.obj[0].direction === 'down' ? '▼' : '▲';
				text({ctx:ctx,rect:[l,t,w,h],text:[char],align:[0,0],fontSize:14,box:{type:'loose',color:'#9F9',borderWidth:0.01}});
			}
		});
		return buttons;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		obj.rect[3] += dh;
	}
};
draw.multiSelectTable = {
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var left = center[0] - 75;
		var top = center[1] - 75;
		var width = 150;
		var height = 150;
		var cells = [];
		var widths = [];
		var heights = [];
		for (var i = 0; i < 2; i++) {
			cellRow = [];
			for (var j = 0; j < 3; j++) {
				cellRow.push({
					text: [""],
					align: [0, 0],
					box: {
						type: 'loose',
						color: 'none',
						borderColor: '#000',
						radius: 15,
						borderWidth: 2
					}
				});
			}
			cells.push(cellRow);
			heights.push(height);
		}
		for (var j = 0; j < 3; j++)
			widths.push(width);
		var path = {
			obj: [{
					type: 'table2',
					left: left,
					top: top,
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
					paddingH: 10,
					paddingV: 10
				}
			],
			isInput: {
				type: 'select',
				shuffle: true,
				multiSelect: true,
				checkSelectCount: false,
				selColors: ['#CCF', '#66F']
			},
			selected: true
		};
		draw.path.push(path);
		draw.table2.draw(draw.hiddenCanvas.ctx, path.obj[0], path);
		updateBorder(path);
		drawCanvasPaths();
	},
	drawButton: function (ctx, size) {
		ctx.clear();
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', '#F96');
		ctx.strokeStyle = '#666';
		ctx.lineWidth = 1;
		ctx.fillStyle = '#FFF';
		ctx.fillRect(10, 11, 35, 33);
		ctx.fillStyle = '#393';
		ctx.fillRect(10 + 11 * 1, 11 + 0 * 33 / 4, 35 / 3, 33 / 4);
		ctx.fillRect(10 + 11 * 0, 11 + 1 * 33 / 4, 35 / 3, 33 / 4);
		ctx.fillRect(10 + 11 * 2, 11 + 3 * 33 / 4, 35 / 3, 33 / 4);
		ctx.beginPath();
		for (var i = 0; i < 5; i++) {
			ctx.moveTo(10, 11 + i * 33 / 4);
			ctx.lineTo(45, 11 + i * 33 / 4);
		}
		for (var i = 0; i < 4; i++) {
			ctx.moveTo(10 + i * 35 / 3, 11);
			ctx.lineTo(10 + i * 35 / 3, 44);
		}
		ctx.stroke();
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';
		ctx.strokeRect(10, 11, 35, 33);
	},
};
draw.singleSelectTable = {
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var left = center[0] - 75;
		var top = center[1] - 75;
		var width = 150;
		var height = 150;
		var cells = [];
		var widths = [];
		var heights = [];
		for (var i = 0; i < 2; i++) {
			cellRow = [];
			for (var j = 0; j < 2; j++) {
				cellRow.push({
					text: [""],
					align: [0, 0],
					box: {
						type: 'loose',
						color: 'none',
						borderColor: '#000',
						radius: 15,
						borderWidth: 2
					}
				});
			}
			cells.push(cellRow);
			heights.push(height);
		}
		for (var j = 0; j < 2; j++)
			widths.push(width);
		var path = {
			obj: [{
					type: 'table2',
					left: left,
					top: top,
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
					paddingH: 10,
					paddingV: 10
				}
			],
			isInput: {
				type: 'select',
				shuffle: true,
				multiSelect: false,
				checkSelectCount: false,
				selColors: ['#CCF', '#66F']
			},
			selected: true
		};
		draw.path.push(path);
		draw.table2.draw(draw.hiddenCanvas.ctx, path.obj[0], path);
		updateBorder(path);
		drawCanvasPaths();
	},
	drawButton: function (ctx, size) {
		ctx.clear();
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', '#F96');
		ctx.strokeStyle = '#666';
		ctx.lineWidth = 1;
		ctx.fillStyle = '#FFF';
		ctx.fillRect(10, 11, 35, 33);
		ctx.fillStyle = '#393';
		ctx.fillRect(10, 11, 35 / 2, 33 / 2);
		ctx.beginPath();
		for (var i = 0; i < 3; i++) {
			ctx.moveTo(10, 11 + i * 33 / 2);
			ctx.lineTo(45, 11 + i * 33 / 2);
		}
		for (var i = 0; i < 3; i++) {
			ctx.moveTo(10 + i * 35 / 2, 11);
			ctx.lineTo(10 + i * 35 / 2, 44);
		}
		ctx.stroke();
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';
		ctx.strokeRect(10, 11, 35, 33);
	},
};
draw.tickCrossSelectH = {
	add: function () {
		draw.tickCrossSelect.add();
	},
	drawButton: function (ctx, size) {
		ctx.clear();
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', '#F96');
		ctx.fillStyle = '#FFF';
		ctx.fillRect(7.5, 17.5, 40, 20);
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(27.5, 17.5);
		ctx.lineTo(27.5, 37.5);
		ctx.stroke();
		ctx.strokeRect(7.5, 17.5, 40, 20);
		drawTick(ctx, 15, 18, '#060', 7.5 + 2.5, 17.5 + 1, 3);
		drawCross(ctx, 15, 18, '#F00', 27.5 + 2.5, 17.5 + 1, 3);
	}
}
draw.tickCrossSelectV = {
	add: function () {
		draw.tickCrossSelect.add('vert');
	},
	drawButton: function (ctx, size) {
		ctx.clear();
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', '#F96');
		ctx.fillStyle = '#FFF';
		ctx.fillRect(17.5, 7.5, 20, 40);
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(17.5, 27.5);
		ctx.lineTo(37.5, 27.5);
		ctx.stroke();
		ctx.strokeRect(17.5, 7.5, 20, 40);
		drawTick(ctx, 15, 18, '#060', 17.5 + 2.5, 7.5 + 1, 3);
		drawCross(ctx, 15, 18, '#F00', 17.5 + 2.5, 27.5 + 1, 3);
	}
}
draw.tickCrossSelect = {
	add: function (type) {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var left = center[0] - 50;
		var top = center[1] - 75;

		var paths1 = {
			obj: [{
					type: "tick",
					rect: [155, 125, 40, 50],
					lineWidth: 10,
					lineColor: "#060"
				}
			]
		};
		var paths2 = {
			obj: [{
					type: "cross",
					rect: [305, 125, 40, 50],
					lineWidth: 10,
					lineColor: "#F00"
				}
			]
		};
		updateBorder(paths1);
		updateBorder(paths2);

		var cell1 = {
			text: [""],
			align: [0, 0],
			box: {
				type: "loose",
				borderColor: "#000",
				borderWidth: 5,
				radius: 10,
				show: true
			},
			paths: [paths1],
			selColors: ["none", "#6F6"],
			ans: false
		};
		var cell2 = {
			text: [""],
			align: [0, 0],
			box: {
				type: "loose",
				borderColor: "#000",
				borderWidth: 5,
				radius: 10,
				show: true
			},
			paths: [paths2],
			selColors: ["none", "#F66"],
			ans: false
		}
		if (type == 'vert') {
			var cells = [[cell1], [cell2]];
			var widths = [150];
			var heights = [100, 100]
		} else {
			var cells = [[cell1, cell2]];
			var widths = [150, 150];
			var heights = [100]
		}

		var obj = {
			type: "table2",
			left: left,
			top: top,
			widths: widths,
			heights: heights,
			text: {
				font: "Arial",
				size: 28,
				color: "#000"
			},
			outerBorder: {
				show: false
			},
			innerBorder: {
				show: false
			},
			cells: cells
		};

		obj.xPos = [obj.left];
		for (var i = 0; i < obj.widths.length; i++)
			obj.xPos.push(obj.xPos.last() + obj.widths[i]);
		obj.yPos = [obj.top];
		for (var i = 0; i < obj.heights.length; i++)
			obj.yPos.push(obj.yPos.last() + obj.heights[i]);

		draw.path.push({
			obj: [obj],
			selected: true,
			isInput: {
				type: 'select',
				shuffle: true,
				multiSelect: false,
				checkSelectCount: true
			}
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	}
}
draw.dataTable = {
	draw:function(ctx,obj,path) {
		obj._cursorPos = [];
		
		var y = obj.top;
		var x = obj.left;
		var rowsView = !un(obj.maxRowsView) ? Math.min(obj.data.length,obj.maxRowsView) : obj.data.length;
		var rowStart = 0;
		if (!un(obj._scrollObj)) {
			obj._scrollObj.value = Math.min(obj._scrollObj.value,obj.data.length-obj.maxRowsView);
			rowStart = obj._scrollObj.value;
		}		
		
		ctx.fillStyle = obj.titleRowColor;
		ctx.fillRect(x,y,obj._width,obj.rowHeight);
		var columns = obj.columns.filter(function(x) {return x.visible !== false});
		for (var c = 0; c < columns.length; c++) {
			var column = columns[c];
			text({ctx:ctx,text:column.title,rect:[x,y,column.width,obj.rowHeight],align:[0,0],fontSize:obj.fontSize});
			x += column.width;
		}
		y += obj.rowHeight;
		for (var d = rowStart; d < rowStart+rowsView; d++) {
			var rowData = obj.data[d];
			x = obj.left;
			if (typeof obj.rowColor === 'function') {
				ctx.fillStyle = obj.rowColor(rowData,obj);
				ctx.fillRect(x,y,obj._width,rowData._height);
			}
			for (var c = 0; c < columns.length; c++) {
				var column = columns[c];
				if (typeof column.color === 'function') {
					ctx.fillStyle = column.color(rowData,obj);
					ctx.fillRect(x,y,column.width,rowData._height);
				}
				if (column.editable === true || typeof column.editable === 'function' && column.editable(rowData) === true) {
					if (un(rowData._textObjs)) rowData._textObjs = [];
					if (un(rowData._textObjs[c])) {
						rowData._textObjs[c] = {
							type:'editableText',
							text:column.text(rowData,obj),
							ctx:ctx,
							rect:[x,y,column.width,rowData._height],
							align:[0,0],
							fontSize:obj.fontSize,
							_draw:drawCanvasPaths,
							_rowData:rowData,
							_dataTable:obj,
							_column:column,
							deselectOnInputStart:false,
							deselectOnInputEnd:false
						}
						if (typeof column.fracScale === 'number') rowData._textObjs[c].fracScale = column.fracScale;
						if (typeof column.algPadding === 'number') rowData._textObjs[c].algPadding = column.algPadding;
						if (typeof column.font === 'string') rowData._textObjs[c].font = column.font;
						if (typeof column.fontSize === 'number') rowData._textObjs[c].fontSize = column.fontSize;
						if (typeof column.color === 'number') rowData._textObjs[c].color = column.color;
						if (typeof column.bold === 'boolean') rowData._textObjs[c].bold = column.bold;
						if (typeof column.italic === 'boolean') rowData._textObjs[c].italic = column.italic;
						
						if (typeof column.onInputEnd === 'function') rowData._textObjs[c].onInputEnd = column.onInputEnd;
					}
					var textObj = rowData._textObjs[c];
					textObj.ctx = ctx;
					textObj.rect = [x,y,column.width,rowData._height];
					draw.editableText.draw(ctx,textObj,{});
					
					obj._cursorPos.push({shape:'rect',dims:[x,y,column.width,rowData._height],cursor:draw.cursors.text,func:draw.dataTable.cellTextEditStart,dataTable:obj,rowData:rowData,column:column,textObj:textObj});
				} else if (typeof column.text === 'function') {
					var textObject = {ctx:ctx,text:column.text(rowData,obj),rect:[x,y,column.width,rowData._height],align:[0,0],fontSize:obj.fontSize};
					if (typeof column.fracScale === 'number') textObject.fracScale = column.fracScale;
					if (typeof column.algPadding === 'number') textObject.algPadding = column.algPadding;
					if (typeof column.font === 'string') textObject.font = column.font;
					if (typeof column.fontSize === 'number') textObject.fontSize = column.fontSize;
					if (typeof column.color === 'number') textObject.color = column.color;
					if (typeof column.bold === 'boolean') textObject.bold = column.bold;
					if (typeof column.italic === 'boolean') textObject.italic = column.italic;
					text(textObject);	
				} else if (column.text instanceof Array) {
					var textObject = {ctx:ctx,text:column.text,rect:[x,y,column.width,rowData._height],align:[0,0],fontSize:obj.fontSize};
					if (typeof column.fracScale === 'number') textObject.fracScale = column.fracScale;
					if (typeof column.algPadding === 'number') textObject.algPadding = column.algPadding;
					if (typeof column.font === 'string') textObject.font = column.font;
					if (typeof column.fontSize === 'number') textObject.fontSize = column.fontSize;
					if (typeof column.color === 'number') textObject.color = column.color;
					if (typeof column.bold === 'boolean') textObject.bold = column.bold;
					if (typeof column.italic === 'boolean') textObject.italic = column.italic;
					text(textObject);	
				} else if (typeof column.draw === 'function') {
					column.draw(ctx,rowData,[x,y,column.width,rowData._height],obj);
				}
				if (typeof column.click === 'function') {
					obj._cursorPos.push({shape:'rect',dims:[x,y,column.width,rowData._height],cursor:draw.cursors.pointer,func:draw.dataTable.cellClick,dataTable:obj,rowData:rowData,column:column});
				}
				x += column.width;
			}
			y += rowData._height;
		}
		obj._height = y - obj.top;
		
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.beginPath();
		x = obj.left;
		y = obj.top;
		ctx.moveTo(x,y);
		ctx.lineTo(x+obj._width,y);
		y += obj.rowHeight;
		for (var d = rowStart; d < rowStart+rowsView; d++) {
			var rowData = obj.data[d];
			ctx.moveTo(x,y);
			ctx.lineTo(x+obj._width,y);
			y += rowData._height;
		}
		ctx.moveTo(x,y);
		ctx.lineTo(x+obj._width,y);
		y = obj.top;
		for (var c = 0; c < columns.length+1; c++) {
			ctx.moveTo(x,y);
			ctx.lineTo(x,y+obj._height);
			if (!un(columns[c])) x += columns[c].width;
		}
		ctx.stroke();
		
		if (!un(obj.maxRowsView) && obj.data.length > obj.maxRowsView) {
			if (un(obj._scrollObj)) {
				obj._scrollObj = {
					left:obj.left+obj._width,
					top:obj.top,
					width:30,
					height:obj._height,
					buttonHeight:25,
					scrollView:obj.maxRowsView,
					scrollMax:obj.data.length,
					value:0,
					backColor:'#EEE',
					buttonColor:'#DEDEDE',
					markerColor:'#AAA',
					borderColor:'#000',
					borderWidth:2
				}
			}
			obj._scrollObj.left = obj.left+obj._width;
			obj._scrollObj.top = obj.top;
			obj._scrollObj.height = obj._height;
			
			// update these in case the number of data rows has changed...
			obj._scrollObj.scrollView = obj.maxRowsView;
			obj._scrollObj.scrollMax = obj.data.length;
			obj._scrollObj.value = Math.min(obj._scrollObj.value,obj.data.length-obj.maxRowsView);
			
			draw.verticalScrollbar.draw(ctx,obj._scrollObj,{});
			if (obj._scrollObj._cursorPositions instanceof Array) obj._cursorPos = obj._cursorPos.concat(obj._scrollObj._cursorPositions);
		}
	},
	calcSize: function(dataTable) {
		var columns = dataTable.columns.filter(function(x) {return x.visible !== false});
		for (var c = 0; c < columns.length; c++) {
			var column = columns[c];
			if (column.visible === false) continue;
			var maxWidth = !un(column.maxWidth) ? column.maxWidth : 1200;
			var titleMeasure = text({ctx:draw.hiddenCanvas.ctx,text:column.title,minTightWidth:10,minTightHeight:10,rect:[0,0,maxWidth,1700],fontSize:dataTable.fontSize});
			column.width = titleMeasure.tightRect[2] + 2*dataTable.padding;
			
			for (var r = 0; r < dataTable.data.length; r++) {
				var rowData = dataTable.data[r];
				if (un(rowData._height)) rowData._height = dataTable.rowHeight;
				
				if (typeof column.text === 'function') {
					var cellText = column.text(rowData,dataTable);
					var textObject = {ctx:draw.hiddenCanvas.ctx,text:cellText,minTightWidth:10,minTightHeight:10,rect:[0,0,maxWidth,1700],fontSize:dataTable.fontSize};
					if (typeof column.fracScale === 'number') textObject.fracScale = column.fracScale;
					if (typeof column.algPadding === 'number') textObject.algPadding = column.algPadding;
					if (typeof column.font === 'string') textObject.font = column.font;
					if (typeof column.fontSize === 'number') textObject.fontSize = column.fontSize;
					if (typeof column.color === 'number') textObject.color = column.color;
					var cellMeasure = text(textObject);
					var cellHeight = cellMeasure.tightRect[3]+8;
					rowData._height = Math.max(rowData._height,cellHeight);
				}
				
				if (typeof column.getWidth === 'function') {
					var cellWidth = column.getWidth(rowData);
					column.width = Math.max(column.width,cellWidth);
				} else if (typeof column.text === 'function') {
					var cellWidth = cellMeasure.tightRect[2] + 2*dataTable.padding;
					column.width = Math.max(column.width,cellWidth);
				}
				
				if (!un(column.minWidth)) column.width = Math.max(column.minWidth,column.width);
				if (!un(column.maxWidth)) column.width = Math.min(column.maxWidth,column.width);
			}
		}
		dataTable._width = columns.reduce(function(acc,val) {return acc+val.width},0);
		dataTable._scrollBarWidth = (!un(dataTable.maxRowsView) && dataTable.data.length > dataTable.maxRowsView) ? 30 : 0;
		var rowsView = !un(dataTable.maxRowsView) ? Math.min(dataTable.data.length,dataTable.maxRowsView) : dataTable.data.length;
		var rowStart = 0;
		if (!un(dataTable._scrollObj)) {
			dataTable._scrollObj.value = Math.min(dataTable._scrollObj.value,dataTable.data.length-dataTable.maxRowsView);
			rowStart = dataTable._scrollObj.value;
		}
		
		dataTable._height = dataTable.rowHeight;
		for (var d = rowStart; d < rowStart+rowsView; d++) {
			var rowData = dataTable.data[d];
			if (!un(rowData) && !un(rowData._height)) {
				dataTable._height += rowData._height;
			} else {
				dataTable._height += dataTable.rowHeight;
			}
		}
	},
	cellClick: function() {
		var rowData = draw.currCursor.rowData;
		var dataTable = draw.currCursor.dataTable;
		var column = draw.currCursor.column;
		column.click(rowData,dataTable);
	},
	cellTextEditStart: function() {
		var textObj = draw.currCursor.textObj;
		textObj.textEdit = true;
		drawCanvasPaths();
		textEdit.start(-1,textObj);
	}
}
draw.table2 = {
	derivedProperties: ['width', 'height', 'xPos', 'yPos', 'ctx'],
	interactKeys:[{
		key:'type',
		value:'none',
		options:['none','select']
	},{
		key:'multiSelect',
		value:false
	}],
	cells: function (obj, func, path) {
		if (un(obj))
			return;
		if (typeof func !== 'function')
			return;
		for (var r = 0, rMax = obj.cells.length; r < rMax; r++) {
			for (var c = 0, cMax = obj.cells[r].length; c < cMax; c++) {
				var cell = obj.cells[r][c];
				func(cell, obj, path, r, c);
			}
		}
	},
	getCellRect: function (obj, r, c) {
		return [obj.xPos[c], obj.yPos[r], obj.widths[c], obj.heights[r]];
	},
	selectTable: {
		getCursorPositionsInteract: function (obj, path, pathNum) {
			var pos = [];
			if (!un(obj._cells)) {
				for (var c = 0; c < obj._cells.length; c++) {
					var cell = obj._cells[c];
					pos.push({
						shape: 'rect',
						dims: clone(cell._rect),
						cursor: draw.cursors.pointer,
						func: draw.table2.selectTable.cellToggle,
						path: path,
						obj: obj,
						pathNum: pathNum,
						row: cell._r,
						col: cell._c
					});
				}
			} else {
				var top = obj.top;
				var rows = obj.heights.length;
				var cols = obj.widths.length;
				var paddingH = obj.paddingH || 0;
				var paddingV = obj.paddingV || 0;
				for (var r = 0; r < rows; r++) {
					var left = obj.left;
					for (var c = 0; c < cols; c++) {
						pos.push({
							shape: 'rect',
							dims: [left + paddingH, top + paddingV, obj.widths[c] - 2 * paddingH, obj.heights[r] - 2 * paddingV],
							cursor: draw.cursors.pointer,
							func: draw.table2.selectTable.cellToggle,
							path: path,
							obj: obj,
							pathNum: pathNum,
							row: r,
							col: c
						});
						left += obj.widths[c];
					}
					top += obj.heights[r];
				}
			}
			if (un(obj._check)) {
				if (!un(path.isInput) && !un(path.isInput.checkPos)) {
					var l2 = path.isInput.checkPos[0] - 20;
					var t2 = path.isInput.checkPos[1] - 20;
				} else if (!un(path.interact) && !un(path.interact.checkPos)) {
					var l2 = path.interact.checkPos[0] - 20;
					var t2 = path.interact.checkPos[1] - 20;
				} else {
					var l2 = obj.left + obj.width + 10;
					var t2 = obj.top + (obj.paddingH || 0);
				}
				pos.push({
					shape: 'rect',
					dims: [l2, t2, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.table2.selectTable.check,
					path: path,
					obj: obj,
					pathNum: pathNum
				});
			}
			return pos;
		},
		getButtons: function (x1, y1, x2, y2, pathNum) {
			var buttons = [];
			var path = draw.path[pathNum];
			var obj = path.obj[0];
			//var interact = path.interact || path.isInput || obj.interact;
			if (!un(obj.xPos) && !un(obj.yPos)) {
				for (var r = 0; r < obj.cells.length; r++) {
					for (var c = 0; c < obj.cells[r].length; c++) {
						buttons.push({
							buttonType: 'select-input-cellToggle',
							shape: 'rect',
							dims: [obj.xPos[c], obj.yPos[r], 20, 20],
							cursor: draw.cursors.pointer,
							func: draw.table2.selectTable.cellToggle,
							pathNum: pathNum,
							path: path,
							obj: obj,
							row: r,
							col: c
						});
					}
				}
			}
			/*buttons.push({buttonType:'select-input-shuffleToggle',shape:'rect',dims:[x1+20,y2-20,60,20],cursor:draw.cursors.pointer,func:draw.table2.selectTable.shuffleToggle,pathNum:pathNum,shuffle:path.isInput.shuffle});
			if (!un(path.isInput.selColors)) {
			buttons.push({buttonType:'select-input-selColors',shape:'rect',dims:[x1+80,y2-20,20,20],cursor:draw.cursors.pointer,func:draw.table2.selectTable.selColors,pathNum:pathNum,selColors:path.isInput.selColors});
			}*/
			return buttons;
		},
		cellToggle: function () {
			var path = draw.currCursor.path;
			var obj = draw.currCursor.obj;
			var cell = obj.cells[draw.currCursor.row][draw.currCursor.col];
			var interact = path.interact || path.isInput || obj.interact;
			if (draw.mode == 'interact') {
				if (cell.toggle == true) {
					delete cell.toggle;
					if (interact.multiSelect !== true)
						delete interact._value; ;
				} else {
					if (interact.multiSelect == true) {
						cell.toggle = true;
					} else {
						delete interact._value;
						for (var r = 0; r < obj.cells.length; r++) {
							for (var c = 0; c < obj.cells[r].length; c++) {
								if (r == draw.currCursor.row && c == draw.currCursor.col) {
									obj.cells[r][c].toggle = true;
									var value = obj.cells[r][c].value || obj.cells[r][c].id || obj.cells[r][c].text;
									if (value instanceof Array && value.length === 1)
										value = removeTags(value[0]);
									interact._value = value;
								} else {
									delete obj.cells[r][c].toggle;
								}
							}
						}
					}
				}
			} else {
				if (cell.answerValue == true) {
					delete cell.answerValue;
				} else {
					if (interact.multiSelect == true) {
						cell.answerValue = true;
					} else {
						for (var r = 0; r < obj.cells.length; r++) {
							for (var c = 0; c < obj.cells[r].length; c++) {
								if (r == draw.currCursor.row && c == draw.currCursor.col) {
									obj.cells[r][c].answerValue = true;
								} else {
									delete obj.cells[r][c].answerValue;
								}
							}
						}
					}
				}

			}
			if (typeof interact.onchange === 'function') interact.onchange(obj);
			updateBorder(path);
			drawCanvasPaths();
		},
		setValue: function (obj, value) {
			var path = obj._path || draw.getPathOfObj(obj);
			var interact = path.interact || path.isInput || obj.interact;
			if (un(interact)) return;
			interact._value = value;
			for (var r = 0; r < obj.cells.length; r++) {
				for (var c = 0; c < obj.cells[r].length; c++) {
					var cell = obj.cells[r][c];
					delete cell.toggle;
					if (un(value)) continue;
					if (cell.value === value || cell.id === value) cell.toggle = true;
					if (value instanceof Array && arraysEqual(value, cell.text)) cell.toggle = true;
					var cellText = removeTags(cell.text);
					if (cellText.length === 1 && typeof cellText[0] === 'string' && cellText[0] === value) cell.toggle = true;
				}
			}
			drawCanvasPaths();
		},
		shuffleToggle: function () {
			var path = draw.path[draw.currCursor.pathNum];
			var isInput = path.isInput;
			if (un(isInput.shuffle))
				isInput.shuffle = false;
			isInput.shuffle = !isInput.shuffle;
			updateBorder(path);
			drawCanvasPaths();
		},
		selColors: function () {
			var path = draw.path[draw.currCursor.pathNum];
			var isInput = path.isInput;
			var colors = [['#CCF', '#66F'], ['#FCC', '#F66'], ['#CFC', '#393']];
			if (un(isInput.selColors)) {
				isInput.selColors = colors[0];
			} else {
				for (var c = 0; c < colors.length; c++) {
					if (arraysEqual(colors[c], isInput.selColors)) {
						isInput.selColors = colors[(c + 1) % colors.length];
						break;
					}
				}
			}
			updateBorder(path);
			drawCanvasPaths();
		},
		reset: function (obj, path) {
			if (un(path))
				path = obj._path || draw.getPathOfObj(obj);
			draw.table2.cells(obj, function (cell, obj, path) {
				delete cell.toggle;
			});
			var interact = path.interact || path.isInput || obj.interact;
			delete interact._value;
			drawCanvasPaths();
		},
		/*check: function(obj,path,answerData) {
		if (un(obj)) var obj = draw.currCursor.obj;
		var correct = 0;
		var wrong = 0;
		var ansTotal = 0;

		obj._cells = [];
		for (var r = 0; r < obj.cells.length; r++) {
		for (var c = 0; c < obj.cells[r].length; c++) {
		obj._cells.push(obj.cells[r][c]);
		}
		}

		for (var c = 0; c < obj._cells.length; c++) {
		var cell = obj._cells[c];
		if (!un(answerData) && !un(answerData.selectedCellIDs) {
		var toggle = selectedCellIDs.indexOf(cell.cellID) > -1 ? true : false;
		} else {
		var toggle = cell.toggle === true ? true : false;
		}
		var ans = cell.ans === true ? true : false;
		if (ans == true) {
		ansTotal++;
		if (toggle == true) correct++;
		} else if (toggle == true) {
		wrong++;
		}
		});
		if (correct == ansTotal && wrong == 0) {
		obj._check = true;
		} else {
		obj._check = false;
		}
		return obj._check;
		},*/
		countCheckedCells: function (obj) {
			if (un(obj))
				var obj = draw.currCursor.obj;
			var count = 0;
			draw.table2.cells(obj, function (cell, obj, path) {
				if (cell.toggle === true)
					count++;
			});
			return count;
		},
		getCheckedCells: function (obj) {
			if (un(obj))
				var obj = draw.currCursor.obj;
			var cells = [];
			draw.table2.cells(obj, function (cell, obj, path) {
				if (cell.toggle === true) {
					if (!un(cell.value)) {
						cells.push({
							value: cell.value
						});
					} else if (!arraysEqual(cell.text, [""])) {
						cells.push({
							text: cell.text
						});
					} else {
						cells.push({
							c: cell._c,
							r: cell._r
						});
					}
				}
			});
			cells.sort();
			return cells;
		}
	},
	trueFalseTable: {
		cellClick: function() {
			var path = draw.currCursor.path;
			var obj = draw.currCursor.obj;
			var value = draw.currCursor.value;
			if (obj.interact.value === value) {
				delete obj.interact.value;
			} else {
				obj.interact.value = value;
			}
			if (typeof obj.interact.onchange === 'function') obj.interact.onchange(obj);
			updateBorder(path);
			drawCanvasPaths();
		},
		getButtons: function (x1, y1, x2, y2, pathNum) {
			var buttons = [];
			var path = draw.path[pathNum];
			var obj = path.obj[0];
			var cells = draw.table2.getCells(obj);
			for (var c = 1 ; c < 3; c++) {
				var cell = cells[c];
				if (un(cell._rect)) continue;
				buttons.push({
					shape: 'rect',
					dims: [cell._rect[0], cell._rect[1], 30, 30],
					cursor: draw.cursors.pointer,
					func: draw.table2.trueFalseTable.setAnswerValue,
					pathNum: pathNum,
					path: path,
					obj: obj,
					value: c === 1 ? true : false,
					draw: function(path,ctx,l,t,w,h,button) {
						if (button.obj.interact.answerValue === button.value) {
							ctx.fillStyle = button.value === true ? '#060' : '#C00';
							ctx.fillRect(l,t,w,h);
							var color = '#FFF';
						} else {
							ctx.fillStyle = '#FFF';
							ctx.fillRect(l,t,w,h);
							var color = button.value === true ? '#060' : '#C00';
						}
						ctx.lineWidth = 2;
						ctx.strokeStyle = button.value === true ? '#060' : '#C00';
						ctx.strokeRect(l,t,w,h);
						drawTick(ctx,w*0.8,h,color,l+w*0.1,t,w*0.1);
					}
				});
			}
			return buttons;
		},
		setAnswerValue: function() {
			var path = draw.currCursor.path;
			var obj = draw.currCursor.obj;
			var value = draw.currCursor.value;
			if (obj.interact.answerValue === value) {
				delete obj.interact.answerValue;
			} else {
				obj.interact.answerValue = value;
			}
			updateBorder(path);
			drawCanvasPaths();
		}
	},

	getCells: function (obj) {
		obj._cells = [];
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				var cell = obj.cells[r][c];
				obj._cells.push(cell);
			}
		}
		return obj._cells;
	},
	getCellRects: function(obj) {
		var rects = [];
		var paddingH = obj.paddingH || 0;
		var paddingV = obj.paddingV || 0;
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				var cell = obj.cells[r][c];
				var x1 = obj.xPos[c];
				var x2 = obj.xPos[c+1];
				var y1 = obj.yPos[r];
				var y2 = obj.yPos[r+1];
				cell._rect = [x1+paddingH,y1+paddingV,x2-x1-2*paddingH,y2-y1-2*paddingV];
				rects.push(cell._rect);
			}
		}
		return rects;
	},
	getXPos: function (obj) {
		var xPos = [obj.left];
		var x = obj.left;
		if (un(obj.widths))
			return xPos;
		for (var r = 0; r < obj.widths.length; r++) {
			x += obj.widths[r];
			xPos.push(x);
		}
		return xPos;
	},
	getYPos: function (obj) {
		var yPos = [obj.top];
		var y = obj.top;
		if (un(obj.heights))
			return yPos;
		for (var r = 0; r < obj.heights.length; r++) {
			y += obj.heights[r];
			yPos.push(y);
		}
		return yPos;
	},
	add: function (r, c) {
		deselectAllPaths(false);
		changeDrawMode();
		var width = Math.min(400 / c, 80);
		var height = Math.min(500 / r, 50);
		var center = draw.getViewCenter();		
		var left = center[0] - width/2;
		var top = center[1] - height/2;		
		var cells = [];
		var widths = [];
		var heights = [];
		for (var i = 0; i < r; i++) {
			cellRow = [];
			for (var j = 0; j < c; j++) {
				cellRow.push({
					text: [""],
					align: [0, 0]
				});
			}
			cells.push(cellRow);
			heights.push(height);
		}
		for (var j = 0; j < c; j++)
			widths.push(width);

		draw.path.push({
			obj: [{
					type: 'table2',
					left: left,
					top: top,
					widths: widths,
					heights: heights,
					text: {
						font: 'Arial',
						size: 28,
						color: '#000'
					},
					outerBorder: {
						show: true,
						width: 4,
						color: '#000',
						dash: [0, 0]
					},
					innerBorder: {
						show: true,
						width: 2,
						color: '#666',
						dash: [0, 0]
					},
					cells: cells,
				}
			],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		calcCursorPositions();
		tableMenuClose();
	},
	draw: function (ctx, obj, path) {
		if (un(obj.widths) || obj.widths.length == 0) return;
		if (un(obj.heights) || obj.heights.length == 0) return;
		ctx.save();
		obj.ctx = ctx;
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				var cell = obj.cells[r][c];
				cell._r = r;
				cell._c = c;
				cell.text = simplifyText(cell.text);
			}
		}
		var interact = obj.interact || path.interact || path.isInput;
		if (!un(interact) && interact.type == 'select') {
			for (var r = 0; r < obj.cells.length; r++) {
				for (var c = 0; c < obj.cells[r].length; c++) {
					var cell = obj.cells[r][c];
					var selected = cell.toggle === true ? true : false;
					/*if (draw.mode == 'interact' || interact._mode == 'showAnswers' || interact._mode == 'addAnswers') {
					var selected = cell.toggle === true ? true : false;
					} else {
					var selected = cell.ans === true ? true : false;
					}*/
					if (!un(cell.box)) {
						var selColors = cell.selColors || obj.selColors || interact.selColors || ['#EEF', '#99F'];
						cell.box.color = selected === true ? selColors[1] : selColors[0];
					}
				}
			}
		} else if (!un(interact) && interact.type == 'trueFalse') {
			obj.innerBorder.show = false;
			obj.outerBorder.show = false;
			var cells = draw.table2.getAllCells(obj);
			var colors = [['#8F8', '#F88', '#FFF'],['#8F8', '#FFF', '#FFF'],['#FFF', '#F88', '#FFF']];
			for (var c = 0; c < cells.length; c++) {
				cells[c].box = {
					borderColor: "#000",
					borderWidth: 3,
					color: colors[c][interact.value === true ? 0 : interact.value === false ? 1 : 2],
					radius: 10,
					type: "loose"
				};
			}
			/*cells[0].box.color = interact.value === true ? '#6F6' : interact.value === false ? '#F66' : 'none';
			cells[1].box.color = interact.value === true ? '#6F6' : interact.value === false ? '#DFD' : '#CFC';
			cells[2].box.color = interact.value === true ? '#FDD' : interact.value === false ? '#F66' : '#FCC';*/
		}
		
		var table = drawTable3(obj);
		obj._cells = [];
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				var cell = obj.cells[r][c];
				obj._cells.push(cell);
				cell.tightRect = table.cellTextMeasure[r][c].tightRect;
				if (!un(cell.paths)) {
					var cellCenter = [(table.xPos[c] + table.xPos[c + 1]) / 2, (table.yPos[r] + table.yPos[r + 1]) / 2]
					for (var p = 0; p < cell.paths.length; p++) {
						// position the paths relative to centre of cells
						var path2 = cell.paths[p];
						if (un(path2.tightBorder)) updateBorder(path2);
						var pathCenter = [path2.tightBorder[0] + 0.5 * path2.tightBorder[2], path2.tightBorder[1] + 0.5 * path2.tightBorder[3]];
						var dx = cellCenter[0] - pathCenter[0];
						var dy = cellCenter[1] - pathCenter[1];
						repositionPath(path2, dx, dy);
					}
					drawPathsToCanvas(ctx.canvas, cell.paths, 0);
				}
			}
		}
		if (obj.textEdit == true) {
			if (!un(textEdit.tableCell) && !un(textEdit.tableCell[0]) && !un(textEdit.tableCell[1]) && !un(table.cellTextMeasure[textEdit.tableCell[0]]) && !un(table.cellTextMeasure[textEdit.tableCell[0]][textEdit.tableCell[1]])) {
				var measure = table.cellTextMeasure[textEdit.tableCell[0]][textEdit.tableCell[1]];
				textEdit.cursorMap = textEdit.mapTextLocs(obj, measure.textLoc, measure.softBreaks, measure.hardBreaks);
				textEdit.tightRect = measure.tightRect;
				textEdit.textLoc = measure.textLoc;
				//textEdit.softBreaks = measure.softBreaks;
				//textEdit.hardBreaks = measure.hardBreaks;
				textEdit.lineRects = measure.lineRects;
				textEdit.path = path;
				textEdit.pathIndex = draw.path.indexOf(path);
				delete textEdit.allMap;
				textEdit.blinkReset();
				if (!un(textEdit.menu)) textEdit.menu.update();
			}
		}

		obj.xPos = table.xPos;
		obj.yPos = table.yPos;
		obj.width = obj.xPos[obj.xPos.length - 1] - obj.left;
		obj.height = obj.yPos[obj.yPos.length - 1] - obj.top;
		
		ctx.restore();
	},
	getRect: function (obj) {
		obj.width = arraySum(obj.widths);
		obj.height = arraySum(obj.heights);
		return [obj.left, obj.top, obj.width, obj.height];
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		if (!un(obj.xPos) && !un(obj.yPos)) {
			var xPos = obj.xPos;
			var yPos = obj.yPos;
			for (var r = 0; r < obj.cells.length; r++) {
				for (var c = 0; c < obj.cells[r].length; c++) {
					pos.push({
						shape: 'rect',
						dims: obj.cells[r][c].tightRect,
						cursor: draw.cursors.text,
						func: textEdit.tableSelectStart,
						pathNum: pathNum,
						obj: obj,
						cell: [r, c]
					});
					pos.push({
						shape: 'rect',
						dims: [xPos[c], yPos[r], 10, yPos[r + 1] - yPos[r]],
						cursor: draw.cursors.upRightArrow,
						func: draw.table2.selectCell,
						pathNum: pathNum,
						r: r,
						c: c
					});
				}
			}
			for (var c = 1; c < xPos.length; c++) {
				pos.push({
					shape: 'rect',
					dims: [xPos[c - 1], obj.top - 10, xPos[c] - xPos[c - 1], 15],
					cursor: draw.cursors.downArrow,
					func: draw.table2.selectCol,
					pathNum: pathNum,
					c: c
				});
				pos.push({
					shape: 'rect',
					dims: [xPos[c] - 5, obj.top, 10, obj.height],
					cursor: draw.cursors.ew,
					func: draw.table2.resizeCol,
					pathNum: pathNum,
					c: c
				});
			}
			for (var r = 1; r < yPos.length; r++) {
				pos.push({
					shape: 'rect',
					dims: [obj.left - 10, yPos[r - 1], 15, yPos[r] - yPos[r - 1]],
					cursor: draw.cursors.rightArrow,
					func: draw.table2.selectRow,
					pathNum: pathNum,
					r: r
				});
				pos.push({
					shape: 'rect',
					dims: [obj.left, yPos[r] - 5, obj.width, 10],
					cursor: draw.cursors.ns,
					func: draw.table2.resizeRow,
					pathNum: pathNum,
					r: r
				});
			}
		}
		return pos;
	},
	getCursorPositionsInteract: function (obj, path, pathNum) {
		var pos = [];
		if (!un(path)) {
			var interact = obj.interact || path.interact || path.isInput;
			if (!un(interact) && interact.type === 'select' && interact._disabled !== true) {
				pos = pos.concat(draw.table2.selectTable.getCursorPositionsInteract(obj, path, pathNum));
			} else if (!un(interact) && interact.type === 'trueFalse' && interact._disabled !== true) {
				var cells = draw.table2.getAllCells(obj);
				pos.push({
					shape: 'rect',
					dims: cells[1]._rect,
					cursor: draw.cursors.pointer,
					func: draw.table2.trueFalseTable.cellClick,
					value:true,
					path: path,
					obj: obj,
					pathNum: pathNum
				});
				pos.push({
					shape: 'rect',
					dims: cells[2]._rect,
					cursor: draw.cursors.pointer,
					func: draw.table2.trueFalseTable.cellClick,
					value:false,
					path: path,
					obj: obj,
					pathNum: pathNum
				});
			}
		}
		return pos;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'table2-paddingHMinus',
			shape: 'rect',
			dims: [(x1 + x2) / 2 - 20, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.table2.paddingHMinus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'table2-paddingHPlus',
			shape: 'rect',
			dims: [(x1 + x2) / 2, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.table2.paddingHPlus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'table2-paddingVMinus',
			shape: 'rect',
			dims: [x2 - 20, (y1 + y2) / 2, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.table2.paddingVMinus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'table2-paddingVPlus',
			shape: 'rect',
			dims: [x2 - 20, (y1 + y2) / 2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.table2.paddingVPlus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'table2-draw.table2.questionFit',
			shape: 'rect',
			dims: [x2 - 40, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.table2.questionFit,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'table2-draw.table2.questionGrid',
			shape: 'rect',
			dims: [x2 - 60, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.table2.questionGrid,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'table2-deleteContent',
			shape: 'rect',
			dims: [x2 - 40, y1, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.table2.deleteContent,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.lineWidth = 2;
				ctx.strokeStyle = colorA('#F00', 0.5);
				ctx.beginPath();
				ctx.moveTo(l + 0.2 * w, t + 0.2 * h);
				ctx.lineTo(l + 0.8 * w, t + 0.8 * h);
				ctx.moveTo(l + 0.2 * w, t + 0.8 * h);
				ctx.lineTo(l + 0.8 * w, t + 0.2 * h);
				ctx.stroke();
			}
		});
		buttons.push({
			buttonType: 'table2-reorder',
			shape: 'rect',
			dims: [x2 - 60, y1, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.table2.reorder,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#9FC', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					rect: [l, t, w, h],
					align: [0, 0],
					text: ['<<fontSize:12>>ab']
				});
			}
		});

		buttons.push({
			buttonType: 'text2-fracScale',
			shape: 'rect',
			dims: [x1, y2 - 80, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.table2.setFracScale,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'text2-algPadding',
			shape: 'rect',
			dims: [x1, y2 - 100, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.table2.setAlgPadding,
			pathNum: pathNum
		});

		if (!un(pathNum)) {
			var path = draw.path[pathNum];
			if (!un(path)) {
				if (!un(path.isInput) && path.isInput.type == 'select' && path.obj.length == 1) {
					buttons = buttons.concat(draw.table2.selectTable.getButtons(x1, x2, y1, y2, pathNum));
				} else if (!un(path.obj[0].interact) && path.obj[0].interact.type === 'select') {
					buttons = buttons.concat(draw.table2.selectTable.getButtons(x1, x2, y1, y2, pathNum));
				} else if (!un(path.obj[0].interact) && path.obj[0].interact.type === 'trueFalse') {
					buttons = buttons.concat(draw.table2.trueFalseTable.getButtons(x1, x2, y1, y2, pathNum));
				}
			}
		}
		return buttons;
	},
	setFracScale: function (obj) {
		if (un(obj)) {
			var obj = draw.path[draw.currCursor.pathNum].obj[0];
		}
		if (obj.fracScale == 1) {
			delete obj.fracScale;
		} else {
			obj.fracScale = 1;
		}
		drawCanvasPaths();
	},
	setAlgPadding: function () {
		if (un(obj)) {
			var obj = draw.path[draw.currCursor.pathNum].obj[0];
		}
		if (typeof obj.algPadding == 'undefined') {
			obj.algPadding = 0;
		} else if (obj.algPadding == 5) {
			delete obj.algPadding;
		} else {
			obj.algPadding++;
		}
		drawCanvasPaths();
	},

	getAriaText: function(obj) {
		var ariaText = '';
		var cells = draw.table2.getAllCells(obj);
		for (var c = 0; c < cells.length; c++) {
			var cellText = textArrayToAriaText(cells[c].text);
			cellText = cellText.trim();
			if (cellText === '') continue;
			if (ariaText.length > 0 && ['.',',','?','!',':',';'].indexOf(ariaText.slice(-1)) === -1) ariaText += ',';
			ariaText += ' '+cellText;
		}
		//if (ariaText.length > 0 && ['.',',','?','!',':',';'].indexOf(ariaText.slice(-1)) === -1) ariaText += '.';
		return [{
			text:ariaText,
			rect:[obj.left,obj.top,arraySum(obj.widths),arraySum(obj.heights)]
		}];
	},
	getSelectedCells: function (obj,allIfNoneSelected) {
		var selected = [];
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				if (obj.cells[r][c].selected == true)
					selected.push(obj.cells[r][c]);
			}
		}
		if (allIfNoneSelected === true && selected.length === 0) {
			return draw.table2.getAllCells(obj);
		}
		return selected;
	},
	getAllCells: function (obj) {
		var all = [];
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				all.push(obj.cells[r][c]);
			}
		}
		return all;
	},
	countSelectedCells: function (obj) {
		var selected = 0;
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				if (obj.cells[r][c].selected == true)
					selected++;
			}
		}
		return selected;
	},
	transpose: function (obj) {
		if (un(obj)) obj = sel();
		if (un(obj)) return;
		/*//draw.table2.getCellsOverlappingPaths(obj);
		var cells = obj.cells;
		var cells2 = [];
		var widths = [];
		var heights = [];
		for (var r = 0; r < cells.length; r++) {
			for (var c = 0; c < cells[r].length; c++) {
				if (un(cells2[c])) cells2[c] = [];
				cells2[c][r] = cells[r][c];
				if (un(widths[r]) || widths[r] < obj.widths[c]) widths[r] = obj.widths[c];
				if (un(heights[c]) || heights[c] < obj.heights[r]) heights[c] = obj.heights[r];
			}
		}
		obj.cells = cells2;
		obj.widths = widths;
		obj.heights = heights;*/
		var cells = [];
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				cells.push({r:r,c:c,cell:obj.cells[r][c]});
			}
		}
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			obj.cells[cell.c][cell.r] = cell.cell;
		}
		updateBorder(selPaths()[0]);
		//draw.table2.positionCellsOverlappingPaths(obj);
		drawCanvasPaths();
	},
	getCellsOverlappingPaths: function(obj,paths) {
		if (un(paths)) paths = draw.path;
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			if (path.obj[0] === obj) continue;
			//if (path.obj.length !== 1 || path.obj[0].type !== 'text2') continue;
			if (path.obj.length === 1 && path.obj[0].type === 'table2') continue;
			var r = -1, c = -1;
			var x = obj.left;
			var y = obj.top;
			for (var w = 0; w < obj.widths.length; w++) {
				if (x < path._center[0] && path._center[0] < x+obj.widths[w]) {
					c = w;
					break;
				}
				x += obj.widths[w];
			}
			for (var h = 0; h < obj.heights.length; h++) {
				if (y < path._center[1] && path._center[1] < y+obj.heights[h]) {
					r = h;
					break;
				}
				y += obj.heights[w];
			}
			if (r === -1 || c === -1) continue;
			var cell = obj.cells[r][c];
			if (un(cell.__linkedPaths)) cell.__linkedPaths = [];
			cell.__linkedPaths.push({path:path,offset:[path.tightBorder[0]-x,path.tightBorder[1]-y]});
		}
	},
	positionCellsOverlappingPaths: function(obj) {
		var y = obj.top;
		var x = obj.left;
		for (var r = 0; r < obj.cells.length; r++) {
			x = obj.left;
			for (var c = 0; c < obj.cells[c].length; c++) {
				var cell = obj.cells[r][c];
				if (!un(cell.__linkedPaths)) {
					for (var l = 0; l < cell.__linkedPaths.length; l++) {
						var path = cell.__linkedPaths[l].path;
						var offset = cell.__linkedPaths[l].offset;
						positionPath(path,x+offset[0],y+offset[1]);
					}
				}
				delete cell.__linkedPaths;
				x += obj.widths[c];
			}
			y += obj.heights[r];
		}
	},	
	reorder: function (obj) {
		if (un(obj)) obj = sel();
		if (un(obj)) return;
		//draw.table2.getCellsOverlappingPaths(obj);
		var cells = obj.cells;
		var allCells = [];
		for (var c = 0; c < obj.widths.length; c++) { // get cells column by column
			for (var r = 0; r < cells.length; r++) {
				allCells.push(cells[r][c]);
			}
		}
		for (var r = 0; r < cells.length; r++) { // replace cells row by row
			for (var c = 0; c < cells[r].length; c++) {
				cells[r][c] = allCells.shift();
			}
		}
		//draw.table2.positionCellsOverlappingPaths(obj);
		updateBorder(selPaths()[0]);
		drawCanvasPaths();
	},
	setColumns: function (cols, obj) {
		if (un(obj))
			obj = sel();
		if (un(obj))
			return;
		if (un(cols))
			cols = obj.widths.length - 1;

		var width = 0;
		for (var c = 0; c < obj.widths.length; c++)
			width += obj.widths[c];
		obj.widths = [];
		for (var c = 0; c < cols; c++)
			obj.widths[c] = width / cols;

		var cells = obj.cells;
		var allCells = [];
		for (var r = 0; r < cells.length; r++) {
			for (var c = 0; c < cells.length; c++) {
				allCells.push(cells[r][c]);
			}
		}
		var rows = Math.ceil(allCells.length / cols);
		while (obj.heights.length < rows)
			obj.heights.push(obj.heights.last());

		obj.cells = [];
		for (var r = 0; r < rows; r++) { // replace cells row by row
			obj.cells[r] = [];
			for (var c = 0; c < cols; c++) {
				if (allCells.length == 0)
					continue;
				obj.cells[r][c] = allCells.shift();
			}
		}
		updateBorder(selPaths()[0]);
		drawCanvasPaths();
	},
	deleteContent: function (obj) {
		if (typeof obj == 'undefined') {
			if (sel() == false)
				return;
			var obj = sel();
		}
		var cells = draw.table2.getSelectedCells(obj);
		if (cells.length == 0)
			cells = draw.table2.getAllCells(obj);
		for (var c = 0; c < cells.length; c++)
			cells[c].text = [""];
		drawCanvasPaths();
	},
	grabPaths: function () {
		var s = selPaths();
		var tablePath,
		table;
		for (var p = 0; p < s.length; p++) {
			if (s[p].obj[0].type == 'table2') {
				tablePath = s[p];
				tablePath.selected = false;
				table = s[p].obj[0];
				s.splice(p, 1);
				break;
			}
		}
		if (typeof table == 'undefined')
			return;
		var xPos = [table.left];
		var yPos = [table.top];
		for (var w = 0; w < table.widths.length; w++)
			xPos[w + 1] = xPos[w] + table.widths[w];
		for (var h = 0; h < table.heights.length; h++)
			yPos[h + 1] = yPos[h] + table.heights[h];
		for (var p = 0; p < s.length; p++) {
			var row,
			col;
			var x = s[p].tightBorder[0] + 0.5 * s[p].tightBorder[2];
			var y = s[p].tightBorder[1] + 0.5 * s[p].tightBorder[3];
			for (var w = 0; w < xPos.length - 1; w++) {
				if (x >= xPos[w] && x <= xPos[w + 1]) {
					col = w;
					break;
				}
			}
			for (var h = 0; h < yPos.length - 1; h++) {
				if (y >= yPos[h] && y <= yPos[h + 1]) {
					row = h;
					break;
				}
			}
			//console.log(s[p].obj[0],x,y,col,row);
			var cell = table.cells[row][col];
			if (un(cell.paths))
				cell.paths = [];
			cell.paths = cell.paths.concat(s[p]);
		}

		// delete paths from main drawPaths
		for (var p = draw.path.length - 1; p >= 0; p--) {
			if (draw.path[p].selected == true) {
				draw.path[p].selected = false;
				draw.path.splice(p, 1);
			}
		}
		tablePath.selected = true;

		//console.log(table);
		drawCanvasPaths();
	},
	releasePaths: function () {
		var table = sel();
		if (typeof table == 'undefined' || table.type !== 'table2')
			return;
		for (var r = 0; r < table.cells.length; r++) {
			for (var c = 0; c < table.cells[r].length; c++) {
				var cell = table.cells[r][c];
				if (un(cell.paths))
					continue;
				for (var p = 0; p < cell.paths.length; p++) {
					cell.paths[p].selected = true;
					draw.path.push(cell.paths[p]);
					updateBorder(cell.paths[p]);
				}
				delete cell.paths
			}
		}
		drawCanvasPaths();
	},
	resizeCol: function () {
		changeDrawMode('tableColResize');
		draw.tableColResizing = draw.currCursor.c;
		draw.selectedPath = draw.currCursor.pathNum;
		draw.animate(draw.table2.resizeMove,draw.table2.resizeStop,drawCanvasPaths);
		//addListenerMove(window, draw.table2.resizeMove);
		//addListenerEnd(window, draw.table2.resizeStop);
	},
	resizeMove: function (e) {
		updateMouse(e);
		var path = draw.path[draw.selectedPath];
		var obj = path.obj[0];
		var width = draw.mouse[0] - obj.xPos[draw.tableColResizing - 1];
		if (obj.type == 'table') {
			for (var i = 0; i < obj.cells.length; i++) {
				obj.cells[i][draw.tableColResizing - 1].minWidth = width;
			}
		} else if (obj.type == 'table2') {
			if (draw.tableColResizing == obj.widths.length) {
				var tableRight = obj.left;
				for (var w = 0; w < obj.widths.length - 1; w++)
					tableRight += obj.widths[w];
				tableRight += width;
				if (Math.abs(tableRight - (draw.drawArea[2] - draw.gridMargin[2])) < draw.snapTolerance)
					width += ((draw.drawArea[2] - draw.gridMargin[2]) - tableRight);
			}
			obj.widths[draw.tableColResizing - 1] = width;
			obj.width = arraySum(obj.widths);
		}
		updateBorder(path);
		//drawSelectedPaths();
		//drawSelectCanvas();
	},
	resizeStop: function (e) {
		removeListenerMove(window, draw.table2.resizeMove);
		removeListenerEnd(window, draw.table2.resizeStop);
		changeDrawMode('prev');
		//drawCanvasPaths();
	},
	resizeRow: function () {
		changeDrawMode('tableRowResize');
		draw.tableRowResizing = draw.currCursor.r;
		draw.selectedPath = draw.currCursor.pathNum;
		draw.animate(draw.table2.rowResizeMove,draw.table2.rowResizeStop,drawCanvasPaths);
		//addListenerMove(window, draw.table2.rowResizeMove);
		//addListenerEnd(window, draw.table2.rowResizeStop);
	},
	rowResizeMove: function (e) {
		updateMouse(e);
		var path = draw.path[draw.selectedPath];
		var height = draw.mouse[1] - path.obj[0].yPos[draw.tableRowResizing - 1];
		if (path.obj[0].type == 'table') {
			for (var i = 0; i < path.obj[0].cells[draw.tableRowResizing - 1].length; i++) {
				path.obj[0].cells[draw.tableRowResizing - 1][i].minHeight = height;
			}
			repositionPath(path);
		} else if (path.obj[0].type == 'table2') {
			path.obj[0].heights[draw.tableRowResizing - 1] = height;
			path.obj[0].height = arraySum(path.obj[0].heights);
		}
		updateBorder(path);
		//drawSelectedPaths();
		//drawSelectCanvas();
	},
	rowResizeStop: function (e) {
		//removeListenerMove(window, draw.table2.rowResizeMove);
		//removeListenerEnd(window, draw.table2.rowResizeStop);
		changeDrawMode('prev');
		//drawCanvasPaths();
	},
	selectCol: function () {
		var col = draw.currCursor.c - 1;
		var pathNum = draw.currCursor.pathNum;
		var path = draw.path[pathNum];
		var cells = path.obj[0].cells;
		for (var r = 0; r < cells.length; r++) {
			for (var c = 0; c < cells[r].length; c++) {
				if (c == col) {
					cells[r][c].selected = true;
					cells[r][c].highlight = true;
				} else {
					delete cells[r][c].selected;
					delete cells[r][c].highlight;
				}
			}
		}
		drawSelectedPaths();
		draw.startX = draw.mouse[0]
			draw.startY = draw.mouse[1];
		changeDrawMode('tableColSelect');
		draw.animate(draw.table2.cellSelectMove,draw.table2.cellSelectStop,drawCanvasPaths);
		//addListenerMove(window, draw.table2.cellSelectMove);
		//addListenerEnd(window, draw.table2.cellSelectStop);
	},
	selectRow: function () {
		var row = draw.currCursor.r - 1;
		var pathNum = draw.currCursor.pathNum;
		var path = draw.path[pathNum];
		var cells = path.obj[0].cells;
		for (var r = 0; r < cells.length; r++) {
			for (var c = 0; c < cells[r].length; c++) {
				if (r == row) {
					cells[r][c].selected = true;
					cells[r][c].highlight = true;
				} else {
					delete cells[r][c].selected;
					delete cells[r][c].highlight;
				}
			}
		}
		drawSelectedPaths();
		draw.startX = draw.mouse[0]
		draw.startY = draw.mouse[1];
		changeDrawMode('tableRowSelect');
		draw.animate(draw.table2.cellSelectMove,draw.table2.cellSelectStop,drawCanvasPaths);
		//addListenerMove(window, draw.table2.cellSelectMove);
		//addListenerEnd(window, draw.table2.cellSelectStop);
	},
	selectCell: function () {
		var col = draw.currCursor.c;
		var row = draw.currCursor.r;
		var pathNum = draw.currCursor.pathNum;
		var path = draw.path[pathNum];
		var cells = path.obj[0].cells;
		for (var r = 0; r < cells.length; r++) {
			for (var c = 0; c < cells[r].length; c++) {
				if (r == row && c == col) {
					cells[r][c].selected = true;
					cells[r][c].highlight = true;
				} else {
					delete cells[r][c].selected;
					delete cells[r][c].highlight;
				}
			}
		}
		drawSelectedPaths();
		draw.startX = draw.mouse[0]
		draw.startY = draw.mouse[1];
		changeDrawMode('tableCellSelect');
		draw.animate(draw.table2.cellSelectMove,draw.table2.cellSelectStop,drawCanvasPaths);
		//addListenerMove(window, draw.table2.cellSelectMove);
		//addListenerEnd(window, draw.table2.cellSelectStop);
	},
	cellSelectMove: function (e) {
		updateMouse(e);
		var pathNum = draw.currCursor.pathNum;
		var startCol = draw.currCursor.c;
		var startRow = draw.currCursor.r;
		var path = draw.path[pathNum];
		var obj = path.obj[0];
		var xPos = obj.xPos;
		var yPos = obj.yPos;
		var colsSelected = [];
		var rowsSelected = [];
		var xMin = Math.min(draw.mouse[0], draw.startX);
		var xMax = Math.max(draw.mouse[0], draw.startX);
		var yMin = Math.min(draw.mouse[1], draw.startY);
		var yMax = Math.max(draw.mouse[1], draw.startY);
		if (draw.drawMode == 'tableRowSelect') {
			for (var k = 0; k < xPos.length - 1; k++) {
				colsSelected[k] = true;
			}
		} else {
			for (var k = 0; k < xPos.length - 1; k++) {
				if ((xPos[k] > xMin && xPos[k] < xMax) || (xPos[k] < xMin && xPos[k + 1] > xMax) || (xPos[k + 1] > xMin && xPos[k + 1] < xMax)) {
					colsSelected[k] = true;
				} else {
					colsSelected[k] = false;
				}
			}
		}
		if (draw.drawMode == 'tableColSelect') {
			for (var k = 0; k < yPos.length - 1; k++) {
				rowsSelected[k] = true;
			}
		} else {
			for (var k = 0; k < yPos.length - 1; k++) {
				if ((yPos[k] > yMin && yPos[k] < yMax) || (yPos[k] < yMin && yPos[k + 1] > yMax) || (yPos[k + 1] > yMin && yPos[k + 1] < yMax)) {
					rowsSelected[k] = true;
				} else {
					rowsSelected[k] = false;
				}
			}
		}
		if (getArrayCount(colsSelected, true) == 1 && getArrayCount(rowsSelected, true) == 1) {
			var selectCount = 1;
		} else if (getArrayCount(colsSelected, true) == 0 && getArrayCount(rowsSelected, true) == 0) {
			var selectCount = 0;
		} else {
			var selectCount = 2;
		}

		var cells = obj.cells;
		for (var k = 0; k < cells.length; k++) {
			for (var l = 0; l < cells[k].length; l++) {
				if (rowsSelected[k] == true && colsSelected[l] == true) {
					cells[k][l].selected = true;
					if (selectCount == 2 || draw.drawMode !== 'tableInputSelect') {
						cells[k][l].highlight = true;
					} else {
						delete cells[k][l].highlight;
					}
				} else {
					delete cells[k][l].selected;
					delete cells[k][l].highlight;
				}
			}
		}
		//drawSelectedPaths();
	},
	cellSelectStop: function (e) {
		//removeListenerMove(window, draw.table2.cellSelectMove);
		//removeListenerEnd(window, draw.table2.cellSelectStop);
		var pathNum = draw.currCursor.pathNum;
		var startCol = draw.currCursor.c;
		var startRow = draw.currCursor.r;
		var path = draw.path[pathNum];
		var obj = path.obj[0];
		var xPos = obj.xPos;
		var yPos = obj.yPos;
		changeDrawMode('textEdit');
		calcCursorPositions();
	},
	deselectTables: function () {
		var path = draw.path;
		for (var i = 0; i < path.length; i++) {
			if (typeof path[i].obj == 'undefined')
				continue;
			var changed = false;
			for (var j = 0; j < path[i].obj.length; j++) {
				if (path[i].obj[j].type == 'table' || path[i].obj[j].type == 'table2') {
					var cells = path[i].obj[j].cells;
					for (var r = 0; r < cells.length; r++) {
						for (var c = 0; c < cells[r].length; c++) {
							if (cells[r][c].selected == true) {
								delete cells[r][c].selected;
								delete cells[r][c].highlight;
								cells[r][c].text = removeTagsOfType(cells[r][c].text, 'selected');
								changed = true;
							}
						}
					}
				}
			}
			if (changed)
				drawSelectedPaths();
		}
	},
	paddingHPlus: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (un(obj.paddingH))
			obj.paddingH = 0;
		obj.paddingH += 5;
		drawSelectedPaths();
	},
	paddingHMinus: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (un(obj.paddingH))
			obj.paddingH = 0;
		obj.paddingH = Math.max(0, obj.paddingH - 5);
		drawSelectedPaths();
	},
	paddingVPlus: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (un(obj.paddingV))
			obj.paddingV = 0;
		obj.paddingV += 5;
		drawSelectedPaths();
	},
	paddingVMinus: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (un(obj.paddingV))
			obj.paddingV = 0;
		obj.paddingV = Math.max(0, obj.paddingV - 5);
		drawSelectedPaths();
	},
	questionGrid: function (border, dir) {
		if (un(dir))
			dir = 'vert';
		for (var p = 0; p < draw.path.length; p++) {
			if (draw.path[p].selected && draw.path[p].obj.length == 1 && draw.path[p].obj[0].type == 'table2') {
				var path = draw.path[p];
				var obj = path.obj[0];
				obj.fontSize = 28;
				if (draw.gridVertMargins.length > 0) {
					var totalWidth = draw.drawArea[2] - (draw.gridVertMargins[0] + draw.gridMargin[2]);
				} else {
					var totalWidth = draw.drawArea[2] - (draw.gridMargin[0] + draw.gridMargin[2]);
				}
				obj.width = totalWidth;
				for (var w = 0; w < obj.widths.length; w++) {
					obj.widths[w] = totalWidth / obj.widths.length;
				}
				if (draw.gridVertMargins.length > 0) {
					repositionPath(path, draw.gridVertMargins[0] - path.tightBorder[0], 0, 0, 0);
				} else {
					repositionPath(path, draw.gridMargin[0] - path.tightBorder[0], 0, 0, 0);
				}
				var cells = obj.cells;
				var letters = 'abcdefghijklmnopqrstuvwxyz';
				var cols = obj.widths.length;
				var rows = obj.heights.length;
				var count = 0;
				for (var r = 0; r < cells.length; r++) {
					for (var c = 0; c < cells[r].length; c++) {
						var cell = cells[r][c];
						cell.align = [-1, 0];
						delete cell.fontSize;
						if (dir == 'vert') {
							var char = letters.charAt(c * rows + r);
						} else {
							var char = letters.charAt(count);
						}
						var tabs = tab;
						if ('fijl'.indexOf(char) > -1)
							tabs += tab;
						cell.text = [char + ')' + tabs]
						count++;
					}
				}
				distributeHoriz();
				distributeVert();
				if (boolean(border, false) == false)
					obj.innerBorder.show = false;
				obj.outerBorder.show = false;
				updateBorder(path);
				drawCanvasPaths();
				repositionPath(path);
				return;
			}
		}
		console.log('selected table not found');
	},
	questionFit: function () {
		for (var p = 0; p < draw.path.length; p++) {
			if (draw.path[p].selected && draw.path[p].obj.length == 1 && draw.path[p].obj[0].type == 'table2') {
				var path = draw.path[p];
				var obj = path.obj[0];
				if (draw.gridVertMargins.length > 0) {
					var totalWidth = draw.drawArea[2] - (draw.gridVertMargins[0] + draw.gridMargin[2]);
				} else {
					var totalWidth = draw.drawArea[2] - (draw.gridMargin[0] + draw.gridMargin[2]);
				}
				obj.width = totalWidth;
				for (var w = 0; w < obj.widths.length; w++) {
					obj.widths[w] = totalWidth / obj.widths.length;
				}
				if (draw.gridVertMargins.length > 0) {
					repositionPath(path, draw.gridVertMargins[0] - path.tightBorder[0], 0, 0, 0);
				} else {
					repositionPath(path, draw.gridMargin[0] - path.tightBorder[0], 0, 0, 0);
				}
				distributeHoriz();
				distributeVert();
				obj.innerBorder.show = false;
				obj.outerBorder.show = false;
				updateBorder(path);
				drawCanvasPaths();
				repositionPath(path);
				return;
			}
		}
		console.log('selected table not found');
	},
	addRows: function (path, below) {
		if (path.obj[0].type !== 'table2')
			return;
		var obj = path.obj[0];
		var selRowsCols = draw.table2.getSelRowsCols(obj);
		var selRows = selRowsCols.rows;
		if (selRows.length === 0) {
			selRows = below === true ? [obj.heights.length-1] : [0];
		}

		draw.drawModeSave = draw.drawMode;
		draw.drawMode = 'none';
		var cells = obj.cells;
		var newRows = [];
		var newHeights = [];
		for (var r = 0; r < selRows.length; r++) {
			newRows.push(clone(cells[selRows[r]]));
			newHeights.push(obj.heights[selRows[r]]);
		}
		if (boolean(below, true) == false) {
			var newCel = obj.cells.slice(0, selRows[0]).concat(newRows).concat(obj.cells.slice(selRows[0]));
			var newHei = obj.heights.slice(0, selRows[0]).concat(newHeights).concat(obj.heights.slice(selRows[0]));
		} else {
			var newCel = obj.cells.slice(0, selRows[selRows.length - 1] + 1).concat(newRows).concat(obj.cells.slice(selRows[selRows.length - 1] + 1));
			var newHei = obj.heights.slice(0, selRows[selRows.length - 1] + 1).concat(newHeights).concat(obj.heights.slice(selRows[selRows.length - 1] + 1));
		}
		obj.cells = newCel;
		obj.heights = newHei;
		draw.drawMode = draw.drawModeSave;
		updateBorder(path);
		drawCanvasPaths();
	},
	addCols: function (path, right) {
		if (path.obj[0].type !== 'table' && path.obj[0].type !== 'table2') return;
		var obj = path.obj[0];
		var selRowsCols = draw.table2.getSelRowsCols(obj);
		var selCols = selRowsCols.cols;
		if (selCols.length === 0) {
			selCols = right === true ? [obj.widths.length-1] : [0];
		}

		draw.drawModeSave = draw.drawMode;
		draw.drawMode = 'none';
		var cells = obj.cells;
		var newWidths = [];
		for (var r = 0; r < cells.length; r++) {
			var newCells = [];
			for (var c = 0; c < selCols.length; c++) {
				var cell = clone(cells[r][selCols[c]]);
				var tags = textArrayGetStartTags(cell.text);
				cell.text = [tags];
				newCells.push(cell);
				if (r == 0)
					newWidths.push(obj.widths[selCols[c]]);
			}
			if (boolean(right, true) == false) {
				var newRow = obj.cells[r].slice(0, selCols[0]).concat(newCells).concat(obj.cells[r].slice(selCols[0]));
			} else {
				var newRow = obj.cells[r].slice(0, selCols[selCols.length - 1] + 1).concat(newCells).concat(obj.cells[r].slice(selCols[selCols.length - 1] + 1));
			}
			obj.cells[r] = newRow;
		}
		if (boolean(right, true) == false) {
			obj.widths = obj.widths.slice(0, selCols[0]).concat(newWidths).concat(obj.widths.slice(selCols[0]));
		} else {
			obj.widths = obj.widths.slice(0, selCols[selCols.length - 1] + 1).concat(newWidths).concat(obj.widths.slice(selCols[selCols.length - 1] + 1));
		}
		draw.drawMode = draw.drawModeSave;
		updateBorder(path);
		drawCanvasPaths();
	},
	deleteRows: function (path) {
		if (path.obj[0].type !== 'table' && path.obj[0].type !== 'table2') return;
		var obj = path.obj[0];
		var selRowsCols = draw.table2.getSelRowsCols(obj);
		var selRows = selRowsCols.rows;
		if (selRows.length === 0) selRows = [obj.heights.length-1];
		if (selRows.length === obj.heights.length) return;

		var cells = obj.cells;
		var type = obj.type;
		for (var r = selRows.length - 1; r >= 0; r--) {
			cells.splice(selRows[r], 1);
			obj.heights.splice(selRows[r], 1);
		}

		updateBorder(path);
		drawCanvasPaths();
	},
	deleteCols: function (path) {
		if (path.obj[0].type !== 'table' && path.obj[0].type !== 'table2') return;
		var obj = path.obj[0];
		var selRowsCols = draw.table2.getSelRowsCols(obj);
		var selCols = selRowsCols.cols;
		if (selCols.length === 0) selCols = [obj.widths.length-1];
		if (selCols.length === obj.widths.length) return;

		var cells = obj.cells;
		var type = obj.type;
		for (var r = 0; r < cells.length; r++) {
			for (var c = selCols.length - 1; c >= 0; c--) {
				cells[r].splice(selCols[c], 1);
				if (r == 0)
					obj.widths.splice(selCols[c], 1);
			}
		}

		updateBorder(path);
		drawCanvasPaths();
	},
	getSelRowsCols: function (obj) {
		var cells = obj.cells;
		var selRows = [];
		var selCols = [];
		var rowHeights = [];
		var colWidths = [];
		for (var r = 0; r < cells.length; r++) {
			for (var c = 0; c < cells[r].length; c++) {
				if (cells[r][c].selected == true) {
					if (selRows.indexOf(r) == -1) {
						selRows.push(r);
						rowHeights.push(obj.heights[r]);
					}
					if (selCols.indexOf(c) == -1) {
						selCols.push(c);
						colWidths.push(obj.widths[c]);
					}
				}
			}
		}
		return {
			rows: selRows,
			cols: selCols,
			rowHeights: rowHeights,
			colWidths: colWidths
		};
	},
	mergeTablesH: function () {
		var paths = selPaths();
		for (var p = paths.length - 1; p >= 0; p--) {
			if (paths[p].obj.length > 1 || paths[p].obj[0].type !== 'table2')
				paths.splice(p, 1);
		}
		if (paths.length < 2)
			return;
		paths.sort(function (a, b) {
			return a.border[0] - b.border[0];
		});

		var table = paths[0].obj[0];
		var cols = table.widths.length;

		for (var p = 1; p < paths.length; p++) {
			var obj = paths[p].obj[0];
			table.widths = table.widths.concat(obj.widths);
			var cells = obj.cells;
			for (r = 0; r < cells.length; r++) {
				for (c = 0; c < cells[r].length; c++) {
					table.cells[r][cols + c] = cells[r][c];
				}
			}
		}
		paths[0].selected = false;
		deletePaths();
		paths[0].selected = true;
		updateBorder(paths[0]);
		drawCanvasPaths();
	},
	mergeTablesV: function () {
		var paths = selPaths();
		for (var p = paths.length - 1; p >= 0; p--) {
			if (paths[p].obj.length > 1 || paths[p].obj[0].type !== 'table2')
				paths.splice(p, 1);
		}
		if (paths.length < 2)
			return;
		paths.sort(function (a, b) {
			return a.border[1] - b.border[1];
		});

		var table = paths[0].obj[0];
		var rows = table.heights.length;

		for (var p = 1; p < paths.length; p++) {
			var obj = paths[p].obj[0];
			table.heights = table.heights.concat(obj.heights);
			var cells = obj.cells;
			for (r = 0; r < cells.length; r++) {
				for (c = 0; c < cells[r].length; c++) {
					if (un(table.cells[rows + r]))
						table.cells[rows + r] = [];
					table.cells[rows + r][c] = cells[r][c];
				}
			}
		}
		paths[0].selected = false;
		deletePaths();
		paths[0].selected = true;
		updateBorder(paths[0]);
		drawCanvasPaths();
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		for (var w = 0; w < obj.widths.length; w++)
			obj.widths[w] *= sf;
		for (var h = 0; h < obj.heights.length; h++)
			obj.heights[h] *= sf;
		if (!un(obj.innerBorder)) {
			if (!un(obj.innerBorder.width))
				obj.innerBorder.width *= sf;
			if (!un(obj.innerBorder.dash)) {
				if (!un(obj.innerBorder.dash[0]))
					obj.innerBorder.dash[0] *= sf;
				if (!un(obj.innerBorder.dash[1]))
					obj.innerBorder.dash[1] *= sf;
			}
		}
		if (!un(obj.outerBorder)) {
			if (!un(obj.outerBorder.width))
				obj.outerBorder.width *= sf;
			if (!un(obj.outerBorder.dash)) {
				if (!un(obj.outerBorder.dash[0]))
					obj.outerBorder.dash[0] *= sf;
				if (!un(obj.outerBorder.dash[1]))
					obj.outerBorder.dash[1] *= sf;
			}
		}
		if (!un(obj.text)) {
			if (!un(obj.text.size))
				obj.text.size *= sf;
		}
		if (!un(obj.padding))
			obj.padding *= sf;
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				var cell = obj.cells[r][c];
				if (!un(cell.padding)) cell.padding *= sf;
				if (!un(cell.fontSize)) cell.fontSize *= sf;
				textArrayFontSizeAdjust(cell.text, sf);
			}
		}
	},
	getControlPanel: function (obj) {
		var elements = [{
				name: 'Style',
				type: 'style'
			}, {
				name: 'Outer Border',
				type: 'tableBorder',
				type2: 'outer'
			}, {
				name: 'Inner Border',
				type: 'tableBorder',
				type2: 'inner'
			}
		];
		return {
			obj: obj,
			elements: elements
		};
	},
	removePadding: function (obj) {
		var cells = draw.table2.getAllCells(obj);
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			delete cell.padding;
		}
		drawCanvasPaths();
	},
	extractText: function (obj) {
		if (un(obj))
			obj = sel();
		var y = obj.top;
		for (var r = 0; r < obj.cells.length; r++) {
			var x = obj.left;
			for (var c = 0; c < obj.cells[r].length; c++) {
				var cell = obj.cells[r][c];
				if (cell.selected !== true || un(cell.text) || arraysEqual(cell.text, [''])) {
					x += obj.widths[c];
					continue;
				}
				var obj2 = {
					type: "text2"
				};
				copyProperties(cell, obj2, ["type", "highlight", "padding", "tightRect", "selected"]);
				obj2.rect = [x, y, obj.widths[c], obj.heights[r]];
				draw.path.push({
					obj: [obj2],
					selected: true
				});
				cell.text = [''];
				x += obj.widths[c];
			}
			y += obj.heights[r];
		}
		draw.updateAllBorders();
		drawCanvasPaths();
	},
	getStartTags: function (obj) {
		var tags = clone(defaultTags);
		if (!un(obj.tags)) {
			for (var key in obj.tags) {
				tags[key] = clone(obj.tags[key]);
			}
		}
		if (!un(obj.text)) {
			if (!un(obj.text.color))
				tags.color = obj.text.color;
			if (!un(obj.text.font))
				tags.font = obj.text.font;
			if (!un(obj.text.size))
				tags.fontSize = obj.text.size;
		}
		for (var key in tags) {
			if (!un(obj[key]))
				tags[key] = clone(obj[key]);
		}

		if (!un(obj.cells) && !un(obj.cells[0]) && !un(obj.cells[0][0])) {
			var cell = obj.cells[0][0];
			if (!un(cell.align))
				tags.align = clone(cell.align);
			if (!un(cell.bold))
				tags.bold = cell.bold;
			if (!un(cell.italic))
				tags.italic = cell.italic;
			if (!un(cell.font))
				tags.font = cell.font;
			if (!un(cell.fontSize))
				tags.fontSize = cell.fontSize;
			if (!un(cell.textColor))
				tags.color = cell.textColor;

			var str = cell.text[0];
			while (str.length > 2 && str.slice(0, 2) == '<<' && str.slice(0, 3) !== '<<<' && str.indexOf('>>') !== -1) {
				var pos = str.indexOf('>>') + 2;
				var tag = str.slice(0, pos);
				var pos2 = tag.indexOf(':');
				var key = tag.slice(2, pos2);
				var value = tag.slice(pos2 + 1, -2);
				if (key !== 'align') {
					if (value == 'true') {
						value = true;
					} else if (value == 'false') {
						value = false;
					} else if (!isNaN(Number(value))) {
						value = Number(value);
					}
					tags[key] = value;
				}
				str = str.slice(pos);
			}
		}
		return tags;
	},

	copyPasteValues: function () {
		var paths = selPaths();
		var t1 = paths[0].obj[0];
		var t2 = paths[1].obj[0];
		for (var r = 0; r < t1.cells.length; r++) {
			for (var c = 0; c < t1.cells[r].length; c++) {
				t2.cells[r][c].text = clone(t1.cells[r][c].text);
			}
		}
		drawCanvasPaths();
	},
	splitToText:function(obj) {
		if (un(obj)) obj = sel();
		if (typeof obj !== 'object') return false;
		var paths = [];
		var y = obj.top;
		var tableBox, tableAlgPadding, tableFracScale;
		if (!un(obj.innerBorder) && obj.innerBorder.show === true) {
			tableBox = {
				type:'loose',
				borderColor:obj.innerBorder.color,
				borderWidth:obj.innerBorder.width,
				color:'none'
			}
		}
		if (!un(obj.algPadding)) tableAlgPadding = obj.algPadding;
		if (!un(obj.fracScale)) tableFracScale = obj.fracScale;
		for (var r = 0; r < obj.cells.length; r++) {
			var height = obj.heights[r];
			var x = obj.left;
			for (var c = 0; c < obj.cells[r].length; c++) {
				var cell = clone(obj.cells[r][c]);
				var width = obj.widths[c];
				delete cell.tightRect;
				delete cell._r;
				delete cell._c;
				cell.type = 'text2';
				cell.rect = [x,y,width,height];
				if (un(cell.box) && !un(tableBox)) cell.box = clone(tableBox);
				if (un(cell.algPadding) && !un(tableAlgPadding)) cell.algPadding = clone(tableAlgPadding);
				if (un(cell.fracScale) && !un(tableFracScale)) cell.fracScale = clone(tableFracScale);
				paths.push({
					obj:[cell],
					selected:true
				})
				x += width;
			}
			y += height;
		}
		var index = draw.path.indexOf(obj._path);
		if (index > -1) draw.path.splice(index,1);
		console.log(paths);
		draw.path = draw.path.concat(paths);
		draw.updateAllBorders();
		drawCanvasPaths();
	}
};
draw.skewGrid = {
	add: function (hSquares, vSquares, dotGrid) {
		if (un(hSquares)) hSquares = 4;
		if (un(vSquares)) vSquares = 4;
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		var width = hSquares*40+vSquares*10;
		var height = hSquares*0+vSquares*30;
		var left = center[0] - width/2;
		var top = center[1] - height/2;
		draw.path.unshift({
			obj: [{
					type: 'skewGrid',
					left: left,
					top: top,
					hSquares: hSquares,
					vSquares: vSquares,
					baseVectors: [[40, 0], [10, 30]],
					dots: boolean(dotGrid, false),
					color: draw.color,
					lineWidth: draw.thickness,
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++) updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path, backColor, backColorFill) {
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.lineWidth;
		ctx.beginPath();
		for (var v = 0; v <= obj.vSquares; v++) {
			ctx.moveTo(obj.left + v * obj.baseVectors[1][0], obj.top + v * obj.baseVectors[1][1]);
			ctx.lineTo(obj.left + v * obj.baseVectors[1][0] + obj.hSquares * obj.baseVectors[0][0], obj.top + v * obj.baseVectors[1][1] + obj.hSquares * obj.baseVectors[0][1]);
		}
		for (var h = 0; h <= obj.hSquares; h++) {
			ctx.moveTo(obj.left + h * obj.baseVectors[0][0], obj.top + h * obj.baseVectors[0][1]);
			ctx.lineTo(obj.left + h * obj.baseVectors[0][0] + obj.vSquares * obj.baseVectors[1][0], obj.top + h * obj.baseVectors[0][1] + obj.vSquares * obj.baseVectors[1][1]);
		}
		ctx.stroke();
		if (!un(path) && path.selected == true) {
			ctx.beginPath();

			ctx.moveTo(obj.left + obj.baseVectors[0][0] + 8, obj.top + obj.baseVectors[0][1]);
			ctx.arc(obj.left + obj.baseVectors[0][0], obj.top + obj.baseVectors[0][1], 8, 0, 2 * Math.PI);

			ctx.moveTo(obj.left + obj.baseVectors[1][0] + 8, obj.top + obj.baseVectors[1][1]);
			ctx.arc(obj.left + obj.baseVectors[1][0], obj.top + obj.baseVectors[1][1], 8, 0, 2 * Math.PI);

			ctx.fillStyle = '#F00';
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			ctx.fill();
			ctx.stroke();
		}
	},
	getRect: function (obj) {
		var x1 = obj.baseVectors[0][0] * obj.hSquares;
		var x2 = obj.baseVectors[1][0] * obj.vSquares;
		var y1 = obj.baseVectors[0][1] * obj.hSquares;
		var y2 = obj.baseVectors[1][1] * obj.vSquares;

		var xMin = Math.min(obj.left, obj.left + x1, obj.left + x2, obj.left + x1 + x2);
		var xMax = Math.max(obj.left, obj.left + x1, obj.left + x2, obj.left + x1 + x2);
		var yMin = Math.min(obj.top, obj.top + y1, obj.top + y2, obj.top + y1 + y2);
		var yMax = Math.max(obj.top, obj.top + y1, obj.top + y2, obj.top + y1 + y2);

		return [xMin, yMin, xMax - xMin, yMax - yMin];
	},
	getSnapPos: function (obj) {
		var snapPos = [];
		var a = clone(obj.baseVectors[0]);
		var b = clone(obj.baseVectors[1]);
		var c = [obj.left, obj.top];
		var d = [obj.left, obj.top];
		for (var i = 0; i <= obj.hSquares; i++) {
			for (var j = 0; j <= obj.vSquares; j++) {
				snapPos.push({
					type: 'point',
					pos: clone(d)
				});
				d = vector.addVectors(d, b);
			}
			c = vector.addVectors(c, a);
			d = clone(c);
		}
		return snapPos;
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var a = [obj.left + obj.baseVectors[0][0], obj.top + obj.baseVectors[0][1]];
		var b = [obj.left + obj.baseVectors[1][0], obj.top + obj.baseVectors[1][1]];
		return [{
				shape: 'circle',
				dims: [a[0], a[1], 10],
				cursor: draw.cursors.pointer,
				func: draw.skewGrid.dragBaseVectorStart,
				obj: obj,
				vectorIndex: 0,
				pathNum: pathNum
			}, {
				shape: 'circle',
				dims: [b[0], b[1], 10],
				cursor: draw.cursors.pointer,
				func: draw.skewGrid.dragBaseVectorStart,
				obj: obj,
				vectorIndex: 1,
				pathNum: pathNum
			}
		];
	},
	dragBaseVectorStart: function () {
		changeDrawMode('skewGridDragBaseVector');
		draw.drag = {
			obj: draw.currCursor.obj,
			pathNum: draw.currCursor.pathNum,
			vectorIndex: draw.currCursor.vectorIndex
		};
		updateSnapPoints();
		draw.animate(draw.skewGrid.dragBaseVectorMove,draw.skewGrid.dragBaseVectorEnd,drawCanvasPaths);
		//addListenerMove(window, draw.skewGrid.dragBaseVectorMove);
		//addListenerEnd(window, draw.skewGrid.dragBaseVectorEnd);
	},
	dragBaseVectorMove: function (e) {
		updateMouse(e);
		var obj = draw.drag.obj;
		if (shiftOn == true) {
			if (draw.mouse[0] - obj.left <= draw.mouse - obj.top) {
				obj.baseVectors[draw.drag.vectorIndex] = [0, draw.mouse[1] - obj.top];
			} else {
				obj.baseVectors[draw.drag.vectorIndex] = [draw.mouse[0] - obj.left, 0];
			}
		} else {
			obj.baseVectors[draw.drag.vectorIndex][0] = draw.mouse[0] - obj.left;
			obj.baseVectors[draw.drag.vectorIndex][1] = draw.mouse[1] - obj.top;
		}
		updateBorder(draw.path[draw.drag.pathNum]);
		//drawCanvasPaths();
	},
	dragBaseVectorEnd: function (e) {
		delete draw.drag;
		//removeListenerMove(window, draw.skewGrid.dragBaseVectorMove);
		//removeListenerEnd(window, draw.skewGrid.dragBaseVectorEnd);
		changeDrawMode();
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'simpleGrid-yPlus',
			shape: 'rect',
			dims: [x2 - 20, y1 + 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.skewGrid.yPlus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'simpleGrid-yMinus',
			shape: 'rect',
			dims: [x2 - 20, y1 + 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.skewGrid.yMinus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'simpleGrid-xMinus',
			shape: 'rect',
			dims: [x1 + 20, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.skewGrid.xMinus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'simpleGrid-xPlus',
			shape: 'rect',
			dims: [x1 + 40, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.skewGrid.xPlus,
			pathNum: pathNum
		});
		return buttons;
	},
	yPlus: function (path) {
		if (un(path))
			path = draw.path[draw.currCursor.pathNum];
		path.obj[0].vSquares++;
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	yMinus: function (path) {
		if (un(path))
			path = draw.path[draw.currCursor.pathNum];
		path.obj[0].vSquares--;
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	xPlus: function (path) {
		if (un(path))
			path = draw.path[draw.currCursor.pathNum];
		path.obj[0].hSquares++;
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	xMinus: function (path) {
		if (un(path))
			path = draw.path[draw.currCursor.pathNum];
		path.obj[0].hSquares--;
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	drawButton: function (ctx, size) {
		draw.skewGrid.draw(ctx, {
			type: 'skewGrid',
			left: 0.15 * size,
			top: 0.2 * size,
			hSquares: 3,
			vSquares: 3,
			baseVectors: [[0.18 * size, 0], [0.05 * size, 0.18 * size]],
			dots: false,
			color: '#000',
			lineWidth: 0.02 * size,
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		obj.baseVectors[0][0] *= sf;
		obj.baseVectors[0][1] *= sf;
		obj.baseVectors[1][0] *= sf;
		obj.baseVectors[1][1] *= sf;
	}
};
draw.simpleGrid = {
	add: function (hSquares, vSquares, size, dotGrid) {
		if (un(hSquares)) hSquares = 8;
		if (un(vSquares)) vSquares = 8;
		if (un(size)) size = 40;
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.unshift({
			obj: [{
					type: 'simpleGrid',
					left: center[0]-hSquares * size/2,
					top: center[1]-vSquares * size/2,
					width: hSquares * size,
					height: vSquares * size,
					xMin: -0.01,
					xMax: hSquares + 0.01,
					yMin: -0.01,
					yMax: vSquares + 0.01,
					xMajorStep: 1,
					xMinorStep: 1,
					yMajorStep: 1,
					yMinorStep: 1,
					showLabels: false,
					showScales: false,
					dots: boolean(dotGrid, false),
					showGrid: !boolean(dotGrid, false),
					showAxes: false,
					showBorder: false,
					color: draw.color,
					thickness: draw.thickness,
					xZero: 0,
					yZero: vSquares * size,
					hSquares: hSquares,
					vSquares: vSquares,
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++) updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path, backColor, backColorFill) {
		if (typeof obj.fillRects === 'object') {
			for (var i = 0; i < obj.fillRects.length; i++) {
				var fillRect = obj.fillRects[i];
				var rect = {
					l:getPosOfCoordX2(fillRect.rect[0], obj.left, obj.width, obj.xMin, obj.xMax),
					t:getPosOfCoordY2(fillRect.rect[1], obj.top, obj.height, obj.yMin, obj.yMax),
					r:getPosOfCoordX2(fillRect.rect[0]+fillRect.rect[2], obj.left, obj.width, obj.xMin, obj.xMax),
					b:getPosOfCoordY2(fillRect.rect[1]+fillRect.rect[3], obj.top, obj.height, obj.yMin, obj.yMax)
				};
				if (rect.r < obj.left || rect.l > obj.left+obj.width || rect.b < obj.top || rect.t > obj.top+obj.height) continue;
				var x1 = Math.min(Math.max(rect.l,obj.left),obj.left+obj.width);
				var x2 = Math.min(Math.max(rect.r,obj.left),obj.left+obj.width);
				var y1 = Math.min(Math.max(rect.t,obj.top),obj.top+obj.height);
				var y2 = Math.min(Math.max(rect.b,obj.top),obj.top+obj.height);
				if (x2 === x1 || y2 === y1) continue;
				if (typeof fillRect.fillColor === 'string' && fillRect.fillColor !== 'none') {
					ctx.save();
					ctx.fillStyle = fillRect.fillColor;
					ctx.fillRect(x1,y1,x2-x1,y2-y1);
					ctx.restore();
				}
			}
		}
		draw.grid.draw(ctx, obj, path, backColor, backColorFill);
	},
	getRect: function (obj) {
		var ctx = draw.hiddenCanvas.ctx;
		ctx.clearRect(0, 0, 10000, 10000);
		obj.labelBorder = drawGrid3(ctx, 0, 0, obj).labelBorder;
		return obj.labelBorder;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'simpleGrid-yPlus',
			shape: 'rect',
			dims: [x2 - 20, y1 + 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.simpleGrid.yPlus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'simpleGrid-yMinus',
			shape: 'rect',
			dims: [x2 - 20, y1 + 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.simpleGrid.yMinus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'simpleGrid-xMinus',
			shape: 'rect',
			dims: [x1 + 20, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.simpleGrid.xMinus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'simpleGrid-xPlus',
			shape: 'rect',
			dims: [x1 + 40, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.simpleGrid.xPlus,
			pathNum: pathNum
		});

		return buttons;
	},
	yPlus: function (path) {
		if (un(path))
			path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		var size = obj.height / obj.vSquares;
		obj.vSquares++;
		obj.height += size;
		obj.yMax = obj.vSquares + 0.01;
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	yMinus: function (path) {
		if (un(path))
			path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		if (obj.vSquares == 1)
			return;
		var size = obj.height / obj.vSquares;
		obj.vSquares--;
		obj.height -= size;
		obj.yMax = obj.vSquares + 0.01;
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	xPlus: function (path) {
		if (un(path))
			path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		var size = obj.width / obj.hSquares;
		obj.hSquares++;
		obj.width += size;
		obj.xMax = obj.hSquares + 0.01;
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	xMinus: function (path) {
		if (un(path))
			path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		if (obj.hSquares == 1)
			return;
		var size = obj.width / obj.hSquares;
		obj.hSquares--;
		obj.width -= size;
		obj.xMax = obj.hSquares + 0.01;
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	drawButton: function (ctx, size) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.02 * size;
		ctx.beginPath();
		for (var i = 0; i < 5; i++) {
			ctx.moveTo(0.2 * size, 0.2 * size + i * 0.15 * size);
			ctx.lineTo(0.8 * size, 0.2 * size + i * 0.15 * size);
			ctx.moveTo(0.2 * size + i * 0.15 * size, 0.2 * size);
			ctx.lineTo(0.2 * size + i * 0.15 * size, 0.8 * size);
		}
		ctx.stroke();
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		obj.width *= sf;
		obj.height *= sf;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		return draw.grid.getCursorPositionsSelected(obj, pathNum);
	},
	getCursorPositionsInteract: function (obj, path, pathNum) {
		if (typeof obj.interact === 'object' && obj.interact.mode === 'fillRect' && obj.interact.disabled !== true && obj.interact._disabled !== true) {
			return [{
				shape:'rect',
				dims:[obj.left,obj.top,obj.width,obj.height],
				obj:obj,
				pathNum:pathNum,
				cursor:draw.cursors.pointer,
				func:draw.simpleGrid.fillRectToggle
			}];
		}
		return draw.grid.getCursorPositionsInteract(obj, path, pathNum);
	},
	fillRectToggle:function() {
		var obj = draw.currCursor.obj;
		var pos = getCoordAtMousePos(obj);
		if (un(obj.fillRects)) obj.fillRects = [];
		for (var r = 0; r < obj.fillRects.length; r++) {
			var fillRect = obj.fillRects[r];
			if (fillRect.rect[0] <= pos[0] && fillRect.rect[1] <= pos[1] && pos[0] < fillRect.rect[0]+fillRect.rect[2] && pos[1] < fillRect.rect[1]+fillRect.rect[3]) {
				obj.fillRects.splice(r,1);
				drawCanvasPaths();
				return;
			}
		}
		var fillColor = typeof obj.interact.fillColor === 'string' ? obj.interact.fillColor : '#FCF';
		obj.fillRects.push({rect:[Math.floor(pos[0]),Math.floor(pos[1]),1,1],fillColor:fillColor});
		drawCanvasPaths();
	}
};
draw.dotGrid = {
	add: function () {
		draw.simpleGrid.add(undefined, undefined, undefined, true);
	},
	drawButton: function (ctx, size) {
		ctx.beginPath();
		ctx.fillStyle = '#000';
		for (var i = 0; i < 5; i++) {
			for (var j = 0; j < 5; j++) {
				ctx.beginPath();
				ctx.arc(0.2 * size + i * 0.15 * size, 0.2 * size + j * 0.15 * size, 0.02 * size, 0, 2 * Math.PI);
				ctx.fill();
			}
		}
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		obj.width *= sf;
		obj.height *= sf;
	}
};
draw.numberline = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'numberline',
			rect: [center[0]-250, center[1]-30, 500, 60],
			min: -5,
			max: 5,
			minorStep: 0.5,
			majorStep: 1,
			minorColor: '#000',
			majorColor: '#000',
			lineWidth: 4,
			lineColor: '#000',
			backColor: '#FFF',
			majorWidth: 2,
			minorWidth: 1.2,
			minorYPos: [0.5, 0.65],
			majorYPos: [0.3, 0.7],
			font: 'Arial',
			fontSize: 24,
			arrows: 30
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj) {
		obj.ctx = ctx;
		drawNumberLine2(obj);
		delete obj.ctx;
	},
	getRect: function (obj) {
		var rect = clone(obj.rect);
		if (boolean(obj.vertical) == true) {
			rect[0] -= 10;
			rect[2] += 20;
		} else {
			rect[1] -= 10;
			rect[3] += 20;
		}

		rect = rect.concat([rect[0] + rect[2], rect[1] + rect[3]]);
		return rect;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		if (obj.vertical == true) {
			obj.rect[3] += dh;
		} else {
			obj.rect[2] += dw;
		}
	},
	getCursorPositionsUnselected: function (obj, pathNum) {
		return [{
				shape: 'rect',
				dims: obj.rect,
				cursor: draw.cursors.pointer,
				func: drawClickSelect,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			}
		];
	},
	getSnapPos: function (obj) {
		var snapPos = [];
		var left = obj.rect[0];
		var top = obj.rect[1];
		var width = obj.rect[2];
		var height = obj.rect[3];

		if (boolean(obj.vertical == true)) {
			var x0 = left + 0.5 * width;

			if (typeof obj.arrows == 'number') {
				snapPos.push({
					type: 'point',
					pos: [x0, obj.rect[1]]
				});
				snapPos.push({
					type: 'point',
					pos: [x0, obj.rect[1] + obj.rect[3]]
				});
				top += obj.arrows;
				height -= 2 * obj.arrows;
			}

			var y0 = top - (obj.min * height) / (obj.max - obj.min);

			var minorSpacing = (height * obj.minorStep) / (obj.max - obj.min);
			var yAxisPoint = y0;
			while (Math.round(yAxisPoint) <= Math.round(top + height)) {
				if (Math.round(yAxisPoint) >= Math.round(top)) {
					snapPos.push({
						type: 'point',
						pos: [x0, yAxisPoint]
					});
				}
				yAxisPoint += minorSpacing;
			}
			var yAxisPoint = y0 - minorSpacing;
			while (Math.round(yAxisPoint) >= Math.round(top)) {
				if (Math.round(yAxisPoint) <= Math.round(top + height)) {
					snapPos.push({
						type: 'point',
						pos: [x0, yAxisPoint]
					});
				}
				yAxisPoint -= minorSpacing;
			}

			var majorSpacing = (height * obj.majorStep) / (obj.max - obj.min);
			var yAxisPoint = y0;
			while (Math.round(yAxisPoint) <= Math.round(top + height)) {
				if (Math.round(yAxisPoint) >= Math.round(top)) {
					snapPos.push({
						type: 'point',
						pos: [x0, yAxisPoint]
					});
				}
				yAxisPoint += majorSpacing;
			}
			var yAxisPoint = y0 - majorSpacing;
			while (Math.round(yAxisPoint) >= Math.round(top)) {
				if (Math.round(yAxisPoint) <= Math.round(top + height)) {
					snapPos.push({
						type: 'point',
						pos: [x0, yAxisPoint]
					});
				}
				yAxisPoint -= majorSpacing;
			}
		} else {
			var y0 = top + 0.5 * height;

			if (typeof obj.arrows == 'number') {
				snapPos.push({
					type: 'point',
					pos: [obj.rect[0], y0]
				});
				snapPos.push({
					type: 'point',
					pos: [obj.rect[0] + obj.rect[2], y0]
				});
				left += obj.arrows;
				width -= 2 * obj.arrows;
			}

			var x0 = left - (obj.min * width) / (obj.max - obj.min);

			var minorSpacing = (width * obj.minorStep) / (obj.max - obj.min);
			var xAxisPoint = x0;
			while (Math.round(xAxisPoint) <= Math.round(left + width)) {
				if (Math.round(xAxisPoint) >= Math.round(left)) {
					snapPos.push({
						type: 'point',
						pos: [xAxisPoint, y0]
					});
				}
				xAxisPoint += minorSpacing;
			}
			var xAxisPoint = x0 - minorSpacing;
			while (Math.round(xAxisPoint) >= Math.round(left)) {
				if (Math.round(xAxisPoint) <= Math.round(left + width)) {
					snapPos.push({
						type: 'point',
						pos: [xAxisPoint, y0]
					});
				}
				xAxisPoint -= minorSpacing;
			}

			var majorSpacing = (width * obj.majorStep) / (obj.max - obj.min);
			var xAxisPoint = x0;
			while (Math.round(xAxisPoint) <= Math.round(left + width)) {
				if (Math.round(xAxisPoint) >= Math.round(left)) {
					snapPos.push({
						type: 'point',
						pos: [xAxisPoint, y0]
					});
				}
				xAxisPoint += majorSpacing;
			}
			var xAxisPoint = x0 - majorSpacing;
			while (Math.round(xAxisPoint) >= Math.round(left)) {
				if (Math.round(xAxisPoint) <= Math.round(left + width)) {
					snapPos.push({
						type: 'point',
						pos: [xAxisPoint, y0]
					});
				}
				xAxisPoint -= majorSpacing;
			}
		}

		return snapPos;
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
		obj.majorWidth = lineWidth * (2 / 4);
		obj.minorWidth = lineWidth * (1.2 / 4);
	},
	setLineColor: function (obj, color) {
		obj.lineColor = color;
		obj.majorColor = color;
		obj.minorColor = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.lineColor;
	},
	toggleHorizVert: function () {
		if (!un(draw.currCursor) && !un(draw.currCursor.pathNum)) {
			var obj = draw.path[draw.currCursor.pathNum].obj[0];
		} else {
			var obj = sel();
		}
		if (obj == false)
			return;

		if (boolean(obj.vertical) == true) {
			delete obj.vertical;
			obj.rect = [obj.rect[0], obj.rect[1], Math.max(obj.rect[2], obj.rect[3]), Math.min(obj.rect[2], obj.rect[3])];
			obj.minorYPos = [0.5, 0.65];
		} else {
			obj.vertical = true;
			obj.rect = [obj.rect[0], obj.rect[1], Math.min(obj.rect[2], obj.rect[3]), Math.max(obj.rect[2], obj.rect[3])];
			obj.minorYPos = [0.35, 0.65];
		}
		updateBorder(selPath());
		drawCanvasPaths();
	},
	toggleScale: function () {
		if (!un(draw.currCursor) && !un(draw.currCursor.pathNum)) {
			var obj = draw.path[draw.currCursor.pathNum].obj[0];
		} else {
			var obj = sel();
		}
		if (obj == false)
			return;

		if (obj.showScales === false) {
			delete obj.showScales;
		} else {
			obj.showScales = false;
		}
		updateBorder(selPath());
		drawCanvasPaths();
	},
	toggleMinorPos: function () {
		if (!un(draw.currCursor) && !un(draw.currCursor.pathNum)) {
			var obj = draw.path[draw.currCursor.pathNum].obj[0];
		} else {
			var obj = sel();
		}
		if (obj == false)
			return;

		if (obj.showMinorPos === false) {
			delete obj.showMinorPos;
		} else {
			obj.showMinorPos = false;
		}
		updateBorder(selPath());
		drawCanvasPaths();
	},
	toggleArrows: function () {
		if (!un(draw.currCursor) && !un(draw.currCursor.pathNum)) {
			var obj = draw.path[draw.currCursor.pathNum].obj[0];
		} else {
			var obj = sel();
		}
		if (obj == false)
			return;

		if (typeof obj.arrows == 'number') {
			delete obj.arrows;
		} else {
			obj.arrows = 30;
		}
		updateBorder(selPath());
		drawCanvasPaths();
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		if (un(draw.path[pathNum])) return [];
		var obj = draw.path[pathNum].obj[0];

		var dims = obj.vertical == true ? [x1, y1 + 60, 20, 20] : [x1 + 60, y1, 20, 20];
		var button = {
			buttonType: 'numberline-toggleHorizVert',
			shape: 'rect',
			dims: dims,
			cursor: draw.cursors.pointer,
			func: draw.numberline.toggleHorizVert,
			pathNum: pathNum
		};
		button.draw = function (path, ctx, l, t, w, h) {
			ctx.fillStyle = colorA('#F96', 0.5);
			ctx.fillRect(l, t, w, h);
			ctx.strokeStyle = colorA('#000', 0.5);
			ctx.strokeRect(l, t, w, h);
			ctx.beginPath();
			if (boolean(path.obj[0].vertical, false) == true) {
				ctx.moveTo(l + 0.5 * w, t + 0.15 * h);
				ctx.lineTo(l + 0.5 * w, t + 0.85 * h);
				for (var i = 0; i < 4; i++) {
					ctx.moveTo(l + 0.4 * w, t + (0.15 + (0.7 / 3) * i) * h);
					ctx.lineTo(l + 0.6 * w, t + (0.15 + (0.7 / 3) * i) * h);
				}
			} else {
				ctx.moveTo(l + 0.15 * w, t + 0.5 * h);
				ctx.lineTo(l + 0.85 * w, t + 0.5 * h);
				for (var i = 0; i < 4; i++) {
					ctx.moveTo(l + (0.15 + (0.7 / 3) * i) * w, t + 0.4 * h);
					ctx.lineTo(l + (0.15 + (0.7 / 3) * i) * w, t + 0.6 * h);
				}
			}
			ctx.stroke();
		}
		buttons.push(button);

		var dims = obj.vertical == true ? [x1, y1 + 80, 20, 20] : [x1 + 80, y1, 20, 20];
		var button = {
			buttonType: 'numberline-toggleScale',
			shape: 'rect',
			dims: dims,
			cursor: draw.cursors.pointer,
			func: draw.numberline.toggleScale,
			pathNum: pathNum
		};
		button.draw = function (path, ctx, l, t, w, h) {
			if (boolean(path.obj[0].showScales, true) == true) {
				ctx.fillStyle = colorA('#F96', 0.5);
				ctx.fillRect(l, t, w, h);
			}
			ctx.strokeStyle = colorA('#000', 0.5);
			ctx.strokeRect(l, t, w, h);
			text({
				ctx: ctx,
				textArray: ['<<fontSize:' + (w / 2) + '>>123'],
				left: l,
				top: t,
				width: w,
				height: h,
				textAlign: 'center',
				vertAlign: 'middle'
			});
		}
		buttons.push(button);

		var dims = obj.vertical == true ? [x1, y1 + 100, 20, 20] : [x1 + 100, y1, 20, 20];
		var button = {
			buttonType: 'numberline-toggleMinorPos',
			shape: 'rect',
			dims: dims,
			cursor: draw.cursors.pointer,
			func: draw.numberline.toggleMinorPos,
			pathNum: pathNum
		};
		button.draw = function (path, ctx, l, t, w, h) {
			if (boolean(path.obj[0].showMinorPos, true) == true) {
				ctx.fillStyle = colorA('#F96', 0.5);
				ctx.fillRect(l, t, w, h);
			}
			ctx.strokeStyle = colorA('#000', 0.5);
			ctx.strokeRect(l, t, w, h);
			text({
				ctx: ctx,
				textArray: ['<<fontSize:' + (w / 2) + '>>min'],
				left: l,
				top: t,
				width: w,
				height: h,
				textAlign: 'center',
				vertAlign: 'middle'
			});
		}
		buttons.push(button);

		var dims = obj.vertical == true ? [x1, y1 + 120, 20, 20] : [x1 + 120, y1, 20, 20];
		var button = {
			buttonType: 'numberline-toggleArrows',
			shape: 'rect',
			dims: dims,
			cursor: draw.cursors.pointer,
			func: draw.numberline.toggleArrows,
			pathNum: pathNum
		};
		button.draw = function (path, ctx, l, t, w, h) {
			if (typeof path.obj[0].arrows == 'number') {
				ctx.fillStyle = colorA('#F96', 0.5);
				ctx.fillRect(l, t, w, h);
			}
			ctx.strokeStyle = colorA('#000', 0.5);
			ctx.strokeRect(l, t, w, h);
			drawArrow({
				ctx: ctx,
				startX: l + 0.2 * w,
				startY: t + 0.5 * h,
				finX: l + 0.8 * w,
				finY: t + 0.5 * h,
				doubleEnded: true,
				color: '#000',
				lineWidth: 1,
				fillArrow: true,
				arrowLength: 5
			});
		}
		buttons.push(button);

		return buttons;
	},
	/*drawButton: function() {
	var l = 0;
	var t = 0;
	var w = draw.buttonSize;
	var h = draw.buttonSize;
	var ctx = this.ctx;

	roundedRect(ctx,3,3,w-6,h-6,8,6,'#000',draw.buttonColor);

	ctx.strokeStyle = draw.color;
	ctx.lineWidth = 2*(w/55);
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	ctx.save();
	ctx.beginPath();
	ctx.moveTo(l+0.15*w,t+0.5*h);
	ctx.lineTo(l+0.85*w,t+0.5*h);
	for (var i = 0; i < 4; i++) {
	ctx.moveTo(l+(0.15+(0.7/3)*i)*w,t+0.4*h);
	ctx.lineTo(l+(0.15+(0.7/3)*i)*w,t+0.6*h);
	}
	ctx.stroke();
	ctx.restore();
	},*/
	drawButton: function (ctx, size) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.03 * size;

		ctx.beginPath();
		ctx.moveTo(0.15 * size, 0.5 * size);
		ctx.lineTo(0.85 * size, 0.5 * size);
		for (var i = 0; i < 4; i++) {
			ctx.moveTo((0.15 + (0.7 / 3) * i) * size, 0.4 * size);
			ctx.lineTo((0.15 + (0.7 / 3) * i) * size, 0.6 * size);
		}
		ctx.stroke();
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.rect[0] = center[0] + sf * (obj.rect[0] - center[0]);
			obj.rect[1] = center[1] + sf * (obj.rect[1] - center[1]);
		}
		obj.rect[2] *= sf;
		obj.rect[3] *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
		if (!un(obj.majorWidth))
			obj.majorWidth *= sf;
		if (!un(obj.minorWidth))
			obj.minorWidth *= sf;
		if (!un(obj.fontSize))
			obj.fontSize *= sf;
		if (!un(obj.arrows))
			obj.arrows *= sf;
	}
};
draw.isoDotGrid = {
	resizable: true,
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.unshift({
			obj: [{
					type: 'isoDotGrid',
					left: center[0]-200,
					top: center[1]-200,
					width: 400,
					height: 400,
					spacingFactor: 15,
					color: draw.color,
					radius: draw.thickness * 2,
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++) updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj) {
		obj.ctx = ctx;
		obj._snapPos = drawIsometricDotty(obj);
		delete obj.ctx;
	},
	getRect: function (obj) {
		return [obj.left, obj.top, obj.width, obj.height, obj.left + obj.width, obj.top + obj.height];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		obj.width += dw;
		obj.height += dh;
	},
	getCursorPositionsUnselected: function (obj, pathNum) {
		return [{
				shape: 'rect',
				dims: [obj.left, obj.top, obj.width, obj.height],
				cursor: draw.cursors.pointer,
				func: drawClickSelect,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			}
		];
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		if (un(draw.path[pathNum]))
			return [];
		var obj = draw.path[pathNum].obj[0];

		var dims = [x2 - 20, y1 + 20, 20, 20];
		var button = {
			buttonType: 'isoDotGrid-switchDirection',
			shape: 'rect',
			dims: dims,
			cursor: draw.cursors.pointer,
			func: draw.isoDotGrid.switchDirection,
			pathNum: pathNum,
			obj: obj
		};
		button.draw = function (path, ctx, l, t, w, h) {
			ctx.fillStyle = colorA('#F90', 0.5);
			ctx.fillRect(l, t, w, h);

			drawArrow({
				ctx: ctx,
				startX: l + 0.8 * w,
				startY: t + 0.2 * h,
				finX: l + 0.2 * w,
				finY: t + 0.8 * h,
				arrowLength: 4,
				color: '#000',
				lineWidth: 2,
				fillArrow: true,
				doubleEnded: false,
				angleBetweenLinesRads: 0.7
			});

			drawArrow({
				ctx: ctx,
				finX: l + 0.8 * w,
				finY: t + 0.2 * h,
				startX: l + 0.2 * w,
				startY: t + 0.8 * h,
				arrowLength: 4,
				color: '#000',
				lineWidth: 2,
				fillArrow: true,
				doubleEnded: false,
				angleBetweenLinesRads: 0.7
			});

		}
		buttons.push(button);

		var dims = [x2 - 20, y1 + 40, 20, 20];
		var button = {
			buttonType: 'isoDotGrid-spacingFactorPlus',
			shape: 'rect',
			dims: dims,
			cursor: draw.cursors.pointer,
			func: draw.isoDotGrid.spacingFactorPlus,
			pathNum: pathNum,
			obj: obj
		};
		button.draw = function (path, ctx, l, t, w, h) {
			ctx.strokeStyle = '#000';
			ctx.fillStyle = colorA('#F6F', 0.5);
			ctx.fillRect(l, t, w, h);
			ctx.beginPath();
			ctx.moveTo(l + 0.3 * w, t + 0.5 * h);
			ctx.lineTo(l + 0.7 * w, t + 0.5 * h);
			ctx.moveTo(l + 0.5 * w, t + 0.3 * h);
			ctx.lineTo(l + 0.5 * w, t + 0.7 * h);
			ctx.stroke();
		}
		buttons.push(button);

		var dims = [x2 - 20, y1 + 60, 20, 20];
		var button = {
			buttonType: 'isoDotGrid-spacingFactorMinus',
			shape: 'rect',
			dims: dims,
			cursor: draw.cursors.pointer,
			func: draw.isoDotGrid.spacingFactorMinus,
			pathNum: pathNum,
			obj: obj
		};
		button.draw = function (path, ctx, l, t, w, h) {
			ctx.strokeStyle = '#000';
			ctx.fillStyle = colorA('#F6F', 0.5);
			ctx.fillRect(l, t, w, h);
			ctx.beginPath();
			ctx.moveTo(l + 0.3 * w, t + 0.5 * h);
			ctx.lineTo(l + 0.7 * w, t + 0.5 * h);
			ctx.stroke();
		}
		buttons.push(button);

		return buttons;
	},
	switchDirection: function () {
		var obj = draw.currCursor.obj;
		obj.direction = obj.direction == 1 ? 0 : 1;
		drawCanvasPaths();
	},
	spacingFactorPlus: function () {
		var obj = draw.currCursor.obj;
		obj.spacingFactor++;
		drawCanvasPaths();
	},
	spacingFactorMinus: function () {
		var obj = draw.currCursor.obj;
		obj.spacingFactor = Math.max(obj.spacingFactor - 1, 5);
		drawCanvasPaths();
	},
	getSnapPos: function (obj) {
		var snapPos = [];
		for (var p = 0; p < obj._snapPos.length; p++)
			snapPos.push({
				type: 'point',
				pos: obj._snapPos[p]
			});
		return snapPos;
	},
	setLineWidth: function (obj, lineWidth) {
		obj.radius = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.color = color;
	},
	setRadius: function (obj, radius) {
		obj.radius = radius;
	},
	getLineWidth: function (obj) {
		return obj.radius;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.color;
	},
	getRadius: function (obj) {
		return obj.radius;
	},
	drawButton: function (ctx, size) {
		drawIsometricDotty({
			ctx: ctx,
			left: 0.15 * size,
			top: 0.15 * size,
			width: 0.7 * size,
			height: 0.7 * size,
			spacingFactor: 0.04 * size,
			color: '#000',
			radius: 0.02 * size
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		obj.width *= sf;
		obj.height *= sf;
		if (!un(obj.spacingFactor))
			obj.spacingFactor *= sf;
		if (!un(obj.radius))
			obj.radius *= sf;
	}

};
draw.cylinder = {
	resizable: true,
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'cylinder',
					center: [center[0],center[1]+100],
					radiusX: 100,
					radiusY: 33,
					height: 200,
					color: '#000',
					thickness: 3,
					fillColor:'#99F',
					fillColor2:'#CCF',
					opacity:1
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++)
			updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (obj.radiusX <= 0 || obj.radiusY <= 0) return;
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};

		var dash = !un(obj.dash) ? obj.dash : [10, 10];
		ctx.setLineDash(dash);
		ctx.strokeStyle = colorA(obj.color,0.5);
		ctx.beginPath();
		ctx.moveTo(obj.center[0] - obj.radiusX, obj.center[1] + obj.height);
		ctx.ellipse(obj.center[0], obj.center[1] + obj.height, obj.radiusX, obj.radiusY, 0, Math.PI, 2 * Math.PI);
		ctx.stroke();

		if (!un(obj.fillColor)) {
			ctx.beginPath();
			ctx.moveTo(obj.center[0] - obj.radiusX, obj.center[1]);
			ctx.ellipse(obj.center[0], obj.center[1], obj.radiusX, obj.radiusY, 0, 1 * Math.PI, 0 * Math.PI, true);
			ctx.lineTo(obj.center[0] + obj.radiusX, obj.center[1] + obj.height);
			ctx.ellipse(obj.center[0], obj.center[1]+obj.height, obj.radiusX, obj.radiusY, 0, 0 * Math.PI, 1 * Math.PI, false);
			ctx.lineTo(obj.center[0] - obj.radiusX, obj.center[1]);
			
			var gradient = ctx.createLinearGradient(obj.center[0] - obj.radiusX, obj.center[1], obj.center[0] + obj.radiusX, obj.center[1]);
			var opacity = !un(obj.opacity) ? obj.opacity : 1;
			if (!un(obj.fillColor2)) {
				var c1 = colorA(obj.fillColor,opacity);
				var c2 = colorA(obj.fillColor2,opacity);
			} else {
				var c1 = colorA(obj.fillColor,0.8);
				var c2 = colorA(obj.fillColor2,0.5);
			}
			gradient.addColorStop(0, c1);
			gradient.addColorStop(1, c2);
			ctx.fillStyle = gradient;
			
			ctx.fill();
			
			ctx.beginPath();
			ctx.ellipse(obj.center[0], obj.center[1], obj.radiusX, obj.radiusY, 0, 0 * Math.PI, 2 * Math.PI, false);
			ctx.fill();
		}
		
		ctx.strokeStyle = obj.color;
		ctx.setLineDash([]);
		ctx.beginPath();
		ctx.moveTo(obj.center[0] + obj.radiusX, obj.center[1]);
		ctx.ellipse(obj.center[0], obj.center[1], obj.radiusX, obj.radiusY, 0, 0, 2 * Math.PI);

		ctx.moveTo(obj.center[0] + obj.radiusX, obj.center[1]);
		ctx.lineTo(obj.center[0] + obj.radiusX, obj.center[1] + obj.height);

		ctx.moveTo(obj.center[0] - obj.radiusX, obj.center[1]);
		ctx.lineTo(obj.center[0] - obj.radiusX, obj.center[1] + obj.height);

		ctx.moveTo(obj.center[0] + obj.radiusX, obj.center[1] + obj.height);
		ctx.ellipse(obj.center[0], obj.center[1] + obj.height, obj.radiusX, obj.radiusY, 0, 0, Math.PI);
		ctx.stroke();

		if (!un(path) && path.selected === true) {
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#F00';
			
			ctx.beginPath();
			ctx.lineTo(obj.center[0]+obj.radiusX, obj.center[1]);
			ctx.lineTo(obj.center[0], obj.center[1]);
			ctx.lineTo(obj.center[0], obj.center[1]+obj.radiusY);
			ctx.moveTo(obj.center[0], obj.center[1]);
			ctx.lineTo(obj.center[0], obj.center[1]+obj.height);
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(obj.center[0], obj.center[1], 8, 0, 2*Math.PI);
			ctx.fillStyle = '#000';
			ctx.fill();
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(obj.center[0], obj.center[1]+obj.radiusY, 8, 0, 2*Math.PI);
			ctx.fillStyle = '#00F';
			ctx.fill();
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(obj.center[0]+obj.radiusX, obj.center[1], 8, 0, 2*Math.PI);
			ctx.fillStyle = '#00F';
			ctx.fill();
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(obj.center[0], obj.center[1]+obj.height, 8, 0, 2*Math.PI);
			ctx.fillStyle = '#00F';
			ctx.fill();
			ctx.stroke();
		}

		ctx.restore();
	},
	getRect: function (obj) {
		return [obj.center[0] - obj.radiusX, obj.center[1] - obj.radiusY, 2 * obj.radiusX, obj.height + 2 * obj.radiusY];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl + 0.5 * dw;
		obj.center[1] += dt;
		obj.radiusX += 0.5 * dw;
		obj.height += dh;
	},
	drawButton: function (ctx, size) {
		draw.cylinder.draw(ctx, {
			center: [0.5 * size, 0.25 * size],
			radiusX: 0.25 * size,
			radiusY: 0.1 * size,
			height: 0.45 * size,
			color: '#000',
			thickness: size * 0.02,
			dash:[5,5]
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
			obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		}
		if (!un(obj.height)) obj.height *= sf;
		if (!un(obj.thickness)) obj.thickness *= sf;
	},
	getSnapPos: function(obj) {
		var pos = [];
		pos.push({type:'point', pos:[obj.center[0],obj.center[1]]});
		pos.push({type:'point', pos:[obj.center[0]-obj.radiusX,obj.center[1]]});
		pos.push({type:'point', pos:[obj.center[0]+obj.radiusX,obj.center[1]]});
		pos.push({type:'point', pos:[obj.center[0],obj.center[1]-obj.radiusY]});
		pos.push({type:'point', pos:[obj.center[0],obj.center[1]+obj.radiusY]});
		
		var pos2 = [obj.center[0], obj.center[1]+obj.height];
		pos.push({type:'point', pos:[pos2[0],pos2[1]]});
		pos.push({type:'point', pos:[pos2[0]-obj.radiusX,pos2[1]]});
		pos.push({type:'point', pos:[pos2[0]+obj.radiusX,pos2[1]]});
		pos.push({type:'point', pos:[pos2[0],pos2[1]-obj.radiusY]});
		pos.push({type:'point', pos:[pos2[0],pos2[1]+obj.radiusY]});
		
		pos.push({type:'line', pos1:[obj.center[0]-obj.radiusX,obj.center[1]], pos2:[obj.center[0]-obj.radiusX,obj.center[1]+obj.height]});
		pos.push({type:'line', pos1:[obj.center[0]+obj.radiusX,obj.center[1]], pos2:[obj.center[0]+obj.radiusX,obj.center[1]+obj.height]});
		
		console.log(pos);
		
		return pos;
	},
	getCursorPositionsSelected: function(obj, pathNum) {
		var pos = [];
		pos.push({
			shape: 'circle',
			dims: [obj.center[0], obj.center[1]+obj.radiusY, 8],
			cursor: draw.cursors.pointer,
			func: draw.cylinder.changeRadiusYStart,
			obj:obj
		});
		pos.push({
			shape: 'circle',
			dims: [obj.center[0]+obj.radiusX, obj.center[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.cylinder.changeRadiusXStart,
			obj:obj
		});
		pos.push({
			shape: 'circle',
			dims: [obj.center[0], obj.center[1]+obj.height, 8],
			cursor: draw.cursors.pointer,
			func: draw.cylinder.changeHeightStart,
			obj:obj
		});
		return pos;
	},
	changeRadiusXStart: function() {
		var obj = draw.currCursor.obj;
		draw._drag = {
			obj: obj,
			offset: obj.center[0]+obj.radiusX-draw.mouse[0]
		};
		draw.animate(draw.cylinder.changeRadiusXMove,draw.cylinder.changeRadiusXStop);
	},
	changeRadiusXMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var offset = draw._drag.offset;
		obj.radiusX = Math.max(0,draw.mouse[0]+offset-obj.center[0]);
	},
	changeRadiusXStop: function() {
		delete draw._drag;
	},
	changeRadiusYStart: function() {
		var obj = draw.currCursor.obj;
		draw._drag = {
			obj: obj,
			offset: obj.center[1]+obj.radiusY-draw.mouse[1]
		};
		draw.animate(draw.cylinder.changeRadiusYMove,draw.cylinder.changeRadiusYStop);
	},
	changeRadiusYMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var offset = draw._drag.offset;
		obj.radiusY = Math.max(0, draw.mouse[1]+offset-obj.center[1]);
	},
	changeRadiusYStop: function() {
		delete draw._drag;
	},
	changeHeightStart: function() {
		var obj = draw.currCursor.obj;
		draw._drag = {
			obj: obj,
			offset: obj.center[1]+obj.height-draw.mouse[1]
		};
		draw.animate(draw.cylinder.changeHeightMove,draw.cylinder.changeHeightStop);
	},
	changeHeightMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var offset = draw._drag.offset;
		obj.height = Math.max(0, draw.mouse[1]+offset-obj.center[1]);
	},
	changeHeightStop: function() {
		delete draw._drag;
	}
}
draw.cylinder2 = {
	resizable: true,
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'cylinder2',
					pos: [center[0],center[1]],
					radius: 50,
					vector: [120, -80],
					color: '#000',
					thickness: 3,
					fillColor:'#CCF',
					fillColor2:'#99F',
					opacity:1
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++) updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (obj.radius <= 0) return;
		ctx.save();
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};

		var pos1 = obj.pos;
		var pos2 = vector.addVectors(pos1,obj.vector);
		var angleOffset = Math.atan(obj.vector[1]/obj.vector[0]);
		var a1 = 1.5 * Math.PI + angleOffset;
		var a2 = 0.5 * Math.PI + angleOffset;
		if (obj.vector[0] < 0) {
			var a1 = 0.5 * Math.PI + angleOffset;
			var a2 = 1.5 * Math.PI + angleOffset;
		}
		var p1 = [pos1[0] + obj.radius * Math.cos(a1), pos1[1] + obj.radius * Math.sin(a1)];
		var p2 = [pos1[0] + obj.radius * Math.cos(a2), pos1[1] + obj.radius * Math.sin(a2)];
		var p3 = [pos2[0] + obj.radius * Math.cos(a1), pos2[1] + obj.radius * Math.sin(a1)];
		var p4 = [pos2[0] + obj.radius * Math.cos(a2), pos2[1] + obj.radius * Math.sin(a2)];
		obj._a1 = a1;
		obj._a2 = a2;
		obj._p1 = p1;
		obj._p2 = p2;
		obj._p3 = p3;
		obj._p4 = p4;
		
		var dash = !un(obj.dash) ? obj.dash : [10, 10];
		ctx.setLineDash(dash);
		ctx.strokeStyle = colorA(obj.color,0.4);
		ctx.beginPath();
		ctx.moveTo(p1[0], p1[1]);
		ctx.ellipse(pos2[0], pos2[1], obj.radius, obj.radius, 0, a1, a2, true);
		ctx.stroke();
		
		if (!un(obj.fillColor)) {
			var p5 = p1[1] > p2[1] ? p2 : p1;
			var p6 = p1[1] > p2[1] ? p1 : p2;
			var gradient = ctx.createLinearGradient(p5[0],p5[1],p6[0],p6[1]);
			var opacity = !un(obj.opacity) ? obj.opacity : 1;
			if (!un(obj.fillColor2)) {
				var c1 = colorA(obj.fillColor,opacity);
				var c2 = colorA(obj.fillColor2,opacity);
			} else {
				var c1 = colorA(obj.fillColor,0.5);
				var c2 = colorA(obj.fillColor2,0.8);
			}
			gradient.addColorStop(0, c1);
			gradient.addColorStop(1, c2);
			ctx.beginPath();
			ctx.moveTo(p4[0],p4[1]);
			ctx.ellipse(pos2[0], pos2[1], obj.radius, obj.radius, 0, a2, a1, true);
			ctx.lineTo(p1[0], p1[1]);
			ctx.ellipse(pos1[0], pos1[1], obj.radius, obj.radius, 0, a1, a2, false);
			ctx.lineTo(p4[0], p4[1]);
			ctx.fillStyle = gradient;
			ctx.fill();
		}

		ctx.setLineDash([]);
		ctx.strokeStyle = obj.color;
		ctx.beginPath();
		ctx.moveTo(p4[0],p4[1]);
		ctx.ellipse(pos2[0], pos2[1], obj.radius, obj.radius, 0, a2, a1, true);
		ctx.lineTo(p1[0], p1[1]);
		ctx.ellipse(pos1[0], pos1[1], obj.radius, obj.radius, 0, a1, a2, false);
		ctx.lineTo(p4[0], p4[1]);
		ctx.stroke();
		
		if (!un(obj.fillColor)) {
			ctx.beginPath();
			ctx.moveTo(pos1[0] + obj.radius, pos1[1]);
			ctx.ellipse(pos1[0], pos1[1], obj.radius, obj.radius, 0, 0*Math.PI, 2*Math.PI);
			ctx.fill();
		}
		ctx.beginPath();
		ctx.moveTo(pos1[0] + obj.radius, pos1[1]);
		ctx.ellipse(pos1[0], pos1[1], obj.radius, obj.radius, 0, 0*Math.PI, 2*Math.PI);
		ctx.stroke();

		if (!un(path) && path.selected === true) {
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#F00';
			
			ctx.beginPath();
			ctx.moveTo(obj.pos[0]+obj.vector[0], obj.pos[1]+obj.vector[1]);
			ctx.lineTo(obj.pos[0],obj.pos[1]);
			ctx.lineTo(obj.pos[0]+obj.radius, obj.pos[1]);
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(obj.pos[0]+obj.vector[0], obj.pos[1]+obj.vector[1], 8, 0, 2*Math.PI);
			ctx.fillStyle = '#F00';
			ctx.fill();
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(obj.pos[0], obj.pos[1], 8, 0, 2*Math.PI);
			ctx.fillStyle = '#000';
			ctx.fill();
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(obj.pos[0]+obj.radius, obj.pos[1], 8, 0, 2*Math.PI);
			ctx.fillStyle = '#00F';
			ctx.fill();
			ctx.stroke();
		}

		ctx.restore();
	},
	getRect: function (obj) {
		var xmin = Math.min(obj.pos[0]-obj.radius, obj.pos[0]+obj.vector[0]-obj.radius);
		var xmax = Math.max(obj.pos[0]+obj.radius, obj.pos[0]+obj.vector[0]+obj.radius);
		var ymin = Math.min(obj.pos[1]-obj.radius, obj.pos[1]+obj.vector[1]-obj.radius);
		var ymax = Math.max(obj.pos[1]+obj.radius, obj.pos[1]+obj.vector[1]+obj.radius);		
		return [xmin,ymin,xmax-xmin,ymax-ymin];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.pos[0] += dl;
		obj.pos[1] += dt;
		obj.radius += dw;
	},
	getSnapPos: function(obj) {
		var pos = [];
		pos.push({type:'point', pos:[obj.pos[0],obj.pos[1]]});
		pos.push({type:'point', pos:[obj.pos[0]-obj.radius,obj.pos[1]]});
		pos.push({type:'point', pos:[obj.pos[0]+obj.radius,obj.pos[1]]});
		pos.push({type:'point', pos:[obj.pos[0],obj.pos[1]-obj.radius]});
		pos.push({type:'point', pos:[obj.pos[0],obj.pos[1]+obj.radius]});
		
		var pos2 = vector.addVectors(obj.pos,obj.vector);
		pos.push({type:'point', pos:[pos2[0],pos2[1]]});
		pos.push({type:'point', pos:[pos2[0]-obj.radius,pos2[1]]});
		pos.push({type:'point', pos:[pos2[0]+obj.radius,pos2[1]]});
		pos.push({type:'point', pos:[pos2[0],pos2[1]-obj.radius]});
		pos.push({type:'point', pos:[pos2[0],pos2[1]+obj.radius]});
		
		pos.push({type:'line', pos1:obj._p1, pos2:obj._p3});
		pos.push({type:'line', pos1:obj._p2, pos2:obj._p4});
		
		pos.push({type:'circle', center:obj.pos, radius:obj.radius});
		pos.push({type:'circle', center:pos2, radius:obj.radius});
		
		return pos;
	},
	drawButton: function (ctx, size) {

	},
	scale: function (obj, sf, center) {
		
	},
	getCursorPositionsSelected: function(obj, pathNum) {
		var pos = [];
		pos.push({
			shape: 'circle',
			dims: [obj.pos[0]+obj.vector[0], obj.pos[1]+obj.vector[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.cylinder2.moveVectorStart,
			obj:obj
		});
		pos.push({
			shape: 'circle',
			dims: [obj.pos[0]+obj.radius, obj.pos[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.cylinder2.changeRadiusStart,
			obj:obj
		});
		return pos;
	},
	moveVectorStart: function() {
		var obj = draw.currCursor.obj;
		draw._drag = {
			obj: obj,
			offset: [obj.pos[0]+obj.vector[0]-draw.mouse[0],obj.pos[1]+obj.vector[1]-draw.mouse[1]]
		};
		draw.animate(draw.cylinder2.moveVectorMove,draw.cylinder2.moveVectorStop);
	},
	moveVectorMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var offset = draw._drag.offset;
		obj.vector = [draw.mouse[0]+offset[0]-obj.pos[0],draw.mouse[1]+offset[1]-obj.pos[1]];
	},
	moveVectorStop: function() {
		delete draw._drag;
	},
	changeRadiusStart: function() {
		var obj = draw.currCursor.obj;
		draw._drag = {
			obj: obj,
			offset: obj.pos[0]+obj.radius-draw.mouse[0]
		};
		draw.animate(draw.cylinder2.changeRadiusMove,draw.cylinder2.changeRadiusStop);
	},
	changeRadiusMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var offset = draw._drag.offset;
		obj.radius = draw.mouse[0]+offset-obj.pos[0];
	},
	changeRadiusStop: function() {
		delete draw._drag;
	}
}
draw.cone = {
	resizable: true,
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'cone',
					center: center,
					radiusX: 100,
					radiusY: 33,
					height: 200,
					color: draw.color,
					thickness: draw.thickness
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++)
			updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (obj.radiusX <= 0 || obj.radiusY <= 0)
			return;
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function')
			ctx.setLineDash = function () {};

		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.ellipse(obj.center[0], obj.center[1] + obj.height, obj.radiusX, obj.radiusY, 0, Math.PI, 2 * Math.PI);
		ctx.stroke();

		var dash = !un(obj.dash) ? obj.dash : [];
		ctx.setLineDash(dash);

		ctx.beginPath();
		ctx.moveTo(obj.center[0], obj.center[1]);
		ctx.lineTo(obj.center[0] + obj.radiusX, obj.center[1] + obj.height);

		ctx.moveTo(obj.center[0], obj.center[1]);
		ctx.lineTo(obj.center[0] - obj.radiusX, obj.center[1] + obj.height);

		ctx.moveTo(obj.center[0] + obj.radiusX, obj.center[1] + obj.height);
		ctx.ellipse(obj.center[0], obj.center[1] + obj.height, obj.radiusX, obj.radiusY, 0, 0, Math.PI);
		ctx.stroke();

		ctx.setLineDash([]);
		ctx.restore();
	},
	getRect: function (obj) {
		return [obj.center[0] - obj.radiusX, obj.center[1], 2 * obj.radiusX, obj.height + obj.radiusY];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl + 0.5 * dw;
		obj.center[1] += dt;
		obj.radiusX += 0.5 * dw;
		var frac = obj.height / (obj.height + obj.radiusY);
		obj.height += frac * dh;
		obj.radiusY += (1 - frac) * dh;
	},
	drawButton: function (ctx, size) {
		draw.cone.draw(ctx, {
			center: [0.5 * size, 0.15 * size],
			radiusX: 0.3 * size,
			radiusY: 0.1 * size,
			height: 0.55 * size,
			color: '#000',
			thickness: size * 0.02
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
			obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		}
		if (!un(obj.radiusX))
			obj.radiusX *= sf;
		if (!un(obj.radiusY))
			obj.radiusY *= sf;
		if (!un(obj.height))
			obj.height *= sf;
		if (!un(obj.thickness))
			obj.thickness *= sf;
	}
}
draw.frustum = {
	resizable: true,
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'frustum',
					center: center,
					radiusX: 100,
					radiusY: 33,
					radiusX2: 60,
					height: 200,
					color: draw.color,
					thickness: draw.thickness
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++)
			updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (obj.radiusX <= 0 || obj.radiusY <= 0)
			return;
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function')
			ctx.setLineDash = function () {};

		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.ellipse(obj.center[0], obj.center[1] + obj.height, obj.radiusX, obj.radiusY, 0, Math.PI, 2 * Math.PI);
		ctx.stroke();

		var dash = !un(obj.dash) ? obj.dash : [];
		ctx.setLineDash(dash);

		var radiusY2 = obj.radiusY * (obj.radiusX2 / obj.radiusX);

		ctx.beginPath();
		ctx.moveTo(obj.center[0] + obj.radiusX2, obj.center[1]);
		ctx.ellipse(obj.center[0], obj.center[1], obj.radiusX2, radiusY2, 0, 0, 2 * Math.PI);

		ctx.moveTo(obj.center[0] + obj.radiusX2, obj.center[1]);
		ctx.lineTo(obj.center[0] + obj.radiusX, obj.center[1] + obj.height);

		ctx.moveTo(obj.center[0] - obj.radiusX2, obj.center[1]);
		ctx.lineTo(obj.center[0] - obj.radiusX, obj.center[1] + obj.height);

		ctx.moveTo(obj.center[0] + obj.radiusX, obj.center[1] + obj.height);
		ctx.ellipse(obj.center[0], obj.center[1] + obj.height, obj.radiusX, obj.radiusY, 0, 0, Math.PI);
		ctx.stroke();

		ctx.setLineDash([]);
		ctx.restore();
	},
	getRect: function (obj) {
		var radiusY2 = obj.radiusY * (obj.radiusX2 / obj.radiusX);
		return [obj.center[0] - obj.radiusX, obj.center[1] - radiusY2, 2 * obj.radiusX, obj.height + obj.radiusY + radiusY2];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl + 0.5 * dw;
		obj.center[1] += dt;
		obj.radiusX += 0.5 * dw;
		var radiusY2 = obj.radiusY * (obj.radiusX2 / obj.radiusX);
		var totalHeight = obj.height + obj.radiusY + radiusY2;
		obj.height += (obj.height / totalHeight) * dh;
		obj.radiusY += (obj.radiusY / totalHeight) * dh;
	},
	drawButton: function (ctx, size) {
		draw.frustum.draw(ctx, {
			center: [0.5 * size, 0.3 * size],
			radiusX: 0.3 * size,
			radiusY: 0.1 * size,
			radiusX2: 0.15 * size,
			height: 0.4 * size,
			color: '#000',
			thickness: size * 0.02
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
			obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		}
		if (!un(obj.radiusX))
			obj.radiusX *= sf;
		if (!un(obj.radiusX2))
			obj.radiusX2 *= sf;
		if (!un(obj.radiusY))
			obj.radiusY *= sf;
		if (!un(obj.height))
			obj.height *= sf;
		if (!un(obj.thickness))
			obj.thickness *= sf;
	}
}
draw.isoCuboid = {
	resizable: true,
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'isoCuboid',
					center: center,
					mag1: 100,
					mag2: 100,
					mag3: 100,
					color: draw.color,
					thickness: draw.thickness
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++)
			updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		var pos = draw.isoCuboid.getPoints(obj);

		ctx.save();

		if (!un(obj.fillColor)) {
			ctx.fillStyle = obj.fillColor;
			ctx.beginPath();
			ctx.moveTo(pos[0][0], pos[0][1]);
			ctx.moveTo(pos[1][0], pos[1][1]);
			ctx.lineTo(pos[5][0], pos[5][1]);
			ctx.lineTo(pos[7][0], pos[7][1]);
			ctx.lineTo(pos[6][0], pos[6][1]);
			ctx.lineTo(pos[2][0], pos[2][1]);
			ctx.lineTo(pos[0][0], pos[0][1]);
			ctx.fill();
		}

		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;

		ctx.beginPath();
		ctx.moveTo(pos[0][0], pos[0][1]);
		ctx.lineTo(pos[1][0], pos[1][1]);
		ctx.lineTo(pos[5][0], pos[5][1]);

		ctx.moveTo(pos[0][0], pos[0][1]);
		ctx.lineTo(pos[2][0], pos[2][1]);
		ctx.lineTo(pos[6][0], pos[6][1]);

		ctx.moveTo(pos[0][0], pos[0][1]);
		ctx.lineTo(pos[4][0], pos[4][1]);
		ctx.lineTo(pos[5][0], pos[5][1]);
		ctx.lineTo(pos[7][0], pos[7][1]);
		ctx.lineTo(pos[6][0], pos[6][1]);
		ctx.lineTo(pos[4][0], pos[4][1]);

		ctx.stroke();
	},
	getPoints: function (obj) {
		var baseVector = [[obj.mag1 * (Math.sqrt(3) / 2), -obj.mag1 * (1 / 2)], [-obj.mag2 * (Math.sqrt(3) / 2), -obj.mag2 * (1 / 2)], [0, -obj.mag3]];
		var pos = [obj.center];
		pos.push(pointAddVector(obj.center, baseVector[0]));
		pos.push(pointAddVector(obj.center, baseVector[1]));
		pos.push(pointAddVector(pos[1], baseVector[1]));
		for (var i = 0; i < 4; i++)
			pos.push(pointAddVector(pos[i], baseVector[2]));
		return pos;
	},
	getRect: function (obj) {
		var pos = draw.isoCuboid.getPoints(obj);
		return [pos[2][0], pos[7][1], pos[1][0] - pos[2][0], pos[0][1] - pos[7][1]];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt + dh;
		obj.mag1 += dw / (Math.sqrt(3) / 2);
		obj.mag2 += dw / (Math.sqrt(3) / 2);
		obj.mag3 += dh;
	},
	getSnapPos: function (obj) {
		var pos = draw.isoCuboid.getPoints(obj);
		var pos2 = [];
		for (var p = 0; p < pos.length; p++) {
			pos2[p] = {
				type: 'point',
				pos: pos[p]
			};
		}
		return pos2;
	},
	drawButton: function (ctx, size) {
		draw.isoCuboid.draw(ctx, {
			center: [0.5 * size, 0.82 * size],
			mag1: 0.33 * size,
			mag2: 0.33 * size,
			mag3: 0.33 * size,
			color: '#000',
			thickness: size * 0.02
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
			obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		}
		if (!un(obj.mag1))
			obj.mag1 *= sf;
		if (!un(obj.mag2))
			obj.mag2 *= sf;
		if (!un(obj.mag3))
			obj.mag3 *= sf;
		if (!un(obj.thickness))
			obj.thickness *= sf;
	}
};
draw.cuboid = {
	resizable: true,
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'cuboid',
					center: center,
					vectors: [[-100,-75],[0,-100],[200,-100]],
					color: '#000',
					thickness: 4,
					fillType: 'simple', // simple, shaded, directional
					fillColor: '#CCF',
					opacity:1,
					backEdgeColor: '#999',
					backEdgeWidth: 2,
					backEdgeDash: [5,5]
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++) updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		var pos = draw.cuboid.getPoints(obj);

		if (!un(obj.backEdgeColor) && obj.backEdgeColor !== 'none') {
			ctx.strokeStyle = obj.backEdgeColor;
			ctx.lineWidth = !un(obj.backEdgeWidth) ? obj.backEdgeWidth : obj.thickness;
			if (obj.backEdgeDash instanceof Array && obj.backEdgeDash[0] !== 0 && obj.backEdgeDash[1] !== 0) ctx.setLineDash(obj.backEdgeDash);
			ctx.beginPath();
			ctx.moveTo(pos[1][0], pos[1][1]);
			ctx.lineTo(pos[5][0], pos[5][1]);
			ctx.lineTo(pos[4][0], pos[4][1]);
			ctx.moveTo(pos[7][0], pos[5][1]);
			ctx.lineTo(pos[5][0], pos[7][1]);
			ctx.stroke();
		}
		if (obj.fillType === 'simple' && !un(!un(obj.fillColor))) {
			var opacity = !un(obj.opacity) ? obj.opacity : 1;
			ctx.fillStyle = colorA(obj.fillColor,opacity);
			ctx.beginPath();
			ctx.moveTo(pos[0][0], pos[0][1]);
			ctx.lineTo(pos[1][0], pos[1][1]);
			ctx.lineTo(pos[3][0], pos[3][1]);
			ctx.lineTo(pos[7][0], pos[7][1]);
			ctx.lineTo(pos[6][0], pos[6][1]);
			ctx.lineTo(pos[4][0], pos[4][1]);
			ctx.lineTo(pos[0][0], pos[0][1]);
			ctx.fill();
		} else if (obj.fillType === 'shaded') {
			
		} else if (obj.fillType === 'directional') {
			
		}
		
		if (obj.color !== 'none') {
			ctx.strokeStyle = obj.color;
			ctx.lineWidth = obj.thickness;
			ctx.setLineDash([]);

			ctx.beginPath();
			ctx.moveTo(pos[0][0], pos[0][1]);
			ctx.lineTo(pos[2][0], pos[2][1]);
			ctx.lineTo(pos[3][0], pos[3][1]);

			ctx.moveTo(pos[2][0], pos[2][1]);
			ctx.lineTo(pos[6][0], pos[6][1]);

			ctx.moveTo(pos[0][0], pos[0][1]);
			ctx.lineTo(pos[4][0], pos[4][1]);
			ctx.lineTo(pos[6][0], pos[6][1]);
			ctx.lineTo(pos[7][0], pos[7][1]);
			ctx.lineTo(pos[3][0], pos[3][1]);
			ctx.lineTo(pos[1][0], pos[1][1]);
			ctx.lineTo(pos[0][0], pos[0][1]);
			ctx.stroke();
		}
		
		if (!un(path) && draw.mode === 'edit' && path.selected == true && path.obj.length == 1) {
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			ctx.fillStyle = '#F00';
			ctx.beginPath();
			ctx.moveTo(pos[1][0], pos[1][1]);
			ctx.arc(pos[1][0], pos[1][1], 8, 0, 2 * Math.PI);
			ctx.moveTo(pos[2][0], pos[2][1]);
			ctx.arc(pos[2][0], pos[2][1], 8, 0, 2 * Math.PI);
			ctx.moveTo(pos[4][0], pos[4][1]);
			ctx.arc(pos[4][0], pos[4][1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		}
	},

	getPoints: function (obj) {
		var pos = [obj.center];
		pos.push(pointAddVector(obj.center, obj.vectors[0]));
		pos.push(pointAddVector(obj.center, obj.vectors[1]));
		pos.push(pointAddVector(pos[1], obj.vectors[1]));
		for (var i = 0; i < 4; i++) pos.push(pointAddVector(pos[i], obj.vectors[2]));
		return pos;
	},
	getRect: function (obj) {
		var pos = draw.cuboid.getPoints(obj);
		return [pos[1][0], pos[7][1], pos[4][0] - pos[1][0], pos[0][1] - pos[7][1]];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		var rect = draw.cuboid.getRect(obj);
		var xsf = 1+dw/rect[2];
		var ysf = 1+dh/rect[3];
		for (var v = 0; v < 3; v++) {
			obj.vectors[v][0] *= xsf;
			obj.vectors[v][1] *= ysf;
		}
	},

	setLineWidth: function (obj, lineWidth) {
		obj.thickness = lineWidth;
		obj.backEdgeWidth = lineWidth/2;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
		obj.backEdgeColor = getShades(color,9);
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.thickness;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},

	getSnapPos: function (obj) {
		var pos = draw.cuboid.getPoints(obj);
		var pos2 = [];
		for (var p = 0; p < pos.length; p++) {
			pos2[p] = {
				type: 'point',
				pos: pos[p]
			};
		}
		return pos2;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = draw.cuboid.getPoints(obj);
		
		return [{
				shape: 'circle',
				dims: [pos[1][0], pos[1][1], 10],
				cursor: draw.cursors.pointer,
				func: draw.cuboid.startPosDrag,
				obj: obj,
				vector: 0,
				pathNum: pathNum
			}, {
				shape: 'circle',
				dims: [pos[2][0], pos[2][1], 10],
				cursor: draw.cursors.pointer,
				func: draw.cuboid.startPosDrag,
				obj: obj,
				vector: 1,
				pathNum: pathNum
			}, {
				shape: 'circle',
				dims: [pos[4][0], pos[4][1], 10],
				cursor: draw.cursors.pointer,
				func: draw.cuboid.startPosDrag,
				obj: obj,
				vector: 2,
				pathNum: pathNum
			}
		];
	},
	startPosDrag: function () {
		changeDrawMode('cuboidPosDrag');
		draw._drag = draw.currCursor;
		draw.animate(draw.cuboid.posMove,draw.cuboid.posStop,drawCanvasPaths);
	},
	posMove: function (e) {
		updateMouse(e);
		var rel = [draw.mouse[0] - draw._drag.obj.center[0], draw.mouse[1] - draw._drag.obj.center[1]];
		var obj = draw._drag.obj;
		if (draw._drag.vector === 0) {
			obj.vectors[0] = [Math.min(0,rel[0]),Math.min(0,rel[1])];
		} else if (draw._drag.vector === 1) {
			obj.vectors[1] = [0,Math.min(0,rel[1])];
		} else if (draw._drag.vector === 2) {
			obj.vectors[2] = [Math.max(0,rel[0]),Math.min(0,rel[1])];
		}
		updateBorder(draw.path[draw._drag.pathNum]);
	},
	posStop: function (e) {
		changeDrawMode();
		delete draw._drag;
	},
	
	drawButton: function (ctx, size) {
		draw.cuboid.draw(ctx, {
			center: [0.45 * size, 0.8 * size],
			vectors: [[-0.2*size,-0.12*size],[0,-0.2*size],[0.3*size,-0.2*size]],
			color: '#000',
			thickness: size * 0.02
		});
	},
	scale: function (obj, sf, center) {
		for (var v = 0; v < 3; v++) {
			obj.vectors[v][0] *= sf;
			obj.vectors[v][1] *= sf;
		}
		console.log(obj);
	}

};
draw.editableText = {
	draw:function(ctx,obj,path) {	
		obj.text = simplifyText(obj.text);
		var obj2 = clone(obj);
		obj2.ctx = ctx;
		var measure = text(obj2);
		obj._measure = measure;
		obj._tightRect = measure.tightRect;
		obj2._tightRect = measure.tightRect;
		delete obj.tightRect;
		delete obj2.tightRect;
		if (obj2.textEdit === true) {
			textEdit.cursorMap = textEdit.mapTextLocs(obj2, measure.textLoc, measure.softBreaks, measure.hardBreaks);
			textEdit.tightRect = measure.tightRect;
			textEdit.textLoc = measure.textLoc;
			textEdit.lineRects = measure.lineRects;
			delete textEdit.allMap;
			textEdit.blinkReset();
			if (!un(textEdit.menu)) textEdit.menu.update();
		}
		obj._cursorPos = [{shape:'rect',dims:obj.rect,cursor:draw.cursors.text,func:draw.editableText.textEditStart,textObj:obj}];
	},
	textEditStart:function() {
		var textObj = draw.currCursor.textObj;
		textObj.textEdit = true;
		var measure = textObj._measure;
		textEdit.cursorMap = textEdit.mapTextLocs(textObj, measure.textLoc, measure.softBreaks, measure.hardBreaks);
		textEdit.tightRect = measure.tightRect;
		textEdit.textLoc = measure.textLoc;
		textEdit.lineRects = measure.lineRects;
		delete textEdit.allMap;
		textEdit.start(-1,textObj);
	}
};
draw.grid = {
	resizable: true,
	interactKeys:[{
		key:'startMode',
		value:'none',
		options:['none','move','plot','line','lineSegment']
	},{
		key:'controlsStyle',
		value:'none',
		options:['none','full','buttons']
	},{
		key:'max',
		value:1
	},{
		key:'snapTo',
		value:'minor'
	},{
		key:'showLinePoints',
		value:false,
	},{
		key:'color',
		value:'#00F'
	},{
		key:'lineWidth',
		value:5
	},{
		key:'plotStyle',
		value:'cross',
		options:['cross','circle']
	},{
		key:'plotSize',
		value:6
	}],
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'grid',
			left: center[0]-200,
			top: center[1]-200,
			width: 400,
			height: 400,
			xMin: -10,
			xMax: 10,
			yMin: -10,
			yMax: 10,
			xMajorStep: 5,
			xMinorStep: 1,
			yMajorStep: 5,
			yMinorStep: 1,
			xZero: 250,
			yZero: 350
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		//console.log(sel());
	},
	draw: function (ctx, obj, path, backColor, backColorFill) {
		var obj2 = clone(obj);
		obj2.showGrid = boolean(obj.showGrid, true);
		obj2.showScales = boolean(obj.showScales, true);
		obj2.showLabels = boolean(obj.showLabels, true);

		obj2.backColor = mainCanvasFillStyle;
		//obj2.backColor = draw.getColorAtPixel(obj.left + obj.width / 2, obj.top + obj.height / 2);

		if (un(obj2.sf)) obj2.sf = 1;
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		/*if (typeof backColor == 'undefined') backColor = mainCanvasFillStyle;
		if (boolean(backColorFill,true) == true) {
		ctx.fillStyle = backColor;
		ctx.fillRect(obj.left*sf,obj.top*sf,obj.width*sf,obj.height*sf);
		}*/

		drawGrid3(ctx, 0, 0, obj2);

		if (typeof obj2.points == 'object') {
			for (var p = 0; p < obj2.points.length; p++) {
				drawCoord(ctx, 0, 0, obj2, obj.points[p][0], obj.points[p][1], getShades(mainCanvasFillStyle, true)[12]);
			}
		}
		if (typeof obj2.lineSegments == 'object') {
			var showPoints = false;
			for (var p = 0; p < obj2.lineSegments.length; p++) {
				if (typeof obj2.lineSegments[p][1] !== 'undefined' && obj2.lineSegments[p][1].length == 2) {
					if (obj2.drawing == 'lineSegment' && p == obj2.lineSegments.length - 1)
						showPoints = true;
					//drawLine(ctx,0,0,obj2,obj2.lineSegments[p][0][0],obj2.lineSegments[p][0][1],obj2.lineSegments[p][1][0],obj2.lineSegments[p][1][1],getShades(mainCanvasFillStyle,true)[12],2,showPoints,true);
					drawLine(ctx, 0, 0, obj2, obj2.lineSegments[p][0][0], obj2.lineSegments[p][0][1], obj2.lineSegments[p][1][0], obj2.lineSegments[p][1][1], '#00F', 2, showPoints, true);
				}
			}
		}
		if (typeof obj2.lines == 'object') {
			var showPoints = false;
			for (var p = 0; p < obj2.lines.length; p++) {
				if (typeof obj2.lines[p][1] !== 'undefined' && obj2.lines[p][1].length == 2) {
					if (obj2.drawing == 'line' && p == obj2.lines.length - 1)
						showPoints = true;
					//drawLine(ctx,0,0,obj2,obj2.lines[p][0][0],obj2.lines[p][0][1],obj2.lines[p][1][0],obj2.lines[p][1][1],getShades(mainCanvasFillStyle,true)[12],2,showPoints,false);
					drawLine(ctx, 0, 0, obj2, obj2.lines[p][0][0], obj2.lines[p][0][1], obj2.lines[p][1][0], obj2.lines[p][1][1], '#00F', 2, showPoints, false);
				}
			}
		}
		if (typeof obj2.funcs == 'object') {
			for (var f = 0; f < obj2.funcs.length; f++) {
				obj2.funcs[f].funcPoints = calcFunc(obj2, obj2.funcs[f].funcString);
				drawFunc(ctx, 0, 0, obj, obj2.funcs[f].funcPoints);
			}
		}

		if (obj2.path instanceof Array) {
			var ctx2 = ctx;		
			var recalc = false;
			if (un(obj2._gridValuesForPathCalcs) ||
				obj2._gridValuesForPathCalcs.xMin !== obj2.xMin ||
				obj2._gridValuesForPathCalcs.xMax !== obj2.xMax ||
				obj2._gridValuesForPathCalcs.yMin !== obj2.yMin ||
				obj2._gridValuesForPathCalcs.yMax !== obj2.yMax ||
				obj2._gridValuesForPathCalcs.left !== obj2.left ||
				obj2._gridValuesForPathCalcs.top !== obj2.top ||
				obj2._gridValuesForPathCalcs.width !== obj2.width ||
				obj2._gridValuesForPathCalcs.height !== obj2.height
			) {
				obj2._gridValuesForPathCalcs = {xMin:obj2.xMin,xMax:obj2.xMax,yMin:obj2.yMin,yMax:obj2.yMax,left:obj2.left,top:obj2.top,width:obj2.width,height:obj2.height};
				recalc = true;
			}
			for (var p = 0; p < obj2.path.length; p++) {
				var obj3 = obj2.path[p];
				if (boolean(obj3.visible, true) == false) continue;
				if (boolean(obj3.valid, true) == false) continue;
				if (obj3.color === 'none') continue;
				//var drawOnSeparateCanvas = obj3.type !== 'point' && obj3.type !== 'label';
				var drawOnSeparateCanvas = obj3.type !== 'label';
				if (typeof ctx.canvas === 'object' && un(ctx.canvas.tagName)) drawOnSeparateCanvas = false; // drawing to pdf
				var drawOnSeparateCanvasPadding = 0;
				if (drawOnSeparateCanvas === true) {
					if (un(obj._canvas)) {
						obj._canvas = document.createElement('canvas');
						obj._canvas.width = 1200;
						obj._canvas.height = 1700;
						obj._ctx = obj._canvas.getContext('2d');
					}
					ctx = obj._ctx;
					ctx.clearRect(0,0,1200,1700);
				} else {
					ctx = ctx2;
				}
				switch (obj3.type) {
					case 'point':
						obj3._canvasPos = getPosOfCoord(obj3.pos, obj2);
						if (drawOnSeparateCanvas !== true && (obj3._canvasPos[0] < obj2.left || obj3._canvasPos[0] > obj2.left+obj2.width || obj3._canvasPos[1] < obj2.top || obj3._canvasPos[1] > obj2.top+obj2.height)) continue;
						ctx.save();
						ctx.beginPath();
						var style = obj3.style || 'circle';
						var color = obj3.color || '#00F';
						if (style == 'circle') {
							var radius = !un(obj3.radius) ? obj3.radius : obj3._selected ? 10 : 6;
							ctx.fillStyle = color;
							ctx.arc(obj3._canvasPos[0], obj3._canvasPos[1], radius, 0, 2 * Math.PI);
							ctx.fill();
						} else if (style == 'cross') {
							ctx.strokeStyle = color;
							ctx.lineWidth = !un(obj3.lineWidth) ? obj3.lineWidth : obj3._selected ? 6 : 3;
							var size = !un(obj3.radius) ? obj3.radius * (5/6) : 5;
							var x = obj3._canvasPos[0];
							var y = obj3._canvasPos[1];
							ctx.moveTo(x-size,y-size);
							ctx.lineTo(x+size,y+size);
							ctx.moveTo(x-size,y+size);
							ctx.lineTo(x+size,y-size);
							ctx.stroke();
						}
						ctx.restore();
						drawOnSeparateCanvasPadding = 10;
						break;
					case 'label':						
						var pos = getPosOfCoord(obj3.pos, obj2);
						var width = !un(obj3.width) ? obj3.width : 400;
						var height = !un(obj3.height) ? obj3.height : 400;
						obj3.rect = [pos[0] - width/2, pos[1] - height/2, width, height];
						if (un(obj3.align)) obj3.align = [0, 0];
						if (!un(obj3.offset)) {
							obj3.rect[0] += obj3.offset[0];
							obj3.rect[1] += obj3.offset[1];
						}
						obj3.ctx = draw.hiddenCanvas.ctx;
						obj3.measureOnly = true;
						obj3._tightRect = text(obj3).tightRect;
						delete obj3.ctx;
						delete obj3.measureOnly;
						if (obj3.labelForPos instanceof Array) {
							if (obj2.xMin <= obj3.labelForPos[0] && obj3.labelForPos[0] <= obj2.xMax && obj2.yMin <= obj3.labelForPos[1] && obj3.labelForPos[1] <= obj2.yMax) {
								draw.text2.draw(ctx, obj3);
							}
						} else {
							var padding = 25;
							var gl = obj2.left-padding;
							var gt = obj2.top-padding;
							var gr = obj2.left+obj2.width+padding;
							var gb = obj2.top+obj2.height+padding;
							var l = obj3._tightRect[0];
							var t = obj3._tightRect[1];
							var r = obj3._tightRect[0]+obj3._tightRect[2];
							var b = obj3._tightRect[1]+obj3._tightRect[3];
							//console.log(obj3,[gl,gt,gr,gb],[l,t,r,b],(((l > gl && l < gr) || (r > gl && r < gl)) && ((t > gt && t < gb) || (b > gt && b < gb))), l > gl && l < gr,r > gl && r < gl,t > gt && t < gb,b > gt && b < gb);
							if (((l > gl && l < gr) || (r > gl && r < gl)) && ((t > gt && t < gb) || (b > gt && b < gb))) {
								draw.text2.draw(ctx, obj3);
							}
						}
						break;
					case 'line':
						if (obj3.pos[0][0] !== obj3.pos[1][0] || obj3.pos[0][1] !== obj3.pos[1][1]) {
							var lineWidth = !un(obj3.lineWidth) ? obj3.lineWidth : obj3._selected ? 7 : 5;
							var color = obj3.color || obj3.strokeStyle || '#00F';
							var showLinePoints = !un(obj3.showLinePoints) ? obj3.showLinePoints : false;
							var dash = obj3.dash instanceof Array || typeof obj3.dash === 'number';
							var dashWidth = obj3.dash instanceof Array ? obj3.dash[0] : typeof obj3.dash === 'number' ? obj3.dash : 0;
							var dashGapWidth = obj3.dash instanceof Array ? obj3.dash[1] : typeof obj3.dash === 'number' ? obj3.dash : 0;
							drawLine(ctx, 0, 0, obj2, obj3.pos[0][0], obj3.pos[0][1], obj3.pos[1][0], obj3.pos[1][1], color, lineWidth, showLinePoints, false, dash, dashWidth, dashGapWidth);
							if ((obj3.pos[0][0] === obj3.pos[1][0] && (obj3.pos[0][0] === obj2.xMin || obj3.pos[0][0] === obj2.xMax)) ||
								(obj3.pos[0][1] === obj3.pos[1][1] && (obj3.pos[0][1] === obj2.yMin || obj3.pos[0][1] === obj2.yMax))) {
								drawOnSeparateCanvasPadding = lineWidth / 2;
							}
						}
						break;
					case 'lineSegment':
						if (obj3.pos[0][0] !== obj3.pos[1][0] || obj3.pos[0][1] !== obj3.pos[1][1]) {
							var lineWidth = !un(obj3.lineWidth) ? obj3.lineWidth : obj3._selected ? 7 : 5;
							var color = obj3.color || obj3.strokeStyle || '#00F';
							
							/*var showLinePoints = !un(obj3.showLinePoints) ? obj3.showLinePoints : false;
							drawLine(ctx, 0, 0, obj2, obj3.pos[0][0], obj3.pos[0][1], obj3.pos[1][0], obj3.pos[1][1], color, lineWidth, showLinePoints, true, true);*/
							
							var pos1 = getPosOfCoord(obj3.pos[0], obj2);
							var pos2 = getPosOfCoord(obj3.pos[1], obj2);
							ctx.beginPath();
							if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function(){};
							ctx.setLineDash([]);
							if (obj3.dash instanceof Array) ctx.setLineDash(obj3.dash);
							ctx.lineWidth = lineWidth;
							ctx.strokeStyle = color;
							ctx.moveTo(pos1[0],pos1[1]);
							ctx.lineTo(pos2[0],pos2[1]);
							ctx.setLineDash([]);
							ctx.stroke();
							
							if (obj3.showLinePoints === true) {
								ctx.lineWidth = lineWidth * 0.7;
								ctx.save();
								ctx.beginPath();
								ctx.moveTo(pos1[0] - 8, pos1[1] - 8);
								ctx.lineTo(pos1[0] + 8, pos1[1] + 8);
								ctx.moveTo(pos1[0] - 8, pos1[1] + 8);
								ctx.lineTo(pos1[0] + 8, pos1[1] - 8);			
								ctx.moveTo(pos2[0] - 8, pos2[1] - 8);
								ctx.lineTo(pos2[0] + 8, pos2[1] + 8);
								ctx.moveTo(pos2[0] - 8, pos2[1] + 8);
								ctx.lineTo(pos2[0] + 8, pos2[1] - 8);	
								ctx.stroke();
								ctx.restore();
							}
							
							if (drawOnSeparateCanvas === true && (obj3.pos[0][0] === obj3.pos[1][0] && (obj3.pos[0][0] === obj2.xMin || obj3.pos[0][0] === obj2.xMax)) || (obj3.pos[0][1] === obj3.pos[1][1] && (obj3.pos[0][1] === obj2.yMin || obj3.pos[0][1] === obj2.yMax))) drawOnSeparateCanvasPadding = lineWidth / 2;
							
							if (obj3.endStart == 'open') {
								drawArrow({
									context: ctx,
									startX: pos2[0],
									startY: pos2[1],
									finX: pos1[0],
									finY: pos1[1],
									arrowLength: obj3.endStartSize,
									color: color,
									lineWidth: lineWidth,
									arrowLineWidth: lineWidth,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}
							if (obj3.endStart == 'closed') {
								drawArrow({
									context: ctx,
									startX: pos2[0],
									startY: pos2[1],
									finX: pos1[0],
									finY: pos1[1],
									arrowLength: obj3.endStartSize,
									color: color,
									lineWidth: lineWidth,
									arrowLineWidth: lineWidth,
									fillArrow: true,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}

							if (obj3.endMid == 'dash') {
								drawDash(ctx, pos1[0], pos1[1], pos2[0], pos2[1], 8);
								drawOnSeparateCanvasPadding = 10;
							}
							if (obj3.endMid == 'dash2') {
								drawDoubleDash(ctx, pos1[0], pos1[1], pos2[0], pos2[1], 8);
								drawOnSeparateCanvasPadding = 10;
							}
							if (obj3.endMid == 'open') {
								drawParallelArrow({
									context: ctx,
									startX: pos1[0],
									startY: pos1[1],
									finX: pos2[0],
									finY: pos2[1],
									arrowLength: obj3.endMidSize,
									color: color,
									lineWidth: lineWidth,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}
							if (obj3.endMid == 'open2') {
								drawParallelArrow({
									context: ctx,
									startX: pos1[0],
									startY: pos1[1],
									finX: pos2[0],
									finY: pos2[1],
									arrowLength: obj3.endMidSize,
									color: color,
									lineWidth: lineWidth,
									numOfArrows: 2,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}

							if (obj3.endFin == 'open') {
								drawArrow({
									context: ctx,
									startX: pos1[0],
									startY: pos1[1],
									finX: pos2[0],
									finY: pos2[1],
									arrowLength: obj3.endFinSize,
									color: color,
									lineWidth: lineWidth,
									arrowLineWidth: lineWidth,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}
							if (obj3.endFin == 'closed') {
								drawArrow({
									context: ctx,
									startX: pos1[0],
									startY: pos1[1],
									finX: pos2[0],
									finY: pos2[1],
									arrowLength: obj3.endFinSize,
									color: color,
									lineWidth: lineWidth,
									arrowLineWidth: lineWidth,
									fillArrow: true,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}
		
						}
						break;
					case 'polygon':
						obj3.ctx = ctx;
						drawPolygon(obj3);
						delete obj3.ctx;
						break;
					case 'polygon2':
						obj3.ctx = ctx;
						obj3.points = [];
						for (var i = 0; i < obj3.pos.length; i++) obj3.points[i] = getPosOfCoord(obj3.pos[i], obj2);
						drawPolygon(obj3);
						delete obj3.ctx;
						delete obj3.points;
						if (drawOnSeparateCanvas === true) {
							for (var p2 = 0; p2 < obj3.pos.length; p2++) {
								var p0 = obj3.pos[p2];
								var p1 = obj3.pos[(p2+1)%obj3.pos.length];
								if ((p0[0] === p1[0] && (p0[0] === obj2.xMin || p0[0] === obj2.xMax)) || (p0[1] === p1[1] && (p0[1] === obj2.yMin || p0[1] === obj2.yMax))) {
									var lineWidth = obj3.lineWidth || 6;
									drawOnSeparateCanvasPadding = lineWidth/2;
									break;
								}
							}						
						}
						break;
					case 'function':
						if (recalc === true || un(obj3._funcPos)) {
							if (!un(obj3.func)) {
								obj3._funcPos = calcFunc2(obj2, obj3.func, 1, obj3.min, obj3.max);
							} else if (obj2.angleMode == 'rad') {
								obj3._funcPos = calcFunc2(obj2, obj3.funcRad);
							} else {
								obj3._funcPos = calcFunc2(obj2, obj3.funcDeg);
							}
						}
						var lineWidth = !un(obj3.lineWidth) ? obj3.lineWidth : obj3._selected ? 7 : 5;
						obj3.pos = drawFunc(ctx, 0, 0, obj2, obj3._funcPos, obj3.color, lineWidth);
						break;
					case 'function2':
						if (recalc === true || un(obj3._gridPos)) obj3._gridPos = calcFuncImplicitGridPos(obj2, obj3.func);
						if (recalc === true || un(obj3._canvasPos)) obj3._canvasPos = calcFuncImplicitCanvasPos(obj2, obj3._gridPos);
						var lineWidth = !un(obj3.lineWidth) ? obj3.lineWidth : obj3._selected ? 7 : 5;
						drawFuncImplicit(ctx, obj3._canvasPos, obj3.color, lineWidth);
						break;
					case 'path':
						var funcPoints = [];
						for (var i = 0; i < obj3.pos.length; i++) {
							var pos = obj3.pos[i];
							var x = pos[0];
							var y = pos[1];

							var xPos = obj2.left + obj2.width * ((x - obj2.xMin) / (obj2.xMax - obj2.xMin));
							var yPos = (obj2.top + obj2.height) - obj2.height * ((y - obj2.yMin) / (obj2.yMax - obj2.yMin));
							var thisPoint = [xPos, yPos, x, y]// AND: inDomain?, plotHighLowOk?

							if (x >= obj2.xMin && x <= obj2.xMax) {
								thisPoint.push(true);
							} else {
								thisPoint.push(false);
							}

							if (yPos < obj2.top) {
								thisPoint.push('high');
							} else {
								if (yPos > (obj2.top + obj2.height)) {
									thisPoint.push('low');
								} else {
									thisPoint.push('ok');
								}
							}
							funcPoints.push(thisPoint);
						}
						var color = obj3.color || '#00F';
						var lineWidth = obj3.lineWidth || 5;
						obj3.pos = drawFunc(ctx, 0, 0, obj2, funcPoints, color, lineWidth);
						break;
					case 'rect':
						obj3.points = [
							getPosOfCoord([obj3.rect[0], obj3.rect[1]], obj2),
							getPosOfCoord([obj3.rect[0] + obj3.rect[2], obj3.rect[1]], obj2),
							getPosOfCoord([obj3.rect[0] + obj3.rect[2], obj3.rect[1] + obj3.rect[3]], obj2),
							getPosOfCoord([obj3.rect[0], obj3.rect[1] + obj3.rect[3]], obj2)
						];
						obj3.ctx = ctx;
						drawPolygon(obj3);
						delete obj3.points;
						delete obj3.ctx;
						break;
				}
				ctx = ctx2;
				if (drawOnSeparateCanvas === true) {
					/*if (obj3.type === 'label') {
						ctx.drawImage(obj._canvas,obj2.left-20,obj2.top-20,obj2.width+40,obj2.height+40,obj2.left-20,obj2.top-20,obj2.width+40,obj2.height+40);
					} else {
						ctx.drawImage(obj._canvas,obj2.left,obj2.top,obj2.width,obj2.height,obj2.left,obj2.top,obj2.width,obj2.height);		
					}*/
					ctx.drawImage(obj._canvas,obj2.left-drawOnSeparateCanvasPadding,obj2.top-drawOnSeparateCanvasPadding,obj2.width+2*drawOnSeparateCanvasPadding,obj2.height+2*drawOnSeparateCanvasPadding,obj2.left-drawOnSeparateCanvasPadding,obj2.top-drawOnSeparateCanvasPadding,obj2.width+2*drawOnSeparateCanvasPadding,obj2.height+2*drawOnSeparateCanvasPadding);		
					
				}
			}
		}

		if (obj.type === 'grid' && draw.mode === 'edit') draw.grid.drawControls(ctx,obj,path);
	},
	drawOverlay:function(ctx, obj, path) {
		if (obj.type === 'grid' && draw.mode !== 'edit') draw.grid.drawControls(ctx,obj,path);
	},
	drawControls:function(ctx,obj,path) {
		obj._cursorPos = [];
		var controlsStyle = 'none';
		var buttons = draw.grid.interactDefaultButtons;
		if (draw.mode === 'edit' && path.selected === true) {
			controlsStyle = 'full';
		} else {
			var interact = obj.interact || path.isInput || path.interact;
			if (!un(interact) && !un(interact.controlsStyle)) {
				controlsStyle = interact.controlsStyle;
				var buttons = interact.buttons || draw.grid.interactDefaultButtons;
			} else if (!un(interact) && interact.type == 'grid') {
				controlsStyle = interact.controlsStyle || 'buttons';
				var buttons = interact.buttons || draw.grid.interactDefaultButtons;
			}
		}
		var pathNum = draw.path.indexOf(path);
		if (!un(obj.controlsOffsetPos)) {
			var x = obj.left+obj.controlsOffsetPos[0];
			var y = obj.top+obj.controlsOffsetPos[1];
		} else if (controlsStyle === 'buttons') {			
			var x = obj.left+obj.width+40;
			var y = obj.top;
		} else {
			var x = obj.left;
			var y = obj.top+obj.height+60;
		}
		if (controlsStyle === 'buttons') {			
			var size = 50;
			var dir = obj.controlsDirection === 'vertical' ? 'v' : 'h';
			for (var b = 0; b < buttons.length; b++) {
				var x2 = dir === 'h' ? x+size*b : x;
				var y2 = dir === 'h' ? y : y+size*b;
				draw.grid.drawInteractButton(ctx, obj, buttons[b], x2, y2, size, size, undefined, obj.controlsColors);
				obj._cursorPos.push({
					buttonType: 'grid-' + buttons[b],
					shape: 'rect',
					dims: [x2, y2, size, size],
					cursor: draw.cursors.pointer,
					func: draw.grid.interactButtonClick,
					pathNum: pathNum,
					obj: obj,
					mode: buttons[b]
				});
				if (buttons[b] === 'zoomIn') {
					obj._cursorPos.last().factor = 2/3;
				} else if (buttons[b] === 'zoomOut') {
					obj._cursorPos.last().factor = 3/2;
				}
			}
		} else if (controlsStyle === 'full') {
			var paths = obj.path || [];
			var colorPicker = false;
			var h = 50;
			var fontSize = 20;
			var ym = y+h;		
			
			if (draw.mode === 'edit') {
				ctx.lineWidth = 4;
				ctx.strokeStyle = '#000';
				ctx.beginPath();
				ctx.moveTo(x-h/2,y+h/2);
				ctx.lineTo(x,y+h/2);
				ctx.stroke();
				
				ctx.fillStyle = '#00F';
				ctx.beginPath();
				ctx.arc(x-h/2,y+h/2,h/4,0,2*Math.PI);
				ctx.fill();
				
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.arc(x-h/2,y+h/2,h/4,0,2*Math.PI);
				ctx.stroke();
				
				obj._cursorPos.push({
					buttonType: 'grid-controlsMove',
					shape: 'circle',
					dims: [x-h/2,y+h/2,h/3],
					cursor: draw.cursors.move1,
					func: draw.grid.controlsMoveStart,
					pathNum: pathNum,
					obj: obj,
					relPos: [x,y]
				});
			}
			
			var x2 = x;
			var buttons = ['move', 'zoomOut', 'zoomIn', 'plot', 'lineSegment', 'line', 'function', 'viewMenu'];
			for (var b = 0; b < buttons.length; b++) {
				draw.grid.drawInteractButton(ctx, obj, buttons[b], x2+h*b, y, h, h);
				obj._cursorPos.push({
					buttonType: 'grid-' + buttons[b],
					shape: 'rect',
					dims: [x2+h*b, y, h, h],
					cursor: draw.cursors.pointer,
					func: draw.grid.interactButtonClick,
					pathNum: pathNum,
					obj: obj,
					mode: buttons[b]
				});
				if (buttons[b] === 'zoomIn') {
					obj._cursorPos.last().factor = 2/3;
				} else if (buttons[b] === 'zoomOut') {
					obj._cursorPos.last().factor = 3/2;
				}
			}
			y += h;
			h = 40;
						
			if (obj._interactViewMenu !== true) {
				for (var p = 0; p < paths.length; p++) {
					var path = paths[p];
					var color = path.color || '#00F';
					var lineWidth = path.lineWidth || path.radius || 2;
					var backColor = path.valid === false ? '#FCC' : path._selected === true ? '#F96' : '#FFC';
					switch (path.type) {
						case 'function':
							if (un(path.text)) {
								var value = path.func.toString();
								value = value.slice(value.indexOf('return ') + 7);
								value = value.slice(0, value.indexOf(';'));
								path.text = [value];
							}
							break;
						case 'function2':
							if (un(path.text)) {
								var value = path.func.toString();
								value = value.slice(value.indexOf('return ') + 7);
								value = value.slice(0, value.indexOf(';'));
								path.text = [value];
							}
							break;
						case 'point':
							path.text = ['(' + path.pos[0] + ', ' + path.pos[1] + ')'];
							break;
						case 'line':
							path.text = ['(' + path.pos[0][0] + ', ' + path.pos[0][1] + ')  to  (' + path.pos[1][0] + ', ' + path.pos[1][1] + ')'];
							break;
						case 'lineSegment':
							path.text = ['(' + path.pos[0][0] + ', ' + path.pos[0][1] + ')  to  (' + path.pos[1][0] + ', ' + path.pos[1][1] + ')'];
							break;
					}
					var x2 = x;

					var color2 = color === 'none' ? '#000' : color;
					var type = path.type === 'point' && path.style === 'circle' ? 'pointCircle' : path.type;
					draw.grid.drawInteractButton(ctx, obj, type, x2, y, h, h, color2, backColor);

					obj._cursorPos.push({
						buttonType: '',
						shape: 'rect',
						dims: [x2, y, h, h],
						cursor: draw.cursors.pointer,
						func: draw.grid.gridPaths.changeColor,
						obj: obj,
						gridPath: path
					});
					if (path._colorPicker === true && colorPicker === false) {
						colorPicker = {
							index:p,
							top:y+h,
							center:x2+h/2,
							type:path.type,
							color:color2
						};
					}
					delete path._colorPicker;

					x2 += h;

					ctx.fillStyle = backColor;
					ctx.strokeStyle = '#000';
					ctx.lineWidth = 1;
					ctx.fillRect(x2,y,355,h);
					ctx.strokeRect(x2,y,355,h);
					
					if (un(path._textObj)) {
						path._textObj = {
							type:'editableText',
							align: [-1, 0],
							font: 'algebra',
							algPadding:3,
							fontSize: fontSize,
							text: path.text,
							box: {
								type: 'none',
							},
							onInputEnd:draw.grid.gridPaths.functionTextInputEnd,
							deselectOnInputStart:false,
							deselectOnInputEnd:false,
							grid:obj,
							gridPathIndex:p
						};
					}
					path._textObj.rect = [x2+10,y,315,h];
					path._textObj.ctx = ctx;
					if (path._textObj.textEdit !== true) path._textObj.text = path.text;
					if (path.type === 'function' || path.type === 'function2') {
						draw.editableText.draw(ctx,path._textObj);
						obj._cursorPos.push({
							shape: 'rect',
							dims: clone(path._textObj.rect),
							cursor: draw.cursors.text,
							func: textEdit.selectStart,
							obj: path._textObj,
							pathNum:pathNum,
							highlight: -1						
						});
					} else {
						text(path._textObj);
						obj._cursorPos.push({
							buttonType: '',
							shape: 'rect',
							dims: clone(path._textObj.rect),
							//cursor: draw.cursors.pointer,
							//func: draw.grid.gridPaths.toggleSelected,
							cursor:'default',
							func:function() {},
							obj: obj,
							gridPath: path
						});
					}

					x2 += 325;
					drawCross(ctx, 20, 20, '#F00', x2 + 5, y + (h-20)/2, 2);

					obj._cursorPos.push({
						buttonType: '',
						shape: 'rect',
						dims: [x2, y, 30, h],
						cursor: draw.cursors.pointer,
						func: draw.grid.gridPaths.deletePath,
						obj: obj,
						gridPathIndex: p
					});

					y += h;
				}
				if (colorPicker !== false) {
					var colors = ['none','#000','#666','#00F','#F00','#393','#909','#F90','#A0522D'];
					var width = 35;
					var cols = 3;
					var margin = 0;
					var left = colorPicker.center-cols*width/2;
					var top = colorPicker.top;
					for (var c = 0; c < colors.length; c++) {
						var col = c%cols;
						var row = Math.floor(c/cols);
						var x = left+col*width;
						var y = top+row*width;
						var color = colors[c];
						var color2 = color === 'none' ? '#FFF' : color;
						text({
							ctx:ctx,
							rect:[x,y,width,width],
							text:[""],
							box:{
								type:'loose',
								color:color2,
								borderWidth:1,
								borderColor:'#000'
							}
						});
						if (color === 'none') {
							ctx.beginPath();
							ctx.lineWidth = 2;
							ctx.strokeStyle = '#000';
							ctx.moveTo(x,y);
							ctx.lineTo(x+width,y+width);
							ctx.moveTo(x+width,y);
							ctx.lineTo(x,y+width);
							ctx.stroke();
						}
						obj._cursorPos.push({
							buttonType: '',
							shape: 'rect',
							dims: [x,y,width,width],
							cursor: draw.cursors.pointer,
							func: draw.grid.gridPaths.setColor,
							obj: obj,
							gridPathIndex: colorPicker.index,
							color:color
						});
					}
					if (colorPicker.type === 'point') {
						y += width;
						var x = colorPicker.center-width;
						
						draw.grid.drawInteractButton(ctx, obj, 'point', x, y, width, width, colorPicker.color, '#FFC');
						obj._cursorPos.push({
							buttonType: '',
							shape: 'rect',
							dims: [x,y,width,width],
							cursor: draw.cursors.pointer,
							func: draw.grid.gridPaths.setPointStyle,
							obj: obj,
							gridPathIndex: colorPicker.index,
							style:'cross'
						});
						
						x += width;
						
						draw.grid.drawInteractButton(ctx, obj, 'pointCircle', x, y, width, width, colorPicker.color, '#FFC');
						obj._cursorPos.push({
							buttonType: '',
							shape: 'rect',
							dims: [x,y,width,width],
							cursor: draw.cursors.pointer,
							func: draw.grid.gridPaths.setPointStyle,
							obj: obj,
							gridPathIndex: colorPicker.index,
							style:'circle'
						});
					}
				}
			} else {
				y = ym;
				x2 = x;
				
				// x & y controls	
				var properties = ['xMin','xMax','xMinorStep','xMajorStep','yMin','yMax','yMinorStep','yMajorStep'];
				if (un(obj._viewMenuTextObjs)) {
					obj._viewMenuTextObjs = {};
					for (var t = 0; t < properties.length; t++) {
						obj._viewMenuTextObjs[properties[t]] = {
							type:'editableText',
							align: [0, 0],
							fontSize: fontSize,
							text: [''],
							onInputEnd:draw.grid.propertyChangeInputEnd,
							deselectOnInputStart:false,
							deselectOnInputEnd:false,
							grid:obj,
							property:properties[t]
						}
					}
				}
							
				ctx.fillStyle = colorA('#9FF', 1);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x2,y,400,h);
				ctx.strokeRect(x2,y,400,h);
				ctx.beginPath();
				ctx.moveTo(x2+200,y);
				ctx.lineTo(x2+200,y+h);
				ctx.moveTo(x2+300,y);
				ctx.lineTo(x2+300,y+h);
				ctx.stroke();
				
				obj._viewMenuTextObjs.xMin.rect = [x2,y,70,h];
				text({ctx:ctx,rect:[x2+50,y,100,h],align:[0,0],font:'algebra',fontSize:fontSize,text:[lessThanEq+' x '+lessThanEq]});
				obj._viewMenuTextObjs.xMax.rect = [x2+130,y,70,h];
				text({ctx:ctx,rect:[x2+202,y,75,h],align:[0,0],italic:true,fontSize:fontSize,text:['major:']});
				obj._viewMenuTextObjs.xMajorStep.rect = [x2+270,y,30,h];
				text({ctx:ctx,rect:[x2+302,y,75,h],align:[0,0],italic:true,fontSize:fontSize,text:['minor:']});				
				obj._viewMenuTextObjs.xMinorStep.rect = [x2+370,y,30,h];

				y += h;

				ctx.fillStyle = colorA('#9FF', 1);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x2,y,400,h);
				ctx.strokeRect(x2,y,400,h);
				ctx.beginPath();
				ctx.moveTo(x2+200,y);
				ctx.lineTo(x2+200,y+h);
				ctx.moveTo(x2+300,y);
				ctx.lineTo(x2+300,y+h);
				ctx.stroke();
				
				obj._viewMenuTextObjs.yMin.rect = [x2,y,70,h];
				text({ctx:ctx,rect:[x2+50,y,100,h],align:[0,0],font:'algebra',fontSize:fontSize,text:[lessThanEq+' y '+lessThanEq]});
				obj._viewMenuTextObjs.yMax.rect = [x2+130,y,70,h];
				text({ctx:ctx,rect:[x2+202,y,75,h],align:[0,0],italic:true,fontSize:fontSize,text:['major:']});
				obj._viewMenuTextObjs.yMajorStep.rect = [x2+270,y,30,h];
				text({ctx:ctx,rect:[x2+302,y,75,h],align:[0,0],italic:true,fontSize:fontSize,text:['minor:']});				
				obj._viewMenuTextObjs.yMinorStep.rect = [x2+370,y,30,h];
				
				for (var t = 0; t < properties.length; t++) {
					if (obj._viewMenuTextObjs[properties[t]].textEdit !== true) {
						obj._viewMenuTextObjs[properties[t]].text = obj[properties[t]] === 0 ? ['0'] : [String(roundSF(obj[properties[t]],2))];
					}
					obj._viewMenuTextObjs[properties[t]].ctx = ctx;
					draw.editableText.draw(ctx,obj._viewMenuTextObjs[properties[t]]);
					obj._cursorPos.push({
						shape: 'rect',
						dims: clone(obj._viewMenuTextObjs[properties[t]].rect),
						cursor: draw.cursors.text,
						func: textEdit.selectStart,
						obj: obj._viewMenuTextObjs[properties[t]],
						pathNum:pathNum,
						highlight: -1				
					});
				}
				
				y += h;
				
				var properties2 = [
					['border','showBorder','boolean'],
					['grid','showGrid','boolean'],
					['axes','showAxes','boolean'],
					['scales','showScales','boolean'],
					['origin','originStyle',['circle', 'numbers', 'none']],
					['labels','showLabels','boolean']
				];
				
				for (var p = 0; p < properties2.length; p++) {
					var l = x+(400/3)*(p%3);
					var t = y+h*Math.floor(p/3);
					var prop = properties2[p];
					if (prop[2] === 'boolean') {
						var value = boolean(obj[prop[1]],true);
						var color = value === true ? colorA('#0F0', 1) : '#FFF';
					} else {
						var value = obj[prop[1]] || prop[2][0];
						var color = value === prop[2][0] ? colorA('#99F', 1) : value === prop[2][1] ? colorA('#9F9', 1) : colorA('#FFF', 1);						
					}
					text({
						ctx:ctx,
						rect:[l,t,400/3,h],
						align:[0,0],
						text:[prop[0]],
						box:{
							type:'loose',
							color:color,
							borderWidth:1,
							borderColor:'#000'
						}
					});
					obj._cursorPos.push({
						shape: 'rect',
						dims: clone([l,t,400/3,h]),
						cursor: draw.cursors.pointer,
						func: draw.grid.interactButtonClick,
						obj: obj,
						pathNum:pathNum,
						highlight: -1,
						mode:prop[0],
						prop:prop
					});
				}
				
			}
		}
		var interact = obj.interact || path.interact || path.isInput;
		if (!un(interact) && (interact._disabled === true || interact.disabled === true)) obj._cursorPos = [];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		if (dw !== 0 || dh !== 0) {
			if (shiftOn == true) {
				var sf = Math.min((draw.mouse[0] - obj.left) / obj.width, (draw.mouse[1] - obj.top) / obj.height);
				obj.width *= sf;
				obj.height *= sf;
			} else {
				obj.width += dw;
				obj.height += dh;
			}
		}
	},
	propertyChangeInputEnd: function(obj) {
		var value = parseFloat(obj.text[0]);
		if (isNaN(value)) return;
		var grid = obj.grid;
		var property = obj.property;
		if (property === 'xMin' && value >= grid.xMax) return;
		if (property === 'xMax' && value <= grid.xMin) return;
		if (property === 'yMin' && value >= grid.yMax) return;
		if (property === 'yMax' && value <= grid.yMin) return;
		grid[property] = value;
		drawCanvasPaths();
	},
	getRect: function (obj) {
		/*var ctx = draw.hiddenCanvas.ctx;
		ctx.clearRect(0, 0, 10000, 10000);
		var showGrid = boolean(obj.showGrid, true);
		var showScales = boolean(obj.showScales, true);
		var showLabels = boolean(obj.showLabels, true);
		return drawGrid3(ctx, 0, 0, obj, 24, '#000', '#000', '#000', '#000', '#000', '#000', mainCanvasFillStyle, showGrid, showScales, showLabels).labelBorder;*/
		return [obj.left-30,obj.top-30,obj.width+60,obj.height+60];
	},
	getGridPathFromText: function(text) {
		if (typeof text === 'string') text = [text];
		var gridPath = {valid:false};
 		var js = textArrayToJsString(text);
		var stringCopy = js;
		var exceptions = ['Math.pow', 'Math.sqrt', 'Math.PI', 'Math.sin', 'Math.cos', 'Math.tan', 'Math.asin', 'Math.acos', 'Math.atan', 'Math.e', 'Math.log', 'Math.abs'];
		for (var i = 0; i < exceptions.length; i++) {
			stringCopy = replaceAll(stringCopy, exceptions[i], '');
		}
		if (/[a-wzA-WZ]/g.test(stringCopy) == true || (stringCopy.match(/=/g) || []).length !== 1 || stringCopy.charAt(0) == "=" || stringCopy.charAt(stringCopy.length - 1) == "=") {
			gridPath.type = 'function';
			gridPath.valid = false;
			return gridPath;
		}
		if (js.indexOf("y=") == 0) {
			try {
				var func = new Function('return ' + 'function(x) {return ' + js.slice(2) + ';}')()
			} catch (err) {
				gridPath.type = 'function';
				gridPath.valid = false;
				return gridPath;
			}
			gridPath.type = 'function';
			gridPath.text = clone(text);
			gridPath.func = func;
			gridPath.time = Date.parse(new Date());
			delete gridPath.valid;
		} else {
			var splitFunc = js.split("=");
			if (splitFunc.length !== 2) return gridPath;
			try {
				var func = new Function('return ' + 'function(x,y) {return (' + splitFunc[0] + ')-(' + splitFunc[1] + ');}')()
			} catch (err) {
				gridPath.type = 'function2';
				gridPath.valid = false;
				return gridPath;
			}
			gridPath.type = 'function2';
			gridPath.text = clone(text);
			gridPath.func = func;
			gridPath.time = Date.parse(new Date());
			delete gridPath.valid;
		}
		return gridPath;
	},
	gridPaths: {
		functionTextInputEnd: function(textObj) {
			var grid = textObj.grid;
			var path = grid._path;
			delete path._interacting;
			var index = textObj.gridPathIndex;
			var gridPath = grid.path[index];
			if (un(gridPath)) return;
			var gridPath2 = draw.grid.getGridPathFromText(clone(textObj.text));
			for (var key in gridPath2) {
				gridPath[key] = gridPath2[key];
			}
		},
		addFunction: function () {
			var path = draw.path[draw.currCursor.pathNum];
			var obj = path.obj[0];
			if (un(obj.path)) obj.path = [];
			var gridPath = {
				type: 'function',
				text: [''],
				color: '#00F',
			};
			obj.path.push(gridPath);
			drawCanvasPaths();
			gridPath._textObj.textEdit = true;
			path._interacting = true;
			drawCanvasPaths();
			textEdit.start(draw.currCursor.pathNum,gridPath._textObj,0);
		},
		toggleSelected: function () {
			var gridPath = draw.currCursor.gridPath;
			gridPath._selected = !gridPath._selected;
			drawCanvasPaths();
		},
		changeColor: function () {
			var obj = draw.currCursor.obj;
			var gridPath = draw.currCursor.gridPath;
			gridPath._colorPicker = !gridPath._colorPicker;
			drawCanvasPaths();
		},
		setColor: function() {
			var obj = draw.currCursor.obj;
			var gridPath = obj.path[draw.currCursor.gridPathIndex];
			var color = draw.currCursor.color;
			gridPath.color = color;
			delete gridPath._colorPicker;
			drawCanvasPaths();
		},
		changeValue: function () {
			var obj = draw.currCursor.obj;
			var gridPath = draw.currCursor.gridPath;
			var value = prompt('Function (in js)', gridPath._value);
			if (value === false || value === null)
				return;
			try {
				gridPath.func = new Function('return ' + 'function(x) {return ' + value + ';}')();
			} catch (error) {
				Notifier.error('invalid function');
			};
			drawCanvasPaths();
		},
		changeSize: function () {
			var obj = draw.currCursor.obj;
			var gridPath = draw.currCursor.gridPath;
			var value = gridPath.lineWidth || gridPath.radius || 2;
			var value = prompt('Width', value);
			if (value === false || value === null || isNaN(Number(value)) || Number(value) < 1)
				return;
			if (!un(gridPath.radius)) {
				gridPath.radius = value;
			} else {
				gridPath.lineWidth = value;
			}
			drawCanvasPaths();
		},
		deletePath: function () {
			var obj = draw.currCursor.obj;
			var gridPathIndex = draw.currCursor.gridPathIndex;
			obj.path.splice(gridPathIndex, 1);
			drawCanvasPaths();
		},
		setPointStyle: function() {
			var obj = draw.currCursor.obj;
			var gridPath = obj.path[draw.currCursor.gridPathIndex];
			var style = draw.currCursor.style;
			gridPath.style = style;
			delete gridPath._colorPicker;
			drawCanvasPaths();
		}
	},
	zoomGrid: function(factor) {
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		var xMid = (obj.xMax+obj.xMin)/2;
		var yMid = (obj.yMax+obj.yMin)/2;
		var xDiff = (obj.xMax-obj.xMin)/2;
		var yDiff = (obj.yMax-obj.yMin)/2;
		obj.xMin = xMid-factor*xDiff;
		obj.xMax = xMid+factor*xDiff;
		obj.yMin = yMid-factor*yDiff;
		obj.yMax = yMid+factor*yDiff;
		draw.grid.autoSetScales(obj);
		drawCanvasPaths();
	},
	autoSetScales: function(obj) {
		var xDiff = obj.xMax - obj.xMin;
		var xMag = Math.log(xDiff)/Math.log(10);
		var xMag1 = Math.floor(xMag);
		var xMag2 = xMag - xMag1;
		if (xDiff % 180 == 0) { // assume degrees
			obj.xMinorStep = Math.pow(10,xMag1-2)*30;
			obj.xMajorStep = Math.pow(10,xMag1-2)*90;
		} else {
			if (xMag2 < 0.35) {
				obj.xMinorStep = Math.pow(10,xMag1-2)*10;
				obj.xMajorStep = Math.pow(10,xMag1-1)*2;		
			} else if (xMag2 < 0.5) {
				obj.xMinorStep = Math.pow(10,xMag1-1);
				obj.xMajorStep = Math.pow(10,xMag1)/2;		
			} else if (xMag2 < 0.65) {
				obj.xMinorStep = Math.pow(10,xMag1-1);
				obj.xMajorStep = Math.pow(10,xMag1-1)*2;		
			} else {
				obj.xMinorStep = Math.pow(10,xMag1-1)*5;
				obj.xMajorStep = Math.pow(10,xMag1);		
			}
		}
		
		var yDiff = obj.yMax - obj.yMin;
		var yMag = Math.log(yDiff)/Math.log(10);
		var yMag1 = Math.floor(yMag);
		var yMag2 = yMag - yMag1;
		if (yMag2 < 0.35) {
			obj.yMinorStep = Math.pow(10,yMag1-2)*10;
			obj.yMajorStep = Math.pow(10,yMag1-1)*2;		
		} else if (yMag2 < 0.5) {
			obj.yMinorStep = Math.pow(10,yMag1-1);
			obj.yMajorStep = Math.pow(10,yMag1)/2;		
		} else if (yMag2 < 0.65) {
			obj.yMinorStep = Math.pow(10,yMag1-1);
			obj.yMajorStep = Math.pow(10,yMag1-1)*2;		
		} else {
			obj.yMinorStep = Math.pow(10,yMag1-1)*5;
			obj.yMajorStep = Math.pow(10,yMag1);		
		}
	},
	
	getPolygonVertexLabelPos: function(polygon,options) {
		if (un(options.offset)) options.offset = 1;
		if (un(options.fontSize)) options.fontSize = 28;
		if (un(options.letters)) options.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var labels = [];
		for (var i = 0; i < polygon.length; i++) {
			var p1 = i == 0 ? polygon.last() : polygon[i-1];
			var p2 = polygon[i];
			var p3 = polygon[(i+1)%polygon.length];
			
			var a1 = getAngleFromAToB(p2,p1);
			var a2 = getAngleFromAToB(p2,p3);
			if (a2 > a1) {
				var a3 = (a1+a2)/2;
			} else {
				var a3 = (a1+a2+2*Math.PI)/2;
				while (a3 > 2*Math.PI) {
					a3 -= 2*Math.PI;
				}
			}
			
			var vector = angleToVector(a3,options.offset);
			var labelPos = pointAddVector(p2,vector);
			
			labels.push({
				type: 'label',
				align: [0,0],
				font: 'algebra',
				fontSize: options.fontSize,
				text: [options.letters[i]],
				pos: labelPos
			});
		}
		return labels;
	},
	getPolygonSideLabelPos: function(polygon,options) {
		if (un(options.offset)) options.offset = 1;
		if (un(options.fontSize)) options.fontSize = 28;
		if (un(options.letters)) options.letters = 'abcdefghijklmnopqrstuvwxyz';
		var labels = [];
		for (var i = 0; i < polygon.length; i++) {
			var p2 = polygon[i];
			var p3 = polygon[(i+1)%polygon.length];
			var a2 = getAngleFromAToB(p2,p3);
									
			var mid = midpoint(p2[0],p2[1],p3[0],p3[1]);
			var ang = a2-0.5*Math.PI;
			while (ang < 0) ang += 2*Math.PI;
						
			var offset = align.indexOf(0) > -1 ? 2*options.offset : options.offset;
			var vector = angleToVector(ang,offset);
			var labelPos = pointAddVector(mid,vector);
			
			labels.push({
				type: 'label',
				align: [0,0],
				font: 'algebra',
				fontSize: options.fontSize,
				text: [options.letters[i]],
				pos: labelPos
			});
		}
		return labels;
	},
	
	getSnapPos: function (obj) {
		var xStep = obj.xSnapStep || obj.xMinorStep;
		var yStep = obj.ySnapStep || obj.yMinorStep;
		var xMinorSpacing = (obj.width * xStep) / (obj.xMax - obj.xMin);
		var yMinorSpacing = (obj.height * yStep) / (obj.yMax - obj.yMin);
		var x0 = obj.left - (obj.xMin * obj.width) / (obj.xMax - obj.xMin);
		var y0 = obj.top + (obj.yMax * obj.height) / (obj.yMax - obj.yMin);

		var xPos = [];
		var xAxisPoint = x0;
		while (roundToNearest(xAxisPoint, 0.01) <= roundToNearest(obj.left + obj.width, 0.01)) {
			if (roundToNearest(xAxisPoint, 0.01) > roundToNearest(obj.left, 0.01) && xPos.indexOf(xAxisPoint) == -1)
				xPos.push(xAxisPoint);
			xAxisPoint += xMinorSpacing;
		}
		var xAxisPoint = x0;
		while (roundToNearest(xAxisPoint, 0.01) >= roundToNearest(obj.left, 0.01)) {
			if (roundToNearest(xAxisPoint, 0.01) < roundToNearest(obj.left + obj.width, 0.01) && xPos.indexOf(xAxisPoint) == -1)
				xPos.push(xAxisPoint);
			xAxisPoint -= xMinorSpacing;
		}

		var yPos = [];
		var yAxisPoint = y0;
		while (roundToNearest(yAxisPoint, 0.01) <= roundToNearest(obj.top + obj.height, 0.01)) {
			if (roundToNearest(yAxisPoint, 0.01) > roundToNearest(obj.top, 0.01) && yPos.indexOf(yAxisPoint) == -1)
				yPos.push(yAxisPoint);
			yAxisPoint += yMinorSpacing;
		}
		var yAxisPoint = y0;
		while (roundToNearest(yAxisPoint, 0.01) >= roundToNearest(obj.top, 0.01)) {
			if (roundToNearest(yAxisPoint, 0.01) < roundToNearest(obj.top + obj.height, 0.01) && yPos.indexOf(yAxisPoint) == -1)
				yPos.push(yAxisPoint);
			yAxisPoint -= yMinorSpacing;
		}

		var pos = [];
		for (var x = 0; x < xPos.length; x++) {
			for (var y = 0; y < yPos.length; y++) {
				pos.push({
					type: 'point',
					pos: [xPos[x], yPos[y]]
				});
			}
		}
		return pos;
	},
	showGrid: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (typeof obj.showGrid == 'undefined') {
			obj.showGrid = false;
		} else {
			obj.showGrid = !obj.showGrid;
		}
		drawCanvasPaths();
	},
	showScales: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (typeof obj.showScales == 'undefined') {
			obj.showScales = false;
		} else {
			obj.showScales = !obj.showScales;
		}
		drawCanvasPaths();
	},
	showLabels: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (typeof obj.showLabels == 'undefined') {
			obj.showLabels = false;
		} else {
			obj.showLabels = !obj.showLabels;
		}
		drawCanvasPaths();
	},
	showBorder: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (typeof obj.showBorder == 'undefined') {
			obj.showBorder = false;
		} else {
			obj.showBorder = !obj.showBorder;
		}
		drawCanvasPaths();
	},
	originStyle: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (typeof obj.originStyle == 'undefined' || obj.originStyle == 'circle') {
			obj.originStyle = 'numbers';
		} else {
			obj.originStyle = 'circle';
		}
		drawCanvasPaths();
	},
	toHistogram: function () {
		var obj = sel();
		if (obj.type !== 'grid')
			return;
		obj.originStyle = 'numbers';
		obj.xMin = 0;
		obj.xMax = 35;
		obj.yMin = 0;
		obj.yMax = 2;
		obj.yMajorStep = 0.5;
		obj.yMinorStep = 0.1;
		obj.plot = [{
				type: 'histogram',
				fillStyle: '#CFF',
				chartData: [{
						min: 0,
						max: 10,
						freq: 5
					}, {
						min: 10,
						max: 15,
						freq: 8
					}, {
						min: 15,
						max: 20,
						freq: 7,
						fillStyle: '#FCF'
					}, {
						min: 20,
						max: 35,
						freq: 8
					}
				]
			}
		];
		obj.axisLabels = [{
				text: ['<<fontSize:28>>Time (s)']
			}, {
				text: ['<<fontSize:28>>Frequency' + br + 'Density']
			}
		];
		console.log(obj);
		updateBorder(selPath());
		drawCanvasPaths();
	},
	toCFreq: function () {
		var obj = sel();
		if (obj.type !== 'grid')
			return;
		obj.originStyle = 'numbers';
		obj.xMin = 0;
		obj.xMax = 140;
		obj.yMin = 0;
		obj.yMax = 70;
		obj.xMajorStep = 20;
		obj.xMinorStep = 10;
		obj.yMajorStep = 10;
		obj.yMinorStep = 5;
		obj.plot = [{
				type: 'cFreq',
				pointStyle: 'circle',
				chartData: [[0, 0], [25, 20], [50, 43], [75, 48], [100, 56], [125, 62]]
			}
		];
		obj.axisLabels = [{
				text: ['<<fontSize:28>>Time (s)']
			}, {
				text: ['<<fontSize:28>>Cumulative Frequency']
			}
		];
		console.log(obj);
		updateBorder(selPath());
		drawCanvasPaths();
	},
	toScatter: function () {
		var obj = sel();
		if (obj.type !== 'grid')
			return;
		obj.originStyle = 'numbers';
		obj.xMin = 0;
		obj.xMax = 140;
		obj.yMin = 0;
		obj.yMax = 70;
		obj.xMajorStep = 20;
		obj.xMinorStep = 10;
		obj.yMajorStep = 10;
		obj.yMinorStep = 5;
		obj.plot = [{
				type: 'scatter',
				pointStyle: 'circle',
				chartData: [[25, 20], [50, 43], [75, 48], [100, 56], [125, 62]]
			}
		];
		obj.axisLabels = [{
				text: ['<<fontSize:28>>Weight (kg)']
			}, {
				text: ['<<fontSize:28>>Height (cm)']
			}
		];
		console.log(obj);
		updateBorder(selPath());
		drawCanvasPaths();
	},
	toFreqPolygon: function () {
		var obj = sel();
		if (obj.type !== 'grid')
			return;
		obj.originStyle = 'numbers';
		obj.xMin = 0;
		obj.xMax = 140;
		obj.yMin = 0;
		obj.yMax = 70;
		obj.xMajorStep = 20;
		obj.xMinorStep = 10;
		obj.yMajorStep = 10;
		obj.yMinorStep = 5;
		obj.plot = [{
				type: 'freqPolygon',
				pointStyle: 'circle',
				chartData: [[25, 20], [50, 43], [75, 48], [100, 56], [125, 62]]
			}
		];
		obj.axisLabels = [{
				text: ['<<fontSize:28>>Time (days)']
			}, {
				text: ['<<fontSize:28>>Height (cm)']
			}
		];
		console.log(obj);
		updateBorder(selPath());
		drawCanvasPaths();
	},
	drawButton: function (ctx, size) {
		ctx.lineWidth = 0.02 * size;
		ctx.strokeStyle = '#666';

		for (var i = 2; i <= 8; i++) {
			ctx.moveTo(0.2 * size, 0.1 * i * size);
			ctx.lineTo(0.8 * size, 0.1 * i * size);
			ctx.moveTo(0.1 * i * size, 0.2 * size);
			ctx.lineTo(0.1 * i * size, 0.8 * size);
		}
		ctx.stroke();

		drawArrow({
			ctx: ctx,
			startX: 0.2 * size,
			startY: 0.5 * size,
			finX: 0.8 * size,
			finY: 0.5 * size,
			lineWidth: 0.02 * size,
			arrowLength: 0.06 * size
		});
		drawArrow({
			ctx: ctx,
			startX: 0.5 * size,
			startY: 0.8 * size,
			finX: 0.5 * size,
			finY: 0.2 * size,
			lineWidth: 0.02 * size,
			arrowLength: 0.06 * size
		});
	},
	gridPathStart: function () {
		var obj = draw.currCursor.obj;
		draw.gridPath = {
			obj: obj
		};
		if (un(obj.path))
			obj.path = [];
		draw.gridDrawMode = draw.currCursor.mode;
		var pos = getCoordAtMousePos(obj);
		if (draw.gridDrawMode == 'grid-drawLineSegmentPoints' || draw.currCursor.mode == 'drawLineSegmentPoints') {
			draw.gridDrawPoints = [];
			var found = false;
			for (var p = 0; p < obj.path.length; p++) {
				if (obj.path[p].type !== 'point')
					continue;
				var pos2 = obj.path[p].pos;
				draw.gridDrawPoints.push(pos2);
				if (dist(pos[0], pos[1], pos2[0], pos2[1]) < 1) {
					pos = clone(pos2);
					found = true;
				}
			}
			if (found == false)
				return;
		} else {
			pos[0] = roundToNearest(pos[0], obj.xMinorStep);
			pos[1] = roundToNearest(pos[1], obj.yMinorStep);
		}
		obj.path.push({
			type: 'lineSegment',
			pos: [clone(pos), clone(pos)],
			strokeStyle: draw.color,
			lineWidth: draw.thickness
		});
		drawCanvasPaths();
		draw.animate(draw.grid.gridPathMove,draw.grid.gridPathStop,drawCanvasPaths);
		//addListenerMove(window, draw.grid.gridPathMove);
		//addListenerEnd(window, draw.grid.gridPathStop);
	},
	gridPathMove: function (e) {
		updateMouse(e);
		var obj = draw.gridPath.obj;
		var path = obj.path.last();
		var pos = getCoordAtMousePos(obj);
		if (draw.gridDrawMode == 'grid-drawLineSegmentPoints') {
			for (var p = 0; p < draw.gridDrawPoints.length; p++) {
				var pos2 = draw.gridDrawPoints[p];
				if (arraysEqual(pos2, path.pos[0]))
					continue;
				if (dist(pos[0], pos[1], pos2[0], pos2[1]) < 1) {
					pos = clone(pos2);
					break;
				}
			}
		} else {
			pos[0] = bound(pos[0], obj.xMin, obj.xMax, obj.xMinorStep);
			pos[1] = bound(pos[1], obj.yMin, obj.yMax, obj.yMinorStep);
			pos[0] = roundToNearest(pos[0], obj.xMinorStep);
			pos[1] = roundToNearest(pos[1], obj.yMinorStep);
		}
		if (arraysEqual(path.pos[1], pos) == false) {
			path.pos[1] = pos;
			//drawCanvasPaths();
		}
	},
	gridPathStop: function (e) {
		var obj = draw.gridPath.obj;
		var path = obj.path.last();
		if (draw.gridDrawMode == 'grid-drawLineSegmentPoints') {
			var found = false;
			for (var p = 0; p < draw.gridDrawPoints.length; p++) {
				var pos2 = draw.gridDrawPoints[p];
				if (arraysEqual(pos2, path.pos[0]))
					continue;
				if (arraysEqual(pos2, path.pos[1]))
					found = true;
			}
			if (found == false) {
				obj.path.pop();
				drawCanvasPaths();
			}
		} else {
			if (arraysEqual(path.pos[0], path.pos[1]) == true) {
				obj.path.pop();
				if (obj.path.length == 0)
					delete obj.path;
				drawCanvasPaths();
			}
		}
		delete draw.gridPath;
		delete draw.gridDrawMode;
		delete draw.gridDrawPoints;
		//removeListenerMove(window, draw.grid.gridPathMove);
		//removeListenerEnd(window, draw.grid.gridPathStop);
	},
	moveStart: function (e) {
		var obj = draw.currCursor.obj;
		changeDrawMode('gridDragMove');
		updateMouse(e);
		draw.drag = {
			obj: obj,
			pos:clone(draw.mouse)
		};
		obj._path._interacting = true;
		drawCanvasPaths();
		calcCursorPositions();
		draw.animate(draw.grid.moveMove,draw.grid.moveStop,drawCanvasPaths);
		//addListenerMove(window, draw.grid.moveMove);
		//addListenerEnd(window, draw.grid.moveStop);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
	},
	moveMove: function (e) {
		updateMouse(e);
		var obj = draw.drag.obj;
		var dx = draw.mouse[0]-draw.drag.pos[0];
		var dy = draw.mouse[1]-draw.drag.pos[1];
		var dx2 = dx * (obj.xMax-obj.xMin)/obj.width;
		var dy2 = dy * (obj.yMax-obj.yMin)/obj.height;
		obj.xMin -= dx2;
		obj.xMax -= dx2;
		obj.yMin += dy2;
		obj.yMax += dy2;
		//drawSelectedPaths(false);
		draw.drag.pos = clone(draw.mouse);
	},
	moveStop: function (e) {
		var obj = draw.drag.obj;
		changeDrawMode();
		delete obj._path._interacting;
		delete draw.drag;
		
		var xMag = Math.floor(Math.log(obj.xMax - obj.xMin)/Math.log(10));
		var yMag = Math.floor(Math.log(obj.yMax - obj.yMin)/Math.log(10));
		xMag = Math.pow(10,xMag-1);
		yMag = Math.pow(10,yMag-1);
		obj.xMin = roundToNearest(obj.xMin,xMag);
		obj.xMax = roundToNearest(obj.xMax,xMag);
		obj.yMin = roundToNearest(obj.yMin,yMag);
		obj.yMax = roundToNearest(obj.yMax,yMag);
		
		drawCanvasPaths();
		//removeListenerMove(window, draw.grid.moveMove);
		//removeListenerEnd(window, draw.grid.moveStop);
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
	},

	controlsMoveStart: function (e) {
		var obj = draw.currCursor.obj;
		changeDrawMode('gridDragMove');
		updateMouse(e);
		draw.drag = {
			obj: obj,
			offset: [draw.mouse[0]-draw.currCursor.relPos[0],draw.mouse[1]-draw.currCursor.relPos[1]]
		};	
		obj._path._interacting = true;
		drawCanvasPaths();
		calcCursorPositions();
		draw.animate(draw.grid.controlsMoveMove,draw.grid.controlsMoveStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
	},
	controlsMoveMove: function (e) {
		updateMouse(e);
		var obj = draw.drag.obj;
		obj.controlsOffsetPos = [draw.mouse[0]-obj.left-draw.drag.offset[0],draw.mouse[1]-obj.top-draw.drag.offset[1]];
	},
	controlsMoveStop: function (e) {
		var obj = draw.drag.obj;
		changeDrawMode();
		delete obj._path._interacting;
		delete draw.drag;
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
	},

	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		obj.width *= sf;
		obj.height *= sf;
		if (!un(obj.xScaleOffset))
			obj.xScaleOffset *= sf;
		if (!un(obj.yScaleOffset))
			obj.yScaleOffset *= sf;
		if (!un(obj.minorWidth))
			obj.minorWidth *= sf;
		if (!un(obj.majorWidth))
			obj.majorWidth *= sf;
		if (!un(obj.fontSize))
			obj.fontSize *= sf;
	},

	getCursorPositionsSelected: function (obj, pathNum) {
		var path = draw.path[pathNum];
		var pos = [];
		if (!un(obj._interactMode) && obj._interactMode !== 'none' && !un(draw.grid.interact[obj._interactMode])) {
			pos.push({
				shape: 'rect',
				dims: [obj.left - 10, obj.top - 10, obj.width + 20, obj.height + 20],
				cursor: obj._interactCursor,
				func: draw.grid.interact[obj._interactMode],
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			});
		}
		return pos;
	},
	getCursorPositionsInteract: function (obj, path, pathNum) {
		var pos = [];

		var interact = obj.interact || path.interact || path.isInput;
		if (!un(interact) && interact._disabled !== true && interact.disabled !== true) {
			if (typeof obj._cursorPos !== 'object' || obj._cursorPos.length === 0) { 
				var x2 = obj.left + obj.width + 40;
				var y1 = obj.top;
				if (!un(interact.buttons) || interact.controlsStyle === 'buttons' || interact.controlsStyle === 'full') {
					var buttons = interact.buttons || draw.grid.interactDefaultButtons;
					for (var b = 0; b < buttons.length; b++) {
						var button = buttons[b];
						pos.push({
							buttonType: 'grid-' + button,
							shape: 'rect',
							dims: [x2, y1 + 40 * b, 40, 40],
							cursor: draw.cursors.pointer,
							func: draw.grid.interactButtonClick,
							pathNum: pathNum,
							obj: obj,
							mode: button
						});
					}
				}
			}

			if (un(obj._interactMode)) obj._interactMode = interact.startMode || interact.mode2 || 'none';
			if (obj._interactMode !== 'none') {
				if (un(obj._interactCursor)) obj._interactCursor = draw.grid.getInteractCursor(path, obj);
				var func = obj._interactMode == 'move' ? draw.grid.moveStart : draw.grid.interact[obj._interactMode];
				pos.push({
					shape: 'rect',
					dims: [obj.left - 10, obj.top - 10, obj.width + 20, obj.height + 20],
					cursor: obj._interactCursor,
					func: func,
					obj: obj,
					pathNum: pathNum,
					highlight: -1
				});
			}
			if (obj.path instanceof Array) {
				for (var p = 0; p < obj.path.length; p++) {
					var gridPath = obj.path[p];
					if (gridPath.interact !== true || gridPath.visible === false) continue;
					if (gridPath.type === 'point') {
						if (gridPath.pos[0] < obj.xMin || gridPath.pos[0] > obj.xMax || gridPath.pos[1] < obj.yMin || gridPath.pos[1] > obj.yMax) continue;
						var pos2 = getPosOfCoord(gridPath.pos, obj);
						pos.push({
							shape: 'circle',
							dims: [pos2[0], pos2[1], 20],
							cursor: draw.cursors.move1,
							func: draw.grid.interact.pointMoveStart,
							obj: obj,
							pathNum: pathNum,
							gridPath: gridPath,
							highlight: -1
						});
					} else if (['polygon2','line','lineSegment'].indexOf(gridPath.type) > -1) {
						for (var p2 = 0; p2 < gridPath.pos.length; p2++) {
							if (gridPath.pos[p2][0] < obj.xMin || gridPath.pos[p2][0] > obj.xMax || gridPath.pos[p2][1] < obj.yMin || gridPath.pos[p2][1] > obj.yMax) continue;
							var pos2 = getPosOfCoord(gridPath.pos[p2], obj);
							pos.push({
								shape: 'circle',
								dims: [pos2[0], pos2[1], 20],
								cursor: draw.cursors.move1,
								func: draw.grid.interact.pointMoveStart,
								obj: obj,
								pathNum: pathNum,
								gridPath: gridPath,
								pointIndex: p2,
								highlight: -1
							});
						}
					}
				}
			}
		}
		return pos;
	},
	interactDefaultButtons: ['plot', 'lineSegment', 'line', 'undo', 'clear'],
	drawInteractButton: function (ctx, obj, type, l, t, w, h, color, backColor) {
		var color = !un(color) ? color : '#000';
		if (backColor instanceof Array) {
			var backColorUnselected = backColor[0];
			var backColorSelected = backColor[1];
		} else if (typeof backColor === 'String') {
			var backColorUnselected = backColor;
			var backColorSelected = backColor;
		} else {
			var backColorUnselected = '#99F';
			var backColorSelected = '#00F';
		}
		if (un(obj._interactMode)) {
			var interact = obj.interact;
			if (!un(interact) && interact._disabled !== true && interact.disabled !== true) {
				obj._interactMode = interact.startMode || interact.mode2 || 'none';
			}
		}
		ctx.save();
		switch (type) {
			case 'grid-plot':
			case 'grid-point':
			case 'plot':
			case 'point':
				ctx.fillStyle = obj._interactMode === 'plot' ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				ctx.lineWidth = 2;
				ctx.strokeStyle = color;
				ctx.beginPath();
				ctx.moveTo(l + 0.35 * w, t + 0.35 * h);
				ctx.lineTo(l + 0.65 * w, t + 0.65 * h);
				ctx.moveTo(l + 0.35 * w, t + 0.65 * h);
				ctx.lineTo(l + 0.65 * w, t + 0.35 * h);
				ctx.stroke();
				break;
			case 'pointCircle':
				ctx.fillStyle = obj._interactMode === 'plot' ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				ctx.fillStyle = color;
				ctx.beginPath();
				ctx.arc(l + 0.5 * w, t + 0.5 * h, 0.15*w, 0, 2*Math.PI);
				ctx.fill();
				break;
			case 'grid-lineSegment':
			case 'lineSegment':
				ctx.fillStyle = obj._interactMode === 'lineSegment' ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.strokeRect(l, t, w, h);
				ctx.lineWidth = 2;
				ctx.strokeStyle = color;
				ctx.beginPath();
				ctx.moveTo(l + 0.3 * w, t + 0.4 * h);
				ctx.lineTo(l + 0.7 * w, t + 0.6 * h);
				ctx.stroke();
				break;
			case 'grid-line':
			case 'line':
				ctx.fillStyle = obj._interactMode === 'line' ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				ctx.lineWidth = 2;
				ctx.strokeStyle = color;
				ctx.beginPath();
				ctx.moveTo(l, t + 0.3 * h);
				ctx.lineTo(l + w, t + 0.7 * h);
				ctx.stroke();
				break;
			case 'grid-undo':
			case 'undo':
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				ctx.fillStyle = '#000';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(l + 0.5 * w, t + 0.5 * h, 0.22 * w, 1.2 * Math.PI,  0.8 * Math.PI);
				ctx.stroke();
				ctx.beginPath();
				var l2 = l + 0.23 * w;
				var t2 = t + 0.47 * h;
				var arrowLength = 0.28 * w;
				ctx.moveTo(l2, t2);
				ctx.lineTo(l2 - arrowLength * Math.sin(1.06 * Math.PI), t2 + arrowLength * Math.cos(1.06 * Math.PI));
				ctx.lineTo(l2 - arrowLength * Math.cos(1.03 * Math.PI), t2 - arrowLength * Math.sin(1.03 * Math.PI));
				ctx.lineTo(l2, t2);
				ctx.fill();
				break;
			case 'grid-clear':
			case 'clear':
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.strokeRect(l, t, w, h);
				text({
					ctx: ctx,
					color: color,
					textArray: ['<<fontSize:' + (w * 0.4) + '>>CLR'],
					left: l,
					top: t,
					width: w,
					height: h,
					align: [0, 0]
				});
				break;
			case 'grid-function':
			case 'grid-function2':
			case 'function':
			case 'function2':
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.strokeRect(l, t, w, h);
				ctx.beginPath();
				ctx.strokeStyle = color;
				ctx.lineWidth = 2;
				ctx.moveTo(l + 0.1 * w, t + 1 * h);
				ctx.bezierCurveTo(l + 0.3 * w, t - 0.5 * h, l + 0.7 * w, t + 1.5 * h, l + 0.9 * w, t + 0 * h);
				ctx.stroke();
				break;
			case 'grid-zoomIn':
			case 'zoomIn':
			case 'grid-zoomOut':
			case 'zoomOut':
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);	
				ctx.strokeStyle = color;
				ctx.lineWidth = (w/50)*6;
				ctx.beginPath();
				ctx.moveTo(l+(w/50)*20,t+(w/50)*20);
				ctx.lineTo(l+(w/50)*35,t+(w/50)*35);
				ctx.stroke();
				ctx.lineWidth = (w/50)*2;	
				ctx.beginPath();
				ctx.fillStyle = '#FFF';
				ctx.arc(l+(w/50)*20,t+(w/50)*20,(w/50)*10,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(l+(w/50)*16,t+(w/50)*20);
				ctx.lineTo(l+(w/50)*24,t+(w/50)*20);
				if (type === 'zoomIn' || type === 'grid-zoomIn') {
					ctx.moveTo(l+(w/50)*20,t+(w/50)*16);
					ctx.lineTo(l+(w/50)*20,t+(w/50)*24);
				}
				ctx.stroke();
				break;
			case 'grid-move':
			case 'move':
				ctx.fillStyle = obj._interactMode == 'move' ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				if (un(draw.grid.handImage)) {
					draw.grid.handImage = new Image;
					draw.grid.handImage.onload = function() {
						drawCanvasPaths();
					};
					draw.grid.handImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADCElEQVRYR+2WT0iacRjHvw3qBTMmMj0M8a0uC3FMSkKa8dJ7aYaSUMRYULguscTsZvCOOgzcybcJxS4yL0EwwT+7jYgOHXSXvYY4grfloYPUNshDDAI3fpLxrqz3tUaD4XOR1/f5/X4fv8/3efw1QVkwABIANACiADzKlslnNdVIeQ7gIYAfACIAeq1W6/jY2JirubmZEkUxv7y8/FGyTjzN+yl/3MUMKcBdAGabzfaaoih7uVwu7u3tcfv7+08YhhlNJBLQaDSIRqOYnp6G2WyGWq3GycmJIAgCd3x8nAbwvV4IKUBF5ng8rnG73SgUCiCf2WwWDMNACrC4uFh5tlgs2NzcrOQdHR25AST/NUAJwFMAQQAFJTBSBR4A8HEc5xwcHDR2dXUhHA4jFotBr9crUSDc19enam9vd2cymfDu7m4MwBc5iFomjE9OTrpJrUn4/X4IgiAL0NLSgomJCXi93mrp/ADe3BrAwsICRkZGUC6XrwVADERMSOKAYRgzy7LPpqamIIoiDg8P4XK5QFEU8vk80ul05Vmn052ZkCh2zryKFWCsVqu3tbV1lJxeLBa5nZ0dNU3TgarTr5KRlIfjOAQCAdjtdmn3KAb4xfN8pdYkyK9IJpOgafqs1eTqKH0vad/rAWQyGayuriKVStUNsLGxAZ7nD3K5XLBQKKQAfJWDJ13wbmZmptfpdJpYlgVx89bWVuVwn88Ho9Eot8fZe+IDj8dD+p94KqtkYbUNX/b3979YWVnRd3Z23lGpVErWXsi5CcB9g8Hg0Gq1/NLSUtvAwMCtA5AD//gvqJcgEolgfX3909ra2lsAHwB8U7KHdBI+AvAqFArZHA7HPTKK64nT7qn7riA7ipVC/E2A3p6envHu7m7f/Pw8Ojo6rmTI5XIIBoMgrbe9vf0ewGel0CSvlgLk+8cGg8E/OzvLDg0NaU0m06V7/s37wPlDaHJB4XneUp2StSj+a4A2AK5QKKSbm5u7sgTDw8MolUqk9WRH7/mNLvNAPT66UW4DoKFAQ4GGAr8B6HWSMOjcjREAAAAASUVORK5CYII=";
				} else {
					var w2 = draw.grid.handImage.naturalWidth;
					var h2 = draw.grid.handImage.naturalHeight;
					ctx.drawImage(draw.grid.handImage,l+13,t+13,w2,h2);
				}
				break;
			case 'viewMenu':
				ctx.save();
				ctx.fillStyle = obj._interactViewMenu === true ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				text({ctx:ctx,align:[0,0],text:['...'],rect:[l,t,w,h],fontSize:32,bold:true})
				ctx.restore();
				break;
		}
		ctx.restore();
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'grid-controls',
			shape: 'rect',
			dims: [x2 - 250, y2-20, 230, 20],
			cursor: draw.cursors.pointer,
			func: draw.grid.toggleControls,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				var controlsStyle = 'none';
				var interact = path.isInput || path.interact || path.obj[0].interact;
				if (!un(interact) && !un(interact.controlsStyle)) {
					controlsStyle = interact.controlsStyle;
				} else if (!un(interact) && interact.type == 'grid') {
					controlsStyle = interact.controlsStyle || 'buttons';
				}
				var color = controlsStyle === 'none' ? '#FFF' : controlsStyle === 'full' ? '#9F9' : controlsStyle === 'buttons' ? '#FFC' : '#FFF';
				var label = controlsStyle === 'none' ? 'off' : 'on';
				ctx.fillStyle = color;
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					fontSize:14,
					text: ['present mode controls: '+label]
				});
				
			}
		});
		buttons.push({
			buttonType: 'grid-1:1',
			shape: 'rect',
			dims: [x2 - 270, y2-20, 40, 20],
			cursor: draw.cursors.pointer,
			func: draw.grid.setOneToOne,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = '#9F9';
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					fontSize:14,
					text: ['1:1']
				});
				
			}
		});
		return buttons;
	},
	toggleInteract: function () {
		var path = draw.path[draw.currCursor.pathNum];
		if (un(path.interact))
			path.interact = {};
		if (path.interact.type === 'grid') {
			path.interact.type = 'none';
		} else {
			path.interact.type = 'grid';
		}
		if (un(path.interact.color))
			path.interact.color = '#F00';
		if (un(path.interact.lineWidth))
			path.interact.lineWidth = 5;
		if (un(path.interact.max))
			path.interact.max = 1000;
		if (un(path.interact.mode2))
			path.interact.mode2 = 'none';
		if (un(path.interact.buttons))
			path.interact.buttons = clone(draw.grid.interactDefaultButtons);
		if (path.interact.type === 'grid')
			console.log(path.interact);
		updateBorder(path);
		drawCanvasPaths();
	},
	toggleControls: function() {
		var path = draw.path[draw.currCursor.pathNum];
		if (un(path.interact)) path.interact = {};
		var controlsStyle = 'none';
		if (!un(path.interact.controlsStyle)) {
			controlsStyle = path.interact.controlsStyle;
		} else if (path.interact.type == 'grid') {
			controlsStyle = 'full';
		} 
		if (controlsStyle === 'none') {
			path.interact.controlsStyle = 'full';
		} else {
			path.interact.controlsStyle = 'none';
		}
		drawCanvasPaths();
	},
	interactButtonClick: function () {
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		var mode = draw.currCursor.mode;
		if (mode === 'pointCircle') mode = 'plot';
		if (mode === 'undo') {
			draw.grid.undo();
			return;
		}
		if (mode === 'clear') {
			draw.grid.clear();
			return;
		}
		if (mode === 'function') {
			obj._interactMode = 'none';
			obj._interactViewMenu = false;
			draw.grid.gridPaths.addFunction();
			return;
		}
		if (mode === 'zoomIn') {
			draw.grid.zoomGrid(draw.currCursor.factor);
			return;
		}
		if (mode === 'zoomOut') {
			draw.grid.zoomGrid(draw.currCursor.factor);
			return;
		}
		if (mode === 'viewMenu') {
			obj._interactViewMenu = !obj._interactViewMenu;
			obj._interactMode = 'none';
			updateBorder(path);
			drawCanvasPaths();
			return;
		}
		if (['border','grid','labels','scales','axes'].indexOf(mode) > -1) {
			var key = draw.currCursor.prop[1];
			if (un(obj[key])) {
				obj[key] = false;
			} else {
				obj[key] = !obj[key];
			}
			obj._interactViewMenu = true;
			updateBorder(path);
			drawCanvasPaths();
			return;
		}
		if (mode === 'origin') {
			if (obj.originStyle === 'numbers') {
				obj.originStyle = 'none';
			} else if (obj.originStyle === 'none') {
				obj.originStyle = 'circle';
			} else {
				obj.originStyle = 'numbers';
			}
			obj._interactViewMenu = true;
			updateBorder(path);
			drawCanvasPaths();
			return;
		}
		if (obj._interactMode === mode) mode = 'none';
		obj._interactMode = mode;
		obj._interactCursor = draw.grid.getInteractCursor(path, obj);
		updateBorder(path);
		drawCanvasPaths();
	},
	getInteractCursor: function (path, obj) {
		if (obj._interactMode == 'line' || obj._interactMode == 'lineSegment') {
			var color = !un(obj._interactColor) ? obj._interactColor : (!un(obj.interact) && !un(obj.interact.color)) ? obj.interact.color : '#00F';
			return draw.grid.getCrossCursor(color);
		} else if (obj._interactMode == 'move') {
			return draw.cursors.move1;
		} else if (obj._interactMode == 'moving') {
			return draw.cursors.move2;
		} else {
			return draw.cursors.pointer;
		}
	},
	getCrossCursor: function (color) {
		var canvas = draw.hiddenCanvas;
		var w = canvas.width;
		var h = canvas.height;
		canvas.width = 50;
		canvas.height = 50;
		var ctx = draw.hiddenCanvas.ctx;
		ctx.clearRect(0, 0, 50, 50);
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(2, 2);
		ctx.lineTo(12, 12);
		ctx.moveTo(2, 12);
		ctx.lineTo(12, 2);
		ctx.stroke();

		var data = canvas.toDataURL();
		canvas.width = w;
		canvas.height = h;
		
		return 'url("' + data + '") 7 7, auto';
	},
	undo: function () {
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		if (un(obj.path) || obj.path.length == 0) return;
		for (var p = obj.path.length - 1; p >= 0; p--) {
			if (draw.mode == 'interact' && obj.path[p]._deletable !== true)
				continue;
			obj.path.splice(p, 1);
			drawCanvasPaths();
			return;
		}
		if (!un(obj.interact) && typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
	},
	clear: function () {
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		if (un(obj.path) || obj.path.length == 0)
			return;
		for (var p = obj.path.length - 1; p >= 0; p--) {
			if (draw.mode == 'interact' && obj.path[p]._deletable !== true)
				continue;
			obj.path.splice(p, 1);
		}
		if (!un(obj.interact) && typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
		drawCanvasPaths();
	},
	interact: {
		point: function () {
			draw.grid.interact.plot();
		},
		pointCircle: function () {
			draw.grid.interact.plot();
		},
		plot: function () {
			var obj = draw.currCursor.obj;
			var path = obj._path;
			var mode = draw.mode;
			if (!un(path.isInput) && path.isInput._mode === 'addAnswers') mode = 'interact';
			if (un(obj.path)) obj.path = [];
			var pos = draw.grid.getCoordAtPos(obj);
			pos[0] = roundToNearest(pos[0], obj.xMinorStep);
			pos[1] = roundToNearest(pos[1], obj.yMinorStep);
			for (var p = 0; p < obj.path.length; p++) {
				var path2 = obj.path[p];
				if (mode == 'interact' && path2._deletable !== true) continue;
				if (path2.type !== 'point') continue;
				if (path2.pos[0] == pos[0] && path2.pos[1] == pos[1]) {
					obj.path.splice(p, 1);
					drawCanvasPaths();
					return;
				}
			}			
			var interact = obj.interact || path.isInput || path.interact;
			if (mode == 'interact' && !un(interact)) {
				if (typeof interact.max === 'object') {
					if (typeof interact.max.points === 'number' && interact.max.points > 0) {
						var pathCount = 0;
						for (var p = 0; p < obj.path.length; p++) {
							var path2 = obj.path[p];
							if (path2.type !== 'point' || path2._deletable !== true) continue;
							pathCount++;
						}
						if (pathCount === interact.max.points) {
							for (var p = obj.path.length - 1; p >= 0; p--) {
								var path2 = obj.path[p];
								if (path2.type !== 'point' || path2._deletable !== true) continue;
								obj.path.splice(p, 1);
								break;
							}
						}
					}
				} else {
					if (typeof interact.max === 'string') interact.max = Number(interact.max);
					if (!un(interact.max) && Number(interact.max) > 0) {
						var pathCount = 0;
						for (var p = 0; p < obj.path.length; p++) {
							var path2 = obj.path[p];
							if (path2._deletable !== true) continue;
							pathCount++;
						}
						if (pathCount == interact.max) {
							for (var p = obj.path.length - 1; p >= 0; p--) {
								var path2 = obj.path[p];
								if (path2._deletable !== true) continue;
								obj.path.splice(p, 1);
								break;
							}
						}
					}
				}
			}
			var deletable = mode == 'interact' ? true : false;
			var style = (!un(interact) && !un(interact.plotStyle)) ? interact.plotStyle : 'cross';
			var color = !un(obj._interactColor) ? obj._interactColor : (!un(interact) && !un(interact.color)) ? interact.color : '#00F';
			var plotSize = (!un(interact) && !un(interact.plotSize)) ? interact.plotSize : 8;
			
			obj.path.push({
				type: 'point',
				pos: pos,
				color: color,
				style: style,
				radius: plotSize,
				_deletable: deletable
			});
			if (!un(obj.interact) && typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
			drawCanvasPaths();
		},
		line: function (type2) {
			if (draw.grid.interact._drawingLine === true) return;
			if (un(type2)) type2 = 'line';
			var obj = draw.currCursor.obj;
			var path = obj._path;
			var mode = draw.mode;
			if (!un(path.isInput) && path.isInput._mode === 'addAnswers') mode = 'interact';
			if (un(obj.path)) obj.path = [];
			var pos = draw.grid.getCoordAtPos(obj);
			var snapTo = (!un(obj.interact) && !un(obj.interact.snapTo)) ? obj.interact.snapTo : 'minor';
			if (snapTo === 'minor') {
				pos[0] = roundToNearest(pos[0], obj.xMinorStep);
				pos[1] = roundToNearest(pos[1], obj.yMinorStep);
			} else if (snapTo === 'major') {
				pos[0] = roundToNearest(pos[0], obj.xMajorStep);
				pos[1] = roundToNearest(pos[1], obj.yMajorStep);
			} else if (!isNaN(Number(snapTo)) && Number(snapTo) > 0) {
				pos[0] = roundToNearest(pos[0], Number(snapTo));
				pos[1] = roundToNearest(pos[1], Number(snapTo));
			}
			
			var interact = obj.interact || path.isInput || path.interact;
			if (mode == 'interact' && !un(interact)) {
				if (typeof interact.max === 'object') {
					if (typeof interact.max[type2+'s'] === 'number' && interact.max[type2+'s'] > 0) {
						var pathCount = 0;
						for (var p = 0; p < obj.path.length; p++) {
							var path2 = obj.path[p];
							if (path2.type !== type2 || path2._deletable !== true) continue;
							pathCount++;
						}
						if (pathCount === interact.max[type2+'s']) {
							for (var p = obj.path.length - 1; p >= 0; p--) {
								var path2 = obj.path[p];
								if (path2.type !== type2 || path2._deletable !== true) continue;
								obj.path.splice(p, 1);
								break;
							}
						}
					}
				} else {
					if (typeof interact.max === 'string') interact.max = Number(interact.max);
					if (!un(interact.max) && Number(interact.max) > 0) {
						var pathCount = 0;
						for (var p = 0; p < obj.path.length; p++) {
							var path2 = obj.path[p];
							if (path2._deletable !== true) continue;
							pathCount++;
						}
						if (pathCount === interact.max) {
							for (var p = obj.path.length - 1; p >= 0; p--) {
								var path2 = obj.path[p];
								if (path2._deletable !== true) continue;
								obj.path.splice(p, 1);
								break;
							}
						}
					}
				}
			}
			var index = -1;
			if (index == -1) {
				index = obj.path.length;
				var deletable = mode == 'interact' ? true : false;
				var showLinePoints = (!un(interact) && !un(interact.showLinePoints)) ? interact.showLinePoints : false;
				var lineWidth = (!un(interact) && !un(interact.lineWidth)) ? interact.lineWidth : 5;
				var color = !un(obj._interactColor) ? obj._interactColor : (!un(interact) && !un(interact.color)) ? interact.color : '#00F';
				var path = {
					type: type2 === 'vector' ? 'lineSegment' : type2,
					pos: [pos, pos],
					strokeStyle: color,
					lineWidth: lineWidth,
					showLinePoints: showLinePoints,
					_deletable: deletable
				};
				if (type2 === 'vector') {
					path.endMid = 'open';
					path.endMidSize = 15;
				}
				obj.path.push(path);
			}
			draw.grid.interact._obj = obj;
			draw.grid.interact._index = index;
			draw.grid.interact._drawingLine = true;
			draw.animate(draw.grid.interact.lineMove,draw.grid.interact.lineStop,drawCanvasPaths);
			if (typeof obj.interact === 'object' && typeof obj.interact.onchange === 'function') {
				obj.interact.onchange(obj); 
				drawCanvasPaths();
			}
		},
		vector: function () {
			draw.grid.interact.line('vector');
		},
		lineSegment: function () {
			draw.grid.interact.line('lineSegment');
		},

		lineMove: function (e) {
			updateMouse(e);
			var obj = draw.grid.interact._obj;
			var index = draw.grid.interact._index;
			
			if (typeof obj !== 'object') return;
			var pos = draw.grid.getCoordAtPos(obj);
			var snapTo = (!un(obj.interact) && !un(obj.interact.snapTo)) ? obj.interact.snapTo : 'minor';
			if (snapTo === 'minor') {
				pos[0] = roundToNearest(pos[0], obj.xMinorStep);
				pos[1] = roundToNearest(pos[1], obj.yMinorStep);
			} else if (snapTo === 'major') {
				pos[0] = roundToNearest(pos[0], obj.xMajorStep);
				pos[1] = roundToNearest(pos[1], obj.yMajorStep);
			} else if (!isNaN(Number(snapTo)) && Number(snapTo) > 0) {
				pos[0] = roundToNearest(pos[0], Number(snapTo));
				pos[1] = roundToNearest(pos[1], Number(snapTo));
			}
			obj.path[index].pos[1] = pos;
			if (typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
			//drawCanvasPaths();
		},
		lineStop: function (e) {
			draw.grid.interact._drawingLine = false;
			updateMouse(e);
			var obj = draw.grid.interact._obj;
			var index = draw.grid.interact._index;
			var path = obj.path[index];
			if (path.pos[0][0] == path.pos[1][0] && path.pos[0][1] == path.pos[1][1]) obj.path.splice(index, 1);
			delete draw.grid.interact._obj;
			delete draw.grid.interact._index;
			if (typeof obj.interact.onchange === 'function') obj.interact.onchange(obj);
			drawCanvasPaths();
		},
		
		pointMoveStart: function() {
			draw._drag = draw.currCursor;
			draw._drag.dragStatus = 'start';
			draw.animate(draw.grid.interact.pointMoveMove,draw.grid.interact.pointMoveStop,drawCanvasPaths);
			draw.cursorCanvas.style.cursor = draw.cursors.move2;
			draw.lockCursor = draw.cursors.move2;
		},
		pointMoveMove: function (e) {
			updateMouse(e);
			draw._drag.dragStatus = 'move';
			var obj = draw._drag.obj;
			var gridPath = draw._drag.gridPath;
			var pos = draw.grid.getCoordAtPos(obj);
			var snapTo = (!un(obj.interact) && !un(obj.interact.snapTo)) ? obj.interact.snapTo : 'minor';
			if (snapTo === 'minor') {
				pos[0] = roundToNearest(pos[0], obj.xMinorStep);
				pos[1] = roundToNearest(pos[1], obj.yMinorStep);
			} else if (snapTo === 'major') {
				pos[0] = roundToNearest(pos[0], obj.xMajorStep);
				pos[1] = roundToNearest(pos[1], obj.yMajorStep);
			} else if (!isNaN(Number(snapTo)) && Number(snapTo) > 0) {
				pos[0] = roundToNearest(pos[0], Number(snapTo));
				pos[1] = roundToNearest(pos[1], Number(snapTo));
			}
			if (pos[0] < obj.xMin) pos[0] = obj.xMin;
			if (pos[0] > obj.xMax) pos[0] = obj.xMax;
			if (pos[1] < obj.yMin) pos[1] = obj.yMin;
			if (pos[1] > obj.yMax) pos[1] = obj.yMax;
			if (gridPath.type === 'point') {
				if (isEqual(gridPath.pos,pos) === false) {
					gridPath.pos = pos;
					if (typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
				}
			} else if (['polygon2','line','lineSegment'].indexOf(gridPath.type) > -1) {
				var i = draw._drag.pointIndex;
				if (isEqual(gridPath.pos[i],pos) === false) {
					gridPath.pos[i] = pos;
					if (typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
				}
			}
		},
		pointMoveStop: function (e) {
			updateMouse(e);
			draw._drag.dragStatus = 'stop';
			var obj = draw._drag.obj;
			if (typeof obj.interact.onchange === 'function') obj.interact.onchange(obj);
			delete draw.lockCursor;
			delete draw._drag;
			draw.cursorCanvas.style.cursor = draw.cursors.move1;
			drawCanvasPaths();
		}

	},
	getCoordAtPos: function (obj, pos) {
		if (un(pos)) pos = draw.mouse;
		var xCoord = getCoordX2(pos[0], obj.left, obj.width, obj.xMin, obj.xMax);
		var yCoord = getCoordY2(pos[1], obj.top, obj.height, obj.yMin, obj.yMax);
		return [xCoord, yCoord];
	},
	getPosOfCoord: function (obj, coord) {
		return getPosOfCoord(coord, obj);
	},
	setOneToOne:function() {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		var ysf = (obj.height * (obj.xMax - obj.xMin)) / (obj.width * (obj.yMax - obj.yMin));
		obj.yMin *= ysf;
		obj.yMax *= ysf;
		drawCanvasPaths();
	}
};
draw.arc = {
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		var x = center[0],
		y = center[1],
		r = 100;
		draw.path.push({
			obj: [{
					type: 'angle',
					isArc: true,
					b: [x, y],
					radius: r,
					angleC: 0,
					c: [x + r * Math.cos(0), y + r * Math.sin(0)],
					angleA: -Math.PI / 3,
					a: [x + r * Math.cos(-Math.PI / 3), y + r * Math.sin(-Math.PI / 3)],
					lineWidth: draw.thickness,
					lineColor: draw.color,
					fillColor: 'none',
					fill: true,
					drawLines: false,
					squareForRight: false,
					labelIfRight: true,
					label: ['']
				}
			],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (obj._highlight === true) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			//ctx.filter = "blur(4px)";
			ctx.strokeStyle = '#FF0';
			ctx.lineWidth = obj.thickness+14;
			ctx.beginPath();
			if (obj.clockwise == true) {
				ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.startAngle, obj.finAngle);
			} else {
				ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.finAngle, obj.startAngle);
			}
			ctx.stroke();
			ctx.beginPath();
			ctx.restore();
		}
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined') ctx.setLineDash(obj.dash);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		if (obj.clockwise == true) {
			ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.startAngle, obj.finAngle);
			obj._startPos = [obj.center[0]+obj.radius*Math.cos(obj.startAngle), obj.center[1]+obj.radius*Math.sin(obj.startAngle)];
			obj._finPos = [obj.center[0]+obj.radius*Math.cos(obj.finAngle), obj.center[1]+obj.radius*Math.sin(obj.finAngle)];
		} else {
			ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.finAngle, obj.startAngle);
			obj._finPos = [obj.center[0]+obj.radius*Math.cos(obj.startAngle), obj.center[1]+obj.radius*Math.sin(obj.startAngle)];
			obj._startPos = [obj.center[0]+obj.radius*Math.cos(obj.finAngle), obj.center[1]+obj.radius*Math.sin(obj.finAngle)];
		}
		if (un(obj._stroke) || obj._stroke === true) ctx.stroke();
		ctx.setLineDash([]);
		if (boolean(draw.drawArcCenter, false) == true) {
			ctx.fillStyle = obj.color;
			ctx.beginPath();
			ctx.moveTo(obj.center[0], obj.center[1]);
			ctx.arc(obj.center[0], obj.center[1], 5, 0, 2 * Math.PI);
			ctx.fill();
		}
		ctx.restore();
	},
	drawButton: function (ctx, size) {
		draw.arc.draw(ctx, {
			center: [0.5 * size, 0.2 * size],
			radius: 0.4 * size,
			startAngle: 0.25 * Math.PI,
			finAngle: 0.75 * Math.PI,
			clockwise: true,
			color: '#000',
			thickness: 0.04 * size
		});
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.b;
		obj.a[0] = center[0] + sf * (obj.a[0] - center[0]);
		obj.a[1] = center[1] + sf * (obj.a[1] - center[1]);
		obj.b[0] = center[0] + sf * (obj.b[0] - center[0]);
		obj.b[1] = center[1] + sf * (obj.b[1] - center[1]);
		obj.c[0] = center[0] + sf * (obj.c[0] - center[0]);
		obj.c[1] = center[1] + sf * (obj.c[1] - center[1]);
		if (!un(obj.radius))
			obj.radius *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	},
	getRect: function (obj) {
		var pos1 = [obj.center[0] + obj.radius * Math.cos(obj.startAngle), obj.center[1] + obj.radius * Math.sin(obj.startAngle)];
		var pos2 = [obj.center[0] + obj.radius * Math.cos(obj.finAngle), obj.center[1] + obj.radius * Math.sin(obj.finAngle)];
		obj._left = Math.min(pos1[0], pos2[0]);
		obj._right = Math.max(pos1[0], pos2[0]);
		obj._top = Math.min(pos1[1], pos2[1]);
		obj._bottom = Math.max(pos1[1], pos2[1]);
		if (doesArcIncludeAngle(obj, 0) == true) obj._right = obj.center[0] + obj.radius;
		if (doesArcIncludeAngle(obj, 0.5 * Math.PI) == true) obj._bottom = obj.center[1] + obj.radius;
		if (doesArcIncludeAngle(obj, Math.PI) == true) obj._left = obj.center[0] - obj.radius;
		if (doesArcIncludeAngle(obj, 1.5 * Math.PI) == true) obj._top = obj.center[1] - obj.radius;
		obj._width = obj._right - obj._left;
		obj._height = obj._bottom - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		obj.radius += dw;
	},
}
draw.sector = {
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		var x = center[0],
		y = center[1],
		r = 100;
		draw.path.push({
			obj: [{
					type: 'angle',
					b: [x, y],
					radius: r,
					angleC: 0,
					c: [x + r * Math.cos(0), y + r * Math.sin(0)],
					angleA: -Math.PI / 3,
					a: [x + r * Math.cos(-Math.PI / 3), y + r * Math.sin(-Math.PI / 3)],
					lineWidth: draw.thickness,
					lineColor: draw.color,
					fillColor: 'none',
					fill: true,
					drawLines: true,
					squareForRight: false,
					labelIfRight: true,
					label: ['']
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	drawButton: function (ctx, size) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.02 * size;
		ctx.beginPath();
		drawAngle({
			ctx: ctx,
			a: [0.6 * size, 0.6 * size - 0.357 * size],
			b: [0.25 * size, 0.6 * size],
			c: [0.75 * size, 0.6 * size],
			fill: false,
			radius: 0.5 * size,
			drawLines: true,
			lineWidth: 0.02 * size
		});
		ctx.stroke();
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.b;
		obj.a[0] = center[0] + sf * (obj.a[0] - center[0]);
		obj.a[1] = center[1] + sf * (obj.a[1] - center[1]);
		obj.b[0] = center[0] + sf * (obj.b[0] - center[0]);
		obj.b[1] = center[1] + sf * (obj.b[1] - center[1]);
		obj.c[0] = center[0] + sf * (obj.c[0] - center[0]);
		obj.c[1] = center[1] + sf * (obj.c[1] - center[1]);
		if (!un(obj.radius))
			obj.radius *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
}
draw.segment = {
	resizable: true,
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		var x = center[0],
		y = center[1],
		r = 100;
		draw.path.push({
			obj: [{
					type: 'segment',
					center: [x, y],
					radius: r,
					startAngle: 4,
					finAngle: 0,
					color: draw.color,
					thickness: draw.thickness,
					fillColor: '#FCF',
					clockwise: false
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		ctx.save();
		ctx.beginPath();
		obj._startPos = [obj.center[0] + obj.radius * Math.cos(obj.startAngle), obj.center[1] + obj.radius * Math.sin(obj.startAngle)];
		obj._finPos = [obj.center[0] + obj.radius * Math.cos(obj.finAngle), obj.center[1] + obj.radius * Math.sin(obj.finAngle)];
		if (obj.fillColor !== 'none') {
			if (obj.clockwise == true) {
				ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.startAngle, obj.finAngle);
				ctx.lineTo(obj._startPos[0], obj._startPos[1]);
			} else {
				ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.finAngle, obj.startAngle);
				ctx.lineTo(obj._finPos[0], obj._finPos[1]);
			}
			ctx.fillStyle = obj.fillColor;
			ctx.fill();
		}
		if (obj.color !== 'none') {
			ctx.strokeStyle = obj.color;
			ctx.lineWidth = obj.thickness;
			if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};
			if (typeof obj.dash !== 'undefined') ctx.setLineDash(obj.dash);
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';

			if (obj.clockwise == true) {
				ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.startAngle, obj.finAngle);
				ctx.lineTo(obj._startPos[0], obj._startPos[1]);
			} else {
				ctx.arc(obj.center[0], obj.center[1], obj.radius, obj.finAngle, obj.startAngle);
				ctx.lineTo(obj._finPos[0], obj._finPos[1]);
			}
			ctx.stroke();
			ctx.setLineDash([]);
		}
		if (boolean(draw.drawArcCenter, false) == true) {
			ctx.fillStyle = obj.color;
			ctx.beginPath();
			ctx.moveTo(obj.center[0], obj.center[1]);
			ctx.arc(obj.center[0], obj.center[1], 5, 0, 2 * Math.PI);
			ctx.fill();
		}
		if (!un(path) && draw.mode === 'edit' && path.selected == true && path.obj.length == 1) {
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			ctx.fillStyle = '#F00';
			ctx.beginPath();
			ctx.moveTo(obj._startPos[0] + 8, obj._startPos[1]);
			ctx.arc(obj._startPos[0], obj._startPos[1], 8, 0, 2 * Math.PI);
			ctx.moveTo(obj._finPos[0] + 8, obj._finPos[1]);
			ctx.arc(obj._finPos[0], obj._finPos[1], 8, 0, 2 * Math.PI);
			ctx.moveTo(obj.center[0] + 8, obj.center[1]);
			ctx.arc(obj.center[0], obj.center[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		}
		ctx.restore();
	},
	getRect: function (obj) {
		var pos1 = [obj.center[0] + obj.radius * Math.cos(obj.startAngle), obj.center[1] + obj.radius * Math.sin(obj.startAngle)];
		var pos2 = [obj.center[0] + obj.radius * Math.cos(obj.finAngle), obj.center[1] + obj.radius * Math.sin(obj.finAngle)];
		obj._left = Math.min(pos1[0], pos2[0]);
		obj._right = Math.max(pos1[0], pos2[0]);
		obj._top = Math.min(pos1[1], pos2[1]);
		obj._bottom = Math.max(pos1[1], pos2[1]);
		if (doesArcIncludeAngle(obj, 0) == true) obj._right = obj.center[0] + obj.radius;
		if (doesArcIncludeAngle(obj, 0.5 * Math.PI) == true) obj._bottom = obj.center[1] + obj.radius;
		if (doesArcIncludeAngle(obj, Math.PI) == true) obj._left = obj.center[0] - obj.radius;
		if (doesArcIncludeAngle(obj, 1.5 * Math.PI) == true) obj._top = obj.center[1] - obj.radius;
		obj._width = obj._right - obj._left;
		obj._height = obj._bottom - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		if (un(obj._startPos) || un (obj._finPos)) return [];
		return [{
				shape: 'circle',
				dims: [obj._startPos[0], obj._startPos[1], 10],
				cursor: draw.cursors.pointer,
				func: draw.segment.startPosDrag,
				obj: obj,
				angle: 'startAngle',
				pathNum: pathNum
			}, {
				shape: 'circle',
				dims: [obj._finPos[0], obj._finPos[1], 10],
				cursor: draw.cursors.pointer,
				func: draw.segment.startPosDrag,
				obj: obj,
				angle: 'finAngle',
				pathNum: pathNum
			}, {
				shape: 'circle',
				dims: [obj.center[0], obj.center[1], 10],
				cursor: draw.cursors.pointer,
				func: draw.segment.startPosDrag,
				obj: obj,
				angle: 'center',
				pathNum: pathNum
			}
		];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		obj.radius += dw;
	},

	getSnapPos: function (obj) {
		return [{
				type: 'point',
				pos: obj.center
			}, {
				type: 'point',
				pos: obj._startPos
			}, {
				type: 'point',
				pos: obj._finPos
			}
		];
	},
	setLineWidth: function (obj, lineWidth) {
		obj.thickness = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.thickness;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},

	startPosDrag: function () {
		changeDrawMode('segmentPosDrag');
		draw.drag = draw.currCursor;
		draw.animate(draw.segment.posMove,draw.segment.posStop,drawCanvasPaths);
		//addListenerMove(window, draw.segment.posMove);
		//addListenerEnd(window, draw.segment.posStop);
	},
	posMove: function (e) {
		updateMouse(e);
		var pos = clone(draw.mouse);
		var drag = draw.drag;
		var obj = drag.obj;
		if (drag.angle == 'startAngle') {
			obj.startAngle = getAngleTwoPoints(obj.center, pos);
		} else if (drag.angle == 'finAngle') {
			obj.finAngle = getAngleTwoPoints(obj.center, pos);
		} else if (drag.angle == 'center') {
			if (snapToObj2On == true)
				pos = snapToObj2(pos);
			obj.center = pos;
		}
		updateBorder(draw.path[drag.pathNum]);
		//drawSelectedPaths();
		//drawSelectCanvas();
	},
	posStop: function (e) {
		//removeListenerMove(window, draw.segment.posMove);
		//removeListenerEnd(window, draw.segment.posStop);
		changeDrawMode();
	},

	drawButton: function (ctx, size) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.02 * size;
		ctx.beginPath();

		draw.segment.draw(ctx, {
			type: 'segment',
			center: [0.5 * size, 0.5 * size],
			radius: 0.3 * size,
			startAngle: 4,
			finAngle: 0,
			color: '#000',
			thickness: 0.02 * size,
			fillColor: 'none',
			clockwise: false
		});
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		if (!un(obj.radius))
			obj.radius *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
}
draw.eraser = {
	add: function () {
		changeDrawMode('eraser');
	},
	draw: function (ctx, obj, path) {
		ctx.save();
		ctx.globalCompositeOperation = 'destination-out';
		ctx.strokeStyle = '#FFF';
		ctx.fillStyle = '#FFF';
		ctx.lineWidth = obj.thickness;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		var pos = [];
		for (var p = 0; p < obj.pos.length; p++) {
			pos[p] = [];
			pos[p][0] = roundToNearest(obj.pos[p][0], 0.01);
			pos[p][1] = roundToNearest(obj.pos[p][1], 0.01);
		}
		if (pos.length > 2) {
			ctx.beginPath();
			ctx.moveTo(pos[0][0], pos[0][1]);
			for (var p = 1; p < pos.length - 2; p++) {
				ctx.quadraticCurveTo(pos[p][0], pos[p][1], (pos[p][0] + pos[p + 1][0]) / 2, (pos[p][1] + pos[p + 1][1]) / 2);
			}
			if (pos.length > p + 1) ctx.quadraticCurveTo(pos[p][0], pos[p][1], pos[p + 1][0], pos[p + 1][1]);
			ctx.stroke();
		} else if (pos.length == 2) {
			ctx.beginPath();
			ctx.moveTo(pos[0][0], pos[0][1]);
			ctx.lineTo(pos[1][0], pos[1][1]);
			ctx.stroke();
		} else if (pos.length == 1) {
			ctx.beginPath();
			ctx.arc(pos[0][0], pos[0][1], ctx.lineWidth / 2, 0, 2 * Math.PI);
			ctx.fillStyle = ctx.strokeStyle;
			ctx.fill();
		}
		ctx.globalCompositeOperation = 'source-over';
		ctx.restore();
		
		if (obj._highlight === true) {
			var pos = [];
			for (var p = 0; p < obj.pos.length; p++) {
				pos[p] = [];
				pos[p][0] = roundToNearest(obj.pos[p][0], 0.01);
				pos[p][1] = roundToNearest(obj.pos[p][1], 0.01);
			}
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			//ctx.filter = "blur(4px)";
			ctx.strokeStyle = '#FF0';
			ctx.lineWidth = obj.thickness;
			if (pos.length > 2) {
				ctx.beginPath();
				ctx.moveTo(pos[0][0], pos[0][1]);
				for (var p = 1; p < pos.length - 2; p++) {
					ctx.quadraticCurveTo(pos[p][0], pos[p][1], (pos[p][0] + pos[p + 1][0]) / 2, (pos[p][1] + pos[p + 1][1]) / 2);
				}
				if (pos.length > p + 1) ctx.quadraticCurveTo(pos[p][0], pos[p][1], pos[p + 1][0], pos[p + 1][1]);
				ctx.stroke();
			} else if (pos.length == 2) {
				ctx.beginPath();
				ctx.moveTo(pos[0][0], pos[0][1]);
				ctx.lineTo(pos[1][0], pos[1][1]);
				ctx.stroke();
			} else if (pos.length == 1) {
				ctx.beginPath();
				ctx.arc(pos[0][0], pos[0][1], ctx.lineWidth / 2, 0, 2 * Math.PI);
				ctx.fillStyle = ctx.strokeStyle;
				ctx.fill();
			}
			ctx.beginPath();
			ctx.restore();
		}
	},
	drawErasePath:function(ctx, obj) {
		ctx.save();
		ctx.globalCompositeOperation = 'destination-out';
		ctx.strokeStyle = '#FFF';
		ctx.fillStyle = '#FFF';
		ctx.lineWidth = obj.thickness;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		var pos = [];
		for (var p = 0; p < obj.pos.length; p++) {
			pos[p] = [];
			pos[p][0] = roundToNearest(obj.pos[p][0], 0.01);
			pos[p][1] = roundToNearest(obj.pos[p][1], 0.01);
		}
		if (pos.length > 2) {
			ctx.beginPath();
			ctx.moveTo(pos[0][0], pos[0][1]);
			for (var p = 1; p < pos.length - 2; p++) {
				ctx.quadraticCurveTo(pos[p][0], pos[p][1], (pos[p][0] + pos[p + 1][0]) / 2, (pos[p][1] + pos[p + 1][1]) / 2);
			}
			if (pos.length > p + 1) ctx.quadraticCurveTo(pos[p][0], pos[p][1], pos[p + 1][0], pos[p + 1][1]);
			ctx.stroke();
		} else if (pos.length == 2) {
			ctx.beginPath();
			ctx.moveTo(pos[0][0], pos[0][1]);
			ctx.lineTo(pos[1][0], pos[1][1]);
			ctx.stroke();
		} else if (pos.length == 1) {
			ctx.beginPath();
			ctx.arc(pos[0][0], pos[0][1], ctx.lineWidth / 2, 0, 2 * Math.PI);
			ctx.fillStyle = ctx.strokeStyle;
			ctx.fill();
		}
		ctx.globalCompositeOperation = 'source-over';
		ctx.restore();
	},
	getRect: function (obj) {
		obj._left = obj.pos[0][0];
		obj._top = obj.pos[0][1];
		obj._right = obj.pos[0][0];
		obj._bottom = obj.pos[0][1];
		for (var j = 1; j < obj.pos.length; j++) {
			obj._left = Math.min(obj._left, obj.pos[j][0]);
			obj._top = Math.min(obj._top, obj.pos[j][1]);
			obj._right = Math.max(obj._right, obj.pos[j][0]);
			obj._bottom = Math.max(obj._bottom, obj.pos[j][1]);
		}
		obj._width = obj._right - obj._left;
		obj._height = obj._bottom - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
	}
}
draw.pen = {
	add: function () {
		changeDrawMode('pen');
	},
	draw: function (ctx, obj, path) {
		var pos = [];
		for (var p = 0; p < obj.pos.length; p++) {
			pos[p] = [];
			pos[p][0] = roundToNearest(obj.pos[p][0], 0.01);
			pos[p][1] = roundToNearest(obj.pos[p][1], 0.01);
		}
		if (obj._highlight === true) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			//ctx.filter = "blur(4px)";
			ctx.strokeStyle = '#FF0';
			ctx.lineWidth = obj.thickness+14;
			if (pos.length > 2) {
				ctx.beginPath();
				ctx.moveTo(pos[0][0], pos[0][1]);
				for (var p = 1; p < pos.length - 2; p++) {
					ctx.quadraticCurveTo(pos[p][0], pos[p][1], (pos[p][0] + pos[p + 1][0]) / 2, (pos[p][1] + pos[p + 1][1]) / 2);
				}
				if (pos.length > p + 1) ctx.quadraticCurveTo(pos[p][0], pos[p][1], pos[p + 1][0], pos[p + 1][1]);
				ctx.stroke();
			} else if (pos.length == 2) {
				ctx.beginPath();
				ctx.moveTo(pos[0][0], pos[0][1]);
				ctx.lineTo(pos[1][0], pos[1][1]);
				ctx.stroke();
			} else if (pos.length == 1) {
				ctx.beginPath();
				ctx.arc(pos[0][0], pos[0][1], ctx.lineWidth / 2, 0, 2 * Math.PI);
				ctx.fillStyle = ctx.strokeStyle;
				ctx.fill();
			}
			ctx.beginPath();
			ctx.restore();
		}
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined') ctx.setLineDash(obj.dash);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		
		if (pos.length > 2) {
			ctx.beginPath();
			ctx.moveTo(pos[0][0], pos[0][1]);
			for (var p = 1; p < pos.length - 2; p++) {
				ctx.quadraticCurveTo(pos[p][0], pos[p][1], (pos[p][0] + pos[p + 1][0]) / 2, (pos[p][1] + pos[p + 1][1]) / 2);
			}
			if (pos.length > p + 1) ctx.quadraticCurveTo(pos[p][0], pos[p][1], pos[p + 1][0], pos[p + 1][1]);
			ctx.stroke();
		} else if (pos.length == 2) {
			ctx.beginPath();
			ctx.moveTo(pos[0][0], pos[0][1]);
			ctx.lineTo(pos[1][0], pos[1][1]);
			ctx.stroke();
		} else if (pos.length == 1) {
			ctx.beginPath();
			ctx.arc(pos[0][0], pos[0][1], ctx.lineWidth / 2, 0, 2 * Math.PI);
			ctx.fillStyle = ctx.strokeStyle;
			ctx.fill();
		}
		ctx.setLineDash([]);
	},
	getRect: function (obj) {
		obj._left = obj.pos[0][0];
		obj._top = obj.pos[0][1];
		obj._right = obj.pos[0][0];
		obj._bottom = obj.pos[0][1];
		for (var j = 1; j < obj.pos.length; j++) {
			obj._left = Math.min(obj._left, obj.pos[j][0]);
			obj._top = Math.min(obj._top, obj.pos[j][1]);
			obj._right = Math.max(obj._right, obj.pos[j][0]);
			obj._bottom = Math.max(obj._bottom, obj.pos[j][1]);
		}
		obj._width = obj._right - obj._left;
		obj._height = obj._bottom - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	drawButton: function (ctx, size) {
		ctx.fillStyle = '#000';
		ctx.translate(0.5 * size, 0.5 * size);
		ctx.rotate(Math.PI / 4);
		ctx.fillRect(-5, -11, 10, 20);
		ctx.fillRect(-5, -18, 10, 5);
		ctx.beginPath();
		ctx.moveTo(-5, 11);
		ctx.lineTo(0, 18);
		ctx.lineTo(5, 11);
		ctx.lineTo(-5, 11);
		ctx.fill();
		ctx.rotate(-Math.PI / 4);
		ctx.translate(-0.5 * size, -0.5 * size);
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.pos[0];
		for (var p = 0; p < obj.pos.length; p++) {
			obj.pos[p][0] = center[0] + sf * (obj.pos[p][0] - center[0]);
			obj.pos[p][1] = center[1] + sf * (obj.pos[p][1] - center[1]);
		}
		if (!un(obj.thickness))
			obj.thickness *= sf;
	}
}
draw.line = {
	keyPoints:['startPos','finPos'],
	add: function () {
		changeDrawMode('line');
	},
	draw: function (ctx, obj, path) {
		if (un(obj.finPos) || typeof obj.finPos[0] !== 'number' || typeof obj.finPos[1] !== 'number') return;
		if (obj._highlight === true) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			//ctx.filter = "blur(4px)";
			ctx.strokeStyle = '#FF0';
			ctx.lineWidth = obj.thickness+14;
			ctx.beginPath();
			ctx.moveTo(obj.startPos[0], obj.startPos[1]);
			ctx.lineTo(obj.finPos[0], obj.finPos[1]);
			ctx.stroke();
			ctx.beginPath();
			ctx.restore();
		}
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined') ctx.setLineDash(obj.dash);
		var lineCap = !un(obj.lineCap) ? obj.lineCap : 'round';
		ctx.lineCap = lineCap;
		ctx.lineJoin = lineCap;
		//console.log(ctx.strokeStyle,ctx.lineWidth,obj.startPos,obj.finPos,ctx.getTransform());
		ctx.beginPath();
		ctx.moveTo(obj.startPos[0], obj.startPos[1]);
		ctx.lineTo(obj.finPos[0], obj.finPos[1]);
		ctx.stroke();

		if (obj.endStart == 'open') {
			drawArrow({
				context: ctx,
				startX: obj.finPos[0],
				startY: obj.finPos[1],
				finX: obj.startPos[0],
				finY: obj.startPos[1],
				arrowLength: obj.endStartSize,
				color: obj.color,
				lineWidth: obj.thickness,
				arrowLineWidth: obj.thickness,
				showLine:false
			});
		}
		if (obj.endStart == 'closed') {
			drawArrow({
				context: ctx,
				startX: obj.finPos[0],
				startY: obj.finPos[1],
				finX: obj.startPos[0],
				finY: obj.startPos[1],
				arrowLength: obj.endStartSize,
				color: obj.color,
				lineWidth: obj.thickness,
				arrowLineWidth: obj.thickness,
				fillArrow: true,
				showLine:false
			});
		}

		if (obj.endMid == 'dash') {
			drawDash(ctx, obj.startPos[0], obj.startPos[1], obj.finPos[0], obj.finPos[1], 8);
		}
		if (obj.endMid == 'dash2') {
			drawDoubleDash(ctx, obj.startPos[0], obj.startPos[1], obj.finPos[0], obj.finPos[1], 8);
		}
		if (obj.endMid == 'open') {
			drawParallelArrow({
				context: ctx,
				startX: obj.startPos[0],
				startY: obj.startPos[1],
				finX: obj.finPos[0],
				finY: obj.finPos[1],
				arrowLength: obj.endMidSize,
				color: obj.color,
				lineWidth: obj.thickness,
				showLine:false
			});
		}
		if (obj.endMid == 'open2') {
			drawParallelArrow({
				context: ctx,
				startX: obj.startPos[0],
				startY: obj.startPos[1],
				finX: obj.finPos[0],
				finY: obj.finPos[1],
				arrowLength: obj.endMidSize,
				color: obj.color,
				lineWidth: obj.thickness,
				numOfArrows: 2,
				showLine:false
			});
		}

		if (obj.endFin == 'open') {
			drawArrow({
				context: ctx,
				startX: obj.startPos[0],
				startY: obj.startPos[1],
				finX: obj.finPos[0],
				finY: obj.finPos[1],
				arrowLength: obj.endFinSize,
				color: obj.color,
				lineWidth: obj.thickness,
				arrowLineWidth: obj.thickness,
				showLine:false
			});
		}
		if (obj.endFin == 'closed') {
			drawArrow({
				context: ctx,
				startX: obj.startPos[0],
				startY: obj.startPos[1],
				finX: obj.finPos[0],
				finY: obj.finPos[1],
				arrowLength: obj.endFinSize,
				color: obj.color,
				lineWidth: obj.thickness,
				arrowLineWidth: obj.thickness,
				fillArrow: true,
				showLine:false
			});
		}
		ctx.setLineDash([]);

		if (draw.mode === 'edit' && path.obj.length == 1 && path.selected == true) {
			ctx.save();
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';
			ctx.fillStyle = typeof obj.gradient === 'number' ? '#0FF' : '#F00';
			ctx.beginPath();
			ctx.arc(obj.startPos[0], obj.startPos[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(obj.finPos[0], obj.finPos[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		}

		return [
			Math.min(obj.startPos[0], obj.finPos[0]) - 10,
			Math.min(obj.startPos[1], obj.finPos[1]) - 10,
			Math.abs(obj.startPos[0] - obj.finPos[0]) + 20,
			Math.abs(obj.startPos[1] - obj.finPos[1]) + 20,
		];
	},
	getRect: function (obj) {
		if (!un(obj.startPos) && !un(obj.finPos)) {
			obj._left = Math.min(obj.startPos[0], obj.finPos[0]);
			obj._top = Math.min(obj.startPos[1], obj.finPos[1]);
			obj._width = Math.max(obj.startPos[0], obj.finPos[0]) - obj._left;
			obj._height = Math.max(obj.startPos[1], obj.finPos[1]) - obj._top;
			return [obj._left, obj._top, obj._width, obj._height];
		}
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		pos.push({
			shape: 'circle',
			dims: [obj.startPos[0], obj.startPos[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.line.startDragStartPos,
			pathNum: pathNum
		});
		pos.push({
			shape: 'circle',
			dims: [obj.finPos[0], obj.finPos[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.line.startDragFinPos,
			pathNum: pathNum
		});
		return pos;
	},
	getButtons: function (x1, y1, x2, y2, pathNum, path) {
		var buttons = [];
		buttons.push({
			buttonType: 'line-toggleGradient',
			shape: 'rect',
			dims: [x1 + 20, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.line.toggleGradient,
			pathNum: pathNum,
			path:path,
			draw: function (path, ctx, l, t, w, h) {
				var obj = path.obj[0];
				ctx.fillStyle = typeof obj.gradient === 'number' ? colorA('#9FF', 0.5) : colorA('#F99', 0.5);
				ctx.fillRect(l, t, w, h);
				var x = l+0.5*w;
				var y = t+0.5*h;
				var r = 0.4*Math.min(w,h);
				if (typeof obj.gradient === 'number') {
					var v = vector.setMagnitude([1,obj.gradient],r)
				} else {
					var v = vector.setMagnitude(vector.getVectorAB(obj.startPos,obj.finPos),r);
				}
				ctx.beginPath();
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.moveTo(x+v[0], y+v[1]);
				ctx.lineTo(x-v[0], y-v[1]);
				ctx.stroke();
			}
		});
		buttons.push({
			buttonType: 'line-rotate',
			shape: 'rect',
			dims: [x1 + 40, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.line.rotate,
			pathNum: pathNum,
			path:path,
			draw: function (path, ctx, l, t, w, h) {
				var obj = path.obj[0];
				ctx.fillStyle = colorA('#FF0', 0.5);
				ctx.fillRect(l, t, w, h);
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],text:['90'+degrees],fontSize:14});
			}
		});
		return buttons;
	},
	startDragStartPos: function () {
		changeDrawMode('lineStart');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.line.posMove,draw.line.posStop,drawCanvasPaths);
	},
	startDragFinPos: function () {
		changeDrawMode('lineFin');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.line.posMove,draw.line.posStop,drawCanvasPaths);
	},
	posMove: function (e) {
		updateMouse(e);
		var x = draw.mouse[0];
		var y = draw.mouse[1];
		var pathNum = draw.currPathNum;
		var obj = draw.path[pathNum].obj[0];
		if (draw.drawMode == 'lineStart') {
			if (!un(obj.gradient)) {
				var pos = (snapToObj2On || draw.snapLinesTogether) ? snapToObj2([x, y], pathNum) : [x,y];
				if (pos[0] === x && pos[1] === y) {
					if (obj.gradient === Infinity) {
						obj.startPos = [obj.finPos[0], y];
					} else {
						var lambda = ((x - obj.finPos[0]) + (y - obj.finPos[1]) * obj.gradient) / (1 + Math.pow(obj.gradient, 2));
						obj.startPos = [obj.finPos[0] + lambda, obj.finPos[1] + lambda * obj.gradient];
					}
				} else { // snap and maintain gradient
					var v = vector.getVectorAB(obj.startPos,obj.finPos);
					obj.startPos = pos;
					obj.finPos = vector.addVectors(pos,v);
				}
			} else if (shiftOn) {
				if (Math.abs(obj.finPos[0] - x) < Math.abs(obj.finPos[1] - y)) {
					obj.startPos = [obj.finPos[0], y];
				} else {
					obj.startPos = [x, obj.finPos[1]];
				}
			} else if (snapToObj2On || draw.snapLinesTogether) {
				obj.startPos = snapToObj2([x, y], pathNum);
			} else {
				obj.startPos = [x, y];
			}
		} else if (draw.drawMode == 'lineFin' || draw.drawMode == 'line') {
			if (!un(obj.gradient)) {
				var pos = (snapToObj2On || draw.snapLinesTogether) ? snapToObj2([x, y], pathNum) : [x,y];
				if (pos[0] === x && pos[1] === y) {
					if (obj.gradient === Infinity) {
						obj.finPos = [obj.startPos[0], y];
					} else {
						var lambda = ((x - obj.startPos[0]) + (y - obj.startPos[1]) * obj.gradient) / (1 + Math.pow(obj.gradient, 2));
						obj.finPos = [obj.startPos[0] + lambda, obj.startPos[1] + lambda * obj.gradient];
					}
				} else { // snap and maintain gradient
					var v = vector.getVectorAB(obj.finPos,obj.startPos);
					obj.finPos = pos;
					obj.startPos = vector.addVectors(pos,v);
				}
			} else if (shiftOn) {
				if (Math.abs(obj.startPos[0] - x) < Math.abs(obj.startPos[1] - y)) {
					obj.finPos = [obj.startPos[0], y];
				} else {
					obj.finPos = [x, obj.startPos[1]];
				}
			} else if (snapToObj2On || draw.snapLinesTogether) {
				obj.finPos = snapToObj2([x, y], pathNum);
			} else {
				obj.finPos = [x, y];
			}
		}
		updateBorder(draw.path[pathNum]);
		//drawSelectedPaths();
		//drawSelectCanvas();
		//drawSelectCanvas2();
	},
	posStop: function (e) {
		var pathNum = draw.currPathNum;
		var obj = draw.path[pathNum].obj[0];
		updateBorder(draw.path[pathNum]);
		drawCanvasPaths();
		//removeListenerMove(window, draw.line.posMove);
		//removeListenerEnd(window, draw.line.posStop);
		changeDrawMode();
	},
	drawButton: function (ctx, size) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = size * 0.04;
		ctx.beginPath();
		ctx.arc(0.2 * size, 0.4 * size, 0.06 * size, 0, 2 * Math.PI);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(0.2 * size, 0.4 * size);
		ctx.lineTo(0.8 * size, 0.6 * size);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(0.8 * size, 0.6 * size, 0.06 * size, 0, 2 * Math.PI);
		ctx.fill();
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.startPos;
		obj.startPos[0] = center[0] + sf * (obj.startPos[0] - center[0]);
		obj.startPos[1] = center[1] + sf * (obj.startPos[1] - center[1]);
		obj.finPos[0] = center[0] + sf * (obj.finPos[0] - center[0]);
		obj.finPos[1] = center[1] + sf * (obj.finPos[1] - center[1]);
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.endStartSize))
			obj.endStartSize *= sf;
		if (!un(obj.endMidSize))
			obj.endMidSize *= sf;
		if (!un(obj.endFinSize))
			obj.endFinSize *= sf;
		if (!un(obj.dash)) {
			if (!un(obj.dash[0]))
				obj.dash[0] *= sf;
			if (!un(obj.dash[1]))
				obj.dash[1] *= sf;
		}
	},
	getControlPanel: function (obj) {
		var elements = [{
				name: 'Style',
				type: 'style'
			}, {
				name: 'Dash',
				type: 'increment',
				increment: function (obj, value) {
					if (un(obj.dash))
						obj.dash = [0, 0];
					var val = Math.max(0, Math.min(obj.dash[0] + value * 5, 25));
					if (val == 0) {
						delete obj.dash;
					} else {
						obj.dash = [val, val];
					}
				}
			}, {
				name: 'Line Decoration',
				type: 'lineDec',
				obj: obj
			}
		];
		return {
			obj: obj,
			elements: elements
		};
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.startPos[0] += dl;
		obj.startPos[1] += dt;
		obj.finPos[0] += dl;
		obj.finPos[1] += dt;
	},
	setGradient: function(obj) {
		if (un(obj)) obj = sel();
		if (obj.type !== 'line' || un(obj.finPos) || typeof obj.finPos[0] !== 'number' || typeof obj.finPos[1] !== 'number') return;
		var m = vector.getVectorAB(obj.startPos,obj.finPos);
		if (m[0] === 0) {
			obj.gradient = Infinity;
		} else {
			obj.gradient = m[1]/m[0];
		}
	},
	unsetGradient: function(obj) {
		delete obj.gradient;
	},
	toggleGradient: function() {
		var obj = draw.currCursor.path.obj[0];
		if (obj.type !== 'line') return;
		if (typeof obj.gradient === 'number') {
			draw.line.unsetGradient(obj);
		} else {
			draw.line.setGradient(obj);
		}
		updateBorder(draw.currCursor.path);
		drawCanvasPaths();
	},
	rotate: function() {
		var obj = draw.currCursor.path.obj[0];
		if (obj.type !== 'line' || un(obj.finPos) || typeof obj.finPos[0] !== 'number' || typeof obj.finPos[1] !== 'number') return;
		var mid = getMidpoint(obj.startPos,obj.finPos);
		var v1 = vector.getVectorAB(obj.startPos,obj.finPos);
		var v2 = rotateVector(v1,Math.PI/2);
		obj.startPos = [mid[0]-v2[0]/2,mid[1]-v2[1]/2];
		obj.finPos = [mid[0]+v2[0]/2,mid[1]+v2[1]/2];
		if (typeof obj.gradient === 'number') {
			draw.line.setGradient(obj);
		}
		updateBorder(draw.currCursor.path);
		drawCanvasPaths();
	},
	positionLabel: function(line,txt,spacing) {
		//draw.line.positionLabel([[50,100],[500,300]],{type:'text2',text:['label'],rect:[100,100,200,300]});
		var minRect = txt.rect;
		if (typeof txt.box !== 'object' || txt.box.type !== 'loose') {
			var txt2 = clone(txt);
			txt2.ctx = draw.hiddenCanvas.ctx;
			txt2.measureOnly = true;
			txt2.minTightWidth = 1;
			txt2.minTightHeight = 1;
			delete txt2.box;
			var minRect = text(txt2).tightRect;
		}
		if (line instanceof Array === false) line = [line.startPos,line.finPos];
		var v0 = vector.getVectorAB(line[0], line[1]);
		var p0 = [(line[0][0] + line[1][0]) / 2, (line[0][1] + line[1][1]) / 2];
		var v1 = getPerpVector(v0,-1);
		var a = Math.atan(v1[1] / v1[0]);
		if (typeof spacing !== 'number') spacing = 12;
		var mag = vector.getMagnitude([0.5*minRect[2] * Math.cos(a), 0.5*minRect[3] * Math.sin(a)]) + spacing;
		v1 = setVectorMag(v1, mag);
		var textCenter = vector.addVectors(p0, v1);
		txt.rect[0] = textCenter[0] - 0.5 * txt.rect[2];
		txt.rect[1] = textCenter[1] - 0.5 * txt.rect[3];
	},
	setLength:function(line,len,cm) {
		// '1cm' = 51.2 units
		if (cm === true) len *= 51.2;
		var m = vector.getVectorAB(line.startPos,line.finPos);
		var v = vector.setMagnitude(m,len);
		line.finPos = vector.addVectors(line.startPos,v);
		if (!un(line._path)) updateBorder(line._path);
		drawCanvasPaths();
	}
}
draw.curve = {
	add: function (x, y, r) {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		if (un(x)) x = center[0];
		if (un(y)) y = center[1];
		if (un(r)) r = 100;
		draw.path.push({
			obj: [{
					type: 'curve',
					thickness: draw.thickness,
					startPos: [x - r * 0.7, y - 0.5 * r],
					finPos: [x + r * 0.7, y - 0.5 * r],
					controlPos: [x, y + r],
					color: draw.color,
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined') ctx.setLineDash(obj.dash);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(obj.startPos[0], obj.startPos[1]);
		ctx.quadraticCurveTo(obj.controlPos[0], obj.controlPos[1], obj.finPos[0], obj.finPos[1]);
		ctx.stroke();

		obj.mid1 = midpoint(obj.startPos[0], obj.startPos[1], obj.controlPos[0], obj.controlPos[1]);
		obj.mid2 = midpoint(obj.finPos[0], obj.finPos[1], obj.controlPos[0], obj.controlPos[1]);
		obj.vertex = midpoint(obj.mid1[0], obj.mid1[1], obj.mid2[0], obj.mid2[1]);

		obj.points = getBezierPoints([obj.startPos[0], obj.startPos[1]], [obj.controlPos[0], obj.controlPos[1]], [obj.finPos[0], obj.finPos[1]], 30);

		if (obj.endStart == 'open') {
			drawArrow({
				context: ctx,
				startX: obj.controlPos[0],
				startY: obj.controlPos[1],
				finX: obj.startPos[0],
				finY: obj.startPos[1],
				arrowLength: obj.endStartSize,
				color: obj.color,
				lineWidth: 0,
				arrowLineWidth: obj.thickness,
				showLine: false
			});
		}
		if (obj.endStart == 'closed') {
			drawArrow({
				context: ctx,
				startX: obj.controlPos[0],
				startY: obj.controlPos[1],
				finX: obj.startPos[0],
				finY: obj.startPos[1],
				arrowLength: obj.endStartSize,
				color: obj.color,
				lineWidth: 0,
				arrowLineWidth: obj.thickness,
				fillArrow: true,
				showLine: false
			});
		}

		if (obj.endMid == 'open') {
			drawParallelArrow({
				context: ctx,
				startX: obj.mid1[0],
				startY: obj.mid1[1],
				finX: obj.mid2[0],
				finY: obj.mid2[1],
				arrowLength: obj.endMidSize,
				lineWidth: obj.thickness
			});
		}

		if (obj.endFin == 'open') {
			drawArrow({
				context: ctx,
				startX: obj.controlPos[0],
				startY: obj.controlPos[1],
				finX: obj.finPos[0],
				finY: obj.finPos[1],
				arrowLength: obj.endFinSize,
				color: obj.color,
				lineWidth: 0,
				arrowLineWidth: obj.thickness,
				showLine: false
			});
		}
		if (obj.endFin == 'closed') {
			drawArrow({
				context: ctx,
				startX: obj.controlPos[0],
				startY: obj.controlPos[1],
				finX: obj.finPos[0],
				finY: obj.finPos[1],
				arrowLength: obj.endFinSize,
				color: obj.color,
				lineWidth: 0,
				arrowLineWidth: obj.thickness,
				fillArrow: true,
				showLine: false
			});
		}
		ctx.setLineDash([]);

		if (draw.mode === 'edit' && path.obj.length == 1 && path.selected == true) { // if selected
			ctx.save();
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';
			ctx.fillStyle = '#F00';
			ctx.beginPath();
			ctx.arc(obj.startPos[0], obj.startPos[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(obj.finPos[0], obj.finPos[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(obj.controlPos[0], obj.controlPos[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		}
	},
	getRect: function (obj) {
		obj._left = Math.min(obj.startPos[0], obj.finPos[0], obj.controlPos[0]);
		obj._top = Math.min(obj.startPos[1], obj.finPos[1], obj.controlPos[1]);
		obj._width = Math.max(obj.startPos[0], obj.finPos[0], obj.controlPos[0]) - obj._left;
		obj._height = Math.max(obj.startPos[1], obj.finPos[1], obj.controlPos[1]) - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		pos.push({
			shape: 'circle',
			dims: [obj.startPos[0], obj.startPos[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.curve.startPosStartDrag,
			pathNum: pathNum
		});
		pos.push({
			shape: 'circle',
			dims: [obj.finPos[0], obj.finPos[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.curve.finPosStartDrag,
			pathNum: pathNum
		});
		pos.push({
			shape: 'circle',
			dims: [obj.controlPos[0], obj.controlPos[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.curve.controlPosStartDrag,
			pathNum: pathNum
		});
		return pos;
	},
	startPosStartDrag: function () {
		changeDrawMode('curveStart');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.curve.posMove,draw.curve.posStop,drawCanvasPaths);
		//addListenerMove(window, draw.curve.posMove);
		//addListenerEnd(window, draw.curve.posStop);
	},
	finPosStartDrag: function () {
		changeDrawMode('curveFin');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.curve.posMove,draw.curve.posStop,drawCanvasPaths);
		//addListenerMove(window, draw.curve.posMove);
		//addListenerEnd(window, draw.curve.posStop);
	},
	controlPosStartDrag: function () {
		changeDrawMode('curveControl');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.curve.posMove,draw.curve.posStop,drawCanvasPaths);
		//addListenerMove(window, draw.curve.posMove);
		//addListenerEnd(window, draw.curve.posStop);
	},
	posMove: function (e) {
		updateMouse(e);
		var x = draw.mouse[0];
		var y = draw.mouse[1];
		var pathNum = draw.currPathNum;
		var obj = draw.path[pathNum].obj[0];

		var pos = [x, y];
		if (snapToObj2On || draw.snapLinesTogether) {
			var pos = snapToObj2([x, y], pathNum);
		}

		if (draw.drawMode == 'curveStart' || draw.drawMode == 'curve2Start') {
			obj.startPos[0] = pos[0];
			obj.startPos[1] = pos[1];
			if (shiftOn) {
				var dx = pos[0] - obj.finPos[0];
				var dy = pos[1] - obj.finPos[1];
				if (Math.abs(dx) < Math.abs(dy)) {
					if (Math.abs(dx) < draw.snapTolerance) {
						obj.startPos[0] = obj.finPos[0];
					}
				} else {
					if (Math.abs(dy) < draw.snapTolerance) {
						obj.startPos[1] = obj.finPos[1];
					}
				}
			}
		} else if (draw.drawMode == 'curveFin' || draw.drawMode == 'curve2Fin') {
			obj.finPos[0] = pos[0];
			obj.finPos[1] = pos[1];
			if (shiftOn) {
				var dx = pos[0] - obj.startPos[0];
				var dy = pos[1] - obj.startPos[1];
				if (Math.abs(dx) < Math.abs(dy)) {
					if (Math.abs(dx) < draw.snapTolerance) {
						obj.finPos[0] = obj.startPos[0];
					}
				} else {
					if (Math.abs(dy) < draw.snapTolerance) {
						obj.finPos[1] = obj.startPos[1];
					}
				}
			}
		} else if (draw.drawMode == 'curveControl') {
			obj.controlPos[0] = pos[0];
			obj.controlPos[1] = pos[1];
			if (shiftOn) {
				var mx = (obj.startPos[0]+obj.finPos[0])/2;
				var my = (obj.startPos[1]+obj.finPos[1])/2;
				var dx = pos[0] - mx;
				var dy = pos[1] - my;
				if (Math.abs(dx) < Math.abs(dy)) {
					if (Math.abs(dx) < draw.snapTolerance) {
						obj.controlPos[0] = mx;
					}
				} else {
					if (Math.abs(dy) < draw.snapTolerance) {
						obj.controlPos[1] = my;
					}
				}
			}
		} else if (draw.drawMode == 'curve2Control1') {
			obj.controlPos1[0] = pos[0];
			obj.controlPos1[1] = pos[1];
		} else if (draw.drawMode == 'curve2Control2') {
			obj.controlPos2[0] = pos[0];
			obj.controlPos2[1] = pos[1];
		}
		updateBorder(draw.path[pathNum]);
		//drawCanvasPaths();
	},
	posStop: function (e) {
		var pathNum = draw.currPathNum;
		var obj = draw.path[pathNum].obj[0];
		//removeListenerMove(window, draw.curve.posMove);
		//removeListenerEnd(window, draw.curve.posStop);
		changeDrawMode();
	},
	drawButton: function (ctx, size) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = size * 0.04;
		var p1 = [0.2 * size, 0.2 * size];
		var p2 = [0.8 * size, 0.2 * size];
		var c = [0.3 * size, 0.7 * size];
		ctx.beginPath();
		ctx.moveTo(p1[0], p1[1]);
		ctx.quadraticCurveTo(c[0], c[1], p2[0], p2[1]);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = '#666';
		ctx.lineWidth = size * 0.01;
		ctx.setLineDash([size * 0.08, size * 0.08]);
		ctx.beginPath();
		ctx.moveTo(p1[0], p1[1]);
		ctx.lineTo(c[0], c[1]);
		ctx.lineTo(p2[0], p2[1]);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.beginPath();
		ctx.fillStyle = '#F00';
		ctx.arc(c[0], c[1], size * 0.04, 0, 2 * Math.PI);
		ctx.fill();
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.startPos;
		obj.startPos[0] = center[0] + sf * (obj.startPos[0] - center[0]);
		obj.startPos[1] = center[1] + sf * (obj.startPos[1] - center[1]);
		obj.finPos[0] = center[0] + sf * (obj.finPos[0] - center[0]);
		obj.finPos[1] = center[1] + sf * (obj.finPos[1] - center[1]);
		obj.controlPos[0] = center[0] + sf * (obj.controlPos[0] - center[0]);
		obj.controlPos[1] = center[1] + sf * (obj.controlPos[1] - center[1]);
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.dash)) {
			if (!un(obj.dash[0]))
				obj.dash[0] *= sf;
			if (!un(obj.dash[1]))
				obj.dash[1] *= sf;
		}
	},
	getControlPanel: function (obj) {
		var elements = [{
				name: 'Style',
				type: 'style'
			}, {
				name: 'Arrows',
				type: 'curveDec',
				obj: obj
			}
		];
		return {
			obj: obj,
			elements: elements
		};
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.startPos[0] += dl;
		obj.startPos[1] += dt;
		obj.finPos[0] += dl;
		obj.finPos[1] += dt;
		obj.controlPos[0] += dl;
		obj.controlPos[1] += dt;
	}
}
draw.curve2 = {
	add: function (x, y, r) {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		if (un(x)) x = center[0];
		if (un(y)) y = center[1];
		if (un(r)) r = 100;
		draw.path.push({
			obj: [{
					type: 'curve2',
					thickness: 2,
					startPos: [x - r * 0.7, y - 0.5 * r],
					finPos: [x + r * 0.7, y - 0.5 * r],
					controlPos1: [x - r * 0.25, y + r],
					controlPos2: [x + r * 0.25, y + r],
					color: draw.color,
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function')
			ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined')
			ctx.setLineDash(obj.dash);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(obj.startPos[0], obj.startPos[1]);
		ctx.bezierCurveTo(obj.controlPos1[0], obj.controlPos1[1], obj.controlPos2[0], obj.controlPos2[1], obj.finPos[0], obj.finPos[1]);
		ctx.stroke();
		ctx.setLineDash([]);

		if (draw.mode === 'edit' && path.obj.length == 1 && path.selected == true) { // if selected
			ctx.save();
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';
			ctx.fillStyle = '#F00';
			ctx.beginPath();
			ctx.arc(obj.startPos[0], obj.startPos[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(obj.finPos[0], obj.finPos[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(obj.controlPos1[0], obj.controlPos1[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(obj.controlPos2[0], obj.controlPos2[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		}
	},
	getRect: function (obj) {
		obj._left = Math.min(obj.startPos[0], obj.finPos[0], obj.controlPos1[0], obj.controlPos2[0]);
		obj._top = Math.min(obj.startPos[1], obj.finPos[1], obj.controlPos1[1], obj.controlPos2[1]);
		obj._width = Math.max(obj.startPos[0], obj.finPos[0], obj.controlPos1[0], obj.controlPos2[0]) - obj._left;
		obj._height = Math.max(obj.startPos[1], obj.finPos[1], obj.controlPos1[1], obj.controlPos2[1]) - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		pos.push({
			shape: 'circle',
			dims: [obj.startPos[0], obj.startPos[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.curve2.startPosStartDrag,
			pathNum: pathNum
		});
		pos.push({
			shape: 'circle',
			dims: [obj.finPos[0], obj.finPos[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.curve2.finPosStartDrag,
			pathNum: pathNum
		});
		pos.push({
			shape: 'circle',
			dims: [obj.controlPos1[0], obj.controlPos1[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.curve2.controlPos1StartDrag,
			pathNum: pathNum
		});
		pos.push({
			shape: 'circle',
			dims: [obj.controlPos2[0], obj.controlPos2[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.curve2.controlPos2StartDrag,
			pathNum: pathNum
		});
		return pos;
	},
	startPosStartDrag: function () {
		changeDrawMode('curve2Start');
		draw.currPathNum = draw.currCursor.pathNum;
		draw.animate(draw.curve2.posMove,draw.curve2.posStop,drawCanvasPaths);
		//addListenerMove(window, draw.curve2.posMove);
		//addListenerEnd(window, draw.curve2.posStop);
	},
	finPosStartDrag: function () {
		changeDrawMode('curve2Fin');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.curve2.posMove,draw.curve2.posStop,drawCanvasPaths);
		//addListenerMove(window, draw.curve2.posMove);
		//addListenerEnd(window, draw.curve2.posStop);
	},
	controlPos1StartDrag: function () {
		changeDrawMode('curve2Control1');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.curve2.posMove,draw.curve2.posStop,drawCanvasPaths);
		//addListenerMove(window, draw.curve2.posMove);
		//addListenerEnd(window, draw.curve2.posStop);
	},
	controlPos2StartDrag: function () {
		changeDrawMode('curve2Control2');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.curve2.posMove,draw.curve2.posStop,drawCanvasPaths);
		//addListenerMove(window, draw.curve2.posMove);
		//addListenerEnd(window, draw.curve2.posStop);
	},
	posMove: function (e) {
		updateMouse(e);
		var x = draw.mouse[0];
		var y = draw.mouse[1];
		var pathNum = draw.currPathNum;
		var obj = draw.path[pathNum].obj[0];

		var pos = [x, y];
		if (snapToObj2On || draw.snapLinesTogether) {
			var pos = snapToObj2([x, y], pathNum);
		}

		if (draw.drawMode == 'curveStart' || draw.drawMode == 'curve2Start') {
			obj.startPos[0] = pos[0];
			obj.startPos[1] = pos[1];
			if (shiftOn) {
				var dx = pos[0] - obj.finPos[0];
				var dy = pos[1] - obj.finPos[1];
				if (Math.abs(dx) < Math.abs(dy)) {
					if (Math.abs(dx) < draw.snapTolerance) {
						obj.startPos[0] = obj.finPos[0];
					}
				} else {
					if (Math.abs(dy) < draw.snapTolerance) {
						obj.startPos[1] = obj.finPos[1];
					}
				}
			}
		} else if (draw.drawMode == 'curveFin' || draw.drawMode == 'curve2Fin') {
			obj.finPos[0] = pos[0];
			obj.finPos[1] = pos[1];
			if (shiftOn) {
				var dx = pos[0] - obj.startPos[0];
				var dy = pos[1] - obj.startPos[1];
				if (Math.abs(dx) < Math.abs(dy)) {
					if (Math.abs(dx) < draw.snapTolerance) {
						obj.finPos[0] = obj.startPos[0];
					}
				} else {
					if (Math.abs(dy) < draw.snapTolerance) {
						obj.finPos[1] = obj.startPos[1];
					}
				}
			}
		} else if (draw.drawMode == 'curveControl') {
			obj.controlPos[0] = pos[0];
			obj.controlPos[1] = pos[1];
		} else if (draw.drawMode == 'curve2Control1') {
			obj.controlPos1[0] = pos[0];
			obj.controlPos1[1] = pos[1];
		} else if (draw.drawMode == 'curve2Control2') {
			obj.controlPos2[0] = pos[0];
			obj.controlPos2[1] = pos[1];
		}
		updateBorder(draw.path[pathNum]);
		//drawCanvasPaths();
	},
	posStop: function (e) {
		var pathNum = draw.currPathNum;
		var obj = draw.path[pathNum].obj[0];
		//removeListenerMove(window, draw.curve.posMove);
		//removeListenerEnd(window, draw.curve.posStop);
		changeDrawMode();
	},
	drawButton: function (ctx, size) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = size * 0.04;
		var p1 = [0.2 * size, 0.2 * size];
		var p2 = [0.8 * size, 0.2 * size];
		var c1 = [0.3 * size, 0.7 * size];
		var c2 = [0.8 * size, 0.8 * size];
		ctx.beginPath();
		ctx.moveTo(p1[0], p1[1]);
		ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]);
		ctx.stroke();
		ctx.beginPath();
		ctx.strokeStyle = '#666';
		ctx.lineWidth = size * 0.01;
		ctx.setLineDash([size * 0.08, size * 0.08]);
		ctx.beginPath();
		ctx.moveTo(p1[0], p1[1]);
		ctx.lineTo(c1[0], c1[1]);
		ctx.lineTo(c2[0], c2[1]);
		ctx.lineTo(p2[0], p2[1]);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.beginPath();
		ctx.fillStyle = '#F00';
		ctx.arc(c1[0], c1[1], size * 0.04, 0, 2 * Math.PI);
		ctx.arc(c2[0], c2[1], size * 0.04, 0, 2 * Math.PI);
		ctx.fill();
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.startPos;
		obj.startPos[0] = center[0] + sf * (obj.startPos[0] - center[0]);
		obj.startPos[1] = center[1] + sf * (obj.startPos[1] - center[1]);
		obj.finPos[0] = center[0] + sf * (obj.finPos[0] - center[0]);
		obj.finPos[1] = center[1] + sf * (obj.finPos[1] - center[1]);
		obj.controlPos1[0] = center[0] + sf * (obj.controlPos1[0] - center[0]);
		obj.controlPos1[1] = center[1] + sf * (obj.controlPos1[1] - center[1]);
		obj.controlPos2[0] = center[0] + sf * (obj.controlPos2[0] - center[0]);
		obj.controlPos2[1] = center[1] + sf * (obj.controlPos2[1] - center[1]);
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.dash)) {
			if (!un(obj.dash[0]))
				obj.dash[0] *= sf;
			if (!un(obj.dash[1]))
				obj.dash[1] *= sf;
		}
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.startPos[0] += dl;
		obj.startPos[1] += dt;
		obj.finPos[0] += dl;
		obj.finPos[1] += dt;
		obj.controlPos1[0] += dl;
		obj.controlPos1[1] += dt;
		obj.controlPos2[0] += dl;
		obj.controlPos2[1] += dt;
	}
}
draw.square = {
	draw: function (ctx, obj, path) {
		draw.rect.draw(ctx, obj, path);
	},
	getRect: function (obj) {
		if (!un(obj.startPos) && !un(obj.finPos)) {
			obj._left = Math.min(obj.startPos[0], obj.finPos[0]);
			obj._top = Math.min(obj.startPos[1], obj.finPos[1]);
			obj._width = Math.max(obj.startPos[0], obj.finPos[0]) - obj._left;
			obj._height = Math.max(obj.startPos[1], obj.finPos[1]) - obj._top;
			return [obj._left, obj._top, obj._width, obj._height];
		}
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.startPos;
		obj.startPos[0] = center[0] + sf * (obj.startPos[0] - center[0]);
		obj.startPos[1] = center[1] + sf * (obj.startPos[1] - center[1]);
		obj.finPos[0] = center[0] + sf * (obj.finPos[0] - center[0]);
		obj.finPos[1] = center[1] + sf * (obj.finPos[1] - center[1]);
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.dash)) {
			if (!un(obj.dash[0]))
				obj.dash[0] *= sf;
			if (!un(obj.dash[1]))
				obj.dash[1] *= sf;
		}
	}
}
draw.rect = {
	draw: function (ctx, obj, path) {
		if (un(obj.finPos) || obj.finPos.length == 0)
			return;
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function')
			ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined')
			ctx.setLineDash(obj.dash);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		if (obj.fillColor !== 'none') {
			ctx.fillStyle = obj.fillColor;
			ctx.fillRect(obj.startPos[0], obj.startPos[1], obj.finPos[0] - obj.startPos[0], obj.finPos[1] - obj.startPos[1]);
		}
		ctx.strokeRect(obj.startPos[0], obj.startPos[1], obj.finPos[0] - obj.startPos[0], obj.finPos[1] - obj.startPos[1]);
		ctx.setLineDash([]);
	},
	getRect: function (obj) {
		if (!un(obj.startPos) && !un(obj.finPos)) {
			obj._left = Math.min(obj.startPos[0], obj.finPos[0]);
			obj._top = Math.min(obj.startPos[1], obj.finPos[1]);
			obj._width = Math.max(obj.startPos[0], obj.finPos[0]) - obj._left;
			obj._height = Math.max(obj.startPos[1], obj.finPos[1]) - obj._top;
			return [obj._left, obj._top, obj._width, obj._height];
		}
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.startPos;
		obj.startPos[0] = center[0] + sf * (obj.startPos[0] - center[0]);
		obj.startPos[1] = center[1] + sf * (obj.startPos[1] - center[1]);
		obj.finPos[0] = center[0] + sf * (obj.finPos[0] - center[0]);
		obj.finPos[1] = center[1] + sf * (obj.finPos[1] - center[1]);
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.dash)) {
			if (!un(obj.dash[0]))
				obj.dash[0] *= sf;
			if (!un(obj.dash[1]))
				obj.dash[1] *= sf;
		}
	}
}
draw.prism = {
	resizable: true,
	add: function (n) {
		if (un(n)) n = 4;
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'prism',
					center: center,
					radiusX: 100,
					radiusY: 100 / 3,
					tilt: 0.35,
					height: 200,
					points: n,
					color: draw.color,
					thickness: 2,
					startAngle: -Math.PI / 2
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++)
			updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		var fill = 
		obj._top = [obj.center[0], obj.center[1] - (1 - obj.tilt) * obj.height];
		obj._radiusY = obj.radiusX * obj.tilt;

		obj._baseVertices = [];
		obj._topVertices = [];
		for (var p = 0; p < obj.points; p++) {
			var angle = obj.startAngle + p * (2 * Math.PI) / obj.points;
			obj._baseVertices.push([obj.center[0] + obj.radiusX * Math.cos(angle), obj.center[1] + obj._radiusY * Math.sin(angle), angle]);
			obj._topVertices.push([obj.center[0] + obj.radiusX * Math.cos(angle), obj.center[1] + obj._radiusY * Math.sin(angle) - obj.height, angle]);
		}

		for (var p = 0; p < obj.points; p++) {
			obj._baseVertices[p][3] = isPointVisible(p);
			obj._topVertices[p][3] = true;
		}
		if ((obj.points == 3 || obj.points == 4) && hitTestPolygon(obj._top, obj._baseVertices) == false) {
			var negDiff = [];
			var posDiff = [];
			for (var p = 0; p < obj._baseVertices.length; p++) {
				negDiff[p] = 7;
				posDiff[p] = 7;
				var angle = simplifyAngle(obj._baseVertices[p][2]);
				if (angle < 0.5 * Math.PI) {
					posDiff[p] = 0.5 * Math.PI + angle;
				} else if (angle < 1.5 * Math.PI) {
					negDiff[p] = 1.5 * Math.PI - angle;
				} else {
					posDiff[p] = angle - 1.5 * Math.PI;
				}
			}
			var pos = posDiff.indexOf(arrayMin(posDiff));
			var neg = negDiff.indexOf(arrayMin(negDiff));
			if (typeof pos == 'number' && pos > -1 && typeof neg == 'number' && neg > -1) {
				obj._baseVertices[pos][4] = true;
				obj._baseVertices[neg][4] = true;
			}
		}

		for (var i = 0; i < p; i++) {
			var v1 = obj._baseVertices[i];
			var v2 = obj._baseVertices[(i + 1) % p];
			if (v1[3] == false || v2[3] == false || (v1[4] == true && v2[4] == true)) {
				ctx.setLineDash([5, 5]);
			} else {
				ctx.strokeStyle = obj.color;
			}
			ctx.beginPath();
			ctx.moveTo(v1[0], v1[1]);
			ctx.lineTo(v2[0], v2[1]);
			ctx.stroke();
			ctx.setLineDash([]);
		}

		for (var i = 0; i < obj._baseVertices.length; i++) {
			var angle = simplifyAngle(obj._baseVertices[i][2]);

			ctx.lineWidth = obj.thickness;
			if (obj._baseVertices[i][3] == false) {
				ctx.setLineDash([5, 5]);
			} else {
				ctx.strokeStyle = obj.color;
			}
			ctx.beginPath();
			ctx.moveTo(obj._baseVertices[i][0], obj._baseVertices[i][1]);
			ctx.lineTo(obj._topVertices[i][0], obj._topVertices[i][1]);
			ctx.stroke();
			ctx.setLineDash([]);

			ctx.beginPath();
			ctx.moveTo(obj._topVertices[i][0], obj._topVertices[i][1]);
			ctx.lineTo(obj._topVertices[(i + 1) % p][0], obj._topVertices[(i + 1) % p][1]);
			ctx.stroke();
		}
		function isPointVisible(i) {
			var arr = [];
			for (var j = 1; j < obj._baseVertices.length; j++)
				arr.push(obj._baseVertices[(i + j) % obj._baseVertices.length]);
			for (var j = 0; j < arr.length - 1; j++) {
				if (hitTestPolygon(obj._baseVertices[i], [arr[j], arr[j + 1], obj._top]) == true)
					return false;
			}
			return true;
		}
		function simplifyAngle(angle) {
			while (angle < 0)
				angle += 2 * Math.PI;
			while (angle > 2 * Math.PI)
				angle -= 2 * Math.PI;
			return angle;
		}
	},
	getRect: function (obj) {
		obj._radiusY = obj.radiusX * obj.tilt;
		obj._top = [obj.center[0], obj.center[1] - (1 - obj.tilt) * obj.height - obj._radiusY];
		if (obj._top[1] < obj.center[1] - obj._radiusY) {
			return [obj.center[0] - obj.radiusX, obj._top[1] - obj._radiusY, obj.radiusX * 2, obj.center[1] + 2 * obj._radiusY - obj._top[1]];
		} else {
			return [obj.center[0] - obj.radiusX, obj.center[1] - obj._radiusY, obj.radiusX * 2, 2 * obj._radiusY];
		}

	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt + dh;
		obj.radiusX += dw;
		var newTotalHeight = obj.height + obj.radiusY + dh;
		obj.radiusY = obj.radiusX / 3;
		obj.height = newTotalHeight - obj.radiusY;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'prism-rotate',
			shape: 'rect',
			dims: [x2 - 40, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.prism.rotateStart,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#F96', 0.5);
				ctx.fillRect(l, t, w, h);
			}
		});
		buttons.push({
			buttonType: 'prism-vertices-minus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.prism.verticesMinus,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#F00', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					text: ['<<fontSize:14>>-']
				});
			}
		});
		buttons.push({
			buttonType: 'prism-vertices-plus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 60, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.prism.verticesPlus,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#F00', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					text: ['<<fontSize:14>>+']
				});
			}
		});
		buttons.push({
			buttonType: 'prism-tilt-minus',
			shape: 'rect',
			dims: [x2 - 80, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.prism.tiltMinusStart,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#393', 0.5);
				ctx.fillRect(l, t, w, h);
			}
		});
		buttons.push({
			buttonType: 'prism-tilt-plus',
			shape: 'rect',
			dims: [x2 - 60, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.prism.tiltPlusStart,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#09F', 0.5);
				ctx.fillRect(l, t, w, h);
			}
		});
		return buttons;
	},
	rotateStart: function () {
		draw.prism.rotateIntervalObj = draw.path[draw.currCursor.pathNum].obj[0];
		draw.prism.rotateInterval = setInterval(function () {
				draw.prism.rotateIntervalObj.startAngle += Math.PI / 30;
				drawCanvasPaths();
			}, 100);
		addListenerEnd(window, draw.prism.rotateStop);
	},
	rotateStop: function () {
		clearInterval(draw.prism.rotateInterval);
		delete draw.prism.rotateIntervalObj;
		removeListenerEnd(window, draw.prism.rotateStop);
	},
	verticesMinus: function () {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		if (obj.points > 3)
			obj.points--;
		drawSelectedPaths();
	},
	verticesPlus: function () {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		obj.points++;
		drawSelectedPaths();
	},
	drawButton: function (ctx, size) {
		ctx.beginPath();
		draw.prism.draw(ctx, {
			center: [0.5 * size, 0.7 * size],
			radiusX: 0.3 * size,
			radiusY: 0.1 * size,
			height: 0.5 * size,
			points: 5,
			color: '#000',
			thickness: 0.02 * size,
			startAngle: -Math.PI / 8
		});
		ctx.stroke();
	},
	tiltPlusStart: function () {
		draw.prism.tiltIntervalPath = draw.path[draw.currCursor.pathNum];
		draw.prism.tiltIntervalObj = draw.path[draw.currCursor.pathNum].obj[0];
		draw.prism.tiltInterval = setInterval(function () {
				var obj = draw.prism.tiltIntervalObj;
				if (un(obj.tilt))
					obj.tilt = obj.radiusY / obj.radiusX;
				if (obj.tilt < 1) {
					obj.tilt = Math.min(obj.tilt + 0.05, 1);
					updateBorder(draw.prism.tiltIntervalPath);
					drawCanvasPaths();
				} else {
					draw.prism.tiltStop();
				}
				drawCanvasPaths();
			}, 100);
		addListenerEnd(window, draw.prism.tiltStop);
	},
	tiltMinusStart: function () {
		draw.prism.tiltIntervalPath = draw.path[draw.currCursor.pathNum];
		draw.prism.tiltIntervalObj = draw.path[draw.currCursor.pathNum].obj[0];
		draw.prism.tiltInterval = setInterval(function () {
				var obj = draw.prism.tiltIntervalObj;
				if (un(obj.tilt))
					obj.tilt = obj.radiusY / obj.radiusX;
				if (obj.tilt > 0) {
					obj.tilt = Math.max(obj.tilt - 0.05, 0);
					updateBorder(draw.prism.tiltIntervalPath);
					drawCanvasPaths();
				} else {
					draw.prism.tiltStop();
				}
			}, 100);
		addListenerEnd(window, draw.prism.tiltStop);
	},
	tiltStop: function () {
		clearInterval(draw.prism.tiltInterval);
		delete draw.prism.tiltIntervalObj;
		delete draw.prism.tiltIntervalPath;
		removeListenerEnd(window, draw.prism.tiltStop);
	},
	/*altDragMove: function (obj, dx, dy) {
		obj.tilt = Math.min(1, Math.max(0, obj.tilt + dy * 0.005));
		obj.startAngle -= 0.01 * dx;
		while (obj.startAngle < 0)
			obj.startAngle += 2 * Math.PI;
		while (obj.startAngle > 2 * Math.PI)
			obj.startAngle -= 2 * Math.PI;
	},*/
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		if (!un(obj.radiusX))
			obj.radiusX *= sf;
		if (!un(obj.radiusY))
			obj.radiusY *= sf;
		if (!un(obj.height))
			obj.height *= sf;
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.dash)) {
			if (!un(obj.dash[0]))
				obj.dash[0] *= sf;
			if (!un(obj.dash[1]))
				obj.dash[1] *= sf;
		}
	},
	getSnapPos: function (obj) {
		var pos = [];
		if (!un(obj._baseVertices)) {
			for (var p = 0; p < obj._baseVertices.length; p++) {
				pos.push({
					type: 'point',
					pos: obj._baseVertices[p]
				});
			}
			for (var p = 0; p < obj._topVertices.length; p++) {
				pos.push({
					type: 'point',
					pos: obj._topVertices[p]
				});
			}
		}
		return pos;
	},

};
draw.pyramid = {
	resizable: true,
	add: function (n) {
		if (un(n))
			n = 4;
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'pyramid',
					center: center,
					radiusX: 100,
					radiusY: 100 / 3,
					tilt: 0.35,
					height: 200,
					points: n,
					color: draw.color,
					thickness: draw.thickness,
					startAngle: -Math.PI / 2
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++)
			updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (!un(obj.tilt)) {
			obj._top = [obj.center[0], obj.center[1] - (1 - obj.tilt) * obj.height];
			obj._radiusY = obj.radiusX * obj.tilt;
		} else {
			obj._top = [obj.center[0], obj.center[1] - obj.height];
			obj._radiusY = obj.radiusY;
		}

		obj._baseVertices = [];
		for (var p = 0; p < obj.points; p++) {
			var angle = obj.startAngle + p * (2 * Math.PI) / obj.points;
			obj._baseVertices.push([obj.center[0] + obj.radiusX * Math.cos(angle), obj.center[1] + obj._radiusY * Math.sin(angle), angle]);
		}

		for (var p = 0; p < obj.points; p++)
			obj._baseVertices[p][3] = isPointVisible(p);

		if ((obj.points == 3 || obj.points == 4) && hitTestPolygon(obj._top, obj._baseVertices) == false) {
			var negDiff = [];
			var posDiff = [];
			for (var p = 0; p < obj._baseVertices.length; p++) {
				negDiff[p] = 7;
				posDiff[p] = 7;
				var angle = simplifyAngle(obj._baseVertices[p][2]);
				if (angle < 0.5 * Math.PI) {
					posDiff[p] = 0.5 * Math.PI + angle;
				} else if (angle < 1.5 * Math.PI) {
					negDiff[p] = 1.5 * Math.PI - angle;
				} else {
					posDiff[p] = angle - 1.5 * Math.PI;
				}
			}
			var pos = posDiff.indexOf(arrayMin(posDiff));
			var neg = negDiff.indexOf(arrayMin(negDiff));
			if (typeof pos == 'number' && pos > -1 && typeof neg == 'number' && neg > -1) {
				obj._baseVertices[pos][4] = true;
				obj._baseVertices[neg][4] = true;
			}
		}

		for (var i = 0; i < p; i++) {
			var v1 = obj._baseVertices[i];
			var v2 = obj._baseVertices[(i + 1) % p];
			if (v1[3] == false || v2[3] == false || (v1[4] == true && v2[4] == true)) {
				ctx.setLineDash([5, 5]);
			} else {
				ctx.strokeStyle = obj.color;
			}
			ctx.beginPath();
			ctx.moveTo(v1[0], v1[1]);
			ctx.lineTo(v2[0], v2[1]);
			ctx.stroke();
			ctx.setLineDash([]);
		}

		for (var i = 0; i < obj._baseVertices.length; i++) {
			var angle = simplifyAngle(obj._baseVertices[i][2]);

			ctx.lineWidth = obj.thickness;
			if (obj._baseVertices[i][3] == false) {
				ctx.setLineDash([5, 5]);
			} else {
				ctx.strokeStyle = obj.color;
			}
			ctx.beginPath();
			ctx.moveTo(obj._baseVertices[i][0], obj._baseVertices[i][1]);
			ctx.lineTo(obj._top[0], obj._top[1]);
			ctx.stroke();
			ctx.setLineDash([]);
		}
		function isPointVisible(i) {
			var arr = [];
			for (var j = 1; j < obj._baseVertices.length; j++)
				arr.push(obj._baseVertices[(i + j) % obj._baseVertices.length]);
			for (var j = 0; j < arr.length - 1; j++) {
				if (hitTestPolygon(obj._baseVertices[i], [arr[j], arr[j + 1], obj._top]) == true)
					return false;
			}
			return true;
		}
		function simplifyAngle(angle) {
			while (angle < 0)
				angle += 2 * Math.PI;
			while (angle > 2 * Math.PI)
				angle -= 2 * Math.PI;
			return angle;
		}
	},
	getRect: function (obj) {
		if (!un(obj.tilt)) {
			obj._top = [obj.center[0], obj.center[1] - (1 - obj.tilt) * obj.height];
			obj._radiusY = obj.radiusX * obj.tilt;
		} else {
			obj._top = [obj.center[0], obj.center[1] - obj.height];
			obj._radiusY = obj.radiusY;
		}
		if (obj._top[1] < obj.center[1] - obj._radiusY) {
			return [obj.center[0] - obj.radiusX, obj._top[1], obj.radiusX * 2, obj.center[1] + obj._radiusY - obj._top[1]];
		} else {
			return [obj.center[0] - obj.radiusX, obj.center[1] - obj._radiusY, obj.radiusX * 2, 2 * obj._radiusY];
		}

	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt + dh;
		obj.radiusX += dw;
		var newTotalHeight = obj.height + obj.radiusY + dh;
		obj.radiusY = obj.radiusX / 3;
		obj.height = newTotalHeight - obj.radiusY;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'pyramid-rotate',
			shape: 'rect',
			dims: [x2 - 40, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.pyramid.rotateStart,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#F96', 0.5);
				ctx.fillRect(l, t, w, h);
			}
		});
		buttons.push({
			buttonType: 'pyramid-vertices-minus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.pyramid.verticesMinus,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#F00', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					text: ['<<fontSize:14>>-']
				});
			}
		});
		buttons.push({
			buttonType: 'pyramid-vertices-plus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 60, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.pyramid.verticesPlus,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#F00', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					text: ['<<fontSize:14>>+']
				});
			}
		});
		buttons.push({
			buttonType: 'pyramid-tilt-minus',
			shape: 'rect',
			dims: [x2 - 80, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.pyramid.tiltMinusStart,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#393', 0.5);
				ctx.fillRect(l, t, w, h);
			}
		});
		buttons.push({
			buttonType: 'pyramid-tilt-plus',
			shape: 'rect',
			dims: [x2 - 60, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.pyramid.tiltPlusStart,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#09F', 0.5);
				ctx.fillRect(l, t, w, h);
			}
		});
		return buttons;
	},
	rotateStart: function () {
		draw.pyramid.rotateIntervalObj = draw.path[draw.currCursor.pathNum].obj[0];
		draw.pyramid.rotateInterval = setInterval(function () {
				draw.pyramid.rotateIntervalObj.startAngle += Math.PI / 30;
				drawCanvasPaths();
			}, 100);
		addListenerEnd(window, draw.pyramid.rotateStop);
	},
	rotateStop: function () {
		clearInterval(draw.pyramid.rotateInterval);
		delete draw.pyramid.rotateIntervalObj;
		removeListenerEnd(window, draw.pyramid.rotateStop);
	},
	verticesMinus: function () {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		if (obj.points > 3)
			obj.points--;
		drawSelectedPaths();
	},
	verticesPlus: function () {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		obj.points++;
		drawSelectedPaths();
	},
	drawButton: function (ctx, size) {
		ctx.beginPath();
		draw.pyramid.draw(ctx, {
			center: [0.5 * size, 0.7 * size],
			radiusX: 0.3 * size,
			radiusY: 0.1 * size,
			height: 0.5 * size,
			points: 4,
			color: '#000',
			thickness: 0.02 * size,
			startAngle: -Math.PI / 8
		});
		ctx.stroke();
	},
	tiltPlusStart: function () {
		draw.pyramid.tiltIntervalPath = draw.path[draw.currCursor.pathNum];
		draw.pyramid.tiltIntervalObj = draw.path[draw.currCursor.pathNum].obj[0];
		draw.pyramid.tiltInterval = setInterval(function () {
				var obj = draw.pyramid.tiltIntervalObj;
				if (un(obj.tilt))
					obj.tilt = obj.radiusY / obj.radiusX;
				if (obj.tilt < 1) {
					obj.tilt = Math.min(obj.tilt + 0.05, 1);
					updateBorder(draw.pyramid.tiltIntervalPath);
					drawCanvasPaths();
				} else {
					draw.pyramid.tiltStop();
				}
				drawCanvasPaths();
			}, 100);
		addListenerEnd(window, draw.pyramid.tiltStop);
	},
	tiltMinusStart: function () {
		draw.pyramid.tiltIntervalPath = draw.path[draw.currCursor.pathNum];
		draw.pyramid.tiltIntervalObj = draw.path[draw.currCursor.pathNum].obj[0];
		draw.pyramid.tiltInterval = setInterval(function () {
				var obj = draw.pyramid.tiltIntervalObj;
				if (un(obj.tilt))
					obj.tilt = obj.radiusY / obj.radiusX;
				if (obj.tilt > 0) {
					obj.tilt = Math.max(obj.tilt - 0.05, 0);
					updateBorder(draw.pyramid.tiltIntervalPath);
					drawCanvasPaths();
				} else {
					draw.pyramid.tiltStop();
				}
			}, 100);
		addListenerEnd(window, draw.pyramid.tiltStop);
	},
	tiltStop: function () {
		clearInterval(draw.pyramid.tiltInterval);
		delete draw.pyramid.tiltIntervalObj;
		delete draw.pyramid.tiltIntervalPath;
		removeListenerEnd(window, draw.pyramid.tiltStop);
	},
	/*altDragMove: function (obj, dx, dy) {
		obj.tilt = Math.min(1, Math.max(0, obj.tilt + dy * 0.005));
		obj.startAngle -= 0.01 * dx;
		while (obj.startAngle < 0)
			obj.startAngle += 2 * Math.PI;
		while (obj.startAngle > 2 * Math.PI)
			obj.startAngle -= 2 * Math.PI;
	},*/
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		if (!un(obj.radiusX))
			obj.radiusX *= sf;
		if (!un(obj.radiusY))
			obj.radiusY *= sf;
		if (!un(obj.height))
			obj.height *= sf;
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.dash)) {
			if (!un(obj.dash[0]))
				obj.dash[0] *= sf;
			if (!un(obj.dash[1]))
				obj.dash[1] *= sf;
		}
	}
};
draw.octahedron = {
	resizable: true,
	add: function (n) {
		if (un(n))
			n = 4;
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'octahedron',
					center: center,
					radiusX: 100,
					radiusY: 100 / 3,
					tilt: 0.35,
					height: 200,
					points: n,
					color: draw.color,
					thickness: 2,
					startAngle: -Math.PI / 2
				}
			],
			selected: true,
			trigger: []
		});
		for (var p = 0; p < draw.path.length; p++)
			updateBorder(draw.path[p]);
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		obj._top = [obj.center[0], obj.center[1] - (1 - obj.tilt) * obj.height];
		obj._bottom = [obj.center[0], obj.center[1] + (1 - obj.tilt) * obj.height];
		obj._radiusY = obj.radiusX * obj.tilt;

		obj._baseVertices = [];
		for (var p = 0; p < obj.points; p++) {
			var angle = obj.startAngle + p * (2 * Math.PI) / obj.points;
			obj._baseVertices.push([obj.center[0] + obj.radiusX * Math.cos(angle), obj.center[1] + obj._radiusY * Math.sin(angle), angle]);
		}

		for (var p = 0; p < obj.points; p++)
			obj._baseVertices[p][3] = isPointVisible(p);

		if ((obj.points == 3 || obj.points == 4) && hitTestPolygon(obj._top, obj._baseVertices) == false) {
			var negDiff = [];
			var posDiff = [];
			for (var p = 0; p < obj._baseVertices.length; p++) {
				negDiff[p] = 7;
				posDiff[p] = 7;
				var angle = simplifyAngle(obj._baseVertices[p][2]);
				if (angle < 0.5 * Math.PI) {
					posDiff[p] = 0.5 * Math.PI + angle;
				} else if (angle < 1.5 * Math.PI) {
					negDiff[p] = 1.5 * Math.PI - angle;
				} else {
					posDiff[p] = angle - 1.5 * Math.PI;
				}
			}
			var pos = posDiff.indexOf(arrayMin(posDiff));
			var neg = negDiff.indexOf(arrayMin(negDiff));
			if (typeof pos == 'number' && pos > -1 && typeof neg == 'number' && neg > -1) {
				obj._baseVertices[pos][4] = true;
				obj._baseVertices[neg][4] = true;
			}
		}

		for (var i = 0; i < p; i++) {
			var v1 = obj._baseVertices[i];
			var v2 = obj._baseVertices[(i + 1) % p];
			if (v1[3] == false || v2[3] == false || (v1[4] == true && v2[4] == true)) {
				ctx.setLineDash([5, 5]);
			} else {
				ctx.strokeStyle = obj.color;
			}
			ctx.beginPath();
			ctx.moveTo(v1[0], v1[1]);
			ctx.lineTo(v2[0], v2[1]);
			ctx.stroke();
			ctx.setLineDash([]);
		}

		for (var i = 0; i < obj._baseVertices.length; i++) {
			var angle = simplifyAngle(obj._baseVertices[i][2]);

			ctx.lineWidth = obj.thickness;
			if (obj._baseVertices[i][3] == false) {
				ctx.setLineDash([5, 5]);
			} else {
				ctx.strokeStyle = obj.color;
			}
			ctx.beginPath();
			ctx.moveTo(obj._bottom[0], obj._bottom[1]);
			ctx.lineTo(obj._baseVertices[i][0], obj._baseVertices[i][1]);
			ctx.lineTo(obj._top[0], obj._top[1]);
			ctx.stroke();
			ctx.setLineDash([]);
		}
		function isPointVisible(i) {
			var arr = [];
			for (var j = 1; j < obj._baseVertices.length; j++)
				arr.push(obj._baseVertices[(i + j) % obj._baseVertices.length]);
			for (var j = 0; j < arr.length - 1; j++) {
				if (hitTestPolygon(obj._baseVertices[i], [arr[j], arr[j + 1], obj._top]) == true)
					return false;
			}
			return true;
		}
		function simplifyAngle(angle) {
			while (angle < 0)
				angle += 2 * Math.PI;
			while (angle > 2 * Math.PI)
				angle -= 2 * Math.PI;
			return angle;
		}
	},
	getRect: function (obj) {
		obj._top = [obj.center[0], obj.center[1] - (1 - obj.tilt) * obj.height];
		obj._bottom = [obj.center[0], obj.center[1] + (1 - obj.tilt) * obj.height];
		obj._radiusY = obj.radiusX * obj.tilt;
		if (obj._top[1] < obj.center[1] - obj._radiusY) {
			return [obj.center[0] - obj.radiusX, obj._top[1], obj.radiusX * 2, obj._bottom[1] + obj._radiusY - obj._top[1]];
		} else {
			return [obj.center[0] - obj.radiusX, obj.center[1] - obj._radiusY, obj.radiusX * 2, 2 * obj._radiusY];
		}

	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt + dh;
		obj.radiusX += dw;
		var newTotalHeight = obj.height + obj.radiusY + dh;
		obj.radiusY = obj.radiusX / 3;
		obj.height = newTotalHeight - obj.radiusY;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'octahedron-rotate',
			shape: 'rect',
			dims: [x2 - 40, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.octahedron.rotateStart,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#F96', 0.5);
				ctx.fillRect(l, t, w, h);
			}
		});
		buttons.push({
			buttonType: 'octahedron-vertices-minus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.octahedron.verticesMinus,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#F00', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					text: ['<<fontSize:14>>-']
				});
			}
		});
		buttons.push({
			buttonType: 'octahedron-vertices-plus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 60, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.octahedron.verticesPlus,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#F00', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					text: ['<<fontSize:14>>+']
				});
			}
		});
		buttons.push({
			buttonType: 'octahedron-tilt-minus',
			shape: 'rect',
			dims: [x2 - 80, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.octahedron.tiltMinusStart,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#393', 0.5);
				ctx.fillRect(l, t, w, h);
			}
		});
		buttons.push({
			buttonType: 'octahedron-tilt-plus',
			shape: 'rect',
			dims: [x2 - 60, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.octahedron.tiltPlusStart,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#09F', 0.5);
				ctx.fillRect(l, t, w, h);
			}
		});
		return buttons;
	},
	rotateStart: function () {
		draw.octahedron.rotateIntervalObj = draw.path[draw.currCursor.pathNum].obj[0];
		draw.octahedron.rotateInterval = setInterval(function () {
				draw.octahedron.rotateIntervalObj.startAngle += Math.PI / 30;
				drawCanvasPaths();
			}, 100);
		addListenerEnd(window, draw.octahedron.rotateStop);
	},
	rotateStop: function () {
		clearInterval(draw.octahedron.rotateInterval);
		delete draw.octahedron.rotateIntervalObj;
		removeListenerEnd(window, draw.octahedron.rotateStop);
	},
	verticesMinus: function () {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		if (obj.points > 3)
			obj.points--;
		drawSelectedPaths();
	},
	verticesPlus: function () {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		obj.points++;
		drawSelectedPaths();
	},
	drawButton: function (ctx, size) {
		ctx.beginPath();
		draw.octahedron.draw(ctx, {
			center: [0.5 * size, 0.7 * size],
			radiusX: 0.3 * size,
			radiusY: 0.1 * size,
			height: 0.5 * size,
			points: 4,
			color: '#000',
			thickness: 0.02 * size,
			startAngle: -Math.PI / 8
		});
		ctx.stroke();
	},
	tiltPlusStart: function () {
		draw.octahedron.tiltIntervalPath = draw.path[draw.currCursor.pathNum];
		draw.octahedron.tiltIntervalObj = draw.path[draw.currCursor.pathNum].obj[0];
		draw.octahedron.tiltInterval = setInterval(function () {
				var obj = draw.octahedron.tiltIntervalObj;
				if (un(obj.tilt))
					obj.tilt = obj.radiusY / obj.radiusX;
				if (obj.tilt < 1) {
					obj.tilt = Math.min(obj.tilt + 0.05, 1);
					updateBorder(draw.octahedron.tiltIntervalPath);
					drawCanvasPaths();
				} else {
					draw.octahedron.tiltStop();
				}
				drawCanvasPaths();
			}, 100);
		addListenerEnd(window, draw.octahedron.tiltStop);
	},
	tiltMinusStart: function () {
		draw.octahedron.tiltIntervalPath = draw.path[draw.currCursor.pathNum];
		draw.octahedron.tiltIntervalObj = draw.path[draw.currCursor.pathNum].obj[0];
		draw.octahedron.tiltInterval = setInterval(function () {
				var obj = draw.octahedron.tiltIntervalObj;
				if (un(obj.tilt))
					obj.tilt = obj.radiusY / obj.radiusX;
				if (obj.tilt > 0) {
					obj.tilt = Math.max(obj.tilt - 0.05, 0);
					updateBorder(draw.octahedron.tiltIntervalPath);
					drawCanvasPaths();
				} else {
					draw.octahedron.tiltStop();
				}
			}, 100);
		addListenerEnd(window, draw.octahedron.tiltStop);
	},
	tiltStop: function () {
		clearInterval(draw.octahedron.tiltInterval);
		delete draw.octahedron.tiltIntervalObj;
		delete draw.octahedron.tiltIntervalPath;
		removeListenerEnd(window, draw.octahedron.tiltStop);
	},
	/*altDragMove: function (obj, dx, dy) {
		obj.tilt = Math.min(1, Math.max(0, obj.tilt + dy * 0.005));
		obj.startAngle -= 0.01 * dx;
		while (obj.startAngle < 0)
			obj.startAngle += 2 * Math.PI;
		while (obj.startAngle > 2 * Math.PI)
			obj.startAngle -= 2 * Math.PI;
	},*/
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		if (!un(obj.radiusX))
			obj.radiusX *= sf;
		if (!un(obj.radiusY))
			obj.radiusY *= sf;
		if (!un(obj.height))
			obj.height *= sf;
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.dash)) {
			if (!un(obj.dash[0]))
				obj.dash[0] *= sf;
			if (!un(obj.dash[1]))
				obj.dash[1] *= sf;
		}
	}
};
draw.polygon = {
	add: function (polygonType, vertices) {
		if (un(vertices)) vertices = 4;
		if (un(polygonType)) polygonType = 'none';
		if (polygonType == 'arrow') vertices = 9;
		if (polygonType == 'arrow2') vertices = 12;

		deselectAllPaths(false);
		var pos = [];
		var center = draw.getViewCenter();
		var radius = 80;

		if (vertices == 4) {
			var pos = [
				[center[0] - 80, center[1] - 70],
				[center[0] + 20, center[1] - 70],
				[center[0] + 100, center[1] + 40],
				[center[0] - 40, center[1] + 50]
			];
		} else if (vertices == 3) {
			var pos = [
				[center[0] + 70, center[1] + 70],
				[center[0] - 70, center[1] + 70],
				[center[0] - 30, center[1] - 70]
			];
		} else if (polygonType == 'arrow') {
			var l = center[0];
			var t = center[1];
			pos = [[l, t], [l + 80, t], [l + 80, t - 20], [l + 120, t + 30], [l + 80, t + 80], [l + 80, t + 60], [l, t + 60]];
		} else if (polygonType == 'arrow2') {
			var l = center[0];
			var t = center[1];
			pos = [[l - 40, t + 30], [l, t - 20], [l, t], [l + 80, t], [l + 80, t - 20], [l + 120, t + 30], [l + 80, t + 80], [l + 80, t + 60], [l, t + 60], [l, t + 80]];
		} else {
			var angle = 0.5 * Math.PI + Math.PI / vertices;
			for (var p = 0; p < vertices; p++) {
				pos[p] = [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
				angle += (2 * Math.PI) / vertices;
			}
		}
		switch (polygonType) {
		case 'square':
			var vector1 = getVectorAB(pos[0], pos[1]);
			var vector2 = getPerpVector(vector1);
			pos[2] = pointAddVector(pos[1], vector2);
			pos[3] = pointAddVector(pos[2], vector1, -1);
			break;
		case 'rect':
			var vector1 = getVectorAB(pos[0], pos[1]);
			var vector2 = getPerpVector(vector1);
			vector2 = setVectorMag(vector2, getDist(pos[1], pos[2]));
			pos[2] = pointAddVector(pos[1], vector2, 1);
			pos[3] = pointAddVector(pos[0], vector2, 1);
			break;
		case 'para':
			var vector1 = getVectorAB(pos[0], pos[1]);
			pos[3] = pointAddVector(pos[2], vector1, -1);
			break;
		case 'trap':
			var vector1 = getVectorAB(pos[0], pos[1]);
			vector1 = setVectorMag(vector1, getDist(pos[2], pos[3]));
			pos[3] = pointAddVector(pos[2], vector1, -1);
			break;
		case 'rhom':
			var vector1 = getVectorAB(pos[0], pos[1]);
			var vector2 = getVectorAB(pos[1], pos[2]);
			vector2 = setVectorMag(vector2, getDist(pos[0], pos[1]));
			pos[2] = pointAddVector(pos[1], vector2);
			pos[3] = pointAddVector(pos[2], vector1, -1);
			break;
		case 'kite':
			var vector1 = getVectorAB(pos[0], pos[2]);
			var mid = getFootOfPerp(pos[0], vector1, pos[1]);
			var vector2 = getVectorAB(mid, pos[1]);
			pos[3] = pointAddVector(mid, vector2, -1);
			break;
		case 'equi':
			var vector1 = getVectorAB(pos[0], pos[1]);
			var vector2 = rotateVector(vector1, 2 * Math.PI / 3);
			pos[2] = pointAddVector(pos[1], vector2, 1);
			break;
		case 'isos':
			var vector1 = getVectorAB(pos[0], pos[1]);
			var vector2 = getPerpVector(vector1);
			var mid = getMidpoint(pos[0], pos[1]);
			pos[2] = pointAddVector(mid, vector2, 1.17);
			break;
		case 'right':
			var vector1 = getVectorAB(pos[0], pos[1]);
			var vector2 = getPerpVector(vector1);
			pos[2] = pointAddVector(pos[1], vector2, 0.8);
			break;
		case 'rightisos':
			var vector1 = getVectorAB(pos[0], pos[1]);
			var vector2 = getPerpVector(vector1);
			pos[2] = pointAddVector(pos[1], vector2, 1);
			break;
		}

		var angles = [];
		for (var p = 0; p < vertices; p++) {
			angles[p] = {
				style: 0,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				drawCurve: false,
				measureLabelOnly: true
			};
		}

		draw.path.push({
			obj: [{
					type: 'polygon',
					polygonType: polygonType,
					color: '#000',
					thickness: 2,
					fillColor: 'none',
					points: pos,
					closed: true,
					lineDecoration: [],
					angles: angles,
					clockwise: false,
					edit: false,
					drawing: false
				}
			],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (un(obj.points) || obj.points.length === 0) return;
		obj._centroid = draw.polygon.getCentroid(obj);
		obj._cursorPositions = [];
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined') ctx.setLineDash(obj.dash);
		
		if (!un(obj.polygonType)) {
			if (['equi','isos','right','rightisos'].indexOf(obj.polygonType) > -1 && obj.points.length !== 3) delete obj.polygonType;
			if (['square','rect','para','trap','rhom','kite'].indexOf(obj.polygonType) > -1 && obj.points.length !== 4) delete obj.polygonType;
		}
		
		if (!un(obj.angles)) {
			for (var a = 0; a < obj.angles.length; a++) {
				if (!un(obj.angles[a]) && obj.angles[a].drawCurve !== true && obj.angles[a].measureLabelOnly === true && obj.angles[a].fill !== true) {
					delete obj.angles[a];
				}
			}
		}
		if (!un(obj.lineDecoration)) {
			for (var d = 0; d < obj.lineDecoration.length; d++) {
				if (un(obj.lineDecoration[d])) obj.lineDecoration[d] = {};
			}
		}
		
		if (draw.mode === 'interact' && !un(obj.interact) && obj.interact.disabled !== true) {
			if (obj.interact.rotatable === true) {
				if (un(obj._rotationStartAngle)) obj._rotationStartAngle = !un(obj.interact.rotationAngleStart) ? obj.interact.rotationAngleStart : -Math.PI/2;
				if (un(obj._rotationAngle)) obj._rotationAngle = obj._rotationStartAngle;
				if (un(obj._rotationHandleLength)) {
					if (!un(obj.interact.rotationHandleLength)) {
						obj._rotationHandleLength = obj.interact.rotationHandleLength;
					} else {
						draw.polygon.getCentroidVertexAngles(obj);
						var point2 = vector.addVectors(obj._centroid,vector.setMagnitude([Math.cos(obj._rotationAngle),Math.sin(obj._rotationAngle)],1));
						for (var p = 0; p < obj._centroidVertexAngles.length; p++) {
							var a0 = obj._centroidVertexAngles[p];
							var a1 = obj._centroidVertexAngles[(p+1)%obj._centroidVertexAngles.length];
							if (anglesInOrder(a0, obj._rotationAngle, a1) === true) {
								obj._rotationHandleLength = distancePointToLine(obj._centroid,obj.points[p],obj.points[(p+1)%obj.points.length]);
								break;
							}
						}
					}
				}
				if (!un(obj._rotationHandleLength)) {
					var rotationCenter = !un(obj.interact.rotationCenterOffset) ? vector.addVectors(obj.points[0],rotateVector(obj.interact.rotationCenterOffset,obj._rotationAngle - obj._rotationStartAngle)) : obj._centroid;
					var rotationPoint = vector.addVectors(rotationCenter,vector.setMagnitude([Math.cos(obj._rotationAngle),Math.sin(obj._rotationAngle)],obj._rotationHandleLength));
					ctx.beginPath();
					ctx.lineWidth = 3;
					ctx.strokeStyle = '#33F';
					ctx.fillStyle = '#33F';
					ctx.moveTo(rotationCenter[0],rotationCenter[1]);
					ctx.lineTo(rotationPoint[0],rotationPoint[1]);
					ctx.stroke();
					ctx.beginPath();
					ctx.arc(rotationPoint[0],rotationPoint[1],12,0,2*Math.PI);
					ctx.fill();
					obj._cursorPositions.push({
						shape: 'circle',
						dims: [rotationPoint[0],rotationPoint[1],12],
						cursor: draw.cursors.move1,
						func: draw.polygon.interactRotateStart,
						obj:obj
					});
				}
			}
		}
		
		if (obj.points.length > 1) {
			var obj2 = clone(obj);
			/*for (var p = 0; p < obj2.points.length; p++) {
				obj2.points[p][0] = obj2.points[p][0];
				obj2.points[p][1] = obj2.points[p][1];
			}
			if (typeof obj2.angles !== 'undefined') {
				for (var a = 0; a < obj2.angles.length; a++) {
					if (typeof obj2.angles[a] == 'object' && obj2.angles[a] !== null && !un(obj2.angles[a])) {
						if (obj2.angles[a].show === false) {
							obj2.angles[a] = null;
						} else {
							if (typeof obj2.angles[a].lineWidth !== 'undefined') {
								obj2.angles[a].lineWidth = obj2.angles[a].lineWidth;
							}
							if (typeof obj2.angles[a].labelRadius !== 'undefined') {
								obj2.angles[a].labelRadius = obj2.angles[a].labelRadius;
							}
							if (typeof obj2.angles[a].labelFontSize !== 'undefined') {
								obj2.angles[a].labelFontSize = obj2.angles[a].labelFontSize;
							}
							if (typeof obj2.angles[a].radius !== 'undefined') {
								obj2.angles[a].radius = obj2.angles[a].radius;
							}
						}
					}
				}
			}
			obj2.thickness = obj2.thickness;*/
			obj2.ctx = ctx;
			obj2.calcTextSnapPos = path.selected;
			if (obj._selected === true) {
				obj2.thickness = !un(obj.lineWidthSelected) ? obj.lineWidthSelected : obj.thickness + 2;
				obj2.color = !un(obj.colorSelected) ? obj.colorSelected : '#F0F';
			}
			
			var pos = drawPolygon(obj2);
			obj._angleLabelPos = pos.angleLabelPos;
			obj._outerAngleLabelPos = pos.outerAngleLabelPos;
			obj._prismPoints = pos.prismPoints;
			/*obj._textSnapPos = pos.textSnapPos;
			console.log(pos.textSnapPos);
			if (path.selected) {
				for (var i = 0; i < obj._textSnapPos.length; i++) {
					var pos = obj._textSnapPos[i];
					ctx.beginPath();
					ctx.strokeStyle = '#F0F';
					ctx.lineWidth = 2;
					var x = pos.pos[0];
					var y = pos.pos[1];
					if (arraysEqual(pos.align, [-1, 0])) {
						ctx.moveTo(x, y - 10);
						ctx.lineTo(x, y + 10);
					} else if (arraysEqual(pos.align, [-1, -1])) {
						ctx.moveTo(x, y + 10);
						ctx.lineTo(x, y);
						ctx.lineTo(x + 10, y);
					} else if (arraysEqual(pos.align, [0, -1])) {
						ctx.moveTo(x - 10, y);
						ctx.lineTo(x + 10, y);
					} else if (arraysEqual(pos.align, [1, -1])) {
						ctx.moveTo(x, y + 10);
						ctx.lineTo(x, y);
						ctx.lineTo(x - 10, y);
					} else if (arraysEqual(pos.align, [1, 0])) {
						ctx.moveTo(x, y - 10);
						ctx.lineTo(x, y + 10);
					} else if (arraysEqual(pos.align, [1, 1])) {
						ctx.moveTo(x, y - 10);
						ctx.lineTo(x, y);
						ctx.lineTo(x - 10, y);
					} else if (arraysEqual(pos.align, [0, 1])) {
						ctx.moveTo(x - 10, y);
						ctx.lineTo(x + 10, y);
					} else if (arraysEqual(pos.align, [-1, 1])) {
						ctx.moveTo(x, y - 10);
						ctx.lineTo(x, y);
						ctx.lineTo(x + 10, y);
					}
					ctx.stroke();
				}
			}*/
		}
		ctx.setLineDash([]);

		/*if (draw.mode === 'interact' && !un(obj.interact) && obj.interact.disabled !== true) {
			if (obj.interact.selectable === true && obj._selected !== true) {
				obj._cursorPositions.push({
					shape: 'polygon',
					dims: clone(obj.points),
					cursor: draw.cursors.pointer,
					func: draw.polygon.select,
					obj:obj
				});
			}
			
			if (obj._selected === true) {
				ctx.beginPath();
				ctx.fillStyle = '#F00';
				ctx.moveTo(obj._centroid[0],obj._centroid[1]);
				ctx.arc(obj._centroid[0],obj._centroid[1],5,0,2*Math.PI);
				ctx.fill();
				
				if (obj.interact.draggableSelected !== false) {
					obj._cursorPositions.push({
						shape: 'polygon',
						dims: clone(obj.points),
						cursor: draw.cursors.move1,
						func: draw.polygon.interactDragStart,
						obj:obj
					});
				}
				if (obj.interact.rotatableSelected !== false) {
					if (un(obj._rotationAngle)) obj._rotationAngle = !un(obj.interact.rotationAngleStart) ? obj.interact.rotationAngleStart : -Math.PI/2;
					if (un(obj._rotationHandleDist)) {
						draw.polygon.getCentroidVertexAngles(obj);
						var point2 = vector.addVectors(obj._centroid,vector.setMagnitude([Math.cos(obj._rotationAngle),Math.sin(obj._rotationAngle)],1));
						for (var p = 0; p < obj._centroidVertexAngles.length; p++) {
							var a0 = obj._centroidVertexAngles[p];
							var a1 = obj._centroidVertexAngles[(p+1)%obj._centroidVertexAngles.length];
							if (anglesInOrder(a0, obj._rotationAngle, a1) === true) {
								obj._rotationHandleDist = distancePointToLine(obj._centroid,obj.points[p],obj.points[(p+1)%obj.points.length]);
								break;
							}
						}
					}
					if (!un(obj._rotationHandleDist)) {
						var point1 = vector.addVectors(obj._centroid,vector.setMagnitude([Math.cos(obj._rotationAngle),Math.sin(obj._rotationAngle)],obj._rotationHandleDist));
						var point2 = vector.addVectors(obj._centroid,vector.setMagnitude([Math.cos(obj._rotationAngle),Math.sin(obj._rotationAngle)],obj._rotationHandleDist+40));
						ctx.beginPath();
						ctx.lineWidth = 3;
						ctx.strokeStyle = '#F0F';
						ctx.fillStyle = '#F0F';
						ctx.moveTo(point1[0],point1[1]);
						ctx.lineTo(point2[0],point2[1]);
						ctx.stroke();
						ctx.beginPath();
						ctx.arc(point2[0],point2[1],12,0,2*Math.PI);
						ctx.fill();
						obj._cursorPositions.push({
							shape: 'circle',
							dims: [point2[0],point2[1],12],
							cursor: draw.cursors.move1,
							func: draw.polygon.interactRotateStart,
							obj:obj
						});
					}
				}
			}
		}*/

		if (draw.mode === 'edit' && !un(path) && !un(path.obj) && path.obj.length == 1) {
			ctx.save();
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';
			ctx.fillStyle = '#F00';

			if (un(obj._outerAngleLabelPos)) obj._outerAngleLabelPos = [];
			if (un(obj._exteriorAngleLabelPos)) obj._exteriorAngleLabelPos = [];
			for (var k = 0; k < obj.points.length; k++) {
				if ((path.selected == true || (obj.drawing == true && k > 0 && k < obj.points.length - 1)) && (!un(obj.angles) && !un(obj.angles[k]) && (obj.angles[k].measureLabelOnly == true || obj.angles[k].drawCurve == false))) {
					var angleObj = {
						ctx: ctx,
						drawLines: false,
						radius: 30,
						lineColor: colorA(obj.color, 0.3),
						labelMeasure: true,
						labelFontSize: 25,
						labelRadius: 33,
						labelColor: colorA(obj.color, 0.3),
						lineWidth: 2
					};
					if (!un(obj.angles[k]))
						angleObj.measureLabelOnly = !obj.angles[k].measureLabelOnly;
					if (!un(obj.angles[k]))
						angleObj.drawCurve = !obj.angles[k].drawCurve;
					angleObj.b = obj.points[k];
					if (obj.clockwise == false) {
						angleObj.a = obj.points[(k + 1) % (obj.points.length)];
						if (k == 0) {
							angleObj.c = obj.points[obj.points.length - 1];
						} else {
							angleObj.c = obj.points[k - 1];
						}
					} else {
						angleObj.c = obj.points[(k + 1) % (obj.points.length)];
						if (k == 0) {
							angleObj.a = obj.points[obj.points.length - 1];
						} else {
							angleObj.a = obj.points[k - 1];
						}
					}
					if (obj.closed == true || (k !== 0 && k !== obj.points.length - 1))
						drawAngle(angleObj);
				}
				if (path.selected == true && obj.anglesMode == 'outer' && (typeof obj.outerAngles[k] !== 'object' || obj.outerAngles[k].measureLabelOnly == true || obj.outerAngles[k].drawCurve == false)) {
					var angleObj = {
						ctx: ctx,
						drawLines: false,
						radius: 30,
						lineColor: colorA(obj.color, 0.3),
						labelMeasure: true,
						labelFontSize: 25,
						labelRadius: 33,
						labelColor: colorA(obj.color, 0.3),
						lineWidth: 2
					};
					angleObj.b = obj.points[k];
					if (obj.clockwise == true) {
						angleObj.a = obj.points[(k + 1) % (obj.points.length)];
						if (k == 0) {
							angleObj.c = obj.points[obj.points.length - 1];
						} else {
							angleObj.c = obj.points[k - 1];
						}
					} else {
						angleObj.c = obj.points[(k + 1) % (obj.points.length)];
						if (k == 0) {
							angleObj.a = obj.points[obj.points.length - 1];
						} else {
							angleObj.a = obj.points[k - 1];
						}
					}
					obj._outerAngleLabelPos[k] = drawAngle(angleObj);
				}
				if (path.selected == true && obj.anglesMode == 'exterior') {
					if (un(obj._exteriorAngleLabelPos[k])) obj._exteriorAngleLabelPos[k] = [];
					if (typeof obj.exteriorAngles[k] !== 'object') draw.polygon.calcExteriorAnglePositions(obj);
					ctx.save();
					ctx.strokeStyle = colorA(obj.color, 0.3);
					if (obj.exteriorAngles[k].line1.show == false) {
						ctx.beginPath();
						ctx.moveTo(obj.points[k][0], obj.points[k][1]);
						ctx.lineTo(obj.exteriorAngles[k].line1.pos[0], obj.exteriorAngles[k].line1.pos[1]);
						ctx.stroke();
					}
					if (obj.exteriorAngles[k].line2.show == false) {
						ctx.beginPath();
						ctx.moveTo(obj.points[k][0], obj.points[k][1]);
						ctx.lineTo(obj.exteriorAngles[k].line2.pos[0], obj.exteriorAngles[k].line2.pos[1]);
						ctx.stroke();
					}
					ctx.restore();
					var angleObj = {
						ctx: ctx,
						drawLines: false,
						radius: 30,
						lineColor: colorA(obj.color, 0.3),
						labelMeasure: true,
						labelFontSize: 25,
						labelRadius: 33,
						labelColor: colorA(obj.color, 0.3),
						lineWidth: 2
					};
					angleObj.b = obj.points[k];
					var prev = k - 1;
					if (prev < 0) prev = obj.points.length - 1;
					var next = k + 1;
					if (next > obj.points.length - 1) next = 0;
					if (un(obj.exteriorAngles[k].a3) || (obj.exteriorAngles[k].a3.measureLabelOnly == true || obj.exteriorAngles[k].a3.drawCurve == false)) {
						angleObj.a = obj.points[prev];
						angleObj.c = obj.exteriorAngles[k].line1.pos;
						obj._exteriorAngleLabelPos[k][0] = drawAngle(angleObj);
					}
					if (un(obj.exteriorAngles[k].a2) || (obj.exteriorAngles[k].a2.measureLabelOnly == true || obj.exteriorAngles[k].a2.drawCurve == false)) {
						angleObj.a = obj.exteriorAngles[k].line1.pos;
						angleObj.c = obj.exteriorAngles[k].line2.pos;
						obj._exteriorAngleLabelPos[k][1] = drawAngle(angleObj);
					}
					if (un(obj.exteriorAngles[k].a1) || (obj.exteriorAngles[k].a1.measureLabelOnly == true || obj.exteriorAngles[k].a1.drawCurve == false)) {
						angleObj.a = obj.exteriorAngles[k].line2.pos;
						angleObj.c = obj.points[next];
						obj._exteriorAngleLabelPos[k][2] = drawAngle(angleObj);
					}
					ctx.save();
					ctx.fillStyle = '#9FF';
					ctx.beginPath();
					ctx.arc(obj.exteriorAngles[k].line1.pos[0], obj.exteriorAngles[k].line1.pos[1], 7, 0, 2 * Math.PI);
					ctx.fill();
					ctx.stroke();
					ctx.beginPath();
					ctx.arc(obj.exteriorAngles[k].line2.pos[0], obj.exteriorAngles[k].line2.pos[1], 7, 0, 2 * Math.PI);
					ctx.fill();
					ctx.stroke();
					ctx.restore();
				}

				if (path.selected == true) {
					ctx.fillStyle = '#F00';
					if (obj.points.length == 4 && !un(obj.polygonType)) {
						switch (k) {
						case 1:
							if (['rhom', 'kite'].indexOf(obj.polygonType) > -1) {
								ctx.fillStyle = '#66F';
							}
							break;
						case 2:
							if (['rect', 'para'].indexOf(obj.polygonType) > -1) {
								ctx.fillStyle = '#66F';
							} else if (['trap'].indexOf(obj.polygonType) > -1) {
								ctx.fillStyle = '#6F6';
							}
							break;
						case 3:
							if (['rect', 'para', 'rhom', 'kite'].indexOf(obj.polygonType) > -1) {
								continue;
							} else if (['trap'].indexOf(obj.polygonType) > -1) {
								ctx.fillStyle = '#6F6';
							}
							break;
						}
					}
					ctx.beginPath();
					ctx.arc(obj.points[k][0], obj.points[k][1], 7, 0, 2 * Math.PI);
					ctx.fill();
					ctx.stroke();
				}
			}
			if (path.selected && obj.solidType == 'prism') {
				var prismVector = obj.prismVector || [40, -40];
				var prismPoint = pointAddVector(obj.points[0], prismVector);
				ctx.fillStyle = '#F0F';
				ctx.beginPath();
				ctx.arc(prismPoint[0], prismPoint[1], 7, 0, 2 * Math.PI);
				ctx.fill();
				ctx.stroke();
			}
			ctx.restore();
		} else if (!un(obj.interact) && obj.interact.polygonPoints === true) {
			ctx.save();
			ctx.fillStyle = typeof obj.interact.polygonPointsFillStyle === 'string' ? obj.interact.polygonPointsFillStyle : '#006';
			ctx.strokeStyle = typeof obj.interact.polygonPointsStrokeStyle === 'string' ? obj.interact.polygonPointsStrokeStyle : '#006';
			ctx.lineWidth = typeof obj.interact.polygonPointsLineWidth === 'number' ? obj.interact.polygonPointsLineWidth : 2;
			var polygonPointsRadius = typeof obj.interact.polygonPointsRadius === 'number' ? obj.interact.polygonPointsRadius : 8;
			for (var k = 0; k < obj.points.length; k++) {
				if (obj.points.length == 4 && k == 4 && ['rect', 'para', 'rhom', 'kite'].indexOf(obj.polygonType) > -1) continue;
				ctx.beginPath();
				ctx.arc(obj.points[k][0], obj.points[k][1], polygonPointsRadius, 0, 2 * Math.PI);
				ctx.fill();
				ctx.stroke();				
				obj._cursorPositions.push({
					shape: 'circle',
					dims: [obj.points[k][0], obj.points[k][1], 20],
					cursor: draw.cursors.move1,
					func: draw.polygon.startPosDragInteract,
					obj:obj,
					point: k
				});
			}
			ctx.restore();
		}
		delete obj.angleLabelPos;
		delete obj.left;
		delete obj.top;
		delete obj.right;
		delete obj.bottom;
		delete obj.width;
		delete obj.height;
	},
	getRect: function (obj) {
		if (un(obj.points) || obj.points.length === 0) return [0,0,10,10];
		obj._left = obj.points[0][0] - 10;
		obj._top = obj.points[0][1] - 10;
		obj._right = obj.points[0][0] + 10;
		obj._bottom = obj.points[0][1] + 10;
		for (var j = 1; j < obj.points.length; j++) {
			obj._left = Math.min(obj._left, obj.points[j][0] - 10);
			obj._top = Math.min(obj._top, obj.points[j][1] - 10);
			obj._right = Math.max(obj._right, obj.points[j][0] + 10);
			obj._bottom = Math.max(obj._bottom, obj.points[j][1] + 10);
		}
		if (obj.solidType == 'prism') {
			var prismVector = obj.prismVector || [40, -40];
			for (var p = 0; p < obj.points.length; p++) {
				var prismPoint = pointAddVector(obj.points[p], prismVector);
				obj._left = Math.min(obj._left, prismPoint[0] - 10);
				obj._top = Math.min(obj._top, prismPoint[1] - 10);
				obj._right = Math.max(obj._right, prismPoint[0] + 10);
				obj._bottom = Math.max(obj._bottom, prismPoint[1] + 10);
			}
		}
		if (obj.anglesMode == 'exterior') {
			for (var p = 0; p < obj.points.length; p++) {
				if (!un(obj.exteriorAngles[p])) {
					if (!un(obj.exteriorAngles[p].line1)) {
						ePoint = obj.exteriorAngles[p].line1.pos;
						obj._left = Math.min(obj._left, ePoint[0] - 10);
						obj._top = Math.min(obj._top, ePoint[1] - 10);
						obj._right = Math.max(obj._right, ePoint[0] + 10);
						obj._bottom = Math.max(obj._bottom, ePoint[1] + 10);
					}
					if (!un(obj.exteriorAngles[p].line2)) {
						ePoint = obj.exteriorAngles[p].line2.pos;
						obj._left = Math.min(obj._left, ePoint[0] - 10);
						obj._top = Math.min(obj._top, ePoint[1] - 10);
						obj._right = Math.max(obj._right, ePoint[0] + 10);
						obj._bottom = Math.max(obj._bottom, ePoint[1] + 10);
					}
				}
			}
		}
		if (obj.anglesMode == 'outer') {
			for (var j = 0; j < obj.points.length; j++) {
				obj._left = Math.min(obj._left, obj.points[j][0] - 70);
				obj._top = Math.min(obj._top, obj.points[j][1] - 70);
				obj._right = Math.max(obj._right, obj.points[j][0] + 70);
				obj._bottom = Math.max(obj._bottom, obj.points[j][1] + 70);
			}
		}

		obj._width = obj._right - obj._left;
		obj._height = obj._bottom - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		for (var k = 0; k < obj.points.length; k++) {
			if (obj.closed == false && k == obj.points.length - 1)
				continue;
			var p1 = obj.points[k];
			var p2 = obj.points[(k + 1) % (obj.points.length)];
			var mid = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
			pos.push({
				shape: 'circle',
				dims: [mid[0], mid[1], 30],
				cursor: draw.cursors.pointer,
				func: draw.polygon.setLineDecoration,
				pathNum: pathNum,
				point: k
			});
		}
		for (var k = 0; k < obj.points.length; k++) {
			if (!un(obj._angleLabelPos) && !un(obj._angleLabelPos[k])) {
				pos.push({
					shape: 'rect',
					dims: obj._angleLabelPos[k],
					cursor: draw.cursors.pointer,
					func: draw.polygon.toggleAngleLabel,
					pathNum: pathNum,
					point: k
				});
			}
			if (obj.clockwise == true) {
				var next = k - 1;
				var prev = k + 1;
				if (k == 0)
					next = obj.points.length - 1;
				if (k == obj.points.length - 1)
					prev = 0;
			} else {
				var prev = k - 1;
				var next = k + 1;
				if (k == 0)
					prev = obj.points.length - 1;
				if (k == obj.points.length - 1)
					next = 0;
			}
			pos.push({
				shape: 'sector',
				dims: [obj.points[k][0], obj.points[k][1], 32, getAngleTwoPoints(obj.points[k], obj.points[next]), getAngleTwoPoints(obj.points[k], obj.points[prev])],
				cursor: draw.cursors.pointer,
				func: draw.polygon.toggleAngle,
				pathNum: pathNum,
				point: k
			});

			if (obj.anglesMode == 'outer' && !un(obj.outerAngles)) {
				pos.push({
					shape: 'sector',
					dims: [obj.points[k][0], obj.points[k][1], 32, getAngleTwoPoints(obj.points[k], obj.points[prev]), getAngleTwoPoints(obj.points[k], obj.points[next])],
					cursor: draw.cursors.pointer,
					func: draw.polygon.toggleOuterAngle,
					pathNum: pathNum,
					point: k
				});
				if (!un(obj._outerAngleLabelPos) && !un(obj._outerAngleLabelPos[k])) {
					pos.push({
						shape: 'rect',
						dims: obj._outerAngleLabelPos[k],
						cursor: draw.cursors.pointer,
						func: draw.polygon.toggleOuterAngleLabel,
						pathNum: pathNum,
						point: k
					});
				}

			} else if (obj.anglesMode == 'exterior' && !un(obj.exteriorAngles)) {
				if (typeof obj.exteriorAngles[k] !== 'object') draw.polygon.calcExteriorAnglePositions(obj);
				var pos11 = obj.exteriorAngles[k].line1.pos;
				var pos22 = obj.exteriorAngles[k].line2.pos;
				pos.push({
					shape: 'circle',
					dims: [pos11[0], pos11[1], 10],
					cursor: draw.cursors.pointer,
					func: draw.polygon.startExtAnglePointDrag,
					pathNum: pathNum,
					point: k,
					line: 1
				});
				pos.push({
					shape: 'circle',
					dims: [pos22[0], pos22[1], 10],
					cursor: draw.cursors.pointer,
					func: draw.polygon.startExtAnglePointDrag,
					pathNum: pathNum,
					point: k,
					line: 2
				});

				pos.push({
					shape: 'sector',
					dims: [obj.points[k][0], obj.points[k][1], 32, getAngleTwoPoints(obj.points[k], obj.points[prev]), getAngleTwoPoints(obj.points[k], pos11)],
					cursor: draw.cursors.pointer,
					func: draw.polygon.toggleExteriorAngle,
					pathNum: pathNum,
					point: k,
					sub: 3
				});
				pos.push({
					shape: 'sector',
					dims: [obj.points[k][0], obj.points[k][1], 32, getAngleTwoPoints(obj.points[k], pos11), getAngleTwoPoints(obj.points[k], pos22)],
					cursor: draw.cursors.pointer,
					func: draw.polygon.toggleExteriorAngle,
					pathNum: pathNum,
					point: k,
					sub: 2
				});
				pos.push({
					shape: 'sector',
					dims: [obj.points[k][0], obj.points[k][1], 32, getAngleTwoPoints(obj.points[k], pos22), getAngleTwoPoints(obj.points[k], obj.points[next])],
					cursor: draw.cursors.pointer,
					func: draw.polygon.toggleExteriorAngle,
					pathNum: pathNum,
					point: k,
					sub: 1
				});

				if (!un(obj._exteriorAngleLabelPos) && !un(obj._exteriorAngleLabelPos[k])) {
					if (!un(obj._exteriorAngleLabelPos[k][0])) {
						pos.push({
							shape: 'rect',
							dims: obj._exteriorAngleLabelPos[k][0],
							cursor: draw.cursors.pointer,
							func: draw.polygon.toggleExteriorAngleLabel,
							pathNum: pathNum,
							point: k,
							sub: 3
						});
					}
					if (!un(obj._exteriorAngleLabelPos[k][1])) {
						pos.push({
							shape: 'rect',
							dims: obj._exteriorAngleLabelPos[k][1],
							cursor: draw.cursors.pointer,
							func: draw.polygon.toggleExteriorAngleLabel,
							pathNum: pathNum,
							point: k,
							sub: 2
						});
					}
					if (!un(obj._exteriorAngleLabelPos[k][2])) {
						pos.push({
							shape: 'rect',
							dims: obj._exteriorAngleLabelPos[k][2],
							cursor: draw.cursors.pointer,
							func: draw.polygon.toggleExteriorAngleLabel,
							pathNum: pathNum,
							point: k,
							sub: 1
						});
					}
				}
			}
		}
		if (obj.solidType == 'prism') {
			var prismVector = obj.prismVector || [40, -40];
			var point = pointAddVector(obj.points[0], prismVector);
			pos.push({
				shape: 'circle',
				dims: [point[0], point[1], 10],
				cursor: draw.cursors.pointer,
				func: draw.polygon.startPrismPointDrag,
				pathNum: pathNum
			});
		}
		for (var k = 0; k < obj.points.length; k++) {
			if (obj.points.length == 4 && k == 4 && ['rect', 'para', 'rhom', 'kite'].indexOf(obj.polygonType) > -1)
				continue;
			pos.push({
				shape: 'circle',
				dims: [obj.points[k][0], obj.points[k][1], 10],
				cursor: draw.cursors.pointer,
				func: draw.polygon.startPosDrag,
				pathNum: pathNum,
				point: k
			});
		}
		obj._cursorPositions = pos;
		return pos;
	},
	getCursorPositionsInteract: function (obj, path, pathNum) {
		return obj._cursorPositions instanceof Array ? obj._cursorPositions : [];
		/*var pos = [];
		if (!un(obj.interact) && obj.interact.polygonPoints === true) {
			for (var k = 0; k < obj.points.length; k++) {
				if (obj.points.length == 4 && k == 4 && ['rect', 'para', 'rhom', 'kite'].indexOf(obj.polygonType) > -1) continue;
				pos.push({
					shape: 'circle',
					dims: [obj.points[k][0], obj.points[k][1], 20],
					cursor: draw.cursors.move1,
					func: draw.polygon.startPosDragInteract,
					pathNum: pathNum,
					obj:obj,
					point: k
				});
			}
		}
		obj._cursorPositions = pos;
		return pos;*/
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		if (typeof pathNum == 'undefined') return;
		if (un(draw.path[pathNum])) return;
		var obj = draw.path[pathNum].obj[0];
		var buttons = [];
		/*buttons.push({
			buttonType: 'polygon-makeRegular',
			shape: 'rect',
			dims: [x2 - 20, y2 - 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.polygon.makeRegular,
			pathNum: pathNum
		});*/
		buttons.push({
			buttonType: 'polygon-verticesPlus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 60, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.polygon.verticesPlus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'polygon-verticesMinus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.polygon.verticesMinus,
			pathNum: pathNum
		});
		/*buttons.push({
			buttonType: 'polygon-setPrism',
			shape: 'rect',
			dims: [x2 - 20, y2 - 100, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.polygon.setPrism,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'polygon-setOuterAngles',
			shape: 'rect',
			dims: [x2 - 20, y2 - 120, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.polygon.setOuterAngles,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'polygon-setExteriorAngles',
			shape: 'rect',
			dims: [x2 - 20, y2 - 140, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.polygon.setExteriorAngles,
			pathNum: pathNum
		});*/
		if (obj.points instanceof Array && obj.points.length == 4) {
			buttons.push({
				buttonType: 'polygon-setTypeKite',
				shape: 'rect',
				dims: [x2 - 40, y2 - 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.polygon.setType,
				pathNum: pathNum,
				type: 'kite'
			});
			buttons.push({
				buttonType: 'polygon-setTypeRhom',
				shape: 'rect',
				dims: [x2 - 60, y2 - 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.polygon.setType,
				pathNum: pathNum,
				type: 'rhom'
			});
			buttons.push({
				buttonType: 'polygon-setTypeTrap',
				shape: 'rect',
				dims: [x2 - 80, y2 - 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.polygon.setType,
				pathNum: pathNum,
				type: 'trap'
			});
			buttons.push({
				buttonType: 'polygon-setTypePara',
				shape: 'rect',
				dims: [x2 - 100, y2 - 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.polygon.setType,
				pathNum: pathNum,
				type: 'para'
			});
			buttons.push({
				buttonType: 'polygon-setTypeRect',
				shape: 'rect',
				dims: [x2 - 120, y2 - 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.polygon.setType,
				pathNum: pathNum,
				type: 'rect'
			});
			buttons.push({
				buttonType: 'polygon-setTypeSquare',
				shape: 'rect',
				dims: [x2 - 140, y2 - 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.polygon.setType,
				pathNum: pathNum,
				type: 'square'
			});
		}
		if (un(obj.polygonType) || ['square', 'rect', 'para', 'trap', 'rhom', 'kite', 'equi', 'isos', 'right', 'rightisos'].indexOf(obj.polygonType) == -1) {
			// resize handle in bottom right corner
			buttons.push({
				buttonType: 'resize',
				shape: 'rect',
				dims: [x2 - 20, y2 - 20, 20, 20],
				cursor: draw.cursors.nw,
				func: drawClickStartResizeObject,
				pathNum: pathNum
			});
		}
		if (obj.solidType === 'prism') {
			buttons.push({
				buttonType: 'polygon-prism-toggle-line-vis',
				shape: 'rect',
				dims: [x2 - 20, y1 + 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.polygon.prismToggleLineVis,
				pathNum: pathNum,
				obj: obj,
				draw: function(path, ctx, l, t, w, h) {
					ctx.fillStyle = '#09F';
					ctx.fillRect(l,t,w,h);
				}
			});
		}
		return buttons;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		for (var k = 0; k < obj.points.length; k++) {
			obj.points[k][0] += dl;
			obj.points[k][1] += dt;
		}
		if (dw !== 0 || dh !== 0) {
			var x = draw.mouse[0];
			var y = draw.mouse[1];
			if (shiftOn == true) {
				var sf = Math.min((x - obj._left) / obj._width, (y - obj._top) / obj._height);
				var xsf = sf;
				var ysf = sf;
			} else {
				var xsf = (x - obj._left) / obj._width;
				var ysf = (y - obj._top) / obj._height;
			}
			for (var k = 0; k < obj.points.length; k++) {
				obj.points[k][0] = obj._left + obj._width * xsf * ((obj.points[k][0] - obj._left) / obj._width);
				obj.points[k][1] = obj._top + obj._height * ysf * ((obj.points[k][1] - obj._top) / obj._height);
			}
		}
		if (!un(obj.exteriorAngles)) {
			for (var v = 0; v < obj.exteriorAngles.length; v++) {
				var prev = v - 1;
				if (prev == -1)
					prev = obj.points.length - 1;
				var next = v + 1;
				if (next == obj.points.length)
					next = 0;
				var vector1 = getVectorAB(obj.points[prev], obj.points[v]);
				var pos1 = pointAddVector(obj.points[v], getUnitVector(vector1), obj.exteriorAngles[v].line2.dist);
				var vector2 = getVectorAB(obj.points[next], obj.points[v]);
				var pos2 = pointAddVector(obj.points[v], getUnitVector(vector2), obj.exteriorAngles[v].line1.dist);
				obj.exteriorAngles[v].line1.vector = vector2;
				obj.exteriorAngles[v].line1.pos = pos2;
				obj.exteriorAngles[v].line2.vector = vector1;
				obj.exteriorAngles[v].line2.pos = pos1;
			}
		}
	},
	startPosDragInteract: function () {
		changeDrawMode('polygonPointDrag');
		var obj = draw.currCursor.obj;
		var point = draw.currCursor.point;
		draw._drag = {
			obj:obj,
			point:point,
			center:draw.three.get2dPolygonCentroid(obj.points),
			offsets:[]
		};
		if (obj.points.length == 4 && obj.polygonType === 'para') {
			var p0 = obj.points[point];
			var p1 = obj.points[(point+1)%4];
			var p2 = obj.points[(point+2)%4];
			var p3 = obj.points[(point+3)%4];
			draw._drag.parallelogramAngle = Math.PI+measureAngle({a:p3,b:p0,c:p1});
		}
		for (var i = 0; i < obj.points.length; i++) draw._drag.offsets[i] = [dist(draw._drag.center,obj.points[i]),getAngleTwoPoints(draw._drag.center,obj.points[i])];
		updateSnapPoints();
		draw.lockCursor = true;
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.animate(draw.polygon.posMoveInteract,draw.polygon.posStopInteract,drawCanvasPaths);
	},
	posMoveInteract: function (e) {
		updateMouse(e);
		var x = draw.mouse[0];
		var y = draw.mouse[1];
		var obj = draw._drag.obj;
		var p = draw._drag.point;
		var points = obj.points;
		var center = draw._drag.center;
		var offsets = draw._drag.offsets;
		
		if (draw.mode === 'interact' && !un(obj.interact)) {
			var pos = [x,y];
			if (!un(obj.interact.snapToGrid)) {
				var grid = o(obj.interact.snapToGrid);
				var coord = draw.grid.getCoordAtPos(grid, [x,y]);
				coord[0] = Math.max(grid.xMin,Math.min(grid.xMax,roundToNearest(coord[0], grid.xMinorStep)));
				coord[1] = Math.max(grid.yMin,Math.min(grid.yMax,roundToNearest(coord[1], grid.yMinorStep)));
				pos = getPosOfCoord(coord,grid);
				if (obj.interact.allowSelfIntersect === false) {
					var coords = [];
					for (var p2 = 0; p2 < obj.points.length; p2++) {
						if (p2 === p) {
							coords[p2] = coord;
						} else {
							var coord2 = draw.grid.getCoordAtPos(grid, obj.points[p2]);
							coord2[0] = roundToNearest(coord2[0], grid.xMinorStep);
							coord2[1] = roundToNearest(coord2[1], grid.yMinorStep);
							if (coord2[0] === coord[0] && coord2[1] === coord[1]) {
								//console.log('points equal');
								return;
							}
							coords[p2] = coord2;
						}
					}
					if (polygonClockwiseTest(coords) === false) {
						//console.log('inverted');
						return;
					}
					for (var i = 0; i < coords.length; i++) {
						var c1 = coords[i];
						var c2 = coords[(i + 1) % coords.length];
						for (var j = 0; j < coords.length; j++) {
							if (j === i || j === (i + 1) % coords.length) continue;
							if (isPointOnLineSegment(coords[j],c1,c2)) {
								//console.log('point on edge');
								return;
							}
						}
					}
					for (var i = 0; i < coords.length; i++) {	
						var c1 = coords[i];
						var c2 = coords[(i + 1) % coords.length];
						for (var j = i+2; j < coords.length; j++) {
							if (i === (j + 1) % coords.length || j === (i + 1) % coords.length) continue;
							var c3 = coords[j];
							var c4 = coords[(j + 1) % coords.length];
							if (intersects(c1[0], c1[1], c2[0], c2[1], c3[0], c3[1], c4[0], c4[1]) == true) {
								//console.log('edges intersecting');
								return;
							}
						}
					}
				}
			}
		} else if (snapToObj2On || draw.snapLinesTogether) {
			var pos = snapToObj2([x, y], pathNum);
		}
		if (draw.mode === 'interact' && !un(obj.interact) && obj.interact.dragArea instanceof Array) {
			var dragArea = obj.interact.dragArea;
			pos[0] = Math.min(Math.max(pos[0],dragArea[0]),dragArea[0]+dragArea[2]);
			pos[1] = Math.min(Math.max(pos[1],dragArea[1]),dragArea[1]+dragArea[3]);
		}
		if (!un(obj.polygonType) && (obj.points.length == 4 || obj.points.length == 3) && obj.polygonType !== 'none') {
			switch (obj.polygonType) {
			case 'square':
					/*var pivot; // test if a previous point has been moved and use this as a pivot
					if (!un(obj._pivotPoint)) {
						if (obj._pivotPoint[0] !== p) {
							pivot = obj._pivotPoint[0];
						} else if (!un(obj._pivotPoint[1])) {
							pivot = obj._pivotPoint[1];
						}
					}
					if (!un(pivot)) {
						points[p] = pos;

						var p2 = [];
						for (var p3 = p; p3 < p + 4; p3++) {
							p2.push(p3 % 4);
						};

						if (pivot - p == 1 || p - pivot == 3) {
							var sideLen = getDist(points[p], points[pivot]);
							var vector1 = getVectorAB(points[p], points[pivot]);
							var vector2 = rotateVector(vector1, Math.PI / 2);
							points[p2[3]] = pointAddVector(points[p], setVectorMag(vector2, sideLen));
							points[p2[2]] = pointAddVector(points[pivot], setVectorMag(vector2, sideLen));
							break;
						} else if (pivot - p == -1 || p - pivot == -3) {
							var sideLen = getDist(points[p], points[pivot]);
							var vector1 = getVectorAB(points[p], points[pivot]);
							var vector2 = rotateVector(vector1, -Math.PI / 2);
							points[p2[1]] = pointAddVector(points[p], setVectorMag(vector2, sideLen));
							points[p2[2]] = pointAddVector(points[pivot], setVectorMag(vector2, sideLen));
							break;
						}
					}

				var p2 = []; // p2[0] is moving point, p2[2] is opposite
				for (var p3 = p; p3 < p + 4; p3++) {
					p2.push(p3 % 4);
				};

				points[p] = pos;
				var sideLen = getDist(points[p], points[p2[2]]) / Math.sqrt(2);
				var diagVector = getVectorAB(points[p], points[p2[2]]);
				var vector1 = rotateVector(diagVector, -Math.PI / 4);
				var vector2 = rotateVector(diagVector, Math.PI / 4);
				points[p2[1]] = pointAddVector(points[p], setVectorMag(vector1, sideLen));
				points[p2[3]] = pointAddVector(points[p], setVectorMag(vector2, sideLen));*/
				
				var da = getAngleTwoPoints(center,pos)-offsets[p][1];
				var len = dist(center,pos);
				points[p] = pos;
				var offset1 = offsets[(p+1)%4];
				points[(p+1)%4] = vector.addVectors(center,[len*Math.cos(offset1[1]+da),len*Math.sin(offset1[1]+da)]);
				var offset2 = offsets[(p+2)%4];
				points[(p+2)%4] = vector.addVectors(center,[len*Math.cos(offset2[1]+da),len*Math.sin(offset2[1]+da)]);
				var offset3 = offsets[(p+3)%4];
				points[(p+3)%4] = vector.addVectors(center,[len*Math.cos(offset3[1]+da),len*Math.sin(offset3[1]+da)]);
				break;
			case 'rect':
				var p0 = points[p];
				var p1 = points[(p+1)%4];
				var p2 = points[(p+2)%4];
				var p3 = points[(p+3)%4];
				var v = setVectorMag(getPerpVector(getVectorAB(p3, pos)), getDist(p0, p1));
				points[p] = pos;
				points[(p+1)%4] = pointAddVector(pos, v);
				points[(p+2)%4] = pointAddVector(p3, v);
				
				/*var da = getAngleTwoPoints(center,pos)-offsets[p][1];
				var len = dist(center,pos);
				points[p] = pos;
				var offset1 = offsets[(p+1)%4];
				points[(p+1)%4] = vector.addVectors(center,[len*Math.cos(offset1[1]+da),len*Math.sin(offset1[1]+da)]);
				var offset2 = offsets[(p+2)%4];
				points[(p+2)%4] = vector.addVectors(center,[len*Math.cos(offset2[1]+da),len*Math.sin(offset2[1]+da)]);
				var offset3 = offsets[(p+3)%4];
				points[(p+3)%4] = vector.addVectors(center,[len*Math.cos(offset3[1]+da),len*Math.sin(offset3[1]+da)]);*/
				break;
			case 'para':
				/*if (p == 0 || p == 1) {
					if (shiftOn) {
						var pos2 = p == 0 ? points[1] : points[0];
						if (Math.abs(pos[0] - pos2[0]) < Math.abs(pos[1] - pos2[1])) {
							pos[0] = pos2[0];
						} else {
							pos[1] = pos2[1];
						}
					}
					if (p === 0 && dist(pos[0],pos[1],points[1][0],points[1][1]) > 5 || p === 1 && dist(pos[0],pos[1],points[0][0],points[0][1]) > 5) {
						var vector1 = getVectorAB(points[0], points[1]);
						var angle1 = getVectorAngle(vector1);
						var vector2 = getVectorAB(points[1], points[2]);
						points[p] = pos;
						var vector3 = getVectorAB(points[0], points[1]);
						var angle3 = getVectorAngle(vector3);
						var vector4 = rotateVector(vector2, angle3 - angle1);
						points[2] = pointAddVector(points[1], vector4);
						points[3] = pointAddVector(points[0], vector4);
					}
				} else if (p == 2 && dist(pos[0],pos[1],points[1][0],points[1][1]) > 5) {
					points[p] = pos;
					var vector1 = getVectorAB(points[1], points[2]);
					points[3] = pointAddVector(points[0], vector1);
				} else if (p == 3 && dist(pos[0],pos[1],points[0][0],points[0][1]) > 5) {
					points[p] = pos;
					var vector1 = getVectorAB(points[0], points[3]);
					points[2] = pointAddVector(points[1], vector1);
				}*/
				
				
				/*var p0 = points[p];
				var p1 = points[(p+1)%4];
				var p2 = points[(p+2)%4];
				var p3 = points[(p+3)%4];
				var v = getVectorAB(p3, p0);
				v = rotateVector(v, draw._drag.parallelogramAngle);
				v = setVectorMag(v, getDist(p0, p1));
				points[p] = pos;
				points[(p+1)%4] = pointAddVector(pos, v);
				points[(p+2)%4] = pointAddVector(p3, v);*/
				
				var da = getAngleTwoPoints(center,pos)-offsets[p][1];
				var len = dist(center,pos);
				points[p] = pos;
				var offset2 = offsets[(p+2)%4];
				points[(p+2)%4] = vector.addVectors(center,[len*Math.cos(offset2[1]+da),len*Math.sin(offset2[1]+da)]);
				break;
			case 'trap':
				var vector1a = getVectorAB(points[0], points[1]);
				var vector2a = getVectorAB(points[1], points[2]);
				var vector3a = getVectorAB(points[0], points[3]);
				var vector4a = getVectorAB(points[2], points[3]);
				var angle1a = getVectorAngle(vector1a);
				points = clone(points);
				points[p] = pos;
				switch (p) {
					case 0:
					case 1:
						var vector1b = getVectorAB(points[0], points[1]);
						var angle1b = getVectorAngle(vector1b);
						var vector2b = rotateVector(vector2a, angle1b - angle1a);
						var vector3b = rotateVector(vector3a, angle1b - angle1a);
						points[2] = pointAddVector(points[1], vector2b);
						points[3] = pointAddVector(points[0], vector3b);
						break;
					case 2:
						points[3] = getVectorLinesIntersection(points[2], vector4a, points[0], vector3a);
						break;
					case 3:
						points[2] = getVectorLinesIntersection(points[3], vector4a, points[1], vector2a);
						break;
				}
				if (dist(points[0],points[1]) > 10 && dist(points[2],points[3]) > 10 && Math.abs(getVectorAngle(vector.getVectorAB(points[0],points[1])) - getVectorAngle(vector.getVectorAB(points[2],points[3]))) > 0.5) obj.points = points;
				break;
			case 'trap-isos':
				var vector1a = getVectorAB(points[0], points[1]);
				var vector2a = getVectorAB(points[1], points[2]);
				var vector3a = getVectorAB(points[0], points[3]);
				var vector4a = getVectorAB(points[2], points[3]);
				var angle1a = getVectorAngle(vector1a);
				points = clone(points);
				points[p] = pos;
				switch (p) {
					case 0:
					case 1:
						var vector1b = getVectorAB(points[0], points[1]);
						var angle1b = getVectorAngle(vector1b);
						var vector2b = rotateVector(vector2a, angle1b - angle1a);
						var vector3b = rotateVector(vector3a, angle1b - angle1a);
						points[2] = pointAddVector(points[1], vector2b);
						points[3] = pointAddVector(points[0], vector3b);
						break;
					case 2:
						var mid = getMidpoint(points[0],points[1]);
						var perpVector = rotateVector(getVectorAB(points[0], points[1]), Math.PI/2);
						points[3] = reflectPoint(points[2],[mid,vector.addVectors(mid,perpVector)]);
						break;
					case 3:
						var mid = getMidpoint(points[0],points[1]);
						var perpVector = rotateVector(getVectorAB(points[0], points[1]), Math.PI/2);
						points[2] = reflectPoint(points[3],[mid,vector.addVectors(mid,perpVector)]);
						break;
				}
				if (dist(points[0],points[1]) > 10 && dist(points[2],points[3]) > 10 && Math.abs(getVectorAngle(vector.getVectorAB(points[0],points[1])) - getVectorAngle(vector.getVectorAB(points[2],points[3]))) > 0.5) obj.points = points;				
				break;
			case 'trap-right':
				if (p === 3) {
					var da = getAngleTwoPoints(pos, points[0]) - getAngleTwoPoints(points[3], points[0]);
					points = clone(points);
					var vector01b = rotateVector(getVectorAB(points[0],points[1]),da);
					var vector32b = rotateVector(getVectorAB(points[3],points[2]),da);
					points[1] = vector.addVectors(points[0],vector01b);
					points[2] = vector.addVectors(pos,vector32b);
					points[3] = pos;
				} else {
					var vector1a = getVectorAB(points[0], points[1]);
					var vector2a = getVectorAB(points[1], points[2]);
					var vector3a = getVectorAB(points[0], points[3]);
					var vector4a = getVectorAB(points[2], points[3]);
					var angle1a = getVectorAngle(vector1a);
					points = clone(points);
					points[p] = pos;
					if (p === 0 || p === 1) {
						var vector1b = getVectorAB(points[0], points[1]);
						var angle1b = getVectorAngle(vector1b);
						var vector2b = rotateVector(vector2a, angle1b - angle1a);
						var vector3b = rotateVector(vector3a, angle1b - angle1a);
						points[2] = pointAddVector(points[1], vector2b);
					}
					var a = points[0];
					var b = vector.addVectors(a,rotateVector(getVectorAB(points[0], points[1]),Math.PI/2));
					var c = points[2];
					var d = vector.addVectors(c,getVectorAB(points[0], points[1]),Math.PI/2);
					points[3] = intersection(a[0],a[1],b[0],b[1],c[0],c[1],d[0],d[1]);
				}
				if (dist(points[0],points[1]) > 20 && dist(points[2],points[3]) > 20 && Math.abs(getVectorAngle(vector.getVectorAB(points[0],points[1])) - getVectorAngle(vector.getVectorAB(points[2],points[3]))) > 0.5) obj.points = points;				
				break;
			case 'rhom':
				/*var mid = getMidpoint(points[0], points[2]);
				var vector1 = getVectorAB(mid, points[1]);
				var vector3 = getVectorAB(mid, points[3]);
				if (p == 0 || p == 2) {
					points[p] = pos;
					var mid2 = getMidpoint(points[0], points[2]);
					var vector2 = getVectorAB(points[0], points[2]);
					var vector4 = setVectorMag(getPerpVector(vector2), getVectorMag(vector1)); ;
					points[1] = pointAddVector(mid2, vector4, -1);
					points[3] = pointAddVector(mid2, vector4);
				} else if (p == 1) {
					var mag = getDist(mid, [x, y]);
					points[1] = pointAddVector(mid, setVectorMag(vector1, mag));
					points[3] = pointAddVector(mid, setVectorMag(vector3, mag));
				}*/
				
				var da = getAngleTwoPoints(center,pos)-offsets[p][1];
				var len = dist(center,pos);
				points[p] = pos;
				var offset1 = offsets[(p+1)%4];
				points[(p+1)%4] = vector.addVectors(center,[offset1[0]*Math.cos(offset1[1]+da),offset1[0]*Math.sin(offset1[1]+da)]);
				var offset2 = offsets[(p+2)%4];
				points[(p+2)%4] = vector.addVectors(center,[len*Math.cos(offset2[1]+da),len*Math.sin(offset2[1]+da)]);
				var offset3 = offsets[(p+3)%4];
				points[(p+3)%4] = vector.addVectors(center,[offset3[0]*Math.cos(offset3[1]+da),offset3[0]*Math.sin(offset3[1]+da)]);
				break;
			case 'kite':
				if (p == 0) {
					var vector1a = getVectorAB(points[2], points[1]);
					var vector2a = getVectorAB(points[2], points[3]);
					var vector3a = getVectorAB(points[2], points[0]);
					points[p] = pos;
					var vector3b = getVectorAB(points[2], points[0]);
					var angle1 = getVectorAngle(vector3a);
					var angle2 = getVectorAngle(vector3b);
					var vector1b = rotateVector(vector1a, angle2 - angle1);
					var vector2b = rotateVector(vector2a, angle2 - angle1);
					points[1] = pointAddVector(points[2], vector1b);
					points[3] = pointAddVector(points[2], vector2b);
				} else if (p == 2) {
					var vector1a = getVectorAB(points[0], points[1]);
					var vector2a = getVectorAB(points[0], points[3]);
					var vector3a = getVectorAB(points[0], points[2]);
					points[p] = pos;
					var vector3b = getVectorAB(points[0], points[2]);
					var angle1 = getVectorAngle(vector3a);
					var angle2 = getVectorAngle(vector3b);
					var vector1b = rotateVector(vector1a, angle2 - angle1);
					var vector2b = rotateVector(vector2a, angle2 - angle1);
					points[1] = pointAddVector(points[0], vector1b);
					points[3] = pointAddVector(points[0], vector2b);
				} else if (p == 1) {
					points[p] = pos;
					var vector1 = getVectorAB(points[0], points[2]);
					var mid = getFootOfPerp(points[0], vector1, points[1]);
					var vector2 = getVectorAB(mid, points[1]);
					points[3] = pointAddVector(mid, vector2, -1);
				} else if (p == 3) {
					points[p] = pos;
					var vector1 = getVectorAB(points[0], points[2]);
					var mid = getFootOfPerp(points[0], vector1, points[3]);
					var vector2 = getVectorAB(mid, points[3]);
					points[1] = pointAddVector(mid, vector2, -1);
				}
				/*if (p === 1 || p === 3) {
					var da = getAngleTwoPoints(center,pos)-offsets[p][1];
					var len = dist(center,pos);
					points[p] = pos;
					var offset1 = offsets[(p+1)%4];
					points[(p+1)%4] = vector.addVectors(center,[offset1[0]*Math.cos(offset1[1]+da),offset1[0]*Math.sin(offset1[1]+da)]);
					var offset2 = offsets[(p+2)%4];
					points[(p+2)%4] = vector.addVectors(center,[len*Math.cos(offset2[1]+da),len*Math.sin(offset2[1]+da)]);
					var offset3 = offsets[(p+3)%4];
					points[(p+3)%4] = vector.addVectors(center,[offset3[0]*Math.cos(offset3[1]+da),offset3[0]*Math.sin(offset3[1]+da)]);
				} else {
					var da = getAngleTwoPoints(center,pos)-offsets[p][1];
					points[p] = pos;
					var offset1 = offsets[(p+1)%4];
					points[(p+1)%4] = vector.addVectors(center,[offset1[0]*Math.cos(offset1[1]+da),offset1[0]*Math.sin(offset1[1]+da)]);
					var offset2 = offsets[(p+2)%4];
					points[(p+2)%4] = vector.addVectors(center,[offset2[0]*Math.cos(offset2[1]+da),offset2[0]*Math.sin(offset2[1]+da)]);
					var offset3 = offsets[(p+3)%4];
					points[(p+3)%4] = vector.addVectors(center,[offset3[0]*Math.cos(offset3[1]+da),offset3[0]*Math.sin(offset3[1]+da)]);
				}*/
				break;
			case 'equi':
				var p0 = p;
				var p1 = (p + 1) % 3;
				var p2 = (p + 2) % 3;
				points[p0] = pos;
				var vector1 = getVectorAB(points[p2], points[p0]);
				var vector2 = rotateVector(vector1, 2 * Math.PI / 3);
				points[p1] = pointAddVector(points[p0], vector2, 1);
				break;
			case 'isos':
				if (p == 0 || p == 1) {
					points[p] = pos;
					var vector1 = getVectorAB(points[0], points[1]);
					var vector2 = getPerpVector(vector1);
					var mid = getMidpoint(points[0], points[1]);
					points[2] = pointAddVector(mid, vector2, 1.17);
				} else {
					var vector1 = getVectorAB(points[0], points[1]);
					var perpDist = getPerpDist(points[0], vector1, pos);
					var vector2 = getPerpVector(vector1);
					var mid = getMidpoint(points[0], points[1]);
					points[2] = pointAddVector(mid, getUnitVector(vector2), perpDist);
				}
				break;
			case 'right':
				if (p == 1) {
					var vector1 = getVectorAB(points[1], points[0]);
					var vector2 = getVectorAB(points[1], points[2]);
					points[1] = pos;
					points[0] = pointAddVector(pos, vector1, 1);
					points[2] = pointAddVector(pos, vector2, 1);
				} else if (p == 0) {
					var vector1 = getVectorAB(points[1], points[0]);
					var vector2 = getVectorAB(points[1], pos);
					var angle = getVectorAngle(vector2) - getVectorAngle(vector1);
					var vector3 = getVectorAB(points[1], points[2]);
					var vector4 = rotateVector(vector3, angle);
					points[0] = pos;
					points[2] = pointAddVector(points[1], vector4, 1);
				} else if (p == 2) {
					var vector1 = getVectorAB(points[1], points[2]);
					var vector2 = getVectorAB(points[1], pos);
					var angle = getVectorAngle(vector2) - getVectorAngle(vector1);
					var vector3 = getVectorAB(points[1], points[0]);
					var vector4 = rotateVector(vector3, angle);
					points[2] = pos;
					points[0] = pointAddVector(points[1], vector4, 1);
				}
				break;
			case 'rightisos':
				if (p == 1) {
					var vector1 = getVectorAB(points[1], points[0]);
					var vector2 = getVectorAB(points[1], points[2]);
					points[1] = pos;
					points[0] = pointAddVector(pos, vector1, 1);
					points[2] = pointAddVector(pos, vector2, 1);
				} else if (p == 0) {
					var vector1 = getVectorAB(points[1], pos);
					var vector2 = getPerpVector(vector1);
					points[0] = pos;
					points[2] = pointAddVector(points[1], vector2, -1);
				} else if (p == 2) {
					var vector1 = getVectorAB(points[1], pos);
					var vector2 = getPerpVector(vector1);
					points[2] = pos;
					points[0] = pointAddVector(points[1], vector2, 1);
				}
				break;
			}
		} else {
			points[p] = pos;
		}

		//console.log(obj.interact);
		if (!un(obj.interact) && typeof obj.interact.update === 'function') {
			obj.interact.update();
		}
		updateBorder(obj._path);
	},
	posStopInteract: function (e) {
		changeDrawMode();
		var obj = draw._drag.obj;
		var point = draw._drag.point;
		if (!un(obj.polygonType) && obj.polygonType == 'square') {
			if (un(obj._pivotPoint))
				obj._pivotPoint = [];
			if (obj._pivotPoint.includes(point))
				obj._pivotPoint.splice(obj._pivotPoint.indexOf(point), 1);
			obj._pivotPoint.unshift(point);
		}
		
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		delete draw.lockCursor;
		delete draw._drag;
	},
	startPosDrag: function () {
		changeDrawMode('polygonPointDrag');
		draw.currPathNum = draw.currCursor.pathNum;
		draw.currPoint = draw.currCursor.point;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.polygon.posMove,draw.polygon.posStop,drawCanvasPaths);
	},
	posMove: function (e) {
		updateMouse(e);
		var x = draw.mouse[0];
		var y = draw.mouse[1];
		var pathNum = draw.currPathNum;
		var p = draw.currPoint;
		var obj = draw.path[pathNum].obj[0];
		var points = obj.points;

		if (draw.mode === 'interact' && !un(obj.interact)) {
			var pos = [x,y];
			if (!un(obj.interact.snapToGrid)) {
				var grid = o(obj.interact.snapToGrid);
				var coord = draw.grid.getCoordAtPos(grid, [x,y]);
				coord[0] = Math.max(grid.xMin,Math.min(grid.xMax,roundToNearest(coord[0], grid.xMinorStep)));
				coord[1] = Math.max(grid.yMin,Math.min(grid.yMax,roundToNearest(coord[1], grid.yMinorStep)));
				pos = getPosOfCoord(coord,grid);
				if (obj.interact.allowSelfIntersect === false) {
					var coords = [];
					for (var p2 = 0; p2 < obj.points.length; p2++) {
						if (p2 === p) {
							coords[p2] = coord;
						} else {
							var coord2 = draw.grid.getCoordAtPos(grid, obj.points[p2]);
							coord2[0] = roundToNearest(coord2[0], grid.xMinorStep);
							coord2[1] = roundToNearest(coord2[1], grid.yMinorStep);
							if (coord2[0] === coord[0] && coord2[1] === coord[1]) {
								//console.log('points equal');
								return;
							}
							coords[p2] = coord2;
						}
					}
					if (polygonClockwiseTest(coords) === false) {
						//console.log('inverted');
						return;
					}
					for (var i = 0; i < coords.length; i++) {
						var c1 = coords[i];
						var c2 = coords[(i + 1) % coords.length];
						for (var j = 0; j < coords.length; j++) {
							if (j === i || j === (i + 1) % coords.length) continue;
							if (isPointOnLineSegment(coords[j],c1,c2)) {
								//console.log('point on edge');
								return;
							}
						}
					}
					for (var i = 0; i < coords.length; i++) {	
						var c1 = coords[i];
						var c2 = coords[(i + 1) % coords.length];
						for (var j = i+2; j < coords.length; j++) {
							if (i === (j + 1) % coords.length || j === (i + 1) % coords.length) continue;
							var c3 = coords[j];
							var c4 = coords[(j + 1) % coords.length];
							if (intersects(c1[0], c1[1], c2[0], c2[1], c3[0], c3[1], c4[0], c4[1]) == true) {
								//console.log('edges intersecting');
								return;
							}
						}
					}
				}
			}
		} else if (snapToObj2On || draw.snapLinesTogether) {
			var pos = snapToObj2([x, y], pathNum);
		} else if (shiftOn && obj.polygonType !== 'square') { // snap horiz / vert to adjacent vertices
			var pos = null;
			if (!un(obj.polygonType) && obj.points.length == 4 && (obj.polygonType == 'rhom' || obj.polygonType == 'kite')) {
				// special cases - snap v/h to opposite point
				if (p == 0) {
					if (Math.abs(x - points[2][0]) < draw.snapTolerance) {
						pos = [points[2][0], y];
					} else if (Math.abs(y - points[2][1]) < draw.snapTolerance) {
						pos = [x, points[2][1]];
					}
				} else if (p == 2) {
					if (Math.abs(x - points[0][0]) < draw.snapTolerance) {
						pos = [points[0][0], y];
					} else if (Math.abs(y - points[0][1]) < draw.snapTolerance) {
						pos = [x, points[0][1]];
					}
				}
			}
			if (pos == null && ['square', 'rect', 'para', 'trap'].includes(obj.polygonType) == false) {
				var prev = p - 1;
				if (prev == -1)
					prev = points.length - 1;
				var next = p + 1;
				if (next == points.length)
					next = 0;
				var diff = [Math.abs(x - points[prev][0]), Math.abs(y - points[prev][1]), Math.abs(x - points[next][0]), Math.abs(y - points[next][1])];
				var min = diff.indexOf(arrayMin(diff));
				if (pos == null && diff[0] < draw.snapTolerance && diff[3] < draw.snapTolerance) {
					pos = [points[prev][0], points[next][1]];
				}
				if (pos == null && diff[1] < draw.snapTolerance && diff[2] < draw.snapTolerance) {
					pos = [points[next][0], points[prev][1]];
				}
				if (pos == null && min == 0) {
					pos = [points[prev][0], y];
				}
				if (pos == null && min == 1) {
					pos = [x, points[prev][1]];
				}
				if (pos == null && min == 2) {
					pos = [points[next][0], y];
				}
				if (pos == null && min == 3) {
					pos = [x, points[next][1]];
				}
			}
		}
		if (pos == null) var pos = [x, y];

		if (obj.anglesMode == 'exterior' && !un(obj.exteriorAngles)) {
			for (var v = 0; v < obj.exteriorAngles.length; v++) {
				obj.exteriorAngles[v].line1.dist = getDist(points[v], obj.exteriorAngles[v].line1.pos);
				obj.exteriorAngles[v].line2.dist = getDist(points[v], obj.exteriorAngles[v].line2.pos);
			}
		}

		if (!un(obj.polygonType) && (obj.points.length == 4 || obj.points.length == 3) && obj.polygonType !== 'none') {
			switch (obj.polygonType) {
			case 'square':
				if (!shiftOn) {
					var pivot; // test if a previous point has been moved and use this as a pivot
					if (!un(obj._pivotPoint)) {
						if (obj._pivotPoint[0] !== p) {
							pivot = obj._pivotPoint[0];
						} else if (!un(obj._pivotPoint[1])) {
							pivot = obj._pivotPoint[1];
						}
					}
					if (!un(pivot)) {
						points[p] = pos;

						var p2 = [];
						for (var p3 = p; p3 < p + 4; p3++) {
							p2.push(p3 % 4);
						};

						if (pivot - p == 1 || p - pivot == 3) {
							var sideLen = getDist(points[p], points[pivot]);
							var vector1 = getVectorAB(points[p], points[pivot]);
							var vector2 = rotateVector(vector1, Math.PI / 2);
							points[p2[3]] = pointAddVector(points[p], setVectorMag(vector2, sideLen));
							points[p2[2]] = pointAddVector(points[pivot], setVectorMag(vector2, sideLen));
							break;
						} else if (pivot - p == -1 || p - pivot == -3) {
							var sideLen = getDist(points[p], points[pivot]);
							var vector1 = getVectorAB(points[p], points[pivot]);
							var vector2 = rotateVector(vector1, -Math.PI / 2);
							points[p2[1]] = pointAddVector(points[p], setVectorMag(vector2, sideLen));
							points[p2[2]] = pointAddVector(points[pivot], setVectorMag(vector2, sideLen));
							break;
						}
					}
				}

				var p2 = []; // p2[0] is moving point, p2[2] is opposite
				for (var p3 = p; p3 < p + 4; p3++) {
					p2.push(p3 % 4);
				};

				if (shiftOn) {
					var dir = [];
					var xDiff = pos[0] - points[p2[2]][0];
					var yDiff = pos[1] - points[p2[2]][1];
					var xDir = xDiff < 0 ? -1 : 1;
					var yDir = yDiff < 0 ? -1 : 1;
					var diff = Math.min(Math.abs(xDiff), Math.abs(yDiff));
					points[p] = [points[p2[2]][0] + xDir * diff, points[p2[2]][1] + yDir * diff]
				} else {
					points[p] = pos;
				}
				var sideLen = getDist(points[p], points[p2[2]]) / Math.sqrt(2);
				var diagVector = getVectorAB(points[p], points[p2[2]]);
				var vector1 = rotateVector(diagVector, -Math.PI / 4);
				var vector2 = rotateVector(diagVector, Math.PI / 4);
				points[p2[1]] = pointAddVector(points[p], setVectorMag(vector1, sideLen));
				points[p2[3]] = pointAddVector(points[p], setVectorMag(vector2, sideLen));
				break;
			case 'rect':
				if (p == 0 || p == 1) {
					if (shiftOn) {
						var pos2 = p == 0 ? points[1] : points[0];
						if (Math.abs(pos[0] - pos2[0]) < Math.abs(pos[1] - pos2[1])) {
							pos[0] = pos2[0];
						} else {
							pos[1] = pos2[1];
						}
					}
					var sideLen = getDist(points[1], points[2]);
					points[p] = pos;
					var vector1 = getVectorAB(points[0], points[1]);
					var vector2 = setVectorMag(getPerpVector(vector1), sideLen);
					points[2] = pointAddVector(points[1], vector2);
					points[3] = pointAddVector(points[0], vector2);
				} else if (p == 2) {
					var vector1 = getVectorAB(points[1], points[2]);
					var mag = getDist([x, y], points[1]);
					points[2] = pointAddVector(points[1], setVectorMag(vector1, mag));
					points[3] = pointAddVector(points[0], setVectorMag(vector1, mag));
				}
				break;
			case 'para':
				if (p == 0 || p == 1) {
					if (shiftOn) {
						var pos2 = p == 0 ? points[1] : points[0];
						if (Math.abs(pos[0] - pos2[0]) < Math.abs(pos[1] - pos2[1])) {
							pos[0] = pos2[0];
						} else {
							pos[1] = pos2[1];
						}
					}
					var vector1 = getVectorAB(points[0], points[1]);
					var angle1 = getVectorAngle(vector1);
					var vector2 = getVectorAB(points[1], points[2]);
					points[p] = pos;
					var vector3 = getVectorAB(points[0], points[1]);
					var angle3 = getVectorAngle(vector3);
					var vector4 = rotateVector(vector2, angle3 - angle1);
					points[2] = pointAddVector(points[1], vector4);
					points[3] = pointAddVector(points[0], vector4);
				} else if (p == 2) {
					points[p] = pos;
					var vector1 = getVectorAB(points[1], points[2]);
					points[3] = pointAddVector(points[0], vector1);
				}
				break;
			case 'trap':
				var vector1a = getVectorAB(points[0], points[1]);
				var vector2a = getVectorAB(points[1], points[2]);
				var vector3a = getVectorAB(points[0], points[3]);
				var vector4a = getVectorAB(points[2], points[3]);
				var angle1a = getVectorAngle(vector1a);
				points[p] = pos;
				switch (p) {
				case 0:
				case 1:
					if (shiftOn) {
						var pos2 = p == 0 ? points[1] : points[0];
						if (Math.abs(pos[0] - pos2[0]) < Math.abs(pos[1] - pos2[1])) {
							pos[0] = pos2[0];
						} else {
							pos[1] = pos2[1];
						}
					}
					var vector1b = getVectorAB(points[0], points[1]);
					var angle1b = getVectorAngle(vector1b);
					var vector2b = rotateVector(vector2a, angle1b - angle1a);
					var vector3b = rotateVector(vector3a, angle1b - angle1a);
					points[2] = pointAddVector(points[1], vector2b);
					points[3] = pointAddVector(points[0], vector3b);
					break;
				case 2:
					points[3] = getVectorLinesIntersection(points[2], vector4a, points[0], vector3a);
					break;
				case 3:
					points[2] = getVectorLinesIntersection(points[3], vector4a, points[1], vector2a);
					break;
				}
				break;
			case 'rhom':
				var mid = getMidpoint(points[0], points[2]);
				var vector1 = getVectorAB(mid, points[1]);
				var vector3 = getVectorAB(mid, points[3]);
				if (p == 0 || p == 2) {
					points[p] = pos;
					var mid2 = getMidpoint(points[0], points[2]);
					var vector2 = getVectorAB(points[0], points[2]);
					var vector4 = setVectorMag(getPerpVector(vector2), getVectorMag(vector1)); ;
					points[1] = pointAddVector(mid2, vector4, -1);
					points[3] = pointAddVector(mid2, vector4);
				} else if (p == 1) {
					var mag = getDist(mid, [x, y]);
					points[1] = pointAddVector(mid, setVectorMag(vector1, mag));
					points[3] = pointAddVector(mid, setVectorMag(vector3, mag));
				}
				break;
			case 'kite':
				if (p == 0) {
					var vector1a = getVectorAB(points[2], points[1]);
					var vector2a = getVectorAB(points[2], points[3]);
					var vector3a = getVectorAB(points[2], points[0]);
					points[p] = pos;
					var vector3b = getVectorAB(points[2], points[0]);
					var angle1 = getVectorAngle(vector3a);
					var angle2 = getVectorAngle(vector3b);
					var vector1b = rotateVector(vector1a, angle2 - angle1);
					var vector2b = rotateVector(vector2a, angle2 - angle1);
					points[1] = pointAddVector(points[2], vector1b);
					points[3] = pointAddVector(points[2], vector2b);
				} else if (p == 2) {
					var vector1a = getVectorAB(points[0], points[1]);
					var vector2a = getVectorAB(points[0], points[3]);
					var vector3a = getVectorAB(points[0], points[2]);
					points[p] = pos;
					var vector3b = getVectorAB(points[0], points[2]);
					var angle1 = getVectorAngle(vector3a);
					var angle2 = getVectorAngle(vector3b);
					var vector1b = rotateVector(vector1a, angle2 - angle1);
					var vector2b = rotateVector(vector2a, angle2 - angle1);
					points[1] = pointAddVector(points[0], vector1b);
					points[3] = pointAddVector(points[0], vector2b);
				} else if (p == 1) {
					points[p] = pos;
					var vector1 = getVectorAB(points[0], points[2]);
					var mid = getFootOfPerp(points[0], vector1, points[1]);
					var vector2 = getVectorAB(mid, points[1]);
					points[3] = pointAddVector(mid, vector2, -1);
				}
				break;
			case 'equi':
				var p0 = p;
				var p1 = (p + 1) % 3;
				var p2 = (p + 2) % 3;
				points[p0] = pos;
				var vector1 = getVectorAB(points[p2], points[p0]);
				var vector2 = rotateVector(vector1, 2 * Math.PI / 3);
				points[p1] = pointAddVector(points[p0], vector2, 1);
				break;
			case 'isos':
				if (p == 0 || p == 1) {
					points[p] = pos;
					var vector1 = getVectorAB(points[0], points[1]);
					var vector2 = getPerpVector(vector1);
					var mid = getMidpoint(points[0], points[1]);
					points[2] = pointAddVector(mid, vector2, 1.17);
				} else {
					var vector1 = getVectorAB(points[0], points[1]);
					var perpDist = getPerpDist(points[0], vector1, pos);
					var vector2 = getPerpVector(vector1);
					var mid = getMidpoint(points[0], points[1]);
					points[2] = pointAddVector(mid, getUnitVector(vector2), perpDist);
				}
				break;
			case 'right':
				if (p == 1) {
					var vector1 = getVectorAB(points[1], points[0]);
					var vector2 = getVectorAB(points[1], points[2]);
					points[1] = pos;
					points[0] = pointAddVector(pos, vector1, 1);
					points[2] = pointAddVector(pos, vector2, 1);
				} else if (p == 0) {
					var vector1 = getVectorAB(points[1], points[0]);
					var vector2 = getVectorAB(points[1], pos);
					var angle = getVectorAngle(vector2) - getVectorAngle(vector1);
					var vector3 = getVectorAB(points[1], points[2]);
					var vector4 = rotateVector(vector3, angle);
					points[0] = pos;
					points[2] = pointAddVector(points[1], vector4, 1);
				} else if (p == 2) {
					var vector1 = getVectorAB(points[1], points[2]);
					var vector2 = getVectorAB(points[1], pos);
					var angle = getVectorAngle(vector2) - getVectorAngle(vector1);
					var vector3 = getVectorAB(points[1], points[0]);
					var vector4 = rotateVector(vector3, angle);
					points[2] = pos;
					points[0] = pointAddVector(points[1], vector4, 1);
				}
				break;
			case 'rightisos':
				if (p == 1) {
					var vector1 = getVectorAB(points[1], points[0]);
					var vector2 = getVectorAB(points[1], points[2]);
					points[1] = pos;
					points[0] = pointAddVector(pos, vector1, 1);
					points[2] = pointAddVector(pos, vector2, 1);
				} else if (p == 0) {
					var vector1 = getVectorAB(points[1], pos);
					var vector2 = getPerpVector(vector1);
					points[0] = pos;
					points[2] = pointAddVector(points[1], vector2, -1);
				} else if (p == 2) {
					var vector1 = getVectorAB(points[1], pos);
					var vector2 = getPerpVector(vector1);
					points[2] = pos;
					points[0] = pointAddVector(points[1], vector2, 1);
				}
				break;
			}
		} else {
			points[p] = pos;
		}
		if (obj.anglesMode == 'exterior' && !un(obj.exteriorAngles)) {
			for (var v = 0; v < obj.exteriorAngles.length; v++) {
				var prev = v - 1;
				if (prev == -1)
					prev = points.length - 1;
				var next = v + 1;
				if (next == points.length)
					next = 0;
				var vector1 = getVectorAB(points[prev], points[v]);
				var pos1 = pointAddVector(points[v], getUnitVector(vector1), obj.exteriorAngles[v].line2.dist);
				var vector2 = getVectorAB(points[next], points[v]);
				var pos2 = pointAddVector(points[v], getUnitVector(vector2), obj.exteriorAngles[v].line1.dist);
				obj.exteriorAngles[v].line1.vector = vector2;
				obj.exteriorAngles[v].line1.pos = pos2;
				obj.exteriorAngles[v].line2.vector = vector1;
				obj.exteriorAngles[v].line2.pos = pos1;
			}
		}

		//console.log(obj.interact);
		if (!un(obj.interact) && typeof obj.interact.update === 'function') {
			obj.interact.update();
		}
		updateBorder(draw.path[pathNum]);
		//drawCanvasPaths();
		draw.prevX = mouse.x;
		draw.prevY = mouse.y;
	},
	posStop: function (e) {
		var pathNum = draw.currPathNum;
		var point = draw.currPoint;
		var obj = draw.path[pathNum].obj[0];
		/*if (draw.gridSnap == true && !(!un(obj.polygonType) && obj.points.length == 4 && ['square','rect','para','trap','rhom','kite'].indexOf(obj.polygonType) > -1)) {
		obj.points[point][0] = roundToNearest(obj.points[point][0],draw.gridSnapSize);
		obj.points[point][1] = roundToNearest(obj.points[point][1],draw.gridSnapSize);
		updateBorder(draw.path[pathNum]);
		drawCanvasPaths();
		}*/
		//removeListenerMove(window, draw.polygon.posMove);
		//removeListenerEnd(window, draw.polygon.posStop);
		changeDrawMode();
		draw.prevX = null;
		draw.prevY = null;

		if (!un(obj.polygonType) && obj.polygonType == 'square') {
			if (un(obj._pivotPoint))
				obj._pivotPoint = [];
			if (obj._pivotPoint.includes(point))
				obj._pivotPoint.splice(obj._pivotPoint.indexOf(point), 1);
			obj._pivotPoint.unshift(point);
		}

	},
	startPrismPointDrag: function () {
		changeDrawMode('polygonPrismPointDrag');
		draw.prevX = draw.mouse[0];
		draw.prevY = draw.mouse[1];
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.polygon.prismPointMove,draw.polygon.prismPointStop,drawCanvasPaths);
		//addListenerMove(window, draw.polygon.prismPointMove);
		//addListenerEnd(window, draw.polygon.prismPointStop);
	},
	prismPointMove: function (e) {
		updateMouse(e);
		var dx = draw.mouse[0] - draw.prevX;
		var dy = draw.mouse[1] - draw.prevY;
		var pathNum = draw.currPathNum;
		var obj = draw.path[pathNum].obj[0];
		obj.prismVector[0] += dx;
		obj.prismVector[1] += dy;
		updateBorder(draw.path[pathNum]);
		//drawCanvasPaths();
		draw.prevX = draw.mouse[0];
		draw.prevY = draw.mouse[1];
	},
	prismPointStop: function (e) {
		//removeListenerMove(window, draw.polygon.prismPointMove);
		//removeListenerEnd(window, draw.polygon.prismPointStop);
		changeDrawMode();
		draw.prevX = null;
		draw.prevY = null;
	},
	prismToggleLineVis: function(e) {
		var obj = draw.currCursor.obj;
		if (un(obj.solidShowAllLines) || obj.solidShowAllLines === true) {
			obj.solidShowAllLines = {color:'#999',lineWidth:1,dash:[10,10]};
		} else if (typeof obj.solidShowAllLines === 'object') {
			obj.solidShowAllLines = false;
		} else {
			obj.solidShowAllLines = true;
		}
		drawCanvasPaths();
	},
	startExtAnglePointDrag: function () {
		changeDrawMode('polygonExtAnglePointDrag');
		draw.currPathNum = draw.currCursor.pathNum;
		draw.currPoint = draw.currCursor.point;
		draw.currLine = draw.currCursor.line;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.polygon.extAnglePointMove,draw.polygon.extAnglePointStop,drawCanvasPaths);
		//addListenerMove(window, draw.polygon.extAnglePointMove);
		//addListenerEnd(window, draw.polygon.extAnglePointStop);
	},
	extAnglePointMove: function (e) {
		updateMouse(e);
		var x = draw.mouse[0];
		var y = draw.mouse[1];
		var pathNum = draw.currPathNum;
		var v = draw.currPoint;
		var line = draw.currLine;
		var obj = draw.path[pathNum].obj[0];
		var d = getDist([x, y], obj.points[v]);
		if (draw.currLine == 1) {
			obj.exteriorAngles[v].line1.dist = d;
			obj.exteriorAngles[v].line1.vector = setVectorMag(obj.exteriorAngles[v].line1.vector, d);
			obj.exteriorAngles[v].line1.pos = pointAddVector(obj.points[v], obj.exteriorAngles[v].line1.vector);
		} else {
			obj.exteriorAngles[v].line2.dist = d;
			obj.exteriorAngles[v].line2.vector = setVectorMag(obj.exteriorAngles[v].line2.vector, d);
			obj.exteriorAngles[v].line2.pos = pointAddVector(obj.points[v], obj.exteriorAngles[v].line2.vector);
		}
		updateBorder(draw.path[pathNum]);
		//drawCanvasPaths();
	},
	extAnglePointStop: function (e) {
		//removeListenerMove(window, draw.polygon.extAnglePointMove);
		//removeListenerEnd(window, draw.polygon.extAnglePointStop);
		changeDrawMode();
		draw.currPoint = null;
		draw.currLine = null;
	},
	verticesMinus: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		var p = obj.points.length - 1;
		if (p < 2) return;
		obj.points.pop();
		if (!un(obj.angles) && obj.angles.length > obj.points.length) obj.angles.pop();
		if (!un(obj.lineDecoration) && obj.lineDecoration.length > obj.points.length) obj.lineDecoration.pop();
		if (!un(obj.outerAngles) && obj.outerAngles.length > obj.points.length) obj.outerAngles.pop();
		if (!un(obj.exteriorAngles) && obj.exteriorAngles.length > obj.points.length) obj.exteriorAngles.pop();
		updateBorder(draw.path[pathNum]);
		drawCanvasPaths();
	},
	verticesPlus: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		var first = obj.points[0];
		var last = obj.points[obj.points.length - 1];
		obj.points.push([(first[0] + last[0]) / 2, (first[1] + last[1]) / 2]);
		if (typeof obj.exteriorAngles === 'object') draw.polygon.calcExteriorAnglePositions(obj);
		updateBorder(draw.path[pathNum]);
		drawCanvasPaths();
	},
	setType: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		var type = draw.currCursor.type;
		if (obj.polygonType == type) {
			obj.polygonType = 'none';
		} else {
			obj.polygonType = type;
		}
		switch (obj.polygonType) {
		case 'square':
			var vector1 = getVectorAB(obj.points[0], obj.points[1]);
			var vector2 = getPerpVector(vector1);
			obj.points[2] = pointAddVector(obj.points[1], vector2);
			obj.points[3] = pointAddVector(obj.points[2], vector1, -1);
			break;
		case 'rect':
			var vector1 = getVectorAB(obj.points[0], obj.points[1]);
			var vector2 = getPerpVector(vector1);
			vector2 = setVectorMag(vector2, getDist(obj.points[1], obj.points[2]));
			obj.points[2] = pointAddVector(obj.points[1], vector2, 1);
			obj.points[3] = pointAddVector(obj.points[0], vector2, 1);
			break;
		case 'para':
			var vector1 = getVectorAB(obj.points[0], obj.points[1]);
			obj.points[3] = pointAddVector(obj.points[2], vector1, -1);
			break;
		case 'trap':
			var vector1 = getVectorAB(obj.points[0], obj.points[1]);
			vector1 = setVectorMag(vector1, getDist(obj.points[2], obj.points[3]));
			obj.points[3] = pointAddVector(obj.points[2], vector1, -1);
			break;
		case 'rhom':
			var vector1 = getVectorAB(obj.points[0], obj.points[1]);
			var vector2 = getVectorAB(obj.points[1], obj.points[2]);
			vector2 = setVectorMag(vector2, getDist(obj.points[0], obj.points[1]));
			obj.points[2] = pointAddVector(obj.points[1], vector2);
			obj.points[3] = pointAddVector(obj.points[2], vector1, -1);
			break;
		case 'kite':
			var vector1 = getVectorAB(obj.points[0], obj.points[2]);
			var mid = getFootOfPerp(obj.points[0], vector1, obj.points[1]);
			var vector2 = getVectorAB(mid, obj.points[1]);
			obj.points[3] = pointAddVector(mid, vector2, -1);
			break;
		}
		updateBorder(draw.path[pathNum]);
		drawCanvasPaths();
	},
	setPrism: function () {
		var path = selPath();
		var obj = path.obj[0];
		if (obj.type !== 'polygon') return;
		if (obj.solidType == 'prism') {
			delete obj.solidType;
		} else {
			obj.solidType = 'prism';
			if (un(obj.prismVector)) obj.prismVector = [100, -100];
			//obj.solidShowAllLines = false;
		}
		var pathNum = draw.currCursor.pathNum;
		updateBorder(path);
		drawCanvasPaths();
	},
	setOuterAngles: function () {
		var path = !un(draw.currCursor.pathNum) ? draw.path[draw.currCursor.pathNum] : selPath();
		var obj = path.obj[0];
		if (obj.type !== 'polygon') return;
		obj.solidType = 'none';
		obj.anglesMode = obj.anglesMode == 'outer' ? 'none' : 'outer';
		if (un(obj.outerAngles)) obj.outerAngles = [];
		var pathNum = draw.currCursor.pathNum;
		updateBorder(path);
		drawCanvasPaths();
	},
	setExteriorAngles: function () {
		var path = !un(draw.currCursor.pathNum) ? draw.path[draw.currCursor.pathNum] : selPath();
		var obj = path.obj[0];
		if (obj.type !== 'polygon') return;
		obj.solidType = 'none';
		obj.anglesMode = obj.anglesMode == 'exterior' ? 'none' : 'exterior';
		draw.polygon.calcExteriorAnglePositions(obj);
		var pathNum = draw.currCursor.pathNum;
		updateBorder(path);
		drawCanvasPaths();
	},
	calcExteriorAnglePositions: function(obj) {
		if (un(obj.exteriorAngles)) obj.exteriorAngles = [];
		for (var p = 0; p < obj.points.length; p++) {
			if (typeof obj.exteriorAngles[p] === 'object') continue;
			var prev = p - 1;
			if (prev == -1) prev = obj.points.length - 1;
			var next = p + 1;
			if (next == obj.points.length) next = 0;
			var vector1 = getVectorAB(obj.points[prev], obj.points[p]);
			var pos1 = pointAddVector(obj.points[p], getUnitVector(vector1), 60);
			var vector2 = getVectorAB(obj.points[next], obj.points[p]);
			var pos2 = pointAddVector(obj.points[p], getUnitVector(vector2), 60);
			obj.exteriorAngles[p] = {
				line1: {
					show: false,
					vector: vector2,
					pos: pos2,
					dist: 60
				},
				line2: {
					show: false,
					vector: vector1,
					pos: pos1,
					dist: 60
				}
			}
		}
	},
	setAngleStyle: function () {
		if (!un(draw.currCursor.pathNum)) {
			var path = draw.path[draw.currCursor.pathNum];
		} else {
			var path = selPath();
		}
		var obj = path.obj[0];
		if (obj.type !== 'polygon') return;
		var p = draw.currCursor.point;
		if (obj.anglesMode == 'outer') {
			var prev = p - 1;
			if (prev == -1)
				prev = obj.points.length - 1;
			var next = p + 1;
			if (next == obj.points.length)
				next = 0;
			var a1 = posToAngle(obj.points[prev][0], obj.points[prev][1], obj.points[p][0], obj.points[p][1]);
			var a2 = posToAngle(mouse.x - draw.drawRelPos[0], mouse.y - draw.drawRelPos[1], obj.points[p][0], obj.points[p][1]);
			var a3 = posToAngle(obj.points[next][0], obj.points[next][1], obj.points[p][0], obj.points[p][1]);
			if (anglesInOrder(a1, a2, a3) == true) {
				obj.outerAngles[p] = angleStyleIncrement(obj.outerAngles[p]);
				obj.outerAngles[p].show = true;
			} else {
				obj.angles[p] = angleStyleIncrement(obj.angles[p]);
				obj.angles[p].show = true;
			}
		} else if (obj.anglesMode == 'exterior') {
			var prev = p - 1;
			if (prev == -1)
				prev = obj.points.length - 1;
			var next = p + 1;
			if (next == obj.points.length)
				next = 0;
			var p1 = obj.points[prev];
			var p2 = obj.exteriorAngles[p].line1.pos;
			var p3 = obj.exteriorAngles[p].line2.pos;
			var p4 = obj.points[next];
			var a1 = posToAngle(p1[0], p1[1], obj.points[p][0], obj.points[p][1]);
			var a2 = posToAngle(p2[0], p2[1], obj.points[p][0], obj.points[p][1]);
			var a3 = posToAngle(p3[0], p3[1], obj.points[p][0], obj.points[p][1]);
			var a4 = posToAngle(p4[0], p4[1], obj.points[p][0], obj.points[p][1]);
			var aMouse = posToAngle(mouse.x - draw.drawRelPos[0], mouse.y - draw.drawRelPos[1], obj.points[p][0], obj.points[p][1]);
			if (anglesInOrder(a1, aMouse, a2) == true) {
				obj.exteriorAngles[p].a3 = angleStyleIncrement(obj.exteriorAngles[p].a3);
				obj.exteriorAngles[p].show = true;
			} else if (anglesInOrder(a2, aMouse, a3) == true) {
				obj.exteriorAngles[p].a2 = angleStyleIncrement(obj.exteriorAngles[p].a2);
				obj.exteriorAngles[p].show = true;
			} else if (anglesInOrder(a3, aMouse, a4) == true) {
				obj.exteriorAngles[p].a1 = angleStyleIncrement(obj.exteriorAngles[p].a1);
				obj.exteriorAngles[p].show = true;
			} else {
				obj.angles[p] = angleStyleIncrement(obj.angles[p]);
				obj.angles[p].show = true;
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
			obj.angles[p].show = true;
		}
		var pathNum = draw.currCursor.pathNum;
		updateBorder(path);
		drawCanvasPaths();
	},
	toggleOuterAngle: function () {
		if (!un(draw.currCursor.pathNum)) {
			var path = draw.path[draw.currCursor.pathNum];
		} else {
			var path = selPath();
		}
		var obj = path.obj[0];
		if (obj.type !== 'polygon')
			return;
		var p = draw.currCursor.point;
		if (un(obj.outerAngles))
			obj.outerAngles = [];
		if (un(obj.outerAngles[p]))
			obj.outerAngles[p] = {
				style: 0,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				measureLabelOnly: true
			};
		angleStyleIncrement(obj.outerAngles[p]);
		drawCanvasPaths();
	},
	toggleOuterAngleLabel: function () {
		if (!un(draw.currCursor.pathNum)) {
			var path = draw.path[draw.currCursor.pathNum];
		} else {
			var path = selPath();
		}
		var obj = path.obj[0];
		if (obj.type !== 'polygon')
			return;
		var p = draw.currCursor.point;
		if (un(obj.outerAngles))
			obj.outerAngles = [];
		if (un(obj.outerAngles[p]))
			obj.outerAngles[p] = {
				style: 0,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				drawCurve: false,
				measureLabelOnly: true
			};
		obj.outerAngles[p].measureLabelOnly = !obj.outerAngles[p].measureLabelOnly;
		drawCanvasPaths();
	},
	toggleExteriorAngle: function () {
		if (!un(draw.currCursor.pathNum)) {
			var path = draw.path[draw.currCursor.pathNum];
		} else {
			var path = selPath();
		}
		var obj = path.obj[0];
		if (obj.type !== 'polygon')
			return;
		var p = draw.currCursor.point;
		var s = draw.currCursor.sub;
		if (un(obj.exteriorAngles))
			obj.exteriorAngles = [];
		if (un(obj.exteriorAngles[p]))
			obj.exteriorAngles[p] = {};
		var a = obj.exteriorAngles[p];
		if (s == 1)
			var angle = a.a1;
		if (s == 2)
			var angle = a.a2;
		if (s == 3)
			var angle = a.a3;
		if (un(angle))
			angle = {
				style: 0,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				measureLabelOnly: true
			};
		angleStyleIncrement(angle);
		if (s == 1)
			a.a1 = angle;
		if (s == 2)
			a.a2 = angle;
		if (s == 3)
			a.a3 = angle;
		if ((!un(a.a3) && a.a3.drawCurve !== false) || (!un(a.a2) && a.a2.drawCurve !== false)) {
			a.line1.show = true;
		} else {
			a.line1.show = false;
		}
		if ((!un(a.a1) && a.a1.drawCurve !== false) || (!un(a.a2) && a.a2.drawCurve !== false)) {
			a.line2.show = true;
		} else {
			a.line2.show = false;
		}
		drawCanvasPaths();
	},
	toggleExteriorAngleLabel: function () {
		if (!un(draw.currCursor.pathNum)) {
			var path = draw.path[draw.currCursor.pathNum];
		} else {
			var path = selPath();
		}
		var obj = path.obj[0];
		if (obj.type !== 'polygon')
			return;
		var p = draw.currCursor.point;
		var s = draw.currCursor.sub;
		if (un(obj.exteriorAngles))
			obj.exteriorAngles = [];
		if (un(obj.exteriorAngles[p]))
			obj.exteriorAngles[p] = {};
		var a = obj.exteriorAngles[p];
		if (s == 1)
			var angle = a.a1;
		if (s == 2)
			var angle = a.a2;
		if (s == 3)
			var angle = a.a3;
		if (un(angle))
			angle = {
				style: 0,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				drawCurve: false,
				measureLabelOnly: true
			};
		angle.measureLabelOnly = !angle.measureLabelOnly;
		if (s == 1)
			a.a1 = angle;
		if (s == 2)
			a.a2 = angle;
		if (s == 3)
			a.a3 = angle;
		drawCanvasPaths();
	},
	toggleAngle: function () {
		if (!un(draw.currCursor.pathNum)) {
			var path = draw.path[draw.currCursor.pathNum];
		} else {
			var path = selPath();
		}
		var obj = path.obj[0];
		if (obj.type !== 'polygon')
			return;
		var p = draw.currCursor.point;
		if (un(obj.angles))
			obj.angles = [];
		if (un(obj.angles[p]))
			obj.angles[p] = {
				style: 0,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				measureLabelOnly: true
			};
		//obj.angles[p].drawCurve = !obj.angles[p].drawCurve;
		angleStyleIncrement(obj.angles[p]);
		drawCanvasPaths();
	},
	toggleAngleLabel: function () {
		if (!un(draw.currCursor.pathNum)) {
			var path = draw.path[draw.currCursor.pathNum];
		} else {
			var path = selPath();
		}
		var obj = path.obj[0];
		if (obj.type !== 'polygon')
			return;
		var p = draw.currCursor.point;
		if (un(obj.angles))
			obj.angles = [];
		if (un(obj.angles[p]))
			obj.angles[p] = {
				style: 0,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				drawCurve: false,
				measureLabelOnly: true
			};
		obj.angles[p].measureLabelOnly = !obj.angles[p].measureLabelOnly;
		drawCanvasPaths();
	},
	setLineDecoration: function () {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		var p = draw.currCursor.point;
		if (un(obj.lineDecoration)) obj.lineDecoration = [];
		//console.log(p,obj.lineDecoration);
		if (typeof obj.lineDecoration[p] !== 'object' || obj.lineDecoration[p] === null) obj.lineDecoration[p] = {};
		var lineDec = obj.lineDecoration[p];
		if (lineDec.type === 'dash' && lineDec.number === 1) {
			obj.lineDecoration[p] = {
				style: 1,
				type: 'dash',
				number: 2
			};
		} else if (lineDec.type === 'dash' && lineDec.number === 2) {
			obj.lineDecoration[p] = {
				style: 2,
				type: 'arrow',
				direction: 1,
				number: 1
			};
		} else if (lineDec.type === 'arrow' && lineDec.number === 1 && lineDec.direction === 1) {
			obj.lineDecoration[p] = {
				style: 3,
				type: 'arrow',
				direction: 1,
				number: 2
			};
		} else if (lineDec.type === 'arrow' && lineDec.number === 2 && lineDec.direction === 1) {
			obj.lineDecoration[p] = {
				style: 4,
				type: 'arrow',
				direction: -1,
				number: 1
			};
		} else if (lineDec.type === 'arrow' && lineDec.number === 1 && lineDec.direction === -1) {
			obj.lineDecoration[p] = {
				style: 5,
				type: 'arrow',
				direction: -1,
				number: 2
			};
		} else if (lineDec.type === 'arrow' && lineDec.number === 2 && lineDec.direction === -1) {
			obj.lineDecoration[p] = {};
		} else {
			obj.lineDecoration[p] = {
				style: 1,
				type: 'dash',
				number: 1
			};
		}
		var pathNum = draw.currCursor.pathNum;
		updateBorder(draw.path[pathNum]);
		drawCanvasPaths();
	},
	makeRegular: function () {
		if (!un(draw.currCursor.pathNum)) {
			var path = draw.path[draw.currCursor.pathNum];
		}
		if (typeof path !== 'object' || un(path.obj) || un(path.obj[0]) || path.obj[0].type !== 'polygon') {
			var path = selPath();
		}
		var obj = path.obj[0];
		if (obj.type !== 'polygon')
			return;

		var center = [obj._left + 0.5 * obj._width, obj._top + 0.5 * obj._height];
		var radius = 0.5 * Math.min(obj._width, obj._height);
		var numOfSides = obj.points.length;
		var startAngle = -0.5 * Math.PI;
		if (numOfSides % 2 == 0) {
			startAngle += (Math.PI / numOfSides)
		}
		var angle = startAngle;
		obj.points = [];
		for (var i = 0; i < numOfSides; i++) {
			obj.points[i] = [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
			angle += (2 * Math.PI) / numOfSides;
		}
		obj.clockwise = false;
		updateBorder(path);
		drawCanvasPaths();
	},
	rotate: function (obj,angle,center) {
		if (un(obj)) obj = sel();
		if (draw.mode === 'edit' && un(angle)) {
			angle = prompt('Rotation angle (clockwise):','90');
			angle = Number(angle);
			if (typeof angle !== 'number' || isNaN(angle)) return;
		}
		if (un(center)) center = draw.polygon.getCentroid(obj.points);
		for (var p = 0; p < obj.points.length; p++) obj.points[p] = rotate(center, obj.points[p], -angle);
		if (draw.mode === 'edit') {
			var path = selPath();
			updateBorder(path);
			drawSelectedPaths();
			drawSelectCanvas();
		}
		function rotate(center, point, angle) {
			var radians = (Math.PI / 180) * angle,
			cos = Math.cos(radians),
			sin = Math.sin(radians),
			nx = (cos * (point[0] - center[0])) + (sin * (point[1] - center[1])) + center[0],
			ny = (cos * (point[1] - center[1])) - (sin * (point[0] - center[0])) + center[1];
			return [nx, ny];
		}
	},
	reflectHoriz: function (obj) {
		if (un(obj)) obj = sel();
		draw.polygon.reflect(obj,'h');
	},
	reflectVert: function (obj) {
		if (un(obj)) obj = sel();
		draw.polygon.reflect(obj,'v');
	},
	reflect: function (obj,dir) {
		if (un(obj)) obj = sel();
		if (un(dir)) dir = 'h';
		var center = draw.polygon.getCentroid(obj.points);
		for (var p = 0; p < obj.points.length; p++) obj.points[p] = reflect(center, obj.points[p], dir);
		obj.points.reverse();
		if (draw.mode === 'edit') {
			var path = selPath();
			updateBorder(path);
			drawSelectedPaths();
			drawSelectCanvas();
		}
		/*function getCentroid(coords) {
			var center = coords.reduce(function (x, y) {
					return [x[0] + y[0] / coords.length, x[1] + y[1] / coords.length]
				}, [0, 0])
				return center;
		}*/

		function reflect(center, point, dir) {
			if (dir == 'h') {
				point[0] = center[0] + (center[0] - point[0]);
			} else {
				point[1] = center[1] + (center[1] - point[1]);
			}
			return point;
		}
	},
	enlarge: function(obj,sf) {
		if (un(obj)) obj = sel();
		if (draw.mode === 'edit' && un(sf)) {
			sf = prompt('Scale factor?','1.5');
			sf = Number(sf);
			if (typeof sf !== 'number' || isNaN(sf) || sf === 1) return;
		}
		var center = draw.polygon.getCentroid(obj.points);
		for (var p = 0; p < obj.points.length; p++) {
			var v = vector.scalarMult(vector.getVectorAB(center,obj.points[p]),sf);
			obj.points[p] = vector.addVectors(center,v);
		}
		if (draw.mode === 'edit') {
			var path = selPath();
			updateBorder(path);
			drawSelectedPaths();
			drawSelectCanvas();
		}
	},
	drawButton: function (ctx, size, type) {
		var pos = [[20, 50], [45, 25], [80, 65], [60, 80], [40, 80], [20, 50]];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.points[0];
		for (var p = 0; p < obj.points.length; p++) {
			obj.points[p][0] = center[0] + sf * (obj.points[p][0] - center[0]);
			obj.points[p][1] = center[1] + sf * (obj.points[p][1] - center[1]);
		}
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.dash)) {
			if (!un(obj.dash[0]))
				obj.dash[0] *= sf;
			if (!un(obj.dash[1]))
				obj.dash[1] *= sf;
		}
		if (!un(obj.outerAngles)) {
			// exterior?
			// line dec
		}
	},
	addVertexLabels: function (obj) {
		if (un(obj)) obj = sel();
		if (obj.type !== 'polygon') return;
		obj._textSnapPos = draw.polygon.getTextSnapPos(obj);
		var count = 0;
		for (var p = 0; p < obj._textSnapPos.length; p++) {
			var pos = obj._textSnapPos[p];
			if (pos.type !== 'polygonVertex') continue;
			var letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[count];
			count++;
			var align = pos.align;
			var x = pos.pos[0] + (align[0] == 0 ? -25 : align[0] == 1 ? -50 : 0);
			var y = pos.pos[1] + (align[1] == 0 ? -25 : align[1] == 1 ? -50 : 0);
			draw.path.push({
				obj: [{
						type: 'text2',
						align: clone(align),
						font:'algebra',
						fontSize:28,
						text: [letter],
						rect: [x, y, 50, 50],
						tightRect: [x, y, 50, 50]
					}
				],
				selected: false
			});
		}
		drawCanvasPaths();
		draw.updateAllBorders();
	},
	addSideLabels: function (obj) {
		if (un(obj)) obj = sel();
		if (obj.type !== 'polygon') return;
		obj._textSnapPos = draw.polygon.getTextSnapPos(obj);
		var count = 0;
		for (var p = 0; p < obj._textSnapPos.length; p++) {
			var pos = obj._textSnapPos[p];
			if (pos.type !== 'polygonSide') continue;
			var letter = 'abcdefghijklmnopqrstuvwxyz'[count];
			count++;
			var align = pos.align;
			var x = pos.pos[0] + (align[0] == 0 ? -25 : align[0] == 1 ? -50 : 0);
			var y = pos.pos[1] + (align[1] == 0 ? -25 : align[1] == 1 ? -50 : 0);
			draw.path.push({
				obj: [{
						type: 'text2',
						align: clone(align),
						font:'algebra',
						fontSize:28,
						text: [letter],
						rect: [x, y, 50, 50],
						tightRect: [x, y, 50, 50]
					}
				],
				selected: false
			});
		}
		drawCanvasPaths();
		draw.updateAllBorders();
	},
	getTextSnapPos: function(obj) {
		var textSnapPos = [];
		var points = obj.points;
		for (var i = 0; i < points.length; i++) {
			var p1 = i == 0 ? points.last() : points[i-1];
			var p2 = points[i];
			var p3 = points[(i+1)%points.length];
			
			var a1 = getAngleFromAToB(p2,p1);
			var a2 = getAngleFromAToB(p2,p3);
			if (a2 > a1) {
				var a3 = (a1+a2)/2;
			} else {
				var a3 = (a1+a2+2*Math.PI)/2;
				while (a3 > 2*Math.PI) {
					a3 -= 2*Math.PI;
				}
			}
			var n = Math.PI/8;
			var align = [0,0];
			if (a3 < n || a3 >= 15*n) {
				align = [-1,0];
			} else if (a3 < 3*n) {
				align = [-1,-1];
			} else if (a3 < 5*n) {
				align = [0,-1];
			} else if (a3 < 7*n) {
				align = [1,-1];
			} else if (a3 < 9*n) {
				align = [1,0];
			} else if (a3 < 11*n) {
				align = [1,1];
			} else if (a3 < 13*n) {
				align = [0,1];
			} else if (a3 < 15*n) {
				align = [-1,1];
			}
			
			var vector = angleToVector(a3,5);
			var labelPos = pointAddVector(p2,vector);
			
			textSnapPos.push({type:'polygonVertex',pos:labelPos,align:align,angle:a3,vertex:i,polygon:obj});
			
			// side labels
			var mid = midpoint(p2[0],p2[1],p3[0],p3[1]);
			var ang = a2-0.5*Math.PI;
			while (ang < 0) ang += 2*Math.PI;
			
			var align = [0,0];
			if (ang < n || ang >= 15*n) {
				align = [-1,0];
			} else if (ang < 3*n) {
				align = [-1,-1];
			} else if (ang < 5*n) {
				align = [0,-1];
			} else if (ang < 7*n) {
				align = [1,-1];
			} else if (ang < 9*n) {
				align = [1,0];
			} else if (ang < 11*n) {
				align = [1,1];
			} else if (ang < 13*n) {
				align = [0,1];
			} else if (ang < 15*n) {
				align = [-1,1];
			}
			
			var margin = align.indexOf(0) > -1 ? 10 : 5;
			var vector = angleToVector(ang,margin);
			var labelPos = pointAddVector(mid,vector);
			
			textSnapPos.push({type:'polygonSide',pos:labelPos,align:align,angle:ang,vertex:i,polygon:obj});		
		}
		return textSnapPos;
	},
	stringifyFix: function(obj) {
		var types = ['angles','outerAngles','exteriorAngles','lineDecoration'];
		for (var t = 0; t < types.length; t++) {
			var type = types[t];
			if (!un(obj[type])) {
				for (var a = 0; a < obj[type].length; a++) {
					if (a > obj.points.length-1) {
						delete obj[type][a];
						continue;
					}
					if (un(obj[type][a])) {
						obj[type][a] = {show:false};
					}
				}
			}
		}
		return obj;
	},
	getCentroid:function(polygon) {
		if (polygon instanceof Array === false) polygon = polygon.points;
		var off = polygon[0];
		var twicearea = 0;
		var x = 0;
		var y = 0;
		var p1,p2;
		var f;
		for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
			p1 = polygon[i];
			p2 = polygon[j];
			f = (p1[0] - off[0]) * (p2[1] - off[1]) - (p2[0] - off[0]) * (p1[1] - off[1]);
			twicearea += f;
			x += (p1[0] + p2[0] - 2 * off[0]) * f;
			y += (p1[1] + p2[1] - 2 * off[1]) * f;
		}
		f = twicearea * 3;
		return [x / f + off[0], y / f + off[1]];
	},
	positionSideLabels:function(polygon,labels,spacing) {
		for (var p = 0; p < polygon.points.length; p++) {
			if (typeof labels[p] !== 'object') continue;
			draw.line.positionLabel([polygon.points[p],polygon.points[(p+1)%polygon.points.length]],labels[p],spacing);
		}
	},
	positionAngleLabels:function(polygon,labels,spacing) {
		for (var p = 0; p < polygon.points.length; p++) {
			if (typeof labels[p] !== 'object') continue;
			var angle = {
				c: p === 0 ? polygon.points[polygon.points.length-1] : polygon.points[p-1],
				b: polygon.points[p],
				a: polygon.points[(p+1)%polygon.points.length]
			};
			draw.angle.positionLabel(angle,labels[p],spacing);
		}
	},
	positionVertexLabels:function(polygon,labels,spacing) {
		if (un(spacing)) spacing = 10;
		for (var p = 0; p < polygon.points.length; p++) {
			if (typeof labels[p] !== 'object') continue;
			var angle = {
				c: p === 0 ? polygon.points[polygon.points.length-1] : polygon.points[p-1],
				b: polygon.points[p],
				a: polygon.points[(p+1)%polygon.points.length]
			};
			draw.angle.positionLabel(angle,labels[p],spacing,true);
		}
	},
	select: function () {
		draw.currCursor.obj._selected = true;
		drawCanvasPaths();
		calcCursorPositions();
	},
	deselect: function (obj) {
		delete obj._selected;
	},
	getCentroidVertexVectors: function(obj) {
		obj._centroidVertexVectors = obj.points.map(function(point) {
			return vector.getVectorAB(point, obj._centroid);
		});
	},
	getCentroidVertexAngles: function(obj) {
		draw.polygon.getCentroidVertexVectors(obj);
		obj._centroidVertexAngles = obj._centroidVertexVectors.map(function(v) {
			return Math.atan(v[1]/v[0]);
		});
	},
	/*interactDragStart: function(obj) {
		var obj = draw.currCursor.obj;
		draw.polygon.getCentroidVertexVectors(obj);
		draw._drag = {obj:obj,centroidOffset:vector.getVectorAB(draw.mouse, obj._centroid)};
		draw.animate(draw.polygon.interactDragMove,draw.polygon.interactDragStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.lockCursor = true;
	},
	interactDragMove: function() {
		var obj = draw._drag.obj;
		var centroid = vector.addVectors(draw.mouse, draw._drag.centroidOffset);
		obj.points = obj._centroidVertexVectors.map(function(v) {
			return vector.addVectors(centroid, vector.scalarMult(v,-1));
		});
	},
	interactDragStop: function() {
		draw.cursorCanvas.style.cursor = hitTestPolygon(draw.mouse,draw._drag.obj.points,true) ? draw.cursors.move1 : draw.cursors.default;
		delete draw.lockCursor;
		delete draw._drag;
	},*/
	interactRotateStart: function(obj) {
		var obj = draw.currCursor.obj;
		draw._drag = {
			obj:obj,
			rotatePoint:draw.currCursor.dims.slice(0,2),
			offset:vector.getVectorAB(draw.mouse,rotatePoint),
			radius:dist(obj._centroid,rotatePoint),
			center:!un(obj.interact.rotationCenterOffset) ? vector.addVectors(obj.points[0],rotateVector(obj.interact.rotationCenterOffset,obj._rotationAngle - obj._rotationStartAngle)) : obj._centroid,
			startAngle:obj._rotationAngle,
			startPoints:clone(obj.points)
		};
		draw.animate(draw.polygon.interactRotateMove,draw.polygon.interactRotateStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.lockCursor = true;
	},
	interactRotateMove: function() {
		var obj = draw._drag.obj;
		var c = draw._drag.center;
		obj._rotationAngle = getAngleFromAToB(c,draw.mouse);
		while (obj._rotationAngle < 0) obj._rotationAngle += 2*Math.PI;
		while (obj._rotationAngle >= 2*Math.PI) obj._rotationAngle -= 2*Math.PI;
		if (!un(obj.interact) && typeof obj.interact.rotationSnap === 'number' && obj.interact.rotationSnap > 0) {
			obj._rotationAngle = roundToNearest(obj._rotationAngle/Math.PI,obj.interact.rotationSnap)*Math.PI;
		}
		var a = draw._drag.startAngle - obj._rotationAngle;
		obj.points = draw._drag.startPoints.map(function(p) {
			return [(Math.cos(a) * (p[0] - c[0])) + (Math.sin(a) * (p[1] - c[1])) + c[0], (Math.cos(a) * (p[1] - c[1])) - (Math.sin(a) * (p[0] - c[0])) + c[1]];
		});
	},
	interactRotateStop: function() {
		draw.cursorCanvas.style.cursor = dist(draw.mouse,draw._drag.rotatePoint) < 20 ? draw.cursors.move1 : draw.cursors.default;
		delete draw.lockCursor;
		delete draw._drag;
	}
}
draw.polyTri = {
	add: function () {
		draw.polygon.add('none', 3);
	},
	drawButton: function (ctx, size) {
		var pos = [[20, 20], [30, 50], [80, 40]];
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyQuad = {
	add: function () {
		draw.polygon.add('none', 4);
	},
	drawButton: function (ctx, size) {
		var pos = [[20, 20], [30, 50], [80, 60], [60, 30]];
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polySquare = {
	add: function () {
		draw.polygon.add('square', 4);
	},
	drawButton: function (ctx, size) {
		var pos = [[25, 20], [25, 70], [75, 70], [75, 20]];
		var lineDec = [{
				type: 'dash',
				length: 4
			}, {
				type: 'dash',
				length: 4
			}, {
				type: 'dash',
				length: 4
			}, {
				type: 'dash',
				length: 4
			}
		];
		var angles = [{
				radius: 15
			}, {
				radius: 15
			}, {
				radius: 15
			}, {
				radius: 15
			}
		];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		for (var d = 0; d < lineDec.length; d++) {
			if (un(lineDec[d]))
				continue;
			lineDec[d].length = lineDec[d].length * (size / 100);
		}
		for (var a = 0; a < angles.length; a++) {
			if (un(angles[a]))
				continue;
			angles[a].length = angles[a].radius * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineDecoration: lineDec,
			angles: angles,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyRect = {
	add: function () {
		draw.polygon.add('rect', 4);
	},
	drawButton: function (ctx, size) {
		var pos = [[15, 30], [15, 70], [85, 70], [85, 30]];
		var angles = [{
				radius: 15
			}, {
				radius: 15
			}, {
				radius: 15
			}, {
				radius: 15
			}
		];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		for (var a = 0; a < angles.length; a++) {
			if (un(angles[a]))
				continue;
			angles[a].length = angles[a].radius * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			angles: angles,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyPara = {
	add: function () {
		draw.polygon.add('para', 4);
	},
	drawButton: function (ctx, size) {
		var pos = [[20, 30], [30, 70], [80, 70], [70, 30]];
		var lineDec = [{
				type: 'arrow',
				length: 8,
				direction: 1,
				number: 1
			}, {
				type: 'arrow',
				length: 8,
				direction: 1,
				number: 2
			}, {
				type: 'arrow',
				length: 8,
				direction: -1,
				number: 1
			}, {
				type: 'arrow',
				length: 8,
				direction: -1,
				number: 2
			}
		];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		for (var d = 0; d < lineDec.length; d++) {
			if (un(lineDec[d]))
				continue;
			lineDec[d].length = lineDec[d].length * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineDecoration: lineDec,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyTrap = {
	add: function () {
		draw.polygon.add('trap', 4);
	},
	drawButton: function (ctx, size) {
		var pos = [[30, 30], [20, 70], [80, 70], [60, 30]];
		var lineDec = [{}, {
				type: 'arrow',
				length: 8,
				direction: 1,
				number: 2
			}, {}, {
				type: 'arrow',
				length: 8,
				direction: -1,
				number: 2
			}
		];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		for (var d = 0; d < lineDec.length; d++) {
			if (un(lineDec[d]))
				continue;
			lineDec[d].length = lineDec[d].length * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineDecoration: lineDec,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyRhom = {
	add: function () {
		draw.polygon.add('rhom', 4);
	},
	drawButton: function (ctx, size) {
		var pos = [[15, 50], [50, 80], [85, 50], [50, 20]];
		var lineDec = [{
				type: 'dash',
				length: 4
			}, {
				type: 'dash',
				length: 4
			}, {
				type: 'dash',
				length: 4
			}, {
				type: 'dash',
				length: 4
			}
		];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		for (var d = 0; d < lineDec.length; d++) {
			if (un(lineDec[d]))
				continue;
			lineDec[d].length = lineDec[d].length * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineDecoration: lineDec,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyKite = {
	add: function () {
		draw.polygon.add('kite', 4);
	},
	drawButton: function (ctx, size) {
		var pos = [[15, 50], [60, 80], [85, 50], [60, 20]]
		var lineDec = [{
				type: 'dash',
				length: 4,
				number: 2
			}, {
				type: 'dash',
				length: 4,
				number: 1
			}, {
				type: 'dash',
				length: 4,
				number: 1
			}, {
				type: 'dash',
				length: 4,
				number: 2
			}
		];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		for (var d = 0; d < lineDec.length; d++) {
			if (un(lineDec[d]))
				continue;
			lineDec[d].length = lineDec[d].length * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineDecoration: lineDec,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyEqui = {
	add: function () {
		draw.polygon.add('equi', 3);
	},
	drawButton: function (ctx, size) {
		var pos = [[25, 50 + 12.5 * Math.sqrt(3)], [50, 50 - 12.5 * Math.sqrt(3)], [75, 50 + 12.5 * Math.sqrt(3)]];
		var lineDec = [{
				type: 'dash',
				length: 4
			}, {
				type: 'dash',
				length: 4
			}, {
				type: 'dash',
				length: 4
			}
		];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		for (var d = 0; d < lineDec.length; d++) {
			if (un(lineDec[d]))
				continue;
			lineDec[d].length = lineDec[d].length * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineDecoration: lineDec,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyIsos = {
	add: function () {
		draw.polygon.add('isos', 3);
	},
	drawButton: function (ctx, size) {
		var pos = [[25, 80], [50, 20], [75, 80]];
		var lineDec = [{
				type: 'dash',
				length: 4
			}, {
				type: 'dash',
				length: 4
			}
		];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		for (var d = 0; d < lineDec.length; d++) {
			if (un(lineDec[d]))
				continue;
			lineDec[d].length = lineDec[d].length * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineDecoration: lineDec,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyRight = {
	add: function () {
		draw.polygon.add('right', 3);
	},
	drawButton: function (ctx, size) {
		var pos = [[25, 70], [75, 70], [25, 30]];
		var angles = [{
				radius: 15
			}, null, null];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		for (var a = 0; a < angles.length; a++) {
			if (un(angles[a]))
				continue;
			angles[a].length = angles[a].radius * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			angles: angles,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyRightIsos = {
	add: function () {
		draw.polygon.add('rightisos', 3);
	},
	drawButton: function (ctx, size) {
		var pos = [[25, 70], [75, 70], [25, 20]];
		var angles = [{
				radius: 15
			}, null, null];
		var lineDec = [{
				type: 'dash',
				length: 4
			}, {}, {
				type: 'dash',
				length: 4
			}
		];
		for (var p = 0; p < pos.length; p++) {
			pos[p][0] = pos[p][0] * (size / 100);
			pos[p][1] = pos[p][1] * (size / 100);
		}
		for (var d = 0; d < lineDec.length; d++) {
			if (un(lineDec[d]))
				continue;
			lineDec[d].length = lineDec[d].length * (size / 100);
		}
		for (var a = 0; a < angles.length; a++) {
			if (un(angles[a]))
				continue;
			angles[a].length = angles[a].radius * (size / 100);
		}
		ctx.beginPath();
		drawPolygon({
			ctx: ctx,
			points: pos,
			lineDecoration: lineDec,
			angles: angles,
			lineWidth: size * 0.02
		});
		ctx.stroke();
	}
}
draw.polyReg = {
	add: function (n) {
		draw.polygon.add('none', n);
	},
	drawButton: function (ctx, size, n) {
		ctx.beginPath();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = size * 0.02;
		drawRegularPolygon({
			ctx: ctx,
			c: [0.5 * size, 0.5 * size],
			r: 0.3 * size,
			p: n,
			startAngle: Math.PI / 2 - Math.PI / n
		});
		ctx.stroke();
	}
}
draw.image = {
	add: function(src) {
		if (un(src)) src = 'images/logoSmall.PNG';
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'image',
					src: src,
					left:center[0],
					top:center[1]
				}
			],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (obj._loadError === true) return;
		if (!un(obj.alpha)) ctx.globalAlpha = obj.alpha;
		if (!un(obj._image) && obj._image.src !== '') {
			if (!un(obj.crop)) {
				ctx.drawImage(obj._image, obj.crop[0],obj.crop[1],obj.crop[2],obj.crop[3],obj.left, obj.top, obj.width, obj.height);
			} else {
				ctx.drawImage(obj._image, obj.left, obj.top, obj.width, obj.height);
			}
		} else if (!un(draw.loadedImages) && !un(draw.loadedImages[obj.src])) {
			obj._image = draw.loadedImages[obj.src];
			if (!un(obj.crop)) {
				ctx.drawImage(obj._image, obj.crop[0],obj.crop[1],obj.crop[2],obj.crop[3],obj.left, obj.top, obj.width, obj.height);
			} else {
				ctx.drawImage(obj._image, obj.left, obj.top, obj.width, obj.height);
			}
		} else if (!un(obj.src) && obj._loadError !== true) {
			obj._image = new Image;
			obj._image.onload = function (e) {
				if (un(obj.width)) obj.width = obj._image.naturalWidth;
				if (un(obj.height)) obj.height = obj._image.naturalHeight;
				obj._path = draw.getPathOfObj(obj);
				if (obj._path !== false) updateBorder(obj._path);
				drawCanvasPaths();
				if (un(draw.loadedImages)) draw.loadedImages = {};
				draw.loadedImages[e.target.relativeSrc] = e.target;
			}
			obj._image.onerror = function(e) {
				obj._loadError = true;
			}
			obj._image.relativeSrc = obj.src;
			obj._image.src = obj.src;
		} else if (!un(obj.canvas)) {
			var left = !un(obj.rect) ? obj.rect[0] : obj.left;
			var top = !un(obj.rect) ? obj.rect[1] : obj.top;
			var width = !un(obj.rect) ? obj.rect[2] : obj.width;
			var height = !un(obj.rect) ? obj.rect[3] : obj.height;
			if (!un(obj.crop)) {
				ctx.drawImage(obj.canvas,obj.crop[0],obj.crop[1],obj.crop[2],obj.crop[3],left,top,width,height);
			} else {
				ctx.drawImage(obj.canvas,left,top,width,height);
			}
		}
		if (!un(obj.box)) {
			if (obj.box.borderColor !== 'none' && obj.box.color !== 'none') {
				ctx.strokeStyle = obj.box.borderColor || obj.box.color || '#000';
				ctx.lineWidth = obj.box.borderWidth || obj.box.width || 2;
				ctx.strokeRect(obj.left, obj.top, obj.width, obj.height);
			}
		}
	},
	
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		var ratio = obj.width/obj.height;
		obj.width += dw;
		obj.height = obj.width/ratio;
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		var ratio = obj.width/obj.height;
		obj.width *= sf;
		obj.height = obj.width/ratio;
	},
	
	getRect: function(obj) {
		if (obj._loadError === true) return undefined;
		return [obj.left,obj.top,obj.width,obj.height];
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		pos.push({
			shape: 'line',
			dims: [[obj.left,obj.top],[obj.left,obj.top+obj.height],20],
			cursor: draw.cursors.ew,
			func: draw.image.cropStart,
			pathNum: pathNum,
			obj: obj,
			side: 'left'
		}, {
			shape: 'line',
			dims: [[obj.left,obj.top],[obj.left+obj.width,obj.top],20],
			cursor: draw.cursors.ns,
			func: draw.image.cropStart,
			pathNum: pathNum,
			obj: obj,
			side: 'top'
		}, {
			shape: 'line',
			dims: [[obj.left+obj.width,obj.top],[obj.left+obj.width,obj.top+obj.height],20],
			cursor: draw.cursors.ew,
			func: draw.image.cropStart,
			pathNum: pathNum,
			obj: obj,
			side: 'right'
		}, {
			shape: 'line',
			dims: [[obj.left,obj.top+obj.height],[obj.left+obj.width,obj.top+obj.height],20],
			cursor: draw.cursors.ns,
			func: draw.image.cropStart,
			pathNum: pathNum,
			obj: obj,
			side: 'bottom'
		});

		return pos;
	},
	cropStart: function(e) {
		draw._drag = draw.currCursor;
		var obj = draw._drag.obj;
		if (un(obj.crop)) obj.crop = [0,0,obj._image.naturalWidth,obj._image.naturalHeight];
		obj._xsf = obj.crop[2] / obj.width;
		obj._ysf = obj.crop[3] / obj.height;
		//console.log('width:',obj.width,obj.crop[2],obj._xsf);
		//console.log('height:',obj.height,obj.crop[3],obj._ysf);
		draw.animate(draw.image.cropMove,draw.image.cropStop,drawCanvasPaths);
	},
	cropMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var side = draw._drag.side;
		if (side === 'left') {
			var minLeft = obj.left-obj.crop[0]/obj._xsf;
			var maxLeft = obj.left+obj.width-40;
			var x = Math.max(Math.min(maxLeft,draw.mouse[0]),minLeft);
			var dx = x - obj.left;
			obj.left += dx;
			obj.width -= dx;
			obj.crop[0] += dx*obj._xsf;
			obj.crop[2] -= dx*obj._xsf;
		} else if (side === 'right') {
			var minRight = obj.left+40;
			var maxRight = obj.left+obj._image.naturalWidth/obj._xsf;
			var right = Math.min(Math.max(draw.mouse[0],minRight),maxRight);
			obj.width = right-obj.left;
			obj.crop[2] = obj.width*obj._xsf;
			//console.log('width:',obj.width,obj.crop[2]);
		} else if (side === 'top') {
			var minTop = obj.top-obj.crop[1]/obj._ysf;
			var maxTop = obj.top+obj.height-40;
			var y = Math.max(Math.min(maxTop,draw.mouse[1]),minTop);
			var dy = y - obj.top;
			obj.top += dy;
			obj.height -= dy;
			obj.crop[1] += dy*obj._ysf;
			obj.crop[3] -= dy*obj._ysf;
		} else if (side === 'bottom') {
			var minBottom = obj.top+40;
			var maxBottom = obj.top+obj._image.naturalHeight/obj._ysf;
			var bottom = Math.min(Math.max(draw.mouse[1],minBottom),maxBottom);
			obj.height = bottom-obj.top;
			obj.crop[3] = obj.height*obj._ysf;
			//console.log('height:',obj.height,obj.crop[3]);
		}
	},
	cropStop: function(e) {
		delete draw._drag;
	}
}
draw.pdfPage = {
	resizable: true,
	add: function (url, pageIndex) {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					_loaded: false,
					type: 'pdfPage',
					left: center[0]-600,
					top: center[1]-925,
					width: 1200,
					height: 1850,
					url: url,
					pageIndex: pageIndex
				}
			],
			selected: true,
			trigger: []
		});
		draw.pdfPage.load(draw.path.last().obj[0]);
	},
	load: function (obj) {
		var url = obj.url;
		var pageIndex = obj.pageIndex;
		if (un(draw.pdfsLoaded)) {
			draw.pdfsLoaded = [];
			draw.pdfsData = [];
		}
		var pdfIndex = draw.pdfsLoaded.indexOf(url);
		if (pdfIndex > -1) {
			obj._image = draw.pdfsData[pdfIndex][pageIndex];
			obj._img = new Image();
			obj._img.onload = function () {
				obj._loaded = true;
				obj.width = obj._img.naturalWidth;
				obj.height = obj._img.naturalHeight;
				obj.naturalWidth = obj._img.naturalWidth;
				obj.naturalHeight = obj._img.naturalHeight;
				updateBorder(draw.path.last());
				drawCanvasPaths();
			};
			obj._img.src = obj._image;
		} else {
			draw.pdfsLoaded.push(url);
			draw.pdfsData.push([]);
			PDFJS.disableWorker = true;
			PDFJS.getDocument(url).then(function getPdf(_pdf) {
				var canvas = draw.hiddenCanvas;
				var ctx = canvas.getContext('2d');
				var currentPage = 1;
				if (currentPage <= _pdf.numPages)
					getPage();

				function getPage() {
					_pdf.getPage(currentPage).then(function (page) {
						var scale = 1200 / 595.28;
						var viewport = page.getViewport(scale);

						canvas.height = viewport.height;
						canvas.width = viewport.width;

						var renderContext = {
							canvasContext: ctx,
							viewport: viewport
						};

						page.render(renderContext).then(function () {
							draw.pdfsData.last().push(canvas.toDataURL());
							if (currentPage < _pdf.numPages) {
								currentPage++;
								getPage();
							} else {
								done();
							}
						});
					});
				}

				/*for(var i = 1; i <= _pdf.numPages; i++){
				canvas.clearRect(0,0,1200,1850);
				_pdf.getPage(i).then(function getPage(page){
				var viewport = page.getViewport(1200/595.28);
				page.render({canvasContext: ctx, viewport: viewport}).then(function() {
				draw.pdfsData.last().push(canvas.toDataURL());
				});
				});
				}*/
				function done() {
					obj._image = draw.pdfsData.last()[pageIndex];
					obj._img = new Image();
					obj._img.onload = function () {
						obj._loaded = true;
						obj.width = obj._img.naturalWidth;
						obj.height = obj._img.naturalHeight;
						obj.naturalWidth = obj._img.naturalWidth;
						obj.naturalHeight = obj._img.naturalHeight;
						updateBorder(draw.path.last());
						drawCanvasPaths();
					};
					obj._img.src = obj._image;
				}
			});
		}
	},
	draw: function (ctx, obj, path) {
		if (obj._loaded == true) {
			ctx.drawImage(obj._img, obj.left, obj.top, obj.width, obj.height);
		} else {
			draw.pdfPage.load(obj);
		}
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		obj.width += dw;
		obj.height += dh;
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		obj.width *= sf;
		obj.height *= sf;
	}
}
draw.point = {
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'point',
					center: center,
					radius: 5,
					color: draw.color,
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (obj._highlight === true) {
			ctx.save();
			//ctx.filter = "blur(4px)";
			ctx.fillStyle = '#FF0';
			ctx.beginPath();
			ctx.arc(obj.center[0], obj.center[1], obj.radius+7, 0, 2 * Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.restore();
		}
		ctx.save();
		ctx.fillStyle = obj.color;
		ctx.beginPath();
		ctx.arc(obj.center[0], obj.center[1], obj.radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.beginPath();
		ctx.restore();
	},
	getRect: function (obj) {
		obj._left = obj.center[0] - obj.radius;
		obj._top = obj.center[1] - obj.radius;
		obj._width = 2 * obj.radius;
		obj._height = 2 * obj.radius;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	drawButton: function (ctx, size) {
		draw.point.draw(ctx, {
			center: [0.5 * size, 0.5 * size],
			radius: 0.05 * size,
			color: '#000'
		});
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		if (!un(obj.radius))
			obj.radius *= sf;
	},
	getLineWidth: function (obj) {
		return obj.radius;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.color;
	},
	setLineWidth: function (obj, value) {
		obj.radius = value;
	},
	setLineColor: function (obj, value) {
		obj.color = value;
	},
	setFillColor: function (obj, value) {
		obj.color = value;
	}
}
draw.circle = {
	keyPoints:['center'],
	add: function () {
		changeDrawMode('circle');
	},
	/*add: function() {
	deselectAllPaths(false);
	changeDrawMode();
	draw.path.push({obj:[{
	type:'circle',
	center:[150,150],
	radius:100,
	lineWidth:draw.thickness,
	lineColor:draw.color,
	}],selected:true,trigger:[]});
	updateBorder(draw.path.last());
	drawCanvasPaths();
	},*/
	draw: function (ctx, obj, path) {
		if (obj.radius <= 0)
			return;
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function')
			ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined')
			ctx.setLineDash(obj.dash);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		if (typeof obj.fillColor !== 'undefined' && obj.fillColor !== 'none') {
			ctx.save();
			ctx.fillStyle = obj.fillColor;
			ctx.beginPath();
			ctx.arc(obj.center[0], obj.center[1], obj.radius, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
		}
		if (obj.showCenter == true || (draw.mode === 'edit' && path.selected == true && path.obj.length == 1)) {
			ctx.save();
			ctx.fillStyle = '#000';
			ctx.beginPath();
			ctx.arc(obj.center[0], obj.center[1], 3, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
		}
		ctx.beginPath();
		ctx.arc(obj.center[0], obj.center[1], obj.radius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.restore();
		delete obj.left;
		delete obj.top;
		delete obj.width;
		delete obj.height;
	},
	getRect: function (obj) {
		obj._left = obj.center[0] - obj.radius;
		obj._top = obj.center[1] - obj.radius;
		obj._width = 2 * obj.radius;
		obj._height = 2 * obj.radius;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	drawButton: function (ctx, size) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.02 * size;
		ctx.beginPath();
		ctx.arc(0.5 * size, 0.5 * size, 0.3 * size, 0, 2 * Math.PI);
		ctx.stroke();
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		if (!un(obj.radius))
			obj.radius *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
}
draw.ellipse = {
	add: function () {
		changeDrawMode('ellipse');
	},
	/*add: function() {
	deselectAllPaths(false);
	changeDrawMode();
	draw.path.push({obj:[{
	type:'ellipse',
	center:[150,150],
	radiusX:100,
	radiusY:50,
	lineWidth:draw.thickness,
	lineColor:draw.color,
	}],selected:true,trigger:[]});
	updateBorder(draw.path.last());
	drawCanvasPaths();
	},*/
	draw: function (ctx, obj, path) {
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined') ctx.setLineDash(obj.dash);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		if (typeof obj.fillColor !== 'undefined' && obj.fillColor !== 'none') {
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = obj.fillColor;
			ctx.ellipse(obj.center[0], obj.center[1], obj.radiusX, obj.radiusY, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
		}
		if (obj.showCenter == true || (draw.mode === 'edit' && path.selected == true && path.obj.length == 1)) {
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = '#000';
			ctx.beginPath();
			ctx.arc(obj.center[0], obj.center[1], 3, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
		}

		ctx.beginPath();
		ctx.moveTo(obj.center[0] + obj.radiusX, obj.center[1]);
		ctx.ellipse(obj.center[0], obj.center[1], obj.radiusX, obj.radiusY, 0, 0, 2 * Math.PI);
		ctx.stroke();

		ctx.setLineDash([]);
		ctx.restore();
	},
	getRect: function (obj) {
		obj._left = obj.center[0] - obj.radiusX;
		obj._top = obj.center[1] - obj.radiusY;
		obj._width = 2 * obj.radiusX;
		obj._height = 2 * obj.radiusY;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	drawButton: function (ctx, size) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.02 * size;
		ctx.beginPath();
		ctx.ellipse(0.5 * size, 0.5 * size, 0.3 * size, 0.15 * size, 0, 0, 2 * Math.PI);
		ctx.stroke();
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		if (!un(obj.radiusX))
			obj.radiusX *= sf;
		if (!un(obj.radiusY))
			obj.radiusY *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
}
draw.angle = {
	keyPoints:['a','b','c'],
	resizable:true,
	/*add: function(isArc) {
	if (boolean(isArc,false) == true) {
	drawLines = false;
	} else {
	drawLines = true;
	}
	deselectAllPaths(false);
	changeDrawMode();
	draw.path.push({obj:[{
	type:'angle',
	b:[900-draw.drawRelPos[0],200-draw.drawRelPos[1]],
	radius:35,
	angleC:0,
	c:[900-draw.drawRelPos[0]+35*Math.cos(0),200-draw.drawRelPos[1]+35*Math.sin(0)],
	angleA:-Math.PI/3,
	a:[900-draw.drawRelPos[0]+35*Math.cos(-Math.PI/3),200-draw.drawRelPos[1]+35*Math.sin(-Math.PI/3)],
	lineWidth:draw.thickness,
	lineColor:draw.color,
	fillColor:'none',
	fill:true,
	drawLines:drawLines,
	squareForRight:false,
	labelIfRight:true,
	measureLabelOnly:true
	}],selected:true,trigger:[]});
	updateBorder(draw.path.last());
	drawCanvasPaths();
	},*/
	add: function (x, y, r1, r2) {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();
		if (un(x)) x = center[0];
		if (un(y)) y = center[1];
		if (un(r1)) r1 = 100;
		if (un(r2)) r2 = 30;
		var obj = {
			type: 'angle',
			style: 1,
			b: [x, y],
			radius: r2,
			angleC: 0,
			c: [x + r1 * Math.cos(0), y + r2 * Math.sin(0)],
			angleA: -Math.PI / 3,
			a: [x + r1 * Math.cos(-Math.PI / 3), y + r1 * Math.sin(-Math.PI / 3)],
			lineWidth: draw.thickness,
			lineColor: draw.color,
			fillColor: 'none',
			fill: true,
			drawLines: true,
			measureLabelOnly: true,
			d: []
		}
		draw.angle.calcD(obj);
		draw.path.push({
			obj: [obj],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	calcD: function (obj) {
		obj.angleA = posToAngle(obj.a[0], obj.a[1], obj.b[0], obj.b[1]);
		obj.d = [obj.b[0] + obj.radius * Math.cos(obj.angleA), obj.b[1] + obj.radius * Math.sin(obj.angleA)];
	},
	draw: function (ctx, obj, path) {
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness || 1;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		var obj2 = clone(obj);
		obj2.ctx = ctx;
		obj._angleLabelPos = drawAngle(obj2);

		if (draw.mode === 'edit' && path.obj.length == 1 && path.selected == true) {
			if (obj.isSector !== true && obj.isArc !== true && obj.measureLabelOnly !== false) {
				drawAngle({
					ctx: ctx,
					a: obj.a,
					b: obj.b,
					c: obj.c,
					drawLines: false,
					drawCurve: false,
					radius: obj.radius,
					lineColor: colorA('#000', 0.3),
					labelMeasure: true,
					labelFontSize: 25,
					labelRadius: obj.radius + 3,
					labelColor: colorA('#000', 0.3),
					lineWidth: 2
				});
			}

			ctx.save();
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';
			ctx.fillStyle = colorA('#F00', 1);
			ctx.beginPath();
			ctx.arc(obj.b[0], obj.b[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(obj.a[0], obj.a[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(obj.c[0], obj.c[1], 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			if (!un(obj.d)) {
				draw.angle.calcD(obj);
				ctx.beginPath();
				ctx.arc(obj.d[0], obj.d[1], 8, 0, 2 * Math.PI);
				ctx.fillStyle = '#F90';
				ctx.fill();
				ctx.stroke();
			}
			ctx.restore();
		}
	},
	getRect: function (obj) {
		var a = getAngleTwoPoints(obj.b,obj.a);
		var c = getAngleTwoPoints(obj.b,obj.c);
		var pos1 = [obj.b[0] + obj.radius * Math.cos(a), obj.b[1] + obj.radius * Math.sin(a)];
		var pos2 = [obj.b[0] + obj.radius * Math.cos(c), obj.b[1] + obj.radius * Math.sin(c)];
		var arc = {startAngle:c,finAngle:a,clockwise:false};
		if (obj.drawLines !== false) {
			obj._left = Math.min(pos1[0], pos2[0], obj.a[0], obj.b[0], obj.c[0]);
			obj._right = Math.max(pos1[0], pos2[0], obj.a[0], obj.b[0], obj.c[0]);
			obj._top = Math.min(pos1[1], pos2[1], obj.a[1], obj.b[1], obj.c[1]);
			obj._bottom = Math.max(pos1[1], pos2[1], obj.a[1], obj.b[1], obj.c[1]);
		} else {
			obj._left = Math.min(pos1[0], pos2[0], obj.b[0]);
			obj._right = Math.max(pos1[0], pos2[0], obj.b[0]);
			obj._top = Math.min(pos1[1], pos2[1], obj.b[1]);
			obj._bottom = Math.max(pos1[1], pos2[1], obj.b[1]);
		}
		if (doesArcIncludeAngle(arc, 0) == true) obj._right = Math.max(obj._right,obj.b[0] + obj.radius);
		if (doesArcIncludeAngle(arc, 0.5 * Math.PI) == true) obj._bottom = Math.max(obj._bottom,obj.b[1] + obj.radius);
		if (doesArcIncludeAngle(arc, Math.PI) == true) obj._left = Math.min(obj._left,obj.b[0] - obj.radius);
		if (doesArcIncludeAngle(arc, 1.5 * Math.PI) == true) obj._top = Math.min(obj._top,obj.b[1] - obj.radius);
		
		obj._width = obj._right - obj._left;
		obj._height = obj._bottom - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
		/*
		if (!un(obj.d)) {
			obj._left = Math.min(obj.a[0], obj.b[0], obj.c[0]) - 20;
			obj._top = Math.min(obj.a[1], obj.b[1], obj.c[1]) - 20;
			obj._width = Math.max(obj.a[0], obj.b[0], obj.c[0]) - obj._left + 40;
			obj._height = Math.max(obj.a[1], obj.b[1], obj.c[1]) - obj._top + 40;
		} else {
			if (obj.isArc == true || obj.isSector == true) {
				obj._left = Math.min(obj.a[0], obj.b[0], obj.c[0]) - 20;
				obj._top = Math.min(obj.a[1], obj.b[1], obj.c[1]) - 20;
				if (isPointInSector([obj.b[0] - 1, obj.b[1]], [obj.b[0], obj.b[1], 10, obj.angleA, obj.angleC]) == true) {
					obj._left = obj.b[0] - obj.radius - 20;
				}
				if (isPointInSector([obj.b[0], obj.b[1] - 1], [obj.b[0], obj.b[1], 10, obj.angleA, obj.angleC]) == true) {
					obj._top = obj.b[1] - obj.radius - 20;
				}
				obj._width = Math.max(obj.a[0], obj.b[0], obj.c[0]) + 20 - obj._left;
				obj._height = Math.max(obj.a[1], obj.b[1], obj.c[1]) + 20 - obj._top;
				if (isPointInSector([obj.b[0] + 1, obj.b[1]], [obj.b[0], obj.b[1], 10, obj.angleA, obj.angleC]) == true) {
					obj._width = obj.b[0] + obj.radius + 20 - obj._left;
				}
				if (isPointInSector([obj.b[0], obj.b[1] + 1], [obj.b[0], obj.b[1], 10, obj.angleA, obj.angleC]) == true) {
					obj._height = obj.b[1] + obj.radius + 20 - obj._top;
				}
			} else {
				obj._left = obj.b[0] - obj.radius;
				obj._top = obj.b[1] - obj.radius;
				obj._width = 2 * obj.radius;
				obj._height = 2 * obj.radius;
			}
		}
		return [obj._left, obj._top, obj._width, obj._height];*/
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		if (un(pathNum))
			return buttons;
		if (un(draw.path[pathNum]))
			return buttons;
		var obj = draw.path[pathNum].obj[0];
		if (un(obj.d)) {
			buttons.push({
				buttonType: 'angle-showLines',
				shape: 'rect',
				dims: [x2 - 20, y2 - 40, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.angle.showLines,
				pathNum: pathNum
			});
		} else {
			buttons.push({
				buttonType: 'angle-showLines',
				shape: 'rect',
				dims: [x2 - 20, y1 + 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.angle.showLines,
				pathNum: pathNum
			});
			buttons.push({
				buttonType: 'angle-showAngle',
				shape: 'rect',
				dims: [x2 - 20, y1 + 40, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.angle.showAngle,
				pathNum: pathNum
			});
			buttons.push({
				buttonType: 'angle-numOfCurves',
				shape: 'rect',
				dims: [x2 - 20, y1 + 60, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.angle.numOfCurves,
				pathNum: pathNum
			});
		}
		return buttons;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		if (obj.isSector !== true && obj.isArc !== true) {
			if (!un(obj._angleLabelPos)) {
				pos.push({
					shape: 'rect',
					dims: obj._angleLabelPos,
					cursor: draw.cursors.pointer,
					func: draw.angle.showAngle,
					pathNum: pathNum
				});
			}
			pos.push({
				shape: 'sector',
				dims: [obj.b[0], obj.b[1], obj.radius, getAngleTwoPoints(obj.b, obj.a), getAngleTwoPoints(obj.b, obj.c)],
				cursor: draw.cursors.pointer,
				func: draw.angle.setAngleStyle,
				pathNum: pathNum
			});
		}
		pos.push({
			shape: 'circle',
			dims: [obj.b[0], obj.b[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.angle.startDragB,
			pathNum: pathNum
		});
		pos.push({
			shape: 'circle',
			dims: [obj.a[0], obj.a[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.angle.startDragA,
			pathNum: pathNum
		});
		pos.push({
			shape: 'circle',
			dims: [obj.c[0], obj.c[1], 8],
			cursor: draw.cursors.pointer,
			func: draw.angle.startDragC,
			pathNum: pathNum
		});
		if (!un(obj.d)) {
			pos.push({
				shape: 'circle',
				dims: [obj.d[0], obj.d[1], 8],
				cursor: draw.cursors.pointer,
				func: draw.angle.startDragD,
				pathNum: pathNum
			});
		}
		return pos;
	},
	startDragA: function () {
		changeDrawMode('angleDragA');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.angle.posMove,draw.angle.posStop,drawCanvasPaths);		
		//addListenerMove(window, draw.angle.posMove);
		//addListenerEnd(window, draw.angle.posStop);
	},
	startDragB: function () {
		changeDrawMode('angleDragB');
		draw.currPathNum = draw.currCursor.pathNum;
		var obj = draw.path[draw.currPathNum].obj[0];
		draw.relPosA = getVectorAB(obj.b, obj.a);
		draw.relPosC = getVectorAB(obj.b, obj.c);
		if (!un(obj.d))
			draw.relPosD = getVectorAB(obj.b, obj.d);
		updateSnapPoints(); // update intersection points
		drawCanvasPaths()
		draw.animate(draw.angle.posMove,draw.angle.posStop,drawCanvasPaths);		
		//addListenerMove(window, draw.angle.posMove);
		//addListenerEnd(window, draw.angle.posStop);
	},
	startDragC: function () {
		changeDrawMode('angleDragC');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.angle.posMove,draw.angle.posStop,drawCanvasPaths);		
		//addListenerMove(window, draw.angle.posMove);
		//addListenerEnd(window, draw.angle.posStop);
	},
	startDragD: function () {
		changeDrawMode('angleDragD');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.angle.posMove,draw.angle.posStop,drawCanvasPaths);		
		//addListenerMove(window, draw.angle.posMove);
		//addListenerEnd(window, draw.angle.posStop);
	},
	posMove: function (e) {
		updateMouse(e);
		var pos = draw.mouse;
		var pathNum = draw.currPathNum;
		if (snapToObj2On || draw.snapLinesTogether)
			pos = snapToObj2(pos, pathNum);
		var obj = draw.path[pathNum].obj[0];
		if (draw.drawMode == 'angleDragB') {
			obj.b = pos;
			obj.a = pointAddVector(obj.b, draw.relPosA);
			obj.c = pointAddVector(obj.b, draw.relPosC);
			if (!un(obj.d))
				obj.d = pointAddVector(obj.b, draw.relPosD);
		} else if (!un(obj.d)) {
			if (draw.drawMode == 'angleDragA') {
				obj.a = pos;
				obj.recalcD = true;
			} else if (draw.drawMode == 'angleDragC') {
				obj.c = pos;
				obj.recalcD = true;
			} else if (draw.drawMode == 'angleDragD') {
				obj.radius = getDist(obj.b, pos);
				draw.angle.calcD(obj);
				if (!un(obj.labelRadius)) {
					obj.labelRadius = obj.radius + 3;
				}
			}
		} else {
			if (draw.drawMode == 'angleDragA') {
				obj.angleA = getAngleTwoPoints(obj.b, pos);
				obj.a = [obj.b[0] + obj.radius * Math.cos(obj.angleA), obj.b[1] + obj.radius * Math.sin(obj.angleA)];
			} else if (draw.drawMode == 'angleDragC') {
				obj.angleC = getAngleTwoPoints(obj.b, pos);
				obj.c = [obj.b[0] + obj.radius * Math.cos(obj.angleC), obj.b[1] + obj.radius * Math.sin(obj.angleC)];
			}
		}
		updateBorder(draw.path[pathNum]);
		//drawSelectedPaths();
		//drawSelectCanvas();
		draw.prevX = mouse.x;
		draw.prevY = mouse.y;
	},
	posStop: function (e) {
		//removeListenerMove(window, draw.angle.posMove);
		//removeListenerEnd(window, draw.angle.posStop);
		changeDrawMode();
	},
	showLines: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (typeof obj.drawLines == 'undefined') {
			obj.drawLines = false;
		} else {
			obj.drawLines = !obj.drawLines;
		}
		drawSelectedPaths();
		drawSelectCanvas();
	},
	setAngleStyle: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		angleStyleIncrement(obj);
		drawSelectedPaths();
		drawSelectCanvas();
	},
	showAngle: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		obj.measureLabelOnly = !obj.measureLabelOnly;
		obj.labelMeasure = true;
		obj.labelFontSize = 25;
		obj.labelRadius = obj.radius + 3;
		drawSelectedPaths();
		drawSelectCanvas();
	},
	numOfCurves: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.path[pathNum].obj[0];
		if (typeof obj.numOfCurves == 'undefined') {
			obj.numOfCurves = 2;
		} else {
			obj.numOfCurves++;
			if (obj.numOfCurves == 4)
				obj.numOfCurves = 1;
		}
		drawSelectedPaths();
		drawSelectCanvas();
	},
	drawButton: function (ctx, size) {
		drawAngle({
			ctx: ctx,
			a: [0.55 * size, 0.3 * size],
			b: [0.2 * size, 0.7 * size],
			c: [0.8 * size, 0.7 * size],
			fill: false,
			radius: 0.3 * size,
			drawLines: true,
			lineWidth: 0.03 * size
		});
	},
	scale: function (obj, sf, center,changeLineWidths) {
		if (un(center)) var center = obj.b;
		obj.a[0] = center[0] + sf * (obj.a[0] - center[0]);
		obj.a[1] = center[1] + sf * (obj.a[1] - center[1]);
		obj.b[0] = center[0] + sf * (obj.b[0] - center[0]);
		obj.b[1] = center[1] + sf * (obj.b[1] - center[1]);
		obj.c[0] = center[0] + sf * (obj.c[0] - center[0]);
		obj.c[1] = center[1] + sf * (obj.c[1] - center[1]);
		obj.radius *= sf;
		if (changeLineWidths !== false) {
			if (!un(obj.radius) ) obj.radius *= sf;
			if (!un(obj.lineWidth)) obj.lineWidth *= sf;
		}
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.a[0] += dl;
		obj.a[1] += dt;
		obj.b[0] += dl;
		obj.b[1] += dt;
		obj.c[0] += dl;
		obj.c[1] += dt;
		var width = draw.angle.getRect(obj)[2];
		var sf = (width+dw)/width;
		if (sf > 0) draw.angle.scale(obj,sf,obj.b,false);
	},
	positionLabel: function(angle,txt,spacing,vertexLabel) {
		//draw.angle.positionLabel({a:[100,200],b:[],c:[]},{type:'text2',text:['label'],rect:[100,100,200,300]});
		if (un(spacing)) spacing = 30;
		var minRect = txt.rect;
		if (typeof txt.box !== 'object' || txt.box.type !== 'loose') {
			var txt2 = clone(txt);
			txt2.ctx = draw.hiddenCanvas.ctx;
			txt2.measureOnly = true;
			txt2.minTightWidth = 1;
			txt2.minTightHeight = 1;
			delete txt2.box;
			var minRect = text(txt2).tightRect;
			minRect[2] += 10;
			minRect[3] -= 3;
		}
	    var a = getAngleMidAngle(angle);
		if (vertexLabel === true) a += Math.PI;
		var mag = vector.getMagnitude([0.5 * minRect[2] * Math.cos(a), 0.5 * minRect[3] * Math.sin(a)]) + spacing;
		var v = angleToVector(a, mag);
		var textCenter = vector.addVectors(angle.b, v);
		txt.rect[0] = textCenter[0] - 0.5 * txt.rect[2];
		txt.rect[1] = textCenter[1] - 0.5 * txt.rect[3];
	}
}
draw.anglesAroundPoint = {
	add: function (x, y, r1, a1, a2, a3) {
		deselectAllPaths(false);
		var center = draw.getViewCenter();
		if (un(x)) x = center[0];
		if (un(y)) y = center[1];
		if (un(r1)) r1 = 100;
		if (un(a1)) a1 = (1 / 3) * Math.PI;
		if (un(a2)) a2 = (1 / 1) * Math.PI;
		if (un(a3)) a3 = (5 / 3) * Math.PI;
		var angles = [{
				style: 1,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				drawCurve: true,
				measureLabelOnly: true
			}, {
				style: 1,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				drawCurve: true,
				measureLabelOnly: true
			}, {
				style: 1,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				drawCurve: true,
				measureLabelOnly: true
			}
		];
		draw.path.push({
			obj: [{
					type: 'anglesAroundPoint',
					center: [x, y],
					points: [
						[x + r1 * Math.cos(a1), y + r1 * Math.sin(a1)],
						[x + r1 * Math.cos(a2), y + r1 * Math.sin(a2)],
						[x + r1 * Math.cos(a3), y + r1 * Math.sin(a3)],
					],
					color: draw.color,
					thickness: draw.thickness,
					angles: angles,
					radius: r1
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	draw: function (ctx, obj, path) {
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};
		if (typeof obj.dash !== 'undefined') ctx.setLineDash(obj.dash);
		if (obj.points.length > 0) {
			var obj2 = clone(obj);
			/*for (var p = 0; p < obj2.points.length; p++) {
				obj2.points[p][0] = obj2.points[p][0];
				obj2.points[p][1] = obj2.points[p][1];
			}*/
			if (typeof obj2.angles !== 'undefined') {
				for (var a = 0; a < obj2.angles.length; a++) {
					if (typeof obj2.angles[a] == 'object' && obj2.angles[a] !== null) {
						if (typeof obj2.angles[a].lineWidth !== 'undefined') {
							obj2.angles[a].lineWidth = obj2.angles[a].lineWidth;
						}
						if (typeof obj2.angles[a].labelRadius !== 'undefined') {
							obj2.angles[a].labelRadius = obj2.angles[a].labelRadius;
						}
						if (typeof obj2.angles[a].labelFontSize !== 'undefined') {
							obj2.angles[a].labelFontSize = obj2.angles[a].labelFontSize;
						}
						if (typeof obj2.angles[a].radius !== 'undefined') {
							obj2.angles[a].radius = obj2.angles[a].radius;
						}
					}
				}
			}
			obj2.center = [obj.center[0], obj.center[1]];
			obj2.thickness = obj.thickness;
			obj2.ctx = ctx;
			obj._angleLabelPos = drawAnglesAroundPoint(obj2);
		}
		ctx.setLineDash([]);

		if (path.obj.length == 1) {
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';
			ctx.fillStyle = '#F00';
			var angleObj = {
				ctx: ctx,
				drawLines: false,
				radius: 30,
				lineColor: colorA(obj.color, 0.3),
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				labelColor: colorA(obj.color, 0.3),
				lineWidth: 2,
				curveWidth: 2
			};
			if (obj.points.length === 1) {
				angleObj.measureLabelOnly = !obj.angles[0].measureLabelOnly;
				angleObj.drawCurve = !obj.angles[0].drawCurve;
				angleObj.a = obj.points[0];
				angleObj.b = obj.center;
				angleObj.c = [obj.points[0]+0.001,obj.points[1]+0.001];
				drawAngle(angleObj);
				if (path.selected == true) {
					ctx.beginPath();
					ctx.arc(obj.points[0][0], obj.points[0][1], 7, 0, 2 * Math.PI);
					ctx.fill();
					ctx.stroke();
				}
			} else {
				for (var k = 0; k < obj.points.length; k++) {
					if ((path.selected == true || (obj.drawing == true && k > 0 && k < obj.points.length - 1)) && (un(obj.angles) || un(obj.angles[k]) || (!un(obj.angles[k]) && (obj.angles[k].drawCurve == false || obj.angles[k].measureLabelOnly == true)))) {
						if (!un(obj.angles) && !un(obj.angles[k])) angleObj.measureLabelOnly = !obj.angles[k].measureLabelOnly;
						if (!un(obj.angles) && !un(obj.angles[k])) angleObj.drawCurve = !obj.angles[k].drawCurve;
						angleObj.b = obj.center;
						angleObj.a = obj.points[k];
						if (k == obj.points.length - 1) {
							angleObj.c = obj.points[0];
						} else {
							angleObj.c = obj.points[k + 1];
						}
						drawAngle(angleObj);
					}
					if (path.selected == true) {
						ctx.beginPath();
						ctx.arc(obj.points[k][0], obj.points[k][1], 7, 0, 2 * Math.PI);
						ctx.fill();
						ctx.stroke();
					}
				}
			}
		}
	},
	getRect: function (obj) {
		obj._left = obj.center[0] - 65;
		obj._top = obj.center[1] - 65;
		obj._right = obj.center[0] + 65;
		obj._bottom = obj.center[1] + 65;
		for (var j = 0; j < obj.points.length; j++) {
			obj._left = Math.min(obj._left, obj.points[j][0] - 65);
			obj._top = Math.min(obj._top, obj.points[j][1] - 65);
			obj._right = Math.max(obj._right, obj.points[j][0] + 65);
			obj._bottom = Math.max(obj._bottom, obj.points[j][1] + 65);
		}
		obj._width = obj._right - obj._left;
		obj._height = obj._bottom - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'anglesAroundPoint-pointsMinus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.anglesAroundPoint.pointsMinus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'anglesAroundPoint-pointsPlus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 60, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.anglesAroundPoint.pointsPlus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'anglesAroundPoint-fixRadius',
			shape: 'rect',
			dims: [x2 - 20, y2 - 80, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.anglesAroundPoint.fixRadius,
			pathNum: pathNum
		});
		return buttons;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		for (var k = 0; k < obj.points.length; k++) {
			if (!un(obj._angleLabelPos) && !un(obj._angleLabelPos[k])) {
				pos.push({
					shape: 'rect',
					dims: obj._angleLabelPos[k],
					cursor: draw.cursors.pointer,
					func: draw.anglesAroundPoint.toggleLabel,
					pathNum: pathNum,
					point: k
				});
			}
		}
		for (var k = 0; k < obj.points.length; k++) {
			var next = k + 1;
			if (k == obj.points.length - 1)
				next = 0;
			pos.push({
				shape: 'sector',
				dims: [obj.center[0], obj.center[1], 30, getAngleTwoPoints(obj.center, obj.points[k]), getAngleTwoPoints(obj.center, obj.points[next])],
				cursor: draw.cursors.pointer,
				func: draw.anglesAroundPoint.toggleAngle,
				pathNum: pathNum,
				point: k
			});
			pos.push({
				shape: 'circle',
				dims: [obj.points[k][0], obj.points[k][1], 8],
				cursor: draw.cursors.pointer,
				func: draw.anglesAroundPoint.startPointDrag,
				pathNum: pathNum,
				point: k
			});
		}
		return pos;
	},
	pointsMinus: function (path) {
		if (un(path)) {
			if (!un(draw.currCursor.pathNum)) {
				path = draw.path[draw.currCursor.pathNum];
			} else {
				path = selPath();
			}
		}
		var obj = path.obj[0];
		if (obj.points.length > 2) {
			if (!un(obj.angles) && !un(obj.angles[obj.points.length - 1]))
				obj.angles[obj.points.length - 1] = null;
			obj.points.pop();
			obj.angles.pop();
			obj._angleLabelPos.pop();
		}
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	pointsPlus: function (path) {
		if (un(path)) {
			if (!un(draw.currCursor.pathNum)) {
				path = draw.path[draw.currCursor.pathNum];
			} else {
				path = selPath();
			}
		}
		var obj = path.obj[0];
		var theta1 = 2 * Math.PI - posToAngle(obj.points[0][0], obj.points[0][1], obj.center[0], obj.center[1]);
		var theta2 = 2 * Math.PI - posToAngle(obj.points[obj.points.length - 1][0], obj.points[obj.points.length - 1][1], obj.center[0], obj.center[1]);
		if (theta2 < theta1)
			theta1 -= 2 * Math.PI;
		obj.points.push(angleToPos((theta1 + theta2) / 2, obj.center[0], obj.center[1], obj.radius));
		obj.angles.push({
			style: 1,
			radius: 30,
			labelMeasure: true,
			labelFontSize: 25,
			labelRadius: 33,
			drawCurve: true,
			measureLabelOnly: true
		});
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	fixRadius: function () {
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		draw.anglesAroundPoint.fixToRadius(obj);
	},
	fixToRadius: function (obj) {
		for (var p = 0; p < obj.points.length; p++) {
			var theta = 2 * Math.PI - posToAngle(obj.points[p][0], obj.points[p][1], obj.center[0], obj.center[1]);
			obj.points[p] = angleToPos(theta, obj.center[0], obj.center[1], obj.radius);
		}
		var pathNum = draw.currCursor.pathNum;
		updateBorder(draw.path[pathNum]);
		drawSelectedPaths();
		drawSelectCanvas();
	},
	startPointDrag: function () {
		changeDrawMode('anglesAroundPointDrag');
		draw.currPathNum = draw.currCursor.pathNum;
		draw.currPoint = draw.currCursor.point;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.anglesAroundPoint.pointMove,draw.anglesAroundPoint.pointStop,drawCanvasPaths);		
		//addListenerMove(window, draw.anglesAroundPoint.pointMove);
		//addListenerEnd(window, draw.anglesAroundPoint.pointStop);
	},
	pointMove: function (e) {
		updateMouse(e);
		var pos = draw.mouse;
		if (snapToObj2On || draw.snapLinesTogether)
			pos = snapToObj2(pos, draw.currPathNum);
		var pathNum = draw.currPathNum;
		var point = draw.currPoint;
		var obj = draw.path[pathNum].obj[0];
		obj.points[point] = pos;
		if (shiftOn) {
			var angle = getAngleTwoPoints(obj.center, [mouse.x, mouse.y]);
			if (angle < 0)
				angle += 2 * Math.PI;
			var len = getDist(obj.center, pos);
			var snap = (roundToNearest(roundToNearest(angle, Math.PI / 2) / (Math.PI / 2), 1)) % 4;
			if (snap == 0) {
				obj.points[point] = [obj.center[0] + len, obj.center[1]];
			} else if (snap == 1) {
				obj.points[point] = [obj.center[0], obj.center[1] + len];
			} else if (snap == 2) {
				obj.points[point] = [obj.center[0] - len, obj.center[1]];
			} else if (snap == 3) {
				obj.points[point] = [obj.center[0], obj.center[1] - len];
			}
		}
		prevPoint = point - 1;
		if (prevPoint < 0)
			prevPoint = obj.points.length - 1;
		var angle1 = posToAngle(obj.points[prevPoint][0], obj.points[prevPoint][1], obj.center[0], obj.center[1]);
		var angle2 = posToAngle(obj.points[point][0], obj.points[point][1], obj.center[0], obj.center[1]);
		nextPoint = point + 1;
		if (nextPoint > obj.points.length - 1)
			nextPoint = 0;
		var angle3 = posToAngle(obj.points[nextPoint][0], obj.points[nextPoint][1], obj.center[0], obj.center[1]);

		if ((angle1 < angle2 && angle2 < angle3) || // order 123
			(angle2 < angle3 && angle3 < angle1) || // order 231
			(angle3 < angle1 && angle1 < angle2)) { // order 312
		} else {
			if (Math.abs(angle2 - angle1) < Math.abs(angle3 - angle2)) {
				// swap prevPoint & point
				var prev1 = clone(obj.points[prevPoint]);
				var prev2 = clone(obj.points[point]);
				obj.points[point] = prev1;
				obj.points[prevPoint] = prev2;
				var prevA1 = clone(obj.angles[prevPoint]);
				var prevA2 = clone(obj.angles[point]);
				obj.angles[point] = prevA1;
				obj.angles[prevPoint] = prevA2;
				draw.currPoint = prevPoint;
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
				draw.currPoint = nextPoint;
			}
		}

		updateBorder(draw.path[pathNum]);
		//drawSelectedPaths();
		//drawSelectCanvas();
		draw.prevX = mouse.x;
		draw.prevY = mouse.y;
	},
	pointStop: function (e) {
		var pathNum = draw.currPathNum;
		var point = draw.currPoint;
		var obj = draw.path[pathNum].obj[0];
		if (draw.gridSnap == true) {
			obj.points[point][0] = roundToNearest(obj.points[point][0], draw.gridSnapSize);
			obj.points[point][1] = roundToNearest(obj.points[point][1], draw.gridSnapSize);
			updateBorder(draw.path[pathNum]);
			drawSelectedPaths();
			drawSelectCanvas();
		}
		//removeListenerMove(window, draw.anglesAroundPoint.pointMove);
		//removeListenerEnd(window, draw.anglesAroundPoint.pointStop);
		changeDrawMode();
	},
	setAngleStyle: function (e) {
		updateMouse(e);
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		var mouseAngle = posToAngle(mouse.x, mouse.y, obj.center[0] + draw.drawRelPos[0], obj.center[1] + draw.drawRelPos[1]);

		var angles = [];
		var p = -1;
		for (var i = 0; i < obj.points.length; i++) {
			angles[i] = posToAngle(obj.points[i][0], obj.points[i][1], obj.center[0], obj.center[1]);
		}

		for (var i = 0; i < angles.length; i++) {
			var a1 = angles[i];
			if (i < angles.length - 1) {
				var a2 = angles[i + 1];
			} else {
				var a2 = angles[0];
			}
			if (a1 < a2 && mouseAngle > a1 && mouseAngle < a2) {
				p = i;
				break;
			} else if (a1 > a2) {
				if (mouseAngle > a1 || mouseAngle < a2) {
					p = i;
					break;
				}
			}
		}
		angleStyleIncrement(obj.angles[p]);
		var pathNum = draw.currCursor.pathNum;
		updateBorder(draw.path[pathNum]);
		drawSelectedPaths();
	},
	toggleLabel: function () {
		if (!un(draw.currCursor.pathNum)) {
			var path = draw.path[draw.currCursor.pathNum];
		} else {
			var path = selPath();
		}
		var obj = path.obj[0];
		if (obj.type !== 'anglesAroundPoint')
			return;
		var p = draw.currCursor.point;
		if (un(obj.angles))
			obj.angles = [];
		if (un(obj.angles[p]))
			obj.angles[p] = {
				style: 0,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				drawCurve: false,
				measureLabelOnly: true
			};
		obj.angles[p].measureLabelOnly = !obj.angles[p].measureLabelOnly;
		drawCanvasPaths();
	},
	toggleAngle: function (path) {
		if (!un(draw.currCursor.pathNum)) {
			var path = draw.path[draw.currCursor.pathNum];
		} else {
			var path = selPath();
		}
		var obj = path.obj[0];
		if (obj.type !== 'anglesAroundPoint')
			return;
		var p = draw.currCursor.point;
		if (un(obj.angles))
			obj.angles = [];
		if (un(obj.angles[p]))
			obj.angles[p] = {
				style: 0,
				radius: 30,
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				measureLabelOnly: true
			};
		//obj.angles[p].drawCurve = !obj.angles[p].drawCurve;
		angleStyleIncrement(obj.angles[p]);
		drawCanvasPaths();
	},
	drawButton: function (ctx, size) {
		drawAnglesAroundPoint({
			ctx: ctx,
			center: [0.5 * size, 0.4 * size],
			points: [[0.15 * size, 0.4 * size], [0.8 * size, 0.2 * size], [0.6 * size, 0.7 * size]],
			lineColor: '#000',
			thickness: 0.03 * size,
			angles: [{
					fill: true,
					fillColor: "#CFC",
					lineWidth: 0.02 * size,
					labelFontSize: 0.25 * size,
					labelMeasure: false,
					labelRadius: 0.33 * size,
					radius: 0.2 * size
				}, {
					fill: true,
					fillColor: "#FCC",
					lineWidth: 0.02 * size,
					labelFontSize: 0.25 * size,
					labelMeasure: false,
					labelRadius: 0.33 * size,
					radius: 0.2 * size
				}, {
					fill: true,
					fillColor: "#CCF",
					lineWidth: 0.02 * size,
					labelFontSize: 0.25 * size,
					labelMeasure: false,
					labelRadius: 0.33 * size,
					radius: 0.2 * size
				},
			]
		});
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		for (var p = 0; p < obj.points.length; p++) {
			obj.points[p][0] = center[0] + sf * (obj.points[p][0] - center[0]);
			obj.points[p][1] = center[1] + sf * (obj.points[p][1] - center[1]);
		}
		if (!un(obj.radius))
			obj.radius *= sf;
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.dash)) {
			if (!un(obj.dash[0]))
				obj.dash[0] *= sf;
			if (!un(obj.dash[1]))
				obj.dash[1] *= sf;
		}
	},
	getControlPanel: function (obj) {
		var elements = [{
				name: 'Style',
				type: 'style'
			}, {
				name: 'Vertices',
				type: 'increment',
				increment: function (obj, value) {
					if (value == 1) {
						draw.anglesAroundPoint.pointsPlus();
					} else {
						draw.anglesAroundPoint.pointsMinus();
					}
				}
			}
		];
		return {
			obj: obj,
			elements: elements
		};
	}
};
draw.anglesOnLine = {
	add: function () {
		draw.anglesAroundPoint.add(undefined, undefined, undefined, Math.PI, (4 / 3) * Math.PI, 2 * Math.PI);
		draw.path.last().obj[0].angles.last().drawCurve = false;
		draw.path.last().obj[0].angles.last().style = 0;
		drawCanvasPaths();
	},
	drawButton: function (ctx, size) {
		drawAnglesAroundPoint({
			ctx: ctx,
			center: [0.5 * size, 0.6 * size],
			points: [[0.2 * size, 0.6 * size], [0.4 * size, 0.3 * size], [0.8 * size, 0.6 * size]],
			lineColor: '#000',
			thickness: 0.03 * size,
			angles: [{
					fill: true,
					fillColor: "#CFC",
					lineWidth: 0.02 * size,
					labelFontSize: 0.25 * size,
					labelMeasure: false,
					labelRadius: 0.33 * size,
					radius: 0.2 * size
				}, {
					fill: true,
					fillColor: "#CCF",
					lineWidth: 0.02 * size,
					labelFontSize: 0.25 * size,
					labelMeasure: false,
					labelRadius: 0.33 * size,
					radius: 0.2 * size
				}
			]
		});
	}
};
draw.tick = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'tick',
			rect: [center[0]-25, center[1]-30, 50, 60],
			lineWidth: 10,
			lineColor: '#060'
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj) {
		drawTick(ctx, obj.rect[2], obj.rect[3], obj.lineColor, obj.rect[0], obj.rect[1], obj.lineWidth);
	},
	getRect: function (obj) {
		var rect = clone(obj.rect).concat([obj.rect[0] + obj.rect[2], obj.rect[1] + obj.rect[3]]);
		return rect;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		obj.rect[3] += dh;
	},
	getCursorPositionsUnselected: function (obj, pathNum) {
		return [{
				shape: 'rect',
				dims: obj.rect,
				cursor: draw.cursors.pointer,
				func: drawClickSelect,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			}
		];
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.lineColor = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.lineColor;
	},
	drawButton: function (ctx, size, type) {
		var rect = [(60 * size / 100) / 2, (52 * size / 100) / 2, 40 * size / 100, 48 * size / 100];
		draw.tick.draw(ctx, {
			type: 'tick',
			rect: rect,
			lineWidth: 8 * size / 100,
			lineColor: '#060'
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.rect[0] = center[0] + sf * (obj.rect[0] - center[0]);
			obj.rect[1] = center[1] + sf * (obj.rect[1] - center[1]);
		}
		obj.rect[2] *= sf;
		obj.rect[3] *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
}
draw.cross = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'cross',
			rect: [center[0]-25, center[1]-30, 50, 60],
			lineWidth: 10,
			lineColor: '#F00'
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj) {
		drawCross(ctx, obj.rect[2], obj.rect[3], obj.lineColor, obj.rect[0], obj.rect[1], obj.lineWidth);
	},
	getRect: function (obj) {
		var rect = clone(obj.rect).concat([obj.rect[0] + obj.rect[2], obj.rect[1] + obj.rect[3]]);
		return rect;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		obj.rect[3] += dh;
	},
	getCursorPositionsUnselected: function (obj, pathNum) {
		return [{
				shape: 'rect',
				dims: obj.rect,
				cursor: draw.cursors.pointer,
				func: drawClickSelect,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			}
		];
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.lineColor = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.lineColor;
	},
	drawButton: function (ctx, size, type) {
		var rect = [(60 * size / 100) / 2, (52 * size / 100) / 2, 40 * size / 100, 48 * size / 100];
		draw.cross.draw(ctx, {
			type: 'cross',
			rect: rect,
			lineWidth: 8 * size / 100,
			lineColor: '#F00'
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.rect[0] = center[0] + sf * (obj.rect[0] - center[0]);
			obj.rect[1] = center[1] + sf * (obj.rect[1] - center[1]);
		}
		obj.rect[2] *= sf;
		obj.rect[3] *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
};
draw.calc = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'calc',
			rect: [center[0]-25, center[1]-30, 50, 60],
			lineWidth: 10,
			lineColor: '#060'
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj) {
		drawCalcAllowedButton2(ctx, obj.rect[0], obj.rect[1], obj.rect[2], true, '#CFC');
	},
	getRect: function (obj) {
		var rect = clone(obj.rect).concat([obj.rect[0] + obj.rect[2], obj.rect[1] + obj.rect[3]]);
		return rect;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		obj.rect[3] = obj.rect[2];
	},
	getCursorPositionsUnselected: function (obj, pathNum) {
		return [{
				shape: 'rect',
				dims: obj.rect,
				cursor: draw.cursors.pointer,
				func: drawClickSelect,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			}
		];
	},
	drawButton: function (ctx, size, type) {
		var rect = [(40 * size / 100) / 2, (40 * size / 100) / 2, 60 * size / 100, 50 * size / 100];
		draw.calc.draw(ctx, {
			type: 'calc',
			rect: rect
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.rect[0] = center[0] + sf * (obj.rect[0] - center[0]);
			obj.rect[1] = center[1] + sf * (obj.rect[1] - center[1]);
		}
		obj.rect[2] *= sf;
		obj.rect[3] *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
}
draw.noncalc = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'noncalc',
			rect: [center[0]-25, center[1]-30, 50, 60],
			lineWidth: 10,
			lineColor: '#060'
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj) {
		drawCalcAllowedButton2(ctx, obj.rect[0], obj.rect[1], obj.rect[2], false, '#FCF');
	},
	getRect: function (obj) {
		var rect = clone(obj.rect).concat([obj.rect[0] + obj.rect[2], obj.rect[1] + obj.rect[3]]);
		return rect;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		obj.rect[3] = obj.rect[2];
	},
	getCursorPositionsUnselected: function (obj, pathNum) {
		return [{
				shape: 'rect',
				dims: obj.rect,
				cursor: draw.cursors.pointer,
				func: drawClickSelect,
				obj: obj,
				pathNum: pathNum,
				highlight: -1
			}
		];
	},
	drawButton: function (ctx, size, type) {
		var rect = [(40 * size / 100) / 2, (40 * size / 100) / 2, 60 * size / 100, 50 * size / 100];
		draw.noncalc.draw(ctx, {
			type: 'noncalc',
			rect: rect
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.rect[0] = center[0] + sf * (obj.rect[0] - center[0]);
			obj.rect[1] = center[1] + sf * (obj.rect[1] - center[1]);
		}
		obj.rect[2] *= sf;
		obj.rect[3] *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
}
draw.sphere = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'sphere',
			color: draw.color,
			thickness: draw.thickness,
			fillColor: draw.fillColor,
			center: center,
			radius: 50,
			showCenter: false
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj) {
		if (obj.radius <= 0)
			return;
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function')
			ctx.setLineDash = function () {};
		var startAngle = obj.hemisphere === true ? Math.PI : 0;
		ctx.beginPath();
		ctx.arc(obj.center[0], obj.center[1], obj.radius, startAngle, 2 * Math.PI);
		ctx.stroke();

		ctx.lineWidth = obj.thickness / 2;
		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.moveTo(obj.center[0] - obj.radius, obj.center[1]);
		ctx.ellipse(obj.center[0], obj.center[1], obj.radius, obj.radius * 0.3, 0, Math.PI, 2 * Math.PI);
		ctx.stroke();

		if (obj.hemisphere === true)
			ctx.lineWidth = obj.thickness;
		ctx.beginPath();
		ctx.setLineDash([]);
		ctx.ellipse(obj.center[0], obj.center[1], obj.radius, obj.radius * 0.3, 0, 0, Math.PI);
		ctx.stroke();
		ctx.restore();
	},
	getRect: function (obj) {
		if (obj.hemisphere === true) {
			var rect = [obj.center[0] - obj.radius, obj.center[1] - obj.radius, obj.radius * 2, obj.radius * 1.3];
		} else {
			var rect = [obj.center[0] - obj.radius, obj.center[1] - obj.radius, obj.radius * 2, obj.radius * 2];
		}
		return rect;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		if (dw !== 0 || dh !== 0) {
			var x = mouse.x - draw.drawRelPos[0];
			var y = mouse.y - draw.drawRelPos[1];
			obj.radius = Math.abs(Math.min(x - obj.center[0], y - obj.center[1]));
		}
	},
	getCursorPositionsUnselected: function (obj, pathNum) {
		if (obj.fillColor !== 'none') {
			return [{
					shape: 'circle',
					dims: [obj.center[0], obj.center[1], obj.radius],
					cursor: draw.cursors.pointer,
					func: drawClickSelect,
					pathNum: pathNum,
					highlight: -1
				}
			];
		} else {
			return [{
					shape: 'openCircle',
					dims: [obj.center[0], obj.center[1], obj.radius, draw.selectTolerance],
					cursor: draw.cursors.pointer,
					func: drawClickSelect,
					pathNum: pathNum,
					highlight: -1
				}
			];
		}
	},
	getSnapPos: function (obj) {},
	setLineWidth: function (obj, lineWidth) {
		obj.thickness = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.thickness;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},
	drawButton: function (ctx, size) {
		draw.sphere.draw(ctx, {
			center: [0.5 * size, 0.5 * size],
			radius: 0.3 * size,
			color: '#000',
			thickness: size * 0.02
		});
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
			obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		}
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.radius))
			obj.radius *= sf;
	}
};
draw.sphere2 = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'sphere2',
			color: draw.color,
			thickness: draw.thickness,
			fillColor: (!un(draw.fillColor) && draw.fillColor !== 'none') ? obj.fillColor : '#66F',
			center: center,
			radius: 150,
			opacity:0.6,
			tilt:0.2
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj) {
		if (obj.radius <= 0) return;
		ctx.save();

		var opacity = !un(obj.opacity) ? obj.opacity : 0.6;
		var surfaces = [{
			type:'curved',
			fill:{type:'radial',p1:[obj.center[0]+obj.radius*0.5,obj.center[1]-obj.radius*0.5],r1:0,p2:[obj.center[0],obj.center[1]],r2:obj.radius,colors:[[0,'#FFF'],[1,obj.fillColor]],opacity:opacity},
			edges:[{type:'arc',start:0,end:2*Math.PI}]
		}];
		if (obj.hemisphere === 'top') {
			surfaces = [
				{type:'flat',edges:[
					{type:'ellipse',radiusX:obj.radius,radiusY:obj.radius*obj.tilt,start:0*Math.PI,end:1*Math.PI},
					{type:'ellipse',radiusX:obj.radius,radiusY:obj.radius*obj.tilt,start:1*Math.PI,end:2*Math.PI,dash:[10,10],color:'#999',lineWidth:obj.thickness-1}
				]},
				{type:'curved',edges:[
					{type:'arc',start:Math.PI,end:2*Math.PI},
					{type:'ellipse',radiusX:obj.radius,radiusY:obj.radius*obj.tilt,start:2*Math.PI,end:1*Math.PI,line:false}
				],fill:{type:'radial',p1:[obj.center[0]+obj.radius*0.5,obj.center[1]-obj.radius*0.5],r1:0,p2:[obj.center[0],obj.center[1]],r2:obj.radius,colors:[[0,'#FFF'],[1,obj.fillColor]],opacity:opacity}}
			];
		} else if (obj.hemisphere === 'bottom') {
			surfaces = [
				{type:'curved',edges:[
					{type:'arc',start:0,end:Math.PI},
					{type:'ellipse',radiusX:obj.radius,radiusY:obj.radius*obj.tilt,start:Math.PI,end:2*Math.PI}
				],fill:{type:'radial',p1:[obj.center[0]+obj.radius*0.5,obj.center[1]-obj.radius*0.5],r1:0,p2:[obj.center[0],obj.center[1]],r2:obj.radius,colors:[[0,'#FFF'],[1,obj.fillColor]],opacity:opacity}},
				{type:'flat',edges:[
					{type:'ellipse',radiusX:obj.radius,radiusY:obj.radius*obj.tilt,start:0*Math.PI,end:2*Math.PI}
				],fill:{color:obj.fillColor,opacity:opacity}}
			];
		} else if (obj.hemisphere === 'left') {
			surfaces = [
				{type:'flat',edges:[
					{type:'ellipse',radiusX:obj.radius*obj.tilt,radiusY:obj.radius,start:1.5*Math.PI,end:0.5*Math.PI},
					{type:'ellipse',radiusX:obj.radius*obj.tilt,radiusY:obj.radius,start:0.5*Math.PI,end:1.5*Math.PI,dash:[10,10],color:'#999',lineWidth:obj.thickness-1}
				]},
				{type:'curved',edges:[
					{type:'arc',start:0.5*Math.PI,end:1.5*Math.PI},
					{type:'ellipse',radiusX:obj.radius*obj.tilt,radiusY:obj.radius,start:1.5*Math.PI,end:0.5*Math.PI,line:false}
				],fill:{type:'radial',p1:[obj.center[0]+obj.radius*0.5,obj.center[1]-obj.radius*0.5],r1:0,p2:[obj.center[0],obj.center[1]],r2:obj.radius,colors:[[0,'#FFF'],[1,obj.fillColor]],opacity:opacity}}
			];
		} else if (obj.hemisphere === 'right') {
			surfaces = [
				{type:'curved',edges:[
					{type:'arc',start:1.5*Math.PI,end:0.5*Math.PI},
					{type:'ellipse',radiusX:obj.radius*obj.tilt,radiusY:obj.radius,start:0.5*Math.PI,end:1.5*Math.PI,dir:true}
				],fill:{type:'radial',p1:[obj.center[0]+obj.radius*0.5,obj.center[1]-obj.radius*0.5],r1:0,p2:[obj.center[0],obj.center[1]],r2:obj.radius,colors:[[0,'#FFF'],[1,obj.fillColor]],opacity:opacity}},
				{type:'flat',edges:[
					{type:'ellipse',radiusX:obj.radius*obj.tilt,radiusY:obj.radius,start:0*Math.PI,end:2*Math.PI}
				],fill:{color:obj.fillColor,opacity:opacity}}
			];
		} else if (obj.hemisphere === 'left-top') {
			var angleOffset = 0.3*obj.tilt;
			surfaces = [
				{type:'flat',fill:{color:obj.fillColor,opacity:opacity},edges:[
					{type:'ellipse',radiusX:obj.radius*obj.tilt,radiusY:obj.radius,start:1.5*Math.PI,end:(0+angleOffset)*Math.PI},
					{type:'line',
						p1:[obj.center[0]+obj.radius*obj.tilt*Math.cos((0+angleOffset)*Math.PI),obj.center[1]+obj.radius*Math.sin((0+angleOffset)*Math.PI)],
						p2:[obj.center[0]+obj.radius*obj.tilt*Math.cos((1+angleOffset)*Math.PI),obj.center[1]+obj.radius*Math.sin((1+angleOffset)*Math.PI)]
					},
					{type:'ellipse',radiusX:obj.radius*obj.tilt,radiusY:obj.radius,start:(1+angleOffset)*Math.PI,end:1.5*Math.PI},
				]},
				{type:'flat',fill:{color:obj.fillColor,opacity:opacity},edges:[
					{type:'ellipse',radiusX:obj.radius,radiusY:obj.radius*obj.tilt,start:1*Math.PI,end:(1.5-angleOffset)*Math.PI},
					{type:'ellipse',radiusX:obj.radius,radiusY:obj.radius*obj.tilt,start:(0.5-angleOffset)*Math.PI,end:1*Math.PI}
				]},
				{type:'curved',edges:[
					{type:'arc',start:1.5*Math.PI,end:1*Math.PI,dir:false},
					{type:'ellipse',radiusX:obj.radius,radiusY:obj.radius*obj.tilt,start:1*Math.PI,end:(0.5-angleOffset)*Math.PI,dir:true},
					{type:'ellipse',radiusX:obj.radius*obj.tilt,radiusY:obj.radius,start:(0+angleOffset)*Math.PI,end:1.5*Math.PI,dir:true}
				],fill:{type:'radial',p1:[obj.center[0]+obj.radius*0.5,obj.center[1]-obj.radius*0.5],r1:0,p2:[obj.center[0],obj.center[1]],r2:obj.radius,colors:[[0,'#FFF'],[1,obj.fillColor]],opacity:opacity}}
			];
		} else if (obj.hemisphere === 'left-bottom') {
		
		} else if (obj.hemisphere === 'right-top') {
		
		} else if (obj.hemisphere === 'right-bottom') {
			
		}
		
		for (var s = 0; s < surfaces.length; s++) {
			var surface = surfaces[s];
			if (!un(surface.fill)) {
				var fill = surface.fill;
				ctx.beginPath();
				for (var e = 0; e < surface.edges.length; e++) {
					var edge = surface.edges[e];
					drawEdge(edge);
				}
				var opacity = !un(fill.opacity) ? fill.opacity : !un(obj.opacity) ? obj.opacity : 1;
				if (fill.type === 'radial') {
					var gradient = ctx.createRadialGradient(fill.p1[0],fill.p1[1],fill.r1,fill.p2[0],fill.p2[1],fill.r2);
					for (var c = 0; c < fill.colors.length; c++) {
						gradient.addColorStop(fill.colors[c][0], colorA(fill.colors[c][1],opacity));
					}
					ctx.fillStyle = gradient;
				} else if (typeof fill === 'object') {
					ctx.fillStyle = colorA(fill.color,opacity);
				} else if (typeof fill === 'string') {
					ctx.fillStyle = colorA(fill,opacity);
				}
				
				ctx.fill();
			}
			if (surface.line !== false & surface.stroke !== false) {
				ctx.lineJoin = 'round';
				ctx.lineCap = 'round';
				for (var e = 0; e < surface.edges.length; e++) {
					var edge = surface.edges[e];
					if (edge.line === false || edge.stroke === false) continue;	
					ctx.beginPath();
					drawEdge(edge);
					var opacity = !un(edge.opacity) ? edge.opacity : !un(obj.opacity) ? obj.opacity : 1;
					ctx.strokeStyle = !un(edge.color) ? colorA(edge.color,opacity) : colorA(obj.color,opacity);
					ctx.lineWidth = !un(edge.lineWidth) ? edge.lineWidth : obj.thickness;
					var dash = !un(edge.dash) ? edge.dash : !un(obj.dash) ? obj.dash : [];
					ctx.setLineDash(dash);
					ctx.stroke();
				}
			}
		}
		ctx.restore();
		
		function drawEdge(edge) {
			if (edge.type === 'arc') {
				var dir = !un(edge.dir) ? edge.dir : false;
				ctx.arc(obj.center[0], obj.center[1], obj.radius, edge.start, edge.end, dir);				
			} else if (edge.type === 'ellipse') {
				var dir = !un(edge.dir) ? edge.dir : false;
				ctx.ellipse(obj.center[0], obj.center[1], edge.radiusX, edge.radiusY, 0, edge.start, edge.end, dir);				
			} else if (edge.type === 'line') {
				ctx.moveTo(edge.p1[0],edge.p1[1]);
				ctx.lineTo(edge.p2[0],edge.p2[1]);
			}
		}
	},
	getRect: function (obj) {			
		var rect = [obj.center[0] - obj.radius, obj.center[1] - obj.radius, obj.radius * 2, obj.radius * 2];
		return rect;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		if (dw !== 0 || dh !== 0) {
			var x = mouse.x - draw.drawRelPos[0];
			var y = mouse.y - draw.drawRelPos[1];
			obj.radius = Math.abs(Math.min(x - obj.center[0], y - obj.center[1]));
		}
	},
	getCursorPositionsUnselected: function (obj, pathNum) {
		if (obj.fillColor !== 'none') {
			return [{
					shape: 'circle',
					dims: [obj.center[0], obj.center[1], obj.radius],
					cursor: draw.cursors.pointer,
					func: drawClickSelect,
					pathNum: pathNum,
					highlight: -1
				}
			];
		} else {
			return [{
					shape: 'openCircle',
					dims: [obj.center[0], obj.center[1], obj.radius, draw.selectTolerance],
					cursor: draw.cursors.pointer,
					func: drawClickSelect,
					pathNum: pathNum,
					highlight: -1
				}
			];
		}
	},
	getSnapPos: function (obj) {},
	setLineWidth: function (obj, lineWidth) {
		obj.thickness = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.thickness;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},

	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
			obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		}
		if (!un(obj.thickness))
			obj.thickness *= sf;
		if (!un(obj.radius))
			obj.radius *= sf;
	}
};
draw.ellipticalArc = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var obj = {
			type: 'ellipticalArc',
			color: draw.color,
			thickness: draw.thickness,
			fillColor: draw.fillColor,
			center: center,
			radiusX: 50,
			radiusY: 30,
			angle1: Math.PI,
			angle2: 2 * Math.PI,
			showLines: false,
			showCenter: false
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (obj.radius <= 0)
			return;
		ctx.save();
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;
		if (typeof ctx.setLineDash !== 'function')
			ctx.setLineDash = function () {};
		var dash = !un(obj.dash) ? obj.dash : [];
		ctx.setLineDash(dash);

		if (obj.fillColor !== 'none') {
			ctx.beginPath();
			ctx.moveTo(obj.center[0], obj.center[1]);
			ctx.lineTo(obj.center[0] + obj.radiusX * Math.cos(obj.angle1), obj.center[1] + obj.radiusY * Math.sin(obj.angle1));
			ctx.ellipse(obj.center[0], obj.center[1], obj.radiusX, obj.radiusY, 0, obj.angle1, obj.angle2);
			ctx.lineTo(obj.center[0], obj.center[1]);
			ctx.fillStyle = obj.fillColor;
			ctx.fill();
		}

		ctx.beginPath();
		if (obj.showLines == true) {
			ctx.moveTo(obj.center[0], obj.center[1]);
			ctx.lineTo(obj.center[0] + obj.radiusX * Math.cos(obj.angle1), obj.center[1] + obj.radiusY * Math.sin(obj.angle1));
		} else {
			ctx.moveTo(obj.center[0] + obj.radiusX * Math.cos(obj.angle1), obj.center[1] + obj.radiusY * Math.sin(obj.angle1));
		}
		ctx.ellipse(obj.center[0], obj.center[1], obj.radiusX, obj.radiusY, 0, obj.angle1, obj.angle2);
		if (obj.showLines == true) {
			ctx.lineTo(obj.center[0], obj.center[1]);
		}
		ctx.stroke();
		ctx.setLineDash([]);

		if (!un(path) && path.selected == true) {
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';
			ctx.fillStyle = '#F00';
			ctx.beginPath();
			ctx.arc(obj.center[0] + obj.radiusX * Math.cos(obj.angle1), obj.center[1] + obj.radiusY * Math.sin(obj.angle1), 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(obj.center[0] + obj.radiusX * Math.cos(obj.angle2), obj.center[1] + obj.radiusY * Math.sin(obj.angle2), 8, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		}

		ctx.restore();
	},
	getRect: function (obj) {
		return [obj.center[0] - obj.radiusX, obj.center[1] - obj.radiusY, obj.radiusX * 2, obj.radiusY * 2];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		obj.radiusX += dw;
		obj.radiusY += dh;
	},
	getCursorPositionsUnselected: function (obj, pathNum) {
		if (obj.fillColor !== 'none') {
			return [{
					shape: 'ellipse',
					dims: [obj.center[0], obj.center[1], obj.radiusX, obj.radiusY],
					cursor: draw.cursors.pointer,
					func: drawClickSelect,
					pathNum: pathNum,
					highlight: -1
				}
			];
		} else {
			return [{
					shape: 'ellipse',
					dims: [obj.center[0], obj.center[1], obj.radiusX, obj.radiusY, draw.selectTolerance],
					cursor: draw.cursors.pointer,
					func: drawClickSelect,
					pathNum: pathNum,
					highlight: -1
				}
			];
		}
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var a = [obj.center[0] + obj.radiusX * Math.cos(obj.angle1), obj.center[1] + obj.radiusY * Math.sin(obj.angle1), 8];
		var b = [obj.center[0] + obj.radiusX * Math.cos(obj.angle2), obj.center[1] + obj.radiusY * Math.sin(obj.angle2), 8];
		return [{
				shape: 'circle',
				dims: a,
				cursor: draw.cursors.pointer,
				func: draw.ellipticalArc.startDrag1,
				pathNum: pathNum,
				draw: true,
				color: '#F00'
			}, {
				shape: 'circle',
				dims: b,
				cursor: draw.cursors.pointer,
				func: draw.ellipticalArc.startDrag2,
				pathNum: pathNum,
				draw: true,
				color: '#F00'
			}
		];
	},
	startDrag1: function (e) {
		changeDrawMode('ellipticalArcDrag1');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.ellipticalArc.posMove,draw.ellipticalArc.posStop,drawCanvasPaths);		
		//addListenerMove(window, draw.ellipticalArc.posMove);
		//addListenerEnd(window, draw.ellipticalArc.posStop);
	},
	startDrag2: function (e) {
		changeDrawMode('ellipticalArcDrag2');
		draw.currPathNum = draw.currCursor.pathNum;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.ellipticalArc.posMove,draw.ellipticalArc.posStop,drawCanvasPaths);		
		//addListenerMove(window, draw.ellipticalArc.posMove);
		//addListenerEnd(window, draw.ellipticalArc.posStop);
	},
	posMove: function (e) {
		updateMouse(e);
		var pos = draw.mouse;
		var pathNum = draw.currPathNum;
		if (snapToObj2On || draw.snapLinesTogether)
			pos = snapToObj2(pos, pathNum);
		var obj = draw.path[pathNum].obj[0];
		var angle = getAngleTwoPoints(obj.center, pos);
		if (shiftOn == true || ctrlOn == true) {
			var tol = 0.3;
			if (Math.abs(angle) < tol)
				angle = 0;
			if (Math.abs(Math.PI / 2 - angle) < tol)
				angle = Math.PI / 2;
			if (Math.abs(Math.PI - angle) < tol)
				angle = Math.PI;
			if (Math.abs(Math.PI * (3 / 2) - angle) < tol)
				angle = Math.PI * (3 / 2);
			if (Math.abs(Math.PI * 2 - angle) < tol)
				angle = Math.PI * 2;
		}
		if (draw.drawMode == 'ellipticalArcDrag1') {
			obj.angle1 = angle;
		} else if (draw.drawMode == 'ellipticalArcDrag2') {
			obj.angle2 = angle;
		}
		//drawSelectedPaths();
		//drawSelectCanvas();
	},
	posStop: function (e) {
		//removeListenerMove(window, draw.ellipticalArc.posMove);
		//removeListenerEnd(window, draw.ellipticalArc.posStop);
		changeDrawMode();
	},
	getSnapPos: function (obj) {},
	setLineWidth: function (obj, lineWidth) {
		obj.thickness = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	setLineDash: function (obj, dash) {
		obj.dash = dash;
	},
	getLineWidth: function (obj) {
		return obj.thickness;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},
	getLineDash: function (obj) {
		return !un(obj.dash) ? obj.dash : [0, 0];
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		return [{
				buttonType: 'angle-showLines',
				shape: 'rect',
				dims: [x2 - 20, y2 - 40, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.ellipticalArc.toggleLines,
				pathNum: pathNum
			}
		];
	},
	toggleLines: function (e) {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		obj.showLines = !obj.showLines;
		drawSelectedPaths();
	},
	drawButton: function (ctx, size, type) {
		var obj = {
			type: 'ellipticalArc',
			color: '#000',
			thickness: size * (2 / 55),
			fillColor: 'none',
			center: [size / 2, size / 3],
			radiusX: size / 3,
			radiusY: size / 4,
			angle1: 0,
			angle2: Math.PI,
			showLines: false,
			showCenter: false
		}
		draw.ellipticalArc.draw(ctx, obj);
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		if (!un(obj.radiusX))
			obj.radiusX *= sf;
		if (!un(obj.radiusY))
			obj.radiusY *= sf;
		if (!un(obj.thickness))
			obj.thickness *= sf;
	}
};
draw.boxPlot = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'boxPlot',
			left: center[0]-200,
			top: center[1]-50,
			width: 400,
			height: 100,
			min: 0,
			max: 80,
			lineWidth: 4,
			color: '#000',
			fillColor: 'none',
			chartData: [10, 25, 40, 48, 65]
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		console.log(sel());
	},
	draw: function (ctx, obj, path) {
		ctx.save();
		ctx.strokeStyle = obj.color || '#000';
		ctx.lineWidth = obj.lineWidth || 4;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		if (typeof ctx.setLineDash == 'undefined')
			ctx.setLineDash = function () {};
		ctx.setLineDash([]);

		var xPos = [];
		for (var i = 0; i < obj.chartData.length; i++)
			xPos[i] = getPosOfCoordX2(obj.chartData[i], obj.left, obj.width, obj.min, obj.max);
		var yPos = [obj.top, obj.top + 0.25 * obj.height, obj.top + 0.5 * obj.height, obj.top + 0.75 * obj.height, obj.top + obj.height];

		//* fill
		if (obj.fillColor !== 'none') {
			ctx.fillStyle = obj.fillColor;
			ctx.fillRect(xPos[1], yPos[0], xPos[3] - xPos[1], yPos[4] - yPos[0]);
		};
		//*/

		ctx.beginPath();

		ctx.moveTo(xPos[0], yPos[2]);
		ctx.lineTo(xPos[1], yPos[2]);

		ctx.moveTo(xPos[1], yPos[0]);
		ctx.lineTo(xPos[3], yPos[0]);

		ctx.moveTo(xPos[1], yPos[4]);
		ctx.lineTo(xPos[3], yPos[4]);

		ctx.moveTo(xPos[3], yPos[2]);
		ctx.lineTo(xPos[4], yPos[2]);

		// vertLines
		ctx.moveTo(xPos[0], yPos[1]);
		ctx.lineTo(xPos[0], yPos[3]);

		ctx.moveTo(xPos[1], yPos[0]);
		ctx.lineTo(xPos[1], yPos[4]);

		ctx.moveTo(xPos[3], yPos[0]);
		ctx.lineTo(xPos[3], yPos[4]);

		ctx.moveTo(xPos[4], yPos[1]);
		ctx.lineTo(xPos[4], yPos[3]);

		ctx.stroke();

		ctx.setLineDash([8, 5]);
		ctx.lineWidth = 0.6 * ctx.lineWidth;
		ctx.beginPath();
		ctx.moveTo(xPos[2], yPos[0]);
		ctx.lineTo(xPos[2], yPos[4]);
		ctx.stroke();

		ctx.restore();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, obj.width, obj.height];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		obj.width += dw;
		obj.height += dh;
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		obj.width *= sf;
		obj.height *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
};

draw.slider = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'slider',
			left: center[0]-100,
			top: center[1]-25,
			width: 200,
			radius: 15,
			value: 0,
			lineWidth: 4,
			color: '#000',
			fillColor: '#00F',
			interact: {
				onchange: function (obj) {}
			}
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		if (obj.showSlider !== false) {
			if (obj.pos instanceof Array) {
				var x1 = obj.pos[0][0];
				var y1 = obj.pos[0][1];
				var x2 = obj.pos[1][0];
				var y2 = obj.pos[1][1];
				obj._pos = [x1 + obj.value * (x2 - x1), y1 + obj.value * (y2 - y1), obj.radius];
			} else if (obj.vertical === true) {
				var x1 = obj.left + obj.radius;
				var x2 = obj.left + obj.radius;
				var y1 = obj.top + obj.radius;
				var y2 = obj.top + obj.width - obj.radius;
				var y3 = y2 - obj.value * (y2 - y1);
				obj._pos = [x1, y3, obj.radius];
			} else {
				var x1 = obj.left + obj.radius;
				var x2 = obj.left + obj.width - obj.radius;
				var y1 = obj.top + obj.radius;
				var y2 = obj.top + obj.radius;
				var x3 = x1 + obj.value * (x2 - x1);
				obj._pos = [x3, y1, obj.radius];
			}

			ctx.beginPath();
			ctx.strokeStyle = obj.color || '#000';
			ctx.lineWidth = obj.lineWidth || 4;
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			if (typeof ctx.setLineDash == 'undefined') ctx.setLineDash = function () {};
			ctx.setLineDash([]);
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();

			ctx.beginPath();
			ctx.fillStyle = obj.fillColor;
			ctx.arc(obj._pos[0], obj._pos[1], obj.radius, 0, 2 * Math.PI);
			ctx.fill();
		}
		if (draw.mode === 'edit' && obj.pos instanceof Array) {
			ctx.strokeStyle = '#000';
			ctx.fillStyle = '#F00';
			ctx.lineWidth = 1;
			
			ctx.beginPath();
			ctx.arc(obj.pos[0][0], obj.pos[0][1], 10, 0, 2 * Math.PI);
			ctx.fill();
			
			ctx.beginPath();
			ctx.arc(obj.pos[1][0], obj.pos[1][1], 10, 0, 2 * Math.PI);
			ctx.fill();
		}
		if (typeof obj.control === 'object') {
			var pos = obj.control.pos || [obj.left-60,obj.top+obj.radius];
			var state = obj.control.state || 'paused';
			var color = obj.control.color || '#CFF';
			ctx.save();
			ctx.translate(pos[0]-25,pos[1]-25);
			if (obj.control.box !== false) roundedRect2(ctx, 0, 0, 50, 50, 10, 3, '#000', color);
			ctx.fillStyle = '#000';
			if (state === 'paused') {
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';
				ctx.beginPath();
				if (obj.control.reversible === true && obj.value === 1) {
					ctx.moveTo(34, 14);
					ctx.lineTo(16, 25);
					ctx.lineTo(34, 36);
					ctx.lineTo(34, 14);
				} else {
					ctx.moveTo(16, 14);
					ctx.lineTo(34, 25);
					ctx.lineTo(16, 36);
					ctx.lineTo(16, 14);
				}
				ctx.fill();
			} else if (state === 'playing') {
				ctx.fillRect(14,12,8,26);
				ctx.fillRect(28,12,8,26);
			}
			ctx.restore();
		}
	},
	getCursorPositionsSelected: function(obj,path,p) {
		var pos = [];
		pos.push({shape:'circle',dims:obj._pos,cursor:draw.cursors.move1,func:draw.slider.dragStart,interact:true,path:path,obj:obj});
		
		if (obj.pos instanceof Array) {
			pos.push({shape:'circle',dims:[obj.pos[0][0], obj.pos[0][1], 20],cursor:draw.cursors.pointer,func:draw.slider.posStart,path:path,obj:obj,posIndex:0});
			pos.push({shape:'circle',dims:[obj.pos[1][0], obj.pos[1][1], 20],cursor:draw.cursors.pointer,func:draw.slider.posStart,path:path,obj:obj,posIndex:1});
		}
		
		if (typeof obj.control === 'object') {
			var controlPos = obj.control.pos || [obj.left-60,obj.top+obj.radius];
			var controlRect = [controlPos[0]-25,controlPos[1]-25,50,50];
			pos.push({shape:'rect',dims:controlRect,cursor:draw.cursors.move1,func:draw.slider.controlMoveStart,interact:true,path:path,obj:obj});
		}
		
		return pos;
	},
	getCursorPositionsInteract: function(obj,path,p) {
		if (!un(obj.interact) && obj.interact.disabled === true) return [];
		var pos = [];
		if (obj.showSlider !== false) {
			pos.push({shape:'circle',dims:obj._pos,cursor:draw.cursors.move1,func:draw.slider.dragStart,interact:true,path:path,obj:obj});
		}
		if (typeof obj.control === 'object') {
			var controlPos = obj.control.pos || [obj.left-60,obj.top+obj.radius];
			var controlRect = [controlPos[0]-25,controlPos[1]-25,50,50];
			pos.push({shape:'rect',dims:controlRect,cursor:draw.cursors.pointer,func:draw.slider.controlClick,interact:true,path:path,obj:obj});
		}
		
		return pos;
	},
	controlClick: function() {
		var obj = draw.currCursor.obj;
		var state = obj.control.state || 'paused';
		if (state === 'paused') {
			var rate = obj.control.rate || 0.1;
			if (obj.control.reversible === true && obj.value === 1) {
				draw.slider.animationStart(obj,-1*rate,drawCanvasPaths);
			} else {
				if (obj.value > 0.95) obj.value = 0;
				draw.slider.animationStart(obj,rate,drawCanvasPaths);
			}
		} else if (state === 'playing') {
			if (!un(obj._animation)) obj._animation.stop = true;
			obj.control.state = 'paused';
		}
	},
	controlMoveStart: function() {
		draw._drag = draw.currCursor;
		var obj = draw._drag.obj;
		var controlPos = obj.control.pos || [obj.left-60,obj.top+obj.radius];
		draw._drag.offset = [draw.mouse[0]-controlPos[0],draw.mouse[1]-controlPos[1]];
		draw.animate(draw.slider.controlMoveMove,draw.slider.controlMoveStop,drawSelectedPaths);
	},
	controlMoveMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var pos = [draw.mouse[0]-draw._drag.offset[0],draw.mouse[1]-draw._drag.offset[1]];
		if (Math.abs(obj.top+obj.radius - pos[1]) < 20) pos[1] = obj.top+obj.radius;
		obj.control.pos = pos;
	},
	controlMoveStop: function(e) {
		delete draw._drag;
	},
	drawButton: function (ctx, size) {
		draw.slider.draw(ctx, {
			type: 'slider',
			left: 0.15 * size,
			top: 0.4 * size,
			width: 0.8 * size,
			radius: 0.1 * size,
			value: 0,
			lineWidth: 0.02 * size,
			color: '#000',
			fillColor: '#00F'
		});
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'slider-function',
			shape: 'rect',
			dims: [x1 + 20, y2 - 20, 80, 20],
			cursor: draw.cursors.pointer,
			func: draw.slider.editChangeFunction,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				var obj = path.obj[0];
				ctx.fillStyle = colorA('#F99', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					rect: [l, t, w, h],
					align: [0, 0],
					text: ['onchange'],
					fontSize: 14
				});
			}
		});
		buttons.push({
			buttonType: 'slider-setValue',
			shape: 'rect',
			dims: [x2 - 60, y2 - 20, 40, 20],
			cursor: draw.cursors.pointer,
			func: draw.slider.setValue,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				var obj = path.obj[0];
				ctx.fillStyle = colorA('#9FF', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					rect: [l, t, w, h],
					align: [0, 0],
					text: [String(roundToNearest(obj.value, 0.01))],
					fontSize: 14
				});
			}
		});
		buttons.push({
			buttonType: 'slider-control',
			shape: 'rect',
			dims: [x1 + 100, y2 - 20, 80, 20],
			cursor: draw.cursors.pointer,
			func: draw.slider.toggleControl,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				var obj = path.obj[0];
				ctx.fillStyle = colorA('#CCF', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					rect: [l, t, w, h],
					align: [0, 0],
					text: ['Control'],
					fontSize: 14
				});
			}
		});
		return buttons;
	},
	setValue: function (obj) {
		if (un(obj)) obj = draw.path[draw.currCursor.pathNum].obj[0];
		obj.value = prompt('Value:', obj.value);
		if (isNaN(Number(obj.value))) obj.value = 0;
		obj.value = Math.min(1, Math.max(0, obj.value));
		drawCanvasPaths();
	},
	toggleControl: function(obj) {
		if (un(obj)) obj = draw.path[draw.currCursor.pathNum].obj[0];
		if (!un(obj.control)) {
			delete obj.control;
		} else {
			obj.control = {};
		}
		drawCanvasPaths();
	},
	editChangeFunction: function (obj) {
		if (un(obj)) {
			var path = draw.path[draw.currCursor.pathNum];
			var obj = path.obj[0];
		}
		if (un(obj.interact))
			obj.interact = {};
		if (un(obj.interact.onchange))
			obj.interact.onchange = function (obj) {};
		draw.codeEditor.open(obj.interact, 'onchange');
	},
	getRect: function (obj) {
		if (obj.pos instanceof Array) {
			return [
				Math.min(obj.pos[0][0], obj.pos[1][0]),
				Math.min(obj.pos[0][1], obj.pos[1][1]),
				Math.abs(obj.pos[0][0] - obj.pos[1][0]),
				Math.abs(obj.pos[0][1] - obj.pos[1][1])
			];
		} else if (obj.vertical === true) {
			return [obj.left, obj.top, obj.radius * 2, obj.width];
		} else {
			return [obj.left, obj.top, obj.width, obj.radius * 2];
		}
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		if (obj.pos instanceof Array) {
			obj.pos[0][0] += dl;
			obj.pos[0][1] += dt;
			obj.pos[1][0] += dl;
			obj.pos[1][1] += dt;
		} else {
			obj.left += dl;
			obj.top += dt;
			if (obj.vertical === true) {
				obj.width += dh;
			} else {
				obj.width += dw;
			}
		}
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		obj.width *= sf;
		obj.radius *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	},
	dragStart: function (e) {
		//console.log(draw.currCursor);
		changeDrawMode('slider-drag');
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw._drag = draw.currCursor;
		//addListenerMove(window, draw.slider.dragMove);
		//addListenerEnd(window, draw.slider.dragStop);
		draw.animate(draw.slider.dragMove,draw.slider.dragStop,drawCanvasPaths);
		/*var obj = draw._drag.obj;
		if (!un(obj.interact) && !un(obj.interact.objs)) {
			obj._path._interacting = true;
			for (var i = 0; i < obj.interact.objs.length; i++) {
				o(obj.interact.objs[i])._path._interacting = true;
			}
		}*/
	},
	dragMove: function (e) {
		updateMouse(e);
		var x = draw.mouse[0];
		var y = draw.mouse[1];
		var obj = draw._drag.obj;
		if (obj.pos instanceof Array) {
			var v = [obj.pos[1][0] - obj.pos[0][0], obj.pos[1][1] - obj.pos[0][1]];
			obj.value = Math.max(0, Math.min(1, ((x - obj.pos[0][0]) * v[0] + (y - obj.pos[0][1]) * v[1]) / (Math.pow(v[0], 2) + Math.pow(v[1], 2))));
		} else if (obj.vertical === true) {
			obj.value = Math.max(0, Math.min(1, ((obj.top + obj.width - obj.radius) - y) / (obj.width - obj.radius * 2)));
		} else {
			obj.value = Math.max(0, Math.min(1, (x - (obj.left + obj.radius)) / (obj.width - obj.radius * 2)));
		}
		if (!un(obj.interact) && !un(obj.interact.onchange)) obj.interact.onchange(obj);
		/*if (!un(obj.interact) && !un(obj.interact.objs)) {
			drawSelectedPaths();
		} else {
			drawCanvasPaths();
		}*/
	},
	dragStop: function (e) {
		changeDrawMode();
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		//removeListenerMove(window, draw.slider.dragMove);
		//removeListenerEnd(window, draw.slider.dragStop);
		/*var obj = draw._drag.obj;
		if (!un(obj.interact) && !un(obj.interact.objs)) {
			delete obj._path.interacting;
			for (var i = 0; i < obj.interact.objs.length; i++) {
				delete o(obj.interact.objs[i])._path._interacting;
			}
		}
		drawCanvasPaths();*/
		var obj = draw._drag.obj;
		if (!un(obj.interact) && !un(obj.interact.ondragend)) {
			obj.interact.ondragend(obj);
			if (!un(obj.interact) && !un(obj.interact.onchange)) obj.interact.onchange(obj);
		}
		delete draw._drag;
	},
	
	posStart: function (e) {
		draw._drag = draw.currCursor;
		if (draw._drag.obj.pos instanceof Array === false) return;
		draw.animate(draw.slider.posMove,draw.slider.posStop,drawCanvasPaths);
	},
	posMove: function (e) {
		updateMouse(e);
		var x = draw.mouse[0];
		var y = draw.mouse[1];
		var obj = draw._drag.obj;
		obj.pos[draw._drag.posIndex] = [x,y];
		console.log(obj);
	},
	posStop: function (e) {
		delete draw._drag;
	},
	
	/*animationStart: function(obj,rate,drawFunction) {
		var d = new Date();
		draw._sliderAnimation = {
			obj:obj,
			start:d.getTime(),
			rate:rate || 0.1,
			initial:obj.value,
			drawFunction:drawFunction || drawCanvasPaths,
		};
		if (!un(obj.control)) obj.control.state = 'playing';
		drawCanvasPaths();
		draw._sliderAnimation.frameID = window.requestAnimationFrame(draw.slider.animationFrame);
	},
	animationFrame: function() {
		var d = new Date();
		var time = d.getTime() - draw._sliderAnimation.start;
		time = time/1000;
		draw._sliderAnimation.obj.value = Math.min(1,Math.max(0,draw._sliderAnimation.initial+time*draw._sliderAnimation.rate));
		if (!un(draw._sliderAnimation.obj.interact) && !un(draw._sliderAnimation.obj.interact.onchange)) {
			draw._sliderAnimation.obj.interact.onchange(draw._sliderAnimation.obj);
		}
		
		if (draw._sliderAnimation.stop === true || draw._sliderAnimation.obj.value === 1) {
			draw.slider.animationStop();
		} else {
			draw._sliderAnimation.drawFunction();
			draw._sliderAnimation.frameID = window.requestAnimationFrame(draw.slider.animationFrame);
		}
	},
	animationStop: function() {
		if (!un(draw._sliderAnimation)) {
			window.cancelAnimationFrame(draw._sliderAnimation.frameID);
			var obj = draw._sliderAnimation.obj;
			if (!un(obj.control)) obj.control.state = 'paused';
			if (!un(draw._sliderAnimation.obj.interact) && !un(draw._sliderAnimation.obj.interact.onchange)) {
				draw._sliderAnimation.obj.interact.onchange(draw._sliderAnimation.obj);
			}
			drawCanvasPaths();
			delete draw._sliderAnimation;
		}
	}*/
	
	animationStart: function(obj,rate,drawFunction) {
		var d = new Date();
		if (un(draw._sliderAnimations)) draw._sliderAnimations = [];
		obj._animation = {
			obj:obj,
			start:d.getTime(),
			rate:typeof rate === 'number' ? rate : 0.1,
			initial:obj.value,
			drawFunction:drawFunction || drawCanvasPaths,
			endless:!un(obj.control) && obj.control.endless === true ? true : false
		};
		draw._sliderAnimations.push(obj._animation);
		if (!un(obj.control)) obj.control.state = 'playing';
		drawCanvasPaths();
		draw.slider._frameID = window.requestAnimationFrame(draw.slider.animationFrame);
	},
	animationFrame: function() {
		var d = new Date();
		var drawFunction;
		for (var a = 0; a < draw._sliderAnimations.length; a++) {
			var animation = draw._sliderAnimations[a];
			var obj = animation.obj;
			var time = (d.getTime() - animation.start) / 1000;
			animation.obj.value = Math.min(1, Math.max(0, animation.initial + time * animation.rate));
			if (!un(obj.interact) && !un(obj.interact.onchange)) {
				obj.interact.onchange(obj);
			}
			if (animation.stop === true || (animation.endless !== true && ((animation.rate > 0 && obj.value === 1) || (animation.rate < 0 && obj.value === 0)))) {
				obj.control.state = 'paused';
				delete obj._animation;
				draw._sliderAnimations.splice(a,1);
				a--;
			} else if (animation.endless === true && (animation.rate > 0 && obj.value === 1) || (animation.rate < 0 && obj.value === 0)) {
				animation.start = new Date().getTime();
				animation.initial = obj.value;
				animation.rate *= -1;
			}
			if (un(animation.drawFunction) || animation.drawFunction === drawCanvasPaths) {
				drawFunction = drawCanvasPaths;
			} else if (animation.drawFunction !== drawCanvasPaths) {
				drawFunction = animation.drawFunction;
			}
		}
		if (draw._sliderAnimations.length === 0) {
			drawCanvasPaths();
			delete draw.slider._frameID;
		} else {
			drawFunction();
			draw.slider._frameID = window.requestAnimationFrame(draw.slider.animationFrame);
		}
	},
	animationStop: function() {
		draw.slider.stopAllAnimations();
	},
	stopAllAnimations:function() {
		if (!un(draw.slider._frameID)) window.cancelAnimationFrame(draw.slider._frameID);
		delete draw.slider._frameID;
		if (un(draw._sliderAnimations)) return;
		for (var a = 0; a < draw._sliderAnimations.length; a++) {
			var animation = draw._sliderAnimations[a];
			animation.obj.control.state = 'paused';
			delete animation.obj._animation;
		}
		draw._sliderAnimations = [];
	}
};
draw.toggle = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'toggle',
			left: center[0]-70,
			top: center[1]-20,
			width: 140,
			height: 40,
			value: false,
			text: 'toggle',
			onchange: function (obj) {}
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		console.log(sel());
	},
	draw: function (ctx, obj, path) {
		text({
			ctx: ctx,
			align: [-1, 0],
			rect: [obj.left, obj.top, obj.width, obj.height],
			text: [obj.text],
			fontSize: !un(obj.buttonFontSize) ? obj.buttonFontSize : 20,
			box: {
				type: 'loose',
				color: '#FFF',
				borderColor: '#000',
				borderWidth: 2,
				radius: 5
			}
		});
		
		ctx.beginPath();
		ctx.fillStyle = obj.value == true ? '#6F6' : '#F66';
		var r = obj.left + obj.width;
		var m = obj.top + obj.height / 2;
		ctx.fillRect(r-35,m-13,15,26);
		ctx.moveTo(r - 35, m - 13);
		ctx.lineTo(r - 20, m - 13);
		ctx.arc(r - 20, m, 13, 1.5 * Math.PI, 0.5 * Math.PI);
		ctx.lineTo(r - 35, m + 13);
		ctx.arc(r - 35, m, 13, 0.5 * Math.PI, 1.5 * Math.PI);
		ctx.lineTo(r - 35, m - 13);
		ctx.fill();
		
		ctx.beginPath();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		var r = obj.left + obj.width;
		var m = obj.top + obj.height / 2;
		ctx.moveTo(r - 35, m - 13);
		ctx.lineTo(r - 20, m - 13);
		ctx.arc(r - 20, m, 13, 1.5 * Math.PI, 0.5 * Math.PI);
		ctx.lineTo(r - 35, m + 13);
		ctx.arc(r - 35, m, 13, 0.5 * Math.PI, 1.5 * Math.PI);
		ctx.stroke();

		ctx.beginPath();
		ctx.fillStyle = '#000';
		if (obj.value == false) {
			ctx.arc(r - 35, m, 9, 0, 2 * Math.PI);
		} else {
			ctx.arc(r - 20, m, 9, 0, 2 * Math.PI);
		}
		ctx.fill();
		ctx.stroke();
	},
	drawButton: function (ctx, size) {
		var l = size * 0.15;
		var t = size * 0.4;
		var w = size * 0.7;
		var h = size * 0.2;
		var c = size * 0.5;
		var m = size * 0.5;
		var rad = size * 0.1;

		ctx.beginPath();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = size * 0.02;
		ctx.fillStyle = '#6F6';
		ctx.moveTo(c - rad, m - rad * 1.5);
		ctx.lineTo(c + rad, m - rad * 1.5);
		ctx.arc(c + rad, m, rad * 1.5, 1.5 * Math.PI, 0.5 * Math.PI);
		ctx.lineTo(c - rad, m + rad * 1.5);
		ctx.arc(c - rad, m, rad * 1.5, 0.5 * Math.PI, 1.5 * Math.PI);
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.fillStyle = '#000';
		ctx.arc(c + rad * 0.75, m, rad, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [{
				shape: 'rect',
				dims: [obj.left, obj.top, obj.width - 35, obj.height],
				cursor: draw.cursors.pointer,
				func: draw.toggle.setText,
				pathNum: pathNum
			}
		];
		return pos;
	},
	getCursorPositionsInteract: function (obj, path, pathNum) {
		var pos = [];
		pos.push({
			buttonType: 'toggle-toggle',
			shape: 'rect',
			dims: [obj.left, obj.top, obj.width, obj.height],
			cursor: draw.cursors.pointer,
			func: draw.toggle.toggle,
			pathNum: pathNum,
			obj: obj
		});
		return pos;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'toggle-function',
			shape: 'rect',
			dims: [x1 + 20, y2 - 20, 80, 20],
			cursor: draw.cursors.pointer,
			func: draw.toggle.editChangeFunction,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				var obj = path.obj[0];
				ctx.fillStyle = colorA('#F99', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					rect: [l, t, w, h],
					align: [0, 0],
					text: ['onchange'],
					fontSize: 14
				});
			}
		});
		buttons.push({
			buttonType: 'toggle-toggle',
			shape: 'rect',
			dims: [x2 - 60, y2 - 20, 40, 20],
			cursor: draw.cursors.pointer,
			func: draw.toggle.toggle,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				var obj = path.obj[0];
				ctx.fillStyle = colorA('#9FF', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					rect: [l, t, w, h],
					align: [0, 0],
					text: [String(obj.value)],
					fontSize: 14
				});
			}
		});
		return buttons;
	},
	editChangeFunction: function (obj) {
		if (un(obj)) {
			var path = draw.path[draw.currCursor.pathNum];
			var obj = path.obj[0];
		}
		if (un(obj.onchange))
			obj.onchange = function (obj) {};
		draw.codeEditor.open(obj, 'onchange');
	},
	getRect: function (obj) {
		return [obj.left, obj.top, obj.width, obj.height];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		obj.width += dw;
	},
	setText: function (obj) {
		if (un(obj))
			obj = draw.path[draw.currCursor.pathNum].obj[0];
		obj.text = prompt('Text for toggle object:', obj.text);
		if (typeof obj.text !== 'string')
			obj.text = '';
		drawCanvasPaths();
	},
	toggle: function (obj) {
		if (un(obj))
			obj = draw.currCursor.obj;
		obj.value = !obj.value;
		if (typeof obj.onchange == 'function') {
			obj.onchange(obj);
		} else if (!un(obj.interact) && typeof obj.interact.onchange == 'function') {
			obj.interact.onchange(obj);
		}
		drawCanvasPaths();
	}

}
draw.toggleButton = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'toggleButton',
			rect:[center[0]-450/2,center[1]-30,450,60],
			options:[['mode 1'],['mode 2'],['mode 3']],
			value: 0,
			lineWidth:2,
			radius:30,
			fontSize:28,
			color:'#00F', // background color is replaceAll(obj.color,'0','C');
			onchange: function (obj) {}
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function(ctx, obj, path) {
		obj._cursorPos = [];
		var x = obj.rect[0];
		var t = obj.rect[1];
		var w = obj.rect[2]/obj.options.length;
		var h = obj.rect[3];
		var r = !un(obj.radius) ? Math.min(obj.radius,h/2) : 0;
		var selectedColor = obj.colors instanceof Array && typeof obj.colors[obj.value] === 'string' ? obj.colors[obj.value] : obj.color || '#00F';
		
		for (var i = 0; i < obj.options.length; i++) {
			if ((obj.value instanceof Array && obj.value[i] === true) || obj.value === i) {
				ctx.fillStyle = replaceAll(selectedColor,'0','C');
			} else {
				ctx.fillStyle = '#FFF';
			}
			ctx.beginPath();
			if (i === 0 && r > 0) {
				ctx.moveTo(x+r,t);
				ctx.lineTo(x+w,t);
				ctx.lineTo(x+w,t+h);
				ctx.lineTo(x+r,t+h);
				ctx.arc(x+r,t+h-r,r,Math.PI/2,Math.PI);
				ctx.lineTo(x,t+r);
				ctx.arc(x+r,t+r,r,Math.PI,3*Math.PI/2);
				ctx.fill();
			} else if (i === obj.options.length-1 && r > 0) {
				ctx.moveTo(x,t);
				ctx.lineTo(x+w-r,t);
				ctx.arc(x+w-r,t+r,r,3*Math.PI/2,2*Math.PI);
				ctx.lineTo(x+w,t+h-r);
				ctx.arc(x+w-r,t+h-r,r,0*Math.PI,Math.PI/2);
				ctx.lineTo(x,t+h);
				ctx.lineTo(x,t);
				ctx.fill();
			} else {
				ctx.fillRect(x,t,w,h);
			}
			obj._cursorPos.push({
				shape: 'rect',
				dims: [x,t,w,h],
				cursor: draw.cursors.pointer,
				func: draw.toggleButton.click,
				obj: obj,
				value:i,
				pathNum: un(path) ? -1 : draw.path.indexOf(path)
			});

			/*if (draw.mode === 'edit') {
				if (un(obj._optionText)) obj._optionText = [];
				if (un(obj._optionText[i])) {
					obj._optionText[i] = {
						type:'editableText',
						text:obj.options[i],
						align:[0,0],
						color:color,
						fontSize:obj.fontSize
					}
				}
				obj._optionText[i].deselectOnInputStart = false;
				obj._optionText[i].deselectOnInputEnd = false;
				obj._optionText[i]._obj = obj;
				var xm = 0.2*w;
				var ym = 0.2*h;
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x+xm,t+ym,w-2*xm,h-2*ym],
					cursor: draw.cursors.text,
					func: textEdit.selectStart,
					obj: obj._optionText[i],
					value:i,
					pathNum: draw.path.indexOf(path)
				});				
			}*/
			x += w;
		}
		x = obj.rect[0];
		
		ctx.lineWidth = obj.lineWidth;
		for (var i = 0; i < obj.options.length; i++) {
			if ((obj.value instanceof Array && obj.value[i] === true) || obj.value === i) {
				ctx.strokeStyle = selectedColor;
				var color = selectedColor;
			} else {
				ctx.strokeStyle = '#666';
				var color = '#666';
				ctx.beginPath();
				if (i === 0 && r > 0) {	
					ctx.moveTo(x+r,t);
					ctx.lineTo(x+w,t);
					ctx.lineTo(x+w,t+h);
					ctx.lineTo(x+r,t+h);
					ctx.arc(x+r,t+h-r,r,Math.PI/2,Math.PI);
					ctx.lineTo(x,t+r);
					ctx.arc(x+r,t+r,r,Math.PI,3*Math.PI/2);
					ctx.stroke();
				} else if (i === obj.options.length-1 && r > 0) {
					ctx.moveTo(x,t);
					ctx.lineTo(x+w-r,t);
					ctx.arc(x+w-r,t+r,r,3*Math.PI/2,2*Math.PI);
					ctx.lineTo(x+w,t+h-r);
					ctx.arc(x+w-r,t+h-r,r,0*Math.PI,Math.PI/2);
					ctx.lineTo(x,t+h);
					ctx.lineTo(x,t);
					ctx.stroke();
				} else {
					ctx.strokeRect(x,t,w,h);
				}
			}
			text({ctx:ctx,text:obj.options[i],align:[0,0],fontSize:obj.fontSize,rect:[x,t,w,h],color:color});
			x += w;
		}
		
		x = obj.rect[0] + obj.value*w;
		ctx.strokeStyle = selectedColor;
		ctx.beginPath();
		if (obj.value === 0 && r > 0) {	
			ctx.moveTo(x+r,t);
			ctx.lineTo(x+w,t);
			ctx.lineTo(x+w,t+h);
			ctx.lineTo(x+r,t+h);
			ctx.arc(x+r,t+h-r,r,Math.PI/2,Math.PI);
			ctx.lineTo(x,t+r);
			ctx.arc(x+r,t+r,r,Math.PI,3*Math.PI/2);
			ctx.stroke();
		} else if (obj.value === obj.options.length-1 && r > 0) {
			ctx.moveTo(x,t);
			ctx.lineTo(x+w-r,t);
			ctx.arc(x+w-r,t+r,r,3*Math.PI/2,2*Math.PI);
			ctx.lineTo(x+w,t+h-r);
			ctx.arc(x+w-r,t+h-r,r,0*Math.PI,Math.PI/2);
			ctx.lineTo(x,t+h);
			ctx.lineTo(x,t);
			ctx.stroke();
		} else if (obj.value > 0 && obj.value < obj.options.length-1) {
			ctx.strokeRect(x,t,w,h);
		}
		
	},
	getRect: function (obj) {
		return clone(obj.rect);
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		obj.rect[3] += dh;
	},
	click: function() {
		var obj = draw.currCursor.obj;
		var value = draw.currCursor.value;
		if (obj.allowMultipleValues === true) {
			if (obj.value instanceof Array === false) {
				var prevValue = obj.value;
				obj.value = [];
				for (var i = 0; i < obj.options.length; i++) obj.value[i] = prevValue === i ? true : false;
			}
			obj.value[value] = obj.value[value] === true ? false : true;
		} else if (obj.value === value) {
			if (obj.allowNoValue === true) {
				obj.value = -1;
			} else {
				return;
			}
		} else {
			obj.value = value;
		}
		if (typeof obj.onchange === 'function') obj.onchange(obj);
		drawCanvasPaths();
	}
}

draw.feedback = {
	draw: function (ctx, obj, path) {
		if (draw.mode == 'interact') {
			if (!un(obj._feedback)) {
				var fb = typeof obj._feedback == 'string' ? [obj._feedback] : clone(obj._feedback);
				var color = obj._color || '#F00';
				fb.unshift('<<font:Hobo>><<color:' + color + '>><<fontSize:36>>');
				text({
					ctx: ctx,
					rect: obj.rect,
					align: [0, 0],
					text: fb
				});
			}
		} else {
			text({
				ctx: ctx,
				rect: obj.rect,
				align: [0, 0],
				text: ['<<font:Hobo>><<color:#060>><<fontSize:36>>Feedback will appear here'],
				box: {
					color: 'none',
					borderColor: '#666',
					borderWidth: 1,
					radius: 10
				}
			});
		}
	},
	getRect: function (obj) {
		return obj.rect;
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.rect[0] = center[0] + sf * (obj.rect[0] - center[0]);
			obj.rect[1] = center[1] + sf * (obj.rect[1] - center[1]);
		}
		obj.rect[2] *= sf;
		obj.rect[3] *= sf;
	}
}

draw.probabilityTree = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();		
		var obj = {
			type: 'probabilityTree',
			left: center[0]-950/2,
			top: center[1]-200,
			widths: [250, 100, 250, 100, 250],
			height: 400,
			lineWidth: 4,
			color: '#000',
			branches: [2, 2],
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		console.log(sel());
	},
	draw: function (ctx, obj, path) {
		var left = obj.left;
		var top = obj.top;
		var widths = obj.widths;
		var width = arraySum(obj.widths);
		var height = obj.height;
		var branches = obj.branches;

		ctx.lineWidth = obj.lineWidth;
		ctx.strokeStyle = obj.color;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		//first branches
		var startX = left;
		var finX = startX + widths[0];
		var startY = top + 0.5 * height;
		for (var i = 0; i < obj.branches[0]; i++) {
			if (obj.branches[0] == 2) {
				var finY = top + ((2 * i + 1) / 4) * height;
			} else if (obj.branches[0] == 3) {
				var finY = top + ((2 * i + 1) / 6) * height;
			}
			ctx.beginPath();
			ctx.moveTo(startX, startY);
			ctx.lineTo(finX, finY);
			ctx.stroke();

			// second branches
			var startX2 = left + widths[0] + widths[1];
			var finX2 = startX2 + widths[2];
			var startY2 = finY;
			var h = height / obj.branches[0];
			var t = top + h * i;
			for (var j = 0; j < obj.branches[1]; j++) {
				if (obj.branches[1] == 2) {
					var finY2 = t + ((2 * j + 1) / 4) * h;
				} else if (obj.branches[1] == 3) {
					var finY2 = t + ((2 * j + 1) / 6) * h;
				}
				ctx.beginPath();
				ctx.moveTo(startX2, startY2);
				ctx.lineTo(finX2, finY2);
				ctx.stroke();

				if (typeof obj.branches[2] !== 'number')
					continue;
				// third branches
				var startX3 = left + widths[0] + widths[1] + widths[2] + widths[3];
				var finX3 = startX3 + widths[4];
				var startY3 = finY2;
				var h2 = h / obj.branches[1];
				var t2 = t + h2 * j;
				for (var k = 0; k < obj.branches[2]; k++) {
					if (obj.branches[2] == 2) {
						var finY3 = t2 + ((2 * k + 1) / 4) * h2;
					} else if (obj.branches[2] == 3) {
						var finY3 = t2 + ((2 * k + 1) / 6) * h2;
					}
					ctx.beginPath();
					ctx.moveTo(startX3, startY3);
					ctx.lineTo(finX3, finY3);
					ctx.stroke();
				}
			}
		}
	},
	drawButton: function (ctx, size, type) {
		draw.probabilityTree.draw(ctx, {
			type: 'probabilityTree',
			left: 0.1 * size,
			top: size * 0.2,
			widths: [0.35 * size, 0.1 * size, 0.35 * size],
			height: size * 0.6,
			lineWidth: 1,
			color: '#000',
			branches: [2, 2],
		});
	},
	getRect: function (obj) {
		var width = obj.widths[0] + obj.widths[1] + obj.widths[2];
		if (typeof obj.branches[2] == 'number')
			width += obj.widths[3] + obj.widths[4];
		return [obj.left, obj.top, width, obj.height];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		obj.height += dh;
		var totalWidth = obj.widths[0] + obj.widths[1] + obj.widths[2];
		var max = 3;
		if (typeof obj.branches[2] == 'number') {
			totalWidth += obj.widths[3] + obj.widths[4];
			max = 5;
		}
		for (var w = 0; w < max; w++) {
			obj.widths[w] += dw * (obj.widths[w] / totalWidth);
		}
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		if (un(draw.path[pathNum]) || un(draw.path[pathNum].obj)) return buttons;
		var obj = draw.path[pathNum].obj[0];

		var left = obj.left;
		buttons.push({
			buttonType: 'probabilityTree-branches',
			shape: 'rect',
			dims: [left + obj.widths[0] / 2 - 10, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.probabilityTree.changeBranches,
			pathNum: pathNum,
			index: 0,
			obj: obj,
			value: obj.branches[0],
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#FF0', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					rect: [l, t, w, h],
					align: [0, 0],
					text: ['<<fontSize:12>>' + this.value]
				});
			}
		});

		left += obj.widths[0] + obj.widths[1];
		buttons.push({
			buttonType: 'probabilityTree-branches',
			shape: 'rect',
			dims: [left + obj.widths[2] / 2 - 10, y2 - 20, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.probabilityTree.changeBranches,
			pathNum: pathNum,
			index: 1,
			obj: obj,
			value: obj.branches[1],
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = colorA('#FF0', 0.5);
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					rect: [l, t, w, h],
					align: [0, 0],
					text: ['<<fontSize:12>>' + this.value]
				});
			}
		});

		if (typeof obj.branches[2] == 'number') {
			left += obj.widths[2] + obj.widths[3];
			buttons.push({
				buttonType: 'probabilityTree-branches',
				shape: 'rect',
				dims: [left + obj.widths[4] / 2 - 10, y2 - 20, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.probabilityTree.changeBranches,
				pathNum: pathNum,
				index: 2,
				obj: obj,
				value: obj.branches[2],
				draw: function (path, ctx, l, t, w, h) {
					ctx.fillStyle = colorA('#FF0', 0.5);
					ctx.fillRect(l, t, w, h);
					text({
						ctx: ctx,
						rect: [l, t, w, h],
						align: [0, 0],
						text: ['<<fontSize:12>>' + this.value]
					});
				}
			});
			buttons.push({
				buttonType: 'probabilityTree-removeBranch',
				shape: 'rect',
				dims: [x2 - 20, (y1 + y2) / 2 - 10, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.probabilityTree.removeBranch,
				pathNum: pathNum,
				obj: obj,
				draw: function (path, ctx, l, t, w, h) {
					ctx.fillStyle = colorA('#F99', 0.5);
					ctx.fillRect(l, t, w, h);
					text({
						ctx: ctx,
						rect: [l, t, w, h],
						align: [0, 0],
						text: ['<<fontSize:12>>-']
					});
				}
			});
		} else {
			buttons.push({
				buttonType: 'probabilityTree-addBranch',
				shape: 'rect',
				dims: [x2 - 20, (y1 + y2) / 2 - 10, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.probabilityTree.addBranch,
				pathNum: pathNum,
				obj: obj,
				draw: function (path, ctx, l, t, w, h) {
					ctx.fillStyle = colorA('#9F9', 0.5);
					ctx.fillRect(l, t, w, h);
					text({
						ctx: ctx,
						rect: [l, t, w, h],
						align: [0, 0],
						text: ['<<fontSize:12>>+']
					});
				}
			});
		}

		return buttons;
	},
	changeBranches: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.currCursor.obj;
		var index = draw.currCursor.index;
		obj.branches[index] = obj.branches[index] == 2 ? 3 : 2;
		drawCanvasPaths();
		updateBorder(draw.path[pathNum]);
		calcCursorPositions();
		drawSelectCanvas();
	},
	addBranch: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.currCursor.obj;
		obj.branches[2] = 2;
		drawCanvasPaths();
		updateBorder(draw.path[pathNum]);
		calcCursorPositions();
		drawSelectCanvas();
	},
	removeBranch: function () {
		var pathNum = draw.currCursor.pathNum;
		var obj = draw.currCursor.obj;
		delete obj.branches[2];
		drawCanvasPaths();
		updateBorder(draw.path[pathNum]);
		calcCursorPositions();
		drawSelectCanvas();
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		var x = obj.left;
		var max = typeof obj.branches[2] == 'number' ? 5 : 3;
		for (var i = 0; i < max; i++) {
			x += obj.widths[i];
			pos.push({
				shape: 'rect',
				dims: [x - 10, obj.top, 20, obj.height],
				cursor: draw.cursors.ew,
				func: draw.probabilityTree.horizResizeStart,
				index: i,
				pathNum: pathNum
			});
		}
		return pos;
	},
	horizResizeStart: function () {
		changeDrawMode('probabilityTreeHorizResize');
		draw.currPathNum = draw.currCursor.pathNum;
		draw.currIndex = draw.currCursor.index;
		updateSnapPoints(); // update intersection points
		draw.animate(draw.probabilityTree.horizResizeMove,draw.probabilityTree.horizResizeStop,drawCanvasPaths);				
		//addListenerMove(window, draw.probabilityTree.horizResizeMove);
		//addListenerEnd(window, draw.probabilityTree.horizResizeStop);
		draw.cursorCanvas.style.cursor = draw.cursors.ew;
	},
	horizResizeMove: function (e) {
		updateMouse(e);
		var pos = draw.mouse[0];
		var pathNum = draw.currPathNum;
		var index = draw.currIndex;
		var obj = draw.path[pathNum].obj[0];
		var left = obj.left;
		for (var i = 0; i < index; i++)
			left += obj.widths[i];
		obj.widths[index] = pos - left;
		//drawSelectedPaths();
	},
	horizResizeStop: function (e) {
		//removeListenerMove(window, draw.probabilityTree.horizResizeMove);
		//removeListenerEnd(window, draw.probabilityTree.horizResizeStop);
		changeDrawMode();
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		for (var w = 0; w < obj.widths.length; w++)
			obj.widths[w] *= sf;
		obj.height *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
};
draw.vennDiagram3 = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'vennDiagram3',
			left: center[0]-300,
			top: center[1]-300,
			width: 600,
			lineWidth: 4,
			color: '#000',
			fillColor: '#3FF',
			shade: [false, false, false, false, false, false, false, false]
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		console.log(sel());
	},
	calc: function(obj) {
		var l = obj.left;
		var t = obj.top;
		var w = obj.width;
		var h = !un(obj.height) ? obj.height : obj.width;
		var radiusFactor = !un(obj.radiusFactor) ? obj.radiusFactor : 0.27;
		var radius = h * radiusFactor;
		var centerA = obj.centerA || [l + w * 0.5 + 0.6 * radius * Math.cos(Math.PI * (1 / 2 + 2 / 3)), t + h * 0.47 + 0.6 * radius * Math.sin(Math.PI * (1 / 2 + 2 / 3))];
		var centerB = obj.centerB || [l + w * 0.5 + 0.6 * radius * Math.cos(Math.PI * (1 / 2 + 4 / 3)), t + h * 0.47 + 0.6 * radius * Math.sin(Math.PI * (1 / 2 + 4 / 3))];
		var centerC = obj.centerC || [l + w * 0.5 + 0.6 * radius * Math.cos(Math.PI * (1 / 2)), t + h * 0.47 + 0.6 * radius * Math.sin(Math.PI * (1 / 2))];
		obj._rect = [l,t,w,h];
		obj._radius = radius;
		obj._centerA = centerA;
		obj._centerB = centerB;
		obj._centerC = centerC;
	},
	draw: function (ctx, obj, path) {
		draw.vennDiagram3.calc(obj);
		var l = obj._rect[0];
		var t = obj._rect[1];
		var w = obj._rect[2];
		var h = obj._rect[3];
		var radius = obj._radius;
		var centerA = obj._centerA;
		var centerB = obj._centerB;
		var centerC = obj._centerC;

		var lineWidth = obj.lineWidth;
		var strokeStyle = obj.color;
		var colorA = obj.colorA || strokeStyle;
		var colorB = obj.colorB || strokeStyle;
		var colorC = obj.colorC || strokeStyle;
		var labelA = obj.labelA || ['<<fontSize:' + (w / 10) + '>>A'];
		var labelB = obj.labelB || ['<<fontSize:' + (w / 10) + '>>B'];
		var labelC = obj.labelC || ['<<fontSize:' + (w / 10) + '>>C'];

		var x1 = centerA[0];
		var y1 = centerA[1];
		var x2 = centerB[0];
		var y2 = centerB[1];
		var x3 = centerC[0];
		var y3 = centerC[1];
		var r = radius;
		ctx.fillStyle = obj.fillColor;
		if (obj.shade[7] == true) {
			ctx.fillRect(l, t, w, h);
			ctx.fillStyle = mainCanvasFillStyle;
			ctx.beginPath();
			ctx.arc(x1, y1, r, 0, 2 * Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(x2, y2, r, 0, 2 * Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(x3, y3, r, 0, 2 * Math.PI);
			ctx.fill();
			ctx.fillStyle = obj.fillColor;
		}
		var angle = Math.acos((x2 - x1) / (2 * r));

		var abint = circleIntersections(x1, y1, r, x2, y2, r);
		var acint = circleIntersections(x1, y1, r, x3, y3, r);
		var bcint = circleIntersections(x2, y2, r, x3, y3, r);

		var aa = [getAngleFromAToB([x1, y1], abint[1]), getAngleFromAToB([x1, y1], acint[1]), getAngleFromAToB([x1, y1], abint[0]), getAngleFromAToB([x1, y1], acint[0])];
		var bb = [getAngleFromAToB([x2, y2], bcint[1]), getAngleFromAToB([x2, y2], abint[0]), getAngleFromAToB([x2, y2], bcint[0]), getAngleFromAToB([x2, y2], abint[1])];
		var cc = [getAngleFromAToB([x3, y3], acint[0]), getAngleFromAToB([x3, y3], bcint[0]), getAngleFromAToB([x3, y3], acint[1]), getAngleFromAToB([x3, y3], bcint[1])];

		if (obj.shade[0] == true) {
			ctx.beginPath();
			ctx.moveTo(x3,y3);
			ctx.arc(x3, y3, r, cc[1], cc[2]);
			ctx.arc(x1, y1, r, aa[1], aa[2]);
			ctx.arc(x2, y2, r, bb[1], bb[2]);
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(abint[0][0],abint[0][1]);
			ctx.lineTo(acint[1][0],acint[1][1]);
			ctx.lineTo(bcint[0][0],bcint[0][1]);
			ctx.lineTo(abint[0][0],abint[0][1]);
			ctx.fill();
		}
		if (obj.shade[1] == true) {
			ctx.beginPath();
			ctx.moveTo(x1,y3);
			ctx.arc(x1, y1, r, aa[0], aa[1]);
			ctx.arc(x3, y3, r, cc[2], cc[1], true);
			ctx.arc(x2, y2, r, bb[2], bb[3]);
			ctx.fill();
		}
		if (obj.shade[2] == true) {
			ctx.beginPath();
			ctx.moveTo(x1,y1);
			ctx.arc(x1, y1, r, aa[2], aa[3]);
			ctx.arc(x3, y3, r, cc[0], cc[1]);
			ctx.arc(x2, y2, r, bb[2], bb[1], true);
			ctx.fill();
		}
		if (obj.shade[3] == true) {
			ctx.beginPath();
			ctx.moveTo(x1,y1);
			ctx.arc(x1, y1, r, aa[3], aa[0]);
			ctx.arc(x2, y2, r, bb[3], bb[2], true);
			ctx.arc(x3, y3, r, cc[1], cc[0], true);
			ctx.fill();
		}
		if (obj.shade[4] == true) {
			ctx.beginPath();
			ctx.moveTo(x1,y1);
			ctx.arc(x1, y1, r, aa[2], aa[1], true);
			ctx.arc(x3, y3, r, cc[2], cc[3]);
			ctx.arc(x2, y2, r, bb[0], bb[1]);
			ctx.fill();
		}
		if (obj.shade[5] == true) {
			ctx.beginPath();
			ctx.moveTo(x2,y2);
			ctx.arc(x2, y2, r, bb[3], bb[0]);
			ctx.lineTo(x3+r*Math.cos(cc[3]),y3+r*Math.sin(cc[3]));
			ctx.arc(x3, y3, r, cc[3], cc[2], true);
			ctx.lineTo(x1+r*Math.cos(aa[1]),y1+r*Math.sin(aa[1]));
			ctx.arc(x1, y1, r, aa[1], aa[0], true);
			ctx.fill();
		}
		if (obj.shade[6] == true) {
			ctx.beginPath();
			ctx.moveTo(x3,y3);
			ctx.arc(x3, y3, r, cc[3], cc[0]);
			ctx.lineTo(x1+r*Math.cos(aa[3]),y1+r*Math.sin(aa[3]));
			ctx.arc(x1, y1, r, aa[3], aa[2], true);
			ctx.lineTo(x2+r*Math.cos(bb[1]),y2+r*Math.sin(bb[1]));
			ctx.arc(x2, y2, r, bb[1], bb[0], true);
			ctx.fill();
		}

		if (typeof ctx.setLineDash == 'undefined')
			ctx.setLineDash = function () {};
		ctx.setLineDash([]);
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = lineWidth;
		ctx.strokeRect(l, t, w, h);

		ctx.beginPath();
		ctx.strokeStyle = colorA;
		ctx.arc(centerA[0], centerA[1], radius, 0, 2 * Math.PI);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = colorB;
		ctx.arc(centerB[0], centerB[1], radius, 0, 2 * Math.PI);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = colorC;
		ctx.arc(centerC[0], centerC[1], radius, 0, 2 * Math.PI);
		ctx.stroke();
		
		if (draw.mode === 'edit' && !un(path) && path.selected === true && !un(obj.interact) && !un(obj.interact.answerPositions)) {
			for (var p = 0; p < obj.interact.answerPositions.length; p++) {
				var pos = obj.interact.answerPositions[p];
				ctx.beginPath();
				ctx.fillStyle = '#F00';
				ctx.arc(l+pos[0]*w, t+pos[1]*h, 5, 0, 2 * Math.PI);
				ctx.fill();
			}
		}

		/*var xy = [centerA[0]-(radius*1.25)*Math.cos(Math.PI/4),centerA[1]-(radius*1.25)*Math.cos(Math.PI/4)];
		text({ctx:ctx,textArray:labelA,left:xy[0]-100,width:200,top:xy[1]-100,height:200,textAlign:'center',vertAlign:'middle',padding:0.1,});

		var xy = [centerB[0]+(radius*1.25)*Math.cos(Math.PI/4),centerB[1]-(radius*1.25)*Math.cos(Math.PI/4)];
		text({ctx:ctx,textArray:labelB,left:xy[0]-100,width:200,top:xy[1]-100,height:200,textAlign:'center',vertAlign:'middle',padding:0.1,});

		var xy = [centerC[0]+(radius*1.25)*Math.cos(Math.PI/4),centerC[1]+(radius*1.25)*Math.cos(Math.PI/4)];
		text({ctx:ctx,textArray:labelC,left:xy[0]-100,width:200,top:xy[1]-100,height:200,textAlign:'center',vertAlign:'middle',padding:0.1,});
		 */
	},
	drawButton: function (ctx, size, type) {
		draw.vennDiagram3.draw(ctx, {
			type: 'vennDiagram3',
			left: 0.1 * size,
			top: size * 0.1,
			width: 0.8 * size,
			lineWidth: 1,
			color: '#000',
			fillColor: '#3FF',
			shade: [false, false, true, false, false, true, false, false]
		});
	},
	getRect: function (obj) {
		return [obj.left, obj.top, obj.width, !un(obj.height) ? obj.height : obj.width];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		obj.width += dw;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		var path = draw.path[pathNum];
		if (!un(path) && path.obj.length === 1) {
			var obj = path.obj[0];
			if (!un(obj.interact)) {
				buttons.push({
					shape: 'rect',
					dims: [(x1+x2)/2 - 200, y1, 200, 20],
					cursor: draw.cursors.pointer,
					func: draw.vennDiagram3.setMatches,
					pathNum: pathNum,
					obj:obj,
					draw: function (path, ctx, l, t, w, h) {
						ctx.fillStyle = colorA('#FF0', 0.5);
						ctx.fillRect(l, t, w, h);
						var obj = path.obj[0];
						text({
							ctx: ctx,
							rect: [l, t, w, h],
							align: [0, 0],
							fontSize: 12,
							text: !un(obj.interact.matches) ? ['Matches: '+obj.interact.matches.join(',')] : ['Matches: ?']
						});
					}
				});
				buttons.push({
					shape: 'rect',
					dims: [(x1+x2)/2, y1, 200, 20],
					cursor: draw.cursors.pointer,
					func: draw.vennDiagram3.setAnswerPositions,
					pathNum: pathNum,
					obj:obj,
					draw: function (path, ctx, l, t, w, h) {
						ctx.fillStyle = colorA('#F90', 0.5);
						ctx.fillRect(l, t, w, h);
						var obj = path.obj[0];
						var count = un(obj.interact.answerPositions) ? 0 : obj.interact.answerPositions.length;
						text({
							ctx: ctx,
							rect: [l, t, w, h],
							align: [0, 0],
							fontSize: 12,
							text: ['Set Answer Positions ('+count+')']
						});
					}
				});
			}
		}
		return buttons;
	},
	setMatches: function () {
		var obj = draw.currCursor.obj;
		var current = !un(obj.interact.matches) ? obj.interact.matches.join(',') : '';
		var matches = prompt('Set Venn diagram matches (eg. "prime,even,square")',current);
		if (typeof matches !== 'string' || matches.indexOf(',') === -1) return;
		obj.interact.matches = matches.split(',');
		drawCanvasPaths();
	},
	setAnswerPositions: function() {
		var obj = draw.currCursor.obj;
		var path = obj._path;
		var rect = path.tightBorder;
		obj.interact.answerPositions = [];
		var w = obj.width;
		var h = !un(obj.height) ? obj.height : obj.width;
		for (var p = 0; p < draw.path.length; p++) {
			var path2 = draw.path[p];
			if (path2 === path || un(path2.interact) || path2.interact.type !== 'drag' || isPointInRect(path2._center,rect[0],rect[1],rect[2],rect[3]) === false) continue;
			obj.interact.answerPositions.push([roundToNearest((path2._center[0]-rect[0])/w,0.001),roundToNearest((path2._center[1]-rect[1])/h,0.001)]);
		}
		if (obj.interact.answerPositions.length === 0) {
			alert('To set answer positions for the Venn diagram, position draggable objects in the venn diagram and click again.');
		}
		drawCanvasPaths();
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		return [{
				shape: 'rect',
				dims: draw.vennDiagram3.getRect(obj),
				cursor: draw.cursors.pointer,
				func: draw.vennDiagram3.clickToggleShade,
				obj: obj
			}
		];
	},
	getCursorPositionsInteract: function (obj) {
		var pos = [];
		if (!un(obj.interact) && obj.interact.type === 'venn') {
			pos.push({
				shape: 'rect',
				dims: draw.vennDiagram3.getRect(obj),
				cursor: draw.cursors.pointer,
				func: draw.vennDiagram3.clickToggleShade,
				obj: obj
			});
		}
		return pos;
	},
	clickToggleShade: function (e) {
		var pos = draw.mouse;
		var obj = draw.currCursor.obj;
		var inA = dist(pos[0], pos[1], obj._centerA[0], obj._centerA[1]) < obj._radius ? true : false;
		var inB = dist(pos[0], pos[1], obj._centerB[0], obj._centerB[1]) < obj._radius ? true : false;
		var inC = dist(pos[0], pos[1], obj._centerC[0], obj._centerC[1]) < obj._radius ? true : false;
		if (inA && inB && inC) {
			obj.shade[0] = !obj.shade[0];
		} else if (inA && inB && !inC) {
			obj.shade[1] = !obj.shade[1];
		} else if (inA && !inB && inC) {
			obj.shade[2] = !obj.shade[2];
		} else if (inA && !inB && !inC) {
			obj.shade[3] = !obj.shade[3];
		} else if (!inA && inB && inC) {
			obj.shade[4] = !obj.shade[4];
		} else if (!inA && inB && !inC) {
			obj.shade[5] = !obj.shade[5];
		} else if (!inA && !inB && inC) {
			obj.shade[6] = !obj.shade[6];
		} else if (!inA && !inB && !inC) {
			obj.shade[7] = !obj.shade[7];
		}
		drawCanvasPaths();
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		obj.width *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
};
draw.vennDiagram2 = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'vennDiagram2',
			left: center[0]-300,
			top: center[1]-300*0.65,
			width: 600,
			lineWidth: 4,
			color: '#000',
			fillColor: '#3FF',
			shade: [false, false, false, false]
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		console.log(sel());
	},
	calc: function(obj) {
		var l = obj.left;
		var t = obj.top;
		var w = obj.width;
		var h = w * 0.65;
		var radius = w * 0.24;
		var centerA = obj.centerA || [l + w * 0.35, t + h / 2];
		var centerB = obj.centerB || [l + w * 0.65, t + h / 2];
		
		obj._rect = [l,t,w,h];
		obj._radius = radius;
		obj._centerA = centerA;
		obj._centerB = centerB;
	},
	draw: function (ctx, obj, path) {
		draw.vennDiagram2.calc(obj);	
		var l = obj._rect[0];
		var t = obj._rect[1];
		var w = obj._rect[2];
		var h = obj._rect[3];
		var radius = obj._radius;
		var centerA = obj._centerA;
		var centerB = obj._centerB;

		var lineWidth = obj.lineWidth;
		var strokeStyle = obj.color;
		var colorA = obj.colorA || strokeStyle;
		var colorB = obj.colorB || strokeStyle;
		var labelA = obj.labelA || ['<<fontSize:' + (w / 12) + '>>A'];
		var labelB = obj.labelB || ['<<fontSize:' + (w / 12) + '>>B'];
		var fillStyle = obj.fillColor;

		var x1 = centerA[0];
		var y1 = centerA[1];
		var x2 = centerB[0];
		var y2 = centerB[1];
		var r = radius;
		ctx.fillStyle = obj.fillColor;
		if (obj.shade[3] == true) {
			ctx.fillRect(l, t, w, h);
			ctx.fillStyle = mainCanvasFillStyle;
			ctx.beginPath();
			ctx.arc(x1, y1, r, 0, 2 * Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(x2, y2, r, 0, 2 * Math.PI);
			ctx.fill();
			ctx.fillStyle = obj.fillColor;
		}
		var angle = Math.acos((x2 - x1) / (2 * r));

		if (obj.shade[0] == true) {
			ctx.beginPath();
			ctx.arc(x1, y1, r, -angle, angle);
			ctx.arc(x2, y2, r, Math.PI - angle, Math.PI + angle);
			ctx.fill();
		}
		if (obj.shade[1] == true) {
			ctx.beginPath();
			ctx.arc(x1, y1, r, angle, 2 * Math.PI - angle);
			ctx.arc(x2, y2, r, Math.PI + angle, Math.PI - angle, true);
			ctx.fill();
		}
		if (obj.shade[2] == true) {
			ctx.beginPath();
			ctx.arc(x1, y1, r, angle, -angle, true);
			ctx.arc(x2, y2, r, Math.PI + angle, Math.PI - angle);
			ctx.fill();
		}

		if (typeof ctx.setLineDash == 'undefined')
			ctx.setLineDash = function () {};
		ctx.setLineDash([]);
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = lineWidth;
		ctx.strokeRect(l, t, w, h);

		ctx.beginPath();
		ctx.strokeStyle = colorA;
		ctx.arc(centerA[0], centerA[1], radius, 0, 2 * Math.PI);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = colorB;
		ctx.arc(centerB[0], centerB[1], radius, 0, 2 * Math.PI);
		ctx.stroke();

		if (draw.mode === 'edit' && !un(path) && path.selected === true && !un(obj.interact) && !un(obj.interact.answerPositions)) {
			for (var p = 0; p < obj.interact.answerPositions.length; p++) {
				var pos = obj.interact.answerPositions[p];
				ctx.beginPath();
				ctx.fillStyle = '#F00';
				ctx.arc(l+pos[0]*w, t+pos[1]*h, 5, 0, 2 * Math.PI);
				ctx.fill();
			}
		}

		/*
		var xy = [centerA[0]-(radius*1.25)*Math.cos(Math.PI/4),centerA[1]-(radius*1.25)*Math.cos(Math.PI/4)];
		text({ctx:ctx,textArray:labelA,left:xy[0]-100,width:200,top:xy[1]-100,height:200,textAlign:'center',vertAlign:'middle',padding:0.1});

		var xy = [centerB[0]+(radius*1.25)*Math.cos(Math.PI/4),centerB[1]-(radius*1.25)*Math.cos(Math.PI/4)];
		text({ctx:ctx,textArray:labelB,left:xy[0]-100,width:200,top:xy[1]-100,height:200,textAlign:'center',vertAlign:'middle',padding:0.1});
		 */
	},
	drawButton: function (ctx, size, type) {
		draw.vennDiagram2.draw(ctx, {
			type: 'vennDiagram2',
			left: 0.1 * size,
			top: size * 0.2,
			width: 0.8 * size,
			lineWidth: 1,
			color: '#000',
			fillColor: '#3FF',
			shade: [true, false, true, false]
		});
	},
	getRect: function (obj) {
		return [obj.left, obj.top, obj.width, obj.width * 0.65];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		obj.width += dw;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		var path = draw.path[pathNum];
		if (!un(path) && path.obj.length === 1) {
			var obj = path.obj[0];
			if (!un(obj.interact)) {
				buttons.push({
					shape: 'rect',
					dims: [(x1+x2)/2 - 200, y1, 200, 20],
					cursor: draw.cursors.pointer,
					func: draw.vennDiagram2.setMatches,
					pathNum: pathNum,
					obj:obj,
					draw: function (path, ctx, l, t, w, h) {
						ctx.fillStyle = colorA('#FF0', 0.5);
						ctx.fillRect(l, t, w, h);
						var obj = path.obj[0];
						text({
							ctx: ctx,
							rect: [l, t, w, h],
							align: [0, 0],
							fontSize: 12,
							text: !un(obj.interact.matches) ? ['Matches: '+obj.interact.matches.join(',')] : ['Matches: ?']
						});
					}
				});
				buttons.push({
					shape: 'rect',
					dims: [(x1+x2)/2, y1, 200, 20],
					cursor: draw.cursors.pointer,
					func: draw.vennDiagram2.setAnswerPositions,
					pathNum: pathNum,
					obj:obj,
					draw: function (path, ctx, l, t, w, h) {
						ctx.fillStyle = colorA('#F90', 0.5);
						ctx.fillRect(l, t, w, h);
						var obj = path.obj[0];
						var count = un(obj.interact.answerPositions) ? 0 : obj.interact.answerPositions.length;
						text({
							ctx: ctx,
							rect: [l, t, w, h],
							align: [0, 0],
							fontSize: 12,
							text: ['Set Answer Positions ('+count+')']
						});
					}
				});
			}
		}
		return buttons;
	},
	setMatches: function () {
		var obj = draw.currCursor.obj;
		var current = !un(obj.interact.matches) ? obj.interact.matches.join(',') : '';
		var matches = prompt('Set Venn diagram matches (eg. "prime,even,square")',current);
		if (typeof matches !== 'string' || matches.indexOf(',') === -1) return;
		obj.interact.matches = matches.split(',');
		drawCanvasPaths();
	},
	setAnswerPositions: function() {
		var obj = draw.currCursor.obj;
		var path = obj._path;
		var rect = path.tightBorder;
		obj.interact.answerPositions = [];
		var w = obj.width;
		var h = w * 0.65;
		for (var p = 0; p < draw.path.length; p++) {
			var path2 = draw.path[p];
			if (path2 === path || un(path2.interact) || path2.interact.type !== 'drag' || isPointInRect(path2._center,rect[0],rect[1],rect[2],rect[3]) === false) continue;
			obj.interact.answerPositions.push([roundToNearest((path2._center[0]-rect[0])/w,0.001),roundToNearest((path2._center[1]-rect[1])/h,0.001)]);
		}
		if (obj.interact.answerPositions.length === 0) {
			alert('To set answer positions for the Venn diagram, position draggable objects in the venn diagram and click again.');
		}
		drawCanvasPaths();
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		return [{
				shape: 'rect',
				dims: draw.vennDiagram2.getRect(obj),
				cursor: draw.cursors.pointer,
				func: draw.vennDiagram2.clickToggleShade,
				obj: obj
			}
		];
	},
	getCursorPositionsInteract: function (obj) {
		var pos = [];
		if (!un(obj.interact) && obj.interact.type === 'venn') {
			pos.push({
				shape: 'rect',
				dims: draw.vennDiagram2.getRect(obj),
				cursor: draw.cursors.pointer,
				func: draw.vennDiagram2.clickToggleShade,
				obj: obj
			});
		}
		return pos;
	},
	clickToggleShade: function (e) {
		var pos = draw.mouse;
		var obj = draw.currCursor.obj;
		var inA = dist(pos[0], pos[1], obj._centerA[0], obj._centerA[1]) < obj._radius ? true : false;
		var inB = dist(pos[0], pos[1], obj._centerB[0], obj._centerB[1]) < obj._radius ? true : false;
		if (inA && inB) {
			obj.shade[0] = !obj.shade[0];
		} else if (inA && !inB) {
			obj.shade[1] = !obj.shade[1];
		} else if (!inA && inB) {
			obj.shade[2] = !obj.shade[2];
		} else if (!inA && !inB) {
			obj.shade[3] = !obj.shade[3];
		}
		drawCanvasPaths();
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.left = center[0] + sf * (obj.left - center[0]);
			obj.top = center[1] + sf * (obj.top - center[1]);
		}
		obj.width *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	}
};

draw.star = {
	resizable: true,
	add: function () {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = {
			type: 'star',
			center: [center[0]-50,center[1]-50],
			radius: 100,
			points: 5,
			step: 2,
			lineWidth: 2,
			color: '#000',
			fillColor: 'none',
		};
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw: function (ctx, obj, path) {
		var c = obj.center;
		var r = obj.radius;
		var p = obj.points;
		var s = obj.step;
		var vertices = [];
		for (var i = 0; i < p; i++) {
			var angle = -Math.PI / 2 + i * (2 * Math.PI) / p;
			vertices.push([c[0] + r * Math.cos(angle), c[1] + r * Math.sin(angle)]);
		}
		if (obj.fillColor !== 'none') {
			ctx.beginPath();
			ctx.moveTo(vertices[0][0], vertices[0][1]);
			for (var i = p; i >= 0; i--) ctx.lineTo(vertices[(i * s) % p][0], vertices[(i * s) % p][1]);
			ctx.fillStyle = obj.fillColor;
			ctx.fill();
		}
		if (obj.color !== 'none') {
			ctx.beginPath();
			ctx.moveTo(vertices[0][0], vertices[0][1]);
			for (var i = p; i >= 0; i--) ctx.lineTo(vertices[(i * s) % p][0], vertices[(i * s) % p][1]);
			ctx.lineWidth = obj.lineWidth;
			ctx.strokeStyle = obj.color;
			ctx.stroke();
		}
	},
	drawButton: function (ctx, size, type) {
		draw.star.draw(ctx, {
			type: 'star',
			center: [0.5 * size, 0.5 * size],
			radius: 0.3 * size,
			points: 5,
			step: 2,
			lineWidth: 1,
			color: '#000',
			fillColor: 'none'
		});
	},
	getRect: function (obj) {
		return [obj.center[0] - obj.radius, obj.center[1] - obj.radius, 2 * obj.radius, 2 * obj.radius];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		if (dw !== 0 || dh !== 0) {
			var x = mouse.x - draw.drawRelPos[0];
			var y = mouse.y - draw.drawRelPos[1];
			obj.radius = Math.abs(Math.min(x - obj.center[0], y - obj.center[1]));
		}
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	setFillColor: function (obj, color) {
		obj.fillColor = color;
	},
	getLineWidth: function (obj) {
		return obj.lineWidth;
	},
	getLineColor: function (obj) {
		return obj.color;
	},
	getFillColor: function (obj) {
		return obj.fillColor;
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		if (!un(obj.radius))
			obj.radius *= sf;
		if (!un(obj.lineWidth))
			obj.lineWidth *= sf;
	},
	getControlPanel: function (obj) {
		var elements = [{
				name: 'Style',
				type: 'style'
			}, {
				name: 'Points',
				type: 'increment',
				increment: function (obj, value) {
					obj.points = Math.max(3, Math.min(obj.points + value, 20));
				}
			}, {
				name: 'Step',
				type: 'increment',
				increment: function (obj, value) {
					obj.step = Math.max(2, Math.min(obj.step + value, obj.points));
				}
			}
		];
		return {
			obj: obj,
			elements: elements
		};
	}
};
draw.pieChart = {
	resizable: true,
	add: function (x, y, r1, a1, a2, a3) {
		deselectAllPaths(false);
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'pieChart',
					center: [center[0]-50,center[1]-50],
					radius: 100,
					angles: [0, (1 / 3) * Math.PI, (1 / 1) * Math.PI, (3 / 2) * Math.PI],
					fill: draw.pieChart.colorSchemes[0].slice(0, 4),
					color: draw.color,
					thickness: draw.thickness,
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	draw: function (ctx, obj, path) {
		ctx.strokeStyle = obj.color;
		ctx.lineWidth = obj.thickness;

		obj._pos = [];
		for (var a = 0; a < obj.angles.length; a++) {
			var angle = obj.angles[a];
			obj._pos[a] = [obj.center[0] + obj.radius * Math.cos(angle), obj.center[1] + obj.radius * Math.sin(angle)];
		}
		for (var a = 0; a < obj.angles.length; a++) {
			var pos = obj._pos[a];
			var angle = obj.angles[a];
			var next = obj.angles[(a + 1) % obj.angles.length];
			ctx.beginPath();
			ctx.moveTo(obj.center[0], obj.center[1]);
			ctx.lineTo(pos[0], pos[1]);
			ctx.arc(obj.center[0], obj.center[1], obj.radius, angle, next);
			ctx.lineTo(obj.center[0], obj.center[1]);
			ctx.fillStyle = obj.fill[a];
			ctx.fill();
		}
		for (var a = 0; a < obj.angles.length; a++) {
			var pos = obj._pos[a];
			ctx.beginPath();
			ctx.moveTo(obj.center[0], obj.center[1]);
			ctx.lineTo(pos[0], pos[1]);
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.arc(obj.center[0], obj.center[1], obj.radius, 0, 2 * Math.PI);
		ctx.stroke();

		obj._angleLabelPos = [];
		if (!un(obj.showAngles)) {
			for (var a = 0; a < obj.showAngles.length; a++) {
				if (un(obj.showAngles[a]))
					continue;
				var angleObj = clone(obj.showAngles[a]);
				angleObj.ctx = ctx;
				angleObj.drawLines = boolean(angleObj.drawLines, false);
				angleObj.radius = angleObj.radius || 30;
				angleObj.lineColor = angleObj.lineColor || '#000';
				angleObj.labelMeasure = boolean(angleObj.labelMeasure, true);
				angleObj.labelFontSize = angleObj.labelFontSize || 25;
				angleObj.labelRadius = angleObj.labelRadius || 33;
				angleObj.labelColor = angleObj.labelColor || angleObj.lineColor;
				angleObj.lineWidth = angleObj.lineWidth || 2;
				var pos = obj._pos[a];
				var angle = obj.angles[a];
				var next = obj._pos[(a + 1) % obj._pos.length];
				angleObj.b = obj.center;
				angleObj.a = pos;
				angleObj.c = next;
				obj._angleLabelPos[a] = drawAngle(angleObj);
			}
		}

		if (!un(path) && path.obj.length == 1 && path.selected == true) {
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';
			ctx.fillStyle = '#F00';
			var angleObj = {
				ctx: ctx,
				drawLines: false,
				radius: 30,
				lineColor: colorA(obj.color, 0.3),
				labelMeasure: true,
				labelFontSize: 25,
				labelRadius: 33,
				labelColor: colorA(obj.color, 0.3),
				lineWidth: 2
			};
			for (var a = 0; a < obj.angles.length; a++) {
				var pos = obj._pos[a];
				if (un(obj.showAngles) || un(obj.showAngles[a])) {
					var angle = obj.angles[a];
					var next = obj._pos[(a + 1) % obj._pos.length];
					angleObj.b = obj.center;
					angleObj.a = pos;
					angleObj.c = next;
					obj._angleLabelPos[a] = drawAngle(angleObj);
				}
				ctx.beginPath();
				ctx.arc(pos[0], pos[1], 7, 0, 2 * Math.PI);
				ctx.fill();
				ctx.stroke();
			}
		}
	},
	drawButton: function (ctx, size, type) {
		draw.pieChart.draw(ctx, {
			type: 'pieChart',
			center: [0.5 * size, 0.5 * size],
			radius: 0.3 * size,
			angles: [0, (1 / 3) * Math.PI, (1 / 1) * Math.PI, (3 / 2) * Math.PI],
			fill: ['#F66', '#66F', '#6F6', '#F90'],
			color: '#000',
			thickness: 1,
		});
	},
	getRect: function (obj) {
		return [obj.center[0] - obj.radius, obj.center[1] - obj.radius, 2 * obj.radius, 2 * obj.radius];
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'anglesAroundPoint-pointsMinus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.pieChart.pointsMinus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'anglesAroundPoint-pointsPlus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 60, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.pieChart.pointsPlus,
			pathNum: pathNum
		});
		if (!un(draw.path[pathNum]) && !un(draw.path[pathNum].obj)) {
			buttons.push({
				buttonType: 'pieChart-colorSchemeToggle',
				shape: 'rect',
				dims: [x2 - 20, y2 - 80, 20, 20],
				cursor: draw.cursors.pointer,
				func: draw.pieChart.toggleColorScheme,
				pathNum: pathNum,
				obj: draw.path[pathNum].obj[0],
				draw: function (path, ctx, l, t, w, h) {
					ctx.fillStyle = colorA('#00F', 0.5);
					ctx.fillRect(l, t, w / 2, h / 2);
					ctx.fillStyle = colorA('#F66', 0.5);
					ctx.fillRect(l + w / 2, t, w / 2, h / 2);
					ctx.fillStyle = colorA('#CFC', 0.5);
					ctx.fillRect(l, t + h / 2, w / 2, h / 2);
					ctx.fillStyle = colorA('#999', 0.5);
					ctx.fillRect(l + w / 2, t + h / 2, w / 2, h / 2);
				}
			});
		}
		return buttons;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		for (var a = 0; a < obj.angles.length; a++) {
			var a1 = obj.angles[a];
			var a2 = obj.angles[(a + 1) % obj.angles.length];

			pos.push({
				shape: 'sector',
				dims: [obj.center[0], obj.center[1], obj.radius, a1, a2],
				cursor: draw.cursors.pointer,
				func: draw.pieChart.incColor,
				pathNum: pathNum,
				obj: obj,
				index: a
			});

			pos.push({
				shape: 'sector',
				dims: [obj.center[0], obj.center[1], 25, a1, a2],
				cursor: draw.cursors.pointer,
				func: draw.pieChart.toggleShowAngle,
				pathNum: pathNum,
				obj: obj,
				index: a
			});

			if (!un(obj._angleLabelPos) && !un(obj._angleLabelPos[a])) {
				pos.push({
					shape: 'rect',
					dims: obj._angleLabelPos[a],
					cursor: draw.cursors.pointer,
					func: draw.pieChart.toggleShowAngleLabel,
					pathNum: pathNum,
					obj: obj,
					index: a
				});
			}
		}
		for (var a = 0; a < obj.angles.length; a++) {
			var pos2 = obj._pos[a];
			pos.push({
				shape: 'circle',
				dims: [pos2[0], pos2[1], 8],
				cursor: draw.cursors.pointer,
				func: draw.pieChart.startPointDrag,
				pathNum: pathNum,
				index: a
			});
		}
		return pos;
	},
	getSnapPos: function (obj) {
		var pos = [{
				type: 'point',
				pos: obj.center
			}
		];
		for (var a = 0; a < obj.angles.length; a++) {
			var angle = obj.angles[a];
			pos.push({
				type: 'point',
				pos: [obj.center[0] + obj.radius * Math.cos(angle), obj.center[1] + obj.radius * Math.sin(angle)]
			});
		}
		return pos;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		if (dw !== 0 || dh !== 0) {
			var x = mouse.x - draw.drawRelPos[0];
			var y = mouse.y - draw.drawRelPos[1];
			obj.radius = Math.abs(Math.min(x - obj.center[0], y - obj.center[1]));
		}
	},
	setLineWidth: function (obj, lineWidth) {
		obj.thickness = lineWidth;
	},
	setLineColor: function (obj, color) {
		obj.color = color;
	},
	getLineWidth: function (obj) {
		return obj.thickness;
	},
	getLineColor: function (obj) {
		return obj.color;
	},

	pointsMinus: function (path) {
		if (un(path)) path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		if (obj.angles.length > 2) {
			obj.angles.pop();
			updateBorder(path);
			drawCanvasPaths();
			drawSelectCanvas();
		}
	},
	pointsPlus: function (path) {
		if (un(path))
			path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		var angle = (obj.angles.last() + 2 * Math.PI) / 2;
		obj.angles.push(angle);
		obj.fill.push('#F66');
		updateBorder(path);
		drawCanvasPaths();
		drawSelectCanvas();
	},
	colorSchemes: [
		['#FF0', '#F0F', '#0FF', '#F90', '#F09', '#0F9'],
		['#66F', '#F66', '#6F6', '#FF6', '#F6F', '#6FF'],
		['#CCF', '#FCC', '#CFC', '#FFC', '#FCF', '#CFF'],
		['#AAA', '#666', '#EEE', '#888', '#CCC', '#444']
	],
	toggleColorScheme: function () {
		var obj = draw.currCursor.obj;
		if (un(obj.scheme))
			obj.scheme = 0;
		var oldsch = draw.pieChart.colorSchemes[obj.scheme];
		obj.scheme = (obj.scheme + 1) % draw.pieChart.colorSchemes.length;
		var newsch = draw.pieChart.colorSchemes[obj.scheme];
		for (var f = 0; f < obj.fill.length; f++) {
			var index = oldsch.indexOf(obj.fill[f]);
			if (index == -1)
				index = 0;
			obj.fill[f] = newsch[index];
		}
		drawCanvasPaths();
	},
	incColor: function () {
		var obj = draw.currCursor.obj;
		if (un(obj.scheme))
			obj.scheme = 0;
		var colors = draw.pieChart.colorSchemes[obj.scheme];
		var fill = obj.fill;
		var index = draw.currCursor.index;
		var colorIndex = colors.indexOf(fill[index]);
		fill[index] = colors[(colorIndex + 1) % colors.length];
		drawCanvasPaths();
	},
	toggleShowAngle: function () {
		var obj = draw.currCursor.obj;
		var index = draw.currCursor.index;
		if (un(obj.showAngles))
			obj.showAngles = [];
		if (un(obj.showAngles[index])) {
			obj.showAngles[index] = {};
		} else {
			delete obj.showAngles[index];
		}
		drawCanvasPaths();
	},
	toggleShowAngleLabel: function () {
		var obj = draw.currCursor.obj;
		var index = draw.currCursor.index;
		if (un(obj.showAngles))
			obj.showAngles = [];
		if (un(obj.showAngles[index])) {
			obj.showAngles[index] = {};
		} else {
			obj.showAngles[index].labelMeasure = un(obj.showAngles[index].labelMeasure) ? false : !obj.showAngles[index].labelMeasure;
		}
		drawCanvasPaths();
	},
	startPointDrag: function () {
		changeDrawMode('pieChartPointDrag');
		draw.currPathNum = draw.currCursor.pathNum;
		draw.currIndex = draw.currCursor.index;
		draw.animate(draw.pieChart.pointMove,draw.pieChart.pointStop,drawCanvasPaths);				
		//addListenerMove(window, draw.pieChart.pointMove);
		//addListenerEnd(window, draw.pieChart.pointStop);
	},
	pointMove: function (e) {
		updateMouse(e);
		var obj = draw.path[draw.currPathNum].obj[0];
		var prevAngle = obj.angles[draw.currIndex];
		var angle = roundToNearest(getAngleFromAToB(obj.center, draw.mouse), 0.001);
		obj.angles[draw.currIndex] = angle;
		obj.angles.sort();
		if (prevAngle < 1 && angle > 5.3) { // if angle crosses zero, shift colors
			obj.fill.push(obj.fill.shift());
		} else if (prevAngle > 5.3 && angle < 1) {
			obj.fill.unshift(obj.fill.pop());
		}
		var newIndex = obj.angles.indexOf(angle);
		draw.currIndex = newIndex;
		updateBorder(draw.path[draw.currPathNum]);
		//drawSelectedPaths();
		//drawSelectCanvas();
	},
	pointStop: function (e) {
		var pathNum = draw.currPathNum;
		var point = draw.currPoint;
		var obj = draw.path[pathNum].obj[0];
		if (draw.gridSnap == true) {
			obj.points[point][0] = roundToNearest(obj.points[point][0], draw.gridSnapSize);
			obj.points[point][1] = roundToNearest(obj.points[point][1], draw.gridSnapSize);
			updateBorder(draw.path[pathNum]);
			drawSelectedPaths();
			drawSelectCanvas();
		}
		delete draw.currPathNum;
		delete draw.currIndex;
		//removeListenerMove(window, draw.pieChart.pointMove);
		//removeListenerEnd(window, draw.pieChart.pointStop);
		changeDrawMode();
	},
	scale: function (obj, sf, center) {
		if (un(center))
			var center = obj.center;
		obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
		obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		if (!un(obj.radius))
			obj.radius *= sf;
		if (!un(obj.thickness))
			obj.thickness *= sf;
	}

};
draw.linkIcon = {
	draw: function (ctx, obj, path) {
		ctx.save();
		var rect = obj.rect;
		ctx.translate(rect[0], rect[1]);
		ctx.lineWidth = obj.lineWidth || 5;
		ctx.strokeStyle = obj.color || '#000';
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		var w = rect[2];
		var h = rect[3] || rect[2];
		ctx.beginPath();

		ctx.moveTo(w, h * 0.7);
		ctx.lineTo(w, h * 0.8);
		ctx.arc(w * 0.8, h - w * 0.2, w * 0.2, 0, 0.5 * Math.PI);
		ctx.lineTo(w * 0.8, h);
		ctx.arc(w * 0.2, h - w * 0.2, w * 0.2, 0.5 * Math.PI, 1 * Math.PI);
		ctx.lineTo(0, h - w * 0.2);
		ctx.arc(w * 0.2, w * 0.2, w * 0.2, 1 * Math.PI, 1.5 * Math.PI);
		ctx.lineTo(w * 0.3, 0);
		ctx.stroke();

		drawArrow({
			ctx: ctx,
			startX: w * 0.4,
			startY: h * 0.6,
			finX: w,
			finY: 0.01,
			arrowLength: 0.33 * w,
			fillArrow: true,
			lineWidth: obj.lineWidth || 5,
			color: obj.color || '#000',
			angleBetweenLinesRads: 0.6
		});

		ctx.translate(-rect[0], -rect[1]);
		ctx.restore();
	},

}

draw.playButton = {
	resizable: false,
	add: function () {
		deselectAllPaths(false);
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'playButton',
					left: center[0]-25,
					top: center[1]-25,
					size: 50,
					fillColor: '#CFF',
					direction: 'right'
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, obj.size, obj.size];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	draw: function (ctx, obj, path) {
		var l = obj.left;
		var t = obj.top;
		var w = obj.size;
		var h = obj.size;
		var color = obj.fillColor;
		var borderWidth = obj.borderWidth || 8;
		var radius = obj.radius || 8;
		roundedRect(ctx, l, t, w, h, radius, borderWidth, '#000', color);
		ctx.fillStyle = '#000';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		var s = 0.5; // triangle size as fraction of width
		var s2 = 0.28; // triangle size as fraction of width
		if (obj.direction == 'right') {
			ctx.moveTo(l+w * s/2, t+h * (0.5-s2));
			ctx.lineTo(l+w * (1-s/2), t+h * 0.5);
			ctx.lineTo(l+w * s/2, t+h * (0.5+s2));
			ctx.lineTo(l+w * s/2, t+h * (0.5-s2));		
		} else {
			ctx.moveTo(l+w * (1-s/2), t+h * (0.5-s2));
			ctx.lineTo(l+w * s/2, t+h * 0.5);
			ctx.lineTo(l+w * (1-s/2), t+h * (0.5+s2));
			ctx.lineTo(l+w * (1-s/2), t+h * (0.5-s2));
			/*ctx.moveTo(l+w * 34 / 50, t+h * 14 / 50);
			ctx.lineTo(l+w * 16 / 50, t+h * 25 / 50);
			ctx.lineTo(l+w * 34 / 50, t+h * 36 / 50);
			ctx.lineTo(l+w * 34 / 50, t+h * 14 / 50);*/
		}
		ctx.fill();
	}
}
draw.resetButton = {
	resizable: false,
	add: function () {
		deselectAllPaths(false);
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'resetButton',
					left: center[0]-25,
					top: center[1]-25,
					size: 50,
					fillColor: '#CFF',
					direction: 'left'
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, obj.size, obj.size];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	draw: function (ctx, obj, path) {
		var l = obj.left;
		var t = obj.top;
		var w = obj.size;
		var h = obj.size;
		var color = obj.fillColor;
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#000';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		roundedRect2(ctx, l, t, w, h, 10, 3, '#000', color);
		ctx.lineWidth = 0.08 * w;
		if (obj.direction === 'right') {
			ctx.beginPath();
			ctx.arc(l + 0.5 * w, t + 0.5 * h, 0.22 * w, -1.8 * Math.PI, -0.2 * Math.PI);
			ctx.stroke();
			ctx.beginPath();
			var l2 = l + 0.77 * w;
			var t2 = t + 0.47 * h;
			var arrowLength = 0.28 * w;
			ctx.moveTo(l2, t2);
			ctx.lineTo(l2 + arrowLength * Math.sin(1.06 * Math.PI), t2 + arrowLength * Math.cos(1.06 * Math.PI));
			ctx.lineTo(l2 + arrowLength * Math.cos(1.03 * Math.PI), t2 - arrowLength * Math.sin(1.03 * Math.PI));
			ctx.lineTo(l2, t2);
			ctx.fill();
		} else {
			ctx.save();
			ctx.beginPath();
			ctx.arc(l + 0.5 * w, t + 0.5 * h, 0.22 * w, 1.2 * Math.PI,  0.8 * Math.PI);
			ctx.stroke();
			ctx.beginPath();
			var l2 = l + 0.23 * w;
			var t2 = t + 0.47 * h;
			var arrowLength = 0.28 * w;
			ctx.moveTo(l2, t2);
			ctx.lineTo(l2 - arrowLength * Math.sin(1.06 * Math.PI), t2 + arrowLength * Math.cos(1.06 * Math.PI));
			ctx.lineTo(l2 - arrowLength * Math.cos(1.03 * Math.PI), t2 - arrowLength * Math.sin(1.03 * Math.PI));
			ctx.lineTo(l2, t2);
			ctx.fill();
			ctx.restore();
		}
	}
}
draw.starButton = {
	resizable: false,
	add: function () {
		deselectAllPaths(false);
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'starButton',
					left: center[0]-25,
					top: center[1]-25,
					size: 50,
					fillColor:'#C9F',
					pressed:false
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, obj.size, obj.size];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	draw: function (ctx, obj, path) {
		var l = obj.left;
		var t = obj.top;
		var w = obj.size;
		var h = obj.size;
		var pos = [l+w/2,t+h/2];
		
		var colors = ['#96C','#C9F'];
		if (obj.fillColor !== '#C9F') {
			colors[1] = obj.fillColor;
			var col = colors[1].split('');
			for (var i = 1; i < 4; i++) {
				col[i] = {'0':'0','1':'0','2':'0','3':'0','4':'1','5':'2','6':'3','7':'4','8':'5','9':'6','A':'7','B':'8','C':'9','D':'A','E':'B','F':'C'}[col[i]];
			}
			colors[0] = col.join('');
		}
		
		if (obj.pressed !== true) {
			roundedRect(ctx, pos[0]-20+3, pos[1]-20+3, 40 - 6, 40 - 6, 3, 6, colors[0], colors[1]);	
			ctx.beginPath();
			ctx.fillStyle = '#FFF';
			drawStar({
				ctx: ctx,
				center: pos,
				radius: 12,
				points: 5
			});
			ctx.fill();
		} else {
			roundedRect(ctx, pos[0]-20+3, pos[1]-20+3, 40 - 6, 40 - 6, 3, 6, colorA(colors[1],0.75), '#FFF');	
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
}
draw.settingsButton = {
	resizable: false,
	add: function () {
		deselectAllPaths(false);
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'settingsButton',
					left: center[0]-25,
					top: center[1]-25,
					size: 50,
					fillColor: '#CCF',
					interact:{
						click:function() {}
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, obj.size, obj.size];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	draw: function (ctx, obj, path) {
		var color = obj.fillColor;
		var borderWidth = obj.borderWidth || 6;
		var radius = obj.radius || 10;
		roundedRect(ctx, obj.left, obj.top, obj.size, obj.size, radius, borderWidth, '#000', color);
		draw.icons.gear(ctx,obj.left,obj.top,obj.size,{fillColor:'#999',r2:obj.size*0.25,r3:obj.size*0.32});
	}
}

draw.constructionButtons = {
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonCompassHelp',
					left: 20,
					top: 20,
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});

		draw.path.push({
			obj: [{
					type: 'compassHelp',
					left: 100,
					top: 20,
					interact: {
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});

		var types = ['buttonColorPicker', 'buttonLine', 'buttonPen', 'buttonCompass', 'buttonProtractor', 'buttonRuler', 'buttonUndo', 'buttonClear'];
		for (var t = 0; t < types.length; t++) {
			draw.path.push({
				obj: [{
						type: types[t],
						left: 20,
						top: 685 - 65 * (types.length - t),
						interact: {
							click: function (obj) {
								draw[obj.type].click(obj)
							},
							overlay: true
						}
					}
				],
				selected: true,
				trigger: []
			});
			if (types[t] == 'buttonColorPicker') {
				draw.path.push({
					obj: [{
							type: 'colorPicker',
							colors: ['#000', '#999', '#00F', '#F00', '#393', '#F0F', '#93C', '#F60'],
							left: 80,
							top: 685 - 65 * (types.length - t) + 3,
							interact: {
								click: function (obj) {
									draw[obj.type].click(obj)
								},
								overlay: true
							}
						}
					],
					selected: true,
					trigger: []
				});
			}
		}
		draw.updateAllBorders();
		drawCanvasPaths();
		changeDrawMode();
	},
	drawButton: function (ctx, size, type) {
		draw.buttonCompass.draw(ctx, {
			type: 'buttonCompass',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	}
}
draw.buttonCompass = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonCompass',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonCompass.draw(ctx, {
			type: 'buttonCompass',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		var color = draw.buttonColor;
		if (draw.compassVisible == true) color = draw.buttonSelectedColor;
		ctx.translate(obj.left, obj.top);
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', color);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';

		var center1 = [13, 45];
		var center2 = [26, 15];
		var center3 = [40, 45];
		var armLength = Math.sqrt(Math.pow(0.5 * (center3[0] - center1[0]), 2) + Math.pow(center2[1] - center1[1], 2));

		var angle2 = -0.5 * Math.PI - Math.atan((center2[1] - center1[1]) / (center2[0] - center1[0]));
		var angle3 = 0.5 * Math.PI - Math.atan((center3[1] - center2[1]) / (center3[0] - center2[0]));

		// draw pointy arm
		ctx.translate(center2[0], center2[1]);
		ctx.rotate(-angle2);

		if (draw.compassVisible) {
			roundedRect(ctx, -2, 0, 4, armLength - 5, 1, 1, '#000');
		} else {
			roundedRect(ctx, -2, 0, 4, armLength - 5, 1, 1, '#000', '#99F');
		}
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(-1, armLength - 5);
		ctx.lineTo(0, armLength);
		ctx.lineTo(1, armLength - 5);
		ctx.lineTo(-1, armLength - 5);
		ctx.stroke();
		if (draw.compassVisible) {
			ctx.fillStyle = '#333';
			ctx.fill();
		}

		ctx.rotate(angle2);
		ctx.translate(-center2[0], -center2[1]);

		//draw pencil
		ctx.beginPath();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.moveTo(40, 45);
		ctx.lineTo(38, 42);
		ctx.lineTo(38, 25);
		ctx.lineTo(42, 25);
		ctx.lineTo(42, 42);
		ctx.lineTo(40, 45);
		if (!draw.compassVisible) {
			if (draw.color == '#000') {
				ctx.fillStyle = '#FC3';
			} else {
				ctx.fillStyle = draw.color;
			}
			ctx.fill();
		}
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(40, 45);
		ctx.lineTo(38, 42);
		ctx.lineTo(42, 42);
		ctx.lineTo(40, 45);
		if (!draw.compassVisible) {
			ctx.fillStyle = '#FFC';
			ctx.fill();
		}
		ctx.stroke();
		ctx.beginPath();
		if (draw.color == '#000') {
			ctx.fillStyle = '#FC3';
		} else {
			ctx.fillStyle = draw.color;
		}
		ctx.moveTo(40, 45);
		ctx.lineTo(39.5, 44.3);
		ctx.lineTo(40.5, 45.7);
		ctx.lineTo(40, 45);
		ctx.fill();
		ctx.stroke();

		ctx.strokeRect(44, 15 + armLength * 0.5, 1, 5);

		// draw pencil arm
		ctx.translate(center2[0], center2[1]);
		ctx.rotate(-angle3);

		var pAngle = Math.PI / 14;

		ctx.beginPath();
		ctx.moveTo(-2, 0);
		ctx.lineTo(2, 0);
		ctx.lineTo(2, armLength * 0.7);
		ctx.lineTo(6, armLength * 0.7);
		ctx.lineTo(6, armLength * 0.7 + 4);
		ctx.lineTo(-2, armLength * 0.7);
		ctx.lineTo(-2, 0);
		ctx.stroke();
		if (!draw.compassVisible) {
			ctx.fillStyle = '#99F';
			ctx.fill();
		}

		if (!draw.compassVisible) {
			ctx.fillRect(6.5, armLength * 0.5 - 0.5, 1, 5);
		}

		ctx.rotate(angle3);
		ctx.translate(-center2[0], -center2[1]);

		// draw top of compass
		ctx.translate(center2[0], center2[1]);

		roundedRect(ctx, -2.5, -3, 5, 7, 1, 1, '#000', '#000');
		roundedRect(ctx, -1, -6, 2, 3, 0, 1, '#000', '#000');
		ctx.fillStyle = '#CCC';
		ctx.beginPath();
		ctx.arc(0, 0, 1, 0, 2 * Math.PI);
		ctx.fill();

		ctx.translate(-center2[0], -center2[1]);
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		if (un(draw.compass)) draw.buttonCompass.initCompass();
		draw.compassVisible = !draw.compassVisible;
		moveToolToFront('compass');
		drawToolsCanvas();
		draw.cursors.update();
		drawCanvasPaths();
	},
	initCompass: function (init) {
		if (un(init)) init = {};
		var center1 = init.center1 || [500, 450];
		var radius = init.radius || 150;
		var armLength = init.armLength || 250;
		var angle = init.angle || 0;
		var h = Math.sqrt(Math.pow(armLength, 2) - Math.pow(0.5 * radius, 2));
		var center2 = [center1[0] + 0.5 * radius * Math.cos(angle) + h * Math.sin(angle), center1[1] + 0.5 * radius * Math.sin(angle) - h * Math.cos(angle)];
		var center3 = [center1[0] + radius * Math.cos(angle), center1[1] + radius * Math.sin(angle)];

		var angle2 = (angle % (2 * Math.PI));
		if (angle2 < 0) angle2 += 2 * Math.PI;
		if (angle2 > 0.5 * Math.PI && angle2 < 1.5 * Math.PI) {
			var drawOn = 'left';
		} else {
			var drawOn = 'right';
		}

		var mp1 = midpoint(center1[0], center1[1], center3[0], center3[1]);
		var mp2 = midpoint(center2[0], center2[1], mp1[0], mp1[1]);

		draw.compass = {
			center1: center1.slice(0),
			startCenter1: center1.slice(0),
			center2: center2.slice(0),
			startCenter2: center2.slice(0),
			center3: center3.slice(0),
			startCenter3: center3.slice(0),
			radius: radius,
			startRadius: radius,
			h: h,
			startH: h,
			armLength: armLength,
			radiusLocked: false,
			angle: angle,
			startAngle: angle,
			drawOn: drawOn,
			startDrawOn: drawOn,
			lockCenter: mp2.slice(0),
			mode: 'none',
		}
		recalcCompassValues();
	}
};
draw.buttonProtractor = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonProtractor',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonProtractor.draw(ctx, {
			type: 'buttonProtractor',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		var color = draw.buttonColor;
		if (draw.protractorVisible == true) color = draw.buttonSelectedColor;
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', color);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000';
		ctx.beginPath();
		ctx.moveTo(46.5, 35.5);
		ctx.lineTo(46.5, 37.5);
		ctx.lineTo(8.5, 37.5);
		ctx.lineTo(8.5, 34.5);
		ctx.arc(27.5, 34.5, 19, Math.PI, 2 * Math.PI);
		ctx.stroke();
		if (draw.protractorVisible == false) {
			ctx.fillStyle = '#CCF';
			ctx.fill();
			for (var i = 0; i < 7; i++) {
				ctx.moveTo(27.5 + 4 * Math.cos((1 + i / 6) * Math.PI), 34.5 + 4 * Math.sin((1 + i / 6) * Math.PI));
				ctx.lineTo(27.5 + 16 * Math.cos((1 + i / 6) * Math.PI), 34.5 + 16 * Math.sin((1 + i / 6) * Math.PI))
			}
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(27.5, 34.5, 15, Math.PI, 2 * Math.PI);
			for (var i = 0; i < 19; i++) {
				ctx.moveTo(27.5 + 17 * Math.cos((1 + i / 18) * Math.PI), 34.5 + 17 * Math.sin((1 + i / 18) * Math.PI));
				ctx.lineTo(27.5 + 19 * Math.cos((1 + i / 18) * Math.PI), 34.5 + 19 * Math.sin((1 + i / 18) * Math.PI))
			}
			ctx.moveTo(27.5, 34.5);
			ctx.lineTo(27.5, 30.5);
			ctx.moveTo(23.5, 34.5);
			ctx.lineTo(31.5, 34.5);
			ctx.stroke();
		}
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		if (un(draw.protractor)) draw.buttonProtractor.initProtractor();
		draw.protractorVisible = !draw.protractorVisible;
		moveToolToFront('protractor');
		drawToolsCanvas();
		draw.cursors.update();
		drawCanvasPaths();
	},
	initProtractor: function (init) {
		if (un(init)) init = {};
		draw.protractor = {
			center: init.center || [600, 500],
			startCenter: init.center || [600, 500],
			radius: init.radius || 250,
			startRadius: init.radius || 250,
			angle: 0,
			color: init.color || '#CCF',
			numbers: true
		}
	}
};
draw.buttonRuler = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonRuler',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonRuler.draw(ctx, {
			type: 'buttonRuler',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		var color = draw.buttonColor;
		if (draw.rulerVisible == true) color = draw.buttonSelectedColor;
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', color);
		if (draw.rulerVisible == true) {
			roundedRect(ctx, 7.5, 22.5, 40, 10, 3, 1, '#000');
		} else {
			roundedRect(ctx, 7.5, 22.5, 40, 10, 3, 1, '#000', '#CCF');
			if (un(draw.ruler) || draw.ruler.markings == true) {
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.beginPath();
				for (var i = 0; i < 11; i++) {
					ctx.moveTo(9.5 + i * (36 / 10), 22.5);
					ctx.lineTo(9.5 + i * (36 / 10), 26.5);
				}
				ctx.stroke();
			}
		}
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		if (un(draw.ruler))
			draw.buttonRuler.initRuler();
		draw.rulerVisible = !draw.rulerVisible;
		moveToolToFront('ruler');
		drawToolsCanvas();
		draw.cursors.update();
		drawCanvasPaths();
	},
	initRuler: function (init) {
		if (un(init)) init = {};
		draw.ruler = {
			left: init.left || 200,
			startLeft: init.left || 200,
			top: init.top || 300,
			startTop: init.top || 300,
			length: init.length || 800,
			width: init.length / 8 || 100,
			angle: 0,
			color: init.color || '#99F',
			transparent: boolean(init.transparent, true),
			markings: boolean(init.markings, true)
		}
		recalcRulerValues();
	}
};
draw.buttonPen = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonPen',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonPen.draw(ctx, {
			type: 'buttonPen',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		var color = draw.drawMode !== 'pen' ? draw.buttonColor : draw.buttonSelectedColor;
		roundedRect(ctx, 3, 3, 55 - 6, 55 - 6, 8, 6, '#000', color);

		ctx.fillStyle = !un(obj.color) ? obj.color : draw.color;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		ctx.translate(55 / 2, 55 / 2);
		ctx.rotate(Math.PI / 4);
		ctx.fillRect(-5, -11, 10, 20);
		ctx.fillRect(-5, -18, 10, 5);
		ctx.beginPath();
		ctx.moveTo(-5, 11);
		ctx.lineTo(0, 18);
		ctx.lineTo(5, 11);
		ctx.lineTo(-5, 11);
		ctx.fill();
		ctx.rotate(-Math.PI / 4);
		ctx.translate(-55 / 2, -55 / 2);
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		if (!un(obj._path) && !un(obj._path._taskQuestion)) {
			var taskQuestion = obj._path._taskQuestion;
			if (un(taskQuestion.drawToolsStyle)) {
				taskQuestion.drawToolsStyle = {
					color:obj.color || draw.color,
					thickness:obj.thickness || draw.thickness,
					fillColor:obj.fillColor || draw.fillColor,
					dash:[]
				};
			}
			taskQuestion._drawArea = [taskQuestion.left,taskQuestion.top,taskQuestion.width-taskQuestion.marginRight,taskQuestion.height];
			changeDrawMode('pen',undefined,taskQuestion);
		} else {
			if (!un(obj.color)) draw.color = obj.color;
			if (!un(obj.thickness)) draw.thickness = obj.thickness;
			changeDrawMode('pen');
		}
		draw.cursors.update();
		drawCanvasPaths();
	}
};
draw.buttonEraser = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonEraser',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonPen.draw(ctx, {
			type: 'buttonEraser',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.save();
		ctx.translate(obj.left, obj.top);
		var color = draw.drawMode !== 'eraser' ? draw.buttonColor : draw.buttonSelectedColor;
		roundedRect(ctx, 3, 3, 55 - 6, 55 - 6, 8, 6, '#000', color);

		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(10,40);
		ctx.lineTo(45,40);
		ctx.stroke();

		ctx.translate(55/2, 55/2);
			ctx.rotate(-Math.PI/4);
		ctx.translate(-55/2, -55/2);
		
		roundedRect(ctx, 15, 22, 25, 11, 4, 2, '#000', '#FEE');
		ctx.strokeStyle = '#000';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(22,22);
		ctx.lineTo(22,33);
		ctx.stroke();
		ctx.restore();
	},
	click: function (obj) {
		if (!un(obj._path) && !un(obj._path._taskQuestion)) {
			return;
		} else {
			if (!un(obj.thickness)) draw.thickness = obj.thickness;
			changeDrawMode('eraser');
		}
		draw.cursors.update();
		drawCanvasPaths();
	}
};
draw.buttonPoint = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonPoint',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	draw: function (ctx, obj, path) {
		if (!un(obj._path) && !un(obj._path._taskQuestion)) {
			var taskQuestion = obj._path._taskQuestion;
			var selected = draw.drawMode === 'point' && draw._drawToolsCurrentTaskQuestion === taskQuestion;
			var color = !un(obj.color) ? obj.color : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.color)) ? taskQuestion.drawToolsStyle.color : draw.color;
			/*var thickness = !un(obj.thickness) ? obj.thickness : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.thickness)) ? taskQuestion.drawToolsStyle.thickness : draw.thickness;
			var r = thickness*1.5;*/
			var r = 8;
		} else {
			var selected = draw.drawMode === 'point' && un(draw._drawToolsCurrentTaskQuestion);
			//var color = !un(obj.color) ? obj.color : !un(draw._saveDrawToolsStyle) ? draw._saveDrawToolsStyle.color : draw.color;
			var color = !un(obj.color) ? obj.color : draw.color;
			var r = draw.thickness*1.5;
		}
		if (draw.color !== color) selected = false;
		
		ctx.translate(obj.left, obj.top);
		var buttonColor = selected === false ? draw.buttonColor : draw.buttonSelectedColor;
		roundedRect(ctx, 3, 3, 55 - 6, 55 - 6, 8, 6, '#000', buttonColor);
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(27.5,27.5,r,0,2*Math.PI);
		ctx.fill();
	},
	click: function (obj) {
		if (!un(obj._path) && !un(obj._path._taskQuestion)) {
			var taskQuestion = obj._path._taskQuestion;
			var paths = taskQuestion._questionPaths;
			taskQuestion._drawArea = [taskQuestion.left,taskQuestion.top,taskQuestion.width-taskQuestion.marginRight,taskQuestion.height];
			var style = {
				color: !un(obj.color) ? obj.color : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.color)) ? taskQuestion.drawToolsStyle.color : draw.color,
				thickness :!un(obj.thickness) ? obj.thickness : draw.thickness
			}
			changeDrawMode('point',undefined,taskQuestion,style);
		} else {
			var paths = draw.path;
			var style = {
				color: !un(obj.color) ? obj.color : draw.color,
				thickness: !un(obj.thickness) ? obj.thickness : draw.thickness
			}
			changeDrawMode('point',undefined,undefined,style);
		}
		var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(paths,true);
		for (var t = 0; t < tracingPapers.length; t++) {
			var tp = tracingPapers[t];
			if (typeof tp.mode !== 'string' || tp.mode.indexOf('fold-') !== 0) tp.mode = 'none';
		}
		draw.cursors.update();
		drawCanvasPaths();
	}
};
draw.buttonLine = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonLine',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonLine.draw(ctx, {
			type: 'buttonLine',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		var buttonColor = draw.buttonLine.isSelected(obj) === false ? draw.buttonColor : draw.buttonSelectedColor;
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', buttonColor);
		
		if (!un(obj._path) && !un(obj._path._taskQuestion)) {
			var taskQuestion = obj._path._taskQuestion;
			var color = !un(obj.color) ? obj.color : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.color)) ? taskQuestion.drawToolsStyle.color : draw.color;
			var width = !un(obj.thickness) ? obj.thickness : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.thickness)) ? taskQuestion.drawToolsStyle.thickness : draw.thickness;
		} else {
			//var color = !un(obj.color) ? obj.color : !un(draw._saveDrawToolsStyle) ? draw._saveDrawToolsStyle.color : draw.color;
			//var width = !un(obj.thickness) ? obj.thickness : !un(draw._saveDrawToolsStyle) ? draw._saveDrawToolsStyle.thickness : draw.thickness;
			var color = !un(obj.color) ? obj.color : draw.color;
			var width = !un(obj.thickness) ? obj.thickness : draw.thickness;
		}

		ctx.strokeStyle = color;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		if (!un(obj.dash)) ctx.setLineDash([obj.dash[0]*0.75,obj.dash[1]*0.75]);
		/*ctx.lineWidth = width + 1;
		ctx.beginPath();
		ctx.arc(12, 20, 2, 0, 2 * Math.PI);
		ctx.stroke();*/
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(12, 20);
		ctx.lineTo(43, 35);
		ctx.stroke();
		/*ctx.lineWidth = width + 1;
		ctx.beginPath();
		ctx.arc(43, 35, 2, 0, 2 * Math.PI);
		ctx.stroke();*/
		if (!un(obj.dash)) ctx.setLineDash([]);
		ctx.translate(-obj.left, -obj.top);
	},
	isSelected: function(obj) {
		if (!un(obj._path) && !un(obj._path._taskQuestion)) {
			var taskQuestion = obj._path._taskQuestion;
			var selected = draw.drawMode === 'line' && taskQuestion === draw._drawToolsCurrentTaskQuestion;
			var color = !un(obj.color) ? obj.color : draw.color;
			var width = !un(obj.thickness) ? obj.thickness : draw.thickness;
		} else {
			var selected = draw.drawMode === 'line' && un(draw._drawToolsCurrentTaskQuestion);
			//var color = !un(obj.color) ? obj.color : !un(draw._saveDrawToolsStyle) ? draw._saveDrawToolsStyle.color : draw.color;
			//var width = !un(obj.thickness) ? obj.thickness : !un(draw._saveDrawToolsStyle) ? draw._saveDrawToolsStyle.thickness : draw.thickness;
			var color = !un(obj.color) ? obj.color : draw.color;
			var width = !un(obj.thickness) ? obj.thickness : draw.thickness;
		}
		if (draw.color !== color || draw.thickness !== width) selected = false;
		return selected;
	},
	click: function (obj) {
		if (draw.buttonLine.isSelected(obj) === true) {
			changeDrawMode(undefined,undefined,taskQuestion);
		} else if (!un(obj._path) && !un(obj._path._taskQuestion)) {
			var taskQuestion = obj._path._taskQuestion;
			var paths = taskQuestion._questionPaths;
			taskQuestion._drawArea = [taskQuestion.left,taskQuestion.top,taskQuestion.width-taskQuestion.marginRight,taskQuestion.height];
			draw.drawMode = 'none';
			var style = {
				color: !un(obj.color) ? obj.color : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.color)) ? taskQuestion.drawToolsStyle.color : draw.color,
				thickness: !un(obj.thickness) ? obj.thickness : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.thickness)) ? taskQuestion.drawToolsStyle.thickness : draw.thickness,
				dash: !un(obj.dash) ? obj.dash : (!un(taskQuestion) && !un(taskQuestion.drawToolsStyle) && !un(taskQuestion.drawToolsStyle.dash)) ? taskQuestion.drawToolsStyle.dash : draw.dash,
			}
			changeDrawMode('line',undefined,taskQuestion,style);
		} else {
			var paths = draw.path;
			var style = {
				color: !un(obj.color) ? obj.color : draw.color,
				thickness: !un(obj.thickness) ? obj.thickness : draw.thickness,
				dash: !un(obj.dash) ? obj.dash : draw.dash
			}
			changeDrawMode('line',undefined,undefined,style);
		}
		var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(paths,true);
		for (var t = 0; t < tracingPapers.length; t++) {
			var tp = tracingPapers[t];
			if (typeof tp.mode !== 'string' || tp.mode.indexOf('fold-') !== 0) tp.mode = 'none';
		}
		draw.cursors.update();
		drawCanvasPaths();
	}
};
draw.buttonUndo = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonUndo',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonUndo.draw(ctx, {
			type: 'buttonUndo',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		var s = 55;
		roundedRect(ctx, 3, 3, s - 6, s - 6, 8, 6, '#000', draw.buttonColor);

		ctx.strokeStyle = '#000';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.arc(s / 2, s / 2, 12 * s / 55, -Math.PI, 0.7 * Math.PI);
		ctx.moveTo(13.5 * s / 55, 27.5 * s / 55);
		ctx.lineTo(13.5 * s / 55 - 10 * s / 55 * Math.sin(1 * Math.PI), 27.5 * s / 55 + 10 * s / 55 * Math.cos(1 * Math.PI));
		ctx.lineTo(13.5 * s / 55 - 10 * s / 55 * Math.cos(0.95 * Math.PI), 27.5 * s / 55 - 10 * s / 55 * Math.sin(0.95 * Math.PI));
		ctx.lineTo(13.5 * s / 55, 27.5 * s / 55);
		ctx.stroke();
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		var taskQuestion = (!un(obj) && !un(obj._path) && !un(obj._path._taskQuestion)) ? obj._path._taskQuestion : false;
		if (taskQuestion !== false) draw.taskQuestion.getPaths(taskQuestion,draw.path);
		var mostRecent = false;
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (taskQuestion !== false && path._taskQuestion !== taskQuestion) continue;
			for (var o = 0; o < path.obj.length; o++) {
				var obj2 = path.obj[o];
				if (un(obj2.created)) continue;
				if (mostRecent === false || obj2.created > mostRecent.time) {
					mostRecent = {time:obj2.created,objs:[obj2],tpDrawPaths:[]};
				} else if (obj2.created === mostRecent.time) {
					mostRecent.objs.push(obj2);
				}
			}
		}
		var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(draw.path,true);
		for (var t = 0; t < tracingPapers.length; t++) {
			var tp = tracingPapers[t];
			if (taskQuestion !== false && tp._path._taskQuestion !== taskQuestion) continue;
			if (un(tp.drawPaths)) continue;
			for (var o = 0; o < tp.drawPaths.length; o++) {
				var drawPath = tp.drawPaths[o];
				if (un(drawPath.created)) continue;
				drawPath._obj = tp;
				if (mostRecent === false || drawPath.created > mostRecent.time) {
					mostRecent = {time:drawPath.created,objs:[],tpDrawPaths:[drawPath]};
				} else if (drawPath.created === mostRecent.time) {
					mostRecent.tpDrawPaths.push(drawPath);
				}
			}
		}
		if (mostRecent !== false) {
			for (var o = 0; o < mostRecent.objs.length; o++) {
				var obj2 = mostRecent.objs[o];
				var index = draw.path.indexOf(obj2._path);
				if (index > -1) draw.path.splice(index,1);
				if (obj2.type === 'eraser' && obj2._objs instanceof Array) {
					for (var o3 = 0; o3 < obj2._objs.length; o3++) {
						var obj3 = obj2._objs[o3];
						if (obj3._erasers instanceof Array) {
							var index2 = obj3._erasers.indexOf(obj2);
							if (index2 > -1) obj3._erasers.splice(index2,1);
						}
					}
				}
			}
			for (var o = 0; o < mostRecent.tpDrawPaths.length; o++) {
				var drawPath = mostRecent.tpDrawPaths[o];
				var index = drawPath._obj.drawPaths.indexOf(drawPath);
				if (index > -1) drawPath._obj.drawPaths.splice(index,1);
			}
		}
	}
};
draw.buttonRedo = { // not implemented
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonRedo',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonUndo.draw(ctx, {
			type: 'buttonRedo',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		var s = 55;
		roundedRect(ctx, 3, 3, s - 6, s - 6, 8, 6, '#000', draw.buttonColor);

		ctx.strokeStyle = '#000';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = 4;
		ctx.save();
		ctx.translate(s/2, 0);
        ctx.scale(-1, 1);
		ctx.translate(-s/2, 0);
		ctx.beginPath();
		ctx.arc(s / 2, s / 2, 12 * s / 55, -Math.PI, 0.7 * Math.PI);
		ctx.moveTo(13.5 * s / 55, 27.5 * s / 55);
		ctx.lineTo(13.5 * s / 55 - 10 * s / 55 * Math.sin(1 * Math.PI), 27.5 * s / 55 + 10 * s / 55 * Math.cos(1 * Math.PI));
		ctx.lineTo(13.5 * s / 55 - 10 * s / 55 * Math.cos(0.95 * Math.PI), 27.5 * s / 55 - 10 * s / 55 * Math.sin(0.95 * Math.PI));
		ctx.lineTo(13.5 * s / 55, 27.5 * s / 55);
		ctx.stroke();
		ctx.translate(s/2, 0);
        ctx.scale(-1, 1);
		ctx.translate(-s/2, 0);
		ctx.restore();
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		
	}
};
draw.buttonClear = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonClear',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonClear.draw(ctx, {
			type: 'buttonClear',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', draw.buttonColor);

		ctx.strokeStyle = '#000';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		ctx.lineWidth = 4;
		text({
			context: ctx,
			left: 0,
			width: 55,
			top: 15,
			textArray: ['<<font:Arial>><<fontSize:20>><<align:center>>CLR']
		});
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		var taskQuestion = (!un(obj) && !un(obj._path) && !un(obj._path._taskQuestion)) ? obj._path._taskQuestion : false;
		if (taskQuestion !== false) {
			draw.taskQuestion.getPaths(taskQuestion,draw.path);
		}
		for (var p = 0; p < draw.path.length; p++) {
			var path = draw.path[p];
			if (taskQuestion !== false && path._taskQuestion !== taskQuestion) continue;
			for (var o = 0; o < path.obj.length; o++) {
				var obj2 = path.obj[o];
				if (un(obj2.created)) continue;
				path.obj.splice(o,1);
				o--;
			}
			if (path.obj.length === 0) {
				draw.path.splice(p,1);
				p--;
			}
		}
		var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(draw.path,true);
		for (var t = 0; t < tracingPapers.length; t++) {
			var tp = tracingPapers[t];
			if (taskQuestion !== false && tp._path._taskQuestion !== taskQuestion) continue;
			if (un(tp.drawPaths)) continue;
			for (var o = 0; o < tp.drawPaths.length; o++) {
				var drawPath = tp.drawPaths[o];
				if (un(drawPath.created)) continue;
				tp.drawPaths.splice(o,1);
				o--;
			}
		}
		
		
		/*for (var p = draw.path.length - 1; p >= 0; p--) {
			var path = draw.path[p];
			if (taskQuestion !== false && path._taskQuestion !== taskQuestion) continue;
			if (path._deletable == false) continue;
			draw.path.splice(p, 1);
		}
		var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(draw.path,true);
		for (var t = 0; t < tracingPapers.length; t++) {
			var tp = tracingPapers[t];
			if (taskQuestion !== false && tp._path._taskQuestion !== taskQuestion) continue;
			delete tp.drawPaths;
		}*/
	}
};
draw.buttonLineWidthPicker = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonLineWidthPicker',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		draw.path.push({
			obj: [{
					type: 'lineWidthSelect',
					left: 205 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: draw.lineWidthSelect.click,
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonColorPicker.draw(ctx, {
			type: 'buttonLineWidthPicker',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		var color = draw.buttonColor;
		if (draw.lineWidthSelectVisible == true) color = draw.buttonSelectedColor;
		if (obj._disabled == true) color = colorA(color, 0.35);
		var color2 = '#000';
		if (obj._disabled == true) color2 = colorA('#000', 0.35);
		roundedRect(ctx, 0, 0, 55, 55, 8, 0.01, color, color);
		roundedRect(ctx, 1.5, 1.5, 52, 52, 8, 3, color2);
		ctx.strokeStyle = color2;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(10, 12);
		ctx.lineTo(45, 12);
		ctx.stroke();
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(10.5, 20);
		ctx.lineTo(44.5, 20);
		ctx.stroke();
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(11, 29);
		ctx.lineTo(44, 29);
		ctx.stroke();
		ctx.lineWidth = 7;
		ctx.beginPath();
		ctx.moveTo(11.5, 39);
		ctx.lineTo(43.5, 39);
		ctx.stroke();
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		if (obj._disabled == true) {
			//Notifier.notify('Please subscribe to use this feature.', '', '/Images/logoSmall.PNG');
		} else {
			draw.lineWidthSelectVisible = !draw.lineWidthSelectVisible;
			drawCanvasPaths();
		}
	}
};
draw.buttonText = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonText',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonClear.draw(ctx, {
			type: 'buttonText',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		var buttonColor = draw.buttonColor;
		if (draw.drawMode === 'interactText') {
			var buttonFont = !un(obj.font) ? obj.font : 'Arial';
			var selectedFont = !un(draw._interactTextFont) ? draw._interactTextFont : 'Arial';
			if (buttonFont === selectedFont) {
				buttonColor = draw.buttonSelectedColor;
			}
		}
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', buttonColor);

		ctx.strokeStyle = '#000';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		ctx.lineWidth = 4;
		text({
			ctx: ctx,
			rect:[0,0,55,55],
			align:[0,0],
			font:!un(obj.font) ? obj.font : 'Arial',
			fontSize:28,
			color:!un(obj.color) ? obj.color : draw.color,
			text: ['Aa']
		});
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		if (draw.drawMode === 'interactText') {
			var buttonFont = !un(obj.font) ? obj.font : 'Arial';
			var selectedFont = !un(draw._interactTextFont) ? draw._interactTextFont : 'Arial';
			if (buttonFont !== selectedFont) {
				draw._interactTextFont = buttonFont;
			} else {
				changeDrawMode();
			}
		} else {
			changeDrawMode('interactText');
			draw._interactTextFont = !un(obj.font) ? obj.font : 'Arial';
		}
		drawCanvasPaths();
	}
}
draw.icons = {
	point:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.color)) options.color = '#00F';
		if (un(options.radius)) options.radius = w*0.15;
		ctx.save();
		ctx.translate(l, t);
		ctx.fillStyle = options.color;
		ctx.beginPath();
		ctx.arc(w/2,w/2,options.radius,0,2*Math.PI);
		ctx.fill();
		ctx.restore();
	},
	line:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.color)) options.color = '#00F';
		if (un(options.lineWidth)) options.lineWidth = 0.08*w;
		ctx.save();
		ctx.translate(l, t);
		ctx.strokeStyle = options.color;
		ctx.lineWidth = options.lineWidth;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		if (!un(options.dash)) ctx.setLineDash(options.dash);
		ctx.beginPath();
		ctx.moveTo(0.22*w, 0.36*w);
		ctx.lineTo(0.78*w, 0.64*w);
		ctx.stroke();
		if (!un(options.dash)) ctx.setLineDash([]);
		ctx.restore();
	},
	arc:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.color)) options.color = '#00F';
		if (un(options.lineWidth)) options.lineWidth = 0.08*w;
		if (un(options.radius)) options.radius = w*0.3;
		if (un(options.startAngle)) options.startAngle = 0;
		if (un(options.finAngle)) options.finAngle = 5.133;
		if (un(options.clockwise)) options.clockwise = false;
		ctx.save();
		ctx.translate(l, t);
		ctx.strokeStyle = options.color;
		ctx.lineWidth = options.lineWidth;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();
		if (!un(options.dash)) ctx.setLineDash(options.dash);
		if (options.clockwise === true) {
			ctx.arc(w/2, w/2, options.radius, options.startAngle, options.finAngle);
		} else {
			ctx.arc(w/2, w/2, options.radius, options.finAngle, options.startAngle);
		}
		ctx.stroke();
		if (!un(options.dash)) ctx.setLineDash([]);
		ctx.restore();		
	},
	compassArc:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.color)) options.color = '#00F';
		if (un(options.lineWidth)) options.lineWidth = 0.08*w;
		if (un(options.radius)) options.radius = w*0.3;
		if (un(options.startAngle)) options.startAngle = 0;
		if (un(options.cwFinAngle)) options.cwMaxAngle = 5.133;
		if (un(options.acwFinAngle)) options.acwMaxAngle = 0;
		ctx.save();
		ctx.translate(l, t);
		ctx.strokeStyle = options.color;
		ctx.lineWidth = options.lineWidth;
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function () {};
		if (typeof options.dash !== 'undefined') ctx.setLineDash(options.dash);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		if (options.cwFinAngle !== options.startAngle) {
			ctx.beginPath();
			if (options._initialDirection === 'acw' && options.dash instanceof Array) ctx.lineDashOffset = options.dash[0];
			ctx.arc(w/2, w/2, options.radius, options.startAngle, options.cwFinAngle);
			ctx.stroke();
			ctx.lineDashOffset = 0;
		}
		if (options.acwFinAngle !== options.startAngle) { 
			ctx.beginPath();
			if (options._initialDirection === 'cw' && options.dash instanceof Array) ctx.lineDashOffset = options.dash[0];
			ctx.arc(w/2, w/2, options.radius, options.startAngle, options.acwFinAngle, true);
			ctx.stroke();
			ctx.lineDashOffset = 0;
		}
		ctx.setLineDash([]);
		ctx.restore();
	},
	compass:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.color)) options.color = '#00F';
		ctx.save();
		ctx.translate(l, t);
		
		var center1 = [0.27*w, 0.82*w];
		var center2 = [0.47*w, 0.27*w];
		var center3 = [0.73*w, 0.82*w];
		var armLength = Math.sqrt(Math.pow(0.5 * (center3[0] - center1[0]), 2) + Math.pow(center2[1] - center1[1], 2));

		var angle2 = -0.5 * Math.PI - Math.atan((center2[1] - center1[1]) / (center2[0] - center1[0]));
		var angle3 = 0.5 * Math.PI - Math.atan((center3[1] - center2[1]) / (center3[0] - center2[0]));

		// draw pointy arm
		ctx.translate(center2[0], center2[1]);
		ctx.rotate(-angle2);

		roundedRect(ctx, -0.04*w, 0, 0.07*w, armLength - 0.09*w, 0.02*w, 0.02*w, '#000', '#99F');

		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.01*w;
		ctx.beginPath();
		ctx.moveTo(-0.02*w, armLength - 0.09*w);
		ctx.lineTo(0, armLength);
		ctx.lineTo(0.02*w, armLength - 0.09*w);
		ctx.lineTo(-0.02*w, armLength - 0.09*w);
		ctx.stroke();
		//ctx.fillStyle = '#333';
		//ctx.fill();

		ctx.rotate(angle2);
		ctx.translate(-center2[0], -center2[1]);

		//draw pencil
		ctx.beginPath();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 0.02*w;
		ctx.moveTo(0.73*w, 0.82*w);
		ctx.lineTo(0.69*w, 0.76*w);
		ctx.lineTo(0.69*w, 0.45*w);
		ctx.lineTo(0.76*w, 0.45*w);
		ctx.lineTo(0.76*w, 0.76*w);
		ctx.lineTo(0.73*w, 0.82*w);
		ctx.stroke();
		if (options.color == '#000') {
			ctx.fillStyle = '#FC3';
		} else {
			ctx.fillStyle = options.color;
		}
		ctx.fill();
		
		ctx.beginPath();
		ctx.moveTo(0.73*w, 0.82*w);
		ctx.lineTo(0.69*w, 0.76*w);
		ctx.lineTo(0.76*w, 0.76*w);
		ctx.lineTo(0.73*w, 0.82*w);
		ctx.stroke();
		ctx.fillStyle = '#FFC';
		ctx.fill();
			
		ctx.beginPath();
		if (options.color == '#000') {
			ctx.fillStyle = '#FC3';
		} else {
			ctx.fillStyle = options.color;
		}
		ctx.moveTo(0.73*w, 0.82*w);
		ctx.lineTo(0.72*w, 0.80*w);
		ctx.lineTo(0.74*w, 0.83*w);
		ctx.lineTo(0.73*w, 0.82*w);
		ctx.fill();
		ctx.stroke();

		ctx.strokeRect(0.8*w, 0.27*w + armLength * 0.5, 0.02*w, 0.09*w);

		// draw pencil arm
		ctx.translate(center2[0], center2[1]);
		ctx.rotate(-angle3);

		var pAngle = Math.PI / 14;

		ctx.beginPath();
		ctx.moveTo(-0.04*w, 0);
		ctx.lineTo(0.04*w, 0);
		ctx.lineTo(0.04*w, armLength * 0.7);
		ctx.lineTo(0.11*w, armLength * 0.7);
		ctx.lineTo(0.11*w, armLength * 0.7 + 0.07*w);
		ctx.lineTo(-0.04*w, armLength * 0.7);
		ctx.lineTo(-0.04*w, 0);
		ctx.stroke();
		ctx.fillStyle = '#99F';
		ctx.fill();
		
		ctx.fillRect(0.12*w, armLength * 0.5 - 0.01*w, 0.02*w, 0.09*w);
		
		ctx.rotate(angle3);
		ctx.translate(-center2[0], -center2[1]);

		// draw top of compass
		ctx.translate(center2[0], center2[1]);

		roundedRect(ctx, -0.05*w, -0.05*w, 0.09*w, 0.13*w, 0.02*w, 0.02*w, '#000', '#000');
		roundedRect(ctx, -0.02*w, -0.11*w, 0.04*w, 0.05*w, 0, 0.02*w, '#000', '#000');
		ctx.fillStyle = '#CCC';
		ctx.beginPath();
		ctx.arc(0, 0, 0.02*w, 0, 2 * Math.PI);
		ctx.fill();
		ctx.restore();
	},
	protractor:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.fillColor)) options.fillColor = '#CCF';
		ctx.save();
		ctx.translate(l, t);
		ctx.lineWidth = 1*w/55;
		ctx.strokeStyle = '#000';
		ctx.beginPath();
		ctx.moveTo(46.5*w/55, 35.5*w/55);
		ctx.lineTo(46.5*w/55, 37.5*w/55);
		ctx.lineTo(8.5*w/55, 37.5*w/55);
		ctx.lineTo(8.5*w/55, 34.5*w/55);
		ctx.arc(27.5*w/55, 34.5*w/55, 19*w/55, Math.PI, 2 * Math.PI);
		ctx.stroke();
		ctx.fillStyle = options.fillColor;
		ctx.fill();
		for (var i = 0; i < 7; i++) {
			ctx.moveTo(27.5*w/55 + 4*w/55 * Math.cos((1 + i / 6) * Math.PI), 34.5*w/55 + 4*w/55 * Math.sin((1 + i / 6) * Math.PI));
			ctx.lineTo(27.5*w/55 + 16*w/55 * Math.cos((1 + i / 6) * Math.PI), 34.5*w/55 + 16*w/55 * Math.sin((1 + i / 6) * Math.PI))
		}
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(27.5*w/55, 34.5*w/55, 15*w/55, Math.PI, 2 * Math.PI);
		for (var i = 0; i < 19; i++) {
			ctx.moveTo(27.5*w/55 + 17*w/55 * Math.cos((1 + i / 18) * Math.PI), 34.5*w/55 + 17*w/55 * Math.sin((1 + i / 18) * Math.PI));
			ctx.lineTo(27.5*w/55 + 19*w/55 * Math.cos((1 + i / 18) * Math.PI), 34.5*w/55 + 19*w/55 * Math.sin((1 + i / 18) * Math.PI))
		}
		ctx.moveTo(27.5*w/55, 34.5*w/55);
		ctx.lineTo(27.5*w/55, 30.5*w/55);
		ctx.moveTo(23.5*w/55, 34.5*w/55);
		ctx.lineTo(31.5*w/55, 34.5*w/55);
		ctx.stroke();
		ctx.restore();
	},
	ruler:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.fillColor)) options.fillColor = '#CCF';
		ctx.save();
		ctx.translate(l, t);
		roundedRect(ctx, 7.5*w/55, 22.5*w/55, 40*w/55, 10*w/55, 3*w/55, 1*w/55, '#000', options.fillColor);
		ctx.lineWidth = 1*w/55;
		ctx.strokeStyle = '#000';
		ctx.beginPath();
		for (var i = 0; i < 11; i++) {
			ctx.moveTo(9.5*w/55 + i * ((36*w/55) / 10), 22.5*w/55);
			ctx.lineTo(9.5*w/55 + i * ((36*w/55) / 10), 26.5*w/55);
		}
		ctx.stroke();
		ctx.restore();
	},
	pen:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.color)) options.color = '#00F';
		ctx.save();
		ctx.translate(l, t);
		ctx.fillStyle = options.color;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		ctx.translate(w/2, w/2);
		ctx.rotate(Math.PI / 4);
		ctx.fillRect(-0.09*w, -0.2*w, 0.18*w, 0.36*w);
		ctx.fillRect(-0.09*w, -0.33*w, 0.18*w, 0.09*w);
		ctx.beginPath();
		ctx.moveTo(-0.09*w, 0.2*w);
		ctx.lineTo(0, 0.33*w);
		ctx.lineTo(0.09*w, 0.2*w);
		ctx.lineTo(-0.09*w, 0.2*w);
		ctx.fill();
		
		ctx.restore();
	},
	eraser:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		ctx.save();
		ctx.translate(l, t);
		
		ctx.beginPath();
		ctx.moveTo(0.18*w,0.73*w);
		ctx.lineTo(0.72*w,0.73*w);
		ctx.stroke();

		ctx.translate(w/2, w/2);
			ctx.rotate(-Math.PI/4);
		ctx.translate(-w/2, -w/2);
		
		roundedRect(ctx, 0.27*w, 0.4*w, 0.45*w, 0.2*w, 0.07*w, 0.04*w, '#000', '#FEE');
		ctx.strokeStyle = '#000';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.lineWidth = 0.02*w;
		ctx.beginPath();
		ctx.moveTo(0.4*w,0.4*w);
		ctx.lineTo(0.4*w,0.6*w);
		ctx.stroke();
		
		ctx.restore();		
	},
	text:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.font)) options.font = 'Arial';
		if (un(options.fontSize)) options.fontSize = 0.51*w;
		if (un(options.color)) options.color = '#00F';
		if (un(options.bold)) options.bold = false;
		if (un(options.italic)) options.italic = false;
		if (un(options.fracScale)) options.fracScale = 0.7;
		if (un(options.algPadding)) options.algPadding = 4;
		if (un(options.text)) options.text = ['Aa'];
		ctx.save();
		text({
			ctx: ctx,
			rect:[l,t,w,w],
			align:[0,0],
			font:options.font,
			fontSize:options.fontSize,
			color:options.color,
			bold:options.bold,
			italic:options.italic,
			fracScale:options.fracScale,
			algPadding:options.algPadding,
			text:options.text
		});
		ctx.restore();	
	},
	gear:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.lineColor)) options.lineColor = '#666';
		if (un(options.lineWidth)) options.lineWidth = 0.015*w;
		if (un(options.fillColor)) options.fillColor = '#CCC';
		if (un(options.r1)) options.r1 = w*0.12;
		if (un(options.r2)) options.r2 = w*0.2;
		if (un(options.r3)) options.r3 = w*0.26;
		ctx.save();
		ctx.translate(l+w/2, t+w/2);
		
		ctx.fillStyle = options.fillColor;
		ctx.strokeStyle = options.lineColor;
		ctx.lineWidth = options.lineWidth;
		ctx.beginPath();
		
		var a = -Math.PI/16;
		ctx.moveTo(options.r2*Math.cos(a), options.r2*Math.sin(a));
		for (var i = 0; i < 8; i++) {
			ctx.lineTo(options.r3*Math.cos(a), options.r3*Math.sin(a));
			ctx.arc(0,0,options.r3,a,a+Math.PI/8);
			a += Math.PI/8;
			ctx.lineTo(options.r2*Math.cos(a), options.r2*Math.sin(a));
			ctx.arc(0,0,options.r2,a,a+Math.PI/8);
			a += Math.PI/8;
		}
		ctx.moveTo(options.r1, 0);
		ctx.arc(0,0,options.r1,0,2*Math.PI,true);
		ctx.fill();
		ctx.stroke();
		
		ctx.restore();	
	},
	eye:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.lineColor)) options.lineColor = '#666';
		if (un(options.lineWidth)) options.lineWidth = 0.02*w;
		
		ctx.save();
		ctx.translate(l+w/2, t+w/2);
		var x = 0.3*w;
		var a = 55*Math.PI/180;
		var y = x/Math.tan(a);
		var r = x/Math.sin(a);
		
		ctx.strokeStyle = options.lineColor;
		ctx.lineWidth = options.lineWidth;
		
		ctx.beginPath();
		ctx.moveTo(x,0);
		ctx.arc(0,-y,r,0.5*Math.PI-a,0.5*Math.PI+a);
		ctx.arc(0,y,r,1.5*Math.PI-a,1.5*Math.PI+a);
		ctx.moveTo(r-y,0);
		ctx.arc(0,0,r-y,0*Math.PI,2*Math.PI);
		ctx.stroke();
		
		ctx.fillStyle = options.lineColor;		
		r = (r-y)/2;
		ctx.beginPath();
		ctx.moveTo(r,0);
		ctx.arc(0,0,r,0,2*Math.PI);
		ctx.fill();
		
		if (options.cross === true) {
			ctx.strokeStyle = '#F00';
			ctx.lineWidth = options.lineWidth*2;
			ctx.beginPath();
			ctx.moveTo(-w*0.3,-w*0.3);
			ctx.lineTo(w*0.3,w*0.3);
			ctx.stroke();
		}
		
		ctx.restore();	
	},
	lineDash:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.dash)) options.dash = [4,4];
		if (un(options.lineColor)) options.lineColor = '#000';
		if (un(options.lineWidth)) options.lineWidth = 0.04*w;
		
		ctx.save();
		ctx.translate(l+w/2, t+w/2);
		ctx.strokeStyle = options.lineColor;
		ctx.lineWidth = options.lineWidth;
		ctx.setLineDash(options.dash);
		ctx.beginPath();
		ctx.moveTo(-w*0.3,0);
		ctx.bezierCurveTo(-w*0.1, -w*0.6, w*0.1, w*0.6, w*0.3, 0);
		ctx.stroke();
		ctx.restore();
	},
	blankRect:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.lineColor)) options.lineColor = '#000';
		if (un(options.lineWidth)) options.lineWidth = 0.02*w;
		ctx.save();
		ctx.translate(l+w/2, t+w/2);
		ctx.strokeStyle = options.lineColor;
		ctx.lineWidth = options.lineWidth;
		ctx.strokeRect(-w*0.35,-w*0.25,w*0.7,w*0.5);
		ctx.restore();
	},
	simpleGrid:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.lineColor)) options.lineColor = '#000';
		if (un(options.lineWidth)) options.lineWidth = 0.02*w;
		ctx.save();
		ctx.translate(l+w/2, t+w/2);
		ctx.strokeStyle = options.lineColor;
		ctx.lineWidth = options.lineWidth;
		ctx.strokeRect(-w*0.35,-w*0.25,w*0.7,w*0.5);
		ctx.beginPath();
		ctx.moveTo(-w*0.35,0);
		ctx.lineTo(w*0.35,0);
		ctx.moveTo(-w*0.35+w*(0.7/3),-w*0.25);
		ctx.lineTo(-w*0.35+w*(0.7/3),w*0.25);
		ctx.moveTo(-w*0.35+w*(1.4/3),-w*0.25);
		ctx.lineTo(-w*0.35+w*(1.4/3),w*0.25);
		ctx.stroke();
		ctx.restore();
	},
	dotGrid:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.color)) options.color = '#000';
		if (un(options.radius)) options.radius = 0.02*w;
		ctx.save();
		ctx.translate(l+w/2, t+w/2);
		ctx.fillStyle = options.color;
		var y = -w*0.25;
		for (var r = 0; r < 3; r++) {
			var x = -w*0.35;
			for (var c = 0; c < 4; c++) {
				ctx.beginPath();
				ctx.arc(x,y,options.radius,0,2*Math.PI);
				ctx.fill();
				x += w*(0.7/3);
			}
			y += w*0.25;
		}
		ctx.restore();
	},
	isoDotGrid:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.color)) options.color = '#000';
		if (un(options.radius)) options.radius = 0.02*w;
		ctx.save();
		ctx.translate(l+w/2, t+w/2);
		ctx.fillStyle = options.color;
		var y = -w*0.25;
		for (var r = 0; r < 3; r++) {
			var x = -w*0.35;
			if (r % 2 === 0) x += w*(0.7/6);
			for (var c = 0; c < 4; c++) {
				ctx.beginPath();
				ctx.arc(x,y,options.radius,0,2*Math.PI);
				ctx.fill();
				x += w*(0.7/3);
				if (r % 2 === 0 && c === 2) break;
			}
			y += w*0.25;
		}
		ctx.restore();
	},
	image:function(ctx,l,t,w,options) {
		if (un(options)) options = {};
		if (un(options.color)) options.color = '#000';
		if (un(options.lineWidth)) options.lineWidth = 0.02*w;
		ctx.save();
		var g = w/20;
		ctx.translate(l+g*2, t+g*4);
		text({ctx:ctx,rect:[0,0,16*g,12*g],text:[''],box:{type:'loose',borderColor:options.color,borderWidth:options.lineWidth,radius:2*g,color:'none'}});
		ctx.fillStyle = options.color;
		ctx.beginPath();
		ctx.moveTo(2*g,10*g);
		ctx.lineTo(2*g,8*g);
		ctx.lineTo(5*g,5*g);
		ctx.lineTo(7*g,7*g);
		ctx.lineTo(11*g,3*g);
		ctx.lineTo(14*g,6*g);
		ctx.lineTo(14*g,10*g);
		ctx.lineTo(2*g,10*g);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(3.8*g,3.3*g,1.5*g,0,2*Math.PI);
		ctx.fill();
		ctx.restore();
	}
}
draw.objList = {
	visible:true,
	resizable: false,
	drawToolsButton:true,
	getCursorPositionsInteract:function(obj) {
		return !un(obj._cursorPos) ? obj._cursorPos : [];
	},
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'objList',
					rect: [150 - draw.drawRelPos[0],150 - draw.drawRelPos[1],200,400],
					itemHeight: 50,
					interact: {
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return obj.rect;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
	},
	draw: function (ctx, obj, path) {
	},
	drawOverlay: function (ctx, obj, path) {
		obj._cursorPos = [];
		if (draw.mode == 'interact' && draw.objList.visible == false) return;
		if (draw.mode !== 'interact' && path.selected !== true) return;

		var objs = draw.objList.getObjs();
		
		var x = obj.rect[0];
		var y = obj.rect[1];
		var h = obj.itemHeight;
		var w = 0;
		
		var itemsToShow = Math.round(obj.rect[3]/obj.itemHeight);
		var maxStartItem = Math.max(0, objs.length-itemsToShow);
		var startItem = 0;
		
		if (maxStartItem > 0) {
			if (un(obj._scrollBar)) {
				obj._scrollBar = {
					type:'verticalScrollBar',
					left:obj.rect[0]+obj.rect[2]-25,
					top:obj.rect[1]+h,
					width:25,
					height:obj.rect[3]-h,
					buttonHeight:25,
					backColor:'#EEE',
					buttonColor:'#DEDEDE',
					markerColor:'#AAA',
					borderColor:'#000',
					borderWidth:1
				};
			}
			if (obj._scrollBar.scrollMax !== objs.length) {
				obj._scrollBar.scrollMax = objs.length;
				obj._scrollBar.scrollView = Math.max(0,objs.length-maxStartItem);
				obj._scrollBar.value = maxStartItem;
			}
			draw.verticalScrollbar.draw(ctx,obj._scrollBar);
			obj._cursorPos = obj._cursorPos.concat(obj._scrollBar._cursorPositions);
			startItem = obj._scrollBar.value;
		}

		if (obj.expanded === true) {
			x += (maxStartItem === 0 ? 25 : 0);
			w = 4*h + (maxStartItem > 0 ? 25 : 0);
			ctx.fillStyle = '#C9F';
			ctx.fillRect(x,y,w,h);
			ctx.fillStyle = '#000';
			ctx.beginPath();
			ctx.moveTo(x+h*0.4,y+h*0.35);
			ctx.lineTo(x+h*0.6,y+h*0.5);
			ctx.lineTo(x+h*0.4,y+h*0.65);
			ctx.lineTo(x+h*0.4,y+h*0.35);
			ctx.fill();
			text({ctx:ctx,rect:[x+h,y,w-h,h],align:[-1,0],text:['Objects'],italic:true,fontSize:20});
			obj._cursorPos.push({
				shape: 'rect',
				dims: [x,y,w,h],
				cursor: draw.cursors.pointer,
				func: draw.objList.expand,
				obj: obj,
				hideConstructionToolBackgroundsDiv:false
			});
		} else {
			x += 3*h+(maxStartItem === 0 ? 25 : 0);
			w = h + (maxStartItem > 0 ? 25 : 0);
			ctx.fillStyle = '#C9F';
			ctx.fillRect(x,y,w,h);
			ctx.fillStyle = '#000';
			ctx.beginPath();
			ctx.moveTo(x+h*0.35,y+h*0.4);
			ctx.lineTo(x+h*0.5,y+h*0.6);
			ctx.lineTo(x+h*0.65,y+h*0.4);
			ctx.lineTo(x+h*0.35,y+h*0.4);
			ctx.fill();
			obj._cursorPos.push({
				shape: 'rect',
				dims: [x,y,w,h],
				cursor: draw.cursors.pointer,
				func: draw.objList.expand,
				obj: obj,
				hideConstructionToolBackgroundsDiv:false
			});
		}
		y += h;
		
		ctx.fillStyle = '#FFF';
		ctx.fillRect(x,y,w,obj.rect[3]-h);

		var editObj;
		
		for (var i = startItem; i < Math.min(objs.length,startItem+itemsToShow); i++) {
			var obj2 = objs[i];

			var color = obj2.color || '#00F';
			var lineWidth = obj2.lineWidth || obj2.radius || 2;
			
			var x2 = x;

			var color2 = color === 'none' ? '#CCC' : color;
			
			if (obj2._highlight === true || (obj2._background === true && !un(draw.constructionsToolBackgrounds.div) && draw.constructionsToolBackgrounds.div.parentNode === draw.div.pageDiv)) {
				ctx.fillStyle = '#FF0';
				ctx.fillRect(x2,y,obj.expanded === true ? 4*h : h,h);
			}
			
			if (obj.expanded === true) {
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#CCC';
				ctx.beginPath();
				ctx.moveTo(x2+h,y);
				ctx.lineTo(x2+h,y+h);
				if (obj2._background !== true) {
					ctx.moveTo(x2+h*2,y);
					ctx.lineTo(x2+h*2,y+h);
					ctx.moveTo(x2+h*3,y);
					ctx.lineTo(x2+h*3,y+h);
				}
				ctx.stroke();
			}
			
			var type = obj2.type === 'text2' ? 'text' : obj2.type;
			if (type === 'simpleGrid' && obj2.dots === true) type = 'dotGrid';
			if (['compass2','protractor2','ruler2'].indexOf(type) > -1) type = type.slice(0,-1);
			var options = {};
			switch (type) {
				case 'point':
					options.color = obj2.color;
					options.radius = obj2.radius;
					break;
				case 'line':
					options.color = obj2.color;
					options.lineWidth = obj2.thickness*0.5;
					options.dash = obj2.dash instanceof Array ? [obj2.dash[0]*0.3, obj2.dash[1]*0.3] : [];
					break;
				case 'arc':
					options.color = obj2.color;
					options.lineWidth = obj2.thickness*0.5;
					options.dash = obj2.dash instanceof Array ? [obj2.dash[0]*0.3, obj2.dash[1]*0.3] : [];
					options.startAngle = obj2.startAngle;
					options.finAngle = obj2.finAngle;
					options.clockwise = obj2.clockwise;					
					break;
				case 'compassArc':
					options.color = obj2.color;
					options.lineWidth = obj2.thickness*0.5;
					options.radius = h*0.3;
					options.dash = obj2.dash instanceof Array ? [obj2.dash[0]*0.3, obj2.dash[1]*0.3] : [];
					options.startAngle = obj2.startAngle;
					options.cwFinAngle = obj2.cwFinAngle;
					options.acwFinAngle = obj2.acwFinAngle;
					options._initialDirection = obj2._initialDirection;
					break;
				case 'compass':
					options.color = obj2.color;
					break;
				case 'pen':
					options.color = obj2.color;
					break;
				case 'eraser':
					break;
				case 'text':
					options.color = obj2.color;
					options.font = obj2.font;
					options.fracScale = obj2.fracScale;
					options.algPadding = obj2.algPadding;
					if (obj2.text.length === 1 && typeof obj2.text[0] === 'string' && obj2.text[0].length > 0 && obj2.text[0].length < 3) {
						options.text = obj2.text;
					} else {
						options.text = ['Aa'];
					}
					break;
				case 'blankRect':
				case 'simpleGrid':
					options.color = '#666';
					options.lineWidth = 1;
					break;
				case 'dotGrid':
				case 'isoDotGrid':
					options.color = '#666';
					options.radius = 1.3;
					break;
				case 'image':
					options.color = '#333';
					options.lineWidth = 1.5;
					break;
				case 'protractor':
				case 'ruler':
					options.fillColor = '#DDF';
					break;
					
			}
			if (type === 'image' && !un(draw.constructionsToolBackgrounds.img) && draw.constructionsToolBackgrounds.img.naturalWidth !== 0 && draw.constructionsToolBackgrounds.img.naturalHeight !== 0) {
				var aspectRatio = draw.constructionsToolBackgrounds.img.naturalWidth / draw.constructionsToolBackgrounds.img.naturalHeight;
				if (aspectRatio > 1) {
					var imgWidth = h*0.8;
					var imgHeight = imgWidth / aspectRatio;
				} else {
					var imgHeight = h*0.8;
					var imgWidth = imgHeight * aspectRatio;
					
				}
				ctx.drawImage(draw.constructionsToolBackgrounds.img,x2+h*0.5-imgWidth*0.5,y+h*0.5-imgHeight*0.5,imgWidth,imgHeight);
			} else if (typeof draw.icons[type] === 'function') {
				draw.icons[type](ctx,x2,y,h,options);
			}
			obj._cursorPos.push({
				buttonType: '',
				shape: 'rect',
				dims: [x2, y, h, h],
				cursor: draw.cursors.pointer,
				func: obj2._background === true ? draw.constructionsToolBackgrounds.toggleDiv : draw.objList.itemClick,
				obj: obj,
				item: obj2
			});
		
			if (obj.expanded !== true) {
				y += h;
				continue;
			}
						
			x2 += h;
			if (obj2._background === true) {
				text({ctx:ctx,rect:[x2,y,h*3,h],align:[0,0],text:['Select'+br+'background'],fontSize:14,color:'#333',italic:true});
				obj._cursorPos.push({
					buttonType: '',
					shape: 'rect',
					dims: [x2, y, h*3, h],
					cursor: draw.cursors.pointer,
					func: draw.constructionsToolBackgrounds.toggleDiv,
					obj: obj,
					item: obj2
				});
			} else {
				if (['compass','protractor','ruler'].indexOf(type) > -1) {
					var visible = obj2[type+'Visible'];
				} else {
					var visible = un(obj2._path) || obj2._path.vis !== false;
				}
				draw.icons.eye(ctx,x2+4,y+4,h-8,{cross:visible === false});
				obj._cursorPos.push({
					buttonType: '',
					shape: 'rect',
					dims: [x2, y, h, h],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemToggleVisible,
					obj: obj,
					item: obj2
				});
				
				x2 += h;
				if (['compass2'].indexOf(obj2.type) === -1) {				
					if (obj2._objListEditObj === true && un(editObj)) {
						editObj = {obj:obj2,x:x,y:y+h};
						ctx.fillStyle = '#6FF';
						ctx.fillRect(x2,y,h,h);
					}
					draw.icons.gear(ctx,x2+5,y+5,h-10,{});
					obj._cursorPos.push({
						buttonType: '',
						shape: 'rect',
						dims: [x2, y, h, h],
						cursor: draw.cursors.pointer,
						func: draw.objList.itemEdit,
						obj: obj,
						item: obj2
					});
				} else {
					obj._cursorPos.push({
						buttonType: '',
						shape: 'rect',
						dims: [x2, y, h, h],
						cursor: draw.cursors.default,
						func: function() {},
						obj: obj,
						item: obj2
					});
				}
				
				x2 += h;
				drawCross(ctx,h*0.4,h*0.4,'#F00',x2+h*0.3,y+h*0.3,3);
				obj._cursorPos.push({
					buttonType: '',
					shape: 'rect',
					dims: [x2, y, h, h],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemDelete,
					obj: obj,
					item: obj2
				});
			}
			y += h;
		}
		
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.strokeRect(x,obj.rect[1],w,obj.rect[3]);
		
		y = obj.rect[1]+h;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(x+w,y);
		for (var i = startItem; i < Math.min(objs.length,startItem+itemsToShow); i++) {
			y += h;
			ctx.moveTo(x,y);
			ctx.lineTo(x+w,y);
		}
		ctx.stroke();
		
		if (typeof editObj === 'object') {
			var obj2 = editObj.obj;
			var left = editObj.x-5;
			var top = editObj.y+10;
							
			var width = h;
			var height = h*4+20+(obj2.type === 'text2' ? 20 : obj2.type === 'point' ? 0 : 10);
			if (obj2.type === 'protractor2') height = 160;
			if (obj2.type === 'ruler2') height = 110;
			if (obj2.type === 'eraser') height = 180;
			var cols = 2;
			var rect = [left-10,top-10,h*4+20+10,height];
			roundedRect(ctx,rect[0],rect[1],rect[2],rect[3],10,3,'#000','#C9F');
			obj._cursorPos.push({
				shape: 'rect',
				dims: rect,
				cursor: draw.cursors.default,
				func: function() {}
			});
						
			if (['line','pen','arc','compassArc'].indexOf(obj2.type) > -1) {
				drawColorPicker(left,top);
				ctx.lineJoin = 'round';
				ctx.lineCap = 'round';
				for (var i = 0; i < 3; i++) {
					ctx.fillStyle = obj2.thickness === 2*i+3 ? '#CFF' : '#FFC';
					ctx.strokeStyle = '#000';
					ctx.lineWidth = 1;
					ctx.fillRect(left+90, top+40*i, 80, 40);
					ctx.strokeRect(left+90, top+40*i, 80, 40);
					ctx.beginPath();
					ctx.lineWidth = 2*i+3; 
					ctx.moveTo(left+90+15, top+40*i+20);
					ctx.lineTo(left+90+65, top+40*i+20);
					ctx.stroke();
					obj._cursorPos.push({
						shape: 'rect',
						dims: [left+90, top+40*i, 80, 40],
						cursor: draw.cursors.pointer,
						func: draw.objList.itemSetProperty,
						obj: obj2,
						key:'thickness',
						value:2*i+3
					});
				}
				
				ctx.fillStyle = obj2.dash instanceof Array && obj2.dash.length === 2 ? '#FFC' : '#CFF';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(left+90, top+130, 40, 40);
				ctx.strokeRect(left+90, top+130, 40, 40);
				draw.icons.lineDash(ctx,left+90,top+130,40,{dash:[]});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [left+90, top+130, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'dash',
					value: []
				});
					
				ctx.fillStyle = obj2.dash instanceof Array && obj2.dash.length === 2 ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(left+130, top+130, 40, 40);
				ctx.strokeRect(left+130, top+130, 40, 40);
				draw.icons.lineDash(ctx,left+130,top+130,40,{});
				var dashLength = 15;
				if (obj2.type === 'compassArc') {
					var circumference = 2*Math.PI*obj2.radius;
					var dashCount = Math.round(circumference / (2 * dashLength));
					if (dashCount > 0) dashLength = (circumference / dashCount) / 2;
				}
				obj._cursorPos.push({
					shape: 'rect',
					dims: [left+130, top+130, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'dash',
					value: [dashLength,dashLength]
				});
			} else if (obj2.type === 'point') {
				drawColorPicker(left,top)
				for (var i = 0; i < 3; i++) {
					var radius = i*3+4.5;
					ctx.fillStyle = obj2.radius === radius ? '#CFF' : '#FFC';
					ctx.strokeStyle = '#000';
					ctx.lineWidth = 1;
					ctx.fillRect(left+110, top+20+40*i, 40, 40);
					ctx.strokeRect(left+110, top+20+40*i, 40, 40);
					ctx.beginPath();
					ctx.fillStyle = '#000';
					ctx.arc(left+110+20, top+20+40*i+20, radius, 0, 2*Math.PI);
					ctx.fill();
					obj._cursorPos.push({
						shape: 'rect',
						dims: [left+110, top+20+40*i, 40, 40],
						cursor: draw.cursors.pointer,
						func: draw.objList.itemSetProperty,
						obj: obj2,
						key: 'radius',
						value: radius
					});
				}
			} else if (obj2.type === 'text2') {
				drawColorPicker(left,top)
				var x = left+90;
				var y = top;
				
				ctx.fillStyle = '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 40, 40);
				ctx.strokeRect(x, y, 40, 40);
				draw.icons.text(ctx,x,y,40,{text:['A'],color:'#000',fontSize:0.5*h});
				ctx.fillStyle = '#666';
				ctx.beginPath();
				ctx.moveTo(x+0.68*h,y+0.15*h);
				ctx.lineTo(x+0.92*h,y+0.15*h);
				ctx.lineTo(x+0.8*h,y+0.3*h);
				ctx.lineTo(x+0.68*h,y+0.15*h);
				ctx.fill();
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x, y, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'fontSize',
					value: Math.max(obj2.fontSize-8,16)
				});
				
				x += 40;
				
				ctx.fillStyle = '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 40, 40);
				ctx.strokeRect(x, y, 40, 40);
				draw.icons.text(ctx,x,y,40,{text:['A'],color:'#000',fontSize:0.5*h});
				ctx.fillStyle = '#666';
				ctx.beginPath();
				ctx.moveTo(x+0.68*h,y+0.3*h);
				ctx.lineTo(x+0.92*h,y+0.3*h);
				ctx.lineTo(x+0.8*h,y+0.15*h);
				ctx.lineTo(x+0.68*h,y+0.3*h);
				ctx.fill();
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x, y, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'fontSize',
					value: Math.min(obj2.fontSize+8,48)
				});
				
				x -= 40;
				y += 50;
				
				ctx.fillStyle = obj2.bold === true ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 40, 40);
				ctx.strokeRect(x, y, 40, 40);
				draw.icons.text(ctx,x,y,40,{text:['B'],color:'#000',bold:true});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x, y, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'bold',
					value: obj2.bold === true ? false : true
				});
				
				x += 40;
				
				ctx.fillStyle = obj2.italic === true ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 40, 40);
				ctx.strokeRect(x, y, 40, 40);
				draw.icons.text(ctx,x,y,40,{text:['I'],color:'#000',font:'algebra',italic:true});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x, y, 40, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'italic',
					value: obj2.italic === true ? false : true
				});
				
				x -= 40;
				y += 50;
				
				ctx.fillStyle = obj2.font === 'Arial' ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 80, 40);
				ctx.strokeRect(x, y, 80, 40);
				text({ctx:ctx,rect:[x,y,80,40],text:['Arial'],font:'Arial',fontSize:20,align:[0,0]});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x, y, 80, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'font',
					value: 'Arial'
				});
				
				y += 40;
				
				ctx.fillStyle = obj2.font === 'algebra' ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 80, 40);
				ctx.strokeRect(x, y, 80, 40);
				text({ctx:ctx,rect:[x,y,80,40],text:['algebra'],font:'algebra',fontSize:20,align:[0,0]});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x, y, 80, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'font',
					value: 'algebra'
				});
			} else if (obj2.type === 'eraser') {
				var y = top;
				x = rect[0] + rect[2]/2 - 50;
				ctx.lineJoin = 'round';
				ctx.lineCap = 'round';
				for (var i = 0; i < 4; i++) {
					ctx.fillStyle = obj2.thickness === 3*(2*i+3) ? '#CFF' : '#FFC';
					ctx.strokeStyle = '#000';
					ctx.lineWidth = 1;
					ctx.fillRect(x, y+40*i, 100, 40);
					ctx.strokeRect(x, y+40*i, 100, 40);
					ctx.beginPath();
					ctx.lineWidth = 3*(2*i+3); 
					ctx.moveTo(x+25, y+40*i+20);
					ctx.lineTo(x+75, y+40*i+20);
					ctx.stroke();
					obj._cursorPos.push({
						shape: 'rect',
						dims: [x, y+40*i, 100, 40],
						cursor: draw.cursors.pointer,
						func: draw.objList.itemSetProperty,
						obj: obj2,
						key:'thickness',
						value:3*(2*i+3)
					});
				}
			} else if (obj2.type === 'compass2') {
				
			} else if (obj2.type === 'ruler2') {
				var y = top;
				y += 15;
				x = rect[0] + rect[2]/2 - 50;
				
				ctx.fillStyle = obj2.measure === 100 ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 100, 40);
				ctx.strokeRect(x, y, 100, 40);
				text({ctx:ctx,rect:[x,y,100,40],text:['Shorter'],font:'Arial',fontSize:20,align:[0,0]});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x, y, 100, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'measure',
					value: 100
				});
				
				y += 40;
				
				ctx.fillStyle = un(obj2.measure) || obj2.measure === 150 ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 100, 40);
				ctx.strokeRect(x, y, 100, 40);
				text({ctx:ctx,rect:[x,y,100,40],text:['Longer'],font:'Arial',fontSize:20,align:[0,0]});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x, y, 100, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'measure',
					value: 150
				});
				
				y += 60;
				x = rect[0] + 10;
			} else if (obj2.type === 'protractor2') {
				var y = top;
				y += 15;
				x = rect[0] + rect[2]/2 - 50;
				
				ctx.fillStyle = obj2.numbers !== false ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 100, 40);
				ctx.strokeRect(x, y, 100, 40);
				text({ctx:ctx,rect:[x,y,100,40],text:['Numbers'],font:'Arial',fontSize:20,align:[0,0]});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x, y, 100, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'numbers',
					value: true
				});
				
				y += 40;
				
				ctx.fillStyle = obj2.numbers === false ? '#CFF' : '#FFC';
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x, y, 100, 40);
				ctx.strokeRect(x, y, 100, 40);
				text({ctx:ctx,rect:[x,y,100,40],text:['Blank'],font:'Arial',fontSize:20,align:[0,0]});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x, y, 100, 40],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'numbers',
					value: false
				});
				
				y += 60;
				x = rect[0] + 10;
				
				var min = 150;
				var max = 500;
				var prop = (obj2.radius-min)/(max-min);
				var width = rect[2]-20;
				draw.slider.draw(ctx,{
					type: 'slider',
					left: x,
					top: y,
					width: width,
					radius: 10,
					value: prop,
					lineWidth: 4,
					color: '#000',
					fillColor: '#00F'
				});
				obj._cursorPos.push({
					shape: 'circle',
					dims: [x+prop*width, y, 20],
					cursor: draw.cursors.move1,
					func: draw.objList.itemSliderStart,
					obj: obj2,
					key: 'radius',
					left:x,
					width:width,
					min:min,
					max:max
				});
			}
		}
		function drawColorPicker(left,top) {
			var colors = ['#000', '#999', '#00F', '#F00', '#393', '#F0F', '#93C', '#F60'];
			for (var c = 0; c < colors.length; c++) {
				var col = c%cols;
				var row = Math.floor(c/cols);
				var x = left+col*h;
				var y = top+row*h+(obj2.type === 'text2' ? 10 : obj2.type === 'point' ? 0 : 5);
				var color = colors[c];
				var color2 = color === 'none' ? '#FFF' : color;
				text({
					ctx:ctx,
					rect:[x,y,h,h],
					text:[""],
					box:{
						type:'loose',
						color:color2,
						borderWidth:1,
						borderColor:'#000'
					}
				});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x,y,h,h],
					cursor: draw.cursors.pointer,
					func: draw.objList.itemSetProperty,
					obj: obj2,
					key: 'color',
					value: color
				});
			}
		}
	},
	getObjs:function() {
		var objs = draw.getObjs().filter(function(x) {return typeof x.created === 'number' || x._background === true;});
		if (objs.length === 0 || objs[0]._background !== true) objs.unshift({type:'blankRect',_background:true});
		for (var i = 0; i < 3; i++) {
			var tool = ['ruler','protractor','compass'][i];
			var obj = draw.objsOfType(tool+'2')[0];
			if (un(obj) || obj._opened !== true) continue;
			objs.splice(1,0,obj);
		}
		return objs;
	},
	expand:function() {
		draw.currCursor.obj.expanded = draw.currCursor.obj.expanded === true ? false : true;
		drawCanvasPaths();
	},
	itemClick:function() {
		var obj = draw.currCursor.item;
		if (obj._background === true) {
			draw.constructionsToolBackgrounds.toggleDiv();
		} else {
			obj._highlight = !obj._highlight;
		}
		var objs = draw.objList.getObjs();
		for (var i = 0; i < objs.length; i++) {
			if (objs[i] === obj) continue;
			delete objs[i]._highlight;
		}
		drawCanvasPaths();
	},
	itemToggleVisible:function() {
		var obj = draw.currCursor.item;
		if (['compass2','protractor2','ruler2'].indexOf(obj.type) > -1) {
			obj[obj.type.slice(0,-1)+'Visible'] = !obj[obj.type.slice(0,-1)+'Visible'];
		} else {
			if (un(obj._path)) return;
			if (un(obj._path.vis)) obj._path.vis = true;
			obj._path.vis = !obj._path.vis;
		}
		drawCanvasPaths();
	},
	itemEdit:function() {
		var obj = draw.currCursor.item;
		obj._objListEditObj = !obj._objListEditObj;
		var objs = draw.objList.getObjs();
		for (var i = 0; i < objs.length; i++) {
			if (objs[i] === obj) continue;
			delete objs[i]._objListEditObj;
		}
		drawCanvasPaths();
	},
	itemSetProperty:function() {
		draw.currCursor.obj[draw.currCursor.key] = draw.currCursor.value;
		if (draw.currCursor.obj.type === 'ruler2' && draw.currCursor.key === 'measure') {
			draw.currCursor.obj.rect[2] = draw.currCursor.value === 100 ? 544 : 800;
		}
		if (draw.currCursor.updateKeyboardFont === true && !un(teach.keyboard)) {
			teach.keyboard.font = draw.currCursor.value;
			teach.keyboard.draw();
		}
		drawCanvasPaths();
	},
	itemDelete:function() {
		var obj = draw.currCursor.item;
		if (['compass2','protractor2','ruler2'].indexOf(obj.type) > -1) {
			obj[obj.type.slice(0,-1)+'Visible'] = false;
			if (!un(obj._startCenter1)) obj.center1 = clone(obj._startCenter1);
			if (!un(obj._startCenter)) obj.center = clone(obj._startCenter);
			if (!un(obj._startAngle)) obj.angle = obj._startAngle;
			if (!un(obj._startRadius)) obj.radius = obj._startRadius;
			if (!un(obj.radiusLocked)) obj.radiusLocked = false;
			delete obj._opened;
			return;
		}
		var index = draw.path.indexOf(obj._path);
		if (index > -1) {
			draw.path.splice(index,1);
			if (obj.type === 'eraser' && obj._objs instanceof Array) {
				for (var o3 = 0; o3 < obj._objs.length; o3++) {
					var obj3 = obj._objs[o3];
					if (obj3._erasers instanceof Array) {
						var index2 = obj3._erasers.indexOf(obj);
						if (index2 > -1) obj3._erasers.splice(index2,1);
					}
				}
			}
			drawCanvasPaths();
		}
	},
	itemSliderStart:function() {
		changeDrawMode('slider-drag');
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw._drag = draw.currCursor;
		draw.animate(draw.objList.itemSliderMove,draw.slider.itemSliderStop,drawCanvasPaths);
	},
	itemSliderMove:function(e) {
		updateMouse(e);
		var x = draw.mouse[0];
		var slider = draw._drag;
		slider.obj[slider.key] = Math.min(slider.max,Math.max(slider.min,Math.min(slider.min + (slider.max-slider.min)*(x-slider.left)/slider.width)));
	},
	itemSliderStop:function() {
		changeDrawMode();
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		delete draw._drag;
	}
},
draw.lineWidthSelect = {
	resizable: false,
	drawToolsButton:true,
	onblur: function(obj) {
		draw.lineWidthSelectVisible = false;
	},
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'lineWidthSelect',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					colors: [],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		var thicknesses = !un(obj.thicknesses) ? obj.thicknesses : [3,5,7];
		return [obj.left, obj.top, 110, 20+45*thicknesses.length];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	draw: function (ctx, obj, path) {
		if (draw.mode == 'interact' && draw.lineWidthSelectVisible == false) return;
		if (draw.mode !== 'interact' && path.selected !== true) return;

		var thicknesses = !un(obj.thicknesses) ? obj.thicknesses : [3,5,7];

		var alpha = draw.mode == 'interact' ? 1 : 0.25;
		ctx.translate(obj.left, obj.top);
		var color = draw.buttonColor;
		roundedRect(ctx, 0, 0, 110, 20+45*thicknesses.length, 8, 6, colorA('#000', alpha), colorA(color, alpha));

		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		for (var i = 0; i < thicknesses.length; i++) {
			ctx.fillStyle = draw.thickness === thicknesses[i] ? colorA('#CFF', alpha) : colorA('#FFC', alpha);
			ctx.fillRect(10, 10 + 45 * i, 90, 45);
			ctx.lineWidth = thicknesses[i];
			ctx.beginPath();
			ctx.moveTo(25, 10 + 45 * i + 22.5);
			ctx.lineTo(85, 10 + 45 * i + 22.5);
			ctx.stroke();
		}
		ctx.strokeStyle = colorA('#000', alpha);
		ctx.lineWidth = 2;
		ctx.beginPath();
		for (var i = 0; i <= thicknesses.length; i++) {
			ctx.moveTo(10, 10 + 45 * i);
			ctx.lineTo(100, 10 + 45 * i);
		}
		for (var i = 0; i <= 1; i++) {
			ctx.moveTo(10 + 90 * i, 10);
			ctx.lineTo(10 + 90 * i, 10+45*thicknesses.length);
		}

		ctx.stroke();
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		var thicknesses = !un(obj.thicknesses) ? obj.thicknesses : [3,5,7];
		var x = draw.mouse[0] - obj.left;
		var y = draw.mouse[1] - obj.top;
		if (x < 10 || x > 90 || y < 10 || y > 10+45*thicknesses.length) return;
		var r = Math.floor((y - 10) / 45);
		draw.thickness = thicknesses[r];
		draw.cursors.update();
		drawCanvasPaths();
		drawCompass();
	}
};
draw.buttonColorPicker = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonColorPicker',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		draw.path.push({
			obj: [{
					type: 'colorPicker',
					colors: ['#000', '#999', '#00F', '#F00', '#393', '#F0F', '#93C', '#F60'],
					left: 205 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: draw.colorPicker.click,
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonColorPicker.draw(ctx, {
			type: 'buttonColorPicker',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		var color = !un(obj.color) ? obj.color : draw.buttonColor;
		if (draw.colorSelectVisible == true) color = draw.buttonSelectedColor;
		if (obj._disabled == true) color = colorA(color, 0.35);
		var color2 = '#000';
		if (obj._disabled == true) color2 = colorA('#000', 0.35);
		roundedRect(ctx, 0, 0, 55, 55, 8, 0.01, color, color);
		roundedRect(ctx, 1.5, 1.5, 52, 52, 8, 3, color2);
		var colors = ['#000', '#999', '#00F', '#F00', '#393', '#F0F', '#93C', '#F60'];
		for (var i = 0; i < 9; i++) {
			if (obj._disabled == true) {
				ctx.fillStyle = !un(colors[i]) ? colorA(colors[i], 0.35) : colorA('#FFF', 0.5);
			} else {
				ctx.fillStyle = colors[i] || '#FFF';
			}
			ctx.fillRect(12.5 + 10 * (i % 3), 12.5 + 10 * Math.floor(i / 3), 10, 10);
		}
		ctx.strokeStyle = obj._disabled == true ? colorA('#000', 0.35) : '#000';
		ctx.lineWidth = 1;
		ctx.strokeRect(12.5, 12.5, 30, 30);
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		if (obj._disabled == true) {
			Notifier.notify('Please subscribe to use this feature.', '', '/Images/logoSmall.PNG');
		} else {
			draw.colorSelectVisible = !draw.colorSelectVisible;
			drawCanvasPaths();
		}
	}
};
draw.colorPicker = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'colorPicker',
					colors: ['#000', '#999', '#00F', '#F00', '#393', '#F0F', '#93C', '#F60'],
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					colors: [],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 110, 200];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	draw: function (ctx, obj, path) {
		if (draw.mode == 'interact' && draw.colorSelectVisible == false) return;
		if (draw.mode !== 'interact' && path.selected !== true) return;
		var alpha = draw.mode == 'interact' ? 1 : 0.25;
		ctx.translate(obj.left, obj.top);
		var color = !un(obj.color) ? obj.color : draw.buttonColor;
		roundedRect(ctx, 0, 0, 110, 200, 8, 6, colorA('#000', alpha), colorA(color, alpha));
		for (var i = 0; i < 8; i++) {
			ctx.fillStyle = colorA(obj.colors[i], alpha);
			ctx.fillRect(10 + 45 * (i % 2), 10 + 45 * Math.floor(i / 2), 45, 45);
		}
		ctx.strokeStyle = colorA('#000', alpha);
		ctx.lineWidth = 2;
		ctx.beginPath();
		for (var i = 0; i <= 4; i++) {
			ctx.moveTo(10, 10 + 45 * i);
			ctx.lineTo(100, 10 + 45 * i);
		}
		for (var i = 0; i <= 2; i++) {
			ctx.moveTo(10 + 45 * i, 10);
			ctx.lineTo(10 + 45 * i, 190);
		}
		ctx.stroke();
		ctx.translate(-obj.left, -obj.top);
	},
	click: function (obj) {
		//var x = mouse.x - draw.drawRelPos[0] - obj.left;
		//var y = mouse.y - draw.drawRelPos[1] - obj.top;
		var x = draw.mouse[0] - obj.left;
		var y = draw.mouse[1] - obj.top;
		if (x < 10 || x > 90 || y < 10 || y > 190)
			return;
		var c = Math.floor((x - 10) / 45);
		var r = Math.floor((y - 10) / 45);
		if (obj.fill === true) {
			draw.fillColor = obj.colors[2 * r + c];
		} else {
			draw.color = obj.colors[2 * r + c];
		}
		//draw.colorSelectVisible = false;
		draw.cursors.update();
		drawCanvasPaths();
		//drawCompass();
	}
};
draw.buttonCompassHelp = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonCompassHelp',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		draw.path.push({
			obj: [{
					type: 'compassHelp',
					left: 205 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonCompassHelp.draw(ctx, {
			type: 'buttonCompassHelp',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.translate(obj.left, obj.top);
		var color = draw.buttonColor;
		if (draw.compassHelpVisible == true) color = draw.buttonSelectedColor;
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', color);
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#666';
		ctx.font = '42px Arial';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('?', 27.5, 30);
		ctx.strokeText('?', 27.5, 30);
		ctx.translate(-obj.left, -obj.top);
	},
	click: function () {
		draw.compassHelpVisible = !draw.compassHelpVisible;
		drawCanvasPaths();
	}
};
draw.compassHelp = {
	resizable: false,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'compassHelp',
					left: 205 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 500, 400];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	init: function (obj) {
		var center1 = [obj.left + 0.35 * 500, obj.top + 0.85 * 400];
		var radius = 150;
		var armLength = 250;
		var angle = 0;
		var h = Math.sqrt(Math.pow(armLength, 2) - Math.pow(0.5 * radius, 2));
		var center2 = [center1[0] + 0.5 * radius * Math.cos(angle) + h * Math.sin(angle), center1[1] + 0.5 * radius * Math.sin(angle) - h * Math.cos(angle)];
		var center3 = [center1[0] + radius * Math.cos(angle), center1[1] + radius * Math.sin(angle)];

		var angle2 = (angle % (2 * Math.PI));
		if (angle2 < 0)
			angle2 += 2 * Math.PI;
		if (angle2 > 0.5 * Math.PI && angle2 < 1.5 * Math.PI) {
			var drawOn = 'left';
		} else {
			var drawOn = 'right';
		}

		var mp1 = midpoint(center1[0], center1[1], center3[0], center3[1]);
		var mp2 = midpoint(center2[0], center2[1], mp1[0], mp1[1]);

		var compass = {
			center1: center1.slice(0),
			startCenter1: center1.slice(0),
			center2: center2.slice(0),
			startCenter2: center2.slice(0),
			center3: center3.slice(0),
			startCenter3: center3.slice(0),
			radius: radius,
			startRadius: radius,
			h: h,
			startH: h,
			armLength: armLength,
			radiusLocked: false,
			angle: angle,
			startAngle: angle,
			drawOn: drawOn,
			startDrawOn: drawOn,
			lockCenter: mp2.slice(0),
			mode: 'none',
		}
		return compass;
	},
	draw: function (ctx, obj, path) {
		if (draw.mode == 'interact' && draw.compassHelpVisible == false) return;
		if (draw.mode !== 'interact' && path.selected !== true) return;

		text({
			ctx: ctx,
			rect: [obj.left, obj.top, 500, 400],
			text: [''],
			box: {
				type: 'loose',
				borderColor: '#000',
				borderWidth: 2,
				radius: 10,
				color: '#FFC'
			}
		});

		text({
			ctx: ctx,
			rect: [obj.left + 55, obj.top + 20, 160, 200],
			align: [0, -1],
			text: ['<<font:segoePrint>><<bold:true>>Drag the top of the compass to draw an arc']
		});

		text({
			ctx: ctx,
			rect: [obj.left + 30, obj.top + 150, 160, 200],
			align: [0, -1],
			text: ['<<font:segoePrint>>Drag this arm to move the whole compass']
		});

		text({
			ctx: ctx,
			rect: [obj.left + 340, obj.top + 150, 140, 200],
			align: [0, -1],
			text: ['<<font:segoePrint>>Drag this arm to move the pencil']
		});

		text({
			ctx: ctx,
			rect: [obj.left, obj.top + 360, 500, 70],
			align: [0, -1],
			text: ['<<font:segoePrint>>Press here to lock the compass']
		});

		drawArrow({
			ctx: ctx,
			startX: obj.left + 250,
			finX: obj.left + 250,
			startY: obj.top + 350,
			finY: obj.top + 250,
			lineWidth: 1,
			arrowLength: 15
		});

		if (un(obj._compass)) {
			obj._compass = draw.compassHelp.init(obj);
		}
		var compass = obj._compass;

		var armLength = compass.armLength;
		var radius = compass.radius;
		var h = compass.h;
		var center1 = compass.center1;
		var center2 = compass.center2;
		var center3 = compass.center3;
		var drawOn = compass.drawOn;

		if (compass.radiusLocked == true || compass.mode == 'draw') {
			// draw lock button
			ctx.translate(center2[0], center2[1]);
			if (drawOn == 'right') {
				ctx.rotate(compass.angle);
			} else {
				ctx.rotate(compass.angle + Math.PI);
			}

			var lockHeight = 0.5 * compass.h;

			//bar
			ctx.fillStyle = '#99F';
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			ctx.fillRect(-0.25 * compass.radius, lockHeight - 5, 0.5 * compass.radius, 10);
			ctx.strokeRect(-0.25 * compass.radius, lockHeight - 5, 0.5 * compass.radius, 10);

			//circle
			ctx.fillStyle = '#99F';
			ctx.strokeStyle = '#333';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(0, lockHeight, 15, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();

			//padlock
			ctx.fillStyle = '#333';
			ctx.beginPath();
			ctx.moveTo(6, lockHeight - 2);
			ctx.lineTo(6, lockHeight + 3);
			ctx.arc(0, lockHeight + 3, 6, 0, Math.PI);
			ctx.lineTo(-6, lockHeight + 3);
			ctx.lineTo(-6, lockHeight - 2);
			ctx.stroke();
			ctx.fill();

			//keyhole
			ctx.fillStyle = '#99F';
			ctx.beginPath();
			ctx.arc(0, lockHeight + 2.5, 1.5, 0, 2 * Math.PI);
			ctx.fill();
			ctx.fillRect(-0.5, lockHeight + 2.5, 1, 3);

			//arm
			ctx.beginPath();
			ctx.moveTo(-6, lockHeight + 2);
			ctx.lineTo(-6, lockHeight + 2);
			ctx.arc(0, lockHeight - 4, 5, Math.PI, 2 * Math.PI);
			ctx.lineTo(6, lockHeight + 2);
			ctx.stroke();

			if (drawOn == 'right') {
				ctx.rotate(-compass.angle);
			} else {
				ctx.rotate(-compass.angle - Math.PI);
			}
			ctx.translate(-center2[0], -center2[1]);
		} else {
			// draw lock button
			ctx.translate(center2[0], center2[1]);
			if (drawOn == 'right') {
				ctx.rotate(compass.angle);
			} else {
				ctx.rotate(compass.angle + Math.PI);
			}

			var lockHeight = 0.5 * compass.h;

			//bar
			ctx.fillStyle = '#999';
			ctx.strokeStyle = '#999';
			ctx.lineWidth = 2;
			ctx.strokeRect(-0.25 * compass.radius, lockHeight - 5, 0.5 * compass.radius, 10);

			//circle
			ctx.fillStyle = '#FFC';
			ctx.strokeStyle = '#999';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(0, lockHeight, 15, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();

			//padlock
			ctx.fillStyle = '#999';
			ctx.beginPath();
			ctx.moveTo(6, lockHeight - 2);
			ctx.lineTo(6, lockHeight + 3);
			ctx.arc(0, lockHeight + 3, 6, 0, Math.PI);
			ctx.lineTo(-6, lockHeight + 3);
			ctx.lineTo(-6, lockHeight - 2);
			ctx.stroke();
			ctx.fill();

			//keyhole
			ctx.fillStyle = '#FFC';
			ctx.beginPath();
			ctx.arc(0, lockHeight + 2.5, 1.5, 0, 2 * Math.PI);
			ctx.fill();
			ctx.fillRect(-0.5, lockHeight + 2.5, 1, 3);

			//arm
			ctx.beginPath();
			ctx.moveTo(-6, lockHeight - 2);
			ctx.arc(0, lockHeight - 4, 5, (4 / 5) * Math.PI, (9 / 5) * Math.PI);
			ctx.stroke();

			if (drawOn == 'right') {
				ctx.rotate(-compass.angle);
			} else {
				ctx.rotate(-compass.angle - Math.PI);
			}
			ctx.translate(-center2[0], -center2[1]);
		}

		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#000';

		var angle2 = -0.5 * Math.PI - Math.atan((center2[1] - center1[1]) / (center2[0] - center1[0]));
		if (center2[0] < center1[0])
			angle2 += Math.PI;
		var angle3 = -0.5 * Math.PI - Math.atan((center3[1] - center2[1]) / (center3[0] - center2[0]));
		if (center2[0] < center3[0])
			angle3 += Math.PI;

		// draw pointy arm
		ctx.translate(center2[0], center2[1]);
		ctx.rotate(-angle2);

		roundedRect(ctx, -7, 0, 14, armLength - 20, 3, 4, '#000', '#99F');
		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#CCC';
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(-3, armLength - 20);
		ctx.lineTo(0, armLength);
		ctx.lineTo(3, armLength - 20);
		ctx.lineTo(-3, armLength - 20);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, armLength - 26);
		ctx.stroke();

		ctx.rotate(angle2);
		ctx.translate(-center2[0], -center2[1]);

		// draw pencil arm
		ctx.translate(center2[0], center2[1]);
		ctx.rotate(-angle3);

		if (drawOn == 'right') {
			var pAngle = Math.PI / 14;
		} else {
			var pAngle = -Math.PI / 14;
		}

		//draw pencil
		ctx.translate(0, armLength);
		ctx.rotate(pAngle);

		ctx.beginPath();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		if (draw.color == '#000') {
			ctx.fillStyle = '#FC3';
		} else {
			ctx.fillStyle = draw.color;
		}
		ctx.moveTo(0, 0);
		ctx.lineTo(-10, -30);
		ctx.lineTo(-10, -200);
		ctx.lineTo(10, -200);
		ctx.lineTo(10, -30);
		ctx.lineTo(0, 0);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = '#FFC';
		ctx.moveTo(0, 0);
		ctx.lineTo(-10, -30);
		ctx.lineTo(10, -30);
		ctx.lineTo(0, 0);
		ctx.fill();
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = draw.color;
		ctx.moveTo(0, 0);
		ctx.lineTo(-3, -9);
		ctx.lineTo(3, -9);
		ctx.lineTo(0, 0);
		ctx.fill();
		ctx.stroke();

		ctx.rotate(-pAngle);
		ctx.translate(0, -armLength);

		ctx.fillStyle = '#99F';
		ctx.beginPath();
		if (drawOn == 'right') {
			ctx.moveTo(-7, 0);
			ctx.lineTo(7, 0);
			ctx.lineTo(7, armLength - 95);
			ctx.lineTo(7 + 45 * Math.cos(pAngle), armLength - 95 + 45 * Math.sin(pAngle));
			ctx.lineTo(7 + 45 * Math.cos(pAngle) - 20 * Math.sin(pAngle), armLength - 95 + 45 * Math.sin(pAngle) + 20 * Math.cos(pAngle));
			ctx.lineTo(-7, armLength - 80);
			ctx.lineTo(-7, 0);
		} else {
			ctx.moveTo(7, 0);
			ctx.lineTo(-7, 0);
			ctx.lineTo(-7, armLength - 95);
			ctx.lineTo(-7 - 45 * Math.cos(pAngle), armLength - 95 - 45 * Math.sin(pAngle));
			ctx.lineTo(-7 - 45 * Math.cos(pAngle) - 20 * Math.sin(pAngle), armLength - 95 - 45 * Math.sin(pAngle) + 20 * Math.cos(pAngle));
			ctx.lineTo(7, armLength - 80);
			ctx.lineTo(7, 0);
		}
		ctx.fill();
		ctx.stroke();

		ctx.translate(0, armLength);
		ctx.rotate(pAngle);

		ctx.beginPath();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 2;
		ctx.fillStyle = '#000';
		if (drawOn == 'right') {
			ctx.moveTo(14, -103);
			ctx.lineTo(24, -103);
			ctx.lineTo(24, -67);
			ctx.lineTo(14, -67);
			ctx.lineTo(14, -103);
		} else {
			ctx.moveTo(-14, -103);
			ctx.lineTo(-24, -103);
			ctx.lineTo(-24, -67);
			ctx.lineTo(-14, -67);
			ctx.lineTo(-14, -103);
		}
		ctx.fill();
		ctx.stroke();

		ctx.rotate(-pAngle);
		ctx.translate(0, -armLength);

		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#CCC';
		ctx.lineWidth = 0.5;
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, armLength - 86);
		ctx.stroke();

		ctx.rotate(angle3);
		ctx.translate(-center2[0], -center2[1]);

		// draw top of compass
		ctx.translate(center2[0], center2[1]);
		if (drawOn == 'right') {
			ctx.rotate(compass.angle);
		} else {
			ctx.rotate(compass.angle + Math.PI);
		}

		roundedRect(ctx, -15, -30, 30, 55, 10, 2, '#000', '#000');
		roundedRect(ctx, -5, -60, 10, 30, 0, 2, '#000', '#000');
		ctx.fillStyle = '#CCC';
		ctx.beginPath();
		ctx.arc(0, 0, 7, 0, 2 * Math.PI);
		ctx.fill();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(-4, -4);
		ctx.lineTo(4, 4);
		ctx.moveTo(4, -4);
		ctx.lineTo(-4, 4);
		ctx.stroke();

		if (drawOn == 'right') {
			ctx.rotate(-compass.angle);
		} else {
			ctx.rotate(-compass.angle - Math.PI);
		}
		ctx.translate(-center2[0], -center2[1]);
	}

};
draw.buttonDash = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonDash',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					dash: [15, 15],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonUndo.draw(ctx, {
			type: 'buttonDash',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		var color = arraysEqual(draw.dash, obj.dash) ? draw.buttonSelectedColor : draw.buttonColor;
		roundedRect(ctx, obj.left+3, obj.top+3, 55 - 6, 55 - 6, 8, 6, '#000', color);
		draw.icons.lineDash(ctx, obj.left, obj.top, 55, {lineColor:draw.color,lineWidth:2.5,dash:[5,5]});
	},
	click: function (obj) {
		if (un(draw.dash) || draw.dash.length == 0) {
			draw.dash = clone(obj.dash);
		} else {
			delete draw.dash;
		}
		drawCanvasPaths();
	}
};
draw.buttonFloodFill = {
	resizable: false,
	drawToolsButton:true,
	add: function () {
		deselectAllPaths(false);
		draw.path.push({
			obj: [{
					type: 'buttonFloodFill',
					left: 150 - draw.drawRelPos[0],
					top: 150 - draw.drawRelPos[1],
					interact: {
						click: function (obj) {
							draw[obj.type].click(obj)
						},
						overlay: true
					}
				}
			],
			selected: true,
			trigger: []
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	getRect: function (obj) {
		return [obj.left, obj.top, 55, 55];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
	},
	drawButton: function (ctx, size, type) {
		draw.buttonFloodFill.draw(ctx, {
			type: 'buttonFloodFill',
			left: (size - 55) / 2,
			top: (size - 55) / 2
		});
	},
	draw: function (ctx, obj, path) {
		ctx.save();
		ctx.translate(obj.left, obj.top);
		var color = draw.buttonColor;
		if (draw.drawMode == 'floodFill') color = draw.buttonSelectedColor;
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', color);
		roundedRect(ctx, 3, 3, 49, 49, 8, 6, '#000', color);

		ctx.translate(26 + 2.5, 25 + 2.5);
		ctx.rotate(-0.25 * Math.PI);

		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#FFF';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(-7, -8);
		ctx.lineTo(7, -8);
		ctx.scale(7 / 2, 1);
		ctx.arc(0, -8, 2, Math.PI, 2 * Math.PI);
		ctx.scale(2 / 7, 1);
		ctx.lineTo(7, 8);
		ctx.scale(7 / 2, 1);
		ctx.arc(0, 8, 2, 0, Math.PI);
		ctx.scale(2 / 7, 1);
		ctx.lineTo(-7, -8);
		ctx.stroke();
		ctx.fill();

		var color = draw.fillColor !== 'none' ? draw.fillColor : '#00F';
		if (!un(file) && file.constructionsTool === true) color = draw.color;
		
		ctx.strokeStyle = '#000';
		ctx.fillStyle = color;
		ctx.lineWidth = 0.5;
		ctx.beginPath();
		ctx.moveTo(7, -8);
		ctx.scale(7 / 2, 1);
		ctx.arc(0, -8, 2, Math.PI, 3 * Math.PI);
		ctx.scale(2 / 7, 1);
		ctx.fill();
		ctx.stroke();

		ctx.fillRect(-7, 0, 9, 5);
		ctx.strokeRect(-7, 0, 9, 5);

		ctx.beginPath();
		ctx.moveTo(0, -4);
		ctx.arc(0, -4, 1, 0, 2 * Math.PI);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(0, -4);
		ctx.quadraticCurveTo(20, 10, 8, -2);
		ctx.stroke();

		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(-3, -9);
		ctx.quadraticCurveTo(-6, -17, -15, -3);
		ctx.quadraticCurveTo(-9, -9, -7, -9);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.rotate(0.25 * Math.PI);
		ctx.translate(-26 + 2.5, -25 + 2.5);

		ctx.translate(-obj.left, -obj.top);
		ctx.restore();
	},
	click: function () {
		changeDrawMode('floodFill');
		draw.cursors.update();
	}
};
draw.fillPath = {
	resizable: false,
	add: function () {},
	getRect: function (obj) {
		obj._left = obj.pos[0][0] - 10;
		obj._top = obj.pos[0][1] - 10;
		obj._right = obj.pos[0][0] + 10;
		obj._bottom = obj.pos[0][1] + 10;
		for (var j = 1; j < obj.pos.length; j++) {
			obj._left = Math.min(obj._left, obj.pos[j][0] - 10);
			obj._top = Math.min(obj._top, obj.pos[j][1] - 10);
			obj._right = Math.max(obj._right, obj.pos[j][0] + 10);
			obj._bottom = Math.max(obj._bottom, obj.pos[j][1] + 10);
		}
		obj._width = obj._right - obj._left;
		obj._height = obj._bottom - obj._top;
		return [obj._left, obj._top, obj._width, obj._height];
	},
	changePosition: function (obj, dl, dt, dw, dh) {},
	drawButton: function (ctx, size, type) {},
	draw: function (ctx, obj, path) {
		ctx.fillStyle = obj.color;
		ctx.save();
		ctx.beginPath();
		draw.fillPath.drawPolygonToCtx(ctx, obj.pos);
		ctx.closePath();

		if (!un(obj.holes)) {
			for (var h = 0; h < obj.holes.length; h++) {
				var hole = obj.holes[h];
				if (hole.holeInHole == true) continue;

				draw.fillPath.drawPolygonToCtx(ctx, hole.pos);
				/*ctx.moveTo(hole.pos[0][0],hole.pos[0][1]);
				for (var p = 1; p < hole.pos.length; p++) {
				var pos = hole.pos[p];
				if (pos[2] == true) {
				var pos2 = hole.pos[p+1];
				if (p < hole.pos.length-2) {
				ctx.quadraticCurveTo(pos[0],pos[1],(pos[0]+pos2[0])/2,(pos[1]+pos2[1])/2);
				} else if (p == hole.pos.length-2) {
				ctx.quadraticCurveTo(pos[0],pos[1],pos2[0],pos2[1]);
				}
				} else {
				ctx.lineTo(pos[0],pos[1]);
				}
				}*/

				ctx.closePath();
			}
		}

		ctx.fill();

		/*ctx.beginPath();
		ctx.fillStyle = '#0FF';
		for (var p = 0; p < obj.pos.length; p++) {
		var pos = obj.pos[p];
		ctx.moveTo(pos[0],pos[1]);
		ctx.arc(pos[0],pos[1],10,0,2*Math.PI);
		}
		ctx.fill();*/

		ctx.restore();
	},
	devMode: false,
	outerField: false,
	nodeTolerance: 10,
	fillPolygonAtPoint: function (x, y) {
		//if (un(draw.drawPolygons))
		draw.fillPath.updateDrawPolygons();
		var polygons = draw.drawPolygons;

		for (var p = polygons.length - 1; p >= 0; p--) {
			if (hitTestPolygon2([x, y], polygons[p].pos) == false) {
				polygons.splice(p, 1);
			}
		}
		if (polygons.length > 1) {
			for (var p1 = polygons.length - 1; p1 >= 0; p1--) {
				var poly1 = polygons[p1];
				for (var p2 = polygons.length - 1; p2 >= 0; p2--) {
					var poly2 = polygons[p2];
					if (p1 == p2)
						continue;
					var holeFound = false;
					for (var h = 0; h < poly1.holes.length; h++) {
						if (poly1.holes[h].polygonId == poly2.polygonId) {
							holeFound = true;
							break;
						}
					}
					if (holeFound == true) {
						polygons.splice(p1, 1);
						break;
					}
				}
			}
		}
		if (un(polygons[0]))
			return;
		var polygon = polygons[0];
		if (draw.fillPath.devMode == true)
			console.log(polygon);

		var color = draw.fillColor !== 'none' ? draw.fillColor : '#00F';
		if (!un(file) && file.constructionsTool === true) color = draw.color;
		color = colorA(color, 0.5);

		for (var p = 0; p < draw.path.length; p++) { // check if the path already exists
			var path = draw.path[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (obj.type == 'fillPath') {
					if (samePolygons(polygon.pos, obj.pos)) {
						if (obj.color == color) {
							draw.path.splice(p, 1);
						} else {
							obj.color = color;
						}
						drawCanvasPaths();
						return;
					}
				}
			}
		}

		draw.path.push({
			obj: [{
					type: 'fillPath',
					pos: polygon.pos,
					holes: polygon.holes,
					color: color,
					drawFirst: true,
					created:new Date().getTime()
				}
			],
			selected: false,
			trigger: []
		});
		//console.log(draw.path.last().obj[0]);
		drawCanvasPaths();
	},
	updateDrawPolygons: function () {
		//console.clear();

		var nodes = [];
		var edges = [];

		var objects = getObjects();
		getIntersectionPoints(objects);

		if (draw.fillPath.devMode == true) {
			draw.cursorCanvas.ctx.clear();
			console.log('objects:', clone(objects));
		}

		for (var n1 = nodes.length - 1; n1 >= 0; n1--) { // check nodes are unique
			for (var n2 = n1 - 1; n2 >= 0; n2--) {
				if (dist(nodes[n1].pos, nodes[n2].pos) < draw.fillPath.nodeTolerance) {
					nodes.splice(n1, 1);
					break;
				}
			}
		}

		for (var n = 0; n < nodes.length; n++) {
			nodes[n].edges = [];
			nodes[n].nodeId = n;
		}

		var edges = buildEdges(objects);
		if (draw.fillPath.devMode == true)
			console.log('edges:', clone(edges));
		// check edges are unique
		for (var e1 = edges.length - 1; e1 >= 0; e1--) {
			for (var e2 = e1; e2 >= 0; e2--) {
				if (e1 == e2)
					continue;
				var edge1 = edges[e1];
				var edge2 = edges[e2];
				if (edge1.pos.length !== edge2.pos.length)
					continue;
				var matchForward = true;
				var matchBack = true;
				var pMax = edge1.pos.length - 1;
				for (var p = 0; p <= pMax; p++) {
					if (matchForward == true && dist(edge1.pos[p], edge2.pos[p]) > draw.fillPath.nodeTolerance)
						matchForward = false;
					if (matchBack == true && dist(edge1.pos[pMax - p], edge2.pos[p]) > draw.fillPath.nodeTolerance)
						matchBack = false;
					if (matchForward == false && matchBack == false)
						break;
				}
				if (matchForward == true || matchBack == true) {
					edges.splice(e1, 1);
					break;
				}
			}
		}
		for (var e = 0; e < edges.length; e++) {
			var edge1 = clone(edges[e]);
			if (un(edge1.startNode) || un(edge1.finNode) || (edge1.startNode == edge1.finNode && edge1.pos.length == 2)) {
				edges.splice(e, 1);
				e--;
				continue;
			}
			if (!un(nodes[edge1.startNode])) {
				edge1.angle = getAngleTwoPoints(nodes[edge1.startNode].pos, edge1.pos[1]);
				while (edge1.angle < 0)
					edge1.angle += 2 * Math.PI;
				while (edge1.angle >= 2 * Math.PI)
					edge1.angle -= 2 * Math.PI;
				/*if (edge1.pos[0][0] !== nodes[edge1.startNode].pos[0] || edge1.pos[0][1] !== nodes[edge1.startNode].pos[1]) {
				//console.log(edge1.pos[0],nodes[edge1.startNode].pos);
				edge1.pos[0][0] = nodes[edge1.startNode].pos[0];
				edge1.pos[0][1] = nodes[edge1.startNode].pos[1];
				edges[e].pos[0][0] = nodes[edge1.startNode].pos[0];
				edges[e].pos[0][1] = nodes[edge1.startNode].pos[1];
				}*/
				//console.log(e,edge1.startNode,nodes[edge1.startNode].pos,edge1.pos[1],edge1.angle);
				nodes[edge1.startNode].edges.push(edge1);
			}
			var edge2 = clone(edges[e]);
			if (!un(nodes[edge2.finNode])) {
				edge2.angle = getAngleTwoPoints(nodes[edge2.finNode].pos, edge2.pos[edge2.pos.length - 2]);
				while (edge2.angle < 0)
					edge2.angle += 2 * Math.PI;
				while (edge2.angle >= 2 * Math.PI)
					edge2.angle -= 2 * Math.PI;
				/*if (edge1.pos.last()[0] !== nodes[edge1.startNode].pos[0] || edge1.pos.last()[1] !== nodes[edge1.startNode].pos[1]) {
				//console.log(edge1.pos.last(),nodes[edge1.startNode].pos);
				edge2.pos.last()[0] = nodes[edge2.finNode].pos[0];
				edge2.pos.last()[1] = nodes[edge2.finNode].pos[1];
				edges[e].pos[0] = nodes[edge2.finNode].pos[0];
				edges[e].pos[1] = nodes[edge2.finNode].pos[1];
				}*///console.log(e,edge2.finNode,nodes[edge2.finNode].pos,edge2.pos[edge2.pos.length-2],edge2.angle);
				nodes[edge2.finNode].edges.push(edge2);
			}
		}
		for (var n = 0; n < nodes.length; n++) {
			nodes[n].edges.sort(function (a, b) {
				return b.angle - a.angle;
			});
			nodes[n].edgeIds = [];
			for (var e = 0; e < nodes[n].edges.length; e++) {
				nodes[n].edgeIds.push(nodes[n].edges[e].edgeId);
			}
		}

		if (draw.fillPath.devMode == true) {
			drawAllEdges(edges, polygons);
			console.log('edges:', clone(edges));
			console.log('nodes:', clone(nodes));
		}

		var polygons = buildPolygons(objects, edges);

		if (draw.fillPath.devMode == true) {
			console.log('polygons:', clone(polygons));
			//drawAllEdges(edges,polygons);

		}
		draw.drawPolygons = polygons;

		function getObjects() {
			var objects = [];
			if (draw.fillPath.outerField == true || (!un(file) && file.constructionsTool === true)) {
				var left = draw.drawArea[0];
				var top = draw.drawArea[1];
				var right = draw.drawArea[0] + draw.drawArea[2];
				var bottom = draw.drawArea[1] + draw.drawArea[3];
				objects.push({
					type: 'polygon',
					pos: [[left, top, false], [right, top, false], [right, bottom, false], [left, bottom, false], [left, top, false]]
				});
			}
			for (var p = 0; p < draw.path.length; p++) {
				var path = draw.path[p];
				if (un(path) || getPathVis(path) == false)
					continue;
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (typeof obj.trigger !== 'undefined' && draw.ansMode == true && obj.trigger[0] == false && draw.showAns == false)
						continue;
					if (obj.visible === false || obj.vis === false)
						continue;
					if (['line', 'arc', 'circle', 'pen', 'polygon'].includes(obj.type)) {
						if (obj.type == 'line') {
							var pos = [clone(obj.startPos), clone(obj.finPos)];
						} else if (obj.type == 'arc') {
							var pos = clone(draw.fillPath.getPolygonOfArc(obj));
							for (var p2 = 0; p2 < pos.length; p2++)
								pos[p2].push(true);
						} else if (obj.type == 'circle') {
							var pos = clone(draw.fillPath.getPolygonOfCircle(obj));
							for (var p2 = 0; p2 < pos.length; p2++)
								pos[p2].push(true);
						} else if (obj.type == 'pen') {
							var pos = clone(obj.pos);
							for (var p2 = 0; p2 < pos.length; p2++)
								pos[p2].push(true);
						} else if (obj.type == 'polygon') {
							var pos = clone(obj.points);
							pos.push(pos[0]);
						}
						for (var p1 = 0; p1 < pos.length; p1++) {
							pos[p1][0] = roundToNearest(pos[p1][0], 1);
							pos[p1][1] = roundToNearest(pos[p1][1], 1);
						}
						objects.push({
							type: 'polygon',
							pos: pos
						});
					}
				}
			}
			return objects;
		}
		function getIntersectionPoints(objects) {
			for (var o1 = 0; o1 < objects.length; o1++) {
				var obj1 = objects[o1];

				for (var p1 = obj1.pos.length - 2; p1 >= 0; p1--) { // check for self-intersection
					var pos1 = obj1.pos[p1];
					var pos2 = obj1.pos[p1 + 1];
					for (var p2 = p1 - 2; p2 >= 0; p2--) {
						var pos3 = obj1.pos[p2];
						var pos4 = obj1.pos[p2 + 1];

						if (dist(pos1, pos3) < draw.fillPath.nodeTolerance / 5) {
							//if (draw.fillPath.devMode == true) console.log(1,3,p1,p2,pos1,pos3);
							pos1[3] = true;
							pos3[3] = true;
							nodes.push({
								pos: [pos1[0], pos1[1]]
							});
							/*} else if (dist(pos1,pos4) < draw.fillPath.nodeTolerance/5) {
							if (draw.fillPath.devMode == true) console.log(1,4,p1,p2+1,pos1,pos4);
							pos1[3] = true;
							pos4[3] = true;
							nodes.push({pos:[pos1[0],pos1[1]]});*/
						} else if (dist(pos2, pos3) < draw.fillPath.nodeTolerance / 5) {
							//if (draw.fillPath.devMode == true) console.log(2,3,p1+1,p2,pos2,pos3);
							pos2[3] = true;
							pos3[3] = true;
							nodes.push({
								pos: [pos2[0], pos2[1]]
							});
						} else if (dist(pos2, pos4) < draw.fillPath.nodeTolerance / 5) {
							//if (draw.fillPath.devMode == true) console.log(2,4,p1+1,p2+1,pos2,pos4);
							pos2[3] = true;
							pos4[3] = true;
							nodes.push({
								pos: [pos2[0], pos2[1]]
							});
						} else {
							var int = intersection(pos1, pos2, pos3, pos4);
							if (int instanceof Array && isPointOnLineSegment(int, pos1, pos2) == true && isPointOnLineSegment(int, pos3, pos4) == true) {
								int[0] = roundToNearest(int[0], 1);
								int[1] = roundToNearest(int[1], 1);
								nodes.push({
									pos: int
								});
								obj1.pos.splice(p1 + 1, 0, [int[0], int[1], boolean(pos1[2], false), true]);
								obj1.pos.splice(p2 + 1, 0, [int[0], int[1], boolean(pos3[2], false), true]);
							}
						}
					}
				}

				for (var o2 = o1 + 1; o2 < objects.length; o2++) {
					var obj2 = objects[o2];
					for (var p1 = obj1.pos.length - 2; p1 >= 0; p1--) {
						var pos1 = obj1.pos[p1];
						var pos2 = obj1.pos[p1 + 1];
						for (var p2 = obj2.pos.length - 2; p2 >= 0; p2--) {
							var pos3 = obj2.pos[p2];
							var pos4 = obj2.pos[p2 + 1];

							if (dist(pos1, pos3) < draw.fillPath.nodeTolerance) {
								pos1[3] = true;
								pos3[3] = true;
								nodes.push({
									pos: [pos1[0], pos1[1]]
								});
							} else if (dist(pos1, pos4) < draw.fillPath.nodeTolerance) {
								pos1[3] = true;
								pos4[3] = true;
								nodes.push({
									pos: [pos1[0], pos1[1]]
								});
							} else if (dist(pos2, pos3) < draw.fillPath.nodeTolerance) {
								pos2[3] = true;
								pos3[3] = true;
								nodes.push({
									pos: [pos2[0], pos2[1]]
								});
							} else if (dist(pos2, pos4) < draw.fillPath.nodeTolerance) {
								pos2[3] = true;
								pos4[3] = true;
								nodes.push({
									pos: [pos2[0], pos2[1]]
								});
							} else if (p1 == 0 && distancePointToLineSegment(pos1, pos3, pos4) < draw.fillPath.nodeTolerance) {
								pos1[3] = true;
								obj2.pos.splice(p2 + 1, 0, [pos1[0], pos1[1], boolean(pos2[2], false), true]);
								nodes.push({
									pos: [pos1[0], pos1[1]]
								});
							} else if (p1 == obj1.pos.length - 2 && distancePointToLineSegment(pos2, pos3, pos4) < draw.fillPath.nodeTolerance) {
								pos2[3] = true;
								obj2.pos.splice(p2 + 1, 0, [pos2[0], pos2[1], boolean(pos2[2], false), true]);
								nodes.push({
									pos: [pos2[0], pos2[1]]
								});
							} else if (p2 == 0 && distancePointToLineSegment(pos3, pos1, pos2) < draw.fillPath.nodeTolerance) {
								pos3[3] = true;
								obj1.pos.splice(p1 + 1, 0, [pos3[0], pos3[1], boolean(pos1[2], false), true]);
								nodes.push({
									pos: [pos3[0], pos3[1]]
								});
							} else if (p2 == obj2.pos.length - 2 && distancePointToLineSegment(pos4, pos1, pos2) < draw.fillPath.nodeTolerance) {
								pos4[3] = true;
								obj1.pos.splice(p1 + 1, 0, [pos4[0], pos4[1], boolean(pos1[2], false), true]);
								nodes.push({
									pos: [pos4[0], pos4[1]]
								});
							} else {
								var int = intersection(pos1, pos2, pos3, pos4);
								if (int instanceof Array && isPointOnLineSegment(int, pos1, pos2) == true && isPointOnLineSegment(int, pos3, pos4) == true) {
									int[0] = roundToNearest(int[0], 1);
									int[1] = roundToNearest(int[1], 1);
									nodes.push({
										pos: int
									});
									obj1.pos.splice(p1 + 1, 0, [int[0], int[1], boolean(pos1[2], false), true]);
									obj2.pos.splice(p2 + 1, 0, [int[0], int[1], boolean(pos2[2], false), true]);
									p1 += 2;
									break;
								}
							}
						}
					}

				}
			}
		}

		function buildEdges(objects) {
			var edges = [];
			for (var o = 0; o < objects.length; o++) {
				var obj = objects[o];
				var nodeIndex = -1;
				var lastNode;
				var edge = [];
				for (var p = 0; p < obj.pos.length; p++) {
					var pos = obj.pos[p];
					if (nodeIndex > -1 || pos[3] == true)
						edge.push(clone(pos));
					if (pos[3] == true) {
						if (edge.length > 1) {
							startNode = lastNode.nodeId;
							finNode = getNode(pos).nodeId;
							edges.push({
								type: 'polygon',
								pos: clone(edge),
								startNode: startNode,
								finNode: finNode,
								edgeId: edges.length
							});
							edge = [pos];
						}
						nodeIndex++;
						lastNode = getNode(pos);
					}
				}
			}
			return edges;
		}
		function getNode(pos) {
			for (var n = 0; n < nodes.length; n++) {
				if (dist(pos, nodes[n].pos) < draw.fillPath.nodeTolerance) {
					return nodes[n];
				}
			}
			return false;
		}
		function getNodeNextEdge(node, edgeId) {
			if (un(node))
				return false;
			if (un(edgeId))
				return node.edges[0];
			var index = node.edgeIds.indexOf(edgeId);
			if (index == -1)
				return false;
			var index2 = index;
			do {
				var index2 = (index2 + 1) % node.edges.length;
				if (index == index2)
					return false;
				var next = clone(node.edges[index2]);
			} while (un(next.startNode) || un(next.finNode));
			return next;
		}
		function buildPolygons(objects, edges) {
			var polygons = [];
			for (var n = 0; n < nodes.length; n++) {
				for (var e = 0; e < nodes[n].edges.length; e++) {
					var startNodeId = n;
					var nodeIds = [n];
					var edge = clone(nodes[n].edges[e]);
					if (edge.startNode == startNodeId) {
						nodeIds.push(edge.finNode);
					} else if (edge.finNode == startNodeId) {
						nodeIds.push(edge.startNode);
						edge.pos.reverse();
						edge.reversed = true;
					}
					var polygon = [edge];
					var edgeIds = [edge.edgeId];
					var count = 0;
					while (nodeIds.last() !== startNodeId && count < 999) {
						var edge = getNodeNextEdge(nodes[nodeIds.last()], edgeIds.last());
						if (edge.startNode == nodeIds.last()) {
							nodeIds.push(edge.finNode);
						} else if (edge.finNode == nodeIds.last()) {
							nodeIds.push(edge.startNode);
							edge.pos.reverse();
							edge.reversed = true;
						}
						polygon.push(edge);
						edgeIds.push(edge.edgeId);
						count++;
					}
					if (nodeIds.last() !== startNode.nodeId) {
						polygons.push({
							edges: polygon,
							holes: [],
							edgeIds: edgeIds,
							nodeIds: nodeIds
						});
					}
				}
			}

			if (draw.fillPath.devMode == true)
				console.log(clone(polygons));

			for (var p1 = polygons.length - 1; p1 >= 0; p1--) { // remove duplicate polygons
				var poly1 = polygons[p1];
				for (var p2 = polygons.length - 1; p2 >= 0; p2--) {
					if (p1 == p2)
						continue;
					var poly2 = polygons[p2];
					if (poly1.edges.length >= poly2.edges.length) {
						var countMatchingSides = 0;
						for (var p3 = 0; p3 < poly1.edges.length; p3++) {
							var edge1 = poly1.edges[p3];
							for (var p4 = 0; p4 < poly2.edges.length; p4++) {
								var edge2 = poly2.edges[p4];
								if (edge1.edgeId == edge2.edgeId) {
									countMatchingSides++;
									break;
								}
							}
						}
						if (countMatchingSides == poly2.edges.length) {
							polygons.splice(p1, 1);
							break;
						}
					}
				}
			}

			if (draw.fillPath.devMode == true)
				console.log(clone(polygons));

			for (var p = 0; p < polygons.length; p++) {
				var polygon = polygons[p];
				polygon.polygonId = p;
				var pos = []; // combine edges
				for (var p2 = 0; p2 < polygon.edges.length; p2++) {
					pos = pos.concat(polygon.edges[p2].pos);
				}
				for (var p2 = 0; p2 < pos.length; p2++) {
					var p3 = (p2 + 1) % pos.length;
					if (un(pos[p2]) || un(pos[p3]))
						continue;
					if (pos[p2][0] == pos[p3][0] && pos[p2][1] == pos[p3][1])
						pos.splice(p3, 1);
				}
				while (pos.indexOf(undefined) > -1) {
					pos.splice(pos.indexOf(undefined), 1);
				}
				if (polygonClockwiseTest(pos) == false)
					pos.reverse();
				polygon.pos = pos;
			}
			if (draw.fillPath.devMode == true)
				console.log(clone(polygons));

			var holeIds = [];
			for (var p1 = polygons.length - 1; p1 >= 0; p1--) {
				var poly1 = polygons[p1];
				for (var p2 = p1 - 1; p2 >= 0; p2--) {
					var poly2 = polygons[p2];
					if (draw.fillPath.devMode == true)
						console.log(p1, p2);
					if (draw.fillPath.devMode == true)
						console.log(poly1.edgeIds, poly2.edgeIds);
					var comp = comparePolygons(poly1, poly2);
					if (draw.fillPath.devMode == true)
						console.log(comp.type, comp);
					switch (comp.type) {
					case 'same':
						polygons.splice(p1, 1);
						p2 = -1;
						break;
					case 'poly1HoleOfPoly2':
						var hole = {
							pos: clone(poly1.pos).reverse(),
							polygonId: poly1.polygonId
						};
						poly2.holes.push(hole);
						holeIds.push([poly2.polygonId, poly1.polygonId]);
						break;
					case 'poly2HoleOfPoly1':
						var hole = {
							pos: clone(poly2.pos).reverse(),
							polygonId: poly2.polygonId
						};
						poly1.holes.push(hole);
						holeIds.push([poly1.polygonId, poly2.polygonId]);
						break;
					case 'poly1SubOfPoly2':
						polygons.splice(p2, 1);
						p1--;
						poly1 = polygons[p1];
						break;
					case 'poly2SubOfPoly1':
						polygons.splice(p1, 1);
						p2 = -1;
						break;
					case 'none':
					case 'adjacent':
						break;
					}
				}
			}
			//console.log(holeIds);
			if (draw.fillPath.devMode == true)
				console.log(clone(polygons));
			var polygonIds = [];
			for (var p1 = 0; p1 < polygons.length; p1++) {
				polygonIds.push(polygons[p1].polygonId);
			}
			for (var p1 = 0; p1 < polygons.length; p1++) {
				var holes = polygons[p1].holes;
				for (var h1 = holes.length - 1; h1 >= 0; h1--) {
					var poly1 = holes[h1];
					if (polygonIds.indexOf(poly1.polygonId) == -1) {
						holes.splice(h1, 1);
					}
				}
			}

			for (var p1 = polygons.length - 1; p1 >= 0; p1--) {
				var holes = polygons[p1].holes;
				if (holes.length < 2)
					continue;
				for (var h1 = holes.length - 1; h1 >= 0; h1--) {
					var poly1 = holes[h1];
					for (var h2 = holes.length - 1; h2 >= 0; h2--) {
						if (h1 == h2)
							continue;
						var poly2 = holes[h2];
						for (var h3 = 0; h3 < holeIds.length; h3++) {
							if (holeIds[h3][0] == poly2.polygonId && holeIds[h3][1] == poly1.polygonId) {
								poly1.holeInHole = true;
								//console.log(poly2.polygonId,'has hole:',poly1.polygonId);
								h2 = -1;
								break;
							}
						}
					}
				}
			}
			return polygons;
		}

		function comparePolygons(polygon1, polygon2) {
			var poly1 = clone(polygon1);
			var poly2 = clone(polygon2);
			//console.log(polygon1,poly1);
			//console.log(polygon2,poly2);
			var comp = {
				edgesCommon: [],
				verticesCommon: [],
				type: 'none',
				poly1: poly1,
				poly2: poly2
			};
			for (var p3 = 0; p3 < poly1.edges.length; p3++) {
				var edge1 = poly1.edges[p3];
				for (var p4 = 0; p4 < poly2.edges.length; p4++) {
					var edge2 = poly2.edges[p4];
					if (edge1.edgeId == edge2.edgeId) {
						comp.edgesCommon.push(edge1.edgeId);
					}
				}
			}
			for (var p3 = 0; p3 < poly1.pos.length; p3++) {
				var pos1 = poly1.pos[p3];
				for (var p4 = 0; p4 < poly2.pos.length; p4++) {
					var pos2 = poly2.pos[p4];
					if (pos1[0] == pos2[0] && pos1[1] == pos2[1] || dist(pos1, pos2) < 3) {
						comp.verticesCommon.push([pos1[0], pos1[1]]);
						pos1[5] = true;
						pos2[5] = true;
					}
				}
			}

			if (poly1.edgeIds.length == poly2.edgeIds.length && comp.edgesCommon.length == poly2.edgeIds.length) {
				comp.type = 'same';
			} else if (comp.edgesCommon.length == 0) {
				for (var p = 0; p < poly1.pos.length; p++) {
					var pos1 = poly1.pos[p];
					var pos2 = poly1.pos[(p + 1) % poly1.pos.length];
					if (pos1[5] !== true && pointInPolygon(pos1, poly2.pos, false) == true) {
						comp.poly1HasPointInsidePoly2 = true;
						comp.poly1PointInPoly2 = pos1;
						break;
					}
				}
				for (var p = 0; p < poly2.pos.length; p++) {
					var pos1 = poly2.pos[p];
					var pos2 = poly2.pos[(p + 1) % poly2.pos.length]
						if (pos1[5] !== true && pointInPolygon(pos1, poly1.pos, false) == true) {
							comp.poly2HasPointInsidePoly1 = true;
							comp.poly2PointInPoly1 = pos1;
							break;
						}
				}
				if (comp.poly1HasPointInsidePoly2 == true) {
					comp.type = 'poly1HoleOfPoly2';
				} else if (comp.poly2HasPointInsidePoly1 == true) {
					comp.type = 'poly2HoleOfPoly1';
				}
			} else {
				var pos1 = poly1.pos;
				var pos2 = poly2.pos;

				var aInsideB = false;
				var aOutsideB = false;
				for (var p1 = 0; p1 < pos1.length; p1++) {
					if (aInsideB == true && aOutsideB == true)
						break;
					var curr = pos1[p1];
					for (var p2 = 0; p2 < pos2.length; p2++) {
						if (dist(pos2[p2], curr) < 3) {
							curr[8] = 0;
							break;
						}
					}
					if (curr[8] !== 0) {
						if (pointDistToPolygonBoundary(curr, pos2) < 3) {
							curr[8] = 0;
						} else if (pointInPolygon(curr, pos2, false) == true) {
							curr[8] = 1;
							aInsideB = true;
							continue;
						}
					}
					var next = pos1[(p1 + 1) % pos1.length];
					var mid = [(curr[0] + next[0]) / 2, (curr[1] + next[1]) / 2];
					if (pointDistToPolygonBoundary(mid, pos2) < 3) {
						curr[8] = 0;
					} else if (pointInPolygon(mid, pos2, false) == true) {
						curr[8] = 1;
						aInsideB = true;
						continue;
					}
					curr[8] = -1;
					aOutsideB = true;
				}

				var bInsideA = false;
				var bOutsideA = false;
				for (var p2 = 0; p2 < pos2.length; p2++) {
					if (bInsideA == true && bOutsideA == true)
						break;
					var curr = pos2[p2];
					for (var p1 = 0; p1 < pos1.length; p1++) {
						if (dist(pos1[p1], curr) < 3) {
							curr[8] = 0;
							break;
						}
					}
					if (curr[8] !== 0) {
						if (pointDistToPolygonBoundary(curr, pos1) < 3) {
							curr[8] = 0;
						} else if (pointInPolygon(curr, pos1, false) == true) {
							curr[8] = 1;
							bInsideA = true;
							continue;
						}
					}
					var next = pos2[(p2 + 1) % pos2.length];
					var mid = [(curr[0] + next[0]) / 2, (curr[1] + next[1]) / 2];
					if (pointDistToPolygonBoundary(mid, pos1) < 3) {
						curr[8] = 0;
					} else if (pointInPolygon(mid, pos1, false) == true) {
						curr[8] = 1;
						bInsideA = true;
						continue;
					}
					curr[8] = -1;
					bOutsideA = true;
				}

				if (draw.fillPath.devMode == true) {
					console.log(aInsideB);
					console.log(aOutsideB);
					console.log(bInsideA);
					console.log(bOutsideA);
				}

				if (aInsideB == true && bOutsideA == true) {
					comp.type = 'poly1SubOfPoly2';
				} else if (bInsideA == true && aOutsideB == true) {
					comp.type = 'poly2SubOfPoly1';
				} else {
					comp.type = 'adjacent';
				}
			}
			return comp;

		}

		function getPointInsidePolygon(polygon) {
			var xMin = polygon[0][0];
			var xMax = polygon[0][0];
			var yMin = polygon[0][1];
			var yMax = polygon[0][1];
			for (var p = 1; p < polygon.length; p++) {
				xMin = Math.min(xMin, polygon[p][0]);
				xMax = Math.max(xMax, polygon[p][0]);
				yMin = Math.min(yMin, polygon[p][1]);
				yMax = Math.max(yMax, polygon[p][1]);
			}
			var pos2 = false;
			var minDist = 0;
			var count = 0;
			var foundCount = 0;
			do {
				var pos = [xMin + Math.random() * (xMax - xMin), yMin + Math.random() * (yMax - yMin)];
				var inPolygon = pointInPolygon(pos, polygon, false);
				if (inPolygon == true) {
					var posDist = pointDistToPolygonBoundary(pos, polygon);
					if (posDist > minDist) {
						pos2 = pos;
						minDist = posDist;
					}
					foundCount++;
				}
				count++;
			} while (foundCount < 40 && count < 1000);
			return pos2;
		}
		function pointDistToPolygonBoundary(point, pos) {
			var dist = 100000;
			for (var p = 0; p < pos.length; p++) {
				var pos1 = pos[p];
				var pos2 = pos[(p + 1) % pos.length];
				var dist = Math.min(dist, distancePointToLineSegment(point, pos1, pos2));
			}
			return dist;
		}
		function polygonHoleOfPolygon(polygon1, polygon2) {
			// is polygon1 a hole of polygon2? (with no edges in common)
			if (polygonsEdgeInCommon(polygon1, polygon2) == true)
				return false;
			if (polygonInsidePolygon(polygon1.pos, polygon2.pos, false))
				return true;
			return false;
		}
		function polygonSubOfPolygon(polygon1, polygon2) {
			// is polygon1 a part of polygon2? (with at least one edge in common)
			if (polygonsEdgeInCommon(polygon1, polygon2) == false)
				return false;
			if (polygonInsidePolygon(polygon1.pos, polygon2.pos, true))
				return true;
			return false;
		}
		function polygonsEdgeInCommon(polygon1, polygon2) {
			for (var e1 = 0; e1 < polygon1.edgeIds.length; e1++) {
				for (var e2 = 0; e2 < polygon2.edgeIds.length; e2++) {
					if (polygon1.edgeIds[e1] == polygon2.edgeIds[e2])
						return true;
				}
			}
			return false;
		}
		function polygonInsidePolygon(polygon1, polygon2, includeBoundary) {
			// is polygon1 inside polygon2
			if (pointInPolygon(polygon1[0], polygon2, includeBoundary) == false)
				return false;
			for (var i = 0; i < polygon1.length; i++) {
				var line1 = [polygon1[i], polygon1[(i + 1) % polygon1.length]];
				for (var j = 0; j < polygon2.length; j++) {
					var line2 = [polygon2[j], polygon2[(j + 1) % polygon2.length]];
					if (lineSegmentsIntersectionTest(line1, line2) == true) {
						if (includeBoundary == false)
							return false;
						var p3 = isPointOnLineSegment(line1[0], line2[0], line2[1]);
						var p4 = isPointOnLineSegment(line1[1], line2[0], line2[1]);
						if (p3 == false && p4 == false)
							return false;
						if (p3 == true && p4 == true)
							continue; // edge is part of edge
						if (p3 == true && p4 == false && pointInPolygon(line1[1], polygon2, true) == false)
							return false;
						if (p3 == false && p4 == true && pointInPolygon(line1[0], polygon2, true) == false)
							return false;
					}
				}
			}
			return true;
		}
		function polygonsVertexInCommon(polygon1, polygon2) {
			for (var e1 = 0; e1 < polygon1.pos.length; e1++) {
				for (var e2 = 0; e2 < polygon2.pos.length; e2++) {
					if (dist(polygon1.pos[e1], polygon2.pos[e2]) < 0.1)
						return true;
				}
			}
			return false;
		}
		function pointInPolygon(point, pos, includeBoundary) {
			//https://stackoverflow.com/questions/8721406/how-to-determine-if-a-point-is-inside-a-2d-convex-polygon/23223947#23223947
			var result = false;
			for (var i = 0, j = pos.length - 1; i < pos.length; j = i++) {
				if ((pos[i][1] > point[1]) != (pos[j][1] > point[1]) &&
					(point[0] < (pos[j][0] - pos[i][0]) * (point[1] - pos[i][1]) / (pos[j][1] - pos[i][1]) + pos[i][0])) {
					result = !result;
				}
			}
			if (result == false && includeBoundary == true) {
				return pointOnPolygonBoundary(point, pos);
			}
			return result;
		}
		function pointOnPolygonBoundary(point, pos, tol) {
			if (un(tol))
				tol = 0.01;
			for (var p = 0; p < pos.length; p++) {
				var pos1 = pos[p];
				var pos2 = pos[(p + 1) % pos.length];
				if (isPointOnLineSegment(point, pos1, pos2, tol) == true)
					return true;
			}
			return false;
		}

		function getMeanPoint(polygon) {
			var total = [0, 0];
			for (var i = 0; i < polygon.length; i++) {
				total[0] += polygon[i][0];
				total[1] += polygon[i][1];
			}
			return [total[0] / polygon.length, total[1] / polygon.length];
		}
		function drawAllEdges(edges, polygons) { // for dev only
			var ctx = draw.cursorCanvas.ctx;
			//ctx.clear();
			var colors = ['#A00', '#00A', '#0A0', '#AA0', '#A0A', '#0AA', '#066', '#606', '#066', '#660', '#660', '#606'];
			/*
			for (var p = 0; p < polygons.length; p++) {
			var pos = polygons[p].pos;
			ctx.beginPath();
			ctx.lineWidth = 5;
			var color = colors[p%colors.length];
			ctx.fillStyle = colorA(color,0.4);
			draw.fillPath.drawPolygonToCtx(ctx,pos);
			ctx.fill();
			}//*/
			//*
			for (var e = 0; e < edges.length; e++) {
				var edge = edges[e];
				ctx.beginPath();
				ctx.lineWidth = 5;
				var color = colors[e % colors.length];
				ctx.strokeStyle = color;
				draw.fillPath.drawPolygonToCtx(ctx, edge.pos);
				ctx.stroke();

				var mid = draw.fillPath.getPolygonMidPoint(edge.pos);
				text({
					ctx: ctx,
					text: ['<<color:' + color + '>>' + String(edge.edgeId)],
					rect: [mid[0] - 50, mid[1] - 50, 100, 100],
					align: [0, 0],
					box: {
						type: 'tight',
						color: '#FFF',
						borderColor: color,
						borderWidth: 2
					}
				});
			} //*/
			//*
			for (var n = 0; n < nodes.length; n++) {
				var pos = nodes[n].pos;
				ctx.beginPath();
				ctx.fillStyle = '#F00';
				ctx.moveTo(pos[0], pos[1]);
				ctx.arc(pos[0], pos[1], 8, 0, 2 * Math.PI);
				ctx.fill();

				var mid = draw.fillPath.getPolygonMidPoint(pos);
				text({
					ctx: ctx,
					text: ['<<color:#F00>>' + String(nodes[n].nodeId)],
					rect: [pos[0] + 20, pos[1] - 50, 50, 100],
					align: [0, 0],
					box: {
						type: 'tight',
						color: '#FCF',
						borderColor: '#F00',
						borderWidth: 2,
						radius: 30
					}
				});
			} //*/

		}
	},
	drawPolygonToCtx: function (ctx, pos) {
		ctx.moveTo(pos[0][0], pos[0][1]);
		for (var p = 1; p < pos.length; p++) {
			ctx.lineTo(pos[p][0], pos[p][1]);
			if (pos[p - 1][2] == true && pos.length > 2) {
				if (p < pos.length - 1) {
					ctx.quadraticCurveTo(pos[p][0], pos[p][1], (pos[p][0] + pos[p + 1][0]) / 2, (pos[p][1] + pos[p + 1][1]) / 2);
				} else {
					ctx.quadraticCurveTo(pos[p][0], pos[p][1], pos[p - 1][0], pos[p - 1][1]);
				}
			} else {
				ctx.lineTo(pos[p][0], pos[p][1]);
			}
		}
		ctx.lineTo(pos.last()[0], pos.last()[1]);
	},
	getPolygonMidPoint: function (pos) {
		if (pos.length % 2 == 1) {
			return pos[Math.floor(pos.length / 2)];
		} else {
			var pos1 = pos[pos.length / 2 - 1];
			var pos2 = pos[pos.length / 2];
			return [(pos1[0] + pos2[0]) / 2, (pos1[1] + pos2[1]) / 2];
		}
	},
	getPolygonOfArc: function (arc, radianSeperation) {
		if (un(radianSeperation)) {
			radianSeperation = 0.2;
			//radianSeperation = Math.acos(1-(6*6)/(2*arc.radius*arc.radius));
			//console.log(radianSeperation);
		}
		var a1 = arc.startAngle;
		var a2 = arc.finAngle;
		var polygon = [];
		var a = a1;
		if (arc.circle == true) {
			a = 2 * Math.PI;
			while (a > radianSeperation) {
				addPos(a);
				a -= radianSeperation;
			}
		} else if (arc.clockwise == false) {
			if (a2 > a1)
				a2 -= 2 * Math.PI;
			while (a > a2 + radianSeperation) {
				addPos(a);
				a -= radianSeperation;
			}
		} else {
			if (a2 < a1)
				a2 += 2 * Math.PI;
			while (a < a2 - radianSeperation) {
				addPos(a);
				a += radianSeperation;
			}
		}
		addPos(a2);
		return polygon;

		function addPos(a) {
			polygon.push([
					arc.center[0] + arc.radius * Math.cos(a),
					arc.center[1] + arc.radius * Math.sin(a)
				]);
		}
	},
	getPolygonOfCircle: function (circle, radianSeperation) {
		if (un(radianSeperation))
			radianSeperation = 0.2;
		var polygon = [];
		var a = 2 * Math.PI;
		while (a > radianSeperation) {
			addPos(a);
			a -= radianSeperation;
		}
		addPos(0);
		return polygon;

		function addPos(a) {
			polygon.push([
					circle.center[0] + circle.radius * Math.cos(a),
					circle.center[1] + circle.radius * Math.sin(a)
				]);
		}
	}
}
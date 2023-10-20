// Javascipt document

if (un(window.draw)) var draw = {};

draw.grid3 = {
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
			type: 'grid3',
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
			yZero: 350,
			path:[]
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

		//ctx.strokeStyle = obj.color;
		//ctx.lineWidth = obj.thickness;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		
		draw.grid3.drawGrid(ctx,obj2);
		draw.grid3.drawGridPaths(ctx,obj);		
		if (obj.type === 'grid3' && draw.mode === 'edit') draw.grid3.drawControls(ctx,obj,path);
	},
	drawOverlay:function(ctx, obj, path) {
		if (obj.type === 'grid3' && draw.mode !== 'edit') draw.grid3.drawControls(ctx,obj,path);
	},

	drawGrid: function(ctx,grid) {
		var mode = grid.angleMode || 'deg'; // if mode == "rad", xMin, xMax, xMinorStep, xMajorStep are all multiples of pi, given as [num,denom], which will be simplified when text is drawn
		var hoursMode = boolean(grid.hoursMode,false); // if hoursMode == true, x-values will be converted to (eg. 12:00);
		
		var left = grid.left;
		var top = grid.top;
		var width = grid.width;
		var height = grid.height;
		
		if (mode == 'rad') {
			if (typeof grid.xMin == 'number') {
				var xMin = Math.PI * grid.xMin;
			} else {
				var xMin = Math.PI * grid.xMin[0] / grid.xMin[1];
			}
			if (typeof grid.xMax == 'number') {
				var xMax = Math.PI * grid.xMax;
			} else {
				var xMax = Math.PI * grid.xMax[0] / grid.xMax[1];
			}
			if (typeof grid.xMinorStep == 'number') {
				var xMinorStep = Math.PI * grid.xMinorStep;
			} else {
				var xMinorStep = Math.PI * grid.xMinorStep[0] / grid.xMinorStep[1];
			}
			if (typeof grid.xMajorStep == 'number') {
				var xMajorStep = Math.PI * grid.xMajorStep;
			} else {
				var xMajorStep = Math.PI * grid.xMajorStep[0] / grid.xMajorStep[1];
			}
		} else {
			var xMin = grid.xMin;
			var xMax = grid.xMax;
			var xMinorStep = grid.xMinorStep;
			var xMajorStep = grid.xMajorStep;
			var xScaleStep = grid.xScaleStep || xMajorStep;
		}

		if (xMin >= xMax) {
			console.log('Error:  xMin >= xMax');
			return;
		}
		
		var yMin = grid.yMin;
		var yMax = grid.yMax;
		var yMinorStep = grid.yMinorStep;		
		var yMajorStep = grid.yMajorStep;
		var yScaleStep = grid.yScaleStep || yMajorStep;
		
		if (yMin >= yMax) {
			console.log('Error:  yMin >= yMax');
			return;
		}

		var showGrid = boolean(grid.showGrid,true);
		var showScales = boolean(grid.showScales,true);
		var showXScale = boolean(grid.showXScale,showScales);
		var showYScale = boolean(grid.showYScale,showScales);
		var showLabels = boolean(grid.showLabels,true);
		var showAxes = boolean(grid.showAxes,true);
		var showBorder = boolean(grid.showBorder,showAxes);
		
		var originStyle = grid.originStyle || 'circle'; // 'circle', 'numbers' or 'none'
		var xScaleOffset = grid.xScaleOffset || 4;
		var yScaleOffset = grid.yScaleOffset || 0;
		
		var minorWidth = grid.minorWidth || 1;
		var majorWidth = grid.majorWidth || grid.thickness || 2.4;
		
		var labelPos = [left,top,left+width,top+height];
		
		var sf = grid.sf || 1; // scale factor for text, origin, lineWidths
		
		// work out the spacing for minor and major steps
		var xMinorSpacing = (width * xMinorStep) / (xMax - xMin);
		var xMajorSpacing = (width * xMajorStep) / (xMax - xMin);	
		var yMinorSpacing = (height * yMinorStep) / (yMax - yMin);
		var yMajorSpacing = (height * yMajorStep) / (yMax - yMin);
		
		var gridFontSize = grid.fontSize || 24*sf;
		var backColor = grid.backColor || mainCanvasFillStyle || '#FFC';
		var invertedBackColor = getShades(backColor,true);
		if (['#FFF','#fff','#FFFFFF','#ffffff'].indexOf(backColor) == -1) {
			var minorColor = grid.minorColor || '#999';
		} else {
			var minorColor = grid.minorColor || invertedBackColor[9] || '#999'; // slightly darker if white background - for printing
		}
		var majorColor = grid.majorColor || grid.color || '#999';
		var originColor = grid.axesColor || '#666';
		var xAxisColor = grid.axesColor || '#000';
		var yAxisColor = grid.axesColor || '#000';
		var borderColor = grid.axesColor || '#000';

		var xScaleColor = grid.xScaleColor || grid.scaleColor || xAxisColor;
		var yScaleColor = grid.yScaleColor || grid.scaleColor || yAxisColor;
		
		var dots = boolean(grid.dots,false);
		var dotsColor = def([grid.dotsColor,majorColor]);
		var dotsRadius = def([grid.dotsRadius,3])*sf;
		
		var labelFontSize = gridFontSize * 1.375;	
		var xAxisLabel = grid.xAxisLabel || ['x'];
		var yAxisLabel = grid.yAxisLabel || ['y'];
		if (typeof xAxisLabel == 'string') xAxisLabel = [xAxisLabel];
		if (typeof yAxisLabel == 'string') yAxisLabel = [yAxisLabel];
		
		// work out the coordinates of the origin
		var x0 = left - (xMin * width) / (xMax - xMin);
		var y0 = top + (yMax * height) / (yMax - yMin);
		
		var x0DisplayPos = Math.max(Math.min(x0,left+width),left);
		var y0DisplayPos = Math.max(Math.min(y0,top+height),top);

		var xScaleRects = [];
		var yScaleRects = [];
		if (showScales == true) {
			if (originStyle == 'circle' && x0 >= left && x0 <= left + width && y0 >= top && y0 <= top + height) {
				ctx.textAlign = 'center';
				ctx.textBaseline = "middle";
				ctx.strokeStyle = originColor;
				ctx.lineWidth = 2*sf;
				ctx.beginPath();
				ctx.arc(x0,y0,10*(gridFontSize/(24*sf))*sf,0,2*Math.PI);
				ctx.closePath();
				ctx.stroke();
				labelPos[0] = Math.min(labelPos[0],x0-10);
				labelPos[1] = Math.min(labelPos[1],y0-10);
				labelPos[2] = Math.max(labelPos[2],x0+10);
				labelPos[3] = Math.max(labelPos[3],y0+10);	
			}
			
			if (showXScale == true) {
				// draw axes numbers
				ctx.font = gridFontSize+'px Arial';
				ctx.textAlign = "center";
				ctx.textBaseline = "top";

				if (mode == "rad") {
					// draw positive x axis numbers as multiple of pi
					var xAxisPoint = x0 + xMajorSpacing;
					var major = 1;
					while (roundToNearest(xAxisPoint,0.001) <= roundToNearest(left+width,0.001)) {
						if (xAxisPoint >= left) {
							if (typeof grid.xMajorStep == 'number') {
								var frac = {num:grid.xMajorStep*major,denom:1};
							} else {
								var frac = {num:grid.xMajorStep[0]*major,denom:grid.xMajorStep[1]};
							}
							var axisValue = multOfPiText(frac);
							var params = {ctx:ctx,textArray:axisValue,font:"algebra",fontSize:gridFontSize,left:xAxisPoint-50,width:100,top:y0DisplayPos+xScaleOffset-4,height:50,minTightWidth:1,minTightHeight:1,align:'center',vertAlign:'top',color:xScaleColor,box:{type:'none',borderColor:backColor,borderWidth:0.01,color:backColor,padding:1}};
							var labelText = text(params);
							labelPos[0] = Math.min(labelPos[0],labelText.tightRect[0]);
							labelPos[1] = Math.min(labelPos[1],labelText.tightRect[1]);
							labelPos[2] = Math.max(labelPos[2],labelText.tightRect[0]+labelText.tightRect[2]);
							labelPos[3] = Math.max(labelPos[3],labelText.tightRect[1]+labelText.tightRect[3]);	
							xScaleRects.push(labelText.tightRect);
						}
						major += 1;
						xAxisPoint += xMajorSpacing;				
					}			
					// draw negative x axis numbers as multiple of pi
					xAxisPoint = x0 - xMajorSpacing;
					major = -1;
					while (roundToNearest(xAxisPoint,0.001) >= roundToNearest(left,0.001)) {
						if (xAxisPoint < left + width) {
							if (typeof grid.xMajorStep == 'number') {
								var frac = {num:grid.xMajorStep*major,denom:1};
							} else {
								var frac = {num:grid.xMajorStep[0]*major,denom:grid.xMajorStep[1]};
							}					
							var axisValue = multOfPiText(frac);
							var params = {ctx:ctx,textArray:axisValue,font:"algebra",fontSize:gridFontSize,left:xAxisPoint-50,width:100,top:y0DisplayPos+xScaleOffset-4,height:50,minTightWidth:1,minTightHeight:1,align:'center',vertAlign:'top',color:xScaleColor,box:{type:'none',borderColor:backColor,borderWidth:0.01,color:backColor,padding:1}};
							var labelText = text(params);
							labelPos[0] = Math.min(labelPos[0],labelText.tightRect[0]);
							labelPos[1] = Math.min(labelPos[1],labelText.tightRect[1]);
							labelPos[2] = Math.max(labelPos[2],labelText.tightRect[0]+labelText.tightRect[2]);
							labelPos[3] = Math.max(labelPos[3],labelText.tightRect[1]+labelText.tightRect[3]);	
							xScaleRects.push(labelText.tightRect);
						}
						major -= 1;
						xAxisPoint -= xMajorSpacing;				
					}
				} else if (hoursMode == true) {
					// positive x numbers
					var xAxisPoint = x0 + xMajorSpacing;
					var major = 1;
					while (roundToNearest(xAxisPoint,0.001) <= roundToNearest(left+width,0.001)) {
						if (xAxisPoint >= left) {
							var value = convertToHoursMins(major*xMajorStep);
							var axisValue = [String(value)];
							var textWidth = ctx.measureText(String(axisValue)).width;
							var labelText = drawMathsText(ctx, axisValue, gridFontSize, xAxisPoint, y0DisplayPos + xScaleOffset + 0.5 * gridFontSize, true, [], 'center', 'middle', xScaleColor);
							labelPos[0] = Math.min(labelPos[0],labelText.tightRect[0]);
							labelPos[1] = Math.min(labelPos[1],labelText.tightRect[1]);
							labelPos[2] = Math.max(labelPos[2],labelText.tightRect[0]+labelText.tightRect[2]);
							labelPos[3] = Math.max(labelPos[3],labelText.tightRect[1]+labelText.tightRect[3]);	
							xScaleRects.push([xAxisPoint - textWidth / 2, y0DisplayPos + xScaleOffset-1, textWidth, gridFontSize * 1.1]);
						}
						major += 1;
						xAxisPoint += xMajorSpacing;
					}			
				} else {
					var xScaleSpacing = (width * xScaleStep) / (xMax - xMin);
					
					// positive x numbers
					var xAxisPoint = x0 + xScaleSpacing;
					var major = 1;
					//var placeValue = Math.pow(10,Math.floor(Math.log(xScaleStep)/Math.log(10)));
					var placeValue = xScaleStep >= 1 ? 1 : Math.pow(10,String(xScaleStep).indexOf('.')-String(xScaleStep).length+1);
					while (roundToNearest(xAxisPoint,0.001) <= roundToNearest(left+width,0.001)) {
						if (xAxisPoint >= left) {
							var value = roundToNearest(major*xScaleStep,placeValue);
							var axisValue = [String(value)];
							var textWidth = ctx.measureText(String(axisValue)).width;
							var labelText = drawMathsText(ctx, axisValue, gridFontSize, xAxisPoint, y0DisplayPos + xScaleOffset + 0.5 * gridFontSize, true, [], 'center', 'middle', xScaleColor);	
							labelPos[0] = Math.min(labelPos[0],labelText.tightRect[0]);
							labelPos[1] = Math.min(labelPos[1],labelText.tightRect[1]);
							labelPos[2] = Math.max(labelPos[2],labelText.tightRect[0]+labelText.tightRect[2]);
							labelPos[3] = Math.max(labelPos[3],labelText.tightRect[1]+labelText.tightRect[3]);	
							xScaleRects.push([xAxisPoint - textWidth / 2, y0DisplayPos + xScaleOffset-1, textWidth, gridFontSize * 1.1]);
						}
						major += 1;
						xAxisPoint += xScaleSpacing;
					}

					// negative x numbers
					var xAxisPoint = x0 - xScaleSpacing;
					var major = -1;
					while (roundToNearest(xAxisPoint,0.001) >= roundToNearest(left,0.001)) {
						if (xAxisPoint < left + width) {
							var value = roundToNearest(major*xScaleStep,placeValue);
							var axisValue = [String(value)];
							var textWidth = ctx.measureText(String(axisValue)).width;
							var labelText = drawMathsText(ctx, axisValue, gridFontSize, xAxisPoint, y0DisplayPos + xScaleOffset + 0.5 * gridFontSize, true, [], 'center', 'middle', xScaleColor);
							labelPos[0] = Math.min(labelPos[0],labelText.tightRect[0]);
							labelPos[1] = Math.min(labelPos[1],labelText.tightRect[1]);
							labelPos[2] = Math.max(labelPos[2],labelText.tightRect[0]+labelText.tightRect[2]);
							labelPos[3] = Math.max(labelPos[3],labelText.tightRect[1]+labelText.tightRect[3]);	
							xScaleRects.push([xAxisPoint - textWidth / 2, y0DisplayPos + xScaleOffset-1, textWidth, gridFontSize * 1.1]);
						}
						major -= 1;
						xAxisPoint -= xScaleSpacing;
					}
				}
			}
			
			if (showYScale == true) {
				ctx.textBaseline = "middle";
				ctx.textAlign = "right";
				if (!un(grid.yScaleColor)) {
					ctx.fillStyle = grid.yScaleColor;
				} else {
					ctx.fillStyle = yAxisColor;
				}
				ctx.font = gridFontSize+"px Arial";
				
				var yScaleSpacing = (height * yScaleStep) / (yMax - yMin);
				
				// positive y numbers
				var yAxisPoint = y0 - yScaleSpacing;
				var major = 1;
				//var placeValue = Math.pow(10,Math.floor(Math.log(yScaleStep)/Math.log(10)));
				var placeValue = yScaleStep >= 1 ? 1 : Math.pow(10,String(yScaleStep).indexOf('.')-String(yScaleStep).length+1);
				while (roundToNearest(yAxisPoint,0.001) >= roundToNearest(top,0.001)) {
					if (yAxisPoint <= top + height) {	
						var axisValue = Number(roundSF(major*yScaleStep, 5));
						var textWidth = ctx.measureText(String(axisValue)).width	
						var labelText = drawMathsText(ctx, String(axisValue), gridFontSize, x0DisplayPos - 10*sf - yScaleOffset, yAxisPoint - 2, true, [], 'right', 'middle', yScaleColor);	
						labelPos[0] = Math.min(labelPos[0],labelText.tightRect[0]);
						labelPos[1] = Math.min(labelPos[1],labelText.tightRect[1]);
						labelPos[2] = Math.max(labelPos[2],labelText.tightRect[0]+labelText.tightRect[2]);
						labelPos[3] = Math.max(labelPos[3],labelText.tightRect[1]+labelText.tightRect[3]);		
						yScaleRects.push([x0DisplayPos - textWidth - 11*sf - yScaleOffset, yAxisPoint - gridFontSize * 0.5, textWidth + 3*sf, gridFontSize]);
					}
					major += 1;
					yAxisPoint -= yScaleSpacing;
				}

				// negative y numbers
				var yAxisPoint = y0 + yScaleSpacing;
				var major = -1;
				while (roundToNearest(yAxisPoint,0.001) <= roundToNearest(top+height,0.001)) {
					if (yAxisPoint >= top) {
						var axisValue = Number(roundSF(major*yScaleStep, 5));
						var textWidth = ctx.measureText(String(axisValue)).width	
						var labelText = drawMathsText(ctx, String(axisValue), gridFontSize, x0DisplayPos - 10*sf - yScaleOffset, yAxisPoint - 2, true, [], 'right', 'middle', yScaleColor);
						labelPos[0] = Math.min(labelPos[0],labelText.tightRect[0]);
						labelPos[1] = Math.min(labelPos[1],labelText.tightRect[1]);
						labelPos[2] = Math.max(labelPos[2],labelText.tightRect[0]+labelText.tightRect[2]);
						labelPos[3] = Math.max(labelPos[3],labelText.tightRect[1]+labelText.tightRect[3]);	
						yScaleRects.push([x0DisplayPos - textWidth - 11*sf - yScaleOffset, yAxisPoint - gridFontSize * 0.5, textWidth + 3*sf, gridFontSize]);
					}
					major -= 1;
					yAxisPoint += yScaleSpacing;
					
				}
			}
		}

		function drawHorizLine(p1,p2) {
			var y = p1[1];
			var x1 = Math.min(p1[0],p2[0]);
			var x2 = Math.max(p1[0],p2[0]);
			var rects = [];
			for (var p = 0; p < xScaleRects.length; p++) {
				var rect = xScaleRects[p];
				if (rect[0] > x2 || rect[0]+rect[2] < x1) continue;
				if (y > rect[1] && y < rect[1]+rect[3]) rects.push(rect);
			}
			for (var p = 0; p < yScaleRects.length; p++) {
				var rect = yScaleRects[p];
				if (rect[0] > x2 || rect[0]+rect[2] < x1) continue;
				if (y > rect[1] && y < rect[1]+rect[3]) rects.push(rect);
			}
			rects.sort(function(a,b) {return a[0]-b[0];});
			if (rects[0] instanceof Array && rects[0][0] < x1 && rects[0][0]+rects[0][2] > x1) {
				x1 = rects[0][0]+rects[0][2];
				rects.shift();
			}
			if (rects.last() instanceof Array && rects.last()[0] < x2 && rects.last()[0]+rects.last()[2] > x2) {
				x2 = rects.last()[0];
				rects.pop();
			}
			ctx.moveTo(x1,y);
			var padding = 2;
			for (var r = 0; r < rects.length; r++) {
				var left = rects[r][0]-padding;
				var right = rects[r][0]+rects[r][2]+padding;
				ctx.lineTo(left,y);
				ctx.moveTo(right,y);
			}
			ctx.lineTo(x2,y);
		}
		function drawVertLine(p1,p2) {
			var x = p1[0];
			var y1 = Math.min(p1[1],p2[1]);
			var y2 = Math.max(p1[1],p2[1]);
			var rects = [];
			for (var p = 0; p < xScaleRects.length; p++) {
				var rect = xScaleRects[p];
				if (rect[1] > y2 || rect[1]+rect[3] < y1) continue;
				if (x > rect[0] && x < rect[0]+rect[2]) rects.push(rect);
			}
			for (var p = 0; p < yScaleRects.length; p++) {
				var rect = yScaleRects[p];
				if (rect[1] > y2 || rect[1]+rect[3] < y1) continue;
				if (x > rect[0] && x < rect[0]+rect[2]) rects.push(rect);
			}
			rects.sort(function(a,b) {return a[1]-b[1];});
			if (rects[0] instanceof Array && rects[0][1] < y1 && rects[0][1]+rects[0][3] > y1) {
				y1 = rects[0][1]+rects[0][3];
				rects.shift();
			}
			if (rects.last() instanceof Array && rects.last()[1] < y2 && rects.last()[1]+rects.last()[3] > y2) {
				y2 = rects.last()[1];
				rects.pop();
			}
			ctx.moveTo(x,y1);
			var padding = 2;
			for (var r = 0; r < rects.length; r++) {
				var top = rects[r][1]-padding;
				var bottom = rects[r][1]+rects[r][3]+padding;
				ctx.lineTo(x,top);
				ctx.moveTo(x,bottom);
			}
			ctx.lineTo(x,y2);
		}

		if (showGrid == true) {
			// draw minor grid lines
			ctx.strokeStyle = minorColor;
			ctx.lineWidth = minorWidth*sf;
			ctx.beginPath();
			// draws positive xMinor lines
			var xAxisPoint = x0 + xMinorSpacing;
			while (xAxisPoint <= left+width+0.01) {
				if (xAxisPoint >= left-0.01) {
					drawVertLine([xAxisPoint,top],[xAxisPoint,top+height]);
				}
				xAxisPoint += xMinorSpacing;
			}
			// draws negative xMinor lines
			var xAxisPoint = x0 - xMinorSpacing;
			while (xAxisPoint >= left-0.01) {
				if (xAxisPoint <= left+width+0.01) {
					drawVertLine([xAxisPoint,top],[xAxisPoint,top+height]);
				}
				xAxisPoint -= xMinorSpacing;
			}
			// draws positive yMinor lines
			var yAxisPoint = y0 - yMinorSpacing;
			while (yAxisPoint >= top-0.01) {
				if (yAxisPoint <= top+height+0.01) {
					drawHorizLine([left,yAxisPoint],[left+width,yAxisPoint]);
				}
				yAxisPoint -= yMinorSpacing;
			}
			// draws negative yMinor lines
			var yAxisPoint = y0 + yMinorSpacing;
			while (yAxisPoint <= top+height+0.01) {
				if (yAxisPoint >= top-0.01) {
					drawHorizLine([left,yAxisPoint],[left+width,yAxisPoint]);
				}
				yAxisPoint += yMinorSpacing;
			}
			ctx.closePath();
			ctx.stroke();		
			
			// draw major lines
			ctx.strokeStyle = majorColor;
			ctx.lineWidth = majorWidth*sf;
			ctx.beginPath();
			// draws positive xMajor lines
			if (showAxes == true) {
				var xAxisPoint = x0 + xMajorSpacing;
			} else {
				var xAxisPoint = x0;
			}
			while (xAxisPoint <= left+width+0.01) {
				if (xAxisPoint >= left-0.01) {
					drawVertLine([xAxisPoint,top],[xAxisPoint,top+height]);
				}
				xAxisPoint += xMajorSpacing;
			}
			// draws negative xMajor lines
			var xAxisPoint = x0 - xMajorSpacing;
			while (xAxisPoint >= left-0.01) {
				if (xAxisPoint <= left+width+0.01) {
					drawVertLine([xAxisPoint,top],[xAxisPoint,top+height]);
				}
				xAxisPoint -= xMajorSpacing;
			}
			// draws positive yMajor lines
			if (showAxes == true) {
				var yAxisPoint = y0 - yMajorSpacing;
			} else {
				var yAxisPoint = y0;
			}		
			while (yAxisPoint >= top-0.01) {
				if (yAxisPoint <= top+height+0.01) {
					drawHorizLine([left,yAxisPoint],[left+width,yAxisPoint]);
				}
				yAxisPoint -= yMajorSpacing;
			}
			// draws negative yMajor lines
			var yAxisPoint = y0 + yMajorSpacing;
			while (yAxisPoint <= top+height+0.01) {
				if (yAxisPoint >= top-0.01) {		
					drawHorizLine([left,yAxisPoint],[left+width,yAxisPoint]);
				}
				yAxisPoint += yMajorSpacing;
			}
			ctx.closePath();
			ctx.stroke();
		}
		
		if (dots == true) {
			ctx.fillStyle = dotsColor;
			var xMin2 = Math.floor(Math.abs(xMin)/xMajorStep)*xMajorStep*(xMin/Math.abs(xMin));
			var xMax2 = Math.floor(Math.abs(xMax)/xMajorStep)*xMajorStep*(xMax/Math.abs(xMax));
			var yMin2 = Math.floor(Math.abs(yMin)/yMajorStep)*yMajorStep*(yMin/Math.abs(yMin));
			var yMax2 = Math.floor(Math.abs(yMax)/yMajorStep)*yMajorStep*(yMax/Math.abs(yMax));
			for (var x = xMin2; x <= xMax2; x += xMajorStep) {
				var xPos = getPosOfCoordX2(x,left,width,xMin,xMax);
				for (var y = yMin2; y <= yMax2; y += yMajorStep) {
					var yPos = getPosOfCoordY2(y,top,height,yMin,yMax);
					ctx.beginPath();
					ctx.arc(xPos,yPos,dotsRadius,0,2*Math.PI);
					ctx.fill();
				}
			}
		}

		if (showLabels == true) {
			if (!un(grid.axisLabels)) {
				if (!un(draw) && !un(draw.hiddenCanvas)) {
					var ctx2 = draw.hiddenCanvas.ctx;
				} else {
					if (!un(window.hiddenCanvas)) window.hiddenCanvas = newctx({vis:false});
					var ctx2 = hiddenCanvas.ctx;
				}
				
				var xDist = grid.axisLabels[0].dist || 30;
				var measureTextX = text({ctx:ctx2,text:['<<fontSize:'+labelFontSize+'>>'].concat(grid.axisLabels[0].text),rect:[0,0,grid.width,100],measureOnly:true}).tightRect;
				var xLabelRect = [grid.left+grid.width-measureTextX[2],grid.top+grid.height+xDist,measureTextX[2],measureTextX[3]];
				
				text({ctx:ctx,text:['<<fontSize:'+labelFontSize+'>>'].concat(grid.axisLabels[0].text),rect:xLabelRect,align:[0,0]});
				
				var yDist = grid.axisLabels[1].dist || 50;
				var measureTextY = text({ctx:ctx2,text:['<<fontSize:'+labelFontSize+'>>'].concat(grid.axisLabels[1].text),rect:[0,0,grid.height,100],measureOnly:true}).tightRect;
				var yLabelRect = [grid.left-yDist-measureTextY[3],grid.top,measureTextY[3],measureTextY[2]];
				ctx.save();
				ctx.translate(yLabelRect[0],yLabelRect[1]+measureTextY[2]);
				ctx.rotate(-Math.PI/2);
					text({ctx:ctx,text:['<<fontSize:'+labelFontSize+'>>'].concat(grid.axisLabels[1].text),rect:[0,0,measureTextY[2],measureTextY[3]],align:[0,0]});
				ctx.restore();
				
				
			} else {
				yAxisLabel2 = yAxisLabel.slice(0);
				yAxisLabel2.unshift('<<font:algebra>><<fontSize:'+labelFontSize+'>><<align:center>><<color:'+yAxisColor+'>>');
				var yLabel = drawMathsText(ctx, yAxisLabel2, labelFontSize, x0DisplayPos+5, top-labelFontSize+5, true, [], 'center', 'middle', yAxisColor);
				if (arraysEqual(yAxisLabel,['y'])) {
					yLabel.tightRect[3] = (3/4) * yLabel.tightRect[3];
					yLabel.tightRect[1] += (1/3) * yLabel.tightRect[3];
				}
				labelPos[0] = Math.min(labelPos[0],yLabel.tightRect[0]);
				labelPos[1] = Math.min(labelPos[1],yLabel.tightRect[1]);
				labelPos[2] = Math.max(labelPos[2],yLabel.tightRect[0]+yLabel.tightRect[2]);
				labelPos[3] = Math.max(labelPos[3],yLabel.tightRect[1]+yLabel.tightRect[3]);
				xAxisLabel2 = xAxisLabel.slice();
				xAxisLabel2.unshift('<<font:algebra>><<fontSize:'+labelFontSize+'>><<align:left>><<color:'+xAxisColor+'>>');
				var xLabel = drawMathsText(ctx, xAxisLabel2, labelFontSize, left+width+10, y0DisplayPos-labelFontSize, true, [], 'left', 'top', xAxisColor);
				if (arraysEqual(xAxisLabel,['x'])) {
					xLabel.tightRect[3] = (3/4) * xLabel.tightRect[3];
					xLabel.tightRect[1] += (1/3) * xLabel.tightRect[3];
				}		
				labelPos[0] = Math.min(labelPos[0],xLabel.tightRect[0]);
				labelPos[1] = Math.min(labelPos[1],xLabel.tightRect[1]);
				labelPos[2] = Math.max(labelPos[2],xLabel.tightRect[0]+yLabel.tightRect[2]);
				labelPos[3] = Math.max(labelPos[3],xLabel.tightRect[1]+yLabel.tightRect[3]);
			}
		}
		
		if (showBorder == true) {	
			// draw a black rectangular border
			ctx.strokeStyle = borderColor;
			ctx.lineWidth = 4*sf;
			ctx.beginPath();
			drawHorizLine([left,top],[left+width,top]);
			drawHorizLine([left,top+height],[left+width,top+height]);
			drawVertLine([left,top],[left,top+height]);
			drawVertLine([left+width,top],[left+width,top+height]);
			ctx.stroke();
		}
		
		if ((originStyle == 'numbers' || y0 < top-0.01 || y0 > top+height+0.01) && showXScale == true && x0 >= left && x0 <= left+width) {
			var params = {ctx:ctx,textArray:["0"],font:"algebra",fontSize:gridFontSize,left:x0-50,width:100,top:y0DisplayPos+xScaleOffset-4,height:50,minTightWidth:1,minTightHeight:1,align:'center',vertAlign:'top',color:xScaleColor,box:{type:'tight',borderColor:backColor,borderWidth:0.01,color:backColor,padding:1}};
			var labelText = text(params);
			labelPos[0] = Math.min(labelPos[0],labelText.tightRect[0]);
			labelPos[1] = Math.min(labelPos[1],labelText.tightRect[1]);
			labelPos[2] = Math.max(labelPos[2],labelText.tightRect[0]+labelText.tightRect[2]);
			labelPos[3] = Math.max(labelPos[3],labelText.tightRect[1]+labelText.tightRect[3]);	
		}
		if ((originStyle == 'numbers' || x0 < left-0.01 || x0 > left+width+0.01) && showYScale == true && y0 >= top && y0 <= top+height) {
			ctx.textBaseline = "middle";
			ctx.textAlign = "right";
			ctx.fillStyle = yAxisColor;
			ctx.font = gridFontSize+"px Arial";
			var textWidth = ctx.measureText("0").width;
			ctx.fillStyle = backColor;
			ctx.fillRect(x0DisplayPos - textWidth - 11*sf - yScaleOffset, y0 - gridFontSize * 0.5, textWidth + 3*sf, gridFontSize);
			var labelText = drawMathsText(ctx, "0", gridFontSize, x0DisplayPos - 10*sf - yScaleOffset, y0 - 2, true, [], 'right', 'middle', yScaleColor);
			labelPos[0] = Math.min(labelPos[0],labelText.tightRect[0]);
			labelPos[1] = Math.min(labelPos[1],labelText.tightRect[1]);
			labelPos[2] = Math.max(labelPos[2],labelText.tightRect[0]+labelText.tightRect[2]);
			labelPos[3] = Math.max(labelPos[3],labelText.tightRect[1]+labelText.tightRect[3]);	
		}
		
		if (showAxes == true) {
			// draw axes
			ctx.beginPath();
			ctx.strokeStyle = xAxisColor;
			ctx.lineWidth = 3*sf;	
			ctx.moveTo(left, y0DisplayPos);
			ctx.lineTo(left + width-10*sf, y0DisplayPos);	
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.strokeStyle = yAxisColor;
			ctx.lineWidth = 3*sf;
			ctx.moveTo(x0DisplayPos, top+10*sf);
			ctx.lineTo(x0DisplayPos, top + height);	
			ctx.closePath();
			ctx.stroke();
			
			// draw an arrow at the top of the y-axis
			ctx.strokeStyle = yAxisColor;
			ctx.beginPath();
			ctx.moveTo(x0DisplayPos, top + 2*sf);
			ctx.lineTo(x0DisplayPos - 5*sf, top + 12*sf);
			ctx.lineTo(x0DisplayPos + 5*sf, top + 12*sf);
			ctx.lineTo(x0DisplayPos, top + 2*sf);
			ctx.closePath();
			ctx.stroke();
			
			ctx.fillStyle = yAxisColor;
			ctx.beginPath();
			ctx.moveTo(x0DisplayPos, top + 2*sf);
			ctx.lineTo(x0DisplayPos - 5*sf, top + 12*sf);
			ctx.lineTo(x0DisplayPos + 5*sf, top + 12*sf);
			ctx.lineTo(x0DisplayPos, top + 2*sf);
			ctx.closePath();
			ctx.fill();

			// draw an arrow at the right of the x-axis
			ctx.strokeStyle = xAxisColor;	
			ctx.beginPath();
			ctx.moveTo(left + width - 2*sf, y0DisplayPos);
			ctx.lineTo(left + width - 12*sf, y0DisplayPos - 5*sf);
			ctx.lineTo(left + width - 12*sf, y0DisplayPos + 5*sf);
			ctx.lineTo(left + width - 2*sf, y0DisplayPos);
			ctx.closePath();
			ctx.stroke();
			
			ctx.fillStyle = xAxisColor;
			ctx.beginPath();
			ctx.moveTo(left + width - 2*sf, y0DisplayPos);
			ctx.lineTo(left + width - 12*sf, y0DisplayPos - 5*sf);
			ctx.lineTo(left + width - 12*sf, y0DisplayPos + 5*sf);
			ctx.lineTo(left + width - 2*sf, y0DisplayPos);
			ctx.closePath();
			ctx.fill();
		}
		
		labelPos[0] = Math.min(labelPos[0],x0DisplayPos-5);
		labelPos[1] = Math.min(labelPos[1],y0DisplayPos-5);
		labelPos[2] = Math.max(labelPos[2],x0DisplayPos+5);
		labelPos[3] = Math.max(labelPos[3],y0DisplayPos+5);
		if (!un(yLabelRect) && !un(xLabelRect)) {
			labelPos[0] = Math.min(labelPos[0],yLabelRect[0]);
			labelPos[3] = Math.max(labelPos[3],xLabelRect[1]+xLabelRect[3]);
		}
			
		return {labelBorder:[labelPos[0],labelPos[1],labelPos[2]-labelPos[0],labelPos[3]-labelPos[1],labelPos[2],labelPos[3]]};
	},
	
	drawGridPaths: function(ctx,grid) {
		if (grid.path instanceof Array) {
			var ctx2 = ctx;		
			var a = 1, b = 1, c = 1, m = 1;
			if (typeof grid.vars === 'object') {
				if (typeof grid.vars.a === 'object') a = grid.vars.a.value;
				if (typeof grid.vars.b === 'object') b = grid.vars.b.value;
				if (typeof grid.vars.c === 'object') c = grid.vars.c.value;
				if (typeof grid.vars.m === 'object') m = grid.vars.m.value;
			}
			var inequalitiesShadeOut = grid.inequalitiesShadeOut === true;
			if (un(grid._gridValuesForPathCalcs) ||
				grid._gridValuesForPathCalcs.xMin !== grid.xMin ||
				grid._gridValuesForPathCalcs.xMax !== grid.xMax ||
				grid._gridValuesForPathCalcs.yMin !== grid.yMin ||
				grid._gridValuesForPathCalcs.yMax !== grid.yMax ||
				grid._gridValuesForPathCalcs.left !== grid.left ||
				grid._gridValuesForPathCalcs.top !== grid.top ||
				grid._gridValuesForPathCalcs.width !== grid.width ||
				grid._gridValuesForPathCalcs.height !== grid.height ||
				grid._gridValuesForPathCalcs.inequalitiesShadeOut !== inequalitiesShadeOut ||
				grid._gridValuesForPathCalcs.a !== a ||
				grid._gridValuesForPathCalcs.b !== b ||
				grid._gridValuesForPathCalcs.c !== c ||
				grid._gridValuesForPathCalcs.m !== m
			) {
				grid._gridValuesForPathCalcs = {xMin:grid.xMin,xMax:grid.xMax,yMin:grid.yMin,yMax:grid.yMax,left:grid.left,top:grid.top,width:grid.width,height:grid.height,inequalitiesShadeOut:inequalitiesShadeOut,a:a,b:b,c:c,m:m};
				grid._recalc = true;
			}
			for (var p = 0; p < grid.path.length; p++) {
				var gridPath = grid.path[p];
				if (gridPath.placeholder === true) {
					if (p < grid.path.length-1) {
						grid.path.splice(p,1);
						p--;
					}
					continue;
				}
				if (gridPath.visible === false || gridPath.valid === false || gridPath.color === 'none') continue;
				var drawOnSeparateCanvas = gridPath.type !== 'label';
				if (typeof ctx.canvas === 'object' && un(ctx.canvas.tagName)) drawOnSeparateCanvas = false; // drawing to pdf
				var drawOnSeparateCanvasPadding = 0;
				if (drawOnSeparateCanvas === true) {
					if (un(grid._canvas)) {
						grid._canvas = document.createElement('canvas');
						grid._canvas.width = 1200;
						grid._canvas.height = 1700;
						grid._ctx = grid._canvas.getContext('2d');
					}
					ctx = grid._ctx;
					ctx.clearRect(0,0,1200,1700);
				} else {
					ctx = ctx2;
				}
				switch (gridPath.type) {
					case 'fill':
						if (grid._recalc === true || un(gridPath._canvasFillPaths)) {
							draw.grid3.calcFillPath(grid, gridPath);
						}
						draw.grid3.drawFillPath(ctx, gridPath);
						break;
					case 'point':
						gridPath._canvasPos = getPosOfCoord(gridPath.pos, grid);
						if (drawOnSeparateCanvas !== true && (gridPath._canvasPos[0] < grid.left || gridPath._canvasPos[0] > grid.left+grid.width || gridPath._canvasPos[1] < grid.top || gridPath._canvasPos[1] > grid.top+grid.height)) continue;
						ctx.save();
						ctx.beginPath();
						var style = gridPath.style || 'circle';
						var color = gridPath.color || '#00F';
						if (style == 'circle') {
							var radius = !un(gridPath.radius) ? gridPath.radius : gridPath._selected ? 10 : 6;
							ctx.fillStyle = color;
							ctx.arc(gridPath._canvasPos[0], gridPath._canvasPos[1], radius, 0, 2 * Math.PI);
							ctx.fill();
						} else if (style == 'cross') {
							ctx.strokeStyle = color;
							ctx.lineWidth = !un(gridPath.lineWidth) ? gridPath.lineWidth : gridPath._selected ? 6 : 3;
							var size = !un(gridPath.radius) ? gridPath.radius * (5/6) : 5;
							var x = gridPath._canvasPos[0];
							var y = gridPath._canvasPos[1];
							ctx.moveTo(x-size,y-size);
							ctx.lineTo(x+size,y+size);
							ctx.moveTo(x-size,y+size);
							ctx.lineTo(x+size,y-size);
							ctx.stroke();
						}
						ctx.restore();
						drawOnSeparateCanvasPadding = 10;
						break;
					case 'circle':
					case 'function-circle':
					case 'inequality-circle':
					case 'ellipse':
					case 'function-ellipse':
					case 'inequality-ellipse':
						if (grid._recalc === true || un(gridPath._canvasCenter) || un(gridPath._canvasRadius)) {
							gridPath._canvasCenter = getPosOfCoord(gridPath.center, grid);
							gridPath._canvasRadius = [
								getPosOfCoordX2(gridPath.center[0] + gridPath.radius[0], grid.left, grid.width, grid.xMin, grid.xMax) - gridPath._canvasCenter[0],
								gridPath._canvasCenter[1] - getPosOfCoordY2(gridPath.center[1] + gridPath.radius[1], grid.top, grid.height, grid.yMin, grid.yMax)
							];
						}
						ctx.save();
						if (gridPath.type.indexOf('inequality') === 0) {
							ctx.beginPath();
							ctx.fillStyle = gridPath.fillColor;
							if (gridPath.symbol === '<' || gridPath.symbol === '≤' || (grid.inequalitiesShadeOut && (gridPath.symbol === '>' || gridPath.symbol === '≥'))) {
								ctx.ellipse(gridPath._canvasCenter[0], gridPath._canvasCenter[1], gridPath._canvasRadius[0], gridPath._canvasRadius[1], 0, 0, 2 * Math.PI);
							} else {
								ctx.moveTo(grid.left,grid.top);
								ctx.lineTo(grid.left+grid.width,grid.top);
								ctx.lineTo(grid.left+grid.width,grid.top+grid.height);
								ctx.lineTo(grid.left,grid.top+grid.height);
								ctx.lineTo(grid.left,grid.top);
								ctx.moveTo(gridPath._canvasCenter[0]+gridPath._canvasRadius[0], gridPath._canvasCenter[1]);
								ctx.ellipse(gridPath._canvasCenter[0], gridPath._canvasCenter[1], gridPath._canvasRadius[0], gridPath._canvasRadius[1], 0, 2 * Math.PI, 0, true);
							}
							ctx.fill();
						}
						ctx.beginPath();
						ctx.strokeStyle = gridPath.color || '#00F';
						ctx.lineWidth = !un(gridPath.lineWidth) ? gridPath.lineWidth : gridPath._selected ? 7 : 5;
						if (gridPath.symbol === '<' || gridPath.symbol === '>') ctx.setLineDash([15,15]);
						ctx.ellipse(gridPath._canvasCenter[0], gridPath._canvasCenter[1], gridPath._canvasRadius[0], gridPath._canvasRadius[1], 0, 0, 2 * Math.PI);
						ctx.stroke();
						ctx.setLineDash([]);
						ctx.restore();
						break;
					case 'label':						
						var pos = getPosOfCoord(gridPath.pos, grid);
						var width = !un(gridPath.width) ? gridPath.width : 400;
						var height = !un(gridPath.height) ? gridPath.height : 400;
						gridPath.rect = [pos[0] - width/2, pos[1] - height/2, width, height];
						if (un(gridPath.align)) gridPath.align = [0, 0];
						if (!un(gridPath.offset)) {
							gridPath.rect[0] += gridPath.offset[0];
							gridPath.rect[1] += gridPath.offset[1];
						}
						gridPath.ctx = draw.hiddenCanvas.ctx;
						gridPath.measureOnly = true;
						gridPath._tightRect = text(gridPath).tightRect;
						delete gridPath.ctx;
						delete gridPath.measureOnly;
						if (gridPath.labelForPos instanceof Array) {
							if (grid.xMin <= gridPath.labelForPos[0] && gridPath.labelForPos[0] <= grid.xMax && grid.yMin <= gridPath.labelForPos[1] && gridPath.labelForPos[1] <= grid.yMax) {
								draw.text2.draw(ctx, gridPath);
							}
						} else {
							var padding = 25;
							var gl = grid.left-padding;
							var gt = grid.top-padding;
							var gr = grid.left+grid.width+padding;
							var gb = grid.top+grid.height+padding;
							var l = gridPath._tightRect[0];
							var t = gridPath._tightRect[1];
							var r = gridPath._tightRect[0]+gridPath._tightRect[2];
							var b = gridPath._tightRect[1]+gridPath._tightRect[3];
							//console.log(gridPath,[gl,gt,gr,gb],[l,t,r,b],(((l > gl && l < gr) || (r > gl && r < gl)) && ((t > gt && t < gb) || (b > gt && b < gb))), l > gl && l < gr,r > gl && r < gl,t > gt && t < gb,b > gt && b < gb);
							if (((l > gl && l < gr) || (r > gl && r < gl)) && ((t > gt && t < gb) || (b > gt && b < gb))) {
								draw.text2.draw(ctx, gridPath);
							}
						}
						break;
					case 'function-linear':
					case 'inequality-linear':
						if (grid._recalc === true || un(gridPath._pos)) {
							if (gridPath.yTerm === false) {
								gridPath._pos = [[gridPath.func(0,a,b,c,m),0],[gridPath.func(1,a,b,c,m),1]];
							} else {
								gridPath._pos = [[0,gridPath.func(0,a,b,c,m)],[1,gridPath.func(1,a,b,c,m)]];
							}
						}
						var lineWidth = !un(gridPath.lineWidth) ? gridPath.lineWidth : gridPath._selected ? 7 : 5;
						var color = gridPath.color || gridPath.strokeStyle || '#00F';
						if (gridPath.type === 'function-linear') {
							draw.grid3.drawLine(ctx, grid, gridPath._pos[0][0], gridPath._pos[0][1], gridPath._pos[1][0], gridPath._pos[1][1], color, lineWidth, false, false, false, 0, 0);
						} else {
							draw.grid3.drawInequalityLinear(ctx,grid,gridPath);
						}
						if ((gridPath._pos[0][0] === gridPath._pos[1][0] && (gridPath._pos[0][0] === grid.xMin || gridPath._pos[0][0] === grid.xMax)) ||
							(gridPath._pos[0][1] === gridPath._pos[1][1] && (gridPath._pos[0][1] === grid.yMin || gridPath._pos[0][1] === grid.yMax))) {
							drawOnSeparateCanvasPadding = lineWidth / 2;
						}
						break;
					case 'inequality-3part':
						gridPath._pos1 = gridPath.func1(x,y,a,b,c,m);
						gridPath._pos2 = gridPath.func2(x,y,a,b,c,m);
						draw.grid3.drawInequality3Part(ctx,grid,gridPath);
						break;
					case 'line':
						if (gridPath.pos[0][0] !== gridPath.pos[1][0] || gridPath.pos[0][1] !== gridPath.pos[1][1]) {
							var lineWidth = !un(gridPath.lineWidth) ? gridPath.lineWidth : gridPath._selected ? 7 : 5;
							var color = gridPath.color || gridPath.strokeStyle || '#00F';
							var showLinePoints = !un(gridPath.showLinePoints) ? gridPath.showLinePoints && gridPath.linePointsStyle !== 'circle' : false;
							var dash = gridPath.dash instanceof Array || typeof gridPath.dash === 'number';
							var dashWidth = gridPath.dash instanceof Array ? gridPath.dash[0] : typeof gridPath.dash === 'number' ? gridPath.dash : 0;
							var dashGapWidth = gridPath.dash instanceof Array ? gridPath.dash[1] : typeof gridPath.dash === 'number' ? gridPath.dash : 0;
							draw.grid3.drawLine(ctx, grid, gridPath.pos[0][0], gridPath.pos[0][1], gridPath.pos[1][0], gridPath.pos[1][1], color, lineWidth, showLinePoints, false, dash, dashWidth, dashGapWidth);
							if ((gridPath.pos[0][0] === gridPath.pos[1][0] && (gridPath.pos[0][0] === grid.xMin || gridPath.pos[0][0] === grid.xMax)) ||
								(gridPath.pos[0][1] === gridPath.pos[1][1] && (gridPath.pos[0][1] === grid.yMin || gridPath.pos[0][1] === grid.yMax))) {
								drawOnSeparateCanvasPadding = lineWidth / 2;
							}
							if (gridPath.showLinePoints === true && gridPath.linePointsStyle === 'circle') {
								var pos1 = getPosOfCoord(gridPath.pos[0], grid);
								var pos2 = getPosOfCoord(gridPath.pos[1], grid);
								ctx.save();
								ctx.beginPath();
								ctx.fillStyle = color;
								ctx.arc(pos1[0], pos1[1], 6, 0, 2*Math.PI);
								ctx.arc(pos2[0], pos2[1], 6, 0, 2*Math.PI);
								ctx.fill();
								ctx.restore();
							}
						}
						break;
					case 'lineSegment':
						if (gridPath.pos[0][0] !== gridPath.pos[1][0] || gridPath.pos[0][1] !== gridPath.pos[1][1]) {
							var lineWidth = !un(gridPath.lineWidth) ? gridPath.lineWidth : gridPath._selected ? 7 : 5;
							var color = gridPath.color || gridPath.strokeStyle || '#00F';
							
							/*var showLinePoints = !un(gridPath.showLinePoints) ? gridPath.showLinePoints : false;
							draw.grid3.drawLine(ctx, grid, gridPath.pos[0][0], gridPath.pos[0][1], gridPath.pos[1][0], gridPath.pos[1][1], color, lineWidth, showLinePoints, true, true);*/
							
							var pos1 = getPosOfCoord(gridPath.pos[0], grid);
							var pos2 = getPosOfCoord(gridPath.pos[1], grid);
							ctx.beginPath();
							if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function(){};
							ctx.setLineDash([]);
							if (gridPath.dash instanceof Array) ctx.setLineDash(gridPath.dash);
							ctx.lineWidth = lineWidth;
							ctx.strokeStyle = color;
							ctx.moveTo(pos1[0],pos1[1]);
							ctx.lineTo(pos2[0],pos2[1]);
							ctx.setLineDash([]);
							ctx.stroke();
							
							if (gridPath.showLinePoints === true) {
								if (gridPath.linePointsStyle === 'circle') {
									ctx.save();
									ctx.beginPath();
									ctx.fillStyle = color;
									ctx.arc(pos1[0], pos1[1], 6, 0, 2*Math.PI);
									ctx.arc(pos2[0], pos2[1], 6, 0, 2*Math.PI);
									ctx.fill();
									ctx.restore();
								} else {
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
							}
							
							if (drawOnSeparateCanvas === true && (gridPath.pos[0][0] === gridPath.pos[1][0] && (gridPath.pos[0][0] === grid.xMin || gridPath.pos[0][0] === grid.xMax)) || (gridPath.pos[0][1] === gridPath.pos[1][1] && (gridPath.pos[0][1] === grid.yMin || gridPath.pos[0][1] === grid.yMax))) drawOnSeparateCanvasPadding = lineWidth / 2;
							
							if (gridPath.endStart == 'open') {
								drawArrow({
									context: ctx,
									startX: pos2[0],
									startY: pos2[1],
									finX: pos1[0],
									finY: pos1[1],
									arrowLength: gridPath.endStartSize,
									color: color,
									lineWidth: lineWidth,
									arrowLineWidth: lineWidth,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}
							if (gridPath.endStart == 'closed') {
								drawArrow({
									context: ctx,
									startX: pos2[0],
									startY: pos2[1],
									finX: pos1[0],
									finY: pos1[1],
									arrowLength: gridPath.endStartSize,
									color: color,
									lineWidth: lineWidth,
									arrowLineWidth: lineWidth,
									fillArrow: true,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}

							if (gridPath.endMid == 'dash') {
								drawDash(ctx, pos1[0], pos1[1], pos2[0], pos2[1], 8);
								drawOnSeparateCanvasPadding = 10;
							}
							if (gridPath.endMid == 'dash2') {
								drawDoubleDash(ctx, pos1[0], pos1[1], pos2[0], pos2[1], 8);
								drawOnSeparateCanvasPadding = 10;
							}
							if (gridPath.endMid == 'open') {
								drawParallelArrow({
									context: ctx,
									startX: pos1[0],
									startY: pos1[1],
									finX: pos2[0],
									finY: pos2[1],
									arrowLength: gridPath.endMidSize,
									color: color,
									lineWidth: lineWidth,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}
							if (gridPath.endMid == 'open2') {
								drawParallelArrow({
									context: ctx,
									startX: pos1[0],
									startY: pos1[1],
									finX: pos2[0],
									finY: pos2[1],
									arrowLength: gridPath.endMidSize,
									color: color,
									lineWidth: lineWidth,
									numOfArrows: 2,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}

							if (gridPath.endFin == 'open') {
								drawArrow({
									context: ctx,
									startX: pos1[0],
									startY: pos1[1],
									finX: pos2[0],
									finY: pos2[1],
									arrowLength: gridPath.endFinSize,
									color: color,
									lineWidth: lineWidth,
									arrowLineWidth: lineWidth,
									showLine:false
								});
								drawOnSeparateCanvasPadding = 10;
							}
							if (gridPath.endFin == 'closed') {
								drawArrow({
									context: ctx,
									startX: pos1[0],
									startY: pos1[1],
									finX: pos2[0],
									finY: pos2[1],
									arrowLength: gridPath.endFinSize,
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
						gridPath.ctx = ctx;
						drawPolygon(gridPath);
						delete gridPath.ctx;
						break;
					case 'polygon2':
						gridPath.ctx = ctx;
						gridPath.points = [];
						for (var i = 0; i < gridPath.pos.length; i++) gridPath.points[i] = getPosOfCoord(gridPath.pos[i], grid);
						drawPolygon(gridPath);
						delete gridPath.ctx;
						delete gridPath.points;
						if (drawOnSeparateCanvas === true) {
							for (var p2 = 0; p2 < gridPath.pos.length; p2++) {
								var p0 = gridPath.pos[p2];
								var p1 = gridPath.pos[(p2+1)%gridPath.pos.length];
								if ((p0[0] === p1[0] && (p0[0] === grid.xMin || p0[0] === grid.xMax)) || (p0[1] === p1[1] && (p0[1] === grid.yMin || p0[1] === grid.yMax))) {
									var lineWidth = gridPath.lineWidth || 6;
									drawOnSeparateCanvasPadding = lineWidth/2;
									break;
								}
							}						
						}
						break;
					case 'function':
					case 'inequality':
						if (grid._recalc === true || un(gridPath._canvasLinePaths)) {
							draw.grid3.calcFunction(grid, gridPath);
						}
						draw.grid3.drawFunction(ctx, grid, gridPath);
						var lineWidth = !un(gridPath.lineWidth) ? gridPath.lineWidth : 4;
						drawOnSeparateCanvasPadding = lineWidth / 2;
						break;
					case 'rect':
						gridPath.points = [
							getPosOfCoord([gridPath.rect[0], gridPath.rect[1]], grid),
							getPosOfCoord([gridPath.rect[0] + gridPath.rect[2], gridPath.rect[1]], grid),
							getPosOfCoord([gridPath.rect[0] + gridPath.rect[2], gridPath.rect[1] + gridPath.rect[3]], grid),
							getPosOfCoord([gridPath.rect[0], gridPath.rect[1] + gridPath.rect[3]], grid)
						];
						gridPath.ctx = ctx;
						drawPolygon(gridPath);
						delete gridPath.points;
						delete gridPath.ctx;
						break;
				}
				ctx = ctx2;
				if (drawOnSeparateCanvas === true) {
					ctx.drawImage(grid._canvas,grid.left-drawOnSeparateCanvasPadding,grid.top-drawOnSeparateCanvasPadding,grid.width+2*drawOnSeparateCanvasPadding,grid.height+2*drawOnSeparateCanvasPadding,grid.left-drawOnSeparateCanvasPadding,grid.top-drawOnSeparateCanvasPadding,grid.width+2*drawOnSeparateCanvasPadding,grid.height+2*drawOnSeparateCanvasPadding);	
				}
			}
			delete grid._recalc;
		}
	},
	drawLine: function(ctx,grid,x1,y1,x2,y2,opt_color,opt_thickness,opt_showPoints,opt_lineSegment,opt_dash,opt_dashWidth,opt_dashGapWidth) {
		var sf = 1;
		var mode = grid.angleMode || 'deg';
		var left = grid.left;
		var top = grid.top;
		var width = grid.width;
		var height = grid.height;
		var yMin = grid.yMin;
		var yMax = grid.yMax;			

		if (mode == 'deg' || typeof grid.xMin == 'number') {
			var xMin = grid.xMin;
			var xMax = grid.xMax;
		} else {
			var xMin = Math.PI*grid.xMin[0]/grid.xMin[1];
			var xMax = Math.PI*grid.xMax[0]/grid.xMax[1];
		}
		
		var color = opt_color || '#00F';
		var thickness = grid.lineWidth || opt_thickness || 3;
		var showPoints = boolean(opt_showPoints, false);
		var lineSegment = boolean(opt_lineSegment, false);
		var dash = boolean(opt_dash, false);
		var dashWidth = def([opt_dashWidth,15]);
		var dashGapWidth = def([opt_dashGapWidth,5]);

		var x1Pos = getPosOfCoordX2(x1, left, width, xMin, xMax);
		var y1Pos = getPosOfCoordY2(y1, top, height, yMin, yMax);			
		var x2Pos = getPosOfCoordX2(x2, left, width, xMin, xMax);
		var y2Pos = getPosOfCoordY2(y2, top, height, yMin, yMax);
		
		if (opt_lineSegment === true) {
			// check if the line is visible on the grid	
			var x1vis = 0;
			var y1vis = 0;
			var x2vis = 0;
			var y2vis = 0;
			if (x1 < xMin) x1vis = -1;
			if (x1 > xMax) x1vis = 1;
			if (y1 < yMin) y1vis = -1;
			if (y1 > yMax) y1vis = 1;			
			if (x2 < xMin) x2vis = -1;
			if (x2 > xMax) x2vis = 1;
			if (y2 < yMin) y2vis = -1;
			if (y2 > yMax) y2vis = 1;
			if ((x1vis == -1 && x2vis == -1) || (x1vis == 1 && x2vis == 1) || (y1vis == -1 && y2vis == -1) || (y1vis == 1 && y2vis == 1)) return;
		}
		
		// check if the line (treated as infinite) intersects at least one of the four edges of the grid
		if (intersects2(x1,y1,x2,y2,xMin,yMin,xMax,yMin) == false &&
			intersects2(x1,y1,x2,y2,xMin,yMin,xMin,yMax) == false &&
			intersects2(x1,y1,x2,y2,xMax,yMin,xMax,yMax) == false &&
			intersects2(x1,y1,x2,y2,xMin,yMax,xMax,yMax) == false) {
			return;
		}
		
		ctx.save();
		if (typeof ctx.setLineDash !== 'function') ctx.setLineDash = function(){};
		ctx.setLineDash([]);
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';			
		if (showPoints == true) {
			// plot the two points if they are visible on the grid
			if (x1 >= xMin && x1 <= xMax && y1 >= yMin && y1 <= yMax) {
				ctx.save();
				ctx.strokeStyle = color;
				ctx.lineWidth = thickness * 0.7;
				ctx.beginPath();
				ctx.moveTo(x1Pos - 8, y1Pos - 8);
				ctx.lineTo(x1Pos + 8, y1Pos + 8);
				ctx.moveTo(x1Pos - 8, y1Pos + 8);
				ctx.lineTo(x1Pos + 8, y1Pos - 8);			
				ctx.closePath();
				ctx.stroke();
				ctx.restore();
			}
			if (x2 >= xMin && x2 <= xMax && y2 >= yMin && y2 <= yMax) {
				ctx.save();
				ctx.strokeStyle = color;
				ctx.lineWidth = thickness * 0.7;
				ctx.beginPath();
				ctx.moveTo(x2Pos - 8, y2Pos - 8);
				ctx.lineTo(x2Pos + 8, y2Pos + 8);
				ctx.moveTo(x2Pos - 8, y2Pos + 8);
				ctx.lineTo(x2Pos + 8, y2Pos - 8);			
				ctx.closePath();
				ctx.stroke();
				ctx.restore();
			}
		}
		
		// if it is a line segment
		if (lineSegment == true) {
			if (x1Pos == x2Pos) { // special case: vertical line, infinite gradient
				if (y1Pos < top) {y1Pos = top};
				if (y1Pos > (top + height)) {y1Pos = top + height};
				if (y2Pos < top) {y2Pos = top};
				if (y2Pos > (top + height)) {y2Pos = top + height};
			} else {
				// all of this is for truncating lines to the edge of the grid!
				var grad = (y2Pos - y1Pos) / (x2Pos - x1Pos);
				if (x1vis == -1) {
					if (y1vis == 1) {
						if ((x1Pos + (top - y1Pos) / grad) <= left) {
							y1Pos += grad * (left - x1Pos);
							x1Pos = left;						
						} else {
							x1Pos += (top - y1Pos) / grad;
							y1Pos = top;						
						}
					}
					if (y1vis == 0) {
						y1Pos += grad * (left - x1Pos);
						x1Pos = left;
					}
					if (y1vis == -1) {
						if ((x1Pos + (top + height - y1Pos) / grad) <= left) {
							y1Pos += grad * (left - x1Pos);
							x1Pos = left;						
						} else {
							x1Pos += (top + height - y1Pos) / grad;
							y1Pos = top + height;						
						}				
					}
				}
				if (x1vis == 0) {
					if (y1vis == 1) {
						x1Pos += (top - y1Pos) / grad;
						y1Pos = top;						
					}
					if (y1vis == -1) {
						x1Pos += (top + height - y1Pos) / grad;
						y1Pos = top + height;						
					}
				}
				if (x1vis == 1) {
					if (y1vis == 1) {
						if ((x1Pos - (y1Pos - top) / grad) >= (left + width)) {
							y1Pos -= grad * (x1Pos - (left + width));
							x1Pos = left + width;			
						} else {
							x1Pos -= (y1Pos - top) / grad;
							y1Pos = top;	
						}
					}
					if (y1vis == 0) {
						y1Pos -= grad * (x1Pos - (left + width));
						x1Pos = left + width;
					}
					if (y1vis == -1) {
						if ((x1Pos - (y1Pos - (top + height)) / grad) >= left + width) {
							y1Pos -= grad * (x1Pos - (left + width));
							x1Pos = left + width;
						} else {
							x1Pos -= (y1Pos - (top + height)) / grad;
							y1Pos = top + height;						
						}
					}
				}
				
				if (x2vis == -1) {
					if (y2vis == 1) {
						if ((x2Pos + (top - y2Pos) / grad) <= left) {
							y2Pos += grad * (left - x2Pos);
							x2Pos = left;						
						} else {
							x2Pos += (top - y2Pos) / grad;
							y2Pos = top;						
						}
					}
					if (y2vis == 0) {
						y2Pos += grad * (left - x2Pos);
						x2Pos = left;
					}
					if (y2vis == -1) {
						if ((x2Pos + (top + height - y2Pos) / grad) <= left) {
							y2Pos += grad * (left - x2Pos);
							x2Pos = left;						
						} else {
							x2Pos += (top + height - y2Pos) / grad;
							y2Pos = top + height;						
						}				
					}
				}
				if (x2vis == 0) {
					if (y2vis == 1) {
						x2Pos += (top - y2Pos) / grad;
						y2Pos = top;						
					}
					if (y2vis == -1) {
						x2Pos += (top + height - y2Pos) / grad;
						y2Pos = top + height;						
					}
				}
				if (x2vis == 1) {
					if (y2vis == 1) {
						if ((x2Pos - (y2Pos - top) / grad) >= (left + width)) {
							y2Pos -= grad * (x2Pos - (left + width));
							x2Pos = left + width;			
						} else {
							x2Pos -= (y2Pos - top) / grad;
							y2Pos = top;	
						}
					}
					if (y2vis == 0) {
						y2Pos -= grad * (x2Pos - (left + width));
						x2Pos = left + width;
					}
					if (y2vis == -1) {
						if ((x2Pos - (y2Pos - (top + height)) / grad) >= left + width) {
							y2Pos -= grad * (x2Pos - (left + width));
							x2Pos = left + width;
						} else {
							x2Pos -= (y2Pos - (top + height)) / grad;
							y2Pos = top + height;						
						}
					}
				}
			}
		} else {
			//infinite lines
			if (Math.abs(x1Pos - x2Pos) < 0.001) { // special case: vertical line, infinite gradient
				y1Pos = top;
				y2Pos = top + height;
			} else {
				var intersectionPoints = [];
				var polygon = [[left,top],[left+width,top],[left+width,top+height],[left,top+height]];
				for (var p = 0; p < 4; p++) { // check if line goes through corner points
					var point = polygon[p];
					if (intersectionPoints.indexOf(point) > -1) continue;
					if (isPointOnLine(point, [x1Pos,y1Pos], [x2Pos,y2Pos])) {
						intersectionPoints.push(point);
					}
				}
				for (var p = 0; p < 4; p++) {			
					var line = [polygon[p],polygon[(p+1)%4]];
					if (intersects2(x1Pos, y1Pos, x2Pos, y2Pos, line[0][0], line[0][1], line[1][0], line[1][1]) === true) {
						var point = intersection(x1Pos, y1Pos, x2Pos, y2Pos, line[0][0], line[0][1], line[1][0], line[1][1]);
						var found = false;
						for (var i = 0; i < intersectionPoints.length; i++) {
							if (Math.abs(intersectionPoints[i][0]-point[0]) < 0.01 && Math.abs(intersectionPoints[i][1]-point[1]) < 0.01) {
								found = true;
								break;
							}
						}
						if (found === false) intersectionPoints.push(point);
					}
				}
				if (intersectionPoints.length < 2) return intersectionPoints;
				x1Pos = intersectionPoints[0][0];
				y1Pos = intersectionPoints[0][1];
				x2Pos = intersectionPoints[1][0];
				y2Pos = intersectionPoints[1][1];
			}
		}
		
		if (dash == true) ctx.setLineDash([dashWidth,dashGapWidth]);
		ctx.strokeStyle = color;
		ctx.lineWidth = thickness*sf;
		if (lineSegment == true) ctx.lineJoin = 'round';
		ctx.beginPath();
		ctx.moveTo(x1Pos, y1Pos);
		ctx.lineTo(x2Pos, y2Pos);
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.restore();
		return [[x1Pos,y1Pos],[x2Pos,y2Pos]];
	},
	
	extractFunctionNumbers:function(grid,gridPath) {
		var nums = [];
		if (un(gridPath.funcString)) gridPath.funcString = gridPath.func.toString();
		for (var i = gridPath.funcString.indexOf('return ')+7; i < gridPath.funcString.length; i++) { // extract numbers from function
			if (gridPath.funcString.slice(i,i+11) === 'Math.PI/180' || gridPath.funcString.slice(i,i+11) === '180/Math.PI') {
				i += 10;
				continue;
			}
			if (/\d/.test(gridPath.funcString.slice(i,i+1)) === false) continue;
			var decPassed = false;
			var str = gridPath.funcString.slice(i,i+1);
			for (var j = i+1; j < gridPath.funcString.length; j++) {
				var char = gridPath.funcString.slice(j,j+1);
				if (/\d/.test(char) === true) {
					str += char;
				} else if (char === '.' && decPassed === false) {
					str += char;
					decPassed = true;
				} else {
					break;
				}
			}
			var num = Number(str);
			if (typeof num === 'number' && !isNaN(num) && num !== 0 && nums.indexOf(num) === -1) {
				nums.push(num);
			}
			i += str.length-1;
		}
		if (nums.length === 0) nums = 1;
		return nums;
	},
	extractVariableMultipliersAndAdders:function(grid,gridPath) {
		var variables = {x:{mult:[],add:[]},y:{mult:[],add:[]}};
		if (un(gridPath.funcSplit)) return variables;
		for (var f = 0; f < gridPath.funcSplit.length; f++) {
			var str = gridPath.funcSplit[f];
			if (typeof str !== 'string') continue;
			str = str.replace(/\(Math\.PI\/180\)\*/g,'');
			str = str.replace(/180\/Math.PI/g,'');
			//console.log(str);
			var spl = [];
			var count = 0;
			while (str.length > 0 && count < 1000) { // split string into elements
				count++;
				if (str.slice(0,5) === 'Math.') {
					var found = false;
					for (var j = 5; j < str.length; j++) {
						if (/[A-Za-z]/.test(gridPath.funcString.slice(j,j+1)) === false) {
							var value = str.slice(0,j);
							if (value === 'Math.PI' || value === 'Math.E') {
								spl.push({type:'constant',value:value});
							} else {
								spl.push({type:'function',value:value});
							}
							found = true;
							str = str.slice(j);
							break;
						}
					}
					if (found === false) {
						str = str.slice(5);
					}
				} else {
					var char = str.slice(0,1);
					if ('abcm'.indexOf(char) > -1) {
						spl.push({
							type:'number',
							value:typeof grid.vars === 'object' && typeof grid.vars[char] === 'object' ? grid.vars[char].value : 1,
							string:char,
							variable:true
						});
					} else if ('xy'.indexOf(char) > -1) {
						spl.push({type:'variable',value:char});
					} else if ('()'.indexOf(char) > -1) {
						spl.push({type:'bracket',value:char});
					} else if ('+*/'.indexOf(char) > -1 || (char === '-' && (spl.length === 0 || '(+*/-'.indexOf(spl[spl.length-1].value) === -1))) {
						spl.push({type:'operator',value:char});
					} else {
						char = extractNumberFromStartOfString(str);
						var num = Number(char);
						if (typeof num === 'number' && !isNaN(num)) {
							spl.push({type:'number',value:num,string:char});
						} else {
							spl.push({type:'?',value:char});
						}
					}
					str = str.slice(char.length);
				}
			}
			for (var i = 0; i < spl.length; i++) { // remove uneccesary brackets
				var elem = spl[i];
				if (elem.value === '(') {
					if (i > 0 && (spl[i-1].type === 'function' || spl[i-1].value === '*' || spl[i-1].value === '/')) continue;
					var bracket = 1;
					var operators = [];
					for (var j = i+1; j < spl.length; j++) {
						var elem2 = spl[j];
						if (elem2.value === '(') {
							bracket++;
						} else if (elem2.value === ')') {
							bracket--;
							if (bracket === 0) {
								if ((operators.indexOf('+') === -1 && operators.indexOf('-') === -1) ||
									(typeof spl[i-1] === 'object' && spl[i-1].value === '(' && typeof spl[j+1] === 'object' && spl[j+1].value === ')')) {
									spl.splice(j,1);
									spl.splice(i,1);
									i--;
								}
								break;
							}
						} else if (elem2.type === 'operator') {
							if (bracket === 1 && operators.indexOf(elem2.value) === -1) operators.push(elem2.value);
						}
					}
				}
			}
			//console.log('spl',spl);
			
			var bracket = 0;
			for (var i = 0; i < spl.length; i++) {
				if (spl[i].value === ')') bracket--;
				spl[i].bracket = bracket;
				if (spl[i].value === '(') bracket++;
			}
			for (var i = 0; i < spl.length; i++) { // look for variables and find numbers multiplied and added
				if (spl[i].type === 'variable') {
					var variable = spl[i];
					var termStartIndex = 0;
					var bracket = variable.bracket;
					for (var j = i-1; j > 0; j--) {
						if (spl[j].value === ')') {
							bracket++;
						} else if (spl[j].value === '(') {
							bracket--;
							if (bracket >= variable.bracket) continue;
							if (spl[j-1].value !== '*' && spl[j-1].value !== '/') {
								termStartIndex = j+1;
								break;
							}
						} else if (bracket === variable.bracket-1) {
							if (spl[j-1].value === '+' && spl[j-1].value === '-') {
								termStartIndex = j+1;
								break;
							}
						}
					}
					var termEndIndex = spl.length;
					bracket = variable.bracket;
					for (var j = i+1; j < spl.length; j++) {
						if (spl[j].value === '(') {
							bracket++;
						} else if (spl[j].value === ')') {
							bracket--;
							if (bracket >= variable.bracket) continue;
							if (j === spl.length-1 || (spl[j+1].value !== '*' && spl[j+1].value !== '/')) {
								termEndIndex = j;
								break;
							}
						} else if (bracket === variable.bracket-1) {
							if (j === spl.length-1 || (spl[j+1].value !== '+' && spl[j+1].value !== '-')) {
								termEndIndex = j;
								break;
							}
						}
					}
					var group = spl.slice(termStartIndex,termEndIndex);
					variable._group = group;
					variable._mult = [];
					variable._add = [];
					var index = group.indexOf(variable);
					var operation = '';
					for (var j = index-1; j >= 0; j--) {
						var elem2 = group[j];
						if (operation !== '+' && elem2.bracket <= variable.bracket && (elem2.value === '*' || elem2.value === '/')) {
							operation = '*';
						} else if (elem2.bracket <= variable.bracket && (elem2.value === '+' || elem2.value === '-')) {
							operation = '+';
						} else if (elem2.type === 'number') {
							var num = Math.abs(elem2.value);
							if (operation === '*') {
								variable._mult.push(num);
								if (variables[variable.value].mult.indexOf(num) === -1) variables[variable.value].mult.push(num);
							} else if (operation === '+') {
								variable._add.push(num);
								if (variables[variable.value].add.indexOf(num) === -1) variables[variable.value].add.push(num);
							}
						}
					}
					operation = '';
					for (var j = index+1; j < group.length; j++) {
						var elem2 = group[j];
						if (operation !== '+' && elem2.bracket <= variable.bracket && (elem2.value === '*' || elem2.value === '/')) {
							operation = '*';
						} else if (elem2.bracket <= variable.bracket && (elem2.value === '+' || elem2.value === '-')) {
							operation = '+';
						} else if (elem2.type === 'number') {
							var num = Math.abs(elem2.value);
							if (operation === '*') {
								variable._mult.push(num);
								if (variables[variable.value].mult.indexOf(num) === -1) variables[variable.value].mult.push(num);
							} else if (operation === '+') {
								variable._add.push(num);
								if (variables[variable.value].add.indexOf(num) === -1) variables[variable.value].add.push(num);
							}
						}
					}
					//console.log('variable',variable);
				}
			}
		}
		for (var v = 0; v < 2; v++) {
			var v2 = ['x','y'][v];
			var addCount = variables[v2].add.length;
			var multCount = variables[v2].mult.length;
			for (var i = 0; i < multCount; i++) {
				var mult1 = variables[v2].mult[i];
				for (var j = i; j < multCount; j++) {
					var mult2 = variables[v2].mult[j];
					var product = roundToNearest(mult1*mult2,0.000001);
					if (variables[v2].mult.indexOf(product) === -1) variables[v2].mult.push(product);
					if (variables[v2].mult.indexOf(mult1+mult2) === -1) variables[v2].mult.push(mult1+mult2);
					if (mult1 !== mult2 && variables[v2].mult.indexOf(Math.abs(mult1-mult2)) === -1) variables[v2].mult.push(Math.abs(mult1+mult2));
					//console.log('m',mult1,mult2);
				}
			}
			for (var i = 0; i < addCount; i++) {
				var add1 = variables[v2].add[i];
				for (var j = i; j < addCount; j++) {
					var add2 = variables[v2].add[j];
					var product = roundToNearest(add1*add2,0.000001);
					if (variables[v2].add.indexOf(product) === -1) variables[v2].add.push(product);
					if (variables[v2].add.indexOf(add1+add2) === -1) variables[v2].add.push(add1+add2);
					if (add1 !== add2 && variables[v2].add.indexOf(Math.abs(add1-add2)) === -1) variables[v2].add.push(Math.abs(add1-add2));
					//console.log('a',add1,add2);
				}
			}
			var addCount = variables[v2].add.length;
			for (var i = 0; i < addCount; i++) {
				var add = variables[v2].add[i];
				for (var j = 0; j < variables[v2].mult.length; j++) {
					var mult = variables[v2].mult[j];
					if (mult === 0) continue;
					if (variables[v2].add.indexOf(add/mult) === -1) variables[v2].add.push(add/mult);
					if (variables[v2].add.indexOf(add*mult) === -1) variables[v2].add.push(add*mult);
				}
			}
			//console.log(v2,variables[v2].mult,variables[v2].add);
		}
		
		return variables;
		function extractNumberFromStartOfString(str) {
			var decPassed = false;
			var str2 = '';
			for (var j = 0; j < str.length; j++) {
				var char = str.slice(j,j+1);
				if (j === 0 && char === '-') {
					str2 += char;
				} else if (/\d/.test(char) === true) {
					str2 += char;
				} else if (char === '.' && decPassed === false) {
					str2 += char;
					decPassed = true;
				} else {
					break;
				}
			}
			return str2;
		}
	},
	
	calcFunction: function(grid,gridPath) {		
		gridPath._canvasLinePaths = [];
		gridPath._canvasFillPaths = [];
		if (typeof gridPath.func !== 'function') return;
		
		var a = 1, b = 1, c = 1, m = 1;
		if (typeof grid.vars === 'object') {
			if (typeof grid.vars.a === 'object') a = grid.vars.a.value;
			if (typeof grid.vars.b === 'object') b = grid.vars.b.value;
			if (typeof grid.vars.c === 'object') c = grid.vars.c.value;
			if (typeof grid.vars.m === 'object') m = grid.vars.m.value;
		}
		
		var squareWidth = 4; // this is the 'draw density' smaller = more accurate, but longer to calculate
				
		var iMax = Math.floor(grid.width / squareWidth) + 1;
		var xCanvasPosInc = grid.width / (iMax-1);
		var xGridPosInc = (grid.xMax-grid.xMin) / (iMax-1);
		
		var jMax = Math.floor(grid.height / squareWidth) + 1;
		var yCanvasPosInc = grid.height / (jMax-1);
		var yGridPosInc = (grid.yMax-grid.yMin) / (jMax-1);
		
		var points = [];
		var hEdges = [];
		var vEdges = [];
		gridPath._hits = [];
		
		var xs = [], xsIndex = {}, ys = [], ysIndex = {};
		for (var x = 0; x <= grid.xMax; x += xGridPosInc) addXValue(roundToNearest(x,0.000001));
		for (var x = -1*xGridPosInc; x >= grid.xMin; x -= xGridPosInc) addXValue(roundToNearest(x,0.000001));
		addXValue(grid.xMin);
		addXValue(grid.xMax);
		for (var y = 0; y <= grid.yMax; y += yGridPosInc) addYValue(roundToNearest(y,0.000001));
		for (var y = -1*yGridPosInc; y >= grid.yMin; y -= yGridPosInc) addYValue(roundToNearest(y,0.000001));
		addYValue(grid.yMin);
		addYValue(grid.yMax);
		function addXValue(x) {
			if (un(xsIndex[x])) {
				xsIndex[x] = {gridPos:roundToNearest(x,0.000001),canvasPos:roundToNearest(grid.left+grid.width*(x-grid.xMin)/(grid.xMax-grid.xMin),0.001)};
				xs.push(xsIndex[x]);
			}
		}
		function addYValue(y) {
			if (un(ysIndex[y])) {
				ysIndex[y] = {gridPos:roundToNearest(y,0.000001),canvasPos:roundToNearest(grid.top+grid.height-grid.height*(y-grid.yMin)/(grid.yMax-grid.yMin),0.001)};
				ys.push(ysIndex[y]);
			}
		}

		if (un(gridPath.funcString)) gridPath.funcString = gridPath.func.toString();
		if (gridPath.funcString.indexOf('/') > -1 || gridPath.funcString.indexOf('pow') > -1 || gridPath.funcString.indexOf('log') > -1 || gridPath.funcString.indexOf('sin') > -1 || gridPath.funcString.indexOf('cos') > -1 || gridPath.funcString.indexOf('tan') > -1) {
			var variableMultipliersAndAdders = draw.grid3.extractVariableMultipliersAndAdders(grid,gridPath);
			variableMultipliersAndAdders.x.mult.sort(function(a,b) {return b-a;});
			variableMultipliersAndAdders.x.add.sort(function(a,b) {return b-a;});
			variableMultipliersAndAdders.y.mult.sort(function(a,b) {return b-a;});
			variableMultipliersAndAdders.y.add.sort(function(a,b) {return b-a;});
			var x0,y0,count = 0; // random point not on an asymptote
			do {
				x0 = [-1,1].ran()*1000*Math.random();
				y0 = [-1,1].ran()*1000*Math.random();
				count++;
			} while (count < 100 && Math.abs(gridPath.func(x0,y0,a,b,c,m)) < 100000);
			var trigFunction = gridPath.funcString.indexOf('sin') > -1 || gridPath.funcString.indexOf('cos') > -1 || gridPath.funcString.indexOf('tan') > -1;		
			for (var v = 0; v < 2; v++) {
				var v2 = ['x','y'][v];
				var asymptoteBasePoints = [0];
				if (trigFunction === true) {
					for (var i = 90; i <= grid.xMax+360; i += 90) asymptoteBasePoints.push(i);
					//for (var i = -90; i >= grid.xMin-360; i -= 90) asymptoteBasePoints.push(i);
					for (var j = 0; j < variableMultipliersAndAdders[v2].mult.length; j++) {
						if (variableMultipliersAndAdders[v2].mult[j] === 0) continue;
						var mult = 90/variableMultipliersAndAdders[v2].mult[j];
						for (var i = mult; i <= grid[v2+'Max']; i += mult) {
							if (asymptoteBasePoints.indexOf(i) === -1) asymptoteBasePoints.push(i);
						}
						for (var i = -1*mult; i >= grid[v2+'Min']; i -= mult) {
							if (asymptoteBasePoints.indexOf(i) === -1) asymptoteBasePoints.push(i);
						}
					}
				}
				var asymptoteTestPoints = [0];
				for (var i = 0; i < variableMultipliersAndAdders[v2].add.length; i++) {
					var offset = variableMultipliersAndAdders[v2].add[i];
					if (offset === 0) continue;
					for (var j = 0; j < asymptoteBasePoints.length; j++) {
						var basePoint = asymptoteBasePoints[j];
						if (asymptoteTestPoints.indexOf(basePoint) === -1) asymptoteTestPoints.push(basePoint);
						if (asymptoteTestPoints.indexOf(basePoint+offset) === -1) asymptoteTestPoints.push(basePoint+offset);
						if (asymptoteTestPoints.indexOf(basePoint-offset) === -1) asymptoteTestPoints.push(basePoint-offset);
						if (asymptoteTestPoints.indexOf(-1*basePoint) === -1) asymptoteTestPoints.push(-1*basePoint);
						if (asymptoteTestPoints.indexOf(-1*basePoint+offset) === -1) asymptoteTestPoints.push(-1*basePoint+offset);
						if (asymptoteTestPoints.indexOf(-1*basePoint-offset) === -1) asymptoteTestPoints.push(-1*basePoint-offset);
					}
				}
				asymptoteTestPoints.sort(function(a,b) {return b-a;})
				//console.log(v2,'asymptoteTestPoints',asymptoteTestPoints);
				for (var i = 0; i < asymptoteTestPoints.length; i++) {
					if (asymptoteTestPoints[i] < grid[v2+'Min'] || asymptoteTestPoints[i] > grid[v2+'Max']) continue;
					if (v2 === 'x') {
						checkForVerticalAsymptote(asymptoteTestPoints[i]);
					} else if (v2 === 'y') {
						checkForHorizontalAsymptote(asymptoteTestPoints[i]);
					}
				}
			}
		}
		function checkForVerticalAsymptote(x) {
			var x2 = roundToNearest(x,0.000001);
			if (x2 >= grid.xMin && x2 <= grid.xMax && (typeof xsIndex[x2] !== 'object' || xsIndex[x2].asymptote !== true) && Math.abs(gridPath.func(x2,y0,a,b,c,m)) > 100000) {
				for (var j = 0; j < ys.length; j++) {
					//console.log(x2,ys[j].gridPos,gridPath.func(x2,ys[j].gridPos,a,b,c,m));
					if (Math.abs(gridPath.func(x2,ys[j].gridPos,a,b,c,m)) <= 100000) return;
				}
				addXValue(x2);
				xsIndex[x2].asymptote = true;
				xsIndex[x2].valueLeft = gridPath.func(x2-0.000001,y0,a,b,c,m);
				xsIndex[x2].valueRight = gridPath.func(x2+0.000001,y0,a,b,c,m);
				//console.log('verticalAsymptote',x2,gridPath.func(x2,y0,a,b,c,m));
			}
		}
		function checkForHorizontalAsymptote(y) {
			var y2 = roundToNearest(y,0.000001);
			if (y2 >= grid.yMin && y2 <= grid.yMax && (typeof ysIndex[y2] !== 'object' || ysIndex[y2].asymptote !== true) && Math.abs(gridPath.func(x0,y2,a,b,c,m)) > 100000) {
				for (var i = 0; i < xs.length; i++) {
					//console.log(xs[i].gridPos,y2,gridPath.func(xs[i].gridPos,y2,a,b,c,m));
					if (Math.abs(gridPath.func(xs[i].gridPos,y2,a,b,c,m)) <= 100000) return;
				}
				addYValue(y2);
				ysIndex[y2].asymptote = true;
				ysIndex[y2].valueBelow = gridPath.func(x0,y2-0.000001,a,b,c,m);
				ysIndex[y2].valueAbove = gridPath.func(x0,y2+0.000001,a,b,c,m);
				//console.log('horizontalAsymptote',y2,gridPath.func(x0,y2,a,b,c,m));
			}
		}
		xs.sort(function(a,b) {return a.gridPos-b.gridPos;});
		ys.sort(function(a,b) {return a.gridPos-b.gridPos;});
		iMax = xs.length-1;
		jMax = ys.length-1;
		//console.log('xs',xs);
		//console.log('ys',ys);
		
		for (var i = 0; i <= iMax; i++) {
			var x = xs[i];
			points[i] = [];
			for (var j = 0; j <= jMax; j++) {
				var y = ys[j];
				points[i][j] = {
					type:'point',
					index:[i,j],
					gridPos:[x.gridPos,y.gridPos],
					canvasPos:[x.canvasPos,y.canvasPos],
					value:gridPath.func(x.gridPos,y.gridPos,a,b,c,m)
				};
				if (x.asymptote === true) {
					points[i][j].vAsymptote = true;
					points[i][j].valueLeft = x.valueLeft;
					points[i][j].valueRight = x.valueRight;
				}
				if (y.asymptote === true) {
					points[i][j].hAsymptote = true;
					points[i][j].valueBelow = x.valueBelow;
					points[i][j].valueAbove = x.valueAbove;
				}
				if ('<>≤≥'.indexOf(gridPath.inequality) > -1) {
					if (gridPath.inequality === '<' || gridPath.inequality === '≤') {
						points[i][j].inequalityHit = points[i][j].value <= 0 ? true : false;
					} else if (gridPath.inequality === '>' || gridPath.inequality === '≥') {
						points[i][j].inequalityHit = points[i][j].value >= 0 ? true : false;
					}
					if (grid.inequalitiesShadeOut === true) points[i][j].inequalityHit = !points[i][j].inequalityHit;
				}
			}
		}
		
		//gridPath._xs = xs;
		//gridPath._ys = xs;
		//gridPath._points = points;
		//console.log('points',points);
		
		for (var i = 0; i < iMax; i++) {
			hEdges[i] = [];
			for (var j = 0; j <= jMax; j++) {
				var p1 = points[i][j];
				var p2 = points[i+1][j];
				var x = false;
				var hit = true;
				if (p1.vAsymptote === true) {
					var valueRight = gridPath.func(p1.gridPos[0]+0.000001,p1.gridPos[1],a,b,c,m);
					if (!isNaN(valueRight) && !isNaN(p2.value) && (valueRight > 0 && p2.value <= 0 || valueRight < 0 && p2.value >= 0)) {
						x = p2.canvasPos[0];
						hit = true;
					}
				} else if (p2.vAsymptote === true) {
					var valueLeft = gridPath.func(p2.gridPos[0]-0.000001,p2.gridPos[1],a,b,c,m);
					if (!isNaN(valueLeft) && !isNaN(p1.value) && (valueLeft > 0 && p1.value <= 0 || valueLeft < 0 && p1.value >= 0)) {
						x = p1.canvasPos[0];
						hit = true;
					}
				} else if (p1.value <= 0 && p2.value >= 0 || p2.value <= 0 && p1.value >= 0) {
					if (Math.abs(p1.value) === Infinity) {
						x = p2.canvasPos[0];
						hit = true;
					} else if (Math.abs(p2.value) === Infinity) {
						x = p1.canvasPos[0];
						hit = true;
					} else if (p1.value-p2.value === 0) {
						x = roundToNearest((p1.canvasPos[0]+p2.canvasPos[0])/2,0.001);
						hit = true;
					} else {
						x = roundToNearest(p1.canvasPos[0]+(p2.canvasPos[0]-p1.canvasPos[0])*p1.value/(p1.value-p2.value),0.001);
						hit = true;
						if (x === p1.canvasPos[0]) {
							if (p1.hit !== true) {
								p1.hit = true;
								p1.joins = [];
								p1.joinsCanvasPos = [];
								p1.canvasPosString = p1.canvasPos.join(',');
								gridPath._hits.push(p1);
							}
							hit = false;
						} else if (x === p2.canvasPos[0]) {
							if (p2.hit !== true) {
								p2.hit = true;
								p2.joins = [];
								p2.joinsCanvasPos = [];
								p2.canvasPosString = p1.canvasPos.join(',');
								gridPath._hits.push(p2);
							}
							hit = false;
						}
					}
				}
				hEdges[i][j] = {
					type:'edge',
					index:[i,j],
					joins:[],
					joinsCanvasPos:{},
					canvasPos:[x,p1.canvasPos[1]]
				};
				hEdges[i][j].canvasPosString = 'h,'+hEdges[i][j].canvasPos.join(',');
				if (hit === true && x !== false && !isNaN(x)) {
					hEdges[i][j].hit = true;
					gridPath._hits.push(hEdges[i][j]);
				}
			}
		}
		for (var i = 0; i <= iMax; i++) {
			vEdges[i] = [];
			for (var j = 0; j < jMax; j++) {
				var p1 = points[i][j];
				var p2 = points[i][j+1];
				var y = false;
				var hit = false;
				if (p1.hAsymptote === true) {
					var valueAbove = gridPath.func(p1.gridPos[0],p1.gridPos[1]+0.000001,a,b,c,m);
					if (!isNaN(valueAbove) && !isNaN(p1.value) && (valueAbove > 0 && p2.value <= 0 || valueAbove < 0 && p2.value >= 0)) {
						y = p2.canvasPos[1];
						hit = true;
					}
				} else if (p2.hAsymptote === true) {
					var valueBelow = gridPath.func(p2.gridPos[0],p2.gridPos[1]-0.000001,a,b,c,m);
					if (!isNaN(valueBelow) && !isNaN(p1.value) && (valueBelow === 1 && p1.value <= 0 || valueBelow === -1 && p1.value >= 0)) {
						y = p1.canvasPos[1];
						hit = true;
					}
				} else if (p1.value <= 0 && p2.value >= 0 || p2.value <= 0 && p1.value >= 0) {
					if (Math.abs(p1.value) === Infinity) {
						y = p2.canvasPos[1];
						hit = true;
					} else if (Math.abs(p2.value) === Infinity) {
						y = p1.canvasPos[1];
						hit = true;
					} else if (p1.value-p2.value === 0) {
						y = roundToNearest((p1.canvasPos[1]+p2.canvasPos[1])/2,0.001);
						hit = true;
					} else {
						y = roundToNearest(p1.canvasPos[1]+(p2.canvasPos[1]-p1.canvasPos[1])*p1.value/(p1.value-p2.value),0.001);
						hit = true;
						if (y === p1.canvasPos[1]) {
							if (p1.hit !== true) {
								p1.hit = true;
								p1.joins = [];
								p1.joinsCanvasPos = [];
								p1.canvasPosString = p1.canvasPos.join(',');
								gridPath._hits.push(p1);
							}
							hit = false;
						} else if (y === p2.canvasPos[1]) {
							if (p2.hit !== true) {
								p2.hit = true;
								p2.joins = [];
								p2.joinsCanvasPos = [];
								p2.canvasPosString = p2.canvasPos.join(',');
								gridPath._hits.push(p2);
							}
							hit = false;
						}
					}
				}
				vEdges[i][j] = {
					type:'edge',
					index:[i,j],
					hit:hit,
					joins:[],
					joinsCanvasPos:{},
					canvasPos:[p1.canvasPos[0],y]
				};
				vEdges[i][j].canvasPosString = 'v,'+vEdges[i][j].canvasPos.join(',');
				if (hit === true && y !== false && !isNaN(y)) {
					vEdges[i][j].canvasPos = [p1.canvasPos[0],y];
					gridPath._hits.push(vEdges[i][j]);
				}
				/*if (y !== false && !isNaN(y)) {
					vEdges[i][j] = {
						type:'edge',
						index:[i,j],
						hit:true,
						joins:[],
						joinsCanvasPos:{},
						canvasPos:[p1.canvasPos[0],y]
					};
					vEdges[i][j].canvasPosString = 'v,'+vEdges[i][j].canvasPos.join(',');
					gridPath._hits.push(vEdges[i][j]);
				}*/
			}
		}
		
		if ('<>≤≥'.indexOf(gridPath.inequality) > -1) {
			var columnRects = [];
			for (var i = 0; i < iMax; i++) { // get single column full rects
				columnRects[i] = [];
				for (var j = 0; j < jMax; j++) {
					var sw = points[i][j];
					var se = points[i+1][j];
					var ne = points[i+1][j+1];
					var nw = points[i][j+1];
					if (sw.inequalityHit === true && se.inequalityHit === true && ne.inequalityHit === true && nw.inequalityHit === true) { // 1111
						var yMin = j;
						for (var j2 = j; j2 < jMax; j2++) {
							var ne2 = points[i+1][j2+1];
							var nw2 = points[i][j2+1];
							if (ne2.inequalityHit === true && nw2.inequalityHit === true) {
								j = j2;
							} else {
								break;
							}
						}
						columnRects[i].push({xMin:i,xMax:i+1,columns:[{xMin:i,xMax:i+1,yMin:yMin,yMax:j+1}]});
					}
				}
			}
			var rectGroups = [];
			for (var i = 0; i < iMax; i++) { // group column rects from adjacent columns where they overlap
				for (var j = 0; j < columnRects[i].length; j++) {
					var columnRect = columnRects[i][j];
					var yMin1 = columnRect.columns[0].yMin;
					var yMax1 = columnRect.columns[0].yMax;
					var rectGroupFound = false;
					for (var k = 0; k < rectGroups.length; k++) {
						var rectGroup = rectGroups[k];
						if (rectGroup.xMax !== i) continue;
						var yMin2 = rectGroup.columns[0].yMin;
						var yMax2 = rectGroup.columns[0].yMax;
						if (yMin2 >= yMax1 || yMax2 <= yMin1) continue; // non-overlapping
						rectGroup.columns.unshift(columnRect.columns[0]);
						rectGroup.xMax = i+1;
						rectGroupFound = true;
						break;
					}
					if (rectGroupFound === false) rectGroups.push(columnRect);
				}
			}
			for (var i = 0; i < rectGroups.length; i++) { // work out canvasFillPath for each rect group
				var rectGroup = rectGroups[i];
				var canvasFillPath = [];
				var prevYMin, prevYMax;
				for (var j = 0; j < rectGroup.columns.length; j++) {
					var column = rectGroup.columns[j];
					if (j === 0 || column.yMin !== prevYMin) {
						canvasFillPath.unshift(points[column.xMax][column.yMin].canvasPos);
					}
					if (j === rectGroup.columns.length-1 || column.yMin !== rectGroup.columns[j+1].yMin) {
						canvasFillPath.unshift(points[column.xMin][column.yMin].canvasPos);
					}
					if (j === 0 || column.yMax !== prevYMax) {
						canvasFillPath.push(points[column.xMax][column.yMax].canvasPos);
					}
					if (j === rectGroup.columns.length-1 || column.yMax !== rectGroup.columns[j+1].yMax) {
						canvasFillPath.push(points[column.xMin][column.yMax].canvasPos);
					}
					prevYMin = column.yMin;
					prevYMax = column.yMax;
				}
				gridPath._canvasFillPaths.push(canvasFillPath);
			}
			for (var i = 0; i < iMax; i++) {
				for (var j = 0; j < jMax; j++) {
					var sw = points[i][j];
					var se = points[i+1][j];
					var ne = points[i+1][j+1];
					var nw = points[i][j+1];
					if (sw.inequalityHit === false && se.inequalityHit === false && ne.inequalityHit === false && nw.inequalityHit === false) continue; // 0000
					if (sw.inequalityHit === true && se.inequalityHit === true && ne.inequalityHit === true && nw.inequalityHit === true) continue;		// 1111
					var s = hEdges[i][j];
					var e = vEdges[i+1][j];
					var n = hEdges[i][j+1];
					var w = vEdges[i][j];
					if (sw.inequalityHit === true && se.inequalityHit === true && ne.inequalityHit === true && nw.inequalityHit === false) {			// 1110
						if (un(n) || un(w)) continue;
						gridPath._canvasFillPaths.push([sw.canvasPos,se.canvasPos,ne.canvasPos,n.canvasPos,w.canvasPos]);
					} else if (sw.inequalityHit === true && se.inequalityHit === true && ne.inequalityHit === false && nw.inequalityHit === true) {		// 1101
						if (un(e) || un(n)) continue;
						gridPath._canvasFillPaths.push([sw.canvasPos,se.canvasPos,e.canvasPos,n.canvasPos,nw.canvasPos]);
					} else if (sw.inequalityHit === true && se.inequalityHit === true && ne.inequalityHit === false && nw.inequalityHit === false) {	// 1100
						if (un(e) || un(w)) continue;
						gridPath._canvasFillPaths.push([sw.canvasPos,se.canvasPos,e.canvasPos,w.canvasPos]);
					} else if (sw.inequalityHit === true && se.inequalityHit === false && ne.inequalityHit === true && nw.inequalityHit === true) {		// 1011
						if (un(s) || un(e)) continue;
						gridPath._canvasFillPaths.push([sw.canvasPos,s.canvasPos,e.canvasPos,ne.canvasPos,nw.canvasPos]);
					} else if (sw.inequalityHit === true && se.inequalityHit === false && ne.inequalityHit === true && nw.inequalityHit === false) {	// 1010
						if (un(n) || un(e) || un(s) || un(w)) continue;
						gridPath._canvasFillPaths.push([sw.canvasPos,s.canvasPos,w.canvasPos],[ne.canvasPos,n.canvasPos,e.canvasPos]);
					} else if (sw.inequalityHit === true && se.inequalityHit === false && ne.inequalityHit === false && nw.inequalityHit === true) {	// 1001
						if (un(s) || un(n)) continue;
						gridPath._canvasFillPaths.push([sw.canvasPos,s.canvasPos,n.canvasPos,nw.canvasPos]);
					} else if (sw.inequalityHit === true && se.inequalityHit === false && ne.inequalityHit === false && nw.inequalityHit === false) {	// 1000
						if (un(s) || un(w)) continue;
						gridPath._canvasFillPaths.push([sw.canvasPos,s.canvasPos,w.canvasPos]);
					} else if (sw.inequalityHit === false && se.inequalityHit === true && ne.inequalityHit === true && nw.inequalityHit === true) {		// 0111
						if (un(s) || un(w)) continue;
						gridPath._canvasFillPaths.push([s.canvasPos,se.canvasPos,ne.canvasPos,nw.canvasPos,w.canvasPos]);
					} else if (sw.inequalityHit === false && se.inequalityHit === true && ne.inequalityHit === true && nw.inequalityHit === false) {	// 0110
						if (un(s) || un(n)) continue;
						gridPath._canvasFillPaths.push([s.canvasPos,se.canvasPos,ne.canvasPos,n.canvasPos]);
					} else if (sw.inequalityHit === false && se.inequalityHit === true && ne.inequalityHit === false && nw.inequalityHit === true) {	// 0101
						if (un(n) || un(e) || un(s) || un(w)) continue;
						gridPath._canvasFillPaths.push([s.canvasPos,se.canvasPos,e.canvasPos],[n.canvasPos,nw.canvasPos,w.canvasPos]);
					} else if (sw.inequalityHit === false && se.inequalityHit === true && ne.inequalityHit === false && nw.inequalityHit === false) {	// 0100
						if (un(s) || un(e)) continue;
						gridPath._canvasFillPaths.push([s.canvasPos,se.canvasPos,e.canvasPos]);
					} else if (sw.inequalityHit === false && se.inequalityHit === false && ne.inequalityHit === true && nw.inequalityHit === true) {	// 0011
						if (un(e) || un(w)) continue;
						gridPath._canvasFillPaths.push([e.canvasPos,ne.canvasPos,nw.canvasPos,w.canvasPos]);
					} else if (sw.inequalityHit === false && se.inequalityHit === false && ne.inequalityHit === true && nw.inequalityHit === false) {	// 0010
						if (un(e) || un(n)) continue;
						gridPath._canvasFillPaths.push([e.canvasPos,ne.canvasPos,n.canvasPos]);
					} else if (sw.inequalityHit === false && se.inequalityHit === false && ne.inequalityHit === false && nw.inequalityHit === true) {	// 0001
						if (un(n) || un(w)) continue;
						gridPath._canvasFillPaths.push([n.canvasPos,nw.canvasPos,w.canvasPos]);
					}
				}
			}
			for (var i = 0; i < gridPath._canvasFillPaths.length; i++) {
				var canvasFillPath = gridPath._canvasFillPaths[i];
				var pos1 = canvasFillPath[0];
				for (var j = 1; j < canvasFillPath.length; j++) {
					var pos2 = canvasFillPath[j];
					if (pos1[0] === pos2[0] && pos1[1] === pos2[1]) {
						canvasFillPath.splice(j,1);
						j--;
					} else {
						pos1 = pos2;
					}
				}
				if (canvasFillPath.length < 3) {
					gridPath._canvasFillPaths.splice(i,1);
					i--;
				}
			}
		}

		function linkHits(item1,item2) {
			item1.joins.push(item2);
			item2.joins.push(item1);
			item1.joinsCanvasPos[item2.canvasPosString] = true;
			item2.joinsCanvasPos[item1.canvasPosString] = true;
		}
		for (var i = 0; i < iMax; i++) {
			for (var j = 0; j <= jMax; j++) {
				if (typeof hEdges[i][j] !== 'object' || hEdges[i][j].hit !== true) continue;
				var edge = hEdges[i][j];
				var adjacentHits = [];
				if (j > 0) adjacentHits.push([vEdges[i][j-1],vEdges[i+1][j-1],hEdges[i][j-1],points[i][j-1],points[i+1][j-1]]); // below
				if (j < jMax) adjacentHits.push([vEdges[i][j],vEdges[i+1][j],hEdges[i][j+1],points[i][j+1],points[i+1][j+1]]); // above
				for (var k = 0; k < adjacentHits.length; k++) {
					for (var l = 0; l < adjacentHits[k].length; l++) {
						var adjacentHit = adjacentHits[k][l];
						if (typeof adjacentHit === 'object' && adjacentHit.hit === true && edge.joins.indexOf(adjacentHit) === -1 && adjacentHit.joins.indexOf(edge) === -1 && edge.joinsCanvasPos[adjacentHit.canvasPosString] !== true && adjacentHit.joinsCanvasPos[edge.canvasPosString] !== true) {
							linkHits(edge,adjacentHit);
							break;
						}
					}
				}
			}
		}
		for (var i = 0; i <= iMax; i++) {
			for (var j = 0; j < jMax; j++) {
				if (typeof vEdges[i][j] !== 'object' || vEdges[i][j].hit !== true) continue;
				var edge = vEdges[i][j];
				var adjacentHits = [];
				if (i > 0) adjacentHits.push([hEdges[i-1][j],hEdges[i-1][j+1],vEdges[i-1][j],points[i-1][j],points[i-1][j+1]]); // left
				if (i < iMax) adjacentHits.push([hEdges[i][j],hEdges[i][j+1],vEdges[i+1][j],points[i+1][j],points[i+1][j+1]]); // right
				for (var k = 0; k < adjacentHits.length; k++) {
					for (var l = 0; l < adjacentHits[k].length; l++) {
						var adjacentHit = adjacentHits[k][l];
						if (typeof adjacentHit === 'object' && adjacentHit.hit === true && edge.joins.indexOf(adjacentHit) === -1 && adjacentHit.joins.indexOf(edge) === -1 && edge.joinsCanvasPos[adjacentHit.canvasPosString] !== true && adjacentHit.joinsCanvasPos[edge.canvasPosString] !== true) {
							linkHits(edge,adjacentHit);
							break;
						}
					}
				}
			}
		}
		for (var i = 0; i <= iMax; i++) { // point to point joins
			for (var j = 0; j <= jMax; j++) {
				if (typeof points[i][j] !== 'object' || points[i][j].hit !== true) continue;
				var point = points[i][j];
				var adjacentHits = [];
				if (i > 0) {
					if (j > 0) adjacentHits.push(points[i-1][j-1]); // sw
					if (j < jMax) adjacentHits.push(points[i-1][j+1]); // nw
					adjacentHits.push(points[i-1][j]); // w
				}
				if (i < iMax) {
					if (j > 0) adjacentHits.push(points[i+1][j-1]); // se
					if (j < jMax) adjacentHits.push(points[i+1][j+1]); // ne
					adjacentHits.push(points[i+1][j]); // e
				}
				if (j > 0) adjacentHits.push(points[i][j-1]); // s
				if (j < jMax) adjacentHits.push(points[i][j+1]); // n
				for (var k = 0; k < adjacentHits.length; k++) {
					var adjacentHit = adjacentHits[k];
					if (typeof adjacentHit === 'object' && adjacentHit.hit === true && point.joins.indexOf(adjacentHit) === -1 && adjacentHit.joins.indexOf(point) === -1 && point.joinsCanvasPos[adjacentHit.canvasPosString] !== true && adjacentHit.joinsCanvasPos[point.canvasPosString] !== true) {
						linkHits(point,adjacentHit);
						break;
					}
				}
			}
		}
		
		//console.log(gridPath._hits.slice(0));
		while (gridPath._hits.length > 0) {
			var seedHit = gridPath._hits.shift();
			var canvasLinePath = [seedHit.canvasPos];
			var hit = seedHit;
			while (!un(hit.joins[0])) {
				var hit2 = hit.joins.shift();
				var index = gridPath._hits.indexOf(hit2);
				if (index > -1) gridPath._hits.splice(index,1);
				var index = hit2.joins.indexOf(hit);
				if (index > -1) hit2.joins.splice(index,1);
				hit = hit2;
				canvasLinePath.push(hit2.canvasPos);
			}
			hit = seedHit;
			while (!un(hit.joins[0])) {
				var hit2 = hit.joins.shift();
				var index = gridPath._hits.indexOf(hit2);
				if (index > -1) gridPath._hits.splice(index,1);
				var index = hit2.joins.indexOf(hit);
				if (index > -1) hit2.joins.splice(index,1);
				hit = hit2;
				canvasLinePath.unshift(hit2.canvasPos);
			}
			gridPath._canvasLinePaths.push(canvasLinePath);
		}
		
		for (var i = 0; i < gridPath._canvasLinePaths.length; i++) {
			var canvasLinePath = gridPath._canvasLinePaths[i];
			var pos1 = canvasLinePath[0];
			for (var j = 1; j < canvasLinePath.length; j++) {
				var pos2 = canvasLinePath[j];
				if (pos1[0] === pos2[0] && pos1[1] === pos2[1]) {
					canvasLinePath.splice(j,1);
					j--;
				} else {
					pos1 = pos2;
				}
			}
			if (canvasLinePath.length < 2) {
				gridPath._canvasLinePaths.splice(i,1);
				i--;
			}
		}
		//console.log(gridPath);
	},
	drawFunction: function(ctx,grid,gridPath) {
		ctx.save();
		if ('<>≤≥'.indexOf(gridPath.inequality) > -1) {
			ctx.fillStyle = !un(gridPath.fillColor) ? gridPath.fillColor : !un(gridPath.color) ? colorA(gridPath.color,0.3) : colorA('#00F',0.3);
			for (var i = 0; i < gridPath._canvasFillPaths.length; i++) {
				var fillPath = gridPath._canvasFillPaths[i];
				ctx.beginPath();
				ctx.moveTo(fillPath[0][0],fillPath[0][1]);
				for (var j = 1; j < fillPath.length; j++) {
					ctx.lineTo(fillPath[j][0],fillPath[j][1]);
				}
				ctx.lineTo(fillPath[0][0],fillPath[0][1]);
				ctx.fill();
			}		
		}
		if (gridPath.inequality === '>' || gridPath.inequality === '<') {
			ctx.setLineDash([15,15]);
		} else {
			ctx.setLineDash([]);
		}
		ctx.strokeStyle = !un(gridPath.color) ? gridPath.color : '#00F';
		ctx.lineWidth = !un(gridPath.lineWidth) ? gridPath.lineWidth : 5;
		ctx.beginPath();
		for (var c = 0; c < gridPath._canvasLinePaths.length; c++) {
			var linePath = gridPath._canvasLinePaths[c];
			ctx.moveTo(linePath[0][0],linePath[0][1]);
			for (var p = 1; p < linePath.length - 2; p++) {
				ctx.quadraticCurveTo(linePath[p][0], linePath[p][1], (linePath[p][0] + linePath[p + 1][0]) / 2, (linePath[p][1] + linePath[p + 1][1]) / 2);
			}
			if (linePath.length > p + 1) ctx.quadraticCurveTo(linePath[p][0], linePath[p][1], linePath[p + 1][0], linePath[p + 1][1]);
			ctx.stroke();
		}
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.restore();
	},
	getGridPathFromText: function(text) {
		if (typeof text === 'string') text = [text];
		var gridPath = {valid:false,text:clone(text),time:Date.parse(new Date())};
		for (var t = 0; t < text.length; t++) {
			if (typeof text[t] === 'string') {
				text[t] = text[t].replace(/\<\=/g,'≤').replace(/\>\=/g,'≥');
			}
		}
 		var js = draw.grid3.textArrayToJsString(text);
		gridPath._js = js;
		var stringCopy = js;
		var exceptions = ['Math.pow', 'Math.sqrt', 'Math.PI', 'Math.sin', 'Math.cos', 'Math.tan', 'Math.asin', 'Math.acos', 'Math.atan', 'Math.E', 'Math.log', 'Math.abs'];
		for (var i = 0; i < exceptions.length; i++) stringCopy = replaceAll(stringCopy, exceptions[i], '');
		gridPath._vars = [];
		for (var i = 0; i < 4; i++) {
			var v = 'abcm'[i];
			var index = stringCopy.indexOf(v);
			if (index > -1) gridPath._vars.push({letter:v,index:index});
		}
		gridPath._vars.sort(function(a,b) {return a.index-b.index;});
		var symbol = stringCopy.replace(/[^\=\<\>\≤\≥]/g,'');
		if (/[d-ln-wzD-LN-WZ]/g.test(stringCopy) == true || symbol === '' || symbol.length > 2) {
			gridPath.type = 'function';
			gridPath.valid = false;
			gridPath.text = clone(text);
			return gridPath;
		}
		//var symbol = stringCopy.replace(/[^\=\<\>\≤\≥]/g,'');
		if (['=','<','>','≤','≥','<<','<≤','≤<','≤≤'].indexOf(symbol) === -1) {
			gridPath.type = 'function';
			gridPath.valid = false;
			gridPath.text = clone(text);
			return gridPath;
		}
		
		//var splitText = alg.splitTextByChar(clone(text),symbol);
		if (['<<','<≤','≤<','≤≤'].indexOf(symbol) > -1) {
			var splitText = symbol === '<≤' || symbol === '≤<' ? alg.splitTextByChars(clone(text),'<≤') : alg.splitTextByChar(clone(text),symbol.slice(0,1));
			if (splitText.length !== 3 || splitText[1].length !== 1 || ['x','y'].indexOf(splitText[1][0]) === -1) return gridPath;
			if (textArrayFind(splitText[0],'x') || textArrayFind(splitText[0],'y') || textArrayFind(splitText[2],'x') || textArrayFind(splitText[2],'y')) return gridPath;
			var parts = [alg.flatten(alg.toObj(splitText[0])),alg.flatten(alg.toObj(splitText[2]))];
			gridPath.func1 = new Function('return ' + 'function(x,y,a,b,c,m) {return ' + draw.grid3.textArrayToJsString(alg.toText(parts[0])) + ';}')();
			gridPath.func2 = new Function('return ' + 'function(x,y,a,b,c,m) {return ' + draw.grid3.textArrayToJsString(alg.toText(parts[1])) + ';}')();
			gridPath.letter = splitText[1][0];
			gridPath.symbol = symbol;
			gridPath.type = 'inequality-3part';
			delete gridPath.valid;
			return gridPath;
		}
			
		var splitFunc = js.split(symbol);
		if (splitFunc.length !== 2) return gridPath;
		gridPath.type = symbol === '=' ? 'function' : 'inequality';
		
		try {
			var funcString = 'function(x,y,a,b,c,m) {return (' + splitFunc[0] + ')-(' + splitFunc[1] + ');}';
			var func = new Function('return ' + funcString)();
		} catch (err) {
			gridPath.valid = false;
			gridPath.text = clone(text);
			return gridPath;
		}
		if (symbol !== '=') gridPath.inequality = symbol;
		gridPath.text = clone(text);
		gridPath.func = func;
		gridPath.funcString = funcString;
		gridPath.funcSplit = splitFunc;
		delete gridPath.valid;
		return gridPath;
	},
	textArrayToJsString: function(textArray,angleMode) {
		if (un(angleMode)) angleMode = 'deg';

		var textArray = removeTags(clone(textArray));
		var depth = 0;
		var jsArray = [''];
		var js = '';
		var exceptions = ['Math.pow','Math.sqrt','Math.PI','Math.sin','Math.cos','Math.tan','Math.asin','Math.acos','Math.atan','Math.E','Math.log','Math.abs','sin','cos','tan','ln']; // add sec, cosec, cot
		var position = [0];
			
		for (var p = 0; p < textArray.length; p++) {
			subJS(textArray[p],true);
			position[depth]++;
		}
		
		js = jsArray[0];
		
		if (angleMode === 'deg') {
			for (var c = 0; c < js.length; c++) {
				if (['Math.sin(','Math.cos(','Math.tan('].indexOf(js.slice(c,c+9)) > -1) {
					var inner = '';
					var bracket = 1;
					for (var d = c+9; d < js.length; d++) {
						var char = js.slice(d,d+1);
						if (char === ')') {
							bracket--;
							if (bracket === 0) {
								js = js.slice(0,c+9)+'(Math.PI/180)*('+inner+')'+js.slice(c+9+inner.length);
								c += 23;
								break;
							}
						} else if (char === '(') {
							bracket++;
						}
						inner += char;
					}
				}
			}
		}
		
		//console.log(js);
		return js;
		
		function subJS(elem, addMultIfNecc) {
			if (typeof addMultIfNecc !== 'boolean') addMultIfNecc = true;
			//console.log('subJS', elem);
			if (typeof elem == 'string') {
				//console.log(subText);
				var subText = replaceAll(elem, ' ', ''); // remove white space
				subText = subText.replace(/\u00D7/g, '*'); // replace multiplications signs with *
				subText = subText.replace(/\u00F7/g, '/'); // replace division signs with /
				subText = subText.replace('e', 'Math.E');
				//subText = subText.replace(/\u2264/g, '<='); // replace  signs with <=
				//subText = subText.replace(/\u2265/g, '>='); // replace  signs with >=
				for (var c = 0; c < subText.length - 2; c++) {
					if (subText.slice(c).indexOf('sin(') == 0 || subText.slice(c).indexOf('cos(') == 0 || subText.slice(c).indexOf('tan(') == 0) {
						subText = subText.slice(0,c)+'Math.'+subText.slice(c);
						c += 5;
						/*if (angleMode == 'rad') {
							subText = subText.slice(0,c)+'Math.'+subText.slice(c);
							c += 5;
						} else {
							// this only works for eg tan(x), not tan(x+30) - it becomes Math.tan((Math.PI/180)*x+30)
							// need to look ahead and extract from inside brackets
							var inner = '';
							subText = subText.slice(0,c)+'Math.'+subText.slice(c,c+4)+'(Math.PI/180)*'+subText.slice(c+4);
							c += 19;
						}*/
					} else if (subText.slice(c).indexOf('ln(') == 0) {
						subText = subText.slice(0,c)+'Math.log('+subText.slice(c+3);
						c += 6;
					}
				}
				subText = timesBeforeLetters(subText);
				// if following frac or power, add * if necessary
				if (addMultIfNecc == true && jsArray[depth] !== '' && elem !== '' && /[ \+\-\=\u00D7\u00F7\u2264\u2265\<\>\])]/.test(elem.charAt(0)) == false) subText = '*' + subText;
				jsArray[depth] += subText;
				//console.log(subText);
				return;
			} else if (elem[0] == 'frac') {
				//console.log('frac');
				var subText = '';
				var subText2 = '';
				if (jsArray[depth] !== '' && elem[1].length === 1 && typeof elem[1][0] === 'string' && elem[1][0] !== '' && elem[2].length === 1 && elem[2][0] !== '' && typeof elem[2][0] === 'string') { // check for numeric improper fraction
					var numerator = elem[1][0].trim();
					var denominator = elem[2][0].trim();
					if (/^[0-9]+$/.test(numerator) === true && /^[0-9]+$/.test(denominator) === true && Number(denominator) > 0) {
						var str = jsArray[depth];
						var integer = '';
						while (/[0-9]/.test(str.slice(-1))) {
							integer += str.slice(-1);
							str = str.slice(0,-1);
						}
						if (integer.length > 0 && !isNaN(Number(integer))) {
							jsArray[depth] = str+'('+integer+'+'+numerator+'/'+denominator+')';
							return;
						}
					}
				}
				// if not proceeded by an operator, put a times sign in
				if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\u2264\u2265\*\/\=\<\>\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
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
				return;
			} else if (elem[0] == 'sqrt') {
				//console.log('sqrt');
				var subText = '';
				var subText2 = '';
				// if not proceeded by an operator, put a times sign in
				if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\u2264\u2265\*\/\=\<\>\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
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
				return;
			} else if (elem[0] == 'root') {
				//console.log(elem[0]);
				var subText = '';
				var subText2 = '';
				// if not proceeded by an operator, put a times sign in
				if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\u2264\u2265\*\/\=\<\>\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
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
				return;
			} else if (elem[0] == 'sin' || elem[0] == 'cos' || elem[0] == 'tan') {
				//console.log(elem[0]);
				var subText = '';
				// if not proceeded by an operator, put a times sign in
				if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\u2264\u2265\*\/\=\<\>\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
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
				return;
			} else if (elem[0] == 'sin-1' || elem[0] == 'cos-1' || elem[0] == 'tan-1') {
				//console.log(elem[0]);
				var subText = '';
				// if not proceeded by an operator, put a times sign in
				if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\u2264\u2265\*\/\=\<\>\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
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
				subText += convertText1+'Math.a'+elem[0].slice(0,3)+'('+jsArray[depth]+')'+convertText2;
				jsArray[depth] = '';
				depth--;
				position.pop();
				jsArray[depth] += subText;
				return;
			} else if (elem[0] == 'ln') {
				//console.log(elem[0]);
				var subText = '';
				// if not proceeded by an operator, put a times sign in
				if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\u2264\u2265\*\/\=\<\>\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
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
				return;
			} else if (elem[0] == 'log') {
				//console.log(elem[0]);
				var subText = '';
				// if not proceeded by an operator, put a times sign in
				if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\u2264\u2265\*\/\=\<\>\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
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
				return;
			} else if (elem[0] == 'logBase') {
				//console.log(elem[0]);
				var subText = '';
				// if not proceeded by an operator, put a times sign in
				if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\u2264\u2265\*\/\=\<\>\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
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
				return;
			} else if (elem[0] == 'abs') {
				//console.log(elem[0]);
				var subText = '';
				// if not proceeded by an operator, put a times sign in
				if (jsArray[depth] !== '' && /[\+\-\u00D7\u00F7\u2264\u2265\*\/\=\<\>\[(]/.test(jsArray[depth].slice(-1)) == false) subText += "*";
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
				return;
			} else if (elem[0] == 'power' || elem[0] == 'pow') {
				var baseSplitPoint = 0;
				var trigPower = false;
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
					} else if (jsArray[depth].slice(-3) == 'sin' || jsArray[depth].slice(-3) == 'cos' || jsArray[depth].slice(-3) == 'tan') {
						trigPower = true;
					} else if (jsArray[depth].slice(-6) == 'Math.E') {
						baseSplitPoint = jsArray[depth].length - 6;
					} else if (/[A-Za-z]/g.test(jsArray[depth].charAt(jsArray[depth].length - 1)) == true) {
						baseSplitPoint = jsArray[depth].length - 1;
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
	},
	
	/*gridPathTextExplicitTest: function(text,symbol) {
		var splitText = alg.splitTextByChar(clone(text),symbol);
		if (splitText.length !== 2) return false;
		var equation = [alg.flatten(alg.toObj(splitText[0])),alg.flatten(alg.toObj(splitText[1]))];
		var yTerm = false;
		for (var i = 0; i < 2; i++) {
			var side = equation[i];
			for (var t = 0; t < side.length; t++) {
				var term = side[t];
				var termHasX = false;
				var termHasY = false;
				for (var s = 0; s < term.subterms.length; s++) {
					var subterm = term.subterms[s];
					if (subterm[0] === 'y' && subterm[1] !== 1) {
						return false;
					} else if (subterm[0] === 'y' && subterm[1] === 1) {
						termHasY = true;
					} else if (subterm[0] === 'x') {
						termHasX = true;
					}
				}
				if (termHasX && termHasY) return false;
			}
		}
		var equation2 = alg.equationMakeSubject(equation,'y');
		if (equation2 === false) return false;
		var obj = {
			type:symbol === '=' ? 'function' : 'inequality',
			func:new Function('return ' + 'function(x,a,b,c,m) {return ' + textArrayToJsString(alg.toText(equation2[1])) + ';}')()
		};
		if (symbol !== '=') obj.inequality = symbol;
		return obj;
	},*/
	/*gridPathTextFunctionsTest: function(text) {
		var functions = {types:[],hasFunctionOfXOrY:false,hasVerticalAsymptote:false};
		for (var i = 0; i < text.length; i++) {
			var element = text[i];
			if (typeof element === 'object') {
				if (element[0] === 'frac') {
					if (textArrayFind(element[2],'x') === true) functions.hasVerticalAsymptote = true;
				} else {
					if (element[0] === 'pow') {
						if (element[2].length !== 1 || typeof element[2][0] !== 'string' || isNaN(Number(element[2][0])) || Number(element[2][0]) < 0) {
							functions.hasVerticalAsymptote = true;
						}
					}
					functions.types.push(element[0]);
					functions[element[0]] = true;
					for (var j = 1; j < element.length; j++) {
						var sub = element[j];
						if (sub instanceof Array === false) continue;
						if (textArrayFind(sub,'x') === true || textArrayFind(sub,'y') === true) {
							functions.hasFunctionOfXOrY = true;
							break;
						}
					}
				}
			} else if (typeof element === 'string') {
				if (textArrayFind(element,divide+'x') === true || textArrayFind(element,divide+'(') === true) functions.hasVerticalAsymptote = true;
			}
		}
		return functions;
	},*/
	/*gridPathTextCharactersTest: function(text) {
		var characters = {all:[],hasBadChars:false};
		for (var i = 0; i < text.length; i++) {
			processElement(text[i]);
		}
		return characters;
		function processElement(element) {
			if (typeof element === 'string') {
				for (var c = 0; c < element.length; c++) {
					var char = element[c];
					if ('0123456789.-+=<>abcmxy()'.indexOf(char.toLowerCase()) === -1 && [times,divide,lessThanEq,moreThanEq].indexOf(char) === -1) {
						characters.hasBadChars = true;
					}
					if (characters.all.indexOf(char) === -1) characters.all.push(char);
				}
			} else if (element instanceof Array) {
				for (var j = 1; j < element.length; j++) {
					var sub = element[j];
					if (sub instanceof Array) {
						processElement(sub);
					}
				}
			}
		}
	},*/
	/*gridPathTextLinearTest: function(text,symbol) {
		var splitText = alg.splitTextByChar(clone(text),symbol);
		if (splitText.length !== 2) return false;
		var equation = [alg.flatten(alg.toObj(splitText[0])),alg.flatten(alg.toObj(splitText[1]))];
		var xTerms = 0;
		var yTerms = 0;
		for (var i = 0; i < 2; i++) {
			var side = equation[i];
			for (var t = 0; t < side.length; t++) {
				var term = side[t];
				var termX = 0;
				var termY = 0;
				for (var s = 0; s < term.subterms.length; s++) {
					var subterm = term.subterms[s];
					if ((subterm[0] === 'x' || subterm[0] === 'y') && subterm[1] !== 1) {
						return false;
					} else if (typeof subterm[0] === 'object' && subterm[1] < 0) {
						return false;
					} else if (subterm[0] === 'x' && subterm[1] === 1) {
						termX++;
						if (termY > 0) return false;
					} else if (subterm[0] === 'y' && subterm[1] === 1) {
						termY++;
						if (termX > 0) return false;
					}
				}
				if (termX === 1 && termY === 0) {
					xTerms++;
				} else if (termY === 1 && termX === 0) {
					yTerms++;
				}
			}
		}
		if (xTerms === 0 && yTerms === 0) return false;
		var equation2 = alg.equationMakeSubject(equation,yTerms > 0 ? 'y' : 'x');
		//console.log('equation2',equation2);
		if (equation2 === false) return false;
		var obj = {
			type:symbol === '=' ? 'function-linear' : 'inequality-linear',
			xTerm:xTerms>0,
			yTerm:yTerms>0,
			func:new Function('return ' + 'function(x,a,b,c,m) {return ' + textArrayToJsString(alg.toText(equation2[1])) + ';}')()
		};
		if (symbol !== '=') obj.inequality = symbol;
		return obj;
	},*/

	/*calcInequality: function(grid,gridPath) {		
		var a = 1, b = 1, c = 1, m = 1;
		if (typeof grid.vars === 'object') {
			if (typeof grid.vars.a === 'object') a = grid.vars.a.value;
			if (typeof grid.vars.b === 'object') b = grid.vars.b.value;
			if (typeof grid.vars.c === 'object') c = grid.vars.c.value;
			if (typeof grid.vars.m === 'object') m = grid.vars.m.value;
		}
		
		var squareWidth = 4; // this is the 'draw density' smaller = more accurate, but longer to calculate
		
		var iMax = Math.floor(grid.width / squareWidth) + 1;
		var xCanvasInc = grid.width / (iMax-1);
		var xPosInc = (grid.xMax-grid.xMin) / (iMax-1);
		
		var jMax = Math.floor(grid.height / squareWidth) + 1;
		var yCanvasInc = grid.height / (jMax-1);
		var yPosInc = (grid.yMax-grid.yMin) / (jMax-1);
		
		var points = [];
		gridPath._points = points;
		gridPath._edgesHit = [];
		gridPath._asymptoteEdges = [];
		var hEdges = [];
		var vEdges = [];
		
		for (var i = 0; i <= iMax; i++) {
			var x = grid.xMin+i*xPosInc;
			points[i] = [];
			for (var j = 0; j <= jMax; j++) {
				var y = grid.yMin+j*yPosInc;
				points[i][j] = {
					canvasPos:[grid.left+i*xCanvasInc,grid.top+grid.height-j*yCanvasInc],
					value:gridPath.func(x,y,a,b,c,m),
					inequalityHit:false
				};
				if (gridPath.inequality === '<' || gridPath.inequality === '≤') {
					if (points[i][j].value <= 0) points[i][j].inequalityHit = true;
				} else if (gridPath.inequality === '>' || gridPath.inequality === '≥') {
					if (points[i][j].value >= 0) points[i][j].inequalityHit = true;
				}
				if (grid.inequalitiesShadeOut === true) points[i][j].inequalityHit = !points[i][j].inequalityHit;
			}
		}
		
		for (var i = 0; i < iMax; i++) {
			hEdges[i] = [];
			for (var j = 0; j <= jMax; j++) {
				var p1 = points[i][j];
				var p2 = points[i+1][j];
				if (p1.value < 0 && p2.value >= 0 || p2.value < 0 && p1.value >= 0) {
					hEdges[i][j] = {
						edgeJoins:[],
						canvasPos:[p1.canvasPos[0]+(p2.canvasPos[0]-p1.canvasPos[0])*p1.value/(p1.value-p2.value),p1.canvasPos[1]]
					};
					if (Math.abs(p1.value-p2.value) >= 10) {
						gridPath._asymptoteEdges.push(hEdges[i][j]);
					} else {
						gridPath._edgesHit.push(hEdges[i][j]);
					}
				}
			}
		}
		for (var i = 0; i <= iMax; i++) {
			vEdges[i] = [];
			for (var j = 0; j < jMax; j++) {
				var p1 = points[i][j];
				var p2 = points[i][j+1];
				if (p1.value < 0 && p2.value >= 0 || p2.value <= 0 && p1.value > 0) {// && Math.abs(p1.value-p2.value) < 10) {
					vEdges[i][j] = {
						edgeJoins:[],
						canvasPos:[p1.canvasPos[0],p1.canvasPos[1]+(p2.canvasPos[1]-p1.canvasPos[1])*p1.value/(p1.value-p2.value)]
					};
					if (Math.abs(p1.value-p2.value) >= 10) {
						gridPath._asymptoteEdges.push(vEdges[i][j]);
					} else {
						gridPath._edgesHit.push(vEdges[i][j]);
					}
				}
			}
		}
		
		gridPath._canvasFillPaths = [];
		for (var i = 0; i < iMax; i++) {
			for (var j = 0; j < jMax; j++) {
				var sw = points[i][j];
				var se = points[i+1][j];
				var ne = points[i+1][j+1];
				var nw = points[i][j+1];
				if (sw.inequalityHit === false && se.inequalityHit === false && ne.inequalityHit === false && nw.inequalityHit === false) continue; // 0000
				if (sw.inequalityHit === true && se.inequalityHit === true && ne.inequalityHit === true && nw.inequalityHit === true) {				// 1111
					gridPath._canvasFillPaths.push([sw.canvasPos,se.canvasPos,ne.canvasPos,nw.canvasPos]);
					continue;
				}
				var s = hEdges[i][j];
				var e = vEdges[i+1][j];
				var n = hEdges[i][j+1];
				var w = vEdges[i][j];
				console.log(i,j,sw.inequalityHit,se.inequalityHit,ne.inequalityHit,nw.inequalityHit);
				if (sw.inequalityHit === true && se.inequalityHit === true && ne.inequalityHit === true && nw.inequalityHit === false) {			// 1110
					if (un(n) || un(w)) continue;
					gridPath._canvasFillPaths.push([sw.canvasPos,se.canvasPos,ne.canvasPos,n.canvasPos,w.canvasPos]);
				} else if (sw.inequalityHit === true && se.inequalityHit === true && ne.inequalityHit === false && nw.inequalityHit === true) {		// 1101
					if (un(e) || un(n)) continue;
					gridPath._canvasFillPaths.push([sw.canvasPos,se.canvasPos,e.canvasPos,n.canvasPos,nw.canvasPos]);
				} else if (sw.inequalityHit === true && se.inequalityHit === true && ne.inequalityHit === false && nw.inequalityHit === false) {	// 1100
					if (un(e) || un(w)) continue;
					gridPath._canvasFillPaths.push([sw.canvasPos,se.canvasPos,e.canvasPos,w.canvasPos]);
				} else if (sw.inequalityHit === true && se.inequalityHit === false && ne.inequalityHit === true && nw.inequalityHit === true) {		// 1011
					if (un(s) || un(e)) continue;
					gridPath._canvasFillPaths.push([sw.canvasPos,s.canvasPos,e.canvasPos,ne.canvasPos,nw.canvasPos]);
				} else if (sw.inequalityHit === true && se.inequalityHit === false && ne.inequalityHit === true && nw.inequalityHit === false) {	// 1010
					if (un(n) || un(e) || un(s) || un(w)) continue;
					gridPath._canvasFillPaths.push([sw.canvasPos,s.canvasPos,w.canvasPos],[ne.canvasPos,n.canvasPos,e.canvasPos]);
				} else if (sw.inequalityHit === true && se.inequalityHit === false && ne.inequalityHit === false && nw.inequalityHit === true) {	// 1001
					if (un(s) || un(n)) continue;
					gridPath._canvasFillPaths.push([sw.canvasPos,s.canvasPos,n.canvasPos,nw.canvasPos]);
				} else if (sw.inequalityHit === true && se.inequalityHit === false && ne.inequalityHit === false && nw.inequalityHit === false) {	// 1000
					if (un(s) || un(w)) continue;
					gridPath._canvasFillPaths.push([sw.canvasPos,s.canvasPos,w.canvasPos]);
				} else if (sw.inequalityHit === false && se.inequalityHit === true && ne.inequalityHit === true && nw.inequalityHit === true) {		// 0111
					if (un(s) || un(w)) continue;
					gridPath._canvasFillPaths.push([s.canvasPos,se.canvasPos,ne.canvasPos,nw.canvasPos,w.canvasPos]);
				} else if (sw.inequalityHit === false && se.inequalityHit === true && ne.inequalityHit === true && nw.inequalityHit === false) {	// 0110
					if (un(s) || un(n)) continue;
					gridPath._canvasFillPaths.push([s.canvasPos,se.canvasPos,ne.canvasPos,n.canvasPos]);
				} else if (sw.inequalityHit === false && se.inequalityHit === true && ne.inequalityHit === false && nw.inequalityHit === true) {	// 0101
					if (un(n) || un(e) || un(s) || un(w)) continue;
					gridPath._canvasFillPaths.push([s.canvasPos,se.canvasPos,e.canvasPos],[n.canvasPos,nw.canvasPos,w.canvasPos]);
				} else if (sw.inequalityHit === false && se.inequalityHit === true && ne.inequalityHit === false && nw.inequalityHit === false) {	// 0100
					if (un(s) || un(e)) continue;
					gridPath._canvasFillPaths.push([s.canvasPos,se.canvasPos,e.canvasPos]);
				} else if (sw.inequalityHit === false && se.inequalityHit === false && ne.inequalityHit === true && nw.inequalityHit === true) {	// 0011
					if (un(e) || un(w)) continue;
					gridPath._canvasFillPaths.push([e.canvasPos,ne.canvasPos,nw.canvasPos,w.canvasPos]);
				} else if (sw.inequalityHit === false && se.inequalityHit === false && ne.inequalityHit === true && nw.inequalityHit === false) {	// 0010
					if (un(e) || un(n)) continue;
					gridPath._canvasFillPaths.push([e.canvasPos,ne.canvasPos,n.canvasPos]);
				} else if (sw.inequalityHit === false && se.inequalityHit === false && ne.inequalityHit === false && nw.inequalityHit === true) {	// 0001
					if (un(n) || un(w)) continue;
					gridPath._canvasFillPaths.push([n.canvasPos,nw.canvasPos,w.canvasPos]);
				}
				console.log(gridPath._canvasFillPaths[gridPath._canvasFillPaths.length-1])
			}
		}		
		
		for (var i = 0; i < iMax; i++) {
			for (var j = 0; j <= jMax; j++) {
				if (typeof hEdges[i][j] !== 'object') continue;
				var edge = hEdges[i][j];
				if (j > 0) { // check edges below for join
					var edge0 = vEdges[i][j-1];
					if (typeof edge0 === 'object') {
						if (edge.edgeJoins.indexOf(edge0) === -1) edge.edgeJoins.push(edge0);
						if (edge0.edgeJoins.indexOf(edge) === -1) edge0.edgeJoins.push(edge);
					} else {
						var edge1 = vEdges[i+1][j-1];
						if (typeof edge1 === 'object') {
							if (edge.edgeJoins.indexOf(edge1) === -1) edge.edgeJoins.push(edge1);
							if (edge1.edgeJoins.indexOf(edge) === -1) edge1.edgeJoins.push(edge);
						} else {
							var edge2 = hEdges[i][j-1];
							if (typeof edge2 === 'object') {
								if (edge.edgeJoins.indexOf(edge2) === -1) edge.edgeJoins.push(edge2);
								if (edge2.edgeJoins.indexOf(edge) === -1) edge2.edgeJoins.push(edge);
							}
						}
					}
				}
				if (j < jMax) { // check edges above for join
					var edge3 = vEdges[i][j];
					if (typeof edge3 === 'object') {
						if (edge.edgeJoins.indexOf(edge3) === -1) edge.edgeJoins.push(edge3);
						if (edge3.edgeJoins.indexOf(edge) === -1) edge3.edgeJoins.push(edge);
					} else {
						var edge4 = vEdges[i+1][j];
						if (typeof edge4 === 'object') {
							if (edge.edgeJoins.indexOf(edge4) === -1) edge.edgeJoins.push(edge4);
							if (edge4.edgeJoins.indexOf(edge) === -1) edge4.edgeJoins.push(edge);
						} else {
							var edge5 = hEdges[i][j+1];
							if (typeof edge5 === 'object') {
								if (edge.edgeJoins.indexOf(edge5) === -1) edge.edgeJoins.push(edge5);
								if (edge5.edgeJoins.indexOf(edge) === -1) edge5.edgeJoins.push(edge);
							}
						}
					}
				}
			}
		}
		
		for (var i = 0; i <= iMax; i++) {
			for (var j = 0; j < jMax; j++) {
				if (typeof vEdges[i][j] !== 'object') continue;
				var edge = vEdges[i][j];
				if (i > 0) { // check edges left for join
					var edge0 = hEdges[i-1][j];
					if (typeof edge0 === 'object') {
						if (edge.edgeJoins.indexOf(edge0) === -1) edge.edgeJoins.push(edge0);
						if (edge0.edgeJoins.indexOf(edge) === -1) edge0.edgeJoins.push(edge);
					} else {
						var edge1 = hEdges[i-1][j+1];
						if (typeof edge1 === 'object') {
							if (edge.edgeJoins.indexOf(edge1) === -1) edge.edgeJoins.push(edge1);
							if (edge1.edgeJoins.indexOf(edge) === -1) edge1.edgeJoins.push(edge);
						} else {
							var edge2 = vEdges[i-1][j];
							if (typeof edge2 === 'object') {
								if (edge.edgeJoins.indexOf(edge2) === -1) edge.edgeJoins.push(edge2);
								if (edge2.edgeJoins.indexOf(edge) === -1) edge2.edgeJoins.push(edge);
							}
						}
					}
				}
				if (i < iMax) { // check edges right for join
					var edge3 = hEdges[i][j];
					if (typeof edge3 === 'object') {
						if (edge.edgeJoins.indexOf(edge3) === -1) edge.edgeJoins.push(edge3);
						if (edge3.edgeJoins.indexOf(edge) === -1) edge3.edgeJoins.push(edge);
					} else {
						var edge4 = hEdges[i][j+1];
						if (typeof edge4 === 'object') {
							if (edge.edgeJoins.indexOf(edge4) === -1) edge.edgeJoins.push(edge4);
							if (edge4.edgeJoins.indexOf(edge) === -1) edge4.edgeJoins.push(edge);
						} else {
							var edge5 = vEdges[i+1][j];
							if (typeof edge5 === 'object') {
								if (edge.edgeJoins.indexOf(edge5) === -1) edge.edgeJoins.push(edge5);
								if (edge5.edgeJoins.indexOf(edge) === -1) edge5.edgeJoins.push(edge);
							}
						}
					}
				}
			}
		}
		
		gridPath._edgesHit2 = gridPath._edgesHit.slice(0);
		gridPath._canvasPos = [];
		while (gridPath._edgesHit.length > 0) {
			var seedEdge = gridPath._edgesHit.shift();
			var canvasPosPath = [seedEdge.canvasPos];
			var edge = seedEdge;
			while (!un(edge.edgeJoins[0])) {
				var edge2 = edge.edgeJoins.shift();
				var index = gridPath._edgesHit.indexOf(edge2);
				if (index > -1) gridPath._edgesHit.splice(index,1);
				var index = edge2.edgeJoins.indexOf(edge);
				if (index > -1) edge2.edgeJoins.splice(index,1);
				edge = edge2;
				canvasPosPath.push(edge2.canvasPos);
			}
			edge = seedEdge;
			while (!un(edge.edgeJoins[0])) {
				var edge2 = edge.edgeJoins.shift();
				var index = gridPath._edgesHit.indexOf(edge2);
				if (index > -1) gridPath._edgesHit.splice(index,1);
				var index = edge2.edgeJoins.indexOf(edge);
				if (index > -1) edge2.edgeJoins.splice(index,1);
				edge = edge2;
				canvasPosPath.unshift(edge2.canvasPos);
			}
			gridPath._canvasPos.push(canvasPosPath);
		}
	},
	drawInequality: function(ctx, gridPath) {
		ctx.save();
		var color = !un(gridPath.color) ? gridPath.color : '#F00';
		ctx.fillStyle = colorA(color,0.3);
		for (var i = 0; i < gridPath._canvasFillPaths.length; i++) {
			var fillPath = gridPath._canvasFillPaths[i];
			ctx.beginPath();
			ctx.moveTo(fillPath[0][0],fillPath[0][1]);
			for (var j = 1; j < fillPath.length; j++) {
				ctx.lineTo(fillPath[j][0],fillPath[j][1]);
			}
			ctx.lineTo(fillPath[0][0],fillPath[0][1]);
			ctx.fill();
		}		
		ctx.strokeStyle = color;
		ctx.lineWidth = 5;
		if (gridPath.inequality === '>' || gridPath.inequality === '<') ctx.setLineDash([15,15]);
		ctx.beginPath();
		var canvasPos = gridPath._canvasPos;
		for (var c = 0; c < canvasPos.length; c++) {
			var pos = canvasPos[c];
			ctx.moveTo(pos[0][0],pos[0][1]);
			for (var p = 1; p < pos.length - 2; p++) {
				ctx.quadraticCurveTo(pos[p][0], pos[p][1], (pos[p][0] + pos[p + 1][0]) / 2, (pos[p][1] + pos[p + 1][1]) / 2);
			}
			if (pos.length > p + 1) ctx.quadraticCurveTo(pos[p][0], pos[p][1], pos[p + 1][0], pos[p + 1][1]);
			ctx.stroke();
		}
		ctx.stroke();
		ctx.restore();
	},*/
	
	calcFillPath: function(grid,gridPath) { // poss issue with asymptotes?
		if (gridPath.bounds instanceof Array === false) gridPath.bounds = [];
		var a = 1, b = 1, c = 1, m = 1;
		if (typeof grid.vars === 'object') {
			if (typeof grid.vars.a === 'object') a = grid.vars.a.value;
			if (typeof grid.vars.b === 'object') b = grid.vars.b.value;
			if (typeof grid.vars.c === 'object') c = grid.vars.c.value;
			if (typeof grid.vars.m === 'object') m = grid.vars.m.value;
		}
		
		var squareWidth = 6; // this is the 'draw density' smaller = more accurate, but longer to calculate
		
		var iMax = Math.floor(grid.width / squareWidth) + 1;
		var xCanvasInc = grid.width / (iMax-1);
		var xPosInc = (grid.xMax-grid.xMin) / (iMax-1);
		
		var jMax = Math.floor(grid.height / squareWidth) + 1;
		var yCanvasInc = grid.height / (jMax-1);
		var yPosInc = (grid.yMax-grid.yMin) / (jMax-1);
		
		var boundsCount = gridPath.bounds.length;
		
		var points = [];
		
		for (var i = 0; i <= iMax; i++) {
			var x = grid.xMin+i*xPosInc;
			points[i] = [];
			for (var j = 0; j <= jMax; j++) {
				var y = grid.yMin+j*yPosInc;
				var point = {
					gridPos:[x,y],
					canvasPos:[grid.left+i*xCanvasInc,grid.top+grid.height-j*yCanvasInc],
					boundsValues:[],
					hit:true
				};
				for (var b = 0; b < boundsCount; b++) {
					var bound = gridPath.bounds[b];
					if (typeof bound.func !== 'function') {
						point.boundsValues.push(0);
						continue;
					}
					var value = bound.func(x,y,a,b,c,m);
					point.boundsValues.push(value);
					if ((value > 0 && bound.symbol === '<') || (value < 0 && bound.symbol === '>')) point.hit = false;
				}
				points[i][j] = point;
			}
		}
		
		gridPath._canvasFillPaths = [];
		gridPath._gridFillPaths = [];
		for (var i = 0; i < iMax; i++) {
			for (var j = 0; j < jMax; j++) {
				var sw = points[i][j];
				var se = points[i+1][j];
				var ne = points[i+1][j+1];
				var nw = points[i][j+1];
				if (sw.hit === false && se.hit === false && ne.hit === false && nw.hit === false) continue; // 0000
				if (sw.hit === true && se.hit === true && ne.hit === true && nw.hit === true) {				// 1111
					gridPath._canvasFillPaths.push([sw.canvasPos,se.canvasPos,ne.canvasPos,nw.canvasPos]);
					gridPath._gridFillPaths.push([sw.gridPos,se.gridPos,ne.gridPos,nw.gridPos]);
					continue;
				}
				var nodePaths = [];
				if (sw.hit === true && se.hit === true && ne.hit === true && nw.hit === false) {			// 1110
					nodePaths.push(['sw','se','ne','n','w']);
				} else if (sw.hit === true && se.hit === true && ne.hit === false && nw.hit === true) {		// 1101
					nodePaths.push(['sw','se','e','n','nw']);
				} else if (sw.hit === true && se.hit === true && ne.hit === false && nw.hit === false) {	// 1100
					nodePaths.push(['sw','se','e','w']);
				} else if (sw.hit === true && se.hit === false && ne.hit === true && nw.hit === true) {		// 1011
					nodePaths.push(['sw','s','e','ne','nw']);
				} else if (sw.hit === true && se.hit === false && ne.hit === true && nw.hit === false) {	// 1010
					nodePaths.push(['sw','s','w'],['ne','n','e']);
				} else if (sw.hit === true && se.hit === false && ne.hit === false && nw.hit === true) {	// 1001
					nodePaths.push(['sw','s','n','nw']);
				} else if (sw.hit === true && se.hit === false && ne.hit === false && nw.hit === false) {	// 1000
					nodePaths.push(['sw','s','w']);
				} else if (sw.hit === false && se.hit === true && ne.hit === true && nw.hit === true) {		// 0111
					nodePaths.push(['s','se','ne','nw','w']);
				} else if (sw.hit === false && se.hit === true && ne.hit === true && nw.hit === false) {	// 0110
					nodePaths.push(['s','se','ne','n']);
				} else if (sw.hit === false && se.hit === true && ne.hit === false && nw.hit === true) {	// 0101
					nodePaths.push(['s','se','e'],['n','nw','w']);
				} else if (sw.hit === false && se.hit === true && ne.hit === false && nw.hit === false) {	// 0100
					nodePaths.push(['s','se','e']);
				} else if (sw.hit === false && se.hit === false && ne.hit === true && nw.hit === true) {	// 0011
					nodePaths.push(['e','ne','nw','w']);
				} else if (sw.hit === false && se.hit === false && ne.hit === true && nw.hit === false) {	// 0010
					nodePaths.push(['e','ne','n']);
				} else if (sw.hit === false && se.hit === false && ne.hit === false && nw.hit === true) {	// 0001
					nodePaths.push(['n','nw','w']);
				}
				
				for (var p = 0; p < nodePaths.length; p++) {
					var nodePath = nodePaths[p];
					var canvasFillPath = [];
					var gridFillPath = [];
					for (var q = 0; q < nodePath.length; q++) {
						var node = nodePath[q];
						if (node === 'se') {
							canvasFillPath.push(se.canvasPos);
							gridFillPath.push(se.gridPath);
						} else if (node === 'sw') {
							canvasFillPath.push(sw.canvasPos);
							gridFillPath.push(sw.gridPath)
						} else if (node === 'nw') {
							canvasFillPath.push(nw.canvasPos);
							gridFillPath.push(nw.gridPath)
						} else if (node === 'ne') {
							canvasFillPath.push(ne.canvasPos);
							gridFillPath.push(ne.gridPath)
						} else if (node === 's') {
							var canvasPos = [(se.canvasPos[0]+sw.canvasPos[0])/2,se.canvasPos[1]];
							var gridPos = [(se.gridPos[0]+sw.gridPos[0])/2,se.gridPos[1]];
							for (var b = 0; b < boundsCount; b++) {
								if ((se.boundsValues[b] < 0 && sw.boundsValues[b] >= 0) || (se.boundsValues[b] >= 0 && sw.boundsValues[b] < 0)) {
									canvasPos[0] = se.canvasPos[0]+(sw.canvasPos[0]-se.canvasPos[0])*se.boundsValues[b]/(se.boundsValues[b]-sw.boundsValues[b]);
									gridPos[0] = se.gridPos[0]+(sw.gridPos[0]-se.gridPos[0])*se.boundsValues[b]/(se.boundsValues[b]-sw.boundsValues[b]);
									break;
								}
							}
							canvasFillPath.push(canvasPos);
							gridFillPath.push(gridPos);
						} else if (node === 'e') {
							var canvasPos = [se.canvasPos[0],(se.canvasPos[1]+ne.canvasPos[1])/2];
							var gridPos = [se.gridPos[0],(se.gridPos[1]+ne.gridPos[1])/2];
							for (var b = 0; b < boundsCount; b++) {
								if ((se.boundsValues[b] < 0 && ne.boundsValues[b] >= 0) || (se.boundsValues[b] >= 0 && ne.boundsValues[b] < 0)) {
									canvasPos[1] = se.canvasPos[1]+(ne.canvasPos[1]-se.canvasPos[1])*se.boundsValues[b]/(se.boundsValues[b]-ne.boundsValues[b]);
									gridPos[1] = se.gridPos[1]+(ne.gridPos[1]-se.gridPos[1])*se.boundsValues[b]/(se.boundsValues[b]-ne.boundsValues[b]);
									break;
								}
							}
							canvasFillPath.push(canvasPos);
							gridFillPath.push(gridPos);
						} else if (node === 'n') {
							var canvasPos = [(ne.canvasPos[0]+nw.canvasPos[0])/2,ne.canvasPos[1]];
							var gridPos = [(ne.gridPos[0]+nw.gridPos[0])/2,ne.gridPos[1]];
							for (var b = 0; b < boundsCount; b++) {
								if ((ne.boundsValues[b] < 0 && nw.boundsValues[b] >= 0) || (ne.boundsValues[b] >= 0 && nw.boundsValues[b] < 0)) {
									canvasPos[0] = ne.canvasPos[0]+(nw.canvasPos[0]-ne.canvasPos[0])*ne.boundsValues[b]/(ne.boundsValues[b]-nw.boundsValues[b]);
									gridPos[0] = ne.gridPos[0]+(nw.gridPos[0]-ne.gridPos[0])*ne.boundsValues[b]/(ne.boundsValues[b]-nw.boundsValues[b]);
									break;
								}
							}
							canvasFillPath.push(canvasPos);
							gridFillPath.push(gridPos);
						} else if (node === 'w') {
							var canvasPos = [sw.canvasPos[0],(sw.canvasPos[1]+nw.canvasPos[1])/2];
							var gridPos = [sw.gridPos[0],(sw.gridPos[1]+nw.gridPos[1])/2];
							for (var b = 0; b < boundsCount; b++) {
								if ((sw.boundsValues[b] < 0 && nw.boundsValues[b] >= 0) || (sw.boundsValues[b] >= 0 && nw.boundsValues[b] < 0)) {
									canvasPos[1] = sw.canvasPos[1]+(nw.canvasPos[1]-sw.canvasPos[1])*sw.boundsValues[b]/(sw.boundsValues[b]-nw.boundsValues[b]);
									gridPos[1] = sw.gridPos[1]+(nw.gridPos[1]-sw.gridPos[1])*sw.boundsValues[b]/(sw.boundsValues[b]-nw.boundsValues[b]);
									break;
								}
							}
							canvasFillPath.push(canvasPos);
							gridFillPath.push(gridPos);
						}
					}
					gridPath._canvasFillPaths.push(canvasFillPath);
				}				
			}
		}		
	},
	drawFillPath: function(ctx, gridPath) {
		ctx.save();
		var color = !un(gridPath.color) ? gridPath.color : '#F00';
		ctx.fillStyle = colorA(color,0.3);
		for (var i = 0; i < gridPath._canvasFillPaths.length; i++) {
			var fillPath = gridPath._canvasFillPaths[i];
			ctx.beginPath();
			ctx.moveTo(fillPath[0][0],fillPath[0][1]);
			for (var j = 1; j < fillPath.length; j++) {
				ctx.lineTo(fillPath[j][0],fillPath[j][1]);
			}
			ctx.fill();
		}
		ctx.restore();
	},
	getGridPathFunctionNonDynamic:function(grid,func) {
		var a = 1, b = 1, c = 1, m = 1;
		if (typeof grid.vars === 'object') {
			if (typeof grid.vars.a === 'object') a = grid.vars.a.value;
			if (typeof grid.vars.b === 'object') b = grid.vars.b.value;
			if (typeof grid.vars.c === 'object') c = grid.vars.c.value;
			if (typeof grid.vars.m === 'object') m = grid.vars.m.value;
		}
		var funcString = func.toString();
		for (var i = funcString.indexOf('return ')+7; i < funcString.length; i++) {
			if (funcString.slice(i,i+5) === 'Math.') {
				for (var j = i+5; j < funcString.length; j++) { // search through until non-letter is found
					if (/[^a-z]/.test(funcString.slice(j,j+1).toLowerCase()) === false) {
						i = j;
						break;
					}
				}
				i += 5;
				break;
			}
			if (funcString.slice(i,i+1).toLowerCase() === 'a') {
				var str = String(a);
				funcString = funcString.slice(0,i)+str+funcString.slice(i+1);
				i += str.length-1;
			} else if (funcString.slice(i,i+1).toLowerCase() === 'b') {
				var str = String(b);
				funcString = funcString.slice(0,i)+str+funcString.slice(i+1);
				i += str.length-1;
			} else if (funcString.slice(i,i+1).toLowerCase() === 'c') {
				var str = String(c);
				funcString = funcString.slice(0,i)+str+funcString.slice(i+1);
				i += str.length-1;
			} else if (funcString.slice(i,i+1).toLowerCase() === 'm') {
				var aStr = String(m);
				funcString = funcString.slice(0,i)+str+funcString.slice(i+1);
				i += str.length-1;
			}
		}
		return new Function('return '+funcString)();
	},
	
	drawInequality3Part: function(ctx,grid,gridPath) {
		if (gridPath._pos1 > gridPath._pos2) return false;
		if ((gridPath.letter === 'x' && (gridPath._pos1 > grid.xMax || gridPath._pos2 < grid.xMin)) || (gridPath.letter === 'y' && (gridPath._pos1 > grid.yMax || gridPath._pos2 < grid.yMin))) {
			if (grid.inequalitiesShadeOut === true) {
				ctx.save();
				ctx.fillStyle = !un(gridPath.fillColor) ? gridPath.fillColor : !un(gridPath.color) ? colorA(gridPath.color,0.3) : colorA('#00F',0.3);
				ctx.fill(grid.left,grid.top,grid.width,grid.height);
				ctx.restore();
			}
			return false;
		}
		if (gridPath.symbol !== '≤' && gridPath._pos1 === gridPath._pos2) return false;
		var pos1, pos2, pos3, pos4;
		ctx.save();
		ctx.fillStyle = !un(gridPath.fillColor) ? gridPath.fillColor : !un(gridPath.color) ? colorA(gridPath.color,0.3) : colorA('#00F',0.3);
		if (gridPath.letter === 'x') {
			var xPos1 = Math.max(grid.left,Math.min(grid.left+grid.width,getPosOfCoordX2(gridPath._pos1, grid.left, grid.width, grid.xMin, grid.xMax)));
			var xPos2 = Math.max(grid.left,Math.min(grid.left+grid.width,getPosOfCoordX2(gridPath._pos2, grid.left, grid.width, grid.xMin, grid.xMax)));
			if (grid.inequalitiesShadeOut === true) {
				if (gridPath._pos1 > grid.xMin) ctx.fillRect(grid.left,grid.top,xPos1-grid.left,grid.height);
				if (gridPath._pos2 < grid.xMax) ctx.fillRect(xPos2,grid.top,grid.left+grid.width-xPos2,grid.height);
			} else {
				ctx.fillRect(xPos1,grid.top,xPos2-xPos1,grid.height);
			}
			if (gridPath._pos1 >= grid.xMin && gridPath._pos1 <= grid.xMax) {
				pos1 = [xPos1,grid.top];
				pos2 = [xPos1,grid.top+grid.height];
			}
			if (gridPath._pos2 >= grid.xMin && gridPath._pos2 <= grid.xMax) {
				pos3 = [xPos2,grid.top];
				pos4 = [xPos2,grid.top+grid.height];
			}
		} else if (gridPath.letter === 'y') {
			var yPos1 = Math.max(grid.top,Math.min(grid.top+grid.height,getPosOfCoordY2(gridPath._pos1, grid.top, grid.height, grid.yMin, grid.yMax)));
			var yPos2 = Math.max(grid.top,Math.min(grid.top+grid.height,getPosOfCoordY2(gridPath._pos2, grid.top, grid.height, grid.yMin, grid.yMax)));
			if (grid.inequalitiesShadeOut === true) {
				if (gridPath._pos1 > grid.yMin) ctx.fillRect(grid.left,grid.top,grid.width,yPos1-grid.top);
				if (gridPath._pos2 < grid.yMax) ctx.fillRect(grid.left,yPos2,grid.width,grid.top+grid.height-yPos2);
			} else {
				ctx.fillRect(grid.left,yPos1,grid.width,yPos2-yPos1);
			}
			if (gridPath._pos1 >= grid.yMin && gridPath._pos1 <= grid.yMax) {
				pos1 = [grid.left,yPos1];
				pos2 = [grid.left+grid.width,yPos1];
			}
			if (gridPath._pos2 >= grid.yMin && gridPath._pos2 <= grid.yMax) {
				pos3 = [grid.left,yPos2];
				pos4 = [grid.left+grid.width,yPos2];
			}
		}
		ctx.strokeStyle = gridPath.color || gridPath.strokeStyle || '#00F';
		ctx.lineWidth = !un(gridPath.lineWidth) ? gridPath.lineWidth : 5;
		if (!un(pos1) && !un(pos2)) {
			ctx.setLineDash(gridPath.symbol.slice(0,1) === '<' ? [15,15] : []);
			ctx.beginPath();
			ctx.moveTo(pos1[0], pos1[1]);
			ctx.lineTo(pos2[0], pos2[1]);
			ctx.stroke();
		}
		if (!un(pos3) && !un(pos4)) {
			ctx.setLineDash(gridPath.symbol.slice(1,2) === '<' ? [15,15] : []);
			ctx.beginPath();
			ctx.moveTo(pos3[0], pos3[1]);
			ctx.lineTo(pos4[0], pos4[1]);
			ctx.stroke();
		}
		ctx.setLineDash([]);
		ctx.restore();
	},
	/*drawInequalityLinear: function(ctx,grid,gridPath) {
		var x1 = gridPath._pos[0][0];
		var y1 = gridPath._pos[0][1];
		var x2 = gridPath._pos[1][0];
		var y2 = gridPath._pos[1][1];	
		var inequality = {'<':'lt','≤':'lt','>':'gt','≥':'gt'}[gridPath.inequality]; 
		if (grid.inequalitiesShadeOut === true) inequality = inequality === 'lt' ? 'gt' : 'lt';

		ctx.save();
		ctx.fillStyle = gridPath.fillColor;
		var p1, p2;
		
		if (Math.abs(x1 - x2) < 0.001) {
			var xPos = Math.max(grid.left,Math.min(grid.left+grid.width,getPosOfCoordX2(x1, grid.left, grid.width, grid.xMin, grid.xMax)));
			if (inequality === 'lt' && x1 > grid.xMin) {
				ctx.fillRect(grid.left,grid.top,xPos-grid.left,grid.height);
			} else if (inequality === 'gt' && x1 < grid.xMax) {
				ctx.fillRect(xPos,grid.top,grid.left+grid.width-xPos,grid.height);
			}
			if (x1 >= grid.xMin && x1 <= grid.xMax) {
				p1 = [xPos,grid.top];
				p2 = [xPos,grid.top+grid.height];
			}
		} else if (Math.abs(y1 - y2) < 0.001) {
			var yPos = Math.max(grid.top,Math.min(grid.top+grid.height,getPosOfCoordY2(y1, grid.top, grid.height, grid.yMin, grid.yMax)));
			if (inequality === 'lt' && y1 > grid.yMin) {
				ctx.fillRect(grid.left,yPos,grid.width,grid.top+grid.height-yPos);
			} else if (inequality === 'gt' && y1 < grid.yMax) {
				ctx.fillRect(grid.left,grid.top,grid.width,yPos-grid.top);
			}
			if (y1 >= grid.yMin && y1 <= grid.yMax) {
				p1 = [grid.left,yPos];
				p2 = [grid.left+grid.width,yPos];
			}
		} else {		
			var x1Pos = getPosOfCoordX2(x1, grid.left, grid.width, grid.xMin, grid.xMax);
			var y1Pos = getPosOfCoordY2(y1, grid.top, grid.height, grid.yMin, grid.yMax);		
			var x2Pos = getPosOfCoordX2(x2, grid.left, grid.width, grid.xMin, grid.xMax);
			var y2Pos = getPosOfCoordY2(y2, grid.top, grid.height, grid.yMin, grid.yMax);
					
			var intersectionPoints = [];
			var polygon = [[grid.left,grid.top],[grid.left+grid.width,grid.top],[grid.left+grid.width,grid.top+grid.height],[grid.left,grid.top+grid.height]];
			for (var p = 0; p < 4; p++) { // check if line goes through corner points
				var point = polygon[p];
				if (intersectionPoints.indexOf(point) > -1) continue;
				if (isPointOnLine(point, [x1Pos,y1Pos], [x2Pos,y2Pos])) {
					intersectionPoints.push([point[0],point[1],['nw','ne','se','sw'][p]]);
				}
			}
			for (var p = 0; p < 4; p++) {			
				var line = [polygon[p],polygon[(p+1)%4]];
				if (intersects2(x1Pos, y1Pos, x2Pos, y2Pos, line[0][0], line[0][1], line[1][0], line[1][1]) === true) {
					var point = intersection(x1Pos, y1Pos, x2Pos, y2Pos, line[0][0], line[0][1], line[1][0], line[1][1]);
					var found = false;
					for (var i = 0; i < intersectionPoints.length; i++) {
						if (Math.abs(intersectionPoints[i][0]-point[0]) < 0.01 && Math.abs(intersectionPoints[i][1]-point[1]) < 0.01) {
							found = true;
							break;
						}
					}
					if (found === false) intersectionPoints.push([point[0],point[1],['n','e','s','w'][p]]);
				}
			}
			if (intersectionPoints.length < 2) {
				var cw = polygonClockwiseTest([[x1,y1],[x2,y2],[(grid.xMin+grid.xMax)/2,(grid.yMin+grid.yMax)/2]]);
				if ((cw === true && inequality === 'lt') || (cw === false && inequality === 'gt')) {
					ctx.fillStyle = gridPath.fillColor;
					ctx.fillRect(grid.left,grid.top,grid.width,grid.height);
				}
				ctx.restore();
				return;
			}
			
			var order = ['nw','w','sw','n','s','ne','e','se'];
			intersectionPoints.sort(function(a,b) {return order.indexOf(a[2])-order.indexOf(b[2]);});
			
			p1 = intersectionPoints[0].slice(0,2);
			p2 = intersectionPoints[1].slice(0,2);

			var d1 = intersectionPoints[0][2];
			var d2 = intersectionPoints[1][2];
			var shadePolygon = [];
			
			if (d1 === 'nw') {
				if (d2 === 'e') {
					if (inequality === 'lt') {
						shadePolygon.push(polygon[0],p2,polygon[2],polygon[3]);
					} else {
						shadePolygon.push(polygon[0],polygon[1],p2);
					}
				} else if (d2 === 'se') {
					if (inequality === 'lt') {
						shadePolygon.push(polygon[0],polygon[2],polygon[3]);
					} else {
						shadePolygon.push(polygon[0],polygon[1],polygon[2]);
					}
				} else if (d2 === 's') {
					if (inequality === 'lt') {
						shadePolygon.push(polygon[0],p2,polygon[3]);
					} else {
						shadePolygon.push(polygon[0],polygon[1],polygon[2],p2);
					}
				}
			} else if (d1 === 'w') {
				if (d2 === 'ne') {
					if (inequality === 'lt') {
						shadePolygon.push(p1,polygon[1],polygon[2],polygon[3]);
					} else {
						shadePolygon.push(p1,polygon[0],polygon[1]);
					}
				} else if (d2 === 'e') {
					if (inequality === 'lt') {
						shadePolygon.push(p1,p2,polygon[2],polygon[3]);
					} else {
						shadePolygon.push(p1,polygon[0],polygon[1],p2);
					}
				} else if (d2 === 'se') {
					if (inequality === 'lt') {
						shadePolygon.push(p1,polygon[2],polygon[3]);
					} else {
						shadePolygon.push(p1,polygon[0],polygon[1],polygon[2]);
					}
				} else if (d2 === 'n') {
					if (inequality === 'lt') {
						shadePolygon.push(p1,p2,polygon[1],polygon[2],polygon[3]);
					} else {
						shadePolygon.push(p1,polygon[0],p2);
					}
				} else if (d2 === 's') {
					if (inequality === 'lt') {
						shadePolygon.push(p1,p2,polygon[3]);
					} else {
						shadePolygon.push(p1,polygon[0],polygon[1],polygon[2],p2);
					}
				}
			} else if (d1 === 'sw') {
				if (d2 === 'e') {
					if (inequality === 'lt') {
						shadePolygon.push(polygon[3],p2,polygon[2]);
					} else {
						shadePolygon.push(polygon[3],polygon[0],polygon[1],p2);
					}
				} else if (d2 === 'ne') {
					if (inequality === 'lt') {
						shadePolygon.push(polygon[3],polygon[1],polygon[2]);
					} else {
						shadePolygon.push(polygon[3],polygon[0],polygon[1]);
					}
				} else if (d2 === 'n') {
					if (inequality === 'lt') {
						shadePolygon.push(polygon[3],p2,polygon[1],polygon[2]);
					} else {
						shadePolygon.push(polygon[3],polygon[0],p2);
					}
				}
			} else if (d1 === 'n') {
				if (d2 === 'e') {
					if (inequality === 'lt') {
						shadePolygon.push(polygon[0],p1,p2,polygon[2],polygon[3]);
					} else {
						shadePolygon.push(p1,polygon[1],p2);
					}
				} else if (d2 === 'se') {
					if (inequality === 'lt') {
						shadePolygon.push(polygon[0],p1,polygon[2],polygon[3]);
					} else {
						shadePolygon.push(p1,polygon[1],polygon[2]);
					}
				} else if (d2 === 's') {
					if (p1[0] < p2[0] && inequality === 'lt' || p1[0] > p2[0] && inequality === 'gt') {
						shadePolygon.push(polygon[0],p1,p2,polygon[3]);
					} else {
						shadePolygon.push(p1,polygon[1],polygon[2],p2);
					}
				}
			} else if (d1 === 's') {
				if (d2 === 'e') {
					if (inequality === 'lt') {
						shadePolygon.push(p1,p2,polygon[2]);
					} else {
						shadePolygon.push(polygon[0],polygon[1],p2,p1,polygon[3]);
					}
				} else if (d2 === 'ne') {
					if (inequality === 'lt') {
						shadePolygon.push(p1,polygon[1],polygon[2]);
					} else {
						shadePolygon.push(polygon[0],polygon[1],p1,polygon[3]);
					}
				}
			}
			if (shadePolygon.length > 2) {
				ctx.beginPath();
				ctx.moveTo(shadePolygon[0][0],shadePolygon[0][1]);
				for (var i = 1; i < shadePolygon.length; i++) {
					ctx.lineTo(shadePolygon[i][0],shadePolygon[i][1]);
				}
				ctx.lineTo(shadePolygon[0][0],shadePolygon[0][1]);
				ctx.fill();
			}
		}
		
		if (!un(p1) && !un(p2)) {
			ctx.setLineDash(gridPath.inequality === '<' || gridPath.inequality === '>' ? [15,15] : []);
			ctx.strokeStyle = gridPath.color || gridPath.strokeStyle || '#00F';
			ctx.lineWidth = !un(gridPath.lineWidth) ? gridPath.lineWidth : 5;
			ctx.beginPath();
			ctx.moveTo(p1[0], p1[1]);
			ctx.lineTo(p2[0], p2[1]);
			ctx.stroke();
			ctx.setLineDash([]);
		}	
		ctx.restore();
	},*/
	
	drawControls:function(ctx,obj,path) {
		obj._cursorPos = [];
		var controlsStyle = 'none';
		var buttons = draw.grid3.interactDefaultButtons;
		var interact = obj.interact || path.isInput || path.interact;
		if (draw.mode === 'edit' && path.selected === true) {
			controlsStyle = 'full';
		} else {
			if (!un(interact) && !un(interact.controlsStyle)) {
				controlsStyle = interact.controlsStyle;
				var buttons = interact.buttons || draw.grid3.interactDefaultButtons;
			} else if (!un(interact) && interact.type == 'grid') {
				controlsStyle = interact.controlsStyle || 'buttons';
				var buttons = interact.buttons || draw.grid3.interactDefaultButtons;
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
				draw.grid3.drawInteractButton(ctx, obj, buttons[b], x2, y2, size, size, undefined, obj.controlsColors);
				obj._cursorPos.push({
					buttonType: 'grid-' + buttons[b],
					shape: 'rect',
					dims: [x2, y2, size, size],
					cursor: draw.cursors.pointer,
					func: draw.grid3.interactButtonClick,
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
					func: draw.grid3.controlsMoveStart,
					pathNum: pathNum,
					obj: obj,
					relPos: [x,y]
				});
			}
			
			var x2 = x;
			var buttons = ['move', 'zoomDrag', '1:1', 'gridToggle', 'axesToggle', (!un(interact) && interact.plotStyle === 'circle') ? 'pointCircle' : 'plot', 'lineSegment', 'line', 'lineDash', 'fill', 'viewMenu'];
			for (var b = 0; b < buttons.length; b++) {
				draw.grid3.drawInteractButton(ctx, obj, buttons[b], x2+h*b, y, h, h);
				obj._cursorPos.push({
					buttonType: 'grid-' + buttons[b],
					shape: 'rect',
					dims: [x2+h*b, y, h, h],
					cursor: draw.cursors.pointer,
					func: draw.grid3.interactButtonClick,
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
			var width = h*buttons.length;
			y += h;
			h = 40;
						
			if (obj._interactViewMenu !== true) {
				draw.grid3.drawGridPathList(ctx,obj,[x,y,h*buttons.length,600],pathNum);
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
							onInputEnd:draw.grid3.propertyChangeInputEnd,
							deselectOnInputStart:false,
							deselectOnInputEnd:false,
							grid:obj,
							property:properties[t],
							_drawCanvasPaths:true
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
						func: draw.grid3.interactButtonClick,
						obj: obj,
						pathNum:pathNum,
						highlight: -1,
						mode:prop[0],
						prop:prop
					});
				}
				
			}
		} else if (controlsStyle === 'custom' && !un(interact) && interact.buttons instanceof Array) {
			var h = interact.buttonSize || 50;
			
			var color = !un(obj._interactColor) ? obj._interactColor : (!un(interact) && !un(interact.color)) ? interact.color : '#00F';
			if (color === 'none') color = '#FFF';
			
			for (var b = 0; b < interact.buttons.length; b++) {
				var button = interact.buttons[b];
				draw.grid3.drawInteractButton(ctx, obj, button.type, button.pos[0], button.pos[1], h, h, color);
				obj._cursorPos.push({
					buttonType: 'grid-' + button.type,
					shape: 'rect',
					dims: [button.pos[0], button.pos[1], h, h],
					cursor: draw.cursors.pointer,
					func: draw.grid3.interactButtonClick,
					pathNum: pathNum,
					obj: obj,
					mode: button.type
				});
				if (button.type === 'zoomIn') {
					obj._cursorPos.last().factor = 2/3;
				} else if (button.type === 'zoomOut') {
					obj._cursorPos.last().factor = 3/2;
				}
			}
			
			if (obj._interactViewMenu === true && !un(interact.functionListRect)) {
				var rect = interact.functionListRect;
				
				text({
					ctx:ctx,
					rect:rect,
					align:[-1,-1],
					text:'Grid Settings',
					font:'Arial',
					fontSize:28,
					bold:true,
					box:{type:'loose',borderColor:'000',borderWidth:2,color:'#FFC'}
				});
				
				drawCross(ctx, 25, 25, '#F00', rect[0]+rect[2]-35, rect[1]+10, 3);
				obj._cursorPos.push({
					buttonType: '',
					shape: 'rect',
					dims: [rect[0]+rect[2]-45, rect[1], 45, 45],
					cursor: draw.cursors.pointer,
					func: draw.grid3.interactButtonClick,
					pathNum: pathNum,
					obj: obj,
					mode: 'viewMenu'
				});
				
				var x = rect[0]+20;
				var y = rect[1]+60;
				var h = 55;
				var h2 = 45;
				var w = rect[2]-40;
				var fontSize = 26;
				
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
							onInputEnd:draw.grid3.propertyChangeInputEnd,
							deselectOnInputStart:false,
							deselectOnInputEnd:false,
							grid:obj,
							property:properties[t],
							_drawCanvasPaths:true
						}
					}
				}
							
				ctx.fillStyle = colorA('#FFF', 1);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x,y,w,h2);
				ctx.strokeRect(x,y,w,h2);
				ctx.fillRect(x,y+h2,w,h2);
				ctx.strokeRect(x,y+h2,w,h2);
				ctx.beginPath();
				ctx.moveTo(x+w/4,y+h2);
				ctx.lineTo(x+w/4,y+2*h2);
				ctx.moveTo(x+2*w/4,y+h2);
				ctx.lineTo(x+2*w/4,y+2*h2);
				ctx.moveTo(x+3*w/4,y+h2);
				ctx.lineTo(x+3*w/4,y+2*h2);
				ctx.stroke();
				
				obj._viewMenuTextObjs.xMin.rect = [x,y,140,h2];
				text({ctx:ctx,rect:[x,y,w,h2],align:[0,0],font:'algebra',fontSize:fontSize,text:[lessThanEq+' x '+lessThanEq]});
				obj._viewMenuTextObjs.xMax.rect = [x+w-140,y,140,h2];
				text({ctx:ctx,rect:[x,y+h2,w/4,h2],align:[0,0],italic:true,fontSize:24,text:['scale:']});
				obj._viewMenuTextObjs.xMajorStep.rect = [x+w/4,y+h2,w/4,h2];
				text({ctx:ctx,rect:[x+2*w/4,y+h2,w/4,h2],align:[0,0],italic:true,fontSize:24,text:['lines:']});
				obj._viewMenuTextObjs.xMinorStep.rect = [x+3*w/4,y+h2,w/4,h2];

				y += 2.5*h2;

				ctx.fillStyle = colorA('#FFF', 1);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.fillRect(x,y,w,h2);
				ctx.strokeRect(x,y,w,h2);
				ctx.fillRect(x,y+h2,w,h2);
				ctx.strokeRect(x,y+h2,w,h2);
				ctx.beginPath();
				ctx.moveTo(x+w/4,y+h2);
				ctx.lineTo(x+w/4,y+2*h2);
				ctx.moveTo(x+2*w/4,y+h2);
				ctx.lineTo(x+2*w/4,y+2*h2);
				ctx.moveTo(x+3*w/4,y+h2);
				ctx.lineTo(x+3*w/4,y+2*h2);
				ctx.stroke();
				
				obj._viewMenuTextObjs.yMin.rect = [x,y,140,h2];
				text({ctx:ctx,rect:[x,y,w,h2],align:[0,0],font:'algebra',fontSize:fontSize,text:[lessThanEq+' y '+lessThanEq]});
				obj._viewMenuTextObjs.yMax.rect = [x+w-140,y,140,h2];
				text({ctx:ctx,rect:[x,y+h2,w/4,h2],align:[0,0],italic:true,fontSize:24,text:['scale:']});
				obj._viewMenuTextObjs.yMajorStep.rect = [x+w/4,y+h2,w/4,h2];
				text({ctx:ctx,rect:[x+2*w/4,y+h2,w/4,h2],align:[0,0],italic:true,fontSize:24,text:['lines:']});
				obj._viewMenuTextObjs.yMinorStep.rect = [x+3*w/4,y+h2,w/4,h2];
				
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

				y += 2.8*h2;
				
				var buttons = ['zoomDrag','gridToggle','axesToggle','scalesToggle','1:1'];
				for (var b = 0; b < buttons.length; b++) {
					var button = buttons[b];
					var x2 = x+w/2-h*buttons.length/2+b*h;
					draw.grid3.drawInteractButton(ctx, obj, button, x2, y, h, h, '#000');
					obj._cursorPos.push({
						buttonType: button,
						shape: 'rect',
						dims: [x2, y, h, h],
						cursor: draw.cursors.pointer,
						func: draw.grid3.interactButtonClick,
						pathNum: pathNum,
						obj: obj,
						mode: button
					});
				}				

				y += 1.4*h;
				
				text({ctx:ctx,rect:[x,y,w,h],align:[-1,0],font:'Arial',fontSize:fontSize,text:['Font size:']});
				var x1 = x+w/2;
				var x2 = x+w;
				var x3 = x1+(x2-x1)*(obj.fontSize-20)/(36-20);
				var y2 = y+h/2;
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.moveTo(x1,y2);
				ctx.lineTo(x2,y2);
				ctx.stroke();
				ctx.fillStyle = '#000';
				ctx.beginPath();
				ctx.moveTo(x3,y2);
				ctx.arc(x3,y2,14,0,2*Math.PI);
				ctx.fill();
				obj._cursorPos.push({
					buttonType: button,
					shape: 'circle',
					dims: [x3,y2,20],
					cursor: draw.cursors.move1,
					func: draw.grid3.fontSizeSliderStart,
					pathNum: pathNum,
					obj: obj,
					x1: x1,
					x2: x2,
					y: y2
				});
				
				y += 1.4*h;
				
				if (interact.showInequalitiesShadeToggle !== false) {
					text({ctx:ctx,rect:[x,y,w,h*0.8],align:[0,0],font:'Arial',fontSize:fontSize*0.9,text:['Inequalities shade '+(obj.inequalitiesShadeOut === true ? 'OUT' : 'IN')],box:{type:'loose',borderColor:'#000',borderWidth:2,radius:10,color:'#CFF'}});
					obj._cursorPos.push({
						buttonType: 'inequalitiesShadeToggle',
						shape: 'rect',
						dims: [x,y,w,h*0.8],
						cursor: draw.cursors.pointer,
						func: draw.grid3.interactButtonClick,
						pathNum: pathNum,
						obj: obj,
						mode: 'inequalitiesShadeToggle'
					});
				}
			} else if (interact.functionListRect instanceof Array) {
				draw.grid3.drawGridPathList(ctx,obj,interact.functionListRect,pathNum);
			}
		}
		var interact = obj.interact || path.interact || path.isInput;
		if (!un(interact) && (interact._disabled === true || interact.disabled === true)) obj._cursorPos = [];
		
		if (obj._showColorPicker === true && !un(interact) && interact.colorPickerPos instanceof Array) {
			draw.gridColorPickerVisible = obj;
			var colors = ['none','#000','#666','#00F','#F00','#393','#909','#F90','#A0522D'];
			var width = 40;
			var cols = 3;
			var left = interact.colorPickerPos[0];
			var top = interact.colorPickerPos[1];
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
					func: draw.grid3.gridPaths.setGlobalColor,
					obj: obj,
					path: path,
					color: color
				});
			}
		}
	},
	drawGridPathList: function(ctx, obj, rect, pathNum) {
		var gridPaths = obj.path;
		var colorPicker = false;
		var fontSize = 28;
		var x = rect[0];
		var y = rect[1];
		var w = rect[2];
		h = 50;
		var interact = !un(obj.interact) ? obj.interact : !un(obj._path) && !un(obj._path.interact) ? !un(obj._path.interact) : {};
		if (interact.functionListShowPlaceholder !== false && (gridPaths.length === 0 || gridPaths[gridPaths.length-1].placeholder !== true)) {
			gridPaths.push({
				type:'function',
				text:[''],
				placeholder:true,
				color:typeof interact.color === 'string' ? interact.color : '#00F',
				lineWidth:3
			});
		}
		var itemHeights = [];
		
		for (var p = 0; p < gridPaths.length; p++) {
			var gridPath = gridPaths[p];
			var color = gridPath.color || '#00F';
			var itemHeight = h;
			var font = 'Arial';
			switch (gridPath.type) {
				case 'function':
				case 'function-linear':
				case 'inequality':
				case 'inequality-linear':
				case 'function-ellipse':
				case 'function-circle':
				case 'inequality-ellipse':
				case 'inequality-circle':
					if (un(gridPath.text)) {
						var value = gridPath.func.toString();
						value = value.slice(value.indexOf('return ') + 7);
						value = value.slice(0, value.indexOf(';'));
						gridPath.text = [value];
					}
					font = 'algebra';
					break;
				case 'inequality-3part':
					font = 'algebra';
					break;
				case 'point':
					gridPath.text = (w < 300) ? ['point'] : ['(' + gridPath.pos[0] + ', ' + gridPath.pos[1] + ')'];
					break;
				case 'line':
					gridPath.text = (w < 300) ? ['line'] : ['(' + gridPath.pos[0][0] + ', ' + gridPath.pos[0][1] + ')  to  (' + gridPath.pos[1][0] + ', ' + gridPath.pos[1][1] + ')'];
					break;
				case 'lineSegment':
					gridPath.text = (w < 300) ? ['line'] : ['(' + gridPath.pos[0][0] + ', ' + gridPath.pos[0][1] + ')  to  (' + gridPath.pos[1][0] + ', ' + gridPath.pos[1][1] + ')'];
					break;
				case 'fill':
					gridPath.text = ['fill area'];
					break;
				case 'var':
					gridPath.text = [String(roundToNearest(gridPath.v.value,0.01))];
					color = '#000';
					font = 'algebra';
					break;
			}			
			if (un(gridPath._textObj)) {
				gridPath._textObj = {
					type:'editableText',
					align: [-1, 0],
					font: 'algebra',
					algPadding:3,
					fracScale:1,
					fontSize: fontSize,
					text: gridPath.text,
					box: {
						type: 'none',
					},
					onInputEnd:['function','inequality','function-linear','inequality-linear','inequality-3part','function-ellipse','function-circle','inequality-ellipse','inequality-circle'].indexOf(gridPath.type) > -1 ? draw.grid3.gridPaths.functionTextInputEnd : draw.grid3.gridPaths.varTextInputEnd,
					deselectOnInputStart:false,
					deselectOnInputEnd:false,
					grid:obj,
					gridPath:gridPath,
					gridPathIndex:p,
					_drawCanvasPaths:true
				};
			}
			gridPath._textObj.font = font;
			gridPath._textObj.color = color === 'none' ? '#CCC' : color;
			gridPath._textObj.rect = [0,0,w-h-20,h];
			gridPath._textObj.ctx = ctx;
			gridPath._textObj.italic = w < 350;
			if (gridPath._textObj.textEdit !== true) gridPath._textObj.text = gridPath.text;
			if (!un(gridPath._textObj)) {
				gridPath._textObj.measureOnly = true;
				gridPath._textObj.ctx = draw.hiddenCanvas.ctx;
				var measure = text(gridPath._textObj);
				if (measure.tightRect[3] > gridPath._textObj.rect[3]) gridPath._textObj.rect[3] = measure.tightRect[3];
				delete gridPath._textObj.measureOnly;
				delete gridPath._textObj.ctx;
			}
			itemHeights[p] = gridPath._textObj.rect[3];
		}
		
		var itemsHeightTotal = 0;
		var maxStartItem = gridPaths.length-1;
		var startItem = 0;
		for (var p = gridPaths.length-1; p >= 0; p--) {
			if (itemsHeightTotal + itemHeights[p] > rect[3]) break;
			maxStartItem = p;
			itemsHeightTotal += itemHeights[p];
		}
		if (maxStartItem > 0) {
			if (un(obj._gridPathListScrollBar)) {
				obj._gridPathListScrollBar = {
					type:'verticalScrollBar',
					left:rect[0]+rect[2]-30,
					top:rect[1],
					height:rect[3],
					buttonHeight:30,
					backColor:'#EEE',
					buttonColor:'#DEDEDE',
					markerColor:'#AAA',
					borderColor:'#000',
					borderWidth:1
				};
			}
			if (obj._gridPathListScrollBar.scrollMax !== gridPaths.length) {
				obj._gridPathListScrollBar.scrollMax = gridPaths.length;
				obj._gridPathListScrollBar.scrollView = gridPaths.length-maxStartItem;
				obj._gridPathListScrollBar.value = maxStartItem;
			}
			draw.verticalScrollbar.draw(ctx,obj._gridPathListScrollBar);
			obj._cursorPos = obj._cursorPos.concat(obj._gridPathListScrollBar._cursorPositions);
			startItem = obj._gridPathListScrollBar.value;
			w -= 30;
		}
		
		itemsHeightTotal = 0;
		for (var p = startItem; p < gridPaths.length; p++) {
			var gridPath = gridPaths[p];
			itemsHeightTotal += itemHeights[p];
			if (itemsHeightTotal > rect[3] && textEdit.obj !== gridPath._textObj) break;
			/*if (gridPath.placeholder === true) {
				gridPath.color = typeof obj._path === 'object' && typeof obj._path.interact === 'object' ? obj._path.interact.color : '#00F';
				gridPath.lineWidth = typeof obj._path === 'object' && typeof obj._path.interact === 'object' ? obj._path.interact.lineWidth : 3;
			}*/
			var color = gridPath.color || '#00F';
			var lineWidth = gridPath.lineWidth || gridPath.radius || 2;
			var backColor = gridPath.valid === false ? '#FCC' : gridPath._selected === true ? '#F96' : gridPath.placeholder === true ? '#FFC' : '#FFF';
			
			var x2 = x;
			var itemHeight = itemHeights[p];

			var color2 = color === 'none' ? '#CCC' : color;
			var type = gridPath.type === 'point' && gridPath.style === 'circle' ? 'pointCircle' : gridPath.type === 'line' && gridPath.dash instanceof Array ? 'lineDash' : gridPath.type;
			draw.grid3.drawInteractButton(ctx, obj, type, x2, y, h, itemHeight, color2, backColor, gridPath);

			if (gridPath.placeholder !== true && gridPath.type !== 'var') {
				obj._cursorPos.push({
					buttonType: '',
					shape: 'rect',
					dims: [x2, y, h, itemHeight],
					cursor: draw.cursors.pointer,
					func: draw.grid3.gridPaths.changeColor,
					obj: obj,
					gridPath: gridPath
				});
			}
			if (gridPath._colorPicker === true && colorPicker === false) {
				colorPicker = {
					index:p,
					top:y+itemHeight,
					center:x2+h/2,
					type:gridPath.type,
					color:color2,
					grid:obj,
					gridPath:gridPath
				};
			}
			
			x2 += h;

			ctx.fillStyle = backColor;
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			ctx.fillRect(x2,y,w-h,itemHeight);
			ctx.strokeRect(x2,y,w-h,itemHeight);
			
			gridPath._textObj.rect = gridPath.type === 'var' ? [x2+10,y,50,itemHeight] : [x2+10,y,w-h-20,itemHeight];
			gridPath._textObj.ctx = ctx;

			if (['function','inequality','function-linear','inequality-linear','inequality-3part','function-ellipse','function-circle','inequality-ellipse','inequality-circle'].indexOf(gridPath.type) > -1 || gridPath.type === 'var') {
				draw.editableText.draw(ctx,gridPath._textObj);
				obj._cursorPos.push({
					shape: 'rect',
					dims: clone(gridPath._textObj.rect),
					cursor: draw.cursors.text,
					func: textEdit.selectStart,
					obj: gridPath._textObj,
					pathNum:pathNum,
					highlight: -1					
				});
				if (gridPath.type === 'function' && gridPath._textObj.text.length === 1 && gridPath._textObj.text[0] === '') {
					text({
						ctx:ctx,
						align: [-1, 0],
						rect: gridPath._textObj.rect,
						font: 'algebra',
						algPadding:3,
						fontSize: fontSize,
						color: draw.grid3.getLightColor(color),
						text: ['y=ax',['pow',false,['2']]]
					})
				}
			} else {
				text(gridPath._textObj);
				obj._cursorPos.push({
					buttonType: '',
					shape: 'rect',
					dims: clone(gridPath._textObj.rect),
					cursor:'default',
					func:function() {},
					obj: obj,
					gridPath: gridPath
				});
			}

			if (gridPath.type === 'var') {
				if (un(gridPath._slider)) {
					gridPath._slider = {
						type: 'slider',
						lineWidth: 3,
						color: '#666',
						fillColor: '#000',
						grid:obj,
						gridPath:gridPath,
						interact: {
							onchange: function (obj) {
								var v = obj.gridPath.v;
								var value = v.min + obj.value * (v.max-v.min);
								if (Math.abs(value) % 1 < 0.08 || Math.abs(value) % 1 > 0.92) { // close to integer
									v.value = roundToNearest(value,1);
								} else {
									v.value = roundToNearest(value,0.1);
								}
							}
						},
						control:{
							pos:[],
							box:false,
							endless:true,
							rate:0.15
						}
					}
				}
				gridPath._slider.left = x2+65+40;
				gridPath._slider.top = y+h/2-12;
				gridPath._slider.width = w-70-40-h;
				gridPath._slider.radius = 12;
				gridPath._slider.value = (gridPath.v.value - gridPath.v.min) / (gridPath.v.max - gridPath.v.min);
				gridPath._slider.control.pos = [gridPath._slider.left-20,y+h/2,30,30];
				var xv = gridPath._slider.left + gridPath._slider.radius + gridPath._slider.value * (gridPath._slider.width - 2*gridPath._slider.radius);
				draw.slider.draw(ctx,gridPath._slider,{});
				obj._cursorPos.push({
					shape: 'circle',
					dims: [xv,y+h/2,h/2],
					cursor: draw.cursors.move1,
					func:draw.slider.dragStart,
					interact:true,
					obj: gridPath._slider,
					pathNum:pathNum,
					highlight: -1					
				});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x2+60,y,40,h],
					cursor: draw.cursors.pointer,
					func:draw.slider.controlClick,
					interact:true,
					obj: gridPath._slider,
					pathNum:pathNum,
					highlight: -1					
				});
			} else {
				if (gridPath.placeholder !== true) {
					x2 += w-h-30;
					drawCross(ctx, 20, 20, '#F00', x2 + 5, y + (itemHeight-20)/2, 2);
					obj._cursorPos.push({
						buttonType: '',
						shape: 'rect',
						dims: [x2, y, 30, itemHeight],
						cursor: draw.cursors.pointer,
						func: draw.grid3.gridPaths.deletePath,
						obj: obj,
						gridPathIndex: p
					});
				}
			}
			y += itemHeight;
		}
		if (maxStartItem > 0 && y < rect[1]+rect[3]) {
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(rect[0],y);
			ctx.lineTo(rect[0],rect[1]+rect[3]);
			ctx.lineTo(rect[0]+rect[2]-30,rect[1]+rect[3]);
			ctx.moveTo(rect[0]+h,y);
			ctx.lineTo(rect[0]+h,rect[1]+rect[3]);
			ctx.stroke();
		}
		
		if (colorPicker !== false) {
			var gridPath = colorPicker.gridPath;
			draw.gridPathColorPickerVisible = gridPath;
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
					buttonType: 'grid-pathColorPicker',
					shape: 'rect',
					dims: [x,y,width,width],
					cursor: draw.cursors.pointer,
					func: draw.grid3.gridPaths.setColor,
					obj: obj,
					gridPathIndex: colorPicker.index,
					color:color
				});
			}
			if (colorPicker.type === 'point') {
				y += width;
				var x = colorPicker.center-width;
				draw.grid3.drawInteractButton(ctx, obj, 'point', x, y, width, width, colorPicker.color, gridPath.style === 'cross' ? '#66F' : '#FFF');
				obj._cursorPos.push({
					buttonType: 'grid-pathColorPicker',
					shape: 'rect',
					dims: [x,y,width,width],
					cursor: draw.cursors.pointer,
					func: draw.grid3.gridPaths.setPointStyle,
					obj: obj,
					gridPathIndex: colorPicker.index,
					style:'cross'
				});
				
				x += width;
				
				draw.grid3.drawInteractButton(ctx, obj, 'pointCircle', x, y, width, width, colorPicker.color, gridPath.style === 'circle' ? '#66F' : '#FFF');
				obj._cursorPos.push({
					buttonType: 'grid-pathColorPicker',
					shape: 'rect',
					dims: [x,y,width,width],
					cursor: draw.cursors.pointer,
					func: draw.grid3.gridPaths.setPointStyle,
					obj: obj,
					gridPathIndex: colorPicker.index,
					style:'circle'
				});
			}
		}
	},
	getLightColor:function(color) {
		var lightColor = {'none':'#999','#000':'#888','#666':'#CCC','#00F':'#99F','#F00':'#F99','#393':'#7B7','#060':'#7B7','#909':'#F9F','#F90':'#FA7','#A0522D':'#F96'}[color];
		return typeof lightColor !== 'string' ? '#999' : lightColor;
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
	
	gridPaths: {
		varTextInputEnd: function(textObj) {
			var grid = textObj.grid;
			var path = grid._path;
			delete path._interacting;
			var gridPath = textObj.gridPath;
			var v = gridPath.v;
			//var index = textObj.gridPathIndex;
			//var v = grid.path[index].v;
			var value = Number(textObj.text[0]); // improve - accept fractions etc?
			if (textObj.text.length === 1 && textObj.text[0] !== '' && !isNaN(value)) v.value = value;
			textObj.text = [String(roundToNearest(v.value))];
		},
		functionTextInputEnd: function(textObj) {
			var grid = textObj.grid;
			var path = grid._path;
			delete path._interacting;
			var gridPath = textObj.gridPath;
			if (un(gridPath)) return;
			delete gridPath.valid;
			delete gridPath._pos;
			delete gridPath._pos1;
			delete gridPath._pos2;
			delete gridPath._gridPos;
			delete gridPath._canvasPos;
			delete gridPath._canvasCenter;
			delete gridPath._canvasRadius;
			delete gridPath._funcPos;
			delete gridPath.placeholder;
			if (textObj.text.length === 1 && typeof textObj.text[0] === 'string' && textObj.text[0].trim() === '') {
				var index = grid.path.indexOf(gridPath);
				if (index > -1) grid.path.splice(index,1);
			} else {
				var gridPath2 = draw.grid3.getGridPathFromText(clone(textObj.text));
				delete gridPath.inequality;
				delete gridPath._canvasLinePaths;
				delete gridPath._canvasFillPaths;
				for (var key in gridPath2) {
					gridPath[key] = gridPath2[key];
				}
				//if (gridPath.type === 'inequality-linear' || gridPath.type === 'inequality' || gridPath.type === 'inequality2' || gridPath.type === 'inequality-3part' || gridPath.type === 'inequality-ellipse' || gridPath.type === 'inequality-circle') {
				if (gridPath.type === 'function' && typeof gridPath.inequality === 'string' && gridPath.inequality !== '') {
					gridPath.fillColor = colorA(draw.grid3.getLightColor(gridPath.color),0.5);
				}
				if (gridPath.valid !== false) {
					for (var i = 0; i < gridPath._vars.length; i++) {
						var v = gridPath._vars[i];
						if (un(grid.vars)) grid.vars = {};
						if (un(grid.vars[v.letter])) {
							grid.vars[v.letter] = {letter:v.letter,value:1,min:-10,max:10};
							grid.path.push({
								type:'var',
								v:grid.vars[v.letter]
							});
						}
					}
				}
			}
			draw.grid3.gridPaths.removeUnusedVars(grid);
		},
		addFunction: function () {
			var path = draw.path[draw.currCursor.pathNum];
			var obj = path.obj[0];
			if (un(obj.path)) obj.path = [];
			
			var interact = obj.interact || path.isInput || path.interact;
			var lineWidth = (!un(interact) && !un(interact.lineWidth)) ? interact.lineWidth : 5;
			/*if (mode == 'interact' && !un(interact)) {
				if (typeof interact.max === 'object') {
					if (typeof interact.max['functions'] === 'number' && interact.max['functions'] > 0) {
						var pathCount = 0;
						for (var p = 0; p < obj.path.length; p++) {
							var path2 = obj.path[p];
							if ((path2.type !== 'function' && path2.type !== 'function2') || path2._deletable !== true) continue;
							pathCount++;
						}
						if (pathCount === interact.max['functions']) {
							for (var p = obj.path.length - 1; p >= 0; p--) {
								var path2 = obj.path[p];
								if ((path2.type !== 'function' && path2.type !== 'function2') || path2._deletable !== true) continue;
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
			}*/
			
			var gridPath = {
				type: 'function',
				text: [''],
				color: typeof interact.color === 'string' ? interact.color : '#00F',
				lineWidth: lineWidth
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
			for (var p = 0; p < obj.path.length; p++) {
				var gridPath2 = obj.path[p];
				if (gridPath2 !== gridPath) delete gridPath2._colorPicker;
			}
			gridPath._colorPicker = !gridPath._colorPicker;
			drawCanvasPaths();
		},
		setGlobalColor: function() {
			var path = draw.currCursor.path;
			var obj = draw.currCursor.obj;
			var interact = obj.interact || path.interact;
			interact.color = draw.currCursor.color;
			obj._showColorPicker = false;
			obj._interactCursor = draw.grid3.getInteractCursor(path, obj);
			var gridPaths = obj.path || [];
			if (gridPaths.length > 0 && gridPaths[gridPaths.length-1].placeholder === true) {
				gridPaths[gridPaths.length-1].color = interact.color;
			}
			drawCanvasPaths();
		},
		setColor: function() {
			var obj = draw.currCursor.obj;
			var gridPath = obj.path[draw.currCursor.gridPathIndex];
			var color = draw.currCursor.color;
			gridPath.color = color;
			if (gridPath.type === 'inequality' || gridPath.type === 'inequality2' || gridPath.type === 'inequality-linear' || gridPath.type === 'inequality-3part'|| gridPath.type === 'inequality-ellipse' || gridPath.type === 'inequality-circle' || gridPath.type === 'fill') {
				gridPath.fillColor = colorA(draw.grid3.getLightColor(gridPath.color),0.5);
			}
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
			draw.grid3.gridPaths.removeUnusedVars(obj);
			drawCanvasPaths();
		},
		removeUnusedVars: function(obj) {
			var used = [];
			for (var p = 0; p < obj.path.length; p++) {
				var path = obj.path[p];
				if (path._vars instanceof Array === false) continue;
				for (var i = 0; i < path._vars.length; i++) {
					var v = path._vars[i].letter;
					if (used.indexOf(v) === -1) used.push(v);
				}
			}
			for (var v in obj.vars) {
				if (used.indexOf(v) === -1) {
					delete obj.vars[v];
				}
			}
			for (var p = 0; p < obj.path.length; p++) {
				var path = obj.path[p];
				if (path.type === 'var' && used.indexOf(path.v.letter) === -1) {
					obj.path.splice(p,1);
					p--;
				}
			}
		},
		setPointStyle: function() {
			var obj = draw.currCursor.obj;
			var gridPath = obj.path[draw.currCursor.gridPathIndex];
			var style = draw.currCursor.style;
			gridPath.style = style;
			drawCanvasPaths();
		},
		setLineShowPoints: function() {
			var gridPath = draw.currCursor.gridPath;
			gridPath.showLinePoints = draw.currCursor.value;
			gridPath.linePointsStyle = 'circle';
			drawCanvasPaths();
		}
	},
	
	zoomGrid: function(factor) {
		if (typeof factor !== 'number') return;
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		if (obj.xMin === 0 && obj.yMin === 0) {
			obj.xMax = obj.xMax*factor;
			obj.yMax = obj.yMax*factor;
			draw.grid3.autoSetScales(obj);
			obj.xMax = roundToNearest(obj.xMax,obj.xMinorStep);
			obj.yMax = roundToNearest(obj.yMax,obj.yMinorStep);
		} else {
			var xMid = (obj.xMax+obj.xMin)/2;
			var yMid = (obj.yMax+obj.yMin)/2;
			var xDiff = (obj.xMax-obj.xMin)/2;
			var yDiff = (obj.yMax-obj.yMin)/2;
			obj.xMax = xMid+factor*xDiff;
			obj.yMax = yMid+factor*yDiff;
			if (Math.abs(xMid) < 0.001 && Math.abs(yMid) < 0.001) {
				obj.xMin = -1*obj.xMax;
				obj.yMin = -1*obj.yMax;
				obj.xMax = roundToNearest(obj.xMax,obj.xMinorStep);
				obj.yMax = roundToNearest(obj.yMax,obj.xMinorStep);
				obj.xMin = roundToNearest(obj.xMin,obj.yMinorStep);
				obj.yMin = roundToNearest(obj.yMin,obj.yMinorStep);
			} else {
				obj.xMin = xMid-factor*xDiff;
				obj.yMin = yMid-factor*yDiff;
			}
			draw.grid3.autoSetScales(obj);
		}				
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
			} else if (xMag2 < 0.65) {
				obj.xMinorStep = Math.pow(10,xMag1-1);
				obj.xMajorStep = Math.pow(10,xMag1)/2;		
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
		} else if (yMag2 < 0.65) {
			obj.yMinorStep = Math.pow(10,yMag1-1);
			obj.yMajorStep = Math.pow(10,yMag1)/2;		
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
		draw.animate(draw.grid3.gridPathMove,draw.grid3.gridPathStop,drawCanvasPaths);
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
		draw.animate(draw.grid3.moveMove,draw.grid3.moveStop,drawCanvasPaths);
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
		draw.animate(draw.grid3.controlsMoveMove,draw.grid3.controlsMoveStop,drawCanvasPaths);
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
		if (!un(obj._interactMode) && obj._interactMode !== 'none' && !un(draw.grid3.interact[obj._interactMode])) {
			pos.push({
				shape: 'rect',
				dims: [obj.left - 10, obj.top - 10, obj.width + 20, obj.height + 20],
				cursor: obj._interactCursor,
				func: draw.grid3.interact[obj._interactMode],
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
					var buttons = interact.buttons || draw.grid3.interactDefaultButtons;
					for (var b = 0; b < buttons.length; b++) {
						var button = buttons[b];
						pos.push({
							buttonType: 'grid-' + button,
							shape: 'rect',
							dims: [x2, y1 + 40 * b, 40, 40],
							cursor: draw.cursors.pointer,
							func: draw.grid3.interactButtonClick,
							pathNum: pathNum,
							obj: obj,
							mode: button
						});
					}
				}
			}

			if (un(obj._interactMode)) obj._interactMode = interact.startMode || interact.mode2 || 'none';
			if (obj._interactMode !== 'none') {
				if (un(obj._interactCursor)) obj._interactCursor = draw.grid3.getInteractCursor(path, obj);
				var func = obj._interactMode == 'move' ? draw.grid3.moveStart : obj._interactMode == 'zoomDrag' ? draw.grid3.interact.zoomDragStart : draw.grid3.interact[obj._interactMode];
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
							func: draw.grid3.interact.pointMoveStart,
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
								func: draw.grid3.interact.pointMoveStart,
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
	drawInteractButton: function (ctx, obj, type, l, t, w, h, color, backColor, gridPath) {
		var color = !un(color) ? color : '#000';
		if (backColor instanceof Array) {
			var backColorUnselected = backColor[0];
			var backColorSelected = backColor[1];
		} else if (typeof backColor === 'string') {
			var backColorUnselected = backColor;
			var backColorSelected = backColor;
		} else {
			var backColorUnselected = '#CCF';
			var backColorSelected = '#66F';
		}
		if (un(obj._interactMode)) {
			var interact = obj.interact;
			if (!un(interact) && interact._disabled !== true && interact.disabled !== true) {
				obj._interactMode = interact.startMode || interact.mode2 || 'none';
			}
		}
		ctx.save();
		switch (type) {
			case 'colorPicker':
				ctx.fillStyle = obj._showColorPicker === true ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				var colors = ['none','#000','#666','#00F','#F00','#393','#909','#F90','#A0522D'];
				var w2 = w*0.22;
				var l2 = l + w*0.17;
				var t2 = t + w*0.17;
				for (var c = 0; c < colors.length; c++) {
					var col = c%3;
					var row = Math.floor(c/3);
					var x = l2+col*w2;
					var y = t2+row*w2;
					var color = colors[c];
					var color2 = color === 'none' ? '#FFF' : color;
					text({
						ctx:ctx,
						rect:[x,y,w2,w2],
						text:[""],
						box:{
							type:'loose',
							color:color2,
							borderWidth:1,
							borderColor:'#000'
						}
					});
				}
				break;
			case 'grid-plot':
			case 'grid-point':
			case 'plot':
			case 'point':
				ctx.fillStyle = typeof backColor === 'string' ? backColor : obj._interactMode === 'plot' ? backColorSelected : backColorUnselected;
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
				ctx.arc(l + 0.5 * w, t + 0.5 * h, 0.13*w, 0, 2*Math.PI);
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
			case 'lineDash':
				ctx.fillStyle = obj._interactMode === type ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				ctx.lineWidth = 2;
				if (type === 'lineDash') ctx.setLineDash([10,10]);
				ctx.strokeStyle = color;
				ctx.beginPath();
				ctx.moveTo(l, t + 0.3 * h);
				ctx.lineTo(l + w, t + 0.7 * h);
				ctx.stroke();
				if (type === 'lineDash') ctx.setLineDash([]);
				break;
			case 'lineSegmentWithPoints':
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
				ctx.beginPath();
				ctx.fillStyle = color;
				ctx.arc(l + 0.3 * w, t + 0.4 * h, 0.1 * w, 0, 2*Math.PI);
				ctx.arc(l + 0.7 * w, t + 0.6 * h, 0.1 * w, 0, 2*Math.PI);
				ctx.fill();
				break;
			case 'lineWithPoints':
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
				ctx.beginPath();
				ctx.fillStyle = color;
				ctx.arc(l + 0.3 * w, t + 0.4 * h, 0.1 * w, 0, 2*Math.PI);
				ctx.arc(l + 0.7 * w, t + 0.6 * h, 0.1 * w, 0, 2*Math.PI);
				ctx.fill();
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
					color: '#000',
					fontSize:w*0.4,
					text: ['CLR'],
					rect:[l,t,w,h],
					align: [0, 0]
				});
				break;
			case 'grid-function':
			case 'grid-function2':
			case 'function':
			case 'function2':
			case 'inequality':
			case 'inequality2':
			case 'function-linear':
			case 'inequality-linear':
			case 'inequality-3part':
			case 'function-circle':
			case 'function-ellipse':
			case 'inequality-circle':
			case 'inequality-ellipse':
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.strokeRect(l, t, w, h);
				/*ctx.beginPath();
				ctx.strokeStyle = color;
				ctx.lineWidth = 2;
				ctx.moveTo(l + 0.1 * w, t + 1 * h);
				ctx.bezierCurveTo(l + 0.3 * w, t - 0.5 * h, l + 0.7 * w, t + 1.5 * h, l + 0.9 * w, t + 0 * h);
				ctx.stroke();*/
				text({
					ctx: ctx,
					color: color,
					font: 'algebra',
					fontSize: w * 0.47,
					textArray: ['f(x)'],
					left: l,
					top: t,
					width: w,
					height: h,
					align: [0, 0]
				});
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
				//ctx.strokeStyle = color;
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
				if (un(draw.grid3.handImage)) {
					draw.grid3.handImage = new Image;
					draw.grid3.handImage.onload = function() {
						drawCanvasPaths();
					};
					draw.grid3.handImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADCElEQVRYR+2WT0iacRjHvw3qBTMmMj0M8a0uC3FMSkKa8dJ7aYaSUMRYULguscTsZvCOOgzcybcJxS4yL0EwwT+7jYgOHXSXvYY4grfloYPUNshDDAI3fpLxrqz3tUaD4XOR1/f5/X4fv8/3efw1QVkwABIANACiADzKlslnNdVIeQ7gIYAfACIAeq1W6/jY2JirubmZEkUxv7y8/FGyTjzN+yl/3MUMKcBdAGabzfaaoih7uVwu7u3tcfv7+08YhhlNJBLQaDSIRqOYnp6G2WyGWq3GycmJIAgCd3x8nAbwvV4IKUBF5ng8rnG73SgUCiCf2WwWDMNACrC4uFh5tlgs2NzcrOQdHR25AST/NUAJwFMAQQAFJTBSBR4A8HEc5xwcHDR2dXUhHA4jFotBr9crUSDc19enam9vd2cymfDu7m4MwBc5iFomjE9OTrpJrUn4/X4IgiAL0NLSgomJCXi93mrp/ADe3BrAwsICRkZGUC6XrwVADERMSOKAYRgzy7LPpqamIIoiDg8P4XK5QFEU8vk80ul05Vmn052ZkCh2zryKFWCsVqu3tbV1lJxeLBa5nZ0dNU3TgarTr5KRlIfjOAQCAdjtdmn3KAb4xfN8pdYkyK9IJpOgafqs1eTqKH0vad/rAWQyGayuriKVStUNsLGxAZ7nD3K5XLBQKKQAfJWDJ13wbmZmptfpdJpYlgVx89bWVuVwn88Ho9Eot8fZe+IDj8dD+p94KqtkYbUNX/b3979YWVnRd3Z23lGpVErWXsi5CcB9g8Hg0Gq1/NLSUtvAwMCtA5AD//gvqJcgEolgfX3909ra2lsAHwB8U7KHdBI+AvAqFArZHA7HPTKK64nT7qn7riA7ipVC/E2A3p6envHu7m7f/Pw8Ojo6rmTI5XIIBoMgrbe9vf0ewGel0CSvlgLk+8cGg8E/OzvLDg0NaU0m06V7/s37wPlDaHJB4XneUp2StSj+a4A2AK5QKKSbm5u7sgTDw8MolUqk9WRH7/mNLvNAPT66UW4DoKFAQ4GGAr8B6HWSMOjcjREAAAAASUVORK5CYII=";
				} else {
					var w2 = draw.grid3.handImage.naturalWidth;
					var h2 = draw.grid3.handImage.naturalHeight;
					ctx.drawImage(draw.grid3.handImage,l+13,t+13,w2,h2);
				}
				break;
			case 'zoomDrag':
				ctx.fillStyle = obj._interactMode == 'zoomDrag' ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				drawArrow({ctx:ctx,startX:l+w*15/50,startY:t+h*35/50,finX:l+w*35/50,finY:t+h*15/50,doubleEnded:true,arrowLength:w*8/50,angleBetweenLinesRads:0.8,fillArrow:true,lineWidth:w*2/50});
				break;
			case 'viewMenu':
				ctx.save();
				ctx.fillStyle = obj._interactViewMenu === true ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				text({ctx:ctx,align:[0,0],text:['...'],rect:[l,t,w,h],fontSize:32,bold:true});
				ctx.restore();
				break;
			case '1:1':
				ctx.save();
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				text({ctx:ctx,align:[0,0],text:['1:1'],rect:[l,t,w,h],fontSize:26});
				ctx.restore();
				break;
			case 'pdf':
				ctx.save();
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				draw.polygon.draw(ctx,{type:'polygon',points:[[l+w*0.23,t+h*0.15],[l+w*0.6,t+h*0.15],[l+w*0.77,t+h*0.32],[l+w*0.77,t+h*0.85],[l+w*0.23,t+h*0.85]],color:'#F00',fillColor:'#FFF',thickness:1.5},{});
				text({ctx:ctx,align:[0,0],text:['PDF'],color:'#F00',rect:[l,t+0.05*h,w,h],fontSize:11,bold:true});
				ctx.restore();
				break;
			case 'gridToggle':
				ctx.save();
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				ctx.strokeStyle = '#333';
				ctx.beginPath();
				ctx.moveTo(l+w*1/5,t+w*1/5);
				ctx.lineTo(l+w*4/5,t+w*1/5);
				ctx.moveTo(l+w*1/5,t+w*2/5);
				ctx.lineTo(l+w*4/5,t+w*2/5);
				ctx.moveTo(l+w*1/5,t+w*3/5);
				ctx.lineTo(l+w*4/5,t+w*3/5);
				ctx.moveTo(l+w*1/5,t+w*4/5);
				ctx.lineTo(l+w*4/5,t+w*4/5);	
				ctx.moveTo(l+w*1/5,t+w*1/5);
				ctx.lineTo(l+w*1/5,t+w*4/5);
				ctx.moveTo(l+w*2/5,t+w*1/5);
				ctx.lineTo(l+w*2/5,t+w*4/5);
				ctx.moveTo(l+w*3/5,t+w*1/5);
				ctx.lineTo(l+w*3/5,t+w*4/5);
				ctx.moveTo(l+w*4/5,t+w*1/5);
				ctx.lineTo(l+w*4/5,t+w*4/5);	
				ctx.stroke();
				ctx.restore();
				break;
			case 'axesToggle':
				ctx.save();
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				drawArrow({ctx:ctx,startX:l+w*1/6,startY:t+h*0.5,finX:l+w*5/6,finY:t+h*0.5,arrowLength:w*5/50,angleBetweenLinesRads:0.6,fillArrow:true,lineWidth:w*1.5/50});
				drawArrow({ctx:ctx,startX:l+w*0.5,startY:t+h*5/6,finX:l+w*0.5,finY:t+h*1/6,arrowLength:w*5/50,angleBetweenLinesRads:0.6,fillArrow:true,lineWidth:w*1.5/50});
				break;
			case 'scalesToggle':
				ctx.save();
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				text({ctx:ctx,align:[0,0],text:['123'],rect:[l,t,w,h],fontSize:20});
				break;
			case 'var':
				ctx.save();
				ctx.fillStyle = backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				if (!un(gridPath)) {
					text({ctx:ctx,align:[0,0],text:[gridPath.v.letter],rect:[l,t,w,h],font:'algebra',fontSize:28});
				}
				break;
			case 'fill':
				ctx.save();
				ctx.fillStyle = obj._interactMode === 'fill' ? backColorSelected : backColorUnselected;
				ctx.fillRect(l, t, w, h);
				ctx.strokeStyle = '#000';
				ctx.lineWidth = 1;
				ctx.strokeRect(l, t, w, h);
				
				ctx.translate(l, t);
			
				ctx.translate(w*26/55 + 2.5, h*25/55 + 2.5);
				ctx.rotate(-0.25 * Math.PI);
				ctx.scale(60/w,60/w);

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

				ctx.scale(w/60,w/60);
				ctx.rotate(0.25 * Math.PI);
				ctx.translate(-w*26/55 + 2.5, -h*25/55 + 2.5);

				ctx.translate(-l, -t);
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
			func: draw.grid3.toggleControls,
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
			func: draw.grid3.setOneToOne,
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
			path.interact.buttons = clone(draw.grid3.interactDefaultButtons);
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
		if (mode === 'colorPicker') {
			if (un(obj._showColorPicker)) obj._showColorPicker = false;
			obj._showColorPicker = !obj._showColorPicker;
			drawCanvasPaths();
			return;
		}
		if (mode === 'undo') {
			draw.grid3.undo();
			return;
		}
		if (mode === 'clear') {
			draw.grid3.clear();
			return;
		}
		if (mode === 'function') {
			obj._interactMode = 'none';
			obj._interactViewMenu = false;
			draw.grid3.gridPaths.addFunction();
			return;
		}
		if (mode === 'zoomIn') {
			draw.grid3.zoomGrid(draw.currCursor.factor);
			return;
		}
		if (mode === 'zoomOut') {
			draw.grid3.zoomGrid(draw.currCursor.factor);
			return;
		}
		if (mode === 'gridToggle') {
			if (un(obj.showGrid)) obj.showGrid = true;
			obj.showGrid = !obj.showGrid;
			drawCanvasPaths();
			return;
		}
		if (mode === 'axesToggle') {
			if (un(obj.showAxes)) obj.showAxes = true;
			obj.showAxes = !obj.showAxes;
			drawCanvasPaths();
			return;
		}
		if (mode === 'scalesToggle') {
			if (un(obj.showScales)) obj.showScales = true;
			obj.showScales = !obj.showScales;
			//obj.showLabels = obj.showScales;
			drawCanvasPaths();
			return;
		}
		if (mode === '1:1') {
			var ysf = (obj.height * (obj.xMax - obj.xMin)) / (obj.width * (obj.yMax - obj.yMin));
			obj.yMin *= ysf;
			obj.yMax *= ysf;
			draw.grid3.autoSetScales(obj);
			drawCanvasPaths();
			return;
		}
		if (mode === 'inequalitiesShadeToggle') {
			if (un(obj.inequalitiesShadeOut)) obj.inequalitiesShadeOut = false;
			obj.inequalitiesShadeOut = !obj.inequalitiesShadeOut;
			obj._recalc = true;
			drawCanvasPaths();
			return;
		}
		if (mode === 'viewMenu') {
			obj._interactViewMenu = !obj._interactViewMenu;
			obj._interactMode = 'none';
			updateBorder(path);
			drawCanvasPaths();
			return;
		}
		if (mode === 'pdf') {
			canvasPdf.getResourcePDF(file.resources[resourceIndex], function(ctx) {
				var grid = draw.clone(obj);
				var pw = 612, ph = 792;
				var cw = 1200, ch = 1700;
				var margin = 30 * (pw / 612);
				var scale = Math.min((pw - 2 * margin) / cw, (ph - 2 * margin) / ch);
				var offset = [(pw - cw * scale) / (2 * scale), (ph - ch * scale) / (2 * scale)];
				ctx.clearRect(0, 0, 3000, 3000);
				ctx.scale(scale, scale);
				ctx.translate(offset[0], offset[1]);
				grid.width = 500;
				grid.height = 500;
				for (var r = 0; r < 3; r++) {
					grid.top = 50 + 600 * r;
					for (var c = 0; c < 2; c++) {
						grid.left = 650 * c;
						drawObjToCtx(ctx, {}, grid);
					}
				}
			}, 'download');
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
		obj._interactCursor = draw.grid3.getInteractCursor(path, obj);
		updateBorder(path);
		drawCanvasPaths();
	},
	getInteractCursor: function (path, obj) {
		if (obj._interactMode == 'line' || obj._interactMode == 'lineSegment' || obj._interactMode == 'lineDash') {
			var color = (!un(path.interact) && !un(path.interact.color)) ? path.interact.color : !un(obj._interactColor) ? obj._interactColor : (!un(obj.interact) && !un(obj.interact.color)) ? obj.interact.color : '#00F';
			return draw.grid3.getCrossCursor(color);
		} else if (obj._interactMode == 'zoomDrag') {
			return 'ne-resize';
		} else if (obj._interactMode == 'move') {
			return draw.cursors.move1;
		} else if (obj._interactMode == 'moving') {
			return draw.cursors.move2;
		} else if (obj._interactMode == 'fill') {
			var color = (!un(path.interact) && !un(path.interact.color)) ? path.interact.color : !un(obj._interactColor) ? obj._interactColor : (!un(obj.interact) && !un(obj.interact.color)) ? obj.interact.color : '#00F';
			draw.hiddenCanvas.ctx.clear();
			var cursor = makeFillCursor(draw.hiddenCanvas,color);
			return  'url("'+cursor[0]+'") '+cursor[1]+' '+cursor[2]+', auto';
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
			if ((draw.mode == 'interact' && obj.path[p]._deletable !== true) || obj.path[p].placeholder === true) continue;
			obj.path.splice(p, 1);
			drawCanvasPaths();
			return;
		}
		if (!un(obj.interact) && typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
	},
	clear: function () {
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		if (un(obj.path) || obj.path.length == 0) return;
		for (var p = obj.path.length - 1; p >= 0; p--) {
			if ((draw.mode == 'interact' && obj.path[p]._deletable !== true) || obj.path[p].placeholder === true) continue;
			obj.path.splice(p, 1);
		}
		if (!un(obj.interact) && typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
		drawCanvasPaths();
	},
	interact: {
		point: function () {
			draw.grid3.interact.plot();
		},
		pointCircle: function () {
			draw.grid3.interact.plot();
		},
		plot: function () {
			var obj = draw.currCursor.obj;
			var path = obj._path;
			var mode = draw.mode;
			if (!un(path.isInput) && path.isInput._mode === 'addAnswers') mode = 'interact';
			if (un(obj.path)) obj.path = [];
			var pos = draw.grid3.getCoordAtPos(obj);
			pos[0] = roundToNearest(pos[0], obj.xMinorStep);
			pos[1] = roundToNearest(pos[1], obj.yMinorStep);
			for (var p = 0; p < obj.path.length; p++) {
				var path2 = obj.path[p];
				if (mode == 'interact' && path2._deletable !== true) continue;
				if (path2.type !== 'point') continue;
				if (path2.pos[0] == pos[0] && path2.pos[1] == pos[1]) {
					obj.path.splice(p, 1);
					if (!un(obj.interact) && typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
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
		lineDash: function () {
			draw.grid3.interact.line('dash');
		},
		line: function (type2) {
			if (draw.grid3.interact._drawingLine === true) return;
			if (un(type2)) type2 = 'line';
			var obj = draw.currCursor.obj;
			var path = obj._path;
			var mode = draw.mode;
			if (!un(path.isInput) && path.isInput._mode === 'addAnswers') mode = 'interact';
			if (un(obj.path)) obj.path = [];
			var pos = draw.grid3.getCoordAtPos(obj);
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
			var deletable = mode == 'interact' ? true : false;
			var showLinePoints = (!un(interact) && !un(interact.showLinePoints)) ? interact.showLinePoints : false;
			var lineWidth = (!un(interact) && !un(interact.lineWidth)) ? interact.lineWidth : 5;
			var color = !un(obj._interactColor) ? obj._interactColor : (!un(interact) && !un(interact.color)) ? interact.color : '#00F';
			var gridPath = {
				type: type2 === 'vector' ? 'lineSegment' : type2 === 'dash' ? 'line' : type2,
				pos: [pos, pos],
				color: color,
				lineWidth: lineWidth,
				showLinePoints: showLinePoints,
				_deletable: deletable
			};
			if (type2 === 'dash') {
				gridPath.dash = [15,15];
			}
			if (type2 === 'vector') {
				gridPath.endMid = 'open';
				gridPath.endMidSize = 15;
			}
			if (obj.path.length > 0 && obj.path[obj.path.length-1].placeholder === true) {
				index = obj.path.length-1;
				obj.path.splice(index,0,gridPath);
			} else {
				index = obj.path.length;
				obj.path.push(gridPath);
			}
			draw.grid3.interact._obj = obj;
			draw.grid3.interact._index = index;
			draw.grid3.interact._drawingLine = true;
			draw.animate(draw.grid3.interact.lineMove,draw.grid3.interact.lineStop,drawCanvasPaths);
			if (typeof obj.interact === 'object' && typeof obj.interact.onchange === 'function') {
				obj.interact.onchange(obj); 
				drawCanvasPaths();
			}
		},
		vector: function () {
			draw.grid3.interact.line('vector');
		},
		lineSegment: function () {
			draw.grid3.interact.line('lineSegment');
		},

		lineMove: function (e) {
			updateMouse(e);
			var obj = draw.grid3.interact._obj;
			var index = draw.grid3.interact._index;
			
			if (typeof obj !== 'object') return;
			var pos = draw.grid3.getCoordAtPos(obj);
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
			if (typeof obj.interact === 'object' && typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
			//drawCanvasPaths();
		},
		lineStop: function (e) {
			draw.grid3.interact._drawingLine = false;
			updateMouse(e);
			var obj = draw.grid3.interact._obj;
			var index = draw.grid3.interact._index;
			var path = obj.path[index];
			if (path.pos[0][0] == path.pos[1][0] && path.pos[0][1] == path.pos[1][1]) obj.path.splice(index, 1);
			delete draw.grid3.interact._obj;
			delete draw.grid3.interact._index;
			if (typeof obj.interact === 'object' && typeof obj.interact.onchange === 'function') obj.interact.onchange(obj); 
			drawCanvasPaths();
		},
		
		fill:function() {
			var grid = draw.currCursor.obj;
			if (un(grid.path)) grid.path = [];
			var pos = draw.grid3.getCoordAtPos(grid);
			for (var p = grid.path.length-1; p >= 0; p--) {
				var gridPath = grid.path[p];
				if (gridPath.type !== 'fill' || un(gridPath._gridFillPaths)) continue;
				for (var q = 0; q < gridPath._gridFillPaths.length; q++) {
					if (hitTestPolygon2(pos, gridPath._gridFillPaths[q]) == true) {
						grid.path.splice(p,1);
						drawCanvasPaths();
						if (!un(grid.interact) && typeof grid.interact.onchange === 'function') grid.interact.onchange(grid); 
						return;
					}
				}
			}
			//pos[0] = roundToNearest(pos[0], 0.001);
			//pos[1] = roundToNearest(pos[1], 0.001);
			var interact = grid.interact || grid._path.isInput || grid._path.interact;
			var color = !un(grid._interactColor) ? grid._interactColor : (!un(interact) && !un(interact.color)) ? interact.color : '#00F';
			var bounds = [];
			var a = 1, b = 1, c = 1, m = 1;
			if (typeof grid.vars === 'object') {
				if (typeof grid.vars.a === 'object') a = grid.vars.a.value;
				if (typeof grid.vars.b === 'object') b = grid.vars.b.value;
				if (typeof grid.vars.c === 'object') c = grid.vars.c.value;
				if (typeof grid.vars.m === 'object') m = grid.vars.m.value;
			}
			for (var p = 0; p < grid.path.length; p++) {
				var gridPath = grid.path[p];
				if (gridPath.valid === false) continue;
				if (gridPath.type === 'line') { // fill only works with lines
					var pp = gridPath.pos[0];
					var qq = gridPath.pos[1];
					var func = new Function('return function(x,y,a,b,c,m) {return (y-('+String(pp[1])+'))*('+String(qq[0]-pp[0])+')-(x-('+String(pp[0])+'))*('+String(qq[1]-pp[1])+');}')();
					bounds.push({
						func:func,
						symbol:func(pos[0],pos[1],a,b,c,m) < 0 ? '<' : '>'
					});
				}/* else if (gridPath.type === 'lineSegment') {
					
				} else if ((gridPath.type === 'function' || gridPath.type === 'inequality') && typeof gridPath.func === 'function') {
					bounds.push({
						func:draw.grid3.getGridPathFunctionNonDynamic(grid,gridPath.func),
						symbol:gridPath.func(pos[0],pos[1],a,b,c,m) < 0 ? '<' : '>'
					});
				} else if (gridPath.type === 'inequality-3part' && typeof gridPath.func1 === 'function' && typeof gridPath.func2 === 'function') {
					var value1 = gridPath.func1(pos[0],pos[1],a,b,c,m);
					var value2 = gridPath.func2(pos[0],pos[1],a,b,c,m);
					if (value1 < 0) {
						bounds.push({
							func:draw.grid3.getGridPathFunctionNonDynamic(grid,gridPath.func1),
							symbol:'<'
						});
					} else if (value2 > 0) {
						bounds.push({
							func:draw.grid3.getGridPathFunctionNonDynamic(grid,gridPath.func2),
							symbol:'>'
						});
					} else {
						bounds.push({
							func:draw.grid3.getGridPathFunctionNonDynamic(grid,gridPath.func1),
							symbol:'>'
						},{
							func:draw.grid3.getGridPathFunctionNonDynamic(grid,gridPath.func2),
							symbol:'<'
						});
					}
				}*/
			}
			grid.path.push({
				type: 'fill',
				pos: pos,
				bounds: bounds,
				color:color,
				fillColor: colorA(draw.grid3.getLightColor(color),0.5),
				_deletable: draw.mode == 'interact' ? true : false
			});
			if (!un(grid.interact) && typeof grid.interact.onchange === 'function') grid.interact.onchange(grid); 
			drawCanvasPaths();
		},
		
		pointMoveStart: function() {
			draw._drag = draw.currCursor;
			draw._drag.dragStatus = 'start';
			draw.animate(draw.grid3.interact.pointMoveMove,draw.grid3.interact.pointMoveStop,drawCanvasPaths);
			draw.cursorCanvas.style.cursor = draw.cursors.move2;
			draw.lockCursor = draw.cursors.move2;
		},
		pointMoveMove: function (e) {
			updateMouse(e);
			draw._drag.dragStatus = 'move';
			var obj = draw._drag.obj;
			var gridPath = draw._drag.gridPath;
			var pos = draw.grid3.getCoordAtPos(obj);
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
		},

		zoomDragStart: function() {
			var grid = draw.currCursor.obj;
			draw._drag = {
				grid:grid,
				rescaleX:Number(roundSF(grid.xMin + (grid.xMax - grid.xMin) * (mouse.x - grid.left) / grid.width, 2)),
				rescaleY:Number(roundSF(grid.yMax - (grid.yMax - grid.yMin) * (mouse.y - grid.top) / grid.height, 2)),
				originPos:getPosOfCoord([0,0],grid),
				rescalePrev:[draw.mouse[0],draw.mouse[1]]
			};
			
			draw.animate(draw.grid3.interact.zoomDragMove,draw.grid3.interact.zoomDragEnd,drawCanvasPaths);
			draw.lockCursor = 'ne-resize';
		},
		zoomDragMove: function(e) {
			updateMouse(e);
			var grid = draw._drag.grid;
			var originPos = draw._drag.originPos;
			var changed = false;
			
			var rescaleX = draw._drag.rescaleX;
			var gridxRescaleMin = rescaleX * (1 + (mouse.x - grid.left) / (originPos[0] - mouse.x));
			var gridxRescaleMax = rescaleX * (1 + (mouse.x - grid.left - grid.width) / (originPos[0] - mouse.x));
			if ((rescaleX > 0 && mouse.x - originPos[0] > 30) || (rescaleX < 0 && originPos[0] - mouse.x > 30)) {
				if (((gridxRescaleMax - gridxRescaleMin <= grid.width * 10) || Math.abs(mouse.x - originPos[0]) > Math.abs(draw._drag.rescalePrev[0] - originPos[0])) && (rescaleX > 0 && mouse.x > originPos[0]) || (rescaleX < 0 && mouse.x < originPos[0])) {
					grid.xMin = Number(gridxRescaleMin);
					grid.xMax = Number(gridxRescaleMax);
					changed = true;
				}
			}

			var rescaleY = draw._drag.rescaleY;
			var gridyRescaleMin = rescaleY * (1 + (mouse.y - grid.top - grid.height) / (originPos[1] - mouse.y));
			var gridyRescaleMax = rescaleY * (1 + (mouse.y - grid.top) / (originPos[1] - mouse.y));
			if ((rescaleY < 0 && mouse.y - originPos[1] > 30) || (rescaleY > 0 && originPos[1] - mouse.y > 30)) {
				if (((gridyRescaleMax - gridyRescaleMin <= grid.height * 10) || Math.abs(mouse.y - originPos[1]) > Math.abs(draw._drag.rescalePrev[1] - originPos[1])) && ((rescaleY > 0 && mouse.y < originPos[1]) || (rescaleY < 0 && mouse.y > originPos[1]))) {
					grid.yMin = Number(gridyRescaleMin);
					grid.yMax = Number(gridyRescaleMax);
					changed = true;
				}
			}
			
			if (changed == true) draw.grid3.autoSetScales(grid);
			draw._drag.rescalePrev = [draw.mouse[0],draw.mouse[1]];
		},
		zoomDragEnd: function() {
			var grid = draw._drag.grid;
			var xMag = Math.floor(Math.log(grid.xMax - grid.xMin)/Math.log(10));
			var yMag = Math.floor(Math.log(grid.yMax - grid.yMin)/Math.log(10));
			xMag = Math.pow(10,xMag-1);
			yMag = Math.pow(10,yMag-1);
			grid.xMin = roundToNearest(grid.xMin,xMag);
			grid.xMax = roundToNearest(grid.xMax,xMag);
			grid.yMin = roundToNearest(grid.yMin,yMag);
			grid.yMax = roundToNearest(grid.yMax,yMag);
			delete draw.lockCursor;
			delete draw._drag;
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
	},

	fontSizeSliderStart:function() {
		draw._drag = draw.currCursor;
		draw.animate(draw.grid3.fontSizeSliderMove,draw.grid3.fontSizeSliderStop,drawCanvasPaths);
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.lockCursor = true;
	},
	fontSizeSliderMove:function(e) {
		updateMouse(e);
		draw._drag.obj.fontSize = Math.max(20,Math.min(36,20+(36-20)*(draw.mouse[0]-draw._drag.x1)/(draw._drag.x2-draw._drag.x1)));
	},
	fontSizeSliderStop:function(e) {
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		draw.lockCursor = false;
	}
};

draw.questionImage = {
	resizable:true,
	loadImages:function(obj) {
		obj._imgLoadCount = 0;
		for (var i = 0; i < obj.images.length; i++) {
			var image = obj.images[i];
			if (!un(draw.loadedImages) && draw.loadedImages[image.src] instanceof Image) {
				image._img = draw.loadedImages[image.src];
				image._img.obj = obj;
				image._img._image = image;
				obj._imgLoadCount++;
			} else {
				image._img = new Image();
				image._img.obj = obj;
				image._img._image = image;
				image._img.onload = draw.questionImage.imageLoaded;
				image._img.src = image.src;
			}
		}
		if (obj._imgLoadCount >= obj.images.length) {
			obj._imgsLoaded = true;
			obj._path = draw.getPathOfObj(obj);
			if (obj._path !== false) updateBorder(obj._path);
			drawCanvasPaths();
		}
	},
	imageLoaded:function(e) {
		var obj = e.target.obj;
		obj._imgLoadCount++;
		if (obj._imgLoadCount >= obj.images.length) {
			obj._imgsLoaded = true;
			obj._path = draw.getPathOfObj(obj);
			if (obj._path !== false) updateBorder(obj._path);
			drawCanvasPaths();
		}
		if (un(draw.loadedImages)) draw.loadedImages = {};
		draw.loadedImages[e.target.getAttribute('src')] = e.target;
	},
	draw: function (ctx, obj, path) {
		if (obj.minimised === true) {
			if (un(obj.minimisedMap)) draw.questionImage.calcMinimisedMap(obj);
			var trimLeft = obj.markscheme === true ? 0 : 42;
			for (var i = 0; i < obj.minimisedMap.length; i++) {
				var map = obj.minimisedMap[i];
				if (obj.images[map.inputImgIndex]._img instanceof Image === false) {
					draw.questionImage.loadImages(obj);
					continue;
				}
				var p =  map.drawImageParams;
				ctx.drawImage(obj.images[map.inputImgIndex]._img, p[0]+trimLeft, p[1], p[2]-trimLeft, p[3], obj.rect[0]+p[4]+trimLeft, obj.rect[1]+p[5], p[6]-trimLeft, p[7]);
			}
		} else if (!un(obj.crop) && obj.images.length === 1) {
			if (obj.images[0]._img instanceof Image === false) {
				draw.questionImage.loadImages(obj);
			} else {
				ctx.drawImage(obj.images[0]._img,obj.crop[0],obj.crop[1],obj.crop[2],obj.crop[3],obj.rect[0],obj.rect[1],obj.rect[2],obj.rect[3]);
			}
		} else {
			var startImageIndex = !un(obj.startImageIndex) ? startImageIndex : 0;
			var endImageIndex = !un(obj.endImageIndex) ? endImageIndex : obj.images.length-1;
			var x = obj.rect[0];
			var y = obj.rect[1];
			var trimLeft = obj.markscheme === true ? 0 : 42;
			for (var i = startImageIndex; i <= endImageIndex; i++) {
				var image = obj.images[i];
				if (image._img instanceof Image === false) {
					draw.questionImage.loadImages(obj);
					continue;
				}
				var w = image._img.width;
				var h = image._img.height;
				ctx.drawImage(image._img, trimLeft, 0, w-trimLeft, h, x+trimLeft, y, w-trimLeft, h);
				y += h;
			}
		}
		if (!un(obj.borderColor) || !un(obj.borderWidth)) {
			ctx.strokeStyle = !un(obj.borderColor) ? obj.borderColor : '#000';
			ctx.lineWidth = !un(obj.borderWidth) ? obj.borderWidth : 2;
			if (obj.showInfo === true && !un(obj.info)) {
				ctx.strokeRect(obj.rect[0],obj.rect[1],obj.rect[2],obj.rect[3]-30);
			} else {
				ctx.strokeRect(obj.rect[0],obj.rect[1],obj.rect[2],obj.rect[3]);
			}
		}
		if (obj.showQNum === true && !un(obj.qNum)) {
			text({ctx:ctx,rect:[obj.rect[0],obj.rect[1],38,40],text:[String(obj.qNum)],bold:true,fontSize:26,align:[0,0],box:{type:'loose',color:'#FFF',borderColor:'#000',borderWidth:2}});
		}
		if (obj.showCalc === true && (obj.calc === 1 || obj.calc === -1)) {
			var type = obj.calc === 1 ? 'calc' : 'noncalc';
			var obj2 = {type:type,rect:[obj.rect[0]+obj.rect[2]-40,obj.rect[1],40,40],lineWidth:10,lineColor:'#060'};
			draw[type].draw(ctx,obj2,{obj:[obj2]});
		}
		if (obj.showInfo === true && !un(obj.info)) {
			if (un(obj._infoString)) obj._infoString = obj.info[1]+' '+obj.info[2]+' '+obj.info[3].toUpperCase()+obj.info[4]+' q'+obj.info[5];
			text({ctx:ctx,rect:[obj.rect[0]+obj.rect[2]-300,obj.rect[1]+obj.rect[3]-30,300,30],text:[obj._infoString],color:obj.calc === true ? '#060' : obj.calc === false ? '#900' : '#333',italic:true,fontSize:20,align:[1,0]});
		}
	},
	
	calcMinimisedMap:function(obj,threshold,margin) {
		var imgs = obj.images;
		if (typeof threshold !== 'number') threshold = 200;
		if (typeof margin !== 'number') margin = 12;
		
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		
		var images = [];
		var rowGroups = [];
		var rowGroup;
		var nonBlankRowCount = 0;
		
		for (var i = 0; i < imgs.length; i++) {
			var img = imgs[i]._img;
			
			var image = {img:img,w:img.width,h:0,rowGroups:[]};
			images.push(image);
			
			canvas.width = img.width;
			canvas.height = img.height;		
			ctx.drawImage(img, 0, 0, img.width, img.height);
			var data = ctx.getImageData(0, 0, img.width, img.height).data;

			var rowGroup = {start:0};

			for (var r = 0; r < img.height; r++) {
				var rowStartIndex = 4*r*img.width;
				var rowBlank = true;
				for (var c = 0; c < img.width; c++) {
					var pixelData = data.slice(rowStartIndex+4*c,rowStartIndex+4*c+4);
					if (pixelData[3] !== 0 && (pixelData[0] < threshold || pixelData[1] < threshold || pixelData[2] < threshold)) {
						rowBlank = false;
						break;
					}
				}
				if (r === 0 || rowGroup.blank !== rowBlank) {
					if (r > 0) rowGroup.end = r-1;
					rowGroup = {img:img,imgIndex:i,start:r,blank:rowBlank};
					rowGroups.push(rowGroup)
					image.rowGroups.push(rowGroup);
				}
				if (r === img.height-1) rowGroup.end = r;
				if (rowBlank === false) {
					nonBlankRowCount++;
					image.h++;
				}
			}
		}
		
		for (var i = 0; i < images.length; i++) { // put in margins
			var image = images[i];
			if (image.rowGroups.length < 2) continue;
			for (var r = 0; r < image.rowGroups.length; r++) { // remove horizontal lines
				var rowGroup = image.rowGroups[r];
				var h = rowGroup.end-rowGroup.start+1;
				if (rowGroup.blank === false && h < 5) { 
					if (r === 0) {
						image.rowGroups[1].start = rowGroup.start;
						image.h -= h;
						image.rowGroups.splice(r,1);
						r--;
					} else if (r === image.rowGroups.length-1) {
						image.rowGroups[r-1].end = rowGroup.end;
						image.h -= h;
						image.rowGroups.splice(r,1);
						r--;
					} else {
						image.rowGroups[r-1].end = image.rowGroups[r+1].end;
						image.h -= h;
						image.rowGroups.splice(r,2);
						r--;
					}
				}
			}
			for (var r = 0; r < image.rowGroups.length; r++) { // remove narrow blanks
				var rowGroup = image.rowGroups[r];
				var h = rowGroup.end-rowGroup.start+1;
				if (rowGroup.blank === true) {
					if (r === 0) {
						if (h < margin) {
							image.rowGroups[1].start = rowGroup.start;
							image.h += h;
							image.rowGroups.splice(r,1);
							r--;
						}
					} else if (r === image.rowGroups.length-1) {
						if (h < margin) {
							image.rowGroups[r-1].end = rowGroup.end;
							image.h += h;
							image.rowGroups.splice(r,1);
							r--;
						}
					} else if (h < 2*margin) {
						image.rowGroups[r-1].end = image.rowGroups[r+1].end;
						image.h += h;
						image.rowGroups.splice(r,2);
						r--;
					}
				}
			}
			for (var r = 0; r < image.rowGroups.length; r++) { // add margins
				var rowGroup = image.rowGroups[r];
				if (rowGroup.blank === false) {
					if (r > 0 && image.rowGroups[r-1].blank === true) {
						rowGroup.start -= margin;
						image.rowGroups[r-1].end -= margin;
						image.h += margin;
					}
					if (r < image.rowGroups.length-1 && image.rowGroups[r+1].blank === true) {
						rowGroup.end += margin;
						image.rowGroups[r+1].start += margin;
						image.h += margin;
					}
				}
			}
		}
		
		var outputImageIndex = 0;
		var y = 0;
		obj.minimisedMap = [];
		for (var i = 0; i < images.length; i++) {
			var image = images[i];
			var w = image.w;
			if (y > 0 && y + image.h > 1640) {
				outputImageIndex++;
				y = 0;
			}
			for (var r = 0; r < image.rowGroups.length; r++) {
				var rowGroup = image.rowGroups[r];
				if (rowGroup.blank === true) continue;
				var h = rowGroup.end - rowGroup.start + 1;
				obj.minimisedMap.push({
					inputImgIndex:rowGroup.imgIndex,
					outputImgIndex:outputImageIndex,
					drawImageParams:[0, rowGroup.start, w, h, 0, y, w, h]
				});
				y += h;
			}
		}

	},
	calcHeight:function(obj) {
		var h = 0;
		if (obj.minimised === true) {
			var outputImageHeights = [];
			for (var m = 0; m < obj.minimisedMap.length; m++) {
				var map = obj.minimisedMap[m];
				var i = map.outputImgIndex;
				if (un(outputImageHeights[i])) outputImageHeights[i] = 0;
				outputImageHeights[i] += map.drawImageParams[7];
			}
			for (var i = 0; i < outputImageHeights.length; i++) {
				if (typeof outputImageHeights[i] === 'number') h += outputImageHeights[i];
			}
		} else if (!un(obj.crop) && obj.images.length === 1) {
			h = obj.crop[3];
		} else {
			var startImageIndex = !un(obj.startImageIndex) ? startImageIndex : 0;
			var endImageIndex = !un(obj.endImageIndex) ? endImageIndex : obj.images.length-1;
			for (var i = startImageIndex; i <= endImageIndex; i++) {
				var image = obj.images[i];
				h += (!un(image._img) && image._img.naturalHeight > 0 ? image._img.naturalHeight : image.height);
			}
		}
		if (obj.showInfo === true) h += 30;
		obj.rect[3] = h;
	},

	toggleMinimised:function() {
		var obj = draw.currCursor.obj;
		if (obj.minimised === true) {
			obj.minimised = false;
		} else {
			obj.minimised = true;
			if (!un(obj.crop)) {
				delete obj.crop;
				obj.rect[2] = obj.images[0]._img.naturalWidth;
			}
			if (un(obj.minimisedMap)) draw.questionImage.calcMinimisedMap(obj);
		}
		draw.questionImage.calcHeight(obj);
		updateBorder(obj._path);
		drawCanvasPaths();
	},
	toggleShowQNum:function() {
		var obj = draw.currCursor.obj;
		obj.showQNum = !obj.showQNum;
		drawCanvasPaths();
	},
	toggleShowInfo:function() {
		var obj = draw.currCursor.obj;
		obj.showInfo = !obj.showInfo;
		drawCanvasPaths();
	},
	toggleShowCalc:function() {
		var obj = draw.currCursor.obj;
		obj.showCalc = !obj.showCalc;
		drawCanvasPaths();
	},
	
	getRect: function(obj) {
		return obj.rect.slice(0);
	},
	getButtons: function (x1, y1, x2, y2, pathNum, path) {
		if (un(draw.path[pathNum])) return [];
		var obj = draw.path[pathNum].obj[0];
		var buttons = [];
		buttons.push({
			shape: 'rect',
			dims: [(x1+x2)/2-160, y1, 80, 20],
			cursor: draw.cursors.pointer,
			func: draw.questionImage.toggleShowQNum,
			pathNum: pathNum,
			obj:obj,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = obj.showQNum === true ? '#060' : '#FFF';
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					fontSize:14,
					color: obj.showQNum === true ? '#FFF' : '#060',
					text: ['qNum']
				});
				
			}
		}, {
			shape: 'rect',
			dims: [(x1+x2)/2-80, y1, 80, 20],
			cursor: draw.cursors.pointer,
			func: draw.questionImage.toggleShowCalc,
			pathNum: pathNum,
			obj:obj,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = obj.showCalc === true ? '#060' : '#FFF';
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					fontSize:14,
					color: obj.showCalc === true ? '#FFF' : '#060',
					text: ['calc']
				});
				
			}
		}, {
			shape: 'rect',
			dims: [(x1+x2)/2, y1, 80, 20],
			cursor: draw.cursors.pointer,
			func: draw.questionImage.toggleShowInfo,
			pathNum: pathNum,
			obj:obj,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = obj.showInfo === true ? '#060' : '#FFF';
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					fontSize:14,
					color: obj.showInfo === true ? '#FFF' : '#060',
					text: ['info']
				});
				
			}
		}, {
			shape: 'rect',
			dims: [(x1+x2)/2+80, y1, 80, 20],
			cursor: draw.cursors.pointer,
			func: draw.questionImage.toggleMinimised,
			pathNum: pathNum,
			obj:obj,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = obj.minimised === true ? '#060' : '#FFF';
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					fontSize:14,
					color: obj.minimised === true ? '#FFF' : '#060',
					text: ['minimise']
				});
				
			}
		});
		return buttons;
	},
	
	allResourceQuestionsToggleProperty:function(resource,key,value) {
		for (var p = 0; p < resource.pages.length; p++) {
			var page = resource.pages[p];
			for (var p2 = 0; p2 < page.paths.length; p2++) {
				var path = page.paths[p2];
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (obj.type !== 'questionImage') continue;
					obj[key] = value;
					if (key === 'minimised') {
						if (value === true && un(obj.minimisedMap)) draw.questionImage.calcMinimisedMap(obj);
						draw.questionImage.calcHeight(obj);
					}
				}
				updateBorder(path);
			}
		}
		drawCanvasPaths();
	},
	allResourceQuestionsRenumber:function(resource) {
		var allObjs = [];
		for (var p = 0; p < resource.pages.length; p++) {
			var page = resource.pages[p];
			var paths = p === pIndex ? draw.path.slice(0) : page.paths.slice(0);
			paths.sort(function(a,b) {
				if (a.border[1] !== b.border[1]) return a.border[1] - b.border[1];
				if (a.border[0] !== b.border[0]) return a.border[0] - b.border[0];
				return 0;
			});
			for (var p2 = 0; p2 < paths.length; p2++) {
				var path = paths[p2];
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (obj.type === 'questionImage') allObjs.push(obj);
				}
			}
		}
		for (var o = 0; o < allObjs.length; o++) {
			var obj = allObjs[o];
			obj.qNum = o+1;
		}
		drawCanvasPaths();
	},
	allResourceQuestionsBuildMarkscheme:function(resource) {
		if (typeof qDatabase === 'undefined') {
			Notifier.info('Loading...');
			addCSS('/js/james-library.css');
			loadScript('/js/james-library.js',function() {
				loadScript('teach'+teachVersion+'/_qDatabase.js',function() {
					setTimeout(function() {
						draw.questionImage.allResourceQuestionsBuildMarkscheme(file.resources[resourceIndex]);
					},500);
				});
			});
			return;
		}
		var allObjs = [];
		for (var p = 0; p < resource.pages.length; p++) {
			var page = resource.pages[p];
			var paths = p === pIndex ? draw.path.slice(0) : page.paths.slice(0);
			for (var p2 = 0; p2 < paths.length; p2++) updateBorder(paths[p2]);
			paths.sort(function(a,b) {
				if (a.border[1] !== b.border[1]) return a.border[1] - b.border[1];
				if (a.border[0] !== b.border[0]) return a.border[0] - b.border[0];
				return 0;
			});
			for (var p2 = 0; p2 < paths.length; p2++) {
				var path = paths[p2];
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (obj.type === 'questionImage' && obj.markscheme !== true) allObjs.push(obj);
				}
			}
		}
		var resourceQuestions = [];
		var questionsIndex = {};
		for (var q = 0; q < qDatabase.data.length; q++) {
			var question = qDatabase.data[q];
			if (un(question.set) || un(question.board) || un(question.session) || un(question.tier) || un(question.paper) || un(question.qNumber)) continue;
			questionsIndex[(question.set+','+question.board+','+question.session+','+question.tier+','+question.paper+','+question.qNumber).toLowerCase()] = question;
		}
		for (var o = 0; o < allObjs.length; o++) {
			var obj = allObjs[o];
			if (un(obj._question)) obj._question = questionsIndex[(obj.info[0]+','+obj.info[1]+','+obj.info[2]+','+obj.info[3]+','+obj.info[4]+','+obj.info[5]).toLowerCase()];
			if (un(obj._question)) continue;
			obj._question._qNumTemp = obj.qNum;
			resourceQuestions.push(obj._question);
		}
		if (resourceQuestions.length === 0) {
			Notifier.error('Sorry, no markscheme found.');
		} else {
			var count = 0;
			do {
				count++;
				var name = 'MS' + (count === 1 ? '' : String(count));
				var found = file.resources.find(function(x) {return x.name.toLowerCase() === name.toLowerCase();});
			} while (typeof found === 'object' && found !== null);
			file.resources.splice(resourceIndex+1,0,{name:name,pageCount:1,pages:[{margins:[20,20],paths:[],pen:[],_loaded: 1}]});
			showResource(resourceIndex+1);
			qDatabase.insertMarkScheme2(resourceQuestions);
		}
	},
	
	arrangeAllInResource:function(resource) {
		var allPaths = [];
		for (var p = 0; p < resource.pages.length; p++) {
			var page = resource.pages[p];
			var paths = p === pIndex ? draw.path : page.paths;
			paths.sort(function(a,b) {
				if (a.border[1] !== b.border[1]) return a.border[1] - b.border[1];
				if (a.border[0] !== b.border[0]) return a.border[0] - b.border[0];
				return 0;
			});
			allPaths = allPaths.concat(paths);
		}
		draw.path = [];
		resource.pages = resource.pages.slice(0,1);
		var pageIndex = 0;
		var page = resource.pages[0];
		page.paths = [];
		pIndex = 0;
		showPage();
		var top = 40;		
		for (var q = 0; q < allPaths.length; q++) {
			var path = allPaths[q];
			if (path.border[3] <= 1700 && top + path.border[3] > 1700) nextPage();
			var left = path.tightBorder[0];
			if (path.obj[0].type === 'questionImage') left = 40;
			positionPath(path,left,top);
			page.paths.push(path);
			top += path.tightBorder[3]+40;
		}
		file.resources[resourceIndex] = resource;
		showResource(resourceIndex);
		drawCanvasPaths();
		function nextPage() {
			if (un(resource.pages[pageIndex+1])) {
				resource.pages[pageIndex+1] = {
					paths:[],
					_loaded:1
				};
			}
			page = resource.pages[pageIndex+1];
			pageIndex++;
			top = 40;
		}
	},

	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		if (typeof dw !== 0 && obj.minimised !== true && obj.images.length === 1) {
			var ratio = obj.rect[2]/obj.rect[3];
			obj.rect[2] += dw;
			obj.rect[3] = obj.rect[2]/ratio;
		}
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.rect[0] = center[0] + sf * (obj.rect[0] - center[0]);
			obj.rect[1] = center[1] + sf * (obj.rect[1] - center[1]);
		}
		var ratio = obj.rect[2]/obj.obj.rect[3];
		obj.rect[2] *= sf;
		obj.obj.rect[3] = obj.rect[2]/ratio;
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		var pos = [];
		if (obj.minimised !== true && obj.images.length === 1) {			
			pos.push({
				shape: 'line',
				dims: [[obj.rect[0],obj.rect[1]],[obj.rect[0],obj.rect[1]+obj.rect[3]],20],
				cursor: draw.cursors.ew,
				func: draw.questionImage.cropStart,
				pathNum: pathNum,
				obj: obj,
				side: 'left'
			}, {
				shape: 'line',
				dims: [[obj.rect[0],obj.rect[1]],[obj.rect[0]+obj.rect[2],obj.rect[1]],20],
				cursor: draw.cursors.ns,
				func: draw.questionImage.cropStart,
				pathNum: pathNum,
				obj: obj,
				side: 'top'
			}, {
				shape: 'line',
				dims: [[obj.rect[0]+obj.rect[2],obj.rect[1]],[obj.rect[0]+obj.rect[2],obj.rect[1]+obj.rect[3]],20],
				cursor: draw.cursors.ew,
				func: draw.questionImage.cropStart,
				pathNum: pathNum,
				obj: obj,
				side: 'right'
			}, {
				shape: 'line',
				dims: [[obj.rect[0],obj.rect[1]+obj.rect[3]],[obj.rect[0]+obj.rect[2],obj.rect[1]+obj.rect[3]],20],
				cursor: draw.cursors.ns,
				func: draw.questionImage.cropStart,
				pathNum: pathNum,
				obj: obj,
				side: 'bottom'
			});
		}
		return pos;
	},
	cropStart: function(e) {
		draw._drag = draw.currCursor;
		var obj = draw._drag.obj;
		if (un(obj.crop)) obj.crop = [0,0,obj.images[0]._img.naturalWidth,obj.images[0]._img.naturalHeight];
		obj._xsf = obj.crop[2] / obj.rect[2];
		obj._ysf = obj.crop[3] / obj.rect[3];
		//console.log('width:',obj.rect[2],obj.crop[2],obj._xsf);
		//console.log('height:',obj.rect[3],obj.crop[3],obj._ysf);
		draw.animate(draw.questionImage.cropMove,draw.questionImage.cropStop,drawCanvasPaths);
	},
	cropMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var side = draw._drag.side;
		if (side === 'left') {
			var minLeft = obj.rect[0]-obj.crop[0]/obj._xsf;
			var maxLeft = obj.rect[0]+obj.rect[2]-40;
			var x = Math.max(Math.min(maxLeft,draw.mouse[0]),minLeft);
			var dx = x - obj.rect[0];
			obj.rect[0] += dx;
			obj.rect[2] -= dx;
			obj.crop[0] += dx*obj._xsf;
			obj.crop[2] -= dx*obj._xsf;
		} else if (side === 'right') {
			var minRight = obj.rect[0]+40;
			var maxRight = obj.rect[0]+obj.images[0]._img.naturalWidth/obj._xsf;
			var right = Math.min(Math.max(draw.mouse[0],minRight),maxRight);
			obj.rect[2] = right-obj.rect[0];
			obj.crop[2] = obj.rect[2]*obj._xsf;
			//console.log('width:',obj.rect[2],obj.crop[2]);
		} else if (side === 'top') {
			var minTop = obj.rect[1]-obj.crop[1]/obj._ysf;
			var maxTop = obj.rect[1]+obj.rect[3]-40;
			var y = Math.max(Math.min(maxTop,draw.mouse[1]),minTop);
			var dy = y - obj.rect[1];
			obj.rect[1] += dy;
			obj.rect[3] -= dy;
			obj.crop[1] += dy*obj._ysf;
			obj.crop[3] -= dy*obj._ysf;
		} else if (side === 'bottom') {
			var minBottom = obj.rect[1]+40;
			var maxBottom = obj.rect[1]+obj.images[0]._img.naturalHeight/obj._ysf;
			var bottom = Math.min(Math.max(draw.mouse[1],minBottom),maxBottom);
			obj.rect[3] = bottom-obj.rect[1];
			obj.crop[3] = obj.rect[3]*obj._ysf;
			//console.log('height:',obj.rect[3],obj.crop[3]);
		}
	},
	cropStop: function(e) {
		delete draw._drag;
	}

}

draw.hexagonalLattice = {
	resizable:true,
	add:function(obj) {
		deselectAllPaths();
		var obj2 = {
			type:'hexagonalLattice',
			left:100,
			top:100,
			cellWidth:60,
			cellWidthOverlap:30,
			cellHeight:100,
			colors:[['#CCF','#66F'],['#FCC','#F66']],
			columns:[
				[{value:1},{value:2},{value:3},{value:4}],
				[{value:5},{value:6},{value:7},{value:8}],
				[{value:9},{value:10},{value:11},{value:12}],
				[{value:13},{value:14},{value:15},{value:16}]
			],
			thickness:4,
			color:'#000',
			fontSize:28,
			font:'Arial',
			interact:{
				selectable:true
			}
		}
		var path = {obj:[obj2],selected:true};
		updateBorder(path);
		draw.path.push(path);
		drawCanvasPaths();
	},
	draw:function(ctx,obj,path) {
		obj._cursorPositions = [];
		obj._cells = [];
		var w = obj.cellWidth;
		var h = obj.cellHeight;
		var ol = obj.cellWidthOverlap;
		for (var c = 0; c < obj.columns.length; c++) {
			var column = obj.columns[c];
			var x = obj.left + (c+1)*ol + c*w;
			var y = obj.top + (c%2 === 0 ? 0 : h/2);
			var colors = obj.colors[c%2];
			for (var r = 0; r < column.length; r++) {
				var cell = column[r];
				obj._cells.push(cell);
				cell._polygon = [[x,y],[x+w,y],[x+w+ol,y+h/2],[x+w,y+h],[x,y+h],[x-ol,y+h/2]];
				cell._color = cell.selected === true ? colors[1] : colors[0];
				draw.polygon.draw(ctx,{
					type: 'polygon',
					color: obj.color,
					thickness: obj.thickness,
					fillColor: cell._color,
					points: cell._polygon,
					closed: true
				},{});
				if (!un(obj.interact) && obj.interact.selectable === true && obj.interact.disabled !== true && obj.interact._disabled !== true) {
					obj._cursorPositions.push({shape:'polygon',dims:cell._polygon,obj:obj,cell:cell,cursor:draw.cursors.pointer,func:draw.hexagonalLattice.cellClick});
				}
				if (!un(cell.text) || !un(cell.value)) {
					cell = clone(cell);
					cell.ctx = ctx;
					cell.align = [0,0];
					cell.rect = [x,y,w,h];
					delete cell.selected;
					if (un(cell.text)) cell.text = [String(cell.value)];
					if (un(cell.fontSize)) cell.fontSize = obj.fontSize;
					if (un(cell.font)) cell.font = obj.font;
					text(cell);
				}
				y += h;
			}
		}
	},
	getRect:function(obj) {
		obj._rows = obj.columns.reduce(function(acc, val) {return Math.max(acc,val.length)},0);
		return [obj.left,obj.top,(obj.cellWidth+obj.cellWidthOverlap)*obj.columns.length+obj.cellWidthOverlap,obj.cellHeight*(obj._rows+0.5)];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		if (un(obj._rows)) draw.hexagonalLattice.getRect(obj);
		obj.cellWidth += dw/obj._rows;
		obj.cellHeight += dh/obj.columns.length;
	},
	getCursorPositionsInteract: function(obj) {
		return obj._cursorPositions;
	},
	cellClick:function() {
		var cell = draw.currCursor.cell;
		if (cell.selected === true) {
			delete cell.selected;
		} else {
			cell.selected = true;
		}
		drawCanvasPaths();
	}
}

draw.starter = {
	load:function(urlkey,startResourceIndex,startPageIndex) {
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("post", "starterQuestions/loadStarter.php", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) return;
			draw.fileIsAStarter = true
			draw.starter.data = JSON.parse(this.responseText);
			
			var pageVis = (draw.starter.data.free !== '1' && draw.starter.data.free !== 1 && (userInfo.verified != 0 || (userInfo.user === 'pupil' && userInfo.schemesAccess == 0 && userInfo.allPupilsFullAccess !== 1))) ? false : true;
			//console.log('draw.starter.data',draw.starter.data);
			//console.log('pageVis',pageVis);
			
			queryObject.starter = draw.starter.data.urlkey;
			updateURL();
			
			var fileStructure = [];
			for (var q = 0; q < draw.starter.data.questions.length; q++) {
				var question = draw.starter.data.questions[q];
				question.pageIndex = Number(question.pageIndex);
				question.resourceIndex = Number(question.resourceIndex);
				if (un(fileStructure[question.resourceIndex])) fileStructure[question.resourceIndex] = [];
				if (un(fileStructure[question.resourceIndex][question.pageIndex])) fileStructure[question.resourceIndex][question.pageIndex] = [];
				fileStructure[question.resourceIndex][question.pageIndex].push(question);
			}
			
			//console.log(draw.starter.data,fileStructure);
			draw.starter.data.titlePath = {"obj":[{"type":"text2","rect":[100,18,1000,54],"text":[draw.starter.data.title],"align":[0,0],"underline":true,"bold":true}]};
			draw.starter.data.datePath = {"obj":[{"type":"text2","rect":[20,20,300,50],"fontSize":32,"text":["{date}"],"align":[-1,-1]}]};
			file.title = draw.starter.data.title;
			document.title = draw.starter.data.title;
			
			for (var r = 0; r < fileStructure.length; r++) {
				var resource = draw.starter.data.resources.find(function(x) {
					return Number(x.resourceIndex) === r;
				});
				if (un(file.resources[r])) file.resources[r] = {pages:[]}
				file.resources[r].pageCount = fileStructure[r].length;
				file.resources[r].name = (typeof resource === 'object' && typeof resource.tabName === 'string' && resource.tabName.length > 0) ? resource.tabName : fileStructure.length === 1 ? 'starter' : 'ABCDEFGHIJKLM'[r];
				file.resources[r].type = 'slides';
				for (var p = 0; p < fileStructure[r].length; p++) {
					var page = draw.starter.data.pages.find(function(x) {
						return Number(x.pageIndex) === p && Number(x.resourceIndex) === r;
					});
					if (un(file.resources[r].pages[p])) file.resources[r].pages[p] = {paths:[]};
					if (pageVis === false) file.resources[r].pages[p].pageVis = false;
					file.resources[r].pages[p]._loaded = 1;
					var titlePath = clone(draw.starter.data.titlePath);
					if (typeof page === 'object' && typeof page.title === 'string' && page.title !== '') {
						titlePath.obj[0].text = [page.title];
					}
					titlePath.obj[0].fontSize = titlePath.obj[0].text[0].length > 20 ? 38 : 42;
					file.resources[r].pages[p].paths = [
						clone(draw.starter.data.datePath),
						titlePath
					];
					if (typeof page !== 'object' || Number(page.printable) === 1) {
						file.resources[r].pages[p].paths.push({obj:[{type:"printButton",rect:[1130,22,50,50],color:"#000",fillColor:"#F3F3F3",lineWidth:4,radius:8,interact:{click:draw.starter.getPagePDF}}]});
					}
					if (r === resourceIndex && p === pIndex) draw.path = file.resources[r].pages[p].paths;
					for (var q = 0; q < fileStructure[r][p].length; q++) {
						var question = fileStructure[r][p][q];
						question.questionNum = fileStructure[r][p].length === 1 ? '' : Number(question.questionNum);
						question.x = Number(question.x);
						question.y = Number(question.y);			
						draw.starterQuestion.load(question);
					}
					if (pageVis === false) draw.starter.drawPageUnverified(file.resources[r].pages[p]);
				}
			}
	
			var r = !un(startResourceIndex) ? startResourceIndex : 0;
			var p = !un(startPageIndex) ? startPageIndex : 0;
			showResource(r,p);
		}
		xmlHttp.send('urlkey='+encodeURIComponent(urlkey));
	},
	drawPageUnverified:function(page) {
		if (un(page.canvas)) {
			page.canvas = newctx({rect:[0,0,1200,1700],z:1000,pE:false,vis:false}).canvas;
			page.canvas.style.opacity = 0.5;
		}
		page.canvas.ctx.clear();
		var color = colorA('#000',0.5);							
		var paths = page.paths.concat({obj:[{type:'rect',startPos:[0,0],finPos:[1200,1700],thickness:1,color:color,fillColor:color}]});
		for (var p2 = paths.length-1; p2 >= 0; p2--) {
			var path = paths[p2];
			if (!un(path.appear) && path.appear.startVisible !== true) paths.splice(p2,1);
		}
		
		//console.log('drawPageUnverified',page,paths);
		
		draw.starter.drawPathsToCanvas(page.canvas,paths);		
	},
	drawPathsToCanvas: function(canvas,paths,drawAllPaths) {
		if (un(canvas) || un(paths)) return;
		if (un(drawAllPaths)) drawAllPaths = false;
		var ctx = canvas.getContext('2d');	
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			if (un(path) || (drawAllPaths == false && getPathVis(path) == false)) continue;
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (un(draw[obj.type]) || un(draw[obj.type].drawUnderlay)) continue;
				ctx.save();
				draw[obj.type].drawUnderlay(ctx,obj,path);
				ctx.restore();
			}
		}
		
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			if (un(path) || (drawAllPaths == false && getPathVis(path) == false)) continue;
			for (var o = 0; o < path.obj.length; o++) {
				if (un(path.obj[o])) continue;
				var obj = path.obj[o];
				if (un(draw[obj.type]) || un(draw[obj.type].draw)) continue;
				ctx.save();
				draw[obj.type].draw(ctx,obj,path);
				ctx.restore();
			}
		}
		
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			if (un(path) || (drawAllPaths == false && getPathVis(path) == false)) continue;
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (un(draw[obj.type]) || un(draw[obj.type].drawOverlay)) continue;
				ctx.save();
				draw[obj.type].drawOverlay(ctx,obj,path);
				ctx.restore();
			}
		}
		
	},
	getPagePDF: function() {
		if (typeof window.navigator.userAgent === 'string' && /MSIE|Trident/.test(window.navigator.userAgent) === true) {
			jMessage.add('Sorry, PDF generation cannot be used on Internet Explorer. Please use a different browser.','cross');
			return;
		}
		if (typeof canvas2pdf === 'undefined') {
			if (draw.starter._canvas2pdfLoading === true) return;
			canvasPdf.load(function() {
				draw.starter.getPagePDF();
			});
			jMessage.add('Generating PDF - this can take a few moments, please wait...','pending');			
			draw.starter._canvas2pdfLoading = true;
			setTimeout(function() {
				delete draw.starter._canvas2pdfLoading;
			},5000);
			return;
		}
		
		draw.updateAllBorders();
		var starterQuestions = draw.objsOfType('starterQuestion');
		var title = draw.path.find(function(x) {
			return x.obj.length === 1 && x.obj[0].type === 'text2' && !un(x.tightBorder) && isPointInRect([600,50],x.tightBorder[0],x.tightBorder[1],x.tightBorder[2],x.tightBorder[3]);
		});
		var yOffset = typeof title === 'object' && title !== null ? 0 : -70;
		var starterQuestionsPaths = [];
		var starterQuestionsAnswerPaths = [];
		for (var s = 0; s < starterQuestions.length; s++) {
			var obj = starterQuestions[s];
			draw.starterQuestion.saveState(obj,'_savedBeforePDF');
			if (obj._showingAnswer === true) {
				draw.starterQuestion.unshowAnswer(obj);
			}
			var paths = clone(obj._questionPaths);
			var obj2 = clone(obj);
			obj2.rect[1] += yOffset;
			obj2.type = 'text2';
			obj2.box = {
				type:'loose',
				borderColor: starterQuestions.length > 1 ? '#000' : '#FFF',
				borderWidth: starterQuestions.length > 1 ? 3 : 0.01,
				color:'none'
			}
			var starterQuestionPaths = [{obj:[obj2]}];
			for (var p = 0; p < paths.length; p++) {
				var path = paths[p];
				if (typeof path.appear === 'object' && path.appear.startVisible !== true) continue;
				repositionPath(path,0,yOffset);
				starterQuestionPaths.push(path);
			}
			starterQuestionsPaths.push(starterQuestionPaths);
			
			draw.starterQuestion.showAnswer(obj);
			var paths = clone(obj._questionPaths);
			var obj2 = clone(obj);
			obj2.type = 'text2';
			obj2.box = {
				type:'loose',
				borderColor: starterQuestions.length > 1 ? '#000' : '#FFF',
				borderWidth: starterQuestions.length > 1 ? 3 : 0.01,
				color:'none'
			}
			
			var starterQuestionAnswerPaths = [{obj:[obj2]}];
			for (var p = 0; p < paths.length; p++) {
				repositionPath(paths[p],0,yOffset);
				starterQuestionAnswerPaths.push(paths[p]);
			}
			starterQuestionsAnswerPaths.push(starterQuestionAnswerPaths);
			
			draw.starterQuestion.unshowAnswer(obj);
			draw.starterQuestion.restoreState(obj,'_savedBeforePDF');
		}
	
		var ctx = new canvas2pdf.PdfContext(blobStream(),{
			ownerPassword:'kjbekrjbnlejbl',
			permissions:{
				printing:'highResolution',
				modifying: false,
				copying: false,
				annotating : false
			},
			layout: 'landscape'
		});
		ctx.canvas = {};
		for (var key in canvasPdf.fonts) {
			var font = canvasPdf.fonts[key];
			ctx.doc.registerFont(key,font.arrayBuffer);
		}
		
		var pw = 792, ph = 612, sw = 1200, margin = 30;
		var scale = (pw-2*margin)/(2*sw);
		var pageBoxRatio = (pw-2*margin)/(ph-2*margin);
		var sh = sw/pageBoxRatio;
		ctx.clearRect(0,0,3500,3500);
		ctx.scale(scale, scale);
		
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#000';
		ctx.beginPath();
		ctx.moveTo(margin/scale+sw,margin/scale);
		ctx.lineTo(margin/scale+sw,margin/scale+2*sh);
		ctx.moveTo(margin/scale,margin/scale+sh);
		ctx.lineTo(margin/scale+2*sw,margin/scale+sh);
		ctx.stroke();
		
		var urlTextObj = {
			type:'text2',
			text:['www.MathsPad.co.uk'],
			rect:[sw-250,sh-90,200,40],
			align:[1,1],
			fontSize:24
		};
		
		for (var i = 0; i < 4; i++) {
			var x = margin/scale + (i % 2 === 0 ? 0 : sw);
			var y = margin/scale + (i < 2 ? 0 : sh);
			ctx.translate(x, y);
				if (typeof title === 'object' && title !== null) {
					drawPathsToCanvas(ctx,[title]);
				}
				for (var s = 0; s < starterQuestionsPaths.length; s++) {
					var starterQuestionPaths = starterQuestionsPaths[s];
					drawPathsToCanvas(ctx,starterQuestionPaths);
				}
				drawPathsToCanvas(ctx,[{obj:[urlTextObj]}]);
			ctx.translate(-x, -y);
		}
		
		ctx.doc.addPage();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		scale *= 2;
		ctx.scale(scale, scale);
		var x = margin/scale;
		var y = margin/scale;
		ctx.translate(x, y);
			if (typeof title === 'object' && title !== null) {
				drawPathsToCanvas(ctx,[title]);
			}
			for (var s = 0; s < starterQuestionsAnswerPaths.length; s++) {
				var starterQuestionAnswerPaths = starterQuestionsAnswerPaths[s];
				drawPathsToCanvas(ctx,starterQuestionAnswerPaths);
			}
			drawPathsToCanvas(ctx,[{obj:[urlTextObj,{
				type:'text2',
				text:['ANSWERS'],
				color:'#F00',
				rect:[sw-420,20,400,50],
				align:[1,-1],
				fontSize:38
			}]}]);
		ctx.translate(-x, -y);
		
		ctx.doc.info.Title = document.title;
		ctx.doc.info.Author = 'MathsPad';
		ctx.stream.on('finish', function () {
			var blob = ctx.stream.toBlob('application/pdf');
			var fileURL = URL.createObjectURL(blob);
			window.open(fileURL, '_blank');
		});
		ctx.end();
	},
	isFileAStarter: function() {
		return draw.fileIsAStarter === true;
		/*for (var r = 0; r < file.resources.length; r++) {
			var resource = file.resources[r];
			if (un(resource) || un(resource.pages)) continue;
			for (var pa = 0; pa < resource.pages.length; pa++) {
				var page = resource.pages[pa];
				if (un(page) || un(page.paths)) continue;
				for (var p = 0; p < page.paths.length; p++) {
					var path = page.paths[p];
					if (un(path) || un(path.obj)) continue;
					for (var o = 0; o < path.obj.length; o++) {
						var obj = path.obj[o];
						if (!un(obj) && obj.type === 'starterQuestion') return true;
					}
				}
			}
		}
		return false;*/
	},
	reviveFunctions: function(obj) {
		var circular = [];
		return reviveFunctions(obj);
		
		function reviveFunctions(value) {
			if (circular.indexOf(value) > -1) return value;
			if (value instanceof Array) {
				for (var i = 0; i < value.length; i++) {
					if (typeof value[i] === 'object') {
						circular.push(value);
						break;
					}
				}
				for (var i = 0; i < value.length; i++) {
					value[i] = reviveFunctions(value[i]);
				}
			} else if (typeof value === 'object') {
				for (var key in value) {
					if (typeof value[key] == 'object') {
						circular.push(value);
						break;
					}
				}
				for (var key in value) {
					value[key] = reviveFunctions(value[key]);
				}
			} else if (typeof value === 'string' && value.indexOf('function') === 0) {
				try {
					value = value.replace(/\\"/g, '"');
					eval('value = '+value);
				} catch(error) {}
			}
			return value;
		}
	}
}
draw.starterPage = {
	add:function() {
		if (draw.path.length > 0) return;
		draw.starter.data = {};
		draw.starter.data.titlePath = {"obj":[{"type":"text2","rect":[100,18,1000,54],"fontSize":42,"text":["Starter Questions"],"align":[0,0],"underline":true,"bold":true}]};
		draw.path.push(draw.starter.data.titlePath);
		draw.starter.data.datePath = {"obj":[{"type":"text2","rect":[20,20,300,50],"fontSize":32,"text":["{date}"],"align":[-1,-1]}]};
		draw.path.push(draw.starter.data.datePath);
		draw.starterQuestion.add(draw.starterQuestion.convertRect([0,2,6,12]));
		draw.starterQuestion.add(draw.starterQuestion.convertRect([6,2,6,12]));
	}
}
draw.starterQuestion = {
	resizable:true,
	groupable:false,
	add:function(rect) {
		if (un(rect)) {
			var w = draw.starterQuestion.widths[5];
			var h = draw.starterQuestion.heights[6];
			var pos = draw.starterQuestion.findSpaceForQuestion({rect:[0,0,w,h]},draw.path);
			if (pos === false) {
				alert('No space for a new starter question on the current page.');				
				return;
			}
			/*for (var y = 2; y < draw.starterQuestion.yPos.length; y++) {
				var yPos = draw.starterQuestion.yPos[y];
				for (var x = 0; x < 2; x++) {
					var xPos = draw.starterQuestion.xPos[[0,6][x]];
					var ok = true;
					for (var p = 0; p < draw.path.length; p++) {
						var pathRect = draw.path[p].tightBorder;
						if (pathRect[0] < xPos+w && pathRect[1] < yPos+h && pathRect[0]+pathRect[2] > xPos && pathRect[1]+pathRect[3] > yPos) {
							ok = false;
							break;
						}
					}
					if (ok === true) break;
				}
				if (ok === true) break;
			}*/
			var rect = [pos[0],pos[1],w,h];
		}
		deselectAllPaths(false);
		draw.path.push({obj:[{
			type: "starterQuestion",
			rect: rect,
			fontSize: 36,
			text: [""],
			align: [-1, -1],
			marginRight:10,
			box: {
				type: "loose",
				borderColor: "#CCF",
				color: "#CCF",
				borderWidth: 0.1
			},
			_pageIndex:pIndex
		}]});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	drawUnderlay:function(ctx,obj,path) {
		if (un(obj.box)) return;
		var obj2 = clone(obj);
		obj2.ctx = ctx;
		obj2.text = [''];
		text(obj2);
	},
	draw:function(ctx,obj,path) {
		obj.text = simplifyText(obj.text);
		if (un(obj.marginRight)) obj.marginRight = 10;
		var obj2 = clone(obj);
		obj2.padding = 10;
		obj2.ctx = ctx;
		delete obj2.box;
		var measure = text(obj2);
		obj._tightRect = measure.tightRect;
		if (obj.textEdit == true) {
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
		draw.starterQuestion.getQuestionType(obj);
	},
	drawOverlay: function(ctx,obj,path) {
		obj._cursorPositions = [];
		obj._cursorPositionsEdit = [];
		var rects = {};
		var top = obj.rect[1]+10;
		if (obj.options instanceof Array) {
			var right = obj.rect[0]+obj.rect[2];
			if (obj.options2 instanceof Array) {			
				if (un(obj._options2Width)) {
					obj._options2Width = 100;
					for (var o = 0; o < obj.options2.length; o++) {
						obj._options2Width = Math.max(obj._options2Width,text({ctx:draw.hiddenCanvas.ctx,text:[obj.options2[o]],rect:[0,0,1200,1700],measureOnly:true,fontSize:28}).tightRect[2]+40);
					}
				}
				var w2 = obj._options2Width;
				var h2 = !un(obj.optionssHeight) ? obj.optionsHeight : 40;
				rects.options2 = [obj.rect[0]+obj.rect[2]-(w2+10),top];
				rects.options2.push(w2,h2);
				right -= (w2+10);
			}
			
			if (un(obj._optionsWidth)) {
				obj._optionsWidth = 100;
				for (var o = 0; o < obj.options.length; o++) {
					obj._optionsWidth = Math.max(obj._optionsWidth,text({ctx:draw.hiddenCanvas.ctx,text:[obj.options[o]],rect:[0,0,1200,1700],measureOnly:true,fontSize:28}).tightRect[2]+40);
				}
			}
			var w = obj._optionsWidth;
			var h = !un(obj.optionsHeight) ? obj.optionsHeight : 40;
			rects.options = [right-(w+10),top];
			top += h+10;
			rects.options.push(w,h);
		}
		if (typeof obj.newQuestion === 'function') {
			rects.newQuestion = [obj.rect[0]+obj.rect[2]-85,top];
			top += 45;
			rects.newQuestion.push(75,35);
		}
		if (['none','mixed'].indexOf(obj._questionType) === -1) {
			rects.reset = [obj.rect[0]+obj.rect[2]-85,top];
			top += 45;
			rects.reset.push(75,35);
		}
		if (typeof obj.showAnswer === 'function' || ['none','grid','mixed'].indexOf(obj._questionType) === -1) {
			rects.showAnswer = [obj.rect[0]+obj.rect[2]-85,top];
			top += 45;
			rects.showAnswer.push(75,35);
		}
				
		if (!un(rects.newQuestion)) {
			text({
				ctx:ctx,
				rect:rects.newQuestion,
				align:[0,0],
				text:['New'],
				fontSize:24,
				box:{type:'loose',borderColor:'#000',borderWidth:2,radius:5,color:'#CCC'}
			});			
			obj._cursorPositions.push({
				shape: 'rect',
				dims: rects.newQuestion,
				cursor: draw.cursors.pointer,
				func: draw.starterQuestion.newQuestion,
				obj: obj
			});
		}
		if (!un(rects.reset)) {
			text({	
				ctx:ctx,
				rect:rects.reset,
				align:[0,0],
				text:['Reset'],
				fontSize:24,
				color:'#000',
				box:{type:'loose',borderColor:'#000',borderWidth:2,radius:5,color:'#CCC'}
			});
			obj._cursorPositions.push({
				shape: 'rect',
				dims: rects.reset,
				cursor: draw.cursors.pointer,
				func: draw.starterQuestion.reset,
				obj: obj
			});
		}
		if (!un(rects.showAnswer)) {
			text({	
				ctx:ctx,
				rect:rects.showAnswer,
				align:[0,0],
				text:['Ans'],
				fontSize:24,
				color:'#000',
				box:{type:'loose',borderColor:'#000',borderWidth:2,radius:5,color:(obj._showingAnswer === true ? '#FFF' : '#CCC')}
			});
			obj._cursorPositions.push({
				shape: 'rect',
				dims: rects.showAnswer,
				cursor: draw.cursors.pointer,
				func: draw.starterQuestion.toggleAnswer,
				obj: obj
			});
		}
		if (!un(rects.options)) {
			var rect = rects.options;
			var val = !un(obj.params) && !un(obj.params[0]) ? obj.params[0] : obj.options[0];
			if (un(obj._optionsTable)) {
				obj._optionsTable = {
					type:'table2',
					text: {
						font: 'Arial',
						size: 24,
						color: '#000'
					},
					innerBorder:{show:false},
					outerBorder:{show:false}
				};
			}
			obj._optionsTable.left = rects.options[0];
			obj._optionsTable.top = rects.options[1];
			obj._optionsTable.widths = [rects.options[2]];
			obj._optionsTable.heights = [rects.options[3]];
			obj._optionsTable.cells = [[{text:[val],align:[-1,0],box:{type:'loose',borderColor:'#000',borderWidth:2,color:'#CCC'}}]];
						
			if (obj._optionsDropdownOpen === true && draw.mode !== 'edit') {
				var cells2 = obj.options.map(function(x) {
					return [{text:[String(x)],align:[0,0],box:{type:'loose',borderColor:'#000',borderWidth:2,color:'#CCC'}}];
				});
				obj._optionsTable.cells = obj._optionsTable.cells.concat(cells2);				
			}
			draw.table2.draw(ctx, obj._optionsTable, {obj:[obj._optionsTable]});
			for (var c = 0 ; c < obj._optionsTable.cells.length; c++) {
				var rect = obj._optionsTable.cells[c][0]._rect;
				if (c === 0) {
					ctx.fillStyle = '#000';
					ctx.lineJoin = 'round';
					ctx.lineCap = 'round';
					var t = rect[1] + rect[3] / 2;
					var s = 8;
					var l = rect[0] + rect[2] - 7 - s;
					ctx.beginPath();
					ctx.moveTo(l - s, t - s / 2);
					ctx.lineTo(l + s, t - s / 2);
					ctx.lineTo(l, t + s);
					ctx.lineTo(l - s, t - s / 2);
					ctx.fill();
				}
				obj._cursorPositions.push({
					shape: 'rect',
					dims: rect,
					cursor: draw.cursors.pointer,
					func: c === 0 ? draw.starterQuestion.toggleOptionsTable : draw.starterQuestion.setOptionValue,
					obj:obj,
					value:obj.options[c-1]
				});
			}
		}
		if (!un(rects.options2)) {
			var rect = rects.options2;
			var val = !un(obj.params) && !un(obj.params[1]) ? obj.params[1] : obj.options2[0];
			if (un(obj._options2Table)) {
				obj._options2Table = {
					type:'table2',
					text: {
						font: 'Arial',
						size: 24,
						color: '#000'
					},
					innerBorder:{show:false},
					outerBorder:{show:false}
				};
			}
			obj._options2Table.left = rects.options2[0];
			obj._options2Table.top = rects.options2[1];
			obj._options2Table.widths = [rects.options2[2]];
			obj._options2Table.heights = [rects.options2[3]];
			obj._options2Table.cells = [[{text:[val],align:[-1,0],box:{type:'loose',borderColor:'#000',borderWidth:2,color:'#CCC'}}]];
						
			if (obj._options2DropdownOpen === true && draw.mode !== 'edit') {
				var cells2 = obj.options2.map(function(x) {
					return [{text:[String(x)],align:[0,0],box:{type:'loose',borderColor:'#000',borderWidth:2,color:'#CCC'}}];
				});
				obj._options2Table.cells = obj._options2Table.cells.concat(cells2);				
			}
			draw.table2.draw(ctx, obj._options2Table, {obj:[obj._options2Table]});
			for (var c = 0 ; c < obj._options2Table.cells.length; c++) {
				var rect = obj._options2Table.cells[c][0]._rect;
				if (c === 0) {
					ctx.fillStyle = '#000';
					ctx.lineJoin = 'round';
					ctx.lineCap = 'round';
					var t = rect[1] + rect[3] / 2;
					var s = 8;
					var l = rect[0] + rect[2] - 7 - s;
					ctx.beginPath();
					ctx.moveTo(l - s, t - s / 2);
					ctx.lineTo(l + s, t - s / 2);
					ctx.lineTo(l, t + s);
					ctx.lineTo(l - s, t - s / 2);
					ctx.fill();
				}
				obj._cursorPositions.push({
					shape: 'rect',
					dims: rect,
					cursor: draw.cursors.pointer,
					func: c === 0 ? draw.starterQuestion.toggleOptions2Table : draw.starterQuestion.setOptionValue,
					obj:obj,
					paramsIndex:1,
					value:obj.options2[c-1]
				});
			}
		}
	},
	getRect:function(obj) {
		return obj.rect;
	},
	editModeDragStart:function(obj) {
		draw.starterQuestion.getPaths(obj);
		draw.drag = {
			obj:obj,
			initialMouse:clone(draw.mouse),
			initialPos:obj.rect.slice(0,2)
		};
		draw.animate(draw.starterQuestion.editModeDragMove,draw.starterQuestion.editModeDragStop,drawCanvasPaths);
	},
	editModeDragMove:function(e) {
		updateMouse(e);
		var obj = draw.drag.obj;
		var pos = vector.addVectors(draw.drag.initialPos,vector.getVectorAB(draw.drag.initialMouse,draw.mouse));
		pos[0] = Math.min(1200-obj.rect[2],Math.max(0,roundToNearest(pos[0]-22,1176/12)+22));
		pos[1] = Math.min(1700-obj.rect[3],Math.max(0,roundToNearest(pos[1]-24,676/20)+24));
		var dx = (Math.abs(pos[0]-obj.rect[0]) > 0.01) ? pos[0]-obj.rect[0] : 0;
		var dy = (Math.abs(pos[1]-obj.rect[1]) > 0.01) ? pos[1]-obj.rect[1] : 0;
		if ((dx !== 0 || dy !== 0) && draw.starterQuestion.checkSpaceForQuestion(pos,obj,draw.path)) {
			obj.rect[0] = pos[0];
			obj.rect[1] = pos[1];
			updateBorder(obj._path);
			for (var p = 0; p < obj._questionPaths.length; p++) {
				var path = obj._questionPaths[p];
				if (path === obj._path || path.obj.indexOf(obj) > -1) continue;
				repositionPath(path,dx,dy);
			}
		}
	},
	editModeDragStop:function() {
		delete draw.drag;
		draw.undo.saveState();
		changeDrawMode();
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		drawCanvasPaths();
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		if (dw !== 0) {
			if (un(obj._resizeWidth)) obj._resizeWidth = obj.rect[2];
			obj._resizeWidth += dw;
			obj.rect[2] = (Math.max(roundToNearest(obj._resizeWidth+20,1176/12),1176/12))-20;
		}
		if (dh !== 0) {
			if (un(obj._resizeHeight)) obj._resizeHeight = obj.rect[3];
			obj._resizeHeight += dh;
			obj.rect[3] = (Math.max(roundToNearest(obj._resizeHeight+20,676/20),676/20))-20;
		}
	},
	getCursorPositionsInteract: function (obj, pathNum) {
		return !un(obj._cursorPositions) ? obj._cursorPositions : [];
	},
	getCursorPositionsSelected: function (obj, pathNum) {
		if (draw.mode !== 'edit') return [];
		var cursorPositions = !un(obj._cursorPositionsEdit) ? obj._cursorPositionsEdit : [];
		cursorPositions.push({
			shape: 'rect',
			dims: clone(obj._tightRect),
			cursor: draw.cursors.text,
			func: textEdit.selectStart,
			obj: obj,
			pathNum: pathNum,
			highlight: -1
		});
		return cursorPositions;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		if (un(pathNum) || un(draw.path[pathNum])) return [];
		var obj = draw.path[pathNum].obj[0];
		
		buttons.push({
			shape: 'rect',
			dims: [x1+40, y1, 300, 20],
			cursor: draw.cursors.pointer,
			func: draw.starterQuestion.toggleDropMenuButtons,
			pathNum: pathNum,
			obj:obj,
			draw: function(path, ctx, l, t, w, h) {
				var obj = path.obj[0];
				var txt = 'id: '+(un(obj.starterQuestionID) ? '?' : obj.starterQuestionID) + (obj._questionType !== 'none' ? ' ('+obj._questionType+')' : '');
				text({ctx:ctx,rect:[l,t,w,h],text:[txt],align:[0,0],fontSize:16,box:{type:'loose',color:'#FFC',borderWidth:1,borderColor:'#000'}});
			}
		});
		
		if (obj._showDropMenuButtons === true) {
			var dropMenu = [{
				text:'save',
				color:'#CCF',
				func:draw.starterQuestionEdit.save,
				cursor:draw.cursors.pointer,
			},{
				text:'options',
				color:obj.options instanceof Array ? '#CCF' : '#FFF',
				func:draw.starterQuestionEdit.editOptions,
				cursor:draw.cursors.pointer,
			},{
				text:'params',
				color:obj.params instanceof Array && obj.params.length > 0 ? '#CCF' : '#FFF',
				func:draw.starterQuestionEdit.editParams,
				cursor:draw.cursors.pointer,
			},{
				text:'f(x) new',
				color:hasNewQuestion = typeof obj.newQuestion === 'function' && obj.newQuestion.toString() !== "function (path) {}" ? '#CCF' : '#FFF',
				func:draw.starterQuestionEdit.editNewQuestion,
				cursor:draw.cursors.pointer,
			},{
				text:'f(x) build',
				color:typeof obj.buildQuestion === 'function' && obj.buildQuestion.toString() !== "function (path) {}" ? '#CCF' : '#FFF',
				func:draw.starterQuestionEdit.editBuildQuestion,
				cursor:draw.cursors.pointer,
			},{
				text:'f(x) showAnswer',
				color:typeof obj.showAnswer === 'function' && obj.showAnswer.toString() !== "function (path) {}" ? '#CCF' : '#FFF',
				func:draw.starterQuestionEdit.editShowAnswer,
				cursor:draw.cursors.pointer,
			}]
			for (var m = 0; m < dropMenu.length; m++) {
				var menuItem = dropMenu[m];
				buttons.push({
					shape: 'rect',
					dims: [x1+40, y1+20*(m+1), 300, 20],
					cursor: menuItem.cursor,
					func: menuItem.func,
					pathNum: pathNum,
					obj:obj,
					draw: new Function("return function(path, ctx, l, t, w, h) {text({ctx:ctx,rect:[l,t,w,h],text:['"+menuItem.text+"'],align:[0,0],fontSize:16,box:{type:'loose',color:'"+menuItem.color+"',borderWidth:1,borderColor:'#000'}});}")()
				});
			}
		}
		
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
		
		return buttons;
	},
	
	toggleDropMenuButtons: function(obj) {
		if (un(obj)) obj = draw.currCursor.obj;
		obj._showDropMenuButtons = !obj._showDropMenuButtons;
		updateBorder(obj._path);
		drawCanvasPaths();
	},
	setFillColor:function(obj,color) {
		obj.box.color = color;
		obj.box.borderColor = color;
	},
	
	toggleOptionsTable: function() {
		var obj = draw.currCursor.obj;
		if (typeof obj._optionsDropdownOpen !== 'boolean') obj._optionsDropdownOpen = false;
		obj._optionsDropdownOpen = !obj._optionsDropdownOpen;
		if (obj._optionsDropdownOpen === true && obj._options2DropdownOpen === true) obj._options2DropdownOpen = false;
		drawCanvasPaths();
	},
	toggleOptions2Table: function() {
		var obj = draw.currCursor.obj;
		if (typeof obj._optionsDropdownOpen !== 'boolean') obj._options2DropdownOpen = false;
		obj._options2DropdownOpen = !obj._options2DropdownOpen;
		if (obj._optionsDropdownOpen === true && obj._options2DropdownOpen === true) obj._optionsDropdownOpen = false;
		drawCanvasPaths();
	},
	setOptionValue: function() {
		var obj = draw.currCursor.obj;
		obj._optionsDropdownOpen = false;
		obj._options2DropdownOpen = false;
		var paramsIndex = typeof draw.currCursor.paramsIndex === 'number' ? draw.currCursor.paramsIndex : 0;
		if (obj.params[paramsIndex] !== draw.currCursor.value && typeof obj.newQuestion === 'function') {
			obj.params[paramsIndex] = draw.currCursor.value;
			draw.starterQuestion.newQuestion();
		}
		drawCanvasPaths();
	},
	
	getParentPaths: function(obj) {
		if (!un(obj._parentPaths)) return obj._parentPaths;
		if (obj._resourceIndex === -1 || obj._pageIndex === -1) return [];
		if (un(obj._resourceIndex)) obj._resourceIndex = resourceIndex;
		if (un(obj._pageIndex)) obj._pageIndex = pIndex;
		//console.log(obj._resourceIndex, obj._pageIndex, obj._resourceIndex === resourceIndex && obj._pageIndex === pIndex);
		var page = file.resources[obj._resourceIndex].pages[obj._pageIndex];
		if (page.pageVis !== false && obj._resourceIndex === resourceIndex && obj._pageIndex === pIndex) {
			return draw.path;
		} else {
			return page.paths;
		}
	},
	getPaths:function(obj) {
		if (draw.mode !== 'edit' && !un(obj._questionPaths)) return obj._questionPaths;
		var parentPaths = draw.starterQuestion.getParentPaths(obj);
		obj._questionPaths = parentPaths.filter(function(x) {
			if (x === obj._path || x.obj.indexOf(obj) > -1 || x.obj[0].type === 'starterQuestion') return false;
			updateBorder(x);
			if (isPointInRect(x._center,obj.rect[0],obj.rect[1],obj.rect[2],obj.rect[3]) === false) return false;
			x._starterQuestion = obj;
			return true;
		});
		obj._questionObjs = [];
		for (var p = 0; p < obj._questionPaths.length; p++) {
			obj._questionObjs = obj._questionObjs.concat(obj._questionPaths[p].obj);
		}
		return obj._questionPaths;
	},	
	getInputTypes:function(obj) {
		if (draw.mode !== 'edit' && !un(obj._inputTypes)) return;		
		if (un(obj._questionPaths)) draw.starterQuestion.getPaths(obj);
		var inputs = draw.taskQuestion.getPathsInputTypes(obj._questionPaths);
		obj._inputs = inputs.inputs;
		obj._inputTypes = inputs.inputTypes;
		return obj._inputTypes;
	},
	getQuestionType:function(obj) {
		if (draw.mode !== 'edit' && !un(obj._questionType)) return obj._questionType;				
		draw.starterQuestion.getInputTypes(obj);
		obj._questionType = draw.taskQuestion.getQuestionType(obj);
		return obj._questionType;
	},
	
	getXPos:function(x) {
		if (typeof x === 'obj' && x.rect instanceof Array) x = x.rect[0];
		var xPos = draw.starterQuestion.xPos[0];
		var diff = Math.abs(x-xPos);
		for (var i = 1; i < draw.starterQuestion.xPos.length; i++) {
			var diff2 = Math.abs(x-draw.starterQuestion.xPos[i]);
			if (diff2 < diff) {
				xPos = draw.starterQuestion.xPos[i];
				diff = diff2;
			}
		}
		return xPos;
	},
	getYPos:function(y) {
		if (typeof y === 'obj' && y.rect instanceof Array) y = y.rect[1];
		var yPos = draw.starterQuestion.yPos[0];
		var diff = Math.abs(y-yPos);
		for (var i = 1; i < draw.starterQuestion.yPos.length; i++) {
			var diff2 = Math.abs(y-draw.starterQuestion.yPos[i]);
			if (diff2 < diff) {
				yPos = draw.starterQuestion.yPos[i];
				diff = diff2;
			}
		}
		return yPos;
	},
	xPos:[0,1,2,3,4,5,6,7,8,9,10,11].map(function(n) {return 22+n*(1176/12);}),
	yPos:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(function(n) {return 24+n*(676/20);}),
	widths:[0,1,2,3,4,5,6,7,8,9,10,11].map(function(n) {return (n+1)*1176/12-20;}),
	heights:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map(function(n) {return (n+1)*676/20-20;}),
	convertRect: function(rect) {
		if (rect[0] < draw.starterQuestion.xPos.length && rect[1] < draw.starterQuestion.yPos.length && rect[2] < draw.starterQuestion.widths.length && rect[3] < draw.starterQuestion.heights.length) {
			return [
				draw.starterQuestion.xPos[rect[0]],
				draw.starterQuestion.yPos[rect[1]],
				draw.starterQuestion.widths[rect[2]-1],
				draw.starterQuestion.heights[rect[3]-1]
			];
		} else {
			return [
				draw.starterQuestion.xPos.indexOf(rect[0]),
				draw.starterQuestion.yPos.indexOf(rect[1]),
				draw.starterQuestion.widths.indexOf(rect[2])+1,
				draw.starterQuestion.heights.indexOf(rect[3])+1
			];
		}
	},

	checkSpaceForQuestion: function(pos,obj,parentPaths) {
		var rect = [pos[0],pos[1],obj.rect[2],obj.rect[3]];
		if (rect[0]+rect[2] > 1200 || rect[1]+rect[3] > 1700) return false;
		if (un(parentPaths)) parentPaths = draw.path;
		for (var p = 0; p < parentPaths.length; p++) {
			var path = parentPaths[p];
			if (path === obj._path || (!un(obj._questionPaths) && obj._questionPaths.indexOf(path) > -1)) continue;
			updateBorder(path);
			if (hitTestTwoRects(rect,path.tightBorder) === true) return false;
		}
		return true;
	},
	findSpaceForQuestion: function(obj,parentPaths) {
		if (un(parentPaths)) parentPaths = draw.path;
		for (var j = 0; j < draw.starterQuestion.yPos.length; j++) {
			var y = draw.starterQuestion.yPos[j];
			for (var i = 0; i < draw.starterQuestion.xPos.length; i++) {
				var x = draw.starterQuestion.xPos[i];
				if (draw.starterQuestion.checkSpaceForQuestion([x,y],obj,parentPaths) === true) return [x,y];
			}
		}
		return false;
	},
	
	drawButton: function (ctx, size) {
		text({ctx:ctx,rect:[0.2*size,0.2*size,0.6*size,0.6*size],align:[0,0],fontSize:0.5*size,text:['S'],box:{type:'loose',borderColor:'#000'}});
	},
	newQuestion: function() {
		var obj = draw.currCursor.obj;
		if (obj._showingAnswer === true) draw.starterQuestion.unshowAnswer(obj);
		draw.starterQuestion.restoreState(obj,'_initialState');
		if (typeof obj.newQuestion === 'function') obj.newQuestion(obj);
		if (typeof obj.buildQuestion === 'function') obj.buildQuestion(obj);
		draw.starterQuestion.initialise(obj);
		drawCanvasPaths();
	},
	toggleAnswer: function() {
		var obj = draw.currCursor.obj;
		if (obj._showingAnswer === true) {
			draw.starterQuestion.unshowAnswer(obj);
		} else {
			draw.starterQuestion.showAnswer(obj);
		}
	},
	
	dragButtonStart: function(e) {
		updateMouse(e);
		draw._drag = {
			obj:draw.currCursor.obj,
			buttonRect:draw.currCursor.dims,
			offset:vector.getVectorAB(draw.currCursor.dims.slice(0,2),draw.mouse),
			key:draw.currCursor.key
		};
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.animate(draw.starterQuestion.dragButtonMove,draw.starterQuestion.dragButtonStop,drawCanvasPaths);
	},
	dragButtonMove: function(e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var offset = draw._drag.offset;
		var buttonRect = draw._drag.buttonRect;
		var x = Math.max(10,Math.min(obj.rect[2]-buttonRect[2]-10,draw.mouse[0]-offset[0]-obj.rect[0]));
		var y = Math.max(10,Math.min(obj.rect[3]-buttonRect[3]-10,draw.mouse[1]-offset[1]-obj.rect[1]));
		obj[draw._drag.key] = [x,y];
	},
	dragButtonStop: function(e) {
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
	},	
	initialise: function(obj,params) {
		draw.starterQuestion.getQuestionType(obj);
		for (var p = 0; p < obj._questionPaths.length; p++) {
			var path = obj._questionPaths[p];
			if (!un(path.appear) && path.appear.startVisible !== true) path._visible = false;
		}
		drawPathsToCanvas(draw.hiddenCanvas,obj._questionPaths);
		if (typeof params === 'string' && params !== '') {
			try {
				obj.params = JSON.parse(params);
			} catch(e) {
				console.log('failed to load starter question params',obj,params);
			}
			//console.log('initialise',obj);
			if (typeof obj.buildQuestion === 'function') obj.buildQuestion(obj);
		}
		draw.starterQuestion.enable(obj);
		delete obj._showingAnswer;
		draw.starterQuestion.saveState(obj,'_initialState');
		drawCanvasPaths();
		drawCanvasPaths();
	},
	reset:function(obj) {
		var obj = draw.currCursor.obj;
		draw.starterQuestion.restoreState(obj,'_initialState');
		draw.starterQuestion.initialise(obj);
	},
	showAnswer: function(obj) {
		draw.starterQuestion.getQuestionType(obj);
		draw.starterQuestion.saveState(obj,'_savedState');
		var type = obj._questionType;
		if (typeof obj.showAnswer === 'function') {
			obj.showAnswer(obj);
		} else if (type !== 'mixed' && !un(draw.taskQuestion[type]) && !un(draw.taskQuestion[type].showAnswerMode)) {
			draw.taskQuestion[type].showAnswerMode(obj);
		} else {
			var paths = obj._questionPaths;
			for (var p = 0; p < paths.length; p++) {
				var path = paths[p];
				if (typeof path.appear === 'object' && path.appear.startVisible !== true) path._vis = true;
				for (var o = 0; o < path.obj.length; o++) {
					var obj2 = path.obj[o];
					if (typeof obj2.appear === 'object' && obj2.appear.startVisible !== true) obj2.visible = true;
				}
			}
		}
		draw.starterQuestion.disable(obj);
		obj._showingAnswer = true;
		drawCanvasPaths();
	},
	unshowAnswer: function(obj) {
		draw.starterQuestion.restoreState(obj,'_savedState');
		obj._showingAnswer = false;
		drawCanvasPaths();
	},
	disable: function(obj) {
		for (var o = 0; o < obj._questionObjs.length; o++) {
			var obj2 = obj._questionObjs[o];
			if (!un(obj2.interact)) obj2.interact._disabled = true;
			if (['tracingPaper','compass2','ruler2','protractor2'].indexOf(obj2.type) > -1) obj2._disabled = true;
			if (!un(obj2._path)) {
				if (!un(obj2._path.isInput)) obj2._path.isInput._disabled = true;
				if (!un(obj2._path.interact)) obj2._path.interact._disabled = true;
			}
		}
	},
	enable: function(obj) {
		for (var o = 0; o < obj._questionObjs.length; o++) {
			var obj2 = obj._questionObjs[o];
			if (!un(obj2.interact)) delete obj2.interact._disabled;
			if (['tracingPaper','compass2','ruler2','protractor2'].indexOf(obj2.type) > -1) delete obj2._disabled;
			if (!un(obj2._path)) {
				if (!un(obj2._path.isInput)) delete obj2._path.isInput._disabled;
				if (!un(obj2._path.interact)) delete obj2._path.interact._disabled;
			}
		}
	},
	
	saveState: function(obj,key) {
		if (un(key)) key = '_savedState';
		draw.starterQuestion.getPaths(obj);
		obj[key] = [];
		for (var p = 0; p < obj._questionPaths.length; p++) {
			var path = obj._questionPaths[p];
			obj[key].push(draw.clone(path,true));
		}
	},
	restoreState: function(obj,key) {
		if (un(key)) key = '_savedState';
		if (un(obj[key])) return;
		draw.starterQuestion.getPaths(obj);
		var parentPaths = draw.starterQuestion.getParentPaths(obj);
		for (var p = 0; p < obj._questionPaths.length; p++) {
			var path = obj._questionPaths[p];
			var index = parentPaths.indexOf(path);
			if (index > -1) parentPaths.splice(index,1);
		}
		for (var p = 0; p < obj[key].length; p++) {
			parentPaths.push(obj[key][p]);
		}
		delete obj._inputTypes;
		delete obj._inputs;
		delete obj._questionPaths;
		delete obj._questionObjs;
		delete obj._questionType;
		draw.starterQuestion.getQuestionType(obj);
		if (obj._pageIndex === pIndex && obj._resourceIndex === resourceIndex) drawCanvasPaths();
	},
	
	getByID:function(obj,id) {
		var paths = draw.starterQuestion.getPaths(obj);
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			if (path.id === id) return path;
			for (var o = 0; o < path.obj.length; o++) {
				var obj2 = path.obj[o];
				if (obj2.id === id) return obj2;
			}
		}
		return false;
	},
	getByType:function(obj,type) {
		var paths = draw.starterQuestion.getPaths(obj);
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj2 = path.obj[o];
				if (obj2.type === type) return obj2;
			}
		}
		return false;
	},
	
	load:function(qInfo,callback) {
		if (qInfo.x < draw.starterQuestion.xPos.length) qInfo.x = draw.starterQuestion.xPos[qInfo.x];
		if (qInfo.y < draw.starterQuestion.yPos.length) qInfo.y = draw.starterQuestion.yPos[qInfo.y];
		if (un(qInfo.resourceIndex)) qInfo.resourceIndex = 0;
		if (un(qInfo.pageIndex)) qInfo.pageIndex = 0;
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.qInfo = qInfo;
		xmlHttp.open("get", "starterQuestions/"+qInfo.starterQuestionID+".json", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				if (typeof this.errorCallback == 'function') this.errorCallback();
				return;
			}
			var data = JSON.parse(this.responseText);
			var qInfo = this.qInfo;
			draw.starter.reviveFunctions(data);
			var obj = data.path.obj[0];
			obj._path = data.path;
			obj._resourceIndex = qInfo.resourceIndex;
			obj._pageIndex = qInfo.pageIndex;
			if (typeof qInfo.parentPaths === 'object') obj._parentPaths = qInfo.parentPaths;
			obj.starterQuestionID = qInfo.starterQuestionID;
			obj.savedFileData = this.responseText;
			obj.rect[0] = qInfo.x;
			obj.rect[1] = qInfo.y;
			if (qInfo.questionNum >= 1) {
				obj.text.unshift(Math.round(qInfo.questionNum)+'. ');
				simplifyText(obj.text);
			}
			if (typeof qInfo.color === 'string' && qInfo.color !== '') obj.box.color = qInfo.color;
			if (obj.box.color.toLowerCase() === '#ccf') obj.box.color = '#ddf';
			if (obj.box.color.toLowerCase() === '#fcc') obj.box.color = '#fdd';
			if (obj.box.color.toLowerCase() === '#cfc') obj.box.color = '#dfd';
			var paths = [data.path];
			updateBorder(data.path);
			for (var p = 0; p < data.questionPaths.length; p++) {
				var path = data.questionPaths[p];
				repositionPath(path,qInfo.x,qInfo.y);
				paths.push(path);
			}
		
			if (typeof callback === 'function') {
				callback(paths);
			} else {
				if (un(file.resources[obj._resourceIndex]) || un(file.resources[obj._resourceIndex].pages[obj._pageIndex])) return;
				var page = file.resources[obj._resourceIndex].pages[obj._pageIndex];
				var isCurrentPage = obj._pageIndex === pIndex && obj._resourceIndex === resourceIndex;
				for (var p = 0; p < paths.length; p++) {
					page.paths.push(paths[p]);
					updateBorder(paths[p]);
					//if (isCurrentPage === true) draw.path.push(paths[p]);
				}
				
				draw.starterQuestion.initialise(obj,qInfo.params);
				if (page.pageVis === false) draw.starter.drawPageUnverified(page);
			}
			if (!un(togglePageAppearButtonsButton) && typeof togglePageAppearButtonsButton.draw === 'function') togglePageAppearButtonsButton.draw();			
		}
		xmlHttp.send();
	},
}

draw.video = {
	resizable:true,
	default:{
		type: 'video',
		rect: [0, 0, 555, 380],
		youtubeID: '3jpxLfkx2qI'
	},
	add: function() {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = clone(draw.video.default);
		obj._page = file.resources[resourceIndex].pages[pIndex];
		obj.rect = [center[0]-obj.rect[2]/2, center[1]-obj.rect[3]/2, obj.rect[2], obj.rect[3]];
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw:function(ctx,obj,path) {
		if (un(obj._page) || obj._page !== file.resources[resourceIndex].pages[pIndex]) return;
		if (un(path) || draw.path.indexOf(path) === -1) return;
		if (draw.task.printMode === true) {
			text({
				ctx:ctx,
				rect:[obj.rect[0], obj.rect[1], obj.rect[2], obj.rect[3]],
				text:['Video'],
				italic:true,
				color:'#000',
				fontSize:20,
				align:[0,0],
				box:{type:'loose',color:'none',borderColor:'#000',borderWidth:1}
			});
			return;
		}
		text({
			ctx:ctx,
			rect:[obj.rect[0], obj.rect[1], obj.rect[2], obj.rect[3]],
			text:['Loading video...'],
			italic:true,
			color:'#FFF',
			fontSize:20,
			align:[0,0],
			box:{type:'loose',color:'#000',borderColor:'#000',borderWidth:0.01}
		});
		if (!un(obj._page._nodes)) {
			for (var n = 0; n < obj._page._nodes.length; n++) {
				var node = obj._page._nodes[n];
				if (node.youtubeID === obj.youtubeID || node.vimeoID === obj.vimeoID) return;
			}
		}
		if (un(obj._video)) draw.video.loadVideo(obj,path);
		obj._video.style.pointerEvents = draw.mode === 'edit' ? 'none' : 'auto';
		draw.video.updateVideoPos(obj);
	},
	getRect: function (obj) {
		return obj.rect;
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		obj.rect[3] += dh;
		if (!un(obj._video)) draw.video.updateVideoPos(obj);
	},
	updateVideoPos: function(obj) {
		obj._video.style.left = (100*obj.rect[0]/1200)+'%';
		obj._video.style.top = (100*obj.rect[1]/1700)+'%';
		obj._video.style.width = (100*obj.rect[2]/1200)+'%';
		obj._video.style.height = (100*obj.rect[3]/1700)+'%';
	},
	drawButton: function (ctx, size, type) {
		var obj = clone(draw.video.default);
		text({
			ctx: ctx,
			align: [0, 0],
			rect: [0, 0, size, size],
			text: ['<<fontSize:' + (size / 3) + '>>video']
		});
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			shape: 'rect',
			dims: [(x1+x2)/2-30, y1, 60, 20],
			cursor: draw.cursors.pointer,
			func: draw.video.setVideoID,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = '#CCF';
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					fontSize:14,
					text: ['videoID']
				});
				
			}
		});
		return buttons;
	},
	setVideoID: function() {		
		var path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		var txt = prompt('YouTubeID,VimeoID',(!un(obj.youtubeID) ? obj.youtubeID : 'xxxxxx')+','+(!un(obj.vimeoID) ? obj.vimeoID : 'xxxxxx'));
		if (typeof txt !== 'string' || txt === '') return;
		var videoIDs = txt.split(txt,',');
		obj.youtubeID = !un(videoIds[0]) ? videoIds[0].trim() : '';
		obj.vimeoID = !un(videoIds[1]) ? videoIds[1].trim() : '';
		drawCanvasPaths();
	},
	loadVideo: function(obj,path) {
		obj._video = document.createElement('iframe');
		obj._video.youtubeID = obj.youtubeID;
		obj._video.vimeoID = obj.vimeoID;
		//var z = Number(draw.drawCanvas[2].style.zIndex)-1;
		obj._video.style.zIndex = 500;
		obj._video.style.position = 'relative';
		obj._video.setAttribute('allowfullscreen', "1");
		obj._video.setAttribute('frameborder', "0");
		obj._video.obj = obj;

		obj._video.src = videoSource === 'youtube' ? '//www.youtube.com/embed/'+obj.youtubeID+'?modestbranding=1' : '//player.vimeo.com/video/'+obj.vimeoID;

		obj._video._pageNode = true;
		draw.div.childNodes[0].appendChild(obj._video);
		if (un(obj._page._nodes)) obj._page._nodes = [];
		obj._page._nodes.push(obj._video);
		
		/*yt.load(obj);
		console.log(obj);*/
		
	},
	/*getCursorPositionsInteract: function(obj) {
		var pos = [];
		pos.push({shape:'rect',dims:obj.rect,cursor:draw.cursors.default,func:draw.video.playPauseVideo,obj:obj});
		return pos;
	},
	playPauseVideo: function() {
		var obj  = draw.currCursor.obj;
		if (!un(obj._player)) {
			var state = obj._player.getPlayerState();
			if (state === 1) {
				obj._player.pauseVideo();
			} else {
				obj._player.playVideo();
			}
		}
	}*/
}
draw.dropMenu2 = { // draws on own overlay canvas
	default:{
		type: 'dropMenu2',
		left: 700,
		top: 50,
		rect: [0,0,400,40],
		padding: 2,
		align: [0, 0],
		fontSize: 24,
		box: {
			type: 'loose',
			color: '#99F',
			borderColor: '#000',
			borderWidth: 3
		},
		optionBox: {
			color: '#CCF',
			lineWidth: 2,
			align: [0, 0]
		},
		showDownArrow: true,
		downArrowSize: 12,
		scrollSize: 12,
		zIndex: 600,
		_pageIndex: 0,
		_open: false,
		onchange: function () {},
		options: [
			{text:['Option 0'],value:0},
			{text:['Option 1'],value:1},
			{text:['Option 2'],value:2}
		],
		text: ['Option 0'],
		value: 0
	},
	add:function(obj) {
		deselectAllPaths();
		var obj2 = clone(this.default);
		if (!un(obj)) {
			for (var key in obj) {
				if (obj.hasOwnProperty(key) === false) continue;
				obj2[key] = obj[key];
			}
		}
		var path = {obj:[obj2],selected:true};
		updateBorder(path);
		draw.path.push(path);
		
	},
	draw:function(ctx,obj,path) {
		if (un(obj._canvas)) draw.dropMenu2.buildCanvas(obj);
		
		var pageIndex = obj._pageIndex || 0;
		if (obj.visible === false || pIndex !== pageIndex) {
			if (!un(obj._canvas.parentNode)) {
				obj._canvas.parentNode.removeChild(obj._canvas);
			}
		} else {
			if (un(obj._canvas.parentNode)) {
				draw.div.childNodes[0].appendChild(obj._canvas);
			}
		}
		
		var height = obj._open === false ? obj.rect[3] : (un(obj.scrollSize) || obj.options.length <= obj.scrollSize) ? obj.rect[3] * (obj.options.length+1) : obj.rect[3] * (obj.scrollSize+1);
		var padding = !un(obj.padding) ? obj.padding : 2;
		var z = !un(obj.zIndex) ? obj.zIndex : 600;
		
		obj._canvas.style.zIndex = z;
		obj._canvas.style.left = (100*(obj.left-padding)/1200)+'%';
		obj._canvas.style.top = (100*(obj.top-padding)/1700)+'%';
		obj._canvas.style.width = (100*(obj.rect[2]+2*padding)/1200)+'%';
		obj._canvas.style.height = (100*(height+2*padding)/1700)+'%';
		obj._canvas.width = obj.rect[2]+2*padding;
		obj._canvas.height = height+2*padding;
		obj.rect[0] = padding;
		obj.rect[1] = padding;
		draw.dropMenu.draw(obj._ctx,obj);
	},
	buildCanvas:function(obj) {
		if (!un(obj._canvas)) return;
		obj._canvas = document.createElement('canvas');
		obj._ctx = obj._canvas.getContext('2d');
		obj._canvas.style.position = 'absolute';
		obj._canvas.style.pointerEvents = 'auto';
		obj._canvas.style.cursor = 'pointer';
		obj._canvas.style.outline = 'none';
		obj._canvas.tabIndex = 999; // allows onblur to work
		obj._canvas._pageNode = true;
		obj._canvas.obj = obj;
		var pageIndex = !un(obj._pageIndex) ? obj._pageIndex : pIndex;
		var page = pages[pageIndex];
		if (un(page._nodes)) page._nodes = [];
		page._nodes.push(obj._canvas);
		//draw.div.childNodes[0].appendChild(obj._canvas);

		obj._canvas.onmousedown = function(e) {
			updateMouse(e);
			e.target.focus();
			var obj = e.target.obj;
			if (obj._open === false) {
				obj._open = true;
			} else {
				var pos = [draw.mouse[0]-obj.left,draw.mouse[1]-obj.top];
				if (pos[1] < obj.height) {
					obj._open = false;
				} else if (!un(obj._scrollObj) && pos[0] >= obj.rect[2] - obj._scrollObj.width) {
					for (var p = 0; p < obj._scrollObj._cursorPositions.length; p++) {
						var cursorPos = obj._scrollObj._cursorPositions[p];
						if (cursorPos.dims[1] < pos[1] && pos[1] < cursorPos.dims[1]+cursorPos.dims[3]) {
							draw.currCursor = {obj:obj._scrollObj};
							draw.verticalScrollbar[cursorPos.func.name]();
							break;
						}
					}
				} else {
					var scrollValue = !un(obj._scrollObj) ? obj._scrollObj.value : 0; 
					var index = scrollValue + Math.floor((pos[1] - obj.rect[3])/obj.rect[3]);
					if (!un(obj.options[index])) {
						var option = obj.options[index];
						obj.value = option.value;
						obj._selectedOption = option;
						if (!un(option.text)) obj.text = clone(option.text);
						if (typeof obj.onchange === 'function') obj.onchange(obj);
					}
					obj._open = false;
				}
			}
			obj._draw();
		}
		obj._canvas.ontouchstart = obj._canvas.onmousedown;
		obj._canvas.onwheel = function(e) {
			var obj = e.target.obj;
			if (obj._open === true && !un(obj.scrollSize) && !un(obj._scrollObj) && obj.options.length > obj.scrollSize) {
				var scrollObj = obj._scrollObj;
				var dy = Math.ceil(e.deltaY/250);
				scrollObj.value = Math.max(0,Math.min(scrollObj.scrollMax-scrollObj.scrollView,scrollObj.value+dy));
				obj._draw();
				e.stopPropagation();
				e.preventDefault();
			}
		}
		obj._canvas.onblur = function(e) {
			var obj = e.target.obj;
			if (obj._open === true) {
				obj._open = false;
				obj._draw();
			}
		}
	},
	getRect: function(obj) {
		return [obj.left,obj.top,obj.rect[2],obj.rect[3]];
	}, 
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.left += dl;
		obj.top += dt;
		obj.rect[2] += dw;
		if (obj._open == true) dh /= (obj.options.length + 1);
		obj.rect[3] += dh;
	}
}
draw.pieChart2 = {
	resizable: true,
	add: function () {
		deselectAllPaths(false);
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'pieChart2',
					center: [center[0]-50,center[1]-50],
					radius: 200,
					angles: [3*Math.PI/2, (2 / 3) * Math.PI-Math.PI/2, (1 / 1) * Math.PI-Math.PI/2, (8 / 5) * Math.PI-Math.PI/2],
					labels: ['football', 'tennis', 'netball', 'hockey'],
					colors: ['#CCF','#FCC','#CFC','#FFC'],
					fontSize:28,
					showAngles:true,
					interact:{type:'pieChart'}
				}
			],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	draw: function (ctx, obj, path) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 3

		obj._pos = [];
		obj._sectorAngles = [];
		var angleSum = 0;
		for (var a = 0; a < obj.angles.length; a++) {
			var angle = obj.angles[a];
			obj._pos[a] = [obj.center[0] + obj.radius * Math.cos(angle), obj.center[1] + obj.radius * Math.sin(angle)];
		}
		for (var a = 0; a < obj.colors.length; a++) {
			var color = obj.colors[a];
			if (color === '') continue;
			var pos = obj._pos[a];
			var angle = obj.angles[a];
			var next = obj.angles[(a + 1) % obj.angles.length];
			ctx.beginPath();
			ctx.moveTo(obj.center[0], obj.center[1]);
			ctx.lineTo(pos[0], pos[1]);
			ctx.arc(obj.center[0], obj.center[1], obj.radius, angle, next);
			ctx.lineTo(obj.center[0], obj.center[1]);
			ctx.fillStyle = obj.colors[a];
			ctx.fill();
		}
		for (var a = 0; a < obj.angles.length; a++) {
			ctx.beginPath();
			ctx.moveTo(obj.center[0], obj.center[1]);
			ctx.lineTo(obj._pos[a][0], obj._pos[a][1]);
			ctx.stroke();
			
			var pos = obj._pos[a];
			var next = obj._pos[(a + 1) % obj._pos.length];
			if (a === obj.angles.length - 1) {
				obj._sectorAngles[a] = 360 - angleSum;
			} else {
				obj._sectorAngles[a] = Math.round((180/Math.PI)*measureAngle({a:pos,b:obj.center,c:next}));
			}
			angleSum += obj._sectorAngles[a];
		}
		ctx.beginPath();
		ctx.arc(obj.center[0], obj.center[1], obj.radius, 0, 2 * Math.PI);
		ctx.stroke();

		if (obj.showAngles === true) {
			for (var a = 0; a < obj.angles.length; a++) {
				var pos = obj._pos[a];
				var next = obj._pos[(a + 1) % obj._pos.length];
				var angle = obj._sectorAngles[a];
				var forceRightAngle = angle === 90 ? true : false;
				var label = angle === 90 ? [''] : [String(angle)+degrees];
				drawAngle({a:pos,b:obj.center,c:next,ctx:ctx,drawLines:false,radius:25,lineColor:'#000',label:label,labelFontSize:25,labelRadius:33,labelColor:'#000',lineWidth:2,forceRightAngle:forceRightAngle});
			}
		}

		for (var a = 0; a < obj.labels.length; a++) {
			var label = obj.labels[a];
			if (un(label) || label === '') continue;
			var a1 = obj.angles[a];
			var a2 = obj.angles[(a + 1) % obj.angles.length];
			while (a2 < a1) a2 += 2*Math.PI;
			var midAngle = (a1+a2)/2;
			var labelCenter = [obj.center[0]+0.85*obj.radius*Math.cos(midAngle),obj.center[1]+0.85*obj.radius*Math.sin(midAngle)];
			text({ctx:ctx,rect:[labelCenter[0]-100,labelCenter[1]-100,200,200],align:[0,0],fontSize:obj.fontSize,text:[label],box:{type:'tight',color:'#FFF',borderColor:'#000',borderWidth:2,radius:10}});
		}
		
		if (!un(obj.interact) && obj.interact.type === 'pieChart' && obj.interact.disabled !== true && obj.interact._disabled !== true) {
			for (var a = 0; a < obj._pos.length; a++) {
				var pos = obj._pos[a];
				ctx.beginPath();
				ctx.fillStyle = '#F00';
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#000';
				ctx.arc(pos[0],pos[1],10,0,2*Math.PI);
				ctx.fill();
				ctx.stroke();
			}
		}
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
	getCursorPositionsSelected: function (obj, pathNum) {
		if (un(obj)) obj = draw.path[pathNum].obj[0];
		var pos = [];
		if (!un(obj._pos)) {
			for (var a = 0; a < obj._pos.length; a++) {
				var pos2 = obj._pos[a];
				pos.push({
					shape: 'circle',
					dims: [pos2[0], pos2[1], 10],
					cursor: draw.cursors.pointer,
					func: draw.pieChart2.startPointDrag,
					pathNum: pathNum,
					index: a,
					obj:obj
				});
			}
		}
		return pos;
	},
	getCursorPositionsInteract: function (obj, pathNum) {
		if (un(obj)) obj = draw.path[pathNum].obj[0];
		var pos = [];
		if (!un(obj._pos) && !un(obj.interact) && obj.interact.type === 'pieChart' && obj.interact.disabled !== true && obj.interact._disabled !== true) {
			for (var a = 0; a < obj._pos.length; a++) {
				var pos2 = obj._pos[a];
				pos.push({
					shape: 'circle',
					dims: [pos2[0], pos2[1], 10],
					cursor: draw.cursors.pointer,
					func: draw.pieChart2.startPointDrag,
					pathNum: pathNum,
					index: a,
					obj:obj
				});
			}
		}
		return pos;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		buttons.push({
			buttonType: 'anglesAroundPoint-pointsMinus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 40, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.pieChart2.pointsMinus,
			pathNum: pathNum
		});
		buttons.push({
			buttonType: 'anglesAroundPoint-pointsPlus',
			shape: 'rect',
			dims: [x2 - 20, y2 - 60, 20, 20],
			cursor: draw.cursors.pointer,
			func: draw.pieChart2.pointsPlus,
			pathNum: pathNum
		});
		buttons.push({
			shape: 'rect',
			dims: [x1 + 20, y2-20, 100, 20],
			cursor: draw.cursors.pointer,
			func: draw.pieChart2.editColors,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				text({ctx:ctx,text:['colours...'],rect:[l,t,w,h],align:[0,0],fontSize:h,box:{type:'loose',color:'#FFC',borderColor:'#FFC'}})
			}
		});
		buttons.push({
			shape: 'rect',
			dims: [x2 - 120, y2-20, 100, 20],
			cursor: draw.cursors.pointer,
			func: draw.pieChart2.editLabels,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				text({ctx:ctx,text:['labels...'],rect:[l,t,w,h],align:[0,0],fontSize:h,box:{type:'loose',color:'#FFC',borderColor:'#FFC'}})
			}
		});
		return buttons;
	},
	
	startPointDrag: function () {
		changeDrawMode('pieChart2PointDrag');
		var obj = draw.currCursor.obj;
		var index = draw.currCursor.index;
		var prev = index === 0 ? obj.angles.last() : obj.angles[index-1];
		var next = obj.angles[(index+1)%obj.angles.length];
		draw._drag = {
			obj:obj,
			index:index,
			prev:prev,
			next:next
		}
		draw.animate(draw.pieChart2.pointMove,draw.pieChart2.pointStop,drawCanvasPaths);				
	},
	pointMove: function (e) {
		updateMouse(e);
		var obj = draw._drag.obj;
		var index = draw._drag.index;
		var prev = draw._drag.prev;
		var next = draw._drag.next;
		var angle = roundToNearest(getAngleFromAToB(obj.center, draw.mouse), 0.001);
		if (next > prev) {
			angle = Math.max(Math.min(angle,next),prev);			
		} else {
			if (angle > next && angle < prev) {
				angle = (angle-next < prev-angle) ? next : prev;
			}
		}
		obj.angles[index] = angle;
	},
	pointStop: function (e) {
		delete draw._drag;
		changeDrawMode();
	},

	pointsMinus: function (path) {
		if (un(path)) path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		if (obj.angles.length > 2) {
			obj.angles.pop();
			obj.colors.pop();
			obj.labels.pop();
			drawCanvasPaths();
		}
	},
	pointsPlus: function (path) {
		if (un(path)) path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		var angle = (obj.angles.last() + 1.5 * Math.PI) / 2;
		obj.angles.push(angle);
		obj.colors.push('#'+['f','c'].ran()+['f','c'].ran()+['f','c'].ran());
		obj.labels.push('');
		drawCanvasPaths();
	},
	
	editLabels: function(path) {
		if (un(path)) path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		var newLabels = prompt('enter labels, separated with commas',obj.labels.join(','));
		if (typeof newLabels === 'string' && newLabels !== '') {
			newLabels = newLabels.split(',');
			if (newLabels.length !== obj.angles.length) {
				alert('incorrect number of labels');
				return;
			}
			obj.labels = newLabels;
			drawCanvasPaths();
		}
	},
	editColors: function(path) {
		if (un(path)) path = draw.path[draw.currCursor.pathNum];
		var obj = path.obj[0];
		var newColors = prompt('enter colours, separated with commas',obj.colors.join(','));
		if (typeof newColors === 'string' && newColors !== '') {
			newColors = newColors.split(',');
			if (newColors.length !== obj.angles.length) {
				alert('incorrect number of colours');
				return;
			}
			obj.colors = newColors;
			drawCanvasPaths();
		}
	}
}
draw.analogClock = {
	resizable:true,
	default:{
		type: 'analogClock',
		center: [300,300],
		radius: 200,
		color:'#000',
		face: {
			fillColor:'none',
			rim:{
				width:0.04
			},
			pips:{
				'1':{
					width:0.015,
					len:0.07
				},
				'5':{
					width:0.03,
					len:0.1
				},
				'15':{
					width:0.03,
					len:0.1
				}
			},
			numbers:{
				show:'all', //'none', 'all', 'quarters'
				roman:false,
				relFontSize:0.23,
				offset:0.76,
				font:'Arial'
			}
		},
		time: [3,30,0],
		hours: {
			show:true,
			radius:0.3,
			width:0.1,
			color:'#000'
		},
		minutes: {
			show:true,
			radius:0.55,
			width:0.075,
			color:'#000'
		},
		seconds: {
			show:false,
			radius:0.75,
			width:0.025,
			color:'#000'
		}
	},
	add: function() {
		deselectAllPaths();
		var center = draw.getViewCenter();
		var obj = clone(draw.analogClock.default);
		obj._page = file.resources[resourceIndex].pages[pIndex];
		obj.center = draw.getViewCenter();
		draw.path.push({
			obj: [obj],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	draw:function(ctx,obj,path) {
		var c = obj.center;
		var r = obj.radius;
		ctx.save();
		ctx.strokeStyle = !un(obj.color) ? obj.color : '#000';
		//ctx.lineJoin = 'round';
		//ctx.lineCap = 'round';
		var face = obj.face;
		if (!un(face.rim) && face.rim.width !== 0) {
			ctx.beginPath();
			ctx.lineWidth = face.rim.width*r;
			ctx.arc(c[0],c[1],r,0,2*Math.PI);
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.fillStyle = !un(obj.color) ? obj.color : '#000';
		ctx.arc(c[0],c[1],0.06*r,0,2*Math.PI);
		ctx.fill();
		var numbers = face.numbers.roman === true ? ['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'] : [12,1,2,3,4,5,6,7,8,9,10,11];
		for (var i = 0; i < 60; i++) {
			var a = i*Math.PI/30-Math.PI/2;
			var len = 0;
			if (i%15 === 0 && face.pips['15'].len !== 0 && face.pips['15'].width !== 0) {
				len = face.pips['15'].len;
				ctx.lineWidth = face.pips['15'].width*r;
			} else if (i%5 === 0 && face.pips['5'].len !== 0 && face.pips['5'].width !== 0) {
				len = face.pips['5'].len;
				ctx.lineWidth = face.pips['5'].width*r;
			} else if (face.pips['1'].len !== 0 && face.pips['1'].width !== 0) {
				len = face.pips['1'].len;
				ctx.lineWidth = face.pips['1'].width*r;
			}
			if (len !== 0) {
				ctx.beginPath();
				ctx.moveTo(c[0]+r*Math.cos(a),c[1]+r*Math.sin(a));
				ctx.lineTo(c[0]+(1-len)*r*Math.cos(a),c[1]+(1-len)*r*Math.sin(a));
				ctx.stroke();
			}
			if ((face.numbers.show === 'all' && i%5 === 0) || (face.numbers.show === 'quarters' && i%15 === 0)) {
				var num = numbers[Math.round(i/5)];
				var offset = face.numbers.offset;
				if ([10,11].indexOf(num) > -1) offset -= 0.015;
				var pos = [c[0]+offset*r*Math.cos(a),c[1]+offset*r*Math.sin(a)];
				text({ctx:ctx,text:[String(num)],rect:[pos[0]-50,pos[1]-50,100,100],align:[0,0],font:face.numbers.font,fontSize:face.numbers.relFontSize*r});
			}
		}
		var hands = ['hours','minutes','seconds'];
		var h = obj.time[0];
		var m = obj.time[1];
		var s = obj.time[2];
		var handAngles = [
			((h+m/60+s/3600)/12)*(2*Math.PI)-Math.PI/2,
			((m+s/60)/60)*(2*Math.PI)-Math.PI/2,
			(s/60)*(2*Math.PI)-Math.PI/2
		];
		for (var h = 0; h < 3; h++) {
			var hand = obj[hands[h]];
			if (hand.show === false) continue;
			var a = handAngles[h];			
			
			ctx.strokeStyle = hand.color;
			ctx.lineWidth = 0.05*r;
			var p1 = [c[0]+(hand.radius-0.05)*r*Math.cos(a),c[1]+(hand.radius-0.05)*r*Math.sin(a)];
			var p2 = [c[0]+(hand.radius+0.05)*r*Math.cos(a),c[1]+(hand.radius+0.05)*r*Math.sin(a)];
			var v = rotateVector(vector.setMagnitude(vector.getVectorAB(p1,p2),0.075*r),Math.PI/2);
			var p3 = vector.addVectors(p1,v);
			var p4 = vector.addVectors(p1,[-v[0],-v[1]]);
			ctx.beginPath();
			ctx.moveTo(c[0],c[1]);
			ctx.lineTo(p1[0],p1[1]);
			ctx.stroke();
			ctx.fillStyle = hand.color;
			ctx.beginPath();
			ctx.moveTo(p2[0],p2[1]);
			ctx.lineTo(p3[0],p3[1]);
			ctx.lineTo(p4[0],p4[1]);
			ctx.lineTo(p2[0],p2[1]);
			ctx.fill();
		}
		ctx.restore();
	},
	getRect: function (obj) {
		return [obj.center[0]-obj.radius,obj.center[1]-obj.radius,2*obj.radius,2*obj.radius];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		obj.radius += dw/2;
	},
	getButtons: function (x1, y1, x2, y2, pathNum) {
		var buttons = [];
		/*buttons.push({
			shape: 'rect',
			dims: [(x1+x2)/2-30, y1, 60, 20],
			cursor: draw.cursors.pointer,
			func: draw.video.setVideoId,
			pathNum: pathNum,
			draw: function (path, ctx, l, t, w, h) {
				ctx.fillStyle = '#CCF';
				ctx.fillRect(l, t, w, h);
				text({
					ctx: ctx,
					align: [0, 0],
					rect: [l, t, w, h],
					fontSize:14,
					text: ['videoID']
				});
				
			}
		});*/
		return buttons;
	},
	
}

draw.spinner = {
	resizable: true,
	colors:{
		r:{hex:'#F66',name:'red'},
		b:{hex:'#66F',name:'blue'},
		y:{hex:'#FF6',name:'yellow'},
		g:{hex:'#6F6',name:'green'},
		w:{hex:'#FFF',name:'white'},
		p:{hex:'#F6F',name:'pink'},
		o:{hex:'#F96',name:'orange'}
	},
	add: function () {
		deselectAllPaths(false);
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'spinner',
					center: [center[0]-50,center[1]-50],
					radius: 200,
					colors: 'rbygwpo',
					showLabels: true,
					value: 0.4,
					interact: {type:'spin'}
				}
			],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	draw: function (ctx, obj, path) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = obj.radius*0.02;
		var c = obj.center;
		var r = obj.radius;
		var n = obj.colors.length;
		var angle = -Math.PI/2;
		obj._angles = [];
		obj._pos = [];
		for (var i = 0; i < n+1; i++) {
			var angle2 = angle + i*2*Math.PI/n;
			obj._angles.push(angle2);
			obj._pos.push([c[0]+r*Math.cos(angle2),c[1]+r*Math.sin(angle2)]);
		}
		for (var i = 0; i < n; i++) {
			var color = draw.spinner.colors[obj.colors[i]];
			ctx.beginPath();
			ctx.moveTo(c[0], c[1]);
			ctx.lineTo(obj._pos[i][0], obj._pos[i][1]);
			ctx.arc(c[0], c[1], r, obj._angles[i], obj._angles[i+1]);
			ctx.lineTo(c[0], c[1]);
			ctx.fillStyle = color.hex;
			ctx.fill();
			if (obj.showLabels === true) {
				var midAngle = (obj._angles[i]+obj._angles[i+1])/2
				var labelCenter = [c[0]+0.8*r*Math.cos(midAngle),c[1]+0.8*r*Math.sin(midAngle)];
				text({ctx:ctx,rect:[labelCenter[0]-50,labelCenter[1]-50,100,100],text:[obj.colors[i].toUpperCase()],align:[0,0],fontSize:!un(obj.fontSize) ? obj.fontSize : obj.radius*0.2,bold:true});
			}
		}
		for (var i = 0; i < n; i++) {
			ctx.beginPath();
			ctx.moveTo(c[0], c[1]);
			ctx.lineTo(obj._pos[i][0], obj._pos[i][1]);
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.moveTo(c[0]+r, c[1]);
		ctx.arc(c[0], c[1], r, 0, 2*Math.PI);
		ctx.stroke();

		ctx.strokeStyle = '#000';
		ctx.fillStyle = '#000';
		ctx.lineWidth = obj.radius*0.05;
		var arrowRadius = 0.55;
		var arrowAngle = -Math.PI/2+2*Math.PI*obj.value;
		var p1 = [c[0]+(arrowRadius-0.05)*r*Math.cos(arrowAngle),c[1]+(arrowRadius-0.05)*r*Math.sin(arrowAngle)];
		var p2 = [c[0]+(arrowRadius+0.05)*r*Math.cos(arrowAngle),c[1]+(arrowRadius+0.05)*r*Math.sin(arrowAngle)];
		var v = rotateVector(vector.setMagnitude(vector.getVectorAB(p1,p2),0.075*r),Math.PI/2);
		var p3 = vector.addVectors(p1,v);
		var p4 = vector.addVectors(p1,[-v[0],-v[1]]);
		ctx.beginPath();
		ctx.moveTo(c[0],c[1]);
		ctx.lineTo(p1[0],p1[1]);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(p2[0],p2[1]);
		ctx.lineTo(p3[0],p3[1]);
		ctx.lineTo(p4[0],p4[1]);
		ctx.lineTo(p2[0],p2[1]);
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(c[0],c[1]);
		ctx.arc(c[0], c[1], r*0.05, 0, 2*Math.PI);
		ctx.fill();
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
	getCursorPositionsInteract: function (obj, pathNum) {
		if (un(obj)) obj = draw.path[pathNum].obj[0];
		var pos = [];
		if (!un(obj.interact) && obj.interact.disabled !== true && obj.interact._disabled !== true) {
			if (obj.interact.type === 'spin') {
				pos.push({
					shape: 'circle',
					dims: [obj.center[0],obj.center[1],obj.radius],
					cursor: draw.cursors.pointer,
					func: draw.spinner.spinStart,
					pathNum: pathNum,
					obj:obj
				});
			} else if (obj.interact.type === 'editspinner') {
				for (var i = 0; i < obj._angles.length-1; i++) {
					pos.push({
						shape: 'sector',
						dims: [obj.center[0],obj.center[1],obj.radius,obj._angles[i],obj._angles[i+1]],
						cursor: draw.cursors.pointer,
						func: draw.spinner.editSpinnerSectorClick,
						index: i,
						pathNum: pathNum,
						obj: obj
					});
				}
			}
		}
		return pos;
	},
	editSpinnerSectorClick:function() {
		var obj = draw.currCursor.obj;
		var index = draw.currCursor.index;
		var color = obj.colors[index];
		var colors = !un(obj.editColors) ? obj.editColors : 'rbygw';
		var index2 = colors.indexOf(color);
		var color2 = colors[(index2+1) % colors.length];
		obj.colors = obj.colors.slice(0,index)+color2+obj.colors.slice(index+1);
		if (typeof obj.onedit === 'function') obj.onedit(obj);
		drawCanvasPaths();
	},
	spinStart:function() {
		var obj = draw.currCursor.obj;
		if (obj._spinning === true) return;
		draw._spinner = obj;
		obj.value = obj.value % 1;
		obj._targetValue = ran(2,3) + 0.01*ran(0,99);
		obj._spinning = true;
		draw.interact.startAnimation(draw.spinner.spinStep);
	},
	spinStep:function() {
		var obj = draw._spinner;
		var diff = obj._targetValue - obj.value;
		obj.value += (diff > 2 ? 0.04 : 0.01 + 0.03 * (diff/2));
		if (obj.value >= obj._targetValue) {
			obj.value = obj._targetValue;
			delete obj._targetValue;
			delete obj._spinning;
			draw.spinner.registerSpin(obj);
			if (typeof obj.onspin === 'function') obj.onspin(obj);
			drawCanvasPaths();
			draw.interact.animation = false;
		}
	},
	spinQuick:function() {
		var obj = draw.currCursor.obj;
		if (obj._spinning === true) return;
		obj.value = 0.01*ran(0,99);
		if (un(obj.data)) obj.data = '';
		draw.spinner.registerSpin(obj);
		if (typeof obj.onspin === 'function') obj.onspin(obj);
		drawCanvasPaths();
	},
	registerSpin:function(obj) {
		if (typeof obj.data !== 'string') obj.data = '';
		obj.value = obj.value % 1;
		var index = Math.min(obj.colors.length-1,Math.floor(obj.value*obj.colors.length));
		obj.data += obj.colors[index];
	},
	resetData:function(obj) {
		obj.data = '';
	}

	
	
}
/*draw.dice = {
	add: function () {
		deselectAllPaths(false);
		var center = draw.getViewCenter();
		draw.path.push({
			obj: [{
					type: 'dice',
					center: [center[0]-50,center[1]-50],
					size: 100,
					rotation:[0,0,0]
				}
			],
			selected: true
		});
		updateBorder(draw.path.last());
		drawCanvasPaths();
		changeDrawMode();
	},
	draw: function (ctx, obj, path) {
		var x = obj.rotation[0];
		var y = obj.rotation[1];
		var z = obj.rotation[2];
		var c = obj.center;
		var s = obj.size;
		var f = 0;
		var faces = [{
				vis:x < 0.25 || x > 0.75,
				xSkew:x < 0.25 ? 1-4*x : x > 0.75 ? 4*(x-0.75) : 0,
				xOffset:x < 0.25 ? 4*x : x > 0.75 ? 4*(x-0.75)-1 : 0,
				ySkew:1,
				yOffset:0,
				dots:[[0,0]]
			}, {
				vis:x < 0.5,
				xSkew:x < 0.25 ? 4*x : x < 0.5 ? 1-4*(x-0.25) : 0,
				xOffset:x < 0.25 ? 4*x-1 : x < 0.5 ? 4*(x-0.25) : 0,
				ySkew:1,
				yOffset:0,
				dots:[[-0.25,-0.25],[0.25,0.25]]
			}, {
				vis:false,
				xSkew:Math.cos(x*2*Math.PI),
				ySkew:1,
				yOffset:0,
				dots:[[-0.25,-0.25],[0,0],[0.25,0.25]]
			}, {
				vis:false,
				xSkew:Math.cos(x*2*Math.PI),
				ySkew:1,
				yOffset:0,
				dots:[[-0.25,-0.25],[-0.25,0.25],[0.25,-0.25],[-0.25,-0.25]]
			}, {
				vis:x > 0.5,
				xSkew:x < 0.75 ? 4*(x-0.5) : 1-4*(x-0.75),
				xOffset:x < 0.75 ? 4*(x-0.5)-1 : 4*(x-0.75),
				ySkew:1,
				yOffset:0,
				dots:[[0,0],[-0.25,-0.25],[-0.25,0.25],[0.25,-0.25],[0.25,0.25]]
			}, {
				vis:x > 0.25 && x < 0.75,
				xSkew:x < 0.5 ? 4*(x-0.25) : 1-4*(x-0.5),
				xOffset:x < 0.5 ? 4*(x-0.25)-1 : 4*(x-0.5),
				ySkew:1,
				yOffset:0,
				dots:[[-0.3,-0.3],[0,-0.3],[0.3,-0.3],[-0.3,0.3],[0,0.3],[0.3,0.3]]
			}
		];
		
		console.log('--',x,'--');
		for (var f = 0; f < 6; f++) {
			var face = faces[f];
			if (un(face) || face.vis === false) continue;
			console.log(f,Math.round(face.xSkew*100)/100,Math.round(face.xOffset*100)/100);
			ctx.save();		
				ctx.translate(obj.center[0]+0.5*s*face.xOffset, obj.center[1]+0.5*s*face.yOffset);
				ctx.scale(face.xSkew,face.ySkew);
				
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#000';
				ctx.moveTo(-0.5*s,-0.5*s);
				ctx.lineTo(0.5*s,-0.5*s);
				ctx.lineTo(0.5*s,0.5*s);
				ctx.lineTo(-0.5*s,0.5*s);
				ctx.lineTo(-0.5*s,-0.5*s);
				ctx.stroke();
				
				for (var d = 0; d < face.dots.length; d++) {
					var pos = face.dots[d];
					ctx.beginPath();
					ctx.fillStyle = '#000';
					ctx.moveTo(c[0],c[1]);
					ctx.arc(pos[0]*s,pos[1]*s,0.1*s,0,2*Math.PI);
					ctx.fill();
				}
				
				ctx.resetTransform();
			ctx.restore();
		}
	},
	getRect:function(obj) {
		return [obj.center[0]-obj.size/2,obj.center[1]-obj.size/2,obj.size,obj.size];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		if (dw !== 0 || dh !== 0) {
			var x = mouse.x - draw.drawRelPos[0];
			var y = mouse.y - draw.drawRelPos[1];
			obj.size = Math.abs(Math.min(x - obj.center[0], y - obj.center[1]));
		}
	}
}
*/

draw.printButton = {
	resizable:true,
	default:{
		type: 'printButton',
		rect: [50,50,50,50],
		color: '#000',
		fillColor: '#FFF',
		lineWidth:5,
		radius:8
	},
	add: function() {
		deselectAllPaths();
		var path = {obj:[clone(this.default)],selected:true};
		path.obj[0]._path = path;
		updateBorder(path);
		draw.path.push(path);
		drawCanvasPaths();
		drawSelectedCanvas();
	},
	draw: function(ctx,obj,path) {
		var rect = obj.rect;
		var color = obj.color || '#000';
		var fillColor = obj.fillColor || '#FFF';
		var lineWidth = obj.lineWidth || obj.thickness || 0.1*rect[2];
		var radius = obj.radius || 0.1*rect[2];
		text({
			ctx: ctx,
			align: [0, 0],
			rect: obj.rect,
			text: [''],
			box: {
				type: 'loose',
				color: fillColor,
				borderColor: color,
				borderWidth: lineWidth,
				radius: radius
			}
		});
		var x = rect[0]+rect[2]*(7/40);
		var y = rect[1]+rect[2]*(7/40);
		var w = rect[2]*(26/40);
		ctx.save();
		ctx.translate(x,y);
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			ctx.strokeStyle = color;
			ctx.fillStyle = color;
			ctx.lineWidth = lineWidth;
			
			roundedRect(ctx,0,0.3*w,w,0.45*w,0.1*w,0.1*w,color,color);
			ctx.beginPath();
			ctx.fillStyle = fillColor;
			ctx.fillRect(0.22*w,0.65*w,0.56*w,0.15*w);
			
			roundedRect(ctx,0.22*w,0,0.56*w,w,0.1*w,0.1*w,color);
			
			roundedRect(ctx,0.35*w,0.70*w,0.3*w,0.05*w,0,0.01*w,color,color);
			roundedRect(ctx,0.35*w,0.82*w,0.2*w,0.05*w,0,0.01*w,color,color);
			
			ctx.beginPath();
			ctx.fillStyle = fillColor;
			ctx.arc(0.86*w,0.4*w,0.085*w,0,2*Math.PI);
			ctx.fill();
			
		ctx.translate(-x,-y);
		ctx.restore();
	},
	getRect:function(obj) {
		return clone(obj.rect);
	},
	changePosition:function(obj,dl,dt,dw,dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		obj.rect[3] += dw;
	}
}
draw.zoomButton = {
	resizable:true,
	default:{
		type: 'zoomButton',
		zoomType: 'plus', // plus, minus, equal
		rect: [50,50,50,50],
		color: '#000',
		fillColor: '#FFF',
		lineWidth:5,
		radius:8
	},
	add: function() {
		deselectAllPaths();
		var path = {obj:[clone(this.default)],selected:true};
		path.obj[0]._path = path;
		updateBorder(path);
		draw.path.push(path);
		drawCanvasPaths();
	},
	draw: function(ctx,obj,path) {
		var rect = obj.rect;
		var color = obj.color || '#000';
		var fillColor = obj.fillColor || '#FFF';
		var lineWidth = obj.lineWidth || obj.thickness || 0.1*rect[2];
		var radius = obj.radius || 0.1*rect[2];
		text({
			ctx: ctx,
			align: [0, 0],
			rect: obj.rect,
			text: [''],
			box: {
				type: 'loose',
				color: fillColor,
				borderColor: color,
				borderWidth: lineWidth,
				radius: radius
			}
		});
		var x = rect[0]+rect[2]*(3/40);
		var y = rect[1]+rect[2]*(3/40);
		var w = rect[2]*(34/40);
		ctx.save();
		ctx.translate(x,y);
			ctx.beginPath();
			ctx.strokeStyle = '#000';
			ctx.fillStyle = '#FFF';
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			ctx.lineWidth = w/6;
			ctx.moveTo(w*0.4,w*0.4);
			ctx.lineTo(w*0.75,w*0.75);
			ctx.stroke();
			ctx.lineWidth = 0.04*w;
			ctx.beginPath();
			ctx.arc(0.4*w,0.4*w,w*0.25,0,2*Math.PI);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(0.4*w,0.4*w,w*0.25,0,2*Math.PI);
			ctx.stroke();
			if (obj.zoomType === 'plus') {
				ctx.beginPath();	
				ctx.moveTo(w*0.3,w*0.4);
				ctx.lineTo(w*0.5,w*0.4);
				ctx.moveTo(w*0.4,w*0.3);
				ctx.lineTo(w*0.4,w*0.5);
				ctx.stroke();
			} else if (obj.zoomType === 'minus') {
				ctx.beginPath();	
				ctx.moveTo(w*0.3,w*0.4);
				ctx.lineTo(w*0.5,w*0.4);
				ctx.stroke();
			} else if (obj.zoomType === 'equal' || obj.zoomType === 'equals') {
				ctx.beginPath();	
				ctx.moveTo(w*0.32,w*0.35);
				ctx.lineTo(w*0.48,w*0.35);
				ctx.moveTo(w*0.32,w*0.45);
				ctx.lineTo(w*0.48,w*0.45);
				ctx.stroke();
			}
		ctx.translate(-x,-y);
		ctx.restore();
	},
	getRect:function(obj) {
		return clone(obj.rect);
	},
	changePosition:function(obj,dl,dt,dw,dh) {
		obj.rect[0] += dl;
		obj.rect[1] += dt;
		obj.rect[2] += dw;
		obj.rect[3] += dw;
	}

}

draw.placeValueBlocks = {
	resizable:false,
	default:{
		type:'placeValueBlocks',
		center:[600,440],
		center3d:[0,0,0],
		num:[1,3,6,4,3,2,5,2,1,3],
		unitSize:200,
		colors:["#99F","#FF6","#F99","#9F9","#F93","#6CC","#F9F","#393","#939","#999","#F93","#6CC","#F9F","#393","#939","#999"],
		viewPort:{
			rect:[250,200,700,480],
			drag:true
		}
	},
	add:function() {
		deselectAllPaths();
		var path = {obj:[clone(this.default)],selected:true};
		path.obj[0]._path = path;
		updateBorder(path);
		draw.path.push(path);
		drawCanvasPaths();
	},
	draw: function(ctx,obj,path) {		
		var pos2d = clone(obj.center);
		var pos3d = [0,0,0];
		var u = obj.unitSize;
		var v = [
			[Math.sqrt(3) / 2, 1 / 2],
			[-Math.sqrt(3) / 2, 1 / 2],
			[0, -1]
		];
		obj._blocks = [];
		if (!un(obj.center3d) && arraysEqual(obj.center3d,[0,0,0]) === false) {
			for (var i = 0; i < 3; i++) {
				if (obj.center3d[i] === 0) continue;
				var offset = vector.scalarMult(v[i],-obj.unitSize*obj.center3d[i]);
				pos2d[0] -= offset[0];
				pos2d[1] -= offset[1];
			}
		}
		var xMin = xMax = pos2d[0], yMin = yMax = pos2d[1];
		var x3dMin = x3dMax = 0, y3dMin = y3dMax = 0, z3dMin = z3dMax = 0;
		var ctx2 = ctx;
		if (!un(obj.viewPort)) {
			if (un(obj._canvas)) {
				obj._canvas = createCanvas(0,0,1200,1700,false);
				obj._ctx = obj._canvas.getContext('2d');
			}
			ctx2 = obj._ctx;
			ctx2.clearRect(0,0,1200,1700);
		}
		ctx2.strokeStyle = '#000';
		for (var n = 0; n < obj.num.length; n++) {
			ctx2.fillStyle = obj.colors[n];
			var unitScale = n < 3 ? 1 : n < 6 ? 0.1 : n < 9 ? 0.01 : n < 12 ? 0.001 : n < 15 ? 0.0001 : 0.00001;
			var u2 = u*unitScale;
			
			var dims2d = [ // scaled
				n % 3 < 1 ? u2 : 0.1*u2,
				n % 3 < 2 ? u2 : 0.1*u2,
				u2
			];
			var dims3d = [ // unscaled
				n % 3 < 1 ? unitScale : 0.1*unitScale,
				n % 3 < 2 ? unitScale : 0.1*unitScale,
				unitScale
			];
			var moveDir = n === 0 ? 0 : (n-1)%3;
			var moveVector2d = vector.scalarMult(v[moveDir],dims2d[moveDir]);
			var moveVector3d = moveDir === 0 ? [dims3d[0],0,0] : moveDir === 1 ? [0,dims3d[1],0] : moveDir === 2 ? [0,0,dims3d[2]] : [0,0,0];
			
			ctx2.lineWidth = Math.min(2,(n < 4 ? 1 : n < 7 ? 0.1 : n < 10 ? 0.01 : n < 13 ? 0.001 : n < 16 ? 0.0001 : 0.00001)*u/50);
			
			for (var i = 0; i < obj.num[n]; i++) {
				var block = {num:n,pos2d:pos2d,pos3d:clone(pos3d),dims2d:dims2d,dims3d:dims3d};
				drawCuboid(pos2d,pos3d,dims2d,dims3d,block);
				obj._blocks.push(block);
				pos2d = vector.addVectors(pos2d,moveVector2d);
				pos3d = vector.addVectors(pos3d,moveVector3d);
			}
		}
		obj._rect = [xMin,yMin,xMax-xMin,yMax-yMin];
		obj._box = {xMin:x3dMin,xMax:x3dMax,yMin:y3dMin,yMax:y3dMax,zMin:z3dMin,zMax:z3dMax};
		if (!un(obj.viewPort)) {
			var rect = obj.viewPort.rect;
			if (typeof ctx.canvas === 'object' && un(ctx.canvas.tagName)) { // drawing to pdf
				var image = new Image();
				image.onload = function() {
					ctx.drawImage(image,rect[0],rect[1],rect[2],rect[3],rect[0],rect[1],rect[2],rect[3]);
				};
				image.src = obj._canvas.toDataURL();
				//var img = obj._canvas.ctx.getImageData(rect[0],rect[1],rect[2],rect[3]);
			} else {
				ctx.drawImage(obj._canvas,rect[0],rect[1],rect[2],rect[3],rect[0],rect[1],rect[2],rect[3]);
			}
			ctx.strokeStyle = obj.viewPort.color || '#00F';
			ctx.lineWidth = obj.viewPort.lineWidth || 4;
			ctx.beginPath();
			ctx.moveTo(rect[0],rect[1]);
			ctx.lineTo(rect[0]+rect[2],rect[1]);
			ctx.lineTo(rect[0]+rect[2],rect[1]+rect[3]);
			ctx.lineTo(rect[0],rect[1]+rect[3]);
			ctx.lineTo(rect[0],rect[1]);
			ctx.stroke();
		}
		
		function drawCuboid(pos2d,pos3d,dims2d,dims3d,block) {
			var v2 = [
				vector.scalarMult(v[0],dims2d[0]),
				vector.scalarMult(v[1],dims2d[1]),
				vector.scalarMult(v[2],dims2d[2]),
			];
			var blockPos3d = [
				clone(pos3d),
				vector.addVectors(pos3d,[dims3d[0],0,0]),
				vector.addVectors(pos3d,[dims3d[0],dims3d[1],0]),
				vector.addVectors(pos3d,[0,dims3d[1],0])
			];
			var blockPos2d = [
				clone(pos2d),
				vector.addVectors(pos2d,v2[0]),
				vector.addVectors(pos2d,vector.addVectors(v2[0],v2[1])),
				vector.addVectors(pos2d,v2[1])
			];
			for (var i = 0; i < 4; i++) {
				blockPos2d.push(vector.addVectors(blockPos2d[i],v2[2]));
				blockPos3d.push(vector.addVectors(blockPos3d[i],[0,0,dims3d[2]]));
			}

			ctx2.beginPath();
			var order = [1,2,3,7,4,5];
			ctx2.moveTo(blockPos2d[order[0]][0],blockPos2d[order[0]][1]);
			for (var i = 1; i < order.length; i++) {
				ctx2.lineTo(blockPos2d[order[i]][0],blockPos2d[order[i]][1]);
			}
			ctx2.lineTo(blockPos2d[order[0]][0],blockPos2d[order[0]][1]);
			ctx2.closePath();
			ctx2.fill();
			
			ctx2.beginPath();
			ctx2.moveTo(blockPos2d[order[0]][0],blockPos2d[order[0]][1]);
			for (var i = 1; i < order.length; i++) {
				ctx2.lineTo(blockPos2d[order[i]][0],blockPos2d[order[i]][1]);
			}
			ctx2.lineTo(blockPos2d[order[0]][0],blockPos2d[order[0]][1]);
			ctx2.closePath();
			ctx2.stroke();
			
			ctx2.beginPath();
			ctx2.moveTo(blockPos2d[6][0],blockPos2d[6][1]);
			ctx2.lineTo(blockPos2d[2][0],blockPos2d[2][1]);
			ctx2.moveTo(blockPos2d[6][0],blockPos2d[6][1]);
			ctx2.lineTo(blockPos2d[5][0],blockPos2d[5][1]);
			ctx2.moveTo(blockPos2d[6][0],blockPos2d[6][1]);
			ctx2.lineTo(blockPos2d[7][0],blockPos2d[7][1]);
			ctx2.stroke();
			
			for (var i = 0; i < 8; i++) {
				xMin = Math.min(xMin,blockPos2d[i][0]);
				xMax = Math.max(xMax,blockPos2d[i][0]);
				yMin = Math.min(yMin,blockPos2d[i][1]);
				yMax = Math.max(yMax,blockPos2d[i][1]);
			}
			for (var i = 0; i < 8; i++) {
				x3dMin = Math.min(x3dMin,blockPos3d[i][0]);
				x3dMax = Math.max(x3dMax,blockPos3d[i][0]);
				y3dMin = Math.min(y3dMin,blockPos3d[i][1]);
				y3dMax = Math.max(y3dMax,blockPos3d[i][1]);
				z3dMin = Math.min(z3dMin,blockPos3d[i][2]);
				z3dMax = Math.max(z3dMax,blockPos3d[i][2]);
			}
			
			if (typeof block === 'object') {
				block.blockPos2d = blockPos2d;
				block.blockPos3d = blockPos3d;
			}
		}
	},
	getRect:function(obj) {
		if (!un(obj.viewPort)) return obj.viewPort.rect;
		if (!un(obj._rect)) {
			if (!un(obj.padding)) {
				return [obj._rect[0]-obj.padding,obj._rect[1]-obj.padding,obj._rect[2]+2*obj.padding,obj._rect[3]+2*obj.padding]
			}
			return obj._rect;
		}
		return [obj.center[0]-50,obj.center[1]-50,100,100];
	},
	changePosition:function(obj,dl,dt,dw,dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		if (!un(obj._rect)) {
			obj._rect[0] += dl;
			obj._rect[1] += dt;
		}
		if (!un(obj.viewPort) && !un(obj.viewPort.rect)) {
			obj.viewPort.rect[0] += dl;
			obj.viewPort.rect[1] += dt;
		}
	},
	getCursorPositionsInteract: function (obj, pathNum) {
		var pos = [];
		if (!un(obj.viewPort) && obj.viewPort.drag === true) {
			pos.push({
				shape: 'rect',
				dims: obj.viewPort.rect,
				cursor: draw.cursors.move1,
				func: draw.placeValueBlocks.dragStart,
				obj:obj
			});
		}
		return pos;
	},
	
	convert3dPosTo2d:function(obj,pos3d) {
		var pos2d = clone(obj.center);
		var v = [
			[Math.sqrt(3) / 2, 1 / 2],
			[-Math.sqrt(3) / 2, 1 / 2],
			[0, -1]
		];
		if (!un(obj.center3d) && arraysEqual(obj.center3d,[0,0,0]) === false) {
			for (var i = 0; i < 3; i++) {
				if (obj.center3d[i] === 0) continue;
				var offset = vector.scalarMult(v[i],-obj.unitSize*obj.center3d[i]);
				pos2d[0] -= offset[0];
				pos2d[1] -= offset[1];
			}
		}
		for (var i = 0; i < 3; i++) {
			var offset = vector.scalarMult(v[i],obj.unitSize*pos3d[i]);
			pos2d[0] += offset[0];
			pos2d[1] += offset[1];
		}
		return pos2d;
	},
	
	dragStart:function() {
		var obj = draw.currCursor.obj;
		draw._drag = {
			obj:obj,
			prevPos:clone(draw.mouse)
		};
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		draw.lockCursor = draw.cursors.move2;
		draw.animate(draw.placeValueBlocks.dragMove,draw.placeValueBlocks.dragStop,drawCanvasPaths);						
	},
	dragMove:function() {
		var obj = draw._drag.obj;
		var offset = vector.getVectorAB(draw._drag.prevPos,draw.mouse);
		offset[0] /= obj.unitSize;
		offset[1] /= obj.unitSize;
		var v = [
			[Math.sqrt(3) / 2, 1 / 2],
			[-Math.sqrt(3) / 2, 1 / 2]
		]
		var d0 = (v[1][0]*offset[1]-v[1][1]*offset[0])/(v[1][0]*v[0][1]-v[0][0]*v[1][1]);
		var d1 = (offset[0]-v[0][0]*d0)/v[1][0];
		obj.center3d[0] += d0;
		obj.center3d[1] += d1;
		draw._drag.prevPos = clone(draw.mouse);
		
	},
	dragStop:function() {
		delete draw._drag;
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		delete draw.lockCursor;
	}
}
draw.three = {
	interactKeys:[{
		key: 'drag3d',
		value: false
	}, {
		key: 'edit3dShape',
		value: false
	}, {
		key: 'cubeBuilding',
		value: '',
		options: ['', 'build', 'remove']
	}],
	add: function () {
		deselectAllPaths(false);
		changeDrawMode();
		var center = draw.getViewCenter();		
		draw.path.push({
			obj: [{
					type: 'three',
					center: center,
					gridSize: 210,
					gridStep: 35,
					snapTo: 35,
					fillStyle: '#0FF',
					alpha: 0.5,
					paths3d: [
						/*{type:'grid',squares:8,size:35,direction:[0,0,1],color:'#CCC',alpha:1},*/
						/*{type:'arrow',pos:[[7*35,0,0],[5*35,0,0]],fill:true,color:'#000',alpha:1},*/
						{
							type: 'prism',
							polygon: [[-2 * 35, 2 * 35], [2 * 35, -4 * 35], [2 * 35, 2 * 35]],
							center: [0, 0, 0],
							height: 4 * 35
						},
					],
					drawBackFaces: 'auto', /* auto, dash, outline, none */
					drawFaceNormals: false,
					faceGrid: false,
					cubeBuildingMode: true,
					brightness: 1,
					contrast: 0.5,
					tilt: 0.35,
					angle: 1.75 * Math.PI,
					/*angleMin:1.5*Math.PI,//*/
					/*angleMax:2*Math.PI,//*/
				}
			],
			selected: true
		});
		draw.updateAllBorders();
		drawCanvasPaths();
		//draw.controlPanel.draw();
		drawSelectCanvas();
	},
	path3d: {
		grid: {
			get: function () {
				var obj = sel();
				return {
					type: 'grid',
					squares: Math.round(obj.gridSize / obj.gridStep),
					size: obj.gridStep,
					direction: clone(dir),
					color: '#CCC',
					alpha: 1
				};
			},
			getPos3d: function (path3d) {
				var direction = !un(path3d.direction) ? path3d.direction : [0, 0, 1];
				var width = path3d.size * path3d.squares;
				var v = [],
				e = [],
				f = [];

				var fillStyle = !un(path3d.color) ? path3d.color : '#CCC';

				if (arraysEqual(direction, [0, 0, 1])) {
					var paths = [];
					for (var i = 0; i <= path3d.squares; i++) {
						var pos2 = -width / 2 + i * path3d.size;
						paths.push({
							pos: [[pos2, -width / 2, 0.001], [pos2, width / 2, 0.001]],
							lineWidth: 1,
							strokeStyle: '#000'
						}, {
							pos: [[-width / 2, pos2, 0.001], [width / 2, pos2, 0.001]],
							lineWidth: 1,
							strokeStyle: '#000'
						});
					}
					var pos = [
						[ - (width) / 2,  - (width) / 2, 0],
						[ - (width) / 2, (width) / 2, 0],
						[(width) / 2, (width) / 2, 0],
						[(width) / 2,  - (width) / 2, 0]
					];
					var f = [{
							pos3d: clone(pos),
							stroke: false,
							fillStyle: fillStyle,
							drawFirst: true,
							paths: paths
						}, {
							pos3d: clone(pos).reverse(),
							stroke: false,
							fillStyle: fillStyle,
							drawFirst: true,
							paths: paths
						}
					];
				} else if (arraysEqual(direction, [1, 0, 0])) {
					var paths = [];
					for (var i = 0; i <= path3d.squares; i++) {
						var pos1 = i * path3d.size;
						var pos2 = -width / 2 + i * path3d.size;
						paths.push({
							pos: [[-width / 2 + 0.001, pos2, 0], [-width / 2 + 0.001, pos2, width]],
							lineWidth: 1,
							strokeStyle: '#000'
						}, {
							pos: [[-width / 2 + 0.001, -width / 2, pos1], [-width / 2 + 0.001, width / 2, pos1]],
							lineWidth: 1,
							strokeStyle: '#000'
						});
					}
					var pos = [
						[-width / 2, -width / 2, 0],
						[-width / 2, -width / 2, width],
						[-width / 2, width / 2, width],
						[-width / 2, width / 2, 0]
					];
					var f = [{
							pos3d: clone(pos),
							stroke: false,
							fillStyle: fillStyle,
							drawFirst: true,
							paths: paths
						}, {
							pos3d: clone(pos).reverse(),
							stroke: false,
							fillStyle: fillStyle,
							drawFirst: true,
							paths: paths
						}
					];
				} else if (arraysEqual(direction, [0, 1, 0])) {
					var paths = [];
					for (var i = 0; i <= path3d.squares; i++) {
						var pos1 = i * path3d.size;
						var pos2 = -width / 2 + i * path3d.size;
						paths.push({
							pos: [[pos2, -width / 2 + 0.001, 0], [pos2, -width / 2 + 0.001, width]],
							lineWidth: 1,
							strokeStyle: '#000'
						}, {
							pos: [[-width / 2, -width / 2 + 0.001, pos1], [width / 2, -width / 2 + 0.001, pos1]],
							lineWidth: 1,
							strokeStyle: '#000'
						});
					}
					var pos = [
						[-width / 2, -width / 2, 0],
						[-width / 2, -width / 2, width],
						[width / 2, -width / 2, width],
						[width / 2, -width / 2, 0]
					];
					var f = [{
							pos3d: clone(pos),
							stroke: false,
							fillStyle: fillStyle,
							drawFirst: true,
							paths: paths
						}, {
							pos3d: clone(pos).reverse(),
							stroke: false,
							fillStyle: fillStyle,
							drawFirst: true,
							paths: paths
						}
					];
				}
				e = [];
				return {
					vertices: v,
					faces: f,
					edges: e
				};
			},
			scale: function (path3d, sf) {
				path3d.size *= sf;
			},
			getUnitPolygons: function (obj, path3d) {}
		},
		dotGrid: {
			get: function () {
				var obj = sel();
				return {
					type: 'dotGrid',
					squares: Math.round(obj.gridSize / obj.gridStep),
					size: obj.gridStep,
					direction: [0, 0, 1],
					strokeStyle: '#999',
					fillStyle: '#999',
					alpha: 1
				};
			},
			getPos3d: function (path3d) {
				var direction = !un(path3d.direction) ? path3d.direction : [0, 0, 1];
				var width = path3d.size * path3d.squares;
				var v = [],
				e = [],
				f = [];

				if (arraysEqual(direction, [0, 0, 1])) {
					var paths = [];
					var min = path3d.infinite == true ? -16 : 0;
					var max = path3d.infinite == true ? 16 : path3d.squares;
					for (var i = min; i <= max; i++) {
						for (var j = min; j <= max; j++) {
							var pos1 = -width / 2 + i * path3d.size;
							var pos2 = -width / 2 + j * path3d.size;
							paths.push({
								pos: [pos1, pos2, 0],
								fillStyle: path3d.fillStyle,
								radius: 4,
								limit: boolean(path3d.infinite, false)
							});
						}
					}
					var pos = [
						[ - (width) / 2,  - (width) / 2, 0],
						[ - (width) / 2, (width) / 2, 0],
						[(width) / 2, (width) / 2, 0],
						[(width) / 2,  - (width) / 2, 0]
					];
					var f = [{
							pos3d: clone(pos),
							stroke: false,
							fill: false,
							drawFirst: false,
							paths: paths
						}
					];
				} else if (arraysEqual(direction, [1, 0, 0])) {
					var paths = [];
					var min = path3d.infinite == true ? -16 : 0;
					var max = path3d.infinite == true ? 16 : path3d.squares;
					for (var i = min; i <= max; i++) {
						for (var j = min; j <= max; j++) {
							var pos1 = -width / 2 + i * path3d.size;
							var pos2 = j * path3d.size;
							paths.push({
								pos: [-width / 2, pos1, pos2],
								fillStyle: path3d.fillStyle,
								radius: 4,
								limit: boolean(path3d.infinite, false)
							});
						}
					}
					var pos = [
						[-width / 2, -width / 2, 0],
						[-width / 2, -width / 2, width],
						[-width / 2, width / 2, width],
						[-width / 2, width / 2, 0]
					];
					var f = [{
							pos3d: clone(pos),
							stroke: false,
							fill: false,
							drawFirst: false,
							paths: paths
						}
					];
				} else if (arraysEqual(direction, [0, 1, 0])) {
					var paths = [];
					var min = path3d.infinite == true ? -16 : 0;
					var max = path3d.infinite == true ? 16 : path3d.squares;
					for (var i = min; i <= max; i++) {
						for (var j = min; j <= max; j++) {
							var pos1 = -width / 2 + i * path3d.size;
							var pos2 = j * path3d.size;
							paths.push({
								pos: [pos1, width / 2, pos2],
								fillStyle: path3d.fillStyle,
								radius: 4,
								limit: boolean(path3d.infinite, false)
							});
						}
					}
					var pos = [
						[-width / 2, width / 2, 0],
						[-width / 2, width / 2, width],
						[width / 2, width / 2, width],
						[width / 2, width / 2, 0]
					];
					var f = [{
							pos3d: clone(pos),
							stroke: false,
							fill: false,
							drawFirst: false,
							paths: paths
						}
					];
				}
				e = [];
				return {
					vertices: v,
					faces: f,
					edges: e
				};
			},
			scale: function (path3d, sf) {
				path3d.size *= sf;
			}
		},
		arrow: {
			getPos3d: function (path3d) {
				var direction = !un(path3d.direction) ? path3d.direction : [0, 0, 1];
				var v = [],
				e = [],
				f = [];
				var pos = draw.three.path3d.arrow.getPoints(path3d);
				f.push({
					pos3d: [pos[0], pos[2], pos[1], pos[3]],
					stroke: false,
					fill: false,
					paths: [{
							pos: [pos[0], pos[1]],
							strokeStyle: '#000',
							lineWidth: 2
						}, {
							pos: [pos[1], pos[2], pos[3]],
							fillStyle: '#000'
						},
					]
				});
				f.push({
					pos3d: [pos[0], pos[3], pos[1], pos[2]],
					stroke: false,
					fill: false,
					paths: [{
							pos: [pos[0], pos[1]],
							strokeStyle: '#000',
							lineWidth: 2
						}, {
							pos: [pos[1], pos[2], pos[3]],
							fillStyle: '#000'
						},
					]
				});
				return {
					vertices: v,
					faces: f,
					edges: e
				};
			},
			getPoints: function (path3d) {
				var arrowLength = path3d.arrowLength || 30;
				var angleBetweenLinesRads = path3d.angleBetweenLinesRads || 0.5;

				var p0 = path3d.pos[0];
				var p1 = path3d.pos[1];
				var gradient = (-1 * (p1[1] - p0[1])) / (p1[0] - [0][0]);

				var angleToHorizontal = Math.abs(Math.atan(gradient));
				var remainingAngle = Math.PI / 2 - angleBetweenLinesRads - angleToHorizontal;
				if (gradient !== 0 && p1[1] > p0[1]) { // downwards
					angleBetweenLinesRads = Math.PI - angleBetweenLinesRads
						remainingAngle = Math.PI / 2 - angleBetweenLinesRads - angleToHorizontal;
				}
				var v1 = [Math.sin(remainingAngle) * arrowLength, Math.cos(remainingAngle) * arrowLength];
				var v2 = [Math.cos(angleBetweenLinesRads - angleToHorizontal) * arrowLength, Math.sin(angleBetweenLinesRads - angleToHorizontal) * arrowLength];

				if ((gradient == Infinity) || (gradient < 0 && p1[1] < p0[1]) || (gradient == 0 && p1[0] < p0[0]) || (gradient < 0 && p1[1] > p0[1])) {
					var signs = [1, 1, 1, -1];
				} else if (gradient == -Infinity) {
					var signs = [1, -1, 1, 1];
				} else if ((gradient > 0 && p1[1] < p0[1]) || (gradient == 0 && p1[0] > p0[0]) || (gradient > 0 && p1[1] > p0[1])) {
					var signs = [-1, 1, -1, -1];
				}

				var p2 = [p1[0] + signs[0] * v1[0], p1[1] + signs[1] * v1[1]];
				var p3 = [p1[0] + signs[2] * v2[0], p1[1] + signs[3] * v2[1]];

				p1[2] = p0[2];
				p2[2] = p0[2];
				p3[2] = p0[2];
				return [p0, p1, p2, p3];
			},
			scale: function (path3d, sf) {
				path3d.pos[0][0] *= sf;
				path3d.pos[0][1] *= sf;
				path3d.pos[1][0] *= sf;
				path3d.pos[1][1] *= sf;
				if (!un(path3d.arrowLength))
					path3d.arrowLength *= sf;
			}
		},
		cuboid: {
			get: function () {
				var obj = sel();
				return {
					type: 'cuboid',
					pos: [-obj.gridStep, -obj.gridStep, 0],
					dims: [2 * obj.gridStep, 2 * obj.gridStep, 2 * obj.gridStep]
				};
			},
			getPos3d: function (path3d) {
				var pos = path3d.pos;
				var dims = path3d.dims;
				var v = [],
				e = [],
				f = [];
				var p = [
					[pos[0], pos[1], pos[2]],
					[pos[0] + dims[0], pos[1], pos[2]],
					[pos[0] + dims[0], pos[1] + dims[1], pos[2]],
					[pos[0], pos[1] + dims[1], pos[2]],
					[pos[0], pos[1], pos[2] + dims[2]],
					[pos[0] + dims[0], pos[1], pos[2] + dims[2]],
					[pos[0] + dims[0], pos[1] + dims[1], pos[2] + dims[2]],
					[pos[0], pos[1] + dims[1], pos[2] + dims[2]],
				];

				var labels = path3d.labels || [];
				for (var l = 0; l < labels.length; l++) {
					var label = labels[l];
					if (label.type == 'vertex') {
						var n = label.offsetMagnitude || 17;
						var offset = [
							[-n, -n, -n],
							[n, -n, -n],
							[n, n, -n],
							[-n, n, -n],
							[-n, -n, n],
							[n, -n, n],
							[n, n, n],
							[-n, n, n]
						][label.pos];
						label.pos3d = vector.addVectors(p[label.pos], offset);
					} else if (label.type == 'edge') {
						if (label.pos.length !== 2) continue;
						label.pos.sort();
						var a = label.pos[0];
						var b = label.pos[1];
						var n = label.offsetMagnitude || 25;
						var pos3d = vector.addVectors(p[a], p[b]);
						pos3d = [pos3d[0] / 2, pos3d[1] / 2, pos3d[2] / 2];
						var offset = [0, 0, 0];
						if (a == 0 && b == 1) {
							offset = [0, -n, -n];
						} else if (a == 1 && b == 2) {
							offset = [n, 0, -n];
						} else if (a == 2 && b == 3) {
							offset = [0, n, -n];
						} else if (a == 0 && b == 3) {
							offset = [-n, 0, -n];
						} else if (a == 0 && b == 4) {
							offset = [-n, -n, 0];
						} else if (a == 1 && b == 5) {
							offset = [n, -n, 0];
						} else if (a == 2 && b == 6) {
							offset = [n, n, 0];
						} else if (a == 3 && b == 7) {
							offset = [-n, n, 0];
						} else if (a == 4 && b == 5) {
							offset = [0, -n, n];
						} else if (a == 5 && b == 6) {
							offset = [n, 0, n];
						} else if (a == 6 && b == 7) {
							offset = [0, n, n];
						} else if (a == 4 && b == 7) {
							offset = [-n, 0, n];
						}
						label.pos3d = vector.addVectors(pos3d, offset);
					}
				}

				var f = [{
						pos3d: [p[3], p[2], p[1], p[0]],
						drawFirst:true,
						paths: [{
								pos: p[0],
								fillStyle: '#F00',
								strokeStyle: '#000',
								drag: draw.three.pointDragStart,
								vars: {
									type: 'center'
								},
								path3d: path3d,
								dragOnly: true
							}, {
								pos: p[1],
								fillStyle: '#00F',
								strokeStyle: '#000',
								drag: draw.three.pointDragStart,
								vars: {
									type: 'dim',
									dimIndex: 0
								},
								path3d: path3d,
								dragOnly: true
							}, {
								pos: p[3],
								fillStyle: '#00F',
								strokeStyle: '#000',
								drag: draw.three.pointDragStart,
								vars: {
									type: 'dim',
									dimIndex: 1
								},
								path3d: path3d,
								dragOnly: true
							}
						]
					}, {
						pos3d: [p[0], p[1], p[5], p[4]]
					}, {
						pos3d: [p[1], p[2], p[6], p[5]]
					}, {
						pos3d: [p[2], p[3], p[7], p[6]]
					}, {
						pos3d: [p[3], p[0], p[4], p[7]]
					}, {
						pos3d: [p[4], p[5], p[6], p[7]],
						drawLast:true,
						paths: [{
								pos: p[4],
								fillStyle: '#060',
								strokeStyle: '#000',
								drag: draw.three.pointDragStart,
								vars: {
									type: 'dim',
									dimIndex: 2
								},
								path3d: path3d,
								dragOnly: true
							}
						]
					}
				];
				
 				if (typeof path3d.faceGrid === 'number') {
					var step = path3d.faceGrid;
					var xCount = Math.floor(dims[0] / step);
					var yCount = Math.floor(dims[1] / step);
					var zCount = Math.floor(dims[2] / step);
					f[1].paths = [];
					f[2].paths = [];
					f[3].paths = [];
					f[4].paths = [];
					for (var x = 1; x <= xCount; x++) {
						for (var y = 1; y <= yCount; y++) {
							var p1 = vector.addVectors(p[0], [x*step, 0, 0]);
							var p2 = vector.addVectors(p[0], [x*step, y*step, 0]);
							var p3 = vector.addVectors(p[4], [x*step, 0, 0]);
							var p4 = vector.addVectors(p[4], [x*step, y*step, 0]);
							f[0].paths.push({
								type: 'lineSegment',
								pos: [p1,p2],
								lineColor: '#000',
								lineWidth: 1
							});
							f[5].paths.push({
								type: 'lineSegment',
								pos: [p3,p4],
								lineColor: '#000',
								lineWidth: 1
							});
						}
						for (var z = 1; z <= zCount; z++) {
							var p1 = vector.addVectors(p[0], [x*step, 0, 0]);
							var p2 = vector.addVectors(p[0], [x*step, 0, z*step]);
							var p3 = vector.addVectors(p[3], [x*step, 0, 0]);
							var p4 = vector.addVectors(p[3], [x*step, 0, z*step]);
							f[1].paths.push({
								type: 'lineSegment',
								pos: [p1,p2],
								lineColor: '#000',
								lineWidth: 1
							});
							f[3].paths.push({
								type: 'lineSegment',
								pos: [p3,p4],
								lineColor: '#000',
								lineWidth: 1
							});
						}
					}
					for (var y = 1; y <= yCount; y++) {
						for (var x = 1; x <= xCount; x++) {
							var p1 = vector.addVectors(p[0], [0, y*step, 0]);
							var p2 = vector.addVectors(p[0], [x*step, y*step, 0]);
							var p3 = vector.addVectors(p[4], [0, y*step, 0]);
							var p4 = vector.addVectors(p[4], [x*step, y*step, 0]);
							f[0].paths.push({
								type: 'lineSegment',
								pos: [p1,p2],
								lineColor: '#000',
								lineWidth: 1
							});
							f[5].paths.push({
								type: 'lineSegment',
								pos: [p3,p4],
								lineColor: '#000',
								lineWidth: 1
							});
						}
						for (var z = 1; z <= zCount; z++) {
							var p1 = vector.addVectors(p[1], [0, y*step, 0]);
							var p2 = vector.addVectors(p[1], [0, y*step, z*step]);
							var p3 = vector.addVectors(p[0], [0, y*step, 0]);
							var p4 = vector.addVectors(p[0], [0, y*step, z*step]);
							f[2].paths.push({
								type: 'lineSegment',
								pos: [p1,p2],
								lineColor: '#000',
								lineWidth: 1
							});
							f[4].paths.push({
								type: 'lineSegment',
								pos: [p3,p4],
								lineColor: '#000',
								lineWidth: 1
							});
						}
					}
					for (var z = 1; z <= zCount; z++) {
						for (var x = 1; x <= xCount; x++) {
							var p1 = vector.addVectors(p[0], [0, 0, z*step]);
							var p2 = vector.addVectors(p[0], [x*step, 0, z*step]);
							var p3 = vector.addVectors(p[3], [0, 0, z*step]);
							var p4 = vector.addVectors(p[3], [x*step, 0, z*step]);
							f[1].paths.push({
								type: 'lineSegment',
								pos: [p1,p2],
								lineColor: '#000',
								lineWidth: 1
							});
							f[3].paths.push({
								type: 'lineSegment',
								pos: [p3,p4],
								lineColor: '#000',
								lineWidth: 1
							});
						}
						for (var y = 1; y <= yCount; y++) {
							var p1 = vector.addVectors(p[1], [0, 0, z*step]);
							var p2 = vector.addVectors(p[1], [0, y*step, z*step]);
							var p3 = vector.addVectors(p[0], [0, 0, z*step]);
							var p4 = vector.addVectors(p[0], [0, y*step, z*step]);
							f[2].paths.push({
								type: 'lineSegment',
								pos: [p1,p2],
								lineColor: '#000',
								lineWidth: 1
							});
							f[4].paths.push({
								type: 'lineSegment',
								pos: [p3,p4],
								lineColor: '#000',
								lineWidth: 1
							});
						}
					}
				}
				
				/* eg.
				path3d.angles = [{pos:[0,4,2],lineColor:'#000',lineWidth:2,fillColor:'#F00',radius:30,drawLines:true,drawCurve:true}];
				 */
				//console.log(p);
				if (!un(path3d.paths)) {
					for (var a = 0; a < path3d.paths.length; a++) {
						if (path3d.paths[a].type == 'angle') {
							var angle = path3d.paths[a];
							var anglePos = [p[angle.pos[0]], p[angle.pos[1]], p[angle.pos[2]]];
							var labelType = 'measure';
							if (angle.labelType == 'none') {
								labelType = 'none';
							} else if (!un(angle.label)) {
								labelType = 'custom';
								if (typeof angle.label == 'string')
									angle.label = [angle.label];
							}
							f.push({
								pos3d: anglePos,
								stroke: false,
								fill: false,
								drawFirst: boolean(angle.drawFirst, false),
								drawLast: boolean(angle.drawLast, false),
								paths: [{
										type: 'angle',
										pos: clone(anglePos),
										lineColor: angle.lineColor || '#000',
										lineWidth: angle.lineWidth || 2,
										fillColor: angle.fillColor || '#00F',
										radius: angle.radius || 50,
										drawLines: boolean(angle.drawLines, true),
										drawCurve: boolean(angle.drawCurve, true),
										fillTriangle: angle.fillTriangle || 'none',
										lineTriangle: angle.lineTriangle || 'none',
										labelType: labelType,
										label: angle.label || '',
										labelRadius: angle.labelRadius || ((angle.radius || 50) + 25),
										visible: boolean(angle.visible, true)
									}
								]
							});
						} else if (path3d.paths[a].type == 'polygon') {
							var polygon = path3d.paths[a];

							var polygonPos = [];
							for (var a2 = 0; a2 < polygon.pos.length; a2++) {
								if (typeof polygon.pos[a2] == 'object') {
									if (polygon.pos[a2].type == 'midpoint') {
										var pos1 = p[polygon.pos[a2].pos1];
										var pos2 = p[polygon.pos[a2].pos2];
										var pos3 = vector.addVectors(pos1, pos2);
										polygonPos[a2] = vector.setMagnitude(pos3, vector.getMagnitude(pos3) / 2);
									}
								} else if (typeof polygon.pos[a2] == 'number') {
									polygonPos[a2] = p[polygon.pos[a2]];
								}
							}

							f.push({
								pos3d: polygonPos,
								stroke: false,
								fill: false,
								paths: [{
										type: 'polygon',
										pos: clone(polygonPos),
										lineColor: polygon.lineColor || '#000',
										lineWidth: polygon.lineWidth || 2,
										fillColor: polygon.fillColor || '#00F',
										visible: boolean(polygon.visible, true)
									}
								]
							});
						} else if (path3d.paths[a].type == 'lineSegment') {
							var lineSegment = path3d.paths[a];

							if (typeof lineSegment.pos[0] == 'object') {
								if (lineSegment.pos[0].type == 'midpoint') {
									var c = p[lineSegment.pos[0].pos[0]];
									var d = p[lineSegment.pos[0].pos[1]];
									var m = vector.addVectors(clone(c), clone(d));
									var x = [m[0] / 2, m[1] / 2, m[2] / 2];
								}
							} else {
								var x = p[lineSegment.pos[0]];
							}
							if (typeof lineSegment.pos[1] == 'object') {
								if (lineSegment.pos[1].type == 'midpoint') {
									var c = p[lineSegment.pos[1].pos[0]];
									var d = p[lineSegment.pos[1].pos[1]];
									var m = vector.addVectors(clone(c), clone(d));
									var y = [m[0] / 2, m[1] / 2, m[2] / 2];
								}
							} else {
								var y = p[lineSegment.pos[1]];
							}

							var pos3 = vector.addVectors(y, [0, 0, -103]);
							var lineSegmentPos = [x, y, pos3];
							f.push({
								pos3d: [x, y],
								stroke: false,
								fill: false,
								paths: [{
										type: 'lineSegment',
										pos: [x, y],
										lineColor: lineSegment.lineColor || lineSegment.color || '#00F',
										lineWidth: lineSegment.lineWidth || lineSegment.width || 2,
										visible: boolean(lineSegment.visible, true)
									}
								]
							});
						}
					}
				}

				/*if (!un(path3d.diagonalFace0)) {
				f.push({pos3d:[p[0],p[4],p[6],p[2]]});
				}*/
				return {
					vertices: v,
					edges: e,
					faces: f,
					labels: labels
				};
			},
			pointDragMove: function (obj, path3d, vars) {
				switch (vars.type) {
				case 'center':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);
					if (!un(obj.gridBounds)) {
						path3d.pos[0] = Math.min(draw.three.snapPos(obj, pos3d[0], 0), obj.gridBounds[0][1] * obj.gridStep - path3d.dims[0]);
						path3d.pos[1] = Math.min(draw.three.snapPos(obj, pos3d[1], 1), obj.gridBounds[1][1] * obj.gridStep - path3d.dims[1]);
					} else {
						path3d.pos[0] = Math.min(draw.three.snapPos(obj, pos3d[0], 0), obj.gridSize / 2 - path3d.dims[0]);
						path3d.pos[1] = Math.min(draw.three.snapPos(obj, pos3d[1], 1), obj.gridSize / 2 - path3d.dims[1]);
					}
					break
				case 'dim':
					if (vars.dimIndex == 2) {
						var pos = draw.three.convert3dPosTo2d(obj, path3d.pos);
						path3d.dims[2] = draw.three.snapPos(obj, draw.three.convert2dHeightTo3d(obj, pos[1] - draw.mouse[1]), 2);
						var snapTo = obj.snapTo || obj.gridStep || 60;
						path3d.dims[2] = Math.max(path3d.dims[2], snapTo);
					} else {
						var pos = draw.three.convert2dPosTo3d(obj, draw.mouse);
						var snapTo = obj.snapTo || obj.gridStep || 60;
						var i = vars.dimIndex;
						if (!un(obj.gridBounds)) {
							path3d.dims[i] = bound(pos[i] - path3d.pos[i], obj.gridStep, obj.gridBounds[i][1] * obj.gridStep - path3d.pos[i], snapTo);
						} else {
							path3d.dims[i] = bound(pos[i], obj.gridStep, obj.gridSize - path3d.pos[i], snapTo);
						}
					}
					break;
				}
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < 3; i++) {
					path3d.pos[i] *= sf;
					path3d.dims[i] *= sf;
				}
			}
		},
		prism: {
			get: function () {
				var obj = sel();
				var polygon = [];
				var da = 2 * Math.PI / 5;
				var a = -da / 2;
				for (var i = 0; i < 5; i++) {
					polygon.push([2 * obj.gridStep * Math.cos(a), 2 * obj.gridStep * Math.sin(a)]);
					a += da;
				}
				drawSelectedPaths();
				return {
					type: 'prism',
					polygon: polygon,
					center: [0, 0, 0],
					height: 4 * obj.gridStep
				};
			},
			rotate: function (obj, path3d) {
				if (un(path3d.direction) || arraysEqual(path3d.direction, [0, 0, 1])) {
					path3d.direction = [1, 0, 0];
					path3d.center = [-obj.gridStep * 3, 0, obj.gridStep * 3];
				} else {
					path3d.direction = [0, 0, 1];
					path3d.center = [0, 0, 0];
				}
			},
			getPos3d: function (path3d) {
				var direction = !un(path3d.direction) ? path3d.direction : [0, 0, 1];
				var closed = !un(path3d.closed) ? path3d.closed : [true, true];
				var polygon = path3d.polygon;
				if (polygonClockwiseTest(polygon) == true)
					polygon.reverse();
				var c = path3d.center;
				var h = path3d.height;
				var v = [],
				e = [],
				f = [];
				var v1 = [],
				v2 = [];

				if (arraysEqual(direction, [0, 0, 1]) || arraysEqual(direction, [0, 0, -1])) {
					for (var p = 0; p < polygon.length; p++) {
						v1.push([polygon[p][0] + c[0], polygon[p][1] + c[1], c[2]]);
						v2.push([polygon[p][0] + c[0], polygon[p][1] + c[1], c[2] + h]);
					}
				} else if (arraysEqual(direction, [1, 0, 0]) || arraysEqual(direction, [-1, 0, 0])) {
					for (var p = 0; p < polygon.length; p++) {
						v1.push([c[0], polygon[p][0] + c[1], polygon[p][1] + c[2]]);
						v2.push([c[0] + h, polygon[p][0] + c[1], polygon[p][1] + c[2]]);
					}
				} else if (arraysEqual(direction, [0, 1, 0]) || arraysEqual(direction, [0, -1, 0])) {
					polygon.reverse();
					for (var p = 0; p < polygon.length; p++) {
						v1.push([polygon[p][0] + c[0], c[1], polygon[p][1] + c[2]]);
						v2.push([polygon[p][0] + c[0], c[1] + h, polygon[p][1] + c[2]]);
					}
				}

				if (arraysEqual(direction, [0, 0, 1]) || arraysEqual(direction, [0, 0, -1])) {
					var polygonPoints = [];
					for (var p = 0; p < v1.length; p++) {
						polygonPoints.push({
							pos: v1[p],
							fillStyle: '#F00',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'polygonPoint',
								pointIndex: p
							},
							path3d: path3d,
							dragOnly: true
						});
					}
					//polygonPoints.push({pos:c,fillStyle:'#00F',strokeStyle:'#000',drag:draw.three.pointDragStart,vars:{type:'center'},path3d:path3d,dragOnly:true});

					f.push({
						pos3d: clone(v1).reverse(),
						paths: polygonPoints
					});
					for (var p = 0; p < polygon.length; p++) {
						var next = (p + 1) % polygon.length;
						f.push({
							pos3d: [v1[p], v1[next], v2[next], v2[p]]
						});
					}
					f.push({
						pos3d: clone(v2),
						paths: [{
								pos: [c[0], c[1], c[2] + h],
								fillStyle: '#060',
								strokeStyle: '#000',
								drag: draw.three.pointDragStart,
								vars: {
									type: 'height'
								},
								path3d: path3d,
								dragOnly: true
							}
						]
					});
				} else {
					f.push({
						pos3d: clone(v1).reverse()
					});
					for (var p = 0; p < polygon.length; p++) {
						var next = (p + 1) % polygon.length;
						f.push({
							pos3d: [v1[p], v1[next], v2[next], v2[p]]
						});
					}
					f.push({
						pos3d: clone(v2)
					});
				}

				var labels = path3d.labels || [];
				if (!un(path3d.labels)) {
					for (var l = 0; l < labels.length; l++) {
						var label = labels[l];
						if (label.type == 'vertex') {
							var n = label.offsetMagnitude || 17;
							if (label.pos == 'center2') {
								label.pos3d = vector.addVectors([c[0], c[1], c[2] + h], [0, 0, 22]);
							} else if (label.pos == 'center1') {
								var offset = label.offset || [0, 0, 22];
								label.pos3d = vector.addVectors(clone(c), offset);
							} else {
								if (label.pos < polygon.length) {
									var vertexPos = v1[label.pos];
									var v3 = vector.getVectorAB(clone(c), vertexPos);
									var v4 = !un(label.offset) ? label.offset : vector.setMagnitude(v3, n * 1.5);
									label.pos3d = vector.addVectors(vertexPos, v4);
								} else {
									var vertexPos = v2[label.pos % polygon.length];
									var v3 = vector.getVectorAB([c[0], c[1], c[2] + h], vertexPos);
									var v4 = !un(label.offset) ? label.offset : vector.setMagnitude(v3, n * 1.5);
									label.pos3d = vector.addVectors(vertexPos, v4);
								}
							}
						} else if (label.type == 'edge') {
							if (label.pos.length !== 2)
								continue;

							var a = label.pos[0] < polygon.length ? v1[label.pos[0]] : v2[label.pos[0] % polygon.length];

							var b = label.pos[1] < polygon.length ? v1[label.pos[1]] : v2[label.pos[1] % polygon.length];

							var m = vector.addVectors(a, b);
							m = [m[0] / 2, m[1] / 2, m[2] / 2];

							if (!un(label.offset)) {
								var offset = label.offset;
							} else {
								if (label.pos[0] < polygon.length && label.pos[1] < polygon.length) {
									var cent = c;
								} else if (label.pos[0] >= polygon.length && label.pos[1] >= polygon.length) {
									var cent = [c[0], c[1], c[2] + h];
								} else {
									var cent = [c[0], c[1], c[2] + 0.5 * h];
								}

								var n = label.offsetMagnitude || 25;
								var offset = vector.getVectorAB(clone(cent), m);
								var offset = vector.setMagnitude(offset, n * 2);
							}

							label.pos3d = vector.addVectors(m, offset)
						}
					}
				}
				if (!un(path3d.paths)) {
					for (var a = 0; a < path3d.paths.length; a++) {
						if (path3d.paths[a].type == 'angle') {
							var angle = path3d.paths[a];

							var anglePos = [];
							for (var a2 = 0; a2 < 3; a2++) {
								if (typeof angle.pos[a2] == 'number') {
									if (angle.pos[a2] < polygon.length) {
										anglePos[a2] = v1[angle.pos[a2]];
									} else {
										anglePos[a2] = v2[angle.pos[a2] % polygon.length];
									}
								} else if (angle.pos[a2] == 'center1') {
									anglePos[a2] = clone(c);
								} else if (angle.pos[a2] == 'center2') {
									anglePos[a2] = [c[0], c[1], c[2] + h];
								}
							}

							var labelType = 'measure';
							if (angle.labelType == 'none') {
								labelType = 'none';
							} else if (!un(angle.label)) {
								labelType = 'custom';
								if (typeof angle.label == 'string')
									angle.label = [angle.label];
							}
							f.push({
								pos3d: anglePos,
								stroke: false,
								fill: false,
								paths: [{
										type: 'angle',
										pos: clone(anglePos),
										lineColor: angle.lineColor || '#000',
										lineWidth: angle.lineWidth || 2,
										fillColor: angle.fillColor || '#00F',
										radius: angle.radius || 50,
										drawLines: boolean(angle.drawLines, true),
										drawCurve: boolean(angle.drawCurve, true),
										fillTriangle: angle.fillTriangle || 'none',
										lineTriangle: angle.lineTriangle || 'none',
										labelType: labelType,
										label: angle.label || '',
										labelRadius: angle.labelRadius || ((angle.radius || 50) + 25),
										visible: boolean(angle.visible, true)
									}
								]
							});
						}
					}
				}

				return {
					vertices: v,
					edges: e,
					faces: f,
					labels: labels
				};
			},
			pointDragMove: function (obj, path3d, vars) {
				switch (vars.type) {
				case 'polygonPoint':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);
					var polygon = clone(path3d.polygon);
					var snapTo = obj.snapTo || obj.gridStep || 60;
					if (!un(obj.gridBounds)) {
						polygon[vars.pointIndex][0] = bound(pos3d[0], obj.gridBounds[0][0] * obj.gridStep, obj.gridBounds[0][1] * obj.gridStep, snapTo);
						polygon[vars.pointIndex][1] = bound(pos3d[1], obj.gridBounds[1][0] * obj.gridStep, obj.gridBounds[1][1] * obj.gridStep, snapTo);
					} else {
						polygon[vars.pointIndex][0] = bound(pos3d[0], -obj.gridSize, obj.gridSize, obj.snapTo);
						polygon[vars.pointIndex][1] = bound(pos3d[1], -obj.gridSize, obj.gridSize, obj.snapTo);
					}
					if (polygonSelfIntersect2(polygon) == false && polygonConvexTest(polygon) == true)
						path3d.polygon = polygon;
					break;
				case 'center':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);

					var poly = path3d.polygon;
					var xMin = xMax = poly[0][0];
					var yMin = yMax = poly[0][1];
					for (var p = 0; p < poly.length; p++) {
						xMin = Math.min(xMin, poly[p][0]);
						xMax = Math.max(xMax, poly[p][0]);
						yMin = Math.min(yMin, poly[p][1]);
						yMax = Math.max(yMax, poly[p][1]);
					}
					var dxMin = -obj.gridSize - xMin;
					var dxMax = obj.gridSize - xMax;
					var dyMin = -obj.gridSize - yMin;
					var dyMax = obj.gridSize - yMax;
					var dx = bound(pos3d[0] - path3d.center[0], dxMin, dxMax, obj.snapTo);
					var dy = bound(pos3d[1] - path3d.center[1], dyMin, dyMax, obj.snapTo);

					path3d.center[0] += dx;
					path3d.center[1] += dy;
					for (var p = 0; p < path3d.polygon.length; p++) {
						path3d.polygon[p][0] += dx;
						path3d.polygon[p][1] += dy;
					}
					break
				case 'height':
					var center = draw.three.convert3dPosTo2d(obj, path3d.center);
					var snapTo = obj.snapTo || obj.gridStep || 60;
					var height = draw.three.convert2dHeightTo3d(obj, center[1] - draw.mouse[1]);

					if (!un(obj.gridBounds)) {
						height = bound(height, obj.gridBounds[2][0] * obj.gridStep + snapTo, obj.gridBounds[2][1] * obj.gridStep, snapTo);
					} else {
						height = bound(height, -obj.gridSize, obj.gridSize, obj.snapTo);
						height = bound(height, -obj.gridSize, obj.gridSize, obj.snapTo);
					}
					path3d.height = height;

					break;
				}
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < path3d.polygon.length; i++) {
					path3d.polygon[i][0] *= sf;
					path3d.polygon[i][1] *= sf;
				}
				for (var i = 0; i < path3d.center.length; i++)
					path3d.center[i] *= sf;
				path3d.height *= sf;
			}
		},
		prism2: {
			get: function () {
				var obj = sel();
				var polygon = [];
				var da = 2 * Math.PI / 5;
				var a = -da / 2;
				for (var i = 0; i < 5; i++) {
					polygon.push([2 * obj.gridStep * Math.cos(a), 2 * obj.gridStep * Math.sin(a)]);
					a += da;
				}
				drawSelectedPaths();
				return {
					type: 'prism2',
					polygon: polygon,
					height: 4 * obj.gridStep,
					direction: 'z',
					crossSection:{
						pos: 0.4, // 0 to 1
						color: '#00F',
						faceGrid: true
					},
					net:0,
					edit:false,
					colors:{
						ends:'#F00',
						others:'#0CC'
					},
					faceGrid: 'none', // none, ends or all 
					layers: 0
				};
			},
			rotate: function (obj, path3d) {
				path3d.direction = path3d.direction === 'x' ? 'z' : 'x';
			},
			getPos3d: function (path3d, obj) {
				var direction = !un(path3d.direction) ? path3d.direction : 'y';
				var polygon = path3d.polygon;
				if (polygonClockwiseTest(polygon) == true) polygon.reverse();
				var h = path3d.height;
				var v = [], e = [], f = [];
				var endVertices1 = [], endVertices2 = [], csVertices = [];
				if (path3d.center instanceof Array) {
					var c = path3d.center;
				} else {
					var pc = polygonGetCenter(polygon);
					var c = direction === 'x' ? [0,0,pc[1]] : [0,0,h/2];
				}
				var crossSection = path3d.crossSection || {show:false};
				path3d._c = c;
				var colors = clone(path3d.colors) || {};
				if (un(colors.ends)) colors.ends = 'none';
				if (un(colors.others)) colors.others = 'none';
		
				if (direction === 'z') {
					for (var p = 0; p < polygon.length; p++) {
						endVertices1.push([polygon[p][0] + c[0], polygon[p][1] + c[1], c[2] - h/2]);
						endVertices2.push([polygon[p][0] + c[0], polygon[p][1] + c[1], c[2] + h/2]);
						if (crossSection.show !== false) csVertices.push([polygon[p][0] + c[0], polygon[p][1] + c[1], c[2] + h/2 - (crossSection.pos * h)]);
					}
				} else if (direction === 'x') {
					for (var p = 0; p < polygon.length; p++) {
						endVertices1.push([c[0] - h/2, polygon[p][0] + c[1], polygon[p][1] + c[2]]);
						endVertices2.push([c[0] + h/2, polygon[p][0] + c[1], polygon[p][1] + c[2]]);
						if (crossSection.show !== false) csVertices.push([c[0] - h/2 + (crossSection.pos * h), polygon[p][0] + c[1], polygon[p][1] + c[2]]);
					}
				}

				if (typeof path3d.layers === 'number') {
					if (direction === 'z') {
						var layerVertices = [];
						for (var i = 0; i < h/obj.gridStep; i++) {
							var zCenter = c[2] + h/2;
							var z = zCenter + (2*path3d.layers + 1) * (i*obj.gridStep - zCenter) - h/2;
							layerVertices.push([endVertices1.map(function(p) {
								return [p[0],p[1],z];
							}),endVertices1.map(function(p) {
								return [p[0],p[1],z+obj.gridStep];
							})]);
						}
						for (var i = 0; i < layerVertices.length; i++) {
							var lv = layerVertices[i];
							f.push({
								pos3d: clone(lv[0]).reverse(),
								id: 'end1',
								fillStyle: colors.ends,
								drawOrder:i*3
							});
							for (var p = 0; p < polygon.length; p++) {
								var next = (p + 1) % polygon.length;
								f.push({
									pos3d: [lv[0][p], lv[0][next], lv[1][next], lv[1][p]],
									fillStyle: colors.others,
									drawOrder:i*3+1,
									id:'lateral'+i+'-'+p
								});
							}
							f.push({
								pos3d: clone(lv[1]),
								id: 'end2',
								fillStyle: colors.ends,
								drawOrder:i*3+2
							});
						}
					} else {
						var layerVertices = [];
						var centerX = c[0] + h;
						for (var i = 0; i < h/obj.gridStep; i++) {
							var x = centerX + (2*path3d.layers + 1) * (h/2 + i*obj.gridStep - centerX) - h;
							layerVertices.push([endVertices1.map(function(p) {
								return [x,p[1],p[2]];
							}),endVertices1.map(function(p) {
								return [x+obj.gridStep,p[1],p[2]];
							})]);
						}
						for (var i = 0; i < layerVertices.length; i++) {
							var lv = layerVertices[i];
							f.push({
								pos3d: clone(lv[0]).reverse(),
								id: 'end1',
								fillStyle: colors.ends,
								drawOrder:i*3
							});
							for (var p = 0; p < polygon.length; p++) {
								var next = (p + 1) % polygon.length;
								f.push({
									pos3d: [lv[0][p], lv[0][next], lv[1][next], lv[1][p]],
									fillStyle: colors.others,
									drawOrder:i*3+1,
									id:'lateral'+i+'-'+p
								});
							}
							f.push({
								pos3d: clone(lv[1]),
								id: 'end2',
								fillStyle: colors.ends,
								drawOrder:i*3+2
							});
						}
						if (obj.angle < Math.PI) {
							for (var f2 = 0; f2 < f.length; f2++) {
								f[f2].drawOrder *= -1;
							}
						}
					}
				} else if (typeof path3d.net === 'number' && path3d.net > 0) {
					if (direction === 'z') {
						f.push({
							pos3d: clone(endVertices1).reverse(),
							id: 'end1',
							fillStyle: colors.ends
						});
						var angle = path3d.net*Math.PI/2;
						var minZ = endVertices1[0][2];
						var endVertices2Open = clone(endVertices2);
						var transformation = [];
						for (var p = 0; p < polygon.length; p++) {
							var next = (p + 1) % polygon.length;
							var polygon2 = draw.three.rotatePolygonAboutLine([endVertices1[p], endVertices1[next], endVertices2[next], endVertices2[p]],[endVertices1[p], endVertices1[next]],angle);
							f.push({
								pos3d: polygon2,
								fillStyle: colors.others,
								drawFirst: p === 0 ? true : false,
								original3d:clone([endVertices1[p], endVertices1[next], endVertices2[next], endVertices2[p]]),
								transformation:[['rotate',[endVertices1[p], endVertices1[next]],angle]],
								id:'lateral'+p
							});
							if (p === 0) {
								var rotationLine = [polygon2[2],polygon2[3]];
								var offset = vector.getVectorAB(endVertices2Open[0],polygon2[3]);
								endVertices2Open = draw.three.translatePolygon(endVertices2Open,offset);
								transformation.push(['translate',offset]);
								endVertices2Open = draw.three.rotatePolygonAboutLine(endVertices2Open,rotationLine,-2*angle);
								transformation.push(['rotate',rotationLine,-2*angle]);
							}
						}
						
						f.push({
							pos3d: endVertices2Open,
							id: 'end2',
							fillStyle: colors.ends,
							original3d:clone(endVertices2),
							transformation:transformation
						});						
					} else {
						var minZ = endVertices1[0][2];
						var minZIndex = 0;
						for (var p = 1; p < polygon.length; p++) {
							if (endVertices1[p][2] < minZ) {
								minZ = endVertices1[p][2];
								minZIndex = p;
							}
						}

						if (minZIndex > 0) {
							endVertices1 = endVertices1.splice(minZIndex).concat(endVertices1.splice(0,minZIndex-1));
							endVertices2 = endVertices2.splice(minZIndex).concat(endVertices2.splice(0,minZIndex-1));
						}
						
						var endVertices1Open = draw.three.rotatePolygonAboutLine(endVertices1,[endVertices1[0],endVertices1[1]],-1*path3d.net*Math.PI/2);						
						var endVertices2Open = draw.three.rotatePolygonAboutLine(endVertices2,[endVertices2[0],endVertices2[1]],1*path3d.net*Math.PI/2);
						
						var cumulativeAngle = 0;					
						var cw = Math.ceil(polygon.length/2);
						for (var p = 0; p < cw; p++) {
							var prev = p === 0 ? [polygon[p][0]-1,polygon[p][1],polygon[p][2]] : polygon[p-1];
							var curr = polygon[p];
							var next = p === polygon.length-1 ? polygon[0] : polygon[p+1];
							cumulativeAngle += (Math.PI-measureAngle({a:prev,b:polygon[p],c:next}));
							
							var polygon2 = [endVertices1[p], endVertices1[p+1], endVertices2[p+1], endVertices2[p]];
							var transformation = [];
							if (p > 0) {
								var offset = vector.getVectorAB(polygon2[0],f.last().pos3d[1]);
								polygon2 = draw.three.translatePolygon(polygon2,offset);
								transformation.push(['translate',offset]);
							}
							polygon2 = draw.three.rotatePolygonAboutLine(polygon2,[polygon2[0],polygon2[3]],cumulativeAngle*path3d.net);
							transformation.push(['rotate',[polygon2[0],polygon2[3]],cumulativeAngle*path3d.net]);
							
							f.push({
								pos3d: polygon2,
								fillStyle: colors.others,
								drawFirst: p === 0 ? true : false,
								original3d:clone([endVertices1[p], endVertices1[p+1], endVertices2[p+1], endVertices2[p]]),
								transformation:transformation,
								id:'lateral'+p
							});
							
							if (p === 0) {
								for (var p2 = 1; p2 < polygon.length; p2++) {
									var v = vector.getVectorAB([curr[0],curr[1]],[endVertices1Open[p2][1],endVertices1Open[p2][2]]);
									v = rotateVector(v,cumulativeAngle*path3d.net);
									v = vector.addVectors([curr[0],curr[1]],v);
									endVertices1Open[p2] = [endVertices1Open[p2][0],v[0],v[1]];
									endVertices2Open[p2] = [endVertices2Open[p2][0],v[0],v[1]];
									
								}
							}
						}
						cumulativeAngle = 0;
						for (var p = polygon.length-1; p >= cw; p--) {
							var a = polygon[p];
							var b = p === polygon.length-1 ? polygon[0] : polygon[p+1];
							var c = p === polygon.length-1 ? [polygon[0][0]+1,polygon[0][1]] : p === polygon.length-2 ? polygon[0] : polygon[p+2];
							cumulativeAngle += (Math.PI-measureAngle({a:a,b:b,c:c}));
							
							var p2 = p === polygon.length-1 ? 0 : p+1;
							var polygon2 = [endVertices1[p], endVertices1[p2], endVertices2[p2], endVertices2[p]];
							if (p < polygon.length-1) {
								var offset = vector.getVectorAB(polygon2[1],f.last().pos3d[0]);
								polygon2 = draw.three.translatePolygon(polygon2,offset);
								transformation.push(['translate',offset]);
							}
							polygon2 = draw.three.rotatePolygonAboutLine(polygon2,[polygon2[1],polygon2[2]],-cumulativeAngle*path3d.net);		transformation.push(['rotate',[polygon2[1],polygon2[2]],-cumulativeAngle*path3d.net]);
							
							f.push({
								pos3d: polygon2,
								fillStyle: colors.others,
								original3d:clone([endVertices1[p], endVertices1[p2], endVertices2[p2], endVertices2[p]]),
								transformation:transformation								
							});
						}						
						
						f.push({
							pos3d: clone(endVertices1Open).reverse(),
							id: 'end1',
							fillStyle: colors.ends,
							original3d:clone(endVertices1).reverse(),
							transformation:[['rotate',[endVertices1[0],endVertices1[1]],-1*path3d.net*Math.PI/2]]
						},{
							pos3d: clone(endVertices2Open),
							id: 'end2',
							fillStyle: colors.ends,
							original3d:clone(endVertices2),
							transformation:[['rotate',[endVertices2[0],endVertices2[1]],1*path3d.net*Math.PI/2]]
						});
					}
				} else {
					if (direction === 'z') {
						f.push({
							pos3d: clone(endVertices1).reverse(),
							fillStyle: colors.ends,
							id:'end1'
						});
						for (var p = 0; p < polygon.length; p++) {
							var next = (p + 1) % polygon.length;
							f.push({
								pos3d: [endVertices1[p], endVertices1[next], endVertices2[next], endVertices2[p]],
								fillStyle: colors.others,
								id:'lateral'+p
							});
						}
						f.push({
							pos3d: clone(endVertices2),
							paths: [{
									pos: [c[0], c[1], c[2] + h],
									fillStyle: '#060',
									strokeStyle: '#000',
									drag: draw.three.pointDragStart,
									vars: {
										type: 'height'
									},
									path3d: path3d,
									dragOnly: true,
								}
							],
							fillStyle: colors.ends,
							id:'end2'
						});
					} else {
						f.push({
							pos3d: clone(endVertices1).reverse(),
							id: 'end1',
							fillStyle: colors.ends
						});
						
						for (var p = 0; p < polygon.length; p++) {
							var next = (p + 1) % polygon.length;
							f.push({
								pos3d: [endVertices1[p], endVertices1[next], endVertices2[next], endVertices2[p]],
								fillStyle: colors.others,
								drawFirst: p === 0 ? true : false,
								id:'lateral'+p
							});
						}
						f.push({
							pos3d: clone(endVertices2),
							id: 'end2',
							fillStyle: colors.ends
						});
					}
					if (crossSection.show !== false) {
						f.push({
							pos3d: clone(csVertices).reverse(),
							fillStyle: crossSection.color,
							strokeStyle: '#000',
							id:'crossSection'
							//faceGrid: crossSection.faceGrid === true
						});
					}
					if (typeof path3d.explode === 'number' && path3d.explode > 0) {
						path3d._centroid = draw.three.get2dPolygonCentroid(polygon);
						path3d._centroid.unshift(c[0]);
						
						for (var f2 = 0; f2 < f.length; f2++) {
							var face = f[f2];
														
							// get arithmetic mean point of face
							face._center = [0,0,0];
							var np = face.pos3d.length;
							for (var p = 0; p < np; p++) {
								var pos = face.pos3d[p];
								face._center[0] += pos[0];
								face._center[1] += pos[1];
								face._center[2] += pos[2];
							}
							face._center[0] /= np;
							face._center[1] /= np;
							face._center[2] /= np;
							
							face._explodeVector = vector.scalarMult(vector.getVectorAB(path3d._centroid,face._center),path3d.explode);
							if (un(face.transformation)) {
								face.original3d = clone(face.pos3d);
								face.transformation = [];
							}
							face.transformation.push(['translate',face._explodeVector]);
							
							for (var p2 = 0; p2< face.pos3d.length; p2++) {
								face.pos3d[p2] = vector.addVectors(face.pos3d[p2],face._explodeVector);
							}
						}
					}
				}

				if (path3d.faceGrid === 'ends' || (crossSection.show === true && crossSection.faceGrid === true)) {
					var polygon2 = direction === 'z' ? endVertices1.map(function(x) {return [x[0],x[1]];}) : endVertices1.map(function(x) {return [x[1],x[2]];});
					var gridLines2d = draw.three.get2dPolygonGridLines(polygon2, obj.gridStep, true);
					
					var end1Paths = gridLines2d.map(function(x) {
						if (direction === 'z') {
							var gridLine = [[x[0][0],x[0][1],endVertices1[0][2]],[x[1][0],x[1][1],endVertices1[0][2]]];
							
						} else {
							var gridLine = [[endVertices1[0][0],x[0][0],x[0][1]],[endVertices1[0][0],x[1][0],x[1][1]]];
							if (typeof path3d.net === 'number' && path3d.net > 0) {
								gridLine = draw.three.rotatePolygonAboutLine(gridLine,[endVertices1[0],endVertices1[1]],-1*path3d.net*Math.PI/2);
							}
						}
						return {
							type:'lineSegment',
							pos:gridLine,
							lineWidth:2,
							lineColor:'#000'
						}
					});
					var end2Paths = gridLines2d.map(function(x) {
						if (direction === 'z') {
							var gridLine = [[x[0][0],x[0][1],endVertices2[0][2]],[x[1][0],x[1][1],endVertices2[0][2]]];
							var end2 = f.find(function(x) {return x.id === 'end2'});
							if (typeof path3d.net === 'number' && path3d.net > 0 && !un(end2.transformation)) {
								for (var t = 0; t < end2.transformation.length; t++) {
									var trans = end2.transformation[t];
									if (trans[0] === 'translate') {
										gridLine = draw.three.translatePolygon(gridLine,trans[1]);
									} else if (trans[0] === 'rotate') {
										gridLine = draw.three.rotatePolygonAboutLine(gridLine,trans[1],trans[2]);
									}
								}
							}							
						} else {
							var gridLine = [[endVertices2[0][0],x[0][0],x[0][1]],[endVertices2[0][0],x[1][0],x[1][1]]];
							if (typeof path3d.net === 'number' && path3d.net > 0) {
								gridLine = draw.three.rotatePolygonAboutLine(gridLine,[endVertices2[0],endVertices2[1]],1*path3d.net*Math.PI/2);
							}
						}
						return {
							type:'lineSegment',
							pos:gridLine,
							lineWidth:2,
							lineColor:'#000'
						}
					});					
					
					for (var f2 = 0; f2 < f.length; f2++) {
						var face = f[f2];
						if (typeof face.id !== 'string') continue;
						if ((face.id === 'end1' && path3d.faceGrid === 'ends') || (face.id === 'crossSection' && crossSection.show === true && crossSection.faceGrid === true)) {
							face.paths = clone(end1Paths);
							if (face.id === 'crossSection' || typeof path3d.layers === 'number') {
								for (var p = 0; p < face.paths.length; p++) {
									if (direction === 'z') {
										face.paths[p].pos[0][2] = face.pos3d[0][2];
										face.paths[p].pos[1][2] = face.pos3d[0][2];
									} else {
										face.paths[p].pos[0][0] = face.pos3d[0][0];
										face.paths[p].pos[1][0] = face.pos3d[0][0];
									}
								}
							} else if (!un(face._explodeVector)) {
								for (var p = 0; p < face.paths.length; p++) {
									face.paths[p].pos[0] = vector.addVectors(face.paths[p].pos[0],face._explodeVector);
									face.paths[p].pos[1] = vector.addVectors(face.paths[p].pos[1],face._explodeVector);
								}
							}
						} else if (face.id === 'end2' && path3d.faceGrid === 'ends') {
							face.paths = clone(end2Paths);
							if (typeof path3d.layers === 'number') {
								for (var p = 0; p < face.paths.length; p++) {
									if (direction === 'z') {
										face.paths[p].pos[0][2] = face.pos3d[0][2];
										face.paths[p].pos[1][2] = face.pos3d[0][2];
									} else {
										face.paths[p].pos[0][0] = face.pos3d[0][0];
										face.paths[p].pos[1][0] = face.pos3d[0][0];
									}
								}
							} else if (!un(face._explodeVector)) {
								for (var p = 0; p < face.paths.length; p++) {
									face.paths[p].pos[0] = vector.addVectors(face.paths[p].pos[0],face._explodeVector);
									face.paths[p].pos[1] = vector.addVectors(face.paths[p].pos[1],face._explodeVector);
								}
							}						
						}
					}
				}
				
				var labels = path3d.labels || [];
				if (!un(path3d.labels)) {
					for (var l = 0; l < labels.length; l++) {
						var label = labels[l];
						if (path3d.labelsVisible === false) {
							label.visible = false;
							continue;
						} else {
							delete label.visible;
						}
						if (label.type == 'vertex') {
							var n = label.offsetMagnitude || 17;
							if (label.pos == 'center2') {
								label.pos3d = vector.addVectors([c[0], c[1], c[2] + h], [0, 0, 22]);
							} else if (label.pos == 'center1') {
								var offset = label.offset || [0, 0, 22];
								label.pos3d = vector.addVectors(clone(c), offset);
							} else {
								if (label.pos < polygon.length) {
									var vertexPos = v1[label.pos];
									var v3 = vector.getVectorAB(clone(c), vertexPos);
									var v4 = !un(label.offset) ? label.offset : vector.setMagnitude(v3, n * 1.5);
									label.pos3d = vector.addVectors(vertexPos, v4);
								} else {
									var vertexPos = v2[label.pos % polygon.length];
									var v3 = vector.getVectorAB([c[0], c[1], c[2] + h], vertexPos);
									var v4 = !un(label.offset) ? label.offset : vector.setMagnitude(v3, n * 1.5);
									label.pos3d = vector.addVectors(vertexPos, v4);
								}
							}
						} else if (label.type == 'edge') {
							if (label.pos.length !== 2) continue;

							var faceID = label.faceID || 'end1';
							var face = f.find(function(x) {
								return x.id === faceID;
							});
							if (typeof face !== 'object' || face === null) {
								label.show = false;
								continue;
							}
							label.show = true;
							var facePos = !un(face.original3d) ? face.original3d : face.pos3d;
							var a = facePos[label.pos[0]];
							var b = facePos[label.pos[1]];
							var m = [(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
							
							var ma = vector.getVectorAB(m,a);
							var normal = draw.three.getFaceNormal({pos3d:facePos});
							var offset = draw.three.rotatePointAboutLine(ma,[0,0,0],normal,Math.PI/2);
							var mag = label.offsetMagnitude || 30;
							offset = vector.setMagnitude(offset,mag);
							label.pos3d = vector.addVectors(m, offset);
							
							if (face.transformation instanceof Array) {
								for (var t = 0; t < face.transformation.length; t++) {
									var trans = face.transformation[t];
									if (trans[0] === 'translate') {
										label.pos3d = draw.three.translatePolygon([label.pos3d],trans[1])[0];
									} else if (trans[0] === 'rotate') {
										label.pos3d = draw.three.rotatePointAboutLine(label.pos3d,trans[1][0],trans[1][1],trans[2]);
									}
								}
							}
						} else if (label.type == 'custom') {
							var faceID = label.faceID || 'end1';
							label._face = f.find(function(x) {
								return x.id === faceID;
							});
							if (typeof label._face !== 'object' || label._face === null) {
								label.show = false;
								continue;
							}
							label.show = true;
							label.getPos3d(label);
						}
					}
				}
				if (!un(path3d.paths)) {
					for (var a = 0; a < path3d.paths.length; a++) {
						if (path3d.labelsVisible === false) {
							path3d.paths[a].visible = false;
							continue;
						} else {
							delete path3d.paths[a].visible;
						}
						if (path3d.paths[a].type == 'angle') {
							var angle = path3d.paths[a];
							
							if (path3d.faceGrid === 'ends' || (path3d.crossSection.show === true && path3d.crossSection.faceGrid === true)) {
								angle.show = false;
								continue;
							}

							var faceID = angle.faceID;
							angle._face = f.find(function(x) {
								return x.id === faceID;
							});
							if (typeof angle._face !== 'object' || angle._face === null) {
								angle.show = false;
								continue;
							}
							angle.show = true;
							
							var anglePos = angle.pos.map(function(x) {
								return angle._face.pos3d[x];
							});

							var labelType = 'measure';
							if (angle.labelType == 'none') {
								labelType = 'none';
							} else if (!un(angle.label)) {
								labelType = 'custom';
								if (typeof angle.label == 'string')
									angle.label = [angle.label];
							}
							
							if (un(angle._face.paths)) angle._face.paths = [];
							angle._face.paths.push({
								type: 'angle',
								pos: clone(anglePos),
								lineColor: angle.lineColor || '#000',
								lineWidth: angle.lineWidth || 2,
								fillColor: angle.fillColor || 'none',
								radius: angle.radius || 50,
								drawLines: boolean(angle.drawLines, true),
								drawCurve: boolean(angle.drawCurve, true),
								fillTriangle: angle.fillTriangle || 'none',
								lineTriangle: angle.lineTriangle || 'none',
								labelType: labelType,
								label: angle.label || '',
								labelRadius: angle.labelRadius || ((angle.radius || 50) + 25),
								visible: boolean(angle.visible, true),
								forceRightAngle:boolean(angle.forceRightAngle, false)
							});
						} else if (path3d.paths[a].type == 'arrow') {
							var arrow = path3d.paths[a];
							if (typeof arrow.getPos3d === 'function') {
								var faceID = arrow.faceID || 'end1';
								arrow._face = f.find(function(x) {
									return x.id === faceID;
								});
								if (typeof arrow._face !== 'object' || arrow._face === null) {
									arrow.show = false;
									continue;
								}
								arrow.show = true;
								arrow.getPos3d(arrow);
								f.push({
									pos3d: arrow._facePos3d,
									drawFirst: typeof arrow.drawFirst === 'function' ? arrow.drawFirst(arrow,obj) : false,
									drawLast: typeof arrow.drawLast === 'function' ? arrow.drawLast(arrow,obj) : false,
									stroke: false,
									fill: false,
									paths: [arrow]
								});
							}
						}
					}
				}

				//console.log(f);
				return {
					vertices: v,
					edges: e,
					faces: f,
					labels: labels
				};
			},
			

			
			pointDragMove: function (obj, path3d, vars) {
				switch (vars.type) {
					case 'polygonPoint':						
						var end1 = path3d._faces.find(function (x) {
							return x.id === 'end1'
						});
						var p3d = draw.three.get2dPosIntersectionWithPlane(obj,draw.mouse,end1.pos3d[0],end1.normal);
						path3d.polygon[vars.pointIndex] = [p3d[1] - path3d._c[0], p3d[2] - path3d._c[2]];
						
						/*
						var polygon = clone(path3d.polygon);
						var snapTo = obj.snapTo || obj.gridStep || 60;
						if (!un(obj.gridBounds)) {
							polygon[vars.pointIndex][0] = bound(pos3d[0], obj.gridBounds[0][0] * obj.gridStep, obj.gridBounds[0][1] * obj.gridStep, snapTo);
							polygon[vars.pointIndex][1] = bound(pos3d[1], obj.gridBounds[1][0] * obj.gridStep, obj.gridBounds[1][1] * obj.gridStep, snapTo);
						} else {
							polygon[vars.pointIndex][0] = bound(pos3d[0], -obj.gridSize, obj.gridSize, obj.snapTo);
							polygon[vars.pointIndex][1] = bound(pos3d[1], -obj.gridSize, obj.gridSize, obj.snapTo);
						}
						if (polygonSelfIntersect2(polygon) == false && polygonConvexTest(polygon) == true) path3d.polygon = polygon;
						*/
						break;
					case 'center':
						var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);

						var poly = path3d.polygon;
						var xMin = xMax = poly[0][0];
						var yMin = yMax = poly[0][1];
						for (var p = 0; p < poly.length; p++) {
							xMin = Math.min(xMin, poly[p][0]);
							xMax = Math.max(xMax, poly[p][0]);
							yMin = Math.min(yMin, poly[p][1]);
							yMax = Math.max(yMax, poly[p][1]);
						}
						var dxMin = -obj.gridSize - xMin;
						var dxMax = obj.gridSize - xMax;
						var dyMin = -obj.gridSize - yMin;
						var dyMax = obj.gridSize - yMax;
						var dx = bound(pos3d[0] - path3d.center[0], dxMin, dxMax, obj.snapTo);
						var dy = bound(pos3d[1] - path3d.center[1], dyMin, dyMax, obj.snapTo);

						path3d.center[0] += dx;
						path3d.center[1] += dy;
						for (var p = 0; p < path3d.polygon.length; p++) {
							path3d.polygon[p][0] += dx;
							path3d.polygon[p][1] += dy;
						}
						break
					case 'height':
						var end1 = path3d._faces.find(function (x) {
							return x.id === 'end1'
						});
						var p3d = draw.three.get2dPosIntersectionWithPlane(obj,draw.mouse,end1.pos3d[vars.pointIndex],[0,1,0]);
						path3d.height = p3d[0] - end1.pos3d[vars.pointIndex][0];
						
						/*var center = draw.three.convert3dPosTo2d(obj, path3d.center);
						var snapTo = obj.snapTo || obj.gridStep || 60;
						var height = draw.three.convert2dHeightTo3d(obj, center[1] - draw.mouse[1]);

						if (!un(obj.gridBounds)) {
							height = bound(height, obj.gridBounds[2][0] * obj.gridStep + snapTo, obj.gridBounds[2][1] * obj.gridStep, snapTo);
						} else {
							height = bound(height, -obj.gridSize, obj.gridSize, obj.snapTo);
							height = bound(height, -obj.gridSize, obj.gridSize, obj.snapTo);
						}
						path3d.height = height;*/

						break;
				}
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < path3d.polygon.length; i++) {
					path3d.polygon[i][0] *= sf;
					path3d.polygon[i][1] *= sf;
				}
				if (path3d.center instanceof Array) {
					for (var i = 0; i < path3d.center.length; i++) path3d.center[i] *= sf;
				}
				path3d.height *= sf;
			}
		},
		pyramid: {
			get: function () {
				var obj = sel();
				var polygon = [];
				var da = 2 * Math.PI / 5;
				var a = -da / 2;
				for (var i = 0; i < 5; i++) {
					polygon.push([2 * obj.gridStep * Math.cos(a), 2 * obj.gridStep * Math.sin(a)]);
					a += da;
				}
				return {
					type: 'pyramid',
					polygon: polygon.reverse(),
					center: [0, 0, 0],
					height: 4 * obj.gridStep
				};
			},
			rotate: function (obj, path3d) {
				if (un(path3d.direction) || arraysEqual(path3d.direction, [0, 0, 1])) {
					path3d.direction = [1, 0, 0];
					path3d.center = [-obj.gridStep * 3, 0, obj.gridStep * 3];
				} else {
					path3d.direction = [0, 0, 1];
					path3d.center = [0, 0, 0];
				}
			},
			getPos3d: function (path3d) {
				var direction = !un(path3d.direction) ? path3d.direction : [0, 0, 1];
				var polygon = path3d.polygon;
				var c = path3d.center;
				var h = path3d.height;
				if (polygonClockwiseTest(polygon) == false)
					polygon.reverse();
				var vertex = [],
				pos = [],
				v = [],
				e = [],
				f = [];
				var polygonPoints = [];

				if (arraysEqual(direction, [0, 0, 1])) {
					for (var p = 0; p < polygon.length; p++) {
						pos.push([polygon[p][0], polygon[p][1], path3d.center[2]]);
						polygonPoints.push({
							pos: pos[p],
							fillStyle: '#F00',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'polygonPoint',
								pointIndex: p
							},
							path3d: path3d,
							dragOnly: true
						});
					}
					//polygonPoints.push({pos:c,fillStyle:'#00F',strokeStyle:'#000',drag:draw.three.pointDragStart,vars:{type:'center'},path3d:path3d,dragOnly:true});
					vertex = [c[0], c[1], c[2] + h];
				} else if (arraysEqual(direction, [1, 0, 0])) {
					for (var p = 0; p < polygon.length; p++)
						pos.push([path3d.center[0], polygon[p][0], polygon[p][1]]);
					vertex = [c[0] + h, c[1], c[2]];
				} else if (arraysEqual(direction, [0, 1, 0])) {
					for (var p = 0; p < polygon.length; p++)
						pos.push([polygon[p][0], path3d.center[1], polygon[p][1]]);
					vertex = [c[0], c[1] + h, c[2]];
				}

				f.push({
					pos3d: clone(pos),
					paths: polygonPoints
				});

				if (arraysEqual(direction, [0, 0, 1])) {
					f.push({
						pos3d: [[pos[0][0], pos[0][1], pos[0][2] + h], [pos[1][0], pos[1][1], pos[1][2] + h], [pos[2][0], pos[2][1], pos[2][2] + h]],
						fill: false,
						stroke: false,
						paths: [{
								pos: vertex,
								fillStyle: '#060',
								strokeStyle: '#000',
								drag: draw.three.pointDragStart,
								path3d: path3d,
								vars: {
									type: 'height'
								},
								dragOnly: true
							}
						]
					});
				}

				for (var p = 0; p < polygon.length; p++) {
					var next = (p + 1) % polygon.length;
					f.push({
						pos3d: [pos[next], pos[p], vertex]
					});
				}

				var labels = path3d.labels || [];
				if (!un(path3d.labels)) {
					for (var l = 0; l < labels.length; l++) {
						var label = labels[l];
						if (label.type == 'vertex') {
							var n = label.offsetMagnitude || 17;
							if (label.pos == 'apex') {
								label.pos3d = vector.addVectors(clone(vertex), [0, 0, 22]);
							} else if (label.pos == 'center') {
								var offset = label.offset || [n, n, 0];
								label.pos3d = vector.addVectors(clone(c), offset);
							} else {
								var vertexPos = polygonPoints[label.pos];
								var v1 = vector.getVectorAB(clone(c), vertexPos.pos);
								var v2 = vector.setMagnitude(v1, n * 2);
								label.pos3d = vector.addVectors(vertexPos.pos, v2);
							}
						} else if (label.type == 'midpoint') {
							if (label.pos[0] == 'center') {
								var pos1 = clone(c);
							} else if (label.pos[0] == 'apex') {
								var pos1 = clone(vertex);
							} else {
								var pos1 = polygonPoints[label.pos[0]].pos;
							}
							if (label.pos[1] == 'center') {
								var pos2 = clone(c);
							} else if (label.pos[1] == 'apex') {
								var pos2 = clone(vertex);
							} else {
								var pos2 = polygonPoints[label.pos[1]].pos;
							}
							var pos3 = vector.addVectors(pos1, pos2);
							label.pos3d = vector.setMagnitude(pos3, vector.getMagnitude(pos3) / 2);
							if (!un(label.offset)) {
								label.pos3d = vector.addVectors(label.pos3d, label.offset);
							}
						} else if (label.type == 'edge') {
							if (label.pos.length !== 2)
								continue;

							var a = label.pos[0] == 'apex' ? clone(vertex) : label.pos[0] == 'center' ? clone(c) : polygonPoints[label.pos[0]].pos;
							var b = label.pos[1] == 'apex' ? clone(vertex) : label.pos[1] == 'center' ? clone(c) : polygonPoints[label.pos[1]].pos;

							var m = vector.addVectors(a, b);
							m = [m[0] / 2, m[1] / 2, m[2] / 2];

							if (!un(label.offset)) {
								var offset = label.offset;
							} else {
								var n = label.offsetMagnitude || 25;
								var offset = vector.getVectorAB(clone(c), m);
								var offset = vector.setMagnitude(offset, n * 2);
							}

							label.pos3d = vector.addVectors(m, offset)
						}
					}
				}
				if (!un(path3d.paths)) {
					for (var a = 0; a < path3d.paths.length; a++) {
						if (path3d.paths[a].type == 'angle') {
							var angle = path3d.paths[a];

							var anglePos = [];
							for (var a2 = 0; a2 < 3; a2++) {
								if (typeof angle.pos[a2] == 'object') {
									if (angle.pos[a2].type == 'midpoint') {
										if (angle.pos[a2].pos1 == 'center') {
											var pos1 = clone(c);
										} else if (angle.pos[a2].pos1 == 'apex') {
											var pos1 = clone(vertex);
										} else {
											var pos1 = polygonPoints[angle.pos[a2].pos1].pos;
										}
										if (angle.pos[a2].pos2 == 'center') {
											var pos2 = clone(c);
										} else if (angle.pos[a2].pos2 == 'apex') {
											var pos2 = clone(vertex);
										} else {
											var pos2 = polygonPoints[angle.pos[a2].pos2].pos;
										}
										var pos3 = vector.addVectors(pos1, pos2);
										anglePos[a2] = vector.setMagnitude(pos3, vector.getMagnitude(pos3) / 2);
									}
								} else if (typeof angle.pos[a2] == 'number') {
									anglePos[a2] = polygonPoints[angle.pos[a2]].pos;
								} else if (angle.pos[a2] == 'center') {
									anglePos[a2] = clone(c);
								} else if (angle.pos[a2] == 'apex') {
									anglePos[a2] = clone(vertex);
								}
							}

							var labelType = 'measure';
							if (angle.labelType == 'none') {
								labelType = 'none';
							} else if (!un(angle.label)) {
								labelType = 'custom';
								if (typeof angle.label == 'string')
									angle.label = [angle.label];
							}
							f.push({
								pos3d: anglePos,
								stroke: false,
								fill: false,
								paths: [{
										type: 'angle',
										pos: clone(anglePos),
										lineColor: angle.lineColor || '#000',
										lineWidth: angle.lineWidth || 2,
										fillColor: angle.fillColor || '#00F',
										radius: angle.radius || 50,
										drawLines: boolean(angle.drawLines, true),
										drawCurve: boolean(angle.drawCurve, true),
										fillTriangle: angle.fillTriangle || 'none',
										lineTriangle: angle.lineTriangle || 'none',
										labelType: labelType,
										label: angle.label || '',
										labelRadius: angle.labelRadius || ((angle.radius || 50) + 25),
										visible: boolean(angle.visible, true)
									}
								]
							});
						} else if (path3d.paths[a].type == 'lineSegment') {
							var lineSegment = path3d.paths[a];

							var a = lineSegment.pos[0] == 'apex' ? clone(vertex) : lineSegment.pos[0] == 'center' ? clone(c) : polygonPoints[lineSegment.pos[0]].pos;
							var b = lineSegment.pos[1] == 'apex' ? clone(vertex) : lineSegment.pos[1] == 'center' ? clone(c) : polygonPoints[lineSegment.pos[1]].pos;

							/*var pos3 = vector.addVectors(p[lineSegment.pos[1]],[0,0.-103]);
							var lineSegmentPos = [
							p[lineSegment.pos[0]],
							p[lineSegment.pos[1]],
							pos3
							];*/
							f.push({
								pos3d: [a, b],
								stroke: false,
								fill: false,
								paths: [{
										type: 'lineSegment',
										pos: [a, b],
										lineColor: lineSegment.lineColor || lineSegment.color || '#00F',
										lineWidth: lineSegment.lineWidth || lineSegment.width || 2,
										visible: boolean(lineSegment.visible, true)
									}
								]
							});
						}
					}
				}

				return {
					vertices: v,
					edges: e,
					faces: f,
					labels: labels
				};
			},
			pointDragMove: function (obj, path3d, vars) {
				switch (vars.type) {
				case 'polygonPoint':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);
					var polygon = clone(path3d.polygon);
					var snapTo = obj.snapTo || obj.gridStep || 60;
					if (!un(obj.gridBounds)) {
						polygon[vars.pointIndex][0] = bound(pos3d[0], obj.gridBounds[0][0] * obj.gridStep, obj.gridBounds[0][1] * obj.gridStep, snapTo);
						polygon[vars.pointIndex][1] = bound(pos3d[1], obj.gridBounds[1][0] * obj.gridStep, obj.gridBounds[1][1] * obj.gridStep, snapTo);
					} else {
						polygon[vars.pointIndex][0] = bound(pos3d[0], -obj.gridSize, obj.gridSize, obj.snapTo);
						polygon[vars.pointIndex][1] = bound(pos3d[1], -obj.gridSize, obj.gridSize, obj.snapTo);
					}
					if (polygonSelfIntersect2(polygon) == false && polygonConvexTest(polygon) == true)
						path3d.polygon = polygon;
					break;
				case 'center':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);

					var poly = path3d.polygon;
					var xMin = xMax = poly[0][0];
					var yMin = yMax = poly[0][1];
					for (var p = 0; p < poly.length; p++) {
						xMin = Math.min(xMin, poly[p][0]);
						xMax = Math.max(xMax, poly[p][0]);
						yMin = Math.min(yMin, poly[p][1]);
						yMax = Math.max(yMax, poly[p][1]);
					}
					var dxMin = -obj.gridSize - xMin;
					var dxMax = obj.gridSize - xMax;
					var dyMin = -obj.gridSize - yMin;
					var dyMax = obj.gridSize - yMax;
					var dx = bound(pos3d[0] - path3d.center[0], dxMin, dxMax, obj.snapTo);
					var dy = bound(pos3d[1] - path3d.center[1], dyMin, dyMax, obj.snapTo);

					path3d.center[0] += dx;
					path3d.center[1] += dy;
					for (var p = 0; p < path3d.polygon.length; p++) {
						path3d.polygon[p][0] += dx;
						path3d.polygon[p][1] += dy;
					}
					break
				case 'height':
					var center = draw.three.convert3dPosTo2d(obj, path3d.center);
					var snapTo = obj.snapTo || obj.gridStep || 60;
					var height = draw.three.convert2dHeightTo3d(obj, center[1] - draw.mouse[1]);

					if (!un(obj.gridBounds)) {
						height = bound(height, obj.gridBounds[2][0] * obj.gridStep + snapTo, obj.gridBounds[2][1] * obj.gridStep, snapTo);
					} else {
						height = bound(height, -obj.gridSize, obj.gridSize, obj.snapTo);
						height = bound(height, -obj.gridSize, obj.gridSize, obj.snapTo);
					}
					path3d.height = height;
					break;
				}
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < path3d.polygon.length; i++) {
					path3d.polygon[i][0] *= sf;
					path3d.polygon[i][1] *= sf;
				}
				for (var i = 0; i < path3d.center.length; i++)
					path3d.center[i] *= sf;
				path3d.height *= sf;
			}
		},
		skewPyramid: {
			getPos3d: function (path3d) {
				var polygon = path3d.polygon;
				var c = path3d.center;
				var vertex = path3d.vertex;
				if (polygonClockwiseTest(polygon) == false)
					polygon.reverse();
				var pos = [],
				v = [],
				e = [],
				f = [];

				for (var p = 0; p < polygon.length; p++) {
					pos.push([polygon[p][0], polygon[p][1], path3d.center[2]]);
				}

				f.push({
					pos3d: clone(pos)
				});

				if (boolean(path3d.showSides, true) !== false) {
					for (var p = 0; p < polygon.length; p++) {
						var next = (p + 1) % polygon.length;
						f.push({
							pos3d: [pos[next], pos[p], vertex]
						});
					}
				}

				var labels = path3d.labels || [];
				if (!un(path3d.labels)) {
					for (var l = 0; l < labels.length; l++) {
						var label = labels[l];
						if (label.type == 'vertex') {
							var n = label.offsetMagnitude || 17;
							if (label.pos == 'apex') {
								label.pos3d = vector.addVectors(clone(vertex), [0, 0, 22]);
							} else {
								var vertexPos = pos[label.pos];
								var v1 = vector.getVectorAB(clone(c), vertexPos);
								var v2 = vector.setMagnitude(v1, n * 2);
								label.pos3d = vector.addVectors(vertexPos, v2);
							}
						} else if (label.type == 'midpoint') {
							if (label.pos[0] == 'apex') {
								var pos1 = clone(vertex);
							} else {
								var pos1 = pos[label.pos[0]];
							}
							if (label.pos[1] == 'apex') {
								var pos2 = clone(vertex);
							} else {
								var pos2 = pos[label.pos[1]];
							}
							var pos3 = vector.addVectors(pos1, pos2);
							label.pos3d = vector.setMagnitude(pos3, vector.getMagnitude(pos3) / 2);
							if (!un(label.offset)) {
								label.pos3d = vector.addVectors(label.pos3d, label.offset);
							}
						} else if (label.type == 'edge') {
							if (label.pos.length !== 2)
								continue;

							var a = label.pos[0] == 'apex' ? clone(vertex) : pos[label.pos[0]];
							var b = label.pos[1] == 'apex' ? clone(vertex) : pos[label.pos[1]];

							var m = vector.addVectors(a, b);
							m = [m[0] / 2, m[1] / 2, m[2] / 2];

							if (!un(label.offset)) {
								var offset = label.offset;
							} else {
								var n = label.offsetMagnitude || 25;
								var offset = vector.getVectorAB(clone(c), m);
								var offset = vector.setMagnitude(offset, n * 2);
							}

							label.pos3d = vector.addVectors(m, offset)
						}
					}
				}
				if (!un(path3d.paths)) {
					for (var a = 0; a < path3d.paths.length; a++) {
						if (path3d.paths[a].type == 'angle') {
							var angle = path3d.paths[a];

							var anglePos = [];
							for (var a2 = 0; a2 < 3; a2++) {
								if (typeof angle.pos[a2] == 'object') {
									if (angle.pos[a2].type == 'midpoint') {
										if (angle.pos[a2].pos1 == 'apex') {
											var pos1 = clone(vertex);
										} else {
											var pos1 = pos[angle.pos[a2].pos1];
										}
										if (angle.pos[a2].pos2 == 'apex') {
											var pos2 = clone(vertex);
										} else {
											var pos2 = pos[angle.pos[a2].pos2];
										}
										var pos3 = vector.addVectors(pos1, pos2);
										anglePos[a2] = vector.setMagnitude(pos3, vector.getMagnitude(pos3) / 2);
									}
								} else if (typeof angle.pos[a2] == 'number') {
									anglePos[a2] = pos[angle.pos[a2]];
								} else if (angle.pos[a2] == 'apex') {
									anglePos[a2] = clone(vertex);
								}
							}

							var labelType = 'measure';
							if (angle.labelType == 'none') {
								labelType = 'none';
							} else if (!un(angle.label)) {
								labelType = 'custom';
								if (typeof angle.label == 'string')
									angle.label = [angle.label];
							}
							f.push({
								pos3d: anglePos,
								stroke: false,
								fill: false,
								paths: [{
										type: 'angle',
										pos: clone(anglePos),
										lineColor: angle.lineColor || '#000',
										lineWidth: angle.lineWidth || 2,
										fillColor: angle.fillColor || '#00F',
										radius: angle.radius || 50,
										drawLines: boolean(angle.drawLines, true),
										drawCurve: boolean(angle.drawCurve, true),
										fillTriangle: angle.fillTriangle || 'none',
										lineTriangle: angle.lineTriangle || 'none',
										labelType: labelType,
										label: angle.label || '',
										labelRadius: angle.labelRadius || ((angle.radius || 50) + 25),
										visible: boolean(angle.visible, true)
									}
								]
							});
						} else if (path3d.paths[a].type == 'polygon') {
							var polygon = path3d.paths[a];

							var polygonPos = [];
							for (var a2 = 0; a2 < polygon.pos.length; a2++) {
								if (typeof polygon.pos[a2] == 'object') {
									if (polygon.pos[a2].type == 'midpoint') {
										if (polygon.pos[a2].pos1 == 'apex') {
											var pos1 = clone(vertex);
										} else {
											var pos1 = pos[polygon.pos[a2].pos1];
										}
										if (polygon.pos[a2].pos2 == 'apex') {
											var pos2 = clone(vertex);
										} else {
											var pos2 = pos[polygon.pos[a2].pos2];
										}
										var pos3 = vector.addVectors(pos1, pos2);
										polygonPos[a2] = vector.setMagnitude(pos3, vector.getMagnitude(pos3) / 2);
									}
								} else if (typeof polygon.pos[a2] == 'number') {
									polygonPos[a2] = pos[polygon.pos[a2]];
								} else if (polygon.pos[a2] == 'apex') {
									polygonPos[a2] = clone(vertex);
								}
							}

							f.push({
								pos3d: polygonPos,
								stroke: false,
								fill: false,
								paths: [{
										type: 'polygon',
										pos: clone(polygonPos),
										lineColor: polygon.lineColor || '#000',
										lineWidth: polygon.lineWidth || 2,
										fillColor: polygon.fillColor || '#00F',
										visible: boolean(polygon.visible, true)
									}
								]
							});
						} else if (path3d.paths[a].type == 'lineSegment') {
							var lineSegment = path3d.paths[a];

							var b = lineSegment.pos[0] == 'apex' ? clone(vertex) : lineSegment.pos[0] == 'center' ? clone(c) : pos[lineSegment.pos[0]];
							var c = lineSegment.pos[1] == 'apex' ? clone(vertex) : lineSegment.pos[1] == 'center' ? clone(c) : pos[lineSegment.pos[1]];

							/*var pos3 = vector.addVectors(p[lineSegment.pos[1]],[0,0.-103]);
							var lineSegmentPos = [
							p[lineSegment.pos[0]],
							p[lineSegment.pos[1]],
							pos3
							];*/
							f.push({
								pos3d: [b, c],
								stroke: false,
								fill: false,
								paths: [{
										type: 'lineSegment',
										pos: [b, c],
										lineColor: lineSegment.lineColor || lineSegment.color || '#00F',
										lineWidth: lineSegment.lineWidth || lineSegment.width || 2,
										visible: boolean(lineSegment.visible, true)
									}
								]
							});
						}
					}
				}

				return {
					vertices: v,
					edges: e,
					faces: f,
					labels: labels
				};
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < path3d.polygon.length; i++) {
					path3d.polygon[i][0] *= sf;
					path3d.polygon[i][1] *= sf;
				}
				for (var i = 0; i < path3d.center.length; i++)
					path3d.center[i] *= sf;
				for (var i = 0; i < path3d.vertex.length; i++)
					path3d.vertex[i] *= sf;
			}
		},
		cylinder: {
			get: function () {
				var obj = sel();
				return {
					type: 'cylinder',
					center: [0, 0, 0],
					radius: 2 * obj.gridStep,
					height: 4 * obj.gridStep
				};
			},
			rotate: function (obj, path3d) {
				if (un(path3d.direction) || arraysEqual(path3d.direction, [0, 0, 1])) {
					path3d.direction = [1, 0, 0];
					path3d.center = [-obj.gridStep * 3, 0, obj.gridStep * 3];
				} else {
					path3d.direction = [0, 0, 1];
					path3d.center = [0, 0, 0];
				}
			},
			getPos3d: function (path3d,obj) {
				var viewAngle = obj.angle;
				//console.log(viewAngle);
				
				var direction = !un(path3d.direction) ? path3d.direction : [0, 0, 1];
				var closed = !un(path3d.closed) ? path3d.closed : [true, true];
				var c = path3d.center;
				var r = path3d.radius;
				var h = path3d.height;
				var f = [],
				e = [],
				v = [],
				v1 = [],
				v2 = [];
				var density = 100;
				var dAngle = 2 * Math.PI / density;
				var angle = 0;
				var paths1 = [];
				var paths2 = [];

				if (arraysEqual(direction, [0, 0, 1])) {
					for (var i = 0; i < density; i++) {
						v1.push([c[0] + r * Math.cos(angle), c[1] + r * Math.sin(angle), 0]);
						v2.push([c[0] + r * Math.cos(angle), c[1] + r * Math.sin(angle), h]);
						angle += dAngle;
					}
					paths1 = [{
							pos: c,
							fillStyle: '#F00',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'center'
							},
							path3d: path3d,
							dragOnly: true
						}, {
							pos: [c[0] + r, c[1], c[2]],
							fillStyle: '#00F',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'radius'
							},
							path3d: path3d,
							dragOnly: true
						}
					];
					paths2 = [{
							pos: [c[0], c[1], c[2] + h],
							fillStyle: '#060',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'height'
							},
							path3d: path3d,
							dragOnly: true
						}
					];
				} else if (arraysEqual(direction, [1, 0, 0])) {
					for (var i = 0; i < density; i++) {
						v1.push([0, c[0] + r * Math.cos(angle), c[1] + r * Math.sin(angle)]);
						v2.push([h, c[0] + r * Math.cos(angle), c[1] + r * Math.sin(angle)]);
						angle += dAngle;
					}
				} else if (arraysEqual(direction, [0, 1, 0])) {
					for (var i = 0; i < density; i++) {
						v1.push([c[0] + r * Math.cos(angle), 0, c[1] + r * Math.sin(angle)]);
						v2.push([c[0] + r * Math.cos(angle), h, c[1] + r * Math.sin(angle)]);
						angle += dAngle;
					}
				};

				f.push({
					pos3d: clone(v1).reverse(),
					paths: paths1,
					drawOrder: 0
				});
				for (var i = 0; i < density; i++) {
					var next = (i + 1) % density;
					f.push({
						pos3d: [v1[i], v1[next], v2[next], v2[i]],
						stroke: false,
						drawOrder: i+1
					});
				}
				f.push({
					pos3d: clone(v2),
					paths: paths2,
					drawOrder: density+1
				});

				return {
					vertices: v,
					edges: e,
					faces: f
				};
			},
			pointDragMove: function (obj, path3d, vars) {
				switch (vars.type) {
				case 'center':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);
					path3d.center[0] = bound(pos3d[0], -obj.gridSize + path3d.radius, obj.gridSize - path3d.radius, obj.snapTo);
					path3d.center[1] = bound(pos3d[1], -obj.gridSize + path3d.radius, obj.gridSize - path3d.radius, obj.snapTo);
					break
				case 'radius':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);
					var rMax = Math.min(Math.abs(-obj.gridSize - path3d.center[0]), Math.abs(obj.gridSize - path3d.center[0]), Math.abs(-obj.gridSize - path3d.center[1]), Math.abs(obj.gridSize - path3d.center[1]));
					path3d.radius = Math.min(rMax, Math.abs(pos3d[0] - path3d.center[0]));
					break;
				case 'height':
					var center = draw.three.convert3dPosTo2d(obj, path3d.center);
					path3d.height = draw.three.snapPos(obj, draw.three.convert2dHeightTo3d(obj, center[1] - draw.mouse[1]), 2);
					break;
				}
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < path3d.center.length; i++)
					path3d.center[i] *= sf;
				path3d.radius *= sf;
				path3d.height *= sf;
			}
		},

		cone: {
			get: function () {
				var obj = sel();
				return {
					type: 'cone',
					center: [0, 0, 0],
					radius: 2 * obj.gridStep,
					height: 4 * obj.gridStep
				};
			},
			rotate: function (obj, path3d) {
				if (un(path3d.direction) || arraysEqual(path3d.direction, [0, 0, 1])) {
					path3d.direction = [0, 0, -1];
					path3d.center[2] = obj.gridStep * 5;
				} else {
					path3d.direction = [0, 0, 1];
					path3d.center[2] = 0;
				}
			},
			getPos3d: function (path3d) {
				var direction = !un(path3d.direction) ? path3d.direction : [0, 0, 1];
				var c = path3d.center;
				var r = path3d.radius;
				var h = path3d.height;
				var p = [],
				v = [],
				e = [],
				f = [],
				paths1 = [],
				paths2 = [];

				var density = 200;
				var dAngle = 2 * Math.PI / density;
				var angle = 0;

				if (arraysEqual(direction, [0, 0, 1])) {
					var vertex = [c[0], c[1], c[2] + h];
					for (var i = 0; i < density; i++) {
						p.push([c[0] + r * Math.cos(angle), c[1] + r * Math.sin(angle), c[2]]);
						angle += dAngle;
					}
					paths1 = [{
							pos: c,
							fillStyle: '#F00',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'center'
							},
							path3d: path3d,
							dragOnly: true
						}, {
							pos: [c[0] + r, c[1], c[2]],
							fillStyle: '#00F',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'radius'
							},
							path3d: path3d,
							dragOnly: true
						},
					];
					paths2 = [{
							pos: vertex,
							fillStyle: '#060',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							path3d: path3d,
							vars: {
								type: 'height'
							},
							dragOnly: true
						}
					];
				} else if (arraysEqual(direction, [0, 0, -1])) {
					var vertex = [c[0], c[1], c[2] - h];
					for (var i = 0; i < density; i++) {
						p.push([c[0] + r * Math.cos(angle), c[1] + r * Math.sin(angle), c[2]]);
						angle += dAngle;
					}
				}

				f.push({
					pos3d: clone(p).reverse(),
					paths: paths1
				});
				for (var i = 0; i < density; i++) {
					var next = (i + 1) % density;
					f.push({
						pos3d: [p[next], p[i], vertex].reverse(),
						stroke: false
					});
				}
				f.push({
					pos3d: [[p[0][0], p[0][1], p[0][2] + h], [p[1][0], p[1][1], p[1][2] + h], [p[2][0], p[2][1], p[2][2] + h]],
					fill: false,
					stroke: false,
					paths: paths2
				});

				return {
					vertices: v,
					edges: e,
					faces: f
				};
			},
			drawEdges: function (ctx, obj, path3d) {
				var v3d = [path3d.center[0], path3d.center[1], path3d.center[2] + path3d.height];
				var v2d = draw.three.convert3dPosTo2d(obj, v3d);
				var c2d = draw.three.convert3dPosTo2d(obj, path3d.center);
				var rY = path3d.radius * obj.tilt;

				ctx.fillStyle = '#000';
				ctx.beginPath();
				ctx.arc(v2d[0], v2d[1], 1, 0, Math.PI * 2);
				ctx.fill();

				return;

				/*if (c2d[1] - v2d[1] < rY) {
				ctx.fillStyle = '#000';
				ctx.beginPath();
				ctx.arc(v2d[0],v2d[1],2,0,Math.PI*2);
				ctx.fill();
				} else {
				var p1 = [c2d[0]-path3d.radius,c2d[1]];
				var p2 = [c2d[0]+path3d.radius,c2d[1]];
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000';
				ctx.beginPath();
				ctx.moveTo(p1[0],p1[1]);
				ctx.lineTo(v2d[0],v2d[1]);
				ctx.lineTo(p2[0],p2[1]);
				ctx.stroke();
				}*/
			},
			pointDragMove: function (obj, path3d, vars) {
				switch (vars.type) {
				case 'center':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);
					path3d.center[0] = bound(pos3d[0], -obj.gridSize + path3d.radius, obj.gridSize - path3d.radius, obj.snapTo);
					path3d.center[1] = bound(pos3d[1], -obj.gridSize + path3d.radius, obj.gridSize - path3d.radius, obj.snapTo);
					break;
				case 'radius':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);
					var rMax = Math.min(
							Math.abs(-obj.gridSize - path3d.center[0]),
							Math.abs(obj.gridSize - path3d.center[0]),
							Math.abs(-obj.gridSize - path3d.center[1]),
							Math.abs(obj.gridSize - path3d.center[1]));
					path3d.radius = Math.min(rMax, Math.abs(pos3d[0] - path3d.center[0]));
					break;
				case 'height':
					var center = draw.three.convert3dPosTo2d(obj, path3d.center);
					path3d.height = draw.three.snapPos(obj, draw.three.convert2dHeightTo3d(obj, center[1] - draw.mouse[1]), 2);
					break;
				}
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < path3d.center.length; i++)
					path3d.center[i] *= sf;
				path3d.radius *= sf;
				path3d.height *= sf;
			}
		},
		frustum: {
			get: function () {
				var obj = sel();
				return {
					type: 'frustum',
					center: [0, 0, 0],
					radius: [2 * obj.gridStep, 1.5 * obj.gridStep],
					height: 4 * obj.gridStep
				};
			},
			getPos3d: function (path3d) {
				var direction = !un(path3d.direction) ? path3d.direction : [0, 0, 1];
				var closed = !un(path3d.closed) ? path3d.closed : [true, true];
				var c = path3d.center;
				var r1 = path3d.radius[0];
				var r2 = path3d.radius[1];
				var h = path3d.height;
				var v = [],
				e = [],
				f = [];
				var v1 = [],
				v2 = [];
				var density = 200;
				var dAngle = 2 * Math.PI / density;
				var angle = 0;
				if (arraysEqual(direction, [0, 0, 1])) {
					for (var i = 0; i < density; i++) {
						v1.push([c[0] + r1 * Math.cos(angle), c[1] + r1 * Math.sin(angle), 0]);
						v2.push([c[0] + r2 * Math.cos(angle), c[1] + r2 * Math.sin(angle), h]);
						angle += dAngle;
					}
				} else if (arraysEqual(direction, [1, 0, 0])) {
					for (var i = 0; i < density; i++) {
						v1.push([0, c[0] + r1 * Math.cos(angle), c[1] + r1 * Math.sin(angle)]);
						v2.push([h, c[0] + r2 * Math.cos(angle), c[1] + r2 * Math.sin(angle)]);
						angle += dAngle;
					}
				} else if (arraysEqual(direction, [0, 1, 0])) {
					for (var i = 0; i < density; i++) {
						v1.push([c[0] + r1 * Math.cos(angle), 0, c[1] + r1 * Math.sin(angle)]);
						v2.push([c[0] + r2 * Math.cos(angle), h, c[1] + r2 * Math.sin(angle)]);
						angle += dAngle;
					}
				};

				/*if (closed[0] == true)*/
				f.push({
					pos3d: clone(v1).reverse(),
					paths: [{
							pos: c,
							fillStyle: '#F00',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'center'
							},
							path3d: path3d,
							dragOnly: true
						}, {
							pos: [c[0] + r1, c[1], c[2]],
							fillStyle: '#00F',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'radius1'
							},
							path3d: path3d,
							dragOnly: true
						},
					]
				});

				for (var i = 0; i < density; i++) {
					var next = (i + 1) % density;
					f.push({
						pos3d: [v1[i], v1[next], v2[next], v2[i]],
						stroke: false
					});
				}
				/*if (closed[1] == true)*/
				f.push({
					pos3d: clone(v2),
					paths: [{
							pos: [c[0], c[1], c[2] + h],
							fillStyle: '#060',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'height'
							},
							path3d: path3d,
							dragOnly: true
						}, {
							pos: [c[0] + r2, c[1], c[2] + h],
							fillStyle: '#00F',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'radius2'
							},
							path3d: path3d,
							dragOnly: true
						},
					]
				});
				return {
					vertices: v,
					edges: e,
					faces: f
				};
			},
			pointDragMove: function (obj, path3d, vars) {
				switch (vars.type) {
				case 'center':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);
					var r = Math.max(path3d.radius[0], path3d.radius[1]);
					path3d.center[0] = bound(pos3d[0], -obj.gridSize + r, obj.gridSize - r, obj.snapTo);
					path3d.center[1] = bound(pos3d[1], -obj.gridSize + r, obj.gridSize - r, obj.snapTo);
					break;
				case 'radius1':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);
					var rMax = Math.min(
							Math.abs(-obj.gridSize - path3d.center[0]),
							Math.abs(obj.gridSize - path3d.center[0]),
							Math.abs(-obj.gridSize - path3d.center[1]),
							Math.abs(obj.gridSize - path3d.center[1]));
					path3d.radius[0] = Math.min(rMax, Math.abs(pos3d[0] - path3d.center[0]));
					break;
				case 'radius2':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse, path3d.height);
					var rMax = Math.min(
							Math.abs(-obj.gridSize - path3d.center[0]),
							Math.abs(obj.gridSize - path3d.center[0]),
							Math.abs(-obj.gridSize - path3d.center[1]),
							Math.abs(obj.gridSize - path3d.center[1]));
					path3d.radius[1] = Math.min(rMax, Math.abs(pos3d[0] - path3d.center[0]));
					break;
				case 'height':
					var center = draw.three.convert3dPosTo2d(obj, path3d.center);
					path3d.height = draw.three.snapPos(obj, draw.three.convert2dHeightTo3d(obj, center[1] - draw.mouse[1]), 2);
					break;
				}
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < path3d.center.length; i++)
					path3d.center[i] *= sf;
				path3d.radius[0] *= sf;
				path3d.radius[1] *= sf;
				path3d.height *= sf;
			}
		},
		sphere: {
			get: function () {
				var obj = sel();
				return {
					type: 'sphere',
					center: [0, 0, 2 * obj.gridStep],
					radius: 2 * obj.gridStep
				};
			},
			getPos3d: function (path3d) {
				var c = path3d.center;
				var r = path3d.radius;
				var f = [],
				e = [],
				v = [];
				var density = 30; // must be even
				var dAngle = 2 * Math.PI / density;

				var angle1 = 0;
				var angle2 = 0;

				var pos = [];
				for (var i = 0; i < density; i++) {
					var pos2 = [];
					for (var j = 0; j < density; j++) {
						pos2.push([c[0] + r * (Math.sin(angle2) * Math.sin(angle1)), c[1] + r * Math.cos(angle2), c[2] + r * Math.sin(angle2) * Math.cos(angle1)]);
						angle2 += dAngle;
					}
					pos.push(pos2);
					angle1 += dAngle;
				}

				f.push({
					pos3d: [[c[0], c[1], c[2] - r], [c[0] - 1, c[1], c[2] - r], [c[0], c[1] - 1, c[2] - r]],
					stroke: false,
					fill: false,
					paths: [{
							pos: [c[0], c[1], c[2] - r],
							fillStyle: '#F00',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'center'
							},
							path3d: path3d,
							dragOnly: true
						},
					]
				});
				for (var i = 0; i < pos.length; i++) {
					var p1 = pos[i];
					var p2 = pos[(i + 1) % pos.length];
					for (var j = 0; j < p1.length / 2; j++) {
						var next = (j + 1) % p1.length;
						if (j == 0) {
							var pos2 = [p1[j], p1[next], p2[next]];
							f.push({
								pos3d: pos2,
								stroke: false
							});
						} else {
							var pos2 = [p1[j], p1[next], p2[next], p2[j]];
							f.push({
								pos3d: pos2,
								stroke: false
							});
						}
					}
				}
				f.push({
					pos3d: [[c[0], c[1], c[2] + r], [c[0] - 1, c[1], c[2] + r], [c[0], c[1] + 1, c[2] - r]].reverse(),
					stroke: false,
					fill: false,
					paths: [{
							pos: [c[0], c[1], c[2] + r],
							fillStyle: '#060',
							strokeStyle: '#000',
							drag: draw.three.pointDragStart,
							vars: {
								type: 'height'
							},
							path3d: path3d,
							dragOnly: true
						},
					]
				});

				return {
					vertices: v,
					edges: e,
					faces: f
				};
			},
			pointDragMove: function (obj, path3d, vars) {
				switch (vars.type) {
				case 'center':
					var pos3d = draw.three.convert2dPosTo3d(obj, draw.mouse);
					path3d.center[0] = bound(pos3d[0], -obj.gridSize + path3d.radius, obj.gridSize - path3d.radius, obj.snapTo);
					path3d.center[1] = bound(pos3d[1], -obj.gridSize + path3d.radius, obj.gridSize - path3d.radius, obj.snapTo);
					break;
				case 'height':
					var center = draw.three.convert3dPosTo2d(obj, [path3d.center[0], path3d.center[1], 0]);
					path3d.radius = bound((draw.three.convert2dHeightTo3d(obj, center[1] - draw.mouse[1])) / 2, obj.snapTo / 2, obj.gridSize, obj.snapTo / 2);
					path3d.center[2] = path3d.radius;
					break;
				}
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < path3d.center.length; i++)
					path3d.center[i] *= sf;
				path3d.radius *= sf;
			}
		},
		cubeNet: {
			get: function () {
				var obj = sel();
				return {
					type: 'cubeNet',
					center: [0, 0, 0],
					width: obj.gridStep,
					open: 1
				}; // open: 1=closed, 0=open
			},
			getPos3d: function (path3d) {
				var c = path3d.center,
				w = path3d.width,
				o = path3d.open;
				var v = [],
				e = [],
				f = [];
				var p = [
					[c[0], c[1], c[2]],
					[c[0] + w, c[1], c[2]],
					[c[0] + w, c[1] + w, c[2]],
					[c[0], c[1] + w, c[2]]
				];
				var f = [{
						pos3d: [p[3], p[2], p[1], p[0]]
					}
				];
				for (var f2 = 0; f2 < 4; f2++) {
					var p1 = p[f2];
					var p2 = p[(f2 + 1) % 4];

					var vector1 = draw.three.getNormalToPlaneFromThreePoints(p1, p2, [p1[0], p1[1], p1[2] + 1]);
					var vector2 = [0, 0, w];
					var angle = o * draw.three.getAngleBetweenTwo3dVectors(vector1, vector2);
					var vector3 = [
						vector1[0] * Math.cos(angle) + vector2[0] * Math.sin(angle),
						vector1[1] * Math.cos(angle) + vector2[1] * Math.sin(angle),
						vector1[2] * Math.cos(angle) + vector2[2] * Math.sin(angle)
					];
					var p3 = [p1[0] + vector3[0], p1[1] + vector3[1], p1[2] + vector3[2]];
					var p4 = [p2[0] + vector3[0], p2[1] + vector3[1], p2[2] + vector3[2]];

					f.push({
						pos3d: [p1, p2, p4, p3]
					});
					if (f2 == 0) {
						var vector4 = [0, w, 0];
						var angle2 = o * 0.5 * Math.PI; //draw.three.getAngleBetweenTwo3dVectors(vector3,vector4);
						var vector5 = [
							vector3[0] * Math.cos(angle2) + vector4[0] * Math.sin(angle2),
							vector3[1] * Math.cos(angle2) + vector4[1] * Math.sin(angle2),
							vector3[2] * Math.cos(angle2) + vector4[2] * Math.sin(angle2)
						];
						var p5 = [p3[0] + vector5[0], p3[1] + vector5[1], p3[2] + vector5[2]];
						var p6 = [p4[0] + vector5[0], p4[1] + vector5[1], p4[2] + vector5[2]];

						f.push({
							pos3d: [p3, p4, p6, p5]
						});
					}
				}

				return {
					vertices: v,
					edges: e,
					faces: f
				};
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < path3d.center.length; i++)
					path3d.center[i] *= sf;
				path3d.width *= sf;
			}
		},
		cuboidNet: {
			get: function () {
				var obj = sel();
				return {
					type: 'cuboidNet',
					pos: [-1.5*35, -2*35, -2.5*35],
					dims: [3*35, 4*35, 5*35],
					open: 1,
					directionalColors:true,
					faceGrid:35
				}; // open: 1=closed, 0=open
			},
			getPos3d: function (path3d) {
				var pos = path3d.pos;
				var dims = path3d.dims;
				var open = path3d.open;
				var v = [], e = [], f = [];
				var p = [
					[pos[0], pos[1], pos[2]],
					[pos[0] + dims[0], pos[1], pos[2]],
					[pos[0] + dims[0], pos[1] + dims[1], pos[2]],
					[pos[0], pos[1] + dims[1], pos[2]]
				];
				var f = [{
						pos3d: [p[3], p[2], p[1], p[0]],
						drawFirst: true
					}
				];
				for (var f2 = 0; f2 < 4; f2++) {
					var p1 = p[f2];
					var p2 = p[(f2 + 1) % 4];

					var vector1 = draw.three.getNormalToPlaneFromThreePoints(p1, p2, [p1[0], p1[1], p1[2] + 1]);
					var vector2 = [0, 0, dims[2]];
					var angle = open * draw.three.getAngleBetweenTwo3dVectors(vector1, vector2);
					var vector3 = [
						vector1[0] * Math.cos(angle) + vector2[0] * Math.sin(angle),
						vector1[1] * Math.cos(angle) + vector2[1] * Math.sin(angle),
						vector1[2] * Math.cos(angle) + vector2[2] * Math.sin(angle)
					];
					vector3 = vector.setMagnitude(vector3, dims[2]);
					var p3 = [p1[0] + vector3[0], p1[1] + vector3[1], p1[2] + vector3[2]];
					var p4 = [p2[0] + vector3[0], p2[1] + vector3[1], p2[2] + vector3[2]];					
					f[f2+1] = {
						pos3d: [p1, p2, p4, p3]
					};
					if (f2 == 0) {
						var vector4 = [0, dims[1], 0];
						var angle2 = open * 0.5 * Math.PI; //draw.three.getAngleBetweenTwo3dVectors(vector3,vector4);
						var vector5 = [
							vector3[0] * Math.cos(angle2) + vector4[0] * Math.sin(angle2),
							vector3[1] * Math.cos(angle2) + vector4[1] * Math.sin(angle2),
							vector3[2] * Math.cos(angle2) + vector4[2] * Math.sin(angle2)
						];
						vector5 = vector.setMagnitude(vector5, dims[1]);
						var p5 = [p3[0] + vector5[0], p3[1] + vector5[1], p3[2] + vector5[2]];
						var p6 = [p4[0] + vector5[0], p4[1] + vector5[1], p4[2] + vector5[2]];

						f[5] = {
							pos3d: [p3, p4, p6, p5],
							drawLast: true
						};
					}
					
				}
				if (boolean(path3d.directionalColors,false) === true) {
					f[0].fillStyle = '#F66';
					f[1].fillStyle = '#66F';
					f[2].fillStyle = '#6C6';
					f[3].fillStyle = '#66F';
					f[4].fillStyle = '#6C6';
					f[5].fillStyle = '#F66';
				}
				if (typeof path3d.faceGrid === 'number') {
					var step = path3d.faceGrid;
					for (var f2 = 0; f2 < 6; f2++) {
						var face = f[f2];
						face.paths = [];
						var vert = face.pos3d;
						var v1 = vector.getVectorAB(vert[0],vert[1]);
						var lines1 = Math.ceil(vector.getMagnitude(v1)/step);
						var v2 = vector.getVectorAB(vert[0],vert[3]);
						var lines2 = Math.ceil(vector.getMagnitude(v2)/step);
						
						for (var i = 0; i < lines1; i++) {
							var p1 = vector.addVectors(vert[0],vector.setMagnitude(v1,step*i));
							var p2 = vector.addVectors(p1,v2);
							face.paths.push({
								type: 'lineSegment',
								pos: [p1,p2],
								lineColor: '#000',
								lineWidth: 1
							});
						}
						
						for (var i = 0; i < lines2; i++) {
							var p1 = vector.addVectors(vert[0],vector.setMagnitude(v2,step*i));
							var p2 = vector.addVectors(p1,v1);
							face.paths.push({
								type: 'lineSegment',
								pos: [p1,p2],
								lineColor: '#000',
								lineWidth: 1
							});
						}
					}
				}
				return {
					vertices: v,
					edges: e,
					faces: f
				};
			},
			scale: function (path3d, sf) {
				for (var i = 0; i < 3; i++) {
					path3d.pos[i] *= sf;
					path3d.dims[i] *= sf;
				}
			}
		},
		coneNet: {
			get: function () {
				//var obj = sel();
				return {
					type: 'coneNet',
					center: [0, 0, 0],
					faces: 120,
					radius: 200,
					angle: 150,
					color: '#99F',
					open: 0
				}; // open: 1=closed, 0=open
			},
			getPos3d: function (path3d) {
				path3d.foldAngle = draw.three.path3d.coneNet.getConeFoldAngle(path3d.radius, path3d.angle, path3d.faces);
				var color = path3d.color;
				var foldAngle = Math.PI - path3d.open * path3d.foldAngle;

				var r = path3d.radius;
				var a = path3d.angle * (Math.PI / 180) / path3d.faces;

				var polygons = [[
						[0, 0, 0],
						[r * Math.cos(0), r * Math.sin(0), 0],
						[r * Math.cos(a), r * Math.sin(a), 0]
					]];
				for (var i = 1; i < path3d.faces; i++) {
					var prev = polygons.last();
					var p1 = [0, 0, 0];
					var p2 = clone(prev[2]);
					var p3 = draw.three.rotatePointAboutLine(clone(prev[1]), p1, p2, foldAngle);
					polygons.push([p1, p2, p3]);
				}

				var faces = [];
				for (var i = 0; i < polygons.length; i++) {
					faces.push({
						pos3d: clone(polygons[i]),
						color: color,
						stroke: false
					}, {
						pos3d: clone(polygons[i].reverse()),
						color: color,
						stroke: false
					});
				}
				return {
					faces: faces
				};
			},
			scale: function (path3d, sf) {
				path3d.radius *= sf;
			},
			getConeFoldAngle: function (radius, angle, faces) {
				angle = angle * Math.PI / 180;
				var a = Math.sqrt(2 * radius * radius * (1 - Math.cos(angle / faces)));
				var h = Math.sqrt(radius * radius - (a * a) / 4);
				var t = 2 * Math.PI / faces;
				var r = a / (2 * Math.tan(t / 2));
				var HH = h * h - r * r;
				var RR = radius * radius - HH;
				var cosA = (RR + (2 * HH + RR) * Math.cos(t)) / (2 * HH + RR + RR * Math.cos(t));
				return Math.acos(cosA);
			}
		},
		cylinderNet: {
			get: function () {
				return {
					type: 'cylinderNet',
					center: [0, 0, 0],
					faces: 120,
					radius: 50,
					height: 200,
					color: '#99F',
					open: 0
				}; // open: 1=closed, 0=open
			},
			getPos3d: function (path3d) {
				//return {faces:[]};
				
				var color = path3d.color;
				var extAngle = path3d.open * (2 * Math.PI / path3d.faces);

				//var c = [0,0,0];
				var h = path3d.height;
				var faces = [];
				var faceWidth = (2 * Math.PI * path3d.radius) / path3d.faces;

				var polygon = [];
				var polygon2 = [];
				var center = [-path3d.radius, 0, 0];
				var angle = (path3d.open - 1) * Math.PI / 2;
				for (var i = 0; i < path3d.faces; i++) {
					var a = i * 2 * Math.PI / path3d.faces;
					pos = draw.three.rotatePoint2([
						center[0] + path3d.radius * Math.cos(a),
						path3d.radius * Math.sin(a),
						0
					], 1, angle);
					polygon.unshift(pos);
					polygon2.push(pos);
				}
				faces.push({
					pos3d: polygon,
					color: color,
					drawOrder: 1
				}, {
					pos3d: polygon2,
					color: color,
					drawOrder: 1
				});

				var polygon = [];
				var polygon2 = [];
				var center = [-path3d.radius, 0, 0];
				var angle = (1 - path3d.open) * Math.PI / 2;
				for (var i = 0; i < path3d.faces; i++) {
					var a = i * 2 * Math.PI / path3d.faces;
					pos = draw.three.rotatePoint2([
								center[0] + path3d.radius * Math.cos(a),
								path3d.radius * Math.sin(a),
								0
							], 1, angle);
					pos[2] += h;
					polygon.unshift(pos);
					polygon2.push(pos);
				}
				faces.push({
					pos3d: polygon,
					color: color,
					drawOrder: 3
				}, {
					pos3d: polygon2,
					color: color,
					drawOrder: 3
				});

				var pos1 = [0, 0, 0]
				var pos2 = [0, 0, h];
				var angle = Math.PI / 2 - extAngle;
				for (var f = 0; f < path3d.faces / 2; f++) {
					if (f == 0) {
						angle += 1.5 * extAngle;
					} else {
						angle += extAngle;
					}
					var dir = [faceWidth * Math.cos(angle), faceWidth * Math.sin(angle), 0];
					var pos3 = [pos1[0] + dir[0], pos1[1] + dir[1], pos1[2] + dir[2]];
					var pos4 = [pos2[0] + dir[0], pos2[1] + dir[1], pos2[2] + dir[2]];
					faces.push({
						pos3d: clone([pos1, pos3, pos4, pos2]),
						color: color,
						stroke: false,
						drawOrder: 2
					}, {
						pos3d: clone([pos2, pos4, pos3, pos1]),
						color: color,
						stroke: false,
						drawOrder: 2
					});
					pos1 = pos3;
					pos2 = pos4;
				}

				var pos1 = [0, 0, 0]
				var pos2 = [0, 0, h];
				var angle = -extAngle - Math.PI / 2;
				for (var f = 0; f < path3d.faces / 2; f++) {
					if (f == 0) {
						angle += 0.5 * extAngle;
					} else {
						angle -= extAngle;
					}
					var dir = [faceWidth * Math.cos(angle), faceWidth * Math.sin(angle), 0];
					var pos3 = [pos1[0] + dir[0], pos1[1] + dir[1], pos1[2] + dir[2]];
					var pos4 = [pos2[0] + dir[0], pos2[1] + dir[1], pos2[2] + dir[2]];
					faces.push({
						pos3d: clone([pos1, pos3, pos4, pos2]),
						color: color,
						stroke: false,
						drawOrder: 2
					}, {
						pos3d: clone([pos2, pos4, pos3, pos1]),
						color: color,
						stroke: false,
						drawOrder: 2
					});
					pos1 = pos3;
					pos2 = pos4;
				}

				return {
					faces: faces
				};
			},
			scale: function (path3d, sf) {
				path3d.radius *= sf;
				path3d.height *= sf;
			}
		}

	},

	cubeDrawing: {
		getCursorPositionsBuild: function (obj) {
			var size = obj.gridStep;
			var squares = obj.gridSize / size;
			var polygons = [];
			// get base polygons
			for (var i = -squares / 2; i < squares / 2; i++) {
				for (var j = -squares / 2; j < squares / 2; j++) {
					var pos3d = [[i, j, 0], [i + 1, j, 0], [i + 1, j + 1, 0], [i, j + 1, 0]];
					var pos2d = [];
					for (var p = 0; p < pos3d.length; p++) {
						var pos = [pos3d[p][0] * obj.gridStep, pos3d[p][1] * obj.gridStep, pos3d[p][2] * obj.gridStep];
						pos2d[p] = draw.three.convert3dPosTo2d(obj, pos);
					}
					polygons.push({
						pos3d: pos3d,
						pos2d: pos2d,
						center: [i, j, 0]
					});
				}
			}
			if (un(obj._cubeFaces))
				return polygons;
			// get cube face polygons
			for (var f = 0; f < obj._cubeFaces.length; f++) {
				var face = obj._cubeFaces[f];
				var center = [face.pos[0] / size + face.normal[0], face.pos[1] / size + face.normal[1], face.pos[2] / size + face.normal[2]];
				polygons.push({
					pos3d: face.pos3d,
					pos2d: face.pos2d,
					center: center
				});
			}
			return polygons;
		},
		getCursorPositionsRemove: function (obj) {
			if (un(obj._cubeFaces))
				return [];
			var size = obj.gridStep;
			var squares = obj.gridSize / size;
			var polygons = [];
			// get cube face polygons
			for (var f = 0; f < obj._cubeFaces.length; f++) {
				var face = obj._cubeFaces[f];
				var center = [face.pos[0] / size, face.pos[1] / size, face.pos[2] / size];
				polygons.push({
					pos3d: face.pos3d,
					pos2d: face.pos2d,
					center: center
				});
			}
			return polygons;
		},
		click: function () {
			var mode = draw.currCursor.mode;
			var obj = draw.currCursor.obj;
			var size = obj.gridStep;
			var center = draw.currCursor.position.center;
			if (mode == 'remove') {
				draw.three.cubeDrawing.removeCubeAtPosition(obj, center);
			} else {
				draw.three.cubeDrawing.addCubeAtPosition(obj, center);
			}
			drawCanvasPaths();
		},
		isCubeAtPosition: function (obj, pos) {
			var size = obj.gridStep;
			for (var p = 0; p < obj.paths3d.length; p++) {
				var path3d = obj.paths3d[p];
				if (path3d.type !== 'cuboid')
					continue;
				if (path3d.pos[0] !== pos[0] * size || path3d.pos[1] !== pos[1] * size || path3d.pos[2] !== pos[2] * size)
					continue;
				if (path3d.dims[0] !== size || path3d.dims[1] !== size || path3d.dims[2] !== size)
					continue;
				return true;
			}
			return false;
		},
		addCubeAtPosition: function (obj, pos) {
			if (draw.three.cubeDrawing.isCubeAtPosition(obj, pos))
				return;
			var size = obj.gridStep;
			if (!un(obj.gridBounds)) {
				if (pos[0] < obj.gridBounds[0][0] || pos[0] + 1 > obj.gridBounds[0][1])
					return;
				if (pos[1] < obj.gridBounds[1][0] || pos[1] + 1 > obj.gridBounds[1][1])
					return;
				if (pos[2] < obj.gridBounds[2][0] || pos[2] + 1 > obj.gridBounds[2][1])
					return;
			}
			obj.paths3d.push({
				type: "cuboid",
				pos: [pos[0] * size, pos[1] * size, pos[2] * size],
				dims: [size, size, size]
			});
		},
		removeCubeAtPosition: function (obj, pos) {
			var size = obj.gridStep;
			for (var p = obj.paths3d.length - 1; p >= 0; p--) {
				var path3d = obj.paths3d[p];
				if (path3d.type !== 'cuboid')
					continue;
				if (path3d.pos[0] !== pos[0] * size || path3d.pos[1] !== pos[1] * size || path3d.pos[2] !== pos[2] * size)
					continue;
				if (path3d.dims[0] !== size || path3d.dims[1] !== size || path3d.dims[2] !== size)
					continue;
				obj.paths3d.splice(p, 1);
				return;
			}
		},
	},

	resizable: true,
	setSize: function (obj, size) {
		draw.three.scale(obj, size / obj.gridStep);
	},
	scale: function (obj, sf, center) {
		if (!un(center)) {
			obj.center[0] = center[0] + sf * (obj.center[0] - center[0]);
			obj.center[1] = center[1] + sf * (obj.center[1] - center[1]);
		}
		obj.gridStep *= sf;
		obj.gridSize *= sf;
		for (var p = 0; p < obj.paths3d.length; p++) {
			var path3d = obj.paths3d[p];
			if (un(draw.three.path3d[path3d.type]) || un(draw.three.path3d[path3d.type].scale))
				continue;
			draw.three.path3d[path3d.type].scale(path3d, sf);
		}
		draw.updateAllBorders();
		drawCanvasPaths();
		drawSelectCanvas();
	},

	draw: function (ctx, obj, path) {
		if (obj.paths3d.length == 0) return;		
		var drawBackFaces = !un(obj.drawBackFaces) ? obj.drawBackFaces : 'auto';

		var clonedObj = draw.clone(obj);
		var selected = !un(path) && path.selected === true ? true : false;
		if (un(obj._cachedObj) || selected !== obj._cachedSelected || isEqual(clonedObj,obj._cachedObj) === false) {
			//console.log('slowdraw');
			obj._cachedObj = clonedObj;
			obj._cachedSelected = selected;
		
			var cameraDist = 1500;
			obj._camera = obj.tilt == 1 ? [0, 0, 1] : [Math.sin(-obj.angle), Math.cos(-obj.angle), draw.three.convert2dHeightTo3d(obj, obj.tilt)];
			obj._cameraPos = [cameraDist * obj._camera[0], cameraDist * obj._camera[1], cameraDist * obj._camera[2]];
			obj._light = [200 * Math.cos(-obj.angle), 200 * -Math.sin(-obj.angle), 300];
			//obj._light = obj._camera;
			obj._brightness = def([obj.brightness, 1]);
			obj._contrast = def([obj.contrast, 0.75]);
			obj._cubeFaces = [];
			
			// sort path3d by height of lowest point, then by closeness to front
			var paths3d = [];
			for (var p = 0; p < obj.paths3d.length; p++) {
				var path3d = obj.paths3d[p];
				
				if (path3d.type == 'custom') {
					if (!un(path3d.get)) {
						var get = path3d.get(obj, path3d);
						path3d._faces = get.faces;
						path3d._labels = get.labels || [];
					}
				} else if (un(draw.three.path3d[path3d.type]) || un(draw.three.path3d[path3d.type].getPos3d)) {
					continue;
				} else {
					var get = draw.three.path3d[path3d.type].getPos3d(path3d,obj);
					//console.log(get);
					path3d._faces = get.faces;
					path3d._labels = get.labels || [];
				}

				path3d._meanPoints = [];
				path3d._min;
				for (var f = 0; f < path3d._faces.length; f++) {
					path3d._meanPoints.push(draw.three.getMeanPoint(path3d._faces[f].pos3d));

					for (var v = 0; v < path3d._faces[f].pos3d.length; v++) {
						path3d._min = un(path3d._min) ? path3d._faces[f].pos3d[v][2] : Math.min(path3d._min, path3d._faces[f].pos3d[v][2]);
					}
				}
				path3d._meanPoint = draw.three.getMeanPoint(path3d._meanPoints);
				path3d._distanceToCamera = draw.three.getDistanceTwoPoints([path3d._meanPoint[0], path3d._meanPoint[1], 0], [obj._cameraPos[0], obj._cameraPos[1], 0]);

				paths3d.push(path3d);
			}

			paths3d.sort(function (a, b) {
				if (a.drawFirst == true || b.drawLast == true || ['grid', 'dotGrid', 'arrow'].includes(a.type)) return -1;
				if (b.drawFirst == true || a.drawLast == true || ['grid', 'dotGrid', 'arrow'].includes(b.type)) return 1;
				if (a._min < b._min) return -1;
				if (a._min > b._min) return 1;
				if (a._distanceToCamera > b._distanceToCamera) return -1;
				if (a._distanceToCamera < b._distanceToCamera) return 1;
			});

			//console.log('draw.three',obj);
			obj._elements = [];
			var xMin, xMax, yMin, yMax;
			
			// get faces (and other elements) of each path3d
			for (var p = 0; p < paths3d.length; p++) {
				var path3d = paths3d[p];
				if (path3d.visible === false) continue;
				//console.log('--path3d:',path3d);
				var elements = [];

				for (var f = 0; f < path3d._faces.length; f++) {
					var face = path3d._faces[f];
					face._path3d = path3d;
					if (face.draw === false || face.visible === false) continue;
					face.pos2d = [];
					for (var p2 = 0; p2 < face.pos3d.length; p2++) {
						face.pos2d[p2] = draw.three.convert3dPosTo2d(obj, face.pos3d[p2]);
						var pos = face.pos2d[p2];
						xMin = (un(xMin)) ? pos[0] : Math.min(xMin, pos[0]);
						xMax = (un(xMax)) ? pos[0] : Math.max(xMax, pos[0]);
						yMin = (un(yMin)) ? pos[1] : Math.min(yMin, pos[1]);
						yMax = (un(yMax)) ? pos[1] : Math.max(yMax, pos[1]);
					}
					face.normal = draw.three.getFaceNormal(face);
					face.angleToCamera = draw.three.getAngleBetweenTwo3dVectors(face.normal, obj._camera);
					face.angleToLight = draw.three.getAngleBetweenTwo3dVectors(face.normal, obj._light);
					face.meanPoint = draw.three.getMeanPoint(face.pos3d);
					face.distanceToCamera = draw.three.getDistanceTwoPoints(face.meanPoint, obj._cameraPos);
					if (face.normal[0] === 0 && face.normal[1] === 0) {
						if (face.normal[2] > 0) {
							face.up = true;
						} else {
							face.down = true;
						}
					}
					//if (draw.three.getAngleBetweenTwo3dVectors(face.normal, [0, 0, 1]) == 0) face.up = true;
					//if (draw.three.getAngleBetweenTwo3dVectors(face.normal, [0, 0, -1]) == 0) face.down = true;
					face.type2 = 'face';
					face._path3d = path3d;
					elements.push(face);
				}

				for (var l = 0; l < path3d._labels.length; l++) {
					var label = path3d._labels[l];
					label._path3d = path3d;
					if (label.draw === false || label.visible === false) continue;
					label.pos2d = draw.three.convert3dPosTo2d(obj, label.pos3d);
					label.distanceToCamera = draw.three.getDistanceTwoPoints(label.pos3d, obj._cameraPos);
					label.type2 = 'label';
					label._path3d = path3d;
					elements.push(label);
				}

				elements.sort(function (a, b) {
					//return 0;
					//if (a.up === true || b.down === true || b.meanPoint[2] == 0) return 1;
					//if (b.up === true || a.down === true || a.meanPoint[2] == 0) return -1;
					if (a.drawFirst == true || b.drawLast == true) return -1;
					if (b.drawFirst == true || a.drawLast == true) return 1;

					if (!un(a.drawOrder) && !un(b.drawOrder) && a.drawOrder !== b.drawOrder) return a.drawOrder - b.drawOrder;

					if (a.type2 == 'label' || b.type2 == 'label') {
						return b.distanceToCamera - a.distanceToCamera;
					}

					if (a._path3d.type !== 'prism2' && b._path3d.type !== 'prism2') { // not sure what this does?
						var v1 = vector.getVectorAB(obj._cameraPos, b.pos3d[0]);
						for (var p = 0; p < a.pos2d.length; p++) {
							var v2 = vector.getVectorAB(obj._cameraPos, a.pos3d[p]);
							var relLen = roundToNearest(vector.dotProduct(v1, b.normal) / vector.dotProduct(v2, b.normal) - 1, 0.001);
							if (Math.abs(relLen) > 0.01) return relLen;
						}
						var v1 = vector.getVectorAB(obj._cameraPos, a.pos3d[0]);
						for (var p = 0; p < b.pos2d.length; p++) {
							var v2 = vector.getVectorAB(obj._cameraPos, b.pos3d[p]);
							var relLen = roundToNearest(vector.dotProduct(v1, a.normal) / vector.dotProduct(v2, a.normal) - 1, 0.001);
							if (Math.abs(relLen) > 0.01) return -relLen;
						}
					}					
					
					if (b.angleToCamera !== a.angleToCamera) return Math.abs(b.angleToCamera) - Math.abs(a.angleToCamera);
					return b.distanceToCamera - a.distanceToCamera;
				});

				var elementsToDrawAfterFace = elements.filter(function(x) {
					return typeof x.drawAfterFaceID === 'string';
				});
				for (var i = 0; i < elementsToDrawAfterFace.length; i++) {
					var elem = elementsToDrawAfterFace[i];
					var match = elements.find(function(x) {
						return x.id === elem.drawAfterFaceID;
					});
					if (typeof match === 'object' && match !== null) {
						var indexToRemove = elements.indexOf(elem);
						elements.splice(indexToRemove,1);
						
						var indexToAdd = elements.indexOf(match)+1;
						elements.splice(indexToAdd,0,elem);
					}
					
				}
				obj._elements = obj._elements.concat(elements);
			}
			obj._rect = [xMin, yMin, xMax - xMin, yMax - yMin];
		} else {
			//console.log('quickcacheddraw');
		}

		draw.three._dashLines = [];
		for (var f = 0; f < obj._elements.length; f++) {
			var element = obj._elements[f];
			var path3d = element._path3d;
			if (element.type2 == 'face') {
				var face = element;
				if (face.angleToCamera > Math.PI / 2) {
					if (drawBackFaces == 'none') continue;
					if (drawBackFaces == 'dash' || drawBackFaces == 'outline') face.fill = false;
					if (drawBackFaces == 'dash') face.dash = [10, 10];
					if (drawBackFaces == 'outline') face.strokeStyle = '#666';
				}
				if (un(face.fillStyle)) {
					if (obj.directionalColors == true) {
						if (face.normal[0] == 0 && face.normal[1] == 0) face.fillStyle = '#F66';
						if (face.normal[0] == 0 && face.normal[2] == 0) face.fillStyle = '#66F';
						if (face.normal[1] == 0 && face.normal[2] == 0) face.fillStyle = '#6C6';
						if (un(face.fillStyle)) face.fillStyle = '#FFF';
					} else {
						var brightness = obj._brightness - obj._contrast * face.angleToLight / Math.PI;
						var color = def([face.color, path3d.color, obj.fillStyle, '#0FF']);
						var alpha = def([path3d.alpha, obj.alpha, 0.5]);
						face.fillStyle = draw.three.getColor(color, brightness, alpha);
					}
				}
				//console.log('face:',face);
				draw.three.drawFace(ctx, obj, face, path3d);
				if (boolean(obj.drawFaceNormals, false) == true) draw.three.drawNormalToFace(ctx, obj, face);
				if (face.angleToCamera < Math.PI / 2 && path3d.type == 'cuboid') {
					var face2 = clone(face);
					face2.dims = path3d.dims;
					face2.pos = path3d.pos;
					obj._cubeFaces.push(face2);
				}
			} else if (element.type2 == 'label') {
				draw.three.drawLabel(ctx, obj, element, path3d);
			}
		}
		delete draw.three._dashLines;
	},
	
	drawFace: function (ctx, obj, face, path) {
		ctx.save();
		//face.pos2d = [];
		//for (var p2 = 0; p2 < face.pos3d.length; p2++) face.pos2d[p2] = draw.three.convert3dPosTo2d(obj,face.pos3d[p2]);
		if (face.fill !== false && face.fillStyle !== 'none') {
			ctx.beginPath();
			ctx.moveTo(face.pos2d[0][0], face.pos2d[0][1]);
			for (var i = 0; i < face.pos2d.length; i++) ctx.lineTo(face.pos2d[i][0], face.pos2d[i][1]);
			ctx.lineTo(face.pos2d[0][0], face.pos2d[0][1]);
			ctx.closePath();
			if (Math.abs(face.angleToCamera - Math.PI / 2) < 0.001 && face.stroke == false) {
				ctx.strokeStyle = face.fillStyle; // if face is observed as a line from the view angle
				ctx.lineWidth = 1;
				ctx.stroke();
			} else {
				ctx.fillStyle = face.fillStyle;
				ctx.fill();
			}
		}
		if (face.stroke !== false) {
			ctx.beginPath();
			ctx.moveTo(face.pos2d[0][0], face.pos2d[0][1]);
			for (var i = 0; i < face.pos2d.length; i++) ctx.lineTo(face.pos2d[i][0], face.pos2d[i][1]);
			ctx.lineTo(face.pos2d[0][0], face.pos2d[0][1]);
			ctx.closePath();
			if (!un(face.dash)) {
				for (var i = 0; i < face.pos2d.length; i++) {
					var pos1 = face.pos2d[i];
					var pos2 = face.pos2d[(i + 1) % face.pos2d.length];
					var found = false;
					for (var k = 0; k < draw.three._dashLines.length; k++) {
						var pos3 = draw.three._dashLines[k][0];
						var pos4 = draw.three._dashLines[k][1];
						if ((arraysEqual(pos1, pos3) && arraysEqual(pos2, pos4)) || (arraysEqual(pos1, pos4) && arraysEqual(pos2, pos3))) {
							found = true;
							break;
						}
					}
					if (found == false) {
						ctx.setLineDash(face.dash);
						ctx.strokeStyle = def([face.strokeStyle, obj.strokeStyle, '#000']);
						ctx.lineWidth = def([face.lineWidth, obj.lineWidth, 1]);
						ctx.lineWidth = ctx.lineWidth * 0.75;
						ctx.lineJoin = 'round';
						ctx.lineCap = 'round';
						ctx.beginPath();
						ctx.moveTo(pos1[0], pos1[1]);
						ctx.lineTo(pos2[0], pos2[1]);
						ctx.stroke();
						ctx.setLineDash([]);
						draw.three._dashLines.push([pos1, pos2]);
					}
				}
			} else {
				ctx.strokeStyle = def([face.strokeStyle, path.strokeStyle, obj.strokeStyle, '#000']);
				ctx.lineWidth = def([face.lineWidth, path.lineWidth, obj.lineWidth, 1]);
				ctx.lineJoin = 'round';
				ctx.lineCap = 'round';
				ctx.stroke();
			}
			if (obj.faceGrid == true || face.faceGrid === true) {
				if (face.normal[0] == 0 && face.normal[1] == 0) {
					var edges = [];
					var xMin = xMax = face.pos3d[0][0],
					yMin = yMax = face.pos3d[0][1];
					var z = face.pos3d[0][2];
					for (var v = 0; v < face.pos3d.length; v++) {
						xMin = Math.min(xMin, face.pos3d[v][0]);
						xMax = Math.max(xMax, face.pos3d[v][0]);
						yMin = Math.min(yMin, face.pos3d[v][1]);
						yMax = Math.max(yMax, face.pos3d[v][1]);
						edges.push([face.pos3d[v], face.pos3d[(v + 1) % face.pos3d.length]]);
					}
					var x = obj.gridStep * Math.ceil(xMin / obj.gridStep);
					while (x <= xMax) {
						var intersections = [];
						for (var e = 0; e < edges.length; e++) {
							var edge = edges[e];
							if (intersects2(x, 0, x, 1, edge[0][0], edge[0][1], edge[1][0], edge[1][1]) == true) {
								var inter = intersection(x, 0, x, 1, edge[0][0], edge[0][1], edge[1][0], edge[1][1]);
								inter.push(z);
								intersections.push(inter);
							}
						}
						if (intersections.length >= 2 && intersections.length <= 3) drawLineSegment(intersections);
						x += obj.gridStep;
					}
					var y = obj.gridStep * Math.ceil(yMin / obj.gridStep);
					while (y <= yMax) {
						var intersections = [];
						for (var e = 0; e < edges.length; e++) {
							var edge = edges[e];
							if (intersects2(0, y, 1, y, edge[0][0], edge[0][1], edge[1][0], edge[1][1]) == true) {
								var inter = intersection(0, y, 1, y, edge[0][0], edge[0][1], edge[1][0], edge[1][1]);
								inter.push(z);
								intersections.push(inter);
							}
						}
						if (intersections.length >= 2 && intersections.length <= 3) drawLineSegment(intersections);
						y += obj.gridStep;
					}
				} else if (face.normal[0] == 0 && face.normal[2] == 0) {
					var edges = [];
					var xMin = xMax = face.pos3d[0][0],
					zMin = zMax = face.pos3d[0][2];
					var y = face.pos3d[0][1];
					for (var v = 0; v < face.pos3d.length; v++) {
						xMin = Math.min(xMin, face.pos3d[v][0]);
						xMax = Math.max(xMax, face.pos3d[v][0]);
						zMin = Math.min(zMin, face.pos3d[v][2]);
						zMax = Math.max(zMax, face.pos3d[v][2]);
						edges.push([face.pos3d[v], face.pos3d[(v + 1) % face.pos3d.length]]);
					}
					var x = obj.gridStep * Math.ceil(xMin / obj.gridStep);
					while (x <= xMax) {
						var intersections = [];
						for (var e = 0; e < edges.length; e++) {
							var edge = edges[e];
							if (intersects2(x, 0, x, 1, edge[0][0], edge[0][2], edge[1][0], edge[1][2]) == true) {
								var inter = intersection(x, 0, x, 1, edge[0][0], edge[0][2], edge[1][0], edge[1][2]);
								inter = [inter[0], y, inter[1]];
								intersections.push(inter);
							}
						}
						if (intersections.length >= 2 && intersections.length <= 3)
							drawLineSegment(intersections);
						x += obj.gridStep;
					}
					var z = obj.gridStep * Math.ceil(zMin / obj.gridStep);
					while (z <= zMax) {
						var intersections = [];
						for (var e = 0; e < edges.length; e++) {
							var edge = edges[e];
							if (intersects2(0, z, 1, z, edge[0][0], edge[0][2], edge[1][0], edge[1][2]) == true) {
								var inter = intersection(0, z, 1, z, edge[0][0], edge[0][2], edge[1][0], edge[1][2]);
								inter = [inter[0], y, inter[1]];
								intersections.push(inter);
							}
						}
						if (intersections.length >= 2 && intersections.length <= 3)
							drawLineSegment(intersections);
						z += obj.gridStep;
					}
				} else if (face.normal[1] == 0 && face.normal[2] == 0) {
					var edges = [];
					var yMin = yMax = face.pos3d[0][1], zMin = zMax = face.pos3d[0][2];
					var x = face.pos3d[0][0];
					for (var v = 0; v < face.pos3d.length; v++) {
						yMin = Math.min(yMin, face.pos3d[v][1]);
						yMax = Math.max(yMax, face.pos3d[v][1]);
						zMin = Math.min(zMin, face.pos3d[v][2]);
						zMax = Math.max(zMax, face.pos3d[v][2]);
						edges.push([face.pos3d[v], face.pos3d[(v + 1) % face.pos3d.length]]);
					}
					var y = obj.gridStep * Math.ceil(yMin / obj.gridStep);
					while (y <= yMax) {
						var intersections = [];
						for (var e = 0; e < edges.length; e++) {
							var edge = edges[e];
							if (intersects2(y, 0, y, 1, edge[0][1], edge[0][2], edge[1][1], edge[1][2]) == true) {
								var inter = intersection(y, 0, y, 1, edge[0][1], edge[0][2], edge[1][1], edge[1][2]);
								inter.unshift(x);
								intersections.push(inter);
							}
						}
						if (intersections.length >= 2 && intersections.length <= 3) {
							drawLineSegment(intersections);
						}
						y += obj.gridStep;
					}
					var z = obj.gridStep * Math.ceil(zMin / obj.gridStep);
					while (z <= zMax) {
						var intersections = [];
						for (var e = 0; e < edges.length; e++) {
							var edge = edges[e];
							if (intersects2(0, z, 1, z, edge[0][1], edge[0][2], edge[1][1], edge[1][2]) == true) {
								var inter = intersection(0, z, 1, z, edge[0][1], edge[0][2], edge[1][1], edge[1][2]);
								inter.unshift(x);
								intersections.push(inter);
							}
						}
						if (intersections.length >= 2 && intersections.length <= 3) {
							drawLineSegment(intersections);
						}
						z += obj.gridStep;
					}
				}
			}
		}
		if (!un(face.paths)) {
			for (var p = 0; p < face.paths.length; p++) {
				if (face.paths[p].dragOnly == true && (path.selected !== true && (un(path.interact) || path.interact.edit3dShape !== true))) continue;
				draw.three.drawPath(ctx, obj, face.paths[p], face);
			}
		}
		ctx.restore();
		function drawLineSegment(pos3d) {
			ctx.beginPath();
			var pos1 = draw.three.convert3dPosTo2d(obj, pos3d[0]);
			var pos2 = draw.three.convert3dPosTo2d(obj, pos3d[1]);
			ctx.moveTo(pos1[0], pos1[1]);
			ctx.lineTo(pos2[0], pos2[1]);
			ctx.strokeStyle = def([face.strokeStyle, obj.strokeStyle, '#000']);
			ctx.lineWidth = def([face.lineWidth, obj.lineWidth, 1]);
			ctx.lineJoin = 'round';
			ctx.lineCap = 'round';
			ctx.stroke();
		}
		/*function matrix_invert(M){ // http://blog.acipo.com/matrix-inversion-in-javascript/
			// I use Guassian Elimination to calculate the inverse:
			// (1) 'augment' the matrix (left) by the identity (on the right)
			// (2) Turn the matrix on the left into the identity by elemetry row ops
			// (3) The matrix on the right is the inverse (was the identity matrix)
			// There are 3 elemtary row ops: (I combine b and c in my code)
			// (a) Swap 2 rows
			// (b) Multiply a row by a scalar
			// (c) Add 2 rows
			
			//if the matrix isn't square: exit (error)
			if(M.length !== M[0].length){return;}
			
			//create the identity matrix (I), and a copy (C) of the original
			var i=0, ii=0, j=0, dim=M.length, e=0, t=0;
			var I = [], C = [];
			for(i=0; i<dim; i+=1){
				// Create the row
				I[I.length]=[];
				C[C.length]=[];
				for(j=0; j<dim; j+=1){
					
					//if we're on the diagonal, put a 1 (for identity)
					if(i==j){ I[i][j] = 1; }
					else{ I[i][j] = 0; }
					
					// Also, make the copy of the original
					C[i][j] = M[i][j];
				}
			}
			
			// Perform elementary row operations
			for(i=0; i<dim; i+=1){
				// get the element e on the diagonal
				e = C[i][i];
				
				// if we have a 0 on the diagonal (we'll need to swap with a lower row)
				if(e==0){
					//look through every row below the i'th row
					for(ii=i+1; ii<dim; ii+=1){
						//if the ii'th row has a non-0 in the i'th col
						if(C[ii][i] != 0){
							//it would make the diagonal have a non-0 so swap it
							for(j=0; j<dim; j++){
								e = C[i][j];       //temp store i'th row
								C[i][j] = C[ii][j];//replace i'th row by ii'th
								C[ii][j] = e;      //repace ii'th by temp
								e = I[i][j];       //temp store i'th row
								I[i][j] = I[ii][j];//replace i'th row by ii'th
								I[ii][j] = e;      //repace ii'th by temp
							}
							//don't bother checking other rows since we've swapped
							break;
						}
					}
					//get the new diagonal
					e = C[i][i];
					//if it's still 0, not invertable (error)
					if(e==0){return}
				}
				
				// Scale this row down by e (so we have a 1 on the diagonal)
				for(j=0; j<dim; j++){
					C[i][j] = C[i][j]/e; //apply to original matrix
					I[i][j] = I[i][j]/e; //apply to identity
				}
				
				// Subtract this row (scaled appropriately for each row) from ALL of
				// the other rows so that there will be 0's in this column in the
				// rows above and below this one
				for(ii=0; ii<dim; ii++){
					// Only apply to other rows (we want a 1 on the diagonal)
					if(ii==i){continue;}
					
					// We want to change this element to 0
					e = C[ii][i];
					
					// Subtract (the row above(or below) scaled by e) from (the
					// current row) but start at the i'th column and assume all the
					// stuff left of diagonal is 0 (which it should be if we made this
					// algorithm correctly)
					for(j=0; j<dim; j++){
						C[ii][j] -= e*C[i][j]; //apply to original matrix
						I[ii][j] -= e*I[i][j]; //apply to identity
					}
				}
			}
			
			//we've done all operations, C should be the identity
			//matrix I should be the inverse:
			return I;
		}
		function multiplyMatrixByVector(m,v) {
			var result = [];
			for (var i = 0; i < m.length; i++) {
				result[i] = 0;
				for (var j = 0; j < m[i].length; j++) {
					result[i] += m[i][j] * v[j];
				}
				result[i] = roundToNearest(result[i],0.001);
			}
			return result;
		}*/
	},
	drawPath: function (ctx, obj, path, face) {
		if (path instanceof Array) {
			for (var p = 0; p < path.length; p++) {
				draw.three.drawPath(ctx, obj, path[p]);
				return;
			}
		}
		if (boolean(path.visible, true) == false) return;
		if (!un(path.type) && !un(draw.three.drawPathType[path.type])) {
			draw.three.drawPathType[path.type](ctx, obj, path, face);
			return;
		};
		if (path.pos.length == 3 && typeof path.pos[0] == 'number' && typeof path.pos[1] == 'number' && typeof path.pos[2] == 'number') {
			var pos2d = draw.three.convert3dPosTo2d(obj, path.pos);
			if (path.limit == true && dist(obj.center[0], obj.center[1], pos2d[0], pos2d[1]) > Math.sqrt(2) * obj.gridSize) return;
			var radius = def([path.radius, obj.pointRadius, 8]);
			ctx.save();
			if (!un(path.fillStyle && path.fillStyle !== 'none')) {
				ctx.beginPath();
				ctx.moveTo(pos2d[0], pos2d[1]);
				ctx.arc(pos2d[0], pos2d[1], radius, 0, 2 * Math.PI);
				ctx.fillStyle = path.fillStyle;
				ctx.fill();
			}
			if (!un(path.strokeStyle && path.strokeStyle !== 'none')) {
				ctx.beginPath();
				ctx.moveTo(pos2d[0], pos2d[1]);
				ctx.arc(pos2d[0], pos2d[1], radius, 0, 2 * Math.PI);
				ctx.strokeStyle = path.strokeStyle;
				ctx.lineWidth = path.lineWidth || 1;
				ctx.stroke();
			}
			ctx.restore();
			return;
		}

		var pos2d = [];
		for (var p = 0; p < path.pos.length; p++) pos2d[p] = draw.three.convert3dPosTo2d(obj, path.pos[p]);
		ctx.save();
		
		if (!un(path.fillStyle && path.fillStyle !== 'none')) {
			ctx.beginPath();
			ctx.moveTo(pos2d[0][0], pos2d[0][1]);
			for (var p = 0; p < pos2d.length; p++) ctx.lineTo(pos2d[p][0], pos2d[p][1]);
			if (path.close == true) path.closePath();
			ctx.fillStyle = path.fillStyle;
			ctx.fill();
		}
		if (!un(path.strokeStyle && path.strokeStyle !== 'none')) {
			ctx.beginPath();
			ctx.moveTo(pos2d[0][0], pos2d[0][1]);
			for (var p = 0; p < pos2d.length; p++) ctx.lineTo(pos2d[p][0], pos2d[p][1]);
			if (path.close == true) path.closePath();
			ctx.strokeStyle = path.strokeStyle;
			ctx.lineWidth = path.lineWidth || 1;
			ctx.stroke();
		}
		ctx.restore();
	},
	drawPathType: {
		angle: function (ctx, obj, angle, face) {
			var v1 = vector.getVectorAB(angle.pos[1], angle.pos[0]);
			var v2 = vector.getVectorAB(angle.pos[1], angle.pos[2]);
			var angleMeasure = draw.three.getAngleBetweenTwo3dVectors(v1, v2);

			if (angle.forceRightAngle === true || Math.abs(180 * angleMeasure / Math.PI - 90) < 0.5) { // right angle
				var v3 = vector.setMagnitude(v1, angle.radius * 0.5);
				var v4 = vector.setMagnitude(v2, angle.radius * 0.5);
				var p1 = vector.addVectors(angle.pos[1], v3);
				var p2 = vector.addVectors(angle.pos[1], v4);
				var p3 = vector.addVectors(p1, v4);

				var a = draw.three.convert3dPosTo2d(obj, angle.pos[0]);
				var b = draw.three.convert3dPosTo2d(obj, angle.pos[1]);
				var c = draw.three.convert3dPosTo2d(obj, angle.pos[2]);
				var d = draw.three.convert3dPosTo2d(obj, p1);
				var e = draw.three.convert3dPosTo2d(obj, p2);
				var f = draw.three.convert3dPosTo2d(obj, p3);

				ctx.save();
				if (!un(angle.fillTriangle) && angle.fillTriangle !== 'none' && angle.fillTriangle !== false) {
					ctx.fillStyle = angle.fillTriangle;
					ctx.beginPath();
					ctx.moveTo(a[0], a[1]);
					ctx.lineTo(b[0], b[1]);
					ctx.lineTo(c[0], c[1]);
					ctx.lineTo(a[0], a[1]);
					ctx.fill();
				}
				if (!un(angle.lineTriangle) && angle.lineTriangle !== 'none' && angle.lineTriangle !== false) {
					ctx.strokeStyle = angle.lineTriangle;
					ctx.lineWidth = angle.lineWidth;
					ctx.beginPath();
					ctx.moveTo(a[0], a[1]);
					ctx.lineTo(b[0], b[1]);
					ctx.lineTo(c[0], c[1]);
					ctx.lineTo(a[0], a[1]);
					ctx.stroke();
				}
				if (angle.fillColor !== 'none') {
					ctx.fillStyle = angle.fillColor;
					ctx.beginPath();
					ctx.moveTo(b[0], b[1]);
					ctx.lineTo(d[0], d[1]);
					ctx.lineTo(f[0], f[1]);
					ctx.lineTo(e[0], e[1]);
					ctx.lineTo(b[0], b[1]);
					ctx.fill();
				}
				if (angle.lineColor !== 'none') {
					ctx.strokeStyle = angle.lineColor;
					ctx.lineWidth = angle.lineWidth;
					if (angle.drawCurve !== false) {
						ctx.beginPath();
						ctx.lineTo(d[0], d[1]);
						ctx.lineTo(f[0], f[1]);
						ctx.lineTo(e[0], e[1]);
						ctx.stroke();
					}
					if (angle.drawLines !== false) {
						ctx.beginPath();
						ctx.moveTo(a[0], a[1])
						ctx.lineTo(b[0], b[1]);
						ctx.lineTo(c[0], c[1]);
						ctx.stroke();
					}
				}
				ctx.restore();

			} else {
				var normalVector = draw.three.getFaceNormal(face);
				var normalVector2 = vector.setMagnitude(normalVector, 100);
				var normPos2 = vector.addVectors(angle.pos[1], normalVector2);
				var radiusVector = vector.setMagnitude(v1, angle.radius);
				var pos = vector.addVectors(angle.pos[1], radiusVector);
				var curvePos = [clone(pos)];

				var v3 = clone(angle.pos[1]);
				var v4 = [-v3[0], -v3[1], -v3[2]];
				for (var a = 0.05; a < angleMeasure; a += 0.05) {
					pos = vector.addVectors(pos, v4);
					pos = draw.three.rotatePointAboutLine(pos, [0, 0, 0], normalVector2, -0.05);
					pos = vector.addVectors(pos, v3);
					curvePos.push(clone(pos));
				}
				var radiusVector2 = vector.setMagnitude(v2, angle.radius);
				var pos = vector.addVectors(angle.pos[1], radiusVector2);
				curvePos.push(clone(pos));

				var a = draw.three.convert3dPosTo2d(obj, angle.pos[0]);
				var b = draw.three.convert3dPosTo2d(obj, angle.pos[1]);
				var c = draw.three.convert3dPosTo2d(obj, angle.pos[2]);
				var curvePos2d = [];
				for (var p = 0; p < curvePos.length; p++) {
					curvePos2d[p] = draw.three.convert3dPosTo2d(obj, curvePos[p]);
				}

				ctx.save();
				if (!un(angle.fillTriangle) && angle.fillTriangle !== 'none') {
					ctx.fillStyle = angle.fillTriangle;
					ctx.beginPath();
					ctx.moveTo(a[0], a[1]);
					ctx.lineTo(b[0], b[1]);
					ctx.lineTo(c[0], c[1]);
					ctx.lineTo(a[0], a[1]);
					ctx.fill();
				}
				if (!un(angle.lineTriangle) && angle.lineTriangle !== 'none' && angle.lineTriangle !== false) {
					ctx.strokeStyle = angle.lineTriangle;
					ctx.lineWidth = angle.lineWidth;
					ctx.beginPath();
					ctx.moveTo(a[0], a[1]);
					ctx.lineTo(b[0], b[1]);
					ctx.lineTo(c[0], c[1]);
					ctx.lineTo(a[0], a[1]);
					ctx.stroke();
				}
				if (angle.fillColor !== 'none') {
					ctx.fillStyle = angle.fillColor;
					ctx.beginPath();
					ctx.moveTo(b[0], b[1]);
					for (var p = 0; p < curvePos2d.length; p++) {
						ctx.lineTo(curvePos2d[p][0], curvePos2d[p][1]);
					}
					ctx.lineTo(b[0], b[1]);
					ctx.fill();
				}
				if (angle.lineColor !== 'none') {
					ctx.strokeStyle = angle.lineColor;
					ctx.lineWidth = angle.lineWidth;
					if (angle.drawCurve !== false) {
						ctx.beginPath();
						ctx.moveTo(curvePos2d[0][0], curvePos2d[0][1]);
						for (var p = 1; p < curvePos2d.length; p++) {
							ctx.lineTo(curvePos2d[p][0], curvePos2d[p][1]);
						}
						ctx.stroke();
					}
					if (angle.drawLines !== false) {
						ctx.beginPath();
						ctx.moveTo(a[0], a[1])
						ctx.lineTo(b[0], b[1]);
						ctx.lineTo(c[0], c[1]);
						ctx.stroke();
					}
				}

				if (angle.labelType !== 'none' && Math.abs(face.angleToCamera - Math.PI / 2) > 0.1) {
					if (angle.labelType == 'measure') {
						var label = [Math.round(180 * angleMeasure / Math.PI) + degrees];
					} else {
						var label = angle.label;
					}

					var pos = vector.setMagnitude(v1, angle.labelRadius);
					pos = vector.addVectors(pos, angle.pos[1]);
					pos = vector.addVectors(pos, v4);
					pos = draw.three.rotatePointAboutLine(pos, [0, 0, 0], normalVector2, -angleMeasure / 2);
					pos = vector.addVectors(pos, v3);
					var pos2d = draw.three.convert3dPosTo2d(obj, pos);
					text({
						ctx: ctx,
						rect: [pos2d[0] - 50, pos2d[1] - 50, 100, 100],
						align: [0, 0],
						text: label
					});
				}
				ctx.restore();

			}
		},
		lineSegment: function (ctx, obj, lineSegment, face) {
			var a = draw.three.convert3dPosTo2d(obj, lineSegment.pos[0]);
			var b = draw.three.convert3dPosTo2d(obj, lineSegment.pos[1]);

			ctx.save();
			if (lineSegment.lineColor !== 'none') {
				ctx.strokeStyle = lineSegment.lineColor;
				ctx.lineWidth = lineSegment.lineWidth;
				ctx.beginPath();
				ctx.moveTo(a[0], a[1]);
				ctx.lineTo(b[0], b[1]);
				ctx.stroke();
			}
			ctx.restore();
		},
		arrow: function (ctx, obj, arrow, face) {
			var arrow2 = clone(arrow);
			arrow2.startPos = draw.three.convert3dPosTo2d(obj, arrow._pos3d[0]);
			arrow2.finPos = draw.three.convert3dPosTo2d(obj, arrow._pos3d[1]);

			ctx.save();
			draw.line.draw(ctx,arrow2,{obj:[arrow2]});
			ctx.restore();
		},
		polygon: function (ctx, obj, polygon, face) {
			var pos2d = [];
			for (var p = 0; p < polygon.pos.length; p++) {
				pos2d[p] = draw.three.convert3dPosTo2d(obj, polygon.pos[p]);
			}
			ctx.save();

			if (polygon.fillColor !== 'none' && polygon.fillColor !== false) {
				ctx.beginPath();
				ctx.moveTo(pos2d[0][0], pos2d[0][1]);
				for (var p = 1; p < pos2d.length; p++) {
					ctx.lineTo(pos2d[p][0], pos2d[p][1]);
				}
				if (boolean(polygon.close, true) == true) ctx.closePath();
				ctx.fillStyle = polygon.fillColor;
				ctx.fill();
			}
			if (polygon.lineColor !== 'none' && polygon.lineColor !== false) {
				ctx.beginPath();
				ctx.moveTo(pos2d[0][0], pos2d[0][1]);
				for (var p = 1; p < pos2d.length; p++) {
					ctx.lineTo(pos2d[p][0], pos2d[p][1]);
				}
				if (boolean(polygon.close, true) == true) ctx.closePath();
				ctx.strokeStyle = polygon.lineColor;
				ctx.lineWidth = polygon.lineWidth;
				ctx.stroke();
			}
			ctx.restore();
		}
	},
	drawLabel: function (ctx, obj, label, path) {
		if (label.show === false) return;
		var txt = label.text;
		if (typeof txt == 'string') txt = [txt];
		text({
			ctx: ctx,
			rect: [label.pos2d[0] - 100, label.pos2d[1] - 100, 200, 200],
			align: [0, 0],
			text: label.text
		});
	},

	getButtons: function (x1, y1, x2, y2, pathNum) {
		return [];
	},
	getCursorPositionsInteract: function (obj, pathNum, override) {
		var pos = [];
		/*for (var p = 0; p < obj.paths3d.length; p++) { // only do this in edit 3d shape mode
			var path3d = obj.paths3d[p];
			if (!un(draw.three.path3d[path3d.type]) && !un(draw.three.path3d[path3d.type].getDragPoints)) {
				pos = pos.concat(draw.three.path3d[path3d.type].getDragPoints(obj, path3d));
			}
			if (!un(path3d._faces)) {
				var radius = def([obj.pointRadius, 12]);
				for (var f = 0; f < path3d._faces.length; f++) {
					var face = path3d._faces[f];
					if (un(face.paths)) continue;
					for (var i = 0; i < face.paths.length; i++) {
						var path = face.paths[i];
						if (un(path.pos)) continue;
						var vars = path.vars || {};
						var pos2d = draw.three.convert3dPosTo2d(obj, path.pos);
						pos.push({
							shape: 'circle',
							dims: [pos2d[0], pos2d[1], radius],
							cursor: draw.cursors.move1,
							func: path.drag,
							obj: obj,
							path3d: path3d,
							vars: vars
						});
					}
				}
			}
		}*/
		return pos;
	},
	getCursorPositionsSelected: function (obj, pathNum, override) {
		if (draw.mode === 'interact' && override !== true) return [];
		var path = draw.path[pathNum];
		var pos = [];
		pos.push({
			shape: 'rect',
			dims: draw.three.getRect(obj),
			cursor: draw.cursors.move1,
			func: draw.three.drag3dStart,
			obj: obj
		});
		if (obj.mode === 'cubeBuilding') {
			var positions = draw.three.cubeDrawing.getCursorPositionsBuild(obj);
			draw.color = '#000';
			draw.cursors.update();
			for (var p2 = 0; p2 < positions.length; p2++) {
				pos.push({
					shape: 'polygon',
					dims: positions[p2].pos2d,
					cursor: 'url(' + draw.lineCursor + ') ' + draw.lineCursorHotspot[0] + ' ' + draw.lineCursorHotspot[1] + ', auto',
					func: draw.three.cubeDrawing.click,
					interact: true,
					path: path,
					obj: obj,
					position: positions[p2],
					mode: 'build'
				});
			}
		} else if (obj.mode === 'cubeRemoving') {
			var positions = draw.three.cubeDrawing.getCursorPositionsRemove(obj);
			draw.color = '#F00';
			draw.cursors.update();
			for (var p2 = 0; p2 < positions.length; p2++) {
				pos.push({
					shape: 'polygon',
					dims: positions[p2].pos2d,
					cursor: 'url(' + draw.lineCursor + ') ' + draw.lineCursorHotspot[0] + ' ' + draw.lineCursorHotspot[1] + ', auto',
					func: draw.three.cubeDrawing.click,
					interact: true,
					path: path,
					obj: obj,
					position: positions[p2],
					mode: 'remove'
				});
			}
		} else {
			for (var p = 0; p < obj.paths3d.length; p++) {
				var path3d = obj.paths3d[p];
				if (!un(draw.three.path3d[path3d.type]) && !un(draw.three.path3d[path3d.type].getDragPoints)) {
					pos = pos.concat(draw.three.path3d[path3d.type].getDragPoints(obj, path3d));
				}
				if (!un(path3d._faces)) {
					var radius = def([obj.pointRadius, 8]);
					for (var f = 0; f < path3d._faces.length; f++) {
						var face = path3d._faces[f];
						if (un(face.paths)) continue;
						for (var i = 0; i < face.paths.length; i++) {
							var path = face.paths[i];
							var vars = path.vars || {};
							if (!un(path.drag)) {
								var pos2d = draw.three.convert3dPosTo2d(obj, path.pos);
								pos.push({
									shape: 'circle',
									dims: [pos2d[0], pos2d[1], radius],
									cursor: draw.cursors.pointer,
									func: path.drag,
									obj: obj,
									path3d: path3d,
									vars: vars
								});
							}
						}
					}
				}
			}
		}
		return pos;
	},
	getControlPanel: function (obj) {
		var elements = [{
				name: 'Style',
				type: 'style'
			}, {
				name: 'opacity',
				bold: false,
				fontSize: 18,
				margin: 0.1,
				type: 'slider',
				value: 'alpha',
				min: 0,
				max: 1,
				step: 0.01
			}, {
				name: 'contrast',
				bold: false,
				fontSize: 18,
				margin: 0.1,
				type: 'slider',
				value: 'contrast',
				min: 0,
				max: 1,
				step: 0.01
			}, {
				name: 'View',
				type: 'multiSelect',
				get: draw.three.getView,
				set: draw.three.setView,
				options: [['isometric', 'plan'], ['front', 'side']]
			}, {
				name: 'grid',
				bold: false,
				fontSize: 18,
				margin: 0.2,
				type: 'toggle',
				set: draw.three.toggleGrid,
				get: draw.three.checkPathForGrid
			}, {
				name: 'dots',
				bold: false,
				fontSize: 18,
				margin: 0.2,
				type: 'toggle',
				set: draw.three.toggleDots,
				get: draw.three.checkPathForDots
			}, {
				name: 'arrow',
				bold: false,
				fontSize: 18,
				margin: 0.2,
				type: 'toggle',
				set: draw.three.toggleArrow,
				get: draw.three.checkPathForArrow
			}, {
				name: 'directional colour',
				bold: false,
				fontSize: 18,
				margin: 0.2,
				type: 'toggle',
				set: draw.three.toggleDirectionalColors,
				get: draw.three.getDirectionalColors
			}, {
				name: 'face grid',
				bold: false,
				fontSize: 18,
				margin: 0.2,
				type: 'toggle',
				set: draw.three.toggleFaceGrid,
				get: draw.three.getFaceGrid
			}, {
				name: 'Shape',
				type: 'multiSelect',
				get: draw.three.getShape,
				set: draw.three.setShape,
				options: [['cuboid', 'prism'], ['pyramid', 'cylinder'], ['cone', 'frustum'], ['sphere']]
			},
		];
		if (draw.three.checkPathForType(obj, 'pyramid') || draw.three.checkPathForType(obj, 'prism')) {
			elements.push({
				name: 'base vertices',
				bold: false,
				fontSize: 18,
				margin: 0.05,
				type: 'increment',
				increment: draw.three.verticesChange,
				min: 3,
				max: 20
			})
		}
		elements.push({
			name: 'snap to grid',
			bold: false,
			fontSize: 18,
			margin: 0.2,
			type: 'toggle',
			set: draw.three.toggleSnap,
			get: draw.three.getSnap
		});
		if (draw.three.checkPathForType(obj, 'cubeNet')) {
			elements.push({
				name: 'fold',
				bold: false,
				fontSize: 18,
				margin: 0.1,
				type: 'slider',
				min: 0,
				max: 1,
				step: 0.01,
				get: draw.three.properties.netOpen.get,
				set: draw.three.properties.netOpen.set
			});
		}
		return {
			obj: obj,
			elements: elements
		};
	},
	getRect: function (obj) {
		
		if (!un(obj._rect)) {
			//console.log('getRectQuick');
			return obj._rect;
		} else {
			//console.log('getRect');
			var x = obj.gridSize;//*Math.sqrt(2);
			return [obj.center[0]-x,obj.center[1]-x,x*2,x*2];
		}
		
		var xMin,
		xMax,
		yMin,
		yMax;
		for (var p = 0; p < obj.paths3d.length; p++) {
			var path3d = obj.paths3d[p];
			if (un(path3d._faces)) continue;
			for (var f = 0; f < path3d._faces.length; f++) {
				var face = path3d._faces[f];
				if (un(face.pos3d)) continue;
				for (var a = 0; a < face.pos3d.length; a++) {
					var pos = draw.three.convert3dPosTo2d(obj, face.pos3d[a]);
					xMin = (un(xMin)) ? pos[0] : Math.min(xMin, pos[0]);
					xMax = (un(xMax)) ? pos[0] : Math.max(xMax, pos[0]);
					yMin = (un(yMin)) ? pos[1] : Math.min(yMin, pos[1]);
					yMax = (un(yMax)) ? pos[1] : Math.max(yMax, pos[1]);
				}
			}
		}
		return [xMin, yMin, xMax - xMin, yMax - yMin];
	},
	changePosition: function (obj, dl, dt, dw, dh) {
		obj.center[0] += dl;
		obj.center[1] += dt;
		if (Math.abs(dw) < 0.0001 && Math.abs(dh) < 0.0001) return;
		if (Math.abs(dw) > Math.abs(dh)) {
			draw.three.scale(obj, Math.abs((obj.gridStep + dw) / obj.gridStep));
		} else {
			draw.three.scale(obj, Math.abs((obj.gridStep + dh) / obj.gridStep));
		}
	},
	getSnapPos: function (obj) {
		var vertices = [];
		var edges = [];

		for (var p = 0; p < obj.paths3d.length; p++) {
			var path3d = obj.paths3d[p];
			if (['grid', 'dotGrid', 'arrow'].includes(path3d.type)) continue;
			if (un(path3d._faces)) continue;
			for (var f = 0; f < path3d._faces.length; f++) {
				var face = path3d._faces[f];
				if (un(face.pos2d)) continue;
				for (var a = 0; a < face.pos2d.length; a++) {
					vertices.push({
						type: 'point',
						pos: face.pos2d[a]
					});
					edges.push({
						type: 'line',
						pos1: face.pos2d[a],
						pos2: face.pos2d[(a + 1) % face.pos2d.length]
					});
				}
			}
		}
		//return vertices.concat(edges);
		return vertices;
	},

	properties: {
		dotGrid: {
			type: 'boolean',
			get: function (obj) {
				for (var p = 0; p < obj.paths3d.length; p++)
					if (obj.paths3d[p].type == 'dotGrid')
						return true;
				return false;
			},
			set: function (obj, value) {
				if (value == false) {
					for (var p = 0; p < obj.paths3d.length; p++) {
						if (obj.paths3d[p].type == 'dotGrid') {
							obj.paths3d.splice(p, 1);
							break;
						}
					}
				} else {
					for (var p = 0; p < obj.paths3d.length; p++) {
						if (obj.paths3d[p].type == 'grid') {
							obj.paths3d.splice(p, 1);
							break;
						}
					}
					obj.paths3d.unshift(draw.three.path3d.dotGrid.get());
				}
			}
		},
		grid: {
			type: 'boolean',
			get: function (obj) {
				for (var p = 0; p < obj.paths3d.length; p++)
					if (obj.paths3d[p].type == 'grid')
						return true;
				return false;
			},
			set: function (obj, value) {
				if (value == false) {
					for (var p = 0; p < obj.paths3d.length; p++) {
						if (obj.paths3d[p].type == 'grid') {
							obj.paths3d.splice(p, 1);
							break;
						}
					}
				} else {
					for (var p = 0; p < obj.paths3d.length; p++) {
						if (obj.paths3d[p].type == 'dotGrid') {
							obj.paths3d.splice(p, 1);
							break;
						}
					}
					obj.paths3d.unshift(draw.three.path3d.grid.get());
				}
			}
		},
		arrow: {
			type: 'boolean',
			get: function (obj) {
				for (var p = 0; p < obj.paths3d.length; p++)
					if (obj.paths3d[p].type == 'arrow')
						return true;
				return false;
			},
			set: function (obj, value) {
				if (value == false) {
					for (var p = 0; p < obj.paths3d.length; p++) {
						if (obj.paths3d[p].type == 'arrow') {
							obj.paths3d.splice(p, 1);
							break;
						}
					}
				} else {
					obj.paths3d.unshift(draw.three.paths3d.arrow.get());
				}
			}
		},
		directionalColors: {
			type: 'boolean',
			get: function (obj) {
				return boolean(obj.directionalColors, false);
			},
			set: function (obj, value) {
				obj.directionalColors = value;
			}
		},
		snap: {
			type: 'boolean',
			get: function (obj) {
				if (obj.snapTo > 1)
					return true;
				return false;
			},
			set: function (obj) {
				if (value == false) {
					obj.snapTo = 0.001;
				} else {
					obj.snapTo = obj.gridStep;
				}
			}
		},
		shape: {
			type: ['cuboid', 'prism', 'pyramid', 'cylinder', 'cone', 'frustum', 'sphere'],
			get: function (obj) {
				for (var p = 0; p < obj.paths3d.length; p++) {
					if (['grid', 'dotGrid', 'arrow'].includes(obj.paths3d[p].type) == false) {
						return obj.paths3d[p].type;
					}
				}
				return 'none';
			},
			set: function (obj, value) {
				for (var p = 0; p < obj.paths3d.length; p++)
					if (obj.paths3d[p].type == value)
						return;

				for (p = obj.paths3d.length - 1; p >= 0; p--) {
					var path3d = obj.paths3d[p];
					if (['grid', 'arrow', 'dotGrid'].includes(path3d.type))
						continue;
					obj.paths3d.splice(p, 1);
				}

				obj.paths3d.push(draw.three.path3d[type].get());
			},
			cycle: function (obj) {
				var current = this.get(obj);
				var index = this.type.indexOf(current);
				var next = this.type[(index + 1) % this.type.length];
				this.set(obj, next);
			}
		},

		view: {
			type: ['isometric', 'plan', 'front', 'side', 'none'],
			get: function (obj) {},
			set: function (obj, value) {},
			cycle: function (obj) {}
		},
		alpha: {
			type: 'number',
			min: 0,
			max: 1,
			get: function (obj) {},
			increment: function (obj, inc) {},
			set: function (obj, value) {}
		},
		contrast: {
			type: 'number',
			min: 0,
			max: 1,
			get: function (obj) {},
			increment: function (obj, inc) {},
			set: function (obj, value) {}
		},
		vertices: {
			type: 'number',
			min: 3,
			max: 20,
			get: function (obj) {},
			increment: function (obj, inc) {},
			set: function (obj, value) {}
		},
		netOpen: {
			type: 'number',
			min: 0,
			max: 1,
			get: function (obj) {
				for (var p = 0; p < obj.paths3d.length; p++) {
					var path3d = obj.paths3d[p];
					if (!un(path3d.open))
						return path3d.open;
				}
			},
			increment: function (obj, inc) {
				for (var p = 0; p < obj.paths3d.length; p++) {
					var path3d = obj.paths3d[p];
					if (!un(path3d.open))
						path3d.open += inc;
				}
			},
			set: function (obj, value) {
				for (var p = 0; p < obj.paths3d.length; p++) {
					var path3d = obj.paths3d[p];
					if (!un(path3d.open))
						path3d.open = value;
				}
			}
		},

		lineWidth: {
			type: 'number',
			min: 1,
			max: 5,
			inc: 1,
			get: function (obj) {},
			increment: function (obj, inc) {},
			set: function (obj, value) {}
		},
		lineDash: {
			type: 'number',
			min: 0,
			max: 20,
			inc: 5,
			get: function (obj) {},
			increment: function (obj, inc) {},
			set: function (obj, value) {}
		},
		lineColor: {
			type: 'color',
			get: function (obj) {},
			set: function (obj, value) {}
		},
		fillColor: {
			type: 'color',
			get: function (obj) {},
			set: function (obj, value) {}
		},
	},
	checkPathForType: function (obj, type) {
		for (var p = 0; p < obj.paths3d.length; p++)
			if (obj.paths3d[p].type == type)
				return true;
		return false;
	},

	setPath3d: function () {
		var obj = draw.path[draw.currCursor.pathNum].obj[0];
		var path = draw.currCursor.path3d;
		if (draw.three.checkPathForType(obj, path.type))
			return;
		var toDelete = [];
		for (p = obj.paths3d.length - 1; p >= 0; p--) {
			var path3d = obj.paths3d[p];
			if (['grid', 'arrow'].includes(path3d.type))
				continue;
			obj.paths3d.splice(p, 1);
		}
		obj.paths3d.push(clone(path));
		drawCanvasPaths();
	},
	toggleDots: function (obj) {
		if (draw.three.checkPathForDots(obj) == true) {
			for (var p = 0; p < obj.paths3d.length; p++) {
				if (obj.paths3d[p].type == 'dotGrid') {
					obj.paths3d.splice(p, 1);
					break;
				}
			}
		} else {
			for (var p = 0; p < obj.paths3d.length; p++) {
				if (obj.paths3d[p].type == 'grid') {
					obj.paths3d.splice(p, 1);
					break;
				}
			}
			obj.paths3d.unshift({
				type: 'dotGrid',
				squares: 8,
				size: obj.gridStep,
				direction: [0, 0, 1],
				strokeStyle: '#999',
				fillStyle: '#999',
				alpha: 1
			});
		}
		drawCanvasPaths();
	},
	toggleArrow: function (obj) {
		if (draw.three.checkPathForArrow(obj) == true) {
			for (var p = 0; p < obj.paths3d.length; p++) {
				if (obj.paths3d[p].type == 'arrow') {
					obj.paths3d.splice(p, 1);
					break;
				}
			}
		} else {
			obj.paths3d.unshift({
				type: 'arrow',
				pos: [[350, 0, 0], [250, 0, 0]],
				fill: true,
				color: '#000'
			});
		}
		drawCanvasPaths();
	},
	toggleGrid: function (obj, dir) {
		if (un(dir))
			dir = [0, 0, 1];
		if (draw.three.checkPathForGrid(obj, dir) == true) {
			for (var p = 0; p < obj.paths3d.length; p++) {
				if (obj.paths3d[p].type == 'grid' && arraysEqual(dir, obj.paths3d[p].direction)) {
					obj.paths3d.splice(p, 1);
					break;
				}
			}
		} else {
			for (var p = 0; p < obj.paths3d.length; p++) {
				if (obj.paths3d[p].type == 'dotGrid') {
					obj.paths3d.splice(p, 1);
					break;
				}
			}
			obj.paths3d.unshift({
				type: 'grid',
				squares: 8,
				size: obj.gridStep,
				direction: clone(dir),
				color: '#CCC',
				alpha: 1
			});
		}
		drawCanvasPaths();
	},
	toggleSnap: function (obj) {
		if (draw.three.getSnap(obj) == true) {
			obj.snapTo = 0.001;
		} else {
			obj.snapTo = obj.gridStep;
		}
		draw.updateSelectedBorders();
		drawCanvasPaths();
	},
	toggleDirectionalColors: function (obj) {
		obj.directionalColors = !draw.three.getDirectionalColors(obj);
		drawCanvasPaths();
	},
	toggleFaceGrid: function (obj, faceGrid) {
		obj.faceGrid = !obj.faceGrid;
		drawCanvasPaths();
	},
	setLineWidth: function (obj, lineWidth) {
		obj.lineWidth = lineWidth;
	},
	setLineColor: function (obj, strokeStyle) {
		obj.strokeStyle = strokeStyle;
	},
	setFillColor: function (obj, fillStyle) {
		obj.fillStyle = fillStyle;
	},
	setLineDash: function (obj, dash) {
		obj.dash = dash;
	},
	setShape: function (obj, type) {
		if (draw.three.checkPathForType(obj, type))
			return;
		var toDelete = [];
		for (p = obj.paths3d.length - 1; p >= 0; p--) {
			var path3d = obj.paths3d[p];
			if (['grid', 'arrow', 'dotGrid'].includes(path3d.type))
				continue;
			obj.paths3d.splice(p, 1);
		}
		obj.paths3d.push(draw.three.path3d[type].get());
	},
	setView: function (obj, angle, tilt) {
		if (angle == 'plan') {
			angle = 1.5 * Math.PI;
			tilt = 1;
		} else if (angle == 'side') {
			angle = 1 * Math.PI;
			tilt = 0;
		} else if (angle == 'front') {
			angle = 1.5 * Math.PI;
			tilt = 0;
		} else if (angle == 'isometric') {
			angle = 1.25 * Math.PI;
			tilt = 0.5 / (7 / 8);
		}
		if (!un(angle))
			obj.angle = angle;
		if (!un(tilt))
			obj.tilt = tilt;
		drawCanvasPaths();
	},

	checkPathForDots: function (obj) {
		return draw.three.checkPathForType(obj, 'dotGrid');
	},
	checkPathForArrow: function (obj) {
		return draw.three.checkPathForType(obj, 'arrow');
	},
	checkPathForGrid: function (obj, dir) {
		if (un(dir))
			dir = [0, 0, 1];
		for (var p = 0; p < obj.paths3d.length; p++)
			if (obj.paths3d[p].type == 'grid' && arraysEqual(dir, obj.paths3d[p].direction))
				return true;
		return false;
	},
	getSnap: function (obj) {
		if (obj.snapTo > 1)
			return true;
		return false;
	},
	getDirectionalColors: function (obj) {
		return boolean(obj.directionalColors, false);
	},
	getLineWidth: function (obj) {
		return obj.lineWidth || 1;
	},
	getLineColor: function (obj) {
		return obj.strokeStyle || '#000';
	},
	getFillColor: function (obj) {
		return obj.fillStyle;
	},
	getLineDash: function (obj) {
		return !un(obj.dash) ? obj.dash : [0, 0];
	},
	getShape: function (obj) {
		for (var p = 0; p < obj.paths3d.length; p++) {
			if (['grid', 'dotGrid', 'arrow'].includes(obj.paths3d[p].type) == false) {
				return obj.paths3d[p].type;
			}
		}
		return 'none';
	},
	getView: function (obj) {
		if (obj.angle == 1.5 * Math.PI && obj.tilt == 1)
			return 'plan';
		if (obj.angle == 1 * Math.PI && obj.tilt == 0)
			return 'side';
		if (obj.angle == 1.5 * Math.PI && obj.tilt == 0)
			return 'front';
		if (obj.angle == 1.25 * Math.PI && obj.tilt == 0.5 / (7 / 8))
			return 'isometric';
		return 'none';
	},
	getFaceGrid: function (obj) {
		return !un(obj.faceGrid) ? obj.faceGrid : [0, 0];
	},

	alphaChange: function (obj, num) {
		obj.alpha = Math.min(1, Math.max(0, obj.alpha + num));
		drawCanvasPaths();
	},
	contrastChange: function (obj, num) {
		obj.contrast = Math.min(1, Math.max(0, obj.contrast + num));
		drawCanvasPaths();
	},
	verticesChange: function (obj, num) {
		for (var p = 0; p < obj.paths3d.length; p++) {
			if (['prism', 'pyramid'].includes(obj.paths3d[p].type)) {
				var path3d = obj.paths3d[p];
				var vertices = path3d.polygon.length + num;
				if (vertices < 3)
					return;
				var radius = 2 * obj.gridStep;
				path3d.polygon = [];
				var da = 2 * Math.PI / vertices;
				var a = -da / 2;
				for (var i = 0; i < vertices; i++) {
					path3d.polygon.push([radius * Math.cos(a), radius * Math.sin(a)]);
					a += da;
				}
				drawSelectedPaths();
			}
		}
	},

	// geometry functions
	rotateShape: function (obj) {
		if (un(obj)) obj = sel();
		for (var p = 0; p < obj.paths3d.length; p++) {
			if (['grid', 'dotGrid', 'arrow'].includes(obj.paths3d[p].type) == false) {
				if (!un(draw.three.path3d[obj.paths3d[p].type].rotate)) {
					draw.three.path3d[obj.paths3d[p].type].rotate(obj, obj.paths3d[p]);
				}
			}
		}
		drawCanvasPaths();
	},
	translatePolygon: function(polygon,offset) {
		return polygon.map(function(point) {
			return vector.addVectors(point,offset);
		});
	},
	rotatePolygonAboutLine: function(polygon,line,angle) {
		return polygon.map(function(point) {
			return draw.three.rotatePointAboutLine(point,line[0],line[1],angle);
		});
	},
	rotatePoint: function (pos, axis) { // 90 degrees
		if (axis == 0 || axis == 'x') {
			var matrix = [
				[1, 0, 0],
				[0, 0, -1],
				[0, 1, 0]
			];
		} else if (axis == 1 || axis == 'y') {
			var matrix = [
				[0, 0, 1],
				[0, 1, 0],
				[-1, 0, 0]
			];
		} else if (axis == 2 || axis == 'z') {
			var matrix = [
				[0, -1, 0],
				[1, 0, 0],
				[0, 0, 1]
			];
		}
		pos = [
			matrix[0][0] * pos[0] + matrix[0][1] * pos[1] + matrix[0][2] * pos[2],
			matrix[1][0] * pos[0] + matrix[1][1] * pos[1] + matrix[1][2] * pos[2],
			matrix[2][0] * pos[0] + matrix[2][1] * pos[1] + matrix[2][2] * pos[2],
		];
		return pos;
	},
	rotatePoint2: function (pos, axis, angle) {
		if (axis == 0 || axis == 'x') {
			var matrix = [
				[1, 0, 0],
				[0, Math.cos(angle), -Math.sin(angle)],
				[0, Math.sin(angle), Math.cos(angle)]
			];
		} else if (axis == 1 || axis == 'y') {
			var matrix = [
				[Math.cos(angle), 0, Math.sin(angle)],
				[0, 1, 0],
				[-Math.sin(angle), 0, Math.cos(angle)]
			];
		} else if (axis == 2 || axis == 'z') {
			var matrix = [
				[Math.cos(angle), -Math.sin(angle), 0],
				[Math.sin(angle), Math.cos(angle), 0],
				[0, 0, 1]
			];
		}
		pos = [
			matrix[0][0] * pos[0] + matrix[0][1] * pos[1] + matrix[0][2] * pos[2],
			matrix[1][0] * pos[0] + matrix[1][1] * pos[1] + matrix[1][2] * pos[2],
			matrix[2][0] * pos[0] + matrix[2][1] * pos[1] + matrix[2][2] * pos[2],
		];
		return pos;
	},
	rotatePointAboutLine: function (pos, linePos1, linePos2, angle) {
		var c = Math.cos(angle);
		var s = Math.sin(angle);
		var c2 = 1 - c;
		var dir = draw.three.getNormalisedVector([linePos2[0] - linePos1[0], linePos2[1] - linePos1[1], linePos2[2] - linePos1[2]]);
		var x = dir[0];
		var y = dir[1];
		var z = dir[2];

		var matrix = [
			[x * x * c2 + c, x * y * c2 - z * s, x * z * c2 + y * s],
			[y * x * c2 + z * s, y * y * c2 + c, y * z * c2 - x * s],
			[z * x * c2 - y * s, z * y * c2 + x * s, z * z * c2 + c]
		];

		pos = vector.addVectors(pos,vector.scalarMult(linePos1,-1)); // offset pos so line goes through origin
		pos = [
			matrix[0][0] * pos[0] + matrix[0][1] * pos[1] + matrix[0][2] * pos[2],
			matrix[1][0] * pos[0] + matrix[1][1] * pos[1] + matrix[1][2] * pos[2],
			matrix[2][0] * pos[0] + matrix[2][1] * pos[1] + matrix[2][2] * pos[2],
		];
		pos = vector.addVectors(pos,linePos1); // undo offset
		
		return pos;
	},
	get2dPosIntersectionWithPlane: function(obj, pos2d, planePos, planeNormal) {
		var l0 = draw.three.convert2dPosTo3d(obj, pos2d, 0);
		var lambda = (vector.dotProduct(planeNormal, planePos) - vector.dotProduct(planeNormal, l0)) / (vector.dotProduct(planeNormal, obj._camera));
		return vector.addVectors(l0, vector.scalarMult(obj._camera, lambda));
	},
	convert3dPosTo2d: function (obj, pos) {
		var x = pos[0], y = pos[1], h = pos[2];
		var r = Math.sqrt(x * x + y * y);
		var pointAngle = Math.atan(y / x);
		if (x < 0) pointAngle += Math.PI;
		if (x == 0 && y == 0) pointAngle = 0;
		if (x == 0 && y < 0) pointAngle = 1.5 * Math.PI;
		if (x == 0 && y > 0) pointAngle = 0.5 * Math.PI;
		var angle = draw.three.simplifyAngle(pointAngle - obj.angle);
		var height = draw.three.convert3dHeightTo2d(obj, h);
		return [obj.center[0] + r * Math.cos(angle), obj.center[1] + r * obj.tilt * Math.sin(angle) - height];
	},
	convert2dPosTo3d: function (obj, pos, h) {
		if (un(h)) h = 0;
		var unitVectors = [
			[Math.cos(-obj.angle), Math.sin(-obj.angle)],
			[Math.sin(obj.angle), Math.cos(-obj.angle)],
		];
		var pos2d = [
			(pos[0] - obj.center[0]),
			(pos[1] - obj.center[1] + h) / obj.tilt
		];
		var pos3d = [
			(pos2d[0] * unitVectors[0][0] + pos2d[1] * unitVectors[0][1]),
			(pos2d[0] * unitVectors[1][0] + pos2d[1] * unitVectors[1][1]),
			h
		];
		//console.log(unitVectors,pos2d,pos3d);
		return pos3d;
	},
	convert3dHeightTo2d: function (obj, h) {
		if (h == 0)
			return 0;
		var sign = obj.tilt < 0 ? -1 : 1;
		//return sign*h*(Math.acos(Math.abs(obj.tilt)));
		return sign * h * (1 - Math.pow(Math.abs(obj.tilt), 3));
	},
	convert2dHeightTo3d: function (obj, h) {
		if (h == 0)
			return 0;
		var sign = obj.tilt < 0 ? -1 : 1;
		return sign * h / (1 - Math.pow(Math.abs(obj.tilt), 3));
	},
	getFaceNormal: function (face) {
		var sumVector = [0, 0, 0];
		for (var p = 0; p < face.pos3d.length; p++) {
			var next = (p + 1) % face.pos3d.length;
			var cross = draw.three.getCrossProduct(face.pos3d[p], face.pos3d[next]);
			for (var i = 0; i < 3; i++)
				sumVector[i] += cross[i];
		}
		var normalised = draw.three.getNormalisedVector(sumVector);
		return normalised.map(function(x) {
			return Math.abs(x) < 0.001 ? 0 : x;
		});
		/*var pos = [face.pos3d[0]];
		var tol = 0.000001;
		for (var i = 1; i < face.pos3d.length; i++) {
		var found = false;
		for (var j = 0; j < pos.length; j++) {
		if (Math.abs(face.pos3d[i][0]-pos[j][0]) < tol && Math.abs(face.pos3d[i][1]-pos[j][1]) < tol && Math.abs(face.pos3d[i][2]-pos[j][2]) < tol) {
		found = true;
		break;
		}
		}
		if (found == false) {
		pos.push(face.pos3d[i]);
		if (pos.length == 3) break;
		}
		}
		if (pos.length < 3) return [0,0,-1];
		return draw.three.getNormalToPlaneFromThreePoints(pos[0],pos[1],pos[2]);*/
	},
	getNormalToPlaneFromThreePoints: function (a, b, c) {
		var u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
		var v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
		var nx = u[1] * v[2] - u[2] * v[1];
		var ny = u[2] * v[0] - u[0] * v[2];
		var nz = u[0] * v[1] - u[1] * v[0];
		return [nx, ny, nz];
	},
	getCrossProduct: function (a, b) {
		return [
			a[1] * b[2] - a[2] * b[1],
			a[2] * b[0] - a[0] * b[2],
			a[0] * b[1] - a[1] * b[0]
		];
	},
	getVectorMagnitude: function (a) {
		return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
	},
	getNormalisedVector: function (a) {
		var mag = draw.three.getVectorMagnitude(a)
			return [a[0] / mag, a[1] / mag, a[2] / mag];
	},
	drawNormalToFace: function (ctx, obj, face) {
		var meanPoint = draw.three.getMeanPoint(face.pos3d);
		var normalMag = Math.sqrt(Math.pow(face.normal[0], 2) + Math.pow(face.normal[1], 2) + Math.pow(face.normal[2], 2));
		face.normal = [face.normal[0] / normalMag, face.normal[1] / normalMag, face.normal[2] / normalMag];
		var normalPoint = [meanPoint[0] + 20 * face.normal[0], meanPoint[1] + 20 * face.normal[1], meanPoint[2] + 20 * face.normal[2]];
		var pos1 = draw.three.convert3dPosTo2d(obj, meanPoint);
		var pos2 = draw.three.convert3dPosTo2d(obj, normalPoint);

		ctx.save();
		ctx.strokeStyle = '#F00';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(pos1[0], pos1[1]);
		ctx.lineTo(pos2[0], pos2[1]);
		ctx.stroke();
		ctx.restore();
	},
	getMeanPoint: function (polygon) {
		var total = [0, 0, 0];
		for (var i = 0; i < polygon.length; i++) {
			total[0] += polygon[i][0];
			total[1] += polygon[i][1];
			total[2] += polygon[i][2];
		}
		return [total[0] / polygon.length, total[1] / polygon.length, total[2] / polygon.length];
	},
	getDistanceTwoPoints: function (p1, p2) {
		return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2) + Math.pow(p1[2] - p2[2], 2));
	},
	getRelAngle: function (angle) { // gets angle relative to back (ie. 1.5*Math.PI)
		if (angle < 0.5 * Math.PI)
			return angle + 0.5 * Math.PI;
		return angle - 1.5 * Math.PI;
	},
	getAngleBetweenTwo3dVectors: function (v1, v2) {
		var dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
		var mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
		var mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);
		return Math.acos(dot / (mag1 * mag2));
	},
	simplifyAngle: function (angle) {
		while (angle < 0)
			angle += 2 * Math.PI;
		while (angle > 2 * Math.PI)
			angle -= 2 * Math.PI;
		return angle;
	},
	getColor: function (color, brightness, alpha) { // brightness is a value from 0 to 1
		if (color == 'none') return 'none';
		var c = hexToRgb(color);
		if (un(alpha)) alpha = 1;
		return 'rgba(' + Math.round(c.r * brightness) + ',' + Math.round(c.g * brightness) + ',' + Math.round(c.b * brightness) + ',' + alpha + ')';
	},
	get2dPolygonGridLines: function(polygon, gridStep, offset) {
		var gridLines = [];
		var edges = [];
		polygon = clone(polygon);
		var xMin = xMax = polygon[0][0], yMin = yMax = polygon[0][1];
		for (var v = 0; v < polygon.length; v++) {
			xMin = Math.min(xMin, polygon[v][0]);
			xMax = Math.max(xMax, polygon[v][0]);
			yMin = Math.min(yMin, polygon[v][1]);
			yMax = Math.max(yMax, polygon[v][1]);
		}
		if (offset === true) {
			polygon = polygon.map(function(v) {
				return [v[0]-xMin,v[1]-yMin];
			});
			xMax -= xMin;
			yMax -= yMin;
			var offset2 = [xMin,yMin];
			xMin = 0;
			yMin = 0;
		}
		for (var v = 0; v < polygon.length; v++) {
			edges.push([polygon[v], polygon[(v + 1) % polygon.length]]);
		}
		var x = gridStep * Math.ceil(xMin / gridStep);
		while (x <= xMax) {
			var intersections = [];
			var gridLine = [[x,0],[x,1]];
			for (var e = 0; e < edges.length; e++) {
				var edge = edges[e];
				var inter = gridLineEdgeIntersection(gridLine,edge);
				if (inter !== false) intersections.push(inter);
			}
			if (intersections.length === 2) {
				gridLines.push(intersections);
			} else if (intersections.length > 2) {
				var minY = intersections[0][1];
				var maxY = intersections[0][1];
				for (var i = 0; i < intersections.length; i++) {
					var y = intersections[i][1];
					minY = Math.min(y,minY);
					maxY = Math.max(y,maxY);
				}
				gridLines.push([[x,minY],[x,maxY]]);
			}
			x += gridStep;
		}
		var y = gridStep * Math.ceil(yMin / gridStep);
		while (y <= yMax) {
			var intersections = [];
			var gridLine = [[0,y],[1,y]];
			for (var e = 0; e < edges.length; e++) {
				var edge = edges[e];
				var inter = gridLineEdgeIntersection(gridLine,edge);
				if (inter !== false) intersections.push(inter);
			}
			if (intersections.length === 2) {
				gridLines.push(intersections);
			} else if (intersections.length > 2) {
				var minX = intersections[0][0];
				var maxX = intersections[0][0];
				for (var i = 0; i < intersections.length; i++) {
					var x = intersections[i][0];
					minX = Math.min(x,minX);
					maxX = Math.max(x,maxX);
				}
				gridLines.push([[minX,y],[maxX,y]]);
			}
			y += gridStep;
		}
		if (offset === true) {
			gridLines = gridLines.map(function(gridLine) {
				return [[gridLine[0][0]+offset2[0],gridLine[0][1]+offset2[1]],[gridLine[1][0]+offset2[0],gridLine[1][1]+offset2[1]]];
			});
		}
		return gridLines;
		function gridLineEdgeIntersection(gridLine,edge) {
			var tol = 0.01;
			if (distancePointToLine(edge[0], gridLine[0], gridLine[1]) < tol) return edge[0];
			if (distancePointToLine(edge[1], gridLine[0], gridLine[1]) < tol) return edge[1];
			if (intersects2(gridLine[0][0], gridLine[0][1], gridLine[1][0], gridLine[1][1], edge[0][0], edge[0][1], edge[1][0], edge[1][1]) == true) {
				return intersection(gridLine[0][0], gridLine[0][1], gridLine[1][0], gridLine[1][1], edge[0][0], edge[0][1], edge[1][0], edge[1][1]);
			}
			return false;
		}
		
	},
	get2dPolygonCentroid:function(polygon) {
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

	pointDragStart: function (e) {
		draw.animate(draw.three.pointDragMove,draw.three.pointDragStop,drawCanvasPaths);
		draw.drag = {
			obj: draw.currCursor.obj,
			path3d: draw.currCursor.path3d,
			vars: draw.currCursor.vars
		};
		//console.log(draw.drag);
		draw.cursorCanvas.style.cursor = draw.currCursor.cursor;
	},
	pointDragMove: function (e) {
		updateMouse(e);
		var path3d = draw.drag.path3d;
		if (typeof draw.three.path3d[path3d.type].pointDragMove == 'function') {
			draw.three.path3d[path3d.type].pointDragMove(draw.drag.obj, path3d, draw.drag.vars);
			//drawCanvasPaths();
		}
	},
	pointDragStop: function (e) {
		delete draw.drag;
		draw.updateSelectedBorders();
		calcCursorPositions();
	},
	snapPos: function (obj, value, direction) {
		var snapTo = obj.snapTo || obj.gridStep || 60;
		if (!un(obj.gridBounds)) {
			return bound(value, obj.gridBounds[direction][0] * obj.gridStep, obj.gridBounds[direction][1] * obj.gridStep, snapTo);
		} else {
			if (direction < 2) {
				return Math.max(-obj.gridSize, Math.min(obj.gridSize, roundToNearest(value, snapTo)));
			} else {
				return Math.max(0, Math.min(2 * obj.gridSize, roundToNearest(value, snapTo)));
			}
		}
	},

	drag3dStart: function (e) {
		updateMouse(e);
		draw.animate(draw.three.drag3dMove,draw.three.drag3dStop,drawSelectedPaths);
		//addListenerMove(window, draw.three.drag3dMove);
		//addListenerEnd(window, draw.three.drag3dStop);
		draw.drag = {
			obj: draw.currCursor.obj,
			mouse: draw.mouse
		};
		draw.cursorCanvas.style.cursor = draw.cursors.move2;
		if (draw.mode == 'interact') {
			draw.drag.obj._path._interacting = true;
			drawCanvasPaths();
		}
	},
	drag3dMove: function (e) {
		updateMouse(e);
		var obj = draw.drag.obj;
		var dx = draw.mouse[0] - draw.drag.mouse[0];
		var dy = draw.mouse[1] - draw.drag.mouse[1];
		var tiltMin = def([obj.tiltMin, 0]);
		var tiltMax = def([obj.tiltMax, 1]);
		obj.tilt = Math.min(tiltMax, Math.max(tiltMin, obj.tilt + dy * 0.005));
		var angleMin = def([obj.angleMin, -7]);
		var angleMax = def([obj.angleMax, 7]);
		obj.angle = Math.min(angleMax, Math.max(angleMin, obj.angle + dx * 0.01));
		while (obj.angle < 0)
			obj.angle += 2 * Math.PI;
		while (obj.angle > 2 * Math.PI)
			obj.angle -= 2 * Math.PI;
		draw.drag.mouse = draw.mouse;
		//drawSelectedPaths();
	},
	drag3dStop: function (e) {
		draw.updateSelectedBorders();
		calcCursorPositions();
		//removeListenerMove(window, draw.three.drag3dMove);
		//removeListenerEnd(window, draw.three.drag3dStop);
		draw.cursorCanvas.style.cursor = draw.cursors.move1;
		if (draw.mode == 'interact') {
			delete draw.drag.obj._path._interacting;
			drawCanvasPaths();
		}
		delete draw.drag;
	},

	drawButton: function (ctx, size, type) {
		text({
			ctx: ctx,
			align: [0, 0],
			rect: [0, 0, size, size],
			text: ['<<fontSize:' + (size / 2) + '>>3d']
		});
	}
};
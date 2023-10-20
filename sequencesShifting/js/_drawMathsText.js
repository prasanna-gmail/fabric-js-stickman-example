var logMathsTextLoc = false;

function drawRootSign(obj) {
	var ctx = obj.ctx;
	var rect = obj.rect;
	var lineWidth = obj.lineWidth || obj.fontSize/20;
	var symbolWidth = obj.symbolWidth;
	var color = obj.color || '#000';
	
	var l = rect[0];
	var t = rect[1];
	var w = rect[2];
	var h = rect[3];
	
	var x = [
		l,
		l+0.15*symbolWidth,
		l+0.5*symbolWidth,
		l+symbolWidth,
		l+w
	];
	var y = [
		t+0.58*h,
		t+0.5*h,
		t+h,
		t,
		t
	];

	ctx.save();
	ctx.lineJoin = 'miter';
	ctx.lineCap = 'butt';
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.beginPath();
	for (var p = 0; p < 4; p++) {
		ctx.moveTo(x[p],y[p]);
		ctx.lineTo(x[p+1],y[p+1]);
	}
	ctx.stroke();
	ctx.restore();
}
function drawMathsText2(object) {
	var ctx = object.ctx || object.context;
	var textArray = object.textArray;
	
	var fontSize = object.fontSize || 24;
	var horizPos = object.horizPos || 10;
	var vertPos = object.vertPos || 20;
	var algText = boolean(algText,false);
	var textLoc = [];
	var horizAlign = object.horizAlign || 'left';
	var vertAlign = object.vertAlign || 'middle';
	var textColor = object.textColor || '#000';
	var mode = object.mode || 'draw';
	var backColor = object.backColor || 'none';
	var bold = boolean(object.bold,false);
	var italic = boolean(object.italic,false);
	var fontName = object.fontName || 'Arial';
	var selected = boolean(object.selected,false);
	
	drawMathsText(ctx,textArray,fontSize,horizPos,vertPos,algText,textLoc,horizAlign,vertAlign,textColor,mode,backColor,bold,italic,fontName,selected);
}

// draws mathsText (or just measures its potential length)
function drawMathsText(context, textArray, fontSize, horizPos, vertPos, algText, textLoc, horizAlign, vertAlign, textColor, mode, backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding, letterSpacingMode) {
	if (typeof timeLog !== 'undefined' && timeLog == true) {
		var d1 = new Date;
		var t1 = d1.getTime();
	}
		
	//defaults
	if (fontName == 'algebra' || typeof algText !== 'boolean') algText = true;
	
	if (!textLoc) {textLoc = [];} // array to contain details of the position of each char
	if (!horizAlign) {horizAlign = 'left';}
	if (!vertAlign) {vertAlign = 'middle';}
	if (!textColor) {textColor = '#000';}
	if (!mode) {mode = 'draw';}
	if (!backColor) {backColor = 'none';}
	if (!fracScale) {fracScale = 0.7;}
	if (un(letterSpacingMode)) letterSpacingMode = 'auto';
	if (typeof sf == 'undefined') sf = 1;
	textLoc = [];

	/*if (mode == 'draw') {
		//console.log('drawMathsText:',JSON.stringify(textArray));
		//console.log('fontSize:',fontSize);
		//console.log('fracFontSize:',fracFontSize);
	}*/
	
	if (logMathsTextLoc == true) {
		console.log('-------------');
		console.log('drawMathsText:',JSON.stringify(textArray));
		console.log('textLoc:',textLoc);
	}
	
	var mode2 = 'measure';
	var leftPoint;
	var startLeftPoint; // required for tabs
	var vertCenter;
	var width;
	var height;
	var top;
	var bottom;
	
	if (typeof bold == 'undefined') bold = false;
	if (typeof italic == 'undefined') italic = false;
	if (typeof fontName == 'undefined') fontName = 'Arial';
	if (typeof selected == 'undefined') selected = false;	
	var textColor;
	var font;
	var algFont;
	var algFont2;
	var algFont3;
	
	var startAlgText = algText;
	var startBold = bold;
	var startItalic = italic;
	var startFont = fontName;
	var startFontSize = fontSize*sf;
	var startColor = textColor;
	var startBackColor = backColor;
	var startSelected = selected;
	
	//console.log('--textArray:',textArray,'bold:',bold,'italic:',italic,'fontName:',fontName);
		
	function buildFont() {
		font = '';
		if (italic == true) font += 'italic ';
		if (bold == true) font += 'bold ';
		var fontSize2 = roundToNearest(fontSize,0.1);
		if (algText == true) {
			font += fontSize2 + 'px Arial';
		} else {
			font += fontSize2 + 'px ' + fontName;
		}
		//algFont = 'italic ' + fontSize2 + 'px Georgia';
		if (bold == true) {
			algFont = 'italic bold ' + fontSize2 + 'px Georgia';
			algFont2 = 'bold ' + fontSize2 + 'px Times New Roman';
			algFont3 = 'bold ' + fontSize2 + 'px Arial';
			algFont4 = 'bold ' + fontSize2 + 'px Cambria Math';
		} else {
			algFont = 'italic ' + fontSize2 + 'px Georgia';
			algFont2 = fontSize2 + 'px Times New Roman';
			algFont3 = fontSize2 + 'px Arial';
			algFont4 = fontSize2 + 'px Cambria Math';
		}
		//console.log(fontSize2,algFont4);
		return;
	}
		
	function backColorMe(context, loc) {
		context.save();
		context.fillStyle = backColor;
		context.fillRect(loc.left,loc.top-2,loc.width,loc.height+4); // padding is 2 to top and bottom
		context.restore();
	}
	
	function drawSpacingBox(obj) {
		var l = obj.left || obj.l;
		var t = obj.top || obj.t;
		var w = obj.width || obj.w;
		var h = obj.height || obj.h;
		var f = obj.fontSize || obj.f;
		if (selected == true) {
			var selBackColor = invertColor('#FFC');
			if (backColor !== 'none') selBackColor = invertColor(backColor);
			context.fillStyle = selBackColor;
			context.fillRect(l-0.2*w,t-0.2*h,1.4*w,1.4*h);
			context.strokeStyle = invertColor(textColor);
		} else {
			context.strokeStyle = textColor;
		}
		context.lineWidth = fontSize / 30;
		context.lineCap = 'round';
		context.lineJoin = 'round';
		context.strokeRect(l,t,w,h);
		return {left:l+0.5*w,top:t,width:w,height:h,fontSize:f};
	}

	function splitTags(textStr) {					
		// find markup tags and split text
		var splitPoints = [0];
		for (var ch1 = 0; ch1 < textStr.length; ch1++) {
			if (textStr.slice(ch1).indexOf('<<') == 0 && textStr.slice(ch1).indexOf('<<<') !== 0) {
				for (var ch2 = ch1; ch2 < textStr.length; ch2++) {
					if (textStr.slice(ch2).indexOf('>>') == 0) {
						splitPoints.push(ch1,ch2+2);
						break;
					}
				}
			}
		}
		splitPoints.push(textStr.length);
		var splitText = [];
		for (var ch = 0; ch < splitPoints.length-1; ch++) {
			splitText.push(textStr.slice(splitPoints[ch],splitPoints[ch+1]))
		}
		return splitText;
	}
	
	function parseText(txt) {
		var values = {
			bold:null,
			italic:null,
			fontSize:null,
			fontName:null,
			color:null,
			backColor:null,
			selected:null,
			empty:true,
			chars:0
		}
		if (typeof txt == 'string' || typeof txt == 'number') {
			txt = String(txt);
			var splitText = splitTags(txt);
			//console.log(splitText);
			for (var i = 0; i < splitText.length; i++) {
				if (splitText[i].indexOf('<<') !== 0 && splitText[i] !== '') {
					values.empty = false;
					if (['frac','power','pow','subs','subscript','sin','cos','tan','ln','log','logBase','sin-1','cos-1','tan-1','abs','exp','root','sqrt','sigma1','sigma2','int1','int2','recurring','bar','hat','vectorArrow','colVector2d','colVector3d','mixedNum','lim'].indexOf(splitText[i]) == -1) values.chars += splitText[i].length;
				} else {
					if (splitText[i].indexOf('<<font:') == 0) {
						values.fontName = splitText[i].slice(7,-2);
					} else if (splitText[i].indexOf('<<fontSize:') == 0) {
						values.fontSize = Number(splitText[i].slice(11,-2))*sf;							
					} else if (splitText[i].indexOf('<<color:') == 0) {
						values.textColor = splitText[i].slice(8,-2);
					} else if (splitText[i].indexOf('<<backColor:') == 0) {
						values.backColor = splitText[i].slice(12,-2);
					} else if (splitText[i].indexOf('<<bold:') == 0) {
						if (splitText[i].indexOf('true') > -1) values.bold = true;
						if (splitText[i].indexOf('false') > -1) values.bold = false;
					} else if (splitText[i].indexOf('<<italic:') == 0) {
						if (splitText[i].indexOf('true') > -1) values.italic = true;
						if (splitText[i].indexOf('false') > -1) values.italic = false;
					} else if (splitText[i].indexOf('<<selected:') == 0) {
						if (splitText[i].indexOf('true') > -1) values.selected = true;
						if (splitText[i].indexOf('false') > -1) values.selected = false;
					} else if (splitText[i].indexOf('<<tab>>') == 0) {
						leftPoint = ceiling(leftPoint,20);
					}
				}
			}
		} else if (typeof txt == 'object') {
			if (txt.length > 1) values.empty = false;
			for (var j = 0; j < txt.length; j++) {
				var values2 = parseText(txt[j]);
				if (values2.bold !== null) values.bold = values2.bold;
				if (values2.italic !== null) values.italic = values2.italic;
				if (values2.fontName !== null) values.fontName = values2.fontName;
				if (values2.fontSize !== null) values.fontSize = values2.fontSize;
				if (values2.color !== null) values.color = values2.color;
				if (values2.backColor !== null) values.backColor = values2.backColor;
				if (values2.selected !== null) values.selected = values2.selected;
				if (values2.empty == false) values.empty = false;
				values.chars += values2.chars;				
			}
		}
		return values;
	}
	
	// this loop runs either once or twice - the first time to measure the text, the second to draw it if mode = 'draw'
	while (mode2 !== 'done') {
		if (mode2 == 'measure') {
			// starting values for measurements
			leftPoint = 0;
			height = fontSize;
		} else {
			// work out leftPoint based on width, height, horizPos, vertPos
			if (horizAlign == 'left') {
				leftPoint = horizPos;
			} else if (horizAlign == 'center') {
				leftPoint = horizPos - 0.5 * width;
			} else if (horizAlign == 'right') {
				leftPoint = horizPos - width;
			}
			var tightRect = [leftPoint,top,width,height]; // to return
			bold = startBold;
			italic = startItalic;
			fontName = startFont;
			fontSize = startFontSize;
			textColor = startColor;
			backColor = startBackColor;
			selected = startSelected;
			algText = startAlgText;
		}
		startLeftPoint = leftPoint;
		// work out vertCenter based on width, height, horizPos, vertPos
		if (vertAlign == 'top') {
			vertCenter = vertPos + 0.5 * height;
		} else if (vertAlign == 'middle') {
			vertCenter = vertPos;
		} else if (vertAlign == 'bottom') {
			vertCenter = vertPos - 0.5 * height;
		}
		top = vertCenter - 0.5 * fontSize;
		bottom = vertCenter + 0.5 * fontSize;
		
		buildFont();
			
		// for each element of mathsText
		for (var q = 0; q < textArray.length; q++) {
			if (logMathsTextLoc == true) {console.log('-------------')};
			if (logMathsTextLoc == true) {console.log('element:',textArray[q])};
			
				// -----------------------------------------------
				//
				//                  TEXT STRING              
				//
				// -----------------------------------------------
			
			// if it is a textString
			if (typeof textArray[q] == 'string') {
				// set up cursorLoc
				if (mode2 == 'draw' && typeof textLoc[q] == 'undefined') textLoc[q] = [];

				var splitText = splitTags(textArray[q]);
								
				for (var section = 0; section < splitText.length; section++) {
					if (logMathsTextLoc == true) {
						console.log('---stringLoop---');
						console.log('element:',splitText[section]);
					}
					if (splitText[section].indexOf('<<') == 0) {
						if (splitText[section].indexOf('<<font:') == 0) {
							fontName = splitText[section].slice(7,-2);
						} else if (splitText[section].indexOf('<<fontSize:') == 0) {
							fontSize = Number(splitText[section].slice(11,-2))*sf;							
						} else if (splitText[section].indexOf('<<color:') == 0) {
							textColor = splitText[section].slice(8,-2);
						} else if (splitText[section].indexOf('<<backColor:') == 0) {
							backColor = splitText[section].slice(12,-2);
						} else if (splitText[section].indexOf('<<bold:') == 0) {
							if (splitText[section].indexOf('true') > -1) bold = true;
							if (splitText[section].indexOf('false') > -1) bold = false;
						} else if (splitText[section].indexOf('<<italic:') == 0) {
							if (splitText[section].indexOf('true') > -1) italic = true;
							if (splitText[section].indexOf('false') > -1) italic = false;
						} else if (splitText[section].indexOf('<<selected:') == 0) {
							if (splitText[section].indexOf('true') > -1) selected = true;
							if (splitText[section].indexOf('false') > -1) selected = false;
						} else if (splitText[section].indexOf('<<tab>>') == 0) {
							var prevLeftPoint = leftPoint;
							leftPoint = ceiling(leftPoint,20);
						}
						if (logMathsTextLoc == true) {
							console.log('fontName:',fontName,'fontSize:',fontSize,'color:',textColor,'bold:',bold,'italic:',italic,'selected',selected);
						}
						if (['algebra', 'Algebra', 'alg', 'algText'].indexOf(fontName) > -1) {
							algText = true;
						} else {
							algText = false;
						}
						buildFont();
						if (mode2 == 'draw') {
							// push the cursor positions for each character in the markupTag to textLoc (cursorMap will determine if any of these are actual cursor positions.)
							for (var char = 0; char < splitText[section].length; char++) {
								var tag = true;
								if (char == 0 && splitText[section].indexOf('<<tab>>') == 0) tag = false;
								if (char == 0 && splitText[section].indexOf(br) == 0) tag = false;
								textLoc[q].push({left: leftPoint, top: vertCenter - 0.5 * fontSize, width: context.measureText(splitText[section][char]).width + 2 * padding, height: fontSize, fontSize: fontSize * 0.85, markupTag:tag});
							}
							//console.log(textLoc[q].length);
						}	
					} else {
						var textLeft = leftPoint;
						var textCenter = vertCenter;
						var textTop;
						var textWidth;
						var textHeight;
						var textFontSize = fontSize;

						if (logMathsTextLoc == true) {
							console.log('+++++++++++++++++++')
							console.log('mode:',mode2)
							console.log('string:',splitText[section]);
							console.log('textLoc-1:',textLoc[q]);
						}
						/*if (mode2 == 'draw' && splitText[section] !== '') {
							if (splitText[section].indexOf('(') > -1 || splitText[section].indexOf(')') > -1) {
								console.log('--string:',splitText[section]);
							} else {
								console.log('string:',splitText[section]);
							}
						}*/ 
						
						context.save();
						context.textAlign = 'left';
						context.textBaseline = 'middle';
						
						// if the first string element is '', (ie. starts with a fraction etc) insert textLoc for first cursor position
						buildArray(textLoc,q);
						if (textLoc[q].length == 0 && mode2 == 'draw' && splitText[section].length == 0) {
							if (typeof splitText[section+1] !== 'undefined' && splitText[section+1].indexOf('<<') !== 0) {
								textLoc[q] = [{left: leftPoint, top: vertCenter - fontSize * 0.5, width: fontSize * 0.5, height: fontSize, fontSize: fontSize}];
							}
						}
						
						if (logMathsTextLoc == true) {console.log('textLoc0:',textLoc[q])};
						
						for (r = 0; r < splitText[section].length; r++) {
							if (logMathsTextLoc == true) {console.log('character:',splitText[section][r])};
							var charCode = splitText[section].charCodeAt(r);
							var char = splitText[section].slice(r, r + 1);
							//console.log(char);
							if (!un(draw.calculator) && char === draw.calculator.ansChar) char = 'Ans';
							var charCenter = vertCenter;
							var padding = 0, leftPadding = 0, rightPadding = 0;
							//if letter & algText
							//console.log(algText,charCode);
							if ((((charCode >= 65) && (charCode <= 90)) || ((charCode >= 97) && (charCode <= 122))) && algText == true) {
								context.font = algFont;
							} else if ([8469,8474,8477,8484,177,8723,8745,8746,11034,8712,8733,8736,8756].indexOf(charCode) > -1) { // double-struck letters, etc
								buildFont();
								context.font = algFont4;
							} else if (charCode >= 0x0370 && charCode <= 0x03FF) { // greek letters - use Cambria Math
								buildFont();
								context.font = algFont4;
							} else if (char === '≤' || char === '≥') { // use Cambria Math
							buildFont();
								context.font = algFont4;
							} else if ((charCode >= 48) && (charCode <= 57) && algText == true) {
								context.font = font;
							} else if ((charCode >= 0x03B1) && (charCode <= 0x03C9) && algText == true) {
								//context.font = algFont3;
								context.font = algFont2;
							} else if (charCode >= 0x03C0) {
								context.font = algFont2;
							} else if (charCode == 247) { // division sign - dont use arial
								context.font = bold === true ? 'bold ' + fontSize + 'px Georgia' : fontSize + 'px Georgia';
							} else {
								context.font = font;
							}
							var charMeasure = context.measureText(char);
							
							//* TALL BRACKETS
							var tallBracket = false;
							var bracket = false;
							
							if (mode2 == 'draw') {
								if (charCode == 40) {
									bracket = true;
									var elemNum = q;
									var fracElemNum;
									var fracAfter = false;
									var bracketCount = 1;
									if (elemNum < textArray.length - 1) {
										for (elemNum = q + 1; elemNum < textArray.length; elemNum++) {
											if (typeof textArray[elemNum] == 'object' && textArray[elemNum][0] == 'frac') {
												fracAfter = true;
												fracElemNum = elemNum;
												break;
											}
										}
										if (fracAfter == true) {
											tallBracket = true;
											// search for corresponding close bracket for each elem from current to frac
											for (elemNum = q; elemNum < fracElemNum; elemNum++) {
												if (typeof textArray[elemNum] == 'string') {
													var startNum = 0;
													if (elemNum == q) {
														for (var sp = 0; sp < section; sp++) {
															startNum += splitText[sp].length;
														}
														startNum += r+1;
													}
													// for each char
													for (charNum = startNum; charNum < textArray[elemNum].length; charNum++) {
														if (textArray[elemNum][charNum] == '(') bracketCount++;	
														if (textArray[elemNum][charNum] == ')') bracketCount--;	
														if (bracketCount == 0) {
															tallBracket = false;
															break;
														}
													}
												}
											}
										}
									}
								}
				
								if (charCode == 41) {
									bracket = true;
									var elemNum = q;
									var fracElemNum;
									var fracBefore = false;
									//check if there is a fraction anywhere before the bracket
									if (elemNum > 0) {
										for (elemNum = q - 1; elemNum >= 0; elemNum--) {
											if(typeof textArray[elemNum] == 'object' && textArray[elemNum][0] == 'frac') {
												fracBefore = true;
												fracElemNum = elemNum;
												break;
											}
										}
									}
									if (fracBefore == true) {
										var bracketCount = 0;
										tallBracket = true;
										// search for corresponding close bracket
										// for each elem from current to frac
										for (elemNum = q; elemNum > fracElemNum; elemNum--) {
											if (typeof textArray[elemNum] == 'string') {
												var startNum = textArray[elemNum].length - 1;
												if (elemNum == q) {startNum = r}
												// for each char
												for (charNum = startNum; charNum >= 0; charNum--) {
													if (textArray[elemNum][charNum] == ')') {bracketCount++};	
													if (textArray[elemNum][charNum] == '(') {bracketCount--};	
													if (bracketCount == 0) {tallBracket = false}
												}
											}
										}
										if (tallBracket == true && fracElemNum > 0) {
											var openBracket = false;
											// search for open bracket before fraction (but after <<br>>)
											var bracketCount = 1;
											var brk = false;
											for (elemNum = fracElemNum - 1; elemNum >= 0; elemNum--) {
												if (typeof textArray[elemNum] == 'string' && bracketCount > 0 && brk == false) {
													for (charNum = textArray[elemNum].length - 1; charNum >= 0; charNum--) {
														if (textArray[elemNum].substring(charNum,charNum+6) == '<<br>>') {
															brk = true;
															break;
														};
														if (textArray[elemNum][charNum] == ')') {bracketCount++};	
														if (textArray[elemNum][charNum] == '(') {bracketCount--};
														if (bracketCount == 0) {
															openBracket = true;
															break;
														}
													}
												}
											}
											if (openBracket == false) {
												tallBracket = false;
											}
										}
									}
								}
								/*if (tallBracket == true && typeof context.transform === 'function') {
									var sf2 = 1.6;
									context.save();
									context.transform(1,0,0,sf2,0,-vertCenter*(sf2-1));
								}*/
							}

							//*/
							if (splitText[section][r] == '-') {
								charCenter -= fontSize / 20;
							}
							if (typeof algPadding == 'number' && algPadding !== 0) {
								if (/[=<>\u2264\u2265]/g.test(splitText[section][r]) == true) {
									if (r === 0 || /[=<>\u2264\u2265]/g.test(splitText[section][r-1]) !== true) {
										leftPadding = fontSize*0.1*algPadding;
									}
									if (r === splitText[section].length-1 || /[=<>\u2264\u2265]/g.test(splitText[section][r+1]) !== true) {
										rightPadding = fontSize*0.1*algPadding;
									}
								} else if (/[+/*]/g.test(splitText[section][r]) == true || charCode == 215 || charCode == 247) {
									padding = fontSize*0.1*algPadding;
								}
								if (splitText[section][r] === '-' || splitText[section][r] === String.fromCharCode('0x00B1') || splitText[section][r] === String.fromCharCode('0x2213')) {
									//if after /[A-Za-z0-9)]/g or after frac or power
									if (!(q == 0 && r == 0) && ((r == 0 && textArray[q - 1] && typeof textArray[q - 1] == 'object') || (/[A-Za-z0-9)]/g.test(splitText[section][r - 1]) == true))) {
										padding = fontSize*0.1*algPadding;
									} else if (!un(splitText[section][r+1]) && ['+','-'].indexOf(splitText[section][r+1]) > -1) {
										padding = fontSize*0.1*algPadding;
									} else if (un(splitText[section][r+1]) && typeof textArray[q+1] === 'object' && textArray[q+1][0] === 'frac') {
										rightPadding = fontSize*0.1;
									}
								}
							} else if (letterSpacingMode !== 'none') {
								if (/[=<>\u2264\u2265]/g.test(splitText[section][r]) == true) {
									if (r === 0 || /[=<>\u2264\u2265]/g.test(splitText[section][r-1]) !== true) {
										leftPadding = fontSize / 8;
									}
									if (r === splitText[section].length-1 || /[=<>\u2264\u2265]/g.test(splitText[section][r+1]) !== true) {
										rightPadding = fontSize / 8;
									}
								} else if (/[+/*]/g.test(splitText[section][r]) == true || charCode == 215 || charCode == 247) {
									padding = fontSize / 8;
								}
								if (splitText[section][r] === '-' || splitText[section][r] === String.fromCharCode('0x00B1') || splitText[section][r] === String.fromCharCode('0x2213')) {
									//if after /[A-Za-z0-9)]/g or after frac or power
									if (!(q == 0 && r == 0) && ((r == 0 && textArray[q - 1] && typeof textArray[q - 1] == 'object') || (/[A-Za-z0-9)]/g.test(splitText[section][r - 1]) == true))) {
										padding = fontSize / 9;
									} else if (un(splitText[section][r+1]) && typeof textArray[q+1] === 'object' && textArray[q+1][0] === 'frac') {
										rightPadding = fontSize*0.1;
									}
								}
							}
							if (padding > 0) {
								leftPadding = padding;
								rightPadding = padding;
							}
							
							if (mode2 == 'draw') {
								var t = vertCenter - 0.5 * fontSize;
								var h = fontSize;
								if (tallBracket == true) {
									//t = vertCenter - 0.35 * fontSize;
								} else if ('|()[]{}'.indexOf(char) > -1) {
									t = vertCenter - 0.35 * fontSize;
								} else if (char == String.fromCharCode(0x222B)) {
									t = vertCenter - 0.37 * fontSize;
								}
								
								// push the cursor position to the LEFT of the character into textLoc
								textLoc[q].push({left: leftPoint, top:t, width: charMeasure.width + leftPadding + rightPadding, height:h, fontSize: fontSize * 0.85, char:char});
								
								//if (tallBracket === true) console.log(textLoc[q].last());
								
								if (backColor !== 'none') backColorMe(context,textLoc[q][textLoc[q].length-1]);
								if (selected == true) {
									var loc = textLoc[q][textLoc[q].length-1];
									if (!un(backgroundColor) && backgroundColor !== 'none') {
										var selBackColor = invertColor(backgroundColor);
									} else if (backColor == 'none') {
										var selBackColor = invertColor('#FFC');
									} else {
										var selBackColor = invertColor(backColor);
									}
									context.fillStyle = selBackColor;
									context.fillRect(loc.left,loc.top-2,loc.width,loc.height+4);
									//console.log(selBackColor,loc);
									var selTextColor = invertColor(textColor);
									context.fillStyle = selTextColor;
								} else {
									context.fillStyle = textColor;										
								}
								//console.log(char,context.font);
								if (tallBracket === true) {
									var tall = {
										x0: leftPoint+leftPadding+charMeasure.width*0.05,
										y0: vertCenter + 0.08 * fontSize,
										w: charMeasure.width*0.9,
										h: fontSize * 1.5,
										type: splitText[section][r]
									}
									context.beginPath();
									tall.curveFactor = 0.6;
									if (tall.type === '(') {
										context.moveTo(tall.x0+0.8*tall.w,tall.y0-tall.h/2);
										context.quadraticCurveTo(tall.x0-tall.curveFactor*tall.w,tall.y0,tall.x0+0.8*tall.w,tall.y0+tall.h/2);
										context.lineTo(tall.x0+tall.w,tall.y0+tall.h/2);
										context.quadraticCurveTo(tall.x0-tall.curveFactor*0.5*tall.w,tall.y0,tall.x0+tall.w,tall.y0-tall.h/2);
										context.lineTo(tall.x0+0.8*tall.w,tall.y0-tall.h/2);
									} else if (tall.type === ')') {
										context.moveTo(tall.x0+0.2*tall.w,tall.y0-tall.h/2);
										context.quadraticCurveTo(tall.x0+tall.w+tall.curveFactor*tall.w,tall.y0,tall.x0+0.2*tall.w,tall.y0+tall.h/2);
										context.lineTo(tall.x0,tall.y0+tall.h/2);
										context.quadraticCurveTo(tall.x0+tall.w+tall.curveFactor*0.5*tall.w,tall.y0,tall.x0,tall.y0-tall.h/2);
										context.lineTo(tall.x0+0.2*tall.w,tall.y0-tall.h/2);
									}									
									context.fill();
									
								} else if (splitText[section][r] !== String.fromCharCode(0x21F4) && splitText[section][r] !== br) {
									context.fillText(char, leftPoint + leftPadding, charCenter + fontSize / 20);
								}
							}
							if (logMathsTextLoc == true) {console.log('textLoc:',textLoc[q])};
							if (splitText[section][r] == String.fromCharCode(0x21F4)) { // if character is a tab
								var w = ceiling(leftPoint-startLeftPoint,20*sf) - (leftPoint - startLeftPoint);
								if (w < 0.01) w = 20*sf;
								leftPoint += w;
							} else if (splitText[section][r] == br) {
								
							} else {
								leftPoint += charMeasure.width + leftPadding + rightPadding;
							}
							//if (tallBracket == true) context.restore();
						}
						
						context.restore();
						top = Math.min(top, vertCenter - 0.5 * textFontSize);
						bottom = Math.max(bottom, vertCenter + 0.5 * textFontSize);
					}
				}
				
				if (logMathsTextLoc == true) {console.log('textLocEnd1:',textLoc[q])};				
				
				// if the next element is not a string, insert cursor position to the RIGHT of the last character at end of textString
				if (mode2 == 'draw' && ((textArray[q + 1] && typeof textArray[q + 1] !== 'string') || !textArray[q + 1]) && (typeof textArray[q] !== 'string' || textArray[q].slice(-1) !== br)) {
					buildArray(textLoc,q);
					textLoc[q].push({left: leftPoint, top: vertCenter - 0.5 * fontSize, width: 0, height: fontSize, fontSize: fontSize * 0.85});
				}

				// if no cursorLocs have been placed for this textString (if it is '' or solely markupTags), push a textLoc in
				if (mode2 == 'draw' && textLoc[q].length == 0) {
					textLoc[q] = [{left: leftPoint, top: vertCenter - fontSize * 0.5, width: fontSize * 0.5, height: fontSize, fontSize: fontSize}];
				}
				
				if (logMathsTextLoc == true) {console.log('textLocEnd2:',textLoc[q])};
				
			} else if (textArray[q][0] == 'frac') {

				
				// -----------------------------------------------
				//
				//                  FRACTIONS              
				//
				// -----------------------------------------------
			
				if (typeof textArray[q][3] !== 'undefined') {
					if (typeof textArray[q][3] == 'number') {
						var fracFontSizeMultiplier = textArray[q][3];
					} else if (textArray[q][3] == false) {
						var fracFontSizeMultiplier = 1;
					}
				} else {
					var fracFontSizeMultiplier = fracScale;
				}
				height = Math.max(height, 2 * fontSize * fracFontSizeMultiplier);
				var fracFont = (fontSize * fracFontSizeMultiplier) + 'px Arial';
				var fracAlgFont = 'italic ' + (fontSize * fracFontSizeMultiplier) + 'px Georgia'; 
				context.font = fracFont;
				var fracPadding = fontSize / 8;
				var numLeft;
				var numCenter;
				var numTop;
				var numBottom;
				var numWidth = 0;
				var numHeight = 0;
				var denomLeft;
				var denomCenter;
				var denomTop;
				var denomBottom;
				var denomWidth = 0;
				var denomHeight = 0;
				var numerator = textArray[q][1];
				if (typeof numerator == 'string') numerator = [numerator];
				if (typeof numerator == 'number') numerator = [String(numerator)];
				var denominator = textArray[q][2];
				if (typeof denominator == 'string') denominator = [denominator];
				if (typeof denominator == 'number') denominator = [String(denominator)];				
				
				var parse1 = parseText(numerator);
				var parse2 = parseText(denominator);
				
				//measure numerator width by calling function recursively
				if (parse1.empty == true) {
					numWidth += fontSize * fracFontSizeMultiplier * (6/7);
					numHeight += fontSize * fracFontSizeMultiplier;
				} else {
					if (typeof numerator == 'string') {
						numerator = [numerator];
					}
					var numMeasure = drawMathsText(context, numerator, fontSize * fracFontSizeMultiplier, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					numWidth = numMeasure[0]; 
					numHeight = numMeasure[1];
				}
				
				//measure denominator width by calling function recursively
				if (parse2.empty == true) {
					denomWidth += fontSize * fracFontSizeMultiplier * (6/7);
					denomHeight += fontSize * fracFontSizeMultiplier;
				} else {
					if (typeof denominator == 'string') {
						denominator = [denominator];
					}
					var denomMeasure = drawMathsText(context, denominator, fontSize * fracFontSizeMultiplier, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none' , bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					denomWidth = denomMeasure[0];
					denomHeight = denomMeasure[1];
				}
				
				var fractionWidth = Math.max(numWidth, denomWidth);
				
				numLeft = leftPoint + fracPadding + fractionWidth * 0.5 - numWidth * 0.5;
				numCenter = vertCenter - 0.1 * fontSize - 0.4 * numHeight;
				numTop = numCenter - 0.5 * numHeight;
				
				denomLeft = leftPoint + fracPadding + fractionWidth * 0.5 - denomWidth * 0.5;
				denomCenter = vertCenter + 0.2 * fontSize + 0.5 * denomHeight;
				denomTop = denomCenter - 0.5 * denomHeight;
				
				var elementWidth = fractionWidth + 2 * fracPadding;
				var elementTop = Math.min(top, numTop);
				var elementBottom = Math.max(bottom, denomTop + denomHeight);				
				
				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];
					textLoc[q][2] = [];
					textLoc[q][2][0] = [];
					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});					
					context.save();
					context.font = fracFont;
					context.fillStyle = textColor;
			
					//textLoc[q][1][0][0] = drawSpacingBox({left: indexLeft, top: indexTop, width: indexWidth, height: indexHeight, fontSize: 0.4 * fontSize});

			
					// draw numerator
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left:numLeft,top:numTop,width:0.84*fracFontSizeMultiplier*fontSize,height:0.84*fracFontSizeMultiplier*fontSize,fontSize:0.7*fontSize});
						if (parse1.selected !== null) selected = parse1.selected;
					} else {
						var drawObj = drawMathsText(context, numerator, fontSize * fracFontSizeMultiplier, numLeft, numCenter, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / fracFontSizeMultiplier;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;
					}

					if (selected == false) {
						context.strokeStyle = textColor;
					} else {
						var selBackColor = invertColor('#FFC');
						if (backColor !== 'none') selBackColor = invertColor(backColor);
						context.fillColor = selBackColor;
						context.fillRect(leftPoint,vertCenter-0.1*fontSize,fractionWidth+2*fracPadding,0.3*fontSize);						
						context.strokeStyle = invertColor(textColor);						
					}
					if (bold == false) {
						context.lineWidth = fontSize / 20;
					} else {
						context.lineWidth = fontSize / 12;						
					}
					context.lineCap = "round";
					context.lineJoin = "round";
					context.beginPath();
					context.moveTo(leftPoint + 0.5 * fracPadding, vertCenter + fontSize / 12);
					context.lineTo(leftPoint + fractionWidth + 1.5 * fracPadding, vertCenter + fontSize / 12);
					context.closePath();
					context.stroke();
					
					//draw denominator
					if (parse2.empty == true) {
						textLoc[q][2][0][0] = drawSpacingBox({left:denomLeft,top:denomTop+height*0.05,width:0.84*fracFontSizeMultiplier*fontSize,height:0.84*fracFontSizeMultiplier*fontSize,fontSize:0.7*fontSize});
						if (parse2.selected !== null) selected = parse2.selected;
					} else {
						var drawObj = drawMathsText(context, denominator, fontSize * fracFontSizeMultiplier, denomLeft, denomCenter, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][2] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / fracFontSizeMultiplier;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}
					context.restore();
				}
				
				
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
			
			} else if (textArray[q][0] == 'root') {
				
				// -----------------------------------------------
				//
				//                    ROOTs              
				//
				// -----------------------------------------------
									
				if (textArray[q].length == 2) {
					var index = ["2"];
					var innerText = textArray[q][1];
				} else {
					var index = textArray[q][1];
					var innerText = textArray[q][2];
				}
				if (typeof innerText == 'string') innerText = [innerText];
				if (typeof innerText == 'number') innerText = [String(innerText)];
				if (typeof index == 'string') index = [index];
				if (typeof index == 'number') index = [String(index)];
				var indexFontSize = 0.5 * fontSize;
				
				var parse1 = parseText(innerText);
				if (parse1.empty == true) {
					var innerWidth = fontSize * 0.8;
					var innerHeight = fontSize;
				} else {
					var roo = drawMathsText(context, innerText, fontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					var innerWidth = roo[0];
					var innerHeight = roo[1];
				}
				
				var parse2 = parseText(index);
				if (parse2.empty == true) {
					indexWidth = fontSize * 0.32;
					indexHeight = fontSize * 0.4;
				} else {
					indexMeasure = drawMathsText(context, index, indexFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);	
					indexWidth = indexMeasure[0];
					indexHeight = indexMeasure[1];
				}

				var innerTextPadding = 0.11*fontSize;
				var symbolWidth = 0.6*fontSize;
				if (indexWidth > symbolWidth*0.8) symbolWidth = indexWidth/0.8;
				var elementPadding = 0.08*fontSize;
				
				var elementWidth = symbolWidth+innerWidth+2*innerTextPadding+2*elementPadding;
				var elementHeight = innerHeight + 2*innerTextPadding + 2*elementPadding;
				var elementTop = vertCenter-elementHeight/2;
				var elementBottom = vertCenter+elementHeight/2;
				
				var innerLeft = leftPoint+elementPadding+symbolWidth+innerTextPadding;
				var innerTop = vertCenter-innerHeight/2;
				
				var indexLeft = leftPoint+elementPadding+0.3*symbolWidth-0.5*indexWidth;
				var indexTop = vertCenter-innerHeight*0.5-elementPadding*0.5;
				
				if (mode2 == 'draw') {
					context.save();
					
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];
					textLoc[q][2] = [];
					textLoc[q][2][0] = [];

					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});
					if (selected === false) {
						var color = textColor;
					} else {
						var selBackColor = invertColor('#FFC');
						if (backColor !== 'none') selBackColor = invertColor(backColor);
						context.fillColor = selBackColor;
						context.fillRect(leftPoint,elementTop,elementWidth,elementHeight);
						var color = invertColor(textColor);						
					}
					
					if (parse2.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: indexLeft, top: indexTop, width: indexWidth, height: indexHeight, fontSize: 0.4 * fontSize});
						if (parse2.selected !== null) selected = parse2.selected;						
					} else {
						var drawObj = drawMathsText(context, index, indexFontSize, indexLeft, indexTop + 0.5 * indexFontSize, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.5;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;
					}

					if (parse1.empty == true) {
						textLoc[q][2][0][0] = drawSpacingBox({left: innerLeft+0.05*innerWidth, top: innerTop+0.05*innerHeight, width: 0.9*innerWidth, height: 0.9*innerHeight, fontSize: fontSize});
						if (parse1.selected !== null) selected = parse1.selected;						
					} else {
						var drawObj = drawMathsText(context, innerText, fontSize, innerLeft, innerTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][2] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;										
					}
										
					var lineWidth = bold === true ? fontSize*0.08 : fontSize*0.05;
					drawRootSign({ctx:context,rect:[leftPoint+elementPadding,elementTop+elementPadding,elementWidth-2*+elementPadding,elementHeight-2*+elementPadding],symbolWidth:symbolWidth,fontSize:fontSize,color:color,lineWidth:lineWidth});

					context.restore();
				}
				
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;

			} else if (textArray[q][0] == 'sqrt') {
				
				// -----------------------------------------------
				//
				//                    SQRTs              
				//
				// -----------------------------------------------
									
				var innerText = textArray[q][1];
				if (typeof innerText == 'string') innerText = [innerText];
				if (typeof innerText == 'number') innerText = [String(innerText)];					

				var parse1 = parseText(innerText);
				if (parse1.empty == true) {
					var innerWidth = fontSize * 0.8;
					var innerHeight = fontSize;
				} else {
					var roo = drawMathsText(context, innerText, fontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					var innerWidth = roo[0];
					var innerHeight = roo[1];
				}

				var innerTextPadding = 0.11*fontSize;
				var symbolWidth = 0.6*fontSize;
				var elementPadding = 0.08*fontSize;
				
				var elementWidth = symbolWidth+innerWidth+2*innerTextPadding+2*elementPadding;
				var elementHeight = innerHeight + 2*innerTextPadding + 2*elementPadding;
				var elementTop = vertCenter-elementHeight/2;
				var elementBottom = vertCenter+elementHeight/2;
				
				var innerLeft = leftPoint+elementPadding+symbolWidth+innerTextPadding;
				var innerTop = vertCenter-innerHeight/2;
				
				if (mode2 == 'draw') {
					context.save();
					
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];

					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});
					if (selected === false) {
						var color = textColor;
					} else {
						var selBackColor = invertColor('#FFC');
						if (backColor !== 'none') selBackColor = invertColor(backColor);
						context.fillColor = selBackColor;
						context.fillRect(leftPoint,elementTop,elementWidth,elementHeight);
						var color = invertColor(textColor);						
					}

					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: innerLeft+0.05*innerWidth, top: innerTop+0.05*innerHeight, width: 0.9*innerWidth, height: 0.9*innerHeight, fontSize: fontSize});
						if (parse1.selected !== null) selected = parse1.selected;						
					} else {
						var drawObj = drawMathsText(context, innerText, fontSize, innerLeft, innerTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;										
					}
										
					var lineWidth = bold === true ? fontSize*0.08 : fontSize*0.05;
					drawRootSign({ctx:context,rect:[leftPoint+elementPadding,elementTop+elementPadding,elementWidth-2*+elementPadding,elementHeight-2*+elementPadding],symbolWidth:symbolWidth,fontSize:fontSize,color:color,lineWidth:lineWidth});

					context.restore();
				}
				
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
				
			} else if (textArray[q][0] == 'power' || textArray[q][0] == 'pow') {

				// -----------------------------------------------
				//
				//                  POWERS              
				//
				// -----------------------------------------------
							
				var power;
				if (textArray[q].length == 2) {
					power = textArray[q][1];
				} else {
					power = textArray[q][2];
				}
				if (typeof power == 'string') power = [power];
				if (typeof power == 'number') power = [String(power)];					
				
				var powerFontSize = 0.6 * fontSize;
				var powerFont = powerFontSize + 'px Arial';
				var powerAlgFont = 'italic ' + powerFontSize + 'px Georgia';
				var powerWidth = 0;
				var powerHeight = 0;
				var powerLeft;
				var powerCenter;
				var powerTop;
				var powerLeftPadding = 0;
				var powerRightPadding = fontSize / 15;
				var parse1 = parseText(power);
				
				//if power is after a letter in algText mode, increase powerLeftPadding
				if (algText == true && typeof textArray[q - 1] == 'string' && /[a-zA-Z]$/g.test(textArray[q - 1]) == true) {
					powerLeftPadding += fontSize / 12;
				}
				if (parse1.empty == true) {
					powerWidth = 0.75 * powerFontSize;	
					powerHeight = 0.8 * powerFontSize;
				} else {
					if (typeof power == 'string') {
						power = [power];	
					}
					// measure width of power
					var powe = drawMathsText(context, power, powerFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					powerWidth = powe[0];
					powerHeight = powe[1];
				}
				powerTop = vertCenter + 0.11 * fontSize - powerFontSize - 0.1 * powerHeight;
				
				// if power contains a fraction, make to appear higher
				var powerContainsFraction = checkForFraction(power);
				function checkForFraction(textArray) {
					for (var i = 0; i < textArray.length; i++) {
						if (typeof textArray[i] == 'object') {
							if (textArray[i].length > 1 && textArray[i][0] == 'frac') return true;
							if (checkForFraction(textArray[i]) == true) return true;
						}
					}
					return false;
				}
				
				if (powerContainsFraction == true) {
					powerTop -= 0.3 * fontSize;
				} else if ((textArray[q - 1] && textArray[q - 1][0] == 'frac') || (textArray[q - 2] && textArray[q - 2][0] == 'frac' && typeof textArray[q - 1] == 'string' && textArray[q - 1] == '')) {
					// if power is after a fraction, make it appear higher			
					powerTop -= 0.25 * fontSize;
				} else if (typeof textArray[q - 1] == 'string' && /\)$/g.test(textArray[q - 1]) == true) {
				//if power is after a close bracket - check to see if it should be tall
					var elemNum = q - 1;
					var fracElemNum;
					var fracBefore = false;
					//check if there is a fraction anywhere after the bracket
					if (elemNum > 0) {
						for (elemNum = q - 2; elemNum >= 0; elemNum--) {
							if(typeof textArray[elemNum] == 'object' && textArray[elemNum][0] == 'frac') {
								fracBefore = true;
								fracElemNum = elemNum;
								break;
							}
						}
					}
					if (fracBefore == true) {
						var bracketCount = 0;
						var tallBracket = true;
						// search for corresponding close bracket
						// for each elem from current to frac
						for (elemNum = q - 1; elemNum > fracElemNum; elemNum--) {
							if (typeof textArray[elemNum] == 'string') {
								// for each char
								for (charNum = textArray[elemNum].length - 1; charNum >= 0; charNum--) {
									if (textArray[elemNum][charNum] == ')') {bracketCount++};	
									if (textArray[elemNum][charNum] == '(') {bracketCount--};	
									if (bracketCount == 0) {tallBracket = false}
								}
							}
						}
						if (tallBracket == true) {powerTop -= 0.25 * fontSize};
					}
				}
				powerCenter = powerTop + 0.45 * powerHeight;
				powerLeft = leftPoint + powerLeftPadding;
												
				var elementWidth = powerWidth+powerLeftPadding+powerRightPadding;
				var elementTop = Math.min(top,powerTop);
				var elementBottom = Math.max(bottom,powerTop+powerHeight);
				
				if (mode2 == 'draw') {
					textLoc[q] = [];
					if (textArray[q].length == 2) {
						textLoc[q][1] = [];
						textLoc[q][1][0] = [];
					} else {
						textLoc[q][2] = [];
						textLoc[q][2][0] = [];
					}					
					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});		
					
					// draw power
					context.save();
					context.font = font;
					context.textBaseline = 'bottom';
					if (parse1.empty == true) {
						if (textArray[q].length == 2) {
							textLoc[q][1][0][0] = drawSpacingBox({left: powerLeft, top: powerTop, width: powerWidth, height: powerHeight, fontSize: powerFontSize});
						} else {
							textLoc[q][2][0][0] = drawSpacingBox({left: powerLeft, top: powerTop, width: powerWidth, height: powerHeight, fontSize: powerFontSize});
						}
						if (parse1.selected !== null) selected = parse1.selected;						
					} else {
						if (typeof power == 'string') power = [power];
						var drawObj = drawMathsText(context, power, powerFontSize, powerLeft, powerCenter, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						if (textArray[q].length == 2) {
							textLoc[q][1] = drawObj.textLoc;
						} else {
							textLoc[q][2] = drawObj.textLoc;
						}
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.6;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;											
					}
					context.restore();
				}
				
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
				
			} else if (textArray[q][0] == 'subs' || textArray[q][0] == 'sub' || textArray[q][0] == 'subscript') {

				// -----------------------------------------------
				//
				//                 SUBSCRIPTS              
				//
				// -----------------------------------------------
							
				var subs;
				if (textArray[q].length == 2) {
					subs = textArray[q][1];
				} else {
					subs = textArray[q][2];
				}
				if (typeof subs == 'string') subs = [subs];
				if (typeof subs == 'number') subs = [String(subs)];				
								
				var subsFontSize = 0.6 * fontSize;
				var subsFont = subsFontSize + 'px Arial';
				var subsAlgFont = 'italic ' + subsFontSize + 'px Georgia';
				var subsWidth = 0;
				var subsHeight = 0;
				var subsLeft;
				var subsCenter;
				var subsTop;
				var subsLeftPadding = 0;
				var subsRightPadding = fontSize / 15;
				var parse1 = parseText(subs);				
				
				//if subs is after a letter in algText mode, increase subsLeftPadding
				if (algText == true && typeof textArray[q - 1] == 'string' && /[a-zA-Z]$/g.test(textArray[q - 1]) == true) {
					subsLeftPadding += fontSize / 12;
				}
				if (parse1.empty == true) {
					subsWidth = 0.75 * subsFontSize;	
					subsHeight = 0.8 * subsFontSize;
				} else {
					if (typeof subs == 'string') {
						subs = [subs];	
					}
					// measure width of subs
					var powe = drawMathsText(context, subs, subsFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					subsWidth = powe[0];
					subsHeight = powe[1];
				}
				subsTop = vertCenter + 0.11 * fontSize - 0.1 * subsHeight;
				subsCenter = subsTop + 0.45 * subsHeight;
				subsLeft = leftPoint + subsLeftPadding;
				
				var elementWidth = subsWidth+subsLeftPadding+subsRightPadding;
				var elementTop = Math.min(top,subsTop);
				var elementBottom = Math.max(bottom,subsTop+subsHeight);
				
				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][2] = [];
					textLoc[q][2][0] = [];
					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});		
					
					// draw subs
					context.save();
					context.font = font;
					context.textBaseline = 'bottom';
					if (parse1.empty == true) {
						textLoc[q][2][0][0] = drawSpacingBox({left: subsLeft, top: subsTop, width: subsWidth, height: subsHeight, fontSize: subsFontSize});
						if (parse1.selected !== null) selected = parse1.selected;												
					} else {
						if (typeof subs == 'string') subs = [subs];
						var drawObj = drawMathsText(context, subs, subsFontSize, subsLeft, subsCenter, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][2] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.6;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}
					context.restore();
				}
				
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
				
			} else if (textArray[q][0] == 'sin' || textArray[q][0] == 'cos' || textArray[q][0] == 'tan' || textArray[q][0] == 'ln' ||  textArray[q][0] == 'log') {
				
				// -----------------------------------------------
				//
				//      		sin, cos, tan, ln, log             
				//
				// -----------------------------------------------
	
				context.save();
				var innerText = textArray[q][1];
				if (typeof innerText == 'string') innerText = [innerText];
				if (typeof innerText == 'number') innerText = [String(innerText)];					
				var elemPadding = 0.04 * fontSize;

				var elemWidth;
				var elemTop;
				var innerTextFontSize = fontSize;
				var innerTextLeft;
				var innerTextCenter;
				var innerTextTop;		
				var innerTextWidth = 0;
				var innerTextHeight = 0;
				var bracketFontSize;
				var bracketWidth;

				var parse1 = parseText(innerText);

				// measure width of sin, cos, tan, ln, log
				var ele = drawMathsText(context, textArray[q][0], fontSize, 0, 0, false, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				elemWidth = ele[0];
				elemHeight = ele[1];
				elemTop = vertCenter - 0.5 * elemHeight;					

				// measure width of innerText
				if (typeof innerText == 'string') {innerText = [innerText]}
				if (parse1.empty == true) {
					innerTextWidth = fontSize*0.6;
					innerTextHeight = fontSize;
					innerTextTop = top;
				} else {
					var inn = drawMathsText(context, innerText, innerTextFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected);
					innerTextWidth = inn[0];
					innerTextHeight = inn[1];
				}
				innerTextTop = vertCenter - 0.5 * innerTextHeight;
				bracketFontSize = innerTextHeight;

				var bra = drawMathsText(context, '(', bracketFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				bracketWidth = bra[0];
				
				innerTextLeft = leftPoint + elemWidth + bracketWidth + 2* elemPadding;

				var elementWidth = elemWidth+innerTextWidth+2*bracketWidth+4*elemPadding;
				var elementTop = Math.min(top,innerTextTop);
				var elementBottom = Math.max(bottom,vertCenter+0.5*innerTextHeight);

				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];

					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});

					// draw innerText
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: innerTextLeft, top:vertCenter-0.32*fontSize, width:0.6*fontSize, height:0.8*fontSize, fontSize:0.8*fontSize});
						if (parse1.selected !== null) selected = parse1.selected;					
					} else {
						var drawObj = drawMathsText(context, innerText, innerTextFontSize, innerTextLeft, innerTextTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}

					// draw elem (ie. sin, cos, tan, ln or log)
					drawMathsText(context, textArray[q][0], fontSize, leftPoint, elemTop, false, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);						
					// draw open bracket
					drawMathsText(context, '(', bracketFontSize, leftPoint + elemWidth + elemPadding, vertCenter - 0.05 * fontSize, false, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					
					// draw close bracket
					drawMathsText(context, ')', bracketFontSize, innerTextLeft + innerTextWidth + elemPadding, vertCenter - 0.05 * fontSize, false, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);						
				}
									
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
				
			} else if (textArray[q][0] == 'sin-1' || textArray[q][0] == 'cos-1' || textArray[q][0] == 'tan-1') {
				// -----------------------------------------------
				//
				//               sin-1, cos-1, tan-1
				//
				// -----------------------------------------------
				
				context.save();
				var innerText = textArray[q][1];
				if (typeof innerText == 'string') innerText = [innerText];
				if (typeof innerText == 'number') innerText = [String(innerText)];					
				var elemPadding = 0.08 * fontSize;

				var elemWidth;
				var elemTop;
				var innerTextFontSize = fontSize;
				var innerTextLeft;
				var innerTextCenter;
				var innerTextTop;		
				var innerTextWidth = 0;
				var innerTextHeight = 0;
				var bracketFontSize;
				var bracketWidth;
				
				var parse1 = parseText(innerText);				

				// measure width of sin, cos, tan, ln or log
				var ele1 = drawMathsText(context, textArray[q][0].slice(0,3), fontSize, 0, 0, false, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				var ele2 = drawMathsText(context, '-1', fontSize * (8/11), 0, 0, false, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				elemWidth = ele1[0] + ele2[0];
				elemHeight = ele1[1] + 0.5 * ele2[1];
				elemTop = vertCenter - 0.5 * elemHeight;					

				// measure width of innerText
				if (typeof innerText == 'string') {innerText = [innerText]}
				if (parse1.empty == true) {
					innerTextWidth = fontSize * 0.6;
					innerTextHeight = fontSize;
					innerTextTop = top;
				} else {
					var inn = drawMathsText(context, innerText, innerTextFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					innerTextWidth = inn[0];
					innerTextHeight = inn[1];
				}
				innerTextTop = vertCenter - 0.5 * innerTextHeight;
				bracketFontSize = innerTextHeight;

				var bra = drawMathsText(context, '(', bracketFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				bracketWidth = bra[0];
				innerTextLeft = leftPoint + elemWidth + bracketWidth + 2 * elemPadding;					

				var elementWidth = elemWidth+innerTextWidth+2*bracketWidth+4*elemPadding;
				var elementTop = Math.min(top,innerTextTop);
				var elementBottom = Math.max(bottom,vertCenter+0.5*innerTextHeight);
				
				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];

					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});

					// draw innerText
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: innerTextLeft, top:vertCenter-0.32*fontSize, width:0.6*fontSize, height:0.8*fontSize, fontSize:0.8*fontSize});
						if (parse1.selected !== null) selected = parse1.selected;												
					} else {
						var drawObj = drawMathsText(context, innerText, innerTextFontSize, innerTextLeft, innerTextTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}

					// draw elem (ie. sin, cos, tan)
					drawMathsText(context, textArray[q][0].slice(0,3), fontSize, leftPoint, vertCenter-0.5*ele1[1], false, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					drawMathsText(context, '-1', fontSize * (8/11), leftPoint+ele1[0], vertCenter-0.3*ele1[1], false, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					
					// draw open bracket
					drawMathsText(context, '(', bracketFontSize, leftPoint + elemWidth + elemPadding, vertCenter - 0.05 * fontSize, false, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					
					// draw close bracket
					drawMathsText(context, ')', bracketFontSize, innerTextLeft + innerTextWidth + elemPadding, vertCenter - 0.05 * fontSize, false, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);	
				}
									
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
				
			} else if (textArray[q][0] == 'logBase') {

				// -----------------------------------------------
				//
				//                   logBase          
				//
				// -----------------------------------------------

				context.save();
				base = textArray[q][1];
				if (typeof base == 'string') base = [base];
				if (typeof base == 'number') base = [String(base)];					
				innerText = textArray[q][2];
				if (typeof innerText == 'string') innerText = [innerText];
				if (typeof innerText == 'number') innerText = [String(innerText)];					
									
				var elemPadding = 0.04 * fontSize;

				var baseFontSize = 0.6 * fontSize;
				var baseLeft;
				var baseTop;
				var baseCenter;
				var baseWidth = 0;
				var baseHeight = 0;

				var elemWidth;
				var elemTop;
				var innerTextFontSize = fontSize;
				var innerTextLeft;
				var innerTextCenter;
				var innerTextTop;		
				var innerTextWidth = 0;
				var innerTextHeight = 0;
				var bracketFontSize;
				var bracketWidth;
				
				var parse1 = parseText(base);
				var parse2 = parseText(innerText);								
	
				var ele1 = drawMathsText(context, textArray[q][0].slice(0,3), fontSize, 0, 0, false, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				elemWidth = ele1[0];
				elemHeight = ele1[1];
				elemTop = vertCenter - 0.5 * elemHeight;					

				// measure base
				if (typeof base == 'string') {base = [innerText]}
				if (parse1.empty == true) {
					baseWidth = baseFontSize * 0.6;
					baseHeight = baseFontSize;
					baseCenter = vertCenter + 0.4 * fontSize;
				} else {
					var bas = drawMathsText(context, base, baseFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					baseWidth = bas[0];
					baseHeight = bas[1];
					baseCenter = vertCenter + 0.4 * fontSize;
				}
				baseLeft = leftPoint + elemWidth + 2 * elemPadding;
				
				// measure width of innerText
				if (typeof innerText == 'string') {innerText = [innerText]}
				if (parse2.empty == true) {
					innerTextWidth = fontSize * 0.6;
					innerTextHeight = fontSize;
					innerTextTop = top;
				} else {
					var inn = drawMathsText(context, innerText, innerTextFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					innerTextWidth = inn[0];
					innerTextHeight = inn[1];
				}
				innerTextTop = vertCenter - 0.5 * innerTextHeight;
				bracketFontSize = innerTextHeight;

				var bra = drawMathsText(context, '(', bracketFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				bracketWidth = bra[0];
				innerTextLeft = baseLeft + baseWidth + bracketWidth + 3 * elemPadding;
		
				var elementWidth = elemWidth+innerTextWidth+baseWidth+2*bracketWidth+5*elemPadding;
				var elementTop = Math.min(top,innerTextTop);
				var elementBottom = Math.max(bottom,vertCenter+0.5*innerTextHeight,baseCenter+0.5*baseHeight);	
	
				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];
					textLoc[q][2] = [];
					textLoc[q][2][0] = [];

					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});

					// draw base
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: baseLeft, top:vertCenter+0.4*fontSize-0.5*baseHeight, width:0.6*baseFontSize, height:0.8*baseFontSize, fontSize:0.8*baseFontSize});
						if (parse1.selected !== null) selected = parse1.selected;												
					} else {
						var drawObj = drawMathsText(context, base, baseFontSize, baseLeft, baseCenter, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.6;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}
					
					// draw innerText
					if (parse2.empty == true) {
						textLoc[q][2][0][0] = drawSpacingBox({left: innerTextLeft, top:vertCenter-0.32*fontSize, width:0.6*fontSize, height:0.8*fontSize, fontSize:0.8*fontSize});
						if (parse2.selected !== null) selected = parse2.selected;						
					} else {
						var drawObj = drawMathsText(context, innerText, innerTextFontSize, innerTextLeft, innerTextTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][2] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}
					
					// draw elem (ie. log)
					drawMathsText(context, textArray[q][0].slice(0,3), fontSize, leftPoint, vertCenter-0.5*ele1[1], false, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					// draw open bracket
					drawMathsText(context, '(', bracketFontSize, innerTextLeft - elemPadding, vertCenter - 0.05 * fontSize, false, [], 'right', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					// draw close bracket
					drawMathsText(context, ')', bracketFontSize, innerTextLeft + innerTextWidth + elemPadding, vertCenter - 0.05 * fontSize, false, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);	
				}
									
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
				
			} else if (textArray[q][0] == 'abs') {
				// -----------------------------------------------
				//
				//             		     ABS              
				//
				// -----------------------------------------------
	
				context.save();
				var innerText = textArray[q][1];
				if (typeof innerText == 'string') innerText = [innerText];
				if (typeof innerText == 'number') innerText = [String(innerText)];					
				var elemPadding = 0.04 * fontSize;

				var elemWidth;
				var elemTop;
				var innerTextFontSize = fontSize;
				var innerTextLeft;
				var innerTextCenter;
				var innerTextTop;		
				var innerTextWidth = 0;
				var innerTextHeight = 0;
				var bracketFontSize;
				var bracketWidth;
				
				var parse1 = parseText(innerText);				

				// measure width
				var ele = drawMathsText(context, textArray[q][0], fontSize, 0, 0, false, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				elemWidth = 0;
				elemHeight = ele[1];
				elemTop = vertCenter - 0.5 * elemHeight;					

				// measure width of innerText
				if (typeof innerText == 'string') {innerText = [innerText]}
				if (parse1.empty == true) {
					innerTextWidth = fontSize*0.6;
					innerTextHeight = fontSize;
					innerTextTop = top;
				} else {
					var inn = drawMathsText(context, innerText, innerTextFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected);
					innerTextWidth = inn[0];
					innerTextHeight = inn[1];
				}
				innerTextTop = vertCenter - 0.5 * innerTextHeight;
				bracketFontSize = innerTextHeight;

				var bra = drawMathsText(context, '|', bracketFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				bracketWidth = bra[0];
				
				innerTextLeft = leftPoint + elemWidth + bracketWidth + 2* elemPadding;

				var elementWidth = elemWidth+innerTextWidth+2*bracketWidth+4*elemPadding;
				var elementTop = Math.min(top,innerTextTop);
				var elementBottom = Math.max(bottom,vertCenter+0.5*innerTextHeight);

				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];

					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});

					// draw innerText
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: innerTextLeft, top:vertCenter-0.32*fontSize, width:0.6*fontSize, height:0.8*fontSize, fontSize:0.8*fontSize});
						if (parse1.selected !== null) selected = parse1.selected;						
					} else {
						var drawObj = drawMathsText(context, innerText, innerTextFontSize, innerTextLeft, innerTextTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;
					}
					
					// draw open bracket
					drawMathsText(context, '|', bracketFontSize, leftPoint + elemWidth + elemPadding, vertCenter - 0.05 * fontSize, false, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);					
					// draw close bracket
					drawMathsText(context, '|', bracketFontSize, innerTextLeft + innerTextWidth + elemPadding, vertCenter - 0.05 * fontSize, false, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);						
				}
									
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;

			} else if (textArray[q][0] == 'exp') {

				// -----------------------------------------------
				//
				//               EXP:    e^x         
				//
				// -----------------------------------------------
							
				context.save();
				var power = textArray[q][1];
				if (typeof power == 'string') power = [power];
				if (typeof power == 'number') power = [String(power)];					
									
				var elemPadding = 0.04 * fontSize;

				var powerFontSize = 0.6 * fontSize;
				var powerLeft;
				var powerTop;
				var powerCenter;
				var powerWidth = 0;
				var powerHeight = 0;

				var elemWidth;
				var elemTop;
				
				var parse1 = parseText(power);				
	
				var ele1 = drawMathsText(context, 'e', fontSize, 0, 0, true, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				elemWidth = ele1[0];
				elemHeight = ele1[1];
				elemTop = vertCenter - 0.5 * elemHeight;

				// measure power
				if (typeof power == 'string') {power = [power]}
				if (parse1.empty == true) {
					powerWidth = powerFontSize * 0.6;
					powerHeight = powerFontSize;
				} else {
					var bas = drawMathsText(context, power, powerFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					powerWidth = bas[0];
					powerHeight = bas[1];
				}
				powerTop = vertCenter + 0.11 * fontSize - powerFontSize - 0.1 * powerHeight;
				powerCenter = powerTop + 0.45 * powerHeight;			
				powerLeft = leftPoint + elemWidth + 2 * elemPadding;
									
				var elementWidth = elemWidth+powerWidth+3*elemPadding;
				var elementTop = Math.min(top,powerTop);
				var elementBottom = Math.max(bottom,powerTop+powerHeight);					

				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];

					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});

					// draw power
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: powerLeft, top:powerTop, width:0.6*powerFontSize, height:0.8*powerFontSize, fontSize:0.8*powerFontSize});
						if (parse1.selected !== null) selected = parse1.selected;												
					} else {
						var drawObj = drawMathsText(context, power, powerFontSize, powerLeft, powerCenter, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.6;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}
					
					// draw elem (ie. e)
					drawMathsText(context, 'e', fontSize, leftPoint, vertCenter-0.5*ele1[1], true, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				}
									
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;				
				
			} else if (textArray[q][0] == 'sigma1' ||  textArray[q][0] == 'int1') {
				
				// -----------------------------------------------
				//
				//                   sigma1, int1              
				//
				// -----------------------------------------------
	
				context.save();
				var innerText = textArray[q][1];
				if (typeof innerText == 'string') innerText = [innerText];
				if (typeof innerText == 'number') innerText = [String(innerText)];				
				var elemPadding = 0.04 * fontSize;

				var elemWidth;
				var elemTop;
				var elemMiddle
				var innerTextFontSize = fontSize;
				var innerTextLeft;
				var innerTextCenter;
				var innerTextTop;		
				var innerTextWidth = 0;
				var innerTextHeight = 0;

				var parse1 = parseText(innerText);

				// measure width of symbol
				if (textArray[q][0] == 'sigma1') {
					var ele = drawMathsText(context,['<<font:Georgia>>'+String.fromCharCode(0x03A3)],fontSize*1.5,0,0,true,[],'left','middle','#000','measure','none',false,false,'Georgia');					
					elemWidth = ele[0];
					elemHeight = ele[1];
					elemTop = vertCenter - 0.53 * elemHeight;
					elemMiddle = vertCenter - 0.03 * elemHeight;
				} else if (textArray[q][0] == 'int1') {
					var ele = drawMathsText(context,['<<font:Georgia>>'+String.fromCharCode(0x222B)],fontSize*1.5,0,0,true,[],'left','middle','#000','measure','none',false,false,'Georgia');
					elemWidth = ele[0];
					elemHeight = ele[1];
					elemTop = vertCenter - 0.62 * elemHeight;
					elemMiddle = vertCenter - 0.12 * elemHeight;
				}

				// measure width of innerText
				if (typeof innerText == 'string') {innerText = [innerText]}
				if (parse1.empty == true) {
					innerTextWidth = fontSize*0.6;
					innerTextHeight = fontSize;
					innerTextTop = top;
				} else {
					var inn = drawMathsText(context, innerText, innerTextFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					innerTextWidth = inn[0];
					innerTextHeight = inn[1];
				}
				innerTextTop = vertCenter - 0.5 * innerTextHeight;
				innerTextLeft = leftPoint + elemWidth + elemPadding;

				var elementWidth = elemWidth+innerTextWidth+2*elemPadding;
				var elementTop = Math.min(top,elemTop,innerTextTop);
				var elementBottom = Math.max(bottom,vertCenter+0.5*elemHeight,vertCenter+0.5*innerTextHeight);

				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];

					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});
					
					// draw innerText
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: innerTextLeft, top:vertCenter-0.32*fontSize, width:0.6*fontSize, height:0.8*fontSize, fontSize:0.8*fontSize});
						if (parse1.selected !== null) selected = parse1.selected;						
					} else {
						var drawObj = drawMathsText(context, innerText, innerTextFontSize, innerTextLeft, innerTextTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;							
					}					

					if (textArray[q][0] == 'sigma1') {
						drawMathsText(context,['<<font:Georgia>>'+String.fromCharCode(0x03A3)],fontSize*1.5,leftPoint,elemMiddle,true,[],'left','middle',textColor,'draw','none',false,false,'Georgia',selected, sf, backgroundColor, fracScale, algPadding);					
					} else if (textArray[q][0] == 'int1') {
						drawMathsText(context,['<<font:Georgia>>'+String.fromCharCode(0x222B)],fontSize*1.5,leftPoint,elemMiddle,true,[],'left','middle',textColor,'draw','none',false,false,'Georgia',selected, sf, backgroundColor, fracScale, algPadding);
					}
				}
									
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
				
			} else if (textArray[q][0] == 'sigma2') {
				
				// -----------------------------------------------
				//
				//                      sigma2             
				//
				// -----------------------------------------------
	
				context.save();
				var bottomText = textArray[q][1];
				var topText = textArray[q][2];
				var innerText = textArray[q][3];					
				var elemPadding = 0.04 * fontSize;
				var elemWidth;
				var elemTop;
				var elemMiddle;
				var bottomTextFontSize = fontSize * 0.4;
				var bottomTextLeft;
				var bottomTextMiddle;
				var bottomTextBottom;
				var bottomTextWidth;
				var bottomTextHeight;
				var topTextFontSize = fontSize * 0.4;
				var topTextLeft;
				var topTextMiddle;
				var topTextTop;
				var topTextWidth;
				var topTextHeight;
				var innerTextFontSize = fontSize;
				var innerTextLeft;
				var innerTextCenter;
				var innerTextTop;		
				var innerTextWidth = 0;
				var innerTextHeight = 0;

				var parse1 = parseText(bottomText);
				var parse2 = parseText(topText);
				var parse3 = parseText(innerText);
				
				// measure width of symbol
				var ele = drawMathsText(context,['<<font:Georgia>>'+String.fromCharCode(0x03A3)],fontSize*1.35,0,0,true,[],'left','middle','#000','measure','none',false,false,'Georgia',selected, sf, backgroundColor, fracScale, algPadding);					
				elemWidth = ele[0];
				elemHeight = ele[1];
				elemTop = vertCenter - 0.53 * elemHeight;
				elemMiddle = vertCenter - 0.03 * elemHeight;
				
				// measure width of bottom text
				if (typeof bottomText == 'string') {bottomText = [bottomText]}
				if (parse1.empty == true) {
					bottomTextWidth = fontSize*0.5;
					bottomTextHeight = fontSize*0.5;
				} else {
					var bot = drawMathsText(context,bottomText,fontSize*0.4,0,0,true,[],'left','middle','#000','measure',backColor,bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
					bottomTextWidth = bot[0];
					bottomTextHeight = bot[1];
				}				
				bottomTextMiddle = vertCenter + 0.5 * elemHeight + 0.5 * bottomTextHeight;
				bottomTextBottom = vertCenter + 0.5 * elemHeight + bottomTextHeight;
				
				// measure width of top text
				if (typeof topText == 'string') {topText = [topText]}
				if (parse2.empty == true) {
					topTextWidth = fontSize*0.5;
					topTextHeight = fontSize*0.5;
				} else {
					var bot = drawMathsText(context,topText,fontSize*0.4,0,0,true,[],'left','middle','#000','measure',backColor,bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
					topTextWidth = bot[0];
					topTextHeight = bot[1];
				}				
				topTextMiddle = vertCenter - 0.5 * elemHeight - 0.5 * topTextHeight;
				topTextTop = vertCenter - 0.5 * elemHeight - topTextHeight;				
				
				var symbolWidth = Math.max(elemWidth,bottomTextWidth,topTextWidth);

				// measure width of innerText
				if (typeof innerText == 'string') {innerText = [innerText]}
				if (parse3.empty == true) {
					innerTextWidth = fontSize*0.6;
					innerTextHeight = fontSize;
					innerTextTop = top;
				} else {
					var inn = drawMathsText(context, innerText, innerTextFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					innerTextWidth = inn[0];
					innerTextHeight = inn[1];
				}
				innerTextTop = vertCenter - 0.5 * innerTextHeight;
				innerTextLeft = leftPoint + symbolWidth + elemPadding;

				var elementWidth = symbolWidth+innerTextWidth+2*elemPadding;
				var elementTop = Math.min(top,elemTop,innerTextTop,topTextTop);
				var elementBottom = Math.max(bottom,vertCenter+0.5*elemHeight,vertCenter+0.5*innerTextHeight,bottomTextBottom);
								
				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];
					textLoc[q][2] = [];
					textLoc[q][2][0] = [];
					textLoc[q][3] = [];
					textLoc[q][3][0] = [];

					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});

					// draw bottomText
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left:leftPoint+0.5*(symbolWidth-bottomTextWidth),top:bottomTextMiddle-0.25*fontSize,width:0.5*fontSize,height:0.5*fontSize,fontSize:0.5*fontSize});							
						if (parse1.selected !== null) selected = parse1.selected;
					} else {
						var drawObj = drawMathsText(context,bottomText,fontSize*0.4,leftPoint+0.5*(symbolWidth-bottomTextWidth),bottomTextMiddle,true,[],'left','middle',textColor,'draw',backColor,bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.4;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;	
					}
					
					// draw topText
					if (parse2.empty == true) {
						textLoc[q][2][0][0] = drawSpacingBox({left:leftPoint+0.5*(symbolWidth-topTextWidth),top:topTextMiddle-0.25*fontSize,width:0.5*fontSize,height:0.5*fontSize,fontSize:0.5*fontSize});
						if (parse2.selected !== null) selected = parse2.selected;
					} else {
						var drawObj = drawMathsText(context,topText,fontSize*0.4,leftPoint+0.5*(symbolWidth-topTextWidth),topTextMiddle,true,[],'left','middle',textColor,'draw',backColor,bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][2] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.4;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;							
					}					

					// draw innerText
					if (parse3.empty == true) {
						textLoc[q][3][0][0] = drawSpacingBox({left: innerTextLeft, top:vertCenter-0.32*fontSize, width:0.6*fontSize, height:0.8*fontSize, fontSize:0.8*fontSize});
						if (parse3.selected !== null) selected = parse3.selected;
					} else {
						var drawObj = drawMathsText(context, innerText, innerTextFontSize, innerTextLeft, innerTextTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][3] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}
					
					// draw sigma symbol
					drawMathsText(context,['<<font:Georgia>>'+String.fromCharCode(0x03A3)],fontSize*1.35,leftPoint+0.5*(symbolWidth-elemWidth),elemMiddle,true,[],'left','middle',textColor,'draw','none',false,false,'Arial',selected, sf, backgroundColor, fracScale, algPadding);
					
					if (selected == true) {
						// redraw bottomText
						if (parse1.empty == true) {
							context.strokeStyle = textColor;
							context.lineWidth = fontSize * 0.02;
							context.lineCap = 'round'
							context.strokeRect(leftPoint+0.5*(symbolWidth-bottomTextWidth),bottomTextMiddle-0.25*fontSize,fontSize*0.5,fontSize*0.5);
						} else {
							var drawObj = drawMathsText(context,bottomText,fontSize*0.4,leftPoint+0.5*(symbolWidth-bottomTextWidth),bottomTextMiddle,true,[],'left','middle',textColor,'draw',backColor,bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
						}
						
						// draw topText
						if (parse2.empty == true) {
							context.strokeStyle = textColor;
							context.lineWidth = fontSize * 0.02;
							context.lineCap = 'round'
							context.strokeRect(leftPoint+0.5*(symbolWidth-topTextWidth),topTextMiddle-0.25*fontSize,fontSize*0.5,fontSize*0.5);
						} else {
							var drawObj = drawMathsText(context,topText,fontSize*0.4,leftPoint+0.5*(symbolWidth-topTextWidth),topTextMiddle,true,[],'left','middle',textColor,'draw',backColor,bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
						}					
					}
				}
									
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
				
			} else if (textArray[q][0] == 'int2') {
				
				// -----------------------------------------------
				//
				//                      int2             
				//
				// -----------------------------------------------
	
				context.save();
				var bottomText = textArray[q][1];
				var topText = textArray[q][2];
				var innerText = textArray[q][3];					
				var elemPadding = 0.04 * fontSize;

				var elemWidth;
				var elemTop;
				var elemMiddle;
				var bottomTextFontSize = fontSize * 0.4;
				var bottomTextLeft;
				var bottomTextMiddle;
				var bottomTextBottom;
				var bottomTextWidth;
				var bottomTextHeight;
				var topTextFontSize = fontSize * 0.4;
				var topTextLeft;
				var topTextMiddle;
				var topTextTop;
				var topTextWidth;
				var topTextHeight;
				var innerTextFontSize = fontSize;
				var innerTextLeft;
				var innerTextCenter;
				var innerTextTop;		
				var innerTextWidth = 0;
				var innerTextHeight = 0;

				var parse1 = parseText(bottomText);
				var parse2 = parseText(topText);
				var parse3 = parseText(innerText);

				// measure width of symbol
				var ele = drawMathsText(context,['<<font:Georgia>>'+String.fromCharCode(0x222B)],fontSize*1.5,0,0,true,[],'left','middle','#000','measure','none',false,false,'Georgia');					
				elemWidth = ele[0];
				elemHeight = ele[1];
				elemTop = vertCenter - 0.6 * elemHeight;
				elemMiddle = vertCenter - 0.1 * elemHeight;
				
				// measure width of bottom text
				if (typeof bottomText == 'string') {bottomText = [bottomText]}
				if (parse1.empty == true) {
					bottomTextWidth = fontSize*0.5;
					bottomTextHeight = fontSize*0.5;
				} else {
					var bot = drawMathsText(context,bottomText,fontSize*0.4,0,0,true,[],'left','middle','#000','measure','none',bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
					bottomTextWidth = bot[0];
					bottomTextHeight = bot[1];
				}				
				bottomTextMiddle = vertCenter + 0.4 * elemHeight;
				bottomTextBottom = vertCenter + 0.4 * elemHeight + 0.5 * bottomTextHeight;
				
				// measure width of top text
				if (typeof topText == 'string') {topText = [topText]}
				if (parse2.empty == true) {
					topTextWidth = fontSize*0.5;
					topTextHeight = fontSize*0.5;
				} else {
					var bot = drawMathsText(context,topText,fontSize*0.4,0,0,true,[],'left','middle','#000','measure','none',bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
					topTextWidth = bot[0];
					topTextHeight = bot[1];
				}	
				topTextMiddle = vertCenter - 0.4 * elemHeight;
				topTextTop = vertCenter - 0.4 * elemHeight - 0.5 * topTextHeight;

				var symbolWidth = elemWidth + Math.max(bottomTextWidth-0.1*fontSize,topTextWidth+0.15*fontSize);

				// measure width of innerText
				if (typeof innerText == 'string') {innerText = [innerText]}
				if (parse3.empty == true) {
					innerTextWidth = fontSize*0.6;
					innerTextHeight = fontSize;
					innerTextTop = top;
				} else {
					var inn = drawMathsText(context, innerText, innerTextFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					innerTextWidth = inn[0];
					innerTextHeight = inn[1];
				}
				innerTextTop = vertCenter - 0.5 * innerTextHeight;
				innerTextLeft = leftPoint + symbolWidth + elemPadding;

				var elementWidth = symbolWidth+innerTextWidth+2*elemPadding;
				var elementTop = Math.min(top,elemTop,innerTextTop,topTextTop);
				var elementBottom = Math.max(bottom,vertCenter+0.5*elemHeight,vertCenter+0.5*innerTextHeight,bottomTextBottom);
				
				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];
					textLoc[q][2] = [];
					textLoc[q][2][0] = [];
					textLoc[q][3] = [];
					textLoc[q][3][0] = [];

					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});

					// draw bottomText
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left:leftPoint-0.1*fontSize+elemWidth,top:bottomTextMiddle-0.25*fontSize,width:0.5*fontSize,height:0.5*fontSize,fontSize:0.5*fontSize});
						if (parse1.selected !== null) selected = parse1.selected;
					} else {
						var drawObj = drawMathsText(context,bottomText,fontSize*0.4,leftPoint-0.1*fontSize+elemWidth,bottomTextMiddle,true,[],'left','middle',textColor,'draw',backColor,bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.4;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}
					
					// draw topText
					if (parse2.empty == true) {
						textLoc[q][2][0][0] = drawSpacingBox({left:leftPoint+0.15*fontSize+elemWidth,top:topTextMiddle-0.25*fontSize,width:0.5*fontSize,height:0.5*fontSize,fontSize:0.5*fontSize});
						if (parse2.selected !== null) selected = parse2.selected;
					} else {
						var drawObj = drawMathsText(context,topText,fontSize*0.4,leftPoint+0.15*fontSize+elemWidth,topTextMiddle,true,[],'left','middle',textColor,'draw',backColor,bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][2] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.4;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}					
					
					// draw innerText
					if (parse3.empty == true) {
						textLoc[q][3][0][0] = drawSpacingBox({left:innerTextLeft,top:vertCenter-0.32*fontSize, width:0.6*fontSize, height:0.8*fontSize, fontSize:0.8*fontSize});
						if (parse3.selected !== null) selected = parse3.selected;
					} else {
						var drawObj = drawMathsText(context, innerText, innerTextFontSize, innerTextLeft, innerTextTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][3] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}
					
					drawMathsText(context,['<<font:Georgia>>'+String.fromCharCode(0x222B)],fontSize*1.5,leftPoint+elemPadding,elemMiddle,true,[],'left','middle',textColor,'draw','none',false,false,'Arial',selected, sf, backgroundColor, fracScale, algPadding);					
				}
									
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
				
			} else if (textArray[q][0] == 'recurring') {
				// -----------------------------------------------
				//
				//             		     RECURRING              
				//
				// -----------------------------------------------
	
				context.save();
				var innerText = textArray[q][1];					
				var innerTextFontSize = fontSize;
				var innerTextLeft;
				var innerTextCenter;
				var innerTextTop;		
				var innerTextWidth = 0;
				var innerTextHeight = 0;

				var parse1 = parseText(innerText);

				// measure width of innerText
				if (typeof innerText == 'string') {innerText = [innerText]}
				if (typeof innerText == 'number') {innerText = [String(innerText)]}
				if (parse1.empty == true) {
					innerTextWidth = fontSize*0.6;
					innerTextHeight = fontSize;
					innerTextTop = top;
				} else {
					var inn = drawMathsText(context, innerText, innerTextFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					innerTextWidth = inn[0];
					innerTextHeight = inn[1];
				}
				innerTextTop = vertCenter - 0.5 * innerTextHeight;

				var elementWidth = innerTextWidth;
				var elementTop = Math.min(top,innerTextTop);
				var elementBottom = Math.max(bottom,vertCenter+0.5*innerTextHeight);

				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];

					// draw innerText
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: leftPoint, top:vertCenter-0.4*fontSize, width:0.6*fontSize, height:0.8*fontSize, fontSize:0.8*fontSize});
						if (parse1.selected !== null) selected = parse1.selected;
					} else {
						var drawObj = drawMathsText(context, innerText, innerTextFontSize, leftPoint, innerTextTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;
					}
					
					var leftDot;
					var rightDot;
					var loc = textLoc[q][1];
					if (typeof loc == 'object' && loc.length == 1) loc = loc[0];
					if (parse1.empty == true) {
						leftDot = leftPoint+0.3*fontSize;	
					} else {
						for (var i = 0; i < loc.length - 1; i++) {
							if (Math.abs(loc[i+1].left-loc[i].left) > 0.0001) {
								if (typeof leftDot == 'undefined') {
									leftDot = 0.5*(loc[i].left+loc[i+1].left);	
								} else {
									rightDot = 0.5*(loc[i].left+loc[i+1].left);
								}
							}
						}
					}
					
					context.beginPath();
					if (selected == false) {
						context.fillStyle = textColor;
						context.arc(leftDot,innerTextTop-0.1*fontSize,0.1*fontSize,0,2*Math.PI);
						context.fill();
						if (typeof rightDot !== 'undefined') {
							context.beginPath();
							context.arc(rightDot,innerTextTop-0.1*fontSize,0.1*fontSize,0,2*Math.PI);
						}
					} else {
						var selBackColor = invertColor('#FFC');
						if (backColor !== 'none') selBackColor = invertColor(backColor);
						context.fillStyle = selBackColor;
						var w = loc[loc.length-1].left-loc[0].left; 
						if (Math.abs(w) < 0.0001) w = loc[0].width;
						context.fillRect(leftPoint,innerTextTop-0.25*fontSize,w,0.25*fontSize);						
						context.fillStyle = invertColor(textColor);
						context.arc(leftDot,innerTextTop-0.1*fontSize,0.1*fontSize,0,2*Math.PI);
						context.fill();
						if (typeof rightDot !== 'undefined') {
							context.beginPath();
							context.arc(rightDot,innerTextTop-0.1*fontSize,0.1*fontSize,0,2*Math.PI);
						}
					}
					context.fill();					
				}
									
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;

			} else if (['vectorArrow','bar','hat'].indexOf(textArray[q][0]) > -1) {
				// -----------------------------------------------
				//
				//            VECTOR-ARROW, BAR, HAT              
				//
				// -----------------------------------------------
	
				context.save();
				var innerText = textArray[q][1];					
				var innerTextFontSize = fontSize;
				var innerTextLeft;
				var innerTextCenter;
				var innerTextTop;		
				var innerTextWidth = 0;
				var innerTextHeight = 0;

				var parse1 = parseText(innerText);

				// measure width of innerText
				if (typeof innerText == 'string') {innerText = [innerText]}
				if (parse1.empty == true) {
					innerTextWidth = fontSize*0.6;
					innerTextHeight = fontSize;
					innerTextTop = top;
				} else {
					var inn = drawMathsText(context, innerText, innerTextFontSize, 0, 0, algText, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					innerTextWidth = inn[0];
					innerTextHeight = inn[1];
				}
				innerTextTop = vertCenter - 0.5 * innerTextHeight;

				var elementWidth = innerTextWidth;
				var elementTop = Math.min(top,innerTextTop);
				var elementBottom = Math.max(bottom,vertCenter+0.5*innerTextHeight);

				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];

					// draw innerText
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: leftPoint, top:vertCenter-0.4*fontSize, width:0.6*fontSize, height:0.8*fontSize, fontSize:0.8*fontSize});
						if (parse1.selected !== null) selected = parse1.selected;
					} else {
						var drawObj = drawMathsText(context, innerText, innerTextFontSize, leftPoint, innerTextTop, algText, [], 'left', 'top', textColor, 'draw', backColor, bold, italic, fontName,selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}
					
					var left,right;
					var loc = textLoc[q][1];
					if (typeof loc == 'object' && loc.length == 1) loc = loc[0];
					if (parse1.empty == true) {
						left = leftPoint+0.2*0.6*fontSize;
						right = leftPoint+0.8*0.6*fontSize;
					} else {
						var first=0,mid=0,last=0;
						for (var i = 0; i < loc.length-1; i++) {
							if (loc[i+1].left-loc[i].left > 0.0001) {
								if (first == 0) {
									first = loc[i+1].left-loc[i].left;
								} else {
									if (last > 0) {
										mid += last;
									}
									last = loc[i+1].left-loc[i].left;
								}
							}
						}
						if (last == 0) {
							left = leftPoint+0.2*first;
							right = leftPoint+0.8*first;							
						} else {
							if (['bar'].indexOf(textArray[q][0]) > -1) {
								left = leftPoint+0.2*first;
								right = leftPoint+first+mid+0.8*last;
							} else if (['vectorArrow'].indexOf(textArray[q][0]) > -1) {
								left = leftPoint+0.3*first;
								right = leftPoint+first+mid+0.7*last;
							} else if (['hat'].indexOf(textArray[q][0]) > -1) {
								if (parse1.chars = 2) {
									left = leftPoint+0.5*first;
									right = leftPoint+first+mid+0.5*last;												
								} else {
									left = leftPoint+first;
									right = leftPoint+first+mid+0*last;							
								}
							}
						}
					}
					var barTop = innerTextTop+0.12*fontSize;
					if (innerText[0].length == 0) barTop = innerTextTop-0.08*fontSize; 
					for (var k = 0; k < innerText[0].length; k++) {
						if ('0123456789QWERTYUIOPASDFGHJKLZXCVBNMtlkhfdb|(){}[]\/?!£$%&'.indexOf(innerText[0][k]) > -1) {
							barTop = innerTextTop-0.08*fontSize;
						}
					}

					context.save();
					if (selected == true) {
						var selBackColor = invertColor('#FFC');
						if (backColor !== 'none') selBackColor = invertColor(backColor);
						context.fillStyle = selBackColor;
						context.fillRect(leftPoint,barTop-0.15*fontSize,elementWidth,0.3*fontSize);
						context.strokeStyle = invertColor(textColor);
					} else {
						context.strokeStyle = textColor;
					}
					context.lineWidth = fontSize * 0.05;
					context.lineCap = 'round';
					context.lineJoin = 'round';
					context.beginPath();				
					if (textArray[q][0] == 'bar') {
						context.moveTo(left,barTop);
						context.lineTo(right,barTop);
						context.stroke();
					} else if (textArray[q][0] == 'vectorArrow') {
						context.moveTo(left,barTop);
						context.lineTo(right,barTop);
						context.lineTo(right-0.12*fontSize,barTop-0.12*fontSize);
						context.moveTo(right,barTop);
						context.lineTo(right-0.12*fontSize,barTop+0.12*fontSize);
						context.stroke();							
					} else if (textArray[q][0] == 'hat') {
						context.moveTo(left,barTop+0.1*fontSize);
						context.lineTo((left+right)/2,barTop-0.1*fontSize);
						context.lineTo(right,barTop+0.1*fontSize);
						context.stroke();						
					}
					context.restore();					
				}
									
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;

			} else if (textArray[q][0] == 'colVector2d') {
				// -----------------------------------------------
				//
				//                2D COLUMN VECTORS 
				//
				// -----------------------------------------------
			
				var numFontSize = 0.7 * fontSize;
				height = Math.max(height, 2 * numFontSize);
				var numFont = numFontSize + 'px Arial';
				var numAlgFont = 'italic ' + numFontSize + 'px Georgia'; 
				context.font = numFont;
				var bracketWidth = 0.4 * fontSize;			
			
				// work out the width of the num and denom
				var num1Left;
				var num1Center;
				var num1Top;
				var num1Bottom;
				var num1Width = 0;
				var num1Height = 0;
				var num2Left;
				var num2Center;
				var num2Top;
				var num2Bottom;
				var num2Width = 0;
				var num2Height = 0;
				var num1 = textArray[q][1];
				var num2 = textArray[q][2];
				
				var parse1 = parseText(num1);
				var parse2 = parseText(num2);
				
				//measure num1
				if (parse1.empty == true) {
					num1Width = fontSize * 0.6;
					num1Height = fontSize * 0.7;
				} else {
					if (typeof num1 == 'string') {
						num1 = [num1];
					}
					var numMeasure = drawMathsText(context, num1, numFontSize, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					num1Width = numMeasure[0]; 
					num1Height = numMeasure[1];
				}
				
				//measure num2
				if (parse2.empty == true) {
					num2Width = fontSize * 0.6;
					num2Height = fontSize * 0.7;
				} else {
					if (typeof num2 == 'string') {
						num2 = [num2];
					}
					var numMeasure = drawMathsText(context, num2, numFontSize, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					num2Width = numMeasure[0]; 
					num2Height = numMeasure[1];
				}
				
				var maxWidth = Math.max(num1Width,num2Width);
				
				num1Left = leftPoint + bracketWidth + maxWidth * 0.5 - num1Width * 0.5;
				num1Center = vertCenter - 0.05 * fontSize - 0.5 * num1Height;
				num1Top = num1Center - 0.5 * num1Height;

				num2Left = leftPoint + bracketWidth + maxWidth * 0.5 - num2Width * 0.5;
				num2Center = vertCenter + 0.05 * fontSize + 0.5 * num2Height;
				num2Top = num2Center - 0.5 * num2Height;

				var elementWidth = maxWidth + 2 * bracketWidth;
				var elementTop = Math.min(top,num1Top);
				var elementBottom = Math.max(bottom,num2Top+num2Height);	
				
				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];
					textLoc[q][2] = [];
					textLoc[q][2][0] = [];
					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});
					context.save();
					context.font = fracFont;
					context.fillStyle = textColor;
			
					// draw num1
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: num1Left, top: num1Top, width: 0.6 * fontSize, height: 0.6 * fontSize, fontSize: 0.7 * fontSize});
						if (parse1.selected !== null) selected = parse1.selected;
					} else {
						context.save();
						var drawObj = drawMathsText(context, num1, numFontSize, num1Left, num1Center, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.7;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
						context.restore();
					}
					
					// draw num2
					if (parse2.empty == true) {
						textLoc[q][2][0][0] = drawSpacingBox({left: num2Left, top: num2Top, width: 0.6 * fontSize, height: 0.6 * fontSize, fontSize: 0.7 * fontSize});
						if (parse2.selected !== null) selected = parse2.selected;
					} else {
						context.save();
						var drawObj = drawMathsText(context, num2, numFontSize, num2Left, num2Center, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][2] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.7;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
						context.restore();
					}
					
					context.save();
					context.lineWidth = fontSize / 15;
					context.lineCap = "round";
					context.lineJoin = "round";
					context.beginPath();
					
					// left bracket
					var lLeft = leftPoint+bracketWidth/3;
					var lTop = num1Top+bracketWidth/3;
					var lBottom = num2Top+num2Height-bracketWidth/3;
					var lRadius = bracketWidth/3;
					
					if (selected == true) {
						var selBackColor = invertColor('#FFC');
						if (backColor !== 'none') selBackColor = invertColor(backColor);
						context.fillStyle = selBackColor;
						context.fillRect(leftPoint,lTop-1.5*lRadius,bracketWidth,lBottom-lTop+3*lRadius);
						context.strokeStyle = invertColor(textColor);
					} else {
						context.strokeStyle = textColor;
					}
					
					context.arc(lLeft+lRadius,lBottom,lRadius,(2/3)*Math.PI,Math.PI);
					context.lineTo(lLeft,lTop);
					context.arc(lLeft+lRadius,lTop,lRadius,Math.PI,(4/3)*Math.PI);
					context.stroke();

					// right bracket
					var rLeft = leftPoint+bracketWidth+maxWidth+(2/3)*bracketWidth;
					var rTop = num1Top+bracketWidth/3;
					var rBottom = num2Top+num2Height-bracketWidth/3;
					var rRadius = bracketWidth/3;	
					
					if (selected == true) {
						var selBackColor = invertColor('#FFC');
						if (backColor !== 'none') selBackColor = invertColor(backColor);
						context.fillStyle = selBackColor;
						context.fillRect(leftPoint+bracketWidth+maxWidth,rTop-1.5*rRadius,bracketWidth,rBottom-rTop+3*rRadius);
					}
					
					context.beginPath();
					context.arc(rLeft-rRadius,rTop,rRadius,(5/3)*Math.PI,2*Math.PI);
					context.lineTo(rLeft,rBottom);
					context.arc(rLeft-rRadius,rBottom,rRadius,0,(1/3)*Math.PI);
					context.stroke();
					context.restore();
				}
				
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
			
			} else if (textArray[q][0] == 'colVector3d') {
				// -----------------------------------------------
				//
				//                3D COLUMN VECTORS 
				//
				// -----------------------------------------------
			
				var numFontSize = 0.7 * fontSize;
				height = Math.max(height, 2 * numFontSize);
				var numFont = numFontSize + 'px Arial';
				context.font = numFont;
				var bracketWidth = 0.4 * fontSize;		
			
				// work out the width of the num and denom
				var num1Left;
				var num1Center;
				var num1Top;
				var num1Bottom;
				var num1Width = 0;
				var num1Height = 0;
				var num2Left;
				var num2Center;
				var num2Top;
				var num2Bottom;
				var num2Width = 0;
				var num2Height = 0;
				var num3Left;
				var num3Center;
				var num3Top;
				var num3Bottom;
				var num3Width = 0;
				var num3Height = 0;
				var num1 = textArray[q][1];
				var num2 = textArray[q][2];
				var num3 = textArray[q][3];
				
				var parse1 = parseText(num1);
				var parse2 = parseText(num2);
				var parse3 = parseText(num3);
				
				//measure num1
				if (parse1.empty == true) {
					num1Width = fontSize * 0.6;
					num1Height = fontSize * 0.7;
				} else {
					if (typeof num1 == 'string') {
						num1 = [num1];
					}
					var numMeasure = drawMathsText(context, num1, numFontSize, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					num1Width = numMeasure[0]; 
					num1Height = numMeasure[1];
				}
				
				//measure num2
				if (parse2.empty == true) {
					num2Width = fontSize * 0.6;
					num2Height = fontSize * 0.7;
				} else {
					if (typeof num2 == 'string') {
						num2 = [num2];
					}
					var numMeasure = drawMathsText(context, num2, numFontSize, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					num2Width = numMeasure[0]; 
					num2Height = numMeasure[1];
				}
				
				//measure num3
				if (parse3.empty == true) {
					num3Width = fontSize * 0.6;
					num3Height = fontSize * 0.7;
				} else {
					if (typeof num3 == 'string') {
						num3 = [num3];
					}
					var numMeasure = drawMathsText(context, num3, numFontSize, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					num3Width = numMeasure[0]; 
					num3Height = numMeasure[1];
				}				
				
				var maxWidth = Math.max(num1Width,num2Width,num3Width);
				var totalHeight = num1Height+num2Height+num3Height+0.2*fontSize;
				
				num1Left = leftPoint + bracketWidth + maxWidth * 0.5 - num1Width * 0.5;
				num1Center = vertCenter - 0.5 * totalHeight + 0.5 * num1Height;
				num1Top = num1Center - 0.5 * num1Height;

				num2Left = leftPoint + bracketWidth + maxWidth * 0.5 - num2Width * 0.5;
				num2Center = vertCenter - 0.5 * totalHeight + num1Height + 0.1 * fontSize + 0.5 * num2Height;
				num2Top = num2Center - 0.5 * num2Height;

				num3Left = leftPoint + bracketWidth + maxWidth * 0.5 - num3Width * 0.5;
				num3Center = vertCenter - 0.5 * totalHeight + num1Height + num2Height + 0.2 * fontSize + 0.5 * num2Height;
				num3Top = num3Center - 0.5 * num3Height;

				var elementWidth = maxWidth + 2 * bracketWidth;
				var elementTop = Math.min(top,num1Top);
				var elementBottom = Math.max(bottom,num3Top+num3Height);	
				
				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];
					textLoc[q][2] = [];
					textLoc[q][2][0] = [];
					textLoc[q][3] = [];
					textLoc[q][3][0] = [];					
					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});
					context.save();
					context.font = fracFont;
					context.fillStyle = textColor;
			
					// draw num1
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: num1Left, top: num1Top, width: 0.6 * fontSize, height: 0.6 * fontSize, fontSize: 0.7 * fontSize});
						if (parse1.selected !== null) selected = parse1.selected;						
					} else {
						context.save();
						var drawObj = drawMathsText(context, num1, numFontSize, num1Left, num1Center, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.7;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
						context.restore();
					}
					
					// draw num2
					if (parse2.empty == true) {
						textLoc[q][2][0][0] = drawSpacingBox({left: num2Left, top: num2Top, width: 0.6 * fontSize, height: 0.6 * fontSize, fontSize: 0.7 * fontSize});
						if (parse2.selected !== null) selected = parse2.selected;
					} else {
						context.save();
						var drawObj = drawMathsText(context, num2, numFontSize, num2Left, num2Center, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][2] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.7;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
						context.restore();
					}
					
					// draw num3
					if (parse3.empty == true) {
						textLoc[q][3][0][0] = drawSpacingBox({left: num3Left, top: num3Top, width: 0.6 * fontSize, height: 0.6 * fontSize, fontSize: 0.7 * fontSize});
						if (parse3.selected !== null) selected = parse3.selected;
					} else {
						context.save();
						var drawObj = drawMathsText(context, num3, numFontSize, num3Left, num3Center, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][3] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.7;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
						context.restore();
					}					
					
					context.save();
					context.lineWidth = fontSize / 15;
					context.lineCap = "round";
					context.lineJoin = "round";
					context.beginPath();
					
					// left bracket
					var lLeft = leftPoint+bracketWidth/3;
					var lTop = num1Top+bracketWidth/3;
					var lBottom = num3Top+num3Height-bracketWidth/3;
					var lRadius = bracketWidth/3;
					
					if (selected == true) {
						var selBackColor = invertColor('#FFC');
						if (backColor !== 'none') selBackColor = invertColor(backColor);
						context.fillStyle = selBackColor;
						context.fillRect(leftPoint,lTop-1.5*lRadius,bracketWidth,lBottom-lTop+3*lRadius);
						context.strokeStyle = invertColor(textColor);
					} else {
						context.strokeStyle = textColor;
					}
					
					context.arc(lLeft+lRadius,lBottom,lRadius,(2/3)*Math.PI,Math.PI);
					context.lineTo(lLeft,lTop);
					context.arc(lLeft+lRadius,lTop,lRadius,Math.PI,(4/3)*Math.PI);
					context.stroke();

					// right bracket
					var rLeft = leftPoint+bracketWidth+maxWidth+(2/3)*bracketWidth;
					var rTop = num1Top+bracketWidth/3;
					var rBottom = num3Top+num3Height-bracketWidth/3;
					var rRadius = bracketWidth/3;
					
					if (selected == true) {
						var selBackColor = invertColor('#FFC');
						if (backColor !== 'none') selBackColor = invertColor(backColor);
						context.fillStyle = selBackColor;
						context.fillRect(leftPoint+bracketWidth+maxWidth,rTop-1.5*rRadius,bracketWidth,rBottom-rTop+3*rRadius);
					}
					
					context.beginPath();
					context.arc(rLeft-rRadius,rTop,rRadius,(5/3)*Math.PI,2*Math.PI);
					context.lineTo(rLeft,rBottom);
					context.arc(rLeft-rRadius,rBottom,rRadius,0,(1/3)*Math.PI);
					context.stroke();
					context.restore();
				}
				
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
			
			} else if (textArray[q][0] == 'mixedNum') {
				// -----------------------------------------------
				//
				//               MIXED NUMBERS              
				//
				// -----------------------------------------------
			
				var fracFontSize = 0.7 * fontSize;
				height = Math.max(height, 2 * fracFontSize);
				var fracFont = fracFontSize + 'px Arial';
				context.font = fracFont;
				var fracPadding = fontSize / 8;
			
				// work out the width of the num and denom
				var numLeft;
				var numCenter;
				var numTop;
				var numBottom;
				var numWidth = 0;
				var numHeight = 0;
				var denomLeft;
				var denomCenter;
				var denomTop;
				var denomBottom;
				var denomWidth = 0;
				var denomHeight = 0;
				var intWidth;
				var intHeight;
				var integer = textArray[q][1];
				var numerator = textArray[q][2];
				var denominator = textArray[q][3];
				
				var parse1 = parseText(integer);
				var parse2 = parseText(numerator);
				var parse3 = parseText(denominator);
				
				// measure integer width
				if (parse1.empty == true) {
					intWidth = fontSize * 0.7;
					intHeight = fontSize * 0.8;
				} else {
					if (typeof integer == 'string') {
						integer = [integer];
					}
					var intMeasure = drawMathsText(context, integer, fontSize, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					intWidth = intMeasure[0]; 
					intHeight = intMeasure[1];
				}
				
				//measure numerator width
				if (parse2.empty == true) {
					numWidth = fontSize * 0.6;
					numHeight = fontSize * 0.7;
				} else {
					if (typeof numerator == 'string') {
						numerator = [numerator];
					}
					var numMeasure = drawMathsText(context, numerator, fracFontSize, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					numWidth = numMeasure[0]; 
					numHeight = numMeasure[1];
				}
				
				//measure denominator width
				if (parse3.empty == true) {
					denomWidth += fontSize * 0.6;
					denomHeight += fontSize * 0.7;
				} else {
					if (typeof denominator == 'string') {
						denominator = [denominator];
					}
					var denomMeasure = drawMathsText(context, denominator, fracFontSize, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none' , bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					denomWidth = denomMeasure[0];
					denomHeight = denomMeasure[1];
				}
				
				var fractionWidth = Math.max(numWidth,denomWidth);
				
				numLeft = leftPoint + intWidth + fracPadding + fractionWidth * 0.5 - numWidth * 0.5;
				numCenter = vertCenter - 0.1 * fontSize - 0.4 * numHeight;
				numTop = numCenter - 0.5 * numHeight;
				
				denomLeft = leftPoint + intWidth + fracPadding + fractionWidth * 0.5 - denomWidth * 0.5;
				denomCenter = vertCenter + 0.2 * fontSize + 0.5 * denomHeight;
				denomTop = denomCenter - 0.5 * denomHeight;
				
				var elementWidth = intWidth + fractionWidth + 2 * fracPadding;
				var elementTop = Math.min(top, numTop, vertCenter - 0.5 * intHeight);
				var elementBottom = Math.max(bottom, denomTop + denomHeight, vertCenter + 0.5 * intHeight);				
				
				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];
					textLoc[q][2] = [];
					textLoc[q][2][0] = [];
					textLoc[q][3] = [];
					textLoc[q][3][0] = [];					
					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});					
					context.save();
					context.font = fracFont;
					context.fillStyle = textColor;
			
					// draw integer
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left: leftPoint, top: vertCenter - 0.4 * fontSize, width: 0.7 * fontSize, height: 0.8 * fontSize, fontSize: 0.8 * fontSize});
						if (parse1.selected !== null) selected = parse1.selected;
					} else {
						var drawObj = drawMathsText(context,integer,fontSize,leftPoint,vertCenter,algText,[],'left','middle',textColor,'draw',backColor,bold,italic,fontName,selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}					
			
					// draw numerator
					if (parse2.empty == true) {
						textLoc[q][2][0][0] = drawSpacingBox({left: numLeft, top: numTop, width: 0.6 * fontSize, height: 0.6 * fontSize, fontSize: 0.7 * fontSize});
						if (parse2.selected !== null) selected = parse2.selected;
					} else {
						var drawObj = drawMathsText(context, numerator, fracFontSize, numLeft, numCenter, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][2] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.7;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
					}

					if (selected == false) {
						context.strokeStyle = textColor;
					} else {
						var selBackColor = invertColor('#FFC');
						if (backColor !== 'none') selBackColor = invertColor(backColor);
						context.fillColor = selBackColor;
						context.fillRect(leftPoint+intWidth+0.5*fracPadding,vertCenter-0.1*fontSize,fractionWidth+fracPadding+0.1*fontSize,0.3*fontSize);
						context.strokeStyle = invertColor(textColor);						
					}
					if (bold == false) {
						context.lineWidth = fontSize / 20;
					} else {
						context.lineWidth = fontSize / 12;						
					}
					context.lineCap = "round";
					context.lineJoin = "round";					
					context.beginPath();
					context.moveTo(leftPoint + intWidth + 0.5 * fracPadding, vertCenter + fontSize / 12);
					context.lineTo(leftPoint + intWidth + fractionWidth + 1.5 * fracPadding, vertCenter + fontSize / 12);
					context.closePath();
					context.stroke();
					
					//draw denominator
					if (parse3.empty == true) {
						textLoc[q][3][0][0] = drawSpacingBox({left: denomLeft, top: denomTop + height * 0.05, width: 0.6 * fontSize, height: 0.6 * fontSize, fontSize: 0.7 * fontSize});
						if (parse3.selected !== null) selected = parse3.selected;
					} else {
						var drawObj = drawMathsText(context, denominator, fracFontSize, denomLeft, denomCenter, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][3] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.7;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;												
					}
				
					context.restore();
				}
				
				
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
			
			} else if (textArray[q][0] == 'lim') {
				// -----------------------------------------------
				//
				//                      LIMITS 
				//
				// -----------------------------------------------
			
				var numFontSize = 0.5 * fontSize;
				var padding = 0.1 * fontSize;
				var numWidth = 0;
				var numHeight = 0;
				var num = textArray[q][1];
				var innWidth;
				var innHeight;
				var innerText = textArray[q][2];
				var limWidth;
				var linHeight;
				
				var parse1 = parseText(num);
				var parse2 = parseText(innerText);				
				
				//measure num
				if (parse1.empty == true) {
					numWidth = fontSize * 0.5;
					numHeight = fontSize * 0.5;
				} else {
					if (typeof num == 'string') {
						num = [num];
					}
					var numMeasure = drawMathsText(context, num, numFontSize, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					numWidth = numMeasure[0]; 
					numHeight = numMeasure[1];
				}
				
				//measure 'lim'
				var limMeasure = drawMathsText(context,['lim'],fontSize,limLeft,vertCenter,false,[],'left','middle',textColor,'measure','none',false,false,fontName,selected, sf, backgroundColor, fracScale, algPadding);
				limWidth = limMeasure[0]; 
				limHeight = limMeasure[1];
				
				//measure innerText
				if (parse2.empty == true) {
					innWidth = fontSize * 0.7;
					innHeight = fontSize * 0.8;
				} else {
					if (typeof innerText == 'string') {
						innerText = [innerText];
					}
					var numMeasure = drawMathsText(context, innerText, numFontSize, leftPoint, vertCenter, algText, [], 'left', 'bottom', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
					innWidth = numMeasure[0]; 
					innHeight = numMeasure[1];
				}
				
				var maxWidth = Math.max(numWidth,limWidth);
				
				var numLeft = leftPoint + maxWidth * 0.5 - numWidth * 0.5;
				var numCenter = vertCenter + 0.6 * limHeight + 0.5 * numHeight;
				var numTop = numCenter - 0.5 * numHeight;

				var limLeft = leftPoint + maxWidth * 0.5 - limWidth * 0.5;
				
				var elementWidth = maxWidth + innWidth + 2*padding;
				var elementTop = Math.min(top,vertCenter-0.5*limHeight,vertCenter-0.5*innHeight);
				var elementBottom = Math.max(bottom,numCenter+0.5*numHeight,vertCenter+0.5*innHeight);	
				
				if (mode2 == 'draw') {
					textLoc[q] = [];
					textLoc[q][1] = [];
					textLoc[q][1][0] = [];
					textLoc[q][2] = [];
					textLoc[q][2][0] = [];
					if (backColor !== 'none') backColorMe(context,{left:leftPoint,top:elementTop-2,width:elementWidth,height:elementBottom-elementTop+4});
					context.save();
					context.font = fracFont;
					context.fillStyle = textColor;
						
					// draw num
					if (parse1.empty == true) {
						textLoc[q][1][0][0] = drawSpacingBox({left:numLeft,top:numTop,width:0.5*fontSize,height:0.5*fontSize,fontSize:0.5*fontSize});
						if (parse1.selected !== null) selected = parse1.selected;
					} else {
						context.save();
						var drawObj = drawMathsText(context, num, numFontSize, numLeft, numCenter, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][1] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize / 0.5;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
						context.restore();
					}
					
					// draw innerText
					if (parse2.empty == true) {
						textLoc[q][2][0][0] = drawSpacingBox({left:leftPoint+maxWidth+padding,top:vertCenter-0.4*fontSize,width:0.7*fontSize, height:0.8*fontSize,fontSize:0.8*fontSize});
						if (parse2.selected !== null) selected = parse2.selected;
					} else {
						context.save();
						var drawObj = drawMathsText(context, innerText, fontSize, leftPoint+maxWidth+padding, vertCenter, algText, [], 'left', 'middle', textColor, 'draw', backColor, bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
						textLoc[q][2] = drawObj.textLoc;
						bold = drawObj.bold;
						italic = drawObj.italic;
						fontName = drawObj.font;
						fontSize = drawObj.fontSize;
						textColor = drawObj.color;
						backColor = drawObj.backColor;
						selected = drawObj.selected;						
						context.restore();
					}

					// draw 'lim'
					drawMathsText(context,['lim'],fontSize,limLeft,vertCenter,false,[],'left','middle',textColor,'draw','none',false,false,fontName,selected, sf, backgroundColor, fracScale, algPadding);
				}
				
				leftPoint += elementWidth;
				top = elementTop;
				bottom = elementBottom;
			
			} else {
				context.save();
				inner = textArray[q];
								
				var ele1 = drawMathsText(context, textArray[q], fontSize, 0, 0, false, [], 'left', 'middle', '#000', 'measure', 'none', bold, italic, fontName, selected, sf, backgroundColor, fracScale, algPadding);
				elemWidth = ele1[0];

				if (mode2 == 'draw') {
					var drawObj = drawMathsText(context, textArray[q], fontSize, leftPoint, vertCenter, false, [], 'left', 'center', textColor, 'draw', backColor, bold, italic, fontName,selected, sf, backgroundColor, fracScale, algPadding);
					textLoc[q] = drawObj.textLoc;
					bold = drawObj.bold;
					italic = drawObj.italic;
					fontName = drawObj.font;
					fontSize = drawObj.fontSize;
					textColor = drawObj.color;
					backColor = drawObj.backColor;
					selected = drawObj.selected;
				}
				leftPoint += elemWidth;
			}
		}
		width = leftPoint;
		height = bottom - top;
		//console.log(textLoc);
		if (mode2 == 'draw' || mode == 'measure') {mode2 = 'done';} else {mode2 = 'draw';} 
	}
	if (typeof timeLog !== 'undefined' && timeLog == true) {
		var d2 = new Date;
		var t2 = d2.getTime();
		console.log('drawMathsText ctx:' + context + ', ' + (t2 - t1) + 'ms taken');
	}
	if (mode == 'draw') {
		if (logMathsTextLoc == true) {
			console.log('return:',textLoc);
		};	
		logMathsTextLoc = false;
		//console.log(textLoc);
		return {textLoc:textLoc,bold:bold,italic:italic,font:fontName,fontSize:fontSize,color:textColor,backColor:backColor,selected:selected,tightRect:tightRect};
	}
	if (mode == 'measure') {return [width, height, top, bottom]}
}

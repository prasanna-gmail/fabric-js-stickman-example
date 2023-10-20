//js
function text(object) {
	// Required
	var context = object.context || object.ctx;
	var textArray = object.textArray || object.text || [];
	
	// mode
	var measureOnly = boolean(object.measureOnly,false);
	var sf = object.sf || 1;
	
	// Text styling
	var startFont = object.font || 'Arial';
	var startFontSize = object.fontSize || object.size || 20;
	var startColor = object.color || '#000';
	var startBackColor = object.backColor || 'none';	
	var startBold = boolean(object.bold, false);
	var startItalic = boolean(object.italic, false);
	var tabWidth = object.tabWidth || 20;
	
	// Text Placing, Spacing & Alignment
	var left = object.left || 0;
	var top = object.top || 0;
	var maxWidth = object.maxWidth || object.width || context.canvas.width - left;
	var maxHeight = object.maxHeight || object.height || context.canvas.height - top;
	var align = object.align || object.textAlign || object.horizAlign || 'left';
	var vertAlign = object.vertAlign || 'top';	
	var allowSpaces = boolean(object.allowSpaces,false);
	
	var minTightWidth = object.minTightWidth || 50;
	var minTightHeight = object.minTightHeight || 50;	
	
	var alignEquals = boolean(object.alignEquals, false);
	var equalsCenter = object.equalsLeft || left + 0.5 * maxWidth;
	
	var lineSpacingFactor = object.lineSpacingFactor || 1.2;
	var spacingStyle = object.spacingStyle || 'variable'; // fixed or variable line spacing?
	
	var fitToRect = boolean(object.fitToRect, false);
	var fitPadding = object.fitPadding || 15;
	
	var box = {};
	if (typeof object.box !== 'object') {
		box.type = 'none';
		var padding = object.padding || 0;
	} else {
		box.type = object.box.type || 'loose';
		// type 'loose' draws rectangular border around left,top,maxWidth,maxHeight
		// type 'tight' draws rectangular border tightly around the actual text with padding
		box.color = object.box.color || object.box.backgroundColor || '#FFC'; // fill color
		box.borderColor = object.box.borderColor || object.borderColor || '#000';
		box.borderWidth = object.box.borderWidth || object.borderWidth || 4*sf;
		box.dash = object.box.dash || [];
		box.radius = object.box.rounded || object.box.radius || 0;
		var padding = object.box.padding || object.padding || 10*sf; // for type 'tight' only	
	}
	if (typeof padding == 'undefined') padding = 0;
	
	/*
	// obsolete
	
	if (backgroundColor !== 'none') {
		context.fillStyle = backgroundColor;
		context.fillRect(left, top, maxWidth, maxHeight);	
	}
	
	if (borderColor !== 'none') {
		context.strokeStyle = borderColor;
		context.lineWidth = borderWidth;
		context.strokeRect(left+0.5*borderWidth, top+0.5*borderWidth, maxWidth-0.5*borderWidth, maxHeight-0.5*borderWidth);	
	}
	
	
	//
	*/
	
	if (fitToRect == true) {
		left += fitPadding;
		top += fitPadding;
		maxWidth -= 2 * fitPadding;
		maxHeight -= 2 * fitPadding;	
	}

	// these are variable within this function
	var font = startFont;
	var fontSize = startFontSize*sf;
	var color = startColor;
	var bold = startBold;
	var italic = startItalic;
	var backColorOn = false;
	var backColor = startBackColor;
	var selected = false;	

	// this section sorts out the word wrapping, creating the array of objects: textLine
	var currLine = -1;
	var textLine = [];
	newTextLine();
	
	var textBlock = false;
	var textBlockArray = [];
	var textBlockWidth = 0;
	var textBlockHeight = 0;
	
	var maxWordWidth = 0;
	
	var hardBreak = true; // keep track of text to the right of <<br>>
	
	/*if (fitToRect == true) {
		fontSize = 82;
		// fit the text to rectangle
		do {
			fontSize -= 2;
			currLine = -1;
			textLine = [];
			newTextLine()
			textBlock = false;
			textBlockArray = [];
			textBlockWidth = 0;
			textBlockHeight = 0;
			createTextLines();
			var totalLineHeight = 0;
			var maxLineHeight = 0;
			var lineCount = 0;
			for (var line = 0; i < textLine.length; i++) {
				if (textLine[line].height > 0) {
					totalLineHeight += textLine[line].height * lineSpacingFactor;
					maxLineHeight = Math.max(maxLineHeight, textLine[line].height * lineSpacingFactor);
					lineCount++;
				}
			}
			if (spacingStyle == 'fixed') {
				totalLineHeight = maxLineHeight * (lineCount + 1);
			}
			totalLineHeight += fitPadding;
			var excessVertSpace = maxHeight - totalLineHeight;
		} while (totalLineHeight > maxHeight && fontSize > 5);
		console.log(excessVertSpace);
		numOfLines = lineCount;
		top += 0.5 * (maxHeight - totalLineHeight - fitPadding);
		//context.fillStyle = '#F0F';
		//context.fillRect(left,top,maxWidth,maxHeight);
		
	} else {*/
		createTextLines();
	//}
	
	function newTextLine(isBreak) {
		if (!isBreak) {
			isBreak = false;
			hardBreak = false;
		} else {
			hardBreak = true;
		}
		currLine++;
		textLine[currLine] = {text:[],x:0,align:align,width:0,height:0,font:font,fontSize:fontSize,color:color,bold:bold,italic:italic,backColor:backColor,isBreak:isBreak,selected:selected};
		/*if (backColorOn == true) {
			textLine[currLine].backColor.push([backColor,0]);
		}*/
	}
	
	function markupTag(element2,isTagInElement) {
		var inElement = boolean(isTagInElement,false);
		// handles markup tags
		if (element2.indexOf('<<br>>') == 0) {
			newTextLine(true);
		} else if (element2.indexOf('<<align:') == 0) {
			if (element2.indexOf('left') > -1) align = 'left';
			if (element2.indexOf('cent') > -1) align = 'center';
			if (element2.indexOf('right') > -1) align = 'right';
			// loop back through lines until <<br>> or beginning and set align
			var i = currLine + 1;
			do {
				i--;
				textLine[i].align = align;
			} while (i > 0 && textLine[i].isBreak == false);						
		/*} else if (element2.indexOf('<<blockstart') == 0) {
			textBlock = true;
			textBlockWidth = 0;
			textBlockHeight = 0;
			textBlockArray = [];
		} else if (element2.indexOf('<<blockend') == 0) {
			textBlock = false;
			if ((textLine[currLine].width + textBlockWidth) <= maxWidth) {
				textLine[currLine].text = textLine[currLine].text.concat(textBlockArray);
				textLine[currLine].width += textBlockWidth;
				textLine[currLine].height = Math.max(textLine[currLine].height, textBlockHeight);	
			} else {
				newTextLine()
				textLine[currLine].text = textLine[currLine].text.concat(textBlockArray);
				textLine[currLine].width += textBlockWidth;
				textLine[currLine].height = Math.max(textLine[currLine].height, textBlockHeight);
				if (textLine[currLine].width >= maxWidth) {
					newTextLine()								
				}
			}*/					
		} else if (element2.indexOf('<<font:') == 0) {
			font = element2.slice(7,-2);
		} else if (element2.indexOf('<<fontSize:') == 0) {
			fontSize = Number(element2.slice(11,-2))*sf;
		} else if (element2.indexOf('<<color:') == 0) {
			color = element2.slice(8,-2);						
		} else if (element2.indexOf('<<bold:') == 0) {
			if (element2.indexOf('true') > -1) bold = true;
			if (element2.indexOf('false') > -1) bold = false;
		} else if (element2.indexOf('<<italic:') == 0) {
			if (element2.indexOf('true') > -1) italic = true;
			if (element2.indexOf('false') > -1) italic = false;
		} else if (element2.indexOf('<<selected:') == 0) {
			if (element2.indexOf('true') > -1) selected = true;
			if (element2.indexOf('false') > -1) selected = false;
		} else if (element2.indexOf('<<backColor:') == 0) {
			if (element2.indexOf('none') > -1) {
				backColor = 'none';
				/*if (backColorOn == true) {
					//console.log(textLine[currLine].backColor,textLine[currLine].backColor.length-1,textLine[currLine].backColor[textLine[currLine].backColor.length-1])
					textLine[currLine].backColor[textLine[currLine].backColor.length-1].push(textLine[currLine].width);	
					backColorOn = false;
				}*/
			} else {
				backColor = element2.slice(12,-2);
				//if (backColorOn == true) {
					//textLine[currLine].backColor[textLine[currLine].backColor.length-1].push(textLine[currLine].width);
					//textLine[currLine].backColor.push([backColor, textLine[currLine].width]);
				//} else {
					//textLine[currLine].backColor.push([backColor, textLine[currLine].width]);
				//}
				//backColorOn = true;
			}
		}
		if (inElement == false) textLine[currLine].text.push(element2);	
	}
	
	function stringHandler(element3) {
		// handles string elements
		if (textBlock == true) {
			var styledElem = ['<<font:'+font+'>>', '<<fontSize:'+fontSize+'>>', '<<bold:'+bold+'>>', '<<italic:'+italic+'>>', '<<color:'+color+'>>', '<<backColor:'+backColor+'>>', '<<selected:'+selected+'>>', element3]
			var elemMeasure = drawMathsText(context, styledElem, fontSize, left, top, false, [], align, 'middle', color, 'measure');
			textBlockWidth += elemMeasure[0];
			maxWordWidth = Math.min(maxWordWidth,elemMeasure[0]);
			textBlockHeight = Math.max(textBlockHeight, elemMeasure[1]);
			textBlockArray.push(element3);
		} else {
			var counter = 0;
			
			// split spaces and words into an array
			var splitPoints2 = [0];
			for (var ch6 = 0; ch6 < element3.length; ch6++) {
				if (element3[ch6] == ' ') {
					splitPoints2.push(ch6);	
				} else if (element3[ch6-1] == ' ') {
					splitPoints2.push(ch6);
				}
			}
			splitPoints2.push(element3.length);
			var splitT2 = [];
			for (var elem2 = 0; elem2 < splitPoints2.length - 1; elem2++) {
				splitT2.push(element3.slice(splitPoints2[elem2],splitPoints2[elem2+1]));	
			}
								
			var words1 = splitT2;
			var words2 = [];
			var words1Measure = [];
			var words2Measure = [];
			
			for (var word = 0; word < words1.length; word++) {
				var styledWord = ['<<font:'+font+'>>', '<<fontSize:'+fontSize+'>>', '<<bold:'+bold+'>>', '<<italic:'+italic+'>>', '<<selected:'+selected+'>>', words1[word]]
				words1Measure[word] = drawMathsText(context, styledWord, fontSize, left, top, false, [], align, 'middle', color, 'measure');
				maxWordWidth = Math.max(maxWordWidth,words1Measure[word][0]);
			}
			
			while (words1.length > 0) { 
				
				// find words that will fit onto the current line - move excess words to words2
				
				var lineWidth = textLine[currLine].width;
				var lineHeight = 0;
				var wordString = '';

				if (hardBreak == false) { // don't allow spaces at the beginning of the line unless at start of text, or after <<br>>
					while (typeof words1[0] !== 'undefined' && words1[0] == " ") {
						words1.shift();
					}
				}				
				
				for (var word = 0; word < words1.length; word++) {
					if ((lineWidth + words1Measure[word][0]) < maxWidth - 2 * padding) {
						if (!(allowSpaces == false && words1[word] == " ") || lineWidth > 0) { // don't display spaces at the beginning of lines
							lineWidth += words1Measure[word][0];
							lineHeight = Math.max(lineHeight, words1Measure[word][1]);
							wordString += words1[word];
						}
					} else {
						for (var word1 = words1.length - 1; word1 >= word; word1--) {
							words2.unshift(words1[word1]);
							words2Measure.unshift(words1Measure[word1]);
							words1.pop();
							words1Measure.pop();
						}
						break;
					}
				}
				
				// if words1 has words in
				if (words1.length > 0 && !(allowSpaces == false && arraysEqual(words1,[" "]) == true)) {
					textLine[currLine].text.push(wordString);
					textLine[currLine].width = lineWidth;
					textLine[currLine].height = Math.max(textLine[currLine].height, lineHeight);
				}
				
				//if words1 is empty and words2 isn't and the line is empty
				if ((words1.length == 0 || (allowSpaces == false && arraysEqual(words1,[" "]) == true)) && words2.length > 0 && arraysEqual(words2,[""]) == false && textLine[currLine].width == 0) {
					textLine[currLine].text.push(words2[0]);
					textLine[currLine].width = words2Measure[0][0];
					textLine[currLine].height = words2Measure[0][1];
					words2 = words2.slice(1);
					words2Measure = words2Measure.slice(1);
				}
				
				if (words2.length > 0 && arraysEqual(words2,[""]) == false && !(allowSpaces == false && arraysEqual(words2,[" "]) == true)) {
					newTextLine()
				}
				
				words1 = words2;
				words1Measure = words2Measure;
				words2 = [];
				words2Measure = [];
								
				counter++;
				if (counter >= 500) break; //failSafe
			}
		}		
	}
		
	function arrayHandler(element4) {
		//console.log(JSON.stringify(element4));
		if (textBlock == true) {
			var styledElem = ['<<font:'+font+'>>','<<fontSize:'+fontSize+'>>','<<bold:'+bold+'>>','<<italic:'+italic+'>>','<<selected:'+selected+'>>','<<color:'+color+'>>','<<backColor:'+backColor+'>>']
			styledElem = styledElem.concat(element4);
			var elemMeasure = drawMathsText(context, styledElem, fontSize, left, top, false, [], align, 'middle', color, 'measure');
			textBlockWidth += elemMeasure[0];
			textBlockHeight = Math.max(textBlockHeight, elemMeasure[1]);
			textBlockArray.push(element4);			
		} else {
			var styledElement = ['<<font:'+font+'>>','<<fontSize:'+fontSize+'>>','<<bold:'+bold+'>>','<<italic:'+italic+'>>','<<color:'+color+'>>','<<backColor:'+backColor+'>>','<<selected:'+selected+'>>', element4];
			var elementSize = drawMathsText(context, styledElement, fontSize, left, top, false, [], align, 'middle', color, 'measure');
			var elementWidth = elementSize[0];
			var elementHeight = elementSize[1];
			if (textLine[currLine].width + elementWidth <= maxWidth) {
				textLine[currLine].text.push(element4);
				textLine[currLine].width += elementWidth;
				textLine[currLine].height = Math.max(textLine[currLine].height, elementHeight);
			} else {
				newTextLine();
				textLine[currLine].text.push(element4);
				textLine[currLine].width += elementWidth;
				textLine[currLine].height = Math.max(textLine[currLine].height, elementHeight);
				if (elementWidth >= maxWidth) {
					newTextLine();
				}
			}
			
			function arrayHandler2(arr) {
				for (var i = 0; i < arr.length; i++) {
					if (typeof arr[i] == 'object') {
						arrayHandler2(arr[i]);							
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
			// deal with markup tags inside elements		
			arrayHandler2(element4);
		}
		//console.log('textLine[currLine].text:',JSON.stringify(textLine[currLine].text));	
	}

	function createTextLines() {
		for (var element = 0; element < textArray.length; element++) {
			//console.log('element '+element+':',element);
			if (typeof textArray[element] == 'string') {
				var splitT = splitMarkup(textArray[element]);
				for (var splitElem = 0; splitElem < splitT.length; splitElem++) {
					if (splitT[splitElem].indexOf('<<') == 0) {
						markupTag(splitT[splitElem]);
					} else {
						stringHandler(splitT[splitElem]);
					}
				}
			} else {
				arrayHandler(textArray[element]);
			}
		}		
	}	
	
	//console.log('text(), textArray:',JSON.stringify(textArray));
	//var str = JSON.stringify(textLine,false,2);
	//if (textLine.length >= 0 && str.indexOf('123') >= 0) console.log('textLine:',JSON.stringify(textLine,false,2));
	
	//var spacingArray = [];
	var maxLineHeight = 0;
	var totalLineHeight = 0;
	
	for (var line = 0; line < textLine.length; line++) {
		// test for spaces at the end of line and remove
		if (allowSpaces == false) {
			for (var eleme = textLine[line].text.length-1; eleme >= 0; eleme--) {
				if (typeof textLine[line].text[eleme] == 'string' && textLine[line].text[eleme].length > 0 && textLine[line].text[eleme].indexOf('<<') == -1) {
					if (textLine[line].text[eleme][textLine[line].text[eleme].length-1] == " ") {
						textLine[line].text[eleme] = textLine[line].text[eleme].slice(0,textLine[line].text[eleme].length-1);
						// get the width of this space and reduce line width
						font = textLine[line].font;
						fontSize = textLine[line].fontSize;
						bold = textLine[line].bold;
						italic = textLine[line].italic;
						// work forwards through line to get the styling at the point of the space
						for (var elem2 = 0; elem2 < eleme; elem2++) {
							if (typeof textLine[line].text[elem2] == 'string' && textLine[line].text[elem2].indexOf('<<') == 0) {
								markupTag(textLine[line].text[elem2]);	
							}
						}
						var styledText = ['<<font:'+font+'>>','<<fontSize:'+fontSize+'>>','<<bold:'+bold+'>>','<<italic:'+italic+'>>','<<selected:'+selected+'>>','<<backColor:'+backColor+'>>',' '];
						var spaceWidth = drawMathsText(context, styledText, fontSize, left, top, false, [], align, 'middle', color, 'measure')[0];
						textLine[line].width -= spaceWidth;
					}
					break;
				} else if (typeof textLine[line].text[eleme] == 'object') {
					break;
				}
			}
		}
				
		// fix x
		if (textLine[line].align == 'left') {textLine[line].x = padding;}
		if (textLine[line].align == 'center') {textLine[line].x = left + 0.5 * maxWidth;}
		if (textLine[line].align == 'right') {textLine[line].x = left + maxWidth - padding;}
		
		// sort relative vertical spacing (assuming variable)
		if (line > 0) { 
			textLine[line].relY = textLine[line-1].relY + (0.5 * textLine[line-1].height + 0.5 * textLine[line].height) * lineSpacingFactor;
		} else {
			textLine[line].relY = 0.5 * textLine[line].height * lineSpacingFactor;
		}
		maxLineHeight = Math.max(maxLineHeight, textLine[line].height);
		totalLineHeight += textLine[line].height * lineSpacingFactor;
	}
	
	if (spacingStyle == 'fixed') {
		for (var line = 0; line < textLine.length; line++) {
			textLine[line].relY = (line + 0.5) * maxLineHeight * lineSpacingFactor;
		}
		totalLineHeight = textLine.length * maxLineHeight * lineSpacingFactor;
	}

	/*
	if (fitToRect == true) {
		for (var line = 0; line < textLine.length; line++) {
			textLine[line].x += fitPadding;
			textLine[line].y = fitPadding + top + (line + 0.5) * (maxHeight / numOfLines);
		}				
	}
	*/
	
	// work out where the top of the text will actually be
	var topPos = top + padding;
	
	if (vertAlign !== 'top' && typeof textLine[0] !== 'undefined') {
		if (vertAlign == 'middle') {
			topPos = top + 0.5 * maxHeight - 0.5 * totalLineHeight;
		} else if (vertAlign == 'bottom') {
			topPos = top + maxHeight - padding - totalLineHeight;	
		}
	}
	
	if (alignEquals == true) {
		var leftOfEqualsWidth = [];
		var rightOfEqualsWidth = [];
		var equalsWidth = [];
		for (var line = 0; line < textLine.length; line++) {
			var leftOfEquals = [];
			var rightOfEquals = [];
			var equalsFound = false;
			// locate equals sign in each line
			for (var elem = 0; elem < textLine[line].text.length; elem++) {
				if (equalsFound == true) {
					rightOfEquals.push(textLine[line].text[elem]);
				} else {
					if (typeof textLine[line].text[elem] == 'string') {
						var equalsPos;
						for (var pos = 0; pos < textLine[line].text[elem].length; pos++) {
							if (textLine[line].text[elem][pos] == "=") {
								equalsPos = pos;
								equalsFound = true;
							}
						}
						if (equalsFound == true) {
							leftOfEquals.push(textLine[line].text[elem].slice(0, equalsPos));
							rightOfEquals.push(textLine[line].text[elem].slice(equalsPos+1));
						} else {
							leftOfEquals.push(textLine[line].text[elem]);	
						}
					} else {
						leftOfEquals.push(textLine[line].text[elem]);
					}
				}
			}
			if (equalsFound == true) {
				// measure left of equals sign
				var styledLine1 = leftOfEquals.slice(0);
				styledLine1.unshift('<<font:'+textLine[line].font+'>><<fontSize:'+textLine[line].fontSize+'>><<bold:'+textLine[line].bold+'>><<italic:'+textLine[line].italic+'>><<color:'+textLine[line].color+'>><<selected:'+selected+'>>');
				leftOfEqualsWidth[line] = drawMathsText(context, styledLine1, fontSize, x, y, false, [], textLine[line].align, 'middle', '#000', 'measure')[0];
				
				// measure equals sign
				styledLine1.push("=");
				equalsWidth[line] = drawMathsText(context, styledLine1, fontSize, x, y, false, [], textLine[line].align, 'middle', '#000', 'measure')[0] - leftOfEqualsWidth[line];
				
				// measure right of equals sign
				styledLine1 = styledLine1.concat(rightOfEquals);
				rightOfEqualsWidth[line] = drawMathsText(context, styledLine1, fontSize, x, y, false, [], textLine[line].align, 'middle', '#000', 'measure')[0] - equalsWidth[line] - leftOfEqualsWidth[line];	
				
				// loop through rows and set x value accordingly
				textLine[line].alignEquals = true;	
				textLine[line].align = 'left';
				textLine[line].x = equalsCenter - 0.5 * equalsWidth[line] - leftOfEqualsWidth[line];
								
			} else {
				textLine[line].alignEquals = false;	
			}
		}
	}

	// calc tight rect
	if (textLine[0].align == 'left') {
		var l = left + textLine[0].x - padding;
		var r = left + textLine[0].x + textLine[0].width + padding;
	} else if (textLine[0].align == 'center') {
		var l = textLine[0].x - 0.5 * textLine[0].width - padding;
		var r = textLine[0].x + 0.5 * textLine[0].width + padding;
	} else if (textLine[0].align == 'right') {
		var l = textLine[0].x - textLine[0].width - padding;
		var r = textLine[0].x + padding;
	}
	var t = topPos - padding;
	var b = topPos + totalLineHeight + padding;
	for (var i = 1; i < textLine.length; i++) {
		if (textLine[i].align == 'left') {
			l = Math.min(l, left + textLine[i].x - padding);
			r = Math.max(r, left + textLine[i].x + textLine[i].width + padding);
		} else if (textLine[i].align == 'center') {
			l = Math.min(l, textLine[i].x - 0.5 * textLine[i].width - padding);
			r = Math.max(r, textLine[i].x + 0.5 * textLine[i].width + padding);
		} else if (textLine[i].align == 'right') {
			l = Math.min(l, textLine[i].x - textLine[i].width - padding);
			r = Math.max(r, textLine[i].x + padding);
		}
	}
	if (r - l < minTightWidth) {
		var alterBy = minTightWidth - (r - l);
		l -= alterBy / 2;
		r += alterBy / 2;
	}
	if (b - t < minTightHeight) {
		var alterBy = minTightHeight - (b - t);
		t -= alterBy / 2;
		b += alterBy / 2;		
	}
	var tightRect = [l,t,r-l,b-t];

	if (box.type == 'loose') {
		roundedRect(context,left,top,maxWidth,maxHeight,box.radius,box.borderWidth,box.borderColor,box.color,box.dash);
	} else if (box.type == 'tight') {
		roundedRect(context,l,t,r-l,b-t,box.radius,box.borderWidth,box.borderColor,box.color,box.dash);
	}

	var returnTextLoc = [];
	var returnTextArray = [];
	var returnBreakPoints = [];
	var totalTextWidth = 0;
	
	for (var line = 0; line < textLine.length; line++) {
		totalTextWidth += textLine[line].width;
		font = textLine[line].font;
		fontSize = textLine[line].fontSize/sf;
		color = textLine[line].color;
		backColor = textLine[line].backColor || 'none';
		bold = textLine[line].bold;
		italic = textLine[line].italic;
		selected = textLine[line].selected;
		var styledLine = textLine[line].text;
		var styling = '<<font:'+textLine[line].font+'>><<fontSize:'+(textLine[line].fontSize/sf)+'>><<bold:'+textLine[line].bold+'>><<italic:'+textLine[line].italic+'>><<color:'+textLine[line].color+'>><<backColor:'+backColor+'>><<selected:'+selected+'>>';
		var stylingChars = styling.length;
		
		//console.log(line,'textLine['+line+'].text:',textLine[line].text);
		//console.log('styling:',styling,stylingChars);
		
		styledLine.unshift(styling);
		var y = topPos + textLine[line].relY;
		var x = left + padding;
		if (textLine[line].align == 'center') {x = left + 0.5 * maxWidth};
		if (textLine[line].align == 'right') {x = left + maxWidth - padding};
		if (alignEquals == true && textLine[line].alignEquals == true) {
			x = textLine[line].x;
		}
		
		/*
		// draw background colors for this line
		for (var i = 0; i < textLine[line].backColor.length; i++) {
			var colorLeft = textLine[line].backColor[i][1];
			var colorWidth;
			if (textLine[line].backColor[i].length > 2) {
				colorWidth = textLine[line].backColor[i][2] - colorLeft;	
			} else {
				colorWidth = textLine[line].width - colorLeft;
			}
			if (textLine[line].align == 'center') {colorLeft -= 0.5 * textLine[line].width};
			if (textLine[line].align == 'right') {colorLeft -= textLine[line].width};
			var colorHeight = textLine[line].height * 1.1;// * (lineSpacingFactor + 1) / 2;
			//console.log(line,x+colorLeft,y-0.5*textLine[line].height,colorWidth,textLine[line].height);
			context.fillStyle = textLine[line].backColor[i][0];
			context.fillRect(x+colorLeft,y+0*textLine[line].height,colorWidth,colorHeight);
		}
		*/
		
		/*
		context.strokeStyle = '#000';
		context.beginPath();
		context.moveTo(left,textLine[line].y);
		context.lineTo(left+maxWidth,textLine[line].y);
		context.closePath();
		context.stroke();
		*/
				
		// find any adjacent text blocks and combine them
		function combineSpaces(array) {
			if (array.length > 1) {
				for (var gg = array.length - 1; gg >= 0; gg--) {
					//console.log(gg, array[gg], typeof array[gg]);
					if (typeof array[gg] == 'object') {
						arrayString += '[' + gg + ']';
						combineSpaces(array[gg]);
					} else {
						if (gg < array.length - 1 && typeof array[gg] == 'string' && typeof array[gg+1] == 'string') {
							//eval('array' + arrayString + '[' + gg + '] += array' + arrayString + '[' + (gg+1) + ']');
							//eval('array' + arrayString + '.splice(gg+1, 1);');
							// changed this  from above to below as it was breaking stuff ?? 29/3/16
							array[gg] += array[gg+1];
							array.splice(gg+1,1);;
						}
					}
				}
			}
			arrayString = arrayString.slice(0, arrayString.lastIndexOf('[') - arrayString.length);
			return array;
		}

		//if (textLine.length > 1) console.log(line,styledLine);
		styledLine = combineSpaces(styledLine);
		//console.log(line,'combinedSpaces:',styledLine);
		
		//console.log(line,'styledLine',styledLine);
		var textLoc2 = drawMathsText(context,styledLine,fontSize,x,y,false,[],textLine[line].align,'middle',undefined,undefined,undefined,undefined,undefined,undefined,undefined,sf).textLoc;
		
		
		//console.log('-',textLoc2[0].length,stylingChars);
		
		// remove textLoc positions of stylingChars
		textLoc2[0].splice(1,stylingChars);

		//console.log('--',textLoc2[0].length,stylingChars);

		
		// get map of textLocs
		var textLoc2Map = mapArray(textLoc2,true);		
		//console.log(textLoc2Map.length);
		
		if (returnTextLoc.length > 0) {
			// get last element of returnTextLoc and concat textLoc2[0]
			var lastElement = returnTextLoc[returnTextLoc.length-1].concat(textLoc2[0]);
			returnTextLoc[returnTextLoc.length-1] = lastElement;
			// then concat textLoc2[1]...etc to returnTextLoc
			textLoc2.shift();
			returnTextLoc = returnTextLoc.concat(textLoc2);
		} else {
			returnTextLoc = textLoc2.slice(0);
		}
		
		if (returnBreakPoints.length == 0) {
			returnBreakPoints.push(textLoc2Map.length);	
		} else {
			returnBreakPoints.push(returnBreakPoints[returnBreakPoints.length - 1] + textLoc2Map.length);
		}
		returnTextArray = returnTextArray.concat(styledLine);
	}
	//console.log('returnBreakPoints:',returnBreakPoints);
	//console.log(tightRect);
	//console.log({textArray:returnTextArray,textLoc:returnTextLoc,breakPoints:returnBreakPoints,tightRect:tightRect,totalTextWidth:totalTextWidth,maxWordWidth:maxWordWidth});
	return {textArray:returnTextArray,textLoc:returnTextLoc,breakPoints:returnBreakPoints,tightRect:tightRect,totalTextWidth:totalTextWidth,maxWordWidth:maxWordWidth};
}
function splitMarkup(element1) {
	// seperates markup tags from other text
	var splitAt = [0];
	for (var ch3 = 0; ch3 < element1.length; ch3++) {
		if (element1.slice(ch3).indexOf('<<') == 0 && element1.slice(ch3).indexOf('<<<') !== 0) {
			for (var ch4 = ch3; ch4 < element1.length; ch4++) {
				if (element1.slice(ch4).indexOf('>>') == 0) {
					splitAt.push(ch3,ch4+2);
					break;
				}
			}
		}
	}
	splitAt.push(element1.length);
	var returnArray = [];
	for (var ch5 = 0; ch5 < splitAt.length-1; ch5++) {
		returnArray.push(element1.slice(splitAt[ch5],splitAt[ch5+1]))
	}
	return returnArray;
}
function reduceTags(textArray) {
	var bold = {value:null,char:true};
	var italic = {value:null,char:true};
	var fontSize = {value:null,char:true};	
	var font = {value:null,char:true};
	var color = {value:null,char:true};
	var backColor = {value:null,char:true};
	var align = {set:false};
	var selected = {value:null};
	
	function arrayHandler(array) {
		for (var l = array.length - 1; l >= 0; l--) {
			if (typeof array[l] == 'string') {
				array[l] = stringHandler(array[l]);
			} else if (typeof array[l] == 'object') {	
				array[l] = arrayHandler(array[l]);
			}
		}
		return array;
	}
	
	function stringHandler(string) {
		// first split string into tag and non-tag elements
		var splitString = splitMarkup(string);
		
		// work backwards through the string looking for tags
		for (var j = splitString.length - 1; j >= 0; j--) {
			if (splitString[j].indexOf('<<') == 0) {
				for (var k = splitString[j].length; k >= 0; k--) {
					var slice = splitString[j].slice(k);
					if (slice.indexOf('<<bold:') == 0) {
						if (bold.char == false) {
							// no characters between tags - remove
							splitString[j] = splitString[j].slice(0,k)+splitString[j].slice(k+slice.indexOf('>>')+2);
						} else {
							var value = splitString[j].slice(k+7,k+splitString[j].slice(k).indexOf('>>')).toLowerCase();
							if (value == bold.value) {
								// repeated tag - !!
							} else {
								// new tag
								bold.value = value;
								bold.char = false;
							}
						}
					} else if (slice.indexOf('<<italic:') == 0) {
						if (italic.char == false) {
							// no characters between tags - remove
							splitString[j] = splitString[j].slice(0,k)+splitString[j].slice(k+slice.indexOf('>>')+2);
						} else {
							var value = splitString[j].slice(k+9,k+splitString[j].slice(k).indexOf('>>')).toLowerCase();
							if (value == italic.value) {
								// repeated tag
							} else {
								// new tag
								italic.value = value;
								italic.char = false;
							}
						}
					} else if (slice.indexOf('<<fontSize:') == 0) {
						if (fontSize.char == false) {
							// no characters between tags - remove
							splitString[j] = splitString[j].slice(0,k)+splitString[j].slice(k+slice.indexOf('>>')+2);
						} else {
							var value = splitString[j].slice(k+11,k+splitString[j].slice(k).indexOf('>>')).toLowerCase();
							if (value == fontSize.value) {
								// repeated tag
							} else {
								// new tag
								fontSize.value = value;
								fontSize.char = false;
							}
						}
					} else if (slice.indexOf('<<font:') == 0) {
						if (font.char == false) {
							// no characters between tags - remove
							splitString[j] = splitString[j].slice(0,k)+splitString[j].slice(k+slice.indexOf('>>')+2);
						} else {
							var value = splitString[j].slice(k+7,k+splitString[j].slice(k).indexOf('>>')).toLowerCase();
							if (value == font.value) {
								// repeated tag
							} else {
								// new tag
								font.value = value;
								font.char = false;
							}
						}						
					} else if (slice.indexOf('<<color:') == 0) {
						if (color.char == false) {
							// no characters between tags - remove
							splitString[j] = splitString[j].slice(0,k)+splitString[j].slice(k+slice.indexOf('>>')+2);
						} else {
							var value = splitString[j].slice(k+8,k+splitString[j].slice(k).indexOf('>>')).toLowerCase();
							if (value == color.value) {
								// repeated tag
							} else {
								// new tag
								color.value = value;
								color.char = false;
							}
						}						
					} else if (slice.indexOf('<<backColor:') == 0) {
						if (backColor.char == false) {
							// no characters between tags - remove
							splitString[j] = splitString[j].slice(0,k)+splitString[j].slice(k+slice.indexOf('>>')+2);
						} else {
							var value = splitString[j].slice(k+12,k+splitString[j].slice(k).indexOf('>>')).toLowerCase();
							if (value == backColor.value) {
								// repeated tag
							} else {
								// new tag
								backColor.value = value;
								backColor.char = false;
							}
						}						
					} else if (slice.indexOf('<<br>>') == 0) {
						align.set = false;
					} else if (slice.indexOf('<<align:') == 0) {
						if (align.set == false) {
							align.set = true;
						} else {
							// remove tag
							splitString[j] = splitString[j].slice(0,k)+splitString[j].slice(k+slice.indexOf('>>')+2);
						}
					} else if (slice.indexOf('<<selected:') == 0) {
						var value = splitString[j].slice(k+11,k+splitString[j].slice(k).indexOf('>>')).toLowerCase();
						//console.log('selected tag',j,k,value,JSON.stringify(splitString[j]));
						if (value == selected.value) {
							// repeated tag
						} else {
							// new tag
							selected.value = value;
						}
					}					
					
				}
			} else {
				if (splitString[j].length > 0) {
					bold.char = true;
					italic.char = true;
					fontSize.char = true;
					font.char = true;
					color.char = true;
					backColor.char = true;
				}
			}
		}
		string = '';
		for (var j = 0; j < splitString.length; j++) string += splitString[j];
		return string;
	}

	if (typeof textArray == 'object') textArray = arrayHandler(textArray);
	//var arrayString = '';
	//console.log('reduceTags()1',JSON.stringify(textArray));
	textArray = combineSpaces2(textArray);
	
	// find any adjacent text blocks and combine them
	function combineSpaces2(textArray) {
		if (textArray.length > 1) {
			for (var gg = textArray.length - 1; gg >= 0; gg--) {
				if (typeof textArray[gg] == 'object') {
					//arrayString += '[' + gg + ']';
					combineSpaces2(textArray[gg]);
				} else {
					if (gg < textArray.length - 1 && typeof textArray[gg] == 'string' && typeof textArray[gg+1] == 'string') {
						eval('textArray[' + gg + '] += textArray[' + (gg+1) + ']');
						eval('textArray.splice(gg+1, 1);');
					}
				}
			}
		}
		//arrayString = arrayString.slice(0, arrayString.lastIndexOf('[') - arrayString.length);
		return textArray;
	}	

	//console.log('reduceTags()2',JSON.stringify(textArray));
	
	return textArray;
}
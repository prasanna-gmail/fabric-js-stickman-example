/*
 *
 *  A canvas to PDF converter. Uses a mock canvas context to build a PDF document.
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Author:
 *  Joshua Gould
 *
 *  Copyright (c) 2017 Joshua Gould
 */

(function (global) {
	'use strict';
	/**
	 * @name canvas2pdf
	 * @namespace
	 */
	var canvas2pdf = (typeof canvas2pdf !== 'undefined') ? canvas2pdf : {};
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = canvas2pdf; // Node
	} else if (typeof define === 'function' && define.amd) {
		define(function () { // AMD module
			return canvas2pdf;
		});
	} else {
		global.canvas2pdf = canvas2pdf; // browser global
	}

	function hex(v) {
		return v < 0x10
		 ? '0' + Math.max(0, v).toString(16)
		 : Math.min(255, v).toString(16);
	};

	function hslToHex(h, s, l, a) {
		h = h % 360 + (h < 0) * 360;
		s = isNaN(h) || isNaN(s) ? 0 : s;
		var m2 = l + (l < 0.5 ? l : 1 - l) * s;
		var m1 = 2 * l - m2;
		return rgbToHex(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2),
			hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), a);
	};

	function hsl2rgb(h, m1, m2) {
		return (h < 60 ? m1 + (m2 - m1) * h / 60
			 : h < 180 ? m2
			 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
			 : m1) * 255;
	};
	var reI = '\\s*([+-]?\\d+)\\s*',
	reN = '\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*',
	reP = '\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*',
	reRgbInteger = new RegExp('^rgb\\(' + [reI, reI, reI] + '\\)$'),
	reRgbPercent = new RegExp('^rgb\\(' + [reP, reP, reP] + '\\)$'),
	reRgbaInteger = new RegExp('^rgba\\(' + [reI, reI, reI, reN] + '\\)$'),
	reRgbaPercent = new RegExp('^rgba\\(' + [reP, reP, reP, reN] + '\\)$'),
	reHslPercent = new RegExp('^hsl\\(' + [reN, reP, reP] + '\\)$'),
	reHslaPercent = new RegExp('^hsla\\(' + [reN, reP, reP, reN] + '\\)$');

	var rgbToHex = function (r, g, b, a) {
		return {
			c: '#' + hex(r) + hex(g) + hex(b),
			a: a
		};
	};

	var fixColor = function (value) {
		if (typeof canvasPdf === 'object' && canvasPdf.greyscale === true) {
			return toGreyscale(value);
		}
		var m;
		var format = (value + '').trim().toLowerCase();
		if ((m = reRgbInteger.exec(format))) { // rgb(255, 0, 0)
			return rgbToHex(m[1], m[2], m[3], 1);
		} else if ((m = reRgbPercent.exec(format))) { // // rgb(100%, 0%, 0%)
			return rgbToHex(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1);
		} else if ((m = reRgbaInteger.exec(format))) { // // rgba(255, 0, 0, 0.5)
			return rgbToHex(m[1], m[2], m[3], m[4]);
		} else if ((m = reRgbaPercent.exec(format))) { // // rgb(100%, 0%, 0%, .2)
			return rgbToHex(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]);
		} else if ((m = reHslPercent.exec(format))) { // // hsl(120, 50%, 50%)
			return hslToHex(m[1], m[2] / 100, m[3] / 100);
		} else if ((m = reHslaPercent.exec(format))) {
			return hslToHex(m[1], m[2] / 100, m[3] / 100, m[4]); // hsla(120, 50%, 50%, 1)
		} else {
			return {
				c: value,
				a: 1
			};
		}
	};
	
	function toGreyscale(value) {
		var m;
		var format = (value + '').trim().toLowerCase();
		if ((m = reRgbInteger.exec(format))) { // rgb(255, 0, 0)
			return rgbaToGreyscale(m[1], m[2], m[3], 1);
		} else if ((m = reRgbPercent.exec(format))) { // // rgb(100%, 0%, 0%)
			return rgbaToGreyscale(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1);
		} else if ((m = reRgbaInteger.exec(format))) { // // rgba(255, 0, 0, 0.5)
			return rgbaToGreyscale(m[1], m[2], m[3], m[4]);
		} else if ((m = reRgbaPercent.exec(format))) { // // rgb(100%, 0%, 0%, .2)
			return rgbaToGreyscale(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]);
		} else if ((m = reHslPercent.exec(format))) { // // hsl(120, 50%, 50%)
			return {
				c:'#ffffff',
				a:1
			};
		} else if ((m = reHslaPercent.exec(format))) {
			return {
				c:'#ffffff',
				a:1
			};
		} else if (typeof value !== 'string' || value === 'none' || (value.length !== 4 && value.length !== 6)) {
			return {
				c:'#ffffff',
				a:1
			};
		} else {
			var rgb = hexToRgb(value);
			if (rgb === null) {
				return {
					c:'#ffffff',
					a:1
				};
			}
			return rgbaToGreyscale(rgb[0],rgb[1],rgb[2],1);
		}
	}
	function rgbaToGreyscale(r,g,b,a) {
		//var m = Math.round((r+g+b)/3);
		var m = parseInt(r*0.299 + g*0.587 + b*0.114);
		return rgbToHex(m,m,m,a);
		//return 'rgba('+m+', '+m+', '+m+', '+a+')';
	}
	function hexToRgb(hex) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
			return r + r + g + g + b + b;
		});
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16)] : null;
	}
	
	/**
	 *
	 * @param stream Stream to write the PDF to.
	 * @param options Options passed to PDFDocument constructor.
	 * @constructor
	 */
	canvas2pdf.PdfContext = function (stream, options) {
		if (stream == null) {
			throw new Error('Stream must be provided.');
		}
		var _this = this;
		var doc = new PDFDocument(options);
		this.stream = doc.pipe(stream);
		this.doc = doc;

		var fontValue = '10px Helvetica';
		this.textAlign = 'left';
		this.textBaseline = 'alphabetic';
		var fontRegex = /^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-,\'\"\sa-z]+?)\s*$/i;
		var defaultFontData = {
			style: 'normal',
			size: 10,
			family: 'Helvetica',
			weight: 'normal',
		};
		var parseFont = function () {
			var fontPart = fontRegex.exec(_this.font);
			if (fontPart === null) {
				return defaultFontData;
			}
			var data = {
				style: fontPart[1] || 'normal',
				size: parseInt(fontPart[4]) || 10,
				family: fontPart[6] || 'Helvetica',
				weight: fontPart[3] || 'normal',
			};
			return data;
		};

		Object.defineProperty(this, 'fillStyle', {
			get: function () {
				return _this.doc.fillColor();
			},
			set: function (value) {
				var color = fixColor(value);
				_this.doc.fillColor(color.c, color.a);
			},
		});
		Object.defineProperty(this, 'strokeStyle', {
			get: function () {
				return _this.doc.strokeColor();
			},
			set: function (value) {
				var color = fixColor(value);
				_this.doc.strokeColor(color.c, color.a);
			},
		});
		Object.defineProperty(this, 'lineWidth', {
			get: function () {
				try {
					return _this.doc.lineWidth();
				} catch(e) {
					return 1;
				}
			},
			set: function (value) {
				if (typeof value !== 'number') return;
				_this.doc.lineWidth(value);
			},
		});

		Object.defineProperty(this, 'lineCap', {
			get: function () {
				return _this.doc.lineCap();
			},
			set: function (value) {
				_this.doc.lineCap(value);
			},
		});
		Object.defineProperty(this, 'lineJoin', {
			get: function () {
				return _this.doc.lineJoin();
			},
			set: function (value) {
				_this.doc.lineJoin(value);
			},
		});

		Object.defineProperty(this, 'globalAlpha', {
			get: function () {
				return _this.doc.opacity();
			},
			set: function (value) {
				(value >= 0.0 && value <= 1.0) && _this.doc.opacity(value);
			},
		});

		Object.defineProperty(this, 'font', {
			get: function () {
				return fontValue;
			},
			set: function (value) {
				fontValue = value;
				var parsedFont = parseFont(value);
				//console.log(parsedFont.size + ' ' + parsedFont.style + ' ' + parsedFont.family + ' ' + parsedFont.weight);
				_this.doc.fontSize(parsedFont.size);
				var font = parsedFont.family;
				//if (font === 'Times New Roman') font = 'TimesNewRoman';
				if (font === 'Times New Roman') font = 'Arial';
				if (font === 'SegoePrint') font = 'segoePrint';
				if (['Helvetica','Arial','Georgia','Hobo','segoePrint','smileymonster','TimesNewRoman','Cambria Math'].indexOf(font) === -1) {
					console.log('Font not found:', font, 'using Arial');
					font = 'Arial';
				}
				if (parsedFont.weight.toLowerCase().indexOf('bold') > -1) {
					if (parsedFont.style.toLowerCase().indexOf('italic') > -1) {
						if (['Arial','Georgia'].indexOf(font) > -1) {
							font += '-bold-italic';
						} else {
							console.log('Font '+font+' has no bold variant');
						}
					} else {
						if (['Arial','Georgia','segoePrint'].indexOf(font) > -1) {
							font += '-bold';
						} else {
							console.log('Font '+font+' has no bold italic variant');
						}
					}
				} else {
					if (parsedFont.style.toLowerCase().indexOf('italic') > -1) {
						if (['Arial','Georgia'].indexOf(font) > -1) {
							font += '-italic';
						} else {
							console.log('Font '+font+' has no italic variant');
						}
					}
				}
				_this.doc.font(font);
				//console.log(_this.doc._font);
				try {
					_this.lineHeight = this.doc.currentLineHeight(false);
				} catch(err) {
					console.log(font,parsedFont,err);
				}
			}
		});
		_this.lineHeight = this.doc.currentLineHeight(false);
		this.font = fontValue;
		this.strokeStyle = 'rgb(0,0,0)';
		this.fillStyle = 'rgb(0,0,0)';
	};
	canvas2pdf.PdfContext.prototype.end = function () {
		this.doc.end();
	};

	canvas2pdf.PdfContext.prototype.save = function () {
		this.doc.save();
	};

	canvas2pdf.PdfContext.prototype.restore = function () {
		this.doc.restore();
	};

	canvas2pdf.PdfContext.prototype.scale = function (x, y) {
		this.doc.scale(x, y);
	};

	canvas2pdf.PdfContext.prototype.rotate = function (angle) {
		var degrees = (angle * 180 / Math.PI);
		this.doc.rotate(degrees);
	};

	canvas2pdf.PdfContext.prototype.translate = function (x, y) {
		this.doc.translate(x, y);
	};

	canvas2pdf.PdfContext.prototype.beginPath = function () {
		// no-op
	};

	canvas2pdf.PdfContext.prototype.moveTo = function (x, y) {
		//console.log('moveTo',x,y);
		if (isNaN(x) || isNaN(y)) return;
		this.doc.moveTo(x, y);
	};

	canvas2pdf.PdfContext.prototype.closePath = function () {
		this.doc.closePath();
	};

	canvas2pdf.PdfContext.prototype.lineTo = function (x, y) {
		//console.log('lineTo',x,y);
		if (isNaN(x) || isNaN(y)) return;
		this.doc.lineTo(x, y);
	};

	canvas2pdf.PdfContext.prototype.stroke = function () {
		//console.log('stroke');
		this.doc.stroke();
	};

	canvas2pdf.PdfContext.prototype.fill = function () {
		//console.log('fill');
		this.doc.fill();
	};
	
	canvas2pdf.PdfContext.prototype.fillAndStroke = function () {
		//console.log('fillAndStroke');
		this.doc.fillAndStroke('even-odd');
	};

	canvas2pdf.PdfContext.prototype.rect = function (x, y, width, height) {
		//console.log('rect',x, y, width, height);
		this.doc.rect(x, y, width, height);
	};

	canvas2pdf.PdfContext.prototype.fillRect = function (x, y, width, height) {
		//console.log('fillRect',x, y, width, height);
		this.doc.rect(x, y, width, height);
		this.doc.fill();
	};

	canvas2pdf.PdfContext.prototype.strokeRect = function (x, y, width, height) {
		//console.log('strokeRect',x, y, width, height);
		this.doc.rect(x, y, width, height);
		this.doc.stroke();
	};

	/**
	 * "Clears" a canvas by just drawing a white rectangle in the current group.
	 */
	canvas2pdf.PdfContext.prototype.clearRect = function (x, y, width, height) {
		var oldFill = this.doc.fillColor();
		this.doc.fillColor('white');
		this.doc.rect(x, y, width, height);
		this.doc.fill();
		this.doc.fillColor(oldFill);
	};

	canvas2pdf.PdfContext.prototype.arc = function (x, y, r, a0, a1, ccw) {
		if (un(x) || un(y) || un(r) || un(a0) || un(a1)) return;
		//console.log('arc', x, y, r, a0, a1, ccw);
		var pi = Math.PI,
		tau = 2 * pi,
		epsilon = 1e-6,
		tauEpsilon = tau - epsilon;
		x = +x,
		y = +y,
		r = +r;
		var dx = r * Math.cos(a0),
		dy = r * Math.sin(a0),
		x0 = x + dx,
		y0 = y + dy,
		cw = 1 ^ ccw,
		da = ccw ? a0 - a1 : a1 - a0;

		// Is the radius negative? Error.
		if (r < 0) {
			throw new Error('negative radius: ' + r);
		}
		var cmd = '';
		// Is this path empty? Move to (x0,y0).

		cmd += 'M' + x0 + ',' + y0;

		// // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
		// else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
		//   cmd += 'L' + x0 + ',' + y0;
		// }

		// Is this arc empty? We’re done.
		if (!r) {
			return;
		}

		// Does the angle go the wrong way? Flip the direction.
		if (da < 0) {
			da = da % tau + tau;
		}

		// Is this a complete circle? Draw two arcs to complete the circle.
		if (da > tauEpsilon) {
			cmd += 'A' + r + ',' + r + ',0,1,' + cw + ',' + (x - dx) + ',' + (y - dy) + 'A' + r + ',' + r + ',0,1,' + cw +
			',' + x0 + ',' + y0;
		}

		// Is this arc non-empty? Draw an arc!
		else if (da > epsilon) {
			cmd += 'A' + r + ',' + r + ',0,' + ( + (da >= pi)) + ',' + cw + ',' + (x + r * Math.cos(a1)) + ',' +
			(y + r * Math.sin(a1));
		}
		this.doc.path(cmd);
	};

	canvas2pdf.PdfContext.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
		//console.log('bezierCurveTo',cp1x, cp1y, cp2x, cp2y, x, y);
		this.doc.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	};

	canvas2pdf.PdfContext.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
		//console.log('quadraticCurveTo',cpx, cpy, x, y);
		this.doc.quadraticCurveTo(cpx, cpy, x, y);
	};
	canvas2pdf.PdfContext.prototype.createLinearGradient = function (x1, y1, x2, y2) {
		var gradient = this.doc.linearGradient(x1, y1, x2, y2);
		gradient.addColorStop = function (offset, color) {
			var fixedColor = fixColor(color);
			gradient.stop(offset, fixedColor.c, fixedColor.a);
		};
		return gradient;
	};

	canvas2pdf.PdfContext.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
		var _this = this;
		var gradient = this.doc.radialGradient(x0, y0, r0, x1, y1, r1);
		gradient.addColorStop = function (offset, color) {
			var fixedColor = fixColor(color);
			gradient.stop(offset, fixedColor.c, fixedColor.a);
		};
		return gradient;
	};

	canvas2pdf.PdfContext.prototype.adjustTextX = function (text, x) {
		if (this.textAlign !== 'start' || this.textAlign !== 'left') {
			var width = this.doc.widthOfString(text);
			if (this.textAlign === 'right' || this.textAlign === 'end') {
				x -= width;
			} else if (this.textAlign === 'center') {
				x -= (width / 2);
			}
		}
		return x;
	};

	canvas2pdf.PdfContext.prototype.adjustTextY = function (text, y) {
		// baseline is top by default
		var height = this.lineHeight;
		if (this.textBaseline === 'bottom') {
			y -= height;
		} else if (this.textBaseline === 'middle') {
			y -= (height / 2);
		} else if (this.textBaseline === 'alphabetic') {
			y -= (height / 2) + 1;
		}
		return y;
	};

	canvas2pdf.PdfContext.prototype.fillText = function (text, x, y) {
		//console.log('fillText',text,x,y);
		x = this.adjustTextX(text, x);
		y = this.adjustTextY(text, y);
		if (isNaN(x) || isNaN(y)) return;
		this.doc.text(text, x, y, {
			lineBreak: false,
			stroke: false,
			fill: true,
		});
	};

	canvas2pdf.PdfContext.prototype.strokeText = function (text, x, y) {
		x = this.adjustTextX(text, x);
		y = this.adjustTextY(text, y);
		this.doc.text(text, x, y, {
			lineBreak: false,
			stroke: true,
			fill: false
		});
	};

	canvas2pdf.PdfContext.prototype.measureText = function (text) {
		text = '' + text;
		var width = this.doc.widthOfString(text);
		var height = this.lineHeight;
		return {
			width: width,
			height: height
		};
	};

	canvas2pdf.PdfContext.prototype.clip = function () {
		this.doc.clip();
	};

	canvas2pdf.PdfContext.prototype.drawImage = function (image) {
		//console.log('drawImage',image);
		var _this;
		var args = Array.prototype.slice.call(arguments);
		var image = args[0];
		var dx,
		dy,
		dw,
		dh,
		sx = 0,
		sy = 0,
		sw,
		sh;
		if (args.length === 3) {
			dx = args[1];
			dy = args[2];
			sw = image.width;
			sh = image.height;
			dw = sw;
			dh = sh;
		} else if (args.length === 5) {
			dx = args[1];
			dy = args[2];
			dw = args[3];
			dh = args[4];
			sw = image.width;
			sh = image.height;
		} else if (args.length === 9) {
			sx = args[1];
			sy = args[2];
			sw = args[3];
			sh = args[4];
			dx = args[5];
			dy = args[6];
			dw = args[7];
			dh = args[8];
		} else {
			throw new Error('Invalid number of arguments passed to drawImage: ' + arguments.length);
		}
		
		//console.log(image.nodeName,args.length, sx, sy, sw, sh, dx, dy, dw, dh);

		if (image.nodeName.toLowerCase() === 'img') {
			var canvas = document.createElement('canvas');
			canvas.width = dw;
			canvas.height = dh;
			canvas.getContext('2d').drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);
			var dataURL = canvas.toDataURL('image/png');
			this.doc.image(dataURL, dx, dy, {
				width: dw,
				height: dh
			});
			/*var canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			canvas.getContext('2d').drawImage(image, 0, 0);
			var dataURL = canvas.toDataURL('image/png');
			this.doc.image(dataURL, dx, dy, {
				width: dw,
				height: dh
			});*/
		} else {
			this.doc.image(image, dx, dy, {
				width: dw,
				height: dh
			});
		}
	};

	/**
	 * Not yet implemented
	 */
	canvas2pdf.PdfContext.prototype.setTransform = function () {
		if (arguments[0] === 1 && arguments[1] === 0 && arguments[2] === 0 && arguments[3] === 1 && arguments[4] === 0 && arguments[5] === 0) return;
		var args = Array.prototype.slice.call(arguments);
		console.log('setTransform not implemented ' + (args.join(', ')));
	};

	canvas2pdf.PdfContext.prototype.createPattern = function (image, repetition) {
		console.log('createPattern not implemented');
	};

	canvas2pdf.PdfContext.prototype.setLineDash = function (dashArray) {
		//console.log('setLineDash',dashArray);
		if (typeof dashArray !== 'object') dashArray = [0,0];
		if (typeof dashArray[0] !== 'number' || isNaN(dashArray[0]) || dashArray[0] === null) dashArray[0] = 0;
		if (typeof dashArray[1] !== 'number' || isNaN(dashArray[1]) || dashArray[1] === null) dashArray[1] = 0;
		if (dashArray[0] === 0 || dashArray[1] === 0) {
			this.doc.undash();
		} else {
			this.doc.dash(dashArray[0], {space:dashArray[1]});
		}
	};

	canvas2pdf.PdfContext.prototype.ellipse = function (x, y, xr, yr, rot, a0, a1, ccw) {
		var pi = Math.PI,
		tau = 2 * pi,
		epsilon = 1e-6,
		tauEpsilon = tau - epsilon;
		x = +x,
		y = +y,
		xr = +xr,
		yr = +yr,
		rot = 0;
		var dx = xr * Math.cos(a0),
		dy = yr * Math.sin(a0),
		x0 = x + dx,
		y0 = y + dy,
		cw = 1 ^ ccw,
		da = ccw ? a0 - a1 : a1 - a0;

		// Is the radius negative? Error.
		if (xr <= 0 || yr <= 0) return;
		var cmd = '';
		
		// Is this path empty? Move to (x0,y0).
		cmd += 'M' + x0 + ',' + y0;
		// // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
		// else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
		//   cmd += 'L' + x0 + ',' + y0;
		// }

		// Does the angle go the wrong way? Flip the direction.
		if (da < 0) da = da % tau + tau;

		// Is this a complete ellipse? Draw two arcs to complete the circle.
		if (da > tauEpsilon) {
			cmd += 'A' + xr + ',' + yr + ',0,1,' + cw + ',' + (x - dx) + ',' + (y - dy) + 'A' + xr + ',' + yr + ',0,1,' + cw +
			',' + x0 + ',' + y0;
		}

		// Is this arc non-empty? Draw an arc!
		else if (da > epsilon) {
			cmd += 'A' + xr + ',' + yr + ',0,' + ( + (da >= pi)) + ',' + cw + ',' + (x + xr * Math.cos(a1)) + ',' +
			(y + yr * Math.sin(a1));
		}
		
		this.doc.path(cmd);
		
		//console.log('ellipse not implemented');
	};

	canvas2pdf.PdfContext.prototype.drawFocusRing = function () {
		console.log('drawFocusRing not implemented');
	};

	canvas2pdf.PdfContext.prototype.createImageData = function () {
		console.log('drawFocusRing not implemented');
	};

	canvas2pdf.PdfContext.prototype.getImageData = function () {
		console.log('getImageData not implemented');
	};

	canvas2pdf.PdfContext.prototype.putImageData = function () {
		console.log('putImageData not implemented');
	};

	canvas2pdf.PdfContext.prototype.globalCompositeOperation = function () {
		console.log('globalCompositeOperation not implemented');
	};

	canvas2pdf.PdfContext.prototype.arcTo = function (x1, y1, x2, y2, radius) {
		console.log('arcTo not implemented');
	};

})(typeof window !== 'undefined' ? window : this);

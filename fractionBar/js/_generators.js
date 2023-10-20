/*
//eg:
gen.getItem({
	type:'equationOneStep',
	items:[{
		operation:'a'
	},{
		operation:'s'
	},{
		operation:'m'
	},{
		operation:'d'
	},{
		operation:'a',
		reverseSides:true
	}]
});
*/

function tf(prob) {
	if (typeof prob === 'boolean') return prob;
	if (typeof prob === 'number') return Math.random() < prob;
	return undefined;
}
function generate(obj) {
	return gen.getItem(obj);
}
var gen = {
	getItem: function(obj) {
		if (un(obj.type) || un(gen[obj.type])) return false;
		obj = clone(obj);
		if (obj instanceof Array) obj = {items:obj};
		if (!un(gen[obj.type].defaults)) {
			for (var key in gen[obj.type].defaults) {
				if (un(obj[key])) obj[key] = clone(gen[obj.type].defaults[key]);
			}
		}
		var count = !un(obj.count) ? obj.count : obj.items instanceof Array ? obj.items.length : 1;
		delete obj.count;
		//console.log(obj,count);
		var items = [];
		for (var i = 0; i < count; i++) {
			var obj2 = clone(obj);
			if (obj.items instanceof Array && typeof obj.items[i] === 'object') {
				for (var key in obj.items[i]) {
					if (key === 'items') continue;
					obj2[key] = clone(obj.items[i][key]);
				}
			}
			var item = gen[obj.type].getItem(obj2);
			var repeat = false;
			if (item !== false && i > 0 && !un(gen[obj.type].isEqual)) {
				for (var j = 0; j < i; j++) {
					if (gen[obj.type].isEqual(item,items[j]) === true) {
						repeat = true;
						break;
					}
				}
			}
			if (repeat === false || item === false) {
				items.push(item);
			} else {
				i--;
			}
		}
		return count === 1 ? items[0] : items;
	},
	flattenRange: function(range) {
		var flattened = [];
		for (var i = 0; i < range.length; i++) {
			if (typeof range[i] === 'number') {
				flattened.push(range[i]);
			} else if (range[i] instanceof Array) {
				var min = Math.min(range[i][0],range[i][1]);
				var max = Math.max(range[i][0],range[i][1]);
				for (var j = min; j <= max; j++) {
					flattened.push(j);
				}
			}
		}
		return flattened;
	},
	randomValueFromRange: function(range) {
		if (typeof range === 'number') return range;
		if (range instanceof Array) return gen.flattenRange(range).ran();
		return false;
	},
	equationOneStep:{
		defaults:{
			letter:'',
			letters:'abcdfhkmnptuxxxxxxxxxxxxxyy'.split(''),
			operation:'',
			operations:['a','s','m','d'],
			negativeSolution:false,
			negativeRHS:false,
			reverseSides:false
		},
		ops:{
			a:{
				type:'add',
				defaultValues:[[1,12]]
			},
			s:{
				type:'subtract',
				defaultValues:[[1,12]]
			},
			m:{
				type:'multiply',
				defaultValues:[[2,10]]
			},
			d:{
				type:'divide',
				defaultValues:[[2,10]]
			},
			q:{
				type:'square'
			},
			r:{
				type:'squareroot'
			}
		},
		isEqual:function(q1,q2) {
			return isEqual(q1,q2);
		},
		getItem:function(obj) {
			obj = clone(obj);
			var letter = obj.letter !== '' ? obj.letter : obj.letters.ran();
			var operation = ['a','s','m','d'].indexOf(obj.operation) > -1 ? obj.operation : obj.operations.ran();
			var count = 0;
			do {
				if (typeof gen.equationOneStep.ops[operation] === 'object') {
					var negativeSolution = tf(obj.negativeSolution);
					var opType = gen.equationOneStep.ops[operation].type;
					var opValues = !un(obj.opValues) ? obj.opValues : gen.equationOneStep.ops[operation].defaultValues;
					var opValue = gen.randomValueFromRange(opValues);
					if (opType === 'multiply' && negativeSolution === true && tf(0.5)) opValue *= -1;
					var value = opType === 'divide' ? opValue * ran(2,12) : opType === 'subtract' && tf(obj.negativeRHS) !== true ? ran(opValue,12) : ran(0,12);
					if (negativeSolution === true) value *= -1;
				} else {
					return false;
				}
				//console.log(obj,value,opValues,opValue);
				var lhs = alg.toObj([letter]);
				var rhs = alg.toObj([String(value)]);
				opValue = alg.toObj([String(opValue)]);
				lhs = alg[opType](lhs, opValue);
				rhs = alg[opType](rhs, opValue);
				rhs = alg.flatten(rhs);
				count++;
			} while (count < 100 && obj.allowNegativeRHS === true && Number(rhs[0]) < 0);
			var q = [];
			q[0] = tf(obj.reverseSides) ? [alg.toText(rhs), alg.toText(lhs)] : [alg.toText(lhs), alg.toText(rhs)];
			q[1] = [letter, value];
			return q;
		}
	},
	equationTwoStep:{
		defaults:{
			letter:'',
			letters:'abcdfhkmnptuxxxxxxxxxxxxxyy'.split(''),
			operation:'',
			operations:['ma','ms','da','ds','am','sm','ad','sd','md'],
			negativeSolution:false,
			negativeRHS:false,
			reverseSides:false,
			reverseLHS:false,
			maxRHS:false,
			fractionalRHS:false
		},
		ops:{
			a:{
				type:'add',
				defaultValues:[[1,12]]
			},
			s:{
				type:'subtract',
				defaultValues:[[1,12]]
			},
			m:{
				type:'multiply',
				defaultValues:[[2,10]]
			},
			d:{
				type:'divide',
				defaultValues:[[2,10]]
			}
		},
		isEqual:function(q1,q2) {
			return isEqual(q1,q2);
		},
		getItem:function(obj) {
			obj = clone(obj);
			var letter = obj.letter !== '' ? obj.letter : obj.letters.ran();
			var operation = obj.operations.indexOf(obj.operation) > -1 ? obj.operation : obj.operations.ran();
			var count = 0;
			var negativeSolution = tf(obj.negativeSolution);
			var negativeRHS = tf(obj.negativeRHS);
			var fractionalRHS = tf(obj.fractionalRHS);
			var reverseLHS = tf(obj.reverseLHS);
			do {
				var lhs = alg.toObj([letter]);
				if (operation[0] === 'd') {
					var opValues = !un(obj.opValues) ? obj.opValues[0] : gen.equationTwoStep.ops['d'].defaultValues;
					var opValue = gen.randomValueFromRange(opValues);
					var value = ran(0,6)*opValue;
					if (negativeSolution === true) value *= -1;
					var rhs = alg.toObj([String(value)]);
					opValue = alg.toObj([String(opValue)]);
					lhs = alg.divide(lhs, opValue);
					rhs = alg.divide(rhs, opValue);
					var opType = gen.equationTwoStep.ops[operation[1]].type;
					if (typeof gen.equationTwoStep.ops[operation[1]] === 'object') {
						var opValues = !un(obj.opValues) ? obj.opValues[1] : gen.equationTwoStep.ops[operation[1]].defaultValues;
						var opValue = gen.randomValueFromRange(opValues);
					}
					opValue = alg.toObj([String(opValue)]);
					lhs = alg[opType](lhs, opValue);
					rhs = alg[opType](rhs, opValue);
					if (lhs.length === 2 && lhs[0].sign < 0 && lhs[1].sign > 0) {
						lhs = [lhs[1],lhs[0]];
					}
					if (lhs.length === 2 && reverseLHS === true) {
						lhs = [lhs[1],lhs[0]];
					}	
				} else if (operation[0] === 'm' && operation[1] === 'd') {
					var divValues = !un(obj.opValues) ? obj.opValues[1] : gen.equationTwoStep.ops['d'].defaultValues;
					var multValues = !un(obj.opValues) ? obj.opValues[0] : gen.equationTwoStep.ops['m'].defaultValues;
					var count2 = 0;
					do {
						var divValue = gen.randomValueFromRange(divValues);
						var multValue = gen.randomValueFromRange(multValues);
						count2++;
					} while (count2 < 100 && (multValue % divValue === 0 || divValue % multValue === 0));
					var value = ran(0,6)*divValue;
					if (negativeSolution === true) value *= -1;
					
					var rhs = alg.toObj([String(value)]);
					multValue = alg.toObj([String(multValue)]);
					lhs = alg.multiply(lhs, multValue);
					rhs = alg.multiply(rhs, multValue);
					divValue = alg.toObj([String(divValue)]);
					lhs = alg.divide(lhs, divValue);
					rhs = alg.divide(rhs, divValue);
				} else if (operation[1] === 'd') {
					var divValues = !un(obj.opValues) ? obj.opValues[1] : gen.equationTwoStep.ops['d'].defaultValues;
					
					var opType = gen.equationTwoStep.ops[operation[0]].type;
					if (typeof gen.equationTwoStep.ops[operation[0]] === 'object') {
						var opValues = !un(obj.opValues) ? obj.opValues[0] : gen.equationTwoStep.ops[operation[0]].defaultValues;
						var opValue = gen.randomValueFromRange(opValues);
					}
		
					var count2 = 0;
					do {
						var divValue = gen.randomValueFromRange(divValues);
						var opValue = gen.randomValueFromRange(opValue);
						var value = ran(0,6)*divValue;
						if (negativeSolution === true) value *= -1;
						count2++;
					} while (count2 < 100 && ((opType === 'add' && (value+opValue) % divValue !== 0) || (opType === 'subtract' && (value-opValue) % divValue !== 0)));
					
					var rhs = alg.toObj([String(value)]);
					opValue = alg.toObj([String(opValue)]);
					lhs = alg[opType](lhs, opValue);
					rhs = alg[opType](rhs, opValue);
					divValue = alg.toObj([String(divValue)]);
					lhs = alg.divide(lhs, divValue);
					rhs = alg.divide(rhs, divValue);
				} else {
					var value = ran(0,12);
					if (negativeSolution === true) value *= -1;
					var rhs = alg.toObj([String(value)]);
					for (var i = 0; i < 2; i++) {
						var opType = gen.equationTwoStep.ops[operation[i]].type;
						if (typeof gen.equationTwoStep.ops[operation[i]] === 'object') {
							var opValues = !un(obj.opValues) ? obj.opValues[i] : gen.equationTwoStep.ops[operation[i]].defaultValues;
							var opValue = gen.randomValueFromRange(opValues);
						}
						opValue = alg.toObj([String(opValue)]);
						lhs = alg[opType](lhs, opValue);
						rhs = alg[opType](rhs, opValue);
						if (lhs.length === 2 && lhs[0].sign < 0 && lhs[1].sign > 0) {
							lhs = [lhs[1],lhs[0]];
						}
						if (lhs.length === 2 && reverseLHS === true) {
							lhs = [lhs[1],lhs[0]];
						}
					}
				}
				rhs = alg.flatten(rhs);
				count++;
				var ok = true;
				if (rhs.length !== 1) {
					ok = false;
				} else if (negativeRHS === false && rhs[0].sign < 0 || negativeRHS === true && rhs[0].sign > 0) {
					ok = false;
				} else if (fractionalRHS === false && rhs[0].coeff[1] !== 1) {
					ok = false
				}
				if (count > 100) ok = true;
			} while (ok === false);
			var q = [];
			q[0] = tf(obj.reverseSides) ? [alg.toText(rhs), alg.toText(lhs)] : [alg.toText(lhs), alg.toText(rhs)];
			q[1] = [letter, value];
			return q;
		}
	},
	equationUnknownsBothSides:{
		defaults:{
			letter:'',
			letters:'abcdfhkmnptuxxxxxxxxxxxxxyy'.split(''),
			value:[[0,12]],
			operationsLHS:'',
			operationsRHS:'',
			operations:['a','s','m','ma','ms','am','sm','mam','msm','ama','sma','ams','sms'],
			reverseLHS:false,
			reverseRHS:false,
			maxCoeffDiff:12,
			minCoeffDiff:1
		},
		ops:{
			a:{
				type:'add',
				defaultValues:[[1,12]]
			},
			s:{
				type:'subtract',
				defaultValues:[[1,12]]
			},
			m:{
				type:'multiply',
				defaultValues:[[2,10]]
			}
		},
		isEqual:function(q1,q2) {
			return isEqual(q1,q2);
		},
		getItem:function(obj) {
			obj = clone(obj);
			var letter = obj.letter !== '' ? obj.letter : obj.letters.ran();
			var operationsLHS = obj.operations.indexOf(obj.operationsLHS) > -1 ? obj.operationsLHS : gen.equationUnknownsBothSides.defaults.operations.ran();
			var operationsRHS = obj.operations.indexOf(obj.operationsRHS) > -1 ? obj.operationsRHS : gen.equationUnknownsBothSides.defaults.operations.ran();
			var reverseLHS = tf(obj.reverseLHS);
			var reverseRHS = tf(obj.reverseRHS);
			var sides = [
				{ops:operationsLHS,reverse:reverseLHS,opValues:obj.opValuesLHS},
				{ops:operationsRHS,reverse:reverseRHS,opValues:obj.opValuesRHS}
			];
			var count = 0;
			do {
				var value = gen.randomValueFromRange(obj.value);
				for (var s = 0; s < sides.length; s++) {
					var side = sides[s];
					side.alg = alg.toObj([letter]);
					side.value = [value,1];
					side.coeff = [1,1];
					for (var i = 0; i < side.ops.length; i++) {
						var op = side.ops[i];
						var opType = gen.equationUnknownsBothSides.ops[op].type;
						var opValues = !un(side.opValues[i]) ? side.opValues[i] : gen.equationUnknownsBothSides.ops[op].defaultValues;
						var opValue = gen.randomValueFromRange(opValues);
						
						side.alg = alg[opType](side.alg, alg.toObj([String(opValue)]));
						if (op === 'a') {
							side.value[0] += opValue*side.value[1]; 
						} else if (op === 's') {
							side.value[0] -= opValue*side.value[1]; 
						} else if (op === 'm') {
							side.value[0] *= opValue;
							side.coeff[0] *= opValue;
						}
						if (side.alg.length === 2 && side.alg[0].sign < 0 && side.alg[1].sign > 0) {
							side.alg = [side.alg[1],side.alg[0]];
						} else if (side.alg.length === 2 && side.reverse === true) {
							side.alg = [side.alg[1],side.alg[0]];
						}
					}
					side.value = simplifyFrac2(side.value);
					side.coeff = simplifyFrac2(side.coeff);
				}
				var coeffDiff = Math.abs(sides[0].coeff[0]/sides[0].coeff[1] - sides[1].coeff[0]/sides[1].coeff[1]);
				count++;
			} while (count < 5000 && (sides[0].value[1] !== 1 || sides[1].value[1] !== 1 || sides[0].value[0] !== sides[1].value[0] || isEqual(sides[0].coeff,sides[1].coeff) === true || coeffDiff < obj.minCoeffDiff || coeffDiff > obj.maxCoeffDiff));
			
			//if (count === 5000) console.log('failed',operationsLHS,operationsRHS,sides,alg.toText(sides[0].alg),alg.toText(sides[1].alg),letter,value);
			
			return [[alg.toText(sides[0].alg), alg.toText(sides[1].alg)],[letter,value]];
		}
	},
	simultaneousEquationsLinear:{
		defaults:{
			//	ax + by = rhs1
			//  cx + dy = rhs2
			letters:['xy','xy','xy','xy','xy','ab','ab','ab','pq','tu','uw','kn','cd'],
			a:[[1,5]],
			b:[[1,5]],
			c:[[1,5]],
			d:[[1,5]],
			x:[[-10,10]],
			y:[[-10,10]]
		},
		isEqual:function(q1,q2) {
			return isEqual(q1,q2);
		},
		getItem:function(obj) {
			obj = clone(obj);
			var q = [];
			var letters = typeof obj.letters === 'string' ? obj.letters : obj.letters.ran();
			do {
				var a = gen.randomValueFromRange(obj.a);
				var b = gen.randomValueFromRange(obj.b);
				var c = gen.randomValueFromRange(obj.c);
				var d = gen.randomValueFromRange(obj.d);	
				var aMin = Math.round(a / hcf(a,b));
				var bMin = Math.round(b / hcf(a,b));
				var cMin = Math.round(c / hcf(c,d));
				var dMin = Math.round(d / hcf(c,d));
			} while (aMin === cMin && bMin === dMin);
			var x = gen.randomValueFromRange(obj.x);
			var y = gen.randomValueFromRange(obj.y);
			if (obj.separateEquationText === true) {
				var aText = a === 0 ? '' : a === 1 ? letters[0] : a === -1 ? '-'+letters[0] : String(a)+letters[0];
				var sign1 = b === 0 ? '' : b < 0 ? '-' : '+';
				var bText = b === 0 ? '' : b === 1 ? letters[1] : b === -1 ? letters[1] : String(Math.abs(b))+letters[1];
				var cText = c === 0 ? '' : c === 1 ? letters[0] : c === -1 ? '-'+letters[0] : String(c)+letters[0];
				var sign2 = d === 0 ? '' : d < 0 ? '-' : '+';
				var dText = d === 0 ? '' : d === 1 ? letters[1] : d === -1 ? letters[1] : String(Math.abs(d))+letters[1];
				q.push([[aText],[sign1],[bText],['='],[String(a*x+b*y)]]);
				q.push([[cText],[sign2],[dText],['='],[String(c*x+d*y)]]);
			} else {
				var space = obj.space === true ? '  ' : '';
				var aText = a === 0 ? '' : a === 1 ? space+letters[0] : a === -1 ? '-'+letters[0] : String(a)+letters[0];
				var bText = b === 0 ? '' : b === 1 ? '+'+space+letters[1] : b === -1 ? '-'+space+letters[1] : b > 0 ? '+'+String(b)+letters[1] : String(b)+letters[1];
				var cText = c === 0 ? '' : c === 1 ? space+letters[0] : c === -1 ? '-'+letters[0] : String(c)+letters[0];
				var dText = d === 0 ? '' : d === 1 ? '+'+space+letters[1] : d === -1 ? '-'+space+letters[1] : d > 0 ? '+'+String(d)+letters[1] : String(d)+letters[1];
				q.push([aText+bText+'='+String(a*x+b*y)]);
				q.push([cText+dText+'='+String(c*x+d*y)]);
			}
			q.push([letters[0],x]);
			q.push([letters[1],y]);
			q.push([a,b,c,d]);
			return q;
		}
	},
	linearGraph:{
		defaults:{
			horiz:0,
			vert:0,
			a:[-5,-4,-3,-2,-1,0,1,2,3,4,5], // used for x=a, y=a
			fractionalM:0,
			m:[-5,-4,-3,-2,-1,1,2,3,4,5],
			md:[2,3,4,5], // denominator of m
			c:[-5,-4,-3,-2,-1,1,2,3,4,5],
			format:'y=mx+c' // y=mx+c, y=c+mx, ax+by=c, ax+by+c=0
		},
		isEqual:function(q1,q2) {
			return isEqual(q1,q2);
		},
		getItem:function(obj) {
			obj = clone(obj);
			var q = [];
			if (tf(obj.horiz) === true) {
				var a = gen.randomValueFromRange(obj.a);
				return ['y='+a];
			} else if (tf(obj.vert) === true) {
				var a = gen.randomValueFromRange(obj.a);
				return ['x='+a];
			}
			var m = gen.randomValueFromRange(obj.m);
			var c = gen.randomValueFromRange(obj.c);
			var md = 1;
			if (tf(obj.fractionalM) === true) {
				do {
					md = gen.randomValueFromRange(obj.md);
				} while (hcf(Math.abs(m),md) > 1);
			}
			if (obj.format === 'ax+by+c=0') {
				var a1 = Math.abs(m);
				var b1 = m < 0 ? md : -md;
				var c1 = m < 0 ? -c*md : c*md;
				var aText = a1 === 0 ? '' : a1 === 1 ? 'x' : a1 === -1 ? '-x' : String(a1)+'x';
				var bText = b1 === 0 ? '' : b1 === 1 ? '+y' : b1 === -1 ? '-y' : b1 > 0 ? '+'+String(b1)+'y' : String(b1)+'y';
				var cText = c1 === 0 ? '' : c1 > 0 ? '+'+String(c1) : String(c1);
				var q = [aText+bText+cText+'=0'];
			} else if (obj.format === 'ax+by=c') {
				var a1 = Math.abs(m);
				var b1 = m < 0 ? md : -md;
				var c1 = m < 0 ? c*md : -c*md;
				var aText = a1 === 0 ? '' : a1 === 1 ? 'x' : a1 === -1 ? '-x' : String(a1)+'x';
				var bText = b1 === 0 ? '' : b1 === 1 ? '+y' : b1 === -1 ? '-y' : b1 > 0 ? '+'+String(b1)+'y' : String(b1)+'y';
				var cText = String(c1);
				var q = [aText+bText+'='+cText];
			} else if (obj.format === 'y=c+mx' && c !== 0) {
				if (md !== 1) {
					var cText = c === 0 ? '' : String(c);
					var mSign = m < 0 ? '-' : c === 0 ? '' : '+';
					var q = ['y='+cText+mSign,['frac',[String(Math.abs(m))],[String(md)]],'x'];
				} else {
					var cText = c === 0 ? '' : String(c);
					var mText = m === 0 ? '' : m === 1 ? '+x' : m === -1 ? '-x' : m > 0 ? '+'+String(m)+'x' : String(m)+'x';
					var q = ['y='+cText+mText];
				}
			} else {
				if (md !== 1) {
					var mSign = m < 0 ? '-' : '';
					var cText = c === 0 ? '' : c < 0 ? String(c) : '+'+c;
					var q = ['y='+mSign,['frac',[String(Math.abs(m))],[String(md)]],'x'+cText];
				} else {
					var mText = m === 0 ? '' : m === 1 ? 'x' : m === -1 ? '-x' : String(m)+'x';
					var cText = c === 0 ? '' : c < 0 || m === 0 ? String(c) : '+'+c;
					var q = ['y='+mText+cText];
				}
			}
			simplifyText(q);
			return q;
		}
	},
	polygon:{ // in progress - not yet in use
		defaults:{
			vertices:3,
			special:'', // equilateral, isosceles, ...
			//regular:true,
			//markings:['angles','sides'],
			center:[0,0],
			size:[100,200], // min/max width and height of surrounding rectangle
			rotate:0,
			color:'#000',
			fillColor:'none',
			lineWidth:2,
			closed:true,
		},
		getItem:function(obj) {
			obj = clone(obj);
			var polygon = {
				type: 'polygon',
				points: [],
				color: obj.color,
				fillColor: obj.fillColor,
				thickness: obj.lineWidth,
				closed: true,
				lineDecoration: [],
				angles: []
			};
			if (!un(obj.fitRect)) {
				var rect = clone(obj.fitRect);
				obj.center = [rect[0]+rect[2]/2,rect[1]+rect[3]/2];
				var padding = !un(obj.fitRectPadding) ? obj.fitRectPadding : 0;
				var x = rect[2] - 2*padding;
				var y = rect[3] - 2*padding;
			} else {
				var count = 0;
				do {
					count++;
					var x = gen.randomValueFromRange(obj.size);
					var y = gen.randomValueFromRange(obj.size);
				} while (count < 100 && Math.abs(x-y) < 20);
			}
			if (!un(obj.special)) {
				polygon.polygonType = obj.special;
				polygon.points = gen.polygon.getSpecialPolygonPoints(obj.special,Math.max(x,y),Math.min(x,y));
			} else {
				polygon.points = gen.polygon.getRegularPolygonPoints(obj.vertices,Math.min(x,y)/2);
			}
			if (obj.rotate !== 0) draw.polygon.rotate(polygon,obj.rotate);
			if (arraysEqual(obj.center,[0,0]) === false) {
				for (var p = 0; p < polygon.points.length; p++) {
					polygon.points[p][0] += obj.center[0];
					polygon.points[p][1] += obj.center[1];
				}
			}
			return polygon;
		},
		getRegularPolygonPoints:function(vertices,radius) {
			var angle = 0.5 * Math.PI + Math.PI / vertices;
			for (var p = 0; p < vertices; p++) {
				pos[p] = [roundToNearest(radius * Math.cos(angle),0.001), roundToNearest(radius * Math.sin(angle),0.001)];
				angle += (2 * Math.PI) / vertices;
			}
			return pos;
		},
		getSpecialPolygonPoints:function(special,x,y) {
			switch (special) {
				case 'squa':
					return [[-x/2,-x/2],[x/2,-x/2],[x/2,x/2],[-x/2,x/2]];
					break;
				case 'rect':
					return [[-x/2,-y/2],[x/2,-y/2],[x/2,y/2],[-x/2,y/2]];
					break;
				case 'para':
					
					// ran(10,50) needs to be relative to x/y
					
					var offset = [-1,1].ran()*ran(10,50);
					var x1 = (x-offset)/2;
					var x2 = (x+offset)/2;
					return [[-x1,-y/2],[x2,-y/2],[x1,y/2],[-x2,y/2]];
					break;
				case 'trap':
				
					// ran(10,50) needs to be relative to x/y
				
					do {
						var offset1 = [-1,1].ran()*ran(10,50);
						var offset2 = [-1,1].ran()*ran(10,50);
					} while (Math.abs(offset1-offset2) < 20);
					return [[-(x-offset1)/2,-y/2],[(x-offset2)/2,-y/2],[(x+offset2)/2,y/2],[-(x-offset2)/2,y/2]];
					break;
				case 'rhom':
					return [[-x/2,0],[0,-y/2],[x/2,0],[0,y/2]];
					break;
				case 'kite':
					
					// ???
				
					return [[-x/2,0],[0,-y/2],[x/2,0],[0,y/2]];
					break;
				/*case 'equi':
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
					break;*/
			}
		}
	}
};
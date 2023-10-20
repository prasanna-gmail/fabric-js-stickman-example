//javascript document

/*
class expression {
	constructor(terms) {
		this.terms = terms;
	}
	get text() {
		var txt = [];
		for (var t = 0; t < this.terms.length; t++) {
			var term = clone(this.terms[t]);
			if (t > 0) {
				if (term[0] == 0) continue;
				if (term[0] > 0) {
					if (txt.length > 0 && typeof txt.last() == 'string') {
						txt[txt.length-1] += ' + ';
					} else {
						txt.push(' + ');
					}
				} else {
					if (txt.length > 0 && typeof txt.last() == 'string') {
						txt[txt.length-1] += ' - ';
					} else {
						txt.push(' - ');
					}
					term[0] = -term[0];
				}
			}
			if (txt.length == 0 && term[0] == -1) txt.push('-');
			if (Math.abs(term[0]) == 1 && term[1] !== '') term[0] = '';
			if (txt.length > 0 && typeof txt.last() == 'string') {
				txt[txt.length-1] += String(term[0]);
			} else {
				txt.push(String(term[0]));
			}
			if (typeof term[1] == 'object') {
				txt = txt.concat(term[1]);
			} else if (txt.length > 0 && typeof txt.last() == 'string') {
				txt[txt.length-1] += String(term[1]);
			} else {
				txt.push(String(term[1]));
			}
		}
		if (txt.length == 0) txt = ['0'];
		return txt;
	}
	get simplify() {
		var terms = clone(this.terms);
		for (var i = 0; i < terms.length; i++) {
			for (var j = terms.length-1; j > i; j--) {
				if (terms[i][1] == terms[j][1] || arraysEqual(terms[i][1],terms[j][1])) {
					terms[i][0] += terms[j][0];
					terms.splice(j,1);
				}
			}
		}
		return terms;
	}
};
//*/
//* compatable version of the above via babeljs.io - required for iPad
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var expression = function () {
	function expression(terms) {
		_classCallCheck(this, expression);

		this.terms = terms;
	}

	_createClass(expression, [{
		key: 'text',
		get: function get() {
			var txt = [];
			for (var t = 0; t < this.terms.length; t++) {
				var term = clone(this.terms[t]);
				if (t > 0) {
					if (term[0] == 0) continue;
					if (term[0] > 0) {
						if (txt.length > 0 && typeof txt.last() == 'string') {
							txt[txt.length - 1] += ' + ';
						} else {
							txt.push(' + ');
						}
					} else {
						if (txt.length > 0 && typeof txt.last() == 'string') {
							txt[txt.length - 1] += ' - ';
						} else {
							txt.push(' - ');
						}
						term[0] = -term[0];
					}
				}
				if (txt.length == 0 && term[0] == -1) txt.push('-');
				if (Math.abs(term[0]) == 1 && term[1] !== '') term[0] = '';
				if (txt.length > 0 && typeof txt.last() == 'string') {
					txt[txt.length - 1] += String(term[0]);
				} else {
					txt.push(String(term[0]));
				}
				if (_typeof(term[1]) == 'object') {
					txt = txt.concat(term[1]);
				} else if (txt.length > 0 && typeof txt.last() == 'string') {
					txt[txt.length - 1] += String(term[1]);
				} else {
					txt.push(String(term[1]));
				}
			}
			if (txt.length == 0) txt = ['0'];
			return txt;
		}
	}, {
		key: 'simplify',
		get: function get() {
			var terms = clone(this.terms);
			for (var i = 0; i < terms.length; i++) {
				for (var j = terms.length - 1; j > i; j--) {
					if (terms[i][1] == terms[j][1] || arraysEqual(terms[i][1], terms[j][1])) {
						terms[i][0] += terms[j][0];
						terms.splice(j, 1);
					}
				}
			}
			return terms;
		}
	}]);

	return expression;
}();

;
//*/
/*
var exp1 = new expression([[3,'a'],[-3,['a',['pow',['2']]]],[-1,'a'],[2,''],[-1,'']]);
var txt = exp1.text;
txt.unshift("<<fontSize:26>><<font:algebra>>");
text({ctx:p.ctx1,text:txt,rect:[100,100,400,200],align:[-1,0]});

var exp2 = new expression(exp1.simplify);
var txt = exp2.text;
txt.unshift("<<fontSize:26>><<font:algebra>>");
text({ctx:p.ctx1,text:txt,rect:[100,200,400,200],align:[-1,0]});
*/
function textArrayReplace(arr,find,replace) {
	if (typeof arr == 'string') {
		arr = replaceAll(arr,find,replace);
	} else if (typeof arr == 'object') {
		for (var i = 0; i < arr.length; i++) {
			arr[i] = textArrayReplace(arr[i],find,replace);
		}
	}
	return arr;	
}
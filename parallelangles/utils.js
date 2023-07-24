

class vec2 {
    constructor(x, y) { this.x = x; this.y = y; }
    get x() { return this._x; }
    set x(newVal) { this._x = newVal; }
    get y() { return this._y; }
    set y(newVal) { this._y = newVal; }
    get length() { return Math.hypot(this.x, this.y); }
    set length(len) { var invLen = len / this.length; this.timesEquals(invLen); }
    add(other) { return new vec2(this.x + other.x, this.y + other.y); }
    sub(other) { return new vec2(this.x - other.x, this.y - other.y); }
    plusEquals(other) { this.x += other.x; this.y += other.y; return this; }
    minusEquals(other) { this.x -= other.x; this.y -= other.y; return this; }
    timesEquals(scalar) { this.x *= scalar; this.y *= scalar; return this; }
    divByEquals(scalar) { this.x /= scalar; this.y /= scalar; return this; }
    setTo(other) { this.x = other.x; this.y = other.y; }
    toString() { return `vec2 {x: ${this.x}, y: ${this.y}}` }
    toStringN(n) { return `vec2 {x: ${this.x.toFixed(n)}, y: ${this.y.toFixed(n)}}` }
    dotProd(other) { return this.x * other.x + this.y * other.y; }
    timesEquals(scalar) { this.x *= scalar; this.y *= scalar; return this; }
    normalize() { let len = this.length; this.x /= len; this.y /= len; return this; }
    static clone(other) { let result = new vec2(other.x, other.y); return result; }
    clone() { return vec2.clone(this); }
};

// Intersection formula:

function calculateIntersection(p1, p2, p3, p4) {

    var c2x = p3.x - p4.x; // (x3 - x4)
    var c3x = p1.x - p2.x; // (x1 - x2)
    var c2y = p3.y - p4.y; // (y3 - y4)
    var c3y = p1.y - p2.y; // (y1 - y2)

    // down part of intersection point formula
    var d = c3x * c2y - c3y * c2x;

    if (d == 0) {
        throw new Error('Number of intersection points is zero or infinity.');
    }

    // upper part of intersection point formula
    var u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
    var u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)

    // intersection point formula

    var px = (u1 * c2x - c3x * u4) / d;
    var py = (u1 * c2y - c3y * u4) / d;

    var p = { x: px, y: py };

    return p;
}

function getAngle(origin, pt) {
    let delta = pt.sub(origin);
    let angle = Math.atan2(delta.y, delta.x);
    return angle;
}

fabric.Storearc = fabric.util.createClass(fabric.Object, {
    type: 'storearc',
    stAngle: 0,
    endAngle: 1,

    initialize: function (options) {
        options = options || {};
        this.callSuper('initialize', options);
        this.set('radius', options.radius || 10);
        this.set('stAngle', options.stAngle || 0);
        this.set('endAngle', options.endAngle || 1);
        var diameter = this.get('radius') * 2;
        this.set('width', diameter)
        this.set('height', diameter);
    },

    toObject: function (propertiesToInclude) {
        return fabric.util.object.extend(this.callSuper('toObject', propertiesToInclude), {
            radius: this.get('radius'),
            width: this.get('width'),
            height: this.get('height'),
            stAngle: this.get('stAngle'),
            endAngle: this.get('endAngle')
        });
    },
    _render: function (ctx, noTransform) {
        // console.log("pkp:  ~ file: utils.js:65 ~ ctx:", ctx)
        // ctx.beginPath();
        // // multiply by currently set alpha (the one that was set by path group where this object is contained, for example)
        // ctx.globalAlpha = this.group ? (ctx.globalAlpha * this.opacity) : this.opacity;
        // ctx.arc(noTransform ? this.left : 0, noTransform ? this.top : 0, this.radius, this.stAngle * (Math.PI), this.endAngle * (Math.PI), true);
        // ctx.stroke();

        var points = this.points
        console.log("pkp:  ~ file: utils.js:73 ~ points:", points)
        // wedge indicating swept angle
        let angle1 = getAngle(points[1], points[2]);
        let angle2 = getAngle(points[1], points[0]);
        ctx.beginPath();
        // ctx.strokeStyle = "blue";
        ctx.moveTo(points[1].x, points[1].y);
        //arc(x, y, radius, startAngle, endAngle, counterclockwise)
        ctx.arc(points[1].x, points[1].y, this.radius, angle1, angle2, true);
        // ctx.fillStyle = '#cccccc88';
        ctx.fillStyle = this.fill;
        console.log("pkp:  ~ file: utils.js:108 ~ this.fill:", this.fill)
        ctx.fill();
        ctx.closePath()


    }

});
fabric.Storearc.fromObject = function (object) {
    return new fabric.Storearc(object);
};
fabric.Storearc.async = true;

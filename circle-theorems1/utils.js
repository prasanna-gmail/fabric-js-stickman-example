

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

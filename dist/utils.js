

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
        this.set('radius', options.radius || 0);
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
        ctx.beginPath();
        // multiply by currently set alpha (the one that was set by path group where this object is contained, for example)
        ctx.globalAlpha = this.group ? (ctx.globalAlpha * this.opacity) : this.opacity;
        ctx.arc(noTransform ? this.left : 0, noTransform ? this.top : 0, this.radius, this.stAngle * (Math.PI), this.endAngle * (Math.PI), true);
        ctx.stroke();
    }

});
fabric.Storearc.fromObject = function (object) {
    return new fabric.Storearc(object);
};
fabric.Storearc.async = false;

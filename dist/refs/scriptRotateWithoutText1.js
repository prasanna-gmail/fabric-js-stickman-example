

(function () {
    var canvas = new fabric.Canvas('c', {
        selection: true,
        /*theo 12-02-2015*/
        //renderOnAddRemove:false,
        backgroundColor: 'yellow'
    });
    //console.log("pkp:  ~ file: scriptRotateWithoutText1.js:11 ~ canvas:", canvas)

    var RADIUS_CHILDREN_CIRCLE = 8;
    var circles = [];
    function addCirlceTable(left_padding_circle, top_padding_circle, count_chairs, radiusCircle) {

        radiusCircle = (typeof radiusCircle === "undefined") ? 35 : radiusCircle;
        var left_p = radiusCircle - RADIUS_CHILDREN_CIRCLE;
        var top_p = radiusCircle - RADIUS_CHILDREN_CIRCLE;
        var left_group_circle = left_padding_circle - left_p;
        var top_group_circle = top_padding_circle - top_p;
        var rad_parent_circle = radiusCircle;
        var radius_children_circle = RADIUS_CHILDREN_CIRCLE;
        var rad_parent_child_circle = radiusCircle + 13;

        var length_line_parent_cirle = (2 * Math.PI * rad_parent_child_circle) * 2 + radius_children_circle * 3;

        var parent_circle_table = new fabric.Circle({
            left: left_group_circle, top: top_group_circle, radius: rad_parent_circle, fill: '#FFE2EB', stroke: '#7F7F7F', hasControls: true,
            hasBorders: true,
            hasRotatingPoint: true,
            selectable: true,
            objectType: 'parent'
        });

        circles.push(parent_circle_table);

        // var height_circle = parent_circle_table.getHeight();


        var colors = ['#FFE2EB'];
        var centerX = left_padding_circle;
        var centerY = top_padding_circle;
        var innerRadius = rad_parent_child_circle;
        var count_child_circle = count_chairs;

        var all_circle_lenght = count_child_circle * (radius_children_circle * 2);

        var length_interval = length_line_parent_cirle / count_child_circle;

        var interval = length_interval / 100;

        var p = 0;


        //canvas.add(parent_circle_table);   

        for (var i = 0; i < count_child_circle; i++) {

            var x = centerX + innerRadius * Math.cos(p);
            var y = centerY + innerRadius * Math.sin(p);


            var circle = new fabric.Circle({
                left: x, top: y, radius: radius_children_circle, fill: colors[0], stroke: '#7F7F7F', hasControls: true,
                hasBorders: true,
                hasRotatingPoint: true,
                selectable: true
            });
            circle.set({
                typeCircle: 'chair'
            });

            p += interval;

            // canvas.add(circle);
            circles.push(circle);

        }
        var objtype = 'grup';
        var fontSizeTable = 20;
        var number_table = 1;
        var N = "" + number_table + "";



        //canvas.add(text);
        //canvas.renderAll();


        var round = new fabric.Group(circles, {
            left: centerX, top: centerY,

            lockRotation: true,
            originX: 'center', originY: 'center'
        });

        var tableObject = {
            "name": "",
            "fontSize": "",
            "diameter": "",
            "count_chairs": "",
            "tableNumber": "",
            "backgroundColor": ""
        };


        //ΒΑΖΩ ΤΑ TEXT ΣΕ ΔΙΚΟ ΤΟΥΣ GROUP
        var texts = [];
        var text = new fabric.Text(N, {
            fontSize: fontSizeTable, fontWeight: 'bold',
            originX: 'center', originY: 'center', top: -5, fill: 'black'
        });

        texts.push(text);

        text2 = new fabric.Text('table name rotonta', { fontSize: fontSizeTable, fontWeight: 'bold', originX: 'center', originY: 'center', top: 5, fill: 'black' });

        texts.push(text2);

        var textsGroup = new fabric.Group(texts, {
            originX: 'center',
            originY: 'center',
            objectGroupType: 'texts',
            lockRotation: true
        }
        );

        round.add(textsGroup);

        canvas.add(round);
        canvas.renderAll();
    }



    addCirlceTable(100, 100, 12, 30)

    function onScaling(e) {
        //console.log('scaling..');
        //console.log()
        e.target._objects[1].set({ 'stroke': 'white' });
        e.target._objects[1].set({ 'radius': '5' });
        //     e.target._objects[1].set({'scaleY':'1','scaleX':'1'});
        //     e.target._objects[1].set({'lockScalingX':'true'});

        canvas.renderAll();
    }



    canvas.on('object:rotating', function (e) {
        //console.log('object rotate');
        var actObj = e.target;
        actObj._objects.forEach(function (obj) {
            if (obj.type == 'group') {
                //console.log('angle:' + obj.angle);
                obj.angle = -actObj.angle;
                actObj.setCoords();
                canvas.renderAll();
            }
        });
    });



    canvas.onBeforeScaleRotate = function (e) {
        //console.log('before');
    }
    /*canvas.on('mouse:up', function(e) { console.log('down'); e.target.set({'fill':'pink'}); canvas.renderAll(); });
    canvas.on('mouse:down', function(e) { console.log('down'); e.target.set({'fill':'red'}); canvas.renderAll(); } );
    canvas.on('object:scaling',onScaling);*/
})();

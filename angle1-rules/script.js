// (function () {
var canvas = this.__canvas = new fabric.Canvas('c', { selection: false });
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
var resetBtn = document.getElementsByClassName("resetBtn");
var addBtn = document.getElementById("addBtn");
var removeBtn = document.getElementsByClassName("removeBtn");
var latestAngle;
var newLineArr = []
var newPointArr = []
var mclick = 0;
var centerRight;
var centerLeft;
var mouseDown = false;
var angleBetweenCenterLineAndL2;
var angleBetweenL2AndL3;
var angleBetweenL3AndCenterLine;
var angleBetweenCenterLeftAndL3;
var angleBeetweenCenterLeftAndLine3, angleBeetweemCenterRightandLine2;
var centerPointX = 300,
    centerPointY = 300,
    centerRadius = 200

var gdata = {
    angleL1L3:0,
    angleL1NL1:0,
    angleNL1NL2:0,
    angleNL2L1:0,
}

var label1, label2;
function createLabel(id, name, callee) {
    var planetLabel = new fabric.Text('', {
        id: id,
        name: name,
        fill: '#fff',
        fontSize: 16,
        fontFamily: 'Open Sans',
        textBackgroundColor: '#002244'
    });
    return planetLabel
}

function updateLabel(label, c, angle, params) {
    console.log("pkp:  ~ file: script.js:36 ~ updateLabel ~ angle:", angle)
    label.set({
        left: c.left + 40,
        top: c.top + 50,
        text: angle

    });

    label.setCoords()
}

function disableHandles(myObj) {
    // myObj.hasControls = myObj.selectable = myObj.evented = myObj.hasBorders = false;
    myObj.hasControls = myObj.selectable = myObj.hasBorders = false;


}

function makeCircle(left, top, line, color, label) {
    var c = new fabric.Circle({
        left: left,
        top: top,
        strokeWidth: 5,
        radius: 12,
        fill: color,
        stroke: color
    });
    c.label = label
    c.hasControls = c.hasBorders = false;
    c.line = line;
    return c;
}

function makeLine(coords, color, num) {
    var l = new fabric.Line(coords, {
        fill: 'red',
        stroke: color,
        strokeWidth: 5,
        selectable: false,
        evented: false,
    });
    l.num = num;

    return l
}



function updatePointPos(p) {

}
function updatePoint(p) {

    deltaLeft = p.left - centerPointX;
    deltaTop = p.top - centerPointY;

    var length = Math.sqrt(deltaLeft * deltaLeft + deltaTop * deltaTop);
    // if (length <= centerRadius - 5 || length >= centerRadius + 5) {
    var radians = Math.atan2(deltaTop, deltaLeft)
    /**
     * Find the angle from radians
     */
    var ang = radians * 180 / Math.PI;
    // console.log("pkp:  ~ file: script.js:62 ~ ang:", ang)

    length = centerRadius;

    p.left = Math.cos(radians) * length + centerPointX
    p.top = Math.sin(radians) * length + centerPointY
    // } // end if length by 5

    if (p.line.num == 1) {
        // if line 1 then change the angle
        p.line.set({
            angle: ang
        })

        if (p.label == "point1") {
            p2.left = Math.cos(radians) * -length + centerPointX
            p2.top = Math.sin(radians) * -length + centerPointY

            // updatePointPos(p2)
            p2.setCoords()
            canvas.renderAll();
        } else if (p.label == "point2") {
            p1.left = Math.cos(radians) * -length + centerPointX
            p1.top = Math.sin(radians) * -length + centerPointY

            // updatePointPos(p1)
            p1.setCoords()
            canvas.renderAll();
        } else {

        }


    } else {
        // else change the top of the line to points position
        p.line && p.line.set({ 'x2': p.left, 'y2': p.top });
    }
    p.setCoords()
    canvas.renderAll();
}
canvas.on('object:moving', function (e) {
    var p = e.target;


    updatePoint(p, "on update")

});


var line1 = makeLine([100, 300, 500, 300], "red", 1),
    line2 = makeLine([300, 300, 200, 100], "green", 2),
    line3 = makeLine([300, 300, 300, 150], "blue", 3)

var p1, p2, p3, p4;

label1 = createLabel("label1", "label1", "init 1")
label2 = createLabel("label2", "label2", "init 1")


function init(calee) {
    console.log(calee);
    disableHandles(label1)
    disableHandles(label2)
    canvas.add(label1,label2);


    canvas.add(line3, line1);
    p1 = makeCircle(line1.x1, line1.y1, line1, "green", "point1")
    p2 = makeCircle(line1.x2, line1.y2, line1, "yellow", "point2")
    p3 = makeCircle(line2.x2, line2.y2, line2, "red")
    p4 = makeCircle(line3.x2, line3.y2, line3, "red")
    canvas.add(
        p1, p2, p4
    );
    p1.set({
        name: "point1"
    })
    p2.set({
        name: "point2"
    })
    p3.set({
        name: "point3"
    })
    p4.set({
        name: "point4"
    })

    centerRight = {
        x1: centerPointX,
        y1: centerPointY,
        x2: p2.left,
        y2: p2.top
    }
    centerLeft = {
        x1: p1.left,
        y1: p1.top,
        x2: centerPointX,
        y2: centerPointY,

    }

    angleBetweenCenterLineAndL2 = calculateAngleBetweenTwoLine(centerLeft, line2, "init")
    angleBetweenCenterLeftAndL3 = calculateAngleBetweenLines(line3, centerLeft, "init")
    angleBetweenL2AndL3 = calculateAngleBetweenLines(line2, line3, "init")
    angleBetweenL3AndCenterLine = calculateAngleBetweenLines(line3, centerRight, "init");
    angleBeetweenCenterLeftAndLine3 = calculateAngleBetweenLines(line3, centerLeft, "init");
    angleBeetweemCenterRightandLine2 = calculateAngleBetweenLines(line2, centerRight, "init")
    latestAngle = angleBetweenL3AndCenterLine;
    gdata.angleL1L3 = angleBetweenL3AndCenterLine
    gdata.angleL1NL1 = angleBetweenL3AndCenterLine;
    $("#angle_1").html(angleBetweenL3AndCenterLine + "\u00B0");
    $("#angle_1").css({ "left": (centerPointX + 5) + "px", "top": (centerPointY - 125) + "px", })

    updateLabel(label1, { left: line3.x2, top: line3.y2 }, gdata.angleL1NL1 + "\u00B0", "init-1")
    updateLabel(label2, { left: line1.x1, top: line1.y1-90 }, angleBetweenCenterLeftAndL3 + "\u00B0", "init-1")

    console.log("angleBetween centerLeft and L2--->", angleBetweenCenterLineAndL2);
    console.log("angleBetween L2 And L3--->", angleBetweenL2AndL3);
    console.log("angleBetween L3 And centerRight--->", angleBetweenL3AndCenterLine);
    console.log("angle Beetween CenterLeft And Line3--->", angleBeetweenCenterLeftAndLine3);
    console.log("angle Beetweem Center Right and Line2--->", angleBeetweemCenterRightandLine2);

    updatePoint(p3)
    updatePoint(p4)

    canvas.on({
        "mouse:down": selectLine1Pointer,
        "mouse:move": moveLine1Pointer,
        "mouse:up": stopLine1Pointer,
    })

    function selectLine1Pointer(o) {
        var obj = o.target;
        var pointer = o.pointer
        mouseDown = true;
    }


    function moveLine1Pointer(o) {
        var obj = o.target;
        var pointer = o.pointer;
       
       
        if (mouseDown == true) {
            var pos = updatePointerPosition(pointer.x, pointer.y);
            var centerRight_ = {
                x1: centerPointX,
                y1: centerPointY,
                x2: p2.left,
                y2: p2.top
            }
            var centerLeft_ = {
                x1: p1.left,
                y1: p1.top,
                x2: centerPointX,
                y2: centerPointY,

            }
            if (obj == null) {
                return;
            } else if (obj.name == "point1" || obj.name == "point2" || obj.name == "point3" || obj.name == "point4") {
               
                

                if (obj.name == null) {
                    return
                } else if (obj.name == "point1") {
                    


                    console.log(line1.x1, line1.y1, line1.x2, line1.y2)

                    console.log(p1.left, p1.top, p2.left, p2.top, angleBeetweenCenterLeftAndLine3)
                    // p1.setCoords();
                    let updatedPoint2 = calculate_third_point(centerPointX, centerPointY, pos.left, pos.top, 200, 200, angleBetweenCenterLineAndL2, true);
                    let updatedPoint3 = calculate_third_point(centerPointX, centerPointY, pos.left, pos.top, 200, 200, 180 - angleBetweenL3AndCenterLine, true);
                    line2.set({
                        x2: updatedPoint2.Bx,
                        y2: updatedPoint2.By
                    })
                    p3.set({
                        left: updatedPoint2.Bx,
                        top: updatedPoint2.By
                    })
                    line2.setCoords();
                    p3.setCoords();
                    line3.set({
                        x2: updatedPoint3.Bx,
                        y2: updatedPoint3.By
                    })
                    p4.set({
                        left: updatedPoint3.Bx,
                        top: updatedPoint3.By
                    })
                    line3.setCoords();
                    p4.setCoords();
                    var angleBetweenL3AndCenterLine_ = calculateAngleBetweenLines(line3, centerRight_, "update point1");
                    console.log("angleBetweenL3AndCenterLine-->", angleBetweenL3AndCenterLine_)
                    latestAngle = angleBetweenL3AndCenterLine_;
                //    updateLabel(label1,p4,gdata.angleNL2L1,"update lable on point2 move")
                label1.set({
                    left: p4.left+20,
                    top: p4.top+50
                  })
                  label2.set({
                    left: p1.left+20,
                    top: p1.top -90
                  })
                     setLineOnPointMove(centerRight_,centerLeft_)


                } else if (obj.label == "point2") {
                    // console.log(obj)
                    line1.setCoords();
                    p2.setCoords();
                    let updatedPoint2 = calculate_third_point(centerPointX, centerPointY, pos.left, pos.top, 200, 200, -angleBeetweemCenterRightandLine2, true);
                    let updatedPoint3 = calculate_third_point(centerPointX, centerPointY, pos.left, pos.top, 200, 200, -angleBetweenL3AndCenterLine, true);
                    line2.set({
                        x2: updatedPoint2.Bx,
                        y2: updatedPoint2.By
                    })
                    p3.set({
                        left: updatedPoint2.Bx,
                        top: updatedPoint2.By
                    })
                    line2.setCoords();
                    p3.setCoords();
                    line3.set({
                        x2: updatedPoint3.Bx,
                        y2: updatedPoint3.By
                    })
                    p4.set({
                        left: updatedPoint3.Bx,
                        top: updatedPoint3.By
                    })
                    line3.setCoords();
                    p4.setCoords();
                    var angleBetweenL3AndCenterLine_ = calculateAngleBetweenLines(line3, centerRight_, "update point1");
                    console.log("angleBetweenL3AndCenterLine-->", angleBetweenL3AndCenterLine_)
                    latestAngle = angleBetweenL3AndCenterLine_;
                    // updateLabel(label1,p4,gdata.angleNL2L1,"update lable on point2 move")
                    label1.set({
                        left: p4.left+20,
                        top: p4.top+50
                      })
                      label2.set({
                        left: p1.left+20,
                        top: p1.top -90
                      })
                    setLineOnPointMove(centerRight_,centerLeft_)

                } else if (obj.name == "point3") {

                }
                else if (obj.name == "point4") {
                    line3.set({
                        x2: pos.left,
                        y2: pos.top
                    })
                    p4.set({
                        left: pos.left,
                        top: pos.top
                    })
                    line3.setCoords();
                    p4.setCoords();
                    console.log("angleBetweenL3AndCenterLine--->before--->", angleBetweenL3AndCenterLine)
                    var angle = calculateAngleBetweenLines(line3, centerRight_, "init");
                    angleBetweenL3AndCenterLine = angle
                    gdata.angleL1L3 = angle;
                    var newLineArr = getAllElementByName('newLine');
                    var angle13 = calculateAngleBetweenTwoLine( centerLeft_,line3, "line 3 move and update")
                    if(newLineArr.length == 0){
                        updateLabel(label1, p4, angleBetweenL3AndCenterLine + "\u00B0", "move of point 4");
                        updateLabel(label2, { left: line1.x1, top: line1.y1-90 }, angle13 + "\u00B0", "init-1")
                    }else if(newLineArr.length > 0){
                        var angleBetweeNewLine1AndLine3 = calculateAngleBetweenLines(newLineArr[0], line3, "init");
                        updateLabel(label1, p4, angleBetweeNewLine1AndLine3 + "\u00B0", "move of point 4")
                        updateLabel(label2, { left: line1.x1, top: line1.y1-90 }, angle13 + "\u00B0", "init-1")
                    }
                   

                    //   $("#angle_1").html(angleBetweenL3AndCenterLine+"\u00B0");
                    //     console.log("angleBetweenL3AndCenterLine--->after--->",angle)
                }
            }else if (obj.name == "newPoint"){
                var newLineArr = getAllElementByName('newLine');
                var labels = getAllElementByName('label')
                if(obj.id == "newPoint1"){
                    console.log("this in new point1",obj)
                    console.log("this in new point1",newLineArr[0])
                    if(newLineArr.length == 1){
                        var angleBetweeNewLine1AndCenterLine = calculateAngleBetweenLines(newLineArr[0], centerRight_, "init");
                        var angleBetweeNewLine1AndLine3 = calculateAngleBetweenLines(newLineArr[0], line3, "init");
                        console.log("angle Betwee New Line1 And CenterLine-----368--->",angleBetweeNewLine1AndCenterLine);
                        console.log("angle Betwee NewLine1 And Line3-----368--->",angleBetweeNewLine1AndLine3);
                        updateLabel(label1,p4,angleBetweeNewLine1AndLine3+ "\u00B0", "new line1 move")
                        updateLabel(labels[0],obj,angleBetweeNewLine1AndCenterLine+ "\u00B0", "new line1 move")
                        latestAngle = angleBetweeNewLine1AndCenterLine;
                        
                    }else  if(newLineArr.length == 2){
                        var angleBetweeNewLine1AndNewLine2 = calculateAngleBetweenLines(newLineArr[0], newLineArr[1], "init");
                        var angleBetweeNewLine1AndLine3 = calculateAngleBetweenLines(newLineArr[0], line3, "init");
                        console.log("angle Betwee New Line1 And CenterLine-----368--->",angleBetweeNewLine1AndCenterLine);
                        console.log("angle Betwee NewLine1 And Line3-----368--->",angleBetweeNewLine1AndLine3);
                        updateLabel(label1,p4,angleBetweeNewLine1AndLine3+ "\u00B0", "new line1 move")
                        updateLabel(labels[0],obj,angleBetweeNewLine1AndNewLine2+ "\u00B0", "new line1 move")
                        
                    }
                   

                }else  if(obj.id == "newPoint2"){
                    console.log("this in new point2",obj)
                    var angleBetweeNewLine1AndNewLine1 = calculateAngleBetweenLines(newLineArr[0], newLineArr[1], "init");
                    var angleBetweeNewLine2andCenterLine = calculateAngleBetweenLines(newLineArr[1], centerRight_, "init");
                    // updateLabel(labels[1],obj,angleBetweeNewLine1AndNewLine1+ "\u00B0", "new line1 move")
                    labels[0].set({
                        text:angleBetweeNewLine1AndNewLine1+ "\u00B0"
                    })
                    updateLabel(labels[1],obj,angleBetweeNewLine2andCenterLine+ "\u00B0", "new line1 move")
                }
            }
        }
        canvas.requestRenderAll();
    }

    function stopLine1Pointer(o) {
        var obj = o.target;
        var pointer = o.pointer
        if (obj == null) {
            mouseDown = false;
            return;
        }
        mouseDown = false
    }

    var labels = getAllElementByName('label')
    if(labels.length == 0){
        $(".removeBtn").css("pointer-events","none")
        $(".removeBtn").css("background-color","lightgray")
    }else if(labels.length > 0){
        $(".removeBtn").css("pointer-events","all")
        $(".removeBtn").css("background-color","aquamarine")
    }
}
  init("init-global")


function addNewLine(e) {
    // var htmlStr = '';
    var newLabel;
   
    
    mclick++
    newLabel = createLabel("lable_"+mclick, "label", "add new line");
    disableHandles(newLabel)
    console.log("centerRight--->", p2.left, p2.top)
    var centerRight_ = {
        x1: centerPointX,
        y1: centerPointY,
        x2: p2.left,
        y2: p2.top
    }

    if (newLineArr.length == 0) {
        latestAngle = calculateAngleBetweenLines(line3, centerRight_, "init");
    }
    console.log(e)
    console.log("latestAngle/2--->", latestAngle / 2)
    var point3 = calculate_third_point(centerPointX, centerPointY, centerRight_.x2, centerRight_.y2, 200, 200, latestAngle / 2)
    console.log(point3)
    var addLine = makeLine([centerPointX, centerPointY, point3.Bx, point3.By], "red", 4);
    addLine.set({
        id: "newLine" + mclick,
        name: "newLine"
    })

    var addPoint = makeCircle(addLine.x2, addLine.y2, addLine, "green", "point5");
    addPoint.set({
        id: "newPoint" + mclick,
        name: "newPoint"
    })
    var angleBetweenNewPointANdLine1 = calculateAngleBetweenLines(centerRight_, addLine, "addNewLine")
    console.log("angleBetweenNewPointANdLine1--->", angleBetweenNewPointANdLine1)
    latestAngle = angleBetweenNewPointANdLine1;
    gdata.angleL1NL1 = angleBetweenNewPointANdLine1
    updateLabel(newLabel, { left: addLine.x2, top: addLine.y2 }, gdata.angleL1NL1 + "\u00B0", "add new line")
    newLineArr.push(addLine)
    newPointArr.push(addPoint)
    // htmlStr += '  <div class="angle" id="angle_'+(mclick+1)+'">'+latestAngle+'\u00B0</div>'
    // $(".angle-main-container").append(htmlStr);
    
    canvas.add(addLine, addPoint, newLabel)

    // var labels = getAllElementByName("label")

    var obj = getAllElementByName('newLine');
    console.log(" length of new line object --->", obj.length)
    // for (var i = 0; i < obj.length; i++) {
    //     console.log(obj[i])
    // }
    var labels = getAllElementByName("label")
    if(labels.length > 0){
        $(".removeBtn").css("pointer-events","all")
        $(".removeBtn").css("background-color","aquamarine")
    }
    if(obj.length == 1){
        var angleBetweenLine3AndNewLine = calculateAngleBetweenLines(line3, addLine, "addNewLine");
        console.log("angle Between Line3 And New Line--->",angleBetweenLine3AndNewLine);
        gdata.angleNL1NL2 = angleBetweenLine3AndNewLine
        updateLabel(label1, { left: line3.x2, top: line3.y2 }, angleBetweenLine3AndNewLine + "\u00B0", "add new line")

       
    }else if(obj.length >1){
        var angleBetweenLine3AndNewLine = calculateAngleBetweenLines(line3, obj[0], "addNewLine")
        console.log("angle Between Line3 And New Line--->",angleBetweenLine3AndNewLine)
        updateLabel(label1, { left: line3.x2, top: line3.y2 }, angleBetweenLine3AndNewLine + "\u00B0", "add new line")
       gdata.angleNL1NL2 = angleBetweenLine3AndNewLine;
       gdata.angleNL2L1 = angleBetweenLine3AndNewLine;
    }

    if(labels.length == 2 ){
        var updatedAngleOfLabel2 = calculateAngleBetweenLines(obj[0], obj[1], "addNewLine")
        labels[1].set({
            text : updatedAngleOfLabel2+ "\u00B0"
        })
        labels[0].set({
            text : updatedAngleOfLabel2+ "\u00B0"
        })

        $(".addBtn").css("pointer-events","none")
        $(".addBtn").css("background-color","lightgray")
    }
    // else if(labels.length == 4 ){
    //     var updatedAngleOfLabel3 = calculateAngleBetweenLines(obj[1], obj[2], "addNewLine")
    //     labels[2].set({
    //         text : (updatedAngleOfLabel3-0.5)+ "\u00B0"
    //     })
    // }

    
}






function resetCanvas() {
    canvas.getObjects().forEach(element => {
        canvas.remove(element)
        

        canvas.renderAll();
    });
    var labels = getAllElementByName("label")
    if(labels.length > 0){
        console.log("hello",labels)
        
    }else{
        init("reset canvas");
        $(".addBtn").css("pointer-events","all")
    }

    //init("reset canvas");

}

function removeLine(e) {
    console.log("remove line", e)
    var labels = getAllElementByName("label")
    canvas.remove(labels[labels.length - 1])
    console.log("labels--->", labels)
    labels.pop();
    $(".addBtn").css("background-color","aquamarine")
    if(labels.length == 0){
        $(".removeBtn").css("pointer-events","none")
        $(".removeBtn").css("background-color","lightgray")
        
    }else if(labels.length > 0){
        $(".removeBtn").css("pointer-events","all")
        $(".removeBtn").css("background-color","aquamarine")
    }
    newLineArr.pop()
    newPointArr.pop()
    canvas.getObjects().forEach(element => {
        if (element.name == "newLine") {
            canvas.remove(element)
        } else if (element.name == "newPoint") {
            canvas.remove(element)
        }
    });

   

    for (var i = 0; i < newLineArr.length; i++) {
        canvas.add(newLineArr[i])

        console.log(i)
        if (i == (newLineArr.length - 1)) {

            console.log(i, newLineArr.length - 1)
            latestAngle = calculateAngleBetweenLines(newLineArr[i], centerRight, "remove-line")
            console.log("latestAngle-->", latestAngle)
        }
    }
    for (var j = 0; j < newPointArr.length; j++) {
        canvas.add(newPointArr[j])
    }
    $(".addBtn").css("pointer-events","all")

    var obj = getAllElementByName('newLine');

    if(obj.length == 1){
        var angleBetweenNewLineArrayAndCenterRight = calculateAngleBetweenLines(obj[0], centerRight, "remove-line")

        labels[0].set({
            text:angleBetweenNewLineArrayAndCenterRight+"\u00B0"
        })
    }else if(obj.length == 0){
        var angleBetweenLine3AndCenterRight = calculateAngleBetweenLines(line3, centerRight, "remove-line")

        label1.set({
            text:angleBetweenLine3AndCenterRight+"\u00B0"
        })
    }
    

}



$(".disply-btn").click(function (e) {
    var id = e.target.id;
    var disSize = document.getElementById(id).textContent;

    //setDisplaySize(disSize)
})

function setDisplaySize(size) {
    console.log("requested-size--->", size)

    var sizeArr = size.split("*");
    var requestedWidth = sizeArr[0];
    var requestedHeight = sizeArr[1];

    const ratio = canvas.getWidth() / canvas.getHeight();
    const outerCanvasContainer = $('.canvas-wrapper')[0];


    const containerWidth = outerCanvasContainer.clientWidth;
    const containerHeight = outerCanvasContainer.clientHeight;
    const scale = containerWidth / canvas.getWidth();
    const zoom = canvas.getZoom() * scale;
    canvas.setDimensions({ width: requestedWidth, height: requestedHeight / ratio });
    canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
}




function setLineOnPointMove(centerRight_,centerLeft_,p){
    // updateLabel(label1,p,gdata.angleNL2L1,"update lable on point2 move")
    var labels = getAllElementByName("label")
    var newPointArr = getAllElementByName('newPoint');
    var newLineArr = getAllElementByName('newLine');
        if(labels.length == 0){
            return;
        }
    else if(labels.length > 0 && labels.length <=2){
        console.log("angle---/>",gdata.angleL1L3);
       let updatedPointForAddedLine1 = calculate_third_point(centerPointX, centerPointY, centerRight_.x2, centerRight_.y2, 200, 200, -gdata.angleL1L3/2, true);
       let updatedPointForAddedLine2 = calculate_third_point(centerPointX, centerPointY, centerRight_.x2, centerRight_.y2, 200, 200, -gdata.angleL1L3/4, true);
      
       console.log("updatedPointForAddedLine1---/>",updatedPointForAddedLine1);
        console.log("updatedPointForAddedLine2---/>",updatedPointForAddedLine2)
        if(newLineArr.length  == 1){
            newLineArr[0].set({
                x2: updatedPointForAddedLine1.Bx,
                y2: updatedPointForAddedLine1.By
               })
               newPointArr[0].set({
               left: updatedPointForAddedLine1.Bx,
                top: updatedPointForAddedLine1.By
               })

               labels[0].set({
                left: newPointArr[0].left+20,
                top: newPointArr[0].top+50
              })
            //   labels[1].set({
            //     text:angleBetweenNewLine1AndNewLine2+"\u00B0"
            //   })
        }else if(newLineArr.length == 2){
            newLineArr[0].set({
                x2: updatedPointForAddedLine1.Bx,
                y2: updatedPointForAddedLine1.By
               })
               

               newLineArr[1].set({
                x2: updatedPointForAddedLine2.Bx,
                y2: updatedPointForAddedLine2.By
               })

               newPointArr[0].set({
                left: updatedPointForAddedLine1.Bx,
                 top: updatedPointForAddedLine1.By
                })
                newPointArr[1].set({
                    left: updatedPointForAddedLine2.Bx,
                     top: updatedPointForAddedLine2.By
                    })

                    labels[0].set({
                        left: newPointArr[0].left +20,
                        top: newPointArr[0].top +50
                      })

                      labels[1].set({
                        left: newPointArr[1].left +20,
                        top: newPointArr[1].top +50
                      })

            //    labels[0].set({
            //     text:angleBetweenLine1AndNewLine1+"\u00B0"
            //   })
            //   labels[1].set({
            //     text:angleBetweenNewLine1AndNewLine2+"\u00B0"
            //   })
            //   labels[2].set({
            //     text:angleBetweenNewLine2AndCentereLine+"\u00B0"
            //   })
        }
      
    }
}

// JavaScript Document

addDrawTools({
	snapLinesTogether:true,
	drawArea:[0,0,1200,700],
	retainCursorCanvas:true,
	zIndex:10,
	thickness:3
});
draw.drawArcCenter = true;
var snapToObj2Mode = 'all';
var snapToObj2On = true;
draw.mode = 'interact';
var disabled = false;
draw.path = [{
		obj: [{
				type: "buttonCompassHelp",
				left: 30,
				top: 30,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				}
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "compassHelp",
				left: 115,
				top: 20,
				interact: {
					overlay: true
				}
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "buttonColorPicker",
				left: 30,
				top: 172.211,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				},
				_disabled:disabled
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "colorPicker",
				colors: ["#000", "#999", "#00F", "#F00", "#393", "#F0F", "#93C", "#F60"],
				left: 95,
				top: 174.086,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				},
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "buttonLine",
				left: 30,
				top: 235.467,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				}
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "buttonPen",
				left: 30,
				top: 298.722,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				}
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "buttonCompass",
				left: 30,
				top: 361.978,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				}
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "buttonProtractor",
				left: 30,
				top: 425.233,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj);
						if (draw.protractorVisible === true) {
							o('protractorBox').visible = true;
							o('protractorSlider').visible = true;
							o('protractorButton').visible = true;
						} else {
							o('protractorBox').visible = false;
							o('protractorSlider').visible = false;
							o('protractorButton').visible = false;
						}
					},
					overlay: true
				}
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "buttonRuler",
				left: 30,
				top: 488.489,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				}
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "buttonUndo",
				left: 30,
				top: 551.744,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				}
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "buttonClear",
				left: 30,
				top: 615,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				}
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "buttonLineWidthPicker",
				left: 30,
				top: 108.956,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				},
				_disabled:disabled
			}
		],
		_deletable: false
	}, {
		obj: [{
				type: "lineWidthSelect",
				left: 95,
				top: 108.956,
				interact: {
					click: function (obj) {
						draw[obj.type].click(obj)
					},
					overlay: true
				},
				_disabled:disabled
			}
		],
		_deletable: false
	}, {
		"obj": [{
				"type":"text2",
				"rect":[870,565,310,115],
				"text":["Protractor"],
				"align":"center",
				"fontSize":24,
				"box":{"type":"loose","borderColor":"#000","borderWidth":3,"radius":0,"color":"#E1F6FE"},
				"bold":true,
				id:'protractorBox',
				visible:false
		}],
		_deletable: false
	},{
		"obj":[{
			"type":"slider",
			"left":1050,
			"top":625,
			"width":120,
			"radius":15,
			"value":1/8,
			"lineWidth":4,
			"color":"#000",
			"fillColor":"#00F",
			"interact":{
				"onchange":function(obj) {
					if (un(draw.protractor)) return;
					draw.protractor.radius = 200+400*obj.value;
					drawToolsCanvas();
				}
			},
			id:'protractorSlider',
				visible:false
		}],
		_deletable: false
	},{
		"obj": [{
			"type":"text2",
			"rect":[900,615,120,50],
			"text":["Numbers"],
			"align":[0,0],
			"fontSize":24,
			"box":{"type":"loose","borderColor":"#000","borderWidth":3,"radius":15,color:'#F90'},
			id:'protractorButton',
			interact:{
				click:function() {
					if (un(draw.protractor)) return;
					draw.protractor.numbers = !draw.protractor.numbers;
					o('protractorButton').box.color = draw.protractor.numbers === true ? '#F90' : '#FFC';
					drawToolsCanvas();
				}
			},
			visible:false
		}],
		_deletable: false
	}
];
drawCanvasPaths();
calcCursorPositions();

var moreInteractivesButton = newctx({rect:[0,0,325,40],z:200000000000,vis:true,pE:true}).canvas;
resizeCanvas(moreInteractivesButton,1200-345,20);
var paths = [{obj:[{type:"text2",rect:[1,1,323,38],box:{type:"loose",borderColor:"#000",color:'#FFF',borderWidth:2,radius:5},text:["<<align:right>><<font:Hobo>><<fontSize:28>><<color:#00F>>More Interactive Tools..."],align:[0,0]}]}];
drawPathsToCanvas(moreInteractivesButton,paths);
var homeImage = new Image;
homeImage.onload = function() {
	draw.hiddenCanvas.ctx.clear();
	draw.hiddenCanvas.ctx.drawImage(homeImage,0,0,34,34);
	homeImage.imageData = draw.hiddenCanvas.ctx.getImageData(0,0,34,34);
	var length = homeImage.imageData.length;
	for (var i=0; i < length; i+=4) {
		if (homeImage.imageData[i] >= 245 && homeImage.imageData[i+1] >= 245 && homeImage.imageData[i+2] >= 245) {
			homeImage.imageData[i+3] = 0;
		}
	}
	moreInteractivesButton.ctx.putImageData(homeImage.imageData,6,3);
	draw.hiddenCanvas.ctx.clear();
}
homeImage.src = "./images/logoSmall.PNG";
addListener(moreInteractivesButton,function() {
	window.open('/resources.php?interactives=1','_blank');
});

var j227backImgAdded = false;
var j227imgSlider;
var j227imgScale = 1;
function j227imgScaleChange() {
	var obj = draw.path[0].obj[0];
	if (obj.type !== 'image') return;
	obj.width = j227imgScale * obj.naturalWidth;
	obj.height = j227imgScale * obj.naturalHeight;
	obj.left = 600 - obj.width / 2;
	obj.top = 350 - obj.height / 2;
	drawCanvasPaths();
}
var j227dropZone = draw.cursorCanvas;
j227dropZone.addEventListener("dragenter", handleDragEnter, false);
j227dropZone.addEventListener("dragover", handleDragOver, false);
j227dropZone.addEventListener("drop", handleDrop, false);
function handleDragEnter(e){e.stopPropagation();e.preventDefault();}
function handleDragOver(e){e.stopPropagation();e.preventDefault();}
function handleDrop(e){
	e.stopPropagation();
	e.preventDefault();
	/*if (['super','teacher','pupil'].indexOf (user) == -1) {
		Notifier.notify('Please subscribe to use this feature.','','./images/logoSmall.PNG');
		return;
	}*/
	handleFiles(e.dataTransfer.files);
	if (e.dataTransfer.files.length == 0) {
		var img = e.dataTransfer.getData('text/html');
		var div = document.createElement("div");
		div.innerHTML = img;
		if (un(div.getElementsByTagName('img')[0]) || un(div.getElementsByTagName('img')[0].src)) {
			return;
		}
		
		var aImg = document.createElement("img");
		aImg.classList.add("obj");
		aImg.onload = function() {
			var width = aImg.naturalWidth;
			var height = aImg.naturalHeight;
			if (!un(draw.path) && !un(draw.path[0]) && !un(draw.path[0].obj) && !un(draw.path[0].obj[0]) && draw.path[0].obj[0].type == 'image') {
				draw.path.shift();
			}
			draw.path.unshift({obj:[{
				type:'image',
				image:aImg,
				src:aImg.src,
				thickness:draw.thickness,
				color:draw.color,
				left:600-width/2,
				top:350-height/2,
				width:width,
				height:height,
				naturalWidth:aImg.naturalWidth,
				naturalHeight:aImg.naturalHeight,
				scaleFactor:2,
				edit:false
			}],selected:false,_deletable:false});
			drawCanvasPaths();
			//hideObj(j227imgctx.canvas);
			if (j227backImgAdded == false) {
				j227imgSlider = createSlider({left:1020,width:150,height:60,top:700-60-20,min:0.1,max:1.5,linkedVar:'j227imgScale',varChangeListener:'j227imgScaleChange',startNum:1,label:false,zIndex:1000});
			} else {
				showSlider(j227imgSlider);
				setSliderValue(j227imgSlider,1);
			}
			j227backImgAdded = true;
		}
		aImg.src = div.getElementsByTagName('img')[0].src;
	}
}
function handleFiles(files) { // read & create an image from the image file
	for (var i = 0; i < files.length; i++) {
	  var file = files[i];
	  var imageType = /image.*/;
	  if (!file.type.match(imageType)) continue;
	  var img = document.createElement("img");
	  img.classList.add("obj");
	  img.file = file;
	  var reader = new FileReader();
	  reader.onload = (function(aImg) {
		  return function(e) {
			  aImg.onload = function() {
			  	var width = aImg.naturalWidth;
				var height = aImg.naturalHeight;
				if (!un(draw.path) && !un(draw.path[0]) && !un(draw.path[0].obj) && !un(draw.path[0].obj[0]) && draw.path[0].obj[0].type == 'image') {
					draw.path.shift();
				}
				draw.path.unshift({obj:[{
					type:'image',
					_image:aImg,
					src:aImg.src,
					thickness:draw.thickness,
					color:draw.color,
					left:600-width/2,
					top:350-height/2,
					width:width,
					height:height,
					naturalWidth:aImg.naturalWidth,
					naturalHeight:aImg.naturalHeight,
					scaleFactor:2,
					edit:false
				}],selected:false,_deletable:false});
				drawCanvasPaths();
				//hideObj(j227imgctx.canvas);
				if (j227backImgAdded == false) {
					j227imgSlider = createSlider({left:1020,width:150,height:60,top:700-60-20,min:0.1,max:1.5,linkedVar:'j227imgScale',varChangeListener:'j227imgScaleChange',startNum:1,label:false,zIndex:1000});
				} else {
					showSlider(j227imgSlider);
					setSliderValue(j227imgSlider,1);
				}
				j227backImgAdded = true;
			  }
			  // e.target.result is a dataURL for the image
			  aImg.src = e.target.result;
		  }; 
	  })(img);
	  reader.readAsDataURL(file);      
	}
}
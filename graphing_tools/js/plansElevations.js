// Javascript Document

var n = {
	ctx: newctx(),
	ctx2: newctx(),
	ctx3: newctx({vis:false}),

	front: {
		rect: [600, 420, 240, 240]
	},
	plan: {
		rect: [600, 70, 240, 240]
	},
	side: {
		rect: [920, 420, 240, 240]
	},

	/*getControlPanelData: function(obj) {
		var elements = [
			{name:'Opacity',bold:false,fontSize:18,margin:0.1,type:'slider',value:'alpha',min:0,max:1,step:0.01},
		];
		if (draw.three.checkPathForType(obj,'pyramid') || draw.three.checkPathForType(obj,'prism')) {
			elements.push({name:'Vertices',bold:false,fontSize:18,margin:0.05,type:'increment',increment:draw.three.verticesChange,min:3,max:20})
		}
		return {obj:obj,elements:elements};
	},*/
	
	opacity: createSlider({
		left:160,top:620,width:150,height:60,linkedVar:'draw.path[0].obj[0].alpha',min:0,max:1,startNum:0.5,label:false,zIndex:10000,onchange:drawCanvasPaths
	}),
	verticesMinus: newctx({rect:[450,630,40,40],pE:true,z:10000}).canvas,
	verticesPlus: newctx({rect:[487,630,40,40],pE:true,z:10000}).canvas,
	
	cubeBuilding: {
		obj: [{
				type: "three",
				center: [300, 350],
				gridSize: 300,
				gridStep: 50,
				gridBounds: [[-3,3],[-3,3],[0,5]],
				fillStyle: "#F99",
				alpha: 1,
				paths3d: [{
						type: "grid",
						squares: 6,
						size: 50,
						direction: [0, 0, 1],
						color: "#CCC",
						alpha: 1
					}, {
						type: 'arrow',
						pos: [[240, 0, 0], [170, 0, 0]],
						fill: true,
						color: '#000',
						alpha: 1
					},{type:"cuboid",pos:[50,-50,0],dims:[50,50,50]},{type:"cuboid",pos:[0,-50,0],dims:[50,50,50]},{type:"cuboid",pos:[0,0,0],dims:[50,50,50]},{type:"cuboid",pos:[-50,0,0],dims:[50,50,50]}
				],
				drawBackFaces: "none",
				drawFaceNormals: false,
				faceGrid: false,
				cubeBuildingMode: true,
				brightness: 1,
				contrast: 0.49,
				tilt: 0.5 / (7 / 8),
				angle: 1.25 * Math.PI,
				id: 'interactive'
			}
		],
		interact: {
			cubeBuilding: 'build',
			drag3d: true,
			edit3dShape: false
		}
	},
	cuboid: {
		obj: [{
				type: "three",
				center: [300, 350],
				gridSize: 360,
				gridStep: 50,
				gridBounds: [[-3,3],[-3,3],[0,5]],
				pointRadius:12,
				fillStyle: "#F99",
				alpha: 1,
				paths3d: [{
						type: "grid",
						squares: 6,
						size: 50,
						direction: [0, 0, 1],
						color: "#CCC",
						alpha: 1
					}, {
						type: 'arrow',
						pos: [[240, 0, 0], [170, 0, 0]],
						fill: true,
						color: '#000',
						alpha: 1
					}, {type:"cuboid",pos:[-100,-50,0],dims:[150,100,50]}
				],
				drawBackFaces: "auto",
				drawFaceNormals: false,
				faceGrid: true,
				cubeBuildingMode: false,
				brightness: 1,
				contrast: 0.49,
				tilt: 0.5 / (7 / 8),
				angle: 1.25 * Math.PI,
				id: 'interactive'
			}
		],
		interact: {
			cubeBuilding: 'none',
			drag3d: true,
			edit3dShape: true
		}
	},
	prism: {
		obj: [{
				type: "three",
				center: [300, 350],
				gridSize: 360,
				gridStep: 50,
				gridBounds: [[-3,3],[-3,3],[0,5]],
				pointRadius:12,
				fillStyle: "#F99",
				alpha: 0.5,
				paths3d: [{
						type: "grid",
						squares: 6,
						size: 50,
						direction: [0, 0, 1],
						color: "#CCC",
						alpha: 1
					}, {
						type: 'arrow',
						pos: [[240, 0, 0], [170, 0, 0]],
						fill: true,
						color: '#000',
						alpha: 1
					}, {type:"prism",polygon:[[86.6,-50],[86.6,50],[0,100],[-86.6,50],[-86.6,-50],[0,-100]],center:[0,0,0],height:150}
				],
				drawBackFaces: "auto",
				drawFaceNormals: false,
				faceGrid: false,
				cubeBuildingMode: false,
				brightness: 1,
				contrast: 0.49,
				tilt: 0.5 / (7 / 8),
				angle: 1.25 * Math.PI,
				id: 'interactive'
			}
		],
		interact: {
			cubeBuilding: 'none',
			drag3d: true,
			edit3dShape: true
		}
	},
	pyramid: {
		obj: [{
				type: "three",
				center: [300, 350],
				gridSize: 360,
				gridStep: 50,
				gridBounds: [[-3,3],[-3,3],[0,5]],
				pointRadius:12,
				fillStyle: "#F99",
				alpha: 0.5,
				paths3d: [{
						type: "grid",
						squares: 6,
						size: 50,
						direction: [0, 0, 1],
						color: "#CCC",
						alpha: 1
					}, {
						type: 'arrow',
						pos: [[240, 0, 0], [170, 0, 0]],
						fill: true,
						color: '#000',
						alpha: 1
					}, {type:"pyramid",polygon:[[86.6,-50],[86.6,50],[0,100],[-86.6,50],[-86.6,-50],[0,-100]],center:[0,0,0],height:150}
				],
				drawBackFaces: "auto",
				drawFaceNormals: false,
				faceGrid: false,
				cubeBuildingMode: false,
				brightness: 1,
				contrast: 0.49,
				tilt: 0.5 / (7 / 8),
				angle: 1.25 * Math.PI,
				id: 'interactive'
			}
		],
		interact: {
			cubeBuilding: 'none',
			drag3d: true,
			edit3dShape: true
		}
	},

	startMode: 'cubeBuilding',
	mode: '',

	modes:[{title:'Cube Building',key:'cubeBuilding'},{title:'Cuboid',key:'cuboid'}/*,{title:'Prism',key:'prism'},{title:'Pyramid',key:'pyramid'}*/],
	modeMenu: dropMenu({
		title:'<<align:center>><<fontSize:24>>Cube Building',
		data:[
			'<<align:center>><<fontSize:24>>Cube Building',
			'<<align:center>><<fontSize:24>>Cuboid',
			//'<<align:center>><<fontSize:24>>Prism',
			//'<<align:center>><<fontSize:24>>Pyramid'
		],
		buttonRect:[900,22.5,220,40],
		listRect:[900,62.5,220,40],
		func:function() {
			var p = page[pageIndex];
			var menu = p.modeMenu;
			if (p.mode == menu.selected) return;
			p.changeMode(p.modes[menu.selected].key);
			menu.title = '<<align:center>><<fontSize:24>>'+p.modes[menu.selected].title;
			menu.canvas1.draw();
			drawCanvasPaths();
		}	
	}),
	
	changeMode: function(mode) {
		if (this.mode == mode) return;
		var ctx = page[pageIndex].ctx2;
		ctx.clear();
		var obj = draw.getObjById('interactive');
		if (this.mode !== '') this[this.mode] = draw.path.shift();
		this.mode = mode;
		draw.path.unshift(this[this.mode]);

		if (this.mode == 'cubeBuilding') {
			showObj(this.toggleBuildModeButton);
			this.toggleBuildModeButton.draw();
			hideObj(this.verticesMinus);
			hideObj(this.verticesPlus);
			hideObj(this.ctx3.canvas);
			hideSlider(this.opacity);
			for (var p = 0; p < draw.path.length; p++) {
				if (draw.path[p].obj[0].id == 'interactive') {
					var path = draw.path[p];
					break;
				}
			}
			if (path.interact.cubeBuilding == 'build') {
				text({ctx:ctx,align:[0,0],rect:[50,550,500,60],text:['<<fontSize:24>>Click on the grid to build cubes.'+br+'Drag around the edge to change the view.']});
			} else {
				text({ctx:ctx,align:[0,0],rect:[50,550,500,60],text:['<<fontSize:24>>Click on cubes to remove.'+br+'Drag to change the view.']});
			}
		} else {
			hideObj(this.toggleBuildModeButton);
			if (this.mode == 'prism' || this.mode == 'pyramid') {
				showObj(this.verticesMinus);
				showObj(this.verticesPlus);
				showObj(this.ctx3.canvas);
				showSlider(this.opacity);
			}			
		}
		drawCanvasPaths();
		calcCursorPositions();
		//for (var b = 0; b < this.modeButtons.length; b++) this.modeButtons[b].draw();
	},
	toggleBuildMode: function () {
		var ctx = page[pageIndex].ctx2;
		ctx.clear();
		for (var p = 0; p < draw.path.length; p++) {
			if (draw.path[p].obj[0].id == 'interactive') {
				var path = draw.path[p];
				break;
			}
		}
		if (path.interact.cubeBuilding == 'build') {
			path.interact.cubeBuilding = 'remove';
			text({ctx:ctx,align:[0,0],rect:[50,550,500,60],text:['<<fontSize:24>>Click on cubes to remove.'+br+'Drag to change the view.']});
		} else {
			path.interact.cubeBuilding = 'build';
			text({ctx:ctx,align:[0,0],rect:[50,550,500,60],text:['<<fontSize:24>>Click on the grid to build cubes.'+br+'Drag around the edge to change the view.']});
		}
		page[pageIndex].toggleBuildModeButton.draw();
		calcCursorPositions();
	},
	beforeDraw: function () {
		var n = page[pageIndex];
		
		//copy interactive paths
		var interactive = draw.getObjById('interactive');
		var alpha = interactive.alpha;
		var paths3d = [];
		for (var p = 0; p < interactive.paths3d.length; p++) {
			var path3d = interactive.paths3d[p];
			if (n.mode == 'cubeBuilding' && path3d.type == 'cuboid') {
				var path3d2 = {};
				for (var key in path3d) {
					if (key.indexOf('_') !== 0) {
						path3d2[key] = clone(path3d[key]);
					}
				}
				draw.three.path3d.cuboid.scale(path3d2, 40 / 50);
				paths3d.push(path3d2);
			} else if (n.mode == 'prism' && path3d.type == 'prism' || n.mode == 'pyramid' && path3d.type == 'pyramid' || n.mode == 'cuboid' && path3d.type == 'cuboid') {
				var path3d2 = {};
				for (var key in path3d) {
					if (key.indexOf('_') !== 0) {
						path3d2[key] = clone(path3d[key]);
					}
				}
				draw.three.path3d[path3d.type].scale(path3d2, 40 / 50);
				paths3d.push(path3d2);
			}
		}
		draw.getObjById('plan').paths3d = paths3d;
		draw.getObjById('plan').alpha = alpha;
		draw.getObjById('front').paths3d = paths3d;
		draw.getObjById('front').alpha = alpha;
		draw.getObjById('side').paths3d = paths3d;
		draw.getObjById('side').alpha = alpha;
		
		
	},
	afterDraw: function() {
		//var n = page[pageIndex];
		//n.ctx2.clear();
		/*if (['prism','pyramid'].includes(n.mode)) {
			var obj = draw.getObjById('interactive');
			n.controlPanelData = n.getControlPanelData(obj);
			draw.controlPanel.draw(n.ctx2,obj,draw.path[0],n.controlPanelData,[200,550,200]);
		}*/
		
		/*var rect = [300+220,350+220];
		var ctx = n.ctx2;
		ctx.strokeStyle = '#00F';
		ctx.lineWidth = 5;
		var pos1 = [rect[0]-20,rect[1]-60];
		var pos2 = [rect[0]-60,rect[1]-20];
		var controlPos = [rect[0]-30,rect[1]-30];
		ctx.beginPath();
		ctx.moveTo(pos1[0],pos1[1]);
		ctx.quadraticCurveTo(controlPos[0],controlPos[1],pos2[0],pos2[1]);				
		ctx.stroke();
		drawArrow({context:ctx,startX:controlPos[0],startY:controlPos[1],finX:pos1[0],finY:pos1[1],arrowLength:8,color:ctx.strokeStyle,lineWidth:0,arrowLineWidth:ctx.lineWidth,fillArrow:true,showLine:false,angleBetweenLinesRads:0.7});
		drawArrow({context:ctx,startX:controlPos[0],startY:controlPos[1],finX:pos2[0],finY:pos2[1],arrowLength:8,color:ctx.strokeStyle,lineWidth:0,arrowLineWidth:ctx.lineWidth,fillArrow:true,showLine:false,angleBetweenLinesRads:0.7});
		*/
		//text({ctx:n.ctx2,rect:[300+200,350+200,100,100],align:[-1,-1],text:['Drag Me'],box:{type:'tight',color:'#FCC',borderColor:'#000',bordeWidth:3,radius:5}});
	
		calcCursorPositions();
	},
	toggleVis: function (e) {
		var type = e.target.type;
		var obj = draw.getObjById(type);
		var vis = !boolean(obj.visible, true);
		obj.visible = vis;
		
		if (type !== 'interactive') {
			var gridObj = draw.getObjById(type + 'Grid');
			gridObj.visible = vis;
		} else {
			
		}
		
		e.target.ctx.clear();
		var txt = vis == true ? 'Hide' : 'Show';
		text({
			ctx: e.target.ctx,
			rect: [1, 1, 65 - 2, 30 - 2],
			align: [0, 0],
			text: ['<<fontSize:20>>' + txt],
			box: {
				type: 'loose',
				color: '#CCF',
				borderColor: '#000',
				borderWidth: 2,
				radius: 8
			}
		});
		drawCanvasPaths();
		calcCursorPositions();
	},
	load: function () {
		this.homeImagectx = newctx({rect:[1185-55,15,55,55],pE:true,z:10000});
		addListener(this.homeImagectx.canvas,function() {
			window.open('https://www.mathspad.co.uk','_blank');
		});
		this.homeImage = new Image;
		this.homeImage.onload = function() {
			text({ctx:page[pageIndex].homeImagectx,textArray:[''],left:1.5,top:1.5,width:55-3,height:55-3,align:'center',vertAlign:'middle',box:{type:'loose',borderWidth:3,borderColor:'#000',color:'#FFF',radius:10}});
			page[pageIndex].homeImagectx.drawImage(page[pageIndex].homeImage, 4.5*1.1, 4*1.1, 42*1.1, 42*1.1);
			text({ctx:page[pageIndex].homeImagectx,textArray:[''],left:1.5,top:1.5,width:55-3,height:55-3,align:'center',vertAlign:'middle',box:{type:'loose',borderWidth:3,borderColor:'#000',color:'none',radius:10}});
			
		}
		this.homeImage.src = "./images/logoSmall.PNG";		
		
		
		text({ctx:this.ctx3,align:[-1,0],rect:[70,620,200,60],text:['<<fontSize:24>>Opacity']});
		text({ctx:this.ctx3,align:[-1,0],rect:[345,620,200,60],text:['<<fontSize:24>>Vertices']});
		
		text({ctx:this.verticesMinus.ctx,align:[0,0],rect:[1.5,1.5,37,37],text:['<<fontSize:36>>-'],box:{type:'loose',color:'#9FC',borderColor:'#000',borderWidth:3}});
		text({ctx:this.verticesPlus.ctx,align:[0,0],rect:[1.5,1.5,37,37],text:['<<fontSize:36>>+'],box:{type:'loose',color:'#9FC',borderColor:'#000',borderWidth:3}});
		addListener(this.verticesMinus,function() {
			var obj = draw.getObjById('interactive');
			draw.three.verticesChange(obj,-1);
			drawCanvasPaths();
		});
		addListener(this.verticesPlus,function() {
			var obj = draw.getObjById('interactive');
			for (var p = 0; p < obj.paths3d.length; p++) {
				if (['prism','pyramid'].includes(obj.paths3d[p].type)) {
					var path3d = obj.paths3d[p];
					if (path3d.polygon.length > 19) return;
				}
			}
			draw.three.verticesChange(obj,1);
			drawCanvasPaths();
		});
		
		text({
			ctx: this.ctx,
			rect: [this.plan.rect[0], this.plan.rect[1] - 50, this.plan.rect[2], 50],
			align: [-1, 0],
			text: ['<<fontSize:24>>Plan View']
		});
		text({
			ctx: this.ctx,
			rect: [this.front.rect[0], this.front.rect[1] - 50, this.front.rect[2], 50],
			align: [-1, 0],
			text: ['<<fontSize:24>>Front Elevation']
		});
		text({
			ctx: this.ctx,
			rect: [this.side.rect[0], this.side.rect[1] - 50, this.side.rect[2], 50],
			align: [-1, 0],
			text: ['<<fontSize:24>>Side Elevation']
		});
		text({
			ctx: this.ctx,
			rect: [40,20,500, 50],
			align: [-1, 0],
			text: ['<<fontSize:28>>Interactive']
		});		

		addDrawTools({
			color: '#F00',
			thickness: 5
		});
		draw.path.push({
			obj: [{
					type: "three",
					center: [this.plan.rect[0] + 0.5 * this.plan.rect[2], this.plan.rect[1] + 0.5 * this.plan.rect[3]],
					gridSize: 240,
					gridStep: 40,
					fillStyle: "#F99",
					alpha: 1,
					paths3d: [],
					drawBackFaces: "none",
					drawFaceNormals: false,
					faceGrid: false,
					cubeBuildingMode: true,
					brightness: 1,
					contrast: 0,
					tilt: 1,
					angle: 1.5 * Math.PI,
					id: 'plan'
				}
			]
		}, {
			obj: [{
					type: "three",
					center: [this.front.rect[0] + 0.5 * this.front.rect[2], this.front.rect[1] + this.front.rect[3]],
					gridSize: 240,
					gridStep: 40,
					fillStyle: "#F99",
					alpha: 1,
					paths3d: [],
					drawBackFaces: "none",
					drawFaceNormals: false,
					faceGrid: false,
					cubeBuildingMode: true,
					brightness: 1,
					contrast: 0,
					tilt: 0,
					angle: 1.5 * Math.PI,
					id: 'front'
				}
			]
		}, {
			obj: [{
					type: "three",
					center: [this.side.rect[0] + 0.5 * this.side.rect[2], this.side.rect[1] + this.side.rect[3]],
					gridSize: 240,
					gridStep: 40,
					fillStyle: "#F99",
					alpha: 1,
					paths3d: [],
					drawBackFaces: "none",
					drawFaceNormals: false,
					faceGrid: false,
					cubeBuildingMode: true,
					brightness: 1,
					contrast: 0,
					tilt: 0,
					angle: 1 * Math.PI,
					id: 'side'
				}
			]
		});

		this.interactiveVisButton = newctx({
				rect: [190,30, 65, 30],
				pE: true,
				z: 10000
			}).canvas;
		this.interactiveVisButton.type = 'interactive';
		addListener(this.interactiveVisButton, this.toggleVis);
		text({
			ctx: this.interactiveVisButton.ctx,
			rect: [1, 1, 65 - 2, 30 - 2],
			align: [0, 0],
			text: ['<<fontSize:20>>Hide'],
			box: {
				type: 'loose',
				color: '#CCF',
				borderColor: '#000',
				borderWidth: 2,
				radius: 8
			}
		});
		
		var types = ['plan', 'front', 'side'];
		for (var t = 0; t < types.length; t++) {
			var type = types[t];
			draw.path.unshift({
				obj: [{
						type: "simpleGrid",
						left: this[type].rect[0],
						top: this[type].rect[1],
						width: this[type].rect[2],
						height: this[type].rect[3],
						xMin: -0.01,
						xMax: 6.01,
						yMin: -0.01,
						yMax: 6.01,
						xMajorStep: 1,
						xMinorStep: 1,
						yMajorStep: 1,
						yMinorStep: 1,
						showLabels: false,
						showScales: false,
						dots: false,
						showGrid: true,
						showAxes: false,
						showBorder: false,
						color: "#999",
						thickness: 2,
						id: type + 'Grid'
					}
				]
			});
			this[type].visButton = newctx({
					rect: [this[type].rect[0] + this[type].rect[2] - 65, this[type].rect[1] - 40, 65, 30],
					pE: true,
					z: 10000
				}).canvas;
			this[type].visButton.type = type;
			addListener(this[type].visButton, this.toggleVis);
			text({
				ctx: this[type].visButton.ctx,
				rect: [1, 1, 65 - 2, 30 - 2],
				align: [0, 0],
				text: ['<<fontSize:20>>Hide'],
				box: {
					type: 'loose',
					color: '#CCF',
					borderColor: '#000',
					borderWidth: 2,
					radius: 8
				}
			});
		}

		draw.beforeDraw = this.beforeDraw;
		draw.afterDraw = this.afterDraw;
		changeDrawMode('interact');
		draw.mode = 'interact';
		draw.updateAllBorders();

		this.toggleBuildModeButton = newctx({
				rect: [190, 630, 220, 40],
				pE: true,
				z: 10000
			}).canvas;
		this.toggleBuildModeButton.parent = this;
		this.toggleBuildModeButton.draw = function () {
			this.ctx.clear();
			for (var p = 0; p < draw.path.length; p++) {
				if (draw.path[p].obj[0].id == 'interactive') {
					var path = draw.path[p];
					break;
				}
			}
			var mode = path.interact.cubeBuilding;

			var color = mode == 'build' ? '#3F3' : '#CCC';
			text({
				ctx: this.ctx,
				rect: [1, 1, 96.5 - 2, 40 - 2],
				align: [-1, 0],
				text: ['<<fontSize:20>> Build'],
				box: {
					type: 'loose',
					color: color,
					borderColor: color,
					borderWidth: 0.01,
					radius: 0
				}
			});

			var color = mode == 'remove' ? '#F33' : '#CCC';
			text({
				ctx: this.ctx,
				rect: [96.5 + 1, 1, 220 - 96.5 - 2, 40 - 2],
				align: [1, 0],
				text: ['<<fontSize:20>>Remove'],
				box: {
					type: 'loose',
					color: color,
					borderColor: color,
					borderWidth: 0.01,
					radius: 0
				}
			});

			text({
				ctx: this.ctx,
				rect: [1, 1, 220 - 2, 40 - 2],
				align: [0, 0],
				text: [''],
				box: {
					type: 'loose',
					color: 'none',
					borderColor: '#000',
					borderWidth: 2,
					radius: 8
				}
			});

			this.ctx.beginPath();
			this.ctx.strokeStyle = '#000';
			this.ctx.lineWidth = 2;
			this.ctx.fillStyle = '#FFF';
			this.ctx.moveTo(83, 5);
			this.ctx.lineTo(110, 5);
			this.ctx.arc(110, 20, 15, 1.5 * Math.PI, 0.5 * Math.PI);
			this.ctx.lineTo(83, 35);
			this.ctx.arc(83, 20, 15, 0.5 * Math.PI, 1.5 * Math.PI);
			this.ctx.fill();
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.fillStyle = '#000';
			if (mode == 'build') {
				this.ctx.arc(83, 20, 11, 0, 2 * Math.PI);
			} else {
				this.ctx.arc(110, 20, 11, 0, 2 * Math.PI);
			}
			this.ctx.fill();
			this.ctx.stroke();
		}
		addListener(this.toggleBuildModeButton, function () {
			n.toggleBuildMode()
		});
		
		/*var modes = ['cubeBuilding','prism','pyramid'];
		var modeNames = ['Cubes','Prism','Pyramid'];
		this.modeButtons = [];
		for (var m = 0; m < modes.length; m++) {
			var button = newctx({rect:[50+m*98,50,100,40],pE:true,z:10000}).canvas;
			button.mode = modes[m];
			button.name = modeNames[m];
			button.draw = function() {
				this.ctx.clear();
				var color = page[pageIndex].mode == this.mode ? '#CCF' : '#FFC';
				text({ctx:this.ctx,align:[0,0],text:[this.name],box:{color:color,borderWidth:3,borderColor:'#000'}});
			}
			button.draw();
			addListener(button,function(e) {
				page[pageIndex].changeMode(e.target.mode);
			});
			this.modeButtons.push(button);
		}*/
		
		this.changeMode(this.startMode);
		this.toggleBuildModeButton.draw();
	}
};

if (un(page))
	page = [];
page[pageIndex] = n;
n.load();
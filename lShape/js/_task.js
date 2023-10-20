// Javascript document

if (un(draw)) var draw = {};
var stats = {
	sum:function(dataset) {
		return dataset.reduce(function(acc,data) {return acc+data;},0);
	},
	min:function(dataset) {
		return dataset.reduce(function(acc,data) {return Math.min(acc,data);});		
	},
	max:function(dataset) {
		return dataset.reduce(function(acc,data) {return Math.max(acc,data);});
	},
	mean:function(dataset) {
		return dataset.reduce(function(acc,data) {return acc+data;},0) / dataset.length;
	},
	median:function(dataset) {
		dataset.sort();
		var len = dataset.length;
		if (len % 2 === 1) {
			return dataset[(len-1)/2];
		} else {
			return (dataset[(len/2)-1]+dataset[len/2])/2;
		}
	},
	mode:function(dataset) {
		var freqTable = stats.freqTable(dataset);
		var modes = [];
		var maxFreq = 0;
		for (var key in freqTable) {
			var freq = freqTable[key];
			if (freq > maxFreq) {
				maxFreq = freq;
				modes = [];
			}
			if (freq > 1 && freq === maxFreq) {
				if (!isNaN(Number(key))) key = Number(key);
				modes.push(key);
			}
		}
		return modes;
	},
	range:function(dataset) {
		return stats.max(dataset)-stats.min(dataset);
	},
	freqTable:function(dataset,asKeyValuePairs) {
		var freqTable = {};
		for (var d = 0; d < dataset.length; d++) {
			var value = dataset[d];
			if (un(freqTable[value])) freqTable[value] = 0;
			freqTable[value]++;
		}
		if (asKeyValuePairs === true) {
			var freqTable2 = [];
			for (var key in freqTable) freqTable2.push(key,freqTable[key]);
			return freqTable2;
		} else {
			return freqTable;
		}
	}
}

var taskTitleCoding = {
	codes: [['\\.times\\.','×'],['\\.divide\\.','÷'],['\\.sqrt\\.','√'],['\\.cuberoot\\.','∛'],['\\.squared\\.','²'],['\\.cubed\\.','³'],['\\.degrees\\.','°']],
	encode: function(str) {
		for (var c = 0; c < this.codes.length; c++) {
			var re = new RegExp(this.codes[c][1], "g");
			str = str.replace(re, this.codes[c][0])
		}
		return str;
	},
	decode: function(str) {
		for (var c = 0; c < this.codes.length; c++) {
			var re = new RegExp(this.codes[c][0], "g");
			str = str.replace(re, this.codes[c][1])
		}
		return str;
	}
}

var jTimer = {
	timerIsOn:false,
	isIdle:false,
	state:'not started', // not started , active , paused , stopped
	documentHasFocus:document.hasFocus(),
	startStopTimes:[],
	lastActivity:Math.round((new Date().getTime())/1000),
	idleTimeout:6*60,
	intervalListenerTime:5,
	timeElapsedCallbacks:[],
	log:false,
	start:function() {
		jTimer.timerIsOn = true;
		jTimer.isIdle = false;
		jTimer.addStartPoint();
		jTimer.state = 'active';
		jTimer.lastActivity = jTimer.getTimestamp();
		jTimer.addListenerEvents();
		if (jTimer.log) console.log('start',jTimer.getTimestamp());
	},
	stop:function() {
		jTimer.timerIsOn = false;
		jTimer.addStopPoint();			
		jTimer.state = 'stopped';
		jTimer.removeListenerEvents();
		if (jTimer.log) console.log('stop',jTimer.getTimestamp(),'on page:',jTimer.getTime());
	},
	reset:function() {
		jTimer.stop();
		jTimer.state = 'not started';
		jTimer.documentHasFocus = document.hasFocus();
		jTimer.startStopTimes = [];
		jTimer.timeElapsedCallbacks = [];
	},
	addStartPoint:function() {
		if (jTimer.startStopTimes.length > 0) {
			var startStopTime = jTimer.startStopTimes[jTimer.startStopTimes.length-1];
			if (un(startStopTime.stop)) return;
		}
		jTimer.startStopTimes.push({start:jTimer.getTimestamp()});
		jTimer.state = 'active';
		if (jTimer.log) console.log('addStartPoint',jTimer.getTimestamp(),jTimer.startStopTimes);
	},
	addStopPoint:function() {
		if (jTimer.startStopTimes.length === 0) return;
		var startStopTime = jTimer.startStopTimes[jTimer.startStopTimes.length-1];
		if (un(startStopTime.stop)) {
			startStopTime.stop = jTimer.getTimestamp();
			startStopTime.duration = startStopTime.stop - startStopTime.start;
			jTimer.state = 'paused';
			if (jTimer.log) console.log('addStopPoint',jTimer.getTimestamp(),jTimer.startStopTimes);
		}
	},
	getTime:function() {
		var time = 0;
		for (var i = 0; i < jTimer.startStopTimes.length; i++) {
			var startStopTime = jTimer.startStopTimes[i];
			if (typeof startStopTime.duration === 'number') {
				time += startStopTime.duration;
			} else {
				var now = jTimer.getTimestamp();
				time += (now - startStopTime.start);
			}
		}
		return time;
	},
	addTimeElapsedCallback:function(callFunction,time) {
		for (var i = 0; i < jTimer.timeElapsedCallbacks.length; i++) {
			if (jTimer.timeElapsedCallbacks[i][0] === callFunction && jTimer.timeElapsedCallbacks[i][1] === time) return;
		}
		jTimer.timeElapsedCallbacks.push([callFunction,time]);
	},
	onPageActivity: function() {
		if (jTimer.state === 'paused') {
			jTimer.addStartPoint();
		}
		jTimer.lastActivity = jTimer.getTimestamp();
		jTimer.isIdle = false;
	},
	intervalListener:function() {		
		var documentHasFocus = document.hasFocus();		
		if (jTimer.isIdle === false) {
			var now = jTimer.getTimestamp();
			if (now - jTimer.lastActivity >= jTimer.idleTimeout) {
				jTimer.addStopPoint();
				jTimer.isIdle = true;
				if (jTimer.log) console.log('isIdle',jTimer.getTimestamp());
			}
		}
		if (jTimer.isIdle === false && documentHasFocus === true && jTimer.state === 'paused') {
			jTimer.addStartPoint();
		} else if (documentHasFocus === false && jTimer.state === 'active') {
			jTimer.addStopPoint();
		}

		if (jTimer.log) console.log('intervalListener','timer:',jTimer.getTime(),'focus:',documentHasFocus,'idle:',jTimer.isIdle);
		
		var time = jTimer.getTime();
		var callbacksToFire = jTimer.timeElapsedCallbacks.filter(function(x) {return typeof x[0] === 'function' && x[1] <= time && x[2] !== true});
		for (var i = 0; i < callbacksToFire.length; i++) {
			var callback = callbacksToFire[i];
			var index = jTimer.timeElapsedCallbacks.indexOf(callback);
			if (index > -1) jTimer.timeElapsedCallbacks.splice(i,1);
		}
		for (var i = 0; i < callbacksToFire.length; i++) {
			var callback = callbacksToFire[i];
			if (callback[2] === true) continue;
			callback[0]();
			callback[2] = true;
		}
	},
	getTimestamp:function() {
		return Math.round((new Date().getTime())/1000);
	},
	/*triggerVisibilityChange: function() {
		if (document[jTimer.hiddenPropName] === true) {
			jTimer.addStopPoint();
		} else {
			jTimer.addStartPoint();
		}
	},*/
	addListenerEvents: function () {
		/*jTimer.hiddenPropName = '';
		jTimer.visibilityChangeEventName = ''; 
		if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
		  jTimer.hiddenPropName = "hidden";
		  jTimer.visibilityChangeEventName = "visibilitychange";
		} else if (typeof document.msHidden !== "undefined") {
		  jTimer.hiddenPropName = "msHidden";
		  jTimer.visibilityChangeEventName = "msvisibilitychange";
		} else if (typeof document.webkitHidden !== "undefined") {
		  jTimer.hiddenPropName = "webkitHidden";
		  jTimer.visibilityChangeEventName = "webkitvisibilitychange";
		}
		if (jTimer.hiddenPropName !== '') {
			document.addEventListener(jTimer.visibilityChangeEventName, jTimer.triggerVisibilityChange, false);
		}
		window.addEventListener("blur", jTimer.addStopPoint,false);
		window.addEventListener("focus", jTimer.addStartPoint,false);*/
		window.addEventListener("mousemove", jTimer.onPageActivity,false);
		window.addEventListener("keyup", jTimer.onPageActivity,false);
		window.addEventListener("touchstart", jTimer.onPageActivity,false);
		window.addEventListener("scroll", jTimer.onPageActivity,false);
		jTimer.intervalListenerInterval = setInterval(jTimer.intervalListener, jTimer.intervalListenerTime*1000);
	},
	removeListenerEvents: function () {
		/*if (jTimer.hiddenPropName !== '') {
			document.removeEventListener(jTimer.visibilityChangeEventName, jTimer.triggerVisibilityChange, false);
		}
		window.removeEventListener("blur", jTimer.addStopPoint,false);
		window.removeEventListener("focus", jTimer.addStartPoint,false);*/
		window.removeEventListener("mousemove", jTimer.onPageActivity,false);
		window.removeEventListener("keyup", jTimer.onPageActivity,false);
		window.removeEventListener("touchstart", jTimer.onPageActivity,false);
		window.removeEventListener("scroll", jTimer.onPageActivity,false);
		clearInterval(jTimer.intervalListenerInterval);
	}
}

draw.task = {
	//modes:['Do Task','Set Task','Review Class','Review Pupil','Answers'],
	modes:['Do Task','Set Task','Review Class','Review Pupil'],
	logging:true,
	
	isFileATask:function() { // checks for presence of 'taskTitle'
		if (file.resources.length > 1) return false;
		var resource = file.resources[0];
		if (un(resource) || un(resource.pages)) return false;
		for (var pa = 0; pa < resource.pages.length; pa++) {
			var page = resource.pages[pa];
			if (un(page) || un(page.paths)) continue;
			for (var p = 0; p < page.paths.length; p++) {
				var path = page.paths[p];
				if (un(path) || un(path.obj)) continue;
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (un(obj)) continue;
					if (obj.type === 'taskTitle') return true;
				}
			}
		}
		return false;
	},
	
	loadTask: function(taskKey,callback) {
		if ((userInfo.user == 'super' || (userInfo.user === 'teacher' && userInfo.sID === 923)) && mode == 'edit' && isFileSaved() === false) {
			if (confirm('OK to discard?') == false) return;
		}
		hidePage();
		
		if (un(draw.task.loadingBox)) {
			draw.task.loadingBox = newctx({rect:[0,0,1200,700],z:20000000,vis:true,pE:false}).canvas;
			text({ctx:draw.task.loadingBox.ctx,rect:[600-250,350-50,500,100],text:['Loading Task...'],align:[0,0],font:'Hobo',fontSize:60,box:{type:'loose',color:'#0FF',borderColor:'#000',borderWidth:5,radius:10}});
		}
		showObj(draw.task.loadingBox);
		draw.fileIsAStarter = false;

		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("post", "task/loadTask2.php", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.errorCallback = function() {
			//Notifier.error('Error loading task.');
		};		
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				if (typeof this.errorCallback == 'function') this.errorCallback();
				return;
			}
			//console.log('loadTask',this.responseText);
			//var task = JSON.parse(this.responseText);
			var task = draw.task.parse(this.responseText);
			task = reviveObject(task);
			if (typeof task.subtitle === 'string') task.subtitle = taskTitleCoding.decode(task.subtitle);
			draw.task.taskData = task;
			draw.task.taskID = task.taskID;
			for (var i = 0; i < task.questions.length; i++) {
				var question = task.questions[i];
				question = reviveObject(question,false);
				question.fileData = draw.task.reviveFunctions(question.fileData);
				question._fileData = clone(question.fileData);
				var obj = question.fileData.path.obj[0];
				if (typeof obj.requireScript === 'string') loadScript('teach'+teachVersion+'/'+obj.requireScript);
			}
			for (var i = 0; i < task.objects.length; i++) task.objects[i] = reviveObject(task.objects[i],false);
			//console.log('task',task);
			if (typeof callback === 'function') {
				callback(task);
			} else {
				draw.task.buildTask(task);
			}
		}
		xmlHttp.send('taskKey='+encodeURIComponent(taskKey));
	},
	buildTask: function(task) {
		var pageVis = userInfo.user !== 'none' && userInfo.verified === 0;
		clearDrawPaths();
		pIndex = 0;
		resourceIndex = 0;
		var resource = {
			name:'Task',
			pages:[{
				_loaded:1,
				paths:[],
				pageVis:pageVis
			}]
		}
		file = {resources:[resource]};
		
		if (typeof task.taskName === 'string') {
			file.title = task.taskName;
			document.title = task.taskName;
		}
		var pages = file.resources[0].pages;
		var path = {
			obj:[{
				type:'taskTitle',
				rect:[30,30,1140,380]
			}]
		};
		path.obj[0]._path = path;
		updateBorder(path);
		pages[0].paths.push(path);
		
		//console.log(task);
		
		for (var i = 0; i < task.questions.length; i++) {
			var question = task.questions[i];
			if (un(pages[question.pageIndex])) pages[question.pageIndex] = {paths:[],_loaded:1,pageVis:pageVis};
			if (!un(question.fileData) && question.fileData !== false) {
				var path = question.fileData.path;
				var obj = path.obj[0];
				obj.left = question.x;
				obj.top = question.y;
				obj.qNum = question.questionNum;
				obj._pageNum = question.pageIndex;
				obj._partMarks = [0];
				obj._path = path;
				updateBorder(path);
				
				pages[question.pageIndex].paths.push(path);
				
				for (var p = 0; p < question.fileData.questionPaths.length; p++) {
					var path = question.fileData.questionPaths[p];
					repositionPath(path,question.x,question.y);
					updateBorder(path);
					for (var o = 0; o < path.obj.length; o++) {
						path.obj[o]._path = path;
					}
					pages[question.pageIndex].paths.push(path);
				}
			}
		}
		for (var i = 0; i < task.objects.length; i++) {
			var object = task.objects[i];
			if (un(pages[object.pageIndex])) pages[object.pageIndex] = {paths:[],_loaded:1,pageVis:pageVis};
			if (object.type === 'video') {
				var path = {
					obj:[{
						type:'video',
						youtubeID:object.data,
						vimeoID:object.vimeo,
						rect:[object.x,object.y,object.w,object.h],
						_page:pages[object.pageIndex]
					}]
				};
				path.obj[0]._path = path;
				updateBorder(path);
				pages[object.pageIndex].paths.push(path);
			}
			
		}
		pendingScripts.onload(function() {
			currFilename = "";
			hideObj(draw.task.loadingBox);
			showResource(0);
			draw.task.initialise();
			updateURL();
			if ((userInfo.user == 'super' || (userInfo.user === 'teacher' && userInfo.sID === 923)) && startMode == 'edit') {
				window.interval = setInterval(function() {
					if (!un(window.toggleMode)) {
						window.toggleMode();
						clearInterval(window.interval);
					}
				},50);
			}
		});
	},
	
	initialise: function() { // function that runs on load and on return from edit mode
		
		for (var key in draw.task) {
			if (['modes','mode','progressBox','class','classes','classIndex','taskData','taskID','loadingBox'].indexOf(key) === -1 && typeof draw.task[key] !== 'function') delete draw.task[key];
		}
		var fileTask = draw.task.getFileTaskID();
		if (!un(fileTask)) {
			draw.task.taskID = Number(fileTask.taskID);
			draw.task.taskName = fileTask.taskName;
			//console.log('file is a task',file);
		}
		
		var questionObjs = draw.task.getTaskQuestions();
		//console.log('questionObjs',clone(questionObjs));
		if (questionObjs.length === 0) return;
		
		draw.task.questions = [];
		for (var q = 0; q < questionObjs.length; q++) {
			var obj = questionObjs[q];
			var parts = obj._cells.map(function(x) {return {
				paths:x._paths,
				inputs:x._inputs,
				inputType:x._inputType
			}});
			var question = {
				questionNum:obj.qNum,
				questionID:obj.questionID,
				pageIndex:obj._pageIndex,
				partMarksMax:obj.partMarksMax,
				marksMax:arraySum(obj.partMarksMax),
				parts:parts,
				obj:obj
			};
			obj._question = question;
			draw.task.questions.push(question);
		}
		draw.task.taskTitle = draw.task.getTaskTitle();
		//console.log('draw.task',draw.task);
		
		if (userInfo.user === 'pupil') {
			draw.task.pupil = {
				pupilID: userInfo.pID
			};
			draw.task.reset();
			//draw.task.loadPupilTaskState();
			draw.task.loadPupilTaskState2(pupilTaskData); // non-AJAX method, data loaded with page
			draw.task.taskNumber = pupilTaskData.taskNumber;
			draw.task.status = pupilTaskData.status;
			draw.task.prevSessionTime = pupilTaskData.totalTime;
			if (Number(draw.task.status) !== 3) draw.task.logStart();
			drawCanvasPaths();
			calcCursorPositions();
			window.onfocus = draw.task.refreshPupilTaskState;
		} else {
			//drawCanvasPaths();
			if (userInfo.user === 'teacher' || userInfo.user === 'super') {
				if (!un(queryObject) && !un(queryObject.taskMode)) {
					if (queryObject.taskMode.toLowerCase() === 'settask') draw.task.setMode('Set Task',true);
					if (queryObject.taskMode.toLowerCase() === 'reviewclass') draw.task.setMode('Review Class',true);
					if (queryObject.taskMode.toLowerCase() === 'reviewpupil') draw.task.setMode('Review Pupil',true);
					if (queryObject.taskMode.toLowerCase() === 'answers') draw.task.setMode('Answers',true);
					if (queryObject.taskMode.toLowerCase() === 'taskoverview') draw.task.setMode('taskoverview',true);
				}
			}
			var mode = draw.task.getMode();
			if (mode === 'Do Task') {
				draw.task.reset();
				draw.task.logStart();
			} else if (mode === 'Review Class') {
				for (var q = 0; q < draw.task.questions.length; q++) {
					var question = draw.task.questions[q];
					draw.taskQuestion.disable(question.obj);
				}
			} else if (mode === 'taskoverview') {
				//draw.taskOverview.show();
			}
		}
	},
	getFileTaskID: function(folder,filename) {
		if (un(folder)) folder = currFolder;
		if (un(filename)) filename = currFilename;
		var folderName = folder === 'teachFiles' ? '' : folder.indexOf('/') > -1 ? folder.slice(folder.indexOf('/')+1) : folder;
		var taskFile = taskFiles.find(function(x) {
			return x._folder === folderName && x._filename === filename ? true : false;
		});
		return taskFile;
	},
	getTaskQuestions: function() {
		if (typeof taskApp === 'object') return draw.task.questions;
		var questionObjs = [];
		if (typeof file === 'undefined') return;
		var pages = file.resources[resourceIndex].pages;
		for (var pa = 0; pa < pages.length; pa++) {
			var page = pages[pa];
			if (un(page.paths)) continue;
			for (var p = 0; p < page.paths.length; p++) {
				var path = page.paths[p];
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (obj.type === 'taskQuestion') {
						obj._pageIndex = pa;
						obj._path = path;
						draw.taskQuestion.getPaths(obj,page.paths);
						questionObjs.push(obj);
					}
				}
			}
		}
		questionObjs.sort(function(a,b){
			if (a._pageIndex < b._pageIndex) return -1;
			if (a._pageIndex > b._pageIndex) return 1;
			if (b.top > a.top+a.height) return -1;
			if (a.top > b.top+b.height) return 1;
			if (b.left > a.left+a.width) return -1;
			if (a.left > b.left+b.width) return 1;
			return 0;
		});
		return questionObjs;
	},
	getTaskTitle: function() {
		var pages = file.resources[resourceIndex].pages;
		for (var pa = 0; pa < pages.length; pa++) {
			var page = pages[pa];
			if (un(page.paths)) continue;
			for (var p = 0; p < page.paths.length; p++) {
				var path = page.paths[p];
				for (var o = 0; o < path.obj.length; o++) {
					var obj = path.obj[o];
					if (obj.type === 'taskTitle') {
						return obj;
					}
				}
			}
		}
		return undefined;
	},
	getTaskName: function() {
		var taskTitle = draw.task.getTaskTitle();
		if (!un(taskTitle)) {
			return taskTitle.title[0];
		}
		return !un(file.title) && file.title !== '' ? file.title : currFilename;
	},
	getMode: function() {
		if (draw.task.printMode === true) return 'print';
		if (userInfo.user !== 'teacher' && userInfo.user !== 'super') return 'pupil';
		if (draw.mode === 'edit') return 'edit';
		if (typeof draw.task.mode === 'string') return draw.task.mode;
		if (userInfo.user === 'teacher' || userInfo.user === 'super') {
			if (!un(queryObject) && !un(queryObject.taskMode)) {
				if (queryObject.taskMode.toLowerCase() === 'settask') return 'Set Task';
				if (queryObject.taskMode.toLowerCase() === 'reviewclass') return 'Review Class';
				if (queryObject.taskMode.toLowerCase() === 'reviewpupil') return 'Review Pupil';
				if (queryObject.taskMode.toLowerCase() === 'answers') return 'Answers';
				if (queryObject.taskMode.toLowerCase() === 'taskoverview') return 'taskoverview';
			}
		}
		return draw.task.modes[0];
	},
	setMode: function(mode,override) {
		if (un(mode) || (draw.task.modes.indexOf(mode) === -1 && mode !== 'taskoverview')) mode = draw.currCursor.value;
		if (override !== true && draw.task.getMode() === mode) return;
		draw.task.mode = mode;
		draw.task.reset();
		delete queryObject.taskMode;
		
		if (draw.task.mode === 'Do Task') {
			showObj(taskTrayCanvas);
			draw.task.logStart();
		} else {
			hideObj(taskTrayCanvas);
		}
		if (draw.task.mode === 'Review Pupil') {
			queryObject.taskMode = 'reviewpupil';
			draw.task.loadPupilTaskState();
			draw.task.disable();
		} else if (draw.task.mode === 'Answers') {
			queryObject.taskMode = 'answers';
			draw.task.showAnswers();
			draw.task.disable();
		} else if (draw.task.mode === 'Review Class') {
			queryObject.taskMode = 'reviewclass';
			draw.task.disable();
		} else if (draw.task.mode === 'Set Task') {
			queryObject.taskMode = 'settask';
			draw.task.disable();
		} else if (draw.task.mode === 'taskoverview') {
			queryObject.taskMode = 'taskoverview';
			draw.task.disable();
		}
		drawCanvasPaths();
		updateURL();
	},
		
	// progress & logging
	revivePupilTaskData: function(item) {
		if (item instanceof Array) {
			for (var i = 0; i < item.length; i++) {
				item[i] = draw.task.revivePupilTaskData(item[i]);
			}
		} else if (typeof item === 'object') {
			for (var key in item) {
				if (typeof item[key] === 'string' && ['answerDescription','text','state'].indexOf(key) > -1) continue;
				item[key] = draw.task.revivePupilTaskData(item[key]);
			}
		} else if (typeof item === 'string' && item !== '' && !isNaN(Number(item))) {
			item = Number(item);
		}
		return item;
	},
	loadPupilTaskState: function(pupilID,callback) {
		if (un(pupilID) && !un(draw.task.pupil)) pupilID = draw.task.pupil.pupilID;
		var startTask = false;
		if (userInfo.user === 'pupil' && userInfo.wholeSchool !== 1) {
			pupilID = userInfo.pID;
			startTask = true;
		}
		if (un(pupilID) || pupilID === -1) return;
		//if (un(draw.task.taskID) || draw.task.taskID === -1) return;
		var taskID = !un(draw.task.taskID) ? draw.task.taskID : -1;
		
		draw.task.getTaskQuestions();
		var questionIDs = draw.task.questions.map(function(x) {return x.questionID;});
		var data = {
			pupilID:pupilID,
			questionIDs:questionIDs,
			taskID:taskID,
			startTask:startTask
		};
		//console.log('loadPupilTaskState',data);
		
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("post", "/i2/task/interact_loadPupilTaskState6.php", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.errorCallback = function() {
			//Notifier.error('Error connecting to the server. Please try again shortly...');
		};		
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				if (typeof this.errorCallback == 'function') this.errorCallback();
				return;
			}
			//console.log(this.responseText);
			//var pupilTaskData = JSON.parse(this.responseText);
			var pupilTaskData = draw.task.parse(this.responseText);			
			draw.task.loadPupilTaskState2(pupilTaskData)
			
			var mode = draw.task.getMode();
			if (mode === 'pupil') {
				draw.task.taskNumber = pupilTaskData.taskNumber;
				//draw.task.testMode = pupilTaskData.
				draw.task.status = pupilTaskData.status;
				draw.task.prevSessionTime = pupilTaskData.totalTime;
				if (Number(draw.task.status) !== 3) draw.task.logStart();
			} else if (mode === 'Do Task') {
				draw.task.reset();
				draw.task.logStart();
			}
			
			if (mode === 'Review Pupil') {
				draw.task.prevSessionTime = pupilTaskData.totalTime;
				for (var q = 0; q < draw.task.questions.length; q++) {
					var question = draw.task.questions[q];
					draw.taskQuestion.disable(question.obj);
				}
			}
			
			if (typeof callback === 'function') {
				callback();
			} else {
				drawCanvasPaths();
				calcCursorPositions();
			}
		}
		xmlHttp.send("data="+encodeURIComponent(JSON.stringify(data)));
	},
	loadPupilTaskState2: function(pupilTaskData) {
		if (un(draw.task.pupil)) draw.task.pupil = {};
		
		pupilTaskData = draw.task.decodePupilTaskData(pupilTaskData);
		//draw.task.pupil.taskData = reviveObject(pupilTaskData,true,{state:'string'});
		draw.task.pupil.taskData = draw.task.revivePupilTaskData(pupilTaskData);
		
		//console.log('taskData',draw.task.pupil.taskData);
		draw.task.pupil.saveData = pupilTaskData.saveData;
		draw.task.pupil.saveInputsData = pupilTaskData.saveInputsData;
		draw.task.pupil.previousAnswers = pupilTaskData.previousAnswers;
		
		draw.task.questionsByID = {};
		for (var q = 0; q < draw.task.questions.length; q++) {
			draw.task.questions[q].obj._previousAnswers = [];
			delete draw.task.questions[q].obj._attempt;
			draw.task.questionsByID[draw.task.questions[q].questionID] = draw.task.questions[q];
		}
		
		if (!un(pupilTaskData.previousAnswers)) {
			pupilTaskData.previousAnswersByID = {};
			for (var d = 0; d < pupilTaskData.previousAnswers.length; d++) {
				var previousAnswer = pupilTaskData.previousAnswers[d];
				pupilTaskData.previousAnswersByID[previousAnswer.answerLogID] = previousAnswer;
			}
		
			for (var type in draw.task.pupil.saveInputsData) {
				for (var i = 0; i < draw.task.pupil.saveInputsData[type].length; i++) {
					var saveInputData = draw.task.pupil.saveInputsData[type][i];
					if (typeof saveInputData !== 'object') continue;
					/*var answerLog = pupilTaskData.previousAnswers.find(function(x) {
						return Number(x.answerLogID) === Number(saveInputData.answerLogID);
					});*/
					var answerLog = pupilTaskData.previousAnswersByID[saveInputData.answerLogID];
					if (un(answerLog)) continue;
					if (un(answerLog.saveInputData)) answerLog.saveInputData = {};
					if (un(answerLog.saveInputData[type])) answerLog.saveInputData[type] = [];
					answerLog.saveInputData[type].push(saveInputData);
				}
			}
			
			pupilTaskData.previousAnswersSaveDataByID = {};
			for (var p = 0; p < pupilTaskData.previousAnswersSaveData.length; p++) {
				var previousAnswerSaveData = pupilTaskData.previousAnswersSaveData[p];
				pupilTaskData.previousAnswersSaveDataByID[previousAnswerSaveData.saveDataID] = previousAnswerSaveData;
			}
			
			for (var d = 0; d < pupilTaskData.previousAnswers.length; d++) {
				var previousAnswer = pupilTaskData.previousAnswers[d];
				//var saveData = pupilTaskData.previousAnswersSaveData.find(function(x) {return x.saveDataID === previousAnswer.saveDataID});
				var saveData = pupilTaskData.previousAnswersSaveDataByID[previousAnswer.saveDataID];
				if (typeof saveData === 'object' && typeof saveData.saveData === 'object') {
					saveData.mode = 'checked';
					saveData.partMarks = [previousAnswer.marks];
					saveData.partFeedback = [previousAnswer.partFeedback];
					previousAnswer.saveData = saveData;
				}
				//var question = draw.task.questions.find(function(x) {return x.questionID === previousAnswer.questionID});
				var question = draw.task.questionsByID[previousAnswer.questionID];
				if (typeof question === 'object' && typeof question.obj === 'object') {
					if (un(question.obj._previousAnswers)) question.obj._previousAnswers = [];
					question.obj._previousAnswers.push(previousAnswer);
				}
			}
		}
		
		pupilTaskData.saveDataByQuestionID = {};
		for (var s = 0; s < pupilTaskData.saveData.length; s++) {
			var saveData = pupilTaskData.saveData[s];
			pupilTaskData.saveDataByQuestionID[saveData.questionID] = saveData;
		}
			
		for (var q = 0; q < draw.task.questions.length; q++) {
			var question = draw.task.questions[q].obj;
			question._previousAnswers.sort(function(a,b) {return a.answerLogID-b.answerLogID;});
			if (pupilTaskData.saveData instanceof Array && question._previousAnswers.length > 0) { // fix for pre- 2020-07-02 saved data
				var lastAnswer = question._previousAnswers.last();
				if (lastAnswer.saveDataID === null && un(lastAnswer.saveData)) {
					var saveData = pupilTaskData.saveDataByQuestionID[question.questionID];
					/*var saveData = pupilTaskData.saveData.find(function(x) {
						return x.questionID === question.questionID;
					});*/
					//console.log('-',question,lastAnswer,saveData);
					if (typeof saveData === 'object' && saveData !== null) {
						lastAnswer.saveDataID = saveData.saveDataID;
						lastAnswer.saveData = saveData;
					}
				}
			}
			draw.taskQuestion.restoreQuestionAnswerState(question,question._previousAnswers.length-1);
		}
	},
	
	refreshPupilTaskState: function() {
		if (un(draw.task.pupil) || draw.task.pupil.pupilID === -1 || userInfo.wholeSchool === 1 || un(draw.task.taskID) || draw.task.taskID === -1 || draw.task.getMode() !== 'pupil') return;
		var progress = draw.task.getProgress();
		if (progress.marks === progress.marksMax) return;
		var pupilID = draw.task.pupil.pupilID;
		var taskID = draw.task.taskID;
		var largestPreviousAnswerLogID = 0;
		if (!un(draw.task.pupil.previousAnswers)) {
			for (var a = 0; a < draw.task.pupil.previousAnswers.length; a++) {
				largestPreviousAnswerLogID = Math.max(largestPreviousAnswerLogID,draw.task.pupil.previousAnswers[a].answerLogID);
			}
		}
		
		draw.task.getTaskQuestions();
		var questionIDs = draw.task.questions.map(function(x) {return x.questionID;});
		var data = {
			pupilID:pupilID,
			questionIDs:questionIDs,
			taskID:taskID,
			largestPreviousAnswerLogID:largestPreviousAnswerLogID
		};
		//console.log('refreshPupilTaskState',data);
		
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("post", "task/interact_refreshPupilTaskState2.php", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.errorCallback = function() {
			//Notifier.error('Error connecting to the server. Please try again shortly...');
		};
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				if (typeof this.errorCallback == 'function') this.errorCallback();
				return;
			}
			//console.log(this.responseText);
			var pupilTaskData = draw.task.parse(this.responseText);			
			//console.log('pupilTaskData',pupilTaskData);
			draw.task.refreshPupilTaskState2(pupilTaskData)
			
			//draw.task.status = pupilTaskData.status;
			//draw.task.prevSessionTime = pupilTaskData.totalTime;
			
			drawCanvasPaths();
			calcCursorPositions();
		}
		xmlHttp.send("data="+encodeURIComponent(JSON.stringify(data)));
	},
	refreshPupilTaskState2: function(refreshTaskData) {	
		refreshTaskData = draw.task.decodePupilTaskData(refreshTaskData);
		//refreshTaskData = reviveObject(refreshTaskData,true,{state:'string'}); 
		refreshTaskData = draw.task.revivePupilTaskData(refreshTaskData);
		if (un(refreshTaskData.previousAnswers) || refreshTaskData.previousAnswers.length === 0) return;

		refreshTaskData.previousAnswersByID = {};
		for (var a = 0; a < refreshTaskData.previousAnswers.length; a++) {
			var previousAnswer = refreshTaskData.previousAnswers[a];
			refreshTaskData.previousAnswersByID[previousAnswer.answerLogID] = previousAnswer;
		}
		//console.log('refreshTaskData',refreshTaskData);
		
		for (var type in refreshTaskData.saveInputsData) {
			for (var i = 0; i < refreshTaskData.saveInputsData[type].length; i++) {
				var saveInputData = refreshTaskData.saveInputsData[type][i];
				if (typeof saveInputData !== 'object') continue;
				/*var answerLog = refreshTaskData.previousAnswers.find(function(x) {
					return Number(x.answerLogID) === Number(saveInputData.answerLogID);
				});*/
				var answerLog = refreshTaskData.previousAnswersByID[saveInputData.answerLogID];
				if (un(answerLog)) continue;
				if (un(answerLog.saveInputData)) answerLog.saveInputData = {};
				if (un(answerLog.saveInputData[type])) answerLog.saveInputData[type] = [];
				answerLog.saveInputData[type].push(saveInputData);
			}
		}
		refreshTaskData.previousAnswers.sort(function(a,b) {return a.answerLogID-b.answerLogID;});
		var questionsToUpdate = [];
		for (var d = 0; d < refreshTaskData.previousAnswers.length; d++) {
			var previousAnswer = refreshTaskData.previousAnswers[d];
			var question = draw.task.questions.find(function(x) {return x.questionID === previousAnswer.questionID});
			if (typeof question === 'object' && typeof question.obj === 'object') {
				if (un(question.obj._previousAnswers)) question.obj._previousAnswers = [];
				question.obj._previousAnswers.push(previousAnswer);
				if (questionsToUpdate.indexOf(question === -1)) questionsToUpdate.push(question);
			}
			if (!un(draw.task.pupil.previousAnswers)) {
				draw.task.pupil.previousAnswers.push(previousAnswer);
			}
		}
		for (var q = 0; q < questionsToUpdate.length; q++) {
			var question = questionsToUpdate[q].obj;
			draw.taskQuestion.reset(question);
			draw.taskQuestion.restoreQuestionAnswerState(question,question._previousAnswers.length-1);
		}
	},
	
	decodePupilTaskData: function(item) {
		var codes = {"u00d7":times,"u00f7":divide,"u0083":"£"};
		if (typeof item === 'string') {
			for (var key in codes) {
				item = replaceAll(item,key,codes[key]);
			}
		} else if (item instanceof Array) {
			for (var i = 0; i < item.length; i++) {
				item[i] = draw.task.decodePupilTaskData(item[i]);
			}
		} else if (typeof item === 'object') {
			for (var i in item) {
				item[i] = draw.task.decodePupilTaskData(item[i]);
			}
		}
		return item;
	},
	reset: function() {
		var questions = draw.task.getTaskQuestions();
		if (typeof questions === 'undefined') return;
		for (var q = 0; q < questions.length; q++) {
			questions[q]._previousAnswers = [];
			draw.taskQuestion.reset(questions[q]);
		}
		//draw.task.clearReportTimeouts();
		draw.task.status = 0;
		draw.task.prevSessionTime = 0;
		draw.task.thisSessionTime = 0;
		//TimeMe.resetRecordedPageTime('page');
		jTimer.reset();
	},
	disable: function() {
		var questions = draw.task.getTaskQuestions();
		if (typeof questions === 'undefined') return;
		for (var q = 0; q < questions.length; q++) {
			draw.taskQuestion.disable(questions[q]);
		}
	},
	logStart: function() {
		//console.log('logStart');
		var progress = draw.task.getProgress();
		if (progress.marks === progress.marksMax) return;
		draw.task.idleTimeoutInSeconds = 4*60;
		draw.task.reportIntervalInSeconds = 5*60;
		draw.task.log();
		jTimer.reset();
		jTimer.addTimeElapsedCallback(draw.task.log,60);
		jTimer.start();
	},
	startTimeMe: function() {
		/*if (un(TimeMe)) {
			setTimeout(draw.task.startTimeMe,10000);
			return;
		}
		if (typeof TimeMe.getTimeOnCurrentPageInSeconds !== 'function' || typeof TimeMe.getTimeOnCurrentPageInSeconds() !== 'number') {
			setTimeout(draw.task.startTimeMe,10000);
			TimeMe.initialize({
				currentPageName: "page",
				idleTimeoutInSeconds: draw.task.idleTimeoutInSeconds
			});
			TimeMe.callAfterTimeElapsedInSeconds(draw.task.reportIntervalInSeconds,draw.task.log);
		}*/
	},
	clearReportTimeouts: function() {
		/*jTimer.timeElapsedCallbacks = [];
		if (un(TimeMe)) return;
		for (var i = TimeMe.timeElapsedCallbacks.length - 1; i >= 0; i--) {
			TimeMe.timeElapsedCallbacks[i].pending = false;
		}*/
	},
	log: function(type) {			
		//console.log('-- log ---');
		drawCanvasPaths();
		
		if (un(draw.task) || un(draw.task.taskID) || draw.task.taskID === -1 || draw.task.allowLog === false) return;
		

		/*
		var sessionStartTime = (un(sessionTime.sessionStartTime) || typeof sessionTime.sessionStartTime.toISOString !== 'function') ? 'null' : sessionTime.sessionStartTime.toISOString().slice(0, 19).replace('T', ' ');
		var currentTime = (un(sessionTime.currentTime) || typeof sessionTime.currentTime.toISOString !== 'function') ? 'null' : sessionTime.currentTime.toISOString().slice(0, 19).replace('T', ' ');
		var sessionEndTime = (un(sessionTime.sessionEndTime) || typeof sessionTime.sessionEndTime.toISOString !== 'function') ? 'null' : sessionTime.sessionEndTime.toISOString().slice(0, 19).replace('T', ' ');
		var timerStartTime = (un(sessionTime.timerStartTime) || typeof sessionTime.timerStartTime.toISOString !== 'function') ? 'null' : sessionTime.timerStartTime.toISOString().slice(0, 19).replace('T', ' ');
		*/

		var sessionTime = draw.task.getSessionTime();
		var timeOnPageInSeconds = jTimer.getTime();
		var nextReportTime = draw.task.reportIntervalInSeconds*(Math.floor(timeOnPageInSeconds/draw.task.reportIntervalInSeconds)+1);
		//console.log('timeOnPageInSeconds',timeOnPageInSeconds,'nextReportTime',nextReportTime);
		jTimer.addTimeElapsedCallback(draw.task.log,nextReportTime);
		
		/*var questions = [];
		var questionObjs = draw.task.getTaskQuestions();
		for (var q = 0; q < questionObjs.length; q++) {
			var questionObj = questionObjs[q];
			questions.push(draw.taskQuestion.getSaveData(questionObj));
		}*/
		//draw.task.thisSessionTime = Math.round(TimeMe.getTimeOnPageInSeconds('page')/60);
		//draw.task.totalTime = draw.task.prevSessionTime + draw.task.thisSessionTime;
		var progress = draw.task.getProgress();
		draw.task.percentage = Math.round(100*progress.marks/progress.marksMax);
		if (draw.task.percentage === 100 || progress.testComplete === 1) {
			draw.task.status = 3;
		} else if (draw.task.timeSpent > 19) {
			draw.task.status = Math.max(2,draw.task.status);
		} else {
			draw.task.status = Math.max(1,draw.task.status);
		}
		
		if (userInfo.pID === -1 || userInfo.wholeSchool === 1) return;
		
		if ((typeof type === 'undefined' || type !== 'check') && !un(draw.task.lastLogTime)) {
			var now = new Date();
			if (now.getTime()-draw.task.lastLogTime.getTime() < 30*1000) return;
		}
		draw.task.lastLogTime = new Date();
		
		var data = {
			pupilID:userInfo.pID,
			percentage:draw.task.percentage,
			status:draw.task.status,
			taskID:draw.task.taskID,
			totalTime:sessionTime.taskDurationInMinutes,
			testComplete:progress.testComplete,
		};
		
		if (draw.task.logging === true) console.log('logData',data);
		if (userInfo.user === 'pupil') {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open("post", "/i2/task/interact_taskLog.php", true);
			xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlHttp.errorCallback = function() {
				//Notifier.error('Error connecting to the server. Please try again shortly...');
			};		
			xmlHttp.onreadystatechange = function() {
				if (this.readyState !== 4) return;
				if (this.status !== 200) {
					if (typeof this.errorCallback == 'function') this.errorCallback();
					return;
				}
				if (draw.task.percentage == 100 || draw.task.status == 3) {
					draw.task.allowLog = false;
					jTimer.timeElapsedCallbacks = [];
					jTimer.stop();
					return;
				}
				//if (!un(document.origin) && document.origin.indexOf('localhost') > -1) console.log(this.responseText);
				if (draw.task.logging === true) console.log('log response',this.responseText);
				
			}
			xmlHttp.send("data="+encodeURIComponent(JSON.stringify(data)));
		}
		
		if (progress.marks === progress.marksMax) {
			jTimer.timeElapsedCallbacks = [];
			jTimer.stop();
			draw.task.allowLog = false;
		}
	},
	getProgress: function() {
		var progress = {marks:0,marksMax:0,attempted:0,questions:[],testMode:0,testComplete:0};			
		var questions = draw.task.questions;
		if (un(questions)) return progress;
		if (!un(draw.task.pupil) && !un(draw.task.pupil.taskData) && !un(draw.task.pupil.taskData.testMode)) progress.testMode = draw.task.pupil.taskData.testMode;
		for (var q = 0; q < questions.length; q++) {
			var question = questions[q];
			var obj = question.obj;
			var marks = arraySum(obj._partMarks);
			var marksMax = arraySum(obj.partMarksMax);
			var attempts = (typeof obj._attempts === 'number' && obj._attempts > 0) ? obj._attempts : (!un(obj._mode) && obj._mode !== 'none') ? 1 : 0;
			if (attempts > 0) progress.attempted++;
			progress.questions[q] = {
				questionID:question.questionID,
				questionNum:question.questionNum,
				mode:obj._mode,
				marks:marks,
				marksMax:marksMax,
				attempts:attempts
			}
			progress.marks += marks;
			progress.marksMax += marksMax;
		}
		if (progress.testMode === 1 && progress.attempted === questions.length) progress.testComplete = 1;
		return progress;
	},
	/*getTimeSpent: function() {
		var prevSessionTime = Number(draw.task.prevSessionTime);
		if (isNaN(prevSessionTime) || typeof prevSessionTime !== 'number') prevSessionTime = 0;
		
		var progress = draw.task.getProgress();
		if (!un(TimeMe) && progress.marks < progress.marksMax) { 
			var timeOnPageInSeconds = TimeMe.getTimeOnCurrentPageInSeconds(); // update active time spent
			if (!isNaN(timeOnPageInSeconds) && typeof timeOnPageInSeconds === 'number') {
				draw.task.thisSessionTime = Math.round(timeOnPageInSeconds/60);
			}
		}
		
		if (draw.task.thisSessionTime === 0) {
			var thisSessionTime = draw.task.thisSessionTime || 0;
		} else {
		
		}
		//console.log('prevSessionTime',prevSessionTime);
		//console.log('thisSessionTime',thisSessionTime);
		var timeSpent = prevSessionTime + thisSessionTime;
		return isNaN(timeSpent) ? 0 : timeSpent;
	},*/
	getSessionTime: function() { // new version for logging to q_taskProgressLogs
		var previousSessionDuration = !un(draw.task.prevSessionTime) ? draw.task.prevSessionTime*60 : 0;
		if (un(draw.task.sessionStartTime)) draw.task.sessionStartTime = new Date();
		var progress = draw.task.getProgress();
		if (un(draw.task.sessionEndTime) && (progress.marks === progress.marksMax || progress.testComplete === 1)) {
			draw.task.sessionEndTime = new Date();
		}
		var currentTime = new Date();
		var logTime = !un(draw.task.sessionEndTime) ? draw.task.sessionEndTime : currentTime;
		var sessionTotalDuration = Math.round((logTime.getTime()-draw.task.sessionStartTime.getTime())/1000);
		var taskTotalDuration = previousSessionDuration + sessionTotalDuration;
		
		/*var sessionActiveDuration = 0;
		var timerStartStopTimes = [];
		if (!un(TimeMe)) {
			var timeOnPageInSeconds = TimeMe.getTimeOnCurrentPageInSeconds();
			if (typeof timeOnPageInSeconds === 'number') sessionActiveDuration = Math.round(timeOnPageInSeconds);
			if (typeof TimeMe.startStopTimes === 'object' && TimeMe.startStopTimes[TimeMe.currentPageName] instanceof Array )timerStartStopTimes = TimeMe.startStopTimes[TimeMe.currentPageName];
		}*/
		var sessionActiveDuration = jTimer.getTime();
		var timerStartStopTimes = jTimer.startStopTimes;
		
		var taskActiveDuration = previousSessionDuration + sessionActiveDuration;
		
		var timerStartTime = (!un(timerStartStopTimes[0]) && !un(timerStartStopTimes[0].startTime)) ? timerStartStopTimes[0].startTime : undefined;
		var timerStartTimeLag = typeof timerStartTime === 'object' && typeof timerStartTime.getTime === 'function' ? Math.round((timerStartTime.getTime()-draw.task.sessionStartTime.getTime())/1000) : undefined;
		
		if (mode === 'Review Pupil') {
			var taskDurationInMinutes = !un(draw.task.prevSessionTime) ? draw.task.prevSessionTime : 0;
			var taskDurationInSeconds = taskDurationInMinutes*60;
		} else {
			//var taskDurationInSeconds = (un(timerStartTime) || un(timerStartTimeLag)) ? taskTotalDuration : taskActiveDuration+timerStartTimeLag;
			var taskDurationInSeconds = taskActiveDuration;
			var taskDurationInMinutes = Math.floor(taskDurationInSeconds/60);
		}
			
		return {
			sessionStartTime:draw.task.sessionStartTime,
			currentTime:currentTime,
			sessionEndTime:draw.task.sessionEndTime,
			previousSessionDuration:previousSessionDuration,
			sessionTotalDuration:sessionTotalDuration,
			sessionActiveDuration:sessionActiveDuration,
			taskTotalDuration:taskTotalDuration,
			taskActiveDuration:taskActiveDuration,
			taskDurationInSeconds:taskDurationInSeconds,
			taskDurationInMinutes:taskDurationInMinutes,
			timerStartStopTimes:timerStartStopTimes,
			timerStartTime:timerStartTime,
			timerStartTimeLag:timerStartTimeLag
		}
	},	
	showAnswers: function() {
		if (userInfo.user !== 'super' && userInfo.user !== 'teacher') return;
		var questionIDs = draw.task.questions.map(function(x) {return x.questionID;});
		var data = {
			questionIDs:questionIDs
		};
		
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("post", "task/interact_teacherLoadAnswers.php", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.errorCallback = function() {
			//Notifier.error('Error connecting to the server. Please try again shortly...');
		};		
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				if (typeof this.errorCallback == 'function') this.errorCallback();
				return;
			}
			//console.log(this.responseText);
			var answers = draw.task.parse(this.responseText);
			for (var a = 0; a < answers.length; a++) {
				var answer = answers[a];
				answer.questionID = Number(answer.questionID);
				answer.questionPart = Number(answer.questionPart);
				answer.marks = Number(answer.marks);
				answer.frequency = Number(answer.frequency);
				answer.answerData = draw.task.parse(answer.answerData);
				if (answer.feedback !== "") answer.feedback = draw.task.parse(answer.feedback);
				var question = draw.task.questions.find(function(x) {return x.questionID === answer.questionID});
				if (un(question)) continue;
				var part = question.parts[answer.questionPart];
				if (un(part.answers)) part.answers = [];
				part.answers.push(answer);
			}
			
			for (var q = 0; q < draw.task.questions.length; q++) {
				var question = draw.task.questions[q];
				//draw.taskQuestion.getPaths(question);
				draw.taskQuestion.reset(question.obj);
				draw.taskQuestion.disable(question.obj);
				var part = question.parts[0];
				if (un(part.answers)) part.answers = [{}];
				part.answers.sort(function(a,b) {
					if (a.marks !== b.marks) return b.marks-a.marks;
					return 0;
				});
				question.obj._cells[0]._pageIndex = question.obj._pageIndex;
				
				if (typeof question.obj.showAnswer === 'function') {
					question.obj.showAnswer(question.obj);
				} else {
					draw.taskQuestion[part.inputType].showAnswerMode(question.obj._cells[0],part.answers);
				}
				//console.log(q,p,part);
				/*if (part.answers.length > 0)
					draw.taskQuestion[part.inputType].showAnswerMode(question.obj._cells[p]);
					draw.taskQuestion[part.inputType].showAnswerMode(question.obj._cells[p]);
				}*/
			}
			
			
			drawCanvasPaths();
			calcCursorPositions();
		}
		xmlHttp.send("data="+encodeURIComponent(JSON.stringify(data)));
	},
	
	// classes data
	getClasses: function() {
		if (userInfo.user !== 'teacher' && userInfo.user !== 'super') return;
		draw.task.classesRequested = true;
		var sID = userInfo.sID;
		var tID = userInfo.tID;
		if (userInfo.user === 'super' && !un(queryObject.tID)) tID = queryObject.tID;
		if (userInfo.user === 'super' && !un(queryObject.sID)) sID = queryObject.sID;
		var data = {
			tID:tID,
			sID:sID,
		};
		//console.log('getClasses',data);
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("post", "task/interact_teacherGetClasses.php", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.errorCallback = function() {
			//Notifier.error('Error connecting to the server. Please try again shortly...');
		};		
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				if (typeof this.errorCallback == 'function') this.errorCallback();
				return;
			}
			//console.log('getClasses response:',this.responseText);
			var response = draw.task.parse(this.responseText);
			draw.task.classes = reviveObject(response);
			draw.task.classesByID = {};
			for (var c = 0; c < draw.task.classes.length; c++) {
				var class1 = draw.task.classes[c];
				draw.task.classesByID[class1.classID] = class1;
			}
			if (!un(queryObject) && !un(queryObject.cID)) {
				//var class1 = draw.task.classes.find(function(x) {return Number(x.classID) === queryObject.cID;});
				var class1 = draw.task.classesByID[queryObject.cID];
				if (typeof class1 === 'object') {
					draw.task.setClassIndex(draw.task.classes.indexOf(class1));
				}
				//console.log(queryObject.cID,class1,draw.task.classIndex);
			}
			
			//draw.task.setClassIndex(0);
			//console.log(response);
			drawCanvasPaths();
		}
		xmlHttp.send("data="+encodeURIComponent(JSON.stringify(data)));
	},
	setClassIndex: function(index) {
		if (un(draw.task.classes[index])) return;
		draw.task.classIndex = index;
		draw.task.class = draw.task.classes[index];
		draw.task.reset();
		if (draw.task.mode === 'Review Pupil') {
			for (var q = 0; q < draw.task.questions.length; q++) {
				var question = draw.task.questions[q];
				draw.taskQuestion.disable(question.obj);
			}
		}
		draw.task.getClassTaskData(draw.task.class.classID,function() {
			if (!un(draw.taskTitle._pupilDropMenu)) {
				draw.task.pupils = draw.task.class.pupilData || [];
				draw.task.pupilIndex = -1;
				delete draw.task.pupil;
				draw.taskTitle._pupilDropMenu._update();
			}
			drawCanvasPaths();
		});
		queryObject.cID = Number(draw.task.class.classID);
		drawCanvasPaths();
		updateURL();
	},
	getClassDropDown: function(rect) {
		if (un(draw.taskTitle._classDropMenu)) {
			draw.taskTitle._classDropMenu = {
				type: 'dropMenu2',
				left: rect[0],
				top: rect[1],
				rect: [0,0,rect[2],rect[3]],
				padding: 2,
				align: [0, 0],
				fontSize: 24,
				box: {
					type: 'loose',
					color: '#F99',
					borderColor: '#000',
					borderWidth: 3
				},
				optionBox: {
					color: '#FCC',
					lineWidth: 2,
					align: [0, 0]
				},
				showDownArrow: true,
				downArrowSize: 12,
				scrollSize: 12,
				zIndex: 620,
				_pageIndex: 0,
				_open: false,
				onchange: function () {
					var obj = this;
					//var class1 = draw.task.classes.find(function(x) {return x.classID === obj.value;})
					var class1 = draw.task.classesByID[obj.value];
					var index = draw.task.classes.indexOf(class1);
					draw.task.setClassIndex(index);
					drawCanvasPaths();
				},
				options: un(draw.task.classes) ? [] : draw.task.classes.map(function(x) {return {text:[x.className],value:x.classID};}),
				text: un(draw.task.class) ? ['<<italic:true>>- select class -'] : [draw.task.class.className],
				value: un(draw.task.class) ? -1 : draw.task.class.classID,
				_draw: function() {
					draw.dropMenu2.draw(undefined,this);
				}
			}
		}
		return draw.taskTitle._classDropMenu;
	},
	getClassTaskData: function(classID,callback) {
		if (userInfo.user !== 'teacher' && userInfo.user !== 'super') return;
		if (un(draw.task)) return;
		if (draw.task._loadingClass === true) return;
		//if (typeof classID === 'undefined') classID = draw.task.classID;
		//console.log(classID);
		var questions = draw.task.questions;
		if (typeof questions === 'undefined') {
			draw._classID = Number(classID);
			setTimeout(function() {
				//console.log(draw._classID);
				draw.task.getClassTaskData(draw._classID);
				//delete draw._classID;
			},100);
			return;
		}
		draw.task._loadingClass = true;
		var questionIDs = questions.map(function(x) {return x.questionID});
		var taskID = draw.task.taskID || -1;
		var sID = userInfo.sID;
		var tID = userInfo.tID;
		if (userInfo.user === 'super' && !un(queryObject.tID)) tID = queryObject.tID;
		if (userInfo.user === 'super' && !un(queryObject.sID)) sID = queryObject.sID;
		var data = {
			tID:tID,
			sID:sID,
			cID:classID,
			taskID:taskID,
			questionIDs:questionIDs
		};
		//console.log('getClassTaskData',data);
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("post", "task/interact_teacherGetClassTaskData7.php", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.errorCallback = function() {
			//Notifier.error('Error connecting to the server. Please try again shortly...');
			delete draw.task._loadingClass;
		};		
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				if (typeof this.errorCallback == 'function') this.errorCallback();
				return;
			}
			//console.log('getClassTaskData response:',this.responseText);
			var data = draw.task.parse(this.responseText);
			
			//data = reviveObject(data,true,{answerDescription:'string',text:'string',state:'string'});
			data = draw.task.revivePupilTaskData(data);
			
			//console.log('getClassTaskData response:',clone(data));
			
			//var class1 = draw.task.classes.find(function(x) {return Number(x.classID) === Number(classID)});
			var class1 = draw.task.classesByID[classID];
						
			draw.task.classTaskDataSetup(class1);
			draw.task.classTaskDataAddData(class1,data);
			draw.task.classTaskDataAnalyse(class1);
			
			//console.log('class',class1);
			
			drawCanvasPaths();
			delete draw._classID;
			delete draw.task._loadingClass;
			if (typeof callback === 'function') callback();
		}
		xmlHttp.send("data="+encodeURIComponent(JSON.stringify(data)));
	},
	refreshClassTaskData: function(classID,callback) {
		if (userInfo.user !== 'teacher' && userInfo.user !== 'super') return;
		if (un(draw.task)) return;
		
		if (!un(draw.task._lastClassRefresh)) {
			var now = new Date();
			if (now - draw.task._lastClassRefresh < 10*1000) return;
		}
		draw.task._lastClassRefresh = new Date();
		
		if (un(classID)) {
			if (un(draw.task.class)) return;
			var class1 = draw.task.class;
			var classID = class1.classID;
		} else {
			//var class1 = draw.task.classes.find(function(x) {return Number(x.classID) === Number(classID)});			
			var class1 = draw.task.classesByID[Number(classID)];
		}

		var lastAnswerLogTimeStamp = '2020-01-01 00:00:00';
		var lastAnswerLogTime = 0;
		for (var p = 0; p < class1.data.pupilAnswerLogs.length; p++) {
			var answerLog = class1.data.pupilAnswerLogs[p];
			if (answerLog._timestamp > lastAnswerLogTime) {
				lastAnswerLogTimeStamp = answerLog.timestamp;
				lastAnswerLogTime = answerLog._timestamp;
			}
		}
		var pupilIDs = class1.pupilData.map(function(x) {return x.pupilID;});

		var taskID = draw.task.taskID || -1;
		var sID = userInfo.sID;
		var tID = userInfo.tID;
		if (userInfo.user === 'super' && !un(queryObject.tID)) tID = queryObject.tID;
		if (userInfo.user === 'super' && !un(queryObject.sID)) sID = queryObject.sID;
		var data = {
			tID:tID,
			sID:sID,
			cID:classID,
			taskID:taskID,
			pupilIDs:pupilIDs,
			lastAnswerLogTimeStamp:lastAnswerLogTimeStamp
		};
		
		//console.log('refreshClassTaskData',data);
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("post", "task/interact_teacherRefreshClassTaskData3.php", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.errorCallback = function() {
			//Notifier.error('Error connecting to the server. Please try again shortly...');
		};		
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				if (typeof this.errorCallback == 'function') this.errorCallback();
				return;
			}
			//console.log('getClassTaskData response:',this.responseText);
			var data = draw.task.parse(this.responseText);			
			//data = reviveObject(data,true,{answerDescription:'string',text:'string',state:'string'});
			data = draw.task.revivePupilTaskData(data);
			
			var class1 = draw.task.classesByID[Number(classID)];
			//console.log('refreshClassTaskData response:',data);
			
			draw.task.classTaskDataAddData(class1,data);
			draw.task.classTaskDataAnalyse(class1);
			
			//console.log('class',class1);

			if (!un(draw.taskOverview.div)) {
				if (!un(draw.task.class) && !un(draw.task.class.questionData)) {
					for (var q = 0; q < draw.task.class.questionData.length; q++) {
						var logsByPupil = draw.task.class.questionData[q].parts[0].logsByPupil;
						for (var l = 0; l < logsByPupil.length; l++) {
							delete logsByPupil[l]._answerLogID;
						}
					}				
				}
				if (draw.taskOverview.div.parentNode === document.body) draw.taskOverview.update();
				draw.taskOverview.disableRefreshButton(10);
			}
			
			jMessage.add('Data refreshed','tick');
			
			drawCanvasPaths();
			delete draw._classID;
			if (typeof callback === 'function') callback();
		}
		xmlHttp.send("data="+encodeURIComponent(JSON.stringify(data)));
	},
	/*classTaskDataSort: function(class1) {
		var data = class1.data;
		var task = draw.task;
		
		function getAnswer(answerID) {
			return data.pupilAnswers.find(function(x) {return x.answerID === answerID});
		}
		function getSaveData(saveDataID) {
			return data.saveData.find(function(x) {return x.saveDataID === saveDataID});
		}
		function getPupil(pupilID) {
			return data.pupils.find(function(x) {return x.pupilID === pupilID});
		}
		function getQuestionIndex(questionID) {
			var question = draw.task.questions.find(function(x) {return x.questionID ===  Number(questionID);})
			return draw.task.questions.indexOf(question);
		}
		
		// set up data structure
		class1.questionData = [];
		class1.pupilData = [];
		for (var q = 0; q < draw.task.questions.length; q++) {
			var taskQuestion = draw.task.questions[q];
			var questionID = taskQuestion.questionID;
			var question = {parts:[],marksMax:arraySum(taskQuestion.partMarksMax),taskQuestion:taskQuestion};
			class1.questionData[q] = question;
			for (var p = 0; p < taskQuestion.parts.length; p++) {
				question.parts[p] = {marksMax:taskQuestion.partMarksMax[p],allLogs:[],firstLogs:[],bestLogs:[]};
			}
		}
		
		// update pupil tasks
		for (var t = 0; t < data.pupilTasks.length; t++) { // fix pupilTask answerLog2 / tasksLog discrepancy
			var pupilTask = data.pupilTasks[t];
			pupilTask.percentage = Number(pupilTask.percentage);
			pupilTask.status = Number(pupilTask.status);
			pupilTask.totalTime = Number(pupilTask.totalTime);
			pupilTask.attempts = Number(pupilTask.attempts);

			pupilTask._questions = data.taskQuestions.filter(function(x) {return x.taskID === pupilTask.taskID});
			pupilTask._marks = 0;
			pupilTask._maxMarks = 0;
			pupilTask._answerLogMaxTimeInSeconds = 0;
			pupilTask._answerLogsByQuestion = [];
			for (var q = 0; q < pupilTask._questions.length; q++) {
				var question = pupilTask._questions[q];
				//pupilTask._maxMarks += Number(question.partMarksMax);
				pupilTask._maxMarks += Number(question.maxMarks);
			}		
			pupilTask._answerLogs = data.pupilAnswerLogs.filter(function(x) {return x.taskID === pupilTask.taskID && x.pupilID === pupilTask.pupilID;});
			for (var a = 0; a < pupilTask._answerLogs.length; a++) {
				var answerLog = pupilTask._answerLogs[a];
				answerLog.answerLogID = Number(answerLog.answerLogID);
				answerLog._pupilTask = pupilTask;
				answerLog._question = data.taskQuestions.find(function(x) {return x.questionID === answerLog.questionID && x.taskID === answerLog.taskID;});
				answerLog._questionNum = typeof answerLog._question === 'object' && answerLog._question !== null ? Number(answerLog._question.questionNum) : -1;
				if (typeof answerLog._questionNum === 'number' && answerLog._questionNum > 0) {
					if (typeof pupilTask._answerLogsByQuestion[answerLog._questionNum] === 'undefined') pupilTask._answerLogsByQuestion[answerLog._questionNum] = [];
					pupilTask._answerLogsByQuestion[answerLog._questionNum].push(answerLog);
				}
				var taskDurationInSeconds = Number(answerLog.taskDurationInSeconds);
				if (!isNaN(taskDurationInSeconds) && taskDurationInSeconds > 0) {
					pupilTask._answerLogMaxTimeInSeconds = Math.max(pupilTask._answerLogMaxTimeInSeconds,taskDurationInSeconds);
				}
			}
			for (var q = 0; q < pupilTask._answerLogsByQuestion.length; q++) {
				if (typeof pupilTask._answerLogsByQuestion[q] === 'undefined') continue;
				var questionAnswerLogs = pupilTask._answerLogsByQuestion[q];
				if (questionAnswerLogs.length === 0) continue;
				questionAnswerLogs.sort(function(a,b) {
					return b.answerLogID-a.answerLogID;
				})
				var questionAnswerLog = questionAnswerLogs[0]; // need to ensure most recent log is selected
				if (typeof questionAnswerLog === 'object') {
					pupilTask._marks += Number(questionAnswerLog.marks);
				}
			}
			if (pupilTask._questions.length > 0 && pupilTask._answerLogs.length > 0 && pupilTask._maxMarks > 0 && pupilTask._marks > 0) {
				var log = false;
				pupilTask._answerLogPercentage = Math.min(100,Math.round(100*pupilTask._marks/pupilTask._maxMarks));
				if (pupilTask._answerLogPercentage > pupilTask.percentage) {
					pupilTask._tasksLogPercentage = pupilTask.percentage;
					pupilTask.percentage = pupilTask._answerLogPercentage;
					log = true;
				}
				pupilTask._answerLogStatus = pupilTask.percentage === 100 ? 3 : 1;
				if (pupilTask._answerLogStatus > pupilTask.status) {
					pupilTask._tasksLogStatus = pupilTask.status;
					pupilTask.status = pupilTask._answerLogStatus;
					log = true;
				}
				pupilTask._answerLogMaxTimeInMinutes = Math.round(pupilTask._answerLogMaxTimeInSeconds/60);
				if (pupilTask._answerLogMaxTimeInMinutes > pupilTask.totalTime) {
					pupilTask._tasksLogTotalTime = pupilTask.totalTime;
					pupilTask.totalTime = pupilTask._answerLogMaxTimeInMinutes;
					log = true;
				}
				if (draw.task.logging === true && log === true) console.log(pupilTask);
			}
			// WHAT IF THERE ARE ANSWER LOGS THAT DO NOT CORRESPOND TO A pupilTask?
		}
		for (var t = 0; t < data.pupilTasks.length; t++) {
			var pupilTask = data.pupilTasks[t];
			var pupil = getPupil(pupilTask.pupilID);
			pupilTask._pupil = pupil;
			pupil._pupilTask = pupilTask;
		}
		
		// sort pupilAnswerLogs
		for (var l = 0; l < data.pupilAnswerLogs.length; l++) {
			var pupilAnswerLog = data.pupilAnswerLogs[l];
			var pupil = getPupil(pupilAnswerLog.pupilID);
			var answer = getAnswer(pupilAnswerLog.answerID);
			if (!un(pupilAnswerLog.saveDataID)) pupilAnswerLog.saveData = getSaveData(pupilAnswerLog.saveDataID);
			
			pupilAnswerLog._timestamp = new Date(pupilAnswerLog.timestamp).getTime();
			if (typeof answer === 'object') pupilAnswerLog.answerData = answer.answerData;
			
			var questionIndex = getQuestionIndex(pupilAnswerLog.questionID);
			if (questionIndex === -1 || un(class1.questionData[questionIndex])) continue;
			var question = class1.questionData[questionIndex];
			var questionPart = question.parts[pupilAnswerLog.questionPart];
			questionPart.allLogs.push(pupilAnswerLog);
			
			pupilAnswerLog._pupil = pupil;
			pupilAnswerLog._answer = answer;
			pupilAnswerLog._questionPart = questionPart;
			
			if (typeof answer === 'object') {
				if (un(answer._pupilAnswerLogs)) answer._pupilAnswerLogs = [];
				answer._pupilAnswerLogs.push(pupilAnswerLog);
			}
			
			if (typeof pupil === 'object') {
				if (un(pupil._pupilAnswerLogs)) pupil._pupilAnswerLogs = [];
				pupil._pupilAnswerLogs.push(pupilAnswerLog);
				
				if (un(pupil._questionAnswerLogs)) pupil._questionAnswerLogs = [];
				if (un(pupil._questionAnswerLogs[questionIndex])) pupil._questionAnswerLogs[questionIndex] = {parts:[]};
				if (un(pupil._questionAnswerLogs[questionIndex].parts[pupilAnswerLog.questionPart])) pupil._questionAnswerLogs[questionIndex].parts[pupilAnswerLog.questionPart] = {logs:[]};
				pupil._questionAnswerLogs[questionIndex].parts[pupilAnswerLog.questionPart].logs.push(pupilAnswerLog);
			}
		}
		for (var l = 0; l < data.saveDataLogs.length; l++) {
			var saveDataLog = data.saveDataLogs[l];
			saveDataLog._pupil = getPupil(saveDataLog.pupilID);
			saveDataLog.saveData = getSaveData(pupilAnswerLog.saveDataLog);
			
			var questionIndex = getQuestionIndex(saveDataLog.questionID);
			if (questionIndex === -1 || un(class1.questionData[questionIndex])) continue;
			var question = class1.questionData[questionIndex];
			var questionPart = question.parts[saveDataLog.questionPart];
			
			if (un(pupil._saveDataLogs)) pupil._saveDataLogs = [];
			pupil._saveDataLogs.push(saveDataLog);
		}
		
		for (var type in data.saveInputsData) {
			if (data.saveInputsData[type] instanceof Array === false) continue;
			for (var i = 0; i < data.saveInputsData[type].length; i++) {
				var inputSaveData = data.saveInputsData[type][i];
				var answerLog = data.pupilAnswerLogs.find(function(x) {
					return Number(x.answerLogID) === Number(inputSaveData.answerLogID);
				});
				if (typeof answerLog !== 'object' || answerLog === null) continue;
				if (un(answerLog.saveInputsData)) answerLog.saveInputsData = {};
				if (un(answerLog.saveInputsData[type])) answerLog.saveInputsData[type] = [];
				answerLog.saveInputsData[type].push(inputSaveData);
			}
		}
		
		// analysis - sort pupil answerLogs (first, best etc)
		for (var p = 0; p < data.pupils.length; p++) {
			var pupil = data.pupils[p];
			pupil._firstAnswers = [];
			pupil._bestAnswers = [];
			for (var q = 0; q < task.questions.length; q++) {
				var taskQuestion = task.questions[q];
				pupil._firstAnswers[q] = [];
				pupil._bestAnswers[q] = [];
			}
			
			if (un(pupil._questionAnswerLogs)) continue; 
			for (var q = 0; q < pupil._questionAnswerLogs.length; q++) {
				var question = pupil._questionAnswerLogs[q];
				if (un(question) || un(question.parts)) continue; 
				for (var r = 0; r < question.parts.length; r++) {
					var questionPart = question.parts[r];
					if (un(questionPart)) continue;
					
					questionPart.logs.sort(function(a,b) {
						return b.timestamp-a.timestamp;
					});
					questionPart.firstLog = questionPart.logs[0];
					questionPart.bestLog = questionPart.logs.last();
					
					class1.questionData[q].parts[r].firstLogs.push(questionPart.firstLog);
					class1.questionData[q].parts[r].bestLogs.push(questionPart.bestLog);
					
					pupil._firstAnswers[q][r] = questionPart.firstLog;
					pupil._bestAnswers[q][r] = questionPart.bestLog;
				}
			}
		}
		
		class1.taskPupils = data.pupils.filter(function(x) {return !un(x._pupilTask) && Number(x._pupilTask.status) > 0;});
		
		for (var q = 0; q < class1.questionData.length; q++) {
			var question = class1.questionData[q];
			if (un(question) || un(question.parts)) continue; 
			for (var r = 0; r < question.parts.length; r++) {
				var part = question.parts[r];
				if (un(part)) continue;
				
				part.logsByPupil = [];
				part.logsByAnswer = [];
				part.logsByMark = [];
				
				for (var p = 0; p < data.pupils.length; p++) {
					var pupil = data.pupils[p];
					var pupilTaskStarted =  class1.taskPupils.indexOf(pupil) > -1 ? true : false;
					part.logsByPupil.push({pupilID:pupil.pupilID,pupil:pupil,logs:[],pupilTaskStarted:pupilTaskStarted});
				}
				for (var l = 0; l < part.allLogs.length; l++) {
					var log = part.allLogs[l];

					if (un(log.answerData) && !un(log.saveInputsData)) {
						log.answerData = draw.taskQuestion.getAnswerDataFromSaveInputsData(question.taskQuestion.obj,log.saveInputsData);
					}

					if (!un(log.answerData)) {
						log._tableDisplay = draw.taskQuestion.getAnswerTableDisplay(question.taskQuestion.obj,log.answerData);
					} else if (!un(log.answerDescription)) {
						log._tableDisplay = textArrayDecompress(String(log.answerDescription));
					} else {
						log._tableDisplay = [''];
					}
					var answer = part.logsByAnswer.find(function(x) {return (x.marks === log.marks && isEqual(x.tableDisplay,log._tableDisplay));});
					if (!un(answer)) { 
						var pupilAnswer = answer.logs.find(function(x) {return x.pupilID === log.pupilID}); // check for same answer repeated by same pupil
						if (un(pupilAnswer)) {
							if (answer.answerIDs.indexOf(log.answerID) === -1) answer.answerIDs.push(log.answerID);
							answer.freq++;
							answer.logs.push(log);
						}
					} else {
						var color = draw.task.getProportionalColor(log.marks/part.marksMax);
						var colors = {
							color:color,
							line:draw.task.pSBC(-0.6,color),
							fill:draw.task.pSBC(0.6,color)
						}
						if(!un(log.answerData)) {
							log._tableDisplay = draw.taskQuestion.getAnswerTableDisplay(question.taskQuestion.obj,log.answerData);
						} else if (!un(log.answerDescription)) {
							log._tableDisplay = textArrayDecompress(String(log.answerDescription));
						} else {
							log._tableDisplay = [''];
						}
						part.logsByAnswer.push({answerIDs:[log.answerID],answer:log._answer,answerData:log.answerData,marks:log.marks,marksMax:part.marksMax,freq:1,colors:colors,logs:[log],tableDisplay:log._tableDisplay});
					}
					var mark = part.logsByMark.find(function(x) {return x.marks === log.marks});
					if (!un(mark)) { 
						mark.freq++;
						mark.logs.push(log);
					} else {
						var color = draw.task.getProportionalColor(log.marks/part.marksMax);
						var colors = {
							color:color,
							line:draw.task.pSBC(-0.6,color),
							fill:draw.task.pSBC(0.6,color)
						}
						part.logsByMark.push({marks:log.marks,marksMax:part.marksMax,freq:1,colors:colors,logs:[log]});
					}
					var pupil = part.logsByPupil.find(function(x) {return x.pupilID === log.pupilID});
					if (!un(pupil)) { 
						pupil.logs.push(log);
					}
				}
				
				var pupilPartNotAnswered = part.logsByPupil.filter(function(x) {return x.logs.length === 0 ? true : false;});
				if (pupilPartNotAnswered.length > 0) {
					var colors = {color:'#CCC',line:'#000',fill:'#CCC'};
					var logs = pupilPartNotAnswered.map(function(x) {
						return {pupilID:x.pupilID};
					});
					part.logsByAnswer.push({notAnswered:true,freq:pupilPartNotAnswered.length,_marks:0,colors:colors,logs:logs,tableDisplay:['<<italic:true>>- not answered -']});
				}
				
				part.logsByAnswer.sort(function(a,b) {
					if (a.freq !== b.freq) return b.freq-a.freq;
					var aMarks = !un(a.marks) ? a.marks : 0;
					var bMarks = !un(b.marks) ? b.marks : 0;
					if (aMarks !== bMarks) return bMarks-aMarks;
				});
				
				part.logsByMark.sort(function(a,b) {
					if (a.marks !== b.marks) return b.marks-a.marks;
					if (a.freq !== b.freq) return b.freq-a.freq;
				});
				
				
				part.taskPupilsMarks = 0;
				part.taskPupilsMarksMax = part.marksMax * class1.taskPupils.length;
				part.taskPupilsAnalysisScore = 0;
				part.taskPupilsByQuestionScore = [
					{status:'Correct 1st attempt',freq:0,color:'#CFC',pupils:[]},
					{status:'Correct >1 attempt',freq:0,color:'#CFC',pupils:[]},
					{status:'Partly correct',freq:0,color:'#FFC',pupils:[]},
					{status:'No marks',freq:0,color:'#FCC',pupils:[]},
					{status:'Not answered',freq:0,color:'#CCC',pupils:[]},
				]
				part.logsByPupilTaskStarted = part.logsByPupil.filter(function(x) {
					return x.pupilTaskStarted === true;
				});
				for (var p = 0; p < part.logsByPupilTaskStarted.length; p++) {
					var pupil = part.logsByPupilTaskStarted[p];
					pupil.logs.sort(function(a,b) {return a._timestamp-b._timestamp});
					
					if (pupil.logs.length === 0) {
						pupil.marks = 0;
						pupil.pupilAnalysisScore = 0;
						part.taskPupilsByQuestionScore[4].pupils.push(pupil);
						part.taskPupilsByQuestionScore[4].freq++;
					} else {
						if (data.saveDataLogs instanceof Array) { // fix for pre- 2020-07-02 saved data
							var lastAnswer = pupil.logs.last();
							if (lastAnswer.saveDataID === null && un(lastAnswer.saveData)) {
								var saveData = data.saveDataLogs.find(function(x) {
									return x.pupilID === lastAnswer.pupilID && x.questionID === lastAnswer.questionID;
								});
								if (typeof saveData === 'object' && saveData !== null) {
									lastAnswer.saveDataID = saveData.saveDataID;
									if (un(saveData.saveData)) saveData.saveData = getSaveData(saveData.saveDataID).saveData;
									lastAnswer.saveData = saveData;
								}
							}
						}
						
						pupil.marks = pupil.logs.last().marks;
						pupil.attempts = pupil.logs.length;
						if (pupil.marks === part.marksMax) {
							if (pupil.attempts === 1) {
								part.taskPupilsByQuestionScore[0].pupils.push(pupil);
								part.taskPupilsByQuestionScore[0].freq++;
								pupil.pupilAnalysisScore = 1;
							} else {
								part.taskPupilsByQuestionScore[1].pupils.push(pupil);
								part.taskPupilsByQuestionScore[1].freq++;
								pupil.pupilAnalysisScore = 1/pupil.attempts;
							}
						} else if (pupil.marks === 0) {
							part.taskPupilsByQuestionScore[3].pupils.push(pupil);
							part.taskPupilsByQuestionScore[3].freq++;
							pupil.pupilAnalysisScore = 0;
						} else {
							part.taskPupilsByQuestionScore[2].pupils.push(pupil);
							part.taskPupilsByQuestionScore[2].freq++;
							pupil.pupilAnalysisScore = (pupil.marks/part.marksMax)/pupil.attempts;
						}
						part.taskPupilsMarks += pupil.marks;
						part.taskPupilsAnalysisScore += (pupil.pupilAnalysisScore / part.logsByPupilTaskStarted.length);
					}
				}
				if (question.parts[0].allLogs.length === 0 || class1.taskPupils.length === 0) {
					part.taskPupilsAnalysisColor = '#FFF';
				} else {
					part.taskPupilsAnalysisColor = draw.task.pSBC(0.6,draw.task.getProportionalColor(part.taskPupilsAnalysisScore));
				}
				part.taskPupilsAnalysisCategory = part.taskPupilsAnalysisScore === 1 ? 'Perfect' : part.taskPupilsAnalysisScore >= 0.8 ? 'Very Good' : part.taskPupilsAnalysisScore >= 0.6 ? 'Good' : part.taskPupilsAnalysisScore >= 0.4 ? 'OK' : part.taskPupilsAnalysisScore >= 0.2 ? 'Poor' : 'Very Poor';
				
				part.taskPupilsPercentage = Math.round(100*part.taskPupilsMarks/part.taskPupilsMarksMax);
				
				part.taskPupilsWithFullMarksCount = part.taskPupilsByQuestionScore[0].freq+part.taskPupilsByQuestionScore[1].freq;
				part.taskPupilsCount = class1.taskPupils.length;
				
				var color = draw.task.getProportionalColor(part.taskPupilsMarks/part.taskPupilsMarksMax);
				part.taskPupilsColors = {
					color:color,
					line:draw.task.pSBC(-0.6,color),
					fill:draw.task.pSBC(0.6,color)
				}				
				
			}
		}
		
		class1.pupilsByStatus = [[],[],[],[]];
		class1.pupilsByPercentage = [];
		class1.pupilTasksPercentages = [];
		for (var p = 0; p < data.pupils.length; p++) {
			var pupil = data.pupils[p];
			
			var status = !un(pupil._pupilTask) ? pupil._pupilTask.status : 0;
			if (status === 2) status = 1;
			class1.pupilsByStatus[status].push(pupil);
			if (status > 0) {
				if (un(class1.pupilsByPercentage[pupil._pupilTask.percentage])) class1.pupilsByPercentage[pupil._pupilTask.percentage] = [];
				class1.pupilsByPercentage[pupil._pupilTask.percentage].push(pupil);
				class1.pupilTasksPercentages.push(pupil._pupilTask.percentage);
			}
			
			class1.pupilData.push({
				pupilID:pupil.pupilID,
				pupilName:pupil.pupilName,
				pupilTask:pupil._pupilTask,
				logs:pupil._questionAnswerLogs,
				firstAnswers:pupil._firstAnswers,
				bestAnswers:pupil._bestAnswers
			});
		}
		
		//console.log('class1',class1);
		
	},*/
	classTaskDataSetup: function(class1) {
		if (un(class1.questionData)) class1.questionData = [];
		if (un(class1.pupilData)) class1.pupilData = [];
		for (var q = 0; q < draw.task.questions.length; q++) {
			if (!un(class1.questionData[q])) continue;
			var taskQuestion = draw.task.questions[q];
			var questionID = taskQuestion.questionID;
			var question = {parts:[],marksMax:arraySum(taskQuestion.partMarksMax),taskQuestion:taskQuestion};
			class1.questionData[q] = question;
			for (var p = 0; p < taskQuestion.parts.length; p++) {
				question.parts[p] = {marksMax:taskQuestion.partMarksMax[p],allLogs:[],firstLogs:[],bestLogs:[]};
			}
		}
	},
	classTaskDataAddData: function(class1,data) {
		if (un(class1.data)) class1.data = {};
		for (var key in data) {
			if (data[key] instanceof Array === false) continue;
			if (un(class1.data[key])) class1.data[key] = [];
			//console.log(key,data[key],class1.data[key]);
			if (data[key].length > 0) class1.data[key] = class1.data[key].concat(data[key]);
		}
		if (!un(data.saveInputsData)) {
			if (un(class1.data.saveInputsData)) class1.data.saveInputsData = {};
			for (var key in data.saveInputsData) {
				if (data.saveInputsData[key] instanceof Array === false) continue;
				if (un(class1.data.saveInputsData[key])) class1.data.saveInputsData[key] = [];
				if (data.saveInputsData[key].length > 0) class1.data.saveInputsData[key] = class1.data.saveInputsData[key].concat(data.saveInputsData[key]);
			}
		}
		
		for (var t = 0; t < data.pupilTasks.length; t++) { // fix pupilTask answerLog2 / tasksLog discrepancy
			var pupilTask = data.pupilTasks[t];
			pupilTask.percentage = Number(pupilTask.percentage);
			pupilTask.status = Number(pupilTask.status);
			pupilTask.totalTime = Number(pupilTask.totalTime);
			pupilTask.attempts = Number(pupilTask.attempts);

			pupilTask._questions = class1.data.taskQuestions.filter(function(x) {return x.taskID === pupilTask.taskID});
			pupilTask._marks = 0;
			pupilTask._maxMarks = 0;
			pupilTask._answerLogMaxTimeInSeconds = 0;
			pupilTask._answerLogsByQuestion = [];
			for (var q = 0; q < pupilTask._questions.length; q++) {
				var question = pupilTask._questions[q];
				//pupilTask._maxMarks += Number(question.partMarksMax);
				pupilTask._maxMarks += Number(question.maxMarks);
			}		
			pupilTask._answerLogs = class1.data.pupilAnswerLogs.filter(function(x) {return x.taskID === pupilTask.taskID && x.pupilID === pupilTask.pupilID;});
			for (var a = 0; a < pupilTask._answerLogs.length; a++) {
				var answerLog = pupilTask._answerLogs[a];
				answerLog.answerLogID = Number(answerLog.answerLogID);
				answerLog._pupilTask = pupilTask;
				answerLog._question = class1.data.taskQuestions.find(function(x) {return x.questionID === answerLog.questionID && x.taskID === answerLog.taskID;});
				answerLog._questionNum = typeof answerLog._question === 'object' && answerLog._question !== null ? Number(answerLog._question.questionNum) : -1;
				if (typeof answerLog._questionNum === 'number' && answerLog._questionNum > 0) {
					if (typeof pupilTask._answerLogsByQuestion[answerLog._questionNum] === 'undefined') pupilTask._answerLogsByQuestion[answerLog._questionNum] = [];
					pupilTask._answerLogsByQuestion[answerLog._questionNum].push(answerLog);
				}
				var taskDurationInSeconds = Number(answerLog.taskDurationInSeconds);
				if (!isNaN(taskDurationInSeconds) && taskDurationInSeconds > 0) {
					pupilTask._answerLogMaxTimeInSeconds = Math.max(pupilTask._answerLogMaxTimeInSeconds,taskDurationInSeconds);
				}
			}
			for (var q = 0; q < pupilTask._answerLogsByQuestion.length; q++) {
				if (typeof pupilTask._answerLogsByQuestion[q] === 'undefined') continue;
				var questionAnswerLogs = pupilTask._answerLogsByQuestion[q];
				if (questionAnswerLogs.length === 0) continue;
				questionAnswerLogs.sort(function(a,b) {
					return b.answerLogID-a.answerLogID;
				})
				var questionAnswerLog = questionAnswerLogs[0]; // need to ensure most recent log is selected
				if (typeof questionAnswerLog === 'object') {
					pupilTask._marks += Number(questionAnswerLog.marks);
				}
			}
			if (pupilTask._questions.length > 0 && pupilTask._answerLogs.length > 0 && pupilTask._maxMarks > 0 && pupilTask._marks > 0) {
				var log = false;
				pupilTask._answerLogPercentage = Math.min(100,Math.round(100*pupilTask._marks/pupilTask._maxMarks));
				if (pupilTask._answerLogPercentage > pupilTask.percentage) {
					pupilTask._tasksLogPercentage = pupilTask.percentage;
					pupilTask.percentage = pupilTask._answerLogPercentage;
					log = true;
				}
				pupilTask._answerLogStatus = pupilTask.percentage === 100 ? 3 : 1;
				if (pupilTask._answerLogStatus > pupilTask.status) {
					pupilTask._tasksLogStatus = pupilTask.status;
					pupilTask.status = pupilTask._answerLogStatus;
					log = true;
				}
				pupilTask._answerLogMaxTimeInMinutes = Math.round(pupilTask._answerLogMaxTimeInSeconds/60);
				if (pupilTask._answerLogMaxTimeInMinutes > pupilTask.totalTime) {
					pupilTask._tasksLogTotalTime = pupilTask.totalTime;
					pupilTask.totalTime = pupilTask._answerLogMaxTimeInMinutes;
					log = true;
				}
				if (draw.task.logging === true && log === true) console.log(pupilTask);
			}
			// WHAT IF THERE ARE ANSWER LOGS THAT DO NOT CORRESPOND TO A pupilTask?
		}
		for (var t = 0; t < data.pupilTasks.length; t++) {
			var pupilTask = data.pupilTasks[t];
			var pupil = getPupil(pupilTask.pupilID);
			pupilTask._pupil = pupil;
			pupil._pupilTask = pupilTask;
		}
		
		// sort pupilAnswerLogs
		for (var l = 0; l < data.pupilAnswerLogs.length; l++) {
			var pupilAnswerLog = data.pupilAnswerLogs[l];
			var pupil = getPupil(pupilAnswerLog.pupilID);
			var answer = getAnswer(pupilAnswerLog.answerID);
			if (!un(pupilAnswerLog.saveDataID)) pupilAnswerLog.saveData = getSaveData(pupilAnswerLog.saveDataID);
			
			pupilAnswerLog._timestamp = new Date(pupilAnswerLog.timestamp).getTime();
			if (typeof answer === 'object') pupilAnswerLog.answerData = answer.answerData;
			
			var questionIndex = getQuestionIndex(pupilAnswerLog.questionID);
			if (questionIndex === -1 || un(class1.questionData[questionIndex])) continue;
			var question = class1.questionData[questionIndex];
			var questionPart = question.parts[pupilAnswerLog.questionPart];
			questionPart.allLogs.push(pupilAnswerLog);
			
			pupilAnswerLog._pupil = pupil;
			pupilAnswerLog._answer = answer;
			pupilAnswerLog._questionPart = questionPart;
			
			if (typeof answer === 'object') {
				if (un(answer._pupilAnswerLogs)) answer._pupilAnswerLogs = [];
				answer._pupilAnswerLogs.push(pupilAnswerLog);
			}
			
			if (typeof pupil === 'object') {
				if (un(pupil._pupilAnswerLogs)) pupil._pupilAnswerLogs = [];
				pupil._pupilAnswerLogs.push(pupilAnswerLog);
				
				if (un(pupil._questionAnswerLogs)) pupil._questionAnswerLogs = [];
				if (un(pupil._questionAnswerLogs[questionIndex])) pupil._questionAnswerLogs[questionIndex] = {parts:[]};
				if (un(pupil._questionAnswerLogs[questionIndex].parts[pupilAnswerLog.questionPart])) pupil._questionAnswerLogs[questionIndex].parts[pupilAnswerLog.questionPart] = {logs:[]};
				pupil._questionAnswerLogs[questionIndex].parts[pupilAnswerLog.questionPart].logs.push(pupilAnswerLog);
			}
		}
		if (!un(data.saveDataLogs)) {
			for (var l = 0; l < data.saveDataLogs.length; l++) {
				var saveDataLog = data.saveDataLogs[l];
				saveDataLog._pupil = getPupil(saveDataLog.pupilID);
				saveDataLog.saveData = getSaveData(pupilAnswerLog.saveDataLog);
				
				var questionIndex = getQuestionIndex(saveDataLog.questionID);
				if (questionIndex === -1 || un(class1.questionData[questionIndex])) continue;
				var question = class1.questionData[questionIndex];
				var questionPart = question.parts[saveDataLog.questionPart];
				
				if (un(pupil._saveDataLogs)) pupil._saveDataLogs = [];
				pupil._saveDataLogs.push(saveDataLog);
			}
		}
		
		if (!un(data.saveInputsData)) {
			for (var type in data.saveInputsData) {
				if (data.saveInputsData[type] instanceof Array === false) continue;
				for (var i = 0; i < data.saveInputsData[type].length; i++) {
					var inputSaveData = data.saveInputsData[type][i];
					var answerLog = data.pupilAnswerLogs.find(function(x) {
						return Number(x.answerLogID) === Number(inputSaveData.answerLogID);
					});
					if (typeof answerLog !== 'object' || answerLog === null) continue;
					if (un(answerLog.saveInputsData)) answerLog.saveInputsData = {};
					if (un(answerLog.saveInputsData[type])) answerLog.saveInputsData[type] = [];
					answerLog.saveInputsData[type].push(inputSaveData);
				}
		}
		}
		
		function getAnswer(answerID) {
			return class1.data.pupilAnswers.find(function(x) {return x.answerID === answerID});
		}
		function getSaveData(saveDataID) {
			return class1.data.saveData.find(function(x) {return x.saveDataID === saveDataID});
		}
		function getPupil(pupilID) {
			return class1.data.pupils.find(function(x) {return x.pupilID === pupilID});
		}
		function getQuestionIndex(questionID) {
			var question = draw.task.questions.find(function(x) {return x.questionID ===  Number(questionID);})
			return draw.task.questions.indexOf(question);
		}
	},
	classTaskDataAnalyse: function(class1) {
		var data = class1.data;
		var task = draw.task;
		
		for (var p = 0; p < data.pupils.length; p++) {
			var pupil = data.pupils[p];
			pupil._firstAnswers = [];
			pupil._bestAnswers = [];
			for (var q = 0; q < task.questions.length; q++) {
				var taskQuestion = task.questions[q];
				pupil._firstAnswers[q] = [];
				pupil._bestAnswers[q] = [];
			}
			
			if (un(pupil._questionAnswerLogs)) continue; 
			for (var q = 0; q < pupil._questionAnswerLogs.length; q++) {
				var question = pupil._questionAnswerLogs[q];
				if (un(question) || un(question.parts)) continue; 
				for (var r = 0; r < question.parts.length; r++) {
					var questionPart = question.parts[r];
					if (un(questionPart)) continue;
					
					questionPart.logs.sort(function(a,b) {
						return b.timestamp-a.timestamp;
					});
					questionPart.firstLog = questionPart.logs[0];
					questionPart.bestLog = questionPart.logs.last();
					
					class1.questionData[q].parts[r].firstLogs.push(questionPart.firstLog);
					class1.questionData[q].parts[r].bestLogs.push(questionPart.bestLog);
					
					pupil._firstAnswers[q][r] = questionPart.firstLog;
					pupil._bestAnswers[q][r] = questionPart.bestLog;
				}
			}
		}
		
		class1.taskPupils = data.pupils.filter(function(x) {return !un(x._pupilTask) && Number(x._pupilTask.status) > 0;});
		
		for (var q = 0; q < class1.questionData.length; q++) {
			var question = class1.questionData[q];
			if (un(question) || un(question.parts)) continue; 
			for (var r = 0; r < question.parts.length; r++) {
				var part = question.parts[r];
				if (un(part)) continue;
				
				part.logsByPupil = [];
				part.logsByAnswer = [];
				part.logsByMark = [];
				
				/*for (var p = 0; p < class1.taskPupils.length; p++) {
					var pupil = class1.taskPupils[p];
					part.logsByPupil.push({pupilID:pupil.pupilID,pupil:pupil,logs:[]});
				}*/
				for (var p = 0; p < data.pupils.length; p++) {
					var pupil = data.pupils[p];
					var pupilTaskStarted =  class1.taskPupils.indexOf(pupil) > -1 ? true : false;
					part.logsByPupil.push({pupilID:pupil.pupilID,pupil:pupil,logs:[],pupilTaskStarted:pupilTaskStarted});
				}
				for (var l = 0; l < part.allLogs.length; l++) {
					var log = part.allLogs[l];

					if (un(log.answerData) && !un(log.saveInputsData)) {
						log.answerData = draw.taskQuestion.getAnswerDataFromSaveInputsData(question.taskQuestion.obj,log.saveInputsData);
					}

					if (!un(log.answerData)) {
						log._tableDisplay = draw.taskQuestion.getAnswerTableDisplay(question.taskQuestion.obj,log.answerData);
					} else if (!un(log.answerDescription)) {
						log._tableDisplay = textArrayDecompress(String(log.answerDescription));
					} else {
						log._tableDisplay = [''];
					}
					var answer = part.logsByAnswer.find(function(x) {return (x.marks === log.marks && isEqual(x.tableDisplay,log._tableDisplay));});
					if (!un(answer)) { 
						var pupilAnswer = answer.logs.find(function(x) {return x.pupilID === log.pupilID}); // check for same answer repeated by same pupil
						if (un(pupilAnswer)) {
							if (answer.answerIDs.indexOf(log.answerID) === -1) answer.answerIDs.push(log.answerID);
							answer.freq++;
							answer.logs.push(log);
						}
					} else {
						var color = draw.task.getProportionalColor(log.marks/part.marksMax);
						var colors = {
							color:color,
							line:draw.task.pSBC(-0.6,color),
							fill:draw.task.pSBC(0.6,color)
						}
						if(!un(log.answerData)) {
							log._tableDisplay = draw.taskQuestion.getAnswerTableDisplay(question.taskQuestion.obj,log.answerData);
						} else if (!un(log.answerDescription)) {
							log._tableDisplay = textArrayDecompress(String(log.answerDescription));
						} else {
							log._tableDisplay = [''];
						}
						part.logsByAnswer.push({answerIDs:[log.answerID],answer:log._answer,answerData:log.answerData,marks:log.marks,marksMax:part.marksMax,freq:1,colors:colors,logs:[log],tableDisplay:log._tableDisplay});
					}
					var mark = part.logsByMark.find(function(x) {return x.marks === log.marks});
					if (!un(mark)) { 
						mark.freq++;
						mark.logs.push(log);
					} else {
						var color = draw.task.getProportionalColor(log.marks/part.marksMax);
						var colors = {
							color:color,
							line:draw.task.pSBC(-0.6,color),
							fill:draw.task.pSBC(0.6,color)
						}
						part.logsByMark.push({marks:log.marks,marksMax:part.marksMax,freq:1,colors:colors,logs:[log]});
					}
					var pupil = part.logsByPupil.find(function(x) {return x.pupilID === log.pupilID});
					if (!un(pupil)) { 
						pupil.logs.push(log);
					}
				}
				
				var pupilPartNotAnswered = part.logsByPupil.filter(function(x) {return x.logs.length === 0 ? true : false;});
				if (pupilPartNotAnswered.length > 0) {
					var colors = {color:'#CCC',line:'#000',fill:'#CCC'};
					var logs = pupilPartNotAnswered.map(function(x) {
						return {pupilID:x.pupilID};
					});
					part.logsByAnswer.push({notAnswered:true,freq:pupilPartNotAnswered.length,_marks:0,colors:colors,logs:logs,tableDisplay:['<<italic:true>>- not answered -']});
				}
				
				part.logsByAnswer.sort(function(a,b) {
					if (a.freq !== b.freq) return b.freq-a.freq;
					var aMarks = !un(a.marks) ? a.marks : 0;
					var bMarks = !un(b.marks) ? b.marks : 0;
					if (aMarks !== bMarks) return bMarks-aMarks;
				});
				
				part.logsByMark.sort(function(a,b) {
					if (a.marks !== b.marks) return b.marks-a.marks;
					if (a.freq !== b.freq) return b.freq-a.freq;
				});
				
				
				part.taskPupilsMarks = 0;
				part.taskPupilsMarksMax = part.marksMax * class1.taskPupils.length;
				part.taskPupilsAnalysisScore = 0;
				part.taskPupilsByQuestionScore = [
					{status:'Correct 1st attempt',freq:0,color:'#CFC',pupils:[]},
					{status:'Correct >1 attempt',freq:0,color:'#CFC',pupils:[]},
					{status:'Partly correct',freq:0,color:'#FFC',pupils:[]},
					{status:'No marks',freq:0,color:'#FCC',pupils:[]},
					{status:'Not answered',freq:0,color:'#CCC',pupils:[]},
				]
				part.logsByPupilTaskStarted = part.logsByPupil.filter(function(x) {
					return x.pupilTaskStarted === true;
				});
				for (var p = 0; p < part.logsByPupilTaskStarted.length; p++) {
					var pupil = part.logsByPupilTaskStarted[p];
					pupil.logs.sort(function(a,b) {return a._timestamp-b._timestamp});
					
					if (pupil.logs.length === 0) {
						pupil.marks = 0;
						pupil.pupilAnalysisScore = 0;
						part.taskPupilsByQuestionScore[4].pupils.push(pupil);
						part.taskPupilsByQuestionScore[4].freq++;
					} else {
						if (data.saveDataLogs instanceof Array) { // fix for pre- 2020-07-02 saved data
							var lastAnswer = pupil.logs.last();
							if (lastAnswer.saveDataID === null && un(lastAnswer.saveData)) {
								var saveData = data.saveDataLogs.find(function(x) {
									return x.pupilID === lastAnswer.pupilID && x.questionID === lastAnswer.questionID;
								});
								if (typeof saveData === 'object' && saveData !== null) {
									lastAnswer.saveDataID = saveData.saveDataID;
									if (un(saveData.saveData)) saveData.saveData = getSaveData(saveData.saveDataID).saveData;
									lastAnswer.saveData = saveData;
								}
							}
						}
						
						pupil.marks = pupil.logs.last().marks;
						pupil.attempts = pupil.logs.length;
						if (pupil.marks === part.marksMax) {
							if (pupil.attempts === 1) {
								part.taskPupilsByQuestionScore[0].pupils.push(pupil);
								part.taskPupilsByQuestionScore[0].freq++;
								pupil.pupilAnalysisScore = 1;
							} else {
								part.taskPupilsByQuestionScore[1].pupils.push(pupil);
								part.taskPupilsByQuestionScore[1].freq++;
								pupil.pupilAnalysisScore = 1/pupil.attempts;
							}
						} else if (pupil.marks === 0) {
							part.taskPupilsByQuestionScore[3].pupils.push(pupil);
							part.taskPupilsByQuestionScore[3].freq++;
							pupil.pupilAnalysisScore = 0;
						} else {
							part.taskPupilsByQuestionScore[2].pupils.push(pupil);
							part.taskPupilsByQuestionScore[2].freq++;
							pupil.pupilAnalysisScore = (pupil.marks/part.marksMax)/pupil.attempts;
						}
						part.taskPupilsMarks += pupil.marks;
						part.taskPupilsAnalysisScore += (pupil.pupilAnalysisScore / part.logsByPupilTaskStarted.length);
					}
				}
				if (question.parts[0].allLogs.length === 0 || class1.taskPupils.length === 0) {
					part.taskPupilsAnalysisColor = '#FFF';
				} else {
					part.taskPupilsAnalysisColor = draw.task.pSBC(0.6,draw.task.getProportionalColor(part.taskPupilsAnalysisScore));
				}
				part.taskPupilsAnalysisCategory = part.taskPupilsAnalysisScore === 1 ? 'Perfect' : part.taskPupilsAnalysisScore >= 0.8 ? 'Very Good' : part.taskPupilsAnalysisScore >= 0.6 ? 'Good' : part.taskPupilsAnalysisScore >= 0.4 ? 'OK' : part.taskPupilsAnalysisScore >= 0.2 ? 'Poor' : 'Very Poor';
				
				part.taskPupilsPercentage = Math.round(100*part.taskPupilsMarks/part.taskPupilsMarksMax);
				
				part.taskPupilsWithFullMarksCount = part.taskPupilsByQuestionScore[0].freq+part.taskPupilsByQuestionScore[1].freq;
				part.taskPupilsCount = class1.taskPupils.length;
				
				var color = draw.task.getProportionalColor(part.taskPupilsMarks/part.taskPupilsMarksMax);
				part.taskPupilsColors = {
					color:color,
					line:draw.task.pSBC(-0.6,color),
					fill:draw.task.pSBC(0.6,color)
				}				
				
			}
		}
		
		class1.pupilsByStatus = [[],[],[],[]];
		class1.pupilsByPercentage = [];
		class1.pupilTasksPercentages = [];
		for (var p = 0; p < data.pupils.length; p++) {
			var pupil = data.pupils[p];
			
			var status = !un(pupil._pupilTask) ? pupil._pupilTask.status : 0;
			if (status === 2) status = 1;
			class1.pupilsByStatus[status].push(pupil);
			if (status > 0) {
				if (un(class1.pupilsByPercentage[pupil._pupilTask.percentage])) class1.pupilsByPercentage[pupil._pupilTask.percentage] = [];
				class1.pupilsByPercentage[pupil._pupilTask.percentage].push(pupil);
				class1.pupilTasksPercentages.push(pupil._pupilTask.percentage);
			}
			
			var pupilData = class1.pupilData.find(function(x) {
				return x.pupilID === pupil.pupilID;
			});
			if (typeof pupilData === 'object' && pupilData !== null) {
				pupilData.pupilTask = pupil._pupilTask;
				pupilData.logs = pupil._questionAnswerLogs;
				pupilData.firstAnswers = pupil._firstAnswers;
				pupilData.bestAnswers = pupil._bestAnswers;
			} else {
				class1.pupilData.push({
					pupilID:pupil.pupilID,
					pupilName:pupil.pupilName,
					pupilTask:pupil._pupilTask,
					logs:pupil._questionAnswerLogs,
					firstAnswers:pupil._firstAnswers,
					bestAnswers:pupil._bestAnswers
				});
			}
		}
	},
	
	// pupils data
	setPupilIndex: function(index) {
		if (un(draw.task.pupils[index])) return;
		draw.task.pupilIndex = index;
		draw.task.pupil = draw.task.pupils[index];
	},
	getPupilDropDown: function(rect) {
		if (un(draw.taskTitle._pupilDropMenu)) {
			draw.taskTitle._pupilDropMenu = {
				type: 'dropMenu2',
				left: rect[0],
				top: rect[1],
				rect: [0,0,rect[2],rect[3]],
				padding: 2,
				align: [0, 0],
				fontSize: 24,
				box: {
					type: 'loose',
					color: '#F99',
					borderColor: '#000',
					borderWidth: 3
				},
				optionBox: {
					color: '#FCC',
					lineWidth: 2,
					align: [0, 0]
				},
				showDownArrow: true,
				downArrowSize: 12,
				scrollSize: 12,
				zIndex: 600,
				_pageIndex: 0,
				_open: false,
				onchange: function () {
					var obj = this;
					var class1 = draw.task.classes[draw.task.classIndex];
					var pupil = class1.pupilData.find(function(x) {return x.pupilID === obj.value;});
					class1.pupilIndex = class1.pupilData.indexOf(pupil);
					
					draw.task.pupil = class1.pupilData[class1.pupilIndex];
					draw.task.reset();
					if (draw.task.getMode() === 'Review Pupil') {
						draw.task.loadPupilTaskState(draw.task.pupil.pupilID);
					}
				},
				options: [],
				drawOption:function(ctx,rect,option) {
					text({ctx:ctx,rect:[10,rect[1],rect[2]-80,rect[3]],text:option.pupilName,align:[-1,0],fontSize:24});
					text({ctx:ctx,rect:[rect[0]+rect[2]-60,rect[1],50,rect[3]],text:option.percentage,align:[1,0],fontSize:24});
				},
				text: ['<<italic:true>>- select pupil -'],
				value: -1,
				_draw: function() {
					draw.dropMenu2.draw(undefined,this);
				},
				classIndex:-1,
				_update:function() {
					var obj = this;
					if (obj.classIndex === draw.task.classIndex) return;
					obj.classIndex = draw.task.classIndex;
					obj.options = draw.task.classes[draw.task.classIndex].pupilData.map(function(x) {
						var color = '#CCC';
						var percentage = 0;
						if (!un(x.pupilTask) && typeof x.pupilTask.percentage === 'number' && x.pupilTask.percentage > 0) {
							percentage = x.pupilTask.percentage;
							color = draw.task.getProportionalColor(percentage/100);
						}
						var pupilName = textToMaxWidth({text:[x.pupilName],fontSize:24},rect[2]-110,'...');
						percentage = [percentage+'%'];
						return {value:x.pupilID,pupilName:pupilName,color:color,percentage:percentage};
					});
					obj.text = ['<<italic:true>>- select pupil -'];
					obj.value = -1;
					delete obj._selectedOption;
				}
			}
		}
		return draw.taskTitle._pupilDropMenu;
	},
	
	/*refreshClassData: function() {
		if (un(draw.task.class)) return;
		var classID = draw.task.class.classID;
		draw.task.getClassTaskData(classID,function() {
			//var class1 = draw.task.classes.find(function(x) {return x.classID === classID;});
			var class1 = draw.task.classesByID[Number(classID)];
			var index = draw.task.classes.indexOf(class1);
			draw.task.setClassIndex(index);
		});
	},*/
	
	// setting task
	getSetDateDropDown: function(rect) {
		if (un(draw.taskTitle._setDateMenu)) {
			var options = [];
			var today = new Date();
			for (var i = 0; i < 28; i++) {
				var date = draw.task.addDays(today,i);
				var dateStr = draw.task.dateToString(date);
				options.push({text:[dateStr],value:date});
			}
			draw.taskTitle._setDateMenu = {
				type: 'dropMenu2',
				left: rect[0],
				top: rect[1],
				rect: [0,0,rect[2],rect[3]],
				padding: 2,
				align: [0, 0],
				fontSize: 24,
				box: {
					type: 'loose',
					color: '#F99',
					borderColor: '#000',
					borderWidth: 3
				},
				optionBox: {
					color: '#FCC',
					lineWidth: 2,
					align: [0, 0]
				},
				showDownArrow: true,
				downArrowSize: 12,
				scrollSize: 12,
				zIndex: 610,
				_pageIndex: 0,				
				_open: false,
				options: options,
				text: clone(options[0].text),
				value: options[0].value,
				scrollSize: 7,
				onchange: function () {
					var obj = this;
					draw.task.classes[draw.task.classIndex]._setDate = obj.value;
				},
				_draw: function() {
					draw.dropMenu2.draw(undefined,this);
				}
			}
		}
		return draw.taskTitle._setDateMenu;
	},
	getDueDateDropDown: function(rect) {
		if (un(draw.taskTitle._dueDateMenu)) {
			var options = [];
			var today = new Date();
			for (var i = 0; i < 28; i++) {
				var date = draw.task.addDays(today,i);
				var dateStr = draw.task.dateToString(date);
				options.push({text:[dateStr],value:date});
			}
			draw.taskTitle._dueDateMenu = {
				type: 'dropMenu2',
				left: rect[0],
				top: rect[1],
				rect: [0,0,rect[2],rect[3]],
				padding: 2,
				align: [0, 0],
				fontSize: 24,
				box: {
					type: 'loose',
					color: '#F99',
					borderColor: '#000',
					borderWidth: 3
				},
				optionBox: {
					color: '#FCC',
					lineWidth: 2,
					align: [0, 0]
				},
				showDownArrow: true,
				downArrowSize: 12,
				scrollSize: 12,
				zIndex: 600,
				_pageIndex: 0,				
				_open: false,
				options: options,
				value: options[7].value,
				text: clone(options[7].text),
				scrollSize: 7,
				onchange: function () {
					var obj = this;
					draw.task.classes[draw.task.classIndex]._dueDate = obj.value;
				},
				_draw: function() {
					draw.dropMenu2.draw(undefined,this);
				}
			}
		}
		return draw.taskTitle._dueDateMenu;
	},
	setTaskForClass: function() {
		var class1 = draw.task.classes[draw.task.classIndex];
		var data = {
			classID: class1.classID,
			taskID: draw.task.taskID,
			teacherID: userInfo.tID,
			dateSet: class1._setDate.toISOString().slice(0,10),
			dateDue: class1._dueDate.toISOString().slice(0,10),
			pupilIDs: JSON.stringify(class1.pupilData.map(function(x) {return x.pupilID;})),
			testMode: !un(draw.currCursor) && !un(draw.currCursor.testMode) ? draw.currCursor.testMode : 0
		};
		var params = '';
		for (var key in data) {
			if (params.length > 0) params += '&';
			params += key+'='+encodeURIComponent(data[key]);
		}
		//console.log('set task',data);
		
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("post", "/i2/task/interact_teacherSetTask.php", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.errorCallback = function() {
			//Notifier.error('Error connecting to the server. Please try again shortly...');
		};		
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				if (typeof this.errorCallback == 'function') this.errorCallback();
				return;
			}
			//console.log(this.responseText);
			//console.log(draw.task.parse(this.responseText));
			draw.task.getClassTaskData(class1.classID);
		}
		xmlHttp.send(params);		
	},
	unsetTaskForClass: function() {
		var class1 = draw.task.classes[draw.task.classIndex];
		var data = {
			classId: class1.classID,
			taskId: draw.task.taskID,
			pupilIds: JSON.stringify(class1.pupilData.map(function(x) {return x.pupilID;}))
		};
		var params = '';
		for (var key in data) {
			if (params.length > 0) params += '&';
			params += key+'='+encodeURIComponent(data[key]);
		}
		//console.log('unset task',params);
		
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open("post", "/sessionVariables/unsetTask.php", true);
		xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttp.errorCallback = function() {
			//Notifier.error('Error connecting to the server. Please try again shortly...');
		};		
		xmlHttp.onreadystatechange = function() {
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				if (typeof this.errorCallback == 'function') this.errorCallback();
				return;
			}
			//console.log(this.responseText);
			//console.log(draw.task.parse(this.responseText));
			draw.task.getClassTaskData(class1.classID);
		}
		xmlHttp.send(params);		
	},
	addDays: function(date, days) {
		var result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	},
	dateToString: function(date,includeYear,relative) {
		var d = date.getDate();
		var dayIndex = date.getDay();	
		var monthIndex = date.getMonth();
		var year = date.getFullYear();
		
		var today = new Date();
		
		if (relative !== false) {
			var timeDiff = date.getTime() - today.getTime();
			var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
			if (diffDays == 0) {
				return "Today";
			} else if (diffDays == -1) {
				return "Yesterday";
			} else if (diffDays == 1) {
				return "Tomorrow";			
			}
		}
		
		var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
		var dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

		if (year < 2011 || isNaN(dayIndex) || isNaN(monthIndex) || isNaN(year)) return "";		
			
		var yearString = (includeYear === true || (Date.parse(today) - date) > 300*24*60*60*1000) ? ' '+year : '';
		return dayNames[dayIndex]+" "+d+" "+monthNames[monthIndex]+yearString;		
	},
	
	updateTrayCanvas: function() {
		if (userInfo.user === 'none' || userInfo.verified === 1) {
			taskTrayCanvas.ctx.clear();
			return;
		}
		var progress = draw.task.getProgress();
		var percentage = progress.marksMax === 0 ? 0 : (Math.round(100*progress.marks/progress.marksMax));
		var marks = progress.marksMax === 0 ? '...' : progress.marks + ' / ' + progress.marksMax + ' (' + percentage + '%)';
		var trayText = [userInfo.name+'  '+marks];
		var trayTextWidth = taskTrayCanvas.data[102];
		var trayTextHeight = taskTrayCanvas.data[103];
		
		var color = progress.marks > 0 && progress.marks === progress.marksMax ? '#CFC' : '#CFF';
		text({ctx:taskTrayCanvas.ctx,rect:[1.5,1.5,trayTextWidth-3,trayTextHeight-3],text:trayText,align:[0,0],fontSize:24,color:'#00F',font:'segoePrint',box:{type:'loose',color:color,borderColor:'#666',borderWidth:3,radius:5}});
	},

	getProportionalColor: function(value) {	// eg. getProportionalColor(0.5);
		var perc = Math.round(value * 100);
		var h = Math.floor(perc * 1.2);
		var s = 1;//Math.abs(perc - 50)/50;
		var v = 1;
		return hsv2rgb(h, s, v);
		
		function hsv2rgb (h, s, v) {
			// adapted from http://schinckel.net/2012/01/10/hsv-to-rgb-in-javascript/
			var rgb, i, data = [];
			if (s === 0) {
				rgb = [v,v,v];
			} else {
				h = h / 60;
				i = Math.floor(h);
				data = [v*(1-s), v*(1-s*(h-i)), v*(1-s*(1-(h-i)))];
				switch(i) {
					case 0:
						rgb = [v, data[2], data[0]];
						break;
					case 1:
						rgb = [data[1], v, data[0]];
						break;
					case 2:
						rgb = [data[0], v, data[2]];
						break;
					case 3:
						rgb = [data[0], data[1], v];
						break;
					case 4:
						rgb = [data[2], data[0], v];
						break;
					default:
						rgb = [v, data[0], data[1]];
						break;
				}
			}
			return '#' + rgb.map(function(x){
				return ("0" + Math.round(x*255).toString(16)).slice(-2);
			}).join('');
		}
	},
	
	pSBC: function pSBC(p, c0, c1, l) {
		// from https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
		// main usage:	pSBC(0.42,'#F00'); // 42% lighter
		// 				pSBC(-0.2,'#F00'); // 2%  darker
		
		var r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof(c1) == "string";
		if (typeof(p) != "number" || p < -1 || p > 1 || typeof(c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
		if (!this.pSBCr) {
			this.pSBCr = function(d) {
				var n = d.length, x = {};
				if (n > 9) {
					[r, g, b, a] = d = d.split(","),
					n = d.length;
					if (n < 3 || n > 4) return null;
					x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)),
					x.g = i(g),
					x.b = i(b),
					x.a = a ? parseFloat(a) : -1
				} else {
					if (n == 8 || n == 6 || n < 4) return null;
					if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
					d = i(d.slice(1), 16);
					if (n == 9 || n == 5) {
						x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000;
					} else {
						x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1
					}
				}
				return x
			};
		}
		h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = this.pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? this.pSBCr(c1) : P ? {
			r: 0,
			g: 0,
			b: 0,
			a: -1
		}
		 : {
			r: 255,
			g: 255,
			b: 255,
			a: -1
		}, p = P ? p * -1 : p, P = 1 - p;
		if (!f || !t) return null;
		if (l) {
			r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
		} else {
			r = m(Math.sqrt(P * f.r * f.r + p * t.r * t.r)), g = m(Math.sqrt(P * f.g *f.g + p * t.g * t.g)), b = m(Math.sqrt(P * f.b * f.b + p * t.b * t.b));
		}
		a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
		if (h) {
			return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
		} else {
			return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
		}
	},
  
	/*pSBC: function(p,c0,c1,l) { 
		
		// from https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
		// main usage:	pSBC(0.42,'#F00'); // 42% lighter
		// 				pSBC(-0.2,'#F00'); // 2%  darker
		
		var r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
		if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
		if (!this.pSBCr) {
			this.pSBCr = function(d) {
				var n=d.length,x={};
				if (n > 9) {
					[r,g,b,a]=d=d.split(","),n=d.length;
					if(n<3 || n>4) return null;
					x.r = i(r[3]=="a" ? r.slice(5) : r.slice(4));
					x.g = i(g);
					x.b=i(b);
					x.a= a ? parseFloat(a) : -1;
				} else {
					if(n==8 || n==6 || n<4) return null;
					if(n < 6) d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4 ? d[4] + d[4] : "");
					d=i(d.slice(1),16);
					if (n==9 || n==5) {
						x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
					} else {
						x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1;
					}
				}
				return x;
			};
		}
		h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
		if (!f || !t) return null;
		if (l) {
			r = m(P*f.r+p*t.r);
			g = m(P*f.g+p*t.g);
			b = m(P*f.b+p*t.b);
		} else {
			r = m(Math.pow(P*Math.pow(f.r,2)+p*Math.pow(t.r,2)),0.5);
			g = m(Math.pow(P*Math.pow(f.g,2)+p*Math.pow(t.g,2)),0.5);
			b = m(Math.pow(P*Math.pow(f.b,2)+p*Math.pow(t.b,2)),0.5);
		}
		a=f.a;
		t=t.a;
		f= a >= 0 || t >= 0;
		a= f ? a<0 ? t : t<0 ? a : a*P + t*p : 0;
		if (h) {
			return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
		} else {
			return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2);
		}
	},*/
	/*
	exportPDF: function() {
		var resource = file.resources[resourceIndex];
		canvasPdf.getResourcePDF(resource,'worksheet','download');
	}
	
	progressBox: {
		width:600,
		height:350,
		create: function() {
			draw.task.progressBox.canvas = createCanvas((1225-draw.task.progressBox.width)/2, (700-draw.task.progressBox.height)/2, draw.task.progressBox.width, draw.task.progressBox.height, false, false, true, 1000000000);
		},
		draw: function() {
			if (un(draw.task.progressBox.canvas)) draw.task.progressBox.create();
			var ctx = draw.task.progressBox.canvas.ctx;
			ctx.clear();
			
			var progress = draw.task.getProgress();
			var percentage = progress.marksMax === 0 ? 0 : (Math.round(100*progress.marks/progress.marksMax));
			var marks = progress.marks + ' / ' + progress.marksMax + ' (' + percentage + '%)';
			var attempted = progress.attempted + ' of ' + progress.questions.length;
			var date = draw.task.dateToString(new Date(),false,false);
			var textLines = [
				'<<font:Arial>><<color:#000>>Name:  <<font:segoePrint>><<color:#00F>>'+userInfo.name+'',
				'<<font:Arial>><<color:#000>>Date:  <<font:segoePrint>><<color:#00F>>'+date,
				'<<font:Arial>><<color:#000>>Questions attempted:  <<font:segoePrint>><<color:#00F>>'+attempted,
				'<<font:Arial>><<color:#000>>Marks:  <<font:segoePrint>><<color:#00F>>'+marks
			];
			textLines = [textLines.join(br)];
			text({ctx:ctx,rect:[1.5,1.5,draw.task.progressBox.width-3,draw.task.progressBox.height-3],text:textLines,align:[0,0],fontSize:32,lineSpacingFactor:2,box:{type:'loose',color:'#CFF',borderColor:'#000',borderWidth:3,radius:10}})
			
		},
		show: function() {
			draw.task.progressBox.draw();
			showObj(draw.task.progressBox.canvas);
			addListener(draw.task.progressBox.canvas,draw.task.progressBox.hide);
		},
		hide: function() {
			if (un(draw.task.progressBox.canvas)) return;
			hideObj(draw.task.progressBox.canvas);
			removeListener(draw.task.progressBox.canvas,draw.task.progressBox.hide);
		}
	}*/

	stringify: function(obj) {
		var circular = [];
		var str = stringify(obj);
		return str;
		
		function stringify(obj) {
			var str = "";
			if (circular.indexOf(obj) > -1) return "null";
			if (obj instanceof Array) {
				for (var i = 0; i < obj.length; i++) {
					if (typeof obj[i] == 'object') {
						circular.push(obj);
						break;
					}
				}
				str += "[";
				for (var i = 0; i < obj.length; i++) {
					if (obj.hasOwnProperty(i) !== true) continue;
					str += stringify(obj[i])+',';
				}
				if (str.slice(-1) == ',') str = str.slice(0,-1);
				str += "]";
			} else if (typeof obj == 'object') {
				for (var key in obj) {
					if (typeof obj[key] == 'object') {
						circular.push(obj);
						break;
					}
				}
				str += "{";
				for (var key in obj) {
					if (['borderButtons','border','tightBorder','ctx','qBox',"cursorData","textLoc","cursorPos","cursorMap","allMap","canvas","ctx","cursorCanvas","cursorctx","startText","startRichText","startTags","stringJS","currBackColor","preText","postText"].includes(key) || key.indexOf('_') == 0 || obj.hasOwnProperty(key) == false) continue;
					if (key === 'selected' && (typeof obj[key] === 'boolean' || un(obj[key]))) continue;
					var value = stringify(obj[key]);
					if (value == '') continue;
					str += '"'+key+'":'+value+",";
				}
				if (str.slice(-1) == ',') str = str.slice(0,-1);
				str += "}";
			} else if (typeof obj == 'function') {
				str += '"' + obj.toString().replace(/\r?\n|\r|\t/g,"").replace(/"/g, '\\\\\\"') + '"';
			} else if (typeof obj == 'number') {
				if (!isNaN(obj)) {
					str += String(Number(obj.toFixed(3)));
				}
			} else if (typeof obj == 'string') {
				var escapeString = replaceAll(obj,"\"","\\\"");
				str += '"'+escapeString+'"';
			} else if (typeof obj == 'boolean') {
				str += obj;
			} else {
				if (typeof obj !== 'undefined') console.log('draw.task.stringify type not included: ',typeof obj,obj);
			}
			return str;
		}	
	},
	parse: function(str) {
		return JSON.parse(str/*,function(key,value) {
			return revive(value);
			function revive(value) {
				if (value instanceof Array) {
					for (var i = 0; i < value.length; i++) {
						value[i] = revive(value[i]);
					}
				} else if (typeof value === 'object') {
					for (var key in value) {
						if (value.hasOwnProperty(key) === false) continue;
						value[key] = revive(value[key]);
					}
				} else if (typeof value === 'string' && value.indexOf('function(') === 0) {
					try {
						value = value.replace(/\\"/g, '"');
						console.log('----')
						console.log(value);
						eval('var func = '+value+';');
						console.log(func);
						return func;
					} catch(error) {
						return value;
					}
				}
				return value;
			}
		}*/);
	},
	revive: function(obj) {
		var circular = [];
		return revive(obj);
		
		function revive(value,depth) {
			if (un(depth)) depth = 0;	
			if (circular.indexOf(value) > -1) return undefined;
			if (value instanceof Array) {
				for (var i = 0; i < value.length; i++) {
					if (typeof value[i] === 'object') {
						circular.push(value);
						break;
					}
				}
				for (var i = 0; i < value.length; i++) {
					value[i] = draw.task.revive(value[i],depth+1);
				}
			} else if (typeof value === 'object') {
				for (var key in value) {
					if (typeof value[key] == 'object') {
						circular.push(value);
						break;
					}
				}
				for (var key in value) {
					value[key] = draw.task.revive(value[key],depth+1);
				}
			} else if (typeof value === 'string' && value.indexOf('function(') === 0) {
				try {
					value = value.replace(/\\"/g, '"');
					eval('value = '+value);
				} catch(error) {}
			} else {
				try {
					var parsed = JSON.parse(value);
					if (typeof parsed === 'object') value = parsed;
				} catch(error) {};
			}
			return value;
		}
	},
	reviveFunctions: function(obj) {
		var circular = [];
		return reviveFunctions(obj);
		
		function reviveFunctions(value) {
			if (circular.indexOf(value) > -1) return value;
			if (value instanceof Array) {
				for (var i = 0; i < value.length; i++) {
					if (typeof value[i] === 'object') {
						circular.push(value);
						break;
					}
				}
				for (var i = 0; i < value.length; i++) {
					value[i] = reviveFunctions(value[i]);
				}
			} else if (typeof value === 'object') {
				for (var key in value) {
					if (typeof value[key] == 'object') {
						circular.push(value);
						break;
					}
				}
				for (var key in value) {
					value[key] = reviveFunctions(value[key]);
				}
			} else if (typeof value === 'string' && value.indexOf('function') === 0) {
				try {
					value = value.replace(/\\"/g, '"');
					eval('value = '+value);
				} catch(error) {}
			}
			return value;
		}
	}
}

draw.taskOverview = {
	modes:['Answers by Question', 'Answers by Pupil', 'Answer Marks Table'],
	modeIndex:0,
	modeChangeClick:function(e) {
		var index = e.target.modeIndex;
		if ([0,1,2].indexOf(index) === -1) return;
		if (draw.taskOverview.modeIndex === index) return;
		draw.taskOverview.setMode(index);
	},
	setMode:function(index) {
		draw.taskOverview.modeIndex = index;
		var div = draw.taskOverview.div;
		div.innerHTML = '';
		for (var i = 0; i < 3; i++) {
			draw.taskOverview.modeButtons[i].style.backgroundColor = i === index ? '#F9F' : '#FFF';
		}
		div.appendChild(draw.taskOverview.titleDiv);
		if (draw.taskOverview.modeIndex == 0) {
			draw.taskOverview.buildQuestionsView();
			div.appendChild(draw.taskOverview._questionsTitleDiv);
			div.appendChild(draw.taskOverview._questionsDiv);
		} else if (draw.taskOverview.modeIndex == 1) {
			draw.taskOverview.buildPupilsView();
			div.appendChild(draw.taskOverview._pupilsTitleDiv);
			div.appendChild(draw.taskOverview._pupilsDiv);
		} else if (draw.taskOverview.modeIndex == 2) {
			draw.taskOverview.buildTable();
			div.appendChild(draw.taskOverview._tableDiv);	
		}
		draw.taskOverview.update();
	},
	buttonClick: function() {
		if (!un(draw.currCursor) && !un(draw.currCursor.pupilIndex)) {
			draw.taskOverview.show(undefined,draw.currCursor.pupilIndex);
			return;
		} else if (!un(draw.currCursor) && !un(draw.currCursor.obj)) {
			draw.taskOverview.show(draw.currCursor.obj.qNum-1);
			return;
		}
		draw.taskOverview.show();
	},
	show: function (questionIndex,pupilIndex) {
		if (typeof questionIndex === 'number') {
			draw.taskOverview.modeIndex = 0;
			draw.taskOverview._questionIndex = questionIndex;
		} else if (typeof pupilIndex === 'number') {
			draw.taskOverview.modeIndex = 1;
			draw.taskOverview._pupilIndex = pupilIndex;
		} else if (un(draw.taskOverview.modeIndex)) {
			draw.taskOverview.modeIndex = 0;
		}
		document.getElementById('body-div').style.display = 'none';
		if (draw.task.getMode() !== 'taskoverview') draw.taskOverview._prevMode = draw.task.getMode();
		draw.task.setMode('taskoverview');
		if (un(draw.taskOverview.div)) {
			draw.taskOverview.create();
		}
		draw.taskOverview.setMode(draw.taskOverview.modeIndex);
		document.body.appendChild(draw.taskOverview.div);
		draw.taskOverview.update();
	},
	hide: function () {
		document.body.removeChild(draw.taskOverview.div);
		document.getElementById('body-div').style.display = 'block';
		var prevMode = draw.taskOverview._prevMode === 'Review Pupil' ? 'Review Pupil' : 'Review Class';
		draw.task.setMode(prevMode);
	},
	create: function () {		
		var faScript = document.createElement('script');
		faScript.setAttribute('src','https://kit.fontawesome.com/c16b6819ae.js');
		faScript.setAttribute('crossorigin','anonymous');
		document.head.appendChild(faScript);
			
		this.div = document.createElement('div');
		style(this.div,{position:'absolute',left:'0',top:'0',height:'100%',width:'100%',margin:'0',zIndex:'10000',backgroundColor:'#FC9',border:'solid #000 2px',overflow:'none',fontFamily:'Arial',display:'flex',flexDirection:'column'});
		
		this.titleDiv = document.createElement('div');
		style(this.titleDiv,{height:'35px',width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',backgroundColor:'#EEE',borderBottom:'2px solid black',flex:'0 0 35px'});
		this.div.appendChild(this.titleDiv);
		
		this.logoTitle = document.createElement('div');
		style(this.logoTitle,{marginLeft:'5px'});
		this.titleDiv.appendChild(this.logoTitle);
		
		this.logo = document.createElement('img');
		this.logo.src = '/i2/images/logoSmall.PNG';
		style(this.logo,{height:'25px',verticalAlign:'middle',backgroundColor:'#FFF',border:'1.5px solid black',padding:'0.5px',borderRadius:'7px',marginRight:'5px'});
		this.logoTitle.appendChild(this.logo);

		this.title = document.createElement('div');
		style(this.title,{textAlign:'left',fontWeight:'bold',display:'inline-block'});
		this.logoTitle.appendChild(this.title);
		this.title.innerHTML = 'Task Overview';
		
		this.modeSelect = document.createElement('div');
		style(this.modeSelect,{display:'inline-block'});
		this.titleDiv.appendChild(this.modeSelect);
		
		this.modeButtons = [];
		
		this.modeButtons[0] = document.createElement('div');
		style(this.modeButtons[0],{display:'inline-block',backgroundColor:'#F9F',cursor:'pointer',padding:'2px 7px',border:'1.5px solid black',borderRadius:'5px 0 0 5px'});
		this.modeButtons[0].innerHTML = this.modes[0];
		this.modeButtons[0].modeIndex = 0;
		//this.modeButtons[0].onclick = this.modeChangeClick;
		addListener(this.modeButtons[0],this.modeChangeClick);
		this.modeButtons[0].allowDefault = true;
		this.modeSelect.appendChild(this.modeButtons[0]);
		
		this.modeButtons[1] = document.createElement('div');
		style(this.modeButtons[1],{display:'inline-block',backgroundColor:'#FFF',cursor:'pointer',padding:'2px 7px',marginLeft:'-1.5px',border:'1.5px solid black'});
		this.modeButtons[1].innerHTML = this.modes[1];
		this.modeButtons[1].modeIndex = 1;
		//this.modeButtons[1].onclick = this.modeChangeClick;
		addListener(this.modeButtons[1],this.modeChangeClick);
		this.modeButtons[1].allowDefault = true;
		this.modeSelect.appendChild(this.modeButtons[1]);
		
		this.modeButtons[2] = document.createElement('div');
		style(this.modeButtons[2],{display:'inline-block',backgroundColor:'#FFF',cursor:'pointer',padding:'2px 7px',marginLeft:'-1.5px',border:'1.5px solid black',borderRadius:'0 5px 5px 0'});
		this.modeButtons[2].innerHTML = this.modes[2];
		this.modeButtons[2].modeIndex = 2;
		//this.modeButtons[2].onclick = this.modeChangeClick;
		addListener(this.modeButtons[2],this.modeChangeClick);
		this.modeButtons[2].allowDefault = true;
		this.modeSelect.appendChild(this.modeButtons[2]);
		
		this.refreshButton = document.createElement('div');
		style(this.refreshButton,{padding:'2px 5px',backgroundColor:'#F9F',cursor:'pointer',borderRadius:'5px',border:'1.5px solid black',display:'inline-block'});
		this.refreshButton.allowDefault = true;
		this.refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
		this.titleDiv.appendChild(this.refreshButton);
		/*this.refreshButton.onclick = function(e) {
			draw.task.refreshClassTaskData();
		}*/
		addListener(this.refreshButton,function(e) {
			draw.task.refreshClassTaskData();
		});
		this.refreshButton.allowDefault = true;
				
		this.close = document.createElement('div');
		style(this.close,{padding:'2px 5px',border:'1.5px solid black',display:'inline-block',borderRadius:'5px',backgroundColor:'#FCC',cursor:'pointer',marginRight:'5px'});
		this.titleDiv.appendChild(draw.taskOverview.close);
		this.close.innerHTML = '<i class="fas fa-times"></i>  Close';
		//this.close.onclick = draw.taskOverview.hide;
		addListener(this.close,draw.taskOverview.hide);
		this.close.allowDefault = true;
		
		function style(obj,styles) {
			for (var key in styles) {
				obj.style[key] = styles[key];
			}
		}
	},
	update:function() {	
		if (this.modeIndex == 0) {
			this.updateQuestionsView();
		} else if (this.modeIndex == 1) {
			this.updatePupilsView();
		} else if (this.modeIndex == 2) {
			this.updateTable();
		}
	},
	questionChangeClick:function(e) {
		var index = e.target.questionIndex;
		for (var i = 0; i < draw.taskOverview._questionSelectButtons.length; i++) {
			draw.taskOverview._questionSelectButtons[i].style.backgroundColor = i === index ? '#99F' : '#FFF';
		}
		if (draw.taskOverview._questionIndex === index) return;
		draw.taskOverview._questionIndex = index;
		draw.taskOverview.update();
	},
	buildQuestionsView: function() {
		if (!un(this._questionsDiv)) return;
		if (un(this._questionIndex)) this._questionIndex = 0;
		
		this._questionsTitleDiv = document.createElement('div');
		style(this._questionsTitleDiv,{width:'100%',display:'flex',justifyContent:'space-evenly',alignItems:'center',padding:'5px 0',flex:'0 0 35px'});
		
		var questionSelectDiv = document.createElement('div');
		this._questionsTitleDiv.appendChild(questionSelectDiv);		
		
		var label = document.createElement('span');
		label.style.marginRight = '5px';
		questionSelectDiv.appendChild(label);
		label.innerHTML = 'Question:';
		
		this._questionSelectButtons = [];
		for (var q = 0; q < draw.task.questions.length; q++) {
			var button = document.createElement('div');
			style(button,{display:'inline-block',backgroundColor:'#FFF',cursor:'pointer',padding:'2px 7px',marginLeft:'-1.5px',border:'1.5px solid black'});
			button.style.borderRadius = q === 0 ? '5px 0 0 5px' : q === draw.task.questions.length-1 ? '0 5px 5px 0' : '';
			button.style.backgroundColor = q === this._questionIndex ? '#99F' : '#FFF';
			button.innerHTML = String(q+1);
			button.questionIndex = q;
			//button.onclick = this.questionChangeClick;
			addListener(button,this.questionChangeClick);
			button.allowDefault = true;
			questionSelectDiv.appendChild(button);
			
			this._questionSelectButtons.push(button);
		}		
		
		var sizeDiv = document.createElement('div');
		this._questionsTitleDiv.appendChild(sizeDiv);
		
		var i = document.createElement('i');
		i.style.marginRight = '5px';
		i.style.color = '#00F';
		i.className = "fas fa-search-plus";
		sizeDiv.appendChild(i);
		
		this.questionsSizeSlider = document.createElement('input');
		this.questionsSizeSlider.style.verticalAlign = 'middle';
		this.questionsSizeSlider.allowDefault = true;
		this.questionsSizeSlider.type = 'range';
		this.questionsSizeSlider.min = '10';
		this.questionsSizeSlider.max = '48';
		this.questionsSizeSlider.value = '24';
		sizeDiv.appendChild(this.questionsSizeSlider);
		this.questionsSizeSlider.oninput = function(e) {
			draw.taskOverview.update();
		}
		
		var allPupilsDiv = document.createElement('div');
		style(allPupilsDiv,{color:'#009'});
		this._questionsTitleDiv.appendChild(allPupilsDiv);
		
		this._allPupilsCheckbox = document.createElement('input');
		this._allPupilsCheckbox.type = 'checkbox';
		this._allPupilsCheckbox.checked = '1';
		this._allPupilsCheckbox.style.marginRight = '5px';
		this._allPupilsCheckbox.oninput = function(e) {
			draw.taskOverview.update();
		}
		allPupilsDiv.appendChild(this._allPupilsCheckbox);
		
		var label = document.createElement('span');
		style(label,{fontStyle:'italic',cursor:'pointer'});
		allPupilsDiv.appendChild(label);
		label.innerHTML = 'Include blanks';
		/*label.onclick = function(e) {
			draw.taskOverview._allPupilsCheckbox.checked = !draw.taskOverview._allPupilsCheckbox.checked;
			draw.taskOverview.update();
		}*/
		addListener(label,function(e) {
			draw.taskOverview._allPupilsCheckbox.checked = !draw.taskOverview._allPupilsCheckbox.checked;
			draw.taskOverview.update();
		});
		label.allowDefault = true;
		
		var firstLastDiv = document.createElement('div');
		style(firstLastDiv,{display:'inline-block'});
		this._questionsTitleDiv.appendChild(firstLastDiv);
		
		var firstDiv = document.createElement('div');
		style(firstDiv,{padding:'2px 5px',border:'1.5px solid black',display:'inline-block',borderRadius:'5px 0 0 5px',backgroundColor:'#FFF',cursor:'pointer'});
		firstDiv.innerHTML = 'First answers';
		/*firstDiv.onclick = function(e) {
			var logsByPupil = draw.task.class.questionData[draw.taskOverview._questionIndex].parts[0].logsByPupil;
			for (var l = 0; l < logsByPupil.length; l++) {
				if (logsByPupil[l].logs.length === 0) continue;
				logsByPupil[l]._answerLogID = 0;
			}
			draw.taskOverview.update();
		}*/
		addListener(firstDiv,function(e) {
			var logsByPupil = draw.task.class.questionData[draw.taskOverview._questionIndex].parts[0].logsByPupil;
			for (var l = 0; l < logsByPupil.length; l++) {
				if (logsByPupil[l].logs.length === 0) continue;
				logsByPupil[l]._answerLogID = 0;
			}
			draw.taskOverview.update();
		});
		firstDiv.allowDefault = true;
		firstLastDiv.appendChild(firstDiv);
		
		var lastDiv = document.createElement('div');
		style(lastDiv,{padding:'2px 5px',border:'1.5px solid black',display:'inline-block',borderRadius:'0 5px 5px 0',backgroundColor:'#FFF',cursor:'pointer',marginLeft:'-1.5px'});
		lastDiv.innerHTML = 'Last answers';
		/*lastDiv.onclick = function(e) {
			var logsByPupil = draw.task.class.questionData[draw.taskOverview._questionIndex].parts[0].logsByPupil;
			for (var l = 0; l < logsByPupil.length; l++) {
				delete logsByPupil[l]._answerLogID;
			}
			draw.taskOverview.update();
		}*/
		addListener(lastDiv,function(e) {
			var logsByPupil = draw.task.class.questionData[draw.taskOverview._questionIndex].parts[0].logsByPupil;
			for (var l = 0; l < logsByPupil.length; l++) {
				delete logsByPupil[l]._answerLogID;
			}
			draw.taskOverview.update();
		});
		firstLastDiv.appendChild(lastDiv);
		
		this._questionsDiv = document.createElement('div');
		style(this._questionsDiv,{overflowY:'auto',flex:'1 1 auto'});
		
		function style(obj,styles) {
			for (var key in styles) {
				obj.style[key] = styles[key];
			}
		}
	},
	updateQuestionsView: function() {
		this._questionsDiv.innerHTML = '';
		var questionIndex = this._questionIndex;
		var questionObj = draw.task.questions[questionIndex].obj;
		var width = (questionObj.width > 600 ? 2*this.questionsSizeSlider.value : this.questionsSizeSlider.value) + '%';
		var allPupilsMode = this._allPupilsCheckbox.checked == true;		
		var logsByPupil = draw.task.class.questionData[questionIndex].parts[0].logsByPupil;
		for (var i = 0; i < logsByPupil.length; i++) {
			var logByPupil = logsByPupil[i];
			if (allPupilsMode === false && logByPupil.logs.length === 0) continue;
			logByPupil._questionObj = questionObj;
			logByPupil._width = width;
			draw.taskOverview.updatePupilQuestionDiv(logByPupil,'byQuestion');
			this._questionsDiv.appendChild(logByPupil._div);
		}
	},
	buildPupilsView: function() {
		if (!un(this._pupilsDiv)) return;
		if (un(this._pupilIndex)) this._pupilIndex = 0;
		
		this._pupilsDiv = document.createElement('div');
		
		this._pupilsTitleDiv = document.createElement('div');
		style(this._pupilsTitleDiv,{width:'100%',display:'flex',justifyContent:'space-evenly',alignItems:'center',padding:'5px 0',flex:'0 0 35px'});
		
		var pupilsSelectDiv = document.createElement('div');
		style(pupilsSelectDiv,{display:'flex',alignItems:'stretch',fontSize:'x-large'});
		this._pupilsTitleDiv.appendChild(pupilsSelectDiv);
		
		this.prevPupil = document.createElement('i');
		this.prevPupil.className = "fas fa-caret-left";
		style(this.prevPupil,{padding:'0 5px',backgroundColor:'#DDD',cursor:'pointer',border:'1px solid black',borderRadius:'2px'});
		this.prevPupil.allowDefault = true;
		pupilsSelectDiv.appendChild(this.prevPupil);
		/*this.prevPupil.onclick = function(e) {
			if (draw.taskOverview.pupilSelect.value > 0) {
				draw.taskOverview.pupilSelect.value--;
				draw.taskOverview.update();
				draw.taskOverview.prevPupil.style.backgroundColor = draw.taskOverview.pupilSelect.value == 0 ? '#DDD' : '#99F';
				draw.taskOverview.nextPupil.style.backgroundColor = draw.taskOverview.pupilSelect.value == draw.task.class.pupilData.length - 1 ? '#DDD' : '#99F';
			}
		}*/
		addListener(this.prevPupil,this.prevPupilClick);
		//this.prevPupil.allowDefault = true;
		
		this.pupilSelect = document.createElement('select');
		style(this.pupilSelect,{fontSize:'large',fontWeight:'bold',color:'#00F'});
		this.pupilSelect.allowDefault = true;
		pupilsSelectDiv.appendChild(this.pupilSelect);
		for (var q = 0; q < draw.task.class.pupilData.length; q++) {
			var pupil = draw.task.class.pupilData[q];
			var opt = document.createElement('option');
			opt.value = q;
			opt.innerHTML = pupil.pupilName;
			this.pupilSelect.appendChild(opt);
		}
		this.pupilSelect.value = this._pupilIndex;
		this.pupilSelect.onchange = function(e) {
			draw.taskOverview.update();
			draw.taskOverview.prevPupil.style.backgroundColor = draw.taskOverview.pupilSelect.value == 0 ? '#DDD' : '#99F';
			draw.taskOverview.nextPupil.style.backgroundColor = draw.taskOverview.pupilSelect.value == draw.task.class.pupilData.length - 1 ? '#DDD' : '#99F';
		}
		
		this.nextPupil = document.createElement('i');
		this.nextPupil.className = "fas fa-caret-right";
		style(this.nextPupil,{padding:'0 5px',backgroundColor:'#99F',cursor:'pointer',border:'1px solid black',borderRadius:'2px'});
		this.nextPupil.allowDefault = true;
		pupilsSelectDiv.appendChild(this.nextPupil);
		/*this.nextPupil.onclick = function(e) {
			if (draw.taskOverview.pupilSelect.value < draw.task.class.pupilData.length - 1) {
				draw.taskOverview.pupilSelect.value++;
				draw.taskOverview.update();
				draw.taskOverview.prevPupil.style.backgroundColor = draw.taskOverview.pupilSelect.value == 0 ? '#DDD' : '#99F';
				draw.taskOverview.nextPupil.style.backgroundColor = draw.taskOverview.pupilSelect.value == draw.task.class.pupilData.length - 1 ? '#DDD' : '#99F';
			}
		}*/
		addListener(this.nextPupil,this.nextPupilClick);
		//this.nextPupil.allowDefault = true;
		
		this.pupilProgressDiv = document.createElement('div');
		style(this.pupilProgressDiv,{width:'20%',display:'inline-block',color:'#00F',fontWeight:'bold'});
		this._pupilsTitleDiv.appendChild(this.pupilProgressDiv);
		
		var sizeDiv = document.createElement('div');
		this._pupilsTitleDiv.appendChild(sizeDiv);
		
		var i = document.createElement('i');
		i.style.marginRight = '5px';
		i.style.color = '#00F';
		i.className = "fas fa-search-plus";
		sizeDiv.appendChild(i);
		
		this.pupilsSizeSlider = document.createElement('input');
		this.pupilsSizeSlider.style.verticalAlign = 'middle';
		this.pupilsSizeSlider.allowDefault = true;
		this.pupilsSizeSlider.type = 'range';
		this.pupilsSizeSlider.min = '10';
		this.pupilsSizeSlider.max = '48';
		this.pupilsSizeSlider.value = '24';
		sizeDiv.appendChild(this.pupilsSizeSlider);
		this.pupilsSizeSlider.oninput = function(e) {
			draw.taskOverview.update();
		}
		
		this._pupilsDiv = document.createElement('div');
		style(this._pupilsDiv,{overflowY:'auto',flex:'1 1 auto'});
		
		function style(obj,styles) {
			for (var key in styles) {
				obj.style[key] = styles[key];
			}
		}
	},
	prevPupilClick: function(e) {
		e.stopPropagation();
		e.preventDefault();
		if (draw.taskOverview.pupilSelect.value > 0) {
			draw.taskOverview.pupilSelect.value--;
			draw.taskOverview.update();
			draw.taskOverview.prevPupil.style.backgroundColor = draw.taskOverview.pupilSelect.value == 0 ? '#DDD' : '#99F';
			draw.taskOverview.nextPupil.style.backgroundColor = draw.taskOverview.pupilSelect.value == draw.task.class.pupilData.length - 1 ? '#DDD' : '#99F';
		}
	},
	nextPupilClick: function(e) {
		e.stopPropagation();
		e.preventDefault();
		if (draw.taskOverview.pupilSelect.value < draw.task.class.pupilData.length - 1) {
			draw.taskOverview.pupilSelect.value++;
			draw.taskOverview.update();
			draw.taskOverview.prevPupil.style.backgroundColor = draw.taskOverview.pupilSelect.value == 0 ? '#DDD' : '#99F';
			draw.taskOverview.nextPupil.style.backgroundColor = draw.taskOverview.pupilSelect.value == draw.task.class.pupilData.length - 1 ? '#DDD' : '#99F';
		}
	},
	updatePupilsView: function() {
		this._pupilsDiv.innerHTML = '';

		var pupilIndex = this.pupilSelect.value;
		var pupil = draw.task.class.pupilData[pupilIndex];
		var pupilMarks = 0;		
		
		for (var q = 0; q < draw.task.class.questionData.length; q++) {
			var questionObj = draw.task.questions[q].obj;
			var width = (questionObj.width > 600 ? 2*this.pupilsSizeSlider.value : this.pupilsSizeSlider.value) + '%';
			var logByPupil = draw.task.class.questionData[q].parts[0].logsByPupil[pupilIndex];
			logByPupil._questionObj = questionObj;
			logByPupil._width = width;
			draw.taskOverview.updatePupilQuestionDiv(logByPupil,'byPupil');
			this._pupilsDiv.appendChild(logByPupil._div);
			if (logByPupil.logs.length > 0) pupilMarks += logByPupil.logs[logByPupil.logs.length-1].marks;
		}

		var maxMarks = draw.task.getProgress().marksMax;
		this.pupilProgressDiv.innerHTML = 'Marks: '+pupilMarks+'/'+maxMarks+' ('+Math.round(100*pupilMarks/maxMarks)+'%)';
	},
	buildTable: function() {
		if (!un(this._tableDiv)) return;
		var tdStyle = {border:'1px solid black',textAlign:'center',minWidth:'25px',padding:'0 5px'};
		this._tableDiv = document.createElement('div');
		style(this._tableDiv,{overflowY:'auto',flex:'1 1 auto',paddingBottom:'15px'});
		
		var table = document.createElement('table');
		this._tableDiv.appendChild(table);
		style(table,{borderCollapse:'collapse',border:'1px solid #000',backgroundColor:'#EEE',margin:'10px auto 0 auto'});
		
		var tr0 = document.createElement('tr');
		table.appendChild(tr0);
		style(tr0,{backgroundColor:'#BBB',fontWeight:'bold'});
		tr0.style.position = 'sticky';
		tr0.style.top = '0'
		
		var tr1 = document.createElement('tr');
		table.appendChild(tr1);
		style(tr1,{backgroundColor:'#BBB',fontStyle:'italic'});
		
		var td0 = document.createElement('td');
		td0.innerHTML = 'Question';
		style(td0,tdStyle);
		td0.style.position = 'sticky';
		td0.style.top = '0';
		td0.style.backgroundColor = '#BBB';
		td0.style.zIndex = '100';
		tr0.appendChild(td0);
		
		var td1 = document.createElement('td');
		td1.innerHTML = 'Marks';
		style(td1,tdStyle);
		tr1.appendChild(td1);
		
		var maxMarks = 0;
		
		for (var q = 0; q < draw.task.class.questionData.length; q++) {
			var questionData = draw.task.class.questionData[q];
			var td0 = document.createElement('td');
			td0.innerHTML = String(q+1);
			style(td0,tdStyle);
			td0.style.position = 'sticky';
			td0.style.top = '0';
			td0.style.backgroundColor = '#BBB';
			td0.style.zIndex = '100';
			tr0.appendChild(td0);
			
			var td1 = document.createElement('td');
			td1.innerHTML = String(questionData.marksMax);
			maxMarks += questionData.marksMax;
			style(td1,tdStyle);
			tr1.appendChild(td1);
		}
		
		this._maxMarks = maxMarks;
		
		var td0 = document.createElement('td');
		td0.innerHTML = 'Total';
		td0.colSpan = 2;
		style(td0,tdStyle);
		td0.style.position = 'sticky';
		td0.style.top = '0';
		td0.style.backgroundColor = '#BBB';
		td0.style.zIndex = '100';
		tr0.appendChild(td0);
		
		var td1 = document.createElement('td');
		td1.colSpan = 2;
		style(td1,tdStyle);
		tr1.appendChild(td1);
		
		this._pupilCells = [];
		
		for (var i = 0; i < draw.task.class.pupilData.length; i++) {
			var pupilData = draw.task.class.pupilData[i];
			
			var tr = document.createElement('tr');
			table.appendChild(tr);
		
			var td = document.createElement('td');
			td.innerHTML = pupilData.pupilName;
			style(td,tdStyle);
			td.style.backgroundColor = i%2 === 0 ? '#EEE' : '#CCF';
			tr.appendChild(td);
			
			this._pupilCells[i] = [];
						
			for (var q = 0; q < draw.task.class.questionData.length; q++) {
				var logByPupil = draw.task.class.questionData[q].parts[0].logsByPupil[i];
				var questionData = draw.task.class.questionData[q];
				var td = document.createElement('td');
				style(td,tdStyle);
				tr.appendChild(td);
				this._pupilCells[i].push(td);
			}
			
			var td = document.createElement('td');
			style(td,tdStyle);
			td.style.backgroundColor = i%2 === 0 ? '#EEE' : '#CCF';
			tr.appendChild(td);
			this._pupilCells[i].push(td);
			
			var td = document.createElement('td');
			style(td,tdStyle);
			td.style.backgroundColor = i%2 === 0 ? '#EEE' : '#CCF';
			tr.appendChild(td);
			this._pupilCells[i].push(td);
		}
		
		this._tableDivInfo = document.createElement('div');
		style(this._tableDivInfo,{display:'none',margin:'5px auto 0 auto',textAlign:'center'});
		
		var div1 = document.createElement('div');
		style(div1,{width:'10px',height:'10px',backgroundColor:'#00F',color:'#FFF',fontSize:'8px',verticalAlign:'middle',fontWeight:'bold',borderRadius:'4px',marginRight:'10px',display:'inline-block'});
		div1.innerHTML = '2';
		this._tableDivInfo.appendChild(div1);
		
		var div2 = document.createElement('div2');
		style(div2,{display:'inline-block',fontStyle:'italic'});
		div2.innerHTML = 'Blue circles indicate number of attempts.';
		this._tableDivInfo.appendChild(div2);
		
		this._tableDiv.appendChild(this._tableDivInfo);
		
		
		function style(obj,styles) {
			for (var key in styles) {
				obj.style[key] = styles[key];
			}
		}
	},
	updateTable: function() {
		this._tableDivInfo.style.display = 'none';
		for (var i = 0; i < draw.task.class.pupilData.length; i++) {
			var pupilData = draw.task.class.pupilData[i];
			var pupilMarks = 0;
			
			for (var q = 0; q < draw.task.class.questionData.length; q++) {
				var logByPupil = draw.task.class.questionData[q].parts[0].logsByPupil[i];
				var questionData = draw.task.class.questionData[q];
				var td = this._pupilCells[i][q];
				td.innerHTML = '';
				if (logByPupil.logs.length === 0) {
					td.innerHTML = '-';
					td.style.backgroundColor = '#FFF';
				} else {
					var marks = logByPupil.logs[logByPupil.logs.length-1].marks;
					td.style.backgroundColor = marks === 0 ? '#F99' : marks === questionData.marksMax ? '#9F9' : '#FF9';
					td.innerHTML = String(marks);
					pupilMarks += marks;
					if (logByPupil.logs.length > 1) {
						td.style.position = 'relative';
						var div = document.createElement('div');
						style(div,{position:'absolute',top:'0',right:'0',width:'10px',height:'10px',backgroundColor:'#00F',color:'#FFF',fontSize:
						'8px',verticalAlign:'middle',fontWeight:'bold',borderRadius:'4px'});
						div.innerHTML = String(logByPupil.logs.length);
						td.appendChild(div);
						this._tableDivInfo.style.display = 'block';
					}
				}
			}
			
			var td = this._pupilCells[i][this._pupilCells[i].length-2];
			td.innerHTML = pupilMarks+'/'+this._maxMarks;
			td.style.backgroundColor = i%2 === 0 ? '#EEE' : '#CCF';
			
			var td = this._pupilCells[i][this._pupilCells[i].length-1];
			td.innerHTML = Math.round(100*pupilMarks/this._maxMarks)+'%';
			td.style.backgroundColor = i%2 === 0 ? '#EEE' : '#CCF';
		}
		function style(obj,styles) {
			for (var key in styles) {
				obj.style[key] = styles[key];
			}
		}
	},
	updatePupilQuestionDiv:function(logByPupil,mode) {
		if (un(logByPupil._div)) {
			logByPupil._div = document.createElement('div');
			logByPupil._div.style.display = 'inline-block';
			logByPupil._div.style.border = '1px solid #000';
			logByPupil._div.style.backgroundColor = '#FFF';
			logByPupil._div.style.padding = '2px';
			logByPupil._div.style.verticalAlign = 'top';
			logByPupil._div.style.position = 'relative';
			
			logByPupil._answerLogInfo = document.createElement('div');
			logByPupil._div.appendChild(logByPupil._answerLogInfo);
			style(logByPupil._answerLogInfo,{textAlign:'left',color:'#00F',fontFamily:'Arial',fontSize:'small',fontWeight:'bold'});
			
			logByPupil._canvasDiv = document.createElement('div');
			logByPupil._div.appendChild(logByPupil._canvasDiv);
		}
		
		if (un(logByPupil._answerLogID)) {
			logByPupil._answerLogID = logByPupil.logs.length > 0 ? logByPupil.logs.length-1 : -1;
		}
		var answerLogID = logByPupil._answerLogID; 
		if (answerLogID > -1) {
			var answerLog = logByPupil.logs[answerLogID];
			if (un(answerLog._canvas)) {
				answerLog._canvas = document.createElement('canvas');
				answerLog._canvas.width = logByPupil._questionObj.width;
				answerLog._canvas.height = logByPupil._questionObj.height;
				answerLog._canvas.style.width = '100%';
				draw.taskOverview.drawQuestionToCanvas(answerLog._canvas,logByPupil._questionObj,[0,0],answerLog);
				if (un(answerLog.saveData) && un(answerLog.saveInputData) && un(answerLog.saveInputsData) && answerLog._timestamp < 1593734400000) {
					text({ctx:answerLog._canvas.getContext('2d'),rect:[answerLog._canvas.width/2-150,answerLog._canvas.height/2-40,300,80],color:'#F00',text:['Sorry, this answer'+br+'is not available.'],align:[0,0],fontSize:28,box:{type:'loose',borderWidth:1,borderColor:'#F00',color:'#FFF'}});
				}  
			}
			logByPupil._canvasDiv.innerHTML = '';
			logByPupil._canvasDiv.appendChild(answerLog._canvas);
		} else {
			if (un(logByPupil._canvas)) {
				logByPupil._canvas = document.createElement('canvas');
				logByPupil._canvas.width = logByPupil._questionObj.width;
				logByPupil._canvas.height = logByPupil._questionObj.height;
				logByPupil._canvas.style.width = '100%';
				logByPupil._canvas.style.opacity = '0.5';
				draw.taskOverview.drawQuestionToCanvas(logByPupil._canvas,logByPupil._questionObj,[0,0]);
			}
			logByPupil._canvasDiv.innerHTML = '';
			logByPupil._canvasDiv.appendChild(logByPupil._canvas);
		}
		logByPupil._div.style.width = logByPupil._width;
		if (mode === 'byQuestion') {
			logByPupil._answerLogInfo.style.display = 'block';
			logByPupil._answerLogInfo.innerHTML = logByPupil.pupil.pupilName;
		} else if (mode === 'byPupil') {
			logByPupil._answerLogInfo.style.display = 'none';
			/*if (answerLogID > -1) {
				logByPupil._answerLogInfo.innerHTML = logByPupil.logs[answerLogID].timestamp;
			} else {
				logByPupil._answerLogInfo.innerHTML = '';
			}*/
		}
		if (logByPupil.logs.length > 1 && answerLogID > -1) {
			if (un(logByPupil._attemptNav)) {
				logByPupil._attemptNav = document.createElement('span');
				style(logByPupil._attemptNav,{position:'absolute',right:'0',top:'0',border:'1px solid black',padding:'0',backgroundColor:'#6FF',fontWeight:'normal'});
				
				logByPupil._attemptNavPrev = document.createElement('span');
				style(logByPupil._attemptNavPrev,{padding:'0 3px',cursor:'pointer'});
				logByPupil._attemptNavPrev.innerHTML = '<';
				logByPupil._attemptNavPrev.allowDefault = true;
				logByPupil._attemptNavPrev.logByPupil = logByPupil;
				logByPupil._attemptNav.appendChild(logByPupil._attemptNavPrev);
				logByPupil._attemptNavPrev.onclick = draw.taskOverview.pupilQuestionAttemptPrevClick;
				
				logByPupil._attemptNavSpan = document.createElement('span');
				style(logByPupil._attemptNavSpan,{color:'#000',margin:'0 5px'});
				logByPupil._attemptNav.appendChild(logByPupil._attemptNavSpan);
				
				logByPupil._attemptNavNext = document.createElement('span');
				style(logByPupil._attemptNavNext,{padding:'0 3px',cursor:'pointer'});
				logByPupil._attemptNavNext.innerHTML = '>';
				logByPupil._attemptNavNext.allowDefault = true;
				logByPupil._attemptNavNext.logByPupil = logByPupil;
				logByPupil._attemptNav.appendChild(logByPupil._attemptNavNext);
				logByPupil._attemptNavNext.onclick = draw.taskOverview.pupilQuestionAttemptNextClick;
			}
			logByPupil._div.appendChild(logByPupil._attemptNav);
			logByPupil._attemptNavSpan.innerHTML = (answerLogID+1)+' of '+logByPupil.logs.length;
			logByPupil._attemptNavPrev.style.color = logByPupil._answerLogID === 0 ? '#AAA' : '#000';
			logByPupil._attemptNavNext.style.color = logByPupil._answerLogID === logByPupil.logs.length-1 ? '#AAA' : '#000';
		}
		function style(obj,styles) {
			for (var key in styles) {
				obj.style[key] = styles[key];
			}
		}
	},
	drawQuestionToCanvas:function(canvas,questionObj,pos,answer) {
		if (un(pos)) pos = [0,0];
		var ctx = canvas.getContext('2d');
		if (typeof answer === 'object') {
			draw.taskQuestion.reset(questionObj);
			draw.taskQuestion.restoreQuestionAnswerState(questionObj,answer);
		}
		var paths = [questionObj._path];
		for (var p = 0; p < questionObj._questionPaths.length; p++) {
			if (getPathVis(questionObj._questionPaths[p]) === false) continue;
			paths.push(questionObj._questionPaths[p]);
		}
		var dx = pos[0]-questionObj.left;
		var dy = pos[1]-questionObj.top;
		
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (un(draw[obj.type])) continue;
				if (typeof draw[obj.type].drawUnderlay === 'function') {
					ctx.setTransform(1,0,0,1,0,0);
					ctx.translate(dx,dy);
					draw[obj.type].drawUnderlay(ctx,obj,path);
				}
			}
		}
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (un(draw[obj.type])) continue;
				if (typeof draw[obj.type].draw === 'function') {
					ctx.setTransform(1,0,0,1,0,0);
					ctx.translate(dx,dy);
					draw[obj.type].draw(ctx,obj,path);
				}
			}
		}
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (un(draw[obj.type])) continue;
				if (typeof draw[obj.type].drawOverlay === 'function') {
					ctx.setTransform(1,0,0,1,0,0);
					ctx.translate(dx,dy);
					draw[obj.type].drawOverlay(ctx,obj,path);
				}
			}
		}
		
		ctx.setTransform(1,0,0,1,0,0);
		
		if (typeof answer === 'object') {
			draw.taskQuestion.reset(questionObj);
		}
	},
	pupilQuestionAttemptPrevClick:function(e) {
		var logByPupil = e.target.logByPupil;
		if (logByPupil._answerLogID > 0) {
			logByPupil._answerLogID--;
			draw.taskOverview.updatePupilQuestionDiv(logByPupil);
		}
	},
	pupilQuestionAttemptNextClick:function(e) {
		var logByPupil = e.target.logByPupil;
		if (logByPupil._answerLogID < logByPupil.logs.length-1) {
			logByPupil._answerLogID++;
			draw.taskOverview.updatePupilQuestionDiv(logByPupil);
		}
	},
	disableRefreshButton:function(timeInSeconds) {
		if (un(draw.taskOverview.refreshButton)) return;
		var button = draw.taskOverview.refreshButton;
		button.style.cursor = 'default';
		button.style.color = '#999';
		button.style.fontStyle = 'italic';
		button.style.border = '1.5px solid #999';
		delete button.onclick;
		if (typeof timeInSeconds === 'number') {
			setTimeout(draw.taskOverview.enableRefreshButton,timeInSeconds*1000);
		}
	},
	enableRefreshButton:function() {
		if (un(draw.taskOverview.refreshButton)) return;
		var button = draw.taskOverview.refreshButton;
		button.style.cursor = 'pointer';
		button.style.color = '#000';
		button.style.fontStyle = '';
		button.style.border = '1.5px solid #000';
		button.onclick = function(e) {
			draw.task.refreshClassTaskData();
		}
	}
	
}

draw.taskPage = {
	add: function() {
		var top = 30;
		if (pIndex === 0) {
			var obj = {
				type:'taskTitle',
				rect:[30,30,1140,380]
			};
			draw.path.push({obj:[obj]});
			updateBorder(draw.path.last());
			top += 410;
		}
		drawCanvasPaths();
		/*var questionCount = pIndex === 0 ? 1 : 8;
		draw.taskEdit.getNewQuestionID(function(questionIDs) {
			var taskQuestions = [];
			for (var r = 0; r < questionCount/2; r++) {
				for (var c = 0; c < 2; c++) {
					var left = [30,615][c];
					var obj = {
						type:'taskQuestion',
						cells:[[{
							text:['']
						}]],
						align:[-1,-1],
						marginLeft:60,
						marginRight:60,
						widths:[555],
						heights:[330],
						left:left,
						top:top,
						width:555,
						height:330,
						qNum:2*r+c+1,
						minCellPadding:10,
						questionID:questionIDs.shift(),
						partMarksMax:[1],
						algPadding:4,
						_partMarks:[0],
						_pageNum:pIndex
					};
					draw.path.push({obj:[obj]});
					taskQuestions.push(obj);
					var input = {
						type: 'text2',
						text: [''],
						align: [0, 0],
						fontSize: 28,
						rect: [left+555-60-20-250, top+330-20-80, 250, 80],
						box: {
							type: 'loose',
							color: '#FFC',
							borderColor: '#000',
							borderWidth: 2
						},
						algPadding:4,
						fracScale:0.7,
						interact:{
							type:'text'
						}
					};
					draw.path.push({obj:[input]});
				}
				top += 410;
			}
			for (var i = 0; i < taskQuestions.length; i++) {
				var obj = taskQuestions[i];
				draw.taskEdit.updateQuestionData(obj);
			}
			draw.taskEdit.sortTaskQuestions();
			drawCanvasPaths();
			if (getResourceType() !== 'task') {
				file.resources[resourceIndex].name = 'Task';
				file.resources[resourceIndex].type = 'task';
				showResource(resourceIndex);
			}
		},questionCount);*/
	},
	drawButton: function (ctx, size) {
		text({ctx:ctx,rect:[0.2*size,0.2*size,0.6*size,0.6*size],align:[0,0],fontSize:0.5*size,text:['P'],box:{type:'loose',borderColor:'#000'}});
	}
}

draw.taskTitle = {
	draggable:false,
	groupable:false,
	selectable:false,
	add:function() {
		deselectAllPaths();
		var obj = {
			type:'taskTitle',
			rect:[30,30,1140,380]
		};
		draw.path.push({obj:[obj],selected:true});
		updateBorder(draw.path.last());
		drawCanvasPaths();
	},
	drawUnderlay:function(ctx,obj,path) {
		var r1 = [obj.rect[0], obj.rect[1], obj.rect[2]/2-15, obj.rect[3]];
		var r2 = [obj.rect[0]+obj.rect[2]/2+15, obj.rect[1], obj.rect[2]/2-15, obj.rect[3]];
				
		roundedRect2(ctx, r1[0],r1[1],r1[2],r1[3], 10, 3, '#666', '#CFF');
		roundedRect2(ctx, r2[0],r2[1],r2[2],r2[3], 10, 3, '#666', '#CFF');
	},
	draw:function(ctx,obj,path) {
		obj._cursorPos = [];
		var mode = draw.task.getMode();
		taskTrayCanvas.ctx.clear();
		
		if (mode === 'print') {
			var r1 = [obj.rect[0], obj.rect[1], obj.rect[2]/2-15, obj.rect[3]];
			var r2 = [obj.rect[0]+obj.rect[2]/2+15, obj.rect[1], obj.rect[2]/2-15, obj.rect[3]];
			roundedRect2(ctx, r1[0],r1[1],r1[2],r1[3], 10, 3, '#666', '#FFF');
			roundedRect2(ctx, r2[0],r2[1],r2[2],r2[3], 10, 3, '#666', '#FFF');
		}
		
		var r1 = [obj.rect[0], obj.rect[1], obj.rect[2]/2-15, obj.rect[3]];
		var r2 = [obj.rect[0]+obj.rect[2]/2+15, obj.rect[1], obj.rect[2]/2-15, obj.rect[3]];
		
		var titleRect = [r1[0]+20,r1[1]+108,r1[2]-40,140];
		if (!un(draw.task.taskData) && !un(draw.task.taskData.taskName)) {
			text({ctx:ctx,rect:titleRect,align:[0,0],text:[draw.task.taskData.taskName],color:'#00F',fontSize:42,box:{type:'none',borderColor:'#00F',borderWidth:1,color:'none'}});
		}
		if (draw.mode === 'edit') {
			if (un(draw.task.taskData) || un(draw.task.taskData.taskName)) {
				text({ctx:ctx,rect:titleRect,align:[0,0],text:['< task taskName >'],color:'#00F',fontSize:42,italic:true});
			}
			obj._cursorPos.push({shape:'rect',dims:titleRect,cursor:draw.cursors.pointer,func:draw.taskTitle.setTaskTitle,obj:obj});
		}
		
		var subtitleRect = [r1[0]+20,r1[1]+260,r1[2]-40,100];
		if (!un(draw.task.taskData) && !un(draw.task.taskData.subtitle)) {
			text({ctx:ctx,rect:subtitleRect,align:[0,0],text:[draw.task.taskData.subtitle],color:'#00F',italic:true,fontSize:32,box:{type:'none',borderColor:'#00F',borderWidth:1,color:'none'}});
		}
		if (draw.mode === 'edit') {
			if (un(draw.task.taskData) || un(draw.task.taskData.subtitle)) {
				text({ctx:ctx,rect:subtitleRect,align:[0,0],text:['< subtitle >'],color:'#00F',fontSize:32,italic:true});
			}
			obj._cursorPos.push({shape:'rect',dims:subtitleRect,cursor:draw.cursors.pointer,func:draw.taskTitle.setTaskSubtitle,obj:obj});
		}
		
		var myProfileRect = [50,52.5,195,45];
		var logoRect = [55,55,1.14*40,40];
		if (userInfo.user === 'pupil') {
			text({ctx:ctx,rect:myProfileRect,text:['My Profile'],align:[1,0],font:'Hobo',fontSize:32,box:{type:'loose',color:'#FFF',borderColor:'#000',radius:10,borderWidth:2}});
			draw.image.draw(ctx,{type:"image",src:'images/logoSmall.PNG',left:logoRect[0],top:logoRect[1],width:logoRect[2],height:logoRect[3]},{});
			obj._cursorPos.push({shape:'rect',dims:myProfileRect,cursor:draw.cursors.pointer,func:function() {
				window.open('/myProfile.php','_blank');
			}});
		}
		
		var calcRect = [485,60,60,60];
		if (!un(draw.task.taskData) && draw.task.taskData.calc === 0) {
			draw.noncalc.draw(ctx,{type:"noncalc",rect:calcRect,lineWidth:10,lineColor:"#060"},{});
		} else if (!un(draw.task.taskData) && draw.task.taskData.calc === 1) {
			draw.calc.draw(ctx,{type:"calc",rect:calcRect,lineWidth:10,lineColor:"#060"},{});
		}
		if (draw.mode === 'edit') {
			if (un(draw.task.taskData) || (draw.task.taskData.calc !== 0 && draw.task.taskData.calc !== 1)) {
				text({ctx:ctx,rect:calcRect,align:[0,0],text:['?'],fontSize:42,box:{type:'loose',color:'none',borderColor:'#000',borderWidth:2,borderRadius:5}});
			}
			obj._cursorPos.push({shape:'rect',dims:calcRect,cursor:draw.cursors.pointer,func:draw.taskTitle.setTaskCalc,obj:obj});
		}
		
		var padding = 40;	
		var y = obj.rect[1];
						
		if (draw.mode === 'interact' && mode !== 'print' && (userInfo.user === 'teacher' || userInfo.user === 'super')) {
			//var options = [['Do Task'],['Set Task'],['Review Class'],['Review Pupil'],['Answers']];
			var options = [['Do Task'],['Set Task'],['Review Class'],['Review Pupil']];
			var value = options.map(function(x) {return x[0];}).indexOf(mode);
			var toggleButton = {
				type: 'toggleButton',
				rect:[obj.rect[0]+30,obj.rect[1]-40/2,obj.rect[2]-60,40],
				options:options,
				value: value,
				lineWidth:2,
				radius:30,
				fontSize:26,
				color:'#F00',
			};
			draw.toggleButton.draw(ctx,toggleButton);
			for (var i = 0; i < toggleButton._cursorPos.length; i++) {
				toggleButton._cursorPos[i].value = options[i][0];
				toggleButton._cursorPos[i].func = draw.task.setMode;
				obj._cursorPos.push(toggleButton._cursorPos[i]);
			}
		}
		
		if (['pupil','Do Task'].indexOf(mode) > -1) {
			var progress = draw.task.getProgress();
			var percentage = progress.marksMax === 0 ? 0 : (Math.round(100*progress.marks/progress.marksMax));
			var marks = progress.marksMax === 0 ? '...' : progress.marks + ' / ' + progress.marksMax + ' (' + percentage + '%)';
			var attempted = progress.marksMax === 0 ? '...' : progress.attempted + ' of ' + progress.questions.length;
			var date = draw.task.dateToString(new Date(),false,false);
			var taskDuration = draw.task.getSessionTime().taskDurationInMinutes;
			var taskDurationText = progress.marksMax === 0 ? '...' : taskDuration > 59 ? '60+ mins' : taskDuration + ' minute' + (taskDuration === 1 ? '' : 's');
			var textLines = [
				'<<font:Arial>><<color:#000>>Name:  <<font:segoePrint>><<color:#00F>>'+userInfo.name+'',
				'<<font:Arial>><<color:#000>>Date:  <<font:segoePrint>><<color:#00F>>'+date,
				'<<font:Arial>><<color:#000>>Questions attempted:  <<font:segoePrint>><<color:#00F>>'+attempted,
				'<<font:Arial>><<color:#000>>Marks:  <<font:segoePrint>><<color:#00F>>'+marks,
				'<<font:Arial>><<color:#000>>Time spent:  <<font:segoePrint>><<color:#00F>>'+taskDurationText
			];
			if (mode === 'pupil' && !un(draw.task.pupil) && !un(draw.task.pupil.taskData) && draw.task.pupil.taskData.testMode === 1) {
				textLines.push('<<font:Arial>><<fontSize:20>><<color:#600>><<bold:true>>This is a test: you have 1 attempt at each question.');
			}
			textLines = [textLines.join(br)];
			//var rect2 = [r2[0]+0.1*r2[2],r2[1],r2[2]-2*0.1*r2[2],r2[3]];
			//var align = [-1,0];
			var rect2 = [r2[0]+0.05*r2[2],r2[1],r2[2]-2*0.05*r2[2],r2[3]];
			var align = [0,0];
			text({ctx:ctx,rect:rect2,text:textLines,align:align,fontSize:28,lineSpacingFactor:1.8});	
			
			/*var printRect = [r2[0]+r2[2]-50,r2[1]+r2[3]-50,40,40]
			draw.printButton.draw(ctx,{
				type:'printButton',
				rect:[r2[0]+r2[2]-50,r2[1]+r2[3]-50,40,40],
				color: '#000',
				fillColor: '#FF0',
				lineWidth:3,
				radius:5
			}); 
			obj._cursorPos.push({
				shape: 'rect',
				dims: printRect,
				cursor: draw.cursors.pointer,
				func: draw.task.exportPDF,
				obj: obj,
				pathNum: draw.path.indexOf(path)
			});*/
		} else if (mode === 'print') {
			var textLines = ['<<font:Arial>><<color:#000>>Name: ........................................'+br+br+'Date: ........................................'];
			var rect2 = [r2[0]+0.05*r2[2],r2[1],r2[2]-2*0.05*r2[2],r2[3]];
			var align = [0,0];
			text({ctx:ctx,rect:rect2,text:textLines,align:align,fontSize:28,lineSpacingFactor:1.8});	
		}
				
		if (!un(draw.taskTitle._classDropMenu)) {
			draw.taskTitle._classDropMenu.visible = ['Set Task','Review Class','Review Pupil','taskoverview'].indexOf(mode) > -1;
			draw.taskTitle._classDropMenu._draw();
		}
		if (!un(draw.taskTitle._pupilDropMenu)) {
			draw.taskTitle._pupilDropMenu.visible = 'Review Pupil' === mode;
			draw.taskTitle._pupilDropMenu._draw();
		}
		if (!un(draw.taskTitle._setDateMenu)) {
			draw.taskTitle._setDateMenu.visible = 'Set Task' === mode;
			draw.taskTitle._setDateMenu._draw();
		}
		if (!un(draw.taskTitle._dueDateMenu)) {
			draw.taskTitle._dueDateMenu.visible = 'Set Task' === mode;
			draw.taskTitle._dueDateMenu._draw();
		}
		if (!un(draw.taskTitle._classResultsBox)) {
			draw.taskTitle._classResultsBox.visible = 'Review Class' === mode && draw.taskTitle._expandClassResults === true;
			draw.taskTitle._classResultsBox._draw();
		}

		if (['Set Task','Review Class','Review Pupil','taskoverview'].indexOf(mode) > -1) {
			if (!un(draw.task.classes)) {
				if (draw.task.classes.length === 0) {
					text({ctx:ctx,rect:[r2[0]+r2[2]/2-440/2,r2[1]+r2[3]/3-90/2,440,90],text:["You don't have any classes yet."+br+"Click here to create a class."],align:[0,0],fontSize:28,box:{type:'loose',color:'#FFC',borderWidth:3,borderColor:'#000',radius:10}});
					obj._cursorPos.push({
						shape: 'rect',
						dims: [r2[0]+r2[2]/2-440/2,r2[1]+r2[3]/3-90/2,440,90],
						cursor: draw.cursors.pointer,
						func: function() {
							window.open('/myProfile.php','_blank');
						}
					});
				} else {
					var x = r2[0]+120;
					var y = r2[1]+45;
					text({ctx:ctx,rect:[x-100,y,80,40],text:['Class:'],align:[1,0],fontSize:28});
					var classDropMenu = draw.task.getClassDropDown([x,y,400,40]);
					classDropMenu._draw();
					
					var class1 = draw.task.classes[draw.task.classIndex];
					if (!un(class1)) {					
						if (!un(class1.data)) {
							if (mode === 'Set Task') {
								var settable = typeof draw.task.taskID === 'number' && draw.task.taskID > -1;
								if (settable === true) {
									if (class1.data.classSetTasks.length === 0) {
										if (un(class1._setDate)) {
											class1._setDate = new Date();
											class1._dueDate = draw.task.addDays(class1._setDate,7);
										}
										y += 60;
										text({ctx:ctx,rect:[x-100,y,80,40],text:['Set:'],align:[1,0],fontSize:28});
										
										var setDateDropMenu = draw.task.getSetDateDropDown([x,y,400,40]);
										setDateDropMenu._draw();
										
										y += 60;
										text({ctx:ctx,rect:[x-100,y,80,40],text:['Due:'],align:[1,0],fontSize:28});
										
										var dueDateDropMenu = draw.task.getDueDateDropDown([x,y,400,40]);
										dueDateDropMenu._draw();
										
										y += 80;
										text({ctx:ctx,rect:[r2[0]+r2[2]/2-170-20,y,170,40],text:['Set as <<bold:true>>task'],align:[0,0],fontSize:24,box:{type:'loose',color:'#99F',borderColor:'#000',borderWidth:3,radius:15}});
										obj._cursorPos.push({
											shape: 'rect',
											dims: [r2[0]+r2[2]/2-170-20,y,170,40],
											cursor: draw.cursors.pointer,
											func: draw.task.setTaskForClass,
											testMode:0,
											obj: obj,
											pathNum: draw.path.indexOf(path)
										});
										
										text({ctx:ctx,rect:[r2[0]+r2[2]/2+20,y,170,40],text:['Set as <<bold:true>>test'],align:[0,0],fontSize:24,box:{type:'loose',color:'#F99',borderColor:'#000',borderWidth:3,radius:15}});
										obj._cursorPos.push({
											shape: 'rect',
											dims: [r2[0]+r2[2]/2+20,y,170,40],
											cursor: draw.cursors.pointer,
											func: draw.task.setTaskForClass,
											testMode:1,
											obj: obj,
											pathNum: draw.path.indexOf(path)
										});
										
										y += 50;
										text({ctx:ctx,rect:[r2[0]+r2[2]/2-170-20,y,170,40],text:['Pupils are able to retry questions'],align:[0,-1],fontSize:20,italic:true});

										text({ctx:ctx,rect:[r2[0]+r2[2]/2+20,y,170,40],text:['Pupils have 1 attempt at each question'],align:[0,-1],fontSize:20,italic:true});

										
									} else {
										if (!un(draw.taskTitle._setDateMenu)) {
											draw.taskTitle._setDateMenu.visible = false;
											draw.taskTitle._setDateMenu._draw();
										}
										if (!un(draw.taskTitle._dueDateMenu)) {
											draw.taskTitle._dueDateMenu.visible = false;
											draw.taskTitle._dueDateMenu._draw();
										}
										
										var setTask = class1.data.classSetTasks[0];
										class1._setDate = new Date(setTask.dateSet);
										class1._dueDate = new Date(setTask.dateDue);
										
										y += 60;
										var txt = 'Task has been set';
										var color = '#060';
										if (setTask.testMode === 1) {
											txt = 'Task has been set as a test';
											color = '#600';
										}
										text({ctx:ctx,rect:[r2[0],y,r2[2],40],text:[txt],color:color,align:[0,0],fontSize:28,bold:true,box:{type:'none',borderWidth:3,borderColor:'#000',color:'#FFF'}});
										
										y += 60;
										text({ctx:ctx,rect:[x-100,y,80,40],text:['Set:'],align:[1,0],fontSize:28});
										text({ctx:ctx,rect:[x,y,320,40],text:[draw.task.dateToString(class1._setDate)],align:[-1,0],fontSize:28,box:{type:'none',borderWidth:3,borderColor:'#000',color:'#FFF'}});
																		
										y += 45;
										text({ctx:ctx,rect:[x-100,y,80,40],text:['Due:'],align:[1,0],fontSize:28});
										text({ctx:ctx,rect:[x,y,320,40],text:[draw.task.dateToString(class1._dueDate)],align:[-1,0],fontSize:28,box:{type:'none',borderWidth:3,borderColor:'#000',color:'#FFF'}});
										
										/*	text({ctx:ctx,rect:[x+200,y,140,40],text:['Un-set'],align:[0,0],fontSize:24,box:{type:'loose',color:'#F9F',borderColor:'#000',borderWidth:3,radius:15}});
										obj._cursorPos.push({
											shape: 'rect',
											dims: [x+200,y,140,40],
											cursor: draw.cursors.pointer,
											func: draw.task.unsetTaskForClass,
											obj: obj,
											pathNum: draw.path.indexOf(path)
										});
										*/
									}
								}
							} else if (mode === 'Review Class') {
								
							} else if (mode === 'taskoverview') {
								draw.taskOverview.show();
								
							} else if (mode === 'Review Pupil') {							
								y += 55;
								text({ctx:ctx,rect:[x-100,y,80,40],text:['Pupil:'],align:[1,0],fontSize:28});
								var pupilDropMenu = draw.task.getPupilDropDown([x,y,400,40]);
								if (pupilDropMenu.classIndex !== draw.task.classIndex) draw.taskTitle._pupilDropMenu._update();
								draw.taskTitle._pupilDropMenu._draw();
								
								y += 40;							
								if (!un(draw.task.pupil)) {														
									var pupilTask = draw.task.pupil.pupilTask;
									var rect2 = [r2[0]+0.05*r2[2],y,r2[2]-2*0.05*r2[2],r2[1]+r2[3]-y];
									if (un(pupilTask) || pupilTask.status === 0) {
										text({ctx:ctx,rect:[rect2[0],rect2[1],rect2[2],rect2[3]-50],text:['Task not started'],font:'segoePrint',color:'#00F',align:[0,0],fontSize:32});
										
									} else {
										var progress = draw.task.getProgress();
										var percentage = progress.marksMax === 0 ? 0 : (Math.round(100*progress.marks/progress.marksMax));
										var marks = progress.marks + ' / ' + progress.marksMax + ' (' + percentage + '%)';
										var attempted = progress.attempted + ' of ' + progress.questions.length;
										var date = draw.task.dateToString(new Date(),false,false);
										var taskDuration = pupilTask.totalTime;
										var taskDurationText = taskDuration > 59 ? '60+ mins' : taskDuration + ' minute' + (taskDuration === 1 ? '' : 's');

										var textLines = [
											'<<font:Arial>><<color:#000>>Questions attempted:  <<font:segoePrint>><<color:#00F>>'+attempted,
											'<<font:Arial>><<color:#000>>Marks:  <<font:segoePrint>><<color:#00F>>'+marks,
											'<<font:Arial>><<color:#000>>Time spent:  <<font:segoePrint>><<color:#00F>>'+taskDurationText
										];
										
										if (typeof pupilTask.lastAttempt === 'string' && pupilTask.lastAttempt !== '0000-00-00') {
											//console.log(pupilTask.lastAttempt,Date.parse(pupilTask.lastAttempt));
											date = new Date(Date.parse(pupilTask.lastAttempt));
											var lastAttemptText = draw.task.dateToString(date);
											textLines.push('<<font:Arial>><<color:#000>>Last attempted:  <<font:segoePrint>><<color:#00F>>'+lastAttemptText);
										}
										
										textLines = [textLines.join(br)];								
										text({ctx:ctx,rect:[rect2[0],rect2[1],rect2[2],rect2[3]-50],text:textLines,align:[0,0],fontSize:26,lineSpacingFactor:1.6})		
										
										
										/*
										var progress = draw.task.getProgress();
										
										rect = [r2[0]+padding,y,r2[2]-2*padding,80-2*padding];
										var attempted = progress.attempted + ' of ' + progress.questions.length;
										text({ctx:ctx,rect:rect,text:['Questions attempted:  <<font:segoePrint>><<color:#00F>>'+attempted],align:[0,0],fontSize:32});
										
										y += 50;
										rect = [r2[0]+padding,y,r2[2]-2*padding,80-2*padding];
										var marks = progress.marks + ' / ' + progress.marksMax + ' (' + (Math.round(100*progress.marks/progress.marksMax)) + '%)';
										text({ctx:ctx,rect:rect,text:['Marks:  <<font:segoePrint>><<color:#00F>>'+marks],align:[0,0],fontSize:32});*/
									}
								
									var rect3 = [rect2[0]+rect2[2]/2-260/2,rect2[1]+rect2[3]-53,260,36];
									text({ctx:ctx,text:['Task Overview'],rect:rect3,align:[0,0],fontSize:20,bold:true,color:'#930',box:{type:'loose',color:'#FC9',borderColor:'#930',borderWidth:3,radius:10}});
									var pupilIndex = !un(draw.task.class) && !un(draw.task.class.pupilIndex) && draw.task.class.pupilIndex > -1 ? draw.task.class.pupilIndex : 0;
									obj._cursorPos.push({
										shape: 'rect',
										dims: rect3,
										cursor: draw.cursors.pointer,
										func: draw.taskOverview.buttonClick,
										pathNum: draw.path.indexOf(path),
										pupilIndex:pupilIndex
									});
								}								
							}
						} else if (class1.taskDataRequested !== true) {
							class1.taskDataRequested = true;
							draw.task.getClassTaskData(class1.classID);
						}
					}
				}
			} else if (draw.task.classesRequested !== true) {
				draw.task.getClasses();
			}
		}
		if (mode === 'Answers') {
			text({ctx:ctx,rect:r2,text:['Answers'],font:'segoePrint',color:'#C00',align:[0,0],fontSize:40});
		}
		
		
	},
	drawOverlay:function(ctx,obj,path) {
		var mode = draw.task.getMode();
		if (mode === 'Review Class') {
			if (un(draw.task.class) || un(draw.task.class.pupilsByStatus)) return;		
			var pupilsByStatus = draw.task.class.pupilsByStatus;
			var testMode = 0;
			if (!un(draw.task.class.data) && !un(draw.task.class.data.classSetTasks) && !un(draw.task.class.data.classSetTasks[0])) testMode = draw.task.class.data.classSetTasks[0].testMode;
			
			if (draw.taskTitle._expandClassResults !== true) {
				var x = obj.rect[0]+obj.rect[2]/2+15;
				var y = obj.rect[1]+100;
				var w = (obj.rect[2]/2-30-45)/2;
				var class1 = draw.task.class;
				if (class1.data.classSetTasks.length === 0) {
					
					y += 50;
					text({ctx:ctx,rect:[x+10,y,w-20,40],text:['Task has'+br+'not been set'],color:'#900',align:[0,-1],fontSize:24,bold:true});
					
					y += 100;
					text({ctx:ctx,rect:[x+w/2-60,y,120,36],text:['Set task'],align:[0,0],fontSize:20,bold:true,box:{type:'loose',color:'#F9F',borderColor:'#000',borderWidth:3,radius:10}});
					obj._cursorPos.push({
						shape: 'rect',
						dims: [x+w/2-60,y,120,36],
						cursor: draw.cursors.pointer,
						func: function() {
							draw.task.setMode('Set Task');
						},
						obj: obj,
						pathNum: draw.path.indexOf(path)
					});
					
					/*if (un(class1._setDate)) {
						class1._setDate = new Date();
						class1._dueDate = draw.task.addDays(class1._setDate,7);
					}
					text({ctx:ctx,rect:[x+10,y,80,40],text:['Set:'],align:[1,0],fontSize:28});
					var setDateDropMenu = draw.task.getSetDateDropDown();
					setDateDropMenu.rect = [x+100,y,w-120,40];
					setDateDropMenu._path.vis = true;
					
					y += 60;
					text({ctx:ctx,rect:[x+10,y,80,40],text:['Due:'],align:[1,0],fontSize:28});
					var dueDateDropMenu = draw.task.getDueDateDropDown();
					dueDateDropMenu.rect = [x+100,y,w-120,40];
					dueDateDropMenu._path.vis = true;
					
					y += 60;
					text({ctx:ctx,rect:[x+w/2-60,y,120,40],text:['Set task'],align:[0,0],fontSize:28,box:{type:'loose',color:'#F9F',borderColor:'#000',borderWidth:3,radius:15}});
					obj._cursorPos.push({
						shape: 'rect',
						dims: [x+w/2-60,y,120,40],
						cursor: draw.cursors.pointer,
						func: draw.task.setTaskForClass,
						obj: obj,
						pathNum: draw.path.indexOf(path)
					});*/
				} else {
					var setTask = class1.data.classSetTasks[0];
					class1._setDate = new Date(setTask.dateSet);
					class1._dueDate = new Date(setTask.dateDue);
					
					//text({ctx:ctx,rect:[x+10,y,w,40],text:['Task has been set'],color:'#060',align:[0,0],fontSize:24,bold:true,box:{type:'none',borderWidth:3,borderColor:'#000',color:'#FFF'}});
					
					y += 30;
					
					if (testMode === 1) {
						text({ctx:ctx,rect:[x,y,obj.rect[2]/4-40,30],text:['Task has been'+br+'set as a test'],align:[0,0],fontSize:24,color:'#600',bold:true});
						y += 60;
					}
					
					text({ctx:ctx,rect:[x+10,y,80,40],text:['Set:'],align:[1,0],fontSize:24});
					text({ctx:ctx,rect:[x+100,y,320,40],text:[draw.task.dateToString(class1._setDate)],align:[-1,0],fontSize:24,box:{type:'none',borderWidth:3,borderColor:'#000',color:'#FFF'}});
													
					y += 45;
					text({ctx:ctx,rect:[x+10,y,80,40],text:['Due:'],align:[1,0],fontSize:24});
					text({ctx:ctx,rect:[x+100,y,320,40],text:[draw.task.dateToString(class1._dueDate)],align:[-1,0],fontSize:24,box:{type:'none',borderWidth:3,borderColor:'#000',color:'#FFF'}});
					
					y += 60;
					text({ctx:ctx,rect:[x+w/2-60,y,120,36],text:['Un-set'],align:[0,0],fontSize:20,bold:true,box:{type:'loose',color:'#F9F',borderColor:'#000',borderWidth:3,radius:10}});
					obj._cursorPos.push({
						shape: 'rect',
						dims: [x+w/2-60,y,120,36],
						cursor: draw.cursors.pointer,
						func: draw.task.unsetTaskForClass,
						obj: obj,
						pathNum: draw.path.indexOf(path)
					});
					
				}
				
				var y = obj.rect[1]+100;
				var w = (obj.rect[2]/2-30-45)/2;
				var x = obj.rect[0]+obj.rect[2]-30-w;
				
				var txt = testMode === 1 ? ['Not Started','Started','','Finished'] : ['Not Started','< 100%','','Completed'];
				var fillColor = ['#FCC','#FFC','#FFC','#CFC'];
				var data = [];
				for (var s = 0; s < 4; s++) {
					if (s === 2) continue;
					if (s === 1) {
						var freq = pupilsByStatus[1].length+pupilsByStatus[2].length === 0 ? '' : String(pupilsByStatus[1].length+pupilsByStatus[2].length);
					} else {
						var freq = pupilsByStatus[s].length === 0 ? '' : String(pupilsByStatus[s].length);
					}
					data.push({text:txt[s],fillColor:fillColor[s],freq:freq});
				}
				
				var dataTable = {
					type:'dataTable',
					left: x,
					top: y+15,
					rowHeight:35,
					fontSize:20,
					padding:10,
					titleRowColor:'#CCF',
					columns:[{
						title:['<<bold:true>>Pupil Progress'],
						text:function(rowData) {
							return [rowData.text];
						}
					},{
						title:['<<bold:true>>Freq.'],
						text:function(rowData) {
							return [String(rowData.freq)];
						}
					}],
					data:data,
					rowColor:function(rowData) {
						return rowData.fillColor;
					}
				}
				draw.dataTable.calcSize(dataTable);
				draw.dataTable.draw(ctx,dataTable,{});
				
				var rect = [dataTable.left+dataTable._width/2-260/2,dataTable.top+dataTable._height+20,260,36];
				text({ctx:ctx,text:['Task Overview'],rect:rect,align:[0,0],fontSize:20,bold:true,color:'#930',box:{type:'loose',color:'#FC9',borderColor:'#930',borderWidth:3,radius:10}});
				obj._cursorPos.push({
					shape: 'rect',
					dims: rect,
					cursor: draw.cursors.pointer,
					func: draw.taskOverview.buttonClick,
					pathNum: draw.path.indexOf(path)
				});
				
				var rect = [dataTable.left+dataTable._width/2-260/2,dataTable.top+dataTable._height+70,260,36];
				text({ctx:ctx,text:['Class Progress Overview'],rect:rect,align:[0,0],fontSize:20,bold:true,color:'#00F',box:{type:'loose',color:'#CCF',borderColor:'#00F',borderWidth:3,radius:10}});
				obj._cursorPos.push({
					shape: 'rect',
					dims: rect,
					cursor: draw.cursors.pointer,
					func: draw.taskTitle.toggleExpandClassResults,
					obj: obj,
					pathNum: draw.path.indexOf(path)
				});
			} else {
				
				var x = obj.rect[0]-5;
				var y = obj.rect[1]+100;
				var w = obj.rect[2]+10;
				
				var box = draw.taskTitle.getClassResultsBox(x,y,w);
				box.visible = true;
				box._draw();
						
				/*
				var x = obj.rect[0]-5;
				var y = obj.rect[1]+100;
				var w = obj.rect[2]+10;
				
				var heights = [];
				for (var s = 0; s < pupilsByStatus.length; s++) {
					if (s === 2 && testMode === 1) {
						heights[2] = 0;
						continue;
					}
					if (s === 1 && testMode === 1) {
						var count =  pupilsByStatus[1].length + pupilsByStatus[2].length;
						heights[s] = count === 0 ? 40 : 40+7+count*32;
					} else {
						heights[s] = pupilsByStatus[s].length === 0 ? 40 : 40+7+pupilsByStatus[s].length*32;
					}
				}
				var h = 55 + Math.max(heights[0]+55-32+heights[1],heights[2],heights[3])+10;
				
				var color = testMode === 1 ? '#EFF' : '#FFD';
				text({ctx:ctx,text:[''],rect:[x,y,w,h],align:[-1,-1],box:{type:'loose',color:color,borderColor:'#000',borderWidth:3,radius:10}});
				
				var txt = 'Class Progress';
				if (testMode === 1) txt += ' (test)';
				text({ctx:ctx,text:[txt],rect:[x+20,y+8,w,36],align:[-1,0],bold:true,fontSize:20});
				
				text({ctx:ctx,text:['Close ✖'],rect:[x+w-110,y+8,100,36],align:[0,0],fontSize:20,bold:true,color:'#F00',box:{type:'loose',color:'#FFF',borderColor:'#F00',borderWidth:3,radius:10}});
				obj._cursorPos.push({
					shape: 'rect',
					dims: [x+w-110,y+8,100,36],
					cursor: draw.cursors.pointer,
					func: draw.taskTitle.toggleExpandClassResults,
					obj: obj,
					pathNum: draw.path.indexOf(path)
				});
				
				if (draw.task.class.data.classSetTasks.length === 0) {
					var txt = 'Task has not been set';
					var color = '#900';
				} else {
					var setDate = draw.task.dateToString(draw.task.class._setDate);
					var dueDate = draw.task.dateToString(draw.task.class._dueDate);
					var txt = 'Set: '+setDate+'   ●   '+'Due: '+dueDate;
					var color = '#060';
				}
				text({ctx:ctx,rect:[x,y+8,w,36],text:[txt],color:color,align:[0,0],fontSize:20,bold:true});	
				
				var y2 = y+55;
				var x2 = x+20;
				var w2 = (w-80)/3
				
				for (var s = 0; s < 4 ; s++) {
					if (testMode === 1) {
						if (s === 2) continue;
						var txt = ['Not Started','Started','','Finished'][s];
						var fillColor = ['#FCC','#FFC','#FFC','#CFC'][s];
					} else {
						var txt = ['Not Started','< 20 mins','< 100%','Completed'][s];
						var fillColor = ['#FCC','#FCC','#FFC','#CFC'][s];
					}
					
					var statusPupils = s === 1 ? pupilsByStatus[1].concat(pupilsByStatus[2]) : pupilsByStatus[s];
					
					var count = statusPupils.length;
					var h2 = count === 0 ? 40 : 40+7+count*32;
					text({ctx:ctx,text:[''],rect:[x2,y2,w2,h2],box:{type:'loose',color:fillColor,borderColor:'#000',borderWidth:2,radius:5}});
					text({ctx:ctx,text:[txt],rect:[x2,y2,w2,40],align:[0,0],bold:false,fontSize:20});
					
					var freq = count === 0 ? '' : String(count);
					text({ctx:ctx,text:[freq],rect:[x2+w2-44+2,y2-2,44,44],fontSize:26,bold:true,align:[0,0],box:{type:'loose',color:fillColor,borderColor:'#000',borderWidth:2,radius:5}});
					
					if (count > 0) {
						y2 += 10;
						for (var p = 0; p < statusPupils.length; p++) {
							var pupil = statusPupils[p];
							y2 += 32;
							if (p > 0) { // draw line above
								ctx.lineWidth = 1;
								ctx.strokeStyle = '#666';
								ctx.beginPath();
								ctx.moveTo(x2+5,y2);
								ctx.lineTo(x2+w2-10,y2);
								ctx.stroke();
							}
							var name = pupil.pupilName;
							if (s === 0 && name.length > 26) {
								name = name.slice(0,25)+'...';
							} else if (s > 0 && name.length > 18) {
								name = name.slice(0,17)+'...';
							}
							var w3 = s === 0 ? w2-10 : w2-132;
							text({ctx:ctx,rect:[x2+10,y2,w3,32],text:[name],align:[-1,0],fontSize:18});
							if (s > 0 && !un(pupil._pupilTask)) {
								text({ctx:ctx,rect:[x2+w2-132,y2,66,32],text:[pupil._pupilTask.percentage+'%'],align:[0,0],fontSize:16,color:'#333'});
								var time = pupil._pupilTask.totalTime;
								time = time > 60 ? '1hr+' : time === 1 ? '1 min' : time + ' mins';
								text({ctx:ctx,rect:[x2+w2-66,y2,66,32],text:[time],align:[0,0],fontSize:16,color:'#333'});
							}
							
						}
					}
					
					if (testMode === 0 && s === 0) {
						y2 += 55;
					} else {
						x2 += w2+20;
						y2 = y+55;
					}
				}
				
				*/
			}
		}
		/*if (mode === 'edit') {
			var r2 = [obj.rect[0]+obj.rect[2]/2+15, obj.rect[1], obj.rect[2]/2-15, obj.rect[3]];
			
			obj._cursorPos.push({shape:'rect',dims:r2,cursor:draw.cursors.default,func:function() {}});

			var r3 = [r2[0],r2[1],r2[2]*0.4,r2[3]];
			
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#000';
			ctx.moveTo(r2[0]+r2[2]*0.4,r2[1]+10);
			ctx.lineTo(r2[0]+r2[2]*0.4,r2[1]+r2[3]-10);
			ctx.stroke();
			
			var r4 = [r2[0]+r2[2]*0.4,r2[1],r2[2]*0.6,r2[3]];
			var x = r4[0]+15;
			var y = r4[1]+15;
			var metaWidth = r4[2]-30;
			
			//if (un(draw.task.questionMetaData)) draw.taskEdit.getAllQuestionsMetaData();
			if (un(draw.task.topics)) draw.taskEdit.getTopics(drawCanvasPaths);
			if (un(obj._metaData)) obj._metaData = {calc:null,difficulty:null,description:'',topicIDs:[]};
			var metaData = obj._metaData;
			
			var toggleButton = {
				type: 'toggleButton',
				rect:[x,y,metaWidth,30],
				options:[['Non-calc'],['Calc']],
				value: metaData.calc === 0 ? 0 : metaData.calc === 1 ? 1 : -1,
				lineWidth:2,
				radius:15,
				fontSize:20,
				color:'#F00',
			};
			draw.toggleButton.draw(ctx,toggleButton);
			for (var i = 0; i < toggleButton._cursorPos.length; i++) {
				toggleButton._cursorPos[i].question = obj;
				toggleButton._cursorPos[i].value = i;
				toggleButton._cursorPos[i].func = draw.taskEdit.setMetaDataCalc;
				obj._cursorPos.push(toggleButton._cursorPos[i]);
			}
			
			y += 43;
			text({ctx:ctx,rect:[x,y,100,30],align:[-1,0],text:['Difficulty:'],bold:true,fontSize:20});
			if (un(obj._metaDataDifficultyDropDown)) {
				obj._metaDataDifficultyDropDown = {
					type:'dropMenu',
					text: metaData.difficulty === null ? ['-'] : [String(metaData.difficulty)],
					align: [0, 0],
					fontSize: 20,
					rect:[x+110,y,65,30],
					box: {
						type: 'loose',
						color: '#99F',
						borderColor: '#000',
						borderWidth: 3
					},
					optionBox: {
						color: '#CCF',
						lineWidth: 2,
						align: [0, 0]
					},
					showDownArrow: true,
					downArrowSize: 6,
					options: [{text:['-'],value:null},{text:['1'],value:1},{text:['2'],value:2},{text:['3'],value:3},{text:['4'],value:4},{text:['5'],value:5}],
					value: metaData.difficulty,
					_open: false,
					onchange: function (obj) {
						
					}
				}
			}
			obj._metaDataDifficultyDropDown.rect = [x+110,y,65,30];
			obj._metaDataDifficultyDropDown.value = metaData.difficulty;
			obj._metaDataDifficultyDropDown.text = metaData.difficulty=== null ? ['-'] : [String(metaData.difficulty)];
					
			y += 37;
			text({ctx:ctx,rect:[x,y,90,30],align:[-1,0],text:['Description:'],bold:true,fontSize:20});
			if (un(obj._metaDataDescriptionTextObj)) {
				obj._metaDataDescriptionTextObj = {
					type:'editableText',
					text: [metaData.description],
					align: [-1, -1],
					fontSize: 20,
					box: {
						type: 'loose',
						color: '#FFF',
						borderColor: '#000',
						borderWidth: 2,
						padding: 3
					},
					question:obj,
					_draw:drawCanvasPaths,
					onInputEnd: function(obj) {
						 draw.taskEdit.setMetaDataDescription(obj.question,obj.text[0]);
					}
				}
			}
			y += 30;
			if (obj._metaDataDescriptionTextObj.text[0] === '' && metaData.description !== '' && obj._metaDataDescriptionTextObj.textEdit !== true) {
				obj._metaDataDescriptionTextObj.text[0] = metaData.description;
			}
			obj._metaDataDescriptionTextObj.rect = [x,y,metaWidth,65];
			draw.editableText.draw(ctx,obj._metaDataDescriptionTextObj,{});
			obj._cursorPos = obj._cursorPos.concat(obj._metaDataDescriptionTextObj._cursorPos);
			
			y += 72;
			text({ctx:ctx,rect:[x,y,90,30],align:[-1,0],text:['Topics:'],bold:true,fontSize:20});
			y += 30;
			if (!un(draw.task.topics)) {
				for (var i = 0; i < metaData.topicIDs.length; i++) {
					var topic = draw.task.topics.find(function(x) {return x.topicID === metaData.topicIDs[i];});
					if (typeof topic === 'object') {
						var strand = topic.strand;
						text({ctx:ctx,rect:[x,y,metaWidth,30],align:[-1,0],text:[topic.topicNameShort],fontSize:20,box:{type:'loose',borderColor:'#000',color:topic.colors[1],borderWidth:2,radius:5}});
						
						text({ctx:ctx,rect:[x+metaWidth-25,y,25,30],align:[0,0],text:[times],fontSize:28,color:'#F00',bold:true});
						
						obj._cursorPos.push({shape:'rect',dims:[x+metaWidth-25,y,25,30],cursor:draw.cursors.pointer,func:draw.taskEdit.setMetaDataTopicIDs,action:'remove',question:obj,value:topic.topicID});
						
						y += 35;
					}
				}
			}
			
			y += 5;
			if (un(obj._metaDataTopicDropDown)) {
				obj._metaDataTopicDropDown = {
					type:'dropMenu',
					text: ['<<italic:true>>add topic...'],
					align: [0, 0],
					fontSize: 20,
					rect:[x,y,150,30],
					box: {
						type: 'loose',
						color: '#6FF',
						borderColor: '#000',
						borderWidth: 3
					},
					optionBox: {
						color: '#FFC',
						lineWidth: 2,
						align: [0, 0]
					},
					showDownArrow: true,
					downArrowSize: 6,
					options: [],
					value: -1,
					_open: false,
					scrollSize:15
				}
			}
			obj._metaDataTopicDropDown.rect = [x,y,metaWidth,30];
			if (obj._metaDataTopicDropDown.options.length === 0 && typeof draw.task.topics === 'object') {
				obj._metaDataTopicDropDown.options = draw.task.topics.map(function(x) {
					return {text:[x.topicNameShort],value:x.topicID,color:x.colors[1]};
				});
			}
			
			y += 55;
			
			text({ctx:ctx,rect:[x+20,y,metaWidth-40,35],text:['Set for all questions'],align:[0,0],fontSize:20,color:'#000',bold:true,box:{type:'loose',color:'#FF6',borderColor:'#000',borderWidth:2,radius:10}});
			obj._cursorPos.push({shape:'rect',dims:[x+20,y,metaWidth-40,35],cursor:draw.cursors.pointer,func:draw.taskEdit.setAllQuestionsMetaData,obj:obj
			});
			
			draw.dropMenu.draw(ctx,obj._metaDataTopicDropDown);
			var dropCursorPos = draw.dropMenu.getCursorPositionsInteract(obj._metaDataTopicDropDown);
			while (dropCursorPos.length > 0 && dropCursorPos[0].func !== draw.dropMenu.clickSetValue) {
				obj._cursorPos.push(dropCursorPos.shift());
			}
			for (var c = 0; c < dropCursorPos.length; c++) {
				var pos = dropCursorPos[c];
				var index = c+obj._metaDataTopicDropDown._scrollObj.value;
				pos.question = obj;
				pos.value = obj._metaDataTopicDropDown.options[index].value;
				pos.text = obj._metaDataTopicDropDown.options[index].text;
				pos.func = draw.taskEdit.setMetaDataTopicIDs;
				obj._cursorPos.push(pos);
			}
			
			draw.dropMenu.draw(ctx,obj._metaDataDifficultyDropDown);
			var dropCursorPos = draw.dropMenu.getCursorPositionsInteract(obj._metaDataDifficultyDropDown);
			obj._cursorPos.push(dropCursorPos.shift());
			for (var c = 0; c < dropCursorPos.length; c++) {
				var pos = dropCursorPos[c];
				pos.question = obj;
				pos.value = obj._metaDataDifficultyDropDown.options[c].value;
				pos.text = obj._metaDataDifficultyDropDown.options[c].text;
				pos.func = draw.taskEdit.setMetaDataDifficulty;
				obj._cursorPos.push(pos);
			}
			
			for (var c = 0; c < obj._cursorPos.length; c++) obj._cursorPos[c].zIndex = 1000;		
		}*/

	},

	toggleExpandClassResults: function() {
		draw.taskTitle._expandClassResults = !draw.taskTitle._expandClassResults;
		drawCanvasPaths();
	},
	getClassResultsBox: function(x,y,w) {
		if (un(draw.taskTitle._classResultsBox)) {
			var obj = {
				padding:2,
				rect:[x,y,w,100],
				pageIndex:0,
				
				_draw:function() {
					if (un(draw.task.class) || un(draw.task.class.pupilsByStatus)) return;
					
					var obj = this;
					var pageIndex = obj._pageIndex || 0;
					if (obj.visible === false || pIndex !== pageIndex) {
						if (!un(obj._canvas.parentNode)) {
							obj._canvas.parentNode.removeChild(obj._canvas);
						}
					} else {
						if (un(obj._canvas.parentNode)) {
							draw.div.childNodes[0].appendChild(obj._canvas);
						}
					}
					
					var pupilsByStatus = draw.task.class.pupilsByStatus;
					var testMode = 0;
					if (!un(draw.task.class.data) && !un(draw.task.class.data.classSetTasks) && !un(draw.task.class.data.classSetTasks[0])) testMode = draw.task.class.data.classSetTasks[0].testMode;
					
					var heights = [];
					for (var s = 0; s < pupilsByStatus.length; s++) {
						if (s === 2) {
							heights[2] = 0;
							continue;
						}
						if (s === 1) {
							var count =  pupilsByStatus[1].length + pupilsByStatus[2].length;
							heights[s] = count === 0 ? 50 : 50+7+count*32;
						} else {
							heights[s] = pupilsByStatus[s].length === 0 ? 50 : 50+7+pupilsByStatus[s].length*32;
						}
					}
					obj.rect[3] = 55 + Math.max(heights[0],heights[1],heights[3])+10;
					obj.updateCanvas();
					
					var ctx = obj._ctx;

					var x = obj.padding;
					var y = obj.padding;
					var w = obj.rect[2];
					var h = obj.rect[3];
					
					var color = testMode === 1 ? '#EFF' : '#FFD';
					text({ctx:ctx,text:[''],rect:[x,y,w,h],align:[-1,-1],box:{type:'loose',color:color,borderColor:'#000',borderWidth:3,radius:10}});
					
					var txt = 'Class Progress';
					if (testMode === 1) txt += ' (test)';
					text({ctx:ctx,text:[txt],rect:[x+20,y+8,w,36],align:[-1,0],bold:true,fontSize:20});
					
					text({ctx:ctx,text:['Close ✖'],rect:[x+w-110,y+8,100,36],align:[0,0],fontSize:20,bold:true,color:'#F00',box:{type:'loose',color:'#FFF',borderColor:'#F00',borderWidth:3,radius:10}});
					obj._closeRect = [obj.rect[0]+x+w-110,obj.rect[1]+y+8,100,36];
					
					if (draw.task.class.data.classSetTasks.length === 0) {
						var txt = 'Task has not been set';
						var color = '#900';
					} else {
						var setDate = draw.task.dateToString(draw.task.class._setDate);
						var dueDate = draw.task.dateToString(draw.task.class._dueDate);
						var txt = 'Set: '+setDate+'   ●   '+'Due: '+dueDate;
						var color = '#060';
					}
					text({ctx:ctx,rect:[x,y+8,w,36],text:[txt],color:color,align:[0,0],fontSize:20,bold:true});	
					
					var y2 = y+55;
					var x2 = x+20;
					var w2 = (w-80)/3
					
					for (var s = 0; s < 4 ; s++) {
						if (s === 2) continue;
						var txt = testMode === 1 ? ['Not Started','Started','','Finished'][s] : ['Not Started','< 100%','','Completed'][s];
						var fillColor = ['#FCC','#FFC','#FFC','#CFC'][s];
						
						var statusPupils = s === 1 ? pupilsByStatus[1].concat(pupilsByStatus[2]) : pupilsByStatus[s];
						
						var count = statusPupils.length;
						var h2 = count === 0 ? 40 : 40+7+count*32;
						text({ctx:ctx,text:[''],rect:[x2,y2,w2,h2],box:{type:'loose',color:fillColor,borderColor:'#000',borderWidth:2,radius:5}});
						text({ctx:ctx,text:[txt],rect:[x2,y2,w2,40],align:[0,0],bold:false,fontSize:20});
						
						var freq = count === 0 ? '' : String(count);
						text({ctx:ctx,text:[freq],rect:[x2+w2-44+2,y2-2,44,44],fontSize:26,bold:true,align:[0,0],box:{type:'loose',color:fillColor,borderColor:'#000',borderWidth:2,radius:5}});
						
						if (count > 0) {
							y2 += 10;
							for (var p = 0; p < statusPupils.length; p++) {
								var pupil = statusPupils[p];
								y2 += 32;
								if (p > 0) { // draw line above
									ctx.lineWidth = 1;
									ctx.strokeStyle = '#666';
									ctx.beginPath();
									ctx.moveTo(x2+5,y2);
									ctx.lineTo(x2+w2-10,y2);
									ctx.stroke();
								}
								var name = pupil.pupilName;
								if (s === 0 && name.length > 26) {
									name = name.slice(0,25)+'...';
								} else if (s > 0 && name.length > 18) {
									name = name.slice(0,17)+'...';
								}
								var w3 = s === 0 ? w2-10 : w2-132;
								text({ctx:ctx,rect:[x2+10,y2,w3,32],text:[name],align:[-1,0],fontSize:18});
								if (s > 0 && !un(pupil._pupilTask)) {
									text({ctx:ctx,rect:[x2+w2-132,y2,66,32],text:[pupil._pupilTask.percentage+'%'],align:[0,0],fontSize:16,color:'#333'});
									var time = pupil._pupilTask.totalTime;
									time = time > 60 ? '1hr+' : time === 1 ? '1 min' : time + ' mins';
									text({ctx:ctx,rect:[x2+w2-66,y2,66,32],text:[time],align:[0,0],fontSize:16,color:'#333'});
								}
								
							}
						}
						
						x2 += w2+20;
						y2 = y+55;
					}
				},
				updateCanvas:function() {
					var obj = this;
					var padding = !un(obj.padding) ? obj.padding : 2;
					var z = !un(obj.zIndex) ? obj.zIndex : 600;
					
					obj._canvas.style.zIndex = z;
					obj._canvas.style.left = (100*(obj.rect[0]-padding)/1200)+'%';
					obj._canvas.style.top = (100*(obj.rect[1]-padding)/1700)+'%';
					obj._canvas.style.width = (100*(obj.rect[2]+2*padding)/1200)+'%';
					obj._canvas.style.height = (100*(obj.rect[3]+2*padding)/1700)+'%';
					obj._canvas.width = obj.rect[2]+2*padding;
					obj._canvas.height = obj.rect[3]+2*padding;
				},
				move:function(e) {
					updateMouse(e);
					var obj = e.target.obj;
					obj._cursorPos = 'none';
					e.target.style.cursor = 'default';
					var x = draw.mouse[0];
					var y = draw.mouse[1];
					var l = obj._closeRect[0];
					var t = obj._closeRect[1];
					var w = obj._closeRect[2];
					var h = obj._closeRect[3];
					if (x >= l && x <= (l + w) && y >= t && y <= (t + h)) {
						obj._cursorPos = 'closeRect';
						e.target.style.cursor = 'pointer';
					}
				},
				click:function(e) {
					var obj = e.target.obj;
					if (obj._cursorPos === 'closeRect') {
						obj._cursorPos = 'none';
						e.target.style.cursor = 'default';
						obj.visible = false;
						draw.taskTitle._expandClassResults = false;
						drawCanvasPaths();
					}
				}
			};

			obj._canvas = document.createElement('canvas');
			obj._ctx = obj._canvas.getContext('2d');
			obj._canvas.style.position = 'absolute';
			obj._canvas.style.pointerEvents = 'auto';
			obj._canvas.style.cursor = 'default';
			obj._canvas.tabIndex = 999; // allows onblur to work
			obj._canvas._pageNode = true;
			obj._canvas.obj = obj;
			addListenerMove(obj._canvas,obj.move);
			addListener(obj._canvas,obj.click);
			var pageIndex = !un(obj._pageIndex) ? obj._pageIndex : pIndex;
			var page = pages[pageIndex];
			if (un(page._nodes)) page._nodes = [];
			page._nodes.push(obj._canvas);
			draw.taskTitle._classResultsBox = obj;
		}
		draw.taskTitle._classResultsBox.rect = [x,y,w,400];
		return draw.taskTitle._classResultsBox;
	},

	setTaskTitle: function() {
		if (un(draw.task.taskData)) draw.task.taskData = {};
		var title = prompt('Task Title:',draw.task.taskData.title || '');
		if (typeof title === 'string' && title !== '') {
			draw.task.taskData.taskName = title;
			drawCanvasPaths();
		}
	},
	setTaskSubtitle: function() {
		if (un(draw.task.taskData)) draw.task.taskData = {};
		var subtitle = prompt('Subtitle:',draw.task.taskData.subtitle || '');
		if (typeof subtitle === 'string' && subtitle !== '') {
			draw.task.taskData.subtitle = subtitle;
			drawCanvasPaths();
		}
	},
	setTaskCalc: function() {
		if (un(draw.task.taskData)) draw.task.taskData = {};
		draw.task.taskData.calc = draw.task.taskData.calc === 0 ? 1 : draw.task.taskData.calc === 1 ? -1 : 0;
		drawCanvasPaths();
	},

	getRect: function(obj) {
		return obj.rect;
	},
	drawButton: function (ctx, size) {
		text({ctx:ctx,rect:[0.2*size,0.2*size,0.6*size,0.6*size],align:[0,0],fontSize:0.5*size,text:['T'],box:{type:'loose',borderColor:'#000'}});
	}
}

draw.taskQuestion = {
	draggable:false,
	groupable:false,
	add:function() {
		var layout = draw.taskQuestion.getPageTaskLayout();
		var left = undefined
		var top = undefined;
		for (r = 0; r < 7; r++) {
			var row1 = layout[r];
			var row2 = layout[r+1];
			for (var c = 0; c < 2; c++) {
				if (row1[c].taskQuestions.length === 0 && row2[c].taskQuestions.length === 0) {
					left = row1[c].rect[0];
					top = row1[c].rect[1];
					c = 2;
					r = 7;
					break;
				}
			}
		}
		if (left === undefined) {
			console.log('No space to add question');
			return;
		}
		
		deselectAllPaths();
		draw.taskEdit.getNewQuestionID(function(questionID) {
			var viewRect = draw.getView().pageViewRect;
			var obj = {
				type:'taskQuestion',
				cells:[[{
					text:['']
				}]],
				align:[-1,-1],
				marginLeft:60,
				marginRight:60,
				widths:[555],
				heights:[330],
				left:left,
				top:top,
				width:555,
				height:330,
				qNum:1,
				minCellPadding:10,
				questionID:questionID,
				partMarksMax:[1],
				algPadding:4,
				_partMarks:[0],
				_pageNum:pIndex
			};
			draw.path.push({obj:[obj],selected:true});
			draw.taskEdit.updateQuestionData(obj);
			updateBorder(draw.path.last());
			draw.taskEdit.sortTaskQuestions();
			drawCanvasPaths();
		});
	},
	drawUnderlay:function(ctx,obj,path) {
		var taskMode = draw.task.getMode();
		if (taskMode === 'Review Class' && un(obj._reviewClassShowAnswer)) {
			var class1 = draw.task.class;
			if (!un(class1) && !un(class1.questionData)) {
				var questionData = class1.questionData.find(function(x) {return x.taskQuestion.obj === obj;});
				if (!un(questionData)) {
					for (var p = 0; p < questionData.parts.length; p++) {
						var part = questionData.parts[p];
						if (un(part) || part.taskPupilsAnalysisColor === 'none') continue;
						var fillColor = part.taskPupilsAnalysisColor;
						var rad = [10,10,10,10];
						roundedRect3(ctx, obj.left, obj.top, obj.width, obj.height+50, rad, 0.01, fillColor, fillColor);
					}
				}
			}
		} else if (draw.mode === 'interact') {
			for (var r = 0; r < obj.cells.length; r++) {
				if (obj._mode === 'checked' || (obj._mode instanceof Array && obj._mode[r] === 'checked')) {
					marks = obj._partMarks[r];
					if (marks === -1) continue;
					var marksMax = obj.partMarksMax[r];
					obj._backgroundColors = marks === 0 ? ['#FCC','#F99'] : marks < marksMax ? ['#FFC','#FA8'] : ['#CFC','#9F9'];
					var y1 = obj.yPos[r];
					var y2 = obj.yPos[r+1];
					var rad = r === 0 && typeof taskApp !== 'object' ? [10,10,0,0] : [0,0,0,0];
					roundedRect3(ctx, obj.left, y1, obj.width, y2-y1, rad, 0.1, obj._backgroundColors[1], obj._backgroundColors[1]);
				} else {
					obj._backgroundColors = ['#FFF','#FFF'];
				}
			}
		}
	},
	draw:function(ctx,obj,path) {				  
		obj.outerBorder = {show:false};
		obj.innerBorder = {show:false};
		draw.table2.draw(ctx,obj,path);
		delete obj.outerBorder;
		delete obj.innerBorder;
		
		obj._cells = [];
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				obj._cells.push(obj.cells[r][c]);
			}
		}
		
		var w = obj.qNum < 10 ? 50 : 60;
		text({
			ctx:ctx,
			textArray:['<<fontSize:32>><<bold:true>>'+obj.qNum],
			align:[0,0],
			rect:[obj.left,obj.top,w,50],
			padding:7
		});
		//var borderColor = typeof taskApp === 'object' ? '#000' : '#666';
		var borderColor = '#666';
		var borderWidth = 3;
		if (draw.mode === 'edit') {
			draw.taskQuestion.getPaths(obj);
			var cell = obj._cell;
			if (cell._inputIDsUnique === false) {
				borderColor = '#F00';
				borderWidth = 5;
			} else if (path.selected === true) {
				borderColor = '#090';
				if (!un(obj._metaData)) {
					if (obj._metaData.questionInUse === true) {
						borderColor = '#F0F';
					} else if (obj._metaData.questionPublished === true) {
						borderColor = '#F0F';
					}
				}
			}
		}
		ctx.beginPath();
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = borderWidth;
		ctx.moveTo(obj.left,obj.top+50);
		ctx.lineTo(obj.left+w,obj.top+50);
		ctx.lineTo(obj.left+w,obj.top);
		ctx.moveTo(obj.left,obj.top+obj.height);
		ctx.lineTo(obj.left+obj.width,obj.top+obj.height);
		ctx.stroke();
		if (obj._drawBorder !== false) {
			roundedRect2(ctx, obj.left, obj.top, obj.width, obj.height+50, 10, borderWidth, borderColor);
		} else {
			if (obj._drawBorderTop === true) {
				ctx.beginPath();
				ctx.moveTo(obj.left,obj.top);
				ctx.lineTo(obj.left+obj.width,obj.top);
				ctx.stroke();
			}
			if (obj._drawBorderBottom === true) {
				ctx.beginPath();
				ctx.moveTo(obj.left,obj.top+obj.height+50);
				ctx.lineTo(obj.left+obj.width,obj.top+obj.height+50);
				ctx.stroke();
			}
			if (obj._drawBorderLeft === true) {
				ctx.beginPath();
				ctx.moveTo(obj.left,obj.top);
				ctx.lineTo(obj.left,obj.top+obj.height+50);
				ctx.stroke();
			}
			if (obj._drawBorderRight === true) {
				ctx.beginPath();
				ctx.moveTo(obj.left+obj.width,obj.top);
				ctx.lineTo(obj.left+obj.width,obj.top+obj.height+50);
				ctx.stroke();
			}
		}
		
		ctx.beginPath();
		ctx.strokeStyle = borderColor;
		ctx.lineWidth = 1;
		if (!un(obj.marginLeft) && draw.mode == 'edit' && path.selected == true) {
			ctx.moveTo(obj.left+obj.marginLeft,obj.top);
			ctx.lineTo(obj.left+obj.marginLeft,obj.top+obj.height);
		}
		if (!un(obj.marginRight)) {
			ctx.moveTo(obj.left+obj.width-obj.marginRight,obj.top);
			ctx.lineTo(obj.left+obj.width-obj.marginRight,obj.top+obj.height);
		}
		var y = obj.top;
		for (var p = 0; p < obj.heights.length-1; p++) {
			y += obj.heights[p];
			ctx.moveTo(obj.left,y);
			ctx.lineTo(obj.left+obj.width,y);
		}
		ctx.stroke();
		
		if (obj._loaded === false) {
			var mid = [obj.left+0.5*obj.width,obj.top+0.5*obj.height];
			text({ctx:ctx,rect:[mid[0]-100,mid[1]-30,200,60],text:['Loading...'],font:'Hobo',align:[0,0],fontSize:36,box:{type:'loose',color:'#CFF',borderColor:'#000',radius:10,borderWidth:3}});
			draw.taskQuestion.loadQuestion(obj);
		}
		if (draw.mode === 'edit' && !un(obj._path) && obj._path.selected === true) {
			draw.taskQuestion.getPaths(obj);
		}
	},
	drawOverlay: function(ctx,obj,path) {
		obj._cursorPos = [];
		obj._scrollWheelPositions = [];
		if (obj._loaded === false) return;
		
		var x = obj.left+obj.width-obj.marginRight;
		var y = obj.top;
		var w = obj.marginRight;
		var taskMode = draw.task.getMode();
		var questionMode = !un(obj._mode) ? obj._mode : 'none';
		
		if (!un(obj._showQuestionTip)) {
			var color = '#F0F';
			var rect = [obj.left+obj.width-50,obj.top+10,40,40];
			if (obj._showQuestionTip === true) {
				text({ctx:ctx,rect:rect,align:[0,0],fontSize:36,font:'algebra',text:['i'],color:color,box:{type:'loose',color:'#FFF',borderColor:color,borderWidth:2,radius:20}});
			} else {
				text({ctx:ctx,rect:rect,align:[0,0],fontSize:36,font:'algebra',text:['i'],color:'#FFF',box:{type:'loose',color:color,borderColor:color,borderWidth:2,radius:20}});
			}
			if (questionMode !== 'checking' && questionMode !== 'checked') obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:rect,cursor:draw.cursors.pointer,func:draw.taskQuestion.toggleQuestionTip,obj:obj});
		}
		if (!un(obj.buttons) && obj._showButtons !== false) {
			var x2 = obj.left+obj.width-50;
			var y2 = !un(obj._showQuestionTip) ? obj.top+60 : obj.top+10;
			for (var b = 0; b < obj.buttons.length; b++) {
				var taskQuestionButtonType = obj.buttons[b];
				var button = {
					/*'reset':{
						draw:function(ctx,l,t,s) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:11,bold:true,text:['RESET'],box:{type:'loose',color:'#CCC',borderColor:'#000',borderWidth:2,radius:5}});
							//draw.resetButton.draw(ctx,{type:'resetButton',left:l,top:t,size:s,fillColor:'#C9F',direction:'left'});
						},
						func:draw.taskQuestion.resetButtonPress
					},*/
					'frac':{
						draw:function(ctx,l,t,s,color) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:20,font:'algebra',text:[['frac',[''],['']]],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
						},
						func:draw.taskQuestion.keyboardButtonPress
					},
					'pow':{
						draw:function(ctx,l,t,s,color) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:20,font:'algebra',text:['x',['pow',false,['']]],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
						},
						func:draw.taskQuestion.keyboardButtonPress
					},
					'sqrt':{
						draw:function(ctx,l,t,s,color) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:20,font:'algebra',text:[['sqrt',['']]],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
						},
						func:draw.taskQuestion.keyboardButtonPress
					},
					'root':{
						draw:function(ctx,l,t,s,color) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:20,font:'algebra',text:[['root',[''],['']]],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
						},
						func:draw.taskQuestion.keyboardButtonPress
					},
					'squared':{
						draw:function(ctx,l,t,s,color) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:20,font:'algebra',text:['x',['pow',false,['2']]],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
						},
						func:draw.taskQuestion.keyboardButtonPress
					},
					'cubed':{
						draw:function(ctx,l,t,s,color) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:20,font:'algebra',text:['x',['pow',false,['3']]],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
						},
						func:draw.taskQuestion.keyboardButtonPress
					},
					'<':{
						draw:function(ctx,l,t,s,color) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:20,font:'algebra',text:['<'],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
						},
						func:draw.taskQuestion.keyboardButtonPress
					},
					'>':{
						draw:function(ctx,l,t,s,color) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:20,font:'algebra',text:['>'],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
						},
						func:draw.taskQuestion.keyboardButtonPress
					},
					'lte':{
						draw:function(ctx,l,t,s,color) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:20,font:'algebra',text:['≤'],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
						},
						func:draw.taskQuestion.keyboardButtonPress
					},
					'gte':{
						draw:function(ctx,l,t,s,color) {
							text({ctx:ctx,rect:[l,t,s,s],align:[0,0],fontSize:20,font:'algebra',text:['≥'],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
						},
						func:draw.taskQuestion.keyboardButtonPress
					}
				}[taskQuestionButtonType];
				if (typeof button !== 'object') continue;
				
				var active = questionMode === 'checking' || questionMode === 'checked' ? false : taskQuestionButtonType === 'reset' ? true : !un(textEdit.obj) && textEdit.obj._taskQuestion === obj ? true : false;
								
				button.draw(ctx,x2,y2,40,active === true ? '#FF0' : '#FFC');
				if (active === true) obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:[x2,y2,40,40],cursor:draw.cursors.pointer,func:button.func,obj:obj,taskQuestionButtonType:taskQuestionButtonType,endTextInput:false});
				
				y2 += 50;
			}
		}
		
		for (var p = 0; p < obj.heights.length; p++) {
			y += obj.heights[p];
			if (obj._mode === 'classResults') {
				var partResults = obj._results.parts[p];
				
				var rect = [x+7.5,y-160,45,45];
				var prop = Math.round(partResults.lastMarksProportional*100)+'%';
				var color = getScaleColor(partResults.lastMarksProportional,1,0.25);
				text({ctx:ctx,rect:rect,align:[0,0],fontSize:16,text:[prop],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
				obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:rect,cursor:draw.cursors.pointer,func:draw.taskQuestion.classResultsShowDist,obj:obj,p:p});
				
				var rect = [x+7.5,y-105,45,45];
				var prop = Math.round(partResults.firstMarksProportional*100)+'%';
				var color = getScaleColor(partResults.firstMarksProportional,1,0.25);
				text({ctx:ctx,rect:rect,align:[0,0],fontSize:16,text:[prop],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
				obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:rect,cursor:draw.cursors.pointer,func:draw.taskQuestion.classResultsShowDistFirst,obj:obj,p:p});
				
				var marksMax = !un(obj.partMarksMax) ? obj.partMarksMax[p] : '?';
				text({ctx:ctx,rect:[x,y-60,w,60],text:['<<fontSize:24>>['+marksMax+']'],align:[0,0]});
				
				if (obj._showDist[p] === true || obj._showDistFirst[p] === true) {
					var marksDist = obj._showDistFirst[p] === true ? partResults.firstMarksFreq : partResults.lastMarksFreq;
					var notLoggedCount = partResults.pupilsNotLogged.length;
					var size = 20;
					var padding = 5;
					var boxWidth = size*Math.max(marksDist.max(),notLoggedCount)+80;
					if (obj._showDistFirst[p] === true) boxWidth += 120;
					var boxHeight = (size+padding)*(marksDist.length+2)+50;
					var txt = obj._showDistFirst[p] === true ? 'Mark distribution (first attempt)' : 'Mark distribution';
					var color = obj._showDistFirst[p] === true ? '#CFF' : '#FFF';
					text({ctx:ctx,rect:[obj.left+10,y-10-boxHeight,boxWidth,boxHeight],align:[-1,-1],fontSize:24,text:[txt],box:{type:'loose',color:color,radius:10,borderColor:'#000',borderWidth:3}});
					obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:[obj.left+10,y-10-boxHeight,boxWidth,boxHeight],cursor:draw.cursors.pointer,func:draw.taskQuestion.classResultsShowDistOff,obj:obj,p:p});
					
					var y2 = y-boxHeight+35;
					
					for (var m = marksDist.length-1; m >= 0; m--) {
						text({ctx:ctx,rect:[obj.left+20,y2,25,size],align:[0,0],fontSize:20,text:[String(m)]});
						var x2 = obj.left+45;
						text({ctx:ctx,rect:[x2,y2,0,size],text:[''],box:{type:'loose',borderColor:'#000',borderWidth:1}});
						var color = m === 0 ? '#F00' : m === partResults.marksMax ? '#0F0' : '#FF0';
						for (var n = 0; n < marksDist[m]; n++) {
							text({ctx:ctx,rect:[x2,y2,size,size],text:[''],box:{type:'loose',color:color,borderColor:'#000',borderWidth:1}});
							x2 += size;
						}
						y2 += size+padding;
					}
					
					y2 += (size+padding)*3/4;
					text({ctx:ctx,rect:[obj.left+20,y2,25,size],align:[0,0],fontSize:20,text:['x']});
					var x2 = obj.left+45;
					text({ctx:ctx,rect:[x2,y2,0,size],text:[''],box:{type:'loose',borderColor:'#000',borderWidth:1}});
					for (var n = 0; n < notLoggedCount; n++) {
						text({ctx:ctx,rect:[x2,y2,size,size],text:[''],box:{type:'loose',color:'#999',borderColor:'#000',borderWidth:1}});
						x2 += size;
					}
				}
			} else if (draw.mode == 'interact' && (obj._mode == 'checked' || (obj._mode instanceof Array && obj._mode[r] === 'checked')) && !un(obj._partMarks)) {
				var color = '#F00';
				var cell = obj.cells[p];
				if (obj._partMarks[p] == obj.partMarksMax[p]) {
					drawTick(ctx, 30, 40, '#060', x+15, y-100, 5);
					var color = '#060';
				} else if (obj._partMarks[p] == 0) {
					drawCross(ctx, 30, 40, '#F00', x+15, y-100, 5);
					var color = '#F00';
				} else {
					drawTick(ctx, 20, 20*(4/3), '#693', x+15, y-100, 3);
					drawCross(ctx, 18, 18*(4/3), '#930', x+15+30-18, y-100+40-18*(4/3), 3);
					var color = '#960';
				}
				text({ctx:ctx,rect:[x,y-60,w,60],text:['<<fontSize:24>><<color:'+color+'>>'+obj._partMarks[p]+'/'+obj.partMarksMax[p]],align:[0,0]});
			} else if (draw.mode === 'edit' && obj._mode === 'showAnswers') {
				var answerIndex = obj._answerIndex[p];
				if (!un(obj._answers[p][answerIndex])) {
					var marks = obj._answers[p][answerIndex].marks;
					var marksMax = !un(obj.partMarksMax) ? obj.partMarksMax[p] : '?';
					var color = marks === 0 ? '#FCC' : marks < marksMax ? '#FFC' : '#CFC';
					text({ctx:ctx,rect:[x,y-60,60,60],text:['<<fontSize:24>>'+marks+'/'+marksMax],align:[0,0],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2}});
					
					obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:[x,y-60,60,60],cursor:draw.cursors.pointer,func:draw.taskQuestion.showAnswersModeSetAnswerPartMarks,obj:obj,part:p,answerIndex:answerIndex});
					
					var color = answerIndex === 0 ? '#CCC' : '#3FF';
					text({ctx:ctx,rect:[x,y-90,30,30],text:['<<fontSize:24>><'],align:[0,0],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2}});
					if (answerIndex > 0) obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:[x,y-90,30,30],cursor:draw.cursors.pointer,func:draw.taskQuestion.showAnswersModeShowPrev,obj:obj,part:p});
					
					var color = answerIndex < obj._answers[p].length-1 ? '#3FF' : '#CCC';
					text({ctx:ctx,rect:[x+30,y-90,30,30],text:['<<fontSize:24>>>'],align:[0,0],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2}});
					if (answerIndex < obj._answers[p].length-1) obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:[x+30,y-90,30,30],cursor:draw.cursors.pointer,func:draw.taskQuestion.showAnswersModeShowNext,obj:obj,part:p});
					
					var rect = [x+(60-35)/2,y-165,35,35];
					text({ctx:ctx,rect:rect,align:[0,0],font:'Hobo',fontSize:36,text:['!'],box:{type:'loose',color:'#F90',borderColor:'#000',borderWidth:2,radius:5}});
					obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:rect,cursor:draw.cursors.pointer,func:draw.taskQuestion.showAnswersModeSetAnswerPartFeedback,obj:obj,part:p,answerIndex:answerIndex});
					
					var feedback = obj._answers[p][answerIndex].feedback;
					if (feedback !== "" && feedback !== 0 && arraysEqual(feedback,[""]) === false) {				
						var measure = text({ctx:draw.hiddenCanvas.ctx,rect:[0,0,obj.xPos[1]-obj.xPos[0]-100,1000],align:[0,0],fontSize:24,text:feedback,box:{type:'loose',color:'#F90',borderColor:'#000',borderWidth:2,radius:5}});	
						var w = measure.tightRect[2];
						var h = measure.tightRect[3];
						var l = (obj.xPos[0]+obj.xPos[1])/2-w/2;
						var t = y-10-h;
						text({ctx:ctx,rect:[l,t,w,h],align:[0,0],fontSize:24,text:feedback,box:{type:'loose',color:'#F90',borderColor:'#000',borderWidth:2,radius:5}});
					}
				}
			} else if (draw.mode === 'edit' && obj._mode === 'addAnswers') {
				
				var marks = obj._partMarks[p];
				var marksMax = obj.partMarksMax[p];
				var color = marks === 0 ? '#FCC' : marks < marksMax ? '#FFC' : '#CFC';
				text({ctx:ctx,rect:[x,y-60,60,60],text:['<<fontSize:24>>'+marks+'/'+marksMax],align:[0,0],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2}});
				obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:[x,y-60,60,60],cursor:draw.cursors.pointer,func:draw.taskQuestion.addAnswersModeSetPartMarks,obj:obj,part:p});
				
				var rect = [x+(60-35)/2,y-165,35,35];
				text({ctx:ctx,rect:rect,align:[0,0],font:'Hobo',fontSize:36,text:['!'],box:{type:'loose',color:'#F90',borderColor:'#000',borderWidth:2,radius:5}});
				obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:rect,cursor:draw.cursors.pointer,func:draw.taskQuestion.addAnswersModeSetPartFeedback,obj:obj,part:p});
				
				var rect = [x,y-90,60,30];
				text({ctx:ctx,rect:rect,text:['<<fontSize:24>>Add'],align:[0,0],box:{type:'loose',color:'#3FF',borderColor:'#000',borderWidth:2}});
				obj._cursorPos.push({buttonType:'taskQuestion',shape:'rect',dims:rect,cursor:draw.cursors.pointer,func:draw.taskQuestion.addAnswersModeAdd,obj:obj,part:p});
				
				if (!un(obj._feedback) && !un(obj._feedback.text) && arraysEqual(obj._feedback.text,[""]) === false) {				
					var measure = text({ctx:draw.hiddenCanvas.ctx,rect:[0,0,obj.xPos[1]-obj.xPos[0]-100,1000],align:[0,0],fontSize:24,text:feedback,box:{type:'loose',color:'#F90',borderColor:'#000',borderWidth:2,radius:5}});
					
					var rect = [obj.left+10,obj.yPos[cell._r+1]-10-measure.tightRect[3],measure.tightRect[2],measure.tightRect[3]]

					text({ctx:ctx,rect:rect,align:[0,0],fontSize:24,text:obj._feedback.text,box:{type:'loose',color:'#F90',borderColor:'#000',borderWidth:2,radius:5}});
				}
				
			} else {
				var marksMax = !un(obj.partMarksMax) ? obj.partMarksMax[p] : '?';
				text({ctx:ctx,rect:[x,y-60,w,60],text:['<<fontSize:24>>['+marksMax+']'],align:[0,0]});
			}
			if (draw.mode === 'edit') {
				obj._cursorPos.push({shape:'rect',dims:[x,y-60,w,60],cursor:draw.cursors.pointer,func:draw.taskEdit.setPartMarksMax,obj:obj,part:p});
			}
		}
		if (draw.mode === 'interact' && !un(obj._attempts) && obj._attempts > 0 && (obj._attempts > 1 || obj._mode !== 'checked')) {
			var w = obj.width-40;
			var h = 50;
			var l = obj.left+20;
			var t = obj.top+obj.height;
			text({ctx:ctx,rect:[l,t,w,h],align:[-1,0],fontSize:24,italic:true,color:'#666',text:['Attempts: '+obj._attempts]});
		}
		if (!un(obj._confirm)) {
			var w = obj.width-200;
			var measure = text({ctx:draw.hiddenCanvas.ctx,rect:[0,0,w,500],align:[0,0],fontSize:24,text:obj._confirm});				
			var textHeight = measure.tightRect[3];

			var h = textHeight+120;
			var l = obj.left+75;
			var w2 = obj.width-150;
			var t = obj.top+(obj.height+50)/2-h/2;
			
			roundedRect2(ctx,l,t,w2,h,10,2,'#000','#FFC');
			text({ctx:ctx,rect:[l+25,t+25,w,h],align:[0,-1],fontSize:24,text:obj._confirm});
			
			t += 45+textHeight;
			var c = obj.left+obj.width/2;
			text({ctx:ctx,rect:[c-140,t,120,45],align:[0,0],fontSize:24,text:['Continue'],box:{type:'loose',color:'#9F9',borderColor:'#000',borderWidth:3,radius:5}});
			
			obj._cursorPos.push({buttonType:'taskQuestion-confirmcontinue',shape:'rect',dims:[c-140,t,120,45],cursor:draw.cursors.pointer,func:function() {
				var obj = draw.currCursor.obj;
				draw.taskQuestion.check(obj);
			},obj:obj});
			
			text({ctx:ctx,rect:[c+20,t,120,45],align:[0,0],fontSize:24,text:['Cancel'],box:{type:'loose',color:'#F99',borderColor:'#000',borderWidth:3,radius:5}});
			obj._cursorPos.push({buttonType:'taskQuestion-confirmcancel',shape:'rect',dims:[c+20,t,120,45],cursor:draw.cursors.pointer,func:function() {
				var obj = draw.currCursor.obj;
				delete obj._confirm;
				delete obj._mode;
				draw.taskQuestion.enable(obj);
				drawCanvasPaths();
			},obj:obj});
			return;
		} else if (!un(obj._resetConfirm)) {
			var w = obj.width-200;
			var measure = text({ctx:draw.hiddenCanvas.ctx,rect:[0,0,w,500],align:[0,0],fontSize:24,text:obj._resetConfirm});				
			var textHeight = measure.tightRect[3];

			var h = textHeight+120;
			var l = obj.left+75;
			var w2 = obj.width-150;
			var t = obj.top+(obj.height+50)/2-h/2;
			
			roundedRect2(ctx,l,t,w2,h,10,2,'#000','#DBF');
			text({ctx:ctx,rect:[l+25,t+25,w,h],align:[0,-1],fontSize:24,text:obj._resetConfirm});
			
			t += 45+textHeight;
			var c = obj.left+obj.width/2;
			text({ctx:ctx,rect:[c-140,t,120,45],align:[0,0],fontSize:24,text:['Continue'],box:{type:'loose',color:'#9F9',borderColor:'#000',borderWidth:3,radius:5}});
			
			obj._cursorPos.push({buttonType:'taskQuestion-confirmcontinue',shape:'rect',dims:[c-140,t,120,45],cursor:draw.cursors.pointer,func:function() {
				var obj = draw.currCursor.obj;
				delete obj._resetConfirm;
				delete obj._mode;
				draw.taskQuestion.reset(obj);
			},obj:obj});
			
			text({ctx:ctx,rect:[c+20,t,120,45],align:[0,0],fontSize:24,text:['Cancel'],box:{type:'loose',color:'#F99',borderColor:'#000',borderWidth:3,radius:5}});
			obj._cursorPos.push({buttonType:'taskQuestion-confirmcancel',shape:'rect',dims:[c+20,t,120,45],cursor:draw.cursors.pointer,func:function() {
				var obj = draw.currCursor.obj;
				delete obj._resetConfirm;
				delete obj._mode;
				draw.taskQuestion.enable(obj);
				drawCanvasPaths();
			},obj:obj});
			return;
		}
		
		if (draw.mode === 'edit') {
			var w2 = obj.qNum < 10 ? 50 : 60;
			obj._cursorPos.push({shape:'rect',dims:[obj.left,obj.top,w2,50],cursor:draw.cursors.pointer,func:draw.taskEdit.sortTaskQuestions,obj:obj});
		}
		
		if (taskMode === 'pupil' || taskMode === 'Do Task') {
			if (questionMode === 'checking') {
				var w = 150;
				var h = 35;
				var l = obj.left+obj.width-160;
				var t = obj.top+obj.height+7.5;
				text({ctx:ctx,rect:[l,t,w,h],align:[1,0],fontSize:24,italic:true,color:'#666',text:['Checking...']});
			} else if (questionMode === 'checked') {
				if (arraySum(obj._partMarks) < arraySum(obj.partMarksMax)) {
					if (taskMode !== 'pupil' || un(draw.task.pupil) || un(draw.task.pupil.taskData) || draw.task.pupil.taskData.testMode !== 1) {
						var w = 95;
						var h = 35;
						var l = obj.left+obj.width-105;
						var t = obj.top+obj.height+7.5;
						text({ctx:ctx,rect:[l,t,w,h],align:[0,0],fontSize:24,text:['Retry'],box:{type:'loose',color:'#FC3',borderColor:'#000',borderWidth:2,radius:5}});
						
						obj._cursorPos.push({buttonType:'taskQuestion-retry',shape:'rect',dims:[l,t,w,h],cursor:draw.cursors.pointer,func:draw.taskQuestion.retry,obj:obj});
					}
				}
			} else {
				var w = 95;
				var h = 35;
				var l = obj.left+obj.width-105;
				var t = obj.top+obj.height+7.5;
				if (questionMode === 'none') {
					var txt = 'Check';
					if (taskMode === 'pupil' && !un(draw.task.pupil) && !un(draw.task.pupil.taskData) && draw.task.pupil.taskData.testMode === 1) txt = 'Submit';	
					text({ctx:ctx,rect:[l,t,w,h],align:[0,0],fontSize:24,text:[txt],box:{type:'loose',color:'#6F9',borderColor:'#000',borderWidth:2,radius:5}});
					obj._cursorPos.push({buttonType:'taskQuestion-check',shape:'rect',dims:[l,t,w,h],cursor:draw.cursors.pointer,func:draw.taskQuestion.check,obj:obj});
				}				
				if (true) { //(obj.buttons instanceof Array && obj.buttons.indexOf('reset') > -1) {
					l -= 105;
					text({ctx:ctx,rect:[l,t,w,h],align:[0,0],fontSize:24,text:['Reset'],box:{type:'loose',color:'#CCC',borderColor:'#000',borderWidth:2,radius:5}});
					obj._cursorPos.push({buttonType:'taskQuestion-reset',shape:'rect',dims:[l,t,w,h],cursor:draw.cursors.pointer,func:draw.taskQuestion.resetButtonPress,obj:obj});
				}
			}
		}
		if (taskMode === 'Review Pupil') {
			if (!un(draw.task.pupil)) {
				/*if (!un(obj._previousAnswers) && obj._hasPreviousAnswers === true) {
					if (un(obj._attempt)) obj._attempt = obj._previousAnswers.length+1;
					var t = obj.top+obj.height;
					
					var color = obj._attempt > 1 ? '#0FF' : '#CCC';
					draw.playButton.draw(ctx,{type:'playButton',left:obj.left+10,top:t+7.5,size:35,fillColor:color,direction:'left',borderWidth:3,radius:5},{});
					if (obj._attempt > 1) {
						obj._cursorPos.push({shape:'rect',dims:[obj.left+10,t+5,35,35],cursor:draw.cursors.pointer,func:draw.taskQuestion.viewAttemptNumberChange,obj:obj,diff:-1});
					}
					
					text({ctx:ctx,rect:[obj.left+50,t,170,50],align:[0,0],fontSize:24,text:['Attempt: '+obj._attempt+' / '+(obj._previousAnswers.length+1)]});

					var color = obj._attempt < obj._previousAnswers.length+1 ? '#0FF' : '#CCC';
					draw.playButton.draw(ctx,{type:'playButton',left:obj.left+227.5,top:t+7.5,size:35,fillColor:color,direction:'right',borderWidth:3,radius:5},{});
					if (obj._attempt < obj._previousAnswers.length+1) {
						obj._cursorPos.push({shape:'rect',dims:[obj.left+227.5,t+5,35,35],cursor:draw.cursors.pointer,func:draw.taskQuestion.viewAttemptNumberChange,obj:obj,diff:1});
					}
				}*/
				
				if (questionMode === 'none') {
					var w = obj.width/2;
					var h = 50;
					var l = obj.left+obj.width-20-w;
					var t = obj.top+obj.height;
					text({ctx:ctx,rect:[l,t,w,h],align:[1,0],fontSize:24,italic:true,color:'#666',text:['Answer not submitted']});
				}
			}
		}
		
		if (draw.mode === 'interact' && !un(obj._feedback)) {
			var hasFeedback = false;
			for (var c = 0; c < obj._cells.length; c++) {
				var txt = obj._feedback.part[c];
				if (un(txt) || txt === '' || txt === 0 || (txt instanceof Array && arraysEqual(txt,[""]))) continue;
				hasFeedback = true;
				break;
			}
			if (hasFeedback === true) {
				var w = 35;
				var h = 35;
				var l = obj.left+obj.width-150;
				var t = obj.top+obj.height+7.5;
				text({ctx:ctx,rect:[l,t,w,h],align:[0,0],font:'Hobo',fontSize:36,text:['!'],box:{type:'loose',color:'#F90',borderColor:'#000',borderWidth:2,radius:5}});
				
				obj._cursorPos.push({buttonType:'taskQuestion-feedbackToggle',shape:'rect',dims:[l,t,w,h],cursor:draw.cursors.pointer,func:draw.taskQuestion.feedbackToggle,obj:obj});
			}
		}
		
		if (taskMode === 'Review Class') {
			if (!un(draw.task.class) && !un(draw.task.class.questionData)) {
				var data = draw.task.class.questionData.find(function(x) {return x.taskQuestion.obj === obj;});
				if (!un(data) && !un(data.parts)) {					
					var pos = draw.taskQuestion.drawQuestionClassAnalysisBox(ctx,obj);
					if (pos instanceof Array) {
						obj._cursorPos = obj._cursorPos.concat(pos);
					}				
				}
			}
		}
		
		if ((draw.mode === 'interact' || obj._mode === 'addAnswers') && !un(obj._feedback)) {
			if (obj._feedback.show === true) {
				for (var c = 0; c < obj._cells.length; c++) {
					var txt = obj._feedback.part[c];
					if (un(txt) || txt === '' || txt === 0 || (txt instanceof Array && arraysEqual(txt,[""]))) continue;
					
					var cell = obj._cells[c];
					var cellWidth = obj.xPos[cell._c+1]-obj.xPos[cell._c];
					var cellHeight = obj.yPos[cell._r+1]-obj.yPos[cell._r];
					
					var measure = text({ctx:draw.hiddenCanvas.ctx,rect:[0,0,cellWidth-100,cellHeight-50],align:[0,0],fontSize:24,text:txt,box:{type:'loose',color:'#F90',borderColor:'#000',borderWidth:2,radius:5}});
					
					var rect = [obj.left+10,obj.yPos[cell._r+1]-10-measure.tightRect[3],measure.tightRect[2],measure.tightRect[3]]
					text({ctx:ctx,rect:rect,align:[0,0],fontSize:24,text:txt,box:{type:'loose',color:'#F90',borderColor:'#000',borderWidth:2,radius:5}});
					
					if (draw.mode === 'interact') obj._cursorPos.push({buttonType:'taskQuestion-feedbackToggle',shape:'rect',dims:rect,cursor:draw.cursors.pointer,func:draw.taskQuestion.feedbackToggle,obj:obj});
				}
			}
		}
	
		if (draw.mode === 'edit' && path.selected === true && selPaths().length === 1 && obj._showAnswersBox !== false) {			
			var cursorPos2 = draw.taskEdit.drawAnswersBox(ctx,obj,path);
			if (cursorPos2 instanceof Array) obj._cursorPos = obj._cursorPos.concat(cursorPos2);
		}
	},
	drawQuestionClassAnalysisBox: function(ctx,obj) {
		if (un(draw.task.class) || un(draw.task.class.questionData)) return;
		var data = draw.task.class.questionData.find(function(x) {return x.taskQuestion.obj === obj;});
		if (un(data)  || un(data.parts)) return;
		
		var cursorPositions = [];
		
		var part = data.parts[0];
		if (un(part)) return;
		var inputType = obj._cells[0]._inputType;
		
		if (['select','drag','vennDrag','dragOneOfManyToOne','dragPairThemUp','trueFalse'].indexOf(inputType) > -1 && obj.showHeatMap !== false) {
			draw.taskQuestion[inputType].drawHeatMap(ctx,obj,part.logsByAnswer);
		}
		
		text({
			ctx:ctx,rect:[obj.left+15,obj.top+obj.height,300,50],
			align:[-1,0],
			fontSize:24,
			color:'#00F',
			bold:true,
			text:[part.taskPupilsWithFullMarksCount+' / '+part.taskPupilsCount+'<<bold:false>> pupils correct']
		});
		
		if (obj._classTaskExpand !== true || part.logsByAnswer.length === 0) {
			
		} else {
			if (obj.useMarksTable === true || ['select','drag','dragOneOfManyToOne','dragPairThemUp','vennDrag','trueFalse'].indexOf(inputType) > -1 || (un(draw.taskQuestion[inputType]) && un(obj.answerToTableDisplay))) {
				if (un(part.logsByMarkTable)) {
					var data = part.logsByMark;
					var dataTable = {
						type:'dataTable',
						left: obj.left+20+220,
						top: obj.top+obj.height-10-240+50,
						rowHeight:35,
						fontSize:20,
						padding:10,
						titleRowColor:'#CCF',
						maxRowsView:4,
						columns:[{
							title:['Mark'],
							draw:function(ctx,rowData,rect) {
								if (rowData.notAnswered === true) return;
								var x = rect[0]+10;
								var y = rect[1]+0.5*rect[3];
								if (rowData.marks === rowData.marksMax) {
									drawTick(ctx, 20, 25, '#060', x, y-25/2, 3);
								} else if (rowData.marks === 0) {
									drawCross(ctx, 20, 25, '#F00', x, y-25/2, 3);
								} else {
									drawTick(ctx, 16, 20, '#060', x-2, y-15, 1.5);
									drawCross(ctx, 16, 20, '#F00', x+8, y-5, 1.5);
								}
								text({ctx:ctx,rect:[rect[0]+35,rect[1],rect[2]-35,rect[3]],text:['('+rowData.marks+'/'+rowData.marksMax+')'],align:[0,0],fontSize:20,color:rowData.colors.line});
							},
							getWidth:function(rowData) { 
								return 100;
							}
						},{
							title:['Freq.'],
							text:function(rowData) {
								return [String(rowData.freq)];
							}
						}],
						data:data,
						rowColor:function(rowData) {
							return rowData.colors.fill;
						},
						questionObj:obj
					}
					draw.dataTable.calcSize(dataTable);
					part.logsByMarkTable = dataTable;
					//console.log('logsByMarkTable',dataTable);
				}
				
				var dataTable = part.logsByMarkTable;
				var rect = [obj.left+10,obj.top+obj.height-10-240,255+dataTable._width+dataTable._scrollBarWidth,240];
				
				roundedRect2(ctx,rect[0],rect[1],rect[2],rect[3],5,3,'#00F','#CFF');
				
				text({ctx:ctx,rect:[rect[0]+10,rect[1],190,rect[3]],align:[0,0],fontSize:28,color:'#00F',bold:true,text:[part.taskPupilsWithFullMarksCount+' / '+part.taskPupilsCount+'<<fontSize:20>><<bold:false>>'+br+'pupils have'+br+'answered correctly'+br+br+'<<fontSize:24>><<bold:true>>'+part.taskPupilsByQuestionScore[0].freq+' / '+part.taskPupilsCount+'<<fontSize:20>><<italic:true>><<bold:false>>'+br+'on first attempt']});
				
				ctx.beginPath();
				ctx.strokeStyle = '#999';
				ctx.lineWidth = 1;
				ctx.moveTo(rect[0]+205,rect[1]+15);
				ctx.lineTo(rect[0]+205,rect[1]+rect[3]-15);
				ctx.stroke();
			
				dataTable.top = rect[1]+0.5*rect[3]-dataTable._height/2+40/2-5;
			
				text({ctx:ctx,rect:[dataTable.left,dataTable.top-40,dataTable._width+dataTable._scrollBarWidth,40],align:[0,0],fontSize:20,bold:true,color:'#000',text:['Pupils\' Marks']});
				
				draw.dataTable.draw(ctx,dataTable,{});
				if (dataTable.data.length > dataTable.maxRowsView && !un(dataTable._scrollObj)) {
					obj._scrollWheelPositions.push({
						shape:'rect',
						dims: [dataTable.left,dataTable.top,dataTable._width,dataTable._height],
						func: draw.taskQuestion.onScrollWheelDataTable,
						obj: obj,
						dataTable: dataTable,
						scrollObj: dataTable._scrollObj
					});
				}
				cursorPositions.push({shape:'rect',dims:rect,cursor:draw.cursors.default,overlay:true,zIndex:1});
				if (part.logsByMarkTable._cursorPos instanceof Array) {
					for (var c = 0; c < part.logsByMarkTable._cursorPos.length; c++) {
						var cursorPos = part.logsByMarkTable._cursorPos[c];
						cursorPos.overlay = true;
						cursorPos.zIndex = 2;
						cursorPositions.push(cursorPos);
					}
				}
			} else {
				if (un(part.logsByAnswerTable)) {
					var data = part.logsByAnswer.filter(function(x) {return x.notAnswered !== true;});
					var dataTable = {
						type:'dataTable',
						left: obj.left+20+220,
						top: obj.top+obj.height-10-240+50,
						rowHeight:35,
						fontSize:20,
						padding:10,
						titleRowColor:'#CCF',
						maxRowsView:4,
						columns:[{
							title:['Answer'],
							text:function(rowData) {
								if (un(rowData.tableDisplay)) rowData.tableDisplay = draw.taskQuestion.answerToTableDisplay(dataTable.questionObj,rowData.answerData);
								return rowData.tableDisplay;
								/*if (rowData.notAnswered === true) return ['<<italic:true>>-none-'];
								var obj = dataTable.questionObj;
								var inputType = obj._cells[0]._inputType;
								if (typeof obj.answerToTableDisplay === 'function') {
									return obj.answerToTableDisplay(obj,rowData.answerData);
								}
								if (!un(draw.taskQuestion[inputType].answerToTableDisplay)) {
									return draw.taskQuestion[inputType].answerToTableDisplay(obj._cells[0],rowData.answerData);
								}
								return [''];*/
							},
							maxWidth:200
						},{
							title:['Mark'],
							draw:function(ctx,rowData,rect) {
								if (rowData.notAnswered === true) return;
								var x = rect[0]+0.5*rect[2];
								var y = rect[1]+0.5*rect[3];
								if (rowData.marks === rowData.marksMax) {
									drawTick(ctx, 20, 25, '#060', x-10, y-25/2, 3);
								} else if (rowData.marks === 0) {
									drawCross(ctx, 20, 25, '#F00', x-10, y-25/2, 3);
								} else {
									drawTick(ctx, 16, 20, '#060', x-12, y-15, 1.5);
									drawCross(ctx, 16, 20, '#F00', x-2, y-5, 1.5);
								}
							},
							getWidth:function(rowData) { 
								return 40;
							}
						},{
							title:['Freq.'],
							text:function(rowData) {
								return [String(rowData.freq)];
							}
						}],
						data:data,
						rowColor:function(rowData) {
							return rowData.colors.fill;
						},
						questionObj:obj
					}
					draw.dataTable.calcSize(dataTable);
					part.logsByAnswerTable = dataTable;
					//console.log('logsByAnswerTable',dataTable);
				}
				
				var dataTable = part.logsByAnswerTable;
				var h = Math.max(240,dataTable._height+70);
				var rect = [obj.left+10,obj.top+obj.height-10-h,255+dataTable._width+dataTable._scrollBarWidth,h];
				
				roundedRect2(ctx,rect[0],rect[1],rect[2],rect[3],5,3,'#00F','#CFF');
				
				text({ctx:ctx,rect:[rect[0]+10,rect[1],190,rect[3]],align:[0,0],fontSize:28,color:'#00F',bold:true,text:[part.taskPupilsWithFullMarksCount+' / '+part.taskPupilsCount+'<<fontSize:20>><<bold:false>>'+br+'pupils have'+br+'answered correctly'+br+br+'<<fontSize:24>><<bold:true>>'+part.taskPupilsByQuestionScore[0].freq+' / '+part.taskPupilsCount+'<<fontSize:20>><<italic:true>><<bold:false>>'+br+'on first attempt']});
				
				ctx.beginPath();
				ctx.strokeStyle = '#999';
				ctx.lineWidth = 1;
				ctx.moveTo(rect[0]+205,rect[1]+15);
				ctx.lineTo(rect[0]+205,rect[1]+rect[3]-15);
				ctx.stroke();
			
				dataTable.top = rect[1]+0.5*rect[3]-dataTable._height/2+40/2-5;
			
				text({ctx:ctx,rect:[dataTable.left,dataTable.top-40,dataTable._width+dataTable._scrollBarWidth,40],align:[0,0],fontSize:20,bold:true,color:'#000',text:['Pupils\' Answers']});
				
				draw.dataTable.draw(ctx,dataTable,{});
				if (dataTable.data.length > dataTable.maxRowsView && !un(dataTable._scrollObj)) {
					obj._scrollWheelPositions.push({
						shape:'rect',
						dims: [dataTable.left,dataTable.top,dataTable._width,dataTable._height],
						func: draw.taskQuestion.onScrollWheelDataTable,
						obj: obj,
						dataTable: dataTable,
						scrollObj: dataTable._scrollObj
					});
				}
				cursorPositions.push({shape:'rect',dims:rect,cursor:draw.cursors.default,overlay:true,zIndex:1});
				if (part.logsByAnswerTable._cursorPos instanceof Array) {
					for (var c = 0; c < part.logsByAnswerTable._cursorPos.length; c++) {
						var cursorPos = part.logsByAnswerTable._cursorPos[c];
						cursorPos.overlay = true;
						cursorPos.zIndex = 2;
						cursorPositions.push(cursorPos);
					}
				}
			}
		}
		
		if (part.logsByAnswer.length > 0) {
			var color = obj._classTaskExpand !== true ? '#CFF' : '#FFF';
			var rect = [obj.left+obj.width-290, obj.top+obj.height+7, 110, 36];
			text({ctx:ctx,rect:rect,text:['Summary'],align:[0,0],fontSize:20,bold:true,color:'#00F',box:{type:'loose',color:color,radius:10,borderColor:'#00F',borderWidth:3}});
			cursorPositions.push({
				shape:'rect',
				dims:rect,
				cursor:draw.cursors.pointer,
				obj:obj,
				func:draw.taskQuestion.classTaskToggleExpand,
				path:null,
				interact:true
			});
		}
		var rect = [obj.left+obj.width-170, obj.top+obj.height+7, 160, 36];
		text({ctx:ctx,rect:rect,text:['View Answers'],align:[0,0],fontSize:20,bold:true,color:'#930',box:{type:'loose',color:'#FC9',radius:10,borderColor:'#930',borderWidth:3}});
		cursorPositions.push({
			shape:'rect',
			dims:rect,
			cursor:draw.cursors.pointer,
			obj:obj,
			func:draw.taskOverview.buttonClick,
			path:null,
			interact:true
		});

		return cursorPositions;
	},
	drawQuestionOverlayReviewMode: function(ctx,obj) {
		if (un(draw.task.class) || un(draw.task.class.questionData)) return;
		var data = draw.task.class.questionData.find(function(x) {return x.taskQuestion.obj === obj;});
		if (un(data) || un(data.parts) || un(data.parts[0])) return;
		var cursorPositions = [];
		var part = data.parts[0];
		
		
		
		return cursorPositions;
	},
	toggleQuestionTip:function() {
		var obj = draw.currCursor.obj;
		obj._showQuestionTip = !obj._showQuestionTip;
		for (var p = 0; p < obj._questionPaths.length; p++) {
			var path = obj._questionPaths[p];
			if (path.questionTip === true) {
				path._visible = obj._showQuestionTip;
			}
		}
		drawCanvasPaths();
	},

	getAriaText: function(obj) {
		obj.ctx = draw.hiddenCanvas.ctx;
		var cellTextMeasure = drawTable3(obj).cellTextMeasure;
		delete obj.ctx;
		
		var ariaText = [];
		var cell = obj.cells[0][0];
		if (typeof obj.qNum === 'number') ariaText.push('Question '+obj.qNum+'.');
				
		var lines = cellTextMeasure[0][0].lines;
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			line.text = textArrayToAriaText(line.text);
			if (line.text === '') continue;
			ariaText.push(line.text);
		}
		
		ariaText = ariaText.join(' ');
		ariaText = replaceAll(ariaText,'  ',' ');
		ariaText = replaceAll(ariaText,'  ',' ');
		ariaText = replaceAll(ariaText,'  ',' ');
		ariaText = ariaText.trim();
		if (ariaText.length > 0 && ['.',',','?','!',':',';'].indexOf(ariaText.slice(-1)) === -1) ariaText += '.';
		
		var objsText = [];
		for (var i = 0; i < obj._questionObjs.length; i++) {
			var obj2 = obj._questionObjs[i];
			if (un(draw[obj2.type]) || typeof draw[obj2.type].getAriaText !== 'function') continue;
			var objText = draw[obj2.type].getAriaText(obj2);
			if (objText.length === 1 && objText[0].text === '') continue;
			objsText = objsText.concat(objText);
		}
		objsText.sort(function(a,b) {
			if (Math.abs(a.rect[1] - b.rect[1]) > 20) return a.rect[1] - b.rect[1];
			return a.rect[0] - b.rect[0];
			return 0;
		});
		var objText = objsText.map(function(x) {return x.text;}).join(' ');
		if (objText.length > 0) {
			ariaText += ' '+objText;
		}
		
		return [{
			text:ariaText,
			rect:[obj.left,obj.top,obj.width,obj.height]
		}];
	},
	
	loadQuestion: function(obj) {
		if (obj._loadRequested === true) return;
		obj._loadRequested = true;
		
		var url = 'taskQuestions/'+obj.questionID+'.json';
		var xhr = new XMLHttpRequest();
		xhr.obj = obj;
		xhr.open("get", url, true);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function () {
			if (this.readyState === 4) {
				var response = this.responseText;
				try {
					response = draw.task.parse(response);
				} catch (err) {}
				var obj = this.obj;
				var savedObj = response.path.obj[0];
				for (var key in savedObj) {
					if (['left','top','width','height','xPos','yPos','widths','heights','qNum','questionID','type'].indexOf(key) > -1) continue;
					obj[key] = savedObj[key];
				}
				for (var p = 0; p < response.questionPaths.length; p++) {
					var path = response.questionPaths[p];
					repositionPath(path,obj.left,obj.top);
					if (obj._pageIndex === pIndex) {
						draw.path.push(path);
					} else {
						file.resources[resourceIndex].pages[obj._pageIndex].paths.push(path);
					}
				}
				delete obj._loaded;
				delete obj._loadRequested;
				if (obj._pageIndex === pIndex) drawCanvasPaths();
			}
		}
		xhr.onerror = function(error) {
			console.log(error);
			delete this.obj._loadRequested;
		}
		xhr.send();
		
	},

	getScrollWheelPositions: function(obj) {
		return !un(obj._scrollWheelPositions) ? obj._scrollWheelPositions : [];
		
	},
	onScrollWheelDataTable: function(pos,dy) {
		var scrollObj = pos.scrollObj;
		dy = Math.ceil(dy/250);
		scrollObj.value = Math.max(0,Math.min(scrollObj.scrollMax-scrollObj.scrollView,scrollObj.value+dy));
	},
	
	classTaskToggleExpand: function() {
		var obj = draw.currCursor.obj;
		if (un(obj._classTaskExpand)) obj._classTaskExpand = false;
		obj._classTaskExpand = !obj._classTaskExpand;
		drawCanvasPaths();
	},

	getRect: function(obj) {
		obj.width = arraySum(obj.widths);
		obj.height = arraySum(obj.heights);
		return [obj.left,obj.top,obj.width,obj.height+50];
	},
	
	dims: { // allowable dims
		left: [30,615],
		width: [555,1140],
		top: [30,235,440,645,850,1055,1260,1465],
		height: [330,535,740,945,1150,1355,1560]
	},
	changePosition: function(obj,dl,dt,dw,dh) {
		return;
	},
	getPageTaskLayout: function(paths) {
		if (un(paths)) paths = draw.path;
		var lefts = [30,615];
		var tops = [30,235,440,645,850,1055,1260,1465];
		
		var layout = [];
		for (var r = 0; r < 8; r++) {
			var row = [];
			for (var c = 0; c < 2; c++) {
				row.push({rect:[lefts[c],tops[r],555,125,lefts[c]+555,tops[r]+125],taskQuestions:[]});
			}
			layout.push(row);
		}
		
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			for (var o = 0; o < path.obj.length; o++) {
				var obj = path.obj[o];
				if (obj.type !== 'taskTitle' && obj.type !== 'taskQuestion') continue;
				var rect = draw[obj.type].getRect(obj);
				for (var r = 0; r < 8; r++) {
					for (var c = 0; c < 2; c++) {
						var region = layout[r][c];
						if (rect[0] <= region.rect[4] && rect[0]+rect[2] >= region.rect[0] && rect[1] <= region.rect[5] && rect[1]+rect[3] >= region.rect[1]) {
							region.taskQuestions.push(obj);
						}
						
					}
				}
			}
		}
		
		return layout;
		
	},
	getObjLayoutRegions: function(obj,layout) {
		if (un(layout)) layout = draw.taskQuestion.getPageTaskLayout();
		var rect = draw[obj.type].getRect(obj);
		var regions = [];
		for (var r = 0; r < 8; r++) {
			for (var c = 0; c < 2; c++) {
				var region = layout[r][c];
				if (rect[0] <= region.rect[4] && rect[0]+rect[2] >= region.rect[0] && rect[1] <= region.rect[5] && rect[1]+rect[3] >= region.rect[1]) {
					regions.push({r:r,c:c,region:region});
				}
				
			}
		}
		return regions;
	},
	getObjAdjacentRegions: function(obj) {
		var layout = draw.taskQuestion.getPageTaskLayout();
		var objRegions = draw.taskQuestion.getObjLayoutRegions(obj,layout);
		var minRow, maxRow, minCol, maxCol;
		for (var r = 0; r < objRegions.length; r++) {
			var region = objRegions[r];
			minRow = un(minRow) ? region.r : Math.min(region.r,minRow);
			maxRow = un(maxRow) ? region.r : Math.max(region.r,maxRow);
			minCol = un(minCol) ? region.c : Math.min(region.c,minCol);
			maxCol = un(maxCol) ? region.c : Math.max(region.c,maxCol);
		}
		var adjacent = {left:[],top:[],right:[],bottom:[],leftClear:true,rightClear:true,topClear:true,bottomClear:true,upToPrevPageClear:false,downToNextPageClear:false};
		if (minRow === 0) {
			adjacent.topClear = false;
			if (pIndex > 0) {
				var prevPage = file.resources[resourceIndex].pages[pIndex-1];
				var prevPageLayout = draw.taskQuestion.getPageTaskLayout(prevPage.paths);
				var col = obj.left < 400 ? 0 : 1;
				for (var r = prevPageLayout.length-1; r >= 0; r--) {
					var cell = prevPageLayout[r][col];
					if (typeof cell.taskQuestions === 'object' && cell.taskQuestions.length > 0) {
						break;
					} else {
						var availableHeight = 1590-cell.rect[1];
						if (availableHeight >= obj.heights[0]) {
							adjacent.upToPrevPageClear = true;
							adjacent.upToPrevPageTop = cell.rect[1];
							break;
						}
					}
				}
			}
		}
		if (maxRow === layout.length-1) {
			adjacent.bottomClear = false;
			if (pIndex < file.resources[resourceIndex].pages.length-1) {
				var nextPage = file.resources[resourceIndex].pages[pIndex+1];
				var nextPageLayout = draw.taskQuestion.getPageTaskLayout(nextPage.paths);
				var col = obj.left < 400 ? 0 : 1;
				for (var r = 0; r < nextPageLayout.length; r++) {
					var cell = nextPageLayout[r][col];
					if (typeof cell.taskQuestions === 'object' && cell.taskQuestions.length > 0) {
						break;
					} else {
						var availableHeight = cell.rect[1]-30;
						if (availableHeight >= obj.heights[0]) {
							adjacent.downToNextPageClear = true;
							adjacent.downToNextPageTop = 30;
							break;
						}
					}
				}
			}
		}
		for (var r = minRow; r <= maxRow; r++) {
			if (minCol > 0) {
				adjacent.left.push(layout[r][0]);
				if (layout[r][0].taskQuestions.length > 0) adjacent.leftClear = false;
			}
			if (maxCol < 1) {
				adjacent.right.push(layout[r][1]);
				if (layout[r][1].taskQuestions.length > 0) adjacent.rightClear = false;
			}
		}
		for (var c = minCol; c <= maxCol; c++) {
			if (minRow > 0) {
				adjacent.top.push(layout[minRow-1][c]);
				if (layout[minRow-1][c].taskQuestions.length > 0) adjacent.topClear = false;
			}
			if (maxRow < layout.length-1) {
				adjacent.bottom.push(layout[maxRow+1][c]);
				if (layout[maxRow+1][c].taskQuestions.length > 0) adjacent.bottomClear = false;
			}
		}
		return adjacent;
	},
	
	getButtons: function(x1,y1,x2,y2,pathNum) {
		if (!un(pathNum) && !un(draw.path[pathNum]) && draw.path[pathNum].obj[0].type == 'taskQuestion') {
			var obj = draw.path[pathNum].obj[0];
		} else {
			return [];
		}
		var buttons = [];
		
		buttons.push({buttonType:'text2-fracScale',shape:'rect',dims:[x1,y2-60,20,20],cursor:draw.cursors.pointer,func:draw.text2.setFracScale,pathNum:pathNum});
		buttons.push({buttonType:'text2-algPadding',shape:'rect',dims:[x1,y2-80,20,20],cursor:draw.cursors.pointer,func:draw.text2.setAlgPadding,pathNum:pathNum});
		
		if (!un(obj.xPos) && !un(obj.yPos)) {
			var xPos = obj.xPos;
			var yPos = obj.yPos;
			for (var r = 0; r < obj.cells.length; r++) {
				for (var c = 0; c < obj.cells[r].length; c++) {
					buttons.push({shape:'rect',dims:obj.cells[r][c].tightRect,cursor:draw.cursors.text,func:textEdit.tableSelectStart,pathNum:pathNum,obj:obj,cell:[r,c]});
				}
			}
		}
		var adjacent = draw.taskQuestion.getObjAdjacentRegions(obj);
		if (adjacent.leftClear === true) {
			buttons.push({shape:'rect',dims:[x1,(y1+y2)/2-10,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.movePos,dir:'left',obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#F90';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['◀'],rect:[l,t,w,h],fontSize:20,align:[0,0]});
			}});
		}
		if (adjacent.rightClear === true) {
			buttons.push({shape:'rect',dims:[x2-20,(y1+y2)/2,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.movePos,dir:'right',obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#F90';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['▶'],rect:[l,t,w,h],fontSize:20,align:[0,0]});
			}});
			buttons.push({shape:'rect',dims:[x2-20,(y1+y2)/2+20,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.expand,dir:'right',obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#FF0';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['+'],bold:true,rect:[l,t,w,h],fontSize:20,align:[0,0]});
			}});
		}
		if (obj.widths[0] > 555) {
			buttons.push({shape:'rect',dims:[x2-20,(y1+y2)/2-40,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.contract,dir:'left',obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#FF0';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['-'],bold:true,rect:[l,t,w,h],fontSize:20,align:[0,0]});
			}});
		}
		if (adjacent.topClear === true) {
			buttons.push({shape:'rect',dims:[(x1+x2)/2-10,y1,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.movePos,dir:'up',obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#F90';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['▲'],rect:[l,t,w,h],fontSize:20,align:[0,0]});
			}});
		} else if (adjacent.upToPrevPageClear === true) {
			buttons.push({shape:'rect',dims:[(x1+x2)/2-10,y1,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.movePos,dir:'prevPage',newTop:adjacent.upToPrevPageTop,obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#000';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['▲'],rect:[l,t,w,h],fontSize:20,align:[0,0],color:'#F90'});
			}});
			
		}
		if (adjacent.bottomClear === true) {
			buttons.push({shape:'rect',dims:[(x1+x2)/2-20,y2-20,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.movePos,dir:'down',obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#F90';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['▼'],rect:[l,t,w,h],fontSize:20,align:[0,0]});
			}});
			buttons.push({shape:'rect',dims:[(x1+x2)/2,y2-20,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.expand,dir:'down',obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#FF0';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['+'],bold:true,rect:[l,t,w,h],fontSize:20,align:[0,0]});
			}});
		} else if (adjacent.downToNextPageClear === true) {
			buttons.push({shape:'rect',dims:[(x1+x2)/2-20,y2-20,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.movePos,dir:'nextPage',newTop:adjacent.downToNextPageTop,obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#000';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['▼'],rect:[l,t,w,h],fontSize:20,align:[0,0],color:'#F90'});
			}});
		}
		if (obj.heights[0] > 330) {
			buttons.push({shape:'rect',dims:[(x1+x2)/2-40,y2-20,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.contract,dir:'up',obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#FF0';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['-'],bold:true,rect:[l,t,w,h],fontSize:20,align:[0,0]});
			}});
		}
		
		buttons.push({shape:'rect',dims:[x1+40,y2-20,200,20],cursor:draw.cursors.default,func:function() {},obj:obj,draw:function(path,ctx,l,t,w,h) {
			ctx.fillStyle = '#FF0';
			ctx.fillRect(l,t,w,h);
			text({ctx:ctx,text:['Question ID:  '+obj.questionID],rect:[l,t,w,h],fontSize:16,bold:true,align:[0,0]});
		}});
		
		var cell = obj._cell;
		if (!un(cell) && cell._inputIDsUnique === false) {
			buttons.push({shape:'rect',dims:[x2-440,y2-20,200,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.fixInputIDs,obj:obj,draw:function(path,ctx,l,t,w,h) {
				ctx.fillStyle = '#F00';
				ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:['Fix inputIDs'],rect:[l,t,w,h],fontSize:16,bold:true,align:[0,0],color:'#FFF'});
			}});
		}
		
		buttons.push({shape:'rect',dims:[x1+40,y1,250,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.toggleInputTypeSelect,obj:obj,pathNum:pathNum,draw:function(path,ctx,l,t,w,h) {
			var obj = path.obj[0];
			var cell = obj._cells[0];
			var inputType = draw.taskQuestion.getQuestionType(cell);
			ctx.fillStyle = inputType === 'none' ? '#F66' : '#3FF';
			ctx.fillRect(l,t,w,h);
			var color = inputType === 'none' ? '#FFF' : '#000';
			var txt = 'Input type: '+inputType;
			if (inputType === 'none') {
				if (obj._inputTypeSelectExpanded === true) {
					txt += '   ▲';
				} else {
					txt += '   ▼';
				}
			}
			text({ctx:ctx,text:[txt],rect:[l,t,w,h],fontSize:16,bold:true,align:[0,0],color:color});
		}});
		
		buttons.push({shape:'rect',dims:[x2-240,y1,200,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.editCustomCheckFunction,obj:obj,pathNum:pathNum,draw:function(path,ctx,l,t,w,h) {
			var obj = path.obj[0];
			ctx.fillStyle = typeof obj.customCheck === 'function' ? '#F99' : '#FEE';
			ctx.fillRect(l,t,w,h);
			var txt = typeof obj.customCheck === 'function' ? 'Check function <<font:algebra>>f(x)' : 'Add check function <<font:algebra>>f(x)';
			text({ctx:ctx,text:[txt],rect:[l,t,w,h],fontSize:16,italic:typeof obj.customCheck !== 'function',align:[0,0],color:'#000'});			
		}});
		if (typeof obj.customCheck === 'function') {
			buttons.push({shape:'rect',dims:[x2-60,y1,20,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.deleteCustomCheckFunction,obj:obj,pathNum:pathNum,draw:function(path,ctx,l,t,w,h) {
				//ctx.fillStyle = '#FFF';
				//ctx.fillRect(l,t,w,h);
				text({ctx:ctx,text:[times],rect:[l,t,w,h],fontSize:16,bold:true,align:[0,0],color:'#F00'});			
			}});
		}
		
		buttons.push({shape:'rect',dims:[x2-150,y2-20,150,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.setTaskQuestionButtons,obj:obj,pathNum:pathNum,draw:function(path,ctx,l,t,w,h) {
			var obj = path.obj[0];
			ctx.fillStyle = !un(obj.buttons) ? '#FF0' : '#EEE';
			ctx.fillRect(l,t,w,h);
			var txt = 'Question buttons';
			text({ctx:ctx,text:[txt],rect:[l,t,w,h],fontSize:16,italic:typeof obj.buttons !== 'object',align:[0,0],color:'#000'});			
		}});
		
		if (!un(obj._inputTypes) && obj._inputTypes.text instanceof Array) {
			buttons.push({shape:'rect',dims:[x2-320,y2-20,170,20],cursor:draw.cursors.pointer,func:draw.taskQuestion.setTaskQuestionKeys,obj:obj,pathNum:pathNum,draw:function(path,ctx,l,t,w,h) {
				var obj = path.obj[0];
				ctx.fillStyle = !un(obj.keys) ? '#6F6' : '#EEE';
				ctx.fillRect(l,t,w,h);
				var txt = typeof obj.keys === 'string' ? obj.keys : 'Keys: nums';
				text({ctx:ctx,text:[txt],rect:[l,t,w,h],fontSize:16,italic:typeof obj.keys !== 'string',align:[0,0],color:'#000'});			
			}});
		}
		
		if (!un(obj._cells) && !un(obj._cells[0])) {
			var cell = obj._cells[0];
			var inputType = draw.taskQuestion.getQuestionType(cell);
			if ((inputType === 'none' || inputType === '') && obj._inputTypeSelectExpanded === true) {
				for (var i = 0; i < draw.taskEdit.questionTemplates.length; i++) {
					buttons.push({shape:'rect',dims:[x1+40,y1+20+30*i,350,30],cursor:draw.cursors.pointer,func:draw.taskEdit.loadQuestionFromTemplateClick,obj:obj,inputType:draw.taskEdit.questionTemplates[i],pathNum:pathNum,draw:function(path,ctx,l,t,w,h) {
						var obj = path.obj[0];
						var cell = obj._cells[0];
						text({ctx:ctx,text:[this.inputType],rect:[l,t,w,h],fontSize:24,align:[0,0],box:{type:'loose',color:'#F99',borderColor:'#000',borderWidth:1}});
					}});
				}
			}
		}
		
		return buttons;
	},
	drawButton: function (ctx, size) {
		text({ctx:ctx,rect:[0.2*size,0.2*size,0.6*size,0.6*size],align:[0,0],fontSize:0.5*size,text:['Q'],box:{type:'loose',borderColor:'#000'}});
	},

	setTaskQuestionButtons: function() {
		var obj = draw.currCursor.obj;
		var prefill = !un(obj.buttons) ? obj.buttons.join(',') : 'frac';
		var buttons = prompt('Enter task question button(s) as list: eg. reset,frac,pow,sqrt,root,squared,cubed',prefill);
		if (typeof buttons !== 'string') return;
		buttons = buttons.replace(/\s/g, '').toLowerCase();
		buttons = buttons.split(',');
		for (var b = 0; b < buttons.length; b++) {
			if (['reset','frac','pow','sqrt','root','squared','cubed'].indexOf(buttons[b]) === -1) {
				buttons.splice(b,1);
				b--;
			}
		}
		if (buttons.length > 0) {
			obj.buttons = buttons;
		} else {
			delete obj.buttons;
		}
		drawCanvasPaths();
	},
	setTaskQuestionKeys:function() {
		var obj = draw.currCursor.obj;
		var prefill = !un(obj.keys) ? obj.keys : '';
		var keys = prompt('Enter task question key(s) for taskApp, excluding digits. Eg. ".,{frac}{pow}+-{times}" ',prefill);
		if (typeof keys !== 'string') return;
		if (keys === '') {
			delete obj.keys;
		} else {
			obj.keys = keys;
		}
		updateBorder(obj._path);
		drawCanvasPaths();
	},
	
	clone:function(obj) {
		delete obj.questionID;
		delete obj._path;
		delete obj._cells;
		delete obj._answers;
		draw.taskEdit.getNewQuestionID(function(questionID,obj) {
			obj.questionID = questionID;
			draw.taskEdit.updateQuestionData(obj);
			draw.taskEdit.sortTaskQuestions();
		}, obj);
	},	
	
	movePos: function() {
		var obj = draw.currCursor.obj;
		var dir = draw.currCursor.dir;
		var dx = dir === 'left' ? 30-obj.left : dir === 'right' ? 615-obj.left : 0;
		var dy = dir === 'up' ? -205 : dir === 'down' ? 205 : dir === 'prevPage' ? draw.currCursor.newTop-obj.top : dir === 'nextPage' ? draw.currCursor.newTop-obj.top : 0;
		obj.left += dx;
		obj.top += dy;
		for (var c = 0; c < obj._cells.length; c++) {
			var paths = obj._cells[c]._paths;
			for (var p = 0; p < paths.length; p++) {
				var path = paths[p];
				repositionPath(path,dx,dy);
			}
		}
		if (dir === 'prevPage' || dir === 'nextPage') {
			var pageIndex = dir === 'prevPage' ? pIndex-1 : pIndex+1;
			var adjacentPage = file.resources[resourceIndex].pages[pageIndex];

			var path = obj._path;
			adjacentPage.paths.push(path);
			path.selected = false;
			var index = paths.indexOf(path);
			if (index > -1) paths.splice(index,1);
			
			for (var c = 0; c < obj._cells.length; c++) {
				var paths = obj._cells[c]._paths;
				for (var p = 0; p < paths.length; p++) {
					var path = paths[p];
					adjacentPage.paths.push(path);
					path.selected = false;
					var index = paths.indexOf(path);
					if (index > -1) paths.splice(index,1);
				}
			}
			deselectAllPaths();
		}
		updateBorder(obj._path);
		drawCanvasPaths();
	},
	expand: function() {
		var obj = draw.currCursor.obj;
		var dir = draw.currCursor.dir;
		if (dir === 'right') {
			obj.widths[0] += 1140-555;
		} else if (dir === 'down') {
			obj.heights[0] += 205;
		}
		updateBorder(obj._path);
		drawCanvasPaths();
	},
	contract: function() {
		var obj = draw.currCursor.obj;
		var dir = draw.currCursor.dir;
		if (dir === 'left') {
			obj.widths[0] -= (1140-555);
		} else if (dir === 'up') {
			obj.heights[0] -= 205;
		}
		updateBorder(obj._path);
		drawCanvasPaths();
	},

	getCells: function(obj) {
		obj._cells = [];
		if (un(obj.cells)) return [];
		for (var r = 0; r < obj.cells.length; r++) {
			for (var c = 0; c < obj.cells[r].length; c++) {
				obj._cells.push(obj.cells[r][c]);
			}
		}
		return obj._cells;
	},
	
	getQuestionParentPaths: function(obj) {
		if (obj._parentPaths instanceof Array) return obj._parentPaths;
		var pageNum = !un(obj._pageIndex) ? obj._pageIndex : !un(obj._pageNum) ? obj._pageNum : pIndex;
		if (pageNum === pIndex) {
			var paths = draw.path;
		} else {
			var page = file.resources[resourceIndex].pages[pageNum];
			var paths = page.paths;
			//if (!un(page.pen)) paths = paths.concat(page.pen);
		}
		return paths;
	},
	getPaths: function(obj,paths) {
		if (un(obj)) obj = sel();
		if (un(obj)) return;
		if (un(paths)) paths = draw.taskQuestion.getQuestionParentPaths(obj);
		draw.updateAllBorders(paths);		
		var cells = draw.taskQuestion.getCells(obj);
		
		obj.xPos = [obj.left];
		for (var i = 0; i < obj.widths.length; i++) {
			obj.xPos.push(obj.xPos.last() + obj.widths[i])
		}
		obj.yPos = [obj.top];
		for (var i = 0; i < obj.heights.length; i++) {
			obj.yPos.push(obj.yPos.last() + obj.heights[i])
		}

		var cell = obj.cells[0][0];
		obj._cell = cell;
		cell._obj = obj;
		var inputIDs = [];
		var left = obj.xPos[0];
		var right = obj.xPos[1];
		var top = obj.yPos[0];
		var bottom = obj.yPos[1];
		
		//console.log(left,right,top,bottom,paths);
		
		obj._questionPaths = [];
		obj._questionPathsByID = {};
		obj._questionObjsByID = {};
		obj._questionObjs = [];
		cell._paths = [];
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			if (path.obj.length == 1 && path.obj[0].type == 'taskQuestion') continue;		
			var pathInTaskQuestion = false;
			if (path.obj.length == 1 && !un(path.obj[0]._created)) {
				if (path.obj[0]._taskQuestion === obj) pathInTaskQuestion = true;
			} else {
				if (path._center[0] >= left && path._center[0] <= right && path._center[1] >= top && path._center[1] <= bottom) pathInTaskQuestion = true;
			}
			if (pathInTaskQuestion === true) {
				cell._paths.push(path);
				if (!un(path.id)) obj._questionPathsByID[path.id] = path;
				path._taskQuestion = obj;
				path._taskQuestionCell = cell;
				path._qObj = obj;
				path._qObjPart = cell;
				obj._questionPaths.push(path);
				for (var o = 0; o < path.obj.length; o++) {
					var obj2 = path.obj[0];
					if (!un(obj2.id)) obj._questionObjsByID[obj2.id] = obj2;
					obj2._taskQuestion = obj;
					obj._questionObjs.push(obj2);
					obj2._path = path;
				}
			}
		}
		
		var inputs = draw.taskQuestion.getPathsInputTypes(obj._questionPaths);
		cell._inputs = inputs.inputs;
		cell._inputTypes = inputs.inputTypes;
		
		cell._inputIDs = [];
		cell._inputIDsUnique = true;
		for (var i = 0; i < cell._inputs.length; i++) {
			var path = cell._inputs[i];
			if (!un(path.inputID)) {
				if (cell._inputIDs.indexOf(path.inputID) > -1) cell._inputIDsUnique = false;
				cell._inputIDs.push(path.inputID);
			}
		}
		for (var i = 0; i < cell._inputs.length; i++) {
			var path = cell._inputs[i];
			if (un(path.inputID)) {
				var id = 0;
				while (cell._inputIDs.indexOf(id) > -1) id++;
				path.inputID = id;
				cell._inputIDs.push(id);
			}
		}
		cell._inputType = draw.taskQuestion.getQuestionType(cell);
		
		obj._inputs = cell._inputs;
		obj._inputTypes = cell._inputTypes;
		obj._inputIDs = cell._inputIDs;
		obj._inputIDsUnique = cell._inputIDsUnique;
		obj._questionType = cell._inputType;
	},
	getPathsInputTypes: function(paths) { // also applies to starterQuestion
		var inputs = [];
		var inputTypes = {};
		for (var p = 0; p < paths.length; p++) {
			var path = paths[p];
			if (path.obj.length == 1 && ['taskQuestion','starterQuestion'].indexOf(path.obj[0].type) > -1) continue;
			var pathInputType = 'none';
			for (var o = 0; o < path.obj.length; o++) {
				var obj2 = path.obj[0];
				if (['buttonLine','buttonPoint','buttonPen','compass2','protractor2','ruler2'].indexOf(obj2.type) > -1) pathInputType = 'drawTools';
				if (!un(obj2.interact)) {
					if (['text','select','trueFalse'].indexOf(obj2.interact.type) > -1) {
						pathInputType = obj2.interact.type;
					} else if (obj2.type === 'slider') {
						pathInputType = 'slider';
					} else if (obj2.type === 'hexagonalLattice') {
						pathInputType = 'hexagonalLattice';
					} else if (obj2.type === 'pieChart2') {
						pathInputType = 'pieChart';
					} else if (obj2.type === 'grid' && ['plot','line','lineSegment'].indexOf(obj2.interact.startMode) > -1) {
						pathInputType = 'grid';
					} else if (obj2.type === 'vennDiagram2' && obj2.interact.type === 'venn2DragArea') {
						pathInputType = 'venn2DragArea';
					} else if (obj2.type === 'vennDiagram3' && obj2.interact.type === 'venn3DragArea') {
						pathInputType = 'venn3DragArea';
					}
				}
			}
			if (pathInputType !== 'none') {
				path._inputType = pathInputType;
				if (un(inputTypes[pathInputType])) inputTypes[pathInputType] = [];
				inputTypes[pathInputType].push(path);
				inputs.push(path);
			} else if (!un(path.isInput) && path.isInput.type !== 'none') {
				inputs.push(path);
				if (un(inputTypes[path.isInput.type])) inputTypes[path.isInput.type] = [];
				inputTypes[path.isInput.type].push(path);
				for (var o = 0; o < path.obj.length; o++) path.obj[o]._path = path;
				if (path.isInput.type === 'select') {
					var obj2 = path.obj[0];
					var selectCells = obj2.cells;
					var cellIDs = [];
					for (var r2 = 0; r2 < selectCells.length; r2++) {
						for (var c2 = 0; c2 < selectCells[r2].length; c2++) {
							var selectCell = selectCells[r2][c2];
							if (!un(selectCell.cellID)) cellIDs.push(selectCell.cellID);
						}
					}
					for (var r2 = 0; r2 < selectCells.length; r2++) {
						for (var c2 = 0; c2 < selectCells[r2].length; c2++) {
							var selectCell = selectCells[r2][c2];
							if (un(selectCell.cellID)) {
								var ID = 0;
								while (cellIDs.indexOf(ID) > -1) ID++
								selectCell.cellID = ID;
								cellIDs.push(ID);
							}
						}
					}
				}
			} else if (!un(path.interact) && (path.interact.type === 'drag' || path.interact.draggable === true)) {
				inputs.push(path);
				if (un(inputTypes['drag'])) inputTypes['drag'] = [];
				inputTypes['drag'].push(path);
				for (var o = 0; o < path.obj.length; o++) path.obj[o]._path = path;
				if (!un(path._taskQuestion) && un(path._taskQuestionDragPathStartOrder)) path._taskQuestionDragPathStartOrder = p;
				if (un(path._initialPos) && !un(path.tightBorder)) path._initialPos = [path.tightBorder[0],path.tightBorder[1]];
			} else if (!un(path.interact) && path.interact.type === 'dragArea') {
				inputs.push(path);
				if (un(inputTypes['dragArea'])) inputTypes[path.interact.type] = [];
				inputTypes['dragArea'].push(path);
				for (var o = 0; o < path.obj.length; o++) path.obj[o]._path = path;
			}
		}
		return {inputs:inputs,inputTypes:inputTypes};
	},
	fixInputIDs: function(obj) {
		if (un(obj)) obj = draw.currCursor.obj;
		draw.taskQuestion.getPaths(obj);
		
		var cell = obj._cell;
		cell._inputIDs = [];
		cell._inputIDsUnique = true;
		for (var i = 0; i < cell._inputs.length; i++) {
			var path = cell._inputs[i];
			if (!un(path.inputID)) {
				if (cell._inputIDs.indexOf(path.inputID) > -1) {
					delete path.inputID;
				} else {
					cell._inputIDs.push(path.inputID);
				}
			}
		}
		for (var i = 0; i < cell._inputs.length; i++) {
			var path = cell._inputs[i];
			if (un(path.inputID)) {
				var id = 0;
				while (cell._inputIDs.indexOf(id) > -1) id++;
				path.inputID = id;
				cell._inputIDs.push(id);
			}
		}
		console.log(obj);
		drawCanvasPaths();
	},
	getQuestionMeta: function(cell) {
		var type = draw.taskQuestion.getQuestionType(cell);
		if (type !== '' && !un(draw.taskQuestion[type]) && !un(draw.taskQuestion[type].getMeta)) {
			var meta = draw.taskQuestion[type].getMeta(cell);
			meta.type = type;
			return meta;
		} else {
			return {type:type};
		}
	},
	getQuestionType: function(cell) { // also applies to starterQuestion
		if (un(cell._inputs)) return 'none';
		if (cell._inputs.length === 1) {
			var path = cell._inputs[0];
			if (path._inputType === 'text') return 'text';
			if (path._inputType === 'select') return 'select';
			if (path._inputType === 'grid') return 'grid';
		}
		var types = [];
		for (var key in cell._inputTypes) {
			if (cell._inputTypes.hasOwnProperty(key) === false) continue;
			if (types.indexOf(key) === -1) types.push(key);
		}
		if (types.length === 1 && types[0] === 'trueFalse') return 'trueFalse';
		if (types.length === 1 && types[0] === 'text') return 'multipleText';
		if (types.length === 1 && types[0] === 'drawTools') return 'drawTools';
		if (types.length === 2 && types.indexOf('drag') > -1 && types.indexOf('dragArea') > -1) {
			var dragQuestionType = draw.taskQuestion.drag.getDragQuestionType(cell);
			return dragQuestionType === 'oneOfManyToOne' ? 'dragOneOfManyToOne' : dragQuestionType === 'pairThemUp' ? 'dragPairThemUp' : 'drag'; 
		}
		if (types.length === 2 && types.indexOf('drag') > -1 && types.indexOf('venn2DragArea') > -1) return 'vennDrag';
		if (types.length === 2 && types.indexOf('drag') > -1 && types.indexOf('venn3DragArea') > -1) return 'vennDrag';
		if (types.length > 1 || (types.length === 1 && cell._inputs.length > 1)) return 'mixed';
		//if (!un(cell._inputTypes.text) && cell._inputs.length > 1) return 'multipleText';
		//if (!un(cell._inputTypes.drag) && cell._inputTypes.drag.length > 0) return 'drag';
		return 'none';
	},
	initialise: function(obj) {
		obj._marksMax = 0;
		obj._marksScored = 0;
		var questionPartMarksMaxData = [];
		if (!un(obj.state)) obj.state = !un(obj.initialState) ? obj.initialState : '';
		if (!un(draw.task.questions)) {
			for (var i = 0; i < draw.task.questions.length; i++) {
				var data = draw.task.questions[i];
				if (data.questionID === obj.questionID) {
					questionPartMarksMaxData[data.questionPart] = data.marksMax;
				}
			}
		}
		var cells = draw.taskQuestion.getCells(obj);
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			if (!un(questionPartMarksMaxData[c])) cell.marksMax = questionPartMarksMaxData[c];
			if (!un(cell.marksMax)) obj._marksMax += cell.marksMax;
			if (!un(cell._marksScored)) obj._marksScored += cell._marksScored;
		}
		if (draw.task.taskID > -1 && !un(draw.task.pupilID)) {
			var saveData = false;
			for (var s = 0; s < draw.task.saveData.length; s++) {
				if (draw.task.saveData[s].questionID === obj.questionID) {
					saveData = draw.task.saveData[s];
					break;
				}
			}
			if (saveData !== false) {
				draw.taskQuestion.restoreSaveData(obj,saveData);
			} else {
				draw.taskQuestion.reset(obj);
			}
		} else {
			draw.taskQuestion.reset(obj);
		}
	},
	getSaveData: function(obj) { // deprecated
		var feedback = !un(obj._feedback) && !un(obj._feedback.part) ? obj._feedback.part : [];
		var data = {
			questionID:obj.questionID,
			partMarks:obj._partMarks || [],
			partFeedback:feedback,
			attempts:obj._attempts || 0,
			mode:obj._mode || "none"
		};
		
		var cells = draw.taskQuestion.getCells(obj);
		var saveData = [];
		var blankPartCount = 0;
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			if (typeof obj.getSaveData === 'function') {
				var partData = obj.getSaveData(obj);
			} else {
				if (un(cell._inputType) || un(draw.taskQuestion[cell._inputType]) || un(draw.taskQuestion[cell._inputType].getSaveData)) continue;
				var partData = draw.taskQuestion[cell._inputType].getSaveData(cell);
			}
			if (partData.blank === true) blankPartCount++;
			saveData.push(partData);
		};
		data.saveData = saveData;
		data.blank = blankPartCount === cells.length;
		//console.log('saveData',data);
		return data;
	},
	restoreSaveData: function(obj,data) { // deprecated
		obj._partMarks = data.partMarks;
		var partFeedback = data.partFeedback;
		obj._attempts = data.attempts;
		obj._mode = data.mode === 'checked' ? 'checked' : 'none';
		
		//console.log('restore question state',obj,data);
		
		if (data.blank === true) {
			draw.taskQuestion.reset(obj);
			return;
		}
		
		var cells = draw.taskQuestion.getCells(obj);
		draw.taskQuestion.getPaths(obj);
		var saveData = data.saveData;
		
		var feedback = false;
		for (var c = 0; c < cells.length; c++) {
			if (!un(partFeedback) && !un(partFeedback[c]) && partFeedback[c] !== "" && arraysEqual(partFeedback[c],[""]) === false) {
				feedback = true;
			}
			var cell = cells[c];
			if (saveData[c] === false || un(saveData[c]) || typeof saveData[c] !== 'object') {
				if (typeof obj.reset === 'function') {
					obj.reset(obj);
				} else if (!un(draw.taskQuestion[cell._inputType]) && typeof draw.taskQuestion[cell._inputType].reset === 'function') {
					draw.taskQuestion[cell._inputType].reset(cell);
				}
				continue;
			}
			if (un(cell._inputType) || un(draw.taskQuestion[cell._inputType]) || un(draw.taskQuestion[cell._inputType].getSaveData)) continue;
			//console.log('restore save data',cell,saveData[c]);
			cell._pageIndex = obj._pageIndex;
			cell._parentPaths = obj._parentPaths;
			if (typeof obj.restoreSaveData === 'function') {
				obj.restoreSaveData(obj,saveData[c]);
			} else {
				draw.taskQuestion[cell._inputType].restoreSaveData(cell,saveData[c]);
			}
		}
		if (feedback === true) {
			obj._feedback = {show:true,part:partFeedback};
		} else {
			delete obj._feedback;
		}
		if (obj._mode === 'checked') {
			draw.taskQuestion.disable(obj);
		}
	},
	getAnswer: function(obj) {
		var cells = draw.taskQuestion.getCells(obj);
		var data = [];
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			if (typeof obj.getAnswer === 'function') {
				var partData = obj.getAnswer(obj);
			} else {
				var partData = draw.taskQuestion[cell._inputType].getAnswer(cell);
			}
			data.push(partData);
		};
		obj._answer = data;
		//console.log('answer',data);
		return data;
	},
	restoreAnswer: function(obj,answer) {
		draw.taskQuestion.getPaths(obj);
		if (typeof obj.restoreAnswer === 'function') {
			obj.restoreAnswer(obj,answerData);
		} else {
			var cells = draw.taskQuestion.getCells(obj);
			var cell = cells[0];
			draw.taskQuestion[cell._inputType].restoreAnswer(cell,answer);
		}
		/*
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			var answerData = answer[c];
			console.log(answerData);
			cell._pageIndex = obj._pageIndex;
			if (answerData === false) {
				draw.taskQuestion[cell._inputType].reset(cell);
				continue;
			}
			
		};*/
	},
	getInputByInputID: function(cell,inputID) {
		for (var i = 0; i < cell._inputs.length; i++) {
			if (cell._inputs[i].inputID === inputID) return cell._inputs[i];
		}
		return false;
	},
	toggleInputTypeSelect: function() {
		var obj = draw.currCursor.obj;
		if (un(obj._inputTypeSelectExpanded)) obj._inputTypeSelectExpanded = false;
		obj._inputTypeSelectExpanded = !obj._inputTypeSelectExpanded;
		updateBorder(obj._path);
		drawCanvasPaths();
	},
	getAnswerTableDisplay: function(obj,answerData) {
		if (answerData.blank === true) return ['<<italic:true>>-none-'];
		var inputType = obj._cells[0]._inputType;
		/*if (typeof obj.answerToTableDisplay === 'function') {
			return obj.answerToTableDisplay(obj,answerData);
		}*/
		if (!un(draw.taskQuestion[inputType]) && !un(draw.taskQuestion[inputType].answerToTableDisplay)) {
			return draw.taskQuestion[inputType].answerToTableDisplay(obj._cells[0],answerData);
		}
		return [''];
	},

	viewAttemptNumberChange: function() {
		var obj = draw.currCursor.obj;
		var diff = draw.currCursor.diff;
		var attempt = obj._attempt+diff;
		if (attempt < 1 || attempt > obj._previousAnswers.length+1) return;
		if (attempt === obj._previousAnswers.length+1) {
			//console.log(attempt,obj._saveData);
			draw.taskQuestion.restoreSaveData(obj,obj._saveData);
		} else {
			//console.log(attempt,obj._previousAnswers[attempt-1].saveData);
			draw.taskQuestion.restoreSaveData(obj,obj._previousAnswers[attempt-1].saveData);
		}
		obj._attempt = attempt;
		draw.taskQuestion.disable(obj);
		drawCanvasPaths();
	},

	check: function(obj) {
		if (un(obj)) obj = draw.currCursor.obj;
		draw.taskQuestion.getPaths(obj);
		draw.taskQuestion.disable(obj);
		changeDrawMode();
		var answer = draw.taskQuestion.getAnswer(obj);
		
		if (!un(obj._confirm)) {
			//console.log(obj);
			delete obj._confirm;
		} else {
			var blanks = 0;
			for (var c = 0; c < answer.length; c++) {
				if (answer[c].blank === true) blanks++;
			}
			if (blanks > 0) {
				draw.movePathToFront(obj._path);
				obj._confirm = ['You have not completed this question. Are you sure you want to submit your answer?'];
				obj._mode = 'confirming';
				drawCanvasPaths();
				return;
			}
		}
		
		var questionType = draw.taskQuestion.getQuestionType(obj._cells[0]);
		var sessionTime = draw.task.getSessionTime();
		
		if (un(obj._attempts)) obj._attempts = 0;		
		var taskID = draw.task.taskID || -1;
		
		var progress = draw.task.getProgress();
		var taskMarksOtherQuestions = 0;
		for (var q = 0; q < progress.questions.length; q++) {
			if (progress.questions[q].questionID === obj.questionID) continue;
			taskMarksOtherQuestions += progress.questions[q].marks;
		}
		
		var testComplete = progress.testComplete;
		if (progress.testMode === 1 && progress.attempted+1 >= progress.questions.length) testComplete = 1;
		
		var data = {
			//answer:answer,
			pID:userInfo.pID,
			wS:userInfo.wholeSchool,
			tID:taskID,
			qID:obj.questionID,
			att:obj._attempts+1,
			inp:[],
			sec:sessionTime.taskDurationInSeconds,
			min:sessionTime.taskDurationInMinutes,
			tC:testComplete,
			mMax:progress.marksMax,
			mOth:taskMarksOtherQuestions,
			m:0,
			fb:'',
			answerDescription:'',
			st:!un(obj.state) ? String(obj.state) : ''
		}
		
		if (questionType === 'text') { // answerDescription OFF
			data.answerDescription = textArrayCompress(answer[0].text);
		} else if (questionType === 'multipleText') {
			if (!un(answer)  && !un(answer[0]) && answer[0].text instanceof Array) {
				for (var t = 0; t < answer[0].text.length; t++) {
					var txt = textArrayCompress(answer[0].text[t]);
					if (data.answerDescription.length > 0) data.answerDescription += ' | ';			
					data.answerDescription += txt;
				}
			} else if (!un(answer)  && !un(answer[0]) && answer[0].lines instanceof Array) {
				for (var t = 0; t < answer[0].lines.length; t++) {
					var txt = textArrayCompress(answer[0].lines[t]);
					if (data.answerDescription.length > 0) data.answerDescription += ' | ';			
					data.answerDescription += txt;
				}
			}
		}
		var checking = false;
		if (typeof obj.customCheck === 'function') {
			var inputValues = draw.taskQuestion.getQuestionInputValues(obj);
			checking = obj.customCheck(obj,inputValues,obj.partMarksMax[0]);
		} else if (typeof obj.check === 'function') {
			checking = obj.check(obj, answer);
		} else if (questionType === 'multipleText' && obj.workingLinesCheck === true && typeof obj.target === 'object') {
			checking = draw.taskQuestion.multipleText.workingLinesCheck(obj);																																					 
		} else if (!un(draw.taskQuestion[questionType]) && typeof draw.taskQuestion[questionType].check === 'function') {
			checking = draw.taskQuestion[questionType].check(obj,answer);
		}
		if (typeof checking === 'object') {
			if (typeof checking.marks === 'number') data.m = checking.marks;
			if (!un(checking.feedback)) data.fb = textArrayCompress(checking.feedback);
			if (!un(checking.answerDescription)) { // answerDescription OFF
				data.answerDescription = textArrayCompress(checking.answerDescription);
			} else if (!un(checking.description)) {
				data.answerDescription = textArrayCompress(checking.description);
			}
		} else {
			if (questionType === 'text') {
				data.dbCheck = ['text',data.answerDescription];
			} else if (questionType === 'grid') {
				if (!un(answer) && !un(answer[0]) && !un(answer[0].path)) {
					var gridPaths = answer[0].path;
					if (gridPaths.length === 1 && !un(gridPaths[0])) {
						var gridPath = gridPaths[0];
						if (gridPath.type === 'point') {
							data.dbCheck = ['gridPoint',gridPath.pos[0]*1000,gridPath.pos[1]*1000];
							data.answerDescription = '('+gridPath.pos[0]+', '+gridPath.pos[1]+')';
						} else if (gridPath.type === 'line') {
							data.dbCheck = ['gridLine',gridPath.pos[0][0]*1000,gridPath.pos[0][1]*1000,gridPath.pos[1][0]*1000,gridPath.pos[1][1]*1000];
							data.answerDescription = textArrayCompress(draw.taskQuestion.grid.getEquationOfLine(gridPath.pos));
						}
					}
				}
			}
		}

		data.inp = draw.taskQuestion.getInputsSaveData(obj);
		
		delete data.answerDescription; // OFF
		if (draw.task.logging === true) console.log('checkQuestion data:',data);
		//console.log('questionType:',questionType);
		//console.log('obj:',obj);
		//console.log('saveInputsData:',data.inp);
		//console.log('checkQuestion data:',data);
		
		var xmlHttpCheck = new XMLHttpRequest();
		xmlHttpCheck.log = ['send data',data];
		xmlHttpCheck.mytimeoutfunc = setTimeout(function() {
			//console.log('timeout');
			xmlHttpCheck.log.push(['timeout']);
			xmlHttpCheck.abort();
			xmlHttpCheck.errorHandler();
		}, 5000);
		xmlHttpCheck.errorHandler = function(e) {
			xmlHttpCheck.log.push(['errorHandler']);
			clearTimeout(this.mytimeoutfunc);
			var obj = this.obj;
			obj._mode = 'errorHoldChecking';
			drawCanvasPaths();
			Notifier.error('Error connecting to the server. Please try again shortly...');
			setTimeout(function() {
				//console.log('allow check again',obj);
				obj._mode = 'none';
				drawCanvasPaths();
			},3000);
			draw.taskQuestion.enable(obj);
			//console.log('error - xmlHttpCheck.log',xmlHttpCheck.log);
		};
		xmlHttpCheck.obj = obj;
		xmlHttpCheck.open("post", "/i2/task/interact_checkQuestion11.php", true);
		xmlHttpCheck.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlHttpCheck.onerror = function() {
			//console.log('onerror');
			xmlHttpCheck.log.push(['onerror']);
			this.errorHandler();
		};
		xmlHttpCheck.onreadystatechange = function() {
			this.log.push(['readyState',this.readyState,'status',this.status]);
			//console.log(this.readyState,this.status);
			if (this.readyState !== 4) return;
			if (this.status !== 200) {
				this.log.push(['responseText',this.responseText]);
				//console.log(this.readyState,this.status,this.responseText);
				console.log('xmlHttpCheck',this);
				this.errorHandler();
				return;
			}
			
			this.log.push(['responseText',this.responseText]);
			
			if (draw.task.logging === true) console.log('checkQuestion log:',this.log);
			//console.log('checkQuestion log:',this.log);
			
			clearTimeout(this.mytimeoutfunc);
			
			try {
				var response = draw.task.parse(this.responseText);
				this.log.push(['parsed response',response]);
				
				//console.log(response);
				var obj = this.obj;
				
				if (draw.task.getMode() === 'pupil') {
					if (un(obj._previousAnswers)) obj._previousAnswers = [];
					obj._previousAnswers.push({answerLogID:response.answerLogID});
					if (!un(draw.task.pupil) && !un(draw.task.pupil.previousAnswers)) {
						draw.task.pupil.previousAnswers.push({answerLogID:response.answerLogID});
					}
				}
				obj._attempts++;
				obj._mode = 'checked';
				obj._partMarks = [];
				obj._feedback = {show:true,part:[]};
				var feedbackCount = 0;
				draw.taskQuestion.getCells(obj);
				
				var cell = obj._cells[0];
				var marks = Number(response.marks);
				var feedback = response.feedback;
				try {
					feedback = draw.task.parse(feedback);
				} catch(error) {}
				if (feedback === "" || (feedback instanceof Array && arraysEqual(feedback, [""]))) {
					
				} else {
					if (typeof feedback === 'string') feedback = textArrayDecompress(feedback);
					feedbackCount++;
					obj._feedback.part[0] = feedback;
				}
				obj._partMarks.push(marks);
				if (feedbackCount === 0) delete obj._feedback;
				
				draw.taskQuestion.disable(obj);
				calcCursorPositions();
				drawCanvasPaths();
				
				if (typeof taskApp === 'object') taskApp.onQuestionCheck(data,response);
				
				if (response.percentage == 100 || response.status == 3) {
					draw.task.allowLog = false;
					jTimer.timeElapsedCallbacks = [];
					jTimer.stop();
					return;
				}
			} catch(e) {
				//console.log('question check error, responseText:',this.responseText);
				//console.log('log',this.log);
				this.errorHandler();
			}
		}
		var params = "data="+encodeURIComponent(JSON.stringify(data));
		xmlHttpCheck.log.push(["params",params]);
		xmlHttpCheck.send(params);
		
		obj._mode = 'checking';
		drawCanvasPaths();
		draw.task.lastLogTime = new Date();
		var timeOnPageInSeconds = jTimer.getTime();
		var nextReportTime = draw.task.reportIntervalInSeconds*(Math.floor(timeOnPageInSeconds/draw.task.reportIntervalInSeconds)+1);
		jTimer.timeElapsedCallbacks = [];
		jTimer.addTimeElapsedCallback(draw.task.log,nextReportTime);
	},
	disable: function(obj) {
		var cells = draw.taskQuestion.getCells(obj);
		draw.taskQuestion.getPaths(obj);
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			if (un(cell._inputs) || cell._inputs.length == 0) continue;
			for (var i = 0; i < cell._inputs.length; i++) {
				var path = cell._inputs[i];
				if (!un(path.isInput)) path.isInput._disabled = true;
				if (!un(path.interact)) path.interact._disabled = true;
				for (var o = 0; o < path.obj.length; o++) {
					var obj2 = path.obj[o];
					if (!un(obj2.interact)) obj2.interact._disabled = true;
				}
			}
		}
		for (var i = 0; i < obj._questionObjs.length; i++) {
			var obj2 = obj._questionObjs[i];
			if (typeof obj2.type === 'string' && ['button', 'buttonTracingPaper', 'buttonUndo', 'buttonClear', 'buttonLine', 'buttonPoint', 'hexagonalLattice'].indexOf(obj2.type) > -1 && !un(obj2.interact)) {
				obj2.interact._disabled = true;
			} else if (['tracingPaper','compass2','ruler2','protractor2'].indexOf(obj2.type) > -1) {
				obj2._disabled = true;
			} else if (!un(obj2.interact) && typeof obj2.interact.click === 'function') {
				obj2.interact._disabled = true;
			}
		}
		if (typeof obj.disable === 'function') obj.disable(obj);
		calcCursorPositions();
	},
	enable: function(obj) {
		var cells = draw.taskQuestion.getCells(obj);
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			if (un(cell._inputs) || cell._inputs.length == 0) continue;
			for (var i = 0; i < cell._inputs.length; i++) {
				var path = cell._inputs[i];
				if (!un(path.isInput)) delete path.isInput._disabled;
				if (!un(path.interact)) delete path.interact._disabled;
				for (var o = 0; o < path.obj.length; o++) {
					var obj2 = path.obj[o];
					if (!un(obj2.interact)) delete obj2.interact._disabled;
				}
			}
		}
		for (var i = 0; i < obj._questionObjs.length; i++) {
			var obj2 = obj._questionObjs[i];
			if (obj2.type === 'text2') delete obj2._inputFeedbackMode;
			if (typeof obj2.type === 'string' && ['button', 'buttonTracingPaper', 'buttonUndo', 'buttonClear', 'buttonLine', 'buttonPoint', 'hexagonalLattice'].indexOf(obj2.type) > -1 && !un(obj2.interact)) {
				delete obj2.interact._disabled;
			} else if (['tracingPaper','compass2','ruler2','protractor2'].indexOf(obj2.type) > -1) {
				delete obj2._disabled;
			} else if (!un(obj2.interact) && typeof obj2.interact.click === 'function') {
				obj2.interact._disabled = false;
			}
		}
		if (typeof obj.enable === 'function') obj.enable(obj);
		calcCursorPositions();
	},
	retry:function(obj) {
		if (un(obj)) obj = draw.currCursor.obj;
		draw.taskQuestion.enable(obj);
		/*var cells = draw.taskQuestion.getCells(obj);
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			marks = obj._partMarks[c];
			var marksMax = obj.partMarksMax[c];
			if (marks === marksMax) {
				obj._mode[c] = 'checked';
				continue;
			}
			if (un(cell._inputs) || cell._inputs.length == 0) return;
			for (var i = 0; i < cell._inputs.length; i++) {
				var path = cell._inputs[i];
				if (!un(path.isInput)) delete path.isInput._disabled;
				if (!un(path.interact)) delete path.interact._disabled;
				for (var o = 0; o < path.obj.length; o++) {
					var obj2 = path.obj[o];
					if (!un(obj2.interact)) delete obj2.interact._disabled;
				}
			}
			obj._mode[c] = '';
		}
		calcCursorPositions();*/
		//delete obj._mode;
		obj._mode = 'retryTimeoutToShowCheckButton';
		delete obj._feedback;
		var retryShowCheckButtonAgainTimeout = setTimeout(function() {
			obj._mode = 'none';
			drawCanvasPaths();
		},2000);
		drawCanvasPaths();
		if (typeof taskApp === 'object' && typeof taskApp.task === 'object' && typeof taskApp.task.onTaskQuestionRetry === 'function') {
			taskApp.task.onTaskQuestionRetry();
		}
	},
	resetButtonPress: function(obj) {
		var obj = draw.currCursor.obj;
		if (un(obj) || obj.type !== 'taskQuestion') return;
		draw.movePathToFront(obj._path);
		obj._resetConfirm = 'Are you sure you want to reset this question? Your input will be cleared.';
		draw.taskQuestion.disable(obj);
		drawCanvasPaths();
	},
	reset: function(obj) {
		if (un(obj)) obj = draw.currCursor.obj;
		if (un(obj) || obj.type !== 'taskQuestion') return;
		//console.log('taskQuestion reset',obj);
		delete obj._mode;
		delete obj._feedback;
		delete obj._attempts;
		delete obj._partMarks;
		draw.taskQuestion.getPaths(obj);
		for (var p = 0; p < obj._questionPaths.length; p++) {
			var path = obj._questionPaths[p];
			if (path.questionTip === true) {
				path._visible = false;
				obj._showQuestionTip = false;
			}
		}
		var cells = draw.taskQuestion.getCells(obj);
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			cell._pageIndex = obj._pageIndex;
			if (typeof obj.reset === 'function') {
				obj.reset(obj);
			} else {
				if (!un(cell._inputType) && !un(draw.taskQuestion[cell._inputType])) draw.taskQuestion[cell._inputType].reset(cell);
			}
			if (!un(cell._inputTypes) && !un(cell._inputTypes['drag'])) {
				draw.taskQuestion['drag'].reset(cell);
			}
		};
		if (!un(obj.state)) obj.state = !un(obj.initialState) ? obj.initialState : '';
		draw.taskQuestion.update(obj);
		draw.taskQuestion.enable(obj);
		drawCanvasPaths();
		if (typeof taskApp === 'object' && typeof taskApp.task === 'object' && typeof taskApp.task.onTaskQuestionRetry === 'function') {
			taskApp.task.onTaskQuestionReset();
		}
	},
	feedbackToggle: function(obj) {
		if (un(obj)) obj = draw.currCursor.obj;
		if (un(obj) || un(obj._feedback)) return;
		obj._feedback.show = !obj._feedback.show;
		drawCanvasPaths();
	},
	feedbackClear: function(obj) {
		if (un(obj)) obj = draw.currCursor.obj;
		if (un(obj) || un(obj._feedback)) return;
		delete obj._feedback;
		drawCanvasPaths();
	},
	update:function(obj) {
		if (typeof obj.update === 'function') {
			obj.update(obj, obj._questionObjsByID);
		}
	},
	
	keyboardButtonPress: function() {
		var obj = draw.currCursor.obj;
		var taskQuestionButtonType = draw.currCursor.taskQuestionButtonType;
		if (!un(textEdit.obj) && textEdit.obj._taskQuestion === obj) {			
			var insert = {
				'frac':{elem:['frac',[''],['']],cursorOffset:1},
				'pow':{elem:['pow',false,['']],cursorOffset:1},
				'sqrt':{elem:['sqrt',['']],cursorOffset:1},
				'root':{elem:['root',[''],['']],cursorOffset:1},
				'squared':{elem:['pow',false,['2']],cursorOffset:3},
				'cubed':{elem:['pow',false,['3']],cursorOffset:3},
				'lt':{elem:'<',cursorOffset:1},
				'gt':{elem:'>',cursorOffset:1},
				'lte':{elem:'≤',cursorOffset:1},
				'gte':{elem:'≥',cursorOffset:1}
			}[taskQuestionButtonType];
			textEdit.insert(insert.elem,undefined,insert.cursorOffset);
			textEdit.draw();
		}
	},
	
	// edit mode
	
	getSavedAnswers:function(obj) {
		if (!un(obj._answers)) return;
		obj._answers = [];
		obj._answerIndex = [];
		for (var p = 0; p < obj.cells.length; p++) {
			obj._answers[p] = [];
			obj._answerIndex[p] = 0;
		}
		for (var a = 0; a < draw.task.answerData.length; a++) {
			var ans = draw.task.answerData[a];
			if (ans.questionID === obj.questionID) {
				obj._answers[ans.questionPart].push(ans);
			}
		}
	},
	setPartAnswer: function(obj,partIndex,answer) {
		var cell = obj.cells[partIndex][0];
		if (cell._inputType === 'text') {
			var txt = answer.answerData;
			if (typeof txt === 'number') txt = String(txt);
			if (typeof txt === 'string') txt = [txt];
			cell._inputs[0].obj[0].text = txt;
			console.log(cell._inputs[0]);
		}
	},
	clearPartAnswer: function(obj,partIndex) {
		var cell = obj.cells[partIndex][0];
		if (cell._inputType === 'text') {
			cell._inputs[0].obj[0].text = [''];
		}
	},
	toggleAnswersBox: function() {
		var obj = draw.currCursor.obj;
		if (un(obj._showAnswersBox)) obj._showAnswersBox = true;
		obj._showAnswersBox = !obj._showAnswersBox;
		drawCanvasPaths();
	},

	editCustomCheckFunction: function() {
		var obj = draw.currCursor.obj;
		if (typeof obj.customCheck !== 'function') {
			obj.customCheck = function(obj, inputValues) {
				var marks = 0;
				var feedback = [''];
				var answers = [30, 9, 7, 2, 13, 6, 0, 27];
				for (var i = 0; i < answers.length; i++) {
					var input = obj._questionObjsByID['t' + i];
					var inputValue = inputValues['t' + i];
					if (inputValue.value === answers[i]) {
						marks++;
						input._inputFeedbackMode = 'greentick';
					} else {
						input._inputFeedbackMode = 'redcross';
					}
				}
				if (marks < 8) {
					feedback = ['You have ' + marks + ' correct answer' + (marks === 1 ? '' : 's') + '.'];
				}
				return {
					marks: marks,
					feedback: feedback
				}
			}
		}
		draw.codeEditor.open(obj,'customCheck');
	},
	deleteCustomCheckFunction: function() {
		var obj = draw.currCursor.obj;
		if (typeof obj.customCheck !== 'function') return;
		if (confirm('Delete check function for question '+obj.qNum+'?') !== true) return;
		delete obj.customCheck;
		drawCanvasPaths();
	},

	getQuestionInputValues: function(obj) {
		draw.taskQuestion.getPaths(obj);
		if (obj._cells[0]._inputType === 'drawTools') return draw.taskQuestion.drawTools.getReducedDrawnPaths(obj);
		var inputPaths = obj._cells[0]._inputs;
		if (inputPaths.length === 1) return draw.taskQuestion.getInputValue(inputPaths[0]);
		var inputValues = {};
		var types = {};
		for (var i = 0; i < inputPaths.length; i++) {
			var path = inputPaths[i];
			var type = path._inputType;
			if (un(types[type])) types[type] = 0;
			var id = (path.obj.length === 1 && !un(path.obj[0].id)) ? path.obj[0].id : !un(path.id) ? path.id : type+types[type];
			inputValues[id] = draw.taskQuestion.getInputValue(path);
			types[type]++;
		}
		return inputValues;		
	},
	getInputValue: function(path) {
		var inputType = path._inputType;
		if (inputType === 'text') {
			return draw.taskQuestion.getTextInputValue(path.obj[0]);
		} else if (inputType === 'grid') {
			return {
				gridPaths:draw.taskQuestion.grid.getDrawnPaths(path.obj[0],false),
				gridPathsReduced:draw.taskQuestion.grid.getDrawnPaths(path.obj[0],true)
			}
		}
		return {};
	},
	getTextInputValue: function(obj) {
		var value = {type:'text',obj:obj};
		var arr = removeTags(simplifyText(clone(obj.text)));
		value.text = arr;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] === "") {
				arr.splice(i,1);
				i--;
			}
		}
		if (arr.length === 0) {
			value.blank = true;
		} else if (arr.length === 1) {
			if (typeof arr[0] === 'string') {
				var str = arr[0];
				value.string = str;
				if (str === "") {
					value.blank = true;
				} else {
					var stringValue = getStringValue(str);
					if (stringValue !== false) {
						value.value = stringValue;
					}
				}
			} else if (arr[0] instanceof Array && arr[0][0] === 'frac') {
				var fraction = getFraction(arr[0]);
				if (fraction !== false) {
					value.value = fraction[0]/fraction[1];
					value.fraction = fraction;
				}
			}
		} else if (arr.length === 2) {
			if (typeof arr[0] === 'string' && arr[1] instanceof Array && arr[1][0] === 'frac') {
				var fraction = getFraction(arr[1]);
				if (fraction !== false) {
					var fractionValue =  fraction[0]/fraction[1];
					if (arr[0] === "-") {
						value.value = -1 * fractionValue;
						value.fraction = [-fraction[0],fraction[1]];
					} else if (!isNaN(Number(arr[0]))) {
						var strValue = getIntegerValue(arr[0]);
						if (strValue !== false) {
							value.value = strValue + fractionValue;
							value.mixedNumber = [strValue,fraction[0],fraction[1]];
						}
					}
				}
			} else if (arr[0] instanceof Array && arr[0][0] === 'frac' && arr[1] === pi) {
				var fraction = getFraction(arr[0]);
				if (fraction !== false) {
					value.value = (fraction[0]/fraction[1]) * Math.PI;
				}
			} else if (typeof arr[0] === 'string' && arr[1] instanceof Array && arr[1][0] === 'recurring') {
				var recValue = getRecurringValue(arr[0],arr[1]);
				if (recValue !== false) {
					value.value = recValue;
					value.recurringDecimal = [arr[0],arr[1][1][0]];
				}
			}
		} else if (arr.length === 3) {
			if (typeof arr[0] === 'string' && arr[1] instanceof Array && arr[1][0] === 'frac' && arr[2] === pi) {
				var fraction = getFraction(arr[1]);
				if (fraction !== false) {
					var fracValue = fraction[0]/fraction[1];
					if (arr[0] === "-") {
						value.value = -1 * fracValue * Math.PI;
					} else if (isNaN(Number(arr[0]))) {
						var strValue = getIntegerValue(arr[0]);
						if (strValue !== false) {
							value.value = (strValue + fracValue) * Math.PI;
						}
					}
				}
			} else if (typeof arr[0] === 'string' && arr[1] instanceof Array && arr[1][0] === 'recurring' && arr[2] === pi) {
				var recValue = getRecurringValue(arr[0],arr[1]);
				if (recValue !== false) {
					value.value = recValue * Math.PI;
				}
			}
		}
		return value;
		
		function getRecurringValue(str,arr) { // eg getRecurringValue('3.1',['rec',['4']]);
			if (str.indexOf(".") === -1) return false;
			if (str.indexOf(pi) > -1) return false;
			if (arr[1].length !== 1) return false;
			if (arr[1] === "") return false;
			var strValue = str.slice(-1) === "." ? getIntegerValue(str.slice(0,-1)) : getStringValue(str);
			if (strValue === false) return false;
			var recNum = getIntegerValue(arr[1]);
			if (recNum === false) return false;
			var pv1 = str.length-1-str.indexOf(".");
			var pv2 = pv1+Math.floor(Math.log10(recNum))+1;
			return strValue+recNum/(Math.pow(10,pv2)-Math.pow(10,pv1))
		}
		function getStringValue(str) {
			//str = replaceAll(str,',','');
			if (!isNaN(Number(str))) return Number(str);
			
			var dpIndex = str.indexOf('.'); // test for number written correctly with commas
			if (dpIndex === -1) dpIndex = str.length;
			var strNoCommas = str;
			for (var i = dpIndex-4; i > 0; i -= 4) {
				if (i > 0 && strNoCommas.slice(i,i+1) === ',') {
					strNoCommas = strNoCommas.slice(0,i)+strNoCommas.slice(i+1);
				} else {
					break;
				}
			}
			if (!isNaN(Number(strNoCommas))) return Number(strNoCommas);
			
			if (str.slice(-1) === pi) {
				var num = str.slice(0,-1);
				if (num === "") return Math.PI;
				if (!isNaN(Number(num))) return Number(num)*Math.PI;
			}
			return false;
		}
		function getIntegerValue(str) {
			if (str === "") return false;
			var num = Number(str);
			if (isNaN(num) || num % 1 !== 0) return false;
			return num;
		}
		function getFraction(arr) {
			var num = arr[1];
			if (num.length !== 1) return false;
			if (num[0] === "") return false;
			var numValue = getStringValue(num[0]);
			if (numValue === false) return false;
			
			var denom = arr[2];
			if (denom.length !== 1) return false;
			if (denom[0] === "") return false;
			var denomValue = getStringValue(denom[0]);
			if (denomValue === false) return false;
			if (denomValue === 0) return false;
			
			return [numValue,denomValue];
		}
	},
	
	// question input types
	/***************
		text input - single line
		select - single
		select - multi-select
		drag - 1:1
		drag - 1:n
		grid
		custom
		drag - venn2
		drag - venn3
		
		drag - spot the error type?
		select - dropDown 
		drawing
	***************/

	restoreQuestionAnswerState:function(obj,answer) { // answer can be object, or answerIndex of obj._previousAnswers
		if (typeof answer !== 'object') {
			if (un(obj._previousAnswers)) return;
			if (un(answer)) answer = obj._previousAnswers.length-1;
			if (un(obj._previousAnswers[answer])) return;
			var answer = obj._previousAnswers[answer];
		}
		
		obj._partMarks = [answer.marks];
		obj._attempts = answer.attempt;
		obj._mode = 'checked';
		if (answer.blank === true) {
			draw.taskQuestion.reset(obj);
			return;
		}
		
		var cell = obj.cells[0][0];
		draw.taskQuestion.getPaths(obj);
		
		delete obj._feedback;
		if (typeof answer.pupilFeedback === 'string' && answer.pupilFeedback.length > 0) {
			obj._feedback = {show:true,part:[textArrayDecompress(answer.pupilFeedback)]};
			//console.log(obj._feedback);
		}
		
		//console.log(answer);
		
		if (!un(answer.saveInputData)) {
			//console.log('restore - new method - ',obj,answer.saveInputData);
			draw.taskQuestion.restoreInputsSaveData(obj,answer.saveInputData);
		} else if (!un(answer.saveInputsData)) {
			//console.log('restore - new method - ',obj,answer.saveInputsData);
			draw.taskQuestion.restoreInputsSaveData(obj,answer.saveInputsData);
		} else if (!un(answer.saveData) && !un(answer.saveData.saveData && typeof answer.saveData.saveData === 'object')) {
			var saveData = answer.saveData.saveData[0];
			if (typeof obj.restoreSaveData === 'function') {
				obj.restoreSaveData(obj,saveData);
			} else if (!un(cell._inputType) && !un(draw.taskQuestion[cell._inputType]) && !un(draw.taskQuestion[cell._inputType].getSaveData)) {
				//console.log('restore - OLD method - ',obj,saveData,answer);
				cell._pageIndex = obj._pageIndex;
				draw.taskQuestion[cell._inputType].restoreSaveData(cell,saveData);
			}
		} else {
			if (typeof obj.reset === 'function') {
				obj.reset(obj);
			} else if (!un(draw.taskQuestion[cell._inputType]) && typeof draw.taskQuestion[cell._inputType].reset === 'function') {
				draw.taskQuestion[cell._inputType].reset(cell);
			}
		}

		if (typeof answer.state === 'string') {
			if (un(obj._initialState)) obj._initialState = !un(obj.state) ? obj.state : ''; 
			obj.state = answer.state;
		}

		if (obj._mode === 'checked') {
			draw.taskQuestion.disable(obj);
			if (!un(obj._inputTypes) && obj._inputTypes.text instanceof Array) {
				for (var t = 0; t < obj._inputTypes.text.length; t++) {
					var textObj = obj._inputTypes.text[t].obj[0];
					if (textEdit.obj === textObj) {
						textEdit.endInput();
						break;
					}
				}
			}
		}
		
		draw.taskQuestion.update(obj);
	},
	
	colorToNumber:function(color) {
		if (typeof color !== 'string') return 0;
		if (color.indexOf('#') === 0) color = color.slice(1);
		color = color.toLowerCase();
		if (color.length === 3) color = color[0]+color[0]+color[1]+color[1]+color[2]+color[2];
		return parseInt(color, 16);
	},
	numberToColor:function(num) {
		var color =  ("000000" + num.toString(16)).slice(-6);
		return "#" + color;
	},
	getInputsSaveData: function(obj) {
		var saveInputsData = {};
		if (un(obj._inputTypes)) draw.taskQuestion.getPaths(obj);
		var types = ['text','select','pieChart','slider','hexagonalLattice'];
		for (var t = 0; t < types.length; t++) {
			var type = types[t];
			if (!un(obj._inputTypes[type])) {
				var key = type === 'select' ? 'sel' : type;
				saveInputsData[key] = [];
				for (var i = 0; i < obj._inputTypes[type].length; i++) {
					var saveInputData = draw.taskQuestion.inputTypes[type].getSaveData(obj._inputTypes[type][i]);
					if (saveInputData.pop() !== true) saveInputsData[key].push(saveInputData);
					//if (saveInputData.blank !== true) saveInputsData[type].push(saveInputData);
				}
			}
		}
		if (!un(obj._inputTypes.drag)) {
			var parentPaths = draw.taskQuestion.getQuestionParentPaths(obj);
			saveInputsData.dragObject = [];
			var pathIndexes = [];
			for (var i = 0; i < obj._inputTypes.drag.length; i++) {
				var dragObjectPath = obj._inputTypes.drag[i];
				dragObjectPath._pathIndex = parentPaths.indexOf(dragObjectPath);
				if (pathIndexes.indexOf(dragObjectPath._pathIndex) === -1) pathIndexes.push(dragObjectPath._pathIndex);
			}
			pathIndexes.sort();
			for (var i = 0; i < obj._inputTypes.drag.length; i++) {
				var dragObjectPath = obj._inputTypes.drag[i];
				var	order = pathIndexes.indexOf(dragObjectPath._pathIndex);
				var saveInputData = draw.taskQuestion.inputTypes.dragObject.getSaveData(dragObjectPath,order,obj);
				if (saveInputData.pop() !== true) saveInputsData.dragObject.push(saveInputData);
			}
		}
		if (!un(obj._inputTypes.trueFalse)) {
			saveInputsData.trueFalse = [];
			var saveInputData = draw.taskQuestion.inputTypes.trueFalse.getSaveData(obj._inputTypes.trueFalse);
			//if (saveInputData.blank !== true) saveInputsData.trueFalse.push(saveInputData);
			saveInputsData.trueFalse.push(saveInputData);
		}
		if (!un(obj._inputTypes.grid)) {
			for (var i = 0; i < obj._inputTypes.grid.length; i++) {
				var saveGridPaths = draw.taskQuestion.inputTypes.gridPaths.getSaveData(obj._inputTypes.grid[i]);
				if (!un(saveGridPaths.gridPoint) && saveGridPaths.gridPoint.length > 0) {
					if (un(saveInputsData.gridPoint)) saveInputsData.gridPoint = [];
					saveInputsData.gridPoint = saveInputsData.gridPoint.concat(saveGridPaths.gridPoint);
				}
				if (!un(saveGridPaths.gridLine) && saveGridPaths.gridLine.length > 0) {
					if (un(saveInputsData.gridLine)) saveInputsData.gridLine = [];
					saveInputsData.gridLine = saveInputsData.gridLine.concat(saveGridPaths.gridLine);
				}
			}
		}
		if (!un(obj._inputTypes.drawTools)) {
			var saveGridPaths = draw.taskQuestion.inputTypes.drawPaths.getSaveData(obj);
			var types = ['point','line','tracingPaper','tracingPaperPoint','tracingPaperLine','arc','compass','protractor','ruler'];
			for (var t = 0; t < types.length; t++) {
				var type = types[t];
				if (!un(saveGridPaths[type]) && saveGridPaths[type].length > 0) {
					if (un(saveInputsData[type])) saveInputsData[type] = [];
					saveInputsData[type] = saveInputsData[type].concat(saveGridPaths[type]);
				}
			}
		}
		return saveInputsData;
	},
	restoreInputsSaveData: function(obj,saveInputsData) {
		//console.log('restoreInputsSaveData',obj,saveInputsData);
		if (un(obj._inputTypes)) draw.taskQuestion.getPaths(obj);
		var types = ['text','select','pieChart','slider','hexagonalLattice'];
		for (var t = 0; t < types.length; t++) {
			var type = types[t];
			if (!un(saveInputsData[type]) && !un(obj._inputTypes[type])) {
				for (var i = 0; i < saveInputsData[type].length; i++) {
					var saveInputData = saveInputsData[type][i];
					var inputID = Number(saveInputData.inputID);
					var inputPath = obj._inputTypes[type].find(function(x) {
						var inputID2 = !un(x.inputID) ? x.inputID : 0;
						return inputID2 === inputID; 
					});
					if (typeof inputPath === 'object' && inputPath !== null) {
						draw.taskQuestion.inputTypes[type].restoreSaveData(inputPath,saveInputData);
					}
				}
			}
		}
		if (!un(saveInputsData['dragObject']) && !un(obj._inputTypes['drag'])) {
			var parentPaths = draw.taskQuestion.getQuestionParentPaths(obj);
			var dragObjectPaths = [];
			for (var i = 0; i < saveInputsData['dragObject'].length; i++) {
				var saveInputData = saveInputsData['dragObject'][i];
				var inputID = Number(saveInputData.inputID);
				var inputPath = obj._inputTypes['drag'].find(function(x) {
					var inputID2 = !un(x.inputID) ? x.inputID : 0;
					return inputID2 === inputID; 
				});
				if (typeof inputPath === 'object' && inputPath !== null) {
					draw.taskQuestion.inputTypes['dragObject'].restoreSaveData(inputPath,saveInputData,obj);
					var index = parentPaths.indexOf(inputPath);
					if (index > -1) {
						parentPaths.splice(index,1);
						dragObjectPaths.push([inputPath,saveInputData.dragOrder]);
					}
				}
			}
			dragObjectPaths.sort(function(a,b) {return a[1]-b[1];});
			for (var p = 0; p < dragObjectPaths.length; p++) {
				parentPaths.push(dragObjectPaths[p][0]);
			}
		}
		if (!un(saveInputsData['trueFalse']) && !un(obj._inputTypes['trueFalse'])) {
			draw.taskQuestion.inputTypes['trueFalse'].restoreSaveData(obj._inputTypes['trueFalse'],saveInputsData['trueFalse'][0]);
		}
		if (!un(saveInputsData['gridPoint']) || !un(saveInputsData['gridLine'])) {
			var gridPoints = !un(saveInputsData['gridPoint']) ? saveInputsData['gridPoint'] : [];
			var gridLines = !un(saveInputsData['gridLine']) ? saveInputsData['gridLine'] : [];
			draw.taskQuestion.inputTypes['gridPaths'].restoreSaveData(obj._inputTypes['grid'],gridPoints,gridLines);
		}
		if (!un(saveInputsData['point']) || !un(saveInputsData['line']) || !un(saveInputsData['tracingPaper']) || !un(saveInputsData['tracingPaperPoint']) || !un(saveInputsData['tracingPaperLine']) || !un(saveInputsData['arc']) || !un(saveInputsData['compass']) || !un(saveInputsData['protractor']) || !un(saveInputsData['ruler'])) {
			var points = !un(saveInputsData['point']) ? saveInputsData['point'] : [];
			var lines = !un(saveInputsData['line']) ? saveInputsData['line'] : [];
			var tracingPaper = !un(saveInputsData['tracingPaper']) ? saveInputsData['tracingPaper'] : [];
			var tracingPaperPoints = !un(saveInputsData['tracingPaperPoint']) ? saveInputsData['tracingPaperPoint'] : [];
			var tracingPaperLines = !un(saveInputsData['tracingPaperLine']) ? saveInputsData['tracingPaperLine'] : [];
			var arcs = !un(saveInputsData['arc']) ? saveInputsData['arc'] : [];
			var compass = !un(saveInputsData['compass']) ? saveInputsData['compass'] : [];
			var protractor = !un(saveInputsData['protractor']) ? saveInputsData['protractor'] : [];
			var ruler = !un(saveInputsData['ruler']) ? saveInputsData['ruler'] : [];
			draw.taskQuestion.inputTypes['drawPaths'].restoreSaveData(obj,points,lines,tracingPaper,tracingPaperPoints,tracingPaperLines,arcs,compass,protractor,ruler);
			draw.taskQuestion.getPaths(obj);
		}
	},
	getAnswerDataFromSaveInputsData: function(obj,saveInputsData) {
		//console.log(obj,saveInputsData);
		if (!un(saveInputsData.select)) {
			return draw.taskQuestion.inputTypes.select.getAnswerData(saveInputsData.select[0]);
		} else if (!un(saveInputsData.trueFalse)) {
			return draw.taskQuestion.inputTypes.trueFalse.getAnswerData(saveInputsData.trueFalse[0]);
		} else if (!un(saveInputsData.dragObject)) {
			return draw.taskQuestion.inputTypes.dragObject.getAnswerData(obj,saveInputsData.dragObject);
		}
		return undefined;
	},
	
	inputTypes: {
		text:{
			getSaveData:function(inputPath) {
				var input = inputPath.obj[0];
				var saveInputData = [
					!un(inputPath.inputID) ? inputPath.inputID : 0,
					textArrayCompress(input.text)
				];
				var feedbackMode = 'n';
				if (!un(input._inputFeedbackMode)) feedbackMode = input._inputFeedbackMode;
				if (feedbackMode === 'none') {
					feedbackMode = 'n';
				} else if (feedbackMode === 'red') {
					feedbackMode = 'r';
				} else if (feedbackMode === 'yellow') {
					feedbackMode = 'y';
				} else if (feedbackMode === 'green') {
					feedbackMode = 'g';
				} else if (feedbackMode === 'greentick') {
					feedbackMode = 'gt';
				} else if (feedbackMode === 'redcross') {
					feedbackMode = 'rc';
				}
				saveInputData.push(feedbackMode);
				saveInputData.push(saveInputData[1] === "" ? true : false);
				/*var saveInputData = {
					inputID: !un(inputPath.inputID) ? inputPath.inputID : 0,
					text: textArrayCompress(input.text),
					feedbackMode: !un(input._inputFeedbackMode) ? input._inputFeedbackMode : 'none'
				}
				if (saveInputData.text === "") saveInputData.blank = true;*/
				return saveInputData;
			},
			restoreSaveData:function(inputPath,saveInputData) {
				inputPath.obj[0].text = textArrayDecompress(String(saveInputData.text));
				inputPath.obj[0]._inputFeedbackMode = saveInputData.feedbackMode;
			}
		},
		select:{
			getSaveData:function(inputPath) {
				var input = inputPath.obj[0];
				var saveInputData = [
					(!un(input._path) && !un(input._path.inputID)) ? input._path.inputID : 0,
					0
				];
				if (un(input._cells)) draw.table2.getCells(input);
				for (var c = 0; c < input._cells.length; c++) {
					var cell = input._cells[c];
					if (cell.toggle === true) {
						saveInputData[1] += Math.pow(2,c);
					}
				}
				saveInputData.push(saveInputData[1] === 0 ? true : false);
				/*var saveInputData = {
					inputID: (!un(input._path) && !un(input._path.inputID)) ? input._path.inputID : 0,
					selectValue: 0
				}
				if (un(input._cells)) draw.table2.getCells(input);
				for (var c = 0; c < input._cells.length; c++) {
					var cell = input._cells[c];
					if (cell.toggle === true) {
						saveInputData.selectValue += Math.pow(2,c);
					}
				}
				if (saveInputData.selectValue === 0) saveInputData.blank = true;*/
				return saveInputData;
			},
			restoreSaveData:function(inputPath,saveInputData) {
				var input = inputPath.obj[0];
				var selectValue = Number(saveInputData.selectValue);
				if (un(input._cells)) draw.table2.getCells(input);
				//console.log(selectValue,input._cells);
				for (var c = input._cells.length-1; c >= 0; c--) {
					var bin = Math.pow(2,c);
					//console.log(selectValue, bin, selectValue > bin);
					if (selectValue >= bin) {
						var cell = input._cells[c];
						cell.toggle = true;
						selectValue -= bin;
					}
				}
			},
			getAnswerData:function(saveInputData) {
				var answer = {selected:[]};
				var selectValue = Number(saveInputData.selectValue);
				var max = Math.ceil(Math.log2(selectValue));
				for (var c = max; c >= 0; c--) {
					var bin = Math.pow(2,c);
					if (selectValue >= bin) {
						answer.selected.unshift(c);
						selectValue -= bin;
					}
				}
				return answer;
			}
		},
		dragObject: {
			getSaveData:function(inputPath,dragOrder,obj) {
				var saveInputData = [
					!un(inputPath.inputID) ? inputPath.inputID : 0, //inputID
					0, //dx
					0, //dy
					-1, //hitDragAreaID
					0, //snapped
					0, //matched
					dragOrder
				];
				updateBorder(inputPath);
				var hitDragArea = false;
				
				if (un(inputPath._initialPos) || (Math.abs(inputPath._initialPos[0]-inputPath.tightBorder[0]) < 0.1 && Math.abs(inputPath._initialPos[1]-inputPath.tightBorder[1]) < 0.1)) {
					saveInputData.push(true);
				} else {
					saveInputData.push(false);
					saveInputData[1] = Math.round(10*(inputPath.tightBorder[0]-inputPath._initialPos[0]));
					saveInputData[2] = Math.round(10*(inputPath.tightBorder[1]-inputPath._initialPos[1]));
				}
							
				if (!un(inputPath.interact) && !un(inputPath.interact._dragAreaHit) && !un(inputPath.interact._dragAreaHit.path)) {
					var dragArea = inputPath.interact._dragAreaHit.path;
					saveInputData[3] = dragArea.inputID;
					hitDragArea = dragArea;
					saveInputData[5] = inputPath.interact.match === dragArea.interact.match ? 1 : 0;
					saveInputData[4] = inputPath.interact._dragAreaHit.snap === true ? 1 : 0;
				} else if (!un(obj._inputTypes) && !un(obj._inputTypes['dragArea'])) {
					var dragAreas = obj._inputTypes['dragArea'];
					for (var a = 0; a < dragAreas.length; a++) {
						var dragArea = dragAreas[a];
						updateBorder(dragArea);
						if (draw.taskQuestion.drag.checkHitArea(inputPath,dragArea) === true) {
							saveInputData[3] = dragArea.inputID;
							hitDragArea = dragArea;
							saveInputData[5] = inputPath.interact.match === dragArea.interact.match ? 1 : 0;
							break;
						}
					}
				} else if (!un(obj._inputTypes) && (!un(obj._inputTypes['venn2DragArea']) || !un(obj._inputTypes['venn3DragArea']))) {
					var type = !un(obj._inputTypes['venn3DragArea']) ? 3 : 2;
					var vennPath = obj._inputTypes['venn'+type+'DragArea'][0];
					var vennObj = vennPath.obj[0];
					var answerData = {hits:[]};
					updateBorder(vennPath);
					var rect = vennPath.tightBorder;
					if (type === 2) {
						var value1 = 'a';
						var value2 = 'b';			
						if (vennObj.interact.values instanceof Array) {
							if (typeof vennObj.interact.values[0] === 'string') value1 = vennObj.interact.values[0];
							if (typeof vennObj.interact.values[1] === 'string') value2 = vennObj.interact.values[1];
						} else if (vennObj.interact.matches instanceof Array) {
							if (typeof vennObj.interact.matches[0] === 'string') value1 = vennObj.interact.matches[0];
							if (typeof vennObj.interact.matches[1] === 'string') value2 = vennObj.interact.matches[1];
						}
					} else if (type === 3) {
						var value1 = 'a';
						var value2 = 'b';			
						var value3 = 'c';			
						if (vennObj.interact.values instanceof Array) {
							if (typeof vennObj.interact.values[0] === 'string') value1 = vennObj.interact.values[0];
							if (typeof vennObj.interact.values[1] === 'string') value2 = vennObj.interact.values[1];
							if (typeof vennObj.interact.values[2] === 'string') value3 = vennObj.interact.values[2];
						} else if (vennObj.interact.matches instanceof Array) {
							if (typeof vennObj.interact.matches[0] === 'string') value1 = vennObj.interact.matches[0];
							if (typeof vennObj.interact.matches[1] === 'string') value2 = vennObj.interact.matches[1];
							if (typeof vennObj.interact.matches[2] === 'string') value3 = vennObj.interact.matches[2];
						}
					}
					var dragCenter = [inputPath.tightBorder[0]+0.5*inputPath.tightBorder[2],inputPath.tightBorder[1]+0.5*inputPath.tightBorder[3]];
					if (isPointInRect(dragCenter,rect[0],rect[1],rect[2],rect[3]) === true) {
						saveInputData[3] = 0;
						var hits = [];
						if (dist(vennObj._centerA,dragCenter) < vennObj._radius) {
							hits.push(value1);
							saveInputData[3] += 1;
						}
						if (dist(vennObj._centerB,dragCenter) < vennObj._radius) {
							hits.push(value2);
							saveInputData[3] += 2;
						}
						if (type === 3 && dist(vennObj._centerC,dragCenter) < vennObj._radius) {
							hits.push(value3);
							saveInputData[3] += 4;
						}
						var dragMatches = un(inputPath.interact.match) || inputPath.interact.match === '' ? [] : inputPath.interact.match.split(',');
						if (dragMatches.length === hits.length) {
							saveInputData[5] = 1;
							for (var h = 0 ; h < hits.length; h++) {
								if (dragMatches.indexOf(hits[h]) === -1) {
									saveInputData[5] = 0;
									break;
								}
							}
						}
					}
				}
				/*if (obj._questionType === 'dragPairThemUp' && typeof hitDragArea === 'object' && !un(hitDragArea.interact) && !un(hitDragArea.interact.match)) {
					var hitDragArea2 = obj._inputTypes['dragArea'].find(function(x) {
						return x !== hitDragArea && !un(x.interact) && x.interact.match === hitDragArea.interact.match;
					});
					if (typeof hitDragArea2 === 'object' && !un(hitDragArea2.interact._dragHit) && typeof hitDragArea2.interact._dragHit.inputID === 'number') {
						saveInputData.pairedDragObjectID = hitDragArea2.interact._dragHit.inputID;
						if (inputPath.interact.match === hitDragArea2.interact._dragHit.interact.match) saveInputData.matched = 1;
					}
				}*/
				
				//console.log(inputPath,saveInputData,saveInputData.dx,saveInputData.dy);
				
				return saveInputData;
			},
			restoreSaveData:function(inputPath,saveInputData,obj) {
				updateBorder(inputPath);
				if (un(inputPath._initialPos)) inputPath._initialPos = [inputPath.tightBorder[0],inputPath.tightBorder[1]];
				positionPath(inputPath,inputPath._initialPos[0]+saveInputData.dx/10,inputPath._initialPos[1]+saveInputData.dy/10);
				
				var dragAreas = [];
				if (!un(obj._inputTypes) && !un(obj._inputTypes['dragArea'])) dragAreas = obj._inputTypes['dragArea'];
								
				if (dragAreas instanceof Array && Number(saveInputData.hitDragAreaID) > -1 && Number(saveInputData.snapped) === 1) {
					var dragAreaHit = dragAreas.find(function(x) {
						return x.inputID === Number(saveInputData.hitDragAreaID);
					});
					if (typeof dragAreaHit === 'object' && dragAreaHit !== null) {
						var rect = dragAreaHit.tightBorder;
						var center = [rect[0]+0.5*rect[2],rect[1]+0.5*rect[3]];
						inputPath.interact._dragAreaHit = {
							center:center,
							path:dragAreaHit,
							rect:rect,
							snap:true
						};
						dragAreaHit.interact._dragHit = inputPath;
						//console.log('dragHitRestored:',inputPath,dragAreaHit);
					}
				}
				
				if (!un(inputPath.interact) && typeof inputPath.interact.onDragMove === 'function') inputPath.interact.onDragMove(inputPath);
				if (!un(inputPath.interact) && typeof inputPath.interact.onDragStop === 'function') inputPath.interact.onDragStop(inputPath);
			},
			getAnswerData:function(obj,saveInputsData) {
				//console.log(obj._questionType,obj);
				if (obj._questionType === 'drag') {
					var answerData = {hits:[]};
					var hitCount = 0;
					for (var d = 0; d < saveInputsData.length; d++) {
						var saveInputData = saveInputsData[d];
						var drag = obj._inputTypes.drag.find(function(x) {
							return x.inputID === Number(saveInputData.inputID);
						});
						if (typeof drag !== 'object' || drag === null) continue;
						var value = draw.taskQuestion.drag.getDragValue(drag);
						if (un(saveInputData.hitDragAreaID) || Number(saveInputData.hitDragAreaID) === -1) {
							answerData.hits.push({value:value,match:false});
							continue;
						}
						var dragArea = obj._inputTypes.dragArea.find(function(x) {
							return x.inputID === Number(saveInputData.hitDragAreaID);
						});
						var hit = typeof drag === 'object' && drag !== null && !un(dragArea) && !un(dragArea.interact) ? dragArea.interact.match : '';
						var match = Number(saveInputData.matched) === 1 ? true : false;
						answerData.hits.push({value:value,hit:hit,match:match});
					}
					answerData.hits.sort(function(a,b) {
						if (a.value < b.value) return -1;
						return 0;
					});
					if (hitCount === 0) answerData.blank = true;
					return answerData;
				} else if (obj._questionType === 'dragOneOfManyToOne') {
					var dragAreas = obj._inputTypes.dragArea;
					var answerData = {hits:[]};
					var hitCount = 0;
					for (var a = 0; a < dragAreas.length; a++) {
						var dragArea = dragAreas[a];
						var dragAreaInputID = dragArea.inputID;
						var saveInputData = saveInputsData.find(function(x) {
							return Number(x.hitDragAreaID) === dragAreaInputID;
						});
						if (typeof saveInputData === 'object' && saveInputData !== null) {
							hitCount++;
							var drag = obj._inputTypes.drag.find(function(x) {
								return x.inputID === Number(saveInputData.inputID);
							});
							if (typeof drag !== 'object' || drag === null) continue;
							var match = Number(saveInputData.matched) === 1 ? true : false;
							answerData.hits.push({dragAreaInputID:dragAreaInputID,hit:drag.interact.match,match:match});
						} else {
							answerData.hits.push({dragAreaInputID:dragAreaInputID,match:false});
						}
					}
					answerData.hits.sort(function(a,b) {
						if (a.dragAreaInputID < b.dragAreaInputID) return 1;
						return 0;
					});
					if (hitCount === 0) answerData.blank = true;
					return answerData;
				} else if (obj._questionType === 'dragPairThemUp') {
					var drags = obj._inputTypes['drag'];
					var dragAreas = obj._inputTypes['dragArea'];
					var pairedHits = {};
					var hitCount = 0;
					for (var d = 0; d < saveInputsData.length; d++) {
						var saveInputData = saveInputsData[d];
						if (un(saveInputData.hitDragAreaID) || Number(saveInputData.hitDragAreaID) === -1) continue;
						var drag = obj._inputTypes.drag.find(function(x) {
							return x.inputID === Number(saveInputData.inputID);
						});
						if (typeof drag !== 'object' || drag === null) continue;
						var dragArea = obj._inputTypes.dragArea.find(function(x) {
							return x.inputID === Number(saveInputData.hitDragAreaID);
						});
						var dragAreaMatchValue = dragArea.interact.match;
						hitCount++;
						if (un(pairedHits[dragAreaMatchValue])) pairedHits[dragAreaMatchValue] = [];
						pairedHits[dragAreaMatchValue].push({match:drag.interact.match,value:drag.interact.value});
					}
					var pairedHits2 = [];
					for (var key in pairedHits) {
						var pairedHit = pairedHits[key];
						pairedHit.sort(function(a,b) {
							if (typeof a.value !== 'string' || typeof b.value !== 'string') return a.value - b.value;
							return a.value.localeCompare(b.value, undefined, {numeric: true, sensitivity: 'base'});
						});
						pairedHits2.push(pairedHit);
					}
					pairedHits2.sort(function(a,b) {
						if (typeof a.match !== 'string' || typeof b.match !== 'string') return a.match - b.match;
						return a[0].match.localeCompare(b[0].match, undefined, {numeric: true, sensitivity: 'base'});
					});
					var answerData = {pairedHits:pairedHits2};
					if (hitCount === 0) answerData.blank = true;
					return answerData;
				} else if (obj._questionType === 'vennDrag') {
					var type = !un(obj._inputTypes['venn3DragArea']) ? 3 : 2;
					var vennPath = obj._inputTypes['venn'+type+'DragArea'][0];
					var vennObj = vennPath.obj[0];
					var answerData = {hits:[]};
					if (type === 2) {
						var value1 = 'a';
						var value2 = 'b';			
						if (vennObj.interact.values instanceof Array) {
							if (typeof vennObj.interact.values[0] === 'string') value1 = vennObj.interact.values[0];
							if (typeof vennObj.interact.values[1] === 'string') value2 = vennObj.interact.values[1];
						} else if (vennObj.interact.matches instanceof Array) {
							if (typeof vennObj.interact.matches[0] === 'string') value1 = vennObj.interact.matches[0];
							if (typeof vennObj.interact.matches[1] === 'string') value2 = vennObj.interact.matches[1];
						}
					} else if (type === 3) {
						var value1 = 'a';
						var value2 = 'b';			
						var value3 = 'c';			
						if (vennObj.interact.values instanceof Array) {
							if (typeof vennObj.interact.values[0] === 'string') value1 = vennObj.interact.values[0];
							if (typeof vennObj.interact.values[1] === 'string') value2 = vennObj.interact.values[1];
							if (typeof vennObj.interact.values[2] === 'string') value3 = vennObj.interact.values[2];
						} else if (vennObj.interact.matches instanceof Array) {
							if (typeof vennObj.interact.matches[0] === 'string') value1 = vennObj.interact.matches[0];
							if (typeof vennObj.interact.matches[1] === 'string') value2 = vennObj.interact.matches[1];
							if (typeof vennObj.interact.matches[2] === 'string') value3 = vennObj.interact.matches[2];
						}
					}
					
					for (var d = 0; d < saveInputsData.length; d++) {
						var saveInputData = saveInputsData[d];
						var drag = obj._inputTypes.drag.find(function(x) {
							return x.inputID === Number(saveInputData.inputID);
						});
						if (typeof drag !== 'object' || drag === null) continue;
						var value = draw.taskQuestion.vennDrag.getDragValue(drag);
						if (un(saveInputData.hitDragAreaID) || Number(saveInputData.hitDragAreaID) === -1) {
							answerData.hits.push({value:value,hit:false,match:false});
							continue;
						}
						var hitValue = Number(saveInputData.hitDragAreaID);
						var hits = [];
						if (hitValue >= 4) {
							hits.unshift(value3);
							hitValue -= 4;
						}
						if (hitValue >= 2) {
							hits.unshift(value2);
							hitValue -= 2;
						}
						if (hitValue >= 1) {
							hits.unshift(value1);
							hitValue -= 1;
						}
						var match = Number(saveInputData.matched) === 1 ? true : false;						
						answerData.hits.push({value:value,hit:hits.join(','),match:match});
					}
					answerData.hits.sort(function(a,b) {
						if (a.value < b.value) return 1;
						return 0;
					});
					if (answerData.hits.length === 0) answerData.blank = true;
					return answerData;
				}
				return undefined;
			}
		},
		trueFalse:{
			getSaveData:function(inputPaths) {
				var saveInputData = [
					0, //inputID
					0 //trueFalseValue
				]
				inputPaths.sort(function(a,b) {
					return a.inputID-b.inputID;
				});
				for (var i = 0; i < inputPaths.length; i++) {
					var input = inputPaths[i].obj[0];
					if (input.interact.value === true) {
						saveInputData[1] += Math.pow(3,i);
					} else if (input.interact.value === false) {
						saveInputData[1] += 2*Math.pow(3,i);
					}
				}
				//saveInputData.push(saveInputData[1] === 0 ? true : false);
				return saveInputData;
			},
			restoreSaveData:function(inputPaths,saveInputData) {
				inputPaths.sort(function(a,b) {
					return a.inputID-b.inputID;
				});
				var trueFalseValue = Number(saveInputData.trueFalseValue);
				for (var i = inputPaths.length-1; i >= 0; i--) {
					var tri = Math.pow(3,i);
					if (trueFalseValue >= 2*tri) {
						inputPaths[i].obj[0].interact.value = false;
						trueFalseValue -= 2*tri;
					} else if (trueFalseValue >= tri) {
						inputPaths[i].obj[0].interact.value = true;
						trueFalseValue -= tri;
					}
				}
			},
			getAnswerData:function(saveInputData) {
				var answer = {t:[],f:[]};
				var trueFalseValue = Number(saveInputData.trueFalseValue);
				var max = Math.ceil(Math.log(trueFalseValue)/Math.log(3));
				for (var i = max; i >= 0; i--) {
					var tri = Math.pow(3,i);
					if (trueFalseValue >= 2*tri) {
						answer.t.push(i);
						trueFalseValue -= 2*tri;
					} else if (trueFalseValue >= tri) {
						answer.f.push(i);
						trueFalseValue -= tri;
					}
				}
				return answer;
			}
		},
		gridPaths:{
			getSaveData:function(inputPath) {
				var grid = inputPath.obj[0];
				if (un(grid.path)) return []; 
				var inputID = !un(inputPath.inputID) ? inputPath.inputID : 0;
				var gridPaths = grid.path.filter(function(x) {
					return x._deletable === true;
				});
				var saveInputValues = {gridPoint:[],gridLine:[]};
				for (var p = 0; p < gridPaths.length; p++) {
					var gridPath = gridPaths[p];
					if (gridPath.type === 'point') {
						saveInputValues.gridPoint.push([
							inputID,
							Math.round(gridPath.pos[0]*1000), //x
							Math.round(gridPath.pos[1]*1000), //y
							typeof gridPath.radius === 'number' ? gridPath.radius : 8, //radius
							draw.taskQuestion.colorToNumber(typeof gridPath.color === 'string' ? gridPath.color : '#0000ff'), //color
							typeof gridPath.style === 'string' ? gridPath.style : 'cross', //style
							p //drawOrder
						]);
					} else if (gridPath.type === 'line' || gridPath.type === 'lineSegment') {
						saveInputValues.gridLine.push([
							inputID,
							Math.round(gridPath.pos[0][0]*1000), //x0
							Math.round(gridPath.pos[0][1]*1000), //y0
							Math.round(gridPath.pos[1][0]*1000), //x1
							Math.round(gridPath.pos[1][1]*1000), //y1
							draw.taskQuestion.colorToNumber(typeof gridPath.strokeStyle === 'string' ? gridPath.strokeStyle : typeof gridPath.color === 'string' ? gridPath.color : '#0000ff'), //color
							typeof gridPath.lineWidth === 'number' ? gridPath.lineWidth : 5, //lineWidth
							gridPath.showLinePoints === true ? 1 : 0, //showPoints
							gridPath.type === 'lineSegment' ? 1 : 0, //lineSegment
							p, //drawOrder
							0 //dash - not yet supported
						]);
					}
				};
				return saveInputValues;
			},
			restoreSaveData:function(gridPaths,gridPoints,gridLines) {
				var gridPathsByInputID = [];
				for (var p = 0; p < gridPaths.length; p++) {
					gridPathsByInputID[gridPaths[p].inputID] = gridPaths[p];
				}
				for (var p = 0; p < gridPoints.length; p++) {
					var gridPoint = gridPoints[p];
					var gridPath = gridPathsByInputID[Number(gridPoint.inputID)];
					if (un(gridPath)) continue;
					if (un(gridPath._pathsToRestore)) gridPath._pathsToRestore = [];
					gridPath._pathsToRestore.push({
						type:'point',
						pos:[Number(gridPoint.x)/1000,Number(gridPoint.y)/1000],
						radius:Number(gridPoint.radius),
						color:draw.taskQuestion.numberToColor(Number(gridPoint.color)),
						style:gridPoint.style,
						_deletable:true,
						drawOrder:Number(gridPoint.drawOrder)
					});
				}
				for (var p = 0; p < gridLines.length; p++) {
					var gridLine = gridLines[p];
					var gridPath = gridPathsByInputID[gridLine.inputID];
					if (un(gridPath)) continue;
					if (un(gridPath._pathsToRestore)) gridPath._pathsToRestore = [];
					gridPath._pathsToRestore.push({
						type:Number(gridLine.lineSegment) === 1 ? 'lineSegment' : 'line',
						pos:[[Number(gridLine.x0)/1000,Number(gridLine.y0)/1000],[Number(gridLine.x1)/1000,Number(gridLine.y1)/1000]],
						lineWidth:Number(gridLine.lineWidth),
						strokeStyle:draw.taskQuestion.numberToColor(Number(gridLine.color)),
						showLinePoints:Number(gridLine.showPoints) === 1 ? true : false,
						_deletable:true,
						drawOrder:Number(gridLine.drawOrder)
					});
				}
				for (var p = 0; p < gridPaths.length; p++) {
					var gridPath = gridPaths[p];
					if (un(gridPath._pathsToRestore)) continue;
					gridPath._pathsToRestore.sort(function(a,b) {
						return a.drawOrder-b.drawOrder;
					});
					var gridObj = gridPath.obj[0];
					
					//console.log('grid paths restore',gridObj,gridPath._pathsToRestore);
					
					if (un(gridObj.path)) gridObj.path = [];
					gridObj.path = gridObj.path.concat(gridPath._pathsToRestore);
					delete gridPath._pathsToRestore;
				}				
			}
		},
		drawPaths:{
			getSaveData:function(obj) {
				var saveInputValues = {point:[],line:[],tracingPaper:[],tracingPaperPoint:[],tracingPaperLine:[],arc:[],compass:[],protractor:[],ruler:[]};
				var offset = [-obj.left,-obj.top];
				var objs = obj._questionObjs;
				var createdValues = [];
				for (var o = 0; o < objs.length; o++) {
					var obj2 = objs[o];
					if (obj2.type === 'compass2') {
						if (un(obj2._path)) obj2._path = draw.getPathOfObj(obj2);
						if (un(obj2._startAngle)) continue;
						saveInputValues.compass.push([
							0, //inputID
							Math.round((obj2.center1[0]+offset[0])*10), //x
							Math.round((obj2.center1[1]+offset[1])*10), //y 
							Math.round(obj2.angle*1000), //angle
							Math.round(obj2.radius*10), //radius
							obj2.radiusLocked === true ? 1 : 0, //radiusLocked
							obj2.compassVisible === true ? 1 : 0, //visible
							0 //toolOrder
						]);
					} else if (obj2.type === 'protractor2') {
						if (un(obj2._path)) obj2._path = draw.getPathOfObj(obj2);
						if (un(obj2._startAngle)) continue;
						saveInputValues.protractor.push([
							0, //inputID
							Math.round((obj2.center[0]+offset[0])*10), //x
							Math.round((obj2.center[1]+offset[1])*10), //y
							Math.round(obj2.angle*1000), //angle
							obj2.protractorVisible === true ? 1 : 0, //visible
							0 //toolOrder
						]);
					} else if (obj2.type === 'ruler2') {
						if (un(obj2._path)) obj2._path = draw.getPathOfObj(obj2);
						if (un(obj2._startAngle)) continue;
						saveInputValues.ruler.push([
							0, //inputID
							Math.round((obj2.rect[0]+offset[0])*10), //x
							Math.round((obj2.rect[1]+offset[1])*10), //y
							Math.round(obj2.angle*1000), //angle
							obj2.rulerVisible === true ? 1 : 0, //visible
							0 //toolOrder
						]);
					} else if (obj2.type === 'tracingPaper') {
						if (un(obj2._path)) obj2._path = draw.getPathOfObj(obj2);
						saveInputValues.tracingPaper.push([
							0, //inputID
							Math.round((obj2.center[0]+offset[0])*10), //x
							Math.round((obj2.center[1]+offset[1])*10), //y
							typeof obj2.angle === 'number' ? Math.round(obj2.angle*1000) : 0, //angle
							obj2.mode, //mode
							obj2._path.vis === false ? 0 : 1 //visible
						]);
						if (!un(obj2.drawPaths)) {
							for (var i = 0; i < obj2.drawPaths.length; i++) {
								var drawPath = obj2.drawPaths[i];
								if (drawPath.type === 'point') {
									saveInputValues.tracingPaperPoint.push([
										0, //inputID
										Math.round(drawPath.pos[0]*10), //x
										Math.round(drawPath.pos[1]*10), //y
										typeof drawPath.radius === 'number' ? Math.round(drawPath.radius) : 8, //radius
										draw.taskQuestion.colorToNumber(typeof drawPath.color === 'string' ? drawPath.color : '#0000ff'), //color
										drawPath.created //drawOrder
									]);
									createdValues.push(drawPath.created);
								} else if (drawPath.type === 'line') {
									var dash = !un(drawPath.dash) && drawPath.dash.length > 0 && typeof drawPath.dash[0] === 'number' ? drawPath.dash[0] : 0;
									saveInputValues.tracingPaperLine.push([
										0, //inputID
										Math.round(drawPath.pos[0][0]*10), //x0
										Math.round(drawPath.pos[0][1]*10), //y0
										Math.round(drawPath.pos[1][0]*10), //x1
										Math.round(drawPath.pos[1][1]*10), //y1
										draw.taskQuestion.colorToNumber(typeof drawPath.color === 'string' ? drawPath.color : '#0000ff'), //color
										typeof drawPath.thickness === 'number' ? drawPath.thickness : 7, //lineWidth
										dash, //dash
										drawPath.created //drawOrder										
									]);
									createdValues.push(drawPath.created);
								}
							}
						}
					} else if (obj2.type === 'line' && !un(obj2.created)) {
						var dash = !un(obj2.dash) && obj2.dash.length > 0 && typeof obj2.dash[0] === 'number' ? obj2.dash[0] : 0;
						saveInputValues.line.push([
							0, //inputID
							Math.round((obj2.startPos[0]+offset[0])*10), //x0
							Math.round((obj2.startPos[1]+offset[1])*10), //y0
							Math.round((obj2.finPos[0]+offset[0])*10), //x1
							Math.round((obj2.finPos[1]+offset[1])*10), //y1
							draw.taskQuestion.colorToNumber(typeof obj2.color === 'string' ? obj2.color : '#0000ff'), //color
							typeof obj2.thickness === 'number' ? obj2.thickness : 7, //lineWidth
							dash, //dash
							obj2.created //drawOrder
						]);
						createdValues.push(obj2.created);
					} else if (obj2.type === 'point' && !un(obj2.created)) {
						saveInputValues.point.push([
							0, //inputID
							Math.round((obj2.center[0]+offset[0])*10), //x
							Math.round((obj2.center[1]+offset[1])*10), //y
							typeof obj2.radius === 'number' ? Math.round(obj2.radius) : 8, //radius
							draw.taskQuestion.colorToNumber(typeof obj2.color === 'string' ? obj2.color : '#0000ff'), //color
							obj2.created //drawOrder
						]);
						createdValues.push(obj2.created);
					} else if (obj2.type === 'arc' && !un(obj2.created)) {
						saveInputValues.arc.push([
							0, //inputID
							Math.round((obj2.center[0]+offset[0])*10), //x
							Math.round((obj2.center[1]+offset[1])*10), //y
							Math.round(obj2.radius*10), //radius
							Math.round(obj2.startAngle*1000), //startAngle
							Math.round(obj2.finAngle*1000), //finAngle
							obj2.clockwise === true ? 1 : 0, //clockwise
							draw.taskQuestion.colorToNumber(typeof obj2.color === 'string' ? obj2.color : '#0000ff'), //color
							typeof obj2.thickness === 'number' ? obj2.thickness : 7, //lineWidth
							obj2.created //drawOrder
						]);
						createdValues.push(obj2.created);
					} else if (obj2.type === 'compassArc' && !un(obj2.created)) {
						saveInputValues.arc.push([
							0, //inputID
							Math.round((obj2.center[0]+offset[0])*10), //x
							Math.round((obj2.center[1]+offset[1])*10), //y
							Math.round(obj2.radius*10), //radius
							Math.round(obj2.acwFinAngle*1000), //startAngle
							Math.round(obj2.cwFinAngle*1000), //finAngle
							1, //clockwise
							draw.taskQuestion.colorToNumber(typeof obj2.color === 'string' ? obj2.color : '#0000ff'), //color
							typeof obj2.thickness === 'number' ? obj2.thickness : 7, //lineWidth
							obj2.created //drawOrder
						]);
						createdValues.push(obj2.created);
					}
				}
				createdValues.sort();
				var types = ['point','line','tracingPaperPoint','tracingPaperLine','arc'];
				for (var t = 0; t < types.length; t++) {
					var type = types[t];	
					for (var i = 0; i < saveInputValues[type].length; i++) {
						var input = saveInputValues[type][i];
						var index = input.length-1;
						var drawOrder = createdValues.indexOf(input[index]);
						if (drawOrder === -1) continue;
						input[index] = drawOrder;
					}
				}
				return saveInputValues;
			},
			restoreSaveData:function(obj,points,lines,tracingPaper,tracingPaperPoints,tracingPaperLines,arcs,compass,protractor,ruler) {
				var offset = [obj.left,obj.top];
				var pathsToAdd = []; 
				for (var p = 0; p < points.length; p++) {
					var point = points[p];
					pathsToAdd.push({obj:[{
						type:'point',
						center:[Number(point.x)/10+offset[0],Number(point.y)/10+offset[1]],
						radius:Number(point.radius),
						color:draw.taskQuestion.numberToColor(Number(point.color)),
						created:Number(point.drawOrder),
						_taskQuestion:obj
					}]});
				}
				for (var p = 0; p < lines.length; p++) {
					var line = lines[p];
					pathsToAdd.push({obj:[{
						type:'line',
						startPos:[Number(line.x0)/10+offset[0],Number(line.y0)/10+offset[1]],
						finPos:[Number(line.x1)/10+offset[0],Number(line.y1)/10+offset[1]],
						thickness:Number(line.lineWidth),
						color:draw.taskQuestion.numberToColor(Number(line.color)),
						showPoints:Number(line.lineWidth) === 1 ? true : false,
						dash:[Number(line.dash),Number(line.dash)],
						created:Number(line.drawOrder),
						_taskQuestion:obj
					}]});
				}
				for (var p = 0; p < arcs.length; p++) {
					var arc = arcs[p];
					pathsToAdd.push({obj:[{
						type:'arc',
						center:[Number(arc.x)/10+offset[0],Number(arc.y)/10+offset[1]],
						radius:Number(arc.radius)/10,
						startAngle:Number(arc.startAngle)/1000,
						finAngle:Number(arc.finAngle)/1000,
						clockwise:Number(arc.clockwise) === 1 ? true : false,
						thickness:Number(arc.lineWidth),
						color:draw.taskQuestion.numberToColor(Number(arc.color)),
						created:Number(arc.drawOrder),
						_taskQuestion:obj
					}]});
				}
				pathsToAdd.sort(function(a,b) {
					return a.created-b.created;
				});
				var parentPaths = draw.taskQuestion.getQuestionParentPaths(obj);
				for (var p = 0; p < pathsToAdd.length; p++) {
					parentPaths.push(pathsToAdd[p]);
					if (!un(obj._questionPaths)) obj._questionPaths.push(pathsToAdd[p]);
				}
				
				var tp = obj._questionObjs.find(function(x) {
					return x.type === 'tracingPaper';
				});
				if (typeof tp === 'object') {
					if (tracingPaper instanceof Array && typeof tracingPaper[0] === 'object') {
						if (un(tp._startCenter)) tp._startCenter = clone(tp.center);
						if (un(tp._startAngle)) tp._startAngle = tp.angle;
						if (un(tp._startMode)) tp._startMode = tp.mode;
						tp.center = [tracingPaper[0].x/10+offset[0],tracingPaper[0].y/10+offset[1]];
						tp.angle = Number(tracingPaper[0].angle)/1000;
						tp.mode = tracingPaper[0].mode;
						if (!un(tp._path)) {
							if (un(tp._startVisible)) tp._startVisible = tp._path.vis !== false;
							tp._path.vis = Number(tracingPaper[0].visible) === 1 ? true: false;
						}
					}
					var tpPathsToAdd = [];
					for (var p = 0; p < tracingPaperPoints.length; p++) {
						var point = tracingPaperPoints[p];
						tpPathsToAdd.push({
							type:'point',
							pos:[Number(point.x)/10,Number(point.y)/10],
							radius:Number(point.radius),
							color:draw.taskQuestion.numberToColor(Number(point.color)),
							created:Number(point.drawOrder)
						});
					}
					for (var p = 0; p < tracingPaperLines.length; p++) {
						var line = tracingPaperLines[p];
						tpPathsToAdd.push({
							type:'line',
							pos:[[Number(line.x0)/10,Number(line.y0)/10],[Number(line.x1)/10,Number(line.y1)/10]],
							thickness:Number(line.lineWidth),
							color:draw.taskQuestion.numberToColor(Number(line.color)),
							showPoints:Number(line.showPoints) === 1 ? true : false,
							dash:[Number(line.dash),Number(line.dash)],
							created:Number(line.drawOrder)
						});
					}					
					tpPathsToAdd.sort(function(a,b) {
						return a.created-b.created;
					});
										
					if (un(tp.drawPaths)) tp.drawPaths = [];
					for (var p = 0; p < tpPathsToAdd.length; p++) {
						tp.drawPaths.push(tpPathsToAdd[p]);
					}
				}
				
				if (compass instanceof Array && typeof compass[0] === 'object') {
					var c = obj._questionObjs.find(function(x) {
						return x.type === 'compass2';
					});
					if (typeof c === 'object') {
						if (un(c._startCenter1)) c._startCenter1 = [c.center1[0],c.center1[1]];
						if (un(c._startAngle)) c._startAngle = c.angle;
						if (un(c._startRadius)) c._startRadius = c.radius;
						c.center1 = [compass[0].x/10+offset[0],compass[0].y/10+offset[1]];
						c.angle = Number(compass[0].angle)/1000;
						c.radius = Number(compass[0].radius)/10;
						c.radiusLocked = Number(compass[0].radiusLocked) === 1 ? true : false;
						c.compassVisible = Number(compass[0].visible) === 1 ? true : false;
					}
				}
				if (protractor instanceof Array && typeof protractor[0] === 'object') {
					var c = obj._questionObjs.find(function(x) {
						return x.type === 'protractor2';
					});
					if (typeof c === 'object') {
						if (un(c._startCenter)) c._startCenter = [c.center[0],c.center[1]];
						if (un(c._startAngle)) c._startAngle = c.angle;
						c.center = [protractor[0].x/10+offset[0],protractor[0].y/10+offset[1]];
						c.angle = Number(protractor[0].angle)/1000;
						c.protractorVisible = Number(protractor[0].visible) === 1 ? true : false;
					}
				}
				if (ruler instanceof Array && typeof ruler[0] === 'object') {
					var c = obj._questionObjs.find(function(x) {
						return x.type === 'ruler2';
					});
					if (typeof c === 'object') {
						if (un(c._startCenter)) c._startCenter = [c.rect[0],c.rect[1]];
						if (un(c._startAngle)) c._startAngle = c.angle;
						c.rect[0] = ruler[0].x/10+offset[0];
						c.rect[1] = ruler[0].y/10+offset[1];
						c.angle = Number(ruler[0].angle)/1000;
						c.rulerVisible = Number(ruler[0].visible) === 1 ? true : false;
					}
				}
			}
		},
		pieChart:{
			getSaveData:function(inputPath) {
				var input = inputPath.obj[0];
				var saveInputData = [
					!un(inputPath.inputID) ? inputPath.inputID : 0
				];
				for (var a = 0; a < 6; a++) {
					saveInputData[a+1] = !un(input.angles) && !un(input.angles[a]) ? Math.round(input.angles[a]*1000) : -1;
				}
				saveInputData.push(false);
				return saveInputData;
			},
			restoreSaveData:function(inputPath,saveInputData) {
				var input = inputPath.obj[0];
				for (var a = 0; a < 6; a++) {
					if (un(input.angles) || un(input.angles[a]) || saveInputData['angle'+a] === -1 ) continue;
					input.angles[a] = saveInputData['angle'+a]/1000;
				}
			}
		},
		slider:{
			getSaveData:function(inputPath) {
				var input = inputPath.obj[0];
				var saveInputData = [
					!un(inputPath.inputID) ? inputPath.inputID : 0,
					Math.round(input.value*1000),
					false
				];
				return saveInputData;
			},
			restoreSaveData:function(inputPath,saveInputData) {
				var input = inputPath.obj[0];
				input.value = Number(saveInputData.sliderValue)/1000;
				if (!un(input.interact) && typeof input.interact.onchange === 'function') input.interact.onchange(input);
			}
		},
		hexagonalLattice:{
			getSaveData:function(inputPath) {
				var input = inputPath.obj[0];
				var saveInputData = [
					!un(inputPath.inputID) ? inputPath.inputID : 0
				];
				var blank = true;
				for (var c = 0; c < 10; c++) {
					var columnValue = 0;
					if (!un(input.columns) && input.columns[c] instanceof Array) {
						for (var r = 0; r < input.columns[c].length; r++) {
							if (!un(input.columns[c][r]) && input.columns[c][r].selected === true) columnValue += Math.pow(2,r);
						}
					}
					if (columnValue > 0) blank = false;
					saveInputData[c+1] = columnValue;
				}
				saveInputData.push(blank);
				return saveInputData;
			},
			restoreSaveData:function(inputPath,saveInputData) {
				var input = inputPath.obj[0];
				for (var c = 0; c < 10; c++) {
					var columnValue = Number(saveInputData['column'+c]);
					if (columnValue === 0 || un(input.columns) || input.columns[c] instanceof Array === false) continue;
					for (var r = input.columns[c].length-1; r >= 0; r--) {
						if (un(input.columns[c][r])) continue;
						if (columnValue >= Math.pow(2,r)) {
							input.columns[c][r].selected = true;
							columnValue -= Math.pow(2,r)
						}
					}
				}
			}
		}
	},
	
	drawTools: { // handles points, lines & tracingPaper
		getReducedDrawnPaths: function(obj) {
			draw.taskQuestion.getPaths(obj);
			var objs = obj._questionObjs;
			var offset = [-obj.left,-obj.top];
			var paths = {};
			for (var o = 0; o < objs.length; o++) {
				var obj2 = clone(objs[o]);
				if (obj2.type === 'line' && !un(obj2.created)) {
					var pos = [
						[obj2.startPos[0]-obj.left,obj2.startPos[1]-obj.top],
						[obj2.finPos[0]-obj.left,obj2.finPos[1]-obj.top]
					]
					if (pos[0] instanceof Array && pos[1] instanceof Array) {
						pos[0][0] = roundToNearest(pos[0][0],0.1);
						pos[0][1] = roundToNearest(pos[0][1],0.1);
						pos[1][0] = roundToNearest(pos[1][0],0.1);
						pos[1][1] = roundToNearest(pos[1][1],0.1);
						if (isEqual(pos[0],pos[1]) === false) {
							if (un(paths.lines)) paths.lines = [];
							var prevLine = paths.lines.find(function(x) {return arraysEqual(x,pos);});
							if (typeof prevLine !== 'object') {
								paths.lines.push(pos);
							}
						}
					}
				} else if (obj2.type === 'point' && !un(obj2.created)) {
					var pos = vector.addVectors(obj2.center,offset);
					if (pos instanceof Array) {
						pos[0] = roundToNearest(pos[0],0.1);
						pos[1] = roundToNearest(pos[1],0.1);
						if (un(paths.points)) paths.points = [];
						var prevPoint = paths.points.find(function(x) {return arraysEqual(x,pos);});
						if (typeof prevPoint !== 'object') paths.points.push(pos);
					}
				} else if (obj2.type === 'arc' && !un(obj2.created)) {
					var pos = [vector.addVectors(obj2.center,offset),obj2.radius];
					if (pos[0] instanceof Array && typeof pos[1] === 'number') {
						pos[0][0] = roundToNearest(pos[0][0],0.1);
						pos[0][1] = roundToNearest(pos[0][1],0.1);
						pos[1] = roundToNearest(pos[1],0.1);
						if (Math.abs(obj2.startAngle-obj2.finAngle) >= 6.28) {
							pos.push(0,6.283);
						} else { 
							if (obj2.clockwise !== true) {
								pos.push(obj2.finAngle%(2*Math.PI),obj2.startAngle)%(2*Math.PI);
							} else {
								pos.push(obj2.startAngle%(2*Math.PI),obj2.finAngle%(2*Math.PI));
							}
						}
						while (pos[2] < 0) pos[2] += 2*Math.PI;
						pos[2] = roundToNearest(pos[2],0.001);
						while (pos[3] < 0) pos[3] += 2*Math.PI;
						pos[3] = roundToNearest(pos[3],0.001);
						if (pos[2] !== pos[3]) {
							if (un(paths.arcs)) paths.arcs = [];
							var prevArc = paths.arcs.find(function(x) {return arraysEqual(x,pos);});
							if (typeof prevArc !== 'object') paths.arcs.push(pos);
						}
					}
				} else if (obj2.type === 'compassArc' && !un(obj2.created)) {
					var pos = [vector.addVectors(obj2.center,offset),obj2.radius];
					if (pos[0] instanceof Array && typeof pos[1] === 'number') {
						pos[0][0] = roundToNearest(pos[0][0],0.1);
						pos[0][1] = roundToNearest(pos[0][1],0.1);
						pos[1] = roundToNearest(pos[1],0.1);
						pos[2] = obj2.acwFinAngle;
						pos[3] = obj2.cwFinAngle;
						while (pos[2] < 0) pos[2] += 2*Math.PI;
						pos[2] = roundToNearest(pos[2],0.001);
						while (pos[3] < 0) pos[3] += 2*Math.PI;
						pos[3] = roundToNearest(pos[3],0.001);
						if (pos[2] !== pos[3]) {
							if (un(paths.arcs)) paths.arcs = [];
							var prevArc = paths.arcs.find(function(x) {return arraysEqual(x,pos);});
							if (typeof prevArc !== 'object') paths.arcs.push(pos);
						}
						console.log(pos,obj2);
					}
				}
			}
			if (!un(paths.points)) {
				paths.points.sort(function(a,b) {
					if (a[0] !== b[0]) return a[0]-b[0];
					if (a[1] !== b[1]) return a[1]-b[1];
				});
			}
			if (!un(paths.lines)) {
				paths.lines = draw.taskQuestion.drawTools.reduceLines(paths.lines);
				paths.lines.sort(function(a,b) {
					if (a[0][0] !== b[0][0]) return a[0][0]-b[0][0];
					if (a[0][1] !== b[0][1]) return a[0][1]-b[0][1];
					if (a[1][0] !== b[1][0]) return a[1][0]-b[1][0];
					if (a[1][1] !== b[1][1]) return a[1][1]-b[1][1];
				});
			}
			if (!un(paths.arcs)) {
				paths.arcs = draw.taskQuestion.drawTools.reduceArcs(paths.arcs);
				paths.arcs.sort(function(a,b) {
					if (a[0][0] !== b[0][0]) return a[0][0]-b[0][0];
					if (a[0][1] !== b[0][1]) return a[0][1]-b[0][1];
					if (a[1] !== b[1]) return a[1]-b[1];
					if (a[2] !== b[2]) return a[2]-b[2];
					if (a[3] !== b[3]) return a[3]-b[3];
				});
			}
			return paths;
		},
		reduceLines: function(lines) {
			return reduceLineSegments(lines);
		},
		reduceArcs: function(arcs) {
			for (var a = 0; a < arcs.length; a++) {
				var arc0 = arcs[a];
				for (var b = a+1; b < arcs.length; b++) {
					var arc1 = arcs[b];
					if (dist(arc0[0],arc1[0]) > 1 || Math.abs(arc0[1]-arc1[1]) > 2) continue;
					var a0 = arc0[2];
					var a1 = arc0[3];
					var b0 = arc1[2];
					var b1 = arc1[3];
					if (Math.abs(a1-a0) > 6.28 || Math.abs(b1-b0) > 6.28) {
						arc0[2] = 0;
						arc0[3] = 6.283;
						arcs.splice(b,1);
						b--;
						//console.log('reduced0:',a0,a1,b0,b1,arc0[2],arc0[3]);
					} else if (draw.taskQuestion.drawTools.angleBetweenAngles(a0,b0,b1)) {
						if (draw.taskQuestion.drawTools.angleBetweenAngles(a1,b0,b1)) {
							arc0[2] = b0;
							arc0[3] = b1;
						} else {
							arc0[2] = b0;
							arc0[3] = a1;
						}
						arcs.splice(b,1);
						b--;
						//console.log('reduced1:',a0,a1,b0,b1,arc0[2],arc0[3]);
					} else if (draw.taskQuestion.drawTools.angleBetweenAngles(a1,b0,b1)) {
						arc0[2] = a0;
						arc0[3] = b1;
						arcs.splice(b,1);
						b--;
						//console.log('reduced2:',a0,a1,b0,b1,arc0[2],arc0[3]);
					} else if (draw.taskQuestion.drawTools.angleBetweenAngles(b0,a0,a1)) {
						if (draw.taskQuestion.drawTools.angleBetweenAngles(b1,a0,a1)) {
							arc0[2] = a0;
							arc0[3] = a1;
						} else {
							arc0[2] = a0;
							arc0[3] = b1;
						}
						arcs.splice(b,1);
						b--;
						//console.log('reduced3:',a0,a1,b0,b1,arc0[2],arc0[3]);
					} else if (draw.taskQuestion.drawTools.angleBetweenAngles(b1,a0,a1)) {
						arc0[2] = b0;
						arc0[3] = a1;
						arcs.splice(b,1);
						b--;
						//console.log('reduced4:',a0,a1,b0,b1,arc0[2],arc0[3]);
					}
					
					/*} else if (draw.taskQuestion.drawTools.angleBetweenAngles(a0,b0,b1) ||
							   draw.taskQuestion.drawTools.angleBetweenAngles(a1,b0,b1) ||
							   draw.taskQuestion.drawTools.angleBetweenAngles(b0,a0,a1) ||
							   draw.taskQuestion.drawTools.angleBetweenAngles(b1,a0,a1)) {
						arc0[2] = (a0 < a1 & b0 > b1) ? b0 : (a0 > a1 & b0 < b1) ? a0 : Math.min(a0,b0);
						arc0[3] = (a0 < a1 & b0 > b1) ? b1 : (a0 > a1 & b0 < b1) ? a1 : Math.max(a1,b1);
						//arc0[2] = Math.min(a0,b0);
						//arc0[3] = Math.max(a1,b1);
						arcs.splice(b,1);
						b--;
						console.log('reduced:',a0,a1,b0,b1,arc0[2],arc0[3]);
					}*/
				}
			}
			return arcs;
		},
		
		checkInputValuesForArc: function(inputValues, center, radius, angle, tolC, tolR) { // checks if an arc through a given angle has been drawn
			if (!un(inputValues.arcs)) {
				if (un(tolC)) tolC = 15;
				if (un(tolR)) tolR = 15;
				for (var a = 0; a < inputValues.arcs.length; a++) {
					var arc = inputValues.arcs[a];
					if (dist(arc[0],center) < tolC && Math.abs(arc[1]-radius) < tolR && draw.taskQuestion.drawTools.arcIncludesAngle(arc,angle) === true) {
						return true;
					}
				}
			}
			return false;
		},
		arcIncludesAngle: function(arc, angle) {
			return (arc[2] < arc[3] && arc[2] <= angle && angle <= arc[3]) || (arc[3] < arc[2] && (arc[3] <= angle || arc[2] >= angle));
		},
		checkInputValuesForLine: function(inputValues, pos1, pos2, tol) { // checks if a lineSegment through two points has been drawn
			if (!un(inputValues.lines)) {
				if (un(tol)) tol = 15;
				for (var l = 0; l < inputValues.lines.length; l++) {
					var line = inputValues.lines[l];
					if (distancePointToLineSegment(pos1,line[0],line[1]) < tol && distancePointToLineSegment(pos2,line[0],line[1]) < tol) {
						return true;
					}
				}
			}
			return false;
		},
		angleBetweenAngles: function(angle,startAngle,finAngle) {
			if (startAngle <= finAngle) {
				return startAngle <= angle && angle <= finAngle;
			} else {
				return angle >= startAngle || angle <= finAngle;
			}
		},
		checkLinesForPolygon: function(lines,polygon) {
			var lines = clone(lines);
			var len = lines.length;
			for (var i = 0; i < len; i++) {
				lines.push(clone([lines[i][1],lines[i][0]]));
			}
			for (var i = 0; i < lines.length; i++) {
				lines[i][2] = vector.getVectorAB(lines[i][0],lines[i][1]);
			}
			var polygonVectors = [];
			for (var i = 0; i < polygon.length; i++) {
				polygonVectors.push(vector.getVectorAB(polygon[i],polygon[(i+1)%polygon.length]));
			}
			var polygonsFound = [];
			for (var l0 = 0; l0 < lines.length; l0++) {
				var line0 = lines[l0];
				var lineVector = line0[2];
				if (lineVector[0] !== polygonVectors[0][0] || lineVector[1] !== polygonVectors[0][1]) continue;
				var polygonInstance = [line0[0]];
				var point = line0[1];
				var linesUsed = [line0];
				for (var p = 1; p < polygonVectors.length; p++) {
					var polygonVector = polygonVectors[p];
					var found = false;
					for (l1 = 0; l1 < lines.length; l1++) {
						var line1 = lines[l1];
						if (linesUsed.indexOf(line1) > -1) continue;
						if (line1[0][0] !== point[0] || line1[0][1] !== point[1]) continue;
						if (line1[2][0] !== polygonVector[0] || line1[2][1] !== polygonVector[1]) continue;
						polygonInstance.push(point);
						point = line1[1];
						linesUsed.push(line1);
						found = true;
						break;
					}
					if (found === false) break;
				}
				if (found === false) continue;
				polygonsFound.push({
					offset:vector.getVectorAB(polygon[0],line0[0]),
					polygon:polygonInstance
				});
			}
			
			return polygonsFound;
		},
		linesToPolygon: function(lines) {
			var lines = clone(lines);
			var polygon = [lines[0][0],lines[0][1]];
			var point = lines[0][1];
			lines.shift();
			for (var l = 0; l < lines.length; l++) {
				var line = lines[l];
				if (line[0][0] === point[0] && line[0][1] === point[1]) {
					point = line[1];
					if (point[0] === polygon[0][0] && point[1] === polygon[0][1]) break;
					polygon.push(point);
					lines.splice(l,1);
					l = -1;
				} else if (line[1][0] === point[0] && line[1][1] === point[1]) {
					point = line[0];
					if (point[0] === polygon[0][0] && point[1] === polygon[0][1]) break;
					polygon.push(point);
					lines.splice(l,1);
					l = -1;
				}
			}
			return polygon;
		},
		/*getSaveData: function(cell) { // somewhat condensed
			var obj = cell._obj;
			draw.taskQuestion.getPaths(obj);
			var offset = [-obj.left,-obj.top];
			var saveData = {objs:[]};
			var objs = obj._questionObjs;
			var createdTimeStamps = [];
			for (var o = 0; o < objs.length; o++) {
				var obj2 = objs[o];
				if (obj2.type === 'tracingPaper') {
					var center = vector.addVectors(obj2.center,offset);
					center[0] = roundToNearest(center[0],0.1);
					center[1] = roundToNearest(center[1],0.1);
					if (un(obj2._path)) obj2._path = draw.getPathOfObj(obj2);
					saveData.tracingPaper = {
						angle:obj2.angle || 0,
						center:center,
						mode:obj2.mode,
						visible:obj2._path.vis === false ? false : true
					};
					if (!un(obj2._foldFactor)) saveData.tracingPaper.foldFactor = obj2._foldFactor;
					if (!un(obj2.drawPaths)) {
						saveData.tracingPaper.drawPaths = [];
						for (var i = 0; i < obj2.drawPaths.length; i++) {
							var drawPath = clone(obj2.drawPaths[i]);
							var drawPath2 = {};
							if (drawPath.type === 'line') {
								drawPath2.line = drawPath.pos;
							} else if (drawPath.type === 'point') {
								drawPath2.point = drawPath.pos;
								if (!un(drawPath.radius) && drawPath.radius !== 7.5) {
									drawPath2.radius = drawPath.radius;
								}
							}
							if (!un(drawPath.created)) {
								drawPath2.created = drawPath.created;
								if (createdTimeStamps.indexOf(drawPath.created) === -1) {
									createdTimeStamps.push(drawPath.created)
								}
							}
							if (!un(drawPath.color) && drawPath.color.toLowerCase() !== '#00f') {
								drawPath2.color = drawPath.color;
							}
							if (!un(drawPath.thickness) && drawPath.thickness !== 7) {
								drawPath2.thickness = drawPath.thickness;
							}
							if (!un(drawPath.dash) && drawPath.dash instanceof Array && drawPath.dash.length > 0 && (drawPath.dash[0] > 0 || drawPath.dash[1] > 0)) {
								drawPath2.dash = drawPath.dash.slice(0,2);
							}
							saveData.tracingPaper.drawPaths.push(drawPath2);
						}
					}
				} else if (obj2.type === 'line' && !un(obj2.created)) {
					var obj3 = {};
					var startPos = vector.addVectors(obj2.startPos,offset);
					startPos[0] = roundToNearest(startPos[0],0.1);
					startPos[1] = roundToNearest(startPos[1],0.1);
					var finPos = vector.addVectors(obj2.finPos,offset);
					finPos[0] = roundToNearest(finPos[0],0.1);
					finPos[1] = roundToNearest(finPos[1],0.1);
					obj3.line = [startPos,finPos];
					obj3.created = obj2.created;
					if (createdTimeStamps.indexOf(obj2.created) === -1) {
						createdTimeStamps.push(obj2.created)
					}
					if (!un(obj2.color) && obj2.color.toLowerCase() !== '#00f') {
						obj3.color = obj2.color;
					}
					if (!un(obj2.thickness) && obj2.thickness !== 7) {
						obj3.thickness = obj2.thickness;
					}
					if (!un(obj2.dash) && obj2.dash instanceof Array && obj2.dash.length > 0 && (obj2.dash[0] > 0 || obj2.dash[1] > 0)) {
						obj3.dash = obj2.dash.slice(0,2);
					}
					saveData.objs.push(obj3);
				} else if (obj2.type === 'point' && !un(obj2.created)) {
					var obj3 = {};
					var center = vector.addVectors(obj2.center,offset);				
					center[0] = roundToNearest(center[0],0.1);
					center[1] = roundToNearest(center[1],0.1);
					obj3.point = center;
					obj3.created = obj2.created;
					if (createdTimeStamps.indexOf(obj2.created) === -1) {
						createdTimeStamps.push(obj2.created)
					}
					if (!un(obj2.radius) && obj2.radius !== 7.5) {
						obj3.radius = obj2.radius;
					}
					if (!un(obj2.color) && obj2.color.toLowerCase() !== '#00f') {
						obj3.color = obj2.color;
					}
					saveData.objs.push(obj3);
				}
			}
			createdTimeStamps.sort();
			//console.log('createdTimeStamps',createdTimeStamps);
			for (var s = 0; s < saveData.objs.length; s++) {
				var obj2 = saveData.objs[s];
				if (typeof obj2.created === 'number') {
					var index = createdTimeStamps.indexOf(obj2.created);
					if (index > -1) obj2.created = index;
				}
			}
			if (!un(saveData.tracingPaper) && !un(saveData.tracingPaper.drawPaths)) {
				for (var s = 0; s < saveData.tracingPaper.drawPaths.length; s++) {
					var obj2 = saveData.tracingPaper.drawPaths[s];
					if (typeof obj2.created === 'number') {
						var index = createdTimeStamps.indexOf(obj2.created);
						if (index > -1) obj2.created = index;
					}
				}
			}
			//console.log('saveData',saveData);
			return saveData;
		},
		restoreSaveData: function(cell,saveData) {
			draw.taskQuestion.reset(cell);
			var obj = cell._obj;
			//console.log('restoreSaveData',saveData);
			var offset = [obj.left,obj.top];
			var paths = draw.taskQuestion.getQuestionParentPaths(obj);
			for (var o = 0; o < saveData.objs.length; o++) {
				var obj2 = clone(saveData.objs[o]);
				if (obj2.type === 'line') {
					obj2.startPos = vector.addVectors(obj2.startPos,offset);
					obj2.finPos = vector.addVectors(obj2.finPos,offset);
					paths.push({obj:[obj2]});
				} else if (obj2.type === 'point') {
					obj2.center = vector.addVectors(obj2.center,offset);	
					paths.push({obj:[obj2]});
				} else if (!un(obj2.line)) {
					obj2.type = 'line';
					obj2.startPos = vector.addVectors(obj2.line[0],offset);
					obj2.finPos = vector.addVectors(obj2.line[1],offset);
					if (un(obj2.created)) obj2.created = 0;
					if (un(obj2.color)) obj2.color = '#00F';
					if (un(obj2.thickness)) obj2.thickness = 7;
					delete obj2.line;
					paths.push({obj:[obj2]});
				} else if (!un(obj2.point)) {
					obj2.type = 'point';
					obj2.center = vector.addVectors(obj2.point,offset);
					if (un(obj2.created)) obj2.created = 0;
					if (un(obj2.color)) obj2.color = '#00F';
					if (un(obj2.radius)) obj2.radius = 7.5;
					delete obj2.point;
					paths.push({obj:[obj2]});
				}
			}
			if (!un(saveData.tracingPaper)) {
				draw.taskQuestion.getPaths(obj);
				var tp = obj._questionObjs.find(function(x) {return x.type === 'tracingPaper';});
				if (typeof tp === 'object') {
					tp.angle = saveData.tracingPaper.angle;
					tp.center = vector.addVectors(saveData.tracingPaper.center,offset);
					tp.mode = saveData.tracingPaper.mode;
					tp._path.vis === saveData.visible === false ? false : true;
					if (!un(saveData.tracingPaper.foldFactor)) tp._foldFactor = saveData.tracingPaper.foldFactor;
					if (!un(saveData.tracingPaper.drawPaths)) {
						tp.drawPaths = [];
						for (var d = 0; d < saveData.tracingPaper.drawPaths.length; d++) {
							var drawPath = saveData.tracingPaper.drawPaths[d];
							if (!un(drawPath.line)) {
								drawPath.type = 'line';
								drawPath.pos = drawPath.line;
								if (un(drawPath.thickness)) drawPath.thickness = 7;
								if (un(drawPath.color)) drawPath.color = '#00F';
								delete drawPath.line;
							} else if (!un(drawPath.point)) {
								drawPath.type = 'point';
								drawPath.pos = drawPath.point;
								if (un(drawPath.radius)) drawPath.radius = 7.5;
								if (un(drawPath.color)) drawPath.color = '#00F';
								delete drawPath.point;
							}
							tp.drawPaths.push(drawPath);
						}
					}
				}
			}
		},
		*/
		getSaveData: function(cell) {
			var obj = cell._obj;
			draw.taskQuestion.getPaths(obj);
			var offset = [-obj.left,-obj.top];
			var saveData = {objs:[]};
			var objs = obj._questionObjs;
			for (var o = 0; o < objs.length; o++) {
				var obj2 = objs[o];
				if (obj2.type === 'tracingPaper') {
					var center = vector.addVectors(obj2.center,offset);
					center[0] = roundToNearest(center[0],0.1);
					center[1] = roundToNearest(center[1],0.1);
					if (un(obj2._path)) obj2._path = draw.getPathOfObj(obj2);
					saveData.tracingPaper = {
						angle:obj2.angle || 0,
						center:center,
						mode:obj2.mode,
						visible:obj2._path.vis === false ? false : true
					};
					if (!un(obj2._foldFactor)) saveData.tracingPaper.foldFactor = obj2._foldFactor;
					if (!un(obj2.drawPaths)) {
						saveData.tracingPaper.drawPaths = clone(obj2.drawPaths);
						for (var i = 0; i < saveData.tracingPaper.drawPaths.length; i++) {
							var drawPath = saveData.tracingPaper.drawPaths[i];
							for (var key in drawPath) if (key.indexOf('_') === 0) delete drawPath[key];
						}
					}
				} else if (obj2.type === 'line' && !un(obj2.created)) {
					obj3 = draw.clone(obj2);
					obj3.startPos = vector.addVectors(obj2.startPos,offset);
					obj3.startPos[0] = roundToNearest(obj3.startPos[0],0.1);
					obj3.startPos[1] = roundToNearest(obj3.startPos[1],0.1);
					obj3.finPos = vector.addVectors(obj2.finPos,offset);
					obj3.finPos[0] = roundToNearest(obj3.finPos[0],0.1);
					obj3.finPos[1] = roundToNearest(obj3.finPos[1],0.1);
					saveData.objs.push(obj3);
				} else if (obj2.type === 'point' && !un(obj2.created)) {
					obj3 = draw.clone(obj2);
					obj3.center = vector.addVectors(obj2.center,offset);					
					saveData.objs.push(obj3);
				}
			}
			//console.log('saveData',saveData);
			return saveData;
		},
		restoreSaveData: function(cell,saveData) {
			draw.taskQuestion.reset(cell);
			var obj = cell._obj;
			var offset = [obj.left,obj.top];
			var paths = draw.taskQuestion.getQuestionParentPaths(obj);
			for (var o = 0; o < saveData.objs.length; o++) {
				var obj2 = clone(saveData.objs[o]);
				if (obj2.type === 'line') {
					obj2.startPos = vector.addVectors(obj2.startPos,offset);
					obj2.finPos = vector.addVectors(obj2.finPos,offset);
					paths.push({obj:[obj2]});
				} else if (obj2.type === 'point') {
					obj2.center = vector.addVectors(obj2.center,offset);	
					paths.push({obj:[obj2]});
				}
			}
			if (!un(saveData.tracingPaper)) {
				draw.taskQuestion.getPaths(obj);
				var tp = obj._questionObjs.find(function(x) {return x.type === 'tracingPaper';});
				if (typeof tp === 'object') {
					tp.angle = saveData.tracingPaper.angle;
					tp.center = vector.addVectors(saveData.tracingPaper.center,offset);
					tp.mode = saveData.tracingPaper.mode;
					tp._path.vis === saveData.visible === false ? false : true;
					if (!un(saveData.tracingPaper.foldFactor)) tp._foldFactor = saveData.tracingPaper.foldFactor;
					if (!un(saveData.tracingPaper.drawPaths)) tp.drawPaths = saveData.tracingPaper.drawPaths;
				}
			}
		},
		
		getAnswer: function(cell) {
			var obj = cell._obj;
			if (!un(obj.questionType) && ['reflection','rotation','translation','enlargement'].indexOf(obj.questionType) > -1) {
				var answer = draw.taskQuestionTransformation.getAnswerTransformation(obj,obj.questionType);
				//console.log('answer',answer);
				return answer;
			}
			var answer = draw.taskQuestion.drawTools.getReducedDrawnPaths(obj);
			return answer;
		},
		check: function(obj, answer) {
			if (!un(obj.questionType) && ['reflection','rotation','translation','enlargement'].indexOf(obj.questionType) > -1) {
				var check = draw.taskQuestionTransformation.checkTransformationQuestion(obj,obj.questionType,answer);
				//console.log('check',check);
				return check;
			}
			return false;
		},
		restoreAnswer: function(cell,answer) {
			draw.taskQuestion.reset(cell);
			var obj = cell._obj;
			var offset = [obj.left,obj.top];
			if (!un(answer.points)) {
				for (var p = 0; p < answer.points.length; p++) {
					var point = answer.points[p];
					draw.path.push({obj:[{
						type:'point',
						center:vector.addVectors(point,offset),
						radius:7.5,
						color:'#F00',
						thickness:5,
						fillColor:'#F00',
						showCenter:false,
						created:new Date().getTime()
					}]})
				}
			} else if (!un(answer.lines)) {
				for (var l = 0; l < answer.lines.length; l++) {
					var point = answer.lines[l];
					draw.path.push({obj:[{
						type:'line',
						startPos:vector.addVectors(line[0],offset),
						startPos:vector.addVectors(line[1],offset),
						color:'#F00',
						thickness:5,
						created:new Date().getTime()
					}]});
				}
			}
			draw.taskQuestion.getPaths(obj);
		},
		showAnswerMode: function(cell,answers) {
			var obj = cell._obj;
			/*if (typeof obj.showAnswer === 'function') {
				obj.showAnswer(obj);
				return;
			}*/
			if (!un(obj.questionType) && ['reflection','rotation','translation','enlargement'].indexOf(obj.questionType) > -1) {
				draw.taskQuestionTransformation.showAnswer(obj,obj.questionType);
				return;
			}
		},
		reset: function(cell) {
			var obj = cell._obj;
			draw.taskQuestion.getPaths(obj);
			var offset = [-obj.left,obj.top];
			var objs = obj._questionObjs;
			var paths = draw.taskQuestion.getQuestionParentPaths(obj);
			for (var o = 0; o < objs.length; o++) {
				var obj2 = objs[o];
				if (obj2.type === 'tracingPaper') {
					if (!un(obj2._startAngle)) obj2.angle = obj2._startAngle;
					if (!un(obj2._startCenter)) obj2.center = clone(obj2._startCenter);
					if (!un(obj2._startMode)) obj2.mode = obj2._startMode;
					if (!un(obj2._startVisible)) obj2._path.vis = obj2._startVisible;
					//console.log(obj2);
					delete obj2._disabled;
					delete obj2.drawPaths;
				} else if (obj2.type === 'compass2') {
					if (!un(obj2._startAngle)) obj2.angle = obj2._startAngle;
					if (!un(obj2._startCenter1)) obj2.center1 = clone(obj2._startCenter1);
					if (!un(obj2._startRadius)) obj2.radius = obj2._startRadius;
					if (!un(obj2._startVisible)) obj2.compassVisible = obj2._startVisible;
					obj2.radiusLocked = false;
					//console.log(obj2);
					delete obj2._disabled;
				} else if (obj2.type === 'protractor2') {
					if (!un(obj2._startAngle)) obj2.angle = obj2._startAngle;
					if (!un(obj2._startCenter)) obj2.center = clone(obj2._startCenter);
					if (!un(obj2._startVisible)) obj2.protractorVisible = obj2._startVisible;
					//console.log(obj2);
					delete obj2._disabled;
				} else if (obj2.type === 'ruler2') {
					if (!un(obj2._startAngle)) obj2.angle = obj2._startAngle;
					if (!un(obj2._startCenter)) {
						obj2.rect[0] = obj2._startCenter[0];
						obj2.rect[1] = obj2._startCenter[1];
					}
					if (!un(obj2._startVisible)) obj2.rulerVisible = obj2._startVisible;
					//console.log(obj2);
					delete obj2._disabled;
				} else if (['line','point','arc'].indexOf(obj2.type) > -1 && !un(obj2.created)) {
					var path = obj2._path;
					var index = paths.indexOf(path);
					if (index > -1) paths.splice(index,1);
				}
			}
			if (draw._drawToolsCurrentTaskQuestion === obj && draw.drawMode !== 'none') changeDrawMode('none');
			draw.taskQuestion.getPaths(obj);
		},
		answerToTableDisplay: function(cell,answer) {
			//console.log('answerToTableDisplay',answer);
			if (!un(answer.description)) return [answer.description];
			return [''];
		},
		tableDisplayToAnswer: function(cell,txt) {
			return false;
		},

		removeLastDrawPath: function(obj,type,removeLastIfCountIsEqualTo) { // called from _draw2.js - drawClickStartDraw & ruler & compass draw
			draw.taskQuestion.getPaths(obj);
			if (!un(obj._questionObjs)) {
				var count = 0;
				var mostRecent = [];
				for (var o = 0; o < obj._questionObjs.length; o++) {
					var obj2 = obj._questionObjs[o];
					if (obj2.type === 'tracingPaper' && obj2.drawPaths instanceof Array) {
						for (var p = 0; p < obj2.drawPaths.length; p++) {
							var obj3 = obj2.drawPaths[p];
							if (!un(obj3.created)) {
								count++;
								if (mostRecent.length === 0 || obj3.created > mostRecent[0].obj.created) {
									mostRecent = [{
										obj:obj3,
										tracingPaper:obj2
									}];
								} else if (obj3.created === mostRecent[0].obj.created) {
									mostRecent.push({
										obj:obj3,
										tracingPaper:obj2
									});
								}
							}
						}
					} else if (!un(obj2.created) && (typeof type !== 'string' || obj2.type === type)) {
						count++;
						if (mostRecent.length === 0 || obj2.created > mostRecent[0].obj.created) {
							mostRecent = [{
								obj:obj2
							}];
						} else if (obj2.created === mostRecent[0].obj.created) {
							mostRecent.push({
								obj:obj2
							});
						}
					}
				}
				//console.log(obj,count,mostRecent);
				if (mostRecent.length > 0 && (typeof removeLastIfCountIsEqualTo !== 'number' || count >= removeLastIfCountIsEqualTo)) {
					for (var i = 0; i < mostRecent.length; i++) {
						var objToRemove = mostRecent[i].obj;
						if (!un(mostRecent[i].tracingPaper)) {
							var index = mostRecent[i].tracingPaper.drawPaths.indexOf(objToRemove);
							if (index > -1) mostRecent[i].tracingPaper.drawPaths.splice(index,1);
						} else {
							var parentPaths = draw.taskQuestion.getQuestionParentPaths(obj);
							var path = objToRemove._path;
							var index = path.obj.indexOf(objToRemove);
							if (index > -1) path.obj.splice(index,1);
							if (path.obj.length === 0) {
								var index2 = parentPaths.indexOf(path);
								if (index2 > -1) {
									parentPaths.splice(index2,1);
								}
							}
						}
					}
				}
			}
				
		}
	},
	mixed: { // requires custom functions
		getSaveData: function(cell) {
			var obj = cell._obj;
			if (typeof obj.getSaveData === 'function') {
				return obj.getSaveData(obj);
			}
			return {};
		},
		restoreSaveData: function(cell,saveData) {
			var obj = cell._obj;
			if (typeof obj.restoreSaveData === 'function') {
				obj.restoreSaveData(obj,saveData);
			}
		},
		getAnswer: function(cell) {
			var obj = cell._obj;
			if (typeof obj.getAnswer === 'function') {
				return obj.getAnswer(obj);
			}
			return {};
		},
		check: function(obj, answer) {
			if (typeof obj.check === 'function') {
				return obj.check(obj, answer[0]);
			}
			return false;
		},
		restoreAnswer: function(cell,answer) {
			var obj = cell._obj;
			if (typeof obj.restoreAnswer === 'function') {
				obj.restoreAnswer(obj,saveData);
			}
		},
		showAnswerMode: function(cell,answers) {
			var obj = cell._obj;
			if (typeof obj.showAnswer === 'function') {
				obj.showAnswer(obj);
			}
		},
		reset: function(cell) {
			var obj = cell._obj;
			if (typeof obj.reset === 'function') {
				obj.reset(obj);
			} else if (!un(obj._inputTypes)) {
				for (var inputType in obj._inputTypes) {
					var inputs = obj._inputTypes[inputType];
					switch (inputType) {
						case 'text':
							for (var i = 0; i < inputs.length; i++) {
								var obj2 = inputs[i].obj[0];
								obj2.text = [""];
								delete obj2.color;
								delete obj2._inputFeedbackMode;
							}
							break;
						case 'select':
							for (var i = 0; i < inputs.length; i++) {
								var obj2 = inputs[i].obj[0];
								var cells = draw.table2.getCells(obj2);
								for (var c = 0; c < cells.length; c++) {
									var cell = cells[c];
									cell.toggle = false;
								}
							}
							break;
						case 'trueFalse':
							for (var i = 0; i < inputs.length; i++) {
								var obj2 = inputs[i].obj[0];
								delete obj2.interact.value;
							}
							break;
						case 'grid':
							for (var i = 0; i < inputs.length; i++) {						
								var obj2 = inputs[i].obj[0];
								if (un(obj2.path)) continue;
								for (var p = 0; p < obj2.path.length; p++) {
									var path = obj2.path[p];
									if (path._deletable !== true) continue;
									obj2.path.splice(p,1);
									p--;
								}
							}
							break;
						case 'drag':
						case 'drawTools':
							draw.taskQuestion[inputType].reset(cell);
							break;						
					}
				}
			}
		},
		answerToTableDisplay: function(cell,answer) {
			var obj = cell._obj;
			if (typeof obj.answerToTableDisplay === 'function') {
				return obj.answerToTableDisplay(obj,answer);
			}
			return [''];
		},
		tableDisplayToAnswer: function(cell,txt) {
			return false;
		}		
	},
	multipleText: {
		workingLinesCheck: function(obj) {
			var inputValues = draw.taskQuestion.getQuestionInputValues(obj);
			var check = {marks:0,feedback:['']};
			var feedbackLines = [];
			for (var t = 0; t < obj.target.length; t++) {
				var row = obj.target[t];
				if (un(row.value) || row.value === '') continue;
				if (row.format === 'currency') {
					row._textMatches = draw.taskQuestion.multipleText.getCurrencyFormats(row);
				} else {
					row._textMatches = draw.taskQuestion.multipleText.getTextFormats(row);
				}
			}
			var inputIDs = Object.keys(inputValues);
			inputIDs.sort(function(a,b) {
				return a === 'ans' ? 1 : b === 'ans' ? -1 : a < b ? -1 : 1;
			});
			var inputLines = inputIDs.map(function(inputID) {return inputValues[inputID].text instanceof Array ? removeSpaces(textArrayCompress(inputValues[inputID].text)) : '';});
			for (var i = 0; i < inputIDs.length; i++) {
				var inputID = inputIDs[i];
				var inputValue = inputValues[inputID];
				if (typeof inputValue !== 'object' || un(inputValue.text)) continue;
				var lineType = typeof inputID === 'string' && inputID.toLowerCase().indexOf('ans') > -1 ? 'answer' : 'working';
				if (inputValue.blank === true && lineType === 'working') continue;
				var lineInput = removeSpaces(textArrayCompress(inputValue.text));
				if (lineType === 'working' && inputLines.indexOf(lineInput) < i) continue;
				var lineColor = {
					none: false,
					red: false,
					yellow: false,
					green: false
				};
				var parts = lineInput.split('=');
				for (var t2 = 0; t2 < parts.length; t2++) {
					var input = parts[t2];
					if (input === '') continue;
					var foundTargetRow = false;
					for (var t = 0; t < obj.target.length; t++) {
						var targetRow = obj.target[t];
						if (un(targetRow.value) || targetRow.value === '') continue;
						if (draw.taskQuestion.multipleText.inputTargetMatch(input,targetRow) === true) {
							foundTargetRow = true;
							if (typeof targetRow.marks === 'number') {
								check.marks = Math.min(Math.max(check.marks, targetRow.marks), obj.partMarksMax[0]);
							}
							if (lineType === 'answer') {
								if (targetRow.marks === obj.partMarksMax[0]) {
									lineColor.green = true;
								} else if (targetRow.marks === 0) {
									lineColor.red = true;
								} else {
									lineColor.yellow = true;
								}
							} else if (lineType === 'working' && typeof lineColor[targetRow.workingColor] === 'boolean') {
								lineColor[targetRow.workingColor] = true;
							} else if (typeof lineColor[targetRow.color] === 'boolean') {
								lineColor[targetRow.color] = true;
							}
							/*if (typeof targetRow.feedback === 'string' && targetRow.feedback !== '' && feedbackLines.indexOf(targetRow.feedback) === -1) {
								feedbackLines.push(targetRow.feedback);
							}*/
							feedbackLines = typeof targetRow.feedback === 'string' && targetRow.feedback !== '' ? [targetRow.feedback] : [];
						}
					}
					if (foundTargetRow === false) lineColor.none = true; // unrecognised input - remove textbox feedback color
				}
				/*console.log('lineType',lineType);
				console.log('lineInput',lineInput);
				console.log('parts',parts);
				console.log('obj.target',obj.target);
				console.log('lineColor',lineColor);
				console.log('feedbackLines',feedbackLines);*/
				if (lineType === 'answer') {
					if (lineColor.green === true) {
						obj._questionObjsByID[inputID]._inputFeedbackMode = 'green';
					} else if (lineColor.yellow === true) {
						obj._questionObjsByID[inputID]._inputFeedbackMode = 'yellow';
					} else if (lineColor.red === true || check.marks < obj.partMarksMax[0]) {
						obj._questionObjsByID[inputID]._inputFeedbackMode = 'red';
					}
				} else if (lineColor.none === true) {
					
				} else if (lineColor.red === true) {
					obj._questionObjsByID[inputID]._inputFeedbackMode = 'red';
				} else if (lineColor.yellow === true) {
					obj._questionObjsByID[inputID]._inputFeedbackMode = 'yellow';
				} else if (lineColor.green === true) {
					obj._questionObjsByID[inputID]._inputFeedbackMode = 'green';
				}
			}
			if (check.marks < obj.partMarksMax[0]) {
				for (var f = 0; f < feedbackLines.length; f++) {
					var feedbackLine = feedbackLines[f];
					if (feedbackLine.slice(-1) !== '.') feedbackLine += '.';
					var line = textArrayDecompress(feedbackLine);
					check.feedback = check.feedback.concat(line);
				}
				check.feedback = simplifyText(check.feedback);
			}
			return check;
		},
		inputTargetMatch: function(input,targetRow) {
			if (targetRow.format === 'currency') {
				return targetRow._textMatches.indexOf(input) > -1;
			}
			if (targetRow.format === 'oe number' || (targetRow.format === 'number' && targetRow.orEquivalent === true)) {
				return draw.taskQuestion.multipleText.numbersEquivalent(input,targetRow.value);
			}
			if (targetRow.format === 'awrt number' || (targetRow.format === 'number' && targetRow.awrt === true)) {
				return draw.taskQuestion.multipleText.numbersAwrtCheck(input,targetRow.value);
			}
			//if (targetRow.format === 'expression' && targetRow.orEquivalent === true) return draw.taskQuestion.multipleText.numbersEquivalent(input,targetRow.value);
			//if (targetRow.format === 'equation' && targetRow.orEquivalent === true) return draw.taskQuestion.multipleText.numbersEquivalent(input,targetRow.value);
			//if (targetRow.format === 'inequation' && targetRow.orEquivalent === true) return draw.taskQuestion.multipleText.numbersEquivalent(input,targetRow.value);
			return targetRow._textMatches.indexOf(input) > -1;
		},
		numbersEquivalent: function(str1,str2) {
			var num1 = draw.taskQuestion.getTextInputValue({text:textArrayDecompress(str1)});
			var num2 = draw.taskQuestion.getTextInputValue({text:textArrayDecompress(str2)});
			return typeof num1.value === 'number' && (typeof num2.value === 'number') && Math.abs(num1.value-num2.value) < 0.000001;
		},
		numbersAwrtCheck: function(str1,str2) { // does str1 round to str2 ?
			var num1 = draw.taskQuestion.getTextInputValue({text:textArrayDecompress(str1)}).value;
			var pv = 0;
			if (str2.indexOf('.') > -1) {
				pv = -1*(str2.length-str2.indexOf('.')-1);
			} else {
				for (var s = 1; s < str2.length; s++) {
					if (Number(str2.slice(-1*s)) === 0) {
						pv = s;
					} else {
						break;
					}
				}
			}
			return Math.abs(roundToNearest(num1,Math.pow(10,pv)) - Number(str2)) < Math.pow(10,pv-1);
		},
		getTextFormats: function(item) {
			//  getTextFormats("145[,]000{divide}1.032{pow{6}}")	> ['145000{divide}1.032{pow{6}}', '145,000{divide}1.032{pow{6}}']
			//  getTextFormats('[£]120[,]000[.00]');				> ['120000', '£120000', '120,000', '£120,000', '120000.00', '£120000.00', '120,000.00', '£120,000.00']
			if (typeof item !== 'object' || typeof item.value !== 'string') return [];
			var formats = [''];
			var spl = item.value.split(/(\[.*?\])/g).filter(function(x) {return x !== ''});
			for (var s = 0; s < spl.length; s++) {
				var part = spl[s];
				if (part.slice(0,1) === '[' && part.slice(-1) === ']') {
					part = part.slice(1,-1);
					var len = formats.length;
					for (var f = 0; f < len; f++) formats.push(formats[f]+part);
				} else {
					for (var f = 0; f < formats.length; f++) formats[f] += part;
				}
			}
			return formats;
		},
		getCurrencyFormats:function(item) {
			if (typeof item !== 'object' || (typeof item.value !== 'string' && typeof item.value !== 'number')) return [];
			var value = Number(item.value);
			if (isNaN(value) || typeof value !== 'number') return [];
			var formats = [String(Math.floor(value))];
			if (formats[0].length > 9) {
				formats.push(formats[0].slice(0,-9)+','+formats[0].slice(-9,-6)+','+formats[0].slice(-6,-3)+','+formats[0].slice(-3));
			} else if (formats[0].length > 6) {
				formats.push(formats[0].slice(0,-6)+','+formats[0].slice(-6,-3)+','+formats[0].slice(-3));
			} else if (formats[0].length > 3) {
				formats.push(formats[0].slice(0,-3)+','+formats[0].slice(-3));
			}
			var symbol = typeof item.symbol === 'string' ? item.symbol : '£';
			if (symbol === '£') symbol = '{pound}';
			if (item.symbolRequired === 1) {
				for (var f = 0; f < formats.length; f++) formats[f] = symbol += formats[f];
			} else if (item.symbolRequired !== -1) {
				var len = formats.length;
				for (var f = 0; f < len; f++) formats.push(symbol+formats[f]);
			}
			var pence = '.' + (value%1 === 0 ? '00' : String(roundToNearest(value%1,0.01)).slice(2));
			while (pence.length < 3) pence += '0';
			if (pence !== '.00') {
				for (var f = 0; f < formats.length; f++) formats[f] = formats[f] += pence;
			} else {
				var len = formats.length;
				for (var f = 0; f < len; f++) formats.push(formats[f]+pence);
			}
			return formats;
		},
		
		getMeta: function(cell) {
			return {};
		},
		getSaveData: function(cell) {
			var saveData = {text:[],blank:true};
			for (var i = 0; i < cell._inputs.length; i++) {
				var obj2 = cell._inputs[i].obj[0];
				var txt = removeTags(clone(obj2.text));
				saveData.text.push(txt);
				if (arraysEqual(txt,[""]) === false) delete saveData.blank;
			}
			//console.log(saveData);
			return saveData;
		},
		restoreSaveData: function(cell,saveData) {
			for (var i = 0; i < cell._inputs.length; i++) {
				var obj2 = cell._inputs[i].obj[0];
				obj2.text = clone(saveData.text[i]);
			}			
		},
		getAnswer: function(cell) {
			var answer = {text:[],blank:true};
			for (var i = 0; i < cell._inputs.length; i++) {
				var obj2 = cell._inputs[i].obj[0];
				var txt = removeTags(draw.taskQuestion.text.simplifyTextArray(clone(obj2.text)));
				answer.text.push(txt);
				if (arraysEqual(txt,[""]) === false) delete answer.blank;
			}
			//console.log(answer);
			return answer;
		},
		restoreAnswer: function(cell,answer) {
			for (var i = 0; i < cell._inputs.length; i++) {
				var obj2 = cell._inputs[i].obj[0];
				obj2.text = clone(answer.text[i]);
			}
		},
		showAnswerMode: function(cell,answers) {
			if (!un(answers[0])) {
				draw.taskQuestion.multipleText.restoreAnswer(cell,answers[0].answerData);
			}
			for (var i = 0; i < cell._inputs.length; i++) {
				var obj2 = cell._inputs[i].obj[0];
				obj2.color = '#C00';
			}			
		},
		reset: function(cell) {
			for (var i = 0; i < cell._inputs.length; i++) {
				var obj2 = cell._inputs[i].obj[0];
				obj2.text = [""];
				delete obj2.color;
			}
		},
		answerToTableDisplay: function(cell,answer) {
			var txt = [''];
			for (var i = 0; i < answer.text.length; i++) {
				var ans = answer.text[i];
				if (i > 0) txt.push('; ');
				txt = txt.concat(ans);
			}
			return txt;
		},
		tableDisplayToAnswer: function(cell,txt) {
			var txts = [[]];
			var txt2 = clone(txt);
			while (txt2.length > 0) {
				if (typeof txt2[0] !== 'string') {
					txts.last().push(txt2.shift());
				} else {
					var index = txt2[0].indexOf('; ');
					if (index === -1) {
						txts.last().push(txt2.shift());
					} else {
						txts.last().push(txt2[0].slice(0,index));
						txts.push([]);
						txt2[0] = txt2[0].slice(index+2);
					}
				}
			}
			return {text:txts};
			
		},
		getBlankAnswerData: function() {
			return {text:[""]};
		}
	},
	text: {
		getMeta: function(cell) {
			return {};
		},
		getSaveData: function(cell) {
			var obj2 = cell._inputs[0].obj[0];
			var saveData = {text:removeTags(clone(obj2.text))};
			if (arraysEqual(saveData.text,[""])) saveData.blank = true;
			return saveData;
		},
		restoreSaveData: function(cell,saveData) {
			var obj2 = cell._inputs[0].obj[0];
			//console.log(cell,obj2,saveData);
			obj2.text = clone(saveData.text);
		},
		getAnswer: function(cell) {
			var obj2 = cell._inputs[0].obj[0];
			var answer = {text:draw.taskQuestion.text.simplifyTextArray(clone(obj2.text))};
			if (arraysEqual(answer.text,[""])) answer.blank = true;
			return answer;
		},
		simplifyTextArray: function(textArray) {
			var textArray2 = textArrayToLowerCase(removeTags(clone(textArrayReplace(textArray,' ',''))));
			if (textArray2.length > 1 && textArray2[0] === "") textArray2.shift();
			if (textArray2.length > 1 && textArray2.last() === "") textArray2.pop();
			return textArray2;
		},
		restoreAnswer: function(cell,answer) {
			var obj2 = cell._inputs[0].obj[0];
			obj2.text = clone(answer.text);
		},
		showAnswerMode: function(cell,answers) {
			if (!un(answers[0])) {
				draw.taskQuestion.text.restoreAnswer(cell,answers[0].answerData);
			}
			var obj2 = cell._inputs[0].obj[0];
			obj2.color = '#C00';
		},
		reset: function(cell) {
			var obj2 = cell._inputs[0].obj[0];
			obj2.text = [""];
			delete obj2.color;
		},
		answerToTableDisplay: function(cell,answer) {
			return answer.text;
		},
		tableDisplayToAnswer: function(cell,txt) {
			txt = draw.taskQuestion.text.simplifyTextArray(txt);
			return {text:txt};
		},
		getBlankAnswerData: function() {
			return {text:[""]};
		}
	},
	trueFalse: {
		check:function(obj,answer) {
			var maxMarks = obj.partMarksMax[0];
			var inputs = obj._cell._inputTypes.trueFalse;
			
			var correctCount = 0;
			for (var i = 0; i < inputs.length; i++) {
				var path = inputs[i];
				var obj2 = path.obj[0];	
				if ((answer[0].t.indexOf(path.inputID) > -1 && obj2.interact.answerValue === true) || (answer[0].f.indexOf(path.inputID) > -1 && obj2.interact.answerValue === false)) {
					correctCount++;
				}
			}
			
			if (correctCount === inputs.length) {
				return {
					marks:maxMarks,
					feedback:['']
				};
			} else {
				var marks = 0;
				var feedback = [''];
				if (correctCount > 0) {
					marks = Math.min(maxMarks-1,Math.max(0,Math.floor((correctCount/inputs.length)*maxMarks)));
				}
				var attempted = answer[0].t.length + answer[0].f.length;
				if (attempted >= 4 || attempted >= inputs.length/2) {
					feedback = ['You have '+correctCount+' correct answer'+(correctCount > 1 ? 's' : '')+'.'];
				} else {
					marks = 0;
					feedback = ['You need to complete all parts of the question.']
				}
				return {
					marks:marks,
					feedback:feedback
				};
			}
		},
		/*check:function(obj,answer) {
			var maxMarks = obj.partMarksMax[0];
			var inputs = obj._cell._inputTypes.trueFalse;
			
			var correctCount = 0;
			for (var i = 0; i < inputs.length; i++) {
				var path = inputs[i];
				var obj2 = path.obj[0];	
				if ((answer[0].t.indexOf(path.inputID) > -1 && obj2.interact.answerValue === true) || (answer[0].f.indexOf(path.inputID) > -1 && obj2.interact.answerValue === false)) {
					correctCount++;
				}
			}
			
			if (correctCount === inputs.length) {
				return {
					marks:maxMarks,
					feedback:['']
				};
			} else if (correctCount > 0) {
				return {
					marks:Math.min(maxMarks-1,Math.max(0,Math.floor((correctCount/inputs.length)*maxMarks))),
					feedback:['You have '+correctCount+' correct answer'+(correctCount > 1 ? 's' : '')+'.']
				};
			} else {
				return {
					marks:0,
					feedback:['You have no correct answers.']
				};
			}
		},*/
		
		getMeta: function(cell) {
			var trueFalse = cell._inputTypes.trueFalse;
			return {trueFalse:(un(cell._inputTypes) || un(cell._inputTypes.trueFalse) ? 0 : cell._inputTypes.trueFalse.length)};
		},
		getSaveData: function(cell) {
			var inputs = cell._inputTypes.trueFalse;
			var saveData = {t:[],f:[]};
			for (var i = 0; i < inputs.length; i++) {
				var path = inputs[i];
				var obj = path.obj[0];
				if (obj.interact.value === true) {
					saveData.t.push(path.inputID);
				} else if (obj.interact.value === false) {
					saveData.f.push(path.inputID);
				}
			}
			if (saveData.t.length === 0 && saveData.f.length === 0) saveData.blank = true;
			return saveData;
		},
		restoreSaveData: function(cell,saveData) {
			var inputs = cell._inputTypes.trueFalse;
			for (var i = 0; i < inputs.length; i++) {
				var path = inputs[i];
				var obj = path.obj[0];				
				delete obj.interact.value;
				if (saveData.t.indexOf(path.inputID) > -1) {
					obj.interact.value = true;
				} else if (saveData.f.indexOf(path.inputID) > -1) {
					obj.interact.value = false;
				}
			}
		},
		getAnswer: function(cell) {
			return draw.taskQuestion.trueFalse.getSaveData(cell);
		},
		restoreAnswer: function(cell,answer) {
			return draw.taskQuestion.trueFalse.restoreSaveData(cell,answer);
		},
		showAnswerMode: function(cell,answers) {
			var inputs = cell._inputTypes.trueFalse;
			for (var i = 0; i < inputs.length; i++) {
				var obj = inputs[i].obj[0];
				obj.interact.value = obj.interact.answerValue;
			}
		},
		reset: function(cell) {
			var inputs = cell._inputTypes.trueFalse;
			for (var i = 0; i < inputs.length; i++) {
				var obj = inputs[i].obj[0];
				delete obj.interact.value;
			}
		},
	
		drawHeatMap: function(ctx,questionObj,data) {
			return;
			var inputs = questionObj._cell._inputTypes.trueFalse.map(function(path) {
				return {
					inputID:path.inputID,
					path:path,
					obj:path.obj[0],
					value:path.obj[0].interact.answerValue,
					correctCount:0,
				}
			});
			var totalAttempts = 0;
			var correctCount = 0;
			for (var d = 0; d < data.length; d++) {
				var row = data[d];
				totalAttempts += row.freq;
				if (un(row.answerData)) continue;
				for (var i = 0; i < inputs.length; i++) {
					var input = inputs[i];
					if ((input.value === true && row.answerData.t.indexOf(input.inputID) > -1) || (input.value === false && row.answerData.f.indexOf(input.inputID) > -1)) {
						input.correctCount += row.freq;
						correctCount += row.freq;
					}
				}
			}
			if (totalAttempts === 0 || correctCount === 0) return;
			
			for (var i = 0; i < inputs.length; i++) {
				var input = inputs[i];
				var rect = input.path.tightBorder;
				var prop = input.correctCount/totalAttempts;
				if (typeof prop !== 'number' || isNaN(prop)) continue;
				var color = getScaleColor(prop,['#CFC','#3F3']);
				/*if (input.value === true) {
					var color = getScaleColor(prop,['#CFC','#3F3']);
				} else {
					var color = getScaleColor(prop,['#FCC','#F33']);
				}*/
				text({ctx:ctx,text:[String(Math.round(prop*100))+'%'],rect:[rect[0],rect[1],65,30],minTightHeight:30,align:[0,0],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
			}
			
			function getScaleColor(value,colors) { //eg. getScaleColor(0.25,['#FFF','#66F']);
				var c1 = hexToRgb(colors[0]);
				var c2 = hexToRgb(colors[1]);
				var color = {
					r:Math.round(c1.r+value*(c2.r-c1.r)),
					g:Math.round(c1.g+value*(c2.g-c1.g)),
					b:Math.round(c1.b+value*(c2.b-c1.b))
				};
				return "rgb("+color.r+","+color.g+","+color.b+")";
			}
		}
	},
	select: {
		check:function(obj,answer) {
			var maxMarks = obj.partMarksMax[0];
			var selected = answer[0].selected;
			var table = obj._cells[0]._inputTypes.select[0].obj[0];
			var correctCellIndices = [];
			for (var c = 0; c < table._cells.length; c++) {
				var cell = table._cells[c];
				if (cell.answerValue === true) correctCellIndices.push(c);
			}
			if (correctCellIndices.length === 0) return false;
			if (!un(table.interact) && table.interact.multiSelect === false) {
				if (correctCellIndices[0] === selected[0]) {
					var check = {
						marks:maxMarks,
						feedback:['']
					};
				} else {
					var check = {
						marks:0,
						feedback:['']
					};
				}
			} else {			
				var correctCount = 0;
				var wrongCount = 0;
				var missingCount = 0;
				for (var i = 0; i < selected.length; i++) {
					var sel = selected[i];
					if (correctCellIndices.indexOf(sel) === -1) {
						wrongCount++;
					} else {
						correctCount++;
					}
				}
				for (var i = 0; i < correctCellIndices.length; i++) {
					var corr = correctCellIndices[i];
					if (selected.indexOf(corr) === -1) missingCount++;
				}
				
				var wrong = wrongCount+missingCount;
				if (wrong === 0) {
					var check = {
						marks:maxMarks,
						feedback:['']
					};
				} else {
					var check = {
						marks:0,
						feedback:['']
					};
					if (selected.length > 1) {
						if (correctCount > 0) {
							check.marks = Math.min(maxMarks-1,Math.max(0,Math.floor(((correctCount-wrongCount)/correctCellIndices.length)*maxMarks)));
							check.feedback = ['You have '+correctCount+' correct answer'+(correctCount > 1 ? 's' : '')+'.'];
						} else {
							check.feedback = ['You have no correct answers.'];
						}
					} else {
						check.marks = 0;
						check.feedback = ['You need to select more boxes.'];
					}
				}
			}
			
			return check;
		},
		
		getMeta: function(cell) {
			var path = cell._inputs[0];
			var obj = path.obj[0];
			return {multiSelect:path.isInput.multiSelect,cellCount:obj._cells.length};
		},
		getSaveData: function(cell) {
			var obj2 = cell._inputs[0].obj[0];
			var selected = [];
			if (obj2.type !== 'table2') return {selected:[]};
			if (un(obj2._cells)) draw.table2.getCells(obj2);
			for (var c = 0; c < obj2._cells.length; c++) {
				var cell = obj2._cells[c];
				if (cell.toggle === true) selected.push(c);
			}
			var saveData = {selected:selected};
			if (selected.length === 0) saveData.blank = true;
			return saveData;
		},
		restoreSaveData: function(cell,saveData) {
			//console.log(cell,cell._inputs);
			var obj2 = cell._inputs[0].obj[0];
			var cells = draw.table2.getCells(obj2);
			for (var c = 0; c < cells.length; c++) {
				var cell = cells[c];
				cell.toggle = (saveData.selected instanceof Array && saveData.selected.indexOf(c)) > -1 ? true : false;
			}
		},
		getAnswer: function(cell) {
			return draw.taskQuestion.select.getSaveData(cell);
		},
		restoreAnswer: function(cell,answer) {
			return draw.taskQuestion.select.restoreSaveData(cell,answer);
		},
		showAnswerMode: function(cell,answers) {
			var table = cell._inputTypes.select[0].obj[0];
			var correctCellIndices = [];
			for (var c = 0; c < table._cells.length; c++) {
				var cell2 = table._cells[c];
				if (cell2.answerValue === true) correctCellIndices.push(c);
			}
			if (correctCellIndices.length > 0) {
				var cells = table._cells;
				for (var c = 0; c < cells.length; c++) {
					var cell2 = cells[c];
					cell2.toggle = correctCellIndices.indexOf(c) > -1 ? true : false;
				}
			} else if (!un(answers[0])) {
				draw.taskQuestion.select.restoreSaveData(cell,answers[0].answerData);
			}
		},
		reset: function(cell) {
			var obj2 = cell._inputs[0].obj[0];
			var cells = draw.table2.getCells(obj2);
			for (var c = 0; c < cells.length; c++) {
				var cell = cells[c];
				cell.toggle = false;
			}
		},
		answerToTableDisplay: function(cell,answer) {
			return [''];
			// convert answer to form to display in edit mode answers table or class review answers table
			var obj = cell._inputs[0].obj[0];
			var cells = obj._cells;
			var selected = answer.selected;
			if (un(selected)) return [''];
			var txt = [''];
			for (var s = 0; s < selected.length; s++) {
				if (s > 0) txt.push(', ');
				txt = txt.concat(cells[selected[s]].text);
			}
			//console.log(answer,txt);
			return txt;
		},
		tableDisplayToAnswer: function(cell,txt) {
			var obj = cell._inputs[0].obj[0];
			var cells = obj._cells;
			var selected = [];
			var txts = [[]];
			var txt2 = clone(txt);
			while (txt2.length > 0) {
				if (typeof txt2[0] !== 'string') {
					txts.last().push(txt2.shift());
				} else {
					var index = txt2[0].indexOf(', ');
					if (index === -1) {
						txts.last().push(txt2.shift());
					} else {
						txts.last().push(txt2[0].slice(0,index));
						txts.push([]);
						txt2[0] = txt2[0].slice(index+2);
					}
				}
			}
			//console.log('txts',txts);
			for (var t = 0; t < txts.length; t++) {
				var txt = txts[t];
				for (var c = 0; c < cells.length; c++) {
					var cell = cells[c];
					if (selected.indexOf(c) === -1 && arraysEqual(txt,cell.text)) {
						selected.push(c);
					}
				}
			}
			return {selected:selected};
		},
		getBlankAnswerData: function() {
			return {selected:[]};
		},
	
		drawHeatMap: function(ctx,questionObj,data) {	
			if (un(questionObj._cells) || un(questionObj._cells[0]) || un(questionObj._cells[0]._inputTypes) || un(questionObj._cells[0]._inputTypes.select) || un(questionObj._cells[0]._inputTypes.select[0]) || un(questionObj._cells[0]._inputTypes.select[0].obj) || un(questionObj._cells[0]._inputTypes.select[0].obj[0]) || un(questionObj._cells[0]._inputTypes.select[0].obj[0]._cells)) return;
			
			var table = questionObj._cells[0]._inputTypes.select[0].obj[0];
			var totalAttempts = 0;
			var cellFrequencies = [];
			var correctCells = [];
			for (var c = 0; c < table._cells.length; c++) {
				cellFrequencies[c] = 0;
				if (table._cells[c].answerValue === true) correctCells.push(c);
			}
			for (var d = 0; d < data.length; d++) {
				if (un(data[d].answerData) || un(data[d].answerData.selected) || data[d].answerData.selected.length === 0) continue;
				var f = !un(data[d].frequency) ? data[d].frequency : !un(data[d].freq) ? data[d].freq : 0;
				totalAttempts += f;
				var selected = data[d].answerData.selected;
				for (var s = 0; s < selected.length; s++) cellFrequencies[selected[s]] += f;
			}
			table._heatMapData = {
				totalAttempts:totalAttempts,
				cellFrequencies:cellFrequencies,
				correctCells:correctCells
			};
			if (totalAttempts === 0 || correctCells.length === 0) return;
			
			for (var c = 0; c < table._cells.length; c++) {
				var cell = table._cells[c];
				var rect = [table.xPos[cell._c],table.yPos[cell._r],table.xPos[cell._c+1]-table.xPos[cell._c],table.yPos[cell._r+1]-table.yPos[cell._r],table.xPos[cell._c+1],table.yPos[cell._r+1]];
				var prop = table._heatMapData.cellFrequencies[c]/table._heatMapData.totalAttempts;
				if (typeof prop !== 'number' || isNaN(prop)) continue;
				if (table._heatMapData.correctCells.indexOf(c) > -1) {
					var color = getScaleColor(prop,['#CFC','#3F3']);
				} else {
					var color = getScaleColor(prop,['#FCC','#F33']);
				}
				text({ctx:ctx,text:[String(Math.round(prop*100))+'%'],rect:[rect[4]-65,rect[1],65,30],minTightHeight:30,align:[0,0],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
				/*var color = prop === 0 ? '#FFF' : getScaleColor(prop,['#FCF','#F3F']);
				text({ctx:ctx,text:[String(Math.round(prop*100))+'%'],rect:[rect[4]-65,rect[1],65,30],minTightHeight:30,align:[0,0],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
				if (table._heatMapData.correctCells.indexOf(c) > -1) {
					draw.tick.draw(ctx,{type:'tick',rect:[rect[4]-40,rect[5]-45,25,30],lineColor:'#F3F',lineWidth:6});
				}*/
			}
			
			function getScaleColor(value,colors) { //eg. getScaleColor(0.25,['#FFF','#66F']);
				var c1 = hexToRgb(colors[0]);
				var c2 = hexToRgb(colors[1]);
				var color = {
					r:Math.round(c1.r+value*(c2.r-c1.r)),
					g:Math.round(c1.g+value*(c2.g-c1.g)),
					b:Math.round(c1.b+value*(c2.b-c1.b))
				};
				return "rgb("+color.r+","+color.g+","+color.b+")";
			}
		}
	},
	grid: {
		getDrawnPaths: function(obj,reduce) {
			var paths = [];
			if (un(obj.path)) return [];
			var lineSegments = [];
			for (var p = 0; p < obj.path.length; p++) {
				var path = obj.path[p];
				if (path._deletable !== true) continue;
				var path2 = clone(path);
				delete path2._deletable;
				if (reduce === true) {
					if (path2.type === 'line') {
						var pos = draw.taskQuestion.grid.simplifyLineCoords(path2.pos);
					} else {
						var pos = path2.pos;
					}
					if (path2.type === 'lineSegment') {
						lineSegments.push(path2.pos);
					} else {
						paths.push({type:path2.type,pos:pos});
					}
				} else {
					paths.push(path2);
				}
			}
			
			if (reduce === true && lineSegments.length > 0) {
				lineSegments = reduceLineSegments(lineSegments);
				for (var l = 0; l < lineSegments.length; l++) {
					var lineSegment = lineSegments[l];
					paths.push({type:'lineSegment',pos:lineSegment});
				}
			}
			
			paths = draw.taskQuestion.grid.sortPaths(paths);
			return paths;
		},
		simplifyLineCoords: function(pos) {
			var v = vector.getVectorAB(pos[0],pos[1]);
			if (v[0] < 0) {
				v[0] = -v[0];
				v[1] = -v[1];
			}
			if (v[0] === 0) { // vertical
				var pos1 = [pos[0][0],0];
				var pos2 = [pos[0][0],1];
			} else if (v[1] === 0) { // horizontal
				var pos1 = [0,pos[0][1]];
				var pos2 = [1,pos[0][1]];
			} else {
				var f = hcf(Math.abs(v[0]),Math.abs(v[1]));
				v[0] /= f;
				v[1] /= f;
				var pos1 = [pos[0][0],pos[0][1]];
				while (pos1[0] < 0) {
					pos1[0] += v[0];
					pos1[1] += v[1];
				}
				while (pos1[0]-v[0] >= 0) {
					pos1[0] -= v[0];
					pos1[1] -= v[1];
				}
				var pos2 = [pos1[0]+v[0],pos1[1]+v[1]];
			}
			return [pos1,pos2];
		},
		getEquationOfLine: function(pos) { // needs to handle x=frac, y=frac, y=mx+frac
			var x0 = pos[0][0];
			var y0 = pos[0][1];
			var x1 = pos[1][0];
			var y1 = pos[1][1];
			var txt = [''];
			if (x0 === x1) {
				txt = ['x='+x0];
			} else if (y0 === y1) {
				txt = ['y='+y0];
			} else {
				var m = (y1-y0) / (x1-x0);
				if (x0 === 0) {
					var cSign = y0 === 0 ? '' : y0 > 0 ? '+' : '-';
					var c = y0 === 0 ? '' : Math.abs(y0);
				} else {
					var cf = simplifyFrac2([y0*(x1-x0)-x0*(y1-y0), x1-x0]);
					if (cf[1] === 1) {
						var cSign = cf[0] === 0 ? '' : cf[0] > 0 ? '+' : '-';
						var c = cf[0] === 0 ? '' : Math.abs(cf[0]);
					} else {
						var cSign = cf[0] === 0 ? '' : cf[0] > 0 ? '+' : '-';
						var c = ['frac',[String(Math.abs(cf[0]))],[String(cf[1])]];
					}
				}
				if (typeof m === 'number' && isFinite(m)) {
					if (Math.floor(m) === m) {
						m = m === 1 ? '' : m === -1 ? '-' : String(m);
						txt = ['y='+m+'x'+cSign,c];
					} else {
						var mSign = m < 0 ? '-' : '';
						m = simplifyFrac2([Math.abs(y1-y0),Math.abs(x1-x0)]);
						txt = ['y=',['frac',[String(m[0])],[String(m[1])]],'x'+cSign,c];
					}
				}
			}
			return txt;
		},
		sortPaths: function(paths) {
			for (var p = 0; p < paths.length; p++) {
				var path = paths[p];
				if (path.type === 'line' || path.type === 'lineSegment') {
					path.pos.sort(function(a,b) {
						if (a[0] === b[0]) {
							return a[1]-b[1];
						} else {
							return a[0]-b[0];
						}
					});
				}
			}
			paths.sort(function(a,b) {
				if (a.type < b.type) return 1;
				if (a.type > b.type) return -1;
				if (a.type === 'point') {
					if (a.pos[0] === b.pos[0]) {
						return a.pos[1]-b.pos[1];
					} else {
						return a.pos[0]-b.pos[0];
					}
				} else if (a.type === 'line' || a.type === 'lineSegment') {
					if (a.pos[0][0] === b.pos[0][0] && a.pos[0][1] === b.pos[0][1]) {
						var apos = a.pos[1];
						var bpos = b.pos[1];
					} else {
						var apos = a.pos[0];
						var bpos = b.pos[0];
					}
					if (apos[0] === bpos[0]) {
						return apos[1]-bpos[1];
					} else {
						return apos[0]-bpos[0];
					}
				}
				return 0;
			});
			return paths;
		},
		getSaveData: function(cell) {
			var obj2 = cell._inputs[0].obj[0];
			var saveData = {path:draw.taskQuestion.grid.getDrawnPaths(obj2,false)};
			if (saveData.path.length === 0) saveData.blank = true;
			return saveData;
		},
		restoreSaveData: function(cell,saveData) {
			var obj2 = cell._inputs[0].obj[0];
			if (un(obj2.path)) obj2.path = [];
			for (var p = 0; p < saveData.path.length; p++) saveData.path[p]._deletable = true;
			obj2.path = obj2.path.concat(saveData.path);
		},
		getAnswer: function(cell) {
			var obj2 = cell._inputs[0].obj[0];
			var answer = {path:draw.taskQuestion.grid.getDrawnPaths(obj2,true)};
			if (answer.path.length === 0) answer.blank = true;
			return answer;
		},
		showAnswerMode: function(cell,answers) {
			
		},
		restoreAnswer: function(cell,answer) {
			var obj2 = cell._inputs[0].obj[0];
			if (un(obj2.path)) obj2.path = [];
			for (var p = 0; p < answer.path.length; p++) answer.path[p]._deletable = true;
			obj2.path = obj2.path.concat(answer.path);			
		},
		reset: function(cell) {
			var obj2 = cell._inputs[0].obj[0];
			if (un(obj2.path)) return;
			for (var p = 0; p < obj2.path.length; p++) {
				var path = obj2.path[p];
				if (path._deletable !== true) continue;
				obj2.path.splice(p,1);
				p--;
			}
		},
		answerToTableDisplay: function(cell,answer) {
			// convert answer to form to display in edit mode answers table or class review answers table
			var obj = cell._inputs[0].obj[0];
			var cells = obj._cells;
			var txt = [''];
			for (var p = 0; p < answer.path.length; p++) {
				var gridPath = answer.path[p];
				if (p > 0) txt.push('; ');
				if (gridPath.type === 'point') {
					txt.push('('+gridPath.pos[0]+', '+gridPath.pos[1]+')');
				} else if (gridPath.type === 'lineSegment') {
					txt.push('('+gridPath.pos[0][0]+', '+gridPath.pos[0][1]+') to ('+gridPath.pos[1][0]+', '+gridPath.pos[1][1]+')');
				} else if (gridPath.type === 'line') {
					txt = txt.concat(draw.taskQuestion.grid.getEquationOfLine(gridPath.pos));
				}
			}
			//console.log(answer,txt);
			return txt;
		},
		tableDisplayToAnswer: function(cell,txt) {
			var obj = cell._inputs[0].obj[0];
			var cells = obj._cells;
			var paths = [];
			var txts = txt[0].split(';');
			for (var t = 0; t < txts.length; t++) {
				var txt2 = replaceAll(txts[t],' ','');
				if (txt2.indexOf('(') === 0 && txt2.indexOf(')') === txt2.length-1) {
					txt2 = txt2.slice(1,-1);
					txt2 = txt2.split(',');
					if (txt2.length === 2 && !isNaN(Number(txt2[0])) && !isNaN(Number(txt2[1]))) {
						paths.push({type:'point',pos:[Number(txt2[0]),Number(txt2[1])]});
					}
				}
			}
			return {path:paths};
		},
		getBlankAnswerData: function() {
			return {path:[]};
		}
	},
	drag: {
		getDragValue: function(path) {
			if (!un(path.interact.value) && path.interact.value !== '') return path.interact.value;
			if (path.obj[0].type === 'text2') return removeTags(clone(path.obj[0].text));
			return '';
		},
		getDragQuestionType: function(cell) {
			if (draw.mode !== 'edit' && !un(cell._dragQuestionType)) return cell._dragQuestionType;
			var drags = cell._inputTypes["drag"];
			var dragAreas = cell._inputTypes["dragArea"];
			if (un(dragAreas)) {
				cell._dragQuestionType = '';
				return '';
			}
			var matches = [];
			for (var d = 0; d < drags.length; d++) {
				var drag = drags[d];
				var dragMatchValue = drag.interact.match;
				var match = matches.find(function(x) {return x.match === dragMatchValue});
				if (typeof match !== 'object' || match === null) {
					match = {match:dragMatchValue,drags:[],dragAreasSnap:[],dragAreasNoSnap:[]};
					matches.push(match);
				}
				match.drags.push(drag);
			}
			for (var d = 0; d < dragAreas.length; d++) {
				var dragArea = dragAreas[d];
				var dragAreaMatchValue = dragArea.interact.match;
				var match = matches.find(function(x) {return x.match === dragAreaMatchValue});
				if (typeof match !== 'object' || match === null) {
					match = {match:dragAreaMatchValue,drags:[],dragAreasSnap:[],dragAreasNoSnap:[]};
					matches.push(match);
				}
				if (dragArea.interact.snap === true) {
					match.dragAreasSnap.push(dragArea);
				} else {
					match.dragAreasNoSnap.push(dragArea);
				}
			}
			matches.sort(function(a,b) {return a < b ? 1 : 0;});
			
			var matchesByType = {
				oneToOne:[], // each input has a single output
				dragNoMatch:[], // where some drags do not match a dragArea
				manyToOneNoSnap:[], // matching to sort into regions
				oneOfManyToOne:[], // with multiple identical drags (eg. < = >)
			}
			for (var m = 0; m < matches.length; m++) {
				var match = matches[m];
				if (match.drags.length === 1 && match.dragAreasSnap.length+match.dragAreasNoSnap.length === 1) {
					match.type = 'oneToOne';
					matchesByType.oneToOne.push(match);
				} else if (match.dragAreasSnap.length === 0 && match.dragAreasNoSnap.length === 1) {
					match.type = 'manyToOneNoSnap';
					matchesByType.manyToOneNoSnap.push(match);
				} else if (match.drags.length > 1 && match.dragAreasSnap.length > 0 && match.dragAreasNoSnap.length === 0) {
					match.type = 'oneOfManyToOne';
					matchesByType.oneOfManyToOne.push(match);
				} else if (match.drags.length > 1 && match.dragAreasSnap.length === 0 && match.dragAreasNoSnap.length === 0) {
					match.type = 'dragNoMatch';
					matchesByType.dragNoMatch.push(match);
				}
			}
			
			var dragQuestionType = '';
			if (matchesByType.dragNoMatch.length > 0 && matchesByType.oneToOne.length === 0 && matchesByType.manyToOneNoSnap.length === 0 && matchesByType.oneOfManyToOne.length === 0) { // either 'manyToOneSnap' or 'pairThemUp'
				dragQuestionType = 'pairThemUp';
			} else if (matchesByType.dragNoMatch.length > 0) { // either 'manyToOneSnap' or 'pairThemUp'
				dragQuestionType = 'manyToOneSnap';
			} else if (matchesByType.oneToOne.length > 0 && matchesByType.manyToOneNoSnap.length === 0 && matchesByType.oneOfManyToOne.length === 0 && matchesByType.dragNoMatch.length === 0) {
				var dragToOrder = true;
				for (var m = 0; m < matches.length; m++) {
					if (Number(matches[m].match) !== m) {
						dragToOrder = false;
						break;
					}
				}
				dragQuestionType = dragToOrder === true ? 'dragToOrder' : 'oneToOne';
			} else if (matchesByType.oneToOne.length === 0 && matchesByType.manyToOneNoSnap.length > 0 && matchesByType.oneOfManyToOne.length === 0 && matchesByType.dragNoMatch.length === 0) {
				dragQuestionType = 'manyToOneNoSnap';
			} else if (matchesByType.oneToOne.length === 0 && matchesByType.manyToOneNoSnap.length === 0 && matchesByType.oneOfManyToOne.length > 0 && matchesByType.dragNoMatch.length === 0) {
				dragQuestionType = 'oneOfManyToOne';
			}
			
			cell._dragQuestionType = dragQuestionType;
			//if (!un(cell._obj)) console.log(cell._obj.qNum,dragQuestionType);
			
			return dragQuestionType;
		},

		check:function(obj,answer) {
			var cell = obj._cells[0];
			var drags = cell._inputTypes["drag"];
			var dragAreas = cell._inputTypes["dragArea"];
			var nosnapAreaCount = dragAreas.filter(function(x) {return x.interact.snap !== true;}).length;
			
			var maxMarks = obj.partMarksMax[0];
			var check = {
				marks:0,
				feedback:['']
			};
			
			var hits = answer[0].hits;
			var correctCount = hits.filter(function(x) {return x.match === true;}).length;
			//var dragQuestionType = draw.taskQuestion.drag.getDragQuestionType(cell);
			var requiredHits = drags.length;
			if (nosnapAreaCount === 0 && dragAreas.length < drags.length) requiredHits = dragAreas.length;
			
			if (answer[0].blank === true) {
			
			} else if (correctCount === requiredHits) {
				check.marks = maxMarks;
			} else {
				check.marks = Math.min(maxMarks-1,Math.floor((correctCount/requiredHits)*maxMarks));
				if (hits.length > 0) {
					if (requiredHits > 6) {
						check.feedback = ['You have '+correctCount+ ' correct and '+(requiredHits-correctCount)+' wrong answers.'];
					} else {
						check.feedback = ['You have '+correctCount+ ' correct answer'+(correctCount === 1 ? '.' : 's.')];
					}
				}
			}
						
			return check;
		},

		getMeta: function(cell) {
			var drags = cell._inputTypes["drag"] || [];
			var dragAreas = cell._inputTypes["dragArea"] || [];
			return {dragsCount:drags.length,dragAreasCount:dragAreas.length};
		},
		getSaveData: function(cell) {
			var drags = cell._inputTypes['drag'];
			var saveData = [];
			for (var d = 0; d < drags.length; d++) {
				var path = drags[d];
				updateBorder(path);
				if (un(path._initialPos)) continue;
				if (Math.abs(path._initialPos[0]-path.tightBorder[0]) < 0.1 && Math.abs(path._initialPos[1]-path.tightBorder[1]) < 0.1) continue;
				saveData.push({inputID:path.inputID,offset:[roundToNearest(path.tightBorder[0]-path._initialPos[0],0.1),roundToNearest(path.tightBorder[1]-path._initialPos[1],0.1)]});
			}
			saveData.sort(function(a,b) {
				return a.inputID-b.inputID;
			});
			//console.log('saveData',saveData);
			return saveData;
		},
		restoreSaveData: function(cell,saveData) {
			var drags = cell._inputTypes['drag'];
			for (var s = 0; s < saveData.length; s++) {
				var data = saveData[s];
				var path = drags.find(function(x) {return data.inputID === x.inputID;});
				if (typeof path !== 'object' || path === null) continue;
				updateBorder(path);
				if (un(path._initialPos)) path._initialPos = [path.tightBorder[0],path.tightBorder[1]];
				positionPath(path,path._initialPos[0]+data.offset[0],path._initialPos[1]+data.offset[1]);
				
				var paths = cell._parentPaths instanceof Array ? cell._parentPaths : cell._pageIndex === pIndex ? draw.path : pages[cell._pageIndex].paths;
				var index = paths.indexOf(path);
				paths.splice(index,1);
				paths.push(path);
			}
			draw.taskQuestion.drag.updateHits(cell);
		},
		getAnswer: function(cell) {
			var drags = cell._inputTypes['drag'];
			var dragAreas = cell._inputTypes['dragArea'];
			var answerData = {hits:[]};
			var hitCount = 0;
			for (var d = 0; d < drags.length; d++) {
				var drag = drags[d];
				var value = draw.taskQuestion.drag.getDragValue(drag);
				updateBorder(drag);
				var hit = false;
				for (var a = 0; a < dragAreas.length; a++) {
					var dragArea = dragAreas[a];
					updateBorder(dragArea);
					if (draw.taskQuestion.drag.checkHitArea(drag,dragArea) === true) {
						hitCount++;
						hit = true;
						var match = drag.interact.match === dragArea.interact.match;
						answerData.hits.push({value:value,hit:dragArea.interact.match,match:match});
						break;
					}
				}
				if (hit === false && drag.interact.match !== '') {
					answerData.hits.push({value:value,match:false});
				}
			}
			answerData.hits.sort(function(a,b) {
				if (a.value < b.value) return -1;
				return 0;
			});
			if (hitCount === 0) answerData.blank = true;
			//console.log('answerData',answerData);
			return answerData;
		},
		restoreAnswer: function(cell,answer) {
			draw.taskQuestion.drag.reset(cell);		
			var dragsByValue = {};
			for (var d = 0; d < cell._inputTypes['drag'].length; d++) {
				var drag = cell._inputTypes['drag'][d];
				if (!un(drag.interact.value)) {
					if (un(dragsByValue[drag.isInput.value])) dragsByValue[drag.isInput.value] = [];
					dragsByValue[drag.isInput.value].push(drag);
				}
			}
			
			var dragAreas = cell._inputTypes['dragArea']
			var dragAreas2 = {};
			for (var d = 0; d < dragAreas.length; d++) {
				var dragArea = dragAreas[d];
				dragAreas2[dragArea.inputID] = {dragArea:dragArea,drags:[]};
			}
			
			for (var a = 0; a < answer.hits.length; a++) {
				var ans = answer.hits[a];
				var drag = dragsByValue[ans.value].shift();
				dragAreas2[ans.dragArea].drags.push(drag); 
				updateBorder(drag);
			}
			for (var key in dragAreas2) {
				var dragArea = dragAreas2[key].dragArea;
				var drags = dragAreas2[key].drags;
				if (drags.length === 0) continue;
				updateBorder(dragArea);				
				if (drags.length === 1) {
					var drag = drags[0];
					if (un(drag._initialPos)) drag._initialPos = [drag.tightBorder[0],drag.tightBorder[1]];
					var pos = [dragArea.tightBorder[0]+0.5*dragArea.tightBorder[2]-0.5*drag.tightBorder[2],dragArea.tightBorder[1]+0.5*dragArea.tightBorder[3]-0.5*drag.tightBorder[3]];
					positionPath(drag,pos[0],pos[1]);
					if (typeof dragArea.interact.onDrop === 'function') {
						dragArea.interact.onDrop(dragArea,drag);
					}
					
					var pageIndex = cell._pageIndex;
					var paths = pageIndex === pIndex ? draw.path : pages[pageIndex].paths;
					var index = paths.indexOf(drag);
					paths.splice(index,1);
					paths.push(drag);
					
				} else {
					var l = dragArea.tightBorder[0];
					var t = dragArea.tightBorder[1];
					var w = dragArea.tightBorder[2];
					var h = dragArea.tightBorder[3];
					var x = l+10;
					var y = t+10;
					for (var d = 0; d < drags.length; d++) {
						var drag = drags[d];
						if (un(drag._initialPos)) drag._initialPos = [drag.tightBorder[0],drag.tightBorder[1]];
						var w2 = drag.tightBorder[2];
						var h2 = drag.tightBorder[3];
						if (x > l+10 && (l+w)-(x+w2) < 10) {
							x = l+10;
							y += h2+10;
						}
						positionPath(drag,x,y);
						if (typeof dragArea.interact.onDrop === 'function') {
							dragArea.interact.onDrop(dragArea,drag);
						}
						x += w2+10;
						
						var pageIndex = cell._pageIndex;
						var paths = pageIndex === pIndex ? draw.path : pages[pageIndex].paths;
						var index = paths.indexOf(drag);
						paths.splice(index,1);
						paths.push(drag);
					}
				}
			}
			draw.taskQuestion.drag.updateHits(cell);
		},
		showAnswerMode: function(cell,answers) {
			if (draw.taskQuestion.drag.getDragQuestionType(cell) === 'oneOfManyToOne') {
				draw.taskQuestion.drag.oneOfManyToOne.showAnswerMode(cell,answers);
				return;
			}
			draw.taskQuestion.drag.reset(cell);		
			var dragAreas = cell._inputTypes['dragArea']
			
			for (var d = 0; d < dragAreas.length; d++) {
				var dragArea = dragAreas[d];
				var drags = cell._inputTypes['drag'].filter(function(x) {return x.interact.match === dragArea.interact.match});
				if (drags.length === 0) continue;
				updateBorder(dragArea);				
				if (drags.length === 1) {
					var drag = drags[0];
					if (un(drag._initialPos)) drag._initialPos = [drag.tightBorder[0],drag.tightBorder[1]];
					var pos = [dragArea.tightBorder[0]+0.5*dragArea.tightBorder[2]-0.5*drag.tightBorder[2],dragArea.tightBorder[1]+0.5*dragArea.tightBorder[3]-0.5*drag.tightBorder[3]];
					positionPath(drag,pos[0],pos[1]);
					
					var pageIndex = cell._pageIndex;
					var paths = pageIndex === pIndex ? draw.path : pages[pageIndex].paths;
					var index = paths.indexOf(drag);
					paths.splice(index,1);
					paths.push(drag);
					
				} else {
					var l = dragArea.tightBorder[0];
					var t = dragArea.tightBorder[1];
					var w = dragArea.tightBorder[2];
					var h = dragArea.tightBorder[3];
					var dragWidth = drags[0].tightBorder[2];
					var dragHeight = drags[0].tightBorder[3];
					var padding = 10;
					var cols = Math.max(Math.floor((w-padding)/(dragWidth+padding)),1);
					var rows = Math.ceil(drags.length/cols);
					
					var x = dragArea.tightBorder[0]+w/2-(cols*dragWidth+(cols-1)*padding)/2;
					var y = dragArea.tightBorder[1]+h/2-(rows*dragHeight+(rows-1)*padding)/2;
										
					for (var d2 = 0; d2 < drags.length; d2++) {
						var drag = drags[d2];
						if (un(drag._initialPos)) drag._initialPos = [drag.tightBorder[0],drag.tightBorder[1]];
						positionPath(drag,x,y);
						
						var pageIndex = cell._pageIndex;
						var paths = pageIndex === pIndex ? draw.path : pages[pageIndex].paths;
						var index = paths.indexOf(drag);
						paths.splice(index,1);
						paths.push(drag);
						
						if ((d2+1) % cols === 0) {
							x = dragArea.tightBorder[0]+w/2-(cols*dragWidth+(cols-1)*padding)/2;
							y += dragHeight+padding;
						} else {
							x += dragWidth+padding;
						}
					}
				}
			}
			if (cell.type === 'starterQuestion') {
				var drags = drags = cell._inputTypes['drag'];
				for (var d = 0; d < drags.length; d++) {
					drags[d].obj[0].box.color = '#CFC';
				}
			}
			
		},
		reset: function(cell) {
			var drags = cell._inputTypes['drag'];
			
			drags.sort(function(a,b) {
				return (!un(a._initialOrder) && !un(b._initialOrder)) ? a._initialOrder-b._initialOrder : 0;
			});
			
			var paths = !un(cell._parentPaths) ? cell._parentPaths : cell._pageIndex === pIndex || un(pages[cell._pageIndex]) ? draw.path : pages[cell._pageIndex].paths;
			
			for (var d = 0; d < drags.length; d++) {
				var drag = drags[d];
				var index = paths.indexOf(drag);
				paths.splice(index,1);
				paths.push(drag);
				if (un(drag._initialOrder)) drag._initialOrder = d;
				if (!un(drag._initialPos)) {
					updateBorder(drag);
					positionPath(drag,drag._initialPos[0],drag._initialPos[1]);
					delete drag._initialPos;
				}
				if (!un(drag.interact._dragAreaHit)) {
					var dragArea = drag.interact._dragAreaHit.path;
					if (!un(dragArea) && !un(dragArea.interact) && typeof dragArea.interact.onUndrop === 'function') {
						dragArea.interact.onUndrop(dragArea,drag);
					}
				}
				delete drag.interact._dragAreaHit;
			}
			
			var dragAreas = cell._inputTypes['dragArea'];
			if (!un(dragAreas)) {
				for (var a = 0; a < dragAreas.length; a++) {
					var dragArea = dragAreas[a];
					delete dragArea.interact._dragHit;
				}
			}
		},
		updateHits: function(cell) {
			var drags = cell._inputTypes['drag'];
			var dragAreas = cell._inputTypes['dragArea'];
			if (typeof dragAreas !== 'object' || dragAreas === null) return;
			for (var d = 0; d < drags.length; d++) {
				var drag = drags[d];
				for (var a = 0; a < dragAreas.length; a++) {
					var dragArea = dragAreas[a];
					if (draw.taskQuestion.drag.checkHitArea(drag,dragArea) === true) {
						drag.interact._dragAreaHit = dragArea;
						dragArea.interact._dragHit = drag;
						break;
					}
				}
			}
		},
		checkHitArea: function(drag,dragArea) {
			var dragCenter = [drag.tightBorder[0]+0.5*drag.tightBorder[2],drag.tightBorder[1]+0.5*drag.tightBorder[3]];
			var dragAreaRect = dragArea.tightBorder;
			if (isPointInRect(dragCenter,dragAreaRect[0],dragAreaRect[1],dragAreaRect[2],dragAreaRect[3]) === true) return true;
			return false;
		},
		answerToTableDisplay: function(cell,answer) {
			var dragQuestionType = draw.taskQuestion.drag.getDragQuestionType(cell);
			var txt = [''];
			if (un(answer.hits)) answer.hits = [];
			if (dragQuestionType === 'dragToOrder') {
				var len = cell._inputTypes['dragArea'].length;
				for (var l = 0; l < len; l++) {
					var hit = answer.hits.find(function(x) {return x.hit !== '' && Number(x.hit) === l;});
					if (l > 0) txt.push(', ');
					if (typeof hit === 'object') {
						txt = txt.concat(hit.value);
					} else {
						txt.push('-');
					}
				}
			} else if (dragQuestionType === 'dragArea') {
				var dragAreas = cell._inputTypes['dragArea'];
				for (var a = 0; a < dragAreas.length; a++) {
					var dragArea = dragAreas[a];
					var hits = answer.hits.filter(function(x) {return x.hit === dragArea.interact.match;});
					if (hits.length > 0) {
						if (txt.length > 1) txt.push(', ');
						txt.push('{');
						for (var h = 0; h < hits.length; h++) {
							var hit = hits[h];
							if (h > 0) txt.push(',');
							txt = txt.concat(hit.value);
						}
						txt.push('}→'+dragArea.interact.match);
					} 
				}
			} else {
				for (var h = 0; h < answer.hits.length; h++) {
					var hit = answer.hits[h];
					if (un(hit.hit)) continue;
					if (txt.length > 1) txt.push(', ');
					txt = txt.concat(hit.value);
					txt.push('→'+hit.hit);
				}
			}

			//console.log(dragQuestionType,answer,txt);
			return txt;
		},
		tableDisplayToAnswer: function(cell,txt) {
			return {hits:[]};
		},
		getBlankAnswerData: function() {
			return {hits:[]};
		},
	
		drawHeatMap: function(ctx,questionObj,data) {
			return;
			var cell = questionObj._cells[0];
			if (draw.taskQuestion.drag.getDragQuestionType(cell) === 'manyToOneSnap') {
				draw.taskQuestion.drag.drawHeatMapByDragArea(ctx,questionObj,data);
				return;
			}
			
			var drags = [];

			for (var d = 0; d < cell._inputTypes.drag.length; d++) {
				var drag = cell._inputTypes.drag[d];
				drags.push({path:drag,value:draw.taskQuestion.drag.getDragValue(drag),match:drag.interact.match,correctCount:0});
			}
			
			var totalFreq = 0;
			for (var d = 0; d < data.length; d++) {
				if (un(data[d].answerData) || un(data[d].answerData.hits) || data[d].answerData.hits.length === 0) continue;
				var freq = typeof data[d].freq === 'number' ? data[d].freq : 1;
				totalFreq += freq;
				var hits = data[d].answerData.hits;
				for (var h = 0; h < hits.length; h++) {
					var hit = hits[h];
					if (hit.match !== true) continue;
					var drag = drags.find(function(x) {return String(x.value) !== '' && String(x.value) === String(hit.value)});
					if (typeof drag !== 'object') continue;
					drag.correctCount += freq;
				}
			}
			if (totalFreq === 0) return;
			
			for (var d = 0; d < drags.length; d++) {
				var drag = drags[d];
				updateBorder(drag.path);
				var rect = drag.path.tightBorder;
				if (rect.length === 4) rect.push(rect[0]+rect[2],rect[1]+rect[3]);
				var prop = drag.correctCount/totalFreq;
				if (typeof prop !== 'number' || isNaN(prop)) continue;
				//var color = getScaleColor(prop,['#FCC','#CFC']);
				var color = getScaleColor(prop,['#CFC','#3F3']);
				text({ctx:ctx,text:[String(Math.round(prop*100))+'%'],rect:[rect[0]-15,rect[1]-15,65,30],minTightHeight:30,align:[0,0],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
			}
			
			function getScaleColor(value,colors) { //eg. getScaleColor(0.25,['#FFF','#66F']);
				var c1 = hexToRgb(colors[0]);
				var c2 = hexToRgb(colors[1]);
				var color = {
					r:Math.round(c1.r+value*(c2.r-c1.r)),
					g:Math.round(c1.g+value*(c2.g-c1.g)),
					b:Math.round(c1.b+value*(c2.b-c1.b))
				};
				return "rgb("+color.r+","+color.g+","+color.b+")";
			}
		},
		drawHeatMapByDragArea: function(ctx,questionObj,data) {	
			return;
			var cell = questionObj._cells[0];
			var dragAreas = [];
						
			for (var d = 0; d < cell._inputTypes.dragArea.length; d++) {
				var dragArea = cell._inputTypes.dragArea[d];
				dragAreas.push({path:dragArea,dragAreaInputID:dragArea.inputID,match:dragArea.interact.match,correctCount:0});
			}
			
			var totalFreq = 0;
			for (var d = 0; d < data.length; d++) {
				if (un(data[d].answerData) || un(data[d].answerData.hits) || data[d].answerData.hits.length === 0) continue;
				var freq = typeof data[d].freq === 'number' ? data[d].freq : 1;
				totalFreq += freq;
				var hits = data[d].answerData.hits;
				for (var h = 0; h < hits.length; h++) {
					var hit = hits[h];
					if (hit.match !== true) continue;
					var dragArea = dragAreas.find(function(x) {
						if (!un(hit.dragAreaInputID)) {
							return x.dragAreaInputID === hit.dragAreaInputID;
						} else {
							return x.match === hit.hit;
						}
					});
					if (typeof dragArea !== 'object') continue;
					dragArea.correctCount += freq;
				}
			}
			if (totalFreq === 0) return;
			for (var d = 0; d < dragAreas.length; d++) {
				var dragArea = dragAreas[d];
				updateBorder(dragArea.path);
				var rect = dragArea.path.tightBorder;
				if (rect.length === 4) rect.push(rect[0]+rect[2],rect[1]+rect[3]);
				var prop = dragArea.correctCount/totalFreq;
				if (typeof prop !== 'number' || isNaN(prop)) continue;
				//var color = getScaleColor(prop,['#FCC','#CFC']);
				var color = getScaleColor(prop,['#CFC','#3F3']);
				text({ctx:ctx,text:[String(Math.round(prop*100))+'%'],rect:[rect[0]-15,rect[1]-15,65,30],minTightHeight:30,align:[0,0],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
			}
			
			function getScaleColor(value,colors) { //eg. getScaleColor(0.25,['#FFF','#66F']);
				var c1 = hexToRgb(colors[0]);
				var c2 = hexToRgb(colors[1]);
				var color = {
					r:Math.round(c1.r+value*(c2.r-c1.r)),
					g:Math.round(c1.g+value*(c2.g-c1.g)),
					b:Math.round(c1.b+value*(c2.b-c1.b))
				};
				return "rgb("+color.r+","+color.g+","+color.b+")";
			}
		}
	},
	dragOneOfManyToOne:{
		check:function(obj,answer) {
			var cell = obj._cells[0];
			var drags = cell._inputTypes["drag"];
			var dragAreas = cell._inputTypes["dragArea"];
			
			var maxMarks = obj.partMarksMax[0];
			var check = {
				marks:0,
				feedback:['']
			};
			
			var hits = answer[0].hits;
			var correctCount = hits.filter(function(x) {return x.match === true;}).length;
			var requiredHits = dragAreas.length;
			
			if (answer[0].blank === true) {
			
			} else if (correctCount === requiredHits) {
				check.marks = maxMarks;
			} else {
				check.marks = Math.min(maxMarks-1,Math.floor((correctCount/requiredHits)*maxMarks));
				if (hits.length > 0) {
					if (requiredHits > 6) {
						check.feedback = ['You have '+correctCount+ ' correct and '+(requiredHits-correctCount)+' wrong answers.'];
					} else {
						check.feedback = ['You have '+correctCount+ ' correct answer'+(correctCount === 1 ? '.' : 's.')];
					}
				}
			}
						
			return check;
		},
		getMeta: function(cell) {
			return draw.taskQuestion.drag.getMeta(cell);
		},
		getSaveData: function(cell) {
			return draw.taskQuestion.drag.getSaveData(cell);
		},
		restoreSaveData: function(cell,saveData) {
			draw.taskQuestion.drag.restoreSaveData(cell,saveData);
		},
		getAnswer: function(cell) {
			var drags = cell._inputTypes['drag'];
			var dragAreas = cell._inputTypes['dragArea'];
			var answerData = {hits:[]};
			var hitCount = 0;
			for (var a = 0; a < dragAreas.length; a++) {
				var dragArea = dragAreas[a];
				var inputID = dragArea.inputID;
				updateBorder(dragArea);
				if (typeof dragArea.interact._dragHit === 'object') {
					hitCount++;
					var drag = dragArea.interact._dragHit;
					var match = drag.interact.match === dragArea.interact.match;
					answerData.hits.push({dragAreaInputID:inputID,hit:drag.interact.match,match:match});
				} else {
					answerData.hits.push({dragAreaInputID:inputID,match:false});
				}
			}
			answerData.hits.sort(function(a,b) {
				if (a.dragAreaInputID < b.dragAreaInputID) return 1;
				return 0;
			});
			if (hitCount === 0) answerData.blank = true;
			return answerData;
		},
		restoreAnswer: function(cell,answer) {
			draw.taskQuestion.drag.reset(cell);		
			var drags = cell._inputTypes['drag'];
			var dragAreas = cell._inputTypes['dragArea'];
			var dragsByMatch = {};
			for (var d = 0; d < drags.length; d++) {
				var drag = drags[d];
				if (un(dragsByMatch[drag.interact.match])) dragsByMatch[drag.interact.match] = [];
				dragsByMatch[drag.interact.match].push(drag);
			}
			for (var a = 0; a < answer.hits.length; a++) {
				var ans = answer.hits[a];
				if (un(ans.hit)) continue;
				var dragArea = dragAreas.find(function(x) {return x.inputID === ans.dragAreaInputID;});
				updateBorder(dragArea);
				var drags2 = dragsByMatch[ans.hit];
				if (drags instanceof Array === false || drags2.length === 0) continue;
				var drag = drags2.pop();
				updateBorder(drag);
				if (un(drag._initialPos)) drag._initialPos = [drag.tightBorder[0],drag.tightBorder[1]];
				var pos = [dragArea.tightBorder[0]+0.5*dragArea.tightBorder[2]-0.5*drag.tightBorder[2],dragArea.tightBorder[1]+0.5*dragArea.tightBorder[3]-0.5*drag.tightBorder[3]];
				positionPath(drag,pos[0],pos[1]);
				
				dragArea.interact._dragHit = drag;
				drag.interact._dragAreaHit = dragArea;

				var pageIndex = cell._pageIndex;
				var paths = pageIndex === pIndex ? draw.path : pages[pageIndex].paths;
				var index = paths.indexOf(drag);
				paths.splice(index,1);
				paths.push(drag);
			}
			draw.taskQuestion.drag.updateHits(cell);
		},
		showAnswerMode: function(cell,answers) {
			var answer = {hits:[]};
			var dragAreas = cell._inputTypes['dragArea'];
			for (var a = 0; a < dragAreas.length; a++) {
				var dragArea = dragAreas[a];
				answer.hits.push({dragAreaInputID:dragArea.inputID,hit:dragArea.interact.match});
			}
			draw.taskQuestion.dragOneOfManyToOne.restoreAnswer(cell,answer);
		},
		reset: function(cell) {
			draw.taskQuestion.drag.reset(cell);
		},
		answerToTableDisplay: function(cell,answer) {
			return [''];
		},
		tableDisplayToAnswer: function(cell,txt) {
			return false;
		},
		getBlankAnswerData: function() {
			return draw.taskQuestion.drag.getBlankAnswerData();
		},
		drawHeatMap: function(ctx,questionObj,data) {
			draw.taskQuestion.drag.drawHeatMapByDragArea(ctx,questionObj,data);
		}
		
	},
	dragPairThemUp:{
		getPairs:function(cell) {
			if (!un(cell._cells)) cell = cell._cells[0];
			var drags = cell._inputTypes["drag"];
			var dragAreas = cell._inputTypes["dragArea"];
			var dragPairs = {};
			var dragAreaPairs = {};
			for (var d = 0; d < drags.length; d++) {
				var drag = drags[d];
				var dragMatchValue = drag.interact.match;
				if (!un(dragMatchValue)) {
					if (un(dragPairs[dragMatchValue])) dragPairs[dragMatchValue] = [];
					dragPairs[dragMatchValue].push(drag);
				}
			}
			for (var d = 0; d < dragAreas.length; d++) {
				var dragArea = dragAreas[d];
				var dragAreaMatchValue = dragArea.interact.match;
				if (!un(dragAreaMatchValue)) {
					if (un(dragAreaPairs[dragAreaMatchValue])) dragAreaPairs[dragAreaMatchValue] = [];
					dragAreaPairs[dragAreaMatchValue].push(dragArea);
				}
			}
			
			var dragPairs2 = [];
			var dragAreaPairs2 = [];
			for (var key in dragPairs) {
				if (dragPairs[key] instanceof Array === false) continue;
				dragPairs2.push(dragPairs[key]);
			}
			for (var key in dragAreaPairs) {
				if (dragAreaPairs[key] instanceof Array === false) continue;
				dragAreaPairs2.push(dragAreaPairs[key]);
			}
			return {dragPairs:dragPairs2,dragAreaPairs:dragAreaPairs2};
		},
		check:function(obj,answer) {
			var cell = obj._cells[0];
			var pairs = draw.taskQuestion.dragPairThemUp.getPairs(cell);
			var dragPairs = pairs.dragPairs;
			var dragAreaPairs = pairs.dragAreaPairs;
			var maxMarks = obj.partMarksMax[0];
			var check = {
				marks:0,
				feedback:['']
			};
			
			var pairedHits = answer[0].pairedHits;
			var requiredPairs = dragAreaPairs.length;
			var correctPairCount = 0;
			for (var i = 0; i < pairedHits.length; i++) {
				if (pairedHits[i].length < 2) continue;
				var correct = true;
				for (var j = 1; j < pairedHits[i].length; j++) {
					if (pairedHits[i][j].match !== pairedHits[i][0].match) {
						correct = false;
						break;
					}
				}
				if (correct === true) correctPairCount++;
			}
			
			if (answer[0].blank === true) {
			
			} else if (correctPairCount === requiredPairs) {
				check.marks = maxMarks;
			} else {
				check.marks = Math.min(maxMarks-1,Math.floor((correctPairCount/requiredPairs)*maxMarks));
				check.feedback = ['You have found '+correctPairCount+ ' correct pair'+(correctPairCount === 1 ? '.' : 's.')];
			}
						
			return check;
		},
		getMeta: function(cell) {
			return draw.taskQuestion.drag.getMeta(cell);
		},
		getSaveData: function(cell) {
			return draw.taskQuestion.drag.getSaveData(cell);
		},
		restoreSaveData: function(cell,saveData) {
			draw.taskQuestion.drag.restoreSaveData(cell,saveData);
		},
		getAnswer: function(cell) {
			var drags = cell._inputTypes['drag'];
			var dragAreas = cell._inputTypes['dragArea'];
			var pairedHits = {};
			
			var hitCount = 0;
			for (var a = 0; a < dragAreas.length; a++) {
				var dragArea = dragAreas[a];
				updateBorder(dragArea);
				if (typeof dragArea.interact._dragHit === 'object') {
					hitCount++;
					var inputID = dragArea.inputID;
					var drag = dragArea.interact._dragHit;
					var dragAreaMatchValue = dragArea.interact.match;
					if (un(pairedHits[dragAreaMatchValue])) pairedHits[dragAreaMatchValue] = [];
					pairedHits[dragAreaMatchValue].push({match:drag.interact.match,value:drag.interact.value});
				}
			}
			
			var pairedHits2 = [];
			for (var key in pairedHits) {
				var pairedHit = pairedHits[key];
				pairedHit.sort(function(a,b) {
					if (typeof a.value !== 'string' || typeof b.value !== 'string') return a.value - b.value;
					return a.value.localeCompare(b.value, undefined, {numeric: true, sensitivity: 'base'});
				});
				pairedHits2.push(pairedHit);
			}
			pairedHits2.sort(function(a,b) {
				if (typeof a.match !== 'string' || typeof b.match !== 'string') return a.match - b.match;
				return a[0].match.localeCompare(b[0].match, undefined, {numeric: true, sensitivity: 'base'});
			});
			var answerData = {pairedHits:pairedHits2};
			if (hitCount === 0) answerData.blank = true;
			return answerData;
		},
		restoreAnswer: function(cell,answer) {
			draw.taskQuestion.drag.reset(cell);		
			var drags = cell._inputTypes['drag'];
			var dragAreaPairs = draw.taskQuestion.dragPairThemUp.getPairs(cell).dragAreaPairs;
			
			for (var a = 0; a < answer.pairedHits.length; a++) {
				var pairedHits = answer.pairedHits[a];
				var dragAreaPair = dragAreaPairs[a];
				for (var d = 0; d < pairedHits.length; d++) {
					var hit = pairedHits[d];
					var drag = drags.find(function(x) {
						return x.interact.value === hit.value;
					});
					var dragArea = dragAreaPair[d];
					if (un(drag)|| un(dragArea)) continue;
					
					updateBorder(drag);
					if (un(drag._initialPos)) drag._initialPos = [drag.tightBorder[0],drag.tightBorder[1]];
					var pos = [dragArea.tightBorder[0]+0.5*dragArea.tightBorder[2]-0.5*drag.tightBorder[2],dragArea.tightBorder[1]+0.5*dragArea.tightBorder[3]-0.5*drag.tightBorder[3]];
					positionPath(drag,pos[0],pos[1]);
					
					dragArea.interact._dragHit = drag;
					drag.interact._dragAreaHit = dragArea;

					var pageIndex = cell._pageIndex;
					var paths = pageIndex === pIndex ? draw.path : pages[pageIndex].paths;
					var index = paths.indexOf(drag);
					paths.splice(index,1);
					paths.push(drag);
				}
			}
			draw.taskQuestion.drag.updateHits(cell);
		},
		showAnswerMode: function(cell,answers) {
			var dragPairs = draw.taskQuestion.dragPairThemUp.getPairs(cell).dragPairs;
			var pairedHits = dragPairs.map(function(x) {
				return [
					{match:x[0].interact.match,value:x[0].interact.value},
					{match:x[1].interact.match,value:x[1].interact.value},
				];
			});
			for (var i = 0; i < pairedHits.length; i++) {
				var pairedHit = pairedHits[i];
				pairedHit.sort(function(a,b) {
					if (typeof a.value !== 'string' || typeof b.value !== 'string') return a.value - b.value;
					return a.value.localeCompare(b.value, undefined, {numeric: true, sensitivity: 'base'});
				});
			}
			pairedHits.sort(function(a,b) {
				if (typeof a.match !== 'string' || typeof b.match !== 'string') return a.match - b.match;
				return a[0].match.localeCompare(b[0].match, undefined, {numeric: true, sensitivity: 'base'});
			});
			var answer = {pairedHits:pairedHits};
			draw.taskQuestion.dragPairThemUp.restoreAnswer(cell,answer);
		},
		reset: function(cell) {
			draw.taskQuestion.drag.reset(cell);
		},
		answerToTableDisplay: function(cell,answer) {
			return [''];
		},
		tableDisplayToAnswer: function(cell,txt) {
			return false;
		},
		getBlankAnswerData: function() {
			return draw.taskQuestion.drag.getBlankAnswerData();
		},
		drawHeatMap: function(ctx,questionObj,data) {
			return;
			var cell = questionObj._cells[0];
			var dragPairs = draw.taskQuestion.dragPairThemUp.getPairs(cell).dragPairs;
			
			dragPairs = dragPairs.map(function(x) {
				return {
					correctCount:0,
					match:x[0].interact.match,
					drags:x
				}
			});
			var totalFreq = 0;
			for (var d = 0; d < data.length; d++) {
				if (un(data[d].answerData) || un(data[d].answerData.pairedHits) || data[d].answerData.pairedHits.length === 1) continue;
				var freq = typeof data[d].freq === 'number' ? data[d].freq : 1;
				totalFreq += freq;
				var pairedHits = data[d].answerData.pairedHits;
				for (var h = 0; h < pairedHits.length; h++) {
					var pairedHit = pairedHits[h];
					if (pairedHit.length === 1) continue;
					var matchValue = pairedHit[0].match;
					var correct = true;
					for (var j = 1; j < pairedHit.length; j++) {
						if (pairedHit[j].match !== matchValue) {
							correct = false;
							break;
						}
					}
					if (correct === false) continue;
					var dragPair = dragPairs.find(function(x) {
						return x.match === matchValue;
					});
					if (typeof dragPair !== 'object') continue;
					dragPair.correctCount += freq;
				}
			}
			if (totalFreq === 0) return;
			
			//console.log('heatMap dragPairs',dragPairs);
			
			for (var d = 0; d < dragPairs.length; d++) {
				var dragPair = dragPairs[d];
				var prop = dragPair.correctCount/totalFreq;
				if (typeof prop !== 'number' || isNaN(prop)) continue;
				var color = getScaleColor(prop,['#FCC','#CFC']); //var color = getScaleColor(prop,['#CFC','#3F3']);
				
				for (var i = 0; i < dragPair.drags.length; i++) {
					var drag = dragPair.drags[i];
					updateBorder(drag);
					var rect = drag.tightBorder;
					if (rect.length === 4) rect.push(rect[0]+rect[2],rect[1]+rect[3]);	
					text({ctx:ctx,text:[String(Math.round(prop*100))+'%'],rect:[rect[0]-15,rect[1]-15,65,30],minTightHeight:30,align:[0,0],box:{type:'loose',color:color,borderColor:'#000',borderWidth:2,radius:5}});
				}
			}
			
			function getScaleColor(value,colors) { //eg. getScaleColor(0.25,['#FFF','#66F']);
				var c1 = hexToRgb(colors[0]);
				var c2 = hexToRgb(colors[1]);
				var color = {
					r:Math.round(c1.r+value*(c2.r-c1.r)),
					g:Math.round(c1.g+value*(c2.g-c1.g)),
					b:Math.round(c1.b+value*(c2.b-c1.b))
				};
				return "rgb("+color.r+","+color.g+","+color.b+")";
			}
		}
		
	},	
	
	vennDrag: {
		check:function(obj,answer) {
			var maxMarks = obj.partMarksMax[0];
			var check = {
				marks:0,
				feedback:['']
			};
			var hits = answer[0].hits;
			var correctCount = hits.filter(function(x) {return x.match === true;}).length;
			var requiredHits = hits.length;
			if (answer[0].blank === true) {
				
			} else if (correctCount === requiredHits) {
				check.marks = maxMarks;
			} else {
				check.marks = Math.min(maxMarks-1,Math.floor((correctCount/requiredHits)*maxMarks));
				if (hits.length > 0) {
					if (requiredHits > 6) {
						check.feedback = ['You have '+correctCount+ ' correct and '+(requiredHits-correctCount)+' wrong answers.'];
					} else {
						check.feedback = ['You have '+correctCount+ ' correct answer'+(correctCount === 1 ? '.' : 's.')];
					}
				}
			}
			//console.log(answer);
			return check;
		},
		getDragValue: function(path) {
			if (!un(path.interact.value) && path.interact.value !== '') return path.interact.value;
			if (path.obj[0].type === 'text2') return removeTags(clone(path.obj[0].text));
			return '';
		},
		getMeta: function(cell) {
			var drags = cell._inputTypes["drag"] || [];
			var dragAreas = cell._inputTypes["dragArea"] || [];
			return {dragsCount:drags.length,dragAreasCount:dragAreas.length};
		},
		getSaveData: function(cell) {
			return draw.taskQuestion.drag.getSaveData(cell);
		},
		restoreSaveData: function(cell,saveData) {
			draw.taskQuestion.drag.restoreSaveData(cell,saveData);
		},
		getAnswer: function(cell) {
			var drags = cell._inputTypes['drag'];
			var type = !un(cell._inputTypes['venn3DragArea']) ? 3 : 2;
			var venn = cell._inputTypes['venn'+type+'DragArea'][0];
			var obj = venn.obj[0];
			var answerData = {hits:[]};
			updateBorder(venn);
			var rect = venn.tightBorder;
			if (type === 2) {
				var value1 = 'a';
				var value2 = 'b';			
				if (obj.interact.values instanceof Array) {
					if (typeof obj.interact.values[0] === 'string') value1 = obj.interact.values[0];
					if (typeof obj.interact.values[1] === 'string') value2 = obj.interact.values[1];
				} else if (obj.interact.matches instanceof Array) {
					if (typeof obj.interact.matches[0] === 'string') value1 = obj.interact.matches[0];
					if (typeof obj.interact.matches[1] === 'string') value2 = obj.interact.matches[1];
				}
			} else if (type === 3) {
				var value1 = 'a';
				var value2 = 'b';			
				var value3 = 'c';			
				if (obj.interact.values instanceof Array) {
					if (typeof obj.interact.values[0] === 'string') value1 = obj.interact.values[0];
					if (typeof obj.interact.values[1] === 'string') value2 = obj.interact.values[1];
					if (typeof obj.interact.values[2] === 'string') value3 = obj.interact.values[2];
				} else if (obj.interact.matches instanceof Array) {
					if (typeof obj.interact.matches[0] === 'string') value1 = obj.interact.matches[0];
					if (typeof obj.interact.matches[1] === 'string') value2 = obj.interact.matches[1];
					if (typeof obj.interact.matches[2] === 'string') value3 = obj.interact.matches[2];
				}
			}
			for (var d = 0; d < drags.length; d++) {
				var drag = drags[d];
				var value = draw.taskQuestion.drag.getDragValue(drag);
				updateBorder(drag);
				var dragCenter = [drag.tightBorder[0]+0.5*drag.tightBorder[2],drag.tightBorder[1]+0.5*drag.tightBorder[3]];
				if (isPointInRect(dragCenter,rect[0],rect[1],rect[2],rect[3]) === false) {
					answerData.hits.push({value:value,hit:false,match:false});
					continue;
				}
				var hits = [];
				if (dist(obj._centerA,dragCenter) < obj._radius) hits.push(value1);
				if (dist(obj._centerB,dragCenter) < obj._radius) hits.push(value2);
				if (type === 3 && dist(obj._centerC,dragCenter) < obj._radius) hits.push(value3)
				var dragMatches = un(drag.interact.match) || drag.interact.match === '' ? [] : drag.interact.match.split(',');
				var match = true;
				if (dragMatches.length === hits.length) {
					for (var h = 0 ; h < hits.length; h++) {
						if (dragMatches.indexOf(hits[h]) === -1) {
							match = false;
							break;
						}
					}
				} else {
					match = false;
				}
				answerData.hits.push({value:value,hit:hits.join(','),match:match});
			}
			answerData.hits.sort(function(a,b) {
				if (a.value < b.value) return 1;
				return 0;
			});
			if (answerData.hits.length === 0) answerData.blank = true;
			return answerData;
		},
		restoreAnswer: function(cell,answer) {
			draw.taskQuestion.drag.restoreAnswer(cell);
		},
		showAnswerMode: function(cell,answers) {
			var drags = cell._inputTypes['drag'];
			var type = !un(cell._inputTypes['venn3DragArea']) ? 3 : 2;
			var venn = cell._inputTypes['venn'+type+'DragArea'][0];
			var obj = venn.obj[0];
			if (cell.type === 'starterQuestion') {
				for (var d = 0; d < drags.length; d++) {
					var drag = drags[d];
					draw._savePosition = [drag.tightBorder[0],drag.tightBorder[1]];
				}
			} else {
				draw.taskQuestion.drag.reset(cell);
			}
			
			if (!un(obj.interact.answerPositions)) {
				var answerPositions = obj.interact.answerPositions;
			} else if (type === 2) {
				var answerPositions = [[0.067,0.728],[0.497,0.403],[0.348,0.392],[0.662,0.445],[0.222,0.493],[0.318,0.678],[0.166,0.901],[0.804,0.505],[0.675,0.686],[0.502,0.59],[0.501,0.907],[0.813,0.914],[0.927,0.75]];
			} else if (type === 3) {
				var answerPositions = [[0.229,0.373],[0.34,0.173],[0.657,0.191],[0.741,0.376],[0.406,0.79],[0.556,0.784],[0.085,0.599],[0.214,0.884],[0.079,0.813],[0.355,0.594],[0.504,0.463],[0.643,0.589],[0.505,0.261],[0.902,0.64],[0.919,0.84]];
			}
			var matches = obj.interact.matches;
			if (un(answerPositions) || un(matches) || matches.length !== type) return;
			
			if (un(obj._rect)) draw['vennDiagram'+type].calc(obj);
			var l = obj._rect[0];
			var t = obj._rect[1];
			var w = obj._rect[2];
			var h = obj._rect[3];
			var pos = type === 3 ? {ttt:[],ttf:[],tft:[],tff:[],ftt:[],ftf:[],fft:[],fff:[]} : {tt:[],tf:[],ft:[],ff:[]};
			for (var p = 0; p < answerPositions.length; p++) {
				var ansPos = answerPositions[p];
				var ansPos2 = [l+w*ansPos[0],t+h*ansPos[1]];
				var type2 = dist(obj._centerA,ansPos2) < obj._radius ? 't' : 'f';
				type2 += (dist(obj._centerB,ansPos2) < obj._radius ? 't' : 'f');
				if (type === 3) type2 += (dist(obj._centerC,ansPos2) < obj._radius ? 't' : 'f');
				pos[type2].push(ansPos2);
			}
			for (var d = 0; d < drags.length; d++) {
				var drag = drags[d];
				var dragMatches = un(drag.interact.match) || drag.interact.match === '' ? [] : drag.interact.match.split(',');
				var type2 = (dragMatches.indexOf(matches[0]) > -1 ? 't' : 'f') + (dragMatches.indexOf(matches[1]) > -1 ? 't' : 'f');
				if (type === 3) type2 += (dragMatches.indexOf(matches[2]) > -1 ? 't' : 'f');
				if (!un(pos[type2][0])) {
					var pos2 = pos[type2][0];
					if (un(drag._initialPos)) drag._initialPos = [drag.tightBorder[0],drag.tightBorder[1]];
					positionPath(drag,pos2[0]-drag.tightBorder[2]/2,pos2[1]-drag.tightBorder[3]/2);
					pos[type2].shift();
				}
			}
		},
		reset: function(cell) {
			draw.taskQuestion.drag.reset(cell);
		},
		answerToTableDisplay: function(cell,answer) {
			var correct = [];
			var wrong = [];
			for (var h = 0; h < answer.hits.length; h++) {
				var hit = answer.hits[h];
				if (hit.match === true) {
					correct.push(hit.value);
				} else {
					wrong.push(hit.value);
				}
			}
			if (wrong.length === 0) {
				return ['All wrong'];
			} else if (correct.length === 0) {
				return ['All correct'];
			} else {
				return ['Correct: {'+correct.join(',')+'} Wrong: {'+wrong.join(',')+'}'];
			}
			
		},
		tableDisplayToAnswer: function(cell,txt) {
			return false;
		},
		getBlankAnswerData: function() {
			return draw.taskQuestion.drag.getBlankAnswerData();
		},
		drawHeatMap: function(ctx,questionObj,data) {	
			draw.taskQuestion.drag.drawHeatMap(ctx,questionObj,data);
		}
	
	}
}

var jMessage = {
	icons:{
		tick:['fas fa-check-circle','#DFD','#060'],
		cross:['fas fa-times-circle','#FDD','#F00'],
		pending:['fas fa-spinner fa-spin','#FFB','#660'],
		info:['fas fa-info-circle','#BBF','#00F'],
	},
	add:function(text,icon,hideMS) {
		if (typeof this.div === 'undefined') {
			this.div = this.addElement({tagName:'div',parent:document.body,style:{position:'fixed',right:'5px',bottom:'5px',width:'320px',zIndex:'1000000000000'}});
			var faScript = document.createElement('script');
			faScript.setAttribute('src','https://kit.fontawesome.com/c16b6819ae.js');
			faScript.setAttribute('crossorigin','anonymous');
			document.head.appendChild(faScript);
		}
		
		if (typeof icon !== 'string' || typeof this.icons[icon] === 'undefined') icon = 'tick';
		var icon2 = this.icons[icon];
		if (typeof hideMS === 'undefined') hideMS = 3000;
				
		var div = this.addElement({tagName:'div',parent:this.div,style:{cursor:'pointer',margin:'5px',backgroundColor:icon2[1],padding:'5px',border:'1px solid black'},onclick:this.hide});
		
		var iconDiv = this.addElement({tagName:'div',parent:div,style:{display:'inline-block',width:'10%',verticalAlign:'top',pointerEvents:'none'}});
		var textDiv = this.addElement({tagName:'div',parent:div,style:{display:'inline-block',width:'85%',verticalAlign:'top',pointerEvents:'none'}});
		this.addElement({tagName:'i',parent:iconDiv,class:icon2[0],style:{margin:'3px',color:icon2[2],pointerEvents:'none'}});
		this.addElement({tagName:'div',parent:textDiv,innerHTML:text,style:{pointerEvents:'none'}});
		
		var timeout = setTimeout(function() {
			if (typeof div.parentNode !== 'undefined') div.parentNode.removeChild(div);
		},hideMS,div);
		timeout.div = div;
		return div;
	},
	hide:function(e) {
		if (typeof e.target.parentNode !== 'undefined') e.target.parentNode.removeChild(e.target);
	},
	addElement:function(obj) {
		if (typeof obj.tagName !== 'string') return false;
		var tagName = obj.tagName;
		var element = document.createElement(tagName);
		for (var key in obj) {
			if (key === 'tagName') continue;
			if (key === 'parent') {
				obj[key].appendChild(element);
			} else if (key === 'class') {
				element.className = obj[key];
			} else if (key === 'style') {
				for (var key2 in obj.style) {
					element.style[key2] = obj.style[key2];
				}
			} else {
				element[key] = obj[key];
			}
		}
		return element;
	}
}

var textArrayCompressionMap = [
	['<<bold:true>>','bold'],
	['<<bold:false>>','nbold'],
	['<<italic:true>>','italic'],
	['<<italic:false>>','nitalic'],
	['<<font:algebra>>','algebrafont'],
	['×','times'],
	['÷','divide'],
	['£','pound']
];
function textArrayCompress(arr) {
	var a = '{';
	var b = '}';
	if (typeof arr === 'string') {
		for (var i = 0; i < textArrayCompressionMap.length; i++) {
			var map = textArrayCompressionMap[i];
			arr = replaceAll(arr,map[0],a+map[1]+b);
		}
		return arr;
	}
	if (arr instanceof Array) {
		var str = "";
		for (var i = 0; i < arr.length; i++) {
			var elem = arr[i];
			if (typeof elem === 'string') {
				str += textArrayCompress(elem);
			} else if (elem instanceof Array) {
				if (elem[0] === 'frac') {
					str += a+'frac'+a+textArrayCompress(elem[1])+b+a+textArrayCompress(elem[2])+b+b;
				} else if (elem[0] === 'pow') {
					str += a+'pow'+a+textArrayCompress(elem[2])+b+b;
				} else if (elem[0] === 'sqrt') {
					str += a+'sqrt'+a+textArrayCompress(elem[1])+b+b;
				} else if (elem[0] === 'root') {
					str += a+'root'+a+textArrayCompress(elem[1])+b+a+textArrayCompress(elem[2])+b+b;
				}
			}
		}
		return str;
	}
	return '';
}
function textArrayDecompress(str) {
	var a = '{';
	var b = '}';
	for (var i = 0; i < textArrayCompressionMap.length; i++) {
		var map = textArrayCompressionMap[i];
		str = replaceAll(str,a+map[1]+b,map[0]);
	}
	var arr = strToArr(str);
	if (typeof arr[0] !== 'string') arr.unshift('');
	if (typeof arr[arr.length-1] !== 'string') arr.push('');
	return arr;
	
	function strToArr(str) {
		if (typeof str === 'number') str = '';
		if (typeof str !== 'string') return [''];
		var arr = [];
		do {
			var index = str.indexOf(a);
			if (index > -1) {
				if (index > 0) arr.push(str.slice(0,index));
				str = str.slice(index);
				var elementType = str.indexOf('frac') === 1 ? 'frac' : str.indexOf('pow') === 1 ? 'pow' : str.indexOf('sqrt') === 1 ? 'sqrt' : str.indexOf('root') === 1 ? 'root' : '';
				var childElements = [];
				var childElementIndex = -1;
				var depth = 0;
				for (var c = 0; c < str.length; c++) {
					//console.log(str[c],depth,childElementIndex,childElements[childElementIndex]);
					if (str[c] === a) {
						depth++;
						if (depth === 2) {
							childElementIndex++;
							childElements[childElementIndex] = '';
						} else if (depth >= 2) {
							childElements[childElementIndex] += str[c];
						}
					} else if (str[c] === b) {
						depth--;
						if (depth === 0) {
							str = str.slice(c+1);
							break;
						} else if (depth >= 2) {
							childElements[childElementIndex] += str[c];
						}
					} else {
						if (typeof childElements[childElementIndex] === 'string') {
							childElements[childElementIndex] += str[c];
						}
					}
				}
				if (depth > 0) str = ''; // error, stop loop
				if (elementType === 'frac') {
					arr.push(['frac',strToArr(childElements[0]),strToArr(childElements[1])]);
				} else if (elementType === 'pow') {
					arr.push(['pow',false,strToArr(childElements[0])]);
				} else if (elementType === 'sqrt') {
					arr.push(['sqrt',strToArr(childElements[0])]);
				} else if (elementType === 'root') {
					arr.push(['root',strToArr(childElements[0]),strToArr(childElements[1])]);				
				}
			} else {
				arr.push(str);
				str = '';
			}
		} while (str.length > 0);
		return arr;
	}
}
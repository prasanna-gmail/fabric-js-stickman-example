// Version 16-05-18

var videoPlayerLoaded = 0; // 0 = frame not loaded, 1 = frame loaded, 2 = video loaded
var ytAPILoaded = false;
var video;
var videoData;
var videoMask;
var videoMaskData;
var player = [];
var taskVideo = [];
var taskVideoData = [];
var taskVideoMask = [];
var currVideoObj;
var videoPlaying;

var videoTriggerCount = 0;
var iframe = [];
var videoTriggerPoints = [];
var videoTriggerFunction = [];

//new vairables
var replayButton = [];
var replayButtonData = [];
//var firstPlay = [];
var replayVideoTime = 0;
var startTimes = []
var endTimes = []
var reloadButtonLeftGlobal = 0;
var reloadButtonTopGlobal = 0;


function loadVideo(videoId, aspectRatio, scaleFactor, left, top, visible, triggerPointsArray, triggerFunction, reloadButtonLeft, reloadButtonTop) {
	
	if (videoPlayerLoaded == 0) {
		videoPlayerLoaded = 1;
		setTimeout (function() {
			// This code loads the IFrame Player API code asynchronously.
			var tag = document.createElement('script');
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);	
		}, 1500);
	}
	video = document.createElement('iframe');
	if (!scaleFactor) {scaleFactor = 1};
	var width = 320 * scaleFactor;
	var height = 320 / aspectRatio * scaleFactor;
	if (!left) {left = 1175 - width};
	if (!top) {top = 675 - height};
	if (typeof visible !== 'boolean') {visible = true};
	if (typeof triggerPointsArray == 'object') {
		videoTriggerPoints[taskId] = triggerPointsArray;
		videoTriggerFunction[taskId] = triggerFunction;
	}
	
	if (typeof reloadButtonLeft !== 'undefined') {reloadButtonLeftGlobal = reloadButtonLeft};
	if (typeof reloadButtonTop !== 'undefined') {reloadButtonTopGlobal = reloadButtonTop};
	
	//only draw reload button if the reload top and left have been included. 
	
	if (typeof reloadButtonLeft !== 'undefined' && typeof reloadButtonTop !== 'undefined') 
	{drawRePlayButton(reloadButtonLeftGlobal, reloadButtonTopGlobal)}
			
	video.setAttribute('id', 'player' + taskId);
	video.setAttribute('position', 'absolute');
	video.setAttribute('cursor', 'pointer');
	video.setAttribute('draggable', 'false');
	video.setAttribute('class', 'videoClass');
	video.setAttribute('tabindex', 1);
	if (taskId == 0) {
		video.style.zIndex = 500;
		//video.style.opacity = 0;
	} else {
		video.style.zIndex = 0;
		video.style.opacity = 0;
	}
	//video.style.opacity = 1;
	video.setAttribute('src', '//www.youtube.com/embed/' + videoId + '?controls=0&rel=0&showinfo=0&enablejsapi=1&modestbranding=1&disablekb=1&wmode=transparent');
	video.setAttribute('frameborder', 0);
	
	iframe[taskId] = video;
	taskVideo[taskId] = true;
	
	videoData = [left, top, width, height, visible, false, false];
	videoData[100] = left;
	videoData[101] = top;
	videoData[102] = width;
	videoData[103] = height;
	videoData[104] = visible;
	videoData[130] = visible;
	
	taskVideoData[taskId] = videoData;
	video.data = videoData;
		
	container.appendChild(video);
	resize();
	
	if (ytAPILoaded == true) {
		player[taskNum] = new YT.Player('player' + taskNum, {events:{'onStateChange': onPlayerStateChange}});
	}
	
	return video;
	
}


function onYouTubeIframeAPIReady() {
	ytAPILoaded = true;
	for (i = 0; i < task.length; i++) {
		if (taskVideo[i] == true) {
			player[i] = new YT.Player('player' + i, {events:{'onStateChange': onPlayerStateChange}});
		}
	}
}


function onPlayerStateChange(event) {
	
	//console.log('playerStateChangeFunction', event.data);
	document.activeElement.blur();
	switch (event.data) {
		case -1 : //unstarted
			break;
		case 0 : // ended
			
			break;
		case 1 : // playing
		
			//show replayButton on first play;
			if (firstPlay[taskNum] == true) {
			 	showObj(replayButton[taskNum], replayButtonData[taskNum]);
				firstPlay[taskId] = false;
			}
						
			//run playVideo function from task
			if (typeof eval(taskTag + 'playVideo') == 'function') {eval(taskTag + 'playVideo();');}
		
			if (typeof videoTriggerFunction[taskId] !== 'undefined') {
				// reset all triggers
				eval(videoTriggerFunction[taskId]+'("reset");');			
				// get current time and perform all triggers up to that point
				var currTime = player[taskId].getCurrentTime();					
				videoTriggerCount = 0;
				for (vi = 0; vi < videoTriggerPoints[taskId].length; vi++) {
					if (currTime >= videoTriggerPoints[taskId][vi]) {
						videoTriggerCount = vi;
						eval(videoTriggerFunction[taskId]+'('+vi+');');					
					}
				}
			}

			// interval to listen for trigger points and call trigger function
			clearInterval(videoPlaying);
			videoPlaying = setInterval(function() {
				var currTime = player[taskId].getCurrentTime();
				// get trigger time for current video play time
				var currTrig = 0;
				if (videoTriggerPoints[taskId]) {
					for (vi = 0; vi < videoTriggerPoints[taskId].length; vi++) {
						if (currTime >= videoTriggerPoints[taskId][vi]) {currTrig = vi}
					}
				}
					
				// compare with videoTriggerCount
				if (currTrig > videoTriggerCount) {
					eval(videoTriggerFunction[taskId]+'('+currTrig+');');
					videoTriggerCount = currTrig;
				}

				//if the currentTime passes an end point, reset it to the start of that video. 
					
				//get video start and end times from task
				if (typeof eval(taskTag+'vidStartTimes') !== 'undefined') {
					startTimes = eval(taskTag+'vidStartTimes');
				}
				if (typeof eval(taskTag+'vidEndTimes') !== 'undefined') {
					endTimes = eval(taskTag+'vidEndTimes');
				}
				
				for (i = 0; i < 5; i++) {
					//if it after the end of the first video, or equal to it, then return to start	
					if (currTime >= endTimes[i] && currTime < endTimes[i] + 0.5) { 
						player[taskId].pauseVideo();
						if (typeof eval(taskTag + 'pauseVideo') == 'function') {eval(taskTag + 'pauseVideo();');}
						player[taskId].seekTo(startTimes[i], true);
						player[taskId].pauseVideo()
						clearInterval(videoPlaying) 
					}
					//set replayVideo Time
					if (currTime >= startTimes[i]) {replayVideoTime = startTimes[i]}
				}

				//console.log('videoPlayingRunning', 'currTime:', currTime, 'currTrig:', currTrig)
			}, 100);
		
			
			
			break;
		case 2 : // paused
			
			//check task pause video function exists
			if (typeof eval(taskTag + 'pauseVideo') == 'function') {eval(taskTag + 'pauseVideo();');}
			
			//taskVideoMask[taskId].style.opacity = 1;
			//iframe[taskId].style.opacity = 0;
			clearInterval(videoPlaying);
			break;
		case 3 : // buffering
			break;
		case 5 : // video cued
			break;
	}
}








//Inserted Code******************************************
//I've added a variable, pausedTime so that I can know where to restart the video if it gets paused
var pausedTime = [];




//draw reload button


	

function drawRePlayButton(left, top) {
	
	if (typeof left == 'undefined') {left = 0}
	if (typeof top == 'undefined') {top = 0}
	
	
	var replayButtonInstance = document.createElement('canvas')
	replayButtonInstance.setAttribute('id', 'replayButtonInstance');
	replayButtonInstance.setAttribute('class', 'buttonClass');
	replayButtonInstance.setAttribute('position', 'absolute');
	replayButtonInstance.setAttribute('cursor', 'pointer');
	replayButtonInstance.setAttribute('draggable', 'false');
	
	replayButtonInstance.style.zIndex = 1000;
	replayButtonInstance.style.pointerEvents = true;
	replayButtonInstance.width = 50;
	replayButtonInstance.height = 50;
	
	var replayButtonctx = replayButtonInstance.getContext('2d');
    replayButtonctx.clearRect(0, 0, 50, 50);
    replayButtonctx.fillStyle = '#0F0';
	replayButtonctx.fillRect(0, 0, 50, 50);
    replayButtonctx.strokeStyle = '#000'
    replayButtonctx.lineWidth = 3;
    replayButtonctx.strokeRect(0, 0, 50, 50);

    //replay arrow
    replayButtonctx.beginPath();
    replayButtonctx.lineWidth = 5;
    replayButtonctx.arc(25, 25, 10, 0.2 * Math.PI, 1.8 * Math.PI)
    replayButtonctx.lineWidth = 4;
    replayButtonctx.moveTo(35, 20);
    replayButtonctx.lineTo(33, 10);
    replayButtonctx.moveTo(35, 19);
    replayButtonctx.lineTo(28, 24);
    replayButtonctx.stroke();

	addListener(replayButtonInstance, replayVideoFunction)
	
	taskObject[taskId].push(replayButtonInstance);
	replayButton[taskId] = replayButtonInstance;
	
	var replayButtonDataInstance = [left, top, 50, 50, false, false, true, 2];
	replayButtonDataInstance[100] = left;
	replayButtonDataInstance[101] = top;
	replayButtonDataInstance[102] = 50;
	replayButtonDataInstance[103] = 50;
	replayButtonDataInstance[104] = false;
	taskObjectData[taskId].push(replayButtonDataInstance)
	replayButtonData[taskId] = replayButtonDataInstance;
	
	

	resize();
  
}

function replayVideoFunction () {
	
	if (player[taskId].getPlayerState() == -1) {} else {
	player[taskId].seekTo(replayVideoTime, true); 
	player[taskId].playVideo();}
	
	//play task replay video function if defined
	if (typeof eval(taskTag + 'replayVideo') == 'function') {eval(taskTag + 'replayVideo();');}

  
	
	
	}
// js

if (un(prevStatus))
	var prevStatus = 0;
if (un(prevPercentage))
	var prevPercentage = 0;
if (un(prevAttempts))
	var prevAttempts = 0;
if (un(tasksLogId))
	var tasksLogId = -1;

var userName = '';
var userId = 0;
if (un(userMode))
	var userMode = 'none';
if (un(userType))
	var userType = 'none';
var firstReportSent = false;
var wholeSchool = 0;

var idleTimeoutInSeconds = 2 * 60;
var firstReportTimeInSeconds = 20;
var reportIntervalInSeconds = 4 * 60;
var activityMonitor;
active();

var reports = [];
var reportFailureRetryTimeout = 10;
var reportFailureCount = 0;

function reportHandler() {
	if (Number(prevStatus == 3) || userType !== 'pupil')
		return;
	if (firstReportSent == false) {
		sendFirstReport();
	} else {
		sendReport();
	}
	if (un(TimeMe))
		return;
	clearReportTimeouts();
	if (taskState.indexOf(0) > -1) {
		var time = Math.round(TimeMe.getTimeOnPageInSeconds('page'));
		TimeMe.callAfterTimeElapsedInSeconds(time + reportIntervalInSeconds, reportHandler);
		//console.log('next -> ', time+reportIntervalInSeconds);
		//console.log(TimeMe.timeElapsedCallbacks);
	}
}
function clearReportTimeouts() {
	for (var i = TimeMe.timeElapsedCallbacks.length - 1; i >= 0; i--) {
		TimeMe.timeElapsedCallbacks[i].pending = false;
	}
}

function reportFailure() {
	if (reportFailureCount < 6) {
		Notifier.error('Error connecting to the server. Your score cannot be saved. Trying again in ' + reportFailureRetryTimeout + ' seconds...');
		clearReportTimeouts();
		reportFailureCount++;
		var time = Math.round(TimeMe.getTimeOnPageInSeconds('page'));
		TimeMe.callAfterTimeElapsedInSeconds(time + reportFailureRetryTimeout, reportHandler);
	} else {
		reportFailureCount = 0;
	}
}

function getSessionOnPageLoad() { // runs if task
	var xml = new XMLHttpRequest();
	var params = "taskId=" + holderTaskId;
	//console.log('getSessionOnPageLoad params: ', params);
	xml.open("post", "../taskGetSessionOnPageLoad.php", true);
	xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xml.onreadystatechange = function () {
		if (this.readyState === 4) {
			if (this.status === 200) {
				var response = JSON.parse(this.responseText);
				//console.log('taskGetSessionOnPageLoad response: ', response);

				userName = response.userName;
				userId = response.userId;
				userType = response.userType.toLowerCase();
				userMode = userType;
				tasksLogId = Number(response.tasksLogId);
				prevAttempts = Number(response.prevAttempts);
				prevStatus = Number(response.prevStatus);
				prevPercentage = Number(response.prevPercentage);
				wholeSchool = Number(response.wholeSchool);
				if (wholeSchool === 1) userType = 'wholeSchool';

				//console.log('prevStatus:',prevStatus);

				setWelcomeText();
				TimeMe.initialize({
					currentPageName: "page",
					idleTimeoutInSeconds: idleTimeoutInSeconds
				});
				if (userType == 'pupil') {
					TimeMe.callWhenUserLeaves(function () {
						inactive();
					});
					TimeMe.callWhenUserReturns(function () {
						active();
					});
					if (prevStatus < 3) {
						TimeMe.callAfterTimeElapsedInSeconds(firstReportTimeInSeconds, reportHandler);
					}
				}
				if (reportFailureCount > 0) {
					Notifier.success('Reconnected to the server.');
					reportFailureCount = 0;
				}
			} else {
				reportFailure();
			}
		}
	};
	xml.send(params);
}
function sendFirstReport(callback) {
	if (firstReportSent == true) {
		if (!un(callback))
			callback();
		return;
	}
	if (userType !== 'pupil' || Number(prevStatus) == 3)
		return;
	if (typeof pupilId == 'undefined')
		pupilId = userId;

	var report = {
		firstReport: true,
		sent: false,
		timestamp: Date.now(),
		id: reports.length,
		data: {
			pupilId: pupilId,
			taskId: holderTaskId,
			tasksLogId: tasksLogId,
			prevAttempts: prevAttempts,
			browserInfo: getBrowserInfo()
		}
	}
	reports.push(report);

	var params = "data=" + encodeURIComponent(JSON.stringify(report.data));
	var xml = new XMLHttpRequest();
	xml.open("post", "../taskSendFirstReport.php", true);
	xml.id = report.id;
	xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xml.onreadystatechange = function () {
		if (this.readyState === 4) {
			if (this.status === 200) {
				//console.log('sendFirstReport response: ', this.responseText);
				if (tasksLogId == -1)
					tasksLogId = Number(this.responseText);
				firstReportSent = true;
				window.onbeforeunload = function () {
					if (taskOrTool.toLowerCase() == 'task' && reports.last().sent == false) {
						reportHandler();
						return "Are you sure you wish to leave this task?";
					} else {
						return undefined;
					}
				};
				//console.log(this.id,reports[this.id]);
				reports[this.id].sent = true;
				if (reportFailureCount > 0) {
					Notifier.success('Reconnected to the server. Your score has been saved.');
					reportFailureCount = 0;
				}
				if (!un(callback))
					callback();
			} else {
				reportFailure();
			}
		}
	}
	xml.send(params);
}
function sendReport(pc) {
	if (firstReportSent == false) {
		sendFirstReport(function () {
			sendReport(pc)
		});
		return;
	}
	if (userType !== 'pupil' || Number(prevStatus) == 3)
		return;
	if (typeof pupilId == 'undefined')
		pupilId = userId;

	if (taskOrTool == 'task' || taskOrTool == 'Task') {
		var tasksCompleted = getArrayCount(taskState, 1);
		var percentageCompleted = Math.round(100 * tasksCompleted / task.length);
	} else if (taskOrTool == 'test' || taskOrTool == 'Test') {
		var percentageCompleted = pc || 0;
	}
	if (taskTag == 'n870') { // bidmas or times tables test (same taskTag)
		percentageCompleted = Math.round(100 * n870correctCount / n870qs);
		if (percentageCompleted >= 80) percentageCompleted = 100;
		//console.log(percentageCompleted);
	}

	var timeSpent = Math.round(TimeMe.getTimeOnPageInSeconds('page') / 60);
	//console.log('timeSpent:',timeSpent);
	var percentage = Math.max(prevPercentage, percentageCompleted);
	var status = 1;
	if (timeSpent > 19)
		status = 2;
	if (percentage == 100)
		status = 3;

	var report = {
		firstReport: false,
		sent: false,
		timestamp: Date.now(),
		id: reports.length,
		data: {
			tasksLogId: tasksLogId,
			percentage: percentage,
			status: status,
			timeSpent: timeSpent,
		}
	}
	reports.push(report);

	var params = "data=" + encodeURIComponent(JSON.stringify(report.data));

	var xml = new XMLHttpRequest();
	xml.id = report.id;
	xml.open("post", "../taskSendReport.php", true);
	xml.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xml.onreadystatechange = function () {
		if (this.readyState === 4) {
			if (this.status === 200) {
				var response = JSON.parse(this.responseText);
				//console.log('sendReport response: ', response);
				firstReportSent = true;
				//console.log(this.id,reports[this.id]);
				reports[this.id].sent = true;
				if (reportFailureCount > 0) {
					Notifier.success('Reconnected to the server. Your score has been saved.');
					reportFailureCount = 0;
				}
				if (percentageCompleted == 100 && (taskOrTool == 'task' || taskOrTool == 'Task')) {
					unfadePage();
					showTaskCompleteMessage();
					clearReportTimeouts();
				}
			} else {
				reportFailure();
			}
		}
	}
	xml.send(params);
}
function taskCompleted() {
	if (TimeMe.idle == true)
		return;
	taskState[taskNum] = 1;
	if (getArrayCount(taskState, 1) == taskState.length) {
		//console.log(taskState,userType,Number(prevStatus));
		if (userType !== 'pupil' || Number(prevStatus) == 3) {
			showTaskCompleteMessage();
		} else {
			reportHandler();
		}
	} else {
		fadePage();
		container.appendChild(holderButton[5]);
		container.appendChild(holderButton[6]);
		holderButton[5].style.opacity = 1;
		holderButton[6].style.opacity = 1;
		reportHandler();
	}
	userInfoTextUpdate();
}

function active(e) {
	unfadePage();
	//console.log('active');
}
function inactive() {
	if (userType == 'pupil') {
		//fadePage();
		//container.appendChild(inactiveBox);
		//console.log('inactive');
	}
}

function setWelcomeText() {
	userInfoTextctx.font = "24px Verdana, Geneva, sans-serif";
	userInfoTextctx.textAlign = "left";
	userInfoTextctx.textBaseline = "middle";
	userInfoTextctx.fillStyle = "#000";
	userInfoTextctx.fillText("Welcome " + userName, 2, 15);
}
function fromConsole() {
	// adapted from http://stackoverflow.com/questions/24966759/how-can-we-know-if-a-function-is-called-from-console-or-from-source-code
	var stack;
	try {
		// Throwing the error for Safari's sake, in Chrome and Firefox
		// var stack = new Error().stack; is sufficient.
		throw new Error();
	} catch (e) {
		stack = e.stack;
	}
	if (!stack)
		return false;
	var lines = stack.split("\n");
	for (var i = 0; i < lines.length; i++) {
		//console.log(lines[i]);
		if (lines[i].indexOf("at Object.InjectedScript.") > -1 || lines[i].indexOf("at <anonymous>") > -1)
			return true; // Chrome console
		if (lines[i].indexOf("@debugger eval code") > -1)
			return true; // Firefox console
		if (lines[i].indexOf("_evaluateOn") > -1)
			return true; // Safari console
	}
	return false;
}

function loadTaskCompleteMessages() {
	if (getArrayCount(taskCompleteMessage, 0) > 0) {
		starYellow.src = "../images/starYellow.png";
		starYellowPointy.src = "../images/starYellowPointy.png";
		starWhite6points.src = "../images/starWhite6points.png";
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)] = [];
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)] = [];
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)] = [];

		//create purple background
		createHolderCanvas(20, 100, 1150, 570, false);
		holderButton[holderButton.length - 1].style.backgroundColor = "#C6F";
		holderButton[holderButton.length - 1].style.borderRadius = "5px";
		holderButton[holderButton.length - 1].style.border = "4px solid black"
			holderButton[holderButton.length - 1].style.cursor = "auto";
		addListener(holderButton[holderButton.length - 1], dismissTaskCompleteMessage)
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);

		//create dismiss button
		createHolderCanvas(1050, 120, 110, 26, false);
		holderButtonctx[holderButtonctx.length - 1].font = "30px Arial";
		holderButtonctx[holderButtonctx.length - 1].fillStyle = "#FFF";
		holderButtonctx[holderButtonctx.length - 1].textAlign = "center";
		holderButtonctx[holderButtonctx.length - 1].textBaseline = "middle";
		holderButtonctx[holderButtonctx.length - 1].fillText("Dismiss", 55, 13);
		holderButton[holderButton.length - 1].onmousedown = function () {
			dismissTaskCompleteMessage()
		};
		holderButton[holderButton.length - 1].ontouchstart = function () {
			dismissTaskCompleteMessage()
		};
		addListener(holderButton[holderButton.length - 1], dismissTaskCompleteMessage)

		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);

		//create star canvases
		createHolderCanvas(100, 150, 126, 126, false);
		holderButton[holderButton.length - 1].style.cursor = "auto";
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);

		createHolderCanvas(750, 120, 126, 126, false);
		holderButton[holderButton.length - 1].style.cursor = "auto";
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);

		createHolderCanvas(700, 400, 252, 252, false);
		holderButton[holderButton.length - 1].style.cursor = "auto";
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);

		createHolderCanvas(300, 120, 189, 189, false);
		holderButton[holderButton.length - 1].style.cursor = "auto";
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);

		createHolderCanvas(950, 300, 189, 189, false);
		holderButton[holderButton.length - 1].style.cursor = "auto";
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);

		createHolderCanvas(900, 120, 126, 126, false);
		holderButton[holderButton.length - 1].style.cursor = "auto";
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);

		createHolderCanvas(820, 250, 126, 126, false);
		holderButton[holderButton.length - 1].style.cursor = "auto";
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);

		createHolderCanvas(1000, 500, 126, 126, false);
		holderButton[holderButton.length - 1].style.cursor = "auto";
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);

		createHolderCanvas(500, 100, 252, 252, false);
		holderButton[holderButton.length - 1].style.cursor = "auto";
		taskCompleteMessageCanvas[taskCompleteMessage.indexOf(0)].push(holderButton[holderButton.length - 1]);
		taskCompleteMessageCanvasctx[taskCompleteMessage.indexOf(0)].push(holderButtonctx[holderButtonctx.length - 1]);
		taskCompleteMessageCanvasData[taskCompleteMessage.indexOf(0)].push(holderButtonData[holderButtonData.length - 1]);
	}
	resize();
}
function showTaskCompleteMessage() {
	// append all Task Complete Message canvases
	for (i = 0; i < taskCompleteMessageCanvas[0].length; i++) {
		container.appendChild(taskCompleteMessageCanvas[0][i]);
		taskCompleteMessageCanvas[0][i].style.zIndex = 1000000;
	}

	taskCompleteMessageCanvasctx[0][0].fillStyle = "#FFF";
	taskCompleteMessageCanvasctx[0][0].textAlign = "center";
	taskCompleteMessageCanvasctx[0][0].textBaseline = "middle";

	if (userType == 'Pupil') {
		taskCompleteMessageCanvasctx[0][0].font = "110px Hobo";
		taskCompleteMessageCanvasctx[0][0].fillText("Task Complete!", 350, 275);
		taskCompleteMessageCanvasctx[0][0].font = "55px Hobo";
		taskCompleteMessageCanvasctx[0][0].fillText("Well done, " + userName, 350, 420);
		taskCompleteMessageCanvasctx[0][0].font = "55px Hobo";
		taskCompleteMessageCanvasctx[0][0].fillText("Your result has been logged", 350, 490);
	} else {
		taskCompleteMessageCanvasctx[0][0].font = "110px Hobo";
		taskCompleteMessageCanvasctx[0][0].fillText("Task Complete!", 350, 375);
	}

	switch (taskCompleteMessage[taskNum]) {
	case 0:
		var rotationSpeed = 25; // milliseconds per degree
		var intervalInstance = setInterval(function () {
				rotateThings()
			}, rotationSpeed);
		taskCompleteMessageInterval.push(intervalInstance);

		function rotateThings() {
			for (i = 2; i < taskCompleteMessageCanvasctx[0].length; i++) {
				taskCompleteMessageCanvasctx[0][i].clearRect(0, 0, taskCompleteMessageCanvasData[0][i][2], taskCompleteMessageCanvasData[0][i][3]);
				taskCompleteMessageCanvasctx[0][i].translate(taskCompleteMessageCanvasData[0][i][2] / 2, taskCompleteMessageCanvasData[0][i][3] / 2);
				taskCompleteMessageCanvasctx[0][i].rotate(Math.PI / 180);
				taskCompleteMessageCanvasctx[0][i].translate(taskCompleteMessageCanvasData[0][i][2] / -2, taskCompleteMessageCanvasData[0][i][3] / -2);
			}
			taskCompleteMessageCanvasctx[0][2].drawImage(starYellow, 20, 20, 86, 86);
			taskCompleteMessageCanvasctx[0][3].drawImage(starYellow, 20, 20, 86, 86);
			taskCompleteMessageCanvasctx[0][4].drawImage(starYellow, 60, 60, 172, 172);
			taskCompleteMessageCanvasctx[0][5].drawImage(starWhite6points, 24, 33, 141, 123);
			taskCompleteMessageCanvasctx[0][6].drawImage(starWhite6points, 24, 33, 141, 123);
			taskCompleteMessageCanvasctx[0][7].drawImage(starYellowPointy, 20, 21, 86, 84);
			taskCompleteMessageCanvasctx[0][8].drawImage(starYellowPointy, 20, 21, 86, 84);
			taskCompleteMessageCanvasctx[0][9].drawImage(starYellowPointy, 20, 21, 86, 84);
			taskCompleteMessageCanvasctx[0][10].drawImage(starYellowPointy, 40, 42, 152, 148);
		}
		break;
	}
}
function dismissTaskCompleteMessage() {

	// remove all Task Complete Message canvases
	if (!un(taskCompleteMessageCanvas) && !un(taskCompleteMessageCanvas[0])) {
		for (i = 0; i < taskCompleteMessageCanvas[0].length; i++) {
			if (taskCompleteMessageCanvas[0][i].parentNode == container) {
				container.removeChild(taskCompleteMessageCanvas[0][i])
			}
		}
	}
	// stop the rotations
	if (!un(taskCompleteMessageInterval) && taskCompleteMessageInterval[taskCompleteMessageInterval.length - 1]) {
		clearInterval(taskCompleteMessageInterval[taskCompleteMessageInterval.length - 1]);
	}
	unfadePage();
	//fadePage();
	//container.appendChild(holderButton[5]);
	//container.appendChild(holderButton[6]);
}
function getBrowserInfo() {
	/**
	 * JavaScript Client Detection
	 * (C) viazenetti GmbH (Christian Ludwig)
	 */

	var unknown = '-';

	// screen
	var screenSize = '';
	if (screen.width) {
		width = (screen.width) ? screen.width : '';
		height = (screen.height) ? screen.height : '';
		screenSize += '' + width + " x " + height;
	}

	// browser
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browser = navigator.appName;
	var version = '' + parseFloat(navigator.appVersion);
	var majorVersion = parseInt(navigator.appVersion, 10);
	var nameOffset,
	verOffset,
	ix;

	// Opera
	if ((verOffset = nAgt.indexOf('Opera')) != -1) {
		browser = 'Opera';
		version = nAgt.substring(verOffset + 6);
		if ((verOffset = nAgt.indexOf('Version')) != -1) {
			version = nAgt.substring(verOffset + 8);
		}
	}
	// Opera Next
	if ((verOffset = nAgt.indexOf('OPR')) != -1) {
		browser = 'Opera';
		version = nAgt.substring(verOffset + 4);
	}
	// Edge
	else if ((verOffset = nAgt.indexOf('Edge')) != -1) {
		browser = 'Microsoft Edge';
		version = nAgt.substring(verOffset + 5);
	}
	// MSIE
	else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
		browser = 'Microsoft Internet Explorer';
		version = nAgt.substring(verOffset + 5);
	}
	// Chrome
	else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
		browser = 'Chrome';
		version = nAgt.substring(verOffset + 7);
	}
	// Safari
	else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
		browser = 'Safari';
		version = nAgt.substring(verOffset + 7);
		if ((verOffset = nAgt.indexOf('Version')) != -1) {
			version = nAgt.substring(verOffset + 8);
		}
	}
	// Firefox
	else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
		browser = 'Firefox';
		version = nAgt.substring(verOffset + 8);
	}
	// MSIE 11+
	else if (nAgt.indexOf('Trident/') != -1) {
		browser = 'Microsoft Internet Explorer';
		version = nAgt.substring(nAgt.indexOf('rv:') + 3);
	}
	// Other browsers
	else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
		browser = nAgt.substring(nameOffset, verOffset);
		version = nAgt.substring(verOffset + 1);
		if (browser.toLowerCase() == browser.toUpperCase()) {
			browser = navigator.appName;
		}
	}
	// trim the version string
	if ((ix = version.indexOf(';')) != -1)
		version = version.substring(0, ix);
	if ((ix = version.indexOf(' ')) != -1)
		version = version.substring(0, ix);
	if ((ix = version.indexOf(')')) != -1)
		version = version.substring(0, ix);

	majorVersion = parseInt('' + version, 10);
	if (isNaN(majorVersion)) {
		version = '' + parseFloat(navigator.appVersion);
		majorVersion = parseInt(navigator.appVersion, 10);
	}

	// mobile version
	var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

	// cookie
	var cookieEnabled = (navigator.cookieEnabled) ? true : false;

	if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
		document.cookie = 'testcookie';
		cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
	}

	// system
	var os = unknown;
	var clientStrings = [{
			s: 'Windows 10',
			r: /(Windows 10.0|Windows NT 10.0)/
		}, {
			s: 'Windows 8.1',
			r: /(Windows 8.1|Windows NT 6.3)/
		}, {
			s: 'Windows 8',
			r: /(Windows 8|Windows NT 6.2)/
		}, {
			s: 'Windows 7',
			r: /(Windows 7|Windows NT 6.1)/
		}, {
			s: 'Windows Vista',
			r: /Windows NT 6.0/
		}, {
			s: 'Windows Server 2003',
			r: /Windows NT 5.2/
		}, {
			s: 'Windows XP',
			r: /(Windows NT 5.1|Windows XP)/
		}, {
			s: 'Windows 2000',
			r: /(Windows NT 5.0|Windows 2000)/
		}, {
			s: 'Windows ME',
			r: /(Win 9x 4.90|Windows ME)/
		}, {
			s: 'Windows 98',
			r: /(Windows 98|Win98)/
		}, {
			s: 'Windows 95',
			r: /(Windows 95|Win95|Windows_95)/
		}, {
			s: 'Windows NT 4.0',
			r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/
		}, {
			s: 'Windows CE',
			r: /Windows CE/
		}, {
			s: 'Windows 3.11',
			r: /Win16/
		}, {
			s: 'Android',
			r: /Android/
		}, {
			s: 'Open BSD',
			r: /OpenBSD/
		}, {
			s: 'Sun OS',
			r: /SunOS/
		}, {
			s: 'Linux',
			r: /(Linux|X11)/
		}, {
			s: 'iOS',
			r: /(iPhone|iPad|iPod)/
		}, {
			s: 'Mac OS X',
			r: /Mac OS X/
		}, {
			s: 'Mac OS',
			r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/
		}, {
			s: 'QNX',
			r: /QNX/
		}, {
			s: 'UNIX',
			r: /UNIX/
		}, {
			s: 'BeOS',
			r: /BeOS/
		}, {
			s: 'OS/2',
			r: /OS\/2/
		}, {
			s: 'Search Bot',
			r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
		}
	];
	for (var id in clientStrings) {
		var cs = clientStrings[id];
		if (cs.r.test(nAgt)) {
			os = cs.s;
			break;
		}
	}

	var osVersion = unknown;

	if (/Windows/.test(os)) {
		osVersion = /Windows (.*)/.exec(os)[1];
		os = 'Windows';
	}

	switch (os) {
	case 'Mac OS X':
		osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt);
		if (typeof osVersion !== 'undefined' && typeof osVersion[1] !== 'undefined') {
			osVersion = osVersion[1];
		} else {
			osVersion = '';
		}
		break;

	case 'Android':
		osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
		break;

	case 'iOS':
		osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
		osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
		break;
	}

	/*window.browserinfo = {
	screen: screenSize,
	browser: browser,
	browserVersion: version,
	browserMajorVersion: majorVersion,
	mobile: mobile,
	os: os,
	osVersion: osVersion,
	cookies: cookieEnabled,
	};*/
	return os + " " + osVersion + " " + browser + " " + version + " " + screenSize + " mobile:" + mobile + " cookies:" + cookieEnabled;
}
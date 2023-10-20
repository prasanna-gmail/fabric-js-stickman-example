// Javascript Document

//if (typeof taskData === 'undefined') taskData = {};
var teach = {
    resource: function () {
        return file.resources[resourceIndex];
    },
    page: function () {
        return file.resources[resourceIndex].pages[pIndex];
    }
};
var divMode = true;
var multiPage = false;
var pages = [[{}
    ]];
var p;
var currFilename = id;
var currFilenameLocal = '';
var title = 'MathsPad Teach';
var file = {
    version: 2,
    title: '',
    resources: [{
            name: 'Slides',
            pageCount: 1,
            pages: [{
                    _loaded: 1,
                    paths: [],
                }
            ]
        }
    ],
};

if (divMode == false) {
    //draw.div.style.overflow = 'hidden';
    function scrollChange(value) {
        if (document.body.contains(this.canvas) == false)
            return;
        var y = (700 - 1700) * (value / scroller.max);
        changeDrawRelPos(draw.drawRelPos[0], y, false);
        if (!un(file.resources) && !un(file.resources[resourceIndex]) && !un(file.resources[resourceIndex].pages) && !un(file.resources[resourceIndex].pages[pIndex])) {
            var page = file.resources[resourceIndex].pages[pIndex];
            if (page.pageVis == false) {
                resizeCanvas3(page.canvas, draw.drawRelPos[0], y);
            }
            page._scrollValue = value;
        }
    }
    var scroller = createScroller({
        rect: [1200, 0, 25, 700],
        z: 100,
        min: 0,
        max: 20,
        inc: 1,
        visible: false,
        colors: {
            buttons: '#BBB',
            slider: '#BBB',
            border: '#BBB',
            back: '#EEE',
            buttonsBorder: '#BBB',
            arrows: '#EEE'
        },
        radius: 0,
        sliderHeight: (700 - 2 * 25),
        funcMove: scrollChange,
        funcStop: scrollChange
    });
    function mouseWheelHandler(e) {
        var e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        setScrollerValue(scroller, scroller.value - delta, true);
    }
    var presentMaskTop = newctx({
        z: 1000000,
        rect: [0, -200, 1225, 200]
    }).canvas;
    presentMaskTop.style.backgroundColor = '#9C9AFF';
    var presentMaskBottom = newctx({
        z: 1000000,
        rect: [0, 700, 1225, 200]
    }).canvas;
    presentMaskBottom.style.backgroundColor = '#9C9AFF';
}
ctx.clearRect(0, 0, 1200, 700)

function getResourceType(resource) {
    if (un(resource))
        var resource = file.resources[resourceIndex];
    if (un(resource))
        return 'worksheet';
    if (!un(resource.type)) {
        if (resource.type.toLowerCase().indexOf('task') > -1)
            return 'task';
        if (resource.type.toLowerCase() == 'slides')
            return 'slides';
        if (resource.type.toLowerCase() == 'link')
            return 'link';
        if (resource.type.toLowerCase() == 'worksheet')
            return 'worksheet';
        if (resource.type.toLowerCase() == 'handout')
            return 'worksheet';
        if (resource.type.toLowerCase() == 'booklet')
            return 'worksheet';
        if (resource.type.toLowerCase() == 'test')
            return 'worksheet';
    }
    if (resource.name.toLowerCase().indexOf('task') > -1)
        return 'task';
    if (resource.name.toLowerCase().indexOf('slides') > -1)
        return 'slides';
    return 'worksheet';
}

var loginTrayButton, loginBox = [], pleaseSubscribeTrayButton, pleaseSubscribeButton, hidden, visibilityChange, lastLoginCheckTime, loginCheckCount, loginMask;
buildLoginBox();
buildPleaseSubscribeButtons();
if (userInfo.user == 'none') {
    enableVisibilityChangeLoginMonitor();
}
function buildLoginBox() {
    var vis = userInfo.user == 'none' ? true : false;
    loginTrayButton = newctx({
        rect: [0, 0, 120, 40],
        z: 200000000000,
        vis: vis,
        pE: true
    }).canvas;
    resizeCanvas(loginTrayButton, 450, 705);
    var paths = [{
            obj: [{
                    type: "text2",
                    rect: [1, 1, 118, 38],
                    text: [""],
                    box: {
                        type: "loose",
                        borderColor: "#000",
                        color: '#FFF',
                        borderWidth: 2,
                        radius: 5
                    }
                }
            ]
        }, {
            obj: [{
                    type: "text2",
                    rect: [48, 0, 60, 40],
                    text: ["<<align:center>><<font:Hobo>><<fontSize:28>><<color:#00F>>Login"],
                    align: [0, 0]
                }
            ]
        }
    ];
    drawPathsToCanvas(loginTrayButton, paths);
    addListener(loginTrayButton, function () {
        if (boolean(file.resources[resourceIndex].pages[pIndex].pageVis, true) == true && loginBox[0].parentNode == container) {
            hideObj(loginBox);
        } else {
            showObj(loginBox);
            resize();
        }
    });

    loginMask = newctx({
        rect: [0, 0, 1200, 700],
        z: 2000000000,
        vis: false,
        pE: true
    }).canvas;
    loginMask.style.backgroundColor = colorA('#666', 0.7);
    loginMask.style.cursor = 'default';

    loginBox = [];
    function style(element, styles) {
        for (var key in styles)
            element.style[key] = styles[key];
    }
    var loginCanvas = document.createElement('canvas');
    style(loginCanvas, {
        zIndex: '10000000000',
        position: 'absolute',
        backgroundColor: 'rgb(255, 255, 255)',
        border: '2px solid rgb(0, 0, 0)',
        borderRadius: '15px'
    });
    loginCanvas.width = 400;
    loginCanvas.height = 300;
    loginCanvas.data = [400, 200, 400, 300];
    for (var i = 0; i < 4; i++)
        loginCanvas.data[100 + i] = loginCanvas.data[i];
    resizeCanvas(loginCanvas, 400, 200, 400, 300);
    loginBox.push(loginCanvas);
    loginCanvas.draw = function () {
        var ctx = this.getContext('2d');
        ctx.clearRect(0, 0, 400, 300);
        ctx.putImageData(homeImage.imageData, 25, 25);

        text({
            ctx: ctx,
            text: ['<<font:Hobo>><<fontSize:36>>Login to MathsPad'],
            rect: [75, 25, 300, 50],
            align: [0, 0]
        });

        text({
            ctx: ctx,
            text: ['<<fontSize:20>><<bold:true>>Username'],
            rect: [30, 110, 100, 30],
            align: [0, 0]
        });
        text({
            ctx: ctx,
            text: ['<<fontSize:20>><<bold:true>>Password'],
            rect: [30, 150, 100, 30],
            align: [0, 0]
        });

        ctx.beginPath();
        ctx.fillStyle = '#00F';
        ctx.arc(204, 273, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    var homeImage = new Image;
    homeImage.onload = function () {
        draw.hiddenCanvas.ctx.clear();
        draw.hiddenCanvas.ctx.drawImage(homeImage, 0, 0, 50, 50);
        homeImage.imageData = draw.hiddenCanvas.ctx.getImageData(0, 0, 50, 50);
        var length = homeImage.imageData.length;
        for (var i = 0; i < length; i += 4) {
            if (homeImage.imageData[i] >= 245 && homeImage.imageData[i + 1] >= 245 && homeImage.imageData[i + 2] >= 245) {
                homeImage.imageData[i + 3] = 0;
            }
        }
        loginCanvas.draw();

        draw.hiddenCanvas.ctx.clear();
        draw.hiddenCanvas.ctx.drawImage(homeImage, 0, 0, 34, 34);
        homeImage.imageData2 = draw.hiddenCanvas.ctx.getImageData(0, 0, 34, 34);
        var length = homeImage.imageData2.length;
        for (var i = 0; i < length; i += 4) {
            if (homeImage.imageData2[i] >= 245 && homeImage.imageData2[i + 1] >= 245 && homeImage.imageData2[i + 2] >= 245) {
                homeImage.imageData2[i + 2] = 204;
            }
        }
        loginTrayButton.ctx.putImageData(homeImage.imageData2, 6, 3);

        draw.hiddenCanvas.ctx.clear();
    }
    homeImage.src = "/Images/logoSmall.PNG";

    var form = document.createElement('form');
    form.action = '';
    form.method = 'POST';
    loginBox.push(form);
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        loginFromPage();
    });

    var label1 = document.createElement('label');
    form.appendChild(label1);
    label1.innerHTML = 'Username';
    label1.setAttribute('for', 'input-username');
    label1.style.display = 'none';

    var input1 = document.createElement('input');
    input1.id = 'input-username';
    style(input1, {
        zIndex: '10000000001',
        position: 'absolute',
        backgroundColor: '#FFC'
    });
    input1.setAttribute('autocomplete', 'username');
    input1.setAttribute('type', 'text');
    input1.setAttribute('name', 'username');
    input1.setAttribute('required', 1);
    input1.allowDefault = true;
    input1.data = [550, 312, 200, 22];
    resizeCanvas(input1, 550, 312, 200, 22);
    form.appendChild(input1);

    var label2 = document.createElement('label');
    form.appendChild(label2);
    label2.innerHTML = 'Password';
    label2.setAttribute('for', 'input-password');
    label2.style.display = 'none';

    var input2 = document.createElement('input');
    input2.id = 'input-password';
    style(input2, {
        zIndex: '10000000001',
        position: 'absolute',
        backgroundColor: '#FFC'
    });
    input2.setAttribute('autocomplete', 'password');
    input2.setAttribute('type', 'password');
    input2.setAttribute('name', 'password');
    input2.setAttribute('required', 1);
    input2.allowDefault = true;
    input2.data = [550, 352, 200, 22];
    resizeCanvas(input2, 550, 352, 200, 22);
    form.appendChild(input2);

    var loginButton = document.createElement('button');
    style(loginButton, {
        zIndex: '10000000001',
        position: 'absolute',
        pointerEvents: 'auto',
        cursor: 'pointer',
        backgroundColor: '#FCF',
        borderStyle: 'solid',
        borderColor: '#666',
        borderWidth: '1.5px',
        fontWeight: 'bold'
    });
    loginButton.data = [670, 395, 80, 35];
    resizeCanvas(loginButton, 670, 395, 80, 35);
    loginButton.innerHTML = 'Login';
    loginButton.setAttribute('type', 'submit');
    loginButton.allowDefault = true;
    form.appendChild(loginButton);

    form.resize = function () {
        var children = [input1, input2, loginButton];
        for (var c = 0; c < children.length; c++) {
            resizeCanvas(children[c]);
        }
    }

    var createAccountButton = document.createElement('canvas');
    loginBox.push(createAccountButton);
    style(createAccountButton, {
        zIndex: '10000000001',
        position: 'absolute',
        pointerEvents: 'auto',
        cursor: 'pointer'
    });
    addListener(createAccountButton, function () {
        window.open('/pleaseSubscribe.php', '_blank');
    });
    createAccountButton.width = 150;
    createAccountButton.height = 50;
    createAccountButton.data = [450, 450, 150, 50];
    for (var i = 0; i < 4; i++)
        createAccountButton.data[100 + i] = createAccountButton.data[i];
    resizeCanvas(createAccountButton, 450, 450, 150, 50);
    loginBox.push(createAccountButton);
    text({
        ctx: createAccountButton.getContext('2d'),
        text: ['<<fontSize:16>><<color:#00F>><<bold:true>>Create Account'],
        rect: [0, 0, 150, 50],
        align: [0, 0]
    });

    var remindMeButton = document.createElement('canvas');
    loginBox.push(remindMeButton);
    style(remindMeButton, {
        zIndex: '10000000001',
        position: 'absolute',
        pointerEvents: 'auto',
        cursor: 'pointer'
    });
    addListener(remindMeButton, function () {
        window.open('/resendDetails2.php', '_blank');
    });
    remindMeButton.width = 150;
    remindMeButton.height = 50;
    remindMeButton.data = [600, 450, 150, 50];
    for (var i = 0; i < 4; i++)
        remindMeButton.data[100 + i] = remindMeButton.data[i];
    resizeCanvas(remindMeButton, 600, 450, 150, 50);
    loginBox.push(remindMeButton);
    text({
        ctx: remindMeButton.getContext('2d'),
        text: ['<<fontSize:16>><<color:#00F>><<bold:true>>Remind Me'],
        rect: [0, 0, 150, 50],
        align: [0, 0]
    });
}
function buildPleaseSubscribeButtons() {
    var vis = userInfo.user !== 'none' && userInfo.verified == 1 ? true : false;
    pleaseSubscribeTrayButton = newctx({
        rect: [0, 0, 160, 40],
        z: 200000000000,
        vis: vis,
        pE: true
    }).canvas;
    resizeCanvas(pleaseSubscribeTrayButton, 600, 705);
    var paths = [{
            obj: [{
                    type: "text2",
                    rect: [1, 1, 158, 38],
                    text: [""],
                    box: {
                        type: "loose",
                        borderColor: "#000",
                        color: '#FFF',
                        borderWidth: 2,
                        radius: 5
                    }
                }
            ]
        }, {
            obj: [{
                    type: "text2",
                    rect: [48, 0, 105, 40],
                    text: ["<<align:center>><<font:Hobo>><<fontSize:28>><<color:#00F>>Subscribe"],
                    align: [0, 0]
                }
            ]
        }
    ];
    drawPathsToCanvas(pleaseSubscribeTrayButton, paths);
    addListener(pleaseSubscribeTrayButton, function () {
        window.open('/pleaseSubscribe.php', '_blank');
    });

    pleaseSubscribeButton = newctx({
        z: 200000000000,
        vis: false,
        pE: true
    }).canvas;
    var paths = [{
            obj: [{
                    type: "text2",
                    rect: [416.976, 287.592, 366.048, 122.92],
                    text: [""],
                    box: {
                        type: "loose",
                        borderColor: "#000",
                        color: "#FFC",
                        borderWidth: 4,
                        radius: 10
                    }
                }, {
                    type: "text2",
                    rect: [510.924, 299.885, 266.304, 100],
                    text: ["<<fontSize:40>><<align:center>><<font:Hobo>><<color:#00F>>Please click here to subscribe"],
                    align: [0, 0]
                }
            ]
        }
    ];
    drawPathsToCanvas(pleaseSubscribeButton, paths);
    addListener(pleaseSubscribeButton, function () {
        if (userInfo.personal == 1) {
            window.open('/phpPages/paymentPersonalAccount.php', '_blank');
        } else {
            window.open('/phpPages/paymentSchoolAccount.php', '_blank');
        }
    });
    pleaseSubscribeButton.addEventListener("mousewheel", mouseWheelHandler, false);

    var homeImage = new Image;
    homeImage.onload = function () {
        pleaseSubscribeButton.ctx.drawImage(homeImage, 0, 0, 60, 60);
        var image = pleaseSubscribeButton.ctx.getImageData(0, 0, 60, 60);
        var imageData = image.data,
        length = imageData.length;
        for (var i = 0; i < length; i += 4) {
            if (imageData[i] >= 245 && imageData[i + 1] >= 245 && imageData[i + 2] >= 245) {
                imageData[i + 2] = 204;
            }
        }
        image.data = imageData;
        pleaseSubscribeButton.ctx.clearRect(0, 0, 60, 60);
        pleaseSubscribeButton.ctx.putImageData(image, 438, 320);

        pleaseSubscribeButton.ctx.drawImage(homeImage, 0, 0, 34, 34);
        var image = pleaseSubscribeButton.ctx.getImageData(0, 0, 34, 34);
        var imageData = image.data,
        length = imageData.length;
        for (var i = 0; i < length; i += 4) {
            if (imageData[i] >= 245 && imageData[i + 1] >= 245 && imageData[i + 2] >= 245) {
                imageData[i + 2] = 204;
            }
        }
        image.data = imageData;
        pleaseSubscribeButton.ctx.clearRect(0, 0, 50, 50);
        pleaseSubscribeTrayButton.ctx.putImageData(image, 6, 3);
    }
    homeImage.src = "/Images/logoSmall.PNG";
}
function loginFromPage() {
    var d = Date.parse(new Date());
    if (!un(window.lastLoginAttemptTime) && d - window.lastLoginAttemptTime < 5000) {
        //console.log('too soon');
        return;
    }
    window.lastLoginAttemptTime = d;

    var inputUsername = document.getElementById('input-username').value;
    var inputPassword = document.getElementById('input-password').value;
    var params = 'auserName=' + inputUsername + '&apassword=' + inputPassword + '&reload=false';

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "/sessionVariables/sessionLogin.php", true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            //console.log(this.responseText);
            userInfo = JSON.parse(this.responseText);
            //console.log(userInfo);
            if (userInfo.info == 'invalid') {
                Notifier.notify('Sorry! We did not recognise that username and password combination.', '', '/Images/logoSmall.PNG');
            }
            if (userInfo.verified == 0 || userInfo.user == 'super') {
                if (userInfo.user === 'pupil' && file.free != true && userInfo.schemesAccess == 0 && userInfo.allPupilsFullAccess !== 1 && file._pupilAccess !== true) {
                    window.location.replace("https://www.mathspad.co.uk/onlyTeachers.php");
                }
                getBrowserInfo();
                if (!un(browserinfo) && browserinfo.browser === 'Microsoft Edge') { // Fixes Edge UTF-8 charset issue
                    location.reload();
                    return;
                }
                hidePage();
                hideObj(loginTrayButton);
                if (draw.task.isFileATask() === true) {
                    if (userInfo.user === 'pupil') {
                        location.reload();
                        return;
                    }
                    draw.task.initialise();
                    for (var r = 0; r < file.resources.length; r++) {
                        var res = file.resources[r];
                        if (file.resources[r].pages instanceof Array) {
                            for (var p = 0; p < file.resources[r].pages.length; p++) {
                                var page = file.resources[r].pages[p];
                                delete page.pageVis;
                            }
                        }
                    }
                } else {
                    for (var r = 0; r < file.resources.length; r++) {
                        var res = file.resources[r];
                        if (file.resources[r].pages instanceof Array) {
                            for (var p = 0; p < file.resources[r].pages.length; p++) {
                                if (!un(queryObject.starter) && queryObject.starter !== "") {
                                    delete file.resources[r].pages[p].pageVis;
                                } else {
                                    if (boolean(file.resources[r].pages[p].pageVis, true) == false) {
                                        file.resources[r].pages[p] = [];
                                    }
                                }
                            }
                        }
                    }
                }
                if (jsonTeachFileExists === true) {
					loadTeachJSONFile(currFilename);
				} else {
					showPage();
                }
                Notifier.notify("Welcome " + userInfo.name + ", you have logged in to MathsPad.", '', '/Images/logoSmall.PNG');
                disableVisibilityChangeLoginMonitor();
                if (userInfo.user == 'super') {
                    var url = userInfo.teurl;
                    if (url.indexOf('/i2/') === 0)
                        url = '/i2/teach' + teachVersion + '/' + (url.slice(4));
                    loadScript(url);
                }

            } else if (userInfo.user == 'teacher' || userInfo.user == 'pupil') {
                Notifier.notify("Welcome " + userInfo.name + ", please subscribe to activate your account.", '', '/Images/logoSmall.PNG');
                hideObj(loginTrayButton);
                showObj(pleaseSubscribeTrayButton);
                enableVisibilityChangeLoginMonitor();
                hidePage();
                showPage();
            }
        }
    }
    xmlHttp.send(params);
};
function enableVisibilityChangeLoginMonitor() {
    // Set the name of the hidden property and the change event for visibility
    hidden,
    visibilityChange;
    lastLoginCheckTime = Date.parse(new Date());
    loginCheckCount = 0;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    if (typeof document.addEventListener === "undefined" || hidden === undefined) {}
    else {
        document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
}
function disableVisibilityChangeLoginMonitor() {
    document.removeEventListener(visibilityChange, handleVisibilityChange, false);
}
function handleVisibilityChange() {
    if (document[hidden])
        return;
    var d = Date.parse(new Date());
    if (file.resources[resourceIndex].pages[pIndex].pageVis == false && (loginCheckCount == 0 || d - lastLoginCheckTime >= 6000)) {
        lastLoginCheckTime = d;
        loginCheckCount++;

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("post", "/sessionVariables/sessionLoginInfo.php", true);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlHttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                //console.log(this.responseText);
                userInfo = JSON.parse(this.responseText);
                if (userInfo.verified == 0 || userInfo.user == 'super') {
                    getBrowserInfo();
                    if (!un(browserinfo) && browserinfo.browser === 'Microsoft Edge') { // Fixes Edge UTF-8 charset issue
                        location.reload();
                        return;
                    }
                    hidePage();
                    hideObj(loginTrayButton);
                    if (draw.task.isFileATask() === true) {
                        draw.task.initialise();
                        for (var r = 0; r < file.resources.length; r++) {
                            var res = file.resources[r];
                            if (file.resources[r].pages instanceof Array) {
                                for (var p = 0; p < file.resources[r].pages.length; p++) {
                                    var page = file.resources[r].pages[p];
                                    delete page.pageVis;
                                }
                            }
                        }
                    } else {
                        for (var r = 0; r < file.resources.length; r++) {
                            var res = file.resources[r];
                            if (file.resources[r].pages instanceof Array) {
                                for (var p = 0; p < file.resources[r].pages.length; p++) {
                                    if (boolean(file.resources[r].pages[p].pageVis, true) == false) {
                                        file.resources[r].pages[p] = [];
                                    }
                                }
                            }
                        }
                    }
                    if (jsonTeachFileExists === true) {
						loadTeachJSONFile(currFilename);
					} else {
						showPage();
					}
                    Notifier.notify("Welcome " + userInfo.name + ", you have logged in to MathsPad.", '', '/Images/logoSmall.PNG');
                    disableVisibilityChangeLoginMonitor();
                    if (userInfo.user == 'super')
                        loadScript(userInfo.teurl);
                } else if (userInfo.user == 'teacher' || userInfo.user == 'pupil') {
                    Notifier.notify("Welcome " + userInfo.name + ", please subscribe to activate your account.", '', '/Images/logoSmall.PNG');
                    hideObj(loginTrayButton);
                    showObj(pleaseSubscribeTrayButton);
                    enableVisibilityChangeLoginMonitor();
                    hidePage();
                    showPage();
                }
            }
        }
        xmlHttp.send();
    }
}

function logFileUse() {
    var filename = currFilename;
    if (currFolder !== 'teachFiles')
        filename = currFolder.slice(5) + '-' + currFilename;
    var teacherID = !un(userInfo.tID) ? userInfo.tID : -1;
    var pupilID = !un(userInfo.pID) ? userInfo.pID : -1;
    var verified = !un(userInfo.verified) ? userInfo.verified : -1;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("post", "teach_logFileUse.php", true);
    xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.onreadystatechange = function () {
        console.log(this.responseText);
    }
    console.log('filename=' + filename + '&teacherID=' + teacherID + '&pupilID=' + pupilID + '&verified=' + verified);
    xmlHttp.send('filename=' + filename + '&teacherID=' + teacherID + '&pupilID=' + pupilID + '&verified=' + verified);
}

var pass3box = function () {
    var obj = {};
    obj.loaded = false;
    obj.value = '';
    obj.load = function () {
        this.loaded = true;
        function style(element, styles) {
            for (var key in styles)
                element.style[key] = styles[key];
        }
        this.canvas = document.createElement('canvas');
        style(this.canvas, {
            zIndex: '10000000000',
            position: 'absolute',
            backgroundColor: '#CCF',
            border: '2px solid rgb(0, 0, 0)',
            borderRadius: '15px'
        });
        this.canvas.width = 400;
        this.canvas.height = 300;
        this.canvas.data = [400, 200, 400, 300];
        for (var i = 0; i < 4; i++)
            this.canvas.data[100 + i] = this.canvas.data[i];
        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, 400, 300);
        text({
            ctx: ctx,
            text: ['<<font:Hobo>><<fontSize:32>>This resource is protected,' + br + 'please enter 3rd level password to access.'],
            rect: [25, 25, 350, 50],
            align: [0, -1]
        });

        this.input = document.createElement('canvas');
        this.input.width = 300;
        this.input.height = 50;
        style(this.input, {
            zIndex: '10000000001',
            position: 'absolute',
            backgroundColor: '#FFC',
            border: '1px solid rgb(0, 0, 0)',
        });
        this.input.data = [450, 400, 300, 50];
        for (var i = 0; i < 4; i++)
            this.input.data[100 + i] = this.input.data[i];
        var ctx = this.input.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

    }
    obj.show = function () {
        if (this.loaded === false)
            this.load();
        showObj(this.canvas);
        showObj(this.input);
        resizeCanvas(this.canvas);
        resizeCanvas(this.input);
        this.blink = true;
        this.update();
        this.blinkOn();
        window.addEventListener('keydown', this.onkey, true);
    }
    obj.hide = function () {
        hideObj(this.canvas);
        hideObj(this.input);
        this.blinkOff();
        window.removeEventListener('keydown', this.onkey, true);
    }
    obj.blink = true;
    obj.blinkOn = function () {
        clearInterval(this.blinkInterval);
        this.blink = true;
        this.update();
        this.blinkInterval = setInterval(function () {
            pass3box.blink = !pass3box.blink;
            pass3box.update();
        }, 600);
    }
    obj.blinkOff = function () {
        this.blink = false;
        this.update();
        clearInterval(this.blinkInterval);
    }
    obj.update = function () {
        var ctx = this.input.getContext('2d');
        ctx.clearRect(0, 0, 300, 50);
        var txt = '';
        for (var i = 0; i < obj.value.length; i++)
            txt += '*';
        var measure = text({
            ctx: ctx,
            text: ['<<font:Hobo>><<fontSize:32>>' + txt],
            rect: [5, 5, 290, 50],
            align: [-1, 0]
        });
        if (this.blink === true) {
            var x = measure.textLoc[0].last().left;
            ctx.beginPath();
            ctx.moveTo(x, 10);
            ctx.lineTo(x, 40);
            ctx.stroke();
        }
    }
    obj.onkey = function (e) {
        var key = e.key.toLowerCase();
        if (key === 'backspace') {
            if (pass3box.value.length > 0) {
                pass3box.value = pass3box.value.slice(0, -1);
                obj.blinkOn();
            }
        } else if (key === 'enter') {
            loadTeachFile(pass3box.filename, pIndex);
        } else if ('abcdefghijklmnopqrstuvwxyz0123456789'.indexOf(key) > -1) {
            pass3box.value += key;
            obj.blinkOn();
        }
    }
    return obj;
}
();

var previews;

/****************************/
/*		DRAW TOOLS			*/
/****************************/

addDrawTools({

    text: {
        buttonPos: [1200 - 5 - 4 * 45, -45]
    },
    table: {
        buttonPos: [1200 - 5 - 3 * 45, -45],
        dir: 'below'
    },
    retainCursorCanvas: true,
    drawArea: [0, 0, 1200, 1700],
    defaultMode: 'select',
    flattenMode: true,
    zIndex: 10,
    color: '#00F',
    thickness: 5,
    gridSnapRect: [20, 20, 1200 - 2 * 20, 1700 - 2 * 20],
    gridMargin: [20, 20, 20, 20], //[l,t,r,b]
    gridVertMargins: [80],
    gridHorizMargins: [1700 - 60],
    //backGrid2: {},
    divMode: divMode
});
draw.groupPenPaths = false;
snapToObj2On = true;
snapToObj2Mode = 'ctrl';
draw.showMargins = false;
draw.triggerEnabled = false;
draw.getSelType = function () {
    var selPaths2 = selPaths();
    var selType = 'none';
    if (selPaths2.length > 1) {
        selType = 'multiple';
    } else if (selPaths2.length == 1 && selPaths2[0].obj.length > 1) {
        selType = 'grouped';
        var penPath = true;
        for (var j = 0; j < selPaths2[0].obj.length; j++) {
            if (selPaths2[0].obj[j].type !== 'pen')
                penPath = false;
        }
        if (penPath == true) {
            selType = 'pen';
        }
    } else if (selPaths2.length == 1) {
        var obj = selPaths2[0].obj[0];
        selType = obj.type;
        if (obj.type == 'polygon') {
            if (obj.closed == false) {
                selType = 'openPolygon';
            }
        }
        if (obj.type == 'angle') {
            if (obj.isSector == true) {
                selType = 'sector';
            } else if (obj.isArc == true) {
                selType = 'arc';
            }
        }
        if (obj.type == 'table2') {
            cellSelCount = 0;
            for (var r = 0; r < obj.cells.length; r++) {
                for (var c = 0; c < obj.cells[r].length; c++) {
                    if (obj.cells[r][c].selected == true)
                        cellSelCount++;
                }
            }
            if (cellSelCount == 1) {
                selType = 'table2-cell';
            } else if (cellSelCount > 1) {
                selType = 'table2-cells'
            }
        }
    }
    return selType;
}

/****************************/
/*			NAV				*/
/****************************/

function prev() {
    if (pIndex == 0)
        return;
    if (draw.multiPage.isOn === true) {
        draw.multiPage.changePage(pIndex - 1);
        draw.multiPage.scrollToPage(pIndex);
    } else {
        hidePage();
        pIndex--;
        showPage();
    }
}
function next() {
    if (pIndex >= pages.length - 1)
        return;
    if (draw.multiPage.isOn === true) {
        draw.multiPage.changePage(pIndex + 1);
        draw.multiPage.scrollToPage(pIndex);
    } else {
        hidePage();
        pIndex++;
        showPage();
    }
}
function hidePage(clearPaths) {
    deselectAllPaths(false);
    if (un(pages[pIndex]))
        return;
    var page = pages[pIndex];

    if (un(page._nodes))
        page._nodes = [];
    for (var n = 0; n < page._nodes.length; n++)
        page._nodes[n]._visible = false;
    var pageDiv = draw.div.pageDiv;
    for (var n = 0; n < pageDiv.childNodes.length; n++) {
        var node = pageDiv.childNodes[n];
        if (node._pageNode === true) {
            node._visible = true;
            if (page._nodes.indexOf(node) === -1)
                page._nodes.push(node);
            pageDiv.removeChild(node);
            n--;
        }
    }

    if (boolean(page.pageVis, true) == false) {
        hideObj(page.canvas);
        return;
    }

    if (mode == 'edit') {
        page.paths = draw.path;
    } else if (mode == 'present') {

        page.pen = [];
        if (un(page._snip))
            page.paths = draw.path;
        delete page._snip;

        draw.path = [];
    }

    calcCursorPositions();
    draw.undo.reset();
    draw.interact.stopAnimation();
    draw.slider.stopAllAnimations();
    //delete draw.dash;
    if (!un(draw.compass))
        page._compass = draw.compass;
    if (!un(draw.protractor))
        page._protractor = draw.protractor;
    if (!un(draw.ruler))
        page._ruler = draw.ruler;
    delete draw.compass;
    delete draw.protractor;
    delete draw.ruler;
    draw.compassVisible = false;
    draw.protractorVisible = false;
    draw.rulerVisible = false;
    drawToolsCanvas();
    if (boolean(clearPaths, false) == true) {
        resetDrawTools(false);

    }
}
function showPage() {

    var page = pages[pIndex] || {};
    if (un(page._loaded)) {
        loadPage(resourceIndex, pIndex);
        return;
    }

    var pageDiv = draw.div.pageDiv;
    if (un(page._nodes))
        page._nodes = [];
    for (var n = 0; n < page._nodes.length; n++) {
        if (page._nodes[n]._visible === true) {
            pageDiv.appendChild(page._nodes[n]);
        }
    }

    var resource = file.resources[resourceIndex];
    if (page._loaded == 0 && typeof page.load == 'function')
        page.load();
    page._loaded = 1;
    if (mode == 'edit') {
        draw.drawMode = 'select';

    }

    if (boolean(page.pageVis, true) === false) {
        if (userInfo.user == 'none') {
            showObj(loginBox);
            hideObj(pleaseSubscribeButton);
        } else if (userInfo.verified == 1) {
            showObj(pleaseSubscribeButton);
            hideObj(loginBox);
        }
        if (divMode == false)
            setScrollerValue(scroller, def([page._scrollValue, 0]));
        answersButton.style.opacity = 0.5;
        answersButton.style.pointerEvents = 'none';
        printButton.style.opacity = 0.5;
        printButton.style.pointerEvents = 'none';
        resize();
        arrangeScreen();
        if (!un(page.canvas)) {
            hideObj(draw.drawCanvas);
            showObj(page.canvas);
            updateURL();
			teach.drawButtons.update();
            return;
        } else {
            showObj(draw.drawCanvas);
            showObj(loginMask);
        }
    } else {
        if (un(draw.multiPage) || draw.multiPage.isOn !== true)
            showObj(draw.drawCanvas);
        hideObj(pleaseSubscribeButton);
        hideObj(loginBox);
        hideObj(page.canvas);
        hideObj(loginMask);
        if (divMode == false)
            setScrollerValue(scroller, def([page._scrollValue, 0]));
        answersButton.style.opacity = 1;
        answersButton.style.pointerEvents = 'auto';
        printButton.style.opacity = 1;
        printButton.style.pointerEvents = 'auto';
    }
    if (mode == 'edit') {
        delete page._initialised;
        for (var p = 0; p < pages[pIndex].paths.length; p++)
            delete pages[pIndex].paths[p]._visible;
        draw.path = page.paths;
        draw.ids.update();

        snapToObj2Mode = 'ctrl';
        snapToObj2On = true;

        if (!un(previews)) {
            previews.update();
        }
        if (pages[pIndex].type == 'taskPage') {
            window.taskPageTools.show();
            window.taskPageTools.draw();
            draw.gridMargin = [];
            //draw.backGrid.drawBackGrid();
        } else {
            window.taskPageTools.hide();
        }

        presentButtons.update();
        teach.drawButtons.update();
        page._viewed = false;
    } else if (mode == 'present') {
        if (page._initialised !== true)
            initialisePage(page);
        for (var p = 0; p < page.paths.length; p++)
            page.paths[p]._deletable = false;
        draw.path = page.paths;
        draw.ids.update();

        for (var p = 0; p < page.paths.length; p++) {
            var path = page.paths[p];
            path.selected = false;
            updateBorder(path);
            if (page._viewed === false) {

                if (typeof path.onload === 'function') {
                    path.onload();
                }
                if (!un(path.interact) && typeof path.interact.onload === 'function') {
                    path.interact.onload();
                }
                for (var o2 = 0; o2 < path.obj.length; o2++) {
                    var obj = path.obj[o2];
                    if (typeof obj.onload === 'function') {
                        obj.onload();
                    }
                    if (!un(obj.interact) && !un(obj.interact.onload)) {
                        obj.interact.onload();
                    }
                }
            }
        }
        calcCursorPositions();
        drawCanvasPaths();
        draw.retainCursorCanvas = true;
        if (un(draw.multiPage) || draw.multiPage.isOn !== true) {
            draw.color = page.color || '#00C';
            draw.thickness = page.thickness || 5;
        }
        if (!un(page._compass))
            draw.compass = page._compass;
        if (!un(page._protractor))
            draw.protractor = page._protractor;
        if (!un(page._ruler))
            draw.ruler = page._ruler;
        snapToObj2Mode = 'all';
        snapToObj2On = true;
        presentButtons.update();
        teach.drawButtons.update();
        page._viewed = true;

        draw.retainCursorCanvas = true;
    }
    teach.drawButtons.visible = page.showTrayDrawButtons === false || getResourceType() === 'task' ? false : true;
    arrangeScreen();
    draw.interact.update();

    draw.undo.reset();
    if (un(draw.multiPage) || draw.multiPage.isOn !== true) {
        drawCanvasPaths();
    }
    draw.div.zoomReset();

    draw.cursorCanvas.ctx.clear();
    updateURL();
    togglePageAppearButtonsButton.draw();
}
function initialisePage(page) {
    for (var p = 0; p < page.paths.length; p++) {
        var path = page.paths[p];
        if (!un(path.appear)) {
            if (path.appear.retainVisibility === true && !un(path._visible)) {}
            else if (path.appear.startVisible === true) {
                path._visible = true;
            } else {
                path._visible = false;
            }
        }
    }
    page._initialised = true;
}

draw.snip = {
    showSnip: function (snip) {
        var page = pages[pIndex];
        hidePage();
        page._snip = snip;
        draw.path = snip.snipPaths;
        toolbar.draw();
        draw.snip.showCloseButton();
        arrangeScreen();
        draw.interact.update();
        draw.undo.reset();
        drawCanvasPaths();
        draw.div.zoomReset();
        draw.cursorCanvas.ctx.clear();
    },
    hideSnip: function () {
        var page = pages[pIndex];
        delete page._snip;
        draw.snip.hideCloseButton();
        showPage();
        toolbar.draw();
    },
    createCloseButton: function () {
        this.canvas = newctx({
            rect: [1200 - 10 - 40, 10, 40, 40],
            vis: true,
            pe: true,
            z: 1000
        }).canvas;
        addListener(this.canvas, this.hideSnip);
        var ctx = this.canvas.ctx;
        text({
            ctx: ctx,
            rect: [1, 1, 38, 38],
            text: [times],
            fontSize: 36,
            bold: true,
            align: [0, 0],
            color: '#F00',
            box: {
                type: 'loose',
                borderColor: '#000',
                borderWidth: 2,
                color: '#FFF'
            }
        });
    },
    showCloseButton: function () {
        if (un(this.canvas))
            this.createCloseButton();
        showObj(this.canvas);
    },
    hideCloseButton: function () {
        if (un(this.canvas))
            return;
        hideObj(this.canvas);
    },
    drawClickStartRect: function () {
        changeDrawMode('snipRect');
        draw.snipRect = [draw.mouse[0], draw.mouse[1], 0, 0];
        draw.animate(draw.snip.rectMove, draw.snip.rectStop, drawSelectCanvas2);
    },
    rectMove: function (e) {
        updateMouse(e);
        draw.snipRect[2] = draw.mouse[0] - draw.snipRect[0];
        draw.snipRect[3] = draw.mouse[1] - draw.snipRect[1];
    },
    rectStop: function (e) {
        if (draw.snipRect[2] < 0) {
            draw.snipRect[0] += draw.snipRect[2];
            draw.snipRect[2] *= -1;
        }
        if (draw.snipRect[3] < 0) {
            draw.snipRect[1] += draw.snipRect[3];
            draw.snipRect[3] *= -1;
        }
        if (draw.snipRect[2] < 50 && draw.snipRect[3] < 50)
            return;
        changeDrawMode();
        var page = pages[pIndex];
        if (un(page._snips))
            page._snips = [];
        var snipRect = clone(draw.snipRect);
        var canvas = newctx({
            rect: [0, 0, 1200, 1700],
            vis: false
        }).canvas;
        for (var i = 0; i < 3; i++)
            canvas.ctx.drawImage(draw.drawCanvas[i], 0, 0);
        var snip = {
            type: 'snip',
            snipRect: snipRect,
            snipPaths: [{
                    obj: [{
                            type: 'image',
                            rect: [20, 20, snipRect[2], snipRect[3]],
                            crop: snipRect,
                            canvas: canvas
                        }
                    ],
                    _deletable: false
                }
            ],
            _page: page
        };
        page._snips.push(snip);
        draw.snip.showSnip(snip);
        drawSelectCanvas2();
    },
    reopenSnip: function () {
        var page = pages[pIndex];
        var snip = draw.currCursor.snip;
        draw.snip.showSnip(snip);
        drawSelectCanvas2();
    },
    deleteSnip: function () {
        var page = pages[pIndex];
        var snip = draw.currCursor.snip;
        var index = page._snips.indexOf(snip)
            if (index > -1)
                page._snips.splice(index, 1);
            drawSelectCanvas2();
    }
}

function presentMode(override, callShowPage) {
    if (mode == 'present' && boolean(override, false) == false)
        return;
    //console.log('presentMode', override, arguments.callee.caller);
    if (mode == 'edit') {
        pages[pIndex].paths = draw.path;
    }
    mode = 'present';
    draw.mode = 'interact';
    draw.drawMode = 'none';
    draw.defaultMode = 'none';
    for (var p = 0; p < draw.path.length; p++) {
        var path = draw.path[p];
        for (var o2 = 0; o2 < path.obj.length; o2++) {
            var obj = path.obj[o2];
            if (obj.type == 'taskQuestion') {
                if (!un(draw.taskQuestion))
                    draw.taskQuestion.reset(obj);
            }
        }
    }
    for (var pa = 0; pa < pages.length; pa++) {
        var page1 = pages[pa];
        if (un(page1.path))
            continue;
        for (var p = 0; p < page1.path.length; p++) {
            var path = page1.paths[p];
            for (var o2 = 0; o2 < path.obj.length; o2++) {
                var obj = path.obj[o2];
                if (obj.type == 'taskQuestion') {
                    if (!un(draw.taskQuestion))
                        draw.taskQuestion.reset(obj);
                }
            }
        }
    }

    arrangeScreen();

    if (callShowPage !== false)
        showPage();

    if (typeof scroller !== 'undefined')
        setScrollerValue(scroller, scroller.value, true);
    removeKeyboardShortcuts();
    resourceButtons.arrange();

    if (!un(window.taskPageTools))
        window.taskPageTools.hide();
    if (!un(previews) && previews.div.parentNode == container)
        container.removeChild(previews.div);
    if (!un(window.modeButton))
        modeButton.draw();
    if (!un(window.feedbackButton))
        hideObj(feedbackButton);
    if (!un(window.pathList))
        pathList.hide();
    if (!un(draw.contextMenu) && !un(draw.contextMenu.div))
        hideObj(draw.contextMenu.div);
    if (!un(window.resourceTabsRightClickMenu))
        window.resourceTabsRightClickMenu.hide();
    if (!un(window.slidePreviewsRightClickMenu))
        window.slidePreviewsRightClickMenu.hide();
}
function arrangeScreen() {
    var resource = file.resources[resourceIndex];
    var viewArea = [1200, 700];
    var drawArea = [1225, 1700];

    mainCanvasWidth = drawArea[0];
    mainCanvasHeight = mode == 'edit' ? 700 : 750;
    mainCanvasMargins = mode == 'edit' ? [0, 50, 0, 50] : [0, 0, 0, 0];
    if (mode === 'edit') {
        var marginWidth = draw.marginWidth || 300;
        if (previewSlidesHidden === false)
            mainCanvasMargins[0] = marginWidth;
        if (contextMenu.hidden === false)
            mainCanvasMargins[2] = marginWidth;
    }
    var page = !un(resource) && !un(resource.pages[pIndex]) ? resource.pages[pIndex] : {};
    if (mode === 'present' && teach.drawButtons.visible === true && page.showTrayDrawButtons !== false && (un(queryObject.task) || queryObject.task === "")) {
        if (teach.drawButtons.side === 'left') {
            mainCanvasMargins[0] = teach.drawButtons.width;
        } else {
            mainCanvasMargins[2] = teach.drawButtons.width;
        }
        teach.drawButtons.show();
    } else {
        teach.drawButtons.hide();
    }

    resize();
    clearCanvas();

    if (divMode == false) {
        var value = scroller.value;
        scroller.reposition(scroller.max, [viewArea[0], 0, 25, viewArea[1]], (viewArea[1] - 2 * 25) * (viewArea[1] / drawArea[1]));
        showScroller(scroller);
        setScrollerValue(scroller, value, true);
        draw.cursorCanvas.addEventListener("mousewheel", mouseWheelHandler, false);
    }

    addBlankSlideButton.style.opacity = '1';
    addBlankSlideButton.style.pointerEvents = 'auto';

    if (mode == 'edit') {
        if (un(resource) || getResourceType(resource) !== 'worksheet') {
            hideObj(answersButton);
            draw.appearMode = true;
        } else {
            showObj(answersButton);
            draw.appearMode = false;
        }
        contextMenu.canvas.data[102] = marginWidth;
        contextMenu.canvas.width = marginWidth;
        resizeCanvas3(contextMenu.canvas, 380);

        presentButtons.show();
        if (typeof maskCanvas !== 'undefined')
            showObj(maskCanvas.canvas);
        if (typeof topPanelCanvas !== 'undefined')
            showObj(topPanelCanvas);
        if (typeof bottomPanelCanvas !== 'undefined')
            showObj(bottomPanelCanvas);
        if (typeof draw.contextMenu !== 'undefined' && contextMenu.hidden === false) {
            var l = viewArea[0] + 25;
            resizeCanvas3(draw.contextMenu.canvas, l);
            showObj(draw.contextMenu.canvas);
        }
        maskCanvas.clear();
        maskCanvas.fillStyle = '#9C9AFF';
        maskCanvas.fillRect(0, 0, 3000, 3000);
        maskCanvas.clearRect(1000, 1000, drawArea[0], 700);
        maskCanvas.canvas.style.zIndex = 998;
        for (var b = 0; b < draw.buttons.length; b++)
            showObj(draw.buttons[b]);
        for (var i = 0; i < draw.menu.menu.length; i++)
            showObj(draw.menu.menu[i].button);

        if (typeof appMenu !== 'undefined')
            appMenu.show();

        snapBordersOn = true;

        addBlankSlideButton.style.opacity = '0.5';
        addBlankSlideButton.style.pointerEvents = 'none';

    } else {
        if (!un(draw.notesOverlayButton))
            hideObj(draw.notesOverlayButton);

        if (un(resource) || getResourceType(resource) === 'task') {
            hideObj(printButton);
            hideObj(answersButton);
            presentButtons.hide();
        } else if (un(resource) || getResourceType(resource) === 'slides') {
            hideObj(printButton);
            hideObj(answersButton);

            draw.appearMode = true;
            presentButtons.show();
        } else {
            var showPDFButton = false;
            if (resource.hasPDF == true || typeof resource.pdf == 'string' || resource.allowCreatePDF == true)
                showPDFButton = true;
            if (userInfo.verified === 1 && file.free !== true && resource.free !== true)
                showPDFButton = false;

            if (showPDFButton === true) {
                showObj(printButton);
            } else {
                hideObj(printButton);
            }
            showObj(answersButton);
            draw.appearMode = false;
            presentButtons.show();
        }

        var l2 = 612.5 - 185 / 2;
        resizeCanvas3(answersButton, l2, 705);
        resizeCanvas3(printButton, l2 + 145, 705);
        resourceButtons.maxWidth = l2 - 20;

        showObj(presentMaskTop);
        showObj(presentMaskBottom);

        if (typeof maskCanvas !== 'undefined')
            hideObj(maskCanvas.canvas);
        if (typeof topPanelCanvas !== 'undefined')
            hideObj(topPanelCanvas);
        if (typeof bottomPanelCanvas !== 'undefined')
            hideObj(bottomPanelCanvas);
        if (typeof draw.contextMenu !== 'undefined')
            hideObj(draw.contextMenu.canvas);
        for (var b = 0; b < draw.buttons.length; b++)
            hideObj(draw.buttons[b]);
        if (!un(draw.contextMenu))
            hideObj(draw.contextMenu.canvas);
        if (!un(draw.contextMenu) && !un(draw.contextMenu.div))
            hideObj(draw.contextMenu.div);
        if (!un(draw.menu)) {
            for (var i = 0; i < draw.menu.menu.length; i++) {
                hideObj(draw.menu.menu[i].button);
                hideObj(draw.menu.menu[i].canvas1);
                hideObj(draw.menu.menu[i].canvas2);
            }
        }

        if (typeof appMenu !== 'undefined')
            appMenu.hide();
        if (typeof textMenu !== 'undefined')
            textMenu.hide();

    }

    presentButtons.arrange();

}

window.keynav = function (e) {
    if (typeof e.key !== 'string')
        return;
    var key = e.key.toLowerCase();
    if (e.getModifierState('Control') && key === 'w') {
        console.log('ctrl-w');
        e.preventDefault();
        return false;
    }
    if (e.target.nodeName == 'TEXTAREA' || e.target.nodeName == 'INPUT' || e.target.nodeName == 'TD')
        return;
    if (e.keyCode == 122 || e.keyCode == 27) { // F11 or ESC
        return;
    }
    if (e.getModifierState('Control') && key === 'v') {
        return;
    } else if (e.getModifierState('Control') && key === 'm') {
        if (!un(timer) && typeof timer.toggle === 'function') {
            e.preventDefault();
            timer.toggle();
            return;
        }
    }
    e.preventDefault();
    if (key === 'f1' || (e.getModifierState('Control') && key === 'e')) { // F1 or Ctrl-e
        if (typeof toggleMode !== 'undefined') {
            toggleMode();
        } else if (typeof window.editMode !== 'undefined') {
            window.editMode.load();
            toggleMode();
        }
    }
    if (mode == 'present') {
        if (e.keyCode == 37 || key === 'pageup') {
            if (textEdit.obj == null)
                prev();
        } else if (e.keyCode == 39 || key === 'pagedown') {
            if (textEdit.obj == null)
                next();
        }
        if (key === 'f7') {
            if (typeof screenShade !== 'undefined')
                screenShade.toggle();
        }
        if (e.getModifierState('Control') && e.getModifierState('Shift') && key === 'p' && getResourceType(file.resources[resourceIndex]) === 'slides') {
            Notifier.info('Loading PDF slides handout...');
            canvasPdf.getResourcePDF(file.resources[resourceIndex], 'slides');
        }
    } else if (mode == 'edit') {
        if (key === 'f3') {
            draw.codeEditor.openPrevious();
            return;
        }
        if (key === 'f7') {
            if (typeof screenShade !== 'undefined')
                screenShade.toggle();
        }
        if (selPaths().length > 0)
            return;
        if (e.keyCode == 37) {
            prev();
        } else if (e.keyCode == 39) {
            next();
        } else if (e.keyCode == 38) {
            prev();
        } else if (e.keyCode == 40) {
            next();
        }
    }
}

/****************************/
/*		PRESENT TOOLS		*/
/****************************/

teach.buttons = {
    timer: {
        draw: function (ctx, left, top, size) {
            var color = (un(timer.canvas) || un(timer.canvas.parentNode)) ? '#C9F' : '#FFC';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.arc(0.5 * size, 0.5 * size, 0.32 * size, 0, 2 * Math.PI);
            ctx.moveTo(0.5 * size, 0.24 * size);
            ctx.lineTo(0.5 * size, 0.5 * size);
            ctx.lineTo(0.66 * size, 0.5 * size);
            ctx.stroke();
            ctx.translate(-left, -top);
        },
        click: function () {
            timer.toggle();
        }
    },
    screenShade: {
        draw: function (ctx, left, top, size) {
            var color = (draw.screenShade2.checkIfPresent() === false) ? '#C9F' : '#FFC';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(0.2 * size, 0.25 * size, 0.6 * size, 0.5 * size);
            ctx.fillStyle = '#BBB';
            ctx.fillRect(0.5 * size, 0.25 * size, 0.3 * size, 0.5 * size);

            ctx.strokeStyle = '#999';
            ctx.lineWidth = 0.04 * size;
            ctx.strokeRect(0.5 * size, 0.25 * size, 0.3 * size, 0.5 * size);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(0.2 * size, 0.25 * size, 0.6 * size, 0.5 * size);
            ctx.translate(-left, -top);
        },
        click: function () {
            draw.screenShade2.toggle();
        }
    },
    zoomMinus: {
        draw: function (ctx, left, top, size) {
            var color = '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#FFF';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = size / 6;
            ctx.moveTo(size * 0.4, size * 0.4);
            ctx.lineTo(size * 0.75, size * 0.75);
            ctx.stroke();
            ctx.lineWidth = 0.04 * size;
            ctx.beginPath();
            ctx.arc(0.4 * size, 0.4 * size, size * 0.25, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(size * 0.3, size * 0.4);
            ctx.lineTo(size * 0.5, size * 0.4);
            ctx.stroke();
            ctx.translate(-left, -top);
        },
        click: function () {
            var sf = Math.max(0.41, roundToNearest(draw.div.zoom * 0.8, 0.001));
            draw.div.setZoom(sf);
        }
    },
    zoomPlus: {
        draw: function (ctx, left, top, size) {
            var color = '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#FFF';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = size / 6;
            ctx.moveTo(size * 0.4, size * 0.4);
            ctx.lineTo(size * 0.75, size * 0.75);
            ctx.stroke();
            ctx.lineWidth = 0.04 * size;
            ctx.beginPath();
            ctx.arc(0.4 * size, 0.4 * size, size * 0.25, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(size * 0.3, size * 0.4);
            ctx.lineTo(size * 0.5, size * 0.4);
            ctx.moveTo(size * 0.4, size * 0.3);
            ctx.lineTo(size * 0.4, size * 0.5);
            ctx.stroke();
            ctx.translate(-left, -top);
        },
        click: function () {
            var sf = Math.min(5, roundToNearest(draw.div.zoom * 1.25, 0.001));
            draw.div.setZoom(sf);
        }
    },
    zoomEqual: {
        draw: function (ctx, left, top, size) {
            var color = '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#FFF';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = size / 6;
            ctx.moveTo(size * 0.4, size * 0.4);
            ctx.lineTo(size * 0.75, size * 0.75);
            ctx.stroke();
            ctx.lineWidth = 0.04 * size;
            ctx.beginPath();
            ctx.arc(0.4 * size, 0.4 * size, size * 0.25, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(size * 0.32, size * 0.35);
            ctx.lineTo(size * 0.48, size * 0.35);
            ctx.moveTo(size * 0.32, size * 0.45);
            ctx.lineTo(size * 0.48, size * 0.45);
            ctx.stroke();
            ctx.translate(-left, -top);
        },
        click: function () {
            if (un(draw.div) || draw.div.zoom == 1)
                return;
            draw.div.setZoom(1);
        }
    },
    zoomRect: {
        draw: function (ctx, left, top, size) {
            var color = draw.drawMode === 'zoom' || draw.drawMode === 'zoomRect' ? '#FFC' : '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#FFF';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.setLineDash([5 * 55 / size, 5 * 55 / size]);
            ctx.lineWidth = 2 * 55 / size;
            ctx.strokeRect(8 * 55 / size, 8 * 55 / size, 25 * 55 / size, 25 * (10 / 12) * 55 / size);
            ctx.lineWidth = 6 * 55 / size;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(28 * 55 / size, 28 * 55 / size);
            ctx.lineTo(38 * 55 / size, 38 * 55 / size);
            ctx.stroke();
            ctx.lineWidth = 2 * 55 / size;
            ctx.beginPath();
            ctx.arc(28 * 55 / size, 28 * 55 / size, 8 * 55 / size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.translate(-left, -top);
        },
        click: function () {
            changeDrawMode('zoom');
        }
    },
    snipRect: {
        draw: function (ctx, left, top, size) {
            var color = draw.drawMode === 'snip' || draw.drawMode === 'snipRect' || !un(pages[pIndex]._snip) ? '#FFC' : '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#FFF';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.setLineDash([5 * 55 / size, 5 * 55 / size]);
            ctx.lineWidth = 2 * 55 / size;
            ctx.strokeRect(8 * 55 / size, 8 * 55 / size, 25 * 55 / size, 25 * (10 / 12) * 55 / size);
            ctx.lineWidth = 6 * 55 / size;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(28 * 55 / size, 28 * 55 / size);
            ctx.lineTo(38 * 55 / size, 38 * 55 / size);
            ctx.stroke();
            ctx.lineWidth = 2 * 55 / size;
            ctx.beginPath();
            ctx.arc(28 * 55 / size, 28 * 55 / size, 8 * 55 / size, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.translate(-left, -top);
        },
        click: function () {
            if (!un(pages[pIndex]._snip)) {
                draw.snip.hideSnip();
            } else {
                changeDrawMode('snip');
                drawSelectCanvas2();
            }
        }
    },
    penBlue: {
        draw: function (ctx, left, top, size) {
            var color = (draw.drawMode === 'pen' && draw.color === '#00C') ? '#FFC' : '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.fillStyle = '#00C';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.translate(size / 2, size / 2);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-5 * (size / 55), -11 * (size / 55), 10 * (size / 55), 20 * (size / 55));
            ctx.fillRect(-5 * (size / 55), -18 * (size / 55), 10 * (size / 55), 5 * (size / 55));
            ctx.beginPath();
            ctx.moveTo(-5 * (size / 55), 11 * (size / 55));
            ctx.lineTo(0 * (size / 55), 18 * (size / 55));
            ctx.lineTo(5 * (size / 55), 11 * (size / 55));
            ctx.lineTo(-5 * (size / 55), 11 * (size / 55));
            ctx.fill();
            ctx.rotate(-Math.PI / 4);
            ctx.translate(-size / 2, -size / 2);
            ctx.translate(-left, -top);
        },
        click: function () {
            if (draw.drawMode == 'pen' && draw.color == '#00C') {
                draw.drawMode = 'none';
            } else {
                draw.color = '#00C';
                draw.thickness = 5;
                draw.cursors.update();
                draw.drawMode = 'pen';
            }
            drawCanvasPaths();
            calcCursorPositions();
            if (!un(penButton))
                penButton.draw();
            if (!un(penButton2))
                penButton2.draw();
        }
    },
    penRed: {
        draw: function (ctx, left, top, size) {
            var color = (draw.drawMode === 'pen' && draw.color === '#C00') ? '#FFC' : '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.fillStyle = '#C00';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.translate(size / 2, size / 2);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-5 * (size / 55), -11 * (size / 55), 10 * (size / 55), 20 * (size / 55));
            ctx.fillRect(-5 * (size / 55), -18 * (size / 55), 10 * (size / 55), 5 * (size / 55));
            ctx.beginPath();
            ctx.moveTo(-5 * (size / 55), 11 * (size / 55));
            ctx.lineTo(0 * (size / 55), 18 * (size / 55));
            ctx.lineTo(5 * (size / 55), 11 * (size / 55));
            ctx.lineTo(-5 * (size / 55), 11 * (size / 55));
            ctx.fill();
            ctx.rotate(-Math.PI / 4);
            ctx.translate(-size / 2, -size / 2);
            ctx.translate(-left, -top);
        },
        click: function () {
            if (draw.drawMode == 'pen' && draw.color == '#C00') {
                draw.drawMode = 'none';
            } else {
                draw.color = '#C00';
                draw.thickness = 5;
                draw.cursors.update();
                draw.drawMode = 'pen';
            }
            drawCanvasPaths();
            calcCursorPositions();
            if (!un(penButton))
                penButton.draw();
            if (!un(penButton2))
                penButton2.draw();
        }
    },
    undo: {
        draw: function (ctx, left, top, size) {
            var color = '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.strokeStyle = '#000';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 4 * size / 55;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 12 * size / 55, -Math.PI, 0.7 * Math.PI);
            ctx.moveTo(13.5 * size / 55, 27.5 * size / 55);
            ctx.lineTo(13.5 * size / 55 - 10 * size / 55 * Math.sin(1 * Math.PI), 27.5 * size / 55 + 10 * size / 55 * Math.cos(1 * Math.PI));
            ctx.lineTo(13.5 * size / 55 - 10 * size / 55 * Math.cos(0.95 * Math.PI), 27.5 * size / 55 - 10 * size / 55 * Math.sin(0.95 * Math.PI));
            ctx.lineTo(13.5 * size / 55, 27.5 * size / 55);
            ctx.stroke();
            ctx.translate(-left, -top);
        },
        click: function () {
            draw.buttonUndo.click();
            drawCanvasPaths();
            /*for (var i = draw.path.length - 1; i >= 0; i--) {
            if (draw.path[i]._deletable === false) continue;
            if (typeof draw.path[i].obj == 'object') {
            for (var j = draw.path[i].obj.length - 1; j >= 0; j--) {
            if (draw.path[i].obj[j].type = 'pen') {
            draw.path[i].obj.splice(j, 1);
            if (draw.path[i].obj.length == 0) {
            draw.path.splice(i, 1);
            }
            drawCanvasPaths();
            return;
            }
            }
            }
            }*/
        }
    },
    clear: {
        draw: function (ctx, left, top, size) {
            var color = '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            text({
                ctx: ctx,
                rect: [0, 0, size, size],
                align: [0, 0],
                fontSize: 0.36 * size,
                text: ['CLR']
            });
            ctx.translate(-left, -top);
        },
        click: function () {
            draw.buttonClear.click();
            drawCanvasPaths();
            /*for (var i = draw.path.length - 1; i >= 0; i--) {
            if (draw.path[i]._deletable === false) continue;
            if (typeof draw.path[i].obj == 'object') {
            for (var j = draw.path[i].obj.length - 1; j >= 0; j--) {
            if (draw.path[i].obj[j].type = 'pen') {
            draw.path[i].obj.splice(j, 1);
            if (draw.path[i].obj.length == 0) {
            draw.path.splice(i, 1);
            }
            }
            }
            }
            }
            drawCanvasPaths();*/
        }
    },
    fullScreen: {
        draw: function (ctx, left, top, size) {
            var color = '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.lineWidth = 0.04 * size;
            ctx.strokeStyle = '#000';
            ctx.moveTo(0.6 * size, 0.2 * size);
            ctx.lineTo(0.8 * size, 0.2 * size);
            ctx.lineTo(0.8 * size, 0.4 * size);
            ctx.moveTo(0.8 * size, 0.6 * size);
            ctx.lineTo(0.8 * size, 0.8 * size);
            ctx.lineTo(0.6 * size, 0.8 * size);
            ctx.moveTo(0.4 * size, 0.8 * size);
            ctx.lineTo(0.2 * size, 0.8 * size);
            ctx.lineTo(0.2 * size, 0.6 * size);
            ctx.moveTo(0.2 * size, 0.4 * size);
            ctx.lineTo(0.2 * size, 0.2 * size);
            ctx.lineTo(0.4 * size, 0.2 * size);
            ctx.stroke();
            ctx.translate(-left, -top);
        },
        click: function () {
            if ((document.fullScreenElement && document.fullScreenElement !== null) ||
                (!document.mozFullScreen && !document.webkitIsFullScreen)) {
                if (document.documentElement.requestFullScreen) {
                    document.documentElement.requestFullScreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullScreen) {
                    document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                }
            } else {
                if (document.cancelFullScreen) {
                    document.cancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
            }
        }
    },
    addPage: {
        draw: function (ctx, left, top, size) {
            var color = true ? '#C9F' : '#FFC';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.fillStyle = '#FFF';
            ctx.fillRect(0.2 * size, 0.2 * size, 0.6 * size, 0.6 * size);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.04 * size;
            ctx.strokeRect(0.2 * size, 0.2 * size, 0.6 * size, 0.6 * size);
            ctx.beginPath();
            ctx.lineWidth = 0.06 * size;
            ctx.moveTo(0.5 * size, 0.34 * size);
            ctx.lineTo(0.5 * size, 0.64 * size);
            ctx.moveTo(0.34 * size, 0.5 * size);
            ctx.lineTo(0.64 * size, 0.5 * size);
            ctx.stroke();
            ctx.translate(-left, -top);
        },
        click: function () {
            hidePage();
            file.resources[resourceIndex].pages.splice(pIndex + 1, 0, {
                paths: [],
                _loaded: 1
            });
            pIndex++;
            showPage();
            presentButtons.arrange();
            Notifier.info('Blank page added');
            if (mode === 'edit')
                previewSlides(true);
        }
    },
    compass: {
        draw: function (ctx, left, top, size) {
            var compassVisible = draw.objsOfType('compass2').length > 0;
            var color = compassVisible === false ? '#C9F' : '#FFC';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.lineWidth = 0.02 * size;
            ctx.strokeStyle = '#000';

            var center1 = [0.24 * size, 0.82 * size];
            var center2 = [0.47 * size, 0.27 * size];
            var center3 = [0.73 * size, 0.82 * size];
            var armLength = Math.sqrt(Math.pow(0.5 * (center3[0] - center1[0]), 2) + Math.pow(center2[1] - center1[1], 2));

            var angle2 = -0.5 * Math.PI - Math.atan((center2[1] - center1[1]) / (center2[0] - center1[0]));
            var angle3 = 0.5 * Math.PI - Math.atan((center3[1] - center2[1]) / (center3[0] - center2[0]));

            // draw pointy arm
            ctx.translate(center2[0], center2[1]);
            ctx.rotate(-angle2);

            if (draw.compassVisible) {
                roundedRect(ctx, -0.04 * size, 0, 0.08 * size, armLength - 0.1 * size, 0.02 * size, 0.02 * size, '#000');
            } else {
                roundedRect(ctx, -0.04 * size, 0, 0.08 * size, armLength - 0.1 * size, 0.02 * size, 0.02 * size, '#000', '#99F');
            }
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.01 * size;
            ctx.beginPath();
            ctx.moveTo(-0.02 * size, armLength - 0.1 * size);
            ctx.lineTo(0, armLength);
            ctx.lineTo(0.02 * size, armLength - 0.1 * size);
            ctx.lineTo(-0.02 * size, armLength - 0.1 * size);
            ctx.stroke();
            if (draw.compassVisible) {
                ctx.fillStyle = '#333';
                ctx.fill();
            }

            ctx.rotate(angle2);
            ctx.translate(-center2[0], -center2[1]);

            //draw pencil
            ctx.beginPath();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 0.02 * size;
            ctx.moveTo(size * (40 / 55), size * (45 / 55));
            ctx.lineTo(size * (38 / 55), size * (42 / 55));
            ctx.lineTo(size * (38 / 55), size * (25 / 55));
            ctx.lineTo(size * (42 / 55), size * (25 / 55));
            ctx.lineTo(size * (42 / 55), size * (42 / 55));
            ctx.lineTo(size * (40 / 55), size * (45 / 55));
            if (!draw.compassVisible) {
                if (draw.color == '#000') {
                    ctx.fillStyle = '#FC3';
                } else {
                    ctx.fillStyle = draw.color;
                }
                ctx.fill();
            }
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(size * (40 / 55), size * (45 / 55));
            ctx.lineTo(size * (38 / 55), size * (42 / 55));
            ctx.lineTo(size * (42 / 55), size * (42 / 55));
            ctx.lineTo(size * (40 / 55), size * (45 / 55));
            if (!draw.compassVisible) {
                ctx.fillStyle = '#FFC';
                ctx.fill();
            }
            ctx.stroke();
            ctx.beginPath();
            if (draw.color == '#000') {
                ctx.fillStyle = '#FC3';
            } else {
                ctx.fillStyle = draw.color;
            }
            ctx.moveTo(size * (40 / 55), size * (45 / 55));
            ctx.lineTo(size * (39.5 / 55), size * (44.3 / 55));
            ctx.lineTo(size * (40.5 / 55), size * (45.7 / 55));
            ctx.lineTo(size * (40 / 55), size * (45 / 55));
            ctx.fill();
            ctx.stroke();

            ctx.strokeRect(size * (44 / 55), size * (15 / 55) + armLength * 0.5, 0.02 * size, 0.1 * size);

            // draw pencil arm
            ctx.translate(center2[0], center2[1]);
            ctx.rotate(-angle3);

            var pAngle = Math.PI / 14;

            ctx.beginPath();
            ctx.moveTo(-0.04 * size, 0);
            ctx.lineTo(0.04 * size, 0);
            ctx.lineTo(0.04 * size, armLength * 0.7);
            ctx.lineTo(0.12 * size, armLength * 0.7);
            ctx.lineTo(0.12 * size, armLength * 0.7 + 0.08 * size);
            ctx.lineTo(-0.04 * size, armLength * 0.7);
            ctx.lineTo(-0.04 * size, 0);
            ctx.stroke();
            if (!draw.compassVisible) {
                ctx.fillStyle = '#99F';
                ctx.fill();
            }

            if (!draw.compassVisible) {
                ctx.fillRect(size * (6.5 / 55), armLength * 0.5 - size * (0.5 / 55), 0.02 * size, 0.1 * size);
            }

            ctx.rotate(angle3);
            ctx.translate(-center2[0], -center2[1]);

            // draw top of compass
            ctx.translate(center2[0], center2[1]);

            roundedRect(ctx, -0.05 * size, -0.06 * size, 0.1 * size, 0.14 * size, 0.02 * size, 0.02 * size, '#000', '#000');
            roundedRect(ctx, -0.02 * size, -0.12 * size, 0.04 * size, 0.06 * size, 0, 0.02 * size, '#000', '#000');
            ctx.fillStyle = '#CCC';
            ctx.beginPath();
            ctx.arc(0, 0, 0.02 * size, 0, 2 * Math.PI);
            ctx.fill();

            ctx.translate(-center2[0], -center2[1]);
            ctx.translate(-left, -top);
        },
        click: function () {
            var objs = draw.objsOfType('compass2');
            if (objs.length > 0) {
                var pathIndex = draw.path.indexOf(objs[0]._path);
                if (pathIndex === -1)
                    return;
                draw.path.splice(pathIndex, 1);
                drawCanvasPaths();
            } else {
                deselectAllPaths();
                var obj = {
                    type: 'compass2',
                    armLength: 250,
                    radius: 150,
                    angle: 0,
                    center1: [500, 450],
                    radiusLocked: false,
                    compassVisible: true
                };
                draw.path.push({
                    obj: [obj],
                    selected: true
                });
                updateBorder(draw.path.last());
                drawCanvasPaths();
            }
        }
    },
    protractor: {
        draw: function (ctx, left, top, size) {
            var protractorVisible = draw.objsOfType('protractor2').length > 0;
            var color = protractorVisible === false ? '#C9F' : '#FFC';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.beginPath();
            ctx.moveTo(size * (46.5 / 55), size * (35.5 / 55));
            ctx.lineTo(size * (46.5 / 55), size * (37.5 / 55));
            ctx.lineTo(size * (8.5 / 55), size * (37.5 / 55));
            ctx.lineTo(size * (8.5 / 55), size * (34.5 / 55));
            ctx.arc(size * (27.5 / 55), size * (34.5 / 55), size * (19 / 55), Math.PI, 2 * Math.PI);
            ctx.stroke();
            if (protractorVisible == false) {
                ctx.fillStyle = '#CCF';
                ctx.fill();
                for (var i = 0; i < 7; i++) {
                    ctx.moveTo(size * (27.5 / 55) + 0.08 * size * Math.cos((1 + i / 6) * Math.PI), size * (34.5 / 55) + 0.08 * size * Math.sin((1 + i / 6) * Math.PI));
                    ctx.lineTo(size * (27.5 / 55) + 0.32 * size * Math.cos((1 + i / 6) * Math.PI), size * (34.5 / 55) + 0.32 * size * Math.sin((1 + i / 6) * Math.PI))
                }
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(size * (27.5 / 55), size * (34.5 / 55), size * (15 / 55), Math.PI, 2 * Math.PI);
                for (var i = 0; i < 19; i++) {
                    ctx.moveTo(size * (27.5 / 55) + size * (17 / 55) * Math.cos((1 + i / 18) * Math.PI), size * (34.5 / 55) + size * (17 / 55) * Math.sin((1 + i / 18) * Math.PI));
                    ctx.lineTo(size * (27.5 / 55) + size * (19 / 55) * Math.cos((1 + i / 18) * Math.PI), size * (34.5 / 55) + size * (19 / 55) * Math.sin((1 + i / 18) * Math.PI))
                }
                ctx.moveTo(size * (27.5 / 55), size * (34.5 / 55));
                ctx.lineTo(size * (27.5 / 55), size * (30.5 / 55));
                ctx.moveTo(size * (23.5 / 55), size * (34.5 / 55));
                ctx.lineTo(size * (31.5 / 55), size * (34.5 / 55));
                ctx.stroke();
            }
            ctx.translate(-left, -top);
        },
        click: function () {
            var objs = draw.objsOfType('protractor2');
            if (objs.length > 0) {
                var pathIndex = draw.path.indexOf(objs[0]._path);
                if (pathIndex === -1)
                    return;
                draw.path.splice(pathIndex, 1);
                drawCanvasPaths();
            } else {
                deselectAllPaths();
                var obj = {
                    type: 'protractor2',
                    center: [600, 500],
                    radius: 250,
                    angle: 0,
                    color: '#CCF',
                    opacity: 0.25,
                    numbers: true,
                    protractorVisible: true
                };
                draw.path.push({
                    obj: [obj],
                    selected: true
                });
                updateBorder(draw.path.last());
                drawCanvasPaths();
            }
        }
    },
    ruler: {
        draw: function (ctx, left, top, size) {
            var rulerVisible = draw.objsOfType('ruler2').length > 0;
            var color = rulerVisible === false ? '#C9F' : '#FFC';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            if (rulerVisible == true) {
                roundedRect(ctx, size * (7.5 / 55), size * (22.5 / 55), size * (40 / 55), size * (10 / 55), size * (3 / 55), size * (1 / 55), '#000');
            } else {
                roundedRect(ctx, size * (7.5 / 55), size * (22.5 / 55), size * (40 / 55), size * (10 / 55), size * (3 / 55), size * (1 / 55), '#000', '#CCF');
                ctx.lineWidth = 0.02 * size;
                ctx.strokeStyle = '#000';
                ctx.beginPath();
                for (var i = 0; i < 11; i++) {
                    ctx.moveTo(size * (9.5 / 55) + i * (size * (36 / 55) / (size * (10 / 55))), size * (22.5 / 55));
                    ctx.lineTo(size * (9.5 / 55) + i * (size * (36 / 55) / (size * (10 / 55))), size * (26.5 / 55));
                }
                ctx.stroke();
            }
            ctx.translate(-left, -top);
        },
        click: function () {
            var objs = draw.objsOfType('ruler2');

            if (objs.length > 0) {
                var pathIndex = draw.path.indexOf(objs[0]._path);
                if (pathIndex === -1)
                    return;
                draw.path.splice(pathIndex, 1);
                drawCanvasPaths();
            } else {
                deselectAllPaths();
                var obj = {
                    type: 'ruler2',
                    rect: [200, 300, 800, 100],
                    angle: 0,
                    color: '#CCF',
                    opacity: 0.25,
                    markings: true,
                    rulerVisible: true
                };
                draw.path.push({
                    obj: [obj],
                    selected: true
                });
                updateBorder(draw.path.last());
                drawCanvasPaths();
            }
        }
    },
    color: {
        draw: function (ctx, left, top, size) {
            var color = true ? '#C9F' : '#FFC';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            var colors = ['#000', '#999', '#00F', '#F00', '#393', '#F0F', '#93C', '#F60'];
            for (var i = 0; i < 9; i++) {
                ctx.fillStyle = colors[i] || '#FFF';
                ctx.fillRect(size * (12.5 / 55) + size * (10 / 55) * (i % 3), size * (12.5 / 55) + size * (10 / 55) * Math.floor(i / 3), size * (10 / 55), size * (10 / 55));
            }
            ctx.strokeStyle = '#000';
            ctx.lineWidth = size * (1 / 55);
            ctx.strokeRect(size * (12.5 / 55), size * (12.5 / 55), size * (30 / 55), size * (30 / 55));
            ctx.translate(-left, -top);
        },
        click: function () {}
    },
    lineWidth: {
        draw: function (ctx, left, top, size) {
            var color = true ? '#C9F' : '#FFC';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            ctx.strokeStyle = draw.color;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = (1 / 55) * size;
            ctx.beginPath();
            ctx.moveTo((10 / 55) * size, (12 / 55) * size);
            ctx.lineTo((45 / 55) * size, (12 / 55) * size);
            ctx.stroke();
            ctx.lineWidth = (3 / 55) * size;
            ctx.beginPath();
            ctx.moveTo((10.5 / 55) * size, (20 / 55) * size);
            ctx.lineTo((44.5 / 55) * size, (20 / 55) * size);
            ctx.stroke();
            ctx.lineWidth = (5 / 55) * size;
            ctx.beginPath();
            ctx.moveTo((11 / 55) * size, (29 / 55) * size);
            ctx.lineTo((44 / 55) * size, (29 / 55) * size);
            ctx.stroke();
            ctx.lineWidth = (7 / 55) * size;
            ctx.beginPath();
            ctx.moveTo((11.5 / 55) * size, (39 / 55) * size);
            ctx.lineTo((43.5 / 55) * size, (39 / 55) * size);
            ctx.stroke();
            ctx.translate(-left, -top);
        },
        click: function () {}
    },
    dash: {
        draw: function (ctx, left, top, size) {
            var color = true ? '#C9F' : '#FFC';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.translate(left, top);
            if (typeof ctx.setLineDash !== 'function')
                ctx.setLineDash = function () {};
            ctx.setLineDash([(2 / 55) * size, (7 / 55) * size]);
            ctx.strokeStyle = draw.color;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = (4 / 55) * size;
            ctx.beginPath();
            ctx.moveTo(12.5 * size / 55, 27.5 * size / 55);
            ctx.lineTo((55 - 12.5) * size / 55, 27.5 * size / 55);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.translate(-left, -top);
        },
        click: function () {}
    },
    fill: {
        draw: function (ctx, left, top, size) {
            var color = true ? '#C9F' : '#FFC';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);

            ctx.save();
            ctx.translate(left, top);
            ctx.translate((26 + 2.5) * size / 55, (25 + 2.5) * size / 55);
            ctx.rotate(-0.25 * Math.PI);

            ctx.strokeStyle = '#000';
            ctx.fillStyle = '#FFF';
            ctx.lineWidth = 1 * size / 55;
            ctx.beginPath();
            ctx.moveTo(-7 * size / 55, -8 * size / 55);
            ctx.lineTo(7 * size / 55, -8 * size / 55);
            ctx.scale((7 / 2), 1);
            ctx.arc(0, -8 * size / 55, 2 * size / 55, Math.PI, 2 * Math.PI);
            ctx.scale((2 / 7), 1);
            ctx.lineTo(7 * size / 55, 8 * size / 55);
            ctx.scale((7 / 2), 1);
            ctx.arc(0 * size / 55, 8 * size / 55, 2 * size / 55, 0, Math.PI);
            ctx.scale((2 / 7), 1);
            ctx.lineTo(-7 * size / 55, -8 * size / 55);
            ctx.stroke();
            ctx.fill();

            var color = draw.fillColor !== 'none' ? draw.fillColor : '#00F';

            ctx.strokeStyle = '#000';
            ctx.fillStyle = color;
            ctx.lineWidth = 0.5 * size / 55;
            ctx.beginPath();
            ctx.moveTo(7 * size / 55, -8 * size / 55);
            ctx.scale((7 / 2), 1);
            ctx.arc(0, -8 * size / 55, 2 * size / 55, Math.PI, 3 * Math.PI);
            ctx.scale((2 / 7), 1);
            ctx.fill();
            ctx.stroke();

            ctx.fillRect(-7 * size / 55, 0, 9 * size / 55, 5 * size / 55);
            ctx.strokeRect(-7 * size / 55, 0, 9 * size / 55, 5 * size / 55);

            ctx.beginPath();
            ctx.moveTo(0, -4 * size / 55);
            ctx.arc(0, -4 * size / 55, 1 * size / 55, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0, -4 * size / 55);
            ctx.quadraticCurveTo(20 * size / 55, 10 * size / 55, 8 * size / 55, -2 * size / 55);
            ctx.stroke();

            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(-3 * size / 55, -9 * size / 55);
            ctx.quadraticCurveTo(-6 * size / 55, -17 * size / 55, -15 * size / 55, -3 * size / 55);
            ctx.quadraticCurveTo(-9 * size / 55, -9 * size / 55, -7 * size / 55, -9 * size / 55);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.rotate(0.25 * Math.PI);
            ctx.translate((-26 + 2.5) * size / 55, (-25 + 2.5) * size / 55);
            ctx.translate(-left, -top);
            ctx.restore();
        },
        click: function () {}
    },

    toolbar: {
        draw: function (ctx, left, top, size) {
            var vis = (!un(toolbar) && !un(toolbar.canvas) && !un(toolbar.canvas.parentNode)) ? true : false;
            var color = vis === true ? '#FFC' : '#C9F';
            roundedRect2(ctx, left + 1, top + 1, size - 2, size - 2, 4, 2, '#000', color);
            text({
                ctx: ctx,
                fontSize: size * 0.65,
                align: [0, 0],
                rect: [left, top, size, size],
                text: ['...'],
                bold: true
            });
        },
        click: function () {
            toolbar.toggle();
        }
    },
    print: {
        draw: function (ctx, left, top, size) {
            draw.printButton.draw(ctx, {
                type: 'printButton',
                rect: [left + 1, top + 1, size - 2, size - 2],
                color: '#000',
                fillColor: '#C9F',
                lineWidth: 2,
                radius: 5
            });
        },
        click: function () {
            var resource = file.resources[resourceIndex];
            if (resource.hasPDF == true) {
                Notifier.notify("Loading printable version in new tab.", '', '/Images/logoSmall.PNG');
                var tag = currFolder === 'teachFiles' ? '' : currFolder.slice(5) + '-';
                var url = '/i2/teachPrint.php?id=' + tag + encodeURIComponent(currFilename) + '&r=' + encodeURIComponent(resource.name);
                window.open(url, '_blank');
            } else if (!un(resource.pdf)) {
                Notifier.notify("Loading printable version in new tab.", '', '/Images/logoSmall.PNG');
                window.open(resource.pdf, '_blank')
            } else if (resource.allowCreatePDF !== false && resource.name.toLowerCase().indexOf('slide') > -1) {
                if (canvasPdf.slidesHaveAnswers(resource) === true) {
                    teach.buttons.print.showPrintSlidesDialog();
                } else {
                    teach.buttons.print.printSlides(true);
                }
            } else {
                Notifier.error("Sorry, this resource cannot be printed.");
            }
        },
        printSlides: function (showAnswers) {
            var resource = file.resources[resourceIndex];
            try {
                canvasPdf.getResourcePDF(resource, 'slides', 'download', {
                    showAnswers: showAnswers
                });
                Notifier.notify("Loading printable version in new tab...", '', '/Images/logoSmall.PNG');
            } catch (e) {
                console.log(e);
                Notifier.error("Sorry, something went wrong.");
            }
        },
        showPrintSlidesDialog: function () {
            if (un(teach.printSlidesDialog)) {
                teach.printSlidesDialog = addElement({
                    type: 'div',
                    style: {
                        position: 'absolute',
                        left: '0',
                        top: '0',
                        right: '0',
                        bottom: '0',
                        zIndex: '10000000000',
                        cursor: 'default',
                        backgroundColor: colorA('#666', 0.8),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    },
                    onclick: function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });

                var dialog = addElement({
                    type: 'div',
                    parent: teach.printSlidesDialog,
                    style: {
                        backgroundColor: '#FFC',
                        padding: '20px',
                        border: '3px solid black',
                        borderRadius: '10px',
                        fontFamily: 'Arial'
                    }
                });

                var title = addElement({
                    type: 'div',
                    parent: dialog,
                    innerHTML: 'Print Slides Handout',
                    style: {
                        fontSize: '18px',
                        padding: '5px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }
                });

                var buttonsDiv = addElement({
                    type: 'div',
                    parent: dialog,
                    style: {
                        fontSize: '14px',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center'
                    }
                });

                addElement({
                    type: 'button',
                    parent: buttonsDiv,
                    innerHTML: 'Print without answers',
                    style: {
                        backgroundColor: '#CFC',
                        padding: '5px',
                        border: '1.5px solid black',
                        borderRadius: '5px',
                        margin: '0 10px',
                        cursor: 'pointer'
                    },
                    onclick: function () {
                        teach.buttons.print.printSlides(false);
                        teach.buttons.print.hidePrintSlidesDialog();
                    }
                });
                addElement({
                    type: 'button',
                    parent: buttonsDiv,
                    innerHTML: 'Print with answers',
                    style: {
                        backgroundColor: '#CFC',
                        padding: '5px',
                        border: '1.5px solid black',
                        borderRadius: '5px',
                        margin: '0 10px',
                        cursor: 'pointer'
                    },
                    onclick: function () {
                        teach.buttons.print.printSlides(true);
                        teach.buttons.print.hidePrintSlidesDialog();
                    }
                });
                addElement({
                    type: 'button',
                    parent: buttonsDiv,
                    innerHTML: 'Cancel',
                    style: {
                        backgroundColor: '#FCC',
                        padding: '5px',
                        border: '1.5px solid black',
                        borderRadius: '5px',
                        margin: '0 10px',
                        cursor: 'pointer'
                    },
                    onclick: function () {
                        teach.buttons.print.hidePrintSlidesDialog();
                    }
                });
            }
            document.body.appendChild(teach.printSlidesDialog);
            function addElement(obj) {
                var el = document.createElement(obj.type);
                for (var key in obj) {
                    if (key === 'parent') {
                        obj[key].appendChild(el);
                    } else if (key === 'style') {
                        for (var s in obj.style) {
                            el.style[s] = obj.style[s];
                        }
                    } else if (key !== 'type') {
                        el[key] = obj[key];
                    }
                }
                return el;
            }
        },
        hidePrintSlidesDialog: function () {
            if (teach.printSlidesDialog.parentNode === document.body) {
                document.body.removeChild(teach.printSlidesDialog);
            }
        }

    },

    keyboard: {}
};
teach.drawButtons = {
    visible: true,
    side: 'right',
    width: 60,
    built: false,
    build: function () {
        var colorPickerTop = 0;
        var lineWidthPickerTop = 0;

        this.buttonsIndex = {};
        for (var b = 0; b < this.buttons.length; b++) {
            var button = this.buttons[b];
            this.buttonsIndex[button.type] = button;
            button.canvas = createCanvas( - (this.width - 5), button.bottom === true ? 745 - this.width : 5 + (this.width - 5) * b, this.width - 10, this.width - 10, false, false, true, 1000000000);
            button.ctx = button.canvas.getContext('2d');
            button.canvas.width = 55;
            button.canvas.height = 55;
            button.canvas._button = button;
            addListener(button.canvas, function (e) {
                e.target._button.click(e);
            });
            if (button.type === 'colorPicker')
                colorPickerTop = 5 + (this.width - 5) * b;
            if (button.type === 'lineWidthPicker')
                lineWidthPickerTop = 5 + (this.width - 5) * b;
        }

        this.colorPicker.canvas = createCanvas(0, colorPickerTop, this.colorPicker.width, this.colorPicker.height, false, false, true, 1000000000);
        this.colorPicker.ctx = this.colorPicker.canvas.getContext('2d');
        this.colorPicker.canvas.visible = false;
        this.colorPicker.draw();
        addListenerStart(this.colorPicker.canvas, function (e) {
            teach.drawButtons.colorPicker.click(e);
        });

        this.lineWidthPicker.canvas = createCanvas(0, lineWidthPickerTop, this.lineWidthPicker.width, this.lineWidthPicker.height, false, false, true, 1000000000);
        this.lineWidthPicker.ctx = this.lineWidthPicker.canvas.getContext('2d');
        this.lineWidthPicker.canvas.visible = false;
        this.lineWidthPicker.draw();
        addListenerStart(this.lineWidthPicker.canvas, function (e) {
            teach.drawButtons.lineWidthPicker.click(e);
        });
        this.built = true;
        this.update();
    },
    updatePageButtons: function (page) {
        if (!un(page) && page.drawToolsButtons instanceof Array) {
            this.pageButtons = page.drawToolsButtons.map(function (buttonType) {
                return this.buttonIndex[buttonType];
            });
        } else if (!un(page) && typeof page.drawToolsButtons === 'object') {
            var addedButtonTypes = page.drawToolsButtons.add instanceof Array ? page.drawToolsButtons.add : [];
            var removedButtonTypes = page.drawToolsButtons.remove instanceof Array ? page.drawToolsButtons.remove : [];
            this.pageButtons = this.buttons.filter(function (button) {
                return (button.showByDefault === true && removedButtonTypes.indexOf(button.type) === -1) || addedButtonTypes.indexOf(button.type) > -1;
            });
        } else {
            this.pageButtons = this.buttons.filter(function (button) {
                return button.showByDefault === true
            });
        }
    },
    update: function () {
        if (this.visible === false)
            return;
        if (this.built === false)
            this.build();
        var enabled = un(pages[pIndex]) || pages[pIndex].pageVis === false ? false : true;
        this.updatePageButtons(pages[pIndex]);

        for (var b = 0; b < this.buttons.length; b++) {
            var button = this.buttons[b];
            if (draw.mode === 'edit' || this.pageButtons.indexOf(button) === -1) {
                hideObj(button.canvas);
            } else {
                showObj(button.canvas);
            }
        }
        for (var b = 0; b < this.pageButtons.length; b++) {
            var button = this.pageButtons[b];
            if (!un(button.ctx))
                button.draw();
            button.canvas.data[100] = this.side === 'left' ? -this.width + 5 : 1225 + 5;
            button.canvas.data[101] = button.bottom === true ? 745 - this.width : 5 + (this.width - 5) * b;
            resizeCanvas3(button.canvas);
            button.canvas.style.opacity = enabled ? 1 : 0.5;
            button.canvas.style.pointerEvents = enabled ? 'auto' : 'none';
            if (button.type === 'colorPicker')
                this.colorPicker.canvas.data[101] = 5 + (this.width - 5) * b;
            if (button.type === 'lineWidthPicker')
                this.lineWidthPicker.canvas.data[101] = 5 + (this.width - 5) * b;
        }
        if (this.colorPicker.visible === true) {
            showObj(this.colorPicker.canvas);
        } else {
            hideObj(this.colorPicker.canvas);
        }
        this.colorPicker.canvas.data[100] = this.side === 'left' ? 0 : 1225 - this.colorPicker.width;
        resizeCanvas(this.colorPicker);
        if (this.lineWidthPicker.visible === true) {
            showObj(this.lineWidthPicker.canvas);
        } else {
            hideObj(this.lineWidthPicker.canvas);
        }
        this.lineWidthPicker.canvas.data[100] = this.side === 'left' ? 0 : 1225 - this.lineWidthPicker.width;
        resizeCanvas(this.lineWidthPicker);
    },
    show: function () {
        if (this.built === false)
            this.build();
        for (var b = 0; b < this.pageButtons.length; b++) {
            var button = this.pageButtons[b];
            showObj(button);
        }
    },
    hide: function () {
        for (var b = 0; b < this.pageButtons.length; b++) {
            var button = this.pageButtons[b];
            hideObj(button);
        }
    },
    colorPicker: {
        width: 116,
        height: 206,
        visible: false,
        draw: function () {
            var ctx = this.ctx;
            var colors = ['#000', '#999', '#00F', '#F00', '#393', '#F0F', '#93C', '#F60'];
            ctx.translate(3, 3);
            roundedRect(ctx, 0, 0, 110, 200, 8, 6, '#000', draw.buttonColor);
            for (var i = 0; i < 8; i++) {
                ctx.fillStyle = colors[i];
                ctx.fillRect(10 + 45 * (i % 2), 10 + 45 * Math.floor(i / 2), 45, 45);
            }
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (var i = 0; i <= 4; i++) {
                ctx.moveTo(10, 10 + 45 * i);
                ctx.lineTo(100, 10 + 45 * i);
            }
            for (var i = 0; i <= 2; i++) {
                ctx.moveTo(10 + 45 * i, 10);
                ctx.lineTo(10 + 45 * i, 190);
            }
            ctx.stroke();
            ctx.translate(-3, -3);
        },
        click: function (e) {
			var cursorPos = teach.drawButtons.colorPicker.getCursorPos(e);
			if (typeof cursorPos !== 'object')
				return;
            var colors = [['#000', '#999'], ['#00F', '#F00'], ['#393', '#F0F'], ['#93C', '#F60']];
            var i = Math.floor((cursorPos[0] - 13) / 45);
            var j = Math.floor((cursorPos[1] - 13) / 45);
            if (un(colors[j]) || un(colors[j][i]))
                return;
            draw.color = colors[j][i];
            teach.drawButtons.update();
            draw.cursors.update();
            calcCursorPositions();
            drawCanvasPaths();
        },
		getCursorPos: function (e) {
			var colorPicker = teach.drawButtons.colorPicker;
			var bounds = e.target.getBoundingClientRect();
			if (e.touches) {
				if (un(e.touches[0])) {
					return;
				}
				var pageX = e.touches[0].pageX;
				var pageY = e.touches[0].pageY;
			} else {
				var pageX = e.clientX || e.pageX;
				var pageY = e.clientY || e.pageY;
			}
			return [colorPicker.width * (pageX - bounds.x) / bounds.width, colorPicker.height * (pageY - bounds.y) / bounds.height];
		}
    },
    lineWidthPicker: {
        width: 116,
        height: 161,
        visible: false,
        draw: function () {
            var ctx = this.ctx;
            var widths = [3, 5, 7];
            ctx.translate(3, 3);
            var color = draw.buttonColor;
            roundedRect(ctx, 0, 0, 110, 155, 8, 6, '#000', draw.buttonColor);
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            for (var i = 0; i < widths.length; i++) {
                ctx.fillStyle = draw.thickness === widths[i] ? '#CFF' : '#FFC';
                ctx.fillRect(10, 10 + 45 * i, 90, 45);
                ctx.lineWidth = widths[i];
                ctx.beginPath();
                ctx.moveTo(25, 10 + 45 * i + 22.5);
                ctx.lineTo(85, 10 + 45 * i + 22.5);
                ctx.stroke();
            }
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (var i = 0; i <= widths.length; i++) {
                ctx.moveTo(10, 10 + 45 * i);
                ctx.lineTo(100, 10 + 45 * i);
            }
            for (var i = 0; i <= 1; i++) {
                ctx.moveTo(10 + 90 * i, 10);
                ctx.lineTo(10 + 90 * i, 10 + 45 * widths.length);
            }

            ctx.stroke();
            ctx.translate(-3, -3);
        },
        click: function (e) {
			var cursorPos = teach.drawButtons.lineWidthPicker.getCursorPos(e);
			if (typeof cursorPos !== 'object')
				return;
            var widths = [3, 5, 7];
            var i = Math.floor((cursorPos[0] - 13) / 90);
            var j = Math.floor((cursorPos[1] - 13) / 45);
            if (un(widths[j]) || i !== 0)
                return;
            draw.thickness = widths[j];
            teach.drawButtons.update();
            teach.drawButtons.lineWidthPicker.draw();
            draw.cursors.update();
            calcCursorPositions();
            drawCanvasPaths();
        },
		getCursorPos: function (e) {
			var lineWidthPicker = teach.drawButtons.lineWidthPicker;
			var bounds = e.target.getBoundingClientRect();
			if (e.touches) {
				if (un(e.touches[0]))
					return;
				var pageX = e.touches[0].pageX;
				var pageY = e.touches[0].pageY;
			} else {
				var pageX = e.clientX || e.pageX;
				var pageY = e.clientY || e.pageY;
			}
			return [lineWidthPicker.width * (pageX - bounds.x) / bounds.width, lineWidthPicker.height * (pageY - bounds.y) / bounds.height];
		}
    },
    buttons: [{
            type: 'tracingPaper',
            showByDefault: false,
            draw: function () {
                draw.buttonTracingPaper.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                var tracingPaper = draw.tracingPaper.getTracingPapersInPaths(draw.path, true)[0];
                tracingPaper._path.vis = !tracingPaper._path.vis;
                drawCanvasPaths();
                teach.drawButtons.update();
            }
        }, {
            type: 'pen',
            showByDefault: true,
            draw: function () {
                draw.buttonPen.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                changeDrawMode('pen');
                draw.closeDropMenus();
            }
        }, {
            type: 'line',
            showByDefault: true,
            draw: function () {
                draw.buttonLine.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                changeDrawMode('line');
                draw.closeDropMenus();
            }
        }, {
            type: 'point',
            showByDefault: true,
            draw: function () {
                draw.buttonPoint.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                changeDrawMode('point');
                draw.closeDropMenus();
            }
        }, {
            type: 'textArial',
            showByDefault: true,
            draw: function () {
                draw.buttonText.draw(this.ctx, {
                    left: 0,
                    top: 0,
                    font: 'Arial'
                });
            },
            click: function () {
                if (draw.drawMode === 'interactText') {
                    var selectedFont = !un(draw._interactTextFont) ? draw._interactTextFont : 'Arial';
                    if (selectedFont !== 'Arial') {
                        draw._interactTextFont = 'Arial';
                        teach.drawButtons.update();
                    } else {
                        changeDrawMode();
                    }
                } else {
                    draw._interactTextFont = 'Arial';
                    changeDrawMode('interactText');
                }
                draw.closeDropMenus();
            }
        }, {
            type: 'textAlgebra',
            showByDefault: true,
            draw: function () {
                draw.buttonText.draw(this.ctx, {
                    left: 0,
                    top: 0,
                    font: 'algebra'
                });
            },
            click: function () {
                if (draw.drawMode === 'interactText') {
                    var selectedFont = !un(draw._interactTextFont) ? draw._interactTextFont : 'Arial';
                    if (selectedFont !== 'algebra') {
                        draw._interactTextFont = 'algebra';
                        teach.drawButtons.update();
                    } else {
                        changeDrawMode();
                    }
                } else {
                    draw._interactTextFont = 'algebra';
                    changeDrawMode('interactText');
                }
                draw.closeDropMenus();
            }
        }, {
            type: 'colorPicker',
            showByDefault: true,
            draw: function () {
                var color = teach.drawButtons.colorPicker.visible === true ? draw.buttonSelectedColor : draw.buttonColor;
                roundedRect(this.ctx, 0, 0, 55, 55, 8, 0.01, color, color);
                roundedRect(this.ctx, 1.5, 1.5, 52, 52, 8, 3, '#000');
                var colors = ['#000', '#999', '#00F', '#F00', '#393', '#F0F', '#93C', '#F60', '#FFF'];
                for (var i = 0; i < 9; i++) {
                    this.ctx.fillStyle = colors[i];
                    this.ctx.fillRect(12.5 + 10 * (i % 3), 12.5 + 10 * Math.floor(i / 3), 10, 10);
                }
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(12.5, 12.5, 30, 30);
            },
            click: function () {
                teach.drawButtons.colorPicker.visible = !teach.drawButtons.colorPicker.visible;
                teach.drawButtons.lineWidthPicker.visible = false;
                teach.drawButtons.update();
            }
        }, {
            type: 'lineWidthPicker',
            showByDefault: true,
            draw: function () {
                var ctx = this.ctx;
                var color = teach.drawButtons.lineWidthPicker.visible === true ? draw.buttonSelectedColor : draw.buttonColor;
                roundedRect(this.ctx, 0, 0, 55, 55, 8, 0.01, color, color);
                roundedRect(this.ctx, 1.5, 1.5, 52, 52, 8, 3, '#000');
                ctx.strokeStyle = '#000';
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(10, 12);
                ctx.lineTo(45, 12);
                ctx.stroke();
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(10.5, 20);
                ctx.lineTo(44.5, 20);
                ctx.stroke();
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(11, 29);
                ctx.lineTo(44, 29);
                ctx.stroke();
                ctx.lineWidth = 7;
                ctx.beginPath();
                ctx.moveTo(11.5, 39);
                ctx.lineTo(43.5, 39);
                ctx.stroke();
            },
            click: function () {
                teach.drawButtons.lineWidthPicker.visible = !teach.drawButtons.lineWidthPicker.visible;
                teach.drawButtons.colorPicker.visible = false;
                teach.drawButtons.update();
            }
        }, {
            type: 'dash',
            showByDefault: false,
            draw: function () {
                draw.buttonDash.draw(this.ctx, {
                    left: 0,
                    top: 0,
                    dash: [15, 15]
                });
            },
            click: function () {
                if (un(draw.dash) || draw.dash.length == 0) {
                    draw.dash = [15, 15];
                } else {
                    delete draw.dash;
                }
                teach.drawButtons.update();
            }
        }, {
            type: 'compass',
            showByDefault: false,
            draw: function () {
                draw.buttonCompass.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                draw.buttonCompass.click();
                teach.drawButtons.update();
            }
        }, {
            type: 'protractor',
            showByDefault: false,
            draw: function () {
                draw.buttonProtractor.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                draw.buttonProtractor.click();
                teach.drawButtons.update();
            }
        }, {
            type: 'ruler',
            showByDefault: false,
            draw: function () {
                draw.buttonRuler.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                draw.buttonRuler.click();
                teach.drawButtons.update();
            }
        }, {
            type: 'fill',
            showByDefault: false,
            draw: function () {
                draw.buttonFloodFill.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                changeDrawMode('floodFill');
                draw.cursors.update();
                draw.closeDropMenus();
            }
        }, {
            type: 'eraser',
            showByDefault: true,
            draw: function () {
                draw.buttonEraser.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                changeDrawMode('eraser');
                draw.closeDropMenus();
            }
        }, {
            type: 'undo',
            showByDefault: true,
            draw: function () {
                draw.buttonUndo.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                var mostRecent = false;
                for (var p = 0; p < draw.path.length; p++) {
                    var path = draw.path[p];
                    for (var o = 0; o < path.obj.length; o++) {
                        var obj2 = path.obj[o];
                        if (un(obj2.created))
                            continue;
                        if (mostRecent === false || obj2.created > mostRecent.time) {
                            mostRecent = {
                                time: obj2.created,
                                objs: [obj2],
                                tpDrawPaths: []
                            };
                        } else if (obj2.created === mostRecent.time) {
                            mostRecent.objs.push(obj2);
                        }
                    }
                }
                var tracingPapers = draw.tracingPaper.getTracingPapersInPaths(draw.path, true);
                for (var t = 0; t < tracingPapers.length; t++) {
                    var tp = tracingPapers[t];
                    if (taskQuestion !== false && tp._path._taskQuestion !== taskQuestion)
                        continue;
                    if (un(tp.drawPaths))
                        continue;
                    for (var o = 0; o < tp.drawPaths.length; o++) {
                        var drawPath = tp.drawPaths[o];
                        if (un(drawPath.created))
                            continue;
                        drawPath._obj = tp;
                        if (mostRecent === false || drawPath.created > mostRecent.time) {
                            mostRecent = {
                                time: drawPath.created,
                                objs: [],
                                tpDrawPaths: [drawPath]
                            };
                        } else if (drawPath.created === mostRecent.time) {
                            mostRecent.tpDrawPaths.push(drawPath);
                        }
                    }
                }
                if (!un(pages[pIndex]._deletedPathsInteract)) {
                    for (var p = 0; p < pages[pIndex]._deletedPathsInteract.length; p++) {
                        var deletedPath = pages[pIndex]._deletedPathsInteract[p];
                        if (mostRecent === false || deletedPath.deletedTime > mostRecent.time) {
                            mostRecent = {
                                type: 'deletedPath',
                                time: deletedPath.deletedTime,
                                path: deletedPath.path,
                                index: deletedPath.index,
                                index2: p
                            };
                        }
                    }
                }
                if (mostRecent !== false) {
                    if (mostRecent.type === 'deletedPath') {
                        draw.path.splice(mostRecent.index, 0, mostRecent.path);
                        pages[pIndex]._deletedPathsInteract.splice(mostRecent.index2, 1);
                    } else {
                        for (var o = 0; o < mostRecent.objs.length; o++) {
                            var obj2 = mostRecent.objs[o];
                            var index = draw.path.indexOf(obj2._path);
                            if (index > -1)
                                draw.path.splice(index, 1);
                            if (obj2.type === 'eraser' && obj2._objs instanceof Array) {
                                for (var o3 = 0; o3 < obj2._objs.length; o3++) {
                                    var obj3 = obj2._objs[o3];
                                    if (obj3._erasers instanceof Array) {
                                        var index2 = obj3._erasers.indexOf(obj2);
                                        if (index2 > -1)
                                            obj3._erasers.splice(index2, 1);
                                    }
                                }
                            }
                        }
                        for (var o = 0; o < mostRecent.tpDrawPaths.length; o++) {
                            var drawPath = mostRecent.tpDrawPaths[o];
                            var index = drawPath._obj.drawPaths.indexOf(drawPath);
                            if (index > -1)
                                drawPath._obj.drawPaths.splice(index, 1);
                        }
                    }
                }

                drawCanvasPaths();
                draw.closeDropMenus();
            }
        }, {
            type: 'clear',
            showByDefault: true,
            draw: function () {
                draw.buttonClear.draw(this.ctx, {
                    left: 0,
                    top: 0
                });
            },
            click: function () {
                draw.buttonClear.click({});
                drawCanvasPaths();
                draw.closeDropMenus();
            }
        }, {
            type: 'changeSide',
            showByDefault: true,
            bottom: true,
            draw: function () {
                this.ctx.clear();
                if (teach.drawButtons.side === 'left') {
                    draw.polygon.draw(this.ctx, {
                        color: '#000',
                        lineWidth: 1,
                        points: [[0.1 * 55, 0.3 * 55], [0.5 * 55, 0.3 * 55], [0.5 * 55, 0.1 * 55], [0.9 * 55, 0.5 * 55], [0.5 * 55, 0.9 * 55], [0.5 * 55, 0.7 * 55], [0.1 * 55, 0.7 * 55]]
                    }, {});
                } else {
                    draw.polygon.draw(this.ctx, {
                        color: '#000',
                        lineWidth: 1,
                        points: [[0.9 * 55, 0.3 * 55], [0.5 * 55, 0.3 * 55], [0.5 * 55, 0.1 * 55], [0.1 * 55, 0.5 * 55], [0.5 * 55, 0.9 * 55], [0.5 * 55, 0.7 * 55], [0.9 * 55, 0.7 * 55]]
                    }, {});
                }
            },
            click: function () {
                teach.drawButtons.side = teach.drawButtons.side === 'left' ? 'right' : 'left';
                teach.drawButtons.update();
                arrangeScreen();
                draw.closeDropMenus();
            }
        }
    ],
    pageButtons: []
}

var slideInfo = newctx({
    rect: [-teach.drawButtons.width, 0, teach.drawButtons.width * 2 + 1225, 750],
    z: 10000000
});

var screenShadeButton = function () {
    var screenShadeButton = createCanvas(1110 - 4 * 43, 653, 40, 40, false, false, true, 1000000000);
    screenShadeButton.lineColor = '#000';
    screenShadeButton.lineWidth = 2;
    screenShadeButton.fillColor = '#C9F';
    screenShadeButton.radius = 4;
    screenShadeButton.width = 40;
    screenShadeButton.left = 1110 - 4 * 43;
    screenShadeButton.top = 653;
    screenShadeButton.draw = function () {
        var ctx = this.ctx;
        if (typeof screenShade !== 'undefined' && !un(screenShade.canvas) && screenShade.canvas.parentNode === container) {
            var color = '#FFF';
        } else {
            var color = this.fillColor;
        }
        roundedRect2(ctx, this.lineWidth / 2, this.lineWidth / 2, this.width - this.lineWidth, this.width - this.lineWidth, this.radius, this.lineWidth, this.lineColor, color);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(8, 10, 24, 20);
        ctx.fillStyle = '#BBB';
        ctx.fillRect(20, 11, 11, 18);

        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 10, 12, 20);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 10, 24, 20);
    }
    screenShadeButton.draw();
    addListener(screenShadeButton, function (e) {
        draw.screenShade2.toggle();
    });
    return screenShadeButton;
}
();

var zoomMinus = createCanvas(1110 - 43, 653, 40, 40, false, false, true, 1000000000);
teach.buttons.zoomMinus.draw(zoomMinus.ctx, 0, 0, 40);
addListener(zoomMinus, teach.buttons.zoomMinus.click);

var zoomPlus = createCanvas(1110 - 43, 653, 40, 40, false, false, true, 1000000000);
teach.buttons.zoomPlus.draw(zoomPlus.ctx, 0, 0, 40);

addListener(zoomPlus, teach.buttons.zoomPlus.click);

var zoomEqual = createCanvas(1110 - 43, 653, 40, 40, false, false, true, 1000000000);
teach.buttons.zoomEqual.draw(zoomEqual.ctx, 0, 0, 40);
addListener(zoomEqual, teach.buttons.zoomEqual.click);

var taskTrayCanvas = createCanvas(230, 705, 560, 40, false, false, false, 1000000000);

var clearButton = function () {
    var clearButton = createCanvas(1110 - 4 * 43, 653, 40, 40, false, false, true, 1000000000);
    clearButton.buttonType = 'clear';
    clearButton.left = 1110 - 4 * 43;
    clearButton.top = 653;
    clearButton.draw = function () {
        var ctx = this.ctx;
        teach.buttons.clear.draw(ctx, 0, 0, 40);
    }
    clearButton.draw();
    addListener(clearButton, function (e) {
        teach.buttons.clear.click();
    });
    return clearButton;
}
();

var prevButton = playButton(1110, 653, 40, prev, {
    lineWidth: 2,
    radius: 4,
    zIndex: 1000000000,
    dir: 'left'
});
var nextButton = playButton(1153, 653, 40, next, {
    lineWidth: 2,
    radius: 4,
    zIndex: 1000000000
});

var addBlankSlideButton = function () {
    var addBlankSlideButton = createCanvas(1110 - 4 * 43, 653, 40, 40, false, false, true, 1000000000);
    addBlankSlideButton.buttonType = 'addBlankSlide';
    addBlankSlideButton.lineColor = '#000';
    addBlankSlideButton.lineWidth = 2;
    addBlankSlideButton.fillColor = '#C9F';
    addBlankSlideButton.radius = 4;
    addBlankSlideButton.width = 40;
    addBlankSlideButton.left = 1110 - 4 * 43;
    addBlankSlideButton.top = 653;
    addBlankSlideButton.draw = function () {
        var ctx = this.ctx;
        var color = this.fillColor;
        roundedRect2(ctx, this.lineWidth / 2, this.lineWidth / 2, this.width - this.lineWidth, this.width - this.lineWidth, this.radius, this.lineWidth, this.lineColor, color);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(8, 8, 24, 24);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 8, 24, 24);
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(20, 14);
        ctx.lineTo(20, 26);
        ctx.moveTo(14, 20);
        ctx.lineTo(26, 20);
        ctx.stroke();
    }
    addBlankSlideButton.draw();
    addListener(addBlankSlideButton, function (e) {
        insertBlankSlide()
    });
    return addBlankSlideButton;
}
();
function insertBlankSlide(index) {
    if (un(index))
        index = pIndex;
    hidePage();
    file.resources[resourceIndex].pages.splice(index + 1, 0, {
        paths: [],
        _loaded: 1
    });
    pIndex = index + 1;
    showPage();
    presentButtons.arrange();
    Notifier.info('Blank page added');
    if (mode == 'edit')
        previewSlides(true);
}

var fullScreenButton = function () {
    var fullScreenButton = createCanvas(1110 - 5 * 43, 653, 40, 40, false, false, true, 1000000000);
    fullScreenButton.lineColor = '#000';
    fullScreenButton.lineWidth = 2;
    fullScreenButton.fillColor = '#C9F';
    fullScreenButton.selectedColor = '#FFC';
    fullScreenButton.radius = 4;
    fullScreenButton.width = 40;
    fullScreenButton.left = 1110 - 5 * 43;
    fullScreenButton.top = 653;
    fullScreenButton.draw = function () {
        var ctx = this.ctx;
        var color = window.innerHeight == screen.height ? this.selectedColor : this.fillColor;
        roundedRect2(ctx, this.lineWidth / 2, this.lineWidth / 2, this.width - this.lineWidth, this.width - this.lineWidth, this.radius, this.lineWidth, this.lineColor, color);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.moveTo(24, 8);
        ctx.lineTo(32, 8);
        ctx.lineTo(32, 16);
        ctx.moveTo(32, 24);
        ctx.lineTo(32, 32);
        ctx.lineTo(24, 32);
        ctx.moveTo(16, 32);
        ctx.lineTo(8, 32);
        ctx.lineTo(8, 24);
        ctx.moveTo(8, 16);
        ctx.lineTo(8, 8);
        ctx.lineTo(16, 8);
        ctx.stroke();
    }
    fullScreenButton.draw();
    window.addEventListener('resize', function () {
        fullScreenButton.draw()
    });
    addListener(fullScreenButton, function (e) {
        toggleFullScreen()
    });
    return fullScreenButton;
}
();
function toggleFullScreen() {
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||
        (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {
            document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
}

var togglePageAppearButtonsButton = function () {
    var togglePageAppearButtonsButton = createCanvas(1110 - 5 * 43, 653, 40, 40, false, false, true, 1000000000);
    togglePageAppearButtonsButton.draw = function () {
        this.mode = 'none';
        var colors = ['#CCC', '#FFF'];
        this.style.pointerEvents = 'none';
        if (!un(file.resources[resourceIndex])) {
            var resource = file.resources[resourceIndex];
            if (getResourceType(resource) === 'slides' && !un(resource.pages[pIndex]) && !un(resource.pages[pIndex].paths)) {
                var paths = file.resources[resourceIndex].pages[pIndex].paths;
                for (var p = 0; p < paths.length; p++) {
                    var path = paths[p];
                    if (!un(path.appear)) {
                        if (this.mode === 'none')
                            this.mode = 'appear';
                        if ((path.appear.startVisible === true && path._visible !== true) || (path.appear.startVisible !== true && path._visible === true)) {
                            this.mode = 'reset';
                        }
                    }
                    for (var o = 0; o < path.obj.length; o++) {
                        var obj = path.obj[o];
                        if (obj.type === 'starterQuestion' && (typeof obj.showAnswer === 'function' || ['none', 'grid', 'mixed'].indexOf(obj._questionType) === -1)) {
                            if (this.mode === 'none')
                                this.mode = 'appear';
                            if (obj._showingAnswer === true) {
                                this.mode = 'reset';
                            }
                        }
                    }
                }
            }
        }
        if (this.mode === 'appear') {
            colors = ['#C9F', '#FFF'];
            this.style.pointerEvents = 'auto';
        } else if (this.mode === 'reset') {
            colors = ['#FFF', '#C9F'];
            this.style.pointerEvents = 'auto';
        }
        var ctx = this.ctx;
        roundedRect(ctx, 2, 2, 40 - 4, 40 - 4, 4, 4, '#000', colors[0]);
        ctx.beginPath();
        ctx.fillStyle = colors[1];
        drawStar({
            ctx: ctx,
            center: [20, 20],
            radius: 12,
            points: 5
        });
        ctx.fill();
    }
    togglePageAppearButtonsButton.draw();
    addListener(togglePageAppearButtonsButton, function (e) {
        if (!un(file.resources[resourceIndex])) {
            var resource = file.resources[resourceIndex];
            if (getResourceType(resource) === 'slides') {
                for (var p = 0; p < draw.path.length; p++) {
                    var path = draw.path[p];
                    if (!un(path.appear)) {
                        if (togglePageAppearButtonsButton.mode === 'appear' || path.appear.startVisible === true) {
                            path._visible = true;
                            if (typeof path.appear.onappear == 'function')
                                path.appear.onappear(path);
                        } else {
                            path._visible = false;
                            if (typeof path.appear.ondisappear == 'function')
                                path.appear.ondisappear(path);
                        }
                    }
                    for (var o = 0; o < path.obj.length; o++) {
                        var obj = path.obj[o];
                        if (obj.type === 'starterQuestion' && (typeof obj.showAnswer === 'function' || ['none', 'grid', 'mixed'].indexOf(obj._questionType) === -1)) {
                            if (togglePageAppearButtonsButton.mode === 'appear') {
                                draw.starterQuestion.showAnswer(obj);
                            } else {
                                draw.starterQuestion.unshowAnswer(obj);
                            }
                        }
                    }
                }
            }
        }
        drawCanvasPaths();
        drawCanvasPaths();
        togglePageAppearButtonsButton.draw();
    });
    return togglePageAppearButtonsButton;
}
();

var answersButton = function () {
    var answersButton = createCanvas(1225 / 2 - 5 / 2 - 140, 705, 140, 40, false, false, true, 1000000000);
    answersButton.draw = function () {
        var color = draw.triggerNum == 0 ? '#FFF' : '#6F6';
        text({
            ctx: this.ctx,
            align: [-1, 0],
            rect: [1, 1, 140 - 2, 40 - 2],
            text: ['Answers'],
            box: {
                type: 'loose',
                color: color,
                borderColor: '#000',
                borderWidth: 2,
                radius: 5
            }
        });
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = draw.triggerNum == 0 ? '#F66' : '#6F6';
        this.ctx.moveTo(105, 7);
        this.ctx.lineTo(120, 7);
        this.ctx.arc(120, 20, 13, 1.5 * Math.PI, 0.5 * Math.PI);
        this.ctx.lineTo(105, 33);
        this.ctx.arc(105, 20, 13, 0.5 * Math.PI, 1.5 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillStyle = '#000';
        if (draw.triggerNum == 0) {
            this.ctx.arc(105, 20, 9, 0, 2 * Math.PI);
        } else {
            this.ctx.arc(120, 20, 9, 0, 2 * Math.PI);
        }
        this.ctx.fill();
        this.ctx.stroke();

    }
    answersButton.draw();
    addListener(answersButton, function (e) {
        toggleAnswers()
    });
    return answersButton;
}
();
function toggleAnswers() {
    draw.triggerEnabled = true;
    draw.triggerNum = draw.triggerNum == 1 ? 0 : 1;
    answersButton.draw();
    drawCanvasPaths();
    calcCursorPositions();
    if (!un(draw.multiPage) && draw.multiPage.isOn === true) {
        for (var p = 0; p < pages.length; p++) {
            var page = pages[p];
            if (draw.triggerNum === 1) {
                //draw.div.children[p].appendChild();
                page._div.appendChild(page._answerCanvas);
            } else {
                if (page._answerCanvas.parentNode === page._div)
                    page._div.removeChild(page._answerCanvas);
            }
        }
    }
}

var toolbarButton = function () {
    var toolbarButton = createCanvas(1110 - 5 * 43, 653, 40, 40, false, false, true, 1000000000);
    toolbarButton.width = 40;
    toolbarButton.left = 1110 - 5 * 43;
    toolbarButton.top = 653;
    toolbarButton.draw = function () {
        teach.buttons.toolbar.draw(this.ctx, 0, 0, this.width);
    }
    toolbarButton.draw();
    window.addEventListener('resize', function () {
        toolbarButton.draw();
    });
    addListener(toolbarButton, function (e) {
        teach.buttons.toolbar.click();
    });
    return toolbarButton;
}
();

var toolbar = {
    rect: [1200 - 250, 700 - 380, 250, 380],
    colorPickerRect: [1200 - 250 - 150, 700 - 290, 150, 290],
    columns: 3,
    cursorPositions: [],
    cursorPos: false,
    buttonSize: 50,
    buttons: ['timer', 'screenShade', 'print', 'zoomMinus', 'zoomEqual', 'zoomPlus', 'snipRect', 'fullScreen', 'addPage'],

    draw: function () {
        if (un(this.canvas) || un(this.canvas.parentNode))
            return;
        var ctx = this.canvas.ctx;
        var rect = this.rect;
        this.cursorPositions = [];
        this.cursorPositions.push({
            shape: 'rect',
            dims: [0, 0, rect[2], rect[3]],
            cursor: draw.cursors.move1,
            func: this.dragStart
        });
        ctx.clearRect(0, 0, rect[2], rect[3]);

        roundedRect2(ctx, 2, 2, rect[2] - 4, rect[3] - 4, 10, 4, '#000', '#FFC');
        text({
            ctx: ctx,
            align: [0, 0],
            text: ['Tools'],
            fontSize: 25,
            color: '#333',
            rect: [0, 7, rect[2], 30],
            bold: true
        });

        for (var b = 0; b < this.buttons.length; b++) {
            var button = teach.buttons[this.buttons[b]];
            if (un(button))
                continue;
            var left = 15 + 57.5 / 2 + (b % this.columns) * 57.5;
            var top = 45 + 57.5 * Math.floor(b / this.columns);
            button.draw(ctx, left, top, this.buttonSize);
            this.cursorPositions.push({
                shape: 'rect',
                dims: [left, top, 50, 50],
                cursor: draw.cursors.pointer,
                func: button.click
            });
        }

        text({
            ctx: ctx,
            text: ['✖'],
            rect: [rect[2] - 30, 5, 25, 30],
            align: [0, 0],
            fontSize: 30,
            color: '#F00'
        });
        this.cursorPositions.push({
            shape: 'rect',
            dims: [rect[2] - 35, 0, 35, 30],
            cursor: draw.cursors.pointer,
            func: toolbar.hide
        });

        text({
            ctx: ctx,
            align: [0, 0],
            text: ['Background'],
            fontSize: 20,
            color: '#333',
            rect: [0, 222, rect[2], 30],
            bold: true
        });

        var size = 50;
        var padding = (rect[2] - 4 * size) / 2;
        var colors = [['#FFF', '#FFC', '#CFC', '#CCF'], ['#FCF', '#FC9', '#FCC', '?']];
        for (var r = 0; r < 2; r++) {
            var y = 260 + size * r;
            for (var c = 0; c < 4; c++) {
                var color = colors[r][c];
                var x = padding + size * c;
                if (color == '?') {
                    ctx.fillStyle = '#FFF';
                    ctx.fillRect(x, y, size, size);
                    text({
                        ctx: ctx,
                        rect: [x, y, size, size],
                        align: [0, 0],
                        fontSize: 0.6 * size,
                        text: ['?']
                    });
                } else {
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, size, size);
                }
                this.cursorPositions.push({
                    shape: 'rect',
                    dims: [x, y, size, size],
                    cursor: draw.cursors.pointer,
                    color: color
                });
            }
        }
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(padding, 260, 4 * size, 2 * size);
        ctx.beginPath();
        ctx.moveTo(padding, 260 + size);
        ctx.lineTo(padding + 4 * size, 260 + size);
        ctx.moveTo(padding + size, 260);
        ctx.lineTo(padding + size, 260 + 2 * size);
        ctx.moveTo(padding + 2 * size, 260);
        ctx.lineTo(padding + 2 * size, 260 + 2 * size);
        ctx.moveTo(padding + 3 * size, 260);
        ctx.lineTo(padding + 3 * size, 260 + 2 * size);
        ctx.stroke();
    },

    toggle: function () {
        if (!un(toolbar.canvas) && !un(toolbar.canvas.parentNode)) {
            toolbar.hide();
        } else {
            toolbar.show();
        }
    },
    show: function () {
        if (un(this.canvas))
            this.canvas = this.createCanvas(toolbar.rect);
        this.draw();
        showObj(this.canvas);
        addListenerMove(this.canvas, this.mouseMove);
        addListenerStart(this.canvas, this.mouseStart);
        if (!un(toolbarButton))
            toolbarButton.draw();
    },
    hide: function () {
        if (!un(toolbar.canvas)) {
            hideObj(toolbar.canvas);
            removeListenerMove(toolbar.canvas, toolbar.mouseMove);
            removeListenerStart(toolbar.canvas, toolbar.mouseStart)
            if (!un(toolbarButton))
                toolbarButton.draw();
        }
    },
    createCanvas: function (rect) {
        return newctx({
            rect: rect,
            vis: true,
            pe: true,
            z: 1000000000000000
        }).canvas;
    },

    mouseMove: function (e) {
        if (toolbar.dragging === true)
            return;
        toolbar.getCursorPos(e);
    },
    mouseStart: function (e) {
        toolbar.getCursorPos(e);
        var cursorPos = toolbar.cursorPos;
        if (typeof cursorPos !== 'object')
            return;
        if (cursorPos.color === '?') {
            var color = prompt('Enter background colour, by name or hex value (see: https://www.w3schools.com/cssref/css_colors.asp)');
            if (typeof color !== 'string' || color === '')
                return;
            draw.drawCanvas[0].style.backgroundColor = color;
        } else if (typeof cursorPos.color === 'string') {
            draw.drawCanvas[0].style.backgroundColor = cursorPos.color;
        } else if (typeof cursorPos.func === 'function') {
            cursorPos.func(cursorPos, e);
            toolbar.draw();
        }
    },
    getCursorPos: function (e) {
        toolbar.cursorPos = false;
        var bounds = e.target.getBoundingClientRect();
        if (e.touches) {
            if (un(e.touches[0]))
                return;
            var pageX = e.touches[0].pageX;
            var pageY = e.touches[0].pageY;
        } else {
            var pageX = e.clientX || e.pageX;
            var pageY = e.clientY || e.pageY;
        }
        var x = toolbar.rect[2] * (pageX - bounds.x) / bounds.width;
        var y = toolbar.rect[3] * (pageY - bounds.y) / bounds.height;
        for (var i = 0; i < toolbar.cursorPositions.length; i++) {
            cursorPos = toolbar.cursorPositions[i];
            if (draw.cursorPosHitTest(cursorPos, x, y) === true) {
                toolbar.cursorPos = toolbar.cursorPositions[i];
                toolbar.canvas.style.cursor = cursorPos.cursor;
            }
        }
    },

    dragStart: function (obj, e) {
        updateMouse(e);
        toolbar.dragOffset = [draw.canvasMouse[0] - toolbar.rect[0], draw.canvasMouse[1] - toolbar.rect[1]];
        toolbar.dragging = true;
        toolbar.canvas.style.cursor = draw.cursors.move2;
        addListenerMove(window, toolbar.dragMove);
        addListenerEnd(window, toolbar.dragStop);
    },
    dragMove: function (e) {
        updateMouse(e);
        var pos = [draw.canvasMouse[0] - toolbar.dragOffset[0], draw.canvasMouse[1] - toolbar.dragOffset[1]];
        toolbar.rect[0] = pos[0];
        toolbar.rect[1] = pos[1];
        resizeCanvas3(toolbar.canvas, pos[0], pos[1]);
    },
    dragStop: function (e) {
        delete toolbar.dragOffset;
        delete toolbar.dragging;
        toolbar.canvas.style.cursor = draw.cursors.move1;
        removeListenerMove(window, toolbar.dragMove);
        removeListenerEnd(window, toolbar.dragStop);
    }
};
var timer = {
    rect: [930, 0, 270, 150],
    mode: 'countdown',
    state: 'paused',
    time: 180,
    cursorPostions: [],
    cursorPos: false,
    getDigits: function () {
        var mins = Math.floor(this.time / 60);
        var secs = this.time % 60;
        var digits = [];
        digits[0] = Math.floor(mins / 10);
        digits[1] = mins % 10;
        digits[2] = Math.floor(secs / 10);
        digits[3] = secs % 10;
        return digits;
    },
    draw: function () {
        var ctx = this.canvas.ctx;
        var rect = this.canvas.rect;
        this.cursorPositions = [];
        ctx.clearRect(0, 0, this.rect[2], this.rect[3]);

        var color = this.time === 0 ? '#F99' : '#CFF';
        text({
            ctx: ctx,
            text: [''],
            rect: [2, 2, this.rect[2] - 4, this.rect[3] - 4],
            align: [0, 0],
            fontSize: 60,
            box: {
                type: 'loose',
                color: color,
                borderColor: '#000',
                borderWidth: 4,
                radius: 10
            }
        });
        this.cursorPositions.push({
            shape: 'rect',
            dims: [2, 2, this.rect[2] - 4, this.rect[3] - 4],
            cursor: draw.cursors.move1,
            func: this.dragStart
        });

        text({
            ctx: ctx,
            align: [0, 0],
            text: ['Timer'],
            fontSize: 25,
            color: '#000',
            rect: [0, 5, this.rect[2] - 30, 30],
            bold: true
        });

        var buttonRadius = 25;
        var buttonPos = [buttonRadius + 20, 30 + (this.rect[3] - 30) * 0.5];

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.arc(buttonPos[0], buttonPos[1], buttonRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#CCC';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.fill();
        ctx.stroke();

        if (this.state === 'paused') {
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(buttonPos[0] - 7.5, buttonPos[1] - 10);
            ctx.lineTo(buttonPos[0] + 9.5, buttonPos[1]);
            ctx.lineTo(buttonPos[0] - 7.5, buttonPos[1] + 10);
            ctx.lineTo(buttonPos[0] - 7.5, buttonPos[1] - 10);
            ctx.fill();
        } else if (this.state === 'playing') {
            ctx.fillStyle = '#000';
            ctx.fillRect(buttonPos[0] - 9, buttonPos[1] - 10, 6, 20);
            ctx.fillRect(buttonPos[0] + 3, buttonPos[1] - 10, 6, 20);
        }
        this.cursorPositions.push({
            shape: 'circle',
            dims: [buttonPos[0], buttonPos[1], buttonRadius],
            cursor: draw.cursors.pointer,
            func: this.togglePlay
        });

        var center = this.rect[2] * 0.6;
        var colonSpacing = 10;
        var spacing = 32;
        var xpos = [center - colonSpacing - 1.5 * spacing, center - colonSpacing - 0.5 * spacing, center + colonSpacing + 0.5 * spacing, center + colonSpacing + 1.5 * spacing];
        var digits = this.getDigits();

        text({
            ctx: ctx,
            text: [':'],
            rect: [center - 50, 30, 100, this.rect[3] - 30],
            align: [0, 0],
            fontSize: 60
        });
        text({
            ctx: ctx,
            text: [String(digits[0])],
            rect: [xpos[0] - 0.5 * spacing, 30, spacing, this.rect[3] - 30],
            align: [0, 0],
            fontSize: 60
        });
        text({
            ctx: ctx,
            text: [String(digits[1])],
            rect: [xpos[1] - 0.5 * spacing, 30, spacing, this.rect[3] - 30],
            align: [0, 0],
            fontSize: 60
        });
        text({
            ctx: ctx,
            text: [String(digits[2])],
            rect: [xpos[2] - 0.5 * spacing, 30, spacing, this.rect[3] - 30],
            align: [0, 0],
            fontSize: 60
        });
        text({
            ctx: ctx,
            text: [String(digits[3])],
            rect: [xpos[3] - 0.5 * spacing, 30, spacing, this.rect[3] - 30],
            align: [0, 0],
            fontSize: 60
        });

        if (this.state === 'paused') {
            var middle = 30 + (this.rect[3] - 30) / 2;
            var ypos = [middle - 30, middle + 30];
            ctx.fillStyle = '#666';
            for (var i = 0; i < 4; i++) {
                var x2 = xpos[i];
                var x1 = x2 - 10;
                var x3 = x2 + 10;

                // up arrow
                var y1 = ypos[0];
                var y2 = y1 - 17;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x3, y1);
                ctx.lineTo(x1, y1);
                ctx.fill();
                this.cursorPositions.push({
                    shape: 'circle',
                    dims: [x2, (y1 + y2) / 2, 15],
                    cursor: draw.cursors.pointer,
                    func: this.incrementTime,
                    digit: i,
                    inc: 1
                });

                // down arrow
                var y3 = ypos[1];
                var y4 = y3 + 17;
                ctx.beginPath();
                ctx.moveTo(x1, y3);
                ctx.lineTo(x2, y4);
                ctx.lineTo(x3, y3);
                ctx.lineTo(x1, y3);
                ctx.fill();
                this.cursorPositions.push({
                    shape: 'circle',
                    dims: [x2, (y3 + y4) / 2, 15],
                    cursor: draw.cursors.pointer,
                    func: this.incrementTime,
                    digit: i,
                    inc: -1
                });
            }
        }

        text({
            ctx: ctx,
            text: ['✖'],
            rect: [this.rect[2] - 30, 5, 25, 30],
            align: [0, 0],
            fontSize: 30,
            color: '#F00'
        });
        this.cursorPositions.push({
            shape: 'rect',
            dims: [this.rect[2] - 35, 0, 35, 40],
            cursor: draw.cursors.pointer,
            func: timer.hide
        });

    },

    toggle: function () {
        var page = file.resources[resourceIndex].pages[pIndex];
        if (un(this.canvas) || un(this.canvas.parentNode)) {
            this.show();
        } else {
            this.hide();
        }
    },
    togglePlay: function (obj) {
        if (timer.state === 'playing') {
            timer.state = 'paused';
            clearCorrectingInterval(timer.interval);
        } else {
            timer.state = 'playing';
            timer.interval = setCorrectingInterval(timer.playInterval, 1000);
        }
        timer.draw();
    },
    incrementTime: function (obj) {
        var inc = obj.inc * [600, 60, 10, 1][obj.digit];
        if (timer.time + inc < 0)
            return;
        if (timer.time + inc > 5999)
            return;
        timer.time += inc;
        timer.draw();
    },
    playInterval: function () {
        timer.time--;
        timer.draw();
        if (timer.time <= 0) {
            clearCorrectingInterval(timer.interval);
        }
    },

    show: function () {
        if (un(this.canvas)) {
            timer.canvas = this.createCanvas();
            timer.draw();
        }
        showObj(timer.canvas);
        addListenerMove(timer.canvas, timer.mouseMove);
        addListenerStart(timer.canvas, timer.mouseStart)
    },
    hide: function () {
        if (!un(timer.canvas)) {
            hideObj(timer.canvas);
            removeListenerMove(timer.canvas, timer.mouseMove);
            removeListenerStart(timer.canvas, timer.mouseStart)
        }
    },
    createCanvas: function () {
        return newctx({
            rect: timer.rect,
            vis: true,
            pe: true,
            z: 1000000000000000
        }).canvas;
    },

    mouseMove: function (e) {
        if (timer.dragging === true)
            return;
        timer.getCursorPos(e);
    },
    mouseStart: function (e) {
        timer.getCursorPos(e);
        var cursorPos = timer.cursorPos;
        if (typeof cursorPos === 'object' && typeof cursorPos.func === 'function')
            cursorPos.func(cursorPos, e);
    },
    getCursorPos: function (e) {
        timer.cursorPos = false;
        var bounds = e.target.getBoundingClientRect();
        if (e.touches) {
            if (un(e.touches[0]))
                return;
            var pageX = e.touches[0].pageX;
            var pageY = e.touches[0].pageY;
        } else {
            var pageX = e.clientX || e.pageX;
            var pageY = e.clientY || e.pageY;
        }
        var x = timer.rect[2] * (pageX - bounds.x) / bounds.width;
        var y = timer.rect[3] * (pageY - bounds.y) / bounds.height;
        for (var i = 0; i < timer.cursorPositions.length; i++) {
            cursorPos = timer.cursorPositions[i];
            if (draw.cursorPosHitTest(cursorPos, x, y) === true) {
                timer.cursorPos = timer.cursorPositions[i];
                timer.canvas.style.cursor = cursorPos.cursor;
            }
        }
    },

    dragStart: function (obj, e) {
        if (e.touches) {
            if (un(e.touches[0]))
                return;
            var x = e.touches[0].pageX;
            var y = e.touches[0].pageY;
        } else {
            var x = e.clientX || e.pageX;
            var y = e.clientY || e.pageY;
        }
        var bounds = canvas.getBoundingClientRect();
        x = (x - bounds.left) * (1225 / bounds.width);
        y = (y - bounds.top) * (750 / bounds.height);
        timer.dragOffset = [x - timer.rect[0], y - timer.rect[1]];
        timer.dragging = true;
        timer.canvas.style.cursor = draw.cursors.move2;
        addListenerMove(window, timer.dragMove);
        addListenerEnd(window, timer.dragStop);
    },
    dragMove: function (e) {
        if (e.touches) {
            if (un(e.touches[0]))
                return;
            var x = e.touches[0].pageX;
            var y = e.touches[0].pageY;
        } else {
            var x = e.clientX || e.pageX;
            var y = e.clientY || e.pageY;
        }
        var bounds = canvas.getBoundingClientRect();
        var x = (x - bounds.left) * (1225 / bounds.width);
        var y = (y - bounds.top) * (750 / bounds.height);
        var pos = [x - timer.dragOffset[0], y - timer.dragOffset[1]];
        timer.rect[0] = pos[0];
        timer.rect[1] = pos[1];
        resizeCanvas3(timer.canvas, pos[0], pos[1]);
    },
    dragStop: function (e) {
        delete timer.dragOffset;
        delete timer.dragging;
        timer.canvas.style.cursor = draw.cursors.move1;
        removeListenerMove(window, timer.dragMove);
        removeListenerEnd(window, timer.dragStop);
    },

    drawButton: function (ctx) {}

}

teach.keyboard = {
    font: 'Arial',
    hardClosed: false,
    hardOpen: false,
    backColor: '#F6F',
    active: false,
    capsMode: 'none',
    symbolKeysMode: false,
    buttonColors: {
        letter: ['#AFF', '#6CC'],
        number: ['#AFA', '#9C9'],
        symbol: ['#FB8', '#C95'],
        element: ['#FF0', '#CC0'],
        func: ['#CCC', '#CCC']
    },
    keys: [[
            '+', '-', '×', '÷', '=', '(', ')', '<', '>', '£', ':', '%'
        ], [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'delete'
        ], [
            'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'sqrt', 'root' /*,'enter'*/
        ], [
            'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'pow', 'frac'
        ], [
            'leftArrow', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', 'rightArrow'
        ]],
    keyMap: {
        leftArrow: {
            type: 'func',
            action: textEdit.arrowLeft,
            draw: function (ctx, rect, fontSize) {
                var keySize = rect[2];
                ctx.lineWidth = 2;
                ctx.strokeStyle = teach.keyboard.active === false ? colorA('#000', 0.5) : '#000';
                ctx.translate(rect[0], rect[1]);
                ctx.beginPath();
                ctx.moveTo(45 * keySize / 60, 30 * keySize / 60);
                ctx.lineTo(15 * keySize / 60, 30 * keySize / 60);
                ctx.lineTo(25 * keySize / 60, 20 * keySize / 60);
                ctx.moveTo(15 * keySize / 60, 30 * keySize / 60);
                ctx.lineTo(25 * keySize / 60, 40 * keySize / 60);
                ctx.stroke();
                ctx.translate(-rect[0], -rect[1]);
            }
        },
        rightArrow: {
            type: 'func',
            action: textEdit.arrowRight,
            draw: function (ctx, rect, fontSize) {
                var keySize = rect[2];
                ctx.lineWidth = 2;
                ctx.strokeStyle = teach.keyboard.active === false ? colorA('#000', 0.5) : '#000';
                ctx.translate(rect[0], rect[1]);
                ctx.beginPath();
                ctx.moveTo(15 * keySize / 60, 30 * keySize / 60);
                ctx.lineTo(45 * keySize / 60, 30 * keySize / 60);
                ctx.lineTo(35 * keySize / 60, 20 * keySize / 60);
                ctx.moveTo(45 * keySize / 60, 30 * keySize / 60);
                ctx.lineTo(35 * keySize / 60, 40 * keySize / 60);
                ctx.stroke();
                ctx.translate(-rect[0], -rect[1]);
            }
        },
        delete : {
            type: 'delete',
            colors: ['#F66', '#F33'],
            draw: function (ctx, rect, fontSize) {
                ctx.strokeStyle = teach.keyboard.active === false ? colorA('#000', 0.5) : '#000';
                ctx.lineWidth = fontSize * 0.05;
                ctx.save();
                ctx.translate(rect[0], rect[1]);
                var s = rect[2];
                ctx.beginPath();
                ctx.moveTo(0.8 * s, 0.29 * s);
                ctx.lineTo(0.8 * s, 0.71 * s);
                ctx.lineTo(0.4 * s, 0.71 * s);
                ctx.lineTo(0.2 * s, 0.5 * s);
                ctx.lineTo(0.4 * s, 0.29 * s);
                ctx.lineTo(0.8 * s, 0.29 * s);
                ctx.moveTo(0.45 * s, 0.4 * s);
                ctx.lineTo(0.65 * s, 0.6 * s);
                ctx.moveTo(0.65 * s, 0.4 * s);
                ctx.lineTo(0.45 * s, 0.6 * s);
                ctx.stroke();
                ctx.restore();
            }
        },
        caps: {
            type: 'func',
            draw: function (ctx, rect, fontSize) {
                if (teach.keyboard.capsMode === 'lock') {
                    ctx.strokeStyle = teach.keyboard.active === false ? colorA('#666', 0.5) : '#666';
                } else {
                    ctx.strokeStyle = teach.keyboard.active === false ? colorA('#000', 0.5) : teach.keyboard.capsMode === 'once' ? '#00F' : '#000';
                }
                ctx.lineWidth = teach.keyboard.capsMode === 'once' ? fontSize * 0.06 : fontSize * 0.04;
                ctx.save();
                ctx.translate(rect[0], rect[1]);
                var s = rect[2];
                ctx.beginPath();
                ctx.moveTo(0.5 * s, 0.25 * s);
                ctx.lineTo(0.76 * s, 0.55 * s);
                ctx.lineTo(0.62 * s, 0.55 * s);
                ctx.lineTo(0.62 * s, 0.8 * s);
                ctx.lineTo(0.38 * s, 0.8 * s);
                ctx.lineTo(0.38 * s, 0.55 * s);
                ctx.lineTo(0.24 * s, 0.55 * s);
                ctx.lineTo(0.5 * s, 0.25 * s);
                ctx.stroke();
                if (teach.keyboard.capsMode === 'lock') {
                    ctx.fillStyle = '#666';
                    ctx.fill();
                }
                ctx.restore();
            }
        },
        symbols: {
            type: 'func',
            draw: function (ctx, rect, fontSize) {
                var color = teach.keyboard.active === false ? colorA('#000', 0.5) : '#000';
                var txt = teach.keyboard.symbolKeysMode === true ? 'abc' : '%π';
                text({
                    ctx: ctx,
                    rect: [rect[0], rect[1], rect[2], rect[3]],
                    text: [txt],
                    align: [0, 0],
                    color: color,
                    fontSize: teach.keyboard.symbolKeysMode === true ? fontSize * 0.65 : fontSize * 0.75,
                    font: 'Arial'
                });
            }
        },
        enter: {
            type: 'func',
            draw: function (ctx, rect, fontSize) {
                ctx.strokeStyle = teach.keyboard.active === false ? colorA('#000', 0.5) : '#000';
                ctx.lineWidth = fontSize * 0.06;
                ctx.save();
                ctx.translate(rect[0], rect[1]);
                var s = rect[2];
                ctx.beginPath();
                ctx.moveTo(0.75 * s, 0.25 * s);
                ctx.lineTo(0.75 * s, 0.6 * s);
                ctx.lineTo(0.3 * s, 0.6 * s);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0.25 * s, 0.6 * s);
                ctx.lineTo(0.45 * s, 0.45 * s);
                ctx.moveTo(0.25 * s, 0.6 * s);
                ctx.lineTo(0.45 * s, 0.75 * s);
                ctx.stroke();
                ctx.restore();
            }
        },
        ' ': {
            colors: ['#EEE', '#CCC'],
            display: ['']
        },
        sqrt: {
            type: 'element',
            display: [['sqrt', ['']]],
            relFontSize: 0.6
        },
        root: {
            type: 'element',
            display: [['root', [''], ['']]],
            relFontSize: 0.6
        },
        pow: {
            type: 'element',
            display: ['<<font:algebra>>x', ['power', false, ['']]],
            relFontSize: 0.8
        },
        subs: {
            type: 'element',
            display: ['<<font:algebra>>x', ['subs', false, ['']]],
            relFontSize: 0.8
        },
        frac: {
            type: 'element',
            display: [['frac', [''], ['']]],
            relFontSize: 0.6
        },
        ln: {
            type: 'element',
            display: [['ln', ['<<font:algebra>>x']]],
            relFontSize: 0.6
        },
        log: {
            type: 'element',
            display: [['log', ['<<font:algebra>>x']]],
            relFontSize: 0.6
        },
        'e^x': {
            type: 'element',
            display: ['<<font:algebra>>e', ['power', false, ['']]],
            relFontSize: 0.8
        },
        hat: {
            type: 'element',
            display: [['hat', [''], ['']]],
            relFontSize: 0.8
        },
        recurring: {
            type: 'element',
            display: [['recurring', [''], ['']]],
            relFontSize: 0.8
        },
        vectorArrow: {
            type: 'element',
            display: [['vectorArrow', [''], ['']]],
            relFontSize: 0.8
        },
        colVector2d: {
            type: 'element',
            display: [['colVector2d', [''], ['']]],
            relFontSize: 0.6
        },
        colVector3d: {
            type: 'element',
            display: [['colVector3d', [''], ['']]],
            relFontSize: 0.4
        },
    },
    keySize: 45,
    fontSize: 32,
    padding: 5,

    toggleSize: function () {
        var size = teach.keyboard.keySize === 45 ? 60 : 45;
        teach.keyboard.setKeySize(size);
    },
    setKeySize: function (keySize) {
        this.keySize = keySize;
        this.padding = keySize * 5 / 45;
        this.fontSize = keySize * 32 / 45;
        if (un(this.canvas))
            return;
        var center = [this.canvas.data[100] + 0.5 * this.canvas.data[102], this.canvas.data[101] + 0.5 * this.canvas.data[103]];
        var rect = this.getRect();
        this.canvas.width = rect[2];
        this.canvas.height = rect[3];
        this.left = center[0] - 0.5 * rect[2];
        this.top = center[1] - 0.5 * rect[3];
        this.canvas.data[100] = this.left;
        this.canvas.data[101] = this.top;
        this.canvas.data[102] = rect[2];
        this.canvas.data[103] = rect[3];
        resizeCanvas(this.canvas);
        this.draw();
    },
    getRect: function () {
        var keys = teach.keyboard.keys;
        var keySize = teach.keyboard.keySize;
        var padding = teach.keyboard.padding;
        var maxRowKeyCount = 0;
        for (var i = 0; i < keys.length; i++)
            maxRowKeyCount = Math.max(maxRowKeyCount, teach.keyboard.getRowKeyCount(keys[i]));
        var width = maxRowKeyCount * (keySize + padding) + padding * 5;
        var topRect = [4 * padding, 2 * padding, width, 0.7 * keySize];
        var height = topRect[1] + topRect[3] + 3 * padding + keys.length * (keySize + padding);

        if (un(teach.keyboard.left))
            teach.keyboard.left = 1225 - width;
        if (un(teach.keyboard.top))
            teach.keyboard.top = 700 - height;
        var left = teach.keyboard.left;
        var top = teach.keyboard.top;

        return [left, top, width, height];
    },
    getRowKeyCount: function (row) {
        var count = 0;
        for (var i = 0; i < row.length; i++)
            count += row[i] === ' ' ? 4 : 1;
        return count;
    },
    createCanvas: function () {
        var rect = teach.keyboard.getRect();
        return newctx({
            rect: rect,
            vis: true,
            pe: true,
            z: 1000000000000000
        }).canvas;
    },
    draw: function () {
        if (this.active !== true && this.capsMode === 'once')
            this.capsMode = 'none';
        if (un(this.canvas)) {
            teach.keyboard.canvas = this.createCanvas();
            teach.keyboard.canvas.isKeyboard = true;
        }
        var ctx = this.canvas.ctx;
        var rect = this.getRect();
        var keySize = teach.keyboard.keySize;
        var padding = teach.keyboard.padding;
        var radius = keySize * 15 / 45;
        var lineWidth = keySize * 4 / 45;
        this.cursorPositions = [];
        ctx.clearRect(0, 0, rect[2], rect[3]);
        roundedRect(ctx, lineWidth / 2, lineWidth / 2, rect[2] - lineWidth, rect[3] - lineWidth, radius, lineWidth, '#000', this.backColor);
        this.cursorPositions.push({
            shape: 'rect',
            dims: [0, 0, rect[2], rect[3]],
            cursor: draw.cursors.move1,
            func: this.dragStart
        });

        var topRect = [4 * padding, 2 * padding, rect[2] - 8 * padding, 0.7 * keySize];
        var closeRectSize = keySize * 0.7;
        var rightPos = topRect[0] + topRect[2] - closeRectSize;

        var closeRect = [rightPos, topRect[1], closeRectSize, closeRectSize];
        text({
            ctx: ctx,
            text: [times],
            rect: closeRect,
            align: [0, 0],
            fontSize: keySize * 36 / 45,
            bold: true,
            color: '#F00',
            box: {
                type: 'loose',
                color: '#FFF',
                borderColor: '#000',
                borderWidth: 2,
                radius: 0
            }
        });
        this.cursorPositions.push({
            shape: 'rect',
            dims: closeRect,
            cursor: draw.cursors.pointer,
            func: this.hardHide
        });

        rightPos -= (2 * padding + closeRectSize);
        var resizeRect = [rightPos, topRect[1], closeRectSize, closeRectSize];
        text({
            ctx: ctx,
            text: [''],
            rect: resizeRect,
            align: [0, 0],
            fontSize: keySize * 36 / 45,
            bold: true,
            color: '#F00',
            box: {
                type: 'loose',
                color: '#FFF',
                borderColor: '#000',
                borderWidth: 2,
                radius: 0
            }
        });
        drawArrow({
            ctx: ctx,
            startX: resizeRect[0] + 0.25 * resizeRect[2],
            startY: resizeRect[1] + 0.75 * resizeRect[3],
            finX: resizeRect[0] + 0.75 * resizeRect[2],
            finY: resizeRect[1] + 0.25 * resizeRect[3],
            color: '#222',
            lineWidth: keySize * 2 / 45,
            doubleEnded: true,
            arrowLength: 0.2 * resizeRect[2],
            fillArrow: true,
            angleBetweenLinesRads: 0.7
        });
        this.cursorPositions.push({
            shape: 'rect',
            dims: resizeRect,
            cursor: draw.cursors.pointer,
            func: this.toggleSize
        });

        rightPos -= 2 * padding;
        ctx.strokeStyle = '#222';
        ctx.lineWidth = keySize * 3 / 45;
        ctx.beginPath();
        ctx.moveTo(topRect[0], topRect[1] + 0.5 * topRect[3]);
        ctx.lineTo(rightPos, topRect[1] + 0.5 * topRect[3]);
        ctx.closePath();
        ctx.stroke();
        var textWidth = 110 * keySize / 45;
        text({
            ctx: ctx,
            text: ['Keyboard'],
            rect: [(topRect[0] + rightPos) / 2 - textWidth / 2, topRect[1], textWidth, topRect[3]],
            align: [0, 0],
            fontSize: keySize * 20 / 45,
            color: '#222',
            box: {
                type: 'loose',
                color: this.backColor,
                borderColor: this.backColor
            }
        });

        var keys = this.keys;
        if (this.symbolKeysMode === true && !un(this.symbolKeys))
            keys = this.symbolKeys;
        for (var r = 0; r < keys.length; r++) {
            var row = keys[r];
            var x = teach.keyboard.align == 'left' ? padding * 3 : 0.5 * (rect[2] - teach.keyboard.getRowKeyCount(row) * (keySize + padding));
            var y = topRect[1] + topRect[3] + 2 * padding + r * (keySize + padding);
            for (var c = 0; c < row.length; c++) {
                var key = row[c];
                teach.keyboard.drawKey(ctx, key, x, y);
                var keyWidth = key === ' ' ? 4 * keySize + 3 * padding : keySize;
                if (teach.keyboard.active === true) {
                    this.cursorPositions.push({
                        shape: 'rect',
                        dims: [x - padding / 2, y - padding / 2, keyWidth + padding, keySize + padding],
                        cursor: draw.cursors.pointer,
                        key: key,
                        func: this.keyPress
                    });
                }
                x += keyWidth + padding;
            }
        }

    },
    drawKey: function (ctx, key, x, y) {
        var keyHeight = teach.keyboard.keySize;
        var keyWidth = key === ' ' ? 4 * keyHeight + 3 * teach.keyboard.padding : keyHeight;
        var font = teach.keyboard.font;
        var fontSize = teach.keyboard.fontSize;
        var keyType = teach.keyboard.getKeyType(key);
        var keyMap = teach.keyboard.keyMap[key];
        var colors = !un(keyMap) && !un(keyMap.colors) ? keyMap.colors : teach.keyboard.buttonColors[keyType];
        if (key === 'symbols' && teach.keyboard.symbolKeysMode === true)
            colors = ['#77F', '#77F'];
        var color = teach.keyboard.active === false ? colorA(colors[1], 0.5) : colors[0];
        var color2 = teach.keyboard.active === false ? colorA('#000', 0.5) : '#000';
        roundedRect(ctx, x + 1.5, y + 1.5, keyWidth - 3, keyHeight - 3, 5, 3, color2, color);
        if (teach.keyboard.capsMode !== 'none' && key.length === 1 && /^[a-z]$/.test(key) === true)
            key = key.toUpperCase();
        if (!un(keyMap) && !un(keyMap.display)) {
            if (!un(keyMap.relFontSize))
                fontSize *= keyMap.relFontSize;
            text({
                ctx: ctx,
                text: keyMap.display,
                font: font,
                fontSize: fontSize,
                rect: [x + 1.5, y + 1.5, keyWidth - 3, keyHeight - 3],
                align: [0, 0],
                color: color2
            });
        } else if (!un(keyMap) && typeof keyMap.draw === 'function') {
            text({
                ctx: ctx,
                text: [''],
                font: font,
                fontSize: fontSize,
                rect: [x + 1.5, y + 1.5, keyWidth - 3, keyHeight - 3],
                align: [0, 0],
                color: color2
            });
            keyMap.draw(ctx, [x, y, keyWidth, keyHeight], fontSize);
        } else {
            text({
                ctx: ctx,
                text: [key],
                font: font,
                fontSize: fontSize,
                rect: [x + 1.5, y + 1.5, keyWidth - 3, keyHeight - 3],
                align: [0, 0],
                color: color2
            });
        }

    },
    getKeyType: function (key) {
        if (!un(teach.keyboard.keyMap[key]) && !un(teach.keyboard.keyMap[key].type))
            return teach.keyboard.keyMap[key].type;
        if (typeof key === 'number' || '01234556789'.indexOf(key) > -1) {
            return 'number';
        } else if ('←→↑↓'.indexOf(key) > -1 || key.length > 1) {
            return 'element';
        } else if (key.length === 1 && 'abcdefghijklmnopqrstuvwxyz'.indexOf(key.toLowerCase()) > -1) {
            return 'letter';
        }
        return 'symbol';
    },
    toggle: function () {
        if (un(this.canvas) || un(this.canvas.parentNode)) {
            this.hardShow();
        } else {
            this.hardHide();
        }
    },
    show: function () {
        if (un(this.canvas)) {
            teach.keyboard.canvas = this.createCanvas();
            teach.keyboard.canvas.isKeyboard = true;
            teach.keyboard.draw();
        }
        showObj(teach.keyboard.canvas);
        addListenerMove(teach.keyboard.canvas, teach.keyboard.mouseMove);
        addListenerStart(teach.keyboard.canvas, teach.keyboard.mouseStart);
        teach.keyboard.button.draw();
    },
    hide: function () {
        if (!un(teach.keyboard.canvas)) {
            hideObj(teach.keyboard.canvas);
            removeListenerMove(teach.keyboard.canvas, teach.keyboard.mouseMove);
            removeListenerStart(teach.keyboard.canvas, teach.keyboard.mouseStart);
            teach.keyboard.button.draw();
        }
    },
    hardHide: function () {
        teach.keyboard.hardClosed = true;
        teach.keyboard.hardOpen = false;
        teach.keyboard.hide();
    },
    hardShow: function () {
        teach.keyboard.hardClosed = false;
        teach.keyboard.hardOpen = true;
        teach.keyboard.show();
    },

    moveAwayFromTextInput: function () {
        if (un(textEdit.obj))
            return;
        var obj = textEdit.obj;
        var textInputRect = obj.rect;
        if (!un(obj._floatingToolsRect)) {
            var left = Math.min(obj.rect[0], obj._floatingToolsRect[0]);
            var top = Math.min(obj.rect[1], obj._floatingToolsRect[1]);
            var right = Math.max(obj.rect[0] + obj.rect[2], obj._floatingToolsRect[0] + obj._floatingToolsRect[2]);
            var bottom = Math.max(obj.rect[1] + obj.rect[3], obj._floatingToolsRect[1] + obj._floatingToolsRect[3]);
            textInputRect = [left, top, right - left, bottom - top];
        }

        var keyboardRect = teach.keyboard.getRect();
        var k = {
            left: keyboardRect[0],
            top: keyboardRect[1],
            right: keyboardRect[0] + keyboardRect[2],
            bottom: keyboardRect[1] + keyboardRect[3]
        };

        var screenCanvasRect = draw.getScreenRectAsCanvasCoords();
        var s = {
            left: screenCanvasRect[0],
            top: screenCanvasRect[1],
            right: screenCanvasRect[0] + screenCanvasRect[2],
            bottom: screenCanvasRect[1] + screenCanvasRect[3]
        };
        if (teach.drawButtons.visible === true) {
            s.left = teach.drawButtons.side === 'left' ? -60 : 0;
            s.right = 1285;
        } else {
            s.left = 0;
            s.right = 1225;
        }

        if (!un(obj._path) && !un(obj._path._taskQuestion) && obj._path._taskQuestion.type === 'taskQuestion') {
            var taskQuestionRect = draw.taskQuestion.getRect(obj._path._taskQuestion);
            var taskQuestionCanvasPos1 = draw.drawPosToCanvasPos([taskQuestionRect[0], taskQuestionRect[1]]);
            var taskQuestionCanvasPos2 = draw.drawPosToCanvasPos([taskQuestionRect[0] + taskQuestionRect[2], taskQuestionRect[1] + taskQuestionRect[3]]);
            var t = {
                left: taskQuestionCanvasPos1[0],
                top: taskQuestionCanvasPos1[1],
                right: taskQuestionCanvasPos2[0],
                bottom: taskQuestionCanvasPos2[1]
            };

            var horizOverlap = (k.right < t.left || k.left > t.right) ? false : true;
            var vertOverlap = (k.bottom < t.top || k.top > t.bottom) ? false : true;
            if (horizOverlap === true && vertOverlap === true) {
                if (t.left - s.left > s.right - t.right) {
                    teach.keyboard.left = Math.max(s.left, t.left - keyboardRect[2] - 100);
                } else {
                    teach.keyboard.left = Math.min(s.right - keyboardRect[2], t.right + 100);
                }
                k.left = teach.keyboard.left;
                k.right = k.left + keyboardRect[2];
            }

        }

        var textInputCanvasPos1 = draw.drawPosToCanvasPos([textInputRect[0], textInputRect[1]]);
        var textInputCanvasPos2 = draw.drawPosToCanvasPos([textInputRect[0] + textInputRect[2], textInputRect[1] + textInputRect[3]]);
        var i = {
            left: textInputCanvasPos1[0],
            top: textInputCanvasPos1[1],
            right: textInputCanvasPos2[0],
            bottom: textInputCanvasPos2[1]
        };

        var horizOverlap = (k.right < i.left || k.left > i.right) ? false : true;
        var vertOverlap = (k.bottom < i.top || k.top > i.bottom) ? false : true;

        if (horizOverlap === true && vertOverlap === true) {
            if (i.left - s.left > s.right - i.right) {
                teach.keyboard.left = Math.max(s.left, i.left - keyboardRect[2] - 100);
            } else {
                teach.keyboard.left = Math.min(s.right - keyboardRect[2], i.right + 100);
            }
        }

        resizeCanvas3(teach.keyboard.canvas, teach.keyboard.left, teach.keyboard.top);
    },

    mouseMove: function (e) {
        if (teach.keyboard.dragging === true)
            return;
        teach.keyboard.getCursorPos(e);
    },
    mouseStart: function (e) {
        teach.keyboard.getCursorPos(e);
        var cursorPos = teach.keyboard.cursorPos;
        if (typeof cursorPos === 'object' && typeof cursorPos.func === 'function')
            cursorPos.func(cursorPos, e);
    },
    getCursorPos: function (e) {
        teach.keyboard.cursorPos = false;
        var bounds = e.target.getBoundingClientRect();
        if (e.touches) {
            if (un(e.touches[0]))
                return;
            var pageX = e.touches[0].pageX;
            var pageY = e.touches[0].pageY;
        } else {
            var pageX = e.clientX || e.pageX;
            var pageY = e.clientY || e.pageY;
        }
        var rect = teach.keyboard.getRect();
        var x = rect[2] * (pageX - bounds.x) / bounds.width;
        var y = rect[3] * (pageY - bounds.y) / bounds.height;
        for (var i = teach.keyboard.cursorPositions.length - 1; i >= 0; i--) {
            cursorPos = teach.keyboard.cursorPositions[i];
            if (draw.cursorPosHitTest(cursorPos, x, y) === true) {
                teach.keyboard.cursorPos = teach.keyboard.cursorPositions[i];
                teach.keyboard.canvas.style.cursor = cursorPos.cursor;
                break;
            }
        }
    },

    keyPress: function () {
        var key = teach.keyboard.cursorPos.key;
        if (key === 'caps') {
            teach.keyboard.capsMode = teach.keyboard.capsMode === 'none' ? 'once' : teach.keyboard.capsMode === 'once' ? 'lock' : 'none';
            teach.keyboard.draw();
        } else if (key === 'symbols') {
            teach.keyboard.symbolKeysMode = !teach.keyboard.symbolKeysMode;
            teach.keyboard.draw();
        } else {
            if (teach.keyboard.capsMode !== 'none' && key.length === 1 && /^[a-z]$/.test(key) === true)
                key = key.toUpperCase();
            textEdit.softKeyInput(key);
        }
        if (teach.keyboard.capsMode === 'once' && key !== 'caps') {
            teach.keyboard.capsMode = 'none';
            teach.keyboard.draw();
        }
    },

    dragStart: function (obj, e) {
        if (e.touches) {
            if (un(e.touches[0]))
                return;
            var x = e.touches[0].pageX;
            var y = e.touches[0].pageY;
        } else {
            var x = e.clientX || e.pageX;
            var y = e.clientY || e.pageY;
        }
        var bounds = canvas.getBoundingClientRect();
        x = (x - bounds.left) * (1225 / bounds.width);
        y = (y - bounds.top) * (750 / bounds.height);
        teach.keyboard.dragOffset = [x - teach.keyboard.left, y - teach.keyboard.top];
        teach.keyboard.dragging = true;
        teach.keyboard.canvas.style.cursor = draw.cursors.move2;
        teach.keyboard.screenRect = draw.getScreenRectAsCanvasCoords();
        addListenerMove(window, teach.keyboard.dragMove);
        addListenerEnd(window, teach.keyboard.dragStop);
    },
    dragMove: function (e) {
        if (e.touches) {
            if (un(e.touches[0]))
                return;
            var x = e.touches[0].pageX;
            var y = e.touches[0].pageY;
        } else {
            var x = e.clientX || e.pageX;
            var y = e.clientY || e.pageY;
        }
        var bounds = canvas.getBoundingClientRect();
        var x = (x - bounds.left) * (1225 / bounds.width);
        var y = (y - bounds.top) * (750 / bounds.height);

        var screenRect = teach.keyboard.screenRect;
        var keyboardWidth = teach.keyboard.canvas.data[102];
        var keyboardHeight = teach.keyboard.canvas.data[103];
        var xMin = screenRect[0] - keyboardWidth / 2;
        var xMax = screenRect[0] + screenRect[2] - keyboardWidth / 2;
        var yMin = screenRect[1] - keyboardHeight / 2;
        var yMax = screenRect[1] + screenRect[3] - keyboardHeight / 2;
        teach.keyboard.left = Math.min(xMax, Math.max(xMin, x - teach.keyboard.dragOffset[0]));
        teach.keyboard.top = Math.min(yMax, Math.max(yMin, y - teach.keyboard.dragOffset[1]));

        resizeCanvas3(teach.keyboard.canvas, teach.keyboard.left, teach.keyboard.top);
    },
    dragStop: function (e) {
        delete teach.keyboard.dragOffset;
        delete teach.keyboard.dragging;
        delete teach.keyboard.screenRect;
        teach.keyboard.canvas.style.cursor = draw.cursors.move1;
        removeListenerMove(window, teach.keyboard.dragMove);
        removeListenerEnd(window, teach.keyboard.dragStop);
    }
}
teach.keyboard.button = createCanvas(1225 - 50 - 90 - 43, 705, 40, 40, false, false, true, 1000000000);
teach.keyboard.button.buttonType = 'keyboard';
teach.keyboard.button.isKeyboard = true;
if (!un(screen.width) && screen.width <= 1000) {
    teach.keyboard.setKeySize(60);
}
teach.keyboard.button.draw = function () {
    var ctx = this.ctx;
    var size = 40;
    var vis = (!un(teach.keyboard) && !un(teach.keyboard.canvas) && !un(teach.keyboard.canvas.parentNode)) ? true : false;
    roundedRect2(ctx, 1, 1, size - 2, size - 2, 4, 2, '#000', teach.keyboard.backColor);
    if (vis === true)
        return;
    for (var r = 0; r < 3; r++) {
        var l = size * (12 * r + 9) / 50;
        for (var c = 0; c < 3; c++) {
            var t = size * (12 * c + 9) / 50;
            roundedRect(ctx, l, t, size * 8 / 50, size * 8 / 50, size * 3 / 50, size * 2 / 50, '#000', '#AFF');
        }
    }
}
teach.keyboard.button.draw();
teach.keyboard.button.click = function () {
    teach.keyboard.toggle();
}
addListener(teach.keyboard.button, teach.keyboard.button.click);

var printButton = createCanvas(1225 / 2 + 5 / 2, 705, 40, 40, true, false, true, 1000000000);
draw.printButton.draw(printButton.ctx, {
    type: 'printButton',
    rect: [1, 1, 38, 38],
    color: '#000',
    fillColor: '#FFF',
    lineWidth: 2,
    radius: 5
});
addListener(printButton, printResource);

function printResource() {
    var resource = file.resources[resourceIndex];
    if (false && divMode === true) {
        window.print();
    } else if (getResourceType() === 'task') {
        canvasPdf.getResourcePDF(file.resources[resourceIndex], 'task', 'download');
    } else if (resource.hasPDF == true) {
        Notifier.notify("Loading printable version in new tab.", '', '/Images/logoSmall.PNG');
        var tag = currFolder === 'teachFiles' ? '' : currFolder.slice(5) + '-';
        var url = '/i2/teachPrint.php?id=' + tag + encodeURIComponent(currFilename) + '&r=' + encodeURIComponent(resource.name);
        window.open(url, '_blank');
    } else if (!un(resource.pdf)) {
        Notifier.notify("Loading printable version in new tab.", '', '/Images/logoSmall.PNG');
        window.open(resource.pdf, '_blank')
    } else if (resource.allowCreatePDF == true) {
        if (un(window.createPDF)) {
            window.createPDF = function (us) {
                loadMakePDF(pagePDF2);
                function pagePDF2() {
                    var saveRelDrawPos = clone(draw.drawRelPos);
                    var saveTriggerNum = draw.triggerNum;
                    draw.triggerNum = 0;

                    var content = [];
                    var content2 = [];
                    var canvas = newctx({
                        rect: [0, 0, 1200, 1700],
                        vis: false
                    }).canvas;

                    var pages = file.resources[resourceIndex].pages;
                    for (var p = 0; p < pages.length; p++) {
                        var page = pages[p];
                        draw.drawRelPos = !un(draw.margins) ? draw.margins : [0, 0];

                        canvas.ctx.clear();
                        drawPathsToCanvas(canvas, page.paths, undefined, 1, '#FFF', true, true);
                        var imgData1 = canvas.toDataURL("image/jpeg");
                        content.push({
                            image: imgData1,
                            width: 565,
                            pageBreak: 'after'
                        });

                        canvas.ctx.clear();
                        drawPathsToCanvas(canvas, page.paths, undefined, 1, '#FFF', false, true, true);
                        var imgData2 = canvas.toDataURL("image/jpeg");
                        content2.push({
                            image: imgData2,
                            width: 565,
                            pageBreak: 'after'
                        });
                    }
                    content = content.concat(content2);
                    delete content[content.length - 1].pageBreak;

                    var url = 'www.MathsPad.co.uk';
                    //width x height = 595 x 842 pt
                    var pdf = {
                        pageMargins: [15, 10, 15, 35],
                        content: content,

                        footer: function (currentPage, pageCount) {
                            return {
                                margin: [15, 0, 15, 0],
                                columns: [{
                                        text: url,
                                        alignment: 'right',
                                        margin: [0, 0, 15, 0],
                                        fontSize: 10
                                    }
                                ]
                            };
                        }
                    };
                    pdfMake.createPdf(pdf).open();
                }
            };
        }
        window.createPDF();
    }

}

var presentButtons = {
    slidesButtons: [teach.keyboard.button, togglePageAppearButtonsButton, toolbarButton, prevButton, nextButton].reverse(),
    worksheetButtons: [toolbarButton, prevButton, nextButton].reverse(),
    taskButtons: [teach.keyboard.button, printButton, zoomMinus, zoomEqual, zoomPlus, prevButton, nextButton].reverse(),
    taskButtonsPupil: [teach.keyboard.button, zoomMinus, zoomEqual, zoomPlus, prevButton, nextButton].reverse(),

    hide: function () {

        hideObj(presentButtons.trayButtons);

    },
    show: function () {

        showObj(presentButtons.trayButtons);
        showObj(slideInfo.canvas);
    },
    arrange: function () {
        var resourceType = getResourceType();

        if (resourceType === 'task' && ['pupil', 'Do Task'].indexOf(draw.task.getMode()) > -1) {
            showObj(taskTrayCanvas);
        } else {
            hideObj(taskTrayCanvas);
        }

        presentButtons.hide();
        var trayButtons = resourceType === 'task' ? (userInfo.user === 'pupil' ? presentButtons.taskButtonsPupil : presentButtons.taskButtons) : resourceType === 'worksheet' ? presentButtons.worksheetButtons : presentButtons.slidesButtons;
        presentButtons.show();

        if (mode == 'edit' || (!un(pages[pIndex]) && pages[pIndex].type == 'taskPage'))
            return;

        if (trayButtons.indexOf(teach.keyboard.button) === -1 && ((!un(pages[pIndex]) && pages[pIndex].hasTextInput === true) || file.keyboard === 'gridKeyboard' || file.keys instanceof Array)) {
            trayButtons.push(teach.keyboard.button);
        }
        var page = pages[pIndex] || {};

        var enabled = page.pageVis !== false;
        for (var b = 0; b < trayButtons.length; b++) {
            var button = trayButtons[b];
            if (button === prevButton || button === nextButton)
                continue;
            button.style.opacity = enabled ? 1 : 0.5;
            button.style.pointerEvents = enabled ? 'auto' : 'none';
        }

        if (!un(page) && page.hideTrayButtonTypes instanceof Array) {
            for (var b = 0; b < trayButtons.length; b++)
                hideObj(trayButtons[b]);
            trayButtons = trayButtons.filter(function (button) {
                return typeof button.buttonType !== 'string' || page.hideTrayButtonTypes.indexOf(button.buttonType) === -1;
            });
        }

        var rows = 0,
        cols = 0;
        for (var b = trayButtons.length - 1; b >= 0; b--) {
            if (trayButtons[b] == keyboardButton1[0]) {

                if (!un(page) && page._hasTextInput !== true && page.hasTextInput !== true && file.keys instanceof Array === false) {
                    hideObj(keyboardButton1[0]);
                    hideObj(keyboardButton2[0]);
                    continue;
                }
            }
            var row = Math.floor(b / 2);
            var col = b % 2;
            rows = Math.max(rows, row);
            cols = Math.max(cols, col);
            var l2 = b == 0 ? 1225 - 50 : b == 1 ? 1225 - 50 - 70 - 43 : 1225 - 50 - 90 - 43 * b;
            resizeCanvas3(trayButtons[b], l2, 705);

            if (trayButtons[b] == keyboardButton1[0])
                resizeCanvas3(keyboardButton2[0], l2, 705);
            showObj(trayButtons[b]);

            /*if (b > trayButtons.length-4 && !un(page) && boolean(page.showTrayDrawButtons,true) == false) {
            hideObj(trayButtons[b]);
            } else {

            }*/

        }

        /*if (page.showTrayDrawButtons !== true) {
        for (var b = 0; b < leftButtons.length; b++) {
        var button = leftButtons[b];
        resizeCanvas3(button, -45, 5+45*b);
        if (button === colorPickerButton) resizeCanvas3(colorPicker, 0, 5+45*b);
        showObj(button);
        }
        }*/

        slideInfo.rect = [0, 700, teach.drawButtons.width * 2 + 1225, 50];

        presentButtons.update();
    },
    update: function () {
        if (pIndex == 0) {
            prevButton.fillColor = '#CCC';
            prevButton.style.pointerEvents = 'auto';
            prevButton.draw();
        } else {
            prevButton.fillColor = '#3FF';
            prevButton.style.pointerEvents = 'auto';
            prevButton.draw();
        }
        if (pIndex >= pages.length - 1) {
            nextButton.fillColor = '#CCC';
            nextButton.style.pointerEvents = 'auto';
            nextButton.draw();
        } else {
            nextButton.fillColor = '#3FF';
            nextButton.style.pointerEvents = 'auto';
            nextButton.draw();
        }
        var drawButtonsWidth = teach.drawButtons.visible === true ? teach.drawButtons.width : 0;
        slideInfo.clearRect(0, 0, teach.drawButtons.width * 2 + 1225, 750);
        slideInfo.fillStyle = slideInfo.color || '#CCC';

        slideInfo.strokeStyle = '#000';
        slideInfo.lineWidth = 1.5;

        var page = !un(file.resources[resourceIndex]) && !un(file.resources[resourceIndex].pages[pIndex]) ? file.resources[resourceIndex].pages[pIndex] : {};
        if (mode === 'present' && teach.drawButtons.visible === true && page.showTrayDrawButtons !== false && (un(queryObject.task) || queryObject.task === "")) {
            if (teach.drawButtons.side === 'left') {
                slideInfo.fillRect(0, 0, teach.drawButtons.width, 750);
                slideInfo.beginPath();
                slideInfo.moveTo(teach.drawButtons.width, 0);
                slideInfo.lineTo(teach.drawButtons.width, 750);
                slideInfo.stroke();
            } else {
                slideInfo.fillRect(teach.drawButtons.width + 1225, 0, teach.drawButtons.width, 750);
                slideInfo.beginPath();
                slideInfo.moveTo(teach.drawButtons.width + 1225, 0);
                slideInfo.lineTo(teach.drawButtons.width + 1225, 750);
                slideInfo.stroke();
            }
        }
        slideInfo.fillRect(teach.drawButtons.width, 700, 1225, 50);
        slideInfo.beginPath();
        slideInfo.moveTo(teach.drawButtons.width, 700);
        slideInfo.lineTo(teach.drawButtons.width + 1225, 700);
        slideInfo.stroke();
        if (typeof pIndex !== 'number')
            pIndex = Number(pIndex) || 0;

        text({
            ctx: slideInfo,
            rect: [teach.drawButtons.width + 1225 - 50 - 70 - 5, slideInfo.rect[1] + 5.5, 80, 38],
            text: ['<<bold:true>>' + String(pIndex + 1) + '/' + String(Math.max(pIndex + 1, pages.length))],
            align: [0, 0],
            box: {
                type: 'loose',
                color: '#CFF',
                borderWidth: 0.1
            }
        });
        slideInfo.strokeStyle = '#000';
        slideInfo.lineWidth = 2;
        slideInfo.beginPath();
        slideInfo.moveTo(teach.drawButtons.width + 1225 - 50 - 70 - 13, slideInfo.rect[1] + 6);
        slideInfo.lineTo(teach.drawButtons.width + 1225 - 50 - 70 - 13 + 90, slideInfo.rect[1] + 6);
        slideInfo.moveTo(teach.drawButtons.width + 1225 - 50 - 70 - 13, slideInfo.rect[1] + 43.5);
        slideInfo.lineTo(teach.drawButtons.width + 1225 - 50 - 70 - 13 + 90, slideInfo.rect[1] + 43.5);
        slideInfo.stroke();
    }
};
var resourceButtons = {
    buttons: [],
    left: 20,
    maxWidth: 560,
    maxPadding: 15,
    names: [],
    add: function () {
        var button = createCanvas(0, 700, 80, 45, false, false, true, 100000);
        button.index = resourceButtons.buttons.length;
        resourceButtons.buttons.push(button);
    },
    getNames: function () {
        var names = [];
        for (var b = 0; b < file.resources.length; b++) {
            var resource = file.resources[b];
            names.push(typeof resource.displayName === 'string' ? resource.displayName : typeof resource._newname === 'string' ? resource._newname : resource.name);
        }
        return names;
    },
    resetPadding: function () {
        resourceButtons.padding = 15;
        return;

        resourceButtons.names = resourceButtons.getNames();
        //console.log(clone(resourceButtons.buttons));
        //console.log(clone(resourceButtons.names));
        var totalWidth = resourceButtons.getButtonsTotalTextWidth();
        //console.log('totalWidth:',totalWidth);
        var maxWhiteSpace = resourceButtons.maxWidth - totalWidth;
        var maxPadding = maxWhiteSpace / resourceButtons.buttons.length;
        resourceButtons.padding = Math.min(resourceButtons.maxPadding, maxPadding / 2);
        //console.log('maxPadding/2:',maxPadding/2);
        //console.log('resourceButtons.maxPadding:',resourceButtons.maxPadding);
    },
    getButtonsTotalTextWidth: function () {
        var width = 0;
        for (var b = 0; b < file.resources.length.length; b++) {
            if (un(file.resources[b]))
                resourceButtons.add();

            width += resourceButtons.getButtonWidth(b);
        }
        return width;
    },
    getButtonWidth: function (index) {
        var button = resourceButtons.buttons[index];
        button.isLink = file.resources[index].type == 'link' ? true : false;
        var resource = file.resources[index];
        var name = typeof resource.displayName === 'string' ? resource.displayName : typeof resource._newname === 'string' ? resource._newname : resource.name;
        var measure = text({
            ctx: draw.hiddenCanvas.ctx,
            align: [0, 0],
            rect: [0, 0, 1000, 40],
            text: [name]
        });
        button.textWidth = measure.totalTextWidth;
        if (button.isLink === true)
            button.textWidth += 25;
        return button.textWidth;
    },
    draw: function (index) {
        if (typeof index !== 'number' || index < 0 || index > 12)
            return;
        while (un(resourceButtons.buttons[index]))
            resourceButtons.add();
        var button = resourceButtons.buttons[index];
        var resource = file.resources[index];
        var name = typeof resource.displayName === 'string' ? resource.displayName : typeof resource._newname === 'string' ? resource._newname : resource.name;
        button.textbookMenuButton = false;
        resourceButtons.getButtonWidth(index);
        button.width = button.textWidth + 2 * resourceButtons.padding;

        var left = 10;
        for (var b = 0; b < index; b++)
            left += resourceButtons.buttons[b].width - 7;

        if (index == resourceIndex) {
            button.style.zIndex = 1000000099;
            var top = 698.5;
        } else {
            button.style.zIndex = 1000000000 - index;
            var top = 700.75;
        }
        button.data[100] = left;
        button.data[101] = top;
        button.data[102] = button.width;
        resizeCanvas3(button, left, top, button.width, undefined);

        var color = index == resourceIndex ? '#FFF' : '#BBB';

        if (mode === 'edit') {
            var resource = file.resources[index];
            var type = getResourceType(resource);
            if (type === 'worksheet') {
                color = index == resourceIndex ? '#FF6' : '#FFE';
            } else if (type === 'slides') {
                color = index == resourceIndex ? '#6FF' : '#EFF';
            } else if (type === 'link') {
                color = '#FEF';
            }
        }

        var ctx = button.ctx;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.moveTo(1, 0);
        ctx.lineTo(1, 30);
        ctx.arc(11, 30, 10, Math.PI, Math.PI / 2, true);
        ctx.lineTo(button.width - 11, 40);
        ctx.arc(button.width - 11, 30, 10, Math.PI / 2, 0, true);
        ctx.lineTo(button.width - 1, 0);
        ctx.fill();
        ctx.stroke();
        var textWidth = button.width;
        if (button.isLink === true) {
            draw.linkIcon.draw(ctx, {
                rect: [button.width - 30, 12, 16, 16],
                lineWidth: 2,
                color: '#000'
            });
            textWidth -= 20;
        }
        text({
            ctx: ctx,
            align: [0, 0],
            rect: [0, 0, textWidth, 40],
            text: [name]
        });

        button.index = index;
        showObj(button);
        addListener(button, resourceButtons.click);
    },
    arrange: function () {
        //if (taskData.taskID > -1) return;
        if (un(resourceButtons.padding) || resourceButtons.getNames() !== resourceButtons.names)
            resourceButtons.resetPadding();
        for (var b = 0; b < resourceButtons.buttons.length; b++) {
            hideObj(resourceButtons.buttons[b]);
            removeListener(resourceButtons.buttons[b], resourceButtons.click);
        }
        for (var b = 0; b < file.resources.length; b++) {
            resourceButtons.draw(b);
        }
    },
    click: function (e) {
        updateMouse(e);
        var index = e.target.index;
        if (e.button == 2 && mode == 'edit') { // && index == Number(resourceIndex)) {
            resourceTabsRightClickMenu.resourceIndex = index;
            //resourceTabsRightClickMenu.position(draw.mouse[0],draw.mouse[1]);
            resourceTabsRightClickMenu.show();
        } else {
            showResource(index);
        }
    }
};

/****************************/
/*			BEGIN			*/
/****************************/

function obfuscate(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        charCode = String("000" + charCode).slice(-3);
        bytes.push(charCode);
    }
    return bytes.join('');
}

presentMode(true, false);
if (id !== "") {
    if (!un(jsonTeachFileExists) && (jsonTeachFileExists == true || jsonTeachFileExists == 1)) {
        loadTeachJSONFile(id);
    } else {
        loadTeachFile(id, pIndex);
    }
} else if (!un(queryObject.starter) && queryObject.starter !== "") {
    draw.starter.load(queryObject.starter, queryObject.r, queryObject.p);
} else if (!un(queryObject.task) && queryObject.task !== "") {
    draw.task.loadTask(queryObject.task);
} else {
    showResource(resourceIndex, pIndex);
    if ((userInfo.user == 'super' || (userInfo.user === 'teacher' && userInfo.sID === 923)) && startMode == 'edit') {
        window.interval = setInterval(function () {
            if (!un(window.toggleMode)) {
                clearInterval(window.interval);
                window.toggleMode();
            }
        }, 50);
    }
}

// -------------------------------------------- //
//                 Loading Pages                //
// -------------------------------------------- //

function loadTeachJSONFile(filename) {
    if ((userInfo.user == 'super' || (userInfo.user === 'teacher' && userInfo.sID === 923)) && mode == 'edit' && isFileSaved() === false) {
        if (confirm('OK to discard?') == false)
            return;
    }
    if (un(filename)) {
        filename = prompt('Filename:');
    }
    if (filename.toLowerCase().indexOf('test') > -1) {
        if (userInfo.user == "pupil") {
            window.location = '/notFound.php';
            return;
        }
        if (obfuscate(pass3box.value) !== '116104114101101112111105110116049052') {
            pass3box.value = '';
            pass3box.filename = filename;
            pass3box.show();
            return;
        }
    }
    if (pass3box.loaded === true)
        pass3box.hide();
    currFilename = filename;
    document.title = currFilename;
    currFilenameLocal = '';
    clearDrawPaths();
    pages = [{}
    ];
    updateURL();

    var xmlhttp = new XMLHttpRequest();
    // xmlhttp.open("GET", currFolder + '/' + filename + '.json?' + new Date().getTime(), true);
    xmlhttp.open("GET", '../js/' + filename + '.json?' + new Date().getTime(), true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
			if (xmlhttp.status == 200) {
				file = JSON.parse(this.responseText);
				//console.log('file loaded from json', file);
				loadTeachJSONFile2();
			} else if (xmlhttp.status == 404) {
				loadTeachFile(filename, pIndex);
			}
        }
    }
    xmlhttp.send();
}
function loadTeachJSONFile2() {
    if (typeof draw === 'object')
        draw.fileIsAStarter = false;
    if (interactiveTools instanceof Array && interactiveTools.indexOf(currFilename) > -1)
        file._pupilAccess = true;
    if (file.keyboard === 'gridKeyboard') {
        teach.keyboard.keys = [[
                '7', '8', '9', 'm', 'frac', 'pow', 'sqrt', 'delete'
            ], [
                '4', '5', '6', '(', ')', 'a', 'b', 'c'
            ], [
                '1', '2', '3', '=', '<', '>', lessThanEq, moreThanEq
            ], [
                '0', '+', '-', '.', 'y', 'x', 'leftArrow', 'rightArrow'
            ]];
        teach.keyboard.setKeySize(60);
        teach.keyboard.align = 'left';
        teach.keyboard.font = 'algebra';
        teach.keyboard.left = 0;
    } else if (file.keys instanceof Array) {
        teach.keyboard.keys = file.keys;
        teach.keyboard.setKeySize(!un(screen.width) && screen.width <= 1000 ? 60 : 45);
        delete teach.keyboard.align;
        teach.keyboard.font = 'Arial';
    } else {
        teach.keyboard.keys = [[
			'+', '-', '×', '÷', '=', '(', ')', '<', '>', '£', ':', '%'
		], [
			'1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'delete'
		], [
			'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'sqrt', 'root'
		], [
			'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'pow', 'frac'
		], [
			'leftArrow', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', 'rightArrow'
		]];
        teach.keyboard.setKeySize(!un(screen.width) && screen.width <= 1000 ? 60 : 45);
        delete teach.keyboard.align;
        teach.keyboard.font = 'Arial';
    }

    if (userInfo.user === 'pupil' && file.free != true && userInfo.schemesAccess == 0 && userInfo.allPupilsFullAccess !== 1 && file._pupilAccess !== true) {
        window.location.replace("https://www.mathspad.co.uk/onlyTeachers.php");
    }
    if (file.test === true) {
        if (userInfo.verified !== 0 || (userInfo.user !== 'super' && userInfo.user !== 'teacher')) {
            window.location.replace("https://www.mathspad.co.uk/index.php");
        }
    }
	revive(file);
    for (var r = 0; r < file.resources.length; r++) {
        var resource = file.resources[r];
        resource._type = getResourceType(resource);
        if (resource._type == "link")
            continue;
        if (un(resource.pages))
            resource.pages = [];
        resource._multiPage = resource._type !== 'slides' ? true : false;
        for (var p = 0; p < resource.pages.length; p++) {
            var page = resource.pages[p];
            if (divMode === true)
                draw.div.createPageDiv(page);
            draw.convertLoadedPaths(page.paths);
            if (!un(page.screenShade)) {
                if (page.screenShade.visible === true && !un(page.screenShade.dims)) {
                    var present = false;
                    for (var p2 = 0; p2 < page.paths.length; p2++) {
                        var path = page.paths[p2];
                        if (!un(path.obj) && !un(path.obj[0]) && path.obj[0].type === 'screenShade2') {
                            present = true;
                            break;
                        }
                    }
                    if (present === false) {
                        page.paths.push({
                            selectable: false,
                            obj: [{
                                    type: 'screenShade2',
                                    rect: clone(page.screenShade.dims)
                                }
                            ]
                        });
                    }
                }
                delete page.screenShade;
            }

            if (!un(page.starterQuestions)) {
                for (var s = 0; s < page.starterQuestions.length; s++) {
                    var qInfo = page.starterQuestions[s];
                    qInfo.resourceIndex = r;
                    qInfo.pageIndex = p;
                    draw.starterQuestion.load(qInfo);
                }
            }

            if (un(resource.name) || (resource.type !== 'slides' && resource.name.toLowerCase().indexOf('slide') == -1 && resource.name.toLowerCase().indexOf('task') == -1)) {
                if (un(page.margins)) {
                    page.margins = [20, 20];
                }
            }

            for (var p2 = 0; p2 < page.paths.length; p2++) {
                var path = page.paths[p2];
                path._page = page;
                for (var o = 0; o < path.obj.length; o++) {
                    var obj = path.obj[o];
                    obj._page = page;
                    obj._path = path;
                }
            }

            for (var p2 = 0; p2 < page.paths.length; p2++) {
                var path = page.paths[p2];
                if (un(path.isInput))
                    continue;
                page._hasInput = true;
                if (path.isInput.type == 'text') {
                    page._hasTextInput = true;
                    var obj = path.obj[0];
                    if (obj.type == 'text2') {
                        if (mode == 'edit') {
                            if (!un(obj.ans))
                                obj.text = clone(obj.ans[0]);
                            obj.ansIndex = 0;
                            delete obj._checked;
                        }
                    }

                }
            }
            page._loaded = 0;
            page._viewed = false;

            if (userInfo.user == "none" || userInfo.verified == 1 || (userInfo.user === 'pupil' && userInfo.schemesAccess == 0 && userInfo.allPupilsFullAccess !== 1 && file._pupilAccess !== true)) {
                var pageVis = false;
                if (file.free === true) {
                    pageVis = true;
                } else if (resource.free === true || (resource.free instanceof Array && resource.free.includes(pIndex) == true)) {
                    pageVis = true;
                }
                if (pageVis == false) {
                    var canvas = newctx({
                        rect: [0, 0, 1200, 1700],
                        z: 1000,
                        pE: false,
                        vis: false
                    }).canvas;
                    canvas.style.opacity = 0.65;
                    var color = colorA('#000', 0.65);

                    if (currFilename.toLowerCase().indexOf('test') == -1) {
                        var paths = page.paths.concat({
                            obj: [{
                                    type: 'rect',
                                    startPos: [0, 0],
                                    finPos: [1200, 1700],
                                    thickness: 1,
                                    color: color,
                                    fillColor: color
                                }
                            ]
                        });
                        for (var p2 = paths.length - 1; p2 >= 0; p2--) {
                            var path = paths[p2];
                            if (!un(path.appear) && path.appear.startVisible !== true)
                                paths.splice(p, 1);
                        }
                    } else {
                        var paths = [{
                                obj: [{
                                        type: 'rect',
                                        startPos: [0, 0],
                                        finPos: [1200, 1700],
                                        thickness: 1,
                                        color: color,
                                        fillColor: color
                                    }
                                ]
                            }
                        ];
                    }
                    drawPathsToCanvas(canvas, paths, 0, 1);
                    resource.pages[p] = {
                        pageVis: false,
                        canvas: canvas,
                        _loaded: 1
                    };
                }
            }

        }
    }

    document.title = !un(file.title) && file.title !== "" ? file.title + ' - MathsPad Teach' : 'MathsPad Teach';

    if (un(file.resources[resourceIndex]))
        resourceIndex = 0;
    if (un(file.resources[resourceIndex].pages[pIndex]))
        pIndex = 0;

    showResource(resourceIndex, pIndex);

    if ((userInfo.user == 'super' || (userInfo.user === 'teacher' && userInfo.sID === 923)) && startMode == 'edit') {
        window.interval = setInterval(function () {
            if (!un(window.toggleMode)) {
                window.toggleMode();
                clearInterval(window.interval);
            }
        }, 50);
    }
	
	function revive(item) {
		if (item instanceof Array) {
			for (var i = 0; i < item.length; i++) {
				item[i] = revive(item[i]);
			}
		} else if (typeof item === 'object') {
			for (var key in item) {
				if (item.hasOwnProperty(key) !== true) continue;
				item[key] = revive(item[key]);
			}
		} else if (typeof item === 'string' && item.indexOf('function(') === 0) {
			try {
				item = item.replace(/\\"/g, '"');
				item = new Function('return ' + item)();
			} catch(error) {}
		} else if (item === '#Infinity') {
			item = Infinity;
		} else if (item === '#-Infinity') {
			item = -Infinity;
		}
		return item;
	}
}

function loadTeachFileScript(url, callback, errorCallback, params) {
    if (un(errorCallback))
        errorCallback = function () {};
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = "UTF-8";
    var timestamp = new Date().getTime();
    script.src = url + '?' + timestamp;
    script.params = params;
    script.onload = function () {
        if (!un(callback))
            callback(this.params);
    };
    script.onreadystatechange = function () {
        if (this.readyState === 'complete') {
            callback(this.params);
        }
    }
    script.onerror = function () {
        if (!un(errorCallback))
            errorCallback(this.params);
    };
    head.appendChild(script);
}
function isFileSaved() {
    if (file.resources.length === 1 && pages.length === 1 && arraysEqual(pages[0].paths, []) === true && arraysEqual(draw.path, []) === true)
        return true;
    if (un(window.savedFileData) || typeof getFileSaveData !== 'function')
        return false;
    var data = getFileSaveData();
    return isEqual(window.savedFileData, data);
}
function loadTeachFile(filename, startPageIndex) {
    if ((userInfo.user == 'super' || (userInfo.user === 'teacher' && userInfo.sID === 923)) && mode == 'edit' && isFileSaved() === false) {
        if (confirm('OK to discard?') == false)
            return;
    }
    if (un(filename)) {
        filename = prompt('Filename:');
    }
    if (filename.toLowerCase().indexOf('test') > -1) {
        if (userInfo.user == "pupil") {
            window.location = '/notFound.php';
            return;
        }
        if (obfuscate(pass3box.value) !== '116104114101101112111105110116049052') {
            pass3box.value = '';
            pass3box.filename = filename;
            pass3box.show();
            return;
        }
    }
    if (pass3box.loaded === true)
        pass3box.hide();

    currFilename = filename;
    document.title = currFilename;
    clearDrawPaths();
    pages = [{}
    ];
    pIndex = startPageIndex || 0;
    window.loadCount = 0;
    loadTeachFileScript(currFolder + "/" + filename + "/_file.js", loadTeachFile2);

    updateURL();
}
function loadTeachFile2() {
    pages = [];
    var fileVersion = pageData instanceof Array ? 0 : !un(pageData.version) ? pageData.version : 1;
    if (typeof draw === 'object')
        draw.fileIsAStarter = false;

    // convert file type to 2:
    if (fileVersion == 0) {
        pageData = {
            resources: [{
                    pageCount: pageData.length,
                    name: 'Slides'
                }
            ],
            title: currFilename,
            filename: currFilename,
            version: 0
        };
    } else if (fileVersion == 1) {
        pageData.resources = [{
                pageCount: pageData.pages.length,
                name: 'Slides'
            }
        ];
        if (un(pageData.filename))
            pageData.filename = currFilename;
        if (un(pageData.title))
            pageData.title = currFilename;
        pageData.version = 1;
    }

    file = pageData;
    if (interactiveTools instanceof Array && interactiveTools.indexOf(currFilename) > -1)
        file._pupilAccess = true;
    if (file.keyboard === 'gridKeyboard') {
        teach.keyboard.keys = [[
                '7', '8', '9', 'm', 'frac', 'pow', 'sqrt', 'delete'
            ], [
                '4', '5', '6', '(', ')', 'a', 'b', 'c'
            ], [
                '1', '2', '3', '=', '<', '>', lessThanEq, moreThanEq
            ], [
                '0', '+', '-', '.', 'y', 'x', 'leftArrow', 'rightArrow'
            ]];
        teach.keyboard.setKeySize(60);
        teach.keyboard.align = 'left';
        teach.keyboard.font = 'algebra';
        teach.keyboard.left = 0;
    } else if (file.keys instanceof Array) {
        teach.keyboard.keys = file.keys;
        teach.keyboard.setKeySize(!un(screen.width) && screen.width <= 1000 ? 60 : 45);
        delete teach.keyboard.align;
        teach.keyboard.font = 'Arial';
    } else {
        teach.keyboard.keys = [[
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "=", "delete"
            ], [
                "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "(", ")"
            ], [
                "a", "s", "d", "f", "g", "h", "j", "k", "l", "?", "enter"
            ], [
                "caps", "z", "x", "c", "v", "b", "n", "m", ",", ".", "leftArrow", "rightArrow"
            ], [
                "symbols", "pow", "frac", "sqrt", " ", "+", "-", times, divide
            ]];
        teach.keyboard.symbolKeys = [[
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "=", "delete"
            ], [
                "<", ">", "≤", "≥", "+", "-", times, divide, "≈", "≠", "(", ")"
            ], [
                "∩", "∪", "£", "$", "°", "%", ":", "±", "!", "?", "enter"
            ], [
                "colVector2d", "subs", "∠", "∞", "∝", pi, theta, "/", ",", ".", "leftArrow", "rightArrow"
            ], [
                "symbols", "pow", "frac", "sqrt", " ", "root", "hat", "recurring", "vectorArrow"
            ]];
        teach.keyboard.setKeySize(!un(screen.width) && screen.width <= 1000 ? 60 : 45);
        delete teach.keyboard.align;
        teach.keyboard.font = 'Arial';
    }

    if (userInfo.user === 'pupil' && file.free != true && userInfo.schemesAccess == 0 && userInfo.allPupilsFullAccess !== 1 && file._pupilAccess !== true) {
        window.location.replace("https://www.mathspad.co.uk/onlyTeachers.php");
    }
    if (file.test === true) {
        if (userInfo.verified !== 0 || (userInfo.user !== 'super' && userInfo.user !== 'teacher')) {
            window.location.replace("https://www.mathspad.co.uk/index.php");
        }
    }
    for (var r = 0; r < file.resources.length; r++) {
        var resource = file.resources[r];
        resource._type = getResourceType(resource);
        if (resource._type == "link")
            continue;
        resource._multiPage = resource._type !== 'slides' ? true : false;
        resource.pages = [];
        for (var p = 0; p < resource.pageCount; p++) {
            resource.pages[p] = {};
            if (divMode === true) {
                draw.div.createPageDiv(resource.pages[p]);
            }
        }
    }

    document.title = !un(file.title) && file.title !== "" ? file.title + ' - MathsPad Teach' : 'MathsPad Teach';

    if (un(file.resources[resourceIndex]))
        resourceIndex = 0;
    if (un(file.resources[resourceIndex].pages[pIndex]))
        pIndex = 0;

    showResource(resourceIndex, pIndex);
    if ((userInfo.user == 'super' || (userInfo.user === 'teacher' && userInfo.sID === 923)) && startMode == 'edit') {
        window.interval = setInterval(function () {
            if (!un(window.toggleMode)) {
                window.toggleMode();
                clearInterval(window.interval);
            }
        }, 50);
    }

}
function showResource(index, startPageIndex) {
    if (!un(file.resources[resourceIndex]))
        file.resources[resourceIndex]._lastPageIndex = pIndex;
    if (un(file.resources[index]))
        index = 0;
    var resourceType = getResourceType(file.resources[index]);
    if (resourceType == "link") {
        if (!un(file.resources[index].filename)) {
            loadTeachFile(file.resources[index].filename);
        } else {
            window.open(file.resources[index].url, "_blank");
        }
        return;
    }
    hidePage();
    resourceIndex = index;

    if (un(file.resources[resourceIndex].pages))
        file.resources[resourceIndex].pages = [{}
        ];
    pages = file.resources[resourceIndex].pages;
    pIndex = startPageIndex || file.resources[resourceIndex]._lastPageIndex || 0;

    //console.log(resourceIndex,pIndex,file.resources[resourceIndex].pages[pIndex]);

    if (!un(file.resources[resourceIndex].pages[pIndex]._loaded)) {
        showPage(pIndex);
    } else {
        loadPage(resourceIndex, pIndex);
    }

    if (multiPage === true)
        draw.multiPage.off();
    if (multiPage === true && resourceType !== 'slides') {
        draw.multiPage.on();
        //draw.multiPage.scrollToPage(pIndex);
    }

    drawCanvasPaths();
	teach.drawButtons.update();
	
    resourceButtons.arrange();
    if (typeof previewSlides !== 'undefined')
        previewSlides(true);
}
function loadPage(r, p) {
    //console.log(r,p);
    //console.log(arguments.callee.caller.name);

    if (un(file.resources[r]))
        return;
    if (un(file.resources[r].pages[p]))
        file.resources[r].pages[p] = {};
    var page = file.resources[r].pages[p];

    if (!un(page._loaded)) {
        loadNextPage();
        return;
    }
    function loadNextPage() {
        if (!un(file.resources[r].pages[p + 1])) {
            requestIdleCallback(function () {
                loadPage(r, p + 1);
            });
            return;
        }
        var nextResource = r + 1;
        while (!un(file.resources[nextResource]) && file.resources[nextResource].type == "link") {
            nextResource++;
        }
        if (!un(file.resources[nextResource])) {
            requestIdleCallback(function () {
                loadPage(nextResource, 0);
            });
            return;
        }
        for (var r2 = 0; r2 < file.resources.length; r2++) {
            var resource = file.resources[r2];
            if (resource.type == "link")
                continue;
            for (var p2 = 0; p2 < resource.pages.length; p2++) {
                if (un(resource.pages[p2]))
                    continue;
                var page = resource.pages[p2];
                if (un(page._loaded)) {
                    requestIdleCallback(function () {
                        loadPage(r2, p2);
                    });
                    return;
                }
            }
        }
        for (var r2 = 0; r2 < file.resources.length; r2++) {
            var resource = file.resources[r2];
            if (!un(resource._newname)) {
                resource.name = resource._newname;
            }
        }
        if (typeof previewSlides !== 'undefined')
            previewSlides(true);

        if (typeof getFileSaveData !== 'undefined') {
            window.savedFileData = getFileSaveData();
            //console.log('savedFileData',window.savedFileData);
        }

        draw.task.initialise();
    }

    var resource = file.resources[r];
    var page = resource.pages[p];
    if (page.type == 'taskPage') {
        var url = 'pages/' + page.url + '.js';
        window.p = {};
    } else {
        var filenum = String(p);
        while (filenum.length < 3)
            filenum = '0' + filenum;
        var filename = !un(resource._filename) ? resource._filename : currFilename;
        var url = file.version == 2 ? currFolder + '/' + filename + '/' + resource.name + '_' + filenum + '.js' : 'slides/slidePages/' + filename + '_' + filenum + '.js';
        //console.log(url,clone(resource));
    }

    loadTeachFileScript(url, function (indices) {
        if (page.type == 'taskPage') {
            var data = clone(window.p);
            delete window.p;
        } else {
            var data = clone(fileData);
            delete window.fileData;
        }

        if (data instanceof Array) {
            page.paths = data;
        } else if (typeof data == 'object') {
            loop(data, function (obj, key) {
                if (['dims', 'key', 'path', 'type', 'pen'].includes(key))
                    return;
                if (typeof obj == 'string' && obj.indexOf('function ()') == 0) {
                    page[key] = eval(obj);
                } else {
                    page[key] = obj;
                }
            }, false);
        }

        /*for (var p = 0; p < page.paths.length; p++) {
        var path = page.paths[p];
        if (typeof path.starterQuestionID === 'number') {
        starterQuestions.load(path);
        if (un(path.obj)) path.obj = [{type:'text2',text:[''],rect:[0,0,50,50]}];
        };
        }*/
        draw.convertLoadedPaths(page.paths);

        if (!un(page.screenShade)) {
            if (page.screenShade.visible === true && !un(page.screenShade.dims)) {
                var present = false;
                for (var p2 = 0; p2 < page.paths.length; p2++) {
                    var path = page.paths[p2];
                    if (!un(path.obj) && !un(path.obj[0]) && path.obj[0].type === 'screenShade2') {
                        present = true;
                        break;
                    }
                }
                if (present === false) {
                    page.paths.push({
                        selectable: false,
                        obj: [{
                                type: 'screenShade2',
                                rect: clone(page.screenShade.dims)
                            }
                        ]
                    });
                }
            }
            delete page.screenShade;
        }

        if (!un(page.starterQuestions)) {
            for (var s = 0; s < page.starterQuestions.length; s++) {
                var qInfo = page.starterQuestions[s];
                qInfo.resourceIndex = indices[0];
                qInfo.pageIndex = indices[1];
                draw.starterQuestion.load(qInfo);
            }
            //delete page.starterQuestions;
        }

        if (un(file.resources[indices[0]].name) || (file.resources[indices[0]].type !== 'slides' && file.resources[indices[0]].name.toLowerCase().indexOf('slide') == -1 && file.resources[indices[0]].name.toLowerCase().indexOf('task') == -1)) {
            if (un(page.margins)) {
                page.margins = [20, 20];
                /*for (var p = 0; p < page.paths.length; p++) {
                var path = page.paths[p];
                //repositionPath(path, 20, 20, 0, 0);
                for (var o = 0; o < path.obj.length; o++) {
                var obj = path.obj[o];
                if (!un(draw[obj.type]) && !un(draw[obj.type].scale)) {
                draw[obj.type].scale(obj,1160/1050,[20,20])
                }
                }
                }*/
            }
        }

        for (var p = 0; p < page.paths.length; p++) {
            var path = page.paths[p];
            for (var o = 0; o < path.obj.length; o++) {
                var obj = path.obj[o];
                obj._page = page;
                /*if (obj.type === 'video') {
                console.log(obj,page);
                }*/

            }
        }

        for (var p = 0; p < page.paths.length; p++) {
            var path = page.paths[p];
            if (un(path.isInput))
                continue;
            page._hasInput = true;
            if (path.isInput.type == 'text') {
                page._hasTextInput = true;
                var obj = path.obj[0];
                if (obj.type == 'text2') {
                    if (mode == 'edit') {
                        if (!un(obj.ans))
                            obj.text = clone(obj.ans[0]);
                        obj.ansIndex = 0;
                        delete obj._checked;
                    } else {
                        //draw.keyboard.showButton();
                        //taskData.hasKeyboard = true;
                    }
                }

            }
            /* else if (path.isInput.type == 'select') {
            for (var o = 0; o < path.obj.length; o++) {
            var obj = path.obj[o];
            if (obj.type == 'table2') {
            obj.isInput = path.isInput;
            for (var r = 0; r < obj.cells.length; r++) {
            for (var c = 0; c < obj.cells[r].length; c++) {
            var cell = obj.cells[r][c];
            cell.toggle = cell.ans == true ? true : false;
            delete cell.ans;
            }
            }
            }
            }
            }*/
        }
        page._loaded = 0;
        page._viewed = false;

        if (userInfo.user == "none" || userInfo.verified == 1 || (userInfo.user === 'pupil' && userInfo.schemesAccess == 0 && userInfo.allPupilsFullAccess !== 1 && file._pupilAccess !== true)) {
            var resource = file.resources[indices[0]];
            var pageVis = false;
            if (file.free === true) {
                pageVis = true;
            } else if (resource.free === true || (resource.free instanceof Array && resource.free.includes(indices[1]) == true)) {
                pageVis = true;
            }
            if (pageVis == false) {
                var canvas = newctx({
                    rect: [0, 0, 1200, 1700],
                    z: 1000,
                    pE: false,
                    vis: false
                }).canvas;
                canvas.style.opacity = 0.65;
                var color = colorA('#000', 0.65);

                if (currFilename.toLowerCase().indexOf('test') == -1) {
                    var paths = page.paths.concat({
                        obj: [{
                                type: 'rect',
                                startPos: [0, 0],
                                finPos: [1200, 1700],
                                thickness: 1,
                                color: color,
                                fillColor: color
                            }
                        ]
                    });
                    for (var p = paths.length - 1; p >= 0; p--) {
                        var path = paths[p];
                        if (!un(path.appear) && path.appear.startVisible !== true)
                            paths.splice(p, 1);
                    }
                } else {
                    var paths = [{
                            obj: [{
                                    type: 'rect',
                                    startPos: [0, 0],
                                    finPos: [1200, 1700],
                                    thickness: 1,
                                    color: color,
                                    fillColor: color
                                }
                            ]
                        }
                    ];
                }
                drawPathsToCanvas(canvas, paths, 0, 1);
                file.resources[indices[0]].pages[indices[1]] = {
                    pageVis: false,
                    canvas: canvas,
                    _loaded: 1
                };
            }
        }
        /*if (divMode === true) {
        drawPathsToCanvas(page._drawCanvas[0],page.paths);
        createPageAnswerCanvas(page)
        }*/

        if (indices[1] == pIndex && indices[0] == resourceIndex) {
            presentButtons.update();
            showPage();
            //if (typeof previewSlides !== 'undefined') previewSlides();
        }

        loadNextPage();
        //if (mode == 'edit') window.previewSlides();
    }, undefined, [r, p]);
}
function createPageAnswerCanvas(page) {
    page._answerCanvas = createCanvas(draw.drawArea[0], draw.drawArea[1], draw.drawArea[2], draw.drawArea[3], false, false, false, draw.zIndex + 8);
    page._answerCanvas.setAttribute('class', 'drawDivCanvas');
    updatePageAnswerCanvas(page);
}
function updatePageAnswerCanvas(page) {
    page._answerCanvas.ctx.clear();
    var ansPaths = [];
    for (var p2 = 0; p2 < page.paths.length; p2++) {
        if (!un(page.paths[p2].trigger) && arraysEqual(page.paths[p2].trigger, [false])) {
            ansPaths.push(page.paths[p2]);
        }
    }
    drawPathsToCanvas(page._answerCanvas, ansPaths, 1);
}

function updateURL() {
    if (history.pushState) {
        var params = [];
        if (currFilename !== '') {
            var tag = currFolder === 'teachFiles' ? '' : currFolder.slice(5) + '-';
            params.push(['id', tag + currFilename]);
            if (resourceIndex !== 0)
                params.push(['r', resourceIndex]);
            if (pIndex !== 0)
                params.push(['p', pIndex]);
        } else if (!un(draw.task) && !un(draw.task.taskData) && !un(draw.task.taskData.taskKey)) {
            params.push(['task', draw.task.taskData.taskKey]);
        } else if (typeof queryObject.starter === 'string') {
            params.push(['starter', queryObject.starter]);
            if (resourceIndex !== 0)
                params.push(['r', resourceIndex]);
            if (pIndex !== 0)
                params.push(['p', pIndex]);
        }
        if (teachVersionLive === false)
            params.push(['v', teachVersion]);
        if (mode == 'edit')
            params.push(['mode', 'edit']);
        for (var key in queryObject) {
            if (queryObject.hasOwnProperty(key) === false)
                continue;
            if (['id', 'mode', 'r', 'p', 'v', 'beta', 'task', 'starter'].indexOf(key) > -1)
                continue;
            if (typeof queryObject[key] === 'function')
                continue;
            params.push([key, String(queryObject[key])]);
        }
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        for (var p = 0; p < params.length; p++) {
            if (p === 0) {
                newurl += '?';
            } else {
                newurl += '&';
            }
            newurl += params[p][0] + '=' + encodeURIComponent(params[p][1]);
        }

        window.history.pushState({
            path: newurl
        }, '', newurl);
    }
}

var canvasPdf = {
    // https://pdfkit.org/docs/guide.pdf

    // KNOWN ISSUES:
    // compass2 doesn't work: setTransform?
    // placeValueBlocks do not work - need to preload as image

    fontdir: 'teach' + teachVersion + '/fonts',
    fonts: {
        'Hobo': {
            src: 'hobo-webfont.ttf'
        },
        'segoePrint': {
            src: 'segeo-print-webfont.ttf'
        },
        'segoePrint-bold': {
            src: 'Segoe-Print-Bold.ttf'
        },
        'smileymonster': {
            src: 'smileymonster.ttf'
        },
        'Arial': {
            src: 'Arial.ttf'
        },
        'Arial-bold': {
            src: 'Arial-Bold.ttf'
        },
        'Arial-italic': {
            src: 'Arial-Italic.ttf'
        },
        'Arial-bold-italic': {
            src: 'Arial-Bold-Italic.ttf'
        },
        'Georgia': {
            src: 'Georgia.ttf'
        },
        'Georgia-bold': {
            src: 'Georgia-Bold.ttf'
        },
        'Georgia-italic': {
            src: 'Georgia-Italic.ttf'
        },
        'Georgia-bold-italic': {
            src: 'Georgia-Bold-Italic.ttf'
        },
        'TimesNewRoman': {
            src: 'times-new-roman.ttf'
        },
        'Cambria Math': {
            src: 'Cambria Math.ttf'
        }
        //'TimesNewRoman-bold':{src:'times-new-roman-bold.ttf'}
    },
    loadFonts: function (callback) {
        var toLoad = 0;
        var count = 0;
        for (var key in canvasPdf.fonts) {
            var font = canvasPdf.fonts[key];
            toLoad++;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", canvasPdf.fontdir + '/' + font.src, true);
            xhr.responseType = "arraybuffer";
            xhr.font = font;
            xhr.onload = function () {
                var arrayBuffer = this.response; // Note: not oReq.responseText
                if (arrayBuffer)
                    this.font.arrayBuffer = arrayBuffer;
                fontLoaded();
            };
            xhr.send(null);
        }
        function fontLoaded() {
            count++;
            if (count < toLoad)
                return;
            //console.log('fonts',canvasPdf.fonts);
            if (typeof callback === 'function')
                callback();
        }
    },
    preloadResourceImages: function (resource, callback) {
        var toLoad = [];
        if (un(resource))
            resource = file.resources[resourceIndex];
        for (var p = 0; p < resource.pages.length; p++) {
            var page = resource.pages[p];
            for (var p2 = 0; p2 < page.paths.length; p2++) {
                var path = page.paths[p2];
                for (var o = 0; o < path.obj.length; o++) {
                    var obj = path.obj[o];
                    if (obj.type === 'image') {
                        if (!un(obj._image))
                            continue;
                        if (toLoad.indexOf(obj.src) > -1 || (!un(draw.loadedImages) && !un(draw.loadedImages[obj.src])))
                            continue;
                        toLoad.push({
                            src: obj.src,
                            obj: obj
                        });
                    } else if (obj.type === 'questionImage' && obj.images instanceof Array) {
                        for (var i = 0; i < obj.images.length; i++) {
                            var image = obj.images[i];
                            if (image._img instanceof Image)
                                continue;
                            if (toLoad.indexOf(image.src) > -1 || (!un(draw.loadedImages) && !un(draw.loadedImages[image.src])))
                                continue;
                            toLoad.push({
                                src: image.src,
                                obj: obj,
                                index: i
                            });
                        }
                    }
                }
            }
        }
        console.log('toLoad', toLoad);
        if (toLoad.length === 0) {
            if (typeof callback === 'function')
                callback();
            return;
        }
        var count = 0;
        for (var i = 0; i < toLoad.length; i++) {
            var image = new Image;
            image.loadInfo = toLoad[i];
            image.onload = function (e) {
                var img = e.target;
                if (un(draw.loadedImages))
                    draw.loadedImages = {};
                draw.loadedImages[img.getAttribute("src")] = e.target;
                if (img.loadInfo.obj.type === 'questionImage') {
                    img.loadInfo.obj.images[img.loadInfo.index]._img = img;
                }
                console.log('loaded', img.getAttribute("src"));
                count++;
                if (count >= toLoad.length) {
                    console.log('draw.loadedImages', draw.loadedImages);
                    if (typeof callback === 'function')
                        callback();
                }
            }
            image.relativeSrc = toLoad[i].src;
            image.src = toLoad[i].src;
        }
    },
    load: function (callback) {
        if (un(callback))
            callback = canvasPdf.getPdf;
        loadScript('canvas2pdf/pdfkit.standalone.js', function () {
            loadScript('canvas2pdf/blob-stream.js', function () {
                loadScript('canvas2pdf/canvas2pdf2.js', function () {
                    canvasPdf.loadFonts(callback);
                });
            });
        });
    },

    getResourcePDF: function (resource, style, serverOrDownload, options) {
        if (un(resource))
            resource = file.resources[resourceIndex];
        if (typeof resource === 'number')
            resource = file.resources[resource];
        if (un(style))
            style = getResourceType(resource);
        if (un(serverOrDownload))
            serverOrDownload = 'download';

        if (typeof canvas2pdf === 'undefined') {
            canvasPdf.load(function () {
                canvasPdf.getResourcePDF(resource, style, serverOrDownload, options);
            });
            return;
        }
        canvasPdf.preloadResourceImages(resource, function () {
            canvasPdf.getResourcePDF2(resource, style, serverOrDownload, options);
        });
    },
    getResourcePDF2: function (resource, style, serverOrDownload, options) {
        if (un(options))
            options = {};
        var docOptions = {};
        docOptions.size = !un(options.size) ? options.size : 'A4';
        if (options.protect !== false) {
            docOptions.ownerPassword = 'kjbekrjbnlejbl';
            docOptions.permissions = {
                printing: 'highResolution',
                modifying: false,
                copying: false,
                annotating: false
            }
        }
        var ctx = new canvas2pdf.PdfContext(blobStream(), docOptions);
        ctx.canvas = {};
        for (var key in canvasPdf.fonts) {
            var font = canvasPdf.fonts[key];
            ctx.doc.registerFont(key, font.arrayBuffer);
        }
        var saveTriggerNum = draw.triggerNum;
        draw.triggerNum = 0;

        //console.log(resource,style,serverOrDownload);

        if (typeof style === 'function') {
            style(ctx);
        } else if (style === 'task') {
            canvasPdf.drawTask(ctx, resource, options);
        } else if (style === 'slides') {
            canvasPdf.drawSlides(ctx, resource, options);
        } else if (style === 'textbook' || (typeof options === 'object' && options.textbookMode === true)) {
            canvasPdf.drawTextbook(ctx, resource, options);
        } else {
            canvasPdf.drawWorksheet(ctx, resource, options);
        }

        draw.triggerNum = saveTriggerNum;
        var title = file.title;
        if (un(title) || title == '')
            title = currFilename;
        ctx.doc.info.Title = title;
        ctx.doc.info.Author = 'MathsPad';
        ctx.stream.on('finish', function () {
            var blob = ctx.stream.toBlob('application/pdf');

            if (serverOrDownload === 'server') {
                //var filename = currFolder + '/' + currFilename + '/' + 'canvas2pdf_output' + '.pdf';
				var folder = currFolder + '/' + currFilename;
                var filename = resource.name;
                var data = new FormData();
                data.append('data', blob);
                data.append('folder', folder);
                data.append('filename', filename);

                console.log(folder, filename, data);

                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        console.log(this.status, this.responseText);
                        if (this.status !== 200) {
                            // handle error
                        }
                    }
                }
                xhr.open('POST', 'teach_savePDF2.php', true);
                xhr.send(data);
            } else {
                var fileURL = URL.createObjectURL(blob);
                window.open(fileURL, '_blank');
            }
        });
        ctx.end();
    },
    drawWorksheet: function (ctx, resource, options) {
        if (un(options))
            options = {};
        canvasPdf.greyscale = options.greyscale === true;
        var pw = 612,
        ph = 792; // A4 page size in PDF points (72 per inch)
        if (options.size instanceof Array) {
            pw = options.size[0];
            ph = options.size[1];
        }
        var cw = 1200,
        ch = 1700;
        var margin = 30 * (pw / 612);
        var scale = Math.min((pw - 2 * margin) / cw, (ph - 2 * margin) / ch);
        var offset = [(pw - cw * scale) / (2 * scale), (ph - ch * scale) / (2 * scale)];

        var saveNotesOverlay = draw.notesOverlay;
        draw.notesOverlay = false;

        var hasAnswers = false;
        for (var p = 0; p < resource.pages.length; p++) {
            var page = resource.pages[p];

            for (var p2 = 0; p2 < page.paths.length; p2++) {
                var path = page.paths[p2];
                delete path.selected;
                if (hasAnswers === false && !un(path.trigger) && path.trigger.length === 1 && path.trigger[0] === false)
                    hasAnswers = true;
            }

            if (options.answersOnly === true)
                continue;

            if (p > 0)
                ctx.doc.addPage();
            ctx.clearRect(0, 0, 3000, 3000);
            ctx.scale(scale, scale);
            ctx.translate(offset[0], offset[1]);
            drawPathsToCanvas(ctx, page.paths);

            if (options.textbookMode === true) {
                console.log('generating page ' + p);
                var pageNumber = p + 1;
                if (!un(options.pageNumberOffset))
                    pageNumber += options.pageNumberOffset;
                if (pageNumber > 0 && (un(options.maxPageNumber) || pageNumber <= options.maxPageNumber)) {
                    var align = pageNumber % 2 === 0 ? -1 : 1;
                    var footerY = 1640;
                    if (typeof options.footerOffset === 'number')
                        footerY += options.footerOffset;
                    drawPathsToCanvas(ctx, [{
                                obj: [{
                                        type: 'text2',
                                        rect: [0, footerY, 1200, 60],
                                        align: [align, 1],
                                        fontSize: 20,
                                        italic: true,
                                        text: [String(pageNumber)]
                                    }
                                ]
                            }
                        ]);
                }
            } else if (options.showFooter !== false) {
                var footerY = 1640;
                if (typeof options.footerOffset === 'number')
                    footerY += options.footerOffset;
                if (resource.pages.length > 1) {
                    drawPathsToCanvas(ctx, [{
                                obj: [{
                                        type: 'text2',
                                        rect: [0, footerY, 1200, 60],
                                        align: [-1, 1],
                                        fontSize: 20,
                                        text: ['Page ' + (p + 1)]
                                    }
                                ]
                            }
                        ]);
                }
                if (options.showUrl !== false) {
                    drawPathsToCanvas(ctx, [{
                                obj: [{
                                        type: 'text2',
                                        rect: [0, footerY, 1200, 60],
                                        align: [1, 1],
                                        fontSize: 20,
                                        text: ['www.MathsPad.co.uk']
                                    }
                                ]
                            }
                        ]);
                }
            }
            /*drawPathsToCanvas(ctx,[{obj:[{
            type:'text2',
            rect:[0, 0, 1200, 1700],
            text:[],
            box:{
            type:'loose',
            borderColor:'#00F',
            borderWidth:2,
            color:'none'
            }

            }]}]);*/

        }

        draw.triggerNum = 1;
        if (hasAnswers === true && options.showAnswers !== false) {
            for (var p = 0; p < resource.pages.length; p++) {
                var page = resource.pages[p];
                if (p > 0 || options.answersOnly !== true)
                    ctx.doc.addPage();
                ctx.clearRect(0, 0, 3000, 3000);
                ctx.scale(scale, scale);
                ctx.translate(offset[0], offset[1]);
                drawPathsToCanvas(ctx, page.paths);
                if (options.showFooter !== false) {
                    var footerY = 1640;
                    if (typeof options.footerOffset === 'number')
                        footerY += options.footerOffset;
                    if (resource.pages.length > 1) {
                        drawPathsToCanvas(ctx, [{
                                    obj: [{
                                            type: 'text2',
                                            rect: [0, footerY, 1200, 60],
                                            align: [-1, 1],
                                            fontSize: 20,
                                            text: ['Page ' + (p + 1)]
                                        }
                                    ]
                                }
                            ]);
                    }
                    drawPathsToCanvas(ctx, [{
                                obj: [{
                                        type: 'text2',
                                        rect: [0, footerY, 1200, 60],
                                        align: [0, 1],
                                        fontSize: 20,
                                        color: '#F00',
                                        bold: true,
                                        text: ['Answers']
                                    }
                                ]
                            }
                        ]);
                    if (options.showUrl !== false) {
                        drawPathsToCanvas(ctx, [{
                                    obj: [{
                                            type: 'text2',
                                            rect: [0, footerY, 1200, 60],
                                            align: [1, 1],
                                            fontSize: 20,
                                            text: ['www.MathsPad.co.uk']
                                        }
                                    ]
                                }
                            ]);
                    }
                }
            }
        }

        draw.notesOverlay = saveNotesOverlay;
    },
    drawTextbook: function (ctx, resource, options) {
        /*
        canvasPdf.getResourcePDF(file.resources[0],'worksheet','download',{
        textbookMode:true,
        showAnswers:true,
        greyscale:true,
        pageNumberOffset:-5,
        maxPageNumber:342,
        footerOffset:30,
        size:[560,792],
        oddPageOffset:[10,0],
        evenPageOffset:[-10,0],
        footerChapters:[{startPage:6,endPage:37,name:'Place Value & Decimals'},
        ]
        });
        canvasPdf.getResourcePDF(file.resources[0],'worksheet','download',{
        textbookMode:true,
        showAnswers:true, 		// for answers book
        greyscale:true,   		// for answers book - make everything else greyscale
        pageNumberOffset:-5,   	// how many pages at the beginning to ignore for page numbers (ie. contents pages)
        maxPageNumber:342,		// max page number after which not to include page number (ie. back cover)
        footerOffset:30,		// vertical offset for footer, larger to move downwards
        size:[560,792],			// page size in PDF points (72 per inch) default is [612, 792] = A4
        oddPageOffset:[10,0],	// translate odd pages to the right
        evenPageOffset:[-10,0],	// translate even pages to the left
        footerChapters:[{startPage:6,endPage:37,name:'Place Value & Decimals'},		// include centered chapter name in footer (only on JP localhost)
        ]
        });
         */
        if (un(options))
            options = {};
        var pw = 612,
        ph = 792; // A4 page size in PDF points (72 per inch)
        if (options.size instanceof Array) {
            pw = options.size[0];
            ph = options.size[1];
        }
        var cw = 1200,
        ch = 1700;
        var margin = 30 * (pw / 612);
        var scale = Math.min((pw - 2 * margin) / cw, (ph - 2 * margin) / ch);
        var offset = [(pw - cw * scale) / (2 * scale), (ph - ch * scale) / (2 * scale)];
        var footerPageNumberLeftAlign = options.footerPageNumberLeftAlign === 'odd' || options.footerPageNumberLeftAlign === 1 ? 1 : 0;

        for (var p = 0; p < resource.pages.length; p++) {
            var page = resource.pages[p];
            var pageOffset = (p % 2 === 0 && options.evenPageOffset instanceof Array) ? options.evenPageOffset : (p % 2 === 1 && options.oddPageOffset instanceof Array) ? options.oddPageOffset : [0, 0];
            console.log('generating page ' + (p + 1));
            if (p > 0)
                ctx.doc.addPage();
            ctx.clearRect(0, 0, 3000, 3000);
            ctx.scale(scale, scale);
            ctx.translate(offset[0] + pageOffset[0] * scale, offset[1] + pageOffset[1] * scale);

            for (var p2 = 0; p2 < page.paths.length; p2++) {
                var path = page.paths[p2];
                delete path.selected;
                if (path.notesOverlay === true)
                    continue;
                if (!un(path.trigger) && path.trigger.length === 1 && path.trigger[0] === false) {
                    if (options.showAnswers !== true)
                        continue;
                    canvasPdf.greyscale = false;
                } else {
                    canvasPdf.greyscale = options.greyscale === true;
                }
                for (var o = 0; o < path.obj.length; o++) {
                    if (un(path.obj[o]))
                        continue;
                    var obj = path.obj[o];
                    drawObjToCtx(ctx, path, obj, 1, 1, 0, 0, 1);
                }
            }
            var pageNumber = p + 1;
            if (!un(options.pageNumberOffset))
                pageNumber += options.pageNumberOffset;
            if (pageNumber > 0 && (un(options.maxPageNumber) || pageNumber <= options.maxPageNumber)) {
                var align = pageNumber % 2 === footerPageNumberLeftAlign ? -1 : 1;
                var footerY = 1640;
                if (typeof options.footerOffset === 'number')
                    footerY += options.footerOffset;
                drawPathsToCanvas(ctx, [{
                            obj: [{
                                    type: 'text2',
                                    rect: [0, footerY, 1200, 60],
                                    align: [align, 1],
                                    fontSize: 24,
                                    //italic:true,
                                    text: [String(pageNumber)]
                                }
                            ]
                        }
                    ]);
                if (options.footerChapters instanceof Array) {
                    for (var f = 0; f < options.footerChapters.length; f++) {
                        var chapter = options.footerChapters[f];
                        if (p + 1 >= chapter.startPage && p + 1 <= chapter.endPage) {
                            drawPathsToCanvas(ctx, [{
                                        obj: [{
                                                type: 'text2',
                                                rect: [0, footerY, 1200, 60],
                                                align: [0, 1],
                                                fontSize: 20,
                                                italic: true,
                                                text: ['Chapter ' + (f + 1) + (!un(chapter.name) ? ': ' + chapter.name : '')]
                                            }
                                        ]
                                    }
                                ]);
                            break;
                        }
                    }
                }
            }
        }
    },
    drawSlides: function (ctx, resource, options) {
        if (un(options))
            options = {};
        canvasPdf.greyscale = options.greyscale === true;
        var pw = 612,
        ph = 792,
        cw = 1200,
        ch = 1700;
        var margin = 30;
        var scale = Math.min((pw - 2 * margin) / cw, (ph - 2 * margin) / ch);
        var offset = [(pw - cw * scale) / (2 * scale), (ph - ch * scale) / (2 * scale)];
        var tag = currFolder === 'teachFiles' ? '' : currFolder.slice(5) + '-';
        var title = !un(file.title) && file.title !== '' ? tag + file.title : tag + currFilename + ' (' + file.resources[resourceIndex].name + ')';

        var saveNotesOverlay = draw.notesOverlay;
        draw.notesOverlay = false;

        var newPage = true;
        for (var p = 0; p < file.resources[resourceIndex].pages.length; p++) {
            var page = file.resources[resourceIndex].pages[p];

            var paths = clone(page.paths);
            if (options.showAnswers === false)
                paths = paths.filter(function (path) {
                    return canvasPdf.slidesPathAnswerTest(path) === false;
                });

            var halfPage = true;
            for (var p2 = 0; p2 < paths.length; p2++) {
                var path = paths[p2];
                updateBorder(path);
                if (path.tightBorder[1] + path.tightBorder[3] >= 700 + 1000) {
                    halfPage = false;
                    break;
                }
            }

            if (halfPage === false) {
                if (p > 0)
                    ctx.doc.addPage();
                newPage = true;
                ctx.clearRect(0, 0, 3000, 3000);
                ctx.scale(scale, scale);
                ctx.translate(offset[0], offset[1]);

                drawPathsToCanvas(ctx, [{
                            obj: [{
                                    type: 'text2',
                                    rect: [0, 1640, 1200, 60],
                                    align: [-1, 1],
                                    fontSize: 20,
                                    italic: true,
                                    text: [title]
                                }, {
                                    type: 'text2',
                                    rect: [0, 1640, 1200, 60],
                                    align: [1, 1],
                                    fontSize: 20,
                                    text: ['www.MathsPad.co.uk']
                                }
                            ]
                        }
                    ]);

                drawPathsToCanvas(ctx, [{
                            obj: [{
                                    type: 'text2',
                                    rect: [0, 1600, 1200, 40],
                                    align: [0, 0],
                                    fontSize: 20,
                                    text: ['Slide ' + (p + 1)]
                                }
                            ]
                        }
                    ]);
                drawPathsToCanvas(ctx, [{
                            obj: [{
                                    type: 'text2',
                                    rect: [0, 0, 1200, 1600],
                                    text: [],
                                    box: {
                                        type: 'loose',
                                        borderColor: '#000',
                                        borderWidth: 4,
                                        color: 'none'
                                    }

                                }
                            ]
                        }
                    ]);
            } else {
                if (newPage === true) {
                    if (p > 0)
                        ctx.doc.addPage();
                    newPage = false;
                    ctx.clearRect(0, 0, 3000, 3000);
                    ctx.scale(scale, scale);
                    ctx.translate(offset[0], offset[1]);

                    drawPathsToCanvas(ctx, [{
                                obj: [{
                                        type: 'text2',
                                        rect: [0, 1640, 1200, 60],
                                        align: [-1, 1],
                                        fontSize: 20,
                                        italic: true,
                                        text: [title]
                                    }, {
                                        type: 'text2',
                                        rect: [0, 1640, 1200, 60],
                                        align: [1, 1],
                                        fontSize: 20,
                                        text: ['www.MathsPad.co.uk']

                                    }
                                ]
                            }
                        ]);
                } else {
                    ctx.translate(0, 850);
                    newPage = true;
                }
                drawPathsToCanvas(ctx, [{
                            obj: [{
                                    type: 'text2',
                                    rect: [0, 700, 1200, 40],
                                    align: [0, 0],
                                    fontSize: 24,
                                    text: ['Slide ' + (p + 1)]
                                }
                            ]
                        }
                    ]);
                drawPathsToCanvas(ctx, [{
                            obj: [{
                                    type: 'text2',
                                    rect: [0, 0, 1200, 700],
                                    text: [],
                                    box: {
                                        type: 'loose',
                                        borderColor: '#000',
                                        borderWidth: 4,
                                        color: 'none'
                                    }

                                }
                            ]
                        }
                    ]);
            }

            for (var p2 = 0; p2 < paths.length; p2++) {
                var path = paths[p2];
                if (!un(path.appear))
                    delete path.appear.visible;
            }
            drawPathsToCanvas(ctx, paths);

            /*var paths = [];
            //var includeAppearObjects = false;
            var includeAppearObjects = true;
            for (var p2 = 0; p2 < page.paths.length; p2++) {
            var path = clone(page.paths[p2]);
            if (includeAppearObjects === false && !un(path.appear) && path.appear.startVisible !== true) continue;
            if (!un(path.appear)) delete path.appear.visible;
            paths.push(path);
            delete path.selected;
            }
            drawPathsToCanvas(ctx,paths);*/
        }

        draw.notesOverlay = saveNotesOverlay;
    },

    drawTask: function (ctx, resource, options) {
        if (un(options))
            options = {};
        canvasPdf.greyscale = options.greyscale === true;
        var pw = 612,
        ph = 792; // A4 page size in PDF points (72 per inch)
        if (options.size instanceof Array) {
            pw = options.size[0];
            ph = options.size[1];
        }
        var cw = 1200,
        ch = 1700;
        var margin = 30 * (pw / 612);
        var scale = Math.min((pw - 2 * margin) / cw, (ph - 2 * margin) / ch);
        var offset = [(pw - cw * scale) / (2 * scale), (ph - ch * scale) / (2 * scale)];

        if (userInfo.user !== 'pupil') {
            draw.task.reset();
            draw.task.printMode = true;
        }

        var saveNotesOverlay = draw.notesOverlay;
        draw.notesOverlay = false;

        for (var p = 0; p < resource.pages.length; p++) {
            var page = resource.pages[p];
            if (p > 0)
                ctx.doc.addPage();

            for (var p2 = 0; p2 < page.paths.length; p2++) {
                var path = page.paths[p2];
                delete path.selected;
            }

            ctx.clearRect(0, 0, 3000, 3000);
            ctx.scale(scale, scale);
            ctx.translate(offset[0], offset[1]);
            drawPathsToCanvas(ctx, page.paths);

            if (options.showFooter !== false) {
                var footerY = 1640;
                if (typeof options.footerOffset === 'number')
                    footerY += options.footerOffset;
                if (resource.pages.length > 1) {
                    drawPathsToCanvas(ctx, [{
                                obj: [{
                                        type: 'text2',
                                        rect: [0, footerY, 1200, 60],
                                        align: [-1, 1],
                                        fontSize: 20,
                                        text: ['Page ' + (p + 1)]
                                    }
                                ]
                            }
                        ]);
                }
                if (options.showUrl !== false) {
                    drawPathsToCanvas(ctx, [{
                                obj: [{
                                        type: 'text2',
                                        rect: [0, footerY, 1200, 60],
                                        align: [1, 1],
                                        fontSize: 20,
                                        text: ['www.MathsPad.co.uk']
                                    }
                                ]
                            }
                        ]);
                }
            }

        }

        draw.task.printMode = false;
        draw.notesOverlay = saveNotesOverlay;
        draw.task.setMode(draw.task.mode, true);
        drawCanvasPaths();
    },

    slidesHaveAnswers: function (resource) {
        if (un(resource))
            resource = file.resources[resourceIndex];
        for (var p = 0; p < resource.pages.length; p++) {
            var paths = resource.pages[p].paths;
            for (var p2 = 0; p2 < paths.length; p2++) {
                var path = paths[p2];
                if (canvasPdf.slidesPathAnswerTest(path) === true)
                    return true;
            }
        }
        return false;
    },
    slidesPathAnswerTest: function (path) {
        if (un(path.appear))
            return false;
        if (path.appear.startVisible === true)
            return false;
        var reds = ['#f00', '#f66', '#ff0000', '#ff6666'];
        for (var i = 0; i < path.obj.length; i++) {
            var obj = path.obj[i];
            if (obj.type === 'table2') {
                for (var r = 0; r < obj.cells.length; r++) {
                    for (var c = 0; c < obj.cells[r].length; c++) {
                        var cell = obj.cells[r][c];
                        if (cell.text.length === 1 && cell.text[0] === '')
                            continue;
                        if (typeof cell.textColor !== 'string' || (typeof cell.textColor === 'string' && reds.indexOf(cell.textColor) === -1))
                            return false;
                    }
                }
            } else {
                if (typeof obj.color !== 'string' || (typeof obj.color === 'string' && reds.indexOf(obj.color.toLowerCase()) === -1))
                    return false;
            }
        }
        return true;
    }
}

/* // importPDF('/teach/worksheets/angles/ets.pdf');
function importPDF(url) {
loadScript('//mozilla.github.io/pdf.js/build/pdf.js',function() {
// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

// Asynchronous download of PDF
var loadingTask = pdfjsLib.getDocument(url);
loadingTask.promise.then(function(pdf) {
//console.log('PDF loaded');

// Fetch the first page
var pageNumber = 1;
pdf.getPage(pageNumber).then(function(page) {
//console.log('Page loaded');

var viewport = page.getViewport({scale: 1});
var scale = 1200 / viewport.width;
var scaledViewport = page.getViewport({scale: scale});

// Render PDF page into canvas context
var ctx = draw.drawCanvas[0].ctx;
ctx.clear();
var renderContext = {
canvasContext: ctx,
viewport: scaledViewport
};
var renderTask = page.render(renderContext);
renderTask.promise.then(function () {
//console.log('Page rendered');
});
});
}, function (reason) {
// PDF loading error
//console.error(reason);
});
});
}//*/

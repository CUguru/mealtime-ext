var setSeconds, autostart, secondsCurrent = false;

// countdown

function runTimer(){
	countdown(setSeconds);
	chrome.browserAction.setIcon({path: '/icons/mealtime_img2.png'});
	//console.log("starting countdown");
}

function stopTimer(){
	try{
		clearInterval(myTimer);
	} catch(e){
		console.log("no myTimer defined..");
	}
	secondsCurrent = false;
	removeNotification();
	chrome.browserAction.setIcon({path: '/icons/mainbackground.png'});
	//console.log("stopping countdown");
}

function countdown(seconds) {
	secondsCurrent = seconds;
	myTimer = setInterval(function() {
		if(secondsCurrent >= 0) {
			chrome.runtime.sendMessage({seconds: secondsCurrent});
		} else {
			stopTimer();
			makeNotification();
			updateNotification();
		}
		secondsCurrent--;
	}, 1000);
}

// NOTIFICATIONS

function buttonIsClicked(notId, button) { // buttonIndex: 0 = ok || 1 = shut up
	if (button == 0) {
		clearInterval(loopUpdate);
		removeNotification();
		runTimer();
	}
	else if (button == 1) {
		stopTimer();
	}
}

function makeNotification() {
	var opt = {
		type: "basic",
		title: "Meal Time!",
		message: "Go grab your food now!",
		iconUrl: "../icons/mainbackground.png",
		priority: 2
	};
	chrome.notifications.create("popup", opt);
}

function updateNotification() { // update every 60 seconds
	loopUpdate = setInterval(function() {
		chrome.notifications.update("popup", {priority: 0}, function() {
			chrome.notifications.update("popup", {priority: 2});
		});
		console.log("updated");
	}, 10000);
}

function removeNotification() { // clear all notifications
	chrome.notifications.getAll(function(cb) {
		for(var prop in cb){
			if(cb.hasOwnProperty(prop)) chrome.notifications.clear(prop);
		}
	});
}

// SYNC OPTIONS

function optionSyncned() {
	chrome.storage.sync.get({setSeconds: '3600', autostart: false}, function(options) {
		setSeconds = options.setSeconds;
		if(options.autostart) runTimer();
		//console.log("seconds set: " + setSeconds);
		//console.log("auto-start: " + options.autostart);
	});
}

// LISTEN TO CONTENT

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.Alarm == 'start') {
		runTimer();
	} else if(request.Alarm == 'stop'){
		stopTimer();
	} else if(request.Alarm == 'state') {
		sendResponse({seconds: secondsCurrent});
	} else if(request.Options == 'saved') {
		optionSyncned();
	} 
})



// ON LOAD

onload = function() {
	optionSyncned();
	chrome.notifications.onbuttonIsClicked.addListener(buttonIsClicked);
}
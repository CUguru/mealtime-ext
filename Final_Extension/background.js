var setSeconds, autostart, secondsCurrent = false;

// create a function that runs the timer
function runTimer(){
	countdown(setSeconds);
	chrome.browserAction.setIcon({path: '/icons/mealtime_img2.png'});
}

// create function to stop the timer and clear the set interval
// also use the chrome browswer action api to set the 
// toolbar icon once the timer has stopped running
function stopTimer(){
	try{
		clearInterval(myTimer);
	} catch(e){
		console.log("no myTimer defined..");
	}
	secondsCurrent = false;
	removeNotification();
	chrome.browserAction.setIcon({path: '/icons/mainbackground.png'});
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

// getting the notifications to the user
function buttonIsClicked(notId, button) {
	if (button == 0) {
		clearInterval(loopUpdate);
		removeNotification();
		runTimer();
	}
	else if (button == 1) {
		stopTimer();
	}
}


// create function that makes the notification that
// is sent to the user.
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


function updateNotification() {
	loopUpdate = setInterval(function() {
		chrome.notifications.update("popup", {priority: 0}, function() {
			chrome.notifications.update("popup", {priority: 2});
		});
		console.log("updated");
	}, 10000);
}

// remove and clear all notifications
function removeNotification() { 
	chrome.notifications.getAll(function(cb) {
		for(var prop in cb){
			if(cb.hasOwnProperty(prop)) chrome.notifications.clear(prop);
		}
	});
}


function optionSyncned() {
	chrome.storage.sync.get({setSeconds: '3600', autostart: false}, function(options) {
		setSeconds = options.setSeconds;
		if(options.autostart) runTimer();
	});
}


// listen to the extension to check for when the user has performed
// certain actions like starting or stopping the timer. Or if they
// have saved their preferences in the options page.
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




// once the start timer is clicked, we run the onload function.
// this calls the sync function above, which in turn, call the runtimer
// function that starts the countdown for the set interval.
onload = function() {
	optionSyncned();
	chrome.notifications.onbuttonIsClicked.addListener(buttonIsClicked);
}
var alarmIsActive, myTimer, setSeconds;

// RUN myTimer
function runTimer() {
	document.getElementById('toggle_button').className = 'btn stop_button';
	alarmIsActive = true;
	chrome.runtime.sendMessage({Alarm: 'start'});
}

function alarm() {
	console.log('drink now');
	stopTimer();
	reset();
}

function stopTimer() {
	clearInterval(myTimer);
	reset(); 
	alarmIsActive = false;
	//console.log('stopped');
	chrome.runtime.sendMessage({Alarm: 'stop'});
}

function reset() {
	document.getElementById('toggle_button').className = 'btn start_button';
	document.getElementById('units').innerHTML = 'minutes';
	console.log("function reset: setSeconds" + setSeconds);
	counterDraw(setSeconds);
	circleDraw(setSeconds);
}

// DRAW COUNTER
function counterDraw(sec) {
	var min = Math.ceil(sec / 60);
	if(sec >= 60) { // if more than 60 seconds –> show minutes
		document.getElementById('main_counter').innerHTML = min;
		if(min > 1){
			document.getElementById('units').innerHTML = 'minutes';
		} else {
			document.getElementById('units').innerHTML = 'minute';
		}
	} else { // else show seconds
		document.getElementById('main_counter').innerHTML = sec;
		if(sec > 1) {
			document.getElementById('units').innerHTML = 'seconds';
		} else {
			document.getElementById('units').innerHTML = 'second';
		}
	}
}

// DRAW CIRCLE
function circleDraw(sec) {
	var path = document.getElementById('circleProgress');
	var pathLength = path.getTotalLength();
	var position = map(sec, setSeconds, 0, 0, pathLength);

	path.style.transition = path.style.WebkitTransition = 'none';
	path.style.strokeDasharray = pathLength + ' ' + pathLength;
	path.style.strokeDashoffset = position;
	path.getBoundingClientRect();
}

function map(value, start1, stop1, start2, stop2) {
	return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

// SAVE OPTIONS
function optionsSave() {
	var min = document.getElementById('minute_value').value;
	var auto = document.getElementById('autostart').checked;

	chrome.storage.sync.set({setSeconds: min * 60, autostart: auto});
	chrome.runtime.sendMessage({Options: 'saved'});
	stopTimer();
}

function optionsRead() {
	chrome.storage.sync.get({setSeconds: '3600', autostart: false}, function(options) {
		document.getElementById('minute_value').value = options.setSeconds / 60;
		document.getElementById('main_counter').innerHTML = options.setSeconds / 60;
		setSeconds = options.setSeconds;

		if(options.autostart == true) {
			document.getElementById('autostart').checked = true;
		}
	});
}

// LISTEN TO BACKGROUND
chrome.runtime.onMessage.addListener(function(response){
	if(response.seconds) {
		circleDraw(response.seconds);
		counterDraw(response.seconds);
		alarmIsActive = true;
		document.getElementById('toggle_button').className = 'btn stop_button';
	}
});

// ON STARTUP
onload = function() {

	optionsRead();

	chrome.runtime.sendMessage({Alarm: 'state'}, function(response) {
		if(response.seconds !== false) {
			circleDraw(response.seconds);
			counterDraw(response.seconds);
			alarmIsActive = true;
			document.getElementById('toggle_button').className = 'btn stop_button';
		}
	});

	document.getElementById('toggle_button').addEventListener('click', function() {
		if (alarmIsActive == true) stopTimer();
		else runTimer();
	});

	document.getElementById('optionsSave').addEventListener('click', function() {
		optionsSave(); // save settings to local storage
		optionsRead(); // restore options set to display changed time on popup
		document.getElementById('main_timer').classList.toggle('display_options');
	});

	document.getElementById('options_menu').addEventListener('click', function() {
			if(document.getElementById('main_timer').classList.contains('instructions')) {
				document.getElementById('main_timer').classList.remove('instructions', 'display_options');
			} else {
			document.getElementById('main_timer').classList.toggle('display_options');
		}
		
	});

	document.getElementById('how_to').addEventListener('click', function() {
		document.getElementById('main_timer').classList.toggle('instructions');
	});
}
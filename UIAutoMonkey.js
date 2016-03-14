// Copyright (c) 2013 Jonathan Penn (http://cocoamanifest.net/)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

"use strict";

function UIAutoMonkey() {
		
	this.config = {
		//run either by minutesToRun or numberOfEvents. Only one of these can set. (To use minutes you can use config.numberOfEvents = 0)
		//minutesToRun = 60 * 8; //sample to run for 8 hours.
		//checkTimeEvery = 60; //how often to check (in events) if minutesToRun has is used. 
		numberOfEvents: 1000,
		delayBetweenEvents: 0.05,    // In seconds
		
		/**
		* Sometimes the monkey can fall into UI Holes from which it it is hard to escape. The monkey may then spend an inordinate
		* amount of time in such holes, neglecting other parts of the application.
		*
		* For example, if a parent Window P has a large image
		* and clicking on the image opens a child window C from which one exits by tapping a small X on the top right, then until that small X is
		* tapped we will remain in C. conditionHandlers offer the developer the option to periodically recognize that we are in C and press the X.
		*
		* See buttonHandler.js for a specialized conditionHandler useful when a top level button can be used to escape from a UI hole.
		*
		* conditionHandlers are objects that respond to the following methods:
		*  isTrue(target, eventNumber): returns True if the condition is true given target and event number eventNumber.
		*  checkEvery(): How many events should pass before we check.
		*  handle(target, mainWindow) handle the condition.
		*  isExclusive() if true then if this condition's handler is invoked then processing subsequent conditions is skipped for this particular event. This
		*	 is usually set to true as it allows the condition to exit a UI hole and at that point there may be no point executing other conditions
		*  logStats() log statics using UIALogger;
		* condition handlers must have the following property
		*  statsHandleInvokedCount - the count of the number of times we were invoked
		*/

		conditionHandlers: [],
		
		/**
		* Unfortunately if the application is not responsive "ANR", the monkey may not notice and continue to fire events not realizing that
		* the application is stuck. When run via continuous integration users may not notice that "successful" monkey runs in fact were in an 
		* ANR state.
		*
		* To deal with this the monkey supports ANR detection. Using an anrFingerprint function it periodically takes a fingerprint and if these
		* are identical for a specified interval then an ANR exception is thrown.
		*
		*
		*/
		anrSettings: {
			//fingerprintFunction defaults to false which will disable ANR fingerprinting. Otherwise set to a function that will return
			//a string. One useful idiom using tuneup.js is
			//#import tuneup.js
			//config.anrSettings.fingerprintFunction = function() {return logVisibleElementTreeJSON(false)};
	        fingerprintFunction: false,
			eventsBeforeANRDeclared: 1500, //throw exception if the fingerprint hasn't changed within this number of events
			eventsBetweenSnapshots: 150, //how often (in events) to take a snapshot using the fingerprintFunction 
			debug: false //if true extra logging is made			
		},

		// If the following line is uncommented, then screenshots are taken
		// every "n" seconds.
		//screenshotInterval: 5,

		// Events are triggered based on the relative weights here. The event
		// with this highest number gets triggered the most.
		//
		// If you want to add your own "events", check out the event method
		// definitions below.
		eventWeights: {
			tap: 500,
			drag: 1,
			flick: 1,
			orientation: 1,
			clickVolumeUp: 1,
			clickVolumeDown: 1,
			lock: 1,
			pinchClose: 10,
			pinchOpen: 10,
			shake: 1
		},

		// Probability that touch events will have these different properties
		touchProbability: {
			multipleTaps: 0.05,
			multipleTouches: 0.05,
			longPress: 0.05
		}
		

		// Uncomment the following to restrict events to a rectangular area of
		// the screen
		/*
		frame: {
			origin: {x: 0, y: 0},
			size: {width: 100, height: 50}
		}
		*/

	};

	// Dismiss alerts 
	UIATarget.onAlert = function onAlert(alert) {
		var title = alert.name();
		UIALogger.logMessage('On Alert: ' + title);
		return true;
	}
}

// --- --- --- ---
// Event Methods
//
// Any event probability in the hash above corresponds to a related event
// method below. So, a "tap" probability will trigger a "tap" method.
//
// If you want to add your own events, just add a probability to the hash
// above and then add a corresponding method below. Boom!
//
// Each event method can call any other method on this UIAutoMonkey object.
// All the methods at the end are helpers at your disposal and feel free to
// add your own.

UIAutoMonkey.prototype.allEvents = {
	tap: function() {
		this.target().tapWithOptions(
			{ x: this.randomX(), y: this.randomY() },
			{
				tapCount: this.randomTapCount(),
				touchCount: this.randomTouchCount(),
				duration: this.randomTapDuration()
			}
		);
	},

	drag: function() {
		this.target().dragFromToForDuration(
			{ x: this.randomX(), y: this.randomY() },
			{ x: this.randomX(), y: this.randomY() },
			0.5
		);
	},

	flick: function() {
		this.target().flickFromTo(
			{ x: this.randomX(), y: this.randomY() },
			{ x: this.randomX(), y: this.randomY() }
		);
	},

	orientation: function() {
		var orientations = [
			UIA_DEVICE_ORIENTATION_PORTRAIT,
			UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN,
			UIA_DEVICE_ORIENTATION_LANDSCAPELEFT,
			UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT
		];

		var i = Math.floor(Math.random() * 10) % orientations.length;
		var newOrientation = orientations[i];
		this.target().setDeviceOrientation(newOrientation);
		this.delay(0.9);
	},

	clickVolumeUp: function() {
		this.target().clickVolumeUp();
	},

	clickVolumeDown: function() {
		this.target().clickVolumeDown();
	},

	lock: function() {
		this.target().lockForDuration(Math.random() * 3);
	},

	pinchClose: function () {
		this.target().pinchCloseFromToForDuration(
			{ x: this.randomX(), y: this.randomY() },
			{ x: this.randomX(), y: this.randomY() },
			0.5
		);
	},

	pinchOpen: function () {
		this.target().pinchOpenFromToForDuration(
			{ x: this.randomX(), y: this.randomY() },
			{ x: this.randomX(), y: this.randomY() },
			0.5
		);
	},

	shake: function() {
		this.target().shake();
	}
};

// --- --- --- ---
// Helper methods
//
UIAutoMonkey.prototype.RELEASE_THE_MONKEY = function() {
	// Called at the bottom of this script to, you know...
	//
	// RELEASE THE MONKEY!
	if (this.config.minutesToRun && this.config.numberOfEvents) {
		throw "invalid configuration. You cannot define both minutesToRun and numberOfEvents"
	}
	var conditionHandlers = this.config.conditionHandlers || []; //For legacy configs, if not present default to empty.
	var useConditionHandlers = conditionHandlers.length > 0;
	var checkTime = false;
	var localNumberOfEvents = this.config.numberOfEvents; //we may modify so we want to leave config untouched
	if (this.config.minutesToRun) {
		checkTime = true;
		localNumberOfEvents = 2000000000;
		var startTime = new Date().getTime();
		var checkTimeEvery = this.config.checkTimeEvery || 60; //number of events to pass before we check the time
	}
	//setup anr parameters as needed
	var anrFingerprintFunction = this.config.anrSettings ? this.config.anrSettings.fingerprintFunction : false; //handle legacy settings missing this
	if (anrFingerprintFunction) {
		this.anrSnapshot = "Initial snapshot-nothing should match this!!";
		this.anrSnapshotTakenAtIndex = -1;		
		var anrEventsBetweenSnapshots = this.config.anrSettings.eventsBetweenSnapshots || 300;
		var anrDebug = this.config.anrSettings.debug;
		this.anrMaxElapsedCount = -1;
    } 
	
	var targetBundleId = this.target().frontMostApp().bundleID();
	for (var i = 0; i < localNumberOfEvents; i++) {
		if (checkTime && (i % checkTimeEvery == 0)) { //check the time if needed
			var currTime = new Date().getTime();
			var elapsedMinutes = (currTime-startTime) / 60000;
			if (elapsedMinutes >= this.config.minutesToRun) {
				UIALogger.logDebug("Ending monkey after " + elapsedMinutes + " minutes run time.");
				break;
			} else {
				UIALogger.logDebug(this.config.minutesToRun - elapsedMinutes + " minutes left to run.")
			}
		}

		var currentBundleId = this.target().frontMostApp().bundleID();
		if (currentBundleId !== targetBundleId) {
			UIALogger.logDebug("Ending monkey because it went outside of the tested app ('" + currentBundleId + "')");
			break;
		}

		this.triggerRandomEvent();
		if (anrFingerprintFunction && (i % anrEventsBetweenSnapshots == 0)) this.anrCheck(i, anrFingerprintFunction, anrDebug);
		if (this.config.screenshotInterval) this.takeScreenShotIfItIsTime();
		if (useConditionHandlers) this.processConditionHandlers(conditionHandlers, i+1, this.target());
		this.delay();
	}
	// publish stats if warranted
	if (anrFingerprintFunction) {
		UIALogger.logDebug("ANR Statistics");
		UIALogger.logDebug("ANR max event count for identical fingerprint snapshots :: events before ANR declared: " + this.anrMaxElapsedCount + " :: " + this.config.anrSettings.eventsBeforeANRDeclared);
	}
	if (useConditionHandlers) {
		UIALogger.logDebug("ConditionHandler Statistics")
		conditionHandlers.forEach(function(aHandler) {aHandler.logStats()});
		conditionHandlers.sort(function(aHandler, bHandler) {return aHandler.statsHandleInvokedCount - bHandler.statsHandleInvokedCount});
		UIALogger.logDebug("sorted by HandleInvokedCount");
		conditionHandlers.forEach(function(aHandler) {UIALogger.logDebug(aHandler + ": " + aHandler.statsHandleInvokedCount)});
    }
};


UIAutoMonkey.prototype.anrCheck = function(i, fingerprintFunction, debugFlag){

	var newSnapshot = fingerprintFunction();
	if (newSnapshot != this.anrSnapshot) {
		//all is good, we're moving along
		if (debugFlag) UIALogger.logDebug("UIAutoMonkey:anrCheck(): snapshot != for event " + i);
		this.anrSnapshot = newSnapshot;
		this.anrSnapshotTakenAtIndex = i;
	} 
	else {
		//have a match
		//for how many counts?
		var elapsedCount = i - this.anrSnapshotTakenAtIndex;
		this.anrMaxElapsedCount = Math.max(this.anrMaxElapsedCount, elapsedCount);
		UIALogger.logDebug("UIAutoMonkey:anrCheck(): snapshot == with elapsed count=" + elapsedCount);
		if (elapsedCount > this.config.anrSettings.eventsBeforeANRDeclared) {
			UIALogger.logDebug("duplicate snapshot detected" + this.anrSnapshot);
			throw "anr exception-identical after " + elapsedCount + " events";
		};
	};
};


UIAutoMonkey.prototype.processConditionHandlers = function(conditionHandlers, eventNumberPlus1, target) {
	var mainWindow = target.frontMostApp().mainWindow(); //optimization to let handlers do less work. Assumes isTrue() doesn't alter the mainWindow.
	for (var i = 0; i < conditionHandlers.length; i++) {
		var aCondition = conditionHandlers[i];
		if ((eventNumberPlus1 % aCondition.checkEvery()) != 0) {
			continue; //not yet time to process aCondition.
		}
		try {
			UIATarget.localTarget().pushTimeout(0);
			var isConditionTrue = aCondition.isTrue(target, eventNumberPlus1, mainWindow);
		}
		finally {
		    UIATarget.localTarget().popTimeout();
		}
		if (isConditionTrue) {
				aCondition.handle(target, mainWindow);
				if (aCondition.isExclusive()) {
					break;
				} else {
					mainWindow = target.frontMostApp().mainWindow(); //could be stale
				}
		};
	};

};

UIAutoMonkey.prototype.triggerRandomEvent = function() {
	var name = this.chooseEventName();
	// Find the event method based on the name of the event
	var event = this.allEvents[name];
	event.apply(this);
};

UIAutoMonkey.prototype.target = function() {
	// Return the local target.
	return UIATarget.localTarget();
};

UIAutoMonkey.prototype.delay = function(seconds) {
	// Delay the target by `seconds` (can be a fraction)
	// Defaults to setting in configuration
	seconds = seconds || this.config.delayBetweenEvents;
	this.target().delay(seconds);
};

UIAutoMonkey.prototype.chooseEventName = function() {
	// Randomly chooses an event name from the `eventsWeight` dictionary
	// based on the given weights.
	var calculatedEventWeights = [];
	var totalWeight = 0;
	var events = this.config.eventWeights;
	for (var event in events) {
		if (events.hasOwnProperty(event)) {
			calculatedEventWeights.push({
				weight: events[event]+totalWeight,
				event: event
			});
			totalWeight += events[event];
		}
	}

	var chosenWeight = Math.random() * 1000 % totalWeight;

	for (var i = 0; i < calculatedEventWeights.length; i++) {
		if (chosenWeight < calculatedEventWeights[i].weight) {
			return calculatedEventWeights[i].event;
		}
	}

	throw "No even was chosen!";
};

UIAutoMonkey.prototype.screenWidth = function() {
	// Need to adjust by one to stay within rectangle
	return this.target().rect().size.width - 1;
};

UIAutoMonkey.prototype.screenHeight = function() {
	// Need to adjust by one to stay within rectangle
	return this.target().rect().size.height - 1;
};

UIAutoMonkey.prototype.randomX = function() {
	var min, max;	

	if (this.config.frame){
		// Limits coordinates to given frame if set in config
		min = this.config.frame.origin.x;
		max = this.config.frame.size.width + min;
	} else {
		// Returns a random X coordinate within the screen rectangle
		min = 0;
		max = this.screenWidth();
	}

	return Math.floor(Math.random() * (max - min) + min) + 1;
};

UIAutoMonkey.prototype.randomY = function() {
	var min, max;

	if (this.config.frame){
		// Limits coordinates to given frame if set in config
		min = this.config.frame.origin.y;
		max = this.config.frame.size.height + min;
	} else {
		// Returns a random Y coordinate within the screen rectangle
		min = 0;
		max = this.screenHeight();
	}

	return Math.floor(Math.random() * (max - min) + min) + 1;
};

UIAutoMonkey.prototype.randomTapCount = function() {
	// Calculates a tap count for tap events based on touch probabilities
	if (this.config.touchProbability.multipleTaps > Math.random()) {
		return Math.floor(Math.random() * 10) % 3 + 1;
	}
	else return 1;
};

UIAutoMonkey.prototype.randomTouchCount = function() {
	// Calculates a touch count for tap events based on touch probabilities
	if (this.config.touchProbability.multipleTouches > Math.random()) {
		return Math.floor(Math.random() * 10) % 3 + 1;
	}
	else return 1;
};

UIAutoMonkey.prototype.randomTapDuration = function() {
	// Calculates whether or not a tap should be a long press based on
	// touch probabilities
	if (this.config.touchProbability.longPress > Math.random()) {
		return 0.5;
	}
	else return 0;
};

UIAutoMonkey.prototype.randomRadians = function() {
	// Returns a random radian value
	return Math.random() * 10 % (3.14159 * 2);
};

UIAutoMonkey.prototype.takeScreenShotIfItIsTime = function() {
	var now = (new Date()).valueOf();
	if (!this._lastScreenshotTime) this._lastScreenshotTime = 0;

	if (now - this._lastScreenshotTime > this.config.screenshotInterval * 1000) {
		var filename = "monkey-" + (new Date()).toISOString().replace(/[:\.]+/g, "-");
		this.target().captureScreenWithName(filename);
		this._lastScreenshotTime = now;
	}
};

// If you want to control when the monkey is released please follow the pattern in the SampleCustomization folder. In brief you want to set a global
// as set in SetGlobals.js, but due to Apple's javascript implementation you cannot simply set it before you import UIAutoMonkey.js.
//
if (typeof UIAutoMonkeyClientWillReleaseTheMonkey == 'undefined' || !UIAutoMonkeyClientWillReleaseTheMonkey) {
	// the variable is not defined or it's defined and false
	UIALogger.logDebug("Releasing the monkey directly from UIAutoMonkey"); //explain why it was released to aid in problem resolution.
	(new UIAutoMonkey()).RELEASE_THE_MONKEY();
}



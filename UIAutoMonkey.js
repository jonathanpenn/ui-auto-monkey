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
		numberOfEvents: 1000,
		delayBetweenEvents: 0.05,    // In seconds

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

		// Uncomment the following to restrict events to a rectangluar area of
		// the screen
		/*
		frame: {
			origin: {x: 0, y: 0},
			size: {width: 100, height: 50}
		}
		*/

	};
	
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
		this.target().clickVolumeUp();
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

	for(var i = 0; i < this.config.numberOfEvents; i++) {
		this.triggerRandomEvent();
		if (this.config.screenshotInterval) this.takeScreenShotIfItIsTime();
		this.delay();
	}
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

// Commodity function to call RELEASE_THE_MONKEY directly on UIAutoMonkey
// if you don't need to customize your instance
UIAutoMonkey.RELEASE_THE_MONKEY = function() {
	(new UIAutoMonkey()).RELEASE_THE_MONKEY();
};

UIAutoMonkey.RELEASE_THE_MONKEY();


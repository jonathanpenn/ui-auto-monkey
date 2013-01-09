// Copyright (c) 2012 Jonathan Penn (http://cocoamanifest.net/)

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

var UIAutoMonkey = {

	config: {
		numberOfEvents: 1000,
		delayBetweenEvents: 0.05,    // In seconds

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

	},

	// --- --- --- ---
	// Event Methods
	//
	// Any event probability in the hash above corresponds to a related event
	// method below. So, a "tap" probability will trigger a "tapEvent" method.
	//
	// If you want to add your own events, just add a probability to the hash
	// above and then add a corresponding method below. Boom!
	//
	// Each event method can call any other method on this UIAutoMonkey object.
	// All the methods at the end are helpers at your disposal and feel free to
	// add your own.

	tapEvent: function() {
		this.target().tapWithOptions(
			{ x: this.randomX(), y: this.randomY() },
			{
				tapCount: this.randomTapCount(),
				touchCount: this.randomTouchCount(),
				duration: this.randomTapDuration()
			}
		);
	},

	dragEvent: function() {
		this.target().dragFromToForDuration(
			{ x: this.randomX(), y: this.randomY() },
			{ x: this.randomX(), y: this.randomY() },
			0.5
		);
	},

	flickEvent: function() {
		this.target().flickFromTo(
			{ x: this.randomX(), y: this.randomY() },
			{ x: this.randomX(), y: this.randomY() }
		);
	},

	orientationEvent: function() {
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

	clickVolumeUpEvent: function() {
		this.target().clickVolumeUp();
	},

	clickVolumeDownEvent: function() {
		this.target().clickVolumeUp();
	},

	lockEvent: function() {
		this.target().lockForDuration(Math.random() * 3);
	},

	pinchCloseEvent: function () {
		this.target().pinchCloseFromToForDuration(
			{ x: this.randomX(), y: this.randomY() },
			{ x: this.randomX(), y: this.randomY() },
			0.5
		);
	},

	pinchOpenEvent: function () {
		this.target().pinchOpenFromToForDuration(
			{ x: this.randomX(), y: this.randomY() },
			{ x: this.randomX(), y: this.randomY() },
			0.5
		);
	},

	shakeEvent: function() {
		this.target().shake();
	},

	// --- --- --- ---
	// Helper methods
	//

	RELEASE_THE_MONKEY: function() {
		// Called at the bottom of this script to, you know...
		//
		// RELEASE THE MONKEY!

		for(var i = 0; i < this.config.numberOfEvents; i++) {
			this.triggerRandomEvent();
			this.delay();
		}
	},

	triggerRandomEvent: function() {
		var name = this.chooseEventName();
		// Find the event method based on the name of the event
		var event = this[name + "Event"];
		event.apply(this);
	},

	target: function() {
		// Return the local target.
		return UIATarget.localTarget();
	},

	delay: function(seconds) {
		// Delay the target by `seconds` (can be a fraction)
		// Defaults to setting in configuration
		seconds = seconds || this.config.delayBetweenEvents;
		this.target().delay(seconds);
	},

	chooseEventName: function() {
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
	},

	screenWidth: function() {
		// Need to adjust by one to stay within rectangle
		return this.target().rect().size.width - 1;
	},

	screenHeight: function() {
		// Need to adjust by one to stay within rectangle
		return this.target().rect().size.height - 1;
	},

	randomX: function() {
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
	},

	randomY: function() {
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
	},

	randomTapCount: function() {
		// Calculates a tap count for tap events based on touch probabilities
		if (this.config.touchProbability.multipleTaps > Math.random()) {
			return Math.floor(Math.random() * 10) % 3 + 1;
		}
		else return 1;
	},

	randomTouchCount: function() {
		// Calculates a touch count for tap events based on touch probabilities
		if (this.config.touchProbability.multipleTouches > Math.random()) {
			return Math.floor(Math.random() * 10) % 3 + 1;
		}
		else return 1;
	},

	randomTapDuration: function() {
		// Calculates whether or not a tap should be a long press based on
		// touch probabilities
		if (this.config.touchProbability.longPress > Math.random()) {
			return 0.5;
		}
		else return 0;
	},

	randomRadians: function() {
		// Returns a random radian value
		return Math.random() * 10 % (3.14159 * 2);
	}
};

UIAutoMonkey.RELEASE_THE_MONKEY();

/* Instruments uses 4-wide tab stops. */
/* vim: set tabstop=4 shiftwidth=4 softtabstop=4 copyindent noexpandtab: */

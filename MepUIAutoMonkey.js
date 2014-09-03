"use strict";

//Have main test import the following
//
//#import "seedrandom.js"
//#import "ui-auto-monkey/UIAutoMonkey.js"
//#import "ui-auto-monkey/MepUIAutoMonkey.js"
//#import "tuneup_js/tuneup.js"
//

function MepUIAutoMonkey() {
  UIAutoMonkey.call(this); //invoke "super" constructor
  this.setConditionHandlers([]);
}

//setup inheritance (along with the "super" call in our constructor
MepUIAutoMonkey.prototype = Object.create(UIAutoMonkey.prototype); //we inherit
MepUIAutoMonkey.prototype.constructor = MepUIAutoMonkey; //manually set the constructor to ours


/**
 * conditionHandlers are objects that respond to the following function calls:
 *  isTrue(target, eventNumber): returns True if the condition is true given target and event number eventNumber.
 *  threshold(): returns an integer number of times the event must be true in order to trigger the handler
 *  handle(target) handle the condition.
 *  isExclusive() if true then if this condition's handler is invoked then  processing subsequent conditions is skipped for this particular event. This
 *    is usually set to true as it allows the condition to exit a UI hole and at that point there may be no point executing other conditions
 * @param {ConditionHandler[]} handlers - an Array of ConditionHandlers
 */
MepUIAutoMonkey.prototype.setConditionHandlers = function(handlers) {
	this.conditionHandlers = handlers;
};

MepUIAutoMonkey.prototype.RELEASE_THE_MONKEY = function() {
	// Called at the bottom of this script to, you know...
	//
	// RELEASE THE MONKEY!
	UIALogger.logDebug("XXX in RELEASE_THE_MONKEY 1 this.conditionHandlers.length=" + this.conditionHandlers.length);
	var conditionCounts = []; // each entry corresponds to an entry in conditionHandlers
	for (var index = 0; index < this.conditionHandlers.length; index++) {
		conditionCounts[index] = 0;
	}
	UIALogger.logDebug("XXX in RELEASE_THE_MONKEY 2");
	for (var i = 0; i < this.config.numberOfEvents; i++) {
		this.triggerRandomEvent();
		if (this.config.screenshotInterval) this.takeScreenShotIfItIsTime();
		this.processConditionHandlers(this.conditionHandlers, conditionCounts, i, this.target());
		this.delay();
	}
};

MepUIAutoMonkey.prototype.processConditionHandlers = function(conditionHandlers, conditionCounts, eventNumber, target) {
	for (var i = 0; i < conditionHandlers.length; i++) {
		var aCondition = conditionHandlers[i];
	    UIALogger.logDebug("XXX in processConditionHandlers aCondition =" + aCondition.toString());
		UIATarget.localTarget().pushTimeout(0);
		var isConditionTrue = aCondition.isTrue(target, eventNumber);
		UIATarget.localTarget().popTimeout();
		if (isConditionTrue) {
			var newValue = conditionCounts[i] + 1;
			if (newValue > aCondition.threshold()) {
				newValue = 0;
				aCondition.handle(target);
				conditionCounts[i] = newValue;
				if (aCondition.isExclusive()) {
					break;
				}
			}
			conditionCounts[i] = newValue;
		} else {
			conditionCounts[i] = 0;
		};
	};

};
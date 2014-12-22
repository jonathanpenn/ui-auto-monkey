"use strict";
//Copyright Yahoo 2014


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
 *  checkEvery(): How many events should pass before we check.
 *  handle(target, mainWindow) handle the condition.
 *  isExclusive() if true then if this condition's handler is invoked then processing subsequent conditions is skipped for this particular event. This
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
	for (var i = 0; i < this.config.numberOfEvents; i++) {
		this.triggerRandomEvent();
		if (this.config.screenshotInterval) this.takeScreenShotIfItIsTime();
		this.processConditionHandlers(this.conditionHandlers, i+1, this.target());
		if ((i % 60) == 0 ) {
			UIALogger.logDebug("MepUIAutoMonkey.RELEASE_THE_MONKEY processed event " + i);
		}
		this.delay();
	}
};

MepUIAutoMonkey.prototype.processConditionHandlers = function(conditionHandlers, eventNumberPlus1, target) {
	var mainWindow = target.frontMostApp().mainWindow(); //optimization to let handlers do less work. Assumes isTrue() doesn't alter the mainWindow.
	for (var i = 0; i < conditionHandlers.length; i++) {
		var aCondition = conditionHandlers[i];
		if ((eventNumberPlus1 % aCondition.checkEvery()) != 0) {
			continue; //not yet time to process aCondition.
		}
		try {
			UIATarget.localTarget().pushTimeout(0);
			//var startTime = new Date();
			var isConditionTrue = aCondition.isTrue(target, eventNumberPlus1, mainWindow);
			//var endTime = new Date();
			//UIALogger.logMessage("time to execute condition" + aCondition + " = " + (endTime-startTime))
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
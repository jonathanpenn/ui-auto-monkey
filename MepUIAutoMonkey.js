"use strict";


function MepUIAutoMonkey() {
  UIAutoMonkey.call(this); //invoke "super" constructor
  this.setConditionHandlers([]);
}
//Copyright Yahoo 2014
//setup inheritance (along with the "super" call in our constructor
MepUIAutoMonkey.prototype = Object.create(UIAutoMonkey.prototype); //we inherit
MepUIAutoMonkey.prototype.constructor = MepUIAutoMonkey; //manually set the constructor to ours


/**
 * conditionHandlers are objects that respond to the following function calls:
 *  isTrue(target, eventNumber): returns True if the condition is true given target and event number eventNumber.
 *  checkEvery(): returns an integer number events that pass before we check.
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
	for (var i = 0; i < this.config.numberOfEvents; i++) {
		this.triggerRandomEvent();
		if (this.config.screenshotInterval) this.takeScreenShotIfItIsTime();
		this.processConditionHandlers(this.conditionHandlers, i+1, this.target());
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
		//UIALogger.logMessage("now processing handler " + aCondition);
		UIATarget.localTarget().pushTimeout(0);
		//var startTime = new Date();
		var isConditionTrue = aCondition.isTrue(target, eventNumberPlus1, mainWindow);
		//var endTime = new Date();
		//UIALogger.logMessage("time to execute condition" + aCondition + " = " + (endTime-startTime))
		UIATarget.localTarget().popTimeout();
		if (isConditionTrue) {
		    mainWindow = target.frontMostApp().mainWindow();
		    if (!aCondition.isTrue(target, eventNumberPlus1, mainWindow)) { //ask again with normal timeouts
			  //UIALogger.logMessage("Skipping condition as it's not true a 2nd time:" + aCondition);	
			  continue;
			}
			//UIALogger.logMessage("handling condition " + aCondition);		
		    aCondition.handle(target);
			if (aCondition.isExclusive()) {
			  break;
			} else {
			  mainWindow = target.frontMostApp().mainWindow(); //could be stale
			}
		} else {
			//UIALogger.logMessage("Condition false: " + aCondition);
		}
	};

};
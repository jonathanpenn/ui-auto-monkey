"use strict";

#import "seedrandom.js"
#import "UIAutoMonkey.js"

function MepUIAutoMonkey()) {
  UIAutoMonkey.call(this); //invoke "super" constructor
  this.conditionhandlers = [];
}

//setup inheritance (along with the "super" call in our constructor
MepUIAutoMonkey.prototype = Object.create(UIAutoMonkey.prototype); //we inherit
MepUIAutoMonkey.prototype.constructor = MepUIAutoMonkey; //manually set the constructor to ours


/**
 * conditionHandlers are objects that respond to the following function calls:
 *  isTrue(target, i): returns True if the condition is true given target and event number i
 *  threshold(): returns an integer number of times the event must be true in order to trigger the handler
 *  handle(target) handle the condition.
 *  isExclusive() if true then if this condition's handler is invoked then  processing subsequent conditions is skipped for this particular event. This
 *    is usually set to true as it allows the condition to exit a UI hole and at that point there may be no point executing other conditions
 *
 */
MepUIAutoMonkey.prototype.setConditonHandlers: function(handlers) {
	conditionHandlers = handlers;
},

MepUIAutoMonkey.prototype.RELEASE_THE_MONKEY = function() {
	// Called at the bottom of this script to, you know...
	//
	// RELEASE THE MONKEY!
	var runtimeConditionHandlers = {};
	for (var index = 0; index < conditionHandlers.length; i++) {
		var condtion = conditionHandlers[i];
		runtimeConditionHanders[condition] = 0;
	}

	for (var i = 0; i < this.config.numberOfEvents; i++) {
		this.triggerRandomEvent();
		if (this.config.screenshotInterval) this.takeScreenShotIfItIsTime();
		processConditionHandlers(runtimeConditionHandlers, i, target());
		this.delay();
	}
},

MepUIAutoMonkey.prototype.processConditionHanders = function(runtimeConditionHandlers, i, target) {
	for (var aCondition in runtimeConditionHandlers) {
		if (aCondition.isTrue(target, i)) {
			var newValue = runtimeConditionHandlers[aCondition] + 1;
			if (newValue > aCondtion.threshold()) {
				newValue = 0;
				aCondtion.handle(target);
				runtimeConditionHandlers[aCondition] = newValue;
				if (aCondition.isExclusive()) {
					break;
				}
			}
			runtimeConditionHandlers[aCondition] = newValue;
		} else {
			runtimeConditionHandlers[aCondition] = 0;
		}
	};

},
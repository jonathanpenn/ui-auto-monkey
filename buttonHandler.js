"use strict";
//Conforms to the ConditionHandler protocol in UIAutoMonkey
//Usage 
//  var handlers = [ ];
//  var handlerInterval = 20;  //every how many events to process. Can vary by each handler, but often useful to group them
//  handlers.push(new ButtonHandler("Done", handlerInterval, false));  //every 20 events, press "Done" button if found as a top level button (no nav bar). 
//  ...
//  config.conditionHandlers = handlers
//  
function ButtonHandler(buttonName, checkEveryNumber, useNavBar, optionalIsTrueFunction) {
	this.buttonName = buttonName;
	this.checkEveryNumber = checkEveryNumber || 10;
	if (useNavBar == undefined) {
		useNavBar = true;
	};
	this.useNavBar = useNavBar;
	this.optionalIsTrueFunction = optionalIsTrueFunction || null;
	//stats
	this.statsIsTrueInvokedCount = 0;
	this.statsIsTrueReturnedTrue = 0;
	this.statsIsTrueReturnedFalse = 0;
	this.statsHandleInvokedCount = 0;
	this.statsHandleNotValidAndVisibleCount = 0;
	this.statsHandleErrorCount = 0;
}

// return true if we our button is visible 
ButtonHandler.prototype.isTrue = function(target, eventCount, mainWindow) {
	this.statsIsTrueInvokedCount++;
	var result;
	if (this.optionalIsTrueFunction == null) {
		var aButton = this.findButton(target);
        result = aButton.isNotNil() && aButton.validAndVisible();
    } else {
	    result = this.optionalIsTrueFunction(target, eventCount, mainWindow);
    }
    if (result) {
	  this.statsIsTrueReturnedTrue++;
    } else {
	  this.statsIsTrueReturnedFalse++;
    };
    return result;
};

ButtonHandler.prototype.findButton = function(target) {
	return this.useNavBar ? 
	    target.frontMostApp().mainWindow().navigationBar().buttons()[this.buttonName] :
        target.frontMostApp().mainWindow().buttons()[this.buttonName];	
};
	
//every checkEvery() number of events our isTrue() method will be queried.
ButtonHandler.prototype.checkEvery = function() {
    return this.checkEveryNumber;
};

// if true then after we handle an event consider the particular Monkey event handled, and don't process the other condition handlers.
ButtonHandler.prototype.isExclusive = function() {
    return true;
};

// Press our button
ButtonHandler.prototype.handle = function(target, mainWindow) {
	this.statsHandleInvokedCount++;
	var button = this.findButton(target);
	if (button.validAndVisible()) {
		try{
		    button.tap();
		} catch(err) {
			this.statsHandleErrorCount++;
			UIALogger.logWarning(err);
		}
	} else {
		this.statsHandleNotValidAndVisibleCount++
		//UIALogger.logWarning(this.toString() + " button is not validAndVisible");
	};
};

ButtonHandler.prototype.toString = function() {
	return ["MonkeyTest::ButtonHandler(" + this.buttonName, this.checkEveryNumber, this.useNavBar, ")"].join();
};

ButtonHandler.prototype.logStats = function() {
	UIALogger.logDebug([this.toString(),
	    "IsTrueInvokedCount", this.statsIsTrueInvokedCount,
		"IsTrueReturnedTrue", this.statsIsTrueReturnedTrue,
		"IsTrueReturnedFalse", this.statsIsTrueReturnedFalse,
		"HandleInvokedCount", this.statsHandleInvokedCount,
		"HandleNotValidAndVisibleCount", this.statsHandleNotValidAndVisibleCount,
		"HandleErrorCount", this.statsHandleErrorCount].join());
};
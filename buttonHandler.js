// Copyright (c) 2015 Yahoo inc. (http://www.yahoo-inc.com)

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
	this.debugLogElementTreeOnIsTrue = false;
}

ButtonHandler.prototype.setDebugLogElementTreeOnIsTrue = function(aBool) {
	this.debugLogElementTreeOnIsTrue = aBool;
}

ButtonHandler.prototype.isObjectNil = function(anObject) {
	return anObject.toString() == "[object UIAElementNil]"
};

ButtonHandler.prototype.isValidAndVisible = function(aButtonOrNil) {
	if (this.isObjectNil(aButtonOrNil)) {
		return false;
	}
	//we now expect aButtonOrNil to be a button
	return aButtonOrNil.checkIsValid() && aButtonOrNil.isVisible();
}

// return true if we our button is visible 
ButtonHandler.prototype.isTrue = function(target, eventCount, mainWindow) {
	this.statsIsTrueInvokedCount++;
	var result;
	if (this.optionalIsTrueFunction == null) {
		if (this.debugLogElementTreeOnIsTrue) {
			UIATarget.localTarget().logElementTree();
		}
		var aButton = this.findButton(target);
		result = this.isValidAndVisible(aButton);
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
	if (this.isValidAndVisible(button)) {
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
"use strict";
#import "Includes.js"

var monkey = new UIAutoMonkey();
monkey.config.numberOfEvents = false;
monkey.config.minutesToRun = 2;
monkey.RELEASE_THE_MONKEY();

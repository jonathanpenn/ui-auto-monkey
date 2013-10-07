<img alt="UI AutoMonkey Mascot" src="https://raw.github.com/jonathanpenn/ui-auto-monkey/master/docimg/monkey.png">

UI AutoMonkey
=============

UI AutoMonkey is a simple to set up stress testing tool for iOS applications. You can pound on your app until it wilts with a barrage of taps, swipes, device rotations, and even locking and unlocking the home screen! Watch the app's performance characteristics with Instruments, discover race conditions, or just enjoy watching your work under [butt dialing conditions][butt].

  [butt]: http://en.wikipedia.org/wiki/Pocket_dialing

## Installation

There's nothing special to install since this leverages UI Automation and Instruments that come with Apple's developer tools. If you have Xcode, you've got all you need to stress test your applications with UI AutoMonkey. Follow the instructions below to set up a UI Automation Instruments template with the `UIAutoMonkey.js` script.

First, load up your app in Xcode. Choose "Profile" from the "Product" menu (or press Command-I) to build your application and launch the Instruments template picker.

<img alt="Building for Profile" src="https://raw.github.com/jonathanpenn/ui-auto-monkey/master/docimg/profile.png">

Next, you'll want to pick the "UI Automation" template. You can add in other instruments to measure the app's performance under the test after we set up the basic automation template.

Switch to the script pane by choosing "Script" from the dropdown menu in the middle dividing bar of the Instruments document.

<img alt="Choosing Template" src="https://raw.github.com/jonathanpenn/ui-auto-monkey/master/docimg/scriptpane.png">

Create a script in this Instruments document by choosing "Create..." from the "Add" button on the left sidebar.

<img alt="Choosing Template" src="https://raw.github.com/jonathanpenn/ui-auto-monkey/master/docimg/createscript.png">

Paste in the `UIAutoMonkey.js` script. Feel free to adjust the configuration parameters to taste. You'll find more discussion about them below.

At this point you can simply click the playback button at the bottom of the Instruments window to start the script. Boom. The monkey lives.

Once you've set up UI AutoMonkey in your Instruments document, you can create a custom template tied to this application that you can double click to run. First, make sure the Instruments document is stopped by clicking the red record button in *the upper left* of the Instruments document. Then choose "Save As Template..." from the "File" menu and choose where to put the file. Now, you can double click this template to open Instruments with the UI AutoMonkey script already embedded. Just click the red record button in *the upper left* of the Instruments document and the app will launch and run.

## Configuration and Beyond

For simplicity's sake, the tool is just a single script you paste into a UI Automation template for your application. You could wire it up in a [command line workflow][automation] if you want, but that would take a bit more effort than you need to just get it running.

At the top of the script, you'll see a JavaScript dictionary of configuration settings:

    config: {
      numberOfEvents: 1000,
      delayBetweenEvents: 0.05,    // In seconds

      // Events are triggered based on the relative weights here.
      // The event with this highest number gets triggered the most.
      eventWeights: {
        tap: 30,
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
    },

`numberOfEvents` is pretty straightforward. It's how many events will happen to your application.

`delayBetweenEvents` controls how many seconds (or fractions of seconds) the script waits before triggering the next random event. You might want to tweak this to taste. The script triggers events directly on the `UIATarget` so there is no natural timeout that you might be familiar with when interacting with `UIAElements`. The script will pummel the app with events as fast as it can generate them if you want it to.

`eventWeights` are relative weights to determine how often an event gets triggered. If the `tap` event is 100, and `orientation` is 1, then a tap is 100 times more likely to occur than a device orientation. Adjust these to match the best set of events for your application.

`touchProbability` controls the different kinds of `tap` events. By default, a tap is just a single tap. Adjust these settings to set how often a double tap or long press occurs. Each of these values must be between 0 and 1.

## Custom Use

You can import the monkey in an existing set of UI Automation script files and add custom events to trigger like so:

    // Usage & Customization example
    // Save this UIAutoMonkey.js somewhere in your disk to import it and configure it in each of your Instruments instances
    #import "/path/to/UIAutoMonkey.js"

    // Configure the monkey: use the default configuration but a bit tweaked
    monkey = new UIAutoMonkey()
    monkey.config.numberOfEvents = 1000;
    monkey.config.screenshotInterval = 5;
    // Of course, you can also override the default config completely with your own, using `monkey.config = { … }` instead

    // Configure some custom events if needed
    monkey.config.eventWeights.customEvent1 = 300;
    monkey.allEvents.customEvent1 = function() { … }

    // Release the monkey!
    monkey.RELEASE_THE_MONKEY();

Make sure you comment out the last line of `UIAutoMonkey.js` if you include it in your project:

    // UIAutoMonkey.RELEASE_THE_MONKEY();

By default, this script will execute the monkey automatically. If you want to trigger it yourself after setting up the object, you'll need to comment out that last line so it doesn't go off on it's own before you are ready.

Check out the built in events for more information and the helper methods available to you.

(Special thanks to [Oliver Halligon][o] for the new customization features!)

  [o]: https://github.com/AliSoftware

## For More Info

To make the most out of this, you'll want to level up on Instruments, Apple's official tool for evaluating usage and performance of your applications. Check out session 409 from the [WWDC 2012][wwdc2012] sessions (included for free with an Apple developer account), for more information.

  [wwdc2012]: https://developer.apple.com/videos/wwdc/2012/

To learn more about UI Automation, check out my [collection of resources][automation] on [cocoamanifest.net](http://cocoamanifest.net).

  [automation]: http://cocoamanifest.net/features/#ui_automation

## Contributing

Feel free to fork the project and submit a pull request. If you have any good ideas to make this easier to set up for new users, that would be great! I'm also looking for a good avatar to represent our fine monkey. Got some graphic skills?

## Contact

Jonathan Penn

- http://cocoamanifest.net
- http://github.com/jonathanpenn
- http://alpha.app.net/jonathanpenn
- http://twitter.com/jonathanpenn
- jonathan@cocoamanifest.net

## License

UIAutoMonkey is available under the MIT license. See the LICENSE file for more info.

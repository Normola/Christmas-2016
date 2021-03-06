const Five = require("johnny-five");
const Pixel = require("node-pixel");
const argv = require("minimist")(process.argv.slice(2));

const defaultBright = 30;
const defaultFPS = 30;
const defaultStripLength = 50;

var port = argv["com"];
var maxBright = argv["maxBright"] || defaultBright;
var help = argv["help"];
var fps = argv["fps"] || defaultFPS;
var offTime = argv["offTime"] || "0"
var stripLength = argv["stripLength"] || defaultStripLength;

var waitGap = false;
var pulseEven = true;

var redStaticColour = argv["redColor"] || (argv["redColour"]);
var greenStaticColour = argv["greenColor"] || (argv["greenColour"]);
var blueStaticColour = argv["blueColor"] || (argv["blueColour"]);

var alternate = argv["alternate"];

if (maxBright > 255) {
    maxBright = 255;
} 

if (maxBright < 0) {
    maxBright = 0;
}

var opts = {};
opts.port = port;

var Board = null;
var strip = null;

var pin = 2;

var red = 30;
var green = 100;
var blue = 150;

var pulseCycle = 0;
var pulseDirection = 1;

var redInterval = 0;
var greenInterval = 0;
var blueInterval = 0;

if (help == true) {
    showHelp();
}
else {
    showSettings();
    runBoard();
}

function runBoard() {
    Board = new Five.Board(opts);

    Board.on("ready", function() {
        strip = new Pixel.Strip({
            board: this,
            color_order: Pixel.COLOR_ORDER.RGB,
            controller: "FIRMATA",
            strips: [ {pin: pin, length: stripLength} ]
        });

        strip.on("ready", stripReady);
    });
}

function getPulseColour(redInterval, greenInterval, blueInterval, pulseCycle) {
    var redPulse = Math.ceil((redInterval * pulseCycle));
    var greenPulse = Math.ceil((greenInterval * pulseCycle));
    var bluePulse = Math.ceil((blueInterval * pulseCycle));
    
    return "rgb(" + greenPulse + "," +  redPulse + "," +  bluePulse + ")";
}

function setColours(r, g, b) {
    if (isNaN(r)) {
        r = random();
    }

    if (isNaN(g)) {
        g = random();
    }

    if (isNaN(b)) {
        b = random();
    }

    red = redStaticColour;
    if (red == undefined) {
        red = r;
    }
    
    green = greenStaticColour;
    if (green == undefined) {
        green = g;
    }

    blue = blueStaticColour;
    if (blue == undefined) {
        blue = b;
    }
}

function calcIntervals() {

    redInterval = 0;
    if (red > 0) {
        redInterval = red / 255;
    }

    blueInterval = 0;
    if (blue > 0) {
        blueInterval = blue / 255;
    }

    greenInterval = 0;
    if (green > 0) {
        greenInterval = green / 255;
    }

}

function random(low, high) {

    if (isNaN(low)) {
        low = 0;
    }

    if (isNaN(high)) {
        high = 255;
    }

    var rnd = Math.random() * (high - low) + low;

    return rnd;
}

function showHelp() {
    console.log("Usage:");
    console.log("   --help          [ Shows this help message ]");
    console.log("   --com comx      [ The com port to use.  COMX in windows, /dev/usbx in linux.  Leave blank to allow Johnny-Five to find the first port.]");
    console.log("   --maxBright n   [ The maximum brightness to achive.  0 - 255.  Defaults to " + defaultBright + " ]");
    console.log("   --fps n         [ The frames per second to attempt to achive.  This is hardware limiited.  Defaults to " + defaultFPS + " ]");
    console.log("   --redColour n   [ The red component for a single colour to light the LEDs to ]");
    console.log("   --redGreen n    [ The green component for a single colour to light the LEDs to ]");
    console.log("   --redBlue n     [ The blue component for a single colour to light the LEDs to ]");
    console.log("   --redColor n    [ Alias for --redColour ]");
    console.log("   --greenColor n  [ Alias for --greenColour ]");
    console.log("   --blueColor n   [ Alias for --blueColour ]");
    console.log("   --offTime n     [ Amount of time in ms to wait between pulses.  No wait by default.]")
    console.log("   --alternate     [ Strobe alternate sets of lights ]");
    console.log("   --stripLength n [ The length of the strip to drive.  Defaults to " + stripLength + " ]")
}

function showSettings() {
    var redStatus = "off";
    var greenStatus = "off";
    var blueStatus = "off";

    if (redStaticColour != undefined) {
        redStatus = redStaticColour
    } 

    if (greenStaticColour != undefined) {
        greeenStatus = greenStaticColour
    } 

    if (blueStaticColour != undefined) {
        blueStatus = blueStaticColour
    } 

    var alternateStatus = "off";
    if (alternate != undefined) {
        alternateStatus = "on";
    }
    
    console.log("");
    console.log("");
    console.log("Using the following settings:");
    console.log("   COM Port: " + (port ? port : "first available"));
    console.log("   Max Brightness: " + maxBright);
    console.log("   Max FPS: " + fps);
    console.log("   Red Static components is: " + redStatus);
    console.log("   Green Static components is: " + greenStatus);
    console.log("   Blue Static components is: " + blueStatus);
    console.log("   Off time is: " + offTime);
    console.log("   Alternate: " + alternateStatus)
    console.log("   length: " + stripLength)
    console.log("");
}

function pulseFunction() {
    if (!waitGap) {
        if (pulseCycle == 0) {
            setColours();
            calcIntervals();
        }

        if (pulseCycle > (maxBright)) {
            pulseDirection = -1;
        }

        if (pulseCycle < 0) {
            pulseDirection = 1;
            waitGap = true;
            pulseEven = !pulseEven;
            
            var wait = setTimeout(function() {
                waitGap = false;
            }, offTime);
        }

        pulseColour = getPulseColour(redInterval, greenInterval, blueInterval, pulseCycle);

        if (!alternate) {
            strip.color(pulseColour);
            strip.show();
        }
        else {
            alternateStrip(pulseColour);
            strip.show();
        }
        
        pulseCycle+= pulseDirection;
    }
}

function stripReady() {
    var pulse = setInterval(pulseFunction, 1000 / fps)
}

function alternateStrip(pulseColour) {
    var j = 0;
    var i = 0;
    if (!pulseEven) {
        i++;
    }

    for (i; i < stripLength; i+=2) {
        setAlternatePixel(pulseColour, i);
    }
}

function setAlternatePixel(pulseColour, location) {
    strip.pixel(location).color(pulseColour);
}

function isEven(n) {
    return n == parseFloat(n) && !( n % 2 );
}
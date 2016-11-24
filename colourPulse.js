const Five = require("johnny-five");
const Pixel = require("node-pixel");
const argv = require("minimist")(process.argv.slice(2));


var port = argv["com"] || "COM1";
var maxBright = argv["maxBright"] || "30"
var help = argv["help"]
var fps = argv["fps"] || 60
var redStaticColour = argv["redColor"] || (argv["redColour"]);
var greenStaticColour = argv["greenColor"] || (argv["greenColour"]);
var blueStaticColour = argv["blueColor"] || (argv["blueColour"]);

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
var stripLength = 50;

var red = 30;
var green = 100;
var blue = 150;

var pulseCycle = 0;
var pulseDirection = 1;


var redInterval = 0;
var greenInterval = 0;
var blueInterval = 0;

if (help == true) {
    console.log("Usage:");
    console.log("   --help          [ Shows this help message ]");
    console.log("   --com           [ The com port to use.  COMX in windows, /dev/usbx in linux.  Defaults to COM1 ]");
    console.log("   --maxBright     [ The maximum brightness to achive.  0 - 255.  Defaults to 30 ]");
    console.log("   --fps           [ The frames per second to attempt to achive.  This is hardware limiited.  Defaults to 60 ]");
    console.log("   --redColour     [ The red component for a single colour to light the LEDs to ]");
    console.log("   --redGreen      [ The green component for a single colour to light the LEDs to ]");
    console.log("   --redBlue       [ The blue component for a single colour to light the LEDs to ]");
    console.log("   --redColor      [ Alias for --redColour ]");
    console.log("   --greenColor    [ Alias for --greenColour ]");
    console.log("   --blueColor     [ Alias for --blueColour ]");
}
else {
    console.log("Using the following settings:");
    console.log("   COM Port: " + port);
    console.log("   Max Brightness: " + maxBright);
    console.log("   Max FPS: " + fps);
    console.log("   Red Static components is: " + redStaticColour || "off");
    console.log("   Green Static components is: " + greenStaticColour || "off");
    console.log("   Blue Static components is: " + blueStaticColour || "off");
    console.log("");

    runBoard();
}

function runBoard() {
    Board = new Five.Board(opts);

    Board.on("ready", function() {
        strip = new Pixel.Strip({
            board: this,
            color_order: Pixel.COLOR_ORDER.RGB,
            controller: "FIRMATA",
            strips: [ {pin: pin, length: stripLength}]
        });

        var delay = fps;

        strip.on("ready", function() {
            var pulse = setInterval(function(){
            
            if (pulseCycle == 0) {
                setColours();
                calcIntervals();
            }
            if (pulseCycle >(maxBright -1)) {
                pulseDirection = -1;
            }

            if (pulseCycle <0) {
                pulseDirection = 1;
            }

            pulseColour = getPulseColour(redInterval, greenInterval, blueInterval, pulseCycle);

            strip.color(pulseColour);
            strip.show();
            
            pulseCycle+= pulseDirection;
                
            }, 1000/delay);
        });
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
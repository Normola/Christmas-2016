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
var stripLength = argv["stripLength"] || defaultStripLength;

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

var red = 30;
var green = 100;
var blue = 150;

var chaseCycle = 0;
var chaseDirection = 1;

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
            controller: "FIRMATA",
            strips: [ { pin: pin, length: stripLength } ]
        });

        strip.on("ready", stripReady);
    });
}

function stripReady() {
    var chase = setInterval(chaseFunction, 1000 / fps)
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
    
    console.log("");
    console.log("");
    console.log("Using the following settings:");
    console.log("   COM Port: " + (port ? port : "first available"));
    console.log("   Max Brightness: " + maxBright);
    console.log("   Max FPS: " + fps);
    console.log("   Red Static components is: " + redStatus);
    console.log("   Green Static components is: " + greenStatus);
    console.log("   Blue Static components is: " + blueStatus);
    console.log("   length: " + stripLength)
    console.log("");
}

function chaseFunction() {

    if (chaseCycle == 0) {
        setColours();
    }

    if (chaseCycle >= (stripLength - 1)) {
        chaseDirection = -1;
    }

    if (chaseCycle <=0) {
        chaseDirection = 1;
    }

    chaseColour = setChaseColour(red, green, blue, chaseCycle);
    strip.color("black");
    strip.pixel(chaseCycle).color(chaseColour);
    strip.show(); 
    
    chaseCycle += chaseDirection;

    
}

function setColours(r, g, b) {
    if (isNaN(r)) {
        r = (random() / 255) * maxBright;
    }

    if (isNaN(g)) {
        g = (random() / 255) * maxBright;
    }

    if (isNaN(b)) {
        b = (random() / 255) * maxBright;
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

function setChaseColour(red, green, blue, chaseCycle) {
    var redChase = Math.ceil(red);
    var greenChase = Math.ceil(green);
    var blueChase = Math.ceil(blue);
    
    return "rgb(" + greenChase + "," +  redChase + "," +  blueChase + ")";
}

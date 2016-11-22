var Five = require("johnny-five");
var Pixel = require("node-pixel");

var Board = new Five.Board();
var strip = null;

var pin = 2;
var stripLength = 50;

var red = 30;
var green = 100;
var blue = 150;

var fps = 60;
var pulseCycle = 0;
var pulseDirection = 1;

var maxBright = 30;

var redInterval = 0;
var greenInterval = 0;
var blueInterval = 0;

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
        //console.log(pulseColour);
        strip.color(pulseColour);
        strip.show();
        
        pulseCycle+= pulseDirection;
            
        }, 1000/delay);
    });
});

function getPulseColour(redInterval, greenInterval, blueInterval, pulseCycle) {
    var redPulse = Math.ceil((redInterval * pulseCycle));
    var greenPulse = Math.ceil((greenInterval * pulseCycle));
    var bluePulse = Math.ceil((blueInterval * pulseCycle));
    
    //console.log ("redInter: " + redInterval)
    //console.log("pulseCycle: " + pulseCycle);
    
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

    red = r;
    green = g;
    blue = b;
}

function calcIntervals() {

    redInterval = 0;
    if (red > 0) {
        redInterval = red / 255;
    }

    //console.log (redInterval) 
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
var Five = require("johnny-five");
var Pixel = require("node-pixel");

var Board = new Five.Board();
var strip = null;

var pin = 2;
var stripLength = 50;

Board.on("ready", function() {
    strip = new Pixel.Strip({
        board: this,
        controller: "FIRMATA",
        strips: [ {pin: pin, length: stripLength}]
    });

    strip.on("ready", function() {
        for (var j = 0; j < 10; j++) {
            for(var i = 0; i < 50; i++) {
                strip.pixel(i).color([random(), random(), random()]);
            }
            strip.show();            
        }
    })
});


function random(low, high) {
    if (isNaN(low)) {
        low = 0;
    }

    if (isNaN(high)) {
        high = 255;
    }

    var rnd = Math.random() * (high - low) + low;
    
    //console.log(rnd);
    return rnd;
}
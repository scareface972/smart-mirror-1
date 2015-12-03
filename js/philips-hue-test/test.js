var Hue = require('philips-hue-api'),
    hue = Hue('http://192.168.1.136/api/60968094809a5a0f36182d241c859f/');

hue.lights(2).off(); // Turns on light number 1.

// Hue('http://192.168.1.136/api/60968094809a5a0f36182d241c859f/').lights().list(function(error, lights) {
//     console.log(lights);
// });
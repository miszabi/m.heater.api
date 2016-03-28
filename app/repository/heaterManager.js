/**
 * Created by Miskolczy on 11/1/2015.
 */
var gpio = require('pi-gpio'),
    constants = require('../common/constants'),
    _isHeaterRunning = 0;

function startHeater(callback){
    gpio.open(constants.heater.PIN_NUMBER, "output", function(error){console.log(error)
        gpio.write(constants.heater.PIN_NUMBER, 0, function(err) {          // Set pin constants.heater.PIN_NUMBER low (0)
            gpio.close(constants.heater.PIN_NUMBER);                     // Close pin constants.heater.PIN_NUMBER
            if(err){
                console.log(err);
                callback(0);
                return;
            }
            _isHeaterRunning = 1;
            callback(1);
        });
    });
}

function stopHeater(callback){
    gpio.open(constants.heater.PIN_NUMBER, "output", function(error){console.log(error)
        gpio.write(constants.heater.PIN_NUMBER, 1, function(err) {          // Set pin constants.heater.PIN_NUMBER high (1)
            gpio.close(constants.heater.PIN_NUMBER);                     // Close pin constants.heater.PIN_NUMBER
            if(err){
                callback(0);
                return;
            }
            _isHeaterRunning = 0;
            callback(1);// Close pin constants.heater.PIN_NUMBER
        });
    });
}

function isHeaterRunning(callback){
   callback({data : _isHeaterRunning})
}

module.exports = {
    startHeating : startHeater,
    stopHeating : stopHeater,
    isHeaterRunning : isHeaterRunning
};
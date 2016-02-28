/**
 * Created by Miskolczy on 2/28/2016.
 */
var progWorkDay = require('../config/progWorkdays.json'),
    heaterManager = require('./heaterManager'),
    thermoRepository = require('./thermoRepository');

var methods = {
    init : function(){
        setInterval(function(){
            var currentDateTime = new Date();
            console.log(currentDateTime);

            function getCurrentTempCallback(result, err){
                if(err){
                    console.log(err);
                } else {
                    console.log('temperature check')
                    console.log(result.Value <= progWorkDay.day.minTemperature);

                    if(methods.isDayLight(currentDateTime) && result.Value <= progWorkDay.day.minTemperature && methods.isHeatingTime(currentDateTime)){
                        heaterManager.isHeaterRunning(function(data){
                            console.log('is heater isHeaterRunning before start heating');
                            console.log(data);
                            if(data.data == 0){
                                heaterManager.startHeating(function(c){
                                    thermoRepository.logOperation(1);
                                });
                            }
                        });
                    }
                    else {
                        heaterManager.isHeaterRunning(function(data){
                            if(data.data == 1){
                                heaterManager.stopHeating(function(c){
                                    thermoRepository.logOperation(0);
                                });
                            }
                        });
                    }
                }
            }

            methods.getCurrentTemp(getCurrentTempCallback);

        }, 60 * 1000);
    },
    isDayLight: function(currentDateTime){
        if(currentDateTime.getHours() >= 6 && currentDateTime.getHours() < 23){
            console.log('isDayLight')
            return true;
        }
        return false;
    },
    getCurrentTemp : function(callback){
        thermoRepository.getLastMeasurement(callback);
    },
    isHeatingTime :function (currentDateTime){
        console.log('isHeatingTime')
        var day = {
                timeRanges : []
            },
            fromTime = new Date(),
            toTime = new Date();

        for(var i= 0, j = progWorkDay.day.timeRanges.length; i< j; i++ ){
            var currentItem = progWorkDay.day.timeRanges[i],
                fromHourAndMinuteArray = currentItem.fromTime.split(':'),
                toHourAndMinuteArray = currentItem.toTime.split(':');

            fromTime.setHours(fromHourAndMinuteArray[0],fromHourAndMinuteArray[1],0);
            toTime.setHours(toHourAndMinuteArray[0],toHourAndMinuteArray[1],0);
            day.timeRanges.push({fromTime: fromTime , toTime : toTime});

            console.log(fromTime);
            console.log(toTime);
            if(currentDateTime > fromTime && currentDateTime < toTime){
                return true;
            }
        }
        console.log('isnt heating time')
        return false;
    }
};

module.exports = {
    init : methods.init
};

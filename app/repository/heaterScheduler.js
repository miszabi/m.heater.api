/**
 * Created by Miskolczy on 2/28/2016.
 */

var progWorkDay1 = require('../config/progWorkdays.json'),
    heaterManager = require('./heaterManager'),
    thermoRepository = require('./thermoRepository'),
    fs = require('fs');

var methods = {
    init : function(){
        setInterval(function(){
            var currentDateTime = new Date();

            function getCurrentTempCallback(result, err){
                if(err){
                    console.log(err);
                } else {

                    var progWorkDay = JSON.parse(fs.readFileSync('../config/progWorkdays.json').toString())[methods.getDay(currentDateTime)];

                    heaterManager.isHeaterRunning(function(data){
                        var currentTimeRange = methods.getHeatingTime(currentDateTime, progWorkDay);

                        if(data.data == 1){
                            if(currentTimeRange == undefined || result.Value >= currentTimeRange.maxTemperature){
                                heaterManager.stopHeating(function(c){
                                    thermoRepository.logOperation(0);
                                });
                            }
                        } else {

                            if(result.Value <= currentTimeRange.minTemperature){
                                heaterManager.startHeating(function(c){
                                    thermoRepository.logOperation(1);
                                });
                            } else {

                            }
                        }
                    });
                }
            }

            methods.getCurrentTemp(getCurrentTempCallback);

        }, 60 * 1000);
    },
    isDayLight: function(currentDateTime){
        if(currentDateTime.getHours() >= 5 && currentDateTime.getHours() < 23){
            console.log('isDayLight')
            return true;
        }
        return false;
    },
    getCurrentTemp : function(callback){
        thermoRepository.getLastMeasurement(callback);
    },
    getDay : function (date){
        switch(date.getDay()){
            case 0:
                return "sunday";
            case 1:
                return "monday";
            case 2:
                return "tuesday";
            case 3:
                return "wednesday";
            case 4:
                return "thursday";
            case 5:
                return "friday";
            case 6:
                return "sunday";
        }
    },
    ///return heater setting for the given hour or false
    getHeatingTime : function (currentDateTime, progWorkDay){
        var day = {
                timeRanges : []
            },
            fromTime = new Date(),
            toTime = new Date();

        for(var i= 0, j = progWorkDay.timeRanges.length; i< j; i++ ){
            var currentItem = progWorkDay.timeRanges[i],
                fromHourAndMinuteArray = currentItem.fromTime.split(':'),
                toHourAndMinuteArray = currentItem.toTime.split(':');

            fromTime.setHours(fromHourAndMinuteArray[0],fromHourAndMinuteArray[1],0);
            toTime.setHours(toHourAndMinuteArray[0],toHourAndMinuteArray[1],0);
            day.timeRanges.push({fromTime: fromTime , toTime : toTime});

            if(currentDateTime > fromTime && currentDateTime < toTime){
                return currentItem;
            }
        }

        return undefined;
    }
};

module.exports = {
    init : methods.init
};
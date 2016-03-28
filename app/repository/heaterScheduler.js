/**
 * Created by Miskolczy on 2/28/2016.
 */
var progWorkDay = require('../config/progWorkdays.json'),
    heaterManager = require('./heaterManager'),
    thermoRepository = require('./thermoRepository'),
    heaterStartDateTime = undefined;

var methods = {
    init : function(){
        setInterval(function(){
            var currentDateTime = new Date();

            function getCurrentTempCallback(result, err){
                if(err){
                    console.log(err);
                } else {
                    if(methods.isDayLight(currentDateTime) && result.Value <= progWorkDay.day.minTemperature && methods.isHeatingTime(currentDateTime)){
                        heaterManager.isHeaterRunning(function(data){
                            if(data.data == 0){
                                heaterManager.startHeating(function(c){
                                    heaterStartDateTime = new Date();
                                    thermoRepository.logOperation(1);
                                });
                            }
                        });
                    }
                    else {
                        heaterManager.isHeaterRunning(function(data){
                            if(data.data == 1){
                                heaterManager.stopHeating(function(c){
                                    methods.getRunningMinutes();
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
    getRunningMinutes : function(){
        if(heaterStartDateTime !== undefined){
            var currentTime = new Date();
            return runningMinutes = Math.abs(currentTime - heaterStartDateTime) * 1000 * 60;
        }

        return 0;
    },
    getWeekday : function (){
        var date = new Date();
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
    isDayLight: function(currentDateTime){
        //this method is falsy because we doesn't check the sunrise and sunsat :(
        if(currentDateTime.getHours() >= 6 && currentDateTime.getHours() < 23){
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

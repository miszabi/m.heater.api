/**
 * Created by Miskolczy on 10/23/2015.
 */
module.exports = {
    responseState : {
        FAILED : 0,
        SUCCESS : 1
    },
    statusCode : {
        OK : 200,
        CREATED :201,
        FORBIDDEN : 403,
        NOT_FOUND : 404,
        INTERNAL_ERROR : 500
    },
    heater : {
        PIN_NUMBER : 26//gpio7
    },
    heaterOperationType : {
        START : 1,
        STOP : 0
    },
    gpioPinStatus : {
        HIGH : 1,
        LOW : 0
    }
}
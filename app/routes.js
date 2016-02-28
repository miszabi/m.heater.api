/**
 * Created by Miskolczy on 10/23/2015.
 */
var express     = require('express'),
    jwt         = require('jsonwebtoken'),
    constants   = require('./common/constants'),
    User        = require('./model/user'),
    thermoRepository = require('./repository/thermoRepository'),
    heaterManager = require('./repository/heaterManager');

/*var methods = {
    isHeatTime : function(){
        var currentDate = new Date();
        return  currentDate.getHours() > 5 && currentDate.getHours() < 23;
    },

    getCurrentTemperature : function (callback){
        thermoRepository.getLastMeasurement(function(result, err){
            if(err){
              //log
                callback(30);
            } else {
                callback(result.Value);
            }
        });
    },

    heatIfCold : function(){
        if(this.isHeatTime()){
            var isHeaterRunning = false;
            heaterManager.isHeaterRunning(function(result){
                isHeaterRunning = result;
            });

            this.getCurrentTemperature(function(result){
                if(result < 22){

                }
            });
        }
    }
};*/

/*TODO testit
 setInterval(function(){
     var currentHour = new Date().getHours();
     if(currentHour >= 5.30 && currentHour <= 6.30){
        heaterManager.isHeaterRunning(function(data){
        if(data.data == 0){
            heaterManager.startHeating(function(c){});
            }
        });
    } else {
        heaterManager.isHeaterRunning(function(data){
        if(data.data == 1){
            heaterManager.stopHeating(function(c){ });
            }
        });
     }
 }, 60 * 1000);
 */


module.exports = function(app){

    var apiRoutes = express.Router();

    apiRoutes.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        if ('OPTIONS' == req.method) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');

            res.status(204).end();
        }
        else {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            next();
        }
    });

    apiRoutes.get('/', function(req, res) {
        res.json({success : constants.responseState.SUCCESS, v : '0.0.1'});
    });

    apiRoutes.post('/authenticate', function(req, res) {
        ///TODO from database
        if(req.body.user == 'x' && req.body.password == 'x'){
            var token = jwt.sign({userName:req.body.name, password : req.body.password }, app.get('superSecret'), {
                expiresInMinutes: 1440 // expires in 24 hours
            });
            res.json({
                success: constants.responseState.SUCCESS,
                token: token
            });
        }
        else
        {
            res.json({ success: constants.responseState.FAILED, message: 'Authentication failed. Wrong username or password' });
        }
    });

    apiRoutes.use(function(req, res, next) {
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        if (token) {

            jwt.verify(token, app.get('superSecret'), function(err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    next();
                }
            });

        } else {

            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    });

    apiRoutes.post('/temperature', function(req, res) {

        thermoRepository.getLastMeasurement(function(result, err){
            if(err){
                res.json({status : constants.responseState.FAILED, message : err })
                return;
            }
            res.json({status : constants.responseState.SUCCESS, data : result});
        });
    });

    apiRoutes.post('/temperatures', function(req, res) {

        thermoRepository.getMaxMeasurement(req.body.date, function(result, err){

            if(err){
                res.json({status : constants.responseState.FAILED, message : err })
                return;
            }            

            res.json({status : constants.responseState.SUCCESS, data : result});
            return;
        });
    });

    apiRoutes.get('/heaterOn', function(req, res) {
        heaterManager.startHeating(function(result){
            if(result){
                thermoRepository.logOperation(1);
                res.json({success : constants.responseState.SUCCESS });
                return;
            }
            else {
                res.json({success : constants.responseState.FAILED });
            }
        });
    });

    apiRoutes.get('/heaterOff', function(req, res) {
        heaterManager.stopHeating(function(result){
            if(result){
                thermoRepository.logOperation(0);
                res.json({success : constants.responseState.SUCCESS });
                return;
            }

            res.json({success : constants.responseState.FAILED });
        });
    });

    apiRoutes.get('/heaterStatus', function(req, res) {
        heaterManager.isHeaterRunning(function(result){
            if(result){
                res.json({success : constants.responseState.SUCCESS, result: result.data });
                return;
            }

            res.json({success : constants.responseState.FAILED });
        });
    });

    app.use('/api', apiRoutes);
}

/**
 * Created by Miskolczy on 10/28/2015.
 */
var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 100, //important
    host     : '192.168.1.103',
    user     : 'root',
    password : '',
    database : 'HAutomation',
    port:    3306
});

function logOperation(operation){
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            //log
        }
        var what = {Operation : operation, CreationDate: new Date()};
        connection.query("INSERT INTO `HeaterLog` SET ? ", what, function(err,rows){
            connection.release();
            if(!err) {
                console.log('succes insert')
            }
            else {
                console.log(err);
            }
        });

        connection.on('error', function(err) {
            console.log(error);
            return;
        });
    });
}

function getLastMeasurement(callback){

    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            //log
            callback(false, err)
        }

        connection.query("SELECT * FROM Measurements ORDER BY CreationDate DESC LIMIT 1", function(err,rows){
            connection.release();
            if(!err) {
                callback(rows[0], err);
            }
        });

        connection.on('error', function(err) {
            callback(false,err)
            return;
        });
    });
}

function getMaxMeasurement(date, callback){
    pool.getConnection(function(err, connection){
        if (err) {
            connection.release();
            //log
            callback(false,err);
        }
        var _fromDate = new Date(date);
        _fromDate.setHours(0,0,0,0);
        var _toDate = new Date(date);
        _toDate.setHours(23,59,59,999);
        var where = [_fromDate,_toDate];
        connection.query("SELECT HOUR( CreationDate ) AS Hour, MAX( Value ) as maximumValue, MIN( Value ) as minimumValue, AVG( Value ) as averageValue FROM  `Measurements` WHERE CreationDate BETWEEN ? AND ? GROUP BY HOUR( CreationDate ) order by CreationDate asc", where, function(err,rows){
            connection.release();
            if(!err) {
                callback(rows, err);
            }
            else {
                callback(null, err);
            }
        });

        connection.on('error', function(err) {
            console.log(error);
            callback(false,err)
            return;
        });
    });
}

function getAvgMeasurement(){

}

//function getMaxMeasurement(date)
/*SELECT creationdate, MAX( Value )
 FROM  `Measurements`
 WHERE CreationDate
 BETWEEN  '2015-10-28 00:00:00'
 AND  '2015-10-28 23:59:59'
 GROUP BY HOUR( CreationDate )
 LIMIT 0 , 30*/

module.exports = {
    getLastMeasurement : getLastMeasurement,
    getMaxMeasurement : getMaxMeasurement,
    getAvgMeasurement : getAvgMeasurement,
    logOperation : logOperation
};

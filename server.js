/**
 * Created by Miskolczy on 10/23/2015.
 */

var express 	= require('express'),
    app         = express(),
    bodyParser  = require('body-parser'),
    morgan      = require('morgan'),
    mongoose    = require('mongoose'),
    config      = require('./app/config/conf'),
    thermoRepository = require('./repository/thermoRepository'),
    heaterManager = require('./repository/heaterManager');

var port = process.env.PORT || 3001;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});
//close the mongoose connection if application close/ shutdown
function onApplicationClose(){
    mongoose.connection.close(function(){
        process.exit(0);
    });
}
process.on('SIGINT', onApplicationClose).on('SIGTERM', onApplicationClose);

require('./app/routes')(app); //configure our routes

app.listen(port);
console.log('Magic happens at http://localhost:' + port);
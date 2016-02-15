/**
 * Created by Miskolczy on 10/23/2015.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema(
    {
        firstName: String,
        lastName: String,
        userName : String,
        password: String,
        active: Boolean,
        createDate : {type:Date, default : Date.now}
    });

var temperatureSchema = new Schema (
    {
        value : Number,
        createDate : { type: Date, default:Date.now}
    });

module.exports = {
    User : mongoose.model('User', userSchema),
    Temperature : mongoose.model('Temperatures', temperatureSchema)
}
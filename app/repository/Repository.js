/**
 * Created by Miskolczy on 10/23/2015.
 */
var models = require('../model/user');

var Repository = function(key){
    this.key = key;
};

Repository.prototype.single = function(obj){
    if(obj == undefined){
        new Error("obj is undefined");
    }

    models[this.key].findOne(obj, function (err, model){
        if (err) {
            return null;
        } else {
            return model;
        }
    });
};

Repository.prototype.find = function(callback, criteria, sort){
    if(criteria == undefined){
        criteria = {};
    }

    if(sort != undefined){
        models[this.key].find(criteria, callback).sort(sort);
    }
    else {
        models[this.key].find(criteria, callback);
    }
};

Repository.prototype.findOne = function(callback, criteria){
    if(criteria == undefined){
        criteria = {};
    }

    models[this.key].findOne(criteria, callback);
};

Repository.prototype.lastOne = function(callback, sort){

    models[this.key].findOne({}, {}, sort, callback);
};

Repository.prototype.store = function(model, callback){

    model.save(function (err, model){
        if (err){

            callback({success: 0});
        }
        else {
            callback(model);
        }
    });
};

Repository.prototype.update = function(id, updateProps, callback){
    models[this.key].findByIdAndUpdate(id, { $set : updateProps }, callback);
};

module.exports = Repository;
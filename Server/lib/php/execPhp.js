var execPhp = require('exec-php'),
    config = require('../../config'),
    path=require('path'),
    q = require('q');

module.exports=function(phpFileName, callback){
    var def= q.defer();
    execPhp(phpFileName, path.join(__dirname, 'bin/php.exe'), function(error, php, outprint){
        if(php) def.resolve(php, outprint);
        if(error) def.reject(error);
        if(callback) {
            callback(error, php, outprint);
        }
    });
    return def.promise
};
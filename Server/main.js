var app = require('./lib/expressApp'),
    auth = require('./lib/auth'),
//execPhp = require('./lib/php/execPhp'),
    watch = require('./lib/watch'),
    watch_list=require('require-dir')('./watch_list'),
    routes = require('require-dir')('./routes'),
    config = require('./config');


auth().then(function () {

    var watchList = [];
    for(var key in watch_list){
        watchList.push(watch_list[key])
    }
    watch(watchList);
    //execPhp('test.php').then(function(php, outprint){
    //    console.log(outprint);
    //    console.log(php);
    //}, function(error){
    //    console.log(error);
    //})


    ///////////////////
    var port=8080;
    app.listen(port, function () {
        console.log('Server listening on: http://localhost:'+port)
    });

});
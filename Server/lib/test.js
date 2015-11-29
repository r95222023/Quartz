var config=require('../config'),
    q=require('q');

var test= function(){
  var def= q.defer();
    def.resolve('klsdjfl');
    //console.log('rejected');
    return def.promise
};

var test2= function(){
    var def= q.defer();
    def.reject('aaaaa');
    //console.log('rejected');
    return def.promise
};

var promise= q.all([test(),test2(), 'jkljks']);
promise.then(function(res){
    console.log('resolved',res);
}, function(error){
    console.log('rejected', error)
});
module.exports=function(){
    console.log(config.test);
    config.test='changed';
};
var config=require('../config');


module.exports=function(){
    console.log(config.test);
    config.test='undo';
};
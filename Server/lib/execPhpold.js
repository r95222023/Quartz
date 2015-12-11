var express = require('express'),
    http = require('http'),
    path = require('path'),
    q = require('q'),
    config = require('../config');

var phpServerPort = process.env.PORT || 3000;
var def = q.defer();

// require php-express and config
phpExpress = require('php-express')({
    binPath: path.join(__dirname, config.PHP_BIN_PATH) // php bin path.
});

// init express
var app = express();
app.set('port', phpServerPort);
app.use(express.bodyParser());  // body parser is required!!


// set view engine to php-express
app.set('views', path.join(__dirname, 'php'));
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// routing all .php file to php-express
app.all(/.+\.php$/, phpExpress.router);


http.createServer(app).listen(app.get('port'), function () {
    def.resolve();
    console.log('Express server listening on port ' + app.get('port'));
});


function execPhp(mainPath, params) {
    def.promise.then(function(){
        var path = '/' + mainPath + '?';

        for (var key in params) {
            path = path + key + '=' + params[key] + '&'
        }

        var options = {
            host: 'localhost',
            port: phpServerPort,
            path: path
        };
        var req = http.get(options, function (response) {
            // handle the response
            var res_data = '';
            response.on('data', function (chunk) {
                res_data += chunk;
            });
            response.on('end', function () {
                console.log(res_data);
            });
        });
        req.on('error', function (e) {
            console.log("Got error: " + e.message);
        });
    });
}

module.exports = execPhp;
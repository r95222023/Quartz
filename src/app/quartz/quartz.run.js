(function () {
    'use strict';

    angular
        .module('quartz')
        .run(runFunction);

    /* @ngInject */
    function runFunction($rootScope, Idle, $window, $http, $state, $mdSidenav, qtMenu, qtSettings, promiseService, Auth, $firebase, config) {
        //// add a class to the body if we are on windows
        if ($window.navigator.platform.indexOf('Win') !== -1) {
            $rootScope.bodyClasses = ['os-windows'];
        }
        //// get client's geoip
        promiseService.add('geoip', function (resolve, reject) {
            //for some reason the following doesn't work
            //$http.get('https://www.freegeoip.net/json/').then(function (response) {
            //    console.log(response);
            //    resolve(response);
            //}, function (error) {
            //    reject(error);
            //});
            var time = setTimeout(resolve, 20000);
            window.getGeoIp = function (res) {
                clearTimeout(time);
                resolve(res);
            };
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.src = "https://freegeoip.net/json/?callback=getGeoIp";
            document.body.appendChild(s);
        }, true);

        $rootScope.debug = config.debug;
        if (config.debug) console.log('debug mode');
        
        //idle: moved to Idle service



        //// detect if user is logged in: moved to authentication service
        
    }
})();

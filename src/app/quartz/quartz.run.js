(function() {
    'use strict';

    angular
        .module('quartz')
        .run(runFunction);

    /* @ngInject */
    function runFunction($rootScope, Idle, $window, $http, $state, $mdSidenav, promiseService, Auth, $firebase, config) {
        //// add a class to the body if we are on windows
        if($window.navigator.platform.indexOf('Win') !== -1) {
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
            var time = setTimeout(resolve,20000);
            window.getGeoIp = function (res) {clearTimeout(time);resolve(res);};
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.src = "https://freegeoip.net/json/?callback=getGeoIp";
            document.body.appendChild(s);
        },true);

        $rootScope.debug = config.debug;
        if (config.debug) console.log('debug mode');

        promiseService.add('userData');

        //// watch if user is idle
        $rootScope.$on('IdleStart', function() {
            // the user appears to have gone idle
            console.log('idle start');
            Firebase.goOffline();
        });
        $rootScope.$on('IdleEnd', function() {
            // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
            console.log('idle end');
            Firebase.goOnline();
        });
        if(!($rootScope.user&&$rootScope.user.admin)) Idle.watch();

        //// get client config
        $firebase.ref('config/client').once('value', function (snap) {
            $rootScope.clientConfig = snap.val();
        });


        //// detect if user is logged in
        Auth.$onAuth(function (user) {
            $rootScope.user = user;
            $rootScope.loggedIn = !!user;

            promiseService.reset('userData');

            if (user) {
                $firebase.params = {
                    '$uid': user.uid
                };
                $rootScope.loggedIn = !!user;

                var loadList = {
                    info: {
                        refUrl: 'users/' + user.uid + '/info'
                    },
                    createdTime: {
                        refUrl: 'users/' + user.uid + '/createdTime'
                    }
                };

                $firebase.load(loadList).then(function (res) {
                    user.createdTime = res.createdTime;
                    user.info = res.info;
                    $rootScope.user = user;
                    promiseService.resolve('userData', $rootScope.user);
                    console.log($rootScope.user);
                });
            } else {
                console.log('no user', user);
                promiseService.resolve('userData', $rootScope.user);
                $firebase.params = {};
            }
        });
    }
})();

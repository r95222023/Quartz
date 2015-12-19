(function() {
    'use strict';

    angular
        .module('quartz')
        .run(runFunction);

    /* @ngInject */
    function runFunction($rootScope, $window, $http, $state, $mdSidenav, promiseService, Auth, $firebase, config) {
        // add a class to the body if we are on windows
        if($window.navigator.platform.indexOf('Win') !== -1) {
            $rootScope.bodyClasses = ['os-windows'];
        }
        // get client's geoip
        promiseService.add('geoip', function (resolve, reject) {
            $http.get('https://www.freegeoip.net/json/').then(function (response) {
                console.log(response);
                resolve(response);
            }, function (error) {
                reject(error);
            });
        });

        $rootScope.debug = config.debug;
        if (config.debug) console.log('debug mode');

        promiseService.add('userData');

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

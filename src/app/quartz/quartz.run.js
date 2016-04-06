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


        //// watch if user is idle
        $rootScope.$on('IdleStart', function () {
            // the user appears to have gone idle
            console.log('idle start');
            Firebase.goOffline();
        });
        $rootScope.$on('IdleEnd', function () {
            // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
            console.log('idle end');
            Firebase.goOnline();
        });
        if (!($rootScope.user && $rootScope.user.admin)) Idle.watch();

        //// set current site automatically
        function redirect(state, params) {
            var clear = $rootScope.$on('$stateChangeSuccess', function () {
                $state.go(state, params);
                clear();
            });
        }

        if(!config.standAlone){
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
                if (toParams.siteName) {
                    qtSettings.setSite(toParams.siteName);
                } else if (toParams.siteName === '' && $firebase.databases.selectedSite) {
                    redirect(toState, angular.extend(toParams, {siteName: $firebase.databases.selectedSite.siteName}))
                } else if (toParams.siteName === '' && !$firebase.databases.selectedSite) {
                    redirect('quartz.admin-default.sites')
                }
                if ($firebase.databases.selectedSite) {
                    var siteName = $firebase.databases.selectedSite.siteName;

                    qtMenu.removeGroup("siteSelected");
                    qtMenu.addGroup("siteSelected", {siteName: siteName});
                }
            });
        } else {
            qtMenu.addGroup("siteSelected");
        }

        //// detect if user is logged in
        Auth.$onAuth(function (authData) {
            $rootScope.user = authData;
            $rootScope.loggedIn = !!authData;

            promiseService.reset('userData');

            if (authData) {
                angular.extend($firebase.params,{
                    '$uid': authData.uid
                });

                
                $firebase.ref('users/detail/' + authData.uid + '/info').once('value', function(snap){
                    var userData = Auth.basicAccountUserData(authData);
                    userData.info = snap.val();
                    promiseService.resolve('userData', userData);
                    console.log(userData);
                });

                // var loadList = {
                //     info: {
                //         refUrl: 'users/' + authData.uid + '/info'
                //     },
                //     createdTime: {
                //         refUrl: 'users/' + authData.uid + '/createdTime'
                //     }
                // };
                // $firebase.load(loadList).then(function (res) {
                //     var userData = {};
                //     userData.createdTime = res.createdTime;
                //     userData.info = res.info;
                //     promiseService.resolve('userData', userData);
                //     console.log(userData);
                // });
            } else {
                console.log('no user', authData);
                promiseService.resolve('userData', null);
                $firebase.params["$uid"] = "";
            }
        });
    }
})();

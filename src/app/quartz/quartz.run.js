(function () {
    'use strict';

    angular
        .module('quartz')
        .run(runFunction);

    /* @ngInject */
    function runFunction($rootScope, Idle, $window, $http, $state, $mdSidenav,qtMenu, promiseService, Auth, $firebase, config) {
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

        //// get client config
        $firebase.ref('config/client').on('value', function (snap) {
            $rootScope.clientConfig = snap.val();
        });

        //// set current site automatically
        function redirect(state, params){
            var clear = $rootScope.$on('$stateChangeSuccess', function () {
                $state.go(state, params);
                clear();
            });
        }
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
            qtMenu.removeMenu('MENU.PAGES.MENUNAME');
            if (toParams.siteName) {
                $firebase.setSite(toParams.siteName);
            } else if(toParams.siteName===''&& $firebase.databases.selectedSite){
                redirect(toState, angular.extend(toParams,{siteName: $firebase.databases.selectedSite.siteName}))
            } else if(toParams.siteName===''&& !$firebase.databases.selectedSite){
                redirect('quartz.admin-default.sites')
            }
            if($firebase.databases.selectedSite){
                var siteName = $firebase.databases.selectedSite.siteName;
                qtMenu.addMenu({
                    name: 'MENU.PAGES.MENUNAME',
                    icon: 'fa fa-pencil-square-o',
                    type: 'dropdown',
                    priority: 1.5,
                    children:[
                        {
                            name: 'MENU.PAGES.PAGEMANAGER',
                            state: 'quartz.admin-default.pageManager',
                            params: {cate: 'all',subCate:'all',queryString:'',siteName:siteName},
                            type: 'link'
                        },
                        {
                            name: 'MENU.PAGES.WIDGETMANAGER',
                            state: 'quartz.admin-default.widgetManager',
                            params: {cate: 'all',subCate:'all',queryString:'',siteName:siteName},
                            type: 'link'
                        }
                    ]

                });
            }
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

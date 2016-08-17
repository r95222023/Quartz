(function () {
    'use strict';

    angular
        .module('quartz.components')
        .service('sitesService', SitesService)
        .run(run);

    /* @ngInject */
    function SitesService() {
        this.siteName = 'default';
    }


    /* @ngInject */
    function run($q, $window, $lazyLoad, config, FBURL, $rootScope, $state, $firebase, qtMenu, sitesService, $firebaseStorage, $auth) {

        //// set current site automatically
        function redirect(state, params) {
            var clear = $rootScope.$on('$stateChangeSuccess', function () {
                $state.go(state, params);
                clear();
            });
        }


        function setSite(siteName, toState, reset) {
            if (sitesService.siteName !== siteName || reset) {

                console.log("Initializing " + siteName);
                $rootScope.$broadcast('site:change', siteName);
                $firebase.databases.selectedSite = {
                    siteName: siteName,
                    url: FBURL.split("//")[1].split(".fi")[0] + '#sites/detail/' + siteName
                };
                $firebase.storages.selectedSite = {
                    path: 'sites/detail/' + siteName
                };
                sitesService.siteName = siteName;
                sitesService.config = {};
                sitesService.preLoading = true;

                var def = $q.defer();
                sitesService.onReady = function () {
                    return def.promise
                };
                if (toState.name === 'customPage' || toState.name === 'previewFrame') {
                    if (sitesService.config && sitesService.config.sources) {
                        console.log('reloading');
                        $window.location.reload();
                    }
                    getPreload(def);
                } else {
                    def.resolve(sitesService);
                }
            }

        }

        function getPreload(def) {
            $firebaseStorage.getWithCache('config/preload@selectedSite').then(function (res) {
                var _res = res || {};
                $rootScope.logo = _res.logo;
                $rootScope.brand = _res.brand;
                $lazyLoad.loadSite(_res).then(function () {

                    $rootScope.logo = _res.logo;
                    $rootScope.brand = _res.brand;
                    sitesService.config = _res;
                    delete sitesService.preLoading;

                    $rootScope.sitesService = sitesService;
                    def.resolve(sitesService);
                });
            });
        }

        function isDashboard(state) {
            var name = state.name;
            return name !== '' &&(name.search('.admin') !== -1 || name === 'pageEditor' || name === 'widgetEditor');
        }

        function isCustomPage(state) {
            return state.name.search('customPage') !== -1;
        }

        if (!config.standAlone) {
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

                if (toParams.siteName) {
                    setSite(toParams.siteName, toState);
                } else if (toParams.siteName === '' && $firebase.databases.selectedSite) {
                    redirect(toState, angular.extend(toParams, {siteName: $firebase.databases.selectedSite.siteName}));
                } /*else if (toParams.siteName === '' && !$firebase.databases.selectedSite&&$auth.currentUser) {
                    redirect('quartz.admin-default.mysites');
                }*/


                //from dashboard to selected page
                if ( isDashboard(fromState) && isCustomPage(toState)) {
                    setSite(toParams.siteName, toState, true);
                }
                //from selected page to dashboard
                else if (isCustomPage(fromState) && isDashboard(toState)) {
                    console.log('reloading');

                    $window.location.reload();
                }

                sitesService.pageName = toParams.pageName;

                if ($firebase.databases.selectedSite) {
                    var siteName = $firebase.databases.selectedSite.siteName;

                    qtMenu.removeGroup("siteSelected");
                    qtMenu.addGroup("siteSelected", {siteName: siteName});
                }
            });
        } else {
            qtMenu.addGroup("siteSelected");
        }
    }
})();

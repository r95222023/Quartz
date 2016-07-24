(function () {
    'use strict';

    angular
        .module('quartz.components')
        .service('sitesService', SitesService)
        .run(run);

    /* @ngInject */
    function SitesService() {
        this.siteName = 'main';
    }


    /* @ngInject */
    function run($q,config, FBURL, $rootScope, $state, $firebase, qtMenu, sitesService, $firebaseStorage, injectJS, injectCSS) {

        //// set current site automatically
        function redirect(state, params) {
            var clear = $rootScope.$on('$stateChangeSuccess', function () {
                $state.go(state, params);
                clear();
            });
        }

        var def;
        function setSite(siteName) {
            if (sitesService.siteName !== siteName) {
                console.log("change site to " + siteName);
                $rootScope.$broadcast('site:change', siteName);
                $firebase.databases.selectedSite = {
                    siteName: siteName,
                    url: FBURL.split("//")[1].split(".fi")[0] + '#sites/detail/' + siteName
                };
                $firebase.storages.selectedSite = {
                    path: 'sites/detail/' + siteName
                };
                sitesService.siteName = siteName;
                def = $q.defer();
                sitesService.onReady = function(){return def.promise};
                getPreload();
            }

        }

        function getPreload() {
            $firebaseStorage.getWithCache('config/preload@selectedSite').then(function (res) {
                var _res = res||{};
                if (_res && _res.css) {injectCSS.setDirectly('siteCSS', _res.css);sitesService.css=_res.css}
                if (_res && _res.js) {injectJS.setDirectly('siteJS', _res.js);sitesService.js=_res.js}
                $rootScope.logo = _res.logo;
                $rootScope.brand = _res.brand;

                def.resolve(sitesService);
            });
        }

        if (!config.standAlone) {
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

                if (toParams.siteName) {
                    setSite(toParams.siteName);
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
    }
})();

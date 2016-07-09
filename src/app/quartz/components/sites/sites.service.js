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
            $firebaseStorage.getWithCache('pages/config/preload@selectedSite').then(function (res) {
                if (res && res.css) {injectCSS.setDirectly('siteCSS', res.css);sitesService.siteCSS=res.css}
                if (res && res.js) {injectJS.setDirectly('siteJS', res.js);sitesService.siteJS=res.js}
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

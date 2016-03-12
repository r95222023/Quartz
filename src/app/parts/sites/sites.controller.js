(function () {
    'use strict';

    angular
        .module('app.parts.sites')
        .controller('SitesController', SitesController)
        .controller('SiteConfigureController', SiteConfigureController);

    /* @ngInject */
    function SitesController($firebase, authData, $state, config, FBURL, qtNotificationsService, Auth, $mdDialog) {
        var vm = this;
        vm.showDashboard = function (siteName) {
            $state.go('quartz.admin-default.site-configure', {siteName: siteName})
        };
        vm.go = function (state, siteName) {
            $state.go(state, {siteName: siteName})
        };

        vm.newSiteName = '';

        if (authData) {
            vm.sitesArray = $firebase.array('users/' + authData.uid + '/sites');
            //vm.sitesArray.$loaded().then(function(){
            //    console.log(vm.sitesArray);
            //});
            vm.addSite = function () {
                if (vm.newSiteName.trim()) {
                    vm.sitesArray.$add({
                        siteName: vm.newSiteName,
                        createdTime: Firebase.ServerValue.TIMESTAMP
                    }).then(function () {
                        $firebase.ref('sites').child(vm.newSiteName).set({
                            createdTime: Firebase.ServerValue.TIMESTAMP
                        })
                    });
                }
            };
            vm.deleteSite = function (site) {
                vm.sitesArray.$remove(site).then(function () {
                    $firebase.ref('sites').child(site.siteName).set(null);
                });
            };
        } else {
            $state.go('authentication.login');
        }
    }

    /* @ngInject */
    function SiteConfigureController($firebase, $state, $stateParams, config, FBURL, qtNotificationsService, Auth, $mdDialog) {
        var vm = this;
        vm.siteName = $stateParams.siteName
    }
})();

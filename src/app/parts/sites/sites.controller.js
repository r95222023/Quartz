(function () {
    'use strict';

    angular
        .module('app.parts.sites')
        .controller('MySitesController', MySitesController)
        .controller('AllSitesController', AllSitesController)
        .controller('SiteConfigureController', SiteConfigureController);

    /* @ngInject */
    function MySitesController($firebase, authData, $state, config, FBURL, qtNotificationsService, Auth, $mdDialog) {
        var vm = this;
        if(!authData) $state.go('authentication.login');
        vm.showDashboard = function (siteName) {
            $state.go('quartz.admin-default.site-configure', {siteName: siteName})
        };
        vm.go = function (state, siteName) {
            $state.go(state, {siteName: siteName})
        };

        vm.newSiteName = '';

        vm.sitesArray = $firebase.array('users/' + authData.uid + '/sites');

        vm.addSite = function () {
            $firebase.ref('sites/list/'+vm.newSiteName+'/createdTime').once('value', function(snap){
                if(snap.val()===null){
                    addSite();
                } else {
                    alert('This name has been used!');
                    vm.newSiteName="";
                }
            });
        };

        function addSite(){
            if (vm.newSiteName.trim()) {
                vm.sitesArray.$add({
                    siteName: vm.newSiteName,
                    createdTime: Firebase.ServerValue.TIMESTAMP
                }).then(function () {
                    $firebase.update('sites', ['detail/' + vm.newSiteName, 'list/' + vm.newSiteName], {
                        //"toDetail@0": "test",
                        //"toList@1": "test",
                        "createdTime": Firebase.ServerValue.TIMESTAMP
                    })
                });
            }
        }

        vm.deleteSite = function (site) {
            vm.sitesArray.$remove(site).then(function () {
                $firebase.update('sites', ['detail/' + site.siteName, 'list/' + site.siteName], {
                    "@all": null
                })
            });
        };

    }

    /* @ngInject */
    function AllSitesController($firebase, authData, $state, config, FBURL, qtNotificationsService, Auth, $mdDialog) {
        var vm = this;
        if(!authData) $state.go('authentication.login');
        vm.showDashboard = function (siteName) {
            $state.go('quartz.admin-default.site-configure', {siteName: siteName})
        };
        vm.go = function (state, siteName) {
            $state.go(state, {siteName: siteName})
        };

        vm.newSiteName = '';

        vm.sitesArray = $firebase.array('sites/list');

        vm.addSite = function () {
            $firebase.ref('sites/list/'+vm.newSiteName+'/createdTime').once('value', function(snap){
                if(snap.val()===null){
                    addSite();
                } else {
                    alert('This name has been used!');
                    vm.newSiteName="";
                }
            });
        };

        function addSite(){
            if (vm.newSiteName.trim()) {
                vm.sitesArray.$add({
                    siteName: vm.newSiteName,
                    createdTime: Firebase.ServerValue.TIMESTAMP
                }).then(function () {
                    $firebase.update('sites', ['detail/' + vm.newSiteName, 'list/' + vm.newSiteName], {
                        //"toDetail@0": "test",
                        //"toList@1": "test",
                        "createdTime": Firebase.ServerValue.TIMESTAMP
                    })
                });
            }
        }

        vm.deleteSite = function (site) {
            vm.sitesArray.$remove(site).then(function () {
                $firebase.update('sites', ['detail/' + site.siteName, 'list/' + site.siteName], {
                    "@all": null
                })
            });
        };

    }

    /* @ngInject */
    function SiteConfigureController($firebase, $state, $stateParams, config, FBURL, qtNotificationsService, Auth, $mdDialog) {
        var vm = this;
        vm.siteName = $stateParams.siteName
    }
})();

(function () {
    'use strict';

    angular
        .module('app.parts.sites')
        .controller('SitesController', SitesController);

    /* @ngInject */
    function SitesController($firebase, authData, $state, qtNotificationsService, Auth, $mdDialog, config) {
        var vm = this;
        vm.showDashboard = function (selectedSiteRefUrl) {
            $firebase.databases['site'] = selectedSiteRefUrl;
        };
        vm.newSiteName = '';

        if (authData) {
            vm.sitesArray = $firebase.array('users/'+authData.uid+'/sites');
            //vm.sitesArray.$loaded().then(function(){
            //    console.log(vm.sitesArray);
            //});
            vm.addSite = function(){
                if(vm.newSiteName.trim()){
                    vm.sitesArray.$add({
                        siteName:vm.newSiteName,
                        createdTime:Firebase.ServerValue.TIMESTAMP
                    }).then(function(){
                        $firebase.ref('sites').child(vm.newSiteName).set({
                            createdTime:Firebase.ServerValue.TIMESTAMP
                        })
                    });
                }
            };
            vm.deleteSite = function(site){
                vm.sitesArray.$remove(site).then(function(){
                    $firebase.ref('sites').child(site.siteName).set(null);
                });
            }
        } else {
            $state.go('authentication.login');
        }
    }
})();

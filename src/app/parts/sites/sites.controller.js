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
        if (!authData) $state.go('authentication.login');

        vm.newSiteName = '';

        vm.sitesArray = $firebase.array('users/detail/' + authData.uid + '/sites');

        vm.addSite = function () {
            $firebase.ref('sites/list/' + vm.newSiteName + '/createdTime').once('value', function (snap) {
                if (snap.val() === null) {
                    addSite();
                } else {
                    alert('This name has been used!');
                    vm.newSiteName = "";
                }
            });
        };

        function addSite() {
            if (vm.newSiteName.trim()) {
                vm.sitesArray.$add({
                    siteName: vm.newSiteName,
                    createdTime: Firebase.ServerValue.TIMESTAMP
                }).then(function () {
                    $firebase.update('sites', ['detail/' + vm.newSiteName, 'list/' + vm.newSiteName], {
                        //"toDetail@0": "test",
                        //"toList@1": "test",
                        "author@1": authData.uid,
                        "siteName@1": vm.newSiteName,
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
        if (!authData) $state.go('authentication.login');


        vm.actions = [['configure', 'SITES.CONFIGURE'], ['page', 'SITES.SHOWPAGE'], ['widget', 'SITES.SHOWWIDGET'],['user', 'SITES.SHOWUSER'], ['delete', 'GENERAL.DELETE']];
        vm.action = function (action, site) {
            switch (action) {
                case 'configure':
                    $state.go('quartz.admin-default.site-configure', {siteName: site.siteName});
                    break;
                case 'page':
                    $state.go('quartz.admin-default.pageManager', {siteName: site.siteName});
                    break;
                case 'widget':
                    $state.go('quartz.admin-default.widgetManager', {siteName: site.siteName});
                    break;
                case 'user':
                    $state.go('quartz.admin-default.siteusers', {siteName: site.siteName});
                    break;
                case 'delete':
                    vm.deleteSite(site);
                    break;
            }
        };
        vm.paginator = $firebase.paginator('sites/list');
        //initiate
        vm.paginator.onReorder('name');

        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page, size)
        };
        vm.onReorder = function (orderBy) {
            vm.paginator.onReorder(orderBy);
        };

        vm.deleteSite = function (site) {
            $firebase.ref('users/detail/' + site.author + '/sites').orderByChild('siteName').equalTo(site.siteName).once('child_added', function (snap) {
                snap.ref().set(null);
            });
            $firebase.update('sites', ['detail/' + site.siteName, 'list/' + site.siteName], {
                "@all": null
            });
        };

    }

    /* @ngInject */
    function SiteConfigureController($firebase, $timeout, $state, $stateParams, config, FBURL, qtNotificationsService, Auth, $mdDialog) {
        var vm = this,
            siteListRef = $firebase.ref('sites/list'),
            pageListRef = $firebase.ref('pages/list@selectedSite'),
            siteName = $stateParams.siteName;
        siteListRef.child(siteName).child('config').once('value', function (snap) {
            vm.config = snap.val();
        });
        pageListRef.once('value', function (snap) {
            vm.pages = snap.val();
        });
        vm.updateSiteConfig = function () {
            var pageName = vm.config.index;
            setIndex(pageName, function (data) {
                $firebase.update('sites/list/'+siteName+'/config', vm.config);
                $firebase.update('pages@selectedSite', data);
            });
        };

        function setIndex(pageName, cb) {
            var data = {};
            pageListRef.once('value', function (snap) {
                snap.forEach(function (childSnap) {
                    var isIndex = childSnap.val().name === pageName ? true : null;
                    data["list/" + childSnap.key() + "/config/index"] = isIndex;
                    data["detail/" + childSnap.key() + "/config/index"] = isIndex;
                });
                cb(data);
            })
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app.parts.sites')
        .controller('MySitesController', MySitesController)
        .controller('AllSitesController', AllSitesController)
        .controller('SiteConfigureController', SiteConfigureController)
        .controller('PaymentSettingController', PaymentSettingController);

    /* @ngInject */
    function MySitesController($firebase, $timeout, authData, $state, sitesService, config, FBURL, qtNotificationsService, $mdDialog) {
        var vm = this;
        if (!authData) $state.go('authentication.login');

        vm.newSiteName = '';


        $firebase.ref('users/detail/' + authData.uid + '/sites').on('value', function (snap) {
            $timeout(function () {
                vm.sitesArray = snap.val();
            }, 0);
        });

        vm.addSite = function () {
            $firebase.ref('sites/list/' + vm.newSiteName + '/createdTime').once('value', function (snap) {
                if (snap.val() === null) {
                    sitesService.addSite(vm.newSiteName, authData.uid);
                } else {
                    alert('This name has been used!');
                    vm.newSiteName = "";
                }
            });
        };

        vm.deleteSite = function (site) {
            var confirm = $mdDialog.confirm()
                .title('Delete the site?')
                // .textContent('Delete the site?')
                .ariaLabel('Would you like to delete the site?')
                .ok('Confirm')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                sitesService.removeSite(site.siteName, authData.uid);
                //
                // vm.sitesArray.$remove(site).then(function () {
                //     $firebase.update('sites', ['detail/' + site.siteName, 'list/' + site.siteName], {
                //         "@all": null
                //     })
                // });
            });

        };

    }

    /* @ngInject */
    function AllSitesController($firebase, authData, $state, config, FBURL, qtNotificationsService, $mdDialog) {
        var vm = this;
        if (!authData) $state.go('authentication.login');


        vm.actions = [['configure', 'SITES.CONFIGURE'], ['page', 'SITES.SHOWPAGE'], ['widget', 'SITES.SHOWWIDGET'], ['user', 'SITES.SHOWUSER'], ['product', 'SITES.SHOWPRODUCT'], ['order', 'SITES.SHOWORDER'], ['delete', 'GENERAL.DELETE']];
        vm.action = function (action, site, ev) {
            var params = {siteName: site.siteName}
            switch (action) {
                case 'configure':
                    $state.go('quartz.admin-default.site-configure', params);
                    break;
                case 'page':
                    $state.go('quartz.admin-default.pageManager', params);
                    break;
                case 'widget':
                    $state.go('quartz.admin-default.widgetManager', params);
                    break;
                case 'user':
                    $state.go('quartz.admin-default.siteusers', params);
                    break;
                case 'product':
                    $state.go('quartz.admin-default.productManager', params);
                    break;
                case 'order':
                    $state.go('quartz.admin-default.orderHistory', params);
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
            var confirm = $mdDialog.confirm()
                .title('Delete this site?')
                // .textContent('Delete this site?')
                .ariaLabel('Would you like to delete the site?')
                .ok('Confirm')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $firebase.ref('users/detail/' + site.author + '/sites').orderByChild('siteName').equalTo(site.siteName).once('child_added', function (snap) {
                    snap.ref.set(null);
                });
                $firebase.update('sites', ['detail/' + site.siteName, 'list/' + site.siteName], {
                    "@all": null
                });
            });

        };

    }

    /* @ngInject */
    function SiteConfigureController($firebase, $firebaseStorage, $timeout, $state, $stateParams, config, FBURL, qtNotificationsService, $mdDialog) {
        var vm = this,
            siteDetailRef = $firebase.ref('sites/detail'),
            siteListRef = $firebase.ref('sites/list'),
            pageListRef = $firebase.ref('pages/list@selectedSite'),
            siteName = $stateParams.siteName;
        siteDetailRef.child(siteName).child('config/basic').once('value', function (snap) {
            vm.config = {};
            vm.config.basic = snap.val() || {};
        });

        siteListRef.child(siteName).once('value', function (snap) {
            var val = snap.val();
            vm.thumbnail = val.thumbnail;
        });

        pageListRef.once('value', function (snap) {
            vm.pages = snap.val();
        });
        vm.updateSiteConfig = function () {
            var pageName = vm.config.basic.index,
                listData = {};
            setIndex(pageName, function (data) {
                $firebase.update('pages@selectedSite', data);
            });

            $firebase.update('sites/detail/' + siteName + '/config/basic', vm.config.basic);
            $firebaseStorage.update('sites/detail/' + siteName + '/config/basic', vm.config.basic);


            listData['thumbnail/'] = vm.thumbnail;
            $firebase.update('sites/list/' + siteName, listData);

        };

        function setIndex(pageName, cb) {
            var data = {};
            pageListRef.once('value', function (snap) {
                snap.forEach(function (childSnap) {
                    var isIndex = childSnap.val().name === pageName ? true : null;
                    data["list/" + childSnap.key + "/config/index"] = isIndex;
                    data["detail/" + childSnap.key + "/config/index"] = isIndex;
                });
                cb(data);
            })
        }
    }

    /* @ngInject */
    function PaymentSettingController($firebase, $firebaseStorage, lzString, sitesService, config, FBURL, qtNotificationsService, $mdDialog) {
        var vm = this;
        
        function getPaymentConfig(provider) {
            angular.forEach(['public', 'private'], function (pubOrPri) {
                $firebaseStorage.getWithCache('config/payment/' + provider + '/' + pubOrPri + '@selectedSite').then(function (val) {
                    vm[provider] = vm[provider]||{};
                    vm[provider][pubOrPri] = val || {};
                });
            });
        }

        getPaymentConfig('allpay');
        getPaymentConfig('stripe');



        vm.updateAllpay = function () {
            $firebaseStorage.update('config/payment/allpay/public@selectedSite', vm.allpay.public);
            $firebaseStorage.update('config/payment/allpay/private@selectedSite', vm.allpay.private);
        };

        vm.updateStripe = function () {
            $firebaseStorage.update('config/payment/stripe/public@selectedSite', vm.stripe.public);
            $firebaseStorage.update('config/payment/stripe/private@selectedSite', vm.stripe.private);
        }
    }
})();

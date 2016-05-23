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
            $timeout(function(){
                vm.sitesArray = snap.val();
            },0);
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
    function SiteConfigureController($firebase, $timeout, $state, $stateParams, config, FBURL, qtNotificationsService, $mdDialog) {
        var vm = this,
            siteDetailRef = $firebase.ref('sites/detail'),
            siteListRef = $firebase.ref('sites/list'),
            pageListRef = $firebase.ref('pages/list@selectedSite'),
            siteName = $stateParams.siteName;
        siteDetailRef.child(siteName).child('config').once('value', function (snap) {
            vm.config = snap.val() || {};
            vm.config.basic = vm.config.basic || {};
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

            $firebase.update('sites/detail/' + siteName + '/config', vm.config);

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
    function PaymentSettingController($firebase, lzString, sitesService, config, FBURL, qtNotificationsService, $mdDialog) {
        var vm = this,
            paymentRef = $firebase.ref('config/payment@selectedSite');


        function getPaymentConfig(type) {
            $firebase.cache('payment' + type + '@selectedSite', paymentRef.child(type + '/editTime'), paymentRef.child(type)).then(function (val) {
                var _val = val || {};
                vm[type] = {};
                vm[type].public = lzString.decompress(_val.public || {});
                vm[type].private = lzString.decompress(_val.private || {});
            })
        }

        getPaymentConfig('allpay');
        getPaymentConfig('stripe');


        function compressData(data) {
            return {compressed: lzString.compress(data)}
        }

        vm.updateAllpay = function () {
            $firebase.update('config/payment/allpay@selectedSite', {
                editTime: firebase.database.ServerValue.TIMESTAMP,
                public: compressData(vm.allpay.public),
                private: compressData(vm.allpay.private)
            })
        };

        vm.updateStripe = function () {
            $firebase.update('config/payment/stripe@selectedSite', {
                editTime: firebase.database.ServerValue.TIMESTAMP,
                public: compressData(vm.stripe.public),
                private: compressData(vm.stripe.private)
            })
        }
    }
})();

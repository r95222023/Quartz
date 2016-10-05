(function () {
    'use strict';

    angular
        .module('app.parts.sites')
        .controller('SiteSettingCtrl', SiteSettingCtrl);

    /* @ngInject */
    function SiteSettingCtrl(sitesService, $firebase, $firebaseStorage, $mdToast, $stateParams, snippets) {
        //basic
        var vm = this,
            siteName = $stateParams.siteName,
            preloadPath = 'site-config-preload';
        vm.default = {
            ngMaterial: {
                body: '<div class="full-height" ui-view></div>'
            }
        };
        console.log(siteName);
        $firebaseStorage.getWithCache(preloadPath).then(function (preload) {
            vm.preload = preload || {};
            vm.meta = vm.preload.meta || [];
            vm.preset = vm.preload.preset || 'ng1';
        });

        $firebase.queryRef('site?type=list&siteName=' + siteName).once('value', function (snap) {
            vm.siteListData = snap.val();
        });

        // pageListRef.once('value', function (snap) {
        //     vm.pages = snap.val();
        // });
        vm.updateBasicInfo = function () {
            var siteListData = {};

            // $firebase.updateCacheable(preloadPath, vm.preload);
            $firebaseStorage.update(preloadPath, vm.preload);
            Object.assign(siteListData, vm.siteListData || {});
            siteListData.title = vm.preload.title || null;
            $firebase.update('site?type=list', siteListData);
        };

        //payment
        function getPaymentConfig(provider) {
            angular.forEach(['public', 'private'], function (privacy) {
                $firebaseStorage.getWithCache('site-config-payment?provider=' + provider + '&privacy=' + privacy).then(function (val) {
                    vm[provider] = vm[provider] || {};
                    vm[provider][privacy] = val || {};
                });
            });
        }

        getPaymentConfig('allpay');
        getPaymentConfig('stripe');


        vm.updateAllpay = function () {
            // $firebase.updateCacheable('config/payment/allpay@selectedSite', vm.allpay);
            $firebaseStorage.update('site-config-payment?provider=allpay&privacy=public', vm.allpay.public);
            $firebaseStorage.update('site-config-payment?provider=allpay&privacy=private', vm.allpay.private);
        };

        vm.updateStripe = function () {
            $firebase.update(['site-config-payment?provider=stripe&privacy='], vm.stripe);
            $firebaseStorage.update('site-config-payment?provider=stripe&privacy=public', vm.stripe.public);
            $firebaseStorage.update('site-config-payment?provider=stripe&privacy=private', vm.stripe.private);
        };

        vm.removeSource = function (type, index) {
            vm.preload[type].splice(index, 1);
        };
        //external lib
        vm.addSource = function (type, input) {
            vm.preload[type] = vm.preload[type] || [];
            vm.preload[type].push({src: (input || '').replace(/\s+/g, '')});
        };


        //meta
        vm.addMeta = function (input) {
            vm.preload.meta = vm.preload.meta || [];
            if (input) vm.preload.meta.push(input);
        };

        //import site template
        vm.importSiteTemplate = function (from) {
            sitesService.moveSite(from)
        };
        //
        function attachDownloadUrls() {
            var promises = [];
            ['scripts_1', 'scripts_2', 'styles_1'].forEach(function (type) {
                if (vm.preload[type]) {
                    vm.preload[type].forEach(function (val, index) {
                        var src = val.src;
                        if (src.search('//') === -1) {
                            var promise = _core.util.storage.getDownloadUrls(siteName, [src]);
                            promise.then(function (realSrcArr) {
                                vm.preload[type][index]._src = realSrcArr[0]; //_src: see core/loader pushSource function
                            });
                            promises.push(promise);
                        }
                    });
                }
            })
            return Promise.all(promises);
        }

        vm.update = function () {
            attachDownloadUrls()
                .then(function () {
                    // $firebase.updateCacheable(preloadPath, data);
                    $firebaseStorage.update(preloadPath, vm.preload);
                    $mdToast.show(
                        $mdToast.simple()
                            .textContent('Saved!')
                            .hideDelay(3000)
                    );
                });
        };
    }
})();

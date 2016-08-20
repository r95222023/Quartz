(function () {
    'use strict';

    angular
        .module('app.parts.sites')
        .controller('SiteSettingCtrl', SiteSettingCtrl);

    /* @ngInject */
    function SiteSettingCtrl(sitesService, $firebase, $firebaseStorage, $mdToast, $stateParams, snippets) {
        //basic
        var vm = this,
            preloadPath = 'config/preload@selectedSite',
            siteListRef = $firebase.ref('sites/list'),
            pageListRef = $firebase.ref('pages/list@selectedSite'),
            siteName = $stateParams.siteName;
        $firebaseStorage.getWithCache(preloadPath).then(function (preload) {
            vm.preload = preload || {};
            vm.sources = vm.preload.sources || [];
        });

        siteListRef.child(siteName).once('value', function (snap) {
            var val = snap.val();
            vm.thumbnail = val.thumbnail;
            vm.description = val.description;
            vm.type = val.type;
        });

        pageListRef.once('value', function (snap) {
            vm.pages = snap.val();
        });
        vm.updateSiteConfig = function () {
            var listData = {};

            // $firebase.updateCacheable(preloadPath, vm.preload);
            $firebaseStorage.update(preloadPath, vm.preload);


            listData['thumbnail/'] = vm.thumbnail || null;
            $firebase.update('sites/list/' + siteName, listData);
        };

        //payment
        function getPaymentConfig(provider) {
            angular.forEach(['public', 'private'], function (pubOrPri) {
                $firebaseStorage.getWithCache('config/payment/' + provider + '/' + pubOrPri + '@selectedSite').then(function (val) {
                    vm[provider] = vm[provider] || {};
                    vm[provider][pubOrPri] = val || {};
                });
            });
        }

        getPaymentConfig('allpay');
        getPaymentConfig('stripe');


        vm.updateAllpay = function () {
            // $firebase.updateCacheable('config/payment/allpay@selectedSite', vm.allpay);
            $firebaseStorage.update('config/payment/allpay/public@selectedSite', vm.allpay.public);
            $firebaseStorage.update('config/payment/allpay/private@selectedSite', vm.allpay.private);
        };

        vm.updateStripe = function () {
            $firebase.update('config/payment/stripe@selectedSite', vm.stripe);
            $firebaseStorage.update('config/payment/stripe/public@selectedSite', vm.stripe.public);
            $firebaseStorage.update('config/payment/stripe/private@selectedSite', vm.stripe.private);
        };

        //external lib
        vm.addSource = function (input) {
            var _input = (input || '').replace(/\s+/g, '');
            if (input) vm.sources.push(_input);
        };
        vm.removeSource = function (index) {
            vm.sources.splice(index, 1);
        };

        //import site template
        vm.importSiteTemplate = function (from) {
            sitesService.moveSite(from)
        };
        //
        vm.update = function () {
            if (vm.sources.length === 0) return;
            var data = angular.extend({}, vm.preload);
            data.sources = vm.sources;
            // $firebase.updateCacheable(preloadPath, data);
            $firebaseStorage.update(preloadPath, data);
            $mdToast.show(
                $mdToast.simple()
                    .textContent('Saved!')
                    .hideDelay(3000)
            );
        };
    }
})();

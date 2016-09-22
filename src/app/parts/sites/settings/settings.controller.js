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
        vm.default={
            ngMaterial:{
                body:'<div class="full-height" ui-view></div>'
            }
        };
        console.log(siteName);
        $firebaseStorage.getWithCache(preloadPath).then(function (preload) {
            vm.preload = preload || {};
            vm.sources = vm.preload.sources || [];
            vm.meta = vm.preload.meta||[];
            vm.framwork = vm.preload.framwork||'ngMaterial';
        });

        $firebase.queryRef('site?type=list&siteName='+siteName).once('value', function (snap) {
            vm.siteListData = snap.val();
        });

        // pageListRef.once('value', function (snap) {
        //     vm.pages = snap.val();
        // });
        vm.updateBasicInfo = function () {
            var siteListData = {};

            // $firebase.updateCacheable(preloadPath, vm.preload);
            $firebaseStorage.update(preloadPath, vm.preload);

            Object.assign(siteListData, vm.siteListData||{});
            siteListData.title=vm.preload.title||null;
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

        vm.removeItem = function (type,index) {
            vm[type].splice(index, 1);
        };
        //external lib
        vm.addSource = function (input) {
            var _input = (input || '').replace(/\s+/g, '');
            if (input) vm.sources.push(_input);
        };


        //meta
        vm.addMeta = function (input) {
            var _input = input||[];
            if (input) vm.meta.push(_input);
        };

        //import site template
        vm.importSiteTemplate = function (from) {
            sitesService.moveSite(from)
        };
        //
        vm.update = function () {
            if (vm.sources.length === 0) return;
            var preload = angular.extend({}, vm.preload);
            preload.sources = vm.sources;
            preload.meta = vm.meta;
            preload.framework= vm.framwork;
            // $firebase.updateCacheable(preloadPath, data);
            $firebaseStorage.update(preloadPath, preload);
            $mdToast.show(
                $mdToast.simple()
                    .textContent('Saved!')
                    .hideDelay(3000)
            );
        };
    }
})();

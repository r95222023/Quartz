(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductDetailController', ProductDetailController);

    /* @ngInject */
    function ProductDetailController(lzString, $timeout, $firebase, $firebaseStorage, $stateParams) {
        var vm = this;


        angular.extend(vm, $stateParams);

        // $firebase.ref('products/detail/' + vm.id + '@selectedSite').once('value', function (snap) {
        //     $timeout(function () {
        //         vm.product = lzString.decompress(snap.val());
        //
        //     }, 0)
        // });

        var cachePath = 'product' + vm.id + '@selectedSite',
            editTimeRef = $firebase.ref('products/detail/' + vm.id + '@selectedSite').child('editTime'),
            sourceRef = $firebase.ref('products/detail/' + vm.id + '@selectedSite');

        // $firebase.cache(cachePath, editTimeRef, sourceRef).then(setModelData);
        $firebaseStorage.getWithCache('products/detail/' + vm.id + '@selectedSite').then(setModelData);

        function setModelData(data) {
            console.log(data);
            vm.product = data;
        }

        vm.disqusId = vm.siteName + vm.id;
        vm.selectedOption = {};
        vm.showDetail = function (itemId) {
            $state.go('quartz.admin-default.productDetail', {id: itemId})
        }
    }
})();

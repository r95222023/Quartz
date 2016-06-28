(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductDetailController', ProductDetailController);

    /* @ngInject */
    function ProductDetailController(lzString, $timeout, $firebase, $firebaseStorage, $stateParams) {
        var vm = this,
            params = JSON.parse($stateParams.params||'{}');
        
        // $firebase.cache(cachePath, editTimeRef, sourceRef).then(setModelData);
        $firebaseStorage.getWithCache('products/detail/' + params.product.id + '@selectedSite').then(setModelData);

        function setModelData(data) {
            console.log(data);
            vm.product = data;
        }

        vm.disqusId = $stateParams.siteName + params.product.id;
        vm.selectedOption = {};
        vm.showDetail = function (itemId) {
            $state.go('quartz.admin-default.productDetail', {id: itemId})
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductDetailController', ProductDetailController);

    /* @ngInject */
    function ProductDetailController(lzString, $timeout, $firebase, $firebaseStorage, $stateParams) {
        var vm = this,
            params = JSON.parse($stateParams.params||'{"product":{}}');

        // $firebase.cache(cachePath, editTimeRef, sourceRef).then(setModelData);
        $firebaseStorage.getWithCache('products/detail/' + (params.product.id||'bd_001') + '@selectedSite').then(setModelData);

        function setModelData(data) {
            console.log(data);
            vm.product = data||{};
            if(angular.isArray(vm.product.images)) vm.product.image=vm.product.images[0];
        }

        vm.disqusId = $stateParams.siteName + params.product.id;
        vm.selectedOption = {};
    }
})();

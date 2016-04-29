(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductDetailController', ProductDetailController);

    /* @ngInject */
    function ProductDetailController(lzString,$timeout, $firebase, $stateParams) {
        var vm = this;


        angular.extend(vm, $stateParams);

        $firebase.ref('products/detail/' + vm.id + '@selectedSite').once('value', function (snap) {
            $timeout(function(){
                vm.product = lzString.decompress(snap.val());

            },0)
        });
        vm.disqusId = vm.siteName + vm.id;
        vm.selectedOption = {};
        vm.showDetail = function (itemId) {
            $state.go('quartz.admin-default.productDetail', {id: itemId})
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductDetailController', ProductDetailController);

    /* @ngInject */
    function ProductDetailController($scope,$firebaseObject, $firebase, $location, $stateParams) {
        var vm = this;
        $scope.id='test';
        angular.extend(vm, $stateParams);
        vm.disqusId = vm.siteName+vm.id;
        vm.selectedOption={};
        vm.showDetail= function (itemId) {
            $state.go('quartz.admin-default.productDetail', {id: itemId})
        }
    }
})();

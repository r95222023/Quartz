(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductListController', ProductListController);

    /* @ngInject */
    function ProductListController($elasticSearch, $firebase, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
        vm.query = {
            cache:'query/cache',
            reuse:200
        };
        vm.filter = {};

        vm.paginator = $elasticSearch.paginator('quartz', 'product', vm.query);
        //initiate
        vm.paginator.onReorder('itemId');


        vm.showDetail= function (itemId) {
            $state.go('quartz.admin-default.productDetail', {id: itemId})
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('OrderHistoryController', OrderHistoryController);

    /* @ngInject */
    function OrderHistoryController($stateParams, $q, $timeout, $firebase, $rootScope, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
        vm.filters = [
            ['Order Id', 'id'],
            ['Client Id', 'clientInfo.uid'],
            ['Payment type', 'payment.type'],
            ['Status', 'status'],
            ['Total amount', 'totalAmount']
        ];
        vm.statuses = ['received', 'preparing', 'ready', 'delivered'];
        vm.orderSelected = [];

        vm.getFiltered= function () {
            $state.go('quartz.admin-default.orderHistory', {orderBy:vm.orderBy, startAt:vm.startAt,endAt:vm.endAt})
        };


        vm.paginator = $firebase.paginator('orders/list@selectedSite', $stateParams);
        //initiate
        vm.paginator.onReorder($stateParams.orderBy||'id');

        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page,size)
        };
        vm.onReorder = function (sort) {
            vm.paginator.onReorder(sort);
        };

        vm.changeStatus = function (status) {
            var data = {};
            angular.forEach(vm.orderSelected, function (orderId) {
                data['detail/'+orderId + '/status'] = status;
                data['list/'+orderId + '/status'] = status;
            });
            $firebase.ref('orders@selectedSite').update(data, function () {
                //
            });

        };
    }
})();

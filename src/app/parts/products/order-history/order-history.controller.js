(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('OrderHistoryController', OrderHistoryController);

    /* @ngInject */
    function OrderHistoryController($elasticSearch, $q, $timeout, $firebase, $rootScope, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        vm.filter = {};
        vm.statuses = ['received', 'preparing', 'ready', 'delivered'];
        vm.orderSelected = [];
        vm.query = {
            //cache:'query/cache',
            reuse: 100, //how many times this cache will be reused
            expire: 1000000000 //how long does it take for this cache to expire
        };

        vm.paginator = $elasticSearch.paginator('quartz', 'order', vm.query);
        //initiate
        vm.paginator.onReorder('id');

        vm.changeStatus = function (status) {
            var data = {};
            angular.forEach(vm.orderSelected, function (orderId) {
                data[orderId + '/status'] = status;
            });
            $firebase.ref('orders').update(data, function () {
                angular.forEach(vm.orders.hits, function (order, i) {
                    if(data[order._source.id + '/status']) order._source.status = status;
                });
            });
            //$firebase.request({
            //    request: [{
            //        refUrl: 'queue/$queueId',
            //        value: {
            //            //rootRefUrl:FBURL, //default
            //            //statusPath:'orders/$orderId/status', //default
            //            orderId: vm.orderSelected.toString(),
            //            status: status
            //        }
            //    }],
            //    response: {
            //        response: 'queue/$queueId/response'
            //    }
            //}).then(function (res) {
            //    console.log(res)
            //})
        };
    }
})();

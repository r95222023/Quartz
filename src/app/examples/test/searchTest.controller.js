(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('SearchTestController', SearchTestController);

    /* @ngInject */
    function SearchTestController($elasticSearch, $q, $timeout, $firebase, $rootScope, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this,
            paginator;
        //$elasticSearch.query('quartz', 'order', {
        //    cache:'query/cache', //cache's reference url
        //    from:5, //get the result that started from the 6th hit
        //    size:10, // how many hits in result
        //    reuse: 100, //how many times this cache will be reused
        //    expire: 1000000000, //how long does it take for this cache to expire
        //    body:{
        //        "query" : {
        //            "match" : {
        //                "ChoosePayment" : "ALL"
        //            }
        //        }
        //    }
        //}).then(function (res) {
        //    console.log(res)
        //});
        vm.filter = {};
        vm.statuses = ['received', 'preparing', 'ready', 'delivered'];
        vm.orderSelected = [];
        vm.query = {
            //cache:'query/cache',
            reuse: 100, //how many times this cache will be reused
            expire: 1000000000, //how long does it take for this cache to expire
            size: 5,
            body: {
                "query": {
                    "match": {}
                }
            }
        };
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
        vm.getOrderPage = function (page, limit) {
            vm.promise = paginator.get(page, limit);
            vm.promise.then(function (res) {
                vm.orders = res;
            });
        };

        vm.onReorder = function (orderBy) {
            var isDesc = orderBy.split('-')[1],
                sortBy = isDesc ? isDesc : orderBy,
                sort = {};
            sort[sortBy] = {"order": !!isDesc ? "desc" : "asc"};
            vm.query.body.sort = sort;
            paginator = $elasticSearch.paginator('quartz', 'order', vm.query);
            vm.page = 1;
            vm.getOrderPage(1, vm.query.size);
        };

        //get initial data
        vm.onReorder("id");
    }
})();

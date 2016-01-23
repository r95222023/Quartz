(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductListController', ProductListController);

    /* @ngInject */
    function ProductListController($elasticSearch, $stateParams, $firebase, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;

        vm.query = {
            cache:'query/cache',
            reuse:200
        };

        if($stateParams.cate!=='all'){
            var filterMust = parseInt($stateParams.subCate)%1===0? [
                { "term": { "category": $stateParams.cate }},
                { "term": { "subcategory":  $stateParams.subCate }}
            ] : {"term": { "category": $stateParams.cate }};

            vm.query.body = {
                "query":{
                    "filtered": {
                        "filter": {
                            "bool": {
                                "must":filterMust
                            }
                        }
                    }
                }
            };
        }




        vm.queryString = $stateParams.queryString;
        vm.search = function(go){
            if(angular.isString(vm.queryString)&&vm.queryString.trim()!==''){
                vm.query.body = {
                    "query":{
                        "query_string" : {
                            "fields" : ["itemName", "description"],
                            "query" : vm.queryString,
                            "use_dis_max" : true
                        }
                    }
                };
                if(go) $state.go('quartz.admin-default.productList', {queryString: vm.queryString})
            }
        };
        vm.search(); //for query from url


        vm.paginator = $elasticSearch.paginator('quartz', 'product', vm.query);
        //initiate
        vm.paginator.onReorder('itemId');


        vm.showDetail= function (itemId) {
            $state.go('quartz.admin-default.productDetail', {id: itemId})
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductListController', ProductListController);

    /* @ngInject */
    function ProductListController($filter, $elasticSearch, $stateParams, $rootScope, $firebase, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;

        vm.query = {
            cache: true/*'query/cache'*/,
            reuse: 200
        };

        vm.menuWidth = 4;

        vm.getProductsByTag = function (tagName, limit) {
            $firebase.ref('products/list@selectedSite')
                .orderByChild('tags/' + tagName).equalTo(1).limitToFirst(limit || 5)
                .once('value', function (snap) {
                    vm[tagName] = snap.val();
                })
        };


        vm.queryString = $stateParams.queryString;
        vm.tag = $stateParams.tag;
        vm.go = function (queryString, cate, subCate, tag, pageName) {
            $state.go(pageName ? 'quartz.admin-default.customPage' : 'quartz.admin-default.productList', {
                queryString: queryString || vm.queryString,
                cate: cate + '' || $stateParams.cate,
                subCate: subCate + '' || $stateParams.subCate,
                tag: tag,
                pageName: pageName
            })
        };
        vm.search = function (go) {
            vm.query.body = vm.query.body || {};
            var cate = $stateParams.cate || null,
                subCate = $stateParams.subCate || null,
                tag = $stateParams.tag || null,
                filterMust = [],
                filterMustNot = [{"term": {"show": false}}];
            if (angular.isString(tag)) {
                var tagTerm = {};
                tagTerm['tags_dot_' + tag] = 1;
                filterMust.push({term: tagTerm});
            }
            if (parseInt(cate) % 1 === 0) {
                filterMust.push({"term": {"category": cate}});
                if (parseInt(subCate) % 1 === 0) filterMust.push({"term": {"subcategory": subCate}});
            }
            vm.query.body.query = {
                "filtered": {
                    "filter": {
                        "bool": {
                            "must": filterMust.length ? filterMust : null,
                            "must_not": filterMustNot
                        }
                    }
                }
            };
            if (angular.isString(vm.queryString) && vm.queryString.trim() !== '') {
                var query_string = {
                    "fields": ["itemName", "description"],
                    "query": vm.queryString,
                    "use_dis_max": true
                };
                if (vm.query.body.query && vm.query.body.query.filtered) {
                    vm.query.body.query.filtered.query = {
                        query_string: query_string
                    };
                } else {
                    vm.query.body.query.query_string = query_string;
                }
            }
            if (go) vm.go(vm.queryString);
            //console.log(vm.query.body)
        };
        vm.search(); //for query from url


        vm.paginator = $elasticSearch.paginator($stateParams.siteName || 'main', 'product', vm.query);
        //initiate
        vm.paginator.onReorder('itemId');
    }
})();

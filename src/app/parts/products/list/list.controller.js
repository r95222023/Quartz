(function () {
    'use strict';

    angular
        .module('app.parts.products')
        .controller('ProductListController', ProductListController);

    /* @ngInject */
    function ProductListController($elasticSearch, $stateParams, $rootScope, $firebase, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;

        vm.query = {
            cache: true/*'query/cache'*/,
            reuse: 200
        };

        vm.menuWidth = vm.tags ? 6 : 4;

        $firebase.ref("products/config@selectedSite").once("value", function(snap){
            vm.productConfig = snap.val();
        });
        vm.categories = function () {
            var cate = parseInt($stateParams.cate),
                subCate = parseInt($stateParams.subCate),
                categories = vm.productConfig.categories;
            if ($stateParams.tag) return $stateParams.tag;
            if (cate % 1 === 0) {
                return categories[cate][0] + (subCate % 1 === 0 ? '/' + categories[cate][1][subCate] : '');
            } else {
                return 'GENERAL.ALLCATE';
            }
        };

        vm.getProductsByTag=function(tagName, limit){
            $firebase.ref('products/list@selectedSite')
                .orderByChild('tags/'+tagName).equalTo(1).limitToFirst(limit||5)
                .once('value' ,function(snap){
                    vm[tagName]=snap.val();
                })
        };


        vm.queryString = $stateParams.queryString;
        vm.tag = $stateParams.tag;
        vm.go = function (queryString, cate, subCate, tag, pageName) {
            $state.go(pageName? 'quartz.admin-default.customPage':'quartz.admin-default.productList', {
                queryString: queryString || vm.queryString,
                cate: cate+'' || $stateParams.cate,
                subCate: subCate+'' || $stateParams.subCate,
                tag: tag,
                pageName:pageName
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


        vm.paginator = $elasticSearch.paginator($stateParams.siteName||'main', 'products', vm.query);
        //initiate
        vm.paginator.onReorder('itemId');


        vm.showDetail = function (itemId, pageName) {
            $state.go(pageName? 'quartz.admin-default.customPage':'quartz.admin-default.productDetail', {id: itemId, pageName:pageName})
        }
    }
})();

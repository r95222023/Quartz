(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('$elasticSearch', ElasticSearch);

    /* @ngInject */
    function ElasticSearch($firebase, $firebaseStorage, $q, $timeout, snippets, defaultQueryRefUrl, defaultResponseRefUrl, defaultCacheRefUrl) {
        this.queryList=function(params){
            return _core.fbUtil.elasticsearch.queryList(params);
        };

        this.pagination = function(index, type, query){
            var patination = _core.fbUtil.elasticsearch.pagination(index, type, query);

            pagination.get = function(page, size, orderBy){
                var getPromise=patination.get(page, size, orderBy);
                getPromise.then(function(res){
                    pagination.size = size;
                    pagination.page = page;
                    pagination.result={hits: res.hits,total:res.total};
                    $timeout(angular.noop,0);
                })
            };
            return pagination;
        };
    }
})();

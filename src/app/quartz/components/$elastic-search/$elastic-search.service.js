(function () {
    'use strict';

    angular
        .module('quartz.components')
        .service('$elasticSearch', $elasticSearch);

    /* @ngInject */
    function $elasticSearch($firebase, $q) {
        function doSearch(index, type, query) {
            var def = $q.defer(),
                opt = {
                    request: [{
                        refUrl:query.queryUrl||'search/request/$reqId',
                        value: {index:index, type:type, query:query}
                    }],
                    response: [query.responseUrl||'search/response/$reqId']
                };
            $firebase.$communicate(opt)
                .then(function (res) {
                    def.resolve(res[0])
                }, function (err) {
                    def.reject(err)
                });
            return def.promise;
        }

        function buildQuery(term, words) {
            // See the following document for more query options:
            // http://okfnlabs.org/blog/2013/07/01/elasticsearch-query-tutorial.html#match-all--find-everything
            return {
                'query_string': {query: makeTerm(term, words)}
            };
        }

        function makeTerm(term, matchWholeWords) {
            if (!matchWholeWords) {
                if (!term.match(/^\*/)) {
                    term = '*' + term;
                }
                if (!term.match(/\*$/)) {
                    term += '*';
                }
            }
            return term;
        }

        return {
            doSearch:doSearch,
            buildQuery:buildQuery
        }
    }
})();
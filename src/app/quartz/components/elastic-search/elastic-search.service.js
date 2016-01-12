(function () {
    'use strict';

    angular
        .module('quartz.components')
        .provider('$elasticSearch', elasticSearchProvider);

    function elasticSearchProvider() {
        var defaultQueryRefUrl = 'query/$reqId',
            defaultResponseRefUrl = 'query/$reqId/response';
        this.setQueryRefUrl = function (value) {
            defaultQueryRefUrl = value;
        };
        this.setResponseRefUrl = function (value) {
            defaultResponseRefUrl = value;
        };
        this.$get = /* @ngInject */function ($firebase, $q) {
            return new elasticSearch($firebase, $q, defaultQueryRefUrl, defaultResponseRefUrl);
        }
    }

    function elasticSearch($firebase, $q, defaultQueryRefUrl, defaultResponseRefUrl) {
        function query(index, type, option) {
            var def = $q.defer(),
                opt = {
                    request: [{
                        refUrl: option.queryUrl || defaultQueryRefUrl,
                        value: {index: index, type: type, body: option.body}
                    }],
                    response: [option.responseUrl || defaultResponseRefUrl]
                };
            $firebase.request(opt)
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
            query: query
        }
    }
})();

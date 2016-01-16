(function () {
    'use strict';

    angular
        .module('quartz.components')
        .provider('$elasticSearch', elasticSearchProvider);

    function elasticSearchProvider() {
        var defaultQueryRefUrl = 'query/request/$reqId',
            defaultResponseRefUrl = 'query/response/$reqId/hits',
            defaultCacheRefUrl = 'query/cache';
        this.setQueryRefUrl = function (value) {
            defaultQueryRefUrl = value;
        };
        this.setResponseRefUrl = function (value) {
            defaultResponseRefUrl = value;
        };
        this.setCacheRefUrl = function (value) {
            defaultCacheRefUrl = value;
        };
        this.$get = /* @ngInject */function ($firebase, $q, snippets) {
            return new elasticSearch($firebase, $q, snippets, defaultQueryRefUrl, defaultResponseRefUrl, defaultCacheRefUrl);
        }
    }

    function elasticSearch($firebase, $q, snippets, defaultQueryRefUrl, defaultResponseRefUrl, defaultCacheRefUrl) {
        function query(index, type, option) {
            var def = $q.defer(),
                refUrl = option.queryUrl || defaultQueryRefUrl,
                responseUrl = option.responseUrl || defaultResponseRefUrl,
                searchData = {index: index, type: type, body: option.body};


            if (angular.isString(option.cache)) {
                var cacheId = getCacheId(searchData),
                    searchCacheRef = $firebase.ref(option.cache).child(cacheId);
                responseUrl = searchCacheRef.toString();

                searchCacheRef.child('result').once('value', function (snap) {
                    var result = snap.val();
                    searchData.responseUrl = responseUrl;
                    if (snap.val() === null) {
                        request(refUrl, responseUrl, searchData);
                    } else {
                        searchCacheRef.child('result/usage').update({
                            times: result.usage.times+1,
                            last: Firebase.ServerValue.TIMESTAMP
                        }, function (err) {
                            if(err){
                                def.reject(err)
                            } else {
                                def.resolve(snap.val());
                            }
                        });
                    }
                });
            } else {
                request(refUrl, responseUrl, searchData);
            }

            function request(refUrl, responseUrl, searchData) {
                var req = {
                    request: [{
                        refUrl: refUrl,
                        value: searchData
                    }],
                    response: [responseUrl]
                };
                $firebase.request(req)
                    .then(function (res) {
                        def.resolve(res[0])
                    }, function (err) {
                        def.reject(err)
                    });
            }

            return def.promise;
        }


        function getCacheId(searchObj) {
            var sorted = snippets.sortObjectByPropery(searchObj);
            return snippets.md5(JSON.stringify(sorted));
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

(function () {
    'use strict';

    angular
        .module('quartz.components')
        .provider('$elasticSearch', elasticSearchProvider);

    function elasticSearchProvider() {
        var defaultQueryRefUrl = 'query/request/$reqId',
            defaultResponseRefUrl = 'query/response/$reqId',
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
        this.$get = /* @ngInject */function (syncTime, $firebase, $q, snippets) {
            return new ElasticSearch(syncTime, $firebase, $q, snippets, defaultQueryRefUrl, defaultResponseRefUrl, defaultCacheRefUrl);
        }
    }

    function ElasticSearch(syncTime, $firebase, $q, snippets, defaultQueryRefUrl, defaultResponseRefUrl, defaultCacheRefUrl) {

        this.query = function (index, type, option) {
            var def = $q.defer(),
                refUrl = option.queryUrl || defaultQueryRefUrl,
                searchData = angular.extend({}, {index: index, type: type}, option),
                responseUrl = option.responseUrl || defaultResponseRefUrl;


            if (angular.isString(option.cache)||option.cache===true) {
                var cacheId = getCacheId(searchData),
                    cacheRefUrl = option.cache===true? defaultCacheRefUrl:option.cache,
                    searchCacheRef = $firebase.ref(cacheRefUrl).child(cacheId);
                responseUrl = searchCacheRef.toString();

                searchCacheRef.child('result').once('value', function (snap) {
                    var result = snap.val();
                    searchData.responseUrl = responseUrl;
                    if (snap.val() === null) {
                        request(refUrl, responseUrl, searchData);
                    } else {
                        //check if the cache is expired or used many times
                        syncTime.onReady().then(function (getTime) {
                            console.log(getTime());
                            if (getTime() - result.usage.last > (option.expire || 30 * 24 * 60 * 60 * 1000) || result.usage.times > (option.reuse || 100)) {
                                request(refUrl, responseUrl, searchData);
                            } else {
                                searchCacheRef.child('result/usage').update({
                                    times: result.usage.times + 1,
                                    last: Firebase.ServerValue.TIMESTAMP
                                }, function (err) {
                                    if (err) {
                                        def.reject(err)
                                    } else {
                                        def.resolve(snap.val());
                                    }
                                });
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
                    response: [responseUrl + '/result']
                };
                $firebase.request(req)
                    .then(function (res) {
                        def.resolve(res[0])
                    }, function (err) {
                        def.reject(err)
                    });
            }

            return def.promise;
        };

        this.paginator = function(index, type, option){
            var _paginators = {},
                _option = option||{},
                self = this;
            return {
                get: function (page, limit) {
                    if(_paginators['p'+page+'l'+limit]){
                        return _paginators['p'+page+'l'+limit].get(page);
                    } else {

                        delete _option.page;
                        _option.size = limit||10;
                        _paginators['p'+page+'l'+limit] = new Paginator(self.query, index, type, _option, defaultCacheRefUrl, $q);
                        return _paginators['p'+page+'l'+limit].get(page);
                    }
                }
            };
        };




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
    }

    function Paginator(query, index, type, option, defaultCacheRefUrl, $q) {
        //do some check here to see if inputs are correct
        if(option.cache){
            option.cache = angular.isString(option.cache)? option.cache: defaultCacheRefUrl;
        }
        option.size = option.size||20;
        option.from = 0;
        this.query = query;
        this.index = index;
        this.type = type;
        this.option = option;
        this.limit = option.size;
        this.data = {};
        this.currentPage = 0;
        this.$q = $q;
    }
    Paginator.prototype = {
        get:function(page){
            var self = this,
                def = this.$q.defer();
            page = page||1;
            if(self.data[page]) {
                def.resolve(self.data[page]);
            } else {
                self.currentPage = page;
                self.option.from = parseInt(page-1)*parseInt(self.limit);
                self.query(self.index, self.type, self.option).then(function (res) {
                    self.data[page] = res;
                    def.resolve(self.data[page])
                })
            }
            return def.promise;
        }
    };
})();

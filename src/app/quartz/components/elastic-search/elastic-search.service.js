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
        this.$get = /* @ngInject */function (syncTime, lzString, $firebase, $firebaseStorage, $q, snippets) {
            return new ElasticSearch(syncTime, lzString, $firebase, $firebaseStorage, $q, snippets, defaultQueryRefUrl, defaultResponseRefUrl, defaultCacheRefUrl);
        }
    }

    function ElasticSearch(syncTime, lzString, $firebase, $firebaseStorage, $q, snippets, defaultQueryRefUrl, defaultResponseRefUrl, defaultCacheRefUrl) {

        this.query = function (index, type, option) {
            var def = $q.defer(),
                refUrl = option.queryUrl || defaultQueryRefUrl,
                searchData = angular.extend({}, {indexType: index + ':' + type}, option),
                cacheId = snippets.md5Obj(searchData),
                cacheRefUrl = option.cache === true ? defaultCacheRefUrl + '/' + index + type : option.cache,
                storageRefPath = cacheRefUrl + '/' + cacheId,
                responseUrl = option.responseUrl || defaultResponseRefUrl;

            if (angular.isString(option.cache) || option.cache === true) {
                var searchCacheRef = $firebase.ref(cacheRefUrl).child(cacheId);
                responseUrl = searchCacheRef.toString();

                var getFromDatabase = function () {
                    $firebase.cache(cacheId, searchCacheRef.child('usage/created'), searchCacheRef).then(function (val) {
                        searchData.responseUrl = responseUrl;
                        if (val === null) {
                            request(refUrl, responseUrl, searchData);
                        } else {
                            var result = val.result,
                                usage = val.usage;
                            def.resolve(result);
                        }
                    });
                };

                $firebaseStorage.getWithCache(storageRefPath, {chkRefUrl: searchCacheRef.child('checksum').toString().split('.com/')[1]}).then(function (res) {
                    if (!res) {
                        getFromDatabase();
                    } else {
                        def.resolve(res);
                    }
                });


                // getFromDatabase();
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
                        var _res = lzString.decompress(res[0]).result;
                        $firebaseStorage.update(storageRefPath, _res);
                        def.resolve(_res);
                    }, function (err) {
                        def.reject(err);
                    });
            }

            return def.promise;
        };
        this.paginator = function (index, type, query) {
            var _paginators = {},
                self = this,
                out = {};

            out.query = {
                //cache: 'query/cache',
                reuse: 100, //how many times this cache will be reused
                expire: 1000000000, //how long does it take for this cache to expire
                body: {}
            };

            angular.extend(out.query, query || {});
            out.size = 10;
            out.page = 1;
            out.result = {};
            out.orderBy = '';

            out.setQuery = function (query) {
                out.query = query;
            };

            function _get(name, page, def) {
                _paginators[name].get(page).then(
                    function (res) {
                        out.result = res;
                        def.resolve(res)
                    }
                );
            }

            out.get = function (page, limit) {
                var name = 'p' + page + 'l' + limit + 'o' + out.orderBy || '',
                    def = $q.defer();
                if (_paginators[name]) {
                    _get(name, page, def);
                } else {
                    out.query.size = limit || 10;
                    _paginators[name] = new Paginator(self.query, index, type, out.query, defaultCacheRefUrl + '/' + index + type, $q);
                    _get(name, page, def)
                }
                out.promise = def.promise;
                return def.promise;
            };

            out.onReorder = function (orderBy) {
                orderBy = orderBy.replace('.', '_dot_');
                out.orderBy = orderBy;
                var isDesc = orderBy.split('-')[1],
                    sortBy = isDesc ? isDesc : orderBy,
                    sort = {};
                sort[sortBy] = {"order": !!isDesc ? "desc" : "asc"};
                out.query.body.sort = sort;
                out.get(1, out.size);
            };

            return out
        };

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
        if (option.cache) {
            option.cache = angular.isString(option.cache) ? option.cache : defaultCacheRefUrl;
        }
        option.size = option.size || 20;
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
        get: function (page) {
            var self = this,
                def = this.$q.defer();
            page = page || 1;
            if (self.data[page]) {
                def.resolve(self.data[page]);
            } else {
                self.currentPage = page;
                self.option.from = parseInt(page - 1) * parseInt(self.limit);
                self.query(self.index, self.type, self.option).then(function (res) {
                    self.data[page] = res;
                    def.resolve(self.data[page])
                })
            }
            return def.promise;
        }
    };
})();

(function () {
    'use strict';

    window._core = window._core||{};
    window._core.ElasticSearch = ElasticSearch;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return ElasticSearch;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = ElasticSearch
    }

    function ElasticSearch(fbUtil) {
        //constructor
        this.fbUtil = fbUtil;
    }

    ElasticSearch.prototype.query = function (siteName, type, option) {
        var self = this,
            request = function (refUrl, responseUrl, searchData, resolve, reject) {
                var req = {
                    request: [{
                        refUrl: refUrl,
                        value: searchData
                    }],
                    response: [responseUrl]
                };
                this.fbUtil.database.request(req)
                    .then(function (res) {
                        var _res = _core.encoding.decompress(res[0]).result;
                        resolve(_res);
                    }, function (err) {
                        reject(err);
                    });
            };

        return new Promise(function (resolve, reject) {
            var searchData = Object.assign({}, {indexType: siteName + ':' + type}, option),
                cacheId = _core.encoding.md5(searchData),
                paths = self.fbUtil.paths,
                refUrl = paths['query-request'] + '/' + cacheId,
                cacheRefUrl = paths['query-cache'] + '/' + siteName + type,
                storageRefPath = cacheRefUrl + '/' + cacheId;
            // var getWithCache = function (type, onNoData) {
            //     return function(){
            //         self.fbUtil[type].getWithCache(storageRefPath).then(function (res) {
            //             if (!res) {
            //                 if(onNoData){
            //                     onNoData()
            //                 } else {
            //                     request(refUrl, storageRefPath, searchData, resolve, reject);
            //                 }
            //             } else {
            //                 resolve(res.result || res);
            //             }
            //         });
            //     }
            // };
            // getWithCache('storage', getWithCache('database'))();

            self.fbUtil.storage.getWithCache(storageRefPath).then(function (res) {
                if (!res) {
                    self.fbUtil.database.getWithCache(storageRefPath).then(function (databaseRes) {
                        if (!databaseRes) {
                            request(refUrl, storageRefPath, searchData, resolve, reject);
                        } else {
                            resolve(res.result || res);
                        }
                    });
                } else {
                    resolve(res.result || res);
                }
            });
        })
    };

    ElasticSearch.prototype.buildQuery=function(mustArr, mustNotArr, query){
        var queryData = {
            cache: true,
            reuse: 200,
            body: {
                query: {
                    "filtered": {
                        "filter": {
                            "bool": {}
                        }
                    }
                }
            }
        };

        if (mustArr) queryData.body.query.filtered.filter.bool.must = mustArr;
        if (mustNotArr) queryData.body.query.filtered.filter.bool['must_not'] = mustNotArr;
        if (query) queryData.body.query.filtered.query = query;
        return queryData;
    };

    ElasticSearch.prototype.queryList = function(params){
        var type = params.type,
            index= params.siteName,
            cate = isNaN(params.cate) ? params.cate : null,
            subCate = isNaN(params.subCate) ? params.subCate : null,
            tag = params.tag || null,
            queryString = params.queryString || '',
            query,
            mustArr = [],
            mustNotArr = [{"term": {"show": false}}];


        if (typeof tag==='string') {
            var tagTerm = {};
            tagTerm['tags_dot_' + tag] = 1;
            mustArr.push({"term": tagTerm});
        }
        if (parseInt(cate) % 1 === 0) {
            mustArr.push({"term": {"category": cate}});
            if (parseInt(subCate) % 1 === 0) mustArr.push({"term": {"subcategory": subCate}});
        }

        if (typeof queryString==='string' && queryString.trim() !== '') {
            query = {
                "fields": type === 'article' ? ["title", "description"] : ["itemName", "description"],
                "query": queryString,
                "use_dis_max": true
            };
        }
        return new Pagination(this, index, type, this.buildQuery(mustArr,mustNotArr, query));
    };

    function Pagination(esClient, index, type, query) {
        query.size = query.size || 20;
        query.from = 0;
        this.esClient = esClient;
        this.index = index;
        this.type = type;
        this.query = query;
        this.cache = {};
    }

    Pagination.prototype.get = function (page, limit, orderBy) {
        var self = this,
            _limit = limit || this.query.size,
            id = 'p' + page + 'l' + _limit + 'o' + (orderBy || '');
        if (orderBy) this.query.body.sort = getQuerySort(orderBy);


        if (!this.cache[id]) {
            this.cache[id] = new Promise(function (resolve, reject) {
                page = page || 1;
                self.currentPage = page;
                self.query.from = parseInt(page - 1) * parseInt(_limit);
                self.esClient.query(self.index, self.type, self.query).then(function (res) {
                    resolve(res)
                }).catch(function (err) {
                    reject(err);
                })
            });
        }
        return this.cache[id];
    };

    Pagination.prototype.onReorder = function (orderBy) {
        this.query.body.sort = getQuerySort(orderBy);
        this.get(1, this.query.size, orderBy);
    };

    function getQuerySort(orderBy) {
        orderBy = orderBy.replace('.', '_dot_');
        var isDesc = orderBy.split('-')[1],
            sortBy = isDesc ? isDesc : orderBy,
            sort = {};
        sort[sortBy] = {"order": !!isDesc ? "desc" : "asc"};
        return sort;
    }
})();
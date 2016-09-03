var ElasticSearch = (function () {
    'use strict';

    function ElasticSearch(fbUtil) {
        //constructor

        var self = this;
        this.database =fbUtil.database;
        this.storage = fbUtil.storage;
        this.paths = fbUtil.paths;
    }

    ElasticSearch.prototype = {
        query:query
    };

    function query(siteName, type, option){
        var self=this,
            request =function (refUrl, responseUrl, searchData, resolve,reject) {
            var req = {
                request: [{
                    refUrl: refUrl,
                    value: searchData
                }],
                response: [responseUrl]
            };
            this.database.request(req)
                .then(function (res) {
                    var _res = lzString.decompress(res[0]).result;
                    //$firebaseStorage.update(storageRefPath, _res);
                    resolve(_res);
                }, function (err) {
                    reject(err);
                });
        };

        return new Promise(function(resolve, reject){
            var searchData = Object.assign({}, {indexType: siteName + ':' + type}, option),
                cacheId = encode.md5(searchData),
                paths=self.paths,
                refUrl = paths['query-request']+'/'+cacheId,
                cacheRefUrl = paths['query-cache'] + '/' + siteName + type,
                storageRefPath = cacheRefUrl + '/' + cacheId;
            self.storage.getWithCache(storageRefPath).then(function(res){
                if(!res){
                    request(refUrl, storageRefPath, searchData, resolve,reject)
                } else {
                    resolve(res.result||res);
                }
            });
        })
    }



    return ElasticSearch
})();

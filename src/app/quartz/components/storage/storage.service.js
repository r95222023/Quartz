(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('$firebaseStorage', StorageService);

    /* @ngInject */
    function StorageService($q, $rootScope, lzString, syncTime) {
        // function get(path) {
        //     var def = $q.defer(),
        //         dereg = $rootScope.$on('FBS:' + path, function (evt, data) {
        //             dereg();
        //             def.resolve(data);
        //         });
        //
        //     firebase.storage().ref(path + '.js').getMetadata().then(function (metadata) {
        //         console.log(metadata)
        //     });
        //     firebase.storage().ref(path + '.js').getDownloadURL()
        //         .then(function (url) {
        //             var script = document.createElement('script');
        //             script.type = "text/javascript";
        //             script.src = url;
        //
        //             angular.element('head').append(script);
        //         });
        //     return def.promise;
        // }

        function getWithCache(path) {
            var def = $q.defer(),
                promise = $q.all({
                    meta: firebase.storage().ref(path + '.js').getMetadata(),
                    url: firebase.storage().ref(path + '.js').getDownloadURL()
                }),
                dereg = $rootScope.$on('FBS:' + path, function (evt, value) {
                    dereg();
                    def.resolve(value);
                });
            promise.then(function (res) {
                var url = res.url,
                    meta = res.meta,
                    cachePath = 'FBS:' + path,
                    updated = (new Date(meta.updated)).getTime();
                if (localStorage && localStorage.getItem(cachePath)) {
                    var cached = localStorage.getItem(cachePath),
                        cachedVal = lzString.decompress({compressed:cached});
                    if(updated<cachedVal.cachedTime){
                        def.resolve(cachedVal.value);
                        console.log('from cache');
                        dereg(); //prevent memory leak
                    } else {
                        loadJsFromUrl(url);
                    }
                } else {
                    loadJsFromUrl(url);
                }
            });
            return def.promise;
        }

        function update(path, value) {
            syncTime.onReady().then(function(getTime){
                var storageRef = firebase.storage().ref(),
                    _value = {path: path, value: value, updated: getTime()},
                    dataString = '_getFBS("' + lzString.compress(_value) + '")',
                    data = new Blob([dataString], {type: 'text/javascript'});
                return storageRef.child(path + '.js').put(data);
            });
        }

        function loadJsFromUrl(url) {
            var script = document.createElement('script');
            script.type = "text/javascript";
            script.src = url;
            angular.element('head').append(script);
        }

        window._getFBS = function (text) {
            var data = lzString.decompress({compressed: text});
            $rootScope.$broadcast('FBS:' + data.path, data.value);
            syncTime.onReady().then(function(getTime){
                if (localStorage) {
                    data.cachedTime = getTime();
                    localStorage.setItem('FBS:' + data.path, lzString.compress(data));
                }
            })
        };

        return {
            // get: get,
            getWithCache: getWithCache,
            update: update
        }
    }
})();

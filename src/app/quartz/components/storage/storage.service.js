(function () {
    'use strict';

    angular
        .module('quartz.components')
        .provider('$firebaseStorage', storageProvider);

    function storageProvider() {
        var app = firebase.app(),
            mainStorage = firebase.storage(),
            storageFbApp = {
                app: app,
                storage: mainStorage
            };
        this.setStorageFbApp = function (config) {
            firebase.initializeApp(config, "mainStorage");
            var app = firebase.app("mainStorage");
            storageFbApp = {
                app: app,
                storage: app.database()
            }
        };
        this.$get = /* @ngInject */ function ($q, $rootScope, $firebase, lzString, syncTime) {
            return new Storage(storageFbApp, $q, $rootScope, $firebase, lzString, syncTime)
        }
    }

    /* @ngInject */
    function Storage(storageFbApp, $q, $rootScope, $firebase, lzString, syncTime) {
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
        var storage = storageFbApp.storage;
        var $firebaseStorage = {
            // get: get,
            getWithCache: getWithCache,
            update: update,
            storages: {}
        };

        function FbObj(refPath, opt) {
            var _opt = opt || {},
                _refPath = refPath || '@',
                db = $firebase.storages[_refPath.split("@")[1]] || {},
                root = (db.path || _refPath.split("@")[1] || '').split("#")[0] || '',
                rootPath = (db.path || _refPath.split("@")[1] || '').split("#")[1];

            this.rootPath = rootPath ? root + '/' + rootPath : root;
            this.path = this.rootPath + (root? '/':'') + _refPath.split("@")[0];
            this.appName = _opt.appName || '';
        }

        function ref(refPath, opt) {
            var path = (new FbObj(refPath, opt)).path+'.js';
            return storage.ref(path);
        }

        function getWithCache(path) {
            var def = $q.defer(),
                _ref=ref(path),
                promise = $q.all({
                    meta: _ref.getMetadata(),
                    url: _ref.getDownloadURL()
                }),
                id='FBS:' + (new FbObj(path)).path,
                dereg = $rootScope.$on(id, function (evt, value) {
                    dereg();
                    def.resolve(value);
                });

            setTimeout(function(){
                if(dereg) dereg();
            },10000);
            promise.then(function (res) {
                var url = res.url,
                    meta = res.meta,
                    cachePath = id,
                    updated = (new Date(meta.updated)).getTime();
                if (localStorage && localStorage.getItem(cachePath)) {
                    var cached = localStorage.getItem(cachePath),
                        cachedVal = lzString.decompress({compressed: cached});
                    if (updated < cachedVal.cachedTime) {
                        def.resolve(cachedVal.value);
                        console.log('from cache');
                        dereg(); //prevent memory leak
                    } else {
                        loadJsFromUrl(url,id);
                    }
                } else {
                    loadJsFromUrl(url,id);
                }
            });
            return def.promise;
        }

        function update(path, value) {
            var _path = (new FbObj(path)).path;
            syncTime.onReady().then(function (getTime) {
                var storageRef = storage.ref(),
                    _value = {path: _path, value: value, updated: getTime()},
                    dataString = "_getFBS("+JSON.stringify(_value)+")",
                    data = new Blob([dataString], {type: 'text/javascript'});
                return storageRef.child(_path+'.js').put(data);
            });
        }

        function loadJsFromUrl(url, id) {
            var script = document.createElement('script');
            script.type = "text/javascript";
            script.src = url;
            if(id) script.id=id;
            angular.element('head').append(script);
        }

        window._getFBS = function (data) {
            console.log(data);
            $rootScope.$broadcast('FBS:' + data.path, data.value);
            syncTime.onReady().then(function (getTime) {
                if (localStorage) {
                    data.cachedTime = getTime();
                    localStorage.setItem('FBS:' + data.path, lzString.compress(data));
                }
            })
        };

        return $firebaseStorage;
    }
})();

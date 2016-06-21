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
        this.$get = /* @ngInject */ function ($q, $rootScope, $firebase, lzString, snippets, syncTime, $timeout) {
            return new Storage(storageFbApp, $q, $rootScope, $firebase, lzString, snippets, syncTime, $timeout)
        }
    }

    /* @ngInject */
    function Storage(storageFbApp, $q, $rootScope, $firebase, lzString, snippets, syncTime, $timeout) {
        var storage = storageFbApp.storage;
        var $firebaseStorage = {
            $get: $get,
            getWithCache: getWithCache,
            update: update,
            remove: remove,
            storages: {}
        };

        function FbObj(refPath, opt) {
            var _opt = opt || {},
                _refPath = refPath || '@',
                db = $firebase.storages[_refPath.split("@")[1]] || {},
                root = (db.path || _refPath.split("@")[1] || '').split("#")[0] || '',
                rootPath = (db.path || _refPath.split("@")[1] || '').split("#")[1];

            this.rootPath = rootPath ? root + '/' + rootPath : root;
            this.path = this.rootPath + (root ? '/' : '') + _refPath.split("@")[0];
            this.appName = _opt.appName || '';
        }

        function ref(refPath, opt) {
            var path = (new FbObj(refPath, opt)).path + '.js';
            return storage.ref(path);
        }

        function getWithCache(path, opt) {
            var def = $q.defer(),
                _opt = opt || {},
                _ref = ref(path),
                promise = $q.all({
                    meta: _ref.getMetadata(),
                    url: _ref.getDownloadURL(),
                    checksum: getChecksum()
                }),
                id = 'FBS:' + (new FbObj(path)).path,
                dereg = $rootScope.$on(id, function (evt, value) {
                    dereg();
                    if (!_opt.chkRefUrl || snippets.md5Obj(value) === _opt.checksum) {
                        resolve(value);
                    } else {
                        def.reject('checksum does not match.')
                    }
                });
            function resolve(res){
                $timeout(function(){
                    def.resolve(res);
                },0)
            }

            function getChecksum() {
                var chkDefer = $q.defer();
                if (_opt.checksum) {
                    chkDefer.resolve();
                } else if (_opt.chkRefUrl) {
                    $firebase.ref(_opt.chkRefUrl).once('value', function (snap) {
                        _opt.checksum = snap.val();
                        chkDefer.resolve();
                    })
                } else {
                    chkDefer.resolve();
                }
                return chkDefer.promise;
            }


            setTimeout(function () {
                if (dereg) dereg();
            }, 10000);
            promise.catch(function (error) {
                if (error.code === 'storage/object-not-found') {
                    resolve(null);
                } else {
                    def.reject(error);
                }
            }).then(function (res) {
                if (res === undefined) return;
                var url = res.url,
                    meta = res.meta,
                    cachePath = id,
                    updated = (new Date(meta.updated)).getTime();
                if (localStorage && localStorage.getItem(cachePath)) {
                    var cached = localStorage.getItem(cachePath),
                        cachedVal = lzString.decompress({compressed: cached});
                    if (updated < cachedVal.cachedTime) {
                        resolve(cachedVal.value);
                        console.log('from cache');
                        dereg(); //prevent memory leak
                    } else {
                        loadJsFromUrl(url, id);
                    }
                } else {
                    loadJsFromUrl(url, id);
                }
            });
            return def.promise;
        }

        function update(path, value) {
            var _path = (new FbObj(path)).path;
            syncTime.onReady().then(function (getTime) {
                var storageRef = storage.ref(),
                    isCompress = true,
                    _value = {
                        path: _path,
                        updated: getTime()/*,value: value*/,
                        compressed: lzString.compress({value: value})
                    },
                    _valStr = JSON.stringify(_value),
                    dataString;
                try {
                    eval("angular.noop(" + _valStr + ")");
                }
                catch (err) {
                    isCompress = false;
                }
                if (!isCompress) {
                    _valStr = JSON.stringify({
                        path: _path,
                        updated: getTime(), value: value
                    });
                }
                dataString = "_getFBS(" + _valStr + ");";
                var data = new Blob([dataString], {type: 'text/javascript'});

                return storageRef.child(_path + '.js').put(data);
            });
        }

        function remove(path) {
            var _path = (new FbObj(path)).path;
            return storage.ref().child(_path + '.js').delete();
        }

        function loadJsFromUrl(url, id) {
            var script = document.createElement('script');
            script.type = "text/javascript";
            script.src = url;
            if (id) script.id = id;
            angular.element('head').append(script);
        }

        var temp = {};

        function $get(path, process, reload) {
            temp[path] = temp[path] || {};
            if (reload) temp[path] = {};
            if (temp[path].load === 'loaded') {
                return temp[path].val;
            } else if (temp[path].load === 'loading') {
                return;
            }
            temp[path].load = 'loading';
            getWithCache(path + '@selectedSite').then(function (val) {
                temp[path] = {
                    val: angular.isFunction(process) ? process(val) : val,
                    load: 'loaded'
                };
            });
        }

        window._getFBS = function (data) {
            var _data = lzString.decompress(data);
            $rootScope.$broadcast('FBS:' + _data.path, _data.value);
            syncTime.onReady().then(function (getTime) {
                if (localStorage) {
                    _data.cachedTime = getTime();
                    localStorage.setItem('FBS:' + _data.path, lzString.compress(_data));
                }
            })
        };

        return $firebaseStorage;
    }
})();

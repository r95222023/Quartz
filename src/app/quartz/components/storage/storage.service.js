(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('$firebaseStorage', $firebaseStorage);

    // function storageProvider() {
    //     // var app = firebase.app(),
    //     //     mainStorage = firebase.storage(),
    //     //     storageFbApp = {
    //     //         app: app,
    //     //         storage: mainStorage
    //     //     };
    //     // this.setStorageFbApp = function (config) {
    //     //     firebase.initializeApp(config, "mainStorage");
    //     //     var app = firebase.app("mainStorage");
    //     //     storageFbApp = {
    //     //         app: app,
    //     //         storage: app.database()
    //     //     }
    //     // };
    //     this.$get = /* @ngInject */ function ($q, $rootScope, $firebase, snippets, $timeout, $usage, $http) {
    //         return new Storage(storageFbApp, $q, $rootScope, $firebase, snippets, $timeout, $usage, $http)
    //     }
    // }

    /* @ngInject */
    function $firebaseStorage($q, $firebase, $timeout) {
        var $firebaseStorage = {
            get: get,
            getWithCache: getWithCache,
            copy: copy,
            update: update,
            remove: remove,
            ref: ref,
            getSingleDownloadUrl: getSingleDownloadUrl,
            clearTemp: clearTemp,
            storages: {}
        };

        function buildOpt(option) {
            var params = {},
                _option = option || {};
            if ($firebase.databases.selectedSite) params.siteName = $firebase.databases.selectedSite.siteName;
            if (_option.params) {
                _option.params = Object.assign(params, _option.params);
            } else {
                _option = Object.assign(params, _option);
            }
            return _option;
        }

        function getWithCache(path, option) {
            return _core.fbUtil.storage.getWithCache(path, buildOpt(option));
        }

        function update(path, value, onState, option) {
            return _core.fbUtil.storage.update(path, value, onState, buildOpt(option))
        }

        function ref(refPath, opt) {
            return _core.fbUtil.storage.ref(refPath, buildOpt(opt));
        }

        function getSingleDownloadUrl(url) {
            if (angular.isArray(url)) {
                return url[Math.floor(Math.random() * (url.length))];
            } else {
                return url;
            }
        }

        function copy(srcPath, destPath, removeSrc, onMeta, onState) {
            var def = $q.defer(),
                _onState = angular.isFunction(onState) ? onState : angular.noop,
                _onMeta = angular.isFunction(onMeta) ? onMeta : angular.noop,
                srcRef = ref(srcPath, {isJs: false}),
                destRef = ref(destPath, {isJs: false});

            srcRef.getMetadata().then(function (meta) {
                var url = getSingleDownloadUrl(meta.downloadURLs);

                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);

                xhr.responseType = 'arraybuffer';
                _onMeta(meta);

                xhr.onload = function () {
                    if (this.status == 200) {
                        var bin = new window.Blob([xhr.response], {type: meta.contentType});
                        destRef.put(bin).on('state_changed', _onState, def.reject, function () {
                            if (removeSrc) {
                                srcRef.delete();
                            }
                            def.resolve();
                        });
                        def.resolve();
                    }
                };
                xhr.addEventListener('error', function () {
                    def.reject('GET error:' + xhr.status);
                });
                xhr.send();

                // $http.get(url).success(function (data) {
                //     var bin = new window.Blob([data]);
                //     destRef.put(bin).on('state_changed', _onState, def.reject, function () {
                //         if (removeSrc) {
                //             srcRef.delete();
                //         }
                //         def.resolve();
                //     });
                //     def.resolve(data);
                // }).error(function (data, code) {
                //     def.reject(code);
                // })
            });
            return def.promise;
        }

        function remove(path, opt) {
            return ref(path, opt).delete();
        }

        var temp = {};

        function clearTemp() {
            angular.forEach(temp, function (val, key) {
                delete temp[key].load;
            })
        }

        function get(path, process) {
            temp[path] = temp[path] || {};

            if (temp[path].load === 'loaded') {
                return temp[path].val;
            } else if (temp[path].load === 'loading') {
                return;
            }
            temp[path].load = 'loading';
            getWithCache(path).then(function (val) {
                temp[path] = {
                    val: angular.isFunction(process) ? process(val) : val,
                    load: 'loaded'
                };
            });
        }

        window._getFBS = function (data) {
            window._FBUsg.useBandwidth(data);
            window._getGetFBS()(data, function (val) {
                $timeout(function () {
                    // console.log(val)
                }, 0);
            });


            // var _data = _core.encoding.decompress(data),
            //     id = getId(_data.path);
            // $rootScope.$broadcast(id, _data.value);
            // _core.syncTime().then(function (getTime) {
            //     if (localStorage) {
            //         _data.cachedTime = getTime();
            //         localStorage.setItem(id, _core.encoding.compress(_data));
            //     }
            // })
        };

        // function getId(path) {
        //     var siteName = $firebase.databases.selectedSite.siteName;
        //     if (path.search('@selectedSite') !== -1) {
        //         return 'FBS:' + siteName + '/' + path.replace('@selectedSite', '');
        //     } else if (path.search('sites/detail') !== -1) {
        //         var pathArr = path.split('/');
        //         pathArr.splice(0, 3);
        //         return 'FBS:' + siteName + '/' + pathArr.join('/')
        //     }
        // }

        //
        // var storagePromises = {},
        //     storageReload = {};

        // function getWithCache(path, opt) {
        //
        //     var def = $q.defer(),
        //         id = getId(path);
        //
        //     if (storagePromises[id] && !storageReload[id]) return storagePromises[id]; //prevent getting the data twice i a short period;
        //     storagePromises[id] = def.promise;
        //     storageReload[id] = false;
        //     var _opt = opt || {},
        //         _ref = ref(path),
        //         promise = $q.all({
        //             meta: _ref.getMetadata(),
        //             // url: _ref.getDownloadURL(),
        //             checksum: getChecksum()
        //         }),
        //         dereg = $rootScope.$on(id, function (evt, value) {
        //             dereg();
        //             if (!_opt.chkRefUrl || snippets.md5Obj(value) === _opt.checksum) {
        //                 resolve(value);
        //             } else {
        //                 def.reject('checksum does not match.')
        //             }
        //         });
        //     function resolve(res) {
        //         $timeout(function () {
        //             def.resolve(res);
        //         }, 0)
        //     }
        //
        //     function getChecksum() {
        //         var chkDefer = $q.defer();
        //         if (_opt.checksum) {
        //             chkDefer.resolve();
        //         } else if (_opt.chkRefUrl) {
        //             $firebase.ref(_opt.chkRefUrl).once('value', function (snap) {
        //                 _opt.checksum = snap.val();
        //                 chkDefer.resolve();
        //             })
        //         } else {
        //             chkDefer.resolve();
        //         }
        //         return chkDefer.promise;
        //     }
        //
        //
        //     setTimeout(function () {
        //         if (dereg) dereg();
        //         console.log('timeout')
        //     }, 10000);
        //     promise.catch(function (error) {
        //         if (error.code === 'storage/object-not-found') {
        //             // def.resolve(null);
        //             // $firebase.ref(path).once('value',function(snap){
        //             //     def.resolve(lzString.decompress(snap.val()));
        //             // });
        //             if (_opt.fromDatabase !== false) {
        //                 $firebase.cache(path, 'editTime', $firebase.ref(path)).then(function (val) {
        //                     resolve(val);
        //                 });
        //             } else {
        //                 resolve(null);
        //             }
        //         } else {
        //             def.reject(error);
        //         }
        //     }).then(function (res) {
        //         if (res === undefined) return;
        //         var url = getSingleDownloadUrl(res.meta.downloadURLs),
        //             meta = res.meta,
        //             cachePath = id,
        //             updated = (new Date(meta.updated)).getTime();
        //
        //         if (localStorage && localStorage.getItem(cachePath)) {
        //             var cached = localStorage.getItem(cachePath),
        //                 cachedVal = _core.encoding.decompress({compressed: cached});
        //             if (updated < cachedVal.cachedTime) {
        //                 resolve(cachedVal.value);
        //                 console.log('from cache');
        //                 dereg(); //prevent memory leak
        //             } else {
        //                 loadJsFromUrl(url, id);
        //             }
        //         } else {
        //             loadJsFromUrl(url, id);
        //         }
        //     });
        //     return def.promise;
        // }


        // function _update(path, value, onState) {
        //     var _path = (new FbObj(path)).path,
        //         id = 'FBS:' + _path,
        //         _onState = angular.isFunction(onState) ? onState : angular.noop,
        //         def = $q.defer();
        //     _core.syncTime().then(function (getTime) {
        //         var storageRef = storage.ref(),
        //             isCompress = true,
        //             _value = {
        //                 path: _path,
        //                 updated: getTime()/*,value: value*/,
        //                 compressed: _core.encoding.compress({value: value})
        //             },
        //             _valStr = JSON.stringify(_value),
        //             dataString;
        //         try {
        //             eval("angular.noop(" + _valStr + ")");
        //         }
        //         catch (err) {
        //             isCompress = false;
        //         }
        //         if (!isCompress) {
        //             _valStr = JSON.stringify({
        //                 path: _path,
        //                 updated: getTime(), value: value
        //             });
        //         }
        //         dataString = "_getFBS(" + _valStr + ");";
        //         var data = new Blob([dataString], {type: 'text/javascript'});
        //         storageReload[id] = true;
        //         return storageRef.child(_path + '.js').put(data).on('state_changed', _onState, def.reject, def.resolve);
        //     });
        //     return def.promise;
        // }


        return $firebaseStorage;
    }
})();

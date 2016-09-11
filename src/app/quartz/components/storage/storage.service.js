(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('$firebaseStorage', FirebaseStorage);

    /* @ngInject */
    function FirebaseStorage($q, $firebase, $timeout) {
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
            if (Array.isArray(url)) {
                return url[Math.floor(Math.random() * (url.length))];
            } else {
                return url;
            }
        }

        function copy(srcPath, destPath, removeSrc, onMeta, onState) {
            var def = $q.defer(),
                _onState = typeof onState === 'function' ? onState : function () {},
                _onMeta = typeof onMeta === 'function' ? onMeta : function () {},
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
            });
            return def.promise;
        }

        function remove(path, opt) {
            return ref(path, opt).delete();
        }

        var temp = {};

        function clearTemp() {
            for (var key in temp) {
                delete temp[key].load
            }
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
                    val: typeof process === 'function' ? process(val) : val,
                    load: 'loaded'
                };
            });
        }

        window._getFBS = function (data) {
            window._FBUsg.useBandwidth(data);
            window._getGetFBS()(data, function (val) {
                $timeout(angular.noop, 0);
            });
        };
        return $firebaseStorage;
    }
})();

(function () {
    'use strict';

    angular
        .module('quartz.components')
        .factory('$firebaseStorage', FirebaseStorage);

    /* @ngInject */
    function FirebaseStorage($timeout) {
        var $firebaseStorage = {
            get: get,
            getWithCache: getWithCache,
            copy: copy,
            update: update,
            remove: remove,
            ref: ref,
            getSingleDownloadUrl: getSingleDownloadUrl,
            clearTemp: clearTemp,
            fixCSSFile: fixCSSFile,
            storages: {}
        };

        function buildOpt(option) {
            var params = {},
                _option = option || {};
            if (_core.util.siteName) params.siteName = _core.util.siteName;
            if (_option.params) {
                _option.params = Object.assign(params, _option.params);
            } else {
                _option = Object.assign(params, _option);
            }
            return _option;
        }

        function getWithCache(path, option) {
            var promise = _core.util.storage.getWithCache(path, buildOpt(option));
            promise.then(function(){$timeout(angular.noop)});
            return promise;
        }

        function update(path, value, onState, option) {
            return _core.util.storage.update(path, value, onState, buildOpt(option))
        }

        function ref(refPath, opt) {
            return _core.util.storage.ref(refPath, buildOpt(opt));
        }

        function getSingleDownloadUrl(url) {
            if (Array.isArray(url)) {
                return url[Math.floor(Math.random() * (url.length))];
            } else {
                return url;
            }
        }

        function copy(srcPath, destPath, removeSrc, onMeta, onState) {
            return new Promise(function (resolve, reject) {
                var _onState = typeof onState === 'function' ? onState : function () {
                    },
                    _onMeta = typeof onMeta === 'function' ? onMeta : function () {
                    },
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
                            destRef.put(bin).on('state_changed', _onState, reject, function () {
                                if (removeSrc) {
                                    srcRef.delete();
                                }
                                resolve();
                            });
                            resolve();
                        }
                    };
                    xhr.addEventListener('error', function () {
                        reject('GET error:' + xhr.status);
                    });
                    xhr.send();
                });
            });
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

        function fixCSS(css, cssPath) {
            var _css = css + '',
                urlRegEx = /url\(['"]?[\s\S]*?['"]?\)/gm,
                matches = _css.match(urlRegEx) || [],
                promises = [];
            console.log(matches);
            matches.forEach(function (match, index) {
                var url = match.match(/url\(['"]?([\s\S]*?)["']?\)/m)[1];
                // url=url.replace('font/', '//'+location.host+'/');
                if (match.search('//') === -1) {
                    var cssPathArr = cssPath.split('/');
                    cssPathArr.pop(); //ex: /aaa/bbb/ccc.css-> ['','aaa','bbb']
                    if (cssPathArr[0] === '') cssPathArr.shift(); // ['','aaa','bbb']
                    var urlArr = url.split('../');
                    var base, relPath = '';
                    for (var i = 0; i < urlArr.length; i++) {
                        if (!urlArr[i]) {
                            cssPathArr.pop();
                        } else {
                            relPath += '/' + urlArr[i];
                        }
                    }
                    base = cssPathArr.join('/');
                    var absolutePath = base ? base + relPath : relPath.substring(1);

                    // promises[index] = $firebaseStorage.ref('file-path?path=' + url).getDownloadURL();
                    promises[index] = new Promise(function (resolve, reject) {
                        var pathMatch = absolutePath.match(/(.*?)([?]?[#].*)/m); // ex: ../fonts/abc.eot?#iefix -> fonts/abc.eot
                        var path = pathMatch === null ? absolutePath : pathMatch[1];
                        $firebaseStorage.ref('file-path?path=' + path).getDownloadURL().then(function (realUrl) {
                            resolve(realUrl);
                        }).catch(function () {
                            resolve(url);
                        });
                    });
                } else {
                    promises[index] = Promise.resolve(url);
                }
            });
            return new Promise(function (resolve, reject) {
                if (matches.length) {
                    Promise.all(promises).then(function (realUrls) {

                        realUrls.forEach(function (url, index) {
                            _css = _css.replace(matches[index], 'url("' + realUrls[index].replace('"',"'") + '")');
                        });
                        resolve(_css);
                    }).catch(reject);
                } else {
                    resolve(css);
                }
            })
        }

        function fixCSSFile(file, cssPath) {
            var myReader = new FileReader();
            return new Promise(function (resolve, reject) {
                myReader.addEventListener("loadend", function (e) {
                    fixCSS(e.srcElement.result, cssPath).then(function (fixedCSS) {
                        if (fixedCSS === e.srcElement.result) {
                            resolve(file);
                        } else {
                            var fixedCSSFile = new Blob([fixedCSS], {type: "text/css"});
                            resolve(fixedCSSFile)
                        }
                    }).catch(function (error) {
                        console.log(error);
                        resolve(file);
                    });
                });
                myReader.readAsText(file);
            });
        }

        window._getFBS = function (data) {
            window._getGetFBS()(data, function (val) {
                $timeout(angular.noop, 0);
            });
        };
        return $firebaseStorage;
    }
})();

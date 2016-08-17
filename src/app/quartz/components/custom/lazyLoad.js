(function () {
    'use strict';
    angular.module('quartz.components')
        .factory("$lazyLoad", LazyLoad);

    /* @ngInject */
    function LazyLoad($q, $ocLazyLoad, $firebaseStorage, injectCSS) {
        function getLazyLoadArgs(sources, pageName) {
            var def = $q.defer(), _sourcesArr = sources || [], jsArr = [], cssArr = [];

            angular.forEach(_sourcesArr, function (val) {
                if (val.split('.css')[1] === '') {
                    cssArr.push(val);
                } else if (val.split('.js')[1] === '') {
                    jsArr.push(val);
                }
            });

            angular.forEach(cssArr, function (cssUrl,index) {
                if (cssUrl.search('://') !== -1) {
                    injectCSS.set('style' + pageName+index, cssUrl, true);
                } else {
                    var _index = angular.copy(index);
                    $firebaseStorage.ref('files/' + cssUrl + '@selectedSite', {isJs: false}).getDownloadURL()
                        .then(function (url) {
                            injectCSS.set('style' + pageName+_index, url, true);
                        });
                }
            });

            var promises = {};
            angular.forEach(jsArr, function (jsUrl, index) {
                if (jsUrl.search('://') === -1) {
                    promises[index + ''] = $firebaseStorage.ref('files/' + jsUrl + '@selectedSite', {isJs: false}).getDownloadURL();
                }
            });
            $q.all(promises).then(function (res) {

                angular.forEach(res, function (url, _index) {
                    jsArr[_index] = url;
                });

                def.resolve({serie: true, files: jsArr});
            });
            return def.promise;
        }

        function loadData(val, def, pageId) {
            var sources = val.sources;
            injectCSS.setDirectly('style' + pageId, val.css, true);

            if (sources) {
                getLazyLoadArgs(sources, pageId).then(function (args) {
                    if (args.files.length) {
                        $ocLazyLoad.load(args).then(function () {
                            def.resolve(val);
                        })
                    } else {
                        def.resolve(val);
                    }
                });
            } else {
                def.resolve(val);
            }
        }

        function load(type, name) {

            var _name = name,
                pageId = _name.replace(/\s+/g, ''),
                def = $q.defer();

            if(angular.isObject(type)){
                loadData(type, def, pageId);
            } else {
                $firebaseStorage.getWithCache(type + 's/detail/' + _name + '@selectedSite').then(function (val) {
                    loadData(val, def, pageId);
                });
            }

            return def.promise;
        }

        function loadSite(data){
            var def = $q.defer();

            if (data.sources) {
                getLazyLoadArgs(data.sources, 'selectedSite').then(function (args) {
                    if (args.files.length) {
                        $ocLazyLoad.load(args).then(function () {
                            def.resolve();
                        })
                    } else {
                        def.resolve();

                    }
                });
            } else {
                def.resolve();
            }
            return def.promise;
        }

        return {
            load: load,
            loadSite:loadSite
        }
    }
})();

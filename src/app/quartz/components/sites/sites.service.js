(function () {
    'use strict';

    angular
        .module('quartz.components')
        .service('sitesService', SitesService)
        .run(run);

    /* @ngInject */
    function SitesService($rootScope, $firebase, $firebaseStorage, snippets, $q, indexService) {
        function rectifySiteName(siteName) {
            return siteName.trim().replace(".", "_")
        }


        function addSite(newSiteName, uid) {
            var _newSiteName = rectifySiteName(newSiteName);
            $firebase.ref('users/detail/' + uid + '/sites').push({
                siteName: _newSiteName,
                createdTime: firebase.database.ServerValue.TIMESTAMP
            }).then(function () {
                $firebase.update('sites', ['detail/' + _newSiteName, 'list/' + _newSiteName], {
                    //"toDetail@0": "test",
                    //"toList@1": "test",
                    "author@1": uid,
                    "siteName@1": _newSiteName,
                    "createdTime": firebase.database.ServerValue.TIMESTAMP
                });
                indexService.add("record", "created", {siteName: _newSiteName}, _newSiteName);
            });
        }

        function moveSite(from, to, removeOrigin) {
            var def = $q.defer(),
                self=this,
                fromRootPath = 'sites/detail/' + from + '/',
                toRootPath = 'sites/detail/' + (to||self.siteName) + '/',
                typeArr = ['products', 'articles', 'pages', 'widgets'],
                fileNameOpt = {products: 'itemId', articles: 'id'},
                typePromises = {};
            angular.forEach(typeArr, function (type) {
                typePromises[type] = $firebase.getFileTableFromList(fromRootPath + type + '/list', {fileName: fileNameOpt[type] || 'name'})
            });
            typePromises.files = $firebase.ref(fromRootPath + 'files').once('value');
            $q.all(typePromises).then(function (typeContent) {
                var copyPromises = [],
                    onNode = function (table, path) {
                        copyPromises.push($firebaseStorage.copy(fromRootPath + path, toRootPath + path))
                    };
                //articles, products, widgets, pages
                angular.forEach(typeArr, function (type) {
                    snippets.iterateFileTree({'_content': typeContent[type]}, onNode, type + '/detail');
                    copyPromises.push($firebase.copy(fromRootPath + type + '/list', toRootPath + type + '/list'));
                    copyPromises.push($firebase.copy(fromRootPath + type + '/config', toRootPath + type + '/config'));
                });
                //files
                snippets.iterateFileTree(typeContent.files.val(), onNode, 'files');
                copyPromises.push($firebase.copy(fromRootPath + 'files', toRootPath + 'files'));
                //config
                copyPromises.push($firebaseStorage.copy(fromRootPath + 'config/preload.js', toRootPath + 'config/preload.js'));
                $q.all(copyPromises).then(def.resolve);
            });
            return def.promise;
        }

        function removeSite(siteName, uid) {
            $firebase.ref('users/detail/' + uid + '/sites').orderByChild('siteName').equalTo(siteName).once('child_added', function (snap) {
                snap.ref.set(null);
            });
            $firebase.update('sites', ['detail/' + siteName, 'list/' + siteName], {
                "@all": null
            });
            indexService.remove(false, false, siteName);
        }

        var title='TBD';
        $rootScope.dynamicTitle=function(){
            return title;
        };
        this.setTitle = function(newTitle){
            title = newTitle
        };

        this.siteName = 'default';
        this.addSite=addSite;
        this.moveSite=moveSite;
        this.removeSite=removeSite;
    }


    /* @ngInject */
    function run($q, $window, $lazyLoad, config, FBURL, $rootScope,$transitions, $state, $firebase, qtMenu, sitesService, $firebaseStorage, $auth) {

        //// set current site automatically
        // function redirect(state, params) {
        //     $state.go(state, params);
        //     //
        //     // var clear = $rootScope.$on('$stateChangeSuccess', function () {
        //     //     $state.go(state, params);
        //     //     clear();
        //     // });
        // }


        function setSite(siteName, toState, reset) {
            if (sitesService.siteName !== siteName || reset) {

                console.log("Initializing " + siteName);
                $rootScope.$broadcast('site:change', siteName);
                sitesService.setTitle(siteName);
                $firebase.databases.selectedSite = {
                    siteName: siteName,
                    url: FBURL.split("//")[1].split(".fi")[0] + '#sites/detail/' + siteName
                };
                $firebase.storages.selectedSite = {
                    path: 'sites/detail/' + siteName
                };
                sitesService.siteName = siteName;
                sitesService.config = {};
                sitesService.preLoading = true;

                var def = $q.defer();
                sitesService.onReady = function () {
                    return def.promise
                };
                if (toState.name === 'customPage' || toState.name === 'previewFrame') {
                    if (sitesService.config && sitesService.config.sources) {
                        console.log('reloading');
                        $window.location.reload();
                    }
                    getPreload(def);
                } else {
                    def.resolve(sitesService);
                }
            }

        }

        function getPreload(def) {
            $firebaseStorage.getWithCache('config/preload@selectedSite').then(function (res) {
                var _res = res || {};
                $lazyLoad.loadSite(_res).then(function () {
                    sitesService.config = _res;
                    if(_res.title) sitesService.setTitle(_res.title);
                    if(_res.favicon) {
                        var src = _res.favicon;
                        if(_res.favicon.search('://')!==-1){
                            _core.siteUtil.changeFavicon(src);
                        } else {
                            $firebaseStorage.ref('files/'+src+'@selectedSite',{isJs:false}).getDownloadURL().then(function(url){
                                _core.siteUtil.changeFavicon(url);
                            })
                        }
                    }

                    delete sitesService.preLoading;

                    $rootScope.sitesService = sitesService;
                    def.resolve(sitesService);
                });
            });
        }

        function isDashboard(state) {
            var name = state.name;
            return name !== '' && (name.search('.admin') !== -1 || name === 'pageEditor' || name === 'widgetEditor');
        }

        function isCustomPage(state) {
            return state.name.search('customPage') !== -1;
        }

        if (!config.standAlone) {
            $transitions.onBefore( { to: '**' }, function(trans, $injector) {
                var toState = trans.to(),
                    fromState = trans.from(),
                    toParams = trans.params('to');
                if (toParams.siteName) {
                    setSite(toParams.siteName, toState);
                } else if (toParams.siteName === '' && $firebase.databases.selectedSite) {
                    $state.go(toState.name, angular.extend(toParams, {siteName: $firebase.databases.selectedSite.siteName}));
                }
                /*else if (toParams.siteName === '' && !$firebase.databases.selectedSite&&$auth.currentUser) {
                 redirect('quartz.admin-default.mysites');
                 }*/


                //from dashboard to selected page
                if (isDashboard(fromState) && isCustomPage(toState)) {
                    setSite(toParams.siteName, toState, true);
                }
                //from selected page to dashboard
                else if (isCustomPage(fromState) && isDashboard(toState)) {
                    console.log('reloading');

                    $window.location.reload();
                }

                sitesService.pageName = toParams.pageName;

                if ($firebase.databases.selectedSite) {
                    var siteName = $firebase.databases.selectedSite.siteName;

                    qtMenu.removeGroup("siteSelected");
                    qtMenu.addGroup("siteSelected", {siteName: siteName});
                }
            });
            // $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
            //     console.log(toParams.siteName);
            //     if (toParams.siteName) {
            //         setSite(toParams.siteName, toState);
            //     } else if (toParams.siteName === '' && $firebase.databases.selectedSite) {
            //         redirect(toState, angular.extend(toParams, {siteName: $firebase.databases.selectedSite.siteName}));
            //     }
            //     /*else if (toParams.siteName === '' && !$firebase.databases.selectedSite&&$auth.currentUser) {
            //      redirect('quartz.admin-default.mysites');
            //      }*/
            //
            //
            //     //from dashboard to selected page
            //     if (isDashboard(fromState) && isCustomPage(toState)) {
            //         setSite(toParams.siteName, toState, true);
            //     }
            //     //from selected page to dashboard
            //     else if (isCustomPage(fromState) && isDashboard(toState)) {
            //         console.log('reloading');
            //
            //         $window.location.reload();
            //     }
            //
            //     sitesService.pageName = toParams.pageName;
            //
            //     if ($firebase.databases.selectedSite) {
            //         var siteName = $firebase.databases.selectedSite.siteName;
            //
            //         qtMenu.removeGroup("siteSelected");
            //         qtMenu.addGroup("siteSelected", {siteName: siteName});
            //     }
            // });
        } else {
            qtMenu.addGroup("siteSelected");
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app.plugins.articleproduct', [])
        .service('articleProduct', ArticleProduct);
    /* @ngInject */
    function ArticleProduct(lzString, $mdToast, $mdDialog, $elasticSearch, $firebase, $firebaseStorage, indexService, snippets, $stateParams, $state, $mdMedia, config) {
        function getQueryData(mustArr, mustNotArr, query) {
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
        }

        var temp = {};
        function queryList(type, params, sort) {

            var _params = params || JSON.parse($stateParams.params||'{}')[type],
                cate = _params.cate || '',
                subCate = _params.subCate || '',
                queryString = _params.queryString || '',
                query,
                mustArr = [],
                mustNotArr = [{"term": {"show": false}}],
                id = 't-' + type + 'c-' + cate + 's-' + subCate + 'q-' + queryString;

            //
            temp[id] = temp[id] || {};

            if (temp[id].load === 'loaded') {
                return temp[id].paginator;
            } else if (temp[id].load === 'loading') {
                return;
            }

            temp[id].load = 'loading';
            ////

            if (angular.isString(_params.tag)) {
                var tagTerm = {};
                tagTerm['tags_dot_' + _params.tag] = 1;
                mustArr.push({"term": tagTerm});
            }
            if (parseInt(cate) % 1 === 0) {
                mustArr.push({"term": {"category": cate}});
                if (parseInt(subCate) % 1 === 0) mustArr.push({"term": {"subcategory": subCate}});
            }

            if (angular.isString(queryString) && queryString.trim() !== '') {
                query = {
                    "fields": type === 'article' ? ["title", "description"] : ["itemName", "description"],
                    "query": queryString,
                    "use_dis_max": true
                };
            }
            temp[id].paginator = $elasticSearch.paginator($stateParams.siteName || 'main', type, getQueryData(mustArr, mustNotArr, query));
            temp[id].paginator.onReorder(sort);
            temp[id].paginator.promise.then(function () {
                temp[id].load = 'loaded';
            })
        }
        this.queryList=queryList;

        //// categories and tags
        var cateTemp = {article: {}, product: {}};
        function getCate(type) {
            var _type = type || 'product',
                cateRefPath = _type + 's/config/categories@selectedSite';
            if(cateTemp[_type].load==='loaded') {
                return cateTemp[_type].categories
            } else if(cateTemp[_type].load==='loading') {
                return
            }
            cateTemp[_type].load='loading';
            $firebaseStorage.getWithCache(cateRefPath).then(function (val) {
                cateTemp[_type].categories = val || [];
                cateTemp[_type].load = 'loaded';
            });
        }

        function getCateCrumbs(type, categories, cate, subCate, tag) {
            var params = JSON.parse($stateParams.params||'{}')[type]||{},
                _cate = parseInt(cate || params.cate),
                _subCate = parseInt(subCate || params.subCate),
                _categories = categories || cateTemp[type].categories || [],
                res=[];
            if (tag || params.tag) return tag || params.tag;
            if (_cate % 1 === 0) {
                res.push(_categories[_cate][0]);
                if(_subCate % 1 === 0) res.push(_categories[_cate][1][_subCate]);
                return res;
            } else {
                res.push('GENERAL.ALLCATE');
                return res;
            }
        }
        this.getCate=getCate;
        this.getCateCrumbs=getCateCrumbs;
        this.getProductById = function(id){
            return $firebaseStorage.get('products/detail/'+id);
        };
        this.getArticleById = function(id){
            return $firebaseStorage.get('articles/detail/'+id);
        };
        this.cateCtr = function (vm, type) {
            var _type = type || 'product',
                cateRefPath = _type + 's/config/categories@selectedSite';

            vm.categories = cateTemp[_type].categories;
            vm.tags = cateTemp[_type].tags;

            vm.cateCrumb = function (categories, cate, subCate, tag) {
                return getCateCrumbs(_type, categories, cate, subCate, tag);
            };

            getCate(type);

            vm.addCate = function () {
                vm.categories.push(['Category Name', []])
            };

            vm.removeCate = function (ithCate, ithSub) {
                if (ithSub) {
                    vm.categories[ithCate][1].splice(ithSub, 1);
                } else {
                    vm.categories.splice(ithCate, 1);
                }
            };

            vm.addItem = function (index, value) {
                if (value) {
                    vm.categories[index][1].push(value);
                    vm.tempItem = {};
                }
            };

            vm.saveCateTag = function () {
                if (vm.categories) $firebaseStorage.update(cateRefPath, vm.categories);
            };
        };
        this.managerCtr = function (vm, type) {
            var _type = type || 'product',
                position = {
                    bottom: true,
                    top: false,
                    left: false,
                    right: true
                };

            vm.getFiltered = function () {
                $state.go('quartz.admin-default.' + _type + 'Manager', {
                    orderBy: vm.orderBy,
                    startAt: vm.startAt,
                    endAt: vm.endAt,
                    equalTo: vm.equalTo
                })
            };


            vm.paginator = $firebase.paginator(_type + 's/list@selectedSite', $stateParams);
            //initiate
            vm.paginator.onReorder($stateParams.orderBy || 'itemId');

            vm.onPaginate = function (page, size) { //to prevent this being overwritten
                vm.paginator.get(page, size)
            };
            vm.onReorder = function (sort) {
                vm.paginator.onReorder(sort);
            };

            vm.actions = [['view', 'GENERAL.VIEW'], ['edit', 'GENERAL.EDIT'], ['delete', 'GENERAL.DELETE']];
            vm.action = function (action, id, event) {
                switch (action) {
                    case 'view':
                        $state.go('quartz.admin-default.' + _type + 'Detail', {id: id});
                        break;
                    case 'edit':
                        vm.showEditor(event, id);
                        break;
                    case 'delete':
                        vm.delete(event, id);
                        break;
                }
            };


            resetData();


            function resetData() {
                vm[type] = {};
                vm.optional = {
                    options: {}
                };
                vm.paginator.page = 1;
            }


            vm.hide = function () {
                $mdDialog.hide();
            };

            vm.cancel = function () {
                $mdDialog.cancel();
            };

            vm.addOption = function () {
                vm.optional.options[vm.optional.optName] = vm.optional.optValue;
                vm.optional.optName = '';
                vm.optional.optValue = '';
            };
            vm.removeOption = function (optName) {
                delete vm.optional.options[optName];
                vm.optional.optName = '';
                vm.optional.optValue = '';
            };

            vm.addCustom = function () {
                if (!vm[type].custom) vm[type].custom = {};
                vm[type].custom[vm.customKey] = vm.customValue;
                vm.customKey = '';
                vm.customValue = '';
            };
            vm.removeCustom = function (optName) {
                delete vm[type].custom[optName];
                vm.customKey = '';
                vm.customValue = '';
            };

            vm.update = function () {
                if (angular.isObject(vm.optional.options)) {
                    vm[type].options = {};
                    angular.forEach(vm.optional.options, function (item, key) {
                        vm[type].options[key] = [];
                        //trim the input
                        angular.forEach(item.split(','), function (option, index) {
                            vm[type].options[key][index] = option.trim();
                        });
                    })
                }

                vm[type].tags = {};
                if (angular.isString(vm.optional.tags) && vm.optional.tags.trim()) {
                    var tags = vm.optional.tags.split(',');
                    angular.forEach(tags, function (tag, key) {
                        vm[type].tags[tag] = 1;
                    })
                }
                var id = vm[type].id || vm[type].itemId;

                var listData = angular.extend({}, vm[type], {description: null, custom: null}),
                    detailData = {
                        compressed: lzString.compress(vm[type]),
                        editTime: firebase.database.ServerValue.TIMESTAMP
                    };
                $firebase.update(type + "s@selectedSite", ['list/' + id, 'detail/' + id], {
                    '@0': listData,
                    '@1': detailData
                })
                    .then(function () {

                        indexService.update(type, id, vm[type]);

                        vm.hide(function () {
                            $mdToast.show(
                                $mdToast.simple()
                                    .textContent('Saved!')
                                    .position(position)
                                    .hideDelay(3000)
                            );
                            resetData();
                        });
                    });
                $firebaseStorage.update(type + 's/detail/' + id + '@selectedSite', vm[type]);
            };

            vm.delete = function (ev, id) {
                resetData();
                var confirm = $mdDialog.confirm()
                    .title('Remove ' + type + ':' + id + '?')
                    .textContent('Warning: The data will be deleted permanently.')
                    .ariaLabel('Remove ' + type + ':' + id + '?')
                    .targetEvent(ev)
                    .cancel('Cancel')
                    .ok('Remove');

                $mdDialog.show(confirm).then(function () {
                    $firebase.update(type + "s@selectedSite", ['list/' + id, 'detail/' + id], {
                        "@all": null
                    }).then(function () {
                        indexService.remove(type + 's/detail/' + id + '@selectedSite', id);
                        $firebaseStorage.remove(type + 's/detail/' + id + '@selectedSite');
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent('Deleted!')
                                .position(position)
                                .hideDelay(3000)
                        );
                    });
                }, function () {
                    //cancel
                });

            };

            vm.showEditor = function (ev, id) {
                resetData();
                if (id) {
                    $firebase.ref(type + 's/detail@selectedSite').child(id).once('value', function (snap) {
                        var val = lzString.decompress(snap.val());
                        vm[type] = val;
                        if (angular.isString(val.group)) {
                            var groups = snap.val().group.split('->');
                            vm.optional.group = groups[0];
                            vm.optional.subgroup = groups[1];
                        } else {
                            vm.optional.group = '';
                            vm.optional.subgroup = '';
                        }
                        if (angular.isObject(val.options)) {
                            angular.forEach(val.options, function (item, name) {
                                var optArr = [];
                                for (var key in item) {
                                    optArr[key] = item[key]
                                }
                                vm.optional.options[name] = optArr.toString();
                            });
                        }

                        if (angular.isObject(val.tags)) {
                            var tags = [];
                            angular.forEach(val.tags, function (item, name) {
                                tags.push(name);
                            });
                            vm.optional.tags = tags.toString();
                        }
                    });
                } else {
                    vm[type].id = type + ':' + (new Date()).getTime()
                }
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                $mdDialog.show({
                    controller: EditorController,
                    templateUrl: 'app/parts/' + type + 's/manager/editor.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                })
                    .then(function (onComplete) {
                        if (angular.isFunction(onComplete)) onComplete();
                    }, function (onCancel) {
                        if (angular.isFunction(onCancel)) onCancel();
                    });
            };

            /* @ngInject */
            function EditorController($scope, $mdDialog) {
                $scope.vm = vm;
            }
        };

        this.listCtr = function (vm, type) {
            vm.menuWidth = vm.tags ? 6 : 4;

            vm.queryList = function (params, sort) {
                return queryList(type, params, sort || (type === 'article' ? 'id' : 'itemId'));
            };
            vm.queryList();


            vm.go = function (queryString, cate, subCate, tag, pageName) {
                $state.go(pageName ? 'quartz.admin-default.customPage' : 'quartz.admin-default.productList', {
                    queryString: queryString || vm.queryString,
                    cate: cate + '' || $stateParams.cate,
                    subCate: subCate + '' || $stateParams.subCate,
                    tag: tag,
                    pageName: pageName
                })
            };

            vm.showDetail = function (id, pageName) {
                $state.go(pageName ? 'quartz.admin-default.customPage' : 'quartz.admin-default.' + type + 'Detail', {
                    id: id,
                    pageName: pageName
                });
            }
        }
    }
})();

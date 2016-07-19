(function () {
    'use strict';

    angular
        .module('app.plugins.articleproduct', [])
        .service('articleProduct', ArticleProduct);
    /* @ngInject */
    function ArticleProduct($rootScope, lzString, $mdToast, $mdDialog, $elasticSearch, $firebase, $firebaseStorage, indexService, snippets, $stateParams, $state, $mdMedia, config) {
        var self = this;

        function getParams(stateParams) {
            var _params = JSON.parse((stateParams || {}).params || $stateParams.params || '{"product":{}, "article":{}}');
            return {product: _params.product || {}, article: _params.article || {}};
        }

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

        function queryList(params) {
            var type = (params || {}).type || 'product',
                _params = angular.extend({}, getParams()[type], params),
                sort = _params.sort || (type === 'product' ? 'itemId' : 'id'),
                cate = angular.isNumber(_params.cate) ? _params.cate : null,
                subCate = angular.isNumber(_params.subCate) ? _params.subCate : null,
                tag = _params.tag || null,
                queryString = _params.queryString || '',
                query,
                mustArr = [],
                mustNotArr = [{"term": {"show": false}}],
                id = 't' + type + 'c' + cate + 's' + subCate + 'q' + queryString + 't' + tag + 's' + sort;

            //
            temp[id] = temp[id] || {};

            if (temp[id].load === 'loaded') {
                return temp[id].paginator;
            } else if (temp[id].load === 'loading') {
                return;
            }

            temp[id].load = 'loading';
            ////

            if (angular.isString(tag)) {
                var tagTerm = {};
                tagTerm['tags_dot_' + tag] = 1;
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
            temp[id].paginator.size = _params.size || 5;
            temp[id].paginator.onReorder(sort);
            temp[id].paginator.promise.then(function () {
                temp[id].load = 'loaded';
            })
        }

        this.queryList = queryList;
        this.queryProduct = function (params) {
            angular.extend(params || {}, {type: 'product'});
            return queryList(params);
        };
        this.queryArticle = function (params) {
            angular.extend(params || {}, {type: 'article'});
            return queryList(params);
        };

        //// categories and tags
        this.cate = {
            article: {}, product: {}
        };
        function getCate(type, isCrumbs) {
            var _type = type || 'product',
                cateRefPath = _type + 's/config/categories@selectedSite';
            if (self.cate[_type].load === 'loaded') {
                return isCrumbs ? self.cate[_type].crumbs : self.cate[_type].categories
            } else if (self.cate[_type].load === 'loading') {
                return
            }
            self.cate[_type].load = 'loading';
            $firebaseStorage.getWithCache(cateRefPath).then(function (val) {
                self.cate[_type].categories = val || [];
                self.cate[_type].load = 'loaded';
                function refreshCrumbs(event, toState, toParams) {
                    if (toParams.params) getCateCrumbs(_type, getParams(_type, toParams)[_type]);
                }

                refreshCrumbs(false, false, $stateParams);
                $rootScope.$on('$stateChangeSuccess', refreshCrumbs);
            });
        }

        function getCateCrumbs(type, apParams) {
            var res = [],
                toParams = {},
                cate = apParams.cate,
                subCate = apParams.subCate,
                tag = apParams.tag,
                categories = self.cate[type].categories || [];

            toParams[type] = {};
            if (cate % 1 === 0) {
                toParams[type].cate = cate;
                var cateParams = angular.copy(toParams);
                res.push({name: categories[cate][0], params: cateParams});
                if (subCate % 1 === 0) {
                    toParams[type].subCate = subCate;
                    var subParams = angular.copy(toParams);
                    res.push({name: categories[cate][1][subCate], params: subParams});
                }
            } else {
                res.push({name: 'GENERAL.ALLCATE', params: toParams});
            }
            if (tag) {
                toParams[type].tag = tag;
                res.push({name: tag, params: toParams});
            }
            self.cate[type].crumbs = res;
        }


        this.getCate = getCate;
        this.getCateCrumbs = function (type) {
            return getCate(type, true);
        };

        this.getProduct = function (id) {
            var _id = id || getParams().product.id;
            return $firebaseStorage.get('products/detail/' + _id);
        };
        this.getArticle = function (id) {
            var _id = id || getParams().article.id;
            return $firebaseStorage.get('articles/detail/' + _id);
        };
        this.cateCtr = function (vm, type) {
            var _type = type || 'product',
                cateRefPath = _type + 's/config/categories@selectedSite';

            vm.categories = self.cate[_type].categories;
            vm.tags = self.cate[_type].tags;
            vm.getCate = getCate;

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
            vm.paginator.size = 25;
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
                vm.paginator.page = vm.paginator.page || 1;
            }


            vm.hide = function () {
                $mdDialog.hide();
            };

            vm.cancel = function () {
                $mdDialog.cancel();
            };

            vm.addImage = function () {
                vm.imageUrl = vm.imageUrl || '';
                if (!vm.imageUrl.trim()) return;
                vm[type].images = vm[type].images || [];
                vm[type].images.push(vm.imageUrl);
                vm.imageUrl = ''
            };
            vm.removeImage = function (index) {
                vm[type].images.splice(index, 1);
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
                var id = vm[type].id || vm[type].itemId || (new Date()).getTime();

                var listData = angular.extend({}, vm[type], {description: null, custom: null}),
                    detailData = {
                        compressed: lzString.compress(vm[type]),
                        editTime: firebase.database.ServerValue.TIMESTAMP
                    };
                $firebase.update(type + "s@selectedSite", ['list/' + id, 'detail/' + id], {
                    '@0': listData,
                    '@1': detailData
                }).then(function () {
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
                $firebaseStorage.clearTemp();
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
                    $firebaseStorage.getWithCache(type+'s/detail/' + id + '@selectedSite').then(function (val) {
                        vm[type] = val;
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

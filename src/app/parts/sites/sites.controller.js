(function () {
    'use strict';

    angular
        .module('app.parts.sites')
        .controller('MySitesController', MySitesController)
        .controller('AllSitesController', AllSitesController)
        .controller('SiteConfigureController', SiteConfigureController)
        .controller('PaymentSettingController', PaymentSettingController)
        .controller('TemplateCtrl', TemplateCtrl);

    /* @ngInject */
    function TemplateCtrl($stateParams, $firebase,$mdDialog, $timeout, site, indexService) {
        var vm = this;
        vm.actions = [['applyTemplate', 'SITES.APPLYTEMPLATE'], ['info', 'GENERAL.INFO']];
        if ($stateParams.superAdmin) vm.actions = vm.actions.concat([['edit', 'GENERAL.EDIT'], ['delete', 'GENERAL.DELETE']]);

        $firebase.ref('templates/list').on('value', function (snap) {
            $timeout(function () {
                vm.templatesArray = snap.val();
            }, 0);
        });

        vm.search = function (queryString, cate, subCate, tag) {
            var _cate = cate || null,
                _subCate = subCate || null,
                _tag = tag || null,
                filterMust = [],
                query = {body: {}};
            if (parseInt(_cate) % 1 === 0) {
                filterMust.push({"term": {"category": _cate}});
                if (parseInt(_subCate) % 1 === 0) filterMust.push({"term": {"subcategory": _subCate}});
            }
            if (_tag) {
                var tagTerm = {};
                tagTerm['tags_dot_' + tag] = 1;
                filterMust.push({term: tagTerm});
            }
            query.body.query = {
                "filtered": {
                    "filter": {
                        "bool": {
                            "must": filterMust.length ? filterMust : null
                        }
                    }
                }
            };
            if (angular.isString(queryString) && queryString.trim() !== '') {
                var query_string = {
                    "fields": ["itemName", "description"],
                    "query": vm.queryString,
                    "use_dis_max": true
                };
            }
            if (query.body.query && query.body.query.filtered) {
                query.body.query.filtered.query = {
                    query_string: query_string
                };
            } else {
                query.body.query.query_string = query_string;
            }
            vm.paginator = $elasticSearch.paginator('main', 'templates', query);
            vm.paginator.onReorder('siteName');
        };

        vm.deleteTemplate = function (site) {
            var confirm = $mdDialog.confirm()
                    .title('Delete this template?')
                    // .textContent('Delete the site?')
                    .ariaLabel('Would you like to delete this template?')
                    .ok('Confirm')
                    .cancel('Cancel'),
                siteName = site.siteName;
            $mdDialog.show(confirm).then(function () {
                angular.forEach(['list', 'detail'], function (type) {
                    $firebase.ref('templates/' + type + '/' + siteName).remove()
                });
                indexService.remove('template', siteName, 'main')
            });
        };

        // vm.getMySites = function () {
        //     if (authData) $firebase.ref('users/detail/' + authData.uid + '/sites').once('value', function (snap) {
        //         vm.mysites = snap.val();
        //     })
        // };
        //
        vm.applyTemplate = function (templateName, siteName) {
            var _siteName = siteName||site.siteName,
                confirm = $mdDialog.confirm()
                    .title('Apply '+templateName+' to '+_siteName+'?')
                    .textContent('All content in '+_siteName+' will be replaced by the template?')
                    .ariaLabel('Would you like to apply this '+templateName+' to '+_siteName+'?')
                    .ok('Confirm')
                    .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $firebase.ref('templates/detail/' + templateName).once('value', function (snap) {
                    var val = snap.val();
                    if(val) $firebase.ref('sites/detail/' + _siteName).set(val);
                })
            });
        };

        vm.closeDialog = function(){
            $mdDialog.cancel();
        };

        vm.action = function (action, site, ev) {
            switch (action) {
                case 'edit':
                    break;
                case 'info':
                    break;
                case 'delete':
                    deleteTemplate(site);
                    break;
            }
        };
    }

    /* @ngInject */
    function MySitesController($firebase, $timeout, authData, $state, sitesService, config, FBURL, qtNotificationsService, $mdDialog) {
        var vm = this;
        if (!authData) $state.go('authentication.login');

        vm.newSiteName = '';


        $firebase.ref('users/detail/' + authData.uid + '/sites').on('value', function (snap) {
            $timeout(function () {
                vm.sitesArray = snap.val();
            }, 0);
        });

        vm.showTemplate=function ($event) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                // contentElement: '#template-list',
                templateUrl:'app/parts/sites/template-dialog.html',
                targetEvent: $event,
                fullscreen:true,
                locals:{
                    site:vm.selectedSite
                },
                controller:'TemplateCtrl',
                clickOutsideToClose:true,
                controllerAs:'vm'
            });
        };

        vm.addSite = function () {
            $firebase.ref('sites/list/' + vm.newSiteName + '/createdTime').once('value', function (snap) {
                if (snap.val() === null) {
                    sitesService.addSite(vm.newSiteName, authData.uid);
                } else {
                    alert('This name has been used!');
                    vm.newSiteName = "";
                }
            });
        };

        vm.deleteSite = function (site) {
            var confirm = $mdDialog.confirm()
                .title('Delete the site?')
                // .textContent('Delete the site?')
                .ariaLabel('Would you like to delete the site?')
                .ok('Confirm')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                sitesService.removeSite(site.siteName, authData.uid);
                //
                // vm.sitesArray.$remove(site).then(function () {
                //     $firebase.update('sites', ['detail/' + site.siteName, 'list/' + site.siteName], {
                //         "@all": null
                //     })
                // });
            });

        };

    }

    /* @ngInject */
    function AllSitesController($firebase, authData, $state, config, FBURL, qtNotificationsService, $mdDialog, indexService) {
        var vm = this;
        if (!authData) $state.go('authentication.login');


        vm.actions = [['configure', 'SITES.CONFIGURE'], ['page', 'SITES.SHOWPAGE'], ['widget', 'SITES.SHOWWIDGET'], ['user', 'SITES.SHOWUSER'], ['product', 'SITES.SHOWPRODUCT'], ['order', 'SITES.SHOWORDER'], ['setAsTemplate', 'SITES.SETASTEMPLATE'], ['delete', 'GENERAL.DELETE']];
        vm.action = function (action, site, ev) {
            var params = {siteName: site.siteName};
            switch (action) {
                case 'configure':
                    $state.go('quartz.admin-default.site-configure', params);
                    break;
                case 'page':
                    $state.go('quartz.admin-default.pageManager', params);
                    break;
                case 'widget':
                    $state.go('quartz.admin-default.widgetManager', params);
                    break;
                case 'user':
                    $state.go('quartz.admin-default.siteusers', params);
                    break;
                case 'product':
                    $state.go('quartz.admin-default.productManager', params);
                    break;
                case 'order':
                    $state.go('quartz.admin-default.orderHistory', params);
                    break;
                case 'setAsTemplate':
                    setAsTemplate(site);
                    break;
                case 'delete':
                    vm.deleteSite(site);
                    break;
            }
        };
        vm.paginator = $firebase.paginator('sites/list');
        //initiate
        vm.paginator.onReorder('name');

        vm.onPaginate = function (page, size) { //to prevent this being overwritten
            vm.paginator.get(page, size)
        };
        vm.onReorder = function (orderBy) {
            vm.paginator.onReorder(orderBy);
        };

        function setAsTemplate(site) {
            var confirm = $mdDialog.confirm()
                    .title('Set this site as template?')
                    // .textContent('Delete this site?')
                    .ariaLabel('Would you like to set this site as template?')
                    .ok('Confirm')
                    .cancel('Cancel'),
                siteName = site.siteName;
            $mdDialog.show(confirm).then(function () {
                $firebase.ref('sites/list/' + siteName).once('value', function (listSnap) {
                    var val = listSnap.val();
                    $firebase.ref('templates/list/' + siteName).update(val);
                    indexService.update('template', siteName, val, 'main');
                });
                $firebase.ref('sites/detail/' + siteName).once('value', function (detailSnap) {
                    var val = detailSnap.val();
                    $firebase.ref('templates/detail/' + siteName).update(val);
                });
            });
        }

        vm.deleteSite = function (site) {
            var confirm = $mdDialog.confirm()
                .title('Delete this site?')
                // .textContent('Delete this site?')
                .ariaLabel('Would you like to delete the site?')
                .ok('Confirm')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                $firebase.ref('users/detail/' + site.author + '/sites').orderByChild('siteName').equalTo(site.siteName).once('child_added', function (snap) {
                    snap.ref.set(null);
                });
                $firebase.update('sites', ['detail/' + site.siteName, 'list/' + site.siteName], {
                    "@all": null
                });
            });

        };

    }

    /* @ngInject */
    function SiteConfigureController($firebase, $firebaseStorage, $timeout, $state, $stateParams, config, FBURL, qtNotificationsService, $mdDialog) {
        var vm = this,
            basicPath = 'config/preload@selectedSite',
            siteListRef = $firebase.ref('sites/list'),
            pageListRef = $firebase.ref('pages/list@selectedSite'),
            siteName = $stateParams.siteName;
        $firebaseStorage.getWithCache(basicPath).then(function (val) {
            vm.preload = val || {};
        });

        siteListRef.child(siteName).once('value', function (snap) {
            var val = snap.val();
            vm.thumbnail = val.thumbnail;
            vm.description = val.description;
            vm.type = val.type;
        });

        pageListRef.once('value', function (snap) {
            vm.pages = snap.val();
        });
        vm.updateSiteConfig = function () {
            var listData = {};

            $firebase.updateCacheable(basicPath, vm.preload);
            $firebaseStorage.update(basicPath, vm.preload);


            listData['thumbnail/'] = vm.thumbnail||null;
            $firebase.update('sites/list/' + siteName, listData);
        };
    }

    /* @ngInject */
    function PaymentSettingController($firebase, $firebaseStorage, lzString, sitesService, config, FBURL, qtNotificationsService, $mdDialog) {
        var vm = this;

        function getPaymentConfig(provider) {
            angular.forEach(['public', 'private'], function (pubOrPri) {
                $firebaseStorage.getWithCache('config/payment/' + provider + '/' + pubOrPri + '@selectedSite').then(function (val) {
                    vm[provider] = vm[provider] || {};
                    vm[provider][pubOrPri] = val || {};
                });
            });
        }

        getPaymentConfig('allpay');
        getPaymentConfig('stripe');


        vm.updateAllpay = function () {
            $firebase.updateCacheable('config/payment/allpay@selectedSite', vm.allpay);
            $firebaseStorage.update('config/payment/allpay/public@selectedSite', vm.allpay.public);
            $firebaseStorage.update('config/payment/allpay/private@selectedSite', vm.allpay.private);
        };

        vm.updateStripe = function () {
            $firebase.update('config/payment/stripe@selectedSite', vm.stripe);
            $firebaseStorage.update('config/payment/stripe/public@selectedSite', vm.stripe.public);
            $firebaseStorage.update('config/payment/stripe/private@selectedSite', vm.stripe.private);
        }
    }

})();

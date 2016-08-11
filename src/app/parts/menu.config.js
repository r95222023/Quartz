(function () {
    'use strict';

    angular
        .module('app.parts')
        .config(menuConfig);

    /* @ngInject */
    function menuConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/parts');

        qtMenuProvider.addMenu({
            name: 'MENU.MYSITES',
            icon: 'zmdi zmdi-square-o',
            type: 'link',
            priority: 1.1,
            state: 'quartz.admin-default.mysites'
        });


        qtMenuProvider.addMenu({
            name: 'MENU.SUPERADMIN',
            icon: 'fa fa-star',
            type: 'dropdown',
            priority: 1.2,
            children: [{
                name: 'MENU.ALLSITES',
                // icon: 'zmdi zmdi-square-o',
                type: 'link',
                state: 'quartz.admin-default.allsites'
            },{
                name: 'MENU.ALLUSERS',
                // icon: 'zmdi zmdi-accounts-list',
                type: 'link',
                state: 'quartz.admin-default.allusers'
            },{
                name: 'MENU.TEMPLATES',
                // icon: 'zmdi zmdi-square-o',
                type: 'link',
                state: 'quartz.admin-default.template'
            }]
        });

//// dynamic menu group 由quartz.run控制
        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.SITESETTING',
            icon: 'fa fa-cog',
            type: 'dropdown',
            priority: 1.2,
            children: [
                {
                    name: 'MENU.SETTINGS.BASIC',
                    type: 'link',
                    state: 'quartz.admin-default.site-configure'
                },
                {
                    name: 'MENU.SETTINGS.ADMIN',
                    type: 'link',
                    state: 'quartz.admin-default.admins'
                },
                {
                    name: 'MENU.SETTINGS.PAYMENT',
                    type: 'link',
                    state: 'quartz.admin-default.site-payment'
                }
            ]
        });

        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.SITEDESIGN',
            icon: 'fa fa-paint-brush ',
            type: 'dropdown',
            priority: 1.2,
            children: [
                {
                    name: 'MENU.DESIGN.SETTING',
                    state: 'quartz.admin-default.siteSetting',
                    type: 'link'
                },
                {
                    name: 'MENU.DESIGN.PAGEMANAGER',
                    state: 'quartz.admin-default.pageManager',
                    params: {cate: 'all', subCate: 'all', queryString: ''},
                    type: 'link'
                },
                {
                    name: 'MENU.DESIGN.WIDGETMANAGER',
                    state: 'quartz.admin-default.widgetManager',
                    params: {cate: 'all', subCate: 'all', queryString: ''},
                    type: 'link'
                }
            ]
        });

        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.PRODUCTSANDCATEGORIES',
            icon: 'fa fa-barcode',
            type: 'dropdown',
            priority: 1.2,
            children: [
                {
                    name: 'MENU.PANDC.PRODUCTS',
                    state: 'quartz.admin-default.productManager',
                    type: 'link'
                },
                {
                    name: 'MENU.PANDC.CATEGORIES',
                    state: 'quartz.admin-default.categoryManager',
                    type: 'link'
                }
            ]
        });

        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.ARTICLESANDCATEGORIES',
            icon: 'fa fa-file-text-o ',
            type: 'dropdown',
            priority: 1.2,
            children: [
                {
                    name: 'MENU.PANDC.ARTICLES',
                    state: 'quartz.admin-default.articleManager',
                    type: 'link'
                },
                {
                    name: 'MENU.PANDC.CATEGORIES',
                    state: 'quartz.admin-default.articleCategoryManager',
                    type: 'link'
                }
            ]
        });

        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.DATANAME',
            icon: 'fa fa-database',
            type: 'dropdown',
            priority: 1.2,
            children: [
                {
                    name: 'MENU.DATA.LISTS',
                    state: 'quartz.admin-default.lists',
                    params: {},
                    type: 'link'
                },
                {
                    name: 'MENU.DATA.FILES',
                    state: 'quartz.admin-default-no-scroll.fileManager',
                    params: {},
                    type: 'link'
                },
                {
                    name: 'MENU.DATA.I18N',
                    state: 'quartz.admin-default.i18n',
                    params: {},
                    type: 'link'
                }
            ]
        });

        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.ANALYTICS',
            icon: 'fa fa-bar-chart',
            type: 'link',
            priority: 1.2,
            state: 'quartz.admin-default.analytics'
        });

        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.ORDERHISTORY',
            icon: 'fa fa-archive',
            type: 'link',
            priority: 1.2,
            state: 'quartz.admin-default.orderHistory'
        });

        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.USERS',
            priority: 1.2,
            icon: 'fa fa-users',
            type: 'link',
            state: 'quartz.admin-default.siteusers'
        });

        qtMenuProvider.addMenuToGroup("siteSelected",{
            name: 'MENU.TEMP',
            icon: 'fa fa-star',
            type: 'dropdown',
            priority: 1.2,
            children: [{
                name: 'MENU.ARTICLES.LIST',
                state: 'quartz.admin-default.articleList',
                params: {cate: 'all',subCate:'all',queryString:''},
                type: 'link'
            },{
                name: 'MENU.PRODUCTS.LIST',
                state: 'quartz.admin-default.productList',
                params: {cate: 'all',subCate:'all',queryString:''},
                type: 'link'
            }, {
                name: 'MENU.PRODUCTS.SHOPPINGCART',
                state: 'quartz.admin-default.shoppingCart',
                type: 'link'
            }, {
                name: 'MENU.YOURORDERS',
                state: 'quartz.admin-default.yourOrders',
                type: 'link'
            },{
                name: 'MENU.TEST',
                state: 'quartz.admin-default.test',
                type: 'link'
            }]
        });


    }
})();

(function () {
    'use strict';

    angular
        .module('app.parts')
        .config(menuConfig);

    /* @ngInject */
    function menuConfig($translatePartialLoaderProvider, qtMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/parts');

        qtMenuProvider.addMenu({
            name: 'MENU.MYSITES',
            icon: 'zmdi zmdi-square-o',
            type: 'link',
            priority: 1.1,
            state: 'quartz.admin-default.mysites'
        });


        if(location.href.search('localhost:')!==-1) qtMenuProvider.addMenu({
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
                name: 'MENU.TEMPLATES',
                // icon: 'zmdi zmdi-square-o',
                type: 'link',
                state: 'quartz.admin-default.template'
            }]
        });

//// dynamic menu group 由quartz.run控制
        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.OVERVIEW',
            icon: 'fa fa-rocket',
            type: 'link',
            priority: 1.1,
            state: 'quartz.admin-default.overview'
        });

        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.SITESETTING',
            icon: 'fa fa-cog',
            type: 'dropdown',
            priority: 1.2,
            children: [
                {
                    name: 'MENU.SETTINGS.BASIC',
                    type: 'link',
                    state: 'quartz.admin-default.site-setting.basic'
                },
                {
                    name: 'MENU.SETTINGS.ANALYTICS',
                    type: 'link',
                    state: 'quartz.admin-default.site-setting.analytics'
                },
                {
                    name: 'MENU.SETTINGS.ADVANCE',
                    type: 'link',
                    state: 'quartz.admin-default.site-setting.advance'
                },
                {
                    name: 'MENU.SETTINGS.PAYMENT',
                    type: 'link',
                    state: 'quartz.admin-default.site-setting.payment'
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
                    name: 'MENU.CONTENTS.PRODUCTS',
                    state: 'quartz.admin-default.products.manager',
                    type: 'link'
                },
                {
                    name: 'MENU.CONTENTS.CATEGORIES',
                    state: 'quartz.admin-default.products.category',
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
                    name: 'MENU.CONTENTS.ARTICLES',
                    state: 'quartz.admin-default.articles.manager',
                    type: 'link'
                },
                {
                    name: 'MENU.CONTENTS.CATEGORIES',
                    state: 'quartz.admin-default.articles.category',
                    type: 'link'
                }
            ]
        });

        qtMenuProvider.addMenuToGroup("siteSelected", {
            name: 'MENU.FILES',
            icon: 'fa fa-folder-open',
            type: 'link',
            priority: 1.2,
            state: 'quartz.admin-default-no-scroll.fileManager'
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
            name: 'MENU.USERS.NAME',
            priority: 1.2,
            icon: 'fa fa-users',
            type:'dropdown',
            children: [
                {
                    name: 'MENU.USERS.LIST',
                    state: 'quartz.admin-default.users.list',
                    type: 'link'
                },
                {
                    name: 'MENU.USERS.CLASSES',
                    state: 'quartz.admin-default.users.classes',
                    type: 'link'
                }
            ]
        });
    }
})();

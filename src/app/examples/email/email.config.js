(function() {
    'use strict';

    angular
        .module('app.examples.email')
        .config(moduleConfig)
        .constant('EMAIL_ROUTES', [{
            state: 'quartz-no-scroll.email.inbox',
            name: 'MENU.EMAIL.INBOX',
            url: '/email/inbox',
            icon: 'zmdi zmdi-inbox'
        },{
            state: 'quartz-no-scroll.email.trash',
            name: 'MENU.EMAIL.TRASH',
            url: '/email/trash',
            icon: 'zmdi zmdi-minus-circle'
        },{
            state: 'quartz-no-scroll.email.sent',
            name: 'MENU.EMAIL.SENT',
            url: '/email/sent',
            icon: 'zmdi zmdi-email'
        }]);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, qtMenuProvider, EMAIL_ROUTES) {
        $translatePartialLoaderProvider.addPart('app/examples/email');

        $stateProvider
        .state('quartz-no-scroll.email', {
            abstract: true,
            views: {
                sidebarLeft: {
                    templateUrl: 'app/quartz/components/menu/menu.tmpl.html',
                    controller: 'MenuController',
                    controllerAs: 'vm'
                },
                sidebarRight: {
                    templateUrl: 'app/quartz/components/notifications-panel/notifications-panel.tmpl.html',
                    controller: 'NotificationsPanelController',
                    controllerAs: 'vm'
                },
                toolbar: {
                    templateUrl: 'app/examples/email/toolbar.tmpl.html',
                    controller: 'EmailToolbarController',
                    controllerAs: 'vm'
                },
                content: {
                    template: '<div flex ui-view layout="column" class="overflow-hidden"></div>'
                }
            }
        });

        angular.forEach(EMAIL_ROUTES, function(route) {
            $stateProvider
            .state(route.state, {
                url: route.url,
                templateUrl: 'app/examples/email/inbox.tmpl.html',
                controller: 'InboxController',
                controllerAs: 'vm',
                resolve: {
                    emails: function($http, API_CONFIG) {
                        return $http({
                            method: 'GET',
                            url: API_CONFIG.url + 'email/inbox'
                        });
                    },
                    contacts: function($http, API_CONFIG) {
                        return $http({
                            method: 'GET',
                            url: API_CONFIG.url + 'email/contacts'
                        });
                    }
                }
            });
        });

        angular.forEach(EMAIL_ROUTES, function(route) {
            $stateProvider
            .state(route.state + '.email', {
                url: '/mail/:emailID',
                templateUrl: 'app/examples/email/email.tmpl.html',
                controller: 'EmailController',
                controllerAs: 'vm',
                resolve: {
                    email: function($stateParams, emails) {
                        emails = emails.data;
                        var foundEmail = false;
                        for(var i = 0; i < emails.length; i++) {
                            if(emails[i].id === $stateParams.emailID) {
                                foundEmail = emails[i];
                                break;
                            }
                        }
                        return foundEmail;
                    }
                },
                onEnter: function($state, email){
                    if (false === email) {
                        $state.go(route.state);
                    }
                }
            });
        });

        var emailMenu = {
            name: 'MENU.EMAIL.EMAIL',
            icon: 'zmdi zmdi-email',
            type: 'dropdown',
            priority: 1.3,
            children: []
        };

        angular.forEach(EMAIL_ROUTES, function(route) {
            emailMenu.children.push({
                name: route.name,
                state: route.state,
                type: 'link',
                badge: Math.round(Math.random() * (20 - 1) + 1)
            });
        });

        qtMenuProvider.addMenu(emailMenu);
    }
})();

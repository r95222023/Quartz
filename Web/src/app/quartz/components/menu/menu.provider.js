(function() {
    'use strict';

    angular
        .module('quartz.components')
        .provider('qtMenu', menuProvider);


    /* @ngInject */
    function menuProvider() {
        // Provider
        var menu = [];

        this.addMenu = addMenu;
        this.removeMenu = removeMenu;

        function addMenu(item) {
            //add a divider before the item if the priority of the item is 2.1, 3.1, 4.1...
            if(item.priority>2&&(item.priority-Math.floor(item.priority))<0.11) menu.push({
                type:'divider',
                priority: Math.floor(item.priority)+0.1
            });

            menu.push(item);
        }

        function removeMenu(state, params) {
            findAndDestroyMenu(menu, state, params);
        }

        function findAndDestroyMenu(menu, state, params) {
            if (menu instanceof Array) {
                for (var i = 0; i < menu.length; i++) {
                    if(menu[i].state === state && menu[i].params === params) {
                        menu.splice(i, 1);
                    }
                    else if(angular.isDefined(menu[i].children)) {
                        findAndDestroyMenu(menu[i].children, state, params);
                    }
                }
            }
        }

        // Service
        this.$get = function() {
            return {
                menu: menu,
                addMenu: addMenu,
                removeMenu: removeMenu
            };
        };
    }
})();


(function() {
    'use strict';

    angular
        .module('quartz.components')
        .controller('MenuController', MenuController);

    /* @ngInject */
    function MenuController(qtSettings, qtLayout) {
        var vm = this;
        vm.layout = qtLayout.layout;
        vm.sidebarInfo = {
            appName: qtSettings.name,
            appLogo: qtSettings.logo
        };
        vm.toggleIconMenu = toggleIconMenu;

        ////////////
        function toggleIconMenu() {
            var menu = vm.layout.sideMenuSize === 'icon' ? 'full' : 'icon';
            qtLayout.setOption('sideMenuSize', menu);
        }
    }
})();

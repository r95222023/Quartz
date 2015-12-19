(function() {
    'use strict';

    angular
        .module('app.examples.ui')
        .controller('ColorDialogController', ColorDialogController);

    /* @ngInject */
    function ColorDialogController($scope, name, palette, qtTheming) {
        var vm = this;
        vm.itemStyle = itemStyle;
        vm.name = name;
        vm.palette = [];

        ///////////

        function itemStyle(palette) {
            return {
                'background-color': qtTheming.rgba(palette.value),
                'color': qtTheming.rgba(palette.contrast)
            };
        }

        // init

        for(var code in palette) {
            vm.palette.push({
                code: code,
                palette: palette[code]
            });
        }
    }
})();
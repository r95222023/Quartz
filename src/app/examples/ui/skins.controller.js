(function() {
    'use strict';

    angular
        .module('app.examples.ui')
        .controller('SkinsUIController', SkinsUIController);

    /* @ngInject */
    function SkinsUIController($cookies, $window, qtSkins, qtTheming) {
        var vm = this;
        vm.elementColors = {
            logo: '',
            sidebar: '',
            content: '',
            toolbar: ''
        };
        vm.skins = qtSkins.getSkins();
        vm.selectedSkin = qtSkins.getCurrent();
        vm.trySkin = trySkin;
        vm.updatePreview = updatePreview;

        //////////////////////

        function trySkin() {
            if(vm.selectedSkin !== qtSkins.getCurrent()) {
                $cookies.put('quartz-skin',angular.toJson({
                    skin: vm.selectedSkin.id
                }));
                $window.location.reload();
            }
        }


        function updatePreview() {
            for(var element in vm.elementColors) {
                var theme = qtTheming.getTheme(vm.selectedSkin.elements[element]);
                var hue = angular.isUndefined(theme.colors.primary.hues.default) ? '500' : theme.colors.primary.hues.default;
                var color = qtTheming.getPaletteColor(theme.colors.primary.name, hue);
                vm.elementColors[element] = qtTheming.rgba(color.value);
            }
        }

        // init

        updatePreview();
    }
})();
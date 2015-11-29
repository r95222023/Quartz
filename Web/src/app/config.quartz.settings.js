(function() {
    'use strict';

    angular
        .module('app')
        .config(translateConfig);

    /* @ngInject */
    function translateConfig(qtSettingsProvider, APP_LANGUAGES) {
        var now = new Date();
        // set app name & logo (used in loader, sidemenu, footer, login pages, etc)
        qtSettingsProvider.setName('quartz');
        qtSettingsProvider.setCopyright('&copy;' + now.getFullYear() + ' BYH');
        qtSettingsProvider.setLogo('assets/images/logo.png');
        // set current version of app (shown in footer)
        qtSettingsProvider.setVersion('2.0.1');

        // setup available languages in quartz
        for (var lang = APP_LANGUAGES.length - 1; lang >= 0; lang--) {
            qtSettingsProvider.addLanguage({
                name: APP_LANGUAGES[lang].name,
                key: APP_LANGUAGES[lang].key
            });
        }
    }
})();

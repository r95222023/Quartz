(function() {
    'use strict';

    angular
        .module('app.parts', [
            'app.parts.overview',
            'app.parts.auth',
            'app.parts.contents',
            'app.parts.plans',
            'app.parts.design',
            'app.parts.sites',
            'app.parts.users',
            'app.parts.files',
            'app.parts.analytics',
            'app.parts.app'
        ]);
})();

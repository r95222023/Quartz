(function() {
    'use strict';

    angular
        .module('app.examples.test', [
            'app.plugins.crypto',
            'app.plugins.stripe',
            'app.plugins.allpay'
        ]);
})();

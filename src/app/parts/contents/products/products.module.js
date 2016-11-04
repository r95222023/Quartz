(function() {
    'use strict';

    angular
        .module('app.parts.contents.products', [
            'app.plugins.ngcart',
            'app.plugins.stripe',
            'app.plugins.allpay'
        ]);
})();

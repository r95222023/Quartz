(function() {
    'use strict';

    angular
        .module('app')
        .config(idleConfig);

    /* @ngInject */
    function idleConfig (IdleProvider, KeepaliveProvider) {
        // configure Idle settings
        IdleProvider.idle(60); // in seconds
        IdleProvider.timeout(10*24*60*60); // in seconds
        //KeepaliveProvider.interval(2); // in seconds
    }
})();

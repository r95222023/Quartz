(function() {
    'use strict';

    angular
        .module('app')
        .config(/* @ngInject */ function($disqusProvider, $locationProvider){
            $disqusProvider.setShortname('quartzseed');
            $locationProvider.hashPrefix('!');
        })
})();

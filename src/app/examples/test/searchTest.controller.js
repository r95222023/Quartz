(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('SearchTestController', SearchTestController);

    /* @ngInject */
    function SearchTestController($elasticSearch, $timeout, $firebase, $rootScope, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        $elasticSearch.query('quartz', 'order', {
            cache:'query/cache', //cache's reference url
            body:{
                "query" : {
                    "match" : {
                        "ChoosePayment" : "ALL"
                    }
                }
            }
        }).then(function (res) {
            console.log(res)
        })
    }
})();

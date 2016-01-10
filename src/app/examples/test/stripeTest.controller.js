(function () {
    'use strict';

    angular
        .module('app.examples.test')
        .controller('StripeTestController', StripeTestController);

    /* @ngInject */
    function StripeTestController($timeout, $firebase, $rootScope, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
        vm.data = {
            payment:{
                stripe:{
                    key:'pk_test_6pRNASCoBOKtIshFeQd4XMUh',
                    name: 'Quartz',
                    description: 'Stripe checkout test',
                    amount: 2000,
                    image:'http://lorempixel.com/128/128/'
                }
            }
        };
        var now = new Date();
        $firebase.request({
            request: [{
                refUrl: 'query/' + now.getTime(),
                value: {
                    index: 'quartz',
                    body: {
                        query: {
                            match: {
                                ChoosePayment: 'All'
                            }
                        }
                    }
                }
            }],
            response: {
                response: 'query/' + now.getTime()+'/response'
            }
        }).then(function (res) {
            console.log(res);
        })
    }
})();

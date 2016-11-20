(function() {
    'use strict';

    angular
        .module('quartz.components')
        .service('plansService', PlansService);

    /* @ngInject */
    function PlansService($mdMedia,$firebase) {
        function getCheckMacValue() {
            return new Promise(function(resolve, reject){
                var id = firebase.database().ref().push().key;

                $firebase.request(
                    {
                        paths: ['queue-task?id=' + id],
                        data: buildRequest(vm.order)
                    },
                    ['queue-task?id=' + id + '/payment/allpay/CheckMacValue'])
                    .then(function (res) {
                        scope.data.payment.allpay['CheckMacValue'] = res[0];
                        scope.data['_id'] = id;

                        console.log('order mac: ' + res[0]);
                        resolve(scope.data);
                    }, function (error) {
                        reject(error);
                        console.log(error);
                    });
            });
        }

        function buildRequest(data) {
            var req = {payment: {allpay: {}}};
            angular.extend(req, data);

            if ($mdMedia('xs')) {
                req.payment.allpay.DeviceSource = 'M'
            } else {
                req.payment.allpay.DeviceSource = 'P'
            }
            req.id = data.id || data.payment.allpay.MerchantTradeNo;
            req.siteName = sitesService.siteName;
            req.payment.type = 'allpay';
            req['_state'] = 'order_validate';
            return snippets.rectifyUpdateData(req);
        }
    }
})();

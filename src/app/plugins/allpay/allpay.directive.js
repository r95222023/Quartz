(function () {
    'use strict';

    angular
        .module('app.plugins.allpay')
        .directive('allpayCheckout', allpayCheckout);

    ////

    /* @ngInject */
    function allpayCheckout($mdMedia, $firebase, $sce, $timeout, $q, snippets, $mdDialog, sitesService) {
        return {
            restrict: 'E',
            scope: {
                buildData:'=',
                direct: '@'
            },
            transclude: true,
            templateUrl: function (element, attrs) {
                if (typeof attrs.templateUrl == 'undefined') {
                    return 'app/plugins/allpay/allpayCheckout.tmpl.html';
                } else {
                    return attrs.templateUrl;
                }
            },
            link: function (scope, element, attrs) {
                scope.getCheckMacValue = getCheckMacValue;
                scope.showDialog = function($event){
                    var data = scope.buildData();
                    if(angular.isFunction(data.then)){
                        data.then(function (_data) {
                            scope.data = _data;
                            showDialog($event);
                        });
                    } else {
                        scope.data = data;
                        showDialog($event);
                    }
                };



                var allpayFormAction = attrs.stage !== '' ? 'https://payment.allpay.com.tw/Cashier/AioCheckOut' : 'https://payment-stage.allpay.com.tw/Cashier/AioCheckOut';
                scope.allpayFormAction = $sce.trustAsResourceUrl(allpayFormAction);


                // scope.allpaySubmit = submit;
                // function submit() {
                //     getCheckMacValue().then(function () {
                //         $timeout(function () {
                //             var e = document.getElementsByName('allpay-checkout');
                //             e[0].submit();
                //         }, 0, false);
                //     }, function (error) {
                //         console.log(error);
                //     });
                // }

                function getCheckMacValue() {
                    var def = $q.defer();
                    $firebase.request({
                        request: [{
                            refUrl: 'queue/tasks/$qid@serverFb',
                            value: buildRequest(scope.data)
                        }],
                        response: {
                            "checkMacValue": 'queue/tasks/$qid/payment/allpay/CheckMacValue'
                        }
                    }).then(function (res) {
                        scope.data.payment.allpay['CheckMacValue'] = res.checkMacValue;
                        scope.data['_id'] = res.params['$qid'];

                        console.log('order mac: ' + res.checkMacValue);
                        def.resolve(scope.data);
                    }, function (error) {
                        def.reject(error);
                        console.log(error);
                    });
                    return def.promise
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

                function showDialog($event) {
                    var parentEl = angular.element(document.body);
                    getCheckMacValue().then(function () {
                        $mdDialog.show({
                            parent: parentEl,
                            targetEvent: $event,
                            template: '<md-dialog aria-label="List dialog">' +
                            '  <md-dialog-content>' +
                            '<form name="allpay-checkout" ng-submit="submit()" target="_blank" method="post" action="{{allpayFormAction}}">' +
                            '<input ng-repeat="(name, value) in data.payment.allpay" name="{{name}}" value="{{value}}">' +
                            '</form>' +
                            '  </md-dialog-content>' +
                            '  <md-dialog-actions>' +
                            '    <input class="md-button md-raised" ng-click="submit()" type="submit" value="Submit">' +
                            '    <md-button ng-click="closeDialog()" class="md-primary">' +
                            '      Cancel' +
                            '    </md-button>' +
                            '  </md-dialog-actions>' +
                            '</md-dialog>',
                            locals: {
                                data: scope.data
                            },
                            controller: DialogController
                        });
                    });

                    /* @ngInject */
                    function DialogController($scope, $mdDialog, data, ngCart) {

                        $scope.data = data;
                        $scope.allpayFormAction = $sce.trustAsResourceUrl(allpayFormAction);

                        $scope.submit = function () {
                            $scope.closeDialog();
                            var e = document.getElementsByName('allpay-checkout');
                            e[0].submit();
                            //clear cart
                            ngCart.empty();
                        };
                        $scope.closeDialog = function () {
                            // remove data
                            $firebase.ref('queue/tasks/' + data['_id'] + '@serverFb').child('status').set('canceled');
                            $mdDialog.hide();
                        }
                    }
                }
            }

        };

    }

})();

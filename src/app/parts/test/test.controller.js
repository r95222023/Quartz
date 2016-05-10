(function () {
    'use strict';

    angular
        .module('app.parts.test')
        .controller('TestPageController', TestPageController);

    /* @ngInject */
    function TestPageController($firebase, snippets, syncTime, analysisService, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this,
            to2dig = snippets.to2dig;

        vm.newOrder = function (daybefore) {

            syncTime.onReady().then(function (getTime) {
                var _date = new Date(getTime() - daybefore * 24 * 60 * 60 * 1000),
                    year = to2dig(_date.getFullYear() - 2000),
                    month = to2dig(_date.getMonth() + 1),
                    date = to2dig(_date.getDate()),
                    key = parseInt(year + '' + month + '' + date).toString(36);


                $firebase.ref('orders/analysis/' + key + '/count@selectedSite').transaction(function (val) {
                    console.log(val);

                    return val ? val + 1 : 1;
                });

                $firebase.ref('orders/analysis/' + key + '/count2@selectedSite').transaction(function (val) {
                    console.log(val);

                    return val ? val + 2 : 2;
                });
            });
        };


        vm.productSimulation = function (daybefore) {

            syncTime.onReady().then(function (getTime) {
                var _date = new Date(getTime() - daybefore * 24 * 60 * 60 * 1000),
                    year = to2dig(_date.getFullYear() - 2000),
                    month = to2dig(_date.getMonth() + 1),
                    date = to2dig(_date.getDate()),
                    key = parseInt(year + '' + month + '' + date).toString(36);


                $firebase.ref('products/analysis/' + key + '/product1@selectedSite').transaction(function (val) {
                    var _val = {};
                    if (val === null) {
                        _val = {count1: 1, count2: 2}
                    } else {
                        _val.count1 = val.count1 + 1;
                        _val.count2 = val.count2 + 1;
                    }

                    return _val;
                });

                $firebase.ref('products/analysis/' + key + '/product2@selectedSite').transaction(function (val) {
                    var _val = {};
                    if (val === null) {
                        _val = {count1: 2, count2: 1}
                    } else {
                        _val.count1 = val.count1 + 1;
                        _val.count2 = val.count2 + 1;
                    }

                    return _val;
                });
            });
        };
        //
        // for (var i = 1; i < 8; i++) {
        //     vm.newOrder(i);
        //     vm.productSimulation(i);
        // }


        analysisService.getDataInDays('analysis','orders/analysis@selectedSite', 5).then(function (analysis) {
            console.log(analysis.getChartData());
            
        });

        analysisService.getDataInDays('topN','products/analysis@selectedSite', 5).then(function (analysis) {
            console.log(analysis.getRankedArr('count1'));
            console.log(analysis.getRankedArr('count2'));
        });
    }
})();

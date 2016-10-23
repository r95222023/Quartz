(function () {
    'use strict';

    angular
        .module('app.parts.analytics')
        .controller('AnalyticsController', AnalyticsController);

    /* @ngInject */
    function AnalyticsController($firebase,$scope, analysisService, qtNotificationsService, $state, $mdDialog, config) {
        var vm = this;
        vm.orderData={};

        analysisService.getDataInDays('orders?type=analysis', 5).then(function (analysis) {
            console.log(analysis.getChartData());
            var orderData=analysis.getChartData();
            vm.orderData={
                labels:orderData.labels,
                results:[orderData.count, orderData.count2],
                series:['count', 'count1']
            };
        });
        analysisService.getDataInDays('products?type=analysis', 5).then(function (analysis) {
            console.log(analysis.getRankedArr('count1'));
            console.log(analysis.getRankedArr('count2'));

            vm.topProducts1=analysis.getRankedArr('count1');
            vm.topProducts2=analysis.getRankedArr('count2');

        });
        vm.barChart = {
            type: 'Bar',
            data: [
                ['Month', 'Sales', 'Expenses', 'Profit'],
                ['JAN.', 1000, 400, 200],
                ['FEB.', 1170, 460, 250],
                ['MAR.', 660, 1120, 300],
                ['APR.', 1030, 540, 350]
            ],
            options: {
                chart: {
                    title: 'Company Performance',
                    subtitle: 'Sales, Expenses, and Profit: January-April'
                },
                bars: 'vertical',
                // width: 800,
                height: 600
            }
        };

        vm.options={
            lineTension:0
        };


        vm.labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        vm.salesSeries = ['Sales'/*, 'Series B'*/];
        vm.incomeSeries = ['Sales'/*, 'Series B'*/];

        vm.orderSeries=['Daily Orders'];
        vm.datasetOverride=[{lineTension: 0}];
        /////////

        function randomData(dataName, serieName, lableName, order) {
            vm[dataName] = [];
            for (var series = 0; series < vm[serieName].length; series++) {
                var row = [];
                for (var label = 0; label < vm[lableName].length; label++) {
                    row.push(Math.floor((Math.random() * (order||100)) + 1));
                }
                vm[dataName].push(row);
            }
        }

        // init

        randomData('salesData','salesSeries','labels', 100);
        randomData('incomeData','incomeSeries','labels', 10000);


        vm.topSales=[
            {itemId: 'P100001', name: 'Apple', count:43},
            {itemId: 'P100003', name: 'Orange', count:31},
            {itemId: 'P100002', name: 'Pearl', count:25},
            {itemId: 'P100004', name: 'Guava', count:20},
            {itemId: 'P100005', name: 'Banana', count:11}
        ];
        vm.topIncome=[
            {itemId: 'P100003', name: 'Orange', count:5400},
            {itemId: 'P100004', name: 'Guava', count:3850},
            {itemId: 'P100002', name: 'Pearl', count:3230},
            {itemId: 'P100001', name: 'Apple', count:3210},
            {itemId: 'P100005', name: 'Banana', count:1880}
        ];
        console.log(vm.data)
        console.log(vm.labels)

    }
})();

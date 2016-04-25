(function () {
    'use strict';

    angular
        .module('app.parts.analytics')
        .controller('AnalyticsController', AnalyticsController);

    /* @ngInject */
    function AnalyticsController($firebase, qtNotificationsService, Auth, $state, $mdDialog, config) {
        var vm = this;
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

        vm.labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
        vm.series = ['Series A', 'Series B'];

        /////////

        function randomData() {
            vm.data = [];
            for(var series = 0; series < vm.series.length; series++) {
                var row = [];
                for(var label = 0; label < vm.labels.length; label++) {
                    row.push(Math.floor((Math.random() * 100) + 1));
                }
                vm.data.push(row);
            }
        }

        // init

        randomData();
        console.log(vm.data)
        console.log(vm.labels)

    }
})();

(function () {
    'use strict';

    angular
        .module('app.parts.overview')
        .controller('OverviewCtrl', OverviewCtrl);

    /* @ngInject */
    function OverviewCtrl() {
        var vm=this;
        vm.cards=[
            {title:'Analytics', desc:'取得詳細的分析資料，以評估及分析使用者與您的應用程式互動的情況',img:'http://lorempixel.com/296/128/technics/1/'},
            {title:'Articles', desc:'取得詳細的分析資料，以評估及分析使用者與您的應用程式互動的情況',img:'http://lorempixel.com/296/128/technics/2/'},
            {title:'Pages', desc:'取得詳細的分析資料，以評估及分析使用者與您的應用程式互動的情況',img:'http://lorempixel.com/296/128/technics/3/'},
            {title:'Payments', desc:'取得詳細的分析資料，以評估及分析使用者與您的應用程式互動的情況',img:'http://lorempixel.com/296/128/technics/4/'},
            {title:'Products', desc:'取得詳細的分析資料，以評估及分析使用者與您的應用程式互動的情況',img:'http://lorempixel.com/296/128/technics/5/'},
            {title:'Orders', desc:'取得詳細的分析資料，以評估及分析使用者與您的應用程式互動的情況',img:'http://lorempixel.com/296/128/technics/6/'},
            {title:'Users', desc:'取得詳細的分析資料，以評估及分析使用者與您的應用程式互動的情況',img:'http://lorempixel.com/296/128/technics/7/'},
            {title:'Files', desc:'取得詳細的分析資料，以評估及分析使用者與您的應用程式互動的情況',img:'http://lorempixel.com/296/128/technics/8/'}
        ]
    }
})();

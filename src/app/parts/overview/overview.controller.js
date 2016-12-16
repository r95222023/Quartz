(function () {
    'use strict';

    angular
        .module('app.parts.overview')
        .controller('OverviewCtrl', OverviewCtrl);

    /* @ngInject */
    function OverviewCtrl() {
        var vm=this;
        vm.cards=[
            {title:'Apps', desc:'創造您個人獨一無二的網站或應用程式',img:'http://lorempixel.com/296/128/technics/1/'},
            {title:'Articles', desc:'撰寫並管理您的文章，隨時更新您網站或應用的內容',img:'http://lorempixel.com/296/128/technics/2/'},
            {title:'Pages', desc:'客製化的頁面，使應用程式更加豐富多變',img:'http://lorempixel.com/296/128/technics/3/'},
            //{title:'Payments', desc:'取得詳細的分析資料，以評估及分析使用者與您的應用程式互動的情況',img:'http://lorempixel.com/296/128/technics/4/'},
            {title:'Products', desc:'輕鬆管理您的的貨品，',img:'http://lorempixel.com/296/128/technics/5/'},
            {title:'Orders', desc:'管理訂單並取得詳細的分析資料，以評估及分析商品的銷售情況',img:'http://lorempixel.com/296/128/technics/6/'},
            {title:'Users', desc:'查看並設定使用者的權限',img:'http://lorempixel.com/296/128/technics/7/'},
            {title:'Files', desc:'利用檔案管理員管理網站使用的資源',img:'http://lorempixel.com/296/128/technics/8/'}
        ]
    }
})();

(function(jQuery) {
    'use strict';

    angular
        .module('app.examples.ui')
        .run(moduleRun);

    /* @ngInject */
    function moduleRun(TypographySwitcherService,$http) {
        // load up the webfont loader to allow loading google fonts in the demo
        $http({
            url: '//ajax.googleapis.com/ajax/libs/webfont/1.5.10/webfont.js',
            type: "GET"
        }).then(function(res) {
            var loadWebFont=new Function(res.data);
            loadWebFont();
            // initialise typography switcher (make sure correct font is loaded if one has been selected)
            TypographySwitcherService.init();
        });

        //jQuery.ajax({
        //    url: '//ajax.googleapis.com/ajax/libs/webfont/1.5.10/webfont.js',
        //    dataType: 'script',
        //    async: true,
        //    success: function() {
        //        // initialise typography switcher (make sure correct font is loaded if one has been selected)
        //        TypographySwitcherService.init();
        //    }
        //});
    }
})(jQuery);
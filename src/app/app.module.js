(function() {
    'use strict';
    angular
        .module('app', [
            'quartz',
            'ngAnimate', 'ngCookies', 'ngSanitize', 'ngMessages', 'ngMaterial',
            'ui.router', 'pascalprecht.translate', 'LocalStorageModule', 'angularMoment', 'textAngular', 'md.data.table', angularDragula(angular),'ngFileUpload',
            //'seed-module',
            // uncomment above to activate the example seed module
            // 'app.examples',
            'app.parts'
        ]);


    angular.element(document).ready(function() {
        var fbconfig = {
                apiKey: "AIzaSyAfxA30u_wPOkVCn727MJXZ4eFhg4raKdI",
                authDomain: "quartz.firebaseapp.com",
                databaseURL: "https://quartz.firebaseio.com",
                storageBucket: "project-3415547818359859659.appspot.com"
            },
            mainApp = firebase.initializeApp(fbconfig),
            mainDatabase = firebase.database(),
            mainRef = mainDatabase.ref();


        // your Firebase data URL goes here, no trailing slash
        console.log(window.location);
        angular.forEach(window.config,function(config){
            config.apply(null);
        });
        mainRef.child('config').once('value', function (snap) {
            angular.module('app')
                .constant('APP_LANGUAGES', [{
                    name: 'LANGUAGES.CHINESE',
                    key: 'zh'
                },{
                    name: 'LANGUAGES.ENGLISH',
                    key: 'en'
                },{
                    name: 'LANGUAGES.FRENCH',
                    key: 'fr'
                },{
                    name: 'LANGUAGES.PORTUGUESE',
                    key: 'pt'
                }])
                // set a constant for the API we are connecting to
                .constant('API_CONFIG', {
                    'url':  'http://triangular-api.oxygenna.com/'
                })

                .constant('FBURL', mainRef.toString())
                .constant('config', angular.extend({
                    debug: true,
                    shipping: 0,
                    taxRate: 0,
                    serverFb: 'quartz', /*https://quartz.firebaseio.com*/
                    home:'quartz.admin-default.home',
                    defaultUrl:'/home',
                    // where to redirect users if they need to authenticate
                    loginRedirectState:'authentication.login'
                },snap.val()));
            var fbUtil=new _core.FirebaseUtil();

            angular.bootstrap(document, ['app']);
        });
    });
})();

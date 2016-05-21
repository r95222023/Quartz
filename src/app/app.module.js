(function () {
    'use strict';
    angular
        .module('app', [
            'quartz',
            'ngAnimate', 'ngCookies', 'ngSanitize', 'ngMessages', 'ngMaterial',
            'ui.router', 'pascalprecht.translate', 'LocalStorageModule', 'googlechart', 'chart.js', 'linkify', 'ui.calendar', 'angularMoment', 'textAngular', 'uiGmapgoogle-maps', 'hljs', 'md.data.table', angularDragula(angular), 'ngFileUpload',
            //'seed-module',
            // uncomment above to activate the example seed module
            'app.examples',
            'app.parts'
        ]);
    angular.element(document).ready(function () {
        // your Firebase data URL goes here, no trailing slash

        var fbconfig = {
                apiKey: "AIzaSyAfxA30u_wPOkVCn727MJXZ4eFhg4raKdI",
                authDomain: "quartz.firebaseapp.com",
                databaseURL: "https://quartz.firebaseio.com",
                storageBucket: "project-3415547818359859659.appspot.com"
            },
            mainApp = firebase.initializeApp(fbconfig),
            mainDatabase = firebase.database(),
            mainRef = mainDatabase.ref();


        // console.log(window.location);
        mainRef.child('config').once('value', function (snap) {
            angular.module('app')
                .constant('APP_LANGUAGES', [{
                    name: 'LANGUAGES.CHINESE',
                    key: 'zh'
                }, {
                    name: 'LANGUAGES.ENGLISH',
                    key: 'en'
                }, {
                    name: 'LANGUAGES.FRENCH',
                    key: 'fr'
                }, {
                    name: 'LANGUAGES.PORTUGUESE',
                    key: 'pt'
                }])
                // set a constant for the API we are connecting to
                .constant('API_CONFIG', {
                    'url': 'http://triangular-api.oxygenna.com/'
                })
                .constant('mainFirebase', {
                    app:mainApp,
                    databaseURL: fbconfig.databaseURL,
                    database: mainDatabase,
                    ref: mainRef
                })
                .constant('config', angular.extend({
                    debug: true,
                    shipping: 0,
                    taxRate: 0,
                    serverFb: 'quartz', /*https://quartz.firebaseio.com*/
                    home: 'quartz.admin-default.home',
                    defaultUrl: '/home',
                    // where to redirect users if they need to authenticate
                    loginRedirectState: 'authentication.login'
                }, snap.val()));

            angular.bootstrap(document, ['app']);
        });
    });
})();

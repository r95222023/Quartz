/**
 * Created by 博彥 on 2016/10/14.
 */
angular.module('app', ['angulartics', 'angulartics.google.analytics'])
    .config(function ($analyticsProvider) {
        $analyticsProvider.firstPageview(true); /* Records pages that don't use $state or $route */
        $analyticsProvider.withAutoBase(true);  /* Records full path */
    });

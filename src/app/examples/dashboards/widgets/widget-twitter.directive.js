(function() {
    'use strict';

    angular
        .module('app.examples.dashboards')
        .directive('twitterWidget', twitterWidget);

    /* @ngInject */
    function twitterWidget() {
        // Usage:
        //
        // Creates:
        //
        var directive = {
            require: 'qtWidget',
            link: link,
            restrict: 'A'
        };
        return directive;

        function link($scope) {
            $scope.tweets = [{
                user: 'BOSS',
                body: 'Phasellus sed felis viverra, placerat odio ac, scelerisque leo. Duis non mauris vitae dolor semper commodo sed vel sem. Nam eu lacinia purus.'
            },{
                user: 'BOSS',
                body: 'Sed ultrices leo a nulla gravida placerat. Morbi eu sem odio. Vivamus id nunc sapien. Fusce ut metus facilisis, tristique neque ut, lacinia dui.'
            },{
                user: 'BOSS',
                body: 'Quisque hendrerit velit nec magna pulvinar consectetur. Mauris molestie ut leo mollis suscipit. In imperdiet.'
            }];

            $scope.selectedTab = 0;

            $scope.prevTweet = function() {
                $scope.selectedTab--;
                if($scope.selectedTab < 0) {
                    $scope.selectedTab = $scope.tweets.length - 1;
                }
            };

            $scope.nextTweet = function() {
                $scope.selectedTab++;
                if($scope.selectedTab === $scope.tweets.length) {
                    $scope.selectedTab = 0;
                }
            };
        }
    }
})();

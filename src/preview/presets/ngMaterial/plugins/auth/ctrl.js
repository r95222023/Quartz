(function () {
    'use strict';
    var m;
    try{
        m=angular.module('app.plugins');
    }catch(e){
        m = angular.module('app.plugins',[]);
    }

    m
        .controller('Login', Login)
        .controller('Signup', Signup)
        .controller('ForgotPass', ForgotPass);

    ////

    /* @ngInject */
    function Login($state, $stateParams, $mdMedia,$auth, config) {
        var vm = this;

        vm.email = null;
        vm.pass = null;
        vm.confirm = null;
        vm.createMode = false;

        vm.loginOption = {};
        vm.login = login;
        vm.loginWithProvider = loginWithProvider;
        vm.socialLogins = [{
            provider: 'twitter',
            icon: 'fa fa-twitter',
            color: '#5bc0de',
            url: '#'
        }, {
            provider: 'facebook',
            icon: 'fa fa-facebook',
            color: '#337ab7',
            url: '#'
        }, {
            provider: 'google',
            icon: 'fa fa-google-plus',
            color: '#e05d6f',
            url: '#'
        }, {
            provider: 'github',
            icon: 'fa fa-github-alt',
            color: '#CACACA',
            url: '#'
        }];
        // create blank user variable for login form
        vm.user = {
            email: '',
            password: ''
        };

        ////////////////
        function redirect(){
            if($stateParams.siteName&&$stateParams.pageName){
                $state.go($stateParams.stateName||'customPage',$stateParams)
            } else {
                $state.go(config.home);
            }
        }

        function showError(err) {
            vm.err = angular.isObject(err) && err.code ? err.code : err + '';
        }

        function login(email, pass, opt) {
            vm.err = null;
            $auth.signInWithEmailAndPassword(email,pass).then(function(){
                redirect();
            }, showError);
        }

        function loginWithProvider(provider) {
            if ($mdMedia('xs')) {
                var homeUrl = window.location.href.split('#')[0] + '#' + config.defaultUrl;
                vm.loginOption.popup = false;
                vm.loginOption.remember = 'default';
                window.location.href = homeUrl;
                $auth.loginWithProvider(provider, vm.loginOption);
            } else {
                $auth.loginWithProvider(provider, vm.loginOption).catch(showError).then(function(res){
                    redirect();
                    return $auth.checkIfAccountExistOnFb(res.user)
                }).then($auth.createAccount);
            }
        }
    }

    /* @ngInject */
    function Signup($state, $mdToast, $filter, $auth, indexService) {
        var vm = this;
        ////////////////

        vm.createAccount = function () {
            vm.err = null;
            if (assertValidAccountProps()) {
                var email = vm.email;
                var pass = vm.pass;
                // create user credentials in Firebase auth system

                $auth.createUserWithEmailAndPassword(email, pass)
                    .then(function () {
                        $auth.signInWithEmailAndPassword(email, pass)
                            .then(function(){
                                return $auth.createAccount({regSite:true})
                            })
                            .then(signupSuccess)
                            .catch(signupError);
                    })
                    .catch(function (error) {
                        // Handle Errors here.
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // ...
                    });
                // Auth.$createUser({email: email, password: pass})
                //     .then(function () {
                //         // authenticate so we have permission to write to Firebase
                //         return Auth.$authWithPassword({email: email, password: pass});
                //     })
                //     .then(Auth.createAccount)
                //     .then(signupSuccess, signupError);
            }
        };

        function showError(err) {
            vm.err = angular.isObject(err) && err.code ? err.code : err + '';
        }

        function assertValidAccountProps() {
            if (!vm.email) {
                vm.err = 'Please enter an email address';
            }
            else if (!vm.pass || !vm.confirm) {
                vm.err = 'Please enter a password';
            }
            else if (vm.createMode && vm.pass !== vm.confirm) {
                vm.err = 'Passwords do not match';
            }
            return !vm.err;
        }

        function signupSuccess(authData) {
            indexService.add("users", authData.uid, authData, "main"); //TODO: 檢查是否有main以外更好的index
            $mdToast.show(
                $mdToast.simple()
                    .content($filter('translate')('SIGNUP.MESSAGES.CONFIRM_SENT') + ' ' + authData.uid)
                    .position('bottom right')
                    .action($filter('translate')('SIGNUP.MESSAGES.LOGIN_NOW'))
                    .highlightAction(true)
                    .hideDelay(0)
            ).then(function () {
                $state.go('customPage');
            });
        }

        function signupError(err) {
            showError(err);
            $mdToast.show(
                $mdToast.simple()
                    .content($filter('translate')('SIGNUP.MESSAGES.NO_SIGNUP'))
                    .position('bottom right')
                    .hideDelay(5000)
            )
        }
    }
    /* @ngInject */
    function ForgotPass($state, $mdToast, $filter, $auth) {
        var vm = this;
        vm.email = '';
        vm.user = {
            email: ''
        };
        vm.resetClick = resetClick;

        ////////////////

        function resetClick() {

            $auth.$resetPassword({email:vm.email})
                .then(success, error);

            function success() {
                $mdToast.show(
                    $mdToast.simple()
                        .content($filter('translate')('FORGOT.MESSAGES.RESET_SENT') + ' ' + vm.email)
                        .position('bottom right')
                        .action($filter('translate')('FORGOT.MESSAGES.LOGIN_NOW'))
                        .highlightAction(true)
                        .hideDelay(0)
                ).then(function() {
                    $state.go('authentication.login');
                });
            }

            function error(error) {
                $mdToast.show(
                    $mdToast.simple()
                        .content($filter('translate')('FORGOT.MESSAGES.NO_RESET') + ' ' + vm.email)
                        .position('bottom right')
                        .hideDelay(5000)
                );
            }
        }
    }
})();

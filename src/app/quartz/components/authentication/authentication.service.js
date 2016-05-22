(function () {
    'use strict';

    angular
        .module('quartz.components')
        .provider('$auth', authProvider)
        .run(run);

    var app = firebase.app(),
        mainFirebase = {
            app: app,
            databaseURL: app.database().ref().toString().databaseURL,
            database: app.database(),
            auth: app.auth()
        };

    function authProvider() {
        
        this.setMainFirebase = function (config) {
            firebase.initializeApp(config, "mainAuth");
            var app = firebase.app("mainAuth");
            mainFirebase = {
                app: app,
                databaseURL: config.databaseURL,
                database: app.database(),
                auth: app.auth()
            }
        };

        this.$get = /*@ngInject*/function ($q, $firebase, $stateParams, config) {
            return new Auth(mainFirebase, $q, $firebase, $stateParams, config)
        }
    }

    function Auth(mainFirebase, $q, $firebase, $stateParams, config) {
        var mainFirebase = {
            app: firebase.app(),
            databaseURL: firebase.database().ref().toString().databaseURL,
            database: firebase.database(),
            auth: firebase.auth()
        };
        console.log(mainFirebase)
        var Auth = mainFirebase.auth,
            ready = $q.defer(),
            unsubscribe = Auth.onAuthStateChanged(function () {
                ready.resolve();
                unsubscribe();
            });

        Auth.waitForAuth = function () {
            var def = $q.defer();
            ready.promise.then(function () {
                def.resolve(Auth.currentUser);
            });
            return def.promise;
        };

        Auth.requireAuth = function () {
            var def = $q.defer();
            ready.promise.then(function () {
                if (Auth.currentUser) {
                    def.resolve(Auth.currentUser)
                } else {
                    def.reject()
                }
            });
            return def.promise;
        };

        Auth.checkIfAccountExistOnFb = function () {
            var user = Auth.currentUser,
                def = $q.defer(),
                opt = {},
                userPath = 'users/detail/' + user.uid;
            if (!user) def.reject('AUTH_NEEDED');

            function checkIfCreated() {
                $firebase.ref(userPath + '/createdTime').once('value', function (snap) {
                    opt.registered = snap.val() !== null;
                    def.resolve(opt);
                }, function (err) {
                    def.reject(err)
                });
            }

            checkIfCreated();

            if ($stateParams.siteName) {
                var siteName = $stateParams.siteName;
                $firebase.ref(userPath + '/sitesRegistered/' + siteName).once('value', function (regSnap) {
                    if (regSnap.val() === null && !config.standalone) opt.regSite = siteName;
                    checkIfCreated();
                })
            } else {
                checkIfCreated();
            }

            return def.promise
        };

        Auth.createAccount = function (opt) {
            var user = Auth.currentUser,
                uid = user.uid,
                userPaths = ['list/' + uid, 'detail/' + uid],
                basicData = Auth.basicAccountUserData(user),
                def = $q.defer(),
                regSite = function () {
                    if (opt.regSite) {
                        var data = {},
                            siteName = opt.regSite;
                        data["users/detail/" + uid + "/sitesRegistered/" + siteName] = mainFirebase.database.ServerValue.TIMESTAMP;
                        data["sites/detail/" + siteName + "/users/list/" + uid] = basicData;
                        $firebase.update('', data).then(function () {
                            def.resolve();
                        })
                    } else {
                        def.resolve();
                    }
                };

            if (opt.registered !== true) {
                $firebase.update('users', userPaths, basicData).then(regSite);
            } else {
                regSite();
            }
            return def.promise
        };

        function firstPartOfEmail(emailAddress) {
            return emailAddress.substring(0, emailAddress.indexOf("@"));
        }

        Auth.basicAccountUserData = function (user) {
            // var provider = user.provider,
            //     name = user[provider].displayName || user.uid,
            //     email = user[provider].email || null,
            //     profileImageURL = user[provider].profileImageURL || null;
            // if (provider === 'password') name = firstPartOfEmail(user.password.email);
            var basicUser = {createdTime: mainFirebase.database.ServerValue.TIMESTAMP/*, provider: user.provider*/};
            // basicUser.info = {
            //     name: name,
            //     email: email,
            //     profileImageURL: profileImageURL
            // };
            // basicUser[provider] = {
            //     id: user[provider].id || null
            // };
            return basicUser
        };


        Auth.loginWithProvider = function (provider, options) {
            var opt = typeof options === 'object' ? options : {},
                authProvider;
            switch (provider) {
                case 'password':
                    return Auth.signInWithEmailAndPassword({email: opt.email, password: opt.password});
                    break;
                // case 'custom':
                //     return Auth.$authWithCustomToken(opt.customToken, opt);
                //     break;
                // case 'anonymous':
                //     opt.rememberMe = opt.rememberMe || 'none';
                //     return Auth.$authAnonymously(opt);
                //     break;
                case 'google':
                    authProvider = Auth.GoogleAuthProvider();
                    break;
                case 'facebook':
                    authProvider = Auth.FacebookAuthProvider();
                    break;
                case 'twitter':
                    authProvider = Auth.TwitterAuthProvider();
                    break;
                case 'github':
                    authProvider = Auth.GithubAuthProvider();
                    break;
            }
            if (opt.popup === false) {
                return Auth.signInWithRedirect(authProvider);
            } else {
                return Auth.signInWithPopup(authProvider);
            }
        };

        Auth.removeUserData = function (authData, extraCallBack) {
            var uid = authData.uid;
            $firebase.update('users', ['list/' + uid, 'detail/' + uid], {
                "@all": null
            }).then(function () {
                if (extraCallBack) extraCallBack(authData);
            });
        };

        return Auth;
    }

    /*@ngInject*/
    function run($rootScope, promiseService, $auth, $firebase) {
        function assignUser(user) {
            $firebase.databases.currentUser = {
                url: mainFirebase.databaseURL + '#users/detail/' + user.uid
            };
        }

        $auth.onAuthStateChanged(function (authData) {
            $rootScope.user = authData;
            $rootScope.loggedIn = !!authData;

            promiseService.reset('userData');

            if (authData) {
                angular.extend($firebase.params, {
                    '$uid': authData.uid
                });

                assignUser(authData);

                $firebase.ref('users/detail/' + authData.uid + '/info').once('value', function (snap) {
                    var userData = $auth.basicAccountUserData(authData);
                    userData.info = snap.val();
                    userData.info.profileImageURL = authData[authData.provider].profileImageURL;
                    $rootScope.user = userData;

                    promiseService.resolve('userData', userData);
                });

            } else {
                console.log('no user', authData);
                promiseService.resolve('userData', null);
                $firebase.params["$uid"] = "";
            }
        });
    }
})();


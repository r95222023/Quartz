(function () {
    'use strict';

    angular
        .module('quartz.components')
        .provider('$auth', authProvider)
        .run(run);



    function authProvider() {
        var app = firebase.app(),
            authFirebase = {
                app: app,
                databaseURL: app.options.databaseURL,
                database: app.database(),
                auth: app.auth()
            };

        this.setAuthFirebase = function (config) {
            firebase.initializeApp(config, "mainAuth");
            var app = firebase.app("mainAuth");
            authFirebase = {
                app: app,
                databaseURL: config.databaseURL,
                database: app.database(),
                auth: app.auth()
            }
        };
        this.$get = /*@ngInject*/function ($q, $firebase, $stateParams, config) {
            return new Auth(authFirebase, $q, $firebase, $stateParams, config)
        }
    }

    function Auth(authFirebase, $q, $firebase, $stateParams, config) {
        var Auth = authFirebase.auth,
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
                userPath = 'user-path?userId='+user.uid;
            if (!user) def.reject('AUTH_NEEDED');

            function checkIfCreated() {
                $firebase.queryRef(userPath + '&path=createdTime').once('value', function (snap) {
                    opt.registered = snap.val() !== null;
                    def.resolve(opt);
                }, function (err) {
                    def.reject(err)
                });
            }

            checkIfCreated();

            if ($stateParams.siteName) {
                var siteName = $stateParams.siteName;
                $firebase.queryRef(userPath + '&path=sitesVisited/' + siteName+'/createdTime').once('value', function (regSnap) {
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
                            siteName = opt.regSite===true? $stateParams.siteName:opt.regSite;
                        data["users/detail/" + uid + "/sitesVisited/" + siteName+'/createdTime'] = firebase.database.ServerValue.TIMESTAMP;
                        data["sites/detail/" + siteName + "/users/list/" + uid] = basicData;
                        $firebase.queryRef().update(data).then(function () {
                            def.resolve();
                        })
                    } else {
                        def.resolve();
                    }
                };

            if (opt.registered !== true) {
                $firebase.update(['user?type=list','user?type=detail'], basicData,{id:uid}).then(regSite);
            } else {
                regSite();
            }
            return def.promise
        };



        Auth.basicAccountUserData = function (user) {
            // var provider = user.provider,
            //     name = user[provider].displayName || user.uid,
            //     email = user[provider].email || null,
            //     profileImageURL = user[provider].profileImageURL || null;
            // if (provider === 'password') name = firstPartOfEmail(user.password.email);
            var basicUser = {createdTime: firebase.database.ServerValue.TIMESTAMP/*, provider: user.provider*/};
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
                // case 'custom':
                //     return Auth.$authWithCustomToken(opt.customToken, opt);
                //     break;
                // case 'anonymous':
                //     opt.rememberMe = opt.rememberMe || 'none';
                //     return Auth.$authAnonymously(opt);
                //     break;
                case 'google':
                    authProvider = new firebase.auth.GoogleAuthProvider();
                    break;
                case 'facebook':
                    authProvider = new firebase.auth.FacebookAuthProvider();
                    break;
                case 'twitter':
                    authProvider = new firebase.auth.TwitterAuthProvider();
                    break;
                case 'github':
                    authProvider = new firebase.auth.GithubAuthProvider();
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
            $firebase.update(['user?type=list', 'user/type=detail'], {
                "@all": null
            },{id:uid}).then(function () {
                if (extraCallBack) extraCallBack(authData);
            });
        };

        return Auth;
    }

    /*@ngInject*/
    function run($rootScope, $auth, $firebase) {
        function assignUser(user) {
            $firebase.databases.currentUser = {
                url: $firebase.databaseURL + '#users/detail/' + user.uid
            };
        }

        $auth.onAuthStateChanged(function (user) {
            $rootScope.user = user;
            // console.log(user, user===$auth.currentUser);
            $rootScope.loggedIn = !!user;

            if (user) {
                angular.extend($firebase.params, {
                    '$uid': user.uid
                });

                assignUser(user);

                $firebase.queryRef('user-path?userId='+user.uid+'&path=info').once('value', function (snap) {
                    var userData = {},
                        providerData = user.providerData;
                    userData.info = snap.val()||{};
                    userData.info.name = user.displayName||providerData[0].displayName||firstPartOfEmail(user.email);
                    userData.info.photoURL = user.photoURL||providerData[0].photoURL;
                    angular.extend($rootScope.user,userData);
                });

            } else {
                console.log('no user', user);
                $firebase.params["$uid"] = "";
            }
        });
    }

    function firstPartOfEmail(emailAddress) {
        return emailAddress.substring(0, emailAddress.indexOf("@"));
    }
})();


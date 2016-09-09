(function () {
    window._core = window._core||{};
    window._core.Auth = Auth;
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Auth;
        });
    } else if (typeof module !== 'undefined' && module != null) {
        module.exports = Auth
    }

    function Auth(fbUtil) {
        this.fbUtil = fbUtil;
        this.database = firebase.database(fbUtil.app);
        this.auth = firebase.auth(fbUtil.app);
        this.currentUser = this.auth.currentUser;

        // var Auth = authFirebase.auth,
        //     ready = $q.defer(),
        //     unsubscribe = Auth.onAuthStateChanged(function () {
        //         ready.resolve();
        //         unsubscribe();
        //     });
        //
        //
        // Auth.waitForAuth = function () {
        //     var def = $q.defer();
        //     ready.promise.then(function () {
        //         def.resolve(Auth.currentUser);
        //     });
        //     return def.promise;
        // };
        //
        // Auth.requireAuth = function () {
        //     var def = $q.defer();
        //     ready.promise.then(function () {
        //         if (Auth.currentUser) {
        //             def.resolve(Auth.currentUser)
        //         } else {
        //             def.reject()
        //         }
        //     });
        //     return def.promise;
        // };
    }

    Auth.prototype.loginWithProvider = function (provider, options) {
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
            return this.auth.signInWithRedirect(authProvider);
        } else {
            return this.auth.signInWithPopup(authProvider);
        }
    };

    Auth.prototype.checkIfAccountExist = function () {
        var user = this.currentUser,
            self = this;

        return new Promise(function (resolve, reject) {
            if (!user) reject('AUTH_NEEDED');
            this.fbUtil.getSiteName().then(function (siteName) {
                self.fbUtil.database.queryRef('users-site', {
                    siteName: siteName,
                    type: 'detail',
                    userId: user.uid
                }).child('createdTime').once('value', function (snap) {
                    resolve(!!snap.val());
                }, function (err) {
                    reject(err)
                });
            });
        })
    };

    Auth.prototype.getBasicUserData = function (user) {
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

    Auth.prototype.createAccount = function (opt) {
        var user = this.currentUser,
            self = this,
            basicData = this.getBasicUserData(user);

        return new Promise(function (resolve, reject) {

            self.fbUtil.getSiteName().then(function (siteName) {
                var params = {
                        siteName: siteName,
                        userId: user.uid
                    },
                    data = {};
                ['users-site','users-root'].forEach(function(path){
                    ['list','detail'].forEach(function(type){
                        data[self.fbUtil.parseRefUrl(path, Object.assign({type: type}, params))] = basicData;
                    })
                });
                self.database.ref().update(data).then(resolve).catch(reject);
            })
        });
    };
})();

//var config = require('../config');
var firebaseUtil = require('./firebaseUtil'),
    events = require('events');


var serverGroupRefs = {},
    start = new Date(),
    eventEmitter = new events.EventEmitter(),
    serverStat;
function ServerGroup(config) {
    ////get server info
    var serverRef = firebaseUtil.ref(config.FBURL + config.SERVER_PATH);
    var onlineServerRef = serverRef.child('online');

    this.serverRef = serverRef;
    this.serverId = config.SERVER_ID;

    onlineServerRef.on('value', function (snap) {
        eventEmitter.emit('value', snap)
    });

    onlineServerRef.on('child_added', function (snap) {
        serverGroupRefs[snap.key()] = snap.ref();
        eventEmitter.emit('child_added', snap);
    });

    onlineServerRef.on('child_removed', function (oldSnap) {
        serverGroupRefs[oldSnap.key()].off();
        eventEmitter.emit('child_removed', oldSnap);
    });

    ////register this server
    serverRef.child('online').child(config.SERVER_ID).set({
        startAt: firebaseUtil.ServerValue.TIMESTAMP
    });
    serverRef.child('online').child(config.SERVER_ID).onDisconnect().set(null);

    serverRef.child('offline').child(config.SERVER_ID).set(null);
    serverRef.child('offline').child(config.SERVER_ID).onDisconnect().set({
        lastStartAt: start.getTime(),
        endAt: firebaseUtil.ServerValue.TIMESTAMP
    })
}

ServerGroup.prototype.getServerRefs = function () {
    return serverGroupRefs;
};

ServerGroup.prototype.on = function (event, listener) {
    eventEmitter.on(event, listener);
};

ServerGroup.prototype.once = function (event, listener) {
    eventEmitter.once(event, listener);
};

ServerGroup.prototype.off = function (event, listener) {
    if (!listner) {
        eventEmitter.removeListener(event, listener);
    } else {
        eventEmitter.removeAllListeners(event);
    }
};

ServerGroup.prototype.getThisServerRef = function (onlineOrOffline) {
    return this.serverRef.child(onlineOrOffline || 'online').child(this.serverId)
};

ServerGroup.prototype.getStat = function () {
    var stat,
        serverOnline = 0,
        serverOffline = 0;
    this.serverRef.on('value', function (snap) {
        var serverSnap = snap.val();

        for (var onlineServerName in serverSnap.online || {}) {
            serverOnline++;
            ////for future online server stat
        }
        for (var offlineServerName in serverSnap.offline || {}) {
            serverOffline++;
            ////for future offline server stat
        }
    });


    stat = {
        serverOnline: serverOnline,
        serverOffline: serverOffline
    };
    return stat
};


module.exports = ServerGroup;
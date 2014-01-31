var util    = require('util');
var events  = require('events');
var thunky  = require('thunky');
var mongodb = require('mongodb');

util.inherits(Connection, events.EventEmitter);

Connection.mongodb = mongodb;

function Connection(connectionString) {
    'use strict';

    if (!(this instanceof Connection))
        return new Connection(connectionString);

    events.EventEmitter.call(this);

    this.connectionString = connectionString;
}

Connection.prototype.connect = function ConnectionConnect(callback) {
    var self = this;

    this.connecting = true;

    this._getConnection = thunky(function (callback) {
        mongodb.Db.connect(this.connectionString, function (err, db) {
            if (err) return callback(err);

            self.db = db;
            db.on('error', function (err) { self.emit('error', err); });

            self.emit('ready');
            callback(null, db);
        });
    });

    if (callback) this._getConnection(callback);
};

Connection.prototype.getConnection = function ConnectionGetConn(callback) {
    if (!this.connecting)
        return this.connect(callback);

    this._getConnection(callback);
};

module.exports = Connection;
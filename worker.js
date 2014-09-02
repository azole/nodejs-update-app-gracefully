/*jslint node: true */
'use strict';

var nodeUtil = require('util'),
  EventEmitter = require('events').EventEmitter;


module.exports = CWorker;
nodeUtil.inherits(CWorker, EventEmitter);

var net = require('net');


function CWorker(opt) {
  console.log('[CWorker]', process.pid + " - v.0.0.2");
  this.server = net.createServer(function() {
    console.log('[CWorker]', 'Server create...');
  });

  this.server.on('connection', function(sock) {

  });

  // server closing
  this.server.on('close', function() {
    console.log('[CWorker]', '[socket]', '[CLOSED]');
  });

  this.server.on('error', function(err) {
    console.log('[CWorker]', '[socket]', '[ERROR]', err.stack);
  });

  this.server.listen(opt.port, opt.host, function() {
    console.log('[CWorker]', 'Server listening on ' + this.server.address().address + ':' + this.server.address().port);
  }.bind(this));
}

CWorker.prototype.close = function() {
  console.log('[CWorker]', 'closing...');
  // do something for closing server
  // e.g. send close message to all clients
  this.server.close();
};

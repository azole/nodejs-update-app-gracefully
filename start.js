/*jslint node: true */
'use strict';

var cluster = require('cluster'),
  cpuCount = require('os').cpus().length; // compare with config value

if (cluster.isMaster) {

  cpuCount--;

  for (var i = 0; i < cpuCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('[Master]', 'worker ' + worker.id + "-" + worker.process.pid + ' died, code:' + code + ' signal:' + signal);
    if(code == 2) {
      // if code is 2, restart a worker
      cluster.fork();
    }
  });

  cluster.on('listening', function(worker, address) {
    console.log('[Master]', 'listening: worker ' + worker.process.pid + ', Address: ' + address.address + ":" + address.port);
  });

  process.on('SIGINT', function() {
    console.log('[Master]', 'master shutdown...');
  });

} else {
  var CWorker = require('./worker.js');
  var worker = new CWorker({
    host: "localhost",
    port: 1234
  });

  process.on('SIGUSR2', function() {
    // do something for closing
    worker.close();
    //cluster.worker.kill('SIGUSR2');
    process.exit(2);
  });

  process.on('SIGINT', function() {
    worker.close();
    cluster.worker.kill(); //process.exit();
  });
}

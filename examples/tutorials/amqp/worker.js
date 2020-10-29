#!/usr/bin/env node
// Process tasks from the work queue
require('dotenv').config()

const amqpClient = require('./amqp_client')

const sleep = (ms) => (new Promise((resolve) => setTimeout(resolve, ms)));

amqpClient.init()
  .then(function(conn) {
    process.once('SIGINT', function() { conn.close(); });
    return conn.createChannel().then(function(ch) {
      var ok = ch.assertQueue('task_queue', {durable: true});
      ok = ok.then(function() { ch.prefetch(2); });
      ok = ok.then(function() {
        ch.consume('task_queue', doWork, {noAck: false});
        console.log(" [*] Waiting for messages. To exit press CTRL+C");
      });
      return ok;

      function doWork(msg) {
        var body = msg.content.toString();
        console.log(" [x] Received '%s'", body);
        var secs = body.split('.').length - 1;
        console.log(" [x] Task takes %d seconds", secs);
        setTimeout(function() {
          console.log(" [x] Done");
          ch.ack(msg);
        }, secs * 1000);
      }
    });
  }).catch(console.warn);

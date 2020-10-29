#!/usr/bin/env node
require('dotenv').config()
const amqpClient = require('./amqp_client');

amqpClient.init()
  .then(function(conn) {
    process.once('SIGINT', function() { conn.close(); });
    return conn.createChannel().then(async function(ch) {
      const queue = 'mqtt-subscription-amqp.node-consumer-0qos1';
      // const queue = 'mqtt-subscription-amqp.node-consumer-1qos1';
      var queueExist = await ch.checkQueue(queue);
      var ok = null
      console.log('queueExist');
      console.log(queueExist);
        
      var ok = queueExist ? Promise.resolve(queueExist) : ch.assertQueue(queue, {durable: true, autoDelete: true});
      
      ok = ok.then(function(_qok) {
        return ch.consume(queue, function(msg) {
          console.log(" [x] Received '%s'", msg.content.toString());
          ch.ack(msg);
        }, {noAck: false});
      });

      return ok.then(function(_consumeOk) {
        console.log(' [*] Waiting for messages. To exit press CTRL+C');
      });
    });
  }).catch(console.warn);

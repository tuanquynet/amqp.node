#!/usr/bin/env node

var amqp = require('amqplib');
var fs = require('fs');
var path = require('path');

var opts = {
  cert: fs.readFileSync(path.join(__dirname, '../../.temp/cert_ecc/ft900device1_cert.pem')),      // client cert
  key: fs.readFileSync(path.join(__dirname,'../../.temp/cert_ecc/ft900device1_pkey.pem')),        // client key
  passphrase: null, // passphrase for key
  ca: [fs.readFileSync(path.join(__dirname, '../../.temp/cert_ecc/rootca.pem'))]            // array of trusted CA certs
};

amqp.connect(`amqp://${process.env.CONFIG_USE_MQTT_DEFAULT_USER}:${process.env.CONFIG_USE_MQTT_DEFAULT_PASS}@localhost`, opts).then(function(conn) {
  process.once('SIGINT', function() { conn.close(); });
  return conn.createChannel().then(function(ch) {
    const queue = 'mqtt-subscription-amqp.node-consumerqos1';
    var ok = ch.assertQueue(queue, {durable: false});
    
    ok = ok.then(function(_qok) {
      return ch.consume(queue, function(msg) {
        console.log(" [x] Received '%s'", msg.content.toString());
      }, {noAck: true});
    });

    return ok.then(function(_consumeOk) {
      console.log(' [*] Waiting for messages. To exit press CTRL+C');
    });
  });
}).catch(console.warn);

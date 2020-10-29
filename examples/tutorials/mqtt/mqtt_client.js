/*
Required: rabbitmq and rabbitmq mqtt plugins installed
 */
const mqtt = require('async-mqtt');
const path = require('path');
const fs = require('fs');
// import mqtt from 'mqtt';

const config = {
  // CONFIG_USE_MQTT_DEFAULT_USER: 'guest',
  // CONFIG_USE_MQTT_DEFAULT_PASS: 'guest',
  CONFIG_USE_MQTT_DEFAULT_USER: process.env.CONFIG_USE_MQTT_DEFAULT_USER,
  CONFIG_USE_MQTT_DEFAULT_PASS: process.env.CONFIG_USE_MQTT_DEFAULT_PASS,
  MQTT_PROTOCOL: 'mqtt',
  MQTT_SERVER: 'localhost',
  MQTT_SERVER_PORT: '8883',
  // MQTT_SERVER: '192.168.1.115',
  // MQTT_SERVER_PORT: '8883',
}

module.exports = {
  async init(clientId) {
    if (this._client) {
      return this._client;
    }
    const tlsOption = {
      key: fs.readFileSync(path.join(__dirname,'../../../.temp/cert_ecc/ft900device1_pkey.pem')),
      cert: fs.readFileSync(path.join(__dirname, '../../../.temp/cert_ecc/ft900device1_cert.pem')),
      // Necessary only if the server uses a self-signed certificate.
      ca: [ fs.readFileSync(path.join(__dirname, '../../../.temp/cert_ecc/rootca.pem'))],
      rejectUnauthorized: false,
    };

    const options = {
      clientId,
      username: config.CONFIG_USE_MQTT_DEFAULT_USER,
      password: config.CONFIG_USE_MQTT_DEFAULT_PASS,
      connectTimeout: 10 * 1000,
      ...tlsOption,
      clean: false,
    };

    // try {
      console.log('mqtt');
      console.log(mqtt);
      this._client = await mqtt.connectAsync(
        `${config.MQTT_PROTOCOL || 'tcp'}://${config.MQTT_SERVER}:${config.MQTT_SERVER_PORT}`,
        options,
      );
    // } catch (error) {
    //   console.error('connection error');
    //   console.error(error);
    //   throw error;
    // }
  },

  async publish(topic, payload, {retain  = true, qos = 0}  = {}, callback) {
    const options = {
      retain,
      qos,
    };

    console.log('publish');
    await this._client.publish(topic, JSON.stringify(payload), options, callback);
  },

  async subscribe(topic) {
    const options = {
      qos: 2,
    };

    await this._client.subscribe(topic, options);
    await this._client.on('message', (topic, payload, packet) => {
      console.log(topic);
      console.log('payload.toString()');
      console.log(`-${payload}-`);
      if (payload) {
        console.log('do something');
      }
    });

    return true
  },

  async close() {
    if (this._client) {
      // await this._client.off();
      await this._client.end();
    }

    this._client = null;
  },
};

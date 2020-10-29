/*
Required: rabbitmq and rabbitmq mqtt plugins installed
 */
const amqp = require('amqplib');
const path = require('path');
const fs = require('fs');
// import mqtt from 'mqtt';

const config = {
  AMQP_USER_NAME: process.env.AMQP_USER_NAME,
  AMQP_USER_PASSWORD: process.env.AMQP_USER_PASSWORD,
  AMQP_PROTOCOL: 'amqps',
  AMQP_SERVER: 'localhost',
  AMQP_SERVER_PORT: '5671',
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
      // connectTimeout: 10 * 1000,
      ...tlsOption,
    };

    // try {
    this._client = await amqp.connect(
      `${config.AMQP_PROTOCOL || 'tcp'}://${config.AMQP_USER_NAME}:${config.AMQP_USER_PASSWORD}@${config.AMQP_SERVER}:${config.AMQP_SERVER_PORT}`,
      options,
    );

    return this._client
  },

  async close() {
    if (this._client) {
      // await this._client.off();
      await this._client.close();
    }

    this._client = null;
  },
};

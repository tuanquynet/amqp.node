const { resolve } = require('bluebird');
const { init } = require('./mqtt_client');
const mqttClient  = require('./mqtt_client');

const DEVICE_ID = 'PH80XXRR1023200B'
const emailTopic = `server/${DEVICE_ID}/trigger_notification/uart/email`;
const smsTopic = `server/${DEVICE_ID}/trigger_notification/uart/mobile`;
const storageTopic = `server/${DEVICE_ID}/trigger_notification/uart/storage`;
const pushNotificationTopic = `server/${DEVICE_ID}/trigger_notification/uart/notification`;

const topic = emailTopic;

console.log('start  app ', topic);
let count = 0;
let STOP_SIGNAL = false;
let internalId;
mqttClient
  .init('amqp.node-publisher')
  .then(() => {
    internalId = setInterval(() => {
      if (STOP_SIGNAL) {
        clearInterval(internalId);
        return;
      }
      const INCREMENT = 100;
      count += INCREMENT;
      console.log('Total:', count);
      tasks = []
      for (let index = 0; index < INCREMENT; index++) {
        tasks.push(mqttClient.publish(topic, {}, {qos: 1}))
      }
      return Promise.all(tasks);
    }, 2000);
  })
  .then(() => {
    // return mqttClient.close();
  })
  .catch((err) => {
    console.log(err);
    // process.exit(0);
  });

setTimeout(() => {
  console.log('heartbeat');
  process.exit(0);
}, 30000);

setInterval(() => {
  console.log('heartbeat');
}, 2000);


process.on('SIGINT', async () => {
  console.log('SIGINT');
  STOP_SIGNAL = true;
  return new Promise((resolve) => {
    setTimeout(async () => {
      mqttClient
        .close().then(() => {
          process.exit(0); 
        });
    }, 10000);
  })
});

process.on('exit', async function(code) {
  return console.log(`About to exit with code ${code}`);
});
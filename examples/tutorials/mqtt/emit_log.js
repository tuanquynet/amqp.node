require('dotenv').config()

const { init } = require('./mqtt_client');
const mqttClient  = require('./mqtt_client');

const num = parseInt(Math.random() * 1, 10);
const topic  = `/task/sleep/${num}`;
console.log('start  app ', topic);
mqttClient
  .init('amqp.node-publisher')
  .then(() => {
    // return mqttClient.publish(`${topic}`, `at ${new Date}`, {qos: 1}, () => {
    //   console.log('suback');
    //   // to clear retained message if there is any subscribing client
    //   // mqttClient.publish(topic);
    // });
    setInterval(() => {
      const num = parseInt(Math.random() * 1, 10);
      const payload = `at ${new Date}`;
      return mqttClient.publish(`/task/sleep/${num}`, payload, {qos: 1, retain: true}, () => {
        console.log(payload);
        // to clear retained message if there is any subscribing client
        // mqttClient.publish(topic);
      });
    }, 1000);
  })
  .then(() => {
    // return mqttClient.close();
  })
  .then(() => {
    console.log('done');
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
  await mqttClient.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM');
  await mqttClient.close();
});

process.on('exit', async function(code) {
  return console.log(`About to exit with code ${code}`);
});
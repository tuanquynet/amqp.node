require('dotenv').config()

const mqttClient  = require('./mqtt_client');

const num = parseInt(Math.random() * 1, 10);
const topic  = `/task/sleep/${num}`;
console.log('start  app ', topic);
mqttClient
  .init(`amqp.node-consumer-${num}`)
  .then(() => {
    console.log('sub', topic);
    return mqttClient.subscribe(`${topic}`);
  })
  .catch(console.log);

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

setInterval(() => {
  // console.log('heartbeat');
}, 2000);
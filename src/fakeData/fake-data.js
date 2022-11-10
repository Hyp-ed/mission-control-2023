const random = require("random");
const mqtt = require("mqtt");
const SENSORS = require('./fake-sensors.json');
const client = mqtt.connect("ws://broker.emqx.io:8083/mqtt");

client.on("connect", function () {
  console.log("CLIENT CONNECTED");

  SENSORS.forEach(sensor => {
    setInterval(() => {
      const temperature = generateRandomTemperature();
      client.publish(sensor.topic, temperature);
      console.log(`Published ${temperature} to ${sensor.topic}`);
    }, 1000);
  });
  client.publish("hyped.temperature", generateRandomTemperature());
});

// client.on("message", function (topic, message) {
//   console.log(message.toString());
//   client.end();
// });

let generateRandomTemperature = function () {
  let randomTemperature = Math.round(random.float((min = 0), (max = 100)));
  return String(randomTemperature);
};

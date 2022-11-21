const random = require("random");
const mqtt = require("mqtt");
const SENSORS = require('./fake-sensors.json');
const client = mqtt.connect("ws://broker.emqx.io:8083/mqtt");

client.on("connect", function () {
  console.log("CLIENT CONNECTED");

  SENSORS.forEach(sensor => {
    setInterval(() => {
      const temperature = generateRandomTemperature(sensor.min,sensor.max);
      if(sensor.name == 'brake feedback'){
        client.publish(`hyped.${sensor.name}`, sensor.break_status);
      } else {
        client.publish(`hyped.${sensor.name}`, temperature);
      }
      console.log(`Published ${temperature} ${sensor.unit} to ${sensor.name}`);
    }, sensor.update_interval);
  });

  //client.publish("hyped.temperature", generateRandomTemperature());
});

// client.on("message", function (topic, message) {
//   console.log(message.toString());
//   client.end();
// });

let generateRandomTemperature = function (x,y) {
  let randomTemperature = Math.round(random.float((min = x), (max = y)));
  return String(randomTemperature);
};


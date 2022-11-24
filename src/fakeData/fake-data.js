const random = require("random");
const mqtt = require("mqtt");
const SENSORS = require('./fake-sensors.json');
const client = mqtt.connect("ws://broker.emqx.io:8083/mqtt");

client.on("connect", function () {
  console.log("CLIENT CONNECTED");

  SENSORS.forEach(sensor => {
    setInterval(() => {
      const value = generateRandomTemperature(sensor.min,sensor.max);
      if(sensor.type == 'bool'){
        client.publish(`hyped.${sensor.name}`, sensor.break_status?"True":"False");
      } else {
        client.publish(`hyped.${sensor.name}`, value);
      }
      console.log(`Published ${value} ${sensor.unit} to ${sensor.name}`);
    }, sensor.update_interval);
  });

  //client.publish("hyped.temperature", generateRandomTemperature());
});

// client.on("message", function (topic, message) {
//   console.log(message.toString());
//   client.end();
// });

let generateRandomTemperature = function (x,y) {
  let randomTemperature = (random.float((min = x), (max = y))).toFixed(2);
  return String(randomTemperature);
};


/* eslint-disable no-console */
import mqtt from "mqtt";
import random from "random";

const SENSORS = require("./fake-sensors.json");

const client = mqtt.connect("ws://broker.emqx.io:8083/mqtt");

function generateValueForSensor(sensor) {
  if (sensor.type === "boolean") {
    if (sensor.default === undefined) {
      throw new Error('Sensor of type "boolean" must have a default value');
    }
    return String(sensor.default);
  }

  if (sensor.type === "float") {
    if (sensor.min === undefined || sensor.max === undefined) {
      throw new Error('Sensor of type "float" must have a min and max value');
    }
    return String(random.float(sensor.min, sensor.max).toFixed(2));
  }

  if (sensor.type === "integer") {
    if (sensor.min === undefined || sensor.max === undefined) {
      throw new Error('Sensor of type "integer" must have a min and max value');
    }
    return String(random.int(sensor.min, sensor.max));
  }

  throw new Error("Sensor type not supported");
}

client.on("connect", () => {
  console.log("CLIENT CONNECTED");

  SENSORS.forEach((sensor) => {
    setInterval(() => {
      const value = generateValueForSensor(sensor);
      client.publish(`hyped.${sensor.name}`, value);
      console.log(`Published ${value} ${sensor.unit} to ${sensor.name}`);
    }, sensor.update_interval);
  });
});

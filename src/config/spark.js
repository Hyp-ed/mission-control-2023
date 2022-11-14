import dictionaries from "../assets/dictionaries.json";
import { logger } from "../core/logger";
import { Dictionary, Server } from "../server/app";

const dicts = [];

// Read dictionaries.json into Dictionary objects
dictionaries.forEach((dictionary) => {
  const dict = new Dictionary(dictionary.name, dictionary.objpath);
  dictionary.measurements.forEach((measurement) => {
    try {
      dict.addMeasurement(measurement.name, measurement.objpath, [measurement.options], {
        topic: measurement.topic,
      });
    } catch (e) {}
  });
  dicts.push(dict);
});

// Start the server
const server = new Server({
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 8080,
  wss_port: process.env.WSS_PORT || 8082,
  broker: process.env.MSGFLO_BROKER || "mqtt://c-beam.cbrp3.c-base.org",
  dictionaries: dicts,
  history: {
    host: process.env.INFLUX_HOST || "localhost",
    db: process.env.INFLUX_DB || "cbeam",
  },
  persistence: "openmct.plugins.LocalStorage()",
});

server.start((err) => {
  if (err) {
    logger.error("Server failed to start", err);
    process.exit(1);
  }
  logger.info(`Server listening on ${server.config.port}`);
});

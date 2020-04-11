var app = require('../server/app');

const dictionaries = require('../dict/dictionaries.json');

const dicts = [];

// Read dictionaries.json into Dictionary objects
dictionaries.forEach(function(dictionary) {
  const dict = new app.Dictionary(dictionary.name, dictionary.objpath);
  dictionary.measurements.forEach(function(measurement) {
    try {
      dict.addMeasurement(measurement.name, measurement.objpath, [
        measurement.options
      ], {
        topic: measurement.topic
      });
    } catch (e) {
      
    }
  });
  dicts.push(dict);
});

// Start the server
var server = new app.Server({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 8080,
  wss_port: process.env.WSS_PORT || 8082,
  broker: process.env.MSGFLO_BROKER || 'mqtt://c-beam.cbrp3.c-base.org',
  dictionaries: dicts,
  history: {
    host: process.env.INFLUX_HOST || 'localhost',
    db: process.env.INFLUX_DB || 'cbeam'
  },
  persistence: 'openmct.plugins.LocalStorage()'

});
server.start(function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Server listening in ' + server.config.port);
});

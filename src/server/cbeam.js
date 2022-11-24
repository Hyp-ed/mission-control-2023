// @ts-nocheck
/* eslint-disable */

(function () {
  let booleanStates;
  let main;
  let mqtt;
  let unhandled;

  mqtt = require("mqtt");

  booleanStates = {};

  exports.latestState = function (id) {
    if (typeof booleanStates[id] === "undefined") {
      return null;
    }
    return booleanStates[id];
  };

  exports.connect = function (config, callback) {
    let client;
    booleanStates = {};
    client = mqtt.connect(config.broker);
    client.on("connect", function () {
      if (!callback) {
        return;
      }
      callback(null, client);
      return (callback = null);
    });
    return client.on("error", function (err) {
      if (!callback) {
        return;
      }
      callback(err);
      return (callback = null);
    });
  };

  unhandled = [];

  exports.announce = function (client, dictionaries, callback) {
    let def;
    let dictionary;
    let i;
    let key;
    let len;
    let ref;
    let val;
    for (i = 0, len = dictionaries.length; i < len; i++) {
      dictionary = dictionaries[i];
      if (!dictionary.options.announce) {
        continue;
      }
      def = {
        protocol: "discovery",
        command: "participant",
        payload: {
          id: `openmct-${dictionary.key}`,
          component: `openmct/${dictionary.key}`,
          icon: dictionary.options.icon,
          label: `OpenMCT logger for ${dictionary.name}`,
          role: dictionary.key,
          inports: [],
          outports: [],
        },
      };
      ref = dictionary.measurements;
      for (key in ref) {
        val = ref[key];
        def.payload.inports.push({
          id: val.name,
          type: val.values[0].format,
          hidden: val.options.hidden,
          queue: val.options.topic,
        });
      }
      client.publish("fbp", JSON.stringify(def));
    }
    return callback();
  };

  exports.filterMessages = function (topic, msg, dictionaries, callback) {
    let dictionary;
    let e;
    let handlers;
    let i;
    let key;
    let len;
    let points;
    let ref;
    let seenBooleans;
    let val;
    let value;
    try {
      value = JSON.parse(msg.toString());
    } catch (error) {
      e = error;
      value = msg.toString();
    }
    handlers = [];
    for (i = 0, len = dictionaries.length; i < len; i++) {
      dictionary = dictionaries[i];
      ref = dictionary.measurements;
      for (key in ref) {
        val = ref[key];
        if (val.options.topic !== topic) {
          continue;
        }
        handlers.push(val);
      }
    }
    if (!handlers.length) {
      if (unhandled.indexOf(topic) !== -1) {
        return callback([]);
      }
      unhandled.push(topic);
      console.log(`Unhandled key ${topic}`);
      return callback([]);
    }
    points = handlers.map(function (handler) {
      let message;
      return (message = {
        id: handler.key,
        value: handler.callback(value),
        timestamp: Date.now(),
      });
    });
    seenBooleans = points
      .filter(function (point) {
        if (typeof point.value !== "boolean") {
          // We're only interested in boolean values
          return false;
        }
        // We're only interested in booleans we have a previous state for
        if (typeof booleanStates[point.id] === "undefined") {
          booleanStates[point.id] = {
            value: point.value,
            timestamp: point.timestamp,
          };
          return false;
        }
        if (booleanStates[point.id].value === point.value) {
          // We're only interested in booleans that change state
          return false;
        }
        return true;
      })
      .map(function (point) {
        let prevPoint;
        let prevState;
        prevState = booleanStates[point.id].value;
        booleanStates[point.id] = {
          value: point.value,
          timestamp: point.timestamp,
        };
        return (prevPoint = {
          id: point.id,
          value: prevState,
          timestamp: point.timestamp - 1,
        });
      });
    return callback(seenBooleans.concat(points));
  };

  main = function () {
    return exports.connect(function (err, client) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      client.subscribe("#");
      return client.on("message", function (topic, msg) {
        let message;
        message = msg.toString();
        return console.log(`${topic}: ${message}`);
      });
    });
  };

  if (!module.parent) {
    main();
  }
}.call(this));

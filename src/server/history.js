// @ts-nocheck
/* eslint-disable */

(function () {
  let History;
  let influx;

  influx = require("influx");

  History = class History {
    constructor(config) {
      this.config = config;
    }

    connect(callback) {
      this.client = new influx.InfluxDB({
        host: this.config.history.host,
        database: this.config.history.db,
        schema: this.prepareSchema(),
      });
      return this.client
        .getDatabaseNames()
        .then((names) => {
          if (!names.includes(this.config.history.db)) {
            return this.client.createDatabase(this.config.history.db);
          }
        })
        .then(function () {
          return callback();
        })
        .catch(function (e) {
          return callback(e);
        });
    }

    prepareSchema() {
      let dictionary;
      let i;
      let k;
      let len;
      let ref;
      let ref1;
      let schema;
      let table;
      let val;
      schema = [];
      ref = this.config.dictionaries;
      for (i = 0, len = ref.length; i < len; i++) {
        dictionary = ref[i];
        ref1 = dictionary.measurements;
        for (k in ref1) {
          val = ref1[k];
          table = {
            measurement: this.prepareId(k),
            fields: {
              value: this.toInfluxType(val.values[0].format),
            },
            tags: [],
          };
          schema.push(table);
        }
      }
      return schema;
    }

    toInfluxType(format) {
      switch (format) {
        case "integer":
          return influx.FieldType.INTEGER;
        case "float":
          return influx.FieldType.FLOAT;
        case "boolean":
          return influx.FieldType.BOOLEAN;
        default:
          return influx.FieldType.STRING;
      }
    }

    record(point, callback) {
      let measurement;
      if (!this.client) {
        return callback(new Error("Not connected to InfluxDB"));
      }
      measurement = this.getMeasurement(point.id);
      if (!measurement) {
        return callback(new Error(`Measurement ${point.id} not defined`));
      }
      if (!measurement.options.persist) {
        return callback();
      }
      if (Number.isNaN(point != null ? point.value : void 0)) {
        return callback();
      }
      return this.client
        .writePoints([
          {
            measurement: this.prepareId(point.id),
            timestamp: new Date(point.timestamp),
            fields: {
              value: point.value,
            },
          },
        ])
        .then(function () {
          return callback();
        })
        .catch(function (e) {
          return callback(e);
        });
    }

    recordBatch(points, callback) {
      let pts;
      if (!this.client) {
        return callback(new Error("Not connected to InfluxDB"));
      }
      pts = points
        .map((point) => {
          let measurement;
          let pt;
          measurement = this.getMeasurement(point.id);
          if (!measurement) {
            return null;
          }
          if (!measurement.options.persist) {
            return null;
          }
          return (pt = {
            measurement: this.prepareId(point.id),
            timestamp: new Date(point.timestamp),
            fields: {
              value: point.value,
            },
          });
        })
        .filter(function (point) {
          let ref;
          if (!(point != null ? point.measurement : void 0)) {
            return false;
          }
          if (Number.isNaN(point != null ? ((ref = point.fields) != null ? ref.value : void 0) : void 0)) {
            return false;
          }
          return true;
        });
      return this.client
        .writePoints(pts)
        .then(function () {
          return callback();
        })
        .catch(function (e) {
          return callback(e);
        });
    }

    getMeasurement(key) {
      let dictionary;
      let i;
      let len;
      let ref;
      ref = this.config.dictionaries;
      for (i = 0, len = ref.length; i < len; i++) {
        dictionary = ref[i];
        if (!dictionary.measurements[key]) {
          continue;
        }
        return dictionary.measurements[key];
      }
      return null;
    }

    prepareId(key) {
      let id;
      let measurement;
      measurement = this.getMeasurement(key);
      if (measurement) {
        id = measurement.options.timeseries;
      } else {
        id = key;
      }
      id = id.replace(/\./g, "_");
      id = id.replace(/\//g, "_");
      return id;
    }

    query(id, start, end, callback) {
      let endString;
      let measurement;
      let query;
      let startString;
      if (!this.client) {
        return callback(new Error("Not connected to InfluxDB"));
      }
      measurement = this.getMeasurement(id);
      if (!measurement) {
        return callback(new Error(`Measurement ${id} not available`));
      }
      startString = new Date(start).toISOString();
      endString = new Date(end).toISOString();
      query = `select value from ${this.prepareId(
        id,
      )} where time > '${startString}' and time < '${endString}' order by time asc;`;
      return this.client
        .query(query)
        .then(function (result) {
          let points;
          points = result.map(function (r) {
            let res;
            return (res = {
              id,
              value: r.value,
              timestamp: new Date(r.time).getTime(),
            });
          });
          return callback(null, points);
        })
        .catch(function (e) {
          return callback(e);
        });
    }
  };

  module.exports = History;
}.call(this));

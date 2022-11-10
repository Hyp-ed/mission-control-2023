// @ts-nocheck
(function () {
  let Dictionary;

  Dictionary = class Dictionary {
    constructor(name1, key1, options1) {
      this.name = name1;
      this.key = key1;
      this.options = options1;
      this.measurements = {};
      if (!this.options) {
        this.options = {};
      }
      if (typeof this.options.announce !== "boolean") {
        this.options.announce = true;
      }
      if (!this.options.icon) {
        this.options.icon = "line-chart";
      }
      if (!this.options.description) {
        this.options.description = this.name;
      }
    }

    addMeasurement(name, key, values, options, callback) {
      if (typeof options === "function") {
        callback = options;
      }
      if (!options) {
        options = {};
      }
      if (typeof options.persist !== "boolean") {
        options.persist = true;
      }
      if (typeof options.hidden !== "boolean") {
        options.hidden = false;
      }
      if (!options.timeseries) {
        options.timeseries = key;
      }
      if (!options.topic) {
        options.topic = key;
      }
      if (values.length) {
        values[0].name = "Value";
        values[0].key = "value";
        values[0].hints = {
          range: 1,
        };
        if (values[0].format && !callback) {
          callback = this.formatToCallback(values[0].format);
        }
      }
      if (!callback) {
        callback = function (val) {
          return val;
        };
      }
      values.push({
        key: "utc",
        source: "timestamp",
        name: "Timestamp",
        format: "utc",
        hints: {
          domain: 1,
        },
      });
      return (this.measurements[key] = {
        name,
        key,
        values,
        callback,
        options,
      });
    }

    formatToCallback(format) {
      switch (format) {
        case "integer":
          return function (val) {
            return parseInt(val);
          };
        case "float":
          return function (val) {
            return parseFloat(val);
          };
        case "boolean":
          return function (val) {
            return String(val) === "true";
          };
        default:
          return function (val) {
            return val;
          };
      }
    }

    toJSON() {
      let def;
      let key;
      let ref;
      let val;
      def = {
        name: this.name,
        key: this.key,
        measurements: [],
      };
      ref = this.measurements;
      for (key in ref) {
        val = ref[key];
        def.measurements.push({
          name: val.name,
          key: val.key,
          values: val.values,
        });
      }
      return def;
    }
  };

  module.exports = Dictionary;
}.call(this));

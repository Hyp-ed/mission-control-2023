// @ts-nocheck
/* eslint-disable */

(function () {
  module.exports = {
    host: process.env.HOST || "localhost",
    port: process.env.PORT || 8080,
    wss_port: process.env.PORT || 8082,
    broker: process.env.MSGFLO_BROKER || "mqtt://localhost",
    dictionary: "./dictionary.json",
  };
}.call(this));

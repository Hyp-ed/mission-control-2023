// @ts-nocheck
/* eslint-disable */

(function () {
  let Server;
  let cbeam;
  let cors;
  let express;
  let history;
  let http;
  let main;
  let ws;

  cbeam = require("./cbeam");

  history = require("./history");

  express = require("express");

  cors = require("cors");

  http = require("http");

  ws = require("websocket");

  const path = require("path");

  Server = function () {
    class Server {
      constructor(config1) {
        this.config = config1;
        if (!this.config.theme) {
          this.config.theme = "Espresso";
        }
        if (!this.config.timeWindow) {
          this.config.timeWindow = 24 * 60 * 60 * 1000;
        }
        if (!this.config.persistence) {
          this.config.persistence = "openmct.plugins.LocalStorage()";
        }
        if (!this.config.openmctRoot) {
          this.config.openmctRoot = process.env.OPENMCT_ROOT || "node_modules/openmct/dist";
        }
        this.history = new history(this.config);
        this.app = express();
        this.app.use(express.static(path.join(__dirname, "../assets")));
        this.app.use(`/${this.config.openmctRoot}`, express.static(this.config.openmctRoot));
        this.app.set("views", path.join(__dirname, "../views"));
        this.app.set("view engine", "ejs");
        this.app.get("/", (req, res) => {
          return res.render("index", this.config);
        });
        this.app.get("/index.html", (req, res) => {
          return res.render("index", this.config);
        });
        this.app.get("/dictionary/:dict.json", (req, res) => {
          let dict;
          let i;
          let len;
          let ref;
          ref = this.config.dictionaries;
          for (i = 0, len = ref.length; i < len; i++) {
            dict = ref[i];
            if (dict.key === req.params.dict) {
              res.json(dict.toJSON());
              return;
            }
          }
          return res.status(404).end();
        });
        this.app.get("/telemetry/latest/:pointId", cors(), (req, res) => {
          let state;
          if (!this.history.getMeasurement(req.params.pointId)) {
            res.status(404).end();
            return;
          }
          if (req.query.timestamp) {
            res.json(cbeam.latestState(req.params.pointId));
            return;
          }
          state = cbeam.latestState(req.params.pointId);
          if (typeof (state != null ? state.value : void 0) !== "undefined") {
            res.json(state.value);
            return;
          }
          return res.json(null);
        });
        this.app.get("/telemetry/:pointId", cors(), (req, res) => {
          let end;
          let ids;
          let start;
          start = parseInt(req.query.start);
          end = parseInt(req.query.end);
          ids = req.params.pointId.split(",");
          this.history.query(ids[0], start, end, function (err, response) {
            if (err) {
              console.log(err);
              res.status(500).end();
              return;
            }
            return res.json(response);
          });
        });
      }

      start(callback) {
        this.wssServer = http.createServer(function (req, res) {
          res.writeHead(404);
          return res.end();
        });
        return this.wssServer.listen(this.config.wss_port, (err) => {
          this.wss = new ws.server({
            httpServer: this.wssServer,
            autoAcceptConnections: false,
          });
          return this.app.listen(this.config.port, (err) => {
            if (err) {
              return callback(err);
            }
            return cbeam.connect(this.config, (err, client) => {
              if (err) {
                return callback(err);
              }
              return this.history.connect((err) => {
                if (err) {
                  return callback(err);
                }
                this.cbeam = client;
                this.subscribe();
                cbeam.announce(this.cbeam, this.config.dictionaries, callback);
                return setInterval(() => {
                  return cbeam.announce(this.cbeam, this.config.dictionaries, function () {});
                }, 30000);
              });
            });
          });
        });
      }

      subscribe() {
        // Subscribe to all messages
        this.cbeam.subscribe("#");
        this.cbeam.on("message", (topic, msg) => {
          return cbeam.filterMessages(topic, msg, this.config.dictionaries, (points) => {
            let i;
            let len;
            let point;
            if (!points.length) {
              return;
            }
            for (i = 0, len = points.length; i < len; i++) {
              point = points[i];
              this.points.push(point);
              this.listeners.forEach(function (listener) {
                return listener(point);
              });
            }
            if (!this.chunkSaver) {
              return (this.chunkSaver = setTimeout(() => {
                let savePoints;
                savePoints = this.points.slice(0);
                this.history.recordBatch(savePoints, function (err) {
                  if (err) {
                    console.log(err);
                    // Save failed, put the failed data points back to the list
                    return (this.points = savePoints.concat(this.points));
                  }
                });
                this.points = [];
                return (this.chunkSaver = null);
              }, 10000));
            }
          });
        });
        return this.wss.on("request", (request) => {
          let socket;
          socket = request.accept(null, request.origin);
          return exports.handleConnection(this, socket);
        });
      }
    }

    Server.prototype.listeners = [];

    Server.prototype.points = [];

    Server.prototype.chunkSaver = null;

    return Server;
  }.call(this);

  exports.handleConnection = function (server, socket) {
    let handlers;
    let notify;
    let subscriptions;
    // Topics subscribed by this connection
    subscriptions = {};
    handlers = {
      subscribe(id) {
        return (subscriptions[id] = true);
      },
      unsubscribe(id) {
        return delete subscriptions[id];
      },
    };
    notify = function (msg) {
      let id;
      let results;
      let value;
      results = [];
      for (id in subscriptions) {
        value = subscriptions[id];
        if (msg.id !== id) {
          continue;
        }
        results.push(socket.sendUTF(JSON.stringify(msg)));
      }
      return results;
    };
    // Listen for requests
    socket.on("message", function (message) {
      let handler;
      let parts;
      parts = message.utf8Data.split(" ");
      handler = handlers[parts[0]];
      if (!handler) {
        console.log(`No handler for ${parts[0]}`);
        return;
      }
      return handler.apply(handlers, parts.slice(1));
    });
    // Remove subscription when connection closes
    socket.on("close", function () {
      return (server.listeners = server.listeners.filter(function (l) {
        return l !== notify;
      }));
    });
    socket.on("error", function () {
      return (server.listeners = server.listeners.filter(function (l) {
        return l !== notify;
      }));
    });
    // Register listener
    return server.listeners.push(notify);
  };

  main = function (config) {
    return exports.initialize(config, function (err, server) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log(`c-beam telemetry server running on port ${config.port}`);
      console.log(`c-beam telemetry provider running on port ${config.wss_port}`);
      return console.log(`Open c-beam telemetry server at http://${config.host}:${config.port}`);
    });
  };

  module.exports = Server;
}.call(this));

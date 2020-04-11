# c-beam telemetry server

This is a fork of [cbeam-telemetry-server](https://github.com/c-base/cbeam-telemetry-server), a server for connecting the NASA [OpenMCT](https://nasa.github.io/openmct/) with MQTT information sources. 

This fork uses a newer version of OpenMCT, which has a more refined UI. It also maps MQTT topics from the file `dict/dictionaries.json` and restarts the service when a file change is detected, allowing other services to modify the configuration.

In addition, mosquitto (the MQTT broker) is now configured to allow connections over WebSockets on port 9091 (along with 1883 for normal connections) and anonymous users now have read-only access. The mosquitto configuration is stored in the `mosquitto/` directory.

## Installation

I recommend using Docker, the following command will set-up the whole environment (might take awhile)

    sudo docker-compose up --build -d

## Problems

If you can't connect to OpenMCT on port 8080 then check the logs

    sudo docker logs cbeam-telemetry-server

You might see an error with connecting to InfluxDB (port 8086) or something about the dict file not being accessible. In both cases a restart should do the trick.

    sudo docker restart cbeam-telemetry-server

## Adding Data Sources

See the file `dict/dictionaries.json` for how to configure the MQTT mappings. Alternatively see the files under `config/` if you don't want to use a json file. Then you need to change `OPENMCT_CONFIG` in the compose file.

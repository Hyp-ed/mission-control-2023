FROM node:8

# Expose the HTTP port for OpenMCT
EXPOSE 8080
# Export the Websocket port for OpenMCT live telemetry
EXPOSE 8082

# Install inotify-tools. We use it in server.sh to restart the server on certain file changes
RUN apt-get update && apt-get install -y inotify-tools

# Reduce npm install verbosity, overflows Travis CI log view
ENV NPM_CONFIG_LOGLEVEL warn

RUN mkdir -p /var/cbeam-telemetry-server
WORKDIR /var/cbeam-telemetry-server

COPY . /var/cbeam-telemetry-server

# Install dependencies and build the OpenMCT package
RUN npm install
RUN npm run build

RUN cp -R node_modules/openmct/dist openmct

# Set OpenMCT location
ENV OPENMCT_ROOT openmct

CMD ./server.sh

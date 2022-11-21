FROM node:16

# Expose the HTTP port for OpenMCT
EXPOSE 8080
# Export the Websocket port for OpenMCT live telemetry
EXPOSE 8082

# Install inotify-tools. We use it in server.sh to restart the server on certain file changes
RUN apt-get update && apt-get install -y inotify-tools

RUN apt-get install -y git

# Reduce npm install verbosity, overflows Travis CI log view
ENV NPM_CONFIG_LOGLEVEL warn

RUN mkdir -p /var/app
WORKDIR /var/app

COPY . /var/app

# Install dependencies and build the OpenMCT package
RUN yarn
RUN yarn build

RUN cp -R node_modules/openmct/dist openmct

# Set OpenMCT location
ENV OPENMCT_ROOT openmct

CMD ./server.sh

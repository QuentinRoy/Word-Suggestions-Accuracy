
# Use multi-stage build, to get rid of the client's dependencies once it has
# been built.
FROM mhart/alpine-node:14.8.0 AS build-client
WORKDIR /app
COPY ./client/package.json ./client/package-lock.json ./
RUN npm install --production
COPY ./client/src ./src
COPY ./client/public ./public
ARG gitCommit
RUN REACT_APP_GIT_SHA=$gitCommit npm run build

# npm install may install cache stuff, separating the installation in its
# own stage should help getting rid of it.
FROM mhart/alpine-node:14.8.0 AS install-server
WORKDIR /app
COPY ./control-server .
RUN npm install --production
COPY --from=build-client /app/build/ ./static/

# The slim image does not even includes npm.
FROM mhart/alpine-node:slim-14.8.0
WORKDIR /app
COPY --from=install-server /app ./
# Ideally, we should create an unpriviledged user and avoid runing as root,
# but I already set up port mapping from port 80 and unpriviledged users cannot
# emit on 80.
EXPOSE 80
ENV STATIC_NOT_FOUND_FILE index.html
ENV SERVER_PORT 80
ENV DYNAMIC_ENDPOINTS true
ENV STATIC_FILES ./static
ENV CONTROL_SERVER_PORT ""
CMD ["node", "./index.js"]
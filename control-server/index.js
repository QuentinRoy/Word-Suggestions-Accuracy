import http from "http";
import WebSocket from "ws";
import log from "loglevel";
import dedent from "dedent";
import serveStatic from "node-static";
import { handleMessage, handleConnection, handleClose } from "./api.js";
import {
  DEFAULT_PONG_DURATION,
  DEFAULT_STATIC_FILES,
  DEFAULT_STATIC_NOT_FOUND_FILE,
} from "./constants.js";
import dotenv from "dotenv";
import Client from "./Client.js";
import { noop } from "./utils.js";

dotenv.config();

if (!process.env.SERVER_PORT || !process.env.MODERATOR_PASSWORD) {
  log.error(dedent`
    SERVER_PORT and CONTROLLER_PASSWORD environment variables are required.
    Consider creating a .env file (https://github.com/motdotla/dotenv).
  `);
  process.exit(1);
}

log.setDefaultLevel(
  process.env.LOG_LEVEL == null ? log.levels.INFO : process.env.LOG_LEVEL
);

const fileServer = new serveStatic.Server(
  process.env.STATIC_FILES == null
    ? DEFAULT_STATIC_FILES
    : process.env.STATIC_FILES
);
const server = http.createServer(function onRequest(request, response) {
  request
    .addListener("end", () => {
      fileServer.serve(request, response, (e) => {
        if (e && e.status === 404) {
          // If the file wasn't found
          fileServer.serveFile(
            process.env.STATIC_NOT_FOUND_FILE == null
              ? DEFAULT_STATIC_NOT_FOUND_FILE
              : process.env.STATIC_NOT_FOUND_FILE,
            404,
            {},
            request,
            response
          );
        }
      });
    })
    .resume();
});
const wss = new WebSocket.Server({ server });

const clients = new Map();
let context = { clients, moderatorPassword: process.env.MODERATOR_PASSWORD };

wss.on("connection", function connection(socket, request, client) {
  const clientEntry = Client({ socket, client, isAlive: true });
  log.info(`Client ${clientEntry.id} connected.`);
  clients.set(clientEntry.id, clientEntry);

  socket.on("message", (msg) => {
    log.debug(`Received message from ${clientEntry.id}: ${msg}`);
    handleMessage(msg, clientEntry, context);
  });

  socket.on("close", () => {
    clients.delete(clientEntry.id);
    handleClose(clientEntry, context);
    log.info(`Client ${clientEntry.id} disconnected.`);
  });

  handleConnection(clientEntry, context);
});

const interval = setInterval(
  function ping() {
    clients.forEach((c) => {
      if (c.isAlive === false) return c.socket.terminate();
      c.isAlive = false;

      const pong = () => {
        c.isAlive = true;
        c.socket.off("pong", pong);
      };
      c.socket.on("pong", pong);
      c.socket.ping(noop);
    });
  },
  process.env.PONG_DURATION == null
    ? DEFAULT_PONG_DURATION
    : process.env.PONG_DURATION
);

wss.on("close", () => {
  clearInterval(interval);
});

log.info(`Server listening on ${process.env.SERVER_PORT}`);
server.listen(process.env.SERVER_PORT);

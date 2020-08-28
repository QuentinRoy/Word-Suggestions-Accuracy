import http from "http";
import Koa from "koa";
import koaStatic from "koa-static";
import koaSend from "koa-send";
import WebSocket from "ws";
import log from "loglevel";
import terminus from "@godaddy/terminus";
import dedent from "dedent";
import { handleMessage, handleConnection, handleClose } from "./api.js";
import { DEFAULT_PONG_DURATION, DEFAULT_STATIC_FILES } from "./constants.js";
import dotenv from "dotenv";
import Client from "./Client.js";
import { noop } from "./utils.js";

dotenv.config();

if (!process.env.SERVER_PORT || !process.env.MODERATOR_PASSWORD) {
  log.error(dedent`
    SERVER_PORT and MODERATOR_PASSWORD environment variables are required.
    Consider creating a .env file (https://github.com/motdotla/dotenv).
  `);
  process.exit(1);
}

log.setDefaultLevel(
  process.env.LOG_LEVEL == null ? log.levels.INFO : process.env.LOG_LEVEL
);

const app = new Koa();

if (process.env.DYNAMIC_ENDPOINTS === "true") {
  app.use(async function serveEndpoints(ctx, next) {
    if ("/endpoints.json" == ctx.path) {
      ctx.body = {
        dynamic: "yep",
        suggestionServer: process.env.SUGGESTION_SERVER || undefined,
        suggestionServerPort:
          process.env.SUGGESTION_SERVER == null &&
          process.env.SUGGESTION_SERVER_PORT != null
            ? process.env.SUGGESTION_SERVER_PORT
            : undefined,
        controlServer: process.env.CONTROL_SERVER || undefined,
        controlServerPort:
          process.env.CONTROL_SERVER == null &&
          process.env.CONTROL_SERVER_PORT != null
            ? process.env.CONTROL_SERVER_PORT
            : undefined,
      };
    } else {
      await next();
    }
  });
}

const staticRoot =
  process.env.STATIC_FILES == null
    ? DEFAULT_STATIC_FILES
    : process.env.STATIC_FILES;

app.use(koaStatic(staticRoot));

if (process.env.STATIC_NOT_FOUND_FILE) {
  app.use(async (ctx) => {
    if (ctx.status === 404 && ctx.accepts("html")) {
      await koaSend(ctx, process.env.STATIC_NOT_FOUND_FILE, {
        root: staticRoot,
      });
    }
  });
}

const server = http.createServer(app.callback());
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

terminus.createTerminus(server);

server.listen(process.env.SERVER_PORT);

import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import morgan from "morgan";
import { Client, UmaClient } from "./lib/keycloak.js";
import Logger from "./lib/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// access log
app.use(morgan("combined"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// A normal un-protected public URL.
app.get("/", (req, res) => {
  res.render("index");
});

// Create a session-store to be used by both the express-session
const memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: "my-session-secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

// get client
let client = undefined;
const sleep = (second) => new Promise(resolve => setTimeout(resolve, second * 1000));
// waiting for connect keycloak
for (let i = 1; i < 20; i++){
  try {
    client = await Client.getClient();
    break;
  } catch(error){
    Logger.info("waiting to connect keycloak %d s  ", i);
    Logger.warn(error);
    await sleep(i);
  }
}
if (client == undefined) {
  throw new Error("Failed to connect keycloak");
}
app.set('keycloakClient', client)

const umaClient = await UmaClient.getClient();
app.set('keycloakUMAClient', umaClient)

// import router
import logoutRouter from "./routes/logout.js";
app.use("/logout", logoutRouter);

import callbackRouter from "./routes/callback.js";
app.use(client.Config.AppCallbackPath, callbackRouter);

import loginRouter from "./routes/login.js";
app.use("/login", loginRouter);

import homeRouter from "./routes/home.js";
app.use("/home", homeRouter);

import protectedRouter from "./routes/protected.js";
app.use("/protected/resource", protectedRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const server = app.listen(3000, function () {
  const host = server.address().address;
  const port = server.address().port;
  Logger.info("Example app listening at http://%s:%s", host, port);
});

export default app;

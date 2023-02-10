import express from "express";
const router = express.Router();

import { refreshToken } from "./refreshToken.js";
import { UserInfo } from "./userinfo.js";
import { GetTokenRender } from "../lib/renderUtil.js";
import Logger from "../lib/logger.js";

router.get(
  "/",
  (req, res, next) => {
    (async () => {
      const client = req.app.get('keycloakClient');
      // redirect login page, if acccess token is undefined
      if (req.session.accessToken == undefined) {
        res.redirect(client.Config.AppBaseUrl);
        return;
      }

      // token introspection
      const intro = await client.Client
        .introspect(req.session.accessToken)
        .then((result) => {
          return result;
        })
        .catch(function (error) {
          Logger.error(error);
          res.redirect(client.Config.AppBaseUrl);
        });

      // if access token is active, render home
      if (intro.active) {
        try {
          const uinfo = await UserInfo(client, req.session.accessToken);
          Logger.info(uinfo);
          next("route");
          return;
        } catch (error) {
          Logger.error(error);
          res.redirect(client.Config.AppBaseUrl);
          return;
        }
      }
      // if access token expired, token refresh
      next();
    })().catch(next);
  },
  refreshToken
);

const renderHome = (req, res) => {
  res.render("home", GetTokenRender(req.session));
};

router.get("/", renderHome);

export default router;

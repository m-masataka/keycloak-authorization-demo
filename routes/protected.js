import express from "express";
const router = express.Router();

import { GetTokenRender } from "../lib/renderUtil.js";
import { SetRPT } from "../lib/session.js";
import Logger from "../lib/logger.js";

const renderProtected = (req, res) => {
  res.render("protected", GetTokenRender(req.session));
};

router.get(
  "/",
  (req, res, next) => {
    const client = req.app.get("keycloakClient");
    const umaClient = req.app.get("keycloakUMAClient");
    (async () => {
      try {
        const rpt = await umaClient.getRPT(
          "protected01",
          req.session.accessToken
        );
        console.log(rpt);

        SetRPT(req.session, rpt);
        next();
      } catch (error) {
        Logger.error(error);
        res.redirect(client.Config.AppHomeUrl);
      }
    })().catch(next);
  },
  renderProtected
);

export default router;

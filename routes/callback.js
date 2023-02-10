import express from "express";
const router = express.Router();

import { SetToken } from "../lib/session.js";

// callback endpoint that handle oidc callback
router.get("/", (req, res) => {
  const client = req.app.get("keycloakClient");
  const params = client.Client.callbackParams(req);
  const codeVerifier = client.Config.CodeVerifier;
  client.Client.callback(client.Config.AppCallbackUrl, params, { codeVerifier })
    .then(function (token) {
      // Save tokens to session
      SetToken(req.session, token);
      res.redirect(client.Config.AppHomeUrl);
    })
    .catch(function (error) {
      console.log(error);
      res.redirect(client.Config.AppBaseUrl);
    });
});

export default router;

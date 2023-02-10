import express from "express";
const router = express.Router();

// logout
router.get("/", (req, res) => {
  const client = req.app.get("keycloakClient");
  const sessionEndUrl = client.Client.endSessionUrl({
    id_token_hint: req.session.idToken,
    client_id: client.Config.ClientId,
    post_logout_redirect_uri: client.Config.AppBaseUrl,
  });
  res.redirect(sessionEndUrl);
});

export default router;

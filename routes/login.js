import express from "express";
const router = express.Router();

// redirect keycloak login page
router.get("/", (req, res) => {
  const client = req.app.get("keycloakClient");
  res.redirect(client.Config.AuthorizationUrl);
});

export default router;

import { SetToken } from "../lib/session.js";
import { UserInfo } from "./userinfo.js";
import Logger from "../lib/logger.js";

// token refresh
export const refreshToken = (req, res, next) => {
  (async () => {
    const client = req.app.get('keycloakClient');
    Logger.info("Token refresh");
    const refresh = await client.Client
      .refresh(req.session.refreshToken)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        // redirect to base url, if failed to token refresh
        Logger.error(error);
        res.redirect(client.Config.AppBaseUrl);
      });

    // set token to session
    SetToken(req.session, refresh);
    try {
      const uinfo = await UserInfo(client, req.session.accessToken);
      Logger.info("User Info ", uinfo);
    } catch (error) {
      Logger.error(error);
      res.redirect(client.Config.AppBaseUrl);
    }
    next();
  })().catch(next);
};

import Logger from "../lib/logger.js";

// get userinfo
export const UserInfo = async (client, accessToken) => {
  return await client.Client
    .userinfo(accessToken)
    .then((result) => {
      return result;
    })
    .catch((error) => {
      Logger.error(error);
      throw error;
    });
};

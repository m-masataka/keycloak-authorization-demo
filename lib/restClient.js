import fetch from "node-fetch";
import Logger from "./logger.js";

export const Send = async (url, options) => {
  return await fetch(url, options)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(response.statusText);
      }
    })
    .then((result) => {
      return result;
    })
    .catch((err) => {
      Logger.error(err);
      throw err;
    });
};

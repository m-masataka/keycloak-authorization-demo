import dotenv from "dotenv";
import { Issuer, generators } from "openid-client";
import { Send } from "./restClient.js";
import Logger from "./logger.js";

dotenv.config();

const keyclaokClientId = process.env.KEYCLOAK_CLIENT_ID;
const keyclaokClientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
const keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL;
const keyclaokRealmUrl =
  keycloakBaseUrl + "/realms/" + process.env.KEYCLOAK_REALM;
const configUrl = keyclaokRealmUrl + "/.well-known/openid-configuration";
const umaConfigUrl = keyclaokRealmUrl + "/.well-known/uma2-configuration";
const appBaseUrl = process.env.APP_BASE_URL;
const appCallbackPath = "/callback";
const appLogoutPath = "/logout";
const appCallbackUrl = appBaseUrl + appCallbackPath;
const appHomeUrl = appBaseUrl + "/home";

export class Client{
  constructor(issuer, client) {
    // generate authorization URL
    const authorizationUrl = client.authorizationUrl({
      redirect_uri: appCallbackUrl,
      scope: "openid email profile",
    });

    // generate code verifier
    const codeVerifier = generators.codeVerifier();
    this._config = {
      ClientId: keyclaokClientId,
      KeyclaokRealmUrl: keyclaokRealmUrl,
      AppBaseUrl: appBaseUrl,
      AppHomeUrl: appHomeUrl,
      AppCallbackPath: appCallbackPath,
      AppCallbackUrl: appCallbackUrl,
      AuthorizationUrl: authorizationUrl,
      CodeVerifier: codeVerifier,
    };
    this._issuer = issuer;
    this._client = client;
  }

  get Config() {
    return this._config;
  }

  get Client() {
    return this._client;
  }

  static getClient = async () => {
    const keycloakIssuer = await Issuer.discover(configUrl);
    Logger.log("Discovered issuer %s", keycloakIssuer.issuer);
    Logger.debug("Discovered issuer metadata ", keycloakIssuer.metadata);

    // return new client
    const client = new keycloakIssuer.Client({
      client_id: keyclaokClientId,
      client_secret: keyclaokClientSecret,
      redirect_uris: [appCallbackUrl],
      response_types: ["code"],
    });

    return new Client(keycloakIssuer, client)
  }; 
}

export class UmaClient {
  constructor(issuer) {
    this._client_id = keyclaokClientId;
    this._client_secret = keyclaokClientSecret;
    this._issuer = issuer;
  }

  static async getClient() {
    const config = await Send(umaConfigUrl, { method: "GET" });
    return new UmaClient(config);
  }

  getAccessToken = async () => {
    const obj = {
      grant_type: "client_credentials",
      client_id: this._client_id,
      client_secret: this._client_secret,
    };
    const option = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: Object.keys(obj)
        .map((key) => key + "=" + obj[key])
        .join("&"),
    };
    return await Send(this._issuer.token_endpoint, option);
  };

  getResourceSet = async (pat) => {
    const option = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${pat}`,
      },
    };
    return await Send(this._issuer.resource_registration_endpoint, option);
  };

  getResource = async (pat, id) => {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${pat}`,
      },
    };
    return await Send(
      `${this._issuer.resource_registration_endpoint}/${id}`,
      options
    );
  };

  getRPT = async (id, accessToken) => {
    const obj = {
      grant_type: "urn:ietf:params:oauth:grant-type:uma-ticket",
      audience: this._client_id,
      permission: id,
      // response_mode: "decision"
    };
    const url = this._issuer.token_endpoint;
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: Object.keys(obj)
        .map((key) => key + "=" + obj[key])
        .join("&"),
    };
    return await Send(url, options);
  };
}

import jwt_decode from "jwt-decode";

export const GetTokenRender = (session) => {
  const decodedIdToken = jwt_decode(session.idToken);
  const decodedAccessToken = jwt_decode(session.accessToken);
  const decodedRPT = session.requestPartyToken
    ? jwt_decode(session.requestPartyToken)
    : undefined;

  return {
    idToken: session.idToken,
    decodedIdToken: decodedIdToken,
    accessToken: session.accessToken,
    decodedAccessToken: decodedAccessToken,
    refreshToken: session.refreshToken,
    requestPartyToken: session.requestPartyToken,
    decodedRPT: decodedRPT,
    requestPartyRefreshToken: session.requestPartyRefreshToken,
  };
};

// Set token to session
export const SetToken = (session, token) => {
  session.idToken = token.id_token;
  session.accessToken = token.access_token;
  session.refreshToken = token.refresh_token;
};

// Set rpt to session
export const SetRPT = (session, token) => {
  session.requestPartyToken = token.access_token;
  session.requestPartyRefreshToken = token.refresh_token;
};

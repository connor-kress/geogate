import { HTTP_PROTOCOL, WS_PROTOCOL, HOST, API_PORT, WS_PORT } from "@env";

export const config = {
  httpProtocol: HTTP_PROTOCOL,
  wsProtocol: WS_PROTOCOL,
  host: HOST,
  apiPort: API_PORT,
  wsPort: WS_PORT,
  apiBaseUrl: `${HTTP_PROTOCOL}://${HOST}:${API_PORT}`,
  wsBaseUrl: `${WS_PROTOCOL}://${HOST}:${WS_PORT}`,
};

console.log("Config loaded:", config);

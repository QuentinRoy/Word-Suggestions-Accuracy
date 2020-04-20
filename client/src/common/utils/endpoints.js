const defaultSuggestionServerPort = `8080`;
const defaultControlServerPort = `9090`;

const getEndPoint = (addressArg, portArg, defaultPort) => {
  if (addressArg != null) {
    return addressArg;
  }
  const wsProtocol = document.location.protocol === "https:" ? "wss:" : "ws:";
  if (portArg == null) {
    return `${wsProtocol}//${document.location.hostname}:${defaultPort}`;
  }
  if (portArg === "") {
    return `${wsProtocol}//${document.location.host}`;
  }
  return `${wsProtocol}//${document.location.hostname}:${portArg}`;
};

// Set this up outside the function so that it starts loading the end points as
// soon as a route that may need it is mounted (routes are lazy loaded).
const endpoints = fetch("endpoints.json", { cache: "no-cache" })
  .then((resp) => resp.json())
  .catch(() => ({}))
  .then((data) => ({
    suggestionServer: getEndPoint(
      data.suggestionServer,
      data.suggestionServerPort,
      defaultSuggestionServerPort
    ),
    controlServer: getEndPoint(
      data.controlServer,
      data.controlServerPort,
      defaultControlServerPort
    ),
  }));

export default function getEndPoints() {
  return endpoints;
}

import {
  defaultSuggestionServerAddress,
  defaultControlServerAddress,
} from "../constants";

// Set this up outside the function so that it starts loading the end points as
// soon as a route that may need it is mounted (routes are lazy loaded).
const endpoints = fetch("endpoints.json")
  .then((resp) => resp.json())
  .then((data) => ({
    suggestionServer: defaultSuggestionServerAddress,
    controlServer: defaultControlServerAddress,
    ...data,
  }));

export default function getEndPoints() {
  return endpoints;
}

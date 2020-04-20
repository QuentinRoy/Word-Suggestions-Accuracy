process.stdout.write(
  JSON.stringify({
    suggestionServer: process.env.SUGGESTION_SERVER || undefined,
    suggestionServerPort:
      process.env.SUGGESTION_SERVER == null &&
      process.env.SUGGESTION_SERVER_PORT != null
        ? process.env.SUGGESTION_SERVER_PORT
        : undefined,
    controlServer: process.env.CONTROL_SERVER || undefined,
    controlServerPort:
      process.env.CONTROL_SERVER == null &&
      process.env.CONTROL_SERVER_PORT != null
        ? process.env.CONTROL_SERVER_PORT
        : undefined,
  })
);

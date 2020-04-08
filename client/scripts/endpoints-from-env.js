process.stdout.write(
  JSON.stringify({
    suggestionServer: process.env.SUGGESTION_SERVER || undefined,
    controlServer: process.env.CONTROL_SERVER || undefined,
  })
);

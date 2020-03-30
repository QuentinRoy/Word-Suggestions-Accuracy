// eslint-disable-next-line import/no-extraneous-dependencies
const prettier = require("prettier");

module.exports = (plop) => {
  // create your generators here
  plop.setGenerator("component", {
    description: "creates a react component",
    prompts: [
      {
        type: "input",
        name: "directory",
        message: "component's directory",
      },
      {
        type: "input",
        name: "name",
        message: "component's name",
      },
    ], // array of inquirer prompts
    actions: [
      {
        type: "add",
        path: "src/{{directory}}/{{pascalCase name}}.js",
        templateFile: "plop-templates/component.hbs",
        transform: (data) => prettier.format(data, { parser: "babel" }),
      },
      {
        type: "add",
        path: "src/{{directory}}/{{pascalCase name}}.module.scss",
      },
    ], // array of actions
  });
};

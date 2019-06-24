export default {
  participant: "yo",
  children: [
    {
      task: "ConsentForm",
      letter: `
# Consent Letter

You are about to complete a human-computer interaction experiment. This experiment follows the corresponding ORE procedure...
`,
      questions: [
        {
          label: "I consent to my data being collected in this experiment",
          required: true
        }
      ]
    },
    {
      task: "App",
      text: "hello world"
    },
    {
      task: "App",
      text: "it is not sunny today"
    },
    {
      task: "App",
      text: "This experiment is awesome"
    }
  ]
};

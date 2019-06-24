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
      ],
      key: 0
    },
    {
      task: "App",
      text: "hello world",
      key: 1
    },
    {
      task: "App",
      text: "it is not sunny today",
      key: 2
    },
    {
      task: "App",
      text: "This experiment is awesome",
      key: 3
    }
  ]
};

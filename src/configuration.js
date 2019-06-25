export default {
  participant: "yo",
  children: [
    /*{
      task: "InformationScreen",
      centerX: true,
      centerY: true,
      content: "Word completion accuracy experiment",
      shortcutEnabled: true,
      key: 0
    },
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
      key: 1
    },*/
    {
      task: "App",
      text: "hello world",
      key: 2
    },
    {
      task: "App",
      text: "it is sunny today",
      key: 3
    } /*,
    {
      task: "App",
      text: "This experiment is awesome",
      key: 4
    }*/
  ]
};

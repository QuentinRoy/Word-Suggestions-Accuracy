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
      task: "KeyboardSelector",
      key: 2
    },
    {
      task: "App",
      text: "hello world",
      accuracy: 100,
      key: 3
    },
    {
      task: "App",
      text: "it is puzzlingly today",
      accuracy: 50,
      key: 4
    },
    {
      task: "App",
      text: "This experiment is awesome",
      accuracy: 0,
      key: 5
    }
  ]
};

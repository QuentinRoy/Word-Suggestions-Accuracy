export default {
  participant: "yo",
  children: [
    /*{
      task: "InformationScreen",
      centerX: true,
      centerY: true,
      content: "Word completion accuracy experiment",
      shortcutEnabled: true,
      key:0
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
      ]
    },*/
    {
      task: "KeyboardSelector",
      key: 0
    },
    /*{
      task: "InformationScreen",
      content: "The 5 following tasks are practice tasks",
      shortcutEnabled: true,
      key: 0
    },*/
    {
      task: "App",
      accuracy: 100,
      key: 1
    },
    {
      task: "App",
      accuracy: 50,
      key: 2
    },
    {
      task: "App",
      accuracy: 0,
      key: 3
    },
    {
      task: "App",
      accuracy: 100,
      key: 4
    },
    {
      task: "App",
      accuracy: 50,
      key: 5
    } /*
    {
      task: "DisplayTextTask",
      content: "Practice is over, the real experiment begins here",
      key: 0
    },*/,
    {
      task: "App",
      accuracy: 100,
      key: 6
    },
    {
      task: "App",
      accuracy: 50,
      key: 7
    },
    {
      task: "App",
      accuracy: 0,
      key: 8
    },
    {
      task: "App",
      accuracy: 100,
      key: 9
    },
    {
      task: "App",
      accuracy: 50,
      key: 10
    },
    {
      task: "App",
      accuracy: 100,
      key: 11
    },
    {
      task: "App",
      accuracy: 50,
      key: 12
    },
    {
      task: "App",
      accuracy: 0,
      key: 13
    },
    {
      task: "App",
      accuracy: 100,
      key: 14
    },
    {
      task: "App",
      accuracy: 50,
      key: 15
    }
  ]
};

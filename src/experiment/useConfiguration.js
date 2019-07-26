import useCorpusFromJson, {
  LOADED,
  LOADING,
  CRASHED,
  accuracies
} from "../utils/useCorpusFromJson";

const useConfiguration = (numberOfTypingTask = 1) => {
  const [corpusLoadingState, corpus] = useCorpusFromJson();

  const config = {
    participant: "",
    children: [
      {
        task: "LoginScreen",
        key: 0
      },
      /*{
        task: "InformationScreen",
        centerX: true,
        centerY: true,
        content: "Word completion accuracy experiment",
        shortcutEnabled: true,
        key: 1
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
        key: 2
      },*/
      {
        task: "KeyboardSelector",
        key: 3
      },
      {
        task: "InformationScreen",
        content: "The 5 following tasks are practice tasks",
        shortcutEnabled: true,
        key: 4
      }
    ]
  };

  switch (corpusLoadingState) {
    case LOADED:
      for (let i = 0; i < numberOfTypingTask; i += 1) {
        const id = i <= 5 ? 5 + i : 6 + i;
        const taskAcc =
          accuracies[Math.floor(Math.random() * accuracies.length)];
        console.log(taskAcc);
        const taskText = corpus[accuracies.indexOf(taskAcc)][
          Math.floor(Math.random() * corpus.length)
        ].words
          .map(e => e.word)
          .join(" ");

        config.children.push({
          task: "TypingTask",
          text: taskText,
          accuracy: taskAcc / 100,
          key: id,
          id
        });

        corpus[accuracies.indexOf(taskAcc)].splice(corpus.indexOf(taskText), 1);

        if (i === 5) {
          config.children.push({
            task: "InformationScreen",
            content: "Practice is over, the real experiment begins here",
            key: 10
          });
        }
      }
      console.log(config);
      return [LOADED, config];
    case LOADING:
      return [LOADING, null];
    default:
      return [CRASHED, null];
  }
};

export default useConfiguration;

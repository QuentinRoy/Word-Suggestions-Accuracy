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
    isDelayOn: false,
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
        const id = i <= 4 ? 5 + i : 6 + i;
        const taskAcc =
          accuracies[Math.floor(Math.random() * accuracies.length)];
        const taskText = corpus[accuracies.indexOf(taskAcc)][
          Math.floor(Math.random() * corpus[accuracies.indexOf(taskAcc)].length)
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

        for (let corpusID = 0; corpusID < corpus.length; corpusID += 1) {
          corpus[corpusID].splice(corpus.indexOf(taskText), 1);
        }

        if (i === 4) {
          config.children.push({
            task: "InformationScreen",
            content: "Practice is over, the real experiment begins here",
            key: 10
          });
        }
      }
      return [LOADED, config];
    case LOADING:
      return [LOADING, null];
    default:
      return [CRASHED, null];
  }
};

export default useConfiguration;

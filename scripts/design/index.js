const fs = require("fs-extra");
const path = require("path");
const lodash = require("lodash");
const log = require("loglevel");
const { balancedLatinSquare } = require("./ordering");

log.setDefaultLevel(log.levels.DEBUG);

const numberOfPracticeTasks = 3;
const numberOfTypingTasks = 20;
const minParticipants = 30;
const accuracyValues = [0.1, 0.5, 0.9];
const devices = ["phone", "laptop", "tablet"];
const publicDir = path.join(__dirname, "../../public");
const sksDistributionsDir = path.join(publicDir, "sks-distributions");
const outputDir = path.join(publicDir, "configs");

const getSksDistributionPath = accuracy =>
  path.join(sksDistributionsDir, `acc-${accuracy.toFixed(3)}.json`);

const getRunOutputPath = (participant, device) =>
  path.join(outputDir, `${participant}-${device}.json`);

const createParticipantId = participantNumber => `S${participantNumber}`;

const createInitBlock = ({ firstDevice, uploadFile }) => {
  const children = [
    { task: "ConsentForm", key: `init-consent` },
    { task: "Startup", key: `init-startup` },
    { task: "StartQuestionnaire", key: `init-start-questionnaire` },
    { task: "S3Upload", filename: uploadFile, key: `init-upload` }
  ];
  if (firstDevice !== "laptop") {
    children.push({
      task: "InformationScreen",
      content: `Now switch to the ${firstDevice}.`
    });
  }
  return { device: "laptop", children };
};

const createTypingBlock = ({
  device,
  nextDevice = "laptop",
  uploadFile,
  phrases,
  practicePhrases
}) => {
  const children = [
    {
      task: "InformationScreen",
      content: `<h1>Typing on ${device}</h1><p>Let's start with a short tutorial</p>`,
      key: `typing-${device}-info-start`
    },
    {
      task: "Tutorial",
      isPractice: true,
      key: `typing-${device}-tuto`,
      id: `typing-${device}-tuto`
    },
    {
      task: "InformationScreen",
      content: "<h1>Practice</h1><p>Continue with the practice tasks.</p>",
      key: `typing-${device}-info-practice-start`
    },
    // Insert practice trials.
    ...practicePhrases.map(({ words, ...props }, i) => ({
      ...props,
      task: "TypingTask",
      sksDistribution: words,
      isPractice: true,
      id: `typing-${device}-practice-${i}`,
      key: `typing-${device}-practice-${i}`
    })),
    {
      task: "InformationScreen",
      content: `
      <h1>Experiment</h1>
      <p>
        Practice is over.
        You may take a break.
        The real experiment begins immediately after this screen!
      </p>
      <p>
        Remember to complete every task as fast and accurately as you can.
      </p>
    `,
      key: `typing-${device}-info-typing-start`
    },
    // Insert measured trials.
    ...phrases.map(({ words, ...props }, i) => ({
      ...props,
      task: "TypingTask",
      sksDistribution: words,
      id: `typing-${device}-phrase-${i}`,
      key: `typing-${device}-phrase-${i}`
    })),
    { task: "BlockQuestionnaire" },
    { task: "S3Upload", filename: uploadFile, key: `init-upload` }
  ];
  if (nextDevice !== device) {
    children.push({
      task: "InformationScreen",
      content: `Now switch to the ${nextDevice}.`,
      key: `typing-${device}-info-typing-end`
    });
  }
  return { device, children };
};

const createTypingBlocks = async ({ deviceOrder, accuracy, uploadFiles }) => {
  const corpusPath = getSksDistributionPath(accuracy);
  const corpusFile = await fs.readFile(corpusPath);
  const corpus = lodash.shuffle(JSON.parse(corpusFile.toString()).rows);
  return deviceOrder.map((device, i) => {
    const corpusStart = i * (numberOfPracticeTasks + numberOfTypingTasks);
    return createTypingBlock({
      device,
      nextDevice: deviceOrder[i + 1],
      uploadFile: uploadFiles[device],
      practicePhrases: corpus.slice(
        corpusStart,
        corpusStart + numberOfPracticeTasks
      ),
      phrases: corpus.slice(
        corpusStart + numberOfPracticeTasks,
        corpusStart + numberOfPracticeTasks + numberOfTypingTasks
      )
    });
  });
};

const createFinalBlock = ({ uploadFile }) => ({
  device: "laptop",
  children: [
    { task: "EndQuestionnaire", key: `final-questionnaire` },
    { task: "FinalFeedbacks", key: `final-feedbacks` },
    { task: "InjectEnd", key: `final-inject-end` },
    { task: "S3Upload", key: `final-upload`, filename: uploadFile },
    { task: "EndExperiment", key: `final-end` }
  ]
});

const createRun = async ({ accuracy, deviceOrder, participant }) => {
  const uploadFiles = {
    laptop: `${participant}-laptop.json`,
    phone: `${participant}-phone.json`,
    tablet: `${participant}-tablet.json`
  };
  return {
    participant,
    deviceOrder,
    targetAccuracy: accuracy,
    keyStrokeDelay: 0,
    totalSuggestions: 3,
    suggestionsType: "BAR",
    numberOfPracticeTasks,
    numberOfTypingTasks,
    wave: "multi-device",
    children: [
      await createInitBlock({
        firstDevice: deviceOrder[0],
        uploadFile: uploadFiles.laptop
      }),
      ...(await createTypingBlocks({ deviceOrder, accuracy, uploadFiles })),
      await createFinalBlock({ uploadFile: uploadFiles.laptop })
    ]
  };
};

const createDesign = async () => {
  try {
    await fs.mkdir(outputDir);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  const deviceOrders = balancedLatinSquare(devices);
  let totalParticipant = 0;
  const promises = [];
  while (totalParticipant < minParticipants) {
    // eslint-disable-next-line no-restricted-syntax
    for (const accuracy of accuracyValues) {
      // eslint-disable-next-line no-restricted-syntax
      for (const deviceOrder of deviceOrders) {
        const pid = createParticipantId(totalParticipant + 1);
        promises.push(
          createRun({
            accuracy,
            deviceOrder,
            participant: pid
          }).then(run => {
            // Split the run into three different files, one for each device.
            // Each of these config files contain only the tasks specific
            // to that device.
            return Promise.all(
              ["laptop", "phone", "tablet"].map(async device => {
                await fs.writeFile(
                  getRunOutputPath(pid, device),
                  JSON.stringify({
                    ...run,
                    device,
                    children: run.children
                      .filter(child => child.device === device)
                      .map(({ device: _, ...child }) => child)
                  })
                );
                log.info(`${pid} written.`);
              })
            );
          })
        );
        totalParticipant += 1;
      }
    }
  }
  return Promise.all(promises);
};

createDesign().catch(log.error);

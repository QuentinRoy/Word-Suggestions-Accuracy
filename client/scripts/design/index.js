const fs = require("fs-extra");
const path = require("path");
const lodash = require("lodash");
const log = require("loglevel");
const { v4: uuidv4 } = require("uuid");
// eslint-disable-next-line import/no-extraneous-dependencies
const htmlMinifier = require("html-minifier");
const { exec } = require("child_process");
const { balancedLatinSquare } = require("./ordering");
const pkgInfo = require("../../package.json");

log.setDefaultLevel(log.levels.DEBUG);

const numberOfPracticeTasks = 3;
const minSuggestionsDelay = 150;
const numberOfTypingTasks = 20;
const minParticipants = 30;
const accuracyValues = [0.1, 0.5, 0.9];
const devices = ["phone", "laptop", "tablet"];
const doNotShowDelayInstructions = true;
const publicDir = path.join(__dirname, "../../public");
const dataDir = path.join(__dirname, "../../data");
const sksDistributionsDir = path.join(dataDir, "sks-distributions");
const outputDir = path.join(publicDir, "configs");

const getSksDistributionPath = (accuracy) =>
  path.join(sksDistributionsDir, `acc-${accuracy.toFixed(3)}.json`);

const getRunOutputPath = (config, device) =>
  path.join(outputDir, `${config}-${device}.json`);

const createConfigurationId = (configNumber) => `C${configNumber}`;
const createRunUuid = uuidv4;
const createConfigurationUuid = uuidv4;

const minify = (str, opts = {}) => {
  return htmlMinifier.minify(str, {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    conservativeCollapse: true,
    collapseWhitespace: true,
    keepClosingSlash: true,
    ...opts,
  });
};

const createInitBlock = ({ firstDevice }) => {
  const children = [
    { task: "Startup", key: `init-startup` },
    { task: "DemographicQuestionnaire", key: `init-demographic-questionnaire` },
    {
      task: "InformationScreen",
      content: minify(
        `Let's start with a short tutorial demonstrating your task.`
      ),
      key: `info-tuto`,
    },
    {
      task: "Tutorial",
      isPractice: true,
      isVirtualKeyboardEnabled: false,
      key: `tuto`,
      id: `tuto`,
    },
    { task: "S3Upload", key: `init-upload` },
  ];
  if (firstDevice !== "laptop") {
    children.push({
      task: "SwitchDevice",
      nextDevice: firstDevice,
      isCurrentDeviceDone: false,
      key: `first-switch`,
    });
  }
  return { device: "laptop", children };
};

const TypingInfo = ({ device }) => {
  switch (device) {
    case "laptop":
      return {
        task: "InformationScreen",
        content: minify(`
          <h1>Typing on ${device}: Practice</h1>
          <p>You may use the keys 1, 2, and 3 to accept suggestions.</p>
        `),
        key: `typing-${device}-info-practice-start`,
      };
    case "tablet":
      return {
        task: "InformationScreen",
        content: minify(`
          <h1>Typing on ${device}: Practice</h1>
          <p>Lay your tablet flat on a table. Orient it in <strong>landscape</strong> position.</p>
          <p>You may tap on a suggestion to accept it.</p>
        `),
        key: `typing-${device}-info-practice-start`,
      };
    case "phone":
      return {
        task: "InformationScreen",
        content: minify(`
          <h1>Typing on ${device}: Practice</h1>
          <p>
            Hold your phone <strong>with only one hand</strong>.
            Do not use your second hand during the typing tasks.
          </p>
          <p>You may tap on a suggestion to accept it.</p>
        `),
        key: `typing-${device}-info-practice-start`,
      };
    default:
      throw new Error(`Unknown device: ${device}`);
  }
};

const createTypingBlock = ({
  device,
  nextDevice = "laptop",
  phrases,
  practicePhrases,
  isDoneAfter = false,
}) => {
  const children = [
    TypingInfo({ device }),
    // Insert practice trials.
    ...practicePhrases.map(({ words, ...props }, i) => ({
      ...props,
      task: "TypingTask",
      sksDistribution: words,
      isPractice: true,
      id: `typing-${device}-practice-${i}`,
      key: `typing-${device}-practice-${i}`,
    })),
    {
      task: "InformationScreen",
      content: minify(`
        <h1>Experiment</h1>
        <p>
          Practice is over.
          You may take a break.
          The real experiment begins immediately after this screen!
        </p>
        <p>
          Remember to complete every task as fast and accurately as you can.
        </p>
      `),
      key: `typing-${device}-info-typing-start`,
    },
    // Insert measured trials.
    ...phrases.map(({ words, ...props }, i) => ({
      ...props,
      task: "TypingTask",
      isPractice: false,
      sksDistribution: words,
      id: `typing-${device}-phrase-${i}`,
      key: `typing-${device}-phrase-${i}`,
    })),
    { task: "BlockQuestionnaire", key: `typing-questionnaire-${device}` },
    { task: "S3Upload", key: `typing-upload-${device}` },
  ];
  if (isDoneAfter) {
    children.push({ task: "InjectEnd", key: `final-inject-end` });
  }
  children.push({
    task: "SwitchDevice",
    nextDevice,
    isCurrentDeviceDone: isDoneAfter,
    key: `typing-${device}-switch-device`,
  });
  return {
    device,
    children,
    isVirtualKeyboardEnabled: device === "phone" || device === "tablet",
  };
};

const createTypingBlocks = async ({ deviceOrder, accuracy }) => {
  const corpusPath = getSksDistributionPath(accuracy);
  const corpusFile = await fs.readFile(corpusPath);
  const corpus = lodash.shuffle(JSON.parse(corpusFile.toString()).rows);
  return deviceOrder.map((device, i) => {
    const corpusStart = i * (numberOfPracticeTasks + numberOfTypingTasks);
    return createTypingBlock({
      device,
      nextDevice: deviceOrder[i + 1],
      practicePhrases: corpus.slice(
        corpusStart,
        corpusStart + numberOfPracticeTasks
      ),
      phrases: corpus.slice(
        corpusStart + numberOfPracticeTasks,
        corpusStart + numberOfPracticeTasks + numberOfTypingTasks
      ),
      isDoneAfter: device !== "laptop",
    });
  });
};

const createFinalBlock = () => ({
  device: "laptop",
  children: [
    { task: "FinalFeedbacks", key: `final-feedbacks` },
    { task: "InjectEnd", key: `final-inject-end` },
    { task: "S3Upload", key: `final-upload` },
    { task: "EndExperiment", key: `final-end` },
  ],
});

// Putting this here to avoid requesting for every run.
const gitShaPromise = new Promise((resolve, reject) => {
  exec("git rev-parse --short HEAD", (err, stdout) => {
    if (err != null) reject(err);
    else resolve(stdout.trim());
  });
}).catch(() => "");

const createRun = async ({ accuracy, deviceOrder, configId }) => {
  return {
    config: configId,
    configUuid: createConfigurationUuid(),
    configGenerationDate: new Date(),
    configGenerationGitSha: await gitShaPromise,
    configGenerationVersion: pkgInfo.version,
    deviceOrder,
    minSuggestionsDelay,
    targetAccuracy: accuracy,
    keyStrokeDelay: 0,
    totalSuggestions: 3,
    suggestionsType: "BAR",
    numberOfPracticeTasks,
    numberOfTypingTasks,
    doNotShowDelayInstructions,
    wave: "multi-device",
    children: [
      await createInitBlock({ firstDevice: deviceOrder[0] }),
      ...(await createTypingBlocks({ deviceOrder, accuracy })),
      await createFinalBlock(),
    ],
  };
};

const splitRun = (run) =>
  Promise.all(
    ["laptop", "phone", "tablet"].map(async (device) => ({
      ...run,
      device,
      runUuid: createRunUuid(),
      children: run.children
        .filter((child) => child.device === device)
        .map((child) => lodash.omit(child, "device")),
    }))
  );

const createDesign = async () => {
  try {
    await fs.mkdir(outputDir);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  const deviceOrders = balancedLatinSquare(devices);
  let totalConfig = 0;
  const promises = [];
  while (totalConfig < minParticipants) {
    // eslint-disable-next-line no-restricted-syntax
    for (const accuracy of accuracyValues) {
      // eslint-disable-next-line no-restricted-syntax
      for (const deviceOrder of deviceOrders) {
        const cid = createConfigurationId(totalConfig + 1);
        promises.push(
          createRun({ accuracy, deviceOrder, configId: cid })
            .then(splitRun)
            .then((runs) =>
              // Split the run into three different files, one for each device.
              // Each of these config files contain only the tasks specific
              // to that device.
              Promise.all(
                runs.map((run) =>
                  fs.writeFile(
                    getRunOutputPath(cid, run.device),
                    JSON.stringify(run)
                  )
                )
              )
            )
            .then(() => {
              log.info(`${cid} written.`);
            })
        );
        totalConfig += 1;
      }
    }
  }
  return Promise.all(promises);
};

createDesign().catch(log.error);

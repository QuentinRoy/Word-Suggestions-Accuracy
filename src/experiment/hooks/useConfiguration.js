import { useRef } from "react";
import last from "lodash/last";
import { LoadingStates } from "../../utils/constants";
import getTimeZone from "../../utils/getTimeZone";
import useJSON from "../../utils/useJson";

const timeZone = getTimeZone();

const loadingTime = new Date();

const udpateUploadAddress = oldAddress => {
  const addrParts = oldAddress.split(".");
  return [
    ...addrParts.slice(0, -1),
    loadingTime.toISOString().replace(/:/g, "_"),
    last(addrParts)
  ].join(".");
};

// This adds this module's loading time just before the extension of the upload
// files.
const changeAllUploadAddresses = taskGroup => {
  let newTaskGroup = taskGroup;
  if (newTaskGroup.task === "S3Upload" && newTaskGroup.filename != null) {
    newTaskGroup = {
      ...newTaskGroup,
      filename: udpateUploadAddress(newTaskGroup.filename)
    };
  }
  if (newTaskGroup.S3Upload != null && newTaskGroup.S3Upload.filename != null) {
    newTaskGroup = {
      ...newTaskGroup,
      S3Upload: {
        ...newTaskGroup.S3Upload,
        filename: udpateUploadAddress(newTaskGroup.S3Upload.filename)
      }
    };
  }
  if (newTaskGroup.children != null) {
    newTaskGroup.children = newTaskGroup.children.map(changeAllUploadAddresses);
  }
  return newTaskGroup;
};

const useConfiguration = ({ participant, device, isTest }) => {
  const { current: startDate } = useRef(new Date());

  // In the case there are missing information, providing a null URL to useJson
  // will prevent any loading attempt.
  const [loadingState, baseConfig] = useJSON(
    participant == null || device == null
      ? null
      : `./configs/${participant}-${device}.json`
  );

  if (participant == null || device == null) {
    return [LoadingStates.invalidArguments, null];
  }
  if (loadingState !== LoadingStates.loaded) {
    return [loadingState, null];
  }
  return [
    loadingState,
    {
      ...changeAllUploadAddresses(baseConfig),
      isTest,
      mode: process.env.NODE_ENV,
      gitSha: process.env.REACT_APP_GIT_SHA,
      version: process.env.REACT_APP_VERSION,
      href: window.location.href,
      userAgent: navigator.userAgent,
      isExperimentCompleted: false,
      isVirtualKeyboardEnabled: device === "phone" || device === "tablet",
      startDate,
      // This is not much useful since the last experiment is run locally,
      // but I left it here for the sake of consistency.
      timeZone
    }
  ];
};

export default useConfiguration;

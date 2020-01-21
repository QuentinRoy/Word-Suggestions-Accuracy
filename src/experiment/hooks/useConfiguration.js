import { useRef } from "react";
import { LoadingStates } from "../../utils/constants";
import getTimeZone from "../../utils/getTimeZone";
import useJSON from "../../utils/useJson";

const timeZone = getTimeZone();

const useConfiguration = ({ participant, device, isTest, config }) => {
  const areArgsIncomplete =
    participant == null || device == null || config == null || isTest == null;

  const { current: startDate } = useRef(new Date());
  // In the case there are missing information, providing a null URL to useJson
  // will prevent any loading attempt.
  const [loadingState, baseConfig] = useJSON(
    areArgsIncomplete ? null : `./configs/${config}-${device}.json`
  );

  if (areArgsIncomplete) {
    return [LoadingStates.invalidArguments, null];
  }
  if (loadingState !== LoadingStates.loaded) {
    return [loadingState, null];
  }
  return [
    loadingState,
    {
      ...baseConfig,
      isTest,
      mode: process.env.NODE_ENV,
      gitSha: process.env.REACT_APP_GIT_SHA,
      version: process.env.REACT_APP_VERSION,
      href: window.location.href,
      userAgent: navigator.userAgent,
      isExperimentCompleted: false,
      startDate,
      // This is not much useful since the last experiment is run locally,
      // but I left it here for the sake of consistency.
      timeZone,
      S3Upload: {
        filename:
          process.env.NODE_ENV === "development"
            ? `dev/${participant}-${device}-${startDate.toISOString()}.json`
            : `prod/${participant}-${device}-${startDate.toISOString()}.json`
      }
    }
  ];
};

export default useConfiguration;

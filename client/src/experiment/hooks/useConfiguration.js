import { useRef } from "react";
import { ReadyStates, TaskTypes } from "../../common/constants";
import getTimeZone from "../../common/utils/getTimeZone";
import useJSON from "../../common/hooks/useJson";

const timeZone = getTimeZone();
const timeZoneOffset = new Date().getTimezoneOffset();

const useConfiguration = ({ participant, device, isTest, config }) => {
  const areArgsIncomplete =
    participant == null || device == null || config == null || isTest == null;

  const { current: startDate } = useRef(new Date());
  // In the case there are missing information, providing a null URL to useJson
  // will prevent any loading attempt.
  const [loadingState, baseConfig, error] = useJSON(
    areArgsIncomplete ? null : `./configs/${config}-${device}.json`
  );

  if (areArgsIncomplete) {
    return [ReadyStates.crashed, null, new Error(`Invalid arguments`)];
  }
  if (loadingState === ReadyStates.crashed) {
    return [loadingState, null, error];
  }
  if (loadingState !== ReadyStates.ready) {
    return [loadingState, null, null];
  }
  return [
    loadingState,
    {
      ...baseConfig,
      participant,
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
      timeZoneOffset,
      [TaskTypes.s3Upload]: {
        filename:
          process.env.NODE_ENV === "development"
            ? `dev/${participant}-${device}-${startDate.toISOString()}.json`
            : `prod/${participant}-${device}-${startDate.toISOString()}.json`,
      },
    },
    null,
  ];
};

export default useConfiguration;

import { useMemo } from "react";
import useWebsocket from "../common/hooks/useWebsocket";
import { MessageTypes, UserRoles, LoadingStates } from "../common/constants";
import useAsync from "../common/hooks/useAsync";
import getEndPoints from "../common/utils/endpoints";
import mergeLoadingStates from "../common/utils/mergeLoadingStates";

const useControlClient = ({ onCommand } = {}) => {
  const [endPointsState, endpoints] = useAsync(getEndPoints);

  const onMessage = (message) => {
    switch (message.type) {
      case MessageTypes.command:
        return onCommand(message.command, message.args);
      default:
        throw new Error(`Received unexpected message: ${message.type}`);
    }
  };

  const [socketState, send] = useWebsocket(
    endPointsState === LoadingStates.loaded ? endpoints.controlServer : null,
    { onMessage }
  );

  const mergedState = mergeLoadingStates(endPointsState, socketState);

  return useMemo(
    () => ({
      state: mergedState,
      setInfo: (info) =>
        send({
          type: MessageTypes.register,
          role: UserRoles.participant,
          info,
        }),
      clearInfo: () => send({ type: MessageTypes.unregister }),
    }),
    [mergedState, send]
  );
};

export default useControlClient;

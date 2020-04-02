import { useMemo } from "react";
import useWebsocket from "../common/hooks/useWebsocket";
import { MessageTypes, UserRoles } from "../common/constants";

const useControlClient = (url, { onCommand } = {}) => {
  const onMessage = (message) => {
    switch (message.type) {
      case MessageTypes.command:
        return onCommand(message.command, message.args);
      default:
        throw new Error(`Received unexpected message: ${message.type}`);
    }
  };

  const [state, send] = useWebsocket(url, { onMessage });

  return useMemo(
    () => ({
      state,
      setInfo: (info) =>
        send({
          type: MessageTypes.register,
          role: UserRoles.participant,
          info,
        }),
      clearInfo: () => send({ type: MessageTypes.unregister }),
    }),
    [state, send]
  );
};

export default useControlClient;

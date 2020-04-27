import React, { useMemo, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { stringify } from "qs";
import omit from "lodash/omit";
import { Paths, ReadyStates, UserRoles } from "../common/constants";
import Area from "../common/components/Area";
import useBodyBackgroundColor from "../common/hooks/useBodyBackgroundColor";
import ValidWaitingRoom from "./ValidWaitingRoom";
import { ClientInfoProvider } from "./ClientInfo";
import getEndPoints from "../common/utils/endpoints";
import useAsync from "../common/hooks/useAsync";
import Loading from "../common/components/Loading";
import Crashed from "../common/components/Crashed";
import { ModerationProvider } from "../common/moderation/Moderation";
import style from "./WaitingRoom.module.css";

// eslint-disable-next-line react/prop-types
function Wrapper({ children }) {
  return (
    <div className={style.wrapper}>
      <Area>
        <h1>Waiting Room</h1>
        {children}
      </Area>
    </div>
  );
}

const Controller = (history) => (command, args) => {
  switch (command) {
    case "start-app":
      // Doing this asynchronously so we have the time to answer.
      setTimeout(() => {
        history.push({
          pathname: args.app,
          search: `?${stringify(omit(args, "app"))}`,
        });
      });
      break;
    default:
      throw new Error(`Unsupported command: ${command}`);
  }
};

export default function WaitingRoom() {
  useBodyBackgroundColor("#EEE");
  const history = useHistory();
  const location = useLocation();

  const qsArgs = useMemo(() => {
    const urlParams = new URLSearchParams(location.search);
    return {
      participant: urlParams.get("participant") ?? undefined,
      device: urlParams.get("device") ?? undefined,
    };
  }, [location]);

  const isValid = qsArgs.participant != null && qsArgs.device != null;

  useEffect(() => {
    if (!isValid) {
      history.push({ pathname: Paths.setup, search: location.search });
    }
  }, [isValid, history, location]);

  const [endPointsState, endpoints] = useAsync(getEndPoints);

  switch (endPointsState) {
    case ReadyStates.idle:
    case ReadyStates.loading:
      return <Loading />;
    case ReadyStates.crashed:
      return <Crashed>Could not find moderation server</Crashed>;
    case ReadyStates.ready:
      break;
    default:
      throw new Error(`Unexpected state: ${endPointsState}`);
  }

  if (isValid) {
    return (
      <Wrapper>
        <ClientInfoProvider clientInfo={qsArgs}>
          <ModerationProvider
            onCommand={Controller(history)}
            initConnection={{
              url: endpoints.controlServer,
              role: UserRoles.participant,
              info: { ...qsArgs, activity: "waiting" },
            }}
          >
            <ValidWaitingRoom />
          </ModerationProvider>
        </ClientInfoProvider>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <div className={style.error}>Invalid Page Arguments.</div>
    </Wrapper>
  );
}

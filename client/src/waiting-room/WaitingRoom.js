import React, { useMemo, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import style from "./WaitingRoom.module.css";
import { Paths } from "../common/constants";
import Area from "../common/components/Area";
import useBodyBackgroundColor from "../common/hooks/useBodyBackgroundColor";
import ValidWaitingRoom from "./ValidWaitingRoom";
import { ClientInfoProvider } from "./ClientInfo";
import { ModerationClientProvider } from "../common/contexts/ModerationClient";

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

  if (isValid) {
    return (
      <Wrapper>
        <ClientInfoProvider clientInfo={qsArgs}>
          <ModerationClientProvider
            info={{ ...qsArgs, activity: "waiting" }}
            isRegistered
          >
            <ValidWaitingRoom />
          </ModerationClientProvider>
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

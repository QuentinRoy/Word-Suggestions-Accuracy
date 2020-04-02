import React, { useMemo, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import ParticipantStartupClient from "./ParticipantStartupClient";
import style from "./ParticipantStartup.module.css";

// eslint-disable-next-line react/prop-types
function Wrapper({ children }) {
  return (
    <div className={style.wrapper}>
      <div className={style.wrapperContent}>{children}</div>
    </div>
  );
}

export default function ParticipantStartup() {
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
      history.push({
        pathname: "/",
        search: location.search,
      });
    }
  }, [isValid, history, location]);

  if (!isValid) {
    return (
      <Wrapper>
        <div className={style.error}>Invalid Page Arguments.</div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <ParticipantStartupClient
        participant={qsArgs.participant}
        device={qsArgs.device}
        onEdit={() => {
          history.push({
            pathname: "/",
            search: location.search,
          });
        }}
      />
    </Wrapper>
  );
}

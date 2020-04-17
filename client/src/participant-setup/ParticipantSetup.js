import React, { useMemo } from "react";
import { stringify } from "qs";
import { useHistory, useLocation } from "react-router-dom";
import ParticipantStartupForm from "./ParticipantSetupForm";
import style from "./ParticipantSetup.module.css";
import { Paths } from "../common/constants";

// eslint-disable-next-line react/prop-types
function Wrapper({ children }) {
  return (
    <div className={style.wrapper}>
      <div className={style.wrapperContent}>{children}</div>
    </div>
  );
}

const useQuerystringArguments = () => {
  const location = useLocation();
  return useMemo(() => {
    const urlParams = new URLSearchParams(location.search);
    return {
      participant: urlParams.get("participant") ?? undefined,
      device: urlParams.get("device") ?? undefined,
    };
  }, [location]);
};

export default function ParticipantStartup() {
  const history = useHistory();
  return (
    <Wrapper>
      <ParticipantStartupForm
        initialValues={useQuerystringArguments()}
        onSubmit={(values) => {
          history.push({
            pathname: Paths.waitingRoom,
            search: `?${stringify(values)}`,
          });
        }}
      />
    </Wrapper>
  );
}

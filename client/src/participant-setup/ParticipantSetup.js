import React, { useMemo } from "react";
import { stringify } from "qs";
import { useHistory, useLocation } from "react-router-dom";
import ParticipantStartupForm from "./ParticipantSetupForm";
import style from "./ParticipantSetup.module.css";
import { Paths } from "../common/constants";
import useBodyBackgroundColor from "../common/hooks/useBodyBackgroundColor";
import Area from "../common/components/Area";

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

export default function ParticipantSetup() {
  const history = useHistory();
  useBodyBackgroundColor("#EEE");

  return (
    <div className={style.wrapper}>
      <Area>
        <ParticipantStartupForm
          initialValues={useQuerystringArguments()}
          onSubmit={(values) => {
            history.push({
              pathname: Paths.waitingRoom,
              search: `?${stringify(values)}`,
            });
          }}
        />
      </Area>
    </div>
  );
}

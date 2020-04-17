import React from "react";
import * as qs from "qs";
import { useHistory } from "react-router-dom";
import { Paths } from "../common/constants";
import style from "./SetupSummary.module.css";
import { useClientInfo } from "./ClientInfo";

export default function SetupSummary() {
  const { participant, device } = useClientInfo();
  const history = useHistory();

  const handleChangeParameters = () => {
    history.push({
      pathname: Paths.setup,
      search: qs.stringify({ participant, device }),
    });
  };

  return (
    <div className={style.summary}>
      <div className={style.parameters}>
        <ul>
          <li>Participant Id: {participant}</li>
          <li>Device: {device}</li>
        </ul>
      </div>
      <button
        className={style.changeParamsButton}
        type="button"
        onClick={handleChangeParameters}
      >
        Change
      </button>
    </div>
  );
}

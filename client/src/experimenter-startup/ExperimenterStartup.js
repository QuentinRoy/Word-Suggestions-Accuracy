import React from "react";
import PreviousState from "./PreviousState";
import style from "./ExperimenterStartup.module.css";
import StartForm from "./StartForm";
import useBackgroundColor from "../common/hooks/useBodyBackgroundColor";
import ControlServer from "./ControlServer";

const ExperimenterStartup = () => {
  useBackgroundColor("#EEE");

  return (
    <div className={style.main}>
      <div className={style.area}>
        <PreviousState />
      </div>
      <div className={style.area}>
        <StartForm />
      </div>
      <div className={style.area}>
        <ControlServer />
      </div>
    </div>
  );
};

export default ExperimenterStartup;

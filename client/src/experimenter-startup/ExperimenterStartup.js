import React, { useEffect } from "react";
import PreviousState from "./PreviousState";
import style from "./ExperimenterStartup.module.css";
import StartForm from "./StartForm";
import RemoteStartup from "./RemoteStartup";

const ExperimenterStartup = () => {
  useEffect(() => {
    const prevColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#EEE";
    return () => {
      document.body.style.backgroundColor = prevColor;
    };
  }, []);

  return (
    <div className={style.main}>
      <div className={style.area}>
        <PreviousState />
      </div>
      <div className={style.area}>
        <StartForm />
      </div>
      <div className={style.area}>
        <RemoteStartup />
      </div>
    </div>
  );
};

export default ExperimenterStartup;

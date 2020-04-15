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
      <section className={style.content}>
        <div className={style.area}>
          <PreviousState />
        </div>
        <div className={style.area}>
          <StartForm />
        </div>
        <div className={style.area}>
          <ControlServer />
        </div>
      </section>
      <footer className={style.footer}>
        v{process.env.REACT_APP_VERSION} (
        {process.env.REACT_APP_GIT_SHA
          ? process.env.REACT_APP_GIT_SHA
          : "git SHA unknown"}
        )
      </footer>
    </div>
  );
};

export default ExperimenterStartup;

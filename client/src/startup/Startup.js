import React, { useEffect } from "react";
import style from "./Startup.module.css";

import PreviousState from "./PreviousState";
import StartForm from "./StartForm";

const Startup = () => {
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
    </div>
  );
};

export default Startup;

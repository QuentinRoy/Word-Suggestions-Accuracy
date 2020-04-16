import React from "react";

import useBackgroundColor from "../common/hooks/useBodyBackgroundColor";
import style from "./Moderation.module.css";
import LocalModeration from "./LocalModeration";
import RemoteModeration from "./RemoteModeration";

const Footer = () => {
  const version = process.env.REACT_APP_VERSION;
  const gitSha = process.env.REACT_APP_GIT_SHA
    ? process.env.REACT_APP_GIT_SHA
    : "git SHA unknown";
  return (
    <>
      v{version} ({gitSha})
    </>
  );
};

const Moderation = () => {
  useBackgroundColor("#EEE");
  return (
    <div className={style.main}>
      <div>
        <section className={style.content}>
          <LocalModeration />
        </section>
        <section className={style.content}>
          <RemoteModeration />
        </section>
      </div>
      <footer className={style.footer}>
        <Footer />
      </footer>
    </div>
  );
};

export default Moderation;

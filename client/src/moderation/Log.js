import React, { useContext } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import style from "./Log.module.scss";
import { LogTypes } from "../common/constants";

const context = React.createContext();

const useLog = () => useContext(context);

function Participant() {
  const { client } = useLog();
  return client?.info?.participant ? (
    <span className={style.participant}>{client.info.participant}</span>
  ) : (
    <span className={classNames(style.participant, style.unknownParticipant)}>
      unknown participant
    </span>
  );
}

function Device() {
  const { client } = useLog();
  return client?.info?.device ? (
    <span className={style.device}>{client.info.device}</span>
  ) : (
    <span className={classNames(style.device, style.unknownDevice)}>
      unknown device
    </span>
  );
}

function Result({ children }) {
  return <span className={style.result}>{children}</span>;
}
Result.propTypes = { children: PropTypes.node.isRequired };

function SwitchDeviceLog() {
  const { content } = useLog();
  return (
    <>
      <Participant /> should switch to <Result>{content.device}</Result>
    </>
  );
}

function MeasureLog() {
  const { content } = useLog();
  const diagonal = Math.sqrt(content.width ** 2 + content.height ** 2);
  return (
    <>
      <Participant /> has a{" "}
      <Result>{Math.round((10 * diagonal) / 25.4) / 10}&nbsp;inches</Result>{" "}
      <Device />
    </>
  );
}

function TypingSpeedResultLog() {
  const { content } = useLog();
  return (
    <>
      <Participant /> typed at{" "}
      <Result>{Math.round(content.avgSpeed * 100) / 100} char/sec</Result> on{" "}
      <Device />
    </>
  );
}

function UnknownLog() {
  const { type } = useLog();
  return <>{type} log</>;
}

const contentMap = {
  [LogTypes.switchDevice]: SwitchDeviceLog,
  [LogTypes.measureDisplay]: MeasureLog,
  [LogTypes.typingSpeedResults]: TypingSpeedResultLog,
};

function LogHeader() {
  const { client, date, type } = useLog();
  return (
    <div className={style.logHeader}>
      {date.toLocaleString()} – {client.id} – {type}
    </div>
  );
}

function Log({ date, client, type, content }) {
  if (typeof date === "string") {
    // eslint-disable-next-line no-param-reassign
    date = new Date(date);
  }
  const Content = contentMap[type] ?? UnknownLog;
  return (
    <context.Provider value={{ date, client, type, content }}>
      <div className={style.log}>
        <LogHeader />
        <div className={style.logContent}>
          <Content />
        </div>
      </div>
    </context.Provider>
  );
}
Log.propTypes = {
  type: PropTypes.string,
  content: PropTypes.shape().isRequired,
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    .isRequired,
  client: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};
Log.defaultProps = { type: undefined };

export default React.memo(Log);

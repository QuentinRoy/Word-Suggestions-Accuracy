import React, { useContext } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import style from "./Log.module.scss";
import { LogTypes } from "../common/constants";

const logContext = React.createContext();
const useLog = () => useContext(logContext);

function Participant() {
  const { client } = useLog();
  return client?.info?.participant != null ? (
    <span className={style.participant}>{client.info.participant}</span>
  ) : (
    <span className={classNames(style.participant, style.unknownParticipant)}>
      unknown participant
    </span>
  );
}

function Device() {
  const { client } = useLog();
  return client?.info?.device != null ? (
    <span className={style.device}>{client.info.device}</span>
  ) : (
    <span className={classNames(style.device, style.unknownDevice)}>
      unknown device
    </span>
  );
}

function Result({ children, danger }) {
  return (
    <span className={classNames(style.result, { [style.danger]: danger })}>
      {children}
    </span>
  );
}
Result.propTypes = {
  children: PropTypes.node.isRequired,
  danger: PropTypes.bool,
};
Result.defaultProps = { danger: false };

function SwitchDeviceLog() {
  const { content } = useLog();
  return (
    <>
      <Participant /> has been asked to switch from <Device /> to{" "}
      <Result>{content.nextDevice}</Result>
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
      <Result>{((content.avgSpeed / 5) * 60).toFixed(2)} wpm</Result> on{" "}
      <Device />
    </>
  );
}

function ResetDialogLog() {
  const { content } = useLog();
  return (
    <>
      <Participant /> has{" "}
      {content.hasReset ? (
        <Result danger>restarted</Result>
      ) : (
        <Result>resumed</Result>
      )}{" "}
      their experiment on <Device />
    </>
  );
}

function UnknownLog() {
  const { type } = useLog();
  const typeDescr = type ?? "undefined";
  return <>{typeDescr} log</>;
}

const contentMap = {
  [LogTypes.switchDevice]: SwitchDeviceLog,
  [LogTypes.measureDisplay]: MeasureLog,
  [LogTypes.typingSpeedResults]: TypingSpeedResultLog,
  [LogTypes.resetDialog]: ResetDialogLog,
};

function LogHeader() {
  const { client, date, type } = useLog();
  const typeDescr = type ?? "?";
  return (
    <div className={style.logHeader}>
      {date.toLocaleString()} – {client.id} – {typeDescr}
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
    <logContext.Provider value={{ date, client, type, content }}>
      <div className={style.log}>
        <LogHeader />
        <div className={style.logContent}>
          <Content />
        </div>
      </div>
    </logContext.Provider>
  );
}
Log.propTypes = {
  type: PropTypes.string,
  content: PropTypes.shape(),
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    .isRequired,
  client: PropTypes.shape({
    id: PropTypes.string.isRequired,
    info: PropTypes.shape({
      device: PropTypes.string,
      participant: PropTypes.string,
    }),
  }).isRequired,
};
Log.defaultProps = { type: undefined, content: undefined };

export default React.memo(Log);

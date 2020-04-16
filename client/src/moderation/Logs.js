import React from "react";
import PropTypes from "prop-types";
import style from "./Logs.module.scss";
import Info from "./Info";

function Client({ info, id }) {
  if (info == null || info.device == null || info.participant == null) {
    return <>{id}</>;
  }
  return (
    <>
      {info.participant} – {info.device}
    </>
  );
}
Client.propTypes = {
  info: PropTypes.shape({
    device: PropTypes.string,
    participant: PropTypes.string,
  }),
  id: PropTypes.string.isRequired,
};
Client.defaultProps = {
  info: undefined,
};

function LogContent({ type, content, client }) {
  switch (type) {
    case "switch-device":
      return (
        <>
          <Client {...client} /> should switch to {content.device}.
        </>
      );
    case undefined:
    case null:
      return <>undefined log</>;
    default:
      return <>{type} log</>;
  }
}
LogContent.propTypes = {
  type: PropTypes.string,
  content: PropTypes.shape(),
  client: PropTypes.shape().isRequired,
};
LogContent.defaultProps = {
  type: undefined,
  content: undefined,
};

function Log({ date, client, ...logContent }) {
  if (typeof date === "string") {
    // eslint-disable-next-line no-param-reassign
    date = new Date(date);
  }
  return (
    <div className={style.log}>
      <div className={style.logHeader}>
        {date.toLocaleString()} – {client.id}
      </div>
      <div className={style.logContent}>
        <LogContent {...logContent} client={client} />
      </div>
    </div>
  );
}
Log.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    .isRequired,
  client: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export default function Logs({ logs, onClear }) {
  const logElements = logs.map((log, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <Log {...log} key={i} />
  ));
  return (
    <>
      <h2>Logs</h2>
      {logElements.length === 0 ? (
        <Info>No logs yet</Info>
      ) : (
        <>
          <div>{logElements}</div>
          <div>
            <button type="button" onClick={onClear}>
              Clear
            </button>
          </div>
        </>
      )}
    </>
  );
}
Logs.propTypes = {
  logs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onClear: PropTypes.func.isRequired,
};

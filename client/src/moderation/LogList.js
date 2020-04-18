import React from "react";
import PropTypes from "prop-types";
import Log from "./Log";
import Info from "./Info";

function LogList({ logs, onClear }) {
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
LogList.propTypes = {
  logs: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  onClear: PropTypes.func.isRequired,
};

export default React.memo(LogList);

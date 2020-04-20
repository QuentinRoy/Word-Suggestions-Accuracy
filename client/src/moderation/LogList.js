import React, { useMemo } from "react";
import PropTypes from "prop-types";
import sortBy from "lodash/sortBy";
import Log from "./Log";
import Info from "./Info";

export default function LogList({ logs, onClear }) {
  const logElements = useMemo(
    () => sortBy(logs, ["date"]).map((log) => <Log {...log} key={log.id} />),
    [logs]
  );

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
  clients: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string.isRequired })
  ).isRequired,
};

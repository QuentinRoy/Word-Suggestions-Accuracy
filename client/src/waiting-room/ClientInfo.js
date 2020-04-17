import * as React from "react";
import PropTypes from "prop-types";

const context = React.createContext();

export function ClientInfoProvider({ clientInfo, children }) {
  return <context.Provider value={clientInfo}>{children}</context.Provider>;
}
ClientInfoProvider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  clientInfo: PropTypes.object.isRequired,
  children: PropTypes.node,
};
ClientInfoProvider.defaultProps = { children: null };

export function useClientInfo() {
  return React.useContext(context);
}

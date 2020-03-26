import PropTypes from "prop-types";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function DocumentTitle({ title, children }) {
  useDocumentTitle(title);
  return children;
}

DocumentTitle.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node
};

DocumentTitle.defaultProps = {
  children: null
};

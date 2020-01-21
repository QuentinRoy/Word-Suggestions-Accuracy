import PropTypes from "prop-types";

export default PropTypes.shape({
  left: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired,
  bottom: PropTypes.number.isRequired,
  right: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
});

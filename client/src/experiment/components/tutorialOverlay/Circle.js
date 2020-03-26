import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/TutorialOverlay.module.scss";
import RectPropType from "./RectPropType";

export const CircleTypes = {
  circle: "circle",
  rectangle: "rectangle",
};

const Circle = ({
  rect,
  circleXMargin,
  circleYMargin,
  strokeWidth,
  type,
  rectRadius,
}) => {
  const circleWidth = rect.width + circleXMargin * 2;
  const circleHeight = rect.height + circleYMargin * 2;
  const svgWidth = circleWidth + strokeWidth;
  const svgHeight = circleHeight + strokeWidth;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={svgHeight}
      width={svgWidth}
      style={{
        position: "absolute",
        top: rect.top - circleYMargin - strokeWidth / 2,
        left: rect.left - circleXMargin - strokeWidth / 2,
      }}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      {type === CircleTypes.circle ? (
        <ellipse
          className={styles.circle}
          cx="50%"
          cy="50%"
          rx={circleWidth / 2}
          ry={circleHeight / 2}
          strokeWidth={strokeWidth}
        />
      ) : (
        <rect
          className={styles.circle}
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={circleWidth}
          height={circleHeight}
          rx={rectRadius}
          strokeWidth={strokeWidth}
        />
      )}
    </svg>
  );
};
Circle.propTypes = {
  type: PropTypes.oneOf(Object.values(CircleTypes)),
  rect: RectPropType.isRequired,
  circleXMargin: PropTypes.number,
  circleYMargin: PropTypes.number,
  strokeWidth: PropTypes.number,
  rectRadius: PropTypes.number,
};
Circle.defaultProps = {
  type: CircleTypes.circle,
  circleXMargin: 0,
  circleYMargin: 0,
  strokeWidth: 6,
  rectRadius: 20,
};

export default Circle;

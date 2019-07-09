import React, { memo } from "react";
import PropTypes from "prop-types";
import { scaleLinear as ScaleLinear } from "d3-scale";
import { max, histogram as Histogram } from "d3-array";
import {
  bar,
  tick,
  scaleLine,
  barLabel,
  tickLabel,
  plot
} from "./SentencePlot.module.css";

const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const tickLength = 5;
const fontSize = 12;

const histogram = Histogram()
  .domain([0, 1])
  .thresholds(10)
  .value(d => d.normalizedSks);

const x = ScaleLinear()
  .domain([0, 1])
  .range([0, width]);

const Bar = ({ scaleY, words, x0, x1 }) => {
  const { length: n } = words;
  if (words === 0) return null;
  const barWidth = x(x1) - x(x0) - 2;
  return (
    <g
      // eslint-disable-next-line react/no-array-index-key
      transform={`translate(${x(x0)} ${scaleY(n)})`}
    >
      <rect
        x={1}
        width={barWidth}
        height={scaleY(0) - scaleY(n)}
        className={bar}
      />
      <text
        className={barLabel}
        x={barWidth / 2}
        y={10}
        alignmentBaseline="hanging"
        textAnchor="middle"
        fontSize={fontSize}
      >
        {words.map((w, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <tspan x={barWidth / 2} key={i} dy="1.2em">
            {w.word}
          </tspan>
        ))}
      </text>
    </g>
  );
};

Bar.propTypes = {
  scaleY: PropTypes.func.isRequired,
  words: PropTypes.arrayOf(PropTypes.shape({ word: PropTypes.string }))
    .isRequired,
  x0: PropTypes.number.isRequired,
  x1: PropTypes.number.isRequired
};

const Scale = () => {
  const ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(
    tValue => (
      <g key={tValue} transform={`translate(${x(tValue)})`}>
        <line x0={0} x1={0} y0={0} y1={tickLength} className={tick} />
        <text
          className={tickLabel}
          x={0}
          y={tickLength + 5}
          alignmentBaseline="hanging"
          textAnchor="middle"
          fontSize={fontSize}
        >
          {tValue}
        </text>
      </g>
    )
  );
  return (
    <>
      <line x0={0} x1={x(1)} y0={0} y1={0} className={scaleLine} />
      {ticks}
    </>
  );
};

const SentencePlot = memo(({ words }) => {
  const data = histogram(words);
  const yMax = max(data, d => d.length);
  const y = ScaleLinear()
    .domain([0, yMax])
    .range([height, 0]);

  const bars = data.map((d, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <Bar key={i} scaleY={y} words={d} x0={d.x0} x1={d.x1} />
  ));

  const barGroup = (
    <g transform={`translate(${margin.left} ${margin.top})`}>{bars}</g>
  );

  const scale = (
    <g transform={`translate(${margin.left} ${y(0) + margin.top})`}>
      <Scale />
    </g>
  );

  return (
    <svg
      className={plot}
      viewBox={`0 0 ${width + margin.left + margin.right} ${height +
        margin.top +
        margin.bottom}`}
    >
      {barGroup}
      {scale}
    </svg>
  );
});

SentencePlot.propTypes = {
  words: PropTypes.arrayOf(
    PropTypes.shape({ word: PropTypes.string, normalizedSks: PropTypes.number })
  ).isRequired
};

export default SentencePlot;

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
  plot,
} from "./SentencePlot.module.css";
import { getSaving } from "./getWordAccuracies";

const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const tickLength = 5;
const fontSize = 12;

const histogram = Histogram()
  .domain([0, 1])
  // Last one is a bit bigger than 1 to make sure 1 is included.
  .thresholds([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0001])
  .value((d) => getSaving(d.word, d.sks));

const scaleX = ScaleLinear().domain([0, 1]).range([0, width]);

const WordBar = ({ scaleY, words, x0, x1 }) => {
  const n = words.length;
  if (n === 0) return null;
  const barWidth = scaleX(x1) - scaleX(x0) - 2;
  return (
    <g
      // eslint-disable-next-line react/no-array-index-key
      transform={`translate(${scaleX(x0)} ${scaleY(n)})`}
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
        dominantBaseline="hanging"
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

WordBar.propTypes = {
  scaleY: PropTypes.func.isRequired,
  words: PropTypes.arrayOf(PropTypes.shape({ word: PropTypes.string }))
    .isRequired,
  x0: PropTypes.number.isRequired,
  x1: PropTypes.number.isRequired,
};

const Scale = () => {
  const ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map(
    (tValue) => (
      <g key={tValue} transform={`translate(${scaleX(tValue)})`}>
        <line x0={0} x1={0} y0={0} y1={tickLength} className={tick} />
        <text
          className={tickLabel}
          x={0}
          y={tickLength + 5}
          dominantBaseline="hanging"
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
      <line x0={0} x1={scaleX(1)} y0={0} y1={0} className={scaleLine} />
      {ticks}
    </>
  );
};

const SentencePlot = memo(({ words }) => {
  const data = histogram(words);
  const yMax = max(data, (d) => d.length);
  const scaleY = ScaleLinear().domain([0, yMax]).range([height, 0]);

  const bars = data.map((d, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <WordBar key={i} scaleY={scaleY} words={d} x0={d.x0} x1={d.x1} />
  ));

  const barGroup = (
    <g transform={`translate(${margin.left} ${margin.top})`}>{bars}</g>
  );

  const scale = (
    <g transform={`translate(${margin.left} ${scaleY(0) + margin.top})`}>
      <Scale />
    </g>
  );

  return (
    <svg
      className={plot}
      viewBox={`0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`}
    >
      {barGroup}
      {scale}
    </svg>
  );
});

SentencePlot.propTypes = {
  words: PropTypes.arrayOf(
    PropTypes.shape({ word: PropTypes.string, normalizedSks: PropTypes.number })
  ).isRequired,
};

export default SentencePlot;

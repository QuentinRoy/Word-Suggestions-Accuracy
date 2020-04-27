import React, { useRef, useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import MeasureDisplayView, {
  Directions,
} from "@quentinroy/measure-display-view";
import "@quentinroy/measure-display-view/lib/measure-display-view.css";
import { Button } from "@material-ui/core";
import TaskPaper from "../experiment/components/TaskPaper";
import style from "./MeasureDisplayTask.module.scss";
import { LogTypes } from "../common/constants";
import { useModeration } from "../common/moderation/Moderation";

export { Directions };

export default function MeasureDisplayTask({
  rulersOrientation,
  initRatio,
  onAdvanceWorkflow,
  onLog,
}) {
  const viewRef = useRef();

  // This is used to save the ratio when a MeasureDisplayView is unmounted in
  // case it is remounted later.
  const ratioRef = useRef(initRatio);
  const [dimensions, setDimensions] = useState();

  const { sendLog } = useModeration();

  useLayoutEffect(() => {
    if (viewRef.current == null) return undefined;
    const node = viewRef.current;

    const mdv = MeasureDisplayView({
      node,
      rulersOrientation,
      ratio: ratioRef.current,
      rulersLength: "50px",
      onChange(ratio) {
        ratioRef.current = ratio;
        setDimensions(mdv.getDisplayDimensions());
      },
    });

    setDimensions(mdv.getDisplayDimensions());

    return () => {
      mdv.remove();
      node.innerHTML = "";
    };
  }, [rulersOrientation]);

  const handleSubmit = () => {
    // eslint-disable-next-line no-console
    sendLog(LogTypes.measureDisplay, dimensions).catch(console.error);
    onLog("displayDimensions", dimensions);
    onAdvanceWorkflow();
  };

  return (
    <TaskPaper>
      <div
        className={classNames(style.main, {
          [style.horizontal]: rulersOrientation === Directions.horizontal,
        })}
      >
        <h1>Display Size</h1>
        <div>
          Drag the blue line below to precisely fit the size of a credit card.
          Use a real credit card.
        </div>
        <div ref={viewRef} className={style.measureView} />
        <div>
          {dimensions && (
            <DisplayDimensions
              width={dimensions.width}
              height={dimensions.height}
            />
          )}
        </div>
        <div className={style.controls}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </TaskPaper>
  );
}

MeasureDisplayTask.propTypes = {
  rulersOrientation: PropTypes.oneOf(Object.values(Directions)).isRequired,
  onLog: PropTypes.func.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
  initRatio: PropTypes.number,
};

MeasureDisplayTask.defaultProps = { initRatio: 2 };

function DisplayDimensions({ width, height }) {
  const diagonal = Math.sqrt(width ** 2 + height ** 2);
  return (
    <>
      Display Size: {Math.round(width)}&nbsp;mm&nbsp;×&nbsp;{Math.round(height)}
      &nbsp;mm ({Math.round((10 * diagonal) / 25.4) / 10}&nbsp;inches)
    </>
  );
}
DisplayDimensions.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

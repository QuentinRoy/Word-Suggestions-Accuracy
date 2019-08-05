import { useRef } from "react";
import { Actions } from "../utils/constants";

// A function that does nothing.
const noOp = () => {};

// Wraps f that may be null, undefined or a function. If f is a function,
// it returns it, otherwise, it returns a new function that does not do
// anything.
const safeToCall = f => (f == null ? noOp : f);

const Delayer = () => {
  let currentJob = null;

  // If this is called before the timer runs out, the action is canceled before
  // being ended. Calls the currentJob's onEnd, and possibly onCancel.
  const end = () => {
    if (currentJob == null) return;
    if (!currentJob.isConfirmed) {
      clearTimeout(currentJob.timeoutId);
      currentJob.onCancel();
    }
    currentJob.onEnd();
    currentJob = null;
  };

  // Start a job. After delay ms, if end has not been called, onConfirm is
  // called. When end is called, onEnd is called. Additionally, if delay ms has
  // not passed yet, onCancel is called first (i.e. before onEnd).
  // If a job was already started but not ended yet, it is ended before the new
  // job starts.
  const start = (delay, onConfirm, onCancel, onEnd) => {
    end();
    const timeoutId = setTimeout(() => {
      currentJob.onConfirm();
      currentJob.isConfirmed = true;
    }, delay);
    currentJob = {
      timeoutId,
      onCancel: safeToCall(onCancel),
      onEnd: safeToCall(onEnd),
      onConfirm: safeToCall(onConfirm),
      isConfirmed: false
    };
  };

  return { start, end };
};

export default function useActionScheduler(dispatch, delay) {
  const { current: delayer } = useRef(Delayer());

  // Start an action. Immediately dispatch the action with
  // status = Statuses.start. After delay ms, dispatches the action again
  // with status = Statuses.confirm.
  const start = action => {
    delayer.start(
      delay,
      () => dispatch({ type: Actions.confirmAction, action }),
      () => dispatch({ type: Actions.cancelAction, action }),
      () => dispatch({ type: Actions.endAction, action })
    );
    dispatch({ type: Actions.scheduleAction, action });
  };

  return { start, end: delayer.end };
}

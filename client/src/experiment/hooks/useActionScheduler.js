import { useRef, useEffect } from "react";
import { Actions } from "../../utils/constants";

const Job = (jobId, delay, onConfirm, onCancel, onEnd) => {
  let isStarted = false;
  let timeoutId;
  const job = {
    jobId,
    isConfirmed: false,
    isEnded: false,
    isCanceled: false
  };

  job.end = () => {
    if (!isStarted) throw new Error(`Job ${jobId} is not started yet`);
    if (!job.isConfirmed) {
      clearTimeout(timeoutId);
      job.isCanceled = true;
      if (onCancel != null) onCancel();
    }
    if (!job.isEnded) {
      job.isEnded = true;
      if (onEnd != null) onEnd();
    }
  };

  job.start = () => {
    if (isStarted) throw new Error(`Job ${jobId} is already started`);

    const confirm = () => {
      if (!job.isConfirmed) {
        job.isConfirmed = true;
        if (onConfirm != null) onConfirm();
      }
    };
    timeoutId = setTimeout(confirm, delay);
    isStarted = true;
  };

  return job;
};

const Scheduler = () => {
  const jobs = new Map();

  // If this is called before the timer runs out, the action is canceled before
  // being ended. Calls the currentJob's onEnd, and possibly onCancel.
  const end = jobId => {
    const job = jobs.get(jobId);
    if (job == null) return;
    job.end();
    jobs.delete(jobId);
  };

  // Start a job. After delay ms, if end has not been called, onConfirm is
  // called. When end is called, onEnd is called. Additionally, if delay ms has
  // not passed yet, onCancel is called first (i.e. before onEnd).
  const start = (jobId, delay, onConfirm, onCancel, onEnd) => {
    if (jobs.has(jobId)) throw new Error(`Job ${jobId} already exists`);
    const job = Job(jobId, delay, onConfirm, onCancel, onEnd);
    jobs.set(jobId, job);
    job.start();
  };

  const endAll = () => {
    jobs.forEach(job => job.end());
    jobs.clear();
  };

  return { start, end, endAll };
};

export default function useActionScheduler(dispatch, delay) {
  const delayRef = useRef(delay);
  const ref = useRef(null);

  if (ref.current == null) {
    const scheduler = Scheduler();
    // Start an action. Immediately dispatch the action with
    // status = Statuses.start. After delay ms, dispatches the action again
    // with status = Statuses.confirm.
    const start = (jobId, action) => {
      scheduler.start(
        jobId,
        delayRef.current,
        () => dispatch({ type: Actions.confirmAction, action }),
        () => dispatch({ type: Actions.cancelAction, action }),
        () => dispatch({ type: Actions.endAction, action })
      );
      dispatch({ type: Actions.scheduleAction, action });
    };
    ref.current = { start, end: scheduler.end, endAll: scheduler.endAll };
  }

  if (delayRef.current !== delay) {
    delayRef.current = delay;
    ref.current.endAll();
  }

  useEffect(() => () => ref.current.endAll(), []);

  return ref.current;
}

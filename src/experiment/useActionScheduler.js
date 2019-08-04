import { useRef } from "react";
import Delayer from "../utils/Delayer";
import { ActionStatuses as Statuses } from "../utils/constants";

export default function useActionScheduler(dispatch, delay) {
  const { current: delayer } = useRef(Delayer());

  const scheduleAction = opts => {
    dispatch({ ...opts, status: Statuses.start });
    delayer.schedule(
      () => dispatch({ ...opts, status: Statuses.confirm }),
      () => dispatch({ ...opts, status: Statuses.cancel }),
      delay
    );
  };

  const cancelAction = () => {
    delayer.cancel();
  };

  return { scheduleAction, cancelAction };
}

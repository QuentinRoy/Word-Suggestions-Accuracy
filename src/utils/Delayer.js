const Delayer = () => {
  let timeoutId = null;
  let pendingOnCancelCallback = null;

  const schedule = (onConfirmCallback, onCancelCallback, delay) => {
    if (timeoutId != null) {
      throw new Error("A callback is already scheduled");
    }
    timeoutId = setTimeout(() => {
      if (onConfirmCallback != null) onConfirmCallback();
      timeoutId = null;
      pendingOnCancelCallback = null;
    }, delay);
    pendingOnCancelCallback = onCancelCallback;
  };

  const cancel = () => {
    if (timeoutId != null) {
      clearTimeout(timeoutId);
      if (pendingOnCancelCallback != null) pendingOnCancelCallback();
    }
    timeoutId = null;
    pendingOnCancelCallback = null;
  };

  return { schedule, cancel };
};

export default Delayer;

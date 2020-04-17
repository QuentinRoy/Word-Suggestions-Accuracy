export default function Dispatcher() {
  const listeners = [];

  const on = (listener) => {
    listeners.push(listener);
  };

  const off = (listener) => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };

  const dispatch = (...args) => {
    for (let i = 0; i < listeners.length; i += 1) {
      listeners[i](...args);
    }
  };

  return { on, off, dispatch };
}

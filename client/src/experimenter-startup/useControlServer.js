import { useEffect, useState } from "react";
import { LoadingStates } from "../common/constants";

const wait = (delay) =>
  new Promise((resolve) => {
    setTimeout(resolve, delay);
  });

const useControlServer = () => {
  const [state, setState] = useState(LoadingStates.loading);

  useEffect(() => {
    wait(500).then(() => {
      setState(LoadingStates.loaded);
    });
  }, []);

  const startApp = () => wait(500);

  return {
    state,
    clients: [],
    startApp,
  };
};

export default useControlServer;

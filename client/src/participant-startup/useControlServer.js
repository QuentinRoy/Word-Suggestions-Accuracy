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

  return {
    state,
    setParameters: () => wait(500),
    clearParameters: () =>
      wait(500).then(() => {
        throw new Error(`Nope!`);
      }),
  };
};

export default useControlServer;

import useAsync from "./useAsync";

const useJson = url =>
  useAsync(
    () =>
      fetch(url).then(resp => {
        if (resp.ok) return resp.json();
        throw new Error(`Cannot fetch ${url}`);
      }),
    [url]
  );

export default useJson;

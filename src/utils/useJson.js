import useAsync from "./useAsync";

const useJSON = url =>
  useAsync(async () => {
    if (url == null) {
      throw new Error(`url argument is missing`);
    }
    const resp = await fetch(url);
    if (resp.ok) return resp.json();
    throw new Error(`Error while fetching ${url}`);
  }, [url]);

export default useJSON;

import * as React from "react"
import { merge } from "lodash"

export function useMemoMerge(...args: unknown[]): unknown {
  return React.useMemo(() => {
    return merge({}, ...args)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, args)
}

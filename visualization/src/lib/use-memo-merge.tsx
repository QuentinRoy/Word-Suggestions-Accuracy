import * as React from "react"
import { merge } from "lodash"

// Spread type is from https://stackoverflow.com/questions/49682569/typescript-merge-object-types.

type OptionalPropertyNames<T> = {
  [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never
}[keyof T]

type SpreadProperties<L, R, K extends keyof L & keyof R> = {
  [P in K]: L[P] | Exclude<R[P], undefined>
}

type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

type SpreadTwo<L, R> = Id<
  Pick<L, Exclude<keyof L, keyof R>> &
    Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> &
    Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> &
    SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>

type Spread<A extends readonly [...any]> = A extends [infer L, ...infer R]
  ? SpreadTwo<L, Spread<R>>
  : unknown

export function useMemoMerge<
  TSource extends Record<string | number, unknown>[]
>(...args: [...TSource]): Spread<TSource> {
  return React.useMemo(() => {
    console.log("yop", args)
    return merge({}, ...args)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, args)
}

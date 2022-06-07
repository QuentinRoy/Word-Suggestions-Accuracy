export function findClosest<T, U>(
  target: T,
  values: U[],
  diff: (a: T, b: U) => number
): U {
  let current = values[0]
  let currentDiff = diff(target, current)
  for (let i = 0; i < values.length; i++) {
    let a = values[i]
    let aDiff = diff(target, a)
    if (aDiff < currentDiff) {
      currentDiff = aDiff
      current = a
    }
  }
  return current
}

export function findClosestNumber<T extends number>(
  target: number,
  values: T[]
): T {
  return findClosest(target, values, (a, b) => Math.abs(a - b))
}

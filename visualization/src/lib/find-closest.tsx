export function findClosest<T>(
  target: T,
  values: T[],
  diff: (a: T, b: T) => number
) {
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

export function findClosestNumber(target: number, values: number[]) {
  return findClosest(target, values, (a, b) => Math.abs(a - b))
}

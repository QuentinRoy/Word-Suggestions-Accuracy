export function transform(...transforms: string[]): string {
  let nonNoneTransforms = transforms.filter(t => t !== "none" && t !== "")
  if (nonNoneTransforms.length > 0) return transforms.join(" ")
  else return "none"
}

export function translate(x: number, y: number, unit = "") {
  return `translate(${x}${unit},${y}${unit})`
}

export function rotate(x: number, unit = "") {
  return `rotate(${x}${unit})`
}

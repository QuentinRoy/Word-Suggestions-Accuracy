export function transform(...transforms: string[]): string {
  let nonNoneTransforms = transforms.filter(t => t !== "none" && t !== "")
  if (nonNoneTransforms.length > 0) return transforms.join(" ")
  else return "none"
}

export function translate(x?: number, y?: number): string {
  if (y == null && x == null) return "none"
  if (x == null) return `translate(0,${y})`
  if (y == null) return `translate(${x})`
  return `translate(${x},${y})`
}

export function rotate(x?: number) {
  return `rotate(${x})`
}

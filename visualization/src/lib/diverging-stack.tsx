import { group, sum } from "d3-array"

export interface Bar<Category, Data> {
  start: number
  length: number
  value: number
  data: Data[]
  category: Category
  id: string
}
export interface StackData<Category, Data> {
  bars: Bar<Category, Data>[]
  start: number
  length: number
}

interface DivergentStackProps<Category, Data> {
  getCategory: (d: Data) => Category
  getValue: (d: Data) => number
  negatives: Category[]
  neutral: Category
  positives: Category[]
}

// Create divergent stacks from the answers with most extrement answers in the
// middle, c.f. https://www.linkedin.com/pulse/diverging-100-stacked-bars-useless-daniel-zvinca
export default function DivergentStack<Category extends string, Data>({
  getCategory,
  getValue,
  negatives: negativeCats,
  neutral: neutralCat,
  positives: positiveCat,
}: DivergentStackProps<Category, Data>) {
  return (data: Data[]): StackData<Category, Data> => {
    let total = sum(data, getValue)
    let dataMap = group(data, getCategory)

    let bars: Bar<Category, Data>[] = []

    let neutralData = dataMap.get(neutralCat) || []
    let neutralValue = sum(neutralData, getValue)
    let neutralLength = neutralValue / total

    let negativeSideLength = 0
    for (let category of negativeCats) {
      let data = dataMap.get(category) ?? []
      let value = sum(data, getValue)
      let length = value / total
      // Because we are going backward, we need to add the length of the new
      // bar before adding it so that it is taken into account when assigning
      // start.
      negativeSideLength += length
      bars.unshift({
        id: category,
        category,
        data,
        start: -negativeSideLength,
        length,
        value,
      })
    }

    // Half of the neutral answers should come at the begining of the negative
    // part.
    negativeSideLength += neutralLength / 2
    bars.unshift({
      data: neutralData,
      category: neutralCat,
      id: `${neutralCat} (-)`,
      start: -negativeSideLength,
      length: neutralLength / 2,
      value: neutralValue / 2,
    })

    let positiveSideLength = 0
    for (let category of positiveCat) {
      let data = dataMap.get(category) ?? []
      let value = sum(data, getValue)
      let length = value / total
      bars.push({
        data,
        category,
        id: category,
        start: positiveSideLength,
        length,
        value,
      })
      positiveSideLength += length
    }

    // Half of the neutral answers should come at the end of the positive
    // part.
    bars.push({
      data: neutralData,
      category: neutralCat,
      id: `${neutralCat} (+)`,
      start: positiveSideLength,
      length: neutralLength / 2,
      value: neutralValue / 2,
    })
    positiveSideLength += neutralLength / 2

    // At the end, length should always be 1.
    return {
      bars,
      start: -negativeSideLength,
      length: positiveSideLength + negativeSideLength,
    }
  }
}

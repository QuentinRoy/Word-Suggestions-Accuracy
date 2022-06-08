import { merge } from "lodash"
import * as React from "react"
import { PartialDeep } from "type-fest"

interface Text {
  size: number
  color: string
}

interface Tick {
  margin: number
  color: string
  width: number
  label: Text
}

interface Axis {
  ticks: Tick
}

export interface Margin {
  left: number
  top: number
  bottom: number
  right: number
}

interface ChartTheme {
  facets: {
    label: {
      size: number
      color: string
      margin: number
    }
    padding: {
      inner: number
      outer: number
    }
  }
  stacks: {
    padding: {
      inner: number
      outer: number
    }
  }
  axises: {
    x: Axis
    y: Axis
  }
  legend: {
    margin: Margin
    width: number
    items: {
      label: Text
      size: number
      margin: number
    }
  }
  lines: { color: string; width: number }
  labels: Text
}

const defaultTheme: ChartTheme = {
  facets: {
    label: { size: 14, color: "#4D4D4D", margin: 100 },
    padding: { inner: 0.1, outer: 0.05 },
  },
  stacks: {
    padding: { inner: 0.05, outer: 0 },
  },
  axises: {
    x: {
      ticks: {
        margin: 10,
        color: "#EBEBEB",
        width: 1,
        label: { size: 10, color: "#4D4D4D" },
      },
    },
    y: {
      ticks: {
        margin: 15,
        color: "#EBEBEB",
        width: 1,
        label: { size: 14, color: "#4D4D4D" },
      },
    },
  },
  lines: { color: "#000", width: 1 },
  labels: { size: 10, color: "#000" },
  legend: {
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
    width: 600,
    items: {
      size: 14,
      margin: 5,
      label: { size: 14, color: "#000" },
    },
  },
}

const themeContext = React.createContext<ChartTheme>(defaultTheme)

export const useChartTheme = () => React.useContext(themeContext)

type ChartProviderProps = {
  theme?: PartialDeep<ChartTheme>
  children?: React.ReactNode
}
export const ChartThemeProvider = ({ theme, children }: ChartProviderProps) => {
  // Using merge instead of defaultsDeep because merge is already imported
  // by userMemoMerge.
  const themeWithDefaults: ChartTheme = merge({}, defaultTheme, theme)
  return (
    <themeContext.Provider value={themeWithDefaults}>
      {children}
    </themeContext.Provider>
  )
}

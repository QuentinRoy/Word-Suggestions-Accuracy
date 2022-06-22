import * as React from "react"
import { PartialDeep } from "type-fest"
import { useMemoMerge } from "./use-memo-merge"

export type Text = {
  size: number
  color: string
  fontFamily: string
}

export type Tick = {
  margin: number
  color: string
  width: number
  label: Text
}

export type Axis = {
  ticks: Tick
}

export type Margin = {
  left: number
  top: number
  bottom: number
  right: number
}

export type ChartTheme = {
  animation: "none" | "fast"
  plot: {
    margin: Margin
  }
  subPlot: {
    gap: {
      vertical: number
      horizontal: number
    }
    label: Text & { margin: number }
  }
  facets: {
    label: Text & { margin: number }
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
  lines: {
    color: string
    width: number
  }
  labels: Text
}

export const defaultTheme: ChartTheme = {
  animation: "fast",
  plot: {
    margin: { top: 15, right: 25, left: 100, bottom: 120 },
  },
  subPlot: {
    gap: { vertical: 50, horizontal: 50 },
    label: { size: 14, color: "#000", fontFamily: "Roboto", margin: 1 },
  },
  facets: {
    label: { size: 14, color: "#4D4D4D", fontFamily: "Roboto", margin: 100 },
    padding: { inner: 0.1, outer: 0.05 },
  },
  stacks: {
    padding: { inner: 0.05, outer: 0 },
  },
  axises: {
    x: {
      ticks: {
        margin: 5,
        color: "#EBEBEB",
        width: 1,
        label: { size: 10, color: "#4D4D4D", fontFamily: "Roboto" },
      },
    },
    y: {
      ticks: {
        margin: 10,
        color: "#EBEBEB",
        width: 1,
        label: { size: 14, color: "#4D4D4D", fontFamily: "Roboto" },
      },
    },
  },
  lines: { color: "#000", width: 1 },
  labels: { size: 10, color: "#000", fontFamily: "Roboto" },
  legend: {
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
    width: 600,
    items: {
      size: 14,
      margin: 5,
      label: { size: 14, color: "#000", fontFamily: "Roboto" },
    },
  },
}

const themeContext = React.createContext<ChartTheme>(defaultTheme)

export const useChartTheme = (localTheme?: PartialDeep<ChartTheme>) => {
  let themeFromContext = React.useContext(themeContext)
  return useMemoMerge(themeFromContext, localTheme) as ChartTheme
}

type ChartProviderProps = {
  theme: PartialDeep<ChartTheme>
  children: React.ReactNode
}

export const ChartThemeProvider = ({ theme, children }: ChartProviderProps) => {
  const themeWithDefaults = useMemoMerge(defaultTheme, theme) as ChartTheme

  return (
    <themeContext.Provider value={themeWithDefaults}>
      {children}
    </themeContext.Provider>
  )
}

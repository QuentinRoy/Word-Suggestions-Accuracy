import * as React from "react"
import { FormControl, FormLabel, Slider } from "@mui/material"
import { Accuracy } from "../lib/data"

type AccuracyControlProps = {
  availableValues: Accuracy[]
  value?: Accuracy
  onChange: (newValue: Accuracy) => any
}
export default function AccuracyControl({
  availableValues,
  value,
  onChange,
}: AccuracyControlProps) {
  // I could not make FormLabel or FormControlLabel to work well with Slider
  // so I am dealing with the focus prop manually.
  const [isFocused, setIsFocused] = React.useState(false)
  return (
    <FormControl fullWidth>
      <FormLabel focused={isFocused}>Accuracy</FormLabel>
      <Slider
        value={value == null ? 0 : parseFloat(value)}
        onChange={(evt, newValue) => {
          onChange(String(newValue) as Accuracy)
        }}
        onBlur={() => {
          setIsFocused(false)
        }}
        onFocus={() => {
          setIsFocused(true)
        }}
        step={null}
        min={0}
        max={1}
        marks={availableValues.map(a => {
          let aValue = parseFloat(a)
          return {
            value: aValue,
            label: formatAccuracy(aValue),
          }
        })}
      />
    </FormControl>
  )
}

function formatAccuracy(x: number) {
  return `${(x * 100).toFixed(0)}%`
}

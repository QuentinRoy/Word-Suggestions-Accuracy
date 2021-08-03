import * as React from "react"
import { FormControl, FormLabel, Slider } from "@material-ui/core"

type AccuracyControlProps = {
  availableValues: number[]
  value?: number
  onChange: (newValue: number) => any
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
        value={value}
        onChange={(evt, newValue) => {
          onChange(newValue as number)
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
        marks={availableValues.map(a => ({
          value: a,
          label: formatAccuracy(a),
        }))}
      />
    </FormControl>
  )
}

function formatAccuracy(x: number) {
  return `${(x * 100).toFixed(0)}%`
}

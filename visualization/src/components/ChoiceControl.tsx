import * as React from "react"
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core"

type ChoiceControlProps<ChoiceId extends string | number | symbol> = {
  groupLabel: React.ReactNode
  availableValues?: Set<any>
  labels: Record<ChoiceId, string>
  value: ChoiceId | undefined
  onChange: (newValue: ChoiceId) => any
}
export default function ChoiceControl<
  ChoiceId extends string | number | symbol
>({
  groupLabel,
  availableValues,
  labels,
  value,
  onChange,
}: ChoiceControlProps<ChoiceId>) {
  return (
    <FormControl fullWidth>
      <FormLabel>{groupLabel}</FormLabel>
      <RadioGroup
        aria-label="questions"
        name="questions"
        value={value}
        onChange={(evt, value) => {
          onChange(value as ChoiceId)
        }}
      >
        {Object.entries(labels).map(([questionId, label]) => (
          <FormControlLabel
            key={questionId}
            value={questionId}
            control={
              <Radio
                color="primary"
                disabled={
                  availableValues == null || !availableValues.has(questionId)
                }
              />
            }
            label={label as string}
          />
        ))}
      </RadioGroup>
    </FormControl>
  )
}

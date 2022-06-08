import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material"

type ChoiceControlProps<ChoiceId extends string | number | symbol> = {
  groupLabel: string
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
        aria-label={groupLabel}
        value={value}
        onChange={(evt, newValue) => {
          onChange(newValue as ChoiceId)
        }}
      >
        {Object.entries<string>(labels).map(([choiceId, label]) => (
          <FormControlLabel
            key={choiceId}
            label={label}
            value={choiceId}
            control={
              <Radio
                color="primary"
                disabled={
                  availableValues == null || !availableValues.has(choiceId)
                }
              />
            }
          />
        ))}
      </RadioGroup>
    </FormControl>
  )
}

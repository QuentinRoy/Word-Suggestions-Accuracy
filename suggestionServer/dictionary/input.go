package dictionary

// GetRKSImprovement returns the difference of remaining key strokes between
// the input and the new input.
func GetRKSImprovement(input, newInput, target []rune) int {
	prevRemainingKeyStrokes := getRemainingKeyStrokes(input, target)
	newRemainingKeyStrokes := getRemainingKeyStrokes(newInput, target)
	return prevRemainingKeyStrokes - newRemainingKeyStrokes
}

func getRemainingKeyStrokes(input, target []rune) int {
	totalCorrect := totalMatchedCharsFromStart(target, input)
	totalIncorrect := len(input) - totalCorrect
	// We need to add the number of incorrect characters, since these need to be removed.
	return len(target) + totalIncorrect - totalCorrect
}

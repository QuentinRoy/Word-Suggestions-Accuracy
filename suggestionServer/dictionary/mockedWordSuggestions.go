package dictionary

import (
	"strings"
)

func isAGoodSuggestion(lowerCaseTargetWord, lowerCaseInputWord, lowerCaseSuggestion []rune) bool {
	sugAndSpace := make([]rune, len(lowerCaseSuggestion)+1)
	copy(sugAndSpace, lowerCaseSuggestion)
	sugAndSpace[len(lowerCaseSuggestion)] = ' '
	return GetRKSImprovement(
		lowerCaseInputWord,
		sugAndSpace,
		lowerCaseTargetWord,
	) > 0
}

// MockedWordSuggestions computes a list of mocked word suggestions from an input context.
// Mocked word suggestions will only contains the target word as indicated in the input context.
// Other suggestions are never worth picking.
func (dict *Dictionary) MockedWordSuggestions(
	inputCtx InputContext,
	totalSuggestions int,
	cancel chan bool,
) []string {
	lowerCaseTargetWord := strings.ToLower(inputCtx.TargetWord)
	lowerCaseTargetWordR := []rune(lowerCaseTargetWord)
	lowerCaseInputWord := strings.ToLower(inputCtx.InputWord)
	lowerCaseInputWordR := []rune(lowerCaseInputWord)

	filter := func(sugg string) bool {
		lowerCaseSuggestion := strings.ToLower(sugg)
		lowerCaseSuggestionR := []rune(lowerCaseSuggestion)
		return !areRuneSlicesEqual(lowerCaseSuggestionR, lowerCaseTargetWordR) &&
			!isAGoodSuggestion(lowerCaseTargetWordR, lowerCaseInputWordR, lowerCaseSuggestionR) &&
			(inputCtx.CanReplaceLetters || strings.HasPrefix(lowerCaseSuggestion, lowerCaseInputWord))
	}

	suggestions := dict.FilteredWordSuggestions(inputCtx.InputWord, totalSuggestions, filter, cancel)

	if suggestions == nil {
		return nil
	}

	nTargetSuggestionPositions := len(inputCtx.TargetSuggestionPositions)
	if nTargetSuggestionPositions == 0 {
		return suggestions
	}
	targetTotalMatchingChars := totalMatchedChars(
		[]rune(inputCtx.InputWord),
		[]rune(inputCtx.TargetWord),
	)
	if targetTotalMatchingChars >= nTargetSuggestionPositions {
		return suggestions
	}
	if inputCtx.TargetSuggestionPositions == nil {
		return suggestions
	}
	targetPosition := inputCtx.TargetSuggestionPositions[targetTotalMatchingChars]
	if targetPosition < 0 || targetPosition >= totalSuggestions {
		return suggestions
	}
	suggestionsAndTarget := make([]string, 0, totalSuggestions)
	// We are going to insert an other suggestion, so we usually need to eject one (except in some
	// rare occasions where we could not find enough suggestions).
	if len(suggestions) > totalSuggestions-1 {
		suggestions = suggestions[:totalSuggestions-1]
	}
	if targetPosition > 0 {
		suggestionsAndTarget = append(suggestionsAndTarget, suggestions[:targetPosition]...)
	}
	suggestionsAndTarget = append(suggestionsAndTarget, inputCtx.TargetWord)
	if targetPosition < totalSuggestions-1 {
		suggestionsAndTarget = append(suggestionsAndTarget, suggestions[targetPosition:]...)
	}
	return suggestionsAndTarget
}

// InputContext represents a participant's input and its context, in particular
// what has been typed of the current word (InputWord) and the expected
// target word.
type InputContext struct {
	InputWord, TargetWord     string
	CanReplaceLetters         bool
	TargetSuggestionPositions []int
}

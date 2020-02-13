package main

import "fmt"

// InputContext represents a participant's input and its context, in particular
// what has been typed of the current word (InputWord) and the expected
// target word.
type inputContext struct {
	InputWord, TargetWord string
}

type dictEntry struct {
	Word string
	F    int
}

// Dictionary is collection of words and their frequencies. It can be used
// to compute word suggestions.
type Dictionary struct {
	entries []dictEntry
}

type suggestionEntry struct {
	Word  string
	Score float64
}

// GetMockedWordSuggestions computes a list of mocked word suggestions from an input context.
// NOT FUNCTIONAL YET.
// Mocked word suggestions will only contains the target word as indicated in the input context.
// Other suggestions are never worth picking.
func (dict *Dictionary) GetMockedWordSuggestions(inputCtx inputContext, totalSuggestions int) []string {
	suggestions := make([]suggestionEntry, totalSuggestions)
	for i := 0; i < totalSuggestions; i++ {
		suggestions[i] = suggestionEntry{
			Word:  fmt.Sprintf("s-%s-%v", inputCtx.InputWord, i),
			Score: float64(i) / 10,
		}
	}

	// Map back the suggestion entries to the words.
	result := make([]string, len(suggestions))
	for i, e := range suggestions {
		result[i] = e.Word
	}
	return result
}

package dictionary

import (
	"math"
	"strings"
)

const (
	sliceSize = 1000
)

// WordSuggestions returns a list of word suggestions from an inputWord.
func (dict *Dictionary) WordSuggestions(
	inputWord string,
	totalSuggestions int,
	cancel chan bool,
	totalRoutines int,
) []string {
	return dict.FilteredWordSuggestions(
		inputWord,
		totalSuggestions,
		func(_ string) bool { return true },
		cancel,
		totalRoutines,
	)
}

// FilteredWordSuggestions returns a list of word suggestions from an inputWord, filtered using a
// filtering function.
func (dict *Dictionary) FilteredWordSuggestions(
	inputWord string,
	totalSuggestions int,
	filter func(string) bool,
	cancel chan bool,
	totalRoutines int,
) []string {
	if totalSuggestions <= 0 {
		return make([]string, 0)
	}
	if totalRoutines <= 0 {
		// FIXME: it would be better to fail.
		totalRoutines = 1
	}

	runeInputWord := []rune(strings.ToLower(inputWord))

	// Used to send instructions to the sub routines. When closed, there is nothing more to do.
	orders := make(chan []*DictEntry)
	// When they are done, coroutines use this channel to send their results.
	results := make(chan []*suggestionEntry)

	// Start all the routines.
	for i := 0; i < totalRoutines; i++ {
		go func() {
			suggestions := make([]*suggestionEntry, totalSuggestions)
			// While there are more orders to be processed, take one and process it.
			for slice, isNotDone := <-orders; isNotDone; slice, isNotDone = <-orders {
				insertSuggestions(slice, runeInputWord, totalSuggestions, suggestions, filter)
			}
			results <- suggestions
		}()
	}

	// Send all the orders.
	totalOrder := 0
	n := len(dict.Entries)
	for totalOrder < n {
		start := totalOrder
		end := totalOrder + sliceSize
		if end > n {
			end = n
		}
		// If a cancel message is received, stop sending orders and close the channel (as a result
		// the routines will stop), and return.
		select {
		case orders <- dict.Entries[start:end]:
			totalOrder = end
		case <-cancel:
			close(orders)
			return nil
		}
	}
	close(orders)

	// Receive the results and merge them.
	suggestions := make([]*suggestionEntry, totalSuggestions)
	for i := 0; i < totalRoutines; i++ {
		insertEjectAll(suggestions, <-results)
	}

	// Map back the suggestion entries to words.
	isInputCapitalized := isCapitalized(inputWord)
	result := make([]string, 0, len(suggestions))
	for _, e := range suggestions {
		// It may happen that not enough suggestions could be found.
		if e == nil {
			continue
		}
		word := e.Suggestion.Word
		if isInputCapitalized {
			word = capitalize(word)
		}
		// Append a space after each suggestions, because suggestions are always inserted with
		// a space.
		result = append(result, word+" ")
	}
	return result
}

func insertSuggestions(
	entries []*DictEntry,
	inputWord []rune,
	totalSuggestions int,
	suggestions []*suggestionEntry,
	filter func(string) bool,
) {
	for _, e := range entries {
		if !filter(e.Word) {
			continue
		}
		sEntry := suggestionEntry{
			Score:      e.suggestionScore(inputWord),
			Suggestion: e,
		}
		insertEject(suggestions, &sEntry)
	}
}

type suggestionEntry struct {
	Score      float64
	Suggestion *DictEntry
}

// suggestionScore computes the score of the suggestion a DictEntry would be for a specific
// input word, as descibed in https://android.googlesource.com/platform/packages/inputmethods/LatinIME/+/jb-release/native/jni/src/correction.cpp#1098.
// This assumes accents are removed, and that both words are lower case.
func (suggestion *DictEntry) suggestionScore(inputWord []rune) (score float64) {
	suggestionWord := []rune(strings.ToLower(suggestion.Word))
	nSuggestion := len(suggestionWord)
	nInput := len(inputWord)

	minN := intMin(nInput, nSuggestion)

	// This is (almost) the max possible score for this word/suggestion couple.
	// We use it for normalization.
	maxScore := math.Pow(2, float64(minN)) * 255 * 2

	totalMatchingFromStart := totalMatchedCharsFromStart(suggestionWord, inputWord)

	fValue := suggestion.F
	// Checks if input == suggestion, without checking all chars more than once.
	if totalMatchingFromStart == nSuggestion && nSuggestion == nInput {
		fValue = 255
	}

	score = math.Pow(2, float64(totalMatchedChars(suggestionWord, inputWord))) *
		float64(fValue)

	if totalMatchingFromStart == minN {
		score *= 1.2
	}
	if nSuggestion == nInput {
		score *= 2
	}

	// Normalize the score.
	return score / maxScore
}

// insertEject inserts a new entry in a sorted array. It preserves the array
// size, ejecting the entry with the smallest score while inserting the new
// one. If no entries in the array has a smaller score than the new entry, the
// new entry is not inserted.
func insertEject(sEntries []*suggestionEntry, newSEntry *suggestionEntry) {
	newWord := strings.ToLower(newSEntry.Suggestion.Word)
	toInsert := newSEntry
	for i, ei := range sEntries {
		isSame := ei != nil && strings.ToLower(ei.Suggestion.Word) == newWord
		// If we find the same word, and the new entry is already inserted
		// we overwrite it, and quit.
		if ei == nil || ei.Score < toInsert.Score {
			sEntries[i] = toInsert
			toInsert = ei
		}
		if isSame {
			// At this point there is only one word the same as newSEntry in the list,
			// the one with the highest score, while toInsert is the other one.
			// We don't actually want to insert it, so there is nothing more to shift.
			break
		}
	}
}

func insertEjectAll(suggestions, newSuggestions []*suggestionEntry) {
	for _, s := range newSuggestions {
		if s != nil {
			insertEject(suggestions, s)
		}
	}
}

package dictionary

import (
	"log"
	"math"
	"runtime"
	"strings"
	"time"
)

const (
	maxSimultaneousParticipants = 2
	sliceSize                   = 1000
)

// Half of the CPUs are kept for main thread, OS and other apps, but we want to make sure we have at least one.
var totalRoutines = int(math.Max(
	1,
	math.Floor(float64(runtime.NumCPU()))/(2*maxSimultaneousParticipants),
))

// WordSuggestions returns a list of word suggestions from an inputWord.
func (dict *Dictionary) WordSuggestions(
	inputWord string,
	totalSuggestions int,
	cancel chan bool,
) []string {
	return dict.FilteredWordSuggestions(
		inputWord,
		totalSuggestions,
		func(_ string) bool { return true },
		cancel,
	)
}

// FilteredWordSuggestions returns a list of word suggestions from an inputWord, filtered using
// filter.
func (dict *Dictionary) FilteredWordSuggestions(
	inputWord string,
	totalSuggestions int,
	filter func(string) bool,
	cancel chan bool,
) []string {
	start := time.Now()
	runeInputWord := []rune(strings.ToLower(inputWord))

	results := make(chan []*suggestionEntry)
	orders := make(chan []*DictEntry)

	for i := 0; i < totalRoutines; i++ {
		go func() {
			suggestions := make([]*suggestionEntry, totalSuggestions)
			for slice, ok := <-orders; ok; slice, ok = <-orders {
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

	// Map back the suggestion entries to the words.
	isInputCapitalized := isCapitalized(inputWord)
	result := make([]string, 0, len(suggestions))
	for _, e := range suggestions {
		if e != nil {
			word := e.Suggestion.Word
			if isInputCapitalized {
				word = capitalize(word)
			}
			result = append(result, word+" ")
		}
	}
	elapsed := time.Now().Sub(start)
	log.Printf("Computed suggestions for \"%s\" in %v with %v routines", inputWord, elapsed, totalRoutines)
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

// This assumes accents are removed, and that both words are lower case.
func (suggestion *DictEntry) suggestionScore(inputWord []rune) (score float64) {
	suggestionWord := []rune(strings.ToLower(suggestion.Word))
	nSuggestion := len(suggestionWord)
	nInput := len(inputWord)
	minLength := nInput
	if nSuggestion < minLength {
		minLength = nSuggestion
	}
	// This is (almost) the max possible score for this word/suggestion couple.
	// We use it for normalization.
	maxScore := math.Pow(2, float64(minLength)) * 255 * 2
	totalMatchingFromStart := totalMatchedCharsFromStart(suggestionWord, inputWord)

	multiplier := 1.0
	if totalMatchingFromStart == minLength {
		multiplier *= 1.2
	}
	if nSuggestion == nInput {
		multiplier *= 2
	}

	sugFScore := suggestion.F
	// Check if input == suggestion
	if totalMatchingFromStart == nSuggestion && totalMatchingFromStart == nInput {
		sugFScore = 255
	}
	score = math.Pow(2, float64(totalMatchedChars(suggestionWord, inputWord))) *
		float64(sugFScore) *
		multiplier

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
		insertEject(suggestions, s)
	}
}

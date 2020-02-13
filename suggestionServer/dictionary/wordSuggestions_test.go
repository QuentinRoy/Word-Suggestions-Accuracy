package dictionary

import (
	"strings"
	"testing"
)

func joinWords(sEntries []*suggestionEntry) string {
	var str strings.Builder
	for i, e := range sEntries {
		if i > 0 {
			str.WriteRune(',')
		}
		if e == nil {
			str.WriteString("nil")
		} else {
			str.WriteString(e.Suggestion.Word)
		}
	}
	return str.String()
}

func checkEntrieScores(sEntries []*suggestionEntry, expectedWords []string) bool {
	for i, e := range sEntries {
		if e == nil {
			if i < len(expectedWords) {
				return false
			}
		} else {
			if i >= len(expectedWords) {
				return false
			}
			expectedWord := expectedWords[i]
			if e.Suggestion.Word != expectedWord {
				return false
			}
		}
	}
	return true
}

func newSEntry(score float64, word string) *suggestionEntry {
	return &suggestionEntry{Score: score, Suggestion: &DictEntry{Word: word}}
}

func TestInsertEject(t *testing.T) {
	check := func(num int, sEntries []*suggestionEntry, expectedWords []string) {
		if !checkEntrieScores(sEntries, expectedWords) {
			t.Errorf(
				"insertEject %v was incorrect, words were %s, expected %s",
				num,
				joinWords(sEntries),
				strings.Join(expectedWords, ","),
			)
		}
	}

	sEntries := make([]*suggestionEntry, 3)
	insertEject(sEntries, newSEntry(0.2, "2"))
	check(1, sEntries, []string{"2"})

	insertEject(sEntries, newSEntry(0.1, "1"))
	check(2, sEntries, []string{"2", "1"})

	insertEject(sEntries, newSEntry(0.3, "3"))
	check(3, sEntries, []string{"3", "2", "1"})

	insertEject(sEntries, newSEntry(0.25, "25"))
	check(4, sEntries, []string{"3", "25", "2"})

	insertEject(sEntries, newSEntry(0.1, "1"))
	check(5, sEntries, []string{"3", "25", "2"})

	insertEject(sEntries, newSEntry(0.4, "4"))
	check(6, sEntries, []string{"4", "3", "25"})

	// We do not want the same word to be added twice.
	insertEject(sEntries, newSEntry(0.28, "4"))
	check(6, sEntries, []string{"4", "3", "25"})
}

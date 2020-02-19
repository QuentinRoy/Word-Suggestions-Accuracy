package dictionary

import "strings"

func totalMatchedCharsFromStart(s1, s2 []rune) (count int) {
	n2 := len(s2)
	for i, r1 := range s1 {
		if i >= n2 || r1 != s2[i] {
			break
		}
		count++
	}
	return
}

func totalMatchedChars(s1, s2 []rune) (count int) {
	n2 := len(s2)
	for i, r1 := range s1 {
		if i >= n2 {
			break
		}
		if r1 == s2[i] {
			count++
		}
	}
	return
}

func isCapitalized(s string) bool {
	if s == "" {
		return false
	}
	return strings.ToUpper(s[:1]) == s[:1]
}

func capitalize(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func areRuneSlicesEqual(s1, s2 []rune) bool {
	if len(s1) != len(s2) {
		return false
	}
	for i, r1 := range s1 {
		if r1 != s2[i] {
			return false
		}
	}
	return true
}

func intMin(a, b int) int {
	if b < a {
		return b
	}
	return a
}

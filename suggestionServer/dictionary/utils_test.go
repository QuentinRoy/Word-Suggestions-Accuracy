package dictionary

import "testing"

func TestTotalMatchedCharsFromStart(t *testing.T) {
	check := func(s1, s2 string, expectedTot int) {
		total := totalMatchedCharsFromStart([]rune(s1), []rune(s2))
		if total != expectedTot {
			t.Errorf(
				"totalMatchedCharsFromStart(%s, %s) was incorrect, got: %d, want: %d.",
				s1, s2, total, expectedTot,
			)
		}
	}

	// two similar strings
	check("123456789", "123456789", 9)

	// shorter similar strings
	check("123456789", "1234", 4)
	check("1234", "123456789", 4)

	// partially different strings
	check("aaaaaaa", "aaab", 3)
	check("aaab", "aaaaaaa", 3)
	check("aaaaaaaaa", "aaaaXaa", 4)
	check("aaaaXaa", "aaaaaaaaa", 4)

	// strings that starts differently
	check("aaaaaaa", "baaa", 0)
	check("baaa", "aaaaaaa", 0)

	// empty strings
	check("", "", 0)
	check("", "", 0)
	check("aaaaaaa", "", 0)
	check("", "aaaaaaa", 0)
}

func TestTotalMatchedChars(t *testing.T) {
	check := func(s1, s2 string, expectedTot int) {
		total := totalMatchedChars([]rune(s1), []rune(s2))
		if total != expectedTot {
			t.Errorf(
				"totalMatchedChars(%s, %s) was incorrect, got: %d, want: %d.",
				s1, s2, total, expectedTot,
			)
		}
	}

	// two similar strings
	check("123456789", "123456789", 9)

	// shorter similar strings
	check("123456789", "1234", 4)
	check("1234", "123456789", 4)

	// partially different strings
	check("aaaaaaa", "aaab", 3)
	check("aaab", "aaaaaaa", 3)

	// strings that starts differently
	check("aaaaaaa", "baaa", 3)
	check("baaa", "aaaaaaa", 3)

	// strings with some chars similar, some not
	check("123456789abcd", "--34-6-8-", 4)

	// shifted strings
	check("123456789", "234567891", 0)

	// empty strings
	check("", "", 0)
	check("", "", 0)
	check("aaaaaaa", "", 0)
	check("", "aaaaaaa", 0)
}

func TestIsCapitalized(t *testing.T) {
	if isCapitalized("hello There") {
		t.Error("isCapitalized(\"hello There\") was incorrect, got: true, want: false.")
	}

	if !isCapitalized("Hello there") {
		t.Error("isCapitalized(\"Hello there\") was incorrect, got: false, want: true.")
	}
}

func TestCapitalize(t *testing.T) {
	cap := capitalize("hello There")
	if cap != "Hello There" {
		t.Errorf("capitalize(\"hello There\") was incorrect, got: \"%s\", want: \"Hello There\".", cap)
	}

	cap = capitalize("Hello there")
	if cap != "Hello there" {
		t.Errorf("capitalize(\"hello There\") was incorrect, got: \"%s\", want: \"Hello There\".", cap)
	}
}

func TestAreRuneSlicesEqual(t *testing.T) {
	got := areRuneSlicesEqual([]rune("hello"), []rune("hello"))
	if !got {
		t.Error("areRuneSlicesEqual(hello, hello) = false, want true")
	}

	got = areRuneSlicesEqual([]rune("hella"), []rune("hello"))
	if got {
		t.Error("areRuneSlicesEqual(hella, hello) = true, want false")
	}

	got = areRuneSlicesEqual([]rune("hell"), []rune("hello"))
	if got {
		t.Error("areRuneSlicesEqual(hell, hello) = true, want false")
	}

	got = areRuneSlicesEqual([]rune("hello"), []rune("hell"))
	if got {
		t.Error("areRuneSlicesEqual(hello, hell) = true, want false")
	}
}

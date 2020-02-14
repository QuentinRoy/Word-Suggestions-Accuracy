package dictionary

import "testing"

func TestGetRKSImprovement(t *testing.T) {
	type args struct {
		input, newInput, target string
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{"correct suggestion 1", args{"hello", "hello", "hello there"}, 0},
		{"correct suggestion 2", args{"hel", "hello", "hello there"}, 2},
		{"correct suggestion 3", args{"hel", "hello ", "hello there"}, 3},
		{"correct suggestion 4", args{"hal", "hello", "hello there"}, 6},
		{"correct suggestion 5", args{"forcesss", "force", "force"}, 3},
		{"correct suggestion 6", args{"helo the", "hello there", "hello there"}, 13},

		{"incorrect suggestion 1", args{"hel", "hella", "hello there"}, 0},
		{"incorrect suggestion 2", args{"hel", "hela", "hello there"}, -1},
		{"incorrect suggestion 3", args{"hel", "helo there", "hello there"}, -7},
		{"incorrect suggestion 4", args{"hell", "hell ", "hello there"}, -1},
		{"incorrect suggestion 5", args{"h", "hello you", "hello there"}, 2},
		{"incorrect suggestion 6", args{"hel", "hello", "hello"}, 2},
		{"incorrect suggestion 7", args{"hal", "hello", "hello"}, 6},
		{"incorrect suggestion 8", args{"forcesss", "forces", "force"}, 2},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := GetRKSImprovement([]rune(tt.args.input), []rune(tt.args.newInput), []rune(tt.args.target))
			if got != tt.want {
				t.Errorf(
					"GetRKSImprovement(%s, %s, %s) = %v, want %v",
					tt.args.input, tt.args.newInput, tt.args.target, got, tt.want,
				)
			}
		})
	}
}

import { insertEject } from "../../utils/arrays";
import { isUpperCase } from "../../utils/strings";
import suggestionScore from "./suggestionScore";

export default function getWordSuggestions({
  inputWord,
  targetWord,
  totalSuggestions,
  dictionary,
  filter
}) {
  const isFirstCharUpper =
    inputWord != null &&
    inputWord !== "" &&
    targetWord != null &&
    isUpperCase(inputWord.charAt(0));

  // Pre-fill the top words with the most frequent in the dictionary, provided
  // that none are the same as the target word, but give them a score of
  // 0 so that they are immediately replaced by anything else.
  const topWords = Array.from({ length: totalSuggestions }, () => ({
    word: null,
    score: -1
  }));

  const wordEntryScoreGetter = e => e.score;
  const insertSuggestion = (word, score) => {
    insertEject(topWords, { word, score }, wordEntryScoreGetter);
  };

  const lowerCaseInputWord = inputWord.toLowerCase();

  for (let i = 0; i < dictionary.length; i += 1) {
    const { word, f: frequencyScore } = dictionary[i];
    if (filter(word)) {
      const score = suggestionScore(
        frequencyScore,
        word.toLowerCase(),
        lowerCaseInputWord
      );
      insertSuggestion(`${word} `, score);
    }
  }

  return (
    topWords
      // This may happen if no matching words have been found, in this case we
      // remove them from the list.
      .filter(w => w.word != null)
      .map(
        isFirstCharUpper
          ? w => w.word.charAt(0).toUpperCase() + w.word.slice(1)
          : w => w.word
      )
  );
}

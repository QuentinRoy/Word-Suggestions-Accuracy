const mapWord = transitionMatrix => wordEntry => {
  const { sks, word } = wordEntry;
  const correctSuggestionPositions = [];
  const wordLength = word.length;
  let currentPosition = null;
  // The first position is when none of the word has been typed, the last one
  // when all the word has been typed.
  for (let i = 0; i <= wordLength; i += 1) {
    const remainingLetters = wordLength - i;
    if (remainingLetters <= sks) {
      currentPosition = transitionMatrix.pickNext({
        // The word length includes the trailing space, but the transition
        // matrix is created without it.
        wordLength: wordLength - 1,
        currentPosition
      });
    }
    correctSuggestionPositions.push(
      currentPosition == null ? -1 : currentPosition - 1
    );
  }
  return { ...wordEntry, correctSuggestionPositions };
};

module.exports = function mapCorrectSuggestionPositions(
  transitionMatrix,
  phraseEntry
) {
  return {
    ...phraseEntry,
    words: phraseEntry.words.map(mapWord(transitionMatrix))
  };
};

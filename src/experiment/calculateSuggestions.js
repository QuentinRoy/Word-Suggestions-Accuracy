const calculateSuggestions = (input, text) => {
  const inputLastWord = input.slice(
    input.lastIndexOf(" ") > 0 ? input.lastIndexOf(" ") + 1 : 0
  );
  const arrayText = text.split(" ");
  const wordIndex = [...input].filter(c => c === " ").length;
  const wordFromText =
    wordIndex < arrayText.length
      ? arrayText[wordIndex]
      : arrayText[arrayText.length - 1];
  const wordIndexInText = arrayText.indexOf(wordFromText);
  return { inputLastWord, wordIndexInText, wordFromText };
};

export default calculateSuggestions;

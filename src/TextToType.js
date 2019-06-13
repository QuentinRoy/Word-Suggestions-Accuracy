import React from "react";
import PropTypes from "prop-types";
import "./TextToType.css";

const TextToType = ({ text, correctCharsCount, input }) => {
  const isCorrect = correctCharsCount === text.length;

  return (
    <div>
      <h4>Text to type:</h4>
      <p id="winner-label">
        {isCorrect ? "You typed the text correctly!" : " "}
      </p>
      <div id="text-to-type">
        <span className="correct">{text.slice(0, correctCharsCount)}</span>
        <span className="incorrect">
          {text.slice(correctCharsCount, input.length)}
        </span>
        <span className="text">{text.slice(input.length)}</span>
      </div>
    </div>
  );
};

TextToType.propTypes = {
  text: PropTypes.string.isRequired,
  correctCharsCount: PropTypes.number.isRequired,
  input: PropTypes.string.isRequired
};

export default TextToType;

import React, { useRef } from "react";
import PropTypes from "prop-types";
import styles from "./styles/TutorialOverlay.module.scss";
import Info from "./Info";
import Instruction from "./Instruction";
import Circle, { CircleTypes } from "./Circle";
import RectPropType from "./RectPropType";
import { SuggestionTypes } from "../../../common/constants";
import TopOfBarWrapper from "./TopOfBarWrapper";

const TutorialStepSuggestion = ({
  inputRect,
  inlineSuggestionRect,
  suggestionsBarRect,
  suggestionsType,
  isVirtualKeyboardEnabled,
  totalSuggestions,
}) => {
  // Store this in a ref as we don't want it to change once set up the first
  // time.
  const suggestionRef = useRef(inlineSuggestionRect);
  if (suggestionRef.current == null) {
    suggestionRef.current =
      inlineSuggestionRect == null ? suggestionsBarRect : inlineSuggestionRect;
  }
  if (suggestionsType === SuggestionTypes.inline) {
    if (inlineSuggestionRect == null) return null;
    return (
      <div className={styles.stepSuggestion}>
        <Circle
          rect={suggestionRef.current}
          circleXMargin={10}
          circleYMargin={10}
        />
        <Info
          left={suggestionRef.current.right + 20}
          top={inputRect.top}
          height={inputRect.height}
        >
          Word suggestions will appear as you type.
          <br />
          You can ignore them, or accept them by pressing the key{" "}
          <span className={styles.noWrap}>
            <span className={styles.key}>tab</span> /{" "}
            <span className={styles.key}>&#8677;</span>
          </span>{" "}
          at the left of your keyboard.
        </Info>
        <Instruction>Accept the suggestion.</Instruction>
      </div>
    );
  }
  return (
    <div className={styles.stepSuggestion}>
      <Circle
        rect={suggestionRef.current}
        circleXMargin={15}
        circleYMargin={15}
        rectRadius={30}
        type={CircleTypes.rectangle}
      />
      <TopOfBarWrapper>
        <div className={styles.messagesWrapper}>
          <Info>
            {isVirtualKeyboardEnabled ? (
              <div>
                Word suggestions will be shown and updated as you type. You can
                ignore them, or accept them.
                <br />
                Tap on a suggestion to accept it.
              </div>
            ) : (
              <div>
                Word suggestions will appear as you type. You can ignore them,
                or accept them.
                <br />
                Press <span className={styles.key}>1</span> to accept the first
                suggestion, <span className={styles.key}>2</span> to accept the
                second, and <span className={styles.key}>3</span> to accept the
                third.
              </div>
            )}
          </Info>
          <Instruction>
            Accept the {totalSuggestions > 1 ? "first" : null} suggestion.
          </Instruction>
        </div>
      </TopOfBarWrapper>
    </div>
  );
};
TutorialStepSuggestion.propTypes = {
  inputRect: RectPropType.isRequired,
  suggestionsType: PropTypes.oneOf(Object.values(SuggestionTypes)).isRequired,
  inlineSuggestionRect: RectPropType,
  suggestionsBarRect: RectPropType,
  isVirtualKeyboardEnabled: PropTypes.bool,
  totalSuggestions: PropTypes.number.isRequired,
};
TutorialStepSuggestion.defaultProps = {
  inlineSuggestionRect: undefined,
  suggestionsBarRect: undefined,
  isVirtualKeyboardEnabled: false,
};

export default TutorialStepSuggestion;

import React from "react";
import Keyboard from "react-simple-keyboard";
import PropTypes from "prop-types";
import { KeyboardLayoutNames } from "../utils/constants";

const keyboardProps = Object.freeze({
  layout: {
    [KeyboardLayoutNames.default]: [
      "q w e r t y u i o p",
      "a s d f g h j k l",
      "{shift} z x c v b n m {bksp}",
      "{numbers} {space} {enter}"
    ],
    [KeyboardLayoutNames.shift]: [
      "Q W E R T Y U I O P",
      "A S D F G H J K L",
      "{shift} Z X C V B N M {bksp}",
      "{numbers} {space} {enter}"
    ],
    [KeyboardLayoutNames.numbers]: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {bksp}"]
  },
  display: {
    "{space}": " ",
    "{numbers}": "123",
    "{enter}": "enter",
    "{bksp}": "⌫",
    "{shift}": "⇧",
    "{abc}": "ABC"
  }
});

const VirtualKeyboard = ({ layout, onVirtualKeyDown, onVirtualKeyUp }) => {
  return (
    <Keyboard
      layoutName={layout}
      layout={keyboardProps.layout}
      display={keyboardProps.display}
      onKeyPress={onVirtualKeyDown}
      onKeyReleased={onVirtualKeyUp}
    />
  );
};

VirtualKeyboard.propTypes = {
  layout: PropTypes.string.isRequired,
  onVirtualKeyDown: PropTypes.func.isRequired,
  onVirtualKeyUp: PropTypes.func.isRequired
};

export default VirtualKeyboard;

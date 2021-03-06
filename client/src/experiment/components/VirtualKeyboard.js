import React, { useEffect, memo } from "react";
import Keyboard from "react-simple-keyboard";
import classNames from "classnames";
import PropTypes from "prop-types";
import { KeyboardLayoutNames, Devices } from "../../common/constants";
import {
  vkTheme,
  main,
  enterDisabled,
  backspaceDisabled,
  phone,
  tablet,
} from "./styles/VirtualKeyboard.module.scss";
import usePreventTouchDefault from "../hooks/usePreventTouchDefault";

const phoneKeyboardProps = Object.freeze({
  layout: {
    [KeyboardLayoutNames.default]: [
      "q w e r t y u i o p",
      "a s d f g h j k l",
      "{shift} z x c v b n m {bksp}",
      "{numbers} {space} {enter}",
    ],
    [KeyboardLayoutNames.shift]: [
      "Q W E R T Y U I O P",
      "A S D F G H J K L",
      "{shift} Z X C V B N M {bksp}",
      "{numbers} {space} {enter}",
    ],
    [KeyboardLayoutNames.numbers]: [
      "1 2 3",
      "4 5 6",
      "7 8 9",
      "{abc} 0 {bksp}",
    ],
  },
  display: {
    "{space}": " ",
    "{numbers}": "123",
    "{enter}": "enter",
    "{bksp}": "⌫",
    "{shift}": "⇧",
    "{abc}": "ABC",
  },
});

const tabletKeyboardProps = Object.freeze({
  ...phoneKeyboardProps,
  layout: {
    ...phoneKeyboardProps.layout,
    [KeyboardLayoutNames.default]: [
      "q w e r t y u i o p {bksp}",
      "a s d f g h j k l {enter}",
      "{shift} z x c v b n m {shift}",
      "{numbers} {space} {numbers}",
    ],
    [KeyboardLayoutNames.shift]: [
      "Q W E R T Y U I O P {bksp}",
      "A S D F G H J K L {enter}",
      "{shift} Z X C V B N M {shift}",
      "{numbers} {space} {numbers}",
    ],
  },
});

// This ensures all the keyboard's letter keys have the same size.
const adjustButtonsSize = (container) => {
  const standardBtns = container.querySelectorAll(".hg-standardBtn");
  standardBtns.forEach((b) => {
    // eslint-disable-next-line no-param-reassign
    b.style.width = null;
    // eslint-disable-next-line no-param-reassign
    b.style.flexGrow = 1;
  });
  const smallestWidth = Array.prototype.reduce.call(
    standardBtns,
    (smallest, b) => {
      const { width } = b.getBoundingClientRect();
      return width < smallest ? width : smallest;
    },
    Number.POSITIVE_INFINITY
  );
  standardBtns.forEach((b) => {
    // eslint-disable-next-line no-param-reassign
    b.style.width = `${smallestWidth}px`;
    // eslint-disable-next-line no-param-reassign
    b.style.flexGrow = 0;
  });
};

const VirtualKeyboard = memo(
  ({
    layout,
    device,
    onVirtualKeyDown,
    onVirtualKeyUp,
    isEnterDisabled,
    isBackspaceDisabled,
  }) => {
    const ref = usePreventTouchDefault();

    useEffect(() => {
      const handler = () => adjustButtonsSize(ref.current);
      window.addEventListener("resize", handler);
      handler();
      return () => window.removeEventListener("resize", handler);
    }, [layout, ref]);

    const keyboardProps =
      device === Devices.phone ? phoneKeyboardProps : tabletKeyboardProps;

    return (
      <div
        className={classNames(main, {
          [enterDisabled]: isEnterDisabled,
          [backspaceDisabled]: isBackspaceDisabled,
          [phone]: device === Devices.phone,
          [tablet]: device === Devices.tablet,
        })}
        ref={ref}
      >
        <Keyboard
          theme={`${vkTheme} hg-theme-default`}
          useTouchEvents
          useButtonTag
          layoutName={layout}
          layout={keyboardProps.layout}
          display={keyboardProps.display}
          onKeyPress={onVirtualKeyDown}
          onKeyReleased={onVirtualKeyUp}
        />
      </div>
    );
  }
);

VirtualKeyboard.propTypes = {
  layout: PropTypes.string.isRequired,
  device: PropTypes.oneOf(Object.values(Devices)).isRequired,
  onVirtualKeyDown: PropTypes.func.isRequired,
  onVirtualKeyUp: PropTypes.func.isRequired,
  isEnterDisabled: PropTypes.bool.isRequired,
  isBackspaceDisabled: PropTypes.bool.isRequired,
};

export default VirtualKeyboard;

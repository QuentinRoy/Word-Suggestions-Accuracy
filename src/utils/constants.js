export const KeyboardLayoutNames = Object.freeze({
  default: "default",
  shift: "shift",
  numbers: "numbers"
});
const mobileLayout = Object.freeze({
  id: "mobile",
  mergeDisplay: true,
  layoutName: KeyboardLayoutNames.default,
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
    "{enter}": "return",
    "{bksp}": "⌫",
    "{shift}": "⇧",
    "{abc}": "ABC"
  }
});
const desktopLayout = Object.freeze({
  id: "physical",
  mergeDisplay: true,
  layoutName: KeyboardLayoutNames.default,
  layout: {
    [KeyboardLayoutNames.default]: [
      "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
      "{tab} q w e r t y u i o p [ ] \\",
      "{lock} a s d f g h j k l ; ' {enter}",
      "{shift} z x c v b n m , . / {shift}",
      ".com @ {space}"
    ],
    [KeyboardLayoutNames.shift]: [
      "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
      "{tab} Q W E R T Y U I O P { } |",
      '{lock} A S D F G H J K L : " {enter}',
      "{shift} Z X C V B N M < > ? {shift}",
      ".com @ {space}"
    ]
  }
});
export const KeyboardLayouts = Object.freeze({
  mobile: mobileLayout,
  desktop: desktopLayout
});

export const LoadingStates = Object.freeze({
  loading: "loading",
  loaded: "loaded",
  crashed: "crashed",
  invalidArguments: "invalidArguments"
});

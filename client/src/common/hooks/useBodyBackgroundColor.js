import { useLayoutEffect, useRef } from "react";

// This stack process makes sure that the effects are cleaned up in the reversed
// order they are started. By default, the parent's effect is cleaned up before
// the child's.
const stack = [];

function traverse() {
  if (stack.length === 0) {
    return;
  }
  const last = stack[stack.length - 1];
  if (last.isActive) {
    document.body.style.backgroundColor = last.color;
    return;
  }
  stack.pop();
  if (stack.length === 0) {
    document.body.style.backgroundColor = last.replacedColor;
    return;
  }
  traverse();
}

const useBodyBackgroundColor = (color) => {
  const { current: token } = useRef({ color, isActive: true });
  token.color = color;

  useLayoutEffect(() => {
    token.replacedColor = document.body.style.backgroundColor;
    stack.push(token);
    traverse();
    return () => {
      token.isActive = false;
      traverse();
    };
  }, [token]);
};

export default useBodyBackgroundColor;

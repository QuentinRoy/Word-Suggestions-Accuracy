/* eslint-disable import/prefer-default-export */

// Javascript's % operator is a reminder operator, not modulo. It can return a
// negative number. This functions implements modulo.
export function mod(n, m) {
  return ((n % m) + m) % m;
}

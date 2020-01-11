const { balancedLatinSquare, fullCounterbalancing } = require('./ordering');

describe('balancedLatinSquare', () => {
  it('creates a balanced latin square for an even number of values', () => {
    // This result comes from http://statpages.info/latinsq.html
    expect(balancedLatinSquare(['A', 'B', 'C', 'D', 'E', 'F'])).toEqual([
      ['A', 'B', 'F', 'C', 'E', 'D'],
      ['B', 'C', 'A', 'D', 'F', 'E'],
      ['C', 'D', 'B', 'E', 'A', 'F'],
      ['D', 'E', 'C', 'F', 'B', 'A'],
      ['E', 'F', 'D', 'A', 'C', 'B'],
      ['F', 'A', 'E', 'B', 'D', 'C']
    ]);
  });

  it('creates a balanced latin square for an odd number of values', () => {
    // This result comes from http://statpages.info/latinsq.html
    expect(balancedLatinSquare(['A', 'B', 'C', 'D', 'E'])).toEqual([
      ['A', 'B', 'E', 'C', 'D'],
      ['B', 'C', 'A', 'D', 'E'],
      ['C', 'D', 'B', 'E', 'A'],
      ['D', 'E', 'C', 'A', 'B'],
      ['E', 'A', 'D', 'B', 'C'],
      ['D', 'C', 'E', 'B', 'A'],
      ['E', 'D', 'A', 'C', 'B'],
      ['A', 'E', 'B', 'D', 'C'],
      ['B', 'A', 'C', 'E', 'D'],
      ['C', 'B', 'D', 'A', 'E']
    ]);
  });
});

describe('fullCounterbalancing', () => {
  it('generates all permutations', () => {
    expect(fullCounterbalancing(['A', 'B', 'C'])).toEqual([
      ['A', 'B', 'C'],
      ['A', 'C', 'B'],
      ['B', 'A', 'C'],
      ['B', 'C', 'A'],
      ['C', 'A', 'B'],
      ['C', 'B', 'A']
    ]);
  });
});

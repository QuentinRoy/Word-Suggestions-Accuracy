/**
 * @name ListPredicate
 * @function
 * @param {*} value A value
 * @param {number} index The value index in the list.
 * @return {boolean}
 */

export const sum = list => list.reduce((r, x) => r + x);

export const mean = list => sum(list) / list.length;

export const sd = (lst, lstMean = mean(lst)) => {
  const squareDiffs = lst.map(x => (x - lstMean) ** 2);
  return Math.sqrt(sum(squareDiffs) / lst.length);
};

export const count = (lst, predicate) =>
  lst.reduce((c, x, i) => (predicate(x, i) ? c + 1 : c), 0);

/**
 * @param {*[]} lst a list
 * @param {number} startIndex the index from which to start the slice
 * @param {number} maxItems the maximum number of items to insert in the slice
 * @param {ListPredicate} predicate a predicate
 * @returns {*[]} a slice of up to maxItems from lst, containing only items that
 * passes predicate.
 */
export const sliceIf = (lst, startIndex, maxItems, predicate) => {
  const result = [];
  for (let i = startIndex; i < lst.length && result.length < maxItems; i += 1) {
    if (predicate(lst[i], i)) result.push(lst[i]);
  }
  return result;
};

/**
 * @name ScoreGetter
 * @function
 * @param {*} value A value
 * @return {number}
 */

/**
 * Insert a new entry in a sorted array. It preserves the array size, ejecting
 * the entry with the smallest score while inserting the new one. If no entries
 * in the array has a smaller score than the new entry, the new entry is not
 * inserted.
 * Mutates the array.
 *
 * @param {*[]} entries the array
 * @param {*} newEntry the new entry
 * @param {ScoreGetter} getScore a function to call to get the score
 * corresponding to an entry. It must be fast!
 * @return {undefined}
 */
export const insertEject = (entries, newEntry, getScore) => {
  const newEntryScore = getScore(newEntry);
  let i = entries.length - 1;
  if (getScore(entries[i]) >= newEntryScore) return;
  while (i > 0 && newEntryScore > getScore(entries[i - 1])) {
    // eslint-disable-next-line no-param-reassign
    entries[i] = entries[i - 1];
    i -= 1;
  }
  // eslint-disable-next-line no-param-reassign
  entries[i] = newEntry;
};

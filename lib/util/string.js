/**
 * Split a string into match and non-match substrings based on finding
 * all whitespace-separated terms in a given filter string (for UI search
 * bars).
 * @param {string} str - string to search
 * @param {string} filterStr - string with filter/search terms
 * @returns {Array} list of alternating matching and non-matching substrings
 * in order of the original string; even = match, odd = no match
 * @example
 * stringFilterMatches('my example string', 'ex my');
 * // ['my', ' ', 'ex', 'ample string']
 */
export function stringFilterMatches(str, filterStr) {
  // ensure there's a non-empty filter
  filterStr = filterStr && filterStr.trim();
  if (!filterStr) {
    return [``, str];
  }

  // prepare string and filter for search conditions
  const matchStr = str.toLowerCase();
  const searchTerms = filterStr.toLowerCase().split(` `).filter(Boolean);

  // find all matching positions
  const matchPositions = Array(str.length).fill(false);
  for (let term of searchTerms) {
    const matchIdx = matchStr.indexOf(term);
    if (matchIdx === -1) {
      return null; // short-circuit stop for non-match
    }
    for (let mi = matchIdx; mi < matchIdx + term.length; mi++) {
      matchPositions[mi] = true;
    }
  }

  // merge into match and non-match strings
  const matches = [];
  let i = 0;
  while (i < matchPositions.length) {
    let matchStr = ``;
    let nonMatchStr = ``;

    while (i < matchPositions.length && matchPositions[i]) {
      matchStr += str[i++];
    }
    while (i < matchPositions.length && !matchPositions[i]) {
      nonMatchStr += str[i++];
    }

    matches.push(matchStr);
    matches.push(nonMatchStr);
  }

  return matches;
}

export function toSentenceCase(string) {
  const str = (string || ``).toString();
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}

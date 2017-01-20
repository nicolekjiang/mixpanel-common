/**
 * Turn a less-than-or-equal-to operation into a function which returns 1, 0, or -1 for sorting.
 * @param {(Object,Object) => Bool} leq - function implementing leq for the desired ordering.
 */
export function leqToNumericOrdering(leq) {
  return (a, b) => leq(a, b) ? (leq(b, a) ? 0 : -1) : 1;
}

/**
 * Map a function over the arguments of a function before calling the function
 */
export function mapArguments(fn, argMap) {
  return function(...args) { return fn.apply(this, args.map(argMap)); };
}

/**
 * compose two orderings lexically to create a single combined ordering.
 */
export function lexicalCompose(fn1, fn2) {
  return (a, b) => {
    let cmp = fn1(a, b);
    return cmp === 0 ? fn2(a, b) : cmp;
  };
}

export const defaultOrdering = leqToNumericOrdering((a, b) => a <= b);

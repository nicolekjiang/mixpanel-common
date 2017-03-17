/** Cache object used to store key/value pairs in memory **/
export class Cache {
  /**
   * Create a Cache
   */
  constructor() {
    this._cache = new Map();
  }

  /**
   * Add a value to the cache under key
   * @param {string} key - the key to store the value under
   * @param {*} value - the value to be stored
   */
  add(key, value) {
    this._cache.set(key, value);
  }

  /**
   * Fetch a value from the cache under key.
   * On cache miss, use defaultValue to return value (and store it in the cache).
   * If no defaultValue supplied, cache miss will return null
   * @param {string} key - the key to fetch a value for
   * @param {*} [defaultValue] - if Function, will be called (with key as argument) to obtain value. Otherwise, will be used directly as value.
   */
  fetch(key, defaultValue=null) {
    if (!this._cache.has(key)) {
      this.add(key, defaultValue instanceof Function ? defaultValue(key) : defaultValue);
    }
    return this._cache.get(key);
  }
}

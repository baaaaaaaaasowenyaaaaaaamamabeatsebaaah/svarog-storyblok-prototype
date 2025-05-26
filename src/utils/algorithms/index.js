/**
 * Algorithmic utilities following the Three-Step Optimization Process
 * Provides O(1) and O(log n) solutions for common operations
 */

/**
 * Binary search implementation - O(log n)
 * @param {Array} sortedArray - Sorted array to search
 * @param {*} target - Target value to find
 * @returns {number} Index of target or -1 if not found
 */
export const binarySearch = (sortedArray, target) => {
  let left = 0;
  let right = sortedArray.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = sortedArray[mid];

    if (midValue === target) return mid;
    if (midValue < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
};

/**
 * Memoization utility for expensive calculations - O(1) cache access
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Efficient array deduplication using Set - O(n)
 * @param {Array} array - Array to deduplicate
 * @returns {Array} Deduplicated array
 */
export const deduplicate = array => [...new Set(array)];

/**
 * Fast object property lookup using Map - O(1)
 * @param {Array<Object>} objects - Array of objects
 * @param {string} key - Property key to index by
 * @returns {Map} Map with key -> object mapping
 */
export const createLookupMap = (objects, key) => {
  return new Map(objects.map(obj => [obj[key], obj]));
};

/**
 * Efficient batch operations processor
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 * @param {number} batchSize - Size of each batch
 * @returns {Promise<Array>} Processed results
 */
export const processBatches = async (items, processor, batchSize = 100) => {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }

  return results;
};

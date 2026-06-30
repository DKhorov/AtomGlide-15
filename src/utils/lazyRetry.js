
/**
 * Retry a dynamic import with exponential backoff
 * @param {Function} importFn - The dynamic import function
 * @param {number} retries - Number of retry attempts (default: 3)
 * @param {number} interval - Initial retry interval in ms (default: 1000)
 * @returns {Promise} - Resolves with the imported module
 */
export const lazyRetry = (importFn, retries = 3, interval = 1000) => {
  return new Promise((resolve, reject) => {
    importFn()
      .then(resolve)
      .catch((error) => {
        // If we've exhausted retries, reject
        if (retries === 0) {
          console.error('Failed to load chunk after retries:', error);
          reject(error);
          return;
        }

        console.warn(`Chunk load failed, retrying... (${retries} attempts left)`);

        // Retry after interval with exponential backoff
        setTimeout(() => {
          lazyRetry(importFn, retries - 1, interval * 2)
            .then(resolve)
            .catch(reject);
        }, interval);
      });
  });
};

/**
 * Create a lazy component with retry logic
 * @param {Function} importFn - The dynamic import function
 * @param {number} retries - Number of retry attempts
 * @returns {React.LazyExoticComponent} - Lazy component with retry
 */
export const lazyWithRetry = (importFn, retries = 3) => {
  return lazyRetry(importFn, retries);
};

export default lazyRetry;

/*
 AtomGlide Front-end Client - 15 Version Legacy
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2026 Project 01.07.2026 0:00:00 MSK
*/
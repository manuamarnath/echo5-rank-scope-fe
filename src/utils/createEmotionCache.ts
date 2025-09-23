import createCache from '@emotion/cache';

// Create a cache that can be shared across components
export default function createEmotionCache() {
  return createCache({ key: 'css', prepend: true });
}
import { lazy } from 'react';

// After a new version is deployed the old page chunks are gone from the server. A tab that was
// already open then fails to load the next page ("Failed to fetch dynamically imported module")
// and shows an error screen. The fix is simply to load the new version: reload once, and only once
// (a flag stops a reload loop if the file is really missing).
const FLAG = 'chopnow-chunk-reload';

export default function lazyWithRetry(importer) {
  return lazy(async () => {
    try {
      const module = await importer();
      sessionStorage.removeItem(FLAG);
      return module;
    } catch (error) {
      const looksLikeStaleChunk =
        /dynamically imported module|Importing a module script failed|Loading chunk/i.test(
          String(error?.message || error)
        );
      let alreadyTried = false;
      try {
        alreadyTried = sessionStorage.getItem(FLAG) === '1';
        if (looksLikeStaleChunk && !alreadyTried) sessionStorage.setItem(FLAG, '1');
      } catch {
        /* storage unavailable: fall through to the normal error screen */
      }
      if (looksLikeStaleChunk && !alreadyTried) {
        window.location.reload();
        // keep React waiting while the page reloads rather than flashing an error
        return new Promise(() => {});
      }
      throw error;
    }
  });
}

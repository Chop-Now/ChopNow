/**
 * Shrinks a photo before upload. A phone camera photo is routinely 3-12MB,
 * while the API accepts 5MB per file, so an unprocessed upload from a phone
 * fails (or burns the user's mobile data) for no good reason.
 *
 * Images are scaled so the longest edge is at most `maxDimension` and
 * re-encoded as JPEG. EXIF rotation is applied, so the result is upright.
 * Anything that isn't a raster photo (PDF, GIF, SVG, ...) and photos that are
 * already small are returned untouched, and so is the original if anything
 * goes wrong, so this can only make an upload smaller, never break it.
 */
const SKIP_BELOW_BYTES = 600 * 1024;

const loadBitmap = async (file) => {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file, { imageOrientation: 'from-image' });
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
};

export async function compressImage(file, { maxDimension = 2000, quality = 0.82 } = {}) {
  try {
    if (!file || !/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type)) return file;
    if (file.size <= SKIP_BELOW_BYTES && /^image\/(jpeg|webp)$/i.test(file.type)) return file;

    const bitmap = await loadBitmap(file);
    const width = bitmap.width || bitmap.naturalWidth;
    const height = bitmap.height || bitmap.naturalHeight;
    const scale = Math.min(1, maxDimension / Math.max(width, height));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    // JPEG has no alpha: paint white first so transparent PNGs don't turn black.
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (typeof bitmap.close === 'function') bitmap.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}

export const compressImages = (files, options) =>
  Promise.all(Array.from(files).map((file) => compressImage(file, options)));

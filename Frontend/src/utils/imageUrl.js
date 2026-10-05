/**
 * Asks Cloudinary for a right-sized, auto-format (WebP/AVIF) copy of an
 * uploaded photo. Vendors upload straight from phone cameras (several MB); the
 * app shows them at a few hundred pixels, so serving the original wastes data
 * and delays the first paint. Anything that isn't a plain Cloudinary delivery
 * URL (placeholders, local assets, URLs that already carry a transformation)
 * is returned untouched.
 */
const CLOUDINARY_UPLOAD = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/;

export function optimizedImage(url, width = 600) {
  if (typeof url !== 'string') return url;
  const match = url.match(CLOUDINARY_UPLOAD);
  if (!match) return url;
  return `${match[1]}f_auto,q_auto,c_limit,w_${width}/${match[2]}`;
}

/** srcSet for the common widths, so a phone downloads the small one. */
export function optimizedSrcSet(url, widths = [320, 480, 800]) {
  if (typeof url !== 'string' || !CLOUDINARY_UPLOAD.test(url)) return undefined;
  return widths.map((w) => `${optimizedImage(url, w)} ${w}w`).join(', ');
}

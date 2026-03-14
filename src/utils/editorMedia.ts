import * as FileSystem from 'expo-file-system';

const IMAGE_EXT_TO_MIME: Record<string, string> = {
  jpg: 'jpeg',
  jpeg: 'jpeg',
  jpe: 'jpeg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
  heic: 'heic',
  heif: 'heif',
};

function guessImageMimeType(uri: string): string {
  const cleanUri = uri.split('?')[0].split('#')[0];
  const ext = cleanUri.split('.').pop()?.toLowerCase() || '';
  const mimeSubtype = IMAGE_EXT_TO_MIME[ext] || 'png';
  return `image/${mimeSubtype}`;
}

export async function imageUriToDataUri(uri: string): Promise<string> {
  if (!uri) {
    throw new Error('Image URI is missing.');
  }

  if (/^data:image\//i.test(uri)) {
    return uri;
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return `data:${guessImageMimeType(uri)};base64,${base64}`;
}

export async function normalizeEditorHtmlImages(html: string): Promise<string> {
  if (!html) return html;

  const imgSrcPattern = /<img\b[^>]*\bsrc=(["'])([^"']+)\1[^>]*>/gi;
  const matches = Array.from(html.matchAll(imgSrcPattern));

  if (matches.length === 0) return html;

  let normalizedHtml = html;

  for (const match of matches) {
    const src = match[2];
    const isLocalImage = /^(file|content):\/\//i.test(src);
    const isEmbeddedImage = /^data:image\//i.test(src);

    if (!isLocalImage || isEmbeddedImage) continue;

    try {
      const dataUri = await imageUriToDataUri(src);
      normalizedHtml = normalizedHtml.replace(src, dataUri);
    } catch {
      // If a stale local path can no longer be read, keep the original src untouched.
    }
  }

  return normalizedHtml;
}

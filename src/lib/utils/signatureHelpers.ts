/**
 * Convert dataURL to Blob for file upload
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Invalid data URL');
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Validate signature canvas is not empty
 */
export function isCanvasEmpty(canvas: HTMLCanvasElement): boolean {
  const context = canvas.getContext('2d');
  if (!context) return true;
  
  const pixelBuffer = new Uint32Array(
    context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );
  
  return !pixelBuffer.some(color => color !== 0);
}

/**
 * Validate blob size (max 2MB)
 */
export function validateBlobSize(blob: Blob, maxSizeMB: number = 2): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return blob.size <= maxSizeBytes;
}

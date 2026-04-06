/**
 * Server-side file type validation using magic bytes (file signatures).
 * Prevents uploading executables/scripts disguised as legitimate documents.
 */

const MAGIC_BYTES: Record<string, number[][]> = {
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
  "image/png": [[0x89, 0x50, 0x4e, 0x47]], // .PNG
  "image/jpeg": [[0xff, 0xd8, 0xff]], // JPEG SOI
  // DOCX/XLSX are ZIP archives (PK header)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
  ],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    [0x50, 0x4b, 0x03, 0x04],
    [0x50, 0x4b, 0x05, 0x06],
  ],
};

/**
 * Verify that a file's actual content matches its declared MIME type by
 * checking magic bytes. Returns true if the file header is valid for its
 * claimed type, or if we don't have a signature to check (fail-open for
 * unknown types — file extension + MIME check is still applied elsewhere).
 */
export async function verifyFileMagicBytes(file: File): Promise<boolean> {
  const signatures = MAGIC_BYTES[file.type];
  if (!signatures) {
    // No known signature for this type — rely on extension/MIME checks
    return true;
  }

  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    return signatures.some((sig) =>
      sig.every((byte, i) => bytes[i] === byte),
    );
  } catch {
    return false;
  }
}

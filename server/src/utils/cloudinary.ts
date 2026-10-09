import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { logger } from './logger.js';

// Configure Cloudinary from environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  logger.info('Cloudinary initialized for evidence asset storage.');
} else {
  logger.info('Cloudinary credentials not detected; evidence will be stored in local vault until configured.');
}

export interface UploadResult {
  sha256: string;
  storagePath: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  mimeType: string;
  byteSize: number;
}

/**
 * Uploads a document (PDF or Image) to Cloudinary and also writes an immutable
 * local copy indexed by cryptographic SHA-256 hash for local audit verification.
 */
export async function uploadEvidenceFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadResult> {
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  const byteSize = buffer.length;

  // Local storage guarantee
  const ext = extname(originalName) || (mimeType.startsWith('image/') ? '.png' : '.pdf');
  const evidenceDir = resolve(process.env.ESG_UPLOAD_DIR ?? join(process.cwd(), 'uploads', 'evidence'));
  await mkdir(evidenceDir, { recursive: true });
  const storagePath = join(evidenceDir, `${sha256}${ext}`);

  await writeFile(storagePath, buffer, { flag: 'w' });

  let cloudinaryUrl = '';
  let cloudinaryPublicId = '';

  if (isCloudinaryConfigured) {
    try {
      const uploadResponse = await new Promise<UploadApiResponse>((resolveUpload, rejectUpload) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'esg_evidence',
            resource_type: 'auto',
            public_id: sha256,
            tags: ['esg', 'evidence', 'compliance'],
          },
          (error, result) => {
            if (error || !result) rejectUpload(error ?? new Error('Cloudinary upload returned empty response'));
            else resolveUpload(result);
          }
        );
        stream.end(buffer);
      });

      cloudinaryUrl = uploadResponse.secure_url;
      cloudinaryPublicId = uploadResponse.public_id;
      logger.info(`Evidence uploaded to Cloudinary: ${cloudinaryUrl}`);
    } catch (uploadErr) {
      logger.warn(`Cloudinary upload failed, falling back to local audit storage: ${(uploadErr as Error).message}`);
    }
  }

  return {
    sha256,
    storagePath,
    cloudinaryUrl,
    cloudinaryPublicId,
    mimeType,
    byteSize,
  };
}

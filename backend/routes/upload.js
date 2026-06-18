// routes/upload.js — handles file upload requests
// Flow: frontend asks for upload URL → we generate pre-signed S3 URL
//       → frontend uploads directly to S3 → we save metadata to DB

const express = require('express');
const router  = express.Router();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { nanoid } = require('nanoid');
const pool = require('../db');

const s3 = new S3Client({ region: process.env.AWS_REGION });

// POST /api/upload
// Body: { filename, mimeType, sizeBytes, expiryHours }
router.post('/', async (req, res) => {
  try {
    const { filename, mimeType, sizeBytes, expiryHours = 24 } = req.body;

    if (!filename || !sizeBytes) {
      return res.status(400).json({ error: 'filename and sizeBytes are required' });
    }

    // Generate a unique short ID for the share link
    const id    = nanoid(12);
    const s3Key = `uploads/${id}/${filename}`;

    // Ask S3 for a pre-signed URL — valid for 15 minutes to complete the upload
    const command = new PutObjectCommand({
      Bucket:      process.env.S3_BUCKET,
      Key:         s3Key,
      ContentType: mimeType,
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    // Calculate when this share link should expire
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + Number(expiryHours));

    // Save file metadata to the database
    await pool.query(
      `INSERT INTO files (id, original_name, s3_key, size_bytes, mime_type, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, filename, s3Key, sizeBytes, mimeType, expiresAt]
    );

    // Return the pre-signed upload URL and the share link ID
    res.json({
      uploadUrl,
      shareLink: `${process.env.BASE_URL || 'http://localhost:3000'}/api/download/${id}`,
      id,
      expiresAt,
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

module.exports = router;

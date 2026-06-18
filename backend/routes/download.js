// routes/download.js — handles file download requests
// Flow: someone visits the share link → we check DB → if valid,
//       generate a pre-signed S3 GET URL and redirect them to it

const express = require('express');
const router  = express.Router();
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const pool = require('../db');

const s3 = new S3Client({ region: process.env.AWS_REGION });

// GET /api/download/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Look up the file in the database
    const result = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    // File not found
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = result.rows[0];

    // Check if the link has expired
    if (new Date() > new Date(file.expires_at)) {
      return res.status(410).json({ error: 'This link has expired' });
    }

    // Increment download count
    await pool.query(
      'UPDATE files SET download_count = download_count + 1 WHERE id = $1',
      [id]
    );

    // Generate a pre-signed GET URL from S3 (valid for 5 minutes)
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key:    file.s3_key,
      ResponseContentDisposition: `attachment; filename="${file.original_name}"`,
    });
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // Redirect the user directly to the S3 download URL
    res.redirect(downloadUrl);

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Failed to generate download URL' });
  }
});

module.exports = router;

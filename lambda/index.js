const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Pool } = require("pg");

const s3 = new S3Client({});

// Single connection string - no room for mismatch
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
});

exports.handler = async function(event) {
  console.log("Cleanup Lambda started at " + new Date().toISOString());

  var deleted = 0;
  var errors = 0;

  try {
    var result = await pool.query(
      "SELECT id, s3_key, original_name FROM files WHERE expires_at < NOW() AND is_deleted = FALSE"
    );

    console.log("Found " + result.rows.length + " expired files");

    for (var i = 0; i < result.rows.length; i++) {
      var file = result.rows[i];
      try {
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: file.s3_key,
        }));

        await pool.query(
          "UPDATE files SET is_deleted = TRUE WHERE id = $1",
          [file.id]
        );

        console.log("Deleted: " + file.original_name);
        deleted++;

      } catch (fileErr) {
        console.error("Failed to delete " + file.id + ": " + fileErr.message);
        errors++;
      }
    }

  } catch (err) {
    console.error("Fatal error:", err.message);
    throw err;
  }

  var summary = { deleted: deleted, errors: errors, timestamp: new Date().toISOString() };
  console.log("Done: " + JSON.stringify(summary));
  return summary;
};

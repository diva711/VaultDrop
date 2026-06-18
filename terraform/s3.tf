resource "aws_s3_bucket" "uploads" {
  bucket = "${var.project_name}-files-${var.aws_region}"
}

resource "aws_s3_bucket_lifecycle_configuration" "expire" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "delete-expired"
    status = "Enabled"

    filter {}

    expiration {
      days = 2
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "cors" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_origins = ["*"]
    allowed_methods = ["PUT", "GET"]
    allowed_headers = ["*"]
    max_age_seconds = 3000
  }
}
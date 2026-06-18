resource "aws_iam_role" "lambda" {
  name = "vaultdrop-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_s3" {
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:DeleteObject", "s3:GetObject"]
      Resource = "arn:aws:s3:::${aws_s3_bucket.uploads.bucket}/*"
    }]
  })
}

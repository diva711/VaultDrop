output "s3_bucket_name" {
  description = "Name of the file storage bucket"
  value       = aws_s3_bucket.uploads.bucket
}

output "rds_endpoint" {
  description = "Database connection endpoint"
  value       = aws_db_instance.vaultdrop.endpoint
  sensitive   = true
}

output "lambda_arn" {
  description = "Cleanup Lambda function ARN"
  value       = aws_lambda_function.cleanup.arn
}

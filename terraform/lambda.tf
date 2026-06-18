locals {
  # Build the full connection string in one place — Terraform knows
  # the exact host/port/name from the RDS resource, no manual copying
  db_url = "postgresql://${aws_db_instance.vaultdrop.username}:${var.db_password}@${aws_db_instance.vaultdrop.address}:${aws_db_instance.vaultdrop.port}/${aws_db_instance.vaultdrop.db_name}"
}

resource "aws_lambda_function" "cleanup" {
  function_name    = "vaultdrop-cleanup"
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  role             = aws_iam_role.lambda.arn
  filename         = "lambda.zip"
  source_code_hash = filebase64sha256("lambda.zip")
  timeout          = 60

  environment {
    variables = {
      DATABASE_URL = local.db_url
      S3_BUCKET    = aws_s3_bucket.uploads.bucket
    }
  }
}

resource "aws_cloudwatch_event_rule" "every15" {
  name                = "vaultdrop-cleanup-schedule"
  schedule_expression = "rate(15 minutes)"
}

resource "aws_cloudwatch_event_target" "trigger" {
  rule = aws_cloudwatch_event_rule.every15.name
  arn  = aws_lambda_function.cleanup.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cleanup.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every15.arn
}

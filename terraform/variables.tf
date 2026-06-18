variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Used to prefix all resource names"
  type        = string
  default     = "vaultdrop"
}

variable "db_password" {
  description = "Postgres master password"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "alert_email" {
  description = "Email for CloudWatch alerts"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Domain name for SSL certificate (optional, leave empty for HTTP only)"
  type        = string
  default     = ""
}

variable "allowed_origin" {
  description = "Allowed CORS origin (default: same origin in production)"
  type        = string
  default     = ""
}

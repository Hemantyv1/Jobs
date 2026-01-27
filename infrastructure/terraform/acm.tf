# ACM Certificate for HTTPS (optional - only if domain_name is provided)
# IMPORTANT: Request certificate manually first, then import ARN, or add DNS records before applying
resource "aws_acm_certificate" "main" {
  count = var.domain_name != "" ? 1 : 0

  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "jobs-ssl-cert"
  }
}

# Certificate validation - waits for DNS validation
# You must add the DNS validation records to your domain before this will succeed
resource "aws_acm_certificate_validation" "main" {
  count = var.domain_name != "" ? 1 : 0

  certificate_arn = aws_acm_certificate.main[0].arn

  # Terraform will wait for validation (up to 5 minutes)
  # If validation fails, check DNS records in AWS Console
  timeouts {
    create = "5m"
  }
}

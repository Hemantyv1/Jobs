output "alb_dns_name" {
  description = "ALB DNS name - use http://<this> to reach the app (after deploying)"
  value       = aws_lb.main.dns_name
}

output "frontend_instance_id" {
  description = "Frontend EC2 instance ID"
  value       = aws_instance.frontend.id
}

output "backend_instance_id" {
  description = "Backend EC2 instance ID"
  value       = aws_instance.backend.id
}

output "db_instance_id" {
  description = "Database EC2 instance ID"
  value       = aws_instance.db.id
}

output "backend_private_ip" {
  description = "Backend private IP (for frontend nginx proxy)"
  value       = aws_instance.backend.private_ip
}

output "db_private_ip" {
  description = "DB private IP (for backend DATABASE_URL)"
  value       = aws_instance.db.private_ip
}

output "ecr_frontend_url" {
  description = "ECR frontend repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_url" {
  description = "ECR backend repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "nat_instance_id" {
  description = "NAT instance ID"
  value       = aws_instance.nat.id
}

output "nat_instance_public_ip" {
  description = "NAT instance public IP"
  value       = aws_eip.nat_instance.public_ip
}

output "certificate_arn" {
  description = "ACM certificate ARN (if domain_name was provided)"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].arn : null
}

output "certificate_validation_records" {
  description = "DNS validation records for ACM certificate (add these to your domain)"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].domain_validation_options : []
}

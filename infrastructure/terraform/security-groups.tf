# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "jobs-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description = "HTTPS from internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "HTTP from internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "jobs-alb-sg"
  }
}

# Frontend Security Group
resource "aws_security_group" "frontend" {
  name        = "jobs-frontend-sg"
  description = "Security group for frontend EC2 instances"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description     = "HTTP from ALB only"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  
  tags = {
    Name = "jobs-frontend-sg"
  }
}

# Backend Security Group
resource "aws_security_group" "backend" {
  name        = "jobs-backend-sg"
  description = "Security group for backend API instances"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description     = "API from frontend only"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend.id]
  }
  
  tags = {
    Name = "jobs-backend-sg"
  }
}

# Database Security Group
resource "aws_security_group" "db" {
  name        = "jobs-database-sg"
  description = "Security group for PostgreSQL database"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description     = "PostgreSQL from backend only"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }
  
  # NO egress rules - database doesn't need outbound access
  
  tags = {
    Name = "jobs-database-sg"
  }
}

# Now add egress rules using separate resources to avoid cycles

resource "aws_security_group_rule" "alb_to_frontend" {
  type                     = "egress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.frontend.id
  security_group_id        = aws_security_group.alb.id
  description              = "Allow ALB to reach frontend"
}

resource "aws_security_group_rule" "frontend_to_backend" {
  type                     = "egress"
  from_port                = 3000
  to_port                  = 3000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.backend.id
  security_group_id        = aws_security_group.frontend.id
  description              = "Allow frontend to reach backend API"
}

resource "aws_security_group_rule" "frontend_https_egress" {
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.frontend.id
  description       = "Allow frontend to pull from ECR/SSM"
}

resource "aws_security_group_rule" "backend_to_db" {
  type                     = "egress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.db.id
  security_group_id        = aws_security_group.backend.id
  description              = "Allow backend to reach database"
}

resource "aws_security_group_rule" "backend_https_egress" {
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.backend.id
  description       = "Allow backend to pull from ECR/SSM"
}

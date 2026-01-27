# Data source to get latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Security group for NAT instance
resource "aws_security_group" "nat_instance" {
  name        = "jobs-nat-instance-sg"
  description = "Security group for NAT instance"
  vpc_id      = aws_vpc.main.id
  
  # Allow all traffic from private subnets
  ingress {
    description = "Allow all from private backend subnet"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = [aws_subnet.private_backend.cidr_block]
  }
  
  ingress {
    description = "Allow all from private DB subnet"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = [aws_subnet.private_db.cidr_block]
  }
  
  ingress {
    description = "Allow HTTPS from private subnets"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [
      aws_subnet.private_backend.cidr_block,
      aws_subnet.private_db.cidr_block
    ]
  }
  
  # Allow all outbound to internet
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "jobs-nat-instance-sg"
  }
}

# NAT Instance
resource "aws_instance" "nat" {
  ami                         = data.aws_ami.amazon_linux_2.id
  instance_type               = "t3.nano"
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.nat_instance.id]
  associate_public_ip_address = true
  source_dest_check           = false  # CRITICAL: Must be false for NAT to work
  iam_instance_profile        = aws_iam_instance_profile.ec2_ssm.name
  
  # Configure instance as NAT
  user_data = <<-EOF
              #!/bin/bash
              # Enable IP forwarding
              echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
              sysctl -p
              
              # Configure iptables for NAT
              /sbin/iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
              /sbin/iptables -F FORWARD
              
              # Save iptables rules
              yum install -y iptables-services
              service iptables save
              systemctl enable iptables
              EOF
  
  tags = {
    Name = "jobs-nat-instance"
  }
  
  depends_on = [aws_internet_gateway.main]
}

# Elastic IP for NAT instance
resource "aws_eip" "nat_instance" {
  instance = aws_instance.nat.id
  domain   = "vpc"
  
  tags = {
    Name = "jobs-nat-instance-eip"
  }
  
  depends_on = [aws_internet_gateway.main]
}

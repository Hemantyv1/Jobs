resource "aws_ecr_repository" "frontend" {
  name                 = "jobs-frontend"
  image_tag_mutability = "MUTABLE"

  tags = {
    Name = "jobs-frontend"
  }
}

resource "aws_ecr_repository" "backend" {
  name                 = "jobs-backend"
  image_tag_mutability = "MUTABLE"

  tags = {
    Name = "jobs-backend"
  }
}

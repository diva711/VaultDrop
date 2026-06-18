resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

resource "aws_default_subnet" "az1" {
  availability_zone = "${var.aws_region}a"
}

resource "aws_default_subnet" "az2" {
  availability_zone = "${var.aws_region}b"
}

resource "aws_db_subnet_group" "vaultdrop" {
  name       = "vaultdrop-subnet-group"
  subnet_ids = [aws_default_subnet.az1.id, aws_default_subnet.az2.id]
}

resource "aws_security_group" "db" {
  name   = "vaultdrop-db-sg"
  vpc_id = aws_default_vpc.default.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "vaultdrop" {
  identifier             = "vaultdrop-db"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20

  db_name                = "vaultdrop"
  username               = "vaultadmin"
  password               = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.vaultdrop.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = true
  skip_final_snapshot    = true
}
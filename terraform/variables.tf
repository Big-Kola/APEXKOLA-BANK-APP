variable "aws_region" {
  type        = string
  description = "AWS_region"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "subnet_cidrs" {
  description = "CIDR blocks for all subnets"
  type        = list(string)
}

variable "mongo_uri" {
  type        = string
  description = "MongoDB connection string"
  sensitive   = true
}

variable "jwt_secret" {
  type        = string
  description = "JWT signing secret"
  sensitive   = true
}

variable "domain_name" {
  type        = string
  description = "Domain name for the SSL certificate"
}

variable "backend_image" {
  type        = string
  description = "Docker image URL for the backend API"
}

variable "frontend_image" {
  type        = string
  description = "Docker image URL for the frontend"
}

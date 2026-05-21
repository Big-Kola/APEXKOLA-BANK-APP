# VPC
resource "aws_vpc" "apexkola_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "apexkola-vpc"
  }
}

# Public Subnet 1
resource "aws_subnet" "public_subnet1" {
  vpc_id                  = aws_vpc.apexkola_vpc.id
  cidr_block              = var.subnet_cidrs[0]
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "public_subnet_a"
  }
}

# Public Subnet 2
resource "aws_subnet" "public_subnet2" {
  vpc_id                  = aws_vpc.apexkola_vpc.id
  cidr_block              = var.subnet_cidrs[1]
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name = "public_subnet_b"
  }
}

# Backend Subnet 1
resource "aws_subnet" "backend_subnet1" {
  vpc_id            = aws_vpc.apexkola_vpc.id
  cidr_block        = var.subnet_cidrs[2]
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "BackendSubnet1"
  }
}

# Backend Subnet 2
resource "aws_subnet" "backend_subnet2" {
  vpc_id            = aws_vpc.apexkola_vpc.id
  cidr_block        = var.subnet_cidrs[3]
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "BackendSubnet2"
  }
}

#IGW
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.apexkola_vpc.id
  tags = {
    Name = "apexkola-igw"
  }
}

#Elastic IP
resource "aws_eip" "nat_eip_1" {
  domain = "vpc"
}

resource "aws_eip" "nat_eip_2" {
  domain = "vpc"
}


#NAT
resource "aws_nat_gateway" "nat_gw_1" {
  allocation_id = aws_eip.nat_eip_1.id
  subnet_id     = aws_subnet.public_subnet1.id

  tags = {
    Name = "nat-gw-az1"
  }

  depends_on = [aws_internet_gateway.igw]
}

resource "aws_nat_gateway" "nat_gw_2" {
  allocation_id = aws_eip.nat_eip_2.id
  subnet_id     = aws_subnet.public_subnet2.id

  tags = {
    Name = "nat-gw-az2"
  }

  depends_on = [aws_internet_gateway.igw]
}

# ROUTE TABLE
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.apexkola_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table" "private_rt_az1" {
  vpc_id = aws_vpc.apexkola_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.nat_gw_1.id
  }

  tags = {
    Name = "private-rt-az1"
  }
}

resource "aws_route_table" "private_rt_az2" {
  vpc_id = aws_vpc.apexkola_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.nat_gw_2.id
  }

  tags = {
    Name = "private-rt-az2"
  }
}

#ROUTE TABLE ASSOCIATION
resource "aws_route_table_association" "pub_subnet_assoc1" {
  subnet_id      = aws_subnet.public_subnet1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "pub_subnet_assoc2" {
  subnet_id      = aws_subnet.public_subnet2.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "backend_subnet_assoc1" {
  subnet_id      = aws_subnet.backend_subnet1.id
  route_table_id = aws_route_table.private_rt_az1.id
}

resource "aws_route_table_association" "backend_subnet_assoc2" {
  subnet_id      = aws_subnet.backend_subnet2.id
  route_table_id = aws_route_table.private_rt_az2.id
}


# FRONTEND TASK DEFINITION
resource "aws_ecs_task_definition" "frontend" {
  family                   = "apexkola-frontend"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([
    {
      name      = "apexkola-frontend"
      image     = var.frontend_image
      essential = true
      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.apexkola_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "frontend"
        }
      }
    }
  ])
}

# FRONTEND ECS SERVICE
resource "aws_ecs_service" "frontend" {
  name            = "apexkola-frontend-service"
  cluster         = aws_ecs_cluster.apexkola_cluster.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.backend_subnet1.id, aws_subnet.backend_subnet2.id]
    security_groups  = [aws_security_group.frontend_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend_target.arn
    container_name   = "apexkola-frontend"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.lb_listen]
}

# IAM ROLES
resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_cloudwatch" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

resource "aws_iam_role" "ecs_task_role" {
  name = "ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# CLOUDWATCH LOGS
resource "aws_cloudwatch_log_group" "apexkola_logs" {
  name              = "/ecs/apexkola-backend"
  retention_in_days = 30
}

# ECS CLUSTER
resource "aws_ecs_cluster" "apexkola_cluster" {
  name = "apexkola-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS TASK DEFINITION
resource "aws_ecs_task_definition" "backend" {
  family                   = "apexkola-backend"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"

  container_definitions = jsonencode([
    {
      name      = "apexkola-api"
      image     = var.backend_image
      essential = true
      portMappings = [
        {
          containerPort = 8080
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "PORT", value = "8080" },
        { name = "NODE_ENV", value = "production" },
        { name = "MONGO_URI", value = var.mongo_uri },
        { name = "JWT_SECRET", value = var.jwt_secret }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.apexkola_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

# ECS SERVICE
resource "aws_ecs_service" "backend" {
  name                              = "apexkola-backend-service"
  cluster                           = aws_ecs_cluster.apexkola_cluster.id
  task_definition                   = aws_ecs_task_definition.backend.arn
  desired_count                     = 2
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 120

  network_configuration {
    subnets          = [aws_subnet.backend_subnet1.id, aws_subnet.backend_subnet2.id]
    security_groups  = [aws_security_group.backend_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.lb_target.arn
    container_name   = "apexkola-api"
    container_port   = 8080
  }

  depends_on = [aws_lb_listener.lb_listen]
}



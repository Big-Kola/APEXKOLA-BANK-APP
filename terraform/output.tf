output "alb_dns" {
  value = aws_lb.app_lb.dns_name
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.apexkola_cluster.name
}

output "vpc_id" {
  value = aws_vpc.apexkola_vpc.id
}

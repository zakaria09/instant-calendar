terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }

backend "s3" {
  endpoints = {
    s3 = "https://lon1.digitaloceanspaces.com"
  }
  bucket                      = "instant-calendar-tf-state"
  key                         = "terraform.tfstate"
  region                      = "us-east-1"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true
  skip_s3_checksum            = true
}
}

provider "digitalocean" {
  token = var.do_token
}

data "digitalocean_ssh_key" "my_key" {
  name = "my-key"
}

resource "digitalocean_droplet" "web" {
  name   = "instant-calendar"
  region = "lon1"
  size   = "s-1vcpu-1gb"
  image  = "ubuntu-24-04-x64"
  ssh_keys = [data.digitalocean_ssh_key.my_key.id]

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    usermod -aG docker root
  EOF
}
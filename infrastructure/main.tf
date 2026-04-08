terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
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
}
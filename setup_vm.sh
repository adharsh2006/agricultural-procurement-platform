#!/bin/bash

# AgroProcure VM Setup Script
# Run this script inside your Ubuntu VM to install Docker and Minikube.
# Usage: ./setup_vm.sh

set -e # Exit on error

echo "🚀 Starting AgroProcure Environment Setup..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg git

# 2. Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Setup Docker permissions
    echo "👤 Adding $USER to docker group..."
    sudo usermod -aG docker $USER || true
else
    echo "✅ Docker is already installed."
fi

# 3. Install Minikube
echo "⛵ Installing Minikube..."
if ! command -v minikube &> /dev/null; then
    curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    sudo install minikube-linux-amd64 /usr/local/bin/minikube
    rm minikube-linux-amd64
else
    echo "✅ Minikube is already installed."
fi

# 4. Install kubectl
echo "🕹️ Installing kubectl..."
if ! command -v kubectl &> /dev/null; then
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    rm kubectl
else
    echo "✅ kubectl is already installed."
fi

# 5. Clone Repository (Optional helper)
if [ ! -d "blockchain" ] && [ ! -d "agricultural-procurement-platform" ]; then
    echo "📂 Project folder not found."
    read -p "Do you want to clone it from GitHub? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "⬇️  Cloning repository..."
        git clone https://github.com/adharsh2006/agricultural-procurement-platform.git blockchain
        echo "✅ Cloned to 'blockchain' folder."
    else
        echo "⚠️  Please transfer your project files manually."
    fi
else
    echo "📂 Project folder detected."
fi

echo "✅ Setup Complete!"
echo "⚠️  IMPORTANT: Log out and log back in for permissions to work."
echo "   Then: cd blockchain && minikube start --driver=docker"

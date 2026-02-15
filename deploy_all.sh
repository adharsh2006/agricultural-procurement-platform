#!/bin/bash
set -e

echo "🚀 Starting Deployment to Minikube..."

# 1. Point Docker to Minikube
echo "🔌 Connecting to Minikube Docker daemon..."
eval $(minikube docker-env)

# 2. Build Docker Images
echo "🐳 Building Backend Image..."
docker build -t agri-backend:latest ./ai

echo "🐳 Building Frontend Image..."
docker build -t agri-frontend:latest ./web

echo "🐳 Building Blockchain Image..."
docker build -t agri-chain:latest ./chain

# 3. Apply Manifests
echo "📄 Applying Kubernetes Manifests..."
kubectl apply -f k8s/db.yaml
kubectl apply -f k8s/chain.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

echo "✅ Deployment Triggered! Run 'kubectl get pods' to check status."

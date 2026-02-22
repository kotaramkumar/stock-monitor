# Stock Monitor - Deployment Setup Guide

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Node.js 18+](https://nodejs.org/) (for local development)

## 1. Local Docker Build & Run

Build and run the app locally with Docker:

```bash
docker build -t stock-monitor .
docker run -p 3000:80 stock-monitor
```

Open http://localhost:3000 in your browser.

## 2. Docker Compose (App + Jenkins)

Start both the app and Jenkins:

```bash
docker-compose up -d
```

- App: http://localhost:3000
- Jenkins: http://localhost:8080

To stop:

```bash
docker-compose down
```

## 3. Minikube Kubernetes Deployment

### Start Minikube

```bash
minikube start
```

### Configure the Finnhub API Key

Encode your API key:

```bash
echo -n 'YOUR_FINNHUB_API_KEY' | base64
```

Edit `k8s/secret.yaml` and replace `REPLACE_WITH_BASE64_ENCODED_API_KEY` with the output.

### Update the Docker Image

Edit `k8s/deployment.yaml` and replace `YOUR_DOCKERHUB_USERNAME` with your Docker Hub username.

### Deploy

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Verify

```bash
kubectl get pods -n stock-monitor
kubectl get svc -n stock-monitor
```

### Access the App

```bash
minikube service stock-monitor -n stock-monitor
```

## 4. Jenkins Pipeline Setup

### Initial Jenkins Configuration

1. Start Jenkins via `docker-compose up -d jenkins`
2. Get the initial admin password:
   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```
3. Open http://localhost:8080 and complete the setup wizard
4. Install suggested plugins

### Install Required Plugins

Go to **Manage Jenkins > Plugins > Available** and install:
- Docker Pipeline
- Kubernetes CLI

### Add Docker Hub Credentials

1. Go to **Manage Jenkins > Credentials > System > Global credentials**
2. Click **Add Credentials**
3. Kind: **Username with password**
4. ID: `dockerhub-credentials`
5. Enter your Docker Hub username and password/token

### Install Docker in Jenkins Container

```bash
docker exec -u root jenkins bash -c "apt-get update && apt-get install -y docker.io"
```

### Install kubectl in Jenkins Container

```bash
docker exec -u root jenkins bash -c "curl -LO https://dl.k8s.io/release/stable.txt && \
  curl -LO https://dl.k8s.io/release/\$(cat stable.txt)/bin/linux/amd64/kubectl && \
  chmod +x kubectl && mv kubectl /usr/local/bin/"
```

### Create the Pipeline Job

1. Click **New Item** > **Pipeline**
2. Name: `stock-monitor`
3. Under **Pipeline**, select **Pipeline script from SCM**
4. SCM: Git
5. Repository URL: your repo URL
6. Script Path: `Jenkinsfile`
7. Save and click **Build Now**

### Update Jenkinsfile

Edit `Jenkinsfile` and replace `YOUR_DOCKERHUB_USERNAME` with your Docker Hub username.

## Architecture

```
Developer -> Git Push -> Jenkins (Docker container)
  -> Build Docker Image -> Push to Docker Hub
  -> kubectl apply -> Minikube K8s Cluster
    -> Deployment (2 replicas) -> Service (NodePort:30080)
    -> Accessible at minikube-ip:30080
```

## Troubleshooting

### Pod not starting
```bash
kubectl describe pod <pod-name> -n stock-monitor
kubectl logs <pod-name> -n stock-monitor
```

### Image pull errors
Make sure you've pushed your image to Docker Hub:
```bash
docker push YOUR_DOCKERHUB_USERNAME/stock-monitor:latest
```

For Minikube, you can also load local images directly:
```bash
minikube image load stock-monitor:latest
```

### Jenkins can't access Docker
Ensure the Docker socket is mounted and Jenkins has permission:
```bash
docker exec -u root jenkins chmod 666 /var/run/docker.sock
```

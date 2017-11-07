# Initializing helm on a cluster
helm init

# Installing kube-lego for Let's encrypt
kubectl create namespace cert-management
helm install --name cert-tls \
  --namespace cert-management \
  --set config.LEGO_EMAIL=ali@alihm.net \
  --set config.LEGO_URL=https://acme-v01.api.letsencrypt.org/directory \
    stable/kube-lego

# Install ingress controller
kubectl create namespace public
helm install --name ingress \
  --namespace public \
  stable/nginx-ingress

# Install mongo
kubectl create namespace db
helm install --name db \
  --namespace db \
  stable/mongodb

# Install prod version of the app
kubectl create namespace prod
helm install --name prod \
  --namespace prod \
  --set environment.SLACK_CLIENT_ID="xxx" \
  --set environment.SLACK_SECRET="xxx" \
  --set environment.SLACK_DEV_BEARER_TOKEN="xxx" \
  --set environment.SLACK_REQ_TOKEN="xxx" \
  --set environment.MONGODB_URI="mongodb://db-mongodb.db/prod" \
  tic-tac-toe

# Install staging version of the app
kubectl create namespace staging
helm install --name staging \
  --namespace staging \
  --set image.tag="latest" \
  --set image.replicaCount=1 \
  --set ingress.host="staging.alihm.net" \
  --set environment.SLACK_CLIENT_ID="xxx" \
  --set environment.SLACK_SECRET="xxx" \
  --set environment.SLACK_DEV_BEARER_TOKEN="xxx" \
  --set environment.SLACK_REQ_TOKEN="xxx" \
  --set environment.MONGODB_URI="mongodb://db-mongodb.db/staging" \
  tic-tac-toe

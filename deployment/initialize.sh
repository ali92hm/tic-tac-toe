# Initializing helm on a cluster
helm init

# Installing kube-lego for Let's encrypt
helm install --name cert-tls \
  --set config.LEGO_EMAIL=ali@alihm.net \
  --set config.LEGO_URL=https://acme-v01.api.letsencrypt.org/directory \
    stable/kube-lego

# Install ingress controller
helm install --name ingress \
  stable/nginx-ingress

# Install mongo
helm install --name db \
  --namespace ttt \
  stable/mongodb

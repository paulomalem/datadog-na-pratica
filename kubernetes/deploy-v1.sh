set -e

CLUSTER="lab-datadog"

echo "1. construir as imagens"
docker build -t dd-lab/loja-web:v1       ../app/v1-base/loja-web
docker build -t dd-lab/pedidos-api:v1    ../app/v1-base/pedidos-api
docker build -t dd-lab/estoque-api:v1    ../app/v1-base/estoque-api
docker build -t dd-lab/gerador-carga:v1  ../app/v1-base/gerador-carga

echo "2. carregar as imagens dentro do Kind"
kind load docker-image dd-lab/loja-web:v1 dd-lab/pedidos-api:v1 dd-lab/estoque-api:v1 dd-lab/gerador-carga:v1 --name "$CLUSTER"

echo "3. namespace e ConfigMaps com o SQL dos bancos"
kubectl --context "$CTX" apply -f v1/00-namespace.yaml
kubectl --context "$CTX" -n lab create configmap orders-init --from-file=init.sql=../db/orders/init.sql --dry-run=client -o yaml | kubectl --context "$CTX" apply -f -
kubectl --context "$CTX" -n lab create configmap stock-init  --from-file=init.sql=../db/stock/init.sql  --dry-run=client -o yaml | kubectl --context "$CTX" apply -f -

echo "4. aplicar os manifests"
kubectl --context "$CTX" apply -f v1/
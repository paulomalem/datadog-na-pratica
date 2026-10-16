set -e

CLUSTER="lab-datadog"

echo "1. construir as imagens"
docker build -t dd-lab/loja-web:v5       ../app/v5-final/loja-web
docker build -t dd-lab/pedidos-api:v5    ../app/v5-final/pedidos-api
docker build -t dd-lab/estoque-api:v5    ../app/v5-final/estoque-api
docker build -t dd-lab/gerador-carga:v5  ../app/v5-final/gerador-carga

echo "2. carregar as imagens dentro do Kind"
kind load docker-image dd-lab/loja-web:v5 dd-lab/pedidos-api:v5 dd-lab/estoque-api:v5 dd-lab/gerador-carga:v5 --name "$CLUSTER"

echo "3. namespace e ConfigMaps com o SQL dos bancos"
kubectl apply -f v5/00-namespace.yaml
kubectl -n lab create configmap orders-init --from-file=init.sql=../db/orders/init.sql --from-file=datadog.sql=../db/orders/datadog.sql --dry-run=client -o yaml | kubectl apply -f -
kubectl -n lab create configmap stock-init  --from-file=init.sql=../db/stock/init.sql --from-file=datadog.sql=../db/stock/datadog.sql --dry-run=client -o yaml | kubectl apply -f -

echo "4. aplicar os manifests (v5: versão final)"
kubectl apply -f v5/

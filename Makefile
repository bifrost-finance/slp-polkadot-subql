IMAGE=harbor.liebi.com/slp-vmovr/slp-polkadot-subql:v1.0
DEPLOYMENT=vodt-polkadot-subql

build:
	docker build -f Dockerfile -t ${IMAGE} .
	docker push ${IMAGE}

deploy: build
	kubectl apply -f deploy/slp-polkadot-subql.yaml

update: build
	kubectl rollout restart deploy -n slp ${DEPLOYMENT}


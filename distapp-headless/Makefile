.PHONY: docker-build
docker-build:
	DOCKER_BUILDKIT=1 docker build -t 5yunus2efendi/distapp-headless:12-bun . --platform linux/amd64 --load

.PHONY: docker-push
docker-push:
	DOCKER_BUILDKIT=1 docker push 5yunus2efendi/distapp-headless:12-bun --platform linux/amd64

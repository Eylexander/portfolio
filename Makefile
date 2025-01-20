build:
	@(cd backend && make build)
	@(cd frontend && make build)

run: 
	@(cd backend && make run)
	@(cd frontend && make run)

docker:
	@(cd backend && bash build.sh)

docker-dev:
	@(cd backend && bash build.sh -dev)
	@(cd frontend && bash build.sh -dev)
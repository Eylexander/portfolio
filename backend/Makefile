build:
	@go build -o bin/backend src/cmd/*.go

run: build
	@./bin/backend

test:
	@go test -v ./...
FROM golang:1.22-alpine AS builder
WORKDIR /src
RUN apk --no-cache add gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 go build -o /editorial-api ./cmd/server

FROM alpine:3.20
RUN apk --no-cache add ca-certificates
COPY --from=builder /editorial-api /editorial-api
EXPOSE 8089
ENTRYPOINT ["/editorial-api"]

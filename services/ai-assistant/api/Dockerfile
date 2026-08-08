FROM golang:1.22-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /ai-assistant-api ./cmd/server

FROM alpine:3.20
RUN apk --no-cache add ca-certificates
COPY --from=builder /ai-assistant-api /ai-assistant-api
EXPOSE 8088
ENTRYPOINT ["/ai-assistant-api"]

FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN GOOS=linux GOARCH=amd64 go build -o backend .

FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=builder /app/backend .

EXPOSE 8080

CMD ["./backend"]

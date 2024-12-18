# Etapa de construcción
FROM golang:1.20-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Establecer GOOS y GOARCH para asegurar compatibilidad
RUN GOOS=linux GOARCH=amd64 go build -o backend .

# Etapa final
FROM alpine:latest

WORKDIR /app

# Instalar dependencias para binarios si es necesario
RUN apk add --no-cache libc6-compat

COPY --from=builder /app/backend .

EXPOSE 8080

CMD ["./backend"]

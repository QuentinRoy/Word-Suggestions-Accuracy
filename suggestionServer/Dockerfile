FROM golang:1.13.9-alpine3.11 AS builder
WORKDIR /app
COPY . .
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /app/suggestions

FROM alpine:3.11
WORKDIR /app
EXPOSE 80
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/suggestions .
CMD ./suggestions -addr=:80 -total-participants=1
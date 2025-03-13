FROM node:23-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libusb-dev \
    supervisor

COPY package.json package-lock.json ./
COPY . .

RUN chmod +x /app/scripts/entrypoint.sh

EXPOSE 3000

CMD ["./scripts/entrypoint.sh"]

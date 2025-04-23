FROM node:23-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libusb-dev \
    supervisor \
    postgresql-client
COPY package.json package-lock.json ./
COPY . .

# Make scripts executable
RUN chmod +x /app/scripts/entrypoint.sh
RUN chmod +x /app/scripts/start-app.sh

EXPOSE 3000

CMD ["./scripts/entrypoint.sh"]

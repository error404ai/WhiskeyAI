
FROM node:23-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libusb-dev

COPY package.json package-lock.json ./
COPY . .



EXPOSE 3000

CMD ["npm", "run", "dev"]

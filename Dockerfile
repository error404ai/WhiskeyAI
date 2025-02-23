
FROM node:23-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY . .



EXPOSE 3000

CMD ["npm", "run", "start"]

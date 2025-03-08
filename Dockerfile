
FROM node:23-alpine

WORKDIR /app

# Install dependencies
RUN npm install -g node-pre-gyp@0.17.0

COPY package.json package-lock.json ./
COPY . .



EXPOSE 3000

CMD ["npm", "run", "dev"]

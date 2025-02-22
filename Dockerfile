
FROM node:23-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY . .

RUN rm -rf node_modules
RUN npm i -f
RUN npm run build
RUN npm run db:push


EXPOSE 3000

CMD ["npm", "run", "start"]

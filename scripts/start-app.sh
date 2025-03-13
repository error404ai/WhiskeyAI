#!/bin/sh

# Run app based on environment
if [ "$NODE_ENV" = "production" ]; then
    echo "Starting Next.js in production mode..."
    npm run start
else
    echo "Starting Next.js in development mode..."
    npm run dev
fi 
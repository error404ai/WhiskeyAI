#!/bin/sh
# Run database migrations
echo "Running database migrations..."
npm run db:push

# Start supervisord to manage both Next.js and cron processes
echo "Starting supervisord..."
exec supervisord -c /app/scripts/supervisord.conf


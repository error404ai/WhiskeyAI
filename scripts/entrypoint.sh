#!/bin/sh
# Run database migrations
npm run db:push

# Start supervisord to manage both Next.js and cron processes
supervisord -c /app/scripts/supervisord.conf

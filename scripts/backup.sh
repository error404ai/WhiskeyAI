#!/bin/sh

docker run --rm -v uploads:/uploads -v /var/backups:/backup alpine tar czf /backup/uploads_backup_$(date +%F).tar.gz -C /uploads .

docker exec -t db pg_dump -U postgres postgres > /var/backups/db_backup_$(date +%F).sql

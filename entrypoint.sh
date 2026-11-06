#!/bin/sh
# Ensure the data volume is writable by the app user (named volumes start as root).
set -e
mkdir -p /data
chown -R nextjs:nodejs /data
exec runuser -u nextjs -- "$@"

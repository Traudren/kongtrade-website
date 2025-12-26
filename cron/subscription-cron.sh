
#!/bin/bash

# Script to automatically expire subscriptions
# Run this script daily via cron

cd /home/ubuntu/kongtrade_website/app
npm run expire-subscriptions

# Log the execution
echo "$(date): Subscription expiration check completed" >> /var/log/kongtrade-cron.log

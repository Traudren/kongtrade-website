
#!/bin/bash

# Setup cron jobs for KongTrade

# Make the cron script executable
chmod +x /home/ubuntu/kongtrade_website/app/cron/subscription-cron.sh

# Add cron job to run daily at 00:00 (midnight)
# This will check for expired subscriptions every day
(crontab -l 2>/dev/null; echo "0 0 * * * /home/ubuntu/kongtrade_website/app/cron/subscription-cron.sh") | crontab -

echo "Cron job setup completed!"
echo "The subscription expiration check will run daily at midnight."
echo "To view active cron jobs, run: crontab -l"
echo "To view cron logs, run: tail -f /var/log/kongtrade-cron.log"

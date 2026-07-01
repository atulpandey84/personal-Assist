#!/bin/bash
# Update Manager Script - Multi-Agent Framework

set -e # Exit on error
LOG_FILE="logs/system_updates.log"
mkdir -p logs

echo "[$(date)] Starting system update check..." | tee -a "$LOG_FILE"

# 1. Disk Space Check (Ensure at least 1GB free on /)
FREE_SPACE=$(df / --output=avail -k | tail -1)
if [ "$FREE_SPACE" -lt 1048576 ]; then
    echo "[ERROR] Insufficient disk space (< 1GB). Aborting." | tee -a "$LOG_FILE"
    exit 1
fi

# 2. Check for Updates (Dry Run)
echo "[$(date)] Fetching package lists..." | tee -a "$LOG_FILE"
sudo apt-get update -y

# Capture upgradable packages summary
UPGRADABLE=$(apt-get -s upgrade | grep -P '^\d+ upgraded' || echo "0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.")
echo "[$(date)] Upgradable packages: $UPGRADABLE" | tee -a "$LOG_FILE"

# 3. Execute Update (if 'apply' argument passed)
if [ "$1" == "apply" ]; then
    echo "[$(date)] Applying updates..." | tee -a "$LOG_FILE"
    export DEBIAN_FRONTEND=noninteractive
    sudo -E apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" dist-upgrade | tee -a "$LOG_FILE"
    sudo apt-get autoremove -y | tee -a "$LOG_FILE"
    echo "[$(date)] Update process completed." | tee -a "$LOG_FILE"
else
    echo "[INFO] Dry-run complete. Run with 'apply' to execute updates." | tee -a "$LOG_FILE"
fi

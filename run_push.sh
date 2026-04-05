#!/bin/bash
# Script to run drizzle-kit push with automated Enter key presses

cd /home/ubuntu/financial_automation_map

# Use unbuffer or script to handle TTY
# Generate 200 newlines to auto-accept all prompts
(for i in $(seq 1 200); do echo ""; sleep 0.1; done) | npx drizzle-kit push --force

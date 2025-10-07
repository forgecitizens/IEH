#!/bin/bash
# Deployment script for IEH Dashboard

echo "🚀 Deploying IEH - Planetary Dashboard..."

# Add all changes
git add .

# Commit with timestamp
git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
git push origin main

echo "✅ Deployment complete!"
echo "🌐 Your website will be available at: https://forgecitizens.github.io/IEH/"
echo "⏱️  GitHub Pages usually takes 1-5 minutes to update"
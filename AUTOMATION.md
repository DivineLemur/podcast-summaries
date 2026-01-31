# 🤖 Automation Setup Guide

This guide will help you set up **automatic daily podcast summaries** using GitHub Actions.

## Overview

Once configured:
- ✅ Script runs **automatically every day at 6 AM UTC**
- ✅ New episodes are detected and summarized
- ✅ Summaries are committed to your repo
- ✅ Vercel automatically deploys the updated website
- ✅ Zero maintenance required!

## Setup Steps

### Step 1: Create GitHub Repository

```bash
# In your podcast-summaries folder
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/podcast-summaries.git
git branch -M main
git push -u origin main
```

### Step 2: Add Anthropic API Key as Secret

1. Go to your GitHub repo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `ANTHROPIC_API_KEY`
5. Value: Your Anthropic API key (starts with `sk-ant-...`)
6. Click **Add secret**

### Step 3: Enable GitHub Actions

1. Go to **Actions** tab in your repo
2. You should see "Generate Podcast Summaries" workflow
3. If disabled, click **Enable**

### Step 4: Test It Manually

Before waiting for the daily schedule, test it manually:

1. Go to **Actions** tab
2. Click **Generate Podcast Summaries** workflow
3. Click **Run workflow** → **Run workflow**
4. Wait 2-5 minutes
5. Check if `data/summaries.json` was updated

### Step 5: Verify It Worked

```bash
# Pull the changes
git pull

# Check the summaries
cat data/summaries.json
```

## Schedule Configuration

The workflow runs **daily at 6 AM UTC** by default.

### Change the Schedule

Edit `.github/workflows/generate-summaries.yml`:

```yaml
schedule:
  - cron: '0 6 * * *'  # 6 AM UTC daily
```

**Common schedules:**
- `0 6 * * *` - Daily at 6 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 8 * * 1` - Every Monday at 8 AM UTC
- `0 0 * * *` - Daily at midnight UTC

**Cron format:** `minute hour day month weekday`

### Convert to Your Timezone

- 6 AM UTC = 11:30 AM IST (India)
- 6 AM UTC = 10 PM PST (previous day)
- 6 AM UTC = 1 AM EST

Use [crontab.guru](https://crontab.guru/) to help build your schedule.

## How It Works

```
┌──────────────────────────────────┐
│  Daily at 6 AM UTC               │
│  GitHub Actions Triggered        │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  1. Check out code               │
│  2. Install dependencies         │
│  3. Run: npm start               │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  Script Runs:                    │
│  - Fetch RSS feeds               │
│  - Find new episodes             │
│  - Generate summaries            │
│  - Update summaries.json         │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  Commit Changes:                 │
│  - git add summaries.json        │
│  - git commit                    │
│  - git push                      │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  Vercel Detects Push             │
│  - Rebuilds website              │
│  - Deploys new version           │
│  - New summaries appear!         │
└──────────────────────────────────┘
```

## Monitoring

### Check Workflow Status

1. Go to **Actions** tab
2. See all workflow runs
3. Click on any run to see logs
4. Green ✅ = Success
5. Red ❌ = Failed (check logs)

### View Logs

Click on a workflow run → Click "generate-summaries" job → See detailed logs

### Get Notifications

GitHub will email you if a workflow fails (check Settings → Notifications).

## Cost Estimates

### GitHub Actions
- **Free**: 2,000 minutes/month for public repos
- **Free**: 500 minutes/month for private repos
- Each run takes ~3-5 minutes
- Daily runs = ~150 minutes/month (well within free tier)

### Anthropic API
- ~$0.10-0.30 per episode
- 4 podcasts × 1 episode/day = ~$0.40-1.20/day
- Monthly: ~$12-36/month

**To reduce costs:**
- Process fewer episodes per run
- Run less frequently (every 3 days instead of daily)
- Only process specific podcasts

### Vercel
- **Free**: Unlimited deployments for personal projects

## Troubleshooting

### Workflow not running?

1. Check if Actions are enabled in repo settings
2. Verify the cron schedule is correct
3. Wait - cron schedules can take up to 15 minutes to trigger

### "No API key found" error?

1. Check GitHub Secrets: Settings → Secrets → Actions
2. Name must be exactly `ANTHROPIC_API_KEY`
3. Value should start with `sk-ant-`

### "Permission denied" when pushing?

1. Make sure repo is not protected
2. Check branch protection rules
3. Actions need write permissions: Settings → Actions → General → Workflow permissions → "Read and write"

### "No new episodes" every day?

This is normal! Not every podcast publishes daily. The script only commits when there are new summaries.

## Advanced: Multiple Runs Per Day

Want to check for new episodes more frequently?

Edit `.github/workflows/generate-summaries.yml`:

```yaml
schedule:
  - cron: '0 6 * * *'   # 6 AM
  - cron: '0 12 * * *'  # 12 PM
  - cron: '0 18 * * *'  # 6 PM
```

## Disabling Automation

To temporarily stop automatic runs:

1. Go to **Actions** tab
2. Click **Generate Podcast Summaries**
3. Click **⋯** (three dots)
4. Click **Disable workflow**

## Manual Runs

You can always trigger manually:

1. Go to **Actions** tab
2. Click **Generate Podcast Summaries**
3. Click **Run workflow**

Or run locally:
```bash
npm start
git add data/summaries.json
git commit -m "Update summaries"
git push
```

## What's Next?

Once automation is running:
1. ✅ Backend automated
2. 🚧 Build Next.js frontend
3. 🚧 Deploy to Vercel
4. ✅ Fully automated podcast summary site!

You'll wake up every morning with new summaries automatically published to your site! 🎉

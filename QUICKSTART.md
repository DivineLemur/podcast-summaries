# 🚀 Quick Start Guide

## Step 1: Get Your Files

Download the entire `podcast-summaries` folder.

## Step 2: Install Dependencies

```bash
cd podcast-summaries
npm install
```

## Step 3: Set Up API Key

1. Get your Anthropic API key: https://console.anthropic.com/
2. Create `.env` file:

```bash
cp .env.example .env
```

3. Edit `.env` and add your key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## Step 4: Test It!

Run the test script to verify everything works:

```bash
npm test
```

This will:
- Fetch the latest Dwarkesh episode
- Check for transcript
- Generate a summary
- Show you the results

Expected output:
```
🧪 Testing with latest Dwarkesh episode...
📡 Fetching RSS feed...
✅ Latest episode: "Episode Title"
✅ Transcript found! (150000 characters)
🤖 Generating summary with Claude...
✅ Summary generated!
```

## Step 5: Process All Podcasts

Once the test works, run the full script:

```bash
npm start
```

This will process 1 episode from each podcast (4 total).

Results saved to: `data/summaries.json`

## What's Next?

### Process More Episodes

Edit `scripts/fetch-and-summarize.js` line 200:
```javascript
const summaries = await processPodcast(podcast, 5); // Process 5 episodes
```

### Check Results

```bash
cat data/summaries.json
```

### Build the Frontend (Phase 2)

We'll create a Next.js site to display these summaries beautifully!

## Cost Estimate

- Test run (1 episode): ~$0.10-0.30
- Full run (4 episodes): ~$0.40-1.20
- Each additional episode: ~$0.10-0.30

## Troubleshooting

**"No API key found"**
- Make sure `.env` file exists
- Check the key starts with `sk-ant-`

**"No transcript found"**
- Some podcasts don't include transcripts in RSS
- This is normal - the script will skip those episodes

**Rate limit errors**
- Add delays between episodes if needed
- The script already processes one podcast at a time

## Need Help?

- Check the main README.md for detailed docs
- Review the code comments in the scripts
- Test with single episodes first before batch processing

# Podcast Summaries - AI-Powered Episode Insights

Automatically generate high-quality, editorial-style summaries of podcast episodes using Claude AI.

## 🎯 Features

- Fetches episodes from RSS feeds
- Extracts transcripts automatically (only processes episodes with transcripts)
- Generates 10-20 minute read summaries with:
  - Key insights with natural data integration
  - Actionable takeaways
  - Notable quotes
  - Frameworks and mental models
  - Category tags

## 📋 Prerequisites

- Node.js 18+ 
- Anthropic API key ([Get one here](https://console.anthropic.com/))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd podcast-summaries
npm install
```

### 2. Set Up API Key

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Anthropic API key
# ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run the Script

```bash
npm start
```

This will:
- Fetch the latest episode from each podcast
- Check for transcripts
- Generate summaries using Claude
- Save to `data/summaries.json`

## 📁 Project Structure

```
podcast-summaries/
├── config/
│   └── podcasts.js          # Podcast RSS feed configuration
├── scripts/
│   └── fetch-and-summarize.js  # Main processing script
├── data/
│   └── summaries.json       # Generated summaries (created on first run)
├── package.json
├── .env                     # Your API key (create this)
└── README.md
```

## 🎙️ Configured Podcasts

1. **Dwarkesh Podcast** - Tech, AI, and history interviews
2. **Lenny's Podcast** - Product and growth advice
3. **Founders** - Learn from great entrepreneurs
4. **a16z Podcast** - Tech and culture trends

## 🔧 Configuration

### Adding More Podcasts

Edit `config/podcasts.js`:

```javascript
{
  id: 'your-podcast-id',
  name: 'Your Podcast Name',
  description: 'Description',
  rssUrl: 'https://feeds.example.com/your-podcast.rss',
  website: 'https://yourpodcast.com'
}
```

### Processing More Episodes

Edit `scripts/fetch-and-summarize.js` line ~200:

```javascript
const summaries = await processPodcast(podcast, 5); // Change 1 to 5
```

## 📊 Output Format

Summaries are saved to `data/summaries.json`:

```json
{
  "podcasts": {
    "dwarkesh-patel": {
      "id": "dwarkesh-patel",
      "name": "Dwarkesh Podcast",
      "episodes": [
        {
          "title": "Episode Title",
          "published_date": "2025-01-30",
          "summary": {
            "one_liner": "Core insight in one sentence",
            "estimated_read_time": "15 min",
            "key_insights": [...],
            "actionable_takeaways": [...],
            "notable_quotes": [...]
          }
        }
      ]
    }
  }
}
```

## 🚧 Next Steps

### Phase 2: Frontend Website
- [ ] Build Next.js site
- [ ] Design with Invisible Threads aesthetic
- [ ] Create podcast/episode pages
- [ ] Deploy to Vercel

### Phase 3: Automation
- [ ] GitHub Actions daily cron
- [ ] Auto-commit new summaries
- [ ] Trigger Vercel rebuilds

## 💡 Tips

- **Cost**: Each episode summary costs ~$0.10-0.30 (depending on transcript length)
- **Transcripts**: Only processes episodes that have transcripts in RSS feed
- **Rate Limits**: Script processes one podcast at a time to avoid rate limits
- **Quality**: Uses Claude Sonnet 4 for highest quality summaries

## 🐛 Troubleshooting

**No transcripts found?**
- Not all podcasts include transcripts in RSS
- Check the RSS feed manually to verify transcript availability
- Some podcasts put transcripts on their website (requires separate scraping)

**API errors?**
- Check your API key is correct in `.env`
- Verify you have credits in your Anthropic account
- Check network connectivity

**JSON parse errors?**
- Claude's response might need cleaning
- Script handles markdown code blocks automatically
- Check console output for raw response

## 📝 License

MIT

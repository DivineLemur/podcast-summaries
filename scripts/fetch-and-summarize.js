import 'dotenv/config';
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import Parser from 'rss-parser';
import { PODCASTS } from '../config/podcasts.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['itunes:summary', 'summary'],
      ['description', 'description']
    ]
  }
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Load existing summaries
async function loadExistingSummaries() {
  const dataPath = './data/summaries.json';
  if (existsSync(dataPath)) {
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  }
  return { podcasts: {} };
}

// Save summaries
async function saveSummaries(data) {
  await fs.writeFile('./data/summaries.json', JSON.stringify(data, null, 2));
}

// Extract transcript from RSS item
function extractTranscript(item) {
  // Try different fields where transcript might be
  const possibleFields = [
    item.contentEncoded,
    item.content,
    item.description,
    item.summary,
    item['content:encoded']
  ];

  for (const field of possibleFields) {
    if (field && field.length > 1000) {
      // Clean HTML tags if present
      const cleaned = field.replace(/<[^>]*>/g, '').trim();
      if (cleaned.length > 1000) {
        return cleaned;
      }
    }
  }

  return null;
}

// Generate summary using Claude
async function generateSummary(episode, transcript) {
  const prompt = `You are analyzing a podcast transcript to extract the most valuable insights for busy professionals.

Context:
- Podcast: ${episode.podcast}
- Episode: ${episode.title}
- Published: ${episode.publishedDate}

Read this transcript and identify:

1. KEY INSIGHTS (the "aha" moments):
   - Non-obvious ideas that shift thinking
   - Contrarian takes that challenge assumptions
   - Frameworks and mental models
   - Stories that illustrate principles
   - When data/metrics are mentioned, include them naturally to support the insight

2. KEY DATA POINTS & METRICS (if present):
   - Revenue numbers, growth rates, conversion rates
   - Specific dollar amounts, percentages, timeframes
   - User/customer counts and metrics
   - Performance data (CAC, LTV, retention, etc.)
   - For each data point: include the number, context, and why it matters

3. FRAMEWORKS & MENTAL MODELS (if present):
   - Named frameworks or heuristics
   - Decision criteria with specific thresholds
   - Repeatable processes

4. ACTIONABLE TAKEAWAYS:
   - What could someone actually do differently?
   - Be specific when the guest is specific

5. MEMORABLE QUOTES:
   - Lines that capture the essence
   - Include data if it's part of a punchy quote

WRITING STYLE:
- Write like a thoughtful journalist, not a transcription bot
- When guest shares numbers, weave them into the narrative naturally
- If an episode is data-heavy, let that show. If it's philosophy-heavy, that's fine too
- Don't force metrics where they don't exist
- Avoid "the guest mentioned that..." - just tell the story

AVOID:
- Chronological play-by-play ("First they discussed X, then Y...")
- Forcing data points into every insight
- Generic statements ("it's important to...")
- Over-systematizing organic conversations

Think: "What would I tell a smart friend about this episode over coffee?"

Estimated read time: 10-20 minutes depending on density of ideas.

Respond in JSON format with this structure:
{
  "one_liner": "Single sentence capturing the core insight",
  "estimated_read_time": "15 min",
  "key_insights": [
    {
      "category": "Product Strategy",
      "title": "Insight title",
      "content": "2-4 paragraphs weaving narrative naturally",
      "data_highlights": ["$0→$100M ARR", "67% viral growth"],
      "quote": "Optional memorable quote",
      "timestamp": "18:30"
    }
  ],
  "actionable_takeaways": [
    "Specific, concrete advice"
  ],
  "notable_quotes": [
    {
      "quote": "The quote text",
      "speaker": "Guest name",
      "timestamp": "34:20"
    }
  ],
  "topics_discussed": ["Product-Market Fit", "Fundraising"],
  "who_should_listen": "Target audience description"
}

Transcript:
${transcript.substring(0, 100000)}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = responseText;
    if (responseText.includes('```json')) {
      jsonText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      jsonText = responseText.split('```')[1].split('```')[0].trim();
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

// Process a single podcast
async function processPodcast(podcast, existingEpisodes = [], limit = 1) {
  console.log(`\n📡 Fetching RSS for: ${podcast.name}`);
  
  const feed = await parser.parseURL(podcast.rssUrl);
  console.log(`   Found ${feed.items.length} episodes`);

  const summaries = [];
  let processed = 0;

  for (let i = 0; i < feed.items.length && processed < limit; i++) {
    const item = feed.items[i];
    
    // Skip if already processed
    const alreadyProcessed = existingEpisodes.some(ep => ep.title === item.title);
    if (alreadyProcessed) {
      console.log(`\n   ⏭️  Skipping (already processed): ${item.title}`);
      continue;
    }

    console.log(`\n   Processing episode ${processed + 1}/${limit}: ${item.title}`);

    // Extract transcript
    const transcript = extractTranscript(item);
    
    if (!transcript) {
      console.log(`   ⚠️  No transcript found, skipping...`);
      continue;
    }

    console.log(`   ✅ Transcript found (${transcript.length} chars)`);
    console.log(`   🤖 Generating summary with Claude...`);

    const episodeData = {
      podcast: podcast.name,
      title: item.title,
      publishedDate: item.pubDate || item.isoDate,
      audioUrl: item.enclosure?.url,
      duration: item.itunes?.duration
    };

    try {
      const summary = await generateSummary(episodeData, transcript);
      
      summaries.push({
        id: `${podcast.id}-${Date.now()}`,
        podcast_id: podcast.id,
        podcast_name: podcast.name,
        title: item.title,
        published_date: item.pubDate || item.isoDate,
        audio_url: item.enclosure?.url,
        duration: item.itunes?.duration,
        summary: summary,
        processed_at: new Date().toISOString()
      });

      processed++;
      console.log(`   ✅ Summary generated! (${summary.estimated_read_time})`);
    } catch (error) {
      console.error(`   ❌ Error generating summary:`, error.message);
    }
  }

  return summaries;
}

// Main function
async function main() {
  console.log('🎙️  Podcast Summary Generator\n');
  console.log('=' . repeat(50));

  // Load existing data
  const data = await loadExistingSummaries();

  // Process each podcast (limit to 1 episode for testing)
  for (const podcast of PODCASTS) {
    try {
      // Get existing episodes for this podcast
      const existingEpisodes = data.podcasts[podcast.id]?.episodes || [];
      
      const summaries = await processPodcast(podcast, existingEpisodes, 1);
      
      if (summaries.length === 0) {
        console.log(`\n   ℹ️  No new episodes to process for ${podcast.name}`);
        continue;
      }
      
      if (!data.podcasts[podcast.id]) {
        data.podcasts[podcast.id] = {
          ...podcast,
          episodes: []
        };
      }

      data.podcasts[podcast.id].episodes.push(...summaries);
      
      // Save after each podcast
      await saveSummaries(data);
      console.log(`\n✅ Saved ${summaries.length} new summary(ies) for ${podcast.name}`);
      
    } catch (error) {
      console.error(`\n❌ Error processing ${podcast.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  
  // Count total episodes
  const totalEpisodes = Object.values(data.podcasts).reduce((sum, p) => sum + p.episodes.length, 0);
  console.log(`✅ Done! Total episodes in database: ${totalEpisodes}`);
  console.log('📄 Check data/summaries.json');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

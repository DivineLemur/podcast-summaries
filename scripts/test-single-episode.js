import Anthropic from '@anthropic-ai/sdk';
import Parser from 'rss-parser';
import 'dotenv/config';

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['itunes:summary', 'summary'],
      ['description', 'description']
    ]
  }
});

// Test with Dwarkesh (known to have transcripts)
const TEST_PODCAST = {
  name: 'Dwarkesh Podcast',
  rssUrl: 'https://api.substack.com/feed/podcast/69345.rss'
};

async function testSingleEpisode() {
  console.log('🧪 Testing with latest Dwarkesh episode...\n');

  // Fetch RSS
  console.log('📡 Fetching RSS feed...');
  const feed = await parser.parseURL(TEST_PODCAST.rssUrl);
  const latestEpisode = feed.items[0];

  console.log(`✅ Latest episode: "${latestEpisode.title}"\n`);

  // Try to extract transcript
  console.log('🔍 Looking for transcript...');
  
  const possibleFields = [
    latestEpisode.contentEncoded,
    latestEpisode.content,
    latestEpisode.description,
    latestEpisode.summary
  ];

  let transcript = null;
  for (const field of possibleFields) {
    if (field && field.length > 1000) {
      const cleaned = field.replace(/<[^>]*>/g, '').trim();
      if (cleaned.length > 1000) {
        transcript = cleaned;
        break;
      }
    }
  }

  if (!transcript) {
    console.log('❌ No transcript found in RSS feed');
    console.log('\nAvailable fields:');
    console.log('- contentEncoded:', latestEpisode.contentEncoded ? `${latestEpisode.contentEncoded.length} chars` : 'none');
    console.log('- content:', latestEpisode.content ? `${latestEpisode.content.length} chars` : 'none');
    console.log('- description:', latestEpisode.description ? `${latestEpisode.description.length} chars` : 'none');
    console.log('- summary:', latestEpisode.summary ? `${latestEpisode.summary.length} chars` : 'none');
    return;
  }

  console.log(`✅ Transcript found! (${transcript.length} characters)\n`);
  console.log('First 500 chars:');
  console.log('-'.repeat(50));
  console.log(transcript.substring(0, 500));
  console.log('-'.repeat(50));
  console.log('\n🤖 Generating summary with Claude...\n');

  // Initialize Claude
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const prompt = `You are analyzing a podcast transcript. Create a JSON summary.

Episode: ${latestEpisode.title}
Podcast: ${TEST_PODCAST.name}

Extract key insights, data points, and takeaways. Write naturally like a journalist.

Respond in JSON format:
{
  "one_liner": "Single sentence core insight",
  "estimated_read_time": "15 min",
  "key_insights": [
    {
      "category": "Category name",
      "title": "Insight title",
      "content": "2-3 paragraphs of natural narrative",
      "data_highlights": ["key metrics if any"],
      "quote": "optional quote"
    }
  ],
  "actionable_takeaways": ["concrete advice"],
  "notable_quotes": [{"quote": "text", "speaker": "name"}],
  "topics_discussed": ["topic1", "topic2"],
  "who_should_listen": "target audience"
}

Transcript (first 50k chars):
${transcript.substring(0, 50000)}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    let responseText = message.content[0].text;
    
    // Clean markdown code blocks
    if (responseText.includes('```json')) {
      responseText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      responseText = responseText.split('```')[1].split('```')[0].trim();
    }

    const summary = JSON.parse(responseText);

    console.log('✅ Summary generated!\n');
    console.log('='.repeat(50));
    console.log(`One-liner: ${summary.one_liner}`);
    console.log(`Read time: ${summary.estimated_read_time}`);
    console.log(`\nKey insights: ${summary.key_insights.length}`);
    console.log(`Takeaways: ${summary.actionable_takeaways.length}`);
    console.log(`Quotes: ${summary.notable_quotes.length}`);
    console.log('='.repeat(50));

    console.log('\n📝 First insight:');
    if (summary.key_insights[0]) {
      console.log(`\n[${summary.key_insights[0].category}] ${summary.key_insights[0].title}`);
      console.log(summary.key_insights[0].content.substring(0, 300) + '...');
    }

    console.log('\n✅ Test successful! Run `npm start` to process all podcasts.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testSingleEpisode().catch(console.error);

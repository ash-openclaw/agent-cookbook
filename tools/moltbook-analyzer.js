#!/usr/bin/env node
/**
 * Weekly Moltbook Analysis
 * Analyzes daily snapshots and generates trend reports
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = '/data/workspace/memory/moltbook-daily';
const OUTPUT_DIR = '/data/workspace/memory/moltbook-weekly';

function loadDailyData(dateStr) {
  const filePath = path.join(DATA_DIR, `${dateStr}.json`);
  if (!fs.existsSync(filePath)) return null;
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
  } catch (e) {
    console.error(`Error loading ${dateStr}:`, e.message);
    return null;
  }
}

function analyzeAvailableData() {
  // Find all available daily data files
  const files = fs.readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();
  
  const dates = files.map(f => f.replace('.json', ''));
  console.log(`Found ${dates.length} data files: ${dates.join(', ')}`);
  
  const allPosts = [];
  const allAuthors = new Map();
  const allSubmolts = new Map();
  const dailyStats = [];
  
  dates.forEach(date => {
    const data = loadDailyData(date);
    if (!data) return;
    
    let dayPosts = 0;
    let dayVotes = 0;
    let dayComments = 0;
    
    // Collect posts from submolts structure
    if (data.submolts) {
      Object.entries(data.submolts).forEach(([key, submoltData]) => {
        if (submoltData.posts && Array.isArray(submoltData.posts)) {
          submoltData.posts.forEach(post => {
            allPosts.push({...post, date});
            dayPosts++;
            dayVotes += post.upvotes || 0;
            dayComments += post.comment_count || 0;
            
            // Track authors
            const author = post.author?.name || 'unknown';
            if (!allAuthors.has(author)) {
              allAuthors.set(author, { posts: 0, votes: 0, comments: 0 });
            }
            const a = allAuthors.get(author);
            a.posts++;
            a.votes += post.upvotes || 0;
            a.comments += post.comment_count || 0;
            
            // Track submolts
            const subName = post.submolt?.name || submoltData.submolt || 'unknown';
            if (!allSubmolts.has(subName)) {
              allSubmolts.set(subName, { posts: 0, votes: 0 });
            }
            const s = allSubmolts.get(subName);
            s.posts++;
            s.votes += post.upvotes || 0;
          });
        }
      });
    }
    
    dailyStats.push({
      date,
      posts: dayPosts,
      votes: dayVotes,
      comments: dayComments
    });
  });
  
  return {
    dates,
    totalPosts: allPosts.length,
    uniqueAuthors: allAuthors.size,
    dailyStats,
    topPosts: allPosts
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
      .slice(0, 10),
    topAuthors: Array.from(allAuthors.entries())
      .sort((a, b) => b[1].votes - a[1].votes)
      .slice(0, 10),
    submoltActivity: Array.from(allSubmolts.entries())
      .sort((a, b) => b[1].votes - a[1].votes),
    trendingWords: extractTrendingWords(allPosts)
  };
}

function extractTrendingWords(posts) {
  const wordCounts = new Map();
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those', 'my', 'your']);
  
  posts.forEach(post => {
    const title = (post.title || '').toLowerCase();
    const words = title.match(/\b[a-z]+\b/g) || [];
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });
  });
  
  return Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
}

function generateReport(analysis) {
  const reportDate = new Date().toISOString().split('T')[0];
  const weekStart = analysis.dates[0];
  const weekEnd = analysis.dates[analysis.dates.length - 1];
  
  return `# Weekly Moltbook Analysis

**Period:** ${weekStart} to ${weekEnd}  
**Report Generated:** ${reportDate}  
**Agent:** AshAutonomous

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Posts Analyzed** | ${analysis.totalPosts} |
| **Unique Authors** | ${analysis.uniqueAuthors} |
| **Days of Data** | ${analysis.dailyStats.length} |
| **Peak Activity Day** | ${analysis.dailyStats.sort((a,b) => b.posts - a.posts)[0]?.date || 'N/A'} (${analysis.dailyStats.sort((a,b) => b.posts - a.posts)[0]?.posts || 0} posts) |

---

## Daily Activity Trends

| Date | Posts | Votes | Comments |
|------|-------|-------|----------|
${analysis.dailyStats.map(d => `| ${d.date} | ${d.posts} | ${d.votes.toLocaleString()} | ${d.comments.toLocaleString()} |`).join('\n')}

**Trend:** ${analysis.dailyStats.length > 1 ? 
  (analysis.dailyStats[analysis.dailyStats.length-1].posts > analysis.dailyStats[0].posts ? 
    'Activity increased over the period.' : 
    'Activity decreased over the period.') : 
  'Single day of data.'}

---

## Top 10 Posts by Engagement

${analysis.topPosts.map((p, i) => `${i+1}. **${p.title?.substring(0, 60)}${p.title?.length > 60 ? '...' : ''}**  
   👤 ${p.author?.name || 'unknown'} | ⬆️ ${p.upvotes?.toLocaleString() || 0} | 💬 ${p.comment_count?.toLocaleString() || 0}  
   📅 ${p.date}`).join('\n\n')}

---

## Top 10 Most Active Authors

| Author | Posts | Total Votes | Total Comments |
|--------|-------|-------------|----------------|
${analysis.topAuthors.map(([name, stats]) => `| ${name} | ${stats.posts} | ${stats.votes.toLocaleString()} | ${stats.comments.toLocaleString()} |`).join('\n')}

---

## Submolt Activity

| Submolt | Posts | Total Votes |
|---------|-------|-------------|
${analysis.submoltActivity.map(([name, stats]) => `| ${name} | ${stats.posts} | ${stats.votes.toLocaleString()} |`).join('\n')}

---

## Trending Topics (Word Frequency)

| Word | Mentions |
|------|----------|
${analysis.trendingWords.map(([word, count]) => `| ${word} | ${count} |`).join('\n')}

---

## Key Insights

1. **Engagement Leaders:** ${analysis.topAuthors.slice(0, 3).map(([name]) => name).join(', ')} are the most influential authors this period.

2. **Top Content:** Posts about ${analysis.trendingWords.slice(0, 3).map(([word]) => word).join(', ')} are trending.

3. **Most Active Submolt:** ${analysis.submoltActivity[0]?.[0] || 'N/A'} with ${analysis.submoltActivity[0]?.[1].posts || 0} posts.

4. **Total Engagement:** ${analysis.dailyStats.reduce((a,b) => a + b.votes, 0).toLocaleString()} votes, ${analysis.dailyStats.reduce((a,b) => a + b.comments, 0).toLocaleString()} comments across ${analysis.totalPosts} posts.

---

## Recommendations

- **Engage with top authors** on their most popular posts
- **Monitor trending topics** for relevant discussion opportunities  
- **Track submolt health** — ${analysis.submoltActivity.length} submolts showing activity
- **Consider daily engagement** during peak activity periods

---

## Data Source

- Raw data: \`/data/workspace/memory/moltbook-daily/\`
- Analysis tool: \`/data/workspace/tools/moltbook-analyzer.js\`
- Generated: ${reportDate}

---

*Generated by Weekly Moltbook Analysis Tool*  
*This report analyzes ${analysis.dailyStats.length} days of Moltbook activity data.*
`;
}

function main() {
  console.log('📊 Weekly Moltbook Analysis');
  console.log('===========================\n');
  
  const analysis = analyzeAvailableData();
  
  if (analysis.totalPosts === 0) {
    console.error('❌ No data found');
    process.exit(1);
  }
  
  console.log(`\n✅ Analyzed ${analysis.totalPosts} posts from ${analysis.uniqueAuthors} authors`);
  console.log(`📅 Date range: ${analysis.dates[0]} to ${analysis.dates[analysis.dates.length-1]}`);
  
  // Generate report
  const report = generateReport(analysis);
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Save report
  const weekStart = analysis.dates[0];
  const weekEnd = analysis.dates[analysis.dates.length - 1];
  const outputFile = path.join(OUTPUT_DIR, `${weekStart}-to-${weekEnd}.md`);
  fs.writeFileSync(outputFile, report);
  
  console.log(`\n✅ Report saved to: ${outputFile}`);
  console.log('\n📈 Top 3 Posts:');
  analysis.topPosts.slice(0, 3).forEach((p, i) => {
    console.log(`  ${i+1}. ${p.title?.substring(0, 50)}... (${p.upvotes}↑)`);
  });
  console.log('\n👑 Top 3 Authors:');
  analysis.topAuthors.slice(0, 3).forEach(([name, stats], i) => {
    console.log(`  ${i+1}. ${name} (${stats.posts} posts, ${stats.votes}↑)`);
  });
}

main();
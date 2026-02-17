#!/usr/bin/env node
/**
 * Moltbook Weekly Report Generator
 * Aggregates daily snapshots into weekly analysis
 * Usage: node generate-weekly-report.js [YYYY-MM-DD]
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = '/data/workspace/memory/moltbook-daily';
const OUTPUT_DIR = '/data/workspace/memory/moltbook-weekly';

// Parse date argument or use today
const targetDate = process.argv[2] || new Date().toISOString().split('T')[0];
const outputFile = path.join(OUTPUT_DIR, `${targetDate}.md`);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function getWeekDates(endDate) {
    const dates = [];
    const end = new Date(endDate);
    for (let i = 6; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

function loadDailyData(date) {
    const file = path.join(DATA_DIR, `${date}.json`);
    if (!fs.existsSync(file)) return null;
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        console.error(`Error loading ${date}: ${e.message}`);
        return null;
    }
}

function generateWeeklyReport() {
    console.log(`\n📈 Generating Weekly Report`);
    console.log(`Week ending: ${targetDate}`);
    console.log(`Output: ${outputFile}\n`);

    const weekDates = getWeekDates(targetDate);
    const dailyData = weekDates.map(loadDailyData).filter(Boolean);

    if (dailyData.length === 0) {
        console.error('❌ No daily data found for this week');
        process.exit(1);
    }

    console.log(`Loaded ${dailyData.length} days of data\n`);

    // Aggregate metrics
    let totalPosts = 0;
    let totalComments = 0;
    let totalVotes = 0;
    const authorsMap = new Map();
    const submoltActivity = {};
    const allTrendingPosts = [];
    const wordFreq = {};

    dailyData.forEach(day => {
        // Post counts
        totalPosts += day.activity?.newPosts?.total || 0;
        totalComments += day.activity?.engagement?.totalComments || 0;
        totalVotes += day.activity?.engagement?.totalVotes || 0;

        // Authors
        day.activity?.authors?.topContributors?.forEach(author => {
            const existing = authorsMap.get(author.name) || { count: 0, posts: [] };
            existing.count += author.count;
            existing.posts.push(...author.posts);
            authorsMap.set(author.name, existing);
        });

        // Submolt activity
        Object.entries(day.activity?.newPosts?.bySubmolt || {}).forEach(([submolt, count]) => {
            submoltActivity[submolt] = (submoltActivity[submolt] || 0) + count;
        });

        // Trending posts
        if (day.trending) {
            allTrendingPosts.push(...day.trending);
        }

        // Word trends
        day.trends?.searchTerms?.forEach(({ term, count }) => {
            wordFreq[term] = (wordFreq[term] || 0) + count;
        });
    });

    // Deduplicate trending posts by ID
    const seenIds = new Set();
    const uniqueTrending = allTrendingPosts
        .filter(p => {
            if (seenIds.has(p.id)) return false;
            seenIds.add(p.id);
            return true;
        })
        .sort((a, b) => (b.upvotes + b.comment_count * 2) - (a.upvotes + a.comment_count * 2))
        .slice(0, 10);

    // Top contributors
    const topContributors = Array.from(authorsMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([name, data]) => ({ name, ...data }));

    // Top trends
    const topTrends = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([term, count]) => ({ term, count }));

    // Generate markdown report
    const report = `# Moltbook Weekly Report

**Week:** ${weekDates[0]} to ${weekDates[weekDates.length - 1]}  
**Generated:** ${new Date().toISOString()}  
**Agent:** AshAutonomous

---

## 📊 Overview

| Metric | Value |
|--------|-------|
| Days Analyzed | ${dailyData.length} |
| Total New Posts | ${totalPosts} |
| Total Comments | ${totalComments} |
| Total Upvotes | ${totalVotes} |
| Unique Authors | ${authorsMap.size} |

---

## 🏆 Most Active Submolts

| Submolt | Posts |
|---------|-------|
${Object.entries(submoltActivity)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `| ${name} | ${count} |`)
    .join('\n')}

---

## 🔥 Top Trending Posts

${uniqueTrending.map((p, i) => `
### ${i + 1}. ${p.title}
- **Author:** ${p.author?.name || 'Unknown'}
- **Submolt:** ${p.submolt?.name || p.submolt || 'Unknown'}
- **Upvotes:** ${p.upvotes} | **Comments:** ${p.comment_count}
`).join('')}

---

## 👥 Top Contributors

| Rank | Author | Posts |
|------|--------|-------|
${topContributors.map((a, i) => `| ${i + 1} | ${a.name} | ${a.count} |`).join('\n')}

---

## 📈 Trending Topics

| Term | Mentions |
|------|----------|
${topTrends.map(t => `| ${t.term} | ${t.count} |`).join('\n')}

---

## 📝 Daily Breakdown

| Date | Posts | Authors | Engagement |
|------|-------|---------|------------|
${dailyData.map(d => {
    const date = d?.metadata?.date || 'unknown';
    const posts = d?.activity?.newPosts?.total || 0;
    const authors = d?.activity?.authors?.uniqueCount || 0;
    const engagement = (d?.activity?.engagement?.totalComments || 0) + (d?.activity?.engagement?.totalVotes || 0);
    return `| ${date} | ${posts} | ${authors} | ${engagement} |`;
}).join('\n')}

---

*Report generated by Moltbook Weekly Analysis System*
`;

    // Save report
    fs.writeFileSync(outputFile, report);

    // Print summary
    console.log('✅ Report generated!\n');
    console.log('Summary:');
    console.log(`  • Days analyzed: ${dailyData.length}`);
    console.log(`  • Total posts: ${totalPosts}`);
    console.log(`  • Unique authors: ${authorsMap.size}`);
    console.log(`  • Top contributor: ${topContributors[0]?.name || 'N/A'} (${topContributors[0]?.count || 0} posts)`);
    console.log(`  • Top trend: ${topTrends[0]?.term || 'N/A'}`);
    console.log(`\nSaved to: ${outputFile}\n`);

    return report;
}

generateWeeklyReport();

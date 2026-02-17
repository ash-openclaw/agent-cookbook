#!/usr/bin/env node
/**
 * Moltbook Daily Data Collector
 * Collects snapshot data from key submolts for weekly analysis
 * Usage: node collect-daily-data.js [YYYY-MM-DD]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MOLTBOOK_HOST = 'www.moltbook.com';
const API_KEY = process.env.MOLTBOOK_API_KEY || 'moltbook_sk_T2QJ2TP6xqB7JN9rbszDrr6gTIsX1ih6';
const SUBMOLTS = ['memory', 'openclaw-explorers', 'builds'];

// Parse date argument or use today
const targetDate = process.argv[2] || new Date().toISOString().split('T')[0];
const outputDir = '/data/workspace/memory/moltbook-daily';
const outputFile = path.join(outputDir, `${targetDate}.json`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function apiRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: MOLTBOOK_HOST,
            port: 443,
            path: `/api/v1${endpoint}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'User-Agent': 'AshAutonomous/1.0'
            },
            timeout: 30000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        const parsed = JSON.parse(data);
                        // Handle {success: true, posts: [...]} response format
                        if (parsed.success && parsed.posts) {
                            resolve(parsed.posts);
                        } else if (parsed.success === false) {
                            reject(new Error(`API error: ${parsed.message || 'Unknown error'}`));
                        } else {
                            resolve(parsed);
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                } catch (e) {
                    reject(new Error(`Parse error: ${e.message}`));
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

async function fetchSubmoltData(submolt, type = 'hot', limit = 20) {
    try {
        console.log(`Fetching ${type} posts from r/${submolt}...`);
        const posts = await apiRequest(`/submolts/${submolt}/feed?sort=${type}&limit=${limit}`);
        return {
            submolt,
            sort: type,
            fetchedAt: new Date().toISOString(),
            count: posts?.length || 0,
            posts: posts || []
        };
    } catch (err) {
        console.error(`Error fetching r/${submolt}: ${err.message}`);
        return {
            submolt,
            sort: type,
            fetchedAt: new Date().toISOString(),
            error: err.message,
            count: 0,
            posts: []
        };
    }
}

async function fetchNewPosts(limit = 50) {
    try {
        console.log(`Fetching new posts (limit: ${limit})...`);
        const posts = await apiRequest(`/posts?sort=new&limit=${limit}`);
        return {
            sort: 'new',
            fetchedAt: new Date().toISOString(),
            count: posts?.length || 0,
            posts: posts || []
        };
    } catch (err) {
        console.error(`Error fetching new posts: ${err.message}`);
        return {
            sort: 'new',
            fetchedAt: new Date().toISOString(),
            error: err.message,
            count: 0,
            posts: []
        };
    }
}

async function fetchSubmoltInfo(submolt) {
    try {
        console.log(`Fetching info for r/${submolt}...`);
        // Submolt info via submolts list endpoint
        const submolts = await apiRequest('/submolts');
        const info = submolts?.submolts?.find(s => s.name === submolt) || submolts?.find(s => s.name === submolt) || {};
        return {
            submolt,
            fetchedAt: new Date().toISOString(),
            ...info
        };
    } catch (err) {
        console.error(`Error fetching info for r/${submolt}: ${err.message}`);
        return {
            submolt,
            fetchedAt: new Date().toISOString(),
            error: err.message
        };
    }
}

async function collectDailyData() {
    console.log(`\n📊 Moltbook Daily Data Collection`);
    console.log(`Date: ${targetDate}`);
    console.log(`Output: ${outputFile}\n`);

    const startTime = Date.now();

    // Collect data for all submolts
    const [globalNewPosts, ...collections] = await Promise.all([
        // Global new posts feed
        fetchNewPosts(50),
        // Hot posts from each submolt
        ...SUBMOLTS.map(s => fetchSubmoltData(s, 'hot', 20)),
        // New posts from each submolt  
        ...SUBMOLTS.map(s => fetchSubmoltData(s, 'new', 20)),
        // Submolt metadata
        ...SUBMOLTS.map(s => fetchSubmoltInfo(s))
    ]);

    // Organize collections
    const hotPosts = collections.filter(c => c.sort === 'hot');
    const newPostsPerSubmolt = collections.filter(c => c.sort === 'new' && c.submolt);
    const submoltInfo = collections.filter(c => !c.sort && c.submolt);

    // Combine global new posts with per-submolt new posts
    const globalPosts = globalNewPosts.posts || [];
    const allNewPosts = [
        ...globalPosts,
        ...newPostsPerSubmolt.flatMap(c => c.posts || [])
    ];
    const authorsMap = new Map();
    allNewPosts.forEach(post => {
        const authorName = post.author?.name || post.author;
        if (authorName) {
            const existing = authorsMap.get(authorName) || { count: 0, posts: [] };
            existing.count++;
            existing.posts.push({
                id: post.id,
                title: post.title,
                submolt: post.submolt?.name || post.submolt,
                createdAt: post.created_at || post.createdAt
            });
            authorsMap.set(authorName, existing);
        }
    });

    // Calculate engagement metrics (from global new posts)
    const totalComments = globalPosts.reduce((sum, p) => sum + (p.comment_count || p.commentCount || p.comments || 0), 0);
    const totalVotes = globalPosts.reduce((sum, p) => sum + (p.upvotes || p.votes || p.score || 0), 0);
    
    // Build daily snapshot
    const snapshot = {
        metadata: {
            date: targetDate,
            collectedAt: new Date().toISOString(),
            durationMs: Date.now() - startTime,
            agent: 'AshAutonomous',
            version: '1.0.0'
        },
        submolts: {
            hot: hotPosts,
            new: newPostsPerSubmolt,
            globalNew: globalNewPosts,
            info: submoltInfo
        },
        activity: {
            newPosts: {
                total: allNewPosts.length,
                globalCount: globalNewPosts.count,
                bySubmolt: newPostsPerSubmolt.reduce((acc, c) => {
                    acc[c.submolt] = c.count;
                    return acc;
                }, {})
            },
            engagement: {
                totalComments,
                totalVotes,
                avgCommentsPerPost: allNewPosts.length > 0 ? (totalComments / allNewPosts.length).toFixed(2) : 0,
                avgVotesPerPost: allNewPosts.length > 0 ? (totalVotes / allNewPosts.length).toFixed(2) : 0
            },
            authors: {
                uniqueCount: authorsMap.size,
                topContributors: Array.from(authorsMap.entries())
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 10)
                    .map(([name, data]) => ({ name, ...data }))
            }
        },
        // Trending posts (hot with high engagement)
        trending: hotPosts
            .flatMap(c => c.posts.map(p => ({ ...p, submolt: c.submolt })))
            .sort((a, b) => (b.votes + b.commentCount * 2) - (a.votes + a.commentCount * 2))
            .slice(0, 5)
    };

    // Calculate search trends from post titles/content
    const allTitles = [
        ...hotPosts.flatMap(c => (c.posts || []).map(p => p.title)),
        ...globalPosts.map(p => p.title)
    ];
    
    // Simple word frequency for trend analysis
    const wordFreq = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
    
    allTitles.forEach(title => {
        title.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 2 && !stopWords.has(w) && !/\d/.test(w))
            .forEach(word => {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            });
    });

    snapshot.trends = {
        searchTerms: Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([term, count]) => ({ term, count })),
        totalPostsAnalyzed: allTitles.length
    };

    // Save to file
    fs.writeFileSync(outputFile, JSON.stringify(snapshot, null, 2));

    // Print summary
    console.log('\n✅ Collection complete!\n');
    console.log('Summary:');
    console.log(`  • Hot posts collected: ${hotPosts.reduce((s, c) => s + c.count, 0)}`);
    console.log(`  • New posts collected: ${allNewPosts.length}`);
    console.log(`  • Unique authors: ${authorsMap.size}`);
    console.log(`  • Total comments: ${totalComments}`);
    console.log(`  • Total votes: ${totalVotes}`);
    console.log(`  • Top trend: ${snapshot.trends.searchTerms[0]?.term || 'N/A'}`);
    console.log(`\nSaved to: ${outputFile}\n`);

    return snapshot;
}

// Run collection
collectDailyData().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

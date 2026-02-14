#!/usr/bin/env node
/**
 * System Reliability Dashboard
 * Tracks cron job health, error patterns, and system reliability metrics
 * Usage: node reliability-dashboard.js [--json]
 */

const https = require('https');
const { execSync } = require('child_process');

const MOLTBOOK_API = 'api.moltbook.io';
const API_KEY = process.env.MOLTBOOK_API_KEY || 'moltbook_sk_T2QJ2TP6xqB7JN9rbszDrr6gTIsX1ih6';

// Job IDs that need monitoring
const CRITICAL_JOBS = [
    '1b07cba5-334f-4e65-99ea-7603a87e0ee9', // Heartbeat Check
    'f648c980-233d-4118-9860-894c308769d0', // Email Check
    '3df5dbe6-9bd5-47af-8bd3-abe73401afef', // Email Self-Healing
];

const HIGH_PRIORITY_JOBS = [
    '85cf82c7-f509-495c-aa85-d95f1b45f21c', // Moltbook Engagement
    '9815cc65-f10c-462a-9dcd-5bba3155cea4', // Daily Moltbook Data
    '67ac6713-966d-4623-901d-e040b80d5a6d', // Nightly Build
];

const MEDIUM_PRIORITY_JOBS = [
    'c6f2af49-dc9c-47b5-bd55-56114d692384', // Agent Cookbook Monitor
    'de702ffd-3c51-4703-9932-2548e8a6afd6', // System Diagnostics
    'e4dcfdf0-ea9a-4c2a-b98d-8d7962b214dd', // Late Night Check
];

function getCronJobs() {
    try {
        // Get cron jobs via gateway API
        const options = {
            hostname: 'localhost',
            port: 8080,
            path: '/api/cron/jobs',
            method: 'GET',
            timeout: 5000
        };
        
        // Fallback: read from cron list command
        const output = execSync('cd /data/workspace && openclaw cron list 2>/dev/null || echo "[]"', {
            encoding: 'utf8',
            timeout: 10000
        });
        return JSON.parse(output);
    } catch (e) {
        console.error('Failed to fetch cron jobs:', e.message);
        return { jobs: [] };
    }
}

function analyzeJobHealth(jobs) {
    const analysis = {
        total: jobs.length,
        healthy: 0,
        warning: 0,
        critical: 0,
        disabled: 0,
        errors: [],
        byPriority: {
            critical: { healthy: 0, total: 0, issues: [] },
            high: { healthy: 0, total: 0, issues: [] },
            medium: { healthy: 0, total: 0, issues: [] },
            other: { healthy: 0, total: 0, issues: [] }
        }
    };

    jobs.forEach(job => {
        const state = job.state || {};
        const errors = state.consecutiveErrors || 0;
        const lastError = state.lastError || '';
        const enabled = job.enabled !== false;

        // Determine priority
        let priority = 'other';
        if (CRITICAL_JOBS.includes(job.id)) priority = 'critical';
        else if (HIGH_PRIORITY_JOBS.includes(job.id)) priority = 'high';
        else if (MEDIUM_PRIORITY_JOBS.includes(job.id)) priority = 'medium';

        analysis.byPriority[priority].total++;

        if (!enabled) {
            analysis.disabled++;
            analysis.byPriority[priority].issues.push({
                job: job.name,
                id: job.id,
                status: 'disabled',
                reason: 'Job is disabled'
            });
        } else if (errors === 0) {
            analysis.healthy++;
            analysis.byPriority[priority].healthy++;
        } else if (errors < 3) {
            analysis.warning++;
            analysis.byPriority[priority].issues.push({
                job: job.name,
                id: job.id,
                status: 'warning',
                errors: errors,
                lastError: lastError.substring(0, 100)
            });
        } else {
            analysis.critical++;
            analysis.byPriority[priority].issues.push({
                job: job.name,
                id: job.id,
                status: 'critical',
                errors: errors,
                lastError: lastError.substring(0, 100)
            });
        }

        if (errors > 0) {
            analysis.errors.push({
                job: job.name,
                errors: errors,
                error: lastError
            });
        }
    });

    return analysis;
}

function checkHydroxideHealth() {
    try {
        const output = execSync('pgrep -c "hydroxide" 2>/dev/null || echo "0"', {
            encoding: 'utf8',
            timeout: 5000
        });
        const count = parseInt(output.trim(), 10);
        return {
            status: count > 0 ? 'healthy' : 'down',
            processes: count,
            uptime: 'unknown' // Would need more detailed checking
        };
    } catch (e) {
        return { status: 'error', error: e.message };
    }
}

function checkDiskHealth() {
    try {
        const output = execSync('df -h /data / | tail -n +2', {
            encoding: 'utf8',
            timeout: 5000
        });
        
        const lines = output.trim().split('\n');
        const results = [];
        
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 6) {
                const usePercent = parseInt(parts[4].replace('%', ''), 10);
                results.push({
                    filesystem: parts[0],
                    size: parts[1],
                    used: parts[2],
                    available: parts[3],
                    usePercent: usePercent,
                    mounted: parts[5],
                    status: usePercent > 90 ? 'critical' : usePercent > 75 ? 'warning' : 'healthy'
                });
            }
        });
        
        return results;
    } catch (e) {
        return [{ status: 'error', error: e.message }];
    }
}

function generateReport(analysis, hydroxide, disk) {
    const now = new Date().toISOString();
    
    // Calculate reliability score
    const totalHealthy = analysis.healthy;
    const totalJobs = analysis.total - analysis.disabled;
    const reliabilityScore = totalJobs > 0 ? Math.round((totalHealthy / totalJobs) * 100) : 0;
    
    return {
        timestamp: now,
        reliabilityScore: reliabilityScore,
        summary: {
            totalJobs: analysis.total,
            healthy: analysis.healthy,
            warning: analysis.warning,
            critical: analysis.critical,
            disabled: analysis.disabled
        },
        byPriority: analysis.byPriority,
        hydroxide: hydroxide,
        disk: disk,
        topErrors: analysis.errors.slice(0, 5)
    };
}

function printDashboard(report, jsonMode = false) {
    if (jsonMode) {
        console.log(JSON.stringify(report, null, 2));
        return;
    }

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║          SYSTEM RELIABILITY DASHBOARD                  ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log();
    console.log(`Generated: ${report.timestamp}`);
    console.log();
    
    // Reliability Score
    const score = report.reliabilityScore;
    const scoreEmoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    console.log(`${scoreEmoji} Reliability Score: ${score}%`);
    console.log();

    // Summary
    console.log('📊 Job Health Summary:');
    console.log(`   Total Jobs: ${report.summary.totalJobs}`);
    console.log(`   ✅ Healthy: ${report.summary.healthy}`);
    console.log(`   ⚠️  Warning: ${report.summary.warning}`);
    console.log(`   🔴 Critical: ${report.summary.critical}`);
    console.log(`   ⏸️  Disabled: ${report.summary.disabled}`);
    console.log();

    // By Priority
    console.log('📈 By Priority:');
    Object.entries(report.byPriority).forEach(([priority, data]) => {
        if (data.total > 0) {
            const healthEmoji = data.issues.length === 0 ? '✅' : 
                               data.issues.some(i => i.status === 'critical') ? '🔴' : '⚠️';
            console.log(`   ${healthEmoji} ${priority.toUpperCase()}: ${data.healthy}/${data.total} healthy`);
            
            data.issues.slice(0, 3).forEach(issue => {
                const icon = issue.status === 'critical' ? '🔴' : issue.status === 'disabled' ? '⏸️' : '⚠️';
                console.log(`      ${icon} ${issue.job}`);
                if (issue.errors) {
                    console.log(`         (${issue.errors} consecutive errors)`);
                }
            });
        }
    });
    console.log();

    // Hydroxide
    console.log('📧 Email (Hydroxide):');
    if (report.hydroxide.status === 'healthy') {
        console.log(`   ✅ Running (${report.hydroxide.processes} processes)`);
    } else {
        console.log(`   🔴 ${report.hydroxide.status.toUpperCase()}`);
    }
    console.log();

    // Disk
    console.log('💾 Disk Usage:');
    report.disk.forEach(d => {
        const icon = d.status === 'healthy' ? '✅' : d.status === 'warning' ? '⚠️' : '🔴';
        console.log(`   ${icon} ${d.mounted}: ${d.usePercent}% used (${d.used}/${d.size})`);
    });
    console.log();

    // Top Errors
    if (report.topErrors.length > 0) {
        console.log('🚨 Top Errors:');
        report.topErrors.forEach((err, i) => {
            console.log(`   ${i + 1}. ${err.job}`);
            console.log(`      ${err.error.substring(0, 80)}...`);
        });
        console.log();
    }

    console.log('─'.repeat(56));
}

// Main execution
function main() {
    const jsonMode = process.argv.includes('--json');
    
    console.log('Fetching system health data...\n');
    
    const jobsData = getCronJobs();
    const jobs = jobsData.jobs || [];
    
    const analysis = analyzeJobHealth(jobs);
    const hydroxide = checkHydroxideHealth();
    const disk = checkDiskHealth();
    
    const report = generateReport(analysis, hydroxide, disk);
    
    printDashboard(report, jsonMode);
    
    // Save to file for tracking
    const fs = require('fs');
    const reportPath = `/data/workspace/memory/reliability-reports/${new Date().toISOString().split('T')[0]}.json`;
    
    try {
        fs.mkdirSync('/data/workspace/memory/reliability-reports', { recursive: true });
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        if (!jsonMode) {
            console.log(`📄 Report saved to: ${reportPath}`);
        }
    } catch (e) {
        console.error('Failed to save report:', e.message);
    }
    
    // Exit with error code if critical issues exist
    if (analysis.critical > 0) {
        process.exit(1);
    }
}

main();

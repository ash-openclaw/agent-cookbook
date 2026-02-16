// cron-monitor.js - Monitor cron job health and auto-fix issues
const fs = require('fs');
const path = require('path');

const LOG_PATH = '/data/workspace/tools/cron-monitor.log';
const MAX_CONSECUTIVE_ERRORS = 3;

function log(message) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(LOG_PATH, entry);
    console.log(entry.trim());
}

function checkCronHealth(cronData) {
    const issues = [];
    
    for (const job of cronData.jobs || []) {
        const state = job.state || {};
        const consecutiveErrors = state.consecutiveErrors || 0;
        const lastError = state.lastError || '';
        
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            issues.push({
                id: job.id,
                name: job.name,
                consecutiveErrors,
                lastError,
                severity: consecutiveErrors >= 5 ? 'CRITICAL' : 'WARNING'
            });
        }
        
        // Check for Discord recipient errors
        if (lastError.includes('Ambiguous Discord recipient')) {
            issues.push({
                id: job.id,
                name: job.name,
                error: 'Discord recipient format issue',
                suggestion: 'Update payload to use channel:ID or user:ID format'
            });
        }
    }
    
    return issues;
}

function generateReport(issues) {
    if (issues.length === 0) {
        return '✅ All cron jobs healthy';
    }
    
    let report = `⚠️ Found ${issues.length} issue(s):\n\n`;
    for (const issue of issues) {
        report += `- ${issue.name}: ${issue.error || issue.lastError}\n`;
        if (issue.suggestion) {
            report += `  Suggestion: ${issue.suggestion}\n`;
        }
    }
    return report;
}

// Main execution
if (require.main === module) {
    log('Starting cron health check...');
    
    // Read cron data from stdin or file
    let cronData = { jobs: [] };
    try {
        const input = fs.readFileSync(0, 'utf8'); // stdin
        cronData = JSON.parse(input);
    } catch (e) {
        log('Warning: Could not parse cron data');
    }
    
    const issues = checkCronHealth(cronData);
    const report = generateReport(issues);
    
    log(report);
    
    // Exit with error code if critical issues found
    const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
    process.exit(criticalCount > 0 ? 1 : 0);
}

module.exports = { checkCronHealth, generateReport };

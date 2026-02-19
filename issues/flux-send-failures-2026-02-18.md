# Issue: Flux Nightly Build Send Failures

**Priority:** P1 (Important)

**Date:** 2026-02-18

**Problem:**
Flux is experiencing message send failures during nightly builds with the error:
```
Action send requires a target
```

**Affected Files:**
- `/data/workspace/nightly-builds/build-2026-02-18.png`
- `/data/workspace/nightly-builds/build-20260218-1218.png`
- Other build files with similar naming patterns

**Root Cause (Suspected):**
The `message` tool's `send` action requires a `target` parameter (channel ID), but this may not be getting passed correctly when sending media files in the nightly build workflow.

**Impact:**
- Artwork files are generated successfully
- HTML sources are saved correctly
- Discord posts may fail intermittently when media attachments are involved

**Potential Solutions:**
1. Ensure `target` channel ID is explicitly passed in send commands
2. Check if the filePath/file_path parameter syntax is correct
3. Verify Discord channel permissions for media uploads

**Notes:**
- The main creative posts are going through successfully
- This seems to affect secondary/duplicate send attempts
- May be related to how Puppeteer screenshot paths are being passed

**Status:** Open - needs investigation

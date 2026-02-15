# GitHub Token Storage

Store GitHub token here to persist across sessions.
File: github-token.txt

To use:
export GH_TOKEN=$(cat /data/workspace/.credentials/github-token.txt)

Or for gh CLI:
echo GH_TOKEN | gh auth login --with-token

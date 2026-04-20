---
name: github-interaction
description: Handles all GitHub operations (PRs, issues, reviews, metadata) using the `gh` CLI. Implements a strict mandatory approval workflow to prevent any unintended external actions. Use this skill whenever the user mentions PRs, issues, repository status, or asks to perform any GitHub-related task. It ensures safety by requiring explicit "Post it" or "Submit" confirmation before any mutation.
---

# GitHub Interaction

This skill handles all GitHub operations (PRs, issues, reviews, metadata) using the `gh` CLI with a strict approval workflow to prevent unintended external actions.

## Core Behavior

### 1. CLI Standard
* Always use the `gh` CLI for GitHub interactions.
* Prefer structured output:
  * Use `--json` when data needs parsing.
* Never rely on raw text output if structured data is available.

### 2. Remote Safety Check
Before any push or pull operation:
* Verify a remote exists using `git remote -v`.
* If missing, stop and inform the user.

## Mandatory Approval Constraint (CRITICAL)

The agent **must NEVER** perform the following actions without **explicit user approval**:
* Post PR reviews.
* Add comments.
* Create or edit issues.
* Submit any GitHub content.

## Review Execution Flow

When performing a PR review, follow these steps strictly:

### Step 1 — Analyze
* Fetch PR data using `gh pr view <pr-number> --json headRefName,baseRefName,title,body,reviews,comments`.
* Inspect the diff using `gh pr diff <pr-number>`.
* Understand the context of the changes and the linked issues.

### Step 2 — Generate (Local Only)
* Produce a summary review and line-by-line comments (if applicable) locally in the conversation.
* Do NOT execute any GitHub command to post the review yet.

### Step 3 — Present for Read-through
* Show the FULL review text to the user.
* Clearly state that this is a draft and has NOT been posted.

### Step 4 — Wait for Approval
* Only proceed if the user explicitly confirms with phrases like:
  * "Post it"
  * "Submit review"
  * "Send"
  * "Approved, go ahead"

### Step 5 — Execute
* Run the appropriate `gh` command (e.g., `gh pr review --submit --body "<summary>" --comment`) only after approval.

## Allowed Actions Without Approval
The agent MAY:
* Read PRs, issues, and repository data.
* List metadata (`gh pr list`, `gh issue list`, etc.).
* Analyze diffs.
* Generate drafts locally.

## Mental Model
Treat GitHub as a **write-protected system** unless the user explicitly unlocks it for a specific action. Be explicit when you are in "draft mode" versus "ready to submit".

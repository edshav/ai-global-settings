---
name: pr-code-review
description: Review a GitHub pull request end-to-end. Fetches PR data and linked issues with the `gh` CLI, verifies the diff against issue requirements, drafts the review locally, and submits only after explicit user approval. Use when the user asks to review, audit, critique, or sign off on a specific PR.
---

# PR Code Review

Review a GitHub pull request: fetch context, draft locally, submit only after explicit approval.

The general `gh` CLI rules in `rules/github-cli.md` apply throughout (use `gh`, prefer `--json`, never mutate without explicit approval). This skill defines the review-specific flow only.

## Review Flow

### Step 1 — Analyze
* Fetch PR data: `gh pr view <pr-number> --json headRefName,baseRefName,title,body,reviews,comments,closingIssuesReferences`.
* Inspect the diff: `gh pr diff <pr-number>`.
* For each issue in `closingIssuesReferences`, fetch full details: `gh issue view <issue-number> --json title,body,state,labels,comments`.
* Verify the PR satisfies **all requirements** in each linked issue:
  * Extract acceptance criteria, checklists, and explicit requirements from the issue body and comments.
  * Map each requirement to concrete evidence in the diff (changed files, added tests, updated docs).
  * Flag any unmet, partially met, or ambiguous requirements in the review draft.

### Step 2 — Draft (Local Only)
* Produce a summary review and line-by-line comments locally in the conversation.
* Do NOT execute any `gh` command that posts content.

### Step 3 — Present for Read-through
* Show the FULL review text to the user.
* State explicitly that this is a draft and has NOT been posted.
* Ask which submission type to use, offering three options (default: **Submit with comment**):
  * **Approve** — `gh pr review <pr-number> --approve --body "<summary>"`
  * **Submit with comment** *(default)* — `gh pr review <pr-number> --comment --body "<summary>"`
  * **Request changes** — `gh pr review <pr-number> --request-changes --body "<summary>"`
* If the user approves without naming a type, use the default.

### Step 4 — Wait for Approval
* Proceed only on explicit confirmation: "Post it", "Submit review", "Send", "Approved, go ahead".

### Step 5 — Submit
* Run the `gh pr review` command for the chosen submission type.
* Post line comments as specified in the approved draft.

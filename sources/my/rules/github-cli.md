# GitHub CLI Usage

General rules for any GitHub interaction. Apply to every PR, issue, review, or repository action — not just one skill.

## 1. Use the `gh` CLI

Always use the `gh` CLI for GitHub interactions (PRs, issues, reviews, repository metadata). Do not scrape `github.com` or hand-construct API calls when `gh` covers the operation.

## 2. Prefer Structured Output

Use `--json` whenever the data needs parsing. Never rely on raw text output if structured data is available.

## 3. Remote Safety Check

Before any push or pull operation:
* Verify a remote exists with `git remote -v`.
* If missing, stop and inform the user.

## 4. Mandatory Approval Before Mutations (CRITICAL)

Treat GitHub as a **write-protected system**. Never perform any of the following without **explicit user approval**:
* Submit PR reviews.
* Add comments on PRs or issues.
* Create or edit issues.
* Merge, close, or reopen PRs/issues.
* Any other action that posts content to GitHub.

Approval phrases include: "Post it", "Submit", "Send", "Approved, go ahead". Anything ambiguous is not approval — ask.

## 5. Allowed Without Approval (Read-only)

You MAY, without asking:
* Read PRs, issues, and repository data.
* List metadata (`gh pr list`, `gh issue list`, etc.).
* Fetch and analyze diffs.
* Generate drafts locally in the conversation.

## Mental Model

Be explicit when you are in "draft mode" versus "ready to submit". The default is draft mode; submission is the exception that requires the user to unlock it for that specific action.

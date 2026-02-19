#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const REPO_OWNER = "zainfathoni";
const REPO_NAME = "ai-promo";
const PROMOS_FILE = join(process.cwd(), "src/data/promos.ts");

function gh(command: string): string {
  try {
    return execSync(command, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (error: unknown) {
    const err = error as { stderr?: string };
    throw new Error(err.stderr || String(error));
  }
}

function getSubmissionIssues(): Array<{ number: number; body: string; title: string; user: string }> {
  const query = `repo:${REPO_OWNER}/${REPO_NAME} is:issue is:open label:promo label:submission`;
  const output = gh(`gh search issues --limit 100 --json number,body,title,author '${query}'`);
  const issues = JSON.parse(output);
  return issues.map((issue: { number: number; body: string; title: string; author: { login: string } }) => ({
    number: issue.number,
    body: issue.body,
    title: issue.title.replace(/^\[Promo\]:\s*/i, ""),
    user: issue.author?.login || "unknown",
  }));
}

function parseIssueBody(body: string): {
  title: string;
  description: string;
  category: string;
  url: string;
  expiry: string;
  status: string;
  notes: string;
} | null {
  const patterns = {
    title: /<!-- prop:title -->([\s\S]*?)<!-- \/prop:title -->/i,
    description: /<!-- prop:description -->([\s\S]*?)<!-- \/prop:description -->/i,
    category: /<!-- prop:category -->([\s\S]*?)<!-- \/prop:category -->/i,
    url: /<!-- prop:url -->([\s\S]*?)<!-- \/prop:url -->/i,
    expiry: /<!-- prop:expiry -->([\s\S]*?)<!-- \/prop:expiry -->/i,
    status: /<!-- prop:status -->([\s\S]*?)<!-- \/prop:status -->/i,
    notes: /<!-- prop:notes -->([\s\S]*?)<!-- \/prop:notes -->/i,
  };

  const extract = (key: keyof typeof patterns) => {
    const match = body.match(patterns[key]);
    return match ? match[1].trim() : "";
  };

  const title = extract("title");
  if (!title) return null;

  return {
    title,
    description: extract("description"),
    category: extract("category"),
    url: extract("url"),
    expiry: extract("expiry"),
    status: extract("status"),
    notes: extract("notes"),
  };
}

function generateId(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return `${hostname}${pathname}`;
  } catch {
    return url;
  }
}

function checkDuplicateUrl(url: string): boolean {
  const promosContent = readFileSync(PROMOS_FILE, "utf-8");
  const normalizedInputUrl = normalizeUrl(url);
  const urlRegex = /url:\s*"([^"]+)"/g;
  let match;
  while ((match = urlRegex.exec(promosContent)) !== null) {
    if (normalizeUrl(match[1]) === normalizedInputUrl) {
      return true;
    }
  }
  return false;
}

function checkFuzzyTitleMatch(title: string, threshold = 0.9): string | null {
  const promosContent = readFileSync(PROMOS_FILE, "utf-8");
  const titleRegex = /title:\s*"([^"]+)"/g;
  let match;
  const normalizeTitle = (t: string) =>
    t
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const tokenize = (t: string) => {
    const normalized = normalizeTitle(t);
    return normalized.length === 0 ? [] : normalized.split(" ");
  };

  const similarity = (left: string, right: string) => {
    const leftTokens = new Set(tokenize(left));
    const rightTokens = new Set(tokenize(right));
    if (leftTokens.size === 0 && rightTokens.size === 0) return 1;
    let intersection = 0;
    for (const token of leftTokens) {
      if (rightTokens.has(token)) intersection += 1;
    }
    return (2 * intersection) / (leftTokens.size + rightTokens.size);
  };

  while ((match = titleRegex.exec(promosContent)) !== null) {
    const existingTitle = match[1];
    if (similarity(title, existingTitle) >= threshold) {
      return existingTitle;
    }
  }
  return null;
}

function getPromoEntry(
  data: NonNullable<ReturnType<typeof parseIssueBody>>,
  user: string,
): string {
  const id = generateId(data.title);
  const today = new Date().toISOString().split("T")[0];
  const category = data.category || "Developer Tools";
  const expiryDate = data.status === "Active" || !data.expiry ? "Ongoing" : data.expiry;

  return `  {
    id: "${id}",
    title: "${data.title}",
    description: "${data.description.replace(/"/g, '\\"')}",
    category: "${category}",
    tags: [],
    url: "${data.url}",
    expiryDate: "${expiryDate}",
    addedDate: "${today}",
    source: "Community submission",
    sourceUrl: "https://github.com/${REPO_OWNER}/${REPO_NAME}/issues",
    submittedBy: "${user}",
  }`;
}

async function createPrForIssue(
  issueNumber: number,
  issueBody: string,
  user: string,
): Promise<void> {
  const parsed = parseIssueBody(issueBody);
  if (!parsed) {
    console.log(`Issue #${issueNumber}: Could not parse body, skipping`);
    return;
  }

  if (!parsed) {
    console.log(`Issue #${issueNumber}: Could not parse body, skipping`);
    return;
  }

  if (checkDuplicateUrl(parsed.url)) {
    console.log(`Issue #${issueNumber}: Duplicate URL detected, skipping`);
    gh(`gh issue comment ${issueNumber} --body "This submission has a duplicate URL and was skipped."`);
    return;
  }

  const similarTitle = checkFuzzyTitleMatch(parsed.title);
  if (similarTitle) {
    console.log(`Issue #${issueNumber}: Similar title detected: "${similarTitle}", skipping`);
    gh(`gh issue comment ${issueNumber} --body "This submission has a similar title to an existing promo and was skipped."`);
    return;
  }

  const promoEntry = getPromoEntry(parsed, user);
  const branchName = `promo/${generateId(parsed.title)}`;

  console.log(`Issue #${issueNumber}: Creating PR for "${parsed.title}"`);

  // Reset to main before creating new branch to avoid stacking changes
  gh(`git checkout main`);
  gh(`git checkout -b ${branchName} 2>/dev/null || git checkout ${branchName}`);

  const promosContent = readFileSync(PROMOS_FILE, "utf-8");
  const insertPosition = promosContent.indexOf("export const promoEntries: PromoEntry[] = [");
  if (insertPosition === -1) {
    throw new Error("Could not find promoEntries array");
  }

  const closingBracePosition = promosContent.indexOf("];", insertPosition);
  const newContent =
    promosContent.slice(0, closingBracePosition) +
    ",\n" +
    promoEntry +
    "\n" +
    promosContent.slice(closingBracePosition);

  writeFileSync(PROMOS_FILE, newContent);

  gh(`git add ${PROMOS_FILE}`);
  gh(`git commit -m "feat: add promo - ${parsed.title.replace(/"/g, '\\"')}"`);

  try {
    gh(`git push -u origin ${branchName} --force`);
  } catch {
    gh(`git push origin ${branchName} --force`);
  }

  const prBody = `## Summary
- Added promo: ${parsed.title}
- Submitted by: @${user}
- Original issue: #${issueNumber}

This PR was auto-generated by the promo curation workflow.`;

  const prOutput = gh(
    `gh pr create --title "feat: add promo - ${parsed.title}" --body "${prBody.replace(/"/g, '\\"')}" --label "promo-curation"`,
  );
  const prUrl = prOutput;

  gh(`gh issue comment ${issueNumber} --body "Your promo has been submitted! PR created: ${prUrl}"`);
  gh(`gh issue close ${issueNumber} --comment "Promo submitted via PR: ${prUrl}"`);

  console.log(`Issue #${issueNumber}: Done! PR: ${prUrl}`);
}

async function main(): Promise<void> {
  console.log("Fetching submission issues...");
  const issues = getSubmissionIssues();

  if (issues.length === 0) {
    console.log("No new submissions found.");
    return;
  }

  console.log(`Found ${issues.length} submission(s).`);

  for (const issue of issues) {
    try {
      await createPrForIssue(issue.number, issue.body, issue.user);
    } catch (error) {
      console.error(`Error processing issue #${issue.number}:`, error);
    }
  }
}

main();

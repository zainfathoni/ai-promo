#!/usr/bin/env node

import { execFileSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { promoCategoryOptions, type PromoCategory } from "../data/promos";

const PROMOS_FILE = join(process.cwd(), "src/data/promos.ts");

function runCommand(command: string, args: string[]): string {
  try {
    return execFileSync(command, args, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (error: unknown) {
    const err = error as { stderr?: Buffer | string };
    const stderr = err.stderr
      ? typeof err.stderr === "string"
        ? err.stderr
        : err.stderr.toString("utf-8")
      : "";
    throw new Error(stderr || String(error));
  }
}

const gh = (args: string[]) => runCommand("gh", args);
const git = (args: string[]) => runCommand("git", args);

function getRepoInfo(): { owner: string; name: string } {
  const envRepo = process.env.GITHUB_REPOSITORY;
  if (envRepo) {
    const [owner, name] = envRepo.split("/");
    if (owner && name) {
      return { owner, name };
    }
  }

  const repo = gh([
    "repo",
    "view",
    "--json",
    "owner,name",
    "--jq",
    ".owner.login + '/' + .name",
  ]);
  const [owner, name] = repo.split("/");
  if (!owner || !name) {
    throw new Error("Unable to determine repository owner/name.");
  }
  return { owner, name };
}

const { owner: REPO_OWNER, name: REPO_NAME } = getRepoInfo();

function getSubmissionIssues(): Array<{ number: number; body: string; title: string; user: string }> {
  const output = gh([
    "search", "issues",
    "--repo", `${REPO_OWNER}/${REPO_NAME}`,
    "--label", "promo",
    "--label", "submission",
    "--state", "open",
    "--limit", "100",
    "--json", "number,body,title,author",
  ]);
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
  const escapeHeading = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const extract = (heading: string) => {
    const pattern = new RegExp(
      `(?:^|\\n)###\\s+${escapeHeading(heading)}\\s*\\n([\\s\\S]*?)(?=\\n###\\s+|$)`,
      "i",
    );
    const match = body.match(pattern);
    return match ? match[1].trim() : "";
  };

  const title = extract("Promo title");
  if (!title) return null;

  return {
    title,
    description: extract("Description"),
    category: extract("Category"),
    url: extract("URL"),
    expiry: extract("Expiry date"),
    status: extract("Status"),
    notes: extract("Additional notes"),
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
  const normalizedCategory = promoCategoryOptions.find(
    (option) => option.toLowerCase() === data.category.trim().toLowerCase(),
  );
  const category: PromoCategory = normalizedCategory ?? "Developer Tools";
  const expiryDate = data.expiry ? data.expiry : "Ongoing";
  const stringify = (value: string) => JSON.stringify(value);

  return `  {
    id: ${stringify(id)},
    title: ${stringify(data.title)},
    description: ${stringify(data.description)},
    category: ${stringify(category)},
    tags: [],
    url: ${stringify(data.url)},
    expiryDate: ${stringify(expiryDate)},
    addedDate: ${stringify(today)},
    source: "Community submission",
    sourceUrl: "https://github.com/${REPO_OWNER}/${REPO_NAME}/issues",
    submittedBy: ${stringify(user)},
  },`;
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

  if (checkDuplicateUrl(parsed.url)) {
    console.log(`Issue #${issueNumber}: Duplicate URL detected, skipping`);
    gh(["issue", "comment", String(issueNumber), "--body", "This submission has a duplicate URL and was skipped."]);
    return;
  }

  const similarTitle = checkFuzzyTitleMatch(parsed.title);
  if (similarTitle) {
    console.log(`Issue #${issueNumber}: Similar title detected: "${similarTitle}", skipping`);
    gh([
      "issue",
      "comment",
      String(issueNumber),
      "--body",
      "This submission has a similar title to an existing promo and was skipped.",
    ]);
    return;
  }

  const promoEntry = getPromoEntry(parsed, user);
  const branchName = `promo/${generateId(parsed.title)}`;

  console.log(`Issue #${issueNumber}: Creating PR for "${parsed.title}"`);

  // Reset to main before creating new branch to avoid stacking changes
  git(["checkout", "main"]);
  git(["fetch", "origin", "main"]);
  git(["reset", "--hard", "origin/main"]);
  git(["checkout", "-B", branchName]);

  const promosContent = readFileSync(PROMOS_FILE, "utf-8");
  const insertPosition = promosContent.indexOf("export const promoEntries: PromoEntry[] = [");
  if (insertPosition === -1) {
    throw new Error("Could not find promoEntries array");
  }

  const closingBracePosition = promosContent.indexOf("];", insertPosition);
  const newContent =
    promosContent.slice(0, closingBracePosition).trimEnd() +
    "\n" +
    promoEntry +
    "\n" +
    promosContent.slice(closingBracePosition);

  writeFileSync(PROMOS_FILE, newContent);

  git(["add", PROMOS_FILE]);
  git(["commit", "-m", `feat: add promo - ${parsed.title}`]);

  try {
    git(["push", "-u", "origin", branchName, "--force"]);
  } catch {
    git(["push", "origin", branchName, "--force"]);
  }

  const prBody = `## Summary
- Added promo: ${parsed.title}
- Submitted by: @${user}
- Original issue: #${issueNumber}

This PR was auto-generated by the promo curation workflow.`;

  const prOutput = gh([
    "pr",
    "create",
    "--title",
    `feat: add promo - ${parsed.title}`,
    "--body",
    prBody,
    "--label",
    "promo-curation",
  ]);
  const prUrl = prOutput;

  gh([
    "issue",
    "comment",
    String(issueNumber),
    "--body",
    `Your promo has been submitted! PR created: ${prUrl}`,
  ]);
  gh([
    "issue",
    "close",
    String(issueNumber),
    "--comment",
    `Promo submitted via PR: ${prUrl}`,
  ]);

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

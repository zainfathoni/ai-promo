import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);

const repo = process.env.GITHUB_REPOSITORY;
const runId = process.env.GITHUB_RUN_ID;

if (!repo) {
  console.error("Missing GITHUB_REPOSITORY environment variable.");
  process.exit(1);
}

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("Missing GITHUB_TOKEN environment variable.");
  process.exit(1);
}

const { stdout } = await execFileAsync(
  "npx",
  ["tsx", "src/scripts/check-expired-promos.mts", "--json"],
  { maxBuffer: 1024 * 1024 },
);

let expiredPromos;
try {
  expiredPromos = JSON.parse(stdout);
} catch (error) {
  console.error("Failed to parse expired promo JSON output.");
  console.error(stdout);
  throw error;
}

if (!Array.isArray(expiredPromos) || expiredPromos.length === 0) {
  console.log("No expired promos to report.");
  process.exit(0);
}

const issueTitle = `Expired promo entries detected (${new Date()
  .toISOString()
  .slice(0, 10)})`;

const formatPromo = (promo) =>
  `- ${promo.title} (${promo.id}) expired on ${promo.expiryDate} -> ${promo.url}`;

const promoLines = expiredPromos.map(formatPromo).join("\n");
const runLink = runId
  ? `\n\nWorkflow run: https://github.com/${repo}/actions/runs/${runId}`
  : "";

const issueBody = `The following promo entries appear to be past their expiry date:\n\n${promoLines}${runLink}`;

const createIssueResponse = await fetch(
  `https://api.github.com/repos/${repo}/issues`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      title: issueTitle,
      body: issueBody,
      labels: ["maintenance"],
    }),
  },
);

if (!createIssueResponse.ok) {
  const errorText = await createIssueResponse.text();
  console.error(
    `Failed to create GitHub issue: ${createIssueResponse.status} ${createIssueResponse.statusText}`,
  );
  console.error(errorText);
  process.exit(1);
}

const issueData = await createIssueResponse.json();
console.log(`Opened issue: ${issueData.html_url}`);
